/*
 * COUNTRY REGISTRY + ATMOSPHERES
 *
 * WHAT THIS IS
 * The itinerary, plus the "atmosphere" tokens that give each country its own feel.
 *
 * WHY IT IS HAND-AUTHORED RATHER THAN GENERATED FROM THE EXCEL FILE
 * The measured data (happiness, life expectancy, time use...) will come from JSON
 * produced by the data pipeline. But atmosphere is an editorial decision, not a
 * measurement — there is no "pace multiplier" column in a spreadsheet. Keeping the two
 * separate means regenerating data never overwrites design intent.
 *
 * WHY ATMOSPHERE IS DATA AND NOT CODE
 * Components never ask "am I Japan?". They read the active atmosphere's values. That
 * single decision is what keeps five countries from becoming five codebases, and it is
 * how Principle 13 (consistent structure, distinct atmosphere) is enforced structurally
 * rather than by discipline.
 *
 * ORDER IS THE ITINERARY, ALWAYS.
 * Never sort this array by a metric value. Sort order IS a ranking, and no caption
 * undoes it — PRODUCT_VISION.md §7.4 forbids it.
 *
 * Colour values: every accent was validated by script (all-pairs CVD ΔE 9.4,
 * normal-vision 16.1, all contrast >= 3:1). See DESIGN_SYSTEM.md §4.3 for the output.
 * Do not hand-edit these without re-running the validator.
 */

export const COUNTRIES = [
  {
    slug: 'japan',
    name: 'Japan',
    epithet: 'Land of the Rising Sun',
    flag: '🇯🇵',
    arrivalOrder: 1,
    days: 'Days 1–6',
    // The emotional brief. Drives copy tone and imagery choices.
    emotion: 'calm · precision · technology · discipline',
    atmosphere: {
      mark: '#2a78d6', // 4.21:1 vs cream — chart fills
      ink: '#184f95', // 7.73:1 vs cream — text, links, active nav
      wash: '#2a78d614', // ~8% tint
      // Slightly SLOWER than baseline, and the only country with perfectly uniform
      // intervals and no overshoot: precision reads as predictable motion.
      pace: 0.9,
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)', // symmetrical, machined
      staggerMs: 90,
    },
  },
  {
    slug: 'india',
    name: 'India',
    epithet: 'A Land of Many Worlds',
    flag: '🇮🇳',
    arrivalOrder: 2,
    days: 'Days 7–13',
    emotion: 'energy · community · culture · celebration',
    atmosphere: {
      mark: '#d95926', // 3.70:1 — legal as a MARK only, never as text
      ink: '#B4530A', // 4.79:1 vs cream
      wash: '#d9592614',
      // FASTER, with the shortest stagger, so elements pile in like a crowd.
      pace: 1.15,
      ease: 'cubic-bezier(0.34, 1.32, 0.64, 1)', // the only overshoot we permit
      staggerMs: 55,
    },
  },
  {
    slug: 'italy',
    name: 'Italy',
    epithet: 'Where History Lives Outdoors',
    flag: '🇮🇹',
    arrivalOrder: 3,
    days: 'Days 14–19',
    emotion: 'history · art · food · slow living',
    atmosphere: {
      mark: '#9E2A2B', // 7.10:1
      ink: '#87201F', // 8.87:1
      wash: '#9E2A2B14',
      // SLOWEST, longest stagger. "Slow living" is the one atmosphere where making
      // the visitor wait IS the message.
      pace: 1.3,
      ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // gentle, unhurried
      staggerMs: 130,
    },
  },
  {
    slug: 'switzerland',
    name: 'Switzerland',
    epithet: 'Where the Mountains Keep Time',
    flag: '🇨🇭',
    arrivalOrder: 4,
    days: 'Days 20–24',
    emotion: 'nature · peace · quality · balance',
    atmosphere: {
      mark: '#199e70', // 3.25:1 — mark only
      ink: '#0F7A55', // 5.09:1
      wash: '#199e7014',
      // Perfectly even stagger expresses "balance"; nothing overshoots ("peace").
      pace: 1.1,
      ease: 'cubic-bezier(0.33, 1, 0.68, 1)', // clean glide
      staggerMs: 100,
    },
  },
  {
    slug: 'united-states',
    name: 'United States',
    epithet: 'Many Journeys in One',
    flag: '🇺🇸',
    arrivalOrder: 5,
    days: 'Days 25–28',
    emotion: 'innovation · ambition · scale · opportunity',
    atmosphere: {
      mark: '#4a3aa7', // 8.16:1
      ink: '#3E3090', // 9.86:1
      wash: '#4a3aa714',
      // Baseline pace with decisive easing: arrives fast, stops hard — "ambition".
      pace: 1.0,
      ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
      staggerMs: 70,
    },
  },
]

