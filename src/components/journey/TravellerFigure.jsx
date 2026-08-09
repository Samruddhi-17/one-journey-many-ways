import { motion, useReducedMotion } from 'framer-motion'
import { toAvif } from '../../lib/images'

/*
 * TravellerFigure — the traveller, actually visible, holding this country's passport.
 *
 * ============================================================================================
 * WHY THIS EXISTS: "I CANNOT SEE THE TRAVELLER", SAID TWICE.
 *
 * The first answer to that complaint was a boarding pass in the corner — the traveller's luggage
 * rather than the traveller — reasoned from PRODUCT_VISION.md §3.4, which says the traveller has "no
 * name, no face, no biography". The complaint was then repeated verbatim, which settled what it
 * meant: not "give me evidence someone is travelling" but "let me see the person".
 *
 * And there was a person to see the whole time. `images/` ships five illustrations of a young
 * traveller with a backpack, each holding the passport of the country they have landed in. Nothing
 * rendered them, because the pipeline had them behind an exclusion pattern whose comment asserted
 * they were dashboard screenshots — a claim nobody had checked by opening the files. See the note on
 * EXCLUDED in scripts/convertData.mjs, which now records what they actually are.
 *
 * HOW THIS SQUARES WITH §3.4, because it does contradict the letter of it.
 *
 * §3.4's argument is that a named, characterised narrator makes the site about them and reduces the
 * visitor to an audience. That argument is right and nothing here weakens it: this figure has no
 * name, no age, no backstory, no opinions, and never speaks. It is closer to the silhouette on a
 * signpost than to a protagonist — the same role the illustrated guide plays in a museum leaflet.
 * §3.4's own table says the traveller IS "a quiet companion who noticed things and points them out",
 * and pointing is a thing a body does.
 *
 * The literal prohibition on a face was written when nobody knew a face had been supplied, and the
 * person the document exists to serve has now twice asked to see it. That is the correct order of
 * authority. PRODUCT_VISION.md §3.4 has been amended rather than quietly contradicted — a rule
 * broken in code and left standing in the document is how the next reader arrives at the same wrong
 * conclusion this one did.
 *
 * HOW BIG THE FIGURE MAY BE, and why the old hard ceiling is gone. See DEFAULT_MAX_HEIGHT.
 *
 * WHY IT IS NOT THE `alt` OF A DECORATIVE IMAGE. The figure carries one piece of information a
 * screen-reader user would otherwise miss — which country's passport is being held, i.e. where we
 * are — and the surrounding copy already states that in words. So it is `aria-hidden`, and the
 * `<figcaption>`-shaped text beside it is real text rather than an image description. The rule the
 * whole site follows: anything that conveys information does so as text.
 * ============================================================================================
 */

/*
 * THE DEFAULT SIZE, AND THE STORY OF THE CEILING THAT USED TO BE HERE — worth keeping, because it is
 * a lesson about verification rather than about layout.
 *
 * This constant was `MAX_HEIGHT = '10rem'` and it was documented as a HARD CEILING, on the grounds
 * that two of the five passports had garbled AI-generated lettering: Italy's supposedly read
 * "PASSAPDRIO / REPURSTICA TIALLANA" and the United States' "UNITEO STATES OF AMERICA". The reasoning
 * built on that was sound — a spelling mistake on a site whose whole argument is craft stops a
 * reviewer from evaluating anything else, so cap the size until the words become texture.
 *
 * THE PREMISE WAS FALSE. Both files were exported at 340px and 900px and read directly: Italy's cover
 * says "PASSAPORTO / REPUBBLICA ITALIANA" and America's says "PASSPORT / UNITED STATES OF AMERICA",
 * both correctly spelled and cleanly drawn. Nobody had opened the images; the defect was asserted,
 * documented in detail, and reasoned from for as long as it stood.
 *
 * That is the same failure that hid these five illustrations in the first place — the pipeline's
 * EXCLUDED pattern kept them out on the strength of a comment claiming they were dashboard
 * screenshots, which nobody had checked either. Twice now, in this one component's history, a
 * confident comment about the contents of an image file has been wrong. The rule that follows: a claim
 * about what an asset LOOKS LIKE is only worth what the last look at it was worth, and the check costs
 * one command.
 *
 * SO THERE IS NO CEILING NOW, only a default — and the home page overrides it, which is what makes a
 * figure large enough to be a person rather than an icon possible at all.
 */
const DEFAULT_MAX_HEIGHT = '10rem' /* 160px */

/*
 * The entrance: the traveller steps in from the side rather than fading up on the spot.
 *
 * A fade says "an image loaded". A short horizontal move with the fade says someone walked into
 * frame, which is the whole point of putting a person here. `x` and `opacity` only — both are
 * composited by the GPU, so this costs nothing on a phone.
 *
 * WHY IT IS NOT A CONTINUOUS ANIMATION. A figure that bobs or sways forever is a mascot, and it
 * would pull attention off the text for the entire time the page is open. This arrives, settles and
 * then holds still.
 *
 * That used to be stated as an exception — the boarding pass's "you are here" pulse was the site's one
 * permitted looping motion, on the grounds that it was carrying information rather than personality.
 * The pass has been retired, so THERE IS NOW NO LOOPING ANIMATION ANYWHERE ON THE SITE. Worth stating
 * positively rather than leaving as a repealed exception: every motion here begins because the visitor
 * arrived or scrolled, and every one of them ends.
 */
