/*
 * spellOut — a number as an English word, for editorial copy.
 *
 * ============================================================================================
 * WHY THIS EXISTS, AND WHY IT IS NOT A TASTE PREFERENCE
 *
 * Two reasons, and the second is the load-bearing one.
 *
 * THE TYPOGRAPHIC REASON. Standard editorial practice spells out small numbers in running
 * text. "Why these 5 countries" is how a report writes; "Why these five countries" is how a
 * magazine writes. Small, and it lands on every reader.
 *
 * THE STRUCTURAL REASON. A numeral in body copy reads as a *statistic*. PRODUCT_VISION.md is
 * explicit that data appears only once there is a question for it to answer (Principle 3) —
 * so the opening screens of this site contain no statistics at all, by design. "5" sets off
 * the same reflex as a metric tile; the word "five" does not. Spelling it out is not
 * decoration, it is the copy staying in character.
 *
 * WHERE IT APPLIES, AND WHERE IT DELIBERATELY DOES NOT.
 *
 * It applies to PROSE — sentences a visitor reads. It does NOT apply to:
 *
 *   - MEASURED VALUES. "about 40 minutes each way", "94.6 kg", "6h 18m". These are the
 *     evidence, and a spelled-out measurement ("ninety-four point six kilograms") would be
 *     both unreadable and a false register: the whole point of a figure is that it is a figure.
 *   - POSITION INDICATORS. "Stop 2 of 5" in the header and the arrival eyebrow. That is a
 *     label reporting where the visitor is, not a sentence, and it is scanned rather than
 *     read — the same reason a page number is a numeral in a book whose prose is not.
 *
 * The line is therefore: is this a thing being said, or a thing being shown? Said, spell it.
 *
 * WHY A FUNCTION RATHER THAN JUST TYPING "five" INTO THE COPY.
 * Because the number comes from `TOTAL_STOPS`, which is derived from the itinerary registry.
 * Hardcoding the word would mean the prose silently goes stale the day a stop is added or
 * removed — and stale prose about the size of the journey is exactly the kind of error nobody
 * proofreads for, because the sentence still parses.
 *
 * WHY IT LIVES IN src/lib RATHER THAN INSIDE A COMPONENT.
 * It started as a private helper inside one home-page section. It now has five callers (the home
 * page's opening, the homecoming that closes the journey, the passport, the footer, the document
 * metadata), and the project's rule is to move shared code up when a second consumer appears rather
 * than in anticipation of one. Five is well past that.
 *
 * It is NOT in src/data/countries.js: that file is the itinerary and its atmospheres, and a
 * registry that also holds string utilities is on its way to becoming a junk drawer.
 * ============================================================================================
 */

const ONES = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
]

const TENS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
]

/**
 * A whole number from 0 to 99 as an English word. Anything else returns the digits.
 *
 * The range stops at 99 because that is the range this site's copy actually needs — five
 * countries, twenty-eight days — and a general number-to-words routine is a surprising amount
 * of code with no caller. Beyond it, the digits are returned rather than throwing: a visible
 * numeral in the copy is a prompt to extend this table, whereas a crash on a content page is a
 * disproportionate response to a proofreading matter.
 *
 * Compound numbers are hyphenated ("twenty-eight"), which is the standard English form.
 *
 * @param {number} n
 * @returns {string}
 */
export function spellOut(n) {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n)
  if (n < 20) return ONES[n]

  const tens = Math.floor(n / 10)
  const ones = n % 10
  return ones === 0 ? TENS[tens] : `${TENS[tens]}-${ONES[ones]}`
}

/**
 * The same word with its first letter capitalised, for the start of a sentence or a label.
 *
 * Separated from `spellOut` rather than handled by a flag, because a caller reading
 * `spellOutCapitalised(TOTAL_STOPS)` can see what it will get; a caller reading
 * `spellOut(TOTAL_STOPS, true)` cannot.
 *
 * @param {number} n
 * @returns {string}
 */
export function spellOutCapitalised(n) {
  const word = spellOut(n)
  return word.charAt(0).toUpperCase() + word.slice(1)
}
