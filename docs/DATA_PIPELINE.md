# Data Pipeline

How the spreadsheet becomes the website.

```
travel_data_dictionary_10_countries.xlsx     the source, edited by hand in Excel
              │
              │  npm run data   →   scripts/convertData.mjs
              ▼
src/data/journey.json                        generated; committed; never hand-edited
public/images/*                              copies of images/*; generated; not committed
              │
              ▼
React components                             read JSON only
```

**The website never reads the spreadsheet.** One boundary, crossed once, at build time.

## Why a pipeline instead of reading the workbook in the app

1. **No parser ships to the browser.** Parsing a spreadsheet on a phone, every page load, to
   get a result that is identical every time.
2. **The data can be refused.** A build script can stop. A page that finds bad data mid-render
   can only render badly.
3. **The messy source stays out of the components.** The workbook has a sheet named
   `storyteling`, inconsistent header capitalisation, float noise in every decimal, image
   filenames that do not exist, and a distance column that contradicts itself. A component
   laying out a paragraph should not have to know any of that.
4. **The transformation is reviewable.** Every decision about what the data *means* lives in
   one file, in git.

This is an ordinary extract–transform–load job. The only unusual part is that the warehouse is
a JSON file and the consumer is a React component.

## Running it

| Command | What it does |
|---|---|
| `npm run data` | Regenerate `src/data/journey.json` and copy assets |
| `npm run test:data` | Exercise the guards in `scripts/validators.mjs` (14 tests) |
| `npm run build` | Tests → pipeline → Vite build, in that order |

`npm run build` runs the tests *first*, so a broken guard fails before it has a chance to pass
bad data. Run `npm run data` by hand after editing the workbook.

## The files

