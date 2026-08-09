# Project Design Document

**One Journey. Many Ways of Living.**
*How the World Lives, Thrives and Connects.*

Status: **Draft for approval** — Session 2 output. No code written.

---

## 1. Data Audit

### 1.1 Which workbook is the source of truth?

The filenames are misleading. Actual contents:

| File | Countries | Sheets | Verdict |
|---|---|---|---|
| `travel_data_dictionary.xlsx` | **12** (JP, IN, NL, SE, IT, FR, KR, US, BR, NZ, CH, MX) | 7 | Superseded |
| `travel_data_dictionary_10_countries.xlsx` | **5** (JP, IN, IT, CH, US) | 13 | **Source of truth** |

The "10_countries" file has **fewer** countries but **six more sheets** — the storytelling
layer (`hero_story`, `traveler_observation`, `culture_experience`, `country_gallery`,
`journey_summary`, `kpi_icon`) plus geography (`latitude`, `longitude`, `arrival_order`,
`flight_distance_km`) and resolved image URLs. It is the newer, richer file and its 5
countries exactly match the project brief.

**Recommendation:** treat `travel_data_dictionary_10_countries.xlsx` as authoritative.
Keep the 12-country file as the expansion backlog — it already holds complete
`time_usage`, `food`, `transport`, `language`, `culture`, and `storyteling` rows for
7 additional countries, so adding a 6th country later is a data-entry task, not research.

### 1.2 Sheet-by-sheet inventory

All row counts below are from the authoritative 5-country file.

| Sheet | Rows | Grain | Contents |
|---|---|---|---|
| `country_master` | 5 | 1 per country | 23 columns: identity, 5 KPIs + ranks, geo coords, journey order, flight distance, currency, timezone, image URLs |
| `time_usage` | 25 | country × activity | 5 activities, `hours` + `percentage_of_day` |
| `food` | 15 | country × category | 3 categories (Meat/Vegetables/Dairy), kg/capita/year |
| `transport` | 20 | country × mode | 4 modes, `percentage` + `sort_order` |
| `language` | 15 | country × language | 3 languages, `Type`, `Display Value`, `Sort Value` |
| `culture` | 10 | country × experience | 2 per country, name + description + emoji |
| `culture_experience` | 15 | country × experience | **3 per country**, richer: `short_title`, description, `display_order` |
| `traveler_observation` | 25 | country × section | 5 sections/country — first-person narration |
| `storyteling` | 5 | 1 per country | `did_you_know`, `traveler_note`, `journey_order` |
| `hero_story` | 5 | 1 per country | `welcome_title`, `intro_story` |
| `journey_summary` | 1 | global | 5 countries / 42,385 km / 28 days |
| `kpi_icon` | 5 | 1 per KPI | Emoji per KPI |
| `country_gallery` | 10 | country × category | **Japan only populated** — 8 empty rows |

### 1.3 Metrics available

**Per-country KPIs** (`country_master`), each with a companion rank — the ranks are the
more interesting number for storytelling because they give scale:

| Metric | Range across our 5 | Note |
|---|---|---|
| `happiness_score` | 4.389 (IN) → 6.935 (CH) | Rank out of 143 |
| `avg_life_expectancy_at_birth` | 73 (IN) → 85 (JP) | Rank out of 193 |
| `avg_work_hours_per_week` | 34.0 (IT) → 46.7 (IN) | Rank out of 38 |
| `population` | 9.1M (CH) → 1.46B (IN) | 160× spread — **needs log scale or no bar chart** |
| `tourist_arrivals_in_million` | 11.2 (IN) → 68.5 (IT) | Rank out of 217 |
| `avg_one_way_commute_minutes` | 27.2 (US) → 47.5 (IN) | Rank out of 102 |

**Distributional metrics** — these are the good ones for charts, because each is a
complete part-to-whole set:

- `time_usage` — 5 activities summing to exactly 24.0 hours for every country. **Verified.**
- `transport` — 4 modes summing to exactly 100.0% for every country. **Verified.**
- `food` — 3 categories, absolute kg (not a whole; comparison across countries).
- `language` — 3 languages with a numeric `Sort Value` 0–99.

