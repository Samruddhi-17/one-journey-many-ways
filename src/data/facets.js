/*
 * facets.js — the six questions a visitor can put to the traveller, as data.
 *
 * ============================================================================================
 * WHAT A FACET IS, AND WHY THE CHAPTER IS BUILT FROM THEM
 *
 * The previous build was four fixed movements read top to bottom: arrival, living, culture,
 * reflection. It was honest and it was inert — the visitor's only decision was whether to keep
 * scrolling. A facet is the replacement unit: one question, the evidence that answers it, and the
 * traveller's own note on the same subject. The visitor opens them in whatever order they like.
 *
 * WHY SIX, AND WHY THESE SIX. Not because six is a nice number — because the dataset contains
 * exactly six subjects it can answer honestly, and every one of them has the traveller's voice
 * attached to it. Five of the six pair with one of the workbook's five observations (Time Usage,
 * Food, Transport, Language, Culture); the sixth pairs with `didYouKnow`. That is the entire
 * first-person content in the dataset, all of it used, none of it invented.
 *
 * THE THREE FIGURES THE WORKBOOK HOLDS THAT NO FACET USES, and why each is left out. This list
 * matters more than the six that are included, because "we have the number so let us show it" is
 * how a story becomes a dashboard:
 *
 *   happinessScore (6.15 for Japan) — a single score per country, on one axis, comparable at a
 *      glance. It exists to answer "so who won", which is the question this project was built in
 *      order not to ask (§7.4, Principle 6). No presentation fixes that; the number's shape IS
 *      the ranking.
 *
 *   touristArrivalsMillions (36.9) — measures how many outsiders visit, which is a popularity
 *      figure about a country rather than a fact about living in one. It would also quietly
 *      reframe every country as a destination, when the whole premise is ordinary life.
 *
 *   workHoursPerWeek (36.7) — left out for a reason discovered by checking it against the day
 *      series, and worth preserving because it looks like the single most relevant number on the
 *      page. The day facet says Paid Work / Study takes 6.3 hours. A reader who sees "36.7 hours
 *      a week" beside it will multiply: 6.3 × 7 = 44.1, or 6.3 × 5 = 31.5. Neither is 36.7, so
 *      one of our two figures looks wrong. Neither IS wrong — weekly hours are per employed
 *      worker, the day series averages everyone aged 15–64 including students across all seven
 *      days — but reconciling two survey methodologies is not what a facet is for, and a figure
 *      that reads as inconsistent damages trust in the figures that are solid (Principle 15).
 *
 * WHY THE COPY LIVES HERE RATHER THAN IN THE COMPONENT
 * Each facet's question, its caption, and the one-line framing the site says before the evidence
 * are all editorial decisions about the same six subjects. Written together in one file they can
 * be revised for a consistent voice; spread across six JSX branches they drift immediately. The
 * component that renders a facet therefore contains no country-specific and no subject-specific
 * copy at all — it renders whatever this file describes.
 *
 * WHAT IS NOT HERE: the values. A facet declares which QUESTION it asks and which SHAPE of
 * evidence answers it. The numbers are read from the joined country at render time via the
 * accessors in journey.js. Copying data into this file would create a second source of truth for
 * something `npm run data` regenerates.
 * ============================================================================================
 */

