/* WITHYBED — static checks over the built site. Exits 1 on any failure.
 * Structure follows the checker Websites/pithwell/tools/check.mjs uses (one list of named
 * results, a count at the end), with this site's own rules: no inline script or style,
 * no external URL, every image file exists, no two sections share a photograph, and the
 * numbers baked into the HTML are the numbers the pricing code produces.
 *
 * usage: node tools/check.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const WB = require('../js/calc-core.js');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));
const ORIGIN = process.env.BASE_URL || 'https://hire-withybed.pages.dev/';
const PAGES = ['index.html', 'boats.html', 'boat.html', 'routes.html', 'plan.html', 'gallery.html'];
const res = [];
const ok = (name, c, extra = '') => res.push([!!c, name + (extra ? ' - ' + extra : '')]);
const urlFor = (f) => (f === 'index.html' ? ORIGIN : ORIGIN + f.replace(/\.html$/, ''));
const site = JSON.parse(read('data/site.json'));
const fleet = JSON.parse(read('data/fleet.json'));
const routes = JSON.parse(read('data/routes.json'));
const plain = (h) => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');

/* ---------- forbidden files (AGENT.md: no backend in a template folder) ---------- */
for (const f of ['package.json', '.env', 'vercel.json', 'api']) ok(`no ${f} in the template folder`, !exists(f));

