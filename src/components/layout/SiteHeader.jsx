import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { RouteProgressNav } from './RouteProgressNav'
import { MobileNavSheet } from './MobileNavSheet'
import { AmbienceToggle } from './AmbienceToggle'
import { getCountryBySlug, TOTAL_STOPS } from '../../data/countries'

/*
 * SiteHeader — the fixed top bar: wordmark, route navigation, passport link.
 *
 * WHY THE HEADER IS DELIBERATELY PLAIN
 * "The shell is silent; the country speaks" (DESIGN_SYSTEM.md §1). The header is
 * identical on every page and carries almost no colour of its own. That restraint is
 * what makes arriving in a country feel like arrival — if the chrome also changed
 * character, the contrast that produces the feeling would be gone.
 *
 * WHY NO "COMPARE" LINK
 * A "compare everything" affordance sitting beside the route would offer the dashboard
 * escape hatch the vision explicitly rejects (PRODUCT_VISION.md §5), before the visitor
 * has travelled anywhere. The route shown here is the whole product.
 */
export function SiteHeader() {
  // `useState` gives a component memory. It returns the current value and a function to
  // change it; calling that function re-renders the component with the new value.
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  // A ref on the trigger button so the sheet can return focus here when it closes.
  const menuButtonRef = useRef(null)

  // `useLocation` reports the current URL. We use it to work out which stop we are on.
  const location = useLocation()
  const currentSlug = location.pathname.replace(/^\//, '')
  const currentCountry = getCountryBySlug(currentSlug)

  /*
   * The bottom border appears only after the visitor scrolls.
   *
   * WHY: at the top of a page the header should melt into a full-bleed hero image with
   * no dividing line. Once content scrolls beneath it, that line is what separates the
   * bar from the text passing under it. A permanent border would put a hard rule across
   * every hero.
   *
   * `{ passive: true }` tells the browser we will never call preventDefault on this
   * event, which lets it keep scrolling smooth instead of waiting for our handler.
   */
  useEffect(() => {
    function handleScroll() {
      setHasScrolled(window.scrollY > 40)
    }
    handleScroll() // run once, in case the page loads already scrolled
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close the sheet on navigation. Without this, tapping a link would change the page
  // while leaving the panel covering it.
  useEffect(() => {
    setIsSheetOpen(false)
  }, [location.pathname])

  return (
    <>
      {/*
       * `<header>` is a landmark element — screen readers can jump straight to it.
       * A <div> would carry no such meaning.
       *
       * `backdrop-blur` frosts whatever scrolls beneath the semi-transparent bar, which
       * keeps the nav legible over both photographs and text without a solid fill.
       */}
      <header
        className={[
          // Height comes from the shared token, not a literal — <main>'s top padding and the
          // home hero's height calculation both depend on this exact value.
          'fixed inset-x-0 top-0 z-40 h-(--header-height)',
          'bg-[rgba(253,249,243,0.88)] backdrop-blur-xl',
          'transition-[border-color] duration-300',
          hasScrolled ? 'border-b border-ink-200' : 'border-b border-transparent',
        ].join(' ')}
      >
        <div className="mx-auto flex h-full max-w-(--container-wide) items-center justify-between gap-4 px-5 md:px-8 lg:px-12">
          {/* Wordmark — also the route home. The paper-plane glyph is decorative. */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 font-display text-base text-ink-900 md:text-lg"
          >
            <svg viewBox="0 0 24 24" className="size-5 text-ink-400" aria-hidden="true">
              <path
                d="M2 12l19-8-7 19-3-8-9-3z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            One Journey
          </Link>

          {/* Desktop route nav. Hidden below md — the sheet takes over there. */}
          <RouteProgressNav />

          {/* Mobile: current stop plus the menu trigger.
              Showing "Stop 2 of 5" answers "where am I in this?" in the smallest
              possible space — the question the desktop route answers visually. */}
          <div className="flex items-center gap-3 md:hidden">
            {currentCountry && (
              <span className="text-xs text-ink-500">
                <span aria-hidden="true">{currentCountry.flag}</span>{' '}
                <span className="font-medium text-ink-700">{currentCountry.name}</span>
                <span className="text-ink-400">
                  {' '}
                  · Stop {currentCountry.arrivalOrder} of {TOTAL_STOPS}
                </span>
              </span>
            )}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsSheetOpen(true)}
              /*
               * `aria-expanded` tells assistive technology whether the panel this button
               * controls is currently open. `aria-controls` names the thing it controls.
               * Both are what turn a decorative hamburger into a real control.
               */
              aria-expanded={isSheetOpen}
              aria-controls="mobile-nav-sheet"
              aria-label="Open navigation"
              /* size-11 = 44px, the WCAG 2.5.5 minimum touch target. Smaller targets
                 are measurably harder to hit and fail the guideline. */
              className="-mr-2 flex size-11 items-center justify-center rounded-md text-ink-700"
            >
              <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/*
           * Passport link and sound toggle — desktop only; the sheet covers both on mobile.
           *
           * THE SOUND CONTROL IS LAST, AFTER the passport link, and that order is deliberate. Tab
           * order follows source order, so a keyboard visitor reaches everything that navigates
           * before reaching the one control that only changes a preference. The ornament should not
           * stand between them and the site.
           *
           * `-mr-2` pulls the icon button's 44px box back to the container's optical edge: a touch
           * target larger than its glyph leaves visible padding that reads as a misaligned header.
           */}
          <div className="hidden shrink-0 items-center gap-1 md:flex">
            <Link
              to="/passport"
              className="rounded-md px-3 py-2 text-sm text-ink-500 transition-colors hover:text-ink-900"
            >
              Passport
            </Link>
            <div className="-mr-2">
              <AmbienceToggle />
            </div>
          </div>
        </div>
      </header>

      <div id="mobile-nav-sheet">
        <MobileNavSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          triggerRef={menuButtonRef}
        />
      </div>
    </>
  )
}