/*
 * ============================================================================================
 * WHERE A METHOD NOTE GOES, AND WHY EVERY ONE OF THEM MOVED.
 *
 * A reader reported that the explanations of how the figures were made "break the flow of the
 * reviewer", and asked for them below rather than beside the evidence. They are right, and the fault
 * was structural rather than a matter of wording, so it is worth writing down what the two fields are
 * for now that the line between them has been drawn properly.
 *
 * WHAT WENT WRONG. `framing` is spoken BEFORE the evidence — that placement is Principle 3, so that a
 * chart is read as support for a claim rather than as decoration. Three of the six facets had quietly
 * turned that slot into a methods section. The food facet's framing ran to forty-two words about
 * which ruler the bars were drawn against; language's opened by explaining why there was no chart at
 * all; culture's began "Nothing on this one is measured". So the last thing a visitor read before
 * looking at the evidence was a warning about the evidence. That is the opposite of what framing is
 * for: it makes the reader audit the figures instead of reading them, and it puts the driest sentence
 * on the page at the exact moment their attention is highest.
 *
 * THE SPLIT, STATED AS A RULE:
 *
 *   `framing`  — WHAT THE READER IS LOOKING AT, in one sentence, before they look at it. It may say
 *                what the numbers measure, because that is needed to read them at all. It may not
 *                explain how they were made, argue about their precision, or apologise for them.
 *
 *   `caveat`   — HOW THE FIGURES WERE MADE AND WHAT THEY WILL NOT BEAR, after the evidence and after
 *                the traveller's note, set as a labelled note the reader can skip. Everything moved
 *                out of `framing` landed here, in plainer words: a reader asked what four of these
 *                sentences meant, which is the clearest possible sign that they were written for
 *                somebody who already knew.
 *
 * FOUR FACETS NOW CARRY A NOTE WHERE TWO DID. That is a deliberate increase, and it is not the site
 * becoming more defensive — the same information was already on the page, said earlier and worse. The
 * count is up because the notes are now in the field that renders them as notes. See FacetCard for
 * how it is set: a hairline, a small label, and grey type, so it reads as a footnote rather than as
 * the writing continuing.
 *
 * WHAT DID NOT MOVE: anything the reader needs in order to understand the picture in front of them.
 * "These are yearly totals per person" stays in the framing, because a reader who misses it
 * misreads the bars. "The bars are scaled to Switzerland's dairy figure" goes below, because a reader
 * who misses it has still read the bars correctly. That is the test.
 * ============================================================================================
 */

/*
 * The six facets, in the order they are offered.
 *
 * ORDER IS EDITORIAL AND IT IS NOT A RANKING — nothing here is sorted by any value, and the
 * visitor can open them in any sequence, which is the structural guarantee that the order carries
 * no claim (§7.4). What the order does carry is a sensible first impression: the day comes first
 * because it is the only facet that frames all the others (every other subject is something that
 * happens inside those twenty-four hours), and the surprise comes last because it is the one that
 * works best as a parting shot rather than an introduction.
 *
 * `kind` names the shape of the evidence, and the renderer switches on it. It is deliberately a
 * shape ('divided-bar') rather than a subject ('day'): two facets could legitimately want the same
 * form, and a renderer keyed on subject would be five components pretending to be one.
 *
 * `note` names which observation section supplies the traveller's voice. `null` means this facet
 * uses `didYouKnow` instead, which only the surprise facet does.
 */