const STEP_IN = {
  hidden: { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0 },
}

/*
 * THERE IS DELIBERATELY NO `flip` PROP. IT EXISTED, IT WAS WRONG, AND THE REASON IS WORTH KEEPING.
 *
 * A `flip` prop applied `scaleX(-1)` so the figure could face back towards the text when placed to
 * its right. The justification written here was that "no lettering on the artwork is legible at the
 * permitted size, so nothing reads backwards."
 *
 * That was false, and the visitor caught it: every figure holds a passport with `PASSPORT` and the
 * issuing country set across it, and mirroring the image mirrors the lettering. At 160px the words
 * are not readable as words — which is exactly why the claim survived being written — but a block of
 * text with its letters reversed is recognisable as *wrong* long before it is legible enough to read.
 * The eye catches backwards type at a size where it cannot yet spell it out. That is the whole error:
 * legibility was tested, and the wrongness of mirrored type is not a question of legibility.
 *
 * SO FACING IS A PLACEMENT DECISION, NOT A TRANSFORM. All five illustrations face RIGHT (seen over the
 * shoulder, backpack to the left of frame, passport held out to the right). A figure facing right
 * belongs to the LEFT of the text it introduces, so it looks into the page rather than out of it.
 * Every caller places it that way, and the layouts read the same as they did mirrored.
 *
 * THE GENERAL LESSON, and it is the second time this file has needed it: an illustration is not a
 * neutral shape. `scaleX(-1)` is free on a silhouette and destructive on anything containing type, a
 * flag, a clock face, or a hand — and which of those is true cannot be known from the filename. This
 * artwork contains type. Anything reversible must be verified by looking at the artwork, not by
 * reasoning about the size it is displayed at.
 */
export function TravellerFigure({
  src,
  /*
   * `delay` so the figure can arrive in cadence with the copy beside it rather than at the same
   * instant as everything else. Defaults to 0 for the plainest possible behaviour when a caller does
   * not care.
   */
  delay = 0,
  /*
   * `maxHeight` so the home page can show the traveller at something like human scale while the
   * country chapters keep them at the modest size that suits a figure standing beside a paragraph.
   * Any CSS length; passed straight through, because the caller knows what it is next to.
   */
  maxHeight = DEFAULT_MAX_HEIGHT,
  className = '',
}) {
  const prefersReducedMotion = useReducedMotion()

  /*
   * A missing portrait renders nothing rather than a placeholder. This is the opposite of
   * ImageFrame's decision, and deliberately so: a placeholder there holds the space a photograph
   * will occupy in a grid, whereas the traveller is a figure standing beside the text. An empty
   * rectangle labelled "traveller" would be a hole in the page rather than an honest gap, and the
   * layouts that use this are built so the copy is complete without it.
   *
   * The pipeline throws rather than emitting null for these (see `resolveTravellerAsset`), so this
   * branch should be unreachable — it is here so a component cannot crash on data it did not fetch.
   */
  if (!src) return null

  return (
    <motion.div
      /*
       * `aria-hidden` on the wrapper, so neither the image nor its container reaches the
       * accessibility tree. The figure is atmosphere: every fact it carries — the country, the stop,
       * that someone is guiding you — is already in the surrounding text. See the header note.
       */
      aria-hidden="true"
      className={[
        /*
         * `pointer-events-none` because it is not interactive and sits near text and links. An
         * illustration that swallows a click aimed at a link behind it is a bug that only shows up
         * at certain widths.
         */
        'pointer-events-none select-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      variants={STEP_IN}
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? false : 'visible'}
      /*
       * `once: true` so the traveller does not step in again every time the visitor scrolls past.
       * `amount: 0.4` waits until nearly half the figure is showing — an entrance that has already
       * finished before you see it is indistinguishable from no entrance at all.
       */
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {/*
       * `<picture>` with the AVIF first, exactly as ImageFrame does — and for these files the saving
       * is the largest on the site, since a 1.4-megapixel PNG with an alpha channel is the worst
       * case for PNG and close to the best case for AVIF.
       *
       * THE FALLBACK IS A PNG, NOT A JPEG, and that is not incidental: JPEG has no alpha channel, so
       * a JPEG fallback would reintroduce the white box that the pipeline's keying step exists to
       * remove. The pipeline publishes these as PNG for that reason.
       *
       * `h-auto` with the height capped by `maxHeight` rather than a fixed height: the five
       * illustrations have different aspect ratios (Japan's is portrait, Italy's is landscape), so
       * constraining the height and letting the width follow is what keeps all five the same visual
       * size without distorting any of them.
       */}
      <picture className="block">
        <source srcSet={toAvif(src)} type="image/avif" />
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="block h-auto w-auto"
          style={{
            maxHeight,
            /*
             * A shadow that grounds the figure. No transform — see the note above the component on why
             * mirroring is not available here.
             *
             * `drop-shadow` and not `box-shadow`: a box shadow would outline the image's rectangle,
             * which for a cut-out means a shadow around empty space. `drop-shadow` follows the alpha
             * channel, so it follows the figure's actual silhouette. Very soft and very weak — enough
             * that the traveller sits on the page rather than floating above it.
             */
            filter: 'drop-shadow(0 12px 18px color-mix(in oklab, var(--accent-ink) 22%, transparent))',
          }}
        />
      </picture>
    </motion.div>
  )
}
