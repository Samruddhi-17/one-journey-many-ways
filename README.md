# One Journey. Many Ways of Living.

An immersive, data-led travel story about how the world lives, thrives and connects — five
countries, visited in order, each one a different answer to the same question.

It is built from a real travel dataset, but it is not a dashboard. The numbers appear only where a
question has already been asked, and no screen ranks one country above another.

**Live site:** not yet deployed — see [Deployment](#deployment).

---

## What this is

The visitor travels alongside an anonymous traveller through Japan, India, Italy, Switzerland and
the United States. Each stop follows the same four movements — **Arrival · Living · Culture ·
Reflection** — so the structure becomes familiar while the atmosphere changes country by country.

The narrative is about **expectation versus discovery**: what you assume a place is like, and what
the data shows once you look closely. The closing screen is a reflection rather than a summary of
statistics, and the intended parting thought is *"life can be meaningful in many different ways"* —
never *"country A wins."*

Three consequences of that, visible throughout the code:

- **Countries are never sorted by a metric value.** Sort order is itself a ranking, so the
  canonical itinerary order is used everywhere, charts included.
- **Colour never encodes rank.** Each country has an accent, and within a chart the ramp follows a
  fixed sequence — the order of a day, say — rather than the size of each part.
- **A chart follows its claim, never precedes it.** A visualisation shown before the sentence it
  supports is decoration.

The full reasoning lives in [`docs/PRODUCT_VISION.md`](docs/PRODUCT_VISION.md), which is the
highest authority in this repository. Where code and vision disagree, the vision wins.

## Documentation

| Document | What it covers |
|---|---|
| [`docs/PRODUCT_VISION.md`](docs/PRODUCT_VISION.md) | The narrative, the principles, and what this project refuses to do. Read first. |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Type scale, colour tokens, spacing, motion, component contracts. |
| [`docs/DATA_PIPELINE.md`](docs/DATA_PIPELINE.md) | How the workbook becomes JSON, and the assertions that guard the conversion. |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Earlier design exploration, kept for context. |

Beyond these, the components carry the detailed reasoning. Several files open with a long comment
recording *why* a form was chosen and which alternatives were measured and rejected —
[`src/components/country/DayBar.jsx`](src/components/country/DayBar.jsx) and
[`src/components/country/CountryCover.jsx`](src/components/country/CountryCover.jsx) are the two
worth reading first. They are deliberately verbose; this project is also a teaching artefact.

## Tech stack

| | |
|---|---|
| **React 19** | UI — function components and hooks only |
| **Vite 8** | dev server and build |
| **Tailwind CSS v4** | styling, configured in CSS (`@theme`) rather than a JS config file |
| **Framer Motion 12** | the motion JavaScript has to drive; CSS handles the rest |
| **React Router 7** | routing, in `HashRouter` mode — see [Deployment](#deployment) |
| **JavaScript** | not TypeScript, deliberately |
| **oxlint** | linting |
| **sharp** | build-time only — AVIF encoding in the data pipeline |

Six runtime dependencies, and no chart library. Every visualisation on the site is HTML and CSS,
which is what lets each one be read by a screen reader as a description list instead of needing a
text alternative bolted onto an SVG.

## Getting started

Requires **Node 20.19+ or 22.12+** (Vite 8's floor; developed on Node 24).

```bash
npm install
npm run data     # convert the workbook into src/data/journey.json
npm run dev      # http://localhost:5173
```

`npm run data` is not strictly required on a fresh clone — `journey.json` is committed, so the dev
server works immediately. It is required for the photographs: it populates `public/images/`, which
is *not* committed, so until it has run once every image falls back to its designed atmospheric
placeholder.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with hot reload |
| `npm run data` | Workbook → `src/data/journey.json`; copy referenced images into `public/images/` and encode an AVIF beside each one |
| `npm run test:data` | Run the data-pipeline validator tests (`node --test`) |
| `npm run build` | `test:data` → `data` → `vite build`, in that order |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | oxlint |

`build` re-runs the tests and the conversion first, so a build cannot succeed against a workbook
that fails validation. That is the point: the data and the site ship together or not at all.

## Data pipeline

```
travel_data_dictionary_10_countries.xlsx   the source of truth, hand-maintained
                 │
                 ▼   npm run data   (scripts/convertData.mjs)
        src/data/journey.json               committed — a readable diff when a number changes
        public/images/                      the photographs the data references: each JPEG,
                                            plus an AVIF encoded beside it
                 │
                 ▼
        src/data/journey.js                 the only module the components import
```

**The website never reads the workbook, and no component reads the JSON.** `journey.json` is
imported in exactly one place, `src/data/journey.js`, so data flows one way and a shape change has
exactly one place to break.

The conversion is not a transcription — it asserts. It checks that the itinerary is internally
consistent, that nothing in the output looks like a ranking, that every referenced asset exists,
that stated shares sum to their total within tolerance, and that no internal corporate URL from the
source workbook can reach the shipped JSON. Any failure fails the build.
`scripts/validators.test.mjs` tests the validators themselves (14 tests), because a check that
cannot fail is indistinguishable from a check that never fires.

`journey.json` is committed but `public/images/` is not: a 25 KB text file produces a reviewable
diff, while binary copies of files already tracked in `images/` would only double the repository's
weight to store the same pixels twice. `public/images/` is a strict projection of what the data
references — the script *deletes* files there that the workbook no longer mentions, because Vite
copies everything under `public/` into the build verbatim, and an exclusion that leaves the file on
the server is not an exclusion.

### Images are re-encoded, not just copied

Alongside each JPEG the script writes an AVIF, using [`sharp`](https://sharp.pixelplumbing.com/)
(a devDependency; it does not ship). Across the site's seventeen photographs that is **2539 kB →
1110 kB, 56% smaller** — the single largest optimisation in the project, larger than anything
available in the JavaScript bundle. `ImageFrame` and `CountryCover` render a `<picture>` with the
AVIF as a `<source>` and the JPEG as the `<img>` fallback, so a browser that cannot decode AVIF
transfers exactly what it did before.

Two details worth knowing before editing `convertData.mjs`:

- **The JPEG is still copied on purpose.** It is the fallback, not a leftover.
- **Encoding is cached by modification time**, so a normal run reports `0 re-encoded` and takes
  about half a second; a cold run takes roughly nine. Deleting `public/images/` forces a re-encode.

`sharp` is a real dependency rather than a shell-out to Homebrew's `avifenc` or `cwebp`, because a
build that depends on locally-installed CLIs is a build that only works on one machine.

## Project structure

```
docs/                     the vision, the design system, the pipeline
images/                   source photographs from the workbook (tracked)
public/                   favicon.svg + generated images/ (images/ untracked)
scripts/
  convertData.mjs         workbook → JSON, with assertions
  readXlsx.mjs            minimal xlsx reader, so parsing costs no runtime dependency
  validators.mjs          the assertions
  validators.test.mjs     tests for the assertions
src/
  App.jsx                 routes
  index.css               global styles, resets, reduced-motion
  styles/tokens.css       design tokens as CSS custom properties
  data/                   journey.json (generated), journey.js, countries.js
  hooks/                  useAtmosphere, useDocumentMeta, useScrollProgress
  lib/                    meta.js (document metadata), spellOut.js (editorial numbers)
  pages/                  Home, Country, Passport, NotFound
  components/
    layout/               header, footer, nav, transitions, scroll behaviour
    home/                 hero, introduction, route map
    country/              arrival, living, culture, reflection, and their charts
    ui/                   Section, Button, Reveal, ImageFrame, AtmosphericCover
```

## Accessibility

Treated as a construction constraint rather than a review step, and **verified by measurement,
never by eye** — the site looked fine in screenshots on the one occasion the hero's text contrast
was failing at five separate viewport widths.

- Every chart's numbers exist as text in the document; the coloured marks are `aria-hidden`,
  because they carry nothing the text does not already say.
- Colour is never the sole carrier of meaning.
- Contrast is measured against composited pixels, and text over a photograph sits on a scrim so
  that the ratio is knowable at all.
- `prefers-reduced-motion` removes motion rather than shortening it. A request to stop moving is
  not a request to hurry.
- Focus is visible everywhere, focus order follows the document, and touch targets meet the 44px
  minimum.

## Deployment

The site is a static bundle and targets **GitHub Pages**. It uses `HashRouter` so that deep links
survive on a host which cannot rewrite unknown paths to `index.html`.

The build is **path-independent**: `vite.config.js` sets `base: './'` and the data pipeline emits
document-relative image paths (`./images/…`), so the same `dist/` works at a domain root, in a
project subdirectory, or opened from disk — no rebuild and no repository name baked in. This was
verified by serving `dist/` from a `/<repo>/` subdirectory and confirming the scripts, stylesheet
and photographs all resolve; the previous absolute paths returned 404 in that same test.

**One thing is outstanding, noted here rather than quietly assumed: no git remote is configured**,
so nothing has been pushed and no Pages site exists yet. Once a remote is added, publishing is
`npm run build` plus serving `dist/` — either from a `gh-pages` branch or a Pages action.

`npm audit` reports two high-severity advisories in React Router
([GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2), CSRF in **RSC mode**).
They do not apply to this site: it is a static `HashRouter` build with no server, no RSC mode, and
no loaders or actions. There is no patched 7.x release — `npm audit fix --force` downgrades to
7.11.0, a breaking change — so the advisory is accepted knowingly rather than silenced.

## Notes for contributors

- **Don't add a chart library.** See the comment at the top of `DayBar.jsx`: a dependency justified
  by an anticipated need is not paid for until the need arrives.
- **Don't sort countries by a value**, in code or in a chart.
- **Numerals in editorial prose are spelled out** via `src/lib/spellOut.js`. The helper returns a
  lowercase word, so the call site chooses the capitalisation.
- **Change the workbook, not the JSON.** Editing generated output is undone by the next build.
- **Comments explain why, not what.** A comment asserting a benefit nobody measured is worse than
  no comment — one in this repository confidently described a performance benefit that measurement
  showed did not exist.
