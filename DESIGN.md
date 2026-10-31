This project inherits ../../../../DESIGN-SYSTEM/DARK.md (verified to resolve from this folder). Below are this project's own tokens and brand-specific rules.

# Withybed Narrowboats — design

## 1. Overview and identity

A family-run narrowboat hire base on the Oxford Canal at Lower Heyford, Oxfordshire: six boats from 45 ft for two to 70 ft for ten, hired by the week, the weekend or the midweek, 5 March to 19 November 2027. The audience is a couple or a family choosing a first or second canal holiday, usually on a phone in the evening, who needs a price, a route they can believe and a boat that fits the dog.

Tone: calm, specific, unhurried. The page is one continuous body of deep water; photographs rise out of it and sink back into it. One warm accent, brass, appears only where a decision is made (a price, a button, the chosen boat).

Three working tools carry the business: a **price calculator** (`plan.html`), a **route explorer** (`routes.html`) and **boat filters** (`boats.html`). All three run in the browser from `data/*.json`. Every number on the site comes from `tools/data-source.mjs`.

The business is invented. Name checked 2026-10-31: no trading narrowboat company called Withybed turned up; "Heronsmead" was rejected because a dissolved Companies House entry of that name exists. The address, postcode and telephone number are invented (the telephone is in the Ofcom drama range), and the email is a reserved placeholder.

## 2. Reference DNA

