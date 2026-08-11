/*
 * ambience.js — each country's air, with a few of its notes in it. Synthesised, not recorded.
 *
 * ============================================================================================
 * TWO ROUNDS OF THIS HAVE BEEN REJECTED. WHAT EACH ONE GOT WRONG.
 *
 * ROUND ONE played filtered pink noise plus two sine partials a fifth apart, with the band and the
 * pitch varying per country. Its own header argued that this was the honest register: it sounded
 * like a room rather than like a place, so it claimed nothing. The report was that it "is not good,
 * it should be pleasant and different for different countries", and both halves were symptoms of
 * one cause: THERE WERE NO NOTES IN IT. Nothing for the ear to follow, and — because the five
 * differed only by filter frequency and fundamental — nothing loud enough to notice on arrival.
 *
 * ROUND TWO added notes, and the report was sharper and more useful: "only the music you have added
 * to india is fine, others are very much of the ringtons and very slow."
 *
 * THAT IS A DIAGNOSIS, NOT A PREFERENCE, AND IT POINTS AT EXACTLY ONE DIFFERENCE. India was the only
 * texture of the five with something playing CONTINUOUSLY underneath the melody — a tanpura cycling
 * every 1.05 s. The other four were a struck note, then silence for three to five seconds, then
 * another struck note. That is not a description of bad music; it is a description of a ringtone. A
 * ringtone is precisely an isolated pleasant sound with nothing behind it, which is why a phone
 * alert and a wind chime use the same materials and only one of them is background.
 *
 * So the fault was never in the partials or the scales. It was that four countries had no floor. The
 * word "slow" is the same observation from the other side: with nothing sustaining between events,
 * the gap IS the sound, and a four-second gap is four seconds of nothing.
 *
 * ============================================================================================
 * WHAT ROUND THREE DOES DIFFERENTLY. THREE CHANGES, IN ORDER OF HOW MUCH THEY MATTER.
 *
 *   1. EVERY COUNTRY NOW HAS A CONTINUOUS LAYER, and for most of them it is the LOUDER half. The
 *      notes became punctuation on top of something, rather than the whole thing. India is left
 *      exactly as it was, to the digit — it was reported as the one that works, so the only correct
 *      change to it is none.
 *
 *   2. THE CONTINUOUS LAYER IS ENVIRONMENTAL WHERE THAT IS WHAT THE PLACE IS. The instruction was
 *      "add the music based on that country's culture, for example for japan you can add leaves wind
 *      music", and wind through leaves is not an instrument — it is broadband noise that gusts. So
 *      there is now a real wind layer: a second noise path, moving filter, and gusts scheduled as
 *      overlapping swells rather than a fixed tremolo. Japan is led by it. The others get the air
 *      their landscape actually has, and their instrument sits inside it.
 *
 *      WHERE A TRADITION ALREADY SUPPLIES A CONTINUOUS SOUND, THAT IS USED INSTEAD OF WIND, because
 *      it is the better answer to the same problem. Switzerland gets the herd — cow bells on grazing
 *      cattle ring constantly and irregularly, and that, not the alphorn, is what an alpine pasture
 *      sounds like. Italy gets a held reed organ (round three tried mandolin tremolo here; see below).
 *
 *   3. THE SHELL IS NO LONGER SILENT, which reverses a rule this file used to state at length. The
 *      report was "there is no music on the main page, we should have something like excitement
 *      music". The old contract was "the shell is silent and the country speaks" — defensible, and
 *      wrong in practice: a visitor who switches the sound on at the top of the site hears nothing,
 *      concludes it is broken, and switches it off before ever reaching a country. The one page that
 *      most needs to justify the button was the one page that said nothing.
 *
 * ============================================================================================
 * ROUND THREE WAS THEN REPORTED THREE-SIXTHS WRONG, AND THE THREE PARTITION CLEANLY. THIS IS ROUND
 * FOUR, AND IT IS THE MOST USEFUL THING ANY OF THE FOUR ROUNDS HAS ESTABLISHED.
 *
 * The report was: "i dont like the main page music, even italy, even US". Japan, India and
 * Switzerland went unmentioned. Those two sets are not a matter of taste — they are a fact about
 * additive synthesis, and I built the rejected half on mechanisms this engine cannot produce.
 *
 *   ACCEPTED: a plucked drone (tanpura), gusting noise (wind through leaves), struck resonant bodies
 *   (cow bells, an overtone-series horn). Every one of those IS a sum of decaying sinusoids. That is
 *   not an approximation of what those sounds are; it is a description of them.
 *
 *   REJECTED: a metronomic pulse, a plectrum tremolo, a fretted glide. Every one of those is defined
 *   by material that has no pitch at all — pick noise on a plectrum stroke, string nonlinearity under
 *   a fast wrist, finger friction and fret buzz under a moving bottleneck. Remove the noise and what
 *   is left of a tremolo is amplitude flutter, and what is left of a slide is a swooping whistle.
 *   Those are precisely the two words you would use to describe a cheap synthesiser.
 *
 * THE RULE THIS YIELDS, AND IT SHOULD GOVERN ANY FUTURE ADDITION HERE:
 *
 *   ONLY IMITATE SOUNDS WHOSE IDENTITY SURVIVES BEING MADE OF SINE WAVES. A sound whose character
 *   lives in its noise, its attack transient, or its nonlinearity will read as a cheap imitation no
 *   matter how accurate the pitches are, because the part being imitated is the part that is missing.
 *   Struck, blown, bowed and gusting sounds pass. Plucked-with-a-plectrum, scraped, buzzed and
 *   bowed-hard sounds do not.
 *
 * SO ROUND FOUR REBUILDS THE THREE REJECTED TEXTURES ON THE RECIPE THE THREE ACCEPTED ONES SHARE —
 * a sustained layer, plus sparse struck or blown notes with a long decay — and deletes the three
 * gestures that were reaching for what the engine does not have. Japan, India and Switzerland are
 * untouched apart from a remeasured `level`, for the same reason India was untouched in round three.
 *
 *   · ITALY loses its tremolo and its arpeggio, and gains a soft held reed organ under sparse distant
 *     bells. Bells and a held pipe tone are both what this engine already does best, and both are
 *     more honestly Italian than a mandolin trope: a hill town's continuous sound is a church organ
 *     and its bells, not a serenade.
 *   · THE UNITED STATES loses its slide and its long-decay dyad, and keeps only the open low string,
 *     now blown-long rather than struck, under the widest wind here. Its identity moves from a
 *     technique to a space, which is the more defensible claim for a country too varied for one
 *     instrument anyway.
 *   · THE SHELL LOSES ITS BEAT. Excitement was asked for and a 500 ms pulse was the wrong answer — a
 *     bare pulse of sine waves is the sound of a machine, and it is the only thing on the site with a
 *     grid. What is kept is everything that made it excited WITHOUT percussion: the fastest tempo
 *     here, the brightest register, rising figures, and the shortest room. Tempo and direction are
 *     what anticipation is made of; a click track was never carrying it.
 *
 * ============================================================================================
 * THE RISK IN DRAWING ON REAL TRADITIONS, WHICH EVERY ROUND SINCE THE SECOND HAS TAKEN ON.
 *
 * Asked how far each country's sound should reference that country's own music, the visitor chose to
 * draw on the tradition rather than to use five neutral instruments. So the choices below are
 * specific, and that is a louder claim than this project usually makes. The accent colours are
 * validated against nothing and nobody mistakes Italy's 1.3 pace multiplier for a measurement,
 * because a multiplier does not resemble anything. A pentatonic pluck DOES resemble something, and
 * musical shorthand is one step from caricature — "the five-note scale that means Asia in a film
 * trailer" is a real and lazy trope.
 *
 * Three constraints keep this on the right side of that line:
 *
 *   1. THE MATERIAL IS REAL, NOT SUGGESTIVE. Japan's scale is hirajōshi, an actual koto tuning, not
 *      "some pentatonic". India's is Yaman, a named raga, and the tanpura's cycle is the
 *      conventional Pa–Sa–Sa–Sa. Switzerland's horn plays only the natural overtone series, because
 *      that is the only thing an alphorn physically can play. Italy's organ has strong odd harmonics
 *      and weak even ones because that is what a stopped reed pipe does. Where a real tradition
 *      supplies a specific answer, that answer is used instead of a generic one.
 *
 *      ROUND FOUR ADDS A SECOND HALF TO THIS CONSTRAINT: the material must also be renderable. A real
 *      technique this engine cannot produce is not a truer choice than a generic one, it is a worse
 *      one, because the listener hears the failure rather than the reference. Italy's tremolo and
 *      America's slide were both genuine techniques and both had to go.
 *   2. NOTHING IS PERFORMED. There are no melodies, no phrases and now no pulse anywhere outside
 *      India's tanpura — notes are chosen one at a time and the result is closer to wind chimes than
 *      to a tune. A composed melody would be an impersonation. A scale is a palette.
 *   3. THE LABEL DOES NOT LIE. The toggle says these are synthesised, not a recording of anywhere,
 *      which is the cheapest possible place to prevent the misunderstanding.
 *
 * WHY THERE ARE STILL NO AUDIO FILES, which was the original decision and survives every round.
 * Openly-licensed audio is far thinner than openly-licensed photography: the best CC0 candidate for
 * Japan was a New Zealand cicada and the best for the United States was a recording titled "Highway
 * from bridge, centre". Labelling those as those countries is exactly the failure Principle 15
 * exists to prevent. Almost all of that material is also Ogg Vorbis, which Safari cannot decode, and
 * this toolchain cannot transcode or seam-trim a loop. Synthesis has no licensing question, costs
 * zero bytes over the wire, and is the only option that works on iOS.
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
 *   climb        Optional. Biases the walk upward and sends it home to the BOTTOM of the range
 *                rather than the tonic above it, so figures rise and then start again from low
 *                down. Rising motion is anticipation; only the shell uses it.
 *
 * TIMBRE (`voice`, plus `horn` where a country has two)
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
 *
 *                A LONG `hold` IS ALSO HOW A DRONE BECOMES A CHORD RATHER THAN A PULSE. Italy's organ
 *                holds for 5.5 s against gaps of about 4.2 s, so each note is still sounding when the
 *                next arrives and they overlap into something continuous. India's tanpura reaches the
 *                same place from the opposite direction, by plucking faster than the gaps register.
 *   detuneCents  Adds a second copy of the low partials, slightly out of tune. Instruments with
 *                doubled courses beat against themselves, and that beating is a large part of their
 *                character. 0 for single-strung instruments, and worth removing wherever the note is
 *                too short for a slow beat to be heard as anything but roughness.
 *   spread       How far notes are panned left and right, 0 to 1. Width, cheaply.
 *
 * BEHAVIOUR
 *   gesture      What a single event is: 'single', 'dyad', 'cluster' or 'sparkle'. See `playEvent`.
 *                THREE MORE EXISTED AND WERE DELETED — 'tremolo', 'slide' and 'arpeggio' — because
 *                each depended on material sine synthesis does not have. See the round-four note at
 *                the top of the file before adding a fourth.
 *   gapMs        [min, max] milliseconds between events. This is the tempo. IT IS NOW MUCH SHORTER
 *                THAN IT WAS, on the four countries reported as "very slow", and the shortening is
 *                only half the fix — see `wind` and `drone`.
 *   restChance   Probability an event is silence instead. Rests are what stop this becoming a
 *                sequencer; without them the spacing is audibly regular within about a minute. Also
 *                lower than it was, for the same reason.
 *
 * THE CONTINUOUS LAYER — THE POINT OF THIS ROUND. Every texture has at least one of these two.
 *   wind         Optional. Noise that GUSTS: a second bandpassed noise path whose gain is automated
 *                as a chain of overlapping swells and whose filter wanders under its own oscillator.
 *
 *                WHY IT IS NOT JUST A LOUDER `bed`. A static noise band at a fixed level is a hum,
 *                and the ear stops hearing a hum inside about twenty seconds — which is why the old
 *                bed could be present and still leave the notes sounding unaccompanied. Wind is the
 *                same noise with a shape: it arrives, builds, passes. Something that changes cannot
 *                be tuned out, and it is the change rather than the level that makes a note sound
 *                like it is happening somewhere.
 *
 *                { hz, q } the band, { swayHz, swayDepth } how far and how fast that band wanders,
 *                `level` the peak of a full gust, `floor` the fraction left between gusts (never 0 —
 *                air does not stop), `gustS` [min, max] seconds to build, `calmS` [min, max] seconds
 *                between one gust falling away and the next starting. SMALL `calmS` VALUES MAKE
 *                GUSTS OVERLAP, which is what a windy day is.
 *
 *   drone        Optional. A second queue of notes independent of the melody, general enough to be
 *                three different things:
 *                  · `stepMs` — a fixed period. India's tanpura, and the only fixed period left here.
 *                  · `gapMs` — an irregular period. Switzerland's herd, where a fixed gap between two
 *                    cow bells would be a metronome and a herd is not one; and Italy's organ, where
 *                    the notes are longer than the gaps so they overlap into a held chord.
 *                  · `pick: 'random'` — choose from `ratios` at random instead of cycling, again for
 *                    the herd: those are different animals, not one animal playing a figure.
 *
 *                THE SHELL HAS NO DRONE, and it is the only texture that needs none: its events are
 *                closer together than its own decay, so the notes overlap each other. Every country's
 *                notes are seconds apart, which is why removing their second layer would return them
 *                straight to the ringtone complaint.
 *
 * BACKGROUND
 *   bed          The quiet static noise floor that used to be the whole background, with a very slow
 *                wander. It is now the layer UNDER the wind rather than the only air in the mix.
 *   pad          A held root-and-fifth, quieter still. Continuity between notes.
 *   reverbS/wet  The size of the room and how much of it is heard. THIS IS DOING MORE WORK FOR
 *                "pleasant" THAN ANY OTHER FIELD HERE. Dry synthesised notes sound like a test
 *                tone no matter how carefully the partials are chosen; the same notes in four
 *                seconds of decay sound like an instrument in a place. Note the shell has the
 *                SHORTEST room of the six: a long tail is contemplative, and a short one is
 *                immediate. Reverb length is a tempo control as much as a space control.
 *   level        Per-country trim under the master ceiling, and EVERY ONE OF THESE NUMBERS IS
 *                MEASURED RATHER THAN CHOSEN. It is not a ranking (§7.4) — it is loudness
 *                compensation, and it has to be measured because estimating it does not work.
 *
 *                WHAT THE MEASUREMENT FOUND, ROUND TWO. Sampling output RMS every animation frame
 *                across a 40-second window per country, the first draft came out at India 0.0151
 *                against Switzerland 0.0042: a factor of 3.6, which on navigation is not a subtlety
 *                but a jolt. Two causes, neither visible by reading the table. India was the only
 *                country with a continuous second instrument, so its tanpura alone put roughly forty
 *                plucks a minute under everything else; and Switzerland spent most of its time in
 *                silence with bells whose partials die in a fraction of a second.
 *
 *                WHY THEY ALL HAD TO BE MEASURED AGAIN FOR ROUND THREE. That first cause has now
 *                been deliberately given to all six textures. Adding a continuous layer to five of
 *                them invalidated five of the six trims by construction, and a gust layer is the
 *                worst possible thing to estimate by eye: its contribution depends on peak level,
 *                floor, build time and how often gusts overlap, which is four numbers interacting.
 *
 *                WHAT THAT SECOND MEASUREMENT FOUND, AND IT WAS BACKWARDS FROM THE PREDICTION.
 *                Round two's fault was India being 3.6x LOUDER than the others, so the obvious guess
 *                was that giving everyone a continuous layer would push the other five up past it.
 *                They came out BELOW it: shell 0.00112, Japan 0.00183, Italy 0.00181, US 0.00224,
 *                Switzerland 0.00291 against India's unchanged 0.00556 — a 4.96x spread the other
 *                way round. The reason is that a gust and a tremolo are both made of many quiet
 *                things rather than a few loud ones. Italy went from 74 oscillators per 40 seconds to
 *                1053 and got QUIETER, because a tremolo pluck is a fifth the gain of a struck note.
 *                Counting events is not measuring loudness either.
 *
 *                AND AGAIN FOR ROUND FOUR, for the same structural reason: three of the six textures
 *                were replaced outright, and the replacements changed density in both directions.
 *                Italy's held organ is continuous energy where its tremolo was many tiny plucks, so it
 *                came out 1.5x too loud; the American slide became one sparse swelled dyad every four
 *                seconds and came out too quiet. Both were invalidated by construction rather than by
 *                drift, which is why no trim here is ever carried across a rewrite.
 *
 *                THE FIGURES AS COMMITTED, verified after the trims were applied: 0.00602, 0.00592,
 *                0.00600, 0.00614, 0.00515 and 0.00595 — a spread of 1.19x, worst peak 0.035 against a
 *                ceiling of 0.1. Every one is the mean of two independent 40-second windows.
 *
 *                A TRIM NEVER SURVIVES A CHANGE TO WHAT IS BEING PLAYED, only to how loudly. The
 *                American dyad's upper note moved from a scale degree to a fixed fifth after the trims
 *                were first computed, which changed the spectrum, so its earlier windows were discarded
 *                rather than pooled with the later ones.
 *
 *                MEASURING TWICE IS NOT BELT AND BRACES; IT IS THE ONLY HONEST READING, AND IT IS ALSO
 *                WHERE THE TRIMMING HAS TO STOP. Switzerland read 0.00676 then 0.00439 off one
 *                identical build: its herd fires at a random interval and its alphorn on a 32% chance,
 *                so a single window can land on a quiet stretch. I trimmed it up on that reading, which
 *                was fitting the sample rather than the texture, and then overshot it a second time the
 *                same way. Round two made the same mistake in another form, when a 14-second sample of
 *                Japan fell on a run of rests and looked like a broken scheduler.
 *
 *                WHAT FINALLY WORKED IS POOLING EVERY WINDOW A TEXTURE HAS EVER BEEN MEASURED IN,
 *                ACROSS DIFFERENT LEVEL SETTINGS, and solving for RMS-PER-UNIT-LEVEL. Loudness is
 *                linear in the trim, so dividing each reading by the level it was taken at makes
 *                windows from different builds comparable instead of throwing them away — six readings
 *                per texture rather than two, from data already collected.
 *
 *                THE ESTIMATOR ALSO REPORTS ITS OWN RELIABILITY, which is the part worth keeping: the
 *                per-unit figures agree to within 1.04x for India, whose tanpura is regular, 1.05x for
 *                the shell, and 1.34x for Switzerland, whose herd interval and 32% horn are not. A
 *                texture's variance is a property of its own design.
 *
 *                Hence the stopping rule: A RESIDUAL SPREAD SMALLER THAN A SINGLE TEXTURE'S OWN
 *                RUN-TO-RUN VARIANCE IS NOT A DEFECT AND MUST NOT BE TRIMMED. The pooled solve asks for
 *                Switzerland at 0.553 against the 0.53 committed here — a 4% difference sitting inside
 *                its own 1.34x variance, so it is left alone. Five of the six are confirmed to within
 *                1%. Anything further would be fitting to one performance, and two rounds of doing
 *                exactly that is what this estimator exists to prevent.
 *
 *                That India's trim is a third of Japan's says nothing whatever about the two
 *                countries — only about how many notes per minute each texture asks for.
 *
 *                THE GENERAL POINT: perceived loudness is not readable off a gain value, and it is
 *                not readable off an event count either. Note density, register, decay time, per-note
 *                gain and gust overlap all enter it, they push in different directions, and the only
 *                way to know is to measure the output.
 * ============================================================================================
 */
