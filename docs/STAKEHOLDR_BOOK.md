# The Book of Stakeholdr

*An exhaustive, plain-language account of what Stakeholdr is, why it exists, how every
part of it works, and how it all fits together. This is written to be read — paragraph
upon paragraph — not skimmed as bullets. It is the narrative companion to the precise
specs (`APP_SPEC.md`, `db.js`, the per-module specs). Where the specs give you the exact
shapes and values, this book gives you the reasoning, the mental model, and the why.*

---

## Part I — The Idea

Stakeholdr exists because the people whose entire job is managing relationships with
powerful outside parties — government affairs officers, public-policy teams, community
and corporate-affairs staff — do that job, today, in spreadsheets and slide decks and
the heads of a few senior people. A large company might be tracking hundreds of
legislators, regulators, journalists, labor leaders, activist groups, trade
associations, community organizations, and local officials across dozens of markets.
Each of those relationships has a temperature. Each can help the company or hurt it.
Each requires a different posture — some you defend against, some you quietly monitor,
some you invest in as genuine partners. The intelligence about who matters, how much
they matter, which way they lean, and what to do about it is real, valuable, and almost
never captured in a way the whole team can see, agree on, and act from. It lives in a
VP's instinct and a junior analyst's tracking sheet, and the two rarely reconcile.

Stakeholdr's premise is that this intelligence can be made explicit, shared, and turned
into action without flattening the judgment that makes it valuable. The product takes
the messy, qualitative work of stakeholder engagement and gives it a spine: a way to
*score* each stakeholder along the two dimensions that actually decide engagement
strategy, a *map* that turns those scores into a picture the whole team reads the same
way, a *prioritization* model that suggests where to spend finite attention, a *planning*
surface where that strategy becomes concrete tactics with owners and timing, and a
*community-investment* ledger that tracks the philanthropy, sponsorships, and
contributions that buy goodwill and create shared value. The throughline — score,
position, prioritize, plan, fund, measure — is the product. Everything else is in
service of keeping that loop honest and shared.

The value proposition follows directly. For the team, Stakeholdr replaces a fragile pile
of spreadsheets with a single source of truth that every member contributes to and reads
from, where one person's scoring is visible alongside everyone else's and the software
does the work of blending those views into a defensible consensus. For leadership, it
turns "trust me, I know this legislator" into a position on a map with a recommended
strategy and a record of how the relationship has moved over time. For the company, it
makes the case for engagement spend — why we sponsored that gala, why we endorsed that
bill, why we hired that local liaison — auditable and tied to outcomes. That auditability
and shared intelligence is the moat: once a team's institutional knowledge lives in
Stakeholdr, leaving it means going back to the spreadsheets, and no one wants to.

How it earns is straightforward and layered. The core is a seat-based SaaS for
corporate-affairs teams. On top of that sit gated add-ons that are natural extensions of
the data the product already holds: **Personas**, which models stakeholder archetypes
from polling and listening data, and the **AI Message Generator**, which takes a finished
engagement plan — with its goals, prioritized stakeholders, issues, and tactics already
captured — and drafts the key messages that advance those goals, grounded in real plan
context rather than a blank prompt. Beyond that are paid **integrations** with the tools
these teams already pay for — LegiScan and Quorum for legislative tracking, sales CRMs,
marketing platforms, document storage — each of which makes Stakeholdr stickier by
pulling the rest of the team's world into the same place. The product is deliberately
designed so the free, single-browser demo and the paid, multi-user production are the
*same codebase* behind a flag; the path from "impressive demo for a prospective client"
to "live, multi-tenant, secure deployment" is a transport swap, not a rewrite.

A word on taste, because it matters to this product specifically. The audience is senior,
skeptical, and allergic to anything that looks like consumer software or AI slop. The
design language is therefore quiet and editorial — warm neutrals, real typography, no
gradient soup, no decorative noise — and the interaction model favors density and
directness over hand-holding. The product should feel like an instrument a professional
reaches for, not an app that nags. Every screen earns its place; every control does one
clear thing. This is why the build discipline is strict about using a real, consistent
component system rather than improvised styling: the credibility of the tool is part of
the value, and credibility is destroyed by inconsistency.

---

## Part II — The Ecosystem

To understand Stakeholdr you have to understand how its pieces relate, because almost
nothing in the product stands alone. The atom is the **stakeholder** — a person or an
organization the company cares about. A stakeholder exists exactly once, in a single
shared pool. That singularity is important: there is one record for Senator Park, one
record for the State EPA, and everything the company knows about them accretes onto that
one record rather than fracturing across copies. A stakeholder carries identity (name or
organization, title, contact details, a photo), classification (a category and audience
type, drawn from a configurable taxonomy), geography (market, region, geography level,
and optionally a specific site and state), relationship attributes (priority, status,
tags, the issues they care about), ownership (which team members are responsible for
them), and history (a running log of notes, and quarterly snapshots of where they sat on
the map).

Stakeholders are organized through **workspaces**. A workspace is a working context —
typically a pairing of a business segment with a business unit, owned by one or more team
members. "Government Affairs — North America" is a workspace; "Personal Systems —
Commercial PCs" is another. Crucially, the relationship between stakeholders and
workspaces is many-to-many, expressed through a join: a single stakeholder can belong to
several workspaces at once, because the same legislator might matter to both the energy
team and the trade team. The join is the membership map; assigning a stakeholder to a
workspace is adding an entry to it, not copying the stakeholder.

Sitting above all workspaces is **Master**. Master is not a real workspace you can edit
or delete; it is a synthetic, always-present view that shows the union of every
stakeholder in the organization. Master is where leadership sees the whole field at once;
a workspace is where a team does focused work on its slice. This distinction drives
behavior throughout the app. When you are in Master, every view shows all stakeholders,
read in aggregate. When you are in a workspace, the same views narrow to just that
workspace's members. Some activities only make sense in a workspace — scoring, most
notably, is a team act that happens within the context of a defined team, so the Scoring
view is disabled in Master and quietly redirects to the Map. When you create a stakeholder
from inside a workspace, the product assumes you mean to work on them there and assigns
them to that workspace automatically; when you create one from Master, it enters the pool
unassigned, waiting to be placed.

Now the loop, which is the heart of the ecosystem and worth walking through slowly because
every feature is a station along it.

It begins with **scoring**. Engagement strategy, in this discipline, turns on two
questions about a stakeholder: how much influence or importance do they carry, and how
aligned with us are they? Stakeholdr makes those the two axes of everything. Each member
of a workspace's team scores each stakeholder by placing them on a grid — a horizontal
position from minus ten (works hard against us) to plus ten (works hard with us), and a
vertical position from minus ten (little influence) to plus ten (great influence). The
critical design choice is that scoring is *individual and visible*: you can only edit your
own column of scores, but you can see everyone else's. No one's judgment is overwritten;
disagreement is preserved and made legible. Each team member also carries a weight, a
multiplier that lets a workspace decide that the seasoned director's read should count
more than the new analyst's, or that a subject-matter expert's view on a particular
domain deserves extra pull.

From those individual scores comes **position**. The product blends every rater's score
into a single coordinate using a weighted average — each person's score times their
weight, summed, divided by the total weight, computed independently for the horizontal and
vertical axes. Raters who haven't scored a given stakeholder simply don't contribute; if
no one has scored them, the stakeholder sits at the origin. That blended coordinate is
then resolved into one of fourteen named **relationship zones** by locating it in a grid
of cells. The zones are not decorative labels; they are a worldview. The bottom-left is
where low-influence opponents sit, and the prescription there is mostly to monitor and not
spend scarce resources. The top-left is where high-influence opponents sit, and the
prescription escalates from "respond" to "defend" to "proactively defend" as influence
rises — these are the relationships that can genuinely hurt the company, and the software
says so. The right side is where alignment turns positive, climbing from "cooperate"
through "collaborate" to "valuable relationship," and at the top-right corner sits the
"strategic partner" — a high-influence ally with whom the company creates measurable
shared value. Every zone comes with a strategy headline and a paragraph of recommended
action, so the map doesn't just tell you where a stakeholder is; it tells you what to do
about it.

Position feeds **prioritization**. Inside a plan, the product runs a model called SEP —
stakeholder engagement prioritization — that converts a stakeholder's map position, the
overlap between their issues and the plan's issues, and the strength of their community
ties into a single zero-to-one-hundred priority score, banded into High, Medium, or Low.
The score is weighted by two models the planner chooses: a sector model (the industry
lens — energy, technology, retail, and so on) and a goal model (the scenario lens — general
engagement, crisis, shared value, activism, and others). The point of SEP is to take the
finite attention of a small team and point it at the stakeholders who matter most for the
specific plan at hand. It is explicitly advisory: it surfaces a suggestion with a quiet
marker, sorts the plan's stakeholder list by it, and lets a manager override any
stakeholder's band when human judgment disagrees — with a one-click path back to the
suggestion. The software proposes; the manager disposes.

Prioritization becomes action in the **plan**. A plan is a per-workspace engagement
document — a living artifact, not a one-time form. It opens with scenario and context (what
this plan solves and why it matters to the company), moves through alignment with the
organization's stated goals, presents the SEP-ranked roster of stakeholders, lays out the
concrete tactics with their leads and timing, and closes with how progress will be
measured against the fiscal calendar. Alongside it runs a cross-functional team and an
explanation of how the prioritization was derived, so the plan is both a strategy and a
record of its own reasoning.

Plans are funded and reinforced through **community investment**. Much of stakeholder
goodwill is bought, in the legitimate sense: philanthropy, volunteering, corporate giving,
political contributions, sustainability commitments, social-impact programs. Stakeholdr
treats each of these as an application with a full lifecycle — who submitted it, who it
benefits, what's being asked for and over how many years, the budget, the risk and
compliance attestations, and the team's vote. Each engagement carries a value score that
averages two judgments: how much it improves the company's license to operate, and how
much it strengthens relationships. Because these investments tie back to specific
stakeholders, the product can show, on a stakeholder's profile, the cumulative committed
dollars behind that relationship — and it rolls the whole portfolio up by fiscal year,
distinguishing what's merely requested from what's actually approved, and spreading
multi-year commitments across the years they touch.

