/*
 * voice.js — the traveller's spoken lines, and the site's own narration.
 *
 * ============================================================================================
 * WHY THIS FILE EXISTS AND WHY IT IS DATA
 *
 * The rebuild turns a magazine article into a conversation: the traveller now addresses the
 * visitor directly ("come with us"), instead of the site describing a journey in the third
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
  /*
   * "COME WITH US" AND NOT "COME WITH ME", BECAUSE THERE ARE TWO OF THEM IN THE PICTURE.
   *
   * A reader pointed out that the cover shows a traveller and a dog and the line only accounts for
   * one of them. That is exactly right, and it is a factual mismatch rather than a matter of taste:
   * the invitation is issued by whoever is in the frame, and the frame contains a pair.
   *
   * WHAT THE PLURAL COSTS, since it is not free. "Us" makes the dog a party to the invitation, which
   * means the animal is now someone the copy speaks for — and §3.4's rule that the traveller has no
   * biography applies to whoever is sitting next to them. So the plural appears HERE and nowhere
   * else: every other line in this file stays first-person singular, because the traveller is the
   * one who noticed things and wrote them down. "Come with us" is the two of them at the trailhead;
   * "I went to find out what an ordinary day looks like" is the person holding the notebook.
   *
   * `companionAside` already ended in "together", so this makes the cover's first line agree with
   * its last rather than introducing a new idea.
   */
  hail: "Come with us.",
  /*
   * THE ARGUMENT IN FULL, rendered in the premise section below the fold — not on the cover, which is
   * where it used to be and where 47 words is far too many for the first thing anybody reads.
   *
   * IT WAS RENDERED NOWHERE AT ALL FOR A WHILE, which is worth recording as a warning about this file.
   * When the cover's paragraph became three short lines, the paragraph was removed from HomePage and
   * this string stayed here with a comment claiming it "survives immediately below" — a description of
   * a placement that no longer existed. Copy in a data file has no compiler to tell you it is unused,
   * so a deleted call site leaves a fully commented ghost. Restored to the premise section, which is
   * where the comment always said it was.
   *
   * ITS OPENING CLAUSE WAS CUT WHEN IT CAME BACK. It began "I have just come back from five countries,
   * and I did not go for the monuments" — both halves of which the cover's rewritten lines now say, in
   * almost the same words, one screen above. So it now starts at the thing only it says: what the
   * traveller went to find out. The four items after the colon are the four the facets answer, which is
   * the whole reason to keep a list this long anywhere on the site.
   *
   * "the same questions everywhere" IS THE ONE ADDITION, and it is the load-bearing phrase. The list on
   * its own reads as four topics; saying they were the same ones in every country is what makes the five
   * pages comparable at all, and it is true of the data — every country carries the same six facets,
   * which is why there is one CountryPage and not five.
   *
   * IT DOES NOT COUNT THEM, AND THE DRAFT DID, WHICH WAS A CONTRADICTION IN NUMBERS. The draft read "I
   * asked the same four things everywhere" because four items follow the colon. But `EXPLORER.lead` on
   * every country page reads "Six things I paid attention to everywhere I went", and facets.js holds six
   * — so the home page promised four questions and each country page then offered six. Caught in a
   * screenshot of the two sections rather than by reading either one.
   *
   * THE FIX IS TO DROP THE NUMBER RATHER THAN CORRECT IT TO SIX, because the list here is deliberately
   * NOT all six: this is the traveller talking, and a person naming what they went to find out gives
   * examples, not an inventory. Writing "the same six things" and then listing four would be a different
   * error in the same place. The count belongs where it is checkable against the data, which is the
   * explorer's own lead directly above the six cards.
   */
  pitch:
    "I went to find out what an ordinary day looks like somewhere else, and I asked the same questions everywhere: what time people get up, what is on the table, how they get to work, and what languages they hear on the way.",
  /*
   * THE TURN, REWRITTEN. It read: "None of it is the kind of thing that ends up on a postcard. All of
   * it is the reason the trip stayed with me." A reader reported it as vague and as sounding
   * generated, and both halves earn that:
   *
   *   "the kind of thing that ends up on a postcard" is a category rather than a thing. It defines
   *   the content by what it is not, which is the failure already recorded against "Not the
   *   postcards" three notes below — the same instinct, at greater length.
   *
   *   "the reason the trip stayed with me" asserts an effect on the traveller and names no cause. It
   *   is the shape of a sentence that means something without any of the content.
   *
   * The replacement names two of the actual observations in the workbook — India's day gives 2.9
   * hours to unpaid housework where Japan's gives 2.2, and America's transport mix is 85.5% private
   * vehicle — without printing a figure, because this page carries no numbers by design. It says
   * what the visitor will find, in the traveller's own terms, and leaves the argument to `invitation`
   * below.
   *
   * ------------------------------------------------------------------------------------------------
   * AND IT WAS REWRITTEN AGAIN, BECAUSE THAT REPLACEMENT WAS WORSE. It read "Nobody sends a photograph
   * of the hour before work, or of how they got there. Those are the two things I ended up writing
   * about most." A reader said it does not make sense and does not match the flow, and both halves of
   * that are right for one reason: IT IS STILL ARGUING WITH POSTCARDS.
   *
   * The line it replaced was rejected for defining the content by what it is not ("none of it is the
   * kind of thing that ends up on a postcard"). The replacement kept the same move and only changed the
   * noun — "nobody sends a photograph of" is the same negation, so the first thing the visitor meets
   * below the fold is still the site telling them what other people fail to photograph. That is an
   * argument with a straw traveller, and the visitor has to work out what it is FOR before they can
   * read it.
   *
   * "THE HOUR BEFORE WORK" WAS ALSO A PHRASE THE SITE INVENTED AND NEVER USES AGAIN. Nothing in the
   * data is an hour before work; the day facet holds sleep, work, leisure, housework and commuting.
   * So the visitor was asked to hold a category that no page delivers, which is the flow break the
   * reader named.
   *
   * WHAT THIS ONE DOES INSTEAD. It is the site's thesis said forwards, in the traveller's voice, as the
   * thing they came back with: the ordinary parts of a day are not the same from one country to the
   * next, and they are the parts nobody thinks to ask about. Both clauses are supported — the workbook's
   * five days differ in every category, and the facets are all questions about ordinary things. No
   * negation, no photographs, and no noun the rest of the site does not use.
   */
  turn: "The ordinary parts of a day turned out to be the parts that changed most from one country to the next. They are also the parts nobody thinks to ask about.",
  /*
   * THE NO-RANKING PROMISE, AND THE SENTENCE THAT HAD TO COME OFF THE END OF IT.
   *
   * It read: "You choose what we look at. Nothing here is ranked. These are five different ways of
   * arranging the same twenty-four hours." A reader asked what it meant, and the first two sentences
   * are fine — they are a promise the site keeps, in plain words. THE THIRD IS THE PROBLEM, in two
   * ways that compound.
   *
   *   IT IS ONLY TRUE OF ONE FACET OUT OF SIX. "Arranging the same twenty-four hours" describes the day
   *   card exactly and describes nothing else on the site: food is kilograms a year, language is shares
   *   of a population, transport is journeys, the people card is two single figures. So it promises a
   *   site made of clocks and then delivers five other kinds of evidence.
   *
   *   AND IT IS WRITTEN AS AN EQUATION RATHER THAN A SENTENCE. "Five different ways of arranging the
   *   same twenty-four hours" is the kind of phrase that sounds like an insight because of its symmetry
   *   — same hours, different arrangements — and a reader has to unpack it to find that it is only
   *   restating what a percentage is. The reader's question is the correct response to it.
   *
   * SO THE PROMISE STAYS AND THE FLOURISH GOES. What replaces it is the practical fact the visitor
   * needs at exactly this point, one screen above five doors: the order is theirs, and no page is the
   * answer to any other page. That is the no-ranking promise stated as something they can act on
   * rather than as a claim about time.
   */
  invitation:
    "You choose what we look at, and in whatever order you like. Nothing here is ranked, and no country is the answer to another one.",
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
   * THE THIRD LINE USED TO READ "Not the postcards", AND IT WAS CUT FOR BEING A SLOGAN. It was written
   * as the site's editorial position stated as a negation, on the reasoning that a negation is the
   * shortest way to set an expectation. What it actually does is tell the visitor what the site is too
   * good for before showing them anything, and a reader reported it as one of the lines that does not
   * make sense on its own. "Ordinary days, recorded" says what the pages contain, which the workbook can
   * back: time-use, transport, meals and language, and no monuments at all.
   *
   * THE GENERAL RULE THIS SETS, since the same instinct produced several lines that had to go: copy may
   * say what a thing IS. Copy that defines itself by what it refuses is arguing with a reader who has
   * not spoken yet.
   *
   * WHY IT IS AN ARRAY. The three lines break on their own, so a single string with `<br>` would put
   * markup in the content layer, and a `whitespace-pre-line` string makes the line breaks invisible to
   * anyone editing them. An array says "these are three lines" in the data itself.
   *
   * ------------------------------------------------------------------------------------------------
   * REWRITTEN A SECOND TIME, FROM THREE LABELS INTO ONE SENTENCE THE TRAVELLER SAYS.
   *
   * They read: "Five countries. Twenty-eight days." / "Real stories. Everyday lives." / "Ordinary
   * days, recorded." A reader asked for something that sounds like the traveller's words, and the
   * diagnosis is that none of those three lines had a speaker. Each is a noun phrase with a full stop
   * after it — the register of a conference slide, and the reason is visible in the grammar: there is
   * no verb in any of them, so nobody is doing anything.
   *
   * THE SECOND LINE WAS ALSO THE WEAKEST CLAIM ON THE PAGE. "Real stories. Everyday lives." are the
   * two phrases every travel brand uses, and the site cannot be the judge of whether its own stories
   * are real. The third line, "Ordinary days, recorded", was defended in the note above as saying what
   * the pages contain — which it does, in the voice of a filing system.
   *
   * THE FIRST LINE ALSO DUPLICATED THE COUNTS LINE beneath the button, which already reads "Five stops
   * · Twenty-eight days" — see the note on that line in HomePage. The same two numbers appeared twice
   * within one screen, once as a headline claim and once as a caption, and the caption is the honest
   * place for them because it is set quietly. Saying them twice made the trip's size the cover's
   * subject.
   *
   * WHAT REPLACES THEM is one sentence broken across three lines, in the first person, listing three
   * things the workbook can actually answer: the hour people get up, what is on the table, how they
   * get to work. It is the same list as `pitch` below, cut to its three concrete nouns — so the cover
   * promises exactly what the facets deliver, and a visitor who scrolls finds the long version of a
   * sentence they have already agreed to rather than a different pitch.
   *
   * IT STAYS THREE LINES AND STAYS AN ARRAY. The rhythm of three short lines is what the cover's
   * typography was built around, and the breaks now fall at the sentence's own commas, so each line is
   * a complete item. A screen reader pauses between them, which is where the pauses belong.
   */
  /*
   * ------------------------------------------------------------------------------------------------
   * REWRITTEN A THIRD TIME, AND THE THIRD DIAGNOSIS IS THE ONE THAT MATTERED.
   *
   * The second version read: "I wanted to know what time people got up, / what was on the table when
   * they did, / and how they got to work afterwards." A reader called it very bad and asked for the
   * traveller actually TELLING them something — that they have been to five countries for
   * twenty-eight days, that here is the journal, and that the trip was about how people live rather
   * than about places.
   *
   * WHY THE SECOND VERSION FAILED, since it was written specifically to fix the first. It is three
   * subordinate clauses of one sentence whose main clause is "I wanted to know" — so the whole cover
   * is a statement about the traveller's curiosity in the PAST, with no trip in it, no visitor in it,
   * and nothing offered. It reads as the setup to an invitation that never arrives. Worse, "got up",
   * "was on the table", "got to work" is the same list as `pitch` below, which meant the cover's
   * headline promise and its own second paragraph were the same three nouns twice.
   *
   * WHAT REPLACES IT IS ADDRESSED TO THE VISITOR AND CONTAINS THE TRIP. Five countries and
   * twenty-eight days are back in the first line — not as the counting caption they were the first
   * time, but as the traveller saying where they have been, which is how a person opens this
   * conversation. The second line is what the trip was for, in the traveller's own terms and without
   * the three-noun list, so it sets up `pitch` instead of pre-empting it. The third line hands the
   * journal over, which is the object directly below and the thing the button opens.
   *
   * WHY "how people live" AND NOT "how people thrive and connect", which the reader offered as the
   * sense of it. "Thrive" is a verdict — it says the living was going well, which is the site placing a
   * country on a scale — and "connect" the workbook cannot support at all: there is no measure of
   * anyone's relationships in it. What IS in it is where the hours go, what is on the table, how people
   * travel and which languages share a street, and "how people actually live" is the honest whole of
   * those four. The reader's intent survives; the two words that would have made the cover promise what
   * the data cannot are the ones left out.
   *
   * THE READER DID NOT INVENT THAT PHRASE, THOUGH — THE SITE SAYS IT. SiteFooter's own description reads
   * "exploring how people live, thrive and connect", which is almost certainly where they picked it up,
   * and it means the objection above lands on the footer rather than on them. Recording it here rather
   * than quietly writing a cover that contradicts a line two screens below: the footer is another page's
   * copy and belongs to that page's pass, but the inconsistency is real and this is the note that will
   * find it when the footer is reached.
   *
   * WHY IT IS STILL THREE LINES AND STILL AN ARRAY: unchanged from the note above. The breaks fall at
   * the sentence boundaries now rather than mid-clause, so each line is a whole thought and the screen
   * reader's pauses land where a speaker's would.
   *
   * TWO DUPLICATIONS THIS CREATES, BOTH RESOLVED RATHER THAN IGNORED, because putting the counts back
   * on the cover is precisely what caused them the first time:
   *
   *   THE COUNTS CAPTION BENEATH THE BUTTON IS NOW THE ECHO, AND IT GOES. It reads "Five stops ·
   *   Twenty-eight days", and the same reader asked in the previous round whether it was needed. It was
   *   kept then on the grounds that the counts belonged somewhere quiet and the cover lines had given
   *   them up. That trade is now reversed: the counts are in the traveller's own sentence, which is
   *   the better place for them, so the caption is the one saying it twice. Removed in HomePage.
   *
   *   "ONE NOTEBOOK" IS NOT SAID HERE, though the draft said it, because `JOURNAL.heading` two screens
   *   down reads "Twenty-eight days, five stamps, one notebook." Two nearly identical tricolons on one
   *   page is worse than either alone. The cover says the journal exists in a full sentence; the
   *   heading counts what is in it.
   *
   * AND THE LAST LINE SAYS "here it is" RATHER THAN "come and read it with me", WHICH WAS THE DRAFT.
   * "With me" would break the singular/plural arrangement two notes above: `hail` is the one plural on
   * the site because the cover shows two of them, and a second invitation on the same screen in the
   * SINGULAR would make the pair inconsistent within one view. Handing the journal over says the same
   * thing without issuing a competing invitation — the hail already did that, and the button below it
   * is the thing that accepts.
   *
   * WHY THIS IS NOW A FUNCTION WHERE IT WAS AN ARRAY, which is the one structural change. The first line
   * counts the trip, and the counts caption it replaces was DERIVED from the itinerary registry —
   * `TOTAL_STOPS` and `TOTAL_DAYS`, spelled out by `spellOut`. Typing "five countries, twenty-eight days"
   * here would move two derived figures back into hand-typed prose, so the day a stop is added the cover
   * would state the old size of the journey in a sentence that still reads perfectly. That is the exact
   * failure `spellOut`'s own header calls the thing nobody proofreads for.
   *
   * `PASSPORT.lead` and `PASSPORT.stopsLabel` already take their counts as arguments for this reason, so
   * this follows a pattern the file has rather than inventing one. The caller holds the constants; this
   * file holds the sentence.
   */
  /*
   * ------------------------------------------------------------------------------------------------
   * AND THE THREE LINES BECAME ONE PARAGRAPH, WHICH IS THE STRUCTURE CHANGE THE REWRITE FORCED.
   *
   * The three-line form was inherited from the design reference and defended above on rhythm: three
   * short statements, a screen-reader pause between each, read in about a second. That defence holds
   * only while each line FITS ON ONE VISUAL LINE, and the copy the reader asked for cannot.
   *
   * MEASURED, RATHER THAN GUESSED. The block's column is 576px wide at every desktop width (1440, 1280
   * and 1024 all report 576 — it is a fixed measure, not a fraction), which is about 53 characters at
   * this size. The sentences needed to say the trip's size, what it was for, and that the journal is
   * the record of it. Two of the three ran to 63 and 68 characters, so both wrapped: six visual lines
   * with a 4px `space-y-1` gap appearing at three arbitrary points inside them. The first draft was
   * worse still — it orphaned "in all." as two words alone on a line, which reads as a fourth line
   * saying nothing.
   *
   * THE CHOICE WAS THEREFORE BETWEEN THE FORM AND THE CONTENT, and the content is what the reader
   * asked for: the traveller telling them where they went, what for, and what they brought back. That
   * is roughly forty words in anybody's mouth. Forty words is a paragraph, and a paragraph that wraps
   * naturally has no orphan to tune and no character budget to break the next time a word changes.
   *
   * WHAT IS LOST AND WHAT IS NOT. The staccato rhythm goes, and it was real. The screen-reader pauses
   * do not: they came from the sentence boundaries as much as the paragraph boundaries, and there are
   * still three full stops. What is gained is that the cover now sounds like someone talking rather
   * than three captions stacked up — which is the whole of the reader's objection to both previous
   * versions.
   *
   * IT IS STILL A FUNCTION TAKING THE TWO COUNTS, for the reason in the note above: they are derived
   * from the itinerary and must not be typed here.
   */
  /*
   * THE LAST SENTENCE IS THE LONGEST ON PURPOSE, and it is a typographic constraint rather than a
   * stylistic one. Measured: the paragraph sets to four lines in a 576px column, so whatever ends the
   * sentence has to be long enough to fill the fourth. The draft ended "This is it." — three words alone
   * on line four, which is the same orphan the three-line version produced with "in all.", found the same
   * way and one round later. An orphan under a headline reads as a mistake in the type.
   *
   * "This is my journal, and you are welcome to read it" both fills the line and does the thing the reader
   * asked for: it hands the object over and addresses them directly. Note it does not repeat the invitation
   * `hail` makes — "you are welcome to read it" is permission rather than a second summons, so the cover
   * still issues exactly one.
   */
  coverIntro: (stops, days) =>
    `I have just come back from ${stops} countries in ${days} days. I did not go for the sights. I went to see how people actually live, and I wrote all of it down. This is my journal, and you are welcome to read it.`,

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
     * The clock line is the smallest possible "you are somewhere else" signal, and it is a fact rather
     * than a flourish: the time zone is in the dataset.
     *
     * IT USED TO CARRY A SECOND SENTENCE, "Everything from here on is measured against that, not against
     * your own morning", and a reader reported it as not making sense. They were right, and the reason is
     * worth keeping. It was written to set up the day facet, but read literally it is false: nothing on
     * the page is measured against the local clock, and the visitor's own morning was never a unit. It
     * was a sentence that sounded like it was explaining something while explaining nothing. The fact
     * stands on its own.
     */
    clock: `Local time runs on ${country.timeZone}.`,
    brochure: country.welcome.intro,
    /*
     * The pivot from brochure to observation. This is the sentence that makes the traveller's note
     * land as a correction rather than as a testimonial — expectation versus discovery (§2.1),
     * stated by the person who had the expectation.
     */
    /*
     * "IN MY JOURNAL" IS NOT A FLOURISH — IT NAMES THE OBJECT THE VISITOR IS ALREADY CARRYING.
     *
     * The journal is a real thing on this site: it opens on the home page, it collects a stamp per
     * country, and `JOURNAL` below is the copy printed on it. So "what I wrote down in my journal"
     * points at something the visitor has seen, which is what makes the quotation beneath this line a
     * page from it rather than a pull-quote. Without the object named, "wrote down" could be anywhere.
     *
     * It also settles the register of what follows: a journal is written for yourself, so a reader
     * expects an impression rather than a finding — which is exactly what `travellerNote` is, and is
     * the distinction the caveats on the facets below keep having to make in prose.
     */
    pivot:
      "That is what I was told before I came. Here is what I actually wrote down in my journal:",
    /*
     * THERE USED TO BE AN `onward` LINE HERE READING "Ask me anything about this place", AND IT WAS A
     * PROMISE THE SITE CANNOT KEEP.
     *
     * It was written as a handover into the facets below, on the reasoning that phrasing them as
     * questions put to the traveller makes the visitor an asker rather than a reader. The problem is
     * what "anything" advertises. A reader reported that the line reads as a chat box: they expected to
     * be able to type a question about the country and get an answer. What is actually below is six
     * fixed topics drawn from the workbook, and there is no free-text input anywhere on the site.
     *
     * That is a false affordance rather than a wording preference, which is why the line is deleted
     * instead of reworded. The facet explorer's own heading already names what it offers, so nothing
     * fills the gap: the section below introduces itself.
     *
     * THE RULE: copy may not describe an interaction the interface does not support. "Ask me anything"
     * is the exact shape of the failure, because the medium makes it sound like a feature.
     */
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
  /*
   * THERE USED TO BE AN `eyebrow` HERE READING "Ask the traveller", AND IT WAS DELETED FOR BREAKING
   * THE ONE THING THIS SECTION HAS TO GET RIGHT: THE HANDOVER.
   *
   * A reader reported it as out of place and as interrupting the flow, and the structural reason is
   * that it made the visitor read the same instruction twice in three lines. The heading directly
   * below is "What do you want to know?" — the traveller already speaking, already inviting the
   * question. An eyebrow above it saying "Ask the traveller" is the interface leaning in first to
   * announce that a conversation is about to happen, which is the one thing that stops it being one.
   *
   * IT WAS ALSO THE THIRD PERSON, ON THE ONE SCREEN THAT IS ENTIRELY THE FIRST PERSON. "Ask the
   * traveller" refers to the speaker as a role, so between the arrival's "here is what I wrote down"
   * and this section's "six things I paid attention to", a label appeared calling that voice "the
   * traveller". That is the site's own voice labelling its narrator, and it lands as a section header
   * in a report.
   *
   * WHY REMOVING IT COSTS NOTHING STRUCTURALLY, since eyebrows are a site pattern (`SIGNPOST`,
   * `departureLines`, HOMECOMING all have one): those three sit above headings that do not introduce
   * themselves. "What do you want to know?" is a question addressed to the reader, which is already the
   * strongest possible section opener. The `<h2>` remains the labelled landmark — see FacetExplorer,
   * where `ariaLabelledBy` points at the heading and never pointed at the eyebrow — so the document
   * outline is unchanged and no screen-reader user loses a signpost.
   *
   * NOTE THE PATTERN THIS IS THE SECOND CASE OF. "Ask me anything about this place" was deleted from
   * `arrivalGreeting` for promising an interaction that does not exist. This is the milder form of the
   * same instinct: copy that describes the interaction instead of conducting it.
   */
  heading: "What do you want to know?",
  /*
   * A FUNCTION, BECAUSE THE COUNT WAS TYPED. It read "Six things I paid attention to" with the six
   * spelled out by hand, and the number of facets is `TOTAL_FACETS` — so adding or removing a facet made
   * this sentence quietly wrong on all five country pages, with no compiler and no test to catch it. Copy
   * in a data file has no call-site checking at all; the only defence is deriving the number.
   *
   * IT HAS ALREADY BEEN WRONG ONCE, in the other direction: the home page's premise said "the same four
   * things everywhere" while this line said six, and the contradiction was found by screenshotting both
   * sections rather than by reading either file. Same precedent as `PASSPORT.lead(stops)` and
   * `OPENING.coverIntro(stops, days)` — every count the site says out loud is passed in.
   */
  lead: (count) => `${count} things I paid attention to everywhere I went. Open them in any order.`,
  /*
   * Progress copy. Deliberately never a fraction or a percentage: "four of six" is a completion
   * meter and turns curiosity into a chore. See `progressLine` below for the wording.
   */
  /*
   * REWRITTEN FOR THE FAULT FOUND ON THE FACET PANELS: "There is more to any country than six
   * questions" was a denial of something nobody claimed. Nobody who has just opened six cards believes
   * they now know India. So the sentence told the reader a thing they already knew, in the site's own
   * voice, at the moment they finished — and it did it by pointing out a limitation, which turns the
   * reward for reading everything into a disclaimer.
   *
   * IT ALSO CONTRADICTED THE SITE'S OWN STRUCTURE. The next thing on screen is the departure, offering
   * another country. A reader is not at an end that needs qualifying; they are at a junction.
   *
   * THE REPLACEMENT REPORTS WHAT HAPPENED AND HANDS OVER. "All six" is the fact, and the second clause
   * is the honest positive the old sentence was groping for: what is missing is not a caveat about
   * questions, it is the reason to go somewhere yourself.
   */
  /* Also a function, and for the reason given on `lead` above: "all six" is the same typed count. */
  allSeen: (count) =>
    `That is all ${count}, and everything I thought to write down. The rest of it you would have to go and see.`,
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
  /*
   * `total` spelled out, so the sentence says "all six" rather than "all 6". This function already
   * received the count — it is the branch condition on the line above — so making `allSeen` a function
   * cost nothing here, which is the tell that the number should always have come from the data.
   */
  if (opened >= total) return EXPLORER.allSeen(spellOut(total));
  if (opened === 1)
    return "One question asked. They are all short.";
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
    /*
     * THE SECOND CLAUSE IS CUT: "which is the only reason the order matters at all." Same fault as the
     * facet panels — it raises a question nobody asked (does the order matter?) in order to half-answer
     * it, and the answer it gives contradicts the home page, which tells the reader to start wherever
     * they like. So on Japan's page the site says order is optional and on India's it says there is
     * exactly one reason it matters. A reader who noticed both would be right to be confused.
     *
     * "A DIFFERENT KIND OF DAY" IS THE WHOLE OF WHAT THIS LINE NEEDS TO SAY, and it is the thesis: a
     * difference in KIND, never in degree (§7.4). Everything after the comma was the site explaining its
     * own navigation to itself.
     */
    reason: "It is a different kind of day entirely.",
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
   *
   * ------------------------------------------------------------------------------------------------
   * REWRITTEN, BECAUSE THE PAST TENSE WAS TOO CLEVER TO SURVIVE BEING READ ONCE.
   *
   * It read "Twenty-eight days, and it was blank when I left." The header note above calls this the most
   * important sentence on the home page and defends it at length: the journal is drawn blank, the caption
   * is in the past tense, so the visitor is standing at the start of a trip that already happened to
   * somebody else. That is a real idea and the sentence does contain it.
   *
   * WHAT IT ALSO DOES, WHICH IS FATAL: the object beside it is a notebook with five stamped slots and
   * five country names, plainly not blank, under a caption insisting it was blank. A reader asked "it was
   * blank??" and that is the only available reading — the caption appears to be describing the picture and
   * getting it wrong. The clever reading requires noticing that "was" refers to a different moment from
   * the one being drawn, and nobody reads a caption twice to find that out. A caption is read as a label
   * for what it sits under; a caption doing something other than labelling has to survive being taken as
   * a label first, and this one did not.
   *
   * THE REPLACEMENT KEEPS THE TIME SHIFT AND MOVES IT OFF THE OBJECT. "I started with nothing in it" is
   * still past, still the traveller, and still puts the visitor at a beginning — but its subject is the
   * TRAVELLER'S starting point rather than the state of the thing on screen, so it cannot be misread as
   * a false description of the picture. The second clause is what the visitor does next, which is the job
   * this caption has directly above an "Open the journal" button.
   *
   * THE COUNT COMES OFF IT TOO. `JOURNAL.heading` sits about eighty pixels above and reads "Twenty-eight
   * days, five stamps, one notebook", so "Twenty-eight days" was the third time that number appeared in
   * one screen once the cover lines got it back. The heading is the right place for it: it is counting
   * what is in the object, which is what a heading over an object does.
   *
   * "SEE WHERE IT WENT" WAS THE FIRST DRAFT OF THE SECOND CLAUSE AND IT HAD THE SAME DISEASE AS THE LINE
   * IT REPLACED: read against a notebook, "where it went" says the notebook went somewhere. The intended
   * subject was the twenty-eight days. Caught in a screenshot again, which is now twice in two rounds that
   * a caption beside this object has been misread through the object — worth stating as the rule for
   * anything written in this position: THE JOURNAL'S CAPTION IS READ AS BEING ABOUT THE JOURNAL, so any
   * pronoun in it will attach to the notebook whatever the sentence meant.
   *
   * The version that survives has no pronoun in its second clause. "See what I found" makes the traveller
   * the subject and the findings the object, both of which are unambiguous, and it is the same promise:
   * the pages are full of something and the button is how you get at it.
   */
  emptyCaption: "I started with nothing in it. Open it and see what I found.",

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
    `${stops} stops, in the order we made them. Where we were, and one thing worth remembering from each.`,

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
    "Nothing in it yet. This is where the trip gets written down as it happens: one stamp and one remembered thing per country, in the order you go.",
  emptyAction: "Start where the traveller started",

  /* SOME VISITED. Names what is here and what is not, without counting either. */
  partialLead:
    "What is in the record so far, in the order you went. The stamps that are still outlines are countries you have not opened yet.",

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
