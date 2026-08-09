/*
 * CoverPanel — the near-opaque cream panel that text sits on when it is over a photograph.
 *
 * ============================================================================================
 * WHY THIS EXISTS: IT IS WHERE THE CONTRAST GUARANTEE MOVED TO.
 *
 * A cover has two requirements that pull against each other. The photograph must be clearly
 * visible, and the text on it must have a guaranteed contrast ratio against a background that is
 * changing every seven seconds. The first version of this cover resolved that by fading the whole
 * image toward opaque page cream — which satisfies the ratio and makes the photograph functionally
 * absent exactly where the visitor is looking.
 *
 * This is the other resolution: leave the photograph alone and put the text on a panel. The
 * guarantee now covers a few hundred square pixels instead of the entire cover, so it can be much
 * stronger and cost almost nothing. The photograph is legible right up to the panel's edge.
 *
 * THE MEASUREMENT, taking the impossible worst case of a pure black photograph beneath the panel.
 * At 88% cream over black the effective background is #DEDBD5:
 *
 *     ink-900   12.87:1     display headings                    (needs 3:1 at that size)
 *     ink-700    8.46:1     body copy                           (needs 4.5:1)
 *     ink-500    4.31:1     eyebrows and captions at 14px       (needs 4.5:1 — SO NOT PERMITTED)
 *     accent-ink 3.67:1     India, the weakest of the five      (needs 3:1 at 24px+)
 *
 * Note what that table settles and what it forbids. `ink-500` does not clear 4.5:1 in the worst
 * case, so small secondary text on a cover panel must be `ink-700` — which is why the arrival's
 * eyebrow is ink-700 and not the ink-500 used for eyebrows on plain page surfaces. And the accent
 * clears only the large-text threshold, so it may never be set below 24px here.
 *
 * A real photograph is nowhere near black, so every figure above is a floor rather than an estimate.
 * The 3.67:1 is also better than the 3.11:1 the old full-cover scrim delivered, which is the part
 * worth noticing: the photograph got clearer and the text got safer at the same time.
 *
 * WHY `backdrop-blur` AND NOT A HIGHER OPACITY. The blur is what lets the panel be translucent
 * without the photograph's detail reading through the text — it removes high-frequency content
 * behind the letterforms, which is what actually harms legibility, while keeping the photograph's
 * colour and brightness showing through. Solving the same problem with more opacity would take the
 * panel to a flat rectangle and put us back where we started.
 *
 * IT IS PROGRESSIVE ENHANCEMENT, NOT A DEPENDENCY. `backdrop-filter` is supported everywhere current
 * but the 88% background is stated independently of it, so a browser that ignores the blur still
 * gets every ratio in the table above. The blur improves the look; the opacity does the work.
 *
 * WHY A COMPONENT RATHER THAN A UTILITY CLASS. The value that matters here is the 88%, and it is
 * load-bearing — every ratio in the table is computed from it. Written as a Tailwind class it would
 * be a number in a `className` string that looks adjustable, and someone reducing it to 70% for
 * looks would silently drop `ink-700` below 4.5:1 with nothing to warn them. In a component it has
 * one definition with the measurement attached to it.
 * ============================================================================================
 */

/*
 * The panel's own translucency, as a percentage of page cream. THE TABLE IN THE HEADER NOTE IS
 * COMPUTED FROM THIS NUMBER — lowering it invalidates all four ratios. If it ever needs to change,
 * re-measure rather than adjust by eye.
 */
const PANEL_CREAM = 88

export function CoverPanel({
  children,
  /*
   * `as` so the panel can be whatever the surrounding markup needs — a `<div>` for a hero's content
   * block, a `<figure>`, a `<blockquote>`. Semantics describe the document; this component describes
   * a background. Conflating the two is how a page ends up with a dozen meaningless `<div>`s or, worse,
   * a `<section>` nobody meant.
   */
  as: Element = 'div',
  className = '',
  ...rest
}) {
  return (
    <Element
      className={[
        /*
         * `backdrop-blur-md` is 12px. Enough to erase detail behind the text, not enough to turn the
         * photograph into a colour field — at 24px and above the image stops reading as a place.
         *
         * The border is the country's accent at very low strength: it gives the panel an edge so it
         * reads as something laid on the photograph rather than as a lighter patch of it, and it
         * carries the atmosphere into the one element on the cover that is not the photograph.
         */
        'rounded-2xl border border-[color-mix(in_oklab,var(--accent-ink)_14%,transparent)] backdrop-blur-md',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        backgroundColor: `color-mix(in oklab, var(--color-surface-page) ${PANEL_CREAM}%, transparent)`,
        /*
         * A soft shadow in the accent rather than in black. A black shadow on a photograph reads as
         * a UI card floating above a picture; an accent-tinted one reads as part of the same image.
         * Large blur, low opacity, no offset — the panel is meant to sit ON the photograph, not
         * hover above it, so there is no light source to imply a direction from.
         */
        boxShadow: '0 2px 40px color-mix(in oklab, var(--accent-ink) 12%, transparent)',
      }}
      {...rest}
    >
      {children}
    </Element>
  )
}
