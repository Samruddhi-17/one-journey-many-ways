/*
 * facets.js — the six questions a visitor can put to the traveller, as data.
 *
 * ============================================================================================
 * WHAT A FACET IS, AND WHY THE CHAPTER IS BUILT FROM THEM
 *
 * The previous build was four fixed movements read top to bottom: arrival, living, culture,
 * reflection. It was honest and it was inert — the visitor's only decision was whether to keep
 * scrolling. A facet is the replacement unit: one question, the evidence that answers it, and the
 * traveller's own note on the same subject. The visitor opens them in whatever order they like.
 *
 * WHY SIX, AND WHY THESE SIX. Not because six is a nice number — because the dataset contains
 * exactly six subjects it can answer honestly, and every one of them has the traveller's voice
 * attached to it. Five of the six pair with one of the workbook's five observations (Time Usage,
 * Food, Transport, Language, Culture); the sixth pairs with `didYouKnow`. That is the entire
 * first-person content in the dataset, all of it used, none of it invented.
 *
 * THE THREE FIGURES THE WORKBOOK HOLDS THAT NO FACET USES, and why each is left out. This list
 * matters more than the six that are included, because "we have the number so let us show it" is
 * how a story becomes a dashboard:
 *
 *   happinessScore (6.15 for Japan) — a single score per country, on one axis, comparable at a
 *      glance. It exists to answer "so who won", which is the question this project was built in
 *      order not to ask (§7.4, Principle 6). No presentation fixes that; the number's shape IS
 *      the ranking.
 *
 *   touristArrivalsMillions (36.9) — measures how many outsiders visit, which is a popularity
 *      figure about a country rather than a fact about living in one. It would also quietly
 *      reframe every country as a destination, when the whole premise is ordinary life.
 *
 *   workHoursPerWeek (36.7) — left out for a reason discovered by checking it against the day
 *      series, and worth preserving because it looks like the single most relevant number on the
 *      page. The day facet says Paid Work / Study takes 6.3 hours. A reader who sees "36.7 hours
 *      a week" beside it will multiply: 6.3 × 7 = 44.1, or 6.3 × 5 = 31.5. Neither is 36.7, so
 *      one of our two figures looks wrong. Neither IS wrong — weekly hours are per employed
 *      worker, the day series averages everyone aged 15–64 including students across all seven
 *      days — but reconciling two survey methodologies is not what a facet is for, and a figure
 *      that reads as inconsistent damages trust in the figures that are solid (Principle 15).
 *
 * WHY THE COPY LIVES HERE RATHER THAN IN THE COMPONENT
 * Each facet's question, its caption, and the one-line framing the site says before the evidence
 * are all editorial decisions about the same six subjects. Written together in one file they can
 * be revised for a consistent voice; spread across six JSX branches they drift immediately. The
 * component that renders a facet therefore contains no country-specific and no subject-specific
 * copy at all — it renders whatever this file describes.
 *
 * WHAT IS NOT HERE: the values. A facet declares which QUESTION it asks and which SHAPE of
 * evidence answers it. The numbers are read from the joined country at render time via the
 * accessors in journey.js. Copying data into this file would create a second source of truth for
 * something `npm run data` regenerates.
 * ============================================================================================
 */

/*
 * The six facets, in the order they are offered.
 *
 * ORDER IS EDITORIAL AND IT IS NOT A RANKING — nothing here is sorted by any value, and the
 * visitor can open them in any sequence, which is the structural guarantee that the order carries
 * no claim (§7.4). What the order does carry is a sensible first impression: the day comes first
 * because it is the only facet that frames all the others (every other subject is something that
 * happens inside those twenty-four hours), and the surprise comes last because it is the one that
 * works best as a parting shot rather than an introduction.
 *
 * `kind` names the shape of the evidence, and the renderer switches on it. It is deliberately a
 * shape ('divided-bar') rather than a subject ('day'): two facets could legitimately want the same
 * form, and a renderer keyed on subject would be five components pretending to be one.
 *
 * `note` names which observation section supplies the traveller's voice. `null` means this facet
 * uses `didYouKnow` instead, which only the surprise facet does.
 */
