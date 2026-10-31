/* WITHYBED — the gallery: filter chips and a keyboard-operable lightbox
   (a modal <dialog>, so focus is trapped and Escape closes it natively). */
(function () {
  'use strict';
  var grid = document.querySelector('[data-gal]');
  var dlg = document.querySelector('[data-lb]');
  if (!grid || !dlg) return;
  var items = [].slice.call(grid.children);
  var chips = [].slice.call(document.querySelectorAll('[data-galfilters] [data-cat]'));
  var countEl = document.querySelector('[data-galcount]');
  var img = dlg.querySelector('[data-lb-img]');
  var cap = dlg.querySelector('[data-lb-cap]');
  var num = dlg.querySelector('[data-lb-count]');
  var cur = 0, opener = null, shown = items.slice();

  function filter(cat) {
    shown = [];
    items.forEach(function (li) {
      var ok = !cat || li.getAttribute('data-cat') === cat;
      li.hidden = !ok;
      if (ok) shown.push(li);
    });
    chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-cat') === cat ? 'true' : 'false'); });
    countEl.textContent = cat ? 'Showing ' + shown.length + ' of ' + items.length + ' photographs: ' + cat.toLowerCase() : 'Showing all ' + items.length + ' photographs';
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { filter(c.getAttribute('data-cat')); }); });

  function show(k) {
    cur = (k + shown.length) % shown.length;
    var b = shown[cur].querySelector('.gal__item');
    img.src = b.getAttribute('data-full');
    img.alt = b.getAttribute('data-alt');
    cap.textContent = b.getAttribute('data-cap');
    num.textContent = (cur + 1) + ' of ' + shown.length;
    var nx = shown[(cur + 1) % shown.length].querySelector('.gal__item');
    var pre = new Image(); pre.src = nx.getAttribute('data-full');
  }
  function open(btn) {
    opener = btn;
    var li = btn.closest('li');
    show(Math.max(0, shown.indexOf(li)));
    dlg.showModal();
    if (window.WBlenis) window.WBlenis.stop();
    dlg.querySelector('[data-lb-close]').focus();
  }

  grid.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.gal__item');
    if (b) open(b);
  });
  dlg.querySelector('[data-lb-prev]').addEventListener('click', function () { show(cur - 1); });
  dlg.querySelector('[data-lb-next]').addEventListener('click', function () { show(cur + 1); });
  dlg.querySelector('[data-lb-close]').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
  });
  dlg.addEventListener('close', function () {
    if (window.WBlenis) window.WBlenis.start();
    img.removeAttribute('src');
    if (opener) opener.focus();
  });
  filter('');
})();
