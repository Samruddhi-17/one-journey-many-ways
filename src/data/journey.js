import { COUNTRIES, getCountryBySlug as getRegistryEntry } from './countries'
import journeyData from './journey.json'

/*
 * journey.js — joins the two halves of a country.
 *
 * THERE ARE DELIBERATELY TWO SOURCES, AND THIS FILE IS WHERE THEY MEET
 *
 *   countries.js   hand-authored EDITORIAL data — epithet, flag, days, emotion, and the
 *                  atmosphere tokens (accent colours, pace, easing, stagger).
 *   journey.json   GENERATED MEASURED data — population, hours of a day, transport shares,
 *                  the traveller's own words, image paths. Written by the pipeline.
 *
 * WHY NOT ONE FILE: regenerating the data must never overwrite design intent. There is no
 * "pace multiplier" column in a spreadsheet, and there never will be — `pace: 0.9` for Japan
 * is a judgement about what precision feels like. Equally, nobody should hand-edit a
 * population. Keeping them apart means `npm run data` is always safe to run.
 *
 * WHY A JOIN LAYER RATHER THAN COMPONENTS IMPORTING BOTH: a component that imports both has
 * to know which half holds what, and every component would repeat that knowledge. Worse, the
 * shapes differ — the registry keys on `slug`, the JSON keys on `slug` too but is a plain
 * array inside a wrapper object. One place to reconcile that is one place to fix it.
 *
 * FOR A SQL READER: this is a straightforward inner join on slug, resolved once at module
 * load rather than per render. `COUNTRIES` is the driving table because it defines the
 * itinerary order, which is the information architecture (§2.3). The JSON's order is
 * incidental.
 */

/*
 * The join, computed once at module scope.
 *
 * WHY AT MODULE SCOPE AND NOT IN A HOOK: both inputs are static imports. The result is
 * identical on every render, for every visitor, forever. Recomputing it inside a component —
 * even with `useMemo` — would be paying a small cost repeatedly to produce a constant. Module
 * scope runs it once when the bundle loads.
 *
 * This is the same instinct as the derived-state rule in useScrollProgress: if a value cannot
 * change, it should not live anywhere that implies it might.
 */
const MEASURED_BY_SLUG = new Map(journeyData.countries.map((entry) => [entry.slug, entry]))

/*
 * A MISSING JOIN PARTNER IS A BUILD PROBLEM, SO IT FAILS LOUDLY AND IMMEDIATELY.
 *
 * If the registry lists a country the pipeline did not produce, every component downstream
 * would read `undefined` and either render blank or throw somewhere far from the cause. The
 * useful error is here, at module load, naming the mismatch — not three components later
 * complaining that `facts` is undefined.
 *
 * The pipeline already asserts the reverse direction (its itinerary must match the workbook).
 * Between them the two lists cannot silently drift.
 */
const missing = COUNTRIES.filter((country) => !MEASURED_BY_SLUG.has(country.slug))
if (missing.length > 0) {
  throw new Error(
    `journey.js: no measured data for ${missing.map((c) => c.slug).join(', ')}. ` +
      `Run \`npm run data\` — src/data/journey.json is generated and may be stale.`,
  )
}

/*
 * The joined itinerary, in arrival order.
 *
 * The editorial half is spread first and the measured half nested under named keys rather
 * than flattened together. Flattening would read more conveniently (`country.population`) and
 * would make it impossible to tell, at a glance in a component, whether a value was measured
 * or chosen. That distinction matters on this project more than the extra keystroke: a number
 * someone can point at must be traceable to the workbook.
 */
export const JOURNEY = COUNTRIES.map((country) => {
  const measured = MEASURED_BY_SLUG.get(country.slug)
  return {
    ...country,
    capital: measured.capital,
    continent: measured.continent,
    currency: measured.currency,
    timeZone: measured.timeZone,
    facts: measured.facts,
    welcome: measured.welcome,
    didYouKnow: measured.didYouKnow,
    travellerNote: measured.travellerNote,
    day: measured.day,
    food: measured.food,
    transport: measured.transport,
    languages: measured.languages,
    observations: measured.observations,
    experiences: measured.experiences,
    images: measured.images,
  }
})

const JOURNEY_BY_SLUG = new Map(JOURNEY.map((country) => [country.slug, country]))

/** Look up a joined country by URL slug. Returns undefined for unknown slugs. */
export function getJourneyCountry(slug) {
  return JOURNEY_BY_SLUG.get(slug)
}

/**
 * One traveller observation by its section name, or undefined.
 *
 * The five sections are Time Usage, Food, Transport, Language, Culture. A component asks for
 * the one it is about rather than indexing into the array by position — position is an
 * accident of spreadsheet row order, and a reordered sheet should not silently move the food
 * quote into the transport section.
 *
 * NOTE THE RETURN SHAPE'S CONTRACT: `.quote` is first-person text. §3.4 permits the traveller
 * to be quoted and forbids the site narrating as "I", so anything rendering this must present
 * it as a quotation with visible attribution. The field name is the reminder.
 */
export function getObservation(country, section) {
  return country.observations.find((observation) => observation.section === section)
}