const TEXTURES = {
  /*
   * JAPAN — wind through leaves, with a koto in it somewhere.
   *
   * THIS IS THE ONE COUNTRY WHERE THE ENVIRONMENT IS THE LEAD AND THE INSTRUMENT IS THE ORNAMENT,
   * and it is the country the instruction named: "for japan you can add leaves wind music". So the
   * wind is not underneath the koto here, it IS the piece — a broad band centred well above the
   * fundamental, gusting almost continuously, with the band itself moving as each gust passes.
   *
   * WHY LEAVES SIT HIGH AND BROAD. A leaf is small and stiff, so the sound of thousands of them is
   * weighted well above 1 kHz, and it is genuinely broadband — every leaf is a different size. Hence
   * a low `q` (0.6, barely a filter at all) rather than the narrow resonant band the old version
   * used for a room. A high, narrow band would be a whistle; a low, narrow one would be a hum.
   *
   * `swayDepth: 900` IS THE LARGEST HERE AND IS WHY IT READS AS LEAVES RATHER THAN AS STATIC. A gust
   * does not just get louder, it gets brighter, because more of the canopy is moving and the small
   * leaves join in. Sweeping the band by nearly a kilohertz under a slow oscillator is that.
   *
   * `calmS: [0.4, 2.2]` AGAINST A BUILD OF UP TO 3.2 SECONDS means gusts routinely start before the
   * previous one has finished. That overlap is deliberate and it is the difference between wind and
   * a slow tremolo — real gusts are not events in a queue, they are a continuous thing with a
   * varying amount of itself.
   *
   * THE KOTO IS UNCHANGED IN TUNING AND FASTER IN USE. HIRAJŌSHI IS A REAL TUNING AND THAT IS THE
   * POINT: [0, 2, 3, 7, 8] is the standard koto tuning (D, E, F, A, B♭ from D), not a generic
   * pentatonic. Its minor second and its two minor thirds are what make it sound like itself rather
   * than like a wind chime — the "trailer pentatonic" cliché is [0, 2, 4, 7, 9], a different scale.
   * The gaps came down from 2.0–4.6 s to 1.3–2.9 s and the decay went up from 3.6 s to 4.6 s, so
   * consecutive notes now overlap in the reverb instead of arriving alone.
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
      decay: 4.6,
      detuneCents: 0,
      spread: 0.36,
    },
    gesture: 'single',
    graceChance: 0.22,
    gapMs: [1300, 2900],
    restChance: 0.14,
    wind: {
      hz: 2400,
      q: 0.6,
      swayHz: 0.13,
      swayDepth: 900,
      level: 0.5,
      floor: 0.3,
      gustS: [1.2, 3.2],
      calmS: [0.4, 2.2],
    },
    bed: { hz: 480, q: 1.2, level: 0.04, swayHz: 0.03, swayDepth: 40 },
    pad: { level: 0.04 },
    reverbS: 2.9,
    wet: 0.4,
    level: 0.76,
  },

  /*
   * INDIA — a tanpura underneath, a bansuri over the top, in raga Yaman.
   *
   * ============================================================================================
   * NOT ONE NUMBER IN THIS BLOCK CHANGED IN ROUND THREE, AND THAT IS THE POINT OF THE ROUND.
   *
   * The report was "only the music you have added to india is fine". When five things are wrong and
   * one is right, the one that is right is the specification for the other five, and touching it is
   * the only way to lose information. Everything above and below this block was rewritten to have
   * what this block already had: something playing continuously under the melody.
   *
   * So India needs no wind layer. It has a tanpura, which is a better continuous layer than wind
   * because it is also pitched, and adding air underneath it would only crowd the one texture that
   * was reported as working. Its `level` is the sole edit here, and only because every trim in the
   * file was re-measured against a common target after the other five changed density.
   * ============================================================================================
   *
   * THE TANPURA IS WHY THIS COUNTRY SOUNDS DIFFERENT FROM THE OTHERS AT A SECOND'S NOTICE, and after
   * round four it is the ONLY fixed period left on the site — the shell's beat was removed as a
   * caricature of excitement, and this survives because it is not a beat but an instrument that
   * happens to be regular, and because it was the one thing reported as working. A tanpura is not a
   * drone in the
   * held-note sense: it is plucked, continuously, in a cycle, and the conventional cycle is
   * Pa–Sa–Sa–Sa — the fifth below the tonic, then the tonic three times. That is the `ratios` list,
   * and 0.75 is Pa (a fifth below Sa is three-quarters of its frequency).
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
    level: 0.32,
  },

  /*
   * ITALY — a reed organ held under distant bells, in a stone room.
   *
   * ============================================================================================
   * ROUND THREE PUT A MANDOLIN TREMOLO HERE AND IT WAS REJECTED. WHY IT DESERVED TO BE.
   *
   * The argument for it was good and the sound was not. A mandolin cannot sustain, tremolo is the
   * tradition's own answer to that, so a continuous sound built from the instrument's only material
   * seemed like the rare case where the honest choice and the useful one agreed.
   *
   * WHAT THAT ARGUMENT MISSED IS THAT A PLECTRUM STROKE IS MOSTLY NOISE. The reason thirteen plucks a
   * second fuse into one held note on a real mandolin is the pick attack: a broadband click, thirteen
   * times a second, plus the doubled course beating and the string behaving nonlinearly under a fast
   * wrist. This engine has sine waves. Take the click away and what is left of a tremolo is a sine
   * tone being wobbled in amplitude, which is not a mandolin — it is a synthesiser with an LFO on it,
   * and that is exactly what it sounded like. `detuneCents: 9` made it worse rather than better,
   * because beating without a transient is just wobble on wobble.
   *
   * THE REPLACEMENT USES ONLY WHAT THIS ENGINE PRODUCES HONESTLY, and the country loses nothing by it.
   * A hill town's actual continuous sound is not a serenade — it is a church organ heard through a
   * door, and bells across the valley marking the hour. Both are things additive synthesis genuinely
   * IS rather than imitates: a reed pipe is a held tone with strong odd harmonics, and a bell is a
   * struck body with inharmonic partials.
   * ============================================================================================
   *
   * THE ORGAN IS THE CONTINUOUS LAYER, AND IT IS A HELD CHORD RATHER THAN A CYCLE OF PLUCKS. This is
   * the one place `hold` is long enough to make the drone queue produce sustain instead of rhythm:
   * 5.5 seconds of hold against a 4.2-second gap means each note is still sounding when the next
   * arrives, so consecutive drone notes overlap into a continuous chord that changes rather than a
   * pulse. India's tanpura solves the same problem the opposite way, by plucking fast enough that the
   * gaps do not register. Both are continuous; only one of them has a beat.
   *
   * ITS RATIOS ARE A CYCLE THROUGH THE TONIC TRIAD, [1, 1.5, 2, 1.5], so the held chord shifts colour
   * every few seconds without ever leaving the harmony. Not random — the point of a drone is that it
   * does not go anywhere, and a random pick would make it a second melody.
   *
   * ODD HARMONICS STRONG AND EVEN ONES WEAK IS WHAT MAKES IT A PIPE. A reed pipe stopped at one end
   * resonates most readily at odd multiples of its fundamental, which is why a clarinet and an organ's
   * reed stops sound hollow rather than bright. The gains below run 1, 0.12, 0.5, 0.08, 0.3 — the
   * third and fifth harmonics far above the second and fourth. That single asymmetry does more to
   * identify the instrument than any envelope here, and it is free.
   *
   * THE BELLS ARE FAR AWAY AND THAT IS WHY THEY WORK. Inharmonic partials (2.04, 2.68, 3.42 — none of
   * them integer multiples of anything) so they clang rather than fuse into a pitch, a very long
   * decay, a high register, wide panning and a low gain. A struck resonant body is the accepted
   * category from Switzerland; the difference is that Switzerland's are ON the animal in front of you
   * and Italy's are half a mile off across a valley, which is entirely a matter of level and reverb.
   *
   * THE FOURTH IS MISSING FROM THE SCALE ON PURPOSE. [0, 2, 4, 7, 9, 11] is G major without its
   * fourth degree, which in a major key is the note that most easily sounds like a mistake when it
   * lands on its own with nothing resolving it. Six notes are plenty for a palette, and leaving out
   * the one that needs a harmonic context this engine cannot provide is cheaper than handling it.
   *
   * THE WIND IS ALMOST GONE, down from a peak of 0.3 to 0.16. Round three needed it as a floor
   * because the tremolo left gaps; the organ is a better floor than air, and layering both was
   * crowding. What is left is a slow warm movement rather than weather.
   *
   * THE LONGEST REVERB OF THE COUNTRIES AFTER SWITZERLAND, at 4.4 seconds, and the highest wet level
   * on the site. A stone church is mostly its own echo, and this texture is entirely held tones and
   * struck metal — the two things a long room flatters most.
   */
  italy: {
    rootHz: 98, // G2
    scale: [0, 2, 4, 7, 9, 11], // G major, fourth omitted
    voiceOctave: 2,
    degrees: [0, 12],
    /*
     * A distant bell. Inharmonic and slow, so it rings rather than strikes; `attack: 0.008` is soft
     * for a bell because distance and air absorb the very front of a transient before it arrives.
     */
    voice: {
      partials: [
        { r: 1, g: 1, d: 1 },
        { r: 2.04, g: 0.3, d: 0.6 },
        { r: 2.68, g: 0.18, d: 0.44 },
        { r: 3.42, g: 0.1, d: 0.3 },
        { r: 4.61, g: 0.05, d: 0.2 },
      ],
      attack: 0.008,
      hold: 0,
      decay: 5.4,
      detuneCents: 0,
      spread: 0.55,
    },
    gesture: 'single',
    gapMs: [2600, 5200],
    restChance: 0.2,
    drone: {
      ratios: [1, 1.5, 2, 1.5], // tonic – fifth – octave – fifth
      gapMs: [3600, 4800],
      level: 0.14,
      voice: {
        partials: [
          { r: 1, g: 1, d: 1 },
          { r: 2, g: 0.12, d: 0.9 },
          { r: 3, g: 0.5, d: 0.85 },
          { r: 4, g: 0.08, d: 0.8 },
          { r: 5, g: 0.3, d: 0.7 },
          { r: 6, g: 0.05, d: 0.6 },
          { r: 7, g: 0.14, d: 0.5 },
        ],
        attack: 0.9,
        hold: 5.5,
        decay: 2.6,
        detuneCents: 0,
        spread: 0.18,
      },
    },
    bed: { hz: 560, q: 1, level: 0.035, swayHz: 0.045, swayDepth: 90 },
    pad: { level: 0.03 },
    wind: {
      hz: 420,
      q: 0.5,
      swayHz: 0.05,
      swayDepth: 120,
      level: 0.16,
      floor: 0.5,
      gustS: [3.5, 7],
      calmS: [2, 5],
    },
    reverbS: 4.4,
    wet: 0.52,
    level: 0.41,
  },

  /*
   * SWITZERLAND — a herd that never stops, an alphorn a long way below, thin alpine air.
   *
   * THE HERD IS THE CHANGE, AND IT IS THE MOST OBVIOUSLY TRUE THING IN THIS FILE. Round two put cow
   * bells on the melody queue, so Switzerland was a bell every three to five seconds — which is the
   * sound of one cow being walked past a microphone. A real alpine pasture has forty animals in it,
   * all wearing bells, all grazing, and the bells never stop. Continuity was not something that had
   * to be invented for this country; it was something round two had removed.
   *
   * WHY THE HERD USES THE DRONE QUEUE'S IRREGULAR MODE. `gapMs` rather than `stepMs`, and
   * `pick: 'random'` rather than cycling, because a fixed period between two bells is a rhythm and
   * a fixed order of pitches is a figure. Neither is a herd. The `ratios` are three bells of
   * different sizes at wide panning and low level, which is what distance and a hillside do.
   *
   * THE MELODY BELLS STAY, CLOSER AND LOUDER, as the nearest animal in the field. That is the same
   * design as Japan's koto inside the wind: one voice near you, a lot of it further away.
   *
   * THE BELLS ARE THE ONLY INHARMONIC PARTIALS ON THE SITE and that is what makes them metal.
   * [1, 2.02, 2.41, 3.03, 4.18, 5.42] are not integer multiples of anything, so they do not fuse
   * into a single perceived pitch the way a string's harmonics do — which is exactly the clang of a
   * struck object, and why the same envelope over integer ratios would sound like a piano instead.
   * The high ones decay very fast (`d` down to 0.12), so the strike is bright and the ring is not.
   *
   * THE HORN NOW APPEARS ON ONE EVENT IN THREE RATHER THAN ONE IN SEVEN, and it is the country's
   * other answer to "slow": an alphorn is blown, so it has a 0.35 s attack and holds for 1.6 s
   * before it decays. A note that takes a third of a second to arrive cannot sound like an alert.
   *
   * THE HORN PLAYS ONLY THE NATURAL OVERTONE SERIES, AND THAT IS NOT AN AESTHETIC CHOICE. An
   * alphorn has no valves, holes or slide: the only notes available to a player are the harmonics
   * of the tube, so [2, 3, 4, 5, 6] × the fundamental is not a stylisation of alphorn music, it is
   * the complete set of pitches the instrument has. The fifth harmonic lands about 14 cents below
   * an equal-tempered A, and that flatness — the famous "alphorn-fa" is its neighbour — is left in
   * rather than corrected, because correcting it would mean deleting the one detail here that could
   * only have come from the real instrument.
   *
   * THE LONGEST REVERB OF THE SIX, at 5.2 seconds, and the widest panning. A held note in a valley
   * is mostly the valley. The wind is the highest and thinnest here too — 3400 Hz at a very low Q is
   * air rather than foliage, which is the correct reading above the treeline and the one thing worth
   * keeping from the original drone version.
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
    hornChance: 0.32,
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
    gapMs: [1600, 3400],
    restChance: 0.14,
    /* The herd: smaller bells, further off, at no particular interval. */
    drone: {
      ratios: [5.04, 6.73, 8.48], // three bell sizes, high above the horn's F2
      gapMs: [340, 1100],
      pick: 'random',
      level: 0.075,
      voice: {
        partials: [
          { r: 1, g: 1, d: 1 },
          { r: 2.07, g: 0.4, d: 0.42 },
          { r: 2.63, g: 0.26, d: 0.3 },
          { r: 3.41, g: 0.14, d: 0.2 },
          { r: 4.55, g: 0.07, d: 0.13 },
        ],
        attack: 0.002,
        hold: 0,
        decay: 1.5,
        detuneCents: 0,
        spread: 0.85,
      },
    },
    wind: {
      hz: 3400,
      q: 0.4,
      swayHz: 0.07,
      swayDepth: 700,
      level: 0.34,
      floor: 0.28,
      gustS: [2.2, 4.6],
      calmS: [0.8, 3.4],
    },
    bed: { hz: 2200, q: 0.5, level: 0.04, swayHz: 0.07, swayDepth: 380 },
    pad: { level: 0.025 },
    reverbS: 5.2,
    wet: 0.5,
    level: 0.53,
  },

  /*
   * UNITED STATES — open country, with a low string ringing in it.
   *
   * ============================================================================================
   * ROUND THREE PUT A BOTTLENECK SLIDE HERE AND IT WAS REJECTED ALONGSIDE ITALY'S TREMOLO. THEY
   * FAILED FOR THE SAME REASON, WHICH IS WHY THE TWO REPLACEMENTS SHARE A SHAPE.
   *
   * The claim was defensible: slide is documented across blues, gospel, country and Hawaiian steel,
   * it is a technique rather than a tune, and it is the one American guitar idiom that sustains and
   * moves instead of striking. All true, and none of it survives synthesis.
   *
   * A BOTTLENECK IS A NOISE INSTRUMENT. What identifies the sound is glass or steel dragging across
   * wound strings — friction, fret rattle, the pick attack underneath, and the string's own
   * nonlinearity as the tube loads it. The PITCH MOVEMENT is the least of it, and pitch movement is
   * the only part this engine can render. So what came out was a pure sine ensemble swooping between
   * two notes, which is not slide guitar. It is a theremin, or a sound effect, and once heard as a
   * swoop it cannot be heard as anything else.
   *
   * THE REVEALING DETAIL IS THAT `glideS` WAS THE ONLY MECHANISM ON THE SITE NOTHING ELSE USED. That
   * should have been the warning: the accepted textures all work by summing decaying sinusoids, and
   * this one needed a bespoke capability added to the engine to exist at all. A feature that only one
   * texture needs is usually a texture reaching outside what the engine honestly does.
   *
   * SO THE COUNTRY'S IDENTITY MOVES FROM A TECHNIQUE TO A SPACE, which is the more defensible claim
   * anyway. This is the one country too varied for any single instrument to represent, and it was
   * always the one whose atmosphere note is distance rather than a tradition. The wind was already
   * the widest and lowest here; now it leads, and one long-ringing open string sits inside it.
   * ============================================================================================
   *
   * THE WIND IS THE LEAD, AS IN JAPAN, AND IT IS THE OPPOSITE KIND OF WIND. Japan's is high, bright
   * and busy — small leaves, close by, gusting every couple of seconds. This one is low (320 Hz at a Q
   * of 0.35, which is a tilt rather than a filter), takes up to 8 seconds to build, and never fully
   * drops (`floor: 0.5`). That is weather crossing a lot of empty ground, and the contrast between the
   * two is the clearest demonstration that the wind layer is a real instrument here and not a preset:
   * same three nodes, entirely different place.
   *
   * THE STRING IS NOW BLOWN-LONG RATHER THAN STRUCK. `attack: 0.09` and `hold: 1.2` on a 5.8-second
   * decay is not how a guitar behaves — it is closer to a bowed or swelled note, and that is
   * deliberate. A hard transient is what makes a sparse note sound like an alert, and this is the
   * sparsest texture on the site (gaps of 3.2 to 6 seconds, the longest here). Softening the front of
   * each note is what lets it be that sparse without becoming a ringtone: the note arrives out of the
   * wind rather than on top of it. The wind, not the notes, is doing the continuity work.
   *
   * THE DYAD IS THE ONLY GESTURE LEFT, AND IT IS THE ONE THAT WAS NEVER THE PROBLEM. Root and fifth
   * together is what an open-tuned guitar mostly is: bare fifths with no third, so nothing declares
   * itself major or minor. The fifth is a FIXED SEVEN SEMITONES rather than three scale degrees — see
   * the gesture itself for why the scale-degree version was measurably wrong, and produced a tritone
   * a third of the time. Only the lower note of the pair comes from the scale.
   *
   * THE SCALE CARRIES ONE NOTE THE OTHERS DO NOT: the flat seventh (the 10). [0, 2, 4, 7, 9, 10] is
   * a major pentatonic with that added, which is the interval the whole American vernacular runs on
   * — blues, gospel, country and rock all lean on it. One semitone is doing more identifying work
   * here than any partial in the list, and it survives the rewrite because a scale is a palette
   * rather than a technique: it makes no claim the engine cannot honour.
   *
   * `detuneCents: 4` STAYS, though Italy's went. A twelve-string or a doubled course beating slowly is
   * audible on a note held for six seconds, where under a tremolo's amplitude flutter it was just more
   * flutter. The same number is honest in one context and mush in the other.
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
      attack: 0.09,
      hold: 1.2,
      decay: 5.8,
      detuneCents: 4,
      spread: 0.45,
    },
    gesture: 'dyad',
    gapMs: [3200, 6000],
    restChance: 0.18,
    wind: {
      hz: 320,
      q: 0.35,
      swayHz: 0.04,
      swayDepth: 140,
      level: 0.44,
      floor: 0.5,
      gustS: [3.5, 8],
      calmS: [1, 3.5],
    },
    bed: { hz: 700, q: 0.45, level: 0.045, swayHz: 0.09, swayDepth: 200 },
    pad: { level: 0.04 },
    reverbS: 3.6,
    wet: 0.44,
    level: 0.45,
  },
}

/*
 * ============================================================================================
 * THE SHELL — the home page, the passport, and anything else that is not a country.
 *
 * WHY THIS EXISTS AT ALL, GIVEN THAT THIS FILE USED TO ARGUE THE OPPOSITE AT LENGTH. The old rule
 * was "the shell is silent and the country speaks", presented as the audible half of the rule that
 * off a country route the accent falls back to neutral blue. The report was "there is no music on
 * the main page, we should have something like excitement music", and it is right in a way the rule
 * could not see: silence and broken are the same experience. A visitor presses the sound button on
 * the front page, hears nothing at all, and has no reason to imagine the button works elsewhere.
 * The rule was costing the feature its only introduction.
 *
 * ============================================================================================
 * ROUND THREE'S SHELL HAD A 500 MS PULSE AND IT WAS REJECTED. THE PULSE WAS THE WRONG ANSWER TO THE
 * RIGHT REQUEST, AND IT IS WORTH BEING PRECISE ABOUT WHY, BECAUSE THE REQUEST HAS NOT CHANGED.
 *
 * "Excitement" was asked for and a beat is the obvious way to supply it — so obvious that I did not
 * examine it. But a beat made of sine waves is not a drum. A drum is almost entirely transient and
 * noise: skin, air, and a body resonating for a fraction of a second. A three-partial sine pluck
 * repeating on an exact grid has none of that, and what it has instead is regularity, which the ear
 * locks onto immediately and then cannot ignore. It was the only thing on the site with a grid, and a
 * grid with no transient is a metronome. It also worked directly against the rest of the file, whose
 * whole method is that nothing shares a period.
 *
 * WHAT IS KEPT IS EVERYTHING THAT MADE IT EXCITED WITHOUT PERCUSSION. Tempo and direction were always
 * carrying that, not the click:
 *
 *   1. TEMPO. `gapMs: [520, 1050]`, which is between three and five times faster than any country,
 *      and `restChance: 0.07`, the lowest here. Things happening close together is most of it, and
 *      this is now the ONLY texture whose events are closer together than its own decay — so runs
 *      overlap each other continuously without any second queue being involved.
 *   2. RISING MOTION. `climb: true` biases the walk upward and sends it home to the BOTTOM of its
 *      range, so the texture keeps setting off from low down and reaching. Ascending figures are
 *      anticipation; descending ones are arrival, and arrival is what the country pages are for.
 *   3. A SHORT ROOM. 2.2 seconds against Switzerland's 5.2. A long tail is contemplative because it
 *      blurs events into each other; a short one leaves each one distinct and lets the next one
 *      matter. Reverb length is a tempo control as much as a space control.
 *   4. A BRIGHT SHIMMER INSTEAD OF A BASS PULSE. The bed is the highest and fastest-moving on the
 *      site — 1100 Hz sweeping 320 Hz at 0.19 Hz — which is air with light in it rather than a floor.
 *      It replaces the pulse as the continuous layer, and it does the same job (something is always
 *      sounding) without imposing a period on anything.
 *
 * THE CONTINUITY NOW COMES FROM THE NOTES THEMSELVES, which no other texture here can say. Every
 * other one needed a second layer because its notes are seconds apart; at 520–1050 ms against a
 * 2.4-second decay, three or four runs are always ringing at once. That is why removing the drone
 * queue costs this texture nothing, and why doing the same to any country would break it.
 *
 * THE TIMBRE IS DELIBERATELY NOT ANY COUNTRY'S. Bright, struck, fast-decaying, mostly integer
 * partials with two barely sharp at the top — a celesta or a glockenspiel, an instrument with no
 * national claim on it. It is also in the accepted category: a struck bar is a sum of decaying
 * sinusoids, which is precisely what this engine produces. The bare major pentatonic with a major
 * seventh added is the same decision: the most neutral bright scale available, chosen because it
 * belongs to nowhere in particular.
 * ============================================================================================
 */
