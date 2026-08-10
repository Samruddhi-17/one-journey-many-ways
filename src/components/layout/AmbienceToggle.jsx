import { useEffect, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { disable, enable, isOn, setTexture, subscribe, textureFor } from '../../lib/ambience'

/*
 * AmbienceToggle — the one control for the site's sound.
 *
 * ============================================================================================
 * WHAT THIS ANSWERS. The visitor asked what an "ambience toggle" was and then asked for it to be
 * built. This is it: a button that gives each country a quiet sound of its own, off until pressed.
 *
 * WHY IT IS OFF BY DEFAULT AND WHY THAT IS NOT NEGOTIABLE.
 *
 * Autoplaying audio is the most reliably hated behaviour on the web. It arrives without warning,
 * it is loud in a library or an open-plan office, it talks over a screen reader, and the control
 * that stops it has to be hunted for while it is still playing. Browsers now block it outright
 * without a user gesture, which is the platform agreeing.
 *
 * The narrower point for this project: §4.4's closing instruction is to "sit in silence", and a
 * site that starts making noise at a visitor has not earned the right to ask them to sit in
 * anything. Sound here is an offer. The default answer is no, and the visitor changes it.
 *
 * WHY IT IS A BUTTON AND NOT A SLIDER. A volume slider implies the sound is a feature being
 * configured. This is one bit — company, or quiet. The operating system already has a volume
 * control, and it is better than any we would build.
 *
 * WHY THERE IS NO AUTOPLAY-ON-SECOND-VISIT, which localStorage would make easy. Restoring "on"
 * from a previous session is autoplay wearing a permission slip: the gesture that consented was a
 * different visit, possibly on a different day in a different room. The state deliberately does
 * not persist across reloads. It DOES persist across navigation, which is the thing that matters
 * — see the note on where this lives.
 *
 * WHY IT IS RENDERED TWICE, ONCE PER BREAKPOINT. The header at 390px already holds the wordmark,
 * the current stop and the menu trigger; a fourth control there either overflows or shrinks the
 * touch targets below the 44px minimum. So the desktop instance sits in the header bar and the
 * phone instance sits inside the navigation sheet, where there is room for it to be a labelled row
 * rather than an icon. Both drive the same module-level state, which is exactly why that state is
 * not React state — see the subscription note in src/lib/ambience.js.
 * ============================================================================================
 */

/*
 * THE SPEAKER GLYPH, drawn rather than typed.
 *
 * The same argument the flight map makes about its plane: an emoji (🔊) renders in the operating
 * system's own font, at a size and weight nobody here chose, in colours it will not surrender to
 * `currentColor`. A path takes the accent.
 *
 * The two states are distinguished by SHAPE, not by colour or opacity: sound on shows two arcs
 * radiating, sound off shows a cross. That survives greyscale, colour-blind vision and a
 * high-contrast mode, which is the same rule the journal's pressed-versus-outline stamps follow.
 * Colour is a second, redundant signal here and never the only one.
 */
function SpeakerIcon({ on }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      {/* The cone. One path, so it scales as a unit. */}
      <path
        d="M4 9.5h3L11.5 6v12L7 14.5H4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {on ? (
        <>
          <path
            d="M15 9.5a3.5 3.5 0 0 1 0 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M17.8 7a7 7 0 0 1 0 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      ) : (
        <path
          d="M15.5 9.5l5 5m0-5l-5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

/*
 * `variant` selects between the two placements described above:
 *   'icon' — the header bar. Icon only; its name comes from `aria-label`.
 *   'row'  — inside the mobile navigation sheet. A full-width labelled row.
 *
 * This is a PRESENTATION prop and it is worth being explicit that it is not the per-country
 * branching the project forbids. That rule is about a component asking which country it is
 * rendering; this asks which of two places on the page it is in, which is what the argument to a
 * layout component is for. No country is mentioned anywhere in this file.
 */
export function AmbienceToggle({ variant = 'icon' }) {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()

  /*
   * Read the on/off flag out of the audio module. See the subscription note in
   * src/lib/ambience.js for why the flag lives there rather than in `useState` here.
   *
   * The third argument is the server snapshot, which React requires even though this site has no
   * server rendering step — omitting it throws during hydration if one is ever added. `isOn` is
   * safe to reuse for it because it reads a plain module variable, not the audio context.
   */
  const on = useSyncExternalStore(subscribe, isOn, isOn)

  /*
   * Tell the engine which country we are in, on every navigation.
   *
   * WHY THIS RUNS EVEN WHEN THE SOUND IS OFF. `setTexture` remembers the request whether or not
   * anything is playing, so pressing the button on Italy's page starts Italy rather than whichever
   * country was current when the module was first imported. Skipping the call while silent would
   * make the very first press play the wrong place.
   *
   * `textureFor` returns undefined off a country route, which the engine plays as silence — the
   * home page and the passport stay quiet even with the toggle on. "The shell is silent; the
   * country speaks", now audibly.
   *
   * A plain `useEffect` and not `useLayoutEffect`: unlike the accent colour, nothing here is
   * visible in the first painted frame, so there is nothing to get in ahead of. A fade that starts
   * a few milliseconds late is a fade.
   *
   * BOTH INSTANCES RUN THIS, and that is harmless rather than sloppy — `setTexture` compares
   * against what is already wanted and returns early when nothing changed, so the second call on
   * the same navigation does nothing. Making one instance authoritative would mean the sound
   * following the route only while the mobile sheet happened to be open.
   */
  useEffect(() => {
    setTexture(textureFor(location.pathname.replace(/^\//, '')))
  }, [location.pathname])

  /*
   * ------------------------------------------------------------------------------------------
   * REDUCED MOTION SILENCES THIS, AND THE REASONING IS NOT THE OBVIOUS ONE.
   *
   * `prefers-reduced-motion` is not a request about sound, and treating it as one is a real risk of
   * over-reading a media query. The reason it is honoured here anyway: the setting exists because
   * continuous, involuntary, peripheral stimulus makes some people ill — that is the mechanism, and
   * vestibular and audio sensitivity very commonly travel together. A drone that never stops and
   * cannot be escaped without finding a control is that same class of thing in another channel.
   *
   * There is no `prefers-reduced-sound`. Given a visitor who has said "give me less of this" in the
   * only vocabulary the platform provides, the correct reading of an ambiguous signal is the
   * cautious one, and the cost of being wrong is asymmetric: a visitor who wanted sound and did not
   * get it has lost an ornament, while a visitor made unwell has lost the site.
   *
   * WHY THE BUTTON DISAPPEARS ENTIRELY rather than being disabled. A disabled control is a promise
   * of something withheld, and it would invite the visitor to work out what they have to change to
   * earn it. Under this setting the site simply has no sound, the way it has no page transitions.
   *
   * WHY THE `useEffect` ABOVE IT AND NOT BELOW. Returning null before it would call a different
   * number of hooks depending on the setting, which breaks the order React relies on — the same trap
   * CountryPage documents above its `!country` guard, and the reason both do their returning last.
   * ------------------------------------------------------------------------------------------
   */
  if (prefersReducedMotion) return null

  const label = on ? 'Turn off ambient sound' : 'Turn on ambient sound'
  const press = () => (on ? disable() : enable())

  if (variant === 'row') {
    return (
      <button
        type="button"
        onClick={press}
        /*
         * `aria-pressed` is what makes this a toggle rather than a button that does something.
         * A screen reader announces "Ambient sound, toggle button, pressed" — state included — so
         * the current setting is available without the visitor having to press it to find out.
         *
         * Note there is no `aria-label` on this variant: it has visible text, and an `aria-label`
         * would override it, leaving the announced name and the printed name free to disagree.
         */
        aria-pressed={on}
        className="mt-2 flex w-full items-center gap-4 rounded-lg px-3 py-4 text-left transition-colors hover:bg-surface-sunken"
      >
        <span
          className={[
            'flex size-11 shrink-0 items-center justify-center rounded-full border',
            on
              ? 'border-[var(--accent-ink)] text-[var(--accent-ink)]'
              : 'border-ink-200 text-ink-500',
          ].join(' ')}
        >
          <SpeakerIcon on={on} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg text-ink-900">Ambient sound</span>
          {/*
           * THE DESCRIPTION IS LOAD-BEARING, and it changed when the sound did.
           *
           * It used to say "A quiet tone for each country", which was accurate about a filtered
           * drone. The engine now plays notes drawn from each country's own musical tradition — a
           * koto tuning, a raga, alphorn harmonics — and that is a much easier thing to mistake for
           * a recording or for a claim about what a place sounds like.
           *
           * "Synthesised" is therefore not modesty, it is the disclosure: see the header of
           * src/lib/ambience.js for why there are no field recordings, and note that this label is
           * the cheapest possible place to prevent a visitor thinking they are hearing Tokyo.
           */}
          <span className="block text-sm text-ink-500">
            {on ? 'Synthesised notes, one instrument per country' : 'Off'}
          </span>
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={press}
      aria-pressed={on}
      aria-label={label}
      /*
       * `title` so a pointer user gets the same explanation the screen reader gets. An icon-only
       * control in a header is the one place a tooltip genuinely earns its keep: there is no room
       * for a printed label and a speaker with a cross through it is not self-explanatory about
       * *whose* sound it is.
       */
      title={label}
      /* size-11 = 44px, the WCAG 2.5.5 minimum touch target — the same floor the menu trigger
         beside it uses. It is hidden below md, but the rule is about pointer accuracy rather than
         screen size and a trackpad is not more precise than a thumb. */
      className={[
        'hidden size-11 shrink-0 items-center justify-center rounded-md transition-colors md:flex',
        on ? 'text-[var(--accent-ink)]' : 'text-ink-500 hover:text-ink-900',
      ].join(' ')}
    >
      <SpeakerIcon on={on} />
    </button>
  )
}
