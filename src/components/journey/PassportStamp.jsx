import { codeFor } from "../../lib/countryCode";

/*
 * PassportStamp — the mark a country leaves on the page, drawn rather than photographed.
 *
 * ============================================================================================
 * WHY THIS IS CSS AND NOT ARTWORK, WHICH IS NOT A PREFERENCE BUT THE ONLY OPTION.
 *
 * The workbook has a `passport_stamp_image` column, it names a file for all five countries, and not
 * one of them can ever ship: every supplied stamp graphic carries a stock-library watermark burned
 * into it ("123RF", "dreamstime.com"). The pipeline excludes them by pattern, so `images.stamp` is
 * null for all five countries and will stay null. Publishing a watermarked image is not something a
 * component can decide to do anyway.
 *
 * So the stamp is drawn. That turns out to be better than the artwork would have been for a reason
 * unrelated to licensing: a drawn stamp takes the country's own accent colour, and five photographs
 * of rubber stamps would each carry whatever ink the stock photographer used. Colour on this site
 * identifies a country (§7.4 — categorical identity, never magnitude), and a stamp in the wrong red
 * would be the one element on a country's page not speaking its colour.
 *
 * WHY THE STAMP IS NOT PLACED OVER THE PHOTOGRAPH, which is where a real one would be.
 *
 * Because its contrast could not then be measured. Text over a photograph has a different ratio at
 * every pixel and changes with the crop; Principle 16 requires contrast to be verified by
 * measurement rather than by eye, and "it looked readable on the Swiss one" is exactly the
 * verification that fails on the next image. On the cream page surface every country's
 * `--accent-ink` measures between 5.09:1 (Switzerland) and 10.34:1 (United States), all clearing the
 * 4.5:1 needed for text this small. A photographic backdrop would forfeit that guarantee for an
 * effect worth less than it.
 *
 * WHAT IT SAYS, AND WHY THAT TEXT AND NOT MORE.
 *
 * A stamp answers where and when. So: the country's three-letter code, and the dates of the stay.
 * Nothing else fits at this size, and nothing else is a stamp's job — an epithet or a metric inside
 * a stamp would make it a badge, and a badge is one step from a rating.
 *
 * AN UNPRESSED SLOT SAYS NEITHER, because it has nothing to say yet — it shows its stop number in
 * place of the code and a ruled line in place of the dates. The reason it is not the code is a
 * concealment one and is set out at that branch below.
 *
 * IT IS REAL TEXT AND IS NOT `aria-hidden`, which looks wrong for something this decorative and is
 * the right call for one reason: this stamp is the ONLY place its row states the code and the dates.
 * Hiding it would delete information for a screen-reader user rather than deduplicate it — the test
 * being whether the same fact is stated in words elsewhere in the row, and here it is not. (Contrast
 * the journal's own slot, which DID duplicate the code in an `sr-only` span and announced it twice;
 * see the note at that site.) The rule the project follows throughout is that anything carrying
 * information does so as text; the consequence here is that the decorative-looking element is the one
 * that must stay announced.
 *
 * THE ROTATION IS PER-POSITION, NOT PER-COUNTRY, and that distinction is what keeps it inside the
 * no-branching rule. `ROTATIONS` is indexed by where the stop falls in the itinerary, so it says
 * "the third stamp sits at -2.5°" rather than "Italy's stamp sits at -2.5°". A sixth country would
 * be pressed at the first angle again, which is right: the angles are a hand-pressing artefact and
 * carry no meaning about the place.
 * ============================================================================================
 */

/*
 * Five angles, none of them zero and none of them equal.
 *
 * A stamp that lands perfectly square reads as a UI badge; a set of stamps all at the same angle
 * reads as a template. Small values (2–5°) because the stamp has to stay legible — past about 6° the
 * text starts to feel like a graphic rather than something to read.
 *
 * Indexed modulo the list length so any number of stops is safe. `index` is zero-based, which is why
 * the caller passes `arrivalOrder - 1` rather than `arrivalOrder`.
 */
