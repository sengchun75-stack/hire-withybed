/* WITHYBED — prints the head of every page: title, description, canonical, share card.
 * usage: node tools/check-meta.mjs   (check.mjs enforces the rules; this is for reading)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const f of ['index.html', 'boats.html', 'boat.html', 'routes.html', 'plan.html', 'gallery.html']) {
  const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const g = (re) => (h.match(re) || [])[1] || '(missing)';
  console.log(f);
  console.log('  title      ', g(/<title>([^<]*)<\/title>/));
  console.log('  description', g(/name="description" content="([^"]*)"/));
  console.log('  canonical  ', g(/rel="canonical" href="([^"]*)"/));
  console.log('  og:image   ', g(/property="og:image" content="([^"]*)"/));
}
