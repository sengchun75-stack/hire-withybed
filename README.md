# Withybed Narrowboats

A static website for a narrowboat hire business on the Oxford Canal: six boats, eight routes, a price calculator, a route explorer and boat filters, all running in the browser. No build step is needed to serve it; no backend; nothing is loaded from a third party.

- Live: https://hire-withybed.pages.dev/
- `tools/data-source.mjs` is the single source of every price, boat and route. `node tools/build.mjs` regenerates the pages and the three data files; `node tools/check.mjs` runs the static checks (the same step CI runs).
- `IMAGE-CREDITS.md` lists every photograph and clip (all Pexels, free to use). `LICENSES.md` lists every library and font with its licence. `DESIGN.md` records the design decisions.
- Deploy: Cloudflare Pages, no build command, output directory = repository root. `_headers` carries the Content-Security-Policy and the other security headers.
