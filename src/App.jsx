import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { SiteLayout } from './components/layout/SiteLayout'

/*
 * THE FOUR PAGES ARE LOADED LAZILY. Everything else on this site is imported normally;
 * these four are the exception, and the reason is worth writing down because
 * code-splitting is easy to apply where it does not pay.
 *
 * WHAT `lazy` DOES. `import('./pages/HomePage')` — with parentheses, not the static
 * `import ... from` form — is a *dynamic* import. It returns a promise, so the module is
 * fetched when it is first needed rather than being welded into the main bundle. Vite sees
 * one of these and emits that module, plus anything only it uses, as a separate file.
 * `lazy()` wraps that promise so React can render the component once it arrives.
 *
 * The `.then(m => ({ default: m.HomePage }))` is plumbing, not meaning: `lazy` expects a
 * module whose DEFAULT export is the component, and these pages use named exports (the
 * project's convention everywhere). Rather than add a default export to four files to suit
 * one API, the shape is adapted here, at the single point that cares.
 *
 * WHY IT IS WORTH IT HERE, MEASURED. Before: one 425.19 kB chunk (133.83 kB gzipped),
 * which meant a visitor landing on /japan also downloaded the home page, the passport page
 * and the 404 before anything could render. After:
 *
 *     shared        370.81 kB  (119.63 kB gzip)   React, Router, Framer Motion, the shell
 *     CountryPage    36.64 kB  ( 10.13 kB gzip)   arrival, living, culture, reflection, charts
 *     HomePage       14.49 kB  (  5.03 kB gzip)   hero, introduction, route map
 *     PassportPage    1.78 kB
 *     NotFoundPage    0.94 kB
 *     Button/Reveal   2.09 kB                     shared between pages, so split out again
 *
 * So the first paint on any route now skips the other routes' code. It is a real
 * improvement and a modest one — and the honest framing is that the 371 kB shared chunk is
 * the floor, because React, Router and Framer Motion are needed by every route and cannot
 * be split away by this technique. Splitting moved ~54 kB; the biggest weight on this site
 * is neither of those, it is 2.5 MB of photographs.
 *
 * WHY THE LAYOUT IS *NOT* LAZY. SiteLayout is the header, footer, nav and page transition —
 * it renders on every route without exception. Splitting a module that is always needed
 * makes things strictly worse: same bytes, one extra network round trip before anything
 * appears.
 *
 * WHY `fallback={null}` AND NOT A SPINNER. `Suspense` renders the fallback while a lazy
 * chunk is in flight. These chunks are 1–37 kB from the same origin as the page, so that
 * window is a few milliseconds on a normal connection. A spinner appearing and vanishing
 * inside 40ms is a flash of anxiety, not feedback — and on a slow connection the layout's
 * header and footer are already painted, so the page is visibly present and loading rather
 * than blank. If these chunks ever grow enough to need one, the honest fix is a skeleton
 * matching the page's shape, not a spinner.
 *
 * Note the Suspense boundary sits OUTSIDE `<Routes>`, so it is not remounted on every
 * navigation, and the layout stays mounted while the next page's chunk arrives.
 */
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const CountryPage = lazy(() =>
  import('./pages/CountryPage').then((m) => ({ default: m.CountryPage })),
)
const PassportPage = lazy(() =>
  import('./pages/PassportPage').then((m) => ({ default: m.PassportPage })),
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

/*
 * App — the route table. This is the map of the entire site in one screen.
 *
 * WHAT ROUTING IS
 * A single-page application downloads one HTML file and then swaps content in and out
 * itself. Routing is the machinery that keeps the URL bar honest about which content is
 * showing — so Back works, links are shareable, and a country page can be bookmarked.
 *
 * WHY `HashRouter` AND NOT `BrowserRouter`
 * This is a deployment constraint, not a preference (architectural decision 5).
 *
 * BrowserRouter produces clean URLs like `/japan`. When a visitor loads that URL directly,
 * the browser asks the server for a file at the path `/japan`. A normal server rewrites
 * every unknown path to index.html and lets React handle it. GitHub Pages does not — it is
 * a static file host, finds no `/japan` file, and returns its own 404. Every direct link
 * and every refresh would break.
 *
 * HashRouter puts the route after a `#`: `/#/japan`. Everything after the hash is never
 * sent to the server by design — it was invented for in-page anchors. So GitHub Pages
 * always receives a request for `/`, always serves index.html, and React reads the hash.
 *
 * The cost is a `#` in the URL. The benefit is that every link works on the host we are
 * actually deploying to. Correctness beats cosmetics.
 *
 * WHAT A LAYOUT ROUTE IS
 * The outer `<Route element={<SiteLayout />}>` has no `path`. It contributes no URL
 * segment — it exists only to wrap its children in shared chrome. The child routes render
 * into SiteLayout's `<Outlet />`. This is what gives every page the same header, footer and
 * page transition without any page importing them.
 */
function App() {
  return (
    <HashRouter>
      {/* See the note above the lazy() calls for why the boundary is here and why the
          fallback is null rather than a spinner. */}
      <Suspense fallback={null}>
        <Routes>
          <Route element={<SiteLayout />}>
            {/* `index` means "the parent's path exactly" — here, `/`. */}
            <Route index element={<HomePage />} />

            <Route path="passport" element={<PassportPage />} />

            {/*
             * A named route for wrong turns, so CountryPage can redirect an unknown slug
             * somewhere real rather than rendering an error inline.
             *
             * ORDER NOTE: React Router v6+ ranks routes by specificity, not by source order,
             * so the static `passport` and `not-found` paths win over the dynamic
             * `:countrySlug` automatically. This used to be a genuine footgun in older
             * versions, where `:countrySlug` declared first would have swallowed both.
             */}
            <Route path="not-found" element={<NotFoundPage />} />

            {/*
             * The dynamic country route. One route and one component serve all five
             * countries; the slug selects the data.
             *
             * Deliberately at the root (`/japan`, not `/country/japan`). The URL is part of
             * the experience — `/#/japan` reads like a place, `/#/country/japan` reads like
             * a database path.
             */}
            <Route path=":countrySlug" element={<CountryPage />} />

            {/*
             * `*` is the catch-all. It matches anything no other route did — which after the
             * dynamic route above means multi-segment URLs like `/a/b`.
             *
             * NOTE: there is no `/compare` route. Its absence is a decision, not an
             * oversight: whether a comparison experience adds value is revisited after the
             * core journey is complete.
             */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
