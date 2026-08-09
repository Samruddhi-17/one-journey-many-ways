# Product Vision

**One Journey. Many Ways of Living.**
*How the World Lives, Thrives and Connects.*

Status: **APPROVED** — Session 3. Amendments from review incorporated (§2.1, §3.4, §4.4, §7, §8).

> This is the highest-level document in the repository and the **highest authority in the
> project**. Every other document derives from it. When [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
> or any future decision conflicts with this file, **this file wins** and the other document
> is wrong.
>
> Every design decision — typography, colour, spacing, motion, component — must be
> explainable in terms of the experience defined here. "It looks better" is not a
> justification. "It serves principle N because…" is.

**Approved in review:** expectation-versus-discovery as the central narrative (§2.1) ·
never implying one country is better (§7, Principle 6) · "Thrives" remains an open question
(§2.2) · the traveller is an anonymous guide, not a protagonist (§3.4) · 8–12 minutes as a
consequence of quality, not a target (§3.2) · a reflective ending, not a statistical one
(§4.4) · **Principle 7**, *data should answer questions, not end conversations* (§8).

---

## 1. Why this project exists

There is no shortage of data about the world. Life expectancy, working hours, happiness
indices, commute times, tourist arrivals — all of it is freely available, endlessly
charted, and almost entirely forgettable.

The reason is that these numbers are usually presented as *measurements of countries*
rather than *descriptions of lives*. A bar chart ranking five nations by average working
hours tells you which bar is longest. It does not tell you that in Japan, despite some of
the longest working hours in the group, people still protect time for hobbies and personal
routine — so life there feels **structured rather than rushed**. That sentence is the
interesting thing. The bar chart is not.

This project exists to close that gap. It takes a small, honest dataset about five
countries and presents it the way a traveller would actually experience it: one place at a
time, in sequence, led by what you see and feel, with the numbers arriving as
*confirmation* rather than as the point.

**The project's purpose in one sentence:**
To make a visitor feel they have travelled through five countries and understood something
true about how people live there — and to have that understanding rest on real data
without ever feeling like they were reading a report.

### The secondary purpose, stated honestly

This is also a portfolio piece — the first professional website of a Business Intelligence
Engineer. That is worth stating plainly because it shapes a real decision: **the goal is
not to demonstrate analytical firepower.** Anyone can see that a BI engineer can build
charts. What is rare, and therefore worth demonstrating, is a data person who understands
that **the audience is a human being with a limited attention span and no stake in your
analysis.** Restraint is the skill on display here, not volume.

---

## 2. The story we are telling

### 2.1 The thesis

The dataset contains a genuine narrative spine, and it is not "here are five countries."
It is hidden in the traveller's own notes. Read them in sequence:

| Country | What the traveller wrote |
|---|---|
| Japan | *"I expected futuristic technology, but what stayed with me most was the culture of respect and quietness in everyday life."* |
| India | *"Every state felt like a new country, each with its own language, traditions, and unforgettable flavors."* |
| Italy | *"History wasn't confined to museums — it surrounded me on every street, square, and neighborhood café."* |
| Switzerland | *"I expected spectacular mountains, but I was equally impressed by the country's precision and efficiency."* |
| United States | *"Every state had its own identity, making one country feel like many different destinations."* |

Every one of these is the same shape: **what I expected, versus what I found.** Two are
literally phrased that way. Two are the discovery that a country contains multitudes. One
is the discovery that the past is not where you assumed it was kept.

**That is the story.** Not "the world is diverse" — which is a truism nobody needs a
website to learn. The story is:

> **You already have a picture of these places. It is not wrong, but it is not what
> matters most. Come and find out what actually does.**

This is a much better thesis than a comparison, because it gives the visitor something to
*do*. Every country becomes a small act of expectation and revision. And it converts our
data from a scoreboard into evidence: the numbers are how we prove that the surprising
thing is true.

**This is the central narrative of the project** — approved in review, and the specific
intent is worth recording precisely: *the site should encourage visitors to challenge their
own assumptions rather than simply compare statistics.*

That last clause is a design instruction, not a mood. A visitor who arrives with an
assumption and leaves having revised it has had the intended experience. A visitor who
leaves able to rank five countries has not — even if they enjoyed themselves. Wherever we
have a choice between *inviting a comparison* and *unsettling an expectation*, we choose
the second.

### 2.2 The three-part promise in the theme

The tagline commits us to three things, and each maps to a different kind of content:

| Word | Question it answers | Where it lives |
|---|---|---|
| **Lives** | How is a day actually spent? | Time use, food, transport — the texture of ordinary life |
| **Thrives** | What does a good life look like here? | Life expectancy, happiness, working hours — presented as **an open question, never a score** |
| **Connects** | What binds people together, and to us? | Language, culture, festivals, the journey itself |

If a section doesn't serve one of these three, it doesn't belong. This is the first test
any proposed feature must pass.

**"Thrives" remains an open question** — approved in review. Different societies define
success differently, and the project explores those differences rather than scoring them.
Practically, this means the "Thrives" material is always framed as *what is valued here*
rather than *how well this country did*. Life expectancy, happiness and working hours are
presented as evidence of differing priorities, never as three lanes of one race.

### 2.3 The journey as structure, not decoration

The five countries are not a menu. They are an **itinerary** — Japan, India, Italy,
Switzerland, the United States, in that order, over 28 days. The travel metaphor
(passport, stamps, stops, arrivals) is not skin applied over a dashboard; it is the
information architecture. Sequence carries meaning: you arrive in India *after* Japan, and
the contrast between the two is part of what you learn.

This is why the site is a journey with a beginning and an end rather than a filterable
tool. A dashboard lets you slice data any way you like and therefore has no narrative. We
are choosing to give up that flexibility on purpose, because **a story requires an
order.**

---

## 3. The experience a visitor should have

### 3.1 The shape of the visit

Think of it as five acts with a prologue and an epilogue:

**Arrival.** The visitor lands and is not asked to do anything. No filters, no menu of
options, no "select a country." One image, one sentence, one invitation: *begin*. The only
decision available is whether to start, which means nearly everyone starts.

**Departure into the first country.** The transition between the landing page and Japan
should feel like a threshold being crossed — not a page loading. This moment sets the
expectation that this site is going somewhere.

**Five arrivals.** Each country opens with a full view of a place, its name, and a phrase.
Then, gradually, the visitor descends from atmosphere into detail: what a day looks like,
what people eat, how they move, what they say, what they celebrate. Each country closes
with one human sentence — the traveller's note — and a stamp in the passport.

**The pull forward.** At the end of each country, the next one is already visible and
inviting. The site's momentum should always be forward. A visitor who stops reading should
stop because they ran out of time, not because they ran out of reasons to continue.

**Return.** The visitor sees the whole journey at once — five stamps, five places, the
things that were surprising — and only *then* is comparison across countries available at
all. Comparison is the reward for having travelled, not the entry point.

**Reflection.** The final screen is not a summary. It is the point of the whole thing,
stated quietly. See §4.4 — this is the last beat and the most important one.

### 3.2 The pace we want

Roughly **eight to twelve minutes** for a full read-through, and it should not feel like
eight to twelve minutes.

**But duration is an outcome, not a target** — approved in review: *optimise for quality
rather than duration; if removing a visualization improves the story, remove it.* This
matters more than it sounds, because it settles a class of future argument in advance. We
will never keep a weak section because the experience would otherwise feel short, and we
will never cut a strong one to hit a number. If the honest result is six excellent minutes,
that is the right product.

The number is still useful as a *constraint on ambition*: it means we cannot show every
figure in the dataset, and we should stop pretending we might. Every section earns its
place or leaves.

The rhythm within a country should breathe: a wide emotional moment, then a narrow factual
one, then wide again. Continuous density is exhausting; continuous atmosphere is
insubstantial. The alternation is what makes it feel like travel — long views punctuated by
small discoveries.

### 3.3 The two visitors we are designing for

**The wanderer** scrolls, looks at pictures, reads the big numbers and the one-line
observations, and leaves after four minutes having genuinely enjoyed it. **This visitor
must have a complete experience.** They are the majority, and designing for them is not a
compromise.

**The reader** stops at charts, reads every observation, wants to know where the numbers
came from. **This visitor must not hit a wall.** Depth is available for those who look for
it — sources, exact figures, definitions — but it is never in the way.

The design serves both by making the top layer emotional and self-sufficient, and the
lower layers factual and optional. Never the reverse. A site that requires engagement
before it gives pleasure will not get engagement.

### 3.4 The traveller: a guide, not a protagonist

Approved in review, and this is a more consequential decision than it appears — it governs
every sentence of copy on the site.

**Rejected:** a first-person narrator. **Adopted:** the visitor travels *alongside* an
anonymous traveller who acts as a guide. The reasoning you gave is the right one: it leaves
room for every visitor to imagine themselves making the journey. A named, characterised
narrator would make the site about *them*; an anonymous companion makes it about *you*.

What this means concretely:

| | |
|---|---|
| **The traveller is** | a quiet companion who noticed things and points them out |
| **The traveller is not** | a character with a name, a backstory, or opinions about themselves |
| **The visitor is** | the one having the experience — the actual protagonist |

Three rules follow:

1. **The traveller's voice is quoted, never assumed.** Their observations appear as
   attributed asides — a distinct, quieter register set apart from the main narration. They
   are the only first-person voice on the site, and they never speak for the visitor.
2. **The main narrative uses second person or none.** "You arrive in Japan," or simply
   "Japan." Never "I arrived in Japan." The exception is quoted observation.
3. **No biography, no name.** The moment the traveller becomes a *person* — someone with a
   history and a self to be interested in — the visitor becomes an audience. We want them to
   be a participant.

#### Amendment — Session 4: the traveller may be depicted

Rule 3 originally read "no biography, no photograph, no name", and the table said the
traveller has no face. Both have been narrowed, for two reasons.

**The first is that the visitor asked, twice, in the same words: "I cannot see the
traveller."** The first answer to that was a boarding-pass stub in the corner — the
traveller's luggage rather than the traveller, reasoned directly from the sentence above.
The complaint was then repeated verbatim, which settled what it meant. When a document's
rule and the person the document exists to serve disagree about that person's own
experience, the person wins and the document changes.

**The second is that the prohibition was written without knowing a depiction had been
supplied.** `images/` ships five illustrations of a traveller with a backpack, one per
country, each holding that country's passport, plus five sheets of matching stationery.
Nothing rendered them because the data pipeline had them behind an exclusion pattern whose
comment asserted they were dashboard screenshots — a claim nobody had verified by opening
the files. So the rule was not weighing a face against anonymity; it was ruling out
something it did not know existed.

**What is still prohibited, which is the part that was actually load-bearing.** The argument
in §3.4 is that a *characterised* narrator makes the site about them. That argument is
untouched and still governs:

- No name, no age, no nationality, no backstory, no stated preferences.
- The figure never speaks. Every word attributed to the traveller is still a quotation from
  `traveler_note` / `traveler_observation`, and still attributed as "the traveller".
- The figure carries no information. It is `aria-hidden`, and anything it might imply —
  which country, which stop, that someone is guiding you — is stated in text beside it.
- It is small and static. Rendered at a hard 160px ceiling with a single entrance and no
  looping motion, because a figure that follows you around the page is a mascot, and a
  mascot *is* a character.

The distinction is between a *portrait* and a *pictogram*. What the site now shows is closer
to the walking figure on a signpost or the illustrated guide in a museum leaflet than to a
protagonist: a body to attach the pointing to, with nobody in particular attached to the
body. §3.4's own table already said the traveller *is* "a quiet companion who noticed things
and points them out" — and pointing is something a body does.

Implementation: `src/components/journey/TravellerFigure.jsx` (the figure, the size ceiling
and the reason for it), `src/components/ui/Notepaper.jsx` (the stationery and its measured
contrast), `scripts/convertData.mjs` (`TRAVELLER_ASSETS`, and the corrected exclusion
comment that caused this).

The dataset's `traveler_note` and `traveler_observation` copy is already written in first
person, which is exactly right for quoted asides and needs no rewriting — only correct
framing. **The 30 observations in the dataset are therefore not garnish; they are the
traveller's entire presence in the product.** That raises their status considerably: they
are the mechanism by which a visitor feels accompanied rather than lectured.

The traveller is also how expectation-versus-discovery (§2.1) gets voiced. "I expected
futuristic technology, but…" is a companion admitting they were wrong — which gives the
visitor permission to have been wrong too. A neutral narrator cannot do that.

### 3.5 Where the visitor is

Most of them are on a phone, holding it in one hand, probably having followed a link.
**The mobile experience is the real product**, not a reduction of a desktop design. Any
idea that only works at 1440px wide is a decoration, and we should know that about it from
the start.

---

## 4. The emotions we are designing for

Emotion here is not mood-setting for its own sake. It is a memory strategy: people
remember how something felt long after they've forgotten what it said. If we want a visitor
to retain anything about Swiss punctuality a week later, the *feeling* of the Switzerland
section has to carry it.

### 4.1 The overall emotional arc

| Stage | Feeling | How it is earned |
|---|---|---|
| Landing | **Invitation** — "this looks like somewhere I want to go" | Beauty and restraint; one clear action |
| Arrival | **Anticipation, then presence** | A moment of pure place before any information |
| Within a country | **Curiosity → recognition** — "oh, that's interesting" | Small, specific, surprising facts |
| Between countries | **Contrast** — "that was completely different" | Distinct atmosphere, deliberate transition |
| Ending | **Reflection, and mild wistfulness** | Seeing the whole journey behind you |
| After leaving | **Having been somewhere** | The cumulative effect of all the above |

The single emotion the whole product optimises for: **"I'm glad I did that."**

### 4.2 The five atmospheres

Each country has a distinct emotional character. These are not stylistic themes chosen for
variety — each is drawn from what the traveller actually observed, which is why they will
feel true rather than applied.

**🇯🇵 Japan — calm, precision, technology, discipline.**
The feeling is *quiet order*. The traveller expected the future and found courtesy. Japan
should feel composed and unhurried, with nothing extraneous — the emotional equivalent of a
room where everything has a place. Where other countries persuade, Japan simply is.

**🇮🇳 India — energy, community, culture, celebration.**
The feeling is *abundance*. Life here revolves around work, family and community, with
festivals threaded through the entire year. India should feel like more is happening than
you can take in at once — warm, loud, generous. It is the only country whose section should
feel slightly overwhelming, because that is the honest experience.

**🇮🇹 Italy — history, art, food, slow living.**
The feeling is *unhurriedness*. Meals and conversations were never rushed; history is not
in museums but on the street. Italy should make the visitor slow down — the one section
where taking your time is the entire point, and where speed would be a betrayal of the
subject.

**🇨🇭 Switzerland — nature, peace, quality, balance.**
The feeling is *clarity*. Life is organised and efficient, which leaves room for
mountains. Switzerland should feel clean, spacious, and quietly excellent. It is the
counterpart to India: where India is abundance, Switzerland is sufficiency.

**🇺🇸 United States — innovation, ambition, scale, opportunity.**
The feeling is *expanse*. Lifestyles vary dramatically city to city; one country feels
like many. The US section should feel big and open, with a sense of possibility and slight
restlessness — and it works as the finale because "one country containing many" mirrors the
journey the visitor has just taken.

### 4.3 One thing the visitor should never feel

**Evaluated.** Not the countries, and not themselves. The visitor should never sense that
they're being tested on retention, and no country should feel like it lost. This is a
harder constraint than it sounds — see §7.

### 4.4 The ending: reflection, not summary

Approved in review. **The final screen does not summarise statistics.** No recap of
figures, no "your journey in numbers," no aggregate scorecard. Those would undo in fifteen
seconds everything §7 exists to protect — a summary of metrics is a ranking with extra
steps.

Instead the ending reinforces the central message. The emotional conclusion we are capturing
(your words, and I'll write the final copy fresh rather than using them literally):

> We arrived looking for differences. We leave understanding that every place reflects its
> own history, priorities and way of life. There is no single formula for living well —
> only different journeys.

**Why this is the right ending, and why it is structurally necessary rather than merely
nice.** The whole product is built on expectation-versus-discovery (§2.1). A story with that
shape *requires* a moment where the revision is named — otherwise the visitor has
experienced five surprises without ever being told what they add up to. This screen is where
the site stops describing and finally says what it means.

It also completes the arc in §4.1 and resolves the tension in §7 explicitly. Five countries
that refuse to be ranked could read as evasion; the ending reveals it was the argument all
along.

What the last beat must do:

| Must | Must not |
|---|---|
| Name the realisation in plain, unhurried language | Recap numbers, or show a final chart |
| Feel like arriving home, slightly changed | Feel like a conclusion slide |
| Sit in silence — one thought, generous space | Compete with imagery or motion |
| Leave the visitor still thinking | Ask them to do anything, or sell anything |

**Tone:** quiet and unadorned. This is the one screen where restraint is the entire
technique — anything decorative would make the sentiment feel performed rather than earned.
It is also the only place on the site where the narration may address the visitor as *we*,
because by then the journey has genuinely been shared.

The traveller (§3.4) gets the last word before this, at the end of the United States — then
the reflection belongs to the visitor.

---

## 5. What makes this different from a dashboard

The distinction is not visual. A dashboard with beautiful fonts is still a dashboard.
The difference is structural, and it comes down to five inversions:

| | Dashboard | This project |
|---|---|---|
| **Who decides what you see** | The user, via filters | **The author, via sequence** |
| **What the data is for** | Answering questions the user brings | **Making a point the author is making** |
| **How completeness is judged** | All available data is accessible | **Only what serves the story is present** |
| **What success looks like** | The user found their answer | **The visitor felt something and remembers it** |
| **How it ends** | It doesn't — you leave when done | **It ends, deliberately, with a conclusion** |

Two consequences follow, and both are worth accepting explicitly:

**We are deliberately withholding data.** The dataset contains more than we will show.
Every omitted number is a decision, not an oversight. A dashboard that hides data has a
bug; a story that shows everything has no editor.

**We are deliberately removing control.** No country filter on the landing page, no metric
selector, no "customise your view." Control is what a dashboard offers *instead of* a point
of view. We have a point of view.

### 5.1 The design philosophy, in terms of what it means

The references — National Geographic, Apple, Airbnb Experiences — are usually cited for
their looks. What actually matters is what each one *does*:

**National Geographic** — the photograph comes first and is given room to be seen. The
text serves the image, not the reverse. Facts are specific and surprising rather than
comprehensive. *What we take: photography is content, not decoration. And a single
extraordinary detail beats ten ordinary ones.*

**Apple** — one idea per screen, enormous whitespace, and the confidence to say very
little. Nothing is on screen that isn't necessary, and what remains is large. *What we
take: the discipline of subtraction, and the courage to let a single number own a whole
viewport.*

**Airbnb Experiences** — the promise is a feeling, delivered through a human voice and a
sense of a real person having really been there. *What we take: first-person voice. The
traveller's observations are the product's soul, not garnish.*

**And what we are explicitly not:** Power BI, Tableau, a BI portal. Not because those
tools are bad — they are excellent at their job — but because their job is to let an
analyst interrogate data. Ours is to let a stranger feel something. The two goals produce
opposite designs, and trying to satisfy both produces a site that does neither.

---

## 6. What visitors should remember

If a visitor recalls nothing else a week later, we want these, in priority order:

1. **A feeling of having travelled.** The most important outcome, and the hardest to fake.
2. **One surprising thing per country.** Japan's five million vending machines. India
   producing 70% of the world's spices. Italy's three active volcanoes. Switzerland making
   it illegal to own a single guinea pig, because they get lonely. The United States having
   no official language. These are the most memorable content in the entire dataset —
   concrete, strange, and repeatable at a dinner table.
3. **That a day looks genuinely different in different places.** The one *analytical*
   insight we want to land: 24 hours is the same everywhere, and how it's divided is not.
4. **That the maker of this site can tell a story.** The portfolio outcome — achieved as a
   *side effect* of the first three, never at their expense.

**The repeatability test.** A visitor telling a friend about this site would say: *"There's
this site about five countries — did you know it's illegal to own one guinea pig in
Switzerland?"* If they can't complete that sentence, we've failed regardless of how good it
looks. Every country needs one such fact, prominently placed.

---

## 7. No country is better than another — a permanent architectural principle

**Approved in review and elevated to a permanent architectural principle**, at your
explicit instruction. This is not a v1 scope decision, a stylistic preference, or a
guideline to be traded against other goals later. It is a property the product must have,
and any future feature that violates it is rejected regardless of merit.

> **The website must never imply that one country is objectively better than another.**
> **Data provides context, not judgement.** Wherever comparative metrics appear, they must
> encourage curiosity rather than competition.
>
> A visitor should leave thinking **"life can be meaningful in many different ways"** —
> never **"country A wins."**

That pair of sentences is the acceptance test. Any screen, chart, or sentence that would
more plausibly produce the second thought than the first is wrong and gets changed.

### 7.1 Why this needs to be architectural rather than editorial

Because it is not a matter of tone. It is a matter of *form*, and form is decided in the
design system and the components — which is exactly why it had to be settled here first.

Ranking is a property that emerges from structure whether or not anyone intends it. Five
bars sorted by length is a leaderboard even with the kindest caption in the world. A
sequential colour ramp applied across countries makes dark mean *more* and therefore
*better*. A number labelled "rank 118" carries a verdict no surrounding prose can
retract. None of these can be fixed by writing more carefully — they have to not be built.

### 7.2 The specific problem in our data

The dataset ranks the five countries, and the rankings are not flattering to all of them.
Among our five, India has the **lowest happiness score (4.389, rank 118 globally), the
lowest life expectancy (73), and the longest working week (46.7 hours)**. Switzerland leads
happiness (6.935, rank 13). If we present these metrics as a straight comparison, the site
delivers an implicit verdict: *Switzerland good, India bad.*

That would be a failure on three counts. It's **editorially crude** — reducing a
1.46-billion-person civilisation to a rank. It's **statistically naive** — happiness
indices measure self-reported life evaluation shaped by expectation, culture and survey
method, and are not a scoreboard of how good a place is. And it **contradicts our own
content**: the India section's own material is about festivals, community and extraordinary
regional diversity. A number implying deficiency sits beside text describing abundance.

### 7.3 The resolution

- **"Thrives" is a question, not a score** (§2.2). These numbers are different answers to
  *what does a good life look like here*, not positions on one axis.
- **Difference, not ranking, is the frame.** India's honest headline is diversity and
  community, which is what its data actually supports. The interesting fact about India's
  46.7-hour week isn't that it's the longest — it's what people do with the remaining time,
  and our data says family and community.
- **No composite "best country" score. Ever.** Permanent prohibition.
- **Comparison comes last, and is framed as contrast.** By the time a visitor sees five
  countries side by side, they've spent minutes with each and have context that resists a
  simplistic reading.
- **Where a metric is easy to misread, we say so plainly.** One clear sentence beats a
  buried footnote.
- **The ending names the conclusion** (§4.4), so the refusal to rank reads as the argument
  rather than as evasion.

### 7.4 What this forbids downstream

Binding on the design system and every component. These are the concrete forms the
principle rules out:

| Forbidden | Why it ranks |
|---|---|
| Any composite or overall score | The purest form of the thing |
| Sorting countries by a metric value | Sort order *is* a ranking; use itinerary order always |
| A sequential colour ramp across countries | Dark = more = better; countries are categorical identities, never magnitudes |
| Displaying global rank numbers ("rank 118") as headline figures | A rank is a verdict with no context attached |
| Podium, medal, trophy, star-rating or leaderboard framing | Competition metaphors |
| Superlative labels — "best," "worst," "top," "lowest" | Judgement in a word |
| Up/down arrows or red/green on cross-country comparisons | Status colour means good/bad; difference is neither |
| A single "winner" highlighted in a comparison | Implies the rest lost |

**And what it requires instead:** itinerary order everywhere; each country in its own
categorical identity colour; comparisons phrased as questions; and at least one framing
sentence wherever a metric invites a crude reading.

This is why the vision document had to come before the design system: **no colour palette
or chart specification can fix a framing problem, but a colour palette can absolutely
create one.** You were right that we were optimising details before defining the product.

---

## 8. Product Principles

The standard for evaluating every future feature, chart, image, animation and sentence.
Grouped, and ordered by authority — when two conflict, the lower number wins.

### Story

**1. Story before statistics.**
The narrative decides what data appears. Data never decides what narrative appears. If a
number doesn't advance the story, it isn't in the product — no matter how interesting it is
in isolation.

**2. Emotion before interaction.**
A visitor should feel something before they're asked to do anything. Interactivity is a
reward for engagement, never a prerequisite for it. Nothing meaningful is hidden behind a
click, a hover, or a filter.

**3. Every chart answers a question a visitor would actually ask.**
Not "here is the transport data" but "how do people get around?" If we can't phrase the
question in plain language a traveller would ask, we don't need the chart. The question,
not the metric name, becomes the title.

**4. One idea per moment.**
Each screen makes one point. If a visitor has to choose what to look at, we've made them
do our editing for us.

**5. Specific beats comprehensive.**
One vivid detail is remembered; ten summary statistics are not. Five million vending
machines beats a complete table of Japanese consumer metrics.

**6. Nothing ranks people.**
Countries are different, not better or worse. No leaderboards, no composite scores, no
implied verdicts. Where data invites a crude reading, we reframe or explain it. *(See §7 —
a permanent architectural principle, and the hardest constraint in the project.)*

**7. Data should answer questions, not end conversations.**
*Added at your request, and it earns its place high in the list because it is the positive
form of principle 6 — where 6 says what we must not do, 7 says what we do instead.*

A number that settles a matter closes the visitor's mind; a number that provokes *why?*
opens it. The best visualisation on this site will leave a visitor wondering why the
difference exists, not satisfied that they now know which country is highest. So we prefer
the chart that raises a question to the chart that delivers a conclusion — and we
deliberately leave room for the visitor to wonder rather than answering everything for them.

In practice: chart titles are questions, not labels. Findings are phrased as observations
rather than verdicts — "Italians spend the most time on meals" invites *why*, while "Italy
ranks first in dining time" closes it. We never write a caption that tells the visitor what
to conclude, and we never imply that one outcome is universally better than another. A
difference we can't explain is left visibly unexplained; that is more honest and more
interesting than a confident guess.

The test: **after reading this, does the visitor want to know more, or do they think they're
done?** If the honest answer is "done," the chart is a full stop where it should have been a
question mark.

**8. Challenge assumptions rather than confirm them.**
The narrative is expectation-versus-discovery (§2.1). When we have a choice between a fact
that confirms what a visitor already assumes and one that unsettles it, we choose the
second — provided both are true and equally well supported.

### Craft

**9. Simplicity over decoration.**
The default answer to "should we add this?" is no. Elegance is what's left after removal,
and this is the principle most likely to be violated under enthusiasm.

**10. Every image advances the narrative.**
Photographs are content. An image that merely fills space is removed, and no image is used
twice for two different purposes. A section with fewer good images is better than a section
padded with weak ones.

**11. Every animation has intent.**
Motion signals arrival, hierarchy, or cause and effect. Motion that only signals "we know
how to animate" is deleted. The test: name what this movement tells the visitor. No answer,
no animation.

**12. Movement with purpose — the visitor stays in control.**
We never hijack scrolling, trap attention, or force a pace. The site can invite; it cannot
compel.

**13. Consistent structure, distinct atmosphere.**
Every country shares one skeleton so visitors learn it once, and differs in colour, pace,
imagery and voice so each arrival feels new. Atmosphere is never allowed to become
inconsistency.

**14. One voice, and the visitor is the protagonist.**
The traveller is a quiet guide, never the hero (§3.4). First person belongs only to their
quoted observations; the narration is plain or addresses the visitor. No marketing language,
no corporate hedging, no exclamation marks doing emotional work the content should do.

### Integrity

**15. Accuracy is not negotiable for atmosphere.**
Every number traces to the dataset. If the data is wrong, we fix or drop it — we never
round toward a better story. *(Already applied: the dataset's Italy→Switzerland distance is
7,800 km; the coordinates say 649 km. We dropped the metric.)*

**16. Accessible by construction, not by remediation.**
Contrast, keyboard access, screen-reader equivalence and reduced-motion support are
requirements, not a late audit. Every visual decision is verified by measurement, never by
eye. A design that excludes people is broken, in exactly the way a wrong number is broken.

**17. Honest about what we don't know.**
Where a figure is an estimate, a definition is contested, or a metric is easily
misread, we say so — briefly and in plain language. Acknowledged limits build more trust
than false precision.

### How to use these

Any proposed feature must answer: **which principle does this serve, and which does it
strain?** Something that serves none is cut. Something that strains a low-numbered
principle is cut regardless of what it serves.

**Every design decision must also be explainable in terms of the visitor experience** — the
review instruction. Typography, colour, spacing, motion and component choices are never
isolated visual preferences; each is justified by the principle and the emotion it serves.
A recommendation that can only be defended as "it looks better" has not been justified.

---

## 9. Success criteria

How we'll know this worked. Deliberately not analytics metrics — those measure traffic,
not whether we achieved anything.

| Test | Standard |
|---|---|
| **The stranger test** | Someone with no interest in data finishes it and says they enjoyed it |
| **The dinner-table test** | They repeat one fact from it, unprompted, later |
| **The phone test** | The full experience works one-handed on a phone, not a reduced version |
| **The screenshot test** | Any single screen, in isolation, looks like a magazine spread rather than a report |
| **The silence test** | With all animation disabled, it's still complete and still good |
| **The squint test** | Squinting at any screen, one thing is clearly most important |
| **The "why is this here" test** | Every element on screen has an answer, and the answer isn't "balance" |
| **The five-second test** | Five seconds on any country page reveals which country it is, without reading |
| **The curiosity test** | After any chart, the visitor wants to know *why* — not "which is highest" *(Principle 7)* |
| **The no-winner test** | Nobody finishing the site can name the "best" country, and nobody wants to *(§7)* |

The five-second test is the atmosphere system's real justification: if Japan and India are
distinguishable only by their photographs, the emotional layer has failed.

The last two are the acceptance tests for the review's two most important decisions, and
they are the ones I'd apply hardest, because both failures are quiet. A ranking creeps in
through sort order and colour, not through language.

---

## 10. Out of scope

Naming these prevents them from creeping back in later as good ideas.

| Not doing | Why |
|---|---|
| Adding countries beyond five | Five is a journey; twelve is a database. The 12-country dataset stays archived. |
| User accounts, saving, sharing progress | Nothing here needs to persist. It's a visit, not a tool. |
| A country filter or metric selector | Control is the dashboard pattern we're explicitly rejecting *(§5)*. |
| Live or auto-updating data | This is a fixed narrative about a specific journey, not a monitor. |
| Multi-language support | Out of scope for v1; not a principle, just effort. |
| A composite "best country" score | Permanently prohibited *(§7, Principle 6)*. |
| Sorting or colour-ramping countries by metric value | Creates a ranking structurally *(§7.4)*. |
| A named or characterised narrator | The traveller is an anonymous guide; the visitor is the protagonist *(§3.4)*. An anonymous illustrated figure is permitted — see the Session 4 amendment for where that line sits. |
| A statistics recap on the final screen | The ending is reflection, not summary *(§4.4)*. |
| Dual-axis or multi-metric combination charts | They confuse; two ideas need two moments *(Principle 4)*. |
| Handwriting-style display type | Legibility loss for an effect achievable other ways *(Principle 16)*. |

**Explicitly deferred, not rejected:** a higher-resolution Switzerland hero image, image
optimisation, dark mode. None of these block anything.

---

## 11. Document hierarchy

```
PRODUCT_VISION.md      ← this document. Why and for whom. THE HIGHEST AUTHORITY.
   ↓
DESIGN_SYSTEM.md       ← how it looks and moves, and why that serves the vision
   ↓
Design tokens          ← the vocabulary, expressed once
   ↓
Application shell      ← navigation and the journey's structure
   ↓
Components             ← the individual pieces
```

Each layer must be justifiable in terms of the one above it. A design decision that can't
be traced to a principle here is unjustified — which is the point of writing this down.

**Binding rule for every document below this one:** each recommendation states the
experience or principle it serves. Not "Fraunces is an elegant serif," but "the display
face must carry §4's editorial register and make a country name feel like arrival — here is
the one that does, and here is what it costs." Visual choices are arguments, and an argument
needs a premise.

**Alignment status.** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) is being revised against this
document now. Its colour and accessibility validation (§4) **stands unchanged** — it is
measured fact and Principle 16 makes it binding. What needs revisiting is anything assuming a
comparison-first framing, plus the §7.4 prohibitions on sort order and sequential ramps
across countries. [DESIGN.md](DESIGN.md) (architecture and data audit) needs the same pass.
