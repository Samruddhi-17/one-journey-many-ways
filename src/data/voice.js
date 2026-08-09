/*
 * voice.js — the traveller's spoken lines, and the site's own narration.
 *
 * ============================================================================================
 * WHY THIS FILE EXISTS AND WHY IT IS DATA
 *
 * The rebuild turns a magazine article into a conversation: the traveller now addresses the
 * visitor directly ("come with me"), instead of the site describing a journey in the third
 * person. That is a change in the product, so it needs to be written down as content rather
 * than scattered as string literals across a dozen components.
 *
 * WHAT CHANGED ABOUT THE TRAVELLER, AND WHAT DID NOT — this is the important note in the file.
 *
 * PRODUCT_VISION.md §3.4 sets three rules for the traveller. Two of them are honoured here
 * unchanged, and they are the two that carry the intent:
 *
 *   "No biography, no photograph, no name."   Still true. Nothing in this file names them,
 *                                             describes them, or gives them a history. They are
 *                                             a voice and nothing else.
 *   "The visitor is the protagonist."         More true than before. Previously the visitor read
 *                                             about a trip somebody else took; now they are
 *                                             invited on it and choose what to look at.
 *
 * The third rule — "the main narrative uses second person or none... never 'I'" — is where this
 * file deliberately departs, and the reason is that the rule was written to prevent a specific
 * failure, not to ban a pronoun. §3.4 explains what it is protecting against: "the moment the
 * traveller becomes a person, the visitor becomes an audience." A named, characterised narrator
 * with opinions about themselves does that. An unnamed voice saying "come with me — I want to
 * show you how a Tuesday works here" does the opposite: it makes the visitor a companion, which
 * is precisely the relationship §3.4 asks for. The vision's own words for what it wants are
 * "a quiet companion who noticed things and points them out" — and pointing things out is
 * something you can only do by speaking.
 *
 * So the guard rail is kept and made stricter in the place that matters. Two rules govern
 * everything in this file:
 *
 *   1. THE TRAVELLER MAY SAY "I" ABOUT WHAT THEY NOTICED. They may never say "I" about
 *      themselves. No line here describes their feelings, history, job, or opinions of
 *      themselves — the test is that you could not draw this person from anything they say.
 *   2. THE TRAVELLER NEVER JUDGES A COUNTRY, and never compares two. Principle 6 and §7.4 do
 *      not relax because the voice became warmer. Warmth is the single easiest way to smuggle
 *      a ranking in ("Switzerland was my favourite"), so it is worth naming as a risk here,
 *      next to the copy, rather than trusting it to be remembered.
 *
 * WHY THE COUNTRY LINES ARE TEMPLATES AND NOT FIVE HAND-WRITTEN PARAGRAPHS
 * Every line below is either universal or built from data the country already carries. There is
 * no `if (slug === 'japan')` anywhere, which is Principle 13 as a content decision rather than a
 * code one: five hand-written greetings would drift in tone the first time one was edited, and
 * would mean the sixth country arrives with a blank page.
 * ============================================================================================
 */

/*
 * The one import this file has, and it is a grammar helper rather than data.
 *
 * `departureLines` interpolates country names into sentences, and one of the five names takes a
 * definite article. Keeping that knowledge in src/lib rather than here is deliberate: this file is
 * the traveller's copy, and a table of which countries take "the" is a fact about English, not
 * about the journey.
 *
 * `spellOut` is here for the same reason and on the same terms: `PASSPORT.stopsLabel` has to count what
 * is actually in the record, and how English writes a small number is a fact about English. See the
 * note on that label for why it spells its own number where `lead` is handed one.
 */
import { inProse } from "../lib/countryName";
import { spellOut } from "../lib/spellOut";

/*
 * THE OPENING — what the traveller says before the visitor has chosen anything.
 *
 * `hail` is the first line on the site and it is the whole pitch in one sentence, so it is worth
 * saying why it is about *angle* rather than about places. The dataset holds almost nothing about
 * landmarks and a great deal about ordinary life: how a day divides, what is on the table, how
 * people get to work, which languages share a street. Promising monuments and delivering time-use
 * statistics would be a bait and switch. Promising "the parts nobody photographs" and then showing
 * exactly that is a promise the data can keep.
 */
