import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { toAvif } from '../../lib/images'

/*
 * LivingBackdrop — the country's photographs, cross-fading and drifting behind the content.
 *
 * ============================================================================================
 * WHAT THIS REPLACES AND WHY
 *
 * The chapter previously opened on one still hero photograph. A still photograph is a picture OF a
 * place; a slow drift between several is closer to being somewhere, because the thing that makes a
 * real view feel alive is that it keeps changing slightly while you look at it. The dataset gives
 * every country five gallery images — its city, its food, how people get around, a landmark and the
 * place after dark — which is enough to feel
 * like a place rather than a slideshow of one moment.
 *
 * THE THREE MOTIONS, AND WHY EACH IS SEPARATE
 *
 *   1. THE CROSS-FADE — one image gives way to the next every few seconds. This is the one that
 *      carries "somewhere with more than one face to it".
 *   2. THE DRIFT — each image is scaled slightly above its container and moves across it while it
 *      is shown (the Ken Burns effect). This is what stops a shown image from being a still: an
 *      image that fades in, freezes, and fades out reads as a slideshow, which is a UI pattern.
 *   3. THE SCRIM — does not move, and is the reason the other two are allowed to. Text over a
 *      changing photograph has a changing contrast ratio, which is unacceptable; the scrim
 *      guarantees a floor no matter which image is showing. See the long note on it below.
 *
 * ============================================================================================
 * THE SCRIM WAS FAR TOO HEAVY, AND THIS IS THE FIX — worth recording, because the reasoning that
 * produced the bug was correct and the result was still wrong.
 *
 * The first version guaranteed contrast the blunt way: fade the whole photograph toward opaque page
 * cream, reaching 82% at the height the text sits and 100% at the bottom. That does guarantee the
 * ratio. It also means the photograph is functionally absent exactly where the visitor is looking,
 * and a `mix-blend-multiply` accent wash on top pulled what was left toward a single hue. Five
 * photographs per country, drifting and cross-fading, and the honest description of the result was
 * a faint texture behind some text.
 *
 * WHAT CHANGED, AND WHY IT IS NOT A CONTRAST COMPROMISE. The guarantee moved off the whole image and
 * onto the text itself: the copy now sits on `CoverPanel`, a near-opaque cream panel sized to the
 * text, and the photograph outside that panel carries only a light wash for depth. So the ratio is
 * measured against a known colour that the photograph cannot influence — the same guarantee as
 * before, but paid for over a few hundred square pixels instead of the entire cover.
 *
 * Measured, taking the impossible worst case of a pure black photograph beneath an 88% cream panel
 * (effective background #DEDBD5): ink-900 12.87:1, ink-700 8.46:1, and the weakest accent (India's
 * `--accent-ink`) 3.67:1 — which clears the 3:1 large-text threshold it is only ever used at, and is
 * actually BETTER than the 3.11:1 the old full-cover scrim delivered. A real photograph is nowhere
 * near black, so every figure above is a floor rather than an estimate.
 *
 * THE GENERAL LESSON: when a guarantee is expensive, shrink what it has to cover rather than
 * weakening it. "Darken everything until the text is safe" and "put the text somewhere safe" produce
 * the same ratio and completely different pages.
 * ============================================================================================
 *
 * WHY THE DRIFT IS A TRANSFORM AND NOTHING ELSE
 * `scale` and `translate` are composited on the GPU and never touch layout. Animating `width`,
 * `top`, or `background-position` instead would force the browser to recalculate layout on every
 * frame of a continuous animation — measured elsewhere in this project at roughly 15fps on a
 * mid-range phone against 60fps for transforms. This runs for as long as the visitor is on the
 * page, so it is the single worst place in the codebase to get that wrong.
 *
 * WHY THE PACE COMES FROM THE ATMOSPHERE
 * `--atmosphere-pace` already makes Italy's interface slower than India's; a backdrop that
 * cross-faded at an identical rate in both would be the one element on the page contradicting the
 * country around it. Reading the multiplier means Italy's images hold for noticeably longer than
 * India's with no per-country code here (Principle 13).
 *
 * ACCESSIBILITY, AND WHY THIS IS `aria-hidden` WITH NO ALT TEXT
 * This is the one place in the project where a photograph is genuinely decorative. The alt text on
 * a hero image earns its place by describing what a sighted visitor gains from it — but there is no
 * single image here to describe, the set changes without the visitor acting, and every fact the
 * chapter conveys is in text elsewhere on the page. Writing alt text for five drifting images would
 * mean a screen-reader user hearing five unrequested photo descriptions interrupt the traveller's
 * greeting. Marked decorative, which is the honest answer, rather than given a description that
 * would be noise.
 *
 * REDUCED MOTION STOPS EVERYTHING. Not "fades more slowly" — no cross-fade, no drift, one still
 * image. A visitor who has asked their operating system to stop moving things has asked for that,
 * and a continuously animating background is the most intrusive possible thing to ignore it with.
 * ============================================================================================
 */