const SHELL = {
  rootHz: 174.61, // F3
  scale: [0, 2, 4, 7, 9, 11],
  voiceOctave: 1,
  degrees: [0, 12],
  climb: true,
  voice: {
    partials: [
      { r: 1, g: 1, d: 1 },
      { r: 2, g: 0.44, d: 0.46 },
      { r: 3, g: 0.2, d: 0.32 },
      { r: 4, g: 0.11, d: 0.22 },
      { r: 5.02, g: 0.06, d: 0.15 },
      { r: 6.98, g: 0.03, d: 0.1 },
    ],
    attack: 0.002,
    hold: 0,
    // Longer than round three's 1.9, which is the compensation for losing the pulse: the notes now
    // have to overlap each other to be the continuous layer, and decay is what makes them overlap.
    decay: 2.4,
    detuneCents: 0,
    spread: 0.5,
  },
  gesture: 'sparkle',
  gapMs: [520, 1050],
  restChance: 0.07,
  bed: { hz: 1100, q: 0.7, level: 0.042, swayHz: 0.19, swayDepth: 320 },
  pad: { level: 0.02 },
  reverbS: 2.2,
  wet: 0.34,
  level: 0.96,
}

/**
 * The texture for a slug.
 *
 * EVERY ROUTE NOW HAS ONE, which is a change: this used to return `undefined` off a country route
 * and the engine played that as silence. Once the home page has sound, a silent passport page is no
 * longer a rule, it is the one broken page — so the shell texture covers the home page, the
 * passport and the not-found page alike. They are all the same state: not in a country.
 *
 * The engine still handles a null texture correctly, because `setTexture` is a public function and
 * "play nothing" has to remain expressible. It is simply no longer reachable from a route.
 */
