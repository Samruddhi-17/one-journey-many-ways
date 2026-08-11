import { COUNTRIES, TOTAL_STOPS, getCountryBySlug } from '../data/countries'
import { spellOut, spellOutCapitalised } from './spellOut'

/*
 * meta.js — what the document says about itself.
 *
 * WHAT "DOCUMENT METADATA" IS, AND WHO ACTUALLY READS IT
 * Everything in this file ends up inside <head>, where it is never rendered on the page. Four
 * different audiences read it, and they are worth separating because they behave differently:
 *
 *   1. THE BROWSER — <title> becomes the tab label, the history entry, the bookmark name and
 *      the string the address bar autocompletes against. This is the one a real visitor sees.
 *   2. SEARCH ENGINES — <title> plus <meta name="description">. The description is not a
 *      ranking signal; it is the snippet under the link, so it is advertising copy that has to
 *      be true.
 *   3. LINK-PREVIEW SCRAPERS — the og:* (Open Graph) and twitter:* tags. When someone pastes a
 *      URL into Slack, iMessage, WhatsApp or a post, the receiving app fetches the page and
 *      builds a card from these.
 *   4. THE OPERATING SYSTEM — theme-color, which tints browser chrome on mobile.
 *
 * ------------------------------------------------------------------------------------------
 * THE ONE THING THAT MAKES THIS FILE UNUSUAL: HashRouter MEANS SCRAPERS NEVER SEE A ROUTE.
 *
 * The site routes on the fragment (`/#/japan`) because GitHub Pages is a static file host —
 * see the long note in App.jsx. Everything after `#` is BY DESIGN never sent to the server.
 * So when a scraper fetches `https://example.com/#/japan`, the server receives a request for
 * `/` and returns index.html verbatim. The scraper does not run our JavaScript, so it builds
 * its card from whatever is hard-coded in index.html — for every country, for the passport
 * page, for the 404, forever.
 *
 * TWO CONSEQUENCES, AND BOTH ARE DESIGN DECISIONS RATHER THAN LIMITATIONS TO APOLOGISE FOR:
 *
 *   a) THE STATIC DEFAULTS IN index.html MUST STAND COMPLETELY ALONE. They are not fallbacks
 *      for an edge case; they are the only metadata any link preview will ever use. So they
 *      describe the journey as a whole, which is the honest thing for a shared link to promise
 *      anyway — the five countries are an itinerary, not a menu (§2.3), and a card advertising
 *      one of them would misrepresent the site.
 *
 *   b) THE PER-ROUTE VALUES BELOW ARE FOR THE BROWSER, NOT FOR SHARING. Their whole job is
 *      that a visitor with eight tabs open can tell which one is Italy, that their history
 *      reads like an itinerary, and that a bookmark of a country page is named after the
 *      country. That is worth doing well and it is a completely different job from a share
 *      card.
 *
 * We still update og:/twitter: on navigation, cheaply, in the same loop — not because a
 * scraper will read it, but so the document is never internally inconsistent: inspecting
 * `/#/italy` should not find a <head> claiming to be the home page. Truthfulness about the
 * current state costs one line here and avoids a genuinely confusing debugging session later.
 * ------------------------------------------------------------------------------------------
 *
 * WHY THE STRINGS LIVE IN THEIR OWN MODULE RATHER THAN INSIDE THE HOOK THAT WRITES THEM
 * Deciding what a page is called is editorial work; setting document.title is plumbing. Kept
 * apart, `getRouteMeta` is a pure function of a pathname — it can be reasoned about, and read,
 * without knowing anything about the DOM.
 */

/*
 * SITE-LEVEL CONSTANTS — the values that are true of every page.
 *
 * `name` is the site's title exactly as the home page and the footer state it, punctuation
 * included. It is a proper name, so it is not reworded per route; routes prefix it.
 */
