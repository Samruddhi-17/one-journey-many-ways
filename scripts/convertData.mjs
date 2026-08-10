import {
  existsSync,
  mkdirSync,
  writeFileSync,
  copyFileSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs'
import { basename, extname, join } from 'node:path'
import sharp from 'sharp'
import { readXlsx, toObjects } from './readXlsx.mjs'
import {
  assertNoInternalReferences,
  assertNoRankings,
  assertItineraryIsSound,
  assertAssetsExist,
  checkSum,
  toNumber,
} from './validators.mjs'

/*
 * convertData.mjs — the Excel→JSON pipeline. Run with `npm run data`.
 *
 * THE ARCHITECTURE THIS IMPLEMENTS, AND WHY
 * The website never reads the spreadsheet. It reads JSON that this script produced. One
 * boundary, crossed once, at build time.
 *
 * The reasons are worth stating in full, because the same instinct ("just read the xlsx in the
 * app") recurs:
 *
 *   1. NO PARSER IN THE BROWSER. Shipping a spreadsheet reader to a phone means the visitor
 *      downloads a parsing library and does the work every page load, to produce a result
 *      that is identical every time.
 *   2. THE DATA CAN BE VALIDATED. A build script can refuse. A website that discovers bad
 *      data mid-render can only render badly.
 *   3. THE MESSY SOURCE STAYS OUT OF THE COMPONENTS. The workbook has a sheet named
 *      `storyteling`, inconsistent column capitalisation, a `flight_distance_km` of 0 for
 *      Japan, image filenames that do not exist, and float noise in every decimal. None of
 *      that should be visible to a component whose job is to lay out a paragraph.
 *   4. THE TRANSFORMATION IS REVIEWABLE. Every decision about what the data means lives in
 *      one readable file, in git, rather than scattered across twenty components.
 *
 * THIS IS THE SAME SHAPE AS AN ETL JOB — extract from the workbook, transform and validate,
 * load into `src/data/`. The unfamiliar part is only that the "warehouse" is a JSON file and
 * the "consumer" is a React component.
 *
 * ------------------------------------------------------------------------------------------
 * WHAT THIS SCRIPT DELIBERATELY DISCARDS. This list is the most important part of the file.
 *
 *   flight_distance_km — DROPPED ENTIRELY, and it must never be reinstated.
 *      Every value is a string carrying a tilde ("~5,900"), so the source knew it was
 *      estimating. Measured against great-circle distances computed from the dataset's own
 *      latitude and longitude:
 *
 *        Japan → India         ~5,900   vs   5,959 km    close
 *        India → Italy         ~5,900   vs   6,569 km    close
 *        Italy → Switzerland   ~7,800   vs     649 km    out by a factor of twelve
 *        Switzerland → US      ~8,000   vs   7,965 km    close
 *        column total          27,600   vs  21,142 km
 *        journey_summary        42,385                    agrees with neither
 *
 *      Zurich is about an hour's flight from Rome. Three legs are roughly right, one is wildly
 *      wrong, and the two totals in the workbook do not even agree with each other.
 *
 *      Principle 15: accuracy is not negotiable for the sake of atmosphere. "42,385 km"
 *      is an attractive number on a journey page and it is not true. The honest options were
 *      to compute distances from coordinates or to omit them; a decorative metric that
 *      contradicts itself is the one option ruled out. We omit — because the journey's meaning
 *      does not depend on its length, and a computed figure would invite a "total distance"
 *      statistic that the site has no reason to claim.
 *
 *   *_rank (population, happiness, tourist, commute) — DROPPED, enforced by assertNoRankings.
 *      §7.4. See the rule's own comment: deleting the field is a guarantee, not displaying it
 *      is a habit.
 *
 *   happiness_score — KEPT, but see `docs/DATA_PIPELINE.md`. It is retained because the
 *      traveller notes reference wellbeing, and dropped from any comparison across countries.
 *      A 6.147 next to a 7.06 is a ranking with extra steps.
 *
 *   population_rank's sibling `population` — KEPT. A population is a fact about a place. Its
 *      rank is a fact about a league table.
 *
 *   kpi_icon — DROPPED. A sheet mapping "Happiness" to 😊 is dashboard furniture. The emoji
 *      in `traveler_observation.card_title` are kept, because those are the traveller's own
 *      voice and appear inside quoted text.
 *
 *   `culture` sheet — DROPPED in favour of `culture_experience`, which is the richer of the
 *      two overlapping sheets (three rows with full descriptions and images versus two with
 *      short ones). Keeping both would mean the site had two answers to "what is there to
 *      experience in Japan".
 * ------------------------------------------------------------------------------------------
 */

/*
 * THE COMMITTED WORKBOOK HAS HAD ONE THING EDITED, AND IT IS RECORDED HERE SO IT IS NOT LATER
 * MISTAKEN FOR CORRUPTION. Its image cells were typed as absolute paths from the machine that
 * authored them (`/Users/<name>/Documents/…`, `/Users/<name>/Downloads/…`), and `absPath` in
 * xl/workbook.xml carried the same. In a public repository those strings publish a person's
 * account name and local directory layout for no benefit, so the username was replaced with
 * `me` throughout.
 *
 * It is safe precisely because resolution below reads only the BASENAME — the directory part of
 * every cell has always been ignored. Verified rather than assumed: regenerating journey.json
 * from the edited workbook produced a byte-identical file.
 */
const WORKBOOK = 'travel_data_dictionary_10_countries.xlsx'
const SOURCE_IMAGES = 'images'
const PUBLIC_IMAGES = 'public/images'
const OUTPUT = 'src/data/journey.json'

/*
 * AVIF ENCODING SETTINGS.
 *
 * WHAT AVIF IS. A modern image format (AV1's still-picture profile) that reaches the same
 * perceived quality as JPEG in roughly half the bytes. Supported by every current browser;
 * the `<picture>` element in ImageFrame and CountryCover means anything that does not support
 * it falls back to the original JPEG automatically, so this is a saving with no compatibility
 * cost rather than a bet on the visitor's browser.
 *
 * WHY IT MATTERS MORE HERE THAN ANY OTHER OPTIMISATION. Measured on this build: photographs
 * are 2,539 kB of a 3.7 MB site — about 68% of everything shipped. The JavaScript bundle,
 * which is where optimisation attention usually goes, is 425 kB. Splitting routes moved 54 kB;
 * this moves 1,429 kB. Optimising the second-largest thing first is how a site ends up with a
 * beautifully tree-shaken bundle behind two megabytes of photographs.
 *
 * THE MEASURED RESULT: 2,539 kB → 1,110 kB, a 56.3% reduction across all seventeen images.
 * The largest single win is italy_hero.jpeg at 357 kB → 82 kB (77%), because a photograph of
 * sky and water is exactly what JPEG handles worst and AVIF handles best.
 *
 * WHY QUALITY 55 AND NOT SOMETHING HIGHER. AVIF's quality scale is not JPEG's — 55 here is
 * visually comparable to JPEG ~85, not to JPEG 55. Verified rather than assumed: decoded the
 * AVIF back to raw pixels and compared it to the source on a centre crop of the three most
 * aggressively compressed files. Mean absolute error was 2.8–4.6 of 255 per channel, with
 * maxima of 38–48 confined to high-frequency edges. Side by side at 1:1 the two are
 * indistinguishable. Below about 45 the sky in italy_hero starts to band, which is the
 * failure mode to look for if this number is ever lowered.
 *
 * `effort: 6` of a possible 0–9. Encoding all seventeen images takes about 8 seconds at this
 * setting; effort 9 costs several times that for a percent or two. Since this runs on every
 * `npm run build`, a slow encode is a tax on every future build.
 */
const AVIF_QUALITY = 55
const AVIF_EFFORT = 6

/*
 * ============================================================================================
 * THE COVERS ARE ENCODED HIGHER THAN EVERYTHING ELSE — the second half of "the main title images
 * are very blur".
 *
 * WHY 55 IS THE WRONG NUMBER FOR THIS ONE SLOT, when the note above verifies it is right generally.
 * That verification compared images at 1:1. It is a correct measurement of the wrong thing for a
 * cover, because a cover is the only image on the site that is never shown at 1:1 — `object-cover`
 * scales it to fill a full-bleed band and LivingBackdrop's drift then scales it a further 1.16x.
 * Compression artefacts scale up with the image, so quantisation that is invisible at 1:1 is being
 * magnified on the largest element on the page.
 *
 * MEASURED, as high-frequency detail retained against the uncompressed source (Laplacian variance
 * of the decoded AVIF over that of the original — a direct proxy for "how much fine texture
 * survived the encode"):
 *
 *                       q55        q72
 *     japan             83%        94%
 *     india             87%        95%
 *     italy             79%        92%
 *     switzerland       76%        90%
 *     us                90%        94%
 *
 * So at 55 the covers were losing a fifth to a quarter of their fine detail BEFORE being upscaled.
 * That is not a subtle effect and it is the reason a photograph the pipeline reports as sharp still
 * looked soft on the page: `<picture>` prefers the AVIF, so the crisp PNG beside it is a fallback
 * essentially nobody receives. The soft-cover width report was measuring the source and missing this
 * entirely — a cover can pass the width check and still arrive visibly degraded.
 *
 * WHY 72 AND NOT HIGHER. The curve knees here: 55→72 buys 11-14 points of detail for 422 kB across
 * all five covers, and 72→78 buys 1-2 more points for another 139 kB. Above ~75 the encoder is
 * spending bytes on noise the upscale would smear anyway.
 *
 * WHAT IT COSTS, stated plainly rather than buried: the five covers go from 556 kB to 978 kB of AVIF.
 * That is a real regression in page weight and it is accepted for one reason — these five files ARE
 * the largest visual element on every route, they are what the visitor's complaint was about, and the
 * alternative is shipping a site whose covers are soft to save 422 kB spread across five pages. The
 * other fifty images stay at 55, where the 1:1 verification above genuinely applies.
 * ============================================================================================
 */
const COVER_AVIF_QUALITY = 72

/*
 * The itinerary. Order here is the arrival order, and it is asserted against the workbook's
 * own `arrival_order` column rather than trusted — two sources that agree are a check; one
 * source copied twice is a liability.
 *
 * WHY SLUGS ARE DECLARED HERE RATHER THAN DERIVED FROM country_name
 * `United States` would slugify to `united-states`, which is what we want, but the derivation
 * is a coincidence rather than a rule — the moment a country name contains a comma, an
 * apostrophe or a diacritic, a derived slug becomes a URL nobody chose. Routes are public
 * contract: once someone bookmarks /japan it should never change because a spreadsheet cell
 * was edited. So the mapping is explicit and the spreadsheet cannot alter it.
 */
const ITINERARY = [
  { name: 'Japan', slug: 'japan' },
  { name: 'India', slug: 'india' },
  { name: 'Italy', slug: 'italy' },
  { name: 'Switzerland', slug: 'switzerland' },
  { name: 'United States', slug: 'united-states' },
]

/*
 * ============================================================================================
 * THE TRAVELLER'S PORTRAIT AND NOTEPAPER — the two assets the workbook never names.
 *
 * WHY THIS TABLE EXISTS AT ALL, when every other image on the site is resolved from a spreadsheet
 * cell. Because there is no cell. The workbook has thirteen sheets and not one column referencing
 * either of these files: `grep`ping every string value in every row for a traveller filename
 * returns zero matches. They were supplied in `images/` alongside the photographs and then had no
 * route into the site, which is the entire reason the visitor could not see the traveller — the
 * illustrations shipped with the project and nothing rendered them.
 *
 * So the reference has to live in code. This is the same trade the ITINERARY table above makes and
 * it is made for the same reason: the mapping is a fact about the project rather than a fact in the
 * dataset, and a fact the spreadsheet does not contain cannot be read from it.
 *
 * WHY EVERY FILENAME IS SPELLED OUT RATHER THAN DERIVED FROM THE SLUG. Look at them:
 *
 *     japan          traveler_japan.png            traveler_note_japan.png     <- name last
 *     india          traveler_india.png            india_traveler_note.png     <- both orders
 *     italy          italy_traveler.png            italy_traveler_note.png     <- name first
 *     switzerland    switerland_traveler.png       switzerland_traveler_note.png
 *     united-states  us_traveler.png               us_traveler_note.png        <- not the slug
 *
 * Three different naming conventions, a country abbreviated to `us`, and `switerland_traveler.png`
 * — missing its `z` — which no derivation from the word "switzerland" can ever produce. A rule
 * would have to be wrong for at least one of the five, and the failure would be silent: the asset
 * index returns undefined, the field becomes null, the component renders nothing, and the traveller
 * is invisible again for exactly the reason they were invisible before. Typing them out is the
 * honest option, and the misspelling is preserved rather than fixed because `images/` is the record
 * of what was supplied (see the note on EXCLUDED below).
 *
 * These are the ONE case where `^traveler_` in EXCLUDED must not apply, which is why they are
 * resolved through `resolveTravellerAsset` below rather than through `resolveAsset`.
 * ============================================================================================
 */
const TRAVELLER_ASSETS = {
  japan: { portrait: 'traveler_japan.png', notepaper: 'traveler_note_japan.png' },
  india: { portrait: 'traveler_india.png', notepaper: 'india_traveler_note.png' },
  italy: { portrait: 'italy_traveler.png', notepaper: 'italy_traveler_note.png' },
  switzerland: {
    portrait: 'switerland_traveler.png',
    notepaper: 'switzerland_traveler_note.png',
  },
  'united-states': { portrait: 'us_traveler.png', notepaper: 'us_traveler_note.png' },
}

/*
 * ============================================================================================
 * COVER PHOTOGRAPHS — the fix for "the main title images are very blur".
 *
 * WHY THIS TABLE EXISTS AT ALL. The workbook has a `hero_image` column and every one of its five
 * cells is EMPTY (verified — `country_master.hero_image` is `""` for all five countries, as is
 * `flag_image`). So `images.hero` resolved to null everywhere and the covers fell back to
 * `gallery[0]`.
 *
 * WHY THE FALLBACK WAS THE BUG. Every gallery photograph is 736px wide and PORTRAIT — they are
 * phone-shaped. A cover is a full-bleed landscape band, so `object-cover` scaled a 736px-wide
 * portrait to fill 1440px and then the backdrop's drift scaled it a further 1.16x: an effective
 * 2.27x upscale, on the largest element on the page. There is no sharpening or re-encoding that
 * recovers detail a source does not contain, so the covers were soft everywhere, on every route.
 *
 * Meanwhile the only landscape photographs in the set — 1814-2097px, one per country, obviously
 * shot to sit behind a title — were excluded by the `_title` pattern for a reason that had never
 * been checked. See the EXCLUDED note. Wiring them in takes the worst case from 2.27x to 1.20x.
 *
 * `crop` IS A MEASURED CONTENT BOX, NOT A TASTE DECISION. Two of the five were exported onto white
 * card with rounded corners, so the photograph does not reach the file's edge. Published as-is,
 * Japan's cover would carry a 110px white band along its bottom and India's a white frame on all
 * four sides — which reads as a broken image, not as a border. The boxes below were found by
 * scanning inward from each edge for the first line that is not near-white, then insetting by the
 * measured corner radius; `null` means the photograph already fills the file and nothing is cut.
 *
 * WHY THE CROP IS RECORDED HERE AND APPLIED BY THE PIPELINE rather than by `object-position` in
 * CSS. A CSS crop would hide the white edge at one aspect ratio and expose it at another, so the
 * defect would come back at some viewport nobody tested. Cutting it once, at build time, means the
 * published file simply does not contain the white — there is no width at which it can reappear.
 * `images/` keeps the untouched original either way.
 *
 * THE US ENTRY WAS THE WEAK ONE AND IS NOW FIXED, which is worth recording because the previous
 * note here was a standing admission of defeat and it should not be read as still true.
 *
 * It used to point at `us_title_background.jpeg`, 735x457 — the smallest cover in the set by a
 * factor of two and the only one that stayed visibly soft after the AVIF quality and drift fixes.
 * That note said "the honest fix is a larger source photograph" and left it, because there was no
 * larger landscape US photograph in `images/`: every other US file is a ~736px PORTRAIT, which
 * upscales exactly as badly and additionally crops away 70% of its height in a wide band.
 *
 * A 1810x869 replacement was then supplied, and it clears COVER_MIN_WIDTH with room to spare. So
 * America's cover now renders at native resolution like the other four and the `soft covers` report
 * is expected to be empty. `crop` is null because the photograph reaches all four edges — verified
 * by scanning inward for the first line that is not near-white, which found content at row 0 and
 * column 0, rather than assumed from the fact that the other two nulls are also landscape.
 *
 * THE `_wide` SUFFIX IS NOT DECORATION. The replacement arrived as `us_title_background.png`, which
 * collides in the asset index with the 735px `us_title_background.jpeg` it supersedes — the index is
 * keyed on the stem, so the two were indistinguishable and `buildAssetIndex` threw rather than
 * guessing. The old file is kept because `images/` is the record of what was supplied, so the new one
 * carries the suffix. Had the guard not existed, the build would have silently picked one of the two,
 * and "sometimes the cover is sharp" is a far worse bug than "the cover is soft".
 *
 * THE GENERAL LESSON, and it is the reason the old text is quoted above rather than deleted: the
 * pipeline reported this shortfall on every single run and the fix was one supplied file. A warning
 * that names the defect, the measurement and the remedy is what made that possible — had the cover
 * merely looked soft, nobody would have known which of six plausible causes to chase.
 * ============================================================================================
 */
const COVER_ASSETS = {
  japan: { file: 'japan_title_background.png', crop: { left: 6, top: 0, width: 2085, height: 634 } },
  india: {
    file: 'india_title_background.png',
    crop: { left: 35, top: 135, width: 1845, height: 547 },
  },
  italy: { file: 'italy_title_background.png', crop: null },
  switzerland: { file: 'switzerland_title_background.png', crop: null },
  'united-states': { file: 'us_title_background_wide.png', crop: null },
}

/*
 * The width below which a cover is reported as soft. A cover spans the full viewport, so on a
 * 1440px-wide window with the backdrop's 1.16x drift it needs ~1670px to render at native
 * resolution. Anything narrower is upscaled; the build says so rather than shipping it quietly.
 */
const COVER_MIN_WIDTH = 1670

/*
 * ============================================================================================
 * COUNTRY-NAME SPELLINGS — a tolerated misspelling is still reported every run.
 *
 * Every sheet in the workbook is joined to `country_master` on the country name, typed by hand
 * in each sheet. `country_gallery` has "United State" — no trailing s — in all five of its US
 * rows, while `country_master` has "United States". An exact-equality join therefore matched
 * nothing and the United States chapter shipped with an empty gallery.
 *
 * WHY THIS IS THE FAILURE MODE THAT MATTERS: a broken image reference is loud (it is printed as
 * an unresolved reference). A broken JOIN is silent. `filter` returning zero rows is
 * indistinguishable from a country that legitimately has no gallery yet, and the standing rule
 * against forcing equal image counts per country means "the US has no gallery" is a sentence this
 * project would accept without blinking. Five photographs disappeared and nothing said so.
 *
 * WHY A LISTED MAP AND NOT FUZZY MATCHING. Same reasoning as ALIASES: a Levenshtein-style
 * "close enough" join would also be happy to fold two genuinely different values together and
 * would never say which. Each entry here is a decision someone made on purpose.
 *
 * WHY TOLERATE IT IN CODE AT ALL, given the standing rule is "change the workbook, not the
 * JSON". Because the workbook belongs to its author and this script must not be the thing that
 * edits it. So the pipeline's job is to make the site correct AND to keep the defect visible:
 * every variant matched through this table is printed in the build report, naming the sheet, so
 * fixing the cell remains obviously the better fix. A silent tolerance would be the real
 * violation of that rule — it would make the workbook wrong forever and comfortable.
 */
const COUNTRY_SPELLINGS = {
  'united state': 'United States',
  'united states of america': 'United States',
  usa: 'United States',
  us: 'United States',
  switerland: 'Switzerland',
}

// Populated by `sameCountry` as the build runs; printed in the report at the end.
const spellingVariants = new Map()

/*
 * True when a sheet's `country` cell refers to `name`. Exact match first — the overwhelmingly
 * common case, and the one that costs nothing — then the spellings table.
 *
 * `sheetName` is only used for the report. It is passed rather than inferred because "which
 * sheet has the typo" is the single most useful thing to tell whoever fixes it.
 */
function sameCountry(cell, name, sheetName) {
  if (cell === name) return true

  const canonical = COUNTRY_SPELLINGS[String(cell ?? '').trim().toLowerCase()]
  if (canonical !== name) return false

  spellingVariants.set(`${sheetName}|${cell}`, { sheetName, cell, name })
  return true
}

/*
 * ============================================================================================
 * EDITORIAL OVERRIDES — the one place this pipeline is allowed to change the workbook's words.
 *
 * WHAT THIS IS FOR
 * The workbook's `hero_story.intro_story` is the "brochure line": the confident, promotional
 * sentence a chapter opens on, which the traveller's note immediately complicates. Four of the
 * five are written in one voice — a single descriptive clause, no exclamation, no address to the
 * reader:
 *
 *   India        "A country where every state feels like a new adventure."
 *   Italy        "Walk through history while enjoying the world’s most loved cuisine."
 *   Switzerland  "Where precision, nature and peaceful living come together."
 *   US           "Diverse landscapes, cultures and endless possibilities."
 *
 * Japan's was the exception: "Your first stop! A blend of tradition, technology and incredible
 * discipline." Two things wrong with it, and neither is a matter of taste.
 *
 *   1. THE EXCLAMATION MARK. It is the only one in the dataset's prose, and it puts a tour-
 *      operator brightness into the first sentence of the first chapter — the single most
 *      voice-setting position on the site. Every other country's line is declarative.
 *   2. "YOUR FIRST STOP!" is now redundant AND second-person. The eyebrow directly above it
 *      already reads "Stop 1 of 5 · Days 1–6", so the sentence spends its opening clause
 *      repeating the label beside it. It is also the only place the dataset addresses the
 *      visitor as "you", which conflicts with §3.4's voice.
 *
 * WHAT THE REPLACEMENT DELIBERATELY KEEPS
 * The same three nouns — tradition, technology, discipline. This is a change of register, not a
 * change of claim, and the claim has work to do: Japan's traveller note says what stayed with
 * them was "the culture of respect and quietness in everyday life". The brochure line must
 * promise tradition-and-technology so that note can contradict its emphasis. A rewrite that
 * mentioned quietness would collapse the gap that IS the chapter (CountryArrival's header note).
 * "incredible" becomes "remarkable" only because it is an intensifier of a kind the other four
 * lines do not use.
 *
 * WHY THIS IS A PIPELINE OVERRIDE AND NOT AN EDIT TO THE .xlsx
 * The honest answer is that editing the workbook is the better place and it is not available at
 * an acceptable cost. `readXlsx.mjs` is a reader — writing an .xlsx would mean adding a ZIP
 * writer and a shared-string-table patcher, which is a substantial new dependency-free codebase
 * to change one sentence. And the workbook is a tracked binary: a hand-edit in Excel produces a
 * 29 KB diff that shows nothing, so the reasoning above would live only in a commit message.
 *
 * A table here is the version that is reviewable. It states the old text, the new text and the
 * reason in the file that does the transforming, and `npm run data` still generates the JSON —
 * so nobody is hand-editing journey.json, which was the actual constraint.
 *
 * WHY EACH ENTRY CARRIES `from` AND IS ASSERTED
 * An override that silently wins is a trap. If the workbook is ever corrected at source, an
 * unconditional replacement would quietly overwrite the new, better copy with our older
 * substitute — and nothing would report it. Asserting the expected original means the build
 * fails the moment the premise stops holding, which is the only way a patch like this stays
 * honest over time.
 *
 * THE BAR FOR ADDING TO THIS TABLE IS HIGH. It is for cases where the dataset's wording is
 * inconsistent with itself and the fix is presentational. It is NOT for changing what the data
 * says, and it must never touch `traveler_observation.observation` or `storyteling.traveler_note`
 * — those are the traveller quoted verbatim, and rewriting a quotation is putting words in
 * someone's mouth (§3.4).
 * ============================================================================================
 */
const WELCOME_OVERRIDES = {
  Japan: {
    from: 'Your first stop! A blend of tradition, technology and incredible discipline.',
    to: 'A blend of tradition, technology and remarkable discipline.',
    why: 'the dataset’s only exclamation mark, plus a redundant second-person "Your first stop!" that repeats the eyebrow above it',
  },
}

/**
 * Apply a welcome-line override, asserting the workbook still says what the override expects.
 *
 * Returns `{ text, overridden }` so the run report can name what was changed. Reporting it is
 * the point: a transformation nobody is told about is indistinguishable from the source data.
 */
function applyWelcomeOverride(country, original) {
  const override = WELCOME_OVERRIDES[country]
  if (!override) return { text: original, overridden: false }

  // Compared after `typographic()` has run on both sides, so a straight-versus-curly apostrophe
  // can never be the thing that fails this check.
  if (typographic(original) !== typographic(override.from)) {
    throw new Error(
      `${country}: the welcome-line override in convertData.mjs no longer matches the workbook.\n` +
        `        expected: ${JSON.stringify(override.from)}\n` +
        `        found:    ${JSON.stringify(original)}\n` +
        `        If the workbook has been corrected at source, DELETE the WELCOME_OVERRIDES entry\n` +
        `        rather than updating \`from\` — the override exists only because the source was\n` +
        `        off-voice, and keeping it would overwrite the better copy with an older patch.`,
    )
  }

  return { text: override.to, overridden: true }
}

/*
 * ASSET RESOLUTION — mapping what the spreadsheet *says* to what is actually on disk.
 *
 * The workbook refers to images three different ways: a full internal URL
 * (`https://drive.corp.amazon.com/.../japan_hero.jpeg`), a bare filename that exists
 * (`japan_stamp.png` — which does not, in fact, exist), and a bare filename that is simply
 * wrong (`japan_hanami.jpg` for a file named `hanami_cherry_blossom_japan.jpeg`).
 *
 * So resolution is: take the basename, drop the extension, and look it up in an index of the
 * real files built by reading the directory. Extension-insensitive because the source says
 * `.jpg` where the file is `.jpeg`; and the index is built from the filesystem rather than
 * hardcoded so that adding an image is not a code change.
 *
 * ALIASES cover the cases where the name itself differs. Each is a deliberate mapping, listed
 * rather than pattern-matched, because a fuzzy match that guessed "hanami" → the cherry
 * blossom photo would also happily guess wrong somewhere else and never say so.
 *
 * AN ALIAS IS ONLY EVER APPLIED WHEN THE NAME DOES NOT ALREADY RESOLVE — see resolveAsset.
 *
 * That ordering is not a detail; it is what stops this table going stale in a way that BREAKS
 * working references. When the image set was reorganised, `india_thali.jpeg` arrived as a real
 * file, and the alias `india_thali -> thali_india` then pointed a resolvable name at a filename
 * that no longer exists. An alias applied BEFORE the direct lookup turns a fix into a
 * regression: the file was on disk and the build still reported it missing.
 *
 * The stale entries are kept rather than deleted, because the old names may return in a future
 * workbook and a mapping that never fires costs nothing. The rule is that the disk wins.
 */
const ALIASES = {
  japan_hanami: 'hanami_cherry_blossom_japan',
  japan_tea_ceremony: 'tea_ceremony_japan',
  japan_shinkansen: 'shinkansen_bullet_train_japan',
  india_holi: 'holi_festival_india',
  india_bazaar: 'traditional_bazaar_india',
  india_thali: 'thali_india',
  india_spices: 'spices_india',
}

/*
 * Files present in images/ that this pipeline will never copy.
 *
 *   *_dash.png, top_part_of_dashboard.png — mockups of the original dashboard. These are INTENT,
 *      not assets: the numbers on them are already in the sheets as text, which is the form we can
 *      typeset, translate and make accessible.
 *   transport_*.png — screenshots of dashboard panels. Their content is already in the
 *      `transport` sheet as text and numbers, which is the form we can actually typeset and
 *      make accessible.
 *
 *   `_title` HAS BEEN REMOVED FROM THE PATTERN, AND IT IS THE SAME MISTAKE AS `^traveler_` BELOW.
 *
 *      This entry read "*_title.png — pre-rendered title art. A title as a PNG cannot reflow, cannot
 *      be selected, cannot be read by a screen reader and cannot scale. Titles are typography." Every
 *      word of that argument is correct about pre-rendered title art. None of it is true of these
 *      files. Opened, all five `*_title_background.*` are ordinary landscape photographs with no
 *      lettering on them at all: Mount Fuji behind a pagoda, the Taj Mahal at sunrise, the Amalfi
 *      coast, a Swiss lakeside, the Statue of Liberty against the Manhattan skyline. The word "title"
 *      in the filename describes WHERE the photograph was meant to go — behind the title — not what is
 *      printed on it.
 *
 *      WHAT IT COST, which is why this is worth the space: they are the only landscape images in the
 *      set, 1814–2097px wide. Excluding them left the covers to fall back on `gallery[0]`, which is
 *      736px and PORTRAIT, so every cover on the site upscaled a portrait photograph about 2x to fill
 *      a landscape band. The visitor's report was that the main title images are "very blur", and that
 *      is exactly what a 2x upscale looks like. The blur was not a rendering setting or a compression
 *      level; it was this exclusion, three years of reasoning downstream from a filename.
 *
 *      Note that `_dash` and `transport_` are NOT removed. Their reasons were checked, they are true,
 *      and they describe genuine screenshots of dashboard panels. The lesson is not "exclusions are
 *      bad" — it is that this one had never been opened. That is now the third entry in this list to
 *      have been written from its filename, and the second to have shipped a visible defect because
 *      of it, so the rule at the end of the `^traveler_` note is restated as a requirement: an
 *      exclusion must name what was seen when the file was opened. "Its name looks like X" is not a
 *      reason, and the next person to add a pattern here should assume their guess is wrong until
 *      they have looked.
 *
 *   `^traveler_` IS STILL IN THE PATTERN BELOW, BUT IT NO LONGER MEANS WHAT IT SAID.
 *
 *      This entry used to read "traveler_*.png, traveler_note_japan.png — screenshots of dashboard
 *      panels", and that claim was simply false. Opened, `traveler_japan.png` is an illustration of
 *      a person: a young traveller with a backpack, holding that country's passport, one per
 *      country. `traveler_note_japan.png` is a sheet of cream notepaper with sepia line art of the
 *      country's landmarks — a writing surface, obviously drawn to have a note set on it.
 *
 *      Nobody checked. The files were grouped with the dashboard screenshots by the shape of their
 *      names, a reason was written down for them as a group, and the reason was inherited by every
 *      later reader — including a rewrite of the whole site that concluded the traveller could not
 *      be depicted because no depiction existed. The visitor's complaint was that they could not see
 *      the traveller, and the traveller had been sitting in `images/` the whole time behind a
 *      comment asserting they were a screenshot.
 *
 *      THE GENERAL LESSON, and it is the more useful half of this note: an exclusion needs a reason
 *      that was CHECKED, not a reason that is plausible. `_dash`, `_title` and `transport_` were
 *      verified by opening them. These never were, and a filename pattern is a guess about content
 *      dressed up as a rule. Anything excluded here should be openable in one command by the next
 *      reader — if it is not obvious how to verify the claim, the claim does not belong in the list.
 *
 *      The pattern is KEPT because it is still doing real work for the AVIF/copy path: these two
 *      files must not be published as ordinary photographs. They are published deliberately, by
 *      `resolveTravellerAsset`, which bypasses this test by design and says so.
 *   france_hero, netherlands_hero, sweden_hero — countries not on this itinerary.
 *   *_pp.jpeg AND *_passport.jpeg — the passport stamp graphics. See the long note below.
 *   us_flag.jpeg — watermarked. Named individually WITH ITS EXTENSION, not by pattern; the clean
 *      replacement `us_flag.png` must not inherit this exclusion. See the note below.
 *
 * NOT EXCLUDED, though the names suggest it: `*_did_you_know.*` and `did_you know_japan.jpeg`.
 * They read like dashboard panels — the workbook has a "did you know" callout — and they were
 * briefly added to this pattern on that assumption. Opened, they are ordinary photographs: a JR
 * vending machine, a spice market, an Italian street. No sheet references them, so they are not
 * copied either way; the difference is that an exclusion would be a standing claim about their
 * content, and the claim would be false. A rule should be exactly as wide as its reason, and this
 * one had no reason at all.
 */
/*
 * `_pp\.` and not `_pp$`: this pattern is tested against the filename WITH its extension
 * (`india_pp.jpeg`), so an end-anchor would never match. The dot anchors it to the extension
 * boundary, so it cannot also catch a hypothetical `foo_ppsomething.jpeg`.
 *
 * `_passport\.` IS THE SAME FILES UNDER A NEW NAME, and adding it was a fix rather than a
 * tidy-up. The reorganised image set renamed `india_pp.jpeg` to `india_passport.jpeg`, at which
 * point `_pp\.` matched nothing and the two watermarked stock comps — 123RF across india's,
 * dreamstime.com along switzerland's — were eligible to ship again. Verified by opening the new
 * files, not inferred from the rename: both watermarks are still there.
 *
 * THE GENERAL LESSON, worth stating because it has now happened twice in this file: an exclusion
 * list is keyed on filenames, so a rename silently disarms it. Nothing fails, nothing is
 * reported — the excluded file simply starts being published. Whenever the image set is renamed
 * or reorganised, every pattern here has to be re-checked against the actual directory listing.
 * `_pp\.` is kept alongside it for the reason the ALIASES entries are kept: a mapping that never
 * fires costs nothing, and the old names may return.
 */
const EXCLUDED =
  /(_dash|_pp\.|_passport\.|^us_flag\.jpeg|^top_part_of_dashboard|^traveler_|^transport_|^france_|^netherlands_|^sweden_)/

/*
 * ============================================================================================
 * WHY THE PASSPORT STAMP GRAPHICS (*_pp.jpeg, now *_passport.jpeg) ARE EXCLUDED.
 *
 * These are five circular rubber-stamp illustrations, one per country, referenced by the
 * workbook's `passport_stamp_image` column. They are excluded for two independent reasons,
 * either of which would be sufficient on its own.
 *
 * 1. TWO OF THE FIVE ARE UNLICENSED STOCK COMPS. Inspected at full resolution, before and again
 *    after the rename: india_passport.jpeg carries tiled "123RF" watermarks across the whole
 *    image, and switzerland_passport.jpeg carries a "dreamstime.com" watermark along its lower
 *    edge. A watermark is a stock agency's notice
 *    that the file is a preview and has not been paid for. Publishing it is both a licensing
 *    problem and, in a project judged on craft, a visible one: a competition reviewer who spots
 *    a watermark stops evaluating the design.
 *
 * 2. NO COMPONENT RENDERS THEM, AND THE DESIGN DOES NOT WANT THEM TO. The passport page builds
 *    each stop from the country's flag, its arrival order, its dates and its epithet — set in
 *    type. A generic clip-art stamp saying "ITALY · REPUBBLICA ITALIANA" next to that adds no
 *    information and pulls the page towards the souvenir-graphic register the whole visual
 *    direction avoids. This is the same standing decision that excludes the *_title.png files:
 *    an asset that duplicates typography in a form that cannot reflow or be read aloud is not
 *    an upgrade over the typography.
 *
 * WHY EXCLUDE IN THE PIPELINE RATHER THAN DELETE THE FILES. images/ is the source workbook's
 * asset folder — the record of what was supplied. Deleting from it would edit that record, and
 * a future reviewer would have no way to know a stamp column ever existed. Excluding here keeps
 * the source intact, stops the files being copied into public/images/ or the built site, and
 * puts the reason in the code that makes the decision.
 *
 * WHAT THIS MEANS FOR THE OUTPUT: `images.stamp` is now null for all five countries rather than
 * a path. The field is kept rather than removed so the shape of the data still reflects what the
 * workbook offers; a consumer that wants stamps has to source licensed artwork first. If
 * licensed stamps are ever added, drop `_pp\.` and `_passport\.` from EXCLUDED and delete this
 * note.
 *
 * ============================================================================================
 * WHY us_flag.jpeg IS EXCLUDED — AND WHY IT IS NAMED RATHER THAN PATTERN-MATCHED.
 *
 * Checking the stamps prompted checking every other unused asset in the same way, which is how
 * this one surfaced: us_flag.jpeg carries "STARSPANGLEDFLAGS.COM" burned across its lower third
 * in large purple capitals. The other four flag photographs (japan, india, italy, switzerland)
 * were inspected at full resolution and are clean, so a blanket `_flag` exclusion would discard
 * four usable photographs to remove one unusable one.
 *
 * That asymmetry is the point. `_pp\.` is a pattern because the objection applies to the whole
 * category — none of the five stamps should be published, watermark or not. `^us_flag\.jpeg` is a
 * single filename because the objection is about one specific file, and a pattern would claim
 * something untrue about the other four. A rule should be exactly as wide as its reason.
 *
 * THE EXTENSION IS NOW PART OF THE PATTERN, AND THAT CHANGE IS LOAD-BEARING. It used to read
 * `^us_flag\.`, matching any extension — which was correct when `us_flag.jpeg` was the only file
 * with that stem. A clean, unwatermarked `us_flag.png` was then supplied, and the old pattern
 * silently excluded it too: the replacement for the excluded file was caught by the exclusion
 * written for the file it replaced. Nothing failed, `images.flag` stayed null for America, and the
 * only symptom was a country missing a photograph the project had been given.
 *
 * This is the third time in this file that a filename-keyed rule has misfired on a rename or an
 * addition (see the `_pp\.` note above, and the `^traveler_` note in EXCLUDED). The pattern is now
 * as narrow as its reason — one watermarked JPEG — so a new file cannot inherit its exclusion.
 * ============================================================================================
 *
 * NOTE these files are ALSO the reason `resolveAsset` returns null after the EXCLUDED test
 * rather than before it — an excluded file is a deliberate omission, not an unresolved
 * reference, so it must not be reported in the "named but missing" list at the end of the build.
 * ============================================================================================
 */

function buildAssetIndex() {
  const index = new Map()

  /*
   * WALKS SUBDIRECTORIES, because images/ is organised per country (images/japan/, images/india/,
   * …) rather than flat. It used to read only the top level, which after the folders appeared
   * meant it indexed nothing and all thirty-five references came back unresolved — a build that
   * "succeeded" with every photograph replaced by a placeholder.
   *
   * The index stays keyed by BARE FILENAME rather than by relative path, deliberately. The
   * workbook's references are absolute paths from whichever machine filled the cell in, so the
   * only part of them that can be trusted is the filename. Keying on the filename means the
   * folder layout can be reorganised again without touching the workbook, and a reference can
   * name a file without knowing where it lives.
   *
   * THE COST OF THAT CHOICE, STATED SO IT IS NOT A SURPRISE: two files with the same name in
   * different country folders would collide, and the second one walked would silently win. That
   * is why the collision is reported rather than tolerated — see below.
   */
  const seen = new Map()

  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      // Skip macOS's .DS_Store and any other dotfile: not assets, and Image.open chokes on them.
      if (entry.name.startsWith('.')) continue

      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
        continue
      }

      const stem = basename(entry.name, extname(entry.name)).toLowerCase()
      const relative = full.slice(SOURCE_IMAGES.length + 1)

      if (seen.has(stem)) {
        throw new Error(
          `Two image files share the name "${entry.name}": ${seen.get(stem)} and ${relative}.\n` +
            `  The asset index is keyed by filename, because the workbook's paths cannot be\n` +
            `  trusted to point anywhere real. Rename one of the two files.`,
        )
      }

      seen.set(stem, relative)
      // The VALUE is the path relative to images/, since that is what has to be opened to copy.
      index.set(stem, relative)
    }
  }

  walk(SOURCE_IMAGES)
  return index
}