### 1.4 Data quality findings

These are real inconsistencies found by validation, not stylistic quibbles. Each needs
a decision before implementation.

**A. `journey_order` vs `arrival_order` disagree** — `storyteling.journey_order` retains
the old 12-country numbering (Japan 1, India 2, Italy **5**, US **8**, Switzerland **11**),
while `country_master.arrival_order` is correctly resequenced 1–5.
→ **Use `arrival_order`. Ignore `journey_order`.**

**B. Total distance conflict.** `journey_summary.total_distance` = 42,385 km. But the
individual `flight_distance_km` values sum to exactly **27,600 km** — which is also the
number printed on all five dashboard mockups. `journey_summary` is stale.
→ **Use 27,600 km (sum the legs).** Deriving it in code means it can never drift again.

**C. Journey route order is geographically illogical.** `arrival_order` runs
Japan → India → Italy → Switzerland → United States, but `flight_distance_km` says
India → Italy is `~5,900` and Italy → Switzerland is... the Italy row's value.
The distances are stored as *"distance from previous stop"*, and Italy→Switzerland
(~7,800 assigned to Switzerland) is wildly wrong — Rome to Bern is ~600 km.
→ The numbers are narrative, not geodesic. **Recommendation:** treat distance as
flavour, display only the 27,600 km total, and don't show per-leg distances. Alternatively
recompute legs from the lat/long we already have (haversine) — that would be honest and
is ~15 lines of code. **This is a decision for you.**

**D. Mockup KPI values do not match the dataset.** For Japan the mockups show happiness
6.06, life expectancy 84.1, work hours 41.0, tourists 25.1M, commute 58 min. The data
says 6.147, 85, 36.7, 36.9M, 39 min. The mockups were built from an earlier data pull.
→ **The Excel file wins.** The site will show different numbers than the mockups; that's
correct, not a bug. Note that mockup commute (58) looks like a *round-trip* figure while
our column is explicitly `avg_one_way_commute_minutes` — label it "one-way" to be accurate.

**E. `country_gallery` is 80% empty.** Only Japan's 5 rows have URLs; India/Italy/CH/US
are blank. But we *have* story images on disk for India (5) and Switzerland (1).
→ Don't drive the gallery from this sheet. **Build the gallery from a local asset
manifest instead** (see §5.2). Italy and US have zero story images — see §2.3.

**F. `culture` and `culture_experience` overlap.** `culture` has 2 experiences/country
with emoji; `culture_experience` has 3/country with better copy and image filenames
(which reference files like `japan_hanami.jpg` that **do not exist** — our actual file is
`hanami_cherry_blossom_japan.jpeg`).
→ **Use `culture_experience` for text** (3 cards reads better than 2, and matches the
mockups which show 3). Ignore its `image` column; map images ourselves.

**G. `language.Display Value` is not machine-readable.** Values are a mix of decimals
(`0.99`), percent strings (`"15–30%"`), and prose (`"43.6% (Native); ~55% incl. L2"`).
→ **Chart from `Sort Value`** (clean 0–99 numeric); **display `Display Value` as a label.**
This is exactly what the mockups do.

**H. Image URLs are internal.** Every `hero_image`/`flag_image`/`passport_stamp_image`
points at `drive.corp.amazon.com`, which will not load for a public GitHub Pages visitor.
→ **Ignore all URL columns.** Reference local files in `images/` (see §5).

**I. Switzerland has no `_hero` file.** Its `hero_image` column points at
`switzerland.jpeg` — a 496×310 landscape, the smallest image in the set. See §2.3.

### 1.5 Chart recommendations (data-driven)