export function textureFor(slug) {
  return TEXTURES[slug] ?? SHELL
}

/*
 * THE MASTER CEILING, and why it is this low.
 *
 * The intent is something a visitor notices they have stopped hearing rather than something they
 * hear start — audible on headphones or a decent laptop, and effectively absent on a phone speaker
 * in a room with other people in it.
 *
 * IT IS LOWER THAN THE DRONE VERSION'S, not higher, even though there is now far more going on. A
 * held tone at a given gain and a struck note at the same gain are not the same loudness: the note
 * has a transient, and transients are what the ear measures. Erring quiet is the correct direction
 * of error for a sound nobody asked to be loud — a visitor who wants more has an operating system
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
 *
 * THE MARGIN MATTERS MORE NOW THAN IT DID. The Swiss herd can strike every 340 ms and the shell's
 * runs arrive every 520 ms, so a lookahead shorter than the wake interval would drop notes rather
 * than merely placing them late.
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
 * reason to suspect it belongs to the country they left.
 *
 * IT IS MORE DANGEROUS AGAIN NOW. Under the drone version the textures were nearly interchangeable;
 * under this one they are high leaf wind, a plucked tanpura, a held organ, a herd of bells and low
 * open-country air, so a mis-tuned graph is not a subtle wrongness — the shell's tempo under a country
 * page is roughly four times too fast to be mistaken for anything else. The more distinct the textures
 * get, the worse the consequence of this bug and the more the two variables earn their keep.
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
 * THE MELODIC STATE. Where the walk currently is, and when the next event, the next drone pluck and
 * the next gust are due on the audio clock.
 *
 * Module scope rather than inside the graph, because it is reset by a country change while the
 * graph survives one. Zeroed by `tune`.
 */
