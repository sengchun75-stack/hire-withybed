# Licences

Everything this site loads at runtime is served from this folder. Nothing is fetched from a CDN, a font host or any other third party.

## Libraries (vendored in `js/vendor/`, exact versions)

| File | Library | Version | Licence | Notice |
|---|---|---|---|---|
| `gsap-3.15.0.min.js` | GSAP | 3.15.0 | GreenSock Standard "no charge" licence, https://gsap.com/standard-license | `js/vendor/LICENSE-gsap.txt`; the licence header is kept at the top of the file |
| `lenis-1.3.27.min.js` | Lenis (darkroom.engineering) | 1.3.27 | MIT | `js/vendor/LICENSE-lenis.txt`; the file is unchanged except that its trailing `sourceMappingURL` comment is removed, because the map is not shipped |

**GSAP is not MIT.** Its standard licence allows free use on a commercial client website, and forbids using GSAP inside a product that competes with Webflow-style visual animation builders. A narrowboat hire site is inside the terms. If this template is ever resold as a builder, re-read the licence first.

### Tried and removed

- **GSAP ScrollTrigger 3.15.0** was in the first build. It writes a `style=""` attribute while it measures the page, which `style-src 'self'` refuses and reports on every refresh. Removed; the one thing it did (a slow drift of the hero photograph) is done with the CSS `translate` property.
- **SplitType 0.3.4** (ISC) was in the first build. The word spans it creates carry `style="display: inline-block"` attributes, which the same policy blocks. Replaced by a twelve-line word splitter in `js/home.js`.
- **Three.js** was not needed: the water effect in `js/hero-gl.js` is one raw WebGL2 fragment shader. Its caustic function is written after the widely shared tileable water-caustic fragment shader originally by Joltz0r and Dave Hoskins on Shadertoy; the implementation here is rewritten and guarded against NaN, and is not a copy of any asset.

## Fonts (self-hosted in `fonts/`, latin subset, variable)

| File | Family | Licence | Notice |
|---|---|---|---|
| `cormorant-latin-wght-normal.woff2`, `cormorant-latin-wght-italic.woff2` | Cormorant, via `@fontsource-variable/cormorant` 5.3.0 | SIL Open Font Licence 1.1 | `fonts/LICENSE-cormorant.txt` |
| `albert-sans-latin-wght-normal.woff2` | Albert Sans, via `@fontsource-variable/albert-sans` 5.3.0 | SIL Open Font Licence 1.1 | `fonts/LICENSE-albert-sans.txt` |

Neither family is used by any other template in this repository.

## Build tools (not shipped, not loaded by any page)

- `sharp` 0.33.5 (Apache-2.0) grades and resizes the photographs: `tools/grade.mjs`.
- `ffmpeg` 20181217 from `@ffmpeg-installer/ffmpeg` 1.1.0 (the binary is LGPL-2.1) encodes the three clips. The clips themselves are not covered by the LGPL.
- `playwright-core` 1.49.1 (Apache-2.0) drives the behaviour tests.

## Photographs and clips

See `IMAGE-CREDITS.md`.
