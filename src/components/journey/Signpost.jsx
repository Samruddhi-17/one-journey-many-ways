import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { HiddenName } from "./HiddenName";
import { JOURNEY } from "../../data/journey";
import { useVisited } from "../../hooks/useJournal";

/*
 * Signpost — the five stops as a trail marker, with each name withheld until it is earned.
 *
 * ============================================================================================
 * WHAT THIS IS AND WHY IT IS NOT AN IMAGE
 *
 * The design reference has a photographic wooden signpost with the five country names carved into
 * the planks. This is that object rebuilt in HTML, and the reason is not preference: the names have
 * to CHANGE. A plank reads as a stop number before the visitor goes there and as a country name
 * afterwards, which a flat image cannot do — and the names in the reference artwork are baked into
 * its pixels, alongside five landmark icons that give the same answer a second time.
 *
 * The rebuild also buys the things an image of text never has: the names are selectable, they scale
 * with the type system, they are real links with real focus rings, and a screen reader gets them.
 * An `<img>` of five destinations would need all five in its `alt` text, which would hand over the
 * secret in the one place nobody thinks to check.
 *
 * WHY IT IS AN `<ol>` AND NOT A `<nav>`. It is an itinerary — an ordered list of five stops that
 * happen to be links — and the page already has a navigation landmark in the header. A second
 * landmark competing with it would mean a screen-reader user cycling landmarks hits "navigation"
 * twice and has to inspect both to find out which is the site's. Ordered, because the order is the
 * route and that is the one thing the list genuinely asserts.
 *
 * ============================================================================================
 * THE ROW MUST NOT MOVE WHEN A NAME IS REVEALED, which is the layout constraint the whole
 * component is built around.
 *
 * A visitor comes back from Japan to a signpost whose first plank has changed. If that plank changes
 * HEIGHT, the four planks below it shift down, and the reveal reads as the page breaking rather than
 * as a stamp landing. So both states are pinned to one height (`PLANK_HEIGHT`) and the withheld label
 * is set from the SAME type scale as the name that replaces it — see the `HiddenName` call below,
 * where the two class lists are deliberately identical but for the colour. This is the same argument
 * as the journal's fixed-height stamp slot, and it is here for the same reason: two states of one slot
 * must occupy identical space, or the object stops being one object.
 *
 * WHY THE PLANKS ARE STAGGERED. Their left edges step in and out by a few percent, which is what a
 * real signpost looks like and is also doing a quiet job: five identical rectangles read as a
 * table, and a table of five countries is a comparison. The stagger is derived from the index and is
 * therefore not a fact about any country — see `PLANK_OFFSETS`.
 * ============================================================================================
 */

/*
 * Every plank is exactly this tall, in both states. See the note above on why.
 *
 * `rem` rather than `px` so it tracks the root type size, and a `clamp` so it can be shorter on a
 * phone without a breakpoint — the plank holds one line of type, which already scales continuously.
 */
const PLANK_HEIGHT = "clamp(3.25rem, 6vw, 4.25rem)";

/*
 * How far each plank's left edge is pushed in, as a percentage of the signpost's width.
 *
 * Indexed by POSITION, not by country — the same reasoning as `ROTATIONS` in PassportStamp. It says
 * "the fourth plank sits furthest in", never "Switzerland sits furthest in", so nothing here is a
 * statement about a place and a sixth country would simply start the cycle again.
 *
 * The values are small (0–7%) because the planks also carry an arrow point on their right edge, and a
 * larger stagger starts to look like a bar chart — five horizontal bars of visibly different lengths
 * is a ranking, whatever the lengths mean.
 */
const PLANK_OFFSETS = [0, 4, 1.5, 7, 2.5];

/*
 * And a hair of rotation each, for the same reason the stamps have it: a stack of perfectly
 * horizontal planks reads as a UI component, and nothing nailed to a post by hand is ever level.
 * Kept under 1° — past that the arrow points stop looking parallel and the whole post looks broken
 * rather than weathered.
 */
const PLANK_TILTS = [-0.6, 0.4, -0.3, 0.7, -0.5];

