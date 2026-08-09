/*
 * countryCode — a country's three-letter code.
 *
 * ============================================================================================
 * WHY THIS IS A SHARED MODULE RATHER THAN A CONSTANT IN THE COMPONENT THAT NEEDED IT FIRST.
 *
 * The table below was written inside BoardingPass, which was the only thing that needed it. The
 * passport page now needs the identical five values for its stamps, and the two available options
 * were to import it from the component or to copy it. Copying a hand-authored lookup table into a
 * second file is how two parts of a site come to disagree: a correction applied to one copy leaves
 * the other stating the old value, and nothing fails — the wrong code simply renders, in one place,
 * for one country.
 *
 * Importing it from BoardingPass would have worked and is worse in a subtler way: it would make a
 * page depend on a corner ornament for a fact about countries, so deleting or restructuring the
 * ornament would break the page. The table is neither component's property. It belongs in src/lib
 * next to countryName, for the same reason that one does — both are facts about how countries are
 * written down, not facts about this journey.
 *
 * THAT SECOND ARGUMENT WAS THEN TESTED, WHICH IS WHY IT IS WORTH LEAVING IN. The boarding pass has
 * since been retired (see the note in SiteLayout). Had the table stayed inside it, retiring a corner
 * ornament would have taken every passport stamp and journal slot with it. The hypothetical was
 * correct within one session.
 *
 * WHY THE VALUES ARE TYPED OUT RATHER THAN DERIVED, which is worth defending because the project's
 * usual instinct is the opposite.
 *
 * These are ISO 3166-1 alpha-3 codes. Slicing the first three letters of the name would produce JAP
 * for Japan, which is a slur; SWI and UNI for the other two, which are not codes at all. The mapping
 * is genuinely arbitrary information that lives in an international standard — it is not a
 * transformation of anything we already hold, so there is nothing to derive it from. "Derive, never
 * type" applies to values we could compute; this is a lookup, and a lookup is data.
 *
 * WHY THESE ARE COUNTRY CODES AND NOT AIRPORT CODES, given that both call sites are aviation
 * metaphors. Because the things being named are countries, not airports: the journey visits Japan,
 * not Haneda. JPN is the code for the thing on the page; HND would be a code for a place the site
 * never mentions.
 * ============================================================================================
 */

const CODES = {
  japan: 'JPN',
  india: 'IND',
  italy: 'ITA',
  switzerland: 'CHE',
  'united-states': 'USA',
}

/**
 * The three-letter code for a country, or a three-letter fallback derived from its slug.
 *
 * THE FALLBACK IS DELIBERATE AND IS NOT A GUESS AT THE STANDARD. A sixth country added to the
 * registry without a line in the table above renders the first three letters of its slug, upper
 * cased — which is often right, sometimes wrong, and never blank. The alternative of returning null
 * would leave a stamp with an empty centre and a passport row with a hole in it, which reads as a
 * rendering failure rather than as missing data. A visibly wrong code sends whoever notices it
 * straight to this file; an empty one sends them to the component.
 *
 * Takes the country object rather than a slug so the call sites read as English and cannot pass a
 * name where an identifier is wanted.
 */
export function codeFor(country) {
  return CODES[country.slug] ?? country.slug.slice(0, 3).toUpperCase()
}
