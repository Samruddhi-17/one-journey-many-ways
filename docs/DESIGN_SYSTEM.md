# Design System

**One Journey. Many Ways of Living.**

Status: **Approved, aligned to Product Vision.** Supersedes the colour section of
[DESIGN.md](DESIGN.md) §3.

> **This document derives its authority from [PRODUCT_VISION.md](PRODUCT_VISION.md).**
> That document decides *why* and *for whom*; this one decides *how it looks and moves* —
> and every decision here states which principle or emotion it serves. Where the two
> conflict, the vision wins and this document is wrong.
>
> Principle references like *(P7)* point to [PRODUCT_VISION.md §8](PRODUCT_VISION.md).

Every colour value in this document was produced by running a validator, not by
eyeballing. Where a value differs from what I proposed in Session 2, the measurement
that forced the change is shown. **Nothing here is a matter of taste that could have
been settled by taste** — which is P16, *accessible by construction*, applied to colour.

---

## 0. Architectural decisions locked in Session 3

Recorded here because the whole system depends on them.

| # | Decision | Consequence for this document |
|---|---|---|
| 1 | Excel → validate → clean → JSON → React. App consumes JSON only. | §13 folder structure; pipeline is documented + repeatable |
| 2 | No manual flight distances. Derive from lat/long, or omit. | §12 — **recommendation: omit entirely** |
| 3 | Do not force image parity across countries. | §11 — asymmetric layout variants, not filler |
| 4 | No title PNGs. Typography: flag emoji + name + epithet. | §2.6 country title lockup |
| 5 | HashRouter for GitHub Pages. | Nav spec §9 |
| 6 | Mockups = intent, not pixel spec. | Whole document translates rather than copies |
| 7 | Image optimisation deferred to final milestone. | Not in this document |
| 8 | **Each country has a distinct emotional atmosphere.** | §3 atmosphere system — the spine of the whole thing |

---

## 1. How this document relates to the Product Vision

**The five principles that used to live here have been removed.** They restated what
[PRODUCT_VISION.md §8](PRODUCT_VISION.md) now owns, and two sources of truth for the same
rule is how documents drift apart. The vision holds the 17 principles; this document holds
their visual consequences.

One rule *is* specific to this layer and stays, because it isn't a principle so much as an
architectural pattern:

**The shell is silent; the country speaks.** Chrome — navigation, footer, cards, spacing,
grid — is identical everywhere and deliberately neutral. Only colour, pace, imagery and
microcopy change per country. That contrast is what makes an arrival feel like an arrival,
and it is how P13 (*consistent structure, distinct atmosphere*) becomes buildable.

### Traceability

Every section below names the vision principle it implements:

| This document | Serves |
|---|---|
| §2 Typography | P1 story before statistics · P9 simplicity · §4 emotional register |
| §3 Atmosphere | P13 consistent structure, distinct atmosphere · §4.2 five atmospheres |
| §4 Colour | P16 accessible by construction · **§7.4 no ranking through colour** |
| §5 Spacing | P4 one idea per moment · P9 simplicity over decoration |
| §6 Elevation | P9 simplicity — the anti-dashboard decision |
| §7 Animation | P11 every animation has intent · P12 visitor stays in control |
| §8 Iconography | P10 every image advances the narrative · P14 one voice |
| §9 Buttons | P2 emotion before interaction |
| §10 Navigation | §2.3 journey as structure · P12 control |
| §11 Asymmetric content | P10 every image advances the narrative |
| §12 Distance | P15 accuracy is not negotiable |
| §13 Data pipeline | P15 accuracy · P17 honest about what we don't know |
| §14 Breakpoints | §3.5 mobile is the real product |
| §15 Accessibility | P16 accessible by construction |
| §16 Naming | maintainability — no vision principle; a craft concern |

### What the approved vision changed in this document

Three amendments, recorded rather than silently applied:

1. **§7.4 forbids ranking through form.** Countries are never sorted by metric value and
   never coloured by a sequential ramp. Both were live risks in a comparison view — §4.4
   now states the prohibition where a future chart author will read it.
2. **Chart titles become questions** (P7 — *data should answer questions, not end
   conversations*). "How do people get around?" not "Transport modes." This is a typographic
   and copy rule, so it belongs here as well as in the vision.
3. **The Compare page is out of scope for now** (your instruction). Its colour validation
   stands as measured fact for whenever we revisit it; nothing is built.

---

## 2. Typography

### 2.1 Why two families

A single font family cannot do both jobs here. Long-form editorial prose wants a serif's
warmth and rhythm; dense numeric labels on a chart axis want a sans-serif's clarity at
11px. Using one family for both means one of the two jobs is done badly.

**Display — Fraunces** (variable serif, Google Fonts, open source).
High contrast, a slight old-style warmth, and a `SOFT`/`WONK` axis that lets it feel
editorial rather than corporate. This is the National Geographic register. Used for
country names, section titles, pull-quotes, and hero numerals.

**Text & data — Inter** (variable sans, Google Fonts, open source).
Designed for screen UI at small sizes; has **tabular figures**, which matter more than
they sound — without them, an animated count-up visibly jitters as digit widths change.
Used for body copy, labels, axes, nav, buttons, and all data values.

**Why not a third "handwritten" font for Traveler's Notes?** Tempting, and the mockups
imply it. Rejected: script faces are hard to read at body size, usually fail WCAG on
stroke contrast, and add a third font download. We get the same effect with an italic
Fraunces at a larger size on a tinted card — §8.3.

### 2.2 Loading strategy

Variable fonts, `woff2`, self-hosted (not Google's CDN — one less third-party request and
no privacy concern), `font-display: swap`, and **only the weights we use**. Two variable
files ≈ 90 KB total. Preload the two used in the first viewport.

### 2.3 Type scale

A **1.25 (major third) modular scale**, rounded to whole pixels. A ratio-based scale means
sizes relate to each other visibly rather than arbitrarily — the same reason you'd use a
consistent axis scale rather than hand-picked tick marks.

| Token | Size (desktop) | Mobile | Family / weight | Line height | Use |
|---|---|---|---|---|---|
| `display-hero` | 120px | 56px | Fraunces 600 | 0.95 | Country name on arrival hero |
| `display-1` | 76px | 40px | Fraunces 600 | 1.05 | Landing title, big statements |
| `display-2` | 56px | 32px | Fraunces 600 | 1.1 | Section titles |
| `display-3` | 40px | 28px | Fraunces 500 | 1.15 | Sub-section titles |
| `stat-hero` | 64px | 44px | Fraunces 600 *tabular* | 1 | KPI numerals, commute minutes |
| `stat-lg` | 40px | 32px | Inter 600 *tabular* | 1 | Donut centre, secondary stats |
| `quote` | 32px | 24px | Fraunces 400 *italic* | 1.4 | Did You Know, Traveler's Note |
| `body-lg` | 20px | 18px | Inter 400 | 1.65 | Intro paragraphs, `intro_story` |
| `body` | 17px | 16px | Inter 400 | 1.65 | Default body |
| `body-sm` | 15px | 14px | Inter 400 | 1.55 | Card descriptions, observations |
| `label` | 13px | 13px | Inter 500 | 1.4 | Chart labels, KPI captions |
| `label-xs` | 11px | 11px | Inter 500 | 1.35 | Axis ticks, ranks, footnotes |
| `overline` | 12px | 12px | Inter 600, `0.12em` tracking, uppercase | 1.3 | Section eyebrow ("STOP 01") |

