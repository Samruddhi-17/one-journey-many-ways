import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { COUNTRIES } from "../../data/countries";
import { HiddenName } from "../journey/HiddenName";
import { useVisited } from "../../hooks/useJournal";
import { AmbienceToggle } from "./AmbienceToggle";

/*
 * MobileNavSheet — the full-screen navigation panel for phones and small tablets.
 *
 * WHY A SHEET AND NOT A CONDENSED VERSION OF THE DESKTOP ROUTE
 * Five country names with connectors cannot fit in 375px without becoming unreadable.
 * The mockups show a fixed sidebar, which is simply impossible at phone width. So this
 * is the honest translation, not a compromise — and since most visitors arrive on a
 * phone (PRODUCT_VISION.md §3.5), this is arguably the *primary* navigation.
 *
 * The sheet also gets to be better than the desktop nav: there is room for each
 * country's epithet and day range, which turns a menu into a preview of the journey.
 *
 * THE THREE ACCESSIBILITY OBLIGATIONS OF ANY OVERLAY
 * A panel that covers the page must handle all three, or keyboard and screen-reader
 * visitors get trapped (DESIGN_SYSTEM.md §15.3):
 *   1. Escape closes it.
 *   2. Focus moves into it when it opens, and back to the trigger when it closes.
 *   3. Background scrolling is locked, so the page behind does not move.
 *
 * ============================================================================================
 * THE SHEET WITHHOLDS THE NAMES TOO, AND IT IS THE MOST IMPORTANT PLACE THAT IT DOES.
 *
 * The home page's signpost hides each country until the visitor goes there, and the desktop route nav
 * does the same (see the `SIGNPOST` note in src/data/voice.js). Most visitors arrive on a phone, where
 * this sheet *is* the navigation — so if it printed all five names, the concealment would be broken for
 * the majority of the audience and intact only for the minority. Hiding a secret from desktop and
 * handing it to phones is not partial concealment, it is no concealment.
 *
 * THE EPITHET HAS TO GO WITH THE NAME, and this is the trap worth naming. "Land of the Rising Sun" is
 * Japan as certainly as the word "Japan" is, and it is the line the sheet was built to show off. So an
 * unvisited row loses its epithet as well; a row that hid "Japan" and then explained that it is the
 * land of the rising sun would be concealment as a joke at the visitor's expense.
 *
 * WHAT AN UNVISITED ROW KEEPS: its position in the order, its day range, a real link to a real page,
 * and the withheld label from `HiddenName` — "Stop 03", set at the same size the name will be, so the
 * sheet says exactly what the signpost the visitor came from says.
 *
 * WHY AN EMPTY STAMP SLOT WHERE THE FLAG WAS. A flag identifies a country faster than its name, so it
 * cannot be shown; but the flag also holds the left edge that every row's text aligns to, and dropping
 * it would leave the visited rows indented and the unvisited ones not. The dashed square is that slot
 * kept open, in the language the site already uses for a page in a passport that has not been stamped
 * yet — which is precisely the state being drawn.
 * ============================================================================================
 */
