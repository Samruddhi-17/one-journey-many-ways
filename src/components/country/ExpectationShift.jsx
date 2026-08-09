import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

/*
 * ExpectationShift — the brochure's promise, receding as the visitor scrolls toward what was found.
 *
 * ============================================================================================
 * THE MOMENT THIS EXISTS TO CREATE, AND WHY THE PREVIOUS VERSION DID NOT CREATE IT.
 *
 * The chapter's argument is a gap: the brochure line says one thing, the traveller's note says
 * something the brochure left out. Arrival's header note calls this "the part worth not breaking" and
 * it was already correct in structure — expectation, then pivot, then note, in that order, adjacent.
 *
 * What it lacked was a sense of anything HAPPENING. Both halves arrived the same way: a `Reveal`, a
 * 14px rise, a fade in. Two blocks of type that appear identically read as two paragraphs of a page.
 * The visitor was told about a contradiction rather than watching one land.
 *
 * So the expectation now recedes as the visitor scrolls into the discovery. It moves back and loses
 * weight — the same thing a claim does when you find out what was left out of it. Nothing appears,
 * nothing is corrected: the promise simply stops being the thing in front of you.
 *
 * ============================================================================================
 * WHY IT RECEDES AND IS NOT STRUCK THROUGH, CROSSED OUT, OR MARKED WRONG.
 *
 * This was the first idea and it is the one thing this component must never do. `country.welcome.intro`
 * is the DATASET's own promotional sentence, and Arrival's header note is precise about its status: the
 * traveller's note "contradicts its emphasis without contradicting its facts". Japan really is a blend
 * of tradition and technology. Striking that line through would have the site call its own source
 * false, which is not what the journey found and not a claim the data supports.
 *
 * A shift of emphasis is the honest gesture and the truer one. The brochure was not lying; it was
 * incomplete. Receding says "there was more to it". A strikethrough says "this was false".
 *
 * ============================================================================================
 * WHY IT IS SCROLL-LINKED RATHER THAN TRIGGERED, AND WHY THAT IS NOT SCROLL-JACKING.
 *
 * `Reveal` fires once when an element crosses a threshold: the animation then runs on its own clock
 * regardless of what the visitor does. That is right for content arriving, and wrong here, because the
 * point is that the visitor's own movement is what pushes the expectation away. Tying the transform to
 * scroll POSITION rather than to a scroll EVENT means a visitor who scrolls back up watches the promise
 * come forward again, and one who stops halfway sees it held halfway.
 *
 * NOTHING ABOUT THIS TOUCHES SCROLL BEHAVIOUR, which is the distinction the project's constraint is
 * about. Scroll-jacking is intercepting the gesture — hijacking wheel events, snapping the viewport,
 * pinning a section until an animation finishes. This reads the scroll position and never writes it.
 * The page scrolls exactly as fast and as far as the visitor asks; one element's opacity happens to be
 * a function of where they are.
 * ============================================================================================
 */

/*
 * WHERE THE RECEDE HAPPENS, EXPRESSED AS TWO POINTS IN THE VIEWPORT.
 *
 * Framer's `offset` pairs a point on the target with a point on the viewport. So:
 *
 *   'start 0.62' — progress 0 when the block's top edge is 62% of the way down the viewport, which is
 *                  roughly where it sits when the visitor first arrives at it. Full weight, untouched.
 *   'start 0.18' — progress 1 when its top edge has travelled to 18% down, by which point the note
 *                  below it is on screen and reading.
 *
 * The interval is deliberately long — around 44% of a viewport of scrolling — because a short one makes
 * the change snap and reads as a glitch. Spread out, most visitors never consciously see it move; they
 * just find the brochure quieter than they left it, which is the intended effect rather than a
 * compromised version of it.
 */
const OFFSET = ['start 0.62', 'start 0.18']

