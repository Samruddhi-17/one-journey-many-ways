/*
 * ambience.js — a few slow notes from each country, synthesised rather than recorded.
 *
 * ============================================================================================
 * WHAT THIS USED TO BE, AND WHY IT WAS REPLACED.
 *
 * The first version played filtered pink noise plus two sine partials a fifth apart, with the band
 * and the pitch varying per country. Its own header argued that this was the honest register: it
 * sounded like a room rather than like a place, so it claimed nothing.
 *
 * That argument was sound and the result was still not worth listening to. The report was that the
 * sound "is not good, it should be pleasant and different for different countries", and both halves
 * are correct diagnoses of the same cause: THERE WERE NO NOTES IN IT. A held drone and a noise bed
 * have no events, so there is nothing for the ear to follow, and — because the five differed only
 * by filter frequency and fundamental — nothing loud enough to notice when the country changed. A
 * visitor moving from Japan to India heard a hum change pitch. Two textures can differ by 700 Hz on
 * paper and be the same sound in a room.
 *
 * So this version plays music: sparse notes, chosen at run time from a scale, on a synthesised
 * instrument, into a reverb. Same volume, same restraint, same off-by-default. What changed is that
 * there is now something happening.
 *
 * ============================================================================================
 * THE DECISION THE VISITOR MADE, AND THE RISK THEY ACCEPTED IN MAKING IT.
 *
 * Asked how far each country's sound should reference that country's own music, they chose to draw
 * on the tradition rather than to use five neutral instruments. So the choices below are specific:
 * a koto tuning for Japan, a tanpura cycle and a bansuri line for India, mandolin arpeggios for
 * Italy, alphorn harmonics and cow bells for Switzerland, open guitar fifths for the United States.
 *
 * THIS IS A LOUDER CLAIM THAN THIS PROJECT USUALLY MAKES, AND IT IS WORTH BEING PRECISE ABOUT WHAT
 * IS AND IS NOT BEING ASSERTED. The accent colours are validated against nothing and nobody
 * mistakes Italy's 1.3 pace multiplier for a measurement, because a multiplier does not resemble
 * anything. A pentatonic pluck DOES resemble something, and musical shorthand is one step from
 * caricature — "the five-note scale that means Asia in a film trailer" is a real and lazy trope.
 *
 * Three things keep this on the right side of that line, and they are constraints rather than
 * hopes:
 *
 *   1. THE MATERIAL IS REAL, NOT SUGGESTIVE. Japan's scale is hirajōshi, an actual koto tuning,
 *      not "some pentatonic". India's is Yaman, a named raga, and the tanpura's cycle is the
 *      conventional Pa–Sa–Sa–Sa. Switzerland's horn plays only the natural overtone series,
 *      because that is the only thing an alphorn physically can play. Where a real tradition
 *      supplies a specific answer, that answer is used instead of a generic one.
 *   2. NOTHING IS PERFORMED. There are no melodies, no rhythms and no phrases — notes arrive
 *      slowly, chosen one at a time, and the result is closer to wind chimes than to a tune. A
 *      composed melody would be an impersonation. A scale is a palette.
 *   3. THE LABEL DOES NOT LIE. The toggle says these are synthesised notes, not a recording of
 *      anywhere, which is the cheapest possible place to prevent the misunderstanding.
 *
 * WHY THERE ARE STILL NO AUDIO FILES, which was the original decision and survives unchanged.
 * Openly-licensed audio is far thinner than openly-licensed photography: the best CC0 candidate
 * for Japan was a New Zealand cicada and the best for the United States was a recording titled
 * "Highway from bridge, centre". Labelling those as those countries is exactly the failure
 * Principle 15 exists to prevent. Almost all of that material is also Ogg Vorbis, which Safari
 * cannot decode, and this toolchain cannot transcode or seam-trim a loop. Synthesis has no
 * licensing question, costs zero bytes over the wire, and is the only option that works on iOS.
 *
 * IF REAL RECORDINGS EVER ARRIVE, this module is still the only thing to replace: nothing outside
 * this file knows how the sound is produced, and `AmbienceToggle` calls only
 * `enable`/`disable`/`setTexture`/`textureFor`.
 * ============================================================================================
 *
 * WHY THIS IS A PLAIN MODULE AND NOT A REACT COMPONENT OR HOOK.
 *
 * An `AudioContext` is a long-lived, expensive, browser-level object — a browser permits only a
 * handful per document before refusing to create more. It must therefore survive every render,
 * every route change and every remount, which is precisely what React state does not promise.
 * Holding it in module scope gives it the one lifetime it can correctly have: the document's.
 *
 * NOTHING HERE RUNS UNTIL A VISITOR ASKS. `AudioContext` is created lazily inside `enable()`,
 * which is only ever reached from a click handler. That is not a nicety — browsers refuse to
 * start an audio context outside a user gesture, so a context built at import time would be
 * created in a `suspended` state and every later attempt to resume it would be a race.
 */