export function MobileNavSheet({ isOpen, onClose, triggerRef }) {
  const visited = useVisited();

  // `useRef` holds a mutable value that survives re-renders without causing one.
  // Here it gives us a handle on a DOM node so we can move keyboard focus to it.
  const panelRef = useRef(null);

  // --- Obligation 1: Escape closes the sheet -------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    // Cleanup removes the listener. Without this, every open/close cycle would leave
    // another listener attached — a memory leak that eventually fires N times per key.
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // --- Obligation 2: move focus into the panel, and restore it on close ----------
  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    } else {
      // Returning focus to the button that opened the sheet means a keyboard user
      // resumes exactly where they were, instead of being dumped at the top of the page.
      triggerRef?.current?.focus();
    }
  }, [isOpen, triggerRef]);

  // --- Obligation 3: lock background scrolling ----------------------------------
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Returning `null` tells React to render nothing at all. The sheet is absent from the
  // DOM when closed, so its links are not focusable — a hidden-but-tabbable panel is a
  // classic keyboard trap.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* The scrim. It both dims the page and gives a large tap target for dismissal.
          It is aria-hidden because the close button below is the accessible way out. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(26,24,21,0.55)]"
      />

      <div
        ref={panelRef}
        /*
         * `role="dialog"` + `aria-modal` tell a screen reader that content behind this
         * panel is unavailable, so it confines itself to the panel.
         * `tabIndex={-1}` makes the div programmatically focusable (so the effect above
         * can focus it) without adding it to the normal Tab order.
         */
        role="dialog"
        aria-modal="true"
        aria-label="Journey route"
        tabIndex={-1}
        className="absolute inset-x-0 top-0 max-h-full overflow-y-auto bg-surface-page px-6 pb-10 pt-5 shadow-elev-3"
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="font-display text-lg text-ink-900">The Journey</span>
          <button
            type="button"
            onClick={onClose}
            /* An icon-only button needs an accessible name, or a screen reader
               announces just "button". */
            aria-label="Close navigation"
            className="-mr-2 flex size-11 items-center justify-center rounded-md text-ink-500 transition-colors hover:text-ink-900"
          >
            {/* Two rotated bars form an X. Inline SVG rather than an icon font so it
                inherits currentColor and needs no extra network request. */}
            <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <ol className="space-y-1">
          {COUNTRIES.map((country) => {
            /*
             * The one condition, and it reads the visit record rather than the itinerary — the same
             * distinction `Signpost` and `RouteProgressNav` make, for the reason set out in
             * src/lib/journal.js: `visited.includes(slug)` is a fact about the visitor, and
             * `arrivalOrder <= current` would be a fact about the route wearing its clothes.
             *
             * `|| isActive` is applied inside the render below rather than here, because `isActive`
             * only exists inside `NavLink`'s callback. It is load-bearing for the same reason it is in
             * the desktop nav: the visit is recorded in an effect after the country page commits, so
             * for one frame the store does not yet know where the visitor is standing.
             */
            const isVisited = visited.includes(country.slug);

            return (
              <li key={country.slug}>
                <NavLink
                  to={`/${country.slug}`}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-4 rounded-lg px-3 py-4 transition-colors",
                      isActive
                        ? "bg-[var(--accent-wash)]"
                        : "hover:bg-surface-sunken",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => {
                    const isRevealed = isVisited || isActive;

                    return (
                      <>
                        {/*
                         * THE LEFT SLOT, one fixed width in both states.
                         *
                         * It is `w-8` and centred rather than sized by its contents, so the flag and
                         * the empty stamp square occupy identical space and every row's text starts on
                         * the same vertical line. Sized by content, a revealed row would indent
                         * differently from its neighbours and the list would look misaligned rather
                         * than partly filled in.
                         *
                         * The flag is decorative and hidden from screen readers: without aria-hidden
                         * one announces "regional indicator symbol J, regional indicator symbol P".
                         * (DESIGN_SYSTEM.md §2.6.)
                         */}
                        <span
                          aria-hidden="true"
                          className="flex w-8 shrink-0 items-center justify-center"
                        >
                          {isRevealed ? (
                            <span className="text-3xl">{country.flag}</span>
                          ) : (
                            <span className="size-7 rounded-[0.2rem] border border-dashed border-ink-300" />
                          )}
                        </span>

                        {/*
                         * THE TEXT BLOCK. `min-h-[3rem]` and centred content, because the two states
                         * hold different things — a name over an epithet, or bars over a code — and a
                         * row that changed height on reveal would shift the rows beneath it. Three rem
                         * is the revealed state's natural height (text-xl's 1.75rem line plus text-sm's
                         * 1.25rem), so pinning it costs the taller state nothing.
                         */}
                        <span className="flex min-h-[3rem] min-w-0 flex-1 flex-col justify-center">
                          {isRevealed ? (
                            <>
                              <span
                                className={[
                                  "block font-display text-xl",
                                  isActive
                                    ? "text-[var(--accent-ink)]"
                                    : "text-ink-900",
                                ].join(" ")}
                              >
                                {country.name}
                              </span>
                              {/*
                               * The epithet goes with the name — see the header note. It identifies
                               * the country as surely as the name does.
                               */}
                              <span className="block text-sm italic text-ink-500">
                                {country.epithet}
                              </span>
                            </>
                          ) : (
                            /*
                             * `text-xl` matches the revealed name's size exactly, so the row's first
                             * line is the same height in both states — the `min-h-[3rem]` above holds
                             * the second line's space whether or not there is an epithet to put in it.
                             *
                             * `text-ink-500` rather than the name's `ink-900`: this is a slot waiting
                             * to be filled and it should not shout as loudly as the four rows that
                             * have been. It measures 5.63:1 on the page cream, past the 4.5:1 this
                             * size needs even before its large-text allowance.
                             */
                            <HiddenName
                              country={country}
                              className="block font-display text-xl tabular-nums text-ink-500"
                            />
                          )}
                        </span>

                        {/*
                         * The day range stays visible in both states. It is not the secret: knowing
                         * that stop one took six days tells you nothing about where it was, and it is
                         * the thing that makes an unvisited row still worth reading.
                         */}
                        <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-ink-500">
                          {country.days}
                        </span>
                      </>
                    );
                  }}
                </NavLink>
              </li>
            );
          })}
        </ol>

        {/*
         * THE SOUND CONTROL, below the itinerary and separated by a rule.
         *
         * It is outside the `<ol>` because it is not a stop. A settings row inside a list of five
         * countries would be announced as "list, 6 items" — the markup asserting that turning on a
         * tone is one of the places this journey goes.
         *
         * It does NOT close the sheet when pressed, unlike every link above it. A visitor toggling
         * sound has not asked to be taken anywhere, and dismissing the panel under them would both
         * lose their place in the menu and hide the button before they could hear whether they
         * wanted it on. The two nearby exits — the X and the scrim — are how they leave.
         */}
        <div className="mt-6 border-t border-ink-200 pt-2">
          <AmbienceToggle variant="row" />
        </div>
      </div>
    </div>
  );
}
