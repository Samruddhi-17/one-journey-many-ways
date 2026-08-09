import { useEffect } from 'react'
import { SITE, getRouteMeta } from '../lib/meta'

/*
 * useDocumentMeta — keeps <head> honest about which page is on screen.
 *
 * WHY A SINGLE-PAGE APP NEEDS THIS AT ALL
 * A traditional site serves a new HTML document per page, so each one arrives with its own
 * <title>. This site downloads index.html once and then swaps content in and out with
 * JavaScript. Nothing updates <head> unless we do — so without this hook every tab, every
 * history entry and every bookmark on the site reads "One Journey. Many Ways of Living.",
 * including the 404.
 *
 * WHY NOT A LIBRARY (react-helmet-async is the usual answer)
 * It solves a problem we do not have. Helmet exists so that many components at different depths
 * can each contribute head tags, and something has to reconcile the conflicts and unwind them
 * in the right order on unmount. Here there is exactly one caller — SiteLayout — and one source
 * of truth, `getRouteMeta`. A dependency, a provider component and a reconciliation algorithm
 * would be added to avoid about fifteen lines of `setAttribute`, and it would ship in the
 * bundle every visitor downloads.
 *
 * The rule that produced this decision is worth keeping: reach for a library when it removes a
 * class of bug, not when it removes some typing.
 *
 * ------------------------------------------------------------------------------------------
 * WHY THIS MUTATES THE EXISTING TAGS RATHER THAN CREATING THEM
 *
 * Every tag written here already exists as a literal in index.html. This hook only ever
 * overwrites a `content` attribute; it never appends a <meta>.
 *
 * That ordering matters. index.html is what a link-preview scraper receives (the site routes on
 * the URL fragment, so the server only ever sees `/` — the long note in lib/meta.js explains
 * this in full). If the tags were created by JavaScript, a scraper would receive a document
 * with no Open Graph data at all and fall back to a bare URL. Declaring them statically and
 * refining them at runtime means the important audience is served by the HTML and the browser
 * gets the per-route detail as a bonus.
 *
 * The `?.` on each lookup is the consequence: if a tag were ever removed from index.html this
 * hook must not throw and take the page down with it. Missing metadata is a degraded page;
 * a thrown error inside a layout effect is a blank one. In development it says so out loud.
 * ------------------------------------------------------------------------------------------
 */

/* Sets one <meta> tag's content, matched by whichever attribute identifies it. */
function setMeta(attribute, name, content) {
  const tag = document.head.querySelector(`meta[${attribute}="${name}"]`)
  if (tag) {
    tag.setAttribute('content', content)
    return true
  }
  return false
}

/**
 * Apply a route's metadata to the document.
 *
 * @param {string} pathname a React Router pathname, e.g. `/`, `/passport`, `/japan`
 */
export function useDocumentMeta(pathname) {
  const { title, description } = getRouteMeta(pathname)

  useEffect(() => {
    document.title = title

    /*
     * THE THREE PLACES A DESCRIPTION HAS TO GO, and they are not interchangeable.
     *
     *   name="description"    search engines
     *   property="og:description"  Open Graph — Slack, iMessage, WhatsApp, LinkedIn, Discord
     *   name="twitter:description" X's own card format
     *
     * NOTE THE ATTRIBUTE DIFFERENCE, which is the one genuine gotcha in this whole area: Open
     * Graph tags are identified by `property`, everything else by `name`. It is not a
     * convention we chose — Open Graph is built on RDFa, where `property` is the spec'd
     * attribute. Using `name="og:title"` is silently ignored by every scraper, and the failure
     * looks exactly like a scraper cache problem, which is why it eats an afternoon.
     *
     * Twitter/X falls back to og:* for anything its own namespace does not declare, so
     * duplicating them is belt-and-braces rather than strictly required. It is cheap, and it
     * keeps the tag list readable as "here is what each platform is told" instead of "here is
     * what one platform is told plus a set of inheritance rules you have to remember".
     */
    const found = [
      setMeta('name', 'description', description),
      setMeta('property', 'og:title', title),
      setMeta('property', 'og:description', description),
      setMeta('name', 'twitter:title', title),
      setMeta('name', 'twitter:description', description),
    ]

    /*
     * A MISSING TAG IS A DEVELOPMENT-TIME PROBLEM, SO IT IS REPORTED AT DEVELOPMENT TIME.
     *
     * `setMeta` returning false means index.html no longer declares a tag this hook expects.
     * Nothing visible breaks — the browser tab is still correct, because the title is set
     * directly — but the static default a scraper reads has quietly gone missing, and no
     * screenshot or click-through would ever reveal it.
     *
     * `import.meta.env.DEV` is Vite's build-time flag. Vite replaces it with the literal
     * `false` in a production build, so this entire block including the message string is
     * removed by dead-code elimination. It costs nothing in the shipped bundle.
     */
    if (import.meta.env.DEV && found.includes(false)) {
      console.warn(
        '[meta] A <meta> tag this hook writes is not declared in index.html, so the static ' +
          'default a link-preview scraper reads is missing. Check index.html against the ' +
          'setMeta calls in src/hooks/useDocumentMeta.js.',
      )
    }
  }, [title, description])
}

/*
 * A one-time check that index.html's static description still matches SITE.description.
 *
 * WHY IT IS SEPARATE FROM THE HOOK AND WHY IT READS THE DOM ONCE AT MODULE LOAD: it has to run
 * before anything overwrites the tag, and the hook's whole job is overwriting the tag. Module
 * scope runs exactly once, before React mounts. Guarded by `import.meta.env.DEV` so the entire
 * block — the comparison, the string and the console call — is eliminated from the production
 * bundle.
 */
if (import.meta.env.DEV) {
  const staticDescription = document.head
    .querySelector('meta[name="description"]')
    ?.getAttribute('content')

  if (staticDescription && staticDescription !== SITE.description) {
    console.warn(
      '[meta] index.html\'s static description no longer matches SITE.description in ' +
        'src/lib/meta.js.\n' +
        `  index.html: ${staticDescription}\n` +
        `  meta.js:    ${SITE.description}\n` +
        '  Because the site routes on the URL fragment, index.html is the ONLY metadata a ' +
        'link-preview scraper ever sees. Update the literals in index.html (description, ' +
        'og:description and twitter:description) to match.',
    )
  }
}