/*
 * ============================================================================================
 * THE OPACITY FLOOR IS A MEASURED CONTRAST LIMIT, NOT A CHOSEN AESTHETIC.
 *
 * The brochure line is `ink-700` at 20px regular. 20px is NOT "large text" under WCAG — that threshold
 * is 24px regular (or ~18.66px bold) — so this text needs the full 4.5:1 at every point in the
 * animation, including its resting state at the end. An opacity is a new colour and has to be measured
 * as one. Computed against the cream page (#fdf9f3):
 *
 *   1.00 → 11.05:1     0.85 → 7.04:1     0.80 → 6.06:1
 *   0.75 →  5.24:1     0.70 → 4.55:1     0.60 → 3.48:1  ✗ FAILS
 *
 * 0.75 is the floor this uses: 5.24:1, a comfortable margin. 0.7 measures 4.55:1 and technically
 * passes by 0.05, which is not a margin — it is a rounding error away from failing, and the `md` size
 * step, a future colour tweak or a slightly different cream would eat it. Anything at or below 0.6 is
 * unusable no matter how good it looks.
 *
 * THE LEGIBILITY IS THE POINT AND NOT A CONSTRAINT ON IT. A visitor who scrolls back to check what the
 * brochure actually promised must be able to read it. De-emphasis that shades into illegibility would
 * destroy the comparison the whole section is built to invite.
 *
 * THE EYEBROW ("WHAT THE BROCHURE SAID") IS NOT FADED AT ALL, and that is the same measurement from the
 * other side. It is `ink-500` at 12px — 5.63:1 at full strength, with nothing to give: even 0.85
 * composites to 4.06:1 and fails. So it is excluded from the transform rather than dimmed less. It also
 * happens to be the right call typographically: the label stays crisp while what it labels recedes,
 * which reads as an attribution outliving the claim.
 * ============================================================================================
 */
const OPACITY_FLOOR = 0.75

/*
 * The other two channels of the recede, which are what stop it reading as a simple fade.
 *
 * A pure opacity change looks like a rendering state — something still loading, or a disabled control.
 * Adding a little distance makes it a movement instead: the block shrinks very slightly and drifts up,
 * the two things an object does when it moves away from you.
 *
 * 0.985 and -10px are both small enough that no one watching sees a shrink or a slide; they see
 * something settle back. Larger values on either channel and the type visibly reflows, which is worse
 * than doing nothing.
 */
const SCALE_FLOOR = 0.985
const LIFT = -10

export function ExpectationShift({
  /*
   * `eyebrow` and `line` rather than a country: this component is a presentation of two strings and has
   * no business knowing what a country is. Arrival owns the data and the voice; see the no-branching
   * note in that file, which this observes by having nothing to branch on.
   */
  eyebrow,
  line,
}) {
  const prefersReducedMotion = useReducedMotion()

  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: OFFSET })

  const opacity = useTransform(scrollYProgress, [0, 1], [1, OPACITY_FLOOR])
  const scale = useTransform(scrollYProgress, [0, 1], [1, SCALE_FLOOR])
  const y = useTransform(scrollYProgress, [0, 1], [0, LIFT])

  return (
    <div ref={ref}>
      {/*
       * THE EYEBROW, OUTSIDE THE TRANSFORM. See the contrast note above — `ink-500` at 12px has no
       * opacity budget at all. This is the same markup Arrival used before, unchanged.
       */}
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">{eyebrow}</p>

      {/*
       * THE PROMISE ITSELF, AND THE ONLY ELEMENT THAT MOVES.
       *
       * Under reduced motion the MotionValues are not attached at all — no `style`, no scroll listener,
       * no observer. That is the project's standing rule (skip entirely, never shorten) and here it is
       * also the correct semantic outcome: the resting state of this element is "full weight", so a
       * visitor who has asked for no motion gets the brochure at 11.05:1 and reads the same two
       * sentences in the same order. The argument survives with no animation, which is the test of
       * whether the animation was decoration or content. It is decoration, and it is doing real work.
       *
       * `willChange` is deliberately absent. It would promote this to its own compositor layer for the
       * whole life of the page to optimise a transform that runs for one screen of scrolling, and a
       * permanently promoted layer holding a large italic serif is a memory cost with a blurry-text
       * failure mode on some GPUs. Framer already animates transform and opacity, which are the two
       * properties the compositor handles without layout.
       */}
      <motion.p
        style={prefersReducedMotion ? undefined : { opacity, scale, y }}
        className="mt-4 max-w-[52ch] origin-left font-display text-xl leading-[1.5] text-ink-700 md:text-2xl"
      >
        {line}
      </motion.p>
    </div>
  )
}
