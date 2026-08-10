import { motion, useReducedMotion } from 'framer-motion'
import { Section } from '../ui/Section'
import { Reveal } from '../ui/Reveal'
import { LivingBackdrop } from '../ui/LivingBackdrop'
import { CoverPanel } from '../ui/CoverPanel'
import { ExpectationShift } from './ExpectationShift'
import { TravellerFigure } from '../journey/TravellerFigure'
import { Notepaper } from '../ui/Notepaper'
import { arrivalGreeting } from '../../data/voice'
import { TOTAL_STOPS } from '../../data/countries'
import { inProse } from '../../lib/countryName'

/*
 * Arrival — the traveller welcoming the visitor to a country they have just flown into.
 *
 * ============================================================================================
 * WHAT CHANGED FROM THE PREVIOUS ARRIVAL, AND WHY
 *
 * The old one was a page header with a photograph: an eyebrow, the country name, an epithet, the
 * brochure line, then the traveller's note quoted below the fold. Everything correct about it is kept.
 * Two things are different, and both come from the visitor's own complaint that the site did not feel
 * like an experience:
 *
 *   1. THE TRAVELLER SPEAKS. "We have landed in Tokyo" instead of "Stop 1 of 5 · Japan". The facts are
 *      identical; the difference is whether someone is with you. The voice rules this operates under
 *      are in src/data/voice.js — briefly: the traveller may say "I" about what they noticed and never
 *      about themselves, and they never rank a country.
 *
 *   2. THE BACKDROP MOVES. Five photographs drifting and cross-fading instead of one still hero. A
 *      still photograph is a picture of a place; a slow change is closer to being somewhere.
 *
 * THE ORDER OF THIS SECTION IS STILL THE ARGUMENT, and it is the part worth not breaking:
 *
 *   1. Where you are            we have landed in Tokyo, on UTC+9
 *   2. What it is called        the country name, the epithet
 *   3. What you were told       the brochure line, from the dataset
 *   4. What was actually found  the traveller's note, quoted
 *
 * Steps 3 and 4 are adjacent and in that order on purpose. The brochure line ("A blend of tradition,
 * technology and remarkable discipline") is what a visitor is promised; the note that follows
 * contradicts its emphasis without contradicting its facts. That gap IS the chapter, and everything
 * after it is read as evidence for or against a claim the visitor already holds.
 *
 * WHAT IS STILL ABSENT, BY DECISION
 * No statistics. The population, the life expectancy and the commute time are all available right
 * here, and a metric row across the hero would be the fastest possible way to turn this into a
 * dashboard. Every one of those numbers appears later, inside the facet where a question has been
 * asked that it answers.
 *
 * NO PER-COUNTRY BRANCHING. There is no `if (country.slug === 'japan')` in this file and there must
 * never be. The photographs, the quote, the greeting and the accent colours all arrive as data.
 * ============================================================================================
 */

/*
 * The entrance, defined at module scope so these objects are created once rather than per render.
 *
 * WHY THIS ANIMATES ON MOUNT RATHER THAN ON SCROLL (as Reveal does): it is already on screen when the
 * page loads. Going through an IntersectionObserver to animate something already visible adds a frame
 * of latency to the most important content on the page.
 */
const RISE = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const TRANSITION = { duration: 0.75, ease: [0.16, 1, 0.3, 1] }

/*
 * The cadence of the greeting.
 *
 * These are spaced further apart than a normal stagger (90ms) because the lines are being SPOKEN
 * rather than laid out: "We have landed in Tokyo." then a beat, then the country. A tight stagger
 * makes four sentences arrive as one block of text, which is exactly the effect this section is
 * trying not to have. The total is under a second, so it is a cadence rather than a wait.
 */
const DELAY = {
  landed: 0.1,
  name: 0.28,
  epithet: 0.44,
  clock: 0.6,
}

