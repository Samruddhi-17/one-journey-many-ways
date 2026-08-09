import { useLayoutEffect } from 'react'
import { NEUTRAL_ATMOSPHERE } from '../data/countries'

/*
 * useAtmosphere — applies a country's atmosphere to the whole document.
 *
 * WHAT A "HOOK" IS (new React concept)
 * A hook is a plain function whose name starts with `use`, which lets a component tap
 * into React features. `useEffect` is the built-in hook for "do something that touches
 * the world outside React" — here, setting CSS variables on <html>.
 *
 * Custom hooks like this one exist so logic can be reused by many components without
 * duplicating it. Think of it as a stored procedure: named, parameterised, called from
 * many places, defined once.
 *
 * WHY CSS VARIABLES INSTEAD OF PASSING COLOURS AS PROPS
 * If every component needed an `accentColor` prop, every component in the tree would
 * have to receive and forward it — dozens of components caring about something only a
 * few actually use. Setting four CSS variables at the root means any element at any
 * depth can write `color: var(--accent-ink)` and get the right value automatically.
 *
 * That is what makes DESIGN_SYSTEM.md §1's rule enforceable: components never branch on
 * which country they are rendering. There is no `if (country === 'japan')` anywhere in
 * this codebase, and there should never be one.
 *
 * WHY NOT JUST SET IT DURING RENDER
 * React render functions must be pure — same inputs, same output, no side effects.
 * Touching document.documentElement is a side effect, so it belongs in an effect.
 *
 * ------------------------------------------------------------------------------------
 * WHY `useLayoutEffect` AND NOT `useEffect` — THIS WAS A REAL, VISIBLE BUG.
 *
 * The two hooks look interchangeable and differ in exactly one way that matters here:
 * WHEN they run relative to the browser painting the screen.
 *
 *   useEffect       — React updates the DOM, THE BROWSER PAINTS, then the effect runs.
 *   useLayoutEffect — React updates the DOM, the effect runs, THEN the browser paints.
 *
 * With `useEffect`, the country's accent was therefore applied one frame too late. For
 * that first frame the page painted with whatever `--accent-ink` already was, which is
 * the fallback declared in tokens.css. Measured on the built site: opening /italy showed
 * Italy's epithet, its active nav item and its pull-quote mark in Japan's blue, and the
 * whole day chart in blue bars — because `--chart-ordinal-1..5` are `color-mix`ed from
 * `--accent-ink`, so one late variable repainted an entire visualisation. Four of the
 * five countries arrived wearing the wrong country's colour.
 *
 * That is not a cosmetic nitpick. Principle 13 is "consistent structure, distinct
 * atmosphere", and a country's first frame is the single moment the atmosphere is
 * supposed to do its work. Arriving in the previous chapter's palette is the exact
 * failure the whole atmosphere architecture exists to prevent.
 *
 * WHY THIS IS A LEGITIMATE USE OF A HOOK USUALLY WORTH AVOIDING. `useLayoutEffect` is
 * discouraged by default because it blocks painting: slow work inside it delays the
 * frame. The caution is about cost, not correctness, and the standard advice is to use
 * it precisely when a value must be applied before the visitor can see the unstyled
 * state. This effect sets four CSS custom properties — micro-seconds of work — and its
 * whole purpose is to be true before the first frame. That is the case the hook is for.
 *
 * A NOTE ON SERVER RENDERING, so this is not mistaken for an oversight: `useLayoutEffect`
 * logs a warning if it ever runs during server-side rendering, since there is no layout
 * to read on a server. This site is a static client-rendered bundle with no SSR step, so
 * that cannot occur. If SSR is ever introduced, the correct fix is to emit the accent as
 * an inline `style` attribute in the server's HTML — not to move this back to `useEffect`,
 * which would reintroduce exactly the bug described above.
 * ------------------------------------------------------------------------------------
 */
