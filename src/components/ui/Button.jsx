import { Link } from 'react-router-dom'

/*
 * Button — the single interactive primitive. Renders as a <button> or a <Link>.
 *
 * WHY ONE COMPONENT FOR BOTH
 * A "button" that navigates should be an <a>/<Link>; a "button" that performs an action
 * should be a <button>. Getting this wrong is one of the most common accessibility faults
 * on the web: a <div onClick> is invisible to keyboard users, and a <button> that
 * navigates breaks middle-click, ctrl-click and "open in new tab".
 *
 * So the component decides the element from whether a `to` prop was passed. Callers get
 * one consistent API and cannot easily get the semantics wrong.
 *
 * WHY THE PRIMARY BUTTON IS FILLED WITH `--accent-ink` AND NOT `--accent-mark`
 * This is a corrected bug, and the correction is worth recording because the original
 * reasoning was plausible and wrong.
 *
 * The primary button is white text on a coloured fill, so the fill has to carry the
 * contrast. The button label is 16px at weight 600, and I had claimed that counted as
 * WCAG "large text" — where the threshold relaxes from 4.5:1 to 3:1 — which would have
 * made `--accent-mark` legal as a fill.
 *
 * It does not count. WCAG 2.2 defines large text as 18pt (24px) regular OR 14pt
 * (18.66px) bold. 16px/600 is below both, so it is NORMAL text and needs the full
 * 4.5:1. Measured white-on-mark, three of the five countries failed:
 *
 *   country         --accent-mark   ratio     --accent-ink   ratio
 *   Japan / shell   #2a78d6         4.42 FAIL  #184f95        8.10 PASS
 *   India           #d95926         3.88 FAIL  #B4530A        5.02 PASS
 *   Italy           #9E2A2B         7.45 PASS  #87201F        9.31 PASS
 *   Switzerland     #199e70         3.41 FAIL  #0F7A55        5.34 PASS
 *   United States   #4a3aa7         8.56 PASS  #3E3090       10.34 PASS
 *
 * `--accent-ink` is the right token by definition: tokens.css specifies mark as the
 * >=3:1 token for CHART FILLS and ink as the >=4.5:1 token for TEXT. A white label on a
 * coloured field is a text contrast problem, so it belongs to the text token. Reaching
 * for `mark` because the button is a large coloured shape confused the shape with its
 * label. The 3:1 tokens are for marks nobody has to read.
 *
 * The lesson generalises: "it's basically large text" is not a WCAG category. Measure.
 */

const VARIANTS = {
  // One per section, maximum. A screen with two primary buttons has no primary action.
  primary:
    /*
     * DARKEN on interaction, never lighten — the direction is a contrast decision.
     *
     * The label is white, so lightening the fill moves it TOWARD the label and lowers
     * contrast. Measured: `brightness-110` on India's #B4530A gives #c65b0b = 4.27:1,
     * which fails 4.5:1 on hover even though the rest state passes at 5.02:1. A state
     * that is only reachable by pointing at the control is exactly the kind of failure
     * that never shows up in a screenshot.
     *
     * Darkening a dark fill can only raise the ratio, so once the rest state passes,
     * every interaction state passes by construction rather than by re-measurement.
     * Worst case across all 5 countries x 3 states is 5.02:1 (India, at rest).
     */
    'bg-[var(--accent-ink)] text-white hover:brightness-92 active:brightness-88 active:scale-[0.98]',
  secondary:
    'border border-[var(--accent-ink)] text-[var(--accent-ink)] hover:bg-[var(--accent-wash)]',
  ghost: 'text-ink-700 hover:text-ink-900 hover:bg-surface-sunken',
}

const SIZES = {
  // 44px is the WCAG 2.5.5 minimum touch target — `md` is the smallest safe size on a
  // phone. There is deliberately no `sm`: this site has no dense toolbars that would
  // justify one, and offering it would invite an accessibility regression.
  md: 'h-11 px-6 text-[15px] font-medium',
  lg: 'h-13 px-8 text-base font-semibold',
}

export function Button({
  children,
  to, // internal route — renders a <Link>
  href, // external URL — renders an <a>
  onClick, // action — renders a <button>
  variant = 'primary',
  size = 'lg',
  type = 'button',
  className = '',
  ...rest
}) {
  const classes = [
    // `inline-flex` + `items-center` vertically centres the label and any icon reliably,
    // which line-height alone does not do across font sizes.
    'inline-flex items-center justify-center gap-2 rounded-md',
    'transition-[filter,background-color,transform,color] duration-200',
    // `select-none` stops a double-click from highlighting the label like body text,
    // which makes a button feel like a control rather than text.
    'select-none',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.lg,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      /*
       * `rel="noreferrer"` alongside `target="_blank"`: without it, the newly opened page
       * gets a reference back to this one and can navigate it elsewhere. A security
       * default, not an optimisation.
       */
      <a href={href} target="_blank" rel="noreferrer" className={classes} {...rest}>
        {children}
      </a>
    )
  }

  return (
    /*
     * `type="button"` is explicit because a <button> inside a <form> defaults to
     * type="submit" and will submit the form when clicked. A surprising default worth
     * neutralising every time.
     */
    <button type={type} onClick={onClick} className={classes} {...rest}>
      {children}
    </button>
  )
}