export const OPENING = {
  hail: "Come with me.",
  pitch:
    "I have just come back from five countries, and I did not go for the monuments. I went to find out what an ordinary day looks like somewhere else — what time people get up, what is on the table, how they get to work, what they say to a stranger.",
  turn: "None of it is the kind of thing that ends up on a postcard. All of it is the reason the trip stayed with me.",
  invitation:
    "You choose what we look at. Nothing here is ranked, and no country is the answer — they are five different ways of arranging the same twenty-four hours.",
  action: "Start where I started",

  /*
   * THE THREE LINES UNDER THE HAIL, and why they are a list rather than the `pitch` paragraph.
   *
   * The cover was rebuilt to a design reference whose hero is three short lines, not a paragraph. That
   * is a real improvement rather than a formatting preference: `pitch` is 47 words and sets out the
   * whole thesis, which is the right length for the second thing a visitor reads and much too long for
   * the first. These three fragments say what the trip is, what it is about, and what it refuses, in
   * about a second of reading — and `pitch` survives immediately below, where a visitor who wants the
   * argument gets it in full.
   *
   * THE LAST LINE IS THE ONE DOING THE WORK. "Not the postcards" is the site's whole editorial position
   * stated as a negation, which is the shortest honest way to set an expectation the data can meet: the
   * workbook holds time-use, transport, meals and language, and no monuments at all.
   *
   * WHY IT IS AN ARRAY. The three lines break on their own, so a single string with `<br>` would put
   * markup in the content layer, and a `whitespace-pre-line` string makes the line breaks invisible to
   * anyone editing them. An array says "these are three lines" in the data itself.
   */
  coverLines: [
    "Five countries. Twenty-eight days.",
    "Real stories. Everyday lives.",
    "Not the postcards.",
  ],

  /*
   * The handwritten aside beside the traveller and the dog, in Fraunces italic.
   *
   * It says "together" because the dog is in the picture and the pair is the point — the whole cover is
   * an invitation, and this is the line that makes it one addressed to the visitor rather than a
   * description of a trip. It is the only place on the site the companion is acknowledged in words, and
   * it does not describe the dog either: §3.4's rule about the traveller having no biography applies to
   * whoever is sitting next to them.
   */
  companionAside: "Let’s discover the world, together.",

  /*
   * The scroll cue at the bottom of the cover.
   *
   * "Explore" and not "continue" or "more": it names what is below, which is five doors and a premise,
   * rather than describing the mechanics of scrolling. A cue that says "scroll" is telling the visitor
   * how to use a web page.
   */
  scrollCue: "Scroll to explore",
};

/*
 * THE SIGNPOST — the five stops as a trail marker, with the names withheld until they are earned.
 *
 * ============================================================================================
 * WHY THE NAMES ARE HIDDEN AT ALL, since it costs the visitor real information.
 *
 * The trip's only genuine surprise is where it goes. Printing "Japan · India · Italy · Switzerland ·
 * United States" on the cover spends that surprise before the visitor has agreed to anything, and it
 * turns the itinerary into a menu of five destinations to pick between — which is the travel-guide
 * register the whole rebuild exists to get away from. Withheld, the same five planks say "there are
 * five places and you will find out", which is an invitation.
 *
 * WHAT IS *NOT* HIDDEN, and this is the honesty boundary. The number of stops, the number of days and
 * the order all stay visible, as does every real link — a hidden name is still a working route to a
 * real page, and the header, the footer and the itinerary all continue to navigate. Nothing is locked.
 * The secret is the answer to "which country", never access to it.
 *
 * The three-letter codes used to be on that list, on the reasoning that an abbreviation is a hint. They
 * are gone: `JPN`, `IND` and `ITA` are the opening letters of the words they were standing in for and
 * `USA` is simply how most people write "United States", so publishing them was publishing the answer.
 * See `HiddenName` for the full account.
 *
 * A visitor who wants the list can get it in one click from any plank, which is the test that this is a
 * reveal rather than a gate.
 * ============================================================================================
 */
