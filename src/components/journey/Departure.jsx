import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Section } from '../ui/Section'
import { Reveal } from '../ui/Reveal'
import { Button } from '../ui/Button'
import { FlightMap } from './FlightMap'
import { flightDurationMs } from '../../lib/flight'
import { departureLines } from '../../data/voice'
import { COUNTRIES } from '../../data/countries'
import { useVisited } from '../../hooks/useJournal'

/*
 * Departure — the traveller proposes the next country, and the visitor flies there.
 *
 * ============================================================================================
 * WHAT THIS REPLACES
 *
 * A "Next stop: India · [Continue to India]" band. It worked, and it was a website telling you
 * where the next page was. The journey's own premise is that the ORDER matters — arriving in India
 * the morning after Japan is a different experience from arriving there first — and a band with a
 * button conveys none of that. Crossing the map does, because the visitor watches the distance
 * happen.
 *
 * THE SEQUENCE, AND WHY IT HAS THREE STATES RATHER THAN TWO
 *
 *   idle      The map is still, both stops visible, the traveller asks the question.
 *   flying    The trail draws, the plane crosses, the destination's name fades up.
 *   navigate  The route changes and the next chapter's arrival plays.
 *
 * The middle state is the one worth defending, because the efficient build has two: click, navigate,
 * animate the arrival. That version is faster and it throws away the only moment in the product
 * where the visitor feels the journey's geography. Two and a half seconds is the entire cost, it
 * happens once per country, and it is the difference between five pages and one trip.
 *
 * WHY THE NAVIGATION IS DELAYED IN JAVASCRIPT RATHER THAN DONE WITH A ROUTE TRANSITION
 * A framer-motion `AnimatePresence` exit animation on the route would be the idiomatic React answer
 * and it cannot work here: the flight belongs to the page being LEFT, and an exit animation runs
 * while the leaving page is unmounting — so the map would be torn down mid-flight. The flight has to
 * complete before the route changes, which means the component that owns the flight has to own the
 * navigation. Hence the timer.
 *
 * WHAT MAKES THAT TIMER SAFE is the cleanup below, and it is not a formality: a visitor who presses
 * "Fly to India" and then immediately uses the browser's Back button unmounts this component with a
 * pending `navigate` call queued. Without the cleanup, that call fires half a second later and drags
 * them to India from wherever they went — a genuinely disorienting bug, and one that only appears
 * for a visitor who changes their mind.
 * ============================================================================================
 */

/*
 * The beat held at the destination after the plane lands, before the route changes.
 *
 * Landing and cutting in the same frame reads as a page load that happened to be preceded by an
 * animation. Half a second is enough to register an arrival and short enough not to be a wait.
 *
 * NOT SCALED BY THE ATMOSPHERE PACE, which is a deliberate exception to the rule that governs every
 * other duration in the project. The flight belongs to neither country: it is the gap between two
 * atmospheres, and scaling it by the departing country's pace would make leaving Italy slower than
 * leaving India — a claim about Italy that the moment does not support. The neutral shell owns this
 * moment, and the shell is silent.
 *
 * THE FLIGHT'S OWN LENGTH IS NOT TYPED HERE. It is asked of FlightMap via `flightDurationMs`, which
 * derives it from the same constant the animation itself uses. A hand-typed total is a number that
 * silently stops matching the moment the animation is retimed, and the symptom — a route change
 * while the plane is still in the air — looks like a broken animation rather than a stale constant.
 */
const LANDING_BEAT_MS = 500

