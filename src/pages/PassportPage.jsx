import { Link } from 'react-router-dom'
import { Section } from '../components/ui/Section'
import { Reveal } from '../components/ui/Reveal'
import { Button } from '../components/ui/Button'
import { PassportStamp } from '../components/journey/PassportStamp'
import { Journal } from '../components/journey/Journal'
import { JOURNEY } from '../data/journey'
import { COUNTRIES, getReflection, TOTAL_STOPS } from '../data/countries'
import { journalCaption, PASSPORT } from '../data/voice'
import { spellOutCapitalised } from '../lib/spellOut'
import { inProse } from '../lib/countryName'
import { toAvif } from '../lib/images'
import { useVisited } from '../hooks/useJournal'

/*
 * PassportPage — the journey's closing artefact.
 *
 * ============================================================================================
 * WHAT THIS PAGE IS, AND WHAT IT REPLACED.
 *
 * It was a Phase 1 skeleton: five buttons on a vertical line, a lead paragraph, and its own comment
 * saying "for now it is an honest route list". This is the version §4.4 asks for — the ending, the
 * place where the site stops describing and says what the whole thing meant.
 *
 * WHY A PASSPORT AND NOT A "DASHBOARD" OR "OVERVIEW". The name is doing narrative work, and this part
 * of the original reasoning is unchanged and worth keeping: "Overview" invites a table of comparable
 * rows, which is the ranking trap §7.4 forbids. A passport is a record of where someone has been, in
 * the order they went — the same information, framed as memory rather than measurement.
 *
 * THE THREE THINGS §4.4 REQUIRES, AND WHERE EACH ONE IS.
 *
 *   "Name the realisation in plain, unhurried language."
 *      The reflection block at the bottom, alone in the viewport, on the sunken surface. It is the
 *      last thing on the page because it is the last thing the site says.
 *
 *   "Sit in silence — one thought, generous space."
 *      Two paragraphs and nothing else in that block. No image, no chart, no button, no motion beyond
 *      the same fade every other section on the site uses.
 *
 *   "Must not ask them to do anything, or sell anything."
 *      There is no call to action after the reflection. The only links on the page go back to a
 *      country, they sit ABOVE the reflection rather than after it, and they are phrased as returning
 *      rather than continuing. Note what this page therefore does NOT have: the homecoming block at
 *      the end of the United States offers "Go back to the beginning", which is right there because
 *      the visitor has just finished travelling. Repeating it here would be the interface asking for
 *      one more click at the exact moment the vision says to stop asking.
 *
 * WHY THE FIGURES ARE ABSENT, AND WHICH NUMBERS SURVIVE.
 *
 * §4.4 forbids "recapping the figures" and this page shows none: no happiness score, no life
 * expectancy, no hours, no kilograms, no chart. What it does state is the count of stops and each
 * stop's dates — the length and shape of the route, which is what a record of a journey is FOR. The
 * test that separates them is whether a number invites comparison between countries. "Five stops" and
 * "Days 14–19" do not; they are the same fact for everyone reading. Every number the page rejects is
 * a per-country measurement.
 *
 * WHERE THE FLAG PHOTOGRAPHS GO, WHICH IS THE OTHER HALF OF THIS PAGE'S JOB.
 *
 * Five photographs of a flag flying at a real place — Kiyomizu-dera, the Gateway of India, the
 * Colosseum, a chalet above Lake Thun, the Capitol — were resolved by the pipeline and rendered
 * nowhere. This page is their home, and the argument is not that they had to go somewhere: it is that
 * a passport is the one artefact where a flag is the correct image. A flag on a country page would be
 * a label on a chapter that already has a title; a flag in a record of arrivals is what the document
 * is made of.
 *
 * They are the reason this page can be visual at all without breaking "sit in silence". The
 * photographs are up in the stops, where the visitor is reading; the reflection below them is bare.
 *
 * NO PER-COUNTRY BRANCHING, as everywhere. There is no `if (slug === …)` here. The five stops differ
 * by the data joined in data/journey.js, the registry's accent tokens, and the stamp's per-POSITION
 * rotation — never by identity.
 *
 * ============================================================================================
 * THE PAGE NOW SHOWS ONLY WHAT THE VISITOR ACTUALLY VISITED, WHICH IS THE LARGEST CHANGE IT HAS HAD.
 *
 * It used to render all five stops unconditionally, and src/lib/journal.js names that as one of the two
 * places the site faked a journey: "PassportPage rendered all five stops unconditionally, so the record
 * was complete before the journey started." A record that is full on arrival cannot fill up, and the
 * ending's whole argument is that it filled up as YOU went.
 *
 * So `useVisited` is the source now, and the page has three states rather than one:
 *
 *   NOTHING VISITED   The journal, blank. `emptyLead`, and a way in. No stops, no reflection.
 *   SOME VISITED      The journal, part-stamped. `partialLead`, the stops that happened, no reflection.
 *   ALL FIVE VISITED  The journal, full. `lead`, all five stops, and the reflection.
 *
 * WHY THE REFLECTION IS GATED AND NOT JUST THE STOPS, which is the least obvious part. Every sentence
 * of `PASSPORT.reflection` is first-person plural about evidence — "we arrived looking for the
 * differences, and we found plenty of them". Shown to somebody one country in, it tells them what they
 * concluded from four chapters they have not opened, and it spends the ending before they arrive at it.
 * `PASSPORT.unfinished` holds the space instead; see the note on it in data/voice.js.
 *
 * WHAT IS DELIBERATELY *NOT* GATED: the header nav's five country links, and the itinerary on the home
 * page. The full route is public information about the trip — five places, twenty-eight days — and
 * hiding it would make the journey a locked sequence, which is the gamified reading this rebuild is
 * furthest from. What is private is the claim that somebody WENT.
 *
 * THE UNVISITED COUNTRIES ARE STILL VISIBLE HERE TOO, as blank outlines inside the journal at the top.
 * That is the honest form: the object shows the shape of the whole route and states, in dashed borders,
 * which parts of it are unwritten. What it does not do is give an unvisited country a stop entry, dates
 * and a remembered line, because those would be a record of something that did not happen.
 * ============================================================================================
 */