export const SITE = {
  name: 'One Journey. Many Ways of Living.',

  /*
   * THE DEFAULT DESCRIPTION — the most-read sentence on the site that nobody reads on the site.
   *
   * It is the search snippet AND, because of the HashRouter note above, the subtitle on every
   * shared link. So it has to do the whole job in about 160 characters: name the shape of the
   * thing, promise the central narrative (expectation versus discovery), and avoid sounding
   * like a report. It deliberately echoes the hero's supporting line rather than inventing a
   * second pitch — a site whose search result and whose first screen make different promises
   * feels like two products.
   *
   * WHY ~160 CHARACTERS IS A REAL CONSTRAINT AND NOT A STYLE PREFERENCE: search engines and
   * preview cards truncate the snippet, usually with an ellipsis, somewhere around there. A
   * description written past the limit does not merely get shortened — its last clause is
   * deleted, and the last clause is where an editorial sentence puts its point. Measured: 160.
   *
   * `spellOutCapitalised` rather than `spellOut`, and the difference was a real bug rather than
   * a nicety: `spellOut(5)` returns "five", so the sentence began "five countries, one
   * traveller" with a lowercase first letter. In the hero the same call is correct, because
   * there the number is mid-sentence. A helper that returns a word cannot know where the word
   * will land, so the call site has to. Note this string is duplicated as a literal in
   * index.html, which is unavoidable — static HTML cannot call a function — and the duplication
   * is guarded by the development-only check in useDocumentMeta.
   */
  /*
   * "LIVES, THRIVES AND CONNECTS" IS GONE, and this was the last place on the site carrying it. It is a
   * verdict the data cannot support — "thrives" says the five countries are flourishing, which nothing in
   * the workbook measures — and the footer was rewritten for the same phrase. This copy is worse than the
   * footer's was, because a description is what a shared link and a search result show, so it is the
   * site's claim about itself before anybody has seen a single figure.
   *
   * WHAT REPLACES IT KEEPS THE STRUCTURE THE COMMENT ABOVE DESCRIBES: shape of the thing, then the
   * expectation-versus-discovery narrative. It now closes on what the site actually contains, which is
   * ordinary days rather than an assessment of how well anyone is doing. Measured: 158 characters with
   * "Five" expanded, so it still lands inside the truncation limit — and the constraint is why the last
   * clause is short.
   */
  description: `${spellOutCapitalised(TOTAL_STOPS)} countries, one traveller, and a set of expectations that did not survive the trip. A data-led story about how an ordinary day is spent.`,

  /*
   * The cream that the page background actually is (`--color-surface-page` in tokens.css).
   *
   * Hard-coded rather than read from the custom property because <meta> content cannot hold a
   * `var()` — the browser needs a literal colour. If the token ever changes, this changes with
   * it; the comment is the only link between them, which is why it names the token.
   */
  themeColor: '#fdf9f3',
}

/*
 * ============================================================================================
 * THE ROUTE TABLE, AS METADATA.
 *
 * WHY THIS IS A FUNCTION OF THE PATHNAME RATHER THAN A useDocumentMeta CALL IN EACH PAGE.
 *
 * Both work. Per-page calls are more co-located, and CountryPage already knows its country —
 * so that was the first instinct. The reason this is centralised instead is the failure mode.
 *
 * With per-page calls, a page that forgets to call the hook inherits the PREVIOUS page's title.
 * The visitor navigates from Italy to the passport page and their tab still says Italy. That is
 * silent, it only appears after a navigation, and no test would notice.
 *
 * Centralised here, the fall-through case is the 404 metadata — which is exactly what the
 * router itself renders for a path it does not recognise. So an unhandled path cannot disagree
 * with what is on screen: both this function and App.jsx treat "not one of the known shapes" as
 * not-found. The two tables can go out of step in only one direction, and that direction is
 * harmless.
 *
 * It also puts this next to the atmosphere lookup in SiteLayout, which derives the same slug
 * from the same pathname for the same reason: the layout is the one component guaranteed to
 * render on every navigation.
 * ============================================================================================
 */

/*
 * A route's title. The specific part comes FIRST, and that ordering is the whole design.
 *
 * Browser tabs are narrow — often twenty characters or fewer with several tabs open — and they
 * truncate from the right. "One Journey. Many Ways of Living. · Italy" truncates to "One
 * Journ…" on every tab, so all five countries look identical, which defeats the only purpose a
 * per-route title has. "Italy · One Journey…" identifies itself in the first five characters.
 *
 * The separator is a middle dot with spaces, matching the eyebrows and the footer credit line
 * rather than introducing a fourth divider character to the project.
 */
