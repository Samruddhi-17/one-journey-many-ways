import { toAvif } from '../../lib/images'

/*
 * ImageFrame — a photograph, or an honest space where one will go.
 *
 * ============================================================================================
 * WHY THIS COMPONENT EXISTS
 *
 * A DATA-QUALITY FACT DROVE IT, AND THAT FACT HAS SINCE BEEN FIXED — which is worth recording
 * accurately, because the original reason no longer holds and the component is still right.
 *
 * AS WRITTEN: of the fifteen cultural experiences in the dataset (three per country), only five had
 * images on disk — Japan's Hanami, Tea Ceremony and Shinkansen, plus India's Holi and Thali. The
 * other ten rows resolved to `image: null`, because `resolveAsset` could not find a file and
 * recorded null rather than inventing a path. Italy, Switzerland and the United States had no
 * experience photographs at all.
 *
 * AS OF NOW: all fifteen resolve. Artwork arrived for the missing ten, so every call site in
 * FacetEvidence passes a real `src` and the placeholder branch below is dead code THERE.
 *
 * WHY THE COMPONENT SURVIVES THAT, rather than being simplified away. Two reasons, and the second
 * is the one that matters:
 *
 *   1. Nulls are still reachable by construction. `resolveAsset` returns null for an empty
 *      workbook cell, so a re-export of the spreadsheet with a blank row reinstates the case
 *      immediately — and it must not take the layout down with it.
 *   2. The layout must work in both cases regardless of which case today's data happens to be in,
 *      and the decision about which case we are in belongs in ONE component rather than in an
 *      `image ? … : …` ternary repeated at every call site. That was the actual argument all along;
 *      the ten missing files were the occasion for it, not the justification.
 *
 * THE GENERAL LESSON, since this comment nearly became a lie: a note that states today's data as
 * the reason for a design decision has a short shelf life. The durable version names the invariant
 * (a null src must not collapse the layout) and cites the data as evidence.
 *
 * NOTE THAT A NULL SRC IS NOT ALWAYS THIS COMPONENT'S PROBLEM TO SOLVE. FacetCard's "did you know"
 * photograph renders NOTHING when America has no image, rather than calling this with a null — a
 * placeholder is right when it holds a slot in a grid that would otherwise collapse and the
 * photograph is genuinely expected later, and wrong when the text is the whole content and no
 * photograph is coming. Callers decide that; this component decides how to render the gap once
 * they have.
 *
 * WHAT A GOOD PLACEHOLDER IS, AND WHAT IT IS NOT
 *
 * NOT a grey box with a broken-image icon: that reads as a malfunction, and a visitor cannot tell
 * a deliberate gap from a bug.
 * NOT a stock photograph of somewhere else: that would be a factual claim about a country, made
 * with an image of a different one. Accuracy is not negotiable for atmosphere (Principle 15).
 * NOT the layout collapsing to text: the whole point of the placeholder is that the page's
 * composition is finished, so that adding the real photograph later changes nothing but the
 * pixels inside this frame.
 *
 * SO IT IS: the frame at its true aspect ratio, filled with a soft wash of the active country's
 * own accent, carrying the subject's name as visible text. It looks intentional because it IS
 * intentional — it says "a photograph of the tea ceremony belongs here", which is honest, and it
 * holds the exact space the photograph will occupy.
 *
 * ACCESSIBILITY, AND THE ONE DECISION WORTH NOTING
 *
 * When there is a photograph, `alt` describes it. When there is not, the frame is `aria-hidden`
 * and the label inside it is ordinary text — because a screen-reader user gains nothing from
 * "image placeholder for tea ceremony". They should hear the section's real content, which is the
 * heading and description sitting beside this frame. A placeholder announcing itself would be
 * noise about our asset pipeline, not information about Japan.
 *
 * `aspect-ratio` rather than a fixed height: the frame scales with its column at every viewport,
 * and reserving the space prevents the layout shifting as photographs decode (§3.5).
 * ============================================================================================
 */


export function ImageFrame({
  src,
  alt,
  /*
   * `label` is what the placeholder displays when `src` is null. It is required in that case and
   * ignored otherwise — the subject of the missing photograph, e.g. "Tea Ceremony".
   */
  label,
  /* Tailwind aspect utility. Defaults to 4/3, the ordinary editorial photograph. */
  aspect = 'aspect-[4/3]',
  className = '',
  /*
   * `loading` is exposed so a caller can opt out of lazy loading for an above-the-fold image.
   * Everything in the Culture section is below the fold, so the default is correct there.
   */
  loading = 'lazy',
}) {
  const shared = `overflow-hidden rounded-xl ${aspect} ${className}`

  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={`${shared} flex items-end bg-[var(--accent-wash)] ring-1 ring-inset ring-ink-200`}
        /*
         * `ring-1 ring-inset` rather than a border: an inset ring does not add to the element's
         * size, so the frame's aspect ratio stays exactly what was asked for. A border would make
         * the placeholder 2px taller than the photograph that eventually replaces it.
         */
      >
        {/*
         * The label sits at the bottom-left, where a photo caption would — so the placeholder
         * occupies the same visual role as the finished image rather than looking like an error
         * state. `text-ink-500` measures 5.63:1 on the page and the accent wash is an ~8% tint,
         * which does not meaningfully lower it.
         */}
        <span className="p-4 text-xs font-medium uppercase tracking-[0.14em] text-ink-500">
          {label}
        </span>
      </div>
    )
  }

  return (
    <div className={shared}>
      {/*
       * `<picture>` WITH AN AVIF SOURCE AND THE JPEG AS THE FALLBACK.
       *
       * HOW IT WORKS: the browser reads the `<source>` elements in order, takes the first whose
       * `type` it can decode, and ignores the rest. If it understands none of them it uses the
       * `<img>`. So a modern browser transfers the AVIF (56% smaller across this site's
       * photographs, measured) and anything older transfers exactly what it did before.
       *
       * THE `<img>` IS NOT OPTIONAL AND IS NOT A SECOND IMAGE. It is the element that actually
       * renders — `<source>` only supplies a candidate URL. Everything that describes the
       * picture therefore stays on the `<img>`: `alt`, `loading`, `decoding`, and the classes.
       * Putting `alt` on a `<source>` would silently do nothing, which is the standard mistake
       * with this element.
       *
       * `block h-full w-full` ON THE `<picture>` ITSELF, and this is a real trap rather than a
       * precaution. `<picture>` is an ordinary inline element with no intrinsic size, and it is
       * now the `<img>`'s parent. `h-full` means `height: 100%`, which resolves against the
       * PARENT — so wrapping the image without sizing the wrapper makes the image 100% of
       * nothing, and the photograph collapses to its own intrinsic height inside a frame that no
       * longer constrains it. Sizing the wrapper to fill the frame restores the exact geometry
       * the `<div>`'s aspect ratio established.
       */}
      <picture className="block h-full w-full">
        <source srcSet={toAvif(src)} type="image/avif" />
        <img
          src={src}
          alt={alt}
          loading={loading}
          /*
           * `decoding="async"` lets the browser decode off the main thread, so a large JPEG cannot
           * stall scrolling. `object-cover` fills the frame without distorting the subject — the
           * alternative, `object-fill`, would stretch faces.
           */
          decoding="async"
          className="h-full w-full object-cover"
        />
      </picture>
    </div>
  )
}
