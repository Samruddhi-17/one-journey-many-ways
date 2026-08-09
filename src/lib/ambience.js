/*
 * ambience.js — the sound of a place, synthesised rather than recorded.
 *
 * ============================================================================================
 * WHY THERE ARE NO AUDIO FILES, WHICH IS THE CENTRAL DECISION IN THIS FILE.
 *
 * The obvious build is five field recordings: a Tokyo platform, a Delhi street, a Roman piazza,
 * an alpine meadow, an American highway. That was the plan, and it was abandoned after actually
 * going looking for the files. Two independent reasons, either of which is sufficient.
 *
 *   1. THE RECORDINGS WOULD NOT BE OF THESE PLACES. Openly-licensed audio is far thinner than
 *      openly-licensed photography. The best CC0 candidate for Japan was a New Zealand cicada;
 *      the best for the United States was a recording titled "Highway from bridge, centre".
 *      Labelling those as Japan and America is exactly the failure Principle 15 exists to
 *      prevent, and it is the same mistake the Switzerland reflection made when it said "four
 *      languages" over a page showing three: prose and captions are not proofread the way an
 *      axis is, so an unsourced claim survives. A recording asserts "this is what that place
 *      sounds like". We could not honestly make that assertion, so we do not make it.
 *
 *   2. THE FORMAT PROBLEM IS REAL AND NOT INCIDENTAL. Almost all of that material is Ogg
 *      Vorbis, which Safari cannot decode — so it would need transcoding to MP3 or AAC, and it
 *      would need trimming to a seamless loop. Neither is possible in this toolchain. Shipping
 *      audio that is silent on iOS, where most visitors are (§3.5), is worse than shipping none.
 *
 * SO WHAT THIS PLAYS INSTEAD, and why it is not a compromise. Filtered noise and two quiet sine
 * partials, parameterised per country. It sounds like a room rather than like a place, and that
 * is the honest register: it makes no claim to be a recording, in the same way the accent colour
 * makes no claim to be the colour of Japan. The precedent is already load-bearing here — `pace`,
 * `ease` and `staggerMs` are abstract expressions of how a country feels, validated against
 * nothing, and nobody mistakes Italy's 1.3 multiplier for a measurement. This is that, for the
 * ears.
 *
 * It is also, incidentally, the cheaper answer: zero bytes over the wire, on a project that
 * argued about a 30 kB font subset. Five thirty-second loops would have been the largest
 * non-photographic asset on the site.
 *
 * IF REAL RECORDINGS ARRIVE LATER, this module is the thing to replace, and the seam is already
 * in the right place: nothing outside this file knows how the sound is produced. `AmbienceToggle`
 * calls `enable`/`disable`/`setTexture` and would not change.
 * ============================================================================================
 *
 * WHY THIS IS A PLAIN MODULE AND NOT A REACT COMPONENT OR HOOK.
 *
 * An `AudioContext` is a long-lived, expensive, browser-level object — a browser permits only a
 * handful per document before refusing to create more. It must therefore survive every render,
 * every route change and every remount, which is precisely what React state does not promise.
 * Holding it in module scope gives it the one lifetime it can correctly have: the document's.
 *
 * This is the same argument the boarding pass makes for living in the layout rather than on the
 * page, one level lower down. The React-facing part of this feature is a button; the audio graph
 * is not a rendering concern and does not belong in the tree.
 *
 * NOTHING HERE RUNS UNTIL A VISITOR ASKS. `AudioContext` is created lazily inside `enable()`,
 * which is only ever reached from a click handler. That is not a nicety — browsers refuse to
 * start an audio context outside a user gesture, so a context built at import time would be
 * created in a `suspended` state and every later attempt to resume it would be a race. Building
 * it in the gesture means it is running by the time we ask it for anything.
 */