Finally, the loop closes with **measurement**. Because scores produce quarterly snapshots,
the Map can replay a stakeholder's movement over time — the arc of an activist group
sliding from mild opposition into active threat, or a regulator warming from neutral to
collaborative across three quarters. Plans measure against fiscal cadence. Community
rollups track committed value over a three-year horizon. The same data that started as a
team's gut feel ends as a defensible, time-stamped account of how the company's
relationships are changing and what the company is doing about it.

Two structural facts hold all of this together. First, every relationship in the product
is an id reference resolved through a small set of shared helper functions, never a forked
copy — the function that finds a stakeholder's affiliated community applications, the one
that totals their committed dollars, the one that lists their workspaces, are each defined
once and reused by the table, the map, the plan, and the profile. Adding a feature means
extending an existing entity and its shared helpers, not creating a parallel version.
Second, the whole product is multi-user by design even though the demo runs in a single
browser: every shared entity flows through one persistence seam, every change is broadcast
so other open views update live, and the path to a real multi-tenant backend is a swap
inside that one seam with no change to the interface above it. The ecosystem is, in other
words, engineered so that the simple demo and the serious product are the same thing seen
at two scales.

---

## Part III — The Scoring Model and the Map

Everything in Stakeholdr descends from two numbers. Before the map, before the zones,
before prioritization or plans or any of the machinery built on top, there is the act of
one team member looking at one stakeholder and answering two questions with two integers.
Get those two questions right and the rest of the product has something honest to compute
with; get them wrong and every downstream surface is confidently displaying noise. So it
is worth being precise about what the axes actually measure.

The horizontal axis, x, is **alignment and support**: does this stakeholder work with us
or against us? Minus ten is a stakeholder actively working to hurt the company — funding
opposition, filing challenges, attacking the brand in public. Plus ten is a stakeholder
working just as hard in the company's favor. The vertical axis, y, is **influence and
importance in the community**: how much does this stakeholder's posture actually matter?
A hostile blogger with no audience and a hostile attorney general are both at minus eight
on alignment, but they live at opposite ends of the influence axis, and that difference —
not the hostility itself — is what decides whether the company mobilizes or merely
watches. The map's own legend states the axes in plain language: "← Works against you"
and "Works with you →" across the bottom, "↑ Greater community influence · ↓ Less
community influence" in the middle. Nothing about the model is hidden in jargon; the
picture explains itself.

Why minus ten to plus ten, and why integers? Because both questions have a meaningful
zero and a meaningful sign. Alignment is genuinely bipolar — opposition is not merely the
absence of support, it is a force with its own direction, and a scale that runs from zero
to ten would flatten "indifferent" and "hostile" into the same low numbers. The signed
scale puts neutrality at the origin, where it belongs, and gives each rater twenty-one
honest gradations per axis — enough resolution to distinguish "mildly annoyed" from
"organized opposition" without pretending to a false precision that would make raters
agonize over decimals. Each score a teammate enters is an integer clamped to that range;
the blended positions that come out of the math are the only fractional values in the
system, and they are fractional precisely because they are averages of many whole-number
judgments.

### The team, the weights, and the epistemology of the matrix

Scoring happens on a matrix: stakeholders as rows, team members as columns, and in each
cell one teammate's (x, y) read on one stakeholder. The single most important rule of
that matrix is that **you can edit only your own column**. Every other column is visible
— you can see exactly how the director scored the mayor, tooltip and all — but it is
read-only to you. This is not a permissions convenience; it is the product's epistemology.
A stakeholder's position is meant to be a blend of *independent* judgments, and
independence dies the moment one person can quietly revise another's numbers. Spreadsheets
fail at exactly this: the loudest editor's view overwrites everyone else's, and the
history of who believed what evaporates. In Stakeholdr, disagreement is preserved and
legible. If the VP has Senator Park at (+6, +8) and the field analyst has her at (−2, +8),
that gap is real information — it means someone should make a phone call — and the matrix
displays it rather than resolving it by fiat. The software resolves it by arithmetic
instead, and only for the purpose of drawing the map; the underlying columns stay intact.

One structural fact matters here: the team and the scores are global, not per-workspace.
There is one team table and one score-set per stakeholder shared across the whole app;
the active workspace only decides which rows you see. A stakeholder who belongs to three
workspaces has one position, scored once by the one team — never three divergent copies.
Scoring itself is a workspace act (it is disabled on Master, which quietly redirects to
the Map), because scoring is something a defined team does to its focused slice of the
pool, but the judgment it produces belongs to the whole organization.

Not every judgment deserves equal pull, and the model says so out loud through
**weights**. Each teammate carries a weight from 0.0 to 2.0 in tenths, with 1.0 as the
explicit baseline — the slider even carries a tick at the baseline labeled "Baseline
weight 1.0." A weight of 2.0 counts double; 0.8 counts a little less than par. Beneath
each teammate's slider the product shows the consequence as a plain percentage: your
weight divided by the sum of all weights, rendered as "{pct}% of team," recomputed live
as any slider moves. That readout is the honesty mechanism — weighting is a real
editorial decision about whose read matters most, and the product refuses to let it hide.
Turn the director up to 1.5 and everyone can see that she now carries, say, 27% of the
team's voice.

The most interesting value on the slider is zero. **Weight 0.0 is a legal, deliberate
choice**, and it means something socially specific: this person stays on the workspace —
they keep their column, their visibility, their membership — but their scores are taken
out of the blend entirely. It is the difference between "we're not counting your vote
right now" and "you're off the team." A teammate on rotation, a new hire still learning
the terrain, a colleague with a conflict on one portfolio — all can be zero-weighted
without the social violence of removal. Removing someone is a separate, explicit act
with its own consequences (their column of scores is purged), and the product guards the
edge case: a workspace can never be left teamless — the last member trying to leave is
routed to a hand-off-or-delete decision instead.

### The blend: how disagreement becomes a position

The function that turns a column of opinions into a point on the map is `weightedCoord`,
and it is deliberately simple: for each teammate who has actually scored this stakeholder
and whose weight is greater than zero, accumulate score times weight; divide the sum by
the total weight; do this independently for x and for y. A weighted average, nothing
more. Its subtlety is entirely in who gets *excluded*. A teammate drops out of the blend
for two independent reasons: they have never scored this stakeholder (no record exists),
or their weight is zero. Only the people who have formed a judgment, weighted by how much
the team trusts their judgment, move the dot.

That first exclusion carries a correction worth dwelling on, because the original build
got it wrong in a way that is instructive. The old code defaulted an unscored cell to
(0, 0) — which meant "I have no opinion about this stakeholder" was numerically identical
to "I have carefully concluded this stakeholder is perfectly neutral and perfectly
uninfluential." Those are wildly different statements, and conflating them silently
dragged every under-scored stakeholder toward the center of the map. The rebuilt model
draws the line hard: **unscored is not (0, 0)**. A cell nobody has touched renders as an
em-dash, stores nothing, and contributes nothing to the average; a genuine (0, 0) exists
only when a teammate deliberately enters it, and once entered it counts as a real score
everywhere — including in the reminder system's definition of "caught up." Only when
*nobody* in the blend has scored a stakeholder at all does the position fall back to the
origin, and that is a statement of absence, not of judgment. Every score record also
carries its own small audit trail — a `createdAt` stamped the first time that teammate
scores that stakeholder, an `updatedAt` restamped on every change — so the system always
knows not just what the team believes but how fresh each belief is.

The blended coordinate then resolves to a named zone through `statusFor`, which is just a
lookup against fixed boundaries: the x axis breaks at −5, 0, and +5 into four columns,
and the y axis breaks at +5, +2.5, 0, −2.5, and −5 into six rows. Notice the asymmetry:
influence is banded more finely through its middle range (five-point bands at the
extremes, two-and-a-half-point bands in between) because the middle of the influence
axis is where strategy actually changes — the difference between "somewhat influential"
and "influential enough to escalate" deserves more resolution than the difference between
two flavors of very-influential. Four columns times six rows gives twenty-four cells,
and those cells map onto fourteen zones — several zones span more than one cell, wrapping
diagonally so that, for instance, a moderately-opposed high-influence stakeholder and a
strongly-opposed medium-influence one land in the same "Defend" posture.

### The fourteen zones: a worldview in a grid

The zones are the product's soul, because they are where a coordinate becomes an
instruction. Each zone carries a name, a color, a one-line strategy, and a paragraph of
recommended action — transcribed character-for-character into every surface that shows
them — and reading them in order, from the hostile top-left corner around to the allied
top-right, is reading a complete theory of stakeholder engagement.

Start in the worst place on the map: an opponent with maximum influence. That is
**Proactively Defend**, and its strategy is *Address Key Influencer* — launch a plan to
neutralize a major threat to the company's license to operate, leveraging reputation,
resources, subject-matter experts, and allied stakeholders to win, measuring and
reporting often. One notch down the threat scale is **Defend** (*Neutralize Threat*):
these are high-influence opponents unlikely ever to move toward support, so the
prescription is to defend reputation against their regular attacks and discredit the
message or position. Below that, **Protect** (*Mobilize Defense*) handles opposition
with internal resources and expectation-management, and **Respond** (*Challenge
Stakeholder*) covers the mid-influence opponent whose misinformation should be challenged
before it destabilizes the business. **Identify** (*React To Issues Or Conflict*) is the
low-influence opponent worth educating and de-escalating with an assigned working group.
And at the very bottom of the hostile side sits **Monitor** (*Plan Ahead, Listen*) — an
opponent too uninfluential to fight, so the move is to map them, plan a response in case
they change, and otherwise leave them alone. The gradient down the left side is the
model's first big claim: opposition is answered in proportion to influence, and spending
resources fighting powerless critics is a strategic error the software will not recommend.

