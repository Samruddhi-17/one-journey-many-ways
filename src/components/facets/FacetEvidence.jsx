import { motion, useReducedMotion } from 'framer-motion'
import { ImageFrame } from '../ui/ImageFrame'
import { getDay, getTransport, getFood } from '../../data/journey'

/*
 * FacetEvidence — one component, six shapes of evidence, no country-specific code.
 *
 * ============================================================================================
 * WHY THE SWITCH IS ON SHAPE AND NOT ON SUBJECT
 *
 * This component receives a facet and a country and renders whatever answers that facet's question.
 * It switches on `facet.kind` — 'divided-bar', 'share-bars', 'stated-list' — rather than on
 * `facet.id`. The distinction matters: two facets could legitimately want the same form (transport
 * and food are both bars, differing only in what they are scaled against), and a renderer keyed on
 * subject would be six components pretending to be one, which is how five countries become five
 * codebases.
 *
 * THE RULE EVERY SHAPE HERE OBEYS: the numbers are in the text, and the graphic is decoration on top
 * of them. Every bar in this file is `aria-hidden`, and every value it encodes appears as a real
 * string in the document. That is the opposite of the usual chart pattern — an SVG carrying the
 * content with a text alternative bolted on that quietly rots — and it is why nothing here needs
 * hand-written ARIA. Accessibility by construction, not by annotation.
 *
 * WHY THERE IS NO CHART LIBRARY. Every visualisation on this site is a div with a width. Recharts
 * was a dependency of this project for months, imported nothing, and was removed: a dependency
 * justified by an anticipated future need is not paid for by that need until the need arrives. If a
 * chart here ever wants axes and ticks over many points, adding one back is one command, and by then
 * it will be a decision about a chart that exists.
 * ============================================================================================
 */

/*
 * The five ordinal steps, light to dark, from the active country's own accent.
 *
 * APPLIED IN THE CANONICAL SEQUENCE, NEVER BY SIZE. If the darkest step went to the largest share,
 * colour would encode rank, the assignment would differ per country, and dark would come to mean
 * "more" — which is forbidden. Following the fixed order means step three is always Leisure, in
 * every country, and the ramp reads as progress through a day rather than as a scoreboard.
 */
const RAMP = [
  'var(--chart-ordinal-1)',
  'var(--chart-ordinal-2)',
  'var(--chart-ordinal-3)',
  'var(--chart-ordinal-4)',
  'var(--chart-ordinal-5)',
]

/*
 * Hours as a person would say them. "6h 18m" is a duration; "6.3h" is a data point. The workbook
 * states tenths of an hour, so this converts exactly rather than inventing precision — 6.3 becomes
 * 6h 18m, not "about 6h 20m".
 */
function formatHours(hours) {
  const whole = Math.floor(hours)
  const minutes = Math.round((hours - whole) * 60)
  if (minutes === 0) return `${whole}h`
  return `${whole}h ${String(minutes).padStart(2, '0')}m`
}

/*
 * Population in words rather than digits: "1.4 billion" not "1,428,627,663".
 *
 * WHY. The workbook's figure has ten significant digits and not one of them past the second is
 * knowable — a national population is an estimate that changes while you read it. Printing all ten
 * claims a precision nobody has, and it invites the reader to compare two long numbers digit by
 * digit, which is a ranking exercise. "1.4 billion" is what the number actually means.
 */
function formatPopulation(value) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} billion`
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)} million`
  return value.toLocaleString('en-GB')
}

/* Shared bar-growth motion. One definition, so every bar on the site animates identically. */
function useBarMotion(index) {
  const prefersReducedMotion = useReducedMotion()
  if (prefersReducedMotion) return { initial: false }
  return {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: { duration: 0.7, delay: 0.06 * index, ease: [0.16, 1, 0.3, 1] },
  }
}

