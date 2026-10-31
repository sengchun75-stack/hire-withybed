/* WITHYBED — the six pages. Called by build.mjs with the derived data. */

// Every photograph: what it shows (alt), a caption for the gallery, and its gallery group.
const PHOTO = {
  'hero-wide': ['Looking out from under a brick canal bridge along a line of moored narrowboats, trees and daylight beyond the arch', 'Under the bridge, looking out', 'Locks and bridges'],
  'bridge-and-bicycle': ['A green narrowboat with a bicycle and pots of herbs on its roof, moored below a brick bridge', 'Dabchick below a brick bridge', 'Boats'],
  'blue-boat-riverside': ['The roof of a blue narrowboat seen from above, cruising a wide stretch of river', 'A blue roof on a wide reach', 'Boats'],
  'moored-in-trees': ['Two dark-hulled narrowboats moored in dappled shade under trees', 'Moored in the shade', 'Boats'],
  'lift-bridge': ['A green-and-cream narrowboat passing through a raised lift bridge, the steerer smiling at the tiller', 'Through a lift bridge', 'Boats'],
  'calm-canal-cruising': ['A red-and-green narrowboat cruising away down a rippling canal, the steerer at the back', 'Leaving a wake', 'Boats'],
  'summer-brick-wharf': ['A black narrowboat with a red-and-white striped bow, moored by a brick wharf cottage', 'Striped bow, brick wharf', 'Boats'],
  'painted-narrowboat': ['A narrowboat painted in purple, grey and pink geometric shapes, herbs growing on its roof', 'Geometric paint and a herb garden', 'Boats'],
  'steering-under-bridge': ['A narrowboat steered under a green iron bridge, a lifebuoy on the stern', 'Steering under an iron bridge', 'Boats'],
  'stone-inn-moorings': ['Red and blue narrowboats moored beside an old stone inn', 'Moored beside an old inn', 'Boats'],
  'cockpit-and-tiller': ['The steering position of a narrowboat, with engine panel and throttle in a green and yellow cockpit', 'The engine panel at the helm', 'Boats'],
  'aqueduct-crossing': ['A red-and-black narrowboat crossing an aqueduct above a village', 'Across an aqueduct', 'Boats'],
  'thames-reach': ['A dark green narrowboat moored on a broad blue stretch of river', 'A broad reach of river', 'Boats'],
  'lock-barge': ['A narrowboat entering a lock while two people work the gates', 'Working a lock', 'Locks and bridges'],
  'lock-brick': ['Water spilling through weathered timber lock gates overgrown with ferns', 'Water through old lock gates', 'Locks and bridges'],
  'caen-hill-locks': ['A long flight of locks climbing a hill between trees, narrowboats moored in the foreground', 'A flight of locks', 'Locks and bridges'],
  'bridge-and-boat': ['A narrowboat moored beneath an old brick railway viaduct, still water in front', 'Below the viaduct', 'Locks and bridges'],
  'towpath-green': ['A gravel towpath curving through green hedgerow beside the water', 'The towpath in June', 'Towpath and land'],
  'sunny-reflections': ['A grassy towpath beside a fence, a moored boat in the distance and bare trees', 'A long straight towpath', 'Towpath and land'],
  'open-countryside-canal': ['A canal curving away through fields and willows, towpath on the right', 'The canal through the fields', 'Towpath and land'],
  'meadow-and-river': ['A wide flat meadow under a broad sky, a river glinting in the distance', 'Meadow and river', 'Towpath and land'],
  'wildflower-field': ['A field of yellow wildflowers under a clear sky', 'A field of yellow', 'Towpath and land'],
  'historic-wharf-buildings': ['A calm canal reflecting old brick wharf buildings and a chimney under a blue sky', 'Old wharf buildings', 'Towpath and land'],
  'heron-in-reeds': ['A grey heron standing among tall golden reeds', 'A heron in the reeds', 'Wildlife'],
  'swan-and-cygnets': ['A swan with a brood of cygnets on dark water', 'A swan and her cygnets', 'Wildlife'],
  'canalside-pub': ['A whitewashed pub with picnic tables on the canal bank, reflected in still water', 'A pub on the bank', 'Pubs and evenings'],
  'wisteria-pub': ['A pub front under flowering wisteria, people reading at outdoor tables', 'Wisteria in May', 'Pubs and evenings'],
  'dusk-moorings': ['Narrowboats moored in the evening under willows, windows glowing', 'Evening moorings', 'Pubs and evenings'],
  'stove-cabin': ['A black wood-burning stove glowing in a timber-lined cabin', 'The stove, lit', 'Pubs and evenings'],
  'autumn-canal': ['A canal in autumn, gold leaves on both banks and two moored boats ahead', 'October', 'Seasons'],
  'frozen-canal': ['A narrowboat moored on a frozen canal between bare winter trees', 'A hard frost', 'Seasons'],
};
const GROUPS = ['Boats', 'Locks and bridges', 'Towpath and land', 'Wildlife', 'Pubs and evenings', 'Seasons'];