/*
 * THE FIVE TEXTURES.
 *
 * Deliberately NOT stored in `COUNTRIES[].atmosphere` alongside the colours and the pace, and the
 * reason is worth stating because the atmosphere table is exactly where a reader would look first.
 *
 * Those values are consumed by `useAtmosphere`, which writes every one of them onto the document
 * as a CSS custom property. A sound texture cannot be expressed as a CSS variable, so putting it
 * there would mean one member of that object behaving unlike all the others — and the file's own
 * header promises that atmosphere is "read by components as values", which a Web Audio parameter
 * is not. Keying by slug here, beside the code that plays it, keeps the atmosphere table honest
 * about what it is: things the stylesheet can use.
 *
 * The mapping to each country's brief is the same discipline the eases follow, and no country is
 * louder than another — `level` varies by less than a factor of two and only to compensate for
 * how loud a given filter band actually sounds, not to rank anything (§7.4).
 *
 *   noiseHz / noiseQ — the band the noise bed is filtered to. Low and narrow reads as a room;
 *                      high and wide reads as air moving.
 *   root             — the drone's fundamental, in Hz. A fifth above it is added automatically.
 *   swayHz / swayDepth — a very slow wander applied to the filter, so the bed breathes instead of
 *                      sitting perfectly still. Without it the sound is recognisably synthetic
 *                      within a few seconds; the ear detects a static spectrum quickly.
 */
const TEXTURES = {
  japan: {
    // Precision reads as a spectrum that does not move: the narrowest band, the slowest and
    // shallowest sway of the five. The same decision as Japan's uniform intervals and absence of
    // overshoot in the motion tokens.
    noiseHz: 420,
    noiseQ: 1.1,
    noiseLevel: 0.5,
    root: 110, // A2
    droneLevel: 0.85,
    swayHz: 0.03,
    swayDepth: 40,
    level: 0.1,
  },
  india: {
    // The brightest band and the fastest sway — busier, closer, more of it. Noise carries most of
    // the weight here and the drone sits underneath, which is the audible version of the shortest
    // stagger: many things at once rather than one thing clearly.
    noiseHz: 1150,
    noiseQ: 0.7,
    noiseLevel: 1,
    root: 146.83, // D3
    droneLevel: 0.5,
    swayHz: 0.14,
    swayDepth: 260,
    level: 0.075,
  },
  italy: {
    // Warm and unhurried: the lowest, roundest band, and a sway slow enough to be felt rather
    // than heard. Italy is the one atmosphere where making the visitor wait is the message.
    noiseHz: 520,
    noiseQ: 1,
    noiseLevel: 0.6,
    root: 98, // G2
    droneLevel: 0.9,
    swayHz: 0.045,
    swayDepth: 90,
    level: 0.095,
  },
  switzerland: {
    // Air rather than room. The band is high and wide and the drone is nearly absent, so what is
    // left is mostly space — the closest this vocabulary gets to "quiet on purpose".
    noiseHz: 2300,
    noiseQ: 0.5,
    noiseLevel: 0.85,
    root: 130.81, // C3
    droneLevel: 0.35,
    swayHz: 0.07,
    swayDepth: 400,
    level: 0.065,
  },
  'united-states': {
    // The widest band of the five and the lowest fundamental: distance, expressed as a spectrum
    // with no edges. Scale is a daily condition here, so the sound has no near boundary to it.
    noiseHz: 700,
    noiseQ: 0.45,
    noiseLevel: 0.8,
    root: 87.31, // F2
    droneLevel: 0.7,
    swayHz: 0.09,
    swayDepth: 200,
    level: 0.085,
  },
}

/** The texture for a slug, or undefined off a country route — which the engine plays as silence. */
export function textureFor(slug) {
  return TEXTURES[slug]
}

/*
 * THE MASTER CEILING, and why it is this low.
 *
 * 0.12 of full scale is roughly 18 dB down. The intent is something a visitor notices they have
 * stopped hearing rather than something they hear start — audible on headphones or a decent
 * laptop, and effectively absent on a phone speaker in a room with other people in it.
 *
 * Erring quiet is the correct direction of error for a sound nobody asked to be loud. A visitor
 * who wants more has an operating system volume control; a visitor startled by a website is
 * simply gone.
 */
const CEILING = 0.12

/*
 * FADE TIMES, in seconds.
 *
 * `FADE_IN` is deliberately much longer than `FADE_OUT`. Turning something ON should arrive
 * gradually enough that there is no perceptible start — a fade short enough to notice reads as a
 * click. Turning it OFF must feel immediate, because that press is the visitor withdrawing
 * consent and the interface has no business taking a second and a half to comply.
 *
 * `FADE_SWAP` is the dip through a country change: down, retune in silence, back up. See
 * `setTexture` for why it dips rather than glides.
 */
const FADE_IN = 1.6
const FADE_OUT = 0.35
const FADE_SWAP = 0.55

/*
 * The live graph, or null when nothing has been built yet. Everything below treats `null` as
 * "not running", so `disable()` before `enable()` is a no-op rather than a crash.
 */
