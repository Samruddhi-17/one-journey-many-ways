import { Outlet, useLocation } from 'react-router-dom'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { ScrollProgressBar } from './ScrollProgressBar'
import { ScrollToTop } from './ScrollToTop'
import { PageTransition } from './PageTransition'
import { useAtmosphere } from '../../hooks/useAtmosphere'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import { getCountryBySlug } from '../../data/countries'

/*
 * SiteLayout — the persistent frame every page renders inside.
 *
 * WHY A SHARED LAYOUT INSTEAD OF A HEADER ON EACH PAGE
 * Two reasons, one obvious and one not.
 *
 * The obvious one: no duplication. Header and footer are written once.
 *
 * The subtle one: because the header lives ABOVE the routed content in the component
 * tree, React never unmounts it when the route changes. So the nav does not flicker, and
 * its scroll listener and open/closed state survive navigation. If each page rendered its
 * own header, every navigation would destroy and rebuild it.
 *
 * WHAT `<Outlet />` IS (React Router concept)
 * The placeholder where the matched child route renders. The layout is the picture frame;
 * `<Outlet />` is the hole where the picture goes.
 */
export function SiteLayout() {
  const location = useLocation()

  /*
   * Derive the active country from the URL and apply its atmosphere.
   *
   * WHY HERE RATHER THAN INSIDE EACH COUNTRY PAGE
   * The layout renders on every route, so this is the one place guaranteed to run on
   * every navigation — including navigation *away* from a country, which is when the
   * atmosphere must reset to neutral. Doing it in the page component would leave the last
   * country's accent behind on the Home page.
   *
   * Note that `getCountryBySlug` returns undefined for non-country routes, and
   * `useAtmosphere` falls back to the neutral shell atmosphere. So Home and the passport
   * page are quiet by default — "the shell is silent; the country speaks."
   */
  const slug = location.pathname.replace(/^\//, '')
  const country = getCountryBySlug(slug)
  useAtmosphere(country?.atmosphere)

  /*
   * Keep the document's <title> and meta description in step with the route.
   *
   * WHY IT IS HERE, ALONGSIDE THE ATMOSPHERE, AND NOT IN EACH PAGE COMPONENT
   * Exactly the same argument as the atmosphere above, and the same failure it avoids. This
   * layout is the only component guaranteed to render on every navigation, so it is the only
   * place where "what page are we on now?" is always answered. A per-page call is more
   * co-located but fails silently in one direction: a page that forgets to make the call
   * inherits the PREVIOUS page's title, so a visitor navigating from Italy to the passport page
   * would keep a tab labelled Italy. Nothing on screen looks wrong.
   *
   * It takes the pathname rather than `country` because it also has to name the home page, the
   * route overview and the 404 — pages that have no country at all. The mapping from a pathname
   * to a title and description lives in src/lib/meta.js, which is a pure function and holds the
   * long note about why a HashRouter site's static defaults matter more than its dynamic ones.
   */
  useDocumentMeta(location.pathname)

  return (
    <>
      {/*
       * SKIP LINK — the first focusable element on the page.
       *
       * A keyboard or screen-reader visitor otherwise has to Tab through the entire
       * navigation on every single page before reaching the content. This link is
       * invisible until focused, then appears as a normal button. It is a WCAG
       * requirement (2.4.1 Bypass Blocks) and one of the highest-value accessibility
       * features per line of code in existence.
       */}
      <a
        href="#main-content"
        className="sr-only-focusable absolute left-4 top-4 z-[60] rounded-md bg-surface-card px-4 py-3 text-sm font-medium text-ink-900 shadow-elev-2"
      >
        Skip to content
      </a>

      <ScrollToTop />
      <ScrollProgressBar />
      <SiteHeader />

      {/*
       * `<main>` marks the primary content landmark — there must be exactly one per page.
       *
       * The top padding clears the fixed header; without it the header would overlap the top
       * of every page. It reads `--header-height` rather than hard-coding `pt-16` so the
       * value has exactly one definition. A full-height section (the home hero) has to
       * subtract this same number to fit the remaining viewport, and two independent copies
       * of "64px" is precisely how that kind of bug survives.
       */}
      <main id="main-content" className="pt-(--header-height)">
        {/*
         * The `key` prop is doing real work here.
         *
         * React reuses a component instance when it appears in the same position across
         * renders. Changing the `key` tells React "this is a different thing now" — so it
         * discards the old instance and mounts a fresh one. That is what makes the entry
         * animation replay on every navigation. Without the key, Framer Motion would see
         * the same mounted component and animate nothing.
         */}
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>

      <SiteFooter />

      {/*
       * THERE WAS A FIXED BOARDING PASS PINNED HERE, AND IT HAS BEEN RETIRED. Recording why, because
       * `src/components/journey/BoardingPass.jsx` still exists and the next person to find it will
       * reasonably wonder whether its absence is an accident.
       *
       * IT WAS THE SITE'S SECOND PROGRESS METAPHOR, AND THE WEAKER ONE. It showed five stop rows
       * filling in, in the bottom-right corner of every country page. The journal now does that job —
       * five stamp slots, blank until pressed — and it does it as the object the whole story is about
       * rather than as a widget in a corner. Two objects both answering "how far in am I", in two
       * different visual languages, was the specific thing that made the site read as a dashboard with
       * a story on it instead of a story.
       *
       * AND IT WAS THE ONE ELEMENT LEFT THAT COULD LIE. Its stamps came from `country.arrivalOrder <=
       * current.arrivalOrder` — arrive at Italy from a shared link and it asserted Japan and India had
       * been visited too. `src/lib/journal.js` exists precisely to stop the site making that claim; a
       * fixed panel restating it on every country page undid the guarantee everywhere at once.
       *
       * NOTHING IT CARRIED IS NOW UNAVAILABLE. "Stop 2 of 5" is stated in words in the arrival eyebrow
       * and again in the header; the five stops as a record are the journal, on the home page and the
       * passport; every country is a real link in the header nav. The pass was also `hidden md:block`,
       * so phones never had it in the first place — which is the strongest evidence that no
       * information depended on it.
       *
       * THE FILE IS LEFT IN PLACE RATHER THAN DELETED. It is unreferenced and therefore not in the
       * bundle (Vite tree-shakes an unimported module out entirely), and it holds a long argued note
       * about the traveller's presence that several other files cite by name. Deleting it would cost
       * that reasoning and save nothing shipped.
       */}
    </>
  )
}
