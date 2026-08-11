import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Section } from "../components/ui/Section";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";
import { FlightMap } from "../components/journey/FlightMap";
import { JournalOpening } from "../components/journey/JournalOpening";
import { JOURNEY } from "../data/journey";
import { OPENING, JOURNAL } from "../data/voice";
import { TOTAL_DAYS, TOTAL_STOPS } from "../data/countries";
import { spellOutCapitalised } from "../lib/spellOut";
/*
 * The cover artwork, imported rather than referenced by path. The long note on `COVER_IMAGE` below
 * explains why this one image cannot live in public/images/ like every other photograph on the site.
 */
import coverVista from "../assets/hero-vista.jpg";

/*
 * HomePage — the traveller invites the visitor, and shows them the whole trip in one flight.
 *
 * ============================================================================================
 * WHAT THIS REPLACED AND WHY
 *
 * Three sections: a hero, an introduction, and a route map that scrubbed a line as you scrolled.
 * Everything about it was competent and it opened with the site describing itself in the third
 * person — "five countries, twenty-eight days, one question" — which is a landing page. A visitor
 * arriving on it was being pitched a project. The rebuild's premise is that they are being invited
 * on a trip, so the first voice they hear is the traveller's and the first word is "come".
 *
 * THE PAGE MAKES ONE ARGUMENT IN THREE MOVES:
 *
 *   1. THE HAIL       "Come with us." Someone is talking to you, and they say what the trip was for.
 *   2. THE TURN       Why the unglamorous parts are the point, and that nothing here is ranked.
 *   3. THE ITINERARY  The whole route flown across a real map, and five doors into it.
 *
 * WHY THE FLIGHT HAPPENS HERE TOO, AND NOT ONLY BETWEEN COUNTRIES. The visitor is about to be asked
 * to commit to a sequence, and the sequence is the one thing a list of five links cannot convey.
 * Watching one plane cross four legs in eleven seconds is the shortest honest answer to "what am I
 * agreeing to". It is also a promise the chapters keep: the same map, the same plane, the same
 * component — see the note in FlightMap on why it takes a route rather than a pair.
 *
 * WHAT IS STILL ABSENT BY DECISION: any chart, and any number about a country. Not one figure from
 * the dataset appears on this page. A statistic here would be a claim made before the visitor has
 * any reason to care about it, and the two counts that do appear (five stops, twenty-eight days) are
 * about the trip's shape rather than about any place in it — and are spelled out in words, because
 * numerals in a closing line read as a scoreboard.
 * ============================================================================================
 */

/* The whole itinerary as slugs, in order. The route the preview map flies. */
const FULL_ROUTE = JOURNEY.map((country) => country.slug);

/* The first stop, which is where the journal opens to. Derived, never typed. */
const FIRST_STOP = JOURNEY[0];

/*
 * ============================================================================================
 * THE COVER PHOTOGRAPH, AND WHY IT IS ONE FILE RATHER THAN THE FIVE-IMAGE CROSS-FADE.
 *
 * This cover used to run a `LivingBackdrop` cross-fading one landscape from each country every seven
 * seconds, full-bleed, with the text on a translucent `CoverPanel` over it. Both are now gone, and
 * neither was removed for looking bad.
 *
 * THE CROSS-FADE GAVE AWAY THE ANSWER. The five stops are now withheld until the visitor reaches
 * them — see the `SIGNPOST` note in src/data/voice.js — and a slideshow of recognisable photographs
 * from those five countries is the loudest possible spoiler. Fuji, the Taj Mahal and the Colosseum
 * identify a country faster than its name does. Withholding the five names while cycling those images
 * would have been a secret announced in pictures.
 *
 * SO THE COVER IS A SINGLE COMPOSED SCENE: the traveller and the dog on a ridge, looking out at a
 * landscape that is deliberately a COMPOSITE rather than a place. It is one image, so there is nothing
 * to identify sequentially, and its horizon is an invented one.
 *
 * WHAT I OWE THE READER ABOUT THIS FILE. It is cropped from a design reference the project owner
 * supplied (`images/Main Page.png`), and the crop is not incidental — it excludes the reference's baked
 * headline, its five carved country names, its five landmark icons and its decorative corner stamp.
 * The names had to go because they are the secret; the rest had to go because text baked into a
 * photograph cannot be selected, translated, scaled or read aloud. The crop is DERIVED, by
 * `scripts/buildHero.mjs`, which carries the measured bounds of every excluded mark and a record of
 * four techniques that failed to paint them out. Read that file before changing this one.
 *
 * THE FIVE STOPS ARE NOT NAMED ON THE COVER, AND THAT TOOK THREE PASSES TO SETTLE.
 *
 * They were first five HTML planks — a `Signpost` component — standing over the artwork's right side.
 * Those were removed because they covered the photograph: the picture is the invitation, and five opaque
 * boards laid over the half of it containing the mountains, the skyline and the horizon meant the
 * strongest thing on the page was obstructed by a list. `Signpost` is still in the tree, used nowhere;
 * it is kept rather than deleted because the object is sound and the objection was to where it sat.
 *
 * The reference's own signpost — carved JAPAN / INDIA / ITALY / SWITZERLAND / UNITED STATES, part of the
 * artwork rather than markup — was then kept for one iteration at the project owner's explicit request,
 * and removed at their explicit request. It is cropped off in `scripts/buildHero.mjs`, which records what
 * that cost: the Empire State building and the Golden Gate bridge sit behind and beside the planks, so
 * there is no cut that takes the names and leaves those two landmarks.
 *
 * The upshot is that the reveal is intact again — the header nav, the journal below the fold and the
 * footer all withhold the same five names until a visitor arrives — and the cover is a photograph rather
 * than a table of contents.
 *
 * THE LANDMARKS THAT REMAIN IN THE VISTA ARE A KNOWN COMPROMISE, and worth stating plainly rather
 * than quietly shipping: the composite still contains Fuji, a pagoda, the Taj Mahal, the Colosseum and
 * the Alps, so a visitor who studies it can infer most of the five. They are small, hazy, and stripped
 * of their labels, which is the difference between a clue and an answer — but it is a leak, not a sealed
 * secret, and it cannot be closed without repainting the artwork. Flagged here so the next person does
 * not assume the concealment is airtight.
 *
 * IT IS NOT A `LivingBackdrop`. That component exists to cross-fade a list, and this is one static
 * image with no list to fade. A plain `<img>` also lets the browser prioritise it as the largest
 * contentful paint, which a CSS background layer inside a component does not.
 *
 * ============================================================================================
 * WHY IT IS IMPORTED FROM src/assets AND NOT SERVED FROM public/images, WHICH IS WHERE EVERY OTHER
 * PHOTOGRAPH ON THIS SITE LIVES. This is the one asset that must not be there, and the reason is a
 * defect that already happened: the file was written to `public/images/hero-vista.jpg`, the page
 * referenced it by path, and it silently vanished. `scripts/convertData.mjs` treats that directory as
 * ITS OUTPUT — it builds the set of filenames the workbook asks for and deletes every other file in
 * there (see the `rmSync` sweep near the end of that script). Every country photograph survives
 * because the workbook names it. This one is not in the workbook, so `npm run data` removed it, and
 * because Vite's dev server answers a missing path with index.html the `<img>` did not 404 — it
 * loaded an HTML document, reported `complete: true` with `naturalWidth: 0`, and rendered as nothing.
 * A blank cover with no error anywhere.
 *
 * An import fixes it at the root rather than working around it: Vite resolves the file at build time,
 * fingerprints it, and fails the BUILD if it is missing, which is the loud failure a silently blank
 * hero should have been. It also means the asset cannot be swept, because it is not in the swept
 * directory. `public/images/` stays exactly what its .gitignore note says it is — derived output of
 * the data pipeline — and this file, which is authored rather than derived, is tracked in src/.
 *
 * The import itself is at the top of the file with the others, where imports belong; `coverVista` is
 * the URL Vite hands back for it.
 * ============================================================================================
 */