Cross the alignment axis and the vocabulary changes from defense to cultivation. Along
the low-influence bottom, **Maintain** (*Take Steps To Introduce Our Vision And Values*)
suggests simple engagement to grow both alignment and influence over time, while
**Connect** — a supportive but uninfluential stakeholder — gets the model's most
disarming honesty: *Prioritize Resources Elsewhere*. Take no action; watch for change.
The software is explicitly willing to say that some friends are not worth active
investment yet, which is exactly the discipline a stretched team needs permission for.
**Commit** (*Understand Needs, Work Towards Common Purpose*) begins building the mutual
understanding that could mature into collaboration. Then the ladder climbs:
**Cooperate**, where existing alignment already produces some favorable outcomes worth
maintaining at moderate commitment; **Collaborate**, where investing in the relationship
will improve the business or its reputation and the stakeholder's influence can be
leveraged; **Valuable Relationship**, an important surrogate, ally, or business partner
whose relationship proactively supports and defends the business; **High Value
Relationship**, where moderate shared value has been introduced and the stakeholder
should be engaged often against business and advocacy goals; and finally, in the
top-right corner mirroring Proactively Defend, the **Strategic Partner** — *Shared Value
Created* — where the prescription is to formalize a working partnership that produces
and measures shared value. The two corner zones are the only ones rendered with white
text on deep color, a small typographic signal that these are the poles of the model:
the relationship that can destroy you and the relationship that can build you.

### The map, and why you cannot drag it

The Map renders all of this as a picture: the twenty-four cells tiled as a grid, each
painted in its zone's color, with one dot per visible stakeholder placed by a
transparently simple transform — left percent is (x + 10) / 20 × 100, top percent is
(10 − y) / 20 × 100 — so that positive y renders upward, positive x rightward, and the
origin sits at dead center. The grid, the dots, the tick marks, and the history trail all
share that one coordinate space, which is why the map scales cleanly and never lies about
where a stakeholder sits. Click a dot and the scorecard rail opens with the zone pill,
the live coordinates, and the zone's full strategy card in the zone's own color;
double-click and the full profile opens. Hover, and a tooltip gives name, zone, and
coordinates to one decimal.

What you cannot do is drag. The original build let you drag a dot to a new position, and
it would rewrite the team's scores to match. That behavior has been deliberately removed,
and the reasoning follows directly from everything above. A dot's position is not anyone's
opinion — it is the *blend* of several people's weighted, independent opinions. Dragging
it therefore meant one person's mouse gesture silently rewriting every colleague's stored
judgment, which is precisely the overwrite the edit-only-your-column rule exists to
forbid; the map's convenience was quietly repealing the matrix's constitution. It also
bypassed the cadence: rescoring is meant to be a deliberate, quarterly act performed on
the Scoring page, where you see your previous score, reconsider it, and save. So the
ruling is clean: the Map displays positions and never edits them. All movement on the map
is earned on the Scoring page.

Movement over time is the map's second life. Each quarter close — quarters computed from
a configurable fiscal anchor, four equal three-month spans — the system snapshots every
stakeholder's blended position into their history as a quarter label, a coordinate pair,
and a date. When a selected stakeholder has history, the scorecard offers "Show history,"
and the map transforms: every other dot disappears, and the selected stakeholder's past
positions render as small dashed, paper-colored dots labeled by quarter, joined by a
dashed accent trail that ends at the current live position. This is institutional memory
made visible — the activist group's three-quarter slide from mild irritation into active
threat, the regulator's slow warming, drawn as a literal path across the zones. It is the
difference between "trust me, this relationship is deteriorating" and a time-stamped line
anyone in leadership can read in two seconds. Selecting any dot exits history mode and
returns the full field.

Finally, the map offers three display styles, all presentational and none of which ever
touch a score. *Classic* is the flat grid. *Halo* — the shipped default — surrounds each
dot with a soft glow in its zone color, fading outward to nothing, so a crowded map reads
as weather: warm green pressure in the ally corner, a red front building top-left.
*Density* re-paints the grid itself, mixing each cell's zone color toward a neutral base
in proportion to how many stakeholders it holds relative to the busiest cell, so an
empty cell sits dim and the hottest cell burns at full saturation — a heatmap of where
the portfolio actually lives. Dots can show two-letter initials once they are large
enough to hold them, cells can show their zone names and a count of occupants, and a
size slider tunes the dots from dense-overview small to presentation large. All of it in
service of the same reading: two honest numbers per rater, blended by earned weight,
resolved into a posture, and drawn where the whole team — and the team's leadership —
can see it move.

---

## Part IV — The Table

If the Map is where Stakeholdr thinks, the Lists table is where it works. The table is the app's primary data surface — the master roster of every stakeholder, rendered not as a report to be read but as a working spreadsheet to be typed into. A report is a snapshot someone else prepared; a spreadsheet is a live instrument where the row you are looking at is the record itself, and changing a cell changes the truth. Stakeholdr's audience lives in spreadsheets — that is the incumbent being replaced — so the table meets them where they are: dense rows, frozen identity columns on the left, a long run of scrollable columns to the right, inline editing wherever editing is safe, and a footer that counts what you are looking at. The same table component renders Master (the whole pool) and each workspace (the pool filtered through the membership join), so there is one grid to learn, not several.

The columns come in two groups, and the split encodes a judgment about what is identity and what is preference. Four columns are frozen to the left edge and never move: the row number, an edit icon that opens the full record, the stakeholder's display name, and their organization. These are the anchor — whatever horizontal distance you scroll, you always know whose row you are in. Everything else — category, type, market, region, geography, state, sites, issues, priority, the computed x and y coordinates, the relationship zone, tags, owner, contact fields, last contact, status, notes, website, community investment — is reorderable by dragging its header. And crucially, that order is saved per user, per device, in local browser storage, and never synced to anyone else. This is a deliberate line: the *data* is shared and single-sourced, because two people disagreeing about a stakeholder's category is a real disagreement that must surface and resolve; but the *arrangement* of columns is a personal working style, and syncing it would mean one analyst's preference for leading with contact fields silently rearranging a colleague's screen. Data is communal; furniture is private.

### Editing in place, without letting the data rot

Each column has its own edit vocabulary, and the choice of vocabulary is where the table earns the claim of being a *better* spreadsheet rather than merely a prettier one. The classic failure mode of a shared spreadsheet is drift: one person types "Gov't", another "Government", a third "GOVERNMENT", and within a quarter the category column is useless for filtering, grouping, or counting. Stakeholdr's answer is that free text is only permitted where free text is the truth. The Organization cell is a plain text input, because an organization's name genuinely is arbitrary prose (with one wrinkle: for an organization-type stakeholder, editing the org also mirrors into the display name, because for an org the organization *is* the name — the same rule the create modal enforces, applied at both entry points so they can never diverge). Last contact is a popover calendar that stores a real date. But every classification column — Category, Type, Market, Region, Geography, State, Site, Status — is an inline dropdown whose options come from the shared catalogs. You cannot misspell a category, because you never type one. The catalogs are the vocabulary of the whole product: managers curate them in Settings, and every dropdown, filter, and chip in every module draws from the same lists. Consistency is not a policy anyone has to remember; it is a property of the construction.

The dropdowns go one step further and enforce *coherence* between fields, not just validity within them. The taxonomy is hierarchical — each category owns its set of audience types, each market owns its regions — and the cells respect the hierarchy through cascades. Change a stakeholder's Category and their Type is reset to the first type of the new category, because the old type belongs to a vocabulary that no longer applies; leaving it would create a record claiming to be, say, a Government stakeholder of type "Church." Change the Market and the Region resets the same way. Pick a Site whose record carries a state and the State field fills automatically, because a site's location is a fact about the site, not an opinion to retype. These cascades are data integrity by construction: the set of impossible states — a type outside its category, a region outside its market — is simply not reachable through the interface, so no validation report ever needs to hunt for them afterward.

The same discipline governs what may *not* be edited in the grid. The x and y columns and the Relationship column are computed live from the team's weighted scores — the blend described in Part III — and they render as read-only numbers and a zone pill. This is non-negotiable: relationship position is a *derived consensus*, and the only legitimate way to move it is to change a score on the Scoring tab, where the change is attributed to a rater and blended with everyone else's judgment. An editable Relationship cell would be an invitation to overwrite the team's collective read with one person's keystroke. Priority sits right beside it as the contrast case — a manually set High/Medium/Low pill — and the two are kept visually and semantically distinct precisely because conflating "how important we've decided they are" with "where our scoring says they stand" is a category error the interface refuses to permit. Issues, tags, owners, and community investment likewise display as chips and avatars in the grid but are edited through the full record, where their pickers can enforce their own rules. Even the link cells carry small acts of hygiene: phone numbers strip to digits for the tel: link but display formatted, and websites pass through a normalizer that adds the protocol the user skipped.

### Finding, filtering, and the queue of work

Above the table sits the toolbar: a search box, the Filter, Sort, Categories, and Sites popovers, and three impact-band chips. Search matches case-insensitively against name, organization, type, notes, and tags — the fields a human actually remembers a stakeholder by. The filters follow one consistent logic: within a field, selections are OR'd (choosing "High" and "Medium" priority shows both), and across fields they are AND'd (High-priority *and* Government *and* owned by Priya narrows, never widens). That is the semantics people already carry from every spreadsheet auto-filter they have used, so it never needs explaining; it only needs to never be violated. The zone filter's options even render in canonical zone order rather than alphabetically, because the fourteen zones are a worldview with a shape, and the filter should read like the map does.

The three impact-band chips are the table's fastest triage. They collapse the fourteen relationship zones into three strategic bands — positive impact (the cooperative-through-strategic-partner right side), the winnable middle (the monitor-maintain-connect-commit center), and negative impact (the identify-through-proactively-defend left side) — and each chip carries a live count of how many visible stakeholders fall in its band. Click one and the table filters to that band. In two glances, a director gets the shape of the field — how many friends, how many threats, how many persuadables — and in one click gets the list behind any of those numbers. The bands are the same zone taxonomy as the Map, single-sourced, so the count on a chip and the dots in a map region can never disagree.