let graph = null
/* The texture the graph should be playing. Held outside the graph so `setTexture` can be called
 * before the visitor has ever switched the sound on — a route change while it is off must still
 * be remembered, or enabling it later would play the wrong country. */
let wanted = null
/*
 * The texture the graph is CURRENTLY tuned to, which is not the same question as `wanted`.
 *
 * ============================================================================================
 * WHY THESE HAVE TO BE TWO SEPARATE VARIABLES — THIS WAS A REAL BUG, CAUGHT IN A BROWSER.
 *
 * There was only `wanted`, and `setTexture` used it for both jobs: recording the request and
 * deciding whether a retune was needed (`const changed = texture !== wanted`). That is correct
 * whenever the sound is playing, and wrong in exactly one sequence:
 *
 *   1. Sound on, standing on the United States. Graph tuned to 87.31 Hz.
 *   2. Visitor switches it off. `setTexture` is not involved; the graph stays at 87.31 Hz.
 *   3. Visitor navigates to Italy. `setTexture` runs, sets `wanted` to Italy, and takes the
 *      "not enabled" branch — which correctly does not retune, because retuning a silent graph
 *      is pointless work.
 *   4. Visitor switches it back on. `enable()` sees a graph already exists, so it skips the
 *      build-and-tune block entirely and just ramps the gain up.
 *
 * Result: Italy's page playing America's drone, and it would have stayed that way until the next
 * navigation. Measured by reading `oscillator.frequency.value` straight off the graph — root
 * 87.31 while the route said `/italy`.
 *
 * WHY IT SURVIVED THE FIRST TWO ROUNDS OF TESTING. Every earlier check enabled the sound first and
 * navigated afterwards, which is the path that works. The failing order — navigate while off, then
 * switch on — is the more likely one for a real visitor, who reads a page or two before deciding
 * they want sound. And it is inaudible as a bug: the visitor hears *a* drone, at a plausible pitch,
 * with no reason to suspect it belongs to the country they left.
 *
 * THE GENERAL LESSON. `wanted` was being used as both an intention and a record of what had been
 * done about it. Those diverge precisely when an intention is deferred — which is the whole reason
 * the "not enabled" branch exists. One variable cannot answer both questions, and collapsing them
 * reads as harmless because in the common case the answers agree.
 * ============================================================================================
 */
let tuned = null
let isEnabled = false

/*
 * ============================================================================================
 * THE SUBSCRIPTION SURFACE — how a React button reads a value that does not live in React.
 *
 * WHY THE ON/OFF STATE IS HERE AND NOT IN THE COMPONENT. There are two toggle buttons: one in the
 * header for desktop, one inside the mobile navigation sheet, because the header has no room for a
 * third control at 390px (see AmbienceToggle for that argument). Two components each holding their
 * own `useState` would be two answers to one question, and they would drift the moment one of them
 * unmounts — the sheet unmounts every time it closes. The sound would be playing and the button
 * would say it was off.
 *
 * Keeping the flag beside the audio graph makes that impossible to express: `isEnabled` is the same
 * variable the gain ramp reads, so a button showing "on" and a silent graph cannot happen.
 *
 * NEW REACT CONCEPT: `useSyncExternalStore`. The hook that exists for precisely this shape — a
 * value owned by something outside React that components need to render and re-render on. It takes
 * a function to subscribe to changes and a function to read the current value, and React handles
 * the rest. The older pattern (a `useEffect` that copies the external value into `useState`) is
 * subtly wrong in ways this avoids: it renders one frame with a stale value, and it can tear —
 * different components in the same render showing different answers.
 *
 * `notify` is called from `enable` and `disable`. It is NOT called from `setTexture`: which country
 * is playing is not something either button displays, so waking every subscriber on navigation
 * would be a render nobody uses.
 * ============================================================================================
 */
const listeners = new Set()

/** Subscribe to on/off changes. Returns the unsubscribe function `useSyncExternalStore` expects. */
export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Whether ambience is currently switched on.
 *
 * Must return a primitive. `useSyncExternalStore` re-renders when the snapshot changes identity, so
 * a getter returning a fresh object each call would loop forever — a boolean cannot.
 */
export function isOn() {
  return isEnabled
}

function notify() {
  for (const listener of listeners) listener()
}