let degree = 0
let nextEventS = 0
let nextDroneS = 0
let nextGustS = 0
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

/* A random float in [min, max). Used for timing, panning and gust shape, never for pitch. */
function between(min, max) {
  return min + Math.random() * (max - min)
}

/*
 * A four-second buffer of pink-ish noise, generated once per source and looped.
 *
 * WHY PINK AND NOT WHITE. White noise has equal energy per hertz, so half of it is in the top
 * octave and it reads as hiss — the sound of a broken thing. Pink noise has equal energy per
 * octave, which is roughly how the ear divides the spectrum, and reads as rain, wind or a room.
 * Every natural ambience is closer to pink, and wind through leaves is about as pink as sound gets.
 *
 * The filter is Paul Kellet's well-known economical approximation: seven one-pole lowpasses summed
 * with fixed coefficients, accurate to about ±0.05 dB across the audible band.
 *
 * WHY FOUR SECONDS AND WHY A LOOP IS SAFE HERE. A looping buffer normally needs its ends matched or
 * the seam clicks. Noise has no waveform to match — the discontinuity at the loop point is itself
 * indistinguishable from noise.
 *
 * CALLED THREE TIMES NOW, NOT ONCE, and each call must generate fresh samples rather than share a
 * buffer. Two of them feed the wind's left and right sides, and identical noise in both channels is
 * not quiet wind in stereo, it is a point source in the middle of your head. Decorrelation is the
 * entire mechanism by which noise acquires width.
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
 *   notes ─ voiceBus ─┬─ dryGain ───────────────────────────┐
 *                     └─ wetGain ─ damp ─ convolver ────────┤
 *                                                           ├─ limiter ─ master ─ destination
 *   noise ─ bandpass ─ bedGain ──────────────────────────────┤
 *   gustL ─ panL ─┐                                          │
 *   gustR ─ panR ─┴ windFilter ─ windGain ───────────────────┤
 *   root  ─┐                                                 │
 *   fifth ─┴ padFilter ─ padGain ────────────────────────────┘
 *
 *   sway     ─ swayGain     ─▶ bandpass.frequency      (audio-rate connections to parameters)
 *   windSway ─ windSwayGain ─▶ windFilter.frequency
 *
 * THOSE LAST TWO LINES ARE THE ONE UNFAMILIAR IDEA. In Web Audio an `AudioParam` is itself a
 * destination: connecting an oscillator to `windFilter.frequency` adds that oscillator's output to
 * the parameter every sample. That is how a 0.13 Hz sine — far below hearing, and inaudible on its
 * own — becomes a slow brightening and dimming of the wind rather than a tone. It runs on the audio
 * thread, so it does not stutter when the main thread is busy laying out a page, which a
 * `setInterval` doing the same job absolutely would.
 *
 * WHY THE WIND HAS TWO SOURCES AND THE BED HAS ONE. The bed is a floor and can be mono; the wind is
 * meant to be around the listener, and two independently-generated noise buffers panned hard apart
 * is the whole of how that is achieved. They meet at one filter afterwards, which processes both
 * channels independently, so a single band and a single sway oscillator serve both sides.
 *
 * NOTE THE BED, THE WIND AND THE PAD ALL BYPASS THE REVERB. Sending continuous noise into a
 * five-second convolution costs real CPU and changes nothing audible — noise has no transients for a
 * room to respond to, and its own filter is already the only spectrum that matters. Only the notes
 * are sent, which is also why the wet level can be as high as 0.5 without the mix turning to soup.
 *
 * THE LIMITER IS INSURANCE, NOT COMPRESSION, and it earns its place more than it did. Notes are
 * scheduled independently across three queues now: a bell cluster landing on top of a still-ringing
 * horn, two herd bells and a full gust is no longer rare. A compressor with a high threshold and a
 * fast attack does nothing at all until that happens. Getting this wrong is audible as a click, on a
 * feature whose entire justification is that it is pleasant.
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

  /* ---- the static noise bed ---- */
  const noise = context.createBufferSource()
  noise.buffer = makeNoiseBuffer(context)
  noise.loop = true

  const bandpass = context.createBiquadFilter()
  bandpass.type = 'bandpass'

  const bedGain = context.createGain()
  bedGain.gain.value = 0

  noise.connect(bandpass).connect(bedGain).connect(limiter)

  /* ---- the wind: two decorrelated sides, one band, one gusting gain ---- */
  const windFilter = context.createBiquadFilter()
  windFilter.type = 'bandpass'

  const windGain = context.createGain()
  windGain.gain.value = 0
  windFilter.connect(windGain).connect(limiter)

  const gustL = context.createBufferSource()
  gustL.buffer = makeNoiseBuffer(context)
  gustL.loop = true
  const panL = context.createStereoPanner()
  panL.pan.value = -0.8
  gustL.connect(panL).connect(windFilter)

  const gustR = context.createBufferSource()
  gustR.buffer = makeNoiseBuffer(context)
  gustR.loop = true
  const panR = context.createStereoPanner()
  panR.pan.value = 0.8
  gustR.connect(panR).connect(windFilter)

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

  const windSway = context.createOscillator()
  windSway.type = 'sine'
  const windSwayGain = context.createGain()
  windSwayGain.gain.value = 0
  windSway.connect(windSwayGain).connect(windFilter.frequency)

  /*
   * The continuous sources are started once and never stopped. A stopped
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
  gustL.start()
  gustR.start()
  root.start()
  fifth.start()
  sway.start()
  windSway.start()

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
    windFilter,
    windGain,
    windSway,
    windSwayGain,
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
 * Six oscillators per note sounds extravagant and is not — even at the shell's tempo this peaks
 * around forty simultaneous oscillators, which is roughly what a single video frame's worth of
 * layout costs.
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
 *
 * NO NOTE HERE CHANGES PITCH WHILE IT SOUNDS, and that is now a rule rather than an omission. Round
 * three added a `fromHz` parameter and a per-voice `glideS` for the American bottleneck slide — an
 * exponential ramp on every partial's frequency, by ratio rather than by hertz so the timbre held
 * together. It worked exactly as designed and was rejected, because a moving sine ensemble is a
 * theremin and not a slide guitar: the friction and rattle that identify a bottleneck are the parts
 * this engine cannot produce, so all that arrived was the swoop.
 *
 * IT WAS ALSO THE ONLY MECHANISM IN THE ENGINE THAT SERVED A SINGLE TEXTURE, which in hindsight was
 * the warning. Everything else here is shared by every voice. Both the parameter and the field are
 * deleted rather than left unused, so the next texture cannot reach for them by accident.
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
 *
 * `STEPS_UP` IS THE SHELL'S VERSION AND THE ONLY ASYMMETRIC ONE. Eight of its twelve tokens rise,
 * and the pull home goes to the BOTTOM of the range rather than to a tonic in the middle of it, so
 * the texture repeatedly sets off from low down and climbs. Combined with the reflection at the top,
 * that produces rising runs that fall back and start again — which is what anticipation sounds like,
 * and the reason the shell needs no other mechanism to be read as excited.
 */
