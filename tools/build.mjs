/* WITHYBED — builds the six pages and the three data files.

     node tools/build.mjs

   Reads tools/data-source.mjs, derives every computed number (route totals,
   hours a day, which boats fit which route, "from" prices), writes data/*.json
   for the browser tools and bakes the same numbers into the HTML. There is no
   runtime dependency; this is plain Node, kept in the repo as the record of how
   the pages were made. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { site, fleet, routes, departures } from './data-source.mjs';
import { pages } from './pages.mjs';

const require = createRequire(import.meta.url);
const WB = require('../js/calc-core.js');
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE_URL || 'https://hire-withybed.pages.dev/';

/* ---------- derived route numbers ---------- */
const SPEED = 3; // miles an hour
const LOCK_H = 0.2; // twelve minutes a lock
const hoursOf = (miles, locks) => miles / SPEED + locks * LOCK_H;
const fmtH = (h) => {
  const mins = Math.round(h * 60 / 5) * 5;
  const hh = Math.floor(mins / 60), mm = mins % 60;
  if (mins === 0) return 'tied up';
  return hh ? `${hh} h ${String(mm).padStart(2, '0')}` : `${mm} min`;
};
const DAYNAME = { week: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'], weekend: ['Fri', 'Sat', 'Sun', 'Mon'], midweek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] };
const DAYCOUNT = { week: 8, weekend: 4, midweek: 5 };

for (const r of routes) {
  if (r.days.length !== DAYCOUNT[r.type]) throw new Error(`${r.id}: ${r.type} needs ${DAYCOUNT[r.type]} days, has ${r.days.length}`);
  r.days.forEach((d, i) => {
    d.n = i + 1;
    d.dow = DAYNAME[r.type][i];
    d.hours = Math.round(hoursOf(d.miles, d.locks) * 100) / 100;
    d.hoursLabel = fmtH(d.hours);
  });
  const last = r.days[r.days.length - 1];
  if (last.hours > 2.01) throw new Error(`${r.id}: last day is ${last.hours} h, too long to be back by 09:30`);
  const first = r.days[0];
  if (first.hours > 6.5) throw new Error(`${r.id}: first day is ${first.hours} h, handover is 14:00`);
  r.miles = Math.round(r.days.reduce((a, d) => a + d.miles, 0) * 10) / 10;
  r.locks = r.days.reduce((a, d) => a + d.locks, 0);
  r.longest = Math.max(...r.days.map((d) => d.hours));
  r.longestLabel = fmtH(r.longest);
  r.nights = site.durations[r.type].nights;
  r.cruiseDays = r.days.filter((d) => d.miles > 0).length;
  r.suited = fleet.filter((b) => b.lengthFt <= r.maxLengthFt).map((b) => b.id);
  const fromPrices = r.suited.map((id) => {
    const b = WB.findBoat(fleet, id);
    return { id, low: b.price[r.type].low, high: b.price[r.type].high };
  });
  r.fromLow = Math.min(...fromPrices.map((p) => p.low));
  r.fromHigh = Math.min(...fromPrices.map((p) => p.high));
}

for (const b of fleet) {
  b.fromWeekLow = b.price.week.low;
  b.suitedRoutes = routes.filter((r) => r.suited.includes(b.id)).map((r) => r.id);
}

for (const d of departures) {
  const r = routes.find((x) => x.id === d.route);
  const dur = site.durations[d.type];
  if (r.type !== d.type) throw new Error(`departure ${d.start}: route ${r.id} is a ${r.type}, not a ${d.type}`);
  if (WB.weekday(d.start) !== dur.startDay) throw new Error(`departure ${d.start} is not a ${dur.startName}`);
  d.end = WB.addDays(d.start, dur.nights);
  d.season = WB.seasonFor(site, d.start, dur.nights);
  d.from = d.season === 'high' ? r.fromHigh : r.fromLow;
  d.routeName = r.name;
}

/* ---------- helpers for the pages ---------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function webpSize(file) {
  const b = fs.readFileSync(file);
  const kind = b.toString('ascii', 12, 16);
  if (kind === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (kind === 'VP8X') return { w: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), h: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
  if (kind === 'VP8L') return { w: 1 + (b[21] | ((b[22] & 0x3f) << 8)), h: 1 + ((b[22] >> 6) | (b[23] << 2) | ((b[24] & 0xf) << 10)) };
  throw new Error('not webp: ' + file);
}
const variants = (name) =>
  fs.readdirSync(path.join(ROOT, 'img'))
    .map((f) => new RegExp(`^${name}-(\\d+)\\.webp$`).exec(f))
    .filter(Boolean)
    .map((m) => Number(m[1]))
    .sort((a, b) => a - b);

export function srcset(name) {
  const ws = variants(name);
  if (!ws.length) throw new Error('no image variants for ' + name);
  return ws.map((w) => `img/${name}-${w}.webp ${w}w`).join(', ');
}
export function dims(name) {
  const ws = variants(name);
  const mid = ws[Math.floor(ws.length / 2)];
  return webpSize(path.join(ROOT, 'img', `${name}-${mid}.webp`));
}
/* alt is mandatory; pass '' only for a purely decorative image */
export function img(name, alt, o = {}) {
  if (alt === undefined) throw new Error('image without alt: ' + name);
  const { w, h } = dims(name);
  const mid = variants(name);
  const src = `img/${name}-${mid[Math.floor(mid.length / 2)]}.webp`;
  return `<img${o.cls ? ` class="${o.cls}"` : ''} src="${src}" srcset="${srcset(name)}" sizes="${esc(o.sizes || '100vw')}" width="${w}" height="${h}" alt="${esc(alt)}"${o.eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${o.attrs ? ' ' + o.attrs : ''}>`;
}

const hashOf = (f) => crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, f))).digest('hex').slice(0, 8);
export const asset = (f) => `${f}?v=${hashOf(f)}`;