export function useAtmosphere(atmosphere) {
  // Fall back to the neutral shell atmosphere when no country is active
  // (Home, a 404, any non-country route).
  const active = atmosphere ?? NEUTRAL_ATMOSPHERE

  useLayoutEffect(() => {
    const root = document.documentElement

    root.style.setProperty('--accent-mark', active.mark)
    root.style.setProperty('--accent-ink', active.ink)
    root.style.setProperty('--accent-wash', active.wash)
    root.style.setProperty('--atmosphere-pace', String(active.pace))

    /*
     * The cleanup function. React runs this before the effect re-runs and when the
     * component unmounts. Resetting to neutral means leaving a country page cannot leave
     * its colour behind on the next screen — a bug that is invisible in development
     * (where you reload constantly) and obvious in production.
     */
    return () => {
      root.style.setProperty('--accent-mark', NEUTRAL_ATMOSPHERE.mark)
      root.style.setProperty('--accent-ink', NEUTRAL_ATMOSPHERE.ink)
      root.style.setProperty('--accent-wash', NEUTRAL_ATMOSPHERE.wash)
      root.style.setProperty('--atmosphere-pace', String(NEUTRAL_ATMOSPHERE.pace))
    }
    // The dependency array: re-run only when one of these values actually changes.
    // We list individual primitives rather than the object, because a new object with
    // identical contents would re-trigger the effect on every render.
  }, [active.mark, active.ink, active.wash, active.pace])
}

/*
 * ============================================================================================
 * DEVELOPMENT-ONLY: does the stylesheet's fallback still match NEUTRAL_ATMOSPHERE?
 *
 * THE PROBLEM THIS GUARDS. The neutral accent values exist twice, and they have to: once as
 * `NEUTRAL_ATMOSPHERE` in src/data/countries.js, and once as literal `--accent-*` declarations
 * in src/styles/tokens.css. A stylesheet cannot import a JavaScript value, so there is no way
 * to write them once. Two copies of the same decision is exactly the shape of a bug that
 * appears months later, when someone changes one of them.
 *
 * WHY A CONSOLE WARNING RATHER THAN A TEST. The mismatch is only observable in a browser —
 * it needs a real stylesheet applied to a real document, which is precisely what a unit test
 * does not have. The check below reads the value the browser actually computed, so it cannot
 * be fooled by a token that looks right in the source but is overridden somewhere else.
 *
 * THE COLOUR COMPARISON GOES THROUGH THE BROWSER ON PURPOSE. `#2a78d6` and `rgb(42, 120, 214)`
 * are the same colour and different strings, so comparing the raw text would report drift that
 * does not exist. Assigning each value to a throwaway element and reading back the computed
 * `color` lets the browser normalise both sides to the same notation first. Hand-rolling that
 * conversion was tried and produced nonsense.
 *
 * `import.meta.env.DEV` is replaced by the literal `false` at build time, so this entire block —
 * including the message strings — is removed from the production bundle by dead-code
 * elimination. It costs the visitor nothing.
 * ============================================================================================
 */
if (import.meta.env.DEV) {
  const normalise = (value) => {
    const probe = document.createElement('span')
    probe.style.color = value
    document.body.appendChild(probe)
    const computed = getComputedStyle(probe).color
    probe.remove()
    return computed
  }

  const rootStyle = getComputedStyle(document.documentElement)
  const drifted = [
    ['--accent-mark', NEUTRAL_ATMOSPHERE.mark],
    ['--accent-ink', NEUTRAL_ATMOSPHERE.ink],
    ['--accent-wash', NEUTRAL_ATMOSPHERE.wash],
  ].filter(([property, expected]) => {
    const declared = rootStyle.getPropertyValue(property).trim()
    // An empty value means the token is missing from tokens.css entirely, which is also drift.
    return declared === '' || normalise(declared) !== normalise(expected)
  })

  if (drifted.length > 0) {
    console.warn(
      '[atmosphere] tokens.css and NEUTRAL_ATMOSPHERE disagree on ' +
        drifted.map(([property]) => property).join(', ') +
        '. These are two copies of the same decision and both must change together — ' +
        'see the note above the :root block in src/styles/tokens.css.',
    )
  }
}