const STEPS = [-3, -2, -1, -1, -1, -1, 1, 1, 1, 1, 2, 3]
const STEPS_UP = [-2, -1, -1, -1, 1, 1, 1, 1, 2, 2, 2, 3]

function walk(texture) {
  const [low, high] = texture.degrees

  if (Math.random() < 0.17) {
    // Home. For a climbing texture that is always the bottom of the range, so the next figure has
    // somewhere to go; otherwise it is the tonic or the octave above it, either of which resolves.
    if (texture.climb) degree = low
    else degree = Math.random() < 0.5 ? low : Math.min(high, low + texture.scale.length)
    return degree
  }

  const steps = texture.climb ? STEPS_UP : STEPS
  const step = steps[Math.floor(Math.random() * steps.length)]
  let next = degree + step
  if (next < low || next > high) next = degree - step
  degree = Math.min(high, Math.max(low, next))
  return degree
}

/*
 * WHERE A MULTI-NOTE FIGURE CAN START, given that it needs `rise` degrees of room above it.
 *
 * THIS EXISTS BECAUSE THE OBVIOUS SPELLING IS WRONG IN A WAY THAT IS HARD TO HEAR. Three gestures
 * needed headroom and all three originally clamped each note into range individually — which near the
 * top of the range turns a three-note figure into the same note three times, and near the bottom
 * turned a slide into a glide from a pitch to itself. Measured: only 45 of 88 shell runs actually
 * ended higher than they began, and 12 of 30 slide oscillators travelled by a ratio of exactly 1.000.
 * Both read as "the gesture is quietly not happening" rather than as a bug.
 *
 * MOVING THE WHOLE FIGURE PRESERVES ITS SHAPE; CLIPPING IT DESTROYS IT. That is the same reasoning
 * as the walk's reflection at the edges, and the two together mean no gesture ever degenerates.
 *
 * ONLY THE SHELL'S RUN STILL CALLS THIS, since the arpeggio and the slide were deleted in round four.
 * It stays a named function rather than being inlined because the mistake it prevents is one anybody
 * adding a multi-note gesture will make, and the two measurements above are the argument.
 *
 * The lower guard is not currently reachable — every range here is at least twelve degrees and the
 * largest figure spans four — but a narrower range would otherwise return a negative index, and
 * `degreeHz` floor-divides on the assumption that indices are non-negative.
 */