/**
 * Resolve one spreadsheet image reference to a web path under /images, or null.
 *
 * Returns the PUBLIC path (`./images/japan_hero.jpeg`), which is what a browser needs, and
 * records the file to copy.
 *
 * NOTE THE `./` — IT IS DOCUMENT-RELATIVE, NOT ROOT-RELATIVE, AND THAT MATTERS FOR DEPLOYMENT.
 *
 * These paths used to begin with a bare `/`. That is correct only when the site is served from
 * the root of a domain; on GitHub Pages a project repository is served from
 * `https://<user>.github.io/<repo>/`, where `/images/x.jpeg` resolves one directory too high and
 * every photograph 404s.
 *
 * Vite cannot save us here the way `base: './'` saves the script and stylesheet tags. Those are
 * URLs in files Vite parses, so it rewrites them; these are string values inside journey.json,
 * read at runtime, and Vite has no reason to believe they are URLs at all. So the two halves of
 * the same decision live in two places, and this is the half the build cannot check. The failure
 * mode is quiet in the worst way: the layout is perfect, the text is all present, and every
 * photograph is replaced by its designed placeholder — the site looks like it was shipped without
 * assets rather than like it is broken. See the `base` note in vite.config.js.
 *
 * Document-relative is safe here for the same reason `base: './'` is: every route lives after a
 * `#`, so the browser's document path is always index.html no matter which page is showing.
 */