export function HomePage() {
  const prefersReducedMotion = useReducedMotion();

  /*
   * THE MAP FLIES WHEN THE VISITOR REACHES IT, NOT WHEN THE PAGE LOADS.
   *
   * `useInView` is framer-motion's hook over IntersectionObserver: it returns whether the referenced
   * element is in the viewport. `once: true` latches it, so the flight plays a single time and does
   * not restart every time the visitor scrolls back up — a looping animation in the periphery is the
   * fastest way to make a page tiring.
   *
   * `amount: 0.4` waits until 40% of the map is showing rather than firing on the first pixel. On a
   * tall section the top edge enters the viewport long before the map is actually being looked at,
   * and an animation that has already finished by the time you see it is indistinguishable from no
   * animation at all.
   */
  const mapRef = useRef(null);
  const mapInView = useInView(mapRef, { once: true, amount: 0.4 });

  return (
    <>
      {/*
       * ============================================================================================
       * 1. THE HAIL
       *
       * `min-h-[92svh]` — `svh` and not `vh`. `vh` is the viewport height with the mobile address bar
       * hidden, which is the taller measurement, so a `vh` cover is cut off on every phone. Nearly
       * full height rather than exactly so, because a sliver of the next section showing at the
       * bottom is what tells the visitor there is something below without needing a scroll cue.
       *
       * `isolate` creates a stacking context so the backdrop's negative z-index stays behind this
       * cover's content instead of falling behind the page background — the classic symptom of a
       * negative z-index with no isolating ancestor.
       * ============================================================================================
       */}
      {/*
       * ============================================================================================
       * THE COVER IS FULL-BLEED PHOTOGRAPH WITH THE TYPE ON TOP OF IT, WHICH IS A REBUILD RATHER THAN
       * AN ADJUSTMENT.
       *
       * IT USED TO BE TWO PANES: a cream text column and the artwork in a `w-[62%]` band beside it,
       * masked so it dissolved into the cream. Everything about that was defensible in isolation and it
       * got the composition wrong, because it made the photograph a decoration sitting next to the
       * words. The reference is one picture edge to edge with writing over its bright left side — the
       * traveller and the dog looking out at the horizon IS the invitation, and cropping it to 62% of
       * the viewport to make room for a paragraph inverts what matters.
       *
       * `grid` WITH ONE CELL rather than `relative` with an absolutely-positioned child. Both layers
       * occupy the same grid area, so the cover's height is the taller of the two and the text can
       * never run off the bottom of the artwork — which is the whole class of bug the old `flex-col`
       * note below this described. A `min-h` sets the floor; the content sets the rest.
       *
       * `min-h-[92svh]` — `svh` and not `vh`. `vh` is the viewport height with the mobile address bar
       * hidden, which is the taller measurement, so a `vh` cover is cut off on every phone. Nearly full
       * height rather than exactly so, because a sliver of the next section showing at the bottom tells
       * the visitor there is more without a cue having to say it.
       * ============================================================================================
       */}
      {/*
       * THE COVER IS AN `aspect-ratio` BOX AND THE `<img>` IS THE THING THAT SETS IT, WHICH IS SUBTLER
       * THAN IT LOOKS AND WAS GOT WRONG TWICE.
       *
       * Attempt one put the ratio on this wrapper. That does nothing here: `aspect-ratio` sets
       * a PREFERRED height, and a grid item taller than it — the type column, plus the sections below —
       * wins. Measured, the wrapper came out 2516px tall on a 1920px window while the image box stayed at
       * 923px, so the picture occupied a third of the cover with cream above and below it and the artwork
       * appeared to start 650px in from the left.
       *
       * The fix is to let the IMAGE own the ratio and have this box take its height from the image, which
       * is what `h-fit` does: the wrapper shrink-wraps its tallest grid item. The image layer below carries
       * `aspect-[2430/1604] w-full`, so it is exactly as tall as a full-width copy of the artwork needs to
       * be, and the cover is that tall too. Nothing is cropped and there is no leftover space, so the
       * letterbox seam that `object-contain` produced cannot appear either.
       *
       * `max-h-[calc(100svh-var(--header-height))]` IS THE CEILING, AND IT BECAME NECESSARY WHEN THE SIGNPOST
       * WAS CROPPED OFF. The asset went from 1.92 to 1.51 aspect, and a full-width copy of a 1.51 image on
       * a 1920px window is 1267px tall — taller than the screen. The derived height is only the right
       * height while it FITS; past that, the cover pushes its own bottom edge below the fold and takes the
       * enamel mug, the journal and the scroll cue with it, so a visitor sees a picture with no visible
       * end and no cue that anything follows. Capping at the viewport (less the fixed header, hence the
       * subtraction) puts the cover's bottom edge just on screen, which is what makes the cue work.
       *
       * `svh` rather than `vh` deliberately: `vh` on mobile browsers means the viewport with the toolbars
       * retracted, so a `vh`-tall band is taller than what is actually visible on load. This is a
       * desktop-only site and the two are identical there — `svh` costs nothing and is correct if that
       * ever changes.
       *
       * The image layer keeps its `aspect-ratio` AND gains `self-stretch`, so when this ceiling binds the
       * layer fills the shortened row and `object-cover` trims the surplus off the sky. See its note.
       *
       * `min-h-[34rem]` is the matching floor for narrow windows, where the derived height would fall
       * below the type block and the words would have nowhere to sit.
       *
       * `isolate` creates a stacking context so the layers' z-indexes resolve within this cover rather
       * than against the page.
       */}
      <div className="relative isolate grid h-fit max-h-[calc(100svh-var(--header-height))] min-h-[34rem] w-full grid-cols-1 grid-rows-1 overflow-hidden bg-surface-page">
        {/*
         * ==========================================================================================
         * THE VISTA — the whole cover, not a column of it.
         *
         * `col-start-1 row-start-1` puts it in the same single grid cell as the type, so the two stack
         * without either being taken out of flow. It is FIRST in source order so it paints beneath.
         *
         * THE SCRIM IS THE ONLY REASON TEXT CAN SIT ON A PHOTOGRAPH AT ALL, and it is a separate layer
         * below rather than a mask on the image. A mask fades the picture TO TRANSPARENT and lets the
         * page cream through, which is what produced the white glare over the artwork's left third that
         * had to be fixed twice — the mask was doing two jobs (hiding the crop's straight edge, and
         * making room for type) and its length was a compromise between them. A scrim does the second
         * job only: it lays cream over the picture at a controlled opacity, so the ramp length is a
         * legibility decision and nothing else, and the artwork underneath is never thinned.
         * ==========================================================================================
         */}
        <div
          aria-hidden="true"
          /*
           * `aspect-[2430/1604]` — the asset's own pixel dimensions, so this layer is exactly as tall as a
           * full-width copy of the artwork. The cover above is `h-fit` and therefore takes ITS height from
           * this, which is what makes the picture span the full width with nothing cropped and no
           * letterbox. Written as real dimensions rather than a decimal so it is obvious what it must stay
           * in step with: change the crop in scripts/buildHero.mjs and this changes with it.
           *
           * `self-stretch` MATTERS AT NARROW DESKTOP WIDTHS AND IS NOT REDUNDANT WITH THE RATIO. The two
           * work at different moments. When the row is sized, `aspect-ratio` is what this item contributes,
           * so the cover is as tall as a full-width copy of the artwork — the usual case. But at 1024 the
           * type column is TALLER than that, so the row grows to fit the words and the ratio no longer
           * describes the cell. Without `self-stretch` the picture kept its ratio height and the extra rows
           * were bare cream, which rendered as a hard horizontal line across the artwork's base. With it,
           * the layer fills whatever the row turns out to be and `object-cover` below absorbs the
           * difference. Stretch overrides `aspect-ratio` for the used height, which is exactly the
           * precedence this needs, and it changes nothing at the widths where the ratio already fits.
           */
          className="pointer-events-none col-start-1 row-start-1 aspect-[2430/1604] w-full self-stretch justify-self-stretch"
        >
          <img
            src={coverVista}
            alt=""
            /*
             * EMPTY `alt`, WHICH IS THE CORRECT VALUE AND NOT AN OMISSION.
             *
             * An empty alt marks an image as decorative, so a screen reader skips it entirely. That is
             * right here for a reason specific to this page: any honest description of this picture
             * ("a traveller and a dog looking out at Fuji, the Taj Mahal and the Colosseum") would hand
             * a screen-reader user the five countries the signpost is deliberately withholding. The
             * secret has to be kept in both channels or it is not kept.
             *
             * Nothing is lost, because the image carries no information the text does not. The headline
             * says come with us, the cover lines say what the trip looked for, and the aside names the
             * pair. A describable fact that only exists in the picture would need an alt; atmosphere does
             * not.
             *
             * NOTE THAT THE HEADLINE'S PLURAL IS NOW DOING PART OF THIS JOB. "Come with us" tells every
             * visitor, sighted or not, that there is more than one of them — which is the only thing about
             * this picture a reader could reasonably want and previously had no way to learn.
             */
            /*
             * ==========================================================================================
             * `object-cover`, WITH THE BOX ALREADY AT THE ARTWORK'S OWN RATIO — WHICH IS WHY IT CROPS
             * NOTHING. Both fits were tried against "the image is not fitting in my page", and the real
             * fix was neither of them; it was making the box the right shape.
             *
             * `cover` alone, in a box whose ratio did not match, cropped the parts that matter: at 1.6
             * against a then-2.08 asset it scaled up ~30% and cut the sides off, so the Empire State
             * building and the enamel mug left the frame. Measured on a 1999px window, the whole
             * right-hand third was gone.
             *
             * `contain` in that same mismatched box kept everything, and letterboxed. The slack was
             * supposed to be invisible because the artwork ends in the page's cream, and at the top it
             * very nearly was — but the asset's sky is blue by the middle of its width, so a cream band
             * sat above it and read as a hard seam.
             *
             * The box now carries `aspect-[2430/1604]`, the asset's own dimensions, so the box and the
             * picture are the same shape and cover and contain do the same thing: no crop, no letterbox.
             * `cover` is the one to name because it is the safe failure — it can only ever trim, never
             * expose a cream gap.
             *
             * WHICH DIRECTION IT TRIMS CHANGED WHEN THE SIGNPOST WAS CROPPED OFF, and this is the part to
             * keep straight. The asset is now 1.51 — NARROWER than any desktop viewport — so a full-width
             * copy is taller than the row and the trim comes off the TOP AND BOTTOM at every width, not
             * the sides. It was the opposite when the asset was 2.08. Anything that must stay in frame is
             * therefore constrained vertically now: the rock and journal along the base, the sky above.
             *
             * `object-[50%_35%]` decides where that vertical trim comes from, and it is a compromise
             * rather than an anchor at either end. `object-bottom` pinned the base, which was right while
             * the asset was wider than the viewport and the trim came off the sides — but now that the trim
             * is vertical it pushed the whole picture down and cut the traveller's head off at 1920. Pinning
             * the top instead loses the rock and the journal along the base. 35% keeps the head, the sky and
             * the plane, and still shows ground under the figures; measured at 1920, 1600, 1440 and 1280,
             * nothing that matters leaves the frame at any of them.
             * ==========================================================================================
             */
            className="size-full object-cover object-[50%_35%]"
            /*
             * `eager` + `high` because this is the largest contentful paint on the site's entry page.
             * The browser's default heuristic already tends to prioritise a large in-viewport image,
             * but it has to parse and lay out to discover that; the hint applies at parse time.
             */
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        {/*
         * ==========================================================================================
         * THE SCRIM — page cream over the photograph, and the ONLY reason dark type can sit on it.
         *
         * WHY THIS EXISTS AS ITS OWN LAYER. The previous cover made room for type by MASKING the image
         * away to transparent down its left edge, letting the page cream show through. That conflates two
         * jobs — hiding the crop's straight edge, and creating a legible field — so the ramp length was a
         * compromise between them, and it produced a white glare over the artwork's left third that had
         * to be corrected twice. A scrim only does the second job. The picture underneath is at full
         * strength everywhere; what varies is how much cream is laid over it.
         *
         * TWO GRADIENTS, AND THEY ARE COMPOSITED BY STACKING RATHER THAN BY `mask-composite`. That matters:
         * `maskComposite: "intersect"` MULTIPLIES its inputs, so a corner inside both ramps gets faded
         * twice — which is exactly what washed out the old vista's top-left. Two `linear-gradient`s in one
         * `backgroundImage` are painted one over the other in source order and accumulate additively
         * toward opaque, which is the behaviour wanted here and is far easier to reason about.
         *
         * IT IS MUCH LIGHTER THAN IT WAS. The artwork itself carries a cream veil over its left type zone
         * (see scripts/buildHero.mjs), so most of the legibility work is baked in and this layer only has
         * to finish the job where the veil ramps out. At 0.78 rather than 0.93 the traveller's face, the
         * backpack, Fuji and the pagoda all keep their own contrast instead of being washed toward cream.
         *
         * `--scrim-h` GETS BIGGER AS THE WINDOW GETS NARROWER, WHICH IS THE OPPOSITE OF A TYPO. The type
         * column is `max-w-xl` — a FIXED 576px — set in from a proportional `px-[5vw]` gutter. So the
         * fraction of the width it occupies grows as the viewport shrinks: measured, the column's right
         * edge is at 35% of 1920, 45% of 1440, and 61% of 1024. A single reach that clears the words at
         * 1920 leaves them on bare photograph at 1024, which is what the contrast sweep found there. Each
         * value below is the measured requirement at the NARROW end of its breakpoint plus a little.
         *
         * THE SECOND GRADIENT IS A BOTTOM-LEFT CORNER WASH, and it exists because of a decision made in the
         * asset. The baked veil deliberately fades out over the last rows so it never touches the enamel
         * mug or the open journal — real props, worth keeping. But the counts line and the scroll cue sit
         * in exactly that corner, so they landed on unveiled foliage and dark rock: the counts line
         * measured 1.00:1 at 1024. A radial anchored at `0% 100%` covers that corner and nothing else, so
         * the mug and journal stay visible under a haze while the traveller, the dog and the signpost are
         * untouched. Legibility is the page's job to solve, not the artwork's to be mutilated for.
         *
         * The two are composited BY STACKING, which is why they can overlap safely — see the note above on
         * `mask-composite`. In the bottom-left both apply and accumulate toward opaque, which is the
         * strongest region and also the one that needed the most help.
         *
         * THE NUMBERS ARE LEGIBILITY MEASUREMENTS, NOT TASTE: every figure here was set by sampling the
         * rendered pixels under each text element and checking it against 4.5:1 (or 3:1 for the large
         * headline), at 1920, 1600, 1440, 1280 and 1024. Change the asset's veil and these must be
         * re-measured, not re-guessed — the two are one system.
         * ==========================================================================================
         */}
        <div
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 self-stretch justify-self-stretch [--scrim-h:80%] lg:[--scrim-h:70%] xl:[--scrim-h:58%] 2xl:[--scrim-h:48%]"
          style={{
            backgroundImage: [
              "radial-gradient(105% 40% at 0% 100%, rgba(253,249,243,0.80) 0%, rgba(253,249,243,0.52) 44%, rgba(253,249,243,0) 76%)",
              "linear-gradient(to right, rgba(253,249,243,0.82) 0%, rgba(253,249,243,0.74) calc(var(--scrim-h) * 0.5), rgba(253,249,243,0.34) calc(var(--scrim-h) * 0.82), rgba(253,249,243,0) var(--scrim-h))",
            ].join(", "),
          }}
        />

        <Section
          as="div"
          spacing="none"
          /*
           * `col-start-1 row-start-1` puts the words in the SAME single grid cell as the artwork, which is
           * what stacks them without taking either out of flow. That is the structural difference from the
           * previous cover: the vista used to be `absolute`, so the text could and did run past its bottom
           * edge — measured at 390px, the artwork ended at y409 while the words continued to y690, leaving
           * four elements rendering on bare cream below the picture at 4.10:1, 1.21:1, 2.93:1 and 1.30:1.
           * Two of those were unreadable. In one grid cell the cover's height is the taller of its two
           * layers, so the picture is always at least as tall as the type and that failure cannot recur.
           *
           * `relative z-10` keeps the words above both the vista and the scrim; `pt` clears the fixed
           * header, and the generous `pb` gives the scroll cue room at the bottom.
           *
           * WIDTH `full` RATHER THAN `content`, AND THAT IS WHY THE TYPE STOPPED LANDING ON THE BACKPACK.
           * `width="content"` centres a 1080px container, so on a 1920px window the column began 470px in
           * from the left — a quarter of the way across, which put the counts line over the traveller's
           * pack (measured 1.03:1 against those pixels: unreadable). The reference sets its headline about
           * 5% from the frame's left edge, hard against the veiled zone, and the asset's veil is built to
           * that position. `full` removes the centring; `innerClassName` then replaces Section's own
           * `px-5 md:px-8 lg:px-12` gutter with a proportional one, because the veil is a PERCENTAGE of the
           * artwork's width and a fixed gutter drifts out of register with it as the window widens.
           */
          width="full"
          innerClassName="px-[5vw]"
          className="relative z-10 col-start-1 row-start-1 w-full self-center pb-20 pt-14 md:pb-28 md:pt-20"
        >
          {/*
           * ==========================================================================================
           * THE WORDS — over the photograph, on the scrim rather than on a `CoverPanel`.
           *
           * THE `CoverPanel` IS STILL NOT USED HERE, and now the reason is different, so it is worth
           * restating rather than leaving the old note to rot. The panel is a VISIBLE object: an 88% cream
           * card with a blur and a border, which announces itself as a chip laid on the picture. The scrim
           * behind this column does the same contrast job as a property of the light in the scene — no
           * edge, no corner, nothing to read as a card. That is the entire difference, and on a cover
           * whose whole argument is "this is one photograph, not an interface over one", it is the
           * difference that matters.
           *
           * WHAT THE TEXT IS MEASURED AGAINST, since it is genuinely on the artwork now: the scrim's
           * left ramp holds 0.90-0.93 cream across this column's full width, so the effective backdrop is
           * within a shade of `--color-surface-page` and the page's own ink values hold — `ink-900` at
           * 16.89:1, `ink-700` at 11.05:1. Sampled from the rendered pixels rather than assumed, at every
           * width in the sweep. `ink-500` IS permitted here, unlike on the panel, which is why the counts
           * line below can be secondary.
           *
           * `max-w-xl` is what keeps the column off the traveller's head at desktop, and the scrim's ramp
           * is tuned to end where this column does — see its note. The two numbers are related and will
           * need changing together.
           * ==========================================================================================
           */}
          <div className="max-w-xl">
            {/*
             * THE FIRST LINE ON THE SITE, and it is three words.
             *
             * WHY IT IS THE `<h1>`. The temptation is to make the pitch the heading — it contains the
             * subject matter, and it is what a search engine would want. But the heading is the page's
             * one-sentence claim, and this page's claim is an invitation rather than a description.
             * "Come with us" as an `<h1>` is also what a screen-reader user hears first, which is the
             * same thing a sighted visitor sees first: the two experiences match, which is the whole
             * test.
             *
             * The dataset-level metadata (title, description) carries the descriptive text for search;
             * see src/lib/meta.js. A heading is for the reader in front of it.
             */}
            <motion.h1
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(3rem,8.5vw,5.75rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-ink-900"
            >
              {/*
               * "Hey, come with us." rather than the bare "Come with us." the panel version used.
               *
               * The reference opens with "Hey," and it earns its place: it is the word that makes the
               * line an address to somebody rather than an imperative. "Come with us" alone can be read
               * as an instruction from an interface; nothing that starts with "Hey," can.
               *
               * "US" AND NOT "ME", BECAUSE THE COVER SHOWS TWO OF THEM. A reader pointed out the picture
               * has a dog in it and the line only accounted for the person. The full reasoning — including
               * why the plural is confined to this one line and every other line in the file stays
               * singular — is on `OPENING.hail` in src/data/voice.js.
               *
               * The comma is a real break in the sentence, so the two halves are separate lines rather
               * than one string wrapping wherever the box happens to end. `block` on each makes the
               * break structural instead of leaving it to the measure.
               *
               * THE WORDS ARE TYPED HERE RATHER THAN READ FROM `OPENING.hail`, WHICH IS A REAL SEAM AND
               * IS WORTH NAMING SO THE NEXT EDIT DOES NOT MISS HALF OF IT. The `<h1>` needs the sentence
               * split across two spans so the underline below can measure the second half alone, and a
               * single string cannot supply that. So `hail` holds the line for the record and this markup
               * holds the same words broken in two: change one and you must change the other. It is the
               * one place on the site where copy is duplicated between the data layer and a component.
               */}
              <span className="block">Hey, come</span>
              {/*
               * `relative` so the underline SVG below positions against THIS line rather than against
               * the page. Without it the stroke resolves to the nearest positioned ancestor and lands
               * in the top-left corner of the cover.
               *
               * `inline-block` AND NOT `block`, WHICH IS WHAT MAKES THE UNDERLINE THE RIGHT LENGTH.
               * A `block` span fills its container — 576px here — so an underline sized against it
               * measured the COLUMN rather than the WORDS, and overhung "with us." by 114px, running out
               * across the photograph. `inline-block` shrink-wraps to the text, so `100%` in the SVG
               * below means the width of the two words it is underlining. Verified in the browser: the
               * line now ends with the full stop.
               */}
              <span className="relative inline-block">
                with us.
                {/*
                 * The hand-drawn underline from the reference, as an inline SVG.
                 *
                 * A `border-bottom` cannot do this: the stroke has to be uneven and slightly off-axis to
                 * read as drawn rather than ruled, and a border is a perfect rectangle by definition.
                 * Two overlapping strokes because a single pen pass is what a UI underline looks like —
                 * a person underlining something by hand goes back over it.
                 *
                 * `absolute` under the text so it does not add to the line's height, which would
                 * otherwise push the cover lines down by the SVG's own box.
                 *
                 * WHERE IT SITS, WHICH WAS WRONG AND IS NOW MEASURED RATHER THAN GUESSED. The first
                 * version used `mt-[-0.35em]` on an absolute element, which is a contradiction — with no
                 * `top`, an absolute box stays at its static position (the end of the line box) and a
                 * negative margin then drags it UP into the type. The stroke crossed the middle of "with
                 * me." and read as a strikethrough: the one thing an underline must not look like.
                 *
                 * So it is anchored explicitly. `top-full` puts its top edge at the line box's bottom,
                 * and `-mt-[0.16em]` lifts it by a sixth of the type size so the stroke tucks just under
                 * the baseline the way a pen would, rather than floating in the gap below the descenders.
                 * `left-0 w-full` spans exactly the words — see the `inline-block` note above, which is
                 * what makes `w-full` mean the text rather than the column.
                 *
                 * ITS COLOUR IS `#bd7f1c` AND NOT THE WARMER `#d99b2e` IT WAS DRAWN IN. This stroke is a
                 * graphic rather than text, so it needs 3:1 against the page rather than 4.5:1 — and
                 * `#d99b2e` measures 2.31:1 on cream, sampled from the rendered pixels. It fails the
                 * lower bar, not just the higher one. `#bd7f1c` is 3.22:1: still the warm gold of the
                 * reference and a shade deeper, which at 3.5px of stroke is a change nobody would notice
                 * except by measuring — which is the point.
                 *
                 * A NON-DECORATIVE GRAPHIC IS WHY THE THRESHOLD APPLIES AT ALL. It would be tempting to
                 * argue this is pure ornament and exempt: it is `aria-hidden`, and removing it costs no
                 * information. But it is the emphasis on the headline's second half, so a visitor who
                 * cannot make it out loses the emphasis the type was designed around. 1.4.11 is the right
                 * bar for it.
                 */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 22"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute left-0 top-full -mt-[0.16em] block h-[0.3em] w-full text-[#bd7f1c]"
                >
                  <path
                    d="M3 11C58 4 152 3 231 7c22 1 44 3 66 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14 17C74 11 168 10 246 13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    opacity="0.62"
                  />
                </svg>
              </span>
            </motion.h1>

            {/*
             * THE THREE COVER LINES, where a 47-word paragraph used to be.
             *
             * See `OPENING.coverLines` for why the pitch moved below the fold and these took its place.
             * A `<p>` per line rather than one `<p>` with breaks: they are three separate statements, and
             * a screen reader pauses between paragraphs, which is the rhythm the three lines are written
             * for.
             *
             * `mt-9` clears the hand-drawn underline, which hangs below the headline's last baseline.
             */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.22,
              }}
              className="mt-9 space-y-1 text-lg leading-[1.5] text-ink-700 md:text-xl"
            >
              {OPENING.coverLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.42,
              }}
              className="mt-9"
            >
              {/*
               * "Start where I started" rather than "Begin in Japan" or "Explore".
               *
               * It names an action the traveller is taking with you instead of a destination the
               * interface is sending you to, and it does not name the country — which matters more
               * than it looks. Naming Japan in the primary action makes Japan the site's
               * recommendation; "where I started" makes it a fact about the trip's order. §7.4: sort
               * order is a ranking, and a button is the strongest sort order there is.
               *
               * NOW DOUBLY REQUIRED, because the country names are withheld. "Begin in Japan" would
               * give away the first stop in the one element the visitor is most likely to click.
               *
               * A real link (Button renders `<a>` for `to`), so it can be middle-clicked, opened in a
               * new tab, and appears in a screen reader's links list.
               */}
              <Button to={`/${FIRST_STOP.slug}`} size="lg">
                {OPENING.action}
              </Button>

              {/*
               * THE HANDWRITTEN ASIDE, in Fraunces italic — the existing display face, per the
               * constraint that no second font joins the build for handwriting.
               *
               * `-rotate-2` and a narrow measure so it reads as written in the margin rather than set as
               * a caption. It is the only rotated text on the page; a second would make the cover look
               * like a scrapbook, which §4 rules out by name.
               *
               * `#8a5d14` rather than the brighter `#bd7f1c` used for the underline: this is 15px text and
               * needs 4.5:1. The underline is a graphic and only needs 3:1, so it can be the warmer hue.
               * Two values because they have two jobs, not by oversight.
               *
               * MEASURED AGAINST WHAT IT ACTUALLY SITS ON, WHICH IS NOT PAGE CREAM. This aside is in the
               * cover's bottom-left corner, over the photograph under a scrim — sampled, rgb(242,238,230)
               * at 1024, where the scrim is thinnest over this line. `#946416` scores 4.89:1 on flat cream
               * and only 4.43:1 there, so the previous value passed the check that was easy to run and
               * failed the one that matters. `#8a5d14` is 4.96:1 against that same sampled backdrop.
               *
               * THE VALUE WAS ALSO ONCE `#a9741c`, WITH A COMMENT CLAIMING 4.62:1. It measures 3.85:1. That
               * is the part worth recording: a wrong number in a comment is worse than no number, because
               * it makes the next person skip the check. Twice now this line's ratio has been computed
               * against a surface the text does not sit on. Sample the rendered pixels under the words.
               */}
              <p className="mt-8 max-w-[15ch] -rotate-2 font-display text-[0.9375rem] italic leading-[1.75] text-[#8a5d14]">
                {OPENING.companionAside}
              </p>
            </motion.div>

            {/*
             * The counts, set as a quiet line beneath the button.
             *
             * `ink-700`, NOT the `ink-500` this line carried while the cover was a panel. It is the palest
             * ink on the cover AND the line that reaches furthest right, so it is the binding constraint on
             * how heavy the scrim has to be — and it sits in the bottom-left corner, where the asset's own
             * veil has deliberately faded out to spare the enamel mug and the open journal.
             *
             * At `ink-500` it measured 4.49:1 at 1280 and 4.25:1 at 1024 — under the 4.5:1 this 14px text
             * needs. Both could be bought with a heavier corner wash, and that was tried: it passed, and it
             * hazed over the mug and the journal, which are the two props the asset's veil was shaped to
             * protect. Darkening the ink one token buys the same margin and costs the artwork nothing. When
             * a caption and a picture compete, move the caption.
             *
             * ------------------------------------------------------------------------------------------
             * THE LINE USED TO HAVE A THIRD ITEM, "nothing ranked", AND IT IS GONE. A reader asked whether
             * this line needs to be here at all, and the answer turned out to be different for its two
             * halves — so this note records both, because "delete the line" was the tempting single answer.
             *
             * THE COUNTS STAY, AND THEY ARE NOW THE ONLY PLACE THEY APPEAR. They used to be said twice
             * within one screen: here, and in the cover's first line ("Five countries. Twenty-eight days.").
             * That line has been rewritten into the traveller's own sentence — see `OPENING.coverLines` —
             * which leaves these two figures said once, quietly, in the position a caption occupies. They
             * earn that place by answering the only question a visitor has before clicking: how much is
             * this. Both are derived from the itinerary, never typed, so the sentence cannot go stale.
             *
             * "nothing ranked" WAS A DISCLAIMER WEARING A COUNT'S CLOTHES. Set as the third item in a
             * dotted list beside two measurements, it reads as a third fact about the trip — and it is not a
             * fact about the trip, it is the site defending its own editorial method to a visitor who has
             * not yet accused it of anything. voice.js states the general rule this breaks: copy may say
             * what a thing IS; copy that defines itself by what it refuses is arguing with a reader who has
             * not spoken.
             *
             * IT IS ALSO STILL SAID, PROPERLY, ONE SCREEN DOWN. `OPENING.invitation` reads "You choose what
             * we look at. Nothing here is ranked." — in the traveller's voice, in a full sentence, next to
             * the reason it matters. That is the promise; this was the badge. Deleting the badge loses no
             * information and removes the only place on the cover where the site spoke about itself.
             */}
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? false : { opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-10 text-sm text-ink-700"
            >
              {spellOutCapitalised(TOTAL_STOPS)} stops{" "}
              <span aria-hidden="true">·</span>{" "}
              {spellOutCapitalised(TOTAL_DAYS)} days
            </motion.p>
          </div>
        </Section>

        {/*
         * THE SCROLL CUE, centred at the very bottom of the cover.
         *
         * `hidden md:flex` — it is pointless on a phone, where the page is obviously scrollable and the
         * cover already ends mid-image. On a desktop viewport the cover fills the screen and a visitor
         * can genuinely fail to notice there is more.
         *
         * NOT ANIMATED. A bouncing chevron is the reflex here and it is a looping animation in the
         * periphery, which this project has ruled out everywhere else (see TravellerFigure's note on
         * why nothing on the site loops). It is a static mark; the word carries the instruction.
         *
         * WHY IT IS STILL LEFT-ALIGNED TO THE TEXT COLUMN AND NOT CENTRED, WHICH IS WHAT THE REFERENCE
         * DOES. The reference can centre it because its version is baked into the artwork, painted at
         * whatever tone that patch of rock needed. Live text has one colour and has to clear every pixel
         * under it. Measured at 1440 on the old cover, the 151×34 box a centred label occupies spanned
         * rgb(63,62,60) in the shadow under the traveller's pack to rgb(253,244,233) in the blown-out sky
         * beside it: `ink-500` scores 1.81:1 on the dark end and 5.42:1 on the light end, `ink-700` scores
         * 1.08:1 and 10.65:1. No ink passes 4.5:1 against both, and none ever will — the problem is the
         * range, not the choice.
         *
         * THE SCRIM DOES NOT RESCUE A CENTRED LABEL, WHICH IS THE PART WORTH RECORDING NOW THAT ONE
         * EXISTS. The scrim is gone by 48-80% of the width depending on breakpoint (see `--scrim-h`),
         * deliberately, so the traveller and the horizon are never veiled — and at the wide end the centre
         * of the viewport is past that point. A cue at 50% would sit on bare photograph at 1920. Extending
         * the scrim to cover it would veil the artwork to fix a caption, which is the trade this whole
         * rebuild was undertaken to stop making.
         *
         * Aligned to the content gutter it lands under the column the eye has just finished, which is where
         * a "there is more below" cue is most useful anyway.
         *
         * `ink-700` RATHER THAN `ink-500`, for the same reason as the counts line above: at 11px it needs
         * 4.5:1, and it sits low in the frame where the asset's veil has faded out to spare the mug and the
         * journal. It measured 4.41:1 at 1920 once the artwork was reframed to `object-[50%_35%]`, which
         * moved brighter ground under it. The ink is the cheap half of the fix; the scrim's corner wash is
         * the other half, and deliberately the lighter of the two.
         *
         * The inner div repeats Section's own padding and max-width rather than reusing `Section`, because
         * this element is positioned against the hero as a whole and must not join the document flow.
         */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 hidden md:block">
          <div className="mx-auto max-w-(--container-content) px-5 md:px-8 lg:px-12">
            <p className="inline-flex flex-col items-start gap-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-ink-700">
              {OPENING.scrollCue}
              <svg viewBox="0 0 24 12" aria-hidden="true" className="h-2.5 w-5">
                <path
                  d="M2 2l10 8 10-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </p>
          </div>
        </div>
      </div>

      {/*
       * ============================================================================================
       * 2. THE TURN — why the unphotographed parts are the point.
       *
       * `width="prose"` and nothing but text. This is the only section on the page with no image, no
       * map and no motion beyond the reveal, and the plainness is doing work: it is the one moment
       * where the visitor is asked to accept a premise, and a premise stated over a photograph is a
       * caption.
       * ============================================================================================
       */}
      <Section width="prose" ariaLabelledBy="premise-heading">
        <h2 id="premise-heading" className="sr-only">
          {/*
           * Visually hidden so the landmark has a real name — an unnamed `<section>` is announced as
           * an anonymous "region", which is worse than no landmark at all. There is no visible
           * heading because the two paragraphs below are the traveller still talking; a heading would
           * interrupt them to label what they are saying.
           */}
          Why this journey looks at ordinary days
        </h2>

        <Reveal>
          <p className="font-display text-[clamp(1.5rem,4vw,2.125rem)] italic leading-[1.4] text-ink-900">
            {OPENING.turn}
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          {/*
           * THE NO-RANKING PROMISE, made in the traveller's own voice before the visitor sees a
           * single figure.
           *
           * It is here rather than in a footnote because it is the one thing that changes how
           * everything afterwards should be read: a visitor who expects a league table will read
           * every chart as one, and no caption three screens later undoes that. Said up front, in a
           * sentence rather than a disclaimer, it is a promise instead of a defence.
           */}
          <p className="mt-10 text-lg leading-[1.7] text-ink-700 md:text-xl">
            {OPENING.invitation}
          </p>
        </Reveal>
      </Section>

      {/*
       * ============================================================================================
       * 3. THE ITINERARY — the flight, then the doors.
       *
       * `relative isolate overflow-hidden` for the same reason as the cover: the map is absolutely
       * positioned behind this section's content on a negative z-index and must not escape it.
       * ============================================================================================
       */}
      <Section
        surface="sunken"
        width="content"
        ariaLabelledBy="itinerary-heading"
        className="relative isolate overflow-hidden"
      >
        {/*
         * THE MAP, behind the content rather than above it.
         *
         * As a figure with a caption it becomes a thing to study, and the visitor starts asking where
         * countries are. Behind the list, it is the room the itinerary is read in — which is the
         * right relationship, because the decision being made here is "shall I come" and not "where
         * is Switzerland".
         *
         * `pointer-events-none` so the graphic never intercepts a click meant for a stop below it.
         * `opacity` steps up once the flight starts, so the map quietly comes forward at the moment
         * it becomes the thing happening.
         */}
        <div
          ref={mapRef}
          className={[
            "pointer-events-none absolute inset-x-0 top-0 -z-10 h-[26rem] transition-opacity duration-700 md:h-[34rem]",
            mapInView ? "opacity-100" : "opacity-60",
          ].join(" ")}
        >
          <FlightMap route={FULL_ROUTE} playing={mapInView} />
        </div>

        {/*
         * `pt` pushes the heading clear of the map's busiest area so the type never sits on the
         * plane's path. Stated in rem against the map's own height above rather than as a percentage,
         * because the map's height is fixed and a percentage would drift with the content's length.
         */}
        <div className="relative pt-8 md:pt-16">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-ink-500">
              The route I took
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2
              id="itinerary-heading"
              className="mt-3 max-w-[24ch] font-display text-[clamp(2rem,5.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-ink-900"
            >
              {/*
               * The heading now names the object rather than the direction of travel. It used to read
               * "East to west, one country at a time", which described the route — and the route is now
               * described by the journal directly below it, in five slots and a line of handwriting. A
               * heading that repeats what the thing under it already shows is a caption.
               */}
              {JOURNAL.heading}
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-[54ch] text-lg leading-[1.65] text-ink-700">
              {/*
               * WHY THE ORDER IS DEFENDED HERE, directly above the five slots that show it. It says the
               * sequence is geography and nothing else — which is true, and is the only honest reason a
               * fixed order is permitted at all.
               *
               * IT USED TO NAME THE FIRST CITY: "which is west from Tokyo and nothing more than that."
               * That was written when this paragraph sat above five named links, and it survived the
               * change that withheld them — leaving the page to withhold five names and then name the
               * first stop's capital in prose two hundred pixels below. It reads better without: the
               * defence is that the order is a flight path rather than a verdict, and which airport it
               * started from is not part of that argument.
               */}
              The order is the order I flew in, which is a flight path and
              nothing more than that. You can start anywhere, but the days do
              add up if you take them as they came.
            </p>
          </Reveal>

          {/*
           * ==========================================================================================
           * THE JOURNAL, WHERE A NUMBERED LIST OF FIVE LINKS USED TO BE.
           *
           * WHAT WAS REMOVED AND WHAT SURVIVED IT. The old presentation was an `<ol>` of five rows,
           * each a `<Link>` with a two-digit number, the country's name, its epithet and its dates, and
           * an arrow that slid on hover. It was accessible, it was responsive, and it was the single
           * most travel-guide-like element on the site — a "choose your destination" list. Everything it
           * conveyed still exists inside `Journal`: the same five links, the same `<ol>`, the same
           * ordered semantics, the same accent-on-hover, the same dates. What changed is that they are
           * now printed on an object that is visibly EMPTY, and that emptiness is a promise.
           *
           * The epithets are the one thing genuinely dropped. Five one-line characterisations of five
           * countries, sitting together in one view, read as five verdicts — which is the thing §7
           * exists to prevent, and they read that way here more than anywhere else on the site because
           * this is the only place all five appear side by side. Each still opens its own chapter, where
           * it is a description of a place rather than an entry in a comparison.
           * ==========================================================================================
           */}
          {/*
           * `max-w-4xl` — the journal is narrower than the column it sits in, and that is what makes it
           * a book rather than a band. At the full `content` width (67.5rem) the object is about six
           * times wider than it is tall, which is the proportion of a banner; no notebook has ever been
           * that shape, and the physical-object illusion is the only thing this element is for. 56rem
           * still holds five stamps across with room to spare.
           */}
          <div className="mt-14 max-w-4xl">
            <JournalOpening
              caption={JOURNAL.emptyCaption}
              firstStopSlug={FIRST_STOP.slug}
              firstStopName={FIRST_STOP.name}
              actionLabel={JOURNAL.action}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