Sorting offers a popover of eleven common fields, and clicking any field-bearing header sorts by that column directly, flipping direction on a second click. But the most opinionated piece is what happens when no sort is chosen at all. The default order puts *unscored* stakeholders first — anyone no team member has yet placed on the grid floats to the top — and orders the rest by most recent contact. This turns the table's resting state into a queue of work. A new stakeholder enters the pool, the create modal has already warned that "your team will be notified — they'll see this stakeholder at the top of their Sheet," and there they sit, at the top, until someone scores them. The table does not merely store the roster; it nags, quietly and structurally, toward the completeness the whole scoring model depends on.

At the bottom, the footer counts the filtered rows against the total, shows the average x and y of what is visible, and offers the one deliberate exit: Export CSV. The export is the boundary of the system — a properly escaped, fixed-column snapshot (name, classification, geography, issues, priority, tags, owners, contact recency, coordinates, relationship, website, notes) named for the workspace it came from. It exists because the audience's world still runs on attachments and board decks, and refusing them an export would be purism at the cost of adoption. But it is one-way by design: data leaves as a dead snapshot; it comes back in only through the guarded doors described next, where the catalogs and cascades can vet it.

### The gate, the history, and the dossier

New stakeholders enter the pool through one door: the create/edit modal, a single card that serves both birth and revision. It opens from the shell's context-aware "+" (which, on the Lists view, means "add a row to the thing I'm looking at" — the spreadsheet mental model, honored) and, for edits, from a row's edit icon or a double-click on the name. The modal is the guarded gate. Its defaults make the cheapest path a valid one — Communities category with its first type, Americas/United States/Local geography, Medium priority, Active status, last contact set to today, and the creator added as the first owner, because the person entering a stakeholder is the natural default steward. Its validation refuses to save without an organization, a complete classification and geography, and — the signature choice — its structure decides *what kind of thing* is being created. Every stakeholder is an organization unless the "Add a person" toggle is checked, at which point a person row appears: a Title dropdown drawn from a fixed honorifics catalog (Senator through Director, in a deliberate order, with "Other" revealing a free-text custom title that then becomes required), plus first and last name. The title catalog exists for the same reason every catalog exists — so that display names compose consistently ("Sen. Jane Doe", via a small abbreviation map) instead of fracturing into "senator", "Sen", and "SENATOR" across a hundred records. If the person toggle is off, the person fields are cleared on save and the name is set to the organization: an org's name *is* its org, enforced at the gate.

Issues and Tags share a sub-control, the IssueSelector, whose two configurations state a policy. Issues allow free entry — chips from the company's issue catalog plus a comma-separated custom input — but every entry, preset or typed, is title-cased and deduplicated on the way in, so "climate policy," "Climate Policy," and "CLIMATE POLICY" collapse into one issue rather than three. Tags run the same control in restricted mode: the custom input is hidden entirely, and only the manager-curated company tag set may be applied. The reasoning is that issues are the team's evolving read on the world and should grow organically (with hygiene), while tags are an organizational filing system whose value collapses the moment it fragments — so the restriction lives in the control, not in a style guide nobody reads.

Notes get treated as history, not as a field, and the distinction matters more than it first appears. A single mutable notes box is where institutional memory goes to be overwritten: each update destroys its predecessor, and a year of relationship texture compresses into whatever was typed last. Stakeholdr keeps a running notesHistory instead — each entry timestamped and attributed to its author, displayed newest-first in a dedicated Notes modal reachable straight from the table's notes cell, with a composer that dates today and signs as the current user. Legacy plain-text notes are absorbed rather than lost, synthesized into a single unattributed entry. The grid's notes column shows only a preview; clicking it opens the record of what happened, what was said, and what was learned — a log, because relationships unfold in time and their record should too.

Finally, the read-only profile modal is the stakeholder's dossier: the one view that gathers everything the product knows about a single relationship without offering a single editable field. The header carries the avatar, name and title, and — computed live, never stored — the team-weighted relationship pill with its exact coordinates. Below it, identity and contact in key-value rows; owners and the workspaces the stakeholder belongs to, each workspace a clickable chip that jumps you into that context; tags and issues; then the community section, where the cumulative committed dollars behind this relationship render in one figure, with the affiliated engagements listed beneath it, each opening into its full application. A note history closes the dossier. Every line is the same shared helpers the table and the map use — the affiliation lookup, the cumulative-dollars total, the weighted coordinate — resolved from ids, never copied, so the profile can never quietly disagree with the surfaces around it. It is the answer to the question the whole product exists for: before you call this person, what do we actually know? One card, one glance, and the edit button right there if what you know has changed.

---

## Part V — Plans

Everything before this point in the loop — the scoring, the map, the zones — produces intelligence. The plan is where that intelligence becomes commitment. A plan in Stakeholdr is a structured engagement document scoped to a single workspace: a living artifact the team drafts, revisits, and eventually archives or exports as one Word file, whose outline is the plan's own structure. It opens with scenario and context — what this plan solves, the phased approach, the outcome the team expects — and moves through alignment with the organization's goals, where each goal set by managers in Settings is inherited read-only and the team writes, goal by goal, how this particular plan advances it. Then comes the heart of the document: the ranked table of stakeholders, each row carrying the person's type, their relationship zone from the team's weighted scoring, and a priority band. After the roster come the strategies and their tactics — each strategy a titled approach with a "how," a timing window, and an assigned lead — and the plan closes with measurement and reporting, a statement of cadence and metrics tied to the fiscal calendar. Around the document sit its metadata (market, region, site, geography, owners, issues, a linked set of community investments) and a cross-functional team with per-plan roles, so the plan is simultaneously a strategy, a roster, and a record of its own reasoning.

A plan is never generic, though, and this is the design's most distinctive move. When a team creates a plan, it picks an algorithm — two choices, made up front: an industry sector and a type of plan. These are not cosmetic categories. Each is a small quantitative model, a weighted blend of four factors whose weights sum to one, and together the two models tell the software what *kind* of engagement problem this is and therefore which stakeholders deserve attention first. There are seven plan-type models, one for each recurring scenario the discipline actually faces — general engagement, generating shared value, corporate crisis, activist shareholders, diversity and inclusion, community investment, union negotiations — and eleven sector models, one for each industry's characteristic pressures, from energy and technology through retail, financial services, education, utilities, government, healthcare, nonprofits, agriculture, and auto manufacturing. A new plan starts sensibly preselected (the general-engagement default for the type, the first sector in the list) so there is never a plan with no algorithm; changing either selection re-derives everything downstream immediately.

### The models as a philosophy

The catalog's philosophy is worth dwelling on, because it explains why the models look the way they do. They are described in the source material as building blocks for customizable persona modeling — deliberately simple weighted formulas meant to be enriched over time with survey data, listening sessions, and polling as the premium Personas capability comes online. Each model answers one question: *when this is the situation, what makes a stakeholder matter?* The default model answers it with perfect neutrality — influence, urgency, engagement potential, and reputational impact each weighted at exactly a quarter — a balanced lens suitable for any context. The corporate-crisis model answers it very differently: urgency jumps to thirty-five percent of the weight and influence to thirty, because in a crisis the stakeholders who matter are the ones who can affect the outcome *right now*, while engagement potential drops to fifteen percent — a crisis is not the moment to cultivate promising relationships — and the remaining twenty percent goes to reputation impact, the capacity to move public perception while the company is under fire. And the energy-sector model tells you what an energy company's world actually looks like: long-term strategic alignment carries the largest weight at thirty percent, because energy transitions play out over decades; environmental stewardship carries twenty-five; influence twenty-five; and innovation collaboration twenty. Read side by side, the three formulas are three different theories of who matters, each defensible to the practitioner who lives that scenario. The other fifteen models follow the same logic — retail leans hardest on consumer expectations, utilities on regulatory compliance and price sensitivity, nonprofits on community engagement and impact measurement — but the pattern is always the same: four factors, weights that encode a professional judgment about the sector or scenario, summing to one.

One subtlety of the catalog demands care: factor abbreviations are scoped to their model, not global. The same two letters can mean genuinely different things depending on which formula you are reading. CE is Consumer Expectations in the retail model, Community Engagement in the government, nonprofit, and education models, and Customer Engagement in auto manufacturing. SI is Sustainability Initiatives in retail but Service Improvement in government; CI is Collaborative Innovation in the shared-value model but Community Involvement in DEI; FS is Financial Sustainability in union negotiations but Funding Sustainability in the nonprofit model; IC is Inclusive Communication in DEI and Innovation Collaboration in energy. This is not sloppiness — it is the natural consequence of each model being written in its own domain's vocabulary — but it means a factor's label and definition must always be read within its own model, and the product maintains a complete per-model factor key, with each factor's definition serving as its help text in the plan interface.

Behind the models sits the twelve-step engagement framework, the backbone the whole planning discipline hangs on. It runs in three phases of four steps each. **Purpose**: set goals for the organization, identify the issues, identify the stakeholders, prioritize them. **Plan**: analyze the landscape, align the cross-functional team, run research and listening sessions, do early stakeholder analysis and modeling. **Execute**: launch the campaign, keep analyzing as conditions change, collaborate with stakeholders, and realize shared value where possible. Notice how much of the product is a station along this sequence — organizational goals live in Settings, issues and stakeholders in the shared pool, prioritization in the algorithm, the team and tactics in the plan document itself. The plan page is essentially the framework made into software.

### How stakeholders enter, and how the software recommends

Stakeholders flow into a plan under one firm rule and complete freedom everywhere else. The rule: high-priority stakeholders surface first. Every stakeholder already carries a manual priority — High, Medium, or Low, set by a human — and the plan's roster orders by that priority before anything else. After the manually prioritized names come the stakeholders whose relationship best fits the chosen algorithm, and beyond both, the team composes freely: they can add any stakeholder from the workspace regardless of what any model thinks, pull in any stakeholder from Master (which also assigns that person to the workspace, since a plan's stakeholder is by definition the workspace's business), or create a brand-new stakeholder from inside the plan — in which case the new record lands in both the plan and the workspace, and the reminder system nudges the team to score them.