function title(specific) {
  return specific ? `${specific} · ${SITE.name}` : SITE.name
}

/*
 * A country's description.
 *
 * Built entirely from the registry — name, epithet, arrival order — so there is no hand-written
 * sentence per country to maintain or to let drift. The same test the country components pass:
 * if it needed five bespoke strings it would be five things to keep in voice, and the fifth
 * would eventually be the odd one out.
 *
 * IT PROMISES THE CHAPTER'S SHAPE — an ordinary day, and then what the figures do not settle —
 * without quoting a single one. A description promising "a 46% transit share" makes the page
 * sound like a report, and it would go stale silently the next time `npm run data` runs.
 *
 * THE FIRST DRAFT LISTED ALL FOUR SUBJECTS ("how people move, what they eat and how they
 * understand one another") AND MEASURED 184–198 CHARACTERS, which is a real fault rather than
 * an untidy one. Search engines and preview cards truncate around 160 and the cut lands mid-
 * clause, so the sentence's actual point — what the figures leave out, which is the whole
 * promise of this project — was the part being deleted. Every variant now measures 129–136,
 * verified for all five countries rather than for the shortest name. The list of subjects went
 * because a description is not a table of contents; the page itself is a better one.
 *
 * "Stop one of five" is spelled out — a description is prose, and the numeral rule applies to
 * prose wherever it is read. Note the on-page eyebrow says "Stop 1 of 5" in numerals on
 * purpose: there it is a position indicator scanned like a page number, not a sentence.
 */
function countryDescription(country) {
  return (
    `${country.name}, ${country.epithet.toLowerCase()}. How an ordinary day here is actually ` +
    `spent, and what the figures leave out. ` +
    `Stop ${spellOut(country.arrivalOrder)} of ${spellOut(TOTAL_STOPS)}.`
  )
}

/**
 * The title and description for a pathname.
 *
 * Pure: same pathname in, same object out, no DOM access. That is what makes it checkable —
 * and it is why the mapping lives here rather than inside the effect that writes to <head>.
 *
 * @param {string} pathname a React Router pathname, e.g. `/`, `/passport`, `/japan`
 * @returns {{title: string, description: string}}
 */
export function getRouteMeta(pathname) {
  /*
   * Normalise before matching. A trailing slash and a leading slash are both routing noise —
   * `/japan/` and `/japan` are the same page to the router, and they must be the same page to
   * this function, or one of them silently gets the 404 title on a page that renders Japan.
   */
  const slug = pathname.replace(/^\/+/, '').replace(/\/+$/, '')

  if (slug === '') {
    return {
      /*
       * The home page carries the bare site name — no prefix. A home page titled "Home · One
       * Journey…" spends its most valuable characters on a word that describes the navigation
       * rather than the thing.
       */
      title: title(''),
      description: SITE.description,
    }
  }

  if (slug === 'passport') {
    return {
      title: title('The Route'),
      /*
       * "The Route", not "Passport". The tab label should say what the page shows a visitor,
       * and the page shows the itinerary in order; "passport" is the metaphor the design uses
       * to show it. The URL keeps the metaphor because a URL is part of the experience; the
       * tab label answers "which tab is this?".
       */
      description: `The whole itinerary in order: ${spellOut(TOTAL_STOPS)} countries, ${COUNTRIES.map((c) => c.name).join(', ')}, and where the journey has reached so far.`,
    }
  }

  const country = getCountryBySlug(slug)
  if (country) {
    return {
      title: title(country.name),
      description: countryDescription(country),
    }
  }

  /*
   * Everything else, including the explicit `/not-found` route and the router's catch-all.
   *
   * The description is deliberately the site default rather than an apology. If this page ever
   * did end up in a search index, "Five countries, one traveller…" is a better thing for a
   * visitor to read than "this page does not exist" — and the title already tells them.
   */
  return {
    title: title('Page not found'),
    description: SITE.description,
  }
}