| Data | Recommended visual | Why |
|---|---|---|
| `time_usage` | **Donut chart**, 5 segments, centre label "24h" | Part-to-whole summing to a meaningful constant. Donut's hole carries the "24 hours" payoff. Matches mockups. |
| `transport` | **Horizontal bar**, sorted desc, 4 bars | Categorical comparison with long labels ("Private Vehicle"). Horizontal = readable labels, no rotation. |
| `food` | **Horizontal bar**, 3 bars | Absolute quantities, not a whole — bars not pie. Only 3 categories, so a pie would be trivial. |
| `language` | **Horizontal bar + text label** | Bar from `Sort Value`, label from `Display Value`. |
| KPI values | **Stat tiles with animated count-up** — *not a chart* | 5 unrelated units (score, years, hours, people, visitors). Never chart mixed units together. |
| `population` across countries | **Log scale, or omit** | 160× spread (9M vs 1.46B) makes a linear bar chart useless — Switzerland becomes 1 pixel. |
| Cross-country comparison | **Small multiples** (5 mini donuts side by side) | Lets the eye compare shape without a 5-series legend. Best for the finale. |
| Ranks | **"Rank 55 of 143" as text under each tile** | Gives scale cheaply. Already in the mockups. |

**Charts I deliberately do NOT recommend:** radar/spider charts (mixed units, hard to
read, corporate-dashboard signal), stacked bars for time usage (the donut's 24h centre
is stronger), and any 3D or gradient-filled chart.

---

## 2. Asset Audit

43 files, 28 MB. Cross-checked every registry entry against disk.

### 2.1 Registry vs disk

**One mismatch found:** the registry lists `did_you_know_japan.jpeg`; the actual file is
`did_you know_japan.jpeg` — **a space instead of the first underscore.** A space in a
filename breaks URL references silently in some build setups.
→ **Rename to `did_you_know_japan.jpeg`.** Everything else matches exactly (43 = 43).

### 2.2 Asset classification by aspect ratio

Aspect ratio, not filename, tells us how an image can actually be used.

| Group | Files | Ratio | Verdict |
|---|---|---|---|
| **True heroes** | `japan_hero` 1308×736, `italy_hero` 1319×736 | 1.78 (16:9) | Full-bleed ready |
| **Weak heroes** | `india_hero` 735×588 (1.25), `us_hero` 735×457 (1.61), `switzerland.jpeg` 496×310 (1.60) | mixed | **Too small for full-bleed.** 735px wide on a 1440px screen = visibly soft. |
| **Portrait story** | `city_japan`, `spices_india`, `traditional_bazaar_india`, `india_flag` (0.56) | 0.56 (9:16) | Excellent for tall editorial cards / mobile |
| **Portrait-ish story** | `food_japan`, `hanami`, `holi_festival_india`, `us_flag`, `temple_japan`, `thali_india` | 0.67–0.80 | Standard card images |
| **Square** | `tea_ceremony_japan`, `train`, `switzerland_flag` (1.00) | 1.00 | Grid tiles |
| **Passport stamps** | `japan_pp` 563×567, `india_pp` 736×729, `italy_pp` 428×426, `switzerland_pp` 400×400, `us_pp` 336×336 | ~1.00 | All square — good. Verified `japan_pp` is a genuine rubber-stamp graphic on white. |
| **Ultra-wide titles** | `japan_title` 2097×750 (2.80), `india_title` 1916×821 (2.33) | 2.3–2.8 | Verified: cinematic Mt-Fuji-and-pagoda banner with a **white bottom band** |
| **Traveler avatars** | `traveler_japan` 1126×1397, `traveler_india` 1117×1408 | 0.80 | Verified: anime-style backpacker holding a passport, on white |
| **Reference only** | 5 `*_dash.png`, `top_part_of_dashboard`, `traveler_note_japan` | 1.50 / 3.00 | Never shipped |

### 2.3 Critical asset gaps

| Gap | Impact | Recommendation |
|---|---|---|
| **Italy has 0 story images** | Italy section will look empty next to Japan's 8 | Source 3 (piazza, pasta, historic street) to match `culture_experience` copy |
| **United States has 0 story images** | Same | Source 3 (national park, road trip, sports) |
| **Switzerland has 1 low-res image** | Its only visual is 496×310 — cannot be a hero *and* a story card | Source 1 hero (≥1600px) + 3 story images |
| **Only Japan + India have title graphics** | Inconsistent — 2 of 5 countries | **Don't use title graphics at all.** Render country names as live text instead (see §7.2) |
| **Only Japan + India have traveler avatars** | Same inconsistency | Use one avatar as a **global mascot**, not per-country |
| **`switzerland.jpeg` is named inconsistently** | Every other hero is `<country>_hero` | Rename `switzerland_hero.jpeg` when replaced |
| **Passport stamps vary 336px–736px** | `us_pp` at 336px will blur if displayed large | Cap display size at ~200px, or re-source |

