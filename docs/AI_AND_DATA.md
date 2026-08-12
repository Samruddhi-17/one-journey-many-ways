# AI Use and Data Provenance

What a reviewer needs to know about how this site was made and where its numbers came from.
Written for the Analyticon 2026 submission. Where this document is unsure, it says so rather than
rounding up to a claim.

## The short answer

1. **There is no AI in the product.** The site is a static bundle: no model, no API key, no server,
   no network request of any kind. Verified rather than assumed — `src/` contains no `fetch`, no
   `XMLHttpRequest` and no analytics. An "ask me anything about this place" affordance was
   considered during design and cut, so nothing on the site answers a visitor with generated text.
2. **AI wrote the code and drafted the prose**, under direction and review, and that is the whole of
   its involvement.
3. **AI did not produce the data or the images.** Both were compiled and sourced by the author.

## What the AI did, and what it did not

| Area | AI's part | The author's part |
|---|---|---|
| Application code — 66 files, 19,657 lines including comments | Wrote effectively all of it | Set the brief, reviewed, accepted or rejected each pass |
| Editorial copy on the site | Drafted every line | Rejected and re-specified repeatedly; **7 of the 17 commits are copy rewrites demanded on review**, including one whole pass whose subject was that the prose read as machine-written |
| The dataset | None | Compiled from published sources into the workbook |
| Photographs and illustrations | None | Sourced from the web |
| Country ambience (audio) | Wrote the synthesis code | Rejected four rounds of it on listening, by ear, with specific diagnoses |
| Verification | Wrote and ran the checks | Required them before each deploy |

