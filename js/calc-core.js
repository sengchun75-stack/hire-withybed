/* WITHYBED — the pricing rules, once.
   Loaded by the browser as a plain script (window.WB) and by tools/build.mjs
   under Node, so the numbers baked into the HTML and the numbers the
   calculator shows come from the same function. No dates are read from the
   clock; every date is an ISO string treated as UTC. */
(function (root) {
  'use strict';

  var DAY = 86400000;
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var WDL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function parse(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
    if (!m) return NaN;
    return Date.UTC(+m[1], +m[2] - 1, +m[3]);
  }
  function iso(ms) {
    var d = new Date(ms);
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
  }
  function addDays(s, n) { return iso(parse(s) + n * DAY); }
  function weekday(s) { return new Date(parse(s)).getUTCDay(); }
  function fmtDate(s, opts) {
    var d = new Date(parse(s));
    var o = opts || {};
    var out = (o.noWeekday ? '' : WD[d.getUTCDay()] + ' ') + d.getUTCDate() + ' ' + MO[d.getUTCMonth()];
    if (!o.noYear) out += ' ' + d.getUTCFullYear();
    return out;
  }
  function money(n) {
    var s = String(Math.round(n));
    return '£' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many || one + 's'); }

  /* A hire is high season if any of its nights falls inside the high window.
     The night of the end date is not a night: the boat is back by 09:30. */
  function seasonFor(site, start, nights) {
    var hi = site.seasons, i;
    for (i = 0; i < nights; i++) {
      var d = addDays(start, i);
      if (d >= hi.highFrom && d <= hi.highTo) return 'high';
    }
    return 'low';
  }

  function nextValidStart(site, type, from) {
    var want = site.durations[type].startDay;
    var s = from && !isNaN(parse(from)) ? from : site.bookable.first;
    if (s < site.bookable.first) s = site.bookable.first;
    var guard = 0;
    while (weekday(s) !== want && guard++ < 8) s = addDays(s, 1);
    return s;
  }

  function findBoat(fleet, id) {
    for (var i = 0; i < fleet.length; i++) if (fleet[i].id === id) return fleet[i];
    return null;
  }

  function boatPrice(boat, type, season) { return boat.price[type][season]; }

  /* input: { boat, type, start, crew, linen, dogs, hamper, bikes } */
  function quote(site, fleet, input) {
    var errors = [];
    var boat = findBoat(fleet, input.boat);
    var dur = site.durations[input.type];
    if (!boat) errors.push('Choose a boat.');
    if (!dur) errors.push('Choose a type of hire.');
    if (!boat || !dur) return { ok: false, errors: errors };

    var start = input.start;
    var nights = dur.nights;
    var suggest = null;
    if (isNaN(parse(start))) {
      errors.push('Choose a start date.');
      suggest = nextValidStart(site, input.type, null);
    } else {
      if (weekday(start) !== dur.startDay) {
        errors.push(dur.label + 's start on a ' + dur.startName + '; ' + fmtDate(start) + ' is a ' + WDL[weekday(start)] + '.');
        suggest = nextValidStart(site, input.type, start);
      }
      if (start < site.bookable.first || start > site.bookable.last) {
        errors.push('We are taking bookings for starts between ' + fmtDate(site.bookable.first) + ' and ' + fmtDate(site.bookable.last) + '.');
        suggest = suggest || nextValidStart(site, input.type, start < site.bookable.first ? site.bookable.first : site.bookable.last);
      }
    }

    var crew = Math.floor(Number(input.crew));
    if (!(crew >= 1)) errors.push('Crew must be at least one.');
    else if (crew > boat.berths) errors.push(boat.name + ' sleeps ' + boat.berths + '; a crew of ' + crew + ' will not fit.');

    var dogs = Math.max(0, Math.floor(Number(input.dogs) || 0));
    if (dogs > 0 && !boat.dogFriendly) errors.push(boat.name + ' is not a dog-friendly boat.');
    if (dogs > site.extras.dog.max) errors.push('Two dogs at most.');
    var bikes = Math.max(0, Math.floor(Number(input.bikes) || 0));
    if (bikes > site.extras.bike.max) errors.push('Four bicycles at most.');

    var out = { ok: errors.length === 0, errors: errors, suggest: suggest, boat: boat, type: input.type, duration: dur, nights: nights };
    if (isNaN(parse(start))) return out;

    var season = seasonFor(site, start, nights);
    var hire = boatPrice(boat, input.type, season);
    var lines = [];
    if (input.linen && crew >= 1) lines.push({ id: 'linen', label: site.extras.linen.label, qty: crew, amount: crew * site.extras.linen.price });
    if (dogs > 0) lines.push({ id: 'dog', label: dogs === 1 ? 'Dog' : 'Dogs', qty: dogs, amount: dogs * site.extras.dog.price });
    if (input.hamper) lines.push({ id: 'hamper', label: site.extras.hamper.label, qty: 1, amount: site.extras.hamper.price });
    if (bikes > 0) lines.push({ id: 'bike', label: bikes === 1 ? 'Bicycle hire' : 'Bicycle hire', qty: bikes, amount: bikes * site.extras.bike.price[input.type] });
    var extrasTotal = 0;
    for (var i = 0; i < lines.length; i++) extrasTotal += lines[i].amount;
    var rental = hire + extrasTotal;
    var booking = Math.ceil(rental * site.bookingDepositPct / 100);

    out.start = start;
    out.end = addDays(start, nights);
    out.season = season;
    out.crew = crew;
    out.dogs = dogs;
    out.bikes = bikes;
    out.hire = hire;
    out.lines = lines;
    out.extrasTotal = extrasTotal;
    out.rental = rental;
    out.bookingDeposit = booking;
    out.balance = rental - booking;
    out.balanceDue = addDays(start, -7 * site.balanceDueWeeks[input.type]);
    out.damageDeposit = boat.deposit;
    out.totalIncludingDeposit = rental + boat.deposit;
    return out;
  }

  /* The text the enquiry hands to the visitor's own mail program. */
  function summaryText(site, q, who) {
    var L = [];
    L.push('Enquiry for ' + site.name);
    L.push('');
    if (who && who.name) L.push('Name: ' + who.name);
    if (who && who.email) L.push('Email: ' + who.email);
    if (who && who.phone) L.push('Phone: ' + who.phone);
    if (who && (who.name || who.email || who.phone)) L.push('');
    if (q && q.start) {
      L.push('Boat: ' + q.boat.name + ' (' + q.boat.berths + ' berths, ' + q.boat.lengthFt + ' ft)');
      L.push('Hire: ' + q.duration.label + ', ' + plural(q.nights, 'night'));
      L.push('Dates: ' + fmtDate(q.start) + ' (from ' + site.handover + ') to ' + fmtDate(q.end) + ' (back by ' + site.returnBy + ')');
      L.push('Season: ' + (q.season === 'high' ? 'High' : 'Low') + ' season');
      L.push('Crew: ' + q.crew);
      L.push('');
      L.push('Hire: ' + money(q.hire));
      for (var i = 0; i < q.lines.length; i++) {
        var l = q.lines[i];
        L.push(l.label + (l.qty > 1 ? ' x ' + l.qty : '') + ': ' + money(l.amount));
      }
      L.push('Total hire: ' + money(q.rental));
      L.push('Booking deposit (' + site.bookingDepositPct + '%): ' + money(q.bookingDeposit));
      L.push('Balance, due ' + fmtDate(q.balanceDue) + ': ' + money(q.balance));
      L.push('Refundable damage deposit, taken at handover: ' + money(q.damageDeposit));
      L.push('Total including damage deposit: ' + money(q.totalIncludingDeposit));
    }
    if (who && who.route) { L.push(''); L.push('Route we are thinking of: ' + who.route); }
    if (who && who.message) { L.push(''); L.push(who.message); }
    return L.join('\n');
  }

  /* Every valid start date for a type of hire, with its season. */
  function startOptions(site, type) {
    var out = [], s = nextValidStart(site, type, site.bookable.first);
    var nights = site.durations[type].nights;
    while (s <= site.bookable.last) {
      out.push({ value: s, season: seasonFor(site, s, nights) });
      s = addDays(s, 7);
    }
    return out;
  }

  /* The rows of the price table, as data, so the page and the script draw the same thing. */
  function quoteRows(site, q) {
    var rows = [];
    rows.push({ label: q.boat.name + ', ' + q.duration.label.toLowerCase() + ', ' + (q.season === 'high' ? 'high' : 'low') + ' season', value: money(q.hire), kind: 'hire' });
    for (var i = 0; i < q.lines.length; i++) {
      var l = q.lines[i];
      rows.push({ label: l.label + (l.qty > 1 ? ' × ' + l.qty : ''), value: money(l.amount), kind: 'extra' });
    }
    rows.push({ label: 'Total hire', value: money(q.rental), kind: 'total' });
    rows.push({ label: 'Booking deposit, ' + site.bookingDepositPct + '% to hold the dates', value: money(q.bookingDeposit), kind: 'part' });
    rows.push({ label: 'Balance, due ' + fmtDate(q.balanceDue), value: money(q.balance), kind: 'part' });
    rows.push({ label: 'Damage deposit, refunded after the check-in', value: money(q.damageDeposit), kind: 'part' });
    rows.push({ label: 'Total including the damage deposit', value: money(q.totalIncludingDeposit), kind: 'grand' });
    return rows;
  }

  /* One sentence for the screen-reader mirror of the price. */
  function liveSentence(site, q) {
    return q.boat.name + ', ' + q.duration.label.toLowerCase() + ' from ' + fmtDate(q.start) + ', ' + (q.season === 'high' ? 'high' : 'low') + ' season, crew of ' + q.crew + '. Total hire ' + money(q.rental) + ', of which ' + money(q.bookingDeposit) + ' is the booking deposit. Including the refundable damage deposit of ' + money(q.damageDeposit) + ', the total is ' + money(q.totalIncludingDeposit) + '.';
  }

  var api = {
    startOptions: startOptions, quoteRows: quoteRows, liveSentence: liveSentence,
    parse: parse, iso: iso, addDays: addDays, weekday: weekday, fmtDate: fmtDate, money: money, plural: plural,
    seasonFor: seasonFor, nextValidStart: nextValidStart, findBoat: findBoat, boatPrice: boatPrice,
    quote: quote, summaryText: summaryText, WD: WD, WDL: WDL
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WB = api;
})(typeof window !== 'undefined' ? window : this);
