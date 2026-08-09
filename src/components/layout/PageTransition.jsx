import { motion } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'

/*
 * PageTransition — wraps page content so arriving somewhere feels like arriving.
 *
 * WHY A TRANSITION AT ALL (Principle 11: every animation has intent)
 * Name what it tells the visitor: "you have moved." Without it, clicking a country
 * replaces one screen with another instantaneously, which reads as a page glitching
 * rather than a threshold being crossed — and "crossing a threshold" is precisely the
 * feeling the vision asks for at each arrival (PRODUCT_VISION.md §3.1).
 *
 * It is deliberately short (350ms). A long page transition is a toll booth: charming
 * once, irritating by the fifth country.
 *
 * WHAT `motion.div` IS (Framer Motion concept)
 * An ordinary <div> that Framer Motion can animate. `initial` is the state it starts in,
 * `animate` is the state it moves toward, and Framer fills in every frame between them.
 * We animate only `opacity` and `transform` — never width, height, top or left, which
 * force the browser to recalculate layout on every frame.
 */
export function PageTransition({ children }) {
  /*
   * `useReducedMotion` reads the operating system's "reduce motion" setting.
   *
   * WHY WE CHECK IT IN JAVASCRIPT WHEN index.css ALREADY HANDLES CSS TRANSITIONS
   * The CSS media query cannot reach animations driven by JavaScript, which is what
   * Framer Motion uses. So motion-sensitive visitors need both guards. Some people
   * experience genuine nausea from movement — this is an accessibility requirement,
   * not a preference (DESIGN_SYSTEM.md §7.5).
   */
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    // No transform, no fade — content simply appears, complete and immediately usable.
    return <div>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        // `ease-out` — fast in, slow settle. Never `ease-in` on an entry: content that
        // accelerates as it arrives feels like it is falling.
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