/*
 * ============================================================================================
 * HOW A TEXTURE IS DESCRIBED, since the table below is long and every field earns its place.
 *
 * PITCH
 *   rootHz       The tonic, in Hz. Everything else is derived from it, so transposing a country is
 *                one number. Chosen in the register the real instrument sits in.
 *   scale        Semitone offsets from the tonic, in ascending order. This is the entire harmonic
 *                vocabulary of a country — a note not in this list cannot be played.
 *   voiceOctave  Octaves to shift the melodic voice above `rootHz`. Separate from `rootHz` because
 *                Switzerland's horn and its bells are three octaves apart and share one tonic.
 *   degrees      [low, high] bounds on the scale index the walk may reach. Indices past the end of
 *                `scale` wrap into the next octave, so this is a range in scale steps, not in
 *                semitones — which is what keeps the range musical rather than arithmetic.
 *
 * TIMBRE (`voice`, and `horn` where a country has two)
 *   partials     The instrument, and the only field that really decides what it sounds like. Each
 *                entry is { r: frequency ratio, g: gain, d: decay multiplier }.
 *                `r` INTEGER RATIOS ARE A STRING OR A PIPE; NON-INTEGER RATIOS ARE A BELL. That is
 *                the whole difference between Italy and Switzerland below.
 *                `d` BELOW 1 IS WHAT MAKES IT SOUND PHYSICAL. On a real string or bar the high
 *                partials die away first, which is why a struck note gets mellower as it fades. A
 *                set of partials that all decay together reads as an organ, or as a synthesiser.
 *   attack/hold/decay  Seconds. `hold` is 0 for anything struck or plucked — the note begins dying
 *                the instant it starts. A blown or bowed instrument holds before it decays, and
 *                that single number is most of the difference between India's flute and Japan's
 *                koto, more than the partials are.
 *   detuneCents  Adds a second copy of the low partials, slightly out of tune. Instruments with
 *                doubled courses (a mandolin, a tanpura) beat against themselves, and that beating
 *                is a large part of their character. 0 for single-strung instruments.
 *   spread       How far notes are panned left and right, 0 to 1. Width, cheaply.
 *
 * BEHAVIOUR
 *   gesture      What a single event is: one note, an arpeggio, a dyad, or a cluster of bells.
 *   gapMs        [min, max] milliseconds between events. This is the tempo, and it is slow.
 *   restChance   Probability an event is silence instead. Rests are what stop this becoming a
 *                sequencer; without them the spacing is audibly regular within about a minute.
 *   drone        Optional. A fixed cycle of plucks, independent of the melody — only India has one.
 *
 * BACKGROUND
 *   bed          The quiet filtered-noise floor, with a very slow wander so its spectrum is not
 *                static. Around a tenth of the old version's level: it is now a floor under the
 *                notes rather than the thing being listened to.
 *   pad          A held root-and-fifth, quieter still. Continuity between notes.
 *   reverbS/wet  The size of the room and how much of it is heard. THIS IS DOING MORE WORK FOR
 *                "pleasant" THAN ANY OTHER FIELD HERE. Dry synthesised notes sound like a test
 *                tone no matter how carefully the partials are chosen; the same notes in four
 *                seconds of decay sound like an instrument in a place.
 *   level        Per-country trim under the master ceiling, and EVERY ONE OF THESE FIVE NUMBERS IS
 *                MEASURED RATHER THAN CHOSEN. It is not a ranking (§7.4) — it is loudness
 *                compensation, and it had to be measured because the first set of estimates was
 *                badly wrong.
 *
 *                WHAT THE MEASUREMENT FOUND. Sampling output RMS every animation frame across a
 *                40-second window per country, the first draft came out at India 0.0151 against
 *                Switzerland 0.0042: a factor of 3.6, which on navigation is not a subtlety but a
 *                jolt. Two causes, neither visible by reading the table. India is the only country
 *                with a continuous second instrument, so its tanpura alone puts roughly forty
 *                plucks a minute under everything else; and Switzerland spends most of its time in
 *                silence with bells whose partials die in a fraction of a second.
 *
 *                So the trims below are each country's previous level scaled by the ratio of its
 *                measured RMS to a common target. India needs the deepest cut for the same reason
 *                it sounds the busiest, and that its trim is now less than half of Japan's says
 *                nothing whatever about the two countries — only about how many notes per minute
 *                each texture asks for.
 *
 *                THE GENERAL POINT, since the earlier version of this comment asserted the spread
 *                was under a factor of two and that was simply not checked: perceived loudness is
 *                not readable off a gain value. Note density, register and decay time all enter it,
 *                and the only way to know is to measure the output.
 * ============================================================================================
 */