/*
 * ============================================================================================
 * CANONICAL ORDERS — the fix for a real problem in the source data.
 *
 * THE PROBLEM. The workbook's transport rows are stored SORTED BY VALUE, so the order differs
 * per country: Japan's first row is Public Transit (46%), the United States' first row is
 * Private Vehicle (85.5%). Rendered in data order, the first bar and the darkest colour would
 * mean a different mode on every page.
 *
 * WHY THAT IS NOT MERELY UNTIDY. Two reasons, and the second is the important one:
 *
 *   1. Colour must follow the entity, never its rank. If Japan's darkest step is transit and
 *      America's darkest step is cars, the ramp encodes "whatever is biggest here" — which is
 *      no encoding at all, and it silently invites the reader to compare the two charts as if
 *      the colours matched.
 *   2. §7.4: "sort order *is* a ranking." A chart sorted by value tells the reader that the
 *      largest is the point. For "how do people get around?", the point is the SHAPE of the
 *      mix, not which mode won. A fixed order lets a reader see that Italy and Japan differ in
 *      kind rather than merely in which bar is longest.
 *
 * So both series are reordered to a fixed, editorially-chosen sequence, declared here.
 *
 * WHY THE ORDER IS WHAT IT IS. Not alphabetical, and not by any country's values — both would
 * be arbitrary. The day runs in the sequence a person would describe their own day: what you
 * must do, what you must do to keep going, what you choose, what you owe others, and the
 * travel between them. Transport runs from the most collective mode to the most individual,
 * which is the axis the traveller's own note is about.
 *
 * WHY THE FUNCTIONS ARE TOLERANT of a category the order does not list: they append unknown
 * entries at the end rather than dropping them. A dropped slice would make a 24-hour day add
 * up to less than 24 and no one would be told. Appending keeps the total honest and makes the
 * new category visible so it can be placed deliberately.
 * ============================================================================================
 */
const DAY_ORDER = [
  'Paid Work / Study',
  'Sleep, Eating, Personal Care',
  'Leisure & Socializing',
  'Unpaid Housework / Childcare',
  'Commuting',
]

const TRANSPORT_ORDER = [
  'Public Transit',
  'Private Vehicle',
  'Active Transport',
  'Other/Taxi',
]

/*
 * Food runs plant → animal, which is the axis the numbers actually vary along: India's meat
 * figure is 4.5 kg and America's is 124.8, while the vegetable figures are far closer together.
 * Ordering it this way puts the widest variation at one end rather than in the middle.
 *
 * All five countries happen to store these three rows in the same order today, so this changes
 * nothing right now. It is declared anyway for the same reason as the other two: the order the
 * reader sees must be ours, not a side effect of row order in a spreadsheet that anyone could
 * re-sort.
 */
const FOOD_ORDER = ['Vegetables', 'Dairy', 'Meat']

/* Stable ordering by a declared list; anything unlisted keeps its relative position at the end. */
function byCanonicalOrder(items, order, key) {
  const rank = (item) => {
    const index = order.indexOf(item[key])
    return index === -1 ? order.length : index
  }
  return [...items].sort((a, b) => rank(a) - rank(b))
}

/**
 * A country's day in canonical order, with each activity's share of 24 hours.
 *
 * `share` is computed here rather than in the pipeline because it is a presentation concern —
 * the workbook states hours, which is the measured fact, and a percentage of a day is something
 * we derive from it. Deriving it once here means no component divides by a hardcoded 24.
 *
 * The total is returned alongside rather than assumed. All five countries currently sum to 24
 * (India to 23.999999999999996, which is float noise, not a data problem), but a chart that
 * assumes 24 and receives 23 would silently mis-scale every slice.
 */
export function getDay(country) {
  const activities = byCanonicalOrder(country.day.activities, DAY_ORDER, 'activity')
  const total = activities.reduce((sum, item) => sum + item.hours, 0)
  return {
    ageGroup: country.day.ageGroup,
    total,
    activities: activities.map((item) => ({
      ...item,
      share: (item.hours / total) * 100,
    })),
  }
}

/** A country's transport mix in canonical order. Percentages are as measured. */
export function getTransport(country) {
  return byCanonicalOrder(country.transport, TRANSPORT_ORDER, 'mode')
}

/*
 * A country's food consumption in canonical order, with the scale needed to draw it.
 *
 * WHY THE SCALE IS COMPUTED ACROSS ALL FIVE COUNTRIES AND RETURNED WITH THE DATA.
 *
 * These are absolute quantities (kg per person per year), not shares of a whole — unlike the day
 * and the transport mix, they do not add up to anything. So there is no natural 100 to scale to,
 * and the choice of scale is the entire meaning of the chart.
 *
 * Scaling each country to its own maximum would be actively misleading: India's 145 kg of dairy
 * and Switzerland's 288 kg would draw the same length, so the one genuinely large difference in
 * the dataset would be rendered invisible. A reader comparing two chapters would conclude the
 * two countries eat about the same amount of dairy.
 *
 * So the scale is the maximum across the whole journey (Switzerland's 288.5 kg dairy), shared by
 * every chapter. Every bar on every country page is then measured against the same ruler, and
 * India's meat bar being nearly empty while America's is nearly full is a fact the reader can
 * see rather than one they have to compute.
 *
 * NOTE WHAT THIS IS NOT. A shared scale lets bars be compared across pages; it does not rank
 * countries, and nothing in the section sorts or scores them. More dairy is not better dairy.
 */
const FOOD_SCALE = Math.max(
  ...JOURNEY.flatMap((country) => country.food.map((item) => item.perCapita)),
)

export function getFood(country) {
  return {
    scale: FOOD_SCALE,
    items: byCanonicalOrder(country.food, FOOD_ORDER, 'category'),
  }
}

/*
 * Re-exported so a component needs only one data import. `getRegistryEntry` stays available
 * for the shell (SiteLayout, nav) which needs atmosphere alone and should not pull the whole
 * measured dataset into its dependency graph.
 */
export { getRegistryEntry }