/*
 * How long each image holds, in milliseconds, before the fade to the next begins.
 *
 * SEVEN SECONDS IS A CONSIDERED NUMBER. Short enough that a visitor reading the arrival sees at
 * least two images and understands the backdrop is alive; long enough that it never competes with
 * the text for attention. The failure mode of a faster cycle is not that it looks bad — it is that
 * movement in the periphery repeatedly pulls the eye off the sentence being read, which makes the
 * page tiring in a way that is hard to attribute.
 *
 * Scaled by the atmosphere pace at use, so Italy (1.3) holds each image just over nine seconds and
 * India (1.15) just over eight.
 */
const HOLD_MS = 7000

/* The cross-fade itself. Long, because a fast cut between two photographs is a slideshow. */
const FADE_S = 2.4

export function LivingBackdrop({ images, className = '', overlay = 'hero' }) {
  const prefersReducedMotion = useReducedMotion()

  /*
   * WHICH IMAGE IS SHOWING. Index into `images`, advanced by the timer below.
   *
   * State rather than a ref because the render output depends on it — this is the textbook case
   * for state, and the mirror image of the `markerRefs` decision in the route map (a handle on a
   * DOM node is a ref; a value the UI is derived from is state).
   */
  const [index, setIndex] = useState(0)

  /*
   * THE FILTERED LIST, and why the filter is necessary rather than defensive.
   *
   * `journey.json` gallery entries can legitimately carry a null `src`: the pipeline records "the
   * spreadsheet named no file here" distinctly from "the spreadsheet named a file we could not
   * find", and India's gallery rows exist with blank images in the source workbook. A null src
   * rendered as an `<img>` requests the page's own URL as an image, which fails silently and shows
   * a broken-image glyph.
   */
  const slides = images.filter((image) => image?.src)

  useEffect(() => {
    /*
     * NO TIMER AT ALL in these two cases, rather than a timer that does nothing.
     *
     * With one image there is nothing to advance to; under reduced motion there must be no
     * advancing. Returning early means no interval is created, which matters because a `setInterval`
     * that fires every seven seconds to call `setIndex` with the value it already has would wake the
     * main thread forever to schedule a no-op re-render — invisible, and exactly the kind of thing
     * that shows up as battery drain rather than as a bug.
     */
    if (prefersReducedMotion || slides.length <= 1) return

    /*
     * The pace multiplier is read from the DOM rather than passed in as a prop.
     *
     * WHY: `--atmosphere-pace` is applied to `<html>` by useAtmosphere, so it is already the single
     * source of truth for how fast this country moves. Threading it through as a prop would mean
     * the backdrop's pace and the interface's pace were two values that could disagree — and they
     * would, the first time a component forgot to pass it.
     *
     * Read inside the effect (not during render) because it is a DOM read, and read once per
     * mount because the atmosphere cannot change without this component remounting: SiteLayout
     * keys the page transition on the pathname, so a new country is a new tree.
     */
    const pace =
      Number(
        getComputedStyle(document.documentElement).getPropertyValue('--atmosphere-pace'),
      ) || 1

    const timer = setInterval(() => {
      /*
       * The updater form, `(previous) => ...`, rather than `setIndex(index + 1)`.
       *
       * This is not a style preference and it is worth knowing why: the callback passed to
       * `setInterval` closes over the `index` from the render that created it. Referring to `index`
       * directly would read a stale value on every tick after the first, so the backdrop would
       * advance from 0 to 1 and then stay there forever. The updater form receives the current
       * value from React instead of from the closure, which is why the effect does not need `index`
       * in its dependency array — and therefore does not tear down and recreate its timer on every
       * single transition.
       */
      setIndex((previous) => (previous + 1) % slides.length)
    }, HOLD_MS * pace)

    return () => clearInterval(timer)
    /*
     * `slides.length` rather than `slides`: the array is rebuilt by `filter` on every render, so a
     * new identity each time, and depending on it would recreate the interval constantly. Its
     * length is the only thing the effect actually uses.
     */
  }, [prefersReducedMotion, slides.length])

  if (slides.length === 0) {
    /*
     * NO IMAGES AT ALL — render the scrim's own gradient and nothing else.
     *
     * A country with no gallery is a known state, not an error: the standing rule against forcing
     * equal image counts means "this country has no photographs yet" is a sentence the site has to
     * be able to render. It comes out as a wash of the country's accent, which is quiet and
     * deliberate rather than a gap where a picture should be.
     */
    return (
      <div
        aria-hidden="true"
        className={`absolute inset-0 -z-20 ${className}`}
        style={{
          backgroundImage: `
            radial-gradient(120% 90% at 15% 8%,
              color-mix(in oklab, var(--accent-mark) 26%, transparent) 0%, transparent 62%),
            radial-gradient(100% 100% at 88% 100%,
              color-mix(in oklab, var(--accent-ink) 22%, transparent) 0%, transparent 58%)
          `,
        }}
      />
    )
  }

  return (
    <div aria-hidden="true" className={`absolute inset-0 -z-20 overflow-hidden ${className}`}>
      {slides.map((image, slideIndex) => {
        const active = slideIndex === index

        return (
          <motion.div
            key={image.src}
            className="absolute inset-0"
            /*
             * Only opacity is animated on the wrapper; the drift lives on the inner element. Two
             * separate elements because the two motions have different durations — a seven-second
             * drift and a two-and-a-half-second fade — and one element cannot run two transitions
             * of different lengths on properties that both feed the same compositor layer without
             * one of them being cut short mid-fade.
             */
            initial={false}
            animate={{ opacity: active ? 1 : 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : FADE_S,
              ease: 'linear',
              /*
               * `linear` is correct here and is the exception to the project's rule against it.
               * The rule exists because eased entries feel intentional and linear ones feel
               * mechanical — true of an element arriving, false of a cross-fade, where an eased
               * opacity curve makes both images visibly half-present at the midpoint and reads as
               * a flicker. A cross-fade is one of the two legitimate uses of linear (the other
               * being a continuous loop).
               */
            }}
          >
            <motion.div
              className="h-full w-full"
              /*
               * THE DRIFT. `scale` starts above 1 so there is always image outside the frame to
               * move into — without it, translating the image would expose the container's
               * background at the trailing edge.
               *
               * The direction alternates by index. Every image drifting the same way turns into a
               * rhythm the eye predicts, and a predictable background is one the eye keeps
               * checking; alternating breaks the pattern with no extra motion.
               *
               * THE RANGE IS 1.04-1.10 AND USED TO BE 1.08-1.16, which is part of the fix for "the
               * main title images are very blur". Every one of these numbers is a multiplier ON TOP of
               * the upscale `object-cover` has already applied to fill the band, so the old peak of
               * 1.16 was asking the browser to magnify the cover a further 16% at the moment the
               * visitor is most likely to be looking at it. Nothing recovers detail lost to an
               * upscale; the only lever is to upscale less.
               *
               * WHAT IS PRESERVED, because this is deliberately not "turn the drift down". The TRAVEL
               * — the distance the image moves, which is what the eye reads as motion — is the size of
               * the range, and that is 0.06 against the old 0.08: very nearly the same journey, plus
               * the unchanged ±1.5% translate that does most of the visible work. What shrinks is the
               * baseline magnification, which contributed nothing to the effect and cost sharpness
               * for the entire time each image is on screen.
               *
               * THE FLOOR IS 1.04 AND NOT 1.0 for the reason the first paragraph gives: the translate
               * moves the image 1.5% of its width, so it needs at least 1.03 of overhang to move into
               * or the container's background shows at the trailing edge. 1.04 is that bound with a
               * pixel of margin rather than a number chosen for its looks.
               */
              initial={
                prefersReducedMotion
                  ? false
                  : { scale: 1.04, x: slideIndex % 2 === 0 ? '-1.5%' : '1.5%' }
              }
              animate={
                prefersReducedMotion
                  ? false
                  : active
                    ? { scale: 1.1, x: slideIndex % 2 === 0 ? '1.5%' : '-1.5%' }
                    : { scale: 1.04, x: slideIndex % 2 === 0 ? '-1.5%' : '1.5%' }
              }
              transition={{ duration: (HOLD_MS / 1000) * 1.6, ease: 'linear' }}
            >
              <picture className="block h-full w-full">
                <source srcSet={toAvif(image.src)} type="image/avif" />
                <img
                  src={image.src}
                  alt=""
                  /*
                   * The first image is on the critical path — it is what the visitor sees when the
                   * chapter opens — and the rest are not, because they are seven seconds away at
                   * minimum. `eager`/`high` on the first and `lazy` on the others means the arrival
                   * paints as fast as a single hero image would, rather than four extra photographs
                   * competing with it for bandwidth.
                   */
                  loading={slideIndex === 0 ? 'eager' : 'lazy'}
                  fetchPriority={slideIndex === 0 ? 'high' : 'low'}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </picture>
            </motion.div>
          </motion.div>
        )
      })}

      {/*
       * THE SCRIM — now doing far less work, because CoverPanel took over the contrast guarantee.
       *
       * WHAT IS LEFT FOR IT TO DO. Two things, neither of which is protecting text:
       *
       *   1. THE BOTTOM DISSOLVE. The cover has to end somewhere, and a photograph meeting the
       *      cream page at a hard horizontal line reads as a cropped image rather than as a view.
       *      Only the last stretch is opaque, and only for `hero`.
       *   2. A WHISPER AT THE TOP, so the fixed header's links stay legible where they cross a
       *      bright sky. 22% cream, which is a haze rather than a veil.
       *
       * The middle of the image — most of it — is now untouched. That is the change.
       *
       * The stops are percentages of the element and the opaque one is deliberately close to the
       * bottom edge, so the dissolve happens over the last eighth of the cover instead of over the
       * region the text occupies. That distinction is what the previous version got wrong.
       */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            overlay === 'hero'
              ? `linear-gradient(
                  to bottom,
                  color-mix(in oklab, var(--color-surface-page) 22%, transparent) 0%,
                  transparent 22%,
                  transparent 62%,
                  color-mix(in oklab, var(--color-surface-page) 55%, transparent) 88%,
                  var(--color-surface-page) 100%
                )`
              : `linear-gradient(
                  to bottom,
                  color-mix(in oklab, var(--color-surface-page) 38%, transparent) 0%,
                  color-mix(in oklab, var(--color-surface-page) 48%, transparent) 100%
                )`,
        }}
      />

      {/*
       * A wash of the country's own accent over the photographs — now 6% rather than 12%.
       *
       * `mix-blend-multiply` tints rather than veils: it darkens the photograph's own colours toward
       * the accent instead of laying a flat film over them. Halved because with the scrim lifted, a
       * tint that was barely perceptible under a heavy veil becomes a visible colour cast over a
       * clear photograph — the same value reads completely differently once what was on top of it
       * has gone.
       *
       * Kept rather than dropped because it is what makes five countries' backdrops feel like five
       * places instead of five stock photo sets: the atmosphere reaches the photography and not only
       * the interface.
       */}
      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(130% 90% at 20% 0%,
            color-mix(in oklab, var(--accent-ink) 6%, transparent) 0%, transparent 72%)`,
        }}
      />
    </div>
  )
}
