# UI Generation Rules (DARK engine)
Before writing, editing, or restyling any front-end UI in this folder:
1. This project is DARK-engine (see .claude/engine-mode). Do NOT invoke
   `frontend-design`, `impeccable`, or `web-design-guidelines`, and do
   NOT read DESIGN-SYSTEM/DESIGN.md except §2 (the over-constraint rule)
   and §6 (the accessibility and motion floor, the no-hand-geometry rule,
   and the ask-before-generating gate): those two are hard constraints here too.
2. Read this folder's own DESIGN.md AND
   C:\Users\sengc\OneDrive\Desktop\Company\DESIGN-SYSTEM\DARK.md
   (the company-wide dark taste system; absolute path because this template
   sits inside the shared Website-Collection repo). Treat both as hard constraints.
3. Reach for the real open-source stack named in DARK.md §5 by default
   rather than hand-rolling the effect. Compose from real licensed
   scaffolding; original execution and content on top.
4. Check licensing as each dependency or asset is added (DARK.md §2) and
   record it in LICENSES.md / IMAGE-CREDITS.md.
5. Before calling any UI work done: take real screenshots (desktop + mobile)
   and check them against DARK.md §4 directly against the image (DARK.md §6).

Site-specific rules
- The pages are generated: edit tools/data-source.mjs, tools/pages.mjs, then run
  `node tools/build.mjs` and `node tools/check.mjs`. Do not hand-edit the .html files or data/*.json.
- Strict CSP, zero runtime third parties: no inline script, style or handler; no CDN; no external font.
  Libraries that write style attributes (ScrollTrigger, SplitType) were tried and removed.
- No backend, no payment fields. The enquiry is a mailto: link built in the browser.
- No photograph is used in two sections except a boat's own photo (see IMAGE-CREDITS.md).
