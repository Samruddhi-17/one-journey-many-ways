/*
 * endSentence — put a full stop after a value that may already have one.
 *
 * ============================================================================================
 * WHY THIS EXISTS: "WE HAVE LANDED IN WASHINGTON, D.C.."
 *
 * `arrivalGreeting` built its first line as `We have landed in ${country.capital}.` — a typed full
 * stop after a value from the workbook. Four of the five capitals are single words, so it read
 * correctly on Japan, India, Italy and Switzerland. America's capital is "Washington, D.C.", which
 * ends in a full stop of its own, and the arrival line printed two of them in 12px letterspaced
 * caps at the top of the last chapter.
 *
 * THE GENERAL SHAPE OF THE BUG, because it is the one this file is really about: appending
 * punctuation to a value is an assumption about that value, and it held in four cases out of five.
 * That is the same failure the site has already fixed three times with numbers — a count typed into
 * prose is an assumption about the data that happens to be true today. The settled rule there is
 * "if the site says a number out loud, the number comes from the data", and this is that rule
 * applied to the last character of a sentence.
 *
 * WHY A HELPER RATHER THAN A CONDITIONAL AT THE CALL SITE. There is one caller today, and a ternary
 * on `endsWith('.')` inline would be shorter. But the reasoning is not obvious from the expression:
 * the next person to write a sentence around a workbook value has to rediscover that one of the five
 * capitals is abbreviated. A named function is where that fact can be written down, and it is the
 * thing a reader will find when they grep for the double stop they just noticed.
 *
 * WHAT IT DELIBERATELY DOES NOT DO. It does not handle "?" or "!", and it does not strip trailing
 * whitespace, normalise ellipses, or take the punctuation mark as an argument. Every one of those
 * would be a guess about a caller that does not exist. The one case the site has is a declarative
 * sentence built around a value that might be abbreviated, and that is exactly what this covers. A
 * value ending in "?" would come back with a stop appended, which is wrong — and would be a real bug
 * the moment anything here asks a question. It is left unhandled rather than half-handled, because a
 * function that quietly accepts three terminators invites a caller to assume it accepts all of them.
 * ============================================================================================
 */

/**
 * `value` with a full stop after it, unless it already ends in one.
 *
 * @param {string} value
 * @returns {string}
 */
export function endSentence(value) {
  /*
   * A non-string is returned untouched rather than coerced. `String(undefined)` would put the word
   * "undefined." into a sentence on the page, which is the failure mode that looks like content.
   */
  if (typeof value !== 'string') return value

  return value.endsWith('.') ? value : `${value}.`
}