export function Arrival({ country }) {
  const prefersReducedMotion = useReducedMotion()
  const greeting = arrivalGreeting(country)

  const animation = (delay) =>
    prefersReducedMotion
      ? false
      : {
          initial: 'hidden',
          animate: 'visible',
          variants: RISE,
          transition: { ...TRANSITION, delay },
        }

  return (
    <>
      {/*
       * THE COVER.
       *
       * `min-h-[78svh]` — `svh` and not `vh`. `vh` is the viewport height with the mobile address bar
       * hidden, which is the taller measurement, so a `vh` hero is cut off on every phone. This is
       * taller than the old 72svh because the scrim needs vertical room to fade: too short and the
       * gradient from photograph to cream happens over a couple of hundred pixels, which reads as a
       * band rather than a dissolve.
       *
       * `isolate` creates a stacking context so the backdrop's negative z-index stays behind this
       * cover's content instead of falling behind the page background — the classic symptom of a
       * negative z-index with no isolating ancestor.
       */}
      <div className="relative isolate flex min-h-[78svh] items-end overflow-hidden">
        {/*
         * THE COVER PHOTOGRAPH, ALONE. Marked decorative inside the component; see the accessibility
         * note in LivingBackdrop for why alt text would be wrong here rather than merely omitted.
         *
         * THE GALLERY USED TO CROSS-FADE BEHIND THIS AND IT WAS REMOVED, WHICH REVERSES THE REASONING
         * THAT USED TO SIT HERE. The old note argued the softness of the gallery slides was an
         * acceptable price for the drift: they appear seven seconds in, under a scrim, moving, so
         * sharpness reads less. The visitor reported the blur anyway, and named exactly this set:
         * everything except the first image. An argument that a defect will not be noticed is refuted
         * by the defect being noticed.
         *
         * THE ARITHMETIC BEHIND IT, because "very blur" turned out to be measurable. Density is
         * naturalWidth / (CSS width * devicePixelRatio) — below 1 means the browser is magnifying.
         * The cover measures about 0.6 across this band. The gallery photographs are 736px wide and
         * portrait, so across the same 1498px band they measure 0.25: a 4x stretch. Nothing recovers
         * detail lost to an upscale, and there is no larger version of these files to reach for, so
         * the only honest lever is to stop showing them at a size they cannot fill.
         *
         * WHAT THIS COSTS, stated plainly rather than glossed: there is no cross-fade behind the
         * heading any more. LivingBackdrop creates no timer at one slide, so what remains is the
         * single sharp cover with its slow drift. The gallery is not lost — it has its own section
         * further down the chapter, where each photograph is shown at a size it was made for.
         */}
        <LivingBackdrop images={[{ src: country.images.cover }]} overlay="hero" />

        <Section as="div" spacing="none" width="content" className="w-full pb-16 pt-32 md:pb-24">
          {/*
           * THE GREETING SITS ON A PANEL, NOT DIRECTLY ON THE PHOTOGRAPH.
           *
           * This is the half of the image-visibility fix that is easy to forget. Lightening the scrim
           * made the photographs clear; it also removed the thing the ratios below were measured
           * against. Without this panel the cover would have neither the old guarantee nor the new
           * one — text on an unknown photograph, which is the one arrangement that cannot be measured
           * at all. See the header note in CoverPanel for the full table.
           *
           * `max-w-2xl` so the panel is sized to the text rather than to the section: a panel
           * spanning the full content width would cover most of the cover and put us back where the
           * heavy scrim left us. The whole point is that the guarantee is paid for over a small area.
           */}
          <CoverPanel className="max-w-2xl p-7 md:p-10">
            {/*
             * `ink-700` and not the `ink-500` used for eyebrows on plain page surfaces, and this is a
             * measured constraint rather than a preference. On the cover panel — 88% cream over the
             * impossible worst case of a pure black photograph, effective background #DEDBD5 —
             * `ink-500` measures 4.31:1, which is below the 4.5:1 that 14px text requires. `ink-700`
             * measures 8.46:1 at that same worst case.
             *
             * Note that `ink-500` came closer to passing here than it did under the old full-cover
             * scrim (4.31:1 against 3.17–3.81:1) and still does not pass, which is why the rule is
             * unchanged even though the numbers all moved.
             *
             * THE TRAILING STOP-COUNT IS DEMOTED BY WEIGHT, NOT BY COLOUR. It is secondary
             * information and wants to look it, but it is the same 14px as the line it sits in, so
             * every route to a lighter colour is closed: `ink-500` fails at 4.31:1, and so does
             * `text-ink-700/75`, which composites to #65615C over the panel's worst case and measures
             * 4.35:1 — an opacity on a colour is a new colour, and it has to be measured as one.
             * Dropping `font-medium` to normal gets the same hierarchy for free and at full contrast.
             */}
            <motion.p
              {...animation(DELAY.landed)}
              className="text-sm font-medium uppercase tracking-[0.16em] text-ink-700 md:text-base"
            >
              {/*
               * "We have landed in Tokyo" rather than "Stop 1 of 5". The stop count is still here,
               * after it, because a visitor does want to know where they are in a journey — but it is
               * now the smaller half of the sentence rather than the whole of it. `TOTAL_STOPS` is
               * derived from the registry so it cannot drift if a country is added.
               */}
              {greeting.landed}{' '}
              <span className="font-normal text-ink-700">
                Stop {country.arrivalOrder} of {TOTAL_STOPS} <span aria-hidden="true">·</span>{' '}
                {country.days}
              </span>
            </motion.p>

            {/*
             * THE NAME. `clamp(2.75rem, 8vw, 4.75rem)` — fluid type between a floor and a ceiling,
             * one continuous curve rather than breakpoint steps, so there is no viewport width where
             * the type is awkward for its container.
             *
             * SMALLER THAN IT WAS (was 3–5.5rem), because it now has a panel's width to fit inside
             * rather than the whole section's. The floor is checked against the narrowest target and
             * the longest name: at 320px, `8vw` computes to 25.6px so the 44px floor governs, and
             * "Switzerland" fits on one line at 44px inside a 320px screen minus the gutters and the
             * panel's own padding. A floor above the fluid value is fine precisely because it was
             * verified against the longest string rather than assumed.
             */}
            <motion.h1
              {...animation(DELAY.name)}
              id="country-heading"
              className="mt-5 text-[clamp(2.75rem,8vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-ink-900"
            >
              {country.name}
            </motion.h1>

            {/*
             * The epithet is styled as a subtitle and is NOT an `<h2>` — heading level is a statement
             * about document structure, and there is no subsection here. Decoupling visual size from
             * semantic level is one of the highest-leverage accessibility habits there is.
             *
             * MINIMUM 24px IS AN ACCESSIBILITY CONSTRAINT, NOT A TASTE DECISION. This is the one
             * place a country's accent is used as text over the cover. On the panel's worst case the
             * weakest accent (India's) measures 3.67:1. WCAG requires 4.5:1 for normal text but only
             * 3:1 for "large" text, which means 24px regular — so all five clear it at `text-2xl` and
             * India would fail at 20px. Never shrink this below `text-2xl`; if it must get smaller it
             * loses the accent and becomes ink-700.
             *
             * The panel improved this figure rather than costing it: the old full-cover scrim gave
             * India 3.11:1, a margin of 0.11 over the threshold.
             */}
            <motion.p
              {...animation(DELAY.epithet)}
              className="mt-4 font-display text-2xl italic text-[var(--accent-ink)] md:text-3xl"
            >
              {country.epithet}
            </motion.p>

            {/*
             * The clock line — the smallest possible "you are somewhere else" signal, and a fact from
             * the dataset rather than a flourish. It also quietly sets up the day facet, which is the
             * one facet every country's data supports in full.
             */}
            <motion.p
              {...animation(DELAY.clock)}
              className="mt-8 max-w-[46ch] text-lg leading-[1.6] text-ink-700 md:text-xl"
            >
              {greeting.clock}
            </motion.p>
          </CoverPanel>
        </Section>
      </div>

      {/*
       * THE BROCHURE AND THE NOTE — below the cover rather than on it.
       *
       * TWO REASONS IT IS NOT OVER THE PHOTOGRAPHS. Over them it would compete with the country's name
       * for emphasis, and only one thing can be the most important element on a screen. And it would
       * inherit the cover's contrast conditions for a long passage of italic display type, which is
       * the worst case for legibility. Below, on plain cream, it gets the full 11.05:1 and the whole
       * screen to itself.
       *
       * More importantly it earns a beat: the visitor scrolls once, and what they find is not more
       * introduction but a contradiction of the one they just read.
       */}
      <Section width="prose" ariaLabelledBy="traveller-note-heading">
        <h2 id="traveller-note-heading" className="sr-only">
          {/*
           * Visually hidden, so the landmark has a real name and screen-reader users can navigate by
           * heading. An unnamed `<section>` is announced as an anonymous "region", which is worse than
           * no landmark at all. There is no VISIBLE heading on purpose — a heading like "The
           * traveller's note" would label the quotation as a feature of the page, and it is meant to
           * be encountered rather than introduced.
           */}
          {/* `inProse`: mid-sentence, so America takes its article. See src/lib/countryName. */}
          What the traveller expected in {inProse(country)}, and what they found
        </h2>

        {/*
         * THE BROCHURE LINE, and it is explicitly labelled as such.
         *
         * `country.welcome.intro` is the dataset's own promotional sentence. The old build printed
         * it in the hero with no frame, which left the visitor unable to tell the site's voice from
         * the brochure's. Attributing it — "that is what I was told before I came" — is what turns
         * the note beneath it from a testimonial into a correction. Same words, opposite effect.
         *
         * IT IS NO LONGER A `Reveal`, AND THE SWAP IS THE POINT OF THE SECTION.
         *
         * `Reveal` fades content IN as you reach it, which is right for everything that arrives. This
         * line does the opposite: it is the claim the chapter then complicates, so it recedes as the
         * visitor scrolls toward what was actually found. The words, the order and the attribution are
         * untouched — see ExpectationShift for why it recedes rather than being struck through, and for
         * the contrast arithmetic that sets how far it is allowed to fade.
         */}
        <ExpectationShift eyebrow="What the brochure said" line={greeting.brochure} />

        <Reveal delay={0.1}>
          <p className="mt-12 text-base leading-[1.7] text-ink-700 md:text-lg">{greeting.pivot}</p>
        </Reveal>

        <Reveal delay={0.16}>
          {/*
           * THE TRAVELLER, VISIBLE, IMMEDIATELY ABOVE THEIR OWN NOTE.
           *
           * This is where the figure belongs rather than on the cover, and the reason is the section's
           * argument. The cover is about the PLACE — its name, its epithet, the local time — and a
           * person standing on it would compete with the country's name for the one slot a screen has
           * for a most-important element. Here, the next thing the visitor reads is a first-person
           * quotation. Seeing who is speaking a beat before they speak is what turns the note from a
           * pull-quote into someone talking.
           *
           * IT SITS AT THE LEFT, NOT THE RIGHT, AND THAT IS A CORRECTION. It was `justify-end` with a
           * `flip`, which put the figure at the right-hand edge and mirrored it so it faced back into
           * the page. Mirroring also reversed the lettering on the passport it is holding — the prop is
           * gone and the reason is recorded above TravellerFigure. The illustrations face right as
           * drawn, so the left edge is where a figure facing into the text belongs.
           *
           * Slightly overlapping the sheet below (`-mb-4`) so the two read as one object: the traveller
           * holding out their note, rather than an illustration filed above a quotation.
           */}
          <div className="flex justify-start">
            <TravellerFigure src={country.images.portrait} className="-mb-4 ml-2 md:ml-6" />
          </div>

          {/*
           * `<blockquote>` with `<cite>` — the correct elements, and they are not decoration.
           *
           * The site's own narration never claims a personal experience. This text is first person
           * ("I expected futuristic technology..."), so it must be unambiguously attributed —
           * otherwise the site appears to be speaking as itself. A `<div>` styled to look like a
           * quotation solves that visually and not at all for a screen-reader user, who would hear
           * the site say "I expected". The semantic element is what makes the attribution real
           * rather than apparent.
           *
           * The quote is verbatim from the dataset. The only transformation the pipeline applies is
           * straight-to-typographic apostrophes: the glyph changes, the words do not. Editing the
           * traveller's wording would be putting words in their mouth.
           */}
          {/*
           * THE NOTE IS SET ON THE TRAVELLER'S OWN PAPER.
           *
           * `Notepaper` renders this country's sheet of stationery — cream, with sepia line art of its
           * landmarks along the foot — behind the quotation at a measured strength. The full contrast
           * table is in its header note; the one rule it imposes here is that the attribution line
           * below cannot be `ink-500`, because the drawing puts small text under 4.5:1.
           *
           * `as`-free: the `<blockquote>` stays the semantic element and the paper is a `<div>` around
           * it. The alternative — making Notepaper itself the blockquote — would tie a decorative
           * surface to one semantic role and mean the next thing set on paper had to be a quotation.
           */}
          <Notepaper src={country.images.notepaper} className="mt-4 p-7 md:p-10">
            <blockquote className="relative">
              {/*
               * The opening quotation mark as a hanging decorative glyph. `aria-hidden` because the
               * `<blockquote>` already conveys "this is a quotation" — a screen reader announcing a
               * stray quotation character before the sentence is noise.
               *
               * Sits INSIDE the sheet now rather than hanging in the page margin. On paper there is no
               * margin to hang into — the glyph would fall outside the sheet's rounded edge and read as
               * a stray character floating beside it — so it is positioned at the top-left of the
               * paper's own padding, which is where a quotation mark on a handwritten note would be.
               * Still hidden below `md`, where the padding is too tight to give it room.
               */}
              <span
                aria-hidden="true"
                className="absolute -left-1 -top-6 hidden font-display text-6xl leading-none text-[var(--accent-mark)] opacity-40 md:block"
              >
                &ldquo;
              </span>

              <p className="font-display text-[clamp(1.5rem,4vw,2rem)] italic leading-[1.4] text-ink-900">
                {country.travellerNote}
              </p>

              {/*
               * "The traveller" — not a name, and not "I". The visitor travels alongside an anonymous
               * companion who is a guide, not the protagonist: naming them would make this a personal
               * blog and would invite the visitor to evaluate the person rather than the observation.
               *
               * `<cite>` is the element for the source of a quotation. Browsers italicise it by
               * default, which here would compete with the quotation's own italic — hence `not-italic`.
               * The default is a stylistic convention, not a semantic requirement.
               *
               * `ink-700` AND NOT `ink-500`, which is what this line used before the paper arrived. It
               * is 14px, so it needs 4.5:1, and on the sheet's darkest pixel `ink-500` measures about
               * 3.7:1 — see the measured table in Notepaper. Same rule the cover panel imposes, same
               * reason: the background stopped being plain cream, so the colour had to be re-measured
               * rather than carried over.
               */}
              <footer className="mt-6">
                <cite className="text-sm font-medium uppercase not-italic tracking-[0.14em] text-ink-700">
                  The traveller, on arriving in {inProse(country)}
                </cite>
              </footer>
            </blockquote>
          </Notepaper>
        </Reveal>

        {/*
         * THE HANDOVER LINE THAT USED TO SIT HERE IS GONE. It read "Ask me anything about this place",
         * set large in accent italic, and a reader took it for a chat box: at that size, in the
         * traveller's voice, directly above a row of questions, it reads as an input rather than as
         * narration. The site has no free-text input and the six topics below are fixed.
         *
         * The argument for having a line at all was that without one the next section starts cold and
         * the traveller's note reads as a pull-quote. That argument was right about the risk and wrong
         * about the fix: FacetExplorer opens with its own eyebrow, heading and lead, so the handover was
         * a third introduction to a section that already had two. See the note in voice.js for the rule.
         */}
      </Section>
    </>
  )
}