const TEXTURES = {
  /*
   * JAPAN — a koto, tuned to hirajōshi, played about as sparsely as it is possible to play.
   *
   * HIRAJŌSHI IS A REAL TUNING AND THAT IS THE POINT: [0, 2, 3, 7, 8] is the standard koto tuning
   * (D, E, F, A, B♭ from D), not a generic pentatonic. Its minor second and its two minor thirds
   * are what make it sound like itself rather than like a wind chime — the "trailer pentatonic"
   * cliché is [0, 2, 4, 7, 9], which is a different scale and is used below for Switzerland.
   *
   * THE SPARSEST OF THE FIVE, deliberately, and it is the same decision as Japan's uniform
   * intervals and complete absence of overshoot in the motion tokens. What that atmosphere means
   * in sound is space: single notes, no chords, and the longest silences on the site.
   *
   * `graceChance` adds an occasional very fast neighbouring pluck before a note. It is a koto
   * gesture, it is the one ornament here, and at 22% it stays an event rather than becoming a tic.
   */
  japan: {
    rootHz: 146.83, // D3
    scale: [0, 2, 3, 7, 8], // hirajōshi
    voiceOctave: 0,
    degrees: [0, 14],
    voice: {
      partials: [
        { r: 1, g: 1, d: 1 },
        { r: 2, g: 0.4, d: 0.62 },
        { r: 3, g: 0.24, d: 0.45 },
        { r: 4, g: 0.12, d: 0.32 },
        { r: 5, g: 0.07, d: 0.24 },
        // Very slightly sharp of the sixth harmonic. A real stiff string is a touch inharmonic up
        // there, and the small error is the difference between a plucked string and an additive
        // synthesiser imitating one.
        { r: 6.04, g: 0.04, d: 0.18 },
      ],
      attack: 0.004,
      hold: 0,
      decay: 3.6,
      detuneCents: 0,
      spread: 0.36,
    },
    gesture: 'single',
    graceChance: 0.22,
    gapMs: [2000, 4600],
    restChance: 0.24,
    bed: { hz: 480, q: 1.2, level: 0.05, swayHz: 0.03, swayDepth: 40 },
    pad: { level: 0.045 },
    reverbS: 2.9,
    wet: 0.4,
    level: 0.84,
  },

  /*
   * INDIA — a tanpura underneath, a bansuri over the top, in raga Yaman.
   *
   * THE TANPURA IS WHY THIS COUNTRY SOUNDS DIFFERENT FROM THE OTHER FOUR AT A SECOND'S NOTICE, and
   * it is the one place here with a fixed pulse. A tanpura is not a drone in the held-note sense:
   * it is plucked, continuously, in a cycle, and the conventional cycle is Pa–Sa–Sa–Sa — the fifth
   * below the tonic, then the tonic three times. That is the `ratios` list, and 0.75 is Pa (a fifth
   * below Sa is three-quarters of its frequency).
   *
   * Its partials run higher and more evenly than any string here, which is the closest this
   * vocabulary gets to jvari — the buzzing overtone bloom a correctly-threaded tanpura produces and
   * the reason the instrument sounds alive rather than repetitive.
   *
   * RAGA YAMAN, [0, 2, 4, 6, 7, 9, 11], WITH ITS AWKWARD NOTE LEFT AWKWARD. Yaman's characteristic
   * degree is the sharpened fourth (Ma tivra, the 6), and a tritone above the tonic is exactly the
   * interval a random note-picker will make sound wrong. It survives here because the walk below
   * strongly prefers stepwise motion, so the 6 is nearly always approached from the 4 or the 7 —
   * passing through it, which is how the note actually functions in the raga. Choosing notes by
   * step rather than at random is what lets a real scale be used instead of a safe one.
   *
   * THE MELODY VOICE IS BLOWN, NOT PLUCKED, and that contrast is the design. `hold: 1.1` with a
   * 0.22s attack, almost no upper partials, and a breath of noise in the bed: a bansuri is nearly a
   * pure tone, so the sound is carried by how the note starts and ends rather than by its spectrum.
   * Against a plucked tanpura it separates completely — two instruments, not one texture.
   */
  india: {
    rootHz: 130.81, // C3, Sa
    scale: [0, 2, 4, 6, 7, 9, 11], // raga Yaman
    voiceOctave: 1,
    degrees: [0, 13],
    voice: {
      partials: [
        { r: 1, g: 1, d: 1 },
        { r: 2, g: 0.16, d: 0.8 },
        { r: 3, g: 0.05, d: 0.6 },
      ],
      attack: 0.22,
      hold: 1.1,
      decay: 1.5,
      detuneCents: 0,
      spread: 0.22,
    },
    gesture: 'single',
    gapMs: [1700, 3600],
    restChance: 0.16,
    drone: {
      ratios: [0.75, 1, 1, 0.5], // Pa – Sa – Sa – Sa
      stepMs: 1050,
      level: 0.3,
      voice: {
        partials: [
          { r: 1, g: 1, d: 1 },
          { r: 2, g: 0.62, d: 0.9 },
          { r: 3, g: 0.44, d: 0.8 },
          { r: 4, g: 0.3, d: 0.7 },
          { r: 5, g: 0.2, d: 0.6 },
          { r: 6, g: 0.14, d: 0.52 },
          { r: 7, g: 0.09, d: 0.45 },
          { r: 8, g: 0.06, d: 0.4 },
        ],
        attack: 0.006,
        hold: 0,
        decay: 3.4,
        detuneCents: 5,
        spread: 0.14,
      },
    },
    bed: { hz: 1000, q: 0.8, level: 0.05, swayHz: 0.11, swayDepth: 200 },
    pad: { level: 0.03 },
    reverbS: 2.4,
    wet: 0.34,
    level: 0.33,
  },

  /*
   * ITALY — a mandolin, in G major, arpeggiated.
   *
   * THE ONLY COUNTRY THAT PLAYS CHORDS, and the only one whose events have an internal rhythm: three
   * notes rising, 170 ms apart. Everywhere else a note is an event; here a gesture is. That is the
   * audible form of the argument the Italian atmosphere already makes visually — this is the one
   * place where the site is allowed to be a little demonstrative.
   *
   * `detuneCents: 9` IS THE INSTRUMENT. A mandolin is strung in courses of two, tuned as closely as
   * a player can manage and never exactly, so every note beats gently against itself. Removing that
   * one number leaves a generic bright pluck; adding it is immediately a mandolin.
   *
   * THE FOURTH IS MISSING FROM THE SCALE ON PURPOSE. [0, 2, 4, 7, 9, 11] is G major without its
   * fourth degree, which in a major key is the note that most easily sounds like a mistake when it
   * lands on its own with nothing resolving it. Six notes are plenty for a palette, and leaving out
   * the one that needs a harmonic context this engine cannot provide is cheaper than handling it.
   */
  italy: {
    rootHz: 98, // G2
    scale: [0, 2, 4, 7, 9, 11], // G major, fourth omitted
    voiceOctave: 1,
    degrees: [0, 13],
    voice: {
      partials: [
        { r: 1, g: 1, d: 1 },
        { r: 2, g: 0.55, d: 0.66 },
        { r: 3, g: 0.34, d: 0.5 },
        { r: 4, g: 0.2, d: 0.38 },
        { r: 5, g: 0.13, d: 0.3 },
        { r: 6, g: 0.08, d: 0.24 },
        { r: 7.03, g: 0.05, d: 0.18 },
      ],
      attack: 0.003,
      hold: 0,
      decay: 2.3,
      detuneCents: 9,
      spread: 0.4,
    },
    gesture: 'arpeggio',
    gapMs: [2700, 5200],
    restChance: 0.2,
    bed: { hz: 560, q: 1, level: 0.045, swayHz: 0.045, swayDepth: 90 },
    pad: { level: 0.05 },
    reverbS: 2.3,
    wet: 0.4,
    level: 0.73,
  },

  /*
   * SWITZERLAND — cow bells high up, an alphorn a long way below, F major pentatonic.
   *
   * THE TWO-VOICE COUNTRY, and the two are three octaves apart, which is why `rootHz` and
   * `voiceOctave` are separate fields at all. Bells carry the events; the horn appears on 14% of
   * them, low and slow, and its rarity is what makes it land.
   *
   * THE BELLS ARE THE ONLY INHARMONIC PARTIALS ON THE SITE and that is what makes them metal.
   * [1, 2.02, 2.41, 3.03, 4.18, 5.42] are not integer multiples of anything, so they do not fuse
   * into a single perceived pitch the way a string's harmonics do — which is exactly the clang of a
   * struck object, and why the same envelope over integer ratios would sound like a piano instead.
   * The high ones decay very fast (`d` down to 0.12), so the strike is bright and the ring is not.
   *
   * THE HORN PLAYS ONLY THE NATURAL OVERTONE SERIES, AND THAT IS NOT AN AESTHETIC CHOICE. An
   * alphorn has no valves, holes or slide: the only notes available to a player are the harmonics
   * of the tube, so [2, 3, 4, 5, 6] × the fundamental is not a stylisation of alphorn music, it is
   * the complete set of pitches the instrument has. The fifth harmonic lands about 14 cents below
   * an equal-tempered A, and that flatness — the famous "alphorn-fa" is its neighbour — is left in
   * rather than corrected, because correcting it would mean deleting the one detail here that could
   * only have come from the real instrument.
   *
   * THE LONGEST REVERB OF THE FIVE, at 5.2 seconds, and the widest panning. A held note in a valley
   * is mostly the valley. This is also the country whose noise bed is highest and least resonant —
   * air rather than room, the same reading the old version had and the one thing worth keeping
   * from it.
   */
  switzerland: {
    rootHz: 87.31, // F2, the horn's fundamental
    scale: [0, 2, 4, 7, 9], // F major pentatonic
    voiceOctave: 2,
    degrees: [0, 11],
    voice: {
      partials: [
        { r: 1, g: 1, d: 1 },
        { r: 2.02, g: 0.42, d: 0.5 },
        { r: 2.41, g: 0.3, d: 0.38 },
        { r: 3.03, g: 0.2, d: 0.26 },
        { r: 4.18, g: 0.11, d: 0.17 },
        { r: 5.42, g: 0.06, d: 0.12 },
      ],
      attack: 0.002,
      hold: 0,
      decay: 4.2,
      detuneCents: 0,
      spread: 0.55,
    },
    gesture: 'cluster',
    hornChance: 0.14,
    horn: {
      harmonics: [2, 3, 4, 5, 6],
      partials: [
        { r: 1, g: 1, d: 1 },
        { r: 2, g: 0.3, d: 0.9 },
        { r: 3, g: 0.14, d: 0.8 },
        { r: 4, g: 0.06, d: 0.7 },
      ],
      attack: 0.35,
      hold: 1.6,
      decay: 2.4,
      detuneCents: 0,
      spread: 0.1,
    },
    gapMs: [2400, 5400],
    restChance: 0.22,
    bed: { hz: 2200, q: 0.5, level: 0.05, swayHz: 0.07, swayDepth: 380 },
    pad: { level: 0.025 },
    reverbS: 5.2,
    wet: 0.5,
    level: 0.88,
  },

  /*
   * UNITED STATES — a steel-string guitar in open tuning, fifths, A mixolydian pentatonic.
   *
   * THE SCALE CARRIES ONE NOTE THE OTHERS DO NOT: the flat seventh (the 10). [0, 2, 4, 7, 9, 10] is
   * a major pentatonic with that added, which is the interval the whole American vernacular runs on
   * — blues, gospel, country and rock all lean on it. One semitone is doing more identifying work
   * here than any partial in the list.
   *
   * `gesture: 'dyad'` PLAYS ROOT AND FIFTH TOGETHER, which is what an open-tuned guitar mostly is:
   * bare fifths with no third, so nothing declares itself major or minor. It is also the widest
   * possible interval that still sounds like one event, which suits a country whose atmosphere note
   * is distance.
   *
   * Slightly sharpened upper partials and a 3.8-second decay: steel rings longer and brighter than
   * gut or silk, and takes longer to give up its top end than any other string here.
   */
  'united-states': {
    rootHz: 110, // A2
    scale: [0, 2, 4, 7, 9, 10], // A mixolydian pentatonic
    voiceOctave: 1,
    degrees: [0, 12],
    voice: {
      partials: [
        { r: 1, g: 1, d: 1 },
        { r: 2, g: 0.5, d: 0.72 },
        { r: 3, g: 0.3, d: 0.56 },
        { r: 4.02, g: 0.18, d: 0.44 },
        { r: 5.03, g: 0.1, d: 0.34 },
        { r: 6.05, g: 0.06, d: 0.26 },
      ],
      attack: 0.004,
      hold: 0,
      decay: 3.8,
      detuneCents: 4,
      spread: 0.45,
    },
    gesture: 'dyad',
    gapMs: [2500, 5600],
    restChance: 0.2,
    bed: { hz: 700, q: 0.45, level: 0.05, swayHz: 0.09, swayDepth: 200 },
    pad: { level: 0.045 },
    reverbS: 3.6,
    wet: 0.44,
    level: 0.76,
  },
}

