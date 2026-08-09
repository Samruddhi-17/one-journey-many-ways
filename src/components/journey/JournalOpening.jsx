import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { Journal } from "./Journal";
import { Button } from "../ui/Button";
import { useVisited } from "../../hooks/useJournal";

/*
 * JournalOpening — the journal on the home page, and the gesture that takes you into the first country.
 *
 * ============================================================================================
 * WHY THIS IS A SEPARATE COMPONENT FROM `Journal`.
 *
 * `Journal` draws the object and knows nothing about navigation, which is what lets the ending reuse it
 * to show a full journal with no button attached. This component owns the one thing the home page needs
 * that the ending must not have: pressing it opens the cover and then goes to the first country.
 *
 * ============================================================================================
 * THE ANIMATE-THEN-NAVIGATE PATTERN, WHICH IS BORROWED RATHER THAN INVENTED.
 *
 * This is exactly the shape `Departure` uses for its flight, and the reason is the same one stated in
 * that file's header: an exit animation runs while the leaving page unmounts, so the animation and the
 * route change cannot be owned by different components without the animation being torn down halfway
 * through. So: set state to start the cover turning, hold a timer for as long as the turn takes, then
 * navigate. The component that animates is the component that navigates.
 *
 * THE TIMER IS CLEANED UP ON UNMOUNT. Without that, a visitor who presses the button and then uses a
 * header link within the second gets navigated to Japan a beat after arriving somewhere else — a bug
 * that looks like the site randomly redirecting itself, and one that only appears when a real person
 * changes their mind faster than the animation runs.
 *
 * THE DURATION IS NOT TYPED TWICE. `OPEN_MS` is the source and `Journal`'s cover transition is timed to
 * match it; the note on that transition says so. This is weaker than `Departure`'s arrangement, which
 * derives its wait from `flightDurationMs()` so the number cannot drift — the flight's timing lives in
 * a shared module because two components genuinely need it. Here the animation is 25 lines away in the
 * only file that uses it, and the failure mode if they drift is a slightly early or late route change
 * rather than a route change mid-flight. Naming the asymmetry rather than building a second module for
 * one constant.
 *
 * ============================================================================================
 * REDUCED MOTION NAVIGATES IMMEDIATELY, which is the project's standing rule (skip, never shorten). A
 * visitor who has asked their system to stop animating things has not asked for a brisk animation, and
 * an 850ms wait with nothing visibly happening is an unexplained delay — worse than either option.
 * ============================================================================================
 */

/*
 * How long the cover takes to swing back, and therefore how long before the route changes.
 *
 * 850ms plus a short beat. The beat exists because the cover's own fade is still finishing when the
 * rotation ends, and navigating on the exact frame the transform completes cuts the fade off — the
 * journal vanishes rather than dissolving. Same reasoning as `LANDING_BEAT_MS` in Departure, and
 * shorter, because a cover opening is a smaller gesture than a flight and 1.2 seconds of it is already
 * at the edge of feeling slow.
 */
const OPEN_MS = 850;
const SETTLE_BEAT_MS = 180;