/*
 * A four-second buffer of pink-ish noise, generated once and looped.
 *
 * WHY PINK AND NOT WHITE. White noise has equal energy per hertz, so half of it is in the top
 * octave and it reads as hiss — the sound of a broken thing. Pink noise has equal energy per
 * octave, which is roughly how the ear divides the spectrum, and reads as rain, wind or a room.
 * Every natural ambience is closer to pink.
 *
 * The filter is Paul Kellet's well-known economical approximation: seven one-pole lowpasses
 * summed with fixed coefficients, accurate to about ±0.05 dB across the audible band. It is the
 * standard implementation for exactly this purpose and is cheap enough to run over a few hundred
 * thousand samples at start-up without a perceptible pause.
 *
 * WHY FOUR SECONDS AND WHY A LOOP IS SAFE HERE. A looping buffer normally needs its ends matched
 * or the seam clicks. Noise has no waveform to match — the discontinuity at the loop point is
 * itself indistinguishable from noise. Four seconds is long enough that the (real, subtle)
 * periodicity of the filtered result is not something the ear latches onto, and short enough that
 * generating it is instant.
 */
function makeNoiseBuffer(context) {
  const length = context.sampleRate * 4
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const samples = buffer.getChannelData(0)

  let b0 = 0
  let b1 = 0
  let b2 = 0
  let b3 = 0
  let b4 = 0
  let b5 = 0
  let b6 = 0

  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.969 * b2 + white * 0.153852
    b3 = 0.8665 * b3 + white * 0.3104856
    b4 = 0.55 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.016898
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
    b6 = white * 0.115926
    // The sum runs hot; 0.11 brings the peak inside unity with headroom to spare. Clamped rather
    // than normalised because a single stray sample must not be allowed to scale the whole buffer.
    samples[i] = Math.max(-1, Math.min(1, pink * 0.11))
  }

  return buffer
}

/*
 * Build the whole graph. Called once, inside the enabling click.
 *
 *   noise ─ bandpass ─ noiseGain ─┐
 *                                 ├─ master ─ destination
 *   root  ─┐                      │
 *   fifth ─┴ lowpass ─ droneGain ─┘
 *
 *   sway ─ swayGain ─▶ bandpass.frequency        (an audio-rate connection to a parameter)
 *
 * THE LAST LINE IS THE ONE UNFAMILIAR IDEA. In Web Audio an `AudioParam` is itself a destination:
 * connecting an oscillator to `bandpass.frequency` adds that oscillator's output to the parameter
 * every sample. That is how a 0.03 Hz sine — far below hearing, and inaudible on its own — becomes
 * a slow wander in the noise band rather than a tone. It runs on the audio thread, so it does not
 * stutter when the main thread is busy laying out a page, which a `setInterval` doing the same job
 * absolutely would.
 */
function build(context) {
  const master = context.createGain()
  master.gain.value = 0
  master.connect(context.destination)

  const noise = context.createBufferSource()
  noise.buffer = makeNoiseBuffer(context)
  noise.loop = true

  const bandpass = context.createBiquadFilter()
  bandpass.type = 'bandpass'

  const noiseGain = context.createGain()
  noiseGain.gain.value = 0

  noise.connect(bandpass).connect(noiseGain).connect(master)

  /*
   * TWO PARTIALS, A FIFTH APART, AND NOTHING ELSE.
   *
   * A single sine is recognisably a test tone. A root and a fifth is the most open interval there
   * is — no third, so it is neither major nor minor, which matters because a chord with a mood
   * would be the site telling the visitor how to feel about a country. That is the same line §7.4
   * draws around superlatives, in a medium where it is much easier to cross by accident.
   *
   * Both are sines. A richer waveform would put harmonics into the same region the noise band
   * occupies and the two would fight; sines leave that region to the noise.
   */
  const root = context.createOscillator()
  root.type = 'sine'
  const fifth = context.createOscillator()
  fifth.type = 'sine'

  /*
   * A gentle lowpass over the drone. The oscillators are already sines and have nothing above
   * their fundamental to remove — this is here for the resonance-free rolloff it gives when the
   * fifth climbs on a country change, so the higher-pitched textures do not read as brighter and
   * therefore louder.
   */
  const droneFilter = context.createBiquadFilter()
  droneFilter.type = 'lowpass'
  droneFilter.frequency.value = 900

  const droneGain = context.createGain()
  droneGain.gain.value = 0

  root.connect(droneFilter)
  fifth.connect(droneFilter)
  droneFilter.connect(droneGain).connect(master)

  const sway = context.createOscillator()
  sway.type = 'sine'
  const swayGain = context.createGain()
  swayGain.gain.value = 0
  sway.connect(swayGain).connect(bandpass.frequency)

  /*
   * Sources are started once and never stopped. A stopped `AudioBufferSourceNode` or
   * `OscillatorNode` cannot be restarted — the spec makes them single-use — so stopping them on
   * disable would mean rebuilding the entire graph on every toggle. They run permanently into a
   * gain of zero instead, which costs a few oscillator samples per frame and makes disable/enable
   * a gain ramp rather than a reconstruction.
   */
  noise.start()
  root.start()
  fifth.start()
  sway.start()

  return { context, master, bandpass, noiseGain, root, fifth, droneGain, sway, swayGain }
}