const ROTATIONS = [-4, 3.5, -2.5, 4.5, -3];

/*
 * ============================================================================================
 * THE UNPRESSED STATE, ADDED FOR THE JOURNAL, AND WHAT IT IS FOR.
 *
 * The journey's closing claim is that the journal started empty. That claim needs a picture of empty
 * — five outlines waiting to be filled — and the honest way to draw it is with the same component
 * that draws the filled ones, in a weaker state. Two separate components would be two things that
 * could drift apart, and the whole point is that the visitor recognises the "after" as the same
 * object as the "before".
 *
 * WHAT CHANGES WHEN UNPRESSED, AND WHY EACH IS A SEPARATE DECISION:
 *
 *   THE BORDER BECOMES DASHED. A solid faint border reads as a disabled control; a dashed one reads
 *   as a space reserved for something. That is the difference between "you cannot have this" and
 *   "this is not filled in yet", and it is the entire emotional content of the empty journal.
 *
 *   THE SECOND RING GOES. A double ring is the mark a stamp leaves. An empty slot has not been
 *   stamped, so it has no impression — only the outline of where one will go.
 *
 *   THE LABEL STAYS, AT FULL OPACITY-ADJUSTED CONTRAST — but it is the STOP NUMBER, not the country
 *   code. This clause used to read "the visitor has to be able to read which five places are coming",
 *   which is no longer the design: the itinerary is withheld until each stop is reached, and the code
 *   gave it away (see the branch below). What must not be weakened past legibility is whatever label
 *   is there, so the five slots stay distinguishable. See the contrast note on UNPRESSED_INK below.
 *
 *   THE DATES GO, REPLACED BY NOTHING. A stamp records when you were somewhere. Printing "Days 1–6"
 *   inside an unpressed outline would state a fact about a visit that has not happened — the same
 *   class of dishonesty as the derived `travelled` list this journal was built to replace. The empty
 *   slot says which slot it is, and nothing else.
 *
 * WHY IT IS A PROP ON THIS COMPONENT RATHER THAN A `JournalStamp` WRAPPER: the rotation table, the
 * code lookup and the ring geometry are all here, and a wrapper would either duplicate them or
 * import them, which is two files to keep in step for one boolean.
 *
 * ============================================================================================
 * `showDates` — AND THE DEFECT THAT PRODUCED IT, WHICH IS WORTH THE SPACE.
 *
 * The unpressed state above was designed carefully and the pressed state was left alone, on the
 * assumption that the two would then be the same size. They were not, and the symptom only appeared
 * once a journal was rendered with all five stamps actually pressed — which first happened at the very
 * end of the journey, the least-visited screen on the site.
 *
 * WHAT WENT WRONG. A pressed stamp prints its dates; an unpressed one prints a ruled line instead. In
 * the passport page's wide rows "Days 14–19" fits on one line and the two states match. In a journal
 * slot the column is ~85px, so the dates WRAPPED TO TWO LINES — taking the pressed stamp to 68–71px
 * inside the 48px box built to hold a 43.8px one. Measured, not guessed: JPN 70.8, IND 68.2, ITA 68.9,
 * CHE 69.4, USA 69.5. The stamps overhung their slots, sat on the country names beneath them, and did
 * so by a different amount each, so the five labels went ragged — the exact defect the fixed-height box
 * was introduced to prevent, reappearing from the other side.
 *
 * AND IT WAS AUDIBLE AS WELL AS VISIBLE. The slot prints the itinerary dates under the stamp, so with a
 * pressed stamp the accessible name read "JPN DAYS 1–6 Japan DAYS 1–6" — verified by reading the
 * accessibility tree. Same class of duplication as the `sr-only` code the journal already removed, and
 * arrived at the same way: two elements each correct alone, both stating one fact.
 *
 * WHY THE FIX IS TO SUPPRESS THE DATES RATHER THAN TO STOP THEM WRAPPING. `whitespace-nowrap` was
 * measured too — it takes the stamp to 54–56px tall and up to 94.7px WIDE inside an 84.9px column, so
 * it trades a vertical overflow for a horizontal one. And it would be fixing the wrong thing: in the
 * journal the dates are already printed, on the page, beneath the stamp, deliberately (see the note at
 * that site on why the itinerary's dates are a plan rather than a claim). A stamp does answer "when" —
 * but only where nothing else has. Here something else has.
 *
 * WHAT `showDates={false}` DRAWS: the code, and nothing else, in either state. The ruled line goes too,
 * because its whole job was to hold the height of a dates line that is no longer there — a blank rule
 * inside a stamp that has been pressed would read as a field somebody forgot to fill in. So the two
 * states become geometrically identical and differ only in ink, dash and ring, which is what the
 * journal's argument wanted all along: the same object, before and after.
 *
 * DEFAULT TRUE, so the passport page's stops list — where the stamp IS the only statement of the dates,
 * and where they have room to fit on one line — is unchanged.
 * ============================================================================================
 */

