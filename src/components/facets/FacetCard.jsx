import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FacetEvidence } from './FacetEvidence'
import { ImageFrame } from '../ui/ImageFrame'
import { Paper } from '../ui/Paper'
import { getObservation } from '../../data/journey'
import { inProse } from '../../lib/countryName'

/*
 * FacetCard — one question the visitor can put to the traveller, and the answer.
 *
 * ============================================================================================
 * WHAT THIS IS, STRUCTURALLY
 *
 * A disclosure: a button that expands to reveal a panel. That is a deliberately unglamorous
 * description of the most important interaction on the site, and the plainness is the point —
 * the *interactivity* the previous build lacked is not achieved by inventing a novel control,
 * it is achieved by the visitor deciding what to look at and the site not deciding for them.
 *
 * THE ANSWER HAS THREE PARTS, ALWAYS IN THIS ORDER:
 *
 *   1. THE FRAMING     the site's voice, saying what to look for
 *   2. THE EVIDENCE    the measured data
 *   3. THE TRAVELLER   their own note on the same subject
 *
 * That order is the discipline of the whole chapter. A chart shown before the claim it supports is
 * decoration; the same chart after it is evidence. Reversed — evidence first, then a caption
 * explaining what to make of it — this becomes a dashboard with paragraphs, which is the one thing
 * the product exists in order not to be.
 *
 * And the traveller comes LAST rather than first, which is the subtler half. Their impression
 * arriving before the data would prime the reader to see what the traveller saw; arriving after, it
 * is a second opinion the reader can weigh against something they have already looked at themselves.
 * The data does not settle the impression and the impression does not override the data — which is
 * what "data should answer questions, not end conversations" looks like as a layout.
 *
 * WHY A REAL <button> AND A REAL PANEL, RATHER THAN A CLICKABLE DIV
 * `aria-expanded` on a `<button>` is what makes this announce as "collapsed"/"expanded" to a screen
 * reader, and a native button is keyboard-operable by Enter and Space with no handler. Every
 * hand-rolled accordion this pattern replaces gets one of those wrong. `aria-controls` ties the
 * button to the region it governs so a screen-reader user can jump straight to what just opened.
 *
 * WHY NOT `<details>`/`<summary>`, WHICH WOULD BE FREE
 * It genuinely was the first choice. Rejected for one reason: `<details>` cannot animate its own
 * open/close in a way that works across browsers, because the browser toggles `content-visibility`
 * on the panel and there is no state between closed and open to interpolate. An instant snap is
 * acceptable for a FAQ and wrong here, where the expansion is the site's main gesture and the whole
 * complaint being answered was that nothing moved.
 *
 * ============================================================================================
 * THE PANEL'S CONTENTS ARRIVE IN SEQUENCE, AND THIS IS THE SECOND HALF OF THE SAME COMPLAINT.
 *
 * The visitor said the disclosure was the part of the site they liked and that they were still
 * craving animation. Both were true at once: pressing a question grew a box and animated the bars
 * inside it, and everything else — the framing sentence, the traveller's note, the caveat — was
 * simply there the instant the box existed. So the site's main gesture moved the decoration and not
 * the content.
 *
 * The three parts now rise in the order they are meant to be read: framing, then evidence, then the
 * traveller. That ordering is already the section's whole argument (see above) and it was previously
 * only a fact about vertical position, which the eye does not necessarily follow. Timing states it —
 * the reader is shown the claim before the evidence for it arrives, and the second opinion last.
 *
 * The delays are short and the whole cascade finishes inside 700ms. A disclosure the visitor opens
 * six times must not become a wait, and the failure mode of staggering is that it feels like
 * loading; short enough and it reads as the answer being given rather than fetched.
 * ============================================================================================
 */

/*
 * The panel's cascade. `custom` carries each part's position, so one variant serves all four.
 *
 * WHY A FUNCTION VARIANT rather than four objects with hardcoded delays: the parts are conditional —
 * the traveller's voice and the caveat are both absent on some facets — so a hand-written delay per
 * part would leave a gap in the rhythm whenever one was missing. The caller passes the index it
 * actually has, which is computed from what is being rendered.
 */
