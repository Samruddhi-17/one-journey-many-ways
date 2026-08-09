/*
 * journal.js — which countries the visitor has actually been to.
 *
 * ============================================================================================
 * WHY THIS EXISTS, AND WHAT IT REPLACES.
 *
 * The journey's closing claim is "I started with an empty passport and came back with memories". A
 * site cannot make that claim unless it knows what the visitor has done, and until now nothing did.
 * Two places faked it, both by deriving visits from the ITINERARY rather than from the visit:
 *
 *   Departure computed `travelled` as "every country whose arrivalOrder <= this one", and its own
 *   comment admitted the consequence — a visitor arriving on /italy from a shared link is shown
 *   Japan and India as visited, because they come earlier in the route.
 *
 *   PassportPage rendered all five stops unconditionally, so the record was complete before the
 *   journey started.
 *
 * Both are honest failures of the old design (the site made no claim about the visitor, so it did
 * not need to be right about them) and both directly contradict the new one. A journal that is
 * already full cannot fill up.
 *
 * ============================================================================================
 * WHY MODULE STATE AND `useSyncExternalStore`, RATHER THAN CONTEXT.
 *
 * This is the same shape as src/lib/ambience.js and for the same reason, which is worth stating
 * because React Context is the more obvious answer. Three things read this: the journal on the home
 * page, the passport page, and the header. They are in three different branches of the tree, so a
 * Context provider would have to wrap the whole app — and every consumer of that context re-renders
 * on every change whether it cares or not.
 *
 * More importantly, the value is not React's to own. It is a fact about the browser session that
 * outlives any component and is written by navigation rather than by an event handler. Module state
 * plus a subscription is what that is: the store is the truth, React subscribes to it.
 * `useSyncExternalStore` is the hook built for exactly this and it is the one that gets tearing
 * right under concurrent rendering, which a hand-rolled `useEffect` + `useState` pair does not.
 *
 * ============================================================================================
 * `sessionStorage` AND NOT `localStorage`, WHICH IS A DELIBERATE DECISION RATHER THAN A DEFAULT.
 *
 * Note that ambience.js argues at length for persisting NOTHING, so this needs its own defence
 * rather than borrowing that one. That file's objection is about consent: restoring "sound on" from
 * a previous visit is autoplay wearing a permission slip, because the gesture that agreed to it
 * happened on a different day in a different room. None of that applies to remembering where
 * somebody has been — it makes no noise and asks for nothing.
 *
 * The reason it persists AT ALL is that a refresh is not a decision to start over. A visitor four
 * countries in who reloads the page has not asked to have their journey erased, and erasing it is
 * the one behaviour that would make the accumulating journal feel fragile rather than earned.
 *
 * The reason it is SESSION and not LOCAL is the opposite case. A visitor returning next week should
 * meet an empty journal, because the emotional argument of the ending depends on having watched it
 * fill — a full journal on arrival is a spoiler, and worse, it is a claim about them that they have
 * no memory of earning. `sessionStorage` is scoped to the tab and dies with it, which is exactly the
 * lifetime of one visit.
 *
 * EVERY ACCESS IS WRAPPED IN try/catch, and that is not defensive padding. `sessionStorage` throws
 * on ACCESS — not on write — in Safari's private browsing and wherever a browser has storage
 * disabled by policy. An unguarded read at module scope would take down the entire site, on the
 * first render, for a whole class of visitor, with an exception nobody testing in a normal window
 * would ever see. The failure mode here is that the journal does not persist across a refresh, which
 * is a degraded experience rather than a broken one.
 * ============================================================================================
 */

const STORAGE_KEY = 'journey.visited'

/*
 * THE ORDER OF VISITS IS PRESERVED, and an array rather than a Set is what makes that possible.
 *
 * A Set would answer "has this been visited" just as well, and the ending needs more than that: the
 * journal fills in the order the visitor actually travelled, which for anyone who followed the route
 * is the itinerary order and for anyone who jumped around is not. Recording arrival order means the
 * stamps can be pressed in the sequence they were earned rather than re-sorted into the site's
 * preferred sequence — which would be the interface quietly correcting the visitor's own journey.
 *
 * Kept as a plain array and REPLACED rather than mutated on every change, for the same reason the
 * facet explorer replaces its Set: `useSyncExternalStore` compares snapshots by identity, so a
 * mutated array is an unchanged snapshot and nothing re-renders.
 */