/*
 * THE UNPRESSED OUTLINE'S COLOUR, AND WHY IT IS `ink-400` RATHER THAN THE COUNTRY ACCENT AT LOW
 * OPACITY.
 *
 * The instinct was `--row-ink` at ~35% opacity, which looks right and fails a measurement. An opacity
 * on a colour is a NEW colour and has to be measured as one: the weakest accent (India's #B4530A at
 * 4.79:1) taken to 35% over cream composites to roughly #E4C9AF, which is about 1.4:1 — invisible as
 * text. Even the strongest accent lands near 2:1.
 *
 * `ink-400` (#8a8178, 3.65:1 against the page) is the project's designated colour for "large or UI
 * text only, never body". The code is set at 16px SEMIBOLD, which WCAG counts as large text at a 3:1
 * threshold — so this clears it with margin, and it is the same grey used for the numbered stops on
 * the home page's itinerary. The country's colour is what arrives WITH the stamp when it is pressed,
 * which makes the accent the reward rather than the placeholder.
 */
const UNPRESSED_INK = "var(--color-ink-400)";

export function PassportStamp({
  country,
  index,
  pressed = true,
  /*
   * Whether the impression carries the dates. See the header note — this exists because the journal
   * already prints them beneath the slot, so a stamp that repeated them overflowed its box and said
   * everything twice out loud. Default true: on the passport page the stamp is the only place the
   * dates appear.
   */
  showDates = true,
}) {
  const rotation = ROTATIONS[index % ROTATIONS.length];

  if (!pressed) {
    return (
      <span
        className="inline-block rounded-md border-2 border-dashed px-3 py-1.5 text-center"
        style={{
          borderColor: UNPRESSED_INK,
          color: UNPRESSED_INK,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {/*
         * ==========================================================================================
         * AN UNPRESSED SLOT SHOWS ITS STOP NUMBER, NOT ITS COUNTRY CODE, and that difference between
         * the two states is the whole point rather than an inconsistency.
         *
         * A PRESSED stamp prints `JPN`, because the visitor has been to Japan and the impression is a
         * record of it. An UNPRESSED one printed `JPN` too, which gave the country away: the itinerary
         * is withheld until each stop is reached (see HiddenName), and `USA` is simply how most people
         * write "United States" while `JPN`, `IND` and `ITA` are the first three letters of the names
         * they were standing in for. The journal draws five of these outlines on the home page, so the
         * cover was captioning its own hidden signpost with the answer.
         *
         * The number does the same layout job the code did — three or four characters at the same size
         * in the same box, so the outline and the impression stay the same shape — and it says only
         * what the slot's position in the row already says.
         * ==========================================================================================
         */}
        <span className="block font-display text-base font-semibold leading-none tracking-[0.14em] tabular-nums">
          {String(country.arrivalOrder).padStart(2, "0")}
        </span>
        {/*
         * A ruled line where the dates will be, rather than the dates themselves or empty space.
         *
         * Empty space collapses the outline to a different height than a pressed stamp, so the five
         * slots would not be the same size as the five marks that replace them — and the journal's
         * whole argument is that these are the same objects before and after. A short rule holds the
         * exact height of the dates line and reads as a blank waiting to be filled.
         *
         * SO IT IS DRAWN ONLY WHEN THE PRESSED STAMP WOULD HAVE DATES TO HOLD THE HEIGHT OF. With
         * `showDates={false}` there is no dates line in either state, and a rule reserving space for
         * something that never arrives would read as a field left unfilled inside a stamp that has
         * been pressed. The condition keeps the two states the same height, which was the rule's only
         * job in the first place.
         *
         * `aria-hidden` because it carries nothing: it is the absence of information, and a screen
         * reader announcing it would be describing the stationery.
         */}
        {showDates ? (
          <span
            aria-hidden="true"
            className="mx-auto mt-1.5 block h-px w-8 bg-current opacity-60"
          />
        ) : null}
      </span>
    );
  }

  return (
    /*
     * `--row-ink` rather than an interpolated Tailwind class, which is the one thing about Tailwind
     * worth re-stating at every dynamic colour on this site: classes are compiled by scanning source
     * text, so `text-[${country.atmosphere.ink}]` is a class that is never generated and silently
     * does nothing. `text-[var(--row-ink)]` is a fixed string the compiler can see, with only the
     * value varying at runtime.
     *
     * `inline-block` so the rotation happens about the stamp's own box rather than a full-width one —
     * a rotated block element would swing its far edge a long way and could overlap its neighbour.
     */
    <span
      className="inline-block rounded-md border-2 border-[var(--row-ink)] px-3 py-1.5 text-center text-[var(--row-ink)]"
      style={{
        "--row-ink": country.atmosphere.ink,
        transform: `rotate(${rotation}deg)`,
        /*
         * The double ring, drawn with a box-shadow rather than a second element.
         *
         * A real stamp has two concentric lines. `inset` puts the second line just inside the border,
         * and because a box-shadow does not affect layout, the stamp's size stays exactly what the
         * padding says — a nested element with its own border would make every stamp 4px larger and
         * push the two rings apart unevenly at different font sizes.
         *
         * `currentColor` inherits the country accent already set on this element, so the inner ring
         * cannot drift out of step with the outer one.
         */
        boxShadow: "inset 0 0 0 1px currentColor",
      }}
    >
      {/*
       * The code, and the largest thing in the stamp. `tracking` opened up because three letters at
       * this weight otherwise read as one word — spacing is what makes a code look like a code.
       *
       * `tabular-nums` is NOT set here and is on the dates line below: this line has no digits, and
       * the dates do.
       */}
      <span className="block font-display text-base font-bold leading-none tracking-[0.14em]">
        {codeFor(country)}
      </span>

      {/*
       * The dates, in the chapter's own words ("Days 1–6").
       *
       * DIGITS RATHER THAN SPELLED-OUT WORDS, which is the opposite of the rule the site's prose
       * follows. The distinction the project actually applies is "said, spell it; shown, show it" —
       * this is a printed impression on a document, and no stamp has ever read "days one to six".
       *
       * `ink-500` (5.63:1) rather than the accent for this line: two weights of the same colour at
       * two sizes inside a small box reads as one blurred mass, and the code is what the eye should
       * land on first.
       *
       * OMITTED ENTIRELY WHEN `showDates` IS FALSE — not hidden, not `sr-only`. The journal states the
       * same dates on the page beneath the stamp, so keeping them here in any form would repeat the
       * fact rather than move it. See the header note for the measurements that forced this.
       */}
      {showDates ? (
        <span className="mt-1 block text-[0.5625rem] font-medium uppercase tracking-[0.12em] tabular-nums text-ink-500">
          {country.days}
        </span>
      ) : null}
    </span>
  );
}
