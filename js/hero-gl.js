/* WITHYBED — the signature effect: light moving on the canal water.
   One raw WebGL2 fragment shader draws the hero photograph and adds a slow,
   tileable caustic and a faint ripple, only where the photograph is water
   (lower left, below the arch). The boats, the brickwork and the trees are
   never displaced. The <img> underneath is the fallback and the LCP element:
   if WebGL2 is missing, the context is lost, or the visitor prefers reduced
   motion, nothing changes. */
(function () {
  'use strict';
  var canvas = document.querySelector('.hero__gl');
  var img = document.querySelector('.hero__img');
  if (!canvas || !img) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var VERT = '#version 300 es\nin vec2 p;out vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  var FRAG = [
    '#version 300 es',
    'precision highp float;',
    'uniform sampler2D uTex;uniform vec2 uOff;uniform vec2 uVis;uniform float uT;',
    'in vec2 v;out vec4 o;',
    // tileable water caustic (after the classic Shadertoy tile by Dave Hoskins, itself after Joltz0r)
    'float caustic(vec2 uv,float t){',
    '  vec2 p=mod(uv*6.28318,6.28318)-250.;vec2 i=p;float c=1.;float inten=.006;',
    '  for(int n=0;n<4;n++){float tt=t*(1.-(3.5/float(n+1)));',
    '    i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));',
    '    c+=1./length(vec2(p.x/(sin(i.x+tt)/inten),p.y/(cos(i.y+tt)/inten)));}',
    '  c/=4.;c=1.17-pow(c,1.4);return pow(abs(c),8.);}',
    'void main(){',
    '  vec2 uv=uOff+vec2(v.x,1.-v.y)*uVis;',
    '  float water=smoothstep(.56,.74,uv.y)*(1.-smoothstep(.34,.6,uv.x));',
    '  float t=uT;',
    '  vec2 d=vec2(sin(uv.y*70.+t*1.3)+sin(uv.y*29.-t*.9),cos(uv.x*58.+t*1.1))*.0011*water;',
    '  vec3 base=texture(uTex,uv+d).rgb;',
    '  float lum=dot(base,vec3(.299,.587,.114));',
    // the caustic divides by sines that can reach zero: compute it only over water, and never let a NaN reach the screen
    '  float c=0.;',
    '  if(water>.002){c=caustic(uv*vec2(5.,3.2),t*.35)*.55+caustic(uv*vec2(9.,5.5)+3.1,t*.5)*.45;if(!(c==c))c=0.;c=clamp(c,0.,1.6);}',
    '  vec3 tint=mix(vec3(.80,.93,.88),vec3(.86,.70,.38),.28);',
    '  vec3 col=base+tint*c*water*(.05+.16*smoothstep(.12,.5,lum));',
    '  col*=1.+.025*sin(t*.45)*water;',
    '  o=vec4(col,1.);}'
  ].join('\n');

  var gl, prog, tex, loc = {}, live = false, running = false, raf = 0, loadedSrc = '', lost = false, lastDraw = 0;
  var MAXDPR = window.matchMedia('(max-width: 1000px)').matches ? 1 : 1.5;
  var t0 = performance.now();

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  function init() {
    gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'low-power' });
    if (!gl) return false;
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var a = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    ['uTex', 'uOff', 'uVis', 'uT'].forEach(function (n) { loc[n] = gl.getUniformLocation(prog, n); });
    tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    loadedSrc = '';
    return uploadTexture();
  }

  function uploadTexture() {
    if (!img.complete || !img.naturalWidth) return false;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    loadedSrc = img.currentSrc;
    return true;
  }

  // the same arithmetic as object-fit: cover with the object-position the stylesheet gives the image
  function fit() {
    // a phone gets a smaller canvas, stretched by the browser: the caustic is soft light, not detail
    var dpr = Math.min(window.devicePixelRatio || 1, MAXDPR) * (window.innerWidth < 1000 ? 0.65 : 1);
    var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    var ca = w / h, ia = img.naturalWidth / img.naturalHeight;
    var fx = 1, fy = 1;
    if (ca > ia) fy = ia / ca; else fx = ca / ia;
    var pos = getComputedStyle(img).objectPosition.split(' ').map(function (s) { return parseFloat(s) / 100; });
    var px = isNaN(pos[0]) ? 0.5 : pos[0], py = isNaN(pos[1]) ? 0.5 : pos[1];
    gl.uniform2f(loc.uVis, fx, fy);
    gl.uniform2f(loc.uOff, (1 - fx) * px, (1 - fy) * py);
  }

  function frame(now) {
    raf = 0;
    if (!running || lost) return;
    if (now - lastDraw < 32) { raf = requestAnimationFrame(frame); return; } // 30 frames a second is plenty for slow light
    lastDraw = now;
    if (img.currentSrc !== loadedSrc && !uploadTexture()) { raf = requestAnimationFrame(frame); return; }
    fit();
    gl.uniform1f(loc.uT, (now - t0) / 1000);
    gl.uniform1i(loc.uTex, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!live) { live = true; canvas.classList.add('is-live'); }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!running && !lost && gl) { running = true; if (!raf) raf = requestAnimationFrame(frame); } }
  function stop() { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  canvas.addEventListener('webglcontextlost', function (e) {
    e.preventDefault(); lost = true; live = false; stop(); canvas.classList.remove('is-live');
  });
  canvas.addEventListener('webglcontextrestored', function () {
    lost = false;
    try { if (init()) { visible && start(); } } catch (err) { /* leave the photograph */ }
  });

  var visible = true;
  function boot() {
    try { if (!init()) return; } catch (err) { return; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }, { threshold: 0 }).observe(canvas);
    } else { start(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (visible) start(); });
    start();
  }
  // start only after the page has loaded and gone quiet, so the effect never competes with the first paint
  function later() { (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(function () { if (img.complete && img.naturalWidth) boot(); else img.addEventListener('load', boot, { once: true }); }, { timeout: 2500 }); }
  if (document.readyState === 'complete') setTimeout(later, 600); else window.addEventListener('load', function () { setTimeout(later, 600); }, { once: true });
})();