That "best fits the chosen algorithm" is the recommendation engine, and it deserves an honest telling, because it exists in two layers: what the old code actually computed, and the design that supersedes it. The old code was concrete and clever. For each stakeholder it derived a small set of observable signals from data the app genuinely holds. The team's weighted map coordinate gives *power* (the influence axis, normalized to zero-to-one) and *alignment* (the support axis, likewise); opposition is simply alignment's inverse; urgency is defined as the average of power and opposition — a powerful opponent is urgent — and engagement potential as the average of power and alignment. Issue relevance is the overlap between the stakeholder's issues and the plan's issues; community tie counts the stakeholder's affiliated community investments, saturating at two. Then a disclosed lexicon maps every factor in the catalog onto one of these signals or a blend of them — influence-type factors read the power signal, trust-and-alignment factors read alignment, urgency-and-reputation factors read urgency, community-and-sustainability factors read community tie and issue relevance — so a model's four factor weights become weights on the signals. Each of the two chosen models produces a weighted mean of its factor signals; the two model scores blend equally; the result is rounded to a zero-to-one-hundred score and banded — sixty-seven and above is High, forty and above Medium, below that Low.

The designed successor keeps every piece of that math — the same signals, the same equal sector-plus-scenario blend, the same 67/40 cut-points — and changes what the user sees and how it is framed. The number disappears from the interface: instead of a falsely precise "72/100," the stakeholder gets a Fit *band*, a one-line plain-English reason ("High influence, on-issue, community-tied"), and a *move* — the prescribed action from their relationship zone, framed by the plan type, so a Defend-zone stakeholder in a crisis plan reads "neutralize threat, defend license" while a Strategic-Partner in a community-investment plan reads "mobilize as surrogate, co-investor." The successor also adds category affinity — a small, editable weight table encoding the public-affairs truism that union plans revolve around your own people, activist-shareholder plans around investors, crisis plans around government, communities, and media — and it extends the factor-to-signal map to cover the fourteen sector factors the authoritative catalog uses that the old code never mapped, so no factor ever falls silently to a neutral default. Above all, the engine's constitution is fixed: it is advisory, its reasoning is disclosed rather than hidden, it is overridable, and it is never the source of a stakeholder's manual Priority. The software proposes; the manager disposes — literally. In the plan's priority column, a suggested band carries a small ✦ mark whose tooltip discloses the score and the three heaviest factors behind it; a manager (and only a manager) can click the cell and set a different band, at which point the mark changes to show the value was set by a human, with a one-click path back to the suggestion. Choosing the band the engine already suggested simply clears the override — agreement with the machine is not an override.

The source material's worked example shows what a finished plan looks like at full depth. Built around an energy-sector refinery facing a regulatory mandate, it runs the whole arc: the scenario and stakeholder concerns, numbered organizational goals, an engagement plan of strategy pillars (early engagement, transparency, support programs, community investment, ongoing communication), a cross-functional team spanning executive leadership through community relations, the chosen prioritization formula, the ranked stakeholder list with involvement, risk, and opportunity noted per stakeholder, a polling section with survey questions and themed findings, personas by category — one named archetype per stakeholder category, with demographics, awareness, perspective, and engagement willingness — an execution checklist, a community-investment plan organized by focus area, predictions of how each stakeholder group will react, and a communication strategy. Polling and personas are gated premium capabilities in the product, present as locked affordances; the rest of that structure is the plan page's target element set.

Honesty requires closing with the gap between the design and what the old code delivers, because the rebuild's job is to close it. The old plan page has the landing, the editor, the read-only review, the algorithm pickers, the ranked table, and the full override mechanism working. But it has no per-plan stakeholder membership at all — "Stakeholders In This Plan" is simply the entire workspace roster, and adding a stakeholder actually adds them to the workspace, never to the plan — so the rebuild introduces a real per-plan membership field to make free composition true. Its add-strategy control is a dead, hidden stub, which means a freshly created plan can never satisfy the validation gate that requires at least one titled strategy; the rebuild makes that affordance real. Its per-goal alignment notes never persist, thanks to a one-line bug in the write path that the read side masks. And plan deletion, though threaded through the code, has no control anywhere in the interface — a real delete affordance is a rebuild decision to make with the user. The document, the models, the framework, and the recommendation engine are the substance of Plans; the rebuild's work is wiring the substance all the way through.

---

## Part VI — Community

Everything in the loop before this point is judgment: scores, positions, priorities, plans. Community is where the judgment has to survive contact with a budget. It is the FUND station of the loop — the place where a relationship strategy stops being an argument and becomes an allocation — and its existence answers a question every corporate-affairs team eventually faces from a CFO or a board: *is any of this real?* Scores can be revised, maps can be redrawn, plans can be rewritten, but money spent is a fact. If the company says the local workforce coalition is a strategic partner, the proof is a funded workforce grant with that coalition's name on it. If the company says it is investing in its license to operate in a market, the proof is a ledger of commitments in that market, by fiscal year, with the reasoning attached. Community is that ledger. It exists because money is the most auditable evidence a relationship strategy leaves behind, and a tool whose whole premise is making stakeholder work defensible cannot stop at the point where the dollars start.

The module covers the full range of ways a company invests in the communities around it — Philanthropy, Volunteering, Corporate Giving, Political Action (PAC), Sustainability, and Social Impact. These are not interchangeable buckets; a PAC contribution carries disclosure obligations a volunteering program never will, and Corporate Giving further distinguishes whether the gift is monetary, in-kind, or a mix. But the product deliberately treats all six kinds through one shape: the **application**. Whatever the flavor of investment, someone on the team proposes it, the proposal carries its own justification and risk profile, the team weighs in, someone with authority decides, and — if approved — the commitment is tracked to completion. One shape means one review discipline, one rollup, one bridge to stakeholders, regardless of whether the ask is a check, a bill endorsement, or a thousand employee mentor hours.

### The life of an application

An application moves through a lifecycle of named stages, and each stage means something specific. **Idea** is a sketch — someone has heard about a program worth considering and wants it visible before it is fully formed. **Proposed** means the application is complete enough to be judged: the ask is specified, the rationale written, the risk questions answered. **Under Review** means the team is actively weighing it — this is where the voting described below does its work. From review the application resolves one of two ways: **Declined**, which is a real outcome preserved in the record rather than a deletion, because knowing what the company chose *not* to fund is part of the institutional memory; or **Approved**, the moment the company commits — the approved amount is set, the approval date is stamped, and the application starts counting in the financial rollups. **Active** means the money is flowing and the program is running; **Complete** means it has run its course. The product draws one bright line through these stages: an application is "decided" — committed, in the financial sense — when it is Approved, Active, or Complete. That single rule is defined once and drives everything downstream: the approved label on the card, the cumulative figure on a stakeholder's profile, the fiscal-year rollups. Everything before that line is aspiration; everything after it is money.

### What an application contains

The application is the module's whole vocabulary, so it is worth walking through its anatomy. It opens with identity and provenance: a name, the kind of investment, a one-line summary for the card, a fuller description, and — held apart from the description on purpose — a rationale titled "Why this, why now," a bounded field that forces the submitter to make the strategic case rather than merely describe the program. Every application knows who submitted it, in what role, and when, because an investment proposal without a sponsor is not a proposal.

Then comes **the ask**, which is more structured than a single dollar figure because real corporate giving is not a single dollar figure. The ask has a type — funding, volunteer hours, an endorsement, in-kind support, or a political contribution — an amount with a unit, and a recurrence: one-time, annual, or multi-year with an explicit number of years. That recurrence field looks minor and is anything but; it is what lets the product later spread a three-year, $300k commitment as $100k in each of three fiscal years instead of a misleading lump. A timeline and a decision deadline round out the ask, so a proposal cannot drift undecided forever without at least being visibly overdue.

The **alignment** block is what makes this a stakeholder tool's ledger rather than a generic grants tracker. Every application declares the markets and regions it touches (regions derived from the chosen markets, using the same shared geography taxonomy as everything else in the product), the company issues it advances, a primary represented stakeholder — the organization or person the investment is *for* — and a set of linked stakeholders: the supporters, opponents, and decision-makers from the map whose relationships this investment is meant to move. The **budget** block separates the total project cost from the amount actually requested of the company, notes other funding partners, and records in-kind contributions, so a reviewer can see at a glance whether the company is the sole funder or one of several. And the **risk and compliance** block asks the questions a general counsel would ask: reputational and political exposure, legal and disclosure considerations, and — importantly — a conflict-of-interest disclosure that, once checked, requires a written description of the conflict and how it is managed, followed by an attestation that the information is accurate. An application cannot be saved as complete without that attestation. This is governance built into the form itself: the awkward questions are asked of everyone, every time, before the money moves, not reconstructed after a journalist calls.

### Judging value, and who decides

Each application carries a **value score**, and its construction is deliberately humble: two hand-set sliders, zero to ten — how much the engagement improves the company's license to operate, and how much it strengthens relationships — averaged into a single number. That is the whole formula, and the modesty is the point. Where the SEP prioritization model earns its complexity from real inputs (map positions, issue overlap), community value has no such inputs to compute from; a fake-precise formula here would be theater. Two honest judgments, averaged, displayed as a small bar on every card, is a planning signal the team can argue about — which is exactly what it is for. The page's own footer says so in plain language.

Around that score sits the **team's vote**. Any teammate can register support or objection on an application from its card — a simple for/against pair, with a second click withdrawing the vote. The votes are explicitly advisory: they inform the decision, they never make it. One honest note belongs in the record here. The data model has always included a third option, *abstain* — it exists in the vote enum and in the seed data — but in the original application no control ever set it; the stylesheet even contains the dead styling for a third button that was planned and never rendered, and a seeded abstention could be overwritten but never re-cast. The rebuild makes abstain real as a proper third choice, because "I have a conflict and am stepping back" is a governance signal worth capturing, not a data-model fossil.

