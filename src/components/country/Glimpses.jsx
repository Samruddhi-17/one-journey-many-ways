import { Section } from '../ui/Section'
import { Reveal } from '../ui/Reveal'
import { toAvif } from '../../lib/images'
import { inProse, inProseCapitalised } from '../../lib/countryName'

/*
 * Glimpses — the country's five photographs, shown plainly, once.
 *
 * ============================================================================================
 * WHY THIS SECTION EXISTS AT ALL
 *
 * The five `country_gallery` photographs (city, food, train, temple, night) were already in
 * `journey.json` and already on the page — feeding LivingBackdrop, where they are scaled past the
 * frame, cross-fading, under a scrim, and `aria-hidden`. So the site had five photographs per
 * country that no visitor could ever actually LOOK at, and no screen-reader user knew existed.
 *
 * That was a defensible decision for a backdrop and a bad one for the photographs. The backdrop
 * needs images it can treat as texture; these are pictures of specific things. Both uses are now
 * served, from the same five files: blurred and drifting behind the arrival, and once, sharp, here.
 *
 * WHY "GLIMPSES" AND NOT "GALLERY"
 * A gallery is a destination — you go to it, you page through it, it is the point. These are five
 * frames encountered in passing between the traveller's note and the questions the visitor can ask,
 * and the copy says so ("Five things I saw"). The distinction is not pedantry: a gallery would
 * invite lightboxes, arrows, thumbnails and a counter, none of which this needs and all of which
 * would make the photographs the subject of the chapter instead of the day the chapter is about.
 *
 * WHY THE CATEGORY IS THE ONLY LABEL, and this is the instruction the section was built around.
 *
 * The workbook keeps `category` in its own column, separate from the image — so "City", "Food",
 * "Train", "Temple", "Night" are the dataset's own words, and the alternative to using them is
 * INVENTING a caption per photograph per country. Twenty-five hand-written captions is twenty-five
 * chances to describe a country, which is exactly the authority this project does not claim: the
 * traveller reports what they noticed, and the dataset supplies facts. A caption saying "Tokyo's
 * neon-lit streets at dusk" is the site editorialising in a voice it has no source for.
 *
 * One word under a photograph does something better anyway. It says what KIND of thing you are
 * looking at, which is the one piece of information the eye cannot supply for itself, and leaves
 * the photograph to say the rest.
 *
 * THE SAME FIVE CATEGORIES IN THE SAME ORDER FOR EVERY COUNTRY — deliberately, and it is Principle
 * 13 (consistent structure, distinct atmosphere) in its most literal form. Five countries answering
 * the identical five prompts is what makes the differences between them legible; it also means the
 * strip cannot become a place where one country gets nine photographs and another gets three, which
 * would read as one being better documented and therefore more important (§7.4).
 *
 * WHY THIS IS NOT AN `<ol>` DESPITE BEING FIVE ITEMS IN A FIXED ORDER
 * The order is the workbook's, not a sequence the visitor should follow — there is no first or last
 * thing to see here. `<ul>` says "these five, as a set", which is true. An ordered list would tell a
 * screen-reader user "item 1 of 5" and imply a route through them.
 *
 * WHERE THE SECTION SITS, AND WHY IT IS BETWEEN THE NOTE AND THE QUESTIONS
 * After the traveller's note, so the visitor has met the person and their claim before seeing the
 * place. Before the facets, because the facets are measured evidence and this is not — it is what
 * the place looked like. Putting photographs after the charts would make them a reward for
 * finishing; putting them here makes them the reason the questions are worth asking.
 * ============================================================================================
 */

/*
 * ALT TEXT, AND WHY IT IS BUILT FROM DATA RATHER THAN WRITTEN OUT.
 *
 * Twenty-five photographs would need twenty-five hand-written descriptions, and the argument
 * against that is the same one that keeps the visible captions to one word: nobody has looked at
 * all twenty-five, so half of them would be guesses dressed as descriptions. What IS known for
 * certain about every one of them is the two facts the workbook states — which country, and which
 * category — so that is what the alt text says.
 *
 * This is deliberately weaker than the alt text on the "did you know" photographs, where four
 * specific images were examined and described. The difference is honest: there, someone looked;
 * here, the pipeline knows a category and nothing more. Alt text that claims more than the author
 * knows is worse than alt text that is merely thin, because a screen-reader user cannot tell a
 * confident description from an accurate one.
 *
 * LOWERCASED because the category arrives title-cased for display ("Food") and mid-sentence it
 * should not be. `toLowerCase()` on the whole word rather than just the first letter, since none of
 * the five categories is a proper noun.
 */
function glimpseAlt(category, country) {
  return `${category.toLowerCase()} in ${inProse(country)}`
}

