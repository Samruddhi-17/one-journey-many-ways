import { useState } from 'react'
import { Section } from '../ui/Section'
import { Reveal } from '../ui/Reveal'
import { FacetCard } from './FacetCard'
import { FACETS, TOTAL_FACETS } from '../../data/facets'
import { EXPLORER, progressLine } from '../../data/voice'
/* `spellOutCapitalised` and not `spellOut`: the count opens the lead sentence, so it needs "Six" rather
   than "six". The helper cannot know where the word will land, so the call site chooses — the same
   distinction that was a real bug once in src/lib/meta.js. */
import { spellOutCapitalised } from '../../lib/spellOut'

/*
 * FacetExplorer — the six questions, and the state of which are open.
 *
 * ============================================================================================
 * THE ONE DECISION IN THIS FILE: MORE THAN ONE CARD MAY BE OPEN AT A TIME.
 *
 * The alternative — an accordion where opening one closes the last — is the more common pattern and
 * it is wrong here, for a reason specific to this product. The whole thesis is that these six
 * subjects explain each other: the commute makes sense next to the day it sits inside, the food
 * figures make sense next to the leisure hours. An accordion that closes the day when the visitor
 * opens transport actively prevents the comparison the site exists to enable.
 *
 * It also removes a decision from the visitor that is theirs to make. Principle 12 — the visitor
 * stays in control — and an accordion is the interface deciding what you are allowed to be looking at.
 *
 * WHY A `Set` AND NOT AN ARRAY OR SIX BOOLEANS
 * Six booleans would be six pieces of state describing one thing, and adding a seventh facet would
 * mean touching this file. An array would need `.includes` to read and a filter to remove. A Set says
 * exactly what this is — an unordered collection of which ids are open — and both operations are one
 * call. Note it is REPLACED rather than mutated on every change; see the toggle below.
 *
 * WHY THE STATE LIVES HERE AND NOT IN EACH CARD
 * A card that owned its own open state would work, and the progress line at the bottom could not
 * exist — nothing would know how many were open. State belongs at the level of the thing that needs
 * to read it, which is the standard "lift state up" reasoning, and the progress line is the reason it
 * gets lifted.
 *
 * WHAT IS DELIBERATELY NOT PERSISTED: which cards were open, across a navigation. Arriving in India
 * with the same three questions pre-opened would carry a decision made about Japan into a country
 * where it means nothing, and it would rob the arrival of being an arrival. Each country starts
 * closed.
 * ============================================================================================
 */

export function FacetExplorer({ country }) {
  /*
   * WHICH CARDS ARE OPEN, and every card starts closed.
   *
   * OPENING THE FIRST ONE BY DEFAULT WAS CONSIDERED AND REJECTED. It would guarantee the visitor sees
   * one answer without acting, which is a real benefit — a screen of six closed cards risks reading
   * as a menu rather than as a conversation. But it also makes the first question the site's choice
   * rather than the visitor's, and the section's entire copy ("you choose what we look at", "open them
   * in any order") would then open with the site having already chosen. The header copy below is what
   * carries the burden instead.
   */
  const [openIds, setOpenIds] = useState(() => new Set())

  function toggle(id) {
    setOpenIds((previous) => {
      /*
       * A NEW Set FROM THE OLD ONE, never `previous.add(id)`.
       *
       * React decides whether to re-render by comparing the old state to the new by identity.
       * Mutating the existing Set and returning it returns the same object, so the comparison says
       * "unchanged" and nothing re-renders — the card would simply not open, with no error anywhere.
       * This is the single most common state bug with Sets and Maps in React, and it fails silently,
       * which is why it is worth a comment rather than a shrug.
       */
      const next = new Set(previous)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <Section width="content" ariaLabelledBy="explorer-heading">
      {/*
       * THE HEADING IS THE FIRST THING IN THIS SECTION. There was an eyebrow above it reading "Ask the
       * traveller" and it is gone — see the note where it used to be defined in src/data/voice.js for
       * why, briefly: the heading below is already the traveller asking, and a label above it announced
       * the conversation instead of starting it.
       *
       * `mt-3` WENT WITH IT. That margin existed to set the heading below the eyebrow; with nothing
       * above it, it was three pixels of dead space between the section's own top padding and its first
       * word, which is the sort of leftover that makes a rhythm look slightly wrong for no findable
       * reason. `Section` supplies the space above.
       *
       * The `delay` on this Reveal went too, for the same reason: it was staggered to arrive after the
       * eyebrow, and a first element that waits 80ms for a predecessor that no longer exists reads as
       * the page hesitating.
       */}
      <Reveal>
        <h2
          id="explorer-heading"
          className="max-w-[26ch] font-display text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink-900"
        >
          {EXPLORER.heading}
        </h2>
      </Reveal>

      {/* `delay` stepped down from 0.16 to 0.08 now that this is the second element rather than the
          third. The stagger counts positions, so it has to be renumbered when one is removed. */}
      <Reveal delay={0.08}>
        {/*
         * `lead` TAKES THE COUNT NOW, spelled out, rather than having "Six" typed into the string. The
         * number is `TOTAL_FACETS`, which this file already imports for the progress line below — so the
         * count the sentence claims and the count the section renders can no longer disagree. They did
         * once, in the other direction: the home page said four while this said six.
         */}
        <p className="mt-6 max-w-[58ch] text-lg leading-[1.65] text-ink-700">
          {EXPLORER.lead(spellOutCapitalised(TOTAL_FACETS))}
        </p>
      </Reveal>

      {/*
       * `<ul>` because these are six items of the same kind with no order to follow — which is not
       * merely markup pedantry here, it is the claim the section makes. An `<ol>` would tell a screen
       * reader that this is a sequence, contradicting the copy directly above it that says they can be
       * opened in any order. The list also means a screen-reader user is told there are six before
       * they start, which is the information the numbers on the cards give everyone else.
       */}
      <ul className="mt-12 space-y-4">
        {FACETS.map((facet, index) => (
          <FacetCard
            key={facet.id}
            facet={facet}
            country={country}
            index={index}
            open={openIds.has(facet.id)}
            /*
             * An inline arrow so each card gets a handler for its own id. This creates a new function
             * on every render, which is the thing people are warned about — and it is genuinely
             * irrelevant at six items: the cost is one closure allocation each, and the alternatives
             * (a `useCallback` per card, or a data attribute read from the event) are more code for a
             * saving that is not measurable. Worth knowing where the real threshold is rather than
             * applying the rule everywhere.
             */
            onToggle={() => toggle(facet.id)}
          />
        ))}
      </ul>

      {/*
       * THE PROGRESS LINE — in words, never as a fraction.
       *
       * "4 of 6" is a completion meter, and a completion meter turns curiosity into a chore: it tells
       * the visitor how much is left to get through, which is the wrong relationship to have with a
       * country. `progressLine` reports what has happened instead of what remains, and stops
       * mentioning counts entirely once everything is open.
       *
       * `aria-live="polite"` so a screen-reader user hears it update when they open a card, without
       * it interrupting whatever is currently being read. Without the live region this text changes
       * silently and only sighted visitors get the feedback.
       */}
      <p
        aria-live="polite"
        className="mt-10 max-w-[54ch] text-sm leading-relaxed text-ink-500"
      >
        {progressLine(openIds.size, TOTAL_FACETS)}
      </p>
    </Section>
  )
}
