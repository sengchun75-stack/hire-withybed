/* WITHYBED — boat filters: berths, dog-friendly, price. The list is already in
   the page; this only hides what does not match, and says how many are left. */
(function () {
  'use strict';
  var form = document.querySelector('[data-filters]');
  var list = document.querySelector('[data-list]');
  if (!form || !list) return;
  var items = [].slice.call(list.children);
  var count = form.querySelector('[data-count]');
  var out = form.querySelector('[data-price-out]');
  var empty = document.querySelector('[data-empty]');
  var range = form.elements.price;
  var maxAll = Number(range.max);

  function money(n) { return '£' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  function apply() {
    var minBerths = Number(form.elements.berths.value || 0);
    var dogOnly = form.elements.dog.checked;
    var cap = Number(range.value);
    out.textContent = money(cap);
    var shown = 0;
    items.forEach(function (li) {
      var ok = Number(li.getAttribute('data-berths')) >= minBerths &&
               (!dogOnly || li.getAttribute('data-dog') === '1') &&
               Number(li.getAttribute('data-price')) <= cap;
      li.hidden = !ok;
      if (ok) shown++;
    });
    var filtered = minBerths > 0 || dogOnly || cap < maxAll;
    count.textContent = !filtered
      ? 'Showing all ' + items.length + ' boats'
      : shown === 0 ? 'No boats match' : 'Showing ' + shown + ' of ' + items.length + ' boats';
    if (empty) empty.hidden = shown !== 0;
  }

  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('reset', function () { window.setTimeout(apply, 0); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  apply();
})();
