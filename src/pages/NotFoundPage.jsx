import { Section } from '../components/ui/Section'
import { Button } from '../components/ui/Button'

/*
 * NotFoundPage — the wrong-turn page.
 *
 * WHY IT IS WORTH WRITING PROPERLY
 * Every site gets bad URLs: a mistyped address, an old link, a truncated share. The
 * default is a blank white screen, which reads as "the site is broken" rather than "that
 * address doesn't exist". The difference between those two impressions is a few lines of
 * markup.
 *
 * It is also written in the project's voice rather than in error-message voice. A visitor
 * who lands here should still feel they are somewhere designed. "404" is a status code, not
 * a message to a person.
 */
export function NotFoundPage() {
  return (
    /*
     * `as="div"`: the whole page is one message. Its <h1> already names it, so there is no
     * sub-region here worth announcing as a landmark.
     */
    <Section as="div" width="prose" className="min-h-[60svh]">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-ink-500">
          A wrong turn
        </p>

        <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink-900">
          This stop isn&rsquo;t on the itinerary
        </h1>

        <p className="mx-auto mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-700">
          The page you were looking for doesn&rsquo;t exist, but the journey does.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button to="/">Back to the beginning</Button>
          <Button to="/passport" variant="secondary">
            See the route
          </Button>
        </div>
      </div>
    </Section>
  )
}