**Tool declared:** Claude Code (Anthropic's CLI), Claude Opus, used across 9–12 August 2026, 17
commits. Used as a development tool only; it is not part of the deployed artefact.

**Why the code comments are unusually long.** Several files open with a page of reasoning about
which alternative was measured and rejected. That is deliberate and it is a consequence of the
working method: where an AI-written change was accepted, the argument for it is recorded next to it,
so a reader can audit the decision rather than trusting the author of the diff.

## The dataset

**Source of truth:** `travel_data_dictionary_10_countries.xlsx`, hand-maintained in Excel. Thirteen
sheets. Despite the filename it holds **five** countries: Japan, India, Italy, Switzerland and the
United States, which are the five the site visits, in that order.

**How it reaches the page.** One direction, once, at build time: workbook → `npm run data`
(`scripts/convertData.mjs`) → `src/data/journey.json` → React. The site never reads the spreadsheet,
and the JSON is committed so that a changed number shows up as a reviewable diff. The conversion is
deterministic: re-running it against the current workbook produces no change to the committed JSON.
Full detail in [`DATA_PIPELINE.md`](DATA_PIPELINE.md).

**What is measured, per country:**

| Field | What it is | Unit / granularity |
|---|---|---|
| `population` | Total population | persons |
| `lifeExpectancy` | Life expectancy at birth | years |
| `happinessScore` | Self-reported life evaluation | 0–10 |
| `touristArrivalsMillions` | International tourist arrivals | millions/year |
| `workHoursPerWeek`, `commuteMinutesOneWay` | Average working week, average one-way commute | hours, minutes |
| `day.activities` | Time use across five activity groups, ages 15–64 | hours/day, seven-day average |
| `food` | Meat, vegetables and dairy supply | kg/capita/year |
| `transport` | Mode share across four modes | % of journeys |
| `languages` | Share of the country using each of three languages | %, some as ranges |

Also carried, and editorial rather than measured: the traveller's quoted notes and observations,
"did you know" lines, and the experiences shown in the Culture section. These are quoted verbatim
from the workbook; the only change made to them is straight to typographic apostrophes.

## Provenance, stated honestly

**The workbook records no source per figure, and no source list was kept.** The figures were
compiled by the author from published public sources, but the record of which figure came from
which source, and as of when, was not retained. That gap is why the site's footer claims only what
it can support:

> The figures are national averages, compiled from several published sources, and each one is
> printed as its source gives it.

That sentence is accurate and unspecific, and it is unspecific because of this gap rather than by
editorial choice. An earlier version said "from a single dataset", which was false about the
project's own provenance, and was corrected.

**The table below is a reconstruction aid, not a citation.** Each row names the source the figure
most likely came from, given what the field is. **None of it is confirmed**, and nothing in it
should be published as a citation until it has been checked against the actual figure.

| Field | Candidate origin | Status |
|---|---|---|
| `population` | UN World Population Prospects, or World Bank | unconfirmed |
| `lifeExpectancy` | WHO, or World Bank | unconfirmed |
| `happinessScore` | World Happiness Report (Cantril ladder) | unconfirmed |
| `touristArrivalsMillions` | UN Tourism (UNWTO) | unconfirmed |
| `day.activities` | OECD time-use data, or national time-use surveys | unconfirmed |
| `food` | FAO food balance sheets | unconfirmed |
| `transport` | National travel surveys | unconfirmed |
| `workHoursPerWeek`, `commuteMinutesOneWay` | OECD, or national statistics offices | unconfirmed |
| `languages` | National censuses | unconfirmed |

Checking these is the first open item below. The likely candidates are recorded here so the work
starts from somewhere, not so it can be skipped.

## What the data was not allowed to say

Provenance is only half of honesty. These are the places where the pipeline refuses the source, and
each is enforced by a guard that throws rather than by a habit:

- **`flight_distance_km` is dropped entirely.** The column contradicts itself: Italy → Switzerland
  is given as ~7,800 km against 649 km computed from the workbook's own coordinates, and the column
  sums to 27,600 while the summary sheet claims 42,385. "42,385 km travelled" is an attractive line
  and it is not true, so the site claims no distance at all.
- **Every `*_rank` column is deleted, not merely unused** — `population_rank`, `happiness_rank`,
  `tourist_rank`, `commute_rank`. Data that exists in the JSON eventually gets rendered; deleting
  the field is a guarantee, not displaying it is a habit.
- **`happinessScore` is never shown beside another country's.** A 6.15 next to a 7.06 is a ranking
  with extra steps.
- **Ranges stay ranges.** Eight language figures across four countries are given by their source as
  a range (Japan's English at "15–30%", for example). They are printed as given and flagged
  `approximate`, because collapsing them to a midpoint would invent a precision the source declined
  to claim.
- **Sums are reported, never corrected.** Transport shares are checked against 100% and daily hours
  against 24; all ten checks currently pass within tolerance. A drifting source would be surfaced,
  not silently scaled to make a chart close neatly.
- **14 validator tests** prove each guard rejects what it exists to reject. Two guards were wrong
  when first written and looked correct; a check that cannot fail is indistinguishable from a check
  that never fires.

## Images and audio

**All 63 images shipped with the site — photographs and illustrations alike — were sourced from the
web by the author. None were generated.**

**The licence position is not documented, and this is the largest open item in this document.** No
licence, attribution or origin URL was recorded for any of the 63 files. One US photograph carried a
third party's visible watermark; it was removed from the site rather than retouched, on the grounds
that painting out an ownership notice in order to publish the file anyway is a different act from
tidying a graphic. That decision only covers the one file that announced itself.

**The audio is synthesised, not recorded and not generated.** Each country's ambience is built at
runtime from Web Audio primitives — filtered noise, oscillators, scheduled envelopes — in
`src/lib/ambience.js`. There are no audio files in the repository. Sound is off by default and does
not persist as "on" across a reload.

## Open items before submission

1. **Reconstruct the source list.** Confirm each figure against a named publication and record the
   organisation, dataset, edition or year, and access date. Then replace the footer's "several
   published sources" with the list.
2. **Establish the images' licence position**, file by file, or replace the files. This affects
   whether the site can be published as-is.
3. **Three figures the site holds but never renders.** `workHoursPerWeek` (which appears to
   disagree with the time-use chart's paid-work hours, because the chart averages across seven days
   and a working week does not), `touristArrivalsMillions`, and `happinessScore`. The last is a
   settled decision rather than an oversight — it is kept because the traveller's notes touch on
   wellbeing, and withheld because printing it beside another country's is a ranking with extra
   steps. The first two are simply unused, and should be either shown or dropped.

Items 1 and 2 are records that were never kept rather than mistakes in the artefact, and both are
recoverable. Nothing in the site depends on either being resolved in a particular way; what the
site says about its own sourcing is already limited to what can be supported.