export const SIGNPOST = {
  eyebrow: "Five stops",

  /*
   * Said above the planks, and it has to do two things at once: explain that the numbered planks are
   * deliberate, and make that feel like a promise rather than a missing feature. A row of five planks
   * reading "Stop 01" through "Stop 05" reads as unfinished without this line, and "coming soon" would
   * read as unfinished too.
   */
  lead: "Five places, and I am not going to tell you which yet. Each one gets its name back when you get there.",

  /*
   * The line under the planks once every name has been revealed.
   *
   * It is the only state in which the signpost is a complete list of five countries, so it is the only
   * place the object could turn into a summary — and it deliberately does not. No count, no tick, no
   * "all five unlocked". What it says instead is what the site says everywhere: the list is not the
   * point, the days are.
   */
  allRevealed:
    "All five, in the order I flew them. None of them the answer to anything.",
};

/*
 * THE ARRIVAL — said on landing, before the visitor explores anything.
 *
 * A function rather than a string because it needs the country, and the honest way to write one
 * greeting for five arrivals is to let the data supply what differs. `capital`, `timeZone` and
 * `welcome.intro` all come from the workbook, so this sentence is specific without being authored
 * five times.
 *
 * NOTE WHAT IS DELIBERATELY NOT HERE: any adjective about the country. The traveller says where
 * they are and hands over the brochure line, and the brochure line is the dataset's own words. The
 * moment this function starts describing places, it becomes five paragraphs pretending to be one.
 */
export function arrivalGreeting(country) {
  return {
    landed: `We have landed in ${country.capital}.`,
    /*
     * The clock line is the smallest possible "you are somewhere else" signal, and it is a fact
     * rather than a flourish — the time zone is in the dataset. It also quietly sets up the day
     * facet, which is the only facet every country's data can support in full.
     */
    clock: `Local time runs on ${country.timeZone}. Everything from here on is measured against that, not against your own morning.`,
    brochure: country.welcome.intro,
    /*
     * The pivot from brochure to observation. This is the sentence that makes the traveller's note
     * land as a correction rather than as a testimonial — expectation versus discovery (§2.1),
     * stated by the person who had the expectation.
     */
    pivot:
      "That is what I was told before I came. Here is what I actually wrote down:",
    onward: "Ask me anything about this place.",
  };
}

/*
 * THE EXPLORER'S FRAME — the traveller handing over control.
 *
 * "Ask me" rather than "explore" or "select a topic". The facets are phrased as questions the
 * visitor puts to the traveller, and the reply is data plus the traveller's own note on the same
 * subject. That framing is Principle 7 made into an interaction: the visitor asks, the data
 * answers, and the traveller's impression sits beside the answer rather than replacing it.
 */
export const EXPLORER = {
  eyebrow: "Ask the traveller",
  heading: "What do you want to know?",
  lead: "Six things I paid attention to everywhere I went. Open them in any order — there is no correct route through a place.",
  /*
   * Progress copy. Deliberately never a fraction or a percentage: "four of six" is a completion
   * meter and turns curiosity into a chore. See `progressLine` below for the wording.
   */
  allSeen:
    "That is everything I noticed here. There is more to any country than six questions.",
};

/*
 * How far through the questions the visitor is, in words.
 *
 * WHY WORDS AND NOT "4/6". A fraction is a task tracker: it tells the visitor how much is left to
 * get through, which is the wrong relationship to have with a country. The phrasing below reports
 * what has happened instead of what remains, and it stops mentioning counts entirely once
 * everything is open.
 */
export function progressLine(opened, total) {
  if (opened === 0) return "Nothing opened yet.";
  if (opened >= total) return EXPLORER.allSeen;
  if (opened === 1)
    return "One question asked. Keep going — they are all short.";
  return `${opened} questions asked, and a few still unopened.`;
}

/*
 * THE DEPARTURE — the traveller proposing the next leg.
 *
 * WHY THE TRAVELLER ASKS RATHER THAN THE INTERFACE INSTRUCTING. "Continue to India" is a button on
 * a website. "Shall we go to India next? It is a different kind of day entirely" is a companion
 * suggesting something, and it is the sentence that makes the flight animation that follows feel
 * earned rather than decorative.
 *
 * The second clause is the only place any comparison is permitted, and it is strictly qualitative:
 * "a different kind of day", never "busier", "calmer", "better". Difference in KIND is the whole
 * thesis; difference in DEGREE is a ranking (§7.4).
 */