function clampFigure(texture, index, rise) {
  const [low, high] = texture.degrees
  return Math.max(low, Math.min(index, high - rise))
}

/*
 * ONE EVENT, which is a gesture rather than a note — see `gesture` in the texture notes.
 *
 * Returns nothing; everything is scheduled onto the audio clock at or after `atS`.
 */
function playEvent(g, texture, atS) {
  if (Math.random() < texture.restChance) return

  const { voice, gesture } = texture

  if (gesture === 'sparkle') {
    /*
     * THE SHELL. Two or three notes in a fast rising run, 90 ms apart, and the walk is left standing
     * at the TOP of the run rather than where it started — so the next event carries on from there
     * instead of resetting, and figures accumulate upward until the range or the pull home stops
     * them. That accumulation across events, not the run itself, is what makes it sound eager.
     *
     * THE RUN SLIDES DOWN TO FIT RATHER THAN CLAMPING AT THE TOP, which is the same correction the
     * slide above needed and the same one the walk has always made by reflecting. Clamping each note
     * into range turns a run that starts near the ceiling into the ceiling note played two or three
     * times — measured as only 45 of 88 runs actually ending higher than they began, where the answer
     * should be all of them. Moving the whole figure down keeps its shape; clipping it destroys it.
     */
    const notes = 2 + Math.floor(Math.random() * 2)
    const rise = (notes - 1) * 2
    const start = clampFigure(texture, walk(texture), rise)
    for (let i = 0; i < notes; i += 1) {
      playNote(g, voice, degreeHz(texture, start + i * 2), atS + i * 0.09, 0.15 - i * 0.03)
    }
    degree = start + rise
    return
  }

  if (gesture === 'dyad') {
    /*
     * THE UNITED STATES. Root and fifth together, which is what an open-tuned guitar mostly is: bare
     * fifths with no third, so nothing declares itself major or minor.
     *
     * THE FIFTH IS A FIXED INTERVAL, NOT A SCALE STEP, AND GETTING THAT WRONG WAS A REAL BUG. This
     * used to read `index + 3` and claim in a comment that "three degrees up is the fifth in every
     * position this one is used at". It is not, and the arithmetic is not close: in [0, 2, 4, 7, 9, 10]
     * three degrees up is 7 semitones from degrees 0 and 1, but a FOURTH (5) from degrees 3 and 4 and a
     * TRITONE (6) from degrees 2 and 5. Only five of the thirteen positions in range were fifths.
     *
     * A tritone is the exact opposite of what the gesture is for. The whole point of a bare fifth is
     * that it commits to nothing; a tritone is the most committed interval in Western music, and the
     * one thing it cannot sound like is open country.
     *
     * SO THE UPPER NOTE IS SEVEN SEMITONES UP, FULL STOP, and that is not a compromise — it is what
     * the instrument being alluded to physically does. A hand barred across two strings tuned a fifth
     * apart moves in PARALLEL: the interval is a property of the tuning, not of the key, which is why
     * open-tuned playing gives you the same fifth wherever you put your hand. Requiring both notes to
     * be scale members was the error, because the companion note of a drone fifth was never a melody
     * note in the first place.
     *
     * (The old comment's stated reason for avoiding a 1.5 ratio does not survive either: an
     * equal-tempered fifth and a just one differ by 2 cents, which is inaudible. The reason to write
     * it as 2^(7/12) is simply that every other pitch here is derived in semitones.)
     *
     * THE 35 MS OFFSET IS NOT A FLOURISH. Two notes started at the identical sample sum into one
     * spectrum and read as a single chord voice; a few tens of milliseconds apart, the ear hears two
     * strings, because that is the only spread a hand across two courses actually produces.
     */
    const rootFreqHz = degreeHz(texture, walk(texture))
    playNote(g, voice, rootFreqHz, atS, 0.19)
    playNote(g, voice, rootFreqHz * 2 ** (7 / 12), atS + 0.035, 0.14)
    return
  }

  if (gesture === 'cluster') {
    /*
     * SWITZERLAND, the near animal. One to three bells, unevenly spaced, and now a horn underneath
     * one event in three.
     *
     * The spacing is random within each cluster rather than fixed, because a fixed gap between two
     * bells is a rhythm and a herd is not rhythmic. The horn is scheduled slightly BEFORE the bells
     * so its slow attack has already begun when they strike, which is what makes it read as
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
 * THE WIND GAIN IS THE ONE PARAMETER THAT NEEDS CANCELLING RATHER THAN SETTING, because it is the
 * only one under a running chain of scheduled ramps. `setValueAtTime` alone would be overwritten by
 * the previous country's gusts, which are already queued out to several seconds ahead — so the queue
 * has to be discarded and the parameter pinned before the new country's first gust is scheduled.
 * This is the same hazard `rampTo` documents for the master gain, in the one other place it arises.
 *
 * THE CONVOLVER BUFFER IS REPLACED HERE, which is a heavier operation than setting a parameter and
 * is the reason a country change dips through silence rather than gliding. Assigning
 * `convolver.buffer` takes effect immediately rather than at `at`, so any tail still ringing is cut
 * — inaudible only because the master gain is already at zero by the time this runs.
 *
 * `nextEventS` IS DELIBERATELY SET INTO THE FUTURE. Starting the first note at the bottom of the
 * dip would mean the new country's first note fading in from nothing, which wastes the one note a
 * visitor is most likely to actually notice. Half a fade-in later, the gain is most of the way up.
 * The drone and the wind start almost immediately by contrast, because they are the floor: they
 * should already be there when the first note lands on top of them.
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

  const wind = texture.wind
  g.windGain.gain.cancelScheduledValues(at)
  if (wind) {
    g.windFilter.frequency.setValueAtTime(wind.hz, at)
    g.windFilter.Q.setValueAtTime(wind.q, at)
    g.windSway.frequency.setValueAtTime(wind.swayHz, at)
    g.windSwayGain.gain.setValueAtTime(wind.swayDepth, at)
    g.windGain.gain.setValueAtTime(wind.level * wind.floor, at)
  } else {
    g.windSwayGain.gain.setValueAtTime(0, at)
    g.windGain.gain.setValueAtTime(0, at)
  }

  g.root.frequency.setValueAtTime(texture.rootHz, at)
  g.fifth.frequency.setValueAtTime(texture.rootHz * 1.5, at)
  g.padGain.gain.setValueAtTime(texture.pad.level, at)

  g.wetGain.gain.setValueAtTime(texture.wet, at)
  g.convolver.buffer = makeReverbBuffer(g.context, texture.reverbS)

  degree = texture.degrees[0]
  droneStep = 0
  nextEventS = at + FADE_IN * 0.5
  nextDroneS = at + 0.15
  nextGustS = at + 0.1
}

/*
 * THE SCHEDULER. Wakes four times a second, fills the next `SCHEDULE_AHEAD_S`.
 *
 * THREE INDEPENDENT QUEUES, and their independence is the design rather than an implementation
 * detail. India's tanpura is not part of its melody: the cycle keeps its own steady period while the
 * flute above it is irregular, which is what the two instruments actually do. The Swiss herd is not
 * part of the near bells. A gust is not on anybody's beat. Sharing one queue would force all of them
 * onto a common grid, and a common grid is audible as a rhythm within about half a minute — which
 * is exactly the thing this file is trying not to be.
 *
 * THE GUST QUEUE SCHEDULES AUTOMATION RATHER THAN NOTES, which is the only queue that does. Each
 * pass appends a rise and a fall to `windGain`, and because scheduled ramps CHAIN from whatever the
 * previous one left behind, the result is one continuous curve rather than a series of jumps. That
 * chaining is also why `tune` has to cancel the queue explicitly: there is no other way to interrupt
 * a curve that is already several seconds long.
 *
 * WHY GUSTS ARE ALLOWED TO OVERLAP. `calmS` can be shorter than the fall it follows, so the next
 * rise is appended before the previous fall has finished — a rise from partway down instead of from
 * the floor. Real wind does exactly that, and it is the difference between weather and a tremolo.
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
  if (nextGustS < now) nextGustS = now + 0.05

  while (nextEventS < until) {
    playEvent(graph, wanted, nextEventS)
    nextEventS += between(wanted.gapMs[0], wanted.gapMs[1]) / 1000
  }

  const drone = wanted.drone
  if (drone) {
    while (nextDroneS < until) {
      const ratio =
        drone.pick === 'random'
          ? drone.ratios[Math.floor(Math.random() * drone.ratios.length)]
          : drone.ratios[droneStep % drone.ratios.length]
      playNote(graph, drone.voice, wanted.rootHz * ratio, nextDroneS, drone.level)
      droneStep += 1
      nextDroneS += drone.stepMs
        ? drone.stepMs / 1000
        : between(drone.gapMs[0], drone.gapMs[1]) / 1000
    }
  }

  const wind = wanted.wind
  if (!wind) return
  while (nextGustS < until) {
    const peak = wind.level * between(0.4, 1)
    const rise = between(wind.gustS[0], wind.gustS[1])
    // A gust falls away more slowly than it arrives — the leading edge is the front of the moving
    // air and the tail is it dispersing, which takes longer.
    const fall = rise * between(1.1, 2.2)
    graph.windGain.gain.linearRampToValueAtTime(peak, nextGustS + rise)
    graph.windGain.gain.linearRampToValueAtTime(wind.level * wind.floor, nextGustS + rise + fall)
    nextGustS += rise + fall + between(wind.calmS[0], wind.calmS[1])
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
 * Change which texture is playing. Safe to call when disabled and before anything is built.
 *
 * EVERY ROUTE HAS A TEXTURE NOW, so the null path below is no longer reached from navigation — see
 * `textureFor`. It is kept because "play nothing" must stay expressible on a public function, and
 * because it is what the fade-out on disable shares.
 *
 * WHY A CHANGE DIPS THROUGH SILENCE RATHER THAN GLIDING. Retuning in place would leave the previous
 * texture's notes ringing in the previous texture's reverb while the new scale started underneath
 * them, which is two pieces of music at once. Down, retune while inaudible, back up — which is also
 * what the page transition does visually, and the two now agree. It matters more with a wind layer
 * than it did without one: a gust queue is scheduled seconds ahead, so a glide would have two
 * countries' weather overlapping for as long as the longest outstanding ramp.
 */
export function setTexture(texture) {
  wanted = texture ?? null

  if (!graph) return

  if (!isEnabled || !wanted) {
    /*
     * The clock stops when there is nothing to play. Without this, a silent route would keep
     * scheduling the last texture's notes into a master gain of zero: inaudible, and a pure waste of
     * a wake-up every 250 ms plus the oscillators to go with it.
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
   * gain a second time. It matters for a third reason now — the shell texture is one shared object,
   * so moving between the home page and the passport is a no-op rather than a needless dip.
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