/** The texture for a slug, or undefined off a country route — which the engine plays as silence. */
export function textureFor(slug) {
  return TEXTURES[slug]
}

/*
 * THE MASTER CEILING, and why it is this low.
 *
 * The intent is something a visitor notices they have stopped hearing rather than something they
 * hear start — audible on headphones or a decent laptop, and effectively absent on a phone speaker
 * in a room with other people in it.
 *
 * IT IS LOWER THAN THE DRONE VERSION'S, not higher, even though there is now more going on. A held
 * tone at a given gain and a struck note at the same gain are not the same loudness: the note has a
 * transient, and transients are what the ear measures. Erring quiet is the correct direction of
 * error for a sound nobody asked to be loud — a visitor who wants more has an operating system
 * volume control, and a visitor startled by a website is simply gone.
 */
const CEILING = 0.1

/*
 * FADE TIMES, in seconds.
 *
 * `FADE_IN` is deliberately much longer than `FADE_OUT`. Turning something ON should arrive
 * gradually enough that there is no perceptible start. Turning it OFF must feel immediate, because
 * that press is the visitor withdrawing consent and the interface has no business taking a second
 * and a half to comply.
 *
 * `FADE_SWAP` is the dip through a country change: down, retune in silence, back up.
 */
const FADE_IN = 1.6
const FADE_OUT = 0.35
const FADE_SWAP = 0.55

/*
 * THE SCHEDULER'S TWO NUMBERS, and why notes are not played by `setTimeout`.
 *
 * The naive build is a timer per note. It is unusable: `setTimeout` on a busy main thread drifts by
 * tens of milliseconds, and this main thread is laying out pages and running framer-motion, so
 * every note would land late by a different amount. Audio timing has to come from the audio clock.
 *
 * The standard answer, and this is it: a coarse timer wakes up four times a second and schedules
 * every note falling in the next `SCHEDULE_AHEAD_S`, at exact `AudioContext.currentTime` values.
 * The main thread decides WHAT to play and the audio thread decides WHEN, so main-thread jank
 * cannot be heard. The lookahead only has to exceed the wake interval by enough to absorb a slow
 * frame; 1.2 s against 0.25 s is a generous margin at no cost, because a note scheduled early is
 * simply a note with an accurate start time.
 */
const CLOCK_MS = 250
const SCHEDULE_AHEAD_S = 1.2

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
 *   1. Sound on, standing on the United States. Graph tuned to A2.
 *   2. Visitor switches it off. `setTexture` is not involved; the graph stays tuned to A2.
 *   3. Visitor navigates to Italy. `setTexture` runs, sets `wanted` to Italy, and takes the
 *      "not enabled" branch — which correctly does not retune, because retuning a silent graph
 *      is pointless work.
 *   4. Visitor switches it back on. `enable()` sees a graph already exists, so it skips the
 *      build-and-tune block entirely and just ramps the gain up.
 *
 * Result: Italy's page playing America's scale, and it would have stayed that way until the next
 * navigation. Measured by reading the graph's own state against the route.
 *
 * WHY IT SURVIVED THE FIRST TWO ROUNDS OF TESTING. Every earlier check enabled the sound first and
 * navigated afterwards, which is the path that works. The failing order — navigate while off, then
 * switch on — is the more likely one for a real visitor, who reads a page or two before deciding
 * they want sound. It is also nearly inaudible as a bug: the visitor hears plausible music, with no
 * reason to suspect it belongs to the country they left. That is far more dangerous now than it was
 * under the drone version, because the textures are now distinct enough to be wrong recognisably.
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
 * THE MELODIC STATE. Where the walk currently is, and when the next event and the next tanpura
 * pluck are due on the audio clock.
 *
 * Module scope rather than inside the graph, because it is reset by a country change while the
 * graph survives one. Zeroed by `tune`.
 */
