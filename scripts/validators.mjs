/*
 * validators.mjs — the rules the data must satisfy before it is allowed to ship.
 *
 * WHY VALIDATION IS A SEPARATE FILE FROM CONVERSION
 * The converter's job is to *transform*. This file's job is to *refuse*. Keeping them apart
 * means the rules can be read on their own, as a list of promises the site makes, without
 * wading through parsing code. It also means a rule can be added without touching the
 * transformation logic, which is where mistakes are expensive.
 *
 * WHY A BUILD SCRIPT VALIDATES AT ALL, RATHER THAN THE WEBSITE
 * A check that runs in the browser tells the visitor something is wrong. A check that runs
 * at build time tells *us*, before anyone sees it, and can stop the build. That is the whole
 * argument for the Excel→JSON pipeline: it moves the moment of failure from the visitor's
 * screen to the developer's terminal.
 *
 * These validators THROW rather than warn. A warning in a build log is a warning nobody
 * reads. If the data is wrong, the correct outcome is no build.
 */

/*
 * RULE 1 — NO INTERNAL URLS MAY REACH THE SHIPPED JSON.
 *
 * This is the most important rule in the file and the reason it exists. Every image URL in
 * the source workbook points at `drive.corp.amazon.com` — an internal corporate host. Those
 * strings are harmless in a spreadsheet on a work laptop and harmful in a public website:
 *
 *   1. They leak internal infrastructure hostnames and a corporate username — the paths have the
 *      shape `documents/<alias>@/…` — to anyone who views source.
 *   2. They would not load. A visitor outside the corporate network gets a broken image, or
 *      worse, a login page embedded in the page.
 *
 * So the converter rewrites every URL to a local asset path, and this rule enforces that the
 * rewrite was complete. It scans the FINAL SERIALISED JSON rather than checking field by
 * field — deliberately. A field-by-field check only catches the fields someone remembered to
 * check; scanning the output catches a leaked URL anywhere, including in a field added later
 * by someone who never read this comment.
 *
 * That is the general principle: prefer a check on the artefact over a check on the process.
 */
const FORBIDDEN_HOST_PATTERNS = [
  /drive\.corp\.amazon\.com/i,
  /\bcorp\.amazon\.com/i,
  /\ba2z\.com/i,
  /\.aws\.dev/i,
  // A bare corporate alias followed by a slash, e.g. "someone@/", which the source paths contain.
  /[a-z0-9._-]+@\//i,
]

export function assertNoInternalReferences(serialisedJson, label) {
  for (const pattern of FORBIDDEN_HOST_PATTERNS) {
    const match = pattern.exec(serialisedJson)
    if (match) {
      throw new Error(
        `${label}: an internal reference reached the output JSON — "${match[0]}".\n` +
          `        Internal hostnames and corporate aliases must never be published.\n` +
          `        Fix the URL rewrite in convertData.mjs; do not relax this rule.`,
      )
    }
  }
}

/*
 * RULE 2 — NO RANKING COLUMNS MAY REACH THE SHIPPED JSON.
 *
 * PRODUCT_VISION §7.4 forbids ranking countries, and Principle: "The website must never imply
 * that one country is objectively 'better' than another." The source workbook carries four
 * rank columns — population_rank, happiness_rank, tourist_rank, commute_rank.
 *
 * The temptation is to keep them "just in case" and simply not display them. That is exactly
 * the failure mode this rule prevents. Data that exists in the JSON will eventually be
 * rendered, because a future contributor (or a future me) will open the file, see
 * `happiness_rank: 55`, and reasonably conclude it is there to be used. The vision document
 * is a promise about the finished website; the shipped data is where that promise is either
 * kept or quietly broken.
 *
 * Deleting the column is a structural guarantee. Not displaying it is a habit.
 *
 * NOTE WHAT THIS RULE DOES NOT SAY: it does not forbid `arrival_order`. Order-as-itinerary is
 * the information architecture (§2.3). The distinction is that arrival order encodes *when
 * the visitor arrives*, which is a fact about the journey; a rank encodes *which country
 * won*, which is a judgement about the countries.
 */
/*
 * THE PATTERN MUST MATCH THE CASING THE CONVERTER ACTUALLY EMITS — a real gap, found by
 * testing the validator rather than reading it.
 *
 * The first version was `/(^|_)rank(_|$)/i`, which matches the spreadsheet's `happiness_rank`
 * and does NOT match `happinessRank`. Since the converter renames every field to camelCase on
 * the way out, the guard was watching the one spelling that could never reach the output. A
 * rank would have shipped and the check would have reported success.
 *
 * WHY THIS IS WORTH A LONG COMMENT: the rule was correct in intent, present in the build, and
 * completely ineffective. Nothing about reading it suggested a problem — it took feeding it a
 * `happinessRank` to find out. That is the argument for negative tests on a guard: a guard
 * that never fires is indistinguishable from a guard that cannot fire.
 *
 * TWO RULES, NOT ONE REGEX. The second attempt was a single case-insensitive pattern, and it
 * flagged `frank` — because "a letter, then rank" is exactly what both `happinessRank` and
 * `frank` look like once you stop caring about case. Case is the whole signal in camelCase, so
 * throwing it away with the `i` flag removed the only thing that distinguished them.
 *
 * Hence one case-SENSITIVE test per naming convention:
 *   snake_case — `rank` at the start or after an underscore: rank, happiness_rank, rank_order
 *   camelCase  — a capital `Rank` after a lowercase letter: happinessRank, touristRankValue
 *
 * `ranking` is included in both; `frank` and `franchise` match neither.
 */
