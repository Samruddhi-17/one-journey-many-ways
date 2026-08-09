import { useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { COUNTRIES, TOTAL_STOPS } from '../../data/countries'
import { codeFor } from '../../lib/countryCode'
import { PLANE_PATH, PLANE_VIEWBOX } from '../../lib/planeGlyph'

/*
 * BoardingPass — RETIRED. Not rendered anywhere. Read this note before wiring it back in.
 *
 * ============================================================================================
 * IT IS UNREFERENCED ON PURPOSE, AND THE FILE IS KEPT ON PURPOSE.
 *
 * Nothing imports this. It was pinned to the corner of every country page from `SiteLayout`, and that
 * render was removed deliberately — the note where it used to sit carries the full argument. In short:
 *
 *   1. IT WAS THE SITE'S SECOND PROGRESS METAPHOR. The journal — five stamp slots, blank until
 *      pressed — now carries the journey's shape, as the object the story is actually about. Two
 *      widgets answering "how far in am I" in two visual languages is what made the site read as a
 *      dashboard with a story on it.
 *
 *   2. IT COULD LIE, AND WAS THE LAST THING THAT COULD. `isStamped` below reads
 *      `country.arrivalOrder <= current.arrivalOrder`, so opening Italy from a shared link asserted
 *      that Japan and India had been visited. `src/lib/journal.js` exists precisely to stop the site
 *      making claims about where the visitor has been that the visitor did not earn. ANYONE
 *      REINSTATING THIS MUST REPLACE THAT LINE WITH `useVisited()` — it is not a detail, it is the
 *      reason the element went.
 *
 * WHY IT IS STILL HERE. An unimported module is tree-shaken out of the bundle entirely, so it costs
 * nothing shipped, and the note below is the site's fullest record of the "I cannot see the traveller"
 * exchange and what was tried in answer to it. Several other files cite that reasoning by name.
 *
 * Everything from here down describes the component as it was when it rendered, and is left unedited
 * as the record. It is history, not current behaviour.
 *
 * ============================================================================================
 * WHAT THIS WAS FOR: A RUNNING RECORD OF THE JOURNEY.
 *
 * The traveller spoke on arrival, was quoted inside the facets, and then vanished for the rest of the
 * chapter — so for most of the time on screen there was no sign of the trip's shape or how far into
 * it the visitor had come. This is that record: five stop rows filling in as the journey proceeds.
 *
 * A CORRECTION TO WHAT THIS COMMENT USED TO CLAIM. It read that the pass shows the traveller's
 * LUGGAGE instead of the traveller, because §3.4's "no name, no face, no biography" made depicting
 * them unavailable. That was wrong on the facts: five illustrations of the traveller shipped with the
 * project and were rendered nowhere, because the data pipeline had them behind an exclusion pattern
 * whose comment misdescribed them. The visitor asked to see the traveller, this was the answer given,
 * and they asked again in the same words. They are now depicted — see TravellerFigure, and the
 * Session 4 amendment to §3.4 for where the line between an anonymous figure and a character sits.
 *
 * WHY THIS STILL EXISTS, then, rather than being deleted along with its reasoning. It was chosen
 * explicitly by the visitor when asked what form the traveller's presence should take, and it does a
 * job the figure does not: it answers "how far in am I" continuously, in the periphery, without
 * scrolling. A figure is company; this is orientation. The passenger line reading YOU is still
 * §3.4's actual point rather than a workaround for it.
 *
 * WHAT IT SHOWS, AND WHY EACH PART EARNS ITS SPACE
 *   · Five stop rows, filling in as the journey proceeds. This is the thing the visitor was missing:
 *     a persistent record that they are four countries into something.
 *   · The current stop, marked. Answers "where am I" without the visitor scrolling up to the cover.
 *   · The stops as three-letter codes. Airport-code shorthand is doing real work at this size — it
 *     is the only way five country names fit in a corner without truncation, and it is the notation
 *     the object being imitated actually uses.
 *
 * WHY IT IS IN THE LAYOUT AND NOT ON THE COUNTRY PAGE, even though it only ever appears on one.
 *
 * It must NOT remount when the route changes. `SiteLayout` deliberately keys `PageTransition` on the
 * pathname so each arrival replays its entry animation — anything rendered inside that is destroyed
 * and rebuilt on every navigation. A pass that remounts re-stamps its whole history at each stop,
 * which reads as the record being rewritten rather than added to. Living above the routed content is
 * what makes it persistent, the same reason the header does not flicker.
 *
 * So the country page is the wrong home for it for a structural reason, not because it is shown
 * anywhere else. It is shown on country routes only; the two exclusions are argued at the early
 * return below.
 *
 * WHY IT IS NOT A LINK. It is a record, not navigation. The route navigation in the header and the
 * passport page both already offer every country as a real link, so nothing here is unreachable, and
 * making a status display clickable invites the visitor to try to use it as a control.
 *
 * ACCESSIBILITY: it is a real `<ol>` with real text, not a graphic, so a screen-reader user gets
 * "Boarding pass — list, 5 items — JPN Japan / IND India (current stop) / …" and then "Stop 2 of 5"
 * from the markup itself, with no ARIA beyond the landmark label. The parts that ARE hidden are the
 * ones that carry nothing a sighted visitor gets either: the plane glyph, the stamps and hollow
 * rings (whose meaning is stated in text by the `sr-only` "(current stop)" and by the stop line), and
 * the perforation. The rule throughout is that anything conveying information does so as text.
 * ============================================================================================
 */

/*
 * THE THREE-LETTER CODES USED TO BE DECLARED HERE, and moved to src/lib/countryCode when the
 * passport page needed the same five values for its stamps. The reasoning that used to sit here —
 * why they are ISO country codes rather than airport codes, and why a hand-authored table beats a
 * derivation — moved with them, because it is an argument about the data rather than about this
 * component. Two copies of a lookup table is how two parts of a site come to disagree.
 */

/*
 * The stamp — how an arrival is marked, and the pass's one moment of drama.
 *
 * A rotation, a scale from oversize down to rest, and a spring that settles rather than easing. That
 * combination is what a rubber stamp does: it lands hard, off-square, and does not bounce back
 * neatly. An eased fade would read as the interface highlighting a row, which is the opposite of the
 * intended reading — this should look like something that happened to a physical object.
 *
 * The slight permanent rotation at rest is the important half. A stamp that settles perfectly
 * straight looks like a checkbox; three degrees off is what makes it look pressed by hand.
 */
const STAMP = {
  hidden: { opacity: 0, scale: 1.9, rotate: -18 },
  visible: { opacity: 1, scale: 1, rotate: -3 },
}

export function BoardingPass() {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()

  const slug = location.pathname.replace(/^\//, '')
  const current = COUNTRIES.find((country) => country.slug === slug)

  /*
   * NOT RENDERED OFF A COUNTRY PAGE.
   *
   * The home page is the invitation and the passport page is already a full-page version of exactly
   * this information — a pass in the corner of either would be a duplicate of what the visitor is
   * looking at. It appears when the visitor is somewhere, which is when "where am I in this journey"
   * is a question they can have.
   *
   * Returning null after the hooks, never before: hooks must run in the same order on every render,
   * so an early return above `useReducedMotion` would break on the first navigation to a country.
   * This is the single most common way a conditional render introduces a hooks bug.
   */
  if (!current) return null

  return (
    /*
     * `fixed` and pinned bottom-right, above the content but below the header's mobile sheet.
     *
     * WHY BOTTOM-RIGHT. Top-right is the header. Bottom-left is where browsers put the link-target
     * tooltip. Bottom-right is the one corner that is both persistently empty and out of the reading
     * path — text runs left-to-right and top-to-bottom, so the bottom-right corner is the last place
     * the eye goes, which is correct for something meant to be noticed and not read.
     *
     * `hidden md:block` — NOT SHOWN ON PHONES, and this is a real decision rather than an oversight.
     * A 200px panel fixed over a 375px-wide viewport covers a sixth of the screen permanently and
     * would sit on top of the facet cards the visitor is trying to press. The passport page carries
     * the same information in full at every width, and the arrival states the stop in words ("Stop 2
     * of 5"), so nothing is only available here. An ornament that obstructs content on the most
     * common screen size is not worth the atmosphere it adds.
     */
    <motion.aside
      aria-label="Boarding pass"
      className="pointer-events-none fixed bottom-6 right-6 z-40 hidden w-[13.5rem] md:block"
      /*
       * The pass slides in from the right edge once, on the first country the visitor reaches — the
       * object arriving rather than appearing. It does not replay on later navigations because this
       * component never unmounts (see the header note), so `initial` runs a single time per session.
       */
      initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
      animate={prefersReducedMotion ? false : { opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
    >
      <div
        /*
         * `pointer-events-none` on the wrapper and nothing re-enabling it here: the pass is not
         * interactive, and a non-interactive fixed panel that swallows clicks is a trap for anything
         * beneath it. Stated on the outer element so it covers the whole pass including its shadow.
         */
        className="rounded-xl border border-ink-200 bg-surface-card/95 p-4 shadow-elev-2 backdrop-blur-md"
      >
        {/*
         * THE STUB HEADER — the label, and the plane that marks it as a boarding pass at a glance.
         *
         * The glyph is literally the same path the flight map flies, imported from one place rather
         * than typed out again here. It was duplicated once, with a comment in each copy asserting
         * they matched — which is the kind of claim only a shared import can keep.
         */}
        <div className="flex items-center justify-between border-b border-dashed border-ink-200 pb-3">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-500">
            Boarding pass
          </p>
          <svg viewBox={PLANE_VIEWBOX} className="size-4 text-[var(--accent-ink)]" aria-hidden="true">
            <path d={PLANE_PATH} fill="currentColor" />
          </svg>
        </div>

        {/*
         * THE PASSENGER LINE, and it says YOU.
         *
         * This is where §3.4 is honoured rather than circumvented. A pass with a name on it makes
         * the traveller a person and the visitor a reader of somebody else's ticket. A pass issued
         * to the visitor makes the whole object an assertion that they are the one travelling —
         * which is the vision's actual requirement, and this is the one element on the site that
         * states it outright.
         */}
        <dl className="mt-3 flex items-baseline justify-between gap-2">
          <dt className="text-[0.625rem] uppercase tracking-[0.12em] text-ink-500">Passenger</dt>
          <dd className="font-display text-sm font-semibold tracking-wide text-ink-900">You</dd>
        </dl>

        {/*
         * `<ol>` because this is a sequence and the numbers carry information — the same choice as
         * the home page's itinerary, and the opposite of the facet list, which is a `<ul>` precisely
         * because it has no correct order. The markup should say which of those is true.
         */}
        <ol className="mt-4 space-y-1.5">
          {COUNTRIES.map((country) => {
            const isCurrent = country.slug === current.slug
            /*
             * `<=` rather than `<`: the country you are standing in has been arrived at, so it is
             * stamped. Derived from the itinerary rather than tracked in state for the same reason
             * the flight map's filled pins are — the countries are an itinerary, not a menu, so
             * anyone at stop N arrived through stops 1..N. Nothing to lose on a refresh, and no
             * second source of truth about where the visitor has been.
             */
            const isStamped = country.arrivalOrder <= current.arrivalOrder

            return (
              <li
                key={country.slug}
                className="flex items-center gap-2.5"
                /*
                 * The row carries its own country's accent as a custom property, which is how a
                 * runtime value reaches a Tailwind arbitrary-value utility: Tailwind compiles
                 * classes by scanning source text, so `text-[${ink}]` is a class that never gets
                 * generated and silently does nothing, while `text-[var(--row-ink)]` is a fixed
                 * string it can see with only the value being dynamic.
                 */
                style={{ '--row-ink': country.atmosphere.ink }}
              >
                {/*
                 * THE STAMP SLOT. Fixed width whether or not it holds a mark, so the codes stay in
                 * a column — a list that reflows as rows fill in reads as the layout being unstable
                 * rather than as a record being completed.
                 */}
                <span className="relative flex size-4 shrink-0 items-center justify-center">
                  {isStamped ? (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: 'var(--row-ink)' }}
                      variants={STAMP}
                      initial={prefersReducedMotion ? false : 'hidden'}
                      animate={prefersReducedMotion ? false : 'visible'}
                      /*
                       * A spring rather than a duration, because a stamp's motion is governed by how
                       * hard it lands rather than by how long it takes. Low damping so it overshoots
                       * and settles; `stiffness` high enough that the whole thing is over in about
                       * 400ms, since this fires on arrival and must not still be moving when the
                       * visitor starts reading.
                       *
                       * Only the CURRENT stop's stamp is delayed. The earlier ones were stamped on
                       * previous visits, so they should already be there — a pass that re-stamps its
                       * whole history on every arrival reads as the record being rewritten.
                       */
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 12,
                        delay: isCurrent ? 0.9 : 0,
                      }}
                    />
                  ) : (
                    /*
                     * An unstamped stop is a hollow ring, not a paler dot. State is carried by FILL
                     * rather than by hue or opacity, so it survives greyscale and colour-blind
                     * vision — the same rule the flight map's pins and the header nav follow.
                     */
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-full border border-ink-300"
                    />
                  )}
                </span>

                <span
                  className={[
                    'font-display text-xs font-semibold tabular-nums tracking-[0.08em] transition-colors duration-500',
                    isStamped ? 'text-[var(--row-ink)]' : 'text-ink-500',
                  ].join(' ')}
                >
                  {codeFor(country)}
                </span>

                {/*
                 * The country's name, and the only place a full name appears on the pass. Truncated
                 * rather than wrapped: a two-line row would break the vertical rhythm of the list
                 * for one country ("United States"), and the code beside it already identifies it
                 * unambiguously.
                 */}
                <span
                  className={[
                    'min-w-0 flex-1 truncate text-[0.6875rem] transition-colors duration-500',
                    isStamped ? 'text-ink-700' : 'text-ink-500',
                  ].join(' ')}
                >
                  {country.name}
                </span>

                {/*
                 * THE CURRENT-STOP MARKER, in words for a screen reader and as a dot for everyone
                 * else.
                 *
                 * The `sr-only` text is what makes the list mean something without the colours: a
                 * screen-reader user hears "IND India current" and knows where they are. Without it
                 * they would hear five identical rows, since "stamped" is conveyed purely visually.
                 */}
                {isCurrent ? (
                  <>
                    <span className="sr-only">(current stop)</span>
                    <motion.span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: 'var(--row-ink)' }}
                      /*
                       * A slow pulse — the pass's only continuous motion, and the only element on
                       * the site permitted one.
                       *
                       * It is here because a static record cannot distinguish "you are here" from
                       * "you have been here" without relying on colour alone, and a pulse says
                       * "now" the way nothing static can. Opacity only, so it is composited and
                       * costs nothing; two and a half seconds, which is slow enough to read as
                       * breathing rather than as blinking. `linear` is correct for a continuous
                       * loop — one of the two cases where the project's rule against it does not
                       * apply, the other being a cross-fade.
                       */
                      animate={prefersReducedMotion ? false : { opacity: [1, 0.25, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </>
                ) : null}
              </li>
            )
          })}
        </ol>

        {/*
         * THE PERFORATION — the tear-off line every boarding pass has.
         *
         * Purely decorative, and it needs no `aria-hidden` because it is a dashed border rather than
         * an element: a border is invisible to assistive technology already, and marking the wrapper
         * hidden would take the stop line below it with it. It is here because it is the detail that
         * makes the object read as a ticket rather than as a progress widget with rounded corners,
         * and the whole point of the pass is that it is a thing the traveller is carrying.
         */}
        <div className="mt-4 border-t border-dashed border-ink-200 pt-3 text-center">
          {/*
           * THE WHOLE PASS USES `ink-500` AS ITS QUIETEST TEXT, AND NOT `ink-400`.
           *
           * The first draft of this component reached for `ink-400` for everything secondary — this
           * line, the unstamped stop rows, the "Passenger" label. That is a contrast failure, and the
           * ink scale says so on its own definition: `ink-400` is 3.65:1 and marked "large/UI text
           * ONLY, never body". Every one of those places is 10–11px, which needs 4.5:1. `ink-500` is
           * 5.63:1 and is the smallest step that passes.
           *
           * Worth recording because of how the mistake nearly survived: small grey text on a small
           * ornament looks correct, the token has an approved-sounding name, and nothing warns. The
           * scale's own comment was the check.
           */}
          <p className="text-[0.625rem] uppercase tracking-[0.14em] text-ink-500">
            {/*
             * The counts as digits here, deliberately, where the site's prose spells them out. This
             * is a printed stub, and a ticket that read "stop two of five" would be a ticket nobody
             * has ever held. The rule the project actually follows is "said, spell it; shown, show
             * it" — this is shown.
             */}
            Stop {current.arrivalOrder} of {TOTAL_STOPS} <span aria-hidden="true">·</span>{' '}
            {current.days}
          </p>
        </div>
      </div>
    </motion.aside>
  )
}