**Total additional assets needed: 10** (1 CH hero + 3 IT + 3 US + 3 CH story images).
Until then, §7.3 describes a graceful fallback so the site looks intentional, not broken.

### 2.4 Weight problem

`images/` is 28 MB. The 12 files over 1 MB are all PNGs of photographic content —
the wrong format. Converting to WebP at quality 82 typically cuts 85–90%.

| | Now | Projected |
|---|---|---|
| Shipped images | ~17 MB (excl. references) | **~2 MB** |
| Largest single file | 2.47 MB | ~180 KB |

A 17 MB page load is ~30 s on average mobile data — visitors leave before the hero
renders. **This is the single biggest technical risk to the "premium" goal** and is
scheduled as Milestone 7, before deployment.

### 2.5 The dashboard mockups are a gift

I inspected `japan_dash.png` and `india_dash.png` in full. They are not rough sketches —
they are complete, consistent layout designs, and they answer most of the questions this
session was convened to ask. Extracted facts:

- Background is **warm paper cream `#FDF9F3`**, not dark. My Session-1 placeholder was
  dark slate; the mockups override it.
- Layout is a **left sidebar** (brand, mascot, country picker, journey checklist,
  "Collect stamps, collect stories!") + **main content grid**.
- Top strip: **journey route** with flags and dashed flight paths + 3 global stats.
- Hero band: `welcome_title` + `intro_story` + `Day 1–6` chip + arrival stamp + 5 KPI tiles.
- Content row 1: *A Day in* (donut) | *What People Eat* (bars) | *Getting Around* (commute + modes).
- Each panel carries its own **Traveler's Observation** tinted callout.
- Content row 2: Languages | Cultural Experiences (3 cards) | Did You Know | Traveler's Note | Passport Stamp.
- Footer: **source citations** — World Happiness Report 2024, WHO 2023, OECD, World Bank, UN, OpenFlights.
- Bottom right: **Next Stop: India** with a "Continue Journey" button + comparison table.
- Per-country accent colour, sampled: Japan indigo-blue, India saffron-brown, Italy
  amber/terracotta, Switzerland steel-blue, US navy + red.

**Consequence for architecture:** I will not invent a layout. The blueprint below is a
faithful *scroll-native translation* of this design — because a 1536×1024 dashboard grid
does not work on a phone, and the brief asks for immersive scrolling, not a dashboard.

---

## 3. Design Language

The mockups establish the direction; this codifies it.

### 3.1 Foundations

**Surface — warm paper, not dark.** `#FDF9F3` cream base with white cards. This is the
National Geographic / print-magazine register, and it's what the mockups use. It also
makes photography glow rather than compete.

**Type — a two-family system.**
- *Display:* a high-contrast serif (Fraunces or Playfair Display) for country names and
  section titles. Serif at large size is the single strongest "editorial, not dashboard" signal.
- *Body & data:* a clean humanist sans (Inter) for paragraphs, labels, axes, numbers.
- Country names set **large** — 72–140px on desktop. Apple-scale typography.

**Colour — neutral shell, country accent.** The shell (cream, ink `#1A1A1A`, warm grey)
never changes. Each country contributes exactly one accent, applied to KPI numerals,
chart primaries, and the active nav state. Accents derived from the mockups:

| Country | Accent | Source |
|---|---|---|
| Japan | Indigo `#2C4A7C` | Sampled from mockup |
| India | Saffron `#D2691E` | Sampled |
| Italy | Terracotta `#C07830` | Sampled |
| Switzerland | Alpine steel `#306078` | Sampled |
| United States | Navy `#1F3864` | Sampled |