**Line height reasoning:** display sizes get tight leading (0.95–1.15) because large type
with loose leading looks disconnected; body gets 1.65 because long-form reading needs
breathing room — noticeably looser than a dashboard's typical 1.4.

**Measure (line length):** body text capped at **68 characters** (`max-width: 65ch`).
Beyond ~75 the eye loses its place returning to the next line. This is why the content
column is narrower than the image column.

### 2.4 Heading hierarchy

Semantic HTML level and visual size are **decoupled**. A screen reader navigates by
`h1`/`h2`/`h3`; a sighted reader navigates by size. Both must be correct independently.

| Semantic | Visual token | Rule |
|---|---|---|
| `h1` | `display-hero` | **Exactly one per page.** Country name on a country page. |
| `h2` | `display-2` | One per major section (the 12 template sections) |
| `h3` | `display-3` | Sub-sections, card titles |
| `h4` | `label` uppercase | Rare — chart titles inside a panel |

Never skip a level to get a size. Size comes from a class; the tag comes from structure.

### 2.5 Paragraph styles

- Body copy: `body`, `ink-700`, max `65ch`, `1.65` leading, no first-line indent.
- Lead paragraph (first in a section): `body-lg`, `ink-700`.
- No justified text — creates rivers of whitespace without hyphenation control.
- No paragraph indents *and* space between; pick space between (web convention).
- Emphasis via `<em>` italic Fraunces or `<strong>` Inter 600, never colour alone.

### 2.6 Country title lockup (decision #4)

Replaces the title PNGs. Vertical stack, centre-aligned on the hero:

```
      🇯🇵                      ← flag emoji, 48px  (decorative, aria-hidden)
     JAPAN                     ← display-hero, Fraunces 600, cream on image scrim
Land of the Rising Sun         ← body-lg, italic, 0.05em tracking, 85% opacity
   ── STOP 01 · DAYS 1–6 ──    ← overline, with hairline rules
```

