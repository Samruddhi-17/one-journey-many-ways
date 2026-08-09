/*
 * Notepaper — the sheet the traveller's note is written on.
 *
 * ============================================================================================
 * WHAT THIS IS, AND WHY IT IS NOT JUST A BACKGROUND IMAGE.
 *
 * `images/` ships five sheets of stationery, one per country: cream paper with sepia line art of
 * that country's landmarks drawn along it — the Taj Mahal and a camel for India, the Matterhorn and a
 * lakeside village for Switzerland, Fuji and a pagoda for Japan. They are obviously drawn to have
 * something written on them, and like the portraits they shipped with the project and were rendered
 * nowhere (see the EXCLUDED note in scripts/convertData.mjs).
 *
 * The traveller's note is the single most important string in the dataset — it is the whole reason
 * the chapter has an argument, since it contradicts the brochure line above it. Putting it on the
 * traveller's own paper says "this was written by hand, somewhere else, by the person you are
 * travelling with" before a word is read. That is the register the quotation wants, and no amount of
 * italic display type gets there on its own.
 *
 * ============================================================================================
 * THE CONTRAST PROBLEM, AND THE MEASURED ANSWER.
 *
 * These are decorative drawings, not flat tints, so at full strength they are far too dark to set
 * body text on: the darkest pixel in India's sheet is #090000, which puts `ink-700` at 1.79:1 — text
 * that is simply unreadable where a line of the drawing passes under it. This is the same trap the
 * cover photographs presented, and it gets the same treatment: measure the worst case, then choose the
 * strength from the measurement rather than by eye.
 *
 * MEASURED, taking each sheet's single darkest pixel as the background under the text — a worse case
 * than any real line, since the drawings are sparse and mostly paper:
 *
 *     at 100% — ink-700 ranges 1.32:1 (Japan) to 1.79:1 (India)      unusable
 *     at  26% — ink-700 ranges 5.91:1 (India) to 6.52:1 (Japan)      passes, but the art is heavy
 *     at  18% — ink-700 ranges 7.28:1 (India) to 7.76:1 (Japan)      passes comfortably
 *     at  10% — ink-700 ranges 8.84:1 to 9.13:1                      the drawing stops reading
 *
 * 18% is the chosen strength: worst case 7.28:1 for body copy against a requirement of 4.5:1, and
 * 11.13:1 for `ink-900`. India is the weakest of the five and is the number that governs.
 *
 * NOTE WHAT THIS MEANS FOR `ink-500`. At 18% it measures about 3.7:1 on the darkest pixel, below the
 * 4.5:1 that small text needs — so the same rule the cover panel imposes applies here: the
 * attribution line under the quotation is `ink-700`, not the `ink-500` used for captions on plain
 * cream. That is the one thing this component costs.
 * ============================================================================================
 */

import { toAvif } from '../../lib/images'

/*
 * THE SHEET'S STRENGTH. Every ratio in the header note is computed from this number — lowering it
 * makes the drawing prettier and the text unreadable, raising it makes the drawing vanish. If it
 * changes, re-measure rather than adjust by eye. It is stated once, here, for the same reason
 * CoverPanel's 88% is: a load-bearing number written into a `className` looks adjustable.
 */
const PAPER_STRENGTH = 0.18

export function Notepaper({ src, children, className = '' }) {
  return (
    <div
      className={[
        /*
         * `isolate` so the sheet's negative z-index stays inside this element rather than falling
         * behind the page background — the standard symptom of a negative z-index with no isolating
         * ancestor, and the same guard the covers use.
         *
         * The border and the cream fill are stated independently of the image, so a browser that
         * fails to load the drawing still gets a sheet of paper rather than a bare paragraph. The
         * decoration is an enhancement; the surface is not.
         */
        'relative isolate overflow-hidden rounded-2xl bg-surface-card',
        'border border-[color-mix(in_oklab,var(--accent-ink)_12%,transparent)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {src ? (
        /*
         * THE DRAWING, absolutely positioned behind the content at the measured strength.
         *
         * `aria-hidden` and an empty `alt`: it is decoration, and a screen-reader user hearing "line
         * drawing of the Taj Mahal, a temple and a camel" before the traveller's note would be told
         * about the stationery instead of the writing on it.
         *
         * `object-cover object-bottom` — the art in all five sheets sits along the LOWER portion of
         * the image with the top left as empty paper, which is exactly the shape a note wants:
         * anchoring to the bottom keeps the drawing at the foot of the sheet as the text above it
         * grows or shrinks with the viewport. Anchoring to the centre would slide the landmarks up
         * through the paragraph on a narrow screen.
         */
        <picture aria-hidden="true" className="absolute inset-0 -z-10 block">
          <source srcSet={toAvif(src)} type="image/avif" />
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-bottom"
            style={{ opacity: PAPER_STRENGTH }}
          />
        </picture>
      ) : null}

      {children}
    </div>
  )
}