**Chart palette — one categorical set, reused everywhere.** Charts must not restate the
country accent for every series, or the donut becomes 5 shades of one hue and unreadable.
Per the `dataviz` guidance we'll validate a 5-colour categorical ramp for contrast in
both light and dark, and use the country accent only for *single-series* charts (bars).

### 3.2 What makes it not-a-dashboard

| Dashboard reflex | What we do instead |
|---|---|
| Dense grid, everything visible at once | One idea per viewport, revealed by scroll |
| Chart borders, gridlines, tick marks | Minimal axes, no chart chrome, generous whitespace |
| "Metrics" framing | Human framing: "A Day in Japan", not "Time Allocation" |
| Numbers presented bare | Every number paired with a first-person observation |
| Uniform card sizes | Deliberate asymmetry; full-bleed photography between sections |
| Instant render | Staged entrance — numbers count up, charts draw in |

### 3.3 Motion principles

- **Purposeful, never decorative.** Motion signals arrival, hierarchy, or causality.
- **Fast in, slow out.** 300–600 ms, `easeOut`. Nothing bounces.
- **Once, not on every pass.** Scroll animations fire once (`viewport={{ once: true }}`).
- **Respect `prefers-reduced-motion`.** Non-negotiable accessibility requirement; content
  must be fully readable with all animation disabled.

---

## 4. Site Map & User Journey

### 4.1 Structure decision: one scrolling page, or five routes?

**Recommendation: a single scroll-driven page per country, with client-side routing
between countries.** Reasoning: the brief's metaphor is a *journey* — sequential, with
a beginning and an end. Five sibling pages plus a landing and finale = 7 routes.

But there's a real constraint: **GitHub Pages cannot serve client-side routes directly.**
Visiting `/japan` returns 404 because no such file exists. Two escapes: hash routing
(`/#/japan` — ugly but bulletproof) or a `404.html` redirect shim. **I recommend hash
routing** for a portfolio piece — zero-config, always works, and the URL is still shareable.

### 4.2 Site map

```
/#/                     Landing — "One Journey. Many Ways of Living."
                        Full-bleed hero, journey premise, 5-country route preview,
                        global stats (5 countries / 27,600 km / 28 days), Begin CTA

/#/japan                Country experience  (arrival_order 1, Days 1–6)
/#/india                Country experience  (arrival_order 2, Days 7–13)
/#/italy                Country experience  (arrival_order 3, Days 14–18)
/#/switzerland          Country experience  (arrival_order 4, Days 19–23)
/#/united-states        Country experience  (arrival_order 5, Days 24–28)

/#/passport             Journey Passport — all 5 stamps, journey recap
/#/compare              The Comparison — all 5 countries side by side
/#/about                Sources, methodology, credits
```

Persistent across all routes: a slim top nav with the 5-stop route as a progress
indicator, plus a scroll-progress bar.

### 4.3 The user journey

**Act I — Invitation** (Landing). Full-bleed photography, the title set large, one
sentence of premise. Below: the route as 5 flags on a dashed flight path. One clear
action: *Begin the Journey*. No data yet — this section sells curiosity.

**Act II — Immersion** (5 country pages). Each follows the identical template (§5) so
the visitor learns the rhythm once and then reads content, not interface. Order is
`arrival_order`. Each ends with a *Next Stop* handoff that names the next country and
teases it — the mechanism that keeps people moving.

**Act III — Reflection** (Passport + Compare). The payoff. The passport fills with the
5 stamps collected; Compare finally shows all countries together, which is where the
theme lands: there is no single best way to live. Japan lives longest, Switzerland is
happiest, India works hardest, Italy rests most, the US drives everywhere.

### 4.4 Scroll experience

Scroll is the primary interaction — the "travelling" feeling comes from it.

| Technique | Where | Notes |
|---|---|---|
| **Scroll-triggered reveal** | Every section | Content fades + rises 24px on entry. The workhorse. |
| **Hero parallax** | Country heroes | Image moves slower than scroll. Subtle — 15% max. |
| **Sticky section label** | Data sections | Country name pins while its charts scroll past — keeps context. |
| **Count-up on entry** | KPI tiles | Numbers animate 0 → value when scrolled into view. |
| **Progressive chart draw** | All charts | Donut sweeps, bars grow from zero. |
| **Full-bleed image breaks** | Between data sections | Breathing room; resets attention between ideas. |
| **Route progress** | Top nav | Fills as the visitor advances through the 5 stops. |