function resolveAsset(reference, index, copyList, unresolved, context) {
  // An empty cell is a known gap, not a failure — India's gallery rows exist with blank
  // images. Recorded distinctly from "named a file we could not find", because the two mean
  // different things: one is data not yet gathered, the other is a broken reference.
  if (!reference) return null

  /*
   * NORMALISE THE CELL BEFORE READING IT. A workbook cell is typed by a person, and these
   * arrive in several shapes:
   *
   *   '/Users/me/…/images/japan/japan_city.jpeg'   <- wrapped in literal quotes
   *   /Users/me/…/images/japan/japan_city.jpeg     <- bare absolute path
   *   /Users/me/Downloads/italy_pasta_making.jpeg  <- a path outside the repo entirely
   *   japan_hero.jpeg                                    <- a bare filename
   *
   * THE QUOTES MATTERED AND WERE NOT OBVIOUS. Spreadsheet software will happily store the
   * apostrophes as part of the value, so the string ended `japan_city.jpeg'` — with a trailing
   * quote INSIDE the extension. `extname` then returned `.jpeg'`, the stem never matched the
   * index, and the build reported the file as missing while it sat right there on disk. The
   * error message named `japan_city.jpeg'` with the stray quote visible, which is the only
   * reason it was findable at all.
   *
   * The absolute paths are stripped to a filename for the reason given in buildAssetIndex: only
   * the filename half of a path typed on someone else's machine can be trusted. That is also
   * what makes the `Downloads/` references work — the file exists in the repo under the same
   * name, so naming the wrong folder is survivable.
   */
  const cleaned = String(reference)
    .trim()
    .replace(/^['"`]+|['"`]+$/g, '') // literal quote characters around the value
    .split('?')[0]

  // Handles a Windows path too: split on either separator, then take the last segment.
  const raw = cleaned.split(/[\\/]/).pop().trim()
  const stem = basename(raw, extname(raw)).toLowerCase()

  /*
   * THE DISK WINS OVER THE ALIAS TABLE. `index.get(stem)` is tried FIRST, and an alias is only
   * consulted when the name does not name a real file.
   *
   * It used to be the other way round (`ALIASES[stem] ?? stem`), and that inversion is how a
   * compatibility shim became the bug. `india_thali -> thali_india` was written when the photo
   * was called `thali_india.jpeg`. The new image set calls it `india_thali.jpeg` — a direct
   * match — but the alias fired first and redirected a correct name to a filename that no longer
   * exists, so it was the only unresolved reference in the build. An alias should be able to
   * rescue a stale reference; it must never be able to break a good one.
   */
  const file = index.get(stem) ?? index.get(ALIASES[stem] ?? stem)

  /*
   * A REFERENCE THAT NAMES A FILE WE DO NOT HAVE IS REPORTED, NOT SWALLOWED.
   *
   * The first version of this function returned null here and the caller filtered nulls away.
   * That made the build print "0 gallery" for four countries and say nothing about why —
   * a pipeline built to surface data problems was concealing fourteen of them. Returning null
   * is still correct (the site must render without the image), but silence is not.
   */
  if (!file) {
    unresolved.push({ context, reference: raw })
    return null
  }
  /*
   * `file` is now a path relative to images/ (`japan/japan_dashboard.png`), so EXCLUDED is
   * tested against the BASENAME. Several of its patterns are `^`-anchored — `^traveler_`,
   * `^transport_`, `^us_flag\.` — and an anchor cannot match when a folder name precedes it.
   * Left as-is, every excluded file would have quietly started shipping again.
   */
  if (EXCLUDED.test(basename(file))) return null

  copyList.add(file)
  // Spaces are legal in a filename and illegal in a URL — `did_you know_japan.jpeg` has one.
  // The file is copied under a normalised name so no URL in the site ever needs encoding.
  return `./${PUBLIC_IMAGES.replace(/^public\//, '')}/${normaliseFilename(file)}`
}

/*
 * Resolve one of the traveller's own two assets, named in TRAVELLER_ASSETS rather than in the
 * workbook.
 *
 * WHY IT IS A SEPARATE FUNCTION AND NOT A FLAG ON `resolveAsset`. The difference is not a small
 * one: this deliberately DOES NOT apply EXCLUDED, and `^traveler_` is in EXCLUDED. A boolean
 * parameter that switches off a safety check is the kind of thing that gets passed by accident from
 * a call site that has not read what it does, and the check it switches off is the one stopping
 * watermarked stock and dashboard screenshots from shipping. A separate function with its own name
 * cannot be reached carelessly, and the exemption is stated once, here, with its reason attached.
 *
 * It also skips the whole spreadsheet-cell cleaning path — the quote stripping, the Windows-path
 * splitting, the alias table — because its input is a filename this file typed, not a cell someone
 * filled in on another machine. There is nothing to normalise and nothing to forgive.
 *
 * A MISSING FILE THROWS rather than returning null. The other images come from a workbook that is
 * allowed to be incomplete, so an unresolved reference there is data not yet gathered and is
 * reported at the end of the build. This table is code: every entry names a file that this
 * repository contains, so a miss means the table and the directory have gone out of step — a
 * rename, most likely, since one of these filenames is already misspelled. Failing loudly is the
 * point. The alternative is the exact silence that hid these files in the first place: null field,
 * no component, no traveller, no error.
 */
function resolveTravellerAsset(filename, index, copyList, context) {
  return resolveNamedAsset(filename, index, copyList, context, 'TRAVELLER_ASSETS')
}

/*
 * The shared body of every hand-written asset table's resolver — TRAVELLER_ASSETS, COVER_ASSETS,
 * FLAG_ASSETS and FACT_ASSETS all reduce to this.
 *
 * WHY THIS WAS EXTRACTED, given the file's general preference for stating things once per place
 * they are decided. Because there were two identical copies and this change needed a third and a
 * fourth, and four copies of a lookup-then-throw is four places for the error message to drift out
 * of agreement with what the code does. The thing that legitimately differs between the tables is
 * the NAME in the error message and the extra hint after it, so those are parameters and nothing
 * else is.
 *
 * WHAT IS DELIBERATELY NOT A PARAMETER: whether EXCLUDED applies. None of these tables test it, and
 * that is not an oversight — see the note on `resolveTravellerAsset` above for the full argument.
 * The short form: the input is a filename THIS FILE TYPED, so there is no untrusted spreadsheet cell
 * to defend against, and a boolean that switches off the watermark check is exactly the parameter
 * that gets passed wrongly by a call site that has not read it. A caller that wants the check calls
 * `resolveAsset` instead, which is a different function with a different name.
 */
function resolveNamedAsset(filename, index, copyList, context, tableName, extraHint = '') {
  const stem = basename(filename, extname(filename)).toLowerCase()
  const file = index.get(stem)

  if (!file) {
    throw new Error(
      `${tableName} names "${filename}" for ${context}, which is not in ${SOURCE_IMAGES}/.\n` +
        `  This table is hand-written code, not a spreadsheet reference, so this is a rename or a\n` +
        `  typo rather than missing data. Fix the filename in ${tableName}.${extraHint}`,
    )
  }

  copyList.add(file)
  return `./${PUBLIC_IMAGES.replace(/^public\//, '')}/${normaliseFilename(file)}`
}

/*
 * Resolve one country's cover photograph, named in COVER_ASSETS rather than in the workbook.
 *
 * Structurally the same as `resolveTravellerAsset` and separate from it for the same reason it is
 * separate from `resolveAsset`: the input is a filename this file typed, so there is no spreadsheet
 * cell to clean and no alias table to consult, and a miss is a rename rather than missing data.
 *
 * It does NOT need an EXCLUDED exemption — `_title` was removed from that pattern once the files were
 * actually opened (see the EXCLUDED note). This is worth stating because the obvious way to fix the
 * blur would have been to add a second bypass here and leave the wrong pattern in place, which would
 * have left the false claim standing for the next reader to inherit. The pattern was the bug.
 */
function resolveCoverAsset(filename, index, copyList, context) {
  return resolveNamedAsset(
    filename,
    index,
    copyList,
    context,
    'COVER_ASSETS',
    `\n  Note the crop box beside it is measured in pixels against THAT file — if the artwork was\n` +
      `  resupplied rather than renamed, the box has to be re-measured, not just re-pointed.`,
  )
}

/*
 * ============================================================================================
 * FLAG AND FACT PHOTOGRAPHS — two more tables the workbook does not fill in.
 *
 * WHY THEY ARE HERE AND NOT READ FROM CELLS. `country_master.flag_image` is empty for all five
 * countries, exactly like `hero_image` was; there is no column at all for a photograph of the
 * did-you-know fact. So both are facts about the project rather than facts in the dataset, which is
 * the same position COVER_ASSETS and TRAVELLER_ASSETS are in, and they take the same shape.
 *
 * THE FLAGS. Five photographs of a flag flying at a real place — Kiyomizu-dera, the Gateway of
 * India, the Colosseum, a chalet above Lake Thun, the Capitol. That is what makes them worth
 * publishing rather than the emoji already in `src/data/countries.js`: they are not flag ICONS, they
 * are a flag SOMEWHERE, which is the difference between a label and a photograph. The emoji stay
 * where they are — navigation, footer, passport — because a 16px photograph would be mud.
 *
 * `us_flag_capitol.png` RATHER THAN `us_flag.jpeg`, and this is the whole reason America has a flag
 * now. The supplied JPEG carries "STARSPANGLEDFLAGS.COM" burned across its lower third and is
 * excluded permanently; the replacement is a clean 1536x1024 of the Capitol behind the flag.
 *
 * WHY IT IS NOT SIMPLY `us_flag.png`. That is what it was called first, and `buildAssetIndex` threw:
 * the index is keyed on the filename STEM, deliberately, because the workbook's absolute paths point
 * at directories on another machine and only the filename half can be trusted. `us_flag.jpeg` and
 * `us_flag.png` share the stem `us_flag`, so the two files were indistinguishable to the index — and
 * the collision guard is what turned a silent coin-flip between a watermarked file and a clean one
 * into a build failure that named both paths. The `_capitol` suffix describes the photograph, so the
 * stem is unique and the guard has nothing to complain about.
 *
 * Note this ALSO means the extension narrowing in EXCLUDED is no longer the thing keeping the
 * replacement publishable — the filename differs outright. It is kept anyway, because the rule
 * should be true regardless of what the replacement happens to be called.
 *
 * THE FACT PHOTOGRAPHS, and why there are only four. Each one literally depicts the `did_you_know`
 * sentence the site already prints for that country:
 *
 *     japan          a JR-Cross acure machine, full of hot coffee and cold tea
 *                    <- "over 5 million vending machines"
 *     india          an open spice market, forty sacks deep
 *                    <- "the world's largest producer of spices"
 *     italy          Vesuvius standing over the excavated amphitheatre at Pompeii
 *                    <- "three active volcanoes - Etna, Stromboli, and Vesuvius"
 *     switzerland    seven guinea pigs, in a row, looking directly at the camera
 *                    <- "illegal to own just one guinea pig"
 *
 * That is the test they had to pass, and it is Principle 10 exactly: an image that advances the
 * narrative rather than filling space. These do not illustrate the country in general — they
 * illustrate the specific sentence beside them, which is why they can sit next to it without being
 * decoration.
 *
 * THE UNITED STATES IS ABSENT ON PURPOSE. `us_did_you_know.jpeg` is a photograph of the United
 * Nations building — the one in GENEVA, flags along the forecourt — and the American fact is that
 * the country has no official federal language. It is the wrong country and the wrong subject, so it
 * stays unpublished and America's fact renders as text alone.
 *
 * WHY THAT IS A NULL AND NOT A SUBSTITUTION. The standing rule against forcing equal image counts
 * applies here with force: the alternative is choosing some other American photograph and hoping it
 * reads as being about language, which it would not. Four countries showing a photograph and one
 * showing a sentence is honest. Five countries where one photograph is a non-sequitur is worse than
 * the gap, and the component has to handle the null anyway.
 * ============================================================================================
 */
const FLAG_ASSETS = {
  japan: 'japan_flag.jpeg',
  india: 'india_flag.jpeg',
  italy: 'italy_flag.jpeg',
  switzerland: 'switzerland_flag.jpeg',
  'united-states': 'us_flag_capitol.png',
}

/*
 * `null` is a legitimate value here and means "no photograph depicts this country's fact", which is
 * a different statement from a missing key. Spelled out for all five so that the United States is
 * visibly a decision rather than an omission someone forgot to make.
 */
const FACT_ASSETS = {
  japan: 'did_you know_japan.jpeg',
  india: 'india_did_you_know.jpeg',
  italy: 'italy_did_you_know.png',
  switzerland: 'switzerland_did_you_know.jpeg',
  'united-states': null,
}

function resolveFlagAsset(filename, index, copyList, context) {
  return resolveNamedAsset(filename, index, copyList, context, 'FLAG_ASSETS')
}

/*
 * Returns null for a country whose entry is null, without consulting the index — "there is no
 * photograph for this fact" is data, not a lookup failure, so it must not throw.
 */
function resolveFactAsset(filename, index, copyList, context) {
  if (filename === null) return null
  return resolveNamedAsset(filename, index, copyList, context, 'FACT_ASSETS')
}

/*
 * The published filename for a source file.
 *
 * FLATTENS THE COUNTRY FOLDER. Input is a path relative to images/ (`japan/japan city.jpeg`);
 * output is a single filename (`japan_city.jpeg`), because public/images/ is a flat directory.
 * Keeping the folder structure there was the alternative and buys nothing: the filenames are
 * already country-prefixed, buildAssetIndex has proven they are unique, and a flat directory
 * keeps the AVIF-sibling rule in src/lib/images.js a pure extension swap.
 *
 * A file with a space in its name works locally and then fails on a static host that does not
 * encode it, or gets double-encoded by a CDN. Renaming at the copy step means the awkward
 * source filename never becomes a URL.
 */
function normaliseFilename(file) {
  return basename(file).replace(/\s+/g, '_')
}

/*
 * The AVIF companion's filename: `japan_hero.jpeg` → `japan_hero.avif`.
 *
 * Note it REPLACES the extension rather than appending one. `japan_hero.jpeg.avif` would also
 * work as a filename, but it reads as a JPEG that something happened to, and it makes the pair
 * harder to see as one asset in two formats when scanning the directory.
 *
 * The site never builds this string itself — the components derive the AVIF path from the JPEG
 * path in the JSON, using the same rule. Keeping the rule this simple is what makes deriving it
 * in two places acceptable rather than fragile; see the note in ImageFrame.
 */
function avifName(file) {
  return `${basename(file, extname(file))}.avif`
}

/*
 * ============================================================================================
 * CUTTING THE TRAVELLER OUT OF THEIR WHITE BOX.
 *
 * THE PROBLEM. The five portraits were not produced consistently. Two of them (Italy, the United
 * States) arrived as real cut-outs with an alpha channel; the other three (Japan, India,
 * Switzerland) are opaque RGB images of the figure on a flat near-white field. Rendered as-is, two
 * countries get a traveller standing on the page and three get a traveller in a white rectangle —
 * on a cream site, a visible box with a hard edge. Since the whole point is a figure who appears to
 * be standing in the page, three of five looking like clip-art pasted on top is not a small defect.
 *
 * WHY A FLOOD FILL FROM THE BORDER, AND NOT A BRIGHTNESS THRESHOLD. The obvious approach — "every
 * pixel brighter than X becomes transparent" — destroys the drawing. These are anime-style
 * illustrations: the eye whites, the highlight on the passport's page edge and the pale sheen on the
 * jacket are all as bright as the background, and a global threshold punches holes straight through
 * the face. A flood fill starting at the image border and spreading only through light pixels can
 * only ever reach background that is CONNECTED to the edge. The eye whites are enclosed by the
 * dark lines of the eyelid, so nothing can reach them, and they survive untouched. The rule is
 * "outside", which is what "background" actually means, rather than "bright", which is a proxy for
 * it that happens to be wrong here.
 *
 * WHY TWO THRESHOLDS RATHER THAN ONE. A single cut-off gives a hard, aliased edge and leaves a pale
 * fringe around the figure, which on a cream background reads as a halo — the giveaway of a badly
 * keyed image. Between LIGHT_FLOOR and LIGHT_CEILING the alpha ramps, so the anti-aliased pixels at
 * the boundary of the drawing keep a partial opacity and the outline stays smooth.
 *
 * WHY THE COLOUR IS RECONSTRUCTED (`unmultiply`). An anti-aliased edge pixel is already a blend of
 * the ink and the white background. Making it half-transparent without correcting its colour leaves
 * the white it was blended with sitting in the result, which is exactly the fringe the ramp was
 * meant to fix. Solving `composited = colour × alpha + white × (1 − alpha)` for `colour` recovers
 * what the pixel would have been over nothing at all — so the edge blends into cream instead of
 * carrying a white outline onto it.
 *
 * WHY THIS IS HERE RATHER THAN DONE ONCE BY HAND IN AN IMAGE EDITOR. `images/` is the record of what
 * was supplied (the same argument the EXCLUDED note makes about not deleting files). A retouched PNG
 * committed over the original would erase the fact that three of the five arrived unkeyed, and the
 * next person to add a country would have no idea the step exists. In the pipeline it is a rule with
 * its reasons attached, it re-runs if the artwork is replaced, and the source stays untouched.
 * ============================================================================================
 */

/*
 * A pixel at or above this (on its darkest channel) can be treated as background if the flood fill
 * reaches it. 205 rather than something nearer white because the flat field has gentle shading and
 * a JPEG-ish gradient in places; too high a floor and the fill stops partway across the background,
 * leaving a torn box behind the figure.
 */
const LIGHT_FLOOR = 205

/* At or above this a reached pixel is fully transparent. Between the two, alpha ramps. */
const LIGHT_CEILING = 246

/* What the figures were composited against. Measured: all three fields are 253–255 on every channel. */
const KEYED_AGAINST = 255

/**
 * Given a portrait that has no alpha channel, return a PNG buffer with its background removed.
 *
 * Returns null when the image ALREADY has an alpha channel, which is the signal to copy it
 * untouched — Italy's and the United States' portraits are already cut out, and re-keying an image
 * whose background is already transparent would find no light border to start from and do nothing,
 * or worse, eat into artwork that happens to be pale.
 */
async function cutOutPortrait(source) {
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  /*
   * Already a cut-out? Decided by looking at the four corners rather than by the file's declared
   * mode, because `ensureAlpha` above means everything arrives with four channels and the mode no
   * longer distinguishes them. A supplied cut-out has transparent corners; a white-box image has
   * opaque ones.
   */
  const corners = [
    0,
    (width - 1) * channels,
    (height - 1) * width * channels,
    ((height - 1) * width + width - 1) * channels,
  ]
  if (corners.every((offset) => data[offset + 3] === 0)) return null

  /*
   * The fill. An explicit stack rather than recursion: these are 1.5-megapixel images, so a
   * recursive flood fill would exhaust the call stack on the first one. `Int32Array` for the stack
   * and `Uint8Array` for the visited set rather than JS arrays and a Set — this is the one genuinely
   * hot loop in the pipeline, and boxed numbers in a Set would make it several seconds instead of
   * a few hundred milliseconds.
   */
  const outside = new Uint8Array(width * height)
  const stack = new Int32Array(width * height)
  let top = 0

  const isLight = (pixel) => {
    const offset = pixel * channels
    return Math.min(data[offset], data[offset + 1], data[offset + 2]) >= LIGHT_FLOOR
  }

  const push = (pixel) => {
    if (outside[pixel] || !isLight(pixel)) return
    outside[pixel] = 1
    stack[top++] = pixel
  }

  // Seed from every border pixel: the background is whatever is connected to the edge of the frame.
  for (let x = 0; x < width; x += 1) {
    push(x)
    push((height - 1) * width + x)
  }
  for (let y = 0; y < height; y += 1) {
    push(y * width)
    push(y * width + width - 1)
  }

  /*
   * Four-connected, not eight. An eight-connected fill can squeeze through a single-pixel diagonal
   * gap in the drawing's outline and flood the inside of the figure — for these illustrations that
   * means the fill leaking through a hairline into the jacket. Four-connectivity cannot pass a
   * diagonal pinch, which is the conservative direction to fail in: a little background left behind
   * is invisible at display size, a hole in the traveller is not.
   */
  while (top > 0) {
    const pixel = stack[--top]
    const x = pixel % width
    const y = (pixel - x) / width

    if (x > 0) push(pixel - 1)
    if (x < width - 1) push(pixel + 1)
    if (y > 0) push(pixel - width)
    if (y < height - 1) push(pixel + width)
  }

  const span = LIGHT_CEILING - LIGHT_FLOOR
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    if (!outside[pixel]) continue

    const offset = pixel * channels
    const light = Math.min(data[offset], data[offset + 1], data[offset + 2])

    // Ramp: at the ceiling fully transparent, at the floor still fully opaque.
    const alpha = Math.max(0, Math.min(255, Math.round(((LIGHT_CEILING - light) / span) * 255)))
    data[offset + 3] = alpha

    if (alpha === 0) continue

    /*
     * Undo the blend against white. Guarded by the `alpha === 0` skip above rather than by a
     * minimum, because a fully transparent pixel's colour is never sampled and dividing by zero
     * here would write NaN into the buffer — which sharp stores as 0, turning the fringe black.
     */
    const scale = alpha / 255
    for (let channel = 0; channel < 3; channel += 1) {
      const value = (data[offset + channel] - KEYED_AGAINST * (1 - scale)) / scale
      data[offset + channel] = Math.max(0, Math.min(255, Math.round(value)))
    }
  }

  return trimToFigure(sharp(data, { raw: { width, height, channels } })).png().toBuffer()
}

/*
 * TRIM THE EMPTY CANVAS AROUND THE FIGURE, which is a correctness fix and not an optimisation.
 *
 * The five illustrations arrive on canvases with wildly different amounts of empty space around the
 * person. MEASURED, as the opaque bounding box against the full canvas:
 *
 *     traveler_japan.png        1126x1397   figure fills 1122x1371   — essentially no margin
 *     traveler_india.png        1117x1408   figure fills 1047x1356
 *     switerland_traveler.png   1363x1154   figure fills 1114x1123
 *     italy_traveler.png        1536x1024   figure fills  824x976    — 46% of the width is empty
 *     us_traveler.png           1536x1024   figure fills 1157x1008
 *
 * TravellerFigure caps the rendered HEIGHT, which is the only way to give five different aspect
 * ratios a consistent visual size. Two consequences follow from the margins, and both are visible:
 *
 *   1. THE FIGURE IS NOT THE SIZE IT WAS CAPPED AT. Japan's traveller renders 157px tall at a 160px
 *      cap; Italy's renders 152px but inside a box 240px wide, so the person is noticeably adrift in
 *      it rather than smaller. The cap stops describing the figure and starts describing the canvas.
 *   2. THE FIGURE MOVES BETWEEN COUNTRIES. Right-aligned (`justify-end`, which both call sites use),
 *      Japan's traveller sits flush against the edge and Italy's sits about 60px short of it — so
 *      flying from Japan to Italy makes the traveller jump sideways for no reason the visitor can
 *      see. Alignment is a property of the layout; it cannot be honoured while the images disagree
 *      about where their content is.
 *
 * Trimming here rather than in CSS because there is no CSS for it: `object-fit` cannot crop to an
 * alpha bounding box. And here rather than by hand in `images/`, for the reason the whole keying step
 * exists — `images/` stays the untouched record of what was supplied, and this re-runs if the artwork
 * is ever replaced.
 *
 * `threshold: 0` trims only fully transparent pixels, so the anti-aliased edge the keying step
 * carefully preserved is kept. sharp's `trim` uses the top-left pixel as the reference when trimming
 * a background colour, but with an alpha channel present it trims transparency, which is what is
 * wanted: it is the same operation for all five regardless of what colour they were keyed from.
 */
function trimToFigure(image) {
  return image.trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 0 })
}

