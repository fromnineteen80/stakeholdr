import { useState, useMemo } from 'react';
import './guide.css';
// Material Design 3 — Google Material Web (@material/web). Zero MUI.
import '@material/web/checkbox/checkbox.js';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/icon/icon.js';
import '@material/web/divider/divider.js';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/assist-chip.js';
import '@material/web/progress/linear-progress.js';
// Official MD3 typescale: adopt the stylesheet so .md-typescale-* classes work.
// Fonts come from our --md-ref-typeface-plain (Inter) / -brand (Newsreader) tokens,
// not Roboto. display/headline -> brand (Newsreader); title/body/label -> plain (Inter).
import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';
if (typeof document !== 'undefined' && typescaleStyles?.styleSheet
    && !document.adoptedStyleSheets.includes(typescaleStyles.styleSheet)) {
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, typescaleStyles.styleSheet];
}

// guide.jsx — Stakeholdr BUILD GUIDE.
// 100% plug-and-play Material Design 3 (Material Web) — no hand-rolled spans, no custom
// styling yet (that arrives via the Settings → Design page in Phase 3). This is
// the single source we follow to rebuild the app, in order. Each item carries
// the inferred detail captured "as the Anthropic dev"; the user reviews on the
// .io and we seal each handshake by committing the check (done:true) into source.

const STORAGE = "stakeholdr_guide_checks_v1";

// d: optional inferred detail rendered in an expandable panel under the item.
const PHASES = [
  {
    id: "p0", icon: "inventory_2", label: "Foundation · setup only",
    blurb: "The build laws and tooling that must exist before anything is rebuilt — the component kit, the type/icon system, and the meta docs. SETUP ONLY; all app knowledge lives in the Capture section below.",
    items: [
      { t: "Material Design 3 (Material Web) is the ONLY component kit — the law for every element", done: true, d:
`Every UI element is a standard Material Design 3 component from Google's Material Web (@material/web), or a composition of them; never a hand-rolled element, and NEVER MUI or any other third-party kit.

THE KIT (verbatim): Google Material Web (@material/web), the official MD3 web-components. Design language + tokens from m3.material.io. NOT MUI / @mui/material — that was a wrong turn and is being removed everywhere. Build: React 18 + Vite, deployed to GitHub Pages. Material Web ships as custom elements (<md-*>) imported per component (e.g. import '@material/web/button/filled-button.js') and rendered directly in JSX; props are attributes, and events are standard DOM events (bound via refs/addEventListener since React 18 does not natively bind custom-element events/props for all cases).

USE THE FULL KIT (never bare-minimum) — name the specific md-* element + variant for each element: buttons md-filled-button / md-outlined-button / md-text-button / md-elevated-button / md-filled-tonal-button, md-icon-button, md-fab; selection md-outlined-select|md-filled-select + md-select-option (short fixed sets), md-menu + md-menu-item (action menus), md-checkbox, md-radio, md-switch, md-slider; chips md-chip-set + md-assist/filter/input/suggestion-chip; inputs md-outlined-text-field / md-filled-text-field; structure md-dialog, md-list + md-list-item, md-tabs + md-primary-tab/md-secondary-tab, md-divider, md-elevation, md-linear-progress / md-circular-progress; md-icon for icons; md-ripple / md-focus-ring for interaction states.

HOLES — Material Web ships no data grid and no chart. The DATA TABLE (Lists) is built with ANGULAR MATERIAL (mat-table + Angular CDK), themed to the MD3 tokens. The MAP plot (no chart component exists anywhere) is the one sanctioned MD3-tokened SVG composition. Everything else is a Material Web md-* component. Never a third-party kit, never MUI.

CHANGES TOO: when we later modify something, the change is made with OTHER MD3 / Material Web components — recompose standard MD3, never a custom hack and never MUI.

FORBIDDEN: MUI / @mui/* anywhere; non-MD3 UI libraries; raw span/div as UI primitives (allowed only as layout/SVG containers); ad-hoc/inline styling; !important; stray/duplicated/patch CSS; premature visual customization.

THEMING = single source, MD3 tokens as CSS custom properties, NOT per-component code: set --md-sys-color-*, --md-sys-typescale-*, and --md-ref-typeface-* once at :root; every md-* element inherits automatically; change a token once → it updates everywhere. Never style a component one-off. Re-skinning later (toward Claude) = changing tokens only.

PALETTE START-STATE mapped to MD3 color tokens: surfaces light→dark #FFFFFF · #FEFDFC · #FCFBF9 · #F8F7F3 · #F4F3ED · #F0EEE6 · #E8E6DE → --md-sys-color-surface and the --md-sys-color-surface-container(-low/-high/-highest) ramp + --md-sys-color-surface-dim/-bright; ink → --md-sys-color-on-surface #666361, --md-sys-color-on-surface-variant #ABA9A4, --md-sys-color-outline / outline-variant #DFDDD6. Small clean type, modest weights, no oversized headings; tight-but-airy spacing; readability/ease/pleasure are the bar.

START-STATE DESIGN RULES (design intent — enforced via design tokens + components, NEVER hand-built CSS; toolkit-agnostic):
• No shadows and no gradients, EVER — flat, solid surfaces only.
• Links / nav items: no hover background and no current/active-page background change; show state via ink weight/color, not a background swap.
• Sidebars are NEVER white — a surface one step darker than the main content.
• Main content is ALWAYS white.
• Input fields on a sidebar are lighter than the sidebar but NOT white, and use one of our palette colors.

START-STATE DESIGN RULES (all enforced via MD3 tokens / component theming — NEVER custom hand-built CSS):
• NO SHADOWS, NO GRADIENTS, EVER — elevation tokens set to none/flat; backgrounds are solid surface tokens only.
• LINKS / NAV ITEMS — no hover background and no current/active-page background change. State is shown by ink weight/color, never by a background swap.
• SIDEBARS — never white. The sidebar uses a surface-container token darker than the main content (e.g. --md-sys-color-surface-container / -high), never --md-sys-color-surface (#FFFFFF).
• MAIN CONTENT — always white (--md-sys-color-surface / #FFFFFF).
• INPUT FIELDS ON A SIDEBAR — lighter than the sidebar but NOT white, and must use one of our palette colors (a surface-container step lighter than the rail, never #FFFFFF).
• These map to surface tokens per region; the sidebar/app-bar regions that carry them come from layout components (or, where the kit has no layout component, the one sanctioned token-only layout layer — never ad-hoc styling).

DONE = (1) every element is a standard Material Web md-* component, an Angular-Material hole-filler (table/datepicker/etc.), or the one MD3-tokened SVG map plot; (2) renders, zero console errors; (3) zero MUI, no spans-as-UI, no !important, no shadows/gradients, no bespoke styling; (4) all look comes from MD3 tokens; (5) start-state design rules above are honored.` },
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
      { t: "Component sourcing — Material Web (primary) + Angular Material for the holes", d:
`THE STACK — Material Web (@material/web) is the PRIMARY MD3 kit; it gives the clean MD3 look. But Material Web is in MAINTENANCE MODE and ships no data grid, no date/time picker, no nav rail/drawer, no app bars, etc. Those HOLES are filled by ANGULAR MATERIAL + the Angular CDK (mat-table, mat-paginator, matSort, mat-datepicker, cdk-virtual-scroll, cdkDropList drag-drop, etc.). The real app is therefore built in ANGULAR, which hosts Material Web web-components (CUSTOM_ELEMENTS_SCHEMA) as the primary UI and Angular Material only for the holes. BOTH kits are themed from one MD3 token source. (This build-guide .io itself is a React + Material Web scratch surface — it has no table, so it needs no Angular; the architecture below is for the rebuilt app.)

FONTS — Inter (body/UI) via --md-ref-typeface-plain; Newsreader for TITLES ONLY (display/headline roles) via --md-ref-typeface-brand; Material Symbols via <md-icon>. No Roboto, no IBM Plex, no other family.

OFFICIAL MATERIAL WEB SETUP — components: import per-component side-effect modules (e.g. import '@material/web/button/filled-button.js') or '@material/web/all.js'. Typescale: import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js'; document.adoptedStyleSheets.push(typescaleStyles.styleSheet); use .md-typescale-<scale>-<size> classes. Theme: all color/shape via --md-sys-* tokens at :root (single source); Angular Material themed from the same palette via --mat-sys-*.

SOURCING RULE (state it in every build map):
• Material Web component EXISTS → use it: md-*-button, md-icon-button, md-fab; md-checkbox, md-radio, md-switch, md-slider; md-chip-set + chips; md-dialog; md-list + md-list-item; md-menu + md-menu-item; md-outlined/filled-select + md-select-option; md-outlined/filled-text-field; md-tabs + md-primary/secondary-tab; md-divider, md-elevation, md-icon, md-linear/circular-progress, md-ripple, md-focus-ring. (Labs, experimental: cards, navigation bar/drawer/tab, segmented button, badge.)
• Material Web HOLE → Angular Material / CDK, themed to the MD3 tokens: DATA TABLE = mat-table + matSort + mat-paginator + cdk-virtual-scroll + cdkDropList; date/time = mat-datepicker; plus nav rail/drawer, app bars, snackbar, tooltip as needed.
• No component in EITHER (only the relationship MAP scatter plot) → the one sanctioned MD3-tokened composition: semantic HTML + inline SVG, tokens only.
NEVER: MUI, hand-rolled UI primitives, ad-hoc / !important CSS, a component that doesn't exist.` },
      { t: "This build guide is the only thing rendered on the .io", done: true },
      { t: "APP_SPEC.md — exhaustive functional spec committed", done: true },
      { t: "CLAUDE.md — engineering discipline + Material-only rule", done: true },
    ]
  },
  {
    id: "cap", icon: "checklist", label: "Capture · App knowledge (lossless SSOT)",
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
3) PRIORITIZE — in a Plan, "Plan Fit" turns the relationship position + issue-overlap + community-ties + category-affinity into a FIT BAND (High/Med/Low) + a plain reason + the relationship's prescribed MOVE, weighted by the picked plan algorithm (sector + plan type). Advisory; never overrides the manual Priority; the team can override/add freely. (See "Relationship recommendation alignment".)
4) PLAN — a per-workspace engagement doc ("Stakeholder Plan"): scenario · org-goal alignment · the priority-ordered + Fit-ranked stakeholder table · strategy/tactics/phases · measurement; links community investments.
5) FUND — Community applications (philanthropy / corporate giving / PAC / sustainability / social impact) tie to stakeholders (represented + linked), carry a value score = (license-to-operate + relationship-impact)/2, team votes (for/against/abstain), budgets; FY-aware rollups (requested / approved / annual / 3-yr) compute committed spend.
6) MEASURE — quarterly score snapshots (stakeholder.history) show map movement over time; plans measure against fiscal cadence; community rollups track committed value.