/*
 * A DIVIDED BAR — one whole, split into named parts. Used for the day.
 *
 * WHY THIS FORM RATHER THAN A DONUT. A donut encodes share as ANGLE, the hardest visual channel to
 * judge — nobody can tell 18% from 21% in a pie — and it needs a legend, which is a lookup table the
 * reader has to hold in their head. A divided bar encodes share as LENGTH, the channel people judge
 * most accurately, and keeps "this is one whole day" visible in the form itself. Five separate bars
 * would be accurate and would lose that: five bars are five facts, and a day is one fact.
 *
 * WHY THE LABELS SIT BELOW RATHER THAN ON THE SEGMENTS. At 320px the Commuting segment is 1.1 of 24
 * hours — about 13 pixels. No text fits there and no viewport width makes it fit, so a label on the
 * segment is a label that only works at 1440px.
 */
function DividedBar({ day }) {
  return (
    <div>
      <div
        aria-hidden="true"
        className="flex h-14 w-full overflow-hidden rounded-lg bg-surface-sunken md:h-16"
      >
        {day.activities.map((item, index) => (
          <Segment key={item.activity} item={item} index={index} total={day.activities.length} />
        ))}
      </div>

      {/*
       * The values as a description list. `<dl>` is the correct element — each activity is a term and
       * its duration is the description — so a screen reader announces "Commuting, 1h 06m" as one
       * fact rather than as two adjacent strings whose relationship must be inferred from position.
       */}
      <dl className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {day.activities.map((item, index) => (
          <div key={item.activity} className="flex items-baseline gap-3">
            <span
              aria-hidden="true"
              className="mt-1.5 size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: RAMP[index % RAMP.length] }}
            />
            <dt className="flex-1 text-sm leading-snug text-ink-700">{item.activity}</dt>
            {/*
             * `tabular-nums` — the OpenType feature making every digit the same width so a column of
             * numbers aligns. Without it "10h 24m" and "1h 06m" wobble against each other, which
             * reads as sloppiness in exactly the place a reader is comparing values.
             */}
            <dd className="text-sm font-medium tabular-nums text-ink-900">
              {formatHours(item.hours)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/*
 * One segment, extracted so it can call the motion hook.
 *
 * WHY IT IS ITS OWN COMPONENT: hooks cannot be called inside a `.map` callback — that would run
 * `useReducedMotion` a variable number of times per render, which breaks the order React relies on to
 * match hook calls to their state. A component per item is the standard resolution.
 */
function Segment({ item, index, total }) {
  const barMotion = useBarMotion(index)
  return (
    <motion.div
      className="h-full"
      style={{
        flexBasis: `${item.share}%`,
        backgroundColor: RAMP[index % RAMP.length],
        transformOrigin: 'left',
        /*
         * The 2px gap is a right BORDER in the page colour, not a margin. A margin would shrink the
         * segments and make every width slightly wrong; a border overlays the boundary and leaves the
         * geometry exact. The last segment gets none so the bar ends flush.
         */
        borderRight: index === total - 1 ? 'none' : '2px solid var(--color-surface-page)',
      }}
      {...barMotion}
    />
  )
}

/*
 * SHARE BARS — parts of 100%, each labelled. Used for transport.
 *
 * Constrained in width by the caller rather than run to full page width: a horizontal bar spanning
 * 1080px forces the eye to travel a long way to compare two lengths, and at that width a 1.5% bar
 * becomes a stub floating in whitespace.
 */
function ShareBars({ items, labelKey, valueKey, suffix, scale }) {
  return (
    <ul className="space-y-5">
      {items.map((item, index) => (
        <BarRow
          key={item[labelKey]}
          label={item[labelKey]}
          value={item[valueKey]}
          display={`${item[valueKey]}${suffix}`}
          fraction={item[valueKey] / scale}
          index={index}
        />
      ))}
    </ul>
  )
}

function BarRow({ label, display, fraction, index }) {
  const barMotion = useBarMotion(index)

  return (
    <li>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-ink-700">{label}</span>
        <span className="text-sm font-medium tabular-nums text-ink-900">{display}</span>
      </div>

      <div
        aria-hidden="true"
        className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-sunken"
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            /*
             * `width` sets the resting size and `scaleX` animates to it, rather than animating the
             * width itself. Animating width recalculates layout on every frame; a transform is
             * composited on the GPU. Same visual result, an order of magnitude apart in cost.
             */
            width: `${Math.min(100, fraction * 100)}%`,
            backgroundColor: 'var(--accent-mark)',
            transformOrigin: 'left',
          }}
          {...barMotion}
        />
      </div>
    </li>
  )
}

/*
 * STATED LIST — evidence set as text because a bar would lie about it. Used for language.
 *
 * THE DATA IS THE REASON FOR THE SHAPE. Three of the five countries record language figures as
 * ranges — "15–30%" for English in Japan — because that is genuinely the state of the evidence. A bar
 * has one length, so drawing a range requires picking a point inside it, converting an honest
 * uncertainty into a false precision. The dataset does carry a midpoint for that purpose and this
 * renderer ignores it: "15–30%" tells the reader something a 22.5% bar actively hides, which is that
 * nobody knows the figure to better than fifteen points.
 */
function StatedList({ items }) {
  return (
    <ul className="divide-y divide-ink-200">
      {items.map((item) => (
        <li key={item.language} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4">
          <span className="font-display text-lg font-semibold text-ink-900">{item.language}</span>
          <span className="text-xs uppercase tracking-[0.14em] text-ink-500">{item.type}</span>
          {/*
           * `ml-auto` pushes the figure to the right edge on one line and lets it fall below on a
           * narrow screen, without a media query. The value is last in the DOM as well as visually,
           * so a screen reader hears the language, then its role, then its share — the order the
           * sentence would be spoken in.
           */}
          <span className="ml-auto text-sm font-medium tabular-nums text-ink-900">
            {item.display}
          </span>
        </li>
      ))}
    </ul>
  )
}

/*
 * STATED FACTS — single figures set as sentences. Used for the people.
 *
 * WHY NOT BARS, which is the entire reason this shape exists. Population and life expectancy are the
 * two most rankable figures in the dataset: single numbers on a single axis. Drawn against a shared
 * scale, India's population bar dwarfing Switzerland's says nothing about living in either place, and
 * a life-expectancy ramp says one country is doing better at being a country. Set as sentences, each
 * figure stands on its own and invites no comparison of lengths.
 */
function StatedFacts({ facts }) {
  return (
    <dl className="grid gap-8 sm:grid-cols-2">
      <div>
        <dt className="text-xs font-medium uppercase tracking-[0.16em] text-ink-500">
          People living here
        </dt>
        <dd className="mt-3 font-display text-[clamp(2rem,5vw,2.75rem)] font-semibold leading-none tracking-[-0.02em] text-ink-900">
          {formatPopulation(facts.population)}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-[0.16em] text-ink-500">
          Life expectancy at birth
        </dt>
        <dd className="mt-3 font-display text-[clamp(2rem,5vw,2.75rem)] font-semibold leading-none tracking-[-0.02em] text-ink-900">
          {facts.lifeExpectancy} years
        </dd>
      </div>
    </dl>
  )
}

/*
 * EXPERIENCES — three photographs with what they are.
 *
 * The only facet whose evidence is images rather than figures, and the framing copy says so plainly:
 * these are the traveller's own choices, which is a different kind of evidence from everything else
 * here. Naming that is what keeps Principle 10 (every image advances the narrative) true rather than
 * aspirational — the visitor knows which kind of thing they are looking at.
 */
function Experiences({ experiences, countryName }) {
  return (
    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {experiences.map((item) => (
        <li key={item.experience}>
          <ImageFrame
            src={item.image}
            /*
             * Alt text built from the dataset's own title and the country, so it is specific per
             * image with no hand-written sentence per country. "Photograph of Japan" would be
             * useless — it repeats the heading beneath it. This describes what the image shows.
             */
            alt={`${item.title} in ${countryName}.`}
            label={item.title}
            aspect="aspect-[4/3]"
            className="w-full"
          />
          <h4 className="mt-4 font-display text-lg font-semibold text-ink-900">{item.title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">{item.description}</p>
        </li>
      ))}
    </ul>
  )
}

/*
 * THE DISPATCHER.
 *
 * Note the shape of this function: it reads the data it needs through the accessors in journey.js and
 * returns one of the shapes above. It contains no copy, no country name test, and no per-facet
 * styling — everything editorial lives in facets.js and everything measured lives in journey.json.
 */
export function FacetEvidence({ facet, country }) {
  switch (facet.kind) {
    case 'divided-bar': {
      const day = getDay(country)
      return (
        <figure>
          {/*
           * The caption comes FIRST in the markup as well as visually, so a screen-reader user meets
           * the explanation before the numbers — the same order a sighted reader gets. Placed after,
           * it would announce five durations and only then say what they were durations of.
           */}
          <figcaption className="text-sm text-ink-500">
            An average day for someone aged {day.ageGroup}, in hours.
          </figcaption>
          <div className="mt-5">
            <DividedBar day={day} />
          </div>
        </figure>
      )
    }

    case 'share-bars': {
      const transport = getTransport(country)
      return (
        <figure className="max-w-[34rem]">
          {/*
           * "each way, one way" WAS THE SAME THING TWICE IN FOUR WORDS, and it rendered as "About 39
           * minutes each way, one way." The field is named `commuteMinutesOneWay`, the direction has to
           * be said once because a reader would otherwise assume a round trip, and "each way" says it
           * in two words: a figure that is true of each direction is by definition not the total.
           */}
          <figcaption className="text-sm text-ink-500">
            Share of everyday journeys by mode. The commute is about{' '}
            {country.facts.commuteMinutesOneWay} minutes each way.
          </figcaption>
          <div className="mt-5">
            <ShareBars
              items={transport}
              labelKey="mode"
              valueKey="percentage"
              suffix="%"
              scale={100}
            />
          </div>
        </figure>
      )
    }

    case 'scaled-bars': {
      const food = getFood(country)
      return (
        <figure className="max-w-[34rem]">
          {/*
           * THE UNIT ONLY. This caption used to add "drawn against the journey's largest figure", and
           * that half is gone because the note at the foot of the panel now says the same thing at
           * length — including WHICH figure it is — so the reader was being told about the scale twice
           * within one card, once in passing and once properly.
           *
           * A figcaption's job here is the unit, which the bars cannot carry themselves: "92" is
           * meaningless and "92 kg" over a year is not. Everything about how the drawing was made
           * belongs in the note; see the header in facets.js for where that line falls and why.
           */}
          <figcaption className="text-sm text-ink-500">
            Kilograms per person per year.
          </figcaption>
          <div className="mt-5">
            <ShareBars
              items={food.items}
              labelKey="category"
              valueKey="perCapita"
              suffix=" kg"
              /*
               * The shared scale across all five countries, computed once in journey.js. Scaling each
               * country to its own maximum would be actively misleading: India's 145 kg of dairy and
               * Switzerland's 288 kg would draw the same length, rendering the one genuinely large
               * difference in the dataset invisible.
               */
              scale={food.scale}
            />
          </div>
        </figure>
      )
    }

    case 'stated-list':
      return <StatedList items={country.languages} />

    case 'stated-facts':
      return <StatedFacts facts={country.facts} />

    case 'experiences':
      return <Experiences experiences={country.experiences} countryName={country.name} />

    default:
      /*
       * An unknown kind means facets.js declared a shape this file does not implement — a
       * development-time mistake, not a runtime condition, so it renders nothing rather than
       * throwing. A facet card that opens to an empty panel is a visible, contained bug; an
       * exception here would take down the whole chapter.
       */
      return null
  }
}