**Explicitly rejected:** scroll-jacking (hijacking the wheel to snap between sections).
It feels premium in a demo and infuriating in use, breaks keyboard and screen-reader
navigation, and is a known accessibility failure. Native scroll, enhanced.

---

## 5. Country Page Template

Identical for all 5 countries — this is what makes it a *template* and what lets us
build it once. Sections in scroll order:

| # | Section | Data source | Visual |
|---|---|---|---|
| 1 | **Arrival Hero** | `hero_story`, `country_master` | Full-bleed image, country name in display serif, `intro_story`, `Day X–Y` chip, arrival stamp |
| 2 | **At a Glance** | `country_master` + `kpi_icon` | 5 stat tiles, count-up, rank beneath each |
| 3 | **A Day in _____** | `time_usage` | Donut, 24h centre label + `traveler_observation[Time Usage]` |
| 4 | **What People Eat** | `food` | Horizontal bars + `traveler_observation[Food]` |
| 5 | *Image break* | assets | Full-bleed food or city photograph |
| 6 | **Getting Around** | `transport`, `avg_one_way_commute_minutes` | Big commute number + sorted mode bars + observation |
| 7 | **How People Speak** | `language` | Bars from `Sort Value`, labels from `Display Value` + observation |
| 8 | **Cultural Experiences** | `culture_experience` | 3 photo cards + observation |
| 9 | **Did You Know?** | `storyteling.did_you_know` | Editorial pull-quote panel |
| 10 | **Traveler's Note** | `storyteling.traveler_note` | Handwritten-feel card, first person |
| 11 | **Passport Stamp** | `*_pp.jpeg` | Stamp presses in with a slight rotation — the reward |
| 12 | **Next Stop** | next country by `arrival_order` | Teaser + Continue Journey CTA |

### 5.1 Information hierarchy

Within every section, a strict 4-level order:

1. **Photograph or big number** — the emotional hook, largest element
2. **Section title** — display serif, tells you what you're looking at
3. **The visualization** — the evidence
4. **Traveler's observation** — the human meaning, tinted callout

Level 4 is what separates this from a dashboard. A dashboard stops at level 3.

### 5.2 Data-to-component mapping

| Component | Consumes | Shape |
|---|---|---|
| `CountryHero` | `hero_story`, `country_master`, hero asset | 1 object |
| `StatTileRow` | `country_master` (6 KPI + 6 rank cols), `kpi_icon` | 5 tiles |
| `TimeUsageDonut` | `time_usage` filtered by country | 5 rows |
| `FoodBarChart` | `food` filtered by country | 3 rows |
| `TransportBars` | `transport` filtered, sorted by `sort_order` | 4 rows |
| `LanguageBars` | `language` filtered, `Sort Value` + `Display Value` | 3 rows |
| `CultureCardGrid` | `culture_experience` filtered, by `display_order` | 3 rows |
| `ObservationCallout` | `traveler_observation` by (country, section) | 1 row |
| `DidYouKnowPanel` | `storyteling.did_you_know` | 1 string |
| `TravelerNoteCard` | `storyteling.traveler_note` | 1 string |
| `PassportStamp` | `*_pp.jpeg` + `arrival_order` | 1 asset |
| `NextStopCTA` | next country by `arrival_order` | 1 object |
| `JourneyRoute` | all 5 `country_master` rows | 5 objects |
| `ComparisonTable` | all 5, all KPIs | 5 × 6 |
| `JourneyPassport` | all 5 stamps | 5 assets |

### 5.3 Asset mapping

Note the deliberate departures from the registry, each justified:

| Country | Hero | Story images (3) | Stamp | Flag |
|---|---|---|---|---|
| Japan | `japan_hero.jpeg` ✅ | `hanami…`, `tea_ceremony…`, `shinkansen…` | `japan_pp` | `japan_flag` |
| India | `india_hero.jpeg` ⚠️ low-res | `holi_festival…`, `traditional_bazaar…`, `thali…` | `india_pp` | `india_flag` |
| Italy | `italy_hero.jpeg` ✅ | ❌ **none — needs 3** | `italy_pp` | `italy_flag` |
| Switzerland | `switzerland.jpeg` ⚠️ 496px | ❌ **none — needs 3** | `switzerland_pp` | `switzerland_flag` |
| United States | `us_hero.jpeg` ⚠️ low-res | ❌ **none — needs 3** | `us_pp` | `us_flag` |

**Spare Japan assets** (`city_japan`, `temple_japan`, `food_japan`, `transport_train_japan`,
`did_you_know_japan`) → full-bleed image breaks in the Japan section.
**Shared:** `train.jpeg` → Compare page transport section. `traveler_japan.png` → global
mascot on Landing and Passport. `traveler_note_japan.png` → texture behind Traveler's Note.
**Never shipped:** all 5 `*_dash.png`, `top_part_of_dashboard.png`.
**Not used:** `japan_title.png`, `india_title.png` (only 2 of 5 exist → live text instead);
`france/netherlands/sweden_hero.jpeg` (not in scope).

---

## 6. Component Inventory

Organised by reuse level — a reusable primitive is only worth extracting when used 3+ times.

**Layout & chrome (6)** — `SiteHeader`, `RouteProgressNav`, `ScrollProgressBar`,
`SiteFooter` (with source citations), `PageShell`, `SectionContainer`

**Primitives (8)** — `SectionTitle`, `StatTile`, `Callout`, `PhotoCard`, `FullBleedImage`,
`Chip`, `Button`, `RevealOnScroll` *(wraps Framer Motion; used by nearly every section —
the highest-value abstraction in the project)*

**Charts (5)** — `TimeUsageDonut`, `FoodBarChart`, `TransportBars`, `LanguageBars`,
`ChartFrame` *(shared title + legend + responsive wrapper so no chart re-implements chrome)*

**Country sections (12)** — one per template row in §5

**Journey-level (5)** — `JourneyRoute`, `JourneyStats`, `JourneyPassport`,
`ComparisonTable`, `SmallMultiplesDonuts`

**Utilities (4)** — `useCountryData`, `useCountUp`, `useReducedMotion`, `formatters`
(population → "1.46B", scores → 1 decimal)

**~40 components.** Roughly 20 are built once and reused 5× across countries.

---

## 7. Key Recommendations Requiring Your Decision

### 7.1 Data format: keep Excel, or convert to JSON?
**Recommendation: convert to JSON once, commit the output.** A browser cannot read
`.xlsx` without shipping a ~400 KB parser and paying a runtime parse cost. I'd write a
small Node script that reads the workbook and emits `src/data/*.json`, re-runnable when
data changes. This is an ETL step — familiar territory for you.

### 7.2 Country titles: image or live text?
**Recommendation: live text.** Only Japan and India have title PNGs, they're 1.6–2.3 MB
each, and text is selectable, translatable, searchable, and screen-reader accessible.
A well-set serif at 120px looks better than a rasterised title anyway.

### 7.3 Handling the 3 countries with no story images
**Recommendation: build a graceful degradation path now.** `CultureCardGrid` renders an
elegant typographic card — accent-tinted background, large emoji from `culture`, title
and description — when no image exists. Italy/US/Switzerland then look *designed*, not
broken, and dropping in real photos later requires no code change.

### 7.4 Dark mode?
**Recommendation: no, not for v1.** The mockups are committed to warm paper. A serious
dark variant doubles the design surface, and every photo and chart palette needs
re-validation. Better to ship one excellent theme.

---

## 8. Folder Organisation

