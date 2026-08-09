import { Link } from "react-router-dom";
import { COUNTRIES, TOTAL_STOPS } from "../../data/countries";
import { spellOut } from "../../lib/spellOut";
import { useVisited } from "../../hooks/useJournal";

/*
 * SiteFooter — the quiet close of every page.
 *
 * WHY THE FOOTER IS SO RESTRAINED
 * A footer is where sites usually put everything they could not place elsewhere. On a
 * storytelling site that is actively harmful: a dense link farm at the end of a country
 * page competes with the "Continue to India" invitation that is supposed to pull the
 * visitor forward (DESIGN_SYSTEM.md §10.5). So this footer carries only the itinerary,
 * an honest note about the data, and nothing else.
 *
 * WHY THE DATA NOTE IS HERE AT ALL
 * Principle 17: honest about what we don't know. A visitor who wonders where these
 * numbers came from should find an answer without hunting, and admitting the limits of
 * a dataset builds more trust than silent confidence.
 *
 * A CONTRAST BUG FIXED HERE, AND WHY IT SURVIVED SO LONG
 * The "The Route" heading and the bottom credit line were `ink-400` on `surface-sunken`,
 * which measures 3.40:1 at 12px — below the 4.5:1 that normal-size text requires. Both are
 * now `ink-500` (5.25:1 on this surface).
 *
 * tokens.css already labels ink-400 "large/UI text ONLY, never body", so the rule existed
 * and was simply not followed. What is interesting is why nobody caught it: until the home
 * page had a section below the fold, no screenshot was ever tall enough to include the
 * footer, so every contrast measurement silently skipped it. The bug was not subtle — it
 * was merely never in frame. Which is the argument for measuring whole rendered pages
 * rather than the component you happen to be working on.
 *
 * ============================================================================================
 * THE ROUTE LIST WITHHOLDS UNVISITED NAMES, and the footer is where forgetting to do that would
 * have cost the most.
 *
 * The five stops are hidden until the visitor reaches them (see the `SIGNPOST` note in
 * src/data/voice.js). This footer is on EVERY page, below the fold, listing all five in order — which
 * makes it the single most complete answer on the site and the easiest one to overlook, for exactly the
 * reason the contrast bug above went unnoticed: nobody screenshots the bottom of the page. The signpost
 * and both navs were gated first and this list would have quietly undone all three.
 *
 * An unvisited stop shows its stop number, which is what every other withheld slot on the site shows —
 * the signpost, both navs and the journal all print the same label. The flag goes with the name; it
 * identifies a country faster than the word does.
 *
 * IT SHOWED THE ISO CODE FIRST, WHICH LEAKED. `USA` is not a concealed "United States" and `JPN`, `IND`
 * and `ITA` are the opening letters of the words they were hiding — so this list quietly answered the
 * question on every page of the site while looking like it was keeping a secret. See HiddenName's note
 * for the full argument and for why a DOM search for the five names reported no problem.
 *
 * WHAT DOES NOT CHANGE: five real links to five real pages in itinerary order, never sorted
 * (PRODUCT_VISION.md §7.4). Nothing here is a gate; a visitor who wants the list is one click from it.
 * ============================================================================================
 */
export function SiteFooter() {
  const visited = useVisited();

  return (
    <footer className="mt-24 border-t border-ink-200 bg-surface-sunken">
      <div className="mx-auto max-w-(--container-content) px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1fr_auto]">
          <div className="max-w-(--container-prose)">
            <p className="font-display text-2xl text-ink-900 md:text-3xl">
              One Journey. Many Ways of Living.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-500">
              {/* Spelled out, and derived from the itinerary rather than typed — see
                  src/lib/spellOut.js. This sentence appears on every page of the site, so it
                  is the worst possible place for a count that can quietly go stale. */}
              A journey through {spellOut(TOTAL_STOPS)} countries, exploring how
              people live, thrive and connect. Figures describe national
              averages drawn from a single dataset and are best read as
              impressions rather than precise measurements — averages flatten
              the variation that makes each place interesting.
            </p>
          </div>

          {/* The itinerary again — in order, never sorted (PRODUCT_VISION.md §7.4). */}
          <nav aria-label="Countries">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
              The Route
            </h2>
            <ul className="mt-4 space-y-2">
              {COUNTRIES.map((country) => {
                /*
                 * The visit record, not the itinerary — the same distinction the signpost and both navs
                 * make, for the reason set out in src/lib/journal.js.
                 *
                 * There is no `|| isActive` counterpart here, unlike the two navs. `Link` gives no active
                 * flag (only `NavLink` does), and the flicker that check exists to prevent cannot happen
                 * in a footer: it is below the fold on arrival, so the one frame before the visit is
                 * recorded is a frame nobody is looking at. Adding `useLocation` to fix an invisible
                 * frame would be a re-render on every navigation for no perceivable gain.
                 */
                const isVisited = visited.includes(country.slug);

                return (
                  <li key={country.slug}>
                    <Link
                      to={`/${country.slug}`}
                      className="group flex items-center gap-2 text-sm text-ink-700 transition-colors hover:text-[var(--accent-ink)]"
                    >
                      {isVisited ? (
                        <>
                          <span aria-hidden="true">{country.flag}</span>
                          <span>{country.name}</span>
                        </>
                      ) : (
                        /*
                         * `w-14` on the label so the five rows share one left edge whichever state they
                         * are in. Without it a revealed row's flag and a withheld row's label start the
                         * text at different offsets and the list looks ragged rather than partly filled.
                         *
                         * The `sr-only` half states the status — the same phrasing the signpost and the
                         * navs use, and deliberately without the country's name. See HiddenName's
                         * accessibility note on why a screen-reader user gets the surprise rather than a
                         * spoiler.
                         */
                        <span className="inline-flex w-14 justify-start font-medium uppercase tracking-[0.1em] tabular-nums">
                          {`Stop ${country.arrivalOrder}`}
                          <span className="sr-only">, not yet visited</span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-ink-200 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Analyticon 2026</p>
          <p>Built with React, Vite and Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}
