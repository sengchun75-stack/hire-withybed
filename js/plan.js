/* WITHYBED — the price calculator and the enquiry. Everything is worked out in
   the browser from data/site.json and data/fleet.json, with the same
   calc-core.js the build used to bake the first price into the page. The
   enquiry builds a mailto: link; nothing is sent anywhere by this site. */
(function () {
  'use strict';
  var WB = window.WB;
  var form = document.querySelector('[data-calc]');
  var enq = document.querySelector('[data-enquiry]');
  if (!form || !WB) return;
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var outTable = document.querySelector('[data-out] tbody');
  var live = document.querySelector('[data-out-live]');
  var errs = document.querySelector('[data-errs]');
  var summary = document.querySelector('[data-summary]');
  var status = document.querySelector('[data-status]');
  var startHint = document.querySelector('[data-start-hint]');
  var crewHint = document.querySelector('[data-crew-hint]');
  var site, fleet, routes, last = null;

  function get(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }
  var f = function (n) { return form.elements[n]; };

  function input() {
    return {
      boat: f('boat').value, type: form.querySelector('input[name="type"]:checked').value, start: f('start').value,
      crew: f('crew').value, linen: f('linen').checked, dogs: f('dogs').disabled ? 0 : f('dogs').value,
      hamper: f('hamper').checked, bikes: f('bikes').value
    };
  }

  function fillStarts(keep) {
    var type = form.querySelector('input[name="type"]:checked').value;
    var opts = WB.startOptions(site, type);
    var pick = opts[0].value;
    if (keep) for (var i = 0; i < opts.length; i++) if (opts[i].value >= keep) { pick = opts[i].value; break; }
    f('start').innerHTML = opts.map(function (o) {
      return '<option value="' + o.value + '"' + (o.value === pick ? ' selected' : '') + '>' + WB.fmtDate(o.value) + ' · ' + o.season + ' season</option>';
    }).join('');
    var d = site.durations[type];
    startHint.textContent = d.label + 's start on a ' + d.startName + ' at ' + site.handover + ' and finish by ' + site.returnBy + ' on the ' + (d.nights === 7 ? 'next ' : 'last ') + (d.nights === 3 ? 'Monday' : 'Friday') + '.';
  }

  function boatRules() {
    var b = WB.findBoat(fleet, f('boat').value);
    f('crew').max = b.berths;
    if (Number(f('crew').value) > b.berths) f('crew').value = b.berths;
    crewHint.textContent = b.name + ' sleeps ' + b.berths + '.';
    f('dogs').disabled = !b.dogFriendly;
    if (!b.dogFriendly) { f('dogs').value = '0'; }
  }

  function render() {
    var q = WB.quote(site, fleet, input());
    last = q;
    if (!q.ok) {
      errs.hidden = false;
      errs.innerHTML = q.errors.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') +
        (q.suggest ? '<li><button type="button" data-use="' + q.suggest + '">Use ' + WB.fmtDate(q.suggest) + '</button></li>' : '');
    } else {
      errs.hidden = true; errs.innerHTML = '';
    }
    if (q.start && q.lines) {
      outTable.innerHTML = WB.quoteRows(site, q).map(function (r) { return '<tr class="q-' + r.kind + '"><th scope="row">' + esc(r.label) + '</th><td>' + esc(r.value) + '</td></tr>'; }).join('');
      live.textContent = q.ok ? WB.liveSentence(site, q) : 'The inputs need changing: ' + q.errors.join(' ');
    } else {
      live.textContent = q.errors.join(' ');
    }
    updateSummary();
  }

  function who() {
    var sel = enq ? enq.elements.route : null;
    return enq ? { name: enq.elements.name.value.trim(), email: enq.elements.email.value.trim(), phone: enq.elements.phone.value.trim(), route: sel ? sel.value : '', message: enq.elements.message.value.trim() } : {};
  }
  function updateSummary() {
    if (!summary) return;
    summary.value = last && last.ok ? WB.summaryText(site, last, who()) : 'Fix the points above to see the summary.';
  }

  errs.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-use]');
    if (!b) return;
    f('start').value = b.getAttribute('data-use');
    render();
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  form.addEventListener('change', function (e) {
    if (e.target.name === 'type') fillStarts(f('start').value);
    if (e.target.name === 'boat') boatRules();
    render();
  });
  form.addEventListener('input', function (e) { if (e.target.type === 'number') render(); });

  if (enq) {
    enq.addEventListener('input', updateSummary);
    enq.addEventListener('change', updateSummary);

    enq.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!enq.elements.name.value.trim() || !enq.elements.email.checkValidity() || !enq.elements.email.value.trim()) {
        status.textContent = 'Please add your name and a valid email, so we know where to reply.';
        (enq.elements.name.value.trim() ? enq.elements.email : enq.elements.name).focus();
        return;
      }
      if (!last || !last.ok) { status.textContent = 'The price above needs fixing first.'; return; }
      var body = WB.summaryText(site, last, who());
      var url = function (b) { return 'mailto:' + site.email + '?subject=' + encodeURIComponent('Enquiry: ' + last.boat.name + ', ' + WB.fmtDate(last.start, { noWeekday: true })) + '&body=' + encodeURIComponent(b); };
      var trimmed = false;
      // very long mailto links are refused by some mail programs: keep it short and put the full text on the clipboard
      if (url(body).length > 1900) {
        trimmed = true;
        copy(body);
        body = WB.summaryText(site, last, { name: who().name, email: who().email, phone: who().phone, route: who().route }) + '\n\n[The rest of the message is on your clipboard: paste it here.]';
      }
      status.textContent = 'Opening your email program' + (trimmed ? ' (the full text is on your clipboard)' : '') + '. If nothing opens, use Copy the summary and send it to ' + site.email + '.';
      enq.dispatchEvent(new CustomEvent('wb:mailto', { detail: url(body) }));
      window.location.href = url(body);
    });

    enq.querySelector('[data-copy]').addEventListener('click', function () {
      copy(summary.value).then(function (ok) {
        status.textContent = ok ? 'Copied. Paste it into an email to ' + site.email + '.' : 'Copying was blocked: select the summary and copy it by hand.';
      });
    });
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    try {
      var t = document.createElement('textarea');
      t.value = text; t.setAttribute('readonly', ''); t.className = 'sr-only';
      document.body.appendChild(t); t.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(t);
      return ok;
    } catch (err) { return false; }
  }

  Promise.all([get('data/site.json'), get('data/fleet.json'), get('data/routes.json')]).then(function (d) {
    site = d[0]; fleet = d[1]; routes = d[2];
    var p = new URLSearchParams(location.search);
    if (p.get('boat') && WB.findBoat(fleet, p.get('boat'))) f('boat').value = p.get('boat');
    var rid = p.get('route');
    if (rid) {
      routes.forEach(function (r) {
        if (r.id !== rid) return;
        var radio = form.querySelector('input[name="type"][value="' + r.type + '"]');
        if (radio) radio.checked = true;
        if (enq) { var o = enq.querySelector('#e-route option[data-id="' + r.id + '"]'); if (o) enq.elements.route.value = o.value; }
        // a boat too long for the route is swapped for the longest one that fits
        var b = WB.findBoat(fleet, f('boat').value);
        if (r.suited.indexOf(b.id) < 0) f('boat').value = r.suited[r.suited.length - 1];
      });
    }
    var keep = f('start').value;
    fillStarts(rid ? null : keep);
    boatRules();
    render();
  }).catch(function () { /* the baked price stays; the form still works as a plain enquiry */ });
})();
