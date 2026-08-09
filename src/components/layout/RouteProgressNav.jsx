import { NavLink } from "react-router-dom";
import { COUNTRIES } from "../../data/countries";
import { useVisited } from "../../hooks/useJournal";

/*
 * RouteProgressNav — the five-stop itinerary, doubling as primary navigation
 * and a progress indicator.
 *
 * WHY THIS IS THE NAVIGATION AND NOT A CONVENTIONAL MENU
 * The journey IS the information architecture (PRODUCT_VISION.md §2.3). A conventional
 * menu would present five interchangeable options; a route presents an itinerary with an
 * order, and that order carries meaning — arriving in India *after* Japan is part of what
 * the visitor learns. So the nav earns the horizontal space it takes.
 *
 * WHY STOPS ARE NEVER SORTED
 * Itinerary order, always. Sort order is a ranking and no caption undoes it
 * (PRODUCT_VISION.md §7.4).
 *
 * WHAT `NavLink` IS (React Router concept)
 * A link that knows whether it points at the current page. It hands us an `isActive`
 * flag, which saves us from comparing URLs manually. It also renders a real <a> element,
 * so middle-click, ctrl-click and "open in new tab" all behave normally — an ordinary
 * <div onClick> would silently break all three.
 */
/*
 * ============================================================================================
 * THE NAV WITHHOLDS THE NAMES TOO, AND IT HAS TO.
 *
 * The home page's signpost hides each country until the visitor goes there (see the `SIGNPOST` note in
 * src/data/voice.js). This nav is fixed to the top of every page, so if it printed all five names the
 * secret would last exactly as long as it took to glance upward — the concealment would be theatre, and
 * theatre a visitor sees through is worse than not attempting it.
 *
 * WHAT AN UNVISITED STOP SHOWS INSTEAD: its stop number, and the dot that was always there. It is the
 * same label `HiddenName` renders on the signpost and in the mobile sheet, so all three places agree
 * about exactly how much they give away; only the type scale differs, because the sizes do. (This nav
 * once argued for a different treatment on the grounds that seventeen barcode bars would smudge at
 * 44px. The barcode is gone from the site entirely — see `HiddenName` — so there is no longer any
 * difference to justify.)
 *
 * IT SHOWED THE ISO CODE UNTIL IT WAS MEASURED PROPERLY, and that was a leak rather than a hint. `USA`
 * is how most people write "United States"; `JPN`, `IND` and `ITA` are the first three letters of the
 * names they were standing in for. Printing them across the top of every page on the site gave the
 * itinerary away more efficiently than the names would have, because it also looked deliberate. The
 * full argument, and the reason an automated name-search reported this clean, is in HiddenName's note
 * on the same fix.
 *
 * THE FLAG GOES WITH THE NAME. It cannot be shown for an unvisited stop — a flag identifies a country
 * faster and more certainly than its name does, and 🇯🇵 beside "JPN" would make the code decorative.
 * This is the same reason the cover photograph's `alt` is empty.
 *
 * NAVIGATION IS UNAFFECTED. Every stop is the same real link to the same real page in the same order,
 * and the current stop always shows its full name — a visitor is never unable to tell where they are.
 * ============================================================================================
 */