/*
 * ============================================================================================
 * REFLECTIONS — the closing paragraph of each country chapter.
 *
 * WHY THIS LIVES HERE AND NOT IN THE GENERATED JSON.
 *
 * A survey of the dataset found that every text field it holds is already spoken for: the five
 * traveller observations carry Living and Culture, `didYouKnow` closes Culture, and
 * `travellerNote` opens the chapter in Arrival. There is no unused source text for a reflection,
 * and there should not be — a reflection is not a measurement. It is the one place in a chapter
 * where the site speaks in its own voice, so it is editorial by definition and belongs beside the
 * other editorial decisions (epithet, emotion, atmosphere) rather than in a file that
 * `npm run data` overwrites.
 *
 * WHAT EACH ONE HAS TO DO, AND THE CONSTRAINTS IT IS WRITTEN UNDER.
 *
 *   1. CLOSE THE CHAPTER'S OWN LOOP. The arrival opened on the traveller's expectation-versus-
 *      discovery note; the reflection returns to it now that the reader has seen the evidence.
 *      That is the central narrative of the whole project, one country at a time.
 *
 *   2. NEVER RANK. No reflection may imply this country does something better than another, and
 *      none of them uses a comparative at all — no "more relaxed than", no "unlike". Each one is
 *      about this place on its own terms. The permanent principle is that data provides context
 *      rather than judgement, and prose can break that rule far more easily than a chart can.
 *
 *   3. NOT SUMMARISE THE NUMBERS. "Japan sleeps 10.4 hours and takes 46% of journeys by transit"
 *      is a statistics recap, which the vision explicitly rules out for a closing moment. The
 *      reflection names what the numbers did not contain.
 *
 *   4. NO FIRST PERSON. The site never says "I" (§3.4). Where a personal voice is needed, the
 *      traveller is quoted from the dataset — which the Reflection section does, beneath this
 *      prose, using their Culture observation.
 *
 * Each is one sentence of what the chapter showed, then one sentence of what it did not settle.
 * The second sentence matters more: it is what keeps the ending a reflection rather than a
 * conclusion, and it is the sentence that makes "data should answer questions, not end
 * conversations" true of the chapter's last paragraph and not just of its charts.
 *
 * Keyed by slug rather than nested in COUNTRIES so this reads as one editorial page — five
 * paragraphs meant to be written and revised together, in a consistent voice. Interleaved with
 * the colour tokens they would be five paragraphs nobody ever reads side by side.
 * ============================================================================================
 */