/*
 * ============================================================================================
 * WHY THERE IS NO PASSPORT LETTERING STAGE HERE ANY MORE.
 *
 * Two of the five portraits arrived with misspelt lettering on the passport cover the traveller is
 * holding up: Italy read "PASSAPDRIO / REPURSTICA TIALLANA", the United States "UNITEO STATES OF
 * AMERICA". This file used to erase those lines and set the correct words again, in Times New Roman
 * rotated to the measured baseline angle, from a table of polygons and centres keyed by filename.
 *
 * THAT WHOLE STAGE IS GONE, and the reason is a decision about authorship rather than a technical
 * one. Setting the correct type made the project the author of a claim about what a real passport
 * cover says. The lettering is now REMOVED at source instead, by scripts/retouchPassports.mjs
 * (npm run retouch): the misspelt words are painted out and the globe, shield, chip and cover are
 * left as drawn. Nothing is written back. The covers read as unlettered artwork, which is honest
 * about being an illustration.
 *
 * WHAT THIS COST WHEN BOTH EXISTED AT ONCE, recorded because it is the failure mode of splitting one
 * job across two scripts. For one build the source retouch and this stage were both live. The retouch
 * had already removed "UNITEO STATES OF AMERICA", so this stage's polygon erased blank navy and
 * composited its replacement into empty space: the published American cover showed a single floating
 * "D" under the shield. Nothing threw. The canvas assertion this stage carried was satisfied, because
 * the coordinates were right; what had changed was the pixels underneath them.
 *
 * SO THE RULE: one script owns the lettering. If the artwork is ever resupplied with correct spelling,
 * delete the entry from TARGETS in retouchPassports.mjs. Do not reintroduce a redraw step here.
 * The deleted implementation is in git if it is ever wanted: it interpolated across each masked
 * polygon along a per-file axis and composited SVG text through sharp.
 * ============================================================================================
 */