let visited = read()

/* The subscriber list. A Set so unsubscribing is one call and double-subscribing is impossible. */
const listeners = new Set()

/*
 * Read the stored list, tolerating everything.
 *
 * WHY THE VALIDATION IS THIS PARANOID for a value we wrote ourselves: `sessionStorage` is shared
 * with anything else running on this origin and is trivially editable in devtools, so the stored
 * string is untrusted input. A malformed value must degrade to "nowhere visited yet" rather than
 * throw during the first render — and `JSON.parse` throws on invalid JSON, while a valid JSON value
 * that happens to be a number or an object would sail through and then fail on `.filter`.
 *
 * The `every` check on element types is what stops a stored `[1, null]` becoming a crash inside
 * a component that expects to compare strings.
 */
function read() {
  try {
    const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    if (!parsed.every((slug) => typeof slug === 'string')) return []
    return parsed
  } catch {
    return []
  }
}

/*
 * Persist, and never let a storage failure reach the caller.
 *
 * The in-memory list is the source of truth for this page load; storage is only how it survives a
 * refresh. So a write that fails (private browsing, quota, disabled storage) must leave the journey
 * working perfectly for the rest of the session, which is what swallowing this means.
 */
function write(next) {
  try {
    globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* Storage is unavailable. The journal still works; it just will not survive a reload. */
  }
}

/** Tell everyone watching that the record changed. */
function emit() {
  for (const listener of listeners) listener()
}

/**
 * Record an arrival.
 *
 * IDEMPOTENT BY DESIGN, and this is load-bearing rather than tidy. It is called from an effect on
 * every country render, so it runs again on a re-render, twice in React's development StrictMode,
 * and again whenever the visitor navigates back to a country they have already seen. Appending
 * unconditionally would produce ['japan', 'japan', 'india'] and the journal would claim six stops on
 * a five-country trip.
 *
 * Returning early WITHOUT emitting is the other half: emitting on a no-op would re-render every
 * subscriber on each navigation to an already-visited country, and — because the passport page
 * subscribes — would restart its entrance animation for no reason.
 */
export function recordVisit(slug) {
  if (!slug || visited.includes(slug)) return
  visited = [...visited, slug]
  write(visited)
  emit()
}

/**
 * The visited slugs, in the order they were visited.
 *
 * WHY THIS RETURNS THE SAME ARRAY INSTANCE UNTIL SOMETHING CHANGES, which is the one contract
 * `useSyncExternalStore` imposes and the easiest to break by accident. Returning `[...visited]` here
 * — which looks safer, and is what an instinct for immutability suggests — hands back a new identity
 * on every call, so React concludes the store changed on every render and loops until it bails out
 * with "The result of getSnapshot should be cached". The array is only ever replaced, never mutated,
 * so sharing the instance is already safe.
 */
export function visitedSlugs() {
  return visited
}

/** Whether a country has been visited this session. */
export function hasVisited(slug) {
  return visited.includes(slug)
}

/**
 * Subscribe to changes. Returns the unsubscribe function, which is the shape
 * `useSyncExternalStore` expects.
 */
export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/*
 * THE SERVER SNAPSHOT, which this project needs for one narrow reason.
 *
 * `useSyncExternalStore` takes an optional third argument used during server rendering and hydration.
 * This site is a static SPA and never renders on a server, so it would be tempting to omit it — but
 * omitting it means the hook throws if it is ever called in a non-browser environment, which is
 * exactly what a future test runner or a prerender step would be. An empty journey is the correct
 * answer there in any case: nobody has visited anything yet.
 */
export function serverSnapshot() {
  return EMPTY
}

/*
 * A single frozen empty array, so the server snapshot is identity-stable for the same reason
 * `visitedSlugs` is. A fresh `[]` on each call would be a new snapshot every time.
 */
const EMPTY = Object.freeze([])
