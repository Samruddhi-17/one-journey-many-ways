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
         * `object-cover object-bottom`, AND THE REASON THIS COMMENT USED TO GIVE FOR IT WAS FALSE.
         *
         * It claimed "the art in all five sheets sits along the LOWER portion of the image with the
         * top left as empty paper". Measured — ink coverage per fifth of each source, top to bottom,
         * as the percentage of pixels below luminance 225:
         *
         *     japan            1,   4,  12,   1   (plus 0 in the top fifth)
         *     india          100, 100,  90,  84,  83
         *     italy          100,  97,  82,  60,  98
         *     switzerland      1,  21,  62,  56,  18
         *     united-states    1,   8,  39,  73,  34
         *
         * Only Japan is the sheet that sentence describes. India and Italy are solid ink at the top,
         * and Switzerland's densest bands are its two MIDDLE ones with its emptiest at the foot —
         * the exact inverse of the claim. So the anchor was chosen for a property four of the five
         * sheets do not have.
         *
         * THE ANCHOR IS STILL RIGHT, for a smaller reason that survives measurement: the crop is
         * shallow. A 1536x1024 sheet in the rendered 584x312 box scales to 584x389, so `object-cover`
         * discards 77px — under 20%, and off the top. Bottom, centre and top anchoring therefore
         * differ by at most a fifth of the image, which is why no sheet's composition visibly moves
         * with the choice. Bottom is kept because it pins whatever is at the foot of the drawing to
         * the foot of the sheet as the text above reflows, and because changing it now would churn
         * five backgrounds to no measured end.
         *
         * WHAT THE MEASUREMENT DOES SETTLE is legibility, and that is the number to check if this
         * changes. Compositing each source's actual text-band rows at 18% over the card, the worst
         * pixel any line of the quotation sits on gives `ink-700` 8.11:1 (Japan), 7.62:1 (India),
         * 7.69:1 (Italy), 7.70:1 (Switzerland), 7.67:1 (United States) — a spread of half a point,
         * all far above 4.5:1. Switzerland's heavier middle costs it nothing.
         *
         * This is the third time a comment in this project asserted what an image file looks like
         * without opening it (see the two recorded in journey/TravellerFigure.jsx). The pattern is
         * always the same: the assertion is about art nobody re-checked, it justifies a line of CSS
         * that happens to be fine, and it survives because the CSS looks correct. Describing the
         * five sheets was never needed to defend one anchor value.
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