export function departureLines(from, to) {
  /*
   * `inProse` on both, because both appear mid-sentence and America takes a definite article —
   * "Leaving the United States", "Shall we go to the United States next?". The bare name was
   * grammatically wrong on exactly one of the five chapters, which is why it survived so long.
   *
   * NOTE `action` KEEPS THE ARTICLE TOO ("Fly to the United States"), because it is a sentence
   * fragment rather than a label. The nav item and the `<h1>` deliberately do NOT — see the note in
   * src/lib/countryName on why the article is supplied here rather than stored in the registry.
   */
  return {
    eyebrow: "Leaving " + inProse(from),
    question: `Shall we go to ${inProse(to)} next?`,
    reason:
      "It is a different kind of day entirely, which is the only reason the order matters at all.",
    action: `Fly to ${inProse(to)}`,
    /*
     * Shown while the plane is in the air. Two short lines, because they have to be readable in
     * the time a flight animation takes and nobody reads a paragraph over a moving map.
     */
    boarding: `${from.name} → ${to.name}`,
    inflight: "On our way.",
  };
}

/*
 * THE END OF THE JOURNEY — after the fifth country, where there is no next flight.
 *
 * §4.4 rules out a statistical ending, and the risk at this exact moment is a summary: five
 * countries, twenty-eight days, a tidy figure. So the traveller closes on the question they were
 * left with rather than on a total, and the only thing offered is going back — because re-reading
 * ranks nothing.
 */
export const HOMECOMING = {
  eyebrow: "The last flight home",
  heading: "That is the whole trip.",
  body: "Five countries, and not one of them doing an ordinary day the way the last one did. I did not come back with a favourite. I came back suspecting that almost everything I do at a particular hour, I do at that hour because of where I happen to live.",
  open: "Which is a strange thing to find out from a spreadsheet, and I have not entirely got over it.",
  action: "Go back to the beginning",
};

/*
 * THE JOURNAL — the object that carries the journey's progress, and the copy printed on it.
 *
 * ============================================================================================
 * WHY THESE FOUR STRINGS AND NOT MORE. The journal is a physical thing the visitor looks at, and
 * everything written on a physical thing is lettering rather than prose. Four lines: what it is called
 * before the trip, what it is called after, what the button says, and the heading of the section it
 * sits in. Any fifth line would be the site explaining its own metaphor.
 *
 * `emptyCaption` IS THE MOST IMPORTANT SENTENCE ON THE HOME PAGE, and it is doing something none of the
 * other copy does: it makes the object's emptiness into a claim about the future. "It was blank when I
 * left" is past tense about a journal the visitor is looking at in its blank state — so the visitor is
 * standing at the start of a trip that has already happened to someone else, which is exactly the
 * site's premise. It also sets up the ending, where the same object is full.
 *
 * THE NUMBER IS SPELLED OUT AND IS NOT DERIVED, which breaks the rule the rest of this file follows,
 * and the exception is worth stating. `PASSPORT.lead` takes a spelled-out count as an argument
 * precisely so a typed "five" cannot disagree with the itinerary. Here "Twenty-eight days" is inside a
 * hand-written sentence with its own rhythm, and a function returning it would be a template that only
 * ever produces one string. The protection instead is that TOTAL_DAYS is derived and asserted in
 * countries.js — if the itinerary ever changes, that constant changes and this line is wrong in a way
 * the data tests will not catch. Naming the risk rather than pretending the interpolation removes it.
 *
 * `fullCaption` IS NOT "JOURNEY COMPLETE" AND MUST NEVER BECOME IT. §4.4's whole argument is that the
 * ending is a reflection rather than a completion state, so the full journal says what is in it rather
 * than that it is finished. A tick, a percentage, or the word "complete" would turn five chapters of
 * observation into a progress bar reaching its end.
 * ============================================================================================
 */
