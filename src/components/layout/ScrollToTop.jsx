import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/*
 * ScrollToTop — resets scroll position when the route changes.
 *
 * WHY THIS IS NECESSARY
 * A traditional website loads a new document per page, so the browser starts you at the
 * top. A single-page application swaps content without a page load, so the scroll
 * position simply stays where it was. Navigate from the bottom of Japan to India, and
 * you land halfway down India with no idea what you missed.
 *
 * This is the most common bug in hand-rolled React routing, and it is entirely invisible
 * during development, because developers reload rather than navigate.
 *
 * WHY IT RENDERS NOTHING
 * A component that returns `null` produces no markup. It exists purely to run an effect.
 * That is a legitimate and common React pattern — behaviour, packaged as a component so
 * it can sit in the tree and use hooks.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    /*
     * `behavior: 'instant'` rather than 'smooth'. A smooth scroll on route change means
     * the visitor watches the old page's content fly past before the new page arrives,
     * which reads as a glitch rather than a transition. Arriving somewhere new should be
     * instant; the *content* then animates in, which is what makes it feel like a
     * threshold being crossed (DESIGN_SYSTEM.md §7.3, pageTransition).
     */
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