**Primary: "Deep Blue", a freediving-school landing page by Alina Alekseyeva** (Pinterest pin 820358888391835168, https://www.pinterest.com/pin/820358888391835168/). Credited as a reference only: no photograph, copy, name, language or colour is taken. What is taken is composition:

- A full-bleed hero photograph (a diver descending through a lit opening) that darkens smoothly into the page ground with no hard edge. Here: the view out from under a brick canal bridge, the arch standing in for the opening, fading down into the canal-teal ground.
- Two-tier headline over the photo: a light, smaller ghost line above, a heavy small-caps line below, offset left. Here: *Eleven locks from our wharf to Oxford,* over **A WEEK ON THE OXFORD CANAL**, in Cormorant.
- Furniture: a tiny letter-spaced wordmark top left, a two-bar menu icon top right, a thin row of places under the hero, vertical rotated micro-labels on section edges, huge low-contrast ghost words behind sections.
- Asymmetry: narrow offset text columns; a photograph that bleeds off the left (or right) edge while text sits beside it.
- A dated list with one lifted row and a featured photograph with a strip of date, place and price: the home page departures.
- A carousel whose centre card is raised, lighter and carries the one gold accent while neighbours dim and fade at the edges: the fleet.

Not taken: the numbered slider (dropped, it breaks the calm), the pin's exact blue.

**Secondary: real trade sites** (read 2026-10-31; what each shows on its home page, not its whole site):
- **Anglo Welsh** (anglowelsh.co.uk): boats are browsable by bed count, trip length starts at "weekend", and routes are organised by departure base with named rings. *Principle taken:* the booking question starts with party size and length of trip, so the boats filter leads with berths and the calculator leads with type of hire. *Gap filled:* its home page shows no prices.
- **Drifters** (drifters.co.uk): advanced filters name the things people actually decide on (wood burner, pets allowed), and start day is a filter. *Principle taken:* the dog and the stove are first-class facts, not footnotes. *Gap filled:* it shows no miles, locks or day-by-day itineraries on the page read; the route explorer does.

**Quality bar inside this repository:** `estate-ardvren`, `aquarium-pelagia` and `travel-yorimichi`: a real business with facts a visitor can act on, a working tool, 25+ distinct photographs graded to one black point, photography as the layout, one entrance reveal and one signature effect. `aquarium-pelagia/tools/grade.py` is the model for `tools/grade.mjs`.

## 3. Colour

Sampled from the hero photograph (`hero-brick-arch`) and the boats, then written as tokens in `css/style.css`. Measured contrast is against `--ground` unless stated; `tools/check.mjs` recomputes every ratio.

| Token | Hex | Where it comes from | Contrast |
|---|---|---|---|
| `--lock` | #061110 | Lock-gate black: the arch shadow (#160e0b measured in the photo), pulled toward the water | page floor |
| `--ground` | #0a1b19 | The page. Arch-shadow lightness, foliage and water hue (foliage #565e3f, lit water #8d8a7f measured), rotated about 25 degrees toward teal for the reference's slate-teal mood | — |
| `--ground-2` | #102824 | A raised panel: ground lifted one step | — |
| `--ground-3` | #17342f | The lifted card and the featured row | — |
| `--water` | #1d4a44 | Canal water in shade; the schematic line | — |
| `--ice` | #eaf2ed | The lightest water highlight; headings | > 15:1 |
| `--text` | #cfdfd8 | Body copy | > 11:1 |
| `--mist` | #9fbbb2 | Muted teal for labels | 7.6:1 |
| `--brass` | #d1a653 | The one warm accent: brass fittings and the autumn leaf (#543a19 measured in `autumn-canal`, lifted to a visible brass) | 8.4:1 |
| `--cream` | #e8dfc8 | Towpath cream: pull-quotes | — |

Boat liveries (`--sw` swatches, `css/livery.css`) are the traditional paint colours read off the boats themselves: Dabchick green #2f5a3c and cream #e3d9bd; Kingfisher blue #1f4f8a and orange #c9732c; Moorhen black #14211f and oxblood #8f2f26; Reed Warbler green #3c5b34 and maroon #7a2c2c; Grey Heron slate #5d7280; Mute Swan white #d9d4c4 and navy #1c2e4a. They appear only as three-bar swatches, never as UI colour.

All photographs and clip posters share one grade (`tools/grade.mjs`): one black point (#0a1b19, the ground), one white point (#e5eee9, low enough that a bright sky does not clip to paper-white), saturation down about a seventh, and a soft-light wash of canal-water teal (#1d4a44 at 10%) over the whole frame so thirty photographs taken by thirty people drift the same way. The paint reds and greens survive; they just stop competing with brass. The clips go through the same black and white point and a matching teal colour balance in ffmpeg.

## 4. Typography

- **Display: Cormorant** (variable 300–700 plus italic, SIL OFL), self-hosted. A high-contrast editorial serif. Ghost line: italic 300. Heavy line: 700, uppercase, +0.05em tracking, in the role of the reference's small caps. Body: **Albert Sans** (variable, SIL OFL), 1rem on a quiet 1.65 line height.
- Neither family is used by any other template here (checked by grep on 2026-10-31 across 131 templates). Not Inter, Roboto, Arial or Space Grotesk.
- Micro-labels: Albert Sans 600, 0.66–0.8rem, +0.2–0.46em tracking, uppercase.

## 5. Layout and spacing

Twelve columns, `minmax(0, 90px)` tracks, 1.75rem gap, outer tracks that absorb the rest, so a photograph can start at the viewport edge (`grid-column: 1 / 8`) while text sits in columns 9–13. No `100vw`, no horizontal overflow. Text columns are 38em at most and never centred.

Below 1000px the grid becomes a single column: photographs run edge to edge, text keeps the page margin, edge labels disappear. Phones are their own composition: the hero uses a **tall crop** of the same photograph (the arch above, the water below, the headline over the water) instead of squeezing the wide one; the carousel swipes; the departures list becomes stacked rows; the first clip band is not shown.

## 6. Elevation and depth

Depth is made of fades, not shadows: every bleeding photograph has a `mask-image` gradient into the ground on the edge that meets the page. There are no drop shadows and no glass panels. The one raised thing is the centre carousel card (lighter ground, brass title, 1.1rem lift).

## 7. Components and states

- **Hero** — one photograph, two compositions; a WebGL2 canvas over it is the signature effect (below).
- **Dated list** — a row is date range, route, type, "from £", and a details link; one row sits on `--ground-3` and its photograph carries a strip of date, route and price.
- **Fleet carousel** — `role="group"` with `aria-roledescription`, previous and next buttons, arrow-key, Home and End support, swipe, a polite live region ("Kingfisher, 2 of 6"). Neighbouring cards have `tabindex=-1` links; clicking one brings it to the centre.
- **Boat filters** — berths (radio pills), dog-friendly (checkbox), low-season weekly price (range). The list is already in the page; filtering only toggles `hidden`, so no-script users see every boat.
- **Boat page** — drawn from `data/fleet.json` by `js/boat.js` (`boat.html?b=kingfisher`).
- **Route explorer** — radio group of eight routes; each route's panel is baked into the page (miles, locks, nights, longest day, day table, stops, boats that fit its turning limit) and a one-line schematic is drawn in SVG.
- **Price calculator** — boat, type of hire, start date (a list of valid Fridays or Mondays with their season), crew (capped at the boat's berths), extras. Output rows: hire, extras, total hire, booking deposit (25%), balance with its due date, refundable damage deposit, total including the damage deposit. Invalid input explains itself and offers the next valid date.
- **Enquiry** — `mailto:` built with `encodeURIComponent` from an external-script submit handler, plus a copy-to-clipboard fallback and a `mailto:` form action for no-script visitors. No payment fields; nothing is sent by this site.
- **Gallery** — filter chips and a lightbox on a modal `<dialog>` (focus trap and Escape native; arrow keys; focus returns to the thumbnail).
- **States** — `:focus-visible` brass ring on everything interactive; 44px minimum targets; `hidden` for filtered items; `aria-pressed` on chips; `aria-current` on the current menu link.

## 8. One entrance reveal and one signature effect

- **Entrance reveal** — on the home page the headline arrives word by word (GSAP, `yPercent` and opacity) over a hero that eases from 107% to 100%. Elsewhere a section fades in once (an `IntersectionObserver` adding a class). Nothing moves further than 20px.
- **Signature effect: light moving on the canal water.** `js/hero-gl.js` is one raw WebGL2 fragment shader that redraws the hero photograph and adds a slow tileable caustic and a faint ripple only where the photograph is water (lower left, below the arch); boats, brick and trees are never displaced. Engineering: device pixel ratio capped (1.5 desktop, 1 below 1000px); renders only while the hero is on screen and the tab is visible; `webglcontextlost` is prevented and the `<img>` underneath takes over; `webglcontextrestored` rebuilds the program and texture and resumes; reduced motion skips it entirely; the caustic is computed only over water and any NaN is cleared before it reaches the screen (the first version blacked out the hero on exactly that).

## 9. Reuse of photographs, stated

Gallery: archive of every frame. A boat's own photograph: the same boat on the home carousel, the boats page and its own page. Hero: one photograph in two compositions (wide, tall). Nothing else repeats; `tools/check.mjs` fails the build if it does. See `IMAGE-CREDITS.md`.

## 10. Do's and don'ts

Do: say a number a visitor can act on in every section; name the lock, the mile, the hour; let a photograph carry the layout; let the ground show through.
Don't: put a badge above the headline, an icon-topped three-card grid, a stat strip, a numbered 1-2-3 "how it works", glassmorphism, a purple anywhere, or "Empower / Unlock / Transform" in the copy. Don't name a place a photograph was not taken in. Don't add a payment field. Don't use Inter.

## 11. Passes recorded

- Pass 1 (build): all six pages, three tools, effect. Defects found by running it, not by reading it: the water shader produced NaN and blacked out the hero; ScrollTrigger and SplitType wrote `style` attributes that the strict CSP blocked (12 violations per load); both removed. A form-label rule leaked onto pill and checkbox labels (uppercase, wrong alignment) and the cabins stat overflowed on the boat page; both fixed.
- Pass 2 (critique, DARK.md §6, fresh-context sub-agent given only screenshots, the Deep Blue pin and the checklist): verdict "not yet at serious money"; HERO desktop CURRENT WINS, HERO mobile INCONCLUSIVE, DATED LIST INCONCLUSIVE, FLEET CAROUSEL REFERENCE WINS, ROUTES EXPLORER CURRENT WINS, PRICE CALCULATOR CURRENT WINS, BOATS LIST CURRENT WINS, GALLERY INCONCLUSIVE. Slop tells it found: repeated identical image-text-button layout; mild four-up stat rows; mild pill overuse; the gold button on every boat row. None of the hard tells (Inter, purple, a badge over the headline, icon-card grids, numbered steps, glassmorphism, testimonials, "Empower/Unlock" copy). It did not open the three in-repo quality-bar sites.
  - **Single largest gap named: photographic coherence** (a mixed set of photographs read as stock). Fixed in the one bounded round: the shared grade was strengthened (lower white point, teal soft-light wash, brightness lift) and applied to the clips. Not fixed, and why: replacing the weakest photographs and the hero needs a new download list and your yes (see the report); the critic's "hero hides the boat" is the lit-opening composition of the reference, and the boat is dark by nature.
  - Other critic findings acted on: the photograph beside the dated list now fills its height (empty column gone); ghost words shortened so they read (SLOW, FLEET, ROUTES, FIRST, VISIT, HELM, MAP, WILD); route-map labels enlarged on phones; "Day 1" no longer wraps; calculator extras labels enlarged.
  - Defect found by me, not the critic: the first contrast fix (a scrim behind the hero headline) had a hard top edge that read as a grey seam in the sky. Its gradient is now `closest-side`, fully clear before its box ends. Contrast re-measured on the real photograph: headline and body copy 8.9:1 or better at the 95th percentile, the light ghost line 5.2:1 at the 95th percentile and 3.0:1 at its single brightest pixel (large text, AA 3:1).
  - Plateau rule (DARK.md §6.5): a second bounded round on the same element would be a fourth cosmetic pass; the remaining gap is the photographs themselves, which is an asset decision, not a CSS one.

## 12. Agent instructions

(Copied from DARK.md §8 with the path adjusted; the same block is in `CLAUDE.md`.)

```
# UI Generation Rules (DARK engine)
Before writing, editing, or restyling any front-end UI in this repo:
1. This project is DARK-engine (see .claude/engine-mode). Do NOT invoke
   `frontend-design`, `impeccable`, or `web-design-guidelines`, and do
   NOT read DESIGN-SYSTEM/DESIGN.md except §2 and §6.
2. Read this repo's own DESIGN.md AND
   C:\Users\sengc\OneDrive\Desktop\Company\DESIGN-SYSTEM\DARK.md.
   Treat both as hard constraints.
3. Reach for the real open-source stack named in DARK.md §5 by default.
4. Check licensing as each dependency/asset is added (DARK.md §2).
5. Before calling any UI work done: take real screenshots (desktop +
   mobile) and check them against DARK.md §4 directly against the image (DARK.md §6).
```