/*
 * ALT TEXT FOR THE FLAG PHOTOGRAPHS.
 *
 * A slug-keyed table, and the same exception the fact photographs make, for the same reason: these
 * five images were each opened and looked at, so the descriptions are observations rather than
 * guesses. What a screen-reader user needs from an image like this is not "the flag of Japan" — they
 * can read the country's name in the heading beside it — but what the photograph actually shows,
 * which is a flag somewhere specific.
 *
 * THE FALLBACK IS THE POINT OF WRITING IT THIS WAY. A country with no line here still gets sensible
 * alt text naming the flag and the country. The alternative shape — a required prop, or `alt` omitted
 * when unknown — degrades to a screen reader announcing the filename, which is the one outcome worse
 * than thin alt text.
 */
const FLAG_ALT = {
  japan:
    'The Japanese flag flying from a pole in front of the vermilion timber gate of Kiyomizu-dera in Kyoto, against a clear sky.',
  india:
    'The Indian flag flying from a tall white pole above the Gateway of India in Mumbai, its stone arch and turrets below.',
  italy:
    'The Italian flag flying beside the Colosseum in Rome, the tiers of arches standing behind it in late sunlight.',
  switzerland:
    'The Swiss flag flying above a wooden chalet on a green slope, with the turquoise water of a lake and mountains beyond.',
  'united-states':
    'The American flag flying in front of the dome of the United States Capitol, treetops along the base of the building.',
}

function flagAlt(country) {
  return FLAG_ALT[country.slug] ?? `The flag of ${inProse(country)}, photographed flying outdoors.`
}

