import { useEffect, useState } from 'react'

/*
 * ScrollProgressBar — a 2px line across the top showing how far through a page
 * the visitor has read.
 *
 * WHY THIS EARNS ITS PLACE (Principle 11: every animation has intent)
 * The test for any motion is "name what this tells the visitor." This one answers
 * "how much is left?" on pages that are deliberately long. Without it, a scrolling
 * story of unknown length feels bottomless — and a visitor who cannot see an end
 * is more likely to abandon it.
 *
 * It is also the only element that uses the country's accent in the chrome, which is
 * a deliberate exception: it is the one piece of shell that reports progress through
 * a *country*, so wearing that country's colour is accurate rather than decorative.
 */
export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function handleScroll() {
      // Total scrollable distance = full document height minus one viewport.
      const scrollable = document.documentElement.scrollHeight - window.innerHeight

      // Guard against division by zero on pages shorter than the viewport, which
      // would otherwise produce NaN and render an invalid width.
      if (scrollable <= 0) {
        setProgress(0)
        return
      }

      setProgress(Math.min(1, window.scrollY / scrollable))
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    /*
     * `aria-hidden` because this is purely decorative: the information it conveys is
     * already available to a screen reader, which reports position in the document
     * natively. Announcing a percentage on every scroll event would be noise.
     *
     * We animate `transform: scaleX` rather than `width`. Width changes force the
     * browser to recalculate layout on every frame and drop to roughly 15fps on a
     * phone; transforms are handled by the compositor on the GPU. This is the single
     * most important performance rule in the design system (§7.4).
     */
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-[var(--accent-mark)]"
      style={{ transform: `scaleX(${progress})` }}
    />
  )
}