export function pages(c) {
  const { site, fleet, routes, departures, WB, esc, img, srcset, asset, ROOT } = c;
  const alt = (n) => PHOTO[n][0];
  const ph = (n, o) => img(n, alt(n), o);
  const M = WB.money;
  const d1 = (s) => WB.fmtDate(s, { noYear: true });
  const livery = (b) => `<ul class="livery" aria-label="Livery colours">${b.livery.map((x) => `<li><span class="sw" data-sw="${x.slice(1)}"></span></li>`).join('')}</ul>`;
  const vl = (t, cls = '') => `<span class="vlabel ${cls}" aria-hidden="true">${esc(t)}</span>`;
  const berthsLine = (b) => `${b.berths} berths · ${b.lengthFt} ft · ${b.dogFriendly ? 'dogs welcome' : 'no dogs'}`;
  const route = (id) => routes.find((r) => r.id === id);
  const dur = site.durations;
  const featured = departures[0];

  /* ===================== HOME ===================== */
  const depRows = departures.map((d, i) => `
        <li class="dep${i === 0 ? ' dep--on' : ''}">
          <span class="dep__dates"><span>${d1(d.start)}</span> – <span>${d1(d.end)}</span></span>
          <span class="dep__title">${esc(d.routeName)}<span class="dep__type">${dur[d.type].label}</span></span>
          <span class="dep__from">from ${M(d.from)}</span>
          <a class="dep__go" href="routes.html?route=${d.route}" aria-label="Details: ${esc(d.routeName)}, ${d1(d.start)} to ${d1(d.end)}"><span>details</span> <span aria-hidden="true">→</span></a>
        </li>`).join('');

  const cards = fleet.map((b, i) => `
        <div class="cc" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${fleet.length}: ${esc(b.name)}" data-index="${i}">
          <div class="cc__photo">${img(b.image, b.alt, { sizes: '(min-width: 900px) 22rem, 80vw' })}</div>
          <div class="cc__body">
            <h3 class="cc__name">${esc(b.name)}</h3>
            <p class="cc__meta">${berthsLine(b)}</p>
            <p class="cc__price">from ${M(b.price.week.low)} a week</p>
            <a class="cc__go" href="boat.html?b=${b.id}">Boat details<span class="sr-only">: ${esc(b.name)}</span></a>
          </div>
        </div>`).join('');

  const oxf = route('oxford-and-back'), napton = route('napton-the-long-way-up'), thrupp = route('thrupp-for-the-weekend');
  const teaser = [oxf, thrupp, napton].map((r) => `
          <li><a href="routes.html?route=${r.id}"><span class="tz__name">${esc(r.name)}</span><span class="tz__meta">${dur[r.type].label} · ${r.miles} miles · ${r.locks} locks</span></a></li>`).join('');

  const home = `
<section class="hero" aria-labelledby="hero-h">
  <div class="hero__media">
    <picture>
      <source media="(max-width: 760px)" srcset="${srcset('hero-tall')}" sizes="100vw">
      <img class="hero__img" src="img/hero-wide-1920.webp" srcset="${srcset('hero-wide')}" sizes="100vw" width="${c.dims('hero-wide').w}" height="${c.dims('hero-wide').h}" alt="${esc(alt('hero-wide'))}" fetchpriority="high" decoding="async">
    </picture>
    <canvas class="hero__gl" aria-hidden="true"></canvas>
    <div class="hero__fade" aria-hidden="true"></div>
  </div>
  ${vl('Lower Heyford · Oxford Canal', 'vlabel--l')}
  ${vl('Season 2027 · 5 March to 19 November', 'vlabel--r')}
  <div class="hero__copy">
    <h1 id="hero-h"><span class="h1-ghost">Eleven locks from our wharf to Oxford,</span> <span class="h1-heavy">a week on the Oxford Canal</span></h1>
    <p class="hero__small">Six narrowboats for two to ten people. Handover on Fridays at ${site.handover}, a full hour at the tiller before you cast off, and your first lock worked with one of us standing beside you.</p>
    <p class="hero__cta"><a class="btn" href="plan.html">Price a week</a> <a class="lnk" href="boats.html">See the boats</a></p>
  </div>
</section>
<nav class="towns" aria-label="Places on our routes">
  <ul>
    <li><a href="routes.html#explorer">Heyford</a></li><li><a href="routes.html#explorer">Enslow</a></li><li><a href="routes.html#explorer">Thrupp</a></li><li><a href="routes.html#explorer">Oxford</a></li><li><a href="routes.html#explorer">Somerton</a></li><li><a href="routes.html#explorer">Banbury</a></li><li><a href="routes.html#explorer">Cropredy</a></li><li><a href="routes.html#explorer">Napton</a></li>
  </ul>
</nav>

<section class="sec intro grid" data-ghost="Slow" aria-labelledby="intro-h">
  <figure class="intro__photo rv">${ph('towpath-green', { sizes: '(min-width: 900px) 55vw, 100vw' })}</figure>
  <div class="intro__text rv">
    <h2 id="intro-h">Three miles an hour is fast enough</h2>
    <p>Withybed Wharf sits at the foot of Heyford Common Lock on the Oxford Canal: ${site.locksToOxford} locks and ${site.milesToOxford} miles from the end of the line in Oxford, ${routes.find((r) => r.id === 'napton-the-long-way-up').locks / 2} locks from the Grand Union at Napton.</p>
    <p>We have six boats, from forty-five feet for two to seventy feet for ten. Every one is handed over in person. You work your first lock with us beside you, not with a video.</p>
    <dl class="facts">
      <div><dt>Handover</dt><dd>${dur.week.startName}s, ${site.handover}</dd></div>
      <div><dt>Back by</dt><dd>${site.returnBy}</dd></div>
      <div><dt>Boats</dt><dd>${fleet.length}, sleeping 2 to 10</dd></div>
      <div><dt>Dogs</dt><dd>On ${fleet.filter((b) => b.dogFriendly).length} of them</dd></div>
    </dl>
  </div>
  ${vl('Withybed Wharf', 'vlabel--r')}
</section>

<section class="sec deps grid" data-ghost="2027" aria-labelledby="deps-h" id="departures">
  ${vl('Departures 2027', 'vlabel--l')}
  <div class="deps__photo rv">
    <figure class="dp">
      ${ph('stone-inn-moorings', { sizes: '(min-width: 900px) 46vw, 100vw' })}
      <figcaption class="dp__strip"><span>${d1(featured.start)} – ${d1(featured.end)}</span><span>${esc(featured.routeName)}</span><span>from ${M(featured.from)}</span></figcaption>
    </figure>
  </div>
  <div class="deps__list rv">
    <h2 id="deps-h">Dated departures</h2>
    <p class="deps__lede">Seven of the sailings we are filling first. Any Friday from 5 March works; these are the ones with a route already planned.</p>
    <ul class="deplist">${depRows}
    </ul>
    <p><a class="lnk" href="plan.html">Price any other date</a></p>
  </div>
</section>

<section class="sec fleet" data-ghost="Fleet" aria-labelledby="fleet-h" id="fleet">
  <div class="fleet__head grid"><h2 id="fleet-h" class="rv">Six boats, one to hold</h2><p class="rv">Short enough to turn on the northern routes or long enough to sleep ten: the centre card is the one most first-timers choose.</p></div>
  <div class="carousel" role="group" aria-roledescription="carousel" aria-label="The fleet" data-carousel data-start="1">
    <div class="carousel__view">
      <div class="carousel__track" data-track>${cards}
      </div>
    </div>
    <div class="carousel__ctl">
      <button class="cbtn" type="button" data-prev aria-label="Previous boat"><span aria-hidden="true">←</span></button>
      <p class="carousel__count" data-count aria-hidden="true">2 / ${fleet.length}</p>
      <button class="cbtn" type="button" data-next aria-label="Next boat"><span aria-hidden="true">→</span></button>
    </div>
    <p class="sr-only" role="status" aria-live="polite" data-live>Kingfisher, 2 of ${fleet.length}</p>
  </div>
</section>

<section class="sec rt grid" data-ghost="Routes" aria-labelledby="rt-h">
  <div class="rt__text rv">
    <h2 id="rt-h">Eight routes, none of them hurried</h2>
    <p>Hours are worked out at three miles an hour plus twelve minutes a lock. The longest day on any route is ${c.fmtH(Math.max(...routes.map((r) => r.longest)))}, and every route is back at the wharf by ${site.returnBy} on the last morning.</p>
    <ul class="tz">${teaser}
    </ul>
    <p><a class="lnk" href="routes.html#explorer">Open the route explorer</a></p>
  </div>
  <figure class="rt__photo rv">${ph('open-countryside-canal', { sizes: '(min-width: 900px) 55vw, 100vw' })}</figure>
  ${vl('Oxford Canal · 78 miles', 'vlabel--l')}
</section>

<section class="sec first grid" data-ghost="First" aria-labelledby="first-h">
  <div class="first__text rv">
    <h2 id="first-h">Never steered a boat? Good.</h2>
    <p>Most of our guests have not. The handover is an hour on the water: how to stop (the hard part), how to leave a lock with the gates behind you, and what to do when a boat comes the other way round a blind bend.</p>
    <p>On Mute Swan and Grey Heron the handover is two hours, and we ask that one person in the crew has steered a long boat before.</p>
  </div>
  <figure class="first__photo rv">${ph('steering-under-bridge', { sizes: '(min-width: 900px) 48vw, 100vw' })}</figure>
</section>

<section class="band" aria-label="A narrowboat turning a bend">
  <video class="clip" muted loop playsinline preload="none" data-poster="img/poster-turning-corner.webp" data-src="video/turning-corner.mp4" width="1280" height="720" aria-hidden="true" tabindex="-1"></video>
  <p class="band__cap">The steerer lines up early. The boat does the rest.</p>
</section>

<section class="sec visit grid" data-ghost="Visit" aria-labelledby="visit-h" id="visit">
  <figure class="visit__photo rv">${ph('historic-wharf-buildings', { sizes: '(min-width: 900px) 50vw, 100vw' })}</figure>
  <div class="visit__text rv">
    <h2 id="visit-h">Come and see the wharf</h2>
    <p>Withybed has been two people and a diesel engine since 2009, and is now six boats and a workshop where every engine is stripped and rebuilt over the winter.</p>
    <address>${site.address.join('<br>')}</address>
    <table class="hours"><caption class="sr-only">Opening hours</caption><tbody>
${site.hours.map((h) => `      <tr><th scope="row">${h.label}<span>${h.days}</span></th><td>${h.open}</td></tr>`).join('\n')}
    </tbody></table>
    <p>Lower Heyford station is a short walk from the wharf, and the Oxford train is about twenty minutes. By car, the wharf has parking for each crew for the length of the hire.</p>
    <p><a class="btn" href="plan.html#enquiry">Send an enquiry</a></p>
  </div>
</section>

<section class="band band--short" aria-label="Still water">
  <video class="clip" muted loop playsinline preload="none" data-poster="img/poster-tranquil-canal.webp" data-src="video/tranquil-canal.mp4" width="1280" height="720" aria-hidden="true" tabindex="-1"></video>
</section>`;

  /* ===================== BOATS ===================== */
  const boatRows = fleet.map((b) => `
      <li class="boat rv" data-berths="${b.berths}" data-dog="${b.dogFriendly ? 1 : 0}" data-price="${b.price.week.low}" id="boat-${b.id}">
        <a class="boat__photo" href="boat.html?b=${b.id}" tabindex="-1" aria-hidden="true">${img(b.image, '', { sizes: '(min-width: 900px) 40vw, 100vw' })}</a>
        <div class="boat__body">
          <h2 class="boat__name"><a href="boat.html?b=${b.id}">${esc(b.name)}</a></h2>
          <p class="boat__meta">${berthsLine(b)} · ${esc(b.cabins)}</p>
          ${livery(b)}
          <p class="boat__blurb">${esc(b.blurb)}</p>
          <table class="ptable"><caption class="sr-only">Hire prices for ${esc(b.name)}</caption>
            <thead><tr><th scope="col">Hire</th><th scope="col">Low season</th><th scope="col">High season</th></tr></thead>
            <tbody>
              <tr><th scope="row">Week, 7 nights</th><td>${M(b.price.week.low)}</td><td>${M(b.price.week.high)}</td></tr>
              <tr><th scope="row">Midweek, 4 nights</th><td>${M(b.price.midweek.low)}</td><td>${M(b.price.midweek.high)}</td></tr>
              <tr><th scope="row">Weekend, 3 nights</th><td>${M(b.price.weekend.low)}</td><td>${M(b.price.weekend.high)}</td></tr>
            </tbody>
          </table>
          <p class="boat__act"><a class="btn" href="boat.html?b=${b.id}">Boat details<span class="sr-only">: ${esc(b.name)}</span></a> <a class="lnk" href="plan.html?boat=${b.id}">Price ${esc(b.name)}</a></p>
        </div>
      </li>`).join('');
  const minW = Math.min(...fleet.map((b) => b.price.week.low)), maxW = Math.max(...fleet.map((b) => b.price.week.low));
  const berthOpts = [0, 2, 4, 6, 8, 10];
  const boats = `
<section class="head grid" data-ghost="Boats">
  <figure class="head__photo">${ph('painted-narrowboat', { eager: true, sizes: '(min-width: 900px) 55vw, 100vw' })}</figure>
  <div class="head__text">
    <h1>Six boats, <span class="h1-heavy">two to ten berths</span></h1>
    <p>Every boat is 6 ft 10 in wide, steered from the stern, heated by a solid-fuel stove and by diesel central heating, and priced by the week, the weekend and the midweek.</p>
  </div>
  ${vl('The fleet', 'vlabel--l')}
</section>

<section class="sec list" aria-labelledby="f-h">
  <h2 id="f-h" class="sr-only">Filter the boats</h2>
  <form class="filters" data-filters aria-label="Filter the boats">
    <fieldset class="filters__berths"><legend>Sleeps at least</legend>
      ${berthOpts.map((n, i) => `<label class="pill"><input type="radio" name="berths" value="${n}"${i === 0 ? ' checked' : ''}><span>${n === 0 ? 'Any' : n}</span></label>`).join('')}
    </fieldset>
    <label class="chk"><input type="checkbox" name="dog"><span>Dog-friendly only</span></label>
    <div class="filters__price"><label for="f-price">Low-season week up to <output for="f-price" data-price-out>${M(maxW)}</output></label>
      <input id="f-price" type="range" name="price" min="${minW}" max="${maxW}" step="50" value="${maxW}"></div>
    <button class="lnk lnk--btn" type="reset" data-reset>Clear</button>
    <p class="filters__count" role="status" aria-live="polite" data-count>Showing all ${fleet.length} boats</p>
  </form>
  <ul class="boatlist" data-list>${boatRows}
  </ul>
  <p class="empty" data-empty hidden>No boat matches those filters. Clear one and the list comes back.</p>
</section>

<section class="sec stove grid" data-ghost="Warm" aria-labelledby="stove-h">
  <figure class="stove__photo rv">${ph('stove-cabin', { sizes: '(min-width: 900px) 30vw, 70vw' })}</figure>
  <div class="stove__text rv">
    <h2 id="stove-h">Every boat has a stove</h2>
    <p>A solid-fuel stove in the saloon and diesel central heating through the cabins, so a March week is no colder than a September one. The first two bags of coal are in the price; more is sold at the wharf at £11 a bag.</p>
    <p>The stove is the reason we hire all year round.</p>
  </div>
</section>

<section class="sec seasons grid" data-ghost="Season" aria-labelledby="seas-h">
  <div class="seasons__text rv">
    <h2 id="seas-h">When a week costs more</h2>
    <p>High season is any hire with a night between ${WB.fmtDate(site.seasons.highFrom, { noWeekday: true })} and ${WB.fmtDate(site.seasons.highTo, { noWeekday: true })}. Everything else is low season, including the weeks either side, when the towpath is quietest and the light is best.</p>
    <p>We take bookings for starts from ${WB.fmtDate(site.bookable.first)} to ${WB.fmtDate(site.bookable.last)}. Weeks and weekend breaks start on a Friday; midweek breaks start on a Monday.</p>
    <p><a class="btn" href="plan.html">Price a date</a></p>
  </div>
  <figure class="seasons__photo rv">${ph('frozen-canal', { sizes: '(min-width: 900px) 36vw, 70vw' })}</figure>
</section>`;

  /* ===================== BOAT DETAIL ===================== */
  const boatPage = `
<section class="sec bd" data-ghost="Boat" aria-labelledby="bd-h">
  <div data-boat-root>
    <h1 id="bd-h" class="sr-only">A Withybed boat</h1>
    <p class="bd__load">Loading the boat…</p>
  </div>
  <noscript>
    <p class="bd__nojs">The boat page needs scripts to draw itself. The full list, with prices, is on the <a href="boats.html">boats page</a>.</p>
    <ul class="bd__links">${fleet.map((b) => `<li><a href="boats.html#boat-${b.id}">${esc(b.name)}</a></li>`).join('')}</ul>
  </noscript>
</section>

<section class="sec handover grid" data-ghost="Helm" aria-labelledby="ho-h">
  <figure class="handover__photo rv">${ph('cockpit-and-tiller', { sizes: '(min-width: 900px) 50vw, 100vw' })}</figure>
  <div class="handover__text rv">
    <h2 id="ho-h">The hour before you leave</h2>
    <p>On every boat we sit at the helm with you before the engine goes in gear: throttle and gear lever, where the stop is, how to take a bend wide, how a lock works from the inside. The hour is not a demonstration; you steer it.</p>
    <p>Then we take you to the first lock and work it with you. Mute Swan and Grey Heron get two hours.</p>
    <p><a class="btn" href="plan.html">Price a hire</a></p>
  </div>
</section>`;

  /* ===================== ROUTES ===================== */
  const defaultRoute = site.defaultRoute;
  const panels = routes.map((r) => {
    const suited = r.suited.map((id) => fleet.find((b) => b.id === id));
    const rows = r.days.map((d) => `
            <tr>
              <th scope="row">Day ${d.n}<span>${d.dow}</span></th>
              <td>${d.miles === 0 ? esc(d.note) : `${esc(d.from)} to ${esc(d.to)}${d.note ? `<span class="note">${esc(d.note)}</span>` : ''}`}</td>
              <td class="num">${d.miles === 0 ? '–' : d.miles.toFixed(1)}</td>
              <td class="num">${d.locks === 0 ? '–' : d.locks}</td>
              <td class="num">${d.hoursLabel}</td>
            </tr>`).join('');
    return `
      <article class="rp${r.id === defaultRoute ? ' is-active' : ''}" id="route-${r.id}" data-route="${r.id}" aria-labelledby="rp-${r.id}-h">
        <figure class="rp__photo">${img(r.photo, r.alt, { sizes: '(min-width: 900px) 46vw, 100vw' })}</figure>
        <div class="rp__body">
          <h3 id="rp-${r.id}-h">${esc(r.name)}</h3>
          <p class="rp__sum">${esc(r.summary)}</p>
          <dl class="stats">
            <div><dt>Miles</dt><dd>${r.miles}</dd></div>
            <div><dt>Locks</dt><dd>${r.locks}</dd></div>
            <div><dt>Nights</dt><dd>${r.nights}</dd></div>
            <div><dt>Longest day</dt><dd>${r.longestLabel}</dd></div>
          </dl>
          <p class="sr-only" data-route-live>${esc(r.name)}: ${r.miles} miles, ${r.locks} locks, ${r.nights} nights, longest day ${r.longestLabel}.</p>
          <p class="rp__best">${esc(r.best)}</p>
          <div class="schem" data-schem aria-hidden="true"></div>
          <table class="dtable"><caption class="sr-only">Day by day, ${esc(r.name)}</caption>
            <thead><tr><th scope="col">Day</th><th scope="col">From and to</th><th scope="col" class="num">Miles</th><th scope="col" class="num">Locks</th><th scope="col" class="num">Hours</th></tr></thead>
            <tbody>${rows}
            </tbody>
          </table>
          <h4 class="rp__h">Stops along the way</h4>
          <ul class="stops">${r.stops.map((s) => `<li><span class="stops__name">${esc(s.name)}</span><span class="stops__at">${s.at === 0 ? 'the wharf' : `mile ${s.at}`}${s.note ? ` · ${esc(s.note)}` : ''}</span></li>`).join('')}</ul>
          <h4 class="rp__h">Boats that suit it</h4>
          <p class="rp__why">${esc(r.maxLengthWhy.charAt(0).toUpperCase() + r.maxLengthWhy.slice(1))}: boats up to ${r.maxLengthFt} ft.</p>
          <ul class="chips">${suited.map((b) => `<li><a href="boat.html?b=${b.id}">${esc(b.name)}<span>${b.berths} berths · ${b.lengthFt} ft</span></a></li>`).join('')}</ul>
          <p class="rp__act"><a class="btn" href="plan.html?route=${r.id}">Price this route</a> <span class="rp__from">${dur[r.type].label} from ${M(r.fromLow)} in low season</span></p>
        </div>
      </article>`;
  }).join('');

  const routeList = routes.map((r) => `
        <label class="rl"><input type="radio" name="route" value="${r.id}"${r.id === defaultRoute ? ' checked' : ''}><span class="rl__name">${esc(r.name)}</span><span class="rl__meta">${dur[r.type].label} · ${r.miles} mi · ${r.locks} locks</span></label>`).join('');

  const routesPage = `
<section class="head grid" data-ghost="Routes">
  <figure class="head__photo">${ph('caen-hill-locks', { eager: true, sizes: '(min-width: 900px) 55vw, 100vw' })}</figure>
  <div class="head__text">
    <h1>Eight routes, <span class="h1-heavy">one wharf</span></h1>
    <p>Pick a route and the explorer gives you the miles, the locks, the hours in each day, the places to tie up, and the boats that are short enough to turn at the far end.</p>
  </div>
  ${vl('Withybed Wharf · Lower Heyford', 'vlabel--l')}
</section>

<section class="sec explorer" id="explorer" data-ghost="Map" aria-labelledby="ex-h">
  <h2 id="ex-h" class="sr-only">Route explorer</h2>
  <div class="explorer__grid">
    <form class="rlist" data-rlist aria-label="Choose a route">
      <fieldset><legend>Choose a route</legend>${routeList}
      </fieldset>
    </form>
    <div class="rpanels" data-rpanels>${panels}
    </div>
  </div>
  <p class="explorer__note">Hours are three miles an hour plus twelve minutes a lock, which is what a careful crew manages. Add time for lunch, and for the pub.</p>
</section>

<section class="sec lockx grid" data-ghost="Locks" aria-labelledby="lock-h">
  <figure class="lockx__photo rv">${ph('lock-brick', { sizes: '(min-width: 900px) 34vw, 70vw' })}</figure>
  <div class="lockx__text rv">
    <h2 id="lock-h">How a lock works, in one paragraph</h2>
    <p>Drive in, stop, close the gate behind you. Wind a paddle at the far end and the water drops or rises; when it is level, open the gate in front and drive out. A narrow lock takes about twelve minutes, a boat length of patience, and one person on the tiller while another works the paddles.</p>
    <p>The Oxford Canal has ${site.locksToOxford} between our wharf and the end of the line in Oxford, and most of them are in pairs of friendly gates you can lean on.</p>
  </div>
  <div class="lockx__clip">
    <video class="clip" muted loop playsinline preload="none" data-poster="img/poster-lock-tall.webp" data-src="video/lock-tall.mp4" width="540" height="960" aria-hidden="true" tabindex="-1"></video>
  </div>
</section>

<section class="sec wild grid" data-ghost="Wild" aria-labelledby="wild-h">
  <div class="wild__text rv">
    <h2 id="wild-h">What you will pass</h2>
    <p>Herons stand on the towpath side in the early morning and let you drift to within a few feet. Swans nest on the Cherwell valley pounds from April, and the cygnets are on the water by June. In May the pubs have wisteria.</p>
    <p>None of it is arranged. It is simply what is there at three miles an hour.</p>
  </div>
  <figure class="wild__a rv">${ph('heron-in-reeds', { sizes: '(min-width: 900px) 30vw, 70vw' })}</figure>
  <figure class="wild__b rv">${ph('swan-and-cygnets', { sizes: '(min-width: 900px) 24vw, 60vw' })}</figure>
</section>`;

  /* ===================== PLAN ===================== */
  const dq = site.defaultQuote;
  const q0 = WB.quote(site, fleet, dq);
  if (!q0.ok) throw new Error('default quote invalid: ' + q0.errors.join(' '));
  const rowsHtml = (q) => WB.quoteRows(site, q).map((r) => `<tr class="q-${r.kind}"><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join('');
  const startOpts = WB.startOptions(site, dq.type).map((o) => `<option value="${o.value}"${o.value === dq.start ? ' selected' : ''}>${WB.fmtDate(o.value)} · ${o.season} season</option>`).join('');
  const summary0 = WB.summaryText(site, q0, {});
  const kingfisher = WB.findBoat(fleet, dq.boat);

  const plan = `
<section class="head grid" data-ghost="Plan">
  <figure class="head__photo">${ph('dusk-moorings', { eager: true, sizes: '(min-width: 900px) 42vw, 100vw' })}</figure>
  <div class="head__text">
    <h1>Price a week, <span class="h1-heavy">then ask us</span></h1>
    <p>Choose a boat, a type of hire and a start date. The price is worked out here in your browser, from the same table printed on the boats page.</p>
  </div>
  ${vl('Prices include VAT', 'vlabel--l')}
</section>

<section class="sec calc" id="calculator" data-ghost="Price" aria-labelledby="calc-h">
  <h2 id="calc-h" class="sr-only">Price calculator</h2>
  <div class="calc__grid">
    <form class="calc__form" id="calc" data-calc novalidate aria-label="Price calculator">
      <div class="f">
        <label for="c-boat">Boat</label>
        <select id="c-boat" name="boat">${fleet.map((b) => `<option value="${b.id}" data-berths="${b.berths}" data-dog="${b.dogFriendly ? 1 : 0}"${b.id === dq.boat ? ' selected' : ''}>${esc(b.name)} · ${b.berths} berths · ${b.lengthFt} ft</option>`).join('')}</select>
      </div>
      <fieldset class="f f--type"><legend>Type of hire</legend>
        ${Object.entries(dur).map(([k, v]) => `<label class="pill pill--wide"><input type="radio" name="type" value="${k}"${k === dq.type ? ' checked' : ''}><span>${v.label}<small>${v.blurb}</small></span></label>`).join('')}
      </fieldset>
      <div class="f">
        <label for="c-start">Start date</label>
        <select id="c-start" name="start" aria-describedby="c-start-hint">${startOpts}</select>
        <p class="hint" id="c-start-hint" data-start-hint>Weeks start on a ${dur.week.startName} at ${site.handover}.</p>
      </div>
      <div class="f f--crew">
        <label for="c-crew">Crew</label>
        <input id="c-crew" name="crew" type="number" inputmode="numeric" min="1" max="${kingfisher.berths}" step="1" value="${dq.crew}" aria-describedby="c-crew-hint">
        <p class="hint" id="c-crew-hint" data-crew-hint>${kingfisher.name} sleeps ${kingfisher.berths}.</p>
      </div>
      <fieldset class="f f--extras"><legend>Extras</legend>
        <label class="chk"><input type="checkbox" name="linen"${dq.linen ? ' checked' : ''}><span>${site.extras.linen.label} <em>${M(site.extras.linen.price)} ${site.extras.linen.unit}</em></span></label>
        <label class="chk"><input type="checkbox" name="hamper"${dq.hamper ? ' checked' : ''}><span>${site.extras.hamper.label} <em>${M(site.extras.hamper.price)}, ${site.extras.hamper.unit}</em></span></label>
        <div class="f f--inline"><label for="c-dogs">Dogs <em>${M(site.extras.dog.price)} ${site.extras.dog.unit}</em></label>
          <select id="c-dogs" name="dogs" ${kingfisher.dogFriendly ? '' : 'disabled'}><option value="0" selected>None</option><option value="1">1</option><option value="2">2</option></select></div>
        <div class="f f--inline"><label for="c-bikes">Bicycles <em>${M(site.extras.bike.price.week)} a week, ${M(site.extras.bike.price.midweek)} midweek, ${M(site.extras.bike.price.weekend)} weekend</em></label>
          <input id="c-bikes" name="bikes" type="number" inputmode="numeric" min="0" max="${site.extras.bike.max}" step="1" value="${dq.bikes}"></div>
      </fieldset>
    </form>

    <aside class="calc__out" aria-labelledby="out-h">
      <h3 id="out-h">Your price</h3>
      <p class="sr-only" role="status" aria-live="polite" data-out-live>${esc(WB.liveSentence(site, q0))}</p>
      <ul class="errs" data-errs hidden></ul>
      <table class="qtable" data-out><caption class="sr-only">Price breakdown</caption><tbody>${rowsHtml(q0)}</tbody></table>
      <p class="calc__small">The damage deposit is held against the boat and returned after the check-in. Nothing is charged on this site: a booking is made by email, and we send the payment link.</p>
      <p><a class="btn" href="#enquiry" data-to-enquiry>Send this as an enquiry</a></p>
    </aside>
  </div>
</section>

<section class="sec enq grid" id="enquiry" data-ghost="Ask" aria-labelledby="enq-h">
  <div class="enq__photo rv"><figure>${ph('wildflower-field', { sizes: '(min-width: 900px) 40vw, 100vw' })}</figure></div>
  <div class="enq__form rv">
    <h2 id="enq-h">Send us the enquiry</h2>
    <p>This does not send anything from our server. It opens your own email program with the price above filled in, addressed to ${site.email}. We answer within one working day.</p>
    <p class="enq__priv">What happens to what you type: it stays in your browser until you press the button, and then it goes into an email from your own mail program. This site stores nothing, sets no cookies and runs no analytics. We use your details to reply, and keep the email for the length of the booking and a year after.</p>
    <form id="enquiry-form" data-enquiry novalidate>
      <div class="f"><label for="e-name">Your name</label><input id="e-name" name="name" type="text" autocomplete="name" required></div>
      <div class="f"><label for="e-email">Your email</label><input id="e-email" name="email" type="email" autocomplete="email" required></div>
      <div class="f"><label for="e-phone">Phone <em>optional</em></label><input id="e-phone" name="phone" type="tel" autocomplete="tel"></div>
      <div class="f"><label for="e-route">A route in mind <em>optional</em></label>
        <select id="e-route" name="route"><option value="">No route yet</option>${routes.map((r) => `<option value="${esc(r.name)}" data-id="${r.id}">${esc(r.name)} · ${dur[r.type].label.toLowerCase()}</option>`).join('')}</select></div>
      <div class="f"><label for="e-msg">Anything else <em>optional</em></label><textarea id="e-msg" name="message" rows="4"></textarea></div>
      <div class="f"><label for="e-sum">What we will receive</label><textarea id="e-sum" name="summary" rows="14" readonly data-summary>${esc(summary0)}</textarea></div>
      <p class="enq__act"><button class="btn" type="submit">Open in my email program</button> <button class="btn btn--ghost" type="button" data-copy>Copy the summary</button></p>
      <p class="enq__status" role="status" aria-live="polite" data-status></p>
    </form>
    <noscript><p class="enq__priv">Scripts are off, so the button cannot build the email for you. Write to <a href="mailto:${site.email}">${site.email}</a> and say which boat and dates you have in mind.</p></noscript>
  </div>
</section>`;

  /* ===================== GALLERY ===================== */
  const order = Object.keys(PHOTO);
  const fullOf = (n) => {
    const ws = srcset(n).split(', ').map((s) => Number(/-(\d+)\.webp/.exec(s)[1]));
    return `img/${n}-${Math.max(...ws)}.webp`;
  };
  const gallery = `
<section class="head head--compact grid" data-ghost="Views">
  <div class="head__text">
    <h1>Gallery, <span class="h1-heavy">${order.length} frames</span></h1>
    <p>The wharf, the water and the towpath. Press a photograph to open it; the arrow keys move between them and Escape closes.</p>
  </div>
  ${vl('All the photographs', 'vlabel--l')}
</section>
<section class="sec galsec" aria-labelledby="gal-h">
  <h2 id="gal-h" class="sr-only">Photographs</h2>
  <div class="galfilters" role="group" aria-label="Show photographs of" data-galfilters>
    <button type="button" class="pill-btn" aria-pressed="true" data-cat="">All</button>
    ${GROUPS.map((g) => `<button type="button" class="pill-btn" aria-pressed="false" data-cat="${esc(g)}">${g}</button>`).join('')}
  </div>
  <p class="filters__count" role="status" aria-live="polite" data-galcount>Showing all ${order.length} photographs</p>
  <ul class="gal" data-gal>
${order.map((n, i) => `    <li data-cat="${esc(PHOTO[n][2])}"><button class="gal__item" type="button" data-full="${fullOf(n)}" data-alt="${esc(PHOTO[n][0])}" data-cap="${esc(PHOTO[n][1])}" aria-label="Open photograph: ${esc(PHOTO[n][1])}">${img(n, '', { sizes: '(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw' })}</button></li>`).join('\n')}
  </ul>
</section>
<dialog class="lb" aria-label="Photograph viewer" data-lb>
  <div class="lb__in">
    <figure class="lb__fig"><img data-lb-img alt="" width="1920" height="1200"><figcaption data-lb-cap></figcaption></figure>
    <button class="lb__btn lb__prev" type="button" data-lb-prev aria-label="Previous photograph"><span aria-hidden="true">←</span></button>
    <button class="lb__btn lb__next" type="button" data-lb-next aria-label="Next photograph"><span aria-hidden="true">→</span></button>
    <button class="lb__btn lb__close" type="button" data-lb-close aria-label="Close the viewer"><span aria-hidden="true">×</span></button>
    <p class="lb__count" data-lb-count aria-live="polite"></p>
  </div>
</dialog>`;

  const preload = `<link rel="preload" as="image" href="img/hero-wide-1920.webp" imagesrcset="${srcset('hero-wide')}" imagesizes="100vw" media="(min-width: 761px)" fetchpriority="high">
<link rel="preload" as="image" href="img/hero-tall-960.webp" imagesrcset="${srcset('hero-tall')}" imagesizes="100vw" media="(max-width: 760px)" fetchpriority="high">
`;

  const common = ['js/vendor/lenis-1.3.27.min.js'];
  const notFound = `
<section class="sec nf grid" data-ghost="404" aria-labelledby="nf-h">
  <div class="nf__text">
    <h1 id="nf-h"><span class="h1-ghost">Nothing moored here,</span> <span class="h1-heavy">page not found</span></h1>
    <p>The address may have changed, or been mistyped. The boats, the routes and the price calculator are all one click away.</p>
    <p><a class="btn" href="index.html">Back to the wharf</a> <a class="lnk" href="boats.html">See the boats</a></p>
  </div>
</section>`;
  return [
    { file: '404.html', title: 'Page not found · Withybed Narrowboats', desc: 'That page is not here. The boats, routes and price calculator at Withybed Narrowboats are one click away.', main: notFound, bodyClass: 'page-404', noindex: true, scripts: [...common, 'js/common.js'] },
    { file: 'index.html', title: 'Withybed Narrowboats · Canal holidays on the Oxford Canal', desc: `Six narrowboats for two to ten people, hired by the week, weekend or midweek from Lower Heyford. Eleven locks to Oxford, eight routes, prices from ${M(minW)}.`, main: home, bodyClass: 'page-home', preload, scripts: ['js/vendor/gsap-3.15.0.min.js', ...common, 'js/common.js', 'js/hero-gl.js', 'js/home.js'] },
    { file: 'boats.html', title: 'The boats · Withybed Narrowboats', desc: `Six narrowboats sleeping two to ten, from ${M(minW)} a week. Filter by berths, dogs and price; every boat has a stove.`, main: boats, bodyClass: 'page-boats', scripts: [...common, 'js/common.js', 'js/boats.js'] },
    { file: 'boat.html', title: 'Boat details · Withybed Narrowboats', desc: 'One Withybed narrowboat in detail: berths, length, prices by season, and the routes it can turn on.', main: boatPage, bodyClass: 'page-boat', scripts: [...common, 'js/calc-core.js', 'js/common.js', 'js/boat.js'] },
    { file: 'routes.html', title: 'Routes · Withybed Narrowboats', desc: 'Eight routes from Withybed Wharf: Oxford, Banbury, the Thames, Cropredy and Napton. Miles, locks, hours a day and the boats that suit each.', main: routesPage, bodyClass: 'page-routes', scripts: [...common, 'js/common.js', 'js/routes.js'] },
    { file: 'plan.html', title: 'Price a hire and enquire · Withybed Narrowboats', desc: 'Work out the price of a week, weekend or midweek hire, with extras and deposits, then send the enquiry by email.', main: plan, bodyClass: 'page-plan', scripts: [...common, 'js/calc-core.js', 'js/common.js', 'js/plan.js'] },
    { file: 'gallery.html', title: 'Gallery · Withybed Narrowboats', desc: `${order.length} photographs of narrowboats, locks, towpaths, herons and pubs along the Oxford Canal.`, main: gallery, bodyClass: 'page-gallery', scripts: [...common, 'js/common.js', 'js/gallery.js'] },
  ];
}