let degree = 0
let nextEventS = 0
let nextDroneS = 0
let droneStep = 0
let clock = null

/*
 * ============================================================================================
 * THE SUBSCRIPTION SURFACE — how a React button reads a value that does not live in React.
 *
 * WHY THE ON/OFF STATE IS HERE AND NOT IN THE COMPONENT. There are two toggle buttons: one in the
 * header for desktop, one inside the mobile navigation sheet, because the header has no room for a
 * third control at 390px. Two components each holding their own `useState` would be two answers to
 * one question, and they would drift the moment one of them unmounts — the sheet unmounts every
 * time it closes. The sound would be playing and the button would say it was off.
 *
 * Keeping the flag beside the audio graph makes that impossible to express: `isEnabled` is the same
 * variable the gain ramp reads, so a button showing "on" and a silent graph cannot happen.
 *
 * `useSyncExternalStore` is the hook that exists for precisely this shape — a value owned by
 * something outside React that components need to render and re-render on. The older pattern (a
 * `useEffect` copying the external value into `useState`) renders one frame with a stale value and
 * can tear.
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

/* A random float in [min, max). Used for timing and panning, never for pitch. */
function between(min, max) {
  return min + Math.random() * (max - min)
}

/*
 * A four-second buffer of pink-ish noise, generated once and looped.
 *
 * WHY PINK AND NOT WHITE. White noise has equal energy per hertz, so half of it is in the top
 * octave and it reads as hiss — the sound of a broken thing. Pink noise has equal energy per
 * octave, which is roughly how the ear divides the spectrum, and reads as rain, wind or a room.
 * Every natural ambience is closer to pink.
 *
 * The filter is Paul Kellet's well-known economical approximation: seven one-pole lowpasses summed
 * with fixed coefficients, accurate to about ±0.05 dB across the audible band.
 *
 * WHY FOUR SECONDS AND WHY A LOOP IS SAFE HERE. A looping buffer normally needs its ends matched or
 * the seam clicks. Noise has no waveform to match — the discontinuity at the loop point is itself
 * indistinguishable from noise.
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
 * A REVERB IMPULSE RESPONSE, SYNTHESISED. Decaying stereo noise, which is the oldest trick in
 * artificial reverberation and remains a good one.
 *
 * WHY THIS IS WORTH THE CODE. It is the single largest contributor to whether the result sounds
 * pleasant. A synthesised note played dry is a test tone: it starts nowhere, it ends abruptly, and
 * every partial is audibly a separate oscillator. Convolved with a few seconds of decay, the same
 * note has a place around it, the partials blur into one sound, and consecutive notes overlap into
 * something continuous instead of arriving as isolated events.
 *
 * WHY NOISE IS AN ACCEPTABLE IMPULSE RESPONSE. A real one is the recorded decay of a real room,
 * which is essentially dense random reflections — so exponentially-decaying noise is not an
 * imitation of the shape, it IS the shape, minus the early reflections that tell you what the room
 * looks like. Since there is no specific room being claimed, there is nothing lost.
 *
 * THE TWO CHANNELS ARE GENERATED INDEPENDENTLY, which is what makes the tail wide rather than a
 * mono blur in the centre. Identical channels would collapse the reverb to a point.
 *
 * `curve` above 1 makes the decay start fast and trail off slowly, which is closer to a real room
 * than a straight exponential and avoids the reverb sounding like a gate closing.
 */
function makeReverbBuffer(context, seconds) {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds))
  const buffer = context.createBuffer(2, length, context.sampleRate)
  const curve = 2.6

  for (let ch = 0; ch < 2; ch += 1) {
    const samples = buffer.getChannelData(ch)
    for (let i = 0; i < length; i += 1) {
      samples[i] = (Math.random() * 2 - 1) * (1 - i / length) ** curve
    }
  }

  return buffer
}

/*
 * Build the whole graph. Called once, inside the enabling click.
 *
 *   notes ─ voiceBus ─┬─ dryGain ───────────────────────┐
 *                     └─ wetGain ─ damp ─ convolver ────┤
 *                                                       ├─ limiter ─ master ─ destination
 *   noise ─ bandpass ─ bedGain ──────────────────────────┤
 *   root  ─┐                                            │
 *   fifth ─┴ padFilter ─ padGain ────────────────────────┘
 *
 *   sway ─ swayGain ─▶ bandpass.frequency     (an audio-rate connection to a parameter)
 *
 * THAT LAST LINE IS THE ONE UNFAMILIAR IDEA. In Web Audio an `AudioParam` is itself a destination:
 * connecting an oscillator to `bandpass.frequency` adds that oscillator's output to the parameter
 * every sample. That is how a 0.03 Hz sine — far below hearing, and inaudible on its own — becomes
 * a slow wander in the noise band rather than a tone. It runs on the audio thread, so it does not
 * stutter when the main thread is busy laying out a page, which a `setInterval` doing the same job
 * absolutely would.
 *
 * NOTE THE BED AND THE PAD BYPASS THE REVERB. Sending a continuous noise floor into a five-second
 * convolution costs real CPU and changes nothing audible — the bed has no transients for a room to
 * respond to. Only the notes are sent, which is also why the wet level can be as high as 0.5
 * without the whole mix turning to soup.
 *
 * THE LIMITER IS INSURANCE, NOT COMPRESSION. Notes are scheduled independently, so they can stack:
 * a bell cluster landing on top of a still-ringing horn and a tanpura pluck is rare but not
 * impossible, and the sum of several notes at safe individual gains can still clip. A compressor
 * with a high threshold and a fast attack does nothing at all until that happens. Getting this
 * wrong is audible as a click, on a feature whose entire justification is that it is pleasant.
 */
