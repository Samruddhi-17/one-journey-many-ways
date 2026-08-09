import { useEffect, useSyncExternalStore } from 'react'
import { recordVisit, serverSnapshot, subscribe, visitedSlugs } from '../lib/journal'

/*
 * useJournal — the two hooks the journal needs, kept apart on purpose.
 *
 * READING and WRITING are separate hooks because the components that do each are different
 * components. The journal on the home page, the passport page and the header all READ; only the
 * country page WRITES. A single combined hook would mean the home page subscribing to a store it
 * then also records into, and the first accidental call would stamp the visitor's journal for a
 * country they are only looking at a link to.
 */

/**
 * The slugs visited this session, in visit order. Re-renders the caller when that changes.
 *
 * The three arguments to `useSyncExternalStore` are: how to subscribe, how to read the current
 * value, and how to read it when there is no browser. See the notes in src/lib/journal.js on why
 * the snapshot function must return a stable identity — this hook is the reason that matters.
 */
export function useVisited() {
  return useSyncExternalStore(subscribe, visitedSlugs, serverSnapshot)
}

/**
 * Record that the visitor has arrived somewhere.
 *
 * IN AN EFFECT AND NOT IN THE RENDER BODY. Writing to an external store during render is a side
 * effect in the middle of a pure function: React may render a component twice, or start a render
 * and throw it away, and a store written during a discarded render keeps its change. `useEffect`
 * runs after the render has committed, which is the definition of "this actually happened".
 *
 * `useEffect` RATHER THAN `useLayoutEffect`, which is the opposite of the call useAtmosphere makes,
 * and the difference is worth naming since the two hooks sit side by side on the country page. The
 * atmosphere must be applied BEFORE the browser paints, because a country page painted in the
 * shell's colour for one frame is a visible flash. Nothing on the current page depends on this
 * write, so blocking paint for it would cost a frame to change nothing on screen.
 *
 * The store is idempotent, so this deliberately does not guard against running twice.
 */
export function useRecordVisit(slug) {
  useEffect(() => {
    recordVisit(slug)
  }, [slug])
}
