/*
 * Section — the vertical rhythm primitive. Almost every block of content uses it.
 *
 * WHY THIS COMPONENT EXISTS
 * The single most important spacing decision in the project is that sections get 96px of
 * padding on mobile and 128px on desktop (DESIGN_SYSTEM.md §5.1). That generous padding is
 * the *mechanism* that delivers "one idea per moment" (Principle 4) — it physically pushes
 * the next section off screen so the current one owns the viewport.
 *
 * A dashboard uses 16–24px between panels to maximise density. If this site ever starts
 * feeling like a dashboard, insufficient section padding will be the cause. Encoding it in
 * one component means it cannot drift section by section.
 *
 * WHAT "PROPS" ARE (React concept)
 * Props are the inputs to a component — the arguments to a function, essentially. Written
 * as attributes in JSX (`<Section width="prose">`), received as an object. They flow one
 * way: parent to child. A child can never modify its own props, which is what makes
 * data flow in a React app traceable.
 */

// Defined outside the component so these objects are created once at module load, not on
// every render. Also serves as a whitelist: an unknown width silently falls back rather
// than injecting an arbitrary class.
const WIDTHS = {
  prose: 'max-w-(--container-prose)', //  680px — body copy
  content: 'max-w-(--container-content)', // 1080px — standard sections
  wide: 'max-w-(--container-wide)', // 1360px — galleries
  full: 'max-w-none', // full-bleed
}

const SPACING = {
  // The default. Large on purpose.
  normal: 'py-24 md:py-32',
  // For sections that sit directly against a related one and should read as a pair.
  tight: 'py-16 md:py-20',
  // The component supplies no padding; the caller handles it (hero sections).
  none: '',
}

const SURFACES = {
  page: '', // inherits the cream page background
  card: 'bg-surface-card',
  sunken: 'bg-surface-sunken',
  ink: 'bg-surface-ink text-ink-100',
}

export function Section({
  children,
  width = 'content',
  spacing = 'normal',
  surface = 'page',
  /*
   * `as` lets the caller choose the HTML element — `<section>` by default, but `<div>`
   * where no semantic sectioning is meant.
   *
   * WHY THIS MATTERS: screen readers navigate by landmark and heading structure. Wrapping
   * everything in <section> creates a long list of unnamed regions, which is worse than
   * none. Semantics should describe the document, not the styling.
   */
  as: Element = 'section',
  /*
   * `ariaLabelledBy` connects a <section> to its own heading, giving the landmark an
   * accessible name. A <section> without a name is announced as an anonymous "region",
   * which tells a screen-reader user nothing.
   */
  ariaLabelledBy,
  className = '',
  innerClassName = '',
}) {
  return (
    <Element
      aria-labelledby={ariaLabelledBy}
      className={[SPACING[spacing], SURFACES[surface], className].filter(Boolean).join(' ')}
    >
      {/* The inner wrapper handles horizontal centring and gutters. Content never touches
          the viewport edge unless it is deliberately full-bleed. */}
      <div
        className={[
          'mx-auto px-5 md:px-8 lg:px-12',
          WIDTHS[width] ?? WIDTHS.content,
          innerClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </Element>
  )
}