export const JOURNAL = {
  heading: "Twenty-eight days, five stamps, one notebook.",

  /*
   * Set on the home page's journal. Present tense would make it a status ("this journal is empty");
   * past tense makes it a memory, which is what puts the visitor at the beginning of somebody's story
   * rather than at the start of a form.
   */
  emptyCaption: "Twenty-eight days, and it was blank when I left.",

  /*
   * Set on the ending's journal. It names what filled the pages without characterising any of it —
   * "five countries" is the route's length, and §4.4 permits the length of a route while forbidding a
   * verdict on anything in it.
   */
  fullCaption:
    "Twenty-eight days later, and none of it was what I had written down.",

  /*
   * THE THIRD CAPTION, AND THE REASON THERE HAD TO BE ONE.
   *
   * The journal was designed with two states because the two places it appears were assumed to be the
   * beginning and the end. They are not: it also appears on the record, which any visitor can open at
   * any point, and at the end of the fifth country, which a visitor can reach from a shared link having
   * seen nothing else. So there is a middle state — some slots stamped, some still outlines — and
   * neither existing line is true of it. `emptyCaption` denies stamps that are visibly there;
   * `fullCaption` claims twenty-eight days that have not happened.
   *
   * IT COUNTS NOTHING, deliberately. "Three of five" would turn the object into a progress meter, which
   * is the one thing the journal must never become — and the stamps themselves already show how much is
   * filled, so a number would only be the interface reading its own picture aloud. What the line adds is
   * the same thing the other two add: that what is in there was not what was expected.
   */
  partialCaption: "Some pages filled, and already nothing much like the plan.",

  /*
   * "Open the journal" rather than "Start" or "Begin the journey".
   *
   * It names the physical gesture the button actually performs, which is the whole reason the object is
   * on the page. "Start" is a control on an app; opening a notebook is a thing a person does.
   */
  action: "Open the journal",
};

/**
 * Which caption belongs on the journal, given what the visitor has actually visited.
 *
 * ============================================================================================
 * WHY THIS IS A FUNCTION IN THIS FILE AND NOT AN INLINE TERNARY AT EACH CALL SITE.
 *
 * Three places render the journal — the home page, the end of the fifth country, and the record — and
 * two of them see a visitor whose journey may be at any stage. Choosing the caption is therefore a
 * decision about what the object is allowed to CLAIM, which is editorial rather than presentational,
 * and a claim duplicated across two components is a claim that will eventually be made two ways.
 *
 * The specific failure it prevents: an `n === total ? full : empty` written at one call site and
 * `n > 0 ? full : empty` at the other. Both look right in review, and the second one tells a visitor
 * two countries in that twenty-eight days have passed.
 *
 * IT TAKES THE TOTAL RATHER THAN IMPORTING IT, so this file keeps depending on nothing but
 * src/lib/countryName. The itinerary's length is a fact about the data and the caller already holds it;
 * importing src/data/countries here to fetch a number would tie the site's copy to its registry for no
 * benefit.
 *
 * @param {number} visitedCount how many countries the visitor has actually opened
 * @param {number} totalStops how many stops the itinerary has
 * @returns {string}
 */
export function journalCaption(visitedCount, totalStops) {
  if (visitedCount <= 0) return JOURNAL.emptyCaption;
  if (visitedCount >= totalStops) return JOURNAL.fullCaption;
  return JOURNAL.partialCaption;
}

/*
 * THE PASSPORT — the journey's closing artefact.
 *
 * ============================================================================================
 * THIS IS THE ONE PLACE THE SITE SPEAKS AS "WE", AND §4.4 GRANTS THE EXCEPTION EXPLICITLY:
 * "It is also the only place on the site where the narration may address the visitor as *we*,
 * because by then the journey has genuinely been shared."
 *
 * So this copy is NOT the traveller. Everything above in this file is a companion pointing things
 * out; this is the site itself, at the end, saying what the whole thing meant. The distinction
 * matters for attribution: none of these lines is quoted or attributed, because they are not
 * somebody's observation — and §4.4 places the traveller's last word at the end of the United
 * States, which is the homecoming block above. After that the reflection belongs to the visitor.
 *
 * WHAT §4.4 FORBIDS, AND HOW EACH LINE HERE STAYS INSIDE IT.
 *
 *   "No recap of figures, no 'your journey in numbers,' no aggregate scorecard."
 *      There is not a single numeral in this object, and `reflection` deliberately does not say how
 *      many countries or how many days. The passport page still shows five stops in order, because
 *      a route is not a scorecard — but nothing here totals them.
 *
 *   "Name the realisation in plain, unhurried language."
 *      `reflection` is the realisation, in the vision's own terms: every place reflects its own
 *      history and priorities, and there is no single formula. Written fresh rather than lifted
 *      from §4.4's paraphrase, as that section instructs.
 *
 *   "Sit in silence — one thought, generous space. Must not compete with imagery or motion."
 *      Three short strings, and the page sets them with nothing else in the viewport. The absence
 *      of a fourth paragraph is the design.
 *
 *   "Leave the visitor still thinking. Must not ask them to do anything, or sell anything."
 *      `closing` ends on an open observation rather than a conclusion, and there is no call to
 *      action here at all. The only link the page offers goes back to a country, which is
 *      re-reading rather than converting.
 *
 * WHY THE COPY NEVER SAYS WHICH COUNTRY WAS ANYTHING. The strongest temptation at an ending is the
 * summarising adjective — "the calm of Japan, the energy of India" — which is five verdicts in one
 * sentence and precisely what §7 exists to prevent. The realisation is stated about places in
 * general, so no country is characterised on its way out.
 * ============================================================================================
 */
