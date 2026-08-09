/*
 * countryName — a country's name as it belongs inside a sentence.
 *
 * ============================================================================================
 * WHY THIS EXISTS
 *
 * Four of the five countries are used bare in prose and read correctly: "on arriving in Japan",
 * "Shall we go to Italy next?". The fifth needs a definite article, and without one every sentence
 * that interpolates it is subtly wrong:
 *
 *     "on arriving in United States"                → "in the United States"
 *     "One thing nobody mentions about United States" → "about the United States"
 *     "Shall we go to United States next?"          → "to the United States"
 *
 * This is the kind of error that survives review indefinitely. It is not a crash, it is not a
 * layout break, and it only appears on one of five chapters — so a reviewer checking Japan sees
 * nothing wrong, and a reviewer checking America reads past it because the meaning is obvious.
 *
 * WHY THE ARTICLE IS NOT SIMPLY BAKED INTO `country.name`.
 * Because the name is also used where the article would be WRONG, and those uses are the more
 * prominent ones: the `<h1>` on the arrival is "United States", not "The United States"; so is the
 * nav label, the journal's stamp slots and the route list. A name that carried its article would need
 * stripping in more places than adding it requires — and stripping is the harder direction, because
 * "does this string start with an article" is a guess where "does this country take one" is a fact.
 *
 * So the registry keeps the display name, and this supplies the prose form on request. Two
 * functions for two grammatical positions, because English does not let one string serve both:
 * mid-sentence takes lowercase "the", sentence-initial takes "The".
 *
 * WHY A TABLE RATHER THAN A RULE. There is no reliable rule. English gives the definite article to
 * countries whose names are plurals ("the Netherlands", "the Philippines") or contain a common noun
 * ("the United Kingdom", "the Czech Republic", "the Gambia"), and withholds it from everything else
 * — and the exceptions are not derivable from the string. Heuristics on the name ("ends in s",
 * "contains United") would misfire the moment a sixth country arrives; a table is honest about
 * being editorial knowledge rather than pretending to be logic.
 *
 * The default is NO ARTICLE, which is right for the overwhelming majority of country names and
 * means a sixth country added to the registry reads correctly without touching this file unless it
 * is one of the exceptions.
 * ============================================================================================
 */

/*
 * Slugs whose names take a definite article in prose. Keyed by slug rather than by name, because a
 * slug is a stable identifier and a display name is editorial copy that may be reworded.
 *
 * Only the itinerary's own countries need to be here. `netherlands` is included though it is not on
 * the route: the dataset carries ten countries and `EXCLUDED` in the pipeline currently keeps its
 * images unpublished, so a future itinerary change could surface it — and the whole point of this
 * table is that the omission is invisible until someone reads the sentence.
 */
const TAKES_ARTICLE = new Set(['united-states', 'netherlands'])

/**
 * The country's name for use MID-SENTENCE: "on arriving in the United States".
 *
 * Takes the country object rather than a slug so call sites read naturally and cannot pass a slug
 * where a name is wanted, which is the mistake this shape prevents.
 */
export function inProse(country) {
  return TAKES_ARTICLE.has(country.slug) ? `the ${country.name}` : country.name
}

/**
 * The country's name for use at the START of a sentence: "The United States does not have..."
 *
 * Separate from `inProse` for the same reason `spellOutCapitalised` is separate from `spellOut`:
 * only the call site knows whether the word it is placing begins a sentence, so the choice belongs
 * there rather than in a helper trying to infer it.
 */
export function inProseCapitalised(country) {
  return TAKES_ARTICLE.has(country.slug) ? `The ${country.name}` : country.name
}