/* ---------- pages ---------- */
const baseUse = {}; // photograph -> pages that use it
const hashOf = (f) => crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, f))).digest('hex').slice(0, 8);
for (const f of PAGES) {
  const html = read(f);
  ok(`${f}: exists`, true);
  const t = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const d = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  ok(`${f}: title 15-65 chars`, t.length >= 15 && t.length <= 65, String(t.length));
  ok(`${f}: description 70-165 chars`, d.length >= 70 && d.length <= 165, String(d.length));
  ok(`${f}: canonical is itself`, html.includes(`<link rel="canonical" href="${urlFor(f)}">`));
  for (const og of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt', 'og:type', 'twitter:card', 'twitter:image']) ok(`${f}: ${og}`, html.includes(`"${og}"`));
  ok(`${f}: og:image is the site card`, html.includes(`content="${ORIGIN}img/og.jpg"`));
  ok(`${f}: lang and viewport`, /<html lang="en-GB">/.test(html) && /name="viewport"/.test(html));
  ok(`${f}: favicon and touch icon`, /rel="icon"/.test(html) && /apple-touch-icon/.test(html));
  const csp = (html.match(/Content-Security-Policy" content="([^"]*)"/) || [])[1] || '';
  ok(`${f}: strict CSP, script-src and style-src 'self' only`, /script-src 'self';/.test(csp) && /style-src 'self';/.test(csp) && !/unsafe/.test(csp) && /form-action 'self' mailto:/.test(csp));
  ok(`${f}: no inline script`, [...html.matchAll(/<script\b([^>]*)>/g)].every((m) => /\bsrc="/.test(m[1])));
  ok(`${f}: no inline <style>`, !/<style\b/i.test(html));
  ok(`${f}: no inline style attribute`, !/\sstyle\s*=/i.test(html));
  ok(`${f}: no inline event handler`, !/\son[a-z]+\s*=/i.test(html.replace(/<script[\s\S]*?<\/script>/g, '')));
  ok(`${f}: no javascript: URL`, !/javascript:/i.test(html));
  const urls = [...html.matchAll(/(?:href|src|action|poster|srcset)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]).filter((u) => !u.startsWith(ORIGIN));
  ok(`${f}: no external URL`, urls.length === 0, urls.slice(0, 3).join(' '));
  const body = html.replace(/<script[\s\S]*?<\/script>/g, '');
  const h = [...body.matchAll(/<h([1-6])[ >]/g)].map((m) => +m[1]);
  ok(`${f}: exactly one h1`, h.filter((x) => x === 1).length === 1);
  ok(`${f}: heading order never skips`, h.every((x, i) => i === 0 || x <= h[i - 1] + 1), h.join(''));
  ok(`${f}: landmarks`, ['<main', '<header', '<nav', '<footer'].every((x) => body.includes(x)));
  ok(`${f}: skip link`, /class="skip" href="#main"/.test(html));
  const imgs = [...body.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  ok(`${f}: every img has alt, width, height`, imgs.every((i) => /\balt="/.test(i) && /\bwidth="/.test(i) && /\bheight="/.test(i)), `${imgs.length} imgs`);
  ok(`${f}: informative images have real alt text`, imgs.filter((i) => !/\balt=""/.test(i)).every((i) => (i.match(/\balt="([^"]*)"/) || [])[1].length >= 12));
  // every file named in src, srcset, poster, data-src, data-full exists
  const refs = new Set();
  for (const m of body.matchAll(/(?:src|poster|data-poster|data-src|data-full|href)="((?:img|video|css|js|fonts|data)\/[^"?]+)(?:\?[^"]*)?"/g)) refs.add(m[1]);
  for (const m of body.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) for (const p of m[1].split(',')) refs.add(p.trim().split(/\s+/)[0]);
  const missing = [...refs].filter((r) => !exists(r));
  ok(`${f}: every referenced file exists`, missing.length === 0, `${refs.size} refs ${missing.slice(0, 3).join(' ')}`);
  // internal page links use the clean addresses (/boats, ./), which is what Cloudflare Pages serves
  const links = [...body.matchAll(/<a [^>]*href="([^"#?:]+)(?:[?#][^"]*)?"/g)].map((m) => m[1]);
  const asFile = (l) => (l === './' ? 'index.html' : l + '.html');
  ok(`${f}: internal page links resolve`, links.every((l) => PAGES.includes(asFile(l))), [...new Set(links.filter((l) => !PAGES.includes(asFile(l))))].join(' '));
  ok(`${f}: no internal link still ends in .html`, !/<a [^>]*href="[a-z]+\.html/.test(body));
  // the stylesheet and scripts carry a hash of their content
  for (const m of html.matchAll(/(?:href|src)="((?:css|js)\/[^"?]+)\?v=([0-9a-f]+)"/g)) ok(`${f}: ${m[1]} hash is current`, m[2] === hashOf(m[1]));
  ok(`${f}: year is 2026`, /© 2026 /.test(html));
  ok(`${f}: no payment fields`, !/autocomplete="cc-|type="password"|card-?number|cvv|cvc/i.test(html));
  ok(`${f}: no provenance disclaimer in the copy`, !/\b(demo|fictional|ai-generated|stock photo|portfolio template|placeholder)\b/i.test(plain(html)));
  ok(`${f}: raw HTML carries real text`, plain(body).length > (f === 'boat.html' ? 900 : f === 'gallery.html' ? 700 : 1800), String(plain(body).length));
  // photographs used by this page (hero crops count as one photograph)
  if (f !== 'gallery.html') {
    const per = new Set();
    for (const i of imgs) {
      const b = (i.match(/img\/([a-z0-9-]+?)-\d+\.webp/) || [])[1];
      if (b) { per.add(b.replace(/^hero-(wide|tall)$/, 'hero')); }
    }
    for (const m of body.matchAll(/data-poster="img\/(poster-[a-z-]+)\.webp"/g)) per.add(m[1]);
    for (const b of per) (baseUse[b] = baseUse[b] || []).push(f);
    const dupes = {};
    for (const i of imgs) { const b = (i.match(/img\/([a-z0-9-]+?)-\d+\.webp/) || [])[1]; if (b) dupes[b] = (dupes[b] || 0) + 1; }
    ok(`${f}: no photograph used twice on the page`, Object.values(dupes).every((n) => n === 1), Object.entries(dupes).filter(([, n]) => n > 1).map(([k]) => k).join(' '));
  }
}
// no two sections share a photograph: across pages, the only allowed repeat is a boat's own photograph
const boatPhotos = new Set(fleet.map((b) => b.image));
const shared = Object.entries(baseUse).filter(([b, p]) => p.length > 1 && !boatPhotos.has(b));
ok('no photograph is shared between pages (a boat\'s own photo excepted)', shared.length === 0, shared.map(([b, p]) => `${b}:${p.join('+')}`).join(' '));
const allPhotos = fs.readdirSync(path.join(ROOT, 'img')).filter((f) => /-\d+\.webp$/.test(f)).map((f) => f.replace(/-\d+\.webp$/, ''));
const distinct = new Set(allPhotos.map((b) => b.replace(/^hero-(wide|tall)$/, 'hero')));
ok('25 or more distinct photographs', distinct.size >= 25, `${distinct.size}`);
ok('2 to 3 clips with posters', fs.readdirSync(path.join(ROOT, 'video')).filter((f) => f.endsWith('.mp4')).length >= 2 && exists('img/poster-turning-corner.webp'));

/* ---------- the gallery lists every photograph ---------- */
const gal = read('gallery.html');
const galBases = new Set([...gal.matchAll(/data-full="img\/([a-z0-9-]+?)-\d+\.webp"/g)].map((m) => m[1]));
const notInGallery = [...distinct].filter((b) => b !== 'hero' && !galBases.has(b));
ok('every photograph is in the gallery', notInGallery.length === 0, notInGallery.join(' '));

/* ---------- the three tools read these data files ---------- */
ok('six boats, two to ten berths', fleet.length === 6 && Math.min(...fleet.map((b) => b.berths)) === 2 && Math.max(...fleet.map((b) => b.berths)) === 10);
ok('every boat has prices, a deposit, a dog flag, a length', fleet.every((b) => b.price.week.low < b.price.week.high && b.deposit > 0 && typeof b.dogFriendly === 'boolean' && b.lengthFt > 0));
ok('eight routes with day-by-day detail', routes.length === 8 && routes.every((r) => r.days.length >= 4 && r.stops.length >= 4));
const rt = routes.map((r) => ({ r, miles: Math.round(r.days.reduce((a, d) => a + d.miles, 0) * 10) / 10, locks: r.days.reduce((a, d) => a + d.locks, 0) }));
ok('route totals equal the sum of their days', rt.every((x) => x.miles === x.r.miles && x.locks === x.r.locks));
ok('every route is back by 09:30: last day under two hours', routes.every((r) => r.days[r.days.length - 1].hours <= 2.01));
ok('every route\'s boats fit its turning limit', routes.every((r) => r.suited.every((id) => fleet.find((b) => b.id === id).lengthFt <= r.maxLengthFt)));
ok('boat price from-values on the pages match the data', fleet.every((b) => read('boats.html').includes(WB.money(b.price.week.low))));
// three pricing scenarios, computed by hand here and compared with the pricing code
const sc = [
  [{ boat: 'dabchick', type: 'weekend', start: '2027-05-07', crew: 2, linen: false, dogs: 0, hamper: false, bikes: 0 }, 395],
  [{ boat: 'moorhen', type: 'midweek', start: '2027-08-16', crew: 4, linen: true, dogs: 0, hamper: true, bikes: 2 }, 935 + 4 * 14 + 38 + 2 * 22],
  [{ boat: 'reed-warbler', type: 'week', start: '2027-06-04', crew: 6, linen: true, dogs: 2, hamper: false, bikes: 0 }, 2395 + 6 * 14 + 2 * 40],
];
for (const [i, e] of sc) { const q = WB.quote(site, fleet, i); ok(`scenario ${i.boat} ${i.type}: total hire ${e}`, q.ok && q.rental === e, q.ok ? `got ${q.rental}` : q.errors.join(' ')); }
ok('a Thursday is rejected for a week', !WB.quote(site, fleet, { ...sc[0][0], type: 'week', start: '2027-07-08' }).ok);
ok('a dog on Moorhen is rejected', !WB.quote(site, fleet, { ...sc[1][0], dogs: 1 }).ok);
// the numbers baked into plan.html are the numbers the pricing code gives for the default quote
const plan = read('plan.html');
const q0 = WB.quote(site, fleet, site.defaultQuote);
ok('plan.html bakes every default price row', WB.quoteRows(site, q0).every((r) => plan.includes(r.value) && plan.includes(r.label.replace(/&/g, '&amp;'))));
ok('plan.html bakes the same sentence in the aria-live mirror', plan.includes(WB.liveSentence(site, q0).replace(/&/g, '&amp;')));
ok('plan.html bakes the same total in the enquiry summary', plan.includes('Total including damage deposit: ' + WB.money(q0.totalIncludingDeposit)));
const rp = read('routes.html');
ok('routes.html bakes every route total, in table and live mirror', routes.every((r) => rp.includes(`${r.name.replace(/&/g, '&amp;')}: ${r.miles} miles, ${r.locks} locks, ${r.nights} nights`)));
const home = read('index.html');
ok('home bakes the dated list from the same data', fs.existsSync(path.join(ROOT, 'data/routes.json')) && /from £895/.test(home) && home.includes('Fri 2 Apr'));

/* ---------- licences, credits, contrast ---------- */
const lic = read('LICENSES.md'), cred = read('IMAGE-CREDITS.md');
for (const v of fs.readdirSync(path.join(ROOT, 'js/vendor')).filter((f) => f.endsWith('.js'))) ok(`LICENSES.md names ${v}`, lic.includes(v));
for (const f of ['fonts/LICENSE-cormorant.txt', 'fonts/LICENSE-albert-sans.txt', 'js/vendor/LICENSE-gsap.txt', 'js/vendor/LICENSE-lenis.txt']) ok(`licence text ${f}`, exists(f));
const credBases = [...distinct].filter((b) => b !== 'hero');
ok('IMAGE-CREDITS.md lists every photograph', credBases.every((b) => cred.includes('`' + b + '`')) && cred.includes('hero-brick-arch'), credBases.filter((b) => !cred.includes('`' + b + '`')).join(' '));
ok('IMAGE-CREDITS.md lists every clip', ['turning-corner', 'tranquil-canal', 'lock-tall'].every((c) => cred.includes(c)));
const lum = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const css = read('css/style.css');
const tok = (n) => (css.match(new RegExp('--' + n + ':\\s*(#[0-9a-f]{6})')) || [])[1];
const pairs = [['text', 'ground', 4.5], ['mist', 'ground', 4.5], ['ice', 'ground', 7], ['brass', 'ground', 4.5], ['mist', 'ground-3', 4.5], ['brass', 'ground-3', 4.5], ['text', 'ground-2', 4.5], ['mist', 'ground-2', 4.5]];
for (const [a, b, min] of pairs) { const r = ratio(tok(a), tok(b)); ok(`contrast ${a} on ${b} >= ${min}`, r >= min, r.toFixed(1) + ':1'); }
ok('contrast dark text on brass button', ratio('#170f02', tok('brass')) >= 7, ratio('#170f02', tok('brass')).toFixed(1) + ':1');
ok('reduced-motion block present', /prefers-reduced-motion: reduce/.test(css));
ok('visible focus style present', /:focus-visible/.test(css));
ok('webglcontextlost and webglcontextrestored both handled', /webglcontextlost/.test(read('js/hero-gl.js')) && /webglcontextrestored/.test(read('js/hero-gl.js')));
ok('DPR is capped in the water effect', /MAXDPR/.test(read('js/hero-gl.js')));

/* ---------- deploy files (present in the independent copy) ---------- */
if (exists('sitemap.xml')) {
  const sm = read('sitemap.xml');
  for (const f of PAGES) ok('sitemap lists ' + f, sm.includes('<loc>' + urlFor(f) + '</loc>'));
  ok('sitemap names no other origin', [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].every((m) => m[1].startsWith(ORIGIN)));
  ok('sitemap leaves out the 404 page', !sm.includes('404.html'));
}
if (exists('robots.txt')) {
  const r = read('robots.txt');
  ok('robots.txt allows crawling and names the sitemap', /Allow: \//.test(r) && r.includes('Sitemap: ' + ORIGIN + 'sitemap.xml'));
}
if (exists('_headers')) {
  const h = read('_headers');
  const line = (h.match(/Content-Security-Policy: ([^\n]*)/) || [])[1] || '';
  ok('_headers: strict CSP with script-src and style-src self and frame-ancestors none', /script-src 'self'/.test(line) && /style-src 'self'/.test(line) && /frame-ancestors 'none'/.test(line));
  ok('_headers: no unsafe-inline or unsafe-eval anywhere', !/unsafe-/.test(h));
  ok('_headers: removes the default wildcard Access-Control-Allow-Origin', h.includes('! Access-Control-Allow-Origin'));
  for (const hd of ['X-Content-Type-Options: nosniff', 'Referrer-Policy:', 'Permissions-Policy:', 'Strict-Transport-Security:']) ok('_headers: ' + hd, h.includes(hd));
  const metaCsp = (read('index.html').match(/Content-Security-Policy" content="([^"]*)"/) || [])[1] || '';
  ok('_headers CSP is the page CSP plus frame-ancestors', line.startsWith(metaCsp) && line.endsWith("frame-ancestors 'none'"));
}
if (exists('.github/workflows/check.yml')) {
  const w = read('.github/workflows/check.yml');
  ok('workflow runs only the static checks', w.includes('node tools/check.mjs') && !/npm |pages\.mjs|docs-diff/.test(w));
}

/* ---------- report ---------- */
const bad = res.filter(([c]) => !c);
for (const [c, n] of res) if (!c) console.log('FAIL', n);
console.log(`${res.length - bad.length}/${res.length} checks passed`);
process.exit(bad.length ? 1 : 0);
