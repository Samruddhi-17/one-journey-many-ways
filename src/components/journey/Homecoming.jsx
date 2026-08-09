import { Section } from '../ui/Section'
import { Reveal } from '../ui/Reveal'
import { Button } from '../ui/Button'
import { Journal } from './Journal'
import { TravellerFigure } from './TravellerFigure'
import { CompanionFigure } from './CompanionFigure'
import { TOTAL_DAYS, TOTAL_STOPS } from '../../data/countries'
import { HOMECOMING, journalCaption } from '../../data/voice'
import { spellOutCapitalised } from '../../lib/spellOut'
import { useVisited } from '../../hooks/useJournal'

/*
 * Homecoming — the end of the fifth country, and the end of the journey.
 *
 * ============================================================================================
 * WHAT THIS IS AND WHY IT IS NOW ITS OWN FILE.
 *
 * It was forty lines of JSX inside `CountryPage`, in the `else` branch of "is there a next country".
 * That was right while it was three `Reveal`s and a button. It is not right now: the ending has to show
 * the journal, the traveller and the companion, which means three more imports, a store subscription and
 * a caption decision — all of them concerns of ONE MOMENT that only ever renders once per journey, sat
 * in the middle of the file whose job is to be the same for all five countries.
 *
 * The extraction is also what keeps the no-branching rule legible. `CountryPage` now reads
 * `nextCountry ? <Departure/> : <Homecoming/>`, which is a statement about the itinerary's shape rather
 * than about America — and nothing in this file mentions a country either. It is the last stop's ending
 * because the last stop is the one with nothing after it.
 *
 * ============================================================================================
 * WHAT §4.4 REQUIRES OF THIS MOMENT, AND WHAT WAS ADDED TO MEET IT.
 *
 * The block already had the words right: the traveller closes on the question they were left with, the
 * counts are spelled out so they read as a fragment about a trip rather than a total, and the only
 * action goes backwards. None of that changed.
 *
 * WHAT IT LACKED WAS THE PROOF. The site's closing claim is that the journal started blank and filled
 * up, and until now the visitor was told that in prose at the exact moment they should have been shown
 * it. So the object is here, in whatever state their journey actually put it in, directly under the
 * traveller who has been carrying it — and the visitor recognises it, because it is the same component,
 * the same five slots and the same handwriting they met on the home page before they had been anywhere.
 *
 * THE TRANSFORMATION IS THE PICTURE AND NOT A SENTENCE ABOUT IT. That is the whole reason this is the
 * `Journal` component rather than a summary: a "5 of 5 countries" line, a tick, or the word "complete"
 * would convert five chapters of observation into a progress bar reaching its end, which §4.4 rules out
 * and which `JOURNAL.fullCaption`'s own note says it must never become.
 *
 * ============================================================================================
 * THE PAIR IS BACK, WHICH CLOSES THE OTHER LOOP.
 *
 * The home page opens with the traveller and their companion, standing together above the words "come
 * with me". Nothing else on the site shows them again — the country chapters show the traveller alone,
 * beside their own arrival. So the two of them, here, at the end, is the visual answer to the invitation
 * that started it: the same pair, having gone.
 *
 * IT USES THE FIFTH COUNTRY'S PORTRAIT because that is the one the traveller is holding when they get
 * home, and it is supplied by the caller rather than looked up here for the same reason nothing else in
 * this file knows a country: the page owns the data.
 *
 * THE COMPANION STILL HAS NO ARTWORK AND THEREFORE RENDERS NOTHING. See CompanionFigure's header note
 * for exactly what to supply. The layout is complete without it — the traveller stands at the left of
 * the column above the journal, and the dog's arrival will not move anything.
 * ============================================================================================
 */

/*
 * The traveller's size here, and it is deliberately not the home page's.
 *
 * The home page runs to `clamp(13rem, 22vw, 20rem)` because the figure IS the cover — it is the person
 * making an invitation and it should be at something like human scale. This block is a closing thought
 * in a prose column, and a 20rem figure above it would make the ending about the traveller rather than
 * about what they came back with. Larger than the country chapters' 10rem default, though, because the
 * pair has to be readable as a pair.
 */
const TRAVELLER_HEIGHT = 'clamp(9rem, 14vw, 13rem)'