The decision itself is where the rebuild deliberately hardens the original. In the old code, an application's stage was an ordinary dropdown any user could set to anything — "approval" meant someone hand-selecting Approved and typing in an amount and a date, with no record of who decided. The rebuilt product treats approval as governance: a formal, manager-only Approve action moves the application to Approved and stamps who approved it and when. The team votes; a manager decides; the record shows both. That separation — advisory voice for everyone, accountable authority for one — is the same philosophy the plan's priority overrides follow, applied to money.

### Where the money lands

Because commitments recur and span years, the module's rollups are fiscal-year aware, using the fiscal calendar the organization sets in Settings. Every decided application is anchored to the fiscal year containing its approval date, and its approved amount is allocated from there according to its recurrence: a one-time commitment lands entirely in that year; an annual commitment counts in that year and every year after; a multi-year commitment divides its amount evenly across its stated span. From those allocations the page keeps three figures always in view: **Requested**, the sum of every pending USD ask; **Annual**, everything allocated to the current fiscal year; and **3YR Total**, the current fiscal year plus the two before it. That three-year window is a deliberate horizon — long enough to show the sustained pattern of investment behind a relationship (which is what a board or a community partner actually cares about), short enough to genuinely roll forward rather than fossilize into an ever-growing lifetime sum that flatters the past. The distinction between requested and approved is kept sharp throughout, because conflating what was asked with what was committed is exactly the kind of sloppiness that makes engagement spend indefensible.

The rollups also flow back to the atom. Because every application names its represented and linked stakeholders, the product can compute, for any stakeholder, the set of investments affiliated with them and the cumulative committed dollars behind the relationship — and it shows that figure on the stakeholder's profile. This is the bridge that closes the loop: standing on Senator Park's profile, you see not only where the team has positioned her and what the plan intends, but what the company has actually spent in her orbit; standing on an application, her name is a clickable pill that takes you straight back to her profile. Relationship strategy and money become two views of the same record, navigable in both directions, and plans link their community investments directly so a strategy document carries its own funding evidence.

One last piece of the design is forward-looking. The original ledger is USD-only, and non-monetary asks — volunteer hours, in-kind support — simply sit outside the dollar rollups. The designed successor does better on both counts. Amounts may be denominated in USD, MXN, or CAD — Mexico and Canada are already in the product's market taxonomy — with a real-time conversion service translating everything into the USD reporting currency; and critically, when an application is approved, the exchange rate at that moment is captured and locked, so a committed peso grant keeps its historic dollar value forever rather than drifting with the currency markets, while pending asks float at current rates. Hours and in-kind contributions get a case-by-case monetized value assigned inside the application, so every form of investment can roll up as a dollar-equivalent. None of that changes the philosophy; it extends it. The ledger's job is to make the company's community investment a precise, auditable, stakeholder-linked account of goodwill bought and shared value created — and precision about currencies and non-cash giving is just the same honesty, applied to harder cases.

---

## Part VII — Settings, Messaging, and the People Layer

Everything described so far — the scoring, the map, the plans, the community ledger — runs inside a frame that someone has to set up, among people who have to talk to each other. That frame is the subject of this part: the Settings hub where a manager writes the organization's constitution, the workspaces where teams stand while they work, the intelligence band that tells a workspace what needs attention today, the messaging layer that stitches conversation to the records it is about, and the people model — accounts, roles, presence, profiles — underneath all of it.

### Settings as the constitution

Settings is manager-only, and deliberately so. The entire view is gated at the shell — the Settings menu item does not even render for a non-manager — because what lives here is not preference but law: the vocabularies, structures, and calendars that every other screen reads. The hub is a two-column surface, a left rail of nine panes and a right column of sections, and nearly every pane follows the same philosophy: the app ships with seeded defaults so a new organization is never staring at empty dropdowns, and every one of those defaults is editable, because the seed catalog is a starting point, not a doctrine. Under the hood this is one mechanism — each catalog is a key inside the single persisted appConfig object, falling back to the seed when unset, and written back onto the shared data module so every view reads the manager's version, not the factory's.

The catalogs themselves map the organization's worldview. Categories and audience types define how stakeholders are classified — a two-level structure where each category contains the audience types a stakeholder can be, edited with the same shared two-level editor that also handles segments and markets. Segments and business units define the company's own anatomy; workspaces are built by pairing one with the other, so this pane literally determines what workspaces can exist. Markets and regions define the geographic scoping that runs through stakeholders, plans, and community engagements alike. Sites record where the company physically operates, with a small piece of country logic worth noting: a US site carries a state and its country is set to "United States" automatically, Canadian and Mexican sites carry provinces and states the same way, and anything else picks from a country list — so a site is always "City, ST" or "City, Country," never ambiguous. Issues are the flat list of topics the company maps stakeholders against, surfaced as suggested pills on every stakeholder card. Tags are the same idea with one twist: every tag is slugified on entry — trimmed, lowercased, whitespace collapsed to hyphens, punctuation stripped — so "Public Affairs!" becomes "public-affairs" and the shared tag vocabulary stays machine-clean while issues and goals stay human-readable. Individual functions populate the Function dropdown on every user's profile. And organizational goals are the most consequential list of all: the three-to-five goals the company is working toward are inherited by every stakeholder engagement plan the team creates, which is how a plan written in a regional workspace stays tethered to what the enterprise actually cares about.

One pane deserves to be called the app's heartbeat: the fiscal calendar. An organization picks the month and day its fiscal year begins — November 1 by default — and quarters are computed from that anchor as four equal three-month spans, each quarter ending the day before the next one starts. The Settings pane shows the resulting quarters live (with the default anchor: Q1 November 1 through January 31, Q2 February through April, and so on), and that quarter math is not decorative. It drives the scoring cadence, the quarterly map snapshots, and the fiscal-year rollups elsewhere in the product — which is why it lives in the constitution rather than in anyone's personal preferences.

The Team Management pane holds the people governance. Roles are a clean three-value model: managers, members (shown in the UI as "User"), and one system account that never appears in any list. The Roles table gives every human a two-button toggle — User or Manager — with exactly one guard: you cannot demote yourself; another manager has to do it. The invite model sits beside it: an invite code that new people enter when creating their account to join the organization, with a Copy button and a Regenerate button. Honesty requires a note here, and it is the same note that applies to several Settings controls: in the oracle, the invite code was never actually seeded and no signup flow consumed it — the pane described the intended backend join flow rather than implementing it, and even Regenerate was really a "email us and we'll issue a new one" dialog. The capture records this precisely so the rebuild makes it real rather than porting a facade: a real code issued and consumed at account creation, invalidated server-side on regeneration.

The identity pane — app name, brand icon, brand color, accent color, theme, and time zone — is where the design dashboard grows from. The oracle offered seven shared color swatches plus a beaker-glyph escape hatch into the OS color picker, and a three-way theme choice (the warm-beige Soapbox default, a true-greyscale Undecideds, a warm-charcoal Night Shift) with an auto-switch-at-night time picker. And here is the second honest note: theme, auto-night-switch, and time zone were all dead writes in the old code — the picker persisted the choice and showed the active swatch, and nothing anywhere applied it. No theme class was ever set on the document, no scheduler read the switch time, no timestamp formatter consulted the zone. In the rebuild these become real by construction, because the rebuilt app's entire visual surface is the token layer: a theme is a named token set applied at the root, the theme picker swaps token sets, the auto-switch is a clock check against the stored time, and timestamps are stored in UTC and displayed in the configured organizational zone. What was a painted-on dashboard becomes the genuine token-editing surface the design system was built around.

### Workspaces and the workspace's pulse

If Settings is where the organization is defined, workspaces are where it stands to work. A workspace pairs a segment with a business unit — "Government Affairs — North America" — carries an optional national-or-state scope, and is owned by one or more people, who see it in their working set. The essential design fact, worth restating because so much behavior flows from it, is that workspaces never own stakeholders. The single master pool holds every stakeholder once; a many-to-many join maps each stakeholder to any number of workspaces; and a workspace's apparent geography is derived, not stored — its markets and regions are simply the union of the markets and regions of the stakeholders assigned to it, recomputed live. Nothing is ever copied, so nothing can ever drift.

Governance around workspaces is small and deliberate. Anyone can create one — the creator is pre-set as first owner, and the form is invalid until it has a name and at least one owner. Members see the workspaces they co-own; managers see all of them. Deletion is restricted to the workspace's creator or a manager, always behind a confirmation dialog that says exactly what the deletion costs — and the answer is: very little, because the stakeholders stay in the master pool. Deleting a workspace strips its id from every stakeholder's membership list and nothing else. The pool is permanent; workspaces are lenses.

Sitting above a workspace's table is workHQ, the workspace's pulse — a band of computed intelligence that answers "what needs my attention here, today" without any new data entry, because every signal is derived from stores the app already keeps. Cold engagements are high-priority stakeholders whose last contact is ninety days or more stale, sorted stalest-first. Needs-your-score lists the stakeholders the current user has not yet scored (the oracle computed this against the wrong key — user id instead of team-member id — a verified bug the capture rules out of the rebuild in favor of the one canonical unscored predicate that also drives the scoring badge and the reminder cadence). The relationship mix classifies every stakeholder's computed zone into positive, winnable, or negative — the five cooperative zones, the five defensive zones, and the four in between — giving the team a one-glance temperature of its whole slice. Awaiting-your-vote surfaces community applications in Proposed or Under Review that the current user has not voted on. And developments flattens every stakeholder's note history into a newest-first feed of who wrote what about whom. The band has three layouts — split with the table, expanded, or collapsed to a single summary line ("3 high-priority going cold · 5 need your score," or, on a good day, "All clear — nothing needs attention") — so it can be a dashboard or a whisper depending on how the team works.

### Messaging: the connective tissue

Messaging is deliberately light — a conversation layer, not a collaboration suite — but it is wired into the product's nervous system in two ways that matter. The first is architectural: two surfaces, a right-edge sidebar for quick exchanges and a full page for sustained ones, share one conversation-and-message store, so a message sent in one is instantly present in the other. Starting a direct message with someone you already have a thread with reopens that thread rather than minting a duplicate — DMs are deduplicated by participant pair — and the current user is always silently included in any conversation they start, which keeps titles and avatars coherent by construction.

