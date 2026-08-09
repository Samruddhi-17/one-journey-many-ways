import worldMap from '../data/worldMap.json'

/*
 * flight.js — the geometry and the timing of a flight, with no rendering.
 *
 * ============================================================================================
 * WHY THIS IS NOT INSIDE FlightMap.jsx
 *
 * Two reasons, and the second is the one that made it a separate file.
 *
 *   1. THE DEPARTURE BAND NEEDS THE DURATION WITHOUT NEEDING THE MAP. It schedules a navigation
 *      for the moment the plane lands, so it has to know how long the flight runs. Importing that
 *      number from the component that draws the plane means the two can never disagree — a
 *      hand-typed 3100 in the caller is a value that silently stops matching the moment the
 *      animation is retimed, and the symptom (a route change mid-flight) reads as a broken
 *      animation rather than as a stale constant.
 *
 *   2. A MODULE THAT EXPORTS BOTH A COMPONENT AND A FUNCTION BREAKS FAST REFRESH. Vite's React
 *      plugin can hot-replace a module whose exports are all components; one that also exports a
 *      plain function has to be treated as arbitrary code, so editing it does a full page reload
 *      and loses component state. That is a real cost during development on a site whose main
 *      interaction is expanding panels — every edit closes all of them. The linter flags it, and
 *      the fix is the separation that was already justified by reason one.
 *
 * WHAT THIS FILE KNOWS AND WHAT IT DOES NOT. It knows where the stops are and what shape a leg is.
 * It knows nothing about colour, motion, accessibility or React. Everything here is a pure function
 * of the generated map data.
 * ============================================================================================
 */

/*
 * THE STOP LOOKUP, built once at module load.
 *
 * The map data's order matches the itinerary today, but keying by slug rather than trusting the
 * index means a reordered itinerary cannot silently fly the plane to the wrong country.
 *
 * The positions themselves come from scripts/generateMap.mjs, which projects each country's actual
 * latitude and longitude from the workbook through `geoNaturalEarth1`. Nothing downstream — this
 * file included — ever sees a coordinate or decides where a country is, which is how the standing
 * rule against eyeballed geometry is upheld by construction rather than by care.
 */
const STOPS_BY_SLUG = new Map(worldMap.stops.map((stop) => [stop.slug, stop]))

/*
 * How long one leg takes, in seconds.
 *
 * NOT SCALED BY THE ATMOSPHERE PACE, which is a deliberate exception to the rule that governs every
 * other duration in the project. A flight belongs to neither country it connects: it is the gap
 * between two atmospheres, and scaling it by the departing country's pace would make leaving Italy
 * slower than leaving India — a claim about Italy that the moment does not support. The neutral
 * shell owns this moment, and the shell is silent.
 */
export const LEG_SECONDS = 2.6

/*
 * A flight accelerates away and decelerates into its destination, so the easing is symmetrical
 * rather than the project's usual ease-out. An ease-out curve would have the plane at full speed the
 * instant it leaves the ground and crawling for most of the crossing, which reads as running out of
 * momentum rather than as arriving.
 *
 * Exported so the trail and the plane share one definition. If those two ever disagree, the plane
 * detaches from the end of its own trail — the most visible possible bug in this animation.
 */
export const FLIGHT_EASE = [0.32, 0, 0.28, 1]

/*
 * The curve from one stop to another, as an SVG path.
 *
 * `Q` is a quadratic Bézier: one control point, which the curve bends toward without passing
 * through. The control point sits at the midpoint of the two stops, lifted upward by a fraction of
 * the horizontal distance.
 *
 * WHY A CURVE AND NOT A STRAIGHT LINE. A straight line between two pins reads as a connection — a
 * diagram of a relationship. A curve reads as a path taken, because that is the shape of every
 * flight path anyone has seen on a seat-back screen. It is emphatically NOT a great-circle route and
 * is never labelled as one; this project makes no claim about distance, bearing or flight time,
 * because the workbook's own distance figures are unusable (it states 7,800 km between Italy and
 * Switzerland, where the real coordinates give 649 km) and inventing a replacement would be worse
 * than dropping the metric.
 *
 * WHY LIFTED BY THE HORIZONTAL SPAN AND NOT BY A FIXED AMOUNT. A fixed 60px bow is a graceful arc
 * across the Pacific and an absurd loop between Italy and Switzerland, whose pins are eleven pixels
 * apart. Deriving it means one formula is correct for every pair on this itinerary and for any pair
 * a future itinerary might add.
 *
 * `Math.abs` because the journey runs east to west, so `to.x - from.x` is negative on every leg.
 * Without it every arc would bow downward, which looks like a descent rather than a flight.
 *
 * The minimum keeps the very short hops from being drawn as an almost-flat line, which would read as
 * a hyphen between two dots rather than as a journey.
 */
export function arcBetween(from, to) {
  const span = Math.abs(to.x - from.x)
  const lift = Math.max(24, span * 0.28)
  const controlX = (from.x + to.x) / 2
  const controlY = (from.y + to.y) / 2 - lift
  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`
}

/**
 * A route of slugs turned into drawable legs, with any unknown stop dropped.
 *
 * A MISSING STOP IS A DATA PROBLEM AND THE HONEST RESPONSE IS TO DRAW LESS, NOT TO THROW. The map
 * without a flight still shows the visitor where they are, and a chapter should not white-screen
 * because one slug is unknown. Dropping the single leg rather than the whole route also means a
 * five-stop itinerary with one bad entry still traces the four legs it can.
 */
export function legsFor(route) {
  const legs = []
  for (let index = 0; index < route.length - 1; index += 1) {
    const from = STOPS_BY_SLUG.get(route[index])
    const to = STOPS_BY_SLUG.get(route[index + 1])
    if (!from || !to) continue
    legs.push({ key: `${route[index]}-${route[index + 1]}`, from, to, path: arcBetween(from, to) })
  }
  return legs
}

/**
 * How long a route takes to fly, in milliseconds.
 *
 * Derived from the legs that will actually be drawn rather than from `route.length`, so a route
 * carrying an unknown slug reports the shorter time it is genuinely going to take. A caller waiting
 * on a flight that was silently one leg shorter would navigate late — visible as a pause on a
 * finished animation.
 */
export function flightDurationMs(route, legSeconds = LEG_SECONDS) {
  return legsFor(route).length * legSeconds * 1000
}