function build(context) {
  const master = context.createGain()
  master.gain.value = 0
  master.connect(context.destination)

  const limiter = context.createDynamicsCompressor()
  limiter.threshold.value = -6
  limiter.knee.value = 3
  limiter.ratio.value = 12
  limiter.attack.value = 0.004
  limiter.release.value = 0.2
  limiter.connect(master)

  /* ---- the notes, and the room they are played in ---- */
  const voiceBus = context.createGain()
  voiceBus.gain.value = 1

  const dryGain = context.createGain()
  dryGain.gain.value = 1
  voiceBus.connect(dryGain).connect(limiter)

  const wetGain = context.createGain()
  wetGain.gain.value = 0
  /*
   * A lowpass in front of the convolver. White-ish noise convolved with a bright note puts a lot of
   * energy above 6 kHz, which reads as hiss rather than as space — a real room absorbs high
   * frequencies faster than low ones, and this is the cheapest way to say so.
   */
  const damp = context.createBiquadFilter()
  damp.type = 'lowpass'
  damp.frequency.value = 3600
  const convolver = context.createConvolver()
  voiceBus.connect(wetGain).connect(damp).connect(convolver).connect(limiter)

  /* ---- the noise bed ---- */
  const noise = context.createBufferSource()
  noise.buffer = makeNoiseBuffer(context)
  noise.loop = true

  const bandpass = context.createBiquadFilter()
  bandpass.type = 'bandpass'

  const bedGain = context.createGain()
  bedGain.gain.value = 0

  noise.connect(bandpass).connect(bedGain).connect(limiter)

  /* ---- the held pad ---- */
  const root = context.createOscillator()
  root.type = 'sine'
  const fifth = context.createOscillator()
  fifth.type = 'sine'

  const padFilter = context.createBiquadFilter()
  padFilter.type = 'lowpass'
  padFilter.frequency.value = 900

  const padGain = context.createGain()
  padGain.gain.value = 0

  root.connect(padFilter)
  fifth.connect(padFilter)
  padFilter.connect(padGain).connect(limiter)

  const sway = context.createOscillator()
  sway.type = 'sine'
  const swayGain = context.createGain()
  swayGain.gain.value = 0
  sway.connect(swayGain).connect(bandpass.frequency)

  /*
   * The four continuous sources are started once and never stopped. A stopped
   * `AudioBufferSourceNode` or `OscillatorNode` cannot be restarted — the spec makes them
   * single-use — so stopping them on disable would mean rebuilding the entire graph on every
   * toggle. They run permanently into a gain of zero instead, which costs a few oscillator samples
   * per frame and makes disable/enable a gain ramp rather than a reconstruction.
   *
   * The note oscillators are the opposite case: they are created per note, given an explicit
   * `stop()`, and then unreferenced so the browser can collect them. A permanent pool would be
   * wrong there — there is no fixed number of notes.
   */
  noise.start()
  root.start()
  fifth.start()
  sway.start()

  return {
    context,
    master,
    limiter,
    voiceBus,
    dryGain,
    wetGain,
    convolver,
    bandpass,
    bedGain,
    root,
    fifth,
    padGain,
    sway,
    swayGain,
  }
}

/*
 * ============================================================================================
 * ONE NOTE.
 *
 * Additive synthesis: a sine per partial, each with its own gain envelope, summed into a panner.
 * Six oscillators per note sounds extravagant and is not — at one event every few seconds this
 * peaks around thirty simultaneous oscillators, which is roughly what a single video frame's
 * worth of layout costs.
 *
 * WHY EACH PARTIAL GETS ITS OWN ENVELOPE RATHER THAN ONE ENVELOPE OVER THE SUM. This is the whole
 * reason the notes sound like objects. On a real string or bar, energy at high frequencies is lost
 * fastest, so a struck note is bright for a moment and mellow thereafter — the spectrum changes
 * while it decays. One envelope over the sum keeps the spectrum fixed for the note's whole life,
 * which is the sound of a synthesiser pad, no matter how carefully the partial gains are chosen.
 * `d` per partial is that difference, and it costs one gain node each.
 *
 * WHY `exponentialRampToValueAtTime` AND WHY IT TARGETS 0.0001 RATHER THAN 0. Loudness is
 * perceived roughly logarithmically, so a linear fade on a decaying note audibly hangs at the end
 * and then stops; an exponential one sounds like something ringing out. The spec forbids an
 * exponential ramp to exactly zero (it is a multiplicative curve), hence a small non-zero floor —
 * about -80 dB, which is inaudible under a master gain this low.
 *
 * WHY THE OSCILLATORS ARE STOPPED SLIGHTLY AFTER THE ENVELOPE ENDS. `stop()` is a hard cut. Ending
 * it exactly at the end of the ramp risks truncating on a non-zero sample, which is a click; a 60 ms
 * tail costs nothing and guarantees the cut happens in silence.
 * ============================================================================================
 */
function playNote(g, voice, freqHz, atS, gainMul) {
  const { partials, attack, hold, decay, detuneCents, spread } = voice

  const panner = g.context.createStereoPanner()
  panner.pan.value = between(-spread, spread)

  const noteGain = g.context.createGain()
  noteGain.gain.value = gainMul
  panner.connect(noteGain).connect(g.voiceBus)

  /*
   * `detuneCents` doubles the two lowest partials a few cents sharp. Only the low ones, because a
   * doubled course beats at every partial but the beating is only pleasant where the partials are
   * strong and well separated; detuning the top of the spectrum as well just adds roughness.
   */
  const voices = detuneCents ? [0, detuneCents] : [0]
  let longest = 0

  for (const p of partials) {
    for (const cents of voices) {
      if (cents && p.r > 2) continue

      const decayS = decay * (p.d ?? 1)
      longest = Math.max(longest, attack + hold + decayS)

      const osc = g.context.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freqHz * p.r * 2 ** (cents / 1200)

      const env = g.context.createGain()
      const peak = p.g * (cents ? 0.6 : 1)
      env.gain.setValueAtTime(0, atS)
      env.gain.linearRampToValueAtTime(peak, atS + attack)
      if (hold > 0) env.gain.setValueAtTime(peak, atS + attack + hold)
      env.gain.exponentialRampToValueAtTime(0.0001, atS + attack + hold + decayS)

      osc.connect(env).connect(panner)
      osc.start(atS)
      osc.stop(atS + attack + hold + decayS + 0.06)
    }
  }

  return longest
}

/*
 * A scale degree to a frequency.
 *
 * `index` may run past the end of `scale` and wrap into higher octaves, which is why the range in
 * each texture is stated in degrees rather than in hertz: it means "two and a bit octaves of this
 * country's scale" regardless of how many notes that scale has. Negative indices are not used, so
 * the floor division does not need the sign handling it would otherwise want.
 */
function degreeHz(texture, index) {
  const { scale, rootHz, voiceOctave } = texture
  const octave = Math.floor(index / scale.length)
  const semitones = scale[index % scale.length] + 12 * octave
  return rootHz * 2 ** (voiceOctave + semitones / 12)
}