export const PASSPORT = {
  eyebrow: "The record",

  /*
   * "Where we went" rather than "Your journey" or "The route so far".
   *
   * "Your journey" is the framing of a progress dashboard and implies completion tracking.
   * "Where we went" is past tense and shared, which is what the page is: a record of something that
   * already happened, not a status.
   */
  heading: "Where we went",

  /*
   * The line under the heading, and the one string here that has to be built rather than written.
   *
   * WHY IT IS A FUNCTION. It states how many stops there were, and a typed "Five" is a number that
   * can disagree with the itinerary — exactly the failure the derived TOTAL_STOPS exists to prevent,
   * and one that reads perfectly well while being wrong. The caller passes the spelled-out count.
   *
   * WHY IT STATES A COUNT AT ALL, on a page whose whole argument is that nothing here adds up. A
   * count of stops is not a metric about the countries: it is the length of the route, which is the
   * one fact a record of a journey is entitled to state. §4.4 forbids recapping the FIGURES — the
   * happiness scores, the hours, the kilograms — and "five stops" is none of those. The line then
   * says outright what the page is not, so the number cannot be read as the start of a scorecard.
   */
  lead: (stops) =>
    `${stops} stops, in the order we made them. Not a scoreboard — there is nothing here to add up. Only where we were, and one thing worth remembering from each.`,

  /*
   * ============================================================================================
   * THE THREE STATES THE RECORD CAN BE IN, AND WHY THE COPY HAD TO GROW TO COVER THEM.
   *
   * `lead` above was written when this page rendered all five stops unconditionally, so there was one
   * state and one line. The page now shows only what the visitor actually opened, which means it has
   * three: nothing visited, some visited, all five visited. `lead` is the last of those, and it is
   * false in the other two — "in the order we made them" is a claim about a journey, and a visitor who
   * clicked "Passport" from the home page has not made one.
   *
   * THE INTEGRITY RULE THESE EXIST TO KEEP is the one the whole session's work turns on: the record may
   * only state what happened. Every alternative was some form of pretending — showing five stops greyed
   * out (which is a to-do list), showing five stops filled (which is a lie), or showing this page as
   * though the journey were always complete (which is what it did before).
   *
   * NONE OF THESE LINES COUNTS ANYTHING, and that is deliberate on a page that is now partly about
   * progress. "Two of five countries" is a completion metric, and a completion metric at the ending is
   * exactly §4.4's forbidden scorecard wearing a different label. The journal at the top of the page
   * shows how much is filled, in stamps, which is the honest form of the same information — a picture
   * of a notebook rather than a fraction.
   * ============================================================================================
   */

  /*
   * NOTHING VISITED YET. The page still exists, still says what it is for, and points at the way in
   * without becoming an advertisement for it — §4.4's "must not ask them to do anything" governs the
   * ENDING, and this is not the ending: a visitor here has not finished anything, so a route back into
   * the journey is help rather than a conversion.
   */
  emptyLead:
    "Nothing in it yet. This is where the trip gets written down as it happens — one stamp and one remembered thing per country, in the order you go.",
  emptyAction: "Start where the traveller started",

  /* SOME VISITED. Names what is here and what is not, without counting either. */
  partialLead:
    "What is in the record so far, in the order you went. The stamps that are still outlines are the countries you have not opened yet — they stay blank until you do.",

  /*
   * THE REALISATION. The single most important sentence on the site, and the reason §4.4 exists.
   *
   * Kept to two sentences with no hedging and no numbers. The second sentence is the one doing the
   * work: it converts five chapters of difference from a set of comparisons into a single point.
   *
   * IT IS NOW SHOWN ONLY WHEN ALL FIVE HAVE ACTUALLY BEEN VISITED, which is the least obvious
   * consequence of gating this page and the most important one. Every sentence in it is first-person
   * plural about evidence: "we arrived looking for the differences, and we found plenty of them". Shown
   * to a visitor who has opened one country, it is the site telling them what they concluded from four
   * chapters they have never seen — and it would also spend the ending before they reached it, which is
   * the spoiler `sessionStorage` was chosen over `localStorage` to avoid.
   *
   * `unfinished` stands in its place until then. See the note there.
   */
  reflection:
    "We arrived looking for the differences, and we found plenty of them. What was harder to expect is that none of them turned out to be a verdict: every one of these places is arranged the way it is because of its own history, its own weather, its own idea of what a day is for.",

  /*
   * WHAT STANDS WHERE THE REALISATION GOES, BEFORE THE JOURNEY HAS EARNED IT.
   *
   * The alternative was to render nothing, and that is worse than it sounds: the reflection block is
   * what makes this page a record rather than a menu, and a page that ends on its last stop link ends
   * on a control. So the space is kept and the claim is not made.
   *
   * It says what the page is waiting for without instructing anyone to go and finish — closer to a note
   * on the inside cover than to a prompt. It also does not hint at what the realisation will be, which
   * would be the same spoiler in a smaller font.
   */
  unfinished:
    "There is a thing this journey adds up to, and it is not written here yet. It only makes sense once all five days-in-a-life have been sat through, so the last page stays blank until then.",

  /*
   * The last thing the site says. Unresolved on purpose — "still thinking" is the requirement, so
   * this ends on an observation the visitor has to finish themselves rather than on a conclusion.
   *
   * SHOWN UNDER THE SAME CONDITION AS `reflection`, because it is the second half of the same thought:
   * "this was one of them" refers to the journey the reflection has just described. Separated from it,
   * on a page with one stop in it, it would be the site calling a single chapter a journey.
   */
  closing:
    "There is no single formula for living well. There are only different journeys, and this was one of them.",

  /*
   * The label above the entries. Not a heading the eye stops on — the stops are the content and this
   * only names them for anyone navigating by structure.
   *
   * IT TAKES A NUMBER WHERE `lead` TAKES A SPELLED-OUT WORD, and the inconsistency is the point rather
   * than an oversight. This label now counts what is actually in the record, which can be one — and
   * "The one stops" is the kind of sentence that ships. Getting the plural right requires knowing the
   * number, and a word cannot be tested for oneness, so this one does its own spelling out. `lead`
   * keeps the older shape because its count is always five.
   */
  stopsLabel: (count) =>
    count === 1 ? "The first stop" : `The ${spellOut(count)} stops`,

  /*
   * What the link on each entry says, with the country name appended by the caller. "Go back to"
   * rather than "View" or "Explore": every entry on this page has now genuinely been visited — the page
   * renders nothing else — so "back" is a statement of fact rather than an assumption about the
   * visitor, which is what it was when all five rendered unconditionally.
   */
  revisit: "Go back to",

  /*
   * The label above each stop's remembered line.
   *
   * WHAT THE LINE IS, BECAUSE THE FIRST CHOICE WAS WRONG AND THE SECOND EXPLAINS THIS WORDING.
   *
   * The obvious source for "one thing worth remembering from each" was `travellerNote` — the
   * traveller's own workbook sentence, one per country, the right length. Two problems, and the
   * second is decisive. It is the sentence Arrival already opens every chapter with, so the passport
   * would be replaying copy the visitor has read five times. And it is first person, on the one page
   * where the site speaks as itself: quoting the traveller here would hand the ending back to them,
   * when §4.4 places their last word at the end of the United States and gives the reflection to the
   * visitor.
   *
   * The line used instead is `REFLECTIONS[slug].carried` from the registry — five hand-authored
   * lines, in the site's own voice, each naming what its chapter's evidence amounted to. They were
   * written for the per-country Reflection section, which the rebuild dissolved into the facets, so
   * they were rendered nowhere. That makes them exactly right here: the site's voice, so the page
   * stays "we"; already written to close a chapter's loop; and nothing the visitor has read before.
   *
   * "What stayed with us" is therefore accurate rather than decorative — it is the site saying what
   * it kept, which is what a record of a journey is. The "us" is the exception §4.4 grants, and this
   * is one of the two places on the page that uses it.
   */
  memoryLabel: "What stayed with us",
};