```
src/
├── main.jsx
├── App.jsx                      Routing
├── index.css                    Tailwind + design tokens
│
├── data/                        Generated JSON (committed)
│   ├── countries.json
│   ├── timeUsage.json
│   ├── food.json
│   ├── transport.json
│   ├── languages.json
│   ├── cultureExperiences.json
│   ├── observations.json
│   ├── stories.json
│   └── assetManifest.js         Country → local image paths
│
├── components/
│   ├── layout/                  SiteHeader, PageShell, SiteFooter…
│   ├── ui/                      SectionTitle, StatTile, Callout, RevealOnScroll…
│   ├── charts/                  ChartFrame + the 4 charts
│   ├── country/                 The 12 template sections
│   └── journey/                 JourneyRoute, JourneyPassport, ComparisonTable…
│
├── pages/                       LandingPage, CountryPage, PassportPage,
│                                ComparePage, AboutPage
├── hooks/                       useCountryData, useCountUp, useReducedMotion
├── lib/                         formatters, constants, theme tokens
└── assets/images/               Optimised WebP (build output of scripts/)

scripts/
├── convertData.mjs              Excel → JSON
└── optimizeImages.mjs           PNG/JPEG → WebP

docs/
├── DESIGN.md                    This document
└── ASSET_REGISTRY.md            Your registry, with corrections applied

data-source/                     Original .xlsx + original images (not shipped)
```

Grouping components by **role** (`charts/`, `country/`) rather than by country means
adding a 6th country touches only `data/` — no new components. That's the payoff of the
template approach.

---

## 9. Development Milestones

| # | Milestone | Deliverable | Session est. |
|---|---|---|---|
| **1** | Design tokens & data pipeline | Excel→JSON script, Tailwind theme, folder scaffold. Learn: design tokens, ETL for frontend | 1 |
| **2** | Layout shell & routing | Header, footer, routing, `PageShell`. Learn: routing, composition, `children` | 1 |
| **3** | UI primitives | `SectionTitle`, `StatTile`, `Callout`, `RevealOnScroll`. Learn: **props**, reusability, Framer Motion basics | 1 |
| **4** | First country: Japan | Full template, all 12 sections, best assets. Learn: **state**, data flow, conditional rendering | 2 |
| **5** | Charts | All 4 chart components. Learn: Recharts, responsive charts, accessible data viz | 1–2 |
| **6** | Replicate to 4 countries | Prove the template. Should be ~mostly data. Learn: why abstraction pays | 1 |
| **7** | Landing, Passport, Compare | Acts I & III. Learn: cross-cutting state, animation sequencing | 2 |
| **8** | Responsive & accessibility | Mobile-first pass, keyboard nav, reduced-motion, contrast audit | 1 |
| **9** | Image optimization | WebP conversion, lazy loading, 17 MB → ~2 MB | 1 |
| **10** | Deploy | GitHub Pages, hash routing, Actions workflow | 1 |

**~13 sessions.** Milestone 4 is the pivotal one: once Japan works end-to-end,
milestone 6 is largely data entry.

### Mobile responsiveness strategy

Mobile-first, three breakpoints (`base` / `md` 768 / `lg` 1024). Specific decisions:

- The mockup's **left sidebar becomes a bottom sheet / hamburger** on mobile — a fixed
  sidebar is impossible at 375px.
- **5 KPI tiles → 2-col grid** (not a horizontal scroll; hidden content gets missed).
- **Donut keeps its aspect ratio**, legend moves below.
- **Horizontal bars stay horizontal** — they degrade better than vertical bars, since
  labels never need rotating. A reason to prefer them beyond aesthetics.
- **Portrait story images shine on mobile** — we have plenty at 0.56 ratio.
- **Parallax disabled** below `md` — janky on mobile GPUs and costs battery.
- Touch targets ≥44px; the route nav becomes swipeable.

---

## 10. Open Questions

1. **§7.1** Convert Excel → JSON? (recommended: yes)
2. **§1.4-C** Per-leg flight distances: omit, or recompute from lat/long?
3. **§2.3** Will you source the 10 missing images, or should we ship with typographic fallbacks?
4. **§7.2** Confirm: live text titles instead of `japan_title.png` / `india_title.png`?
5. **§4.1** Confirm hash routing (`/#/japan`) for GitHub Pages compatibility?
6. Are the mockups a **target to match closely**, or a **direction to interpret freely**?
