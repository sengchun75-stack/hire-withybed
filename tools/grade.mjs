/* WITHYBED — grade and export every photograph and the three clips.

   One shared black and white point for the whole site, so photographs and the
   page read as one surface: the black point is lifted into the page ground
   (--ground #0a1b19) and the white point is pulled to a faintly cool ice
   (#eef4f0). Saturation comes down a tenth; the reds and greens of the narrowboat
   paint stay legible, they just stop competing with the brass accent.

   The full-size originals live outside the repo on the build machine and are
   not shipped. This script is kept here as the record of how every file in
   img/ and video/ was made.

     SHARP_DIR=<dir containing node_modules/sharp> RAW=<originals dir> \
     FFMPEG=<path to ffmpeg> node tools/grade.mjs [--video]
*/
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'img');
const VID = path.join(HERE, '..', 'video');
const RAW = process.env.RAW;
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const require = createRequire(path.join(process.env.SHARP_DIR || HERE, 'noop.js'));
const sharp = require('sharp');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(VID, { recursive: true });

const BLACK = [10, 27, 25];
const WHITE = [229, 238, 233]; // a little lower than ice, so a bright sky no longer clips to white
const gain = BLACK.map((b, i) => (WHITE[i] - b) / 255);

/* The grade, in three steps that every photograph and clip poster shares:
   1. saturation down about a seventh;
   2. one black point (the page ground) and one white point (a faint cool ice);
   3. a soft-light wash of canal-water teal over the whole frame, so the colour temperature of
      thirty photographs taken by thirty people, in different light, drifts the same way. */
async function grade(img) {
  const { data, info } = await img
    .modulate({ saturation: 0.86, brightness: 1.07 })
    .linear(gain, BLACK)
    .sharpen({ sigma: 0.7, m1: 0.6, m2: 0.8 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } }).composite([
    { input: { create: { width: info.width, height: info.height, channels: 4, background: { r: 29, g: 74, b: 68, alpha: 0.10 } } }, blend: 'soft-light' },
  ]);
}

const LANDSCAPE = [640, 960, 1280, 1920];
const PORTRAIT = [480, 960, 1440];

async function exportPhoto(name, file, opts = {}) {
  const src = path.join(RAW, file || name + '.jpg');
  const meta = await sharp(src).metadata();
  let base = sharp(src).rotate();
  if (opts.crop) base = base.extract(opts.crop);
  const buf = await base.toBuffer();
  const m = await sharp(buf).metadata();
  const widths = opts.widths || (m.width >= m.height ? LANDSCAPE : PORTRAIT);
  const sizes = [];
  for (const w of widths) {
    const dest = path.join(OUT, `${opts.out || name}-${w}.webp`);
    await (await grade(sharp(buf).resize({ width: Math.min(w, m.width) })))
      .webp({ quality: opts.q || 72, effort: 5 })
      .toFile(dest);
    sizes.push(`${w}:${Math.round(fs.statSync(dest).size / 1024)}K`);
  }
  console.log(name.padEnd(26), `${meta.width}x${meta.height}`, sizes.join(' '));
}

const PHOTOS = [
  'caen-hill-locks', 'sunny-reflections', 'calm-canal-cruising', 'towpath-green',
  'historic-wharf-buildings', 'lock-barge', 'lock-brick', 'moored-in-trees',
  'autumn-canal', 'blue-boat-riverside', 'aqueduct-crossing', 'lift-bridge',
  'stone-inn-moorings', 'canalside-pub', 'dusk-moorings', 'painted-narrowboat',
  'bridge-and-bicycle', 'bridge-and-boat', 'swan-and-cygnets', 'heron-in-reeds',
  'meadow-and-river', 'wisteria-pub', 'wildflower-field', 'steering-under-bridge',
  'cockpit-and-tiller', 'thames-reach', 'summer-brick-wharf', 'frozen-canal',
  'open-countryside-canal', 'stove-cabin',
];

if (!process.argv.includes('--video')) {
  // the hero: one tall original, two compositions. Wide for desktop, tall for phones.
  await exportPhoto('hero', 'hero-brick-arch.jpg', {
    out: 'hero-wide', crop: { left: 0, top: 1700, width: 3333, height: 2083 }, widths: [1280, 1920, 2560], q: 76,
  });
  await exportPhoto('hero', 'hero-brick-arch.jpg', {
    out: 'hero-tall', crop: { left: 0, top: 700, width: 3333, height: 4166 }, widths: [640, 960, 1280], q: 76,
  });
  // two tall originals head a page in a wide frame: ship them as the wide crop the frame shows, not as a tall file cropped by CSS
  await exportPhoto('caen-hill-locks', undefined, { crop: { left: 0, top: 900, width: 3340, height: 2227 }, widths: [640, 960, 1280, 1920] });
  await exportPhoto('dusk-moorings', undefined, { crop: { left: 0, top: 2250, width: 3333, height: 2222 }, widths: [640, 960, 1280, 1920] });
  for (const n of PHOTOS.filter((x) => !['caen-hill-locks', 'dusk-moorings'].includes(x))) await exportPhoto(n);

  // social card and the hub thumbnail, graded the same way
  const og = sharp(path.join(RAW, 'hero-brick-arch.jpg'))
    .extract({ left: 0, top: 1750, width: 3333, height: 1750 })
    .resize(1200, 630, { fit: 'cover' });
  await (await grade(og)).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, 'og.jpg'));
  console.log('og.jpg', Math.round(fs.statSync(path.join(OUT, 'og.jpg')).size / 1024) + 'K');
}

if (process.argv.includes('--video')) {
  const lut = BLACK.map((b, i) => `${['r', 'g', 'b'][i]}='clip(val*${gain[i].toFixed(4)}+${b},0,255)'`).join(':');
  const vf = (scale) => `${scale},eq=saturation=0.88,colorbalance=rs=-0.04:gs=0.02:bs=0.05:rm=-0.05:gm=0.02:bm=0.05,format=rgb24,lutrgb=${lut},format=yuv420p`;
  const clips = [
    { name: 'turning-corner', src: 'clip-turning-corner.mp4', ss: 0, t: 9.2, scale: 'scale=1280:720', poster: 4.0, pw: 1280 },
    { name: 'tranquil-canal', src: 'clip-tranquil-canal.mp4', ss: 0, t: 12, scale: 'scale=1280:720', poster: 5.0, pw: 1280 },
    { name: 'lock-tall', src: 'clip-lock-tall.mp4', ss: Number(process.env.LOCK_SS || 64), t: 22, scale: 'scale=540:960', poster: 8.0, pw: 540 },
  ];
  for (const c of clips) {
    const input = path.join(RAW, c.src);
    const mp4 = path.join(VID, `${c.name}.mp4`);
    const common = ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(c.ss), '-t', String(c.t), '-i', input, '-an', '-vf', vf(c.scale)];
    let r = spawnSync(FFMPEG, [...common, '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-profile:v', 'main', '-movflags', '+faststart', mp4], { stdio: 'inherit' });
    const tmp = path.join(VID, `_${c.name}.png`);
    spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(c.ss + c.poster), '-i', input, '-frames:v', '1', tmp], { stdio: 'inherit' });
    // the poster is the same frame, graded as a photograph (not through the lut twice)
    await (await grade(sharp(tmp).resize({ width: c.pw }))).webp({ quality: 74, effort: 5 }).toFile(path.join(OUT, `poster-${c.name}.webp`));
    fs.unlinkSync(tmp);
    console.log(c.name, 'mp4', Math.round(fs.statSync(mp4).size / 1024) + 'K', '');
  }
}