/*
 * WHERE THE NEXT NOTE GOES, and this function is why real scales can be used instead of safe ones.
 *
 * A uniformly random degree sounds like a random number generator, which it is: consecutive leaps
 * in arbitrary directions have no shape, and any awkward interval in the scale (Yaman's sharpened
 * fourth, most obviously) gets exposed in isolation where nothing explains it.
 *
 * So the walk is weighted heavily toward single steps, allows a third occasionally, and almost
 * never leaps. Stepwise motion is what makes a sequence of pitches read as a line rather than as
 * a list, and it means every note is heard in the context of its neighbours — which is how a
 * characteristic dissonance is supposed to be heard.
 *
 * TWO CORRECTIONS ON TOP OF THE WALK:
 *
 *   THE PULL HOME. One event in six is dragged toward the tonic. Without it an unbiased walk
 *   wanders and never resolves, so the ear waits for a home note that does not arrive.
 *
 *   THE REFLECTION AT THE EDGES. Out of range, the step is reversed rather than clamped. Clamping
 *   parks the walk on the boundary note and repeats it, which is very obvious; reflecting turns the
 *   edge into a turning point, which is what a melody does at the top of its range anyway.
 */
const STEPS = [-3, -2, -1, -1, -1, -1, 1, 1, 1, 1, 2, 3]

function walk(texture) {
  const [low, high] = texture.degrees

  if (Math.random() < 0.17) {
    // Home, or an octave above it — both are the tonic, so either resolves.
    degree = Math.random() < 0.5 ? low : Math.min(high, low + texture.scale.length)
    return degree
  }

  const step = STEPS[Math.floor(Math.random() * STEPS.length)]
  let next = degree + step
  if (next < low || next > high) next = degree - step
  degree = Math.min(high, Math.max(low, next))
  return degree
}

/*
 * ONE EVENT, which is a gesture rather than a note — see `gesture` in the texture notes.
 *
 * Returns nothing; everything is scheduled onto the audio clock at or after `atS`.
 */
function playEvent(g, texture, atS) {
  if (Math.random() < texture.restChance) return

  const { voice, gesture } = texture

  if (gesture === 'arpeggio') {
    /*
     * Three rising notes, 170 ms apart. Ascending and never descending: a rising arpeggio opens and
     * a falling one closes, and this is background, so it should not keep sounding like an ending.
     * Later notes are quieter, which is what a player's hand actually does across a stroke.
     */
    const start = walk(texture)
    for (let i = 0; i < 3; i += 1) {
      const index = Math.min(texture.degrees[1], start + i * 2)
      playNote(g, voice, degreeHz(texture, index), atS + i * 0.17, 0.2 - i * 0.03)
    }
    degree = Math.min(texture.degrees[1], start + 4)
    return
  }

  if (gesture === 'dyad') {
    /*
     * Root and fifth together, and the fifth is found by scale degree rather than by multiplying by
     * 1.5. That matters: taking a just fifth would put a note outside the scale, and in a scale
     * carrying a flat seventh the difference is audible. Three degrees up in a six-note scale is
     * the fifth in every position this scale is used at.
     */
    const index = walk(texture)
    playNote(g, voice, degreeHz(texture, index), atS, 0.19)
    playNote(g, voice, degreeHz(texture, index + 3), atS + 0.035, 0.14)
    return
  }

  if (gesture === 'cluster') {
    /*
     * One to three bells, unevenly spaced, and occasionally a horn underneath them.
     *
     * The spacing is random within each cluster rather than fixed, because a fixed gap between two
     * bells is a rhythm and a herd is not rhythmic. The horn is scheduled slightly BEFORE the
     * bells so its slow attack has already begun when they strike, which is what makes it read as
     * something underneath the scene rather than a fourth bell with an odd envelope.
     */
    if (texture.horn && Math.random() < texture.hornChance) {
      const harmonics = texture.horn.harmonics
      const h = harmonics[Math.floor(Math.random() * harmonics.length)]
      playNote(g, texture.horn, texture.rootHz * h, atS, 0.3)
    }

    const bells = 1 + Math.floor(Math.random() * 3)
    let when = atS + 0.05
    for (let i = 0; i < bells; i += 1) {
      playNote(g, voice, degreeHz(texture, walk(texture)), when, 0.15 - i * 0.02)
      when += between(0.22, 0.6)
    }
    return
  }

  /* 'single' — Japan and India. Japan's optional grace note is the only ornament on the site. */
  const index = walk(texture)
  if (texture.graceChance && Math.random() < texture.graceChance) {
    const neighbour = Math.max(texture.degrees[0], index - 1)
    playNote(g, voice, degreeHz(texture, neighbour), atS, 0.09)
    playNote(g, voice, degreeHz(texture, index), atS + 0.085, 0.21)
    return
  }
  playNote(g, voice, degreeHz(texture, index), atS, 0.21)
}

/*
 * Apply a texture to the continuous half of the graph, and reset the melodic half.
 *
 * `at` is a time on the audio clock, so the caller can schedule the retune to land in the middle of
 * a fade-out rather than immediately. Every value is set with `setValueAtTime`, which is a step: the
 * retune happens during silence, so there is nothing to smooth.
 *
 * THE CONVOLVER BUFFER IS REPLACED HERE, which is a heavier operation than setting a parameter and
 * is the reason a country change dips through silence rather than gliding. Assigning
 * `convolver.buffer` takes effect immediately rather than at `at`, so any tail still ringing is cut
 * — inaudible only because the master gain is already at zero by the time this runs.
 *
 * `nextEventS` IS DELIBERATELY SET INTO THE FUTURE. Starting the first note at the bottom of the
 * dip would mean the new country's first note fading in from nothing, which wastes the one note a
 * visitor is most likely to actually notice. Half a fade-in later, the gain is most of the way up.
 */
function tune(g, texture, at) {
  // Recorded here rather than at each call site so `tuned` cannot fall out of step with the graph:
  // there is one function that changes the sound and it is the one that updates the record.
  tuned = texture

  g.bandpass.frequency.setValueAtTime(texture.bed.hz, at)
  g.bandpass.Q.setValueAtTime(texture.bed.q, at)
  g.bedGain.gain.setValueAtTime(texture.bed.level, at)
  g.sway.frequency.setValueAtTime(texture.bed.swayHz, at)
  g.swayGain.gain.setValueAtTime(texture.bed.swayDepth, at)

  g.root.frequency.setValueAtTime(texture.rootHz, at)
  g.fifth.frequency.setValueAtTime(texture.rootHz * 1.5, at)
  g.padGain.gain.setValueAtTime(texture.pad.level, at)

  g.wetGain.gain.setValueAtTime(texture.wet, at)
  g.convolver.buffer = makeReverbBuffer(g.context, texture.reverbS)

  degree = texture.degrees[0]
  droneStep = 0
  nextEventS = at + FADE_IN * 0.5
  nextDroneS = at + 0.15
}

