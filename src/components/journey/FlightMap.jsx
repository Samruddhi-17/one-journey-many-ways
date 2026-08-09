import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import worldMap from '../../data/worldMap.json'
import { legsFor, LEG_SECONDS, FLIGHT_EASE } from '../../lib/flight'

/*
 * FlightMap — a real world map with a plane crossing it, along one leg or the whole itinerary.
 *
 * ============================================================================================
 * THE MAP IS REAL, AND THAT IS THE WHOLE POINT
 *
 * `land` is Natural Earth's public-domain 1:110m coastline, projected with `geoNaturalEarth1` by
 * scripts/generateMap.mjs at build time. `stops` are the five countries' actual latitudes and
 * longitudes from the workbook, run through the identical projection. No pin was placed by eye,
 * and none could be: this component never sees a coordinate, only the pixel positions the
 * projection produced.
 *
 * That matters because this project has a standing rule against decorative geometry — a hand-placed
 * pin *looks* like a measurement, so nobody checks it. The rule is upheld by construction here
 * rather than by care: there is no code path in this file that could put a country in the wrong
 * place, because there is no code in this file that decides where a country is.
 *
 * WHAT THE MAP DELIBERATELY DOES NOT CLAIM
 * No distances, no bearings, no flight times, no scale bar. The dataset's own distance figures are
 * unusable (it claims 7,800 km between Italy and Switzerland; real coordinates give 649 km) and
 * rather than pick one, this project drops the metric — a decision recorded in the generated JSON
 * itself, not just in a comment. The arcs below are drawn as curves because a curve reads as
 * travel; they are emphatically not great-circle routes and are not labelled as such.
 *
 * WHY IT TAKES A ROUTE RATHER THAN A FROM AND A TO
 * Two callers need this map and they want different lengths of the same thing: the departure band
 * flies one leg (Japan → India), and the home page traces the entire itinerary in one pass. A
 * component with `fromSlug`/`toSlug` serves the first and cannot serve the second, so the home page
 * would have grown its own near-identical map — which is how two maps end up disagreeing about
 * where India is. A route of length two is one leg; a route of length five is the journey.
 *
 * WHERE THE GEOMETRY AND THE TIMING LIVE
 * In src/lib/flight.js, not here. The departure band has to know how long a flight runs so it can
 * schedule the navigation that follows it, and it should not have to import a component to find out.
 * That file also explains the arc shape and why no distance is ever claimed. This one is only the
 * drawing.
 *
 * WHY THIS IS AN `<svg>` AND NOT A CHART LIBRARY
 * Same reasoning as every other visual in the project: this is a handful of paths, five circles and
 * a triangle. Rendering it directly means it inherits the country's accent from CSS variables,
 * animates with the same motion primitives as everything else, and needs no text alternative
 * because the surrounding markup already says where the visitor is going in words.
 * ============================================================================================
 */