/*
 * Apply a texture's parameters.
 *
 * `at` is a time on the audio clock, so the caller can schedule the retune to land in the middle
 * of a fade-out rather than immediately. Every value is set with `setValueAtTime`, which is a
 * step: the retune happens during silence, so there is nothing to smooth.
 */
function tune(g, texture, at) {
  // Recorded here rather than at each call site so `tuned` cannot fall out of step with the graph:
  // there is one function that changes the oscillators and it is the one that updates the record.
  tuned = texture
  g.bandpass.frequency.setValueAtTime(texture.noiseHz, at)
  g.bandpass.Q.setValueAtTime(texture.noiseQ, at)
  g.noiseGain.gain.setValueAtTime(texture.noiseLevel, at)
  g.root.frequency.setValueAtTime(texture.root, at)
  g.fifth.frequency.setValueAtTime(texture.root * 1.5, at)
  g.droneGain.gain.setValueAtTime(texture.droneLevel, at)
  g.sway.frequency.setValueAtTime(texture.swayHz, at)
  g.swayGain.gain.setValueAtTime(texture.swayDepth, at)
}

/*
 * Ramp the master gain to a target.
 *
 * WHY `cancelScheduledValues` + `setValueAtTime` FIRST, WHICH IS THE SUBTLE PART. A ramp scheduled
 * while an earlier ramp is still running does not replace it — the two are queued, so a visitor
 * toggling quickly, or navigating mid-fade, would hear the gain finish the old journey before
 * starting the new one. Cancelling the queue and pinning the parameter to its *current* value is
 * the documented way to say "start from wherever you actually are now". Without the pin,
 * cancelling reverts the parameter to the last value explicitly set, which is a jump.
 *
 * `linearRampToValueAtTime` and not the exponential variant: exponential ramps cannot reach or
 * pass through zero (the spec forbids a zero target), and every fade here either starts or ends at
 * silence. A linear ramp on a gain this small is indistinguishable anyway.
 */
function rampTo(g, target, seconds) {
  const now = g.context.currentTime
  g.master.gain.cancelScheduledValues(now)
  g.master.gain.setValueAtTime(g.master.gain.value, now)
  g.master.gain.linearRampToValueAtTime(target, now + seconds)
}

/** The level the graph should currently be at, given what is enabled and where we are. */
function targetLevel() {
  if (!isEnabled || !wanted) return 0
  return CEILING * wanted.level
}

/**
 * Start playing. MUST be called from inside a user gesture — see the header note.
 *
 * Returns nothing and throws nothing: a browser with no Web Audio support, or one that refuses to
 * create a context, leaves the site working exactly as it did before. This is decoration, and
 * decoration that can break a page is not worth having.
 */
export function enable() {
  isEnabled = true
  notify()

  if (!graph) {
    const Ctor = window.AudioContext ?? window.webkitAudioContext
    if (!Ctor) return
    try {
      graph = build(new Ctor())
    } catch {
      graph = null
      return
    }
    /*
     * NOTE there is no tune() call here, though there was one before the `tuned` bug was fixed. A
     * freshly built graph has `tuned === null`, so the catch-up below handles the first-ever enable
     * by the same route as every later one. Tuning in both places would have been two code paths for
     * one job, which is how the original divergence happened.
     */
  }

  /*
   * A context can be `suspended` even when created in a gesture — Safari does this when the page
   * was backgrounded, and `visibilitychange` below suspends it deliberately. `resume()` returns a
   * promise we do not need to await: the ramp below is scheduled on the audio clock, which does
   * not advance while suspended, so it simply begins when the context does.
   */
  if (graph.context.state !== 'running') graph.context.resume().catch(() => {})

  /*
   * CATCH UP ON ANY NAVIGATION THAT HAPPENED WHILE SILENT. See the note on `tuned` above for the
   * bug this fixes: `setTexture` deliberately declines to retune a silent graph, so by the time the
   * visitor switches the sound on it can be tuned to a country they left several pages ago.
   *
   * Retuning BEFORE the ramp starts, and as a step at the current time rather than a scheduled one:
   * the master gain is still at zero on this line, so there is nothing audible to step through. The
   * visitor hears the correct country fade in from silence, which is what pressing the button on
   * Italy's page should do.
   */
  if (wanted && wanted !== tuned) tune(graph, wanted, graph.context.currentTime)

  rampTo(graph, targetLevel(), FADE_IN)
}