The second wiring is the mention grammar, which is what makes messages part of the record system rather than beside it. Four trigger characters open a live autocomplete as you type: @ searches stakeholders, / searches workspaces, # searches plans, $ searches community engagements. Picking a match splices a structured token into the message — {{type:id|label}}, with the type one of four short codes — and when the message renders, each token becomes a clickable chip, colored by type, that resolves back to the live record and opens it. A sentence like "we should get @Senator Park into #Q3 Legislative Push" is therefore not prose about the work; it is prose linked to the work, and the links survive because they carry ids, not names.

One conversation is special: the system Reminders thread, authored by the bot account and pinned permanently to the top of every conversation list. Its list row does not show a timestamp like the others; it shows a pending count — the number of stakeholders currently needing the user's score — or "All caught up" when there is nothing owed, because for an automated thread, the interesting fact is never when it last spoke but whether it is still waiting on you. The oracle, having special-cased the row, forgot the opened thread: it rendered a normal composer whose replies went into a dead-letter void, labeled the org-wide bot thread "Direct message," and showed stacked user avatars instead of the system glyph. The capture rules all three corrected: in the rebuild the Reminders thread is read-only — no composer renders — its subline reads "Automated reminders," and it wears the same sparkle avatar open as closed. These are recorded deviations by ruling, not drift.

Around the threads, the small human details are all present: messages from the same author within sixty seconds group into one visual run; presence dots on avatars show who is online; the people panel on the right edge lists every teammate with a one-click message action; and the new-conversation dialog assembles any group — search-as-you-type or pick from the checkbox list, optionally named once it grows past two people — with the start button disabled until someone is picked.

### The people layer

Underneath it all is the user model: a name, title, and email; a role; a presence state; and an avatar that is either an uploaded photo or initials on one of eight muted palette colors, chosen at sign-in and editable later. The edit-profile surface adds first and last name (recomposed into the display name on save), a function drawn from the Settings catalog, and a markets-then-regions picker that cascades — you select markets first, and only the regions belonging to those markets become choosable, the same discipline the stakeholder card enforces.

Every user also has a full profile page, and its design principle is that a profile is not a form — it is a view of assignment. Below the hero (avatar, name, title, email, a manager badge where earned, and an Edit button only when you are looking at yourself) sit four tabs, each derived live from the data rather than stored: the workspaces the person owns or has plan work inside; the plans they own or sit on the team of; the community engagements they own; and — the reach-through — the stakeholder relationships that come with all of that, meaning every stakeholder belonging to a workspace of one of their plans, shown with computed relationship band and priority pills. Each tab is a searchable, filterable, sortable table whose rows click through to the underlying record, and switching tabs resets the view. Ask "what is this person responsible for," and the page answers from the same single source of truth as everything else — which is, in the end, the whole point of the layer this part describes: the configuration, the conversation, and the people are not adjacent to the stakeholder intelligence. They are made of it.

---

## Part VIII — The Backend

Everything in this part follows from one architectural decision, made before any feature was built and honored — imperfectly, as we will admit below — throughout: the user interface never touches storage. Every screen in Stakeholdr reads and writes its data through a single seam, a hook called `usePersistentState(table, seed)` that behaves exactly like React's ordinary `useState` except that its value survives reloads and propagates to every other consumer of the same table. Beneath that hook sits the Store — one small module that knows how to load a table, save a table, and let subscribers know a table changed. The components above the seam do not know, and cannot know, what the Store is talking to. Today it talks to the browser's localStorage, and it announces changes on a BroadcastChannel so that a second open tab updates the instant the first one saves. Tomorrow it talks to a Postgres database in the cloud, and the announcement arrives over a websocket from a server instead of a channel inside the browser. The point of the design is that "tomorrow" is a change to one file. Not one file per feature, not a connector per entity, not a migration of every screen — one file, the Store, and the entire application above it is byte-identical before and after.

This is why the demo is not a throwaway. The demo Store already speaks the future's language. When it saves, it broadcasts an event shaped `{ table, value }` — and that shape was chosen deliberately, because it is exactly what a Supabase `postgres_changes` subscription delivers when a row changes on the server. When a component subscribes to the `stakeholders` table, it neither knows nor cares whether the change it receives was made in the next tab over or by a colleague on another continent. Identifiers are minted client-side with `crypto.randomUUID`, so records created concurrently by many users never collide and a retried write is harmless rather than a duplicate. Every mutable record carries `createdAt` and `updatedAt` stamps in full ISO form. None of this was necessary for a single-browser demo; all of it was necessary for the demo to be the *same product* as the production system, waiting on a flag.

The flag is real and singular. The application ships in two states behind the one Store API. **State A — Demo** is the default: no accounts, no network, no cost; the Store runs on localStorage plus BroadcastChannel, seeded with a believable sample organization, and everything works on a single device across as many tabs as you like. This is what a prospective client reviews. **State B — Supabase** is what a paying client runs: if the Supabase environment variables are present at build time, the Store routes its load, save, and subscribe calls to Postgres, Realtime, and Auth, and signing in becomes mandatory. Flipping the switch means setting the environment, running the schema SQL, enabling row-level security, and deleting the demo's fake login. The two-state requirement is the whole reason the boundary had to be single and generic: two transports can only be interchangeable if nothing above them knows which one is installed.

One honesty note belongs here, because the book is a record and not a brochure. The single-boundary principle is the design; the old codebase implemented it *partially*. The per-feature wiring to the Store was done by hand and stopped partway, and the row-level and auth work described below was never done at all. The rebuild treats the old plumbing as a blueprint, not finished work: build the data layer first, then register every entity through the same API as each feature is rebuilt, so coverage is complete by construction instead of patched after the fact.

### The row-level correction

The demo Store has one honest limitation, and it is the most important thing to understand about the swap. Today, `save(table, value)` persists the *entire collection* — the whole stakeholders array, the whole scores object — because in a single browser that is perfectly correct and admirably simple. Across multiple users it becomes last-write-wins at the granularity of the whole table: if one person edits stakeholder sh-03 while another edits sh-07, whoever saves second silently erases the other's work, because the unit of persistence is the array and not the row. This is not a bug in the demo; it is the demo's honest scope — and the first thing the production wiring must correct, easy to forget precisely because everything *appears* to work without it.

The correction is that every mutation writes only what actually changed. A stakeholder edit becomes an upsert of that one row — in the strict form, only the changed *columns* of that one row. A delete becomes a delete by id. A score becomes a write of the single (stakeholder × teammate) cell that moved, keyed by that compound primary key, never the whole scores object. The `updatedAt` stamp that every record already carries takes on its real job here: it is a token for *conflict detection*, not a merge algorithm. A write carries the version of the row it read; if the server holds a newer one, the write is rejected and the client re-reads and re-applies rather than clobbering. Genuinely simultaneous edits to the same field are the only true conflict, and they are resolved openly — newer version wins, and the loser is told — rather than silently.

The deeper discipline is that conflict is handled at the *smallest natural unit* of the data, which means the data must be shaped so those units exist. A record's nested collections must not ride on the parent's single timestamp: notes become their own append-only rows, score-history snapshots their own table, a plan's tactics and phases their own rows, community votes their own keyed rows. Append-only data — messages, notes, feedback, history — cannot conflict at all, because inserts never collide. Only the truly collaborative documents, where people type over each other in the same paragraph, need heavier machinery (a CRDT), and only they get it. Three tiers, each with the cheapest strategy that is actually correct; using one strategy everywhere — whether the naive one or the heavy one — is the classic mistake this design refuses.

### The envelope, the schema, and the gates

Every mutable row in the production system wears the same envelope, decided once and inherited everywhere: a stable UUID identity; an `org_id` marking which tenant owns it; created-at and created-by, updated-at and updated-by; a soft-delete pair (`deleted_at`, `deleted_by`) so removals propagate in realtime, remain recoverable, and never destroy history; and a version integer for the optimistic-concurrency check. Timestamps are stored in UTC to the millisecond — simultaneous edits need strictly orderable stamps — and *displayed* in a single organization time zone that a manager sets; date-only values are reserved for genuine calendar facts like a last-contact date. On top of the envelope sits the "time capsule": an append-only versions log recording who changed what and when, viewable per record, with restore implemented as writing an old version forward as a new change — never as rewinding the record destructively.

The schema itself is thirteen tables, and in outline it reads like the ecosystem of Part II. **Users** holds each person's identity, function, geography, and — crucially — their real role. **Workspaces** holds the named working contexts with their segment, business unit, and owners. **Stakeholders** is the shared pool itself, one row per person or organization with the full identity, classification, geography, and relationship attributes. **Stakeholder_workspaces** is the many-to-many join that places one stakeholder in several workspaces without ever copying them. **Team_members** carries the raters and their weights, and **scores** holds one row per stakeholder-per-rater with the x and y judgment and its own timestamps — already the finest-grained table in the system, because scoring is where concurrent work is most intense. **Conversations** and **messages** carry the messaging surface, append-only by nature. **App_config** is the single row of organizational settings — the app's name and accent, the fiscal calendar, and the editable taxonomies. **Community_applications** holds the full investment lifecycle from ask to approval, and **community_votes** normalizes the team's votes into one keyed row per voter per application. **Plans** holds the per-workspace engagement documents. And the versions table records the time capsule for all of them. Postgres foreign keys with cascade deletes keep the graph honest server-side — deleting a workspace cleans up its memberships without fragile client code.

Guarding all of it is row-level security, stated plainly: the interface's role gates are cosmetic, and RLS is the real boundary. Every policy the UI implies is mirrored in the database, where it cannot be bypassed by a curious client. Every table is scoped to the caller's organization, so tenants are isolated at the row level. A user may write only the score rows that belong to their own team-member identity — the "you edit your column, you see everyone's" rule from Part III, enforced where it counts. Workspace deletion is restricted to the creator or a manager; the organizational configuration and role assignments are writable only by managers; plan and community writes are scoped to their owners and teams.