| File | Job |
|---|---|
| `scripts/readXlsx.mjs` | Read `.xlsx` with zero dependencies (ZIP + XML, via Node's `zlib`) |
| `scripts/convertData.mjs` | Transform, resolve assets, write JSON |
| `scripts/validators.mjs` | The rules that must hold. These throw. |
| `scripts/validators.test.mjs` | Proof the rules actually reject what they claim to |

### Why no `xlsx` package

SheetJS carries two high-severity advisories — prototype pollution (GHSA-4r6h-8v6p-xvw6) and
ReDoS (GHSA-5pgg-2g8v-p4x9) — with **no fixed version available**. It was installed, audited,
and removed.

An `.xlsx` is a ZIP of XML files, and Node ships a ZIP decompressor. Reading the cells we need
is ~120 lines we can read in full; the library's formulas, styles, charts, writing, and dozen
legacy formats are attack surface adopted for no benefit. This is not a general argument
against dependencies — it is the specific case where the task is narrow, the input is trusted,
and the available package is known-vulnerable.

## What the pipeline drops, and why

This is the important part of the file.

### `flight_distance_km` — dropped entirely, never to be reinstated

The column does not survive contact with itself. Every value is a string with a tilde — the
source knew it was estimating — and one is an order of magnitude out:

| Leg | Workbook | Great-circle from the dataset's own lat/long |
|---|---|---|
| (arrival) Japan | `0` | — |
| Japan → India | `~5,900` | 5,959 km |
| India → Italy | `~5,900` | 6,569 km |
| **Italy → Switzerland** | **`~7,800`** | **649 km** |
| Switzerland → United States | `~8,000` | 7,965 km |
| **Total** | **27,600** | **21,142 km** |
| `journey_summary.total_distance` | **42,385** | |

Three legs are roughly right. Italy → Switzerland is out by a factor of twelve — Zurich is
about an hour's flight from Rome. And the totals do not agree with each other: the column sums
to 27,600 while `journey_summary` claims 42,385, a figure that matches neither the column nor
the geography.

The countries *do* carry real coordinates, so the distances are computable. The source's
numbers are simply not the distances.

Principle 15: accuracy is not negotiable for the sake of atmosphere. "42,385 km travelled" is
an attractive line on a journey page and it is not true. The honest options were to compute
from coordinates or to omit. **We omit** — the journey's meaning does not depend on its
length, and a computed figure would only invite a total-distance statistic the site has no
reason to claim.

### `*_rank` — dropped, and enforced

`population_rank`, `happiness_rank`, `tourist_rank`, `commute_rank`. PRODUCT_VISION §7.4
forbids ranking countries; the permanent principle is that the site must never imply one
country is objectively better than another.

The tempting move is to keep the columns "just in case" and not display them. That is the
failure this rule prevents: **data that exists in the JSON will eventually be rendered**,
because someone will open the file, see `happiness_rank: 55`, and reasonably conclude it is
there to be used. Deleting the field is a structural guarantee. Not displaying it is a habit.

Note what is *not* forbidden: `arrivalOrder`. Arrival order encodes when the visitor arrives —
a fact about the journey. A rank encodes which country won — a judgement about the countries.

### Also dropped

- **`kpi_icon`** — a sheet mapping "Happiness" to 😊. Dashboard furniture. (The emoji inside
  `traveler_observation.card_title` are kept: they are the traveller's own voice, inside quoted
  text.)
- **`culture`** — superseded by `culture_experience`, the richer of two overlapping sheets.
  Keeping both would give the site two answers to "what is there to experience in Japan".

### Kept with a caveat

**`happinessScore`** is retained because the traveller notes touch on wellbeing, but it must
never be shown next to another country's. A 6.15 beside a 7.06 is a ranking with extra steps.

## Judgement calls worth knowing about

**Ranges stay ranges.** `language.display_value` mixes formats: Japanese is `0.99`, English in
Japan is the string `"15–30%"`. Collapsing that to 22.5% would invent a precision the source
explicitly declined to claim. The display string is preserved verbatim and a numeric
`share` is carried separately for charts, with `approximate: true` flagged. (Principle 17.)

**Precision is stated at every call site.** `toNumber` requires a `precision` argument — no
default. Excel stores 36.7 as `36.700000000000003`; a default would let that noise through
unexamined. Rounding to fewer digits than the source claims is honest simplification; printing
more digits than were measured is false precision.

**Sums are reported, not corrected.** Transport shares and daily hours are checked against 100
and 24. They currently all pass (10/10), but a drifting source is a fact to surface, not a
build to break — scaling numbers to make a donut close perfectly would destroy the evidence
that the source disagreed with itself.

**Slugs are declared, not derived.** `/japan` is a public URL. Deriving it from
`country_name` would mean a spreadsheet edit could silently break a bookmark.

**Arrival order is asserted against the workbook, not read from it.** The itinerary is declared
in `convertData.mjs` *and* present in the source; the build fails if they disagree. Two sources
that agree is a check. One source copied twice is a liability.

**The traveller's words are quoted, never edited.** `observations[].quote`, `travellerNote`,
and `didYouKnow` are verbatim; the only transformation is straight → typographic apostrophes,
which changes the glyph and not the words. The field is named `quote` because §3.4 makes it a
rendering contract: the site's own narration never says "I", but the traveller may be quoted.
The traveller note is the single most important string in the dataset —

> "I expected futuristic technology, but what stayed with me most was the culture of respect
> and quietness in everyday life."

— because that *is* expectation-versus-discovery, the project's central narrative.

## Asset resolution

The workbook refers to images three ways: a full internal URL, a bare filename that exists, and
a bare filename that does not. Resolution takes the basename, drops the extension, and looks it
up in an index built by reading `images/` — extension-insensitive, because the source says
`.jpg` where the file is `.jpeg`.

Where the *name* differs, `ALIASES` in `convertData.mjs` maps it explicitly. Each entry is
deliberate rather than fuzzy-matched: a matcher clever enough to guess `japan_hanami` →
`hanami_cherry_blossom_japan.jpeg` would also guess wrong somewhere and never say so.

**Internal URLs must never reach the output.** Every image URL in the source points at
`drive.corp.amazon.com`, including a corporate alias in the path. Those strings would leak
internal hostnames and a username to anyone viewing source, and would not load outside the
corporate network. `assertNoInternalReferences` scans the **final serialised JSON** rather than
checking field by field — a field check only catches fields someone remembered to check;
scanning the artefact catches a leak in a field added later by someone who never read the rule.

**Current gaps, reported on every run:** ten image references name files that are not in
`images/` — one for India and all three each for Italy, Switzerland, and the United States.
This is not fatal. Japan is the reference implementation and the others are not yet
photographed; a build that refused would block work on the pattern until every asset existed.
But the gap is printed every run, because the standing rule against forcing equal image counts
per country means the gap is *acceptable*, not that it should be *invisible*.

## Guards, and why they are tested

| Rule | Enforcement |
|---|---|
| No internal hostnames or aliases in the output | throws |
| No ranking fields | throws |
| Itinerary complete: orders 1–5, no gaps, no duplicate slugs | throws |
| Every referenced asset exists on disk | throws |
| Numbers parse, at a stated precision | throws |
| Proportions sum to 100 / 24 within tolerance | reports |

Two of these guards were **wrong when first written**, and reading them did not reveal it:

1. The ranking check matched the spreadsheet's `happiness_rank` — while the converter emits
   `happinessRank`. It was watching the one spelling that could never reach the output. A rank
   would have shipped and the build would have reported success.
2. The fix, a single case-insensitive pattern, then flagged `frank`. Case is the entire signal
   in camelCase, so the `i` flag had removed the only thing distinguishing `happinessRank` from
   an ordinary word. The result is two case-sensitive rules, one per naming convention.

Hence `validators.test.mjs`. **A validator that never fires looks exactly like a validator that
cannot fire** — both produce a green build. So each guard has a test proving it *rejects* what
it exists to reject; a test that only confirmed good data passes would have been green for both
bugs.

## `journey.json` shape

```
{ generatedBy, source, countryCount, countries: [ {
    slug, name, arrivalOrder, capital, continent, currency, timeZone,
    coordinates:  { latitude, longitude },
    facts:        { population, lifeExpectancy, happinessScore,
                    touristArrivalsMillions, workHoursPerWeek, commuteMinutesOneWay },
    welcome:      { title, intro },
    didYouKnow, travellerNote,
    day:          { ageGroup, activities: [{ activity, hours }] },
    food:         [{ category, perCapita, unit }],
    transport:    [{ mode, percentage }],
    languages:    [{ language, type, display, approximate, share }],
    observations: [{ section, title, quote }],
    experiences:  [{ experience, title, description, image }],
    images:       { hero, flag, stamp, gallery: [{ category, src }] },
} ] }
```

`generatedBy` names the script, so the answer to "can I edit this file?" is unambiguous: no.
Edit the workbook and re-run `npm run data`.

## Adding a country's data

1. Edit the workbook.
2. `npm run data`.
3. Read the report. It prints per-country counts, sum checks, and unresolved image references.
4. If an image is unresolved and the file exists under another name, add an `ALIASES` entry.
5. Commit the workbook and `src/data/journey.json` together — the diff on the JSON is the
   review.