export const FACETS = [
  {
    id: 'day',
    /*
     * The question is what the visitor sees on the closed card, so it has to be the thing they
     * would actually wonder. "Time allocation by activity" is the dashboard title for this same
     * chart and it is addressed to an analyst; "What does a day look like?" is addressed to a
     * person (DESIGN_SYSTEM.md §2 — chart titles become questions, Principle 7).
     */
    question: 'What does a day look like?',
    /* The one-word label on the card face. Short enough to read at a glance on a phone. */
    label: 'A day',
    /*
     * `teaser` appears on the closed card and its job is to make opening the card feel worthwhile
     * without giving away the answer. Note it names the SUBJECT, never a value — a teaser
     * containing "10.4 hours" would make the card the answer and the panel redundant.
     */
    teaser: 'Twenty-four hours, divided the way people here actually divide them.',
    kind: 'divided-bar',
    note: 'Time Usage',
    /*
     * `framing` is the site's own voice, spoken once before the evidence appears. It exists because
     * a chart shown before the claim it supports is decoration and the same chart after it is
     * evidence (Principle 3) — so every facet states what to look for before showing anything.
     *
     * It is written to be true of all five countries, which is the constraint that keeps it honest:
     * a sentence that only works for Japan would have to be five sentences, and five sentences
     * about the same chart is where a shared component starts branching.
     */
    framing:
      'Every day is the same length everywhere. What changes is where it goes — and that division is where a country stops being an idea and becomes a routine you could live inside.',
    /*
     * `caveat` is Principle 17 attached to the specific evidence it qualifies, rather than
     * collected in a page footer nobody reaches. Only the facets that need one have one.
     */
    caveat:
      'A national average for one age band, from a single dataset. It describes no actual person’s Tuesday — useful for shape and proportion, unreliable for anything more precise.',
  },
  {
    id: 'transport',
    question: 'How do people get around?',
    label: 'Getting around',
    teaser: 'The smallest part of the day, and the one that shaped everything else.',
    kind: 'share-bars',
    note: 'Transport',
    framing:
      'How a country moves says something about how it was built: whether people travel together or separately, and whether that is really a choice.',
    caveat: null,
  },
  {
    id: 'food',
    question: 'What is on the table?',
    label: 'Food',
    teaser: 'What a year of eating adds up to, per person.',
    kind: 'scaled-bars',
    note: 'Food',
    /*
     * This framing has to do one extra job the others do not: explain that the bars are measured
     * against a shared ruler. Food is the only facet whose figures are absolute quantities rather
     * than shares of a fixed whole, so the scale is a choice, and an unexplained choice of scale is
     * the most common way a bar chart misleads without containing a false number.
     */
    framing:
      'These are kilograms per person per year, and unlike the hours in a day they do not add up to anything. So every bar on every country page is drawn against the same ruler — the largest single figure anywhere on the journey — which is what makes the lengths worth comparing at all.',
    caveat:
      'Availability per person, not what anyone eats. More of something is not better than less of it, and nothing here is a diet.',
  },
  {
    id: 'language',
    question: 'What will I hear on the street?',
    label: 'Language',
    teaser: 'Which languages share the same pavement, and how widely.',
    /*
     * A DELIBERATELY DIFFERENT SHAPE, AND THE REASON IS THE DATA ITSELF.
     *
     * Three of the five countries record their language figures as ranges — "15–30%" for English in
     * Japan, "12–18%" in India — because that is genuinely the state of the evidence. A bar has one
     * length, so drawing a range as a bar requires picking a point inside it, which converts an
     * honest uncertainty into a false precision. The dataset does carry a `share` midpoint for
     * exactly that purpose and this facet ignores it.
     *
     * So the evidence is set as text: the range is printed as written, and "15–30%" tells the
     * reader something a 22.5% bar actively hides — that nobody knows the number to better than
     * fifteen points. Principle 17 is not a disclaimer you add underneath a chart; sometimes it is
     * the reason there is no chart.
     */
    kind: 'stated-list',
    note: 'Language',
    framing:
      'Some of these figures are ranges rather than numbers, and they are printed as ranges. Where nobody knows a share to better than fifteen points, drawing a bar would invent a precision the evidence does not have.',
    caveat: null,
  },
  {
    id: 'culture',
    question: 'What did you actually do there?',
    label: 'Culture',
    teaser: 'Three things worth going out of the way for.',
    kind: 'experiences',
    note: 'Culture',
    /*
     * The only facet whose evidence is photographs rather than figures, and the framing says so
     * plainly. Principle 10 asks every image to advance the narrative; the honest way to meet that
     * here is to admit these three are the traveller's choices rather than a measurement, so the
     * visitor knows which kind of thing they are looking at.
     */
    framing:
      'Nothing on this one is measured. These are three things the traveller went to, chosen by them, which is a different kind of evidence from everything else here and worth naming as such.',
    caveat: null,
  },
  {
    id: 'people',
    question: 'Who lives here?',
    label: 'The people',
    teaser: 'How many, how long, and one thing nobody warned about.',
    /*
     * `stated-facts` and NOT bars, which is the whole point of this facet's shape.
     *
     * Population and life expectancy are the two most rankable figures in the dataset: both are
     * single numbers per country on a single axis, and drawn as bars against a shared scale they
     * would read as a scoreboard — India's population bar dwarfing Switzerland's says nothing
     * about living in either place, and a life-expectancy ramp says one country is doing better.
     *
     * Set as sentences instead, each figure sits on its own and invites no comparison of lengths.
     * This is the same reasoning that keeps the happiness score off the site entirely; the
     * difference is that these two are genuinely useful context for the facets around them, so
     * they are presented in the one form that cannot be ranked by eye.
     */
    kind: 'stated-facts',
    /*
     * The only facet with no matching observation — the workbook's five sections do not include
     * one about population. So its voice is `didYouKnow`, which is the dataset's own surprising
     * fact and is a better closing note than an observation would be anyway.
     */
    note: null,
    framing:
      'Two numbers, set as sentences rather than bars on purpose: a population is not a score, and a longer life expectancy is not a country doing better at being a country.',
    caveat: null,
  },
]

/*
 * A lookup, built once. Same reasoning as the joins in journey.js — the result cannot change, so
 * it should not live anywhere that implies it might.
 */
const FACETS_BY_ID = new Map(FACETS.map((facet) => [facet.id, facet]))

/** One facet by id, or undefined. */
export function getFacet(id) {
  return FACETS_BY_ID.get(id)
}

export const TOTAL_FACETS = FACETS.length