export function Departure({ from, to }) {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const [flying, setFlying] = useState(false)

  /*
   * The timer handle, in a ref rather than in state.
   *
   * A ref because nothing renders from it — it exists only so the cleanup can cancel it. Putting it
   * in state would trigger a re-render every time a flight started, for a value the UI never reads.
   * This is the same ref-versus-state line the route map's marker measurement sits on: a handle is a
   * ref, a value the output depends on is state.
   */
  const timerRef = useRef(null)

  const lines = departureLines(from, to)

  /*
   * WHERE THE VISITOR HAS BEEN, for the map's filled pins.
   *
   * NOW READ FROM THE JOURNAL RATHER THAN DERIVED FROM THE ITINERARY, and the previous comment here
   * is worth quoting because it argued the opposite and named its own cost: "It is also honest about
   * the one case it gets 'wrong' — a visitor who lands directly on /italy from a shared link is shown
   * Japan and India as visited, because the site's claim is about the journey's structure rather than
   * about that person's browser history."
   *
   * That was defensible while the site made no claim about the visitor. It is not defensible now: the
   * journal's whole argument is that it started empty and filled as YOU went, and a map that pins two
   * countries you have never opened is the site telling you about your own trip and being wrong. The
   * cost the old comment accepted has become the thing being fixed.
   *
   * ORDERED BY ARRIVAL RATHER THAN BY VISIT ORDER, which is the one place the journal's own ordering
   * is deliberately discarded. These are pins on a map, and a map has no sequence — it either has a
   * pin or it does not. The visit order matters where the record is read as a record (the passport),
   * not where it is read as a geography.
   */
  const visited = useVisited()
  const travelled = COUNTRIES.filter((country) => visited.includes(country.slug)).map(
    (country) => country.slug,
  )

  /*
   * The leg to fly, as a route of two. FlightMap takes a route rather than a from/to pair so the
   * home page can trace the whole itinerary with the same component — see its header note.
   */
  const route = [from.slug, to.slug]

  useEffect(() => {
    /* Cancel any pending navigation when this component goes away. See the header note. */
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function depart() {
    /*
     * REDUCED MOTION SKIPS THE FLIGHT ENTIRELY rather than playing a faster one.
     *
     * A visitor who has asked their system to stop animating things has not asked for a brisk
     * animation — and a three-second wait with no visible movement is worse than either option,
     * because it is an unexplained delay. They get the destination immediately.
     */
    if (prefersReducedMotion) {
      navigate(`/${to.slug}`)
      return
    }

    /*
     * Guard against a second press. Without it, an impatient double-click queues two timers and two
     * navigations — harmless in effect but it restarts the flight animation from zero on the second
     * press, which looks like the first press failed.
     */
    if (flying) return

    setFlying(true)
    timerRef.current = setTimeout(
      () => navigate(`/${to.slug}`),
      flightDurationMs(route) + LANDING_BEAT_MS,
    )
  }

  return (
    <Section
      surface="sunken"
      width="content"
      ariaLabelledBy="departure-heading"
      /*
       * `relative isolate` — the map is positioned inside this section and must not escape it.
       * `isolate` creates a stacking context so the map's negative z-index stays behind this
       * section's content and does not fall behind the section's own background, which is the
       * classic symptom of a negative z-index with no isolating ancestor.
       */
      className="relative isolate overflow-hidden"
    >
      {/*
       * THE MAP, as a backdrop rather than as a figure.
       *
       * WHY IT SITS BEHIND THE TEXT INSTEAD OF ABOVE IT. As a figure with a caption, the map becomes
       * a thing to look at and the question becomes a caption underneath it. Behind the text, the
       * question is the content and the geography is the room it is asked in — which is the right
       * relationship, because the visitor's decision is "shall we go" and not "where is India".
       *
       * `opacity-70` on the idle map, full when flying: the map quietly comes forward at the moment
       * it becomes the thing happening. A transition rather than a swap, so the change is felt
       * without being watched.
       */}
      <div
        className={[
          'pointer-events-none absolute inset-0 -z-10 transition-opacity duration-700',
          flying ? 'opacity-100' : 'opacity-70',
        ].join(' ')}
      >
        <FlightMap route={route} playing={flying} travelled={travelled} />
      </div>

      {/*
       * `min-h` so the section keeps its height whether the idle question or the in-flight caption
       * is showing. Without it the page jumps by the height difference at the moment of departure —
       * a layout shift underneath a moving graphic, which is the worst possible time for one.
       */}
      <div className="relative flex min-h-[22rem] flex-col justify-center md:min-h-[26rem]">
        {/*
         * `AnimatePresence` with `mode="wait"` — the departing content finishes leaving before the
         * arriving content starts entering.
         *
         * WHAT `AnimatePresence` IS (framer-motion concept): React unmounts a component the instant
         * it stops being rendered, which leaves no opportunity to animate it out. AnimatePresence
         * keeps a removed child in the tree until its exit animation finishes, then removes it. The
         * `key` is how it knows a swap happened — same key, same element; different key, one left and
         * one arrived.
         *
         * `mode="wait"` rather than the default: overlapping two blocks of centred text means both
         * are half-transparent and mid-slide at the same moment, on top of each other, which reads as
         * a glitch rather than a transition.
         */}
        <AnimatePresence mode="wait">
          {flying ? (
            /*
             * IN FLIGHT. Two short lines and nothing else.
             *
             * Nobody reads a paragraph over a moving map, and anything longer would be an
             * instruction to wait. This is the one moment in the product where the correct amount of
             * copy is almost none.
             */
            <motion.div
              key="inflight"
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              /*
               * `aria-live="polite"` — announces this to a screen reader when it appears, without
               * interrupting whatever is being read.
               *
               * NECESSARY BECAUSE THE MAP IS `aria-hidden`. A sighted visitor sees a plane crossing
               * an ocean; without this, a screen-reader user presses a button and then experiences
               * three seconds of nothing followed by an unexplained page change. The live region is
               * how that visitor is told the same thing the animation tells everyone else.
               */
              aria-live="polite"
            >
              <p className="font-display text-[clamp(1.75rem,5vw,3rem)] font-semibold leading-tight text-ink-900">
                {lines.boarding}
              </p>
              <p className="mt-4 text-lg text-ink-500">{lines.inflight}</p>
            </motion.div>
          ) : (
            /* IDLE — the traveller asks, and the visitor decides. */
            <motion.div
              key="idle"
              initial={false}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="max-w-[36rem]"
            >
              <Reveal>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">
                  {lines.eyebrow}
                </p>
              </Reveal>

              <Reveal delay={0.08}>
                {/*
                 * A QUESTION AS THE HEADING, which is the one editorial decision in this component.
                 *
                 * "Next stop: India" is a signpost — the interface stating a fact about its own
                 * structure. "Shall we go to India next?" is a companion asking, and the visitor's
                 * answer is the button. It is also the sentence that makes the flight feel like a
                 * consequence of a decision rather than a transition the site plays at them.
                 */}
                <h2
                  id="departure-heading"
                  className="mt-4 font-display text-[clamp(1.75rem,4.5vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.015em] text-ink-900"
                >
                  {lines.question}
                </h2>
              </Reveal>

              <Reveal delay={0.16}>
                <p className="mt-5 text-lg leading-[1.6] text-ink-700">{lines.reason}</p>
              </Reveal>

              <Reveal delay={0.24}>
                {/*
                 * `onClick` rather than `to` — this is an action, not a link, because it starts an
                 * animation and navigates afterwards. Button renders a real `<button>` when given
                 * onClick, so it is keyboard-operable by Enter and Space with no extra handling.
                 *
                 * THE HONEST TRADE-OFF, recorded because it is a real accessibility cost rather than
                 * a neutral choice: a `<button>` cannot be opened in a new tab, and it does not
                 * appear in a screen reader's links list. The alternative — a link with
                 * `preventDefault` and a delayed navigation — keeps those affordances and is a link
                 * that lies about what it does when activated normally. Given that the destination is
                 * reachable as a real link from both the header route navigation and the passport
                 * page, nothing is unreachable; this is the one control on the site where the
                 * animation is the point.
                 */}
                <Button onClick={depart} size="lg" className="mt-9 w-full sm:w-auto">
                  {lines.action}
                </Button>
              </Reveal>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  )
}
