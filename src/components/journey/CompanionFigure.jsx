import { motion, useReducedMotion } from 'framer-motion'
import { toAvif } from '../../lib/images'

/*
 * CompanionFigure — the dog, beside the traveller.
 *
 * ============================================================================================
 * READ THIS FIRST: THERE IS NO ARTWORK YET, AND THIS COMPONENT RENDERS NOTHING WITHOUT IT.
 *
 * The site's own description says the journey follows a traveller "and his cute dog". The dog has
 * never existed as a file. `public/images/` ships five illustrations of the traveller and no animal.
 *
 * Generating one was not possible in the session this was built in — no image tool was available —
 * and hand-drawing one was attempted and rejected. That rejection is the useful part of this note:
 * the five traveller illustrations are fully cel-shaded anime-style paintings with soft shading, warm
 * skin tones and painted outlines. A hand-authored SVG line drawing is a different asset class, and
 * placed beside them it does not read as "the traveller's dog" — it reads as a placeholder somebody
 * forgot to replace. The failure is not that a drawing would be crude; it is that a competent drawing
 * in the wrong medium looks MORE wrong, because the viewer can see the effort and the mismatch at the
 * same time.
 *
 * So the slot is real and the asset is absent, which is the honest state and is why this returns null
 * on a missing `src` rather than drawing a silhouette. An empty space where a dog should be costs the
 * page nothing — every layout that uses this is complete without it. A wrong dog costs the page its
 * claim to craft, on the home page, in the first three seconds.
 *
 * ============================================================================================
 * WHAT TO SUPPLY, AND WHY THESE CONSTRAINTS SPECIFICALLY.
 *
 *   ONE FILE, NOT FIVE. `public/images/companion.png`. The dog is the same dog in every country —
 *   it is the one character on the site who does not change — so five files would be five chances for
 *   it to look like five different animals. The COUNTRY is carried by the traveller's passport and by
 *   the accent colour; the dog carries continuity, which is the opposite job.
 *
 *   PNG WITH A REAL ALPHA CHANNEL. Not a white background. The figure stands on a cream page and sits
 *   over photographs, and a white box around it is visible against both. This is the same reason the
 *   traveller's fallback is a PNG and not a JPEG — JPEG has no alpha. The pipeline emits the AVIF
 *   sibling automatically.
 *
 *   WHITE DOG, FACING RIGHT, SITTING OR STANDING SQUARE. Facing right because all five traveller
 *   illustrations face right, and the pair has to look the same way — see the note in
 *   TravellerFigure on why this is a placement decision and `scaleX(-1)` is not available.
 *
 *   MATCH THE TRAVELLER'S RENDERING. Same soft cel shading, same warm palette, same line quality.
 *   Not a logo, not a flat vector, not a photograph. The test is whether the two look like they were
 *   drawn by the same hand, because on screen they will be four inches apart.
 *
 *   CUTE BUT NOT A MASCOT. It never wears a hat, never holds anything, never has an expression aimed
 *   at the camera. It is an animal that came along, which is the register the whole site is in.
 *
 * Drop the file in and pass `src="/images/companion.png"`; nothing else needs to change.
 * ============================================================================================
 */

/*
 * The companion is smaller than the traveller, and this is a proportion rather than a size.
 *
 * A dog beside a standing person reaches somewhere around their knee. Rendered at the same height as
 * the traveller it is not a dog, it is a second character of equal weight — which changes what the
 * page is about. 0.42 is roughly knee height on the traveller illustrations and is applied to whatever
 * height the caller has given the traveller, so the pair stays in proportion at every breakpoint
 * without either figure having a hard-coded pixel size.
 */
const SCALE_OF_TRAVELLER = 0.42

/*
 * The companion arrives after the traveller and from the same side.
 *
 * Later, because a dog follows. Same `x` distance and same easing as the traveller's STEP_IN, so the
 * two are one movement with a beat in it rather than two animations that happen to overlap. The
 * default delay is expressed relative to nothing — callers pass the traveller's delay plus a beat.
 */
const TROT_IN = {
  hidden: { opacity: 0, x: 22 },
  visible: { opacity: 1, x: 0 },
}

export function CompanionFigure({
  /*
   * `src` with NO DEFAULT, deliberately. A default of '/images/companion.png' would make every caller
   * request a file that does not exist, and a 404 on an `<img>` renders the broken-image glyph — which
   * is the one outcome worse than rendering nothing. The absence has to be explicit at the call site.
   */
  src,
  /* The traveller's rendered height, so the two can be kept in proportion. See SCALE_OF_TRAVELLER. */
  travellerHeight = '10rem',
  delay = 0,
  className = '',
}) {
  const prefersReducedMotion = useReducedMotion()

  /* No artwork, no element. See the header note — this is the expected state, not a failure. */
  if (!src) return null

  return (
    <motion.div
      /*
       * `aria-hidden`, exactly as the traveller is. The dog conveys nothing a screen-reader user needs:
       * it is not where we are, not what day it is, and not a control. It is company.
       */
      aria-hidden="true"
      className={['pointer-events-none select-none', className].filter(Boolean).join(' ')}
      variants={TROT_IN}
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? false : 'visible'}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
    >
      <picture className="block">
        <source srcSet={toAvif(src)} type="image/avif" />
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="block h-auto w-auto"
          style={{
            /*
             * `calc` against the traveller's height rather than a fixed value, so a caller that
             * enlarges the traveller enlarges the dog by the same factor and the proportion holds.
             */
            maxHeight: `calc(${travellerHeight} * ${SCALE_OF_TRAVELLER})`,
            /*
             * The same drop-shadow as the traveller, at the same strength. Two figures on one page
             * with different shadows are lit by two different suns, which reads as a collage — and
             * matching them is what makes the pair look like one illustration.
             */
            filter:
              'drop-shadow(0 12px 18px color-mix(in oklab, var(--accent-ink) 22%, transparent))',
          }}
        />
      </picture>
    </motion.div>
  )
}
