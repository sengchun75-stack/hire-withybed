/* WITHYBED — the route explorer. Every route is already in the page; choosing
   one shows its panel, draws its line, and keeps the address (?route=<id>)
   shareable. The radio group is keyboard-operable by the arrow keys. */
(function () {
  'use strict';
  var form = document.querySelector('[data-rlist]');
  var wrap = document.querySelector('[data-rpanels]');
  if (!form || !wrap) return;
  var panels = [].slice.call(wrap.querySelectorAll('.rp'));
  var status = document.createElement('p');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  form.parentNode.appendChild(status);
  var data = null;
  var NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }

  /* One line from the wharf to the furthest stop: dots for the places, a tick for each lock marked. */
  function draw(panel) {
    var box = panel.querySelector('[data-schem]');
    if (!box || box.firstChild || !data) return;
    var r = null;
    data.forEach(function (x) { if (x.id === panel.getAttribute('data-route')) r = x; });
    if (!r) return;
    var W = 1000, H = 130, pad = 52;
    var far = Math.max.apply(null, r.stops.map(function (s) { return s.at; })) || 1;
    var X = function (m) { return pad + (W - 2 * pad) * (m / far); };
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'presentation', focusable: 'false' });
    svg.appendChild(el('path', { d: 'M' + pad + ' 58 H' + (W - pad), class: 's-line' }));
    r.stops.forEach(function (s, k) {
      var x = X(s.at), up = k % 2 === 0;
      if (s.kind === 'lock') svg.appendChild(el('path', { d: 'M' + x + ' 46 V70', class: 's-lock' }));
      svg.appendChild(el('circle', { cx: x, cy: 58, r: s.kind === 'base' ? 7 : 5, class: s.kind === 'base' ? 's-base' : 's-dot' }));
      var anchor = s.at === 0 ? 'start' : (s.at === far ? 'end' : 'middle');
      svg.appendChild(el('text', { x: x, y: up ? 34 : 100, 'text-anchor': anchor }, s.name));
    });
    box.appendChild(svg);
  }

  function show(id, announce) {
    var found = null;
    panels.forEach(function (p) {
      var on = p.getAttribute('data-route') === id;
      p.classList.toggle('is-active', on);
      if (on) found = p;
    });
    if (!found) return;
    draw(found);
    var radio = form.querySelector('input[value="' + id + '"]');
    if (radio) radio.checked = true;
    if (announce) {
      var live = found.querySelector('[data-route-live]');
      status.textContent = live ? live.textContent : '';
      var u = new URL(location.href); u.searchParams.set('route', id); u.hash = '';
      history.replaceState(null, '', u.pathname + u.search);
    }
  }

  form.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'route') show(e.target.value, true);
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  fetch('data/routes.json').then(function (r) { return r.json(); }).then(function (d) {
    data = d;
    var asked = new URLSearchParams(location.search).get('route') || (location.hash.indexOf('#route-') === 0 ? location.hash.slice(7) : '');
    // the address is user-controlled: it is only ever compared with the ids we ship, never used in a selector
    var want = panels.some(function (p) { return p.getAttribute('data-route') === asked; }) ? asked : '';
    var cur = form.querySelector('input:checked');
    show(want || (cur ? cur.value : panels[0].getAttribute('data-route')), false);
    if (want) {
      var ex = document.getElementById('explorer');
      if (ex && window.scrollY < 40) window.setTimeout(function () { ex.scrollIntoView({ block: 'start' }); }, 60);
    }
  }).catch(function () { /* the panels are baked in; only the line is missing */ });
})();
