/*
 * HiddenName — what a plank or a nav row says before the visitor has been to that country.
 *
 * ============================================================================================
 * WHAT THIS IS FOR
 *
 * The itinerary is five countries and the site used to print all five names on the home page, in the
 * header, and on the signpost. That answers the trip's only real question — "where are we going?" —
 * before the visitor has agreed to come. This component withholds the answer: a stop the visitor has
 * not reached shows its position in the route where its name would be, and the name appears when they
 * actually arrive. See `Signpost` and `MobileNavSheet` for the two places that swap.
 *
 * ============================================================================================
 * THIS WAS A BARCODE AND IS NOW A STOP NUMBER, WHICH IS WORTH RECORDING BECAUSE THE BARCODE'S
 * REASONING WAS SOUND AND IT STILL HAD TO GO.
 *
 * The withheld state used to be seventeen hashed vertical bars, drawn to read as a luggage tag: not
 * yet processed rather than redacted. It kept the secret properly — the widths came from a lossy hash
 * of the slug, so nothing about the pattern encoded the name, and unlike a blur it leaked no letter
 * count (a blurred "SWITZERLAND" is identifiable from its length alone).
 *
 * It was removed on a compositional ground the concealment argument never addressed. Five barcodes
 * stacked on five planks put the busiest texture on the page in the middle of the artwork, competing
 * with the traveller and the vista for the eye — and the reference composition's whole point is that
 * the reader looks at the view first. A device that keeps a secret perfectly and takes over the picture
 * has solved the wrong problem. The bars also sat a few pixels from the photograph's own vertical
 * detail (a colonnade), so two unrelated stripe patterns read as one accidental one.
 *
 * WHAT THE STOP NUMBER KEEPS. Every job the bars were actually doing: the five slots stay
 * distinguishable, the slot is legibly unfilled, there is something to read in the space, and the
 * name is not there. What it drops is the texture — which was the only thing wrong with it.
 *
 * WHY THE NUMBER IS NOT ITSELF A LEAK. `03` says where in the route a stop falls, which the plank's
 * own position in the stack already says, and it is the ONE thing about the itinerary the site has
 * always been open about — the header says "Stop 3 of 5" and the journal counts its slots in order.
 * Compare the ISO code this label briefly used: `JPN`, `IND` and `ITA` are the first three letters of
 * the names they were hiding and `USA` is simply how most people write "United States", so the cover
 * was captioning its own concealment with the answer. A position is not a name; an abbreviation is.
 *
 * THAT BUG SURVIVED A LEAK SCAN, and how is the useful part. The automated check searched the rendered
 * DOM for the five full names and found none, so it reported clean at every viewport width. A code is
 * not a substring of the name it stands for, so no search for "Japan" can ever find "JPN". The check
 * measured what it was told to measure and the answer was worthless — a passing test on a property
 * nobody chose carefully is not evidence.
 * ============================================================================================
 */

/**
 * The label standing in for a country's name until it is earned.
 *
 * @param country   the country whose name is being withheld
 * @param className classes for the wrapper — the CALLER owns the type size and colour, deliberately.
 *                 Both states of a slot have to occupy identical space (see `Signpost`'s header note
 *                 on why a row must not move when a name is revealed), and the only way to guarantee
 *                 that is for the caller to set one type scale and hand it to both branches.
 *
 * ============================================================================================
 * ACCESSIBILITY. THE LABEL DOES NOT CONTAIN THE COUNTRY'S NAME, which is the whole point — a
 * screen-reader user must get the same experience, meaning the same surprise, not a spoiler and not a
 * worse version of it. "Stop three, not yet visited" is exactly what a sighted visitor reads off an
 * unfilled third plank: a position, and the fact that it is waiting.
 * ============================================================================================
 */
export function HiddenName({ country, className = "" }) {
  /*
   * `padStart` so `Stop 01` and `Stop 05` are the same width. The five planks are stacked and a ragged
   * right edge across them reads as a rendering fault rather than as a style.
   */
  const label = `Stop ${String(country.arrivalOrder).padStart(2, "0")}`;

  return (
    <span className={className}>
      {label}
      {/*
       * The state, for a screen reader only — a sighted visitor reads it from the slot holding a
       * number instead of a name. Inside the same element so it is announced as one phrase,
       * "Stop 03, not yet visited", rather than as two unrelated fragments.
       */}
      <span className="sr-only">, not yet visited</span>
    </span>
  );
}
