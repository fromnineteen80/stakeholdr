import { useState, useMemo } from 'react';
import {
  CssBaseline, Box, AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Checkbox, LinearProgress, Chip, Divider, Paper, Alert,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import InventoryIcon from '@mui/icons-material/Inventory';
import FoundationIcon from '@mui/icons-material/Foundation';
import PaletteIcon from '@mui/icons-material/Palette';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableViewIcon from '@mui/icons-material/TableView';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DnsIcon from '@mui/icons-material/Dns';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// guide.jsx — Stakeholdr BUILD GUIDE.
// 100% plug-and-play Material Design 3 (Material Web) — no hand-rolled spans, no custom
// styling yet (that arrives via the Settings → Design page in Phase 3). This is
// the single source we follow to rebuild the app, in order. Each item carries
// the inferred detail captured "as the Anthropic dev"; the user reviews on the
// .io and we seal each handshake by committing the check (done:true) into source.

const DRAWER = 360;
const STORAGE = "stakeholdr_guide_checks_v1";

// d: optional inferred detail rendered in an expandable panel under the item.
const PHASES = [
  {
    id: "p0", Icon: Inventory2Icon, label: "Foundation · setup only",
    blurb: "The build laws and tooling that must exist before anything is rebuilt — the component kit, the type/icon system, and the meta docs. SETUP ONLY; all app knowledge lives in the Capture section below.",
    items: [
      { t: "Material Design 3 (Material Web) is the ONLY component kit — the law for every element", done: true, d:
`Every UI element is a standard Material Design 3 component from Google's Material Web (@material/web), or a composition of them; never a hand-rolled element, and NEVER MUI or any other third-party kit.

THE KIT (verbatim): Google Material Web (@material/web), the official MD3 web-components. Design language + tokens from m3.material.io. NOT MUI / @mui/material — that was a wrong turn and is being removed everywhere. Build: React 18 + Vite, deployed to GitHub Pages. Material Web ships as custom elements (<md-*>) imported per component (e.g. import '@material/web/button/filled-button.js') and rendered directly in JSX; props are attributes, and events are standard DOM events (bound via refs/addEventListener since React 18 does not natively bind custom-element events/props for all cases).

USE THE FULL KIT (never bare-minimum) — name the specific md-* element + variant for each element: buttons md-filled-button / md-outlined-button / md-text-button / md-elevated-button / md-filled-tonal-button, md-icon-button, md-fab; selection md-outlined-select|md-filled-select + md-select-option (short fixed sets), md-menu + md-menu-item (action menus), md-checkbox, md-radio, md-switch, md-slider; chips md-chip-set + md-assist/filter/input/suggestion-chip; inputs md-outlined-text-field / md-filled-text-field; structure md-dialog, md-list + md-list-item, md-tabs + md-primary-tab/md-secondary-tab, md-divider, md-elevation, md-linear-progress / md-circular-progress; md-icon for icons; md-ripple / md-focus-ring for interaction states.

NO DATA TABLE, NO CHART IN MD3 — Material Web deliberately ships neither a data grid nor a chart. The Lists table and the Map plot are therefore COMPOSED from MD3 primitives (md-list, md-outlined-select, md-icon-button, md-chip, etc.) plus semantic HTML for tabular structure and inline SVG for the plot, styled SOLELY with MD3 design tokens — never a third-party table/chart library, never MUI. This is the single sanctioned place we compose beyond stock components, and it stays 100% MD3-tokened.

CHANGES TOO: when we later modify something, the change is made with OTHER MD3 / Material Web components — recompose standard MD3, never a custom hack and never MUI.

FORBIDDEN: MUI / @mui/* anywhere; non-MD3 UI libraries; raw span/div as UI primitives (allowed only as layout/SVG containers); ad-hoc/inline styling; !important; stray/duplicated/patch CSS; premature visual customization.

THEMING = single source, MD3 tokens as CSS custom properties, NOT per-component code: set --md-sys-color-*, --md-sys-typescale-*, and --md-ref-typeface-* once at :root; every md-* element inherits automatically; change a token once → it updates everywhere. Never style a component one-off. Re-skinning later (toward Claude) = changing tokens only.

PALETTE START-STATE mapped to MD3 color tokens: surfaces light→dark #FFFFFF · #FEFDFC · #FCFBF9 · #F8F7F3 · #F4F3ED · #F0EEE6 · #E8E6DE → --md-sys-color-surface and the --md-sys-color-surface-container(-low/-high/-highest) ramp + --md-sys-color-surface-dim/-bright; ink → --md-sys-color-on-surface #666361, --md-sys-color-on-surface-variant #ABA9A4, --md-sys-color-outline / outline-variant #DFDDD6. Small clean type, modest weights, no oversized headings; tight-but-airy spacing; readability/ease/pleasure are the bar.

DONE = (1) every element is a standard Material Web md-* component (or sanctioned MD3-tokened composition for table/plot); (2) renders, zero console errors; (3) zero MUI, no spans-as-UI, no !important, no bespoke styling; (4) all look comes from MD3 :root tokens.` },
      { t: "Type & Icon system — Inter (body/UI) + Newsreader (titles) + Material Symbols icons", done: true, d:
`TWO type roles only + the MD3 icon set, loaded as web fonts, applied via MD3 typeface/typescale tokens at :root — never per-component. ONLY Inter and Newsreader are authorized; NO IBM Plex Mono, no Roboto, no other family (the previous session wrongly added IBM Plex Mono / extra fonts — removed).

TYPE STACKS (verbatim):
plain (body + all UI): "Inter","Helvetica Neue",Helvetica,Arial,sans-serif
brand (titles only):   "Newsreader","Source Serif Pro","Charter",Georgia,serif

ROLES, mapped to MD3 typeface tokens:
• --md-ref-typeface-plain = the Inter stack → drives all body/label/title-small UI text. Base ~13px, color = on-surface ink, font-feature-settings "ss01","cv11","tnum" (tabular numerals).
• --md-ref-typeface-brand = the Newsreader stack → drives DISPLAY + HEADLINE typescale roles only: page titles and section headings. No oversized headings; hierarchy from role + weight, not size bloat.
• There is NO monospace role. Numbers/eyebrows that were formerly mono use Inter with tnum tabular figures.
MD3 typescale tokens (--md-sys-typescale-{display,headline,title,body,label}-{large,medium,small}-{font,size,line-height,weight}) inherit these typefaces automatically; we set the -font tokens to brand for display/headline and plain for everything else.

WEB FONTS LOADED (Google Fonts) — ONLY: Inter 400;500;600;700 · Newsreader opsz,wght@6..72,400;500;600 · Material Symbols Outlined opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200. (preconnect fonts.googleapis.com + fonts.gstatic.com.) Fallback stacks render before fonts load (and in a sandbox where Google Fonts are blocked: Helvetica/Arial · Georgia).

ICONS: MD3 icon set = Material Symbols, rendered via <md-icon> (the icon ligature name as its text content, e.g. <md-icon>search</md-icon>) — NEVER hand-rolled span glyphs, NEVER @mui/icons-material. Axis settings: FILL 0, wght 300–400, GRAD 0, opsz 20; size 1em, never larger than its label.

ICON VOCABULARY (semantic name → Material Symbols ligature, verbatim — preserve the meaning): search→search · plus→add · filter→filter_list · sort→swap_vert · download→download · close→close · target→map · grid→settings · work→work · table→table_rows · category→category · cases→cases · language→language · beenhere→beenhere · apartment→apartment · check→check · content_copy→content_copy · user→person · users→groups · help→help · map→map · sliders→thumb_up · plan→description · lock→lock · message→chat · expand→open_in_full · logout→logout · edit→edit · chevron→expand_more · chevronUp→expand_less · layers→layers · community→favorite · drag→drag_indicator · chevron-left→chevron_left · chevron-right→chevron_right · double-left→keyboard_double_arrow_left · double-right→keyboard_double_arrow_right · sparkle→auto_awesome · brandmark→id_card · build→build · clock→history · mail→mail · phone→call` },
      { t: "This build guide is the only thing rendered on the .io", done: true },
      { t: "APP_SPEC.md — exhaustive functional spec committed", done: true },
      { t: "CLAUDE.md — engineering discipline + Material-only rule", done: true },
    ]
  },
  {
    id: "cap", Icon: ChecklistIcon, label: "Capture · App knowledge (lossless SSOT)",
    blurb: "The lossless single source of truth — the entire existing app captured by DOMAIN as actual content, never labels. Each box expands to its full longform detail; we rebuild the app FROM these boxes once verified complete.",
    items: [
      { t: "Ecosystem — how it all connects (expand to read the full capture)", d:
`ENTITIES (11 synced tables): stakeholders · scores · team · workspaces · stakeholderWorkspaces (join) · users · conversations · messages · community · plans · appConfig. Each persists via usePersistentState(table, seed) → Store (localStorage + BroadcastChannel now; Supabase upsert + postgres_changes later). Per-device, NOT synced: currentUser (this tab's session) and the column-order preference.

MASTER ↔ WORKSPACES ↔ STAKEHOLDERS
• A stakeholder exists ONCE in the pool. stakeholderWorkspaces[stakeholderId] = [workspaceId,…] is the many-to-many join.
• MASTER (id __master, immovable first tab) = the union of ALL stakeholders — the org-wide overview.
• A workspace = segment + business unit + owners; it shows ONLY stakeholders whose join includes its id.
• Create from a workspace → auto-assigned there; create from Master → unassigned. A "Reminders" system message posts "New stakeholder added… please score them."
• Scoping per view: Lists/Scoring/Map filter to the active workspace (all on Master); Plans are one-per-workspace; Community + Map can aggregate. Scoring is DISABLED on Master (a workspace collaboration act) → redirects to Map.

THE CORE LOOP (the moat — single-sourced, reused everywhere)
1) SCORE — each teammate places a stakeholder on a 2-axis grid: x = alignment/support (−10..10), y = influence/importance (−10..10). You edit only YOUR column; others are read-only. team[].weight weights each rater.
2) POSITION — weightedCoord(id, scores, team) = Σ(score·weight)/Σweight per axis → the blended {x,y}. statusFor(x,y) maps it to one of 14 relationship ZONES (each with a color + strategy + action). Drives the table's _x/_y/_status, the map dot, and the profile.
3) PRIORITIZE — in a Plan, sepScore(stakeholder, sector, goal, ctx) turns position + issue-overlap + community-ties into a 0–100 priority (High/Med/Low), weighted by the plan's sector + goal models. Advisory; a manager overrides per-plan (priorityOverrides); ✦ marks suggestions.
4) PLAN — a per-workspace engagement doc: scenario · org-goal alignment · the SEP-ranked stakeholder table · tactics (lead/timing) · measurement; links community investments.
5) FUND — Community applications (philanthropy / corporate giving / PAC / sustainability / social impact) tie to stakeholders (represented + linked), carry a value score = (license-to-operate + relationship-impact)/2, team votes (for/against/abstain), budgets; FY-aware rollups (requested / approved / annual / 3-yr) compute committed spend.
6) MEASURE — quarterly score snapshots (stakeholder.history) show map movement over time; plans measure against fiscal cadence; community rollups track committed value.

CROSS-LINKS (ids resolved by shared helpers, never forked): affiliatedCommunity (via representedStakeholderId + linkedStakeholders) · stakeholderCumulativeUSD · communityEntryAmount · getWorkspacesForStakeholder · plan.communityIds. Message mentions (@ stakeholder, # plan, …) link back to records.

ROLES: manager (edit anything; delete any workspace; edit config + roles; override SEP) · member (own records; delete only workspaces they created) · system (bots e.g. Reminders; never in pickers/online lists). UI gates on role today; RLS enforces server-side later.

PERSISTENCE / REALTIME: every mutation → Store.save → localStorage + a BroadcastChannel("hpsm-sync") {table,value} that other tabs apply live (storage-event fallback). SCHEMA_VERSION wipes the namespace on breaking changes. The Supabase swap lives ONLY in store.js: save→upsert(row), broadcast→postgres_changes; the UI never changes.` },
      { t: "Relationship engine — axes · zone grid · recommendations (expand: verbatim from source)", d:
`AXES & LOOKUP — statusFor(x,y), inputs clamped to ±10.
y → row:  y>5→0 · 2.5<y≤5→1 · 0<y≤2.5→2 · -2.5<y≤0→3 · -5<y≤-2.5→4 · y≤-5→5
x → col:  x<-5→0 · -5≤x<0→1 · 0≤x<5→2 · x≥5→3   → returns GRID[row][col]
X_BOUNDS=[-10,-5,0,5,10] · Y_BOUNDS=[10,5,2.5,0,-2.5,-5,-10]
Position: weightedCoord(id,scores,team) = Σ(score·weight)/Σweight per axis over raters who scored (weight≤0 skipped); {0,0} if none.

THE 14 ZONES — cells (x / y) · tone · color / text / border · STRATEGY → action (verbatim):
1 Proactively Defend — x<-5, y>5 · negative · #D26A6A / #FFF / #7a2424 · Address Key Influencer → Launch plan to neutralize a major threat to the industry or company's license to operate; leverage reputation, resources, SMEs, and allied stakeholders to win. Measure and report often.
2 Defend — {-5..0, y>5} + {x<-5, 2.5<y≤5} · negative · #E29A9A / #7a2424 · Neutralize Threat → Defend license to operate; defend reputation against regular attacks from high-influence stakeholders unlikely to move to support; discredit message/position. Measure & report often.
3 Protect — {-5..0, 2.5<y≤5} + {x<-5, -2.5<y≤2.5} · negative · #EFBEBE / #7a2424 · Mobilize Defense → Act with internal resources and strategy; defend reputation against regular attacks; manage expectations for changing dynamics/influence. Measure & report regularly.
4 Respond — {-5≤x<0, -2.5<y≤2.5} · negative · #F4D6D6 / #7a2424 · Challenge Stakeholder → Challenge misinformation; reduce the stakeholder's ability to destabilize the business or challenge brand identity and reputation.
5 Identify — {x<0, -5<y≤-2.5} · negative · #F8E4E4 / #7a2424 · React To Issues Or Conflict → Neutralize threat; educate; resolve/minimize ability or willingness to maintain conflict. Assign staff/team/working group to execute response.
6 Monitor — {x<0, y≤-5} · neutral-low · #F4DBB0 / #7a4a14 · Plan Ahead, Listen → Map stakeholder and plan to respond on change; assign staff/team to execute if needed.
7 Maintain — {0≤x<5, y≤-5} · neutral-low · #F9E4BD / #7a4a14 · Take Steps To Introduce Our Vision And Values → Simple steps to engage; educate/create awareness; look to grow alignment and influence over time.
8 Connect — {x≥5, y≤-5} · neutral-low · #FCEFD1 / #7a4a14 · Prioritize Resources Elsewhere → No action; prioritize elsewhere but monitor for negative alignment shifts or improved influence over time.
9 Commit — {x≥0, -5<y≤-2.5} · neutral-low · #FAEACA / #7a4a14 · Understand Needs, Work Towards Common Purpose → Build understanding; pursue continued education/alignment that could lead to collaboration or affinity.
10 Cooperate — {0≤x<5, -2.5<y≤2.5} · positive · #DDE7C2 / #2f5a26 · Existing Alignment Produces Some Favorable Outcomes → Value already exists; continue at moderate commitment; maintain the relationship.
11 Collaborate — {0..5, 2.5<y≤5} + {x≥5, -2.5<y≤2.5} · positive · #C2D9A4 / #2f5a26 · Investing In Relationship Will Improve Our Business Or Reputation → Establish opportunities to work together for mutual benefit; leverage influence to increase reputation.
12 Valuable Relationship — {0≤x<5, y>5} · positive · #B1CF92 / #2f5a26 · Stakeholder Important To Our Business Success → Important surrogate/ally/partner; grow proactively to support and defend the business and increase reputation; prioritize engagement strategies.
13 High Value Relationship — {x≥5, 2.5<y≤5} · positive · #97C57A / #2f5a26 · Shared Value Introduced → Moderate shared value; grow to produce value and reputation; engage often to meet business and advocacy goals.
14 Strategic Partner — {x≥5, y>5} · positive · #74B556 / #FFF / #1f3f17 · Shared Value Created → Formalize a working relationship/partnership to produce and measure shared value; grows the business, increases reputation, produces solutions.

STATUS_ORDER (spectrum, most-negative→positive): Proactively Defend · Defend · Protect · Respond · Identify · Monitor · Maintain · Connect · Commit · Cooperate · Collaborate · Valuable Relationship · High Value Relationship · Strategic Partner.` },
      { t: "Scoring & weighting — the team matrix, edit-only-your-column, weighted position", done: true, d:
`WHAT IT IS — the Scoring page is a MATRIX where the team collectively rates each stakeholder, and those ratings blend into the single position that drives the Map, the Lists table, and every profile. Rows = stakeholders. Columns = team members, followed by two computed columns: "Weighted (x, y)" and "Relationship".

DATA MODEL — the team and the scores are GLOBAL, NOT per-workspace. There is ONE team (the "team" table) and ONE score-set per stakeholder (scores[stakeholderId][teamMemberId]) shared across the entire app. The ONLY thing the active workspace changes is WHICH STAKEHOLDERS (rows) appear: on a workspace the rows are filtered to stakeholders whose stakeholderWorkspaces join includes that workspace; on Master the rows would be the full union (but Scoring is disabled on Master — see Scoping). The columns (team members) and each cell's stored score are the SAME no matter which workspace you view from. A stakeholder in three workspaces has one shared position, scored once by the one team.

THE CELL — each cell is one teammate's rating of one stakeholder: a pair (x, y), each an INTEGER from -10 to 10. x = alignment/support (negative = opposed, positive = supportive); y = influence/importance (negative = low, positive = high). These are the two axes the Relationship engine reads.

EDIT-ONLY-YOUR-COLUMN — a teammate may edit ONLY their own column (the column whose teammate is the logged-in user). Every other column is READ-ONLY. This is deliberate: a position is a blend of independent judgments, so you never overwrite a colleague's read on a stakeholder. Your column is visually distinguished as "mine".
• Your editable cell: two numeric inputs labelled x and y — md-outlined-text-field type="number" (min -10/max 10/step 1), each with +/- stepper md-icon-buttons (expand_less/expand_more) that increment/decrement by 1 and CLAMP to [-10,10]. Clamp rule: a non-numeric entry becomes 0; anything out of range snaps to the nearest bound.
• A read-only (teammate) cell: shows their x and y values as static text (Typography), with a Tooltip "{teammate name}'s score".
• UNSCORED ≠ (0,0): a cell a teammate has never scored renders EMPTY (an em-dash "—" placeholder), NOT a fake 0/0, and is EXCLUDED from the weighted average. A real 0,0 is stored only when that teammate deliberately enters it. (Correction from the old build, which showed unscored cells as 0/0 and made "no opinion" indistinguishable from "dead-centre".)

SCORE RECORD (persisted shape) — scores[stakeholderId][teamMemberId] = { x, y, createdAt, updatedAt }. createdAt is stamped on the FIRST score for that cell; updatedAt is restamped on EVERY change. Stored in the synced "scores" table. Removing a teammate deletes that teammate's entry from every stakeholder's row (their column of scores is purged).

THE TEAM BAR (top of page) — one Card per teammate, in this order: (1) the logged-in user first, (2) then workspace owners in their listed order, (3) then everyone else in original order. Each card shows: Avatar + name + title; a WEIGHT control; a derived "% of team" readout.
• WEIGHT — md-slider, min 0.0, max 2.0, step 0.1, baseline 1.0 (a tick mark at 1.0). Value displayed as "1.0x" (Inter, tnum figures). Weight 0.0 is a DELIBERATE, legal choice: it keeps the teammate on the workspace but takes their scores OUT of the blend (a "don't weight this person right now" without removing them). Removing a teammate is a separate action (see below).
• % OF TEAM — that teammate's weight / sum of all weights, shown as a percentage (md-assist-chip or plain MD3-typescale text). Recomputes live as any weight changes.
• REMOVE (x) — md-icon-button with the close icon. PERMISSIONS: a MANAGER may remove ANY teammate; a teammate may remove THEMSELVES (leave the workspace). A plain member cannot remove other members. The control is shown only when the current user is a manager or it is their own card.
• SOLE-MEMBER LEAVE — if the only remaining teammate tries to remove themselves (leave), the action is intercepted by the ONE shared confirm/cancel dialog used app-wide (see "Shared confirm/cancel"), warning that leaving CLOSES the workspace; confirm = close the workspace, cancel = abort. No path silently leaves a workspace teamless.

ADD A TEAMMATE — an md-dialog containing a searchable picker (md-outlined-text-field as a typeahead filtering an md-list of users, or an md-menu of candidates) listing users NOT already on the team and excluding the system bot ("Reminders"); a chosen user is added at weight 1.0 (baseline). Duplicate adds are guarded (a user already on the team is skipped). Also reachable from the context-aware create (+) when the active page is Scoring.

LAST-TEAMMATE / WORKSPACE-CLOSURE — a workspace cannot have zero teammates. A manager removing the final teammate, or the sole teammate leaving, routes through the shared confirm/cancel dialog (closure warning). Optionally the dialog offers HAND OFF to a replacement (an md-outlined-select of eligible users) which adds the replacement then removes the last member; otherwise confirming closes (deletes) the workspace. The destructive confirm uses md-filled-button with error-color tokens.

THE MATH — weightedCoord(stakeholderId, scores, team): for each teammate who HAS scored this stakeholder and whose weight > 0, accumulate sx += x*weight, sy += y*weight, totalW += weight; result = { x: sx/totalW, y: sy/totalW }. Two independent reasons a teammate drops out of the blend for a given stakeholder: (a) they have NOT scored that stakeholder (no record) — always excluded, regardless of weight; (b) their weight is 0.0 (weight <= 0 is skipped) — a deliberate exclusion that still leaves them on the team. If the surviving total weight is 0 (nobody scored, or everyone who scored is at weight 0), the position is { x: 0, y: 0 }. The "Weighted (x, y)" column renders each axis to ONE decimal, colored positive/negative; "Relationship" runs statusFor(x,y) and shows the resulting zone as a StatusPill (rebuilt as an md-assist-chip, or a tokened MD3 label, colored by the zone's color/text from STATUSES).

SCOPING — Scoring is a PER-WORKSPACE collaboration act and is DISABLED on Master: if the active workspace is Master, the Scoring nav item is hidden, and navigating to Scoring on Master redirects to the Map. (Master is the read-only org-wide union; you score within a workspace, not across the whole org.)

MD3 BUILD MAP (Material Web — verified component set; MD3 has NO data grid, so the matrix is a tokened composition) — matrix: a semantic table/CSS-grid structure styled only with MD3 surface/outline tokens (sticky-left "Stakeholder" column via position:sticky, the rest horizontally scrollable), NOT a third-party grid. Each editable x/y cell: two small md-outlined-text-field type="number" (min -10/max 10/step 1) each paired with two md-icon-button steppers (expand_less/expand_more, ±1 clamped); read-only teammate cells: MD3-typescale text. Weight: md-slider (0.0–2.0 step 0.1, tick at 1.0). % of team: md-assist-chip. Teammate card: a tokened surface-container card (md-elevation + layout) holding the avatar (image or initials), name/title text, the md-slider, and the remove md-icon-button. Add-teammate: md-dialog + md-outlined-text-field typeahead over an md-list. Sole-member-leave / closure: the shared confirm/cancel md-dialog. Relationship cell: md-assist-chip (zone-tokened). Stakeholder name cell: an md-text-button (or tokened clickable) opening that stakeholder's profile.` },
      { t: "Scoring cadence & re-score reminders — fiscal quarters, unscored detection, the Reminders bot", done: true, d:
`WHY THIS EXISTS — the stakeholder pool can be enormous (potentially hundreds of thousands). A workspace deliberately FOCUSES the team on the limited set of stakeholders with enough influence to impact the brand, operations, or goals at hand. Re-scoring on a fixed cadence keeps each focused set's positions current without asking anyone to score the whole universe.

WHO SCORES, WHERE — scoring happens INSIDE a workspace (never on Master). A workspace's team scores only that workspace's visible stakeholders; the resulting position is written to the stakeholder GLOBALLY (one score-set per stakeholder) and then travels with that stakeholder everywhere — other workspaces, plans, community engagements, any modal about them, and the full stakeholder page. (See the Scoring box for the data model.)

FISCAL CALENDAR (set in Settings; full Settings capture comes with that page) — appConfig.fiscalStartMonth (1-12, default 11 = November) + appConfig.fiscalStartDay (default 1). Quarters are computed as FOUR EQUAL THREE-MONTH SPANS from that anchor: quarter i (0..3) starts at anchor + i*3 months on the same day-of-month (clamped), and ends the day BEFORE the next quarter's start. Labels are Q1..Q4, combined with the fiscal year for snapshot tags like "FY26 Q1"; Settings shows a live preview of the four ranges (e.g. "Nov 1 -> Jan 31"). Only managers can change the fiscal anchor.

UNSCORED DETECTION (live, client-side now) — isUnscoredBy(stakeholderId, teamMemberId) is true when there is NO score record from that team-member id for that stakeholder (a deliberate 0,0 counts as scored; a never-touched cell does not — consistent with "unscored != (0,0)"). unscoredCount = how many stakeholders the CURRENT user (via their matching team member) has not yet scored. This drives: (a) a count-alert Badge on the Scoring nav item; (b) the Reminders conversation subtitle "{n} stakeholder(s) need scoring" or "All caught up"; (c) the inbox unread count.

THE REMINDERS BOT — a system user u-system named "Reminders" (role "system"; never appears in pickers or online/presence lists), owning a system conversation that includes every non-system user. Trigger captured so far: when a new stakeholder is added, a system message posts with kind "scoring-needed": "New stakeholder added: {name} ({type}). Please score them on the Scoring tab."

QUARTERLY RE-SCORE CYCLE — at each quarter close (per the fiscal anchor above), the cycle is: (1) snapshot each stakeholder's current weighted position into stakeholder.history as { quarter: "FY## Q#", x, y, recordedAt: ISO-date } — these snapshots are exactly what the Map's history trail draws; (2) notify the relevant workspace's team members (via the Reminders bot) to re-score that workspace's stakeholders for the new quarter. LIVE vs DEFERRED, stated honestly: the unscored detection, the Reminders bot, the new-stakeholder prompt, and the fiscal-quarter math all exist/are configurable now; the AUTOMATED quarter-rollover that performs the snapshot + bulk re-score prompt is the fiscal-rollover job captured with the backend — but it is driven entirely by the Settings fiscal anchor, not invented.

MD3 BUILD MAP — fiscal controls (on the Settings page): md-outlined-select for month + md-outlined-select (or md-outlined-text-field type="number") for day, with a quarters PREVIEW as a tokened md-list; gated to managers. Reminder surfaces: a small count indicator on the Scoring nav item (tokened badge composition), and the Reminders thread inside Messaging (system conversation) using md-list/md-list-item. (Full Settings and Messaging components are captured in their own boxes.)` },
      { t: "Map — coordinate→pixel translation, dots, zones, read-only positions, history trail, scorecard", done: true, d:
`WHAT IT IS — the Map is the visual face of the Relationship engine: a 4-column x 6-row zone grid with one DOT per (visible) stakeholder, positioned by that stakeholder's weighted (x, y). It is READ-ONLY: it displays positions; it does NOT edit them. All scoring/rescoring happens on the Scoring page (per the quarterly cadence); the Map simply reflects the resulting weighted positions. (The old build allowed dragging a dot to rewrite everyone's scores — that drag-to-rescore behavior is REMOVED.) Rows = the same workspace-filtered visibleStakeholders as everywhere else; team + scores are global (see Scoring). Unlike Scoring, the Map IS available on Master (it is the org-wide overview Master redirects Scoring to).

THE COORDINATE -> PIXEL TRANSLATION (this is the heart of "positioned correctly"):
coordToPct(x, y): left% = ((x + 10) / 20) * 100 ; top% = ((10 - y) / 20) * 100. So the dot is absolutely positioned inside the dots-layer at that left/top percentage. Consequences of the formula: x = -10 -> left 0% (far left), x = +10 -> left 100% (far right); y = +10 -> top 0% (TOP), y = -10 -> top 100% (BOTTOM). i.e. POSITIVE Y RENDERS UPWARD, positive X rightward. The (0,0) origin sits at dead-centre (50%, 50%).
The dots-layer spans exactly the grid area, so 0%..100% maps linearly to the -10..10 axis on both axes; the grid, the dots, and the axis ticks therefore share one coordinate space.

THE ZONE GRID — render D.GRID (6 rows x 4 cols) as cells; each cell's background = STATUSES[status].color, text = STATUSES[status].text. The 24 cells tile the plane in the boundary order from the Relationship engine (cols by X_BOUNDS, rows by Y_BOUNDS). Optional per-cell: a zone LABEL (the status name) and a COUNT BADGE (how many dots currently fall in that cell). Cell binning for the count matches statusFor exactly: col = x<-5?0 : x<0?1 : x<5?2 : 3 ; row = y>5?0 : y>2.5?1 : y>0?2 : y>-2.5?3 : y>-5?4 : 5.

AXIS TICKS & LEGEND — y-axis ticks rendered OUTSIDE the grid on the left: [10, 7.5, 5, 2.5, 0, -2.5, -5, -7.5, -10] top-to-bottom. x-axis ticks BELOW the grid: every integer -10..10 (21 ticks) left-to-right. Under-stage legend strip: left "<- Works against you", centre "^ Greater community influence  ·  v Less community influence", right "Works with you ->". So the human-readable meaning: X = works-against <-> works-with-you (alignment/support); Y = community influence/importance (down = less, up = more).

THE DOT — absolutely positioned via coordToPct(_x, _y). A circular inner marker: background = zone color, text color = zone text, border = zone.border or zone.text; when selected the border becomes the accent color. Shows the stakeholder's 2-letter INITIALS when the dot is large enough (abbrev(name): strip honorific prefixes Mayor/Rep./Sen./Dr./Mr./Ms./Mrs., then first+last initial, or first two letters of a single name). A text LABEL (the name) shows when labels are on OR the dot is selected. Hover tooltip: "{name} · {zone} · ({x.toFixed(1)}, {y.toFixed(1)})". Interactions (read-only — no dragging): single click = select (opens the scorecard, exits history mode); double-click = open the full stakeholder profile.

HISTORY / MOVEMENT OVER TIME — a stakeholder carries history: an array of past snapshots, each { quarter, x, y, recordedAt } (e.g. { quarter: "FY26 Q1", x: 1, y: 6, recordedAt: "2026-01-31" }), produced by the quarterly re-score cycle (see the Cadence box). The scorecard shows a "Show history" toggle only when history is non-empty. In HISTORY MODE: all other dots hide; the selected stakeholder shows its current dot plus one dashed "history dot" per snapshot, placed via coordToPct(h.x, h.y) and labelled with h.quarter; a dashed TRAIL connects the snapshots in order ending at the current position (drawn in a 0..100 viewBox where cx = ((x+10)/20)*100, cy = ((10-y)/20)*100 — the same transform). Selecting any dot exits history mode. (How snapshots are CREATED — a quarterly job copying the live weighted position into history — is a backend concern captured later; on the client, history is read from the stakeholder record.)

THE SCORECARD (right rail) — a collapsible detail panel. EMPTY STATE: a prompt ("Click any dot... or drag a dot to move it") and a "Recently scored" shortlist of the first six stakeholders (each selectable). SELECTED STATE: display name + org; optional website link; the history toggle (if any history); a large StatusPill plus the live "({x.toFixed(1)}, {y.toFixed(1)})"; a STRATEGY card colored by the zone showing zone.strategy (bold) and zone.action; then metadata rows — Category, Type, Market, Region, Geography, Issues (as tag chips), Priority (PriorityPill), Owner (owner avatars), Last contact, Status (status dot), Tags; and the LATEST NOTE (newest of notesHistory by timestamp, falling back to the plain notes field) with its date. The panel can be closed to a thin reopen affordance.

DISPLAY OPTIONS (from the old Tweaks panel; in the rebuild these become MD3 Settings/Design controls, not ad-hoc): mapStyle = classic | halo | density (density shades each cell by count via a color-mix toward a neutral; halo adds a soft ring around each dot); showLabels (always show dot names); showZoneLabels (show zone names in cells); dotSize (px; initials appear at >= 22). These are presentational only and never change positions or scores.

MD3 BUILD MAP (Material Web — MD3 ships NO chart component, so the plot is hand-built with inline SVG + HTML, styled SOLELY with MD3 tokens; the resize-proof proportional approach from the old build is reproduced on purpose, not borrowed from any chart lib).
• Stage: a tokened surface container (md-elevation on a surface-container token) holding the plot area; the plot area is a proportional box (max-width capped, centered, min-0 flex parents) so it scales cleanly on resize — exactly the invariants that made the old map never break.
• Coordinate space: implement coordToPct directly — left% = ((x+10)/20)*100, top% = ((10-y)/20)*100 (positive y renders UP, origin centre). The zone grid, dots, ticks, and trail all share this one transform.
• Zone grid (behind the points): either a CSS grid encoding the non-uniform bands as fr ratios (columns 1fr 1fr 1fr 1fr; rows 2fr 1fr 1fr 1fr 1fr 2fr = the 5/2.5/2.5/2.5/2.5/5 heights) OR 24 inline-SVG <rect>s placed from the X_BOUNDS/Y_BOUNDS pairs; each cell filled with STATUSES[status].color via a CSS custom property (no inline literals, no !important). Zone label = MD3 label-typescale text; cell count = a tokened badge at the cell centre.
• Dots: absolutely-positioned elements (or SVG <g>) at coordToPct(_x,_y), translate(-50%,-50%) to centre on the point; each a circle filled with the zone color, outlined with zone.border||zone.text (md-sys-color-primary/accent when selected), showing 2-letter initials (abbrev) above a size threshold; name label when labels on or selected. Hover/focus via md-ripple/md-focus-ring on a focusable wrapper. Single click → select + open scorecard + exit history; double-click → open full profile. READ-ONLY (no dragging).
• Tooltip: a tokened MD3 surface popup (composition; MD3 has no tooltip component) rendering "{name} · {zone} · ({x.toFixed(1)}, {y.toFixed(1)})".
• Axis ticks: y ticks [10,7.5,5,2.5,0,-2.5,-5,-7.5,-10] outside the plot left; x ticks every integer -10..10 below — MD3 label-typescale text positioned by the same transform.
• History trail: inline-SVG dashed <polyline>/<path> through coordToPct of each { x, y, recordedAt } snapshot ending at the current point, plus dashed history-dot circles labelled by quarter; shown only in history mode (selected stakeholder only).
• Axis legend strip (under the stage): MD3 label text ("← Works against you", "↑ Greater community influence · ↓ Less", "Works with you →").
• Scorecard (right rail): a tokened surface-container side panel (md-list/md-list-item rows); status as md-assist-chip (zone-tokened); issues/tags as md-chip-set chips; owners as overlapping avatars; "Show history" as an md-filter-chip or md-text-button toggle; collapse/expand via md-icon-button (chevron_right/chevron_left). Empty state lists six recent stakeholders as md-text-buttons.
• Display options (mapStyle/showLabels/showZoneLabels/dotSize) come from the Settings/Design controls, read as props — never ad-hoc.
• Selection state lifts to the page so Scoring/Lists/Map share the selected stakeholder.` },
      { t: "Lists table — every column: source field · edit mechanism (inline/modal/computed) · MD3 component" },
      { t: "SEP algorithm — base signals, factor→signal map, sector/goal models, bands, manager override" },
      { t: "Plan — every section, field, validation, review mode" },
      { t: "Community — every section, field, value score, votes, FY budget rollups" },
      { t: "Workspaces & Settings — fields, sub-panes, manager gating, propagation" },
      { t: "Messaging — conversations/messages model, @ / # / $ mention links" },
      { t: "Persistence / realtime — entities + exact shapes, Store, Supabase swap" },
      { t: "Catalogs — categories/types · markets/regions · segments/BUs · issues · kinds/stages/ask-types" },
      { t: "Design refs — element→MD3 (Material Web) component map · Material Symbols map · Inter/Newsreader" },
      { t: "INDEX — manifest + traceability (feature → spec → MD3 component → verification)" },
    ]
  },
  {
    id: "p1", Icon: InventoryIcon, label: "Archive the old .io",
    blurb: "Bundle every legacy page/feature module into a parked folder excluded from the build, so nothing can interact with what we build on main. Nothing is deleted — it's parked for reference. CONFIRM before moving.",
    items: [
      { t: "Confirm the foundation (Phase 0) is complete with the user" },
      { t: "Move legacy page/feature modules into a parked /archive folder excluded from the Vite build" },
      { t: "Keep in src/: guide.jsx, data.js, store.js, db.js; keep all docs" },
      { t: "App entry renders only the guide → the .io is this guide on a clean slate" },
      { t: "Verify archived code is out of the build graph and the guide still renders; commit" },
    ]
  },
  {
    id: "p2", Icon: FoundationIcon, label: "2 · Material foundation & theme",
    blurb: "Stand up the neutral, token-driven MD3 theme everything renders through. Design is a layer, not baked in.",
    items: [
      { t: "MD3 :root design tokens (--md-sys-color-* / --md-sys-typescale-* / --md-ref-typeface-*) so the Design page can re-skin live" },
      { t: "Neutral defaults now; no Claude-specific styling yet" },
      { t: "App shell scaffold (top bar + nav + main) composed from Material Web md-* components" },
      { t: "Verify: renders, no console errors, MD3-only (zero MUI)" },
    ]
  },
  {
    id: "p4", Icon: DashboardIcon, label: "App shell",
    blurb: "The frame every page lives in — standard Material components only. Built before the Design page, because you can't re-skin a shell that doesn't exist yet.",
    items: [
      { t: "Brand bar / AppBar (icon + name + workspace selector + people + profile)" },
      { t: "Primary nav (Lists · Scoring · Map · Plans · Community · Workspaces · Help)" },
      { t: "Workspace scoping (Master vs workspace) + tabs" },
      { t: "Context-aware create (+), command palette (⌘K), footer, login gate" },
    ]
  },
  {
    id: "p3", Icon: PaletteIcon, label: "Settings → Design page",
    blurb: "The page that controls every design token live, with subtext describing the Claude endgame. This is how the look comes back without vibing — and it comes after the shell exists to re-skin.",
    items: [
      { t: "Design controls (MD3 / Material Web) for color tokens, type scale, density, radius, surfaces" },
      { t: "Writes tokens to :root CSS variables (live re-theme, no reload)" },
      { t: "Each control carries subtext describing the Claude-ward target" },
      { t: "Persists to appConfig; defaults remain neutral Material" },
    ]
  },
  {
    id: "p5", Icon: TableViewIcon, label: "5 · Pages (in order)",
    blurb: "Rebuild each page from standard MD3 (Material Web) components, strictly to its spec. Confirm each before the next.",
    items: [
      { t: "Lists / workspace table (every column + edit mode per TABLE_COLUMNS)" },
      { t: "Scoring (grid: stakeholders × team; edit only your column; weights)" },
      { t: "Map (zones, dots, drag-rescores-all, history) per MAP_GUIDE + RELATIONSHIP_ZONES" },
      { t: "Plans — landing + record (SEP ranking + override)" },
      { t: "Community — landing + record (rollups, votes, value score)" },
      { t: "Workspaces (Setup) + workspace record" },
      { t: "Settings (all sub-panes) + the Design page" },
      { t: "Help (12-step framework + zone legend)" },
      { t: "Messages (sidebar + page) + @ / # mention links" },
      { t: "Profiles — stakeholder + user" },
    ]
  },
  {
    id: "p6", Icon: ViewSidebarIcon, label: "6 · Record scaffold & workHQ",
    blurb: "The universal read/edit shell all record types pour through, and the workspace intelligence strip.",
    items: [
      { t: "RecordShell on Material (sub-page nav · content · metadata · footer; read↔edit parity)" },
      { t: "record.[type].view/.edit for stakeholder · plan · community · workspace · setting" },
      { t: "Tables inside records embed the real table component verbatim" },
      { t: "Map-in-scaffold (right-rail scorecard)" },
      { t: "workHQ — workspace intelligence strip (define scope with user, then build)" },
    ]
  },
  {
    id: "p7", Icon: RocketLaunchIcon, label: "7 · Demo features (client-side)",
    blurb: "Everything buildable now without a backend.",
    items: [
      { t: "Import offline stakeholder lists (CSV/Excel → column-map → preview → commit)" },
      { t: "Export plans to Word/PDF (client-side)" },
      { t: "Onboarding product tour (coachmarks, replay in profile menu)" },
      { t: "Settings → Integrations shell (LegiScan, Quorum, CRM, marketing, Drive)" },
      { t: "Empty states · blank-org vs demo-data seed · bulk actions · validation · soft-delete/archive" },
      { t: "Mobile companion (stakeholder quick-view · add-note · messages)" },
    ]
  },
  {
    id: "p8", Icon: DnsIcon, label: "8 · Backend (Supabase)",
    blurb: "Multi-user, real-time, secure — the transport swap inside store.js plus the required fixes.",
    items: [
      { t: "Row-level writes (per-row upsert/delete; replace whole-array last-write-wins)" },
      { t: "Supabase Auth + org access-code signup + RLS mirroring the UI gates" },
      { t: "Realtime (postgres_changes) + real presence" },
      { t: "File storage · email (invites, rescore reminders, digests)" },
      { t: "Fiscal-rollover jobs · activity log / audit trail" },
      { t: "Country list via ISO-3166 API · custom listbox replacing native selects" },
    ]
  },
  {
    id: "p9", Icon: WorkspacePremiumIcon, label: "9 · Paid add-ons",
    blurb: "The monetized layer, gated.",
    items: [
      { t: "Personas (persona modeling from polling/listening)" },
      { t: "AI Message Generator (finished plan → key messages; pre-prompt; server-side, metered)" },
      { t: "Billing + add-on gating" },
    ]
  },
];

export function Guide() {
  const allIds = useMemo(() => PHASES.flatMap(p => p.items.map((_, i) => p.id + "-" + i)), []);
  const [active, setActive] = useState(PHASES[0].id);
  const [checks, setChecks] = useState(() => {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE) || "{}"); } catch {}
    PHASES.forEach(p => p.items.forEach((it, i) => { const id = p.id + "-" + i; if (it.done && !(id in saved)) saved[id] = true; }));
    return saved;
  });
  const toggle = (id) => setChecks(prev => {
    const next = { ...prev, [id]: !prev[id] };
    try { localStorage.setItem(STORAGE, JSON.stringify(next)); } catch {}
    return next;
  });

  const phase = PHASES.find(p => p.id === active) || PHASES[0];
  const doneCount = allIds.filter(id => checks[id]).length;
  const pct = Math.round((doneCount / allIds.length) * 100);
  const phaseDone = phase.items.filter((_, i) => checks[phase.id + "-" + i]).length;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <ChecklistIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>Stakeholdr — Build Guide</Typography>
          <Chip label={`${doneCount}/${allIds.length} · ${pct}%`} color={pct === 100 ? "success" : "default"} />
        </Toolbar>
        <LinearProgress variant="determinate" value={pct} />
      </AppBar>

      <Drawer variant="permanent" sx={{ width: DRAWER, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: DRAWER, boxSizing: "border-box" } }}>
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {PHASES.map(p => {
              const total = p.items.length;
              const done = p.items.filter((_, i) => checks[p.id + "-" + i]).length;
              const PhaseIcon = p.Icon;
              return (
                <ListItemButton key={p.id} selected={p.id === active} onClick={() => setActive(p.id)}>
                  <ListItemIcon><PhaseIcon color={p.id === active ? "primary" : "action"} /></ListItemIcon>
                  <ListItemText primary={p.label} secondary={`${done}/${total} complete`} />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="overline" color="text.secondary">Phase</Typography>
        <Typography variant="h5" gutterBottom>{phase.label}</Typography>
        <Typography color="text.secondary" paragraph>{phase.blurb}</Typography>
        <Chip variant="outlined" label={`${phaseDone}/${phase.items.length} in this phase`} sx={{ mb: 2 }} />
        <Alert severity="info" sx={{ mb: 2 }}>We confirm every item together before checking it off and before moving to the next phase.</Alert>
        <Paper variant="outlined">
          <List disablePadding>
            {phase.items.map((it, i) => {
              const id = phase.id + "-" + i;
              const on = !!checks[id];
              const head = (
                <ListItemButton onClick={() => toggle(id)}>
                  <ListItemIcon><Checkbox edge="start" checked={on} tabIndex={-1} disableRipple /></ListItemIcon>
                  <ListItemText primary={it.t} />
                </ListItemButton>
              );
              return (
                <Box key={id}>
                  {i > 0 && <Divider component="li" />}
                  {it.d ? (
                    <Accordion disableGutters elevation={0} square>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>{head}</AccordionSummary>
                      <AccordionDetails><Typography variant="body2" color="text.secondary" sx={{ pl: 7, pb: 1, whiteSpace: "pre-line" }}>{it.d}</Typography></AccordionDetails>
                    </Accordion>
                  ) : head}
                </Box>
              );
            })}
          </List>
        </Paper>
      </Box>
    </Box>
  );
}