export function PassportPage() {
  /*
   * Derived from the itinerary, never typed. `spellOutCapitalised` because the count starts the
   * sentence — the helper returns a lowercase word and cannot know which position it is going into, so
   * choosing is the caller's job. Getting it wrong once shipped a sentence beginning with a lowercase
   * letter and survived review, because a spelled-out number reads correct enough to skim past.
   *
   * The stops label no longer takes a word from here: it counts what is actually in the record and does
   * its own spelling out, because it has to get the plural right for a count of one. See its note.
   */
  const stopsCapitalised = spellOutCapitalised(TOTAL_STOPS)

  /*
   * WHERE THE VISITOR HAS ACTUALLY BEEN. The one input that turns this page from a brochure of the
   * route into a record of a trip. See the header note on the three states.
   */
  const visited = useVisited()

  /*
   * THE STOPS THAT HAPPENED, IN THE ORDER THEY HAPPENED.
   *
   * Ordered by the VISIT rather than by the itinerary, which is the opposite of the call the flight
   * map's pins make and is right for the opposite reason. A map has no sequence — it either has a pin or
   * it does not. A record does: `journal.js` keeps the visit order specifically so "the stamps can be
   * pressed in the sequence they were earned rather than re-sorted into the site's preferred sequence".
   * A visitor who opened Italy first and Japan second made that journey, and re-sorting it into the
   * traveller's route would be the interface quietly correcting them.
   *
   * `.filter(Boolean)` because `visited` is untrusted input — it comes back from `sessionStorage`, which
   * journal.js validates as an array of strings but cannot validate as an array of REAL slugs. A hand-
   * edited value in devtools would otherwise put `undefined` into this list and crash on `.slug`.
   */
  const stops = visited
    .map((slug) => JOURNEY.find((country) => country.slug === slug))
    .filter(Boolean)

  /* The three states, named once so the JSX below reads as prose rather than as arithmetic. */
  const nothingVisited = stops.length === 0
  const journeyComplete = stops.length >= TOTAL_STOPS

  return (
    <>
      {/*
       * `as="div"`: this block is the page's title area, not a distinct section of it. The <h1>
       * already names the page, so wrapping it in an unnamed <section> landmark would add noise to a
       * screen reader's landmark list for no benefit.
       */}
      <Section as="div" width="prose" spacing="none" className="pb-4 pt-20 md:pt-28">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-ink-500">
          {PASSPORT.eyebrow}
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-ink-900">
          {PASSPORT.heading}
        </h1>
        {/*
         * THREE LEADS FOR THREE STATES. `lead` claims a completed route ("in the order we made them"),
         * so it may only be said once the route has been made. See the notes on all three in
         * data/voice.js.
         */}
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          {journeyComplete
            ? PASSPORT.lead(stopsCapitalised)
            : nothingVisited
              ? PASSPORT.emptyLead
              : PASSPORT.partialLead}
        </p>
      </Section>

      {/*
       * ==========================================================================================
       * THE JOURNAL, AND THIS IS THE PLACE IT PAYS OFF.
       *
       * The visitor met this object on the home page with five dashed outlines under the line "it was
       * blank when I left". This is the same component, the same five slots, in whatever state their
       * journey has actually put it in — which is the ending's entire argument, made by recognition
       * rather than by a sentence claiming it.
       *
       * WHY IT IS HERE AND NOT AT THE FOOT OF THE PAGE. The stops below are the detail; this is the
       * shape. Reading order is shape then detail, and putting the object after five photographs and
       * five paragraphs would make it a summary graphic — which is a dashboard tile with a nice
       * texture.
       *
       * IT DOES NOT DUPLICATE THE STOPS BELOW, which was the objection to putting it here at all. The
       * journal is the whole ROUTE including what is unwritten; the list below is only what happened.
       * A visitor two countries in sees three dashed outlines up here and two entries down there, and
       * the difference between those two things is the page's subject.
       *
       * `visited` STRAIGHT FROM THE STORE rather than the derived `stops`: the journal matches slugs,
       * so it wants the raw record, and passing a mapped list would be handing it objects to compare
       * against strings. The caption is chosen by `journalCaption`, in voice.js, so the home page and
       * this page cannot make the choice two different ways.
       * ==========================================================================================
       */}
      <Section width="content" spacing="tight" ariaLabelledBy="journal-heading">
        <h2 id="journal-heading" className="sr-only">
          The journal
        </h2>
        {/* `max-w-4xl` for the reason the home page states: at full content width the object is about
            six times wider than it is tall, which is the proportion of a banner rather than a book. */}
        <div className="max-w-4xl">
          <Journal visited={visited} caption={journalCaption(stops.length, TOTAL_STOPS)} />
        </div>

        {/*
         * THE WAY IN, AND ONLY WHEN THERE IS NOTHING IN THE RECORD YET.
         *
         * §4.4's "must not ask them to do anything" governs the ENDING, and a visitor looking at a blank
         * journal is not at an ending — so a route into the journey is help rather than a conversion. It
         * disappears the moment there is anything in the record, because from then on this page IS a
         * record and the stops below each carry their own way back.
         *
         * `COUNTRIES[0]` rather than naming Japan: the first stop is a fact about the itinerary, and
         * writing it here would be a second place the route's order is recorded. The registry rather
         * than JOURNEY because only a slug and a name are needed, and those exist even if a country's
         * measured data is incomplete.
         */}
        {nothingVisited ? (
          <div className="mt-10">
            <Button to={`/${COUNTRIES[0].slug}`} size="lg">
              {PASSPORT.emptyAction}
            </Button>
          </div>
        ) : null}
      </Section>

      {/*
       * THE STOPS, AND THE WHOLE SECTION IS ABSENT WHEN THERE ARE NONE.
       *
       * Not an empty state inside it, and not five greyed-out rows — the journal above is already the
       * picture of emptiness, and a second one underneath it would be the page saying the same thing
       * twice, the weaker time in the form of a disabled list. An `<h2>` over nothing is also a
       * landmark a screen-reader user would navigate to and find empty.
       */}
      {nothingVisited ? null : (
        <Section width="content" ariaLabelledBy="stops-heading">
          {/*
           * A REAL VISIBLE `<h2>`, quiet enough not to compete with the `<h1>` above it.
           *
           * The previous version made this `sr-only`, which was defensible when the section was five
           * buttons directly under the lead. It is not now: between the lead and the first stop there
           * is a full-width photograph, and a sighted visitor scrolling in from the nav needs one line
           * telling them the photographs ARE the stops rather than decoration above a list.
           *
           * IT COUNTS THE STOPS THAT HAPPENED, not the itinerary's five. That is the whole gating
           * decision in one string: a visitor two countries in reads "The two stops", which is true,
           * where "The five stops" over two entries would be the heading contradicting what is under
           * it.
           */}
          <h2
            id="stops-heading"
            className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500"
          >
            {PASSPORT.stopsLabel(stops.length)}
          </h2>

          {/*
           * `<ol>` — the one list on this page where the order is information. These are the stops in
           * the order the visitor made them, so a screen reader announcing "item 2 of 3" is telling the
           * truth about their journey. Compare Glimpses, which is deliberately a `<ul>` because its
           * five photographs have no correct order.
           *
           * IT ITERATES THE VISITED STOPS, NOT `JOURNEY`. That one substitution is the gating. See the
           * header note, and `stops` above for why the order is the visit's rather than the route's.
           *
           * `space-y` rather than a grid: each stop is a page of a passport and gets the full width. A
           * two-column arrangement of five countries would put four side by side and one alone, and
           * side-by-side is the geometry that invites comparison — which is the reading §7 exists to
           * prevent, arrived at through layout rather than through words.
           */}
          <ol className="mt-8 space-y-12 md:space-y-16">
            {stops.map((country) => {
              /*
               * `carried` is the one line from the registry's REFLECTIONS that this page uses. See the
               * long note on `PASSPORT.memoryLabel` for why it is this rather than `travellerNote`.
               *
               * Optional-chained because `getReflection` returns undefined for a country nobody has
               * written a reflection for yet, which is a state the registry permits by design — a sixth
               * country should render its stop, not crash the page. The block is omitted when absent
               * rather than substituted, which is the same call the fact photograph makes for America.
               */
              const carried = getReflection(country.slug)?.carried

              return (
                <li
                  key={country.slug}
                  /*
                   * The country's accent, scoped to this row. Every stop on this page carries its own
                   * colour, which is what makes the page a record of arrivals rather than a list styled
                   * by the shell — and it is why the page does not need the atmosphere hook: the hook
                   * applies ONE country's tokens to the whole document, and this page has several.
                   */
                  style={{ '--row-ink': country.atmosphere.ink }}
                >
                  <Reveal>
                    {/*
                     * THE PHOTOGRAPH AND THE TEXT, side by side from `md` up and stacked below it.
                     *
                     * `items-start` rather than `items-center`: the stamp and the heading must align to
                     * the top of the photograph. Centred, the text block would float in the middle of a
                     * tall image and the alignment would change per country, since the photographs have
                     * different aspect ratios (0.5 to 1.5).
                     */}
                    <div className="md:flex md:items-start md:gap-8">
                      {/*
                       * `aspect-[3/4]` AND A FIXED WIDTH, WHICH IS THE ONE REAL DECISION IN THIS LAYOUT.
                       *
                       * The five sources range from 675×1200 (portrait, 0.56) to 1536×1024 (landscape,
                       * 1.5). Rendering each at its own ratio would give five differently-shaped rows,
                       * and, worse, different amounts of vertical space per country, which reads as
                       * some stops mattering more than others. A single frame for all five is the same
                       * argument Glimpses makes for its strip.
                       *
                       * PORTRAIT, AND THIS USED TO BE 4/3 WITH A COMMENT CLAIMING 4/3 WAS VERIFIED.
                       * It was not. Four of the five photographs are portrait or square (0.56, 0.56,
                       * 0.75, 1.0) and `object-cover` in a 1.33 frame keeps only 42% of the height of
                       * the two tallest. It cut the top off India's flag and both its edges, left
                       * Switzerland's flag half outside the frame, and beheaded the pagoda behind
                       * Japan's. A visitor reported it; it is visible at a glance in any of the five.
                       *
                       * 3/4 was chosen by rendering all five at 4/3, 1/1 and 3/4 and comparing the
                       * results, not by reasoning about the numbers. It is the only one of the three
                       * that keeps the whole flag AND the landmark below it in every photograph: the
                       * Gateway of India entire, the Colosseum, the lake and chalet, the Capitol dome.
                       * The one landscape source (the Capitol, 1.5) loses width at 3/4, which is why
                       * this was worth checking: its flag and dome both sit centre-frame, so they
                       * survive. Anything wider fails the four portrait sources; a portrait frame costs
                       * the one landscape source nothing that matters.
                       *
                       * THE LESSON, since the previous comment asserted a verification that had not
                       * happened: a crop cannot be checked by reading image dimensions. Where the
                       * subject sits inside the frame is not derivable from its width and height.
                       *
                       * GUARDED ON `flag` BEING PRESENT, AND THE GUARD IS NOT DEFENSIVE PADDING. All
                       * five resolve today, but America's very nearly did not: the only US flag file
                       * supplied was watermarked and is excluded from publishing permanently, so
                       * `images.flag` was null for that country until a clean replacement arrived. A
                       * re-export of the workbook or a fresh exclusion puts it back. And a null here is
                       * not merely an empty frame. `toAvif(null)` throws on `.replace`, so the whole
                       * page would fail to render rather than one photograph going missing.
                       *
                       * NOTHING RATHER THAN AN `ImageFrame` PLACEHOLDER. A labelled empty frame claims
                       * a photograph is coming; the reason this one would be absent is that no
                       * publishable photograph exists. The row still has its stamp, its name and its
                       * remembered line, and the text column simply takes the full width, the same
                       * call FacetCard makes for America's fact.
                       */}
                      {country.images.flag ? (
                        <div className="overflow-hidden rounded-xl aspect-[3/4] md:w-60 md:shrink-0">
                          <picture className="block h-full w-full">
                            <source srcSet={toAvif(country.images.flag)} type="image/avif" />
                            <img
                              src={country.images.flag}
                              alt={flagAlt(country)}
                              /*
                               * `lazy` on all five including the first. The first stop sits below a
                               * title block that is itself below a fixed header, so on no viewport is
                               * this photograph in the initial paint — there is no
                               * first-contentful-paint case to protect here, unlike the country covers.
                               */
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          </picture>
                        </div>
                      ) : null}

                      <div className="mt-5 md:mt-0">
                        {/*
                         * THE STAMP, ABOVE THE COUNTRY NAME.
                         *
                         * A real passport stamp lands wherever there is room; this one is placed
                         * deliberately at the top of the text column, because it carries the code and
                         * the dates and those are the first things a record states. Putting it beside
                         * the name would make it read as a tag on the heading; above, it reads as the
                         * mark this page is a record of.
                         *
                         * `arrivalOrder - 1` AND NOT THE LOOP'S INDEX, which it used to be and which is
                         * now wrong. This list is ordered by the VISIT, so the loop index is a position
                         * in one visitor's history — a country's stamp would sit at a different angle
                         * depending on when they happened to open it, and at a different angle here than
                         * in the journal at the top of the same page. The rotation is a per-POSITION
                         * property of the ITINERARY (see ROTATIONS in PassportStamp), so it has to come
                         * from the itinerary. `arrivalOrder` is 1-based and the table is 0-indexed.
                         */}
                        <PassportStamp country={country} index={country.arrivalOrder - 1} />

                        {/*
                         * `<h3>` because it sits under the section's `<h2>`, which sits under the page's
                         * `<h1>`. Heading levels are how a screen-reader user navigates a page by
                         * structure, and a level skipped for visual reasons breaks that outline —
                         * `text-3xl` is what makes it big, not the tag.
                         *
                         * `country.name` bare, with NO definite article: this is a title, not prose. See
                         * the note in src/lib/countryName on why the article is added at prose call
                         * sites rather than stored in the registry.
                         */}
                        <h3 className="mt-5 font-display text-3xl font-semibold leading-[1.15] tracking-[-0.01em] text-ink-900">
                          {country.name}
                        </h3>

                        {/*
                         * The stop number, the epithet and the capital, on one quiet line.
                         *
                         * `arrivalOrder` as a digit rather than spelled out: it is a position in a
                         * printed record, which is the "shown, show it" half of the rule the site's
                         * prose follows in the other direction. `tabular-nums` so the five rows' digits
                         * sit on the same width.
                         *
                         * The middot separators are `aria-hidden` — a screen reader would otherwise
                         * announce "middle dot" three times per stop, which is noise rather than
                         * punctuation.
                         */}
                        <p className="mt-3 text-sm text-ink-500">
                          <span className="tabular-nums">Stop {country.arrivalOrder}</span>{' '}
                          <span aria-hidden="true">·</span> {country.epithet}{' '}
                          <span aria-hidden="true">·</span> {country.capital}
                        </p>

                        {carried ? (
                          /*
                           * WHAT STAYED WITH US — the one line of substance per stop.
                           *
                           * `border-l` in the country's accent rather than a quotation mark or an italic
                           * block: this is the site's own voice (see the `memoryLabel` note), so it must
                           * not be typeset as a quotation. A rule down the left edge marks it as
                           * significant without attributing it to anyone.
                           *
                           * The accent is used as a BORDER here and the text stays `ink-900`. Using
                           * `--accent-ink` for the text would be legal at this size for four countries
                           * and marginal for Switzerland (5.09:1 against the cream page) — and the
                           * project's rule is that the accent as text is reserved for 24px and up. A 1px
                           * rule has no contrast threshold to meet because it carries no information.
                           */
                          <div className="mt-6 border-l-2 border-[var(--row-ink)] pl-5">
                            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-500">
                              {PASSPORT.memoryLabel}
                            </p>
                            <p className="mt-2 max-w-[46ch] font-display text-xl leading-[1.4] text-ink-900">
                              {carried}
                            </p>
                          </div>
                        ) : null}

                        {/*
                         * THE ONLY LINK PER STOP, AND IT IS A REAL `<a>` RATHER THAN A BUTTON.
                         *
                         * It navigates and does nothing else, so it must be middle-clickable,
                         * ctrl-clickable and present in a screen reader's list of links. The previous
                         * version wrapped the whole row in a `Button variant="ghost"`, which made the
                         * photograph, the heading and the epithet all one enormous link — a screen
                         * reader then reads the entire row as a single link label, and the visitor
                         * cannot select the text.
                         *
                         * WHY IT IS NOT A `Button` AT ALL, even a ghost one. This page's ending must not
                         * ask the visitor to do anything (§4.4), and a filled or outlined control asks.
                         * Five of them above the reflection would make the page a menu. An underlined
                         * text link is available without being an invitation.
                         *
                         * `Link` RATHER THAN A HAND-WRITTEN `<a href="#/japan">`. The first draft did
                         * write the hash by hand, on the reasoning that the site uses HashRouter so the
                         * URL is right and the browser's own hashchange would be picked up. It would
                         * have worked and it was still wrong: it hardcodes the router's strategy at a
                         * call site, so switching to BrowserRouter later breaks five links silently, and
                         * it bypasses the router's own navigation — which is what triggers the page
                         * transition and the scroll-to-top. `Link` renders exactly the same `<a>` with
                         * the same href and keeps all three.
                         *
                         * `inProse` on the name because this is a sentence fragment and America takes
                         * the article — "Go back to the United States". The heading above deliberately
                         * does not.
                         */}
                        <p className="mt-6">
                          <Link
                            to={`/${country.slug}`}
                            className="text-sm font-medium text-[var(--row-ink)] underline decoration-1 underline-offset-4 hover:decoration-2"
                          >
                            {PASSPORT.revisit} {inProse(country)}
                          </Link>
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              )
            })}
          </ol>
        </Section>
      )}

      {/*
       * THE REFLECTION — the last thing on the page and the last thing the site says.
       *
       * `surface="sunken"` and `width="prose"`: the change of surface is what separates this from the
       * record above it without a divider, and the narrow measure is what makes two paragraphs read as
       * a thought rather than as a summary. Same treatment as the homecoming block at the end of the
       * United States, deliberately — the visitor has met this shape once already, at the other place
       * the site speaks for itself.
       *
       * NO EYEBROW, NO HEADING VISIBLE. The `<h2>` is `sr-only`, which is the opposite of the call
       * made for the stops section above, and the reason is the requirement rather than a preference:
       * "sit in silence — one thought, generous space". A label over this block ("In conclusion", "The
       * realisation") would announce the sentiment before delivering it, which is precisely how a
       * quiet ending becomes a conclusion slide. A screen-reader user still needs the landmark named,
       * hence the hidden heading.
       *
       * ==========================================================================================
       * THE REALISATION IS NOW SHOWN ONLY WHEN ALL FIVE COUNTRIES HAVE ACTUALLY BEEN VISITED.
       *
       * This is the part of the gating that matters most and it is the least visible, because the
       * unconditional version looks correct on every screen: the reflection reads beautifully whether
       * the visitor has seen one country or five.
       *
       * It is nonetheless the site's largest possible lie. Every sentence in it is first-person plural
       * about evidence — "we arrived looking for the differences, and we found plenty of them" — so to
       * somebody one country in it asserts a conclusion they drew from four chapters they never opened.
       * And it spends the ending in advance, which is the exact spoiler `sessionStorage` was chosen over
       * `localStorage` to prevent: §4.4's argument is that the ending works because the visitor watched
       * the journal fill.
       *
       * `unfinished` holds the space rather than the block disappearing. A page ending on its last stop
       * link ends on a control; keeping the shape and withholding the claim is what makes this a record
       * with a last page still blank rather than a list that stopped.
       *
       * BOTH SENTENCES MOVE TOGETHER. `closing` — "there are only different journeys, and this was one
       * of them" — refers to the journey the reflection has just described. Shown alone over one stop it
       * would be the site calling a single chapter a journey.
       * ==========================================================================================
       */}
      <Section surface="sunken" width="prose" ariaLabelledBy="reflection-heading">
        <h2 id="reflection-heading" className="sr-only">
          What the journey came to
        </h2>

        {journeyComplete ? (
          <>
            <Reveal>
              <p className="text-xl leading-[1.65] text-ink-700 md:text-2xl md:leading-[1.6]">
                {PASSPORT.reflection}
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              {/*
               * The final sentence, set larger and in the display face, and it is the ONE place on this
               * page where anything is emphasised.
               *
               * `text-ink-900` rather than the accent, unlike the equivalent line in the homecoming
               * block. That block sits inside a country chapter and had a single accent to use; this
               * page has five, and there is no honest way to choose one of them for the sentence that
               * says no country was the answer. Black ink is the neutral the sentence's own argument
               * requires — a case where a constraint produced the right design rather than a compromise.
               *
               * Not italic, for the same reason it is not attributed: italic reads as quotation, and
               * this is the site's own plain statement.
               */}
              <p className="mt-8 font-display text-2xl leading-[1.4] tracking-[-0.01em] text-ink-900 md:text-3xl">
                {PASSPORT.closing}
              </p>
            </Reveal>
          </>
        ) : (
          /*
           * THE LAST PAGE, STILL BLANK.
           *
           * `ink-500` and one size down from the reflection it stands in for, because it is a note about
           * the record rather than the record's conclusion — the same relationship a pencilled line on
           * an inside cover has to the pages. At 20px (`text-lg`) `ink-500` measures 5.63:1 against the
           * sunken surface, clearing 4.5:1 with margin.
           *
           * NOT ITALIC AND NOT IN THE DISPLAY FACE. Both would make this the emphasised sentence of the
           * page, and the emphasised sentence of this page is one the visitor has not earned yet.
           */
          <Reveal>
            <p className="max-w-[54ch] text-lg leading-[1.7] text-ink-500">{PASSPORT.unfinished}</p>
          </Reveal>
        )}
      </Section>
    </>
  )
}