export function Signpost({ className = "" }) {
  const prefersReducedMotion = useReducedMotion();
  const visited = useVisited();

  return (
    <div className={`relative ${className}`}>
      {/*
       * THE POST, behind the planks.
       *
       * A gradient rather than a photograph of wood: it is 12px wide on screen, so a texture would be
       * unreadable at that width and would cost a request to deliver four visible pixels. The three
       * stops give it a lit edge, a body and a shadowed edge, which is all that reads at this size.
       *
       * `aria-hidden` — it is the stationery. The list beside it carries every fact.
       */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-[8%] top-6 w-3 rounded-sm md:w-3.5"
        style={{
          background:
            "linear-gradient(90deg, #7a6248 0%, #a3835f 38%, #8b6f50 72%, #5f4b36 100%)",
          boxShadow: "0 1px 3px rgba(26,24,21,0.28)",
        }}
      />

      <ol className="relative space-y-2.5 md:space-y-3">
        {JOURNEY.map((country, index) => {
          /*
           * THE ONE CONDITION IN THIS COMPONENT, and it reads the visit record rather than the
           * itinerary. `visited.includes(slug)` is a fact about what the visitor did;
           * `arrivalOrder <= current` would be a fact about the route pretending to be one about them.
           * That distinction is the whole reason src/lib/journal.js exists — see its header note, and
           * the note in SiteLayout on the boarding pass that got this wrong.
           */
          const isRevealed = visited.includes(country.slug);

          return (
            <li
              key={country.slug}
              style={{
                marginLeft: `${PLANK_OFFSETS[index % PLANK_OFFSETS.length]}%`,
              }}
            >
              {/*
               * A `motion.div` wrapping the link rather than a `motion(Link)`: the transform belongs
               * to the plank and the link owns the interaction, and keeping them on separate elements
               * means a focus ring is drawn on an untransformed box. A ring on a rotated element is
               * rotated too, which looks like a rendering error at these small angles.
               *
               * The reveal animation is a settle, not an entrance — the plank is already there, and
               * what changed is what is written on it. So it scales from 1.04 rather than fading in
               * from nothing: a fade would read as the plank arriving, and it did not arrive.
               *
               * `key` on the inner content is what makes this fire at the right moment. Without it
               * React reuses the element and framer-motion sees no mount, so the settle never plays.
               */}
              <motion.div
                initial={false}
                animate={{ rotate: PLANK_TILTS[index % PLANK_TILTS.length] }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "10% 50%" }}
              >
                <Link
                  to={`/${country.slug}`}
                  className="group block focus-visible:outline-none"
                  style={{ height: PLANK_HEIGHT }}
                >
                  {/*
                   * THE PLANK FACE.
                   *
                   * `clip-path` cuts the arrow point on the right edge. A rotated square pseudo-element
                   * was the alternative and it cannot work here: the plank has a background gradient
                   * and a shadow, and a rotated tab would need both to line up across the seam at every
                   * width. A clip path cuts the whole shape, gradient included, in one declaration.
                   *
                   * The cost of `clip-path` is that it clips the box shadow too, so the shadow is drawn
                   * on the parent `<li>`'s child wrapper instead — which is why there is a shadow
                   * `filter` on this element rather than a `box-shadow`. `drop-shadow` follows the
                   * clipped silhouette, which a box-shadow does not.
                   */}
                  <span
                    className={[
                      /*
                       * `relative` so the nail heads below can position against this face. Without a
                       * positioned ancestor they would resolve against the nearest one up the tree —
                       * the signpost wrapper — and all ten nails would stack in one corner.
                       */
                      "relative flex h-full items-center gap-3 pl-[13%] pr-8 md:gap-4",
                      "transition-transform duration-300 ease-out",
                      "group-hover:translate-x-1 group-focus-visible:translate-x-1",
                      /*
                       * ==================================================================
                       * THE FOCUS RING IS AN *INSET* SHADOW, AND THAT IS THE ONLY THING THAT WORKS HERE.
                       *
                       * It was `ring-2 ring-[#3d2f1d]`, which drew nothing at all. Verified rather than
                       * guessed: tabbing to a plank in the browser gave `:focus-visible` matching true
                       * on the link and a computed `box-shadow` of `rgba(0,0,0,0) 0 0 0 0` on this face,
                       * with one stray ring-coloured pixel along its top edge. A keyboard visitor had no
                       * visible focus indicator on the five main links of the cover — a 2.4.7 failure,
                       * and an invisible one, because a mouse never reveals it.
                       *
                       * THE CAUSE IS THE `clip-path` BELOW. Tailwind's `ring` is an OUTER box-shadow, and
                       * an outer shadow is painted outside the element's box — which is exactly the
                       * region `clip-path` removes. The same declaration that cuts the arrow point also
                       * cuts the entire ring. This is the same interaction the shadow note below records
                       * (a `box-shadow` had to become a `drop-shadow` `filter` for the same reason), so
                       * the trap was already documented in this file and the ring still walked into it.
                       *
                       * An inset shadow is painted INSIDE the box, so the clip keeps it — and it follows
                       * the silhouette for free, which is what the old `ring-offset`-absent note was
                       * reaching for. `#3d2f1d` measures 5.17:1 against the darkest wood a bar sits on,
                       * well past the 3:1 a focus indicator needs.
                       * ==================================================================
                       */
                      "group-focus-visible:shadow-[inset_0_0_0_3px_#3d2f1d]",
                    ].join(" ")}
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 1.75rem) 0, 100% 50%, calc(100% - 1.75rem) 100%, 0 100%)",
                      background:
                        "linear-gradient(177deg, #d8c2a0 0%, #c9ae87 34%, #bfa179 68%, #ab8b62 100%)",
                      filter: "drop-shadow(0 2px 4px rgba(26,24,21,0.26))",
                    }}
                  >
                    {/*
                     * Two nail heads, because a plank fixed to a post has fasteners and their absence
                     * is the specific thing that makes a CSS wood plank look like a beige rectangle.
                     * Decorative, so `aria-hidden`.
                     */}
                    <span
                      aria-hidden="true"
                      className="absolute left-[8%] top-1/2 flex -translate-y-1/2 flex-col gap-[0.9rem]"
                    >
                      <span className="size-1.5 rounded-full bg-[#4a3a26] opacity-70 shadow-[inset_0_-1px_1px_rgba(255,255,255,0.35)]" />
                      <span className="size-1.5 rounded-full bg-[#4a3a26] opacity-70 shadow-[inset_0_-1px_1px_rgba(255,255,255,0.35)]" />
                    </span>

                    {/*
                     * ==========================================================================
                     * THE SWAP. Stop number before, carved name after.
                     *
                     * Both branches sit in the same flex slot at the same height, so the plank does
                     * not resize — see the header note on why that matters more than it sounds.
                     *
                     * THE INK IS THE SAME DARK BROWN IN BOTH STATES, not the country's accent. The
                     * accent is the reward the passport stamp pays out; carving a plank in Japan's
                     * blue would put a second, different colour language on the home page and would
                     * mean the five planks are five colours — which reads as a legend, and a legend
                     * over five countries reads as a comparison. `#3d2f1d` on the plank's lightest
                     * stop (#d8c2a0) measures 8.6:1, so it clears 4.5:1 with a wide margin in both
                     * states and at every gradient stop.
                     * ==========================================================================
                     */}
                    {isRevealed ? (
                      <motion.span
                        key="revealed"
                        initial={
                          prefersReducedMotion
                            ? false
                            : { scale: 1.05, opacity: 0.4 }
                        }
                        animate={
                          prefersReducedMotion
                            ? false
                            : { scale: 1, opacity: 1 }
                        }
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="font-display text-[clamp(1.05rem,2.4vw,1.6rem)] font-semibold uppercase tracking-[0.06em] text-[#3d2f1d]"
                        /*
                         * A soft inner shadow so the letters read as cut into the wood rather than
                         * printed on it. Two offsets: a dark one down-right for the groove's shaded
                         * wall and a light one up-left for its lit lip. This is the whole "carved"
                         * effect, and it is two shadows rather than a texture.
                         */
                        style={{
                          textShadow:
                            "0 1px 0 rgba(255,247,232,0.45), 0 -1px 1px rgba(38,28,16,0.35)",
                        }}
                      >
                        {country.name}
                      </motion.span>
                    ) : (
                      /*
                       * THE WITHHELD STATE CARRIES THE REVEALED STATE'S TYPE SCALE, character for
                       * character: same `font-display`, same `clamp`, same weight, same tracking. It
                       * used to be a barcode with its own bar height and its own caption size, and
                       * keeping the two states pinned to one height then took a `PLANK_HEIGHT`
                       * constant plus an argument about it. With both branches set from one type
                       * scale, the plank cannot change height on reveal — the same line box holds
                       * "Stop 01" and "JAPAN".
                       *
                       * `tabular-nums` so `01` and `05` are identical widths; proportional digits
                       * would make the five planks' labels ragged.
                       *
                       * THERE IS NO `opacity` HERE, AND THERE WAS, WHICH IS WORTH THE THREE LINES.
                       * `opacity-70` was added to make a waiting plank read as quieter than a carved
                       * one, on the reasoning that `#3d2f1d` is 8.6:1 on this wood and could spend
                       * some of that. That reasoning is wrong in a specific way: an opacity is not a
                       * discount on a ratio, it is a NEW COLOUR — 70% of the ink composited over the
                       * wood — and it has to be measured as one. Sampled from the rendered page it
                       * came out at 3.09:1 at 16.8px (needs 4.5:1) and 2.96:1 at 25.6px (needs
                       * 3:1). Both states now use the identical ink, and what says "waiting" is that
                       * the plank says a number instead of a name, which is louder than any fade.
                       */
                      <HiddenName
                        country={country}
                        className="font-display text-[clamp(1.05rem,2.4vw,1.6rem)] font-semibold uppercase tracking-[0.06em] tabular-nums text-[#3d2f1d]"
                      />
                    )}
                  </span>
                </Link>
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
