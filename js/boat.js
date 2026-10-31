/* WITHYBED — one boat, drawn from data/fleet.json. The address is boat?b=<id>. */
(function () {
  'use strict';
  var root = document.querySelector('[data-boat-root]');
  if (!root) return;
  var WB = window.WB;
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var id = new URLSearchParams(location.search).get('b');

  function get(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }

  Promise.all([get('data/fleet.json'), get('data/routes.json'), get('data/site.json')]).then(function (d) {
    var fleet = d[0], routes = d[1], site = d[2];
    var i = -1;
    fleet.forEach(function (b, k) { if (b.id === id) i = k; });
    if (i < 0) {
      root.innerHTML = '<div class="bd__in"><div><h1><span class="h1-heavy">Which boat?</span></h1><p>There is no boat with that name. Pick one:</p><ul class="chips">' +
        fleet.map(function (b) { return '<li><a href="boat?b=' + b.id + '">' + esc(b.name) + '<span>' + b.berths + ' berths · ' + b.lengthFt + ' ft</span></a></li>'; }).join('') + '</ul></div></div>';
      document.title = 'Choose a boat · Withybed Narrowboats';
      return;
    }
    var b = fleet[i];
    var prev = fleet[(i + fleet.length - 1) % fleet.length], next = fleet[(i + 1) % fleet.length];
    var suited = routes.filter(function (r) { return b.suitedRoutes.indexOf(r.id) > -1; });
    var P = function (t, s) { return WB.money(b.price[t][s]); };
    document.title = b.name + ' · ' + b.berths + '-berth narrowboat · Withybed Narrowboats';
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', b.name + ': ' + b.berths + ' berths, ' + b.lengthFt + ' ft, from ' + P('week', 'low') + ' a week. ' + b.blurb.split('. ')[0] + '.');

    root.innerHTML =
      '<div class="bd__in">' +
        '<figure class="bd__photo"><img src="' + esc(b.src) + '" srcset="' + esc(b.srcset) + '" sizes="(min-width: 1000px) 52vw, 100vw" width="' + b.w + '" height="' + b.h + '" alt="' + esc(b.alt) + '" fetchpriority="high" decoding="async"></figure>' +
        '<div class="bd__text">' +
          '<h1>' + b.berths + '-berth narrowboat <span class="h1-heavy">' + esc(b.name) + '</span></h1>' +
          '<ul class="livery" aria-label="Livery colours">' + b.livery.map(function (x) { return '<li><span class="sw" data-sw="' + x.slice(1) + '"></span></li>'; }).join('') + '</ul>' +
          '<p>' + esc(b.blurb) + '</p>' +
          '<dl class="stats"><div><dt>Berths</dt><dd>' + b.berths + '</dd></div><div><dt>Length</dt><dd>' + b.lengthFt + ' ft</dd></div><div><dt>Deposit</dt><dd>' + WB.money(b.deposit) + '</dd></div><div><dt>Dogs</dt><dd>' + (b.dogFriendly ? 'Welcome' : 'No') + '</dd></div></dl>' +
          '<ul class="bd__feat"><li>Cabins: ' + esc(b.cabins) + '</li>' + b.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
          '<table class="ptable"><caption class="sr-only">Hire prices for ' + esc(b.name) + '</caption><thead><tr><th scope="col">Hire</th><th scope="col">Low season</th><th scope="col">High season</th></tr></thead><tbody>' +
            '<tr><th scope="row">Week, 7 nights</th><td>' + P('week', 'low') + '</td><td>' + P('week', 'high') + '</td></tr>' +
            '<tr><th scope="row">Midweek, 4 nights</th><td>' + P('midweek', 'low') + '</td><td>' + P('midweek', 'high') + '</td></tr>' +
            '<tr><th scope="row">Weekend, 3 nights</th><td>' + P('weekend', 'low') + '</td><td>' + P('weekend', 'high') + '</td></tr>' +
          '</tbody></table>' +
          '<p class="hint">Refundable damage deposit ' + WB.money(b.deposit) + ', taken at handover. High season is any hire with a night between ' + WB.fmtDate(site.seasons.highFrom, { noWeekday: true }) + ' and ' + WB.fmtDate(site.seasons.highTo, { noWeekday: true }) + '.</p>' +
          '<p class="boat__act"><a class="btn" href="plan?boat=' + b.id + '">Price ' + esc(b.name) + '</a> <a class="lnk" href="boats">All boats</a></p>' +
          '<div class="bd__routes"><h2 class="rp__h">Routes she can do</h2><ul class="chips">' +
            suited.map(function (r) { return '<li><a href="routes?route=' + r.id + '">' + esc(r.name) + '<span>' + site.durations[r.type].label + ' · ' + r.miles + ' miles · ' + r.locks + ' locks</span></a></li>'; }).join('') +
          '</ul>' + (b.lengthFt > 60 ? '<p class="hint">At ' + b.lengthFt + ' ft she is too long to turn at Twyford Wharf, so the shorter northern routes are not hers.</p>' : '') + '</div>' +
          '<nav class="boat__act" aria-label="Other boats"><a class="lnk" href="boat?b=' + prev.id + '"><span aria-hidden="true">←&nbsp;</span>' + esc(prev.name) + '</a> <a class="lnk" href="boat?b=' + next.id + '">' + esc(next.name) + '<span aria-hidden="true">&nbsp;→</span></a></nav>' +
        '</div>' +
      '</div>';
    root.querySelector('.bd__photo').classList.add('rv', 'in');
  }).catch(function () {
    root.innerHTML = '<p class="bd__load">The boat data did not load. The <a href="boats">boats page</a> has every boat and every price.</p>';
  });
})();