/*
 * True when `target` exists and is at least as new as `source` — the standard "is this build
 * output up to date?" test, and the reason a second `npm run data` does not re-encode anything.
 *
 * `>=` rather than `>` because a fast filesystem can stamp both files within the same
 * millisecond on the first run, which with `>` would re-encode every image forever.
 */
function isFresh(target, source) {
  if (!existsSync(target)) return false
  return statSync(target).mtimeMs >= statSync(source).mtimeMs
}

// ---------------------------------------------------------------------------------------
// Transformation
// ---------------------------------------------------------------------------------------

/*
 * WHICH SHEET DID A GIVEN ROW ARRAY COME FROM.
 *
 * `sameCountry` reports the sheet name when it tolerates a misspelling, so the join helpers below
 * have to know it. Passing it in at all eight call sites would mean writing `'country_gallery'`
 * next to `gallery` by hand and trusting the two to stay in agreement — a second source of truth
 * for something already stated once.
 *
 * WHAT A WeakMap IS (new concept). A Map whose KEYS are objects, and which does not itself keep
 * those objects alive: when the array is garbage-collected the entry disappears with it. Used
 * here for the ordinary reason — it lets us attach a label to an array we did not define — rather
 * than for the memory behaviour, which is irrelevant in a script this short. The alternative,
 * setting a property on the array, would make the label show up in anything that enumerates it.
 */
