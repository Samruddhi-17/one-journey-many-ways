/*
 * Paper — the physical surface the journal is made of.
 *
 * ============================================================================================
 * WHAT THIS IS AND WHY IT IS NOT `Notepaper`.
 *
 * `Notepaper` renders one of five supplied PNGs — a country's own stationery, with sepia line art of
 * its landmarks along the foot. It is artwork, it is per-country, and its strength (18%) is measured
 * against the darkest pixel of those drawings.
 *
 * This is the surface underneath all of that: cream, a hairline edge, a grain, optionally a spine and
 * a ruled margin. No image, no country, nothing to measure — which is what lets it be used in places
 * a 1536×1024 PNG cannot go, starting with the home page's closed journal, where there is no country
 * yet and therefore no stationery to use.
 *
 * The two compose rather than compete: a country spread is a `Paper` with a `Notepaper` inside it.
 *
 * ============================================================================================
 * WHY THE GRAIN IS AN INLINE SVG AND NOT AN IMAGE FILE.
 *
 * `feTurbulence` is SVG's fractal-noise generator, and a 120×120 tile of it as a data URI is under
 * 400 bytes — smaller than the HTTP request an image would need, with no extra file for the pipeline
 * to process and no chance of it 404ing. It is also resolution-independent: a PNG grain shows its own
 * pixel grid on a high-DPI screen, which is the exact opposite of the intended effect.
 *
 * `baseFrequency` 0.9 is a fine grain rather than a cloudy one — low values give visible blotches
 * that read as a dirty screen. The tile repeats, and at this frequency the repeat is not detectable
 * because the eye has no feature large enough to latch onto.
 *
 * THE STRENGTH IS 3.5% AND THAT IS AN ACCESSIBILITY CEILING, NOT A TASTE ONE. The grain sits ABOVE
 * the text (it has to, or it would be invisible under an opaque surface) at `mix-blend-mode:
 * multiply`, so it darkens whatever is beneath it — including glyphs. At 3.5% over cream the shift is
 * under one step of the ink scale and every contrast ratio the project has measured still holds. Past
 * about 8% it starts to veil small text, which is a legibility cost paid for a texture nobody would
 * notice. `pointer-events-none` because an overlay across the whole surface would otherwise eat every
 * click meant for the content under it.
 * ============================================================================================
 */

/*
 * The grain tile. Declared at module scope so the string is built once rather than per render.
 *
 * Written as a single line with no spaces after the commas in `values` — a data URI containing raw
 * spaces works in most browsers and is technically invalid, and the failure is silent (no grain, no
 * error). Percent-encoding the `#` and the angle brackets is what makes it safe inside `url()`.
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")"

const GRAIN_STRENGTH = 0.035

export function Paper({
  children,
  /*
   * `spine` draws the bound edge on the left — a soft inward shadow and two hairlines, which is what
   * the gutter of an open book actually looks like. Off by default because most sheets are loose.
   */
  spine = false,
  /*
   * `ruled` draws the single vertical margin rule of a field notebook, inset from the left edge.
   * Deliberately NOT horizontal lines: ruled lines behind body copy at a spacing that does not match
   * the line-height reads as a rendering fault, and matching it would tie this surface to one type
   * scale. One vertical rule says "notebook" without making that promise.
   */
  ruled = false,
  grain = true,
  /*
   * `bordered` — the hairline edge, on by default because a loose sheet has one.
   *
   * OFF WHEN THE PAPER IS ALREADY INSIDE SOMETHING THAT HAS AN EDGE, which is the facet card's case:
   * the card draws its own border and its own radius, and a second hairline just inside them reads as
   * a rendering fault rather than as two objects. A prop rather than `className="border-0"` because
   * Tailwind's `border` and `border-0` set the same property at the same specificity, so which one
   * wins depends on their order in the generated stylesheet rather than in the class string — the kind
   * of override that works until the build reorders it.
   */
  bordered = true,
  /*
   * `tone` — which of the two paper stocks this sheet is.
   *
   * 'card' (#ffffff) is the default and is right for an OBJECT: the journal's cover, a sheet lying on
   * the page. Being brighter than the cream page is what lifts it off the page.
   *
   * 'page' (#fdf9f3) is for a sheet that IS the page — the facet panel, which fills the width of its
   * card and sits directly against a cream section. White there does the opposite of what the paper is
   * for: it reads as a dashboard panel again, and it puts a visible seam between the panel and the
   * question row above it, which is the same class of defect as the footer seam.
   *
   * A PROP AND NOT A `className` OVERRIDE for the reason given on `bordered`: `bg-surface-card` and
   * `bg-surface-page` are the same property at the same specificity, so the winner depends on the
   * order Tailwind happens to emit them in, not on the order they appear in the class string.
   */
  tone = 'card',
  className = '',
  ...rest
}) {
  return (
    <div
      className={[
        /*
         * `isolate` so the grain's stacking and the spine's shadow stay inside this element. Same
         * guard the covers and Notepaper use, and the same symptom without it: a negative z-index
         * child falling behind the page background.
         */
        'relative isolate overflow-hidden',
        /* See the `tone` prop. A fixed class per branch, not an interpolated one — Tailwind compiles
           by scanning source text, so `bg-surface-${tone}` would never be generated. */
        tone === 'page' ? 'bg-surface-page' : 'bg-surface-card',
        /*
         * A warm hairline in the active country's accent rather than a grey border. On the home page
         * the accent is the neutral shell blue, which is correct there — the shell is silent.
         */
        bordered && 'border border-[color-mix(in_oklab,var(--accent-ink)_14%,transparent)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {spine ? (
        /*
         * THE BOUND EDGE. Two elements rather than one: a gradient for the curve of the paper into
         * the gutter, and a hairline for the crease itself. A single dark line looks like a border; a
         * gradient alone looks like a smudge. Together they read as depth.
         *
         * `aria-hidden` throughout — this is the physical object, and none of it is information.
         */
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[color-mix(in_oklab,var(--accent-ink)_11%,transparent)] to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-px bg-[color-mix(in_oklab,var(--accent-ink)_26%,transparent)]"
          />
        </>
      ) : null}

      {ruled ? (
        /*
         * The margin rule. Inset far enough that content padded past it does not collide, and drawn
         * in the accent at low strength so it belongs to the country rather than to the chrome.
         */
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-8 w-px bg-[color-mix(in_oklab,var(--accent-ink)_18%,transparent)] md:left-12"
        />
      ) : null}

      {children}

      {grain ? (
        /*
         * THE GRAIN LAST IN THE DOM so it lies over the content without needing a z-index — later
         * siblings paint on top. See the header note on why 3.5% is a ceiling.
         */
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-multiply"
          style={{ backgroundImage: GRAIN, opacity: GRAIN_STRENGTH }}
        />
      ) : null}
    </div>
  )
}
