/*
 * planeGlyph.js — the shape of the aeroplane, and nothing else.
 *
 * ============================================================================================
 * WHY THIS IS ITS OWN FILE RATHER THAN A CONSTANT IN flight.js
 *
 * Two places draw this plane: the flight map, and the boarding pass stub. It used to be typed out
 * in both, and the comment in each said "the same path the other one uses" — an assertion the code
 * had no way to keep true. One shared export makes it true by construction.
 *
 * The obvious home was flight.js, since both files already sit near it, but that import has a cost
 * that is easy to miss: flight.js imports the generated world map, so anything that reads a constant
 * from it pulls the whole of worldMap.json along. The boarding pass has no business depending on the
 * coordinates of five cities in order to draw a 16px icon. This file imports nothing.
 *
 * It is also a different kind of geometry. flight.js knows where the stops are and what shape a leg
 * is — facts about the journey, derived from data. This is a drawing, and it is not derived from
 * anything.
 *
 * A path rather than an emoji (✈️), for the same reason the country flags were dropped from display
 * type: an emoji renders in the operating system's own font, at a size and weight nobody here chose,
 * and it cannot take the country's accent colour.
 * ============================================================================================
 */

/*
 * An airliner seen from above: rounded nose, swept wings, tailplane.
 *
 * TWO PROPERTIES OF THESE COORDINATES ARE LOAD-BEARING, AND BREAKING EITHER LOOKS LIKE A BUG
 * SOMEWHERE ELSE.
 *
 *   1. IT POINTS ALONG +x. The flight map positions the plane with CSS Motion Path and
 *      `offsetRotate: 'auto 0deg'`, which rotates the element to the tangent of the curve — and the
 *      tangent is measured from the +x axis. A glyph drawn nose-up is ninety degrees wrong at every
 *      point of every leg, which reads as a broken rotation rather than as a mis-drawn asset.
 *
 *   2. IT IS CENTRED ON (0, 0). Motion Path places the element's anchor on the curve, so an
 *      off-centre glyph flies beside its own trail instead of along it, and pivots about a point
 *      outside itself when the curve bends.
 *
 * The extent is x ∈ [-8.4, 8.4], y ∈ [-5.9, 5.9] — hence PLANE_VIEWBOX below. It was drawn to stay
 * legible at about 13px, which is the size it renders at on the map beside pins of radius 3 to 4;
 * a wider wingspan blurred into a single mass at that scale.
 */
export const PLANE_PATH =
  'M 8.4 0 C 8.4 -0.85 7.2 -1.25 5.6 -1.3 L 1.9 -1.35 L -1.5 -5.9 L -3.2 -5.9 L -1.4 -1.3 ' +
  'L -4.6 -1.15 L -6.5 -3.2 L -7.6 -3.2 L -7.1 -0.9 C -8.1 -0.7 -8.4 -0.35 -8.4 0 ' +
  'C -8.4 0.35 -8.1 0.7 -7.1 0.9 L -7.6 3.2 L -6.5 3.2 L -4.6 1.15 L -1.4 1.3 L -3.2 5.9 ' +
  'L -1.5 5.9 L 1.9 1.35 L 5.6 1.3 C 7.2 1.25 8.4 0.85 8.4 0 Z'

/*
 * A viewBox for drawing the glyph on its own, with a little air around it so the hairline stroke on
 * the map version is not clipped. Not used by the flight map, which draws the path into the map's own
 * coordinate system.
 */
export const PLANE_VIEWBOX = '-9 -6.5 18 13'