export function Homecoming({
  /*
   * `portraitSrc` rather than a country: this component presents an ending and has no business knowing
   * which country happens to be last. Same shape as ExpectationShift's two strings, and the same
   * reason — see the no-branching note in CountryPage.
   */
  portraitSrc,
}) {
  /*
   * WHAT IS ACTUALLY IN THE JOURNAL, WHICH IS NOT NECESSARILY FIVE.
   *
   * A visitor can reach this page from a shared link, from the header navigation, or by opening the
   * fifth country first — and `src/lib/journal.js` exists precisely because the site used to assume
   * otherwise. So the journal is drawn from the record and the caption is chosen from its length by
   * `journalCaption`, which is in voice.js so that this block and the passport page cannot make that
   * choice two different ways.
   *
   * THE PROSE AROUND IT IS NOT CONDITIONAL, and that asymmetry is deliberate rather than an oversight.
   * `HOMECOMING` is the TRAVELLER speaking about the trip THEY took — "five countries, and not one of
   * them doing an ordinary day the way the last one did" — which is true no matter what the visitor has
   * opened, because it is not a claim about the visitor. The journal is the only thing here that claims
   * anything about them, so it is the only thing that has to be gated. Compare the passport page, where
   * the closing reflection says "we" and therefore is gated.
   */
  const visited = useVisited()

  return (
    <Section surface="sunken" width="prose" ariaLabelledBy="homecoming-heading">
      {/*
       * THE PAIR, ABOVE THE WORDS, exactly as on the home page — see the header note on why this is a
       * bookend rather than a decoration.
       *
       * `items-end` so the two figures stand on the same ground line. A dog whose feet float level with
       * a person's knees is the specific thing that makes composited figures look pasted on.
       *
       * `mb-5` AND NOT A NEGATIVE MARGIN, which is where this first went wrong and is worth recording
       * because the mistake was a copied class rather than a wrong number. The home page tucks its
       * figure with `-mb-3`, and that works there because what is directly beneath it is `CoverPanel` —
       * an opaque card with its own top edge, so the feet disappear behind a surface and the figure
       * reads as standing at it. Here what is directly beneath is the eyebrow line, 12px letterspaced
       * caps. Verified in the browser at 1440: the figure's box plus its drop-shadow sat across "THE
       * LAST FLIGHT HOME" and greyed the words out. A negative margin needs something to hide behind;
       * text is not that thing.
       */}
      <div className="mb-5 flex items-end gap-3 md:gap-5">
        <TravellerFigure src={portraitSrc} maxHeight={TRAVELLER_HEIGHT} />
        <CompanionFigure travellerHeight={TRAVELLER_HEIGHT} delay={0.3} />
      </div>

      <Reveal>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">
          {HOMECOMING.eyebrow} <span aria-hidden="true">·</span>{' '}
          {spellOutCapitalised(TOTAL_STOPS)} stops <span aria-hidden="true">·</span>{' '}
          {spellOutCapitalised(TOTAL_DAYS)} days
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <h2
          id="homecoming-heading"
          className="mt-4 font-display text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink-900"
        >
          {HOMECOMING.heading}
        </h2>
      </Reveal>

      <Reveal delay={0.16}>
        <p className="mt-7 text-lg leading-[1.7] text-ink-700 md:text-xl">{HOMECOMING.body}</p>
      </Reveal>

      <Reveal delay={0.24}>
        {/*
         * The last line the site says, and it is deliberately unresolved — "I have not entirely got over
         * it" rather than a conclusion. Set in the accent as display italic because it is the one
         * sentence here meant to be the thing the visitor leaves with.
         *
         * 24px minimum, as everywhere the accent is used as text: `accent-ink` over the sunken surface
         * clears WCAG's 3:1 large-text threshold and not the 4.5:1 normal-text one, so this may never be
         * set smaller than `text-2xl`.
         */}
        <p className="mt-9 font-display text-2xl italic leading-[1.45] text-[var(--accent-ink)] md:text-3xl">
          {HOMECOMING.open}
        </p>
      </Reveal>

      {/*
       * THE JOURNAL, AFTER THE TRAVELLER HAS FINISHED SPEAKING.
       *
       * WHY IT IS LAST AND NOT UNDER THE HEADING. The block's argument runs words-then-proof: the
       * traveller says what the trip did to them, and then the object they wrote it in is there. Putting
       * it higher would make the prose a caption on a graphic, which inverts which of the two is the
       * content.
       *
       * WHY IT IS STILL ABOVE THE "GO BACK TO THE BEGINNING" LINK. The link is the way out, and a way out
       * belongs after everything there is to look at. It also reads correctly in sequence: here is what
       * you filled, and here is the beginning you filled it from.
       *
       * NO SECTION BOUNDARY BETWEEN THEM. This is one moment, and a `Section` around the journal would
       * put 96px of padding and a surface change through the middle of it.
       */}
      <Reveal delay={0.32}>
        <div className="mt-14">
          <Journal visited={visited} caption={journalCaption(visited.length, TOTAL_STOPS)} />
        </div>
      </Reveal>

      <Reveal delay={0.4}>
        <div className="mt-12">
          {/*
           * A real link and not a button: this navigates and nothing else, so it should be openable in a
           * new tab and should appear in a screen reader's links list. The departure control is a
           * `<button>` precisely because it does something first; that distinction is worth keeping
           * visible in the code rather than styling both the same.
           */}
          <Button to="/" size="lg">
            {HOMECOMING.action}
          </Button>
        </div>
      </Reveal>
    </Section>
  )
}
