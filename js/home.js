/* WITHYBED — home: the entrance reveal and the fleet carousel. */
(function () {
  'use strict';

  /* SplitType was tried and dropped: the spans it creates carry style attributes, which a strict
     style-src 'self' blocks. Splitting into words is twelve lines. */
  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    return words.map(function (w, k) {
      var s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      el.appendChild(s);
      if (k < words.length - 1) el.appendChild(document.createTextNode(' '));
      return s;
    });
  }

  /* ---- one entrance reveal: the headline arrives word by word over the photograph ---- */
  var heavy = document.querySelector('.hero .h1-heavy');
  if (heavy) {
    if (window.WBmotion && window.gsap) {
      var words = splitWords(heavy);
      heavy.classList.add('is-split');
      var g = window.gsap;
      g.set('.hero__copy .h1-ghost, .hero__copy .hero__small, .hero__copy .hero__cta', { opacity: 0, y: 14 });
      g.from(words, { yPercent: 70, opacity: 0, duration: 1.25, ease: 'power3.out', stagger: 0.09, delay: 0.25 });
      g.to('.hero__copy .h1-ghost, .hero__copy .hero__small, .hero__copy .hero__cta', { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', stagger: 0.18, delay: 0.1 });
      g.from('.hero__media', { scale: 1.07, duration: 2.8, ease: 'power2.out' });
    } else {
      heavy.classList.add('is-split');
      document.documentElement.classList.remove('motion');
    }
  }

  /* ---- the carousel: the centre card is raised and carries the accent ---- */
  var root = document.querySelector('[data-carousel]');
  if (!root) return;
  var view = root.querySelector('.carousel__view');
  var track = root.querySelector('[data-track]');
  var cards = [].slice.call(track.children);
  var countEl = root.querySelector('[data-count]');
  var live = root.querySelector('[data-live]');
  var prev = root.querySelector('[data-prev]');
  var next = root.querySelector('[data-next]');
  var n = cards.length;
  var i = Math.min(n - 1, Math.max(0, parseInt(root.getAttribute('data-start'), 10) || 0));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) track.style.transition = 'none';

  function layout() {
    var c = cards[i];
    var off = view.clientWidth / 2 - (c.offsetLeft + c.offsetWidth / 2);
    track.style.transform = 'translateX(' + Math.round(off) + 'px)';
  }
  function name(card) { return card.querySelector('.cc__name').textContent; }
  function render(announce) {
    cards.forEach(function (c, k) {
      var d = Math.abs(k - i);
      c.classList.toggle('is-active', d === 0);
      c.classList.toggle('is-near', d === 1);
      var link = c.querySelector('.cc__go');
      if (link) link.setAttribute('tabindex', d === 0 ? '0' : '-1');
      if (d === 0) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current');
    });
    countEl.textContent = (i + 1) + ' / ' + n;
    prev.disabled = i === 0;
    next.disabled = i === n - 1;
    layout();
    if (announce) live.textContent = name(cards[i]) + ', ' + (i + 1) + ' of ' + n;
  }
  function go(k, announce) { i = Math.min(n - 1, Math.max(0, k)); render(announce !== false); }

  prev.addEventListener('click', function () { go(i - 1); });
  next.addEventListener('click', function () { go(i + 1); });
  cards.forEach(function (c, k) {
    c.addEventListener('click', function (e) {
      if (k !== i) { e.preventDefault(); go(k); }
    });
  });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(n - 1); }
  });

  // swipe: a horizontal drag moves one card; vertical scrolling is left alone
  var sx = null, sy = null;
  view.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; });
  view.addEventListener('pointerup', function (e) {
    if (sx === null) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    sx = sy = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) go(i + (dx < 0 ? 1 : -1));
  });
  view.addEventListener('pointercancel', function () { sx = sy = null; });

  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
  window.addEventListener('load', layout);
  render(false);
})();
