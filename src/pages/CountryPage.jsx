import { useParams, Navigate } from 'react-router-dom'
import { Arrival } from '../components/country/Arrival'
import { Glimpses } from '../components/country/Glimpses'
import { FacetExplorer } from '../components/facets/FacetExplorer'
import { Departure } from '../components/journey/Departure'
import { Homecoming } from '../components/journey/Homecoming'
import { getJourneyCountry } from '../data/journey'
import { getNextCountry } from '../data/countries'
import { useRecordVisit } from '../hooks/useJournal'

/*
 * CountryPage — one component, five countries.
 *
 * ============================================================================================
 * THE CHAPTER IS NOW THREE MOVEMENTS INSTEAD OF FOUR, AND THE MIDDLE ONE IS INTERACTIVE.
 *
 *   ARRIVAL    the traveller welcomes you, and says what they were told versus what they found
 *   EXPLORER   six questions you may put to them, in any order, opened by you
 *   DEPARTURE  the traveller proposes the next country, and you fly there across a real map
 *
 * WHAT THIS REPLACED, AND WHY. The previous chapter was ARRIVAL · LIVING · CULTURE · REFLECTION —
 * four sections of prose and charts that the visitor scrolled past in a fixed order. It was
 * well-built and it was an article: the only two things a visitor could do were scroll and press
 * "next". The complaint that prompted this rebuild was exactly that, so the fix is not more polish
 * on the article, it is giving the visitor decisions.
 *
 * WHERE LIVING, CULTURE AND REFLECTION WENT — nothing was thrown away:
 *   · Living's day, transport and food charts are three of the six facets, unchanged in substance.
 *   · Culture's languages, experiences and "did you know" are three more.
 *   · Reflection's closing prose is the part genuinely dropped, and deliberately: it told the
 *     visitor what to make of evidence they had just been shown. In a chapter where the visitor
 *     chooses which evidence to look at, a summary of all of it is a summary of things they may not
 *     have opened. The reflective note now lives per-facet, attached to what it is about.
 *
 * WHY THE FLIGHT LIVES ON THE PAGE BEING LEFT rather than on the one being arrived at: an exit
 * animation runs while the leaving page unmounts, which would tear the map down mid-flight.
 * Departure owns both the animation and the navigation that follows it — see its header note.
 *
 * WHAT THIS FILE STILL DOES NOT DO, and must never start doing: ask which country it is. There is
 * no `if (countrySlug === 'japan')` here or anywhere beneath it. The difference between the five
 * chapters is entirely the atmosphere variables SiteLayout has applied and the measured data joined
 * in data/journey.js.
 * ============================================================================================
 */
export function CountryPage() {
  const { countrySlug } = useParams()
  const country = getJourneyCountry(countrySlug)

  /*
   * THE ONE LINE THAT MAKES THE JOURNAL TRUE.
   *
   * Being on this page IS the visit, so this is where it is recorded — not on the departure control,
   * which a visitor may never press, and not on the passport page, which would only ever record
   * itself. Everything downstream that claims the visitor has been somewhere reads from this.
   *
   * ABOVE THE `!country` GUARD, WHICH LOOKS LIKE THE WRONG ORDER AND IS THE REQUIRED ONE. Hooks must
   * run on every render in the same order, so this cannot sit after an early return. `country?.slug`
   * is therefore `undefined` for a bad URL, and the store ignores a falsy slug — so a visitor who
   * mistypes a country does not get a stamp for a place that does not exist.
   */
  useRecordVisit(country?.slug)

  /*
   * An unknown slug is not an error to render — it is a wrong URL.
   *
   * `<Navigate replace>` redirects instead of rendering. `replace` swaps the current history entry
   * rather than adding one, so the browser Back button returns to wherever the visitor actually
   * came from instead of bouncing them through the bad URL again.
   *
   * Returning a component to cause navigation looks odd at first. It is idiomatic React Router:
   * rendering is the mechanism, because a redirect is a description of what should be on screen,
   * not an action to perform.
   */
  if (!country) {
    return <Navigate to="/not-found" replace />
  }

  /*
   * `getNextCountry` reads the registry rather than the joined dataset, because Departure needs only
   * a name and a slug and should not fail to render if the measured data for the next country is
   * incomplete. Null after the fifth country, which is what selects the homecoming below.
   */
  const nextCountry = getNextCountry(country.slug)

  return (
    <>
      <Arrival country={country} />

      {/*
       * THE GLIMPSES SIT BETWEEN THE ARRIVAL AND THE QUESTIONS, which makes the chapter four
       * movements rather than three. The header note above still describes the three that carry the
       * argument; this is a beat between two of them rather than a fourth movement.
       *
       * WHY HERE. The five `country_gallery` photographs were already on the page, feeding the
       * arrival's drifting backdrop where they are blurred, scaled past the frame and `aria-hidden` —
       * so the site had five photographs per country that nobody could look at. Shown once, sharp,
       * at the point where the visitor has met the traveller's claim and has not yet seen any
       * evidence: what the place looked like, before it is measured.
       *
       * Not after the facets, which was the alternative. There the photographs would be a reward for
       * finishing the charts, and the chapter is meant to END on the traveller proposing the next
       * flight rather than on a picture strip.
       */}
      <Glimpses country={country} />

      <FacetExplorer country={country} />

      {/*
       * THE END OF THE CHAPTER, WHICH IS EITHER A FLIGHT OR A HOMECOMING.
       *
       * The condition is about the ITINERARY'S SHAPE and not about a country: there is a next stop, or
       * there is not. Nothing here or in either component names America — the fifth country gets the
       * ending because it is the one with nothing after it, which is the same principle as the rest of
       * this file.
       *
       * `Homecoming` was forty lines of JSX in this slot until it had to show the journal and the pair
       * as well; the argument for moving it out is in its own header note. It takes the country's
       * portrait rather than the country, so it stays as ignorant of the itinerary as it should be.
       */}
      {nextCountry ? (
        <Departure from={country} to={nextCountry} />
      ) : (
        <Homecoming portraitSrc={country.images.portrait} />
      )}
    </>
  )
}