export const ctx = { site, fleet, routes, departures, WB, esc, img, srcset, dims, asset, fmtH, BASE, ROOT };

/* Cloudflare Pages serves /boats and redirects /boats.html to it (308), so every address this copy
   names, canonical, og:url, sitemap and internal links, is the clean one. */
const clean = (h) => h.replace(/(href|action)="(index|boats|boat|routes|plan|gallery)\.html(?=[?#"])/g, (m, a, n) => `${a}="${n === 'index' ? './' : n}`);

/* ---------- document shell ---------- */
const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; media-src 'self'; connect-src 'self'; form-action 'self' mailto:; base-uri 'none'; object-src 'none'";

const NAV = [
  ['index.html', 'Home'], ['boats.html', 'Boats'], ['routes.html', 'Routes'], ['plan.html', 'Plan and enquire'], ['gallery.html', 'Gallery'],
];

function shell(p) {
  const url = p.file === 'index.html' ? BASE : BASE + p.file.replace(/\.html$/, '');
  const cur = (f) => (f === p.file ? ' aria-current="page"' : '');
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<meta name="theme-color" content="#0a1b19">
${p.file === 'index.html' ? '<meta name="google-site-verification" content="3eEUicYrn6jQ879omto5AQuPLi1-5-p7dmGEGn7CC4Y">\n' : ''}${p.noindex ? '<meta name="robots" content="noindex">\n' : ''}<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${BASE}img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Looking out from under a brick canal bridge along a line of moored narrowboats">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(p.desc)}">
<meta name="twitter:image" content="${BASE}img/og.jpg">
<link rel="icon" href="img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="img/apple-touch-icon.png">
<link rel="preload" href="fonts/cormorant-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/albert-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${p.preload || ''}<link rel="stylesheet" href="${asset('css/style.css')}">
<link rel="stylesheet" href="${asset('css/livery.css')}">
<script src="${asset('js/boot.js')}"></script>
</head>
<body class="${p.bodyClass || ''}">
<a class="skip" href="#main">Skip to the content</a>
<header class="bar">
  <a class="bar__mark" href="index.html" aria-label="${esc(site.name)}, home">WITHYBED</a>
  <button class="bar__menu" type="button" aria-haspopup="dialog" aria-label="Open the menu" data-menu-open>
    <span class="bar__bars" aria-hidden="true"><i></i><i></i></span>
  </button>
</header>
<dialog class="menu" aria-label="Site menu" data-menu>
  <div class="menu__in">
    <button class="menu__close" type="button" aria-label="Close the menu" data-menu-close>
      <span class="bar__bars bar__bars--x" aria-hidden="true"><i></i><i></i></span>
    </button>
    <nav aria-label="Main">
      <ul class="menu__list">
${NAV.map(([f, t]) => `        <li><a href="${f}"${cur(f)}>${t}</a></li>`).join('\n')}
      </ul>
    </nav>
    <p class="menu__addr">${site.address.slice(0, 3).join(', ')}<br><a href="mailto:${site.email}">${site.email}</a><br><a href="tel:${site.phoneHref}">${site.phone}</a></p>
  </div>
</dialog>
<main id="main">
${p.main}
</main>
<footer class="foot">
  <div class="foot__grid">
    <div class="foot__brand">
      <p class="foot__mark">WITHYBED</p>
      <p>Narrowboat holidays on the Oxford Canal. ${site.address.join(', ')}.</p>
    </div>
    <nav aria-label="Footer" class="foot__nav">
      <ul>
${NAV.map(([f, t]) => `        <li><a href="${f}">${t}</a></li>`).join('\n')}
      </ul>
    </nav>
    <div class="foot__contact">
      <p><a href="mailto:${site.email}">${site.email}</a><br><a href="tel:${site.phoneHref}">${site.phone}</a></p>
      <p>${site.hours.map((h) => `${h.days}, ${h.open}`).slice(0, 2).join('<br>')}<br><span class="dim">April to October</span></p>
    </div>
  </div>
  <p class="foot__legal">© 2026 ${esc(site.name)}. Prices are in pounds sterling and include VAT. Every hire starts at ${site.handover} and ends by ${site.returnBy}.</p>
</footer>
${(p.scripts || []).map((s) => `<script src="${asset(s)}" defer></script>`).join('\n')}
</body>
</html>
`;
}

/* ---------- data files for the browser ---------- */
const slim = (r) => ({
  id: r.id, name: r.name, type: r.type, nights: r.nights, miles: r.miles, locks: r.locks, longest: r.longest,
  maxLengthFt: r.maxLengthFt, maxLengthWhy: r.maxLengthWhy, summary: r.summary, best: r.best, photo: r.photo,
  suited: r.suited, days: r.days.map((d) => ({ n: d.n, dow: d.dow, from: d.from, to: d.to, miles: d.miles, locks: d.locks, hours: d.hours, note: d.note || '' })),
  stops: r.stops,
});
const fleetJson = fleet.map((b) => {
  const ws = variants(b.image);
  const { w, h } = dims(b.image);
  return { ...b, srcset: srcset(b.image), src: `img/${b.image}-${ws[Math.floor(ws.length / 2)]}.webp`, w, h };
});
fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
const write = (f, o) => fs.writeFileSync(path.join(ROOT, 'data', f), JSON.stringify(o, null, 1) + '\n');
write('site.json', site);
write('fleet.json', fleetJson);
write('routes.json', routes.map(slim));

/* ---------- livery swatches: one rule per colour, so no inline style is ever needed ---------- */
const swatches = [...new Set(fleet.flatMap((b) => b.livery.map((x) => x.slice(1))))].sort();
fs.writeFileSync(path.join(ROOT, 'css', 'livery.css'), `/* generated by tools/build.mjs from the fleet's livery colours */\n${swatches.map((s) => `.sw[data-sw="${s}"]{background:#${s}}`).join('\n')}\n`);

/* ---------- write ---------- */
const out = pages(ctx);
for (const p of out) {
  fs.writeFileSync(path.join(ROOT, p.file), clean(shell(p)));
  console.log('wrote', p.file, Math.round(fs.statSync(path.join(ROOT, p.file)).size / 1024) + 'K');
}
console.log(`routes ${routes.length}, boats ${fleet.length}, departures ${departures.length}`);
for (const r of routes) console.log(`  ${r.id.padEnd(28)} ${r.type.padEnd(8)} ${String(r.miles).padStart(5)} mi ${String(r.locks).padStart(3)} locks, longest ${r.longestLabel}, ${r.suited.length} boats, from ${WB.money(r.fromLow)}`);
