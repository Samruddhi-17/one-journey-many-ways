import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Paper } from "../ui/Paper";
import { PassportStamp } from "./PassportStamp";
import { COUNTRIES } from "../../data/countries";

/*
 * Journal — the object the journey is recorded in, closed, with a page of stamps.
 *
 * ============================================================================================
 * WHAT THIS IS FOR, AND WHY IT IS THE PAGE'S CENTREPIECE RATHER THAN A WIDGET.
 *
 * The home page used to present the itinerary as a numbered list of five links: correct, accessible,
 * and indistinguishable from the "choose a region" step of a booking flow. The complaint that started
 * this rebuild was that the site reads as a travel guide, and a numbered list of countries is the
 * single most guide-like thing on it.
 *
 * So the itinerary is now a physical object with five empty slots in it. The information is identical
 * — five names, five date ranges, five links — and the claim it makes is different: not "pick a
 * destination" but "this is empty, and it is going to fill up".
 *
 * THE SAME COMPONENT DRAWS THE BEGINNING AND THE ENDING, which is the entire point and is why it
 * takes `visited` as a prop. On the home page nothing is visited and all five slots are outlines. At
 * the end of the United States every slot is stamped in its country's colour. A visitor who sees the
 * second recognises the first, because it is the same object — and that recognition is the ending's
 * whole argument. Two components would be two things that could drift apart, and the drift would
 * break exactly the effect they exist to create.
 *
 * ============================================================================================
 * WHY THE LINKS ARE STILL LINKS, WHICH IS NOT NEGOTIABLE.
 *
 * It would be easy to make this an illustration with one "open the journal" button, and it would cost
 * a keyboard user four of the five ways into the site. Every slot is an `<a>` inside an `<ol>`: the
 * stamps are decoration ON TOP OF a real itinerary list, not a replacement for it. Tab order is the
 * route order, each link names its country in text, and the whole thing works with images off.
 *
 * That is also why the country code appears twice per slot — once inside the stamp graphic and once
 * as the country's full name in the link text. The stamp is the object; the name is the information.
 *
 * ============================================================================================
 * WHY IT IS DRAWN CLOSED, AND WHAT "CLOSED" MEANS HERE.
 *
 * A journal lying open on the home page has already been started, which contradicts the line printed
 * beneath it. Closed with the stamps showing is not physically literal — stamps are inside a passport,
 * not on its cover — and the alternative was worse: five slots hidden inside an object the visitor has
 * to open before they can see there is an itinerary at all. That would make the route a secret, and
 * the route is the invitation.
 *
 * So "closed" is carried by the binding rather than by hiding the contents: the spine down the left,
 * the stacked page edges on the right, the weight of the shadow. It reads as a book you are looking
 * at rather than one you are reading.
 * ============================================================================================
 */

/*
 * The tilt of the whole object.
 *
 * A book photographed square-on is a product shot; a book lying at a slight angle is a book somebody
 * put down. One degree is almost nothing and is the difference between the two — and it is small
 * enough that no text inside needs its own counter-rotation to stay comfortable to read.
 *
 * `-0.8` rather than a rounder number because 1° reads as deliberate and this should not.
 */
const TILT = -0.8;

/*
 * The entrance: the journal settles onto the page rather than fading in.
 *
 * `y` and a hair of `scale`, which together read as an object coming to rest — the same grammar as
 * the traveller's step-in, and deliberately not a flip or a page-turn. A journal that animates itself
 * open on arrival has performed the journey's central gesture before the visitor asked for it, and
 * that gesture belongs to the button below it (see JournalOpening).
 */