/**
 * Stop playing, keeping the graph so re-enabling is instant.
 *
 * The context is NOT closed. `close()` is irreversible — a closed context cannot be reopened and a
 * replacement would need another user gesture to start, so the second press of the toggle would do
 * nothing. Fading to zero and leaving it running is the only shape in which this button works
 * twice.
 */
export function disable() {
  isEnabled = false
  notify()
  if (!graph) return
  rampTo(graph, 0, FADE_OUT)
}

/**
 * Change which country is playing. Safe to call when disabled and before anything is built.
 *
 * Pass `undefined` off a country route: the shell is silent and the country speaks, so the home
 * page and the passport fade to nothing even with the toggle on. That is the audible half of a rule
 * the rest of the site already follows: off a country route the accent falls back to the neutral shell
 * blue, and nothing on the page is tinted by a place the visitor is not in.
 *
 * (This used to cite the fixed boarding pass, which hid on those same two routes. It has been retired
 * — see the note in SiteLayout — so the rule is stated from the atmosphere instead, which is where it
 * was always enforced.)
 *
 * WHY IT DIPS THROUGH SILENCE RATHER THAN GLIDING. Ramping the oscillators from one country's
 * fundamental to the next is a portamento, and a portamento is a musical gesture: it would sound
 * like a performance, and it would make the two countries a single continuous thing. Arrival is
 * supposed to be a change of place. Down, retune while inaudible, back up — which is also what the
 * page transition does visually, and the two now agree.
 */
export function setTexture(texture) {
  wanted = texture ?? null

  if (!graph) return

  if (!isEnabled || !wanted) {
    rampTo(graph, targetLevel(), FADE_OUT)
    return
  }

  /*
   * Compared against `tuned` — what the graph is playing — and NOT against the previous value of
   * `wanted`, which is what the bug documented above did. The question this branch asks is "does the
   * graph need retuning?", and only the graph's own state can answer it.
   *
   * This is also what makes the double call harmless: both toggle instances run this effect on every
   * navigation, and the second one finds the graph already tuned and returns without dipping the
   * gain a second time.
   */
  if (wanted === tuned) return

  const now = graph.context.currentTime
  graph.master.gain.cancelScheduledValues(now)
  graph.master.gain.setValueAtTime(graph.master.gain.value, now)
  graph.master.gain.linearRampToValueAtTime(0, now + FADE_SWAP)
  // Retune a hair after the bottom of the dip, so the step lands in silence rather than on the
  // last audible sample of the fade.
  tune(graph, wanted, now + FADE_SWAP + 0.01)
  graph.master.gain.linearRampToValueAtTime(targetLevel(), now + FADE_SWAP + FADE_IN)
}

/*
 * SILENCE A BACKGROUNDED TAB, and resume when the visitor comes back.
 *
 * WHY THIS IS NOT OPTIONAL. Without it, a visitor who switches to another tab or locks their phone
 * still has this site making noise from somewhere they cannot see — with the control that stops it
 * on a page they are no longer looking at. That is the single most irritating thing a website can
 * do with audio, and it is why browsers built the visibility API.
 *
 * `suspend()` rather than a fade to zero, because a hidden tab should not be running an audio
 * graph at all: suspending releases the audio hardware and stops the oscillators consuming any
 * time. `isEnabled` is untouched, so this is not the visitor's choice being overridden — coming
 * back restores exactly what they left, which is why the guard checks it before resuming.
 *
 * Registered at module scope, once, with no removal: the listener's lifetime is meant to be the
 * document's, and this module is only imported by a component that never unmounts. There is no
 * teardown path in which removing it would be correct.
 */
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!graph) return
    if (document.hidden) {
      graph.context.suspend().catch(() => {})
    } else if (isEnabled) {
      graph.context.resume().catch(() => {})
    }
  })
}