const RANK_SNAKE = /(^|_)rank(ing)?($|_|[A-Z])/
const RANK_CAMEL = /[a-z0-9]Rank(ing)?($|[A-Z_])/

const isRankingKey = (key) => RANK_SNAKE.test(key) || RANK_CAMEL.test(key)

export function assertNoRankings(value, label, path = '') {
  if (Array.isArray(value)) {
    value.forEach((item, i) => assertNoRankings(item, label, `${path}[${i}]`))
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (isRankingKey(key)) {
        throw new Error(
          `${label}: ranking field "${path}.${key}" reached the output.\n` +
            `        PRODUCT_VISION §7.4 — sort order and rank both encode "which country is\n` +
            `        better", which this website does not claim. Drop the column in the\n` +
            `        converter rather than hiding it in the UI.`,
        )
      }
      assertNoRankings(child, label, `${path}.${key}`)
    }
  }
}

/*
 * RULE 3 — THE ITINERARY MUST BE COMPLETE AND UNAMBIGUOUS.
 *
 * Five countries, arrival orders exactly 1..5, no duplicates, no gaps. This is worth checking
 * because the itinerary IS the information architecture: a duplicate arrival order would make
 * the route map render two "Second" stops, and a missing one would silently drop a country
 * from the journey with no error anywhere.
 */
export function assertItineraryIsSound(countries, label) {
  const orders = countries.map((c) => c.arrivalOrder)
  const expected = countries.map((_, i) => i + 1)
  const sorted = [...orders].sort((a, b) => a - b)

  if (sorted.join(',') !== expected.join(',')) {
    throw new Error(
      `${label}: arrival orders are ${JSON.stringify(orders)}; expected exactly ` +
        `${JSON.stringify(expected)} with no gaps or duplicates.`,
    )
  }

  const slugs = new Set(countries.map((c) => c.slug))
  if (slugs.size !== countries.length) {
    throw new Error(`${label}: duplicate country slugs — ${countries.map((c) => c.slug).join(', ')}`)
  }
}

/*
 * RULE 4 — EVERY REFERENCED ASSET MUST EXIST ON DISK.
 *
 * A missing image is invisible at build time and obvious to the visitor, which is the wrong
 * way round. The source workbook already demonstrates the problem: `culture_experience.image`
 * names `japan_hanami.jpg`, and the actual file is `hanami_cherry_blossom_japan.jpeg` — a
 * different name AND a different extension. Nothing in the spreadsheet knows that.
 *
 * `existsOnDisk` is injected rather than imported so this file stays free of filesystem
 * access, which keeps it trivially testable. That is a small thing but it is the reason the
 * rules can be exercised without a real `images/` directory.
 */
export function assertAssetsExist(paths, existsOnDisk, label) {
  const missing = [...new Set(paths)].filter((p) => p && !existsOnDisk(p))
  if (missing.length > 0) {
    throw new Error(
      `${label}: ${missing.length} referenced asset(s) do not exist:\n` +
        missing.map((p) => `        - ${p}`).join('\n'),
    )
  }
}

/*
 * RULE 5 — PROPORTIONS MUST ACTUALLY BE PROPORTIONS.
 *
 * Any set of percentages we present as a whole (transport modes, hours of a day) must sum to
 * something honest. If transport modes sum to 103%, a donut chart drawn from them is a lie
 * with a smooth surface — nothing looks wrong, and the segments are simply the wrong size.
 *
 * THE TOLERANCE IS A JUDGEMENT, SO IT IS DOCUMENTED RATHER THAN BURIED:
 * ±1.5 percentage points for shares, because published national statistics are individually
 * rounded before publication and rounding five figures to one decimal can legitimately drift
 * about a point. Wider than that is not rounding; it is a different measurement.
 *
 * Principle 17 (honest about what we don't know) is why this reports rather than silently
 * normalises. Scaling the numbers to sum to 100 would make the chart draw perfectly and
 * destroy the evidence that the source disagreed with itself.
 */
export function checkSum(values, expected, tolerance, label) {
  const total = values.reduce((sum, v) => sum + v, 0)
  const drift = Math.abs(total - expected)
  return {
    label,
    total: Number(total.toFixed(2)),
    expected,
    withinTolerance: drift <= tolerance,
    drift: Number(drift.toFixed(2)),
  }
}

/*
 * RULE 6 — NUMBERS MUST BE NUMBERS, AND MUST NOT BE FLOAT NOISE.
 *
 * Excel stores 36.7 as "36.700000000000003" because binary floating point cannot represent
 * one tenth exactly. Shipping that string means a chart label reading "36.700000000000003
 * hours" — a real bug that looks like a data problem and is actually a storage artefact.
 *
 * `precision` is required, not defaulted, so every call site has to state how precise the
 * figure genuinely is. A default would let a five-decimal artefact through unexamined, which
 * is precisely the failure this function exists to prevent. Note the direction of the
 * asymmetry: rounding to fewer digits than the source claims is honest simplification;
 * printing more digits than were measured is false precision.
 */
export function toNumber(raw, { field, precision }) {
  if (raw === '' || raw === null || raw === undefined) return null
  const parsed = Number(String(raw).replace(/,/g, ''))
  if (!Number.isFinite(parsed)) {
    throw new Error(`Field "${field}" is not a number: ${JSON.stringify(raw)}`)
  }
  return Number(parsed.toFixed(precision))
}