const SHEET_NAMES = new WeakMap()

function rowsFor(sheet, country) {
  // The `language` sheet capitalises its headers; toObjects already lowercased them, so one
  // key works for every sheet. This is the payoff for normalising at the reader.
  const sheetName = SHEET_NAMES.get(sheet) ?? 'unknown sheet'
  return sheet.filter((row) => sameCountry(row.country, country, sheetName))
}

// The singular case: sheets with exactly one row per country (`hero_story`, `storyteling`).
function rowFor(sheet, country) {
  const sheetName = SHEET_NAMES.get(sheet) ?? 'unknown sheet'
  return sheet.find((row) => sameCountry(row.country, country, sheetName))
}

function build() {
  if (!existsSync(WORKBOOK)) {
    throw new Error(`Workbook not found: ${WORKBOOK}`)
  }

  const sheets = readXlsx(WORKBOOK)

  /*
   * Reads a sheet into row objects and LABELS the resulting array with the sheet's name, so
   * `rowsFor`/`rowFor` can name the sheet when they report a tolerated misspelling. Registering
   * it here means the name is written once, where it is already being written.
   */
  const table = (name) => {
    const rows = toObjects(sheets[name] ?? [])
    SHEET_NAMES.set(rows, name)
    return rows
  }

  const master = table('country_master')
  const timeUsage = table('time_usage')
  const food = table('food')
  const transport = table('transport')
  const language = table('language')
  const cultureExperience = table('culture_experience')
  const gallery = table('country_gallery')
  const storytelling = table('storyteling') // sic — the sheet name is misspelled in the source
  const heroStory = table('hero_story')
  const observations = table('traveler_observation')

  const assetIndex = buildAssetIndex()
  const copyList = new Set()
  const sumChecks = []
  const unresolved = []
  const overrides = []

  const countries = ITINERARY.map(({ name, slug }, position) => {
    const row = master.find((r) => r.country_name === name)
    if (!row) throw new Error(`country_master has no row for ${name}`)

    const declaredOrder = toNumber(row.arrival_order, {
      field: `${name}.arrival_order`,
      precision: 0,
    })
    // The two-source check described at ITINERARY. If the spreadsheet is reordered, this
    // fails loudly instead of the site quietly disagreeing with its own data.
    if (declaredOrder !== position + 1) {
      throw new Error(
        `${name}: workbook arrival_order is ${declaredOrder} but the itinerary in ` +
          `convertData.mjs places it at ${position + 1}. Reconcile the two deliberately — ` +
          `the order is the information architecture, not a detail.`,
      )
    }

    /*
     * TIME USAGE — hours per day, for ages 15–64.
     *
     * The age group is carried through rather than dropped. A chart labelled "how a day is
     * spent" that silently means "how a working-age adult's day is spent" is overclaiming;
     * Principle 17 says be honest about what we don't know, and this is a case where we know
     * precisely, so the label should say so.
     */
    const day = rowsFor(timeUsage, name).map((r) => ({
      activity: r.activity,
      hours: toNumber(r.hours, { field: `${name}.hours`, precision: 1 }),
    }))
    // 24 hours, ±0.5. A day is a day; the tolerance is for per-activity rounding only.
    sumChecks.push(checkSum(day.map((d) => d.hours), 24, 0.5, `${name} time_usage hours`))

    const modes = rowsFor(transport, name)
      // sort_order is the source's own intended presentation order. Sorting by percentage
      // would be a ranking (§7.4) — and within a single country's modal split it would also
      // make the four countries' charts inconsistent with each other for no reason.
      .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
      .map((r) => ({
        mode: r.mode,
        percentage: toNumber(r.percentage, { field: `${name}.percentage`, precision: 1 }),
      }))
    sumChecks.push(
      checkSum(modes.map((m) => m.percentage), 100, 1.5, `${name} transport share`),
    )

    /*
     * LANGUAGE — the one genuinely awkward sheet.
     *
     * `display_value` mixes formats: Japanese is the number 0.99, English is the STRING
     * "15–30%", Chinese is "0.6–1%". Two of those are ranges, which is the source being
     * honest — the share of English speakers in Japan genuinely is not a single agreed figure.
     *
     * So we keep the display string exactly as written and carry `sortValue` separately for
     * any chart that needs a number. Collapsing "15–30%" to 22.5% for display would invent a
     * precision the source explicitly declined to claim; that is the Principle 17 case
     * almost exactly. A range printed as a range is more informative than its midpoint.
     */
    const languages = rowsFor(language, name)
      .sort((a, b) => Number(a.display_order) - Number(b.display_order))
      .map((r) => ({
        language: r.language,
        type: r.type,
        // A bare decimal like "0.99" means 99%; a string like "15–30%" is already formatted.
        display: /^0?\.\d+$|^1$/.test(r.display_value)
          ? `${Number(r.display_value) * 100}%`
          : r.display_value,
        approximate: /[–~]/.test(r.display_value),
        share: toNumber(r.sort_value, { field: `${name}.sort_value`, precision: 1 }),
      }))

    const observationsFor = rowsFor(observations, name).map((r) => ({
      section: r.section,
      title: r.card_title,
      /*
       * The traveller's own words, kept verbatim except for typographic apostrophes.
       *
       * §3.4 — the site's narration never says "I", but the traveller may be QUOTED. These
       * strings are first person ("I quickly realized…"), so every component that renders one
       * must present it as a quotation. That is a rendering contract, not a data change, and
       * it is why the field is named `quote` rather than `text`.
       *
       * Straight-to-curly apostrophes are typesetting, not editing: the glyph changes, the
       * words do not. Editing the traveller's wording would be putting words in their mouth.
       */
      quote: typographic(r.observation),
    }))

    const hero = rowFor(heroStory, name)
    const story = rowFor(storytelling, name)

    // The brochure line, with the editorial override applied if this country has one.
    // See WELCOME_OVERRIDES for what that means and why it is asserted rather than assumed.
    const welcome = applyWelcomeOverride(name, hero?.intro_story ?? '')
    if (welcome.overridden) overrides.push({ country: name, why: WELCOME_OVERRIDES[name].why })

    return {
      slug,
      name,
      arrivalOrder: declaredOrder,
      capital: row.capital,
      continent: row.continent,
      currency: row.currency,
      timeZone: row.time_zone,
      coordinates: {
        // Four decimal places ≈ 11 m, far finer than a country centroid deserves, but the
        // source's 14 digits are float noise rather than survey precision.
        latitude: toNumber(row.latitude, { field: `${name}.latitude`, precision: 4 }),
        longitude: toNumber(row.longitude, { field: `${name}.longitude`, precision: 4 }),
      },
      facts: {
        population: toNumber(row.population, { field: `${name}.population`, precision: 0 }),
        // Whole years. The source gives 85 for Japan; a life expectancy to two decimals
        // implies a precision that varies by more than that between publications.
        lifeExpectancy: toNumber(row.avg_life_expectancy_at_birth, {
          field: `${name}.life_expectancy`,
          precision: 1,
        }),
        happinessScore: toNumber(row.happiness_score, {
          field: `${name}.happiness_score`,
          precision: 2,
        }),
        touristArrivalsMillions: toNumber(row.tourist_arrivals_in_million, {
          field: `${name}.tourist_arrivals`,
          precision: 1,
        }),
        workHoursPerWeek: toNumber(row.avg_work_hours_per_week, {
          field: `${name}.work_hours`,
          precision: 1,
        }),
        commuteMinutesOneWay: toNumber(row.avg_one_way_commute_minutes, {
          field: `${name}.commute_minutes`,
          precision: 0,
        }),
      },
      welcome: {
        title: hero?.welcome_title ?? null,
        intro: typographic(welcome.text),
      },
      /*
       * `didYouKnow` and `travellerNote` come from the same sheet and are different in kind:
       * the first is a fact about the country, the second is the traveller speaking. The
       * traveller note is the single most important string in the dataset for this project —
       * "I expected futuristic technology, but what stayed with me most was the culture of
       * respect and quietness" IS expectation-versus-discovery, which PRODUCT_VISION names as
       * the central narrative. It is quoted, never paraphrased.
       */
      didYouKnow: typographic(story?.did_you_know ?? ''),
      travellerNote: typographic(story?.traveler_note ?? ''),
      day: { ageGroup: rowsFor(timeUsage, name)[0]?.age_group ?? null, activities: day },
      food: rowsFor(food, name).map((r) => ({
        category: r.category,
        perCapita: toNumber(r.consumption_per_capita, {
          field: `${name}.consumption`,
          precision: 1,
        }),
        unit: r.unit,
      })),
      transport: modes,
      languages,
      observations: observationsFor,
      experiences: rowsFor(cultureExperience, name)
        .sort((a, b) => Number(a.display_order) - Number(b.display_order))
        .map((r) => ({
          experience: r.experience,
          title: r.short_title,
          description: typographic(r.description),
          image: resolveAsset(r.image, assetIndex, copyList, unresolved, `${slug}.experience`),
        })),
      images: {
        /*
         * THE COVER PHOTOGRAPH, and note it does NOT come from `row.hero_image`.
         *
         * That column exists and is empty for all five countries, so reading it produced null and the
         * covers silently fell back to `gallery[0]` — a 736px portrait photograph upscaled about 2x
         * across the widest element on the page. That fallback is what the visitor saw as blur. The
         * workbook cell is still read, below, so that if it is ever filled in the reference is
         * resolved and reported like any other; it just no longer decides what the cover is.
         *
         * `cover` is the landscape photograph named in COVER_ASSETS. Kept as its own field rather
         * than assigned to `hero` so that "what the workbook says" and "what the site shows" stay
         * separately visible — collapsing them would hide the fact that the column is empty, which
         * is a real gap someone may want to fill.
         */
        cover: resolveCoverAsset(COVER_ASSETS[slug].file, assetIndex, copyList, `${slug}.cover`),
        hero: resolveAsset(row.hero_image, assetIndex, copyList, unresolved, `${slug}.hero`),

        /*
         * `flag` NOW COMES FROM FLAG_ASSETS, not from `row.flag_image`.
         *
         * Same situation as the cover, and resolved the same way: the column exists, all five cells
         * are empty, so reading it produced null for every country and five usable photographs sat
         * in `images/` unpublished.
         *
         * WHY THE WORKBOOK CELL IS NO LONGER READ AT ALL, unlike `hero_image` on the line above.
         * The first attempt kept it as a second field (`flagFromWorkbook`) on the theory that a cell
         * someone later fills in should still be resolved and reported. That theory is sound and the
         * field was still wrong, because `resolveAsset` returns null for an empty cell WITHOUT
         * recording anything — so the field could only ever be null today, and the per-country report
         * line gained a permanent `[no flagFromWorkbook]` on all five countries.
         *
         * That cost is not cosmetic. The `[no ...]` list is how a real gap becomes visible, and a
         * always-null entry in it is noise that teaches the reader to skim the list — which is the
         * one thing that list cannot afford. `hero` is kept because it is the field the cover
         * genuinely shadows and one such marker makes the point; a second makes it wallpaper.
         */
        flag: resolveFlagAsset(FLAG_ASSETS[slug], assetIndex, copyList, `${slug}.flag`),

        /*
         * The photograph of this country's did-you-know fact, or null where none depicts it. See the
         * FACT_ASSETS note for why the United States is null and why that is better than a
         * substitution.
         */
        fact: resolveFactAsset(FACT_ASSETS[slug], assetIndex, copyList, `${slug}.fact`),
        stamp: resolveAsset(
          row.passport_stamp_image,
          assetIndex,
          copyList,
          unresolved,
          `${slug}.stamp`,
        ),
        gallery: rowsFor(gallery, name)
          .map((r) => ({
            category: r.category,
            src: resolveAsset(r.image, assetIndex, copyList, unresolved, `${slug}.gallery`),
          }))
          .filter((g) => g.src),

        /*
         * THE TRAVELLER THEMSELVES, and the paper their note is written on.
         *
         * `portrait` is the illustrated companion holding this country's passport. `notepaper` is
         * the sheet of sepia-line-art stationery the note is set on. Both are named in
         * TRAVELLER_ASSETS rather than in the workbook, for the reason given there.
         *
         * These sit in `images` beside the photographs because that is what they are — files the
         * site renders — and putting them anywhere else would mean a component had two places to
         * look for a picture. `portrait` is deliberately NOT in `gallery`: the gallery is
         * photographs of a place and feeds the drifting backdrop, and a cut-out illustration of a
         * person cross-fading behind a headline would be a person used as wallpaper.
         */
        portrait: resolveTravellerAsset(
          TRAVELLER_ASSETS[slug].portrait,
          assetIndex,
          copyList,
          `${slug}.portrait`,
        ),
        notepaper: resolveTravellerAsset(
          TRAVELLER_ASSETS[slug].notepaper,
          assetIndex,
          copyList,
          `${slug}.notepaper`,
        ),
      },
    }
  })

  return { countries, copyList, sumChecks, unresolved, overrides }
}