const SETTLE = {
  hidden: { opacity: 0, y: 26, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export function Journal({
  /*
   * The slugs actually visited. Defaults to empty so the home page's usage is the plain one and a
   * caller cannot accidentally render a full journal by forgetting an argument.
   */
  visited = [],
  /*
   * `caption` — the line printed under the stamps, supplied by the caller because it is the one thing
   * that legitimately differs between the beginning and the ending. Everything else about the object
   * is identical by design.
   */
  caption,
  /*
   * `opening` — the cover swings back on its spine. Set by JournalOpening for the moment between the
   * visitor pressing the button and the first country arriving; see that file for why the animation
   * and the navigation have to be owned by the same component.
   *
   * IT LIVES HERE RATHER THAN IN A WRAPPER because the thing being animated is the cover, and the
   * cover is this component's own element. A wrapper could only rotate the whole object including its
   * stacked page edges, which would turn the whole book rather than open it.
   */
  opening = false,
  className = "",
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={["relative", className].filter(Boolean).join(" ")}
      /*
       * `perspective` on the container, which is what makes the cover's `rotateY` read as a cover
       * lifting rather than as a flat shape squashing horizontally. Stated in px on the parent because
       * a 3D transform needs a viewing distance to be projected against, and without one the browser
       * applies an orthographic projection — mathematically a rotation, visually a scale.
       *
       * 1400px is a long lens: enough depth to see the turn, not enough for the perspective distortion
       * to make the type on the cover look like it is falling away.
       */
      style={{ perspective: "1400px", rotate: `${TILT}deg` }}
      variants={SETTLE}
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView={prefersReducedMotion ? false : "visible"}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {/*
       * THE STACKED PAGE EDGES, drawn as two offset sheets behind the cover.
       *
       * This is what makes the object a book rather than a card. Two sheets and not five: past two the
       * offsets have to shrink to fit, and a stack of hairlines reads as a rendering artefact. Two
       * says "there are pages in here" and stops.
       *
       * Absolutely positioned with a small positive offset on both axes so they emerge at the bottom
       * right, which is where the edges of a stack show when the top sheet is tilted this way.
       * `aria-hidden` — the physical object carries no information.
       */}
      <span
        aria-hidden="true"
        className="absolute inset-0 translate-x-[6px] translate-y-[7px] rounded-r-lg rounded-l-sm border border-ink-200 bg-surface-sunken"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 translate-x-[3px] translate-y-[3.5px] rounded-r-lg rounded-l-sm border border-ink-200 bg-surface-page"
      />

      {/*
       * THE COVER ITSELF. `Paper` supplies the cream surface, the grain and the bound edge; the
       * shadow and the radius are here because they describe this object's size rather than the
       * material it is made of.
       *
       * `rounded-l-sm` against `rounded-r-lg`: a bound edge is square and a fore-edge is not. That
       * asymmetry is doing more work for "this is a book" than the spine gradient is.
       *
       * `shadow-elev-3` is the heaviest of the three tokens, and this is the only place it lands on
       * something in the flow of the page — its other use is the mobile navigation sheet, a panel
       * floating over everything. Using it on content is the deliberate part: that weight is what puts
       * the journal ON the page rather than printed onto it.
       */}
      <motion.div
        /*
         * THE COVER SWINGING BACK, and the two properties that make it a hinge rather than a spin.
         *
         * `transformOrigin: left center` puts the axis on the bound edge, which is where a cover is
         * attached. Without it the rotation happens about the middle of the shape and the object folds
         * through itself. `transformStyle: preserve-3d` keeps the cover's own children in the 3D space
         * the parent's `perspective` established, instead of being flattened onto the cover's plane
         * before it turns — the flattened version is subtly wrong in a way that reads as cheap.
         *
         * WHY IT ROTATES 62° AND NOT THE FULL 105° A REAL COVER WOULD.
         *
         * Because there is nothing underneath. The stamps are printed ON this cover (see the header
         * note on why the journal is drawn closed), so opening it all the way exposes an empty page and
         * the effect ends on a blank rectangle. At 62° the cover is unmistakably open and still holds
         * some of its own contents in view while the fade takes over — the gesture completes on the
         * country arriving rather than on this element finishing its animation.
         *
         * THE WHOLE OBJECT FADES AS THE COVER TURNS, which is what hands the moment off. Without the
         * fade the journal sits there half-open waiting for a route change, and the pause is visible.
         */
        animate={
          prefersReducedMotion || !opening
            ? undefined
            : {
                rotateY: -62,
                opacity: 0.15,
                transition: { duration: 0.85, ease: [0.4, 0, 0.2, 1] },
              }
        }
        style={{
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
        }}
      >
        <Paper
          spine
          className="relative rounded-l-sm rounded-r-lg px-6 py-8 shadow-elev-3 md:px-10 md:py-11"
        >
          {/*
           * The label on the cover. Small caps, wide tracking, ink-500 — the typographic register of
           * something printed on a document rather than set as a heading. It is not an `<h*>` because
           * the section around it already has its heading; this is the object's own lettering.
           *
           * `pl` clears the spine gradient, which is 40px wide.
           */}
          <p className="pl-6 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-ink-500 md:pl-8">
            Field journal <span aria-hidden="true">·</span> five stops
          </p>

          {/*
           * ==========================================================================================
           * THE FIVE SLOTS.
           *
           * `<ol>` because this is the itinerary and the order is real information — the same reasoning
           * the numbered list it replaces used, and the reason replacing that list costs nothing
           * semantically. A screen-reader user hears "list item 3 of 5, Italy, days 13 to 18, link".
           *
           * A GRID RATHER THAN A ROW, and this is the responsive decision the whole layout turns on.
           * Five stamps in a single row need about 5 × 96px plus gaps, which does not fit a 320px phone
           * without either shrinking the stamps below legibility or scrolling horizontally. Two columns
           * on a phone, five across from `md` up — so the object is a page of stamps at every width and
           * never a strip that overflows.
           * ==========================================================================================
           */}
          <ol className="mt-7 grid grid-cols-2 gap-x-3 gap-y-5 pl-6 sm:grid-cols-3 md:grid-cols-5 md:pl-8">
            {COUNTRIES.map((country, index) => {
              const pressed = visited.includes(country.slug);

              return (
                <li key={country.slug}>
                  {/*
                   * THE WHOLE SLOT IS THE LINK, stamp included, so the target is a comfortable size on
                   * a touch screen. The stamp is not itself a control — it is inside one.
                   *
                   * `--row-ink` is set here rather than on the stamp because the focus ring and the
                   * hover name use it too, and one declaration on the ancestor is one place for the
                   * country's colour to come from. PassportStamp sets the same property internally when
                   * pressed; setting it here as well is harmless (identical value) and is what lets the
                   * unpressed slot's ring still be the country's colour even though its stamp is grey.
                   *
                   * WHY THE RING IS THE ACCENT AND THE OUTLINE IS NOT: a focus ring is a momentary UI
                   * affordance measured against the surface, not text — 3:1 is the applicable threshold
                   * and every accent clears it comfortably. The stamp outline is TEXT and had to be
                   * measured as text, which is why it is ink-400. Same colour, two different jobs, two
                   * different thresholds.
                   */}
                  <Link
                    to={`/${country.slug}`}
                    style={{ "--row-ink": country.atmosphere.ink }}
                    /*
                     * `gap-1.5` (6px) and not `gap-3`, which is a proximity fix rather than a taste
                     * one. The grid's row gap is 20px. At `gap-3` the space inside a slot was 12px, so
                     * on a phone — where the grid wraps to three rows — a country's name sat nearly as
                     * close to the stamp BELOW it as to its own. The stamp, the name and the dates are
                     * one unit and have to be spaced tighter than the units are spaced from each other.
                     */
                    className="group flex flex-col items-center gap-1.5 rounded-md px-1 py-2 text-center transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--row-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card"
                  >
                    {/*
                     * The stamp, lifting very slightly on hover so the slot feels like a thing you can
                     * press rather than a picture of one. A transform because it is composited; 2px
                     * because more would make the stamp float off the page it is stamped on.
                     *
                     * A FIXED-HEIGHT BOX AROUND IT, WHICH FIXES A VISIBLE DEFECT. Each stamp is rotated
                     * by a different angle (see ROTATIONS in PassportStamp), and a rotated element's
                     * bounding box is taller than the element — by a different amount at each angle. So
                     * five stamps in a row pushed their five name labels to five different heights, and
                     * the row read as sloppy typesetting rather than as hand-pressed stamps. Giving the
                     * slot a fixed height and centring the stamp inside it means the rotation happens
                     * inside a box that does not change size, so the labels all sit on one line.
                     *
                     * 3rem = 48px, MEASURED RATHER THAN ESTIMATED. Every stamp is 39px tall unrotated;
                     * the steepest angle (4.5°) takes its bounding box to 43.8px. 48px is that plus a
                     * little air. The first version of this was 4.5rem — 72px — which fixed the labels
                     * and left 28px of dead space inside every slot. On desktop that is one row and
                     * reads as generous padding; on a phone the grid is three rows and it is 84px of
                     * slack that pushes the caption off the fold. Worth recording because the defect
                     * the wrapper existed to fix was visible and the cost of overshooting it was not.
                     *
                     * ------------------------------------------------------------------------------
                     * THIS NOTE USED TO CLAIM "BOTH STATES ARE THE SAME 39px, VERIFIED IN THE BROWSER",
                     * AND THAT WAS FALSE FOR THE PRESSED STATE. What had been verified was five
                     * UNPRESSED stamps — which is what the home page and a fresh passport show, so it
                     * held everywhere anyone had looked. A pressed stamp printed its dates, they wrapped
                     * to two lines in this narrow column, and the stamp went to 68–71px inside this
                     * 48px box: it overhung the slot, sat on the country name, and did so by a different
                     * amount per angle, which is the ragged-labels defect this box exists to prevent,
                     * arriving from the other direction. It only became visible once a journal rendered
                     * with all five pressed, which first happens at the end of the fifth country.
                     *
                     * `showDates={false}` is the fix and it belongs to the STAMP rather than to this box
                     * — the full argument, and the measurements ruling out `whitespace-nowrap`, are in
                     * PassportStamp's header note. With the dates suppressed the two states really are
                     * the same height, so 48px is correct for both; it is now true rather than assumed.
                     * ------------------------------------------------------------------------------
                     */}
                    <span className="flex h-12 items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5">
                      {/*
                       * `showDates={false}` — the dates are printed BELOW, on the page, by the span two
                       * elements down. Passed here rather than defaulted in the component because on the
                       * passport page the stamp is the only place the dates appear at all: this is a
                       * statement about what else is in this layout, which only the layout knows.
                       */}
                      <PassportStamp
                        country={country}
                        index={index}
                        pressed={pressed}
                        showDates={false}
                      />
                    </span>

                    {/*
                     * THE COUNTRY'S NAME, which is the information the stamp only decorates — once the
                     * visitor has been there.
                     *
                     * Takes the accent on hover and focus, exactly as the numbered list it replaces did,
                     * so the interaction vocabulary of the page is unchanged. `text-ink-700` at rest
                     * rather than `ink-900`: five names at full weight compete with the caption below,
                     * and the stamps should be what the eye lands on first.
                     *
                     * ==========================================================================
                     * WITHHELD UNTIL THE SLOT IS STAMPED, and of everywhere on the site that had to
                     * change for the hidden itinerary, this is the place where the change costs nothing
                     * and arguably improves the object.
                     *
                     * The journal's argument is already "this is empty, and it is going to fill up" —
                     * see the header note. A slot that printed "Japan" under an unpressed outline was
                     * quietly contradicting that: the name was filled in, so only the ink was missing.
                     * With the name withheld, an empty slot is genuinely empty and a stamped one gains
                     * both its colour AND its name at the same moment. One state, one change.
                     *
                     * IT REUSES `pressed` RATHER THAN READING THE STORE ITSELF, which is what keeps the
                     * ending working. `Journal` takes `visited` as a prop precisely so the same
                     * component can draw a full journal at the end of the trip; a `useVisited()` call in
                     * here would ignore that prop and this element would disagree with the stamp beside
                     * it. One condition drives the whole slot.
                     *
                     * WHY NO LABEL IS REPEATED HERE. `PassportStamp` prints one inside the outline as
                     * real, announced text — the stop number while unpressed, the code once stamped — so
                     * the slot is already labelled and a second copy would announce it twice, which is
                     * the exact `sr-only` duplication removed further down this file. So the withheld
                     * state renders no name element at all, and the fixed height on the wrapper below is
                     * what stops the row collapsing.
                     * ==========================================================================
                     */}
                    <span className="flex h-4 items-center justify-center">
                      {pressed ? (
                        <span className="block text-xs font-medium leading-snug text-ink-700 transition-colors duration-300 group-hover:text-[var(--row-ink)] group-focus-visible:text-[var(--row-ink)]">
                          {country.name}
                        </span>
                      ) : (
                        /*
                         * The status, for a screen reader only. A sighted visitor reads "not been there"
                         * from the dashed outline; this says the same thing in the same amount of detail,
                         * and deliberately not the country's name — see HiddenName's accessibility note.
                         *
                         * `h-4` on the wrapper (16px, the `text-xs` line height) holds the row's height
                         * in both states, so revealing a name does not shift the dates line beneath it or
                         * the four slots sharing its grid row.
                         */
                        <span className="sr-only">
                          {`Stop ${country.arrivalOrder}, not yet visited`}
                        </span>
                      )}
                    </span>

                    {/*
                     * The dates, in the link so a screen-reader user hears them as part of the stop.
                     *
                     * THIS IS WHERE THE DATES LIVE FOR AN UNVISITED STOP, and that is the resolution of
                     * a real tension. The unpressed stamp deliberately prints no dates, because a stamp
                     * records when you were somewhere and an empty slot has no when (see
                     * PassportStamp). But the ITINERARY does have dates — "Italy is days 13 to 18" is a
                     * fact about the planned route, not a claim about a visit. So the fact stays and
                     * moves out of the stamp: printed on the page as a plan, absent from the impression
                     * that would make it a record.
                     */}
                    <span className="block text-[0.625rem] uppercase tracking-[0.1em] tabular-nums text-ink-400">
                      {country.days}
                    </span>

                    {/*
                     * THERE IS DELIBERATELY NO `sr-only` COUNTRY CODE HERE, and the removed version is
                     * worth a note because it looked like an accessibility improvement.
                     *
                     * It read `<span className="sr-only">{codeFor(country)}</span>`, on the reasoning
                     * that the code inside the stamp graphic was decorative and needed a text
                     * equivalent. That reasoning was wrong about this component: PassportStamp's code is
                     * REAL TEXT and is explicitly not `aria-hidden` (see the note in that file on why a
                     * decorative-looking element has to stay announced). So the slot announced "JPN Japan
                     * Days 1–6 JPN" — verified by reading the accessible name in the browser. The
                     * duplication was invisible to a sighted visitor and audible to everyone else.
                     */}
                  </Link>
                </li>
              );
            })}
          </ol>

          {/*
           * THE CAPTION, in the traveller's handwriting.
           *
           * Fraunces italic is the site's existing display face and is what stands in for handwriting
           * here — no new font dependency, and a real italic serif reads as a considered note rather
           * than the novelty a script face would be. It is the only sentence on the object, and it is
           * what turns five empty outlines from a menu into a statement.
           *
           * `border-t` above it rather than more space: a rule is what separates the printed part of a
           * document from something written on it by hand.
           */}
          {caption ? (
            <p className="mt-8 border-t border-ink-200 pl-6 pt-6 font-display text-lg italic leading-[1.5] text-ink-700 md:pl-8 md:text-xl">
              {caption}
            </p>
          ) : null}
        </Paper>
      </motion.div>
    </motion.div>
  );
}