export function FlightMap({
  /*
   * The itinerary to fly, in order, as slugs. Two entries is one leg; five is the whole journey.
   */
  route = [],
  /* Whether the flight is running. Idle shows the map and the pins with no trail and no plane. */
  playing = false,
  /* Which stops the visitor has already been to — drawn solid rather than hollow. */
  travelled = [],
  legSeconds = LEG_SECONDS,
}) {
  const prefersReducedMotion = useReducedMotion()

  /*
   * `useId` — React's hook for a value guaranteed unique across the document, and the correct tool
   * for SVG element ids.
   *
   * WHY THIS IS NOT OPTIONAL. The gradients below are referenced by `url(#id)`, and SVG ids are
   * global to the document, not scoped to the component. Two FlightMaps on one page with hardcoded
   * ids would mean the second one's definitions silently override the first's — a bug that appears
   * only when a component is reused, which is exactly when nobody is looking for it. This component
   * now has two callers and one of them draws four legs, so that is four ids on one map.
   */
  const uid = useId().replace(/[^\w-]/g, '')

  const legs = legsFor(route)

  /*
   * Every stop the route touches is "in play" and gets the larger marker and the halo. Derived from
   * the route rather than passed in, so the emphasis cannot disagree with the arcs being drawn.
   */
  const inRoute = new Set(route)

  return (
    <svg
      viewBox={worldMap.viewBox}
      /*
       * `aria-hidden` with no title or description.
       *
       * Everything this graphic conveys — which country we are leaving, which we are arriving in —
       * is stated in text by the component that renders it, immediately beside it. An SVG given a
       * `<title>` here would make a screen-reader user hear the same country names twice, the
       * second time without the sentence that gave them meaning. Decorative is the truthful answer;
       * see the same decision in LivingBackdrop.
       */
      aria-hidden="true"
      className="h-full w-full"
      /*
       * `preserveAspectRatio` at its default ("xMidYMid meet") is what makes the fixed 960×480
       * viewBox scale to any container without distorting the coastlines. A stretched projection is
       * a projection nobody chose, which would undo the reasoning behind picking Natural Earth in
       * the first place.
       */
    >
      <defs>
        {/*
         * One gradient per leg — transparent at the origin, solid at the destination.
         *
         * WHY A GRADIENT RATHER THAN A FLAT STROKE: the trail is not a route diagram, it is the
         * memory of a movement, and a movement fades behind whatever made it. A flat line of
         * uniform weight reads as infrastructure — a rail link that exists whether or not anyone is
         * travelling on it.
         *
         * `gradientUnits="userSpaceOnUse"` with the actual stop coordinates, rather than the default
         * objectBoundingBox: the default maps the gradient to the path's bounding BOX, so for an arc
         * bowing upward the gradient would run diagonally across a rectangle rather than along the
         * line of travel. Stating the endpoints in user space makes the fade follow the flight.
         */}
        {legs.map((leg) => (
          <linearGradient
            key={leg.key}
            id={`trail-${uid}-${leg.key}`}
            gradientUnits="userSpaceOnUse"
            x1={leg.from.x}
            y1={leg.from.y}
            x2={leg.to.x}
            y2={leg.to.y}
          >
            <stop offset="0%" stopColor="var(--accent-mark)" stopOpacity="0.05" />
            <stop offset="55%" stopColor="var(--accent-mark)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--accent-mark)" stopOpacity="0.95" />
          </linearGradient>
        ))}
      </defs>

      {/*
       * THE LAND. One path containing every landmass, filled rather than stroked.
       *
       * `ink-100` at 1.18:1 against the page is deliberately almost invisible, and that is the
       * correct weight for it. The map is a stage, not the subject: a strongly drawn world map makes
       * the visitor read geography — squinting at whether that shape is Turkey — when the only thing
       * they need to perceive is that a great distance is being crossed. Everything carrying meaning
       * (the stops, the trail, the plane) uses the country's validated accent and therefore stands
       * clear of this.
       *
       * WCAG 1.4.11 requires 3:1 for non-text content, but only for content "required to understand
       * the information". Nothing here is: the destination is named in text beside the map, and the
       * map is `aria-hidden`.
       */}
      <path d={worldMap.land} fill="var(--color-ink-100)" />

      {/*
       * THE STOPS — drawn beneath the trails so the flight crosses over them.
       *
       * This is the part that makes the map a record rather than a diagram: by the fifth country
       * there are four filled pins behind the plane, and the visitor can see the journey they have
       * actually taken. `travelled` is passed in rather than derived here, because "where has this
       * visitor been" is a question about the session, not about geography.
       */}
      {worldMap.stops.map((stop) => {
        const active = inRoute.has(stop.slug)
        const visited = travelled.includes(stop.slug)

        return (
          <g key={stop.slug}>
            {/*
             * A soft halo on the stops in play, so they read as active without changing size — a pin
             * that grows is a pin whose position has become ambiguous.
             */}
            {active ? (
              <circle cx={stop.x} cy={stop.y} r="9" fill="var(--accent-mark)" opacity="0.16" />
            ) : null}

            <circle
              cx={stop.x}
              cy={stop.y}
              r={active ? 4 : 3}
              /*
               * State is carried by FILL, not by hue: visited and in-play stops are solid, the rest
               * are hollow. That survives greyscale printing and colour-blind vision, which is the
               * same rule the route markers and the header navigation follow. Colour here is
               * confirmation, never the carrier.
               */
              fill={visited || active ? 'var(--accent-mark)' : 'var(--color-surface-page)'}
              stroke="var(--accent-mark)"
              strokeWidth="1.5"
            />
          </g>
        )
      })}

      {legs.map((leg, index) => {
        /*
         * Each leg waits for the one before it, so a four-leg route is flown in sequence rather
         * than all at once. One leg means no delay at all, which is why the departure band needs no
         * special case.
         */
        const delay = index * legSeconds
        const isFinalLeg = index === legs.length - 1

        return (
          <g key={leg.key}>
            {/*
             * THE TRAIL, drawn by the plane as it flies.
             *
             * `pathLength="1"` normalises the path's length to 1 regardless of its actual geometry,
             * so `strokeDasharray`/`strokeDashoffset` can be animated from 0 to 1 as a fraction.
             * Without it, drawing a line on requires measuring the path in JavaScript with
             * `getTotalLength()` and passing pixel values in — which works, and then breaks the
             * moment the SVG is scaled to a different container size. This is the reason the
             * technique is worth knowing: it makes a line-drawing animation resolution-independent
             * with one attribute.
             *
             * `strokeDashoffset: 1 → 0` reveals the stroke from its start. The dash array is a
             * single dash the full length of the path, so there is no repeating pattern — just one
             * segment being uncovered.
             */}
            <motion.path
              d={leg.path}
              pathLength="1"
              fill="none"
              stroke={`url(#trail-${uid}-${leg.key})`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="1"
              initial={{ strokeDashoffset: prefersReducedMotion ? 0 : 1 }}
              animate={{ strokeDashoffset: playing || prefersReducedMotion ? 0 : 1 }}
              transition={{
                duration: prefersReducedMotion ? 0 : legSeconds,
                ease: FLIGHT_EASE,
                delay: prefersReducedMotion ? 0 : delay,
              }}
            />

            {/*
             * THE PLANE.
             *
             * `offsetPath`/`offsetDistance` — the CSS Motion Path API. Setting `offsetPath` to the
             * same `path()` string the trail uses makes the browser position this element along that
             * curve, at a fraction given by `offsetDistance`, and — crucially — ROTATE it to the
             * curve's tangent automatically. Animating a plane along an arc by hand means computing
             * the Bézier position and its derivative on every frame in JavaScript; this is the same
             * result declaratively, animated on the compositor.
             *
             * `offsetRotate: 'auto 0deg'` is what supplies the rotation. The glyph below is drawn
             * pointing right (along +x), which is what `auto` expects as the zero orientation, so
             * the nose follows the flight path with no correction angle. Draw the glyph pointing up
             * and every plane on the site is 90° wrong — worth stating, because the symptom is a
             * plane flying sideways, which looks like a rotation bug rather than an asset bug.
             *
             * WHY A `<g>` WRAPPER AND NOT THE PATH DIRECTLY: `offsetPath` positions the element's
             * own origin, so the glyph must be drawn centred on (0,0) for its nose to sit on the
             * curve. The wrapper carries the motion; the child carries the shape and its centring.
             */}
            <motion.g
              style={{
                offsetPath: `path("${leg.path}")`,
                offsetRotate: 'auto 0deg',
              }}
              initial={{ offsetDistance: '0%', opacity: 0 }}
              animate={
                playing
                  ? {
                      offsetDistance: '100%',
                      /*
                       * ONE PLANE IN THE AIR AT A TIME, and this is what enforces it.
                       *
                       * Every leg renders its own plane, so on a four-leg route all four exist from
                       * the first frame. Left at a constant opacity they would sit parked on their
                       * origins waiting their turn, which reads as four aircraft on the tarmac
                       * rather than one journey. Keyframes give each plane a window: it appears as
                       * its leg begins and leaves as the next one takes over.
                       *
                       * The final leg's plane keeps its opacity at the end instead of vanishing —
                       * it has landed, and the arrival is the thing the visitor is meant to see.
                       * A plane that disappears on touchdown reads as a cut, not a landing.
                       */
                      opacity: isFinalLeg ? [0, 1, 1] : [0, 1, 1, 0],
                    }
                  : { offsetDistance: '0%', opacity: prefersReducedMotion ? 1 : 0 }
              }
              transition={{
                offsetDistance: {
                  duration: prefersReducedMotion ? 0 : legSeconds,
                  ease: FLIGHT_EASE,
                  delay: prefersReducedMotion ? 0 : delay,
                },
                opacity: {
                  duration: prefersReducedMotion ? 0 : legSeconds,
                  delay: prefersReducedMotion ? 0 : delay,
                  /*
                   * `times` places each keyframe as a fraction of the duration, so the fade in and
                   * the handover both take a fraction of a leg rather than a fixed number of
                   * seconds. Stated relatively because a caller can change `legSeconds`, and a
                   * 0.3s fade is a tenth of a slow leg and half of a fast one.
                   */
                  times: isFinalLeg ? [0, 0.06, 1] : [0, 0.06, 0.94, 1],
                  ease: 'linear',
                },
              }}
            >
              {/*
               * The plane itself: a small triangle with a notched tail, drawn centred on the origin
               * and pointing along +x.
               *
               * A path rather than an emoji (✈️) for the same reason the country flags were dropped
               * from display type: an emoji renders in the operating system's own font, at a size
               * and weight nobody here chose, and it cannot take the country's accent colour. This
               * is nine coordinates and it is typeset by us.
               */}
              <path
                d="M 7 0 L -5 -4.5 L -2.5 0 L -5 4.5 Z"
                fill="var(--accent-ink)"
                stroke="var(--color-surface-page)"
                strokeWidth="0.75"
                /*
                 * A page-coloured hairline around the glyph, so the plane stays legible where it
                 * crosses its own trail and the darker landmasses. Cheaper and steadier than a drop
                 * shadow, which would need a filter and would blur at small sizes.
                 */
              />
            </motion.g>
          </g>
        )
      })}
    </svg>
  )
}