export function JournalOpening({
  caption,
  firstStopSlug,
  firstStopName,
  actionLabel,
}) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [opening, setOpening] = useState(false);

  /*
   * The visit record. Two things read it: the destination line below (see its note on why a button
   * that says where it goes had to stop saying it) and the journal itself.
   */
  const visited = useVisited();
  const firstStopRevealed = visited.includes(firstStopSlug);

  /* A ref rather than state: nothing renders from the handle, it exists only so cleanup can cancel it. */
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function open() {
    if (prefersReducedMotion) {
      navigate(`/${firstStopSlug}`);
      return;
    }

    /*
     * Guard against a second press. Without it an impatient double-click queues two timers and two
     * navigations — harmless in effect, but it restarts the cover animation from zero on the second
     * press, which looks like the first press failed.
     */
    if (opening) return;

    setOpening(true);
    timerRef.current = setTimeout(() => {
      navigate(`/${firstStopSlug}`);
    }, OPEN_MS + SETTLE_BEAT_MS);
  }

  return (
    <div>
      {/*
       * ============================================================================================
       * `visited` IS PASSED, AND OMITTING IT WAS A BUG THAT ONLY BECAME VISIBLE ONCE THE ITINERARY WAS
       * WITHHELD.
       *
       * `Journal` defaults `visited` to `[]`, and this call site relied on that default — on the
       * reasoning that the home-page journal is the EMPTY one and the ending's is the full one. That
       * reasoning was sound while the home page was the first thing a visitor ever saw and nothing had
       * been visited yet. It stopped being true the moment a stop could be revealed: a visitor who comes
       * back from the first country now sees a signpost with its first plank carved, a header naming
       * that country, a footer listing it — and directly below all three, a journal with five identical
       * blank slots insisting nothing has happened.
       *
       * That is worse than a missing feature, because the journal's slots and the passport's stamps are
       * the SAME OBJECT seen at two moments (see Journal's header note), and an object that forgets what
       * the rest of the page remembers stops being one object. Measured end to end: signpost, both navs,
       * the footer and the destination line all revealed after one visit; the journal alone did not.
       *
       * The fix is one prop, not a change to `Journal` — the default stays, because it is still right
       * for any caller that genuinely wants to draw an empty journal, and the ending still passes its
       * own list. What was wrong was this call site asserting "nothing is visited" when it meant
       * "whatever has been visited".
       *
       * The caption is deliberately NOT swapped to match. `JOURNAL.emptyCaption` is the invitation this
       * page is built around, and a caption that changed after one stop would need five of them.
       * ============================================================================================
       */}
      <Journal caption={caption} opening={opening} visited={visited} />

      {/*
       * THE BUTTON, BELOW THE OBJECT AND NOT ON IT.
       *
       * A journal you click directly is a nicer idea and a worse control: the whole cover is already
       * five links (one per stop), so making the cover itself clickable puts a large target on top of
       * five smaller ones and every press becomes ambiguous. The five stops are the specific way in;
       * this is the general one.
       *
       * `<button>` and not a link, which is the distinction this codebase keeps visible: the departure
       * control is a button because it DOES something before navigating, and the itinerary rows are
       * links because they only navigate. This does something first, so it is a button.
       */}
      <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
        <Button onClick={open} size="lg" disabled={opening}>
          {actionLabel}
        </Button>

        {/*
         * WHERE THE BUTTON GOES, SAID IN TEXT — because a button, unlike a link, does not announce its
         * destination. A screen-reader user hears "Open the journal, button" and has no way to know
         * where it leads. The route order is a fact the page states elsewhere; this is the one place a
         * control needs it attached.
         *
         * Not `aria-label` on the button: replacing the visible label with a longer hidden one means
         * the words a sighted visitor reads aloud to ask for help are not the words the screen reader
         * says back. Visible text serves both.
         *
         * ============================================================================================
         * IT NAMES THE STOP'S POSITION, NOT THE COUNTRY, UNTIL THE COUNTRY HAS BEEN VISITED.
         *
         * This line said "First stop · Japan", which made it the last full answer on the home page —
         * every other place the five names appear is now withheld (see the `SIGNPOST` note in
         * src/data/voice.js), and one uncovered label undoes all of them. It was also the most
         * expensive one to leave: it sat directly beneath five deliberately blank journal slots,
         * captioning the first of them.
         *
         * WHAT THE WITHHELD VERSION STILL DOES, which is the reason this is a rewording rather than a
         * deletion. The original note above is right that a button must say where it goes, and "the
         * first stop" says that — the itinerary has an order, this control goes to the beginning of it,
         * and that is a complete and honest account of the destination. What is withheld is the
         * country's identity, which the button never needed to convey: nobody presses this because they
         * want Japan specifically; they press it because it is the way in.
         *
         * The visitor is not deprived of anything they could act on. Both states describe the same
         * single destination, so the choice in front of them is identical either way.
         * ============================================================================================
         */}
        <p className="text-sm text-ink-700">
          {firstStopRevealed ? (
            <>
              First stop <span aria-hidden="true">·</span> {firstStopName}
            </>
          ) : (
            "Opens at the first stop"
          )}
        </p>
      </div>
    </div>
  );
}