### Realtime, auth, and the switch that stays honest

The backend is Supabase — Postgres with Realtime and Auth attached — and the choice was a judgment about the shape of the data, not fashion. The obvious alternative for live sync was Firestore, and Firestore does live sync beautifully. But Stakeholdr's data is *relational* to its bones: a many-to-many join between stakeholders and workspaces, scores keyed by compound identity, fiscal-year rollups computed across tables, cascade deletes, and row-level security policies expressed against real columns. Postgres is that data's home; a document store would have forced a re-modeling for no gain. And Supabase's Realtime delivers the live layer anyway: `postgres_changes` streams row changes to every subscribed client in the same `(table, row)` shape the demo already speaks — the Store merges the incoming row into its cache by id, never replacing the whole collection — while Presence makes the online-avatar stack and People sidebar *real* rather than seeded, and Broadcast carries ephemeral signals. An offline queue buffers mutations while disconnected and flushes on reconnect.

Authentication follows a deliberately simple beta model. A new user signs up with a name, an email, a password, and an *organization access code* — a code generated per client and handed to them, whose entry maps the account to that client's organization and workspaces, and whose absence or invalidity blocks account creation outright. In demo mode the code validates against a hardcoded map; in production it validates against an `org_codes` table, itself under RLS so no client ever glimpses another's. The demo's most cheerful lie — that every login is auto-promoted to manager — is removed; manager versus member becomes a real attribute of the user row, granted by a manager, enforced by policy. Enterprise trimmings (SSO, magic links, MFA) layer on top of this model later; they do not replace it.

One scheduled job closes the measurement loop from Part II. At each quarter and fiscal-year boundary — boundaries derived from the organization's configurable fiscal calendar, never hardcoded — a rollover job snapshots every stakeholder's weighted map position into the score history and nudges the teams to re-score. This is what makes the Map's history mode more than a demo trick: the quarterly trail accretes automatically, forever, without anyone remembering to press a button.

Finally, going live has an acceptance bar, and it is worded to catch the exact failure the demo can mask. Create, edit, and delete each entity, reload, and confirm it survives — *and confirm a second user in a second browser sees it*, because true multi-user is not the same as cross-tab. Confirm scoring writes only the current user's column while others watch it update live. Confirm one organization's code cannot see another organization's data. Confirm manager-only actions are blocked for members at the database, not merely hidden in the interface. Confirm every screen renders clean, with no console errors. When those five hold, the switch has been flipped honestly — and the product that clients fell for in the demo is, at last and by design, the same product at its intended scale.

---

## Part IX — The Roadmap

Everything in this book so far has described what Stakeholdr *is*. This final part describes how it comes back — the exact path from a verified specification to a shipped product — and, just as importantly, the discipline that governs every step of that path. The roadmap is not a wish list. It is a sequence of gates, each of which must be passed before the next opens, and the whole of it answers to a single standard: fully executed and correct, with no vibe-coding anywhere. Every color, every element, every interaction, and every connection in the rebuilt app must already be written down before a line of app code is built. Where the first build inferred wrappers and improvised divs, this one assembles against trees. Where the first build styled by feel, this one has exactly one styling surface. The roadmap exists to make invention at build time impossible, because invention is where losslessness dies.

### Where we stand: a capture that has been made to prove itself

The starting condition for everything that follows is that the capture — the checklist on the `.io` and this book — has been adversarially verified against the original code, not merely written. The capture ran a three-round verify-fix loop against the oracle: ninety agents were set loose on it, and they raised 225 findings, 126 of them high or medium severity. Round one caught the structural misses — dead writes, fake wiring, missing anatomies. Round two swept up the precision residue. Round three ran down a twenty-six-finding tail, each fix applied with per-finding oracle evidence down to file and line. Several clusters — the engine data with its catalogs, zones, and formulas; the users module; the cross-consistency checks — passed a *blind* clean verify, meaning fresh eyes found nothing left to find. And every place where the original app quietly lied — a theme setting that wrote to nowhere, a store reset that nothing called, a vote state that could never be reached, plan-level stakeholder wiring that simply didn't exist — is now recorded as an explicit do-not-replicate or make-real rule. The standing law is that the original *design* is accurate while the plumbing often is not; the rebuild wires it for real.

On top of the content verification sits the original-design census: four sweeps over the original app itself. Every one of the 187 distinct color literals has been reconciled with a disposition — already tokenized, captured into a token, flagged as a new token need, or superseded with a written rationale — so that nothing was silently dropped. Every screen box now carries a skeleton tree, the nested region tree extracted from the literal JSX, so the build assembles a page against a structure rather than against prose. Every event handler in the original — hundreds of them, from the app shell's eighty-seven bindings down to the map's nine — is enumerated with its exact behavior. And the connectivity graph maps all ninety-four cross-record edges: sixty-seven real, twelve fragile window-bridges to be promoted to first-class routing, eleven fake or dead links on the make-real list, four one-way. The capture, in other words, is no longer a description of the app. It is the app, in written form.

What remains before building is human: the user seals boxes on the `.io`, one at a time, confirming that each is entirely lossless; the assistant commits that confirmation into the guide source as the durable record. Alongside sealing run the coverage gates — every gap component registered in the design-system manifest before first use, every design-value hex migrated to a token, every forward-design over-claim consciously kept or dropped, every recorded oracle bug deliberately excluded. Only when the checklist is sealed and the gates are green does the build begin, and from that point the build is not a creative act. It is the execution of a sealed checklist.

### The build, phase by phase

The build itself is governed by the Canonical UI law and its three rules: real components — genuine custom elements with shadow DOM, real states, and real accessibility, never reimplemented in markup; one styling surface — the `--ui-sys-*` token layer is the only legal home for a visual decision, with no overrides, no utilities, no inline styling; and a binding manifest — the machine-readable contract listing every component, tag, prop, state, and consumed token, which build sessions read and obey. Thirty-five components already exist under that law. Anything a sealed box needs that the manifest lacks is a gap, and a gap is closed by building the component *into* the design system to the established quality bar and registering it — never by patching around it in app code.

The phases run in dependency order. First the foundation: the token file is adopted at the app root so that the entire look of the product is a layer, tunable live, rather than something baked in. Then the app shell — the frame every page lives in, composed from the shell, app-bar, sidebar, and status-bar components, carrying the rulings that bind every screen: the workspace selector in the top bar beside the brand, the proportional Claude-like sidebar that never sits hollow, the single identity avatar pinned bottom-left, the "Sr" monogram whose field color can never drift from the app title because both read the same token. The Design page follows the shell, because you cannot re-skin a shell that does not exist. Then the pages, in order, each built strictly to its sealed box and confirmed before the next: Lists, Scoring, Map, Plans, Community, Workspaces, Settings, Help, Messages, Profiles. Then the record scaffold — the universal read-and-edit shell that every record type pours through — together with workHQ, the workspace intelligence strip. Then the demo features, then the backend, then the paid add-ons. Every phase ends the same way: it renders, with zero console errors, from design-system components only, and the user confirms.

### The demo state: full capability without a server

A deliberate property of Stakeholdr is that the free, single-browser demo is a genuinely capable product, not a crippled teaser. The demo-features phase makes it so. Its centerpiece is the Excel import: a downloadable template in which every choice-limited column is a real dropdown validated against the app's own catalogs, with cascading validation where a column is a child of a parent — type follows category, region follows market, site follows state — and computed columns marked "leave blank," ignored on import rather than allowed to break it. The wizard that receives the filled template maps columns automatically, validates every value against the catalogs, previews and flags invalid rows, and only then commits — because dropdowns and cascades are what prevent the misspellings and format drift that would otherwise poison the data at the door. Alongside import sit the exports — the table's CSV export, captured verbatim from the original, and a new plan-to-Word/PDF export — plus an onboarding tour built on a new coachmark component, proper empty states and bulk actions, and the one mobile surface the product will have: a companion view for stakeholder quick-look, note capture, and messages, built from the same responsive components rather than a parallel kit.

### The monetized layer and the flywheel

The backend phase — the transport swap inside the persistence seam, plus real auth, row-level security, realtime, and the fixes the demo's architecture was designed to receive — unlocks the paid layer. Its three add-ons are deliberately a chain. Polling puts real questions to real stakeholders and returns insight themes. Personas distills polling and listening data into named archetypes per stakeholder category — demographics, concerns, perspective, willingness to engage. The AI Message Generator takes a finished plan, with its goals, prioritized stakeholders, and issues already structured, and drafts the key messages that advance it — server-side, metered, seeded by a curated pre-prompt and always editable by the team. Each add-on's output makes the next one smarter, and all of it enriches the plans at the center of the product: a data flywheel, not a menu of bolt-ons. The commercial machinery around it — per-seat subscriptions, org-level entitlements, usage metering — is enforced server-side, never merely hidden in the interface; in the demo, the add-ons appear only as quiet, locked affordances modeled on the one dashed note the original app already carried.

### The Whiteboard, the design endgame, and the standard

Two threads run past the numbered phases. The first is the Whiteboard — the team's white space for capturing and assigning ideas, writing together with visible, attributable edits, threading comments, and turning a pasted URL into a clean news or social capture. It is articulated but deliberately not yet designed: its requirements are the contract, its canvas is an acknowledged gap to be built into the design system, its collaborative core is already ruled to run on a CRDT so concurrent edits merge without conflict, and its concrete design happens with the user before a line of it is built. The second thread is the design endgame: the cream default and a cooler, crisper "Modern" variant, built as named token sets and previewed side by side for a ruling — with the fourteen zone colors and the semantic pill tokens exempt from any theme swap, because the map's meaning is not a matter of taste. Three token decisions remain open on purpose — the accent hue, the shadow question, the wrapper's direction — and they are decided at the Design-page step, with the user, as token edits and nothing more.

That is the roadmap: seal, gate, build, confirm — foundation to shell to pages to records to demo to backend to revenue — every step executing what is already written, and nothing ever invented on the way.