/*
 * Straight quotes to typographic ones, and em dashes out.
 *
 * APOSTROPHES ONLY for the quote rule: the dataset has no double quotes, and guessing
 * open-versus-close for those without parsing the sentence goes wrong on possessives. `Japan's` and
 * `weren't` are both mid-word, so a single rule covers the data.
 *
 * WHY EM DASHES ARE REMOVED RATHER THAN LEFT AS WRITTEN. Four sentences in the workbook use an em dash
 * as their main joint ("Respect and discipline weren't just traditions—they were part of everyday
 * life"). Nothing is wrong with the punctuation, but the mark has become a tell: it reads as
 * machine-written to a lot of readers now, and this site's whole argument is that a person made it. So
 * it is normalised everywhere, in the site's own copy by hand and in the workbook's copy here.
 *
 * TWO SHAPES, AND A SINGLE RULE GETS ONE OF THEM WRONG. This was written as a blanket dash-to-colon
 * replacement, which is right for three of the four and produces nonsense on the fourth:
 *
 *   ONE DASH is a joint: a claim, then the elaboration that earns it. "Respect and discipline weren't
 *      just traditions—they were part of everyday life." A colon keeps that relationship exactly; a
 *      comma would turn it into a splice.
 *   TWO DASHES are a parenthesis: "three active volcanoes—Etna, Stromboli, and Vesuvius—all located in
 *      its southern region." Replacing both with colons gives "volcanoes: Etna, Stromboli, and
 *      Vesuvius: all located", which is two colons in one sentence and reads as broken. Commas do not
 *      work either, because the interruption is itself a comma list. Brackets are the one substitution
 *      that survives a list inside the aside.
 *
 * So the count decides, which is checkable rather than clever: an even number of dashes in one string is
 * treated as parenthetical, an odd number as a joint. With four sentences in the corpus this is not a
 * general-purpose typographic engine and does not pretend to be one; if the workbook ever gains a
 * sentence with three dashes, this will get it wrong, and the tell will be a stray bracket in the
 * published text.
 *
 * THIS EDITS THE PUBLISHED TEXT, WHICH THE PIPELINE OTHERWISE REFUSES TO DO. See the editorial-override
 * machinery for the standard this has to meet. It clears it on the narrow ground that it changes
 * punctuation and not a single word: no claim, figure, or observation is altered, so the traveller's
 * sentence still says exactly what they wrote. Anything that changed wording would have to go through
 * the override table instead, where it is listed in the build output for review.
 */