export const FACETS = [
  {
    id: 'day',
    /*
     * The question is what the visitor sees on the closed card, so it has to be the thing they
     * would actually wonder. "Time allocation by activity" is the dashboard title for this same
     * chart and it is addressed to an analyst; "What does a day look like?" is addressed to a
     * person (DESIGN_SYSTEM.md §2 — chart titles become questions, Principle 7).
     */
    question: 'What does a day look like?',
    /* The one-word label on the card face. Short enough to read at a glance on a phone. */
    label: 'A day',
    /*
     * `teaser` appears on the closed card and its job is to make opening the card feel worthwhile
     * without giving away the answer. Note it names the SUBJECT, never a value — a teaser
     * containing "10.4 hours" would make the card the answer and the panel redundant.
     */
    teaser: 'Twenty-four hours, divided the way people here actually divide them.',
    kind: 'divided-bar',
    note: 'Time Usage',
    /*
     * `framing` is the site's own voice, spoken once before the evidence appears. It exists because
     * a chart shown before the claim it supports is decoration and the same chart after it is
     * evidence (Principle 3) — so every facet states what to look for before showing anything.
     *
     * It is written to be true of all five countries, which is the constraint that keeps it honest:
     * a sentence that only works for Japan would have to be five sentences, and five sentences
     * about the same chart is where a shared component starts branching.
     */
    framing:
      'Every day is the same length everywhere. What changes is where the hours go.',
    /*
     * `caveat` is Principle 17 attached to the specific evidence it qualifies, rather than
     * collected in a page footer nobody reaches. Only the facets that need one have one.
     *
     * IT USED TO SAY "from a single dataset", WHICH WAS FALSE ABOUT THIS PROJECT'S OWN PROVENANCE. The
     * figures were compiled from several published sources before they reached the workbook, so calling
     * them one dataset understated the sourcing and misdescribed where they came from. Corrected here and
     * in the site footer, which carried the same wrong claim.
     *
     * REWRITTEN AGAIN, BECAUSE THE SECOND HALF WAS DOING NOTHING. It read "Useful for shape and
     * proportion, unreliable for anything more precise" — which is true, and is a sentence about
     * averages in general rather than about this chart. A reader asked whether this note needed to be in
     * the visual at all; it does, but it needed to earn the space by saying something a reader could
     * act on.
     *
     * SO IT NOW NAMES THE FACT THAT CHANGES HOW THE BAR SHOULD BE READ, and it is in the data: the
     * average runs across all seven days, which is why the paid-work figure is lower than a working
     * day would suggest. That is genuinely surprising — 6.3 hours of paid work reads as a short day
     * until you know weekends are in it — and it is the same reconciliation the file header does for
     * the unused `workHoursPerWeek` figure. A reader who knows it can read the chart; a reader told
     * only that averages are imprecise has been given a mood.
     *
     * IT NAMED THE AGE BAND TOO, AND THAT HALF IS CUT, because the evidence's own figcaption is on the
     * same screen reading "An average day for someone aged 15–64" — so the band was printed twice in one
     * panel. Same duplication as the food figcaption's scale clause, found the same way, and the division
     * of labour that prevents it is written out on the transport facet below.
     */
    caveat:
      'The average runs across all seven days of the week rather than working days only, which is why the paid-work figure is shorter than a weekday would be. Nobody has a day that looks exactly like this one.',
  },
  {
    id: 'transport',
    question: 'How do people get around?',
    label: 'Getting around',
    teaser: 'The smallest part of the day, and the one that shaped everything else.',
    kind: 'share-bars',
    note: 'Transport',
    /*
     * REWRITTEN. It read: "How a country moves says something about how it was built: whether people
     * travel together or separately, and whether that is really a choice." A reader called it a very bad
     * sentence, and it is, in three separable ways worth naming so the replacement does not repeat any
     * of them.
     *
     *   "SAYS SOMETHING ABOUT" IS A SENTENCE DECLINING TO MAKE A CLAIM. It promises a conclusion and
     *   supplies none, which is worse than saying nothing: the reader waits for the point through the
     *   whole colon.
     *
     *   "HOW IT WAS BUILT" IS AN ASSERTION THE DATA CANNOT SUPPORT. The workbook holds four percentages
     *   per country and nothing about infrastructure, planning or history. Drawing a line from a modal
     *   share to how a country was built is exactly the kind of invention Principle 15 forbids, and it
     *   was the site's own voice doing it.
     *
     *   "WHETHER THAT IS REALLY A CHOICE" IS A JUDGEMENT WITH A COUNTRY IMPLIED. Read against America's
     *   85.5% private vehicle, it says one country's people are not free — which is the site ranking a
     *   place while claiming it never does. The traveller is barred from judging a country (see voice.js);
     *   the site's own narration is bound by the same rule and this sentence broke it.
     *
     * THE REPLACEMENT STATES WHAT THE BARS ARE AND ONE TRUE THING ABOUT THEM. No colon, no verdict, and
     * nothing a reader has to take on trust.
     *
     * "DIFFER FROM EACH OTHER MOST" IS A MEASURED CLAIM, NOT AN IMPRESSION, and it was computed across
     * the workbook before being written down. Widest spread between the five countries, in percentage
     * points, for every share the dataset holds:
     *
     *   transport, private vehicle       38    – 85.5   47.5 points
     *   transport, public transit         5    – 46     41.0
     *   language, dominant tongue        62    – 99     37.0
     *   day, paid work as a share of 24  20.0  – 29.6    9.6
     *   day, commuting                    3.8 –  5.0     1.3
     *
     * So the two widest gaps in the whole dataset are both in this facet, and the day — the facet the
     * visitor is likely to expect variation from — is the most uniform thing on the site. That is worth
     * saying out loud on the transport card, and it is the sentence the old framing was reaching for
     * before it went looking for a cause.
     *
     * IT DOES NOT SAY WHICH COUNTRY IS AT EITHER END, which is the line that keeps it out of §7.4. A
     * range is a property of the five taken together; naming the extremes would make it a placing.
     *
     * IT ALSO DOES NOT NAME THE UNIT, WHICH IT DID IN DRAFT ("as a share of journeys"). The evidence's
     * own figcaption is the very next line on screen and it reads "Share of everyday journeys by mode",
     * so the draft had the reader told the same thing twice in two consecutive sentences. The division
     * of labour is worth stating once for all six facets: the FRAMING says what is interesting, the
     * FIGCAPTION says what the numbers are, and the NOTE says how they were made. Anything that appears
     * in two of the three is a duplication that only shows up when the panel is rendered.
     */
    framing:
      'How people get from one place to another. This is where the five countries differ from each other most.',
    caveat: null,
  },
  {
    id: 'food',
    question: 'What is on the table?',
    label: 'Food',
    teaser: 'What a year of eating adds up to, per person.',
    kind: 'scaled-bars',
    note: 'Food',
    /*
     * SPLIT IN TWO, AND BOTH HALVES REWRITTEN. This was the worst offender of the six: a forty-two word
     * framing about scale choice, spoken before the reader had seen a single bar.
     *
     * THE PHRASE A READER ASKED ABOUT: "unlike the hours in a day they do not add up to anything." It
     * was written to head off a real misreading — the day facet's bar IS a whole, so a reader arriving
     * at food might expect these three bars to total something. But as written it is a comparison to
     * another card the reader may not have opened, phrased as a negation, and "do not add up to
     * anything" reads as though the figures are meaningless rather than as though they are independent
     * quantities. Two readings, and the wrong one is the more natural.
     *
     * WHAT REPLACES IT SAYS THE SAME THING POSITIVELY AND CONCRETELY: three separate yearly totals per
     * person. "Separate" carries everything the negation was for, because a reader who knows the three
     * are separate does not try to add them, and nothing has to be said about the day facet at all.
     *
     * THE SCALE EXPLANATION MOVED TO THE CAVEAT below. It is genuinely important — an unexplained choice
     * of scale is the commonest way a bar chart misleads without containing a false number — but it is
     * information about the drawing rather than about the food, and a reader who skips it still reads
     * every bar correctly. That is the test set out in the file header.
     */
    /*
     * NOTE WHAT THE FIRST DRAFT OF THIS GOT WRONG, because it was caught in a screenshot rather than by
     * reading the file: it ended "so a length here means the same thing as a length in Japan" — and it
     * was rendered on Japan's page, telling the reader that a length in Japan means the same as a length
     * in Japan. Framings are shared by all five countries (that constraint is stated on the day facet),
     * so naming any country in one is a sentence that is false on exactly one fifth of the site. The
     * general form: a shared string may describe the OTHER pages only as "the other pages".
     *
     * "YEARLY" AND "PER PERSON" ARE ALSO GONE FROM IT, for the reason set out on transport: the
     * figcaption directly beneath reads "Kilograms per person per year", so the draft printed the unit
     * twice in consecutive lines. What is left is the only thing the framing was ever needed for — that
     * the three do not combine — plus the scale, which is a property of the drawing and appears nowhere
     * else above the note.
     */
    framing:
      'Three separate totals, each standing on its own. Every bar on every country page is drawn to the same scale, so lengths mean the same thing from one page to the next.',
    /*
     * THE CAVEAT NOW CARRIES BOTH METHOD NOTES, AND THE OPENING PHRASE HAD TO GO.
     *
     * "Availability per person, not what anyone eats" is the single most important thing on this card
     * and a reader asked what it meant, which means it failed. The distinction is real and it is not
     * pedantry: these figures are food supply divided by population — what reached the shops and
     * kitchens of a country — so they include everything thrown away, fed to animals or never sold. Per
     * capita supply runs well above per capita intake everywhere for exactly that reason. Written as a
     * two-word noun phrase ("availability per person") it was jargon; written as what the number was
     * made from, it is checkable.
     *
     * "More of something is not better than less of it, and nothing here is a diet" was the second
     * sentence and it is cut. It answers an accusation nobody made, and it is the negation-as-copy
     * failure recorded in voice.js. What replaces it is the same protection stated as a fact about the
     * measurement: a national total tells you nothing about one person's plate, which is true and is
     * why no reader should score the countries on it.
     */
    caveat:
      'These are national food supply figures divided by population, so they count what reached the shops and kitchens rather than what anyone put on a plate. Waste, animal feed and stock are all inside them. The scale every bar is drawn against is the largest single figure on the journey, which is a Swiss dairy total.',
  },
  {
    id: 'language',
    question: 'What will I hear on the street?',
    label: 'Language',
    teaser: 'Which languages share the same pavement, and how widely.',
    /*
     * A DELIBERATELY DIFFERENT SHAPE, AND THE REASON IS THE DATA ITSELF.
     *
     * Three of the five countries record their language figures as ranges — "15–30%" for English in
     * Japan, "12–18%" in India — because that is genuinely the state of the evidence. A bar has one
     * length, so drawing a range as a bar requires picking a point inside it, which converts an
     * honest uncertainty into a false precision. The dataset does carry a `share` midpoint for
     * exactly that purpose and this facet ignores it.
     *
     * So the evidence is set as text: the range is printed as written, and "15–30%" tells the
     * reader something a 22.5% bar actively hides — that nobody knows the number to better than
     * fifteen points. Principle 17 is not a disclaimer you add underneath a chart; sometimes it is
     * the reason there is no chart.
     */
    kind: 'stated-list',
    note: 'Language',
    /*
     * SPLIT IN TWO. The old framing opened by explaining why there was no chart, which meant the first
     * thing a reader met on this card was an argument about a graphic they had not been shown and would
     * never see. A reader asked what it meant, and the reason it is hard to follow is that it answers a
     * question nobody had yet: they had not been wondering where the bars were until the copy raised it.
     *
     * "Where nobody knows a share to better than fifteen points" was also arithmetic done in the
     * reader's absence. It refers to Japan's English figure, "15–30%", whose range happens to be fifteen
     * points wide — but the figure is not printed until several lines further down, so the number
     * arrived with nothing to attach to. The widths in the data are actually 3 to 15 points depending on
     * the row, so "fifteen points" was the widest case stated as though it were the rule.
     *
     * THE FRAMING NOW SAYS WHAT THE READER IS ABOUT TO SEE, and its second sentence is the genuinely
     * useful thing on this card: the three shares are not slices of one whole. A reader who assumes they
     * partition the population has misread the facet entirely, and the old copy never mentioned it.
     *
     * THE FIRST DRAFT OF THAT SENTENCE SAID "the shares overlap, because most people here can use more
     * than one", AND IT WAS WRONG FOR TWO OF THE FIVE COUNTRIES — which is worth recording, because it
     * was checked only after being written. Summing the midpoints per country: Japan 122%, Italy 129%,
     * United States 110% — all over a hundred, so the overlap claim holds. But India sums to 78% and
     * Switzerland to 93%, both UNDER, because three rows do not cover a country with dozens of
     * languages. So "most people speak more than one" is not a fact about all five, and the framing has
     * to be true of all five or it becomes five sentences (see the note on the day facet's framing).
     *
     * THE VERSION THAT SURVIVES NAMES BOTH REASONS THE SUM MISSES A HUNDRED — double-counting in one
     * direction, unlisted languages in the other — which is true everywhere and is the whole of what a
     * reader needs in order not to add the rows up.
     */
    framing:
      'Three of the languages you would hear, and how much of the country uses each. They are not slices of one whole: many people are counted under more than one, and every country here has more languages than three.',
    /*
     * THE "WHY NO CHART" ARGUMENT MOVED HERE, WHICH IS WHERE IT BELONGS. It is a note about how the
     * evidence was made and what it will not bear — the definition of a caveat in this file — and a
     * reader who skips it still reads every row correctly, which is the test.
     *
     * It is also shorter and it names the thing on screen. A reader can look at "15–30%" while reading
     * this sentence, so the sentence can point at it instead of describing it in the abstract.
     *
     * AND THEN IT HAD TO BE REWRITTEN AGAIN, BECAUSE "SOME OF THESE ARE PRINTED AS RANGES" IS FALSE ON
     * SWITZERLAND'S PAGE. Caught in a screenshot: Switzerland reads 62%, 23%, 8% — three plain numbers,
     * under a note announcing ranges that are not there. Every display string in the dataset, checked
     * afterwards rather than before, again:
     *
     *   Japan          99%                          15–30%    0.6–1%
     *   India          43.6% (Native); ~55% incl L2  12–18%    8%
     *   Italy          95%+                          30–35%    1.8–2%
     *   Switzerland    62%                           23%       8%
     *   United States  78% (Home); ~95% Total Fluent 13–14%    1%
     *
     * So four countries have at least one range and the fifth has none. This is the same failure as the
     * food framing's "a length in Japan" and the first draft of the framing above: a string shared by
     * five pages was written while looking at one of them. THE FIX IS TO SAY WHAT IS TRUE OF THE WHOLE
     * JOURNEY — that figures are printed as the sources give them, ranges included — which describes
     * Switzerland's three plain numbers as accurately as it describes Japan's two ranges, because a
     * number given precisely IS the source's figure as written.
     */
    caveat:
      'Each figure is printed as its source gives it, which sometimes means a range rather than a single number. Narrowing a range to one figure would look more certain than anything anyone actually knows, so nothing here is rounded into a bar.',
  },
  {
    id: 'culture',
    question: 'What did you actually do there?',
    label: 'Culture',
    teaser: 'Three things worth going out of the way for.',
    kind: 'experiences',
    note: 'Culture',
    /*
     * SPLIT IN TWO. It read: "Nothing on this one is measured. These are three things the traveller went
     * to, chosen by them, which is a different kind of evidence from everything else here and worth
     * naming as such." A reader asked what it was even saying, and the sentence deserves that.
     *
     *   IT OPENED ON A DISCLAIMER. "Nothing on this one is measured" is the first thing a visitor read
     *   after asking "what did you actually do there?" — an answer that begins by discounting itself.
     *
     *   IT REFERRED TO THE TRAVELLER IN THE THIRD PERSON, on the one card that is entirely their own
     *   choices. Everywhere else on the page that voice says "I"; here the site said "the traveller
     *   went to", which puts a curator between the visitor and the person they have been walking with.
     *
     *   "WORTH NAMING AS SUCH" IS THE SITE NARRATING ITS OWN EDITORIAL PROCESS. It tells the reader that
     *   a distinction is worth making instead of making it. That clause is the clearest example on the
     *   site of the register the whole rebuild was meant to leave behind, and it is why this note is
     *   longer than the copy it replaces.
     *
     * THE FRAMING NOW JUST ANSWERS THE QUESTION, in the first person, in nine words. The honest
     * qualification — that these are choices rather than a measurement — is not lost; it moves to the
     * caveat below, where it can be said plainly without standing in front of the photographs.
     */
    framing:
      'Three things I went out of my way for, and what they were.',
    /*
     * WHAT PRINCIPLE 10 ACTUALLY REQUIRES HERE, said after the evidence rather than before it. The
     * visitor does need to know that this card is a different kind of thing from the five that carry
     * figures — otherwise three photographs sit on a page of measurements and read as evidence of
     * something typical. The fix is to say it once, plainly, where a reader has already seen what is
     * being qualified.
     *
     * "not a sample of anything" IS THE LOAD-BEARING PHRASE. Three experiences chosen by one person are
     * not a description of a culture, and the risk on this card is precisely that a visitor generalises
     * from them. Saying so is Principle 17; saying so first was the mistake.
     */
    caveat:
      'One person choosing three things they liked, which is not a sample of anything. Every country here has thousands more.',
  },
  {
    id: 'people',
    question: 'Who lives here?',
    label: 'The people',
    teaser: 'How many, how long, and one thing nobody warned about.',
    /*
     * `stated-facts` and NOT bars, which is the whole point of this facet's shape.
     *
     * Population and life expectancy are the two most rankable figures in the dataset: both are
     * single numbers per country on a single axis, and drawn as bars against a shared scale they
     * would read as a scoreboard — India's population bar dwarfing Switzerland's says nothing
     * about living in either place, and a life-expectancy ramp says one country is doing better.
     *
     * Set as sentences instead, each figure sits on its own and invites no comparison of lengths.
     * This is the same reasoning that keeps the happiness score off the site entirely; the
     * difference is that these two are genuinely useful context for the facets around them, so
     * they are presented in the one form that cannot be ranked by eye.
     */
    kind: 'stated-facts',
    /*
     * The only facet with no matching observation — the workbook's five sections do not include
     * one about population. So its voice is `didYouKnow`, which is the dataset's own surprising
     * fact and is a better closing note than an observation would be anyway.
     */
    note: null,
    framing:
      'Two numbers, set as sentences rather than bars on purpose: a population is not a score, and a longer life expectancy is not a country doing better at being a country.',
    caveat: null,
  },
]

/*
 * A lookup, built once. Same reasoning as the joins in journey.js — the result cannot change, so
 * it should not live anywhere that implies it might.
 */
const FACETS_BY_ID = new Map(FACETS.map((facet) => [facet.id, facet]))

/** One facet by id, or undefined. */
export function getFacet(id) {
  return FACETS_BY_ID.get(id)
}

export const TOTAL_FACETS = FACETS.length