CROSS-LINKS (ids resolved by shared helpers, never forked): affiliatedCommunity (via representedStakeholderId + linkedStakeholders) · stakeholderCumulativeUSD · communityEntryAmount · getWorkspacesForStakeholder · plan.communityIds. Message mentions (@ stakeholder, # plan, …) link back to records.

ROLES: manager (edit anything; delete any workspace; edit config + roles; override the plan algorithm) · member (own records; delete only workspaces they created) · system (bots e.g. Reminders; never in pickers/online lists). UI gates on role today; RLS enforces server-side later.

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
      { t: "Lists table — the master stakeholder table (columns · edit mechanism · MD3 composition)", d:
`WHAT IT IS — the Lists page is the MASTER STAKEHOLDER TABLE: the app's primary data surface (a spreadsheet), NOT an MD3 list-detail layout. The SAME table component renders Master (all stakeholders) and each workspace (rows filtered to that workspace via the stakeholderWorkspaces join), and is EMBEDDED elsewhere (record pages). Rows = the workspace-scoped visibleStakeholders; each row computes, live, _x/_y = weightedCoord, _status = statusFor(_x,_y), and _unscored = (team has members AND no team member has scored this stakeholder).

COLUMNS — two groups.
FROZEN (sticky-left, not reorderable, in order): (1) idx — 1-based row number; (2) edit — an icon button opening the full stakeholder record (person icon if isPerson, else org/group icon); (3) Stakeholder — displayName (read-only here; double-click opens the record); (4) Organization — INLINE editable text; for an org (not a person) editing it mirrors into name too, for a person name is left untouched.
REORDERABLE (drag to reorder; order persisted PER USER in localStorage key hp_map_col_order_v3 — per-device, not synced; unknown keys dropped, new keys appended): Category · Type · Market · Region · Geography · State/Prov. · Sites · Issues · Priority · x · y · Relationship · Tags · Owner · Email · Phone · X account · Last contact · Status · Notes · Website · Community investment.

EDIT MECHANISM per column —
• INLINE dropdown (select): Category, Type, Market, Region, Geography, State, Site, Status. CASCADES: changing Category resets Type to the new category's first type; changing Market resets Region to the market's first region; choosing a Site that has a state fills State. Status options: Active/Watch/Dormant.
• INLINE text: Organization. INLINE date: Last contact (a calendar picker; stores YYYY-MM-DD).
• CLICK-TO-MODAL: Notes — the cell shows a preview; clicking opens the Notes modal which appends an entry to notesHistory ({id, body, at, by}) and updates the notes field.
• DISPLAY-ONLY in the grid (edited via the full record modal): Issues (tag chips), Tags (chips), Priority (High/Med/Low pill), Owner (owner avatars), Community investment (affiliatedCommunity pills), Email (mailto link), Phone (tel link, formatted), X account (x.com link), Website ("Visit Website" link). COMPUTED read-only: x and y (to 1 decimal, tone-colored: >1 positive, <-1 negative), Relationship (the zone pill).

TOOLBAR (above the table) — Search (matches displayName/name/org/type/notes/tags); Filter popover (Type, Priority, Status, Owners, Issues, Zone — OR within a field, AND across fields; option lists auto-aggregated from the rows so only values present appear); Sort popover (sortable field list + direction, with custom orderings: name=displayName, priority High>Med>Low, status Active>Watch>Dormant, site=site label); Categories multi-select; Sites multi-select; and three IMPACT-BAND chips — Positive impact / Winnable middle / Negative impact — each showing a live count AND acting as a band filter (bands group the 14 zones: positive = Cooperate..Strategic Partner; middle = Monitor/Maintain/Connect/Commit; negative = Proactively Defend..Identify).

SORT DEFAULT (no explicit sort) — unscored stakeholders FIRST, then by most-recent lastContact (descending).

PAGE FOOTER (the page-level footer that sits at the bottom of THIS page; distinct from the always-bottom APP footer, which is a shell element captured in the App-shell box) — "{filtered} of {total} stakeholders"; Avg x and Avg y over the filtered rows (1 decimal); Export CSV (a fixed column set — Stakeholder, Organization, Category, Type, Market, Region, Geography, Issues, Priority, Tags, Owners(resolved to names), Last contact, Status, x, y, Relationship, Website, Notes — with proper quote/comma/newline escaping; filename from the workspace label).

INTERACTIONS — clicking a row selects it (selection lifts to the page; shared with Map/Scoring); double-clicking the name (or the edit icon) opens the full record; the notes cell opens the Notes modal. Horizontal scroll with a left-edge shadow once scrolled; frozen columns auto-size to content and their sticky offsets are measured after layout so they stack deterministically.

MD3 BUILD MAP (the table is a Material Web HOLE → Angular Material; cell controls are Material Web where they exist).
• Table: ANGULAR MATERIAL mat-table (built on the CDK table), themed to the MD3 tokens — sticky header + sticky/frozen Stakeholder/Org columns, matSort, mat-paginator, cdk-virtual-scroll (large workspaces), cdkDropList drag-drop for column reorder, and custom cell templates so each cell hosts its own control. No third-party grid, no MUI.
• Dropdown cells (Category/Type/Market/Region/Geography/State/Site/Status): md-outlined-select + md-select-option (Material Web; intrinsic-width so columns autofit).
• Text cell (Organization): md-outlined-text-field (Material Web; no label, dense).
• Date cell (Last contact): ANGULAR MATERIAL mat-datepicker (date picker is a Material Web hole), themed to the MD3 tokens.
• Relationship (the SCORED zone — computed from the team's scores via statusFor, and it follows the stakeholder everywhere): md-assist-chip, background/text from the single-sourced --zone-* tokens. Priority (a SEPARATE, manually-set High/Medium/Low field): a distinct md-assist-chip with its own priority tokens. Two different fields — relationship is derived from scoring, priority is set by hand. Issues/Tags/Community: md-chip-set + md-assist-chip. Owners: overlapping avatars. Email/Phone/X/Website: semantic anchors.
• Edit icon + reorder grips: md-icon-button (person/groups, drag_indicator). Column reorder = pointer-DnD composition (MD3 has no DnD).
• Toolbar: search = md-outlined-text-field with a leading search md-icon; Filter/Sort/Categories/Sites = md-outlined-button (or md-icon-button) opening an md-menu of md-menu-items with md-checkboxes for multi-select (or an md-dialog for the richer multi-field filter panel); impact bands = md-filter-chip set (selected = active filter).
• Footer: MD3 label/body text + an Export CSV md-text-button (download md-icon). Computed x/y tone via on-surface vs error/positive tokens.
• Selection/edit/notes state lifts to the page; the Notes modal and the full record open via md-dialog (record modal captured with the Record scaffold box).` },
      { t: "Plan algorithm — sector/type model catalog, plan selection, workspace→plan stakeholder flow", done: true, d:
`SCOPE — this captures the PLAN ALGORITHM and how stakeholders flow into a plan. It is APP KNOWLEDGE, not the full plan-page element spec (sections/fields/validation come later, when we build the plan + stakeholder pages). The algorithm is NOT the plan: the algorithm tells you WHICH plan it is, and that classification dictates some CUSTOM parts of the plan page built later.

THE ALGORITHM CATALOG (AUTHORITATIVE — from the "Stakeholder Engagement Modeling" doc; these supersede the simplified versions that were in data.js). Each model is a plan-algorithm formula: a weighted blend of 4 FACTORS summing to 1.0, scored 0–1 per factor. The models are "building blocks for customizable persona modeling," meant to be enriched by other data sets, surveys, ongoing stakeholder feedback, and polling (ties to the Personas / polling add-ons).

IMPORTANT — FACTOR KEYS ARE MODEL-SCOPED, not a single global catalog. The same abbreviation can mean different things in different models: CE = "Consumer Expectations" (Retail) vs "Community Engagement" (Government/Nonprofit/Education) vs "Customer Engagement" (Auto); SI = "Sustainability Initiatives" (Retail) vs "Service Improvement" (Government); IC = "Inclusive Communication" (DEI) vs "Innovation Collaboration" (Energy); CI = "Collaborative Innovation" (Shared Value) vs "Community Involvement" (DEI); FS = "Financial Sustainability" (Union) vs "Funding Sustainability" (Nonprofit). Always read a factor's label within its own model.

GENERALIZED / DEFAULT model — general = (I × .25) + (U × .25) + (EP × .25) + (IR × .25). I=Influence (capacity to affect the org's decisions/operations/strategy), U=Urgency (immediacy of the concern/need to engage), EP=Engagement Potential (likelihood engaging yields a positive outcome), IR=Impact on Reputation (potential to move reputation up or down). This is the basic option, balanced across the four, adaptable to any context.

PLAN-TYPE / SCENARIO models — 7:
• General Engagement (basic default) — general = I .25 · U .25 · EP .25 · IR .25. Foundational balanced engagement.
• Generating Shared Value — mv = MV .4 · TB .3 · CI .2 · I .1. Deepen mutual, value-creating partnerships (Mutual Value, Trust-Building, Collaborative Innovation, Influence).
• Corporate Crisis — cr = I .3 · U_adjusted .35 · EP_adjusted .15 · RI .2. Crisis management, reputation repair, continuity; Urgency & Engagement-Potential are CRISIS-ADJUSTED variants, RI = Reputation Impact (perception during a crisis).
• Activist Shareholders — as = EC .35 · SE .3 · SA .2 · RM .15. Effective Communication, Shareholder Engagement, Strategic Alignment, Reputation Management.
• Diversity, Equity & Inclusion — dei = DI .35 · IC .3 · EO .2 · CI .15. Diversity Initiatives, Inclusive Communication, Equity in Opportunity, Community Involvement.
• Community Investment — ci = CNA .35 · PD .3 · IM .2 · CTS .15. Community Needs Assessment, Partnership Development, Impact Measurement, Community Trust & Support.
• Union Negotiations — un = NP .35 · ER .3 · FS .2 · OR .15. Negotiation Preparedness, Employee Relations, Financial Sustainability, Organizational Reputation.

INDUSTRY-SECTOR models — 11 (each tailored to that sector's pressures):
• Energy — st = I .25 · LTSA .3 · ES .25 · IC .2. Sustainability transformation: Influence, Long-Term Strategic Alignment, Environmental Stewardship, Innovation Collaboration.
• Technology — te = I .2 · IS .3 · MR .25 · RC .25. Innovation trajectories & market acceptance: Influence, Innovation Support, Market Readiness, Regulatory Compliance.
• Retail — rs = CE .35 · SI .3 · DC .25 · I .1. Shifting consumer expectations, sustainability, digital commerce: Consumer Expectations, Sustainability Initiatives, Digital Commerce Adaptation, Influence.
• Financial — fs = RC .35 · CT .3 · TI .25 · I .1. Regulation, transparency/security, tech: Regulatory Compliance, Customer Trust, Technological Innovation, Influence.
• Education — ed = DT .3 · CE .3 · IE .2 · I .2. Digital learning, community ties, inclusion: Digital Transformation, Community Engagement, Inclusive Environment, Influence.
• Utilities — ut = RC .35 · PS .3 · TO .2 · ST .15. Pricing + new regulation under public scrutiny: Regulatory Compliance, Price Sensitivity, Transparency in Operations, Stakeholder Trust.
• Government & Public Sector — gp = SI .3 · CE .3 · RA .25 · SDI .15. Service quality + accountability: Service Improvement, Community Engagement, Regulatory Alignment, Service Delivery Innovation.
• Healthcare & Pharma — hp = MI .3 · RC .25 · PE .25 · HPR .2. Innovation + patient trust/safety: Medical Innovation, Regulatory Compliance, Patient Engagement, Healthcare Provider Relationships.
• Nonprofit & Social Impact — np = CE .3 · IM .3 · FS .25 · AE .15. Community change > financials: Community Engagement, Impact Measurement, Funding Sustainability, Advocacy Effectiveness.
• Big Agriculture — ag = SAP .3 · TA .25 · MA .25 · RC .2. Sustainable + productive farming: Sustainable Agricultural Practices, Technological Adoption, Market Access, Regulatory Compliance.
• Auto Manufacturing — am = EA .35 · TI .25 · SCS .2 · CE .2. EV transition + loyalty: Electrification Acceleration, Technological Innovation, Supply Chain Sustainability, Customer Engagement.

CORRECTION vs the old code — data.js had DIVERGENT (placeholder) sector formulas for Utilities, Government, Healthcare, Nonprofit, Agriculture, and Auto (it reused generic factors like CTS/CT/SI/I). The DOC formulas above are authoritative and replace them; the goal-family models and Energy/Technology/Retail/Financial/Education matched.

THE 12-STEP ENGAGEMENT FRAMEWORK (the doc's backbone; a plan moves through these phases) — PURPOSE: 1 Set goals for your organization · 2 Issue identification · 3 Stakeholder identification · 4 Stakeholder prioritization. PLAN: 5 Landscape analysis · 6 Cross-functional alignment · 7 Research & listening sessions · 8 Early stakeholder analysis & modeling. EXECUTE: 9 Launch campaign · 10 Ongoing stakeholder analysis · 11 Collaborate with stakeholders · 12 Realize shared value where possible. (The doc also includes a worked Energy-sector example — scenario, goals, prioritization modeling, polling, personas-by-category, an execution checklist, a community-investment plan, predictions/reactions, and a communication strategy — reference material for the plan-page build later.)

HOW STAKEHOLDERS ENTER A PLAN (the flow):
1) The workspace team decides to develop a plan and PICKS an algorithm (sector + plan type; basic default available).
2) They INTEGRATE relevant stakeholders FROM the workspace. Each stakeholder already carries a PRIORITY (manual High/Medium/Low, shown in the workspace/Lists table; set on the stakeholder page — not yet built) AND an already-scored RELATIONSHIP (the team's weighted zone from Scoring).
3) HIGH-PRIORITY stakeholders must surface in the plan BEFORE others (ordered by the existing Priority: High → Medium → Low).
4) FREE COMPOSITION — the team may also: add ANY teammate-chosen stakeholder from the workspace regardless of algorithm/recommendation; add ANY stakeholder from MASTER that isn't in the workspace; or CREATE a NEW stakeholder for the plan → it is added to BOTH the plan and the workspace. (Plan + stakeholder creation built later; Master/workspace already captured via their tables.)

THE RELATIONSHIP → ALGORITHM ALIGNMENT — DESIGNED (see the "Relationship recommendation alignment" box): each stakeholder's scored relationship + issues + community ties + category-affinity produce a "Plan Fit" BAND (High/Med/Low) + reason + the relationship's prescribed MOVE, weighted by the picked plan algorithm. It is advisory, transparent, overridable, and NEVER the source of a stakeholder's manual Priority. (The old code's per-stakeholder 0–100 attempt is superseded by that designed model.)

UI ELEMENTS NEEDED (kind only — components built later): plan setup PICKS the algorithm via two selectors (industry sector + plan type, with the basic default preselected); the plan's stakeholder list is ORDERED by existing Priority (high first) and shows each stakeholder's Priority + Relationship (already-captured pills); ADD controls for "from this workspace", "from Master", and "create new"; (later) a recommendation/alignment surface once that step is defined. No hand-built CSS — these come from the universal component system built after the full spec.` },
      { t: "Plan algorithm — FACTOR KEY (every abbreviation defined; the only build reference)", done: true, d:
`Every plan-algorithm factor used by the model catalog, with its definition. Factor keys are MODEL-SCOPED — where one abbreviation has different meanings, each is listed. Each factor is scored 0–1 for a stakeholder, then blended by the model's weights.

CORE / GENERAL & CRISIS:
• I — Influence: a stakeholder's capacity to affect the org's decisions, operations, or strategic direction — mobilizing resources, swaying public opinion, impacting regulatory/market environments.
• U — Urgency: the immediacy of the stakeholder's concern or the need to engage (time-sensitive). CRISIS variant U_adjusted: need for immediate engagement with those who can impact the crisis outcome or the org's ability to manage it swiftly (weight raised to .35; incorporates Crisis Response Readiness).
• EP — Engagement Potential: likelihood that engaging the stakeholder yields a positive outcome. CRISIS variant EP_adjusted: likelihood that engaging during a crisis yields a positive result.
• IR — Impact on Reputation: the stakeholder's potential to move the org's reputation up or down.
• RI — Reputation Impact (Crisis): potential to significantly influence public/company perception during a crisis.

SHARED VALUE:
• MV — Mutual Value: potential for engagement to create significant value for BOTH sides (co-creation, shared benefits, mutual growth).
• TB — Trust-Building: capacity of engagements to build and strengthen trust (foundation for long-term relationships).
• CI — Collaborative Innovation (Shared Value): potential for joint innovation, idea-sharing, co-development. [MODEL-SCOPED: in DEI, CI = Community Involvement — effectiveness of engaging the broader community in DEI efforts (partnerships, outreach, public DEI initiatives).]

ACTIVIST SHAREHOLDERS:
• EC — Effective Communication: ability to communicate clearly, transparently, and on time with shareholders/stakeholders.
• SE — Shareholder Engagement: strength/impact of proactive, constructive investor relationships.
• SA — Strategic Alignment: alignment of strategy with stakeholder/shareholder interests.
• RM — Reputation Management: impact of engagements/communications on managing public and media narratives.

DEI:
• DI — Diversity Initiatives: influence over or contribution to diversity initiatives.
• IC — Inclusive Communication (DEI): effectiveness of engagements in fostering inclusive communication. [MODEL-SCOPED: in Energy, IC = Innovation Collaboration — potential for collaborative innovation with stakeholders.]
• EO — Equity in Opportunity: role in ensuring equitable access and advancement (employment, opportunity).
• (CI — Community Involvement: see Shared Value note above.)

COMMUNITY INVESTMENT:
• CNA — Community Needs Assessment: ability to identify and articulate community needs.
• PD — Partnership Development: role in forming partnerships that extend reach.
• IM — Impact Measurement: contribution to measuring outcomes and accountability.
• CTS — Community Trust & Support: effectiveness of engagements in building/maintaining community trust.

UNION NEGOTIATIONS:
• NP — Negotiation Preparedness: readiness for productive negotiation.
• ER — Employee Relations: strength of relationships with workers.
• FS — Financial Sustainability (Union): influence on/contribution to financial stability and efficiency. [MODEL-SCOPED: in Nonprofit, FS = Funding Sustainability — role in ensuring the org's funding/financial sustainability.]
• OR — Organizational Reputation: effect of negotiations and their outcomes on the org's standing.

CROSS-SECTOR:
• RC — Regulatory Compliance: role in shaping, enforcing, advising on, or adhering to regulatory frameworks (used across Utilities/Healthcare/Agriculture/Financial/Technology; sector wording varies, same essence).
• TI — Technological Innovation: impact on fostering technological innovation (Financial/Auto/Healthcare-adjacent).

UTILITIES:
• PS — Price Sensitivity: impact of engagements on addressing/mitigating pricing concerns.
• TO — Transparency in Operations: effectiveness in promoting operational transparency.
• ST — Stakeholder Trust: influence on building or restoring trust.

GOVERNMENT & PUBLIC SECTOR:
• SI — Service Improvement (Government): influence/contribution toward improving public services. [MODEL-SCOPED: in Retail, SI = Sustainability Initiatives — impact on advancing sustainability.]
• CE — Community Engagement (Government/Nonprofit/Education): effectiveness in fostering active community engagement. [MODEL-SCOPED: Retail CE = Consumer Expectations — influence over shaping consumer expectations; Auto CE = Customer Engagement — maintaining customer loyalty/engagement.]
• RA — Regulatory Alignment: role ensuring public services/initiatives align with regulation.
• SDI — Service Delivery Innovation: potential for innovative approaches/technologies to enhance service delivery.

HEALTHCARE & PHARMA:
• MI — Medical Innovation: influence/contribution toward medical innovation.
• PE — Patient Engagement: effectiveness in enhancing patient engagement and satisfaction.
• HPR — Healthcare Provider Relationships: quality/strength of relationships with healthcare providers.

NONPROFIT & SOCIAL IMPACT:
• AE — Advocacy Effectiveness: ability to support or lead effective advocacy efforts. (CE, IM, FS as above — note FS = Funding Sustainability here.)

BIG AGRICULTURE:
• SAP — Sustainable Agricultural Practices: influence/contribution toward sustainable farming.
• TA — Technological Adoption: impact on fostering adoption of advanced agricultural technologies.
• MA — Market Access: role enabling/facilitating access to markets.

AUTO MANUFACTURING:
• EA — Electrification Acceleration: role in promoting/facilitating EV adoption and electrification.
• SCS — Supply Chain Sustainability: influence on making the supply chain sustainable. (TI, CE as above — CE = Customer Engagement here.)

RETAIL:
• DC — Digital Commerce Adaptation: role supporting/driving adoption of digital commerce platforms. (CE = Consumer Expectations, SI = Sustainability Initiatives, I as above.)

FINANCIAL:
• CT — Customer Trust: impact on building/restoring customer trust. (RC, TI, I as above.)

EDUCATION:
• DT — Digital Transformation: influence/role in supporting digital transformation (digital learning tools).
• IE — Inclusive Environment: impact on promoting diversity, equity, inclusion within the institution. (CE = Community Engagement, I as above.)

TECHNOLOGY:
• IS — Innovation Support: role in supporting/advancing the company's innovation.
• MR — Market Readiness: ability to influence market readiness/acceptance of new offerings. (I, RC as above.)

ENERGY:
• LTSA — Long-Term Strategic Alignment: alignment with the org's long-term (sustainability) strategy.
• ES — Environmental Stewardship: expectations/contributions toward environmental protection. (I as above, IC = Innovation Collaboration here.)

Each factor's definition above is the source-of-truth tooltip/help text for that factor in the plan UI.` },
      { t: "Relationship recommendation alignment — how a stakeholder maps to the plan algorithm (designed)", done: true, d:
`THE PROBLEM (the piece that was "not yet aligned") — inside a plan, after the manually-prioritized stakeholders, we must surface the stakeholders whose RELATIONSHIP best fits the picked plan algorithm, each with a recommended move. Designed here as equal parts engineer and public-affairs veteran. HONESTY FIRST: we have NO real per-factor data per stakeholder (no measured "Price Sensitivity" etc.), and we will NOT fake one. We design only on signals the app genuinely holds.

WHAT WE ACTUALLY HAVE PER STAKEHOLDER: the scored RELATIONSHIP position (x = support/alignment -10..10, y = influence/importance -10..10) → a ZONE (one of 14, each with a strategy + action); the manual PRIORITY (High/Med/Low); the stakeholder's ISSUES; CATEGORY/TYPE; and COMMUNITY TIES. The plan picks a SECTOR + PLAN-TYPE algorithm (4 weighted factors each).

THE DESIGN — "PLAN FIT" (advisory, transparent, overridable). Two outputs per stakeholder: a FIT BAND (why they matter to THIS plan) and a MOVE (what to do), with a plain-English reason. We never emit a fake precise score.
OBSERVABLE SIGNALS (0–1, all already in the app): INFLUENCE = normalized y; SUPPORT = normalized x, and OPPOSITION/RISK = its inverse (the zone band already summarizes posture: negative/neutral/positive); ISSUE RELEVANCE = overlap of the stakeholder's issues with the plan's issues; COMMUNITY TIE = affiliated community investments; CATEGORY AFFINITY = how central this stakeholder's CATEGORY is to this PLAN TYPE.
CATEGORY AFFINITY (a PA-veteran fact, a small per-plan-type weight table): e.g. Union Negotiations → Our People; Community Investment / DEI → Communities + Our People; Activist Shareholders → Investors; Corporate Crisis → Government + Communities + Media; Shared Value → Industry + Communities; sector plans tilt toward their natural regulators/communities/industry. (Editable table; not hardcoded magic.)
FACTOR → SIGNAL LEXICON (stated OPENLY, coarse on purpose — no hidden precision): each algorithm factor falls into one observable bucket, so the plan's 4 factor weights become weights on the signals. Influence-type (I, FS-influence) → INFLUENCE; alignment/trust/engagement (SA, TB, EC, EP, CE-engagement, MV) → SUPPORT; reputation/urgency/risk (U, IR, RI, RM, ST) → OPPOSITION/RISK; community/issue/sustainability (CNA, PD, CTS, CI-community, ES, SI, IM) → ISSUE RELEVANCE + COMMUNITY TIE; sector-specific factors map to the nearest bucket. (The bucket for each factor lives beside it in the FACTOR KEY.)
PLAN FIT = a weighted blend of the stakeholder's observable signals using the picked plan's signal weights (derived from its factors via the lexicon) plus the CATEGORY AFFINITY for the plan type → normalized → FIT BAND High / Medium / Low. The UI shows the BAND + a one-line REASON ("High influence, on-issue, community-tied" or "Opposed but high-influence — defend"), never a number.
THE MOVE = the relationship ZONE's strategy + action (already defined in the 14-zone engine), framed by the plan type — e.g. a Defend-zone stakeholder in a Crisis plan → "neutralize threat, defend license"; a Strategic-Partner-zone stakeholder in a Community Investment plan → "mobilize as surrogate / co-investor." RECOMMENDATION = FIT BAND + REASON + MOVE.

ORDERING in plan element 6: (1) manual PRIORITY first (High→Low) — never overridden by Fit; (2) then the algorithm-aligned recommendations by FIT band (High→Low). The team may still freely add anyone (workspace / Master / new) regardless of Fit.

WHY THIS IS THE HONEST SUCCESSOR TO THE OLD per-stakeholder scoring attempt — same observable inputs (it too reduced everything to ~7 signals), but: (a) the factor→signal mapping is DISCLOSED, not hidden; (b) output is a FIT BAND + plain reason, not an arbitrary 0–100; (c) it is anchored in the relationship's prescribed MOVE (the actual PA substance), not a lone number; (d) it adds CATEGORY AFFINITY, which is how a real public-affairs strategist actually triages by plan type; (e) it is advisory, overridable, and never overrides manual Priority; (f) it is never called SEP. LATER, polling/personas (premium) can sharpen these signals; until then Fit runs on relationship + issues + community + category affinity.` },
      { t: "Plan page — plan elements, fields, exists/fix/create (blends the example + the old code)", done: true, d:
`WHAT IT IS — a Plan is a structured engagement document scoped to ONE workspace, produced after the team PICKS a plan algorithm (industry sector + plan type; basic default). Surfaces: a LANDING grid of the workspace's plans, plus record.plan.view and record.plan.edit.

LAYOUT (record.plan) — a LEFT SIDEBAR lists the PLAN ELEMENTS by NAME (no numbers shown). Selecting an element opens its MAIN CONTENT, which is broken into SECTIONS holding that element's decisions, collaboration, content creation, and fields. Elements behave like SUB-PAGES; together they build a single plan you can ARCHIVE, revisit, and EXPORT as one Word file. TERMINOLOGY: the numbered items below are PLAN ELEMENTS; "sections" = the sub-divisions of an element's main content.

NAMING RULE: never say "SEP" anywhere. The nav item is "Plan"; written out it is "Stakeholder Plan"; the engine is "the plan algorithm" and its per-stakeholder output is a "relationship recommendation" / "Plan Fit." (Rename the old code's SepExplain/sepScore/SEP_* internals accordingly.)

STATE OF THE OLD CODE — ~25% correct, ~50% of elements missing. Existing editor elements: Scenario, Aligning With Organizational Goals, Stakeholders, Tactics, Measurement. The full plan needs the elements below.

PLAN DATA MODEL (existing fields, keep + extend): id · workspaceId · title · sectorModel · goalModel (the picked algorithm) · owners · status · summary · scenarioSolves/scenarioApproach/scenarioOutcome · goals (inherited snapshot) · goalNotes{goal→text} · issues · team[{userId, role}] · strategies[{id,title,how,...}] · communityIds · priorityOverrides{shId→band} · measurement. ADD: sponsors[{first,last,email}] · consultants[{first,last,org,email}] · each strategy may carry tactics[{id,title,how,assignee}] (assignee = teammate, partner-stakeholder, OR consultant) AND/OR phases[{id,title,timeframe,...}] · per-stakeholder {involvement,risk,opportunity} · predictions · keyMessages[] · feedback[{shId,body,at,by}].

THE PLAN ELEMENTS —
1) SCENARIO & CONTEXT [EXISTS] — the situation narrative: what it solves / approach / outcome (scenarioSolves/Approach/Outcome). Multiline text.
2) SUMMARY OF ISSUE & STAKEHOLDER CONCERNS [CREATE] — a condensed summary of the issue and the spread of stakeholder reactions. Multiline text. (From the example; confirm.)
3) ORGANIZATION GOALS + ALIGNMENT [EXISTS, keep] — INHERITED from the org goals managers set in Settings (ORG_GOALS). For EACH inherited goal, the team writes how THIS plan aligns with / furthers it (goalNotes[goal]). Read-only goal text + a note field per goal.
4) STRATEGY (with optional TACTICS and/or PHASES) [FIX] — the team builds one or more STRATEGIES. A strategy's approach may include TACTICS, PHASES, or BOTH (strategy+tactics, strategy+phases, or strategy+tactics+phases). TACTICS: unlimited and OPTIONAL — a tactic REQUIRES a parent strategy, but a strategy need NOT have any tactic (even if sibling strategies do); each tactic is ASSIGNED to a teammate, a partner-stakeholder, OR a consultant (the outside consultants from element 5); tactics MUST NOT overlap other plan elements (reference/point to them, never duplicate). PHASES: unlimited; each PHASE needs a TIME FRAME; phases can be refined or added over time as the plan progresses; how granular is the team's choice. (Old code has flat strategies with one teammate owner → restructure to strategy → tactics[]/phases[].) Fields: strategy {title, how}; tactic {title, how, assignee}; phase {title, timeframe}.
5) TEAM & SPONSORS [CREATE] — the workspace TEAM (auto, with roles) + EXECUTIVE SPONSORS written in (first name, last name, email) + optional OUTSIDE CONSULTANTS not in the workspace (first name, last name, organization, email). Add/remove rows; email captured for sponsors/consultants.
6) PRIORITY STAKEHOLDERS + RELATIONSHIP RECOMMENDATIONS [FIX] — first the PRIORITY stakeholders (by the stakeholder's existing manual Priority, high first), THEN stakeholders whose RELATIONSHIP RECOMMENDATION aligns with the picked plan algorithm. (See the "Relationship recommendation alignment" box for how this is computed.) Plus the free-add paths: add any workspace stakeholder, any Master stakeholder, or create-new (→ added to plan + workspace).
7) INVOLVEMENT / RISK / OPPORTUNITY [CREATE] — per priority stakeholder, three short fields: Involvement, Risk, Opportunity. BUILD CAREFULLY so it does NOT burden the user (light, optional, inline; not heavy data entry).
8) POLLING [PREMIUM — LATER] — survey questions + results. Paid add-on; stub with a locked affordance, do not build now.
9) PERSONAS BY CATEGORY [PREMIUM — LATER] — one persona per stakeholder category (demographics, awareness/concerns, perspective, engagement willingness) from polling + listening. Paid add-on; stub locked.
10) EXECUTION CHECKLIST [CREATE] — actionable steps to execute the engagement strategy. Checklist items. (From the example; confirm.)
11) COMMUNITY INVESTMENT PLAN [CREATE] — focus areas; LINKS to the Community module (communityIds). (From the example; confirm.)
12) PREDICTIONS [CREATE] — anticipated reaction per stakeholder/group ("Predictions & Stakeholder Reactions").
13) KEY MESSAGES [CREATE] — the communication piece: key messages that may come FROM polling OR be custom, added by the team. List of messages.
14) FEEDBACK [CREATE] — captures feedback FROM stakeholders; EACH feedback entry BECOMES A NEW NOTE on that stakeholder's profile (the record.stakeholder page, built later) — i.e. writes into the stakeholder's notesHistory. Per-entry: stakeholder, body, timestamp, author.
MEASUREMENT & REPORTING [EXISTS] — quarterly review of tactics/feedback/community/coalition tied to the fiscal calendar; reports sentiment shifts + map movement each quarter. Keep.

THE ALGORITHM'S ROLE — the picked sector + plan type CLASSIFY the plan and DICTATE CUSTOM PARTS of the page (e.g. which factors/recommendations show). Set in plan setup (two selectors; basic default preselected). See the "Plan algorithm" + "FACTOR KEY" boxes.

EXPORT / ARCHIVE — the completed plan exports to a SINGLE Word file and can be archived and revisited; the element/section structure becomes the document's outline.

UI KIND (components built later, NO hand-built CSS): landing = a list/table of plans with type chip + tactic count; record.plan = the universal record shell — left sidebar of element NAMES (sub-page nav) + a main content area whose sections hold text fields, per-goal note fields, a strategy builder (strategies → optional tactics with an assignee picker [teammate, partner stakeholder, or consultant] and/or phases with timeframes), sponsor/consultant row editors, a priority-ordered stakeholder table with light Involvement/Risk/Opportunity inputs, a key-messages list, a feedback composer, locked add-on panels for Polling/Personas; review = read-only rendering; plus a Word export. Exact components come from the universal kit after the full spec.

SCOPE — app-knowledge for the plan page; precise validation and the final recommendation-alignment formula are refined when we build it. Items marked "(confirm)" are example-derived and await your confirmation.` },
      { t: "Stakeholder Plan — worked-example reference (structure to preserve from the doc)", done: true, d:
`Reusable STRUCTURE pulled from the doc's worked example (Gold Coast Refinery), captured so it survives without the PDF. This is element SKELETON, not the illustrative narrative.

POLLING (premium element 8) — a stakeholder survey: a set of QUESTIONS posed to N recipients, then RESULTS as insight bullets. Starter question template (generalize per plan): awareness of the issue/mandate and its implications; primary concerns (e.g. pollution/safety/health); support for the proposed approach/alternative; expected impact (e.g. on prices/jobs); extent of support for the org's compliance/initiative; willingness to support local initiatives; views on jobs/economic impact; credibility of the org's information; interest in participating in stakeholder meetings. RESULTS = themed findings (splits, demographic skews, top concerns, anxieties by group).

PERSONAS (premium element 9) — ONE persona per stakeholder CATEGORY, each a named archetype with four fields: DEMOGRAPHICS; AWARENESS & CONCERNS; PERSPECTIVE ON THE ORGANIZATION; ENGAGEMENT WILLINGNESS. Built from the plan's algorithm + listening sessions + (premium) polling + consumer data. (Example names: "Regulatory Rachel", "Neighbor Natalie", "Employee Emily", "Supplier Sam", "Consumer Claire", "Investor Ian".)

INVOLVEMENT / RISK / OPPORTUNITY (element 7) — per priority stakeholder, three short fields. Pattern: INVOLVEMENT = what role they play / how they're engaged; RISK = what could go wrong with them; OPPORTUNITY = the upside if engaged well. Grouped under stakeholder CATEGORY in the readout. Keep entry light.

PREDICTIONS (element 12) — per stakeholder group, the anticipated reaction to the plan (e.g. "regulators appreciate proactive compliance"; "employees value support programs but job-security concerns remain"; "communities respond to investment but stay vigilant on safety"; "investors watch financials but react favorably to reputation/community investment").

COMPANY GOALS / ENGAGEMENT-PLAN / CROSS-FUNCTIONAL TEAM (elements 3/4/5) — the example shows: numbered org goals; an engagement plan of strategy pillars (early engagement · transparency · support programs · community investment · ongoing communication); and cross-functional functions (Executive Leadership · Operations & HR · PR & Marketing · Legal & Compliance · Community Relations) — useful default role chips for element 5.

EXECUTION CHECKLIST (element 10) & COMMUNITY INVESTMENT (element 11) — checklist = action items (finalize internal plan · run listening sessions · launch targeted communication · announce support/community programs · establish a feedback loop). Community investment focus-area pattern: environmental/education · economic development/workforce · health & safety.

COMMUNICATION STRATEGY (reference for a LATER marketing/comms capability beyond element 13's key messages) — PAID MEDIA: targeted digital campaigns (social), search engine marketing, native advertising, out-of-home, sponsorships. INFLUENCER OUTREACH: identify aligned influencers → personalized outreach → collaboration (visits/co-created content) → monitor engagement. INTEGRATION: consistent messaging across all channels tied to the plan's goals. (Not a built plan element now; captured so the strategy detail isn't lost.)` },
      { t: "Community — invest in the community: applications → manager approval → tracked investments (FX-aware)", d:
`WHAT IT IS — the COMMUNITY module is where the org INVESTS in the community in different ways: Philanthropy · Volunteering · Corporate Giving · Political Action (PAC) · Sustainability · Social Impact (the kinds). Teammates create APPLICATIONS proposing an investment; the team reviews and VOTES (advisory); a MANAGER APPROVES; approved applications become committed INVESTMENTS the org accomplishes and tracks. Nav = "Community." Surfaces: a LANDING grid of applications + the record (record.community.view/.edit). Linked to stakeholders (represented + linked) and to plans (plan.communityIds, plan element 11).

STAGES — Idea → Proposed → Under Review → Approved → Active → Complete → Declined. "DECIDED / COMMITTED" = Approved, Active, or Complete (drives the rollups + approved label). APPROVAL IS MANAGER-GATED: only a MANAGER can move an application to Approved (the formal Approve action, stamping approverId + approvedAt). Votes inform that decision; they do not make it.

VALUE SCORE (MANUAL) = (licenseToOperate + relationshipImpact) / 2 → 0–10. Both are hand-entered 0–10 inputs; not derived.

VOTES (ADVISORY) — each non-system teammate casts for / against / abstain (clicking your current choice toggles it off); the tally informs the manager's approval. Votes never decide.

CONTRIBUTION TYPES & MONETIZATION — askType ∈ Funding · Volunteer hours · Endorsement · In-kind · Political contribution. VOLUNTEER HOURS and IN-KIND get a MONETARY VALUE ASSIGNED case-by-case within the application (e.g. rate × hours; an in-kind valuation), so EVERY contribution rolls up as a dollar-equivalent. Funding/monetary asks carry a currency (below).

MULTI-CURRENCY + FX (real-time conversion API, embedded) — amounts may be in USD, MXN, or CAD (Mexico + Canada are already in scope via markets/regions; USD is the reporting currency). An embedded REAL-TIME DOLLAR-CONVERSION API converts non-USD amounts to USD for display and rollups. HISTORIC-RATE LOCK (critical): when an application is COMMITTED (manager-approved), the app CAPTURES AND STORES the FX rate at that moment (committedFxRate + committedFxDate — the "historic real-time value"). From then on, the tracked/cumulative total uses that LOCKED historic USD value — so committed/completed investments are NOT re-inflated or deflated by later FX swings. PENDING / requested amounts convert at the CURRENT real-time rate; COMMITTED amounts use their stored historic rate. (Sandbox/offline fallback: last-known cached rate. The FX API also belongs in the Integrations/APIs bucket.)

FY-AWARE BUDGET ROLLUPS (uses the Settings fiscal anchor) — fyStartYear(date) from the fiscal start month/day. allocInFY(app, fy): Multi-year = committed USD ÷ years, spread across its years from approval; Annual = committed USD each FY from approval onward; One-time = its start FY only. Totals, all in USD-equivalent with monetized hours/in-kind included and committed amounts at their LOCKED historic rate: REQUESTED (Σ requested, current FX) · APPROVED (Σ committed) · ANNUAL (this FY) · 3-YR CUMULATIVE (this FY + 2 prior). The CUMULATIVE TRACKER converts in real time for pending and uses the locked historic rate for committed.

CROSS-LINKS — affiliatedCommunity(stakeholder) = applications where the stakeholder is REPRESENTED (representedStakeholderId, the primary) OR LINKED (linkedStakeholders). stakeholderCumulativeUSD(stakeholder) = Σ committed USD-equivalent of that stakeholder's affiliated decided applications (shown on the stakeholder profile, at locked historic rates). plan.communityIds links a plan's community investments.

DATA MODEL (per application) — id · name · kind · stage · summary · description · rationale · submitter + submitterRole + dateSubmitted · representedStakeholderId · recipient · linkedStakeholders[] · markets/regions/issues · askType · amount + CURRENCY (USD/MXN/CAD) + unit + recurrence (One-time/Annual/Multi-year) + years · monetizedValue (assigned $ for hours/in-kind) · timeline · decisionDeadline · budget{total, requested, otherFunding, inKind} · approvedAmount · dateApproved · approverId + approvedAt (manager) · committedFxRate + committedFxDate (locked historic conversion) · licenseToOperate (0–10) · relationshipImpact (0–10) · risk{reputational, legal, conflictOfInterest(+detail), attestation} · attachments[{label,url}] · votes{userId→for|against|abstain} · owners · createdBy/At · givingMode (Monetary/In-Kind/Mix, Corporate Giving).

RECORD SECTIONS (record.community.edit) — Project overview (name, kind, stage, givingMode if Corporate Giving, summary) · Applicant & sponsor (submitter+role, dateSubmitted, represented stakeholder) · The ask (askType, amount + CURRENCY, unit, recurrence, years; for hours/in-kind the assigned monetary value) · Description & rationale · Beneficiary & relationships (recipient, linked stakeholders) · Strategic alignment (markets/regions/issues + the value-score inputs LtO + RelImpact) · Resources & budget (total, requested, otherFunding, in-kind; approvedAmount, dateApproved; timeline, decisionDeadline; currency + locked-FX readout) · Risk & compliance (reputational, legal, conflict-of-interest + detail, attestation) · Owners. VALIDATION: requires name, recipient, ≥1 connected stakeholder, total cost > 0, conflict description if conflict flagged, attestation. APPROVE requires a manager.

LANDING — grid/list of applications showing kind, stage, amount (USD-equivalent), value score, vote tally; a ROLLUP strip (Requested · Approved · Annual · 3-yr Cumulative) in USD.

UI KIND (components later, NO hand-built CSS) — landing list/table with rollup strip; record = the universal record shell (the 9 sections); selects for kind/stage/currency/askType/recurrence; number fields for amounts + monetization; the two value-score inputs; a for/against/abstain votes control; a MANAGER-ONLY Approve action; a budget/FX readout (current vs locked historic); the embedded FX conversion API. Exact components from the universal kit after the full spec.` },
      { t: "Workspaces — the team's working surface (segment/BU scope, workHQ, Setup sub-page, roles)", d:
`WHAT IT IS — a WORKSPACE is the team's working surface, scoped to a (SEGMENT, BUSINESS UNIT). Within it the team works the per-workspace STAKEHOLDER TABLE (the CRM-fields home — see the Lists table box), the workHQ quick-hits strip, the WHITEBOARD (see its box), Scoring, Map, Plans, and Community — all filtered to the active workspace. Nav = "Workspaces"; SETUP is a SUB-PAGE of Workspaces (not its own top-level nav). Settings is a SEPARATE module (its own box).

WORKSPACE DATA MODEL — id · name · segment · businessUnit · owners[] (the members) · createdBy (the lead/creator) · createdAt. Membership = owners[]. Stakeholder↔workspace via the stakeholderWorkspaces join.

SEGMENTS → BUSINESS UNITS (catalog, manager-editable in Settings) — Personal Systems → [Commercial PCs & Laptops · Consumer PCs · Other Products · Services]; Printing → [Hardware · Supplies · Graphics & 3D Printing]; Corporate Investments → [Poly · HyperX]; Corporate Functions → [Marketing · Communications · Legal / GA&PP · HP Foundation · Supply Chain · SLED]. A workspace picks ONE (segment, BU) pair.

MASTER & TABS — Master (__master) = immovable first tab = the union of ALL stakeholders (Scoring disabled on Master). Workspaces open as TABS (activate / close; Master can't close); the active tab scopes the whole app. Create-from-workspace auto-assigns the stakeholder to it; create-from-Master leaves it unassigned; a stakeholder can belong to MULTIPLE workspaces.

THE WORKING SURFACE (workspace home) — the workHQ strip + the stakeholder table, with three layout MODES (expand-intel / split / expand-table) that resize the two. The Whiteboard clicks OUT into a side-by-side split (see Whiteboard box).

workHQ (quick-hits, computed live from the Store — KEEP for now, improve later) — cards: ALERTS (recent Developments = latest notes across the workspace's stakeholders, newest first); NEED YOUR SCORE (stakeholders the current user hasn't scored); TASKS (community applications Proposed/Under Review awaiting the user's vote). Signals: COLD ENGAGEMENT (High-priority stakeholders with no contact in 90 days); RELATIONSHIP MIX (positive / winnable / negative counts from weighted positions); a summary line; a quick "+ Stakeholder" button.

SETUP (sub-page of Workspaces) — lists ALL workspaces GROUPED BY SEGMENT, with segment/market/region filters + search + sort; CREATE new (name, segment→BU, invite teammates); EDIT if allowed; ASSIGN stakeholders to workspaces (the join). A user can SEE all workspaces here (to browse/sort) but can only OPEN / WORK IN the ones they created or are a member of; for the rest they can ASK TO JOIN (a join-request flow).

ROLES & VISIBILITY (NOTE: the role model still needs final resolution — captured as the working intent) —
• MEMBERSHIP: a user only sees/works in workspaces they belong to (owners[]). In Setup they can browse ALL but only enter their own/member ones; they REQUEST TO JOIN others.
• WORKSPACE LEAD (creator): ANY user can CREATE a workspace and invite teammates — this makes them the workspace's LEAD, but NOT necessarily an app-level MANAGER. The lead-vs-app-manager distinction is OPEN ("more like a lead") — to be resolved.
• APP MANAGER powers: ADD users to other workspaces; REMOVE team members; DELETE a workspace (with a warning/confirm).
• MANAGER CONTINUITY: a workspace must always have a manager — if the only manager LEAVES, another must be ASSIGNED first (cannot be left manager-less). [Mirrors the last-teammate guard in Scoring.]

CROSS-LINKS / SCOPING — Lists / Scoring / Map filter to the active workspace; Plans are one set per workspace; Community + Map can aggregate. The per-workspace stakeholder table IS the Lists table scoped to visibleStakeholders (do not re-spec — see the Lists box).

UI KIND (components later, NO hand-built CSS) — Workspaces nav → the working surface (workHQ strip + stakeholder table, 3 modes; whiteboard split) + the Setup sub-page (grouped/filterable/sortable workspace list, create dialog, member management, join-request, stakeholder assignment); open-workspace tabs. Components from the universal kit after the full spec.` },
      { t: "Whiteboard — team collaboration white-space (NEW; articulated, not designed yet)", d:
`A NEW FEATURE — articulated here, NOT designed yet. A team "WHITE SPACE" to write, collaborate, and comment: an ADVANCED form of Messages, in the spirit of Slack + Todoist. It lives under Workspaces as the team's collaboration surface. Purpose: plan; write; capture IDEAS for planning or for noting a stakeholder's significance.

CAPABILITIES (requirements) —
• IDEAS — captured quickly, then SORTED and ASSIGNED (to teammates), like a lightweight task/idea board (Todoist-like).
• COLLABORATIVE WRITING — multiple teammates write together; EDITS SHOWN LIKE WORD (track changes / edit history / authorship), so changes are visible and attributable.
• COMMENTS — threaded comments on the writing/ideas (Slack-like discussion).
• NEWS / SOCIAL CAPTURE — paste just a URL (a stakeholder's social-feed post, a news article) and the app must FIND, DISCERN, and EMBED or CREATE a beautiful capture from that URL alone: news-outlet name + headline + preview (or an embedded social post). Requires a link-unfurling / oEmbed / page-metadata API (Integrations/APIs bucket); the app decides per URL whether to embed or render a generated card.
• REAL-TIME, MULTI-USER collaboration.

PLAN INTEGRATION — from a PLAN EDIT you can CALL BACK to your whiteboard (if you've used one) to pull ideas/notes/captures into the plan; and you can CONTINUE whiteboarding from within plan view OR edit. Whiteboard content feeds and links into Plans.

LAYOUT (preference) — it clicks OUT of workHQ into a TWO-PANE, SIDE-BY-SIDE SPLIT (like Apple's split-view windows): whiteboard beside the work surface or plan.

RELATION TO MESSAGES — Messaging is the lighter conversation form; the Whiteboard is the advanced collaboration/whiteboarding surface. (How they relate or merge: to confirm.)

STATUS — concept + requirements captured; the design and the URL-embed API are OPEN. To be designed deliberately.` },
      { t: "Settings — org config + the start-state & design-customization dashboard (separate from Workspaces)" },
      { t: "Messaging — conversations/messages model, @ / # / $ mention links" },
      { t: "Persistence / realtime — entities + exact shapes, Store, Supabase swap" },
      { t: "Catalogs — categories/types · markets/regions · segments/BUs · issues · kinds/stages/ask-types" },
      { t: "Design refs — element→MD3 (Material Web) component map · Material Symbols map · Inter/Newsreader" },
      { t: "INDEX — manifest + traceability (feature → spec → MD3 component → verification)" },
    ]
  },
  {
    id: "p1", icon: "inventory", label: "Archive the old .io",
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
    id: "p2", icon: "foundation", label: "2 · Material foundation & theme",
    blurb: "Stand up the neutral, token-driven MD3 theme everything renders through. Design is a layer, not baked in.",
    items: [
      { t: "MD3 :root design tokens (--md-sys-color-* / --md-sys-typescale-* / --md-ref-typeface-*) so the Design page can re-skin live" },
      { t: "Neutral defaults now; no Claude-specific styling yet" },
      { t: "App shell scaffold (top bar + nav + main) composed from Material Web md-* components" },
      { t: "Verify: renders, no console errors, MD3-only (zero MUI)" },
    ]
  },
  {
    id: "p4", icon: "dashboard", label: "App shell",
    blurb: "The frame every page lives in — standard Material components only. Built before the Design page, because you can't re-skin a shell that doesn't exist yet.",
    items: [
      { t: "Brand bar / AppBar (icon + name + workspace selector + people + profile)" },
      { t: "Primary nav (Lists · Scoring · Map · Plans · Community · Workspaces · Help)" },
      { t: "Workspace scoping (Master vs workspace) + tabs" },
      { t: "Context-aware create (+), command palette (⌘K), footer, login gate" },
    ]
  },
  {
    id: "p3", icon: "palette", label: "Settings → Design page",
    blurb: "The page that controls every design token live, with subtext describing the Claude endgame. This is how the look comes back without vibing — and it comes after the shell exists to re-skin.",
    items: [
      { t: "Design controls (MD3 / Material Web) for color tokens, type scale, density, radius, surfaces" },
      { t: "Writes tokens to :root CSS variables (live re-theme, no reload)" },
      { t: "Each control carries subtext describing the Claude-ward target" },
      { t: "Persists to appConfig; defaults remain neutral Material" },
    ]
  },
  {
    id: "p5", icon: "table_view", label: "5 · Pages (in order)",
    blurb: "Rebuild each page from standard MD3 (Material Web) components, strictly to its spec. Confirm each before the next.",
    items: [
      { t: "Lists / workspace table (every column + edit mode per TABLE_COLUMNS)" },
      { t: "Scoring (grid: stakeholders × team; edit only your column; weights)" },
      { t: "Map (zones, dots, drag-rescores-all, history) per MAP_GUIDE + RELATIONSHIP_ZONES" },
      { t: "Plans — landing + record (relationship-recommendation ranking + override)" },
      { t: "Community — landing + record (rollups, votes, value score)" },
      { t: "Workspaces (Setup) + workspace record" },
      { t: "Settings (all sub-panes) + the Design page" },
      { t: "Help (12-step framework + zone legend)" },
      { t: "Messages (sidebar + page) + @ / # mention links" },
      { t: "Profiles — stakeholder + user" },
    ]
  },
  {
    id: "p6", icon: "view_sidebar", label: "6 · Record scaffold & workHQ",
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
    id: "p7", icon: "rocket_launch", label: "7 · Demo features (client-side)",
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
    id: "p8", icon: "dns", label: "8 · Backend (Supabase)",
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
    id: "p9", icon: "workspace_premium", label: "9 · Paid add-ons",
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
    <div className="gx-shell">
      <header className="gx-appbar">
        <md-icon class="gx-appbar-icon">checklist</md-icon>
        <h1 className="gx-appbar-title md-typescale-headline-small">Stakeholdr — Build Guide</h1>
        <md-assist-chip label={`${doneCount}/${allIds.length} · ${pct}%`}></md-assist-chip>
        <md-linear-progress class="gx-appbar-progress" value={pct / 100}></md-linear-progress>
      </header>

      <nav className="gx-rail" aria-label="Phases">
        <md-list>
          {PHASES.map(p => {
            const total = p.items.length;
            const done = p.items.filter((_, i) => checks[p.id + "-" + i]).length;
            return (
              <md-list-item
                key={p.id}
                type="button"
                class={"gx-rail-item" + (p.id === active ? " gx-rail-item--active" : "")}
                onClick={() => setActive(p.id)}
              >
                <md-icon slot="start">{p.icon}</md-icon>
                {p.label}
                <span slot="supporting-text">{done}/{total} complete</span>
              </md-list-item>
            );
          })}
        </md-list>
      </nav>

      <main className="gx-main">
        <p className="gx-eyebrow md-typescale-label-medium">Phase</p>
        <h2 className="gx-phase-title md-typescale-headline-medium">{phase.label}</h2>
        <p className="gx-phase-blurb md-typescale-body-medium">{phase.blurb}</p>
        <md-assist-chip class="gx-phase-count" label={`${phaseDone}/${phase.items.length} in this phase`}></md-assist-chip>
        <div className="gx-note" role="note">
          <md-icon class="gx-note-icon">info</md-icon>
          <span className="md-typescale-body-small">We confirm every item together before checking it off and before moving to the next phase.</span>
        </div>

        <section className="gx-items">
          {phase.items.map((it, i) => {
            const id = phase.id + "-" + i;
            const on = !!checks[id];
            const check = (
              <md-checkbox
                class="gx-check"
                checked={on || undefined}
                aria-label={on ? "Done" : "Not done"}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }}
              ></md-checkbox>
            );
            if (it.d) {
              return (
                <details className="gx-item" key={id}>
                  <summary className="gx-item-row">
                    {check}
                    <span className="gx-item-title md-typescale-body-large">{it.t}</span>
                    <md-icon className="gx-item-expand">expand_more</md-icon>
                  </summary>
                  <div className="gx-item-detail md-typescale-body-medium">{it.d}</div>
                </details>
              );
            }
            return (
              <label className="gx-item gx-item-row gx-item--flat" key={id}>
                {check}
                <span className="gx-item-title md-typescale-body-large">{it.t}</span>
              </label>
            );
          })}
        </section>
      </main>
    </div>
  );
}