function typographic(text) {
  const quoted = text.replace(/'/g, '’').trim()

  const dashes = (quoted.match(/—/g) ?? []).length
  if (dashes === 0) return quoted

  if (dashes % 2 === 0) {
    /*
     * Parenthetical: each pair becomes brackets, so a comma list inside the aside still reads.
     *
     * THE COMMA AFTER THE CLOSING BRACKET IS NOT OPTIONAL, and dropping it was the first version's bug.
     * A closing em dash does two jobs at once: it ends the aside AND supplies the pause the sentence
     * needs to resume. A bracket only does the first, so `volcanoes (Etna, Stromboli, and Vesuvius) all
     * located in its southern region` runs the aside straight into the predicate. It is only added when
     * what follows is a word, since a bracket already sitting before a full stop needs nothing.
     */
    return quoted
      .replace(/\s*—\s*(.+?)\s*—\s*/g, (_, aside) => ` (${aside}), `)
      .replace(/,\s*([.,;:!?])/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()
  }
  return quoted.replace(/\s*—\s*/g, ': ')
}

// ---------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------

const { countries, copyList, sumChecks, unresolved, overrides } = build()

assertItineraryIsSound(countries, OUTPUT)
assertNoRankings(countries, OUTPUT)

const payload = {
  /*
   * A provenance block. Not decoration: when someone opens this file in six months and asks
   * "where did 36.7 come from", the answer should be in the file rather than in a memory.
   * `generatedBy` names the script so the answer to "can I edit this?" is unambiguous — no.
   */
  generatedBy: 'scripts/convertData.mjs',
  source: WORKBOOK,
  countryCount: countries.length,
  countries,
}

const serialised = `${JSON.stringify(payload, null, 2)}\n`

// Rule 1 runs on the finished string — see its comment for why the artefact, not the process.
assertNoInternalReferences(serialised, OUTPUT)

// Every asset referenced must exist. Checked against the source directory, before copying.
assertAssetsExist(
  [...copyList].map((f) => join(SOURCE_IMAGES, f)),
  existsSync,
  OUTPUT,
)

mkdirSync(PUBLIC_IMAGES, { recursive: true })

/*
 * REMOVE FILES THIS RUN DID NOT PRODUCE, BEFORE COPYING.
 *
 * WHY THIS IS NECESSARY AND NOT TIDINESS. public/images/ is a generated directory, but until
 * now it was only ever added to. So it accumulated: any image that a previous run copied stayed
 * there forever, even after the pipeline stopped referencing it. Vite copies the whole of
 * public/ into the build verbatim, which means a file the data no longer mentions still ships.
 *
 * That is exactly how the watermarked passport stamps were about to reach production. They were
 * excluded from the data (see the EXCLUDED note above) and `images.stamp` correctly became null,
 * but the five *_pp.jpeg files sat in public/images/ from the run before — so `dist/images/`
 * still contained them, still publicly fetchable, watermarks and all. An exclusion that leaves
 * the file on the server is not an exclusion.
 *
 * The fix makes the directory a true projection of `copyList` rather than a growing pile: it is
 * safe to delete from because nothing else writes here and every file is reproducible from
 * images/ by re-running this script. That is also why it is gitignored.
 *
 * Only files are removed — a stray subdirectory is left alone rather than recursed into, since
 * this script never creates one and guessing about something it did not create is how a delete
 * step becomes dangerous.
 */
/*
 * NOTE THE `.avif` SIBLING IN THE EXPECTED SET. Each copied photograph produces two files —
 * the original and its AVIF companion — so both are legitimate output. Building this set from
 * the JPEG names alone would make every run delete the AVIFs the previous run had just
 * written, then re-encode them: correct output, eight wasted seconds, and a directory that
 * never settles. The rule is that `expected` must describe everything this script produces,
 * not everything it copies.
 */
const expected = new Set()
for (const file of copyList) {
  const name = normaliseFilename(file)
  expected.add(name)
  expected.add(avifName(name))
}

const removed = []
for (const entry of readdirSync(PUBLIC_IMAGES, { withFileTypes: true })) {
  if (!entry.isFile() || expected.has(entry.name)) continue
  rmSync(join(PUBLIC_IMAGES, entry.name))
  removed.push(entry.name)
}

/*
 * COPY THE ORIGINAL, THEN WRITE AN AVIF BESIDE IT.
 *
 * The JPEG is still copied, and that is deliberate: it is the `<img>` inside `<picture>`, the
 * fallback that makes AVIF safe to serve. Shipping only AVIF would save another megabyte and
 * show nothing at all to a browser that cannot decode it.
 *
 * Encoding runs in parallel across all images (`Promise.all`) because libvips releases the
 * event loop while it works — 17 images take ~8s wall-clock instead of ~60s of summed CPU.
 *
 * SKIPPED IF THE OUTPUT IS ALREADY NEWER THAN THE SOURCE. Without this, every `npm run data`
 * during ordinary development pays the full encode for images that have not changed. With it,
 * a re-run is instant and a changed or added photograph is still re-encoded, because its
 * source mtime moves ahead of the output's.
 */
/*
 * The five portraits, by their published filename. Used below to decide which files go through the
 * keying step. Built from the same table the data reads so the two cannot disagree — a hard-coded
 * second list of filenames here is precisely how the "which files are portraits?" question would end
 * up with two answers.
 */
const PORTRAITS = new Set(
  Object.values(TRAVELLER_ASSETS).map((assets) => normaliseFilename(assets.portrait)),
)

/*
 * The five cover photographs, keyed by published filename, each carrying its measured crop box (or
 * null). Built from COVER_ASSETS for the same reason PORTRAITS is built from TRAVELLER_ASSETS: one
 * table, one answer to "which file is this country's cover, and how much of it is photograph".
 */
const COVERS = new Map(
  Object.values(COVER_ASSETS).map((cover) => [normaliseFilename(cover.file), cover.crop]),
)

const encoded = []
const keyed = []
const cropped = []
const softCovers = []
const encodeTasks = []
for (const file of copyList) {
  const name = normaliseFilename(file)
  const source = join(SOURCE_IMAGES, file)
  const target = join(PUBLIC_IMAGES, name)
  const avifTarget = join(PUBLIC_IMAGES, avifName(name))

  /*
   * THE PORTRAITS TAKE A DIFFERENT PATH THROUGH THIS LOOP, in two respects.
   *
   * They are KEYED rather than copied — three of the five need their white background removing, and
   * which three is decided by looking at the pixels rather than listed here (see cutOutPortrait).
   *
   * And their AVIF is encoded from the KEYED buffer, not from the file on disk. Encoding the source
   * would produce an AVIF with the white box still in it, and since `<picture>` prefers the AVIF,
   * every browser that supports it — which is all of them — would show the boxed version while the
   * cut-out PNG sat unused as a fallback nobody reaches. The bug would be invisible to anyone
   * testing in a current browser and would look like the keying step had silently failed.
   */
  if (PORTRAITS.has(name)) {
    if (isFresh(target, source) && isFresh(avifTarget, source)) continue

    /*
     * TWO STEPS NOW, AND NEITHER OF THEM TOUCHES THE PASSPORT LETTERING.
     *
     * 1. Key the background, which only affects the three that arrived on a white field.
     * 2. Trim to the figure, the only step that changes the canvas size.
     *
     * There used to be a third step that erased the misspelt words on the passport cover and set them
     * again correctly, and the hardest bug in this file came from it: its coordinates were measured on
     * the TRIMMED canvas but it ran FIRST, on the untrimmed source, so Italy's text bands were erased
     * 311px to the left of the passport, in the middle of the traveller's jacket, with the replacement
     * words set there. Nothing threw. The lesson survives the stage that taught it: any edit expressed
     * as absolute coordinates must state which canvas it was measured on, and the canvas a person can
     * open is the only one that stays true.
     *
     * The lettering is now removed at source by scripts/retouchPassports.mjs, upstream of this pipeline
     * entirely, so nothing here depends on canvas geometry. See "WHY THERE IS NO PASSPORT LETTERING
     * STAGE HERE ANY MORE" above for why removal rather than correction.
     */
    const cut = await cutOutPortrait(source)
    if (cut) keyed.push(name)

    /*
     * A portrait is NEVER copied untouched. The two supplied cut-outs are the ones with the largest
     * empty margins (Italy's figure occupies 54% of its canvas width), so skipping them would leave
     * exactly the two images that most need trimming untrimmed. See the note on `trimToFigure` for
     * what the margins cost.
     */
    const trimmed = cut ?? (await trimToFigure(sharp(source).ensureAlpha()).png().toBuffer())

    writeFileSync(target, trimmed)

    encodeTasks.push(
      sharp(trimmed)
        .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
        .toFile(avifTarget)
        .then(() => {
          encoded.push(name)
        }),
    )
    continue
  }

  /*
   * THE COVERS TAKE THE SAME SHAPE OF DETOUR AS THE PORTRAITS, and for the same two reasons.
   *
   * They are CROPPED rather than copied, because two of the five were exported onto white card with
   * rounded corners and the white is not part of the photograph. Cutting it at build time means the
   * published file cannot show it at any viewport — a CSS crop would only hide it at the aspect
   * ratios someone happened to check. The crop box is measured, not chosen; see COVER_ASSETS.
   *
   * And the AVIF is encoded from the CROPPED buffer, not from the source, which is the same trap the
   * portraits documented: `<picture>` prefers the AVIF, so encoding the source would leave every
   * modern browser showing the white-framed version while the cropped file sat unused. That bug is
   * invisible to anyone testing in a current browser.
   *
   * The width check is here rather than in `build()` because it is a fact about the published pixels.
   * It reports; it does not throw. A soft cover is a request for better artwork, not a broken build,
   * and failing here would make the site unbuildable over a photograph that is merely improvable.
   */
  if (COVERS.has(name)) {
    const crop = COVERS.get(name)

    if (!isFresh(target, source) || !isFresh(avifTarget, source)) {
      const pipeline = sharp(source)
      const published = await (crop ? pipeline.extract(crop) : pipeline).toBuffer()
      writeFileSync(target, published)
      if (crop) cropped.push(name)

      encodeTasks.push(
        /*
         * `COVER_AVIF_QUALITY`, not `AVIF_QUALITY` — a cover is the one image that is always upscaled,
         * so it is the one image where compression artefacts are magnified rather than hidden. The
         * measured detail-retention table is in the note on that constant.
         */
        sharp(published)
          .avif({ quality: COVER_AVIF_QUALITY, effort: AVIF_EFFORT })
          .toFile(avifTarget)
          .then(() => {
            encoded.push(name)
          }),
      )
    }

    const { width } = await sharp(target).metadata()
    if (width < COVER_MIN_WIDTH) softCovers.push({ name, width })
    continue
  }

  copyFileSync(source, target)

  if (isFresh(avifTarget, source)) continue

  encodeTasks.push(
    sharp(source)
      .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
      .toFile(avifTarget)
      .then(() => {
        encoded.push(name)
      }),
  )
}

/*
 * A FAILED ENCODE FAILS THE BUILD rather than quietly leaving the site on JPEGs. `<picture>`
 * would degrade gracefully, which is precisely the danger: the saving would silently disappear
 * and nothing would say so. If sharp cannot read a file, that is a fact about the asset worth
 * stopping for.
 */
await Promise.all(encodeTasks)

writeFileSync(OUTPUT, serialised)

// ---------------------------------------------------------------------------------------
// Report. A build script that succeeds silently teaches you nothing; this one prints what it
// decided, so a wrong decision is visible without reading the JSON.
// ---------------------------------------------------------------------------------------

console.log(`\n  ${OUTPUT}`)
console.log(`  ${countries.length} countries · ${copyList.size} images copied to ${PUBLIC_IMAGES}`)

/*
 * A delete that happens silently is worse than no delete at all — it is the one step here that
 * removes something, so it is the one step that must say so. Naming the files means a run that
 * removes something unexpected is caught by reading the build output rather than by noticing a
 * missing image on the site later.
 */
if (removed.length > 0) {
  console.log(
    `  ${removed.length} stale file${removed.length === 1 ? '' : 's'} removed from ` +
      `${PUBLIC_IMAGES} (no longer referenced): ${removed.join(', ')}`,
  )
}

/*
 * WHICH PORTRAITS NEEDED KEYING, named every run.
 *
 * Reported rather than silent because this step decides per-file by inspecting the corners, so the
 * count is a fact about the artwork that nothing else states. If someone replaces a portrait with a
 * properly cut-out version, this line drops it and that is the confirmation the new file was
 * recognised. If it ever prints five, the two supplied cut-outs have been overwritten with boxed
 * ones. A step that quietly does nothing is indistinguishable from a step that is broken.
 */
if (keyed.length > 0) {
  console.log(
    `  ${keyed.length} of ${PORTRAITS.size} portraits keyed (white background removed): ` +
      `${keyed.join(', ')}`,
  )
}

/* Which covers had white export card cut off them. Same rationale as the keying line above. */
if (cropped.length > 0) {
  console.log(
    `  ${cropped.length} of ${COVERS.size} covers cropped to the photograph ` +
      `(white export border removed): ${cropped.join(', ')}`,
  )
}

/*
 * COVERS TOO SMALL FOR THE SPACE THEY FILL — reported every run, not just when they change.
 *
 * This one is unlike the lines above: it reports a state rather than an action, so it prints on
 * incremental runs too. That is the point. A cover is the largest element on its page, and a source
 * that cannot fill it is the defect the visitor actually reported ("the main title images are very
 * blur"). The only real fix is a bigger photograph, which is a task for a person, so the build's job
 * is to keep saying so until someone supplies one — a warning that appears once and then goes quiet
 * on every later run is a warning nobody acts on.
 *
 * It does not throw. The site is entirely usable with a soft cover, and a build that refuses to
 * complete over an improvable photograph would be worse than the photograph.
 */
if (softCovers.length > 0) {
  console.log(
    `  ${softCovers.length} of ${COVERS.size} covers are narrower than ${COVER_MIN_WIDTH}px and ` +
      `will be upscaled on a wide screen:`,
  )
  for (const { name, width } of softCovers) {
    console.log(`    - ${name} is ${width}px (${(COVER_MIN_WIDTH / width).toFixed(1)}x upscale)`)
  }
  console.log(
    `    Not a build failure — the page works, it is just soft. The fix is a wider source\n` +
      `    photograph in images/; nothing in the pipeline can add detail that is not there.`,
  )
}

/*
 * The encode's actual saving, in bytes, every run. Stated rather than assumed: this is the
 * largest single optimisation on the site, so a run where it silently stopped working (a
 * quality setting edited to something useless, an encoder that fell back) should be visible in
 * the build output rather than discovered later by someone measuring the deployed site.
 *
 * "0 re-encoded" on an unchanged tree is the correct and expected report — see `isFresh`.
 */
const sizes = [...copyList].map((file) => {
  const name = normaliseFilename(file)
  return {
    jpeg: statSync(join(PUBLIC_IMAGES, name)).size,
    avif: statSync(join(PUBLIC_IMAGES, avifName(name))).size,
  }
})
const totalJpeg = sizes.reduce((sum, s) => sum + s.jpeg, 0)
const totalAvif = sizes.reduce((sum, s) => sum + s.avif, 0)
const kb = (bytes) => `${Math.round(bytes / 1024)} kB`

console.log(
  `  ${encoded.length} re-encoded to AVIF this run · ${sizes.length} pairs on disk: ` +
    `${kb(totalJpeg)} JPEG → ${kb(totalAvif)} AVIF ` +
    `(${(100 - (100 * totalAvif) / totalJpeg).toFixed(1)}% smaller for browsers that take it)`,
)
console.log('')

for (const country of countries) {
  const missing = Object.entries(country.images)
    .filter(([, v]) => v === null)
    .map(([k]) => k)
  console.log(
    `  ${String(country.arrivalOrder)}. ${country.name.padEnd(14)} ` +
      `${country.observations.length} notes · ${country.experiences.length} experiences · ` +
      `${country.images.gallery.length} gallery` +
      (missing.length ? `  [no ${missing.join(', ')}]` : ''),
  )
}

/*
 * SPELLING VARIANTS ARE ANNOUNCED, every run — see COUNTRY_SPELLINGS.
 *
 * The tolerance exists so five photographs are not lost to a missing "s". The report exists so the
 * cell still gets fixed. A pipeline that silently absorbs a typo has not solved the typo; it has
 * made it permanent and invisible, which is the failure mode every other report in this script
 * exists to prevent.
 */
if (spellingVariants.size > 0) {
  console.log(`\n  Country names matched through a spelling variant: ${spellingVariants.size}`)
  for (const { sheetName, cell, name } of spellingVariants.values()) {
    console.log(`    - ${sheetName}: "${cell}" treated as "${name}"`)
  }
  console.log(
    `    The join would otherwise have returned no rows, silently. Fix the cell in the\n` +
      `    workbook and the entry in COUNTRY_SPELLINGS becomes dead code, which is the goal.`,
  )
}

/*
 * Sum checks REPORT rather than throw — Principle 17 again. A modal split that sums to 100.3
 * is a real fact about published statistics, and failing the build over it would push us
 * toward "fixing" the source data. What must not happen is that the drift goes unnoticed, so
 * it is printed every run and any chart drawn from a drifting set has to acknowledge it.
 */
/*
 * EDITORIAL OVERRIDES ARE ANNOUNCED, every run.
 *
 * Same reasoning as the unresolved-image report: the failure mode of a transformation is that it
 * becomes invisible. Anyone comparing the site against the workbook needs to be told, without
 * reading this script, that one sentence differs and why.
 */
if (overrides.length > 0) {
  console.log(`\n  Editorial overrides applied: ${overrides.length}`)
  for (const item of overrides) {
    console.log(`    - ${item.country}.welcome.intro — ${item.why}`)
  }
}

const drifting = sumChecks.filter((c) => !c.withinTolerance)
console.log(`\n  Sum checks: ${sumChecks.length - drifting.length}/${sumChecks.length} within tolerance`)
for (const check of drifting) {
  console.log(`    ! ${check.label}: ${check.total} (expected ${check.expected}, off by ${check.drift})`)
}

/*
 * UNRESOLVED REFERENCES — printed, grouped, and NOT fatal.
 *
 * Why not fatal: the source workbook names images for all five countries and only Japan's
 * exist. That is the true state of the project — Japan is the reference implementation and the
 * other four are not yet photographed. A build that refused would block all work on the
 * pattern until every asset was gathered, which inverts the plan.
 *
 * Why printed every run: because the alternative is a site that quietly renders four countries
 * with no imagery and no record of the fact. The standing rule against forcing equal image
 * counts per country means the gap is acceptable; it does not mean the gap should be invisible.
 */
if (unresolved.length > 0) {
  console.log(`\n  Unresolved image references: ${unresolved.length}`)
  const byContext = new Map()
  for (const item of unresolved) {
    if (!byContext.has(item.context)) byContext.set(item.context, [])
    byContext.get(item.context).push(item.reference)
  }
  for (const [context, references] of byContext) {
    console.log(`    - ${context}: ${references.join(', ')}`)
  }
  console.log(
    `    These are named in the workbook but absent from ${SOURCE_IMAGES}/. Expected while\n` +
      `    Japan is the only photographed country; add an ALIASES entry if the file exists\n` +
      `    under a different name.`,
  )
}
console.log()
