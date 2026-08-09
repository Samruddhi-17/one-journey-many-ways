import { motion, useReducedMotion } from 'framer-motion'

/*
 * Reveal — fades its children up as they scroll into view.
 *
 * WHY THIS IS A COMPONENT AND NOT COPY-PASTED MOTION PROPS
 * The hero could hand-write its entrance because it animates on *mount*: it is already on
 * screen when the page loads. Everything below the fold has a different problem — it must
 * wait until the visitor actually reaches it. That needs viewport detection, and viewport
 * detection has three settings that must be identical everywhere or the page feels
 * arrhythmic. Encoding them once means every section below the fold breathes the same way.
 *
 * NEW BROWSER CONCEPT: IntersectionObserver
 * The old way to detect "is this element visible?" was to listen to every scroll event and
 * measure the element's position — which runs our JavaScript dozens of times a second and
 * forces the browser to recalculate layout each time. IntersectionObserver inverts it: you
 * register interest in an element and the browser notifies you when its visibility crosses
 * a threshold. The work happens off the main thread, so it costs approximately nothing.
 *
 * Framer Motion's `whileInView` is a wrapper over exactly that. We never touch the
 * observer directly.
 *
 * THE THREE SETTINGS, AND WHY EACH IS WHAT IT IS
 *
 *   `once: true` — animate the first time only, then stop observing.
 *      Without it, scrolling back up re-triggers the fade. Content that re-animates every
 *      time it passes the viewport turns a page into an aquarium: motion becomes the
 *      subject rather than the content. It is also the difference between a one-time cost
 *      and a permanent one, since `once` lets the browser discard the observer.
 *
 *   `amount: 0.25` — fire when a quarter of the element is showing.
 *      At 0 it fires as the first pixel appears, so on a fast scroll the animation is
 *      already finished before you look at it — you see nothing and paid for it anyway.
 *      At 1 a tall block never fires at all, because it is never fully in view.
 *
 *   `margin: '0px 0px -10% 0px'` — shrink the trigger area 10% up from the bottom.
 *      This delays the start slightly so the content is comfortably on screen rather than
 *      animating right at the edge, where it reads as a rendering glitch. Negative bottom
 *      margin is the standard idiom for "not quite yet".
 */
const VIEWPORT = { once: true, amount: 0.25, margin: '0px 0px -10% 0px' }

/*
 * The same 14px rise the hero uses. Sharing the distance is what makes the whole page
 * feel like one document rather than a stack of separately-designed components.
 */
const RISE = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

const TRANSITION = { duration: 0.7, ease: [0.16, 1, 0.3, 1] }

export function Reveal({
  children,
  /*
   * `delay` staggers siblings. Kept as a plain number rather than an index-based
   * auto-stagger so a caller can decide that one particular element should arrive late —
   * the same reason the hero hand-assigns its delays.
   */
  delay = 0,
  /* `as` so a Reveal can be a <li>, <p> or <div> without adding a wrapper element that
     would break a parent's grid or list semantics. */
  as = 'div',
  className = '',
  /*
   * `...rest` — everything else is forwarded to the rendered element.
   *
   * WHY THIS WAS ADDED, because it fixes a real bug and the bug is instructive.
   *
   * The route map needs each stop to carry its country's accent colour, which it does by
   * setting CSS custom properties inline: `style={{ '--stop-mark': ... }}`. Those stops are
   * `Reveal` elements. And this component originally destructured only the four props it knew
   * about, so `style` was received and silently discarded — the markers rendered with no
   * accent and no error anywhere.
   *
   * THE CLASS OF BUG THIS IS (worth recognising in future): a wrapper component that names
   * its props explicitly and does not spread the remainder becomes a one-way valve. Anything
   * the wrapper's author did not anticipate is dropped without complaint. `className` was
   * handled, so the failure looked like "the colour is wrong" rather than "the prop is gone",
   * which is a much harder thing to see.
   *
   * Spreading `...rest` makes the wrapper transparent: it adds behaviour without removing
   * capability, which is what a wrapper should do. Note that this deliberately sits AFTER
   * `className` in the destructure so `className` is still handled explicitly — it needs to
   * be merged rather than forwarded, since the motion props above also target the element.
   */
  ...rest
}) {
  const prefersReducedMotion = useReducedMotion()

  const MotionTag = motion[as] ?? motion.div

  /*
   * Under reduced motion we render the final state and never observe the viewport at all.
   *
   * Passing `false` to `initial` is Framer's documented way to say "skip the animation,
   * mount in the target state". Note what this avoids: if we merely shortened the
   * duration, content would still start at `opacity: 0` and depend on JavaScript running
   * to become visible. Here it is visible from the first frame.
   */
  if (prefersReducedMotion) {
    return (
      <MotionTag className={className} {...rest}>
        {children}
      </MotionTag>
    )
  }

  return (
    <MotionTag
      className={className}
      {...rest}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={RISE}
      transition={{ ...TRANSITION, delay }}
    >
      {children}
    </MotionTag>
  )
}