export function Glimpses({ country }) {
  /*
   * THE SAME FILTER LIVINGBACKDROP APPLIES, AND FOR THE SAME REASON.
   *
   * A gallery row can carry a null `src`: the pipeline records "the spreadsheet named no file" as
   * distinct from "the spreadsheet named a file we could not find", and both come through as null.
   * An `<img src={null}>` requests the page's own URL as an image, which fails silently and paints
   * a broken-image glyph.
   *
   * NO PLACEHOLDER FRAME HERE, unlike the experience photographs. This is a strip of things that
   * were seen, so a labelled empty frame would be claiming a sixth glimpse exists and is merely
   * missing. Five countries all currently have all five, so this is a guard rather than a visible
   * behaviour — but it is the guard that decides what happens when the workbook changes, which is
   * the only time it will matter.
   */
  const glimpses = country.images.gallery.filter((image) => image?.src)

  /*
   * NOTHING AT ALL rather than an empty section with a heading.
   *
   * A country with no photographs is a known state (the standing rule against forcing equal image
   * counts means the site has to be able to render it), and the honest rendering of "no glimpses"
   * is no section — not a heading over a blank strip, which would read as a loading failure.
   */
  if (glimpses.length === 0) return null

  return (
    <Section width="wide" spacing="tight" ariaLabelledBy="glimpses-heading">
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">
          {/*
           * The traveller's voice, in the first person, consistent with everything else they say —
           * and note it claims nothing about the country. "Five things I saw" is a statement about
           * where the photographs came from, which is the strongest claim available here.
           */}
          Five things I saw
        </p>

        {/*
         * A REAL, VISIBLE `<h2>`, unlike the arrival's `sr-only` one.
         *
         * The arrival hides its heading because a label over the traveller's note would announce a
         * quotation as a page feature ("The traveller's note") and it is meant to be encountered.
         * This is the opposite case: a strip of five images with no heading is ambiguous to
         * everybody, not only to screen-reader users — a sighted visitor scrolling past cannot tell
         * whether these are the country's own photographs or decoration. One line names them.
         */}
        <h2
          id="glimpses-heading"
          className="mt-4 max-w-[34ch] font-display text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-900"
        >
          {/*
           * `inProseCapitalised` because this heading STARTS with the name — "The United States,
           * before I started asking questions". The mid-sentence form would give a lowercase "the"
           * at the head of an `<h2>`.
           */}
          {inProseCapitalised(country)}, before I started asking questions
        </h2>
      </Reveal>

      {/*
       * THE STRIP.
       *
       * `grid-cols-2` on the smallest screens rather than one column: five full-width photographs
       * stacked is a scroll the visitor has to work through, and this section is meant to be passed
       * through. Two columns makes it a strip at every width.
       *
       * `lg:grid-cols-5` puts all five on one row on a wide screen, which is the arrangement the
       * word "glimpses" describes — five things seen at once, none of them dwelt on. The middle
       * breakpoint is three, so the fourth and fifth wrap to a second row; a 2/3/5 progression
       * never leaves a single orphan on its own row, which 4 columns would (four then one).
       */}
      <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
        {glimpses.map((image, index) => (
          /*
           * `as="li"` so Reveal renders the list item itself rather than wrapping one — a `<div>`
           * between `<ul>` and `<li>` is invalid and breaks the list semantics a screen reader
           * relies on to announce "list, 5 items".
           *
           * The stagger is small (60ms) and comes from the index. Five items at a longer interval
           * would still be arriving after the eye had reached the end of the row, which reads as
           * the page loading rather than as the photographs being dealt out.
           */
          <Reveal as="li" key={image.src} delay={index * 0.06}>
            <figure>
              {/*
               * `aspect-[3/4]` — portrait, because the sources are portrait (0.56 for most of
               * them). A landscape frame would crop these to a band; matching the frame roughly to
               * the source is what keeps the subject in the picture.
               *
               * NOT `ImageFrame`, and this is the one place worth explaining a near-miss. It would
               * fit — it takes exactly these props — but it exists to answer "photograph or honest
               * placeholder", and the placeholder is precisely the behaviour this section must not
               * have (see the filter above). Using it here would mean the next person to change its
               * null branch would silently change this strip's behaviour too, in a direction this
               * section's own reasoning rules out. Sharing a component means sharing its future.
               */}
              <div className="overflow-hidden rounded-xl aspect-[3/4]">
                <picture className="block h-full w-full">
                  <source srcSet={toAvif(image.src)} type="image/avif" />
                  <img
                    src={image.src}
                    alt={glimpseAlt(image.category, country)}
                    /*
                     * `lazy` on all five without exception: this section is always below the fold
                     * (it sits after a 78svh cover and the traveller's note), so there is no
                     * first-paint case to protect the way LivingBackdrop's first slide has.
                     */
                    loading="lazy"
                    decoding="async"
                    /*
                     * A slow scale on hover, and the only interface flourish in the section.
                     *
                     * It earns its place by answering a real question: these five frames look
                     * clickable — five bordered images in a row is the universal shape of a
                     * gallery — and they are not links. A photograph that responds to the cursor by
                     * moving slightly, and does nothing else, says "you are looking at this"
                     * without promising a lightbox. The alternative, no response at all, reads as
                     * an unresponsive link.
                     *
                     * `group-hover` is not used because the whole `<li>` is not a target; the hover
                     * is on the image itself, which is the thing being looked at.
                     *
                     * `motion-reduce:transition-none` rather than a JS check: this is a CSS
                     * transition on a non-essential decorative property, so the media query is the
                     * whole fix, and it costs nothing at runtime. Note that the scale is left in
                     * place under reduced motion and only the ANIMATION between states is removed —
                     * the visitor still gets the hover feedback, instantly.
                     */
                    className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.04] motion-reduce:transition-none"
                  />
                </picture>
              </div>

              {/*
               * The category, and the reason this is a `<figcaption>` rather than a `<span>`: it
               * ties the word to the image programmatically, so a screen-reader user hears them as
               * one unit instead of five photographs followed by five loose words.
               *
               * `ink-500` measures 5.63:1 on the cream page, which clears 4.5:1 for this 12px text.
               */}
              <figcaption className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-ink-500">
                {image.category}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
