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

*(continues — the two axes in depth, the team and weighting, the blend, the fourteen zones
as a complete worldview with their exact recommendations, the map's interaction model,
drag-to-reposition, history mode, and density — written at the same prose depth; then
Part IV the Table, Part V Plans, Part VI Community, Part VII Settings & Messaging,
Part VIII the Backend, Part IX the Roadmap.)*