export const REFLECTIONS = {
  japan: {
    /*
     * `carried` is the pull-quote: the one line that stays with the reader. Japan's arrival note
     * expected futuristic technology and found quietness, so the reflection lands on structure
     * being a form of care rather than of constraint — which is what a 10.4-hour rest figure and
     * a punctual train network mean when read together rather than scored separately.
     */
    carried: 'Precision, it turns out, is a kind of politeness.',
    body: 'A day here is organised carefully enough that people can count on it. Trains arrive when they say they will, and the hours hold their shape. What the figures cannot show is how that reliability feels from the inside: not rigid, but restful.',
    open: 'Whether structure like this is something a place builds or something it inherits is not a question a dataset can answer.',
  },
  india: {
    carried: 'Nothing here happens to only one person.',
    /*
     * "carries most journeys" was cut from this sentence after checking it against the chart above
     * it. Shared transport is the largest single mode here (43.5%) but it is not a majority, and
     * "most journeys" reads as one. Principle 15: accuracy is not negotiable for atmosphere — and a
     * reflection that overstates the chart three screens above it is the easiest kind of dishonesty
     * to miss, because prose is not checked the way an axis is.
     */
    body: 'The measured day looks busy, and the shared parts of it are where the hours actually go: meals, markets, festivals, and the crowded transport that carries more journeys here than any other kind. Company is not an interruption of the routine; it is the routine.',
    open: 'How much of that comes from choice and how much from proximity is not visible in any of these numbers.',
  },
  italy: {
    carried: 'Some of the day is deliberately not for anything.',
    body: 'Leisure takes nearly as many hours as paid work, and the food figures describe a table that is meant to be sat at rather than cleared. The evening in the piazza is not time left over after the day; it is what the day was arranged around.',
    open: 'Whether that is a tradition being kept or simply a habit nobody has needed to break is left open.',
  },
  switzerland: {
    carried: 'Quiet is something a country can decide to build.',
    /*
     * This said "Four languages" in the first draft, which is true of Switzerland and false of the
     * page: the dataset carries three (German, French, Italian), so the list a reader has just
     * finished looking at has three rows in it. Romansh is genuinely a fourth official language and
     * its absence is a gap in our data — but the reflection is not the place to quietly patch a gap,
     * because the reader would count the rows and find the site contradicting itself one screen
     * apart. The sentence now says what the page actually showed.
     */
    body: 'The pattern here is balance held on purpose: work that ends, transport that runs, mountains close enough to reach on an ordinary afternoon. Several official languages share the same small space without any of them being the answer.',
    open: 'What that costs, and who can afford to live inside it, is not something the dataset was asked.',
  },
  'united-states': {
    carried: 'Distance shapes almost everything else.',
    body: 'Most journeys happen in a private vehicle, and that single fact reaches into the length of a commute, the size of a meal and the shape of a weekend. Scale is not a statistic here so much as a daily condition.',
    open: 'Whether that scale is a freedom or a requirement almost certainly depends on which part of the country you ask.',
  },
}

/** The reflection copy for a country, or undefined if none has been written yet. */
export function getReflection(slug) {
  return REFLECTIONS[slug]
}

/*
 * The neutral atmosphere used by the shell and any non-country route.
 * Deliberately quiet — "the shell is silent; the country speaks."
 */
export const NEUTRAL_ATMOSPHERE = {
  mark: '#2a78d6',
  ink: '#184f95',
  wash: '#2a78d614',
  pace: 1,
  ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
  staggerMs: 80,
}

/** Look up a country by its URL slug. Returns undefined for unknown slugs. */
export function getCountryBySlug(slug) {
  return COUNTRIES.find((country) => country.slug === slug)
}

/**
 * The next stop on the itinerary, or null after the final country.
 *
 * This powers the "Continue to India →" band that ends each country page. That band
 * is the engine of the journey (DESIGN_SYSTEM.md §10.5): a visitor who stops should
 * stop because they ran out of time, not because they ran out of reasons to continue.
 */
export function getNextCountry(slug) {
  const index = COUNTRIES.findIndex((country) => country.slug === slug)
  if (index === -1 || index === COUNTRIES.length - 1) return null
  return COUNTRIES[index + 1]
}

export const TOTAL_STOPS = COUNTRIES.length

/*
 * How long the journey lasted, in days — derived, never typed.
 *
 * The `days` strings ("Days 1–6", "Days 25–28") are the authored labels each chapter shows, and
 * the last number in the final one is the length of the trip. Parsing it out means the copy that
 * says "twenty-eight days" cannot disagree with the copy that says "Days 25–28", which is
 * precisely the kind of contradiction a reader notices and an author never proofreads for: both
 * sentences read perfectly well on their own.
 *
 * The en-dash is the one in the strings above (–, not -). The regex takes the LAST run of digits
 * in the final stop's label rather than splitting on the dash, so it survives a relabelling to
 * "Days 25 to 28" or "Final days 25–28".
 */
const finalDaysLabel = COUNTRIES[COUNTRIES.length - 1].days
export const TOTAL_DAYS = Number(finalDaysLabel.match(/(\d+)\D*$/)?.[1])