export function RouteProgressNav() {
  const visited = useVisited();

  return (
    /*
     * `aria-label` names this landmark for screen-reader users, who can jump between
     * landmarks directly. Without it, a screen reader announces only "navigation",
     * which is unhelpful on a page that has more than one.
     */
    <nav aria-label="Journey route" className="hidden md:block">
      <ol className="flex items-center gap-1">
        {COUNTRIES.map((country, index) => {
          /*
           * A stop shows its name once it has been visited — OR while the visitor is standing on it.
           *
           * The `isActive` half of that matters and is easy to miss: the visit is recorded in an effect
           * after the country page commits, so on the very first render of a country the store has not
           * been written yet. Without the active check the header would show "JPN" for one frame while
           * the page beneath it says "We have landed in Tokyo", which is both a flicker and a
           * contradiction. It is also simply correct on its own terms — you always know where you are.
           */
          const isVisited = visited.includes(country.slug);

          return (
            <li key={country.slug} className="flex items-center">
              <NavLink
                to={`/${country.slug}`}
                /*
                 * When `className` is given a function, React Router calls it with the
                 * active state. We use it to style the current stop.
                 *
                 * ACCESSIBILITY: the active state is carried by THREE signals —
                 * colour, font weight, and a filled dot. Colour alone would be invisible
                 * to a colour-blind visitor. (Principle 16; DESIGN_SYSTEM.md §15.1.)
                 */
                /*
                 * `px-2 lg:px-3` rather than a flat `px-3`, which was a measured overflow.
                 *
                 * This nav appears at `md` (768px). At exactly that width the header row wants
                 * 32px padding + 135px wordmark + 32px of gaps + 442px of nav + 123px of controls =
                 * 796px inside a 704px content box. Flex has nothing to give — every child is
                 * `shrink-0` — so the overflow lands on the last item: the Passport link and the
                 * sound toggle were pushed 27px into the right gutter, with the toggle's 44px touch
                 * target hanging 3px off the viewport. Trimming 4px a side here and 4px off each
                 * connector reclaims 56px, which is enough at 768 with room to spare.
                 *
                 * The alternative was to hold this nav back to `lg` and let the sheet cover tablets,
                 * which costs a tablet visitor the route indicator on every page to solve a spacing
                 * problem. Tighter spacing at one breakpoint is the smaller price.
                 */
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors duration-200 lg:px-3",
                    isActive
                      ? "font-semibold text-[var(--accent-ink)]"
                      : "font-normal text-ink-500 hover:text-ink-900",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {/*
                     * The dot: hollow when unvisited, filled when active. This is the
                     * non-colour signal that makes the active state perceivable without
                     * relying on hue.
                     */}
                    <span
                      aria-hidden="true"
                      className={[
                        "size-2 rounded-full border transition-all duration-200",
                        isActive
                          ? "border-[var(--accent-ink)] bg-[var(--accent-ink)]"
                          : "border-ink-300 bg-transparent group-hover:border-ink-500",
                      ].join(" ")}
                    />
                    {/*
                     * The flag is decorative and hidden from screen readers. Without
                     * aria-hidden, a screen reader announces "regional indicator symbol
                     * J, regional indicator symbol P" — noise. The country name beside it
                     * carries the actual meaning. (DESIGN_SYSTEM.md §2.6.)
                     *
                     * SHOWN ONLY ONCE THE NAME IS. See the header note: a flag gives the country away
                     * more completely than its name, so withholding one while showing the other would
                     * conceal nothing.
                     */}
                    {isVisited || isActive ? (
                      <>
                        <span aria-hidden="true">{country.flag}</span>
                        <span>{country.name}</span>
                      </>
                    ) : (
                      /*
                       * The withheld state: the stop number, plus the status as text only a screen
                       * reader gets. `tracking` opened up so it reads as a marker rather than as a
                       * truncated word.
                       *
                       * The `sr-only` text is what keeps this from being a worse experience without
                       * sight: a sighted visitor infers "not been there yet" from the hollow dot, and
                       * this states the same thing in the same amount of detail. It deliberately does
                       * NOT contain the country's name — see HiddenName's accessibility note.
                       */
                      /*
                       * THE VISIBLE TEXT IS THE BARE TWO-DIGIT NUMBER, not "Stop 3", and the reason is
                       * the same width budget documented on the padding above. Five stops written out
                       * long made this nav 450px wide against a 386px budget at `md`, which pushed the
                       * header's right-hand controls off the viewport again — the word "Stop" repeated
                       * five times across the top of every page is the least useful 64px on the site
                       * anyway, since the hollow dot and the position in the row already say it.
                       *
                       * `padStart` keeps all five the same width so the connectors between them stay
                       * evenly spaced; `tabular-nums` keeps the digits from shifting between them.
                       * The `sr-only` half restores the full phrase for anyone not reading the layout.
                       */
                      <span className="font-medium uppercase tracking-[0.14em] tabular-nums">
                        {String(country.arrivalOrder).padStart(2, "0")}
                        <span className="sr-only">
                          {` — stop ${country.arrivalOrder}, not yet visited`}
                        </span>
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              {/* Connector between stops — the visual thread that makes this a route
                  rather than a row of buttons. Not rendered after the last stop. */}
              {index < COUNTRIES.length - 1 && (
                <span
                  aria-hidden="true"
                  className="h-px w-3 bg-ink-200 lg:w-6"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