const PART = {
  hidden: { opacity: 0, y: 10 },
  visible: (step) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      /*
       * Offset past the panel's own 0.08s opacity delay so the first part starts as the box is
       * already growing rather than after it has settled — the two motions overlap, which is what
       * makes this read as one gesture instead of a box opening and then filling.
       */
      delay: 0.12 + step * 0.09,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

/*
 * ALT TEXT FOR THE FOUR "DID YOU KNOW" PHOTOGRAPHS.
 *
 * ============================================================================================
 * THIS IS KEYED BY SLUG, WHICH THE PROJECT OTHERWISE FORBIDS, AND THE EXCEPTION IS WORTH
 * DEFENDING RATHER THAN QUIETLY TAKING.
 *
 * The standing rule (Arrival's header states it most bluntly: "there is no `if (country.slug ===
 * 'japan')` in this file and there must never be") exists to stop five countries becoming five
 * codebases — so that adding a sixth country means adding data, not editing components. Every
 * DIFFERENCE IN BEHAVIOUR must come from data.
 *
 * This is not a difference in behaviour. It is a description of the contents of four specific
 * image files, and there is no algorithm that derives "sacks of turmeric, cardamom and dried
 * chillies" from a filename or from a sentence about spice exports. Somebody has to look at the
 * photograph and write down what is in it. The only real question is WHERE that writing lives.
 *
 * WHY NOT IN THE PIPELINE, which was the first instinct: the workbook has no alt-text column, so
 * `convertData.mjs` would carry a hand-written table of English prose beside its crop boxes and
 * quality settings. That file's own convention is that hand-written tables there name FILES
 * (`FACT_ASSETS`, `COVER_ASSETS`); prose belongs on this side of the boundary, next to the markup
 * whose accessibility depends on it. Alt text is editorial copy, and editorial copy that lives far
 * from the element it describes is the kind that goes stale silently.
 *
 * WHAT MAKES THIS SAFE RATHER THAN A CRACK IN THE RULE: the fallback. A sixth country with a fact
 * photograph and no entry here gets a plain, honest, correct-if-unhelpful description instead of
 * `undefined` — a missing alt attribute, which is the one failure mode that is actively harmful,
 * because a screen reader then reads the FILENAME aloud. So the table degrades to poor alt text
 * and never to broken alt text.
 * ============================================================================================
 */
const FACT_ALT = {
  japan:
    'A brightly lit vending machine on a Japanese station platform, stocked with rows of canned coffee, tea and bottled drinks.',
  india:
    'Open sacks of spices crowded together at an Indian market — turmeric, cardamom, dried chillies, cinnamon bark and peppercorns.',
  italy:
    'Mount Vesuvius rising behind the excavated streets and stone amphitheatre of Pompeii.',
  switzerland:
    'Six guinea pigs huddled together on a dirt path, all facing the camera.',
}

/*
 * `country.name` in the fallback rather than a bare "A photograph": naming the country at least
 * tells a screen-reader user which place they are hearing about, which is the minimum useful thing
 * an alt attribute can say here.
 */
function factAlt(country) {
  return (
    FACT_ALT[country.slug] ??
    `A photograph illustrating a surprising fact about ${inProse(country)}.`
  )
}

export function FacetCard({ facet, country, open, onToggle, index }) {
  const prefersReducedMotion = useReducedMotion()

  /*
   * THE TRAVELLER'S VOICE FOR THIS FACET.
   *
   * Five of the six facets name an observation section ('Time Usage', 'Food', ...). The sixth — the
   * people — has none, because the workbook has no observation about population, so it falls back to
   * `didYouKnow`. That fallback is not a patch: the dataset's surprising fact is a better closing note
   * for that facet than an observation would be, which is why the facet was designed around it.
   *
   * Rendered only when present. All five countries have all five observations today, but a card that
   * threw on a missing quote would blank an entire chapter over one empty spreadsheet cell.
   */
  const observation = facet.note ? getObservation(country, facet.note) : null
  const voice = observation?.quote ?? (facet.note === null ? country.didYouKnow : null)

  /*
   * Whether the voice is the traveller speaking or the dataset stating a fact, which decides the
   * attribution. This distinction is not cosmetic: `didYouKnow` is not first person and is not the
   * traveller's observation, so attributing it to them would be putting words in their mouth.
   */
  const voiceIsTraveller = Boolean(observation)

  const panelId = `facet-panel-${facet.id}`
  const buttonId = `facet-button-${facet.id}`

  /*
   * The cascade's props, and the counter that keeps the rhythm even when parts are missing.
   *
   * `step` is incremented by each part as it renders, so a facet with no traveller's voice does not
   * leave a beat of silence where one would have been. It is a plain mutable local rather than state
   * because it is derived entirely from this render's own output — the value is consumed and finished
   * with before the render returns, and holding it in state would make a render's internal bookkeeping
   * survive into the next one.
   */
  let step = 0
  const part = () =>
    prefersReducedMotion
      ? {}
      : { variants: PART, initial: 'hidden', animate: 'visible', custom: step++ }

  return (
    <motion.li
      /*
       * The card's own surface changes with its state: sunken and quiet when closed, card-white and
       * raised when open. That is the elevation system doing its one job — signalling which thing on
       * screen is currently the subject — without a heavy shadow, which is the strongest "corporate
       * dashboard" tell there is.
       */
      className={[
        'overflow-hidden rounded-xl border transition-colors duration-300',
        /*
         * `bg-surface-card` IS GONE FROM THE OPEN STATE, and this is a consequence of the panel
         * becoming paper rather than an independent change. The white fill used to be what said "this
         * card is the subject"; now the paper inside says it, and a white strip behind the question
         * with a cream page below it read as two different surfaces butted together — the same seam
         * problem the footer has. The border and the elevation still carry the state, which is what
         * they were always doing most of the work with.
         */
        open
          ? 'border-[var(--accent-mark)] shadow-elev-1'
          : 'border-ink-200 bg-surface-page hover:border-ink-300 hover:bg-surface-sunken',
      ].join(' ')}
      /*
       * THE CARDS DEAL THEMSELVES IN, staggered, as the visitor scrolls to them.
       *
       * `whileInView` rather than `animate`, because these are below the fold when the chapter opens
       * and an entrance that has already finished by the time you look at it is indistinguishable
       * from no entrance. `once: true` latches it so scrolling back up does not replay six cards —
       * repeated motion in the periphery is what makes a page tiring.
       *
       * `amount: 0.2` fires when a fifth of the card is showing. Higher and the top card never
       * animates on a short viewport, because the section heading pushes it in already visible.
       *
       * The stagger comes from `index` rather than from a parent's `staggerChildren`: the cards are
       * mapped by FacetExplorer, which owns the open/closed Set, and a `motion.ul` orchestrating
       * children would mean every state change there re-ran the whole cascade.
       */
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: 0.07 * index, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type="button"
        id={buttonId}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        /*
         * `text-left` because a button's default is centred, and a question centred across a card is
         * a banner rather than something you press. `w-full` so the whole card is the target — a
         * 44px-tall label inside a 120px card leaves most of the card looking clickable and not
         * being so, which is the most common disclosure bug there is.
         *
         * `group` so the number and chevron can react to a hover anywhere on the card rather than
         * only on themselves — the target is the whole row, so the feedback should be too.
         */
        className="group flex w-full items-start gap-5 px-6 py-6 text-left md:px-8"
      >
        {/*
         * THE NUMBER, and it is deliberately not a step indicator.
         *
         * Numbered circles are one of the strongest "this is an enterprise wizard" signals there is,
         * so this is set as small figures with no container — closer to a numbered list in a
         * magazine. It exists because six cards need a scanning anchor, not because there is an order
         * to follow: the visitor can open them in any sequence, and the copy above them says so.
         */}
        <span
          aria-hidden="true"
          className={[
            'mt-1 font-display text-sm font-semibold tabular-nums transition-colors duration-300',
            open
              ? 'text-[var(--accent-ink)]'
              : 'text-ink-400 group-hover:text-[var(--accent-ink)]',
          ].join(' ')}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <span className="min-w-0 flex-1">
          {/*
           * The question is the card's face. It is a <span> inside a button and NOT a heading: a
           * heading inside a button is announced twice by some screen readers, and the panel below
           * carries the real heading structure.
           */}
          <span className="block font-display text-xl font-semibold leading-snug text-ink-900 md:text-2xl">
            {facet.question}
          </span>

          {/*
           * The teaser, hidden once the card is open.
           *
           * It exists to make opening feel worthwhile, so it has no job afterwards — and left in
           * place it would sit directly above the framing sentence saying a similar thing in a
           * quieter voice, which reads as the page repeating itself.
           */}
          {!open ? (
            <span className="mt-2 block text-sm leading-relaxed text-ink-500">{facet.teaser}</span>
          ) : null}
        </span>

        {/*
         * THE INDICATOR — a chevron that rotates, and the one piece of pure interface decoration
         * permitted on the card.
         *
         * `aria-hidden` because `aria-expanded` on the button already conveys the state; a screen
         * reader announcing a rotated glyph would be noise. It rotates rather than swapping between
         * a plus and a minus, because a swap has no intermediate state and therefore cannot tell the
         * visitor that the two states are the same control.
         */}
        {/*
         * TWO ELEMENTS FOR TWO MOTIONS, and this one is a trap worth naming.
         *
         * The hover nudge is a Tailwind `translate-y` class and the flip is framer-motion's `rotate`.
         * Both compile to the `transform` property, and framer writes `transform` as an INLINE style
         * on every frame — which beats a class in the cascade unconditionally. On one element the
         * nudge would silently never happen, and a CSS `transition-transform` there would also fight
         * the rotation. Nothing errors; the hover simply does nothing.
         *
         * So: the outer span owns the hover translate, the inner one owns the rotation. Same rule as
         * the evidence wrapper below — one element per animated transform.
         */}
        <span
          aria-hidden="true"
          /*
           * A small downward nudge on hover while closed: the chevron leaning toward the direction it
           * is about to open in. A transform rather than a colour change, because it is composited and
           * is the signal that actually reads on a 20px glyph. Suppressed when open, where "down"
           * would be pointing the wrong way.
           */
          className={[
            'mt-1 shrink-0 transition-transform duration-300',
            open ? '' : 'group-hover:translate-y-0.5',
          ].join(' ')}
        >
          <motion.span
            className="block"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
              <path
                d="M5 8l5 5 5-5"
                stroke={open ? 'var(--accent-ink)' : 'currentColor'}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={open ? '' : 'text-ink-400'}
              />
            </svg>
          </motion.span>
        </span>
      </button>

      {/*
       * THE PANEL.
       *
       * `AnimatePresence` with `initial={false}` — the false is important. Without it, every card
       * whose panel is closed on mount would run its exit animation on first render, and a card that
       * animates shut on page load looks like the page is undoing something.
       */}
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            /*
             * `role="region"` with `aria-labelledby` pointing at the button: this makes the opened
             * panel a named landmark, so a screen-reader user can navigate to it directly instead of
             * arrowing through the button they just pressed. An unnamed region is announced as an
             * anonymous "region", which is worse than no landmark at all.
             */
            role="region"
            aria-labelledby={buttonId}
            /*
             * ANIMATING `height: auto` — the one place in this project where a layout property is
             * animated rather than a transform, and it is worth stating why the usual rule is
             * suspended.
             *
             * The rule (never animate layout) exists because layout animations recalculate on every
             * frame, which is ruinous for anything continuous — a scroll handler, a drifting
             * backdrop. This runs once, for 400ms, in response to a deliberate press. And the
             * alternative genuinely does not work: a transform-based reveal requires knowing the
             * panel's final height in advance, which means measuring it, which means the content
             * cannot reflow. framer-motion's `height: 'auto'` handles the measurement itself.
             *
             * `overflow-hidden` is what makes it a reveal rather than a squash: without it the
             * content renders at full height immediately and is merely clipped by nothing, so the
             * panel appears to grow out from behind text that is already visible.
             */
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.45,
              ease: [0.16, 1, 0.3, 1],
              /*
               * Opacity is faster than height and offset slightly, so the content is legible before
               * the box has finished growing. Fading over the full duration makes the panel look
               * like it is loading.
               */
              opacity: { duration: prefersReducedMotion ? 0 : 0.25, delay: 0.08 },
            }}
            className="overflow-hidden"
          >
            {/*
             * ==================================================================================
             * THE ANSWER IS WRITTEN ON A PAGE, WHICH IS THE WHOLE OF THIS MILESTONE.
             *
             * Before this, an opened card was a white panel with a blue border, a chart and a legend
             * — competent, and the exact visual register of a dashboard drill-down. The complaint the
             * redesign started from was that the site reads as a data product, and this is the moment
             * the visitor spends the most time inside, so it is where that register mattered most.
             *
             * `Paper` with `ruled` puts the answer on the traveller's own notebook page: cream, a
             * grain, a margin rule down the left. Nothing about the content changed — same framing,
             * same chart, same quote, same caveat, same order. What changed is what the surface
             * claims. A chart on a white panel is a readout; the same chart on a notebook page is
             * something somebody wrote down while they were there.
             *
             * `bordered={false}` because the card around this already draws an edge and a radius —
             * see the note on that prop in Paper.
             *
             * THE RULED MARGIN IS WHY THE PADDING GREW ON THE LEFT (`pl-10 md:pl-16`). The rule sits
             * at `left-8`/`md:left-12` and text running through it looks like a mistake rather than
             * like a margin. Writing starts to the right of the margin, which is what a margin is.
             *
             * ----------------------------------------------------------------------------------
             * THE CONTRAST WAS RE-MEASURED AND NONE OF THE COLOURS INSIDE HAD TO CHANGE, which is a
             * result rather than an assumption — the project's rule is that a new background means
             * every ratio on it is a new number.
             *
             * The panel's surface is `tone="page"` — `surface-page` (#fdf9f3), the cream the rest of
             * the site is set on — with the grain multiplying over it at 3.5%. Worst case, the
             * blackest noise pixel, the surface darkens to #F4F0EA. But the grain lies ABOVE the text
             * too (it has to; see Paper), so it darkens the glyphs by the same factor. The two move
             * together and the ratio barely shifts:
             *
             *   ink-900 (the fact, the quote)   16.89:1 → 15.77:1
             *   ink-700 (the framing)           11.05:1 → 10.55:1
             *   ink-500 (caveat 14px, cite)      5.63:1 →  5.50:1   — still clears 4.5:1
             *
             * So the grain costs about 0.13:1, and the thing that would have broken this is a grain
             * BELOW the text or an opacity on the ink. Neither is in play. This is also why the 3.5%
             * ceiling in Paper is worth keeping: the same arithmetic at 15% would put the caveat under
             * the threshold, and the failure would be invisible in a screenshot.
             *
             * NOTE THAT THIS TABLE WAS COMPUTED TWICE. The first version of this panel used Paper's
             * default white and the ratios were measured against #ffffff; switching to `tone="page"`
             * to kill the seam changed the background, which changed every number. Recorded because
             * it is the rule in action rather than an anecdote: a background change invalidates a
             * contrast measurement even when the text colour is untouched.
             * ==================================================================================
             */}
            <Paper
              ruled
              bordered={false}
              tone="page"
              className="border-t border-ink-100 px-6 pb-8 pt-7 pl-10 md:px-8 md:pl-16"
            >
              {/*
               * A visually hidden heading, so the panel appears in the document outline and a
               * screen-reader user can navigate the six answers by heading. There is no VISIBLE
               * heading because the question on the button directly above already is one — repeating
               * it would be the page saying the same words twice.
               */}
              <h3 className="sr-only">{facet.question}</h3>

              {/* 1. THE FRAMING — the site's voice, before any evidence. */}
              <motion.p
                {...part()}
                className="max-w-[62ch] text-base leading-[1.7] text-ink-700 md:text-lg"
              >
                {facet.framing}
              </motion.p>

              {/*
               * 2. THE EVIDENCE.
               *
               * The wrapper rises and the bars inside it grow on their own timing — two animations on
               * two elements, deliberately. Putting the rise on the bars themselves would fight
               * `useBarMotion`'s `scaleX` for the same transform, and the last one written wins
               * silently. One element per motion is the rule that keeps that from happening.
               */}
              <motion.div {...part()} className="mt-9">
                <FacetEvidence facet={facet} country={country} />
              </motion.div>

              {/* 3. THE TRAVELLER, or the dataset's own fact. */}
              {voice ? (
                <motion.div {...part()} className="mt-10">
                  {voiceIsTraveller ? (
                    /*
                     * `<blockquote>` with `<cite>` — the correct elements, and not decoration. This
                     * text is first person, so it must be unambiguously attributed: a <div> styled
                     * to look like a quotation solves that visually and not at all for a
                     * screen-reader user, who would hear the site itself say "I noticed".
                     */
                    /*
                     * THE QUOTE IS WRITTEN IN THE MARGIN, NOT BOXED OFF BY A RULE.
                     *
                     * The `border-l-2` was the standard pull-quote treatment and it is a UI
                     * convention: a coloured bar down the left says "sidebar" in every content
                     * management system there is. On a notebook page, what marks a passage as the
                     * writer's own aside is where it sits and how it is written, not a bracket.
                     *
                     * So the rule goes and a hanging accent glyph takes its place, set in the margin
                     * the padding above cleared. `aria-hidden` on the glyph because the `<blockquote>`
                     * already conveys that this is quoted — the same reasoning as the quotation mark in
                     * Arrival, and the same reason it is `hidden md:block`: below `md` the margin is too
                     * narrow to hang anything into, and a glyph that collides with its own first line
                     * is worse than no glyph.
                     *
                     * The elements are unchanged. `<blockquote>` and `<cite>` were correct before and
                     * are correct now — this is presentation only, which is what M5 was scoped to.
                     */
                    <blockquote className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute -left-7 -top-2 hidden font-display text-4xl leading-none text-[var(--accent-mark)] md:block"
                      >
                        &ldquo;
                      </span>
                      <p className="max-w-[54ch] font-display text-lg italic leading-[1.55] text-ink-900 md:text-xl">
                        {voice}
                      </p>
                      <footer className="mt-4">
                        <cite className="text-xs font-medium uppercase not-italic tracking-[0.14em] text-ink-500">
                          The traveller
                        </cite>
                      </footer>
                    </blockquote>
                  ) : (
                    /*
                     * NOT A BLOCKQUOTE, because this is not a quotation. `didYouKnow` is a fact from
                     * the dataset in the third person, and dressing it as the traveller's words
                     * would attribute something to them that they did not say. Same information, an
                     * honest frame — and the visual difference (a tinted card rather than a quote
                     * rule) tells a sighted visitor the same thing the markup tells a screen reader.
                     */
                    /*
                     * A NOTE SLIPPED IN AT AN ANGLE, NOT A TINTED CARD.
                     *
                     * This was `rounded-lg bg-[var(--accent-wash)]` — a filled panel, which on a white
                     * background read as a callout and on the notebook page now reads as a UI element
                     * sitting on top of the writing. So it becomes the other thing the page can hold:
                     * a cutting kept between the pages.
                     *
                     * `rotate-[-0.35deg]` is the whole of the effect and is deliberately almost
                     * nothing. Anything you can measure by eye — 1° and up — is scrapbook styling,
                     * which the brief rules out by name. This is small enough to register as "not
                     * printed with the rest of the page" without ever looking decorated.
                     *
                     * THE TAPE IS TWO SPANS AND IS THE ONE PLACE ON THE SITE THAT GETS ANY. A strip at
                     * each top corner, at low opacity in the country's own accent, which is what
                     * holds a cutting to a page. `aria-hidden` — it is stationery.
                     *
                     * The fill stays (`accent-wash`, the lightest accent tint) because a cutting is
                     * still a different piece of paper from the page it is on, and without a fill the
                     * rotation looks like a text-alignment bug rather than a second sheet.
                     */
                    /*
                     * `max-w-2xl` BECAUSE A CUTTING IS SMALLER THAN THE PAGE IT IS ON. Without it this
                     * filled the panel's full width — about 1250px at desktop — and a taped note as
                     * wide as the notebook is not a note, it is a banner with tape on it. The
                     * rotation and the tape only read as "a separate piece of paper" if the piece of
                     * paper is visibly a different size from the page.
                     *
                     * THE TAPE IS INSET RATHER THAN OVERHANGING, which is a fix for real clipping.
                     * The first version used `-top-1.5` so the strips sat proud of the note's top
                     * edge, the way tape does. The facet card is `overflow-hidden` (it has to be —
                     * that is what makes the height animation a reveal rather than a squash), so the
                     * strip on the right was sliced off mid-air and read as a stray blue rectangle.
                     * `top-0` keeps both strips inside the note, which is less literal and is what
                     * survives the clip.
                     */
                    <div className="relative max-w-2xl rotate-[-0.35deg] rounded-sm bg-[var(--accent-wash)] px-6 py-5 shadow-elev-1">
                      <span
                        aria-hidden="true"
                        className="absolute left-6 top-0 h-2.5 w-12 -rotate-3 bg-[color-mix(in_oklab,var(--accent-ink)_16%,transparent)]"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute right-6 top-0 h-2.5 w-12 rotate-2 bg-[color-mix(in_oklab,var(--accent-ink)_16%,transparent)]"
                      />
                      {/*
                       * THE FACT, AND — WHERE ONE EXISTS — THE PHOTOGRAPH OF THE THING IT DESCRIBES.
                       *
                       * `sm:flex` rather than a grid, because the two children have different jobs:
                       * the photograph is a fixed-width object and the text takes what is left. A
                       * grid would need explicit column sizes to say the same thing.
                       *
                       * `items-start` so a short fact does not stretch the frame — without it the
                       * default `stretch` makes the image's height follow the text's, which breaks
                       * the aspect ratio the frame was given.
                       */}
                      <div className="sm:flex sm:items-start sm:gap-6">
                        {/*
                         * THE PHOTOGRAPH IS ABSENT FOR THE UNITED STATES, AND THAT IS THE DESIGNED
                         * BEHAVIOUR RATHER THAN A GAP TO FILL.
                         *
                         * Four countries' surprising facts are things a camera can show: Japan's
                         * vending machines, India's spice sacks, Vesuvius above Pompeii, a huddle of
                         * guinea pigs. America's is "no official language at the federal level" —
                         * the absence of a law, which no photograph depicts. The workbook's US file
                         * is the United Nations building in GENEVA, so publishing it here would
                         * illustrate a fact about America with a picture of Switzerland.
                         *
                         * So this renders NOTHING rather than ImageFrame's placeholder. That is the
                         * opposite of the call made for the experience photographs, and the reason
                         * differs: there, a placeholder holds a slot in a three-column grid that
                         * would otherwise collapse, and the photograph is genuinely expected later.
                         * Here the text is the whole content, one column, and no photograph is
                         * coming — a labelled empty frame would promise an image that does not
                         * exist. See the header note in ImageFrame for the general form of this
                         * distinction.
                         */}
                        {country.images.fact ? (
                          <ImageFrame
                            src={country.images.fact}
                            /*
                             * Alt text describes the PHOTOGRAPH, not the fact — the fact is in the
                             * text directly beside it, and a screen-reader user who hears the
                             * sentence twice learns nothing the second time. `factAlt` keeps the
                             * four descriptions next to each other in one table rather than spread
                             * across the data pipeline; see the note above it.
                             */
                            alt={factAlt(country)}
                            /*
                             * `aspect-[3/4]` because the four sources run 0.56–0.81 and this is the
                             * ratio that costs the least: the widest (Italy, 0.81) loses a sliver
                             * of width and the narrowest (India, 0.56) loses 12% of height from a
                             * photograph that is a repeating texture. Japan's vending machine — the
                             * one image with a subject that a vertical crop could actually
                             * decapitate — keeps 80% of its height, which clears the machine.
                             */
                            aspect="aspect-[3/4]"
                            className="mb-4 w-full sm:mb-0 sm:w-40 sm:shrink-0"
                          />
                        ) : null}

                        <div>
                          {/*
                           * THE COUNTRY'S NAME IS IN THIS LABEL, AND THAT IS THE FIX FOR A REAL BUG
                           * — worth recording in full, because the broken version read perfectly
                           * well in the one place anybody checked it.
                           *
                           * WHAT WAS WRONG. This card used to prefix the dataset's sentence with the
                           * country name and lowercase its first letter, on the stated reasoning
                           * that the workbook's rows are written as a continuation of the name. That
                           * produced, for all five countries, a run-on with no verb agreement:
                           *
                           *     "Japan it features over 5 million vending machines..."
                           *
                           * WHY THE OBVIOUS REPAIR ALSO FAILS. The natural fix is to strip the
                           * leading "It " instead of lowercasing it — "Japan features over 5 million
                           * vending machines", which is correct, and correct for India and Italy
                           * too. It is wrong for Switzerland:
                           *
                           *     "Switzerland is illegal to own just one guinea pig."
                           *
                           * Because Switzerland's "It" is not the country. It is an impersonal
                           * subject — "it is illegal to X" — and the sentence has no slot for a
                           * country name at all. The United States has the same shape of problem in
                           * miniature: its name needs a definite article ("the United States does
                           * not have..."), which `country.name` does not carry.
                           *
                           * So there is no transformation of these five strings that yields five
                           * grammatical sentences. Any scheme that edits them is choosing which
                           * countries to break.
                           *
                           * THE FIX IS TO STOP EDITING THEM. The name moves into the label, where it
                           * supplies the antecedent for "It" without touching the sentence, and the
                           * fact renders exactly as the workbook wrote it. This is also what the
                           * project's own rule already required — the pipeline changes apostrophe
                           * glyphs and nothing else, precisely so the dataset's words stay the
                           * dataset's words.
                           *
                           * THE GENERAL LESSON: string surgery to make data grammatical is a bet
                           * that every row has the same grammar. Here four rows did and the fifth
                           * did not, and the fifth is invisible unless you read all five out loud.
                           * When prose has to fit a slot, change the frame around it, not the prose.
                           */}
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-500">
                            {/*
                             * `inProse` and not `country.name`: this is mid-sentence, so America
                             * needs its article — "about the United States". See src/lib/countryName.
                             */}
                            One thing nobody mentions about {inProse(country)}
                          </p>
                          <p className="mt-3 max-w-[56ch] text-base leading-[1.65] text-ink-900">
                            {voice}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : null}

              {/*
               * THE CAVEAT — Principle 17 attached to the evidence it qualifies, rather than
               * collected in a page footer nobody reaches. Only facets that need one carry one, so
               * this is absent more often than present, which is what keeps it from reading as
               * boilerplate.
               */}
              {facet.caveat ? (
                <motion.p
                  {...part()}
                  className="mt-8 max-w-[62ch] text-sm leading-relaxed text-ink-500"
                >
                  {facet.caveat}
                </motion.p>
              ) : null}
            </Paper>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  )
}