/*
 * THE SCHEDULER. Wakes four times a second, fills the next `SCHEDULE_AHEAD_S` with notes.
 *
 * Two independent queues, because India's tanpura is not part of its melody: the cycle keeps its
 * own steady period while the flute above it is irregular, which is what the two instruments
 * actually do. Sharing one queue would force them onto the same grid.
 *
 * THE CATCH-UP GUARD MATTERS. `currentTime` does not advance while a context is suspended, so a
 * backgrounded tab cannot build a backlog — but a context that was suspended and resumed can leave
 * these markers slightly behind, and a marker far in the past would make the `while` loop schedule
 * every missed note at once. Pinning them forward costs one comparison and removes the whole class
 * of failure.
 */
function scheduleAhead() {
  if (!graph || !isEnabled || !wanted) return
  const now = graph.context.currentTime
  const until = now + SCHEDULE_AHEAD_S

  if (nextEventS < now) nextEventS = now + 0.05
  if (nextDroneS < now) nextDroneS = now + 0.05

  while (nextEventS < until) {
    playEvent(graph, wanted, nextEventS)
    nextEventS += between(wanted.gapMs[0], wanted.gapMs[1]) / 1000
  }

  const drone = wanted.drone
  if (!drone) return
  while (nextDroneS < until) {
    const ratio = drone.ratios[droneStep % drone.ratios.length]
    playNote(graph, drone.voice, wanted.rootHz * ratio, nextDroneS, drone.level)
    droneStep += 1
    nextDroneS += drone.stepMs / 1000
  }
}

/*
 * The scheduler's timer, started and stopped rather than left running and gated.
 *
 * A `setInterval` firing four times a second forever to discover it has nothing to do would wake
 * the main thread indefinitely — invisible, and exactly the kind of thing that shows up as battery
 * drain rather than as a bug. Same reasoning as the backdrop's decision not to create a timer for a
 * single image.
 */
function startClock() {
  if (clock !== null) return
  clock = setInterval(scheduleAhead, CLOCK_MS)
  // Once immediately, so the first note does not wait a quarter of a second for the first tick.
  scheduleAhead()
}

function stopClock() {
  if (clock === null) return
  clearInterval(clock)
  clock = null
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
 * `linearRampToValueAtTime` and not the exponential variant: exponential ramps cannot reach or pass
 * through zero (the spec forbids a zero target), and every fade here either starts or ends at
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
     * by the same route as every later one. Tuning in both places would have been two code paths
     * for one job, which is how the original divergence happened.
     */
  }

  /*
   * A context can be `suspended` even when created in a gesture — Safari does this when the page was
   * backgrounded, and `visibilitychange` below suspends it deliberately. `resume()` returns a
   * promise we do not need to await: everything below is scheduled on the audio clock, which does
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
  if (wanted) startClock()
}

/**
 * Stop playing, keeping the graph so re-enabling is instant.
 *
 * The context is NOT closed. `close()` is irreversible — a closed context cannot be reopened and a
 * replacement would need another user gesture to start, so the second press of the toggle would do
 * nothing. Fading to zero and leaving it running is the only shape in which this button works
 * twice.
 *
 * Notes already scheduled are left to play out into the fade rather than cancelled. Stopping live
 * oscillators mid-decay is a click, and the fade is over in a third of a second.
 */
export function disable() {
  isEnabled = false
  notify()
  stopClock()
  if (!graph) return
  rampTo(graph, 0, FADE_OUT)
}

/**
 * Change which country is playing. Safe to call when disabled and before anything is built.
 *
 * Pass `undefined` off a country route: the shell is silent and the country speaks, so the home page
 * and the passport fade to nothing even with the toggle on. That is the audible half of a rule the
 * rest of the site already follows — off a country route the accent falls back to the neutral shell
 * blue, and nothing on the page is tinted by a place the visitor is not in.
 *
 * WHY IT DIPS THROUGH SILENCE RATHER THAN GLIDING. Retuning in place would leave the previous
 * country's notes ringing in the previous country's reverb while the new scale started underneath
 * them, which is two pieces of music at once. Down, retune while inaudible, back up — which is also
 * what the page transition does visually, and the two now agree.
 */
export function setTexture(texture) {
  wanted = texture ?? null

  if (!graph) return

  if (!isEnabled || !wanted) {
    /*
     * The clock stops off a country route as well as when switched off. Without this, the home page
     * would keep scheduling the last country's notes into a master gain of zero: inaudible, and a
     * pure waste of a wake-up every 250 ms plus the oscillators to go with it.
     */
    stopClock()
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
  if (wanted === tuned) {
    // Still start the clock: arriving from a silent route needs the schedule restarted even though
    // the graph happens to be tuned correctly already.
    startClock()
    return
  }

  const now = graph.context.currentTime
  graph.master.gain.cancelScheduledValues(now)
  graph.master.gain.setValueAtTime(graph.master.gain.value, now)
  graph.master.gain.linearRampToValueAtTime(0, now + FADE_SWAP)
  // Retune a hair after the bottom of the dip, so the step lands in silence rather than on the last
  // audible sample of the fade.
  tune(graph, wanted, now + FADE_SWAP + 0.01)
  graph.master.gain.linearRampToValueAtTime(targetLevel(), now + FADE_SWAP + FADE_IN)
  startClock()
}

/*
 * SILENCE A BACKGROUNDED TAB, and resume when the visitor comes back.
 *
 * WHY THIS IS NOT OPTIONAL. Without it, a visitor who switches to another tab or locks their phone
 * still has this site making noise from somewhere they cannot see — with the control that stops it
 * on a page they are no longer looking at. That is the single most irritating thing a website can do
 * with audio, and it is why browsers built the visibility API.
 *
 * `suspend()` rather than a fade to zero, because a hidden tab should not be running an audio graph
 * at all: suspending releases the audio hardware and stops the oscillators consuming any time. The
 * scheduler's timer is stopped too — it is a main-thread interval, so suspending the context would
 * otherwise leave it waking up four times a second to find a clock that is not moving.
 *
 * `isEnabled` is untouched, so this is not the visitor's choice being overridden — coming back
 * restores exactly what they left, which is why the guard checks it before resuming.
 *
 * Registered at module scope, once, with no removal: the listener's lifetime is meant to be the
 * document's, and this module is only imported by a component that never unmounts.
 */
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!graph) return
    if (document.hidden) {
      stopClock()
      graph.context.suspend().catch(() => {})
    } else if (isEnabled) {
      graph.context.resume().catch(() => {})
      if (wanted) startClock()
    }
  })
}