Epithets (my proposals — these are editorial copy, so tell me if you'd word them differently):

| Country | Epithet | Rationale |
|---|---|---|
| Japan | Land of the Rising Sun | Canonical, universally recognised |
| India | A Land of Many Worlds | Echoes the dataset's own `traveler_note` — "every state felt like a new country" |
| Italy | Where History Lives Outdoors | From its `traveler_note` — "history wasn't confined to museums" |
| Switzerland | Where the Mountains Keep Time | Ties the alpine imagery to the precision theme |
| United States | Many Journeys in One | From its `traveler_note` — "one country feel like many destinations" |

Three of five are drawn from your own dataset copy, which keeps the voice consistent.

**Accessibility note:** the flag emoji is `aria-hidden` — screen readers announce
"regional indicator symbol J, regional indicator symbol P" otherwise, which is noise.
The country name in text carries the meaning.

---

## 3. Atmosphere System (Direction #8)

This is the part of your feedback that changes the architecture most, so it gets its own
first-class layer rather than being sprinkled into other sections.

### 3.1 The problem it solves

A shared template applied to five countries risks producing five identical pages with
different photos — informative but emotionally flat. Your five atmospheres are the fix.
But "make Japan feel calm" is not implementable. So each atmosphere is **compiled down
to concrete token values** that components read.

### 3.2 The atmosphere token contract

Every country supplies exactly these values. Components never hardcode a country; they
read the active atmosphere. This is what keeps 5 countries from becoming 5 codebases.

| Token | Type | What it drives |
|---|---|---|
| `accentMark` | hex | Chart bar/mark fill (validated, §4.3) |
| `accentInk` | hex | KPI numerals, links, active nav (text-contrast safe) |
| `accentWash` | hex | 6–8% tint for callout backgrounds |
| `motionPace` | multiplier | Scales every duration — the core "feel" lever |
| `motionEase` | cubic-bezier | Entry character |
| `revealStyle` | enum | How content enters |
| `staggerMs` | ms | Delay between sibling reveals |
| `letterSpacing` | em | Display tracking adjustment |
| `iconMotif` | enum | Divider glyph + stamp flourish |
| `microcopyVoice` | enum | Guides section subtitle wording |

### 3.3 The five atmospheres

**🇯🇵 Japan — calm · precision · technology · discipline**
| | |
|---|---|
| Pace | `0.9×` — *slightly slower*, deliberate |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` — symmetrical, machined, no overshoot |
| Reveal | `fade-precise` — opacity + 16px rise, no scale, no blur |
| Stagger | 90 ms — measured, metronomic |
| Tracking | `-0.01em` — tight, controlled |
| Motif | Torii / seigaiha wave hairline |
| Voice | Restrained, observational. "How 24 hours are spent." |
| Rationale | Precision reads as *predictable* motion: uniform intervals, no bounce. Discipline is the absence of flourish. |

**🇮🇳 India — energy · community · culture · celebration**
| | |
|---|---|
| Pace | `1.15×` — *faster*, more immediate |
| Easing | `cubic-bezier(0.34, 1.32, 0.64, 1)` — slight overshoot, alive |
| Reveal | `fade-bloom` — opacity + 20px rise + 0.97→1 scale |
| Stagger | 55 ms — rapid, overlapping, crowd-like |
| Tracking | `0em` |
| Motif | Rangoli / marigold dot pattern |
| Voice | Warm, exclamatory. "A day that never quite slows down." |
| Rationale | Energy = faster arrival + tighter stagger so elements pile in like a crowd. The only atmosphere permitted overshoot. |

**🇮🇹 Italy — history · art · food · slow living**
| | |
|---|---|
| Pace | `1.3×` — *slowest*, unhurried |
| Easing | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — gentle, no urgency |
| Reveal | `fade-drift` — opacity + 24px rise + long tail |
| Stagger | 130 ms — the longest; things arrive one at a time |
| Tracking | `0.005em` — slightly open, classical |
| Motif | Arch / laurel hairline |
| Voice | Sensory, leisurely. "Where the day is something to be savoured." |
| Rationale | *Slow living* is the easiest atmosphere to express in motion and the most convincing — long durations and long stagger literally make the visitor wait, which is the point. |

**🇨🇭 Switzerland — nature · peace · quality · balance**
| | |
|---|---|
| Pace | `1.1×` — calm but crisp |
| Easing | `cubic-bezier(0.33, 1, 0.68, 1)` — clean deceleration, glide |
| Reveal | `fade-settle` — opacity + 18px rise, settles without overshoot |
| Stagger | 100 ms — even, balanced |
| Tracking | `0em` |
| Motif | Peak / snowflake hairline |
| Voice | Serene, exact. "A day in balance." |
| Rationale | *Balance* = perfectly even stagger and symmetrical layout. *Peace* = nothing overshoots or bounces. |

**🇺🇸 United States — innovation · ambition · scale · opportunity**
| | |
|---|---|
| Pace | `1.0×` — baseline, confident |
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` — strong decisive deceleration |
| Reveal | `fade-expand` — opacity + 20px rise + slight horizontal widening |
| Stagger | 70 ms |
| Tracking | `-0.005em` |
| Motif | Route-66 dashed line / star hairline |
| Voice | Bold, expansive. "Fifty ways to spend a day." |
| Rationale | *Scale* is expressed by the widening reveal and the largest display type. *Ambition* = decisive easing that arrives fast and stops hard. |

### 3.4 Guardrails

Atmosphere must not become inconsistency. Three hard limits:

1. **Pace multiplier clamped to 0.85×–1.35×.** Beyond that, sections feel broken rather
   than characterful. Slowest ÷ fastest = 1.44 — perceptible, never jarring.
2. **Structure never varies.** Same 12 sections, same order, same grid, same spacing.
   Only colour, timing, and copy change.
3. **`prefers-reduced-motion` collapses all five to one** — instant opacity fade, zero
   transform, zero stagger. Atmosphere is an enhancement; content is the guarantee.

---

## 4. Colour Tokens

**Everything in this section was validated by running
`scripts/validate_palette.js` from the `dataviz` skill against our actual surface colour.
Measured ratios are shown. Two of my Session-2 proposals failed and were replaced.**

### 4.1 Surfaces

Sampled directly from your mockups (`#FDF9F3` at `japan_dash.png`), not invented.

| Token | Hex | Role |
|---|---|---|
| `surface-page` | `#FDF9F3` | Warm paper base — the signature |
| `surface-card` | `#FFFFFF` | Cards, panels, chart plots |
| `surface-sunken` | `#F6F1E8` | Inset wells, alternating bands |
| `surface-ink` | `#1A1815` | Rare dark full-bleed sections |
| `surface-scrim` | `rgba(26,24,21,0.55)` | Over hero photos so text stays legible |

**Why warm cream, not white or dark?** Cream is the print-magazine register the whole
project is aiming at; it also makes photography glow instead of compete, whereas pure
white makes photos look like cut-outs. And a dark UI would fight all 43 of your daylight
photographs.

### 4.2 Neutral ink scale — *measured*

Contrast measured against `surface-page` `#FDF9F3`:

| Token | Hex | vs cream | Verdict | Use |
|---|---|---|---|---|
| `ink-900` | `#1A1815` | **16.89:1** | body ✅ | Display headings |
| `ink-700` | `#3D3833` | **11.05:1** | body ✅ | Body copy (default) |
| `ink-500` | `#6B635A` | **5.63:1** | body ✅ | Secondary text, captions, axes |
| `ink-400` | `#8A8178` | **3.65:1** | large/UI only ⚠️ | Placeholder, disabled — **never body text** |
| `ink-300` | `#A9A19A` | 2.43:1 | decorative | Icons paired with text |
| `ink-200` | `#D6D0C7` | 1.46:1 | decorative | **Borders, dividers** |
| `ink-100` | `#EBE6DE` | 1.18:1 | decorative | Subtle fills, chart gridlines |

The neutrals are warm-tinted (a touch of yellow/red), not pure grey. Pure grey against
cream looks dirty; warm grey looks intentional.

`ink-200` at 1.46:1 is *deliberately* below text thresholds — a divider that meets text
contrast is a divider that shouts. Visible, recessive.

### 4.3 Country accents — **replaced after validation failure**

I proposed five accents in Session 2, sampled from your mockups. **They failed.** Run:

```
node scripts/validate_palette.js "#2C4A7C,#D2691E,#C07830,#306078,#1F3864" \
  --mode light --surface "#FDF9F3"
```
```
[FAIL] Lightness band     outside band: #2C4A7C (0.412), #1F3864 (0.345)
[FAIL] Chroma floor       reads gray: #2C4A7C (0.092), #306078 (0.065), #1F3864 (0.083)
[FAIL] CVD separation     worst #C07830↔#D2691E ΔE 1.3 (deutan)
[FAIL] Normal-vision      worst #C07830↔#D2691E ΔE 4.2 — below 15
```

Two real defects: **India's saffron and Italy's terracotta are functionally the same
colour** (ΔE 4.2 — indistinguishable even with full colour vision, and they appear side
by side in the route nav and comparison table); and three accents are so desaturated they
read as grey rather than as identity.

I enumerated 5-colour combinations from theme-appropriate candidate pools and kept only
those passing every gate under the harder **all-pairs** test. 140 passed; this is the set
whose hues best match the atmospheres:

| Country | `accentMark` | `accentInk` | Text contrast | Theme fit |
|---|---|---|---|---|
| Japan | `#2a78d6` | `#184f95` | **7.73:1** ✅ | Indigo — calm, precision |
| India | `#d95926` | `#B4530A` | **4.79:1** ✅ | Saffron — energy, celebration |
| Italy | `#9E2A2B` | `#87201F` | **8.87:1** ✅ | Terracotta red — history, food |
| Switzerland | `#199e70` | `#0F7A55` | **5.09:1** ✅ | Alpine green — nature, balance |
| United States | `#4a3aa7` | `#3E3090` | **9.86:1** ✅ | Violet — ambition, innovation |

Final validation, all-pairs on our cream surface:
```
[PASS] Lightness band       all 5 inside L 0.43–0.77
[PASS] Chroma floor         all 5 >= 0.1
[PASS] CVD separation       worst #199e70↔#d95926 ΔE 9.4 (deutan)   [target >=8]
[PASS] Normal-vision floor  worst #9E2A2B↔#d95926 ΔE 16.1           [floor >=15]
[PASS] Contrast vs surface  all 5 >= 3:1
→ ALL CHECKS PASS
```

**Why two tokens per country.** `accentMark` is tuned for *chart fills* (needs ≥3:1 vs
surface and mutual separation); `accentInk` is a darker step of the same hue for *text*
(needs ≥4.5:1). Using one colour for both is the standard mistake: either the text is
unreadable or the chart marks are muddy. `accentWash` = same hue at 6–8% for callout tints.

India and Italy now sit at ΔE 16.1 — comfortably distinguishable. Note India's mark
(`#d95926`, 3.70:1) is *only* legal as a mark, never as text; that's exactly why
`accentInk` exists.

### 4.4 Chart colours

Per the method: colour is assigned by the **job** it does, never picked to look nice.

**Time usage (donut, 5 segments) — ORDINAL, not categorical.** The activities are
ordered by nature (work → sleep → leisure → housework → commuting are shares of one
ordered day), and five categorical hues in one donut *failed*:
```
categorical 5-hue donut:  [FAIL] Normal-vision  #eda100↔#eb6834 ΔE 13.7 — below 15
```
A single-hue ordinal ramp is both more honest and passes:
```
node scripts/validate_palette.js "#86b6ef,#5598e7,#2a78d6,#184f95,#0d366b" \
  --mode light --surface "#FFFFFF" --ordinal
[PASS] Lightness monotone   steps read light→dark
[PASS] Adjacent ΔL          all gaps >= 0.06
[PASS] Light-end contrast   #86b6ef at 2.11:1
[PASS] Single hue           hue spread 4°
→ ALL CHECKS PASS
```
This also looks *better*: one hue in five steps is calmer and more premium than five
competing hues, and it reads as a single day divided rather than five unrelated things.

| Chart | Colour job | Palette |
|---|---|---|
| Time usage donut | **Ordinal** | Blue ramp `#86b6ef → #0d366b` (validated) |
| Food bars | **Nominal, single series** | All bars `accentMark`. No legend — the title names it |
| Transport bars | **Nominal, single series** | All bars `accentMark` |
| Language bars | **Nominal, single series** | All bars `accentMark` |
| Comparison (5 countries) | **Categorical** | The 5 `accentMark` values — validated all-pairs *(not built; see below)* |

**Never colour nominal bars by their value** — that spends the identity channel
re-encoding what bar length already shows.

### 4.4a Two prohibitions from the Product Vision

**§7.4 of the vision binds this section.** Colour is one of the two channels through which
a ranking sneaks into a design that never intended one, so the rules are stated here, where
whoever builds a chart will read them:

1. **Never a sequential ramp across countries.** A light→dark ramp makes dark mean *more*
   and therefore *better*. Countries are **categorical identities, never magnitudes** — each
   gets its own `accentMark`, and the five are interchangeable in status by construction.
   The ordinal blue ramp above is legal precisely because it encodes *hours within one day*,
   which genuinely is ordered, not countries.
2. **Never sort countries by value.** Itinerary order (Japan → India → Italy → Switzerland →
   United States) everywhere, always. Sort order *is* a ranking, and no caption undoes it.

**Chart titles are questions, not labels** (P7). "How do people get around?" — not
"Transport modes." The `label` token carries the question; the metric name, if needed at
all, goes in the axis. A title that states a conclusion has ended the conversation the
chart was supposed to start.

**Compare page: deferred, not designed.** Per your instruction, the priority is the
storytelling journey; whether a comparison view adds value gets decided after the core
journey exists. The all-pairs validation above stands as measured fact for that future
decision — but nothing is built, and the route does not exist in Phase 1.

### 4.5 Status colours — reserved, measured

Reserved meaning. **Never reused as a chart series.** Always shipped with an icon and a
text label, never colour alone.

| Token | Hex | vs cream | Use |
|---|---|---|---|
| `status-good` | `#0F7A55` | 5.09:1 ✅ | Stamp collected, journey complete |
| `status-warning` | `#9A6700` | 4.64:1 ✅ | Data caveat, estimated value |
| `status-critical` | `#9E2A2B` | 7.10:1 ✅ | Errors (rare in this app) |
| `status-info` | `#1c5cab` | 6.32:1 ✅ | Source notes, methodology |

Note `status-critical` shares Italy's hue. Acceptable because the two never co-occur —
status colours appear only in system messaging, never inside a country section. Flagging
it so it's a known decision rather than an accident.

### 4.6 Dark mode

**Not in v1.** Every ramp above would need re-stepping and
re-validating against a dark surface — the method requires dark to be *selected*, not
flipped. Structuring tokens as CSS custom properties now means adding it later is a
token-file change, not a refactor.

---

## 5. Spacing System

### 5.1 Scale

A **4px base unit**, geometric-ish progression. One unit everywhere means vertical
rhythm is consistent without anyone measuring.

| Token | px | Typical use |
|---|---|---|
| `space-1` | 4 | Icon-to-label gap |
| `space-2` | 8 | Inside chips, tight stacks |
| `space-3` | 12 | Label-to-value |
| `space-4` | 16 | Default gap; card inner padding (mobile) |
| `space-6` | 24 | Card padding; grid gutter |
| `space-8` | 32 | Card padding (desktop); heading-to-body |
| `space-12` | 48 | Sub-section separation |
| `space-16` | 64 | Between content blocks |
| `space-24` | 96 | **Section padding (mobile)** |
| `space-32` | 128 | **Section padding (desktop)** |
| `space-40` | 160 | Around full-bleed image breaks |

**Why sections get 96–128px.** This is the most important spacing decision in the
project. A dashboard uses 16–24px between panels to maximise density; we want the
opposite. Large section padding is *the* mechanism that delivers "one idea per viewport"
— it pushes the next section out of view so the current one owns the screen. If the site
ends up feeling like a dashboard, insufficient section padding will be the cause.

### 5.2 Container widths

| Token | Width | Use |
|---|---|---|
| `container-prose` | 680px | Body copy, quotes — respects the 65ch measure |
| `container-content` | 1080px | Charts, card grids, standard sections |
| `container-wide` | 1360px | Comparison table, gallery grids |
| `container-full` | 100vw | Hero images, image breaks |

Gutters: 20px mobile, 32px tablet, 48px desktop. Content never touches the viewport edge
except deliberately full-bleed elements.

### 5.3 Grid

12-column, `space-6` (24px) gutter, desktop. Common spans:

| Layout | Desktop | Tablet | Mobile |
|---|---|---|---|
| KPI tiles (5) | 5 × 2-col + offset | 3 + 2 | 2 × 2 |
| Chart + observation | 7 / 5 | 12 / 12 | stack |
| Culture cards (3) | 4 / 4 / 4 | 6 / 6 / 12 | stack |
| Culture cards (1–2) | see §11 | | |
| Prose | 8 cols, centred | 10 | 12 |

---

## 6. Elevation

### 6.1 Philosophy

Elevation is nearly absent by design. Heavy card shadows are the strongest
"corporate dashboard" tell there is. Print magazines have no shadows at all; separation
comes from whitespace and hairlines. We use a **1px warm border as the default** and
reserve shadow for genuinely floating things.

Shadows are **warm-tinted** (`26,24,21` — the ink colour, not black). Pure-black shadow
on cream reads grey and dead.

| Token | Value | Use |
|---|---|---|
| `elev-0` | none + `1px solid ink-200` | **Default for all cards** |
| `elev-1` | `0 1px 2px rgba(26,24,21,.04), 0 2px 8px rgba(26,24,21,.04)` | Card hover |
| `elev-2` | `0 2px 4px rgba(26,24,21,.05), 0 8px 24px rgba(26,24,21,.06)` | Passport stamp, floating nav |
| `elev-3` | `0 8px 16px rgba(26,24,21,.08), 0 24px 48px rgba(26,24,21,.10)` | Modal, image lightbox |
| `elev-inset` | `inset 0 1px 2px rgba(26,24,21,.05)` | Sunken wells |

### 6.2 Border radius

| Token | px | Use |
|---|---|---|
| `radius-sm` | 4 | Chart bar ends, small chips |
| `radius-md` | 8 | Buttons, inputs, tags |
| `radius-lg` | 12 | Cards, callouts |
| `radius-xl` | 20 | Photo cards, feature panels |
| `radius-2xl` | 32 | Hero image containers |
| `radius-full` | 9999 | Pills, avatars, dots |

`radius-sm` = 4px on bar chart data-ends is a specific requirement from the dataviz
method: round the *data end only*, keep the baseline end square so it anchors to the axis.

### 6.3 Cards

Three variants, one component:

| Variant | Surface | Border | Padding | Use |
|---|---|---|---|---|
| `plain` | `surface-card` | `1px ink-200` | `space-8` | Charts, data panels |
| `tinted` | `accentWash` | none | `space-6` | Traveler's Observation |
| `photo` | image + scrim | none | `space-6` (over image) | Culture cards |

### 6.4 Dividers

- Default: `1px solid ink-200` (1.46:1 — visible, recessive)
- Decorative: centred `iconMotif` glyph with hairlines either side, used between major
  sections. This is where atmosphere shows up in a quiet way.
- Never a divider *and* large spacing doing the same job — pick one.

---

## 7. Animation Language

### 7.1 Duration scale

Base values; each is multiplied by the country's `motionPace` (§3.3).

| Token | ms | Use |
|---|---|---|
| `dur-instant` | 100 | Colour/opacity on hover |
| `dur-fast` | 200 | Button press, small state change |
| `dur-base` | 350 | Standard reveal, card hover lift |
| `dur-slow` | 550 | Section entry, hero text |
| `dur-slower` | 800 | Chart draw-in, count-up |
| `dur-deliberate` | 1200 | Passport stamp press, page transition |

### 7.2 Easing

| Token | Curve | Character |
|---|---|---|
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | **Default.** Fast in, slow settle |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Symmetric — for moves, not entries |
| `ease-gentle` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Slow, unhurried (Italy) |
| `ease-spring` | `cubic-bezier(0.34, 1.32, 0.64, 1)` | Slight overshoot (India only) |

**Never `ease-in` alone** on an entry — content that accelerates as it arrives feels like
it's falling. **Never `linear`** except for continuous loops (progress bars).

### 7.3 Named motions

| Motion | Spec | Where |
|---|---|---|
| `reveal` | opacity 0→1, `translateY` +16..24px→0, `dur-slow`, atmosphere easing, `once: true` | Every section |
| `stagger` | children offset by `staggerMs` | Card grids, KPI rows |
| `countUp` | 0→value, `dur-slower`, `ease-out`, **tabular figures** | KPI tiles |
| `chartDraw` | bars scale-x 0→1 from baseline; donut sweeps 0→360° | All charts |
| `parallax` | image `translateY` at 0.85× scroll. **Desktop only** | Heroes |
| `stampPress` | scale 1.4→1, opacity 0→1, rotate −8°→−3°, `dur-deliberate` | Passport stamp |
| `pageTransition` | out: opacity→0 150ms; in: opacity + 12px rise 350ms | Route change |
| `hoverLift` | `translateY(-2px)` + `elev-0`→`elev-1`, `dur-base` | Cards |

**`once: true` on scroll reveals is a deliberate rule.** Content that re-animates every
time it re-enters the viewport is actively annoying when scrolling back to re-read.

### 7.4 Motion principles

1. Motion signals **arrival, hierarchy, or causality**. Nothing else animates.
2. **Never animate `width`, `height`, `top`, or `left`** — they trigger layout on every
   frame and drop to ~15fps on mobile. Only `transform` and `opacity`, which the compositor
   handles on the GPU. This is the single most important performance rule in the document.
3. **No scroll-jacking.** Rejected in DESIGN.md §4.4 and reaffirmed: it breaks keyboard
   and screen-reader navigation.
4. **Nothing loops** except a single scroll-hint chevron on the landing hero, which stops
   after the first scroll.
5. **Nothing blocks reading.** Text is never mid-animation when a visitor reaches it.

### 7.5 `prefers-reduced-motion` — mandatory

When set: all transforms → none; durations → `dur-instant`; stagger → 0; parallax off;
count-up shows the final value immediately; charts render complete. **Every animation on
this site is decorative — the site is fully usable and complete with all of it disabled.**
That's the test.

---

## 8. Iconography

### 8.1 Three tiers, deliberately

**Tier 1 — Emoji, from the data.** Your dataset already ships `kpi_icon` (😊 ❤️ 💼 👥 📷)
and `culture.icon` (🌸 ⛩️ 🪔 🏛️ 🧀). **Use them.** They are warm, zero-download,
and — crucially — they're your editorial voice, not a generic icon set. They carry the
Spotify-Wrapped/Airbnb warmth the brief asks for.
*Rules:* decorative only, always `aria-hidden="true"` with a real text label beside them;
size 20–48px; never the sole carrier of meaning.

**Tier 2 — Lucide (line icons), for UI.** Navigation, chevrons, close, external-link,
menu. Chosen because it's tree-shakeable (only used icons ship), 24×24 on a consistent
grid, and 2px stroke matches Inter's weight.
*Rules:* `1.5px` stroke at 16px, `2px` at 20–24px. `currentColor` only — never a
hardcoded hex, so they inherit accent and hover states automatically.

**Tier 3 — Atmosphere motifs, custom SVG.** One per country (§3.3) — torii, rangoli,
arch, peak, route-dash. Used as section dividers and stamp flourishes.
*Rules:* single-path, hairline `ink-200`, ~120×16px. Purely decorative.

### 8.2 Sizing

| Token | px | Use |
|---|---|---|
| `icon-xs` | 14 | Inline with `label-xs` |
| `icon-sm` | 16 | Buttons, inline with body |
| `icon-md` | 20 | Nav, default UI |
| `icon-lg` | 24 | Section headers |
| `icon-xl` | 32 | KPI tile icons |
| `icon-2xl` | 48 | Culture cards, flag emoji |

### 8.3 Traveler's Note treatment

Instead of a handwriting font (rejected, §2.1): `quote` token (Fraunces 400 **italic**,
32px) on an `accentWash` tinted card, with `traveler_note_japan.png` at very low opacity
as a paper texture, and a small `iconMotif` flourish. Reads as personal without
sacrificing legibility.

---

## 9. Buttons

### 9.1 Variants

| Variant | Fill | Text | Border | Use |
|---|---|---|---|---|
| `primary` | `accentInk` | `#FFFFFF` | none | **One per section max.** "Begin the Journey", "Continue Journey" |
| `secondary` | transparent | `accentInk` | `1px accentInk` | "View sources", "See all countries" |
| `ghost` | transparent | `ink-700` | none | Tertiary, in-card actions |
| `link` | none | `accentInk`, underlined | none | Inline in prose |

**The primary fill is `accentInk`, not `accentMark` — corrected after measurement.**

An earlier revision of this section specified `accentMark` as the fill and justified it by
claiming that a 16px/600 label "qualifies as large text (3:1 threshold)". **That claim is
false and the specification built on it was wrong.** WCAG 2.2 defines large text as 18pt
(**24px**) regular or 14pt (**18.66px**) bold. A 16px semibold label is below both, so it
is *normal* text and requires the full **4.5:1**.

Re-measured against that correct threshold, white on `accentMark` fails in three of five
countries; white on `accentInk` passes in all five with margin:

| Country | `accentMark` fill | White label | `accentInk` fill | White label |
|---|---|---|---|---|
| Japan | `#2a78d6` | 4.42:1 ❌ | `#184f95` | **8.10:1** ✅ |
| India | `#d95926` | 3.88:1 ❌ | `#B4530A` | **5.02:1** ✅ |
| Italy | `#9E2A2B` | 7.45:1 ✅ | `#87201F` | **9.31:1** ✅ |
| Switzerland | `#199e70` | 3.41:1 ❌ | `#0F7A55` | **5.34:1** ✅ |
| United States | `#4a3aa7` | 8.56:1 ✅ | `#3E3090` | **10.34:1** ✅ |

**The rule this establishes (binding):** `accentMark` is the ≥3:1 token, reserved for
marks nobody has to *read* — chart fills, rules, indicators. `accentInk` is the ≥4.5:1
token for anything carrying or backing text. **A white label on a coloured field is a
text-contrast problem and therefore belongs to `accentInk`**, regardless of how large the
coloured shape is. Choosing `mark` because a button is a big block of colour confuses the
shape with its label.

The ≥16px/600 minimum for button labels stays — it is good practice on its own terms — but
it is no longer load-bearing for accessibility, so shrinking a label can no longer silently
break contrast.

### 9.2 Sizing

| Size | Height | Padding-x | Text |
|---|---|---|---|
| `sm` | 36px | `space-4` | `label` |
| `md` | 44px | `space-6` | `body-sm` 500 |
| `lg` | 52px | `space-8` | `body` 600 |

**44px minimum for any touch target** (WCAG 2.5.5). `sm` is desktop-only.

### 9.3 States

| State | Treatment |
|---|---|
| default | as specified |
| hover | brightness −8%, `translateY(-1px)`, `dur-fast` |
| active | brightness −14%, `translateY(0)`, scale 0.98 |
| focus-visible | **`2px` outline `accentInk`, `2px` offset** |
| disabled | `ink-200` fill, `ink-400` text, `cursor: not-allowed`, no hover |
| loading | spinner replaces icon, label stays, `aria-busy="true"` |

**`:focus-visible` is never removed.** Removing focus outlines makes a site unusable by
keyboard. The offset ring is visible on every surface we have.

---

## 10. Navigation

### 10.1 Top bar

Fixed, 64px, `surface-page` at 88% opacity + `backdrop-blur(12px)`, `1px ink-200` bottom
border that appears only after 40px of scroll. Contents:

```
[✈ One Journey]     🇯🇵 —— 🇮🇳 —— 🇮🇹 —— 🇨🇭 —— 🇺🇸          [Passport]
                    ↑ active: accentInk + filled dot
```

The 5-stop route doubles as a progress indicator and primary nav — it *is* the journey
metaphor (§2.3), so it earns the space. **Stops appear in itinerary order, never sorted**
(§4.4a).

No Compare link: the route shown here is the whole product. Adding a "compare everything"
escape hatch beside it would offer the dashboard affordance the vision explicitly rejects
(§5) before the visitor has travelled anywhere.

**Accessibility:** `<nav aria-label="Journey route">`, each stop a link with
`aria-current="page"` when active. Active state is **colour + a filled dot + weight**,
never colour alone.

### 10.2 Scroll progress

2px bar at the very top, `accentMark`, width = scroll %. `aria-hidden` — decorative.

### 10.3 Mobile

Below `md`: route condenses to `🇯🇵 Japan · Stop 1 of 5` + hamburger opening a full-screen
sheet listing the 5 countries with flags, day ranges, and stamp-collected state. A fixed
sidebar (as in the mockups) is impossible at 375px — this is the main navigation
translation from the mockup.

### 10.4 Section nav within a country

Optional right-edge dot rail (desktop ≥`lg` only) — 12 dots, one per section, current
one filled. Hidden below `lg`; it's an enhancement, not the mechanism.

### 10.5 Next Stop

Full-width band at the end of each country: next country's accent as a subtle wash, its
flag + name + epithet, one-line tease, `primary` button "Continue to India →". This is
the engine of the journey — it must never be subtle.

---

## 11. Asymmetric Content (Direction #3)

You said not to force image parity. That needs a concrete layout rule, or the sections
with fewer images will simply look unfinished.

**`CultureCardGrid` adapts to available assets:**

| Images | Layout |
|---|---|
| 3 (Japan, India) | 3-col photo cards, equal |
| 2 | 2-col, larger cards — reads as intentional editorial pairing |
| 1 | Single wide feature card, image left / text right |
| 0 (Italy, US, CH today) | **Typographic cards**: `accentWash` background, 48px emoji from `culture.icon`, `display-3` title, description. No grey placeholder boxes, ever. |

The typographic variant isn't a fallback that looks like a fallback — with a large emoji,
a serif title and a tinted card it's a legitimate editorial treatment. Adding photos later
requires no code change, just assets.

**Natural asset recommendations** (per your instruction to recommend by need, not count):
- **Switzerland** would benefit from one higher-resolution hero. `switzerland.jpeg` is
  496×310 and softens when used full-bleed. **A future enhancement, not blocking** — the
  atmospheric variant below handles it.
- Italy has a good 1319×736 hero; its culture cards work typographically given the
  "history is everywhere" theme.
- US has `us_hero.jpeg` at 735×457 — workable at contained width, soft full-bleed.
- Everything else: fine as-is.

### 11.1 The layout never depends on an image

**A hard architectural rule**, per your instruction: no component's layout may break,
collapse, or look unfinished because an image is missing or too small. Placeholders are
*designed states*, not error states — and they must feel intentional enough that a visitor
who has never seen the intended photograph doesn't perceive an absence.

**Why this is architecture rather than polish.** An image-dependent layout couples visual
completeness to asset acquisition, which means every missing photograph becomes a blocked
component. Making absence a first-class state decouples them permanently — Phase 4 can ship
five countries whether or not five heroes exist.

**Three placeholder treatments, by slot:**

| Slot | When | Treatment |
|---|---|---|
| **Hero** | image missing, or below 1000px wide | **Atmospheric gradient hero** — a soft gradient built from the country's own `accentMark`/`accentInk` over `surface-page`, at the same height as a photographic hero, carrying the identical title lockup (§2.6). The `iconMotif` (§8.1 tier 3) sits at low opacity as a large watermark. Reads as a deliberate colour-field cover, not a gap. |
| **Culture card** | no photo | **Typographic card** — the variant already specified above |
| **Story image** | no photo | **Omit the slot entirely.** Text reflows to full measure. A story image enriches; its absence is not a hole. |

**Why a gradient rather than a blurred upscale of the small image:** upscaling announces
that a better image was wanted. A confident colour field announces nothing — and because it
is built from the country's own accent, it reinforces the atmosphere (P13) rather than
merely occupying space. It is also the only treatment that is guaranteed to pass contrast
for the overlaid title, since we control both colours.

**The test:** a visitor should not be able to tell which countries have hero photographs
and which don't — only that they look different from each other, which they should anyway.

Switzerland uses the atmospheric variant today and can be swapped to a photograph later by
adding one file to the asset manifest. **No code change.** That is the whole point of the
rule, and it is why the Switzerland hero was correctly reclassified as an enhancement.

#### 11.1.1 Text on the atmospheric hero — measured, not assumed

Implemented as `src/components/ui/AtmosphericCover.jsx` (Phase 1). Two soft radial gradients
in `--accent-mark` / `--accent-ink` over `surface-sunken`, plus a hairline horizon.

The gradient's darkest point is **30% of the country's mark over `surface-sunken`**. Text on
that background was measured there — the worst case, not the average — and **two tokens that
are correct everywhere else on the site failed**:

| Element | Rendered size | Required | Token used | Worst case | Note |
|---|---|---|---|---|---|
| Eyebrow (`Stop N of 5`) | 14px / 500 | 4.5:1 | `ink-700` | **6.22:1** | `ink-500` measured **3.17–3.81:1 — FAIL**. Corrected to `ink-700`. |
| Country name (`h1`) | ≥44px / 600 | 3.0:1 | `ink-900` | **9.51:1** | — |
| Epithet | **≥24px** / 400 | 3.0:1 | `--accent-ink` | **3.11:1** (India) | At 20px this needs 4.5:1 and **India fails**. 24px makes it *large text*, where 3:1 applies. |
| Emotion line | 14px / 400 | 4.5:1 | `ink-700` | **6.22:1** | — |

All 20 combinations (4 texts × 5 countries) pass. **Two binding constraints follow:**

1. **The epithet may never render below `text-2xl` (24px).** Shrink it and it stops being
   large text, the threshold jumps to 4.5:1, and India's accent fails on mobile. If it must
   get smaller, it loses the accent colour and becomes `ink-700`.
2. **Any text added to this hero must be re-measured in context.** This is the trap a tinted
   background sets: `ink-500` is a perfectly good secondary token on cream and fails here.
   The failure is invisible until measured — it was caught by computation, not by eye.

---

## 12. Flight Distance (Decision #2)

**Recommendation: omit distance entirely.**

I actually ran the honest computation — haversine over the dataset's own
`latitude`/`longitude`, in `arrival_order`:

| Leg | Great-circle | Dataset's `flight_distance_km` |
|---|---|---|
| Japan → India | 5,959 km | `~5,900` ✅ close |
| India → Italy | 6,569 km | `~5,900` ⚠️ off by 11% |
| Italy → Switzerland | **649 km** | `~7,800` ❌ **12× wrong** |
| Switzerland → United States | 7,965 km | `~8,000` ✅ close |
| **Total** | **21,143 km** | 27,600 (mockups) / 42,385 (`journey_summary`) |

Three findings worth recording:

1. **The manual distances contain a real error.** Italy → Switzerland is 649 km — a
   short train ride, not a flight. The dataset says 7,800 km. This is exactly the kind of
   defect decision #2 was protecting against, and it validates the instruction.
2. **Neither existing total is right.** 21,143 km (or 19,037 using actual capital cities
   rather than country centroids). The mockups' 27,600 and `journey_summary`'s 42,385 are
   both unsupported by the coordinates.
3. **The dataset's coordinates are country centroids, not cities.** Japan's 36.20/138.25
   is central Honshū; the US's 39.83/−98.58 is geographic-centre Kansas. So even the
   correct haversine measures *country-to-country*, not *airport-to-airport*.

Given all that, distance adds nothing to "how the world lives, thrives and connects" — and
publishing a third number invites "which is right?" Landing stats become
**5 countries · 3 continents · 28 days**. If you do want it, I'd show **~21,100 km
great-circle** with a footnote naming the centroid caveat — accurate and defensible.
Your call; omission is my recommendation.

---

## 13. Data Pipeline & Folder Structure (Decision #1)

### 13.1 Pipeline stages

```
data-source/*.xlsx
   │
   ├─ 1. EXTRACT    read sheets via a Node xlsx reader
   ├─ 2. VALIDATE   assert schema + invariants; FAIL LOUDLY
   ├─ 3. CLEAN      normalise names, parse "~5,900"→number, drop stale cols
   ├─ 4. DERIVE     compute totals, sort orders, next-country links
   ├─ 5. EMIT       pretty-printed JSON → src/data/
   └─ 6. REPORT     write a run report; print a summary
```

**Validation must fail the build, not warn.** This is the BI instinct you already
have — a silent bad load is worse than a crashed one. Assertions from the audit:

| Check | Rule |
|---|---|
| Country coverage | all 5 present in all 11 country-keyed sheets |
| Time usage | hours sum to 24.0 ±0.05 per country |
| Transport | percentages sum to 100.0 ±0.05 per country |
| Arrival order | exactly 1..5, no gaps or dupes |
| Required fields | no nulls in the 6 KPIs or their ranks |
| Row counts | time_usage 5/country, food 3, transport 4, language 3, culture_experience 3, observations 5 |
| Stale columns | **assert `journey_order`, `journey_summary.total_distance` and `flight_distance_km` are NOT emitted** (§12 — the last one is measurably wrong) |
| Image URLs | assert no `drive.corp.amazon.com` string reaches JSON |

The last two are guards against the exact defects found in Session 2 — encoded so they
can't silently return.

### 13.2 Folder structure

```
Analyticon 2026/
├── data-source/                      ← RAW INPUTS, never shipped to browser
│   ├── excel/
│   │   ├── travel_data_dictionary_10_countries.xlsx   (authoritative)
│   │   └── archive/travel_data_dictionary.xlsx        (12-country backlog)
│   ├── images-original/              ← your 43 originals, untouched
│   └── README.md                     ← provenance: source, date, owner
│
├── scripts/
│   ├── convertData.mjs               ← the 6-stage pipeline
│   ├── validators.mjs                ← assertions, separately testable
│   ├── optimizeImages.mjs            ← deferred (image optimisation)
│   └── README.md                     ← how to re-run, what breaks when
│
├── src/
│   ├── data/                         ← GENERATED. Committed, never hand-edited
│   │   ├── countries.json
│   │   ├── timeUsage.json
│   │   ├── food.json
│   │   ├── transport.json
│   │   ├── languages.json
│   │   ├── cultureExperiences.json
│   │   ├── observations.json
│   │   ├── stories.json
│   │   ├── atmospheres.js            ← §3 tokens (hand-authored, not from Excel)
│   │   ├── assetManifest.js          ← country → local image paths
│   │   └── _generated.json           ← run report: timestamp, row counts, checks
│   ├── components/{layout,ui,charts,country,journey}/
│   ├── pages/
│   ├── hooks/
│   ├── lib/                          ← tokens.js, formatters.js, constants.js
│   ├── styles/
│   └── assets/images/                ← optimised, shipped
│
└── docs/
    ├── DESIGN.md
    ├── DESIGN_SYSTEM.md              ← this file
    ├── ASSET_REGISTRY.md
    └── DATA_PIPELINE.md              ← generated-schema reference
```

**Why raw inputs move to `data-source/`:** it makes "never shipped" structural rather than
a convention someone has to remember. Anything under `src/` can end up in the bundle;
anything outside it cannot.

**Why generated JSON is committed:** GitHub Pages builds from the repo. If JSON weren't
committed, deployment would require Excel parsing in CI. Committing the output makes the
build reproducible and diffs reviewable — you can see in a PR exactly how the data changed.

**Repeatability:** `npm run data` regenerates everything. Same input → identical output
(stable key ordering, no timestamps inside the data files — the timestamp lives only in
`_generated.json`).

---

## 14. Responsive Breakpoints

Tailwind defaults — no custom breakpoints. Fewer arbitrary numbers, and they align with
real device clusters.

| Name | Min-width | Target |
|---|---|---|
| *(base)* | 0 | Phone portrait, 375–430px |
| `sm` | 640 | Large phone, small tablet portrait |
| `md` | 768 | Tablet portrait |
| `lg` | 1024 | Tablet landscape, small laptop |
| `xl` | 1280 | Desktop |
| `2xl` | 1536 | Large desktop |

**Mobile-first**: unprefixed styles are mobile; prefixes add complexity upward. This
forces the small screen to be designed rather than derived — and the majority of a
portfolio site's traffic is mobile.

### Key adaptations

| Element | Base | `md` | `lg`+ |
|---|---|---|---|
| Hero | 70vh, `display-hero` 56px | 80vh, 88px | 90vh, 120px |
| KPI tiles | 2-col grid | 3+2 | 5 across |
| Chart + observation | stacked | stacked | 7/5 side by side |
| Culture cards | stacked | 2-col | 3-col |
| Nav | hamburger + sheet | condensed route | full route |
| Section padding | `space-24` (96) | `space-32` (128) | `space-32` |
| Parallax | **off** | off | on |
| Dot rail | hidden | hidden | visible |

**Why KPI tiles wrap rather than scroll horizontally:** horizontally-scrolled content gets
missed — visitors don't discover it. Two rows of visible tiles beats one row of hidden ones.

**Why horizontal bars everywhere:** they degrade to narrow screens without rotating
labels. A vertical bar chart with "Private Vehicle" as a label needs 45° rotation at
375px. This is a functional reason, not aesthetic.

---

## 15. Accessibility Guidelines

Requirements, not aspirations. Target **WCAG 2.2 AA**.

### 15.1 Colour & contrast
- Body text ≥4.5:1; large text (≥24px, or ≥19px bold) ≥3:1; UI/graphics ≥3:1. **All
  measured in §4 — none estimated.**
- **Never colour alone.** Active nav = colour + dot + weight. Chart series = colour +
  direct label. Status = colour + icon + text.
- Chart marks below 3:1 (India's `#d95926` at 3.70:1 passes; the donut's lightest step at
  2.11:1 does not) carry **visible direct labels** — the "relief rule" the validator flagged.

### 15.2 Structure & semantics
- One `h1` per page; no skipped levels (§2.4).
- Landmarks: `header`, `nav`, `main`, `footer`, `section` with `aria-labelledby`.
- Country sections are `<section>` with an accessible name from their `h2`.
- Lists are `<ul>`/`<ol>`. The route nav is a list.

### 15.3 Keyboard
- Every interactive element reachable by Tab in visual order.
- `:focus-visible` always present, 2px offset ring (§9.3).
- "Skip to content" as the first focusable element.
- No keyboard traps. Mobile nav sheet: focus trapped *while open*, Esc closes, focus
  returns to the trigger.
- **No scroll-jacking** — it breaks keyboard scrolling entirely.

### 15.4 Images
- Every `<img>` has `alt`. Decorative → `alt=""`.
- Hero images: descriptive alt ("Mount Fuji behind cherry blossoms and a pagoda").
- Flag emoji: `aria-hidden="true"` (§2.6).
- Passport stamps: `alt="Japan passport stamp, collected"`.
- Photos carrying text must not be the only source of that text.

### 15.5 Charts
Recharts renders SVG, which is invisible to screen readers by default. Each chart ships:
- `role="img"` + `aria-label` summarising the finding — not "pie chart" but
  *"How Japanese adults spend 24 hours: 10.4 hours sleep and personal care, 6.3 hours work
  or study, 4 hours leisure, 2.2 hours housework, 1.1 hours commuting."*
- A **visually-hidden `<table>`** with the same data — the accessible equivalent, and it
  satisfies the dataviz "table view" relief requirement in one move.
- Tooltips reachable by keyboard, or the data available in the table.

### 15.6 Motion
- `prefers-reduced-motion` fully honoured (§7.5).
- Nothing flashes >3×/second.
- No auto-playing motion longer than 5s without a pause control.

### 15.7 Verification
Manual keyboard pass + VoiceOver pass on one country page, plus an automated axe-core
scan, before launch. Contrast is already verified in §4.

---

## 16. Component Naming Conventions

### 16.1 Files
- Components: `PascalCase.jsx` — `CountryHero.jsx`
- Hooks: `camelCase.js` starting `use` — `useCountryData.js`
- Utilities: `camelCase.js` — `formatters.js`
- Tokens/data: `camelCase.js` / `camelCase.json`
- One component per file; filename === component name. Non-negotiable — it's what makes
  a component findable from a stack trace.

### 16.2 Component names
Pattern: **`[Scope][Subject][Type]`**, dropping parts that add nothing.

| Type suffix | Meaning | Example |
|---|---|---|
| *(none)* | Self-evident section | `CountryHero`, `NextStop` |
| `Card` | Bordered content unit | `PhotoCard`, `TravelerNoteCard` |
| `Chart` / `Donut` / `Bars` | Visualization | `FoodBarChart`, `TimeUsageDonut` |
| `Grid` / `Row` / `List` | Collection layout | `CultureCardGrid`, `StatTileRow` |
| `Nav` / `Bar` / `Rail` | Navigation | `RouteProgressNav`, `ScrollProgressBar` |
| `Panel` / `Callout` | Emphasised block | `DidYouKnowPanel`, `ObservationCallout` |
| `Provider` | Context provider | `AtmosphereProvider` |

Rules: no abbreviations (`Observation`, not `Obs`); no `Component` suffix; no country
names in component names (`CountryHero`, never `JapanHero` — that's what data is for);
generic primitives get plain names (`Button`, `Chip`).

### 16.3 Props
- Booleans read as assertions: `isActive`, `hasImage`, `showLegend` — never `active`/`flag`.
- Handlers: `onSelect`, `onCountryChange` — prop `onX`, internal handler `handleX`.
- Data objects named for their type: `country`, `observation`, not `data`/`item`.
- Render order: `country` → data → config → handlers → `className` → `children`.
- Prefer 1 object over 6 scalars when the fields always travel together.

### 16.4 CSS / Tailwind
- Tailwind utilities inline; no custom class names for one-off styling.
- Repeated 3+ times → a component, not a CSS class.
- Design tokens as CSS custom properties in `@theme`, consumed as Tailwind utilities
  (`bg-surface-page`, `text-ink-700`) — so tokens are the only source of colour and no
  raw hex ever appears in a component.
- Atmosphere applied via CSS variables on a wrapper (`--accent-mark`), so components
  never branch on country.

### 16.5 Data keys
`camelCase` in JSON, converted from Excel's `snake_case` during CLEAN — one convention
inside the app. Names normalised: `avg_life_expectancy_at_birth` → `lifeExpectancy`,
`avg_one_way_commute_minutes` → `commuteMinutesOneWay` (keeps "one-way" explicit, since
the mockup's 58 appears to be round-trip).

---

## 17. Token Summary

Everything in one place, as it will be implemented:

```
COLOUR   surface-{page,card,sunken,ink,scrim}
         ink-{100,200,300,400,500,700,900}
         accent-{mark,ink,wash}              ← set per country at runtime
         status-{good,warning,critical,info}
         chart-ordinal-{1..5}                ← blue ramp
TYPE     font-{display,text}
         text-{display-hero,display-1..3,stat-hero,stat-lg,quote,
               body-lg,body,body-sm,label,label-xs,overline}
SPACE    space-{1,2,3,4,6,8,12,16,24,32,40}
         container-{prose,content,wide,full}
RADIUS   radius-{sm,md,lg,xl,2xl,full}
ELEV     elev-{0,1,2,3,inset}
MOTION   dur-{instant,fast,base,slow,slower,deliberate}
         ease-{out,in-out,gentle,spring}
ICON     icon-{xs,sm,md,lg,xl,2xl}
```

---

## 18. Implementation Phases

Approved order. Each phase ends with a working, verifiable state.

| Phase | Scope | Explicitly NOT in scope |
|---|---|---|
| **1** | **Application shell** — routing, layout, navigation, footer, global styles, tokens, responsive framework | Charts, country content, real data |
| **2** | **Home page** — the storytelling opening (§3.1 *Arrival*) | Country pages |
| **3** | **Japan as reference country** — establishes the final pattern for layout, storytelling, animation and hierarchy | The other four countries |
| **4** | **India, Italy, Switzerland, United States** — same pattern, own atmospheres | — |
| *later* | Data pipeline hardening, image optimisation, accessibility audit | — |
| *undecided* | Compare page — revisited only after the journey is complete | — |

**Why Japan third rather than all five at once.** Building one country completely surfaces
every pattern problem while the cost of changing it is one file rather than five. Japan is
the right reference because it has the most complete asset set and it is the first stop, so
its pacing sets the visitor's expectation for the other four.

### 18.1 Decisions taken by default in Phase 1

Recorded so they're visible rather than buried in code. Each is cheap to reverse now and
expensive later, so I'd rather you see them:

| Decision | Chosen | Reversibility |
|---|---|---|
| Display + text faces | **Fraunces + Inter** (§2.1) | One token change until components hardcode nothing — which §16.4 guarantees |
| Country epithets | as written in §2.6 | Copy only |
| Atmosphere pace range | 0.85×–1.35× (§3.4) | One number per country |
| Flight distance | **omitted** (§12) | — |
| Section dot rail | **not built** — the route nav plus scroll progress already answer "where am I," and P9 says the default answer to *should we add this* is no | Additive later |
| Dark mode | not in v1 (§4.6) | Token-file addition |

---

## 19. Open Questions

Non-blocking. Phase 1 proceeds under the §18.1 defaults; any of these can change without
rework.

1. **Epithets** (§2.6) — approve as written, or reword? Editorial voice, your call.
2. **Fraunces** (§2.1) — approve, or prefer Playfair Display (more geometric) or Newsreader
   (more news-editorial)? Swapping is one token until Phase 3 hardens the pattern.
3. **Atmosphere pace range** (§3.4) — 0.85×–1.35×, or bolder?
