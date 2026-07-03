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
// This page renders with Material Web as a TEMPORARY SCRATCH SURFACE; the rebuilt
// app's law is the Canonical UI design system (design-system/ — see Box 1, RULED
// 2026-06-13). This guide is the single source we follow to rebuild the app, in
// order. Each item carries the captured lossless detail; the user reviews on the
// .io and we seal each handshake by committing the check (done:true) into source.

const STORAGE = "stakeholdr_guide_checks_v1";

// d: optional inferred detail rendered in an expandable panel under the item.
const PHASES = [
  {
    id: "p0", icon: "inventory_2", label: "Foundation · setup only",
    blurb: "The build laws and tooling that must exist before anything is rebuilt — the component kit, the type/icon system, and the meta docs. SETUP ONLY; all app knowledge lives in the Capture section below.",
    items: [
            { t: "Canonical UI (design-system/) is the ONLY component kit — the law for every element [RULED 2026-06-13; re-confirm]", done: true, d:
`RULING (2026-06-13; supersedes the earlier "Material Web only" law — awaiting your re-confirmation on the .io): every UI element in the rebuilt app is a component from this repo's own CANONICAL UI design system (design-system/ — un-branded, token-driven web components, <ui-*> tags), or a composition of them. Never a hand-rolled element, NEVER MUI, never Tailwind utilities, never any third-party UI kit.

WHY CANONICAL UI WON (the 360 ruling — three directions coexisted in the repo):
(1) Material Web (@material/web), the original law, is in MAINTENANCE MODE and ships no data grid, no date/time picker, no nav rail/drawer, no app bar, no tooltip, no snackbar, no autocomplete; the only official fill was adopting Angular + Angular Material — an entire framework pivot, two theming systems, just for the holes.
(2) shadcn/ui + Tailwind was attempted (docs/design) and drifted into patchwork — utility classes are a thousand styling surfaces, the opposite of one token layer; nothing canonical for a build session to obey.
(3) CANONICAL UI was built (PRs #1–#6) precisely to fix both: REAL custom elements (shadow DOM, real states + a11y); ONE styling surface (the --ui-sys-* token layer); and a BINDING machine-readable manifest so an AI build session ASSEMBLES instead of inventing. It is MD3 in philosophy — the same component vocabulary at full parity — with the holes filled natively and zero framework tax: plain web components hosted by the existing React 18 + Vite app, deployed to GitHub Pages.

THE KIT (verbatim): components live in design-system/components/*.js; the registry is design-system/manifest.json (THE CONTRACT — every component, its tag, props, states, and the exact tokens it consumes); the token source is design-system/tokens.css (Tier 1 --ui-ref-* raw values + Tier 2 --ui-sys-* semantic roles; components read ONLY --ui-sys-*). 35 components, all status:built —
• NATIVE (MD3 parity): ui-icon · ui-button (filled/tonal/outlined/text) · ui-icon-button (standard/filled/tonal/outlined; selected toggle) · ui-fab (small/medium/large; primary/surface; extended label) · ui-text-field · ui-checkbox (tri-state) · ui-radio · ui-switch · ui-slider · ui-select + ui-option · ui-menu + ui-menu-item · ui-chip (assist/filter/input/suggestion) + ui-chip-set · ui-list + ui-list-item · ui-tabs + ui-tab · ui-divider · ui-dialog · ui-tooltip · ui-snackbar · ui-linear-progress / ui-circular-progress · ui-avatar (photo src or name-derived initials from first+last; size sm/md/lg via --ui-sys-avatar-size-sm/md/lg = 24/32/40px; fills --ui-sys-primary/on-primary so it re-themes with the wrapper; role=img aria-label=name — the ONE avatar primitive; owner stacks/profile menus/pickers compose from it).
• GAP-FILL (what MD3's web kit never shipped): ui-autocomplete · ui-data-table (sticky header, sortable, selection, density) · ui-chart (bar/line/area inline SVG) · ui-app-bar · ui-nav-rail · ui-nav-drawer · ui-sheet (mobile bottom sheet) · ui-bottom-bar · ui-date-picker.
• SCAFFOLD: ui-app-shell (CSS-grid host; header/nav/main/aside/footer slots; empty tracks auto-collapse) · ui-sidebar + ui-sidebar-item (expanded width RULED 2026-07-02: --ui-sys-sidebar-width: clamp(208px, 18vw, 288px) — Claude-LIKE but PROPORTIONAL, growing with the window to Claude's 18rem cap; collapsed --ui-sys-sidebar-width-collapsed: 64px; icon-only tooltips, active pill, aria-current; the rail must NEVER sit hollow — full nav + a Workspaces section + the identity ui-avatar footer fill it) · ui-inspector (right detail rail ~320px, open/closed) · ui-status-bar (footer).
• DOMAIN: ui-stakeholder-table (the Lists sheet — frozen sticky columns, sortable headers, search/filter/sort/band-chip toolbar, count/avg/export footer) · ui-stakeholder-map (4×6 zone heatmap + scatter via the captured coordToPct transform, statusFor lookup, zone labels/counts, strategy detail panel).

USE THE FULL KIT (never bare-minimum) — every spec box and every build step names the exact ui-* tag + variant + key props, chosen as the right tool from the manifest. "A button" / "a dropdown" is a shortcut and is NOT acceptable. CAPTURE-BOX TRANSLATION: wherever an already-written capture box says an md-* element or a shadcn block, read the equivalent ui-* component (md-filled-button→ui-button variant=filled · md-outlined-select→ui-select · md-assist-chip→ui-chip variant=assist · md-icon→ui-icon · mat-table/TanStack→ui-data-table or ui-stakeholder-table · mat-datepicker→ui-date-picker · Combobox→ui-autocomplete · lucide icons→ui-icon Material Symbols ligatures …); each box gets its build-map wording amended to ui-* as it is sealed.

GAPS: if a need is not covered by a manifest component or expressible via a token, that is a GAP — build the component/token INTO design-system/ (cloning the ui-button quality bar) and register it in manifest.json FIRST, then use it. Never a one-off hack in app markup/CSS. CHANGES TOO: later modifications recompose existing ui-* components or extend the system — never a custom patch.

FORBIDDEN: MUI / @mui/* anywhere; Tailwind / utility classes; @material/web in the REBUILT APP (this guide page itself still renders with Material Web as a temporary scratch surface — the guide is NOT the app and is rebuilt/retired later); raw span/div as UI primitives (allowed only as layout/SVG containers); ad-hoc/inline styling; !important; stray/duplicated/patch CSS; reimplementing any component in markup/CSS.

THEMING = ONE SOURCE: design-system/tokens.css. The authorized design start-state is ALREADY ENCODED THERE VERBATIM — surfaces light→dark #FFFFFF (--ui-ref-neutral-0, content/cards) · #FEFDFC (-1, app runway) · #FCFBF9 (-2, idle fields) · #F8F7F3 (-3, panels/rails/headers) · #F4F3ED (-4, hovers/active cells) · #F0EEE6 (-5, subtle outlines) · #E8E6DE (-6, structural borders); ink #666361 (--ui-ref-ink-strong, primary text) · #ABA9A4 (-muted) · #DFDDD6 (-faint, dividers/disabled); the 14 relationship-zone colors + zone inks/borders as --ui-sys-zone-* (single-sourced for Map/Lists/Help/scorecard); valence tones --ui-sys-pos/-neg/-accent. Re-skinning later (Settings → Design page, toward the Claude aesthetic) = editing --ui-sys-* tokens ONLY; every component re-skins at once; components are never touched.

START-STATE DESIGN RULES (enforced via tokens + components, NEVER hand-built CSS):
• NO GRADIENTS, EVER — solid surface tokens only. SHADOWS: the start-state rule said "no shadows ever"; tokens.css currently carries a subtle --ui-sys-elevation-1..3 ramp used by overlays (menus/dialogs/sheets). OPEN TOKEN DECISION for the Design-page step: flatten to none + stronger outlines, or keep the subtle ramp for floating overlays only. Either way it is a token edit, never component work.
• LINKS / NAV ITEMS — no hover background and no current/active-page background swap; state via ink weight/color. (ui-sidebar-item's active pill reads --ui-sys-primary-container — tune that token at the Design pass to honor this rule.)
• SIDEBARS — never white: --ui-sys-surface-container (#F8F7F3), one+ steps darker than content.
• MAIN CONTENT — always white: --ui-sys-surface-card (#FFFFFF) on the #FEFDFC runway.
• INPUT FIELDS ON A SIDEBAR — lighter than the rail but NOT white: --ui-sys-surface-field (#FCFBF9).
• Small clean type, modest weights, no oversized headings (body 13px --ui-sys-font-body; titles via --ui-ref-typeface-title); tight-but-airy 4px rhythm (--ui-sys-space-*); readability/ease/pleasure are the bar.

DONE = (1) every element is a manifest-registered design-system component (or the sanctioned token-only inline-SVG internals of ui-stakeholder-map/ui-chart); (2) renders, zero console errors; (3) zero MUI/Tailwind/hand-rolled UI, no !important, no inline colors/sizes, no gradients; (4) all look comes from --ui-sys-* tokens; (5) the start-state rules above are honored; (6) any new need landed as a manifest-registered component/token FIRST.` },
      { t: "Type & Icon system — Inter (body/UI) + Newsreader (titles) + Material Symbols icons [AMENDED to design-system tokens; re-confirm]", done: true, d:
`TWO type roles only + the Material Symbols icon set, loaded as web fonts, applied via the design-system typeface tokens at :root — never per-component. ONLY Inter and Newsreader are authorized; NO IBM Plex Mono, no Roboto, no other family (the previous session wrongly added IBM Plex Mono / extra fonts — removed). (AMENDED 2026-06-13: same substance as the sealed version, token mechanism retargeted from --md-* to the Canonical UI --ui-* contract.)

TYPE STACKS (verbatim; tokens.css):
body (body + all UI):  Inter, ui-sans-serif, system-ui, sans-serif   → --ui-ref-typeface-body
title (titles only):   Newsreader, ui-serif, Georgia, serif          → --ui-ref-typeface-title

ROLES, mapped to design-system type tokens (components read ONLY these):
• --ui-ref-typeface-body (Inter) drives all UI text via the type roles --ui-sys-font-body (400 13px/1.45) · --ui-sys-font-body-lg (400 14px/1.5) · --ui-sys-font-label (500 13px/1.2) · --ui-sys-font-caption (400 12px/1.35). Color = --ui-sys-on-surface ink; numbers use Inter tnum tabular figures.
• --ui-ref-typeface-title (Newsreader) drives TITLES ONLY via --ui-sys-font-title (500 18px/1.3) and --ui-sys-font-headline (500 22px/1.25): page titles and section headings. No oversized headings; hierarchy from role + weight, not size bloat.
• There is NO monospace role (RESOLVED — design.md's JetBrains Mono is rejected). Numbers/eyebrows formerly mono use Inter with tnum.

WEB FONTS LOADED (Google Fonts, at document level) — ONLY: Inter 400;500(;600;700 as needed) · Newsreader opsz,wght@6..72,400;500 · Material Symbols Outlined opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200. (preconnect fonts.googleapis.com + fonts.gstatic.com.) Fallback stacks render before fonts load (and in a sandbox where Google Fonts are blocked: system-ui/sans · Georgia).

ICONS: Material Symbols, rendered via <ui-icon> (the ligature name as text content, e.g. <ui-icon>search</ui-icon>) — NEVER hand-rolled span glyphs, NEVER @mui/icons-material, never lucide. <ui-icon> is the ONE place icon px live: size sm|md|lg|xl → --ui-sys-icon-size-18/20/24/32 (md default); axis settings FILL 0 (filled attr flips to 1), wght 300–500 (default 400), GRAD 0; inherits currentColor; a slotted <svg> is the sanctioned fallback for custom marks. Icons stay modest — never larger than their label.

ICON VOCABULARY (semantic name → Material Symbols ligature, verbatim — preserve the meaning): search→search · plus→add · filter→filter_list · sort→swap_vert · download→download · close→close · target→map · grid→settings · work→work · table→table_rows · category→category · cases→cases · language→language · beenhere→beenhere · apartment→apartment · check→check · content_copy→content_copy · user→person · users→groups · help→help · map→map · sliders→thumb_up · plan→description · lock→lock · message→chat · expand→open_in_full · logout→logout · edit→edit · chevron→expand_more · chevronUp→expand_less · layers→layers · community→favorite · drag→drag_indicator · chevron-left→chevron_left · chevron-right→chevron_right · double-left→keyboard_double_arrow_left · double-right→keyboard_double_arrow_right · sparkle→auto_awesome · brandmark→id_card · build→build · clock→history · mail→mail · phone→call` },
            { t: "Component sourcing — the design-system manifest is BINDING (native · gap-fill · scaffold · domain) [RULED 2026-06-13; re-confirm]", done: true, d:
`THE STACK (RULED 2026-06-13; supersedes the "Material Web + Angular Material" plan — Angular is OFF the table): the rebuilt app stays REACT 18 + VITE and hosts the Canonical UI web components (design-system/components/*.js, <ui-*> custom elements; framework-agnostic — props are attributes/JS properties, events are standard DOM events bound via refs). ONE kit covers everything: MD3-parity natives, the gap-fills MD3's web kit never shipped, the app scaffold, and the two Stakeholdr domain components. One token source (design-system/tokens.css) themes all of it. (This build-guide .io itself is a temporary React + Material Web scratch surface — it is NOT the app and is rebuilt/retired later.)

THE THREE LAWS (from design-system/README + manifest.json, verbatim in spirit):
1. REAL COMPONENTS — genuine custom elements (shadow DOM, real states + a11y). Screens are ASSEMBLED from them; a component is never reimplemented in markup/CSS.
2. ONE STYLING SURFACE — the --ui-sys-* token layer is the only legal place a visual decision lives. No component stylesheet overrides, no utility classes, no inline color/size.
3. THE MANIFEST IS BINDING — design-system/manifest.json is the machine-readable contract (every component, tag, props, states, consumed tokens). A build session reads the manifest and assembles real elements; there is no room to invent.

SOURCING RULE (state it in every build map):
• Manifest component EXISTS → use it. NATIVE: ui-button/ui-icon-button/ui-fab · ui-text-field · ui-checkbox/ui-radio/ui-switch/ui-slider · ui-select+ui-option · ui-menu+ui-menu-item · ui-chip(+set) · ui-list(+item) · ui-tabs(+tab) · ui-divider · ui-dialog · ui-tooltip · ui-snackbar · ui-linear/circular-progress · ui-icon · ui-avatar (BUILT + registered in manifest.json v0.2.0 — photo src or name-derived initials, size sm/md/lg via --ui-sys-avatar-size-sm/md/lg = 24/32/40px, role=img; do NOT re-surface it as a GAP). GAP-FILL: ui-autocomplete · ui-data-table · ui-chart · ui-app-bar · ui-nav-rail · ui-nav-drawer · ui-sheet · ui-bottom-bar · ui-date-picker. SCAFFOLD: ui-app-shell · ui-sidebar(+item) · ui-inspector · ui-status-bar. DOMAIN: ui-stakeholder-table · ui-stakeholder-map.
• Component MISSING (or a token can't express a look) → that is a GAP: build it INTO design-system/ to the ui-button quality bar, register it in manifest.json, THEN use it. (Known upcoming candidates from the capture — components NOT yet in the manifest: avatar-stack (composes ui-avatar), owner-picker (composes ui-avatar + ui-menu/ui-autocomplete), badge/count-indicator, drag-reorder grip, ui-coachmark (anchored onboarding spotlight — demanded by the Demo-features box), dashed note/callout (the add-on lock note — demanded by the Paid add-ons box), command-palette composition = ui-dialog + ui-autocomplete. ui-avatar itself is NOT a candidate — it already exists; building a second one would duplicate a manifest entry.)
• Tokened inline SVG is sanctioned ONLY as the internals of ui-stakeholder-map / ui-chart — never as loose app markup.
NEVER: MUI, Tailwind, Angular/Angular Material, @material/web in the app, hand-rolled UI primitives, ad-hoc / !important CSS, a component that doesn't exist.

FONTS & ICONS — Inter (body/UI) via --ui-ref-typeface-body; Newsreader TITLES ONLY via --ui-ref-typeface-title; Material Symbols ligatures via <ui-icon>. Loaded at document level (Google Fonts links per the Type & Icon box). No Roboto, no IBM Plex, no other family.

PREVIEW SURFACES — design-system/preview.html (full component gallery + live token editor) and design-system/wireframes.html (assembled screens) ship as standalone Pages entries (vite.config inputs) so every component and screen is reviewable on the .io before app assembly.` },
      { t: "This build guide is the only thing rendered on the .io", done: true },
      { t: "APP_SPEC.md — exhaustive functional spec committed", done: true },
      { t: "CLAUDE.md — engineering discipline + Material-only rule", done: true },
    ]
  },
  {
    id: "cap", icon: "checklist", label: "Capture · App knowledge (lossless SSOT)",
    blurb: "The lossless single source of truth — the entire existing app captured by DOMAIN as actual content, never labels. Each box expands to its full longform detail; we rebuild the app FROM these boxes once verified complete.",
    items: [
            { t: "Ecosystem — how it all connects (expand to read the full capture)", done: true, d:
`ENTITIES (11 synced tables): stakeholders · scores · team · workspaces · stakeholderWorkspaces (join) · users · conversations · messages · community · plans · appConfig. Each persists via usePersistentState(table, seed) → Store (localStorage + BroadcastChannel now; Supabase upsert + postgres_changes later). Per-device, NOT synced: currentUser (this tab's session) and the column-order preference.

MASTER ↔ WORKSPACES ↔ STAKEHOLDERS
• A stakeholder exists ONCE in the pool. stakeholderWorkspaces[stakeholderId] = [workspaceId,…] is the many-to-many join.
• MASTER (id __master, immovable first tab) = the union of ALL stakeholders — the org-wide overview.
• A workspace = segment + business unit + owners; it shows ONLY stakeholders whose join includes its id.
• Create from a workspace → auto-assigned there; create from Master → unassigned. A "Reminders" system message posts "New stakeholder added… please score them."
• Scoping per view: Lists/Scoring/Map filter to the active workspace (all on Master); Plans are scoped to a workspace via plan.workspaceId, and a workspace can hold MULTIPLE plans — newPlan always appends a brand-new plan (fresh uid("plan"), workspaceId = the active workspace, or the first workspace when on Master) and updatePlan upserts by plan.id, never by workspaceId; do NOT encode a one-plan-per-workspace unique constraint (an old source comment claiming "one plan per workspace" is stale prose the code ignores — see the Persistence box, discrepancy #2); Community + Map can aggregate. Scoring is DISABLED on Master (a workspace collaboration act) → redirects to Map.

THE CORE LOOP (the moat — single-sourced, reused everywhere)
1) SCORE — each teammate places a stakeholder on a 2-axis grid: x = alignment/support (−10..10), y = influence/importance (−10..10). You edit only YOUR column; others are read-only. team[].weight weights each rater.
2) POSITION — weightedCoord(id, scores, team) = Σ(score·weight)/Σweight per axis → the blended {x,y}. statusFor(x,y) maps it to one of 14 relationship ZONES (each with a color + strategy + action). Drives the table's _x/_y/_status, the map dot, and the profile.
3) PRIORITIZE — in a Plan, "Plan Fit" turns the relationship position + issue-overlap + community-ties + category-affinity into a FIT BAND (High/Med/Low) + a plain reason + the relationship's prescribed MOVE, weighted by the picked plan algorithm (sector + plan type). Advisory; never overrides the manual Priority; the team can override/add freely. (See "Relationship recommendation alignment".)
4) PLAN — a workspace-scoped engagement doc ("Stakeholder Plan"): scenario · org-goal alignment · the priority-ordered + Fit-ranked stakeholder table · strategy/tactics/phases · measurement; links community investments.
5) FUND — Community applications (philanthropy / corporate giving / PAC / sustainability / social impact) tie to stakeholders (represented + linked), carry a value score = (license-to-operate + relationship-impact)/2, team votes (for/against/abstain), budgets; FY-aware rollups (requested / approved / annual / 3-yr) compute committed spend.
6) MEASURE — quarterly score snapshots (stakeholder.history) show map movement over time; plans measure against fiscal cadence; community rollups track committed value.

CROSS-LINKS (ids resolved by shared helpers, never forked): affiliatedCommunity (via representedStakeholderId + linkedStakeholders) · stakeholderCumulativeUSD · communityEntryAmount · getWorkspacesForStakeholder · plan.communityIds. Message mentions (@ stakeholder, # plan, …) link back to records.

ROLES: manager (edit anything; delete any workspace; edit config + roles; override the plan algorithm) · member (own records; delete only workspaces they created) · system (bots e.g. Reminders; never in pickers/online lists). UI gates on role today; RLS enforces server-side later.

PERSISTENCE / REALTIME: every mutation → Store.save → localStorage + a BroadcastChannel("hpsm-sync") {table,value} that other tabs apply live (storage-event fallback). SCHEMA_VERSION wipes the namespace on breaking changes. The Supabase swap lives ONLY in store.js: save→upsert(row), broadcast→postgres_changes; the UI never changes.` },
            { t: "Relationship engine — axes · zone grid · recommendations (expand: verbatim from source)", done: true, d:
`AXES & LOOKUP — statusFor(x,y), inputs clamped to ±10.
y → row:  y>5→0 · 2.5<y≤5→1 · 0<y≤2.5→2 · -2.5<y≤0→3 · -5<y≤-2.5→4 · y≤-5→5
x → col:  x<-5→0 · -5≤x<0→1 · 0≤x<5→2 · x≥5→3   → returns GRID[row][col]
X_BOUNDS=[-10,-5,0,5,10] · Y_BOUNDS=[10,5,2.5,0,-2.5,-5,-10]
Position: weightedCoord(id,scores,team) = Σ(score·weight)/Σweight per axis over raters who scored (weight≤0 skipped); {0,0} if none.

THE 14 ZONES — cells (x / y) · tone · color / text / border · STRATEGY, then the action. The strategy and action strings below are user-facing UI copy (scorecard Strategy card, Help, Lists tooltips) and are transcribed CHARACTER-FOR-CHARACTER from STATUSES in data.js — never abridge, reword, or "tighten" them; the rebuild ships these exact strings.

1 Proactively Defend — x<-5, y>5 · negative · #D26A6A / #FFFFFF / border #7a2424
  Strategy: Address Key Influencer
  Action: Launch plan to neutralize a major threat to the industry or company's license to operate; leverage reputation, resources, subject-matter experts, and other allied stakeholders to win. Measure and report on activity often.
2 Defend — {-5≤x<0, y>5} + {x<-5, 2.5<y≤5} · negative · #E29A9A / #7a2424
  Strategy: Neutralize Threat
  Action: Defend license to operate. Defend reputation against regular attacks from stakeholders with high influence who are unlikely to move toward positive support; discredit message or position. Measure and report on activity often.
3 Protect — {-5≤x<0, 2.5<y≤5} + {x<-5, -2.5<y≤2.5} · negative · #EFBEBE / #7a2424
  Strategy: Mobilize Defense
  Action: Take action with internal resources and strategy. Defend reputation against regular attacks; manage expectations for changing stakeholder dynamic or group's influence in the community. Measure and report on activity regularly.
4 Respond — {-5≤x<0, -2.5<y≤2.5} · negative · #F4D6D6 / #7a2424
  Strategy: Challenge Stakeholder
  Action: Implement plan to challenge misinformation; reduce stakeholder's ability to destabilize the business or challenge brand identity and reputation.
5 Identify — {x<0, -5<y≤-2.5} · negative · #F8E4E4 / #7a2424
  Strategy: React To Issues Or Conflict
  Action: Work to neutralize threat; educate stakeholder; resolve or minimize the stakeholder's ability or willingness to maintain conflict. Assign internal staff, team, or working group to execute response.
6 Monitor — {x<0, y≤-5} · neutral-low · #F4DBB0 / #7a4a14
  Strategy: Plan Ahead, Listen
  Action: Map stakeholder and plan to respond in the event of change; assign internal staff, team, or working group to execute plan if necessary.
7 Maintain — {0≤x<5, y≤-5} · neutral-low · #F9E4BD / #7a4a14
  Strategy: Take Steps To Introduce Our Vision And Values
  Action: Take simple steps to engage; educate and create awareness about the business; look for ways to increase alignment and the stakeholder's influence over time.
8 Connect — {x≥5, y≤-5} · neutral-low · #FCEFD1 / #7a4a14
  Strategy: Prioritize Resources Elsewhere
  Action: Take no action. Prioritize time and resources elsewhere but monitor for any negative changes in alignment or improved influence in the community over time.
9 Commit — {x≥0, -5<y≤-2.5} · neutral-low · #FAEACA / #7a4a14
  Strategy: Understand Needs, Work Towards Common Purpose
  Action: Build greater understanding between our company and stakeholder groups; look for opportunities to continue education and alignment that could lead to improved collaboration or affinity toward the business.
10 Cooperate — {0≤x<5, -2.5<y≤2.5} · positive · #DDE7C2 / #2f5a26
  Strategy: Existing Alignment Produces Some Favorable Outcomes
  Action: Some value already exists and should continue with moderate level of commitment; maintain existing level of relationship.
11 Collaborate — {0≤x<5, 2.5<y≤5} + {x≥5, -2.5<y≤2.5} · positive · #C2D9A4 / #2f5a26
  Strategy: Investing In Relationship Will Improve Our Business Or Reputation
  Action: Commitment important to our business; establish opportunities to work together and reap mutual benefits; leverage stakeholder's influence to increase our reputation.
12 Valuable Relationship — {0≤x<5, y>5} · positive · #B1CF92 / #2f5a26
  Strategy: Stakeholder Important To Our Business Success
  Action: Stakeholder is an important surrogate, ally, or business partner. Investing in and growing this relationship proactively supports and defends the business and increases our reputation. Prioritize collaboration and deploying engagement strategies.
13 High Value Relationship — {x≥5, 2.5<y≤5} · positive · #97C57A / #2f5a26
  Strategy: Shared Value Introduced
  Action: Moderate shared value introduced; investing and growing this relationship produces value for our business and increases our reputation. Prioritize collaboration and engaging the stakeholder often to meet business and advocacy goals.
14 Strategic Partner — {x≥5, y>5} · positive · #74B556 / #FFFFFF / border #1f3f17
  Strategy: Shared Value Created
  Action: Shared value created. Formalize a working relationship or partnership with the stakeholder to produce and measure shared value; relationship grows the business, increases our reputation, and produces solutions.

(Tone values are exactly "negative", "neutral-low", "positive". Only zones 1 and 14 carry a border property; all other zones have no border field — dot outlines fall back to the zone's text color. Colors were hand-chosen to read on the warm-cream background; in the rebuild each zone's color/text/border single-sources as the --ui-sys-zone-* token family.)

STATUS_ORDER (spectrum, most-negative→positive): Proactively Defend · Defend · Protect · Respond · Identify · Monitor · Maintain · Connect · Commit · Cooperate · Collaborate · Valuable Relationship · High Value Relationship · Strategic Partner.` },
                                          { t: "Scoring & weighting — the team matrix, edit-only-your-column, weighted position", done: true, d:
`WHAT IT IS — the Scoring page is a MATRIX where the team collectively rates each stakeholder, and those ratings blend into the single position that drives the Map, the Lists table, and every profile. Rows = stakeholders. Columns = team members, followed by two computed columns: "Weighted (x, y)" and "Relationship".

DATA MODEL — the team and the scores are GLOBAL, NOT per-workspace. There is ONE team (the "team" table) and ONE score-set per stakeholder (scores[stakeholderId][teamMemberId]) shared across the entire app. The ONLY thing the active workspace changes is WHICH STAKEHOLDERS (rows) appear: on a workspace the rows are filtered to stakeholders whose stakeholderWorkspaces join includes that workspace; on Master the rows would be the full union (but Scoring is disabled on Master — see Scoping). The columns (team members) and each cell's stored score are the SAME no matter which workspace you view from. A stakeholder in three workspaces has one shared position, scored once by the one team.

THE CELL — each cell is one teammate's rating of one stakeholder: a pair (x, y), each nominally an integer from -10 to 10 stepped by 1. ORACLE TRUTH (exact — the integer framing is NOT enforced): the number input's step="1" is ADVISORY only, and the clamp helper never rounds (Number(v); NaN becomes 0; otherwise only Math.max(min, Math.min(max, n)) — min/max, no rounding), so a TYPED "2.5" persists as the fractional score 2.5; only the ± steppers are integer-safe (±1 from the current value, and only from an integer start). BUILD-TIME RULING (decide with the user at seal): whether the rebuild coerces typed values to integers (round/step-enforce on commit) or accepts fractional scores exactly as the oracle does — never silently either. x = alignment/support (negative = opposed, positive = supportive); y = influence/importance (negative = low, positive = high). These are the two axes the Relationship engine reads.

EDIT-ONLY-YOUR-COLUMN — a teammate may edit ONLY their own column (the column whose teammate is the logged-in user, matched m.userId === currentUser.id). Every other column is READ-ONLY. This is deliberate: a position is a blend of independent judgments, so you never overwrite a colleague's read on a stakeholder. Your column is not merely tinted "mine" — it is PINNED: the my-col class (set on the header th AND every body td of the logged-in user's column) makes it the SECOND sticky column, fixed immediately after the sticky Stakeholder name column, so your editable cells never scroll out of view (exact mechanics in MATRIX LAYOUT below).
• TEAMMATE COLUMN HEADERS — each team-member column header (a th with class "member", plus "my-col" when it is the current user's column) shows the teammate's NAME with a sub-label beneath it: "weight " + the live weight rendered as (m.weight ?? 0).toFixed(1) + "×" (e.g. "weight 1.0×"), in a span with class member-weight. This mirrors the live weight from the team bar and recomputes as weights change — a header is never a bare name. EVERY teammate column header — including the current user's my-col header — carries a gradient background linear-gradient(180deg, #F4EFE0, #ECE6D4): a lighter sibling of the computed columns' #F1E7CD → #E8DCB7 gold, giving the header row a deliberate TWO-TIER treatment (teammate columns lighter parchment, computed columns deeper gold). FLAG: both gradient pairs belong to the same --ui-sys-* token family as the computed-column surfaces; the design start-state's "no gradients ever" rule means the rebuild must resolve them to flat token surfaces WITH THE USER — never silently keep the gradients, never silently flatten them.
• Your editable cell (xy-input layout): two numeric inputs labelled x and y — ui-text-field type="number" (min -10 / max 10 / step 1), each wrapped with a +/- stepper pair of ui-icon-button (chevronUp = increase, chevron = decrease) that increment/decrement by 1 and CLAMP to [-10,10]. The steppers carry tabIndex -1 (skipped in tab order). Each labelled with a leading "x"/"y" lbl span. Clamp rule (the clamp helper): a non-numeric entry becomes 0; anything out of range snaps to the nearest bound (Math.max(min, Math.min(max, n))) — and clamp NEVER ROUNDS (the fractional-value truth in THE CELL above). EXACT CELL GEOMETRY (xy-input; the cell template's token start-state — every value below becomes a --ui-sys-* token or sticky/layout value, never ad-hoc CSS): the cell content is an inline-grid, grid-template-columns auto auto, gap 4px 6px (row gap 4, column gap 6), padding 4px 6px, items centered both axes. Each field (xy-field, position relative inline-flex): the input is 52px wide with 16px right padding clearing the stepper stack (the base xy-input input rule says width 44px; the xy-field override — width 52px + padding-right 16px — is what actually renders), text centered, 12px (oracle mono face var(--mono) — the type law forbids mono: Inter with tabular numerals, forward-design substitution, flagged), background var(--paper-2), 1px solid var(--rule) border, border-radius 4px, padding 3px 5px, native webkit/moz spinners suppressed (appearance textfield). FOCUS STATE: outline none, border-color var(--accent), box-shadow 0 0 0 2px rgba(2,74,216,.15) — DISPOSITION: that focus-ring literal is the frozen #024AD8 accent blue (the Color-census accent finding; it does NOT follow the themable accent) — in the rebuild the ring is a token derived from the live accent (the focus-ring token family), never an inline literal, and it lands in the open accent-hue decision. STEPPER STACK (xy-spin): absolutely positioned inside the field at right 4px, vertically centered (top 50%, translateY(-50%)), a column flex with 2px gap; each xy-spin-btn is 10px wide × 8px tall, zero padding, borderless, transparent background, ink-mute glyph (the chevron glyph renders 8×8px at 9px font-size), hover → accent glyph. The "x"/"y" lbl spans: 9.5px uppercase 0.08em letter-spacing, ink-mute, right-aligned (oracle mono → Inter tnum, same flag).
• A read-only (teammate) cell (scoring-cell-ro / xy-readonly layout): shows their x and y as two static labelled pairs — "x {sc.x}" and "y {sc.y}" (each a xy-readonly-pair: a xy-readonly-k key "x"/"y" + a xy-readonly-v value). The whole cell carries a tooltip title "{teammate name}'s score" (falls back to "Teammate" if the user is missing). EXACT READ-ONLY GEOMETRY (xy-readonly; token start-state): the same inline-grid pattern as the editable cell — grid-template-columns auto auto — but tighter, gap 1px 3px, padding 4px 6px, centered; each pair renders display:contents so the four spans grid directly; the k spans match the editable lbl treatment (9.5px caps 0.08em, ink-mute, right-aligned, oracle mono → Inter tnum); the v spans are 28px wide, centered, 12px, ink-3, tabular numerals.
• UNSCORED ≠ (0,0): a cell a teammate has never scored renders EMPTY (an em-dash "—" placeholder), NOT a fake 0/0, and is EXCLUDED from the weighted average. A real 0,0 is stored only when that teammate deliberately enters it. (Correction from the old build, which defaulted unscored cells to { x: 0, y: 0 } and made "no opinion" indistinguishable from "dead-centre".) EDITABLE-CELL RULE FOR AN UNSCORED CELL — the oracle mechanic (part of the SAME old bug; captured so it is never replicated blindly): the editable cell reads sc = (scores[s.id] || {})[m.id] || { x: 0, y: 0 }, and every change calls updateScore with the spread of that fallback plus the one edited axis — so the FIRST edit of one axis of a never-scored cell silently persists 0 for the OTHER axis (a first stepper click on x stores y = 0 as if deliberate). REBUILD BEHAVIOR (explicit, so a cold build invents nothing): your own unscored cell renders BOTH fields empty (em-dash placeholders, consistent with the read-only display rule); entering or stepping one axis creates the score record whole — the entered value on that axis, 0 on the untouched axis — and from that moment both fields display their stored values. The record is thus only ever created by a deliberate act, and the UI never fakes a 0/0 before that act. CONFIRM WITH THE USER AT SEAL TIME: whether the untouched axis 0-fills on first touch (as specified here) or the cell requires both axes before saving.

MATRIX LAYOUT, STICKINESS & SHARED CELL STYLING (oracle-exact; in the rebuild every position/size below is a sticky-position value or --ui-sys-* token inside the tokened table composition — never ad-hoc CSS):
• The table sits in a wrap (scoring-table-wrap) that scrolls BOTH axes (overflow-x auto + overflow-y auto, flex 1, min-width 0); the table itself is border-collapse separate, border-spacing 0, width max-content with min-width 100%, base font-size 12px.
• TWO sticky-left columns, not one: (1) the Stakeholder name column (sh-cell): min-width 220px, position sticky left 0, z-index 2, paper background, padding 4px 10px, and a 1px var(--rule) right border separating it from the score columns; (2) the current user's my-col column: position sticky left 220px — the offset equals the name column's 220px min-width, so the two pin flush — z-index 1, paper background. Only the OTHER teammates' columns and the two computed columns scroll horizontally.
• The WHOLE header row is sticky at top 0 during vertical scroll: thead th = position sticky, top 0, z-index 4, background var(--bg-2), 1px var(--rule) bottom border + 1px var(--rule-2) right border, padding 8px 10px, weight 500, ink-3, 11px uppercase with 0.08em letter-spacing, and (via a later rule) max-width 200px with word-break break-word / white-space normal / line-height 1.25. The sticky corners stack above everything: the Stakeholder th carries inline position sticky, left 0, z-index 5, background var(--bg-2); the my-col th gets z-index 6. Member headers are additionally min-width 110px (so a short name never collapses the column).
• Body cells: height 40px, padding 0, paper background, vertically centered, text-align center, with hairline 1px var(--rule-2) bottom + right borders.
• HOVER & TINTS: hovering a row tints EVERY cell in it — the sticky name cell AND all body cells — #FBF7EB; hovering the stakeholder name cell (sh-cell-link) turns the sh-cell-name text accent-colored; read-only teammate cells carry a permanent faint wash rgba(0,0,0,0.018) (scoring-cell-ro) distinguishing them from your editable cells. FLAG: the row-hover tint, the read-only wash, and the derived-cell fill below all become --ui-sys-* tokens.

SCORE RECORD (persisted shape) — scores[stakeholderId][teamMemberId] = { x, y, createdAt, updatedAt }. createdAt is stamped on the FIRST score for that cell; updatedAt is restamped on EVERY change. Stored in the synced "scores" table. Removing a teammate deletes that teammate's entry from every stakeholder's row (their column of scores is purged).

THE TEAM BAR (top of page, team-bar) — one Card (team-card) per teammate, in this order: (1) the logged-in user first, (2) then workspace owners in their listed order (by workspaceOwners index), (3) then everyone else in original order. Each card shows: Avatar (size 22) + name + title; a WEIGHT control; a derived "% of team" readout. CARD CHROME (exact; → --ui-sys-* surface-container tokens): each team-card is a FIXED-WIDTH flex item, flex 0 0 192px (192px, no grow/shrink), background var(--bg-2), 1px solid var(--rule) border, border-radius 8px, padding 8px 10px, min-width 0, word-break break-word (long names/titles wrap inside the fixed card, never widen it).
• WEIGHT — ui-slider, min 0.0, max 2.0, step 0.1, baseline 1.0 (a tick mark centered at 1.0; the fill spans between the 1.0 baseline position and the current value, so the bar grows left of baseline below 1.0 and right of baseline above 1.0). The baseline tick element itself carries a HOVER TOOLTIP with the exact copy "Baseline weight 1.0" (oracle: the wt-baseline div's title attribute; rebuild: a ui-tooltip on the tick). Value displayed in the card header row as "{weight.toFixed(1)}×" (uppercase "WEIGHT" label on the left, value on the right). Beneath the slider sits a three-segment end/baseline label row: left "0.0", center "1.0 baseline", right "2.0" (small ~9.5px muted figures). Weight 0.0 is a DELIBERATE, legal choice: it keeps the teammate on the workspace but takes their scores OUT of the blend (a "don't weight this person right now" without removing them). Removing a teammate is a separate action (see below).
• % OF TEAM — that teammate's weight / sum of all weights, shown as an integer percentage in a tinted readout pill beneath the slider labels: "{pct}% of team". EXACT FORMULA: pct = totalW > 0 ? Math.round((weight / totalW) * 100) : 0 — integer rounded; renders "0% of team" when the total team weight is 0. Recomputes live as any weight changes. EXACT PILL GEOMETRY: margin-top 6px, padding 4px 7px, border-radius 4, ~10.5px ink-3 text, centered. TRI-COLOR TINT on the readout background, keyed off this teammate's weight: weight === 1 → neutral grey rgba(0,0,0,.04); weight > 1 → green rgba(62,122,46,.1); weight < 1 → amber rgba(176,126,31,.1). FLAG: these three literal tints should become --ui-sys-* tokens (e.g. --ui-sys-weight-baseline / --ui-sys-weight-over / --ui-sys-weight-under) rather than inline rgba.
• REMOVE (×) — ui-icon-button with the close icon (top-right of the card header, aria-label "Remove"). ORACLE TRUTH (captured behavior): the old build renders this control UNCONDITIONALLY on EVERY team-card, and removeTeamMember performs NO role or identity check — any logged-in teammate can remove ANY teammate, including other people's cards. DO NOT REPLICATE — deliberate rebuild correction (forward-design, not captured behavior): gate the action — a MANAGER may remove ANY teammate; a teammate may remove THEMSELVES (leave the workspace); a plain member cannot remove other members; show the control only when the current user is a manager or it is their own card.
• SOLE-MEMBER LEAVE — if the only remaining teammate tries to remove themselves (orderedTeam.length === 1), the action is intercepted: instead of removing, it opens the last-teammate / closure dialog (see below). No path silently leaves a workspace teamless.

ADD A TEAMMATE — a ui-dialog (width 380), title "Add a teammate", with a header close ui-icon-button (close icon, aria-label "Close"); both that close button and a click on the scrim/veil dismiss the dialog without adding anyone. Body: one field labelled "Pick a user" containing a searchable picker (UserAutocomplete: a ui-autocomplete typeahead filtering users by name or title — placeholder "Type a name or title…", clearable, autoFocus) listing users NOT already on the team and excluding the system bot (role !== "system"); a chosen user is added at weight 1.0 (baseline) — helper text "They'll be added with weight 1.0 (baseline). Adjust afterwards." Foot: confirm button "Add to team" (disabled until a user is picked); "Cancel" dismisses.
• HOW IT OPENS — ORACLE TRUTH (verified): the old app's ONLY wiring is a window-event LISTENER — the Scoring page registers window.addEventListener("open-add-teammate", ...) which flips the dialog open — and NO code anywhere in the old app (archive/src, project/, the HTML prototype) ever DISPATCHES "open-add-teammate". The dialog is fully built but UNREACHABLE — dead wiring; in the shipped old app there was no way to open it. DO NOT REPLICATE the orphaned event. REBUILD REQUIREMENT (make-real): give the dialog a real, visible affordance — an "Add teammate" ui-button (e.g. outlined variant with a leading ui-icon person_add) on the team bar, after the last team-card; exact placement/variant to confirm with the user — that opens this dialog directly.
• NOT THE (+): the context-aware global create (+) on the Scoring page does NOT open this dialog. When the active page is Scoring, the (+) sets addNonceFor === "scoring", which the Scoring page consumes by opening the NEW-STAKEHOLDER modal (StakeholderModal — the same full add-stakeholder dialog as the Lists page, opened with existing = null, isMaster = false, submitting through addStakeholder). The (+) always means "new stakeholder" here, never "add teammate".

LAST-TEAMMATE / WORKSPACE-CLOSURE — a workspace cannot have zero teammates. Removing the final teammate (or the sole teammate leaving) routes through a dedicated dialog (width 460): heading "Last teammate on this workspace", body "A workspace cannot have zero teammates. Hand off to a replacement, or delete the workspace entirely." The dialog header carries a close (×) ui-icon-button (close icon, aria-label "Close"), and a click on the scrim/veil also dismisses — BOTH paths cancel with no removal (the pending last-member id is cleared). It offers HAND OFF to a replacement — a designed select labelled "Hand off to" (login-field lbl span) whose default placeholder option is "Select a teammate…" with empty value "" (while selected, "Hand off & remove" stays disabled); the eligible options (replacementChoices = non-system users not already on the team) are each shown as "{name} · {title}" (the " · title" suffix only when the user has a title). Two foot actions: a destructive "Delete workspace" (ui-button danger/error tokens, calls onDeleteWorkspace then closes the dialog) on the left; "Hand off & remove" (ui-button primary, disabled until a replacement is chosen) on the right, which adds the replacement then removes the last member.

THE MATH — weightedCoord(stakeholderId, scores, team): for each teammate who HAS scored this stakeholder and whose weight > 0, accumulate sx += x*weight, sy += y*weight, totalW += weight; result = { x: sx/totalW, y: sy/totalW }. Two independent reasons a teammate drops out of the blend for a given stakeholder: (a) they have NOT scored that stakeholder (no record) — always excluded, regardless of weight; (b) their weight is 0.0 (weight <= 0 is skipped) — a deliberate exclusion that still leaves them on the team. If the surviving total weight is 0 (nobody scored, or everyone who scored is at weight 0), the position is { x: 0, y: 0 }. The "Weighted (x, y)" column (computed class) renders each axis to ONE decimal (toFixed(1)), each colored positive/negative (x >= 0 → var(--pos), else var(--neg); same for y), separated by a comma. "Relationship" runs statusFor(x,y) and shows the resulting zone as a StatusPill (rebuilt as a ui-chip, colored by the zone's color/text from STATUSES).

COMPUTED-COLUMN HEADERS & COMPUTED-CELL STYLING — the two computed column headers ("Weighted (x, y)" and "Relationship") share a GOLD GRADIENT background: linear-gradient(180deg, #F1E7CD, #E8DCB7) (the deeper tier of the two-tier header treatment; the teammate headers' #F4EFE0 → #ECE6D4 is the lighter tier — see TEAMMATE COLUMN HEADERS for the shared token/no-gradients flag). The "Weighted (x, y)" header additionally carries a "derived" SUB-LABEL beneath the title (block, normal weight, no transform/letter-spacing, ~10.5px ink-mute, ~2px top margin). BOTH computed BODY cells share the derived-surface fill: the Weighted (x, y) body cell (td.computed) has background #FBF6E6, padding 0 12px, and 12px ink-2 figures (oracle sets them in the mono face var(--mono); the type law forbids mono — forward-design substitution, flagged: Inter with tabular numerals); the Relationship cell (the StatusPill's td) is the same #FBF6E6 fill with the same 0 12px padding. FLAG: the gradient stops (#F1E7CD, #E8DCB7 and #F4EFE0, #ECE6D4) and the derived-cell fill (#FBF6E6) become one --ui-sys-* "computed/derived column" surface family. The sticky-left "Stakeholder" header has background var(--bg-2) and position: sticky, left 0, z-index 5.

STAKEHOLDER NAME CELL (sh-cell, sh-cell-link) — three stacked lines: (1) sh-cell-name = displayName(s) || s.org; (2) sh-cell-org = s.org (rendered only if present); (3) sh-cell-meta = s.type (a type meta line). The whole cell is clickable (cursor link), title "Open stakeholder", and on click dispatches the window CustomEvent "open-stakeholder-profile" with detail = s.id (opens that stakeholder's profile).

SCOPING — Scoring is a PER-WORKSPACE collaboration act and is DISABLED on Master: if the active workspace is Master, the Scoring nav item is hidden, and navigating to Scoring on Master redirects to the Map. (Master is the read-only org-wide union; you score within a workspace, not across the whole org.)

CANONICAL-UI BUILD MAP (Canonical UI design system — ui-* web components; the matrix is a tokened ui-data-table-style composition since the layout is a custom sticky/scroll grid, NOT a third-party grid) — matrix: a semantic table / CSS-grid structure styled only with --ui-sys-* surface/outline tokens, with TWO sticky-left columns ("Stakeholder" pinned at left 0 with 220px min-width; the current user's my-col pinned at left 220px immediately after it — only other teammates' and the computed columns scroll horizontally) and the WHOLE header row sticky at top 0 during vertical scroll — in the rebuild these are sticky-position values inside the tokened table composition, with the corner z-order (name header above my-col header above body) preserved. Rows are 40px with hairline (rule-2-token) cell borders; the row-hover tint (#FBF7EB), the read-only-cell wash (rgba(0,0,0,0.018)), the teammate-header and computed-header surfaces (the two gradient pairs, resolved to flat tokens per the flag), and the #FBF6E6 derived-cell fill are all --ui-sys-* tokens. Teammate column headers: name + the member-weight sub-label ("weight {value}×") as tokened text. Each editable x/y cell: two small ui-text-field type="number" (min -10 / max 10 / step 1), each paired with two ui-icon-button steppers (chevronUp / chevron, ±1 clamped) — cell + field geometry per the EXACT CELL GEOMETRY token start-state above (52px fields, 16px stepper clearance, 10×8px steppers, tokened focus ring per the disposition); an unscored own cell starts empty and creates the record per the EDITABLE-CELL RULE above; read-only teammate cells: tokened static text in the xy-readonly two-pair layout (EXACT READ-ONLY GEOMETRY above) with a ui-tooltip "{name}'s score". Weight: ui-slider (0.0–2.0 step 0.1, tick at 1.0 carrying a ui-tooltip with the exact copy "Baseline weight 1.0") with the "0.0 / 1.0 baseline / 2.0" label row beneath. % of team: a tinted readout (ui-chip or tokened surface) with the tri-color weight tint and the EXACT PILL GEOMETRY above. Teammate card: a tokened surface-container card (the 192px CARD CHROME values above) holding the avatar (image or initials), name/title text, the ui-slider, and the remove ui-icon-button (gated per the rebuild-correction permission rule above). Add-teammate: opened by the NEW "Add teammate" ui-button on the team bar (the make-real affordance above — never by the oracle's dispatcher-less "open-add-teammate" event); the dialog is a ui-dialog (title "Add a teammate", width 380, header close ui-icon-button + scrim dismiss) + ui-autocomplete typeahead. Last-teammate / closure: the ui-dialog (width 460, header close ui-icon-button + scrim dismiss) with the "Hand off to" ui-select (placeholder "Select a teammate…") and the destructive ui-button (error tokens). Relationship cell: ui-chip (zone-tokened) on the derived-fill (→ token) cell surface. Stakeholder name cell: a tokened clickable opening that stakeholder's profile via the open-stakeholder-profile event.

SKELETON TREE (the literal nested region tree extracted from archive/src/scoring.jsx — the build assembles against THIS tree, never prose; indentation = nesting; every className region in the module appears below or is explicitly absorbed by a component's shadow DOM) —
· div.scoring-wrap — the page container for the whole Scoring surface. Mapping: the page slot inside ui-app-shell main content; layout column — token-only container.
  · div.team-bar — the horizontal team-card row at the top (plus, in the rebuild only, the make-real "Add teammate" ui-button after the last card). Mapping: layout row — token-only container.
    · div.team-card ×N (one per teammate, in orderedTeam order). Mapping: tokened surface-container card (the CARD CHROME values above: flex 0 0 192px, bg-2, 1px rule border, r8, 8px 10px padding).
      · header row div (inline flex, gap 8, align center) — Avatar (size 22) + a min-width-0 flex-1 column div (name line: 12.5px weight 500 ellipsis; title line: 10px ink-3 ellipsis) + button.btn.btn-ghost remove (Icon "close", aria-label "Remove", inline padding 2). Mapping: ui-avatar + tokened text + ui-icon-button (gated per the REMOVE permission correction).
      · weight label row div (inline flex, space-between) — span "Weight" (10px uppercase 0.08em ink-mute) + span value "{weight.toFixed(1)}×" (var(--mono) 12px 600 → Inter tnum per the type law). Mapping: layout row — token-only.
      · WeightSlider → div.weight-track. Mapping: ui-slider (everything inside is internal to ui-slider).
        · div.wt-rail — contains div.wt-fill (inline left/width percentages spanning between the 1.0-baseline position and the current value) + div.wt-baseline (the centered 1.0 tick, title "Baseline weight 1.0" → ui-tooltip on the tick).
        · input type=range min 0.0 max 2.0 step 0.1 — the real control overlaid on the rail. Internal to ui-slider.
      · end-labels row div (inline flex space-between, ~9.5px ink-mute, mono → tnum) — span "0.0" + span "1.0 baseline" + span "2.0". Mapping: layout row — token-only.
      · % of team readout div — inline-styled tinted pill (tri-color background per the % OF TEAM rule, margin-top 6, padding 4px 7px, radius 4, ~10.5px ink-3, centered) with text "{pct}% of team". Mapping: ui-chip or tokened readout surface (tints → tokens per the flag).
  · div.scoring-table-wrap — the both-axes scroll container (flex 1, min-width 0). Mapping: internal to the tokened matrix composition (its scroll viewport).
    · table.scoring-table — semantic table, border-collapse separate, width max-content min-width 100%. Mapping: the tokened ui-data-table-style composition; the table structure itself is internal to that composition.
      · thead → tr — the sticky header row (all th sticky top 0):
        · th "Stakeholder" — inline position sticky, left 0, z-index 5, background var(--bg-2). Internal sticky-corner header cell.
        · th.member (+ .my-col on the current user's column) ×N — teammate name + span.member-weight "weight {w}×" sub-label. Internal header cells (lighter gradient tier → flat token per the flag).
        · th "Weighted (x, y)" — inline gold gradient background; contains the block "derived" sub-label span. Internal computed header (deeper tier → token).
        · th "Relationship" — inline gold gradient background. Internal computed header.
      · tbody → tr ×N (one per stakeholder):
        · td.sh-cell.sh-cell-link — onClick dispatches "open-stakeholder-profile"; title "Open stakeholder"; contains div.sh-cell-name + [only when s.org] div.sh-cell-org + div.sh-cell-meta (the type line). Internal sticky-left name cell, clickable.
        · td per teammate — class .my-col (editable, second sticky column) OR .scoring-cell-ro (read-only, faint wash):
          · editable: div.xy-input — span.lbl "x" + span.xy-field (input type=number min -10 max 10 step 1 + span.xy-spin holding button.xy-spin-btn up (Icon chevronUp, aria-label "Increase x") and button.xy-spin-btn down (Icon chevron, aria-label "Decrease x")) + the identical span.lbl "y" / span.xy-field / span.xy-spin trio for y. Mapping: 2× ui-text-field (number) + 4× ui-icon-button steppers (tabIndex -1) inside the cell template (geometry per EXACT CELL GEOMETRY).
          · read-only: div.xy-readonly (title "{name}'s score" → ui-tooltip) — 2× span.xy-readonly-pair, each span.xy-readonly-k ("x"/"y") + span.xy-readonly-v (value). Mapping: tokened static text (geometry per EXACT READ-ONLY GEOMETRY).
        · td.computed — two inline-colored spans (pos/neg per axis sign) separated by ",  ". Internal derived cell (fill → token).
        · td (relationship; inline padding 0 12px, background #FBF6E6) — StatusPill. Mapping: ui-chip (zone-tokened) on the derived-fill cell.
  · [conditional addOpen] AddTeammateModal → Fragment: div.modal-veil.show (onClick onCancel; Mapping: ui-dialog scrim) + div.modal (width 380; Mapping: ui-dialog) → div.modal-head (h2 "Add a teammate" + button.btn.btn-ghost close) / div.modal-body → div.login-field (span.lbl "Pick a user" + div.ws-owner-control (inline padding 4px 8px) wrapping UserAutocomplete + span.muted helper). Mapping: ui-autocomplete (UserAutocomplete's internal tree lives in users.jsx — users box) / div.modal-foot (button.btn "Cancel" + button.btn.btn-primary "Add to team").
  · [conditional newShOpen] StakeholderModal (create, the (+) route) — full tree captured in the StakeholderModal box. Mapping: ui-dialog.
  · [conditional lastMemberId] the last-teammate dialog → Fragment: div.modal-veil.show (onClick cancels) + div.modal (inline width 460, max-width calc(100% - 32px)) → div.modal-head (h2 "Last teammate on this workspace" + button.btn.btn-ghost close) / div.modal-body (intro p + label.login-field with span.lbl "Hand off to" + div.designed-select wrapping the select — designed-select is internal to ui-select) / div.modal-foot (inline justify space-between: button.btn.btn-danger "Delete workspace" left + button.btn.btn-primary "Hand off & remove" right). Mapping: ui-dialog + ui-select + ui-button (error / primary).

UX HANDLER CENSUS (every event handler in archive/src/scoring.jsx, enumerated in source order) —
(1) window addEventListener "open-add-teammate" → opens the Add-teammate dialog (the dispatcher-less dead wiring captured in HOW IT OPENS; replaced at rebuild by the real button). (2) team-card remove button onClick → requestRemove(m.id, orderedTeam.length === 1) — routes to the last-teammate dialog when this is the sole member, else removeTeamMember(id). (3) WeightSlider range input onChange → updateTeam(m.id, { weight: Number(value) }) (one instance per card). (4) stakeholder name cell (td.sh-cell-link) onClick → window.dispatchEvent CustomEvent "open-stakeholder-profile" with detail s.id. Editable own-column cell (per cell): (5) x number input onChange → updateScore with clamp(value, -10, 10); (6) x step-up onClick → x+1 clamped; (7) x step-down onClick → x-1 clamped; (8) y number input onChange → clamped; (9) y step-up onClick; (10) y step-down onClick — all six spread the { x: 0, y: 0 } fallback, which is exactly the first-touch-zero-fills mechanic captured in the EDITABLE-CELL RULE. AddTeammateModal: (11) veil onClick → onCancel; (12) head close onClick → onCancel; (13) foot "Cancel" onClick → onCancel; (14) "Add to team" onClick → onAdd(pickedId) (disabled until a user is picked). Last-teammate dialog: (15) veil onClick → clears the pending last-member id (cancel, no removal); (16) head close onClick → same cancel; (17) "Hand off to" select onChange → replacementId; (18) "Delete workspace" onClick → onDeleteWorkspace() then close; (19) "Hand off & remove" onClick → addTeamMember(replacement) + removeTeamMember(last) + close.
Non-DOM wiring (not counted): UserAutocomplete's onChange prop (its own internal handlers live in users.jsx and are counted with the users capture); the embedded StakeholderModal's onCancel/onSubmit (counted in the StakeholderModal box); the addNonceFor === "scoring" effect and the open-add-teammate registration effect (the listener itself is #1).
COUNT: 19 handlers, all accounted — every one was already described in the sections above; the census adds no new behavior.` },
                        { t: "Scoring cadence & re-score reminders — fiscal quarters, unscored detection, the Reminders bot", done: true, d:
`WHY THIS EXISTS — the stakeholder pool can be enormous (potentially hundreds of thousands). A workspace deliberately FOCUSES the team on the limited set of stakeholders with enough influence to impact the brand, operations, or goals at hand. Re-scoring on a fixed cadence keeps each focused set's positions current without asking anyone to score the whole universe.

WHO SCORES, WHERE — scoring happens INSIDE a workspace (never on Master). A workspace's team scores only that workspace's visible stakeholders; the resulting position is written to the stakeholder GLOBALLY (one score-set per stakeholder) and then travels with that stakeholder everywhere — other workspaces, plans, community engagements, any modal about them, and the full stakeholder page. (See the Scoring box for the data model.)

FISCAL CALENDAR (Settings → "Fiscal Calendar" pane; full Settings capture comes with that page) — appConfig.fiscalStartMonth (integer 1-12, default 11 = November) + appConfig.fiscalStartDay (integer 1-31, default 1). Both live in appConfig and are written via updateAppConfig with Number(value). The Settings page as a whole renders ONLY for currentUser.role === "manager", so only managers can change the fiscal anchor (it is page-level gating, not a per-field gate). Exact page copy: section heading "Fiscal Calendar"; intro paragraph "Pick the day your organization's fiscal year begins. Quarters are calculated from that anchor as four equal three-month spans."; field label "Fiscal year starts"; helper under the selects "Organizations often have unique fiscal year start dates."; second column label "Resulting quarters". Controls: a month dropdown listing full month names January..December with values 1..12, and a day dropdown listing 1..31 (the day list is a FIXED 1..31 regardless of month — the oracle lets you pick e.g. February 31; the rebuild should clamp the day options to the chosen month's length). The same two appConfig fields also drive the Community page's fiscal-year budget rollups (captured in the Community box).

QUARTERS PREVIEW — EXACT MATH (QuartersPreview, verified in settings.jsx) — the preview is YEAR-AGNOSTIC pure month/day arithmetic (no Date objects, no year):
- add(m, d, deltaMonths): nm = m + deltaMonths, then while nm > 12 subtract 12 (and while nm < 1 add 12); returns { m: nm, d } with the day UNCHANGED. The code comment claims "clamping when needed" but NO day clamping happens — an anchor like Jan 31 yields a computed quarter start of "Apr 31". Rebuild flag: actually clamp the day to the target month's length.
- For i in 0..3: start = add(month, day, i*3); nextStart = add(month, day, (i+1)*3); end = dayBefore(nextStart). So quarter i starts at anchor + i*3 months on the same day-of-month and ends the day BEFORE the next quarter's start.
- dayBefore({m, d}): if d > 1 return { m, d: d-1 }; else previous month (12 when m is 1) with its last day taken from the fixed table [31,29,31,30,31,30,31,31,30,31,30,31] — February is HARDCODED to 29 (a permanent leap-year assumption). Rebuild flag: compute February's last day properly (28/29 once a year context exists).
- Labels: "Q" + (i+1), i.e. Q1..Q4. Range string: "{MMM} {d} → {MMM} {d}" using short month names Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec (e.g. default anchor Nov 1 → "Nov 1 → Jan 31"). Rendered as the quarters-list — EXACT ORACLE LAYOUT (values, not labels): a TWO-COLUMN grid (grid-template-columns 1fr 1fr, gap 6px, margin-top 2px) of four bordered CHIP CARDS in a 2×2 arrangement — NOT a vertical list. Each quarter-row is a baseline-aligned flex row (gap 8px), padding 6px 10px, background var(--bg-2), 1px solid var(--rule-2) border, border-radius 6px, font-size 12px, holding a quarter-label span — ACCENT-colored, 11px, weight 600 (oracle mono face var(--mono); the type law forbids mono — forward-design substitution, flagged: Inter with tabular numerals) — and a quarter-range span in ink-2 (also oracle-mono → Inter tnum). All card/label values → --ui-sys-* tokens. Recomputes live as the selects change.
- Default anchor Nov 1 produces: Q1 Nov 1 → Jan 31 · Q2 Feb 1 → Apr 30 · Q3 May 1 → Jul 31 · Q4 Aug 1 → Oct 31. Cross-verified: the three seeded stakeholders with history (sh-01, sh-06, sh-12) carry snapshots recordedAt 2026-01-31, 2026-04-30, 2026-07-31 — exactly those quarter ends.
- FY LABEL CONVENTION (flag: convention only, not code) — snapshot tags like "FY26 Q1" exist ONLY in seed data; NO client code composes a "FY## Q#" string anywhere. Seed-implied rule the rebuild must implement: fiscal year number = the calendar year in which the fiscal year ENDS (Nov 2025 – Oct 2026 = FY26, so the Q1 ending 2026-01-31 is tagged "FY26 Q1").

UNSCORED DETECTION (live, client-side, VERIFIED REAL in app.jsx) — currentTeamMember = team.find(m => m.userId === currentUser.id) (users map to team members via teamMember.userId). isUnscoredBy(stakeholderId, teamMemberId): returns false if teamMemberId is falsy; else sc = (scores[stakeholderId] || {})[teamMemberId] and the result is !sc. Consequences: a saved score record — including a deliberate (0,0) — counts as SCORED (the record object is truthy); a never-touched cell has no record and counts as UNSCORED (consistent with "unscored != (0,0)"); a user with no matching team-member row sees zero unscored everywhere. unscoredCount = stakeholders.filter(s => isUnscoredBy(s.id, currentTeamMember.id)).length, memoized on [stakeholders, scores, currentTeamMember]. SCOPE FLAG (verified): it filters the GLOBAL stakeholders array, not the workspace-visible subset — the oracle's comment says "across all open workspaces" and that is what the code does: every stakeholder in the org counts, regardless of the active workspace.

WHERE THE COUNT SURFACES (three real surfaces + one buggy sibling):
1. Scoring nav tab — rendered only when the tab id is "scoring" AND unscoredCount > 0: a count-alert badge showing the raw number, inline after the tab's icon + label. EXACT count-alert style: accent background with near-paper #FAF8F2 ink — and the oracle forces BOTH with !important overrides (.count-alert { background: var(--accent) !important; color: #FAF8F2 !important }). FORBIDDEN-PATTERN NOTE, do not replicate: the rebuild's badge owns these colors as its own tokened alert tone; !important never appears.
2. Messages icon button (right end of the nav-tabs row, toggles the messaging sidebar) — a msg-badge showing unreadCount. EXACT badge style: an accent-filled pill with #FAF8F2 numerals — min-width 16px, height 16px, padding 0 4px, 9.5px weight-600 numerals (oracle sets them in the mono face var(--mono); type law forbids mono — forward-design substitution, flagged: Inter with tabular numerals), border-radius 999px, line-height 1, pointer-events none, absolutely positioned overlapping the icon's top-right corner at top -4px / right -4px. VERIFIED FAKE-ISH: unreadCount = unscoredCount > 0 ? unscoredCount : 0, which is literally just unscoredCount (the ternary is dead code); the oracle comment claims "system pending + actual message count" but NO per-message or per-conversation read tracking exists anywhere client-side. DO-NOT-REPLICATE: the rebuild needs real read/unread state per conversation (backend-persisted), with the system conversation's unread contribution being the live unscoredCount.
3. Reminders conversation row subtitle (messaging list) — copy: "{n} stakeholder needs scoring" / "{n} stakeholders need scoring" (plural on n != 1... verified oracle pluralizes the noun only: "1 stakeholder need scoring" — the verb is not conjugated, a copy bug; rebuild: "needs" when singular) when pending > 0, else "All caught up". CRITICAL DIVERGENCE (verified in messaging.jsx): the "pending" number here is NOT unscoredCount — it is (messages["c-system"] || []).filter(m => m.kind === "scoring-needed").length, i.e. the LIFETIME count of scoring-needed messages ever posted. It never decreases when stakeholders get scored and never clears on read, so the nav badge and the Reminders row can show DIFFERENT numbers indefinitely. ACCURATE DESIGN / POOR CODE: the design intent is one live number; the rebuild must drive both the subtitle and the row's pending chip from the same live unscoredCount (plus real read state), never from a raw message count.
4. workHQ "Need your score" card (intel.jsx; that page has its own box) — computes its own needsScore = stakeholders.filter(s => !((scores[s.id] || {})[currentUser.id])). VERIFIED BUG: it indexes scores by USER id instead of TEAM-MEMBER id, so it disagrees with unscoredCount whenever the ids differ (they always do in seed: tm-* vs u-*) and typically reports everything unscored. Empty-state copy: "You're caught up on scoring". DO-NOT-REPLICATE: one canonical isUnscoredBy keyed by team-member id, used by every surface.
Related but DIFFERENT (do not conflate): the Lists table computes per-row _unscored = team.length > 0 && !team.some(m => teamScores[m.id]) — "unscored by EVERYONE", used only to sort unscored rows first (see the Lists box). The cadence surfaces above are per-CURRENT-USER.

THE REMINDERS BOT (verified in data.js / app.jsx / messaging.jsx) — a system user, exact seed record: { id: "u-system", name: "Reminders", title: "Automated reminders", email: "noreply@hp.com", avatarColor: "#1F1A14", presence: "online", role: "system" }. BRANDING FLAG: the email is a legacy "hp.com" remnant — rebuild uses a neutral noreply address for the product. role "system" is the exclusion key, verified at every filter site: excluded from the Settings roles table, from new-conversation people pickers, and from owner pickers (all filter u.role !== "system"); despite seed presence "online" it never shows in presence lists because those lists are built from the already-filtered user sets.
- The system CONVERSATION, exact seed record: { id: "c-system", kind: "system", participants: ["u-system" plus every non-system user], title: "Reminders" }. conversationTitle returns the literal "Reminders" for kind "system" before any other rule. The conversation list sort PINS the system conversation first always; all other conversations sort by their latest message's ISO timestamp descending (string localeCompare; a conversation with no messages sorts as "0", i.e. last).
- List-row rendering of the system conversation — EXACT system style (values, not a label): the row (conv-row.system) carries a faint dark-ink wash, background rgba(31,26,20,0.03), deepening to rgba(31,26,20,0.08) on hover (→ --ui-sys-* tokens). The avatar slot shows a 28x28 system avatar (font-size 11) with ACCENT background and near-paper #FAF8F2 glyph ink, containing the sparkle brand glyph (NOT a user photo/initials avatar) — the oracle forces the colors with !important (.av-system { background: var(--accent) !important; color: #FAF8F2 !important }); FORBIDDEN-PATTERN NOTE, do not replicate: the rebuild expresses the system-avatar colors as that avatar variant's own tokened style. The trailing slot shows the pending count chip when pending > 0 — an accent-filled pill with #FAF8F2 text, 10px, padding 1px 6px, border-radius 999px (oracle mono face — same Inter/tabular-numerals substitution flag as the badges) — otherwise the last message's time (today → "h:mm AM/PM", else "MMM d"); the subtitle is the pending/caught-up copy from surface 3 above.
- THE ONE REAL TRIGGER (verified — the only one that exists): addStakeholder (app.jsx), immediately after inserting the new stakeholder, unconditionally appends to messages["c-system"] the message { id: uid("m"), from: "u-system", body: text, at: new Date().toISOString(), kind: "scoring-needed" } where text = "New stakeholder added: {name} ({type}). Please score them on the Scoring tab." It fires on EVERY add path (manual add, import), one message per stakeholder, posted globally to the single org-wide system thread (not per-workspace). kind "scoring-needed" is the ONLY message kind ever set; ordinary user messages carry no kind field.
- Thread rendering: system messages render as ordinary thread messages (author name "Reminders", avatar, timestamp; consecutive messages from the same author within 60 seconds group under one header). VERIFIED QUIRK: the composer (placeholder "Reply…") renders on the system conversation too — the oracle lets users type replies INTO the Reminders thread, and nothing consumes them. Rebuild decision (settle at the Messaging box): recommended is a read-only/no-reply system thread; capturing here that the oracle permits replies.

QUARTERLY RE-SCORE CYCLE — the design: at each quarter close (per the fiscal anchor above), (1) snapshot each stakeholder's current weighted position into stakeholder.history as { quarter: "FY## Q#", x, y, recordedAt: "YYYY-MM-DD" } — these snapshots are exactly what the Map's history trail draws — and (2) notify the relevant workspace's team members via the Reminders bot to re-score that workspace's stakeholders for the new quarter.
LIVE vs DEFERRED, stated honestly (verified against the oracle):
- REAL NOW, client-side: the unscored detection, the Reminders bot + its new-stakeholder trigger, the fiscal anchor settings, and the quarters-preview math — all exist and work as specified above.
- NOT REAL ANYWHERE CLIENT-SIDE (verified): NO code in archive/src ever WRITES stakeholder.history (app.jsx contains zero references to history); the only history data is the three seeded stakeholders (sh-01, sh-06, sh-12), each with FY26 Q1/Q2/Q3 snapshots whose recordedAt dates match the default anchor's quarter ends. There is also NO quarter-close message: "scoring-needed" on stakeholder-add is the only system message the client ever posts.
- THEREFORE: the AUTOMATED quarter-rollover job — take the snapshot at quarter close, then post the bulk re-score prompt to the Reminders thread — is a BACKEND DELIVERABLE (scheduled job; see the backend capture / BACKEND_TODO). It is driven entirely by the stored fiscal anchor, not invented. DO NOT fake it client-side in the rebuild; the client's obligations are exactly: render history (Map trail), expose and edit the anchor (Settings), show live unscored state, and display whatever the bot posts.

CANONICAL UI BUILD MAP (Canonical UI design system — ui-* components per design-system/manifest.json; no md-*, no shadcn, no Tailwind, ever):
- Fiscal controls (on the manager-gated Settings page): month = ui-select (props label "Fiscal year starts", value = fiscalStartMonth as string) with 12 ui-option children January..December (values "1".."12"); day = a second ui-select (value = fiscalStartDay as string) with ui-option children for the chosen month's valid days (rebuild improvement over the oracle's fixed 1-31). Helper copy ("Organizations often have unique fiscal year start dates.") as the field's supporting text. On change → updateAppConfig with the numeric value; the preview recomputes live.
- Quarters preview — RECOMPOSITION RULING REQUIRED (explicit, never silent): the oracle is NOT a vertical list — it is the 2×2 grid of bordered chip cards with accent quarter-labels captured exactly in QUARTERS PREVIEW above. Two legal mappings: (a) keep the oracle 2×2 card layout as a token-driven composition (card surface/outline, radius, accent-label, and range-ink values above as its --ui-sys-* token start-state), or (b) recompose as a ui-list (non-interactive) with four ui-list-item rows — headline slot "Q1".."Q4", trailing slot the range string ("Nov 1 → Jan 31"). Option (b) is a DELIBERATE layout change from the oracle — CONFIRM THE CHOICE WITH THE USER AT SEAL TIME; either way the oracle values are the recorded start-state and the surface is styled solely by --ui-sys-* tokens.
- Count badges: GAP — the manifest ships NO badge component. Build ui-badge INTO design-system/ to the ui-button quality bar and register it in manifest.json, with the oracle values above as its TOKEN START-STATE: a numeric-count pill, ~16px tall (min-width 16px, padding 0 4px), 9.5-10px weight-600 tabular numerals (Inter — never the oracle's mono), border-radius 999px; alert tone = accent surface with #FAF8F2 ink (e.g. --ui-sys-badge-alert-surface / --ui-sys-badge-alert-ink) plus a neutral tone; an overlap placement mode pinning it to the host's top-right corner at -4px/-4px; non-interactive (pointer-events none). THEN compose it: (a) on the Scoring nav item (ui-nav-rail's ui-nav-item, or ui-tabs' ui-tab, per the final shell) showing live unscoredCount when > 0; (b) on the Messages ui-icon-button (variant standard, ui-icon "chat" ligature) showing the real unread count; (c) as the trailing pending chip on the Reminders conversation row. Never a hand-rolled span, never !important.
- Reminders surfaces (inside Messaging; full Messaging capture in its own box): conversation list = ui-list (interactive) of ui-list-item rows — leading slot: the system avatar (accent surface, #FAF8F2 glyph ink → tokens) with the sparkle glyph via ui-icon; headline: "Reminders"; supporting text: the live "{n} stakeholders need scoring" / "All caught up" subtitle; trailing: ui-badge count (or the time text when zero); the row itself carries the system-row wash tokens (rgba(31,26,20,.03) resting / .08 hover → --ui-sys-* tokens). The thread itself renders system messages as standard message rows within the Messaging composition (ui-list-based thread per the Messaging box); the system thread ships read-only pending the Messaging-box decision.
- All icons are Material Symbols ligatures via ui-icon; every color/size in these surfaces comes from --ui-sys-* tokens (zone/alert tones included) — no inline literals, no component-stylesheet overrides.` },
                                          { t: "Map — coordinate→pixel translation, dots, zones, read-only positions, history trail, scorecard", done: true, d:
`WHAT IT IS — the Map is the visual face of the Relationship engine: a 4-column x 6-row zone grid with one DOT per (visible) stakeholder, positioned by that stakeholder's weighted (x, y). It is READ-ONLY: it displays positions; it does NOT edit them. All scoring/rescoring happens on the Scoring page (per the quarterly cadence); the Map simply reflects the resulting weighted positions. (The old build allowed dragging a dot to rewrite everyone's scores — that drag-to-rescore behavior is REMOVED.) Rows = the same workspace-filtered visibleStakeholders as everywhere else; team + scores are global (see Scoring). Unlike Scoring, the Map IS available on Master (it is the org-wide overview Master redirects Scoring to). Each row precomputes _x/_y = weightedCoord(s.id, scores, team) and _status = statusFor(_x, _y).

THE COORDINATE -> PIXEL TRANSLATION (this is the heart of "positioned correctly"):
coordToPct(x, y): left% = ((x + 10) / 20) * 100 ; top% = ((10 - y) / 20) * 100. So the dot is absolutely positioned inside the dots-layer at that left/top percentage. Consequences of the formula: x = -10 -> left 0% (far left), x = +10 -> left 100% (far right); y = +10 -> top 0% (TOP), y = -10 -> top 100% (BOTTOM). i.e. POSITIVE Y RENDERS UPWARD, positive X rightward. The (0,0) origin sits at dead-centre (50%, 50%).
The dots-layer spans exactly the grid area, so 0%..100% maps linearly to the -10..10 axis on both axes; the grid, the dots, and the axis ticks therefore share one coordinate space. Dragging is removed, but the inverse pctToCoord still exists for any future drag (rounds to .25: Math.round(v*4)/4).

THE PLOT AREA (map-grid-area) — the box everything above shares: width 92% of the stage, max-width 920px, centered (margin-inline auto), flex 1 with position relative and min-height 0. The x-tick row and the under-stage legend strip repeat the SAME 92% / 920px / centered constraint, so grid, ticks and legend stay column-aligned at every window size.

THE ZONE GRID — render D.GRID (6 rows x 4 cols) as cells (zone class); each cell's background = STATUSES[status].color, text = STATUSES[status].text. The 24 cells tile the plane in the boundary order from the Relationship engine (cols by X_BOUNDS, rows by Y_BOUNDS). GRID CHROME (exact): the grid box (map-grid, absolutely inset over the plot area; grid-template-columns 1fr 1fr 1fr 1fr; grid-template-rows 2fr 1fr 1fr 1fr 1fr 2fr; gap 0) has a 1px solid var(--ink-2) OUTER border (→ the strong-outline token). Each cell draws 1px rgba(0,0,0,.18) hairline dividers on its RIGHT and BOTTOM edges only, removed on the last column (nth-child(4n) drops border-right) and on the last row (nth-last-child(-n+4) drops border-bottom) so the internal hairlines never double the outer border. Cells: border-radius 0, padding 8px 10px, content anchored top-left (flex-start both axes), 11px weight-500 type, overflow hidden. Optional per-cell: a zone LABEL (zone-label, the status name, shown when showZoneLabels) and a COUNT BADGE (zone-count, how many dots fall in that cell, shown when cnt > 0). EXACT count-badge placement and visual: absolutely positioned in the cell's BOTTOM-RIGHT corner — bottom: 8px, right: 10px (NOT centred; centring would collide with zone labels and dots) — 10px numeral text colored rgba(0,0,0,.32) on a translucent light pill: background rgba(255,255,255,.5), border-radius 6px, padding 0 5px, line-height 14px. (The oracle sets the count in the mono face var(--mono); the rebuild's type law forbids mono — use Inter with tabular numerals instead: forward-design, flagged.) EXACT zone-label styling: text-align left, line-height 1.15, letter-spacing 0.01em, opacity 0.78, max-width 100%, word-break break-word, inheriting the cell's 11px / weight-500 type. Cell binning for the count matches statusFor exactly: col = x<-5?0 : x<0?1 : x<5?2 : 3 ; row = y>5?0 : y>2.5?1 : y>0?2 : y>-2.5?3 : y>-5?4 : 5. Counts are aggregated into a map keyed "row,col"; maxCount = Math.max(1, ...all cell counts) (floored at 1 so an empty map never divides by zero).

DENSITY HEATMAP SHADING (mapStyle === "density") — EXACT per-cell fill: each cell's background = color-mix(in oklch, {zoneColor} {20 + t*80}%, #F2EFE7) where zoneColor = STATUSES[status].color and t = cnt / maxCount (this cell's count over the busiest cell's count, maxCount = Math.max(1, ...all cell counts)). So an empty cell (t=0) mixes 20% of its zone color into #F2EFE7 (very dim/neutral); the hottest cell (t=1) mixes 100% zone color (full saturation). FLAG: #F2EFE7 is the density base neutral — it should be referenced as --ui-sys-zone-density-base (that token already exists). The text color stays STATUSES[status].text. In classic/halo styles the cell is just the flat STATUSES[status].color.

AXIS TICKS & LEGEND — y-axis ticks (map-yaxis-ticks / map-ytick) rendered OUTSIDE the grid on the left: [10, 7.5, 5, 2.5, 0, -2.5, -5, -7.5, -10] top-to-bottom, in an 18px-wide strip positioned 22px left of the grid (left -22px), items right-aligned; each tick is a ZERO-HEIGHT flex item in a space-between column, which places every tick's CENTER exactly at 0%, 12.5%, ..., 100% of the plot height — so ticks line up with the score axis by construction. x-axis ticks (map-xaxis-ticks / map-xtick) BELOW the grid: every integer -10..10 (21 ticks, Array.from length 21 mapped i-10) left-to-right, margin-top 6px, the row sharing the plot's 92% / 920px centered width; each tick a ZERO-WIDTH flex item in a space-between row, centering every tick at 0%, 5%, ..., 100% of the plot width. EXACT tick text (both axes): 9px, line-height 1, var(--ink-mute), white-space nowrap, tabular numerals via font-variant-numeric (the oracle also sets the mono face — same forward-design substitution as the zone-count: Inter with tabular numerals, since the type law forbids mono). Under-stage legend strip (map-axis-legend, inline marginTop 14, width 92% capped 920, centered) — a BORDERED CARD, not bare label text (exact values, → --ui-sys-* tokens): display grid, grid-template-columns 1fr auto 1fr (the three spans justified start / center / end), align-items center, padding 8px 16px, 1px solid var(--rule) border, border-radius 10px, background var(--paper-2), 11px uppercase text with 0.08em letter-spacing in ink-3. Copy: left "← Works against you", centre "↑ Greater community influence  ·  ↓ Less community influence", right "Works with you →". Each ARROW glyph sits in a strong element with a deliberate emphasis treatment: font-weight 400 (NOT bold), color var(--ink-2), -webkit-text-stroke 0.7px var(--ink-2) (stroke-thickened, not weight-bolded), font-size 12px. (The same map-axis-legend card styling is shared with the Help page.) So the human-readable meaning: X = works-against <-> works-with-you (alignment/support); Y = community influence/importance (down = less, up = more). THE CENTRE CROSS (axis-lines overlay — exact, not a label): a pointer-events-none layer spanning the grid (z-index above the zone cells, below the dots) whose two pseudo-lines are 1px thick and colored rgba(0,0,0,.18) — the SAME hairline value as the cell dividers: a vertical line at left 50% running full height (width 1px) and a horizontal line at top 50% running full width (height 1px), marking the x=0 / y=0 axes.

THE DOT — absolutely positioned via coordToPct(_x, _y), inside the dots-layer. Structure: an outer .dot (gains "selected" when selectedId === id, "dragging" while dragged) positioned by left/top, with inline color = zone color (STATUSES[status].color — this inline color is what the halo's currentColor resolves to); an inner circular marker (dot-inner) sized dotSize×dotSize px with background = zone color, color = zone text, and a 2px SOLID border — the ring WIDTH is always 2px; its COLOR is borderColor = isSel ? var(--accent) : (zone.border || zone.text). Hover OR selected scales the inner marker 1.18× (transition transform .12s ease); selected additionally gets border-color var(--accent) plus a 3px soft accent ring shadow rgba(181,85,44,.2) over the resting 0 1px 3px rgba(0,0,0,.18) drop shadow (shadows subject to the open shadow-token decision at the Design step). Shows the stakeholder's 2-letter INITIALS only when dotSize >= 22 (abbrev(name): strip honorific prefixes Mayor/Rep./Sen./Dr./Mr./Ms./Mrs., then first+last initial, or first two letters of a single name); below 22 the inner is blank. EXACT initials type: 9.5px, weight 600, in the oracle's mono face var(--mono) — same flagged forward-design substitution as the zone-count: Inter with tabular numerals (the type law forbids mono). A text LABEL (dot-label, the name) shows when showLabels is on OR the dot is selected — exact: positioned below the dot (top 100%, centered via translateX(-50%), margin-top 4px), 10.5px text on a translucent paper pill (background rgba(250,248,242,.92), 1px var(--rule-2) border, padding 1px 5px, radius 4px), white-space nowrap, max-width 160px with ellipsis, pointer-events none. Hover tooltip (title): "{name} · {status} · ({_x.toFixed(1)}, {_y.toFixed(1)})". Interactions (read-only — no dragging): pointer-down / single click = select via wrapSelect (sets selectedId, forces detailOpen true, turns history mode OFF); double-click = openDetail(id) (open the full stakeholder profile).
• HALO ring (mapStyle === "halo") — each dot renders an extra .dot-halo element around the inner marker. THIS IS THE DEFAULT MAP LOOK (TWEAK_DEFAULTS ships mapStyle: "halo"), so its exact visual must be reproducible cold: the element is circular (border-radius 50%), absolutely positioned with inline inset = -(dotSize * 0.8)px on all four sides (this inline value overrides the stylesheet default inset of -10px), background = radial-gradient(circle, currentColor 0%, transparent 70%) — where currentColor resolves to the ZONE COLOR because the outer .dot carries inline color = STATUSES[status].color — opacity 0.35, pointer-events none (the halo never intercepts clicks; the dot beneath stays clickable). Net effect: a soft round glow in the dot's zone color, full color at the centre fading to transparent at 70% of the radius, extending 0.8× the dot's size beyond it. Present only in halo style. ⚠ DESIGN-LAW CONFLICT FLAG: this radial-gradient is the ONE gradient in the oracle and collides with the design start-state rule "no gradients ever." The rebuild must neither silently keep it nor silently drop it — record an explicit decision with the user at the Design-page step: e.g. a tokened translucent SOLID ring in the zone color at ~0.35 opacity, or a sanctioned single --ui-sys-zone-halo token as the one exception. Until that decision is recorded, this box captures the oracle behavior verbatim as above.

HISTORY / MOVEMENT OVER TIME — a stakeholder carries history: an array of past snapshots, each { quarter, x, y, recordedAt } (e.g. { quarter: "FY26 Q1", x: 1, y: 6, recordedAt: "2026-01-31" }), produced by the quarterly re-score cycle (see the Cadence box). The scorecard shows a "Show history" toggle only when history is non-empty. detailOpen and historyMode are local Map state; historyMode defaults false. In HISTORY MODE: all other dots hide (only the selected stakeholder's current dot renders); the selected stakeholder shows one dashed "history dot" per snapshot plus a dashed TRAIL through the snapshots ending at the current position. Selecting any dot exits history mode (wrapSelect sets historyMode false). The toggle button (map-history-btn, gains "active" in history mode) shows a clock icon and "Show history" / "Exit history"; its hover tooltip (title attribute) = "Exit history view" when in history mode, else "View this stakeholder's historic positions". EXACT BUTTON CHROME (values, → tokens): an inline-flex pill — align center, gap 6px, margin 6px 0 8px, padding 4px 10px, font-size 11px, transparent background, 1px solid var(--rule) border, border-radius 999px, ink-2 text; HOVER → accent border + accent text; ACTIVE (history mode) → accent-FILLED background with #FAF8F2 ink and accent border.
• HISTORY TRAIL SVG (EXACT) — a .trail-svg <svg> with viewBox "0 0 100 100" and preserveAspectRatio="none". It draws one <path> through points = [...selected.history, { x: selected._x, y: selected._y }] (every snapshot then the current live position). For each point cx = ((x + 10) / 20) * 100 and cy = ((10 - y) / 20) * 100 (the same transform as coordToPct, expressed in the 0..100 viewBox); the path string is built "M{cx},{cy}" for the first point and "L{cx},{cy}" for the rest, joined by spaces. Path attributes: stroke = var(--accent), strokeWidth = "0.35", strokeDasharray = "1.2,1.2", fill = "none", vectorEffect = "non-scaling-stroke" (so the dash/width stay crisp regardless of the SVG's rendered size). Drawn only when historyMode && selected && selected.history.length > 0.
• HISTORY DOT (EXACT) — for each snapshot h, a .dot.history-dot positioned via coordToPct(h.x, h.y) (left/top), with title "{h.quarter}: ({h.x}, {h.y})". Its inner marker (dot-inner) is 14×14 px, background var(--paper), color var(--ink-3), borderColor var(--ink-mute), borderStyle dashed, with empty content. A dot-label beneath shows h.quarter on a var(--paper) background. DO-NOT-REPLICATE NOTE: the oracle enforces the dashed border and kills the drop shadow via a stylesheet patch with !important (.history-dot .dot-inner { border-style: dashed !important; box-shadow: none !important }); the rebuild expresses dashed-border/no-shadow as the history-dot's own tokened style — !important is forbidden.

THE SCORECARD (right rail, .detail) — a collapsible detail panel. LAYOUT (exact): the Map page is a two-column grid (map-wrap, grid-template-columns 1fr 320px) — the scorecard rail is EXACTLY 320px wide when open — collapsing to grid-template-columns 1fr 0 (rail width 0) when detailOpen is false. It DEFAULTS OPEN: the Map's detailOpen state initializes to true, so the scorecard shows immediately on first load. When the user closes it, detailOpen becomes false and the whole rail collapses; a single thin REOPEN tab (.map-detail-reopen) appears — 24px wide × 36px tall, absolutely positioned at top 16px / right 0 (hugging the viewport edge), border-radius 6px 0 0 6px (rounded on its left edge only), 1px var(--rule) border with the right border removed, paper background, ink-3 glyph, hover → ink glyph on var(--bg-2) — showing a chevron-left icon, title "Reopen scorecard", aria-label "Open scorecard"; clicking it sets detailOpen back to true. Selecting a dot also forces it open (wrapSelect).
• EMPTY STATE (no selected stakeholder): a "Scorecard" header label + a close (×) ui-icon-button (title "Hide scorecard panel"); a prompt "Click any dot on the map to see details, or drag a dot to move it." — NOTE: the ", or drag a dot to move it" clause is STALE under this box's read-only ruling (dragging is REMOVED); the rebuilt prompt drops the drag clause and reads "Click any dot on the map to see details."; a "Recently scored" caption; then a shortlist of the first six stakeholders (stakeholders.slice(0,6)) each as a left-aligned ghost button "{name} - {type}" that selects that stakeholder.
• SELECTED STATE: the "Scorecard" header + close button; displayName(stakeholder) || stakeholder.name as the title; org sub-line (.det-org); optional "Visit Website" link (.det-website, href = normalizeUrl(stakeholder.url), opens in a new tab) when url present; the history toggle (map-history-btn) shown only if history is non-empty; a status-pill-row with a large StatusPill (size "lg") plus the live "({_x.toFixed(1)}, {_y.toFixed(1)})"; a STRATEGY card colored by the zone (background = zone.color, color = zone.text, radius 8) showing an uppercase "Strategy" caption, zone.strategy (bold), and zone.action; then metadata rows (.detail-row, k/v) — Category, Type, Market, Region, Geography, Issues (as .tag chips or "-" muted), Priority (PriorityPill), Owner (OwnersDisplay avatars size 22), Last contact, Status (StatusDot), Tags (Tags); and the LATEST NOTE (.detail-latest-note): newest of notesHistory sorted by .at descending, falling back to the plain notes field ({ body: notes, at: lastContact, by: null }); shows an uppercase "Latest note" caption + its formatted date (toLocaleDateString month short / day numeric / year numeric) + the note body. Renders nothing if there is no note.
• SCORECARD CHROME (exact rail-interior values, previously label-only — every value below becomes a --ui-sys-* token in the ui-inspector composition's start-state): the rail (.detail) is background var(--bg-2) with a 1px var(--rule) LEFT border, padding 14px 16px, overflow auto (a container surface — sidebars never white, per the design law). The "Scorecard" header row (detail-head-row): flex space-between center-aligned, margin -4px 0 8px, padding-bottom 6px, 1px var(--rule-2) BOTTOM rule, 10px uppercase 0.08em ink-3. Title h3: title-face (oracle var(--serif) → the Newsreader title token) 16px weight 500, letter-spacing -0.005em, margin 0 0 4px. Org sub-line (det-org): 12px ink-3, margin-bottom 10px. Website link (det-website): accent, 12px, no underline, underline on hover. Metadata rows (detail-row): a two-column grid with grid-template-columns 86px 1fr (the exact k/v ratio), gap 4px, padding 6px 0, font-size 12px; each row separated by a 1px var(--rule-2) TOP rule, with the FIRST row ruleless (first-of-type border-top 0); the k cell 11px uppercase 0.08em ink-3 with 1px top padding; the v cell ink-2. LATEST-NOTE card (detail-latest-note): margin-top 14px, padding 10px 12px, background var(--bg-2), 1px solid var(--rule-2) border, border-radius 8px; its head row (detail-latest-note-head) flex space-between baseline-aligned with margin-bottom 6px; its body (detail-latest-note-body) 12.5px, line-height 1.5, ink-2, white-space pre-wrap, word-break break-word. (The history toggle's resting/hover/active chrome is the EXACT BUTTON CHROME in the history section above.)

DISPLAY OPTIONS (from the old Tweaks panel; in the rebuild these become Canonical UI Settings/Design controls, not ad-hoc): mapStyle = classic | halo | density (density shades each cell by count via the color-mix toward #F2EFE7 detailed above; halo adds the -(dotSize*0.8)px radial-gradient ring around each dot per the HALO bullet). showLabels (always show dot names); showZoneLabels (show zone names in cells); dotSize (px; slider range 14–36 step 2; initials appear at >= 22). SHIPPED DEFAULTS (TWEAK_DEFAULTS): mapStyle "halo" (halo IS the default map look), showLabels false, showZoneLabels true, dotSize 22 (so initials show by default). These are presentational only and never change positions or scores.

CANONICAL-UI BUILD MAP (Canonical UI design system — the plot is the domain ui-stakeholder-map component; it ships NO chart primitive, so the plot is hand-built with inline SVG + HTML INSIDE that component — sanctioned inline SVG — styled SOLELY with --ui-sys-* tokens; the resize-proof proportional approach from the old build is reproduced on purpose).
• Stage: a tokened surface container holding the plot area — EXACT ORACLE VALUES (the stage's token start-state): position relative, padding 28px 14px 14px 18px (asymmetric: deep top clearance, wider left edge for the y-tick strip), background var(--paper-2) (the plot runway surface), flex column with min-width 0 / min-height 0, overflow hidden. The plot area is a proportional box (width 92%, max-width 920px, centered, min-0 flex parents) so it scales cleanly on resize — exactly the invariants that made the old map never break; the x-tick row and legend strip share the same 92%/920px centered constraint.
• Coordinate space: implement coordToPct directly — left% = ((x+10)/20)*100, top% = ((10-y)/20)*100 (positive y renders UP, origin centre). The zone grid, dots, ticks, and trail all share this one transform.
• Zone grid (behind the points): either a CSS grid encoding the non-uniform bands as fr ratios (columns 1fr 1fr 1fr 1fr; rows 2fr 1fr 1fr 1fr 1fr 2fr = the 5/2.5/2.5/2.5/2.5/5 heights) OR 24 inline-SVG rects placed from the X_BOUNDS/Y_BOUNDS pairs; each cell filled with STATUSES[status].color via a CSS custom property (no inline literals, no !important). GRID CHROME as tokens: the 1px strong-outline outer border (oracle var(--ink-2)); the internal 1px hairline dividers (oracle rgba(0,0,0,.18)) on each cell's right+bottom with the last-column/last-row removals; the centre-cross overlay as two 1px lines in the same hairline token at left 50% / top 50%, pointer-events none, above zones and below dots. Density style applies the color-mix(in oklch, {zoneColor} {20+t*80}%, var(--ui-sys-zone-density-base)) fill. Zone label = tokened label text (left-aligned, ~0.78-opacity ink, wraps within the cell). Cell count = a small tokened pill badge anchored at the cell's BOTTOM-RIGHT corner — oracle-exact: 8px from bottom, 10px from right; 10px numeral text on a translucent light pill (the rgba(255,255,255,.5) background, radius 6px, padding 0 5px, line-height 14px — expressed via --ui-sys-* tokens, e.g. a zone-count surface token, never inline literals) — NOT at the cell centre. Numerals in Inter with tabular numerals, not mono (forward-design: the type law forbids the oracle's mono face).
• Dots: absolutely-positioned elements at coordToPct(_x,_y), translate(-50%,-50%) to centre on the point; each a circle filled with the zone color, outlined with a 2px SOLID ring colored zone.border||zone.text (accent token when selected), showing 2-letter initials (abbrev) at dotSize >= 22 — initials 9.5px, weight 600, Inter with tabular numerals (the flagged mono substitution); name label when labels on or selected (the tokened below-dot pill described above). Halo style (the shipped DEFAULT) adds the dot-halo ring at inline inset -(dotSize*0.8)px: circular, background radial-gradient(circle, currentColor 0%, transparent 70%) with currentColor = the zone color carried on the dot element, opacity 0.35, pointer-events none — implementation subject to the recorded gradient decision (see the DESIGN-LAW CONFLICT FLAG in the HALO bullet: tokened translucent solid ring vs a sanctioned zone-halo exception; decide at the Design step, never invent silently). Single click → select + open scorecard + exit history; double-click → open full profile. READ-ONLY (no dragging).
• Tooltip: ui-tooltip rendering "{name} · {status} · ({_x.toFixed(1)}, {_y.toFixed(1)})".
• Axis ticks: y ticks [10,7.5,5,2.5,0,-2.5,-5,-7.5,-10] outside the plot left (zero-height space-between flex items in the 18px strip 22px left of the grid); x ticks every integer -10..10 below (zero-width space-between items sharing the plot's 92%/920px width) — tick text 9px, muted-ink token (oracle var(--ink-mute)), tabular numerals in Inter, positioned by the same transform.
• History trail: inline-SVG dashed path (sanctioned inside ui-stakeholder-map) — viewBox "0 0 100 100", preserveAspectRatio none, through cx=((x+10)/20)*100 / cy=((10-y)/20)*100 of [...history, current], stroke var(--accent), strokeWidth 0.35, strokeDasharray "1.2,1.2", vectorEffect non-scaling-stroke; plus dashed 14×14 history-dot circles (paper bg, ink-3 text, ink-mute dashed border — expressed as the component's own tokened style, no !important patches) labelled by quarter; shown only in history mode (selected stakeholder only).
• Axis legend strip (under the stage): the tokened legend CARD per the AXIS TICKS & LEGEND values — the 1fr auto 1fr grid, 8px 16px padding, 1px outline-token border, radius 10, paper-2 surface token, 11px caps 0.08em ink-3 text, with the strong-arrow treatment (weight 400, ink-2, 0.7px text-stroke, 12px) — holding the three copy spans ("← Works against you", "↑ Greater community influence · ↓ Less community influence", "Works with you →"). Never bare label text; every value a --ui-sys-* token.
• Scorecard (right rail): ui-inspector — the manifest's right-hand detail/inspector panel (design-system/manifest.json: ~320px when open; animates to width 0 / hidden when closed and leaves the tab order; slots title/content/actions; built-in close × emitting close; role=complementary) — which matches the oracle's 320px-open / 0-closed rail exactly; NEVER a hand-rolled side panel (law 1: a component is never reimplemented in markup/CSS). Its interior ships the SCORECARD CHROME token start-state above (bg-2 rail surface with the left rule and 14px 16px padding; the 86px/1fr detail-row ratio with top rules; the caps head-row treatment; the latest-note card; the history-button resting/hover/active values). The ui-inspector's built-in close × replaces the oracle's ad-hoc ghost close button (same "Hide scorecard panel" intent); the collapsed state shows the single reopen ui-icon-button with the chevron-left icon (title "Reopen scorecard") per the oracle's 24×36 edge tab. Inside it: ui-list rows; status as ui-chip (zone-tokened); issues/tags as ui-chip sets; owners as overlapping avatars; "Show history" as a ui-chip filter or ui-button toggle carrying the title copy ("Exit history view" in history mode, else "View this stakeholder's historic positions") via ui-tooltip. Scorecard defaults OPEN (detailOpen=true). Empty state shows the de-staled prompt "Click any dot on the map to see details." and lists six recent stakeholders as ui-button (ghost) rows.
• Display options (mapStyle/showLabels/showZoneLabels/dotSize) come from the Settings/Design controls, read as props, with the shipped defaults above (halo / false / true / 22) — never ad-hoc.
• Selection state lifts to the page so Scoring/Lists/Map share the selected stakeholder.

SKELETON TREE (ORIGINAL-DESIGN STRUCTURE CENSUS, 2026-07-03 — the literal region tree extracted from archive/src/map.jsx, in render order; [brackets] = conditional; the build assembles against THIS tree, never prose) —
div "map-wrap" (+ " detail-closed" when detailOpen is false) — the PAGE CONTAINER: a two-column grid (1fr 320px, collapsing to 1fr 0 when closed). Canonical UI: the page-level layout row — content region beside ui-inspector; token-only container, no visual decisions of its own.
. div "map-stage" (ref stageRef) — the left column, the plot stage (chrome: the EXACT ORACLE VALUES in the build map's Stage bullet — paper-2 runway, 28/14/14/18 padding, flex column, overflow hidden). Canonical UI: the HOST of ui-stakeholder-map — everything nested under it is INTERNAL to ui-stakeholder-map (shadow DOM), never authored as app-side divs.
. . div "map-grid-area" — the proportional plot box (92% width / max 920px / centered / flex 1 / position relative / min-height 0). Internal to ui-stakeholder-map. Children in order:
. . . div "map-yaxis-ticks" — 9 x span "map-ytick" (10, 7.5, 5, 2.5, 0, -2.5, -5, -7.5, -10). Internal to ui-stakeholder-map.
. . . div "map-grid" — the zone grid: D.GRID flatMap to 24 x div "zone" (inline background/color from STATUSES), each containing [span "zone-label" when showZoneLabels] + [span "zone-count" when cnt > 0]. Internal to ui-stakeholder-map.
. . . div "axis-lines" — an EMPTY element; the centre-cross overlay (its two 1px lines are stylesheet pseudo-elements). Internal to ui-stakeholder-map.
. . . div "dots-layer" — the 0-100% coordinate space every dot shares (the oracle's drag math reads ITS bounding rect). Internal to ui-stakeholder-map. Children in order:
. . . . [historyMode AND selected AND history.length > 0] svg "trail-svg" (viewBox "0 0 100 100", preserveAspectRatio "none") containing ONE path — the dashed trail. Sanctioned inline SVG inside ui-stakeholder-map.
. . . . [historyMode AND selected] one div "dot history-dot" PER history snapshot, each containing div "dot-inner" (inline 14x14, paper bg, dashed border) + div "dot-label" (the quarter, paper background).
. . . . one div "dot" per rendered stakeholder (all rows normally; ONLY the selected one in history mode) — gains "selected" / "dragging"; contains, in order: [div "dot-halo" when style is "halo"] + div "dot-inner" (the circular marker) + [div "dot-label" when showLabels OR selected].
. . div "map-xaxis-ticks" — 21 x span "map-xtick" (-10..10). A SIBLING of map-grid-area (below it, inside map-stage). Internal to ui-stakeholder-map.
. . div "map-axis-legend" (inline marginTop 14 / width 92% / maxWidth 920 / centered; the card chrome — 1fr auto 1fr grid, 8px 16px padding, rule border, radius 10, paper-2, 11px caps ink-3 — and the strong-arrow treatment come from the stylesheet per AXIS TICKS & LEGEND) — 3 spans: start "← Works against you" / center "↑ Greater community influence · ↓ Less community influence" / end "Works with you →". Internal to ui-stakeholder-map.
. [detailOpen] MapDetail = div "detail" — the right rail (chrome per SCORECARD CHROME). Canonical UI: ui-inspector (never a hand-rolled panel). TWO mutually exclusive layouts:
. . EMPTY STATE (no selected stakeholder):
. . . div "detail-head-row" — inline-styled strong "Scorecard" (11px caps) + button "btn btn-ghost" close (Icon "close"). Maps to the ui-inspector title slot + its built-in close.
. . . div (ANONYMOUS inline-styled prompt block, padding 30px 12px, centered — absorbed into ui-inspector content as a tokened block): div "Scorecard" (16px) + div "muted" prompt line + div "Recently scored" caption (inline caps) + div (anonymous inline flex column, gap 4) holding SIX button "btn btn-ghost" rows (span name + span "muted" "- {type}") — maps to ui-button (ghost) rows.
. . SELECTED STATE:
. . . div "detail-head-row" — same composition as the empty state.
. . . h3 (displayName || name) · div "det-org" · [ANONYMOUS inline div wrapper > a "det-website" "Visit Website", when url present — absorbed as inspector content].
. . . [button "map-history-btn" (+ " active"), only when history non-empty] — maps to a ui-button toggle (pill chrome + active accent fill per the EXACT BUTTON CHROME values).
. . . div "status-pill-row" — StatusPill (size lg) + span (inline mono style) with the live coords.
. . . div (ANONYMOUS inline zone-colored STRATEGY card — absorbed as a tokened panel inside the inspector): caption div ("Strategy") + strategy div (bold) + action div.
. . . 11 x div "detail-row" (each = div "k" + div "v"), in order: Category, Type, Market, Region, Geography, Issues (v holds an anonymous inline flex-wrap span of span "tag" chips, or span "muted" "-"), Priority (PriorityPill), Owner (OwnersDisplay), Last contact, Status (StatusDot), Tags (Tags). Maps to ui-list rows / ui-chip sets inside ui-inspector.
. . . [div "detail-latest-note", only when a note resolves] — div "detail-latest-note-head" (span caption "Latest note" + [span date stamp]) + div "detail-latest-note-body".
. [NOT detailOpen] button "map-detail-reopen" (Icon "chevron-left", className "ico") — the 24x36 edge reopen tab. Maps to the reopen ui-icon-button.
CLASSNAME ACCOUNTING — every className region in map.jsx appears in the tree above: map-wrap, detail-closed, map-stage, map-grid-area, map-yaxis-ticks, map-ytick, map-grid, zone, zone-label, zone-count, axis-lines, dots-layer, trail-svg, dot, history-dot, dot-inner, dot-label, dot-halo, selected, dragging, map-xaxis-ticks, map-xtick, map-axis-legend, map-detail-reopen, ico, detail, detail-head-row, btn btn-ghost, muted, det-org, det-website, map-history-btn, active, status-pill-row, tag, detail-row, k, v, detail-latest-note, detail-latest-note-head, detail-latest-note-body — NONE dropped. The four ANONYMOUS inline-styled regions (empty-state prompt block + its recent-list column, the website-link wrapper, the strategy card, the Issues chip wrap) are named explicitly above and absorb into ui-inspector content as token-driven composition — never rebuilt as ad-hoc divs. The tree CONFIRMS the box's layout claims (two-column 1fr/320px grid, tick rows as siblings of the plot box, legend inside the stage); no corrections required.

UX HANDLER CENSUS (ORIGINAL-DESIGN UX CENSUS, 2026-07-03 — every event handler in archive/src/map.jsx) —
1. dot onPointerDown → onPointerDown(e, id): guards on stageRef, e.preventDefault(), wrapSelect(id) (select + force scorecard open + exit history mode), then setDragging({ id }). ORACLE-ONLY TAIL: the setDragging arm STARTS a drag; the rebuild keeps only the select, per this box's read-only ruling.
2. dot onDoubleClick → openDetail(r.id) (opens the full stakeholder record).
3. window "pointermove" listener (attached in a useEffect while dragging is truthy) — reads the dots-layer bounding rect, computes leftPct/topPct clamped 0..100, pctToCoord, rounds both axes to .25 (Math.round(v * 4) / 4), calls updateCoordForStakeholder(dragging.id, rx, ry). ORACLE-ONLY: this is the drag-to-rescore write, REMOVED by ruling (captured for losslessness).
4. window "pointerup" listener (same effect) → setDragging(null); both listeners removed on the effect cleanup. ORACLE-ONLY (drag teardown, removed with the drag).
5. reopen tab (map-detail-reopen) onClick → setDetailOpen(true).
6. empty-state close button onClick → onClose (= setDetailOpen(false)).
7. empty-state "Recently scored" row onClick (six rows, one handler shape) → setSelectedId(s.id), which is wrapSelect — select + keep scorecard open + exit history.
8. selected-state close button onClick → onClose (= setDetailOpen(false)).
9. history toggle (map-history-btn) onClick → onToggleHistory (= setHistoryMode(h => !h)).
9 handlers, all accounted — each is described in the box body above (dot select/double-click, scorecard open/close/reopen, recent-list select, history toggle); handlers 1-tail, 3, and 4 are the oracle's drag machinery, captured verbatim and explicitly removed by this box's read-only ruling. DEAD PROP (census correction, for a complete claim): map.jsx passes onOpenFull={() => selected && openDetail(selected.id)} into MapDetail, which destructures the prop and NEVER uses it — dead wiring (no control inside the scorecard invokes it); DO NOT REPLICATE the dead prop (double-click on the dot is the real open-full path). With that recorded, no other bound DOM handlers, listeners, or interactive effects exist in the module (title attributes are tooltips, not handlers; the det-website anchor is a plain href, browser-default navigation).` },
                                    { t: "Lists table — the master stakeholder table (columns · edit mechanism · ui-* composition)", done: true, d:
`WHAT IT IS — the Lists page is the MASTER STAKEHOLDER TABLE: the app's primary data surface (a spreadsheet built from CSS grid, NOT an HTML table element and NOT an MD3 list-detail layout). The SAME SheetView component renders Master (all stakeholders) and each workspace (rows filtered to that workspace via the stakeholderWorkspaces join), and is EMBEDDED elsewhere (record pages). Rows = the workspace-scoped visibleStakeholders mapped via useMemo: each row computes, live, _x/_y = weightedCoord(s.id, scores, team), _status = statusFor(_x,_y), and _unscored = (team.length > 0 AND no team member has a score for this stakeholder, i.e. !team.some(m => teamScores[m.id])).

COLUMNS — two groups.
FROZEN (sticky-left, not reorderable, in order — the in-component frozenCols array carries width values 40/34/220/190 but those numbers are DEAD DATA, never read for layout: every column, frozen included, renders as a "max-content" grid track that auto-sizes to its content, and the frozen cells' sticky left offsets are MEASURED after layout; see the TREE-PROVEN NOTE + INTERACTIONS): (1) idx — 1-based row number (index+1); (2) edit — an icon cell opening the full stakeholder record (Icon name "user" if row.isPerson, else "users"; cell tooltip title = "Edit person" if row.isPerson, else "Edit organization"); (3) Stakeholder — field "name", read-only here, rendering displayName(row) || "-" (a literal "-" fallback when the display name resolves empty; double-click opens the record); (4) Organization — field "org", INLINE editable text input; for an org (not a person) editing it writes {org, name:org} (mirrors into name), for a person it writes {org} only (name untouched).
REORDERABLE (drag to reorder — EVERY reorderable header cell carries the tooltip title="Drag to reorder"; width "max-content" each; order persisted PER USER in localStorage key "hp_map_col_order_v3" — per-device, not synced; on load, saved keys present in REORDER_COL_MAP are kept, then any missing keys appended; unknown keys dropped): Category(field category) · Type(type) · Market(market) · Region(region) · Geography(geography) · State/Prov.(state) · Sites(site) · Issues(no field) · Priority(priority) · x(_x, cls "coord") · y(_y, cls "coord") · Relationship(_status) · Tags(no field) · Owner(owner) · Email(email) · Phone(phone) · X account(xAccount) · Last contact(lastContact) · Status(status) · Notes(notes) · Website(url) · Community investment(no field).

EDIT MECHANISM per column —
• INLINE dropdown (CellSelect): Category, Type, Market, Region, Geography, State, Site, Status. CASCADES: changing Category writes {category:nc, type:(CATEGORIES[nc]||[])[0]||""} (resets Type to the new category's first type); changing Market writes {market:m, region:(MARKETS[m]||[])[0]||""} (resets Region to the market's first region); choosing a Site whose record has a state writes {site:id, state:s.state} (auto-fills State), else {site:id}. State select option list = US_STATES, placeholder "-". Site select options = SITES mapped to {value:s.id, label:siteLabel(s)}, placeholder "-". Status options: ["Active","Watch","Dormant"].
• INLINE text: Organization (cell-input). INLINE date: Last contact (CellDate — a popover calendar; stores YYYY-MM-DD; trigger shows the value or "-"; on open, the initial calendar view month = the first of the STORED value's month when a date exists, else the current month).
• CLICK-TO-MODAL: Notes — the cell shows row.notes as a preview (class notes-preview); clicking the cell stops propagation and opens the Notes modal; the cell carries the tooltip title="Click to view notes & history" and inline style cursor:pointer (the only body cell with an explicit pointer cursor).
• DISPLAY-ONLY in the grid (edited via the full record modal): Issues (Tags chips from row.issues), Tags (Tags chips from row.tags), Priority (PriorityPill High/Medium/Low), Owner (OwnersDisplay avatars, size 20), Community investment (affiliatedCommunity(row.id, community) → pills, or muted "-").
• LINK cells:
  - Email — mailto:{row.email} (class plain-link), click stops propagation; muted "-" if empty.
  - Phone — anchor href "tel:" + row.phone.replace(/[^\\\\d+]/g, "") (strips everything except digits and +); display text = formatPhone(row.phone); muted "-" if empty.
  - X account — if empty, muted "-"; else handle = row.xAccount.replace(/^@+/, "") (strips one-or-more leading @), href "https://x.com/" + handle, target _blank rel noopener noreferrer, link text rendered as "@" + handle.
  - Website — if row.url, anchor href normalizeUrl(row.url), target _blank, text "Visit Website"; else muted "-".
• COMPUTED read-only: x = row._x.toFixed(1), y = row._y.toFixed(1) (cls "coord readonly" plus tone: "positive" when value > 1, "negative" when value < -1, "" otherwise); Relationship = StatusPill(row._status) (the scored zone pill).

CELL EMPHASIS (per-column typographic hierarchy — cellClass(c) applies these classes to every body cell; without this map the rebuilt grid loses its visual weighting) —
• MUTED (class cell-dim → softer, on-surface-muted ink): email, phone, xAccount, lastContact, status, notes.
• EMPHASIZED (class cell-strong → stronger ink): category, type, market, region, geography, state, site.
• SMALL TYPE (class cell-sm → smaller font size, stacks WITH cell-dim on these two): phone, lastContact.
• GROUPINGS: pills-cell on issues, tags, community (chip rows); zone-cell on _status (the Relationship pill cell); notes class on notes (the click-to-modal preview cell); url-cell on url AND on email, phone, xAccount (the link cells); coord readonly + positive/negative tone on _x/_y as above. Columns in none of these lists (name, org, priority, owner) render at default weight.

TOOLBAR (portaled into explainerSlot, above the table) —
• Search input (placeholder "Search stakeholders, orgs, tags…", with a leading search Icon and a trailing cmdKeyLabel kbd hint). Match is case-insensitive against: displayName(r), r.name, r.org, r.type, r.notes, and any r.tags entry.
• Filter button (shows activeFilterCount badge = total selected across all filter fields) opening FilterPopover. The button's onClick toggles the Filter popover AND closes the Sort and Categories popovers (setSortPopOpen(false), setCatOpen(false)) — but does NOT close Sites (see POPOVER OPEN/CLOSE MECHANICS). Popover header row = bold "Filter" plus a small ghost "Clear all" button (fontSize 11) that calls clearAllFilters: it empties ALL SIX filter fields (type, priority, status, owners, issues, zone) AND ALSO empties the Categories multi-select (catFilter) — cross-clearing — but leaves the Sites filter (siteFilter) and the impact-band filter (bandFilter) UNTOUCHED. Filter fields and how their option lists are built (CORRECTION — they are NOT all auto-aggregated): Priority is HARDCODED ["High","Medium","Low"]; Status is HARDCODED ["Active","Watch","Dormant"]; Type, Owners, Issues are AGGREGATED from rows (Set of present values, sorted; owners/issues flatten the per-row arrays); Zone (Relationship) = STATUS_ORDER filtered to zones actually present in rows (so it stays in canonical zone order, not alphabetical). Semantics: OR within a field, AND across fields. FilterPopover renders sections in order: Audience type, Priority, Status, Relationship(zone), Issues, Owner (owners render through userName resolving id→name). The popover closes on mousedown outside it (unless the click is inside a filter-button-wrap).
• Sort button (shows a "1" badge when a sortKey is active) opening SortPopover over the sortableFields list with an asc/desc direction. The button's onClick toggles the Sort popover AND closes the Filter and Categories popovers — not Sites. Popover header row = bold "Sort by" plus a small ghost "Clear all" button (fontSize 11) whose onClear sets sortKey to null and sortDir to "asc" — restoring the unscored-first default sort below. Same outside-mousedown close behavior as the Filter popover. THE 11 SORTABLE FIELDS (key → label): name → "Stakeholder", org → "Organization", type → "Audience type", market → "Market", region → "Region", state → "State/Prov.", site → "Sites", lastContact → "Last contact", updatedAt → "Last updated", createdAt → "Date added", _status → "Relationship". CUSTOM ORDERINGS inside the comparator: name sorts on displayName(a)||a.name||""; priority uses {High:0, Medium:1, Low:2} (missing → 9); status uses {Active:0, Watch:1, Dormant:2} (missing → 9); site sorts on siteLabel(SITES.find(id===)). Numeric values subtract; otherwise localeCompare; direction flips the sign.
• Categories multi-select button (badge = count) — the button's onClick toggles the Categories popover AND closes Filter and Sort (not Sites). The popover (a plain filter-popover div, inline width 220) lists Object.keys(CATEGORIES) with a check toggle; header "Categories" + ghost "Clear all" (fontSize 11) empties catFilter only. CLOSE MECHANISM IS DIFFERENT from Filter/Sort: it closes on onMouseLeave of the popover itself (the pointer leaving the popover fires setCatOpen(false)) — NOT on outside-mousedown. Filters rows by r.category.
• Sites multi-select button (badge = count) — the button's onClick toggles the Sites popover AND closes Categories, Filter, and Sort (all three). The popover (filter-popover div, inline width 220) lists SITES (siteLabel) with a check toggle; header "Sites" + ghost "Clear all" (fontSize 11) empties siteFilter only. Same mouse-leave close as Categories (onMouseLeave → setSiteOpen(false)), NOT outside-mousedown. Filters rows by r.site (matching site id).
• POPOVER OPEN/CLOSE MECHANICS (the full exclusivity map — sheet.jsx lines 322/338/356/381): the four toolbar popovers are made mutually exclusive by each button's onClick closing the others — Filter closes Sort+Categories; Sort closes Filter+Categories; Categories closes Filter+Sort; Sites closes Categories+Filter+Sort. ASYMMETRY (oracle quirk): Sites is the ONLY popover never auto-closed by the other three buttons — you can open Filter/Sort/Categories while the Sites popover is still open (in practice Sites usually self-closes via its mouse-leave on the way to the other button, which is why the omission survived). Close mechanisms also differ by popover: Filter and Sort close on outside-mousedown (unless the mousedown target is inside a filter-button-wrap); Categories and Sites close on mouse-leave of the popover. REBUILD RULING NEEDED: the rebuild may normalize this to full four-way exclusivity and one consistent close mechanism (recommended: all four close the other three, all four dismiss on outside click via the ui-menu default) — but that normalization must be an explicit recorded ruling with the user, not a silent change; this paragraph is the oracle-true behavior.
• Spacer, then three IMPACT-BAND chips (impact-chip buttons), each showing a live count AND toggling a band filter:
  - Positive impact — swatch background var(--pos); count = sum of BAND_STATUSES.positive = ["Cooperate","Collaborate","Valuable Relationship","High Value Relationship","Strategic Partner"].
  - Winnable middle — swatch background is the COLOR LITERAL "#E2A85F" (hardcoded inline, NOT a token — FLAG: in the rebuild this must become a --ui-sys-* token alongside --pos/--neg); count = sum of BAND_STATUSES.middle = ["Monitor","Maintain","Connect","Commit"].
  - Negative impact — swatch background var(--neg); count = sum of BAND_STATUSES.negative = ["Proactively Defend","Defend","Protect","Respond","Identify"].
  Selecting a band adds its zones to the band filter; counts come from countByStatus (a per-zone tally over rows).

SORT DEFAULT (no explicit sortKey) — unscored stakeholders FIRST (a._unscored vs b._unscored), then by most-recent lastContact (b.lastContact.localeCompare(a.lastContact) — descending).

HEADER-CLICK SORT (a SECOND, independent sort entry point — the popover is not the only one) — clicking ANY header cell whose column definition carries a field calls toggleSort(field): if sortKey already equals that field, the direction flips asc↔desc; if it is a new field, sortKey is set to it with direction asc. The active header renders a trailing sort-indicator character: "↑" when asc, "↓" when desc (only on the header whose field === sortKey). This applies to the FROZEN Stakeholder (field name) and Organization (field org) headers AND to every field-bearing reorderable header — category, type, market, region, geography, state, site, priority, _x, _y, _status, owner, email, phone, xAccount, lastContact, status, notes, url. Headers with NO field (idx, edit, Issues, Tags, Community investment) are not sortable. On reorderable headers, click-to-sort coexists with drag-to-reorder (drag events fire on drag; a plain click sorts), and each reorderable header keeps its title="Drag to reorder" tooltip regardless of sortability. CRITICAL CONSEQUENCE: header-click is the ONLY route by which priority, status, _x, _y, owner, email, phone, xAccount, notes, url, category, and geography can ever become sortKey — none of them are among the Sort popover's 11 fields — so the comparator's priority {High:0,Medium:1,Low:2} and status {Active:0,Watch:1,Dormant:2} orderings are reachable ONLY via header click; without header sort they would be dead code. The Sort button's "1" badge and the Sort popover's Clear all apply equally to a header-initiated sort (one shared sortKey/sortDir state). KNOWN ORACLE BUG (do-not-replicate blindly): the Owner column's field is "owner" but rows carry an "owners" ARRAY and no "owner" property, so header-sorting Owner compares undefined vs undefined and is effectively a no-op; the rebuild should either sort on the first owner's resolved user name or make the Owner header non-sortable — decide at build time, do not silently copy the inert sort. Also note _x/_y sort numerically (subtraction) and _status via header sorts alphabetically by zone name (the same as picking Relationship in the popover — localeCompare, NOT canonical zone order).

PAGE FOOTER (the page-level footer at the bottom of THIS page; distinct from the always-bottom APP shell footer) — table Icon + "{filtered.length} of {rows.length} stakeholders"; "·"; Avg x = mean of filtered _x to 1 decimal; Avg y = mean of filtered _y to 1 decimal (each divided by max(filtered.length,1)); spacer; an Export CSV button (download Icon). ROWS EXPORTED = the CURRENTLY VISIBLE filtered/sorted set — exportCsv iterates filtered (search + Categories/Sites + all popover filters + impact-band filter + the current sort, exactly as displayed), NOT the full stakeholder list. CSV column set (in order, with accessors): Stakeholder(displayName||name), Organization, Category, Type, Market, Region, Geography, Issues(joined "; "), Priority, Tags(joined "; "), Owners(each id resolved via (users.find(u => u.id === id) || {}).name || id — an UNRESOLVABLE owner id exports as the raw id — joined "; "), Last contact, Status, x(_x.toFixed(1)), y(_y.toFixed(1)), Relationship(_status), Website(normalizeUrl(url) if any), Notes. Values escaped: any cell matching /[",\\\\n]/ (comma, double quote, or newline) is wrapped in double quotes with internal quotes doubled. Filename = the EXACT expression (workspaceLabel || "stakeholders").replace(/[^\\\\w-]+/g, "_") + ".csv" — hyphens are PRESERVED and each RUN of other non-word chars collapses to a single "_".

INTERACTIONS — clicking a row selects it (selection lifts to the page; shared with Map/Scoring); double-clicking the name (or clicking the frozen edit icon, which stops propagation) opens the full record (StakeholderModal in edit mode); the notes cell stops propagation and opens the Notes modal (tooltip "Click to view notes & history", pointer cursor). Clicking any field-bearing header sorts by that field (full spec in HEADER-CLICK SORT above). Horizontal scroll toggles a "scrolled-x" class (left-edge shadow) once scrollLeft > 0; frozen columns auto-size to content and their sticky left offsets are MEASURED after layout (useLayoutEffect reading each frozen header cell's getBoundingClientRect width, accumulating left offsets) so they stack deterministically. Column reorder = native HTML5 drag-and-drop on the reorderable header cells (draggable, onDragStart sets dragKey, onDragOver sets dragOverKey + preventDefault, onDrop splices dragKey before the target in colOrder and persists; every draggable header shows the "Drag to reorder" tooltip). The new-stakeholder modal opens when addNonceFor === "sheet" fires; openStakeholderId routes an external open-request into editId.

CANONICAL-UI BUILD MAP (NEVER md-*/mat-table/shadcn — the rebuilt app is assembled exclusively from this repo's <ui-*> design system):
• Table: the existing domain component ui-stakeholder-table (composed on ui-data-table) — sticky header, frozen Stakeholder/Org columns, click-to-sort headers on every field-bearing column (frozen AND reorderable) with the asc "↑" / desc "↓" indicator on the active header per the HEADER-CLICK SORT section, drag-to-reorder columns, virtualized body for large workspaces, and per-cell custom templates so each cell hosts its own control. No HTML <table>, no third-party grid, no MUI.
• Dropdown cells (Category/Type/Market/Region/Geography/State/Site/Status): ui-select (intrinsic-width so columns autofit). Cascades wired in the cell change handlers exactly as above.
• Text cell (Organization): ui-text-field (no label, dense).
• Date cell (Last contact): ui-date-picker (popover calendar, stores YYYY-MM-DD).
• Relationship (the SCORED zone — derived from the team's scores via statusFor; follows the stakeholder everywhere): ui-chip, background/text from the single-sourced --ui-sys-zone-* tokens. Priority (a SEPARATE, manually-set High/Medium/Low field): a distinct ui-chip with its own priority tokens — two different fields, relationship is derived, priority is set by hand. Issues/Tags/Community: ui-chip set. Owners: overlapping avatars. Email/Phone/X/Website: semantic anchors (mailto/tel/x.com/normalizeUrl as above).
• Cell emphasis: the CELL EMPHASIS map above expressed ONLY through tokens — cell-strong columns use --ui-sys-on-surface (strong ink), cell-dim columns use --ui-sys-on-surface-muted, cell-sm columns take the smaller body type-scale token; never per-cell inline styles or utility classes.
• Edit icon + reorder grips: ui-icon-button (Material Symbols person/groups, drag_indicator); the edit cell keeps its tooltip ("Edit person" / "Edit organization") via ui-tooltip. Tooltips route through ui-tooltip everywhere: reorderable headers get ui-tooltip "Drag to reorder", the notes cell gets ui-tooltip "Click to view notes & history" — never bare title attributes in the rebuilt app.
• Toolbar: search = ui-text-field with a leading ui-icon "search" + cmd-key hint; Filter/Sort/Categories/Sites = ui-button opening a ui-menu of checkbox items for multi-select (or a larger ui-dialog for the multi-field filter panel); EACH popover's header carries its ghost "Clear all" ui-button (variant text) with the exact clearing semantics above (Filter's Clear all also empties Categories but never Sites/bands; Sort's Clear all restores the unscored-first default); open/close exclusivity and dismissal per POPOVER OPEN/CLOSE MECHANICS (if normalized to ui-menu's outside-click dismissal for all four, record the ruling); impact bands = ui-chip (filter variant, selected = active). The "Winnable middle" swatch color #E2A85F MUST be promoted to a --ui-sys-* token (sits beside the positive/negative band tokens).
• Footer: design-system label/body text + an Export CSV ui-button (download ui-icon). Computed x/y tone via positive/negative on-surface tokens.
• Selection/edit/notes state lifts to the page; the Notes modal and the full record open via ui-dialog (the create/edit modal is captured in its own box).

SKELETON TREE (the literal nested region tree extracted from archive/src/sheet.jsx — plus the two toolbar popovers from sheet-modals.jsx — the build assembles against THIS tree, never prose; indentation = nesting; every className region in the module appears below or is explicitly absorbed by a component's shadow DOM) —
· div.sheet-wrap — the page container for the whole Lists surface. Mapping: the page slot inside ui-app-shell main content; layout column — token-only container.
  · [PORTAL] div.sheet-toolbar — rendered via ReactDOM.createPortal INTO explainerSlot (the shell's explainer band ABOVE the table): a child of SheetView in JSX but physically mounted in the shell slot, and only when explainerSlot exists. Mapping: layout row — token-only container in the shell's explainer/toolbar slot.
    · div.search — leading Icon "search" + text input (placeholder "Search stakeholders, orgs, tags…") + span.kbd.kbd-cmdk showing cmdKeyLabel. Mapping: ui-text-field with leading ui-icon "search"; the kbd hint as trailing slot content.
    · div.filter-button-wrap (Filter) — anchor wrapper pairing the button with its popover. Mapping: absorbed by ui-menu anchoring (exists only to anchor + to exempt outside-mousedown).
      · button.btn (+ .filter-active when any filter selected) — text "Filter" + [conditional] span.filter-count badge. Mapping: ui-button with tokened count badge.
      · [conditional] FilterPopover (sheet-modals.jsx) → div.filter-popover. Mapping: ui-menu surface (or ui-dialog for the multi-field panel).
        · div.filter-pop-head — strong "Filter" + button.btn.btn-ghost "Clear all" (fontSize 11). Mapping: menu header row; ui-button variant text.
        · div.filter-pop-body — six FilterSection blocks in order (Audience type, Priority, Status, Relationship, Issues, Owner). Mapping: checkbox-item groups internal to ui-menu; FilterSection itself is the shared component captured with components.jsx.
    · div.filter-button-wrap (Sort) — same anchor pattern.
      · button.btn (+ .filter-active when sortKey) — "Sort" + [conditional] span.filter-count "1". Mapping: ui-button.
      · [conditional] SortPopover (sheet-modals.jsx) → div.filter-popover.sort-popover
        · div.filter-pop-head — strong "Sort by" + ghost "Clear all". Mapping: menu header row.
        · div.filter-pop-body — SortFieldList (shared component, components.jsx). Mapping: internal to ui-menu.
    · div.filter-button-wrap (Categories)
      · button.btn (+ .filter-active) — "Categories" + count badge. Mapping: ui-button.
      · [conditional] div.filter-popover (inline width 220; closes on its own onMouseLeave)
        · div.filter-pop-head — strong "Categories" + ghost "Clear all"
        · div.filter-pop-body → div.cat-opt-list — one button.cat-opt (+ .on when selected) per category: Icon "check" (.ico.cat-check) + span label. Mapping: ui-menu checkbox items.
    · div.filter-button-wrap (Sites) — identical structure to Categories; options = SITES via siteLabel, buttons keyed by site id. Mapping: ui-button + ui-menu checkbox items.
    · div.spacer — flex spacer. Mapping: layout row spacer — token-only.
    · button.impact-chip ×3 (+ .on.pos / .on.neu / .on.neg when its band is active) — each: span.swatch (inline background var(--pos) / literal #E2A85F / var(--neg)) + strong live count + band label. Mapping: ui-chip (filter variant) with tokened swatch.
  · [conditional newOpen] StakeholderModal (create) — full tree captured in the StakeholderModal box. Mapping: ui-dialog.
  · [conditional editing] StakeholderModal (edit) — same box. Mapping: ui-dialog.
  · [conditional notesFor] NotesModal — tree captured in the StakeholderModal box. Mapping: ui-dialog.
  · div.sheet-scroll — the ONE scroll container (both axes); a ref-bound native scroll listener toggles class .scrolled-x when scrollLeft > 0 (drives the frozen-edge shadow); the binding is guarded by an el._scrollBound flag so re-renders never double-bind. Mapping: internal to ui-stakeholder-table (its scroll viewport).
    · div.sheet-grid — the CSS grid itself (ref gridRef); inline gridTemplateColumns = one "max-content" track per column (4 frozen + the ordered reorderables), inline minWidth max-content. Mapping: internal to ui-stakeholder-table.
      · div.sheet-head — the header row (its cells are direct grid children). Mapping: internal to ui-stakeholder-table (sticky header).
        · div.sheet-cell.frozen.frozen-{idx|edit|name|org} (+ cls .idx / .edit) ×4 — inline style left = the MEASURED frozenLeft[key] offset; onClick sorts when the column carries a field; contains span label + [conditional] span.sort-indicator ("↑"/"↓"). Mapping: internal frozen header cells of ui-stakeholder-table.
        · div.sheet-cell.col-draggable (+ per-column cls "coord" on x/y) (+ .drag-over / .dragging during a drag) ×22 — draggable, title "Drag to reorder"; contains Icon "drag" (.ico.col-grip) + span label + [conditional] span.sort-indicator. Mapping: internal reorderable header cells (grip = ui-icon drag_indicator; tooltip via ui-tooltip).
      · SheetRow ×N → div.sheet-row (+ .selected) — onClick selects the row. Mapping: internal rows of ui-stakeholder-table.
        · div.sheet-cell.frozen.frozen-idx.idx — inline left; text = index+1. Internal frozen cell.
        · div.sheet-cell.frozen.frozen-edit.edit — inline left; onClick (stopPropagation) opens the record; title "Edit person"/"Edit organization"; contains Icon "user"/"users" (.ico.edit-icon). Mapping: ui-icon-button in the frozen-cell template + ui-tooltip.
        · div.sheet-cell.frozen.frozen-name — inline left; onDoubleClick opens the record; text displayName(row) || "-". Internal frozen cell (read-only).
        · div.sheet-cell.frozen.frozen-org — inline left; contains input.cell-input bound to row.org. Mapping: ui-text-field (dense, no label) in the cell template.
        · div.sheet-cell + cellClass(c) ×22 per row — the reorderable body cells, classed per the CELL EMPHASIS map (pills-cell / coord readonly + positive|negative / zone-cell / notes / url-cell / cell-dim / cell-strong / cell-sm); ONLY the notes cell carries onClick (stopPropagation → Notes modal), title "Click to view notes & history", and inline cursor pointer. Cell contents per renderCell:
          · CellSelect (category/type/market/region/geography/state/site/status) → span.cell-dd (outside-click ref). Mapping: ui-select — everything below is internal to ui-select.
            · button.cell-dd-trigger (+ .is-empty when nothing selected) — shows the selected option's label, else the placeholder ("-").
            · [conditional open] div.cell-dd-menu (click stopPropagation) — one button.cell-dd-opt (+ .on for the current value) per option.
          · CellDate (lastContact) → span.cell-dd. Mapping: ui-date-picker — everything below is internal to ui-date-picker.
            · button.cell-dd-trigger (+ .is-empty) — shows the YYYY-MM-DD value or "-".
            · [conditional open] div.cell-cal (click stopPropagation)
              · div.cell-cal-head — button.cell-cal-nav (Icon chevron-left, previous month) + span.cell-cal-title (locale long month + numeric year) + button.cell-cal-nav (Icon chevron-right, next month)
              · div.cell-cal-grid — 7× span.cell-cal-dow ("S","M","T","W","T","F","S") + leading empty spans (first-weekday offset) + one button.cell-cal-day (+ .on on the stored date) per day of the month
          · other cell contents — Tags chips (issues/tags), PriorityPill, OwnersDisplay(size 20), StatusPill(row._status), span.notes-preview, span.pills-inline holding one span.tag per community affiliation (title = engagement name), a.plain-link anchors (email/phone/x), the plain "Visit Website" anchor, span.muted "-" empties, and raw toFixed(1) text for _x/_y — each per the EDIT MECHANISM section. Mapping: ui-chip / avatars / zone-tokened ui-chip / semantic anchors / tokened text inside the cell templates.
  · div.sheet-footer — the page footer row. Mapping: layout row — token-only container beneath the table.
    · div.group — Icon "table" + strong filtered count + " of N stakeholders"
    · div.group — the "·" separator
    · div.group — "Avg" + span.kbd "x" + strong mean-x (1 decimal)
    · div.group — "Avg" + span.kbd "y" + strong mean-y (1 decimal)
    · div.spacer (inline flex 1)
    · div.group → button.footer-export-btn — Icon "download" + "Export CSV". Mapping: ui-button with leading ui-icon "download".
TREE-PROVEN NOTE (dead code, do not replicate): sheet.jsx defines TWO sets of column-width numbers and BOTH are dead data. The module-level FROZEN_COLS / FROZEN_LEFT / FROZEN_TOTAL constants (idx 38 / edit 34 / name 240 / org 200) are never used, AND the in-component frozenCols array's width fields (40/34/220/190) are never read for layout either: gridTemplateColumns is "max-content" for EVERY track, frozen and reorderable alike, so rendered widths are AUTO-SIZED to content, and the frozen cells' sticky left offsets are MEASURED after layout (a useLayoutEffect walks the frozen header cells accumulating getBoundingClientRect widths). No fixed column width exists in the rendered grid; do not replicate either constant set as real widths.

UX HANDLER CENSUS (every event handler in the module, enumerated against the oracle — sheet.jsx plus its two toolbar popovers in sheet-modals.jsx; source order) —
SheetView toolbar and chrome: (1) search input onChange → setSearch. (2) Filter button onClick → toggle Filter popover + close Sort and Categories. (3) Sort button onClick → toggle Sort popover + close Filter and Categories. (4) Categories button onClick → toggle Categories popover + close Filter and Sort. (5) Categories popover onMouseLeave → close. (6) Categories "Clear all" onClick → catFilter emptied. (7) category option (cat-opt) onClick → toggleCat(c). (8) Sites button onClick → toggle Sites popover + close Categories, Filter and Sort. (9) Sites popover onMouseLeave → close. (10) Sites "Clear all" onClick → siteFilter emptied. (11) site option onClick → toggleSite(s.id). (12)(13)(14) the three impact-chip onClicks → toggleBand("positive"/"middle"/"negative"). (15) sheet-scroll native "scroll" listener → toggles .scrolled-x when scrollLeft > 0 (bound once via the el._scrollBound guard). (16) frozen header cell onClick → toggleSort(c.field) when the column has a field. (17–22) reorderable header cell, six handlers: onDragStart → dragKey = key; onDragOver → preventDefault + dragOverKey = key; onDragLeave → clears dragOverKey ONLY if it still equals this column (functional update k === c.key ? null : k); onDrop → onColDrop(target) — a guarded no-op that just clears both drag states when dragKey is null or equals the target, otherwise splices dragKey immediately BEFORE the target in colOrder and persists to localStorage; onDragEnd → clears BOTH dragKey and dragOverKey (an aborted drag leaves no stuck highlight); onClick → toggleSort(c.field). (23) footer "Export CSV" onClick → exportCsv().
SheetRow: (24) row onClick → onSelect (selection lifts to the page). (25) edit cell onClick → stopPropagation + open the record. (26) name cell onDoubleClick → open the record. (27) org input onChange → writes {org} for a person, {org, name: org} for an org. (28) notes cell onClick → stopPropagation + open the Notes modal. (29)(30)(31)(32) the FOUR link anchors — Email (mailto), Phone (tel), X account (x.com), Website — EACH carries onClick stopPropagation so following a link never selects the row (previously stated only for Email; explicit for all four here).
CellSelect (the ×8 dropdown columns): (33) document mousedown (while open) → closes when the press lands outside the span.cell-dd; (34) document keydown → Escape closes; (35) trigger onClick → stopPropagation + toggle open (opening a dropdown never selects the row); (36) menu onClick → stopPropagation (choosing never selects the row); (37) option onClick → onChange(value) + close.
CellDate: (38) document mousedown outside → close; (39) document keydown Escape → close; (40) trigger onClick → stopPropagation + toggle open; (41) calendar onClick → stopPropagation; (42) previous-month nav onClick → view month - 1; (43) next-month nav onClick → view month + 1; (44) day onClick → onChange(YYYY-MM-DD with zero-padded month/day) + close.
FilterPopover (sheet-modals.jsx): (45) document mousedown → close unless the press is inside the popover or inside any .filter-button-wrap; (46) "Clear all" onClick → clearAllFilters (the cross-clearing semantics above). SortPopover: (47) the same outside-mousedown close; (48) "Clear all" onClick → sortKey null + sortDir "asc". (The per-option toggle clicks inside FilterSection and SortFieldList live in the shared components module, components.jsx, and are counted with that capture.)
COUNT: 44 handlers in sheet.jsx + 4 in FilterPopover/SortPopover = 48 handlers, all accounted. Newly added by this census (previously undescribed in this box): the onDragLeave / onDragEnd / no-op-drop mechanics in (17–22), the universal link-cell stopPropagation in (29–32), and the full CellSelect/CellDate open-close mechanics in (33–44) — outside-mousedown close, Escape close, trigger and menu stopPropagation, month navigation, and the .is-empty trigger state. Everything else was already captured above.` },
                              { t: "Create / edit stakeholder modal (StakeholderModal) — fields, defaults, validation, sub-controls", done: true, d:
`WHAT IT IS — StakeholderModal is the single popped-up card used for BOTH creating a new stakeholder and editing an existing one (it replaced the old NewStakeholderModal). Same shape either way; when an "existing" stakeholder is passed it loads that record's values and saves via onSubmit (a patch) instead of creating. OPENING ROUTES (verified against the oracle — there is NO "New stakeholder" button on the Lists toolbar; the toolbar holds only search, Filter, Sort, Categories, Sites, and the three impact-band chips — do NOT invent a toolbar New button at rebuild): CREATE mode opens exclusively when the addNonceFor === "sheet" nonce fires (sheet.jsx watches addNonce/addNonceFor and sets the new-modal open), and exactly two callers fire it — (a) the app shell's global context-aware (+) button (app.jsx nav-tabs-right-button, title/aria-label "Create new", plus Icon; on the Lists view its onClick runs setAddNonceFor(activeView) i.e. "sheet" and bumps addNonce), and (b) the WorkHQ band's quick "+ Stakeholder" button (intel.jsx class intel-quick, title "Add stakeholder", plus Icon + "Stakeholder"), whose onAddStakeholder handler in app.jsx runs the same setAddNonceFor("sheet") + addNonce bump. EDIT mode opens from a Lists row's frozen edit-icon cell (title "Edit person" / "Edit organization") or a name-cell double-click, and from external open requests (the openStakeholderId prop: an effect sets that id as the edit target and calls onConsumeOpen to clear the request). Props of note: users, workspaces, isMaster, currentUser, existing, onCancel, onSubmit, onDelete, initialView, companyIssues, companyTags, community, stakeholders, scores, team, getWorkspacesForStakeholder, onOpenWorkspace, updateCommunityApp. isEdit = !!existing.

CHROME COPY (exact strings) — modal head h2 title = "New stakeholder" (create) / "Edit stakeholder" (edit); beside the title, edit mode only, a "View Stakeholder" link-button with tooltip title="View full profile"; a ghost close button (close Icon, aria-label "Close") at the head's right. Footer = "Cancel" button + primary button labelled "Create stakeholder" (create) / "Save changes" (edit), the primary disabled until valid (see VALIDATION).

BACKDROP DISMISSAL (sheet-modals.jsx line 101 — a third close route, easy to lose) — the modal card sits over a dimmed veil (div class "modal-veil show") whose onClick is onCancel: clicking ANYWHERE on the backdrop cancels the whole create/edit exactly like the Cancel button or the ghost close — the draft is DISCARDED immediately, with NO confirmation and NO dirty-check, in both create and edit mode. There are therefore THREE equivalent dismissal routes: ghost close button, footer "Cancel", and backdrop click.

CALLER WIRING FROM LISTS (verified against the oracle — an UNFLAGGED FAKE in the old code; do not silently replicate) — BOTH StakeholderModal invocations on the Lists page (the "new" open and the row-edit open) pass NO companyTags and NO onDelete. Consequences in the oracle: (a) the Tags field's IssueSelector receives companyIssues = companyTags || [] = [] WITH restrict set, so it shows no available chips AND no custom input — the Tags field is completely inert from Lists (only already-present tags can be removed by clicking them); (b) the Delete section never renders from the Lists edit path, because it requires isEdit AND onDelete. (The create invocation additionally omits scores, team, getWorkspacesForStakeholder, onOpenWorkspace, updateCommunityApp — harmless there since those feed only the read-only profile view, which create mode never shows.) MAKE-REAL DECISION for the rebuild: the Lists page SHOULD wire both — pass the company tag set (from Settings) as companyTags so Tags is usable where stakeholders are edited, and pass onDelete (removing the stakeholder and all of their scores) so the documented Delete section is reachable from the master table — unless the user rules otherwise at build time. A cold session must NOT invent either answer silently; this paragraph is the recorded intent.

BLANK-NEW DEFAULTS (the draft when existing is null) — title "", firstName "", lastName "", name "", org "", url "", isPerson false, photo null, category "Communities", type = CATEGORIES["Communities"][0] (the first audience type of the Communities category), market "Americas", region "United States", geography "Local", priority "Medium", tags [], issues [], owners = currentUser ? [currentUser.id] : [], status "Active", lastContact = new Date().toISOString().slice(0,10) (today, YYYY-MM-DD), notes "". On EDIT the draft = { ...blank, ...existing, isPerson: !!(existing.firstName || existing.lastName) } (isPerson is INFERRED from whether the record has a first or last name, regardless of any stored flag). A useEffect keyed on existing?.id re-seeds the draft when the target changes.

LAYOUT / FIELDS (top to bottom in the modal body) —
1. PHOTO + IDENTITY ROW. "Profile image" with a preview square (class person or org); preview shows the uploaded data URL as a centered cover background, or a fallback Icon ("user" if isPerson, else "users"). Controls: a label-wrapped file <input type="file" accept="image/*"> labelled "Upload photo" (or "Replace photo" when a photo exists); on change, the first file is read via FileReader.readAsDataURL and the resulting data URL is stored to draft.photo. When a photo exists, a "Remove" ghost button sets photo null.
2. ORGANIZATION + WEBSITE (2-col row). Organization — text input, placeholder "e.g. City of Cedarville", autoFocus. Website — text input, placeholder "cityofcedarville.gov", helper line "Skip http: we add it." (the value is run through normalizeUrl on submit).
3. ADD-A-PERSON TOGGLE — a checkbox "Add a person" with sub-copy "Track a named individual at this organization. If unchecked, the stakeholder is the organization itself." Checking it reveals the person row.
4. PERSON ROW (only when isPerson) — 3 cols: Title (select), First name (input, placeholder "Maria"), Last name (input, placeholder "Chen"). TITLE SELECT catalog, in order: a default "None" option (value ""), then Senator, Representative, Assemblymember, Governor, Mayor, County Supervisor, Councilmember, City Councilmember, CEO, Director, Other. When title === "Other", a free-text input appears below it (placeholder "Write a custom title", stored to draft.titleOther).
5. CONTACT ROW (3 cols) — Email (placeholder "name@org.com"), Phone (placeholder "(555) 123-4567"; onBlur replaces the value with formatPhone(value)), X account (placeholder "@handle").
6. CLASSIFICATION ROW (2 cols) — Category (select over Object.keys(CATEGORIES); changing it resets type to CATEGORIES[c][0]) and Audience type (select over CATEGORIES[draft.category]).
7. GEOGRAPHY ROW (3 cols) — Market (select over Object.keys(MARKETS); changing it resets region to MARKETS[m][0]), Region (select over MARKETS[draft.market]), Geography (select over GEOGRAPHIES).
8. SITE + STATE ROW (2 cols) — Site (select; "None" plus SITES via siteLabel(s); picking a site whose record has a state writes {site:id, state:s.state}, else just site). State (select; "None" plus US_STATES, where each option's DISPLAY label = STATE_ABBR[st] || st (the abbreviation) while the option VALUE is the full state).
9. RELATIONSHIP ROW (2 cols) — Priority (select ["High","Medium","Low"]) and Status (select ["Active","Watch","Dormant"]).
10. LAST CONTACT — native date input (YYYY-MM-DD).
11. OWNERS — MultiOwnerPicker (size 26) bound to draft.owners. Helper copy: edit mode "Edit who owns this stakeholder. Add or remove people responsible."; create mode "You're added by default. Add or remove people responsible."
12. ISSUES — an IssueSelector over draft.issues with companyIssues, helper "Click a company issue to add it. Add your own below, separated by commas."
13. TAGS — an IssueSelector over draft.tags with companyIssues = companyTags || [] AND the restrict prop set, helper "Choose from the company tag set. Managers can add tags in Settings." (restrict hides the custom input, so tags are limited to the company tag set — and see CALLER WIRING FROM LISTS: from the Lists page companyTags is never passed, leaving this field inert in the old code.)
14. NOTES — a 3-row textarea bound to draft.notes (free text; the running history lives in the separate Notes modal).
15. CREATE-ONLY NOTICE (only when !isEdit) — a muted line above a top border: "Score isn't set yet. Your team will be notified - they'll see this stakeholder at the top of their Sheet and the count on Scoring."
16. DELETE SECTION (only when isEdit AND onDelete is provided — from Lists, onDelete is never provided in the old code; see CALLER WIRING FROM LISTS) — a "Delete stakeholder" labelled section with copy "Permanently removes this stakeholder and all of their scores. This cannot be undone." and a danger "Delete stakeholder" button (with a leading close Icon) that opens the confirm modal.

VALIDATION (shMissing list; the modal is valid only when shMissing is empty) — required: Organization ("Organization", trips when org missing/blank); Person name ("Person name", only when isPerson and neither firstName nor lastName); Custom title ("Custom title", only when isPerson and title==="Other" and titleOther blank); Category; Audience type; Market; Region; Geography; State (from site) ("State (from site)", only when a chosen site has a state but draft.state is unset — normally auto-filled, so this only trips on a malformed site). The footer shows "Required: {shMissing joined by ', '}" when invalid; the primary Save/Create button is disabled until valid, with title "Fill required fields: {list}".

SUBMIT NAME COMPOSITION (submit() — no-op if invalid) — if isPerson: computed = displayName({title, titleOther, firstName, lastName}); name = computed || draft.org (falls back to org if the person name resolves empty). If NOT a person: title/titleOther/firstName/lastName are CLEARED to "" and name = draft.org. In both cases url = normalizeUrl(draft.url). The full draft (with those overrides) is passed to onSubmit — addStakeholder on create, updateStakeholder(id, patch) on edit.

VIEW / EDIT TOGGLE — when initialView is truthy AND existing is present, the modal opens in viewMode and renders the read-only StakeholderProfile instead of the form (passing stakeholder, users, stakeholders, community, scores, team, getWorkspacesForStakeholder, currentUser, companyIssues, plus onClose=onCancel, onEdit=() => setViewMode(false), onOpenWorkspace, updateCommunityApp). The modal head shows the "View Stakeholder" button (only in edit mode; tooltip title="View full profile") that flips into that profile; the profile's Edit action flips back to the form.

DELETE FLOW (edit mode) — the danger button sets confirmDelete true, rendering a stacked confirm modal: an extra veil at zIndex 60 and a confirm card at zIndex 61 (width 380). Copy: heading "Delete this stakeholder?"; body "{displayName(existing) || existing.name} and all of their scores will be permanently removed. This cannot be undone." Buttons: "Cancel" (closes the confirm) and a danger "Delete" (closes the confirm and calls onDelete). BACKDROP: the zIndex-60 veil's own onClick is setConfirmDelete(false) — clicking around the confirm card closes ONLY the confirm and returns to the still-open edit form (it does NOT cancel the whole modal; the main veil at the default z-index is covered by this stacked veil while the confirm is up, so a stray backdrop click during confirm can never discard the edit session).

ISSUE SELECTOR (the sub-control used for BOTH Issues and Tags) — props selected, companyIssues, onChange, restrict. titleCase(s) = split on whitespace, each word → first char upper + rest lower, rejoined and trimmed. Layout:
• Selected chips row (when any): each selected value is a filled chip with a trailing "×" (chip tooltip title="Click to remove"); clicking the chip removes that value.
• Available presets row (when any company values are not yet selected): each available company value is a dashed "+ {value}" button that adds it.
• Custom input row — HIDDEN when restrict is set (so Tags are limited to the company set; Issues allow free custom entry). Placeholder = "Add custom issues, separated by commas". The input commits on Enter (commitDraft) and on "," (commits everything up to and including the comma) and on blur (commits any pending text); Backspace on an empty input removes the LAST selected value. Committing splits the draft on commas, titleCases each piece, and appends only non-duplicate values; the input then clears. Every add titleCases and dedups (selected.includes guard).

MULTI-OWNER PICKER — MultiOwnerPicker(users, owners=draft.owners, onChange, size=26) — the owner avatar multi-select used in the Owners field (full element spec captured with the users/profile boxes).

NOTES MODAL (NotesModal — opened from the Lists notes cell; also the modal's own Notes textarea writes the current notes string) — rendered over its OWN dimmed veil (modal-veil show) whose onClick is onClose: clicking the backdrop closes the Notes modal, same as the head close icon and the footer "Close" button (three equivalent dismissal routes; a pending unsubmitted composer draft is lost silently). Header eyebrow "NOTES" over displayName(stakeholder) || stakeholder.name; close button. HISTORY (newest first): start from stakeholder.notesHistory; if that array is empty but stakeholder.notes exists, synthesize a single legacy entry { id:"n-legacy", body: stakeholder.notes, at: stakeholder.lastContact || now(ISO), by: null }; sort by at descending via (b.at||"").localeCompare(a.at||""). Each entry shows a date stamp = new Date(n.at).toLocaleDateString with { month:"short", day:"numeric", year:"numeric" } (or "-" if no date), plus the author: "· {author.name}" when by resolves to a user, else a muted "· legacy" (for by:null). Empty state (no history): "No notes yet. Add the first one below." COMPOSER (a form below): label "Add a new note", a 3-row textarea (placeholder "Write what happened, what was said, or what you learned…"), a footer line "Dated today, posted as {currentUser.name || 'you'}.", a "Close" button and an "Add note" submit (disabled until the text trims non-empty). On add, the Lists handler builds entry { id: uid("n"), body: text, at: new Date().toISOString(), by: currentUser.id }, appends it to notesHistory, AND sets notes to the new text, then clears the composer.

CANONICAL-UI BUILD MAP (NEVER md-*/shadcn) — host = ui-dialog with head title "New stakeholder" / "Edit stakeholder" (Newsreader title type), the "View Stakeholder" ui-button (variant text, ui-tooltip "View full profile") beside it in edit mode, and a close ui-icon-button (icon close, aria-label "Close"). SCRIM DISMISSAL maps to ui-dialog's scrim-dismiss: the main dialog's scrim click fires onCancel (draft discarded, no confirmation — per BACKDROP DISMISSAL above); the stacked delete-confirm ui-dialog's own scrim closes only the confirm (back to the edit form); the NotesModal ui-dialog's scrim closes the Notes modal. Text inputs (Organization, Website, Email, Phone, X account, person First/Last, custom title) = ui-text-field; selects (Title, Category, Audience type, Market, Region, Geography, Site, State, Priority, Status) = ui-select; Last contact = ui-date-picker (or native date if simpler); "Add a person" = ui-switch (or ui-checkbox). IssueSelector = a ui-chip set (selected filled chips with remove, available dashed add chips) + a ui-text-field for custom entry with placeholder "Add custom issues, separated by commas" (the text field is omitted when restrict). Owners = the owner-avatar picker. Photo = a plain file input behind a ui-button (Upload/Replace) plus a ui-button ghost "Remove"; preview is an avatar surface with the data URL or a fallback ui-icon. Footer = "Required: …" hint + ui-button "Cancel" + primary ui-button labelled "Create stakeholder" / "Save changes" (disabled until valid). The delete-confirm is a second stacked ui-dialog ("Delete this stakeholder?" / "Cancel" + danger "Delete"). Tone, spacing, and colors come only from --ui-sys-* tokens.

SKELETON TREE (the literal nested region tree extracted from archive/src/sheet-modals.jsx — StakeholderModal + IssueSelector + NotesModal; FilterPopover/SortPopover also live in this file but belong to the Lists box tree; the build assembles against THIS tree, never prose; indentation = nesting) —
· [Fragment root — StakeholderModal, form mode. When viewMode AND existing, the ENTIRE tree below is replaced by StakeholderProfile (captured in its own box).]
  · div.modal-veil.show — the main dimmed backdrop; onClick = onCancel (BACKDROP DISMISSAL). Mapping: ui-dialog scrim.
  · [conditional confirmDelete] the stacked delete confirm:
    · div.modal-veil.show (inline zIndex 60) — onClick closes ONLY the confirm. Mapping: the stacked ui-dialog's own scrim.
    · div.modal.confirm-modal (inline zIndex 61, width 380). Mapping: second stacked ui-dialog.
      · div.modal-body (inline padding 20) — h2 "Delete this stakeholder?" + p.muted body copy (with a strong stakeholder name span) + a flex-end button row (layout row — token-only): button.btn "Cancel" + button.btn.btn-danger "Delete".
  · div.modal.stakeholder-modal — the dialog card. Mapping: ui-dialog.
    · div.modal-head — Mapping: ui-dialog title slot.
      · div.row (inline gap 12, minWidth 0) — h2 title ("New stakeholder"/"Edit stakeholder") + [edit only] button.explainer-link "View Stakeholder" (title "View full profile" → ui-tooltip). Mapping: dialog title text + ui-button variant text.
      · button.btn.btn-ghost close (Icon "close", aria-label "Close"). Mapping: ui-dialog's built-in close ui-icon-button.
    · div.modal-body — the scrolling form stack. Mapping: ui-dialog content slot; every sh-form-row below is a layout row — token-only container.
      · div.sh-photo-row — span.sh-photo-preview (+ .person | .org) (photo as inline center/cover background, else fallback Icon user/users) + a column div holding span.lbl "Profile image" and a row div: label.btn wrapping the HIDDEN file input (type file, accept image/*, display none — the label IS the button, text "Upload photo"/"Replace photo") + [when photo] button.btn.btn-ghost "Remove". Mapping: avatar-like preview surface + ui-button (label-wrapped file input) + ui-button text.
      · div.sh-form-row.sh-form-row-2 — Organization + Website: each label.login-field (span.lbl + input; Website adds span.muted helper "Skip http: we add it."). Mapping: 2-col row of ui-text-field.
      · label.add-person-toggle — the checkbox input + span.add-person-box (the drawn box, internal to ui-checkbox) + a text span (strong "Add a person" + muted block sub-copy). Mapping: ui-checkbox (or ui-switch) with label + supporting text.
      · [conditional isPerson] div.sh-form-row.sh-form-row-3 — Title: label.login-field > div.designed-select > select ([when title === "Other"] a second input below, placeholder "Write a custom title"); First name; Last name. Mapping: ui-select + 2× ui-text-field; designed-select is internal to ui-select.
      · div.sh-form-row.sh-form-row-3 — Email / Phone / X account. Mapping: 3× ui-text-field.
      · div.sh-form-row.sh-form-row-2 — Category / Audience type (each div.designed-select > select). Mapping: 2× ui-select.
      · div.sh-form-row.sh-form-row-3 — Market / Region / Geography. Mapping: 3× ui-select.
      · div.sh-form-row.sh-form-row-2 — Site / State. Mapping: 2× ui-select.
      · div.sh-form-row.sh-form-row-2 — Priority / Status. Mapping: 2× ui-select.
      · label.login-field — Last contact: input type=date. Mapping: ui-date-picker (or native date).
      · label.login-field — Owners: span.lbl + span.muted helper + MultiOwnerPicker (its internal tree lives in users.jsx — owner picker capture).
      · label.login-field — Issues: span.lbl + span.muted helper + IssueSelector (tree below).
      · label.login-field — Tags: span.lbl + span.muted helper + IssueSelector with restrict (tree below).
      · label.login-field — Notes: span.lbl + textarea rows 3 (inline styled: resize vertical, padding 8, 1px var(--rule) border, radius 6, 13px, paper background, ink — all values become tokens). Mapping: ui-text-field multiline.
      · [conditional !isEdit] div.muted — the create-only notice (inline ~11.5px, 1px var(--rule-2) top border). Mapping: tokened helper text.
      · [conditional isEdit AND onDelete] div.sh-delete-section — div.sh-delete-label "Delete stakeholder" + p.muted copy + button.btn.btn-danger (Icon "close" + "Delete stakeholder"). Mapping: tokened danger section + ui-button (error tokens).
    · div.modal-foot — [when invalid] span.modal-missing.muted "Required: …" + button.btn "Cancel" + button.btn.btn-primary submit. Mapping: ui-dialog actions slot.
· IssueSelector (sub-control, used twice) → div.issue-selector-block
  · [when any selected] div.issue-row — one span.tag.issue-chip.selected per value (title "Click to remove"; trailing "×" span). Mapping: ui-chip (filled, removable).
  · [when any available] div.issue-row.issue-row-available — one button.tag.issue-chip.available "+ {value}" per unselected company value. Mapping: ui-chip (dashed add variant).
  · [when NOT restrict] input.issue-custom-input — the unboxed custom-entry input, sized like the pills. Mapping: ui-text-field (dense).
· NotesModal → Fragment
  · div.modal-veil.show — onClick onClose. Mapping: ui-dialog scrim.
  · div.modal.notes-modal — Mapping: ui-dialog.
    · div.modal-head — a min-width-0 column div (eyebrow div "Notes": 11px uppercase 0.08em ink-3; then h2 stakeholder name) + button.btn.btn-ghost close (Icon "close", aria-label "Close").
    · div.modal-body — EITHER div.notes-empty.muted (empty state) OR div.notes-history → one div.notes-entry per note: div.notes-entry-meta (span.notes-entry-date + span.notes-entry-by, the latter with .muted for the "· legacy" variant) + div.notes-entry-body. Mapping: tokened list stack inside the dialog content.
    · form.notes-composer (onSubmit) — span.lbl "Add a new note" + textarea rows 3 + div.modal-foot (inline padding 0, border 0): span.muted "Dated today, posted as …" line (margin-right auto) + button.btn "Close" + button[type=submit].btn.btn-primary "Add note". Mapping: ui-dialog actions row; ui-text-field multiline + 2× ui-button.

UX HANDLER CENSUS (every event handler in the box's modules — StakeholderModal, IssueSelector, NotesModal in archive/src/sheet-modals.jsx; FilterPopover/SortPopover handlers are counted in the Lists box census; source order) —
StakeholderModal (33): (1) main veil onClick → onCancel. (2) confirm veil onClick → closes the confirm only. (3) confirm "Cancel" onClick → closes the confirm. (4) confirm "Delete" onClick → closes the confirm + onDelete(). (5) "View Stakeholder" onClick → viewMode true. (6) head close onClick → onCancel. (7) photo file input onChange → FileReader.readAsDataURL → draft.photo. (8) photo "Remove" onClick → photo null. (9) Organization input onChange. (10) Website input onChange. (11) "Add a person" checkbox onChange → isPerson. (12) Title select onChange. (13) custom-title input onChange → titleOther. (14) First name onChange. (15) Last name onChange. (16) Email onChange. (17) Phone onChange. (18) Phone onBlur → formatPhone(value). (19) X account onChange. (20) Category select onChange → cascade resets type to the new category's first. (21) Audience type onChange. (22) Market select onChange → cascade resets region to the market's first. (23) Region onChange. (24) Geography onChange. (25) Site select onChange → auto-fills state when the chosen site has one. (26) State onChange. (27) Priority onChange. (28) Status onChange. (29) Last contact date onChange. (30) Notes textarea onChange. (31) delete-section danger button onClick → confirmDelete true. (32) foot "Cancel" onClick → onCancel. (33) foot primary onClick → submit() (guarded no-op while invalid; the button is also disabled).
IssueSelector (5): (34) selected chip onClick → remove that value. (35) available chip onClick → add(titleCased value, deduped). (36) custom input onChange → local draft. (37) custom input onKeyDown — Enter: preventDefault + commitDraft; ",": preventDefault + commit everything up to and including the comma inline (split on commas, titleCase, dedup-append, clear — no setTimeout); Backspace on an EMPTY draft: removes the LAST selected value. (38) custom input onBlur → commitDraft when any pending text.
NotesModal (5): (39) veil onClick → onClose. (40) head close onClick → onClose. (41) composer form onSubmit → submit (preventDefault; no-op on blank text; calls onAdd then clears). (42) composer textarea onChange. (43) foot "Close" onClick → onClose. NOTE (mechanics, previously implicit): the "Add note" button is type=submit — it carries NO handler of its own and routes through the form's onSubmit (41).
Non-DOM wiring (not counted): the Owners MultiOwnerPicker onChange and the two IssueSelector onChange props are component wiring (MultiOwnerPicker's own internal handlers live in users.jsx and are counted with that capture); the FileReader onload callback inside (7) is part of that handler.
COUNT: 43 handlers (33 + 5 + 5), all accounted — every interaction was already described in the sections above; the census adds only the "Add note = type submit, no own handler" note.` },
                        { t: "Stakeholder profile (read-only modal) — the full field set & sections", done: true, d:
`StakeholderProfile (archive/src/profiles.jsx) is the READ-ONLY view of a single stakeholder, rendered as a centered modal over a dimmed veil. It is DISTINCT from the page-shell record.stakeholder surface — this one is a modal you open to inspect a stakeholder without entering edit mode. The "Edit stakeholder" action is the bridge into the editable StakeholderModal.

PROPS: stakeholder (subject), users, stakeholders (full array, used to swap subject when navigating from a community entry), community (full array), scores, team, getWorkspacesForStakeholder (fn id -> [workspace]), onClose, onEdit, onOpenWorkspace, updateCommunityApp, currentUser, companyIssues. D = STAKEHOLDER_DATA.

LOCAL STATE: subject (init = stakeholder prop; lets the modal re-target without unmounting); entryId (id of a community entry being viewed in a nested CommunityModal, init null); showAllEntries (bool, init false). On change of stakeholder.id, an effect resets: setSubject(stakeholder), setEntryId(null), setShowAllEntries(false). If subject is falsy, render null.

COMPUTED ON RENDER (let s = subject):
- affil = affiliatedCommunity(s.id, community||[]) — list of community engagements this stakeholder is affiliated with.
- cumulative = stakeholderCumulativeUSD(s.id, community||[]) — total committed USD.
- wc = D.weightedCoord(s.id, scores||{}, team||[]) — the team-weighted coordinate; RELATIONSHIP IS COMPUTED, never stored.
- relStatus = D.statusFor(wc.x, wc.y) — the status label/band for that coordinate.
- wsList = getWorkspacesForStakeholder ? getWorkspacesForStakeholder(s.id) : [].
- history = (s.notesHistory||[]).slice().sort by (b.at||"").localeCompare(a.at||"") — i.e. DESCENDING by timestamp (newest first).
- viewEntry = entryId && (community||[]).find(a => a.id === entryId).

STRUCTURE: veil <div class="modal-veil show" onClick=onClose> + <div class="modal stakeholder-modal profile-modal">.

HEADER (class prof-header):
- Avatar span: class "prof-avatar person" if s.isPerson else "prof-avatar org". If s.photo is set, style background = center/cover no-repeat url(s.photo) (the photo fills as cover). If NO photo, render an Icon: name "user" when s.isPerson, name "users" when org, class "ico".
- Title block (minWidth 0, flex 1):
  - prof-title = displayName(s) || s.name.
  - prof-sub = s.org, then if s.isPerson AND s.title is truthy append " · " followed by (s.title === "Other" ? s.titleOther : s.title). If not a person or no title, just s.org.
  - prof-tagline = StatusPill with status=relStatus (the computed team-weighted relationship), followed by span.prof-coords reading: x {wc.x.toFixed(1)} · y {wc.y.toFixed(1)} (one decimal each, middot separator).
- Header actions (prof-header-actions): if onEdit, a class "explainer-link" button labeled "Edit stakeholder" (calls onEdit); then a class "btn btn-ghost" close button aria-label "Close" with Icon name "close" (calls onClose).

BODY (class modal-body prof-body). Sections are introduced by a label div class "cm-section-label". Helper PRow renders a key/value row: <div class="prof-row"><div class="prof-k">{k}</div><div class="prof-v">{children}</div></div>. EMPTY string/falsy field values render literal "-".

SECTION "Identity" — a 2-column grid (class prof-grid) of PRow:
- Type: {s.category} · {s.type} (category and type joined by middot).
- Status: StatusDot value=s.status (the manual status dot, NOT the relationship).
- Market: s.market || "-".
- Region: s.region || "-".
- Site: if s.site and D.SITES exist, D.siteLabel(D.SITES.find(x => x.id === s.site) || {}) || "-"; else "-".
- State: if s.state, D.STATE_ABBR[s.state] || s.state; else "-".
- Geography: s.geography || "-".
- Last contact: if s.lastContact, formatDateLong(s.lastContact); else "-".
Then a FULL-WIDTH row (class prof-fullrow, NOT inside the grid): key "Priority", value PriorityPill value=s.priority.

SECTION "Contact" — prof-grid of PRow:
- Website: if s.url, an <a class="plain-link" href={normalizeUrl(s.url)} target="_blank" rel="noopener noreferrer"> showing the raw s.url text; else "-". normalizeUrl prefixes protocol if missing.
- Email: if s.email, <a class="plain-link" href={"mailto:"+s.email}>{s.email}</a>; else "-".
- Phone: if s.phone, formatPhone(s.phone); else "-".
- X account: s.xAccount || "-".

SECTION "Ownership & reach" (label literally "Ownership & reach"):
- Full-width row (prof-fullrow): key "Owners", value OwnersDisplay users={users} owners={s.owners||[]} size={22}.
- Full-width row: key "Workspaces", value = if wsList.length, an inline-flex wrap (gap 4) of chips, each <span class="tag"> plus " tag-clickable" if onOpenWorkspace is provided; clicking a chip calls onOpenWorkspace(w.id) then onClose() (if present). Chip text = w.name. If wsList is empty, "-".

TAGS / ISSUES — a two-column block (class prof-tagsissues) with two columns (class prof-ti-col), NOT a section label:
- Column "Tags": label div prof-k "Tags"; pills container prof-ti-pills = if (s.tags||[]).length, <Tags values={s.tags} /> (renders the first 3 tags as .tag chips, then a "+N" overflow rendered as a MUTED TEXT SPAN — <span class="muted">+N</span>, NOT a .tag chip, per the shared-primitives Tags entry); else <span class="muted">-</span>.
- Column "Issues": same pattern with s.issues, key "Issues".

SECTION "Community engagements":
- A cumulative row (class profile-cumulative): span.comm-meta-k "Cumulative committed"; span.profile-cumulative-val showing $ {cumulative.toLocaleString()} (US thousands separators) colored via inline style color = (cumulative > 0 ? var(--pos) : var(--ink-3)) — positive total is green, zero/none is muted ink.
- If affil.length === 0: muted line (fontSize 12.5, padding 4px 0) "No community engagements linked yet."
- Else a list (class profile-entry-list): map affil.slice(0,5) — the FIRST FIVE — each a <button class="profile-entry" title="Open application"> calling setEntryId(a.id). Button contents: profile-entry-main containing profile-entry-name = a.name and profile-entry-meta muted = {a.kind} · {a.stage}; then profile-entry-amt = communityEntryAmount(a); then Icon name "chevron-right" class "ico". If affil.length > 5, an "explainer-link" button (alignSelf flex-start, marginTop 2) labeled "View all {affil.length} engagements" that sets showAllEntries true.

SECTION "Notes":
- If history.length === 0 AND no s.notes: muted line (fontSize 12.5, padding 4px 0) "No notes recorded."
- Else if history.length: container prof-notes; map each note n (already sorted DESC by at). Resolve author by = users.find(u => u.id === n.by). Render prof-note with prof-note-meta = a span (fontFamily var(--mono), color var(--ink-2)) showing n.at ? formatDateLong(n.at) : "", and if author resolved a muted span " · {by.name}"; then prof-note-body = n.body. (The var(--mono) on the date span is an ORACLE-ONLY styling fact — see the Notes line of the REBUILD BUILD-MAP for how it maps under the no-mono design law.)
- Else (no history but s.notes exists): a single <p class="comm-card-summary">{s.notes}</p> (the legacy plain notes field).

NESTED COMMUNITY MODAL (when viewEntry is truthy): render CommunityModal with existing={viewEntry}, users, stakeholders||[], currentUser, companyIssues, initialView={true} (opens in READ-ONLY view mode). Its onOpenStakeholder(id) finds that stakeholder in the stakeholders array and, if found, calls setSubject(next) + setEntryId(null) — i.e. the profile re-targets to that stakeholder IN PLACE without closing. onCancel sets entryId null; onSubmit(app) calls updateCommunityApp(app) (if provided) then sets entryId null.

"VIEW ALL" OVERLAY (when showAllEntries is true): its own veil (modal-veil show, click closes) + a <div class="modal" style width 460, maxWidth calc(100% - 32px)>. Head (modal-head): an uppercase eyebrow (fontSize 10.5, letterSpacing 0.08em, uppercase, color var(--ink-3)) reading "Community engagements"; an h2 (margin 0) = displayName(s) || s.name; a btn btn-ghost close (Icon "close") setting showAllEntries false. Body (modal-body, gap 6) = profile-entry-list mapping the FULL affil array (not capped), each entry button identical to the inline version but on click sets showAllEntries false THEN setEntryId(a.id) — so choosing one closes the list and opens that engagement.

REBUILD BUILD-MAP (Canonical UI — never md-*/shadcn):
- Outer modal+veil = ui-dialog (centered, with scrim). Header avatar = the ui-* avatar primitive (photo cover background, else ui-icon "user"/"users").
- Header actions: the "Edit stakeholder" explainer-link = ui-button (variant text); the btn-ghost close = ui-icon-button with ui-icon "close" (aria-label "Close"). The "View all {N} engagements" explainer-link (Community engagements section) is the same ui-button text variant; the "View all" overlay's own head close is likewise a ui-icon-button "close".
- prof-title via Newsreader title token; prof-sub / coords via body ink-muted.
- StatusPill / StatusDot / PriorityPill = the existing zone-token-driven status components (single-sourced --ui-sys-zone-* / status tokens).
- Identity & Contact grids = key/value rows assembled from ui-* primitives (2-col); links = real anchors styled by tokens.
- Workspace + tag/issue chips = ui-chip (clickable variant for workspaces).
- Owners = OwnersDisplay avatar stack.
- Community engagement rows = ui-list rows (leading name+meta, trailing amount, trailing ui-icon chevron).
- Notes = a ui-list of note rows, each row = a meta line + a body line. The meta date (oracle: fontFamily var(--mono), color var(--ink-2)) does NOT keep the mono face — the design law is "No mono, no other families" and the token contract ships no mono token; render the formatDateLong date in the BODY face (Inter) with tabular numerals (tnum) in muted ink (--ui-sys-on-surface-muted), the " · {author name}" suffix in the same muted ink, and the note body in normal body ink. var(--mono) is oracle-only and must not be reintroduced as a token.
- Section labels = the cm-section-label eyebrow style (uppercase, tracked).
- Nested community detail = a stacked ui-dialog. "View all" = a second stacked ui-dialog. All icons via ui-icon ligatures (search/close/chevron-right/user/users). No ad-hoc div/span primitives, no inline color except the token references (var(--pos)/var(--ink-3) become --ui-sys-* equivalents).

SKELETON TREE (literal region tree extracted from the archive/src/profiles.jsx JSX — the build assembles against THIS tree, never prose. One node per line, nested in source order. Each node: what it is → what it contains → Canonical UI mapping. Nodes marked "layout row/column — token-only container" are pure layout wrappers with no component identity; wrapper structure otherwise lives INSIDE the mapped ui-* component's shadow DOM. Bracketed [conditions] gate a node's render.)

SURFACE A — THE PROFILE MODAL (the component returns a React fragment; surfaces B and C stack ABOVE it conditionally):
div.modal-veil.show [onClick=onClose] — dimming scrim → absorbed into ui-dialog (its scrim)
div.modal.stakeholder-modal.profile-modal — the centered card → ui-dialog (container)
  div.prof-header — header row: avatar · titles · actions → ui-dialog headline slot (layout row — token-only container)
    span.prof-avatar.person|.org — [s.photo] center/cover background photo; [no photo] contains Icon "user" (person) or "users" (org), class ico → ui-avatar (photo/icon fallback)
    div [inline minWidth:0; flex:1] — titles block (layout column — token-only container)
      div.prof-title — displayName(s)||s.name → title text (Newsreader title token)
      div.prof-sub — org, optionally " · " + title → body muted text
      div.prof-tagline — pill + coords (layout row — token-only container)
        StatusPill(relStatus) → ui-chip zone variant (--ui-sys-zone-* tokens)
        span.prof-coords — "x N.N · y N.N" → muted tnum body text
    div.prof-header-actions — (layout row — token-only container)
      [onEdit] button.explainer-link "Edit stakeholder" → ui-button variant text
      button.btn.btn-ghost [aria-label "Close"] containing Icon "close" → ui-icon-button
  div.modal-body.prof-body — scrollable vertical section stack → ui-dialog content slot (layout column)
    div.cm-section-label "Identity" → section eyebrow (token type style)
    div.prof-grid — 2-column key/value grid (layout grid — token-only container)
      div.prof-row ×8 — each contains div.prof-k (key) + div.prof-v (value); the 8 rows in order: Type, Status (contains StatusDot), Market, Region, Site, State, Geography, Last contact → key/value row primitive; StatusDot = the dot+label status primitive
    div.prof-fullrow — div.prof-k "Priority" + div.prof-v containing PriorityPill → full-width key/value row + ui-chip priority variant
    div.cm-section-label "Contact"
    div.prof-grid — 4 prof-row (prof-k + prof-v): Website (a.plain-link, target _blank), Email (a.plain-link mailto), Phone (text), X account (text) → key/value rows; links = real tokened anchors
    div.cm-section-label "Ownership & reach"
    div.prof-fullrow — "Owners" + div.prof-v containing OwnersDisplay(size 22) → ui-avatar-stack (read-only)
    div.prof-fullrow — "Workspaces" + div.prof-v: [wsList.length] span [inline-flex; wrap; gap:4] (layout row — token-only container) of span.tag[.tag-clickable] ×wsList; [empty] "-" → ui-chip set (clickable variant when onOpenWorkspace)
    div.prof-tagsissues — two-column tags/issues block, NO section label above it (layout row — token-only container)
      div.prof-ti-col — div.prof-k "Tags" + div.prof-ti-pills containing Tags(s.tags) or span.muted "-" → ui-chip group (first-3 + "+N" overflow per the Tags primitive)
      div.prof-ti-col — div.prof-k "Issues" + div.prof-ti-pills containing Tags(s.issues) or span.muted "-" → ui-chip group
    div.cm-section-label "Community engagements"
    div.profile-cumulative — span.comm-meta-k "Cumulative committed" + span.profile-cumulative-val [inline color var(--pos) or var(--ink-3)] → stat row, token colors only
    [affil empty] div.muted [inline 12.5px; padding 4px 0] "No community engagements linked yet." → muted body text
    [affil nonempty] div.profile-entry-list — entry stack (layout column — token-only container)
      button.profile-entry ×min(affil.length,5) [title "Open application"] → ui-list interactive row
        span.profile-entry-main — (layout column) span.profile-entry-name + span.profile-entry-meta.muted "{kind} · {stage}"
        span.profile-entry-amt — communityEntryAmount(a) → trailing amount text (tnum)
        Icon "chevron-right" class ico → trailing ui-icon
      [affil.length>5] button.explainer-link [inline alignSelf:flex-start; marginTop:2] "View all N engagements" → ui-button variant text
    div.cm-section-label "Notes"
    [no history AND no s.notes] div.muted [12.5px; 4px 0] "No notes recorded."
    [history nonempty] div.prof-notes — note stack (layout column — token-only container)
      div.prof-note ×n → ui-list row (non-interactive)
        div.prof-note-meta — span [inline fontFamily var(--mono); color var(--ink-2)] date + [author resolved] span.muted " · {name}" → meta line (Inter tnum muted at rebuild, per the Notes build-map line)
        div.prof-note-body — n.body → body text
    [no history but s.notes] p.comm-card-summary — s.notes → body paragraph

SURFACE B — NESTED COMMUNITY MODAL [viewEntry truthy]: mounts the full CommunityModal component (initialView true) stacked above surface A. Its internal tree is owned by the Community-modal capture box, not re-drawn here → stacked ui-dialog.

SURFACE C — "VIEW ALL" OVERLAY [showAllEntries true] (its own fragment, stacked above surface A):
div.modal-veil.show [onClick → setShowAllEntries(false)] → stacked ui-dialog scrim
div.modal [inline width:460; maxWidth:calc(100% - 32px)] → ui-dialog
  div.modal-head — head row (layout row — token-only container)
    div [inline minWidth:0] — (layout column)
      div [inline 10.5px; letterSpacing .08em; uppercase; var(--ink-3)] "Community engagements" → eyebrow (token type style)
      h2 [inline margin:0] — displayName(s)||s.name → title (Newsreader)
    button.btn.btn-ghost [aria-label "Close"] containing Icon "close" → ui-icon-button
  div.modal-body [inline gap:6] → ui-dialog content slot
    div.profile-entry-list — FULL affil list (not capped) (layout column)
      button.profile-entry ×affil.length — identical anatomy to the surface-A entry rows → ui-list interactive rows

CLASSNAME ACCOUNTING: every className region in profiles.jsx appears above — modal-veil/show, modal, stakeholder-modal, profile-modal, prof-header, prof-avatar (person/org), ico, prof-title, prof-sub, prof-tagline, prof-coords, prof-header-actions, explainer-link, btn, btn-ghost, modal-body, prof-body, cm-section-label, prof-grid, prof-row, prof-k, prof-v, prof-fullrow, plain-link, tag, tag-clickable, prof-tagsissues, prof-ti-col, prof-ti-pills, muted, profile-cumulative, comm-meta-k, profile-cumulative-val, profile-entry-list, profile-entry, profile-entry-main, profile-entry-name, profile-entry-meta, profile-entry-amt, prof-notes, prof-note, prof-note-meta, prof-note-body, comm-card-summary, modal-head. None silently dropped; the pills-inline markup inside Tags is absorbed into the Tags primitive (single-sourced in the Shared-UI-primitives box). The tree confirms the box body — no corrections needed.

UX HANDLER CENSUS (archive/src/profiles.jsx — every event handler in the module, enumerated with exact behavior):
1. Surface-A veil onClick → onClose (close the profile).
2. Header "Edit stakeholder" button onClick → onEdit (bridge to the editable StakeholderModal).
3. Header ghost close button onClick → onClose.
4. Workspace chip onClick (attached ONLY when onOpenWorkspace is provided; otherwise the chip has no handler and no tag-clickable class) → onOpenWorkspace(w.id), then onClose() if onClose present.
5. profile-entry button onClick (inline top-5 list) → setEntryId(a.id) (opens the nested CommunityModal on that engagement).
6. "View all N engagements" button onClick → setShowAllEntries(true).
7. CommunityModal onOpenStakeholder(id) callback → find that stakeholder in stakeholders; if found, setSubject(next) + setEntryId(null) (re-target in place).
8. CommunityModal onCancel callback → setEntryId(null).
9. CommunityModal onSubmit(app) callback → updateCommunityApp(app) if provided, then setEntryId(null).
10. Surface-C veil onClick → setShowAllEntries(false).
11. Surface-C ghost close button onClick → setShowAllEntries(false).
12. Surface-C profile-entry button onClick → setShowAllEntries(false) THEN setEntryId(a.id) (close the list, open that engagement).
12 handlers (9 DOM onClick sites + 3 CommunityModal callback props), all accounted — every one is already described in the body above; no missing interactions found. (The [stakeholder.id] reset effect is state synchronization, not an event handler; it is captured under LOCAL STATE.)` },
                        { t: "Plan algorithm — sector/type model catalog, plan selection, workspace→plan stakeholder flow", done: true, d:
`SCOPE — this captures the PLAN ALGORITHM and how stakeholders flow into a plan. It is APP KNOWLEDGE, not the full plan-page element spec (sections/fields/validation come later, when we build the plan + stakeholder pages). The algorithm is NOT the plan: the algorithm tells you WHICH plan it is, and that classification dictates some CUSTOM parts of the plan page built later.

THE ALGORITHM CATALOG (AUTHORITATIVE — from the "Stakeholder Engagement Modeling" doc; these supersede the simplified versions that were in data.js). Each model is a plan-algorithm formula: a weighted blend of 4 FACTORS summing to 1.0, scored 0–1 per factor. The models are "building blocks for customizable persona modeling," meant to be enriched by other data sets, surveys, ongoing stakeholder feedback, and polling (ties to the Personas / polling add-ons).

IMPORTANT — FACTOR KEYS ARE MODEL-SCOPED, not a single global catalog. The same abbreviation can mean different things in different models: CE = "Consumer Expectations" (Retail) vs "Community Engagement" (Government/Nonprofit/Education) vs "Customer Engagement" (Auto); SI = "Sustainability Initiatives" (Retail) vs "Service Improvement" (Government); IC = "Inclusive Communication" (DEI) vs "Innovation Collaboration" (Energy); CI = "Collaborative Innovation" (Shared Value) vs "Community Involvement" (DEI); FS = "Financial Sustainability" (Union) vs "Funding Sustainability" (Nonprofit). Always read a factor's label within its own model.

GENERALIZED / DEFAULT model — general = (I × .25) + (U × .25) + (EP × .25) + (IR × .25). I=Influence (capacity to affect the org's decisions/operations/strategy), U=Urgency (immediacy of the concern/need to engage), EP=Engagement Potential (likelihood engaging yields a positive outcome), IR=Impact on Reputation (potential to move reputation up or down). This is the basic option, balanced across the four, adaptable to any context.

PLAN-TYPE / SCENARIO models — 7:
• General Engagement (basic default) — general = I .25 · U .25 · EP .25 · IR .25. Foundational balanced engagement.
• Generating Shared Value — mv = MV .4 · TB .3 · CI .2 · I .1. Deepen mutual, value-creating partnerships (Mutual Value, Trust-Building, Collaborative Innovation, Influence).
• Corporate Crisis — cr = I .3 · U .35 · EP .15 · RI .2. MACHINE KEYS: the crisis model's factor keys as STORED AND SCORED are plain U and EP — data.js: factors = [["I",.3],["U",.35],["EP",.15],["RI",.2]] — and the alignment engine's complete signal map (see the "Relationship recommendation alignment" box) has entries only for U and EP. The doc writes this formula with "U_adjusted" / "EP_adjusted": those are the doc's crisis-variant DEFINITIONS of the same U and EP keys (per the FACTOR KEY box), NEVER separate key strings. A rebuild that keyed the model on "U_adjusted"/"EP_adjusted" would route 50% of the crisis model's weight through the unknown-key 0.5 fallback (which is forbidden — every factor must resolve to a real signal) and break the factor readout's SEP_FACTORS label lookup. Purpose: crisis management, reputation repair, continuity; Urgency & Engagement-Potential take their crisis-adjusted definitions; RI = Reputation Impact (perception during a crisis).
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

CORRECTION vs the old code — data.js had DIVERGENT (placeholder) sector formulas for Utilities, Government, Healthcare, Nonprofit, Agriculture, and Auto (it reused generic factors like CTS/CT/SI/I). The DOC formulas above are authoritative and replace them; the goal-family models and Energy/Technology/Retail/Financial/Education matched. (The crisis model's keys are NOT part of this correction: the doc and data.js agree on the crisis weights, and the stored keys are U/EP as stated in the crisis bullet — only the doc's "_adjusted" NAMING is a definition gloss, not a key change.)

THE 12-STEP ENGAGEMENT FRAMEWORK (the doc's backbone; a plan moves through these phases) — PURPOSE: 1 Set goals for your organization · 2 Issue identification · 3 Stakeholder identification · 4 Stakeholder prioritization. PLAN: 5 Landscape analysis · 6 Cross-functional alignment · 7 Research & listening sessions · 8 Early stakeholder analysis & modeling. EXECUTE: 9 Launch campaign · 10 Ongoing stakeholder analysis · 11 Collaborate with stakeholders · 12 Realize shared value where possible. (The doc also includes a worked Energy-sector example — scenario, goals, prioritization modeling, polling, personas-by-category, an execution checklist, a community-investment plan, predictions/reactions, and a communication strategy — reference material for the plan-page build later.)

HOW STAKEHOLDERS ENTER A PLAN (the flow):
1) The workspace team decides to develop a plan and PICKS an algorithm (sector + plan type; basic default available).
2) They INTEGRATE relevant stakeholders FROM the workspace. Each stakeholder already carries a PRIORITY (manual High/Medium/Low, shown in the workspace/Lists table; set on the stakeholder page — not yet built) AND an already-scored RELATIONSHIP (the team's weighted zone from Scoring).
3) HIGH-PRIORITY stakeholders must surface in the plan BEFORE others (ordered by the existing Priority: High → Medium → Low).
4) FREE COMPOSITION — the team may also: add ANY teammate-chosen stakeholder from the workspace regardless of algorithm/recommendation; add ANY stakeholder from MASTER that isn't in the workspace; or CREATE a NEW stakeholder for the plan → it is added to BOTH the plan and the workspace. (Plan + stakeholder creation built later; Master/workspace already captured via their tables.)

THE RELATIONSHIP → ALGORITHM ALIGNMENT — DESIGNED (see the "Relationship recommendation alignment" box): each stakeholder's scored relationship + issues + community ties + category-affinity produce a "Plan Fit" BAND (High/Med/Low) + reason + the relationship's prescribed MOVE, weighted by the picked plan algorithm. It is advisory, transparent, overridable, and NEVER the source of a stakeholder's manual Priority. (The old code's per-stakeholder 0–100 attempt is superseded by that designed model.)

UI BUILD-MAP (Canonical UI ONLY — every element below is a real component from design-system/manifest.json; no md-*/Material, no shadcn, no Tailwind, no div/span primitives; this paragraph supersedes the pre-ruling "kind only" wording per the CANONICAL-UI-ONLY law):
• ALGORITHM PICK = two ui-select controls in the plan setup/edit surface, each populated with ui-option children (ui-select: outlined dropdown, props label/value/disabled; states open/has-value/focus-visible/disabled):
  – ui-select label "Industry sector" — 11 ui-option entries in catalog order, option value = model id, option text = model name: energy "Energy" · technology "Technology" · retail "Retail" · financial "Financial" · education "Education" · utilities "Utilities" · government "Government & Public Sector" · healthcare "Healthcare & Pharma" · nonprofit "Nonprofit & Social Impact" · agriculture "Big Agriculture" · auto "Auto Manufacturing". There is NO empty/"none" sector option; a new plan starts preselected on the first entry (the oracle hardcodes sectorModel: "energy" for a new plan — archive/src/plan.jsx line 52 — and the rebuild keeps a valid preselected value, never an empty select).
  – ui-select label "Type of plan" — 7 ui-option entries in catalog order: general "General Engagement" · shared-value "Generating Shared Value" · crisis "Corporate Crisis" · activist "Activist Shareholders" · dei "Diversity, Equity & Inclusion" · community "Community Investment" · union "Union Negotiations". Default preselected = general (the basic default).
  – BEHAVIOR: changing either select persists sectorModel/goalModel on the plan and re-derives everything downstream (the plan's custom sections and every Plan Fit recommendation recompute immediately). Robustness rule from the oracle, KEEP IT: an unknown/missing stored model id resolves to the FIRST model in its list (oracle: find(m => m.id === p.sectorModel) || SEP_SECTOR_MODELS[0], same for goal) — a plan never renders with no algorithm.
• PLAN STAKEHOLDER LIST = ui-data-table (columns + data set via JS properties; density "comfortable"; selectable false; sticky header; row-hover + empty states from the component). BINDING ELEMENT-6 ROW SCHEMA (declared ONCE, HERE — this is the single rebuilt row/column spec every other mention assembles; the Plan page box's ORACLE GROUND TRUTH captures the old 4-column table — Stakeholder · Type · Relationship · Priority, where the lone Priority cell IS the overridable algorithm suggestion and rows sort by effective band then score — and that oracle schema is SUPERSEDED by this one; it is captured for losslessness, never the build target). Columns, in order: Stakeholder (displayName || name) · Type · Relationship pill · Priority pill (the stakeholder's MANUAL High/Medium/Low — the algorithm NEVER writes this column) · Plan Fit pill (the suggested FIT BAND, carrying the ✦ suggested / "·set" overridden mark; this is the manager-override cell) · Reason + Move (the one-line plain-English reason and the zone's prescribed move, per the "Relationship recommendation alignment" box). OVERRIDE TARGET (explicit, resolves the two-pill ambiguity): plan.priorityOverrides{shId->band} attaches to the PLAN FIT cell — a manager override replaces the SUGGESTED fit band for this plan, never the stakeholder's manual Priority pill (Fit is advisory and never the source of manual Priority). ROW ORDER is NOT a sortable free-for-all — default order is the flow's mandate: manual Priority High → Medium → Low first, then the remaining stakeholders by effective Plan Fit band (override || suggestion) High → Medium → Low, tie-broken within a band by the preserved numeric core descending (INTERNAL only — the number never renders; see the alignment box). The pills render as ui-chip pills driven ONLY by tokens:
  – PRIORITY pill = ui-chip (assist variant, non-interactive presentation) showing High / Medium / Low, colored solely by the single-sourced priority/status tokens — the same PriorityPill composition used in the Lists table box; never re-implemented per screen.
  – RELATIONSHIP pill = ui-chip (assist variant) showing the stakeholder's weighted-coordinate ZONE name, inked/bordered solely by the --ui-sys-zone-* tokens (the 14-zone single source shared with Map/Lists/Help) — the StatusPill composition.
  – PLAN FIT pill = ui-chip (assist variant) showing the fit BAND High / Medium / Low, token-colored, carrying the ✦/"·set" mark and the manager override popover per the Plan page box's RETARGET (band-only surfaces — never the numeric score).
• ADD CONTROLS = one ui-button (variant "tonal", type "button", label "Add stakeholder", leading ui-icon ligature add) serving as the anchor (by id) for a ui-menu (anchor = the button's id; full keyboard nav) with exactly three ui-menu-item entries:
  – "From this workspace" (leading ui-icon group) → picker over the workspace's stakeholders not yet in the plan; picker = ui-dialog containing a ui-autocomplete over that set; free choice regardless of algorithm/recommendation.
  – "From Master" (leading ui-icon list_alt) → same picker pattern over Master stakeholders not in the workspace; adding one puts it in the plan AND the workspace.
  – "Create new" (leading ui-icon person_add) → opens the stakeholder modal (the ui-dialog specified losslessly in the "Create / edit stakeholder modal (StakeholderModal)" box — ui-text-field/ui-select/ui-switch/ui-chip-set fields); on save the new stakeholder is added to BOTH the plan and the workspace, and the Reminders system message fires ("New stakeholder added: {name} ({type}). Please score them on the Scoring tab.").
• RECOMMENDATION SURFACE = as specified in the "Relationship recommendation alignment" box and assembled into the BINDING ELEMENT-6 ROW SCHEMA above: per stakeholder a FIT BAND pill (ui-chip assist variant, High/Medium/Low, token-colored), a plain-English one-line REASON (plain text in the row, --ui-sys-on-surface ink), and the zone's prescribed MOVE — NEVER a numeric score in the UI (the oracle's 0–100 readout — including its "{score}/100" popover header and ✦ tooltip copy — is a do-not-replicate display; its math is preserved in that box as the band's numeric core, cut-points 67/40, surviving only as the band thresholds and the internal sort tie-break).
• All icons are Material Symbols ligatures via ui-icon; every visual decision lives in --ui-sys-* tokens; no component stylesheet overrides, no inline color/size, no ad-hoc CSS anywhere in this surface.` },
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

WHAT WE ACTUALLY HAVE PER STAKEHOLDER: the scored RELATIONSHIP position (x = support/alignment -10..10, y = influence/importance -10..10) -> a ZONE (one of 14, each with a strategy + action); the manual PRIORITY (High/Med/Low); the stakeholder's ISSUES; CATEGORY/TYPE; and COMMUNITY TIES. The plan picks a SECTOR + PLAN-TYPE algorithm (4 weighted factors each).

THE DESIGN — "PLAN FIT" (advisory, transparent, overridable). Two outputs per stakeholder: a FIT BAND (why they matter to THIS plan) and a MOVE (what to do), with a plain-English reason. We never emit a fake precise score.
OBSERVABLE SIGNALS (0–1, all already in the app): INFLUENCE = normalized y; SUPPORT = normalized x, and OPPOSITION/RISK = its inverse (the zone band already summarizes posture: negative/neutral/positive); ISSUE RELEVANCE = overlap of the stakeholder's issues with the plan's issues; COMMUNITY TIE = affiliated community investments; CATEGORY AFFINITY = how central this stakeholder's CATEGORY is to this PLAN TYPE.
CATEGORY AFFINITY (a PA-veteran fact, a small per-plan-type weight table): e.g. Union Negotiations -> Our People; Community Investment / DEI -> Communities + Our People; Activist Shareholders -> Investors; Corporate Crisis -> Government + Communities + Media; Shared Value -> Industry + Communities; sector plans tilt toward their natural regulators/communities/industry. (Editable table; not hardcoded magic.)
FACTOR -> SIGNAL LEXICON (stated OPENLY, coarse on purpose — no hidden precision): each algorithm factor falls into one observable bucket, so the plan's 4 factor weights become weights on the signals. Influence-type (I, FS-influence) -> INFLUENCE; alignment/trust/engagement (SA, TB, EC, EP, CE-engagement, MV) -> SUPPORT; reputation/urgency/risk (U, IR, RI, RM, ST) -> OPPOSITION/RISK; community/issue/sustainability (CNA, PD, CTS, CI-community, ES, SI, IM) -> ISSUE RELEVANCE + COMMUNITY TIE; sector-specific factors get an EXPLICIT assignment (never "nearest bucket" hand-waving). NARRATIVE-ONLY CAVEAT (binding-precedence rule): this paragraph's coarse buckets are design RATIONALE, not the computation — where they disagree with the authoritative map below, THE MAP IS BINDING and a builder implements ONLY the map. Known disagreements, called out so nobody computes from the prose: U/RI/IR/RM (and the extension's ST) compute the URGENCY blend 0.5·power + 0.5·opp, not a pure OPPOSITION/RISK signal; EP/EC/CE compute the ENGAGE blend 0.5·power + 0.5·align, not pure SUPPORT; MV and TB are commTie+align BLENDS, not pure SUPPORT; SI computes pure align; IM computes pure commTie. The COMPLETE factor->signal map — the oracle's verbatim map M plus the required 14-factor EXTENSION for the doc-only catalog factors — is spelled out below in this box; NO catalog factor may ever fall to the neutral fallback. (The FACTOR KEY box carries each factor's definition; the signal mapping lives HERE.)
PLAN FIT = a weighted blend of the stakeholder's observable signals using the picked plan's signal weights (derived from its factors via the lexicon) plus the CATEGORY AFFINITY for the plan type -> normalized -> FIT BAND High / Medium / Low. The UI shows the BAND + a one-line REASON ("High influence, on-issue, community-tied" or "Opposed but high-influence — defend"), never a number.
THE MOVE = the relationship ZONE's strategy + action (already defined in the 14-zone engine), framed by the plan type — e.g. a Defend-zone stakeholder in a Crisis plan -> "neutralize threat, defend license"; a Strategic-Partner-zone stakeholder in a Community Investment plan -> "mobilize as surrogate / co-investor." RECOMMENDATION = FIT BAND + REASON + MOVE.

ORDERING in plan element 6: (1) manual PRIORITY first (High->Low) — never overridden by Fit; (2) then the algorithm-aligned recommendations by FIT band (High->Low). The team may still freely add anyone (workspace / Master / new) regardless of Fit. OVERRIDE TARGET (explicit): a manager's per-plan override (priorityOverrides) replaces the SUGGESTED fit band on the Plan Fit cell — never the stakeholder's manual Priority; the single binding rebuilt row/column spec for element 6 lives in the "Plan algorithm — sector/type model catalog" box (BINDING ELEMENT-6 ROW SCHEMA).

WHY THIS IS THE HONEST SUCCESSOR TO THE OLD per-stakeholder scoring attempt — same observable inputs (it too reduced everything to ~7 signals), but: (a) the factor->signal mapping is DISCLOSED, not hidden; (b) output is a FIT BAND + plain reason, not an arbitrary 0–100; (c) it is anchored in the relationship's prescribed MOVE (the actual PA substance), not a lone number; (d) it adds CATEGORY AFFINITY, which is how a real public-affairs strategist actually triages by plan type; (e) it is advisory, overridable, and never overrides manual Priority; (f) it is never called SEP. LATER, polling/personas (premium) can sharpen these signals; until then Fit runs on relationship + issues + community + category affinity.

================================================================
THE ORACLE'S ACTUAL COMPUTATION (archive/src/plan.jsx sepScore + sepFactorSignal) — captured VERBATIM as the concrete numeric starting point the designed "Plan Fit" successor evolves from. The old code DID emit a precise 0–100 score and band; the design replaces the hidden 0–100 with a disclosed FIT BAND, but the rebuild must KNOW exactly what the old math was so nothing is invented at build time. (Everything below is in archive/src/plan.jsx ~lines 896–999.)

PER-STAKEHOLDER SIGNAL DERIVATION (function sepScore(s, sector, goal, ctx), ctx = { scores, team, community, planIssues }):
- clamp01(v) = v < 0 ? 0 : v > 1 ? 1 : v.
- wc = D.weightedCoord(s.id, ctx.scores or {}, ctx.team or []) -> { x, y } in the -10..10 map space.
- power  = clamp01((wc.y + 10) / 20)   [vertical axis = influence / importance]
- align  = clamp01((wc.x + 10) / 20)   [horizontal axis = supportive alignment]
- opp    = 1 - align                    [opposition / risk]
- urgency = clamp01(0.5 * power + 0.5 * opp)
- engage  = clamp01(0.5 * power + 0.5 * align)
- issueRel: pIssues = ctx.planIssues or []; sIssues = s.issues or []; if pIssues.length > 0 then clamp01(count of sIssues that are also in pIssues / pIssues.length) else 0.5 (i.e. neutral 0.5 when the plan has no issues).
- commTie = clamp01(affiliatedCommunity(s.id, ctx.community or []).length / 2)  [2 or more affiliated community entries saturate to 1.0].
- sig = { power, align, opp, urgency, engage, issueRel, commTie }.

SEP FACTOR SIGNAL LEXICON (function sepFactorSignal(key, sig)) — EVERY factor key maps to a base-signal expression; this is the COMPLETE map M, verbatim from plan.jsx ~903–913. Any key NOT in M falls back to a neutral 0.5 (so an unknown factor neither inflates nor tanks the score):
- I    = power
- FS   = power
- RC   = 0.7 * power + 0.3 * opp
- OR   = 0.6 * power + 0.4 * opp
- U    = urgency
- RI   = urgency
- IR   = urgency
- RM   = urgency
- NP   = opp
- EP   = engage
- SE   = engage
- EC   = engage
- CE   = engage
- MR   = engage
- DC   = engage
- DT   = engage
- TI   = engage
- IS   = engage
- SA   = align
- LTSA = align
- SI   = align
- CT   = align
- ER   = align
- MV   = 0.5 * commTie + 0.5 * align
- TB   = 0.5 * align + 0.5 * commTie
- CI   = 0.5 * commTie + 0.5 * engage
- CTS  = 0.5 * commTie + 0.5 * align
- CNA  = commTie
- PD   = commTie
- IM   = commTie
- DI   = issueRel
- IC   = issueRel
- EO   = issueRel
- IE   = issueRel
- ES   = issueRel
- (fallback) any other key = 0.5
Bucket summary for cross-checking: I/FS -> power; U/RI/IR/RM -> urgency; EP/SE/EC/CE/MR/DC/DT/TI/IS -> engage; SA/LTSA/SI/CT/ER -> align; CNA/PD/IM -> commTie; DI/IC/EO/IE/ES -> issueRel; NP -> opp; RC/OR are power/opp blends; MV/TB/CI/CTS are commTie blends.

REQUIRED EXTENSION — THE 14 DOC-ONLY FACTORS (forward-design, NOT in the oracle; the rebuild MUST add these to the map). The oracle's M covers only the 35 factor keys in data.js SEP_FACTORS (M and SEP_FACTORS carry the same 35 keys — count verified against data.js and plan.jsx), because data.js shipped PLACEHOLDER sector formulas for Utilities/Government/Healthcare/Nonprofit/Agriculture/Auto built from generic keys — so the oracle never actually hit the 0.5 fallback. The AUTHORITATIVE catalog (the "sector/type model catalog" box, from the doc) replaces those placeholders with formulas using 14 keys that are in NEITHER M NOR data.js SEP_FACTORS: PS, TO, ST, RA, SDI, MI, PE, HPR, AE, SAP, TA, MA, EA, SCS. Left unmapped, THREE of the four factors of the doc Utilities model (PS, TO, ST — 65% of its weight; the fourth, RC at .35, is already in M) and most factors of the Government/Healthcare/Nonprofit/Agriculture/Auto models would silently score neutral 0.5, gutting Plan Fit for those plans. DO NOT REPLICATE that hole. Explicit signal assignments (same disclosed lexicon families as M; each is a required map entry in the rebuild):
- PS  (Price Sensitivity, Utilities)                 = 0.5 * issueRel + 0.5 * opp   [a pricing grievance is an on-issue opposition signal]
- TO  (Transparency in Operations, Utilities)        = engage                        [trust built through engagement]
- ST  (Stakeholder Trust, Utilities)                 = urgency                       [the U/IR/RI/RM opposition-risk family, per the design lexicon above]
- RA  (Regulatory Alignment, Government)             = align                         [alignment family, like SA]
- SDI (Service Delivery Innovation, Government)      = engage                        [innovation family, like TI/IS/DT/DC]
- MI  (Medical Innovation, Healthcare)               = engage                        [innovation family]
- PE  (Patient Engagement, Healthcare)               = engage
- HPR (Healthcare Provider Relationships, Healthcare)= 0.5 * commTie + 0.5 * align  [relationship-strength blend, like CTS/TB]
- AE  (Advocacy Effectiveness, Nonprofit)            = issueRel                      [issue-advocacy family, like DI/ES]
- SAP (Sustainable Agricultural Practices, Agriculture) = issueRel                   [sustainability family, like ES]
- TA  (Technological Adoption, Agriculture)          = engage                        [innovation family]
- MA  (Market Access, Agriculture)                   = engage                        [market family, like MR]
- EA  (Electrification Acceleration, Auto)           = engage                        [innovation family]
- SCS (Supply Chain Sustainability, Auto)            = issueRel                      [sustainability family, like ES]
The neutral-0.5 fallback SURVIVES only as a robustness net for a genuinely unknown key (e.g. bad data); with this extension no catalog factor ever reaches it. Corollary (same gap, display side): the oracle's SEP_FACTORS label/desc table also lacks these 14 keys, so the old factor readout and "top factors" tooltip would show bare keys with no description for them — the rebuild's factor catalog must carry a label + definition for every FACTOR KEY entry (the FACTOR KEY box is the source of those definitions).

MODEL SCORE + OVERALL SCORE/BAND:
- modelScore(model) = weighted mean of its factor signals: for each [k, w] in model.factors, acc += w * sepFactorSignal(k, sig) and wsum += w; return wsum ? acc / wsum : 0. (Side effect: merged[k] += w accumulates each factor's combined weight across BOTH models for the "top factors" readout.)
- score01 = 0.5 * modelScore(sector) + 0.5 * modelScore(goal)   [equal blend of the picked sector model and goal/plan-type model].
- score = Math.round(score01 * 100)   [the displayed 0–100].
- BANDS: score >= 67 -> "High"; score >= 40 -> "Medium"; else "Low".
- top (the "weighs ..." readout) = Object.entries(merged) sorted by combined weight descending, first 3, mapped to SEP_FACTORS[k].label (or k) — the three highest-combined-weight factors across both models.
- MODEL-SCOPED TOP-FACTORS RULE (forward-design, REQUIRED — resolves a bare-key label collision the oracle math above creates under the authoritative catalog; the oracle behavior stands as capture only): merged[] accumulates by BARE key across BOTH models and resolves each key to ONE label, but factor keys are MODEL-SCOPED (the FACTOR KEY box: "Always read a factor's label within its own model"). Under the doc catalog, real picks collide — Energy (sector) IC "Innovation Collaboration" .2 + DEI (goal) IC "Inclusive Communication" .3 would merge into a single anonymous .5 entry (a near-certain top factor), and Nonprofit (sector) FS "Funding Sustainability" .25 + Union (goal) FS "Financial Sustainability" .2 would merge to .45 — so the readout could not say WHICH meaning it weighs. The rebuild accumulates the top-factors entries keyed by (model, factor key): a key shared by both picked models yields TWO candidate entries, one per model, each at its OWN model's weight and carrying its OWN model's label — the two are never summed into one anonymous label — and the top-3 sort runs over these model-scoped entries. EVERY "weighs …" surface (the ✦ suggestion tooltip, the override-popover header, the reason line, the in-editor factor readout) shows these model-scoped labels. (modelScore itself is unaffected — it already evaluates each factor inside its own model.)

THE DESIGN'S RELATIONSHIP TO THIS MATH: the successor keeps these exact observable signals (power/align/opp/urgency/engage/issueRel/commTie) and the same equal sector+plan-type blend, but (a) replaces the hidden round(score01*100) number with a DISCLOSED FIT BAND + plain reason, (b) keeps the 67/40 thresholds as the band cut-points for High/Medium/Low, (c) surfaces the "top 3 factors" as the human-readable reason rather than as tooltip fine print — with model-scoped labels per the MODEL-SCOPED TOP-FACTORS RULE above, (d) adds CATEGORY AFFINITY on top of the factor blend, and (e) EXTENDS the factor map with the 14 doc-only entries above so the authoritative catalog is fully scoreable. Rename all SEP* internals (sepScore/sepFactorSignal/SEP_*) per the naming rule; the formulas above are preserved as the numeric core.` },
                                          { t: "Plan page — plan elements, fields, exists/fix/create (blends the example + the old code)", done: true, d:
`WHAT IT IS — a Plan is a structured engagement document scoped to ONE workspace, produced after the team PICKS a plan algorithm (industry sector + plan type; basic default). Surfaces: a LANDING grid of the workspace's plans, plus record.plan.view and record.plan.edit.

LAYOUT (record.plan) — a LEFT SIDEBAR lists the PLAN ELEMENTS by NAME (no numbers shown). Selecting an element opens its MAIN CONTENT, which is broken into SECTIONS holding that element's decisions, collaboration, content creation, and fields. Elements behave like SUB-PAGES; together they build a single plan you can ARCHIVE, revisit, and EXPORT as one Word file. TERMINOLOGY: the numbered items below are PLAN ELEMENTS; "sections" = the sub-divisions of an element's main content.

NAMING RULE: never say "SEP" anywhere. The nav item is "Plan"; written out it is "Stakeholder Plan"; the engine is "the plan algorithm" and its per-stakeholder output is a "relationship recommendation" / "Plan Fit." (Rename the old code's SepExplain/sepScore/SEP_* internals accordingly.)

STATE OF THE OLD CODE — ~25% correct, ~50% of elements missing. Existing editor elements: Scenario, Aligning With Organizational Goals, Stakeholders, Tactics, Measurement. The full plan needs the elements below.

PLAN DATA MODEL (existing fields, keep + extend): id · workspaceId · title · sectorModel · goalModel (the picked algorithm) · owners · status · summary · scenarioSolves/scenarioApproach/scenarioOutcome · goals (inherited snapshot) · goalNotes{goal->text} · issues · team[{userId, role}] · strategies[{id,title,how,...}] · communityIds · priorityOverrides{shId->band} · measurement. ADD: stakeholderIds[] (per-plan stakeholder membership — the oracle has NO such field; see the STAKEHOLDER MEMBERSHIP note in the ground truth below) · sponsors[{first,last,email}] · consultants[{first,last,org,email}] · each strategy may carry tactics[{id,title,how,assignee}] (assignee = teammate, partner-stakeholder, OR consultant) AND/OR phases[{id,title,timeframe,...}] · per-stakeholder {involvement,risk,opportunity} · predictions · keyMessages[] · feedback[{shId,body,at,by}].

THE PLAN ELEMENTS —
1) SCENARIO & CONTEXT [EXISTS] — the situation narrative: what it solves / approach / outcome (scenarioSolves/Approach/Outcome). Multiline text.
2) SUMMARY OF ISSUE & STAKEHOLDER CONCERNS [CREATE] — a condensed summary of the issue and the spread of stakeholder reactions. Multiline text. (From the example; confirm.)
3) ORGANIZATION GOALS + ALIGNMENT [EXISTS, keep] — INHERITED from the org goals managers set in Settings (ORG_GOALS). For EACH inherited goal, the team writes how THIS plan aligns with / furthers it (goalNotes[goal]). Read-only goal text + a note field per goal.
4) STRATEGY (with optional TACTICS and/or PHASES) [FIX] — the team builds one or more STRATEGIES. A strategy's approach may include TACTICS, PHASES, or BOTH (strategy+tactics, strategy+phases, or strategy+tactics+phases). TACTICS: unlimited and OPTIONAL — a tactic REQUIRES a parent strategy, but a strategy need NOT have any tactic (even if sibling strategies do); each tactic is ASSIGNED to a teammate, a partner-stakeholder, OR a consultant (the outside consultants from element 5); tactics MUST NOT overlap other plan elements (reference/point to them, never duplicate). PHASES: unlimited; each PHASE needs a TIME FRAME; phases can be refined or added over time as the plan progresses; how granular is the team's choice. (Old code has flat strategies with one teammate owner -> restructure to strategy -> tactics[]/phases[].) Fields: strategy {title, how}; tactic {title, how, assignee}; phase {title, timeframe}.
5) TEAM & SPONSORS [CREATE] — the workspace TEAM (auto, with roles) + EXECUTIVE SPONSORS written in (first name, last name, email) + optional OUTSIDE CONSULTANTS not in the workspace (first name, last name, organization, email). Add/remove rows; email captured for sponsors/consultants.
6) PRIORITY STAKEHOLDERS + RELATIONSHIP RECOMMENDATIONS [FIX] — first the PRIORITY stakeholders (by the stakeholder's existing manual Priority, high first), THEN stakeholders whose RELATIONSHIP RECOMMENDATION aligns with the picked plan algorithm. (See the "Relationship recommendation alignment" box for how this is computed; the single rebuilt row/column spec is the BINDING ELEMENT-6 ROW SCHEMA in the "Plan algorithm — sector/type model catalog" box.) Plus the free-add paths: add any workspace stakeholder, any Master stakeholder, or create-new (-> added to plan + workspace).
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

SCOPE — app-knowledge for the plan page; precise validation and the final recommendation-alignment formula are refined when we build it. Items marked "(confirm)" are example-derived and await your confirmation.

================================================================
ORACLE GROUND TRUTH (archive/src/plan.jsx) — the exact fields, enums, colors, validation, gates, and screens the old Plan code actually implements. The rebuild's element list above is the design target; everything below is the concrete starting code it must preserve or deliberately supersede.

PLAN_STAGES enum (status field, exported const) = ["Idea", "Proposed", "Under Review", "Active", "Complete"]. Default status on a new plan = "Idea". NOTE: NO "Declined" stage (this is the key divergence from Community, which DOES have Declined). The status select in the editor sidebar lists exactly these five.

PLAN_GOAL_COLORS (per goal-model "type of plan" pill, exported const) — one warm pill per goal model, { bg, fg }:
- general:      bg #E1E1DA, fg #54524A
- shared-value: bg #DDE7C2, fg #2f5a26
- crisis:       bg #E5D0D0, fg #7a2424
- activist:     bg #E8DEC2, fg #6e5419
- dei:          bg #DCD3E0, fg #4F3F69
- community:    bg #C2D9E8, fg #23496e
- union:        bg #C9E3CC, fg #2f5a26
Pill renders as a .tag with background = bg, color = fg, borderColor transparent; fallback (unknown goalModel) = background var(--bg-2), color var(--ink-2). REBUILD: these hard hexes map to --ui-sys-* tokens — each goal-model pill becomes a token-driven ui-chip variant; do NOT inline the hexes in the rebuild.

PLAN_STAGE_FG (status text color, exported const) — status shown as colored text (className comm-stage-text), color only (no badge bg):
- Idea #54524A · Proposed #6E5419 · Under Review #6e5419 · Active #2f5a26 · Complete #2E3F66
Fallback color var(--ink-2). REBUILD: flag to --ui-sys-* status tokens.

PLAN RECORD FIELDS PRESENT IN THE OLD EDITOR BUT MISSING FROM THE DATA-MODEL LIST ABOVE (capture so they survive) — the floating left metadata sidebar (plan-aside) edits these in addition to the model fields:
- site: id into D.SITES; CASCADE — picking a site sets state from the site's s.state (set({ site: id, state: s.state }) when the site has a state; otherwise set({ site: id }) only). Options rendered "None" + D.SITES.map(s => D.siteLabel(s)).
- state: one of D.US_STATES; the select shows D.STATE_ABBR[state] as the option label (abbreviation), value = full state. "None" default.
- geography: one of D.GEOGRAPHIES (free catalog list); "Select geography…" placeholder.
- MARKET RESET CASCADE: setting market does set({ market: e.target.value, region: "" }) — changing the market RESETS region to "". Region options come from D.MARKETS[p.market] (empty until a market is chosen). Market options = Object.keys(D.MARKETS); "Select market…" / "Select region…" placeholders.
Left-sidebar field order (top to bottom): One-line summary (textarea rows 2) · Status · Workspace · Market · Region · Site · State · Geography · Owners (MultiOwnerPicker, size 26) · Issues (IssueSelector over companyIssues) · Linked community investment (PlanCommunity).

EDITOR MAIN SECTIONS (PlanSection, numbered n=1..5, in order): 1 "Scenario & Context" · 2 "Aligning With Organizational Goals" · 3 "Stakeholders In This Plan" · 4 "Tactics" · 5 "Measurement & Reporting". The stakeholder table (section 3) column headers: Stakeholder · Type · Relationship · Priority.

STAKEHOLDER MEMBERSHIP — THE ORACLE HAS NO PER-PLAN STAKEHOLDER SET (DO NOT REPLICATE AS-IS; the design's per-plan composition must be MADE REAL). Verbatim oracle mechanics:
- "Stakeholders In This Plan" is simply ALL stakeholders of the plan's WORKSPACE: wsStakeholders(wsId) = stakeholders.filter(s => (stakeholderWorkspaces[s.id] || []).includes(wsId)); the editor/review receive that roster as their stakeholders prop. There is no plan field listing members; the editor footer count ("{n} stakeholders in plan") is the workspace roster size.
- The inline "Add existing stakeholder…" row (the last row of the section-3 table, className plan-sh-addrow) is a PlanAutocomplete whose options = addableStakeholders = allStakeholders.filter(s => NOT (stakeholderWorkspaces[s.id] || []).includes(p.workspaceId)) — i.e. every stakeholder in the app NOT yet in this workspace. Row label = displayName(s) || s.name; sub-line = s.type. Picking one calls assignExisting(id): setStakeholderWorkspaces({ ...map, [id]: [...(map[id] || []), p.workspaceId] }) — it adds the stakeholder to the WORKSPACE; no plan field is ever written.
- "Add New Stakeholder" (a .btn.plan-add-btn below the table) opens StakeholderModal (props: isMaster false, existing null, plus users/workspaces/currentUser/companyIssues/community/stakeholders); onSubmit calls addStakeholder(data, p.workspaceId) — again workspace-level, not plan-level.
- EDITOR ROW CLICK: each stakeholder row (plan-sh-trow) has title "Open stakeholder" and onClick sets viewShId -> opens the StakeholderProfile OVERLAY for that stakeholder (props: stakeholder, users, stakeholders = allStakeholders || stakeholders, community, scores, team, getWorkspacesForStakeholder, updateCommunityApp, currentUser, companyIssues, onClose clears viewShId). REVIEW rows are NOT clickable.
- REBUILD DECISION: element 6's free composition (add from workspace / add from Master / create new -> added to plan + workspace) requires a real per-plan membership field — stakeholderIds[] in the data model above. Adding a Master stakeholder still ALSO assigns them to the workspace (preserve the oracle's stakeholderWorkspaces side effect); creating a new stakeholder adds to BOTH plan and workspace. Migration/seed baseline for old plans = the oracle behavior (membership = the full workspace roster). Keep the row-click -> stakeholder profile overlay behavior.

EDITOR RIGHT SIDEBAR (plan-aside plan-aside-right) — a second floating aside on the right with three fields, top to bottom:
- "Cross-functional team" -> PlanTeam (edits p.team, the source of the "Team" validation + review's Cross-functional Team section). Each member row: Avatar size 28 + user name (fontWeight 500, 13px) + an inline role input (className plan-team-role) with placeholder "Role on this plan" that edits that member's role in place + a ghost remove button (× icon, aria-label "Remove") that filters the member out by userId. available = users.filter(u => u.role !== "system" && u not already in team). Add flow: an "Add Teammate" button (.btn.plan-add-inline; rendered ONLY when available.length > 0) swaps to a UserAutocomplete over available, placeholder "Search teammates…", autoFocus; picking a user pushes { userId: id, role: "" } and closes the autocomplete.
- "How stakeholders are prioritized" (plan-divider) — explainer copy VERBATIM (the word "suggest" bold; the ✦ styled prio-suggest-inline): "We suggest a priority for each stakeholder from their map position, issue overlap, and community ties - weighted by the factors below. It's a starting point: managers can override any suggestion (look for the ✦)." Below it the in-editor factor readout (oracle name SepExplain — RENAME per the naming rule): two groups with headers "Sector · {sector.name}" and "Scenario · {goal.name}"; each factor of the group's model renders a row: bold factor label = SEP_FACTORS[k].label (raw k if the key is unknown) + a right-aligned weight "{Math.round(w * 100)}%" + a description line = SEP_FACTORS[k].desc (empty string if unknown). ORACLE GAP (do not replicate): data.js SEP_FACTORS lacks the 14 doc-only factor keys (PS TO ST RA SDI MI PE HPR AE SAP TA MA EA SCS), so under the authoritative DOC catalog those rows would show a bare key and no description — the rebuild's factor catalog must carry every FACTOR KEY entry (label + definition) so this readout is always complete.
- "Personas" (plan-divider) — the element-9 locked add-on stub: a lock icon + the note (className plan-addon-note) "Add-on - persona modeling from polling & listening sessions."

FULL REQUIRED-FIELD VALIDATION (planMissing array, in order; Save disabled until planMissing.length === 0; planValid = empty):
- "Plan name"            — required AND must not equal the literal "Insert Plan Name" (the placeholder); rejects empty/whitespace title OR title === "Insert Plan Name".
- "Workspace"           — p.workspaceId set.
- "Market"              — p.market set.
- "Region"              — p.region set.
- "Owners"              — p.owners non-empty.
- "Summary"             — p.summary non-empty (trimmed).
- "Status"              — p.status set.
- "What this plan solves" — p.scenarioSolves non-empty (trimmed).
- "Phased approach"     — p.scenarioApproach non-empty (trimmed).
- "Expected outcome"    — p.scenarioOutcome non-empty (trimmed).
- "Issues"             — p.issues non-empty.
- "Team"               — p.team non-empty.
- "Tactics"            — p.strategies non-empty AND every strategy has a non-empty (trimmed) title.
- "Measurement"        — p.measurement non-empty (trimmed).
Toolbar readout when invalid: a .modal-missing span "{N} left: {first two missing, comma-joined}{ellipsis if more than 2}" with the full list in its title attribute. The Save button (btn-primary, disabled={!planValid}) simply calls onBack (it saves continuously via updatePlan; "Save" just returns to the landing once valid). NOTE the "Tactics" gate interacts with an ORACLE STUB: the editor has NO working add-strategy control (see the STRATEGY / TACTIC SHAPE paragraph below), so in the oracle a freshly created plan can NEVER satisfy this gate and never becomes saveable — only seeded plans with pre-existing strategies pass. Keep the gate; make the add affordance real.

COPY STRINGS (verbatim from the oracle; every label/placeholder the rebuild must reproduce) —
- Editor toolbar: back button "‹ All plans" (className plan-back) · the plan title is an inline toolbar input (plan-toolbar-title) with placeholder "Insert Plan Name" · then the two model selects · Save · the .modal-missing readout.
- One-line summary textarea placeholder: "A single sentence describing this plan - shown on the plan card and review."
- Scenario field labels (editor): "What this plan solves & its impact to the company" / "What we plan to do - a phased approach" / "The outcome we expect". Review variants: "What this plan solves & its impact" / "Our phased approach" / "The outcome we expect".
- Goals inherited note (element 3, className plan-inherited-note): "Inherited from your organization's goals (set in Settings). How does your plan align with this organizational goal and drive success or defend your license to operate?" Per-goal note textarea placeholder: "How does this plan work to achieve this goal in this workspace?"
- Measurement textarea placeholder: "Cadence, metrics, and how progress ties to the fiscal quarters…"
- Editor footer (sheet-footer): plan icon + bold "{n}" + " stakeholders in plan" · "·" · "{workspace.name}" (or "-") · "·" · "{sector.name}" · spacer · muted "Saved · {planDate(p.updatedAt)}". (The goal-model name is NOT in the footer.)
- Review toolbar: ghost button "Plans" with a chevron-left icon (title "All plans") · the plan title · spacer · primary button "Edit plan" with an edit icon.
- PlanCommunity: add button "Add Community Investment" (.btn.plan-add-inline); autocomplete placeholder "Search community investments…".
- Stakeholder table: add-row placeholder "Add existing stakeholder…"; add button "Add New Stakeholder"; row tooltip "Open stakeholder".
- Team sidebar: role placeholder "Role on this plan"; add button "Add Teammate"; autocomplete placeholder "Search teammates…".
- Landing card: title-click tooltip title="Open plan".
- PlanReview per-section empty states (all muted text, verbatim): Scenario & Context "Not written yet." · Aligning With Organizational Goals — section-level when ORG_GOALS is empty "No goals listed."; per-goal when no note "No approach described yet." · Stakeholders In This Plan "No stakeholders in this workspace." · Cross-functional Team "No team assigned." · Tactics "No tactics yet." (a strategy with an empty title renders as "Untitled") · Issues "None." · Community Investment "No community investments linked." · Measurement & Reporting "Not written yet."

PRIORITY-OVERRIDE GATE (PlanPriorityCell, plan element 6 "Priority" column) — only role === "manager" may override (canEdit = !!currentUser && currentUser.role === "manager"). The cell shows the EFFECTIVE band = override || suggestion.band (a PriorityPill). Mark beside the pill:
- when there is NO override -> a subtle "✦" mark (className prio-mark prio-suggest) with tooltip "Suggested · {score}/100 - weighs {top.join(", ")}" (the three top factors).
- when overridden -> a "·set" mark (className prio-mark prio-overridden) with title "Set by a manager - click to use the suggestion".
Clicking the cell (managers only) opens a popover (prio-pop): header "Suggested · {band} · {score}/100" + "Weighs {top.join(", ")}"; options row = three buttons High / Medium / Low (the matching effective band gets .on). onSet(b === suggestion.band ? null : b) — picking a band that EQUALS the suggestion CLEARS the override (onSet(null)); picking any other band sets it. When an override exists, a revert button "Use suggestion ({suggestion.band})" calls onSet(null). setPriorityOverride(id, band): if band -> priorityOverrides[id] = band; else delete priorityOverrides[id]; persisted via set({ priorityOverrides: next }). Sort order in the editor: by PRIO_RANK[override || suggestion.band] (High 0, Medium 1, Low 2), tie-broken by suggestion.score descending. PlanReview reorders by PRIO[band] only (band = override || suggestion.band). NUMERIC-READOUT RULING (reconciles this oracle capture with the never-a-number rule — the ruling WINS everywhere): every "{score}/100" fragment in this gate — the ✦ tooltip copy and the prio-pop header — is CAPTURED-ONLY, DO-NOT-REPLICATE display (the alignment + catalog boxes rule the UI never shows a numeric score); the rebuilt surfaces show the BAND plus the model-scoped "weighs" labels (see the RETARGET below for the ruled replacement copy). The 0-100 score itself survives internally only as the band cut-points (67/40) and the sort tie-break — it never renders.

PlanHome LANDING (styled like the Community landing, via the shared LandingView) —
- filterDefs (key/label/get): type/"Type of plan"/goalName(p.goalModel) · issues/"Issues"/p.issues · market/"Market"/p.market · region/"Region"/p.region · status/"Status"/(p.status||"Idea") · year/"Year created"/year of p.createdAt.
- sortFields: title/"Plan name" · status/"Status" · _updated/"Last updated"/(p.updatedAt||p.createdAt) · _created/"Date added"/p.createdAt.
- searchKeys: ["title","market","region","status"].
- cols (table): Plan (p.title) · Workspace (workspace name) · Type (goalName(p.goalModel)) · Market · Region · Site (D.siteLabel of D.SITES match) · Status (comm-stage-text colored by PLAN_STAGE_FG).
- newLabel "New plan"; emptyText "No plans yet. Create one to begin building a stakeholder engagement plan."; row click -> onReview (opens read-only review).
- FOOTER slot: "{plans.length} plans · Priority is suggested from each stakeholder's map position, issue overlap, and community ties, weighted by the plan's sector and scenario models."
- CARD anatomy (renderCard): title (click -> onReview; tooltip title="Open plan") · workspace name (recipient line, muted) · team avatars via OwnersDisplay over (p.team||[]).map(m => m.userId), size 24, label "team" · goal-model chip (PLAN_GOAL_COLORS) · status text (PLAN_STAGE_FG) · summary (or muted "No summary written yet.") · linked group: Issues (Tags) when present, Engaged "{wsStakeholders(p.workspaceId).length} stakeholders", Market, Region, Site · meta rows: Tactics "{strategies.length} deployed" (or "-"), Investments "{communityIds.length} linked" (or "-"), Segment (workspace.segment), Unit (workspace.businessUnit) · foot: "Updated {date}" + Review / Edit links.

PlanCommunity LINKER (element 11 / "Linked community investment" sidebar field) — available investments = community entries NOT already linked AND scoped to the plan's market AND region: keep c when (!market OR (c.markets||[]).includes(market) OR c.market === market) AND (!region OR (c.regions||[]).includes(region) OR c.region === region). Until both a market AND region are chosen: "Select a market and region above to see available community investments." LINKED rows render "{c.name}" (weight 500, 13px) over a muted 11px sub-line "{c.kind} · {c.stage} · {communityEntryAmount(c)}" plus a ghost remove button. Add via a UserAutocomplete over available mapped to { id, name, title: kind · stage, noAvatar:true } — the OPTION sub-line is "{c.kind} · {c.stage}" with NO amount (the amount renders only on linked rows, never in the add-autocomplete); "No community investments available for this market and region." when none.

goalNotes (element 3, "Aligning With Organizational Goals") — the org goals come from D.ORG_GOALS (inherited from Settings; read-only titles). Each goal renders a read-only title (subheader-text) + a textarea keyed by the goal string: value (p.goalNotes && p.goalNotes[g]) || "". ORACLE BUG (RECORD, do NOT replicate): the onChange calls set("goalNotes", { ...(p.goalNotes||{}), [g]: e.target.value }) — but set is defined as set = (patch) => updatePlan({ ...p, ...patch, updatedAt: today() }) (it takes ONE patch object). The SECOND arg — the real note map — is silently dropped, and the FIRST arg, the STRING "goalNotes", is SPREAD as the patch: spreading a string yields its characters keyed by index, so EVERY keystroke persists NINE JUNK KEYS { 0:"g", 1:"o", 2:"a", 3:"l", 4:"N", 5:"o", 6:"t", 7:"e", 8:"s" } onto the plan record AND bumps updatedAt. goalNotes itself NEVER persists from the editor. MIGRATION-SCRUB RULE (required consequence): plans persisted or seeded-then-edited in the oracle may carry that char-key corruption — the rebuild's data migration STRIPS the numeric string keys 0-8 (the "goalNotes" characters) from every plan record before import. At rebuild, persist goalNotes correctly: set({ goalNotes: { ...(p.goalNotes||{}), [g]: value } }). PlanReview already reads p.goalNotes[g] correctly (so the read side works; only the write is broken).

PlanReview "SEP model" FORMULA READOUT — the review header shows a .plan-algobar with tag "SEP model" and two <code> readouts: fmt(m) = m.factors.map(([k, w]) => k + "×" + w).join(" + "); rendered as "{sector.name}: {fmt(sector)}" · "{goal.name}: {fmt(goal)}". Per the SEP-rename rule, RENAME the visible "SEP model" label in the rebuild but KEEP this formula-readout element (it transparently shows each model's factor×weight makeup). Review header also assembles a meta line: workspace name · market/region · site label · state abbr · geography · "Updated {date}".

STRATEGY / TACTIC SHAPE (old flat form, to be restructured per element 4 but captured exactly) — strategies = [{ id (uid("st")), title, how, timing, ownerId }]. add() pushes { id: uid("st"), title:"", how:"", timing:"", ownerId:"" }. ORACLE STUB (DO NOT REPLICATE) — that add() function is NEVER wired to any control: PlanStrategies' only add affordance is a dead placeholder, a div className plan-tactic-add rendered with style display:"none" (the last child of .plan-strats), so the oracle editor has NO way to add a strategy from the UI at all; add() is unreachable dead code. Consequence (see the validation note above): a plan created in the oracle can never pass the "Tactics" required-field gate. The rebuild MUST provide a real "Add strategy/tactic" affordance — a ui-button (variant text) below the strategy list, wired to exactly the add() shape above — and must NOT replicate the hidden div. Per-strategy row fields: title (input, placeholder "Strategy / tactic") · a ghost remove button (× icon, aria-label "Remove") that filters the strategy out by id · how (textarea rows 2, placeholder "How - the action to take") · inline meta row: labeled "Timing" free-text input (placeholder "e.g. Q1–Q2") + labeled "Lead" via LeadPick. LeadPick (three states) assigns a SINGLE ownerId lead: (1) lead chosen + closed -> a removable avatar tag (.tag.lead-tag: Avatar size 16 + name + a "×" span, className lead-x, that stopPropagation()s and calls onChange(null)); clicking the tag body reopens the picker; (2) no lead + closed -> a button (.tag.lead-tag.lead-empty) "Assign lead…"; (3) open -> a PlanAutocomplete (dark variant) over users.filter(u => u.role !== "system"), getLabel u.name / getSub u.title, placeholder "Assign lead…"; picking sets ownerId and closes. (Review shows "Timing: {timing}" and "Lead: {owner.name}".)

PLANAUTOCOMPLETE MECHANICS (the shared inline autocomplete; oracle comment: "identical to the teammate search, white bg"; used by the add-existing-stakeholder row (light) and LeadPick (dark)) — controlled query input q; matches = (q ? options.filter(o => lowercased getLabel(o) OR lowercased getSub(o) CONTAINS the lowercased q) : options).slice(0, 8) — i.e. case-insensitive substring match against the label OR the sub-line, results CAPPED AT 8; an EMPTY query lists ALL options (first 8). The menu opens on every input change AND on focus; it closes via onBlur with a setTimeout of 150ms (so a click on an option can land before the menu unmounts). Picking fires on onMouseDown (beats the blur): calls onPick(o.id), CLEARS the query to "" and closes the menu. The menu renders only when open AND matches.length > 0 (no empty-state row). Each option is a two-line row (button className ua-row): name line (ua-row-name = getLabel(o)) over a muted sub-line (ua-row-title = getSub(o)) — for add-existing-stakeholder that is displayName(s)||s.name over s.type; for LeadPick it is u.name over u.title. Wrapper className "user-autocomplete plan-ac", plus modifier "plan-ac-dark" when the dark prop is set (only LeadPick passes dark). RETARGET: these behaviors are the required ui-autocomplete configuration — max 8 visible results, open-on-focus showing the full (capped) list on an empty query, filter matching primary OR secondary text, two-line option rows (primary + supporting text), selection clears the input and closes, dismissal on blur/outside click; the LeadPick dark variant becomes token-driven surface styling of the ui-autocomplete inside the strategy card (tokens only — never a bespoke stylesheet).

PlanReview READ-ONLY sections (RS) in order: header (title, meta line, summary, goal-model chip + status + owners, SEP-model formula bar) · Scenario & Context (solves/approach/outcome prose, or "Not written yet.") · Aligning With Organizational Goals (per ORG_GOAL title + goalNotes prose or "No approach described yet."; when ORG_GOALS itself is empty the whole section shows "No goals listed.") · Stakeholders In This Plan (ranked table: name, type, StatusPill relationship, PriorityPill effective band; rows NOT clickable; empty -> "No stakeholders in this workspace.") · Cross-functional Team (avatar + name + role||title per team member; empty -> "No team assigned.") · Tactics (per strategy: title or "Untitled", how, "Timing: …", "Lead: …"; empty -> "No tactics yet.") · Issues (Tags; empty -> "None.") · Community Investment (linkedCommunity rows: "{c.name} - {c.kind} · {c.stage} · communityEntryAmount(c)"; empty -> "No community investments linked.") · Measurement & Reporting (prose or "Not written yet.").

RELATIONSHIP COLUMN — rel(s) in both editor and review = D.statusFor(wc.x, wc.y) where wc = D.weightedCoord(s.id, scores, team); rendered as a StatusPill. The Priority column uses the recommendation engine (see the "Relationship recommendation alignment" box for the exact sepScore math).

NEW PLAN DEFAULTS (newPlan) — id uid("plan"); workspaceId = isMaster ? (workspaces[0] && workspaces[0].id) : activeWorkspaceId (undefined-safe guard: an empty workspaces list yields undefined, not a crash); title = (ws ? ws.name + " " : "") + "Engagement Plan" — i.e. "{workspace.name} Engagement Plan" when the workspace resolves, bare "Engagement Plan" when it does not; sectorModel "energy"; goalModel "general"; market "" region "" owners [] summary "" status "Idea"; scenarioSolves/Approach/Outcome ""; goals [] issues [] team [] strategies []; communityIds [] measurement ""; priorityOverrides {}; createdAt/updatedAt today(). today() = nowStamp().

DEEP-LINK BRIDGE — window.__pendingPlanId: an effect with NO dependency array (it runs after EVERY render) checks the global; when truthy it looks the plan up and, on a match, opens it (setOpenId + mode "review") — then clears the global UNCONDITIONALLY: the null-assignment sits OUTSIDE the exists branch, so a pending id with NO matching plan is silently dropped (no error, no retry). (Mirrors Community's __pendingCommunityId; used from a profile page to jump to a specific plan.)

RETARGET UI BUILD-MAP TO CANONICAL UI (ui-*) — the old code uses raw <select>/.designed-select, hand-built tables, and .tag pills. REBUILD ONLY with Canonical UI: ui-select for sector/type/status/workspace/market/region/site/state/geography pickers; ui-data-table for the stakeholder list (element 6 — assembling the BINDING ELEMENT-6 ROW SCHEMA declared in the "Plan algorithm — sector/type model catalog" box, which supersedes the oracle's 4-column layout captured in the ground truth and trees) and the landing table; ui-chip pills for the goal-model "type" pill and issue tags; ui-autocomplete for the add-existing-stakeholder, lead, teammate, and community-investment pickers — configured per the PLANAUTOCOMPLETE MECHANICS paragraph above (8-result cap, open-on-focus with full list on empty query, label-OR-sub matching, two-line option rows, pick clears the query and closes, blur dismisses); ui-text-field for single-line text, number, and date inputs. DECLARED GAP — MULTILINE (the SAME gap the Community box declares; resolve ONCE for both records BEFORE assembling either editor): the plan editor is full of multiline fields — the one-line summary (textarea rows 2), the three scenario textareas, the per-goal alignment-note textareas, each strategy's "how" (rows 2), and Measurement — but design-system/manifest.json has NO ui-textarea component and ui-text-field's manifest contract (props: label, value, placeholder, type, error, supporting-text, disabled) has NO multiline/rows mode. Per the CLAUDE.md gap rule: EITHER extend ui-text-field with a multiline/rows mode (updating its manifest entry) OR build a new ui-textarea into design-system/ to the ui-button quality bar and register it in manifest.json — never a raw textarea element. DECLARED GAP — PLAIN/INLINE VARIANT: the toolbar plan-title input (placeholder "Insert Plan Name") and the inline team-role input (placeholder "Role on this plan") call for a chromeless inline text field, but ui-text-field's manifest contract has NO variant prop — before use, EITHER register a variant (e.g. variant "plain") as a contract extension in manifest.json (built to the quality bar) OR re-map both inputs to the standard outlined ui-text-field; never pass an unregistered prop. SCAFFOLDING: the editor's LEFT metadata aside = ui-sidebar; the RIGHT team/factors/personas aside = ui-inspector; the editor footer = ui-status-bar; toolbar = ui-app-bar with the back control as a ui-button (variant text, leading ui-icon chevron_left). PRIORITY OVERRIDE (the RULED replacement surface — here the never-a-number ruling WINS over the oracle capture: the "{score}/100" readouts in the PRIORITY-OVERRIDE GATE ground truth above are captured-only and are NEVER rebuilt): the popover = a ui-menu anchored to the PLAN FIT ui-chip (anchor by id; opens on cell click, managers only — per the binding element-6 schema the override targets the FIT band, never the manual Priority pill), containing a non-interactive header block ("Suggested · {band}" + "Weighs {top}", where {top} uses the MODEL-SCOPED labels per the alignment box's top-factors rule — no numeric score) then three ui-menu-item entries High / Medium / Low (the effective band carries the selected state; picking the suggested band clears the override) and, when overridden, a fourth ui-menu-item "Use suggestion ({band})" with leading ui-icon auto_awesome. The ✦ suggestion mark = ui-icon (auto_awesome, size --ui-sys-icon-size-sm) wrapped in a ui-tooltip carrying "Suggested · {band} - weighs {top}" (band + model-scoped labels — never the oracle's "{score}/100" copy); the "·set" overridden mark = plain token-inked text wrapped in a ui-tooltip ("Set by a manager - click to use the suggestion"). VALIDATION READOUT: the .modal-missing "{N} left: …" readout = persistent token-inked text (--ui-sys-on-surface-muted) inside the ui-app-bar next to the Save ui-button, with the full missing list in its ui-tooltip — NOT a ui-snackbar (it is a persistent state, not an event). RIGHT-SIDEBAR CONTENT: team rows = a ui-list of items composing avatar + name + the inline role text field (per the PLAIN/INLINE-VARIANT gap above; placeholder "Role on this plan") + trailing ui-icon-button (close); "Add Teammate" / "Add Community Investment" / the made-real "Add strategy/tactic" (replacing the oracle's dead display:none plan-tactic-add div — see the ORACLE STUB flag above) = ui-button (variant text); the prioritization explainer + factor readout + personas lock note = token-inked text blocks inside the ui-inspector (lock = ui-icon lock). NEVER md-*/shadcn, never raw <select>/<span>/<div> as UI primitives, never inline hexes — pill/status colors come from --ui-sys-* tokens.

================================================================
SKELETON TREE (ORIGINAL-DESIGN STRUCTURE CENSUS — the literal region tree extracted from archive/src/plan.jsx JSX, plus the shared archive/src/landing.jsx shell both landings render through. One tree per surface, nested in source order; every className region appears or is explicitly absorbed. Each node: region -> contents -> Canonical UI mapping. The build assembles against THESE trees, never prose; wrapper structure lives INSIDE ui-* components (shadow DOM), so assembly is slotting components, never authoring divs.)

TREE 1 — PLAN LANDING (PlanHome, rendered THROUGH the shared LandingView in landing.jsx; the LandingView regions below are the SHARED landing shell, identical for Community):
- div.community-wrap — the landing page root (LandingView) -> layout column, token-only container (the page's main region inside ui-app-shell)
  - [PORTAL via ReactDOM.createPortal into the explainerSlot DOM node — the app header's explainer region; renders ONLY when explainerSlot is passed] div.community-toolbar — the landing toolbar row -> ui-app-bar content row
    - div.search — Icon search + input placeholder "Search…" (live search over searchKeys) + span.kbd.kbd-cmdk showing cmdKeyLabel -> ui-text-field (search variant, leading ui-icon search); the kbd hint = token-inked text
    - div.filter-button-wrap — Filter control cluster -> layout row, token-only container
      - button.btn (+.filter-active when any filter on) — "Filter" or "Filter (n)" (n = active filter count); click toggles the filter popover and closes the sort popover -> ui-button (variant text/outlined) anchoring a ui-menu
      - [conditional: filterOpen] div.filter-popover — closes onMouseLeave -> ui-menu / ui-sheet surface
        - div.filter-pop-head — strong "Filter" + a btn-ghost "Clear all" (resets filters {}) -> ui-menu header block + ui-button (variant text)
        - div.filter-pop-body — one FilterSection per filterDef (label + distinct-value chips, toggle per value) -> ui-chip (filter variant) groups
    - div.filter-button-wrap — Sort control cluster (same pattern)
      - button.btn (+.filter-active when sort.key) — "Sort"; toggles the sort popover, closes filter
      - [conditional: sortOpen] div.filter-popover.sort-popover — onMouseLeave close
        - div.filter-pop-head — strong "Sort by" + "Clear all" (sort -> { key:null, dir:"asc" })
        - div.filter-pop-body — SortFieldList over sortFields (field + asc/desc set)
    - button.btn (+.filter-active in table mode) — "See all" (title "See all in a table"); toggles cards <-> table -> ui-button (variant text) with selected state
    - div.spacer (flex 1) — layout spacer
    - {toolbarRight} slot — PLAN PASSES NOTHING here (only Community passes its rollup strip) — absorbed: empty slot on the Plan landing
  - {headerSlot} — PLAN PASSES NOTHING (prop unused on this surface) — absorbed
  - ONE OF (mutually exclusive body states):
    - [empty: 0 items after search+filter] div.comm-empty.muted — emptyText "No plans yet. Create one to begin building a stakeholder engagement plan." -> token-inked empty-state text
    - [table mode] div.landing-table-scroll — horizontal scroll container -> ui-data-table (owns its own scroll)
      - div.profile-table.landing-table.landing-table-flex — the table
        - div.profile-trow.profile-thead — gridTemplateColumns "minmax(180px,2fr)" + max-content per remaining col; one span.profile-th-label per col (Plan · Workspace · Type · Market · Region · Site · Status) -> ui-data-table header row
        - div.profile-trow × N (one per plan; onClick -> onRowClick = onReview(p.id); cursor pointer; title "Open") — one span.profile-td per col -> ui-data-table body rows
    - [cards mode, default] div.comm-grid — the card grid (gridClass default; Plan passes none) -> layout grid, token-only container; one PLAN CARD per plan (TREE 2)
  - {footerSlot} div.sheet-footer.comm-footer — div.group (Icon plan + strong count + " plans") · div.group "·" · div.group.muted flex 1 (the Priority explainer sentence) -> ui-status-bar

TREE 2 — PLAN CARD (renderCard, one per plan in the landing grid):
- div.comm-card.plan-card — card root -> composed card surface on --ui-sys-surface-card (domain-component layer; never loose divs)
  - div.comm-card-head — head row -> layout row inside the card composition
    - div.plan-card-titlewrap (minWidth 0) — title column
      - span.comm-card-name.plan-card-title — plan title; CLICK -> onReview(p.id); tooltip title "Open plan" -> clickable token-inked text control wrapped in ui-tooltip
      - div.comm-card-recipient.muted — workspace name (or "-") -> token-inked muted text
    - div.plan-card-team-avatars — OwnersDisplay over team userIds, size 24, label "team" -> ui-avatar stack (--ui-sys-avatar-size-*)
  - div.comm-card-badges — span.tag goal-model pill (PLAN_GOAL_COLORS bg/fg, transparent border; fallback var(--bg-2)/var(--ink-2)) + span.spacer (flex 1) + span.comm-stage-text status text (PLAN_STAGE_FG color) -> ui-chip (assist, non-interactive, token-driven variant) + spacer + token-inked status text (--ui-sys-* stage tokens)
  - p.comm-card-summary.plan-card-summary — summary, or muted "No summary written yet." -> token-inked body text
  - div.plan-linked-group — the linked key/value block -> ui-list two-column key/value rows
    - [conditional: issues non-empty] div.comm-card-linked — span.comm-meta-k "Issues" + span.comm-card-issues (Tags) -> key + ui-chip-set (non-interactive)
    - div.comm-card-linked — "Engaged" + span.comm-linked-names "{n} stakeholders"
    - div.comm-card-linked — "Market" + value or "-"
    - div.comm-card-linked — "Region" + value or "-"
    - div.comm-card-linked — "Site" + D.siteLabel or "-"
  - div.comm-card-meta.plan-meta-nobottom — four div.comm-meta-row (comm-meta-k + comm-meta-v): Tactics "{n} deployed"/"-" · Investments "{n} linked"/"-" · Segment (workspace.segment) · Unit (workspace.businessUnit) -> ui-list key/value rows
  - div.comm-card-foot — span.muted "Updated {planDate(p.updatedAt)}" + span.plan-card-actions with two explainer-link buttons "Review" (stopPropagation; onReview) and "Edit" (stopPropagation; onOpen -> editor) -> token-inked text + two ui-button (variant text)

TREE 3 — PLAN EDITOR (PlanEditor, mode "edit"):
- div.sheet-wrap — page root -> the record page region inside ui-app-shell
  - div.sheet-toolbar — editor toolbar -> ui-app-bar
    - button.plan-back — "‹ All plans"; click -> onBack -> ui-button (variant text, leading ui-icon chevron_left)
    - input.plan-toolbar-title — inline title input, placeholder "Insert Plan Name"; onChange set({title}) -> ui-text-field (the declared PLAIN/INLINE-VARIANT gap)
    - div.spacer (flex 1)
    - label.plan-model-pick > div.designed-select > select — sectorModel over D.SEP_SECTOR_MODELS -> ui-select
    - label.plan-model-pick > div.designed-select > select — goalModel over D.SEP_GOAL_MODELS -> ui-select
    - button.btn.btn-primary — "Save"; disabled !planValid; click -> onBack -> ui-button (variant filled)
    - [conditional: !planValid] span.modal-missing — "{N} left: …" readout, full list in title -> persistent token-inked text + ui-tooltip
  - div.plan-body — the THREE-COLUMN SPLIT: left aside · main · right aside -> layout row, token-only container (the ui-sidebar / main / ui-inspector composition)
    - aside.plan-aside — LEFT floating metadata sidebar -> ui-sidebar
      - label.plan-aside-field — span.lbl "One-line summary" + textarea.plan-field rows 2 (placeholder per COPY STRINGS) -> multiline gap component
      - label.plan-aside-field — "Status" + designed-select (PLAN_STAGES) -> ui-select
      - label.plan-aside-field — "Workspace" + designed-select (workspaces) -> ui-select
      - label.plan-aside-field — "Market" + designed-select (Object.keys(D.MARKETS); resets region) -> ui-select
      - label.plan-aside-field — "Region" + designed-select (D.MARKETS[p.market]) -> ui-select
      - label.plan-aside-field — "Site" + designed-select ("None" + D.SITES; cascades state) -> ui-select
      - label.plan-aside-field — "State" + designed-select ("None" + D.US_STATES, D.STATE_ABBR labels) -> ui-select
      - label.plan-aside-field — "Geography" + designed-select (D.GEOGRAPHIES) -> ui-select
      - div.plan-aside-field.plan-divider — "Owners" + MultiOwnerPicker size 26 -> ui-autocomplete + ui-avatar composition (owners picker)
      - div.plan-aside-field.plan-divider — "Issues" + IssueSelector -> ui-chip-set + ui-autocomplete composition
      - div.plan-aside-field.plan-divider.plan-community-field — "Linked community investment" + PlanCommunity:
        - div.plan-community — the linker block
          - div.plan-comm-row × N (per linked entry) — name (500/13px) over muted 11px "{kind} · {stage} · {communityEntryAmount}" + btn-ghost remove (Icon close, aria-label "Remove") -> ui-list item + trailing ui-icon-button
          - ONE OF: p.muted "Select a market and region above…" note / div.plan-team-add (UserAutocomplete "Search community investments…", autoFocus; option sub-lines kind · stage, NO amount) -> ui-autocomplete / button.btn.plan-add-inline "Add Community Investment" -> ui-button (variant text) / p.muted "No community investments available…" note
    - div.plan-main — the main plan document, a stack of five PlanSection blocks -> main content column (white --ui-sys-surface-card)
      - PlanSection shell (each): div.plan-section (+.plan-section-wide when wide — never passed in the oracle; absorbed) > div.plan-section-head (span.plan-section-n number + h3 title + optional span.plan-tag — never passed; absorbed) + children -> composed section header (token-inked number + heading) + slot
      - PlanSection n=1 "Scenario & Context" — three label.plan-q (span.lbl + textarea.plan-field rows 3) for solves/approach/outcome -> multiline gap component ×3
      - PlanSection n=2 "Aligning With Organizational Goals" — p.plan-inherited-note (verbatim copy) + div.plan-goal-list > div.plan-goal-item per ORG_GOAL (div.subheader-text.plan-goal-title read-only goal + textarea.plan-field.plan-goal-note — the goalNotes-bug field) -> token-inked note + ui-list of title + multiline gap component
      - PlanSection n=3 "Stakeholders In This Plan" — ORACLE LAYOUT CAPTURED BELOW; the REBUILT table assembles the BINDING ELEMENT-6 ROW SCHEMA from the catalog box (manual Priority + Plan Fit as separate columns), which supersedes this 4-column oracle layout:
        - div.plan-sh-table — the ranked table -> ui-data-table (or the ui-stakeholder-table domain component) per the binding schema
          - div.plan-sh-thead — four spans: Stakeholder · Type · Relationship · Priority (oracle columns; superseded by the binding schema's column set)
          - div.plan-sh-trow × N (per ranked stakeholder; onClick -> StakeholderProfile overlay; title "Open stakeholder") — span.plan-sh-name + span.muted type + StatusPill + PlanPriorityCell (TREE 3a)
          - div.plan-sh-addrow — LAST row: PlanAutocomplete "Add existing stakeholder…" (TREE 3b) -> ui-autocomplete row
        - button.btn.plan-add-btn — "Add New Stakeholder" -> ui-button
      - PlanSection n=4 "Tactics" — PlanStrategies:
        - div.plan-strats — strategy stack
          - div.plan-strat × N — per strategy card:
            - div.plan-strat-top — input.plan-strat-title (placeholder "Strategy / tactic") + btn-ghost remove (Icon close, aria-label "Remove") -> ui-text-field + ui-icon-button
            - textarea.plan-field rows 2 (placeholder "How - the action to take") -> multiline gap component
            - div.plan-strat-meta-inline — label.plan-inline-field.plan-timing-field (lbl "Timing" + input.plan-inline-input placeholder "e.g. Q1–Q2") + label.plan-inline-field (lbl "Lead" + LeadPick, TREE 3c) -> ui-text-field + the lead composition
          - div.plan-tactic-add style display:none — the DEAD add stub (ORACLE STUB above) — absorbed: DO NOT REPLICATE; replaced by the made-real "Add strategy/tactic" ui-button (variant text)
      - PlanSection n=5 "Measurement & Reporting" — textarea.plan-field rows 4 (placeholder per COPY STRINGS) -> multiline gap component
    - aside.plan-aside.plan-aside-right — RIGHT floating sidebar -> ui-inspector
      - div.plan-aside-field — span.lbl "Cross-functional team" + PlanTeam:
        - div.plan-team — div.plan-team-row × N (Avatar 28 + div.plan-team-meta {name 500/13px + input.plan-team-role placeholder "Role on this plan"} + btn-ghost remove) -> ui-list items (ui-avatar + name + inline text field per the PLAIN/INLINE gap + trailing ui-icon-button); then ONE OF div.plan-team-add (UserAutocomplete "Search teammates…", autoFocus) -> ui-autocomplete / button.btn.plan-add-inline "Add Teammate" (only when available.length > 0) -> ui-button (variant text)
      - div.plan-aside-field.plan-divider — "How stakeholders are prioritized": p.plan-aside-explain (verbatim explainer; strong "suggest"; span.prio-suggest-inline ✦) + SepExplain -> token-inked text block, then:
        - div.sep-explain > div.sep-explain-group × 2 ("Sector · {name}" / "Scenario · {name}") — div.sep-explain-head + div.sep-explain-factor per factor (div.sep-explain-top {strong label + span.sep-explain-w "{w}%"} + div.sep-explain-desc) -> token-inked factor readout block inside the ui-inspector
      - div.plan-aside-field.plan-divider — "Personas": div.plan-addon-note (Icon lock + add-on copy) -> ui-icon lock + token-inked text
  - div.sheet-footer — div.group (Icon plan + strong n + " stakeholders in plan") · div.group "·" · div.group workspace name · div.group "·" · div.group sector name · div.spacer · div.group.muted "Saved · {date}" -> ui-status-bar
  - [conditional overlay: newSh] StakeholderModal — the shared new-stakeholder modal (captured in the Lists/sheet-modals box) -> ui-dialog composition
  - [conditional overlay: viewSh] StakeholderProfile — the stakeholder profile overlay (captured in the stakeholder-profile box)
  - [DEAD: addExisting && false] an empty fragment that can NEVER render — and addExisting has NO true-setter anywhere (only setAddExisting(false) in assignExisting); dead state + dead block — absorbed: DO NOT REPLICATE

TREE 3a — PlanPriorityCell (the Priority cell, inside each editor stakeholder row):
- span.plan-prio-cell (ref wrapRef; onClick stopPropagation + managers toggle popover) -> the priority ui-chip + ui-menu anchor (in the rebuilt binding schema this cell lives in the PLAN FIT column)
  - PriorityPill (effective band) -> ui-chip (priority tokens)
  - ONE OF: span.prio-mark.prio-overridden "·set" (title "Set by a manager - click to use the suggestion") / span.prio-mark.prio-suggest "✦" (title = the suggested-score tooltip — ORACLE-ONLY COPY: its "{score}/100" text is do-not-replicate; the rebuilt tooltip reads "Suggested · {band} - weighs {top}" with model-scoped labels) -> token-inked mark in ui-tooltip (✦ = ui-icon auto_awesome per the build-map)
  - [conditional: open && canEdit] div.prio-pop (onClick stopPropagation only — keeps the popover open when its body is clicked) -> ui-menu surface
    - div.prio-pop-head — span.prio-pop-score "Suggested · {band} · {score}/100" + span.prio-pop-why "Weighs {top}" (oracle copy) -> non-interactive ui-menu header block carrying the RULED replacement copy "Suggested · {band}" + "Weighs {top}" (model-scoped labels) — the "· {score}/100" fragment is captured here for losslessness and is NEVER rebuilt (never-a-number ruling)
    - div.prio-pop-opts — three button.prio-pop-opt High/Medium/Low (.on on the effective band) -> ui-menu-item ×3
    - [conditional: override] button.prio-pop-revert — Icon sparkle + "Use suggestion ({band})" -> ui-menu-item with leading ui-icon auto_awesome

TREE 3b — PlanAutocomplete (shared inline autocomplete):
- div.user-autocomplete.plan-ac (+.plan-ac-dark for LeadPick) (onBlur 150ms-delayed close) -> ui-autocomplete
  - input (onChange sets query + opens; onFocus opens)
  - [conditional: open && matches] div.ua-menu — button.ua-row × up-to-8 (onMouseDown pick; div.ua-row-name + div.ua-row-title) -> ui-autocomplete option rows (two-line)

TREE 3c — LeadPick (three mutually exclusive states):
- [lead + closed] span.tag.lead-tag (click reopens picker) — Avatar 16 + name + span.lead-x "×" (stopPropagation; clears lead) -> ui-chip (input variant, removable, with ui-avatar)
- [no lead + closed] button.tag.lead-tag.lead-empty "Assign lead…" -> ui-chip (assist, interactive)
- [open] div.lead-picker > PlanAutocomplete (dark) -> ui-autocomplete (token-driven dark surface)

TREE 4 — PLAN REVIEW (PlanReview, mode "review"):
- div.sheet-wrap — page root
  - div.sheet-toolbar — button.btn.btn-ghost (Icon chevron-left + "Plans", title "All plans"; onBack) + span title (fontWeight 500) + div.spacer + button.btn.btn-primary (Icon edit + "Edit plan"; onEdit) -> ui-app-bar (text ui-button + title text + filled ui-button)
  - div.plan-review-body — the review runway -> layout column
    - div.plan-review-doc — the document column -> white content surface
      - header.plan-review-head
        - h1 — plan title
        - div.muted — assembled meta line (workspace · market/region · site · state abbr · geography · "Updated {date}")
        - [conditional: summary] p.plan-review-summary
        - div.plan-review-models — goal-model span.tag (PLAN_GOAL_COLORS or fallback) + span.comm-stage-text status + span.spacer + OwnersDisplay (owners, 26) -> ui-chip + token-inked status + ui-avatar stack
        - div.plan-algobar (marginTop 12) — span.plan-algobar-tag "SEP model" (RENAME per naming rule) + code sector formula + span.plan-algobar-sep "·" + code goal formula -> token-inked formula bar (tnum)
      - section.plan-review-section × 8 (the RS shell: h2 title + content), in order:
        - "Scenario & Context" — div.plan-review-scenario with up to three blocks (span.lbl + p.plan-review-prose) or "Not written yet."
        - "Aligning With Organizational Goals" — div.plan-goal-list > div.plan-goal-item per goal (subheader-text title + prose or muted "No approach described yet."); whole section "No goals listed." when ORG_GOALS empty
        - "Stakeholders In This Plan" — div.plan-sh-table (overflow visible) with plan-sh-thead + plan-sh-trow × N (cursor default, NOT clickable; name · muted type · StatusPill · PriorityPill) or "No stakeholders in this workspace." -> ui-data-table (read-only; the rebuilt review table follows the same BINDING ELEMENT-6 ROW SCHEMA, read-only)
        - "Cross-functional Team" — div.plan-review-team > div.plan-review-teamrow per member (Avatar 28 + name 500/13px + muted 11.5px role||title) or "No team assigned." -> ui-list
        - "Tactics" — div.plan-review-strat per strategy (div.plan-review-strat-title or "Untitled" + optional prose + div.plan-review-strat-meta.muted "Timing: …" / "Lead: …") or "No tactics yet."
        - "Issues" — inline-flex wrap of Tags or "None." -> ui-chip-set
        - "Community Investment" — div.plan-review-comm per linked entry ("{name} - {kind} · {stage} · {amount}") or "No community investments linked."
        - "Measurement & Reporting" — p.plan-review-prose or "Not written yet."

ABSORBED / DEAD REGIONS (every remaining className in plan.jsx accounted for): PlanList (div.plan-list > div.plan-list-item {span.plan-list-bullet + input + btn-ghost remove}) is DEFINED BUT NEVER RENDERED anywhere in the module — dead component (its internal add()/draft has no rendered input either); DO NOT REPLICATE. The addExisting state + the "addExisting && false" fragment are dead (no true-setter). PlanSection's wide/tag props are never passed. onDelete/deletePlan is threaded to PlanHome but NO delete control exists on the landing (or anywhere in plan.jsx) — deletePlan is unreachable from the Plan UI; the rebuild decides a real delete affordance with the user rather than replicating the dead prop. LandingView's onNew/newLabel props are DEAD in landing.jsx (destructured, never rendered) — the "New plan" affordance actually comes from the APP SHELL's add control via the addNonce/addNonceFor effect (addNonceFor === "plan" -> newPlan()); newLabel "New plan" never appears on screen in the oracle.

================================================================
UX HANDLER CENSUS (module set: archive/src/plan.jsx — every event handler, grep-verified: 22 onClick + 30 onChange + 1 onFocus + 1 onBlur + 1 onMouseDown = 55 JSX handler attributes, + 1 document-level listener = 56 HANDLERS; 54 reachable + 2 inside the dead PlanList). Enumerated with exact behavior:

LANDING / CARD (3): (1) card title click -> onReview(p.id) opens the review (tooltip "Open plan"); (2) card "Review" link -> stopPropagation + onReview; (3) card "Edit" link -> stopPropagation + onOpen (editor). [The landing shell's own handlers — search input, Filter/Sort buttons + popover onMouseLeave closes + Clear-alls, "See all" toggle, table-row click -> onRowClick — live in the SHARED landing.jsx (1 onChange + 6 onClick + 2 onMouseLeave) plus FilterSection/SortFieldList in components.jsx, and are censused with that shared shell, not double-counted here.]

EDITOR TOOLBAR (4): (4) "‹ All plans" -> onBack; (5) title input onChange -> set({title}); (6) sector select onChange; (7) goal select onChange; (8) "Save" click -> onBack (disabled until planValid; saving is continuous via updatePlan).

LEFT SIDEBAR (11): (9) summary textarea onChange; (10) status select; (11) workspace select; (12) market select (RESETS region to ""); (13) region select; (14) site select (CASCADES state from the site); (15) state select; (16) geography select; (17) MultiOwnerPicker onChange -> set({owners}); (18) IssueSelector onChange -> set({issues}); (19) PlanCommunity onChange -> set({communityIds}).

MAIN SECTIONS (10): (20)(21)(22) the three scenario textareas onChange; (23) per-goal alignment-note textarea onChange (the BROKEN two-arg set call — goalNotes never persists and the string-spread junk keys land on the record; fix at rebuild, see the goalNotes ORACLE BUG); (24) stakeholder row click -> setViewShId -> StakeholderProfile overlay (title "Open stakeholder"); (25) "Add New Stakeholder" click -> opens StakeholderModal (onCancel closes; onSubmit -> addStakeholder(data, p.workspaceId) + close); (26) PlanStrategies onChange -> set({strategies}); (27) strategy title input onChange; (28) strategy "how" textarea onChange; (29) strategy timing input onChange; plus (30) strategy remove click -> filter by id; (31) measurement textarea onChange.

PRIORITY CELL (5): (32) cell click -> stopPropagation; managers-only toggles the popover; (33) popover body click -> stopPropagation only (keeps it open); (34) High/Medium/Low option click -> onSet(band === suggestion.band ? null : band) then close (picking the suggested band CLEARS the override); (35) "Use suggestion" revert click -> onSet(null) + close; (36) document mousedown listener (active only while open) -> closes the popover on any outside click.

PLANAUTOCOMPLETE (4, shared by add-existing-stakeholder + LeadPick): (37) query input onChange -> set query + open; (38) input onFocus -> open; (39) wrapper onBlur -> 150ms-delayed close; (40) option onMouseDown -> onPick(id), clear query, close. Its onPick wirings: add-existing row -> assignExisting(id) (adds the stakeholder to the WORKSPACE — no plan field); LeadPick -> sets the strategy ownerId + closes.

LEADPICK (3): (41) assigned-tag body click -> reopen the picker; (42) lead-x "×" click -> stopPropagation + onChange(null) clears the lead; (43) "Assign lead…" empty-state click -> open the picker.

RIGHT SIDEBAR / TEAM (4): (44) team-role inline input onChange -> edits that member's role in place; (45) member remove click -> filters the member out by userId; (46) "Add Teammate" click -> swaps to the UserAutocomplete; (47) UserAutocomplete onChange (pick) -> pushes { userId, role: "" } + closes.

COMMUNITY LINKER (3): (48) linked-row remove click -> onChange(ids minus this one); (49) "Add Community Investment" click -> swaps to the autocomplete; (50) UserAutocomplete onChange (pick) -> appends the id + closes.

REVIEW (2): (51) "Plans" back click -> onBack; (52) "Edit plan" click -> onEdit (flips to the editor).

DEAD (2, inside the never-rendered PlanList): (53) item input onChange; (54) item remove onClick — unreachable; DO NOT REPLICATE.

NON-HANDLER REACTIVE TRIGGERS (2 effects, captured for completeness): addNonceFor === "plan" && addNonce -> newPlan() (the app-shell "+" control is the real New-plan affordance — LandingView's onNew/newLabel are dead props); window.__pendingPlanId -> open that plan in review mode when a match exists, then clear the global UNCONDITIONALLY on any truthy value (the dep-less DEEP-LINK BRIDGE above).

COUNT: 56 handlers (55 JSX attributes + 1 document listener), all accounted — 54 reachable and described above (every one already covered by or now added to this box), 2 dead in PlanList (flagged DO-NOT-REPLICATE). No handler silently dropped. CORRECTIONS SURFACED BY THE CENSUS (additive; nothing above is disproved): (a) deletePlan/onDelete is threaded but has NO control — plan deletion is impossible in the oracle UI; (b) LandingView never renders onNew/newLabel — creation is app-shell-driven via addNonce; (c) the prio-pop body's stopPropagation-only click and the LeadPick tag-body reopen click are now explicit.` },
      { t: "Stakeholder Plan — worked-example reference (structure to preserve from the doc)", done: true, d:
`Reusable STRUCTURE pulled from the doc's worked example (Gold Coast Refinery), captured so it survives without the PDF. This is element SKELETON, not the illustrative narrative.

POLLING (premium element 8) — a stakeholder survey: a set of QUESTIONS posed to N recipients, then RESULTS as insight bullets. Starter question template (generalize per plan): awareness of the issue/mandate and its implications; primary concerns (e.g. pollution/safety/health); support for the proposed approach/alternative; expected impact (e.g. on prices/jobs); extent of support for the org's compliance/initiative; willingness to support local initiatives; views on jobs/economic impact; credibility of the org's information; interest in participating in stakeholder meetings. RESULTS = themed findings (splits, demographic skews, top concerns, anxieties by group).

PERSONAS (premium element 9) — ONE persona per stakeholder CATEGORY, each a named archetype with four fields: DEMOGRAPHICS; AWARENESS & CONCERNS; PERSPECTIVE ON THE ORGANIZATION; ENGAGEMENT WILLINGNESS. Built from the plan's algorithm + listening sessions + (premium) polling + consumer data. (Example names: "Regulatory Rachel", "Neighbor Natalie", "Employee Emily", "Supplier Sam", "Consumer Claire", "Investor Ian".)

INVOLVEMENT / RISK / OPPORTUNITY (element 7) — per priority stakeholder, three short fields. Pattern: INVOLVEMENT = what role they play / how they're engaged; RISK = what could go wrong with them; OPPORTUNITY = the upside if engaged well. Grouped under stakeholder CATEGORY in the readout. Keep entry light.

PREDICTIONS (element 12) — per stakeholder group, the anticipated reaction to the plan (e.g. "regulators appreciate proactive compliance"; "employees value support programs but job-security concerns remain"; "communities respond to investment but stay vigilant on safety"; "investors watch financials but react favorably to reputation/community investment").

COMPANY GOALS / ENGAGEMENT-PLAN / CROSS-FUNCTIONAL TEAM (elements 3/4/5) — the example shows: numbered org goals; an engagement plan of strategy pillars (early engagement · transparency · support programs · community investment · ongoing communication); and cross-functional functions (Executive Leadership · Operations & HR · PR & Marketing · Legal & Compliance · Community Relations) — useful default role chips for element 5.

EXECUTION CHECKLIST (element 10) & COMMUNITY INVESTMENT (element 11) — checklist = action items (finalize internal plan · run listening sessions · launch targeted communication · announce support/community programs · establish a feedback loop). Community investment focus-area pattern: environmental/education · economic development/workforce · health & safety.

COMMUNICATION STRATEGY (reference for a LATER marketing/comms capability beyond element 13's key messages) — PAID MEDIA: targeted digital campaigns (social), search engine marketing, native advertising, out-of-home, sponsorships. INFLUENCER OUTREACH: identify aligned influencers → personalized outreach → collaboration (visits/co-created content) → monitor engagement. INTEGRATION: consistent messaging across all channels tied to the plan's goals. (Not a built plan element now; captured so the strategy detail isn't lost.)` },
                                          { t: "Community — invest in the community: applications → manager approval → tracked investments (FX-aware)", done: true, d:
`WHAT IT IS — the COMMUNITY module is where the org INVESTS in the community in different ways: Philanthropy · Volunteering · Corporate Giving · Political Action (PAC) · Sustainability · Social Impact (the kinds). Teammates create APPLICATIONS proposing an investment; the team reviews and VOTES (advisory); an application moved to a committed stage becomes a tracked INVESTMENT the org accomplishes and tracks. Nav = "Community." Surfaces: a LANDING grid of applications + the record (record.community.view/.edit). Linked to stakeholders (represented + linked) and to plans (plan.communityIds, plan element 11). TITLE NOTE: the "manager approval" and "FX-aware" in this box's title are FORWARD-DESIGN targets, NOT oracle behavior — see the STAGES and FORWARD-DESIGN paragraphs below for what the oracle actually does.

STAGES — Idea -> Proposed -> Under Review -> Approved -> Active -> Complete -> Declined. "DECIDED / COMMITTED" = Approved, Active, or Complete (drives the rollups + approved label). ORACLE GROUND TRUTH ON APPROVAL: Stage is a PLAIN SELECT in the edit modal (options = D.COMMUNITY_STAGES) that ANY user can change freely — there is NO manager check, NO formal Approve action, and NO approverId/approvedAt stamping anywhere in community.jsx or community-modal.jsx. "Approving" in the oracle = someone hand-setting stage to Approved and hand-entering approvedAmount + dateApproved. MANAGER-GATED APPROVAL IS FORWARD-DESIGN (NOT in the oracle): the rebuild adds a formal MANAGER-ONLY Approve action that moves an application to Approved and stamps approverId + approvedAt; votes inform that decision, they do not make it. Until that gate is built, the oracle-faithful baseline is the free stage select.

VALUE SCORE (MANUAL) = (licenseToOperate + relationshipImpact) / 2 -> 0–10. Both are hand-entered 0–10 inputs; not derived.

VOTES (ADVISORY) — each teammate casts for / against from the card (clicking your current choice toggles it off); the tally informs the approval decision. Votes never decide. NO ROLE GATE: vote() itself checks nothing about the caller — ANY currentUser may vote; only the Submitter SELECT filters role !== "system". Do not invent a non-system voting gate. The vote enum is for | against | abstain and seed data contains abstain votes, but ABSTAIN IS UNREACHABLE from the oracle UI — no control anywhere sets it (see VOTE CONTROL below for the grep-verified detail).

CONTRIBUTION TYPES & MONETIZATION — askType in Funding · Volunteer hours · Endorsement · In-kind · Political contribution. ORACLE GROUND TRUTH: there is NO monetization mechanism and NO valuation field. Non-USD asks (unit "hours" or "" n/a) contribute 0 to the Requested rollup — that rollup counts ONLY unit === "USD" ask amounts — and communityEntryAmount displays them as "{amount} {unit}" with no conversion; the ONLY dollar figure such an entry can produce is a manually entered USD approvedAmount (which then flows into the approved/annual/cumulative rollups like any other). FORWARD-DESIGN (NOT in oracle): volunteer hours and in-kind get a MONETARY VALUE ASSIGNED case-by-case within the application (e.g. rate × hours; an in-kind valuation) — the monetizedValue field below — so every contribution rolls up as a dollar-equivalent.

FORWARD-DESIGN vs ORACLE — THREE things in this box are FORWARD-DESIGN, not oracle behavior: (1) the MULTI-CURRENCY + FX model below (committedFxRate, MXN/CAD, monetizedValue, "locked historic rates", real-time conversion API); (2) MANAGER-GATED APPROVAL (the Approve action + approverId/approvedAt — see STAGES); (3) CASE-BY-CASE MONETIZATION of hours/in-kind (monetizedValue — see CONTRIBUTION TYPES). The ORACLE IS USD-ONLY with NO FX: its unit enum is just USD / hours / "" (n/a), it has no committedFxRate/committedFxDate/monetizedValue/approverId/approvedAt fields, stage is a free select, and all rollups are plain USD sums. KEEP the forward designs as the intended successors, but everything in the "ORACLE GROUND TRUTH" section below is what the old code literally does and is the concrete baseline.

MULTI-CURRENCY + FX (FORWARD-DESIGN, NOT in oracle) — amounts may be in USD, MXN, or CAD (Mexico + Canada are already in scope via markets/regions; USD is the reporting currency). An embedded REAL-TIME DOLLAR-CONVERSION API converts non-USD amounts to USD for display and rollups. HISTORIC-RATE LOCK (critical): when an application is COMMITTED (manager-approved), the app CAPTURES AND STORES the FX rate at that moment (committedFxRate + committedFxDate — the "historic real-time value"). From then on, the tracked/cumulative total uses that LOCKED historic USD value — so committed/completed investments are NOT re-inflated or deflated by later FX swings. PENDING / requested amounts convert at the CURRENT real-time rate; COMMITTED amounts use their stored historic rate. (Sandbox/offline fallback: last-known cached rate. The FX API also belongs in the Integrations/APIs bucket.) DIVERGENCE FLAG: forward-design vs oracle (oracle is USD-only, no FX).

CROSS-LINKS — affiliatedCommunity(stakeholder) = applications where the stakeholder is REPRESENTED (representedStakeholderId, the primary) OR LINKED (linkedStakeholders). stakeholderCumulativeUSD(stakeholder) = Σ committed USD of that stakeholder's affiliated decided applications (shown on the stakeholder profile). plan.communityIds links a plan's community investments.

DATA MODEL (per application) — id · name · kind · stage · summary · description · rationale · submitter + submitterRole + dateSubmitted · representedStakeholderId · recipient · linkedStakeholders[] · markets/regions/issues · askType · amount + unit + recurrence (One-time/Annual/Multi-year) + years · timeline · decisionDeadline · budget{total, requested, otherFunding, inKind} · approvedAmount · dateApproved · licenseToOperate (0–10) · relationshipImpact (0–10) · risk{reputational, legal, conflictOfInterest(+conflictDetail), attestation} · attachments[] · votes{userId->for|against|abstain} · owners · createdBy/At · updatedAt · givingMode (Monetary/In-Kind/Mix, Corporate Giving) · site · state · geography. FORWARD-DESIGN adds: currency (USD/MXN/CAD) · monetizedValue · committedFxRate + committedFxDate · approverId + approvedAt.

================================================================
ORACLE GROUND TRUTH (archive/src/community.jsx + community-modal.jsx) — exact formatters, labels, defaults, validation, constraints, copy, and section order. USD-ONLY, no FX, no manager gate.

moneyK FORMATTER (compact, used in the rollup strip) — v = Number(n) || 0; if v >= 1000000 -> "$" + (v/1000000).toFixed(v % 1000000 === 0 ? 0 : 1) + "m" (no decimal when an even number of millions, else one decimal); else if v >= 1000 -> "$" + Math.round(v/1000) + "k" (rounded thousands); else "$" + v. money(n) FORMATTER (full) = "$" + (Number(n)||0).toLocaleString().

isDecided(stage) = stage === "Approved" || "Active" || "Complete" (single source of truth for both the card label and the rollups).

approvedLabel(app) -> { text, tone }: if stage === "Declined" -> { "Declined", "neg" }; else if !isDecided(stage) -> { "TBD", "muted" }; else appr = Number(approvedAmount)||0; if appr <= 0 -> { "No Expense", "muted" }; else { money(appr), "pos" }. Tone -> color: pos var(--pos), neg var(--neg), muted var(--ink-3) (card) / var(--ink-3) (profile uses alColor likewise). communityEntryAmount(a): if unit === "USD" -> approvedLabel(a).text; else if a.amount -> a.amount + " " + (a.unit||""); else "-".

valueScore(app) = (licenseToOperate||0 + relationshipImpact||0) / 2, 0–10 (already captured — keep). The VALUE BAR renders a .comm-value-bar with inner span width = (vs * 10) + "%" (vs is the 0–10 score, so 10 -> 100%); shown alongside as vs.toFixed(1) (card) or vs.toFixed(1) + " / 10" (profile + modal).

VOTE CONTROL — vote(appId, choice): toggles votes[currentUser.id]; if the current value equals choice it is deleted (toggle off), else set to choice. The function ACCEPTS any choice string and the card COUNTS all three (counts = { for:0, against:0, abstain:0 }; Object.values(votes).forEach(v => counts[v] = (counts[v] || 0) + 1)) — the (counts[v] || 0) form tolerates ARBITRARY/unknown vote strings (counts them from 0 instead of yielding NaN), consistent with vote() accepting any choice string. BUT the card only RENDERS for + against buttons: "for" button (icon chevronUp, title "Align / support") and "against" button (icon chevron, title "Object"), each showing its count + .on when it is myVote. ABSTAIN IS UNREACHABLE IN THE ORACLE UI (grep-verified across archive/src): NO code path anywhere calls vote(id, "abstain") — abstain exists only in the counts initializer above, in seed data (data.js lines 610 and 633), and in a DEAD CSS rule (.comm-vote-btn.abstain.on, styles.css line 3449) for a planned third button that was never rendered. There is no "elsewhere" that sets or clears it: an existing (seeded) abstain vote cannot be cleared in ONE step and can never be re-cast as abstain from the UI — but no-vote IS reachable in TWO clicks: clicking for or against OVERWRITES the abstain (the click sets the new choice, since votes[uid] !== choice), and re-clicking that same button then toggles the entry off to no-vote.

CARD ANATOMY (CommunityCard — the landing card view, .comm-card) — top to bottom:
- HEAD (.comm-card-head): left column (minWidth 0) = the application NAME (.comm-card-name), CLICKABLE — onClick opens the read-only profile (onOpen), tooltip title "Open application" — over a muted RECIPIENT line (.comm-card-recipient); right = OwnersDisplay (users, app.owners||[], size 24).
- BADGES ROW (.comm-card-badges): KindBadge (colored .tag per KIND_COLORS); when kind === "Corporate Giving" AND givingMode is set, a second plain tag showing the givingMode (background var(--bg-2), color var(--ink-2)); flex spacer; right-aligned STAGE TEXT (.comm-stage-text) colored STAGE_COLORS[stage].fg (fallback var(--ink-2)) — text only, no pill.
- SUMMARY: a paragraph (.comm-card-summary) = app.summary.
- META ROWS (.comm-card-meta, keyed rows .comm-meta-row with .comm-meta-k key + .comm-meta-v value): "Ask" = (unit === "USD" ? money(amount) : amount + " " + unit) followed by a muted suffix " · {recurrence}" plus " · {years} yr" only when years > 1; "Approved" = approvedLabel text colored by tone (pos var(--pos) / neg var(--neg) / muted var(--ink-3)); "Value" = the value bar (inner width vs*10 %) + vs.toFixed(1) in mono 11px, marginLeft 6.
- CONDITIONAL "Issues" ROW (.comm-card-linked): ONLY when (app.issues||[]).length > 0 — key "Issues" + Tags of the issue values.
- CONDITIONAL "Engaged" ROW (.comm-card-linked): ONLY when at least one linkedStakeholders id resolves to a stakeholder — key "Engaged" + the resolved display names (displayName(s) || s.name) comma-joined (.comm-linked-names). Plain text, not clickable.
- CONDITIONAL LOCATION META (.comm-card-meta with .plan-meta-nobottom): "Markets" row only when markets non-empty (comma-joined); "Regions" row only when regions non-empty (comma-joined); "Site" row only when app.site is set AND D.SITES exists (value = D.siteLabel of the matching site, "-" fallback).
- FOOT (.comm-card-foot): the vote group (.comm-vote — the for/against buttons described in VOTE CONTROL) · flex spacer · action links (.plan-card-actions): "Review" (explainer-link; stopPropagation; calls onOpen — opens the read-only profile) and "Edit" (explainer-link; stopPropagation; calls onEdit — opens the editor).

FY ROLLUPS (USD, fiscal-year aware) — fsMonth = appConfig.fiscalStartMonth || 1; fsDay = appConfig.fiscalStartDay || 1. fyStartYear(dateStr): d = new Date(dateStr); m = d.getMonth()+1, day = d.getDate(), y = d.getFullYear(); return (m > fsMonth || (m === fsMonth && day >= fsDay)) ? y : y-1 (null for empty/invalid). curFY = fyStartYear(now).
- allocInFY(a, fy): appr = Number(approvedAmount)||0; if !isDecided(a.stage) || appr <= 0 -> 0; startFY = fyStartYear(a.dateApproved || a.createdAt); if startFY == null -> 0; n = (recurrence === "Multi-year") ? Math.max(1, Number(years)||1) : 1; Multi-year -> (fy >= startFY && fy < startFY + n) ? appr/n : 0; Annual -> (fy >= startFY) ? appr : 0; One-time (else) -> (fy === startFY) ? appr : 0.
- requested = Σ over ALL community of (unit === "USD" ? Number(amount)||0 : 0) — i.e. raw USD-unit ASK amount only (non-USD units contribute 0; uses amount, NOT approvedAmount).
- approved = Σ over ALL community of (Number(approvedAmount)||0) WHERE isDecided(stage). COMPUTED BUT NEVER RENDERED: the rollup strip shows only Requested / Annual / 3YR Total and rollup.approved is used nowhere else — a dead value; do NOT invent a display surface for it at rebuild.
- annual = Σ allocInFY(a, curFY).
- cumulative = Σ (allocInFY(a, curFY) + allocInFY(a, curFY-1) + allocInFY(a, curFY-2)) — this FY + 2 prior.
Rollup strip (toolbarRight): "Requested {moneyK(requested)}" · "Annual {moneyK(annual)}" · "3YR Total {moneyK(cumulative)}".

PAGE UPSERT (the Community page's own save path) — CommunityModal's onSubmit(d) hands the draft AS-IS to the page's LOCAL upsert(app): if no entry with app.id exists, the new application is inserted at the FRONT of the community array ([app, ...prev] — newest first); otherwise the existing entry is REPLACED IN PLACE by id. ORACLE QUIRK — DO NOT REPLICATE: this path NEVER bumps updatedAt (neither the modal nor the page stamps it; an edited entry keeps whatever updatedAt it already had — for a fresh creation that is the blank's create-day stamp). The app has a SECOND save path — app.jsx updateCommunityApp, used by the stakeholder-profile drill — which DOES stamp updatedAt = nowStamp() on every save (and does the same front-insert/replace-by-id). Consequence: the landing's "Last updated" sort (_updated getter, updatedAt||createdAt) is STALE for edits made on the Community page itself and fresh only for edits made through a stakeholder profile that used the app-level upserter. MAKE-REAL RULE: the rebuild uses ONE shared upserter that stamps updatedAt on EVERY save (consistent with the timestamp-precision box), keeping the front-insert-on-create ordering. (Note the Community page's OWN embedded StakeholderProfile — see the BRIDGE paragraph below — wires updateCommunityApp to the page's LOCAL upsert, so even that drill inherits the no-stamp quirk when entered from the Community page.)

MODAL BLANK DEFAULTS (CommunityModal blank, new application) — id uid("ca"); name "" ; kind "Philanthropy"; stage "Idea"; summary/description/rationale ""; submitter = currentUser.id; submitterRole = currentUser.title; dateSubmitted = today (new Date().toISOString().slice(0,10)); representedStakeholderId ""; recipient ""; linkedStakeholders []; markets/regions/issues []; askType "Funding"; amount 0; unit "USD"; recurrence "One-time"; years 1; givingMode "Monetary"; timeline ""; decisionDeadline ""; dateApproved ""; budget { total:0, requested:0, otherFunding:0, inKind:"" }; approvedAmount 0; licenseToOperate 5; relationshipImpact 5; risk { reputational:"", legal:"", conflictOfInterest:false, attestation:false }; attachments []; votes {}; owners [currentUser.id]; createdBy currentUser.id; createdAt/updatedAt today. (Edit deep-copies existing via JSON parse/stringify.)

MODAL VALIDATION (missing array; valid = empty) — each required field pushes an EXACT DISPLAY STRING into missing, rendered verbatim in the readout. In check order, condition -> pushed label: !name.trim() -> "Project name"; !summary.trim() -> "One-line summary"; !recipient.trim() -> "Recipient"; !description.trim() -> "Description"; !rationale.trim() -> "Why this, why now"; !submitter -> "Submitter"; !dateSubmitted -> "Date submitted"; !timeline.trim() -> "Timeline"; !(Number(amount) > 0) -> "Amount"; !years || Number(years) < 1 -> "Years"; no markets -> "Markets"; no regions -> "Regions"; no issues -> "Issues"; no linkedStakeholders -> "Connected stakeholders"; no owners -> "Owners"; !(Number(budget.total) > 0) -> "Total project cost"; kind === "Corporate Giving" && !givingMode -> "Giving mode"; risk.conflictOfInterest && !(risk.conflictDetail||"").trim() -> "Conflict description"; !risk.attestation -> "Attestation". attachments are genuinely OPTIONAL. Missing readout: asPage toolbar shows span.modal-missing "{N} left" with title = the full missing list comma-joined; modal foot shows "{N} field{s} left: {first 3 comma-joined}{… when more than 3}" ("field" singular when N === 1), same full-list title. Save/Create button disabled until valid.

MODAL CHROME COPY (exact strings) — MODAL variant head: h2 = "New application" (create) / "Edit application" (edit); in edit mode an explainer-link button "View application" (title "View application") sits beside the h2; a ghost close button (Icon close, aria-label "Close") on the right. Modal foot: the missing readout (above) + button "Cancel" (plain btn) + primary button "Save application" (edit) / "Create application" (create), disabled until valid. AS-PAGE variant (asPage — how the Community page always opens it): no veil; a sheet-toolbar with a plan-back button "‹ All community" (calls onCancel), a flex spacer, in edit mode the explainer-link "View application", the primary button "Save" (edit) / "Create" (create) disabled until valid, and when invalid the "{N} left" span.

VIEW / EDIT TOGGLE (CommunityModal's own read-only flip) — viewMode state initializes to (initialView && isEdit) — i.e. view-first only for an EXISTING application opened with initialView. When viewMode && isEdit, the modal renders CommunityProfile instead of the form, passing app=existing, asPage passthrough, onBack=onCancel, onClose=onCancel, onEdit=() => setViewMode(false), onOpenStakeholder passthrough — so the profile's Edit action flips back to the form. In edit mode the "View application" button (modal head AND asPage toolbar) sets viewMode true, flipping to the read-only profile. On the COMMUNITY PAGE itself editViewFirst is always false (both Edit entry points call setEditViewFirst(false)), so the editor there always opens in FORM mode and view-first entry happens only via the nested stakeholder-profile case (initialView true — covered in the stakeholder-profile box); the toggle is still live on the Community page via the "View application" button.

FIELD CONSTRAINTS — description: textarea maxLength 1500 with a LIVE counter "{len}/1500"; rationale: textarea maxLength 500 with live counter "{len}/500". amount / years / budget.total / budget.requested / approvedAmount / budget.otherFunding: number inputs (years has min="1"). dateSubmitted / decisionDeadline / dateApproved: type="date" inputs. The two value sliders (licenseToOperate, relationshipImpact): type="range" min 0 max 10 step 1; each slider's LABEL shows the current value beside it in mono var(--ink-2) (e.g. "Improves license to operate 5").

unit ENUM (hard-coded in the modal select) = "USD" · "hours" · "" (label "n/a"). kind options from D.COMMUNITY_KINDS; stage from D.COMMUNITY_STAGES; givingMode from D.GIVING_MODES; askType from D.ASK_TYPES; recurrence from D.RECURRENCE.

MARKETS / REGIONS — ChipMultiSelect (multi-select chip toggle, .filter-chip with .on). Markets options = Object.keys(D.MARKETS). Regions options = d.markets.flatMap(m => D.MARKETS[m] || []) — derived from the CHOSEN markets; when options is empty it shows "Pick a market first". ORPHANED-REGIONS QUIRK (no cascade cleanup): DESELECTING a market does NOT prune d.regions — nothing removes regions whose parent market is gone, so already-selected regions of that market are STRANDED silently in d.regions: their chips vanish from the options list (options derive only from the currently-chosen markets), the stale selection becomes invisible and un-removable from the UI, still satisfies the "Regions" validation, and persists into the saved entry. MAKE-REAL DECISION at rebuild: decide with the user whether market deselection cascade-prunes the now-orphaned regions (the cleaner behavior) or keeps them visible and removable — never silently replicate the invisible stranding. SITE pick (modal): selecting a site with a state sets BOTH site and state (set("site", id); set("state", s.state)); state select shows D.STATE_ABBR labels over D.US_STATES; geography from D.GEOGRAPHIES.

dateApproved CONDITIONAL — the "Date approved" field renders ONLY when stage is in Approved / Active / Complete; helper text "Sets the fiscal year this commitment counts toward."

representedStakeholderId — labelled "Stakeholder / Organization Targeted"; a single-select with "None" default + all stakeholders (displayName). On the profile it is shown as "Targets".

attachments — seeded as [] but NO attachment UI is built (stub; no upload/list control exists in the modal). DO NOT REPLICATE the stub silently — the rebuild either builds a real attachment control or drops the field with the user's sign-off.

STAKEHOLDERPICKER (community-modal.jsx — typeahead multi-select of stakeholders, returns ids; used for Connected stakeholders) — exact mechanics: OPTIONS exclude already-selected ids (filter s => !selected.includes(s.id)); QUERY match is case-insensitive against (displayName(s) || s.name) OR s.org; empty query shows all (unselected); results CAPPED AT 8 (slice(0,8)). MENU ROW anatomy: stakeholder name (fontWeight 500, fontSize 12.5) + a muted 11px sub-line "{s.org} · {s.type}". SELECTION: onMouseDown with preventDefault (so the input keeps focus) appends the id and CLEARS the query. CHOSEN render as removable .tag chips before the input, each with a trailing "×" (color var(--ink-mute), marginLeft 4); clicking a chip removes it (title "Remove"). The input placeholder is "Link stakeholders…" (or the passed placeholder) ONLY when no chips are chosen; once any chip exists the placeholder is empty. Menu opens on input change/focus (only when there are matches) and CLOSES on any mousedown outside the wrapper (document listener). REBUILD MAP: ui-autocomplete configured with exactly these behaviors (exclusion of selected, name-or-org matching, 8-row cap, two-line option rows, removable chips with ×, empty-placeholder-when-chosen, outside-click close).

stakeholderCumulativeUSD(stakeholderId, community) = Σ over affiliatedCommunity(stakeholderId) of (Number(approvedAmount)||0) WHERE isDecided(stage) && appr > 0 — a PLAIN USD sum, NO FX (forward-design would lock historic rates here, but the oracle does not).

CommunityProfile (read-only "completed" card / page) SECTION ORDER — badges (KindBadge + givingMode tag when Corporate Giving + stage text) -> summary paragraph (.comm-card-summary) ONLY when app.summary is set -> "Overview" (Recipient, always, "-" fallback; Targets = the represented stakeholder as a clickable pill, ONLY when representedStakeholderId resolves; Submitter = the resolved user's name with "-" fallback when the submitter id no longer resolves to a user, + " · {submitterRole}" when set, always; Submitted = dateSubmitted, always, "-" fallback) -> "The ask" (Support = askType; Amount = money/unit + " · {recurrence}{ · N yr if years>1}"; Approved = approvedLabel colored; Timeline = app.timeline with "-" fallback, + " · decide by {decisionDeadline}" when set — all four rows always render) -> "Description" (ONLY when description set) -> "Why this, why now" = rationale (ONLY when rationale set) -> "Alignment": the VALUE-BAR row (value bar + "{vs.toFixed(1)} / 10") is UNCONDITIONAL, then FOUR CONDITIONAL rows — "Issues" (Tags) ONLY when (issues||[]).length > 0; "Markets" (comma-joined) ONLY when markets non-empty; "Regions" (comma-joined) ONLY when regions non-empty; "Stakeholders" (linked pills, clickable) ONLY when at least one linkedStakeholders id resolves to a stakeholder — a sparse entry shows just the value bar, NO empty rows -> "Budget" (Total cost = money(budget.total), always; Requested = money(budget.requested), always; Other funding ONLY when budget.otherFunding truthy; In-kind ONLY when budget.inKind truthy) -> "Owners" (OwnersDisplay size 24). asPage variant = the sheet-wrap/plan-review-doc shell with a sheet-toolbar: ghost back button (Icon chevron-left + text "Community", title "All engagements", calls onBack) · the application name in fontWeight 500 · flex spacer · when onEdit, a primary button (Icon edit + text "Edit engagement"). MODAL variant head anatomy = veil + .modal.community-modal.profile-modal with a modal-head: left row = OPTIONAL back chevron (ghost button, Icon chevron-left, title "Back" — rendered only when onBack is passed) + h2 = app.name; right row = when onEdit, an explainer-link "Edit application" + a ghost close button (Icon close, aria-label "Close").

COMMUNITY -> STAKEHOLDER BRIDGE (what a pill CLICK does on the Community page) — CommunityView keeps a viewStakeholderId state (oracle comment: "bridge target"). The StakeholderPills component renders each stakeholder as a .tag, adding class tag-clickable and an onClick ONLY when an onOpen handler is passed (no handler = plain non-clickable pills). Two entry points on the Community page wire that handler:
- From the READ-ONLY PROFILE opened as a page (viewApp): onOpenStakeholder = (id) => { setViewId(null); setViewStakeholderId(id); } — clicking a Targets or Stakeholders pill CLOSES the profile and opens that stakeholder's profile in its place.
- From the EDITOR (CommunityModal, reachable only via its "View application" flip to the read-only profile — the form itself has no pills): onOpenStakeholder = (id) => { setEditId(null); setViewStakeholderId(id); } — the editor unmounts and ANY UNSAVED DRAFT EDITS ARE DISCARDED (no confirm; the flipped profile shows the SAVED entry, not the draft, so what the user sees is what survives).
The Community page then renders the StakeholderProfile overlay ITSELF for the resolved stakeholder (stakeholders.find by id; nothing renders if the id no longer resolves) with props: stakeholder, users, stakeholders, community, scores, team, getWorkspacesForStakeholder, updateCommunityApp = (app) => upsert(app) — the page's OWN LOCAL upsert (community edits made from inside that profile persist through the page path, INCLUDING its no-updatedAt quirk — see PAGE UPSERT), currentUser, companyIssues, onClose = () => setViewStakeholderId(null). Closing returns to the COMMUNITY LANDING, not to the profile/editor the click came from. (The opposite direction — stakeholder profile -> community entry — is captured in the stakeholder-profile box; its deep-link half is the window.__pendingCommunityId bridge below.)

DEEP-LINK BRIDGE — window.__pendingCommunityId: an effect with NO dependency array (it runs on EVERY render, not mount-only — a mount-only rebuild would miss a global set while the view is already mounted) checks the global; when truthy, if a matching entry exists it opens it read-only (setViewId), and the global is then cleared UNCONDITIONALLY — the clear sits inside the truthy check but OUTSIDE the exists check, so a deep-link to a not-yet-present entry is silently DROPPED and never retried. (The plan equivalent is window.__pendingPlanId.) Used from a stakeholder profile page to open a specific community entry.

LANDING (CommunityView, via shared LandingView) — filterDefs (key / label / getter): kind / "Type" / a.kind · issues / "Issues" / a.issues||[] · markets / "Markets" / a.markets||[] · regions / "Regions" / a.regions||[] · stage / "Status" / a.stage||"Idea" · year / "Year created" / yearOf(a.createdAt), where yearOf(iso) = String(new Date(iso).getFullYear()) for a valid parseable date, else "" (empty/invalid dates yield ""). sortFields (key / label / getter WITH FALLBACK): name / "Name" / a.name · stage / "Status" / a.stage||"" · _updated / "Last updated" / a.updatedAt||a.createdAt||"" (falls back to createdAt when never updated — and NOTE the PAGE UPSERT quirk above: in the oracle, Community-page edits never refresh updatedAt, so this sort is stale for them) · _created / "Date added" / a.createdAt||"". searchKeys ["name","recipient","summary"] — the LIVE SEARCH matches ONLY these three keys; issues are NOT searched (they are filterable only via the Issues filter chips in filterDefs). cols (key · label · EXACT grid width w · render): name · "Engagement" · minmax(200px,2fr) · a.name; kind · "Type" · minmax(140px,1.2fr) · a.kind; recipient · "Recipient" · minmax(150px,1.3fr) · a.recipient||"-"; amount · "Amount" · 110px · communityEntryAmount(a); stage · "Status" · 120px · .comm-stage-text colored STAGE_COLORS[stage].fg (fallback var(--ink-2)); markets · "Markets" · minmax(110px,1fr) · (a.markets||[]).join(", ")||"-"; regions · "Regions" · minmax(110px,1fr) · (a.regions||[]).join(", ")||"-"; site · "Site" · minmax(120px,1fr) · when a.site AND D.SITES exist, D.siteLabel of the matching D.SITES entry with "-" fallback, else "-". newLabel "New application"; emptyText "No applications yet. Create one to begin." Footer: "{community.length} applications · Value is the average of two inputs: how much the engagement improves your license to operate and how much the engagement strengthens relationships." Row click -> open read-only profile. DEAD CODE — DO NOT REPLICATE: CommunityView keeps its own search/kindFilter/stageFilter state, a toggle(list,set,v) helper, and a "filtered" memo whose search ALSO matches issues — but "filtered" is NEVER USED (LandingView receives items = the raw community array and does its own searchKeys search). That local filter pipeline is a leftover superseded by LandingView; the rebuild carries only the LandingView props above.

KIND_COLORS (card/profile KindBadge pills, { bg, fg }) — Philanthropy #DDE7C2/#2f5a26 · Volunteering #C2D9E8/#23496e · Corporate Giving #E8DEC2/#6e5419 · Political Action (PAC) #E5D0D0/#7a2424 · Sustainability #C9E3CC/#2f5a26 · Social Impact #DCD3E0/#4F3F69; fallback var(--bg-2)/var(--ink-2). STAGE_COLORS ({ bg, fg }) — Idea #E1E1DA/#54524A · Proposed #EEE6D2/#6E5419 · Under Review #E8DEC2/#6e5419 · Approved #DDE7C2/#2f5a26 · Active #C2D9A4/#2f5a26 · Complete #D9DEE8/#2E3F66 · Declined #E5D0D0/#7a2424. (Status text on cards/landing uses only the .fg.) REBUILD: every hex above maps to --ui-sys-* tokens; do NOT inline hexes.

RECORD SECTIONS + EXACT FIELD COPY (record.community.edit, the modal in order — every label and placeholder verbatim):
- "Project overview": "Project name" (text, autoFocus, placeholder "e.g. Cedarville Workforce STEM Grant") · 2-col: "Engagement type" (kind select) + "Stage" (stage select) · "Giving mode" (select, rendered only when kind === "Corporate Giving"; value defaults display to "Monetary") · "One-line summary" (text, placeholder "Short description shown on the card").
- "Applicant & sponsor": 2-col: "Submitter" (select over non-system users; picking one sets submitterRole to that user's title) + "Submitter role" (text) · "Date submitted" (date) · "Stakeholder / Organization Targeted" (select, "None" default + all stakeholders).
- "The ask": 3-col: "Support requested" (askType select) + "Amount" (number) + "Unit" (select USD / hours / n/a) · 3-col: "Recurrence" (select) + "Years" (number, min 1) + "Decision deadline" (date) · "Timeline" (text, placeholder "e.g. FY26–FY28").
- "Description & rationale": "Description" (textarea rows 4, maxLength 1500, live counter) · "Why this, why now" (textarea rows 2, maxLength 500, live counter).
- "Beneficiary & relationships": "Recipient organization or cause" (text, placeholder "Who receives the support") · "Connected stakeholders" (helper text "Link supporters, opponents, and decision-makers from your map." + StakeholderPicker, input placeholder "Link stakeholders…").
- "Strategic alignment": 2-col sliders "Improves license to operate" + "Improves relationships" (each label shows the current 0–10 value in mono) · a "Value score" readout row (key "Value score" + value bar + "{vs.toFixed(1)} / 10" in mono 12) · "Issues" (IssueSelector) · 2-col: "Markets" + "Regions" (ChipMultiSelect) · 3-col: "Site" ("None" default) + "State" ("None" default, D.STATE_ABBR labels) + "Geography" (placeholder option "Select…").
- "Resources & budget": 3-col: "Total project cost" (number) + "Requested amount" (number) + "Approved amount" (number) · conditional "Date approved" (date, committed stages only, helper "Sets the fiscal year this commitment counts toward.") · 2-col: "Other funding / partners" (number) + "In-kind contributions" (text, placeholder "e.g. employee mentor hours").
- "Risk & compliance": "Reputational / political risk" (text) · "Legal & disclosure considerations" (text) · checkbox "Conflict of interest disclosed" · conditional "Describe the conflict" (textarea rows 2, placeholder "Nature of the conflict and how it's managed", only when the conflict checkbox is checked, indented 26px) · checkbox "I attest this information is accurate".
- "Owners": MultiOwnerPicker (size 26).

RETARGET UI BUILD-MAP TO CANONICAL UI (ui-*) — the old code uses raw <select>/.designed-select, hand-built .comm-value-bar / .comm-vote-btn / .filter-chip, .tag pills, type="range", checkboxes. REBUILD ONLY with Canonical UI.
FORM (record.community.edit): ui-select for kind/stage/givingMode/askType/unit/recurrence/submitter/site/state/geography; ui-text-field for single-line text, number, and date fields. DECLARED GAP — MULTILINE + LIVE CHAR COUNTER: the record needs multiline textareas with live character counters ("Description" rows 4 / maxLength 1500 / "{len}/1500", "Why this, why now" rows 2 / maxLength 500 / "{len}/500", and the conditional "Describe the conflict" rows 2), but manifest.json has NO ui-textarea component and ui-text-field's contract (props: label, value, placeholder, type, error, supporting-text, disabled) has NO multiline/rows mode and NO counter slot. Per the CLAUDE.md gap rule this MUST be resolved BEFORE assembling the community record: EITHER extend ui-text-field with a multiline/rows mode + char-counter (and update its manifest entry), OR build a new ui-textarea into design-system/ to the ui-button quality bar and register it in manifest.json — never a raw <textarea> or an ad-hoc counter span. (The Plan page box declares the SAME gap; resolve once for both.) Continuing: ui-slider for the two value inputs; ui-chip / ui-chip-set for markets/regions multiselect and issue badges; ui-autocomplete for the StakeholderPicker / Connected-stakeholders picker (configured per the STAKEHOLDERPICKER paragraph); ui-checkbox for conflict/attestation; ui-progress (determinate, value = vs*10, or a token-driven bar) for the value score readout; and — FORWARD-DESIGN, NOT in the oracle — a manager-only Approve action (stage in the oracle is just a free ui-select; the gate is added at rebuild per the STAGES paragraph).
VOTE GROUP: the oracle renders EXACTLY TWO vote buttons — "for" and "against" — each a ui-button (variant text) composing the count + a leading ui-icon (Material Symbols ligatures keyboard_arrow_up / keyboard_arrow_down, replacing the oracle's chevronUp/chevron glyphs), selected/.on state token-driven, each wrapped in a ui-tooltip ("Align / support" / "Object"). A THIRD abstain button is MAKE-REAL / FORWARD-DESIGN, NOT oracle behavior (see VOTE CONTROL: no control ever sets abstain; the dead .comm-vote-btn.abstain.on CSS shows it was planned but never rendered) — if the rebuild adds it, it is a third ui-button in the same group and its clear/overwrite semantics are decided with the user then.
READ-ONLY SURFACES (card / profile / chrome — exact ui-* per element): CommunityCard = a composed card surface on --ui-sys-surface-card (composed in the domain-component layer, never loose divs): head = the application name as a clickable token-inked text control wrapped in ui-tooltip ("Open application") over the muted recipient line, plus the owners avatar stack (ui-avatar, --ui-sys-avatar-size-* tokens); badges row = ui-chip (assist variant, non-interactive) for the kind badge and the conditional givingMode chip, stage as token-inked text driven by the --ui-sys-* stage tokens; the Ask/Approved/Value and Markets/Regions/Site meta rows = ui-list two-column key/value rows; Issues = ui-chip-set (non-interactive chips); Engaged = plain token-inked text (NOT clickable in the oracle card); value bar = ui-progress (determinate, value = vs*10) with the numeric readout as token-inked tnum text; foot = the vote ui-button group above + "Review" / "Edit" as ui-button (variant text). CommunityProfile: the Row k/v detail rows (.detail-row) = ui-list two-column key/value rows (the same key/value composition the stakeholder-profile box uses — one composition, never re-implemented per screen); the section labels (cm-section-label: Overview / The ask / Description / Why this, why now / Alignment / Budget / Owners) = token-inked label text (--ui-sys-on-surface-muted, label-scale type token) — never an invented heading component; the Targets/Stakeholders StakeholderPills = ui-chip (assist variant, INTERACTIVE — click fires the COMMUNITY -> STAKEHOLDER BRIDGE above; plain non-interactive ui-chip when no handler is wired); the Alignment value-bar row = ui-progress + token-inked "{vs.toFixed(1)} / 10". PAGE/MODAL CHROME: the asPage sheet-toolbar (profile AND editor) = ui-app-bar with the back control as ui-button (variant text, leading ui-icon chevron_left; profile label "Community" with ui-tooltip "All engagements"; editor label "All community") and the primary action as ui-button (variant filled: "Edit engagement" with leading ui-icon edit / Save / Create), the "{N} left" missing readout as persistent token-inked text with the full list in a ui-tooltip; the MODAL variant = ui-dialog (headline = app name, optional back ui-icon-button chevron_left, "Edit application" / "View application" as ui-button variant text, close ui-icon-button with aria-label "Close", footer actions = Cancel + the primary ui-button). ROLLUP STRIP: the Requested / Annual / 3YR Total strip = a token-inked text group in the ui-app-bar's trailing slot (labels --ui-sys-on-surface-muted, values tnum numerals). LANDING: the shared LandingView composition — ui-data-table for the table mode (exact columns above), filter chips = ui-chip (filter variant), landing footer = ui-status-bar.
NEVER md-*/shadcn, never raw <select>/<span>/<div> as UI primitives, never inline hexes — all kind/stage colors come from --ui-sys-* tokens.

================================================================
SKELETON TREE (ORIGINAL-DESIGN STRUCTURE CENSUS — the literal region tree extracted from archive/src/community.jsx + community-modal.jsx JSX, plus the shared archive/src/landing.jsx shell. One tree per surface, nested in source order; every className region appears or is explicitly absorbed. Each node: region -> contents -> Canonical UI mapping. The build assembles against THESE trees, never prose.)

TREE 1 — COMMUNITY LANDING (CommunityView -> shared LandingView; renders ONLY when no profile, no editor, no new-modal is open — the page swaps whole surfaces, it does not stack them):
- div.community-wrap — landing root (LandingView) -> layout column, token-only container (the page's main region inside ui-app-shell)
  - [PORTAL via ReactDOM.createPortal into the explainerSlot DOM node — the app header's explainer region] div.community-toolbar — toolbar row -> ui-app-bar content row
    - div.search — Icon search + input "Search…" (live over searchKeys name/recipient/summary) + span.kbd.kbd-cmdk (cmdKeyLabel) -> ui-text-field (search variant, leading ui-icon search) + token-inked kbd hint
    - div.filter-button-wrap — button.btn "Filter"/"Filter (n)" (+.filter-active) toggling div.filter-popover (onMouseLeave close): div.filter-pop-head (strong "Filter" + btn-ghost "Clear all") + div.filter-pop-body (FilterSection per filterDef) -> ui-button + ui-menu of ui-chip (filter variant) groups
    - div.filter-button-wrap — button.btn "Sort" toggling div.filter-popover.sort-popover: div.filter-pop-head (strong "Sort by" + "Clear all") + div.filter-pop-body (SortFieldList) -> ui-button + ui-menu
    - button.btn "See all" (+.filter-active in table mode; title "See all in a table") — cards <-> table toggle -> ui-button (variant text, selected state)
    - div.spacer (flex 1)
    - {toolbarRight} = div.comm-rollup-inline — three spans, each span.comm-rollup-lbl label + moneyK value: "Requested" · "Annual" · "3YR Total" -> token-inked text group in the ui-app-bar trailing slot (tnum values)
  - {headerSlot} — Community passes null — absorbed
  - ONE OF (body states): div.comm-empty.muted (emptyText "No applications yet. Create one to begin.") / [table] div.landing-table-scroll > div.profile-table.landing-table.landing-table-flex (div.profile-trow.profile-thead of span.profile-th-label per col; div.profile-trow per app, onClick -> setViewId read-only profile, title "Open", one span.profile-td per col) -> ui-data-table / [cards, default] div.comm-grid of CommunityCard (TREE 2) -> layout grid
  - {footerSlot} div.sheet-footer.comm-footer — div.group (Icon community + strong count + " applications") · div.group "·" · div.group.muted flex 1 (the Value explainer sentence) -> ui-status-bar
- [SIBLING SURFACE: viewApp] CommunityProfile asPage (TREE 4, page shell) replaces the landing
- [SIBLING SURFACE: newOpen || editing] CommunityModal asPage (TREE 3) replaces the landing
- [OVERLAY: viewStakeholder] StakeholderProfile — the bridge target overlay (props per the COMMUNITY -> STAKEHOLDER BRIDGE paragraph)

TREE 2 — COMMUNITY CARD (CommunityCard, one per application in the grid):
- div.comm-card — card root -> composed card surface on --ui-sys-surface-card (domain-component layer)
  - div.comm-card-head — left column (minWidth 0): div.comm-card-name (CLICK -> onOpen read-only profile; title "Open application") + div.comm-card-recipient.muted (recipient) · right: OwnersDisplay (owners, 24) -> clickable token-inked text in ui-tooltip + muted text + ui-avatar stack
  - div.comm-card-badges — KindBadge .tag (KIND_COLORS) + [conditional: Corporate Giving + givingMode] plain .tag givingMode + span.spacer + span.comm-stage-text (STAGE_COLORS fg) -> ui-chip (assist) + conditional ui-chip + spacer + token-inked stage text
  - p.comm-card-summary — app.summary
  - div.comm-card-meta — three div.comm-meta-row (.comm-meta-k + .comm-meta-v): "Ask" (money/unit + muted recurrence/years suffix) · "Approved" (approvedLabel text, tone color) · "Value" (span.comm-value-bar with inner span width vs*10 % + mono 11px readout) -> ui-list key/value rows; value bar = ui-progress (determinate) + tnum text
  - [conditional: issues] div.comm-card-linked — "Issues" + span.comm-card-issues (Tags) -> key + ui-chip-set
  - [conditional: any linked resolves] div.comm-card-linked — "Engaged" + span.comm-linked-names (names comma-joined; NOT clickable) -> key + token-inked text
  - div.comm-card-meta.plan-meta-nobottom — conditional div.comm-meta-row per: "Markets" (when non-empty) · "Regions" (when non-empty) · "Site" (when site + D.SITES) -> ui-list key/value rows
  - div.comm-card-foot — div.comm-vote (button.comm-vote-btn.for {span.comm-vote-n count + Icon chevronUp; title "Align / support"; +.on when myVote} + button.comm-vote-btn.against {count + Icon chevron; title "Object"; +.on}) + div.spacer + span.plan-card-actions ("Review" + "Edit" explainer-links, both stopPropagation) -> the vote ui-button group (per the VOTE GROUP build-map) + two ui-button (variant text)

TREE 3 — COMMUNITY RECORD EDITOR (CommunityModal, create/edit; TWO chrome variants around ONE form stack):
- [MODAL variant only] div.modal-veil.show — click -> onCancel (dismiss) -> ui-dialog scrim
- div: asPage -> .sheet-wrap.community-edit-page / modal -> .modal.community-modal — the editor shell -> asPage: record page region; modal: ui-dialog
  - [asPage] div.sheet-toolbar — button.plan-back "‹ All community" (onCancel) + div.spacer + [edit mode] explainer-link "View application" (flips to TREE 4) + button.btn.btn-primary "Save"/"Create" (disabled !valid; onSubmit(d)) + [conditional: !valid] span.modal-missing "{N} left" (full list in title) -> ui-app-bar (text ui-button back · spacer · text ui-button · filled ui-button · token-inked readout + ui-tooltip)
  - [modal] div.modal-head — div.row (h2 "New application"/"Edit application" + [edit] explainer-link "View application") + btn-ghost close (Icon close, aria-label "Close"; onCancel) -> ui-dialog headline + text ui-button + close ui-icon-button
  - div: asPage -> .plan-body.community-edit-body / modal -> .modal-body — the scroll body
    - div: asPage -> .plan-main / modal -> (unclassed wrapper div — absorbed: pure grouping) — the SINGLE-COLUMN FORM STACK, sections in order (SectionLabel = div.cm-section-label; Designed = label.login-field {span.lbl + div.designed-select > select}, or bare div.designed-select when inline; plain fields = label.login-field {span.lbl + input/textarea}):
      - cm-section-label "Project overview" · login-field "Project name" (autoFocus) -> ui-text-field · div.cm-row.cm-row-2 (Designed "Engagement type" + Designed "Stage") -> ui-select ×2 · [conditional: Corporate Giving] Designed "Giving mode" -> ui-select · login-field "One-line summary" -> ui-text-field
      - cm-section-label "Applicant & sponsor" · cm-row-2 (Designed "Submitter" [cascades submitterRole] + login-field "Submitter role") · login-field "Date submitted" (date) · login-field "Stakeholder / Organization Targeted" > Designed inline select -> ui-select/ui-text-field per field
      - cm-section-label "The ask" · cm-row-3 (Designed "Support requested" + login-field "Amount" number + Designed "Unit") · cm-row-3 (Designed "Recurrence" + login-field "Years" number min 1 + login-field "Decision deadline" date) · login-field "Timeline"
      - cm-section-label "Description & rationale" · login-field "Description" (lbl carries span.cm-charcount "{len}/1500"; textarea.cm-textarea rows 4 maxLength 1500) · login-field "Why this, why now" (cm-charcount "{len}/500"; rows 2 maxLength 500) -> the MULTILINE + COUNTER gap component ×2
      - cm-section-label "Beneficiary & relationships" · login-field "Recipient organization or cause" · login-field "Connected stakeholders" (muted 11px helper + StakeholderPicker, TREE 3a)
      - cm-section-label "Strategic alignment" · cm-row-2 (ScoreSlider ×2 — each a login-field: lbl + mono current value + input type=range .cm-range) -> ui-slider ×2 · div.cm-valuescore (span.comm-meta-k "Value score" + comm-value-bar flex 1 + mono 12 "{vs}/10") -> ui-progress + tnum text · login-field "Issues" (IssueSelector) · cm-row-2 (login-field "Markets" + "Regions", each a ChipMultiSelect: div.cm-chip-select of button.filter-chip toggles, +.on; Regions empty-state "Pick a market first") -> ui-chip (filter variant) sets · cm-row-3 (login-field "Site" designed-select [cascades state] + "State" designed-select + "Geography" designed-select) -> ui-select ×3
      - cm-section-label "Resources & budget" · cm-row-3 ("Total project cost" + "Requested amount" + "Approved amount", numbers) · [conditional: stage Approved/Active/Complete] cm-row-2 ("Date approved" date + muted helper) · cm-row-2 ("Other funding / partners" number + "In-kind contributions" text)
      - cm-section-label "Risk & compliance" · login-field "Reputational / political risk" · login-field "Legal & disclosure considerations" · div.cm-attest-row (label.cm-check {checkbox + span.cm-check-box + "Conflict of interest disclosed"} + [conditional: checked] login-field marginLeft 26 "Describe the conflict" textarea rows 2 + label.cm-check {checkbox + "I attest this information is accurate"}) -> ui-checkbox ×2 + conditional multiline gap component
      - cm-section-label "Owners" · MultiOwnerPicker size 26 -> owners picker composition
  - [modal variant only] div.modal-foot — [conditional: !valid] span.modal-missing "{N} field{s} left: {first 3}…" (full list in title) + button.btn "Cancel" + button.btn.btn-primary "Save application"/"Create application" (disabled !valid) -> ui-dialog footer (token-inked readout + ui-button + filled ui-button)
- [STATE SWAP: viewMode && isEdit] the whole editor is REPLACED by CommunityProfile (TREE 4) with onEdit flipping back to the form

TREE 3a — StakeholderPicker (Connected-stakeholders typeahead multi-select):
- div.sh-picker (ref; document-mousedown outside-close) -> ui-autocomplete (multi, chips)
  - div.sh-picker-chips — chosen .tag chips (name + trailing "×" span; click removes; title "Remove") + the query input (onChange opens; onFocus opens; placeholder "Link stakeholders…" only when no chips)
  - [conditional: open && matches] div.sh-picker-menu — button.sh-picker-row × up-to-8 (onMouseDown preventDefault -> append id + clear query; name 500/12.5px + muted 11px "{org} · {type}") -> two-line option rows

TREE 4 — COMMUNITY PROFILE (CommunityProfile, read-only; ONE content stack in TWO shells):
- CONTENT (shared by both shells, in order):
  - div.comm-card-badges (marginBottom 4) — KindBadge + [conditional] givingMode tag + spacer + stage text -> ui-chip + token-inked stage text
  - [conditional: summary] p.comm-card-summary
  - div.cm-section-label "Overview" + Row ×: "Recipient" (always) · [conditional: target resolves] "Targets" (StakeholderPills, clickable — TREE 4a) · "Submitter" (+ " · {submitterRole}") · "Submitted" — Row = div.detail-row {div.k + div.v} -> ui-list two-column key/value rows
  - div.cm-section-label "The ask" + Row ×4 (always): "Support" · "Amount" (+ muted recurrence/years) · "Approved" (tone-colored) · "Timeline" (+ " · decide by {deadline}" when set)
  - [conditional: description] cm-section-label "Description" + p.comm-card-summary
  - [conditional: rationale] cm-section-label "Why this, why now" + p.comm-card-summary
  - div.cm-section-label "Alignment" + div.cm-valuescore (key "Value" + comm-value-bar flex 1 + mono "{vs}/10") — UNCONDITIONAL -> ui-progress row; then conditional Rows: "Issues" (Tags) · "Markets" · "Regions" · "Stakeholders" (StakeholderPills, clickable)
  - div.cm-section-label "Budget" + Rows: "Total cost" (always) · "Requested" (always) · [conditional] "Other funding" · [conditional] "In-kind"
  - div.cm-section-label "Owners" + OwnersDisplay (24) -> ui-avatar stack
- AS-PAGE SHELL: div.sheet-wrap > div.sheet-toolbar (btn-ghost Icon chevron-left + "Community", title "All engagements", onBack · span app name 500 · spacer · [when onEdit] btn-primary Icon edit + "Edit engagement") + div.plan-review-body > div.plan-review-doc > CONTENT -> ui-app-bar + white document column
- MODAL SHELL: div.modal-veil.show (click -> onClose) + div.modal.community-modal.profile-modal > div.modal-head (div.row: [when onBack] btn-ghost chevron-left title "Back" + h2 app name; div.row: [when onEdit] explainer-link "Edit application" + btn-ghost close aria-label "Close") + div.modal-body > CONTENT -> ui-dialog (scrim + headline + text ui-button + close ui-icon-button)

TREE 4a — StakeholderPills:
- span inline-flex wrap — span.tag (+.tag-clickable + onClick ONLY when onOpen passed) per stakeholder, text displayName||name -> ui-chip (assist; interactive when the bridge handler is wired, plain otherwise)

ABSORBED / DEAD REGIONS (every remaining className accounted for): CommunityView's local search/kindFilter/stageFilter state + toggle() helper + the unused "filtered" memo carry NO rendered regions and NO wired handlers (the DEAD CODE note above). KindBadge is the .tag pill leaf component already mapped. StageBadge is DEAD CODE — defined (a STAGE_COLORS-tinted .tag pill) but NEVER RENDERED anywhere repo-wide; stage always renders as .comm-stage-text fg-colored text, no pill — DO NOT REPLICATE a stage pill from its existence. The modal-body's unclassed inner div (non-asPage) is pure grouping — absorbed. LandingView's onNew/newLabel props are DEAD in landing.jsx (destructured, never rendered) — the "New application" affordance actually comes from the APP SHELL's add control via the addNonce/addNonceFor effect (addNonceFor === "community" -> setNewOpen(true)); newLabel "New application" never appears on screen in the oracle. There is NO delete affordance anywhere in the module set (no delete handler exists; applications can only be Declined by stage).

================================================================
UX HANDLER CENSUS (module set: archive/src/community.jsx + community-modal.jsx — every event handler, grep-verified: community.jsx 12 onClick; community-modal.jsx 10 onClick + 42 onChange + 1 onFocus + 1 onMouseDown; = 66 JSX handler attributes + 1 document-level listener = 67 HANDLERS, all reachable). Enumerated with exact behavior:

CARD (5): (1) name click -> onOpen = setViewId (read-only profile; title "Open application"); (2) vote "for" click -> vote(id, "for") toggle (re-click clears; overwrites any other choice); (3) vote "against" click -> vote(id, "against") toggle; (4) "Review" link -> stopPropagation + onOpen; (5) "Edit" link -> stopPropagation + onEdit = setEditId + setEditViewFirst(false) (form mode).

PROFILE — AS-PAGE (2): (6) back "Community" -> onBack = setViewId(null) (returns to the landing); (7) "Edit engagement" -> onEdit = close profile + setEditId (opens the editor).

PROFILE — MODAL SHELL (4, live when CommunityProfile renders as a modal, e.g. via the view/edit flip in modal context): (8) veil click -> onClose; (9) back chevron -> onBack (only when passed); (10) "Edit application" -> onEdit; (11) close button -> onClose. [Veil-click dismissal was implicit before — now explicit.]

STAKEHOLDER PILLS (1): (12) pill click -> onOpen(s.id) — the COMMUNITY -> STAKEHOLDER BRIDGE (closes the profile or discards the editor draft and opens the StakeholderProfile overlay; wired ONLY when a handler is passed).

EDITOR CHROME (8): (13) [modal] veil click -> onCancel (dismisses; draft discarded, no confirm); (14) [asPage] "‹ All community" -> onCancel; (15) [asPage] "View application" -> setViewMode(true) (flip to read-only profile); (16) [asPage] Save/Create -> onSubmit(d) (disabled until valid; hands the draft to the page upsert — see PAGE UPSERT quirk); (17) [modal] "View application" -> setViewMode(true); (18) [modal] head close -> onCancel; (19) [modal foot] "Cancel" -> onCancel; (20) [modal foot] Save/Create -> onSubmit(d). [That is 8 listed as (13)–(20); the two Save paths and two View-application buttons are distinct attributes in the two chrome variants.]

FORM FIELDS — native onChange (33): (21) Project name; (22) kind select; (23) stage select; (24) givingMode select; (25) One-line summary; (26) Submitter select (CASCADES submitterRole to the picked user's title); (27) Submitter role; (28) Date submitted; (29) Stakeholder/Organization Targeted select; (30) askType select; (31) Amount (Number-coerced); (32) Unit select; (33) Recurrence select; (34) Years (Number); (35) Decision deadline; (36) Timeline; (37) Description (counter live); (38) Rationale (counter live); (39) Recipient; (40) Site select (CASCADES state from the site); (41) State select; (42) Geography select; (43) budget.total; (44) budget.requested; (45) approvedAmount; (46) dateApproved; (47) budget.otherFunding; (48) budget.inKind; (49) conflictOfInterest checkbox (reveals the conflict textarea); (50) conflictDetail textarea; (51) attestation checkbox; (52) risk.reputational; (53) risk.legal. Plus inside leaf components: (54) ScoreSlider range input onChange -> Number (serves both sliders).

FORM FIELDS — component-callback onChange wirings (7): (55) StakeholderPicker -> set linkedStakeholders; (56) licenseToOperate ScoreSlider; (57) relationshipImpact ScoreSlider; (58) IssueSelector -> set issues; (59) Markets ChipMultiSelect -> set markets; (60) Regions ChipMultiSelect -> set regions; (61) MultiOwnerPicker -> set owners.

STAKEHOLDERPICKER INTERNALS (4): (62) chosen-chip click -> remove that id (title "Remove"); (63) query input onChange -> set query + open menu; (64) input onFocus -> open menu; (65) option row onMouseDown (preventDefault, keeps input focus) -> append id + clear query; plus (66) the document mousedown listener -> close the menu on any outside click.

CHIPMULTISELECT INTERNAL (1): (67) filter-chip click -> toggle the value in/out of the selected array (used by both Markets and Regions).

NON-HANDLER REACTIVE TRIGGERS (2 effects, captured for completeness): addNonceFor === "community" && addNonce -> setNewOpen(true) (the app-shell "+" control is the real New-application affordance — LandingView's onNew/newLabel are dead props); window.__pendingCommunityId -> setViewId (the DEEP-LINK BRIDGE above). [The landing shell's own handlers — search input, Filter/Sort buttons + popover onMouseLeave closes + Clear-alls, "See all" toggle, table-row click -> setViewId — live in the SHARED landing.jsx (1 onChange + 6 onClick + 2 onMouseLeave) plus FilterSection/SortFieldList in components.jsx, censused with that shared shell, not double-counted here.]

COUNT: 67 handlers (66 JSX attributes + 1 document listener), all accounted and all reachable — every one already covered by or now added to this box. No handler silently dropped. CORRECTIONS SURFACED BY THE CENSUS (additive; nothing above is disproved): (a) veil-click dismissal on BOTH modal shells (profile onClose / editor onCancel — the editor veil discards the draft with no confirm, consistent with the bridge's discard behavior) is now explicit; (b) LandingView never renders onNew/newLabel — creation is app-shell-driven via addNonce; (c) there is NO delete handler anywhere in the module set — an application can never be deleted from the oracle UI, only staged to Declined; the rebuild decides a real delete affordance with the user rather than inventing one.` },
                                          { t: "Workspaces — the team's working surface (segment/BU scope, workHQ, Setup sub-page, roles)", done: true, d:
`WORKSPACES (the Setup sub-page) — the team's working surface. A workspace pairs a SEGMENT with a BUSINESS UNIT and owns a set of assigned stakeholders. Component SetupView(props). Wrapper "setup-wrap"; a toolbar is portaled into explainerSlot (the app's header explainer region); the body is a scroll of segment-grouped workspace cards; a footer; plus a create modal, an edit modal, and a delete-confirm dialog.

=== SEGMAP (segment source — DO NOT hardcode) ===
SetupView receives a companySegments PROP from the app shell: app.jsx derives companySegments = (cfg.segments && Object.keys(cfg.segments).length) ? cfg.segments : D.SEGMENTS — i.e. the Settings-configured segment → business-unit map (appConfig.segments, edited on the Settings Segments pane) with the seed catalog as fallback — and passes it to SetupView. Inside SetupView: SEGMAP = (companySegments && Object.keys(companySegments).length) ? companySegments : D.SEGMENTS. Every "SEGMAP" reference below means THIS derived map. SEGMAP drives (a) the Segments filter options = Object.keys(SEGMAP), (b) the segment-group ordering of the body, and (c) is passed to WorkspaceModal as the segMap prop (where the modal re-applies the same fallback as SEG). A rebuild that hardcodes D.SEGMENTS here severs the Setup page from the Settings-configured segment structure — the prop chain is load-bearing.

=== WORKSPACE RECORD (full field set) ===
A workspace object has:
  • name (string)
  • segment (string; one of the company segments)
  • businessUnit (string; one of the chosen segment's units)
  • scope (string; "" | "National" | "State") — PREVIOUSLY MISSING from the guide. Optional scope of the workspace.
  • scopeState (string; a US state name, ONLY meaningful when scope==="State", else "")
  • owners (array of user ids)
  • createdAt (string, date-only "YYYY-MM-DD" via new Date().toISOString().slice(0,10))
  • createdBy (user id of the creator)
Markets and regions are NOT stored on the record — they are DERIVED (see below).

=== BLANK-CREATE DEFAULTS (WorkspaceModal blank) ===
When the create modal opens, draft = {
  name: "",
  segment: "Corporate Functions",
  businessUnit: "Legal / GA&PP",
  scope: "",
  scopeState: "",
  owners: currentUser ? [currentUser.id] : [],   // creator pre-owns
  createdAt: new Date().toISOString().slice(0,10),  // today, date-only
  createdBy: currentUser?.id
}.
Validity: valid = draft.name.trim().length > 0 AND draft.owners.length > 0 (name non-empty AND at least one owner). The Create/Save button is disabled until valid.
Changing the SEGMENT select RESETS businessUnit to SEG[seg][0] (the first business unit of the newly chosen segment, or "" if none): onChange → setDraft({...d, segment: seg, businessUnit: (SEG[seg]||[])[0] || ""}).
Changing SCOPE: selecting any value sets scope; if the new value is not "State", scopeState is cleared.

=== WORKSPACE MODAL (create / edit) ===
WorkspaceModal(open, mode, ws, users, currentUser, onClose, onSave, segMap). SEG = (segMap with keys) || D.SEGMENTS; segments = Object.keys(SEG). (segMap is SetupView's SEGMAP — see the SEGMAP section above.) On open: draft = (mode==="edit" && ws) ? {...ws} : blank. Returns null when !open.
  STRUCTURE + SCRIM DISMISS: the modal renders as a fixed pair — first a backdrop div "modal-veil show", then the "modal workspace-modal" card on top. CLICKING THE VEIL (the backdrop/scrim) calls onClose: it dismisses the modal WITHOUT saving, exactly like the header close button and the footer Cancel. Three dismissal paths total (veil click · header close · Cancel), all discarding the draft; nothing persists until submit().
  Header: a SegmentBadge (small) of draft.segment + h2 "New workspace" / "Edit workspace"; close button (Icon "close").
  Body fields:
    - "Workspace name" — text input (autoFocus), placeholder "e.g. GA&PP - North America".
    - A 2-col grid: "Segment" select (options = segment names; onChange resets businessUnit as above) and "Business unit" select (options = bus = SEG[draft.segment] || []).
    - A 2-col grid: "Scope (optional)" select — options "None" (value ""), "National", "State". CONDITIONAL: only when draft.scope==="State", a "State" select appears in the 2nd column: placeholder "Select state…", options = D.US_STATES, each option value = the state name, label = D.STATE_ABBR[state] || state (shows the 2-letter abbrev).
    - "Owners" — helper "Add as many people as need ownership. They'll see this workspace in their open tabs." + a MultiOwnerPicker (shared component; size 28) bound to draft.owners.
    - A created-by line (muted 11.5px, above the footer rule). CREATE mode: "Created by {currentUser.name} on {formatCreated(draft.createdAt)}" (currentUser?.name in strong ink). EDIT mode: "Created by {users.find(u=>u.id===ws.createdBy)?.name || "-"} on {formatCreated(ws.createdAt)}" — the date runs through formatCreated in BOTH modes (NEVER the raw ISO "YYYY-MM-DD" string), and the creator name falls back to the literal "-" when no user in the directory matches ws.createdBy (deleted or unknown creator). The name renders strong, ink-2 colored, in both modes.
  Footer: Cancel; primary "Create workspace" / "Save changes" (disabled when !valid).
  submit(): edit mode → onSave({name, segment, businessUnit, scope, scopeState, owners}); create mode → onSave({...draft, name: draft.name.trim()}).
  → Canonical UI: ui-dialog with scrim-dismiss ENABLED (a click on the ui-dialog scrim closes without saving — this maps the oracle's veil-click onClose one-to-one), ui-text-field, ui-select (segment/business unit/scope/state), MultiOwnerPicker (shared primitive), ui-button.

=== DERIVATION (markets/regions/counts are COMPUTED, not stored) ===
marketsByWs (useMemo over stakeholderWorkspaces + stakeholders): for each [stakeholderId, list-of-wsIds] in stakeholderWorkspaces, look up the stakeholder; for each wsId in its list, accumulate m[wsId] = { markets:Set, regions:Set } adding st.market and st.region. So a workspace's markets/regions are the UNION of the market/region of every stakeholder assigned to it. NOT a stored field.
countByWs (useMemo over stakeholderWorkspaces): m[wsId] = number of stakeholders whose list includes wsId. Stakeholder-count per workspace, derived.
TOOLBAR FILTER OPTIONS: Markets filter options = Object.keys(D.MARKETS). Regions filter options = [...new Set(Object.values(D.MARKETS).flat())] (flattened unique regions across all markets). Segments filter options = Object.keys(SEGMAP) (the Settings-fed map, per the SEGMAP section — NOT hardcoded seed segments).
CORRECTION: there is NO sort control anywhere in Setup (remove any prior "+ sort" claim). Ordering is by segment group, then the workspaces' natural order.

=== TOOLBAR (portaled into explainerSlot) ===
A "sheet-toolbar" with:
  • Search box ("search": search Icon + input), placeholder "Search workspaces…", bound to the search state. Matches w.name OR w.businessUnit OR w.segment (each lowercased includes q).
  • Three filter buttons, each a "filter-button-wrap" with a toggle button + a "filter-popover" (width 240) of checkable options ("cat-opt", " on" when selected, each a check Icon + label):
      - "Segments" → segFilter[] (options = segment names). "Clear all" resets.
      - "Markets" → marketFilter[] (options = Object.keys(D.MARKETS)).
      - "Regions" → regionFilter[] (options = flattened unique regions).
    Opening one popover closes the others. MOUSE-LEAVE DISMISS: every one of the three "filter-popover" divs (Segments, Markets, Regions) carries onMouseLeave → set<X>Open(false) — the popover auto-closes the instant the pointer leaves its bounds, in addition to toggling via its button. Each popover head is "filter-pop-head" (a strong label + a ghost "Clear all" button, fontSize 11, resetting that filter to []). Each button shows a "filter-count" badge when its filter is non-empty and " filter-active" class.
  Filtering pipeline on visibleWorkspaces (after visibility): if segFilter.length keep w where segFilter.includes(w.segment); if marketFilter.length keep w where its derived markets intersect marketFilter; if regionFilter.length keep w where its derived regions intersect regionFilter; then the search filter.
  → Canonical UI: ui-text-field (search), ui-button + ui-menu/ui-sheet popovers with ui-checkbox/selectable list rows, ui-chip count badge. DISMISSAL MAP — EXPLICIT RETARGET: ui-menu's standard light-dismiss (click outside / Escape) REPLACES the oracle's mouse-leave auto-dismiss. This is an intentional behavior change, recorded here so it is a decision and not a loss: hover-out dismissal fights multi-select popovers (the pointer drifting one pixel past the edge closes the list mid-selection). If the build instead wants oracle fidelity, wire a pointerleave listener on the ui-menu surface to close it — but the default rebuild behavior is light-dismiss.

=== MEMBER VISIBILITY ===
isManager = currentUser?.role === "manager". memberWorkspaces = workspaces where (w.owners||[]).includes(currentUser.id). visibleWorkspaces = (isManager || showAll) ? ALL workspaces : memberWorkspaces. (Managers always see all.)
VERIFIED DEAD STATE — showAll: the oracle declares const [showAll, setShowAll] = useState(false) and the visibility expression reads it, but setShowAll is NEVER invoked anywhere in the file and NO toggle control renders in the UI. There is no way for a member to flip to seeing all workspaces; non-managers are permanently limited to the workspaces they co-own. DO-NOT-REPLICATE / MAKE-REAL: do not present a "show all" toggle as existing oracle behavior. At build, decide with the user: either wire a REAL show-all toggle control (and design where it lives), or drop the showAll state entirely and let the visibility rule be simply isManager ? all : memberWorkspaces.

=== DELETE (role-gated) ===
canDelete(ws): false if no currentUser; TRUE if currentUser.role==="manager"; ELSE ws.createdBy === currentUser.id. NOTE: a non-manager can delete ONLY workspaces THEY created (createdBy), NOT merely ones they co-own.
attemptDelete(wsId): if !canDelete → alert "Only the workspace creator or a manager can delete this workspace." and abort; else open the confirm dialog (confirmDeleteId).
ConfirmDialog (shared): title "Delete workspace?", body = "<strong>{name}</strong> ({segment} · {businessUnit}) will be removed." then muted "Stakeholders in this workspace will stay in the Master pool. This can't be undone." confirmLabel "Yes, delete", cancelLabel "Cancel", danger style. onConfirm → removeWorkspace(confirmDeleteId).
  → Canonical UI: ui-dialog (danger variant), ui-button danger; the blocked-attempt alert → a ui-snackbar in the rebuild.

=== BODY: segment-grouped cards ===
"setup-scroll" → "setup-section". If visibleWorkspaces is empty: "No workspaces match." For each segment in Object.keys(SEGMAP) order: wsInSeg = visibleWorkspaces filtered to that segment; skip if empty; render a "seg-group" with a head (SegmentBadge + "{n} workspace(s)") and a "ws-grid" of WorkspaceCards.

=== WorkspaceCard ANATOMY ===
WorkspaceCard(ws, isActive, count, markets, regions, onActivate, onDelete, onEdit, onUpdate, users, canDelete). Class "comm-card ws-card", clicking the card body = onActivate (activate this workspace: setActiveWorkspaceId(ws.id)).
  • Head: name (class "comm-card-name plan-card-title") — clicking the name (stopPropagation) → onEdit (open edit modal); title "Open / edit workspace". Subtitle "comm-card-recipient muted" = ws.businessUnit. Right side: a MultiOwnerPicker (shared) inline, owners=ws.owners, onChange → onUpdate({owners: next}) (edit owners directly on the card).
  • Badges row: a SegmentBadge (small) of ws.segment; a spacer; if isActive, a "comm-stage-text" reading "Active" colored var(--accent).
  • Markets row: "comm-card-linked" with key "Markets" and value = markets.join(", ") or "—" when empty.
  • Regions row: same, key "Regions", value = regions.join(", ") or "—".
  • Footer ("comm-card-foot"): "<strong mono>{count}</strong> stakeholders"; spacer; formatCreated(ws.createdAt) (mono, title "Date created"); and — ONLY if canDelete — a ghost delete button (Icon "close", stopPropagation) → onDelete.
  formatCreated(iso): if no iso "-"; parse via new Date(iso); if invalid return iso; else toLocaleDateString with { month:"short", day:"numeric", year:"numeric" }. KNOWN BUG — DO NOT REPLICATE (the same UTC-midnight off-by-one class formatDateLong guards against with its T00:00:00 local-midnight append): createdAt is always a bare date-only "YYYY-MM-DD" string (see the blank defaults), and new Date("YYYY-MM-DD") parses it as UTC MIDNIGHT — in any timezone west of UTC the rendered day is the PREVIOUS one (a workspace created "2026-06-23" displays "Jun 22, 2026" on the card footer and in the modal created-by lines; it shows "Jun 23, 2026" only at UTC or east of it). MAKE REAL at rebuild: parse date-only strings as LOCAL midnight (append "T00:00:00", exactly like formatDateLong) so the displayed day always matches the stored day.
  → Canonical UI: a ui-card; SegmentBadge / count / dates as ui-chip/labels; MultiOwnerPicker shared primitive; ui-icon-button for delete. count's mono font becomes a tabular-numerals token (no separate mono family per design law).

=== FOOTER ===
A "sheet-footer comm-footer": a grid Icon + "<strong>{workspaces.length}</strong> workspaces"; a "·"; then muted copy: "Workspaces pair a segment with a business unit. Assign stakeholders from the Master pool to any number of workspaces."

=== ASSIGNMENT MUTATION (map semantics canonical; the Setup function itself is DEAD CODE) ===
toggleAssignment(stakeholderId, wsId): cur = stakeholderWorkspaces[stakeholderId] || []; next = cur.includes(wsId) ? cur without wsId : [...cur, wsId]; setStakeholderWorkspaces({...stakeholderWorkspaces, [stakeholderId]: next}).
VERIFIED DEAD CODE — toggleAssignment is defined inside SetupView but NEVER called: no Setup control invokes it and it is not exported. There is NO stakeholder-assignment UI on the Setup page. DO-NOT-REPLICATE-AS-UI: a rebuilder must NOT invent a Setup-page assignment control from this function's existence.
What IS canonical (keep): the membership-map SEMANTICS — stakeholderWorkspaces is keyed stakeholder id → array of workspace ids; a toggle removes the wsId if present, appends it if absent; a stakeholder can belong to any number of workspaces. Setup only READS this map (marketsByWs and countByWs derive from it).
The LIVE mutation sites in the oracle are elsewhere and are captured in their own boxes (App shell, Lists, Plan):
  • app.jsx addStakeholder — on create, setStakeholderWorkspaces(prev => ({...prev, [id]: [ws]})) when a non-master workspace is active, else ({...prev, [id]: []}).
  • app.jsx stakeholder delete — cleanup removes the stakeholder's key from the map (delete n[id]).
  • app.jsx removeWorkspace — cleanup strips the deleted wsId from EVERY stakeholder's list (for each key, filter the array).
  • app.jsx row-level workspace assignment from the Lists flows (the shell's toggle handler passed into the table).
  • plan.jsx PlanEditor — adding a stakeholder to a plan appends p.workspaceId to that stakeholder's list: setStakeholderWorkspaces({ ...stakeholderWorkspaces, [id]: [ ...(stakeholderWorkspaces[id] || []), p.workspaceId ] }).

=== SegmentBadge (color spec — FLAG → tokens) ===
SegmentBadge(segment, small). Per-segment {bg, fg}, fallback = "Corporate Functions":
  "Personal Systems":      bg #D9DEE8, fg #2E3F66
  "Printing":              bg #E5D6DC, fg #682E45
  "Corporate Investments": bg #D6E2D2, fg #2F5A26
  "Corporate Functions":   bg #EAE0CB, fg #6E5419   (also the fallback for any unknown segment)
  Style: padding small "1px 6px" else "2px 8px"; borderRadius 4; fontSize small 9.5px else 10px; textTransform uppercase; letterSpacing 0.06em; fontWeight 600; inline-block; whiteSpace nowrap.
  FLAG → tokens: these segment colors should be single-sourced as tokens in the rebuild (akin to the zone tokens), not inline literals. → a ui-chip variant driven by segment token.

=== GeographyChip (color spec — FLAG → tokens) ===
GeographyChip(value). Per-value {bg, fg}, fallback "National (all)":
  "National (all)": bg #E2DFD7, fg #3A3528
  "Federal":        bg #D5DCEA, fg #2A3E66
  "State":          bg #E2D9E8, fg #4F2D6E
  "Local":          bg #DDE7D2, fg #34571F
  Style: padding "2px 7px"; borderRadius 4; fontSize 10; letterSpacing 0.04em; fontWeight 600; inline-block.
  FLAG → tokens. → ui-chip variant.

=== workHQ (intel.jsx) ===
The team's working HQ surface lives in intel.jsx; its full capture is its own box (scope with the user). Here note only that Workspaces is the team's working surface that workHQ complements.

CANONICAL UI: all of the above maps to ui-* components (ui-card, ui-dialog, ui-text-field, ui-select, ui-button, ui-icon-button, ui-chip, ui-menu/ui-sheet, ui-snackbar). NEVER md-*/shadcn. Segment/Geography color literals → tokens. Shared primitives (MultiOwnerPicker, ConfirmDialog, Avatar) are specified in the shared-primitives box; referenced here by name only.

=== SKELETON TREE (Setup — the literal region tree from archive/src/setup.jsx; the build assembles against THIS tree, never prose) ===
Legend: each node = className/element — what it contains — Canonical UI mapping. "layout row/column — token-only container" = a pure-layout region (spacing from tokens, no visual decision, absorbed into the parent component's slot where noted).

TREE 1 — THE SETUP PAGE (SetupView render root):
div.setup-wrap — page root inside the app shell's main slot — layout column, token-only container
  PORTAL (ReactDOM.createPortal into explainerSlot, rendered only when explainerSlot exists): div.sheet-toolbar — the toolbar mounts INSIDE the app shell's explainer region, NOT inside setup-wrap's own box — page-scaffold toolbar slot (ui-app-bar secondary row)
    div.search — search Icon + input (placeholder "Search workspaces…") — ui-text-field with leading ui-icon "search"
    div.filter-button-wrap x3 (in order: Segments · Markets · Regions), each:
      button.btn (+.filter-active when its filter is non-empty) — label + conditional span.filter-count badge — ui-button (text/outlined) with count badge (ui-chip/count token)
      div.filter-popover (conditional; width 240; onMouseLeave closes) — ui-menu surface (light-dismiss per the DISMISSAL MAP retarget above)
        div.filter-pop-head — strong label + button.btn.btn-ghost "Clear all" (fontSize 11) — menu header row: token-inked label + ui-button (text)
        div.filter-pop-body — layout column — token-only container
          div.cat-opt-list — the option list — ui-menu selectable items
            button.cat-opt (+.on when selected) x N — Icon "check" (class "ico cat-check") + span label — selectable ui-menu item with leading check ui-icon
    div.spacer (flex 1) — pure flex filler — absorbed by the toolbar's flex layout (no component)
  div.setup-scroll — the scrolling body — layout column with overflow scroll, token-only container
    div.setup-section — section stack — token-only container
      div.comm-empty.muted (conditional, only when visibleWorkspaces is empty) — "No workspaces match." — token-inked empty-state text
      div.seg-group x (one per segment in Object.keys(SEGMAP) order that has matching workspaces), each:
        div.seg-group-head — SegmentBadge + muted count span (fontSize 11.5, "{n} workspace(s)") — ui-chip (segment-token variant) + token-inked label
        div.ws-grid — the card grid — layout grid, token-only container
          WorkspaceCard x N — TREE 2
  div.sheet-footer.comm-footer — ui-status-bar
    div.group — Icon "grid" + strong (color var(--ink)) workspaces.length + " workspaces" — status-bar cell: ui-icon + tnum text
    div.group — the literal "·" — status-bar divider cell
    div.group.muted (flex 1) — the explainer sentence ("Workspaces pair a segment…") — status-bar text cell
  WorkspaceModal (mode "create", open=createOpen) — TREE 3
  WorkspaceModal (mode "edit", open when editingWs resolves) — TREE 3
  ConfirmDialog (shared primitive; open when confirmDeleteId is set) — ui-dialog (danger variant); its internal tree is owned by the shared-primitives box

TREE 2 — WorkspaceCard:
div.comm-card.ws-card (cursor pointer; whole-card onClick = onActivate) — composed card in the domain-component layer on --ui-sys-surface-card, never loose divs
  div.comm-card-head — layout row — absorbed into the card's header slot
    div (style minWidth 0, flex 1) — name/subtitle column — layout column, token-only container
      span.comm-card-name.plan-card-title — ws.name; onClick (stopPropagation) = onEdit; title "Open / edit workspace" — clickable token-inked text control wrapped in ui-tooltip
      div.comm-card-recipient.muted — ws.businessUnit — token-inked muted text
    MultiOwnerPicker — shared primitive (ui-avatar stack + add affordance); onChange → onUpdate({ owners })
  div.comm-card-badges — layout row — token-only container
    SegmentBadge (small) — ui-chip (segment-token variant, non-interactive)
    span.spacer (flex 1) — flex filler — absorbed
    span.comm-stage-text (conditional, only when isActive) — "Active", color var(--accent) — token-inked accent text
  div.comm-card-linked (Markets) — span.comm-meta-k "Markets" + span.comm-linked-names (markets.join(", ") or "—") — ui-list two-column key/value row
  div.comm-card-linked (Regions) — same shape, key "Regions" — ui-list two-column key/value row
  div.comm-card-foot — layout row — token-only container
    span.muted (fontSize 11.5) — strong (ink, mono family in oracle) count + " stakeholders" — token-inked text, count in tnum numerals (the mono family does NOT survive; type law)
    span.spacer (flex 1) — flex filler — absorbed
    span.muted (fontSize 11, mono in oracle; title "Date created") — formatCreated(ws.createdAt) — token-inked tnum text wrapped in ui-tooltip
    button.btn.btn-ghost (conditional, only when canDelete; onClick stopPropagation → onDelete; aria-label "Delete", title "Delete workspace", marginLeft 4) — Icon "close" — ui-icon-button

TREE 3 — WorkspaceModal (create/edit; returns null when !open):
Fragment
  div.modal-veil.show — backdrop scrim; onClick = onClose — ui-dialog scrim (scrim-dismiss ENABLED, per the modal section above)
  div.modal.workspace-modal — ui-dialog
    div.modal-head — headline row — dialog headline slot
      div.row (gap 10) — SegmentBadge (small, tracks live draft.segment) + h2 ("New workspace" / "Edit workspace") — ui-chip + dialog headline text
      button.btn.btn-ghost (aria-label "Close") — Icon "close" — ui-icon-button
    div.modal-body — the field stack — dialog content slot
      label.login-field — span.lbl "Workspace name" + input (autoFocus; placeholder "e.g. GA&PP - North America") — ui-text-field
      div (grid, gridTemplateColumns 1fr 1fr, gap 12) — layout row — token-only container
        label.login-field — span.lbl "Segment" + div.designed-select > select — ui-select
        label.login-field — span.lbl "Business unit" + div.designed-select > select — ui-select
      div (grid 1fr 1fr, gap 12) — layout row — token-only container
        label.login-field — span.lbl "Scope (optional)" + div.designed-select > select — ui-select
        label.login-field (CONDITIONAL, only when draft.scope === "State") — span.lbl "State" + div.designed-select > select — ui-select
      div.login-field — span.lbl "Owners" + muted helper span (fontSize 11) + MultiOwnerPicker (size 28) — field label + helper + shared primitive
      div (conditional; one variant per mode) — the muted created-by line (fontSize 11.5, paddingTop 4, borderTop 1px var(--rule-2), marginTop 4) — token-inked footnote above the action row (the borderTop → ui-divider or the dialog's rule token)
    div.modal-foot — button.btn "Cancel" + button.btn.btn-primary ("Create workspace"/"Save changes", disabled when !valid) — dialog action slot, 2x ui-button

CLASSNAME ACCOUNTING: every className region in setup.jsx appears above (setup-wrap, sheet-toolbar, search, filter-button-wrap, btn, filter-active, filter-count, filter-popover, filter-pop-head, btn-ghost, filter-pop-body, cat-opt-list, cat-opt, on, ico, cat-check, spacer, setup-scroll, setup-section, comm-empty, muted, seg-group, seg-group-head, ws-grid, sheet-footer, comm-footer, group, comm-card, ws-card, comm-card-head, comm-card-name, plan-card-title, comm-card-recipient, comm-card-badges, comm-stage-text, comm-card-linked, comm-meta-k, comm-linked-names, comm-card-foot, modal-veil, show, modal, workspace-modal, modal-head, row, modal-body, login-field, lbl, designed-select, modal-foot, btn-primary). SegmentBadge and GeographyChip render style-only spans with NO className (inline-styled pills → ui-chip token variants per their sections above). None silently dropped.

=== UX HANDLER CENSUS (archive/src/setup.jsx — every event handler in the module) ===
DOM-level JSX handlers, 25 total:
Toolbar (13): 1 search input onChange (sets search state) · 2 Segments toggle onClick (flips segOpen; closes marketOpen + regionOpen) · 3 Segments popover onMouseLeave (closes it) · 4 Segments "Clear all" onClick (segFilter = []) · 5 Segments cat-opt onClick (toggleSeg — add/remove that segment) · 6 Markets toggle onClick (flips marketOpen; closes the other two) · 7 Markets popover onMouseLeave · 8 Markets "Clear all" onClick · 9 Markets cat-opt onClick (toggleMarket) · 10 Regions toggle onClick (flips regionOpen; closes the other two) · 11 Regions popover onMouseLeave · 12 Regions "Clear all" onClick · 13 Regions cat-opt onClick (toggleRegion).
WorkspaceCard (3): 14 card root onClick → onActivate (setActiveWorkspaceId(ws.id)) · 15 name span onClick (e.stopPropagation) → onEdit (setEditWorkspaceId(ws.id)) · 16 delete ghost button onClick (e.stopPropagation) → onDelete (attemptDelete(ws.id)).
WorkspaceModal (9): 17 veil onClick → onClose (scrim dismiss) · 18 head close onClick → onClose · 19 name input onChange · 20 Segment select onChange (resets businessUnit to the new segment's first unit) · 21 Business-unit select onChange · 22 Scope select onChange (clears scopeState unless the new value is "State") · 23 State select onChange · 24 footer "Cancel" onClick → onClose · 25 primary onClick → submit() (guarded by valid; the button also carries disabled=!valid).
Shared-primitive callback props wired in this module (4 — their internal DOM handlers live in users.jsx and are censused in the shared-primitives box): MultiOwnerPicker onChange on the card (→ onUpdate({ owners: next })) and in the modal (→ setDraft owners); ConfirmDialog onConfirm (→ removeWorkspace(confirmDeleteId); setConfirmDeleteId(null)) and onCancel (→ setConfirmDeleteId(null)).
Non-JSX interaction: attemptDelete's blocked-path alert("Only the workspace creator or a manager can delete this workspace.") fires inside handler 16's chain when !canDelete (→ ui-snackbar at rebuild, per the Delete section). WorkspaceModal's useEffect (re-seed draft on open) is state plumbing, not a handler.
25 DOM handlers + 4 shared-primitive callback props = 29 interaction bindings. ALL accounted — every one is described in the sections above; the tree confirms the box with NO corrections (the dead showAll state and dead toggleAssignment findings stand; no sort control exists, as already corrected).` },
                                    { t: "App shell & routing — the top-level frame (nav, tabs, login gate, command bridge, explainer bars)", done: true, d:
`THE TOP-LEVEL WIRING [CODE — archive/src/app.jsx]. This is the frame every screen renders inside: the auth gate, brand bar, fixed nav-tab row, the per-view content switch, the bottom workspace-tab strip, the detail drawer, and all the global bridges (command palette, @-mentions, keyboard). Captured here exhaustively so a cold rebuild reconstructs the shell with the old file gone. CANONICAL UI mapping is stated per element (ui-app-shell / ui-app-bar / ui-tabs / ui-sidebar / ui-sheet / ui-dialog / ui-icon — NEVER md-*/shadcn).

══ AUTH GATE & SESSION ══
The top component is App(). It holds currentUser in React state, initialized from localStorage: JSON.parse(localStorage.getItem("hp_map_user") || "null"). If (!currentUser) the WHOLE app renders only LoginView (onLogin=logIn) — nothing else mounts. Once a user exists it renders AppLoggedIn with the full shell.
• Persistence key is the literal string hp_map_user (per-device/per-tab session; NOT broadcast across tabs — see Persistence box).
• logIn(u): sets currentUser, writes localStorage.setItem("hp_map_user", JSON.stringify(promoted)), and upserts the user into the shared users directory (if present, map their entry; else append).
• logOut(): setCurrentUser(null) + localStorage.removeItem("hp_map_user").
• SESSION RECONCILE: an effect keyed on the users directory finds the dir entry with id === currentUser.id; if it differs (JSON.stringify mismatch) it replaces currentUser with the directory copy and rewrites hp_map_user. The shared users directory is the source of truth for identity/appearance; this fixes drift where a persisted session name/color diverged from the directory row.

⚠️ TRAP — DEMO AUTO-MANAGER (REMOVE AT REBUILD). In THREE places the demo force-promotes the user to manager so they can see Settings:
  (a) on stored-user load: if (u && u.role !== "manager") u.role = "manager";
  (b) in logIn: const promoted = { ...u, role: "manager" }; and the directory upsert sets role:"manager".
At rebuild this auto-promote is DELETED — roles come from real auth/the users table (manager/member/system), never from the act of logging in. (Mirrors Persistence TRAP #2.)

══ ROOT ERROR BOUNDARY (top of the render tree) ══
The original app mounts as RootErrorBoundary wrapping App (project/app.jsx and archive/src/app.jsx both define it) — a top-level React class error boundary: constructor sets state { error: null }; static getDerivedStateFromError(error) returns { error }. On ANY render throw anywhere in the tree it replaces the ENTIRE UI with a full-page diagnostic instead of a white screen: a bold heading with the EXACT copy "Something threw while rendering:" followed by String(error.stack || error) rendered with whiteSpace pre-wrap. Oracle styling (inline): padding 24, fontFamily monospace, fontSize 13, color #7a2424, background #FAF8F2, height 100vh, overflow auto (the full stack is scrollable). REBUILD RULING NEEDED: the boundary MECHANISM is kept (a top-level error boundary + the heading copy + the full stack shown pre-wrapped and scrollable — the app must never white-screen), but the oracle's inline monospace/red presentation cannot ship as-is: the type law ships NO mono family and inline styling is forbidden. Re-express the diagnostic page via tokens (Inter, token error/surface colors) as a deliberate design decision with the user — or record an explicit replace/drop ruling. Never silently omit the boundary.

══ appConfig → COMPANY CATALOG OVERRIDE WIRING (Settings feeds every dropdown) ══
AppLoggedIn owns appConfig via usePersistentState("appConfig", { appName: "Stakeholdr", accent: "#024AD8", brand: "#000000", fiscalStartMonth: 11 /* Nov */, fiscalStartDay: 1 }); updateAppConfig(patch) shallow-merges. From cfg = appConfig || {} it derives EIGHT company* catalogs, each with the SAME fallback predicate — use the configured value only when it is present AND non-empty, else the data.js seed:
  companyIssues     = cfg.issues && cfg.issues.length ? cfg.issues : (D.ISSUES || [])
  companyTags       = cfg.tags && cfg.tags.length ? cfg.tags : (D.TAGS || [])
  companyFunctions  = cfg.functions && cfg.functions.length ? cfg.functions : (D.FUNCTIONS || [])
  companySegments   = (cfg.segments && Object.keys(cfg.segments).length) ? cfg.segments : D.SEGMENTS       (object map — "non-empty" = at least one key)
  companyMarkets    = (cfg.markets && Object.keys(cfg.markets).length) ? cfg.markets : D.MARKETS           (object map)
  companyCategories = (cfg.categories && Object.keys(cfg.categories).length) ? cfg.categories : D.CATEGORIES (object map)
  companySites      = (cfg.sites && cfg.sites.length) ? cfg.sites : (D.SITES || [])
  companyGoals      = (cfg.orgGoals && cfg.orgGoals.length) ? cfg.orgGoals : (D.ORG_GOALS || [])
THEN the oracle GLOBALLY MUTATES the shared module-level catalog object so every D.*-reading surface sees the manager-configured lists: D.CATEGORIES = companyCategories; D.SEGMENTS = companySegments; D.MARKETS = companyMarkets; D.SITES = companySites; D.ORG_GOALS = companyGoals. This mutation is WHY the detail-drawer Category/Market selects, OpenWorkspaceModal's Object.keys(D.SEGMENTS), the Plan page's D.ORG_GOALS reads, and the palette's SITES all follow Settings instead of the static seeds. (companyIssues / companyTags / companyFunctions / companyGoals and friends are ALSO passed down explicitly as props to the views — the per-view prop chains are in the Workspaces and Settings boxes; both channels exist in the oracle.)
⚠️ DO-NOT-REPLICATE: at rebuild the derived config is passed down via context/props (ONE source), NEVER by mutating a module-level catalog object (the mutation is invisible, order-dependent, and breaks under module reload). But the OBSERVABLE CONTRACT is binding and this box is its capture: every dropdown, column, and picker that offers categories, segments/business units, markets/regions, sites, or org goals reads the Settings-configured lists with the exact present-AND-non-empty fallback above. A rebuild that binds those selects to the static seed catalogs has severed them from Settings and is WRONG.

══ LIVE THEMING + DOCUMENT TITLE (appConfig effect) ══
An effect keyed on [cfg.accent, cfg.brand, cfg.appName] does three things live (no reload):
• writes document.documentElement --accent = cfg.accent || "#024AD8";
• writes --brand = cfg.brand || "#000000" (at rebuild both write into the --ui-sys-* token layer — the accent/brand roles — with the same fallbacks; see the Settings box for the control surface);
• sets document.title = cfg.appName || "Stakeholdr" — the BROWSER-TAB TITLE follows the configured app name and updates whenever appName changes, with the literal fallback "Stakeholdr". This tab-title behavior must survive the rebuild.

══ NAV_TABS (the fixed top tab row) ══
NAV_TABS is an ordered array of { id, label, icon } (+ a hideWhenMaster flag on one). EXACT contents (icon = the old component ALIAS, not a ligature):
  { id: "sheet",     label: "Lists",     icon: "table" }
  { id: "scoring",   label: "Scoring",   icon: "sliders", hideWhenMaster: true }
  { id: "map",       label: "Map",       icon: "target" }
  { id: "plan",      label: "Plans",     icon: "plan" }
  { id: "community", label: "Community", icon: "community" }
  { id: "setup",     label: "Workspaces",icon: "work" }
  { id: "help",      label: "Help",      icon: "help" }
ICON ALIAS → MATERIAL SYMBOLS LIGATURE TABLE (from the oracle Icon map, components.jsx — the old strings are component ALIASES; a ui-icon takes the RIGHT-hand LIGATURE as its text content; writing the alias renders broken ligature text or the wrong glyph):
  table→table_rows (Lists nav tab AND the Master tab) · sliders→thumb_up (Scoring) · target→map (Map) · plan→description (Plans) · community→favorite (Community) · work→work (Workspaces) · help→help (Help)
  plus→add · message→chat · brandmark→id_card · double-left→keyboard_double_arrow_left · double-right→keyboard_double_arrow_right · chevron→expand_more (ws-selector caret) · chevronUp→expand_less · close→close and search→search (alias = ligature, unchanged)
So the Lists/Master glyph is table_rows (NOT "table" — that is a different Material Symbol), the create button is <ui-icon>add</ui-icon> (never "plus"), the messages button is <ui-icon>chat</ui-icon> (never "message"), the brand fallback is <ui-icon>id_card</ui-icon> (never "brandmark"). Render each nav icon as a ui-icon inside a ui-tabs tab.
• visibleNavTabs = NAV_TABS.filter(t => !(t.hideWhenMaster && isMaster)) — Scoring is HIDDEN whenever the active workspace is Master.
• REDIRECT: an effect — if (isMaster && activeView === "scoring") setActiveView("map") — kicks you to Map if you were on Scoring and switch to Master.
• The Scoring tab shows a count badge (class count count-alert) when unscoredCount > 0 (count of stakeholders with no score row from the current user's team-member id; exact formula + guards in the NAV-TABS RIGHT CLUSTER section below).
• Tabs build with ui-tabs; the active tab is activeView === t.id; clicking sets activeView. data-screen-label={t.label} is carried for screenshot tooling.

══ activeView STATE MACHINE ══
activeView (useState "sheet") selects the content region. Possible values: sheet | scoring | map | plan | community | setup | help | profile | settings | messages | record-sample. The content area renders exactly one view per value (switch in Row 3). Notable conditionals:
• sheet: split layout when NOT master (IntelPanel + SheetView side by side, class intel-split with data-mode=intelMode); plain SheetView when master.
• scoring: ScoringView (gets workspaceOwners + onDeleteWorkspace only when not master).
• map: MapView (read-only — see drag note below).
• plan/community/setup: each gets explainerSlot (the portal slot, below).
• profile: ProfilePage for users.find(id===profileUserId)||currentUser.
• settings: SettingsView, gated by currentUser.role === "manager".
• messages: full MessagingPage.
• record-sample: SampleRecord (dev scaffold).

══ paletteGo(kind, id) — universal routing ══
The one router used by the command palette, @-mentions, and profile links. Switch on kind:
• "stakeholder": setActiveWorkspaceId(MASTER_ID) → setActiveView("sheet") → setPendingShId(id). (pendingShId is consumed by SheetView to auto-open that row, then cleared via onConsumeOpen.)
• "plan": window.__pendingPlanId = id → setActiveView("plan"). (PlanView reads the global to auto-open.)
• "community": window.__pendingCommunityId = id → setActiveView("community").
• "workspace": openWorkspaceTab(id) (opens/activates that workspace tab).
• "user": setProfileUserId(id) → setActiveView("profile").
At rebuild these window.__pending* globals become real router params/state; recorded here as the exact handoff mechanism.

══ GLOBAL BRIDGES (window-level) ══
An effect (runs every render) installs two globals used by rich-text mention rendering everywhere:
• window.__mentionSources = () => ({ stakeholders, workspaces, plans, community }) — supplies the live entity lists to the mention autocomplete.
• window.__openMention = (type, id) => routes via paletteGo with TYPE CODES: "stk"→stakeholder · "wsp"→workspace · "pln"→plan · "cmy"→community.
  (Mention sigils in editors: @ stakeholders · / workspaces · # plans · $ community.)
A separate effect listens for the DOM event window "open-stakeholder-profile": its handler setScoringProfileShId(e.detail) opens the StakeholderModal (initialView=true, read view) for that stakeholder id — used by the Scoring screen to drill into a stakeholder. Cleaned up on unmount.

══ COMMAND PALETTE KEYBOARD HANDLER (cmd-K bridge) ══
A global keydown effect: if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); setPaletteOpen(true); }. Opens the universal CommandPalette. The palette UI itself is its OWN box; this box owns only the open-trigger. CommandPalette receives stakeholders, plans, community, workspaces, users, and onGo=paletteGo. Build the palette as a ui-dialog.

══ SHELL DROPDOWN DISMISS (click-outside closes every shell menu) ══
One document-level mousedown listener closes each open shell dropdown when the click lands OUTSIDE its container, tested with e.target.closest(selector) per menu:
• workspace-selector menu — container class ".ws-selector" → setWsMenuOpen(false)
• Dev scaffold menu — ".scaffold-selector" → setScaffoldMenuOpen(false)
• tab-strip add menu — ".ws-tab-add" → setAddMenuOpen(false)
• profile menu — ".profile-button" → setProfileMenuOpen(false)
(Oracle quirk, do not replicate: the effect's dependency array lists [wsMenuOpen, addMenuOpen, profileMenuOpen] and OMITS scaffoldMenuOpen.) At rebuild this interaction is the ui-menu component's NATIVE dismiss behavior — no hand-rolled document listener — but the contract stands: ANY mousedown outside an open shell menu closes it.

══ TAB-STRIP STATE MACHINE (bottom workspace tabs) ══
State:
• openWorkspaceIds — useState default [MASTER_ID, "ws-gapp-na", "ws-gapp-emea"] where MASTER_ID = "__master".
• activeWorkspaceId — useState default MASTER_ID.
• tabsExpanded — useState false (stacked vs spread).
Derived:
• isMaster = activeWorkspaceId === MASTER_ID.
• activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId).
• workspaceLabel = isMaster ? "Master · All stakeholders" : (activeWorkspace?.name || "-") — the literal master string is "Master · All stakeholders"; the "-" fallback covers a missing/deleted active-workspace record. workspaceLabel is passed to EVERY view header (Sheet, Scoring, Map, Community, Plans, IntelPanel) and is the BASE OF THE CSV EXPORT FILENAME (the Lists box's export references it) — it must exist in the shell with exactly this derivation.
• isStacked = openWorkspaceIds.length > 1 && !tabsExpanded — when collapsed AND more than Master open, the non-Master tabs are HIDDEN and only the Master tab renders (renderTab(MASTER_ID,0,true)); a fan toggle surfaces to expand. When expanded, ALL open tabs render.
• visibleStakeholders (useMemo): master → all stakeholders; else stakeholders whose stakeholderWorkspaces[s.id] includes activeWorkspaceId.
Actions:
• openWorkspaceTab(wsId): add wsId to openWorkspaceIds if absent → setActiveWorkspaceId(wsId) → setActiveView("sheet").
• activateWorkspaceTab(wsId): setActiveWorkspaceId + setActiveView("sheet") (no add).
• closeWorkspaceTab(wsId, e): e.stopPropagation; MASTER_ID is NEVER closable (early return). idx = openWorkspaceIds.indexOf(wsId); remaining = filter out wsId; setOpenWorkspaceIds(remaining); if it was active, ACTIVE-FALLBACK = remaining[Math.max(0, idx-1)] || MASTER_ID (the tab to its left, else Master) → setActiveView("sheet").
Tab rendering (renderTab):
• MASTER tab: ui-icon with ligature table_rows (old alias "table") + label "Master" + muted count "· {stakeholders.length}"; active when activeWorkspaceId===MASTER && activeView==="sheet"; title "Master pool - all stakeholders. Cannot be closed."
• WORKSPACE tab: a seg-dot colored by segmentColor(w.segment) (Personal Systems #2E3F66 · Printing #682E45 · Corporate Investments #2F5A26 · Corporate Functions #6E5419 · fallback #7A7164) + name + muted count "· {count}" (count = stakeholders whose stakeholderWorkspaces includes this ws) + a close button (ui-icon ligature close, calls closeWorkspaceTab).
Fan toggle: shown when openWorkspaceIds.length > 1; toggles tabsExpanded; ui-icon ligature keyboard_double_arrow_left when expanded (collapse; old alias "double-left"), keyboard_double_arrow_right when collapsed (expand; old alias "double-right"); titles "Collapse open workspaces" / "Expand to see open workspaces".
"Open workspace" button (ui-icon ligature add — old alias "plus" — + label) opens the OpenWorkspaceModal.
Tab-bar META (right-aligned): "Updated {formatDateLong(...)}" — COMPUTED. On Master: the MAX (latest) of all stakeholders' and workspaces' (updatedAt || createdAt), sorted, last one. On a workspace: that workspace's (updatedAt || createdAt). null → formatDateLong handles empty.
Build the strip with ui-tabs / ui-bottom-bar styling; tabs are real components, close = ui-icon-button.

══ OpenWorkspaceModal (the "Open a workspace" picker) ══
A modal (build as ui-dialog, width ~560). Header "Open a workspace" + close ui-icon-button. Body groups every workspace BY SEGMENT (segments = Object.keys(D.SEGMENTS) — via the config-override wiring above, these are the manager-configured segments); each group headed by a SegmentBadge (small); within, each workspace is a button row showing: name · "{businessUnit} · {count} stakeholder(s)" (count = stakeholders whose stakeholderWorkspaces includes w.id; singular/plural on count===1) · a CTA reading "Switch to" if the workspace is ALREADY in openWorkspaceIds, else "Open →" (is-open class on the row when open). onPick(w.id) → openWorkspaceTab + close. Footer: "Cancel" + a primary "Create new workspace" (ui-icon ligature add) that closes the modal, opens the new-workspace modal, and switches to the setup view.

══ BRAND BAR (Row 1) ══
Build with ui-app-bar. Left: brand mark (cfg.brandIcon image if set, else ui-icon ligature id_card — old alias "brandmark") + app name (cfg.appName || "Stakeholdr"); clicking brand goes Home (setActiveWorkspaceId MASTER + activeView sheet). Next: the WORKSPACE SELECTOR dropdown (ws-selector) — shows "All / Master" on master, else SegmentBadge + workspace name + businessUnit, ending in a caret ui-icon ligature expand_more (old alias "chevron", class ws-selector-caret); opens a menu listing every workspace (name + segment, openWorkspaceTab on click) ending with "+ New workspace…" (accent-colored; opens setup + new-ws modal). Right utility cluster: the "Saved · 1m ago" stub (below), a UserStack (max 3, opens UserListPopup), and the profile button (Avatar size 26 with ring) that toggles ProfileMenu.
PROFILE MENU — EXACT ORACLE LABELS + SHELL-SIDE WIRING. The items, in oracle order and with the oracle's exact copy: "View profile" (Icon "user" — the label is "View profile", NOT "Edit profile") · "Messages" (Icon "message") · "Settings" (Icon "build"; rendered ONLY when isManager = currentUser.role === "manager") · divider · "Log out" (Icon "logout"). The shell wires the four callbacks (each also closes the menu via setProfileMenuOpen(false)):
• onEditProfile → setProfileUserId(currentUser.id) + setActiveView("profile") — despite the prop's legacy name, "View profile" opens the current user's PROFILE PAGE (ProfilePage), NOT an edit dialog. The EditProfileModal opens only from ProfilePage's own "Edit profile" button — see the EDIT-PROFILE MODAL MOUNT section below. (The menu-item anatomy/title-split is captured in the Users & People box; the two captures must agree — the label is "View profile".)
• onMessages → setActiveView("messages") (the full Messages page).
• onSettings → setActiveView("settings") (manager-gated view).
• onLogOut → logOut (clears currentUser + removes hp_map_user; see AUTH GATE).
All of these dropdowns dismiss on outside mousedown per the SHELL DROPDOWN DISMISS section.

⚠️ "Saved · 1m ago" IS A HARDCODED STUB — the literal string in the brand-bar utility cluster; it is NOT computed and does NOT reflect real save state. DISTINCT from the bottom tab-bar's "Updated {formatDateLong(...)}" which IS computed from real updatedAt/createdAt. At rebuild: drop the stub or wire it to real persistence state.

⚠️ DEV "SCAFFOLDS" MENU (brand-bar dropdown, dev-only) — a scaffold-selector dropdown labeled "Dev / Scaffolds" exposing one item "Sample record" (sub "read + edit shell") that sets activeView "record-sample" → SampleRecord. INTENTIONALLY DROPPED at rebuild (developer scaffold, not product).

══ EDIT-PROFILE MODAL MOUNT (shell-owned wiring) ══
The shell mounts EditProfileModal ONCE at the AppLoggedIn root (state: editProfileOpen, useState false). OPEN PATH: the shell passes onEdit={() => setEditProfileOpen(true)} to ProfilePage — the profile page's "Edit profile" button (shown only when isSelf) is the ONLY opener; the ProfileMenu never opens this modal directly. Props: open=editProfileOpen · user=currentUser · companyFunctions (the Settings-fed functions catalog) · onClose → setEditProfileOpen(false) · onSave(next) which does FOUR things in order:
  (1) setCurrentUser(next) — the session identity updates immediately;
  (2) localStorage.setItem("hp_map_user", JSON.stringify(next)) wrapped in try/catch — the persisted session mirror is rewritten;
  (3) setUsers(prev => prev.map(u => u.id === next.id ? { ...u, ...next, updatedAt: nowStamp() } : u)) — the SHARED USERS DIRECTORY row is merged with the edit AND stamped updatedAt: nowStamp(). This write is load-bearing: the directory is the source of truth (see SESSION RECONCILE) — skip it and the reconcile effect would revert the edit on the next directory tick;
  (4) setEditProfileOpen(false) — close.
The modal's internal field surface + save-merge (name recomposition, market/region cascade, the stale-regions bug) is captured in the Users & People box; the shell owns THIS mount + wiring.

══ EXPLAINER-BAR SYSTEM ══
A dismissible info strip under the nav tabs, remembered per view.
• explainerOpen state — useState({ sheet:true, plan:true, community:true, setup:true }) → default-OPEN on those four views (other views default closed/undefined). toggleExplainer flips the current view's flag; isExplainerOpen = !!explainerOpen[activeView].
• VIEWS_WITH_EXPLAINER = ["sheet","scoring","map","plan","community","setup","help","settings","record-sample"].
• hasExplainer = VIEWS_WITH_EXPLAINER.includes(activeView) && !(activeView === "scoring" && isMaster) — i.e. every listed view EXCEPT scoring-on-Master.
• The toggle button (in the nav-tabs right cluster, shown only when hasExplainer) flips between ui-icon "expand_less" (open → "Hide info") and "expand_more" (closed → "Show info").
• PORTAL SLOT: for sheet, plan, community, setup the explainer body is an EMPTY div captured via ref into explainerSlotEl; the view component is passed explainerSlot={isExplainerOpen ? explainerSlotEl : null} and PORTALS its own controls into that slot. The other views render fixed copy inline.
• EXACT per-view explainer COPY (the inline strings):
  - scoring (only when NOT master & open): "Teammates score each stakeholder from −10 to +10 on two dimensions. The x score is impact on the business and the y score is influence in the community." (x score / y score / impact / influence bolded.)
  - map: "Each dot is a stakeholder placed by their team scores: left–right is impact on the business, bottom–top is influence in the community. Drag a dot to reposition it, or click one to open its scorecard." (NOTE: the "Drag a dot to reposition it" half is STALE — the Map is read-only at rebuild, see drag note; the rebuilt copy should drop the drag clause and keep "click one to open its scorecard".)
  - help: "Share code coming soon."
  - settings: "Manager-only configuration for your organization. Changes apply to everyone."
  - record-sample: empty.
At rebuild build the strip as a ui-sheet/inline banner; the portal-slot pattern stays (view supplies its own controls).

══ NAV-TABS RIGHT CLUSTER (extra controls beside the tabs) ══
After the tabs + spacer: (1) the explainer toggle (when hasExplainer); (2) a "Create new" button — ui-icon ligature add (old alias "plus") — shown for activeView in [sheet, scoring, plan, community, setup] — on setup it opens the new-workspace modal, otherwise it bumps addNonce + sets addNonceFor=activeView (a per-view "open create flow" signal the view watches); (3) a "Messages" button — ui-icon ligature chat (old alias "message") — toggling the messaging sidebar, with a msg-badge showing unreadCount when > 0.
• unscoredCount (useMemo) — EXACT formula WITH GUARDS: currentTeamMember = team.find(m => m.userId === currentUser.id). GUARD 1: if currentTeamMember is undefined (the current user has NO team-member row — the normal state for a new or non-team user), unscoredCount = 0 (early return; NEVER dereference currentTeamMember.id). Otherwise unscoredCount = stakeholders.filter(s => isUnscoredBy(s.id, currentTeamMember.id)).length. isUnscoredBy(stakeholderId, teamMemberId): GUARD 2: if teamMemberId is falsy return false (a missing team-member id can never mark anything unscored); else return !(scores[stakeholderId]||{})[teamMemberId]. unreadCount = unscoredCount > 0 ? unscoredCount : 0. Net specified behavior: both badges read 0 when the current user is not on the team.
⚠️ unreadCount IS A STAND-IN (unflagged fake in the oracle) — the code comment beside it claims "Inbox unread = system pending + actual message count" but the CODE never counts messages: the Messages badge simply MIRRORS the unscored-scoring count, and there is NO per-user unread-message tracking (no read markers, no per-conversation state) anywhere in the oracle. DO NOT silently replicate the mislabeled badge. At rebuild either (a) wire a REAL unread-message count — per-conversation read markers per user — or (b) deliberately keep the scoring-count behavior; either way it is a RECORDED decision with the user.

══ TWEAK_DEFAULTS (map display options — EDITMODE marker protocol) ══
Wrapped in /*EDITMODE-BEGIN*/ … /*EDITMODE-END*/ markers (a tooling protocol that lets an editor rewrite these literals):
  mapStyle: "halo"        (radio: "classic" | "halo" | "density")
  showLabels: false       (toggle "Always show labels")
  showZoneLabels: true    (toggle "Show zone labels on grid")
  dotSize: 22             (slider min 14, max 36, step 2)
  accent: "#024AD8"       (color swatch)
Accent swatch options array: ["#024AD8", "#B5552C", "#3E7A2E", "#7A2E12", "#1F1A14"].
These are consumed via useTweaks(TWEAK_DEFAULTS) → [tweaks, setTweak] and rendered today in a floating TweaksPanel (TweakSection/TweakSlider/TweakToggle/TweakRadio/TweakColor) shown only on the map view.
⚠️ AT REBUILD: the floating Tweaks panel and the EDITMODE marker protocol are RETIRED — these become real Settings/Design controls (tokens + per-user map preferences), NOT a floating panel. Record the defaults and option sets above; drop the panel mechanism.

══ addStakeholder — SYSTEM MESSAGE side effect ══
When a stakeholder is created (addStakeholder(data, forceWorkspaceId)): mints id=uid("sh"); stamps createdBy=currentUser.id, createdAt/updatedAt = today (YYYY-MM-DD); owners = data.owners?.length ? data.owners : [currentUser.id]; prepends to stakeholders; sets stakeholderWorkspaces[id] = [ws] where ws = forceWorkspaceId || (isMaster ? null : activeWorkspaceId) (empty array if no ws). THEN posts a SYSTEM MESSAGE into the messages collection under conversation "c-system":
  { id: uid("m"), from: "u-system", body: text, at: new Date().toISOString(), kind: "scoring-needed" }
with body EXACTLY: New stakeholder added: {name} ({type}). Please score them on the Scoring tab.
(name/type from the new record.) Returns the new id.

══ CREATE-TIME DEFAULTS ══
• addTeamMember(userId): guard — skip if userId falsy or already on team. Else push { id: uid("tm"), userId, weight: 1.0, createdAt: nowStamp(), updatedAt: nowStamp() }. DEFAULT WEIGHT = 1.0.
• addWorkspace(data): id=uid("ws"). If data given → { id, ...data, createdBy: currentUser.id, createdAt: data.createdAt || today, updatedAt: today }. If NO data → FALLBACK defaults: name "New workspace", segment "Corporate Functions", businessUnit "Legal / GA&PP", owners [currentUser.id], createdBy currentUser.id, createdAt today. Then openWorkspaceTab(id); returns id.

══ removeUser CASCADE (lives in app.jsx — purges every reference) ══
removeUser(userId) scrubs the user across the ENTIRE data set:
• users: filter out the user (u.id !== userId).
• workspaces: every workspace's owners array filtered to remove userId.
• stakeholders: every stakeholder's owners array filtered to remove userId.
• community: each app — owners filtered to remove userId AND the votes map has the userId key DELETED ({ ...c, owners: filtered, votes: {…without userId} }).
• plans: each plan — owners filtered; team filtered (drop entries where t.userId === userId); strategies mapped so any strategy with ownerId === userId has ownerId reset to "" (empty, not removed).
• team: filter out every team-member row where t.userId === userId.
At rebuild this becomes server-side FK ON DELETE CASCADE / set-null + soft-delete (see Persistence) — but the exact set of touched tables/arrays above MUST be preserved as the cascade contract: users, workspaces.owners, stakeholders.owners, community.owners, community.votes[key], plans.owners, plans.team, plans.strategies[].ownerId→"", team.

══ updateCoordForStakeholder — DELIBERATELY REMOVED ══
The oracle (app.jsx) contains updateCoordForStakeholder(id, targetX, targetY) — a drag-to-rescore that computed the current weighted coord, derived dx/dy to the drop target, and shifted EVERY team member's (x,y) by that delta (clamped −10..10, stamping updatedAt). It is INTENTIONALLY REMOVED at rebuild per the Map ruling: the Map is READ-ONLY — dots are placed by scores and clicking opens the scorecard; there is NO drag-to-reposition. Record only that the removal is deliberate (do not rebuild the drag handler; also drop the stale "Drag a dot" half of the map explainer copy above).

══ DETAIL DRAWER (right slide-over) — CAPTURED HERE; this box is its ONLY capture ══
ENTRY POINT — openDetail(id), defined in the shell: openDetail(id) { setSelectedId(id); setDetailId(id) } — it sets BOTH selectedId AND detailId, so opening a stakeholder's drawer ALSO moves the app-wide row selection (the map's selected dot and the delete-guard fallback below track selectedId). openDetail is the ONE entry point that opens the drawer; the shell passes it as a prop to SheetView and to MapView (their row/dot open-detail click-through). A rebuild that sets only detailId breaks every selectedId-dependent surface — the paired write is load-bearing.
The drawer is open whenever detailId is set (a stakeholder id). A drawer-veil overlay covers the app (click → setDetailId(null)) and the drawer panel slides in from the right; both gain class "show" while open. detailStakeholder = the enriched stakeholder (with computed _x/_y/_status).
DELETE GUARD (exact behavior — the two pointers diverge): one effect keyed on [stakeholders] handles deletion of a referenced stakeholder. If selectedId no longer resolves, it FALLS BACK: setSelectedId(stakeholders[0] ? stakeholders[0].id : null) — first stakeholder's id, or null when the list is empty. If detailId no longer resolves, it is CLEARED: setDetailId(null) — the drawer CLOSES; it does NOT re-point to another stakeholder (never leave the drawer open on an unrelated record after a delete). Initial values: selectedId starts as the FIRST seed stakeholder's id — useState(D.STAKEHOLDERS[0].id); detailId starts null (drawer closed).
BUILD MAP: ui-sheet (right side) or ui-inspector as the host; fields are ui-text-field / ui-select / ui-date-picker / ui-icon-button; every edit writes IMMEDIATELY via updateStakeholder(id, patch) (no save button).
HEAD: h2 = displayName(detailStakeholder) || detailStakeholder.name · a StatusPill for _status · a close ui-icon-button (ligature close) → setDetailId(null).
BODY — three sections of k/v detail rows:
(1) IDENTITY:
• Organization — text input bound to s.org; patch { org: value }.
• Category — select over Object.keys(D.CATEGORIES); ON CHANGE CASCADES type to the new category's FIRST option: patch { category: value, type: (D.CATEGORIES[value]||[])[0]||"" }.
• Type — select over (D.CATEGORIES[s.category]||[]).
• Region — TWO selects side by side (flex, gap 4): first the MARKET select over Object.keys(D.MARKETS), whose ON CHANGE CASCADES region to the new market's FIRST option: patch { market: m, region: (D.MARKETS[m]||[])[0]||"" }; then the REGION select over (D.MARKETS[s.market]||[]).
• Geography — select over D.GEOGRAPHIES.
• Tags — a SINGLE text input showing (s.tags||[]).join(", "); on change patch tags = value.split(",").map(t=>t.trim()).filter(Boolean) (comma-split, trimmed, empties dropped).
• Workspaces — READ-ONLY: for each workspace containing this stakeholder (getWorkspacesForStakeholder(s.id)), an inline chip of SegmentBadge (small) + the workspace name at font-size 11.5; wrapped flex, gap 6.
(NOTE: the D.CATEGORIES / D.MARKETS these selects read are the Settings-overridden catalogs per the CONFIG → CATALOG OVERRIDE WIRING section — never the raw seeds.)
(2) RELATIONSHIP:
• Owner — MultiOwnerPicker (users, owners = s.owners||[], size 24) patching { owners: next }.
• Last contact — date input bound to s.lastContact (YYYY-MM-DD); build as ui-date-picker.
• Status — select with EXACTLY Active | Watch | Dormant.
• Priority — select with EXACTLY High | Medium | Low.
• Notes — textarea bound to s.notes.
(3) POSITION ON MAP (read-only):
• Line 1: "x = {_x.toFixed(1)} · y = {_y.toFixed(1)}" — the weightedCoord-derived coordinates to ONE decimal. (The oracle styles this line in the mono font; at rebuild render it in Inter with tnum numerals — NO mono, per the type law.)
• Line 2: D.STATUSES[_status].strategy in BOLD followed by "." then a space, then D.STATUSES[_status].action in muted small text — the zone strategy/action strings single-sourced in the Relationship-engine box.
The field ENUM CONTENTS (D.CATEGORIES / D.MARKETS / D.GEOGRAPHIES) live in the Catalogs box; the drawer SURFACE — which fields it exposes, its three sections, and its two cascades — is captured here and nowhere else. REBUILD RULING: keep this quick-edit drawer as specified; if the build instead routes edits through the StakeholderModal/profile, that supersession must be made as an explicit recorded ruling with the user — never a silent drop of this surface.

══ OTHER STATE/UPDATERS PASSING THROUGH THE SHELL (pointers — owned by their domain boxes) ══
openDetail(id) — sets selectedId AND detailId together; full spec in the DETAIL DRAWER section above; passed to SheetView and MapView. deleteStakeholder (removes from stakeholders + deletes scores[id] + stakeholderWorkspaces[id]); updateStakeholder/updateScore/updateTeam/updateWorkspace/removeWorkspace (cascades to stakeholderWorkspaces + plans + open tabs + active fallback)/updateCommunityApp (upsert by id)/updatePlan (upsert by plan.id — the source comment beside it, "One plan per workspace; upsert by workspaceId", is STALE prose the code ignores: a workspace holds MULTIPLE plans; see the Database-schema box, discrepancy #2)/deletePlan; messaging sendMessage/startConversation (DM dedupe by participant pair)/messageUser. The delete-guard effect (full spec in the DETAIL DRAWER section): selectedId falls back to the first stakeholder's id (or null when the list is empty); detailId is CLEARED — the drawer closes. These are captured fully in the Lists / Scoring / Plans / Community / Messaging boxes; listed here only to show they are wired from the shell. (The detail drawer is NOT a pointer — it is captured in full in the DETAIL DRAWER section above.)

══ CANONICAL UI BUILD MAP ══
ui-app-shell = the whole frame · ui-app-bar = brand bar (Row 1) · ui-tabs = nav-tab row (Row 2) and bottom workspace-tab strip (Row 4) · ui-sidebar = IntelPanel / messaging sidebar hosts · ui-sheet (right) or ui-inspector = the detail drawer · ui-dialog = OpenWorkspaceModal, CommandPalette, EditProfileModal, StakeholderModal, UserListPopup · ui-menu = every shell dropdown (workspace selector, profile menu, add menu — native outside-click dismiss) · ui-icon = every glyph (Material Symbols ligatures per the ALIAS→LIGATURE table in the NAV_TABS section — never the raw alias strings) · ui-icon-button = close/create/message/fan-toggle controls. No md-*, no shadcn, no hand-rolled glyphs.

══ SKELETON TREE (ORIGINAL-DESIGN CENSUS, sweep b — the literal region tree extracted from archive/src/app.jsx; the build assembles against THIS tree, never prose) ══
Legend: one node per line; indentation (". ") = nesting; "?" = conditional render; classes are the oracle classNames — every className region in app.jsx appears below or is explicitly absorbed; "→" = Canonical UI mapping. Where the SHELL DESIGN RULINGS (2026-07-02) deliberately supersede the oracle arrangement, the OLD node is kept and the RULED mapping is recorded beside it — capture both, build the RULED one.

ROOT MOUNT
RootErrorBoundary (class component; inline styles only, no classNames — full spec in the ROOT ERROR BOUNDARY section)
. App (auth gate)
. . ? LoginView — the ONLY mount when !currentUser (its tree lives in the Users & People box)
. . ? AppLoggedIn — the frame below when signed in

APPLOGGEDIN FRAME — div.app (vertical stack: 4 rows + overlay mounts) → ui-app-shell
. ROW 1 (brand bar) — div.brand-bar → ui-app-bar. RULED (2026-07-02 #5): the chrome is IDENTICAL on every screen; composition = mark + name + workspace selector LEFT, search RIGHT.
. . div.brand (onClick → Home: setActiveWorkspaceId(MASTER)+setActiveView("sheet"); inline cursor:pointer; title "Home — Master")
. . . div.brand-mark — RULED (#4): becomes the "Sr" monogram (capital S + lowercase ITALIC r, title typeface, on a colored field; field color = app-title color, BOTH read --ui-sys-on-surface so they can never drift)
. . . . ? img.brand-mark-img (when cfg.brandIcon set; alt "App icon")
. . . . ? Icon "brandmark" .brand-glyph (fallback) → old ui-icon id_card — RULED: superseded by the Sr monogram
. . . div.brand-name — text = cfg.appName || "Stakeholdr"
. . div.ws-selector (onClick toggles wsMenuOpen) → ui-menu anchored to a top-bar control. RULED (#1): the workspace selector lives in the TOP BAR next to the brand — the oracle ALREADY matches this position; what the ruling RETIRES is the bottom tab strip (Row 4 below), whose switching duties consolidate into THIS selector + the sidebar Workspaces section.
. . . ? (master) span.ws-selector-kind "All" + span.ws-selector-name "Master"
. . . ? (workspace) SegmentBadge small + span.ws-selector-name name (marginLeft 6) + span.muted businessUnit (fontSize 10.5, marginLeft 6)
. . . Icon "chevron" .ico.ws-selector-caret → ui-icon expand_more
. . . ? div.ws-menu (when wsMenuOpen; onClick stopPropagation — see census #8)
. . . . div.ws-menu-item (+.active when active) per workspace — span.nm name + span.sub segment; onClick → openWorkspaceTab(w.id)+close
. . . . div.ws-menu-divider → ui-divider
. . . . div.ws-menu-item "+ New workspace…" (accent ink; onClick → setup view + new-ws modal + close)
. . div.brand-spacer (flex spacer)
. . div.ws-selector.scaffold-selector (Dev dropdown; onClick toggles scaffoldMenuOpen) — span.ws-selector-kind "Dev" + span.ws-selector-name "Scaffolds" + caret Icon chevron + ? div.ws-menu (stopPropagation, census #12) holding ONE div.ws-menu-item (span.nm "Sample record" + span.sub "read + edit shell") — RULED: DROPPED at rebuild (see the DEV SCAFFOLDS flag above)
. . div.utility-cluster
. . . span.muted "Saved · 1m ago" (fontSize 11) — the HARDCODED STUB (see flag above)
. . . UserStack (max 3, size 22; onClick opens UserListPopup — NO ring prop; ring belongs only to the profile-button Avatar, size 26) → ui-avatar-stack (GAP) — RULED chrome names only mark/name/selector left + search right; the stack's ruled placement is an OPEN decision at build (record: old = top-right utility cluster) — never silently dropped
. . . div.profile-button (onClick toggles profileMenuOpen)
. . . . Avatar currentUser (size 26, ring) → ui-avatar — RULED (#3): the signed-in identity appears in ONE place, an avatar pinned BOTTOM-LEFT of the ui-sidebar (identity footer); the ProfileMenu anchors THERE at rebuild (old = top-right)
. . . . ? ProfileMenu (when open; renders INSIDE .profile-button — popover tree in the Users & People box) → ui-menu
. ROW 2 (fixed nav tabs) — div.nav-tabs → OLD: a horizontal ui-tabs row under the app bar. RULED (#2): primary nav moves INTO the expanded ui-sidebar (Claude-like but proportional, --ui-sys-sidebar-width clamp(208px, 18vw, 288px); the rail never sits hollow — full nav + a Workspaces section + the identity footer fill it); the right-cluster controls below remain shell chrome.
. . button.tab (+.active when activeView === t.id) per visibleNavTabs — Icon (alias per the ALIAS→LIGATURE table) + label + ? span.count.count-alert (Scoring only, when unscoredCount > 0); attr data-screen-label={t.label}
. . div.nav-tabs-spacer (flex spacer)
. . ? button.nav-tabs-right-button (explainer toggle; only when hasExplainer) — ui-icon expand_less (open) / expand_more (closed)
. . ? button.nav-tabs-right-button (create; only when activeView in sheet|scoring|plan|community|setup) — ui-icon add
. . button.nav-tabs-right-button (messages toggle; always) — ui-icon chat + ? span.msg-badge unreadCount (when > 0)
. EXPLAINER BAR SLOT (between Row 2 and Row 3; at most ONE renders, per activeView + isExplainerOpen) — div.scoring-explainer-bar → tokened inline banner
. . ? scoring (and !master): div.scoring-explainer-bar > p.scoring-intro (the scoring copy, x/impact + y/influence bolded)
. . ? setup: div.scoring-explainer-bar.explainer-controls — EMPTY portal slot (ref → explainerSlotEl; the view portals its controls in)
. . ? map: div.scoring-explainer-bar > p.scoring-intro (the map copy; drag clause stale per the Map ruling)
. . ? help: div.scoring-explainer-bar > p.scoring-intro "Share code coming soon."
. . ? record-sample: div.scoring-explainer-bar > p.scoring-intro (empty)
. . ? settings: div.scoring-explainer-bar > p.scoring-intro (the settings copy)
. . ? sheet|plan|community: div.scoring-explainer-bar.explainer-controls — EMPTY portal slot (ref → explainerSlotEl)
. ROW 3 (view mount) — div.workspace (+.has-explainer when hasExplainer && isExplainerOpen) — exactly ONE child per activeView:
. . ? sheet && !master: div.intel-split (attr data-mode = intelMode) > IntelPanel + SheetView (side by side; the workHQ box owns IntelPanel's tree)
. . ? sheet && master: SheetView (alone)
. . ? scoring: ScoringView · ? map: MapView · ? plan: PlanView · ? community: CommunityView · ? setup: SetupView · ? help: HelpView · ? record-sample: SampleRecord · ? profile: ProfilePage · ? settings (manager-gated): SettingsView · ? messages: MessagingPage (each view's internal tree lives in its own box)
. ROW 4 (bottom workspace tab strip / footer) — div.ws-tab-bar → OLD: ui-tabs/ui-bottom-bar styling. RULED (2026-07-02): RETIRED as chrome — workspace switching consolidates into the top-bar selector + the ui-sidebar Workspaces section; the strip's DATA (open-set membership, per-tab counts, active fallback, the computed Updated meta) must survive in those ruled surfaces. Both visual states captured:
. . div.ws-tab-stack (+.stacked when isStacked — ONLY the Master tab renders; +.expanded otherwise — ALL openWorkspaceIds render in order)
. . . MASTER tab — div.ws-tab.master (+.active when master && view sheet; onClick activateWorkspaceTab(MASTER); title "Master pool - all stakeholders. Cannot be closed.") > Icon "table" (→ ui-icon table_rows) + "Master" + span.muted "· {stakeholders.length}" (fontSize 10.5, marginLeft 2)
. . . WORKSPACE tab — div.ws-tab (+.active; onClick activateWorkspaceTab(id); title "{name} - {segment} · {businessUnit}") > span.seg-dot (inline background = segmentColor(w.segment)) + span.ws-tab-label name + span.muted "· {count}" (fontSize 10.5) + button.ws-tab-close (onClick closeWorkspaceTab(id, e); aria-label "Close", title "Close tab") > Icon "close" .ico.ws-tab-close-icon
. . ? button.ws-fan-toggle (when openWorkspaceIds.length > 1; onClick toggles tabsExpanded) > Icon "double-left" .ico (expanded → collapse) | Icon "double-right" .ico (collapsed → expand)
. . button.ws-tab-add (onClick → setOpenWsModalOpen(true)) > Icon "plus" .ico + "Open workspace"
. . div.ws-tab-bar-spacer (flex spacer)
. . div.ws-tab-meta > span "Updated {formatDateLong(…)}" (COMPUTED — see the tab-bar META rule above)
. OVERLAY MOUNTS (siblings AFTER Row 4, in JSX ORDER — stacking comes from styles.css z-index values; at equal z the later sibling paints on top; each is always-mounted unless noted):
. . 1 OpenWorkspaceModal (returns null unless open) → ui-dialog
. . . div.modal-veil.show (onClick onClose)
. . . div.modal (inline width 560)
. . . . div.modal-head > h2 "Open a workspace" + button.btn.btn-ghost (aria-label "Close", Icon close)
. . . . div.modal-body.open-ws-modal-body > per segment with workspaces: div.open-ws-group > div.open-ws-group-head (SegmentBadge small) + div.open-ws-list > button.open-ws-item (+.is-open when already open; onClick onPick(w.id)) > span.open-ws-item-name + span.open-ws-item-meta "{businessUnit} · {count} stakeholder(s)" + span.open-ws-item-cta "Switch to"|"Open →"
. . . . div.modal-foot > button.btn "Cancel" + button.btn.btn-primary (Icon plus) "Create new workspace"
. . 2 CommandPalette (⌘K; its tree lives in the command-palette box) → ui-dialog
. . 3 ? StakeholderModal (mounted only while scoringProfileShId resolves to a stakeholder; initialView read mode; tree owned by the Lists box) → ui-dialog
. . 4 EditProfileModal (null unless open; tree in the Users & People box) → ui-dialog
. . 5 UserListPopup (ALWAYS mounted; .show toggles; tree in the Users & People box) → ui-sheet (right) with scrim
. . 6 MessagingSidebar (tree owned by the Messaging box) → ui-sidebar / ui-sheet (right)
. . 7 DETAIL DRAWER — div.drawer-veil (+.show when detailId) then div.drawer (+.show) → ui-sheet (right) / ui-inspector
. . . ? (when detailStakeholder resolves) div.drawer-head > h2 displayName + StatusPill(_status) + button.btn.btn-ghost (Icon close)
. . . . div.drawer-body > 3 × div.drawer-section (h4 "Identity" / "Relationship" / "Position on map"); each field row = div.detail-row > div.k label + div.v control (exact fields, cascades, and the Region two-select row in the DETAIL DRAWER section above)
. . 8 ? TweaksPanel (map view only; TweakSection/TweakRadio/TweakSlider/TweakToggle/TweakColor children) — RETIRED at rebuild (see TWEAK_DEFAULTS above)
CLASSNAME ACCOUNTING — every className literal in app.jsx appears above or in its referenced section; NONE silently dropped: app · brand-bar · brand · brand-mark · brand-mark-img · brand-glyph · brand-name · ws-selector · ws-selector-kind · ws-selector-name · ws-selector-caret · ws-menu · ws-menu-item · nm · sub · ws-menu-divider · brand-spacer · scaffold-selector · utility-cluster · muted · profile-button · nav-tabs · tab · count · count-alert · nav-tabs-spacer · nav-tabs-right-button · msg-badge · scoring-explainer-bar · scoring-intro · explainer-controls · workspace · has-explainer · intel-split · ws-tab-bar · ws-tab-stack · stacked · expanded · ws-tab · master · active · seg-dot · ws-tab-label · ws-tab-close · ws-tab-close-icon · ws-fan-toggle · ws-tab-add · ico · ws-tab-bar-spacer · ws-tab-meta · drawer-veil · show · drawer · drawer-head · drawer-body · drawer-section · detail-row · k · v · modal-veil · modal · modal-head · modal-body · open-ws-modal-body · open-ws-group · open-ws-group-head · open-ws-list · open-ws-item · is-open · open-ws-item-name · open-ws-item-meta · open-ws-item-cta · modal-foot · btn · btn-ghost · btn-primary.

══ UX HANDLER CENSUS (ORIGINAL-DESIGN CENSUS, sweep c — EVERY event handler in archive/src/app.jsx, in source order) ══
A. JSX DOM HANDLERS (36):
OpenWorkspaceModal — #1 modal-veil onClick → onClose · #2 head close onClick → onClose · #3 open-ws-item onClick → onPick(w.id) · #4 foot "Cancel" onClick → onClose · #5 foot "Create new workspace" onClick → onCreateNew.
Brand bar — #6 div.brand onClick → Home (Master + sheet; title "Home — Master", inline cursor:pointer) · #7 div.ws-selector onClick → toggle wsMenuOpen · #8 div.ws-menu onClick → e.stopPropagation() [APPENDED DETAIL: the menu renders INSIDE the selector div whose own onClick toggles; without this stop, any in-menu click would bubble up and re-toggle the menu] · #9 ws-menu-item onClick → openWorkspaceTab(w.id) + setWsMenuOpen(false) · #10 "+ New workspace…" onClick → setActiveView("setup") + setNewWsModalOpen(true) + close menu · #11 scaffold-selector onClick → toggle scaffoldMenuOpen · #12 scaffold div.ws-menu onClick → stopPropagation [same bubbling guard as #8] · #13 "Sample record" onClick → setActiveView("record-sample") + close menu · #14 div.profile-button onClick → toggle profileMenuOpen.
Nav tabs — #15 button.tab onClick → setActiveView(t.id) · #16 explainer-toggle onClick → toggleExplainer · #17 create onClick → setup ? setNewWsModalOpen(true) : setAddNonceFor(activeView) + addNonce++ · #18 messages onClick → toggle msgSidebarOpen.
Tab strip — #19 ws-fan-toggle onClick → toggle tabsExpanded · #20 ws-tab-add onClick → setOpenWsModalOpen(true).
Detail drawer — #21 drawer-veil onClick → setDetailId(null) · #22 drawer-head close onClick → setDetailId(null) · #23 Organization input onChange → patch org · #24 Category select onChange → patch category + TYPE CASCADE (first option) · #25 Type select onChange → patch type · #26 Market select onChange → patch market + REGION CASCADE (first option) · #27 Region select onChange → patch region · #28 Geography select onChange → patch geography · #29 Tags input onChange → comma-split/trim/filter patch tags · #30 Last-contact date input onChange → patch lastContact · #31 Status select onChange → patch status · #32 Priority select onChange → patch priority · #33 Notes textarea onChange → patch notes.
renderTab — #34 Master tab onClick → activateWorkspaceTab(MASTER_ID) · #35 workspace tab onClick → activateWorkspaceTab(id) · #36 button.ws-tab-close onClick → closeWorkspaceTab(id, e) (e.stopPropagation() inside so the tab-activate click never fires).
B. DOCUMENT/WINDOW LISTENERS (3): #37 window "open-stakeholder-profile" → setScoringProfileShId(e.detail) (the Scoring drill; cleaned up on unmount) · #38 document mousedown → the four-menu outside-click dismiss (SHELL DROPDOWN DISMISS section, incl. the missing-dep quirk) · #39 document keydown → cmd/ctrl-K opens the palette (preventDefault).
C. SHELL→CHILD CALLBACK WIRINGS (49 — the interaction callbacks DEFINED at the mount sites; the receiving component's own DOM handlers are censused in that component's box): UserStack onClick → open UserListPopup (1). ProfileMenu onClose / onEditProfile / onMessages / onSettings / onLogOut (5 — exact wiring in the PROFILE MENU section). IntelPanel onAddStakeholder → addNonceFor "sheet" + bump (1). SheetView split mount: onConsumeOpen → clear pendingShId, onOpenWorkspace → openWorkspaceTab (2). SheetView master mount: the same two (2). ScoringView onDeleteWorkspace → removeWorkspace(active) — null on Master (1). PlanView onOpenWorkspace (1). SetupView setActiveWorkspaceId → openWorkspaceTab (1). ProfilePage onEdit → open EditProfileModal, onOpenWorkspace, onOpenPlan → window.__pendingPlanId + view plan, onOpenCommunity → window.__pendingCommunityId + view community, onOpenStakeholder → Master + sheet + pendingShId (5). SettingsView updateUserRole + updateCompanyIssues/Tags/Functions/Segments/Markets/Sites/Categories/Goals → updateAppConfig patches (9). OpenWorkspaceModal onPick / onClose / onCreateNew (3). CommandPalette onClose, onGo = paletteGo (2). StakeholderModal onOpenWorkspace / onDelete / onCancel / onSubmit (4). EditProfileModal onClose, onSave (the 4-step save — EDIT-PROFILE MODAL MOUNT section) (2). UserListPopup onClose, onMessage = messageUser (2). MessagingSidebar onClose, onOpenPage → view messages + close (2). Detail-drawer Owner row: the inline MultiOwnerPicker onChange → updateStakeholder(detailStakeholder.id, { owners: next }) (1 — ADDED 2026-07-03 by the blind audit; this census originally omitted the wiring, though the DETAIL DRAWER prose always captured the behavior). TweaksPanel children: TweakRadio mapStyle, TweakSlider dotSize, TweakToggle showLabels, TweakToggle showZoneLabels, TweakColor accent — each onChange → setTweak (5).
COUNT: 36 JSX DOM handlers + 3 document/window listeners = 39 handlers in app.jsx, plus 49 shell→child callback wirings = 88 interactions. ALL ACCOUNTED — every interaction was already described in this box's prose except three micro-details appended by this census (the two in-menu stopPropagation guards (#8, #12) and the brand div's title attribute "Home — Master" with inline cursor:pointer (#6)) and ONE wiring the census itself first missed: the detail-drawer Owner MultiOwnerPicker onChange, added above (totals corrected 2026-07-03 from 48/87 by the blind audit; the behavior was always captured in the DETAIL DRAWER prose).` },
      { t: "Original-design CONNECTIVITY CENSUS — every cross-record edge (real / fragile / fake→make-real)", done: true, d:
`WHAT THIS BOX IS — the complete edge list of every place a user can travel from one record/surface to another in the ORIGINAL app (archive/src, all modules swept 2026-07-03: app.jsx, palette.jsx, profiles.jsx, profile-page.jsx, sheet.jsx + sheet-modals.jsx, community.jsx + community-modal.jsx, plan.jsx, setup.jsx, messaging.jsx, intel.jsx, help.jsx, users.jsx, map.jsx, scoring.jsx, landing.jsx, record.jsx, settings.jsx). Format per edge: SOURCE (surface + trigger) -> TARGET · MECHANISM (exact code path) · STATUS. Statuses: REAL (works as designed) · FRAGILE (works via a global-window bridge or DOM event bus — replace with first-class routing/state at rebuild, observable behavior preserved) · FAKE-OR-DEAD (the design implies the connection but the code never wires it — MAKE-REAL, or record an explicit ruling to drop) · ONE-WAY (a path exists in one direction where the design implies a return or a symmetric path). Edges already specified inside another guide box are cross-referenced; edges found here that NO other box captures are marked LEAK and this box is their capture. help.jsx has zero cross-record edges (pure reference page); landing.jsx is a generic shell whose only edge is the caller-supplied onRowClick (counted under Plans/Community).

══ A. SHELL AND GLOBAL BRIDGES (app.jsx) ══
A1. Brand mark + app name (brand-bar, onClick, title "Home — Master") -> Master Lists · setActiveWorkspaceId(MASTER_ID) + setActiveView("sheet") · REAL · captured (App shell box, BRAND BAR).
A2. Workspace-selector dropdown item -> that workspace's Lists · openWorkspaceTab(w.id) (adds to openWorkspaceIds if absent, activates, view "sheet") · REAL · captured.
A3. Workspace-selector "+ New workspace…" -> Setup page WITH the create modal open · setActiveView("setup") + setNewWsModalOpen(true) · REAL · captured.
A4. Dev "Scaffolds" menu "Sample record" -> record-sample view · setActiveView("record-sample") · REAL (dev-only; ruled DROPPED at rebuild) · captured.
A5. UserStack avatar row (utility cluster) -> UserListPopup people panel (right-edge) · setUsersPopupOpen(true) · REAL · captured (Users box).
A6. Profile avatar button -> ProfileMenu dropdown · setProfileMenuOpen toggle · REAL · captured.
A7. ProfileMenu "View profile" -> own profile page · onEditProfile prop = setProfileUserId(currentUser.id) + setActiveView("profile") · REAL · captured.
A8. ProfileMenu "Messages" -> full Messages page · setActiveView("messages") · REAL · captured.
A9. ProfileMenu "Settings" (manager only) -> Settings · setActiveView("settings") · REAL · captured.
A10. ProfileMenu "Log out" -> login gate · logOut() clears currentUser + hp_map_user · REAL · captured.
A11. Nav tabs (Lists / Scoring / Map / Plans / Community / Workspaces / Help) -> the 7 views · setActiveView(t.id); Scoring hidden on Master · REAL · captured.
A12. AUTO-REDIRECT: on Master while on Scoring -> Map · effect: if (isMaster && activeView === "scoring") setActiveView("map") · REAL · captured.
A13. Nav-bar "+" (context-aware create) -> active view's create flow · setup: setNewWsModalOpen(true); else setAddNonceFor(activeView) + bump addNonce (consumed by Sheet/Scoring/Plan/Community effects to open their create modal/flow) · REAL · captured.
A14. Nav-bar messages icon (with unread badge) -> MessagingSidebar toggle · setMsgSidebarOpen(o => !o) · REAL · captured.
A15. Bottom workspace tab click (Master or workspace) -> that scope's Lists · activateWorkspaceTab(wsId): setActiveWorkspaceId + setActiveView("sheet") · REAL · captured.
A16. Workspace tab close (×) -> neighbor tab fallback · closeWorkspaceTab: remaining[max(0, idx-1)] || MASTER_ID, view "sheet"; Master never closable · REAL · captured.
A17. "Open workspace" button -> OpenWorkspaceModal -> picked workspace · onPick = openWorkspaceTab(wsId) + close modal · REAL · captured.
A18. OpenWorkspaceModal "Create new workspace" -> Setup + create modal · setOpenWsModalOpen(false) + setNewWsModalOpen(true) + setActiveView("setup") · REAL · captured.
A19. Cmd/Ctrl-K anywhere -> CommandPalette · global keydown effect -> setPaletteOpen(true) · REAL · captured (palette box).
A20. paletteGo("stakeholder", id) [from palette row, @-mention, profile-page relationship row] -> Master Lists + that stakeholder's record · setActiveWorkspaceId(MASTER_ID) + setActiveView("sheet") + setPendingShId(id); SheetView effect consumes openStakeholderId -> setEditId -> StakeholderModal · REAL (React state handoff, not a window global) · captured — BUT FLAG: this deep link opens the stakeholder in the EDIT modal, not the read-only StakeholderProfile; the Scoring drill (A25) opens the READ view (initialView). Asymmetric by mechanism, not design — at rebuild the ruling is: deep links land on the READ view with Edit one click away.
A21. paletteGo("plan", id) -> Plans view with that plan open in REVIEW · window.__pendingPlanId = id + setActiveView("plan"); PlanView effect: if plan exists setOpenId + mode "review", then null the global · FRAGILE (window global; silent no-op if plan deleted) · captured (App shell + Plans boxes; ruled: becomes real router state).
A22. paletteGo("community", id) -> Community view with that entry open read-only · window.__pendingCommunityId = id + setActiveView("community"); CommunityView effect: if exists setViewId, then null · FRAGILE (same pattern) · captured.
A23. paletteGo("workspace", id) -> that workspace's Lists tab · openWorkspaceTab(id) · REAL · captured — BUT FLAG (LEAK, this box is the capture): NO EXISTENCE GUARD. A stale id (workspace deleted after being mentioned in a message) is appended to openWorkspaceIds and activated; activeWorkspace resolves undefined while isMaster is false, and the brand-bar ws-selector then reads activeWorkspace.segment unguarded -> RENDER CRASH (caught only by the root error boundary). MAKE-REAL guard at rebuild: every deep-link resolver verifies the record exists (as the plan/community bridges already do) and falls back gracefully (toast + stay put).
A24. paletteGo("user", id) -> that user's profile page · setProfileUserId(id) + setActiveView("profile") · REAL · captured.
A25. window "open-stakeholder-profile" CustomEvent (dispatched by Scoring name cells) -> read-only StakeholderModal overlay · shell effect: setScoringProfileShId(e.detail) -> StakeholderModal existing + initialView, with full profile wiring (onOpenWorkspace = openWorkspaceTab, onDelete, onSubmit=updateStakeholder) · FRAGILE (DOM event bus; replace with a prop callback / route) · captured.
A26. window.__openMention(type, id) [mention chips in message bodies] -> paletteGo with code map stk->stakeholder · wsp->workspace · pln->plan · cmy->community · FRAGILE (global fn installed by an every-render effect) · captured.
A27. window.__mentionSources() -> supplies { stakeholders, workspaces, plans, community } to the mention autocomplete in every Composer · FRAGILE (global fn; becomes context/props) · captured.
A28. LEAK — SheetView's openDetail prop is DEAD CODE: the shell passes openDetail (the detail-drawer opener) to BOTH SheetView and MapView, but SheetView NEVER CALLS IT (its name double-click / edit icon go to the StakeholderModal via local setEditId instead). In the oracle the right-hand DETAIL DRAWER is reachable from EXACTLY ONE trigger in the whole app: Map dot double-click (B2). STATUS: FAKE-OR-DEAD (Lists half). The App-shell box's drawer section says the shell passes openDetail to SheetView and MapView as "their row/dot open-detail click-through" — the Sheet half of that sentence overstates the oracle; AMEND that box to read: passed to both, CALLED only by MapView. Rebuild ruling needed with the user: either wire a Lists trigger to the drawer (make-real) or accept map-only entry (and record it).
A29. Detail drawer "Workspaces" row chips (SegmentBadge + name spans) -> nowhere · no onClick; the SAME workspace list rendered in StakeholderProfile IS clickable (C8) · FAKE-OR-DEAD as connectivity — already ruled READ-ONLY in the drawer's own capture (App shell box), so this is a RECORDED drop, not a silent one; if the drawer survives the rebuild, decide chip navigation explicitly.
A30. LoginView submit -> the app · logIn(u) sets currentUser + hp_map_user · REAL · captured (Users box).

══ B. MAP (map.jsx) ══
B1. Dot single click -> selects the stakeholder; scorecard rail shows its record · setSelectedId (selection shared app-wide with Lists) · REAL · captured (Map box).
B2. Dot double-click -> app detail drawer for that stakeholder · onDoubleClick={() => openDetail(r.id)} — the ONLY drawer entry point in the app (see A28) · REAL · captured.
B3. LEAK — Scorecard -> full record: MapView passes onOpenFull={() => selected && openDetail(selected.id)} into MapDetail, but MapDetail NEVER RENDERS ANY CONTROL that calls it — the prop is accepted and dropped. The scorecard rail therefore has NO affordance to open the selected stakeholder's full record (drawer or profile); the only escape is re-finding the dot and double-clicking. STATUS: FAKE-OR-DEAD — design intends scorecard -> full record (the wiring exists, the button was never built). MAKE-REAL at rebuild: an explicit "Open record" action in the ui-inspector scorecard (title area or actions slot). No other guide box mentions onOpenFull; this box is its capture.
B4. Scorecard "Visit Website" link -> external site · href = normalizeUrl(stakeholder.url), target _blank rel noopener noreferrer · REAL · captured.
B5. Scorecard EMPTY state "Recently scored" rows (first 6 stakeholders) -> selects that stakeholder on the map · onClick setSelectedId(s.id) · REAL (in-page) · captured.

══ C. LISTS (sheet.jsx + sheet-modals.jsx + profiles.jsx) ══
C1. Frozen edit-icon cell click (stopPropagation) OR stakeholder-name cell double-click -> StakeholderModal (EDIT mode) for that row · local setEditId(row.id) · REAL · captured (Lists box).
C2. Row click -> selection · setSelectedId(row.id) (shared with Map) · REAL · captured.
C3. Notes cell click (stopPropagation, title "Click to view notes & history") -> NotesModal (history + add note) · setNotesId(row.id) · REAL · captured.
C4. Row contact links -> external: Email = mailto:{email}; Phone = tel:{digits}; X account = https://x.com/{handle} new tab; Website = normalizeUrl(url) new tab (all stopPropagation so the row does not select) · REAL · captured.
C5. "Community investment" column pills (affiliatedCommunity names as .tag spans, title = entry name) -> nowhere · NO onClick — yet the identical affiliated-entry list inside StakeholderProfile (C9) opens the entry modal · FAKE-OR-DEAD — MAKE-REAL at rebuild: clicking a pill opens that community entry (read view), matching the profile behavior. The Lists box captures the render but not the missing click; this box is the capture of that gap.
C6. External open request (pendingShId from A20/I4) -> auto-opens that row's StakeholderModal · effect on openStakeholderId: setEditId(id) + onConsumeOpen() clears the shell state · REAL · captured.
C7. StakeholderModal "View Stakeholder" <-> StakeholderProfile "Edit stakeholder" · setViewMode(true/false) flip inside the one modal mount · REAL · captured (stakeholder-record boxes).
C8. StakeholderProfile "Workspaces" chips (tag tag-clickable) -> that workspace's Lists tab · onOpenWorkspace(w.id) = openWorkspaceTab, then onClose() closes the profile · REAL where wired (Lists edit modal, Scoring drill A25) · captured — see E7/F7 for the two call sites that OMIT this wiring.
C9. StakeholderProfile "Community engagements" rows (first 5, button profile-entry) -> that community entry read-only (CommunityModal initialView) · setEntryId(a.id) · REAL · captured.
C10. StakeholderProfile "View all N engagements" -> overlay listing the FULL affiliated list -> any entry -> C9 modal · setShowAllEntries(true); entry click closes overlay + setEntryId · REAL · captured.
C11. Community entry opened FROM a stakeholder profile: its Targets/Stakeholders pills -> SWAPS the profile subject in place · onOpenStakeholder = (id) => { setSubject(next); setEntryId(null) } — profile now shows the other stakeholder (a real record-to-record hop that stays inside one modal) · REAL · captured (stakeholder-profile box).

══ D. SCORING (scoring.jsx) ══
D1. Stakeholder name cell (sh-cell sh-cell-link, title "Open stakeholder") -> read-only stakeholder record overlay · window.dispatchEvent(new CustomEvent("open-stakeholder-profile", { detail: s.id })) -> shell listener A25 · FRAGILE (DOM event bus) · captured (Scoring + App shell boxes).
D2. Remove-last-teammate confirm "Delete workspace" -> workspace deleted -> shell falls back (removeWorkspace: cascades plans, closes tab, active -> Master) · onDeleteWorkspace prop (only passed when not Master) · REAL · captured (Scoring/Workspaces boxes).
D3. Nav-bar "+" on Scoring -> new-stakeholder modal · addNonceFor === "scoring" effect -> setNewShOpen(true) · REAL · captured.

══ E. PLANS (plan.jsx) ══
E1. Plan card title click / card "Review" / landing-table row click -> PlanReview (read-only page) · setOpenId(p.id) + setMode("review"); table via LandingView onRowClick · REAL · captured (Plan page box).
E2. Plan card "Edit" -> PlanEditor · setOpenId + setMode("edit") · REAL · captured.
E3. "New plan" (landing button or nav "+") -> creates a seeded plan and opens the editor · newPlan(): updatePlan(blank) + setOpenId + mode "edit" · REAL · captured.
E4. Editor "‹ All plans" back AND the Save button -> plan landing · both call onBack = setOpenId(null) (Save is gated by planValid) · REAL · captured.
E5. Review "Plans" back -> landing; Review "Edit plan" -> editor; Editor -> review via onReview · setMode flips on the same openId · REAL · captured.
E6. Editor "Stakeholders In This Plan" row click (title "Open stakeholder") -> StakeholderProfile overlay · setViewShId(s.id) · REAL · captured.
E7. ONE-WAY — the plan-editor StakeholderProfile instance (E6) is a DEAD END: the call site passes NO onEdit and NO onOpenWorkspace, so the profile shows no "Edit stakeholder" action and its workspace chips render as plain non-clickable tags (StakeholderProfile only wires them when the handler exists). Same modal, three behaviors by call site (full from Lists/Scoring; inert here and in F7). MAKE-REAL at rebuild: ONE profile contract everywhere — workspace chips always navigate, Edit always available (permissions permitting). The Plans box lists the exact props (so the omission is recorded implicitly); this box flags it as the connectivity decision.
E8. ONE-WAY — PlanReview stakeholder rows are NOT clickable (cursor default, no onClick) while the SAME table in the editor opens the profile (E6) · captured in the Plans box ("REVIEW rows are NOT clickable") · rebuild ruling: review rows should open the read-only profile (a read surface linking to read surfaces); make-real unless explicitly dropped.
E9. PlanReview "Community Investment" rows ("{c.name} - {c.kind} · {c.stage} · {amount}") -> nowhere · plain text, no onClick, though each row IS a community record that has its own read page · FAKE-OR-DEAD — MAKE-REAL: link each row to the community entry read view (F1 target). The Plans box captures the render only; this box is the capture of the missing edge.
E10. PlanEditor "Linked community investment" rows (plan-comm-row: name + kind/stage/amount + remove ×) -> nowhere · only the remove × is interactive; the row never opens the entry · FAKE-OR-DEAD — MAKE-REAL same as E9. LEAK; this box is the capture.
E11. window.__pendingPlanId consumption (from A21/I2) -> auto-open review · FRAGILE · captured.
E12. Editor "Add New Stakeholder" -> StakeholderModal (create) -> addStakeholder(data, plan.workspaceId) (forced into the plan's workspace) · REAL · captured.
E13. Editor "Add existing stakeholder…" autocomplete row -> assigns that stakeholder to the plan's workspace (data edge, row appears in the plan table) · assignExisting: setStakeholderWorkspaces append · REAL · captured.

══ F. COMMUNITY (community.jsx + community-modal.jsx) ══
F1. Card name click / card "Review" / landing-table row click -> CommunityProfile read-only PAGE (asPage) · setViewId(app.id) · REAL · captured (Community boxes).
F2. Card "Edit" -> CommunityModal editor page · setEditId(app.id), editViewFirst false · REAL · captured.
F3. Read page "‹ Community" back -> landing (setViewId null); read page "Edit engagement" -> editor (setViewId null + setEditId) · REAL · captured.
F4. Read page Targets / Stakeholders pills (tag tag-clickable) -> StakeholderProfile overlay for that stakeholder · onOpenStakeholder = setViewId(null) + setViewStakeholderId(id) · REAL · captured (Community->stakeholder bridge section).
F5. Editor "View application" flip -> read profile; pills from the editor path DISCARD any unsaved draft (setEditId(null), no confirm; the profile shows the SAVED entry) · REAL mechanically, data-loss hazard · captured verbatim in the Community box.
F6. window.__pendingCommunityId consumption (from A22/I3) -> auto-open read page · FRAGILE · captured.
F7. ONE-WAY — the Community-page StakeholderProfile instance (target of F4) is a DEAD END like E7: call site passes NO onEdit and NO onOpenWorkspace (workspace chips inert, no edit bridge), and onClose returns to the COMMUNITY LANDING, not to the profile/editor the click came from (that return-path asymmetry is already captured in the Community box; the inert-chips half is flagged HERE). MAKE-REAL per the E7 single-contract ruling.
F8. Community card "Engaged" row -> nowhere · linked stakeholder names comma-joined as plain text (captured as "Plain text, not clickable" in the Community box) while the read page renders the same list as clickable pills (F4) · FAKE-OR-DEAD (card-level) — at rebuild either make the names pills (consistent with F4) or record the drop; never silent.

══ G. WORKHQ (intel.jsx) ══
G1. IntelPanel card contents — Alerts development lines ("{stakeholder}: {note…}"), "Need your score" stakeholder names, Tasks "Vote: {entry}" — ALL inert .intel-name spans with NO onClick · the band is pure display; none of its signals navigate to the stakeholder, the Scoring row, or the community vote it names · FAKE-OR-DEAD — the whole point of an intelligence band is drill-through; MAKE-REAL at rebuild (Alerts/Need-score -> stakeholder record or Scoring row; Vote tasks -> community entry). The workHQ box captures the band as-is per the no-preference ruling; this box records the connectivity requirement.
G2. IntelPanel "+ Stakeholder" quick button -> Lists create modal · onAddStakeholder = shell bumps addNonceFor "sheet" + addNonce · REAL · captured.

══ H. SETUP / WORKSPACES (setup.jsx) ══
H1. WorkspaceCard body click (cursor pointer) -> that workspace's Lists tab · onActivate -> shell prop setActiveWorkspaceId = openWorkspaceTab(ws.id) · REAL · captured (Workspaces box).
H2. WorkspaceCard NAME click (stopPropagation, title "Open / edit workspace") -> WorkspaceModal edit · setEditWorkspaceId(ws.id) · REAL · captured.
H3. Card delete (×, canDelete-gated) -> ConfirmDialog -> removeWorkspace cascade (plans deleted, tab closed, active falls back to Master) · REAL · captured.
H4. Create workspace (from A3/A13/A18 or Setup) -> addWorkspace -> AUTO-OPENS the new workspace as a tab · addWorkspace calls openWorkspaceTab(id) · REAL · captured.

══ I. PROFILE PAGE (profile-page.jsx) ══
I1. Workspaces tab row click -> that workspace's Lists tab · onOpenWorkspace(r.id) = openWorkspaceTab · REAL · captured (Profile page box).
I2. SEP (plans) tab row click -> that plan's REVIEW · onOpenPlan = window.__pendingPlanId + setActiveView("plan") · FRAGILE (window bridge) · captured.
I3. Community tab row click -> that entry's read page · onOpenCommunity = window.__pendingCommunityId + setActiveView("community") · FRAGILE · captured.
I4. Relationships tab row click -> Master Lists + that stakeholder's EDIT modal · onOpenStakeholder = Master + sheet + setPendingShId (same path and same edit-not-read flag as A20) · REAL · captured.
I5. "Edit profile" (isSelf only) -> EditProfileModal (shell-mounted) · onEdit = setEditProfileOpen(true) · REAL · captured.
I6. ONE-WAY (LEAK, this box is the capture) — OTHER USERS' PROFILE PAGES ARE NEARLY UNREACHABLE: the ONLY route to another user's profile is a command-palette "Person" result (A24). Nothing else navigates to a user: UserListPopup rows offer ONLY "Message" (no view-profile), OwnersDisplay avatar clusters (Lists owner column, workspace/plan/community cards, plan teams) have no click-through, message-thread author avatars/names have none, and Settings' user table has none. The design gives every user a rich profile page (4 tabbed assignment tables) and then hides it behind one search surface. MAKE-REAL at rebuild: avatars/owner chips and people-panel rows open the user profile (Message stays as the secondary action).

══ J. MESSAGING (messaging.jsx) ══
J1. Sidebar conversation row -> thread (in-panel); "← All conversations" back · setActiveConversationId / null · REAL · captured (Messaging box).
J2. Sidebar expand icon -> full Messages page (sidebar closes; the active conversation CARRIES OVER because both surfaces share activeConversationId in the shell) · onOpenPage = setActiveView("messages") + setMsgSidebarOpen(false) · REAL · captured.
J3. Messages-page conversation row -> thread pane · setActiveConversationId · REAL · captured.
J4. "New" / "New conversation" -> NewConversationModal -> startConversation (dedupes 2-person DMs to the existing conversation) -> thread opens · REAL · captured.
J5. UserListPopup "Message" button -> DM thread in the sidebar · messageUser(userId): startConversation([userId]) + setActiveConversationId + close popup + setMsgSidebarOpen(true) · REAL · captured.
J6. Mention chips in message bubbles (tokens {{stk|wsp|pln|cmy:id|label}} rendered as mention-chip buttons) -> the named record via window.__openMention -> paletteGo · FRAGILE (window global) AND inherits A23's stale-workspace crash: a /workspace mention whose workspace was later deleted crashes the shell render; stale stakeholder/plan/community mentions silently no-op (plan/community guards check existence; the stakeholder path consumes pendingShId against a missing row) · chips + token grammar captured in the Messaging box; the stale-id behavior is captured HERE.
J7. Composer mention autocomplete -> reads live entity lists through window.__mentionSources (A27) · FRAGILE · captured.
J8. System "Reminders" messages (kind "scoring-needed": "New stakeholder added: {name} ({type}). Please score them on the Scoring tab.") -> nowhere · pure text; no link to the Scoring tab, no mention token for the stakeholder, even though both routes exist (nav tab; mention chips) · FAKE-OR-DEAD — MAKE-REAL at rebuild: system notifications deep-link to their subject (stakeholder mention chip) and their action surface (Scoring). The Messaging box captures the message text; this box records the missing edge.
J9. addStakeholder (any path: Lists, Scoring, Plan editor) -> posts the J8 system message into conversation c-system · record-creation -> notification edge, intentionally one-directional · REAL (data edge) · captured.

══ K. SETTINGS (settings.jsx) ══
K1. Three mailto links -> external mail client: "contact@stakeholdr.com" (support copy) and two "Email us" invite-code links (mailto with subject New invite code request) · plain anchors · REAL · captured (Settings box).

══ L. RECORD SCAFFOLD (record.jsx — dev surface, ruled dropped) ══
L1. RecordShell back control ("Samples") -> nowhere · onBack={() => {}} literal no-op · FAKE-OR-DEAD by design (dev scaffold; the scaffold box records the pattern; product records built from it must wire a real back).
L2. Embedded SheetView inside SampleRecord -> all navigation props stubbed · openDetail/onOpenWorkspace/updateStakeholder/addStakeholder etc = noop, getWorkspacesForStakeholder = () => [] · FAKE-OR-DEAD by design (dev) · captured (Record scaffold box).

══ TOTALS ══
Edges found: 94.
REAL: 67 (A1–A20, A23, A24, A30 · B1, B2, B4, B5 · C1–C4, C6–C11 · D2, D3 · E1–E6, E12, E13 · F1–F5 · G2 · H1–H4 · I1, I4, I5 · J1–J5, J9 · K1).
FRAGILE (window/global-event bridges — replace with first-class routing at rebuild, behavior preserved): 12 (A21, A22, A25, A26, A27 · D1 · E11 · F6 · I2, I3 · J6, J7).
FAKE-OR-DEAD (design intends it, code never wires it — MAKE-REAL or explicit recorded drop): 11 (A28 Lists->drawer dead prop · A29 drawer ws chips [ruled read-only] · B3 scorecard onOpenFull · C5 Lists community pills · E9 review linked-community rows · E10 editor linked-community rows · F8 card Engaged names · G1 workHQ card names · J8 Reminders no deep link · L1, L2 dev-scaffold noops [ruled dropped]).
ONE-WAY (path exists one direction; design implies symmetry): 4 (E7 plan-drill profile dead end · E8 review stakeholder rows inert vs editor · F7 community-drill profile dead end + close-to-landing · I6 user profiles reachable only via palette).
MAKE-REAL WORKLIST (the build must wire these; each is flagged at its edge above): B3, C5, E7+F7 (one profile contract), E8, E9, E10, F8, G1, I6, J8, plus the A23/J6 stale-id guard and the A20/I4 read-not-edit deep-link ruling. LEAKS newly captured by THIS box (no other box holds them): A23 stale-id crash, A28 correction, B3, C5 click gap, E10, I6, J6 stale-id behavior, J8 gap.` },
                              { t: "workHQ (IntelPanel) — the workspace intelligence band [CODE — archive/src/intel.jsx; captured as-is per the 2026-06-13 \"no preference\" ruling, reshape allowed at build]", done: true, d:
`WHAT IT IS — a "Workspace Intelligence" band (the IntelPanel) that renders as a separate section ABOVE the Lists table and divided from it; the table component (.sheet-wrap) is untouched and renders BELOW the band. Every card is COMPUTED from data already in the Store (stakeholders, scores, team, community, plans, currentUser) — there is NO backend and no new data. Props: mode, setMode, stakeholders, scores, team, community, plans, currentUser, isMaster, workspaceLabel, workspaceId, onAddStakeholder.

THREE VIEW MODES — driven by data-mode on the parent .intel-split: "split" (default — band and table share the screen) · "intel" (the band takes over; cards show more rows) · "table" (the band collapses to a single summary line and the table takes over). The cards render only when mode !== "table".

THE HEAD (.intel-head) — left to right: the title "WorkHQ" (.intel-title); when mode === "table", the one-line summary (.intel-summary) shows here inline; a flexible spacer (.intel-spacer); a quick-add button (.intel-quick) with the plus icon + label "Stakeholder" calling onAddStakeholder (title "Add stakeholder"); then the mode toggle group (.intel-modes, role="group", aria-label "Intelligence layout") = three buttons, the active one carries the "on" class: dashboard icon → setMode("intel") (title "Expand intelligence") · splitscreen icon → setMode("split") (title "Split view") · table_rows icon → setMode("table") (title "Expand table").

CONSTANTS & HELPERS — COLD_DAYS = 90. now = new Date(). daysSince(d): if !d return Infinity; parse t = new Date( (d matches the regex /^\\\\\\\\\\\\\\\\d{4}-\\\\\\\\\\\\\\\\d{2}-\\\\\\\\\\\\\\\\d{2}$/ ? d + "T00:00:00" : d) ); if isNaN(t) return Infinity; else return Math.floor((now - t) / 86400000) (whole days). THE REGEX, spelled in words so no escaping ambiguity survives transcription: start-anchor, digit-class backslash-d repeated {4} (four digits), a literal hyphen, backslash-d{2} (two digits), a literal hyphen, backslash-d{2} (two digits), end-anchor — ONE backslash before each d (a double-backslash pattern would match a literal backslash + letter d and NEVER match a date). It matches ISO date-ONLY strings like 2026-07-02; those get "T00:00:00" appended so they parse as LOCAL midnight — without this normalization a bare ISO date parses as UTC and lastContact staleness reads a day off in western timezones. nameOf(s) = displayName(s) || s.name.

THE SIGNALS (all derived each render) —
• COLD ENGAGEMENT — stakeholders.filter(priority === "High" AND daysSince(lastContact) >= 90), sorted by daysSince(lastContact) DESCENDING (stalest first). [Computed; note: not currently rendered as its own card — it feeds only the summary line. Preserve the computation; it becomes a real card at build.]
• NEEDS YOUR SCORE — if currentUser: stakeholders.filter(s => NOT ((scores[s.id] || {})[currentUser.id])); [] when there is no currentUser. VERIFIED BUG / DO-NOT-REPLICATE — this formula indexes the scores map by USER id (currentUser.id, u-*) instead of the current user's TEAM-MEMBER id (tm-*). The scores store is keyed stakeholder id → team-member id → score record, and in the seed data user ids and team-member ids ALWAYS differ (u-* vs tm-*), so this lookup virtually always misses and reports (nearly) everything unscored — disagreeing with the shell's unscoredCount. Do NOT rebuild this card from this formula. At rebuild, use the ONE canonical isUnscoredBy predicate keyed by team-member id (resolve currentUser → their team-member record, then check scores[s.id][tm.id]) — the same single source that drives the Scoring nav badge and the Reminders cadence (see the scoring-counts box, which carries the matching ruling).
• RELATIONSHIP MIX — for each stakeholder: wc = weightedCoord(s.id, scores||{}, team||[]); st = statusFor(wc.x, wc.y); classify into mix { positive, winnable, negative } using EXACT zone arrays — POS = [Cooperate, Collaborate, Valuable Relationship, High Value Relationship, Strategic Partner] → positive++; NEG = [Proactively Defend, Defend, Protect, Respond, Identify] → negative++; everything else (Monitor, Maintain, Connect, Commit) → winnable++. [These 5+5 arrays are load-bearing; capture verbatim. Computed but not currently shown as a card — available for a future mix card; preserve.]
• AWAITING YOUR VOTE — (community||[]).filter(a => a.stage is one of [Proposed, Under Review] AND currentUser AND NOT ((a.votes||{})[currentUser.id])).
• ACTIVE PLANS IN THIS WORKSPACE — wsPlans = isMaster ? (plans||[]) : (plans||[]).filter(p => p.workspaceId === workspaceId). [Computed; not rendered yet — preserve.]
• DEVELOPMENTS — flatten every stakeholder's notesHistory into entries { at, body, who: n.by, stakeholder: s }; sort by new Date(at||0) DESCENDING (newest first). devLabel(d) = (displayName(stakeholder) || stakeholder.name) + ": " + body.slice(0,40) + (body.length > 40 ? "…" : "").

THE SUMMARY LINE — summaryBits, joined by " · ": if cold.length → "{cold.length} high-priority going cold"; if needsScore.length → "{needsScore.length} need your score"; if awaitingVote.length → "{awaitingVote.length} awaiting your vote". If no bits → "All clear — nothing needs attention." (Shown inline in the head only in table mode.) NOTE: the "need your score" bit inherits the NEEDS-YOUR-SCORE bug above — at rebuild it must read the canonical team-member-keyed count.

THE CARDS (.intel-cards, rendered when mode !== "table") — three IntelCards, ALL THREE passing tone="data" (CORRECTED 2026-07-03 by the blind audit against intel.jsx — an earlier draft falsely claimed the Tasks card omitted the tone prop and fell to "calm"). The only per-card difference is the wide flag: Alerts and Need-your-score pass wide (class "intel-card tone-data intel-card-wide"); Tasks does not (class "intel-card tone-data"). IntelCard builds className "intel-card tone-" + (tone || "calm"), so tone "calm" is ONLY the component's default fallback — never exercised by any of the three mounted cards. The slice count depends on mode ("intel" shows more):
1. ALERTS (tone "data", wide) — names = developments.slice(0, mode==="intel" ? 12 : 5).map(devLabel); more = developments.length - (12 or 5); empty text "No new developments".
2. NEED YOUR SCORE (tone "data", wide) — names = needsScore.slice(0, mode==="intel" ? 12 : 5).map(nameOf); more = needsScore.length - (12 or 5); empty "You're caught up on scoring". (Feeds from the buggy needsScore above — rebuild from the canonical isUnscoredBy, per the DO-NOT-REPLICATE ruling.)
3. TASKS (tone "data"; NOT wide) — names = awaitingVote.slice(0, mode==="intel" ? 8 : 4).map(a => "Vote: " + a.name); more = awaitingVote.length - (8 or 4); empty "Nothing pending".

IntelCard PROP SURFACE (capture the FULL surface; today only label/tone/wide/names/more/empty are used, but the component supports more and the rebuild should preserve it): className = "intel-card tone-{tone||calm}" + (wide ? " intel-card-wide" : ""); a .intel-card-label header; then ONE content variant — stack (rows of {v,k} as .intel-stack-row with .intel-stack-v + .intel-stack-k) OR mix (a .intel-mix segmented bar: three .intel-mix-seg spans pos/neu/neg, each an i swatch colored var(--pos)/var(--neu)/var(--neg) followed by the count) OR value (.intel-card-value) ; optional sub (.intel-card-sub); then names — if names.length>0 a .intel-card-names list of .intel-name spans plus a .intel-name.more "+{more} more" when more>0, else the empty string in .intel-card-empty.

NAMING NOTE — the UI label is "WorkHQ" (the head title); the source-file comment calls it the "Workspace Intelligence band"; the build-phase row and this guide call it "workHQ". One feature, three names — standardize on "workHQ" at build.

REBUILD BUILD-MAP (Canonical UI, ui-* only — NEVER md-*/shadcn): the band = a tokened surface-container section (a step darker than the white table runway) sitting above the ui-stakeholder-table, with a divider between. Head: the title in --ui-sys-font-title; the quick-add = a ui-button (tonal/text) with a leading ui-icon (plus → add); the mode toggle = a ui-icon-button group (dashboard / splitscreen / table_rows ligatures via ui-icon, the active one selected). Each IntelCard = a tokened ui-* card composition: label in --ui-sys-font-label, the name list as a compact ui-list (or chip row), the overflow as a ui-chip "+N more", the mix bar as a small tokened segmented bar using --ui-sys-pos / --ui-sys-neg and a neutral; all three cards are tone "data" in the oracle — there is NO two-tone split to preserve ("calm" is IntelCard's unexercised default fallback): build ONE tone-data card variant; if a second, calmer variant is wanted it is a NEW design decision to rule with the user, not oracle preservation. At build, promote the already-computed COLD and RELATIONSHIP-MIX and ACTIVE-PLANS signals into their own cards (they are computed today but unshown). Layout mode (split/intel/table) = a host data-attribute swapping CSS-grid track sizes — token-only, no ad-hoc styling.

SKELETON TREE (ORIGINAL-DESIGN STRUCTURE CENSUS, 2026-07-03 — the literal region tree extracted from archive/src/intel.jsx (IntelPanel + IntelCard), in render order; [brackets] = conditional; the build assembles against THIS tree, never prose). HOST NOTE: the ".intel-split" parent that carries the data-mode attribute lives in the HOST page composition (the Lists page), NOT in this module — intel.jsx renders the BAND only; the table (.sheet-wrap) is a sibling BELOW the band, untouched.
div "intel-band" — the band container. Canonical UI: a tokened surface-container section above ui-stakeholder-table, with a divider between (per the REBUILD BUILD-MAP above).
. div "intel-head" — the header strip (layout row — token-only container). Children in order:
. . span "intel-title" — the text "WorkHQ". Maps to title-token text.
. . [mode === "table"] span "intel-summary" — the one-line summary. Maps to tokened label text.
. . span "intel-spacer" — the flexible spacer. Layout only.
. . button "intel-quick" — Icon "plus" + text "Stakeholder", title "Add stakeholder". Maps to a ui-button (tonal/text) with a leading ui-icon (add).
. . span "intel-modes" (role="group", aria-label "Intelligence layout") > 3 x button "intel-mode" (the active one + " on"): Icon "dashboard" (title "Expand intelligence") / Icon "splitscreen" (title "Split view") / Icon "table_rows" (title "Expand table"). Maps to a ui-icon-button group, active = selected state (ink change only).
. [mode !== "table"] div "intel-cards" — the cards grid (layout row — token-only container) > exactly 3 IntelCard instances (Alerts, Need your score, Tasks), each rendering:
. . div "intel-card tone-data" (+ " intel-card-wide" on Alerts and Need-your-score only) — all three mounted cards are tone-data; "tone-calm" is reachable only through IntelCard's default when no tone prop is passed (never exercised by these three cards).
. . . div "intel-card-label" — the card title.
. . . ONE mutually-exclusive content variant (part of IntelCard's full prop surface; today's three cards use NONE of these — they render names only):
. . . . [stack] div "intel-stack" > N x div "intel-stack-row" > span "intel-stack-v" + span "intel-stack-k".
. . . . [mix] div "intel-mix" > 3 x span "intel-mix-seg" (variant classes "pos" / "neu" / "neg"), each = an i swatch (inline background var(--pos) / var(--neu) / var(--neg)) + the count. Maps to the tokened segmented bar.
. . . . [value defined] div "intel-card-value".
. . . [sub] div "intel-card-sub".
. . . names branch: [names.length > 0] div "intel-card-names" > N x span "intel-name" + [span "intel-name more" showing "+{more} more" when more > 0] — ELSE [empty text set] div "intel-card-empty". Maps to a compact ui-list / chip row with a ui-chip "+N more" overflow.
CLASSNAME ACCOUNTING — every className region in intel.jsx appears in the tree above: intel-band, intel-head, intel-title, intel-summary, intel-spacer, intel-quick, intel-modes, intel-mode, on, intel-cards, intel-card, tone-data/tone-calm, intel-card-wide, intel-card-label, intel-stack, intel-stack-row, intel-stack-v, intel-stack-k, intel-mix, intel-mix-seg pos/neu/neg, intel-card-value, intel-card-sub, intel-card-names, intel-name, more, intel-card-empty — NONE dropped (tone-calm arises only from IntelCard's default-fallback formula; no mounted card renders it). The tree CONFIRMS the head order, the table-mode summary placement, and IntelCard's full prop surface; the "two-tone split" this census originally claimed to confirm was FALSE and is CORRECTED above (blind audit 2026-07-03: all three cards pass tone="data"; only the wide flag differs). (Module trivia: intel.jsx imports useState but never uses it — a dead import; nothing to capture.)

UX HANDLER CENSUS (ORIGINAL-DESIGN UX CENSUS, 2026-07-03 — every event handler in archive/src/intel.jsx) —
1. quick-add button (intel-quick) onClick → onAddStakeholder (the app-level handler runs setAddNonceFor("sheet") + an addNonce bump, opening the create-stakeholder modal — the same route captured in the StakeholderModal box).
2. mode button (dashboard icon) onClick → setMode("intel").
3. mode button (splitscreen icon) onClick → setMode("split").
4. mode button (table_rows icon) onClick → setMode("table").
4 handlers, all accounted — all four are described in THE HEAD section above; IntelCard contains NO handlers (the cards are display-only; title attributes are tooltips, not handlers). No other on* props, listeners, or effects exist in the module.` },
                  { t: "Whiteboard — team collaboration white-space (NEW; articulated, not designed yet)", done: true, d:
`=== FORWARD-DESIGN (NO ORACLE) === There is NO oracle module for this feature. Nothing in archive/src/ or project/ implements a whiteboard — no component, no store slice, no route, no CSS. This box is NOT captured code; it is a NEW feature articulated with the user, recorded here so the requirement survives the rebuild. Do NOT go hunting for a source file to audit against; the audit standard for this box is fidelity to the articulated intent below, which is preserved verbatim. Design happens deliberately, WITH the user, at build time.

--- ARTICULATED INTENT (verbatim — the requirement of record) ---

A NEW FEATURE — articulated here, NOT designed yet. A team "WHITE SPACE" to write, collaborate, and comment: an ADVANCED form of Messages, in the spirit of Slack + Todoist. It lives under Workspaces as the team's collaboration surface. Purpose: plan; write; capture IDEAS for planning or for noting a stakeholder's significance.

CAPABILITIES (requirements) —
• IDEAS — captured quickly, then SORTED and ASSIGNED (to teammates), like a lightweight task/idea board (Todoist-like).
• COLLABORATIVE WRITING — multiple teammates write together; EDITS SHOWN LIKE WORD (track changes / edit history / authorship), so changes are visible and attributable.
• COMMENTS — threaded comments on the writing/ideas (Slack-like discussion).
• NEWS / SOCIAL CAPTURE — paste just a URL (a stakeholder's social-feed post, a news article) and the app must FIND, DISCERN, and EMBED or CREATE a beautiful capture from that URL alone: news-outlet name + headline + preview (or an embedded social post). Requires a link-unfurling / oEmbed / page-metadata API (Integrations/APIs bucket); the app decides per URL whether to embed or render a generated card.
• REAL-TIME, MULTI-USER collaboration.

PLAN INTEGRATION — from a PLAN EDIT you can CALL BACK to your whiteboard (if you've used one) to pull ideas/notes/captures into the plan; and you can CONTINUE whiteboarding from within plan view OR edit. Whiteboard content feeds and links into Plans.

LAYOUT (preference) — it clicks OUT of workHQ into a TWO-PANE, SIDE-BY-SIDE SPLIT (like Apple's split-view windows): whiteboard beside the work surface or plan.

RELATION TO MESSAGES — Messaging is the lighter conversation form; the Whiteboard is the advanced collaboration/whiteboarding surface. (How they relate or merge: to confirm.)

STATUS — concept + requirements captured; the design and the URL-embed API are OPEN. To be designed deliberately.

--- CANONICAL UI COMPOSITION SKETCH (ui-* only — NEVER md-*/Material/shadcn/Tailwind) ---

GAP RULING — the whiteboard CANVAS itself (the free-writing/idea-board editing surface with authorship marks, comment anchors, embed cards, live cursors) is NOT covered by any of the 35 built components. It is a GAP per the design law: build it INTO design-system/ as a genuine custom element (working name ui-whiteboard: shadow DOM, real states, keyboard + a11y, all visuals from --ui-sys-* tokens only), bring it to the ui-button quality bar, REGISTER it in design-system/manifest.json (tag, props, events, states, consumed tokens), and only THEN compose it into a screen. It is never mocked up as div/span markup in the app, and it is never patched with app-side CSS.

HOST — the ui-whiteboard element is hosted in the RECORD SCAFFOLD (the record-surface pattern from project/RECORD_SCAFFOLD.md as adopted by the rebuild's ui-app-shell composition): the whiteboard opens as a record within the app shell, which is what gives the articulated two-pane split for free — the whiteboard record sits beside the work surface (Lists/workHQ) or a plan record in the side-by-side split, rather than inventing a bespoke window system.

SURROUNDING REAL COMPONENTS (all already in the manifest except where flagged GAP) —
• ui-app-bar — the whiteboard toolbar band across the top of the record: board title, mode/actions.
• ui-icon-button (grouped in the ui-app-bar) — the tool actions, Material Symbols ligatures via ui-icon (e.g. edit_note for writing mode, checklist for the idea/task board, add_comment for commenting, link for URL capture, history for edit history); the active tool shown via the selected state (ink change only — no background swap, per design law).
• ui-dialog — the share dialog (who on the team can see/edit) and the board-settings dialog.
• ui-avatar — PRESENCE identity chips (each teammate currently on the board, and live-cursor identity). ui-avatar is BUILT and registered in design-system/manifest.json today (tag ui-avatar, props name/src/size sm|md|lg, initials + photo states, sizes via --ui-sys-avatar-size-*, fill --ui-sys-primary/on-primary, role=img aria-label=name, import ./components/avatar.js) — use it AS-IS; do NOT rebuild or re-register it. What remains open is only the STACKED-OVERLAP PRESENCE GROUP (the row of overlapping teammate avatars with a "+N" overflow): per the Shared-UI-primitives box that group form is ui-avatar-stack, a GAP that composes FROM ui-avatar (the manifest names ui-avatar as "the ONE avatar primitive — owner stacks compose from it"); build/register ui-avatar-stack via the standard GAP procedure before first use, or compose the presence row directly from ui-avatar elements if the design session rules a stack component unnecessary here.
• ui-menu, ui-tooltip, ui-snackbar — overflow actions, tool hints, and save/embed status toasts as needed; all already built.
Threaded comments and the assigned-ideas list inside the canvas may lean on ui-list, ui-chip (assignee/status chips), and ui-text-field for composers — but their placement inside the editing surface is part of the ui-whiteboard GAP design, decided when the component is designed with the user.

REAL-TIME ENGINE (cross-reference, already ruled) — per the concurrency box's TIER 3 ruling: collaborative documents (this Whiteboard explicitly, and long-form plan writing) use a CRDT (e.g. Yjs) so concurrent edits merge conflict-free, with live cursors + presence, and the doc state is persisted. Row-level last-write-wins is WRONG for this surface. The Whiteboard is the primary consumer of that tier — do not build it on record-style writes.

--- GOVERNANCE / EMBED SAFETY (stays — binding on the URL-capture feature) ---
The NEWS/SOCIAL CAPTURE requires a link-unfurling / oEmbed / page-metadata API, which lives in the Integrations/APIs bucket and is an OPEN decision — nothing here is implemented; the rebuild must make it real, not stub it. Whatever provider is chosen, third-party content NEVER executes in the app's context: embeds render sandboxed (sandboxed iframe or a server-generated preview card — outlet name + headline + image), no third-party scripts injected into the whiteboard document, fetched metadata sanitized before render, and the per-URL embed-vs-generated-card decision made by the app, not by the pasted page. Team visibility/edit rights on a board are governed through the share dialog (ui-dialog above) under the same workspace/role model as the rest of the app (managers administer; membership decided at design time with the user).

STATUS OF THIS BOX — forward-design: requirements are the contract; the concrete ui-whiteboard spec, the ui-avatar-stack presence-group decision (ui-avatar itself is already built), the comment/idea interaction design, the Messages-vs-Whiteboard relationship, and the embed API choice are designed WITH the user before build, then this box is amended with the final ui-* build-map and sealed.` },
                                          { t: "Settings — manager-only org config hub (9 oracle panes + Integrations as forward-design) + the design dashboard", done: true, d:
`SETTINGS — manager-only org configuration hub. Component SettingsView(props). Two-column layout: a left rail "settings-nav" (aside) and a right "settings-panes" column, inside a wrapper div with classes "setup-wrap settings-wrap single-page settings-layout". State: filter (string, "") for the Roles search; pane (string, default "identity") selecting which pane shows. Managers only — this whole view is gated by the app shell (only role==="manager" can open Settings; see the App-shell/ProfileMenu box: the "Settings" menu item only renders when isManager).

PANE COUNT — RECONCILED. The ORACLE settings-nav array has EXACTLY 9 panes, in this order, each [id, label]:
  1. ["identity", "App Settings"]   (id "identity" — the label shown in the rail is "App Settings"; the pane's own section heading is "Identity")
  2. ["fiscal", "Fiscal Calendar"]
  3. ["stakeholders", "Stakeholders"]
  4. ["structure", "Your Structure"]
  5. ["geography", "Geography"]
  6. ["issues", "Issues"]
  7. ["tags", "Tags"]
  8. ["management", "Team Management"]
  9. ["contact", "Contact"]
Rendered as buttons (class "settings-nav-item", plus " active" when pane===id), onClick sets the pane. In Canonical UI build this is a ui-nav-rail or ui-list of selectable items; the active item shows selection via ink only (no background swap), per design law.
"INTEGRATIONS" is FORWARD-DESIGN, NOT captured behavior. There is NO "integrations" entry in the oracle settings-nav and no integrations pane in the oracle source. It is retained as a PLANNED 10th pane to design later; treat anything about integrations as net-new design, never as a port. Do not invent oracle behavior for it.

The right column renders one or more "setup-section" blocks per pane (some panes render multiple stacked sections, marked "seg-substack" for the 2nd+).

=== PANE "identity" (rail label "App Settings") ===
Renders THREE stacked setup-sections: Identity, Theme, Time Zone.

— Section "Identity" — a "settings-grid" with these fields:
• App name — text input bound to appConfig.appName, updateAppConfig({appName}). Placeholder "HP's Stakeholder Map". Helper (muted 12.5px): "Shown in the header, login screen, and browser tab title." → ui-text-field.
• Brand icon — preview circle (class "brand-icon-preview") whose background = appConfig.brand || "#000000"; shows appConfig.brandIcon as an <img> if set, else the default "brandmark" Icon glyph (class "brand-glyph"). An upload control: a file <input accept="image/*"> hidden inside a label-button reading "Upload icon" (or "Replace icon" if an icon already exists); handler onPickBrandIcon reads the file via FileReader.readAsDataURL and updateAppConfig({brandIcon: reader.result}). When brandIcon is set, a ghost "Remove" button calls updateAppConfig({brandIcon: null}). Helper: "Replaces the default glyph inside the circular app icon. Sits on the brand color." → ui-button (file) + ui-button ghost.
• Brand color (label "Brand color (app icon)") AND Accent color (label "Accent color") — IDENTICAL field pattern, each a row of: (a) a "settings-swatch-preview" span whose background is the current value; (b) a text <input type=text width 100 fontSize 12> bound to the value (brand defaults display "#000000"; accent has no default fallback, shows appConfig.accent raw); (c) a BeakerColorField (see below); then under that a "settings-swatch-row" of 7 swatch buttons.
  THE 7 SWATCHES (shared by BOTH brand and accent), in order: "#000000", "#1976D2", "#E64A19", "#AD1457", "#388E3C", "#00897B", "#BF360C". Each is a button (class "settings-swatch", plus " active" when the current value lowercased === swatch lowercased), style background=swatch, title=hex, onClick sets the value (updateAppConfig({brand:c}) or ({accent:c})).
  Brand helper: "The colored circle behind the app icon in the header and login screen." Accent helper: "Used for buttons, active states, the brand icon, and tab underlines."
  → Canonical UI: each swatch = a small ui-button/ui-chip color tile (or the circle-only variant of the ui-swatch-card GAP component defined under Theme below — one component, two variants); the hex input = ui-text-field; the live preview = a token-tinted swatch. The chosen color writes a token (accent → --ui-sys-accent equivalent; brand → app-icon background).

BeakerColorField(value, onChange): a single shared component. Renders a span "beaker-color" whose CSS color = value (so the glyph is tinted to the current color), containing the Material Symbol ligature "science" (a flask/beaker glyph; classes "material-symbols-outlined msym beaker-glyph") and a hidden native <input type="color" value={value}> overlaid on top that opens the OS color picker; its onChange fires onChange(e.target.value). title "Pick a custom color". This is the custom-color escape hatch beyond the 7 swatches. In Canonical UI: a ui-icon "science" tinted to the value, wrapping a hidden type=color input (or a ui-color-field GAP if built) — the flask glyph is the affordance, the OS picker is the mechanism.

— Section "Theme" (seg-substack) — a "settings-grid":
• "Choose One" — a "theme-choices" row of 3 theme-swatch buttons (class "theme-swatch", " active" when (appConfig.theme || "soapbox")===id). Default theme is "soapbox". Each button: a "theme-circle" span (background = preview bg) containing a "theme-circle-dot" span (background = preview dot), a "theme-name", a "theme-sub"; the button carries a CSS custom prop "--theme-border" set to the border value. The 3 themes, with EXACT preview values:
    - id "soapbox",    label "Soapbox",     sub "Warm beige",     bg "#ECE8DD", dot "#FAF8F2", border var(--ink-3)
    - id "undecideds", label "Undecideds",  sub "True greyscale", bg "#E6E6E8", dot "#F1F1F3", border "#7A787E"
    - id "nightshift", label "Night Shift", sub "Warm charcoal",  bg "#262624", dot "#52504A", border "#C2C0B6"
  onClick → updateAppConfig({theme: id}). FLAG → tokens: theme selection should drive the token set (each theme = a token theme; preview bg/dot/border are token-sourced, not literals, in the rebuild).
  → Canonical UI BUILD-MAP (theme picker) — this is a declared GAP. No existing manifest component is a selectable preview-swatch card, and reimplementing the card in markup/CSS is forbidden (law 1). Build ui-swatch-card INTO design-system/ (to the ui-button quality bar), register it in manifest.json, THEN use it. Contract:
    · tag: ui-swatch-card. Props: value (string id, e.g. "soapbox"); label (string, e.g. "Soapbox"); sublabel (string, e.g. "Warm beige"); selected (boolean, reflected attribute — draws the selection ring using the card's border token); variant "card" (default: circle + label + sublabel, used here) | "dot" (circle only, usable for the 7 brand/accent color swatches above); and three preview-color props swatch-bg, swatch-dot, swatch-border, each fed a --ui-sys-* token reference (the three themes' preview bg/dot/border values above become theme-preview tokens in tokens.css — never inline hex in screen markup).
    · Shadow-DOM anatomy: one real <button> containing the preview circle (background = swatch-bg) with an inner dot (background = swatch-dot), then the label, then the sublabel. Real hover/focus-visible/pressed/selected states and a11y: the three cards form a radiogroup (role="radiogroup" on the row, role="radio" + aria-checked per card, exactly one selected, arrow-key movement).
    · Event: emits a change/select event carrying value; the screen wires it to updateAppConfig({theme: value}). The three cards sit in a horizontal row (the oracle's "theme-choices").
• "Auto-switch to Night Shift" — a "theme-auto-row":
    - A Yes/No toggle (class "yesno-toggle", role="group") of two buttons: "Yes" (class " on" when appConfig.autoNightShift truthy) sets autoNightShift:true; "No" (" on" when falsy) sets autoNightShift:false.
    - WHEN autoNightShift is true, reveal a 3-part time picker ("theme-time-group"). The stored value appConfig.nightShiftAt is a 24-hour "HH:MM" string, DEFAULT "21:00". It is split into hh/mm; H=parseInt(hh); ampm = H>=12 ? "PM" : "AM"; h12 = (H%12===0 ? 12 : H%12). Three "designed-select" dropdowns:
        · hour ("theme-time-hr"): options 1..12 (the twelve integers), value h12.
        · minute ("theme-time-min"): ONLY two options, "00" and "30", value mm.
        · AM/PM ("theme-time-ap"): options "AM","PM", value ampm.
      A compose(nh12, nmm, nap) recombines: h = nh12 % 12; if nap==="PM" h += 12; then updateAppConfig({ nightShiftAt: String(h).padStart(2,"0") + ":" + nmm }). So e.g. 9 / 30 / PM → "21:30"; 12 / 00 / AM → "00:00"; 12 / 00 / PM → "12:00".
  UNWIRED IN ORACLE (do NOT hunt for wiring — there is none): appConfig.theme, autoNightShift, and nightShiftAt are DEAD WRITES in the oracle. No code anywhere in archive/src applies the selected theme — the three theme ids ("soapbox"/"undecideds"/"nightshift") exist ONLY in this picker's preview array; no theme class or token set is ever applied to the document. Likewise nothing reads nightShiftAt or autoNightShift — there is no auto-switch scheduler. The picker persists the choice and shows the active state, and that is ALL the oracle does. MAKE REAL at rebuild: theme = a --ui-sys-* token-set swap (per the Design/Themes box — each theme is a named token set applied to the app root); auto-switch = a client clock check against nightShiftAt that swaps to the Night Shift token set at the stored HH:MM (and back at a defined morning boundary, to be decided with the user at the Design-page step).
  → Canonical UI: Yes/No = a ui-switch or 2-button segmented ui-button group; the 3 selects = three ui-select.

— Section "Time Zone" (seg-substack) — a "settings-grid", one "designed-select":
• Label "Record timestamps in". value appConfig.timeZone, DEFAULT "America/Los_Angeles". The 8 options, [value, label]:
    ["America/Los_Angeles","Pacific (PT)"], ["America/Denver","Mountain (MT)"], ["America/Chicago","Central (CT)"], ["America/New_York","Eastern (ET)"], ["UTC","UTC"], ["Europe/London","London (GMT/BST)"], ["Europe/Berlin","Central European (CET)"], ["Asia/Tokyo","Japan (JST)"].
  Helper: "Created, updated, and approved timestamps are recorded in this time zone." A spacer div fills the 2nd grid column. → ui-select.
  UNWIRED IN ORACLE: appConfig.timeZone is a DEAD WRITE — this select is the ONLY place in archive/src that reads it. No timestamp writer or formatter consumes it; oracle timestamps are produced in local time (nowStamp()) or date-only (today()), so the helper copy over-claims what the oracle implements. Keep the helper string verbatim as UI copy. MAKE REAL at rebuild per the Enterprise state model box: store all timestamps UTC, display them in this org time zone.

=== PANE "fiscal" (rail "Fiscal Calendar") ===
One setup-section "Fiscal Calendar". Intro (muted 12.5px, maxWidth 720): "Pick the day your organization's fiscal year begins. Quarters are calculated from that anchor as four equal three-month spans." A settings-grid:
• "Fiscal year starts" — two designed-selects side by side: a month select (flex 1) value appConfig.fiscalStartMonth DEFAULT 11 (so November), options the 12 month names January..December mapped to values i+1 (1..12); a day select (width 90) value appConfig.fiscalStartDay DEFAULT 1, options 1..31. Helper: "Organizations often have unique fiscal year start dates." → two ui-select.
• "Resulting quarters" — renders <QuartersPreview month={fiscalStartMonth||11} day={fiscalStartDay||1} />.
Managers only (whole pane).

QuartersPreview(month, day) algorithm — EXACT:
  monthsShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].
  Helper add(m, d, deltaMonths): nm = m + deltaMonths; while(nm>12) nm-=12; while(nm<1) nm+=12; returns {m:nm, d:d}. (Day-of-month is carried unchanged; quarter starts always land on the anchor day.)
  Helper dayBefore({m,d}): if d>1 return {m, d:d-1}; else prev = (m===1 ? 12 : m-1); lastDay = MONTHLEN[prev-1]; return {m:prev, d:lastDay}.
  MONTHLEN table (month lengths, Feb=29): [31,29,31,30,31,30,31,31,30,31,30,31].
  Loop i = 0..3 (four quarters): start = add(month, day, i*3); nextStart = add(month, day, (i+1)*3); end = dayBefore(nextStart). Each quarter ends the day BEFORE the next quarter's start. Label "Q" + (i+1). Range string: monthsShort[start.m-1] + " " + start.d + " → " + monthsShort[end.m-1] + " " + end.d.
  Render: a "quarters-list" of "quarter-row"s, each a "quarter-label" (Q#) and a "quarter-range" (the "MmmD → MmmD" string).
  Worked example with default month=11, day=1: Q1 Nov 1 → Jan 31, Q2 Feb 1 → Apr 30, Q3 May 1 → Jul 31, Q4 Aug 1 → Oct 31.

=== PANE "stakeholders" (rail "Stakeholders") ===
One setup-section "Categories & Audience Types". Head shows a live count: Object.keys(companyCategories||{}).length + " categor(y/ies)". Intro: "How stakeholders are classified. Each category contains audience types. Stakeholders pick a category and one of its audience types. Add a category, then add its audience types." Renders <SegmentSettings segments={companyCategories||{}} onChange={updateCompanyCategories} segLabel="category" unitLabel="audience type" />. (SegmentSettings is the shared 2-level editor — see below.)

=== PANE "structure" (rail "Your Structure") ===
THREE stacked setup-sections:
• "Organizational Goals" — count (companyGoals||[]).length + " goal(s)". Intro: "The goals your organization is working toward. These are inherited by every stakeholder engagement plan your team creates so everyone applies these goals in their markets, regions, and with key audiences. We recommend 3 to 5 goals." → <IssueSettings issues={companyGoals||[]} onChange={updateCompanyGoals} placeholder="Type and add with a comma or pressing Enter" />.
• "Segments & Business Units" (seg-substack) — count Object.keys(companySegments||{}).length + " segment(s)". Intro: "Your organization's structure. Each segment contains business units that operate as teams. Workspaces pair a segment with one of its units. Add a segment, then add its units." → <SegmentSettings segments={companySegments||{}} onChange={updateCompanySegments} /> (uses default segLabel "segment" / unitLabel "unit").
• "Individual Functions" (seg-substack) — count (companyFunctions||[]).length + " function(s)". Intro: "The organizational functions a person can belong to. These populate the Function dropdown on every user's profile." → <IssueSettings issues={companyFunctions||[]} onChange={updateCompanyFunctions} placeholder="Type and add with a comma or pressing Enter" />.

=== PANE "geography" (rail "Geography") ===
TWO stacked seg-substack sections:
• "Markets & Regions" — Intro: "The markets and the regions within them, used to scope stakeholders, plans, and community engagements across the app. Add a market, then add its regions." → <SegmentSettings segments={companyMarkets||{}} onChange={updateCompanyMarkets} segLabel="market" unitLabel="region" />.
• "Sites" — count (companySites||[]).length + " site(s)". Intro: "Where your organization has operations or offices. US sites carry a state (country is set to United States automatically); other sites carry a country. These feed future national, state, and local engagement plans." → <SiteSettings sites={companySites||[]} onChange={updateCompanySites} /> (see below).

=== PANE "issues" (rail "Issues") ===
One setup-section "Issues". count (companyIssues||[]).length + " issue(s)". Intro: "The set of issues the company maps stakeholders against. These appear in every stakeholder's card as suggested pills users can click. Users can also write their own custom issues per stakeholder." → <IssueSettings issues={companyIssues||[]} onChange={updateCompanyIssues} placeholder="Type and add with a comma or pressing Enter" />. PLAIN-trim (no slug transform).

=== PANE "tags" (rail "Tags") ===
One setup-section "Tags". count (companyTags||[]).length + " tag(s)". Intro: "The shared tag vocabulary used across stakeholder lists. These appear as suggested pills on every stakeholder card. Users can still type their own custom tags per stakeholder." → <IssueSettings ... transform={SLUG} placeholder="Type and add with a comma or pressing Enter" />.
TAGS SLUG TRANSFORM (this is the ONLY caller that passes a transform): s.trim().toLowerCase().replace(/\\\\\\\\s+/g,"-").replace(/[^a-z0-9-]/g,"") — i.e. trim, lowercase, collapse whitespace runs (the backslash-s-plus class) to single "-", then strip every char not in [a-z0-9-]. So "Public Affairs!" → "public-affairs". Issues/Goals/Functions/Categories/Segments/Markets are PLAIN-trim only (NOT slugified).

=== PANE "management" (rail "Team Management") ===
TWO sections: Invite Code, then Roles (seg-substack).
• "Invite Code" — Intro: "Share this code with people joining your organization on Stakeholdr. They enter it when creating their account to be added to your team. Regenerate to invalidate the old code." Renders <InviteCode code={appConfig.inviteCode} onRegenerate={(c)=>updateAppConfig({inviteCode:c})} />.
  InviteCode(code, onRegenerate) — display = code || "STKH-7XQ4-9KMP" (placeholder when unset). Shows the code in a <code class="invite-code-value">, then two buttons:
    - "Copy": copy() starts with a GUARD — if (!code) return; — so when appConfig.inviteCode is unset the Copy button is a SILENT NO-OP: the placeholder "STKH-7XQ4-9KMP" is displayed but never copied and the Copied state never shows. Only when a real code exists: navigator.clipboard.writeText(code); sets copied=true; after 1500ms resets. Icon flips "content_copy" → "check"; label flips "Copy" → "Copied" for 1.5s.
    - "Regenerate" — EMAIL-ONLY. It does NOT regenerate anything client-side. It opens a modal (askOpen) titled "Request a new invite code" whose body reads: "To regenerate your organization's invite code, email contact@stakeholdr.com. We'll issue a new code and invalidate the old one." (the email is a mailto link to contact@stakeholdr.com with subject "New invite code request"). Modal footer: a "Close" button and an "Email us" mailto button. CORRECTION to any prior over-claim: the Regenerate button itself performs NO client-side regeneration and does NOT invalidate the code — invalidation happens server-side after the user emails support. onRegenerate is wired but never invoked by this UI.
  UNWIRED IN ORACLE: appConfig.inviteCode is NEVER SEEDED (the app.jsx appConfig seed sets only appName/accent/brand/fiscalStartMonth/fiscalStartDay) and, with onRegenerate never invoked, it stays unset — so in the oracle's actual state the pane always shows the placeholder and Copy always no-ops. No signup or login flow anywhere in archive/src asks for an invite code; the intro copy "They enter it when creating their account" describes the INTENDED backend join flow, not captured client behavior. Keep the intro string verbatim as UI copy. MAKE REAL at backend build: seed/issue a real code (format STKH-XXXX-XXXX), consume it at account creation, invalidate on regenerate — the invite_code column exists in the SQL schema.
  → Canonical UI: ui-button Copy/Regenerate, ui-dialog for the request modal.
• "Roles" (seg-substack) — head count: managers + " manager(s) · " + (filtered.length - managers) + " user(s)". managers = filtered.filter(role==="manager").length. Intro paragraph: "Managers see every workspace, can delete workspaces, manage roles, edit app identity, and access these settings. Users only see workspaces they're a member of and can score / engage stakeholders in those." A search box ("settings-search", a search Icon + input) bound to filter, placeholder "Search by name, title, or email…".
  filtered = users filtered FIRST by u.role !== "system" (the system bot is never listed), THEN by the live query q=filter.toLowerCase(): kept if !q OR name/title/email (each lowercased) includes q.
  A "roles-table": header row (roles-row roles-head) columns "Person" / "Email" / "Role" (Role centered). One row per filtered user (class "roles-row", plus " self" when u.id===currentUser.id):
      - Person cell: Avatar (shared component, size 28) + UserName (size 12).
      - Email cell: u.email (muted 12px).
      - Role cell: a "role-toggle" segmented control of two buttons:
          · "User" button (class "role-toggle-btn", " on" when u.role !== "manager") → onClick updateUserRole(u.id, "member"). DISABLED when u.id===currentUser.id (self-demote guard); disabled title "You can't demote yourself - ask another manager.", enabled title "Make user".
          · "Manager" button (" on" when u.role==="manager") → updateUserRole(u.id, "manager"); shows a ManagerStar size 11 then "Manager".
        NOTE the role VALUE for a non-manager is the string "member"; the UI LABEL is "User". So updateUserRole writes "member" or "manager".
  → Canonical UI: ui-data-table or ui-list rows; the role toggle = a 2-button segmented ui-button group; Avatar is the shared primitive (see shared-primitives box).

=== PANE "contact" (rail "Contact") ===
One setup-section "Contact". Copy (13px, lineHeight 1.6): "Need help with Stakeholdr? Our team can assist with setup, training, onboarding new users, troubleshooting, and feature requests. We typically respond within one business day." Then: "Email us at contact@stakeholdr.com" (a "plain-link" mailto, colored var(--accent)).

=== SHARED LIST EDITOR: IssueSettings ===
IssueSettings(issues, onChange, placeholder, addLabel, transform). ACCEPTED-BUT-UNUSED PARAM: addLabel is destructured in the signature but never read anywhere in the component — a dead param; do NOT invent an add-button-label feature from it. A flat list-of-strings editor used by Issues, Tags (with slug transform), Goals, Functions. State: draft (string). norm(s) = transform ? transform(s) : s.trim().
  Render: an "issue-settings-list" of existing items, each a "tag" span with the text and a "×" remove affordance (onClick removes that item: onChange(issues.filter(i=>i!==v))). Then an "issue-settings-add" containing one input.
  COMMIT BEHAVIORS (all four callers):
    - onChange of the input: if the typed value contains a comma, split on ",", pop the tail; for each leading part run norm(), filter out empties, and for each not already present push it (onChange([...issues, s])); set draft to the tail. TYPING "a, b, c" character by character commits a then b (each comma arrives in its own change event, so the issues prop is fresh each time) and leaves " c" as the live draft.
      ORACLE BUG (RECORD, do NOT replicate): PASTING multi-part text in ONE input event loses all but the LAST part. The forEach builds every onChange([...issues, s]) from the SAME stale issues prop within that single event, and the parent updater replaces the whole array (updateAppConfig({ issues: next })), so successive calls clobber each other — from a single paste of "a, b, c" only "b" survives ("a" is clobbered; " c" becomes the draft). At rebuild, accumulate all the parts into ONE next-array before calling onChange once (or use a functional state update) so a multi-part paste commits every part.
    - Enter key: add() — commit the current draft.
    - onBlur: if draft.trim() is non-empty, add().
  add(): t = norm(draft); if t is empty OR issues.includes(t) → clear draft, do nothing (DUPLICATES are silently rejected, draft cleared); else onChange([...issues, t]); clear draft.
  → Canonical UI: each item = a ui-chip with a remove (trailing close); the input = ui-text-field; together a tag/chip input.

=== SHARED 2-LEVEL EDITOR: SegmentSettings ===
SegmentSettings(segments, onChange, segLabel, unitLabel). ONE component reused for THREE level-pairs, parameterized only by labels:
    - default: segLabel "segment", unitLabel "unit"  (Structure → Segments & Business Units)
    - "category" / "audience type"  (Stakeholders pane)
    - "market" / "region"  (Geography → Markets & Regions)
  Data shape: an object mapping level-1 name → array of level-2 strings. SEG = segLabel||"segment"; UNIT = unitLabel||"unit". State: newSeg (string).
  Render: for each Object.keys(segments): a "segset-seg" block with a "segset-seg-head" (strong = the level-1 name + a ghost "Remove" button titled "Remove {SEG}" → removeSegment deletes that key), and an "issue-settings-list" of its level-2 units (each a "tag" with a "×" → removeUnit) followed by a <UnitAdder onAdd label={UNIT} />.
  Below all blocks, a "segset-add" with one input bound to newSeg, placeholder "New {SEG} name, add with a comma or Enter". COMMIT: Enter ONLY — onKeyDown, if key is Enter → preventDefault → addSegment(). There is no other commit path (no onBlur, no comma parsing).
  COPY-OVER-CLAIM — THE COMMA PROMISE IS FAKE (do NOT silently replicate): the placeholder promises "add with a comma or Enter", but there is NO comma handler anywhere in SegmentSettings or UnitAdder — no onChange comma-splitting exists in either component; only Enter commits. Worse, because addSegment only TRIMS, typing "Foo," and pressing Enter commits the literal level-1 name "Foo," — trailing comma included. This is dead promissory copy, unlike IssueSettings directly above whose comma-commit is real. REBUILD DECISION (make the copy real): implement comma-commit here to match IssueSettings — a typed comma commits the part before it (trimmed, comma stripped, deduped) and clears/continues the draft — for the level-1 adder (and never let a committed name carry a trailing comma). Do not replicate the dead placeholder promise, and do not port the "Foo," artifact.
  addSegment(): t = newSeg.trim(); if empty OR segments[t] already exists → clear, no-op (dedupe); else onChange({...segments, [t]: []}) (new level-1 with empty unit list); clear.
  addUnit(seg, unit): t = unit.trim(); if empty OR (segments[seg]||[]).includes(t) → no-op (dedupe within parent); else onChange({...segments, [seg]: [...(segments[seg]||[]), t]}).
  removeUnit(seg, unit) / removeSegment(seg): immutable add/delete.
  UnitAdder(onAdd, label): a small input ("segset-unit-input"), placeholder "+ {label}", commit on Enter ONLY (onKeyDown Enter → preventDefault → onAdd(value) then clears; no comma handler here either). (Adds one level-2 unit under its parent.)
  → Canonical UI: each level-1 block = a card/section; units = ui-chips with remove; the adders = ui-text-fields.

=== SITES EDITOR: SiteSettings ===
SiteSettings(sites, onChange). D = STAKEHOLDER_DATA. State: city (""), mode ("us"), state (""), country (""). A 4-MODE selector (designed-select) with options: "us" → "United States", "ca" → "Canada", "mx" → "Mexico", "intl" → "Other country". Changing mode clears state and country.
  ADD ROW: a "site-city-input" (placeholder "City", Enter commits), the mode select, then a CONDITIONAL field:
    - mode "intl": a country select, placeholder "Select country…", options = D.COUNTRIES filtered to EXCLUDE "United States","Canada","Mexico". Requires a country pick.
    - mode "us"/"ca"/"mx": a state/province select ("site-state-select"). subList = (mode==="mx" ? D.MX_STATES : mode==="ca" ? D.CA_PROVINCES : D.US_STATES). subPlaceholder = (mode==="ca" ? "Select province…" : "Select state…"). Requires a state/province pick.
  An "Add site" button (plus Icon) calls add().
  add(): c = city.trim(); if !c return. If mode==="intl": require country; site = { id, city:c, country }. Else (us/mx/ca): require state; country DERIVED from mode via { us:"United States", mx:"Mexico", ca:"Canada" }[mode]; site = { id, city:c, state, country }. id = "site-" + Math.random().toString(36).slice(2,8) (a base36 6-char suffix). Append to sites; clear city/state/country.
  EXISTING SITES: an "issue-settings-list" of "tag" chips, each displaying: city + ", " + (s.state ? (D.STATE_ABBR[s.state] || s.state) : s.country) — i.e. "City, ST" for US/CA/MX (state abbreviated via STATE_ABBR, raw state as fallback) or "City, Country" for intl. Each chip has a "×" remove (remove(id) filters by id).
  → Canonical UI: ui-select for mode/state/country, ui-text-field for city, ui-button for Add, ui-chips for the saved sites.

=== INTEGRATIONS (PLANNED 10th pane — FORWARD-DESIGN, NOT in oracle) ===
Not present in archive/src/settings.jsx. Reserved as a future pane to wire third-party connections. No captured fields, options, or behavior — design from scratch with the user. Do NOT port; do NOT fabricate oracle semantics.

=== DESIGN DASHBOARD (Settings → Design) ===
The token-tuning surface that edits --ui-sys-* tokens live (per CLAUDE.md DESIGN START-STATE). It is where the open token decisions (accent hue, shadows) get decided with the user. Distinct from the 9 oracle config panes; the brand/accent/theme controls above feed token values. (The full Design page is captured in its own design box; here note only that Settings hosts it.)

=== appConfig WIRING NOTE (important traceability) ===
SettingsView receives the catalogs as SEPARATE derived props, each paired with its own updater — BUT every updater persists into the ONE appConfig blob. There is no second store: in app.jsx each updater is wired as (next) => updateAppConfig({ key: next }), so the catalogs live as keys INSIDE the single persisted appConfig object. Exact prop → appConfig-key map:
  companyIssues / updateCompanyIssues       → key issues
  companyTags / updateCompanyTags           → key tags
  companyFunctions / updateCompanyFunctions → key functions
  companySegments / updateCompanySegments   → key segments
  companyMarkets / updateCompanyMarkets     → key markets
  companySites / updateCompanySites         → key sites
  companyCategories / updateCompanyCategories → key categories
  companyGoals / updateCompanyGoals         → key orgGoals   (NOTE THE RENAME: the prop is companyGoals but the persisted appConfig key is orgGoals)
The props are DERIVED in app.jsx from cfg = appConfig || {} with seed-catalog fallbacks when the stored key is absent/empty: cfg.issues → D.ISSUES, cfg.tags → D.TAGS, cfg.functions → D.FUNCTIONS, cfg.segments → D.SEGMENTS, cfg.markets → D.MARKETS, cfg.sites → D.SITES, cfg.categories → D.CATEGORIES, cfg.orgGoals → D.ORG_GOALS. Fallback tests: array-shaped catalogs (issues/tags/functions/sites/orgGoals) fall back when the key is missing OR has length 0; object-shaped catalogs (segments/markets/categories) fall back when missing OR Object.keys(...).length is 0. app.jsx then MUTATES the shared module catalog so every other view reading STAKEHOLDER_DATA sees the manager-configured lists (single source of truth): D.CATEGORIES = companyCategories; D.SEGMENTS = companySegments; D.MARKETS = companyMarkets; D.SITES = companySites; D.ORG_GOALS = companyGoals (issues/tags/functions are NOT written back onto D — their consumers receive them as props). Cross-ref the Enterprise state model box, which states the same appConfig key set.
The identity/theme/timezone/fiscal/inviteCode values live on the SAME appConfig blob (keys: appName, brandIcon, brand, accent, theme, autoNightShift, nightShiftAt, timeZone, fiscalStartMonth, fiscalStartDay, inviteCode) and are written by the panes directly via updateAppConfig({...}). updateAppConfig(patch) shallow-merges: setAppConfig(prev => ({...(prev||{}), ...patch})). Roles are the exception — updateUserRole(id, "member"|"manager") writes to the users store, not appConfig. currentUser supplies the self-demote guard and (upstream) the manager gate.

CANONICAL UI: all controls map to ui-* components (ui-text-field, ui-select, ui-switch, ui-button, ui-chip, ui-dialog, ui-data-table/ui-list, ui-nav-rail, ui-icon "science"/"search"/"check", plus the ui-swatch-card GAP defined above — build into design-system/ and register in manifest.json BEFORE first use). NEVER md-*/shadcn. One styling surface = --ui-sys-* tokens; the brand/accent/theme/zone literals captured here become tokens, not inline colors, in the rebuild.

=== SKELETON TREE (Settings — the literal region tree from archive/src/settings.jsx; the build assembles against THIS tree, never prose) ===
Legend: each node = className/element — what it contains — Canonical UI mapping. "layout row/column — token-only container" = pure layout, no visual decision.

TREE 1 — THE TWO-COLUMN SHELL (SettingsView render root):
div.setup-wrap.settings-wrap.single-page.settings-layout — page root inside the app shell's main slot — layout row (rail + panes), token-only container
  aside.settings-nav — the left settings rail — ui-nav-rail / ui-list of selectable items (active state via ink only, never a background swap, per design law)
    button.settings-nav-item (+.active when pane === id) x 9 — the 9 rail labels in oracle order (App Settings · Fiscal Calendar · Stakeholders · Your Structure · Geography · Issues · Tags · Team Management · Contact) — selectable nav items
  div.settings-panes — the right column — layout column (scroll), token-only container
    the ACTIVE pane renders 1–3 div.setup-section blocks; the 2nd+ in a pane carry .seg-substack — EXCEPTION: in the geography pane the FIRST section (Markets & Regions) ALSO carries .seg-substack (BOTH geography sections are seg-substack, matching that pane's own section above). EVERY section opens with div.setup-section-head (h3 + optional muted count span whose number is strong ink-2, tnum) and (all panes except identity) a p.muted intro (12.5px, lineHeight 1.5, maxWidth 720 — EXCEPTION: the contact pane's paragraph is 13px, lineHeight 1.6, maxWidth 640, per the PANE "contact" node below) — section scaffold: token-inked heading (title typeface) + label text

TREE 2 — REPRESENTATIVE PANE (the generic section pattern; panes "stakeholders", "structure", "geography" 1st section, "issues", and "tags" are EXACTLY this shape):
div.setup-section (+.seg-substack when stacked)
  div.setup-section-head — h3 + conditional muted count span — heading row
  p.muted — the pane's intro copy (verbatim strings in the pane sections above) — token-inked paragraph
  EDITOR BODY — IssueSettings (TREE 8) or SegmentSettings (TREE 9) or SiteSettings (TREE 5), per the pane sections above

TREE 3 — PANE "identity" (three stacked sections; the one pane with NO p.muted intro):
Section "Identity" — div.setup-section
  div.setup-section-head > h3 "Identity"
  div.settings-grid — the field grid — layout grid, token-only container
    label.login-field (App name) — span.lbl + input + muted helper span (12.5px) — ui-text-field with supporting text
    div.login-field (Brand icon)
      span.lbl
      div.brand-icon-row — layout row — token-only container
        span.brand-icon-preview (background = appConfig.brand || "#000000") — img (brandIcon) OR Icon "brandmark" class .brand-glyph — token-tinted preview circle (the brand-mark composition)
        label.btn.brand-icon-btn — hidden input[type=file, accept image/*, display none] + "Upload icon"/"Replace icon" — ui-button hosting the file input
        button.btn.btn-ghost.brand-icon-btn (conditional when brandIcon set) — "Remove" — ui-button (text)
      muted helper span
    div.login-field (Brand color (app icon)) AND div.login-field (Accent color) — IDENTICAL shape, each:
      span.lbl
      div (flex row, alignItems center, gap 10) — layout row — token-only container
        span.settings-swatch-preview (background = current value) — token-tinted preview tile
        input[type=text] (width 100, fontSize 12) — ui-text-field (hex entry)
        BeakerColorField — TREE 10
      div.settings-swatch-row — button.settings-swatch (+.active on match, title = hex) x 7 — 7x ui-swatch-card (dot/circle-only variant, per the GAP contract above)
      muted helper span
Section "Theme" — div.setup-section.seg-substack
  div.setup-section-head > h3 "Theme"
  div.settings-grid
    div.login-field (Choose One)
      span.lbl
      div.theme-choices — layout row; role radiogroup in the rebuild — token-only container
        button.theme-swatch (+.active; carries --theme-border custom prop) x 3 — span.theme-circle (background = preview bg) > span.theme-circle-dot (background = preview dot), span.theme-name, span.theme-sub — ui-swatch-card (card variant), the declared GAP component
    div.login-field (Auto-switch to Night Shift)
      span.lbl
      div.theme-auto-row — layout row — token-only container
        div.yesno-toggle (role="group") — button.yesno-opt (+.on) x 2 ("Yes"/"No") — 2-button segmented ui-button group (or ui-switch)
        div.theme-time-group (conditional, only when autoNightShift) — layout row — token-only container
          div.designed-select.theme-time-hr > select (1..12) — ui-select
          div.designed-select.theme-time-min > select ("00"/"30") — ui-select
          div.designed-select.theme-time-ap > select ("AM"/"PM") — ui-select
Section "Time Zone" — div.setup-section.seg-substack
  div.setup-section-head > h3 "Time Zone"
  div.settings-grid
    label.login-field — span.lbl "Record timestamps in" + div.designed-select > select (the 8 zones) + muted helper — ui-select with supporting text
    div (empty) — the second grid column filler — absorbed by the layout grid

TREE 4 — PANE "fiscal":
div.setup-section
  div.setup-section-head > h3 "Fiscal Calendar"
  p.muted intro
  div.settings-grid
    label.login-field (Fiscal year starts)
      span.lbl
      div (flex row, gap 8) — layout row — token-only container
        div.designed-select (flex 1) > select month (January..December → values 1..12) — ui-select
        div.designed-select (width 90) > select day (1..31) — ui-select
      muted helper
    div.login-field (Resulting quarters)
      span.lbl
      QuartersPreview: div.quarters-list — read-only derived list — ui-list of two-column key/value rows
        div.quarter-row x 4 — span.quarter-label ("Q1".."Q4") + span.quarter-range ("Mmm D → Mmm D") — key/value row, range in tnum numerals

TREE 5 — SITES EDITOR (pane "geography", 2nd section body; SiteSettings):
div.site-settings — editor root — layout column, token-only container
  div.issue-settings-list — the saved sites — ui-chip-set
    span.tag (inline-flex, cursor default) x N — "City, ST" (STATE_ABBR) or "City, Country" + button.tag-x "×" (aria-label "Remove {city}") — ui-chip with trailing remove
  div.site-add-row — the add row — layout row, token-only container
    input.site-city-input (placeholder "City"; Enter commits) — ui-text-field
    div.designed-select > select mode (United States / Canada / Mexico / Other country) — ui-select
    EITHER div.designed-select > select country (mode intl; "Select country…") OR div.designed-select.site-state-select > select state/province ("Select state…"/"Select province…") — ui-select (conditional alternate, exactly one renders)
    button.btn — Icon "plus" + "Add site" — ui-button with leading ui-icon

TREE 6 — ROLES TABLE (pane "management", 2nd section body):
div.settings-search — search Icon + input (placeholder "Search by name, title, or email…") — ui-text-field with leading ui-icon "search"
div.roles-table — ui-data-table (or ui-list rows)
  div.roles-row.roles-head — header cells "Person" / "Email" / "Role" (Role centered) — table header row
  div.roles-row (+.self when u.id === currentUser.id) x N — table row
    div.roles-person — Avatar (28) + UserName (12) — cell of shared primitives
    div.muted (fontSize 12) — u.email — token-inked cell text
    div (flex, justifyContent center) — layout cell — token-only container
      div.role-toggle — the segmented pair — 2-button segmented ui-button group
        button.role-toggle-btn (+.on when u.role !== "manager"; disabled for self, with the two title strings above) — "User"
        button.role-toggle-btn (+.on when u.role === "manager") — ManagerStar (11) + "Manager"

TREE 7 — INVITE CODE (pane "management", 1st section body; InviteCode):
div.invite-code — layout column — token-only container
  div.invite-code-display — layout row — token-only container
    code.invite-code-value — the code or placeholder "STKH-7XQ4-9KMP" — token-inked tnum text (RECORD: the oracle used a <code> element; no mono family ships, per type law)
    button.btn — Icon "content_copy"/"check" + "Copy"/"Copied" — ui-button with leading ui-icon
    button.btn — "Regenerate" — ui-button
  CONDITIONAL request modal (askOpen): div.modal-veil.show (onClick closes — scrim dismiss) + div.modal (width 440, maxWidth calc(100% - 32px)) — ui-dialog
    div.modal-head — h2 "Request a new invite code" + button.btn.btn-ghost (Icon "close", aria-label "Close") — headline + ui-icon-button
    div.modal-body — p (13px, lineHeight 1.6) containing an a.plain-link mailto (accent ink, subject "New invite code request") — dialog content
    div.modal-foot — button.btn "Close" + a.btn.btn-primary "Email us" (a mailto ANCHOR styled as the primary button, textDecoration none) — action slot: ui-button + ui-button (filled) rendered as a link

TREE 8 — SHARED FLAT-LIST EDITOR (IssueSettings; body of Issues / Tags / Goals / Functions):
div (unclassed root) — layout column — token-only container (absorbed)
  div.issue-settings-list — span.tag (inline-flex, cursor default) x N — the item text + an "×" REMOVE SPAN (aria-label "Remove {i}"; marginLeft 4, ink-mute, cursor pointer — NOTE: a span, NOT a button, in the oracle) — ui-chip with a REAL trailing remove control in the rebuild (a11y upgrade, recorded here, not silent)
  div.issue-settings-add — input (comma / Enter / blur commit, per the COMMIT BEHAVIORS above) — ui-text-field (chip input)

TREE 9 — SHARED 2-LEVEL EDITOR (SegmentSettings + UnitAdder; body of Categories / Segments / Markets):
div.segset — editor root — layout column, token-only container
  div.segset-seg x (one per level-1 key)
    div.segset-seg-head — strong (the level-1 name) + button.btn.btn-ghost "Remove" (fontSize 12.5, title "Remove {SEG}") — row: token-inked label + ui-button (text)
    div.issue-settings-list — span.tag x N (unit text + button.tag-x "×", aria-label "Remove {u}") + input.segset-unit-input (UnitAdder; placeholder "+ {UNIT}"; Enter-only commit) — ui-chip-set + inline ui-text-field adder
  div.segset-add — input bound to newSeg (placeholder "New {SEG} name, add with a comma or Enter"; Enter-only commit — the fake-comma-promise correction above stands) — ui-text-field

TREE 10 — BeakerColorField:
span.beaker-color (CSS color = value; title "Pick a custom color") — span.material-symbols-outlined.msym.beaker-glyph with ligature "science" + an overlaid hidden input[type=color] — ui-icon "science" tinted to the current value hosting the native color input (or a ui-color-field GAP if built)

PANE "contact" — div.setup-section > div.setup-section-head > h3 "Contact"; then p.muted (13px, lineHeight 1.6, maxWidth 640) support copy + p (13px, marginTop 12) "Email us at" with a.plain-link mailto in accent ink — token-inked text + link.

CLASSNAME ACCOUNTING: every className region in settings.jsx appears above (setup-wrap, settings-wrap, single-page, settings-layout, settings-nav, settings-nav-item, active, settings-panes, setup-section, setup-section-head, seg-substack, settings-grid, login-field, lbl, muted, brand-icon-row, brand-icon-preview, brand-glyph, btn, brand-icon-btn, btn-ghost, settings-swatch-preview, settings-swatch-row, settings-swatch, theme-choices, theme-swatch, theme-circle, theme-circle-dot, theme-name, theme-sub, theme-auto-row, yesno-toggle, yesno-opt, theme-time-group, designed-select, theme-time-hr, theme-time-min, theme-time-ap, settings-search, roles-table, roles-row, roles-head, self, roles-person, role-toggle, role-toggle-btn, quarters-list, quarter-row, quarter-label, quarter-range, plain-link, beaker-color, material-symbols-outlined, msym, beaker-glyph, site-settings, issue-settings-list, tag, tag-x, site-add-row, site-city-input, site-state-select, invite-code, invite-code-display, invite-code-value, modal-veil, show, modal, modal-head, modal-body, modal-foot, segset, segset-seg, segset-seg-head, segset-add, segset-unit-input, issue-settings-add). None silently dropped.

=== UX HANDLER CENSUS (archive/src/settings.jsx — every event handler in the module) ===
DOM-level JSX handlers, 43 total:
SettingsView (20): 1 settings-nav-item onClick (setPane — one attribute mapped over the 9 rail buttons) · 2 App-name input onChange (updateAppConfig appName) · 3 brand-icon file input onChange (onPickBrandIcon → FileReader.readAsDataURL → updateAppConfig brandIcon) · 4 brand-icon "Remove" onClick (brandIcon: null) · 5 brand hex text input onChange · 6 brand swatch onClick (one attribute over the 7 swatches) · 7 accent hex text input onChange · 8 accent swatch onClick (x7) · 9 theme-swatch onClick (x3 → theme: id) · 10 "Yes" onClick (autoNightShift: true) · 11 "No" onClick (autoNightShift: false) · 12 hour select onChange (→ compose) · 13 minute select onChange (→ compose) · 14 AM/PM select onChange (→ compose) · 15 timeZone select onChange · 16 fiscalStartMonth select onChange (Number()) · 17 fiscalStartDay select onChange (Number()) · 18 roles filter input onChange · 19 "User" role button onClick (updateUserRole(id, "member"); disabled for self) · 20 "Manager" role button onClick (updateUserRole(id, "manager")).
BeakerColorField (1): 21 input[type=color] onChange → onChange(e.target.value) (the component is instantiated twice — brand and accent — one DOM handler in its definition).
SiteSettings (7): 22 saved-site tag-x onClick (remove by id) · 23 city input onChange · 24 city input onKeyDown (Enter → preventDefault → add() — the city field commits on Enter in ADDITION to the Add button) · 25 mode select onChange (sets mode AND clears state + country) · 26 country select onChange (intl mode only) · 27 state/province select onChange (us/ca/mx modes only) · 28 "Add site" onClick (add()).
InviteCode (5): 29 "Copy" onClick (guarded silent no-op when code unset; clipboard.writeText; copied flag resets after 1500ms) · 30 "Regenerate" onClick (setAskOpen(true) — opens the request modal; performs NO regeneration) · 31 request-modal veil onClick (setAskOpen(false) — scrim click dismisses) · 32 request-modal head close onClick (setAskOpen(false)) · 33 request-modal footer "Close" onClick (setAskOpen(false)). The "Email us" action is a plain mailto anchor — no JS handler.
SegmentSettings (4): 34 level-1 "Remove" onClick (removeSegment) · 35 unit tag-x onClick (removeUnit) · 36 newSeg input onChange · 37 newSeg input onKeyDown (Enter-only commit).
UnitAdder (2): 38 input onChange · 39 input onKeyDown (Enter → preventDefault → onAdd(v), clear).
IssueSettings (4): 40 item "×" span onClick (remove) · 41 input onChange (the comma-split commit path, incl. the recorded paste-clobber bug) · 42 input onKeyDown (Enter → add()) · 43 input onBlur (commits a non-empty draft).
Non-JSX: FileReader reader.onload (the continuation of handler 3); the Copy button's setTimeout(1500) copied-state reset. Internal callback-prop chains (DOM ends already counted): SegmentSettings onChange (3 callers), IssueSettings onChange (4 callers), SiteSettings onChange (1), BeakerColorField onChange (2), InviteCode onRegenerate (wired but NEVER invoked, per the Regenerate correction above).
43 handlers, all accounted. Census additions now explicit (previously implicit in the box): the invite-request modal dismisses THREE ways — veil/scrim click (31), head close (32), footer "Close" (33); the SiteSettings city input's own Enter commit (24); and the IssueSettings remove affordance being a bare span (rebuild as the ui-chip's real remove control — recorded a11y upgrade). No tree or census finding disproves any statement in the box.` },
                        { t: "Users & People — user model, roles, presence, avatars/stack/profile, removeUser cascade", done: true, d:
`USERS & PEOPLE (users.jsx) — the user model and its presentation surfaces: avatars, presence, the user stack + people popup, profile menu, login gate, edit-profile, manager badges, and (cross-referenced) the removeUser cascade.

=== USER MODEL ===
A user object: { id, name, title, email, avatarColor, avatarUrl (dataURL or null), presence, role, createdAt, updatedAt }, plus optional profile fields { firstName, lastName, function, markets[], regions[] }.
  • role ∈ { "manager", "member", "system" }. "member" is the default user (UI label "User"); "manager" has elevated rights; "system" is the notification bot.
  • presence ∈ { "online", "away", "offline" }. New users default presence "online".
  • The SYSTEM bot has id "u-system", name "Reminders", role "system". It NEVER appears in pickers, online lists, the user stack, the people popup, or the Roles table — every such surface filters out u.role==="system" (e.g. UserStack/UserListPopup filter to u.id !== currentUserId AND u.role !== "system"; MultiOwnerPicker filters role!=="system"; Settings Roles filters role!=="system").

=== Avatar (computed sizing — reference the SHARED Avatar; full spec in shared-primitives box) ===
Avatar(user, size=28, ring=false, online=false, onClick, title). Returns null if no user. initials = abbrev(user.name).
  FONT-SIZE BUCKETS by size: size <= 22 → 9; else <= 30 → 10.5; else <= 40 → 13; else 16.
  Avatar text color: "#FAF8F2" (always; the initials/letter color on the colored circle).
  Background: if user.avatarUrl set → "center / cover no-repeat url(avatarUrl)" (a cover image); else user.avatarColor (the solid swatch color).
  ONLINE DOT (rendered only when online prop true): a "av-presence" span.
    - dotSize = max(6, round(size * 0.28)).
    - right = max(1, round(size * 0.06)); bottom = max(1, round(size * 0.06)) (tucked into the lower-right quadrant, fully inside the circle).
    - borderWidth = max(1, round(size * 0.05)).
  cursor: pointer when onClick provided, else default. title = title prop || "{user.name} · {user.title}".
  (The shared-primitives box owns the full Avatar/UserAutocomplete/MultiOwnerPicker/OwnersDisplay/ConfirmDialog capture. UserStack and UserListPopup are NOT specified there — their FULL spec lives HERE, in the next two sections.)

=== UserStack (the overlapping avatar row in the top bar) — FULL SPEC ===
UserStack(users, currentUserId, max=3, onClick, size=28).
  others = users filtered to u.id !== currentUserId AND u.role !== "system" (you never see yourself or the bot in the stack).
  visible = others.slice(0, max) — the FIRST max (default 3) others, in array order.
  overflow = Math.max(0, others.length − max).
  Renders a span class "user-stack" with role="button", onClick = the onClick prop, and title "People in this workspace" (the hover tooltip).
  Each visible user renders as Avatar(user, size, ring=true) — the ring separates the overlapping circles.
  When overflow > 0, an extra span class "av av-more" is appended: width/height = size; fontSize = (size <= 22 ? 9 : 11); content = "+" + overflow (e.g. "+4").
  Clicking the stack opens the UserListPopup (wired by the caller via onClick).

=== UserListPopup (the right-edge people panel) — FULL SPEC ===
UserListPopup(open, onClose, users, currentUserId, onMessage).
  others = users filtered to u.id !== currentUserId AND u.role !== "system" (same filter as UserStack).
  STRUCTURE (always mounted; visibility toggles via the " show" class):
  - A div class "side-veil" (+ " show" when open); clicking the veil calls onClose (scrim dismissal).
  - An aside class "side-popup" (+ " show" when open) — the sliding right-edge panel.
  - HEAD (div "side-popup-head"): a strong element with the text "People · {others.length}" (the middle dot is the · character), plus a close button (class "btn btn-ghost", aria-label "Close", Icon "close") calling onClose.
  - BODY (div "side-popup-body"): ONE div class "user-row" per user in others:
    • Avatar(user, size=36, online = (u.presence === "online")) — the 36px avatar with the live presence dot.
    • A div "user-row-meta" holding div "user-row-name" = u.name and div "user-row-title" = u.title.
    • A trailing button class "btn btn-ghost user-row-msg" with title "Send message" and Icon "message"; clicking calls onMessage(u.id) (opens/starts a direct conversation with that user — wired to the messaging surface by the caller).

=== LOGIN (LoginView) ===
Reads persisted appConfig for the brand mark before anyone signs in: loginBrand = { brand: cfg.brand || "#024AD8", brandIcon: cfg.brandIcon || null } (Store.load("appConfig", null), try/catch-guarded; fallback { brand "#024AD8", brandIcon null }). LOGIN DEFAULT BRAND COLOR = "#024AD8" (fallback when no appConfig).
  SHELL STRUCTURE: div "login-shell" > a decorative div "login-bg-grid" (the backdrop grid pattern) + div "login-card" (the centered card holding everything below).
  BRAND BLOCK (div "login-brand"): a div "brand-mark" — when loginBrand.brandIcon is set it gets inline style background = loginBrand.brand and color "#FAF8F2" and contains an img class "brand-mark-img" (src = brandIcon, alt "App icon"); when NOT set it contains Icon "brandmark" class "brand-glyph" (no inline style). Beside it: div "login-app-name" with the text "HP's Map" and a muted subline (fontSize 11, marginTop 2) "Stakeholder mapping & engagement".
  ⚠ HARDCODED-NAME NOTE (do-not-replicate decision): the oracle HARDCODES "HP's Map" in login-app-name and in the submit button — it does NOT read cfg.appName, even though the Settings box's appName helper text promises the app name shows on the login screen. At rebuild, BIND both strings to appConfig.appName (make the Settings promise real); the hardcoded literal is the poorly-coded original, not the design intent.
  HEADINGS: h1 class "login-h1" = "Sign in"; p class "login-sub" = "Tell us who you are to get started."
  Fields: name, title, email, photo (dataURL), color (default "#B5552C"). valid = name.trim() && email.trim() && /@/.test(email) (email must merely CONTAIN "@").
  FIELD LABELS + PLACEHOLDERS (each a label "login-field" with span "lbl" + input, in order):
  - "Full name" — placeholder "Jordan Kim", autoFocus (focused on mount).
  - "Title" — placeholder "Director, GA&PP North America".
  - "Work email" — input type="email", placeholder "jordan.kim@hp.com".
  - "Profile photo (optional)" — the avatar row below.
  THE 8-COLOR PALETTE (avatar color choices, shared by Login AND EditProfile): ["#B5552C","#D26A6A","#3E7A2E","#4F3F69","#2A6FDB","#B07E1F","#682E45","#5A8F8F"]. DEFAULT avatar color = "#B5552C" (the first). Swatches shown only when no photo uploaded; each is a button "login-swatch" (+ " active" when selected), aria-label "Pick color {hex}".
  Photo upload: a label styled as a button (class "btn") wrapping a hidden file input accept image/* → FileReader.readAsDataURL → setPhoto(dataURL). BUTTON LABEL TOGGLES: "Upload photo" when no photo, "Replace photo" when one is set. When a photo IS set, a ghost button "Remove" (btn btn-ghost) appears below it and clears the photo. A live preview circle (span "av login-av-preview", color "#FAF8F2") shows the photo (center/cover) or the chosen color with abbrev(name) (or "··" before a name is typed).
  SUBMIT BUTTON: type submit, class "btn btn-primary login-submit", label "Enter HP's Map →" (the trailing arrow is part of the label), disabled when !valid. (Same hardcoded-name note as above — rebind to appConfig.appName at rebuild.)
  submit() builds a new user: {
    id: uid("u"),
    name: name.trim(),
    title: title.trim() || "Team member",   // DEFAULT title when blank
    email: email.trim(),
    avatarColor: color,
    avatarUrl: photo,
    presence: "online",                       // new users start online
    createdAt: nowStamp(), updatedAt: nowStamp()
  } and calls onLogin(u).
  DEMO ACCOUNTS (div "login-sample"): a muted 11px label "Or continue as one of the demo accounts:" above a row (div "login-sample-row") of chips = STAKEHOLDER_DATA.USERS.slice(0,5) (the first 5 seeded users), each a button "login-sample-chip" with an Avatar (size 24) + the user's first name (u.name.split(" ")[0]); clicking → onLogin(u) directly.
  → Canonical UI: ui-text-field (name/title/email), ui-button (upload/submit), the 8 swatches as small color ui-buttons, demo chips as ui-chip; brand mark uses the app icon; the login-bg-grid backdrop and login-card become tokened surfaces (surface-card on runway).

=== ProfileMenu ===
ProfileMenu(open, anchor, user, onClose, onEditProfile, onMessages, onSettings, onLogOut, isManager). Header: Avatar size 46 + name (500/14px) + title + email + (if isManager) a ManagerBadge.
  TITLE SPLIT: if the title CONTAINS a comma AND title.length > 24, split at the FIRST comma into TWO muted lines: t.slice(0, i).trim() and t.slice(i+1).trim(). Otherwise render the title as a single muted line.
  Items (each "profile-menu-item"), in order: "View profile" (Icon "user") → onEditProfile; "Messages" (Icon "message") → onMessages; "Settings" (Icon "build") → onSettings — RENDERED ONLY when isManager (managers only); divider; "Log out" (Icon "logout", class "logout") → onLogOut.
  → Canonical UI: a ui-menu anchored to the avatar; items = ui-list/menu items with ui-icon leading glyphs.

=== EditProfileModal ===
EditProfileModal(open, user, onClose, onSave, companyFunctions). draft = user (reset on user change). Returns null if !open || !user.
  CHROME (verbatim): a modal-veil (show) + modal; head = h2 "Edit profile" + close button (btn btn-ghost, aria-label "Close", Icon "close"); foot = button "Cancel" (btn, → onClose) + button "Save profile" (btn btn-primary, runs the SAVE merge below).
  Fields: photo (file → FileReader dataURL → draft.avatarUrl) with the SAME 8-color palette fallback (swatches shown only when no avatarUrl, each toggles draft.avatarColor); the photo button label toggles "Replace photo" (when avatarUrl set) / "Upload photo" (when not), and a ghost "Remove" button (btn btn-ghost, sets avatarUrl null) appears ONLY when avatarUrl is set; first name / last name (2-col row); title; work email; Function; Markets; Regions.
  FIRST/LAST fallback: firstName defaults to (name.split(" ")[0]); lastName defaults to (name.split(" ").slice(1).join(" ")) when the explicit field is null.
  Function: a select, placeholder "Select a function…", options = companyFunctions (the Individual Functions catalog from Settings). value draft.function.
  Markets: chips ("filter-chip", " on" when selected) from Object.keys(STAKEHOLDER_DATA.MARKETS); toggling adds/removes the market in draft.markets.
  ⚠ STALE-REGIONS BUG (replicate-or-fix decision): when a market is toggled OFF, the oracle does NOT prune that market's regions from draft.regions — its prune expression is DEAD CODE, a filter whose ternary is always true: (d.regions || []).filter(r => (cur.includes(m) ? true : true)). So regions belonging to deselected markets silently SURVIVE the save (their chips vanish from the picker, but the values persist in user.regions and still render as tags on the profile page's Regions cell). RECOMMENDED at rebuild: PRUNE the regions of a deselected market on toggle-off (a deliberate correction of the poorly-coded original — flag it as such in the build); if strict fidelity is chosen instead, the no-op must be replicated knowingly.
  Regions: a chips block that appears ONLY when draft.markets has >= 1 selected. Options = draft.markets.flatMap(m => STAKEHOLDER_DATA.MARKETS[m] || []) — i.e. the union of the regions belonging to the SELECTED markets. This is the MARKET → REGION CASCADE: pick markets first, then their regions become selectable. Toggling adds/removes in draft.regions.
  SAVE ("Save profile"): fn = explicit firstName or split-of-name[0]; ln = explicit lastName or rest-of-name; merged = {...draft, firstName: fn, lastName: ln, name: [fn, ln].filter(Boolean).join(" ").trim() || draft.name} — i.e. NAME IS RECOMPOSED from first+last on save. onSave(merged); onClose.
  → Canonical UI: ui-dialog (title "Edit profile", footer Cancel / Save profile), ui-text-field (names/title/email), ui-select (Function), ui-chip toggles (Markets/Regions), ui-button (upload/save). 8 swatches as color ui-buttons.

=== ManagerStar / ManagerBadge / UserName ===
ManagerStar(size=12, title): a filled Material Symbol "star". CSS: fontSize = size + 4; color "#E0A21A" (amber); fontVariationSettings "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" (FILLED, weight 500). aria-label/title "Manager". FLAG #E0A21A → a manager/amber token in the rebuild. → ui-icon "star" filled, amber token, size+4.
ManagerBadge(): a "manager-badge" pill = ManagerStar(size 10) + "Manager". → a ui-chip with leading star icon.
UserName(user, size=12): CURRENTLY renders ONLY user.name (a plain span; the size prop is accepted but unused; no star is appended here). Note this for fidelity — the star appears via ManagerStar/ManagerBadge elsewhere, not inside UserName.

=== ROLES / PRESENCE ENUMS (canonical) ===
role: "manager" | "member" | "system" (member = UI "User"). presence: "online" | "away" | "offline". The system bot u-system "Reminders" is excluded from every picker, online list, stack, and roles table.

=== removeUser CASCADE (TRACEABILITY) ===
The removeUser cascade (what happens to owned workspaces, stakeholder assignments, messages, etc. when a user is deleted) lives in app.jsx, NOT in users.jsx. users.jsx contains no removeUser. The cascade itself is captured in the App-shell box; this box flags the cross-reference so a cold-session reader looks in app.jsx for the deletion logic.

CANONICAL UI: every user-facing surface here maps to ui-* (ui-menu, ui-dialog, ui-text-field, ui-select, ui-chip, ui-icon, ui-button). NEVER md-*/shadcn. The amber manager color (#E0A21A) and avatar text color (#FAF8F2) become tokens. UserStack → ui-avatar-stack (overlap + "+N" overflow — GAP registered in the shared-primitives build-map); UserListPopup → ui-sheet (right-edge side panel with scrim) hosting ui-list rows (36px avatar + name + title) each with a trailing ui-icon-button "message" action. Other shared primitives (Avatar, UserAutocomplete, MultiOwnerPicker, OwnerPicker, ConfirmDialog, OwnersDisplay, FilterSection, SortFieldList) are fully specified in the shared-primitives box and referenced here by name — UserStack and UserListPopup are fully specified HERE.

══ SKELETON TREE (ORIGINAL-DESIGN CENSUS, sweep b — the literal region trees extracted from archive/src/users.jsx; the build assembles against THESE trees, never prose) ══
Legend: one node per line; indentation (". ") = nesting; "?" = conditional render; classes are the oracle classNames — every className region in users.jsx appears below or is explicitly absorbed; "→" = Canonical UI mapping. RULED corrections (SHELL DESIGN RULINGS 2026-07-02) are recorded beside the old nodes.

AVATAR (micro-tree; composed by every surface below) — span.av (+.av-ring when ring) [inline: width/height = size; background = photo cover or avatarColor; color #FAF8F2; fontSize bucket; cursor pointer only when onClick] > initials text (when no avatarUrl) + ? span.av-presence (when online) [inline dot geometry per the formulas above] → ui-avatar (a real manifest-registered component per ruling #3; sizes from --ui-sys-avatar-size-*)
USERSTACK (micro-tree) — span.user-stack (role="button", title "People in this workspace", onClick) > Avatar × visible (ring) + ? span.av.av-more "+{overflow}" → ui-avatar-stack (GAP, registered in the shared-primitives build-map)

LOGINVIEW — the full-page gate (the ONLY mount when signed out) → assembled from ui-* on tokened surfaces
div.login-shell (full-viewport runway)
. div.login-bg-grid (decorative backdrop layer; empty element)
. div.login-card (the centered card) → surface-card
. . div.login-brand
. . . div.brand-mark (? inline background = loginBrand.brand + color #FAF8F2 ONLY when brandIcon set) > ? img.brand-mark-img (alt "App icon") | ? Icon "brandmark" .brand-glyph — RULED (#4): the Sr monogram replaces the icon fallback (S + italic r, title typeface, field color = title ink, both --ui-sys-on-surface)
. . . div (unclassed wrapper)
. . . . div.login-app-name "HP's Map" — HARDCODED (rebind to appConfig.appName per the flag above)
. . . . div.muted "Stakeholder mapping & engagement" (fontSize 11, marginTop 2)
. . h1.login-h1 "Sign in"
. . p.login-sub "Tell us who you are to get started."
. . form.login-form (onSubmit = submit)
. . . label.login-field > span.lbl "Full name" + input (placeholder "Jordan Kim", autoFocus) → ui-text-field
. . . label.login-field > span.lbl "Title" + input (placeholder "Director, GA&PP North America") → ui-text-field
. . . label.login-field > span.lbl "Work email" + input type=email (placeholder "jordan.kim@hp.com") → ui-text-field
. . . div.login-field > span.lbl "Profile photo (optional)"
. . . . div.login-avatar-row
. . . . . span.av.login-av-preview [inline background = photo cover | chosen color; color #FAF8F2] > abbrev(name) or "··" (no photo) — the live preview circle
. . . . . div (unclassed; flex column, gap 6)
. . . . . . label.btn > input type=file accept image/* (display:none) + text "Upload photo" | "Replace photo" → ui-button
. . . . . . ? button.btn.btn-ghost "Remove" (only when photo set)
. . . . . . ? div.login-color-row (only when NO photo) > 8 × button.login-swatch (+.active on selected) [inline background = swatch hex; aria-label "Pick color {hex}"] → small color ui-buttons
. . . button type=submit .btn.btn-primary.login-submit "Enter HP's Map →" (disabled when !valid) — HARDCODED name, rebind
. . div.login-sample
. . . span.muted "Or continue as one of the demo accounts:" (fontSize 11)
. . . div.login-sample-row > 5 × button.login-sample-chip (first 5 seeded users) > Avatar 24 + first name → ui-chip

PROFILEMENU — anchored popover (returns null unless open; renders INSIDE div.profile-button in the brand bar) → ui-menu. RULED (#3): at rebuild it anchors to the identity avatar pinned BOTTOM-LEFT of the ui-sidebar (the ONE identity surface); old anchor = top-right of the brand bar.
div.profile-menu (onClick stopPropagation — census #6)
. div.profile-menu-head
. . Avatar 46
. . div (unclassed; minWidth 0, flex 1)
. . . div name (weight 500, fontSize 14, nowrap)
. . . title — ONE div.muted line (fontSize 12, nowrap), OR TWO div.muted lines when the title contains "," AND length > 24 (split at the FIRST comma, both halves trimmed)
. . . div.muted email (fontSize 12, nowrap)
. . . ? ManagerBadge (when isManager) — span.manager-badge > ManagerStar (span.material-symbols-outlined.msym.mgr-star, ligature "star", amber #E0A21A, FILL 1) + "Manager" → ui-chip with leading filled star ui-icon
. div.profile-menu-divider → ui-divider
. button.profile-menu-item "View profile" (Icon user)
. button.profile-menu-item "Messages" (Icon message)
. ? button.profile-menu-item "Settings" (Icon build; rendered ONLY when isManager)
. div.profile-menu-divider
. button.profile-menu-item.logout "Log out" (Icon logout)

EDITPROFILEMODAL — (returns null unless open && user) → ui-dialog (title "Edit profile", footer Cancel / Save profile)
Fragment
. div.modal-veil.show (onClick onClose — scrim cancel, census #19)
. div.modal
. . div.modal-head > h2 "Edit profile" + button.btn.btn-ghost (aria-label "Close", Icon close)
. . div.modal-body
. . . div.login-avatar-row (marginBottom 12) — SAME anatomy as the login photo row: span.av.login-av-preview [draft photo | draft.avatarColor] + div (unclassed column) > label.btn (hidden file input; "Replace photo" | "Upload photo") + ? button.btn.btn-ghost "Remove" (only when avatarUrl set) + ? div.login-color-row (only when NO avatarUrl) > 8 × button.login-swatch (+.active)
. . . div.sh-form-row.sh-form-row-2 (two-column row)
. . . . label.login-field > span.lbl "First name" + input (fallback = name split, per the FIRST/LAST rule above)
. . . . label.login-field > span.lbl "Last name" + input
. . . label.login-field > span.lbl "Title" + input
. . . label.login-field > span.lbl "Work email" + input
. . . label.login-field > span.lbl "Function" > div.designed-select > select (placeholder option "Select a function…" + companyFunctions) → ui-select
. . . div.login-field > span.lbl "Markets" > div.profile-chip-pick > button.filter-chip (+.on when selected) per Object.keys(MARKETS) → ui-chip toggles
. . . ? div.login-field "Regions" (ONLY when draft.markets has >= 1) > div.profile-chip-pick > button.filter-chip (+.on) per region of the SELECTED markets (the MARKET → REGION CASCADE; carries the STALE-REGIONS BUG above)
. . div.modal-foot > button.btn "Cancel" + button.btn.btn-primary "Save profile" (the SAVE merge — name recomposition)

USERLISTPOPUP — the right-edge people panel (ALWAYS mounted; the " show" class toggles both nodes) → ui-sheet (right) with scrim, hosting ui-list rows
Fragment
. div.side-veil (+.show when open) (onClick onClose)
. aside.side-popup (+.show when open)
. . div.side-popup-head > strong "People · {others.length}" + button.btn.btn-ghost (aria-label "Close", Icon close)
. . div.side-popup-body > div.user-row per other user (currentUser + system bot excluded)
. . . Avatar 36 (online = presence === "online")
. . . div.user-row-meta > div.user-row-name (u.name) + div.user-row-title (u.title)
. . . button.btn.btn-ghost.user-row-msg (title "Send message", Icon message .ico; onClick onMessage(u.id)) → trailing ui-icon-button

CLASSNAME ACCOUNTING — users.jsx classNames appearing in the trees above: av · av-ring · av-presence · user-stack · av-more · side-veil · show · side-popup · side-popup-head · side-popup-body · user-row · user-row-meta · user-row-name · user-row-title · user-row-msg · profile-menu · profile-menu-head · profile-menu-divider · profile-menu-item · logout · muted · login-shell · login-bg-grid · login-card · login-brand · brand-mark · brand-mark-img · brand-glyph · login-app-name · login-h1 · login-sub · login-form · login-field · lbl · login-avatar-row · login-av-preview · login-color-row · login-swatch · active · login-submit · login-sample · login-sample-row · login-sample-chip · btn · btn-ghost · btn-primary · ico · material-symbols-outlined · msym · mgr-star · manager-badge · modal-veil · modal · modal-head · modal-body · modal-foot · sh-form-row · sh-form-row-2 · designed-select · profile-chip-pick · filter-chip · on. EXPLICITLY ABSORBED by the shared-primitives box (their trees live there; also in users.jsx): ws-owner-control (OwnerPicker) · user-autocomplete, ua-clear, ua-clear-icon, ua-menu, ua-empty, ua-row, hover, ua-row-name, ua-row-title (UserAutocomplete) · multi-owner, multi-owner-stack, multi-owner-av, confirm, multi-owner-remove, multi-owner-add, multi-owner-picker (MultiOwnerPicker) · confirm-modal (ConfirmDialog) · owners-display, owners-popover, owners-popover-head, owners-popover-row (OwnersDisplay). NONE silently dropped.

══ UX HANDLER CENSUS (ORIGINAL-DESIGN CENSUS, sweep c — EVERY event handler in archive/src/users.jsx: 50 total = 47 JSX handlers + 3 document listeners) ══
Avatar — #1 root span onClick (optional passthrough; cursor becomes pointer only when provided).
UserStack — #2 root span onClick (the caller opens UserListPopup).
UserListPopup — #3 side-veil onClick → onClose · #4 head close onClick → onClose · #5 user-row-msg onClick → onMessage(u.id).
ProfileMenu — #6 root div onClick → e.stopPropagation() [APPENDED DETAIL: the menu renders INSIDE .profile-button whose own onClick toggles profileMenuOpen — without the stop, clicking anywhere in the menu would ALSO re-toggle via the parent. ALSO NOTED: the onClose and anchor props are ACCEPTED BUT NEVER USED inside ProfileMenu — dismissal is the shell's document-mousedown listener, and item-driven closing happens in the shell's wrapped callbacks] · #7 "View profile" onClick → onEditProfile · #8 "Messages" onClick → onMessages · #9 "Settings" onClick → onSettings · #10 "Log out" onClick → onLogOut.
LoginView — #11 form onSubmit → submit(e) [APPENDED DETAIL: e?.preventDefault(); early-return unless valid; builds the new-user object and calls onLogin — pressing Enter in any field submits via this form handler; the submit button is type=submit with no onClick of its own] · #12 name input onChange → setName · #13 title input onChange → setTitle · #14 email input onChange → setEmail · #15 hidden file input onChange → onPickPhoto (FileReader → dataURL → setPhoto) · #16 "Remove" onClick → setPhoto(null) · #17 login-swatch onClick → setColor(c) · #18 login-sample-chip onClick → onLogin(u) (demo account; bypasses the form entirely).
EditProfileModal — #19 modal-veil onClick → onClose [APPENDED DETAIL: scrim click cancels the edit — previously only implicit in the chrome description] · #20 head close onClick → onClose · #21 hidden file input onChange → onPickPhoto → draft.avatarUrl · #22 "Remove" onClick → draft.avatarUrl = null · #23 login-swatch onClick → draft.avatarColor = c · #24 first-name input onChange → draft.firstName · #25 last-name input onChange → draft.lastName · #26 title input onChange → draft.title · #27 email input onChange → draft.email · #28 Function select onChange → draft.function · #29 Markets filter-chip onClick → toggle the market in draft.markets (this handler carries the dead-code regions filter — the STALE-REGIONS BUG above) · #30 Regions filter-chip onClick → toggle the region in draft.regions · #31 foot "Cancel" onClick → onClose · #32 foot "Save profile" onClick → the SAVE merge (fn/ln fallbacks, NAME RECOMPOSED) + onSave(merged) + onClose.
UserAutocomplete [handlers owned by the shared-primitives box; censused here for file completeness] — #33 document mousedown → close on outside click · #34 input onChange → set query + open + hoverIdx 0 · #35 input onFocus → clear query + open · #36 input onKeyDown → ArrowDown/ArrowUp move hoverIdx (clamped), Enter picks matches[hoverIdx], Escape closes · #37 ua-clear onClick → clear() (onChange(null)) · #38 ua-row onMouseDown → preventDefault + pick(u) (mousedown so the pick lands before the input blurs) · #39 ua-row onMouseEnter → setHoverIdx(i).
MultiOwnerPicker [shared-primitives box] — #40 document mousedown → outside click resets adding + confirmRemove · #41 owner-avatar span onClick → first click ARMS confirmRemove(oid), second click removes · #42 owner-avatar span onMouseLeave → disarm confirm · #43 multi-owner-add "+" onClick → toggle the add autocomplete.
ConfirmDialog [shared-primitives box] — #44 modal-veil onClick → onCancel · #45 "Cancel" onClick → onCancel · #46 confirm button onClick → onConfirm.
OwnersDisplay [shared-primitives box] — #47 document mousedown → close the popover on outside click · #48 root span onClick → stopPropagation + toggle open · #49 root onMouseEnter → open · #50 root onMouseLeave → close.
(ManagerStar, ManagerBadge, UserName, OwnerPicker define NO handlers of their own.)
COUNT: 50 handlers, ALL ACCOUNTED — every interaction was already described in this box or in the shared-primitives box, except three micro-details appended by this census: the ProfileMenu root stopPropagation plus its unused onClose/anchor props (#6), the EditProfileModal scrim-click cancel (#19), and the explicit Enter-to-submit note on the login form (#11). No tree or handler finding disproves any statement in this box; no corrections required.` },
                  { t: "User profile page (record.user) — hero, tabs, assignment logic", done: true, d:
`ProfilePage (archive/src/profile-page.jsx) is the full-page record surface for ONE user (record.user), rendered as a class "single-page". It shows who the person is plus everything assigned to them across four entity classes, each in its own tab with a live count, searchable/filterable/sortable.

PROPS: user (subject), isSelf (bool — is this the logged-in user viewing themselves), currentUser (ACCEPTED BUT UNUSED — destructured but never read anywhere in ProfilePage; a dead prop, do not hunt for or invent wiring), users, workspaces, plans, community, stakeholders, scores, team, stakeholderWorkspaces (map stakeholderId -> [workspaceId]), getWorkspacesForStakeholder (ACCEPTED BUT UNUSED — dead prop, same rule; the page derives workspace coverage itself via wsMarketsRegions over stakeholderWorkspaces), onEdit, onOpenWorkspace, onOpenPlan, onOpenCommunity, onOpenStakeholder. D = STAKEHOLDER_DATA. If no user, render null.

LOCAL STATE: tab (init "ws"); q (search string, init ""); sort ({key:null, dir:"asc"}); filters ({} — map colKey -> Set of active values); sortOpen (bool); filterOpen (bool).

CONSTANT PLAN_STAGE_FG (status text colors, used in the Status column):
- "Idea" -> #54524A
- "Proposed" -> #6E5419
- "Under Review" -> #6e5419
- "Active" -> #2f5a26
- "Complete" -> #2E3F66
Fallback for any unmapped status: var(--ink-2).

HELPERS:
- wsName(id) = (workspaces.find(w => w.id === id) || {}).name || "-".
- wsMarketsRegions(wid): iterate all stakeholders; for each whose (stakeholderWorkspaces[s.id]||[]) includes wid, collect s.market into a Set mk and s.region into a Set rg; return { markets:[...mk], regions:[...rg] }. (Derives a workspace's market/region coverage from its member stakeholders.)
- rel(s): wc = D.weightedCoord(s.id, scores||{}, team||[]); return D.statusFor(wc.x, wc.y). The COMPUTED relationship band.

ASSIGNMENT LOGIC (the exact membership rules — this is the heart of the page):
- wsAssigned = workspaces.filter where (w.owners||[]).includes(user.id) OR plans.some(pl => pl.workspaceId === w.id AND ((pl.owners||[]).includes(user.id) OR (pl.team||[]).some(t => t.userId === user.id))). I.e. a workspace counts if the user owns it OR owns/sits-on-the-team of any plan inside it.
- plansAssigned = plans.filter where (pl.owners||[]).includes(user.id) OR (pl.team||[]).some(t => t.userId === user.id). User owns the plan or is on its team.
- commAssigned = community.filter where (c.owners||[]).includes(user.id). User owns the community engagement.
- shAssigned: build a Set shIds; for each plan in plansAssigned, for each stakeholder s, if (stakeholderWorkspaces[s.id]||[]).includes(pl.workspaceId) add s.id to shIds; shAssigned = stakeholders that belong (via stakeholderWorkspaces) to a workspace of one of the user's assigned plans. (Reach-through: the stakeholders inside the workspaces of the user's plans.)

HERO (class profile-hero):
- Avatar user={user} size={64}.
- Title block (minWidth 0, flex 1): profile-name = user.name; profile-sub = user.title || "Team member"; profile-meta = span user.email, plus if user.role === "manager" a <ManagerBadge />.
- If isSelf: a btn btn-primary "Edit profile" (Icon "edit") calling onEdit. The edit button shows ONLY when viewing your own profile.

INFO GRID (class profile-info-grid) — three info cells (class profile-info), each with a span.lbl and value:
- Function: user.function || "-" (computed as fnLabel).
- Markets: if (user.markets||[]).length, each market as <span class="tag">; else <span class="muted">-</span> (container class profile-tags).
- Regions: same pattern with user.regions.

TABS (class profile-tabs) — TABS array, each rendered as button class "profile-tab" (+ " active" when selected); clicking sets tab and calls resetView(). Each button shows a long label span (tab-long), a short label span (tab-short), and a count badge (profile-tab-count):
- { id "ws", label "Workspaces", short "Workspaces", count wsAssigned.length }
- { id "plans", label "Stakeholder Engagement Plans", short "SEP", count plansAssigned.length }
- { id "comm", label "Community Engagement", short "Engage", count commAssigned.length }
- { id "sh", label "Stakeholder Relationships", short "Relationships", count shAssigned.length }

PER-TAB COLUMN SETS & ROWS (cols define key/label/width w; filter:true marks a filterable column; grid = cols.map(c=>c.w).join(" ")):

ws (onRowClick -> onOpenWorkspace(r.id)):
- name "Workspace" w minmax(180px,1.6fr)
- market "Market" w minmax(120px,1fr) filter:true
- region "Region" w minmax(120px,1fr) filter:true
- owner "Owner" w 90px
Rows from wsAssigned: for each w, mr = wsMarketsRegions(w.id); row = { id:w.id, name:w.name, market: mr.markets.join(", ")||"-", region: mr.regions.join(", ")||"-", _owners: w.owners||[], _updated: w.updatedAt||w.createdAt||"", _created: w.createdAt||"" }.

plans (onRowClick -> onOpenPlan(r.id)):
- name "Plan" w minmax(200px,2fr)
- workspace "Workspace" w minmax(150px,1.3fr) filter:true
- market "Market" w minmax(110px,1fr) filter:true
- region "Region" w minmax(110px,1fr) filter:true
- status "Status" w 120px filter:true
Rows from plansAssigned: { id:pl.id, name:pl.title, workspace:wsName(pl.workspaceId), market:pl.market||"-", region:pl.region||"-", status:pl.status||"Idea", _updated:pl.updatedAt||pl.createdAt||"", _created:pl.createdAt||"" }.

comm (onRowClick -> onOpenCommunity(r.id)):
- name "Engagement" w minmax(200px,2fr)
- workspace "Workspace" w minmax(150px,1.3fr) filter:true
- market "Market" w minmax(110px,1fr) filter:true
- region "Region" w minmax(110px,1fr) filter:true
- status "Status" w 120px filter:true
Rows from commAssigned: wsNames = dedup of (c.linkedStakeholders||[]).flatMap(id => stakeholderWorkspaces[id]||[]).map(wsName).filter(n => n !== "-"); row = { id:c.id, name:c.name, workspace: wsNames.join(", ")||"-", market:(c.markets||[]).join(", ")||"-", region:(c.regions||[]).join(", ")||"-", status:c.stage||"Idea", _updated:c.updatedAt||c.createdAt||"", _created:c.createdAt||"" }. (Note: community uses c.stage as the status; plans use pl.status.)

sh (onRowClick -> onOpenStakeholder(r.id)):
- name "Stakeholder" w minmax(180px,1.6fr)
- type "Type" w minmax(120px,1.1fr) filter:true
- relationship "Relationship" w 150px filter:true
- priority "Priority" w 110px filter:true
Rows from shAssigned: { id:s.id, name: displayName(s)||s.name, type:s.type, relationship: rel(s), priority:s.priority, _s:s, _updated: s.updatedAt||s.lastContact||s.createdAt||"", _created:s.createdAt||"" }.

The Status column (ws/plans/comm) renders text colored by PLAN_STAGE_FG[r.status] || var(--ink-2) inside a span.comm-stage-text. The Owner column renders OwnersDisplay users={users} owners={r._owners} size={22}. All other columns render r[c.key] verbatim.

FILTERS & SORT:
- filterCols = cols.filter(c => c.filter) — only filter:true columns appear in the Filter popover.
- distinctVals(key) = dedup of rows.map(r => (r[key]||"").toString()).filter(Boolean), sorted alphabetically.
- sortFields = [ for each col where c.key !== "owner": { key:c.key, label:c.label, type:"text" } ] PLUS { key:"_updated", label:"Last updated", type:"date" } and { key:"_created", label:"Date added", type:"date" }. (All visible non-owner columns are sortable as text; the two synthetic date fields are added at the end.)
- toggleFilter(col,val): set-based toggle into filters[col].
- activeFilterCount = sum of all filter Set sizes.
- resetView(): clears sort to {key:null,dir:"asc"}, filters to {}, q to "" — CALLED ON EVERY TAB SWITCH.

VIEW PIPELINE (order: search -> filter -> sort):
- ql = q.toLowerCase(); if ql, keep rows where cols.some(c => (r[c.key]||"").toString().toLowerCase().includes(ql)) — searches ALL visible columns.
- For each [k,set] in filters with a non-empty Set, keep rows where set.has((r[k]||"").toString()).
- If sort.key set, stable sort by lowercased string compare of r[sort.key], direction asc(+1)/desc(-1).

CONTROLS BAR (class profile-controls):
- Search: class "search" with Icon "search", an input bound to q (onChange sets q), placeholder "Search…", and a span.kbd.kbd-cmdk showing cmdKeyLabel (the platform cmd/ctrl key hint imported from store).
- Filter: btn (+ " filter-active" when activeFilterCount) with Icon "filter" labeled "Filter" plus " ({activeFilterCount})" when nonzero. Toggling opens filterOpen and closes sortOpen. Popover (class filter-popover, closes onMouseLeave): head "Filter" + a btn-ghost "Clear all" (clears filters); body = if no filterCols a muted "No filters for this view.", else one shared <FilterSection> per filter column (label=c.label, values=distinctVals(c.key), active=[...filters[c.key]||[]], onToggle=toggleFilter(c.key,v)).
- Sort: btn (+ " filter-active" when sort.key) with Icon "sort" labeled "Sort". Toggling opens sortOpen, closes filterOpen. Popover (filter-popover sort-popover, closes onMouseLeave): head "Sort by" + btn-ghost "Clear all" (resets sort); body = shared <SortFieldList fields={sortFields} sortKey sortDir onSet={(k,d)=>setSort({key:k,dir:d})} />.

TABLE RENDER — TWO DIFFERENT MARKUPS:
- sh tab uses a DISTINCT table (class plan-sh-table, overflow visible): a fixed thead (plan-sh-thead) of spans "Stakeholder" / "Type" / "Relationship" / "Priority". Empty -> profile-empty muted "No stakeholder relationships." Each row (plan-sh-trow, click -> onRowClick, title "Open stakeholder"): plan-sh-name = r.name; muted span r.type; <StatusPill status={r.relationship} />; <PriorityPill value={r.priority} />. Relationship and priority are rendered as the pill components (NOT plain text), because relationship is the computed band.
- ws/plans/comm tabs use the generic grid table (class profile-table): a header row (profile-trow profile-thead) with gridTemplateColumns=grid, each col label a span.profile-th-label. Empty -> profile-empty muted "Nothing here yet." Each data row (profile-trow, gridTemplateColumns=grid, cursor pointer, click -> onRowClick, title "Open") maps cols to span.profile-td: owner -> OwnersDisplay; status -> colored comm-stage-text; else r[c.key].

REBUILD BUILD-MAP (Canonical UI — never md-*/shadcn):
- Hero avatar = ui-* avatar (size 64); name in Newsreader title; ManagerBadge = the existing manager badge component; "Edit profile" = ui-button primary with ui-icon "edit".
- Info grid markets/regions = ui-chip groups.
- Tabs = ui-tabs (one tab per TABS entry) with a count badge on each; long/short labels are responsive label variants; switching a tab resets search/filter/sort.
- The ws/plans/comm tables = ui-data-table (column defs map directly to the cols arrays above; status column uses a token-mapped colored text cell; owner column uses the OwnersDisplay avatar stack).
- The sh table = ui-data-table whose Relationship cell is the StatusPill and Priority cell is the PriorityPill (zone/status token components), single-sourced with Map/Lists.
- Search = ui-text-field with leading ui-icon "search" and a trailing kbd hint (cmdKeyLabel).
- Filter & Sort = ui-menu (popover) hosting the shared FilterSection / SortFieldList controls; the active-state highlight is a token, not an inline color.
- PLAN_STAGE_FG colors migrate to --ui-sys-* status tokens (Idea #54524A, Proposed/Under Review #6E5419, Active #2f5a26, Complete #2E3F66) rather than literal hex in markup.

SKELETON TREE (literal region tree extracted from the archive/src/profile-page.jsx JSX — the build assembles against THIS tree, never prose. One node per line, nested in source order. Each node: what it is → what it contains → Canonical UI mapping. "layout row/column — token-only container" nodes are pure layout wrappers; wrapper structure otherwise lives inside the mapped ui-* component's shadow DOM. Bracketed [conditions] gate a node.)

SURFACE — THE FULL PAGE (in-main stack; the app shell around it is owned by the app-shell box):
div.single-page — the page column, top-to-bottom stack: hero → info grid → tabs → controls → table → ui-app-shell main content region (layout column — token-only container)
  header.profile-hero — hero row (layout row — token-only container)
    Avatar(user, 64) → ui-avatar size 64 (photo/initials, presence rules per the Shared-UI-primitives box)
    div [inline minWidth:0; flex:1] — titles block (layout column — token-only container)
      div.profile-name — user.name → title text (Newsreader title token)
      div.profile-sub — user.title || "Team member" → body muted text
      div.profile-meta — (layout row) span user.email + [role==="manager"] ManagerBadge → muted text + ui-chip "Manager"
    [isSelf] button.btn.btn-primary — Icon "edit" + "Edit profile" → ui-button filled/primary with leading ui-icon
  div.profile-info-grid — 3-cell info strip (layout grid — token-only container)
    div.profile-info — span.lbl "Function" + span.profile-info-v fnLabel → labeled value cell
    div.profile-info — span.lbl "Markets" + span.profile-tags of span.tag ×markets or span.muted "-" → ui-chip group
    div.profile-info — span.lbl "Regions" + span.profile-tags of span.tag ×regions or span.muted "-" → ui-chip group
  div.profile-tabs — tab strip (→ ui-tabs)
    button.profile-tab[.active] ×4 — each contains span.tab-long (long label) + span.tab-short (short label) + span.profile-tab-count (count badge) → ui-tabs tab with count badge; long/short = responsive label variants
  div.profile-controls — controls bar: search · Filter · Sort (layout row — token-only container)
    div.search — Icon "search" + input [placeholder "Search…", bound to q] + span.kbd.kbd-cmdk cmdKeyLabel → ui-text-field with leading ui-icon and trailing kbd hint
    div.filter-button-wrap — filter anchor (layout wrapper — anchors the popover)
      button.btn[.filter-active] — Icon "filter" + "Filter" (+" (n)") → ui-button (menu anchor)
      [filterOpen] div.filter-popover [onMouseLeave closes] → ui-menu popover
        div.filter-pop-head — strong "Filter" + button.btn.btn-ghost [inline fontSize:11] "Clear all" → popover head + ui-button text
        div.filter-pop-body — [no filterCols] p.muted [inline 12px; margin 0] "No filters for this view." ; else FilterSection ×filterCols → ui-chip filter groups (shared primitive)
    div.filter-button-wrap — sort anchor (layout wrapper)
      button.btn[.filter-active when sort.key] — Icon "sort" + "Sort" → ui-button (menu anchor)
      [sortOpen] div.filter-popover.sort-popover [onMouseLeave closes] → ui-menu popover
        div.filter-pop-head — strong "Sort by" + button.btn.btn-ghost [fontSize:11] "Clear all" → popover head + ui-button text
        div.filter-pop-body — SortFieldList(sortFields, sort.key, sort.dir) → shared sort-field primitive
  [tab==="sh"] div.plan-sh-table [inline overflow:visible] — the DISTINCT stakeholder table → ui-data-table (pill cells)
    div.plan-sh-thead — 4 header spans: "Stakeholder" "Type" "Relationship" "Priority" → data-table header row
    [view empty] div.profile-empty.muted "No stakeholder relationships." → empty state text
    div.plan-sh-trow ×view [onClick → onRowClick(r); title "Open stakeholder"] → data-table interactive row
      span.plan-sh-name — r.name
      span.muted — r.type
      span containing StatusPill(r.relationship) → ui-chip zone variant
      span containing PriorityPill(r.priority) → ui-chip priority variant
  [other tabs] div.profile-table — the generic grid table → ui-data-table
    div.profile-trow.profile-thead [inline gridTemplateColumns = grid] — span.profile-th-label ×cols → data-table header row (columns = the per-tab cols widths verbatim)
    [view empty] div.profile-empty.muted "Nothing here yet." → empty state text
    div.profile-trow ×view [inline gridTemplateColumns = grid; cursor:pointer; onClick → onRowClick(r); title "Open"] → data-table interactive row
      span.profile-td ×cols — owner col → OwnersDisplay(users, r._owners, 22) (ui-avatar-stack); status col → span.comm-stage-text [inline color PLAN_STAGE_FG[r.status] || var(--ink-2)] (token-mapped colored text cell); else r[c.key] text

CLASSNAME ACCOUNTING: every className region in profile-page.jsx appears above — single-page, profile-hero, profile-name, profile-sub, profile-meta, profile-info-grid, profile-info, lbl, profile-info-v, profile-tags, tag, muted, profile-tabs, profile-tab (active), tab-long, tab-short, profile-tab-count, btn, btn-primary, btn-ghost, filter-active, profile-controls, search, kbd, kbd-cmdk, filter-button-wrap, filter-popover, sort-popover, filter-pop-head, filter-pop-body, plan-sh-table, plan-sh-thead, plan-sh-trow, plan-sh-name, profile-empty, profile-table, profile-trow, profile-thead, profile-th-label, profile-td, comm-stage-text. None silently dropped; FilterSection/SortFieldList/Avatar/ManagerBadge/OwnersDisplay/StatusPill/PriorityPill internals are absorbed into their own primitives (Shared-UI-primitives box). The tree confirms the box body — no corrections needed.

UX HANDLER CENSUS (archive/src/profile-page.jsx — every event handler in the module, enumerated with exact behavior):
1. Hero "Edit profile" button onClick → onEdit (rendered ONLY when isSelf).
2. Tab button onClick (one JSX site, rendered ×4) → setTab(t.id) AND resetView() (clears sort, filters, and q on every switch).
3. Search input onChange → setQ(e.target.value).
4. Filter button onClick → setFilterOpen(o => !o) AND setSortOpen(false) (mutual exclusion).
5. Filter popover onMouseLeave → setFilterOpen(false) (hover-off dismissal; no click-outside handler).
6. Filter "Clear all" ghost button onClick → setFilters({}).
7. FilterSection onToggle(v) callback (per filter column) → toggleFilter(c.key, v) (Set-based toggle into filters[c.key]).
8. Sort button onClick → setSortOpen(o => !o) AND setFilterOpen(false) (mutual exclusion).
9. Sort popover onMouseLeave → setSortOpen(false).
10. Sort "Clear all" ghost button onClick → setSort({ key: null, dir: "asc" }).
11. SortFieldList onSet(k, d) callback → setSort({ key: k, dir: d }).
12. plan-sh-trow onClick (sh tab rows) → onRowClick(r) = onOpenStakeholder(r.id).
13. profile-trow onClick (ws/plans/comm rows) → onRowClick(r) = onOpenWorkspace / onOpenPlan / onOpenCommunity per tab.
13 handlers (11 DOM handler sites + 2 shared-component callback props), all accounted — every one is already described in the body above; no missing interactions found.` },
                                          { t: "Messaging — conversations, threads, @ / # / $ / mention links (built + developer-inferred)", done: true, d:
`MESSAGING (oracle: archive/src/messaging.jsx + the store writers in archive/src/app.jsx). Two surfaces share ONE conversation+message store, so a message sent in the right-edge sidebar is instantly visible on the full page and vice-versa: (A) MessagingSidebar — a right-edge overlay panel (.messaging-sidebar with a .side-veil scrim; toggles .show); head shows the message icon + "Conversation" when a conv is open else "Messages", plus an expand-to-page button (Icon "expand" → Material Symbols ligature open_in_full; the button carries the tooltip title="Open full Messages page" — capture this string verbatim; its onClick is the onOpenPage prop, which the app shell wires to setActiveView("messages") AND setMsgSidebarOpen(false) — i.e. expanding navigates to the full Messages page and CLOSES the sidebar in the same click, it never leaves the overlay open behind the page) and a close button (Icon "close", aria-label "Close", onClick = onClose). With no active conv it renders ConversationList (compact); with one open it shows a "← All conversations" back button, a .messaging-conv-head (ConversationAvatars + title + subline "{n} people · group" or "Direct message"), the MessageThread, and a Composer (placeholder "Reply…"). (B) MessagingPage — full page: left pane (.messaging-list-pane) with "Messages" h2 + a primary "New" button (Icon "plus") + ConversationList; right pane (.messaging-thread-pane) with either an empty state (message icon, "Select a conversation", muted "Or start a new one. Group messages let you bring in multiple teammates.", a primary "New conversation" button) or the open conversation: a .messaging-page-head (ConversationAvatars large + serif 18px 500-weight title + a muted subline: for groups "{n} people · " + comma-joined participant names, else "Direct message"), the MessageThread, and a Composer (placeholder "Message " + conversationTitle).

STORE WRITERS (oracle: archive/src/app.jsx — sendMessage / startConversation / messageUser; the app-shell box name-drops these and delegates their FULL capture to THIS box):
- startConversation(participantIds, title): participants = the unique set of currentUser.id + participantIds — the CURRENT USER IS ALWAYS ADDED and the list is deduped (a Set over [currentUser.id, ...participantIds]). kind = "group" when participants.length > 2, else "direct". DM DEDUPE BY PARTICIPANT PAIR: when kind is "direct", search the existing conversations for one with kind === "direct" AND participants.length === 2 AND containing BOTH participants — if found, RETURN THE EXISTING conversation's id (no new record is created, the existing thread and its messages are reused). Otherwise mint id = uid("c"), append the conversation record { id, kind, participants, title } (title is stored exactly as passed and may be null), initialize messages[id] = [] (empty thread), and return id. Two consequences a rebuild MUST preserve: (1) every non-system conversation always contains the current user in participants — conversationTitle and ConversationAvatars both compute "others = participants minus currentUserId" and would render wrong/empty otherwise; (2) starting a DM with someone you already have a DM with reopens that thread instead of creating a duplicate.
- sendMessage(conversationId, body): append { id: uid("m"), from: currentUser.id, body, at: new Date().toISOString() } to messages[conversationId] (creating the array if absent). Ordinary user messages carry NO kind field — kind exists only on system reminder messages (e.g. "scoring-needed", counted by the ConversationList pending badge below).
- ENTRY POINT messageUser(userId) — the "message a teammate" action, wired as UserListPopup's onMessage (the people popup): calls startConversation([userId], null) (so via the DM dedupe it REUSES an existing DM when one exists), sets that conversation active (setActiveConversationId(id)), CLOSES the users popup (setUsersPopupOpen(false)), and OPENS THE MESSAGING SIDEBAR (setMsgSidebarOpen(true)) — the sidebar, NOT the full page.

conversationTitle(conv, users, currentUserId): if conv.kind === "system" → "Reminders". Else if conv.title set → conv.title. Else → the participants minus currentUserId, mapped to each user's name (fallback "?"), joined with ", ".

conversationPreview(messages): if empty/none → { body: "No messages yet", at: null }; else → the LAST message object in the array.

formatTime(iso): if no iso → "". Build a Date. If d.toDateString() === today.toDateString() (same calendar day) → time as "h:mm AM/PM" (toLocaleTimeString with hour "numeric", minute "2-digit", e.g. "3:07 PM"). Otherwise → "Mon D" (toLocaleDateString month "short", day "numeric", e.g. "Jun 3").

ConversationList(conversations, messages, users, currentUserId, activeId, onPick, compact): ORDERING — copy the array and sort: the system conversation (kind==="system") is ALWAYS PINNED to the top (a.kind==="system" → -1; b.kind==="system" → 1); all others sort by most-recent-message timestamp DESCENDING (compare bm vs am where am/bm = last message's .at or "0", via bm.localeCompare(am) — ISO timestamps sort lexicographically). Render .conv-list (adds .compact when compact). Each row is a button .conv-row (adds .active when conv.id===activeId, adds .system for the system conv). Leading element: for the system conv, an .av.av-system circle (28x28, 11px) holding the sparkle brand glyph (Icon "sparkle" class "brand-glyph"); else ConversationAvatars. Body (.conv-row-body): top line (.conv-row-top) = title (.conv-row-title: "Reminders" for system, else conversationTitle) + the time/pending slot (.conv-row-time). Preview line (.conv-row-preview): for the system conv → the pending sentence (below); else → an optional "Firstname: " prefix (only when the last message's author exists AND is not the current user — fromUser.name.split(" ")[0] + ": ") followed by preview.body.
SYSTEM THREAD PENDING COUNT: pending = number of messages in the system conv whose kind === "scoring-needed". The preview text = pending + " stakeholder" + (pending===1 ? "" : "s") + " need scoring" when pending>0, else "All caught up". The pending count renders IN PLACE OF the timestamp: when pending>0 the .conv-row-time slot shows a <span class="conv-row-pending">{pending}</span> badge instead of formatTime(preview.at); when pending===0 it shows formatTime normally.

ConversationAvatars(conv, users, currentUserId, large): others = participants minus currentUserId. size = 36 when large else 28. If others.length===0 → render nothing. If exactly one other OR conv.kind==="direct" → resolve the user; if found, a single <Avatar user=that-user size=size online={user.presence==="online"} />, and if the id resolves to NO user the component returns null (NOTHING renders in the avatar slot). Else (group) → a stacked element .conv-multi-avatar (width/height = size) containing the FIRST 2 others, each rendered as an Avatar at Math.round(size*0.7) (0.7x); within the stack any id that resolves to no user is SKIPPED (a per-id null guard). (In a thread, message-author avatars use size 26 — see MessageThread.)

THE SYSTEM CONVERSATION WHEN OPENED — oracle quirks + the LANDED RULING the Cadence/Reminders box delegated to this box. The oracle special-cases kind "system" ONLY in the list row (sparkle avatar, "Reminders" title, pending badge) and in conversationTitle; once OPENED (sidebar or page), c-system renders like any ordinary conversation. Three verified oracle quirks:
(1) THE COMPOSER RENDERS AND REPLIES GO NOWHERE: opening the system conv shows the normal Composer — sidebar placeholder "Reply…", page placeholder "Message Reminders" ("Message " + conversationTitle, and conversationTitle returns the literal "Reminders" for kind "system"). A typed reply is appended into messages["c-system"] via sendMessage (from = the current user, no kind field) and NOTHING ever consumes it — the reply just sits in the org-wide Reminders thread.
(2) THE HEAD SUBLINE READS "Direct message": both the sidebar .messaging-conv-head subline and the page .messaging-page-head subline are decided by a conv.kind==="group" ternary ONLY, so kind "system" falls through to the else branch and the org-wide bot thread is mislabeled "Direct message".
(3) THE HEAD AVATARS ARE STACKED USER AVATARS, NOT THE SPARKLE: the sparkle .av-system glyph exists ONLY in the ConversationList row. The opened conversation's head calls ConversationAvatars, which has NO system branch: others = participants minus currentUserId (the seed c-system participants are u-system plus every non-system user), so others.length > 1 and kind !== "direct" → the .conv-multi-avatar stack of the FIRST 2 others at 0.7x — in seed order that includes the u-system bot's own dark initials Avatar (avatarColor #1F1A14), not a system glyph.
RULING (LANDED HERE — this settles the decision the Cadence/Reminders box explicitly deferred to the Messaging box): in the rebuild the Reminders system thread is READ-ONLY / NO-REPLY. When the open conversation's kind === "system", the Composer does NOT render (neither in the sidebar nor on the page) — replies to the bot are meaningless and unconsumed, so the surface is removed rather than the dead-letter behavior ported. The two head quirks are ALSO corrected deliberately, not ported: (a) the head subline for kind "system" shows a system label — use "Automated reminders" (the bot user's seed title) — never "Direct message"; (b) the opened-conversation head shows the SAME sparkle system avatar as the list row, not stacked user avatars. All three are RECORDED corrections of verified oracle quirks — deviations by ruling, not drift.

MessageThread(conversation, messages, users, currentUserId): auto-scrolls to bottom on messages.length change (endRef.scrollIntoView block "end"). Empty → .thread-empty.muted "No messages yet. Say hello." Otherwise .message-thread mapping each message m at index i: author = users.find by m.from; isMine = m.from===currentUserId; prev = messages[i-1]. GROUPING: grouped = prev exists AND prev.from===m.from AND (Date(m.at) − Date(prev.at)) < 60000 ms (60 seconds) — i.e. consecutive messages from the same author within 60s are grouped and their avatar + meta header are HIDDEN. Row = div .msg (adds .mine when isMine, .grouped when grouped). When NOT grouped and NOT mine and author exists → an <Avatar size=26>; when grouped and not mine → a 26px-wide spacer span (keeps alignment). Body (.msg-body): when not grouped, a .msg-meta line = author span (.msg-author: "You" when mine, else author.name or "?") + time (.msg-time: formatTime(m.at)). Always a .msg-bubble = renderMentions(m.body). A trailing endRef div anchors the scroll.

MENTION TRIGGERS (MENTION_TRIGGERS map): "@" → { type "stk", src "stakeholders" }; "/" → { type "wsp", src "workspaces" }; "#" → { type "pln", src "plans" }; "$" → { type "cmy", src "community" }. (At-sign = stakeholders, slash = workspaces, hash = plans, dollar = community.)

renderMentions(body): if no body or body has no "{{" → return body unchanged. Otherwise scan with the global regex — EXACT, with ONE backslash per escape: /\\\\\\\\{\\\\\\\\{(stk|wsp|pln|cmy):([^|}]+)\\\\\\\\|([^}]*)\\\\\\\\}\\\\\\\\}/g. Spelled out in words so no escaping layer can corrupt it in transcription: backslash open-brace, backslash open-brace, capture group (stk|wsp|pln|cmy), a literal colon, capture group = character class NOT pipe NOT close-brace one-or-more, backslash pipe, capture group = character class NOT close-brace zero-or-more, backslash close-brace, backslash close-brace, global flag. ESCAPING WARNING: exactly ONE backslash before each escaped brace/pipe — a doubled (or quadrupled) backslash makes the pattern match literal backslash characters instead, the {{type:id|label}} tokens NEVER match, and mention chips never render. Token format is {{type:id|label}} with type one of the FOUR codes stk/wsp/pln/cmy. Each match becomes a <button type="button" class="mention-chip t-{type}"> containing a <span class="mention-dot" /> then the label, whose onClick calls window.__openMention(type, id) (opens the read-only page for that entity). Plain text between/around matches is preserved.

COMPOSER (this IS built — capture as built, NOT deferred). State: text, mq (the active mention query { trigger, query, start } or null), hi (highlighted match index). A textarea (rows 1, grows; placeholder from prop or "Write a message…") + a primary "Send" submit button (disabled when text is blank). Submit/go: trims text, if non-empty calls onSend(text.trim()), clears text and mq. onType (onChange): set text to value; read caret = selectionStart; take substring up to caret; test it against the regex — EXACT, ONE backslash before the w: /([@/#$])([\\\\\\\\w .'-]*)$/. Group 1 = one of the four trigger chars at-sign slash hash dollar; group 2 = zero-or-more of backslash-w (word characters), space, dot, apostrophe, hyphen; end-anchored at the caret. ESCAPING WARNING: the class opens with backslash-w — if transcription doubles the backslash the class degrades to {literal backslash, literal w, space, dot, apostrophe, hyphen}, real letters stop matching, and the mention search closes after the first typed letter. On match → mq = { trigger: m[1], query: m[2], start: caret − m[0].length } and hi reset to 0; on no match → mq = null.
MATCH SOURCING: sources = window.__mentionSources() (an object of arrays keyed by src name) or {}. labelFor(type, o): stk → displayName(o) || o.name; pln → o.title; wsp → o.name; cmy (else) → o.name. matches: take MENTION_TRIGGERS[mq.trigger], pull sources[cfg.src] (or []), lowercase the query q; map each option to { id, label: labelFor(cfg.type,o) }, keep those whose label exists and (no query OR label.toLowerCase().includes(q)), slice to UP TO 6, attach type=cfg.type.
KEYBOARD (textarea onKeyDown): when mq is active and matches exist — ArrowDown → hi = (hi+1) % len; ArrowUp → hi = (hi−1+len) % len; Enter OR Tab → pick(matches[hi]) (each prevents default); Escape → close mq. Independent of mentions: Enter without Shift → submit (Shift+Enter inserts a newline).
PICK(o): builds token {{type:id|label}}, splices it into text at mq.start replacing the typed trigger fragment, appends a trailing space, clears mq, refocuses the textarea. The popover (.mention-pop) appears below the field when mq is active and matches exist: each option is a button (.mention-opt, adds .on when i===hi) with a colored dot (.mention-dot.t-{type}) + label; onMouseDown (preventDefault) picks it.

NewConversationModal(users, currentUserId, onClose, onCreate): a modal (.modal with .modal-veil.show scrim) titled "New conversation" + close button. others = all users except currentUserId. State: picked (array of user ids), title (string). isGroup = picked.length > 1.
- Title field: label switches between "Group name (optional)" (when isGroup) and "Title (optional)" (when not); input placeholder switches to "EMEA pre-meeting" when group, else "".
- "Add people (type to search)": a UserAutocomplete over others NOT already picked, passed value={null} and placeholder "Start typing a name or title…" (verbatim, ellipsis character included); choosing an id calls onChange(id) which, when id is truthy, calls toggle(id) to add it to picked. Below, when picked.length>0, a wrap of .picked-chip chips (each: a 20px Avatar + the user's name + an "×" remove affordance .picked-chip-x; clicking the chip toggles/removes that user).
- "Or pick from the list": a .user-picker full checkbox list of every other user — each row (.user-picker-row, adds .picked when selected) = a checkbox (checked = picked includes id; onChange toggles) + a 28px Avatar with online={presence==="online"} + name (12.5px 500) + muted title (11px).
- Footer: "Cancel" button (onClose) + a primary "Start conversation" button DISABLED until picked.length>=1 (i.e. at least one participant); on click calls onCreate(picked, title.trim() || null). The page wires onCreate → startConversation(participants, title) (the STORE WRITER above — auto-adds the current user, dedupes DMs by participant pair) → setActiveConversationId to the RETURNED id (which may be an EXISTING DM's id via the dedupe, not necessarily a new one) → close the modal.

BUILD-MAP (Canonical UI, ui-* only — NEVER md-*/shadcn). Conversation list → ui-list (each conv-row a list item with leading avatar/avatar-stack, trailing time-or-pending badge as a ui-chip/count). Thread bubbles → tokened surfaces (mine vs other = different --ui-sys surface roles, never inline color). Composer → a ui-text-field (multiline) plus a ui-button primary "Send"; the mention popover → a ui-menu/autocomplete anchored to the field; NO composer renders on the system conversation per the read-only ruling above. Mention chips (rendered + in-popover) → ui-chip variants keyed by type token (t-stk/t-wsp/t-pln/t-cmy map to distinct --ui-sys accent/zone tokens, never inline hex). New-conversation → ui-dialog containing a ui-autocomplete (add-by-search, placeholder "Start typing a name or title…"), ui-chip removable chips, and a ui-list of ui-checkbox rows; the "Start conversation" action is a ui-button disabled until >=1 picked. Avatars/avatar-stacks and the presence dot are shared primitives (see the Shared UI primitives box). No ad-hoc styling, no shadows beyond the shipped ramp.

=== SKELETON TREE (Messaging — the literal region tree from archive/src/messaging.jsx; the build assembles against THIS tree, never prose) ===
Legend: each node = className/element — what it contains — Canonical UI mapping. "layout row/column — token-only container" = pure layout, no visual decision.

TREE 1 — SIDEBAR VARIANT (MessagingSidebar render root):
Fragment
  div.side-veil (+.show when open) — the scrim; onClick = onClose — ui-sheet scrim (click dismisses the sidebar)
  aside.messaging-sidebar (+.show when open) — the right-edge overlay panel — ui-sheet (right-anchored)
    div.messaging-sidebar-head — layout row — sheet header slot
      div.row (gap 8) — Icon "message" + strong ("Conversation" when a conv is open, else "Messages") — ui-icon + token-inked title
      div.row (gap 4) — button.btn.btn-ghost expand (Icon "expand" → open_in_full; title "Open full Messages page") + button.btn.btn-ghost close (Icon "close", aria-label "Close") — 2x ui-icon-button, each wrapped in ui-tooltip
    BRANCH (no active conv): ConversationList with compact — TREE 3
    BRANCH (conv open):
      button.messaging-back — "← All conversations" — ui-button (text) with leading chevron ui-icon
      div.messaging-conv-head — layout row — token-only container
        ConversationAvatars — TREE 4 (per the RULING above: the system conv shows the sparkle system avatar here in the rebuild)
        div (minWidth 0, flex 1) — the title column — layout column, absorbed
          div (fontWeight 500, fontSize 13, ellipsis/nowrap) — conversationTitle — token-inked title text
          div.muted (fontSize 11) — "{n} people · group" / "Direct message" (system → "Automated reminders" per the RULING) — token-inked subline
      MessageThread — TREE 5
      Composer (placeholder "Reply…") — TREE 6 (does NOT mount when kind === "system", per the read-only RULING)

TREE 2 — FULL PAGE VARIANT (MessagingPage render root):
div.messaging-page — two-pane layout row — token-only container (page root in the shell's main slot)
  aside.messaging-list-pane — the left list pane — pane surface on --ui-sys-surface-container (sidebars never white)
    div.messaging-list-head — h2 "Messages" + button.btn.btn-primary (Icon "plus" + "New") — pane header: title-typeface heading + ui-button (filled) with leading ui-icon
    ConversationList — TREE 3
  section.messaging-thread-pane — the thread pane — layout column on --ui-sys-surface-card (main content white)
    BRANCH (no conv): div.messaging-empty — Icon "message" + h3 "Select a conversation" + p.muted ("Or start a new one. Group messages let you bring in multiple teammates.") + button.btn.btn-primary (Icon "plus" + "New conversation") — empty-state composition: ui-icon + heading + label text + ui-button (filled)
    BRANCH (conv open):
      div.messaging-page-head — layout row — token-only container
        ConversationAvatars (large) — TREE 4
        div (minWidth 0, flex 1) — h3 (serif/title typeface, fontWeight 500, fontSize 18, margin 0) conversationTitle + div.muted (fontSize 12) subline (group: "{n} people · " + comma-joined names; else "Direct message"; system per the RULING) — heading + token-inked subline
      MessageThread — TREE 5
      Composer (placeholder "Message " + conversationTitle) — TREE 6
  NewConversationModal (conditional, newOpen) — TREE 7

TREE 3 — ConversationList (shared by both variants):
div.conv-list (+.compact in the sidebar) — ui-list
  button.conv-row (+.active when conv.id === activeId; +.system for the system conv) x N, ordered system-first then last-message-desc — ui-list interactive item
    LEADING (system conv): span.av.av-system (28x28, fontSize 11) holding Icon "sparkle" class .brand-glyph — token-tinted system avatar circle · LEADING (all others): ConversationAvatars — TREE 4
    div.conv-row-body — layout column — absorbed into the list item's content slot
      div.conv-row-top — span.conv-row-title ("Reminders" for system, else conversationTitle) + span.conv-row-time (formatTime(preview.at) OR, when system pending > 0, span.conv-row-pending count badge in its place) — headline + trailing meta (badge = ui-chip/count token)
      div.conv-row-preview — the preview line (system pending sentence, or optional "Firstname: " prefix + preview.body) — supporting text

TREE 4 — ConversationAvatars (shared):
EITHER a single Avatar (size 36 when large, else 28; online dot when that user's presence === "online"; renders null when the single other's id resolves to NO user) — shared primitive (ui-avatar)
OR span.conv-multi-avatar (width/height = size) — the FIRST 2 others each as Avatar at Math.round(size * 0.7), any unresolved id SKIPPED (per-id null guard) — avatar-stack composition of the shared primitive
(returns nothing when others is empty)

TREE 5 — MessageThread (shared):
EITHER div.thread-empty.muted — "No messages yet. Say hello." — token-inked empty state
OR div.message-thread — the scroll column — token-only container (auto-scrolls to the trailing anchor on message count change)
  div.msg (+.mine when the author is the current user; +.grouped per the 60s same-author rule) x N — message row — layout row, token-only container
    Avatar (26) when NOT grouped and NOT mine and the author resolves · span (width 26, flex 0 0 26px) alignment spacer when grouped and not mine — shared primitive / layout filler (absorbed)
    div.msg-body — layout column — absorbed
      div.msg-meta (only when not grouped) — span.msg-author ("You" when mine, else author.name or "?") + span.msg-time (formatTime(m.at)) — token-inked meta line
      div.msg-bubble — renderMentions(m.body): plain text interleaved with button.mention-chip.t-{stk|wsp|pln|cmy} (span.mention-dot + label) — tokened bubble surface (mine vs other = different --ui-sys surface roles, never inline color); mention chips = ui-chip variants keyed by type token
  div (endRef) — the scroll anchor — behavior only, no region (absorbed)

TREE 6 — Composer (shared):
form.composer (onSubmit) — layout row — token-only container
  div.composer-field — the field wrapper (popover anchor) — token-only container
    textarea (rows 1; placeholder from prop or "Write a message…") — ui-text-field (multiline; see the shared multiline GAP resolution in the Community/Plan boxes)
    div.mention-pop (conditional: mq active AND matches non-empty) — button.mention-opt (+.on when i === hi) x up-to-6 (span.mention-dot.t-{type} + label) — ui-menu/autocomplete surface anchored below the field
  button.btn.btn-primary (type submit, "Send", disabled when text is blank) — ui-button (filled)

TREE 7 — NewConversationModal:
Fragment
  div.modal-veil.show — the scrim; onClick = onClose — ui-dialog scrim (scrim-dismiss ENABLED)
  div.modal — ui-dialog
    div.modal-head — h2 "New conversation" + button.btn.btn-ghost (Icon "close", aria-label "Close") — headline + ui-icon-button
    div.modal-body — dialog content slot
      div.login-field (title) — span.lbl ("Group name (optional)" when isGroup, else "Title (optional)") + input (placeholder "EMEA pre-meeting" when group, else "") — ui-text-field
      div.login-field (add people) — span.lbl "Add people (type to search)" + div.ws-owner-control (padding 4px 8px) hosting UserAutocomplete (shared primitive → ui-autocomplete; placeholder "Start typing a name or title…") + conditional chip wrap (flex, wrap, gap 6, marginTop 8; a styled layout row — token-only container) of span.picked-chip x N (Avatar 20 + name + span.picked-chip-x "×"; whole chip click removes) — ui-chip removable chips
      div.login-field (pick list) — span.lbl "Or pick from the list" + div.user-picker — ui-list of ui-checkbox rows
        label.user-picker-row (+.picked when selected) x N — input[type=checkbox] + Avatar (28, online dot when presence === "online") + div (minWidth 0, flex 1: name 12.5px/500 + muted title 11px) — checkbox row with avatar + two-line text
    div.modal-foot — button.btn "Cancel" + button.btn.btn-primary "Start conversation" (disabled until picked.length >= 1) — action slot, 2x ui-button

CLASSNAME ACCOUNTING: every className region in messaging.jsx appears above (side-veil, show, messaging-sidebar, messaging-sidebar-head, row, btn, btn-ghost, messaging-back, messaging-conv-head, muted, messaging-page, messaging-list-pane, messaging-list-head, btn-primary, messaging-thread-pane, messaging-empty, messaging-page-head, conv-list, compact, conv-row, active, system, av, av-system, brand-glyph, conv-row-body, conv-row-top, conv-row-title, conv-row-time, conv-row-pending, conv-row-preview, conv-multi-avatar, thread-empty, message-thread, msg, mine, grouped, msg-body, msg-meta, msg-author, msg-time, msg-bubble, mention-chip, t-stk / t-wsp / t-pln / t-cmy, mention-dot, composer, composer-field, mention-pop, mention-opt, on, modal-veil, modal, modal-head, modal-body, modal-foot, login-field, lbl, ws-owner-control, picked-chip, picked-chip-x, user-picker, user-picker-row, picked). None silently dropped.

=== UX HANDLER CENSUS (archive/src/messaging.jsx — every event handler in the module) ===
DOM-level JSX handlers, 19 total:
MessagingSidebar (4): 1 side-veil onClick → onClose (PREVIOUSLY IMPLICIT, NOW EXPLICIT: clicking the scrim closes the sidebar exactly like the close button) · 2 expand button onClick → onOpenPage (navigates to the full page AND closes the sidebar, per the head description above) · 3 close button onClick → onClose · 4 messaging-back onClick → setActiveConversationId(null) (returns to the list WITHOUT closing the sidebar).
MessagingPage (2): 5 list-head "New" onClick → setNewOpen(true) · 6 empty-state "New conversation" onClick → setNewOpen(true).
ConversationList (1): 7 conv-row onClick → onPick(conv.id) (both variants wire it to setActiveConversationId).
renderMentions (1): 8 mention-chip onClick → window.__openMention(type, id) (the global bridge; opens the read-only entity page).
Composer (4): 9 form onSubmit → go() (preventDefault, trim/guard, onSend, clear text + mq) · 10 textarea onChange → onType (caret-anchored trigger-regex scan → mq/hi) · 11 textarea onKeyDown (when mention popover active: ArrowDown/ArrowUp cycle hi, Enter/Tab pick, Escape closes; otherwise Enter-without-Shift submits, Shift+Enter inserts a newline) · 12 mention-opt onMouseDown (preventDefault → pick(o) — mousedown, not click, so the textarea never blurs before the pick).
NewConversationModal (7): 13 modal-veil onClick → onClose (PREVIOUSLY IMPLICIT, NOW EXPLICIT: a scrim click discards the draft picks/title, same as Cancel and the head close — three dismissal paths total) · 14 head close onClick → onClose · 15 title input onChange · 16 picked-chip onClick → toggle(id) (removes that person) · 17 user-picker-row checkbox onChange → toggle(id) · 18 "Cancel" onClick → onClose · 19 "Start conversation" onClick → onCreate(picked, title.trim() || null).
Shared-primitive callback prop (1): UserAutocomplete onChange → if (id) toggle(id) (its internal DOM handlers are censused in the Users & People box's UX handler census, #33–39 — the shared-primitives box carries no handler census).
Non-JSX interaction machinery (all captured in the sections above): MessageThread's useEffect scrollIntoView on messages.length; Composer pick()'s setTimeout textarea refocus; the window.__openMention / window.__mentionSources globals (app-shell bridges).
19 DOM handlers + 1 shared-primitive callback prop = 20 interaction bindings, all accounted. Census corrections/additions to the box: the TWO scrim-click dismissals (handlers 1 and 13) are now explicit; everything else was already captured verbatim. Per the read-only Reminders RULING above, when the open conversation's kind === "system" the rebuild does not mount the Composer at all, so handlers 9–12 have no system-thread surface — a recorded deviation by ruling, not drift. No tree or census finding disproves any statement in the box.` },
                              { t: "Persistence & realtime — the ONE transport boundary (Store now · Supabase swap · the traps)", done: true, d:
`THE PRINCIPLE (this is what stops the backend from becoming a patch-by-patch death spiral) — the UI talks to EXACTLY ONE interface: usePersistentState(table, seed), a drop-in for useState. It NEVER touches the transport. Every entity flows through the SAME generic path (load / save / subscribe by table). So moving from localStorage to Supabase is a SINGLE-FILE change in the Store — there are NO per-entity connectors to build or patch one-by-one. Get the one transport right (row-level + RLS) and every module is correct at once. Do NOT introduce bespoke per-feature persistence — that is the anti-pattern that kills the build.

REALITY CHECK (do NOT assume the old code is done) — the single-boundary above is the DESIGN/intent. In the OLD code the per-feature linkage to it was done MANUALLY, feature by feature, and was STOPPED partway — so it is FAR FROM COMPLETE: not every entity/mutation actually routes cleanly through usePersistentState/Store, and the row-level + auth/RLS work below was never done. The rebuild's job is to wire EVERY entity through the one boundary UNIFORMLY FROM THE START (a fresh build does this cleanly in one pass) — never re-create the old partial, hand-wired state. Treat the old files as a BLUEPRINT, not finished plumbing.

══ DEVELOPER-GRADE FINAL ARCHITECTURE (the authoritative approach — supersedes any looser wording elsewhere in this box) ══
GOAL: many users, many devices/browsers, editing the same data LIVE; saves, deletes, replacements, and CONCURRENT edits ("people working over each other") all converge correctly, durably, for all time.

(1) ONE DATA LAYER; SERVER IS THE SOURCE OF TRUTH. Build a single repository/Store FIRST, before any feature. Postgres (Supabase) is authoritative; each client keeps a cache and applies changes OPTIMISTICALLY (update UI now → reconcile on the server echo → roll back on error). Every entity goes through the SAME API: list / get / save(changedRow) / delete(id) / insert / subscribe(table). Build the layer ONCE; as each feature is rebuilt it just REGISTERS its table and uses this API — coverage is complete BY CONSTRUCTION (you add one entity at a time and none is missed), never patched per feature.

(2) THREE TIERS BY DATA TYPE (the call that avoids BOTH clobbering AND over-engineering — using one strategy everywhere is the classic mistake):
• TIER 1 — RECORDS (the SCALAR fields of stakeholders, plans, community, workspaces, users, appConfig): mutate with TARGETED COLUMN-LEVEL upserts of ONLY the changed columns — never the whole array, never a blind whole-row write. Concurrency = optimistic + updated_at/version used for DETECTION, not as a merge: a write carries the version it read; if the server's is newer, the write is REJECTED and the client re-reads/re-applies (optimistic concurrency) — never a silent clobber. Same-field simultaneous edits are the only true conflict and are resolved last-writer-with-newer-version + surfaced. Realtime: postgres_changes → MERGE the incoming row BY ID (column-wise) into the cache.
  ⚠️ CRITICAL: a record has MORE than updated_at, and most of its "fields" are actually COLLECTIONS — those must NOT ride on the parent's single timestamp. NORMALIZE every nested collection into its own rows so concurrent additions can't clobber: notesHistory → a notes table (append, Tier 2); score history snapshots → a score_history table; plan strategies/tactics/phases → their own rows; community votes → community_votes (done); plan feedback, attachments → rows. ARRAY-OF-ID fields (owners, linkedStakeholders, issues, tags, participants) use SET add/remove operations or join tables — never a whole-array overwrite. Per-row timestamps that already exist (scores' per-(stakeholder,teammate) created/updatedAt; snapshots' recordedAt; notes' at/by) are kept and are the right granularity. Net: conflict is handled at the SMALLEST natural unit (a column, a note, a tactic, a score cell), so "people working over each other" converges instead of overwriting.
• TIER 2 — APPEND-ONLY (messages, notes, feedback, score history, votes): INSERTS, not edits → no conflict possible by construction. Votes/scores are keyed upserts ((application,user) / (stakeholder,teammate)). Realtime appends.
• TIER 3 — COLLABORATIVE DOCUMENTS (the Whiteboard, and long-form plan writing where people truly type over each other): row last-write-wins is WRONG here — use a CRDT (e.g. Yjs) so concurrent edits merge automatically/conflict-free with live cursors + presence; persist the doc state. This is the ONLY tier that needs CRDT machinery — don't apply it to records, don't omit it from docs.

(3) CROSS-CUTTING MACHINERY (all tiers): client-minted stable UUIDs (idempotent, retry-safe creates); optimistic apply → reconcile → rollback; updated_at (+ optional version) for optimistic concurrency; realtime = postgres_changes (data) + Presence (who's online / cursors) + Broadcast (ephemeral); RLS = the REAL security gate (client gating is cosmetic); FK ON DELETE CASCADE for integrity (deleting a workspace/user cleans dependents server-side, not via fragile client code); SOFT-DELETE (deleted_at) so deletes/replacements propagate cleanly in realtime and are recoverable; an OFFLINE QUEUE that buffers mutations and flushes on reconnect.

(4) INCREMENTAL BUILD → COMPLETE COVERAGE: build the layer first; register entities ONE AT A TIME through the same API as features are rebuilt; the traceability MANIFEST (INDEX box) checks every entity × every mutation × every realtime path against this layer so nothing is ever missed. That is how "one thing at a time" still ends at 360° coverage.
══════════════════════════════════════════════════════════════════════════════════

REAL-TIME BACKEND CHOICE — SUPABASE (Postgres + Supabase Realtime). It delivers the multi-browser / multi-device / multi-user live sync the product needs (the "Firestore idea"): postgres_changes = row sync to every client; Presence = who's online (drives the real avatar stack); Broadcast = ephemeral signals. WHY Supabase over Firebase/Firestore: Stakeholdr's data is RELATIONAL (joins, the stakeholderWorkspaces join, FY rollups, ON DELETE CASCADE, row-level security) — Postgres is its home; Firestore's document model would force a re-modeling for no gain. Auth via Supabase Auth (email/SSO).

TWO STATES + THE SWITCH (how the app actually ships) — the rebuild starts from scratch (these source files won't exist), so build the Store to run in TWO interchangeable states behind the one usePersistentState API:
• STATE A — DEMO (default, no cost, what the client reviews): the Store uses localStorage + BroadcastChannel, seeded from demo data. No accounts, no network. (Demo is single-device / multi-tab; true cross-device sync needs State B.)
• STATE B — SUPABASE (flip when the client approves and Supabase is paid + enabled): the SAME Store, transport swapped to Supabase (Postgres + Realtime + Auth).
• THE SWITCH = ONE config flag, never a rewrite: if the Supabase env is present (e.g. VITE_SUPABASE_URL + anon key), the Store routes load/save/subscribe to Supabase (from().select / upsert / delete + a postgres_changes channel per table) and Auth is required; if absent, it uses the localStorage demo transport with seed data. usePersistentState and EVERY component are byte-identical in both states. Flipping on = set env + run the schema SQL (see "Database schema" box) + enable RLS + remove the demo auto-manager. This two-state requirement is the WHOLE reason the boundary must be single + generic.

THE STORE TODAY [BUILT] — the Store singleton (an ES-MODULE EXPORT from store.js: export const Store — NOT attached to window; consumers import it) over localStorage + BroadcastChannel:
• Namespace PREFIX "hpsm:"; SCHEMA_VERSION ("v9") stamped at "hpsm:__schema" (verKey = PREFIX + "__schema") — bump it to wipe ONLY our namespace on a breaking change. The migration runs at Store init: if localStorage.getItem(verKey) !== SCHEMA_VERSION, every key starting with PREFIX is removed, then the new version is stamped (wrapped in try/catch).
• load(table, seed): read persisted JSON (PREFIX + table) or fall back to seed (and persist the seed so the table exists for other tabs).
• save(table, value, silent): write JSON + broadcast { table, value } on BroadcastChannel("hpsm-sync"); silent skips the broadcast (used when applying a change that arrived FROM another tab, to avoid an echo loop).
• subscribe(table, cb): register a per-table listener (subs[table] is a Set); returns an unsubscribe.
• reset(): clear the namespace (hard "reset demo data") + re-stamp the version.
• THE EVENT SHAPE { table, value } IS EXACTLY what a Supabase postgres_changes subscription delivers — chosen so the transport swap needs no UI change. The channel (when BroadcastChannel exists) is one BroadcastChannel("hpsm-sync") whose onmessage destructures { table, value } and fires every subscriber for that table (guards: return if !table).
• usePersistentState(table, seed): useState seeded from Store.load; an effect persists on change (save); a subscribe effect applies incoming changes; a skipPersist ref (a useRef) prevents re-broadcasting a change that arrived from elsewhere (the subscribe callback sets skipPersist.current = true before setValue; the persist effect sees it, clears it, and returns without saving).
• ids: uid(prefix), an ES-module export from store.js (export function uid — NOT a window global; collision-resistant for concurrent multi-user creates). nowStamp(), likewise a module export (export function nowStamp; the "window.nowStamp" wording in project/db.js's comment is stale — none of Store/uid/nowStamp is ever attached to window) = full ISO timestamp (new Date().toISOString()); date-only fields (lastContact) keep YYYY-MM-DD.

══ STORE INTERNALS — EXACT VALUES [CODE, archive/src/store.js + project/db.js] ══
uid(prefix) — id minting. Uses window.crypto.randomUUID() WHEN AVAILABLE; otherwise FALLBACK for browsers without crypto.randomUUID: Date.now().toString(36) + Math.random().toString(36).slice(2, 10). Returns prefix ? prefix + "-" + u : u. Every new record id is minted through this (sh-, ws-, tm-, c-, m-, etc.) so concurrent multi-user creates are idempotent/retry-safe.

STORAGE-EVENT FALLBACK (cross-tab sync for browsers WITHOUT BroadcastChannel) — a window "storage" listener installed at Store init, with these EXACT guards (any failing guard → ignore the event):
• if (!e.key) return — ignore events with no key.
• if (!e.key.startsWith(PREFIX)) return — ignore keys not in the "hpsm:" namespace.
• if (e.key === verKey) return — ignore the schema version key ("hpsm:__schema").
• derive table = e.key.slice(PREFIX.length).
• if (channel) return — SKIP ENTIRELY when a BroadcastChannel exists (it already handled this change; avoids double-apply).
• value = e.newValue == null ? null : JSON.parse(e.newValue) (a null newValue → null), wrapped in try/catch; then fire every subscriber for that table.

PER-DEVICE localStorage KEYS (NOT broadcast, NOT in the Store namespace, one per browser/tab):
• hp_map_col_order_v3 — this user's Lists column-order/arrangement preference. THE LIVE KEY IS v3: the ONLY code that reads or writes it is the Lists table (archive/src/sheet.jsx — localStorage.getItem("hp_map_col_order_v3") on load, localStorage.setItem("hp_map_col_order_v3", …) on reorder; project/sheet.jsx is identical), and APP_SPEC.md agrees (v3). A stale PROSE COMMENT in project/db.js says "hp_map_col_order_v2" — that comment is the outdated artifact, NOT the code; do not capture from it. The Lists box's v3 is CORRECT and needs no reconciliation. Ship exactly ONE key name (v3) — never two.
• hp_map_user — THIS-TAB currentUser session (the logged-in user for this browser tab). Written on logIn / profile-save, removed on logOut, read on boot. Per-device by design — at rebuild this becomes the Supabase Auth session, not a localStorage blob.

cmdKeyLabel [exported from store.js] — a platform-aware command-palette shortcut label: "⌘K" on Mac/iOS, "Ctrl K" elsewhere. Computed from /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent). ACTUAL CONSUMERS (verified 2026-07-03 against the oracle): the inline search-bar kbd chips ONLY — sheet.jsx (the Lists search), profile-page.jsx (the profiles search), landing.jsx (the landing search); community.jsx imports it but never renders it (dead import). The COMMAND PALETTE itself (palette.jsx) does NOT consume it and displays NO shortcut label anywhere — an earlier draft's claim that it feeds a palette open-hint was wrong; adding a palette shortcut hint would be a NEW decision, not oracle behavior. Keep it exported and single-sourced — every search affordance reads this one value.

appConfig START-STATE DEFAULTS (the live seed passed to usePersistentState("appConfig", …)):
  { appName: "Stakeholdr", accent: "#024AD8", brand: "#000000", fiscalStartMonth: 11 /* Nov */, fiscalStartDay: 1 }
FULL persisted appConfig KEY SET the app actually reads (with fallbacks to data.js catalogs when absent): appName, accent, brand, fiscalStartMonth, fiscalStartDay, segments, categories, markets, sites[], issues, tags, functions, orgGoals. (Also brandIcon — optional app-icon data URL, read by the brand mark.) Settings writes each via updateAppConfig({ key: next }).
⚠️ SCHEMA DIVERGENCE TO RECONCILE AT BACKEND BUILD: the SQL app_config table (Database schema box / project/db.js) OMITS several of these columns. The SQL has app_name, accent, brand, brand_icon, fiscal_start_month, fiscal_start_day, issues[], functions[], segments(jsonb), categories(jsonb), invite_code — it is MISSING tags, markets, sites, org_goals, and it renames the audience taxonomy (categories vs the runtime "categories"; an earlier draft used audience/org_goals). Net gaps to add to app_config at backend build: tags text[], markets jsonb, sites jsonb (the { id, city, state?, country } site rule), org_goals text[] (orgGoals). Do NOT lose these — they are live config keys the UI reads today.

SYNCED ENTITIES (each = one usePersistentState table = one Supabase table) — stakeholders · scores · team · workspaces · stakeholderWorkspaces (join) · users · conversations · messages · community · plans · appConfig. PER-DEVICE, NOT synced: currentUser (hp_map_user, this tab's session) and the column-order preference (hp_map_col_order_v3). Exact shapes live in their domain boxes; scores = { [stakeholderId]: { [teamMemberId]: {x,y,createdAt,updatedAt} } }; stakeholderWorkspaces = { [stakeholderId]: [workspaceId,…] }; messages = { [conversationId]: [{id,from,body,at,kind?}] }; appConfig keys per the set above. Every mutable record carries createdAt + updatedAt.

THE SUPABASE SWAP (one file: the Store) — save → supabase.from(table).upsert(changedRow); delete → supabase.from(table).delete().eq('id', id); subscribe → a per-table postgres_changes channel whose callback fires the SAME (table, value=row) shape; apply the incoming ROW into the in-memory collection BY ID (merge — never replace the whole array). The React layer does not change at all. The full SQL schema + RLS + the realtime-swap snippet live in the "Database schema" box IN THIS GUIDE (the old store.js/db.js/BACKEND_TODO files are archived at rebuild — the .io is the only source).

⚠️ TRAP #1 — ROW-LEVEL WRITES (the easy-to-forget killer). TODAY save() persists the WHOLE collection array, which is last-write-wins across users (A edits sh-03, B edits sh-07 at once → second save clobbers the first). When wiring Supabase, EVERY mutation must write only the CHANGED ROW (upsert/delete by id), not the array. Scores: write only the one (stakeholder × teammate) row that changed (PK = stakeholder_id + team_member_id) — never the whole scores object. Use updatedAt for last-modified-wins or a version check for stricter merge. Affected updaters (must each become row-scoped): updateStakeholder, updateWorkspace, updateCommunityApp, updatePlan, updateScore, updateTeam, addStakeholder, addWorkspace, addTeamMember, removeWorkspace, removeUser, removeTeamMember, and the messaging/conversation writers.

⚠️ TRAP #2 — REAL AUTH + RLS. The demo auto-promotes EVERY login to manager (remove that). Roles come from the users table / Supabase Auth, not from login. Wire Supabase Auth (email or SSO) → map to a users row. Enforce RLS (client gating is cosmetic only): scores writable only for the user's own team-member rows; workspace delete restricted to created_by OR manager; appConfig + users.role writable only by managers; plans/community writes scoped to owners/team.

OTHER BACKEND-PHASE ITEMS (captured here, owned by their areas) — COUNTRY LIST: replace the static COUNTRIES snapshot with ISO-3166 (REST Countries API or a countries table); keep the site rule { id, city, state?, country } with US sites forcing country="United States". PRESENCE: the online-avatar stack + People sidebar must be REAL (Supabase Realtime Presence or a last_seen heartbeat), with a TRUE +N overflow, excluding the system bot — not the static presence seed. (The universal custom dropdown is a UI item, captured in the component vocabulary, not persistence.)

REALTIME UX — a change in one place (e.g. a message sent in the sidebar) appears live everywhere (the page, other tabs, other users) because every consumer subscribes to its table. Same code path local or via Supabase.` },
            { t: "Enterprise state model — the universal record envelope (audit · time · timezone · versions · soft-delete)", done: true, d:
`This is the CROSS-CUTTING model wrapped around EVERY entity (stakeholders, plans, community, workspaces, users, scores, messages, notes, votes, …). Captured ONCE here and inherited by all domain boxes so no entity is missed. Source tags: [CODE] in the current app · [SETTINGS] configurable · [SPEC] the user's enterprise requirement, NOT yet in code (capture or it is lost) · [STD] standard enterprise pattern, proposed.

IDENTITY [CODE] — every row has a stable uuid id (crypto.randomUUID), so concurrent multi-user creates never collide and writes are idempotent/retry-safe.

TENANCY [SPEC — add] — every mutable row ALSO carries org_id, the tenant key (see Enterprise architecture pillar 3, Tenancy & org model): every domain table is scoped to an organization and RLS enforces org_id isolation on every read/write (org_id = the authed user's org). org_id is part of THIS envelope, not a per-feature decision — a table extended with the audit columns below but without org_id breaks multi-tenancy. Matches docs/ENTERPRISE_ARCHITECTURE.md §5, which defines the full envelope as: id uuid, org_id, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by, version int.

AUDIT COLUMNS on every mutable row — created_at [CODE], created_by [CODE], updated_at [CODE], updated_by [SPEC — add]. WHO + WHEN for every create and every change.

TIMESTAMP PRECISION [SPEC/FIX — critical] — ALL timestamps stored as UTC ISO-8601 to the MILLISECOND (Postgres timestamptz). The current code is INCONSISTENT — nowStamp() is full ISO but some writers store DATE-ONLY (toISOString().slice(0,10)); that MUST become full millisecond everywhere, because simultaneous edits need distinct, strictly-orderable stamps or they break/clobber. Date-only is allowed ONLY for genuine calendar fields (lastContact, decisionDeadline).

TIME ZONE [SETTINGS] — appConfig.timeZone (default America/Los_Angeles, manager-set). Rule: STORE every timestamp in UTC; DISPLAY in the org time zone. "Created, updated, and approved timestamps are shown in this time zone." Quarters/rollups/cadence compute against it too.

FISCAL MODEL [CODE] — appConfig.fiscalStartMonth + fiscalStartDay → the fiscal YEAR and four equal QUARTERS (see Cadence box). Drives community rollups, scoring cadence, history snapshots, and "FY## Q#" labels. Quarter boundaries derived, never hardcoded.

EDIT VERSIONS / "TIME CAPSULE" [SPEC — add, not in code] — every record change is VERSIONED into a per-record history you can view and RESTORE over time (an audit trail / time machine). Implementation: an APPEND-ONLY versions/audit-log row per change { entity, row_id, org_id, changed_by, changed_at(ms), field-or-diff, before/after } (Tier-2 append → no clobber, full history forever; row shape matches docs/ENTERPRISE_ARCHITECTURE.md §7 record_versions — org_id included so version history is tenant-isolated under RLS like everything else). Viewing = read the row's version list; restore = write a prior version FORWARD as a new change (never destructive). This is an enterprise feature in its own right — capture its UI later (per-record history panel).

SOFT DELETE [STD] — deleted_at + deleted_by instead of hard delete: deletes/replacements propagate in realtime, stay recoverable, and preserve history; lists filter out soft-deleted rows. (Hard delete only where FK cascade + no recovery need.)

OPTIMISTIC CONCURRENCY [STD, per Persistence] — a per-row version (or the ms updated_at) is the conflict token: a write carries the version it read; a newer server version REJECTS it → client re-reads/re-applies. Combined with the THREE-TIER model (records column-level / append-only inserts / collaborative-doc CRDT) and ms precision, simultaneous work CONVERGES instead of overwriting.

APPLIES UNIFORMLY — these columns/mechanisms are added to EVERY entity's schema and to the Store's write path once, not re-decided per feature. The Database-schema box's per-table SQL inherits this envelope (extend each table with org_id/created_by/updated_by/updated_at-ms/deleted_at/deleted_by + the versions/audit table).

⚠️ NOT EXHAUSTIVE YET — the user has flagged there is MORE enterprise backend/state detail than the above ("so much else"). This box is the FRAME; it must be filled out completely from the user's enterprise spec before rebuild. OPEN: enumerate every remaining backend/state field, rule, and solution (see the request in chat) and capture each here verbatim — do NOT invent or assume.` },
                  { t: "Enterprise architecture — the full solution (demo-first → production), 20 pillars", done: true, d:
`What X / Facebook / Slack / Todoist / Claude all needed to be real products — mapped to Stakeholdr. DEMO-FIRST: ship the Demo (seed org + sample users + stakeholders, FULL capability, add dummy AND real people, no backend) → then flip ONE switch to Production (Supabase). Full developer spec: docs/ENTERPRISE_ARCHITECTURE.md (this is the readable outline; that is the build handoff).

ORACLE STATUS — FORWARD-DESIGN. There is deliberately NO code oracle for most of this box: the archive app implements only the Demo-state pieces (localStorage Store, BroadcastChannel, fake auth). The written oracles are docs/ENTERPRISE_ARCHITECTURE.md + project/HANDOFF.md + project/BACKEND_TODO.md, and anything in them not restated here or in a domain box is lost when project/ vanishes at rebuild.

SUPERSESSION NOTE (frontend stack) — docs/ENTERPRISE_ARCHITECTURE.md's intro sentence "Frontend = React + Vite + shadcn/ui + Tailwind (see the .io build guide)" predates the 2026-06-13 Canonical UI ruling and is SUPERSEDED: the rebuilt frontend = React 18 + Vite + this repo's design-system/ ui-* web components ONLY, with the --ui-sys-* token layer as the single styling surface. shadcn/ui, Tailwind, MUI, and Material Web are FORBIDDEN in the rebuilt app. Everything else in that doc stands; do not follow its frontend-stack line.

PILLAR NUMBERING — the 20 pillars below match docs/ENTERPRISE_ARCHITECTURE.md §1–§20 ONE-TO-ONE. (An earlier draft of this box used a divergent numbering — it split the doc's §4 into two pillars and merged §19+§20 into one — which made cross-references ambiguous. That numbering is retired; every "pillar N" cross-reference elsewhere on this .io resolves against THIS doc-aligned list.)

1. CORE PRINCIPLES — one data layer (UI talks only to the repository API: list/get/save(changedRow)/delete/insert/subscribe; no per-feature persistence); server = source of truth; optimistic UI (apply locally → reconcile on echo → roll back on error); multi-tenant from day one; everything auditable (envelope + immutable audit log + time capsule).
2. TWO STATES + THE SWITCH — Demo (default, no cost: localStorage + BroadcastChannel, seeded sample org/users/stakeholders, all actions work, single-device/multi-tab — what clients review) ↔ Production (same repository backed by Supabase Postgres/Realtime/Auth/Storage, true multi-user/device). The switch = ONE config flag (VITE_SUPABASE_URL present → Supabase + Auth required; absent → demo); repository API and every component byte-identical across states.
3. TENANCY & ORG MODEL — organizations (tenants); users belong via memberships(org_id, user_id, role); ALL domain tables carry org_id; RLS: a user sees/writes only their org's rows; org onboarding via invite code (STKH-XXXX-XXXX) and/or SSO domain claim; seats/licensing per org; add-on entitlements (Personas, AI Message Generator).
4. IDENTITY, AUTH & AUTHORIZATION — Supabase Auth: email+password, magic link, SSO/SAML/OIDC for enterprise, optional MFA; session management, password policy, account recovery; map authed user → users row (+ membership); REMOVE any demo auto-promote. RBAC roles = manager (app/org admin), member, workspace lead (creator; can invite/manage their workspace but isn't necessarily an org manager — resolve this distinction), system (bots); per-workspace membership via owners[]. RLS policies mirror UI gates AND enforce tenant isolation: all tables org_id = auth.jwt().org_id; scores writable only for rows whose team_member is the user; workspaces deletable only by created_by or manager; app_config / users.role / fiscal / segments / categories manager-only; plans/community writes scoped to owners/team. RLS is the REAL boundary; UI gating is cosmetic.
   BETA AUTH MODEL — captured verbatim from project/HANDOFF.md ("Auth (beta model — keep simple, as specified)"; project/ is deleted at rebuild, so these rules live HERE): (a) sign up with NAME + EMAIL + PASSWORD + an ORG ACCESS CODE; (b) codes are generated offline per client (e.g. HP-GAPP-7Q2X) and handed to them; (c) on signup the code maps the user to that client's ORG and its WORKSPACES; (d) an INVALID CODE BLOCKS ACCOUNT CREATION; (e) local/demo mode: validate the code against a HARDCODED MAP (no server); (f) supabase mode: an org_codes TABLE, with RLS scoping every row to the user's org so clients never see each other's data; (g) replace the current FAKE auth (login picks a name + auto-grants manager) — manager vs member is a REAL role on the user row. CARRY-FORWARD RULING: all seven rules carry forward into this pillar's model — the Org Access Code IS pillar 3's invite code (format evolved from the per-client HP-GAPP-7Q2X style to STKH-XXXX-XXXX); the signup field set, invalid-code-blocks-creation rule, code→org+workspaces mapping, demo hardcoded-map validation, and org_codes table all stand. Supabase Auth's fuller menu (magic link, SSO/SAML/OIDC, MFA) is LAYERED ON TOP for production/enterprise — it does not replace the code-gated signup.
5. DATA MODEL & INTEGRITY — the universal record envelope on every mutable row (id uuid, org_id, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by, version int — see the Enterprise state model box); UTC timestamptz at ms precision (date-only only for true calendar fields), displayed in the org time zone; FKs with on delete cascade; soft-delete for recoverable removes; NORMALIZE collections to their own rows (never JSON blobs guarded by one timestamp): notes, score-history snapshots, plan strategies/tactics/phases, votes, feedback, attachments; array-of-id fields → join tables or set ops. Full per-table SQL = the Database schema box.
6. STATE, REALTIME & COLLABORATION — three tiers: Tier 1 records (column-level upserts of changed fields; optimistic concurrency via version/ms updated_at, stale write rejected → re-read/re-apply; realtime merge-by-id) · Tier 2 append-only (messages, notes, feedback, votes, score history: inserts/keyed upserts, no conflict by construction) · Tier 3 collaborative documents (Whiteboard, long-form plan text: CRDT (Yjs), live cursors/presence, persisted doc state). Supabase Realtime: postgres_changes (data) + Presence (online/cursors) + Broadcast (ephemeral). Offline queue: buffer mutations, flush on reconnect.
7. VERSIONING & AUDIT (the "time capsule") — append-only record_versions { entity, row_id, org_id, changed_by, changed_at(ms), before, after/diff } per record change; view history; restore = write a prior version FORWARD (never destructive). Immutable audit log for security/compliance (auth events, permission changes, exports, deletes, admin actions). Activity feed (workHQ Developments/Alerts) derived from these.
8. ARCHIVES, RETENTION & BACKUP — soft-delete + an Archive state for plans/workspaces (revisit, export, restore); retention policy per data class + scheduled purge of expired soft-deletes; backups/PITR (Supabase point-in-time recovery) + periodic logical export; exports: plan → single Word/PDF, tables → CSV, org data export for compliance.
9. FILES & MEDIA — Supabase Storage buckets: attachments, stakeholder photos, plan exports, whiteboard assets; signed URLs, size/type limits, optional virus scan, CDN.
10. BACKGROUND JOBS & SCHEDULING — Edge Functions/cron: fiscal-year rollover (at quarter/year close snapshot each stakeholder's weighted position into score_history + notify teams to re-score), rescore reminders, digest emails, FX-rate refresh (community currency), notification fan-out, soft-delete purge.
11. NOTIFICATIONS — in-app (badges/inbox) + transactional email (Resend/Postmark/Supabase); @-mentions (Messaging/Whiteboard), invites, rescore reminders, community vote requests, plan deadlines; per-user preferences + digests.
12. INTEGRATIONS — connector pattern, secrets in vault, never inline keys: real-time FX conversion (community multi-currency, historic-rate lock), URL unfurl/oEmbed/page-metadata (Whiteboard news/social capture), ISO-3166 countries (replace static list); roadmap: LegiScan, Quorum, CRM, marketing platforms, Google Drive, social feeds.
13. SEARCH — Postgres full-text (or pgvector/external) across stakeholders, plans, community, messages, notes — org-scoped, RLS-respecting.
14. SECURITY & COMPLIANCE — TLS + at-rest encryption; secrets vault; least privilege; RLS tenant isolation as the real boundary; compliance targets SOC 2 Type II, GDPR + CCPA (data subject export/delete, consent, DPA), PII handling, configurable data residency; rate limiting, input validation/sanitization, CSP, dependency scanning, audit logging of sensitive actions.
15. OBSERVABILITY — structured logging; error tracking (Sentry); metrics/uptime/alerting; query performance monitoring.
16. PERFORMANCE & SCALE — indexes on FKs + hot filters; pagination/virtualization for large tables; connection pooling (Supabase pooler); caching; avoid N+1; realtime fan-out limits.
17. BILLING & LICENSING — Stripe subscriptions (per-seat), org plans, add-on gating (Personas, AI Message Generator), usage metering for metered features. (Detail: the Paid add-ons box.)
18. ADMIN & SUPPORT — org admin console (members, roles, fiscal, segments/categories, branding, invite code, billing); audited support impersonation; feature flags; status page; in-app help; the 12-step framework + zone legend.
19. MIGRATIONS & ENVIRONMENTS — versioned SQL migrations (Supabase CLI); zero-downtime; seed scripts for demo; environments: demo (GitHub Pages), staging, production; CI/CD; secrets per env.
20. TESTING & VERIFICATION — the .io traceability manifest (every entity × mutation × realtime path) + the build-breaking guard (no hand CSS / forbidden patterns) + e2e/contract tests against the repository API + a verification checklist per feature.
   GO-LIVE ACCEPTANCE — captured verbatim from project/HANDOFF.md "Verify-nothing-broke checklist (run after Supabase wiring)" (project/ vanishes at rebuild, so the five checks live HERE; run every one after the State-B switch is flipped):
   (1) Create / edit / delete each entity → reload → survives, AND a SECOND user/browser sees it (true multi-user, not just cross-tab).
   (2) Scoring writes only the current user's column; others read-only and update live.
   (3) Workspace/org isolation: a user with one org's code cannot see another org's data.
   (4) Manager-only actions blocked for members at the DB level (not just hidden in UI).
   (5) No console errors on any screen; all screens match the approved design.

This box is the FRAME and the menu; each pillar's detail is in its domain box and in docs/ENTERPRISE_ARCHITECTURE.md. As we capture each module we tie its rows/jobs/permissions back to these pillars.` },
                        { t: "Database schema (Supabase) — full SQL + RLS + realtime swap (captured here; source files vanish at rebuild)", done: true, d:
`The complete Postgres schema for STATE B (Supabase). Captured verbatim into the .io because db.js will not exist at rebuild — this guide is the only source. Column case: SQL is snake_case; the in-memory/JSON is camelCase (map at the transport boundary). TIMESTAMP WARNING: in THIS DRAFT only the scores table carries the full created_at + updated_at pair — most tables are missing envelope columns the app and the concurrency model require; see DISCREPANCY #4 below, which is MANDATORY to resolve before pasting. PASTE-SAFETY RULE: any statement whose last column line ends in a "--" comment MUST have its closing ");" on its OWN line (a terminator placed after "--" on the same line is commented out and the statement never closes) — app_config below is written that way deliberately.

create table users (
  id uuid primary key, name text not null, first_name text, last_name text,
  title text, function text, markets text[] default '{}', regions text[] default '{}',
  email text unique, avatar_color text, avatar_url text,
  role text not null default 'member' check (role in ('manager','member','system')) );

create table workspaces (
  id uuid primary key default gen_random_uuid(), name text not null,
  segment text not null, business_unit text not null,
  owners uuid[] not null default '{}',
  created_by uuid references users(id), created_at timestamptz default now() );

create table stakeholders (
  id uuid primary key default gen_random_uuid(), is_person bool default false,
  title text, title_other text, first_name text, last_name text, name text, org text,
  url text, photo text, email text, phone text, x_account text,
  country text, state text, city text, zip text,
  category text, type text, market text, region text, geography text,
  issues text[] default '{}', priority text, status text, tags text[] default '{}',
  owners uuid[] not null default '{}',
  notes text, notes_history jsonb default '[]', history jsonb default '[]',
  created_by uuid references users(id), created_at timestamptz default now(), last_contact date );

create table stakeholder_workspaces (
  stakeholder_id uuid references stakeholders(id) on delete cascade,
  workspace_id   uuid references workspaces(id)   on delete cascade,
  primary key (stakeholder_id, workspace_id) );

create table team_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  weight numeric not null default 1.0, unique (workspace_id, user_id) );

create table scores (
  stakeholder_id uuid references stakeholders(id) on delete cascade,
  team_member_id uuid references team_members(id) on delete cascade,
  x numeric not null check (x between -10 and 10),
  y numeric not null check (y between -10 and 10),
  created_at timestamptz default now(), updated_at timestamptz default now(),
  primary key (stakeholder_id, team_member_id) );

create table conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null, participants uuid[] not null, title text );

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  from_user uuid references users(id), body text, kind text, at timestamptz default now() );

create table app_config (
  id int primary key default 1,
  app_name text, accent text, brand text, brand_icon text,
  fiscal_start_month int, fiscal_start_day int,
  issues text[], functions text[],
  segments jsonb,    -- { [segment]: [business unit, …] }  (manager-editable)
  categories jsonb,  -- { [category]: [audience type, …] } (manager-editable)
  invite_code text   -- org join code STKH-XXXX-XXXX (regen = support request)
);

create table community_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null, kind text, stage text,
  summary text, description text, rationale text,
  submitter uuid references users(id), submitter_role text, date_submitted date,
  represented_stakeholder uuid references stakeholders(id),
  recipient text, linked_stakeholders uuid[] default '{}',
  markets text[] default '{}', regions text[] default '{}', issues text[] default '{}',
  ask_type text, amount numeric, unit text, recurrence text, years int,
  giving_mode text,                 -- Monetary | In-Kind | Mix (Corporate Giving)
  timeline text, decision_deadline date, date_approved date,
  budget jsonb default '{}', approved_amount numeric,
  license_to_operate int, relationship_impact int,
  risk jsonb default '{}', attachments jsonb default '[]',
  owners uuid[] default '{}', created_by uuid references users(id), created_at timestamptz default now() );
  -- NOTE: extend per the Community box — currency per amount, monetized hours/in-kind value,
  -- committed_fx_rate + committed_fx_date (historic-rate lock), approver_id + approved_at (manager).

create table community_votes (
  application_id uuid references community_applications(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  choice text check (choice in ('for','against','abstain')),
  primary key (application_id, user_id) );

create table plans (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  title text, sector_model text, goal_model text, market text, region text,
  owners jsonb, summary text, status text,
  scenario_solves text, scenario_approach text, scenario_outcome text,
  goals jsonb, issues jsonb, goal_notes jsonb, team jsonb,
  strategies jsonb,        -- extend to tactics[]/phases[] per the Plan box
  community_ids jsonb, priority_overrides jsonb, measurement text, updated_at date );
  -- NOTE: extend per the Plan box — sponsors, consultants, tactic assignees (teammate/
  -- stakeholder/consultant), phases w/ timeframes, per-stakeholder involvement/risk/
  -- opportunity, predictions, key_messages, feedback (-> stakeholder note).

ROW-LEVEL SECURITY (mirrors the UI gates; client gating is cosmetic, RLS is real) —
• scores: a user may write only rows whose team_member belongs to them:
    create policy "score yourself" on scores for all using (
      exists (select 1 from team_members tm where tm.id = team_member_id and tm.user_id = auth.uid()));
• workspaces: delete restricted to created_by OR role='manager'.
• app_config + users.role: writable only by role='manager'.
• plans / community: writes scoped to owners/team.

REALTIME SWAP (inside the Store, State B) —
  for (const table of TABLES) {
    supabase.channel('rt:' + table)
      .on('postgres_changes', { event: '*', schema: 'public', table }, payload => notify(table, payload.new))
      .subscribe();
  }
  Store.save(table, row) -> await supabase.from(table).upsert(row); delete -> .delete().eq('id', id).
notify(table, row) is the SAME callback the demo's BroadcastChannel uses — merge the incoming row by id.

DISCREPANCIES TO RESOLVE (schema-draft vs current app — decide at build) —
1. TEAM SCOPE: this schema drafts team_members PER WORKSPACE (workspace_id FK), but the current app uses ONE GLOBAL team + one global score-set per stakeholder (see Scoring box). Decide: global (as captured/working) vs per-workspace (as drafted). If global, drop workspace_id from team_members (or make scores key on a global team).
2. PLANS PER WORKSPACE: the CURRENT live project/db.js (line ~169) itself declares plans.workspace_id UNIQUE — "workspace_id uuid references workspaces(id) on delete cascade unique", one plan per workspace — not merely an earlier draft; app.jsx carries the matching stale comment ("One plan per workspace; upsert by workspaceId"). The CODE contradicts both: updatePlan upserts by plan.id, newPlan always appends a fresh plan, and the Plans landing shows MULTIPLE plans per workspace. So the SQL above DELIBERATELY DROPS the unique (many plans per workspace) — a knowing departure from the db.js text on this one column, not a faithful copy of it. Confirm.
3. COMMUNITY: votes are a separate community_votes table (normalized) vs the in-memory votes{} object — the transport maps between them.
4. TIMESTAMP ENVELOPE (MANDATORY — the draft SQL cannot be pasted verbatim): the db.js draft OMITS the audit-timestamp columns on most tables — users has NEITHER created_at nor updated_at; workspaces, stakeholders, and community_applications have created_at ONLY; conversations and app_config have NONE; plans has only "updated_at date" (a date, not a timestamptz); team_members has neither (the runtime stamps createdAt/updatedAt on team-member rows via addTeamMember/updateTeam); only scores carries the full created_at + updated_at pair. This contradicts the running app and the spec: the runtime updaters DO stamp updatedAt (updateStakeholder, updateWorkspace, updateTeam, updateScore all write updatedAt = nowStamp()), the tab-bar "Updated" meta reads (updatedAt || createdAt) across stakeholders and workspaces, and the Persistence box's Tier-1 optimistic concurrency requires updated_at (or a version integer) on EVERY mutable record. The backend build MUST add created_at timestamptz default now() AND updated_at timestamptz default now() to every mutable table — users, workspaces, stakeholders, team_members, conversations, community_applications, plans (REPLACING plans' "updated_at date"), and app_config — per the enterprise-envelope box (which also adds created_by/updated_by, version, deleted_at). The SQL above is preserved as the db.js draft stood (EXCEPT the plans workspace_id unique, deliberately dropped per #2); #4 is the correction layer on top of it.` },
                              { t: "Catalogs — the shared option lists (verbatim) + which are manager-editable", done: true, d:
`The shared taxonomies every module draws from. Captured verbatim (the .io is the only source). Most ship as SEEDED DEFAULTS and become MANAGER-EDITABLE via Settings (persisted to appConfig); a few are FIXED enums.

CATEGORIES → AUDIENCE TYPES [EDITABLE: appConfig.categories; Settings → Stakeholders] —
• Communities: Charity Organization · Church · Community Alliance · Higher Education · K-12 Educator · Local Business · Media · Military Branch · Neighbor · NGO · Tribes · Veterans · Youth Program · Activist Organization · Activist Member · General Public
• Government: Agency (Inspector) · Agency (Permit Writer) · City Council Member · City Government · County Government · County Supervisor · Governor's Office · Judicial · Mayor · Regulator (Federal) · Regulator (State) · Regulator (Local) · State Representative · State Senate · US Congress · US Senate
• Our People: Community Outreach Lead · Diversity & Inclusion Lead · Executive · General Employee · Former Employee · Contractor · Operations Manager · Marketing Manager · Sales Manager · Retiree
• Industry: Competition · Supply Chain · Trade Association · Channel Partners · Industry Analysts · Business Coalition · Economic Development · Labor Union
• Consumers: Industry Consumers · Current Customers · Future Customers · Lost Customers
• Investors: Board Member · Shareholder · Activist Shareholder · General Public Investor
(Cascade: choosing a Category sets the Type options to that category's list.)

MARKETS → REGIONS [EDITABLE; Settings → Geography] — Americas: United States · Canada · Mexico | LATAM: Brazil · Other Countries | EMEA: Europe · Middle East · Africa | APJ: Emerging APAC · Japan. (Cascade: Market sets Region options.)

GEOGRAPHIES [FIXED enum] — National (all) · Federal · State · Local.

SEGMENTS → BUSINESS UNITS [EDITABLE: appConfig.segments; Settings → Your Structure] — Personal Systems: Commercial PCs & Laptops · Consumer PCs · Other Products · Services | Printing: Hardware · Supplies · Graphics & 3D Printing | Corporate Investments: Poly · HyperX | Corporate Functions: Marketing · Communications · Legal / GA&PP · HP Foundation · Supply Chain · SLED. (A workspace picks one (segment, BU) pair.)

ISSUES [EDITABLE: appConfig.issues] — Procurement Reform · Sustainability · AI · Education · Taxation · Site Operations · Supply Chain. (Reused by stakeholders, plans, community.)

TAGS [EDITABLE: appConfig tags] — public-official · key-influencer · coalition · ally · press · skeptical · workforce · federal · activist · environmental · regulator · education · partner · faith · veterans · board · health · investor · internal · exec · sovereign · cultural · local-gov · eu · ngo · industry · recycling · supplies.

FUNCTIONS [EDITABLE: appConfig.functions; Settings → Your Structure] — Operations · Human Resources · Strategy · Research · Site Management · Sales · Marketing · Communications · Legal · Government Affairs · Community Relations · Intern. (User function field.)

ORG_GOALS [EDITABLE: managers, Settings → appConfig.orgGoals] — the 3 exact seed strings, verbatim:
1. "Defend the company's license to operate across key US markets"
2. "Build trust capital with regulators and community leaders"
3. "Position for upcoming permitting and modernization approvals"
(Inheritance is LIVE, not copy-on-create. The effective org-goal list = appConfig.orgGoals when non-empty, else this seed. Every plan's editor Section 2 "Aligning With Organizational Goals" renders that CURRENT list read-only — one goal title per row — with a per-goal textarea (placeholder "How does this plan work to achieve this goal in this workspace?") writing plan.goalNotes[goalText]; the plan read view renders the same live list with its notes. There is NO per-plan goal add/remove/edit UI anywhere. Consequences to preserve: a manager editing goals in Settings changes what EVERY plan displays immediately; and because goalNotes is keyed by the goal STRING, renaming a goal orphans notes written under the old text (known behavior, keep or key by goal id at build — decide with the user). newPlan sets goals: [] and plan.goals is a DEAD field: only the seed plan plan-gapp-na ships a populated goals array and NO code ever reads plan.goals. DO-NOT-REPLICATE the old plumbing: app.jsx makes the live list visible to the plan editor by MUTATING the imported catalog object (D.ORG_GOALS = companyGoals) — the rebuild must pass org goals as real state/props from appConfig, never mutate a module constant. Full Section-2 spec lives in the Plan-page box.)

PRIORITY [FIXED enum] — High · Medium · Low. STAKEHOLDER STATUS [FIXED enum] — Active · Watch · Dormant.

COMMUNITY [FIXED enums] — KINDS: Philanthropy · Volunteering · Corporate Giving · Political Action (PAC) · Sustainability · Social Impact. STAGES: Idea · Proposed · Under Review · Approved · Active · Complete · Declined. ASK TYPES: Funding · Volunteer hours · Endorsement · In-kind · Political contribution. RECURRENCE: One-time · Annual · Multi-year. GIVING MODES (Corporate Giving): Monetary · In-Kind · Mix.

PLAN_STEPS (the 12-step Purpose / Plan / Execute engagement framework — in data.js an array of three { phase, items[4] } entries), verbatim and in order:
• Purpose: "Set goals for your organization" · "Issue identification" · "Stakeholder identification" · "Stakeholder prioritization"
• Plan: "Landscape analysis" · "Cross-functional alignment" · "Research & listening sessions" · "Early stakeholder analysis & modeling"
• Execute: "Launch campaign" · "Ongoing stakeholder analysis" · "Collaborate with stakeholders" · "Realize shared value where possible"
(DEAD EXPORT — oracle truth: data.js exports PLAN_STEPS with the comment "shared with Help", but NO module imports it; help.jsx HARDCODES its own copy of the 12 steps, and that copy DIVERGES at step 6 — help.jsx renders "Cross-functional teams alignment" where PLAN_STEPS has "Cross-functional alignment". The Plan box's 12-step list matches PLAN_STEPS; the Help box captures the help.jsx wording verbatim as that page's oracle truth. At rebuild, single-source the 12 steps in the catalog module and RULE with the user which step-6 wording wins — do not silently ship both.)

TITLES (honorifics catalog used by the stakeholder modal's Title dropdown for person-type stakeholders) [FIXED enum] — the exact, ordered list: None · Senator · Representative · Assemblymember · Governor · Mayor · County Supervisor · Councilmember · City Councilmember · CEO · Director · Other. Selecting "Other" reveals a free-text titleOther field where the user types a custom title.
• abbrevTitle map (full → abbreviated form, used when composing a person's display name e.g. "Sen. Jane Doe"): Senator → "Sen." · Representative → "Rep." · Assemblymember → "Asm." · Governor → "Gov." (titles not in this map render their full word; "None" contributes no prefix).

SITES [EDITABLE: appConfig.sites; Settings → Geography] — operating sites { id, city, state?, country }. VALIDITY RULE (the site editor's four modes, authoritative spec = the SiteSettings capture in the Settings box): a site is created in one of FOUR modes — us / ca / mx / intl. For us, ca, AND mx a state/province is REQUIRED (picked from US_STATES, CA_PROVINCES, or MX_STATES respectively) and country is DERIVED from the mode via the map { us: "United States", mx: "Mexico", ca: "Canada" } — never typed. Only "intl" (Other country) sites are country-only, with NO state, country picked from COUNTRIES minus United States/Canada/Mexico. So state is present exactly when country is United States, Canada, or Mexico — NOT "US only". (data.js carries a seed comment "US sites carry a state; non-US carry a country" — true only because the seed happens to contain only US sites; the editor rule above is the real invariant. Do not encode a "state only if US" validation.) Seed (5 sites, all US): Palo Alto/California · Houston/Texas · Corvallis/Oregon · Vancouver/Washington · Washington/District of Columbia — each with country "United States".

LOCATION LISTS (verbatim, static — fine to ship as constants except COUNTRIES) —

US_STATES (51 entries; 50 states + District of Columbia), in this exact order:
Alabama · Alaska · Arizona · Arkansas · California · Colorado · Connecticut · Delaware · District of Columbia · Florida · Georgia · Hawaii · Idaho · Illinois · Indiana · Iowa · Kansas · Kentucky · Louisiana · Maine · Maryland · Massachusetts · Michigan · Minnesota · Mississippi · Missouri · Montana · Nebraska · Nevada · New Hampshire · New Jersey · New Mexico · New York · North Carolina · North Dakota · Ohio · Oklahoma · Oregon · Pennsylvania · Rhode Island · South Carolina · South Dakota · Tennessee · Texas · Utah · Vermont · Virginia · Washington · West Virginia · Wisconsin · Wyoming.

MX_STATES (32 entries; 31 states + Ciudad de México), in this exact order:
Aguascalientes · Baja California · Baja California Sur · Campeche · Chiapas · Chihuahua · Ciudad de México · Coahuila · Colima · Durango · Guanajuato · Guerrero · Hidalgo · Jalisco · México · Michoacán · Morelos · Nayarit · Nuevo León · Oaxaca · Puebla · Querétaro · Quintana Roo · San Luis Potosí · Sinaloa · Sonora · Tabasco · Tamaulipas · Tlaxcala · Veracruz · Yucatán · Zacatecas.

CA_PROVINCES (13 entries; provinces + territories), in this exact order:
Alberta · British Columbia · Manitoba · New Brunswick · Newfoundland and Labrador · Northwest Territories · Nova Scotia · Nunavut · Ontario · Prince Edward Island · Quebec · Saskatchewan · Yukon.

STATE_ABBR (US state/territory name → USPS 2-letter code; 51 entries, used by siteLabel and any "City, AA" rendering; US names ONLY — Canadian provinces and Mexican states are NOT in this map):
Alabama→AL · Alaska→AK · Arizona→AZ · Arkansas→AR · California→CA · Colorado→CO · Connecticut→CT · Delaware→DE · District of Columbia→DC · Florida→FL · Georgia→GA · Hawaii→HI · Idaho→ID · Illinois→IL · Indiana→IN · Iowa→IA · Kansas→KS · Kentucky→KY · Louisiana→LA · Maine→ME · Maryland→MD · Massachusetts→MA · Michigan→MI · Minnesota→MN · Mississippi→MS · Missouri→MO · Montana→MT · Nebraska→NE · Nevada→NV · New Hampshire→NH · New Jersey→NJ · New Mexico→NM · New York→NY · North Carolina→NC · North Dakota→ND · Ohio→OH · Oklahoma→OK · Oregon→OR · Pennsylvania→PA · Rhode Island→RI · South Carolina→SC · South Dakota→SD · Tennessee→TN · Texas→TX · Utah→UT · Vermont→VT · Virginia→VA · Washington→WA · West Virginia→WV · Wisconsin→WI · Wyoming→WY.

COUNTRIES [REPLACE: do NOT hand-maintain] — a static, sorted 2026 snapshot of sovereign states, EXACTLY 196 entries, that ships as a generated constant, NOT a hand-curated literal. data.js's own comment calls it "UN members + observers" but the actual list is not strictly that set: it INCLUDES Taiwan (neither a UN member nor an observer) and EXCLUDES Kosovo. It is generated, not transcribed; at production it is replaced by an ISO-3166-1 source (API or table) per the Persistence/Integrations boxes — WITH A PINNED FILTER RULE: regenerate SOVEREIGN STATES ONLY (the UN members + observers + Taiwan set, 196 as of 2026), NEVER the full ISO-3166-1 code list (~249 codes including territories like Hong Kong or Puerto Rico), or the rebuilt picker's membership drifts from the oracle's sovereign-only list. The Site "Other country" picker FILTERS OUT United States / Canada / Mexico from COUNTRIES (those three are handled by the us/ca/mx site modes and are first-class region-countries on the Markets→Regions axis), so the picker only offers the remainder. Because it is regenerated from the ISO source at build under that sovereign-only filter, the exact 196-element list is NOT load-bearing and is deliberately not transcribed here.

REGION_COUNTRIES (the exact array — region values on the Markets→Regions axis that ARE real countries, used by resolveCountries to bridge the org's region axis to actual countries):
["United States", "Canada", "Mexico", "Brazil", "Japan"].

LOCATION HELPERS (plain-text formulas; single-source these in the location module) —
• siteLabel(site): returns "" if no site. Otherwise renders "City, TAIL" where TAIL = (if the site has a state) STATE_ABBR[state] (falling back to the raw state name if not in the map), else (if it has a country) the country, else "". Result: "City, AA" for US sites (e.g. "Palo Alto, CA"); "City, FullProvinceOrStateName" for Canadian/Mexican sites (they carry a state but STATE_ABBR has US entries only, so the raw name renders, e.g. "Toronto, Ontario"); "City, Country" for intl (country-only) sites; bare "City" if neither state nor country is present.
• resolveCountries(regions, site): computes the effective country set for a record by unioning two Venn circles — (1) any entries in regions[] that appear in REGION_COUNTRIES, plus (2) the assigned site's country (look the site up by id in SITES; add its .country if present). Then: if the resulting set is non-empty, return it as an array WITH "Other Countries" removed (a stated concrete region-country overrides the generic "Other Countries"). Else, if regions[] includes "Other Countries", return ["Other Countries"]. Else return [].
• Site country rule: a site's country is NEVER free-typed for US/Canada/Mexico — it is derived from the editor mode ({ us: "United States", mx: "Mexico", ca: "Canada" }), and those three modes each REQUIRE a state/province (US_STATES / CA_PROVINCES / MX_STATES). Only "Other country" sites carry a free-picked country and no state. Enforced when managers add/edit sites in Settings → Geography; the authoritative editor spec (fields, placeholders "Select state…"/"Select province…"/"Select country…", id generation, chip rendering) is the SiteSettings capture in the Settings box.

ELSEWHERE (not re-listed here) — the 14 RELATIONSHIP ZONES (color/strategy/action) live in the Relationship-engine box; the PLAN ALGORITHM models + FACTORS live in the Plan-algorithm + Factor-key boxes; the DEMO SEED DATASET (sample stakeholders/users/team/workspaces/scores/etc.) lives in the Demo-seed-dataset box that follows.

USAGE — every dropdown/filter/chip pulls from these. Editable catalogs render as add/remove list editors in Settings; fixed enums are constants. In the build, expose ONE typed catalog module = appConfig (editable) + constants (fixed) + a location module (US_STATES/MX_STATES/CA_PROVINCES/STATE_ABBR/REGION_COUNTRIES/COUNTRIES + siteLabel/resolveCountries).` },
            { t: "Demo seed dataset — shape + canonical sample (fresh fixtures regenerated at rebuild)", done: true, d:
`WHAT THIS IS — the demo / STATE-A seed dataset that boots the app with a believable HP, Inc. world (no backend). RULING (the user's call): do NOT transcribe every demo value. The demo fixtures are ILLUSTRATIVE, not app logic — the LOSSLESS part of the app is the LOGIC / CATALOGS / HELPERS (Catalogs box, Relationship-engine, Plan-algorithm, location helpers, scoring math). At rebuild we REGENERATE fresh fixtures of the IDENTICAL SHAPE so the demo is faithful in FORM. This box captures (a) the entity counts + shape, (b) a small CANONICAL SAMPLE captured verbatim where exactness matters (the three Map-history trails + one fully-worked stakeholder record), and (c) what is safe to regenerate.

ENTITY COUNTS + SHAPE —

• STAKEHOLDERS — 20 records, ids sh-01 … sh-20. Each is an identity block; (x, y) map position is NOT stored, it is computed live from SEED_SCORES via weightedCoord. Fields per record: id; isPerson? (true for people; absent for orgs); firstName/lastName/title/titleOther (people only); name (display name); org; email; phone; xAccount (Twitter/X handle); category (one of the 6 CATEGORIES keys); type (an audience type within that category); market / region / geography (the three-axis location replacing the old single region); state?/site? (US records carry a state and/or a site id); issues[] (subset of ISSUES); priority (High/Medium/Low); tags[] (subset of TAGS, may include inline custom tags); owners[] (user ids); lastContact (YYYY-MM-DD); status (Active/Watch/Dormant); notes (free text); history[]? (OPTIONAL quarterly position trail — present on only 3 records; see CANONICAL SAMPLE). The 20 span 5 OF THE 6 categories — Communities 9 · Government 5 · Industry 3 · Investors 2 · Our People 1; the seed contains NO Consumers record (a regenerated seed faithful in FORM matches this 5-category shape unless all-6 coverage is explicitly ruled as an improvement) — and the Americas (16) / EMEA (3) / LATAM (1) markets.

• USERS — 8 records (the HP user pool the logged-in user is chosen from). Shape: { id, name, title, email, avatarColor (stable per user), presence (online/away/offline), role (manager/member/system) }. Includes the Reminders bot: id "u-system", name "Reminders", title "Automated reminders", email "noreply@hp.com", avatarColor "#1F1A14", presence "online", role "system" (the only system-role user; authors automated reminder messages). The other 7: u-alex (Alex Rivera, manager), u-jordan (Jordan Kim, manager), u-sam (Sam Okafor, member), u-priya (Priya Patel, manager, away), u-devon (Devon Wright, member), u-marisol (Marisol Aguilar, member, offline), u-kenji (Kenji Tanaka, member). role "manager" can delete any workspace; "member" can only delete workspaces they created.

• TEAM — a 5-member scoring team (the people whose scores weight into each stakeholder's map position). Shape: { id, userId, weight }. The EXACT weights are load-bearing (they drive weightedCoord) and must be reproduced verbatim:
  tm-alex → userId u-alex → weight 1.5
  tm-jordan → userId u-jordan → weight 1.2
  tm-sam → userId u-sam → weight 1.0
  tm-priya → userId u-priya → weight 0.8
  tm-devon → userId u-devon → weight 0.7
  (Only these 5 teammates appear in SEED_SCORES; weightedCoord ignores any teammate with weight <= 0 or no score.)

• WORKSPACES — 6 records. Shape: { id, name, segment, businessUnit, owners[], createdBy, createdAt }. Plus the implicit __master workspace (the all-up view). The named 6: ws-gapp-na ("Hawk"), ws-gapp-emea ("Climate Change in Europe"), ws-ps-comm ("Imagine Event"), ws-print-supp ("Clone Cartridges"), ws-foundation ("Future of Work at HP Foundation"), ws-sled ("Google Beam Tour"). Two are explicitly referenced downstream: ws-gapp-na (carries the seed plan + most stakeholders) and ws-gapp-emea (the EMEA stakeholders). Each picks one (segment, businessUnit) pair from the SEGMENTS catalog.

• STAKEHOLDER_WORKSPACES — a many-to-many JOIN mapping each stakeholder id → the array of workspace ids it appears in (e.g. sh-01 → [ws-gapp-na, ws-sled]). 20 keys, one per stakeholder.

• PLANS — 1 seed plan, plan-gapp-na ("FY26 Hawk Engagement Plan"), scoped to workspace ws-gapp-na. Carries sectorModel "energy" and goalModel "shared-value" (these select the SEP scoring formulas — see Plan-algorithm box). Also: owners [u-jordan, u-alex], status "Active", a summary, the 3 ORG_GOALS copied into goals[], issues [Site Operations, Sustainability], a 3-person team[] with roles, 2 strategies[], measurement text, and empty communityIds/priorityOverrides. Full plan field structure lives in the Plan box; the model selection is the load-bearing detail.

• COMMUNITY — 4 community/foundation applications, ids ca-01 … ca-04 (one per major KIND): ca-01 Philanthropy (STEM grant, Approved/Active), ca-02 Volunteering (river cleanup, Proposed), ca-03 Political Action PAC (Under Review), ca-04 Corporate Giving / In-Kind (LATAM e-waste, Approved). Shape per app: identity + kind + stage + summary/description/rationale + submitter + representedStakeholderId + recipient + linkedStakeholders[] + markets/regions/issues + ask (askType/amount/unit/recurrence/years) + timeline/decisionDeadline + budget{} + approval fields + licenseToOperate/relationshipImpact scores + risk{} + attachments[] + votes{} + owners/createdBy/createdAt. Full field set in the Community box.

• CONVERSATIONS — 5 conversations. Shape: { id, kind (direct/group/system), participants[], title }. c-001 (direct u-jordan/u-sam), c-002 (direct u-jordan/u-alex), c-003 (group "EMEA pre-meeting"), c-004 (group "Cedar Valley Tribes consultation"), and c-system (kind "system", title "Reminders", all 8 users as participants incl u-system — the channel the Reminders bot posts into). Direct conversations are keyed by the sorted userId pair; groups + system by their id.

• MESSAGES — a seed map keyed by conversation id → array of { id, from (userId), body, at (ISO datetime) }. The seed map has keys for ONLY c-001 (3 messages), c-002 (2), c-003 (2), c-004 (1); there is NO c-system key — the Reminders channel exists as a CONVERSATION but ships EMPTY of messages (the seed contains zero automated-reminder messages; do NOT invent seeded bot posts).

• SEED_SCORES — the scoring matrix: SEED_SCORES[stakeholderId][teamMemberId] = { x, y }, each integer in -10..10. 20 stakeholders × 5 teammates = 100 score cells, hand-picked so the dots distribute across all interesting relationship zones. This is what weightedCoord reads to place each dot. Regenerated at rebuild as a 20×5 matrix of plausible -10..10 scores.

CANONICAL SAMPLE (verbatim — these MUST be exact) —

THE THREE MAP-HISTORY TRAILS. Only 3 of the 20 stakeholders carry a history[] array (the quarterly position trail the Map's "history" feature animates / draws as a path). Each entry is { quarter, x, y, recordedAt }. Reproduce these exactly:

• sh-01 (Mayor Maria Chen) history:
  { quarter: "FY26 Q1", x: 1, y: 6, recordedAt: "2026-01-31" }
  { quarter: "FY26 Q2", x: 2, y: 7, recordedAt: "2026-04-30" }
  { quarter: "FY26 Q3", x: 3, y: 8, recordedAt: "2026-07-31" }

• sh-06 (Save Our River Coalition) history:
  { quarter: "FY26 Q1", x: -5, y: 3, recordedAt: "2026-01-31" }
  { quarter: "FY26 Q2", x: -6, y: 5, recordedAt: "2026-04-30" }
  { quarter: "FY26 Q3", x: -8, y: 7, recordedAt: "2026-07-31" }

• sh-12 (Helios Capital) history:
  { quarter: "FY26 Q1", x: -3, y: 4, recordedAt: "2026-01-31" }
  { quarter: "FY26 Q2", x: -5, y: 5, recordedAt: "2026-04-30" }
  { quarter: "FY26 Q3", x: -7, y: 5, recordedAt: "2026-07-31" }

(The remaining 17 stakeholders have NO history[]; the Map shows only their current computed position. These three exact trails are referenced by the Map history feature, so they are load-bearing and captured verbatim.)

ONE FULLY-WORKED STAKEHOLDER RECORD (sh-01, every field populated — the canonical shape of a person-type record):
  id: "sh-01"
  isPerson: true
  firstName: "Maria" · lastName: "Chen" · title: "Mayor"
  name: "Mayor Maria Chen"
  org: "City of Cedarville"
  email: "mchen@cedarville.gov" · phone: "(503) 555-0142" · xAccount: "@MayorMariaChen"
  category: "Government" · type: "Mayor"
  market: "Americas" · region: "United States" · geography: "Local"
  state: "California" · site: "site-paloalto"
  issues: ["Site Operations", "Sustainability"]
  priority: "High"
  tags: ["public-official", "key-influencer"]
  owners: ["u-jordan", "u-sam"]
  lastContact: "2026-05-12"
  status: "Active"
  notes: "Generally supportive; cares about local jobs and waterfront access."
  history: [ the 3 entries listed above ]
  (Its SEED_SCORES row, for reference: tm-alex {x:3,y:8}, tm-jordan {x:4,y:9}, tm-sam {x:2,y:8}, tm-priya {x:3,y:8}, tm-devon {x:2,y:7} → weightedCoord places the dot in the positive/upper band. An org-type record drops isPerson/firstName/lastName/title and may omit state/site; otherwise the shape is identical.)

REGENERATION NOTE — the remaining fixtures (the other 19 stakeholders + their scores, the full user/team/workspace/community/conversation/message seeds) are of the IDENTICAL SHAPE shown above and are REGENERATED at rebuild — fresh, plausible HP-flavored sample data, not transcribed. State explicitly: the seed fixtures are illustrative, not app logic; the CATALOGS / HELPERS / LOGIC (Catalogs box, Relationship-engine, Plan-algorithm, location helpers, scoring math) are the lossless part and are captured verbatim in their own boxes. The only seed values pinned verbatim here because downstream features depend on them: the TEAM weights (drive weightedCoord) and the three Map-history trails (drive the Map history path).` },
                              { t: "Record scaffold, landing pages & page shells — the universal layout (LAYOUT IS CRUCIAL)", done: true, d:
`RECORD SCAFFOLD + LANDING SHELL (oracle: archive/src/record.jsx + archive/src/landing.jsx). record.jsx is the single source of design for every read/edit record page; ALL visual rules live in the AUTHORITATIVE RECORD SCAFFOLD block in styles.css. Tables are NEVER re-implemented inside a record — records embed the REAL app table (SheetView) verbatim.

MetaField(label, value, editing, type="text", options=[], placeholder, onChange) — one field, two states. TYPE VOCABULARY: text | long | select | tags | date. emptiness test: value is undefined OR null OR "" OR (an array with length 0). Wrapper is a <label class="mf"> with a .mf-label span = label.
- READ state (not editing): a .mf-value span. If empty → <span class="mf-empty">—</span> (an em-dash). Else if type==="tags" → <span class="mf-tags"> with each value rendered as a <span class="tag"> chip. Else → the raw value text.
- EDIT state: type==="long" → <textarea class="mf-input mf-long" rows={4}> (value || ""). type==="select" → a styled select wrapper <span class="designed-select mf-input"> with a <select> (value || ""); if a placeholder is given, a leading <option value="">{placeholder}</option>, then one <option> per options[] entry. type==="date" → <input class="mf-input" type="date">. type==="tags" while editing → (the oracle's text/else branch produces a text input; tags are edited as the editable text-input form — i.e. there is no chip-editor; the read form shows chips). Default text → <input class="mf-input" type="text">. All edit inputs carry the placeholder and call onChange(e.target.value).

RecordShell(backLabel, onBack, pageIcon, title, subtitle, editing, onToggleEdit, sections, rightRail, navTitle, railTitle, toolbar, footer) — the universal page. Three internal states: active (current section id, defaults to sections[0].id), navCollapsed (left rail), railCollapsed (right rail) — BOTH rails collapse INDEPENDENTLY. section = the sections entry whose id===active (fallback sections[0]).
- STATIC TOP BAR (.record-topbar): an optional back button (.plan-back: chevron-left Icon + backLabel||"Back") only when onBack given; a flex spacer; an optional toolbar slot (.record-toolbar wrapping the passed toolbar — search + Filter + Sort live HERE in the top bar); and an optional view↔edit toggle button (Icon "check"+"Done" when editing else Icon "edit"+"Edit"; gains .btn-primary while editing). THE PAGE TITLE IS NEVER IN THE TOP BAR.
- BODY (.record-body) holds three regions:
  LEFT RAIL (nav .record-nav, gains .collapsed): head with a title (.record-nav-title = navTitle||"Sections", hidden when collapsed) + a collapse toggle (.record-nav-collapse: chevron-left when open / chevron-right when collapsed). Then one .record-nav-item per section (gains .on when its id===active; onClick sets active = that section's id) showing the section's icon (s.icon || "chevron-right") + its label (.record-nav-label). The left nav SELECTS WHICH SECTION RENDERS.
  CENTER (.record-main — the ONLY width-flexible region; content reflows as rails toggle, center stays full-width white): the PAGE HEADER LIVES IN THE CONTENT (.record-page-head) = an optional page icon (.record-page-icon, Icon pageIcon) + titles block (.record-page-titles): an eyebrow subtitle (.record-page-eyebrow = subtitle) above the title (.record-page-title = title). Below the header: a .record-section-head showing the active section.label, then .record-section-body = section.render(editing) — each section supplies its own render(editing) function so the SAME section renders read or edit depending on the editing flag (read↔edit parity).
  RIGHT RAIL (aside .record-rail, only when rightRail passed; gains .collapsed): head with title (.record-nav-title = railTitle||"Details", hidden when collapsed) + an independent collapse toggle (chevron-right open / chevron-left collapsed); when not collapsed, renders the rightRail content (typically metadata MetaFields + notes).
- PINNED FOOTER (.record-footer) — only when footer passed.

SampleRecord (the neutral live preview used to tune the shell, in the Scaffolds menu) demonstrates the CANONICAL SECTION LAYOUT VARIANTS — each is one section.render mode. Its local state: editing (false initially, toggled by the top-bar Edit/Done button) and a seed record object d with EXACTLY these initial values — name "Sample Record", owner "Alex Rivera", status "Active", priority "High", summary "A neutral record used to tune the universal read/edit scaffold before stakeholders, plans, and community entries are poured into it.", tags ["Reference", "Scaffold"], note "" — mutated field-by-field via set(k,v). RecordShell is invoked with backLabel "Samples", pageIcon "description", title = d.name (LIVE — editing the Name field retitles the page header), subtitle "Universal scaffold preview", navTitle "Sections". The four sections:
- "Single column" (id prose, icon notes): .record-prose flowing <p> paragraphs (two lorem-ipsum paragraphs in the oracle) + a .record-prose-tags row of .tag chips ("Reference", "Scaffold", "Lorem"). (Prose/longform layout.)
- "Field stack" (id fields, icon tune): .record-fields = a vertical stack of MetaFields: Name (text, bound to d.name), Status (select, options EXACTLY ["Idea", "Proposed", "Active", "Complete"], bound to d.status), Summary (long, bound to d.summary), Tags (tags, value d.tags — passed NO onChange, so its edit-mode text input is inert; see the honesty note below).
- "Two column" (id twocol, icon view_column): .record-twocol = two side-by-side .record-fields stacks. LEFT stack: Name (text), Status (select, options ["Idea", "Proposed", "Active", "Complete"]), Priority (select, options EXACTLY ["High", "Medium", "Low"]). RIGHT stack: Owner (text, bound to d.owner), Summary (long), Tags (tags, no onChange).
- "Table embed" (id table, icon table_rows): .record-table-embed wrapping the REAL SheetView verbatim — same columns, design, behavior — passed the first 8 stakeholders (D.STAKEHOLDERS.slice(0,8)), seed scores/team/workspaces/users/issues/community, explainerSlot null, selectedId/openStakeholderId null, currentUser = the first user (D.USERS[0]), workspaceLabel "Sample", isMaster true, and ALL mutators/handlers (updateStakeholder, openDetail, setSelectedId, addStakeholder, onConsumeOpen, updateCommunityApp, onOpenWorkspace) as no-ops, getWorkspacesForStakeholder returning []. LIMITED TO 8 STAKEHOLDERS. This is the embedded ui-stakeholder-table, not a reimplementation.
SampleRecord's rightRail demonstrates the metadata-rail pattern: a "Metadata" .record-rail-sec with read-only mf rows (Created = "June 1, 2026" / Updated = "June 10, 2026" / Owner = d.owner) + a "Notes" .record-rail-sec with a long textarea (.mf-input.mf-long rows 3, placeholder "Add a note…", bound live to d.note — the one rail control that IS wired). Its toolbar slot = .scaffold-controls: a search box (.search with Icon "search", an input placeholder "Search…", a ⌘K kbd hint .kbd.kbd-cmdk) + a "Filter" btn + a "Sort" btn. Its footer = "Universal scaffold preview" · flex spacer · "Updated June 10, 2026".
ORACLE-HONESTY (DO-NOT-SILENTLY-REPLICATE): SampleRecord's scaffold-controls are PURELY DECORATIVE in the oracle — the search input is unbound (no value, no onChange), and the "Filter" and "Sort" buttons have NO onClick; they exist only to demonstrate WHERE toolbar controls sit in the top bar. Likewise onBack is a literal no-op (() => {}) — the "Samples" back button renders but goes nowhere. The Tags MetaFields are passed no onChange, so in edit mode their text input accepts no typing (controlled input without a handler). At rebuild either wire these controls for real or keep them EXPLICITLY as inert preview chrome (ruled with the user) — do NOT assume they carry the LandingView search/filter/sort behavior; that live behavior belongs to LandingView below, not to this scaffold preview.

LandingView(items, searchKeys, filterDefs, sortFields, cols, renderCard, onRowClick, onNew, newLabel, emptyText, gridClass, headerSlot, footerSlot, explainerSlot, toolbarRight) — the SHARED data-grid landing shell used by BOTH the Plan and Community landings. (onNew/newLabel are DEAD in the oracle — see the SLOT/API line below.) NOTE: landing.jsx is the DATA-GRID landing shell (toolbar + card grid OR profile-style table), NOT a marketing/CTA page — there is NO marketing landing page anywhere in the source. State: search (string), filters ({ defKey: Set(values) }), sort ({ key, dir:"asc"|"desc" }), view ("cards" | "table"), filterOpen, sortOpen. Outer .community-wrap.
- VIEW TOGGLE: a "See all" button (title "See all in a table") toggles view between "cards" and "table" (gains .filter-active when table). cards ↔ table.
- PIPELINE (explicit ORDER: search → filters → sort, industry standard): lowercase query ql; if ql, keep items where any searchKeys[k] stringified-lowercased includes ql. Then for each filterDefs def, if filters[def.key] is a non-empty Set, keep items where valuesOf(def,item) has SOME value in the set. Then if sort.key set, find the sortFields entry, stable-copy-sort by f.get(a) vs f.get(b) (string-lowercased compare) times the direction sign (asc +1 / desc −1).
- valuesOf(def, item): v = def.get(item); if Array → filter truthy, map String (MULTI-VALUE handling — arrays are flattened so a multi-valued field can match any of its values); else if truthy → [String(v)]; else []. distinct(def): the sorted unique set of all values across items (used to populate filter chips). activeFilterCount = total size of all filter Sets. filterDefs/sortFields share a get(item) ACCESSOR CONTRACT — each def/field provides get(item) returning the value(s) to filter/sort on.
- TOOLBAR (.community-toolbar) is rendered via ReactDOM.createPortal INTO the passed explainerSlot DOM node (so the page hosts the toolbar in its own explainer region). Contents: a search box (.search: Icon search + an input with placeholder "Search…" bound to search + a ⌘K kbd via cmdKeyLabel); a Filter button (.filter-button-wrap; label "Filter" + " (n)" when activeFilterCount; gains .filter-active when any filter active; its onClick TOGGLES filterOpen AND calls setSortOpen(false)) opening a .filter-popover with a head (strong "Filter" + a "Clear all" ghost button, fontSize 11, that resets filters to the empty object {}) and a body of one FilterSection per def (label, distinct values, active set, onToggle); a Sort button (gains .filter-active when sort.key is set; its onClick TOGGLES sortOpen AND calls setFilterOpen(false)) opening a .filter-popover.sort-popover with a head (strong "Sort by" + a "Clear all" ghost, fontSize 11, that resets sort to { key: null, dir: "asc" } — it clears the key AND resets the direction to asc, not just the key) and a SortFieldList body. POPOVER BEHAVIOR: (1) MUTUAL EXCLUSION — Filter and Sort popovers are never open together; opening either one closes the other (each button's onClick sets its own open-toggle and forces the other's open flag false). (2) AUTO-DISMISS ON MOUSE-LEAVE — BOTH popovers carry onMouseLeave setting their own open flag false; hover-off is the dismissal (there is no click-outside handler on these popovers). Then the "See all" view toggle; a flex spacer (.spacer, flex:1); then toolbarRight.
- HEADER/FOOTER: headerSlot rendered above the results; footerSlot below.
- RESULTS: if filtered list empty → .comm-empty.muted = emptyText. Else if view==="table" → .landing-table-scroll > a .profile-table.landing-table.landing-table-flex grid: the header row (.profile-trow.profile-thead) and each data row (.profile-trow, onClick → onRowClick(it), cursor pointer, title "Open") use gridTemplateColumns "minmax(180px,2fr) " + one "max-content" per remaining col (FIRST column is a flexible minmax(180px,2fr), the REST are max-content). Each cell = c.render(it) if given else it[c.key]. Else (cards) → a grid (gridClass || "comm-grid") of renderCard(it) per item.
- SLOT/API SURFACE: renderCard(item), onRowClick(item), emptyText, gridClass, headerSlot, footerSlot, toolbarRight, explainerSlot (portal target). cols = [{ key, label, render? }]. DEAD PROPS — DO-NOT-REPLICATE FLAG: onNew and newLabel are accepted (destructured in the signature) but NEVER RENDERED anywhere in LandingView — no New button, no new-item control of any kind exists in the landing shell. Both callers pass them into a void: the Plan landing passes onNew (its newPlan handler) with newLabel "New plan"; the Community landing passes onNew (opens the new-application modal) with newLabel "New application". Other capture boxes quote those newLabel strings — be aware they never surface in the oracle UI; plan/application creation actually happens via the app shell's context-aware create (+) and the pages' own controls. REBUILD DECISION (make-real-or-drop, decide with the user): either give the rebuilt landing shell a REAL new-item action (a ui-button "filled" in the toolbar, labelled newLabel, firing onNew) or drop both props from the API entirely — do not silently carry the fake plumbing forward, and do not invent a button the oracle never had without ruling it first.

BUILD-MAP (Canonical UI, ui-* only — NEVER md-*/shadcn). The 3-region RecordShell maps to the scaffold components: ui-app-shell (the page), ui-sidebar (left section-nav rail, collapsible), ui-inspector (right metadata rail, collapsible) around the white center content; the top bar is the ui-app-bar with its toolbar slot. MetaField becomes the field primitive set: read = tokened value/chip, edit = ui-text-field (text/long/date), ui-select (select), ui-chip set (tags) — single field component switching on type. The "Table embed" mode embeds ui-stakeholder-table / ui-data-table verbatim (8-row cap), never a markup table. LandingView's table view → ui-data-table (first col minmax(180px,2fr), rest max-content); the toolbar → ui-app-bar/ui-text-field search + ui-menu filter/sort popovers + ui-chip filter chips (preserving the mutual-exclusion and mouse-leave dismissal semantics above, or upgrading dismissal to ui-menu's standard click-outside if ruled with the user); card view → tokened ui cards in a grid. All collapse/toggle states and surfaces come from --ui-sys tokens; sidebars are never white (surface-container), center content is white (surface-card). No ad-hoc CSS, no shadows beyond the shipped ramp.

SKELETON TREE (literal region trees extracted from the archive/src/record.jsx + archive/src/landing.jsx JSX — the build assembles against THESE trees, never prose. One node per line, nested in source order. Each node: what it is → what it contains → Canonical UI mapping. "layout row/column — token-only container" nodes are pure layout wrappers; wrapper structure otherwise lives inside the mapped ui-* component's shadow DOM. Bracketed [conditions] gate a node.)

SURFACE 1 — RECORDSHELL (the universal 3-region record page):
div.record-wrap — the whole record page: top bar → 3-region body → pinned footer → ui-app-shell record variant (layout column)
  div.record-topbar — static top bar; NO title ever lives here → ui-app-bar (toolbar slot)
    [onBack] button.plan-back — Icon "chevron-left" + (backLabel||"Back") → ui-button text with leading ui-icon
    span [inline flex:1] — spacer (layout spacer — token-only)
    [toolbar] span.record-toolbar — wraps the passed toolbar slot content → app-bar slot (host of the caller's search/Filter/Sort)
    [onToggleEdit] button.btn[.btn-primary while editing] — Icon "check"+"Done" (editing) | Icon "edit"+"Edit" (read) → ui-button (filled while editing) with leading ui-icon
  div.record-body — 3-region row: left rail · center · right rail (layout row — token-only container)
    nav.record-nav[.collapsed] — LEFT RAIL, sub-page navigation → ui-sidebar (collapsible; surface-container, never white)
      div.record-nav-head — (layout row) [not collapsed] span.record-nav-title (navTitle||"Sections") + button.record-nav-collapse [title Expand|Collapse] containing Icon chevron-left (open) | chevron-right (collapsed) → sidebar header + ui-icon-button collapse toggle
      button.record-nav-item[.on when active] ×sections [title s.label] — Icon (s.icon||"chevron-right") + span.record-nav-label (s.label) → ui-sidebar nav items (selection = ink state, no bg swap)
    div.record-main — CENTER, the ONLY width-flexible region; full-width white; reflows as rails toggle → main content region (surface-card)
      div.record-page-head — the in-content page header (layout row — token-only container)
        [pageIcon] span.record-page-icon — Icon pageIcon → ui-icon
        div.record-page-titles — (layout column) [subtitle] span.record-page-eyebrow (eyebrow above) + [title] span.record-page-title → eyebrow + Newsreader title
      [section] div.record-section-head — active section.label → section heading text
      div.record-section-body — section.render(editing) — the active section's own subtree mounts HERE → section host (layout region)
    [rightRail] aside.record-rail[.collapsed] — RIGHT RAIL, metadata → ui-inspector (collapsible; surface-container)
      div.record-rail-head — (layout row) [not collapsed] span.record-nav-title (railTitle||"Details") + button.record-nav-collapse [title Expand|Collapse] containing Icon chevron-right (open) | chevron-left (collapsed) → inspector header + ui-icon-button
      [not collapsed] {rightRail} — the caller's rail content mounts here → inspector body slot
  [footer] div.record-footer — pinned footer → ui-status-bar / footer bar

SURFACE 1a — METAFIELD (the field primitive that populates record sections and rails):
label.mf — one field → the single field component switching on type
  span.mf-label — the field label → field label (token type style)
  [read] span.mf-value — [empty] span.mf-empty "—" | [type tags] span.mf-tags of span.tag ×values (ui-chip set) | raw value text
  [edit, long] textarea.mf-input.mf-long [rows 4] → ui-text-field multiline
  [edit, select] span.designed-select.mf-input — wraps select ([placeholder] leading empty option + option ×options) → ui-select
  [edit, date|text|tags] input.mf-input [type date|text] → ui-text-field (date variant for date)

SURFACE 1b — SAMPLERECORD SECTION BODIES (what mounts into .record-section-body per nav item, in order):
prose ("Single column", icon notes): div.record-prose — p ×2 (lorem) + div.record-prose-tags of span.tag ×3 → prose region + ui-chip row
fields ("Field stack", icon tune): div.record-fields — MetaField ×4 (Name text · Status select · Summary long · Tags tags/inert) → vertical field stack (layout column)
twocol ("Two column", icon view_column): div.record-twocol — (layout row) div.record-fields (Name · Status · Priority) + div.record-fields (Owner · Summary · Tags) → two field stacks side by side
table ("Table embed", icon table_rows): div.record-table-embed — the REAL SheetView verbatim (8 stakeholders) → embedded ui-stakeholder-table (its internal tree is owned by the Lists box)
rightRail: div.record-rail-inner — (layout column) div.record-rail-sec ("Metadata": div.record-rail-title + div.mf read rows Created/Updated/Owner) + div.record-rail-sec ("Notes": div.record-rail-title + textarea.mf-input.mf-long rows 3 "Add a note…") → inspector sections
toolbar slot: span.scaffold-controls — (layout row) span.search (Icon "search" .ico + input "Search…" + span.kbd.kbd-cmdk "⌘K") + button.btn "Filter" + button.btn "Sort" → decorative toolbar chrome (see ORACLE-HONESTY)
footer slot: span "Universal scaffold preview" + span [flex:1] spacer + span "Updated June 10, 2026" → footer texts

SURFACE 2 — LANDINGVIEW (the shared Plan/Community landing shell):
div.community-wrap — the landing surface (layout column)
  [explainerSlot truthy] PORTAL → the toolbar subtree below is rendered via ReactDOM.createPortal INTO the explainerSlot DOM node, NOT inline in community-wrap; the entire toolbar is CONDITIONAL on explainerSlot — no slot, no toolbar renders at all (clarification the tree surfaces; the body text above implies but does not state it)
    div.community-toolbar — search · Filter · Sort · See all · spacer · toolbarRight → ui-app-bar toolbar row
      div.search — Icon "search" + input [placeholder "Search…", bound to search] + span.kbd.kbd-cmdk cmdKeyLabel → ui-text-field with leading ui-icon + kbd hint
      div.filter-button-wrap — filter anchor (layout wrapper — anchors the popover)
        button.btn[.filter-active] — "Filter" (+" (n)") → ui-button (menu anchor); NOTE: unlike ProfilePage's controls bar, this button has NO leading Icon
        [filterOpen] div.filter-popover [onMouseLeave closes] → ui-menu popover
          div.filter-pop-head — strong "Filter" + button.btn.btn-ghost [fontSize:11] "Clear all" → popover head + ui-button text
          div.filter-pop-body — FilterSection ×filterDefs → ui-chip filter groups (shared primitive)
      div.filter-button-wrap — sort anchor (layout wrapper)
        button.btn[.filter-active when sort.key] — "Sort" (no leading Icon here either) → ui-button (menu anchor)
        [sortOpen] div.filter-popover.sort-popover [onMouseLeave closes] → ui-menu popover
          div.filter-pop-head — strong "Sort by" + button.btn.btn-ghost [fontSize:11] "Clear all" → popover head + ui-button text
          div.filter-pop-body — SortFieldList(sortFields, sort.key, sort.dir) → shared sort-field primitive
      button.btn[.filter-active when table] [title "See all in a table"] "See all" → ui-button toggle (cards ↔ table)
      div.spacer [inline flex:1] — spacer (layout spacer)
      {toolbarRight} — caller slot → toolbar trailing slot
  {headerSlot} — caller slot rendered above the results → header slot
  [filtered list empty] div.comm-empty.muted — emptyText → empty state text
  [view==="table"] div.landing-table-scroll — horizontal scroll container → data-table scroll wrapper (overflow-x auto)
    div.profile-table.landing-table.landing-table-flex — the grid table → ui-data-table
      div.profile-trow.profile-thead [inline gridTemplateColumns "minmax(180px,2fr) " + "max-content" ×(cols−1)] — span.profile-th-label ×cols → header row
      div.profile-trow ×items [same gridTemplateColumns; cursor pointer; onClick → onRowClick(it); title "Open"] — span.profile-td ×cols (c.render(it) if given else it[c.key]) → interactive rows
  [view==="cards"] div[gridClass || "comm-grid"] — renderCard(it) ×items (each card subtree is owned by the caller's box) → card grid (layout grid — token-only container)
  {footerSlot} — caller slot rendered below the results → footer slot

CLASSNAME ACCOUNTING: every className region in record.jsx appears above — record-wrap, record-topbar, plan-back, record-toolbar, btn, btn-primary, record-body, record-nav (collapsed), record-nav-head, record-nav-title, record-nav-collapse, record-nav-item (on), record-nav-label, record-main, record-page-head, record-page-icon, record-page-titles, record-page-eyebrow, record-page-title, record-section-head, record-section-body, record-rail (collapsed), record-rail-head, record-footer, mf, mf-label, mf-value, mf-empty, mf-tags, tag, mf-input, mf-long, designed-select, record-prose, record-prose-tags, record-fields, record-twocol, record-table-embed, record-rail-inner, record-rail-sec, record-rail-title, scaffold-controls, search, ico, kbd, kbd-cmdk. And in landing.jsx — community-wrap, community-toolbar, search, kbd, kbd-cmdk, filter-button-wrap, filter-active, filter-popover, filter-pop-head, filter-pop-body, btn-ghost, sort-popover, spacer, comm-empty, muted, landing-table-scroll, profile-table, landing-table, landing-table-flex, profile-trow, profile-thead, profile-th-label, profile-td, comm-grid. None silently dropped; FilterSection/SortFieldList/SheetView internals are absorbed into their own capture boxes. TREE-SURFACED CLARIFICATION (not a contradiction, a sharpening): the LandingView toolbar renders ONLY when explainerSlot is truthy — the portal expression is explainerSlot && createPortal(...), so a caller passing no explainerSlot gets NO toolbar (no search, no Filter/Sort, no See-all). Both oracle callers pass a real slot, so this never shows in the running app, but the rebuild must keep the toolbar conditional on the slot (or rule with the user that the rebuilt shell always owns its toolbar).

UX HANDLER CENSUS (archive/src/record.jsx + archive/src/landing.jsx — every event handler in the module set, enumerated with exact behavior):
record.jsx — 9 DOM handler sites:
1. MetaField long textarea onChange → onChange(e.target.value) (guarded: only if onChange passed).
2. MetaField select onChange → onChange(e.target.value) (guarded).
3. MetaField text/date/tags-edit input onChange → onChange(e.target.value) (guarded).
4. RecordShell back button onClick → onBack (rendered only when onBack given).
5. RecordShell view↔edit toggle onClick → onToggleEdit (rendered only when onToggleEdit given).
6. RecordShell left-rail collapse toggle onClick → setNavCollapsed(c => !c).
7. RecordShell nav-item onClick (×sections) → setActive(s.id).
8. RecordShell right-rail collapse toggle onClick → setRailCollapsed(c => !c).
9. SampleRecord rail Notes textarea onChange → set("note", e.target.value) (the ONE wired rail control).
record.jsx — callback wiring (no new DOM handlers, routed through the sites above or deliberately inert): SampleRecord passes onBack = () => {} (no-op — the back button goes nowhere), onToggleEdit → setEditing(e => !e), and 8 live MetaField onChange bindings (Field stack: name/status/summary; Two column: name/status/priority/owner/summary — all set(k, v)); the 2 Tags MetaFields get NO onChange (inert edit inputs); the embedded SheetView receives ALL its handler props as no-ops (updateStakeholder, openDetail, setSelectedId, addStakeholder, onConsumeOpen, updateCommunityApp, onOpenWorkspace; getWorkspacesForStakeholder returns []); the scaffold-controls search input and Filter/Sort buttons carry NO handlers at all (decorative — see ORACLE-HONESTY).
landing.jsx — 11 handler sites (9 DOM + 2 shared-component callbacks):
10. Search input onChange → setSearch(e.target.value).
11. Filter button onClick → setFilterOpen(o => !o) AND setSortOpen(false) (mutual exclusion).
12. Filter popover onMouseLeave → setFilterOpen(false) (hover-off dismissal).
13. Filter "Clear all" onClick → setFilters({}).
14. FilterSection onToggle(v) callback (×filterDefs) → toggleFilter(def.key, v) (Set-based toggle).
15. Sort button onClick → setSortOpen(o => !o) AND setFilterOpen(false) (mutual exclusion).
16. Sort popover onMouseLeave → setSortOpen(false).
17. Sort "Clear all" onClick → setSort({ key: null, dir: "asc" }) (clears key AND resets direction).
18. SortFieldList onSet(k, d) callback → setSort({ key: k, dir: d }).
19. "See all" button onClick → setView(v => v === "table" ? "cards" : "table").
20. Table row (profile-trow) onClick → onRowClick(it) (card clicks belong to the caller's renderCard, not this module).
20 handler sites across the module set (record.jsx 9 + landing.jsx 11), all accounted — every one is already described in the body above (including the inert/no-op ones flagged under ORACLE-HONESTY and DEAD PROPS); no missing interactions found.` },
                              { t: "Shared UI primitives — the component dictionary (pills, dots, avatars, pickers, icon map)", done: true, d:
`SHARED UI PRIMITIVES (oracle: archive/src/components.jsx + archive/src/users.jsx). The small reusable elements every screen composes from. EVERY hex below is a START-STATE value that MUST become a --ui-sys-* token at rebuild (flagged "→token"); no inline hex survives into Canonical UI.

StatusPill(status, size="sm") — a zone pill (.pill, data-zone=status). NULL-GUARD: meta = STATUSES[status]; if the status has NO catalog entry (unknown/uncatalogued) the component returns null — it renders NOTHING, never an empty pill. Background/text come from the STATUSES catalog (Relationship-engine box) — meta.color / meta.text → already first-class --ui-sys-zone-* tokens. borderColor rgba(0,0,0,.06) →token outline. size "lg" = 12px font, padding "3px 10px"; else 11px, "2px 8px".

PriorityPill(value) — a .tag-shaped pill (matches the Tags column shape), borderColor transparent. COLORS (→tokens, e.g. --ui-sys-priority-high-bg/-fg etc.):
  High   → bg #F1DBD0 / fg #7A2E12
  Medium → bg #EEE6D2 / fg #6E5419
  Low    → bg #E1E1DA / fg #54524A
Unknown values fall back to the Low pair.

StatusDot(value) — a .row (12px) of a 7px round dot (width/height 7, borderRadius 50%, display inline-block) + the label text. DOT COLORS (→tokens):
  Active  → #3E7A2E
  Watch   → #B5552C
  Dormant → #9B9684
Unknown → #9B9684 (the Dormant grey).

Tags(values) — if no values → <span class="muted">-</span> (a hyphen). Else .pills-inline showing the FIRST 3 values as .tag chips, then if more than 3 a muted "+N" overflow (N = values.length − 3).

Icon(name, className="ico") — renders a Google Material Symbols (Outlined) ligature glyph: <span class="material-symbols-outlined msym {className}" aria-hidden="true">{ligature}</span> (the aria-hidden="true" is in the source — decorative-glyph a11y semantics; the accessible meaning lives on the surrounding control, never the glyph). The app's semantic icon NAME maps to a Material Symbol ligature via the SYMBOLS dictionary; unknown names fall through to the name itself. THE FULL DICTIONARY (semantic name → Material Symbol ligature), VERBATIM:
  search→search, plus→add, filter→filter_list, sort→swap_vert, download→download, close→close, target→map, grid→settings, work→work, table→table_rows, category→category, cases→cases, language→language, beenhere→beenhere, apartment→apartment, check→check, content_copy→content_copy, user→person, users→groups, help→help, map→map, sliders→thumb_up, plan→description, lock→lock, message→chat, expand→open_in_full, logout→logout, edit→edit, chevron→expand_more, chevronUp→expand_less, layers→layers, community→favorite, drag→drag_indicator, chevron-left→chevron_left, chevron-right→chevron_right, double-left→keyboard_double_arrow_left, double-right→keyboard_double_arrow_right, sparkle→auto_awesome, brandmark→id_card, build→build, clock→history, mail→mail, phone→call.
This is the canonical glyph each semantic <ui-icon> uses (e.g. <ui-icon>search</ui-icon> emits the "search" ligature; the "target"/"map" semantic both emit "map"; "sliders" emits "thumb_up"; "plan" emits "description"; "community" emits "favorite"; "brandmark" emits "id_card"; "clock" emits "history").

coordToPct(x,y) — maps user map-coords to CSS percent (the dot layer's 0–100% spans x:−10..10 and y:10..−10): left = ((x+10)/20)*100 + "%"; top = ((10−y)/20)*100 + "%". pctToCoord(leftPct,topPct) is the inverse: x = (leftPct/100)*20 − 10; y = 10 − (topPct/100)*20. components.jsx is the SINGLE SOURCE of these conversions — the Map box consumes them, does not redefine them.

abbrev(name) — 2-letter avatar initials. If no name → "·". Strip a leading honorific (regex ^(Mayor|Rep\\\\.|Sen\\\\.|Dr\\\\.|Mr\\\\.|Ms\\\\.|Mrs\\\\.)\\\\s+, case-insensitive), trim, split on whitespace. Single word → its first 2 chars uppercased; else → first-letter-of-first-word + first-letter-of-last-word, uppercased.

abbrevTitle(title) — compact political/honorific title for tables; returns input unchanged if no rule. Map: "Senator"→"Sen.", "Representative"→"Rep.", "Assemblymember"→"Asm.", "Governor"→"Gov.".

displayName(s) — builds a stakeholder's shown name from structured fields, falling back to legacy s.name. first = s.firstName trimmed, last = s.lastName trimmed; if both empty → s.name||"". rawTitle = (s.title==="Other" ? s.titleOther||"" : s.title); prefix t = rawTitle ? abbrevTitle(rawTitle)+" " : ""; return (t + first + (last?" "+last:"")).trim(). (feeds the mention typeahead and tables.)

normalizeUrl(raw) — URL normalizer for user-typed links (the stakeholder-profile website/link fields call this by name — THIS is the formula). If raw is falsy → "". trimmed = raw.trim(); if empty → "". If trimmed ALREADY starts with a protocol — test the regex ^https?:\\\\/\\\\/ case-insensitively — return trimmed unchanged (an existing http:// or https:// in any case passes through untouched). Otherwise prepend exactly "https://" (https, never http): "example.com" → "https://example.com".

formatPhone(raw) — US phone formatter, formats "(xxx) xxx-xxxx" regardless of how it was typed. If raw falsy → "". digits = String(raw) with every non-digit character stripped (replace /\\\\D/g with ""). If digits is 11 long AND its first char is "1", drop that leading 1 (US country code). If the result is EXACTLY 10 digits → return "(" + first 3 + ") " + next 3 + "-" + last 4. ANY other digit count → return String(raw).trim() unchanged — international and unrecognizable numbers pass through as typed.

formatDateLong(raw) — long human date, e.g. "June 1, 2026"; accepts YYYY-MM-DD or ISO timestamps. If raw falsy → "". If raw matches ^\\\\d{4}-\\\\d{2}-\\\\d{2}$ (a bare date), parse new Date(raw + "T00:00:00") — appending "T00:00:00" forces LOCAL-midnight parsing; this is the timezone guard that prevents the off-by-one-day bug (bare YYYY-MM-DD strings otherwise parse as UTC midnight and render the previous day in western timezones). Otherwise new Date(raw) directly. If the parse is invalid (isNaN of getTime) → return String(raw) as-is. Else toLocaleDateString with the default locale and options { month: "long", day: "numeric", year: "numeric" }.
(abbrev, abbrevTitle, displayName, coordToPct/pctToCoord, normalizeUrl, formatPhone, formatDateLong are the components.jsx pure helpers — this box is their SINGLE SOURCE. Any other box that names normalizeUrl/formatPhone/formatDateLong means exactly these formulas. All regexes above are written with SINGLE backslashes, exactly as they appear in the oracle source — copy them verbatim.)

Avatar(user, size=28, ring=false, online=false, onClick, title) — a circular .av (adds .av-ring when ring). NULL-GUARD: a falsy user returns null — the component renders NOTHING (callers lean on this to skip unresolved users). FONT BUCKETS by size: size<=22 → 9px; <=30 → 10.5px; <=40 → 13px; else 16px. Text color #FAF8F2 →token (the warm off-white avatar ink). Background: if user.avatarUrl → center/cover no-repeat url(avatarUrl); else user.avatarColor (a per-user color, e.g. palette #B5552C/#D26A6A/#3E7A2E/#4F3F69/#2A6FDB/#B07E1F/#682E45/#5A8F8F →tokenized palette). Content: when no avatarUrl, the abbrev(name) initials. ONLINE DOT (.av-presence) when online: size = max(6, round(size*0.28)); positioned right/bottom = max(1, round(size*0.06)); borderWidth = max(1, round(size*0.05)) — tucked inside the lower-right of the circle. cursor pointer when onClick. tooltip title default = "{name} · {title}".

UserStack(users, currentUserId, max=3, onClick, size=28) — the brand-bar people stack (rendered in the app shell's top bar; opens the People popup). others = users EXCLUDING the current user (u.id !== currentUserId) AND EXCLUDING role==="system" (the Reminders bot never appears in the stack). visible = others.slice(0, max); overflow = max(0, others.length − max). Wrapper: <span class="user-stack"> with role="button", title "People in this workspace", and the onClick handler. Renders each visible user as an Avatar at the given size with ring=true (the .av-ring outline keeps overlapped avatars legible); when overflow > 0, a trailing <span class="av av-more"> sized size×size showing "+N" (N = overflow), fontSize 9px when size<=22 else 11px (same bucket rule as Avatar's smallest sizes).

UserListPopup(open, onClose, users, currentUserId, onMessage) — the right-side People panel the stack opens. Same exclusion as UserStack (drop the current user and role==="system"). Structure: a .side-veil div (gains .show when open; clicking the veil calls onClose) + an <aside class="side-popup"> (gains .show when open — the slide-in). HEAD (.side-popup-head): a <strong> reading "People · {n}" where n = others.length, plus a ghost close button (btn btn-ghost, aria-label "Close", Icon "close") calling onClose. BODY (.side-popup-body): one .user-row per other user = a 36px Avatar (online = u.presence==="online") + a .user-row-meta block (.user-row-name = u.name above .user-row-title = u.title) + a trailing ghost message button (class "btn btn-ghost user-row-msg", title "Send message", Icon "message") calling onMessage(u.id) — the one-click jump into a 1:1 conversation with that person.

UserAutocomplete(users, value, onChange, placeholder, clearable, autoFocus, showAvatar) — typeahead person picker. DEFAULT PLACEHOLDER (when none passed): "Search people…". selected = the user whose id===value. INPUT VALUE RULE: the input's displayed value is open ? query : (selected ? selected.name : "") — while the menu is CLOSED the input shows the selected user's full name (empty string if none selected); FOCUSING the input CLEARS the query and opens the menu, so focus always restarts from the unfiltered first-8 list, never from a stale query. Typing sets query, opens the menu, and resets hoverIdx to 0. As you type, MATCHES filter users by name/title/email (lowercase includes) sliced to MAX 8; with an empty query, the FIRST 8 users. Keyboard: ArrowDown/ArrowUp move hoverIdx (clamped to 0..matches.length−1), Enter picks matches[hoverIdx], Escape closes. CLICK-OUTSIDE (document mousedown outside the wrap) closes the menu. Picking calls onChange(user.id), clears query, closes. When clearable && selected → a clear button (.ua-clear, aria-label "Clear", Icon "close" with className "ico ua-clear-icon") that calls onChange(null), clears query, closes. When showAvatar && selected && menu closed → a leading 20px Avatar (online from presence). The menu (.ua-menu) shows "No matches" (.ua-empty) when empty, else each match as a row (.ua-row; gains .hover when its index===hoverIdx; onMouseEnter sets hoverIdx): a 24px Avatar (online from presence) + name (.ua-row-name) + title (.ua-row-title). ROWS COMMIT ON MOUSEDOWN with preventDefault — the pick lands BEFORE the input blurs, so selection always beats blur/close. ROW OPTION u.noAvatar: when an entry carries a truthy noAvatar flag, the 24px row Avatar is SUPPRESSED (the row shows name + title only) — this is how non-person entries render; the Plan community-investment linker relies on it, mapping its investment entries with noAvatar: true.

OwnerPicker(users, value, onChange) — the SINGLE-owner assignment control: a <div class="ws-owner-control"> wrapper (styles.css: "Owner control wraps the OwnerPicker autocomplete in a bordered shell") rendering one UserAutocomplete with placeholder "Unassigned", clearable=true, showAvatar=true. No other logic — it is exactly UserAutocomplete configured for single-owner use. ORACLE HONESTY NOTE: OwnerPicker is exported from users.jsx but has ZERO call sites in the oracle — every owner surface (sheet modal, plan, community modal, Setup, app shell) uses MultiOwnerPicker instead; only its .ws-owner-control CSS shell remains referenced. Capture it as the defined single-owner variant, but at rebuild decide with the user whether any surface actually needs it before building it — do not wire it in anywhere the oracle didn't.

MultiOwnerPicker(users, owners, onChange, size=26) — a stack of owner avatars (NO names), wrapper .multi-owner around a .multi-owner-stack. available = users excluding role==="system" AND already-owners. Renders each owner as a size-px (default 26) Avatar (online from presence) inside a .multi-owner-av wrapper span whose TOOLTIP title = u.name normally and EXACTLY "Click to remove" while that avatar is armed for removal; an owner id with no matching user in users renders nothing (skipped). A "+" add button (.multi-owner-add, size×size, aria-label "Add owner" AND title "Add owner") appears ONLY when available.length>0; clicking it TOGGLES the inline add mode (.multi-owner-picker), which renders a UserAutocomplete over available with placeholder EXACTLY "Search people to add…" and autoFocus=true (the input focuses and opens the moment the "+" is clicked). addOwner(id) GUARDS: it no-ops if id is falsy OR id is already in owners; otherwise it appends the id (onChange([...owners, id])) and closes the add autocomplete (adding=false). REMOVE is two-step: clicking an owner avatar ARMS removal (setConfirmRemove = that id; the .multi-owner-av gains .confirm + an overlay .multi-owner-remove showing Icon "close"); a SECOND click on the armed avatar confirms — removeOwner filters the id out of owners via onChange and clears the armed state; mouse-leaving the armed avatar disarms (confirmRemove back to null). Click-outside (document mousedown outside the .multi-owner wrap) closes BOTH the adding autocomplete and any armed confirm state.

OwnersDisplay(users, owners, size=22, label="owners") — READ-ONLY owner avatar stack. If no owners → <span class="muted">-</span> (fontSize 11). RESOLUTION RULE: list = owners.map(id => users.find(u => u.id === id)).filter(Boolean) — an owner id with NO matching user is SILENTLY DROPPED from BOTH the stack and the popover head count (n = list.length, the RESOLVED count, NOT owners.length). Then a stack of size-px Avatars (one per resolved owner); on hover/click a popover (.owners-popover) opens listing each resolved owner: a head "{n} {label}" that SINGULARIZES when n===1 (label.replace(/s$/,"")) e.g. "1 owner" vs "3 owners", then a row per owner = 22px Avatar + name (12.5px 500) + muted title (11px). Click-outside closes.

ConfirmDialog(open, title, body, confirmLabel, cancelLabel, danger, onConfirm, onCancel) — generic confirm modal (.modal.confirm-modal with .modal-veil.show). Head = title; body = body (13px, var(--ink-2), line-height 1.5); foot = a Cancel button (cancelLabel||"Cancel" → onCancel) + a confirm button (confirmLabel||"Confirm" → onConfirm) whose class is btn-danger when danger else btn-primary.

ManagerStar(size=12, title) — an amber filled star glyph: material-symbols "star", fontSize = size+4, color #E0A21A →token, fontVariationSettings "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" (FILL 1, weight 500), aria-label/title "Manager". ManagerBadge() — the amber pill (.manager-badge): a small ManagerStar (size 10) + the text "Manager".

FilterSection(label, values, active, onToggle, render) — a labeled multi-select chip row (used by the List bar, profile tables, and LandingView). If no values → renders nothing. A label (.lbl.filter-pop-label) + .filter-chips: a leading "All" chip (.filter-chip, gains .on when nothing in this section is selected) that CLEARS the section (clicking calls onToggle for each currently-active value), then one .filter-chip per value (gains .on when active includes it; onClick toggles it; render(v) customizes the chip label).

SortFieldList(fields, sortKey, sortDir, onSet) — fields = [{ key, label, type? }]; onSet(key, dir). TYPE INFERENCE (when f.type absent): if key matches /updatedAt|createdAt|lastContact|_updated|_created|date/i → "date"; else if key is "_x" or "_y" or matches /amount|count|weight|score/i → "num"; else → "text". DIRECTION-LABEL PAIRS by inferred type: date → ["Oldest first","Newest first"]; num → ["Low → High","High → Low"]; text → ["A → Z","Z → A"]. Each field is a row (.sort-fieldrow, gains .active when sortKey===key) with a name button (shows a leading "● " when active; clicking sets that field — onSet(f.key, active ? sortDir : (type==="date" ? "desc" : "asc")): a NEWLY selected field gets the type default ("desc" for dates, else "asc"), but re-clicking the name of the ALREADY-ACTIVE field re-sets with the CURRENT sortDir unchanged — it must NOT snap back to the type default); when active, a segmented direction control (.sort-dir-seg) with the asc/desc labels for the inferred type. (NOTE: when first selecting a DATE field the oracle defaults to "desc" = "Newest first".)

BUILD-MAP (Canonical UI, ui-* only — NEVER md-*/shadcn). At rebuild these become REAL Canonical UI components or are flagged as GAPS to add to design-system/manifest.json (each to the ui-button quality bar):
- PriorityPill / StatusPill / StatusDot / Tags / ManagerBadge → ui-chip variants (priority/status/zone/tag/badge) driven entirely by --ui-sys-* tokens (every hex above tokenized; status dot = a ui-chip with a leading dot slot).
- Icon → ui-icon (Material Symbols ligature; the SYMBOLS dictionary becomes the canonical name→ligature map; sizes from --ui-sys-icon-size-*).
- Avatar → ui-avatar (image/initials, font buckets, presence dot, ring) — GAP to add. Avatar stacks (UserStack, the conv-multi-avatar, OwnersDisplay) → ui-avatar-stack (overlap + "+N" overflow, ring per avatar) — GAP.
- UserListPopup → ui-sheet (right-anchored, with scrim/veil = the .side-veil, .show = the sheet's open state) containing a ui-list of person rows (ui-avatar 36 + name/title text + a trailing ui-icon-button "message" per row) and an app-bar-style head with a ui-icon-button close.
- UserAutocomplete → ui-autocomplete (must support: default placeholder "Search people…", selected-name display when closed, focus-clears-query, mousedown-commit rows, the noAvatar row option, the clearable ×, the leading selected-avatar). ConfirmDialog → ui-dialog (with a danger action variant).
- MultiOwnerPicker / OwnerPicker → ui-owner-picker (avatar-stack + add-via-autocomplete with placeholder "Search people to add…" + autofocus-on-open + the "Add owner" labelled add button + per-avatar name/"Click to remove" tooltips + arm-then-confirm remove; single-owner mode = the OwnerPicker config: placeholder "Unassigned", clearable, showAvatar) — GAP. OwnersDisplay popover → ui-avatar-stack + ui-menu/popover.
- ManagerStar → ui-icon (filled star token #E0A21A) + ManagerBadge = ui-chip "Manager". Count/overflow badges ("+N", pending count) → a ui-badge/count primitive — GAP.
- FilterSection / SortFieldList → ui-chip groups + a ui-menu/segmented control inside the filter/sort popovers; the "All" clear-chip and direction segments are token-driven, not ad-hoc. coordToPct/pctToCoord, normalizeUrl, formatPhone, and formatDateLong stay pure functions (single-sourced here), not components. No inline hex, no shadows beyond the shipped ramp, no md-*/shadcn.` },
      { t: "Original-design COLOR CENSUS — all ~187 literals reconciled (tokenized / needs-token / superseded / decision)", done: true, d:
`ORIGINAL-DESIGN COLOR CENSUS (sweep a of the ruled 2026-07-02 census). SCOPE: every color literal (hex, rgb/rgba, color-mix) in the ORIGINAL app oracle — archive/src/styles.css, tweaks-panel.jsx, data.js, app.jsx, community.jsx, components.jsx, map.jsx, plan.jsx, profile-page.jsx, scoring.jsx, settings.jsx, setup.jsx, sheet.jsx, sheet-modals.jsx, users.jsx (the remaining archive/src modules — intel, landing, help, palette, record, messaging, profiles, community-modal, store, db — contain NO color literals; verified by grep). METHOD: grep -rhoE for #hex(3-8), rgb/rgba(...), color-mix(...) over archive/src, sort -u. RESULT: 187 DISTINCT LITERAL STRINGS. Case variants (#2F5A26 vs #2f5a26) and spacing variants (rgba(20,16,10,.12) vs rgba(20, 16, 10, .12)) are distinct strings and are each accounted for; one match, the bare string "rgb()" inside a tweaks-panel code comment, is a grep artifact (not a color) and is carried in the SUPERSEDED-DEV line so the arithmetic stays checkable. Every literal below has exactly ONE disposition; multi-context literals name all their uses. NOTHING IS SILENTLY DROPPED.

DISPOSITION KEY: TOKENIZED = already a design-system token in design-system/tokens.css (token named). CAPTURED→TOKEN = already written in a guide box and flagged/destined to become a token (box + future token named). NEEDS-TOKEN (NEW) = meaningful color surfaced by THIS sweep, not yet in any box (original location + meaning + proposed token). SUPERSEDED = incidental old-wrapper styling replaced by the token start-state (grouped by family; values recorded here so they are not lost). DECISION = the user must rule at the Design-page step.

================ A. SURFACE GREYS — the neutral ramp (9 literals, all TOKENIZED) ================
#FFFFFF (4x: --paper-2 content/cards; zone-ink on the two darkest zone extremes) = --ui-ref-neutral-0 (role --ui-sys-surface-card) and --ui-sys-zone-ink-on-strong.
#fff (25x: white ink/strokes ON colored fills — checkbox/cm-check/add-person checkmark strokes, comm-vote .on text, btn-danger text, prio-pop-opt.on, yesno-opt.on, filter/sort .on text, impact-chip.on text, cell-cal-day on/hover text, multi-owner-remove icon, twk knob) = the same #FFFFFF value in its "on-fill ink" role → --ui-sys-on-primary / --ui-sys-handle / --ui-sys-zone-ink-on-strong (all resolve to neutral-0). TOKENIZED.
#FFF (1x: .sheet-cell input.cell-input:focus background — the in-cell editor goes white on focus) = --ui-ref-neutral-0 (--ui-sys-surface-card). TOKENIZED.
#FEFDFC (3x: html/body runway; .ws-selector:hover; :root --bg-hover) = --ui-ref-neutral-1 (--ui-sys-surface). TOKENIZED.
#FCFBF9 (1x: --bg) = --ui-ref-neutral-2 (--ui-sys-surface-field). TOKENIZED.
#F8F7F3 (1x: --paper) = --ui-ref-neutral-3 (--ui-sys-surface-container). TOKENIZED.
#F4F3ED (4x: :root --paper-hover; explainer/scaffold .btn:hover; .kbd backgrounds) = --ui-ref-neutral-4 (--ui-sys-surface-hover). TOKENIZED.
#F0EEE6 (1x: --bg-2) = --ui-ref-neutral-5 (--ui-sys-surface-container-highest / outline-subtle). TOKENIZED.
#E8E6DE (1x: --rule) = --ui-ref-neutral-6 (--ui-sys-outline). TOKENIZED.

================ B. INKS (3 literals, all TOKENIZED) ================
#666361 (4x: --ink, --ink-2, --ink-3, --ink-4 — the oracle collapsed all four ink slots to one value) = --ui-ref-ink-strong (--ui-sys-on-surface). TOKENIZED.
#ABA9A4 (1x: --ink-mute) = --ui-ref-ink-muted (--ui-sys-on-surface-muted). TOKENIZED.
#DFDDD6 (1x: --rule-2) = --ui-ref-ink-faint (--ui-sys-divider / on-surface-faint). TOKENIZED.

================ C. VALENCE + ACCENT CORE (3 TOKENIZED · 3 NEEDS-TOKEN · 1 DECISION) ================
#3E7A2E (5x: --pos; avatar-palette slot 3; accent-option 3) = --ui-sys-pos. TOKENIZED.
#B33C3C (1x: --neg) = --ui-sys-neg. TOKENIZED.
#B5552C (5x: terracotta — the tokens.css accent; Active→Watch dot color Watch in components.jsx StatusDot; avatar-palette DEFAULT slot 1; accent-option 2) = --ui-sys-accent. TOKENIZED (the dot/palette uses are also captured in the Shared-primitives and Users boxes).
#B07E1F (3x: --neu — the amber neutral-band valence tone, used via var(--neu) by band UI; also avatar-palette slot 6) — tokens.css ships pos/neg/accent but NO neu. NEEDS-TOKEN: --ui-sys-neu = #B07E1F (the third valence tone; help-card.mid borders and band chips key off it).
#962B2B (1x: .btn-danger:hover — darkened negative) — NEEDS-TOKEN: --ui-sys-neg-hover = #962B2B (danger-button hover tone; note a SECOND danger-hover mechanism exists, filter brightness(0.95) on the sheet-modals btn-danger — unify on the token at build).
#022B7E (1x: --accent-ink — the darker accent used as TEXT on accent tints, e.g. .tab.active .count color) — NEEDS-TOKEN: --ui-sys-accent-ink (a text-safe dark sibling of the accent; must be re-derived when the accent hue is ruled, never frozen at the blue-era value).
#024AD8 (7x: the shipped --accent DEFAULT (blue) in styles.css; appConfig fallback accent in app.jsx (3 sites); users.jsx login-brand fallback (2); accent swatch option 1) — DECISION: the accent start-hue is the already-open Design-page ruling (tokens ship #B5552C terracotta; design.md proposed #D96B43; the ORACLE actually shipped #024AD8 blue). The appConfig default + swatch list are captured in the App-shell box (accent "#024AD8", options ["#024AD8","#B5552C","#3E7A2E","#7A2E12","#1F1A14"]); what the user must rule is which hue is the REBUILD start-state. DECISION.

================ D. RELATIONSHIP ZONES (20 literals, all TOKENIZED — single-sourced, never theme-touched) ================
The 14 zone fills, verbatim data.js STATUSES → tokens.css:
#D26A6A Proactively Defend = --ui-sys-zone-proactively-defend (also avatar-palette slot 2 — captured in Users box).
#E29A9A Defend = --ui-sys-zone-defend. #EFBEBE Protect = --ui-sys-zone-protect. #F4D6D6 Respond = --ui-sys-zone-respond. #F8E4E4 Identify = --ui-sys-zone-identify. #F4DBB0 Monitor = --ui-sys-zone-monitor. #F9E4BD Maintain = --ui-sys-zone-maintain (also the impact-chip.on.neu chip background — the band-neutral chip literally wears the Maintain zone tint). #FAEACA Commit = --ui-sys-zone-commit. #FCEFD1 Connect = --ui-sys-zone-connect. #DDE7C2 Cooperate = --ui-sys-zone-cooperate (also KIND_COLORS Philanthropy bg, STAGE_COLORS Approved bg, plan-goal shared-value bg — those pill catalogs reuse the hex and are captured in their boxes). #C2D9A4 Collaborate = --ui-sys-zone-collaborate (also STAGE_COLORS Active bg). #B1CF92 Valuable Relationship = --ui-sys-zone-valuable-relationship. #97C57A High Value Relationship = --ui-sys-zone-high-value-relationship. #74B556 Strategic Partner = --ui-sys-zone-strategic-partner.
Zone inks/borders: #7a2424 (9x: zone text negative band; zone border negative; PAC/Declined pill fg; app.jsx crash-screen text) = --ui-sys-zone-ink-negative + --ui-sys-zone-border-negative. #7a4a14 (8x: zone text neutral band; impact-chip.on.neu ink; funnel-arrow label ink) = --ui-sys-zone-ink-neutral. #2f5a26 (12x: zone text positive band; the green fg of many pills — Philanthropy/Sustainability/Approved/Active/shared-value/union) = --ui-sys-zone-ink-positive. #1f3f17 (1x: Strategic Partner border) = --ui-sys-zone-border-positive.
color-mix(in oklch, zoneColor NN%, #F2EFE7) (1x, map.jsx density heatmap — NN = 20 + t*80 where t = cellCount/maxCount; exact formula captured in the sealed Map box) — the mix base #F2EFE7 = --ui-sys-zone-density-base. TOKENIZED.

================ E. PILL CATALOGS — priority / community-stage / kind / plan-goal / segment / geography (30 literals, all CAPTURED→TOKEN) ================
Every literal here is already written, with its catalog, in a guide box; the box flags "every hex maps to --ui-sys-* tokens; do NOT inline". Future token families: --ui-sys-priority-*-surface/-ink, --ui-sys-stage-*-surface/-ink, --ui-sys-kind-*-surface/-ink, --ui-sys-goal-*-surface/-ink, --ui-sys-segment-*-surface/-ink, --ui-sys-geo-*-surface/-ink.
PRIORITY (components.jsx PrioPill; Shared-primitives box): #F1DBD0 High bg · #7A2E12 High ink (also accent-option 4) · #EEE6D2 Medium bg (also STAGE Proposed bg) · #6E5419 Medium ink (8x — also segment Corporate Functions ink, STAGE Proposed ink, prof-avatar.org background #6E5419: the org profile-avatar wears the CF-brown — note this avatar reuse, captured field-wise in the Stakeholder-profile box) · #E1E1DA Low bg (also STAGE Idea bg, goal general bg) · #54524A Low ink (also Idea/general ink).
COMMUNITY KIND_COLORS (community.jsx; Community box): #C2D9E8 Volunteering bg (also goal community bg) · #23496e Volunteering ink (also goal community ink) · #E8DEC2 Corporate Giving bg (also STAGE Under Review bg, goal activist bg) · #6e5419 lowercase Corporate Giving ink (5x — also Under Review ink, goal activist ink; case-distinct from #6E5419) · #E5D0D0 PAC bg (also STAGE Declined bg, goal crisis bg) · #C9E3CC Sustainability bg (also goal union bg) · #DCD3E0 Social Impact bg (also goal dei bg) · #4F3F69 Social Impact ink (also goal dei ink, avatar-palette slot 4).
COMMUNITY STAGE_COLORS (community.jsx + plan.jsx + profile-page.jsx STAGE text maps; Community box): #D9DEE8 Complete bg (also segment Personal Systems bg) · #2E3F66 Complete ink (7x — also segment Personal Systems ink, seg-dot color, prof-avatar.person background: the person profile-avatar wears the PS-navy) · (Idea/Proposed/Under Review/Approved/Active/Declined all covered above).
SEGMENT (setup.jsx SEG pills + app.jsx segmentColor; Workspaces box): #E5D6DC Printing bg · #682E45 Printing ink (also avatar-palette slot 7) · #D6E2D2 Corporate Investments bg · #2F5A26 uppercase Corporate Investments ink (case-distinct from zone ink #2f5a26) · #EAE0CB Corporate Functions bg · #7A7164 segment fallback (unknown segment).
GEOGRAPHY (setup.jsx GEO pills; Workspaces box): #E2DFD7 National bg · #3A3528 National ink · #D5DCEA Federal bg · #2A3E66 Federal ink · #E2D9E8 State bg · #4F2D6E State ink · #DDE7D2 Local bg · #34571F Local ink.

================ F. IDENTITY + CONFIG CATALOGS — status dots, brand/accent swatches, theme presets, avatar palette (17 literals CAPTURED→TOKEN · 1 SUPERSEDED) ================
#9B9684 (2x: components.jsx StatusDot Dormant + the unknown-status fallback) — Shared-primitives box → --ui-sys-status-dormant (Active = --ui-sys-pos, Watch = --ui-sys-accent, per the same box). CAPTURED→TOKEN.
#000000 (9x: appConfig BRAND default in app.jsx (3 sites) + settings.jsx brand fallbacks (5) + brand/accent swatch 1) — App-shell + Settings boxes → --ui-sys-brand start-state. CAPTURED→TOKEN.
SETTINGS 7-SWATCH CATALOG (settings.jsx, shared by brand AND accent pickers; Settings box lists all seven verbatim) → swatch catalog constants (data), rendered via tokens at build: #1976D2 (3x: swatch 2; ALSO mention-dot t-wsp; ALSO seed avatar Devon) · #E64A19 (3x: swatch 3; ALSO mention-dot t-cmy; ALSO seed avatar Jordan) · #AD1457 (2x: swatch 4; seed avatar Alex) · #388E3C (2x: swatch 5; seed avatar Sam) · #00897B (2x: swatch 6; seed avatar Kenji) · #BF360C (1x: swatch 7). All CAPTURED→TOKEN (the two doing double duty as mention dots get their mention tokens in group K).
#1F1A14 (2x: accent-option 5 in app.jsx; seed avatar u-system Reminders bot) — App-shell box accent options. CAPTURED→TOKEN.
THEME PRESET SWATCHES (settings.jsx THEMES preview cards; Settings box): #ECE8DD Soapbox bg · #E6E6E8 Undecideds bg · #F1F1F3 Undecideds dot · #7A787E Undecideds border · #262624 Night Shift bg · #52504A Night Shift dot · #C2C0B6 Night Shift border. All CAPTURED→TOKEN (theme-preview card constants; the presets themselves are named token SETS per the wrapper-theme decision).
AVATAR 8-PALETTE (users.jsx Login + EditProfile, verbatim in the Users box): slots are #B5552C(default)/#D26A6A/#3E7A2E/#4F3F69/#2A6FDB/#B07E1F/#682E45/#5A8F8F. New-to-this-table literals: #2A6FDB (3x: palette slot 5; also a commented tweaks preset) and #5A8F8F (2x: palette slot 8) — CAPTURED→TOKEN → --ui-sys-avatar-1..8 (other slots dispositioned in their primary groups above).
#FAF8F2 (19x — the WARM NEAR-PAPER INK on accent/colored fills: avatar initials ink (users.jsx Avatar), av-system glyph, msg.mine bubble text, btn-danger text, count-alert/msg-badge/conv-row-pending numerals, filter-chip.on/sort-field.on text, map-history-btn.active text, prof-avatar/sh-photo-preview ink, brand-icon-preview glyph, Soapbox theme dot, app.jsx crash-screen bg) — flagged →token in the Users + Shared-primitives boxes → --ui-sys-on-accent. CAPTURED→TOKEN.
#F9A825 (1x: data.js seed avatarColor for Marisol) — demo fixture data only, never a design surface; the Demo-seed box regenerates fixtures at rebuild. SUPERSEDED (value recorded here).

================ G. SCORING + LISTS WORKING SURFACES (8 CAPTURED→TOKEN · 3 NEEDS-TOKEN) ================
#FBF7EB (6x: THE universal row-hover tint — sheet-row hover, scoring-table row hover, ws-menu-item hover, profile-trow hover, plan-sh-trow hover) — flagged →token in the Scoring box → --ui-sys-row-hover. CAPTURED→TOKEN.
rgba(0,0,0,0.018) (1x: .scoring-cell-ro — the read-only teammate-cell wash) — flagged in the Scoring box → --ui-sys-cell-readonly-wash. CAPTURED→TOKEN.
#FBF6E6 (2x: computed/derived body cells — Weighted(x,y) + Relationship td.computed; scoring.jsx inline) — flagged in the Scoring box → the derived-cell surface token. CAPTURED→TOKEN.
#F4EFE0 + #ECE6D4 (2x each: teammate-column header gradient linear-gradient(180deg, #F4EFE0, #ECE6D4)) and #F1E7CD + #E8DCB7 (2x each: computed-column header gradient — the deeper gold tier) — captured in the Scoring box WITH the standing flag: the "no gradients ever" start-state means these resolve to FLAT tokens WITH THE USER (one computed/derived header-surface token family; never silently kept as gradients, never silently flattened). CAPTURED→TOKEN.
rgba(0,0,0,.04) (6x: weight === 1 baseline tint on the "% of team" readout (scoring.jsx) — flagged in the Scoring box → --ui-sys-weight-baseline; ALSO btn-ghost:hover, plan-back/record-nav-item hover washes, login-bg-grid hairlines — those extra uses are generic 4% ink hover washes superseded by --ui-sys-state-hover-opacity). Primary disposition CAPTURED→TOKEN.
rgba(62,122,46,.1) (1x: weight > 1 green tint) → --ui-sys-weight-over; rgba(176,126,31,.1) (1x: weight < 1 amber tint) → --ui-sys-weight-under — both flagged in the Scoring box. CAPTURED→TOKEN.
#FCEFD6 (2x: .sheet-row.selected .sheet-cell — the SELECTED-ROW tint on every cell of a checked Lists row; also .ws-menu-item.active) — deeper sibling of the hover cream; NOT yet in any box. NEEDS-TOKEN: --ui-sys-row-selected = #FCEFD6.
#ECE2C6 (2x: .sheet-row.selected .sheet-cell.idx — the selected row's index cell goes a step deeper; also .sheet-cell.edit:hover — the editable-cell hover) — NEEDS-TOKEN: --ui-sys-row-selected-strong = #ECE2C6 (doubles as the edit-affordance hover tint).
#EBE4D2 (1x: .sheet-head .sheet-cell:hover — sortable column-header hover) — NEEDS-TOKEN: --ui-sys-header-hover = #EBE4D2.

================ H. MAP SURFACES (3 CAPTURED→TOKEN · 1 NEEDS-TOKEN) ================
rgba(250,248,242,.92) (1x: .dot-label — the translucent paper pill under a dot's name) — captured verbatim in the sealed Map box → the map-label surface token. CAPTURED→TOKEN.
rgba(255,255,255,.5) (2x: .zone-count pill background on zone fills; also a tweaks-panel inset highlight) and rgba(0,0,0,.32) (1x: .zone-count numeral ink) — both captured verbatim in the Map box → --ui-sys-zone-count-surface / --ui-sys-zone-count-ink. CAPTURED→TOKEN.
rgba(0,0,0,.18) (11x — PRIMARY: the map's structural hairlines: .zone right/bottom borders (both the main map and the help-page grid) and .axis-lines crosshair; ALSO minor 18%-black shadows: dot-inner, slider thumbs, ws-selector — those shadow uses fold into the elevation ramp) — the zone-grid hairline over colored fills is a real design value no neutral token covers. NEEDS-TOKEN: --ui-sys-zone-grid-line = rgba(0,0,0,.18).

================ I. ACCENT-TINTED WASHES — TWO FROZEN RGB FAMILIES (20 literals, all NEEDS-TOKEN as ONE accent-derived scale) ================
SWEEP FINDING: the oracle hardcodes accent washes as raw RGB in TWO hue families — rgba(2,74,216,x) (the blue-era accent) and rgba(181,85,44,x) (the terracotta-era accent) — so NONE of them re-derive when --accent changes (a live theming BUG: re-accenting the oracle left every focus ring and selected-wash frozen). REBUILD RULE: all 20 collapse into ONE accent-derived alpha scale computed from --ui-sys-accent (color-mix in the token layer), e.g. --ui-sys-accent-tint-faint (~4-8%), --ui-sys-accent-tint-soft (~10-15%), --ui-sys-accent-tint-strong (~18-30%), plus --ui-sys-focus-wash for the focus ring. Every literal + exact home:
BLUE FAMILY (12): rgba(2,74,216,.15) (17x — THE universal focus ring, box-shadow 0 0 0 2-3px, on detail-row/cm-textarea/xy-input/plan+site+record inputs and selects) → --ui-sys-focus-wash. rgba(2,74,216,.12) (2x: subheader-field + mf-input focus — the 12% focus variant). rgba(2,74,216,0.12) (1x: .profile-tab.active .profile-tab-count background). rgba(2,74,216,.1) (1x: .plan-tag background). rgba(2, 74, 216, 0.08) (1x: .view-all-link:hover). rgba(2,74,216,.07) (1x: .record-nav-item.on — active record-nav wash). rgba(2,74,216,0.06) (1x: column drag-over target). rgba(2, 74, 216, 0.05) (1x: .open-ws-item.is-open). rgba(2, 74, 216, 0.04) (2x: .roles-row.self + open-ws-item hover). rgba(2,74,216,0.04) (1x: .profile-entry:hover / file-entry hover).
TERRACOTTA FAMILY (8): rgba(181,85,44,.2) (1x: selected map-dot ring). rgba(181, 85, 44, 0.3) (1x: .picked-chip border). rgba(181, 85, 44, 0.18) (1x: picked-chip hover). rgba(181,85,44,.15) (2x: login-field focus rings). rgba(181,85,44,.12) (2x: .tab.active .count bg + .ws-card.active ring). rgba(181, 85, 44, 0.1) (1x: picked-chip bg). rgba(181,85,44,.06) (3x: user-picker-row.picked + conv-row.active washes + the login-bg radial glow). rgba(181,85,44,0.04) (1x: .team-add-card:hover).

================ J. VALENCE TINTS (3 NEEDS-TOKEN) + MENTION DOTS (2 NEEDS-TOKEN) + MANAGER AMBER (1 CAPTURED→TOKEN · 2 NEEDS-TOKEN) ================
rgba(179,60,60,.5) / rgba(176,126,31,.5) / rgba(62,122,46,.5) (1x each: help-card.neg/.mid/.pos borders — 50% neg/neu/pos card outlines on the Help page) — NEEDS-TOKEN: valence border tints --ui-sys-neg-border-soft / --ui-sys-neu-border-soft / --ui-sys-pos-border-soft (build as 50% color-mix of the valence tokens).
rgba(179, 60, 60, 0.85) (1x: .multi-owner-remove — the red hover overlay that covers an owner avatar with an X) — NEEDS-TOKEN: --ui-sys-neg-overlay (85% neg scrim on the avatar circle).
MENTION DOTS (messaging composer + rendered chips; the Messaging box rules they map to distinct tokens but records no values — THIS table is the value record): #2E7D32 t-stk stakeholder (1x) → --ui-sys-mention-stakeholder; #6A1B9A t-pln plan (2x — also seed avatar Priya) → --ui-sys-mention-plan; (t-wsp #1976D2 → --ui-sys-mention-workspace and t-cmy #E64A19 → --ui-sys-mention-community share the swatch literals dispositioned in group F). NEEDS-TOKEN x2 here.
MANAGER AMBER: #E0A21A (1x: ManagerStar filled star) — flagged in the Users box → --ui-sys-manager-amber. CAPTURED→TOKEN. rgba(224,162,26,0.14) (1x: .manager-badge background — 14% amber wash) and #7A5414 (1x: .manager-badge ink — deep amber-brown) — the badge pair was NOT value-recorded in any box. NEEDS-TOKEN: --ui-sys-manager-badge-surface = rgba(224,162,26,.14) / --ui-sys-manager-badge-ink = #7A5414.

================ K. FUNNEL RAMP + SCROLLBAR (5 literals: 1 CAPTURED→TOKEN · 4 NEEDS-TOKEN) ================
#E2A85F (2x: the Lists "Winnable middle" band swatch (sheet.jsx inline) AND .funnel-1 "Purpose" arrow fill on Help) — already flagged →token in the Lists box → --ui-sys-band-middle (doubles as funnel stage 1). CAPTURED→TOKEN.
#F0C988 (1x: .funnel-2 "Plan" arrow) and #F8E2B0 (1x: .funnel-3 "Execute" arrow) — the Help box rules the funnel becomes a tokened SVG but did not record the original amber ramp. NEEDS-TOKEN: --ui-sys-funnel-2 = #F0C988 / --ui-sys-funnel-3 = #F8E2B0 (with --ui-sys-band-middle as stage 1 — a 3-step amber ramp).
#DCD3BF (2x: webkit scrollbar thumb + Firefox .is-scrolling scrollbar-color — the warm auto-hiding thumb) and #C5BBA3 (1x: thumb hover) — the whole reveal-on-scroll scrollbar treatment is a deliberate design feature not yet tokenized anywhere. NEEDS-TOKEN: --ui-sys-scrollbar-thumb = #DCD3BF / --ui-sys-scrollbar-thumb-hover = #C5BBA3.

================ L. SUPERSEDED — old-wrapper incidental styling, replaced by the token start-state (21 literals, grouped; every value recorded) ================
System-conversation washes — EXCEPTION, these two are CAPTURED→TOKEN not superseded: rgba(31, 26, 20, 0.03) (conv-row.system bg) + rgba(31, 26, 20, 0.08) (its hover) are captured verbatim in the Messaging/Cadence boxes → system-row wash tokens. (Counted under CAPTURED→TOKEN.)
SHADOWS → the tokens.css elevation ramp (--ui-sys-elevation-1/2/3) replaces every bespoke shadow; originals recorded: rgba(50,40,20,.06) (3x, --shadow-card two-layer card shadow) · rgba(50,40,20,.10) (1x, login-card 60px drop) · rgba(0,0,0,.14) (2x, cell-dd-menu + cell-cal popover shadows) · rgba(0,0,0,.16) (1x, prio-pop) · rgba(0,0,0,.28) (1x, cmdk + record-modal 60px) · rgba(0,0,0,.12) (7x, mention-pop/drawer shadows + tweaks chrome) · rgba(20,16,10,.10) (2x, drawer/side-pop shadows) · rgba(20,16,10,.22) (1x, modal shadow) · rgba(20,16,10,.12) + rgba(20, 16, 10, .12) (1x each, spacing variants — drawer shadow + side-veil).
SCRIMS → --ui-sys-scrim replaces: rgba(20,16,10,.32) (1x, modal-veil) · rgba(20,16,10,.18) (1x, drawer-veil) · rgba(31,26,20,.28) (1x, cmdk-backdrop — NOTE it adds backdrop-blur 5px; carry the blur decision to the palette build box).
STATE WASHES → --ui-sys-state-hover/pressed-opacity replace: rgba(0,0,0,.08) (4x: ws-tab-close hover; weight-track rail; comm-value-bar track — the two TRACK uses map to --ui-sys-track-off) · rgba(0,0,0,.06) (7x: .tab .count + .filter-count neutral count-pill backgrounds (→ the ui-badge neutral-tone token, value recorded here) + tweaks chrome) · rgba(0,0,0,.05) (1x: record-nav-collapse hover) · rgba(0,0,0,.1) (7x: settings-swatch-preview border + tweaks chrome) · rgba(0,0,0,.4) (1x: sheet-modals option-count muted text → --ui-sys-on-surface-muted).
ONE-OFFS: rgba(255,255,255,.85) (2x: impact-chip.on white swatch — resolves to on-fill white at 85%, a chip-internal detail owned by the tokened chip; + tweaks field focus) · #000 (1x: .btn-primary:hover — "darken to black" hover, replaced by the pressed state layer on --ui-sys-primary) · #F9A825 (dispositioned in group F, demo seed).

================ M. SUPERSEDED-DEV — the Tweaks panel's own floating chrome (28 literals, one block; dev-only, never app UI) ================
tweaks-panel.jsx styles ITS OWN floating dev panel (glassy card, iOS-style toggle, its own scrollbars/knobs/chips) plus commented-out Claude-theme preset arrays. All replaced wholesale: the rebuild's Design page is a Canonical-UI Settings pane. Recorded: rgba(250,249,247,.78) panel glass bg · #29261b (4x) panel ink · rgba(41,38,27,.72/.6/.55/.5/.45) label/value inks · rgba(255,255,255,.6/.9) field fills · rgba(0,0,0,.15/.25/.2/.3/.5/.78/.85/.88) borders/knobs/scrollbars/buttons/caret-svg · #34c759 iOS toggle-on green · #111 + #fafafa (contrast-check comment pair) · commented preset palettes #D97757 (4x, Claude terracotta) / #f6f4ef (2x) / #1F8A5B / #7A5AE0 / #475569 / #0f172a / #f1f5f9 · plus the literal string rgb() inside a comment (grep artifact, not a color — carried here so the census arithmetic is checkable).

================ TOTALS — coverage check ================
Distinct literal strings found by the sweep: 187 (matches the expected ~187; = 186 true color literals + 1 comment artifact).
TOKENIZED ................ 34  (9 surfaces + 3 inks + 3 valence/accent core + 19 zone family incl. the color-mix density formula)
CAPTURED→TOKEN ........... 66  (30 pill catalogs + 17 identity/config catalogs + 8 scoring/lists + 3 map + 2 system-row washes + #FAF8F2 + #E0A21A + #E2A85F + 2 weight tints + #9B9684 + #000000... itemized above)
NEEDS-TOKEN (NEW) ........ 37  (20 accent-wash family + 4 valence tints/overlay + 2 mention dots + 2 manager badge + 3 selection/header tints + 2 funnel + 2 scrollbar + --ui-sys-neu + neg-hover + accent-ink + zone-grid-line)
DECISION ................. 1   (#024AD8 — the accent start-hue ruling)
SUPERSEDED ............... 21  (shadows/scrims/state-washes/one-offs — replaced by elevation ramp, scrim, state layers; all values recorded)
SUPERSEDED-DEV ........... 28  (tweaks-panel chrome + commented presets + 1 grep artifact)
SUM = 34 + 66 + 37 + 1 + 21 + 28 = 187. Nothing dropped: every distinct literal appears exactly once above (multi-context literals carry all their uses in their one entry).
This box is entirely lossless for sweep (a) COLORS of the original-design census.` },
                                          { t: "Help — the engagement framework + how to read the map + zone key/strategy reference", done: true, d:
`HELP SCREEN (oracle: archive/src/help.jsx — HelpView). This is the static "How to read this" reference page. It reads STAKEHOLDER_DATA (D) for STATUS_ORDER, STATUSES, and GRID — every color/strategy/action shown here is single-sourced from the Relationship-engine box (the STATUSES catalog); this page only RENDERS them, it does not define them. The page is a centered reading column (outer .help-wrap, inner .help-inner) holding EXACTLY FIVE rendered blocks beneath an opening prelude: prelude + (1) framework funnel + (2) how to read the map (spectrum + three help-cards) + (3) the 24-zones grid + (4) strategy reference + (5) how scores become coordinates.

PRELUDE (.help-prelude > p) — VERBATIM, with three emphasized words wrapped in <em>:
"Stakeholders exist in a public square where ideas are exchanged, your credibility is won or lost, and value is created, shared, or squandered."
(the words ideas, credibility, and value are LOWERCASE in the source and each wrapped in italic <em> — the emphasis is the <em> markup, never capitalization; everything else is plain text.)

BLOCK 1 — THE FRAMEWORK FUNNEL.
Heading (.help-title): "How to plan for and engage stakeholders".
A funnel figure (.engage-funnel) of three arrow stages (.funnel-arrows holding .funnel-arrow .funnel-1/.funnel-2/.funnel-3), labeled in order: "Purpose", "Plan", "Execute". Beneath, three columns (.funnel-cols > three .funnel-col), each holding four steps (.funnel-step; the first step of each column carries .funnel-step-lead). The TWELVE steps, verbatim and in order (NEAR-duplicates of the 12-step list in the Plan box / data.js PLAN_STEPS — help.jsx HARDCODES its own copy rather than reading PLAN_STEPS, and the copy DIVERGES at step 6: help.jsx ships "6. Cross-functional teams alignment" where PLAN_STEPS and the Plan box have "Cross-functional alignment". The list below is the help.jsx wording, verbatim — the oracle truth for THIS page; the divergence is also recorded in the Catalogs box's PLAN_STEPS entry):
Column 1 (Purpose): "1. Set goals for your organization" / "2. Issue identification" / "3. Stakeholder identification" / "4. Stakeholder prioritization".
Column 2 (Plan): "5. Landscape analysis" / "6. Cross-functional teams alignment" / "7. Research & listening sessions" / "8. Early stakeholder analysis & modeling".
Column 3 (Execute): "9. Launch campaign" / "10. Ongoing stakeholder analysis" / "11. Collaborate with stakeholders" / "12. Realize shared value where possible".

BLOCK 2 — HOW TO READ THE STAKEHOLDER MAP.
Heading (.help-title): "How to read the stakeholder map".
First, a spectrum strip (.spectrum): D.STATUS_ORDER mapped to swatches (.sw), each swatch background = STATUSES[name].color, text color = STATUSES[name].text, label = the zone name. This is a horizontal legend of every zone in canonical order (single-sourced from the Relationship-engine box).
Then three help-cards in a row (.help-cols > three .help-card), each with an <h3> and a <ul class="bullets">; the first and third also carry a corner tag (.influencer-tag) reading the literal text "Influencer" (with the surrounding quote marks). VERBATIM contents:
CARD 1 (.help-card.neg) — h3 "Negative impact on organization"; bullets: "Defend license to operate" / "Challenge misinformation" / "Plan for their influence in community" / "Identify their reputation with audiences"; tag: "Influencer".
CARD 2 (.help-card.mid) — h3 "The winnable middle"; bullets: "Dispel myths and misperceptions" / "Appeal to their priorities" / "Identify shared value to move them our way" / "Invest in relationship where possible" / "Identify our reputation with them"; NO tag.
CARD 3 (.help-card.pos) — h3 "Positive impact on organization"; bullets: "Maximize shared value" / "Maintain relationship" / "Champion their cause" / "Recruit as public surrogates" / "Communicate often"; tag: "Influencer".

BLOCK 3 — THE 24 ZONES AT A GLANCE (.help-grid-section).
<h2> "The 24 zones at a glance".
Intro paragraph, verbatim: "Stakeholders are plotted on a two-axis grid: x measures impact on the business (do they work with you or against you?), y measures their influence in the community. The combination determines the relationship strategy." (the letters x and y are LOWERCASE in the source and each wrapped in bold <strong> — the emphasis is the <strong> markup, never capitalization.)
The grid figure (.help-grid-figure > .grid-body): D.GRID is iterated flatMap over rows then cells; each cell is a .zone div with background = STATUSES[status].color, text color = STATUSES[status].text, holding a .zone-label (font-size 11.5) showing the zone name. GRID is the 4-wide by 6-tall (24-cell) status matrix from the data layer (the Relationship-engine box owns GRID and the 14 distinct zone definitions — this page only paints them; do NOT re-list the 14 here).
Below the grid, a full-width axis legend strip (.map-axis-legend, marginTop 12) with three spans: left (justifySelf start) "← Works against you"; center (justifySelf center) "↑ Greater community influence  ·  ↓ Less community influence"; right (justifySelf end) "Works with you →". CHARACTER FIDELITY: in the source the two spaces on EACH side of the center span's middot are NON-BREAKING SPACES written as &nbsp; entities (influence&nbsp;&nbsp;·&nbsp;&nbsp;↓) — reproduce the &nbsp;s, not plain spaces (this transcription shows plain spaces only as a readability convenience).

BLOCK 4 — STRATEGY REFERENCE (.help-grid-section).
<h2> "Strategy reference".
Paragraph, verbatim: "For every zone, a stakeholder's position on the map returns recommended posture and identifies suggested immediate actions your team can take."
Then a two-column grid (gridTemplateColumns "1fr 1fr", gap 10) of cards, one per name in D.STATUS_ORDER. Each card: border 1px solid var(--rule), borderRadius 10, padding "12px 14px", background var(--paper), an inner grid "8px 1fr" gap 12 align-items start. Left cell is an 8px-wide full-height color spine (borderRadius 4, background = STATUSES[name].color). Right cell: a header row (flex, gap 8) of the zone name in bold 13px + a muted "·" separator (11px) + the strategy in italic (12px, color STATUSES[name].text = meta.strategy); below it a muted line (12px, line-height 1.45) = meta.action. (strategy and action text come from the STATUSES catalog — Relationship-engine box.)

BLOCK 5 — HOW SCORES BECOME COORDINATES (.help-grid-section).
<h2> "How scores become coordinates".
Paragraph, verbatim (note the literal minus sign characters −10): "On the Scoring tab, every teammate rates each stakeholder on x and y from −10 to 10. Each teammate also has a weight. The final coordinate is the weighted average of their scores. A teammate with weight 1.5 counts 1.5 times more than one with weight 1.0."
Then a <pre> formula block (styled: background var(--bg-2), border 1px solid var(--rule), borderRadius 8, padding "12px 14px", monospace via var(--mono), 12px, color var(--ink-2), margin 0, overflowX auto) containing EXACTLY these three VERBATIM lines — Σ is the Greek capital sigma, × the multiplication sign; the numerator (member.x × member.weight) IS parenthesized but the denominator Σ member.weight is NOT; lookup(final.x, final.y) has no spaces just inside the parentheses; the third line pads "zone" with FOUR spaces before "=" so all three equals signs align. Each line starts flush-left inside the <pre>; the two-space lead below is guide indentation only:
  final.x = Σ (member.x × member.weight) / Σ member.weight
  final.y = Σ (member.y × member.weight) / Σ member.weight
  zone    = lookup(final.x, final.y)
(The math: weighted mean of each axis over team members, then the (x,y) pair is looked up against GRID to name the zone.)

BUILD-MAP (Canonical UI, ui-* only — NEVER md-*/shadcn). Render this as a ui-* page shell MINUS the right inspector rail (this is a reading page, no metadata rail): use the standard app-shell/sidebar content region with a single centered reading column. The spectrum strip and any zone-key swatches are ui-chip swatches tinted from the --ui-sys-zone-* tokens (the 14 zone colors are first-class tokens — never inline hex). The 24-zone 4x6 grid is the SANCTIONED tokened inline SVG, drawn identically to the Map box's grid so the two surfaces stay visually consistent (same cell fills from --ui-sys-zone-*, same proportions). THE ENGAGEMENT FUNNEL FIGURE (Block 1) — ruled build, nothing left to invent: the three arrow stages ("Purpose" / "Plan" / "Execute") are a SANCTIONED tokened inline SVG figure, the same treatment as the 24-zone grid — three chevron/arrow shapes laid left-to-right, every fill and label ink drawn from --ui-sys-* tokens (surface-container fills stepping toward the accent role for stage emphasis; never inline hex, no gradients), with the stage labels set in the body face (Inter) inside the SVG; the three 4-step columns beneath are tokened panels (--ui-sys-surface-card on the runway), each holding a ui-list of exactly four rows, where the lead step (.funnel-step-lead) is a token-driven emphasized list-row variant (stronger ink + fill from --ui-sys-* tokens) — never ad-hoc CSS, never a bespoke div stack. Titles use the Newsreader title typeface token; body uses Inter. The formula <pre> becomes a tokened code/quote surface (no mono family is shipped — render it in the body face at a fixed/tabular setting or as a plain bordered panel; do NOT introduce a mono token; the three formula STRINGS above stay character-for-character verbatim, including the Σ/× glyphs and the alignment spaces). Help-cards become tokened panels (ui surface-card on the runway), bullets as ui-list. No gradients, no shadows beyond the shipped elevation ramp, no ad-hoc color.

SKELETON TREE (ORIGINAL-DESIGN STRUCTURE CENSUS, 2026-07-03 — the literal region tree extracted from archive/src/help.jsx (HelpView), in render order; the build assembles against THIS tree, never prose) —
div "help-wrap" — the outer PAGE CONTAINER. Canonical UI: the app-shell content region (layout row — token-only container; no inspector rail on this page).
. div "help-inner" — the centered reading column. Layout column — token-only container.
. . div "help-prelude" > p — the verbatim prelude with the three em-wrapped words. Maps to tokened body text on the runway.
. . div "help-title" — "How to plan for and engage stakeholders". Maps to a title-typeface heading (Newsreader token).
. . div "engage-funnel" — the funnel figure. Maps to the SANCTIONED tokened inline-SVG figure + panels per the BUILD-MAP above.
. . . div "funnel-arrows" > 3 x div "funnel-arrow" (also "funnel-1" / "funnel-2" / "funnel-3") > span — "Purpose" / "Plan" / "Execute".
. . . div "funnel-cols" > 3 x div "funnel-col" > 4 x div "funnel-step" each (the FIRST step per column also carries "funnel-step-lead"). Maps to three tokened panels each holding a ui-list of exactly four rows (lead row = the emphasized list-row variant).
. . div "help-title" — "How to read the stakeholder map".
. . div "spectrum" > one div "sw" per D.STATUS_ORDER entry (inline background/color from STATUSES) — the horizontal zone legend. Maps to ui-chip swatches tinted from the --ui-sys-zone-* tokens.
. . div "help-cols" > 3 x div "help-card" (variant classes "neg" / "mid" / "pos"): each = h3 + ul "bullets" (4 / 5 / 5 li respectively) + [div "influencer-tag" on the neg and pos cards ONLY]. Maps to tokened panels with ui-list bullets.
. . div "help-grid-section" (the 24 zones) — h2 + p (the x/y strong-emphasis paragraph) + div "help-grid-figure" > div "grid-body" > 24 x div "zone" (inline zone colors) each holding div "zone-label" (inline fontSize 11.5); then div "map-axis-legend" (inline marginTop 12) > 3 spans (justifySelf start / center / end legend strings). Maps to the sanctioned tokened inline-SVG grid, drawn identically to the Map box's grid.
. . div "help-grid-section" (strategy reference) — h2 + p + one ANONYMOUS inline-styled grid div (gridTemplateColumns "1fr 1fr", gap 10) > 14 x ANONYMOUS inline-styled card div (1px var(--rule) border, radius 10, padding 12px 14px, paper background, inner grid "8px 1fr" gap 12, align start), each = spine div (8px wide, full height, radius 4, zone color) + content div > header div (flex gap 8: strong zone name 13px + span "muted" "·" 11px + em strategy 12px in the zone text color) + div "muted" action line (12px, line-height 1.45). Maps to token-driven card composition with --ui-sys-zone-* spines — the anonymous inline-styled divs are absorbed into that composition, never rebuilt as ad-hoc divs.
. . div "help-grid-section" (formula) — h2 + p + pre (the ANONYMOUS inline-styled formula block: var(--bg-2) background, 1px var(--rule) border, radius 8, padding 12px 14px, mono face, 12px, var(--ink-2), margin 0, overflowX auto) holding the three verbatim formula lines. Maps to the tokened code/quote surface per the BUILD-MAP (no mono family shipped).
CLASSNAME ACCOUNTING — every className region in help.jsx appears in the tree above: help-wrap, help-inner, help-prelude, help-title, engage-funnel, funnel-arrows, funnel-arrow funnel-1/-2/-3, funnel-cols, funnel-col, funnel-step, funnel-step-lead, spectrum, sw, help-cols, help-card neg/mid/pos, bullets, influencer-tag, help-grid-section, help-grid-figure, grid-body, zone, zone-label, map-axis-legend, muted — NONE dropped. The three ANONYMOUS inline-styled regions (the strategy-reference outer grid, its 14 cards, and the formula pre) are named explicitly above. The tree CONFIRMS the box (prelude + exactly five blocks, in the stated order, with the stated strings and per-card bullet counts); no corrections required.

UX HANDLER CENSUS (ORIGINAL-DESIGN UX CENSUS, 2026-07-03 — every event handler in archive/src/help.jsx) —
0 handlers, all accounted — the module contains NO event handlers of any kind: no onClick / onPointer* / onChange props, no addEventListener, no effects, no local state, no refs. HelpView is a 100% static render from STAKEHOLDER_DATA (STATUS_ORDER, STATUSES, GRID); the only interactivity on the page is browser-default scrolling and text selection, exactly as the box describes.` },
      { t: "Design system — RULED: Canonical UI (design-system/) is the go-forward; shadcn/Tailwind plan superseded (history preserved)", done: true, d:
`RULING (2026-06-13) — the go-forward design system is CANONICAL UI: this repo's design-system/ (un-branded ui-* web components + the --ui-ref-*/--ui-sys-* token contract + the binding manifest.json), built in PRs #1–#6 and previewable at design-system/preview.html + wireframes.html. It absorbed everything this box authorized: the Soapbox surface/ink palette is encoded verbatim in tokens.css (--ui-ref-neutral-0..6, --ui-ref-ink-strong/muted/faint); the layout depth rules (sidebars never white · main runway #FEFDFC · cards/papers #FFFFFF · sidebar fields #FCFBF9) map to --ui-sys-surface-container / -surface / -surface-card / -surface-field; the 14 zone + priority colors are first-class --ui-sys-zone-* tokens; themes (Soapbox/Undecideds/Night Shift) = token-set swaps via the Settings → Design dashboard. The shadcn/ui + Tailwind implementation plan below is SUPERSEDED (Tailwind utilities = a thousand styling surfaces; it drifted — see design-system/README) and is preserved for losslessness only. Its open DECISIONS resolve as: titles = Newsreader (encoded in tokens.css) · mono = REJECTED, Inter tnum only · accent = tokens.css ships --ui-sys-accent #B5552C vs design.md's #D96B43 — pick at the Design-page pass (token edit; must never collide with the zone colors) · shadows = tokens.css ships a subtle elevation ramp for overlays vs the "no shadows ever" start-state rule — pick at the Design-page pass (token edit). Component vocabulary translation: shadcn Button→ui-button · Input/Textarea→ui-text-field · Select→ui-select · Combobox/Command→ui-autocomplete (+ ui-dialog for the ⌘K palette) · TanStack Table→ui-data-table / ui-stakeholder-table · tooltips/popovers/dialogs/menus/tabs/chips/etc.→ the matching ui-* component · lucide-react→<ui-icon> Material Symbols. The rule that every box carries its VISUAL CUES still binds — cues now name ui-* components + --ui-sys-* tokens.

——— HISTORY (superseded 2026-06-13; preserved losslessly) ———
THE DESIGN COMES FROM THE DESIGN SYSTEM, NOT THE OLD CODE. Sources (saved in the repo, survive rebuild): docs/design/design.md (the Soapbox token spec) + docs/design/interfacelibrary.html (the BUILDING BLOCKS — the canonical component primitives + exactly how tokens are applied to them; NOT a mockup of any app screen; it exists to stop vibing by giving known-good pieces to assemble from). The app SCREENS come from the captured .io (scaffold, records, landings, pages) COMPOSED FROM those blocks and skinned by the tokens. Built with shadcn/ui (Radix + Tailwind). The old code contributed behavior only; ZERO of its CSS/styling carries forward.

TOKENS (the single source; design.md) —
• SURFACES (7, light→dark): canvas #FFFFFF · app #FEFDFC · field #FCFBF9 · container #F8F7F3 · container-high #F4F3ED · border-subtle #F0EEE6 · border-strong #E8E6DE.
• INK (3): text-primary #666361 · text-muted #ABA9A4 · border-divider #DFDDD6.
• ACCENT: #D96B43 (terracotta) + accent-muted #F3DCD3. [DECISION: confirm this is THE brand accent; ensure it never collides with the 14 relationship-zone colors, which stay separate/semantic.]
• SPACING: 4px base — xs 2 · sm 6 · md 12 · lg 18 · xl 24 (override Tailwind defaults; don't drift).
• RADIUS: none 0 · xs 4 · sm 8 · md 12 · lg 16 · full 9999 (--radius default 4px / xs).
• TYPE: body = Inter 14px. [DECISION: titles = Newsreader (your authorized brand) — design.md currently says Georgia; treat Georgia as fallback. mono = JetBrains Mono — [DECISION: allow mono for numbers/IDs/code, or Inter-tnum only?].]

LAYOUT DEPTH RULES (design.md) — sidebars/rails/top-nav = container / container-high (NEVER white); main runway = app (#FEFDFC); record papers/tables/cards = canvas (#FFFFFF, pop clean); MAIN-content fields = white; SIDEBAR fields = field (#FCFBF9, recessed, lighter-than-sidebar, not white). Matches the scaffold + start-state rules.

THEMES (re-skin = swap the token set, never touch components) — Soapbox/Editorial (warm beige, default) · Undecideds (true greyscale) · Night Shift (dark, warm charcoal). Driven by a class/token swap; controlled by Settings → Design dashboard.

⚠️ DECISION — SHADOWS/GRADIENTS: design.md/interface use subtle sb-elevation-1/2/3 shadows; the start-state rule said "no shadows/gradients ever." RESOLVE: allow subtle elevation-1 on cards/modals only, or ban all. (Pending your call.)

shadcn/ui IMPLEMENTATION (real shadcn, not hand-rolled Radix) — setup at BUILD time: npx shadcn@latest init (configures Tailwind + the cn() util + CSS-variable tokens + installs clsx/tailwind-merge/cva/lucide-react), then npx shadcn@latest add <component> (each pulls its own Radix dep). THEMING: map the Soapbox palette → shadcn's semantic HSL tokens (--background #FEFDFC, --card/--popover #FFFFFF, --primary #D96B43, --muted #F8F7F3, --border #F0EEE6, --input/--foreground/--muted-foreground per design.md HSL) + ADD extra custom tokens for the surface steps shadcn lacks (--surface-container-high, --field, second border). Components reference SEMANTIC tokens only — one namespace, standard/updatable. Production Tailwind via Vite/PostCSS (NOT the CDN).

COMPONENT VOCABULARY (element → implementation) — buttons → shadcn Button (default/secondary/outline/ghost; icon); inputs → Input/Textarea; select → Select; searchable → Combobox (Command); checkbox/radio/switch/slider/tabs/badge/chip/card/dialog/dropdown-menu/popover/tooltip/avatar → the matching shadcn components; command palette (⌘/K) → Command + Dialog (blurred backdrop); DATA TABLE → TanStack Table (headless: sort/filter/paginate/virtualize/inline-edit) styled with tokens (no shadcn datagrid exists); RELATIONSHIP MAP + PIVOT HEATMAP → tokened inline SVG (no chart lib); icons → lucide-react. The scaffold (top bar + collapsible sidebars + white main) composes from these.

ZONE & PRIORITY COLORS — the 14 relationship-zone colors (Relationship-engine box) and priority colors are SEPARATE semantic tokens layered on the system, applied by data-attribute/class (single-sourced), reused by Map + Lists + Help + scorecard — never inline literals, never colliding with the accent.

BUILD RULE — every value is a token (no magic numbers, no hand-CSS, no inline styles, no !important); the guard enforces it. design.md is the source; the Settings → Design dashboard tunes the tokens; nothing restyles a component one-off.

NO MOCKUPS EXIST (the hard reality) — there are NO designed visuals/screens anywhere, and screenshots are NEVER requested or used. After the old code+design is archived, the rebuild has ONLY: (1) the lossless .io notes (structure + behavior + VISUAL CUES), (2) interfacelibrary.html (the building-block kit), (3) design.md (the tokens). Screens are CONSTRUCTED from the .io layout boxes, assembled from the blocks, skinned by the tokens — built blind, no picture to copy.
RULE (binds every box + any future session): the .io is the SOLE build source. EVERY box must carry its VISUAL CUES — naming the interfacelibrary building block(s), the design.md token(s), the arrangement/spacing, and the states — enough to build the screen with no mockup. If a visual cue isn't in the .io, it doesn't exist at build. Never weight a screenshot of the old (broken) design; never ask for one.

TOKENS ARE A START — design.md is the seed; the set GROWS as the .io finalizes. Already known to add: the 14 relationship-ZONE colors + PRIORITY/STATUS colors (semantic, single-sourced), the extra SURFACE tokens shadcn lacks, the pivot-heatmap scale, and any element-specific tokens surfaced during capture. COVERAGE CHECK (part of the INDEX/manifest): every captured UI element must map to a building block + the tokens it needs; anything missing from interfacelibrary.html / design.md is a GAP to close BEFORE build.` },
                  { t: "Demo features (client-side) — Excel import + template, export, onboarding, mobile companion", done: true, d:
`Buildable in STATE A (demo, no backend), seeded with sample users + stakeholders, full capability, add dummy AND real people.

ORACLE STATUS — READ THIS FIRST. Most of this box is FORWARD-DESIGN, not capture. There is NO import wizard anywhere in archive/src — no upload, no XLSX/CSV parsing, no template generator, no column mapper, no validation preview. Likewise NO onboarding tour/coachmarks, NO mobile companion surface, and NO Word/PDF plan export exist in the oracle. What the oracle DOES contain, and what this box therefore captures vs designs:
- IN THE ORACLE (captured): CSV EXPORT of the Lists table — sheet.jsx exportCsv(), 18 columns in this exact order: Stakeholder (displayName(r)||r.name), Organization, Category, Type, Market, Region, Geography, Issues (join "; "), Priority, Tags (join "; "), Owners (ids resolved to user names, join "; "), Last contact, Status, x (r._x.toFixed(1)), y (r._y.toFixed(1)), Relationship (r._status), Website (normalizeUrl), Notes. CSV escaping: any value containing a double-quote, comma, or newline is wrapped in double-quotes with internal quotes doubled. Exports the FILTERED row set (what the table currently shows), not the raw store. Filename = workspaceLabel with every non-word/non-hyphen run replaced by "_", falling back to "stakeholders", + ".csv"; delivered via a Blob (type "text/csv") + a temporary anchor click. Trigger: the table-footer button "Export CSV" with the download icon. (Full Lists context lives in the Lists-table box; the export mechanics are authoritative here.)
- IN THE ORACLE (captured): the DEMO SEED itself — data.js TEAM/STAKEHOLDERS/SEED_SCORES etc. (see the Demo-seed-dataset box) loaded through store.js Store.load(table, seed) (persist-on-first-read to localStorage). Store.reset() EXISTS in store.js (lines 85–93: removes every localStorage key starting with the "hpsm:" namespace prefix, then re-stamps SCHEMA_VERSION "v9" into the hpsm:__schema key) but it is UNWIRED — its own comment says "used by a hard reset-demo-data action IF NEEDED", and no oracle UI, button, route, or handler ever calls it (zero call sites in archive/src). The API helper is captured; the "reset demo data" ACTION itself is FORWARD-DESIGN to add at rebuild (a manager-only Settings affordance calling Store.reset() then reloading the seed), NOT captured behavior. The demo login screen offers "Or continue as one of the demo accounts:". ORACLE BUG — DO NOT REPLICATE: app.jsx auto-promotes any logged-in user to manager "for demo purposes" (already flagged in the App-shell box and INDEX gate 5); the rebuild must NOT carry this into any state.
- FORWARD-DESIGN (design accurate, build new): everything else in this box — the Excel/CSV import wizard + downloadable template, the onboarding tour, empty-state polish + bulk actions + soft-delete/archive semantics, the mobile companion, the Integrations shell (settings.jsx has 9 panes; Integrations is the forward-design 10th, per the Settings box), and plan Word/PDF export (specified in the Plan box; no export code exists in plan.jsx).

IMPORT STAKEHOLDERS FROM EXCEL/CSV (+ DOWNLOADABLE TEMPLATE) — FORWARD-DESIGN
- DOWNLOAD TEMPLATE: an Excel/CSV with EVERY stakeholder/table column as a header (the 26 Lists columns — Stakeholder, Organization, Category, Type, Market, Region, Geography, State, Sites, Issues, Priority, Tags, Owner, Email, Phone, X account, Last contact, Status, Notes, Website, Community, etc. — the authoritative column set is the Lists-table box).
- COLUMN BEHAVIOR IN THE TEMPLATE (this is what prevents breakage):
  - CHOICE-LIMITED columns (values restricted to one of OUR catalogs) MUST be DROPDOWNS (Excel data validation), so the user can't misspell, re-capitalize, or reformat a value: Category, Type, Market, Region, Geography, State, Site, Priority, Status, Issues, Tags, Owner. Values come from the Catalogs.
  - CASCADING dropdowns where a column is a CHILD of a parent: Type depends on Category; Region depends on Market; Site depends on State. The template enforces dependent validation (child options follow the chosen parent) — exactly the in-app cascades.
  - COMPUTED / LINKED columns (filled by linkage in-app, not a dropdown) — Relationship/zone, x, y, Community investment, and audit fields — carry an INSTRUCTION: "LEAVE BLANK — computed in the app." On re-import these blanks are IGNORED and must NOT interrupt/abort the import. (Round-trip note: the oracle CSV export DOES emit x/y/Relationship — an exported file re-imported must have those columns silently skipped, never treated as input.)
  - FREE-TEXT columns (Stakeholder, Organization, Email, Phone, X, Website, Notes) accept entry with format hints (email, phone (xxx) xxx-xxxx). Multi-value (Issues/Tags/Owners) use a clear delimiter (semicolon — matching the "; " the oracle export already uses), each value validated against its catalog.
- WHY: dropdowns + cascades + blank-computed rules eliminate the misspellings, inconsistent casing/wording, and number/format drift that otherwise break the app on import.
- FLOW: download template → fill → upload → auto column-map (match headers) → VALIDATE (every dropdown value matches a catalog; cascades valid; dates/numbers parse; computed columns ignored) → PREVIEW (flag any invalid rows) → COMMIT (creates stakeholders; if imported from a workspace, auto-assigns to it; mints UUIDs + audit fields). Invalid catalog values are rejected/flagged pre-commit, never silently coerced.

EXPORT — plan → single Word/PDF (FORWARD-DESIGN; contents specified in the Plan box); table → CSV (ORACLE, exportCsv as spelled out above); the template above is the import counterpart.

ONBOARDING TOUR — FORWARD-DESIGN. Coachmarks on first run; replayable from the profile menu.

EMPTY / SEED STATES — seed = ORACLE (data.js + store.js, above); the rest FORWARD-DESIGN: blank-org vs demo-data seed choice; empty states per page; bulk actions; soft-delete/archive (per the Enterprise model box); the hard "reset demo data" action wired to the currently-unwired Store.reset() (above).

MOBILE COMPANION (the one mobile surface) — FORWARD-DESIGN. A modal/responsive view: stakeholder quick-view · add-note · messages. (Earmarked mobile; everything else is desktop-web.)

INTEGRATIONS SHELL — FORWARD-DESIGN. The Settings → Integrations pane (embed/FX/country/connectors) — shell now, live wiring in State B. (The oracle settings.jsx has no such pane; see the Settings box.)

CANONICAL UI BUILD-MAP (ui-* only; design-system/manifest.json is binding):
- IMPORT WIZARD = one ui-dialog (large/fullscreen variant) hosting a 4-step flow, steps navigated by ui-button (variant "filled" for the forward action, "text" for Back/Cancel) with step state shown via ui-progress (determinate, 4 steps) in the dialog header:
  1. UPLOAD — a dropzone COMPOSITION assembled from existing primitives (a bordered drop target styled entirely by --ui-sys-* tokens, containing ui-icon "upload_file", the copy "Drop your .xlsx or .csv here, or", and a ui-button variant "outlined" label "Browse files" wired to a hidden file input; accepted types .xlsx/.csv). If a reusable drop target proves to need real drag-over/error states beyond this composition, that is a GAP → build ui-dropzone INTO design-system/, register it in manifest.json, THEN use it — never a div-with-styles in app code.
  2. COLUMN MAP — ui-data-table, one row per detected file header: file header (text) → target column (ui-select listing the 26 Lists columns + "Ignore this column") → match badge (ui-chip: "auto-matched" vs "unmapped"). Auto-match by case-insensitive header equality; unmapped headers default to "Ignore this column".
  3. VALIDATION PREVIEW — ui-data-table of the parsed rows with per-row flags: valid rows plain; invalid rows carry a leading ui-icon "error" + ui-chip (error variant) naming the failure ("Unknown Category value", "Region does not belong to chosen Market", "Unparseable date", etc.), cell-level errors highlighted via the table's error state tokens. Header summary line: "N rows ready · M rows with errors". A ui-switch "Skip invalid rows" (default on) vs blocking commit until fixed.
  4. COMMIT — ui-button variant "filled" label "Import N stakeholders" (disabled while M>0 and skip-invalid is off); on success a ui-snackbar "Imported N stakeholders" and the dialog closes.
- TEMPLATE DOWNLOAD = a generated XLSX (client-side, no backend): sheet 1 = the 26 headers with Excel data-validation dropdowns on every choice-limited column; a HIDDEN LOOKUP SHEET holds the catalog value lists and the parent→child ranges that power the cascading validation (Type-by-Category, Region-by-Market, Site-by-State); computed columns carry the "LEAVE BLANK — computed in the app" note in row 2. Trigger: ui-button variant "outlined" with ui-icon "download" label "Download template" inside step 1 of the wizard (and wherever import is offered).
- CSV EXPORT = ui-button variant "text" with ui-icon "download" label "Export CSV" in the Lists table footer (replacing the oracle's footer-export-btn), calling the exportCsv logic captured above.
- ONBOARDING COACHMARKS = GAP. No manifest component covers an anchored spotlight/coachmark (ui-tooltip is hover-only, ui-dialog is modal-centered). Build ui-coachmark INTO design-system/ (anchored callout with scrim cutout, step counter "2 of 6", Next/Skip ui-buttons, full states + a11y to the ui-button quality bar), register it in design-system/manifest.json BEFORE first use (add it to INDEX coverage gate 2 alongside avatar/avatar-stack/owner-picker/badge-count).
- MOBILE COMPANION = the same ui-* components in their responsive layouts (ui-app-shell collapses per its manifest breakpoints; quick-view = ui-sheet bottom variant; add-note = ui-dialog with ui-text-field multiline; messages = the Messaging box's ui-list/ui-text-field composition). No parallel mobile kit.
- INTEGRATIONS SHELL = a 10th Settings pane assembled from ui-list rows (connector name + ui-icon + ui-switch, disabled state) with a ui-chip "Coming in State B" — shell only.
- NEVER shadcn, NEVER TanStack, NEVER Material/md-*, NEVER Tailwind — this build-map supersedes the pre-ruling UI KIND paragraph that named them. All visuals via --ui-sys-* tokens only.` },
                  { t: "Paid add-ons — Polling, Personas, AI Message Generator, billing & gating", done: true, d:
`The monetized layer, gated per org entitlement. Locked (with an upgrade affordance) until enabled; once on, they appear in their host surfaces.

ORACLE STATUS — FORWARD-DESIGN, except ONE oracle surface. The only add-on affordance that exists anywhere in the archive app is the Personas note in the Plan editor's right aside (captured verbatim below). There is NO Polling lock, NO upgrade CTA, NO billing UI, NO entitlement flag, NO Stripe/metering code anywhere in the oracle. Everything else in this box — the Polling lock, upgrade CTAs, entitlements, Stripe billing, usage metering — is forward-design to be finalized with the user and built in State B.

ORACLE CAPTURE — the Personas add-on note (archive/src/plan.jsx + styles.css, verbatim; the source vanishes at rebuild): in the plan EDITOR's right aside, the LAST aside field (a plan-aside-field with the plan-divider rule above it), under the standard aside field label "Personas", sits a single dashed note (.plan-addon-note): a lock icon (icon name "lock", 18px, color var(--ink-mute)) followed by this exact copy string — "Add-on - persona modeling from polling & listening sessions." (plain hyphen after "Add-on", literal ampersand, trailing period). Note container spec: display flex, align-items flex-start, gap 6px, font-size 11.5px, ink var(--ink-3), background var(--paper), border 1px DASHED var(--rule), border-radius 8px, padding 8px 10px. It is a dashed NOTE, not a chip and not a button; it has no click behavior. This is the one affordance the DEPENDENCIES line below refers to.

POLLING (plan element 8) — stakeholder surveys: a question set posed to N recipients + results as insight themes (see Plan worked-example reference for the starter questions/results pattern). Feeds Personas + the Plan-Fit signals. Premium. [Forward-design: element 8 has NO locked affordance in the oracle — the rebuild adds one, mirroring the Personas note.]

PERSONAS (plan element 9) — persona modeling per stakeholder CATEGORY, built from polling + listening sessions + consumer data: one named archetype per category, each with Demographics · Awareness & Concerns · Perspective on the org · Engagement Willingness (see worked-example reference). Sharpens the relationship-recommendation signals. Premium.

AI MESSAGE GENERATOR — takes a FINISHED plan → generates KEY MESSAGES (plan element 13). Server-side (Claude API), with a curated PRE-PROMPT (org/plan context), METERED usage. Output is editable + added by the team (key messages can also be custom; the generator just seeds them). Honest note: this is the only server-side AI feature; it requires State B (backend) + metering; gate + rate-limit it.

BILLING & GATING — Stripe per-seat subscriptions + plan tiers; per-org ENTITLEMENTS turn add-ons on/off; usage METERING for metered features (AI generator). Entitlements checked server-side (RLS/edge), not just UI. Managers manage billing in Settings (admin). See Enterprise architecture pillar 17 (Billing & licensing — that box's pillar numbering matches docs/ENTERPRISE_ARCHITECTURE.md §17 one-to-one).

DEPENDENCIES — all require STATE B (Supabase/backend) + the relevant integrations (polling capture, AI API, Stripe). In the demo they appear as LOCKED affordances (the dashed add-on note captured above — today only on Personas; extended to Polling and the Key Messages generator in the rebuild), never functional.

CANONICAL UI BUILD-MAP (ui-* only; design-system/manifest.json is binding; NEVER md-*/Material Web, NEVER MUI, NEVER shadcn, NEVER Tailwind; all visuals via --ui-sys-* tokens only):
- LOCKED FEATURE PANEL = a tokened ui-* card composition placed exactly where each gated feature would live once entitled: the Plan editor's element 8 slot (Polling), element 9 slot (Personas — the rebuild of the oracle dashed note, keeping its verbatim copy string), and the Key Messages element 13 slot (AI Message Generator). Composition: ui-icon ligature "lock" (size from --ui-sys-icon-size-*) + the feature's explanatory copy + an upgrade ui-button CTA — variant filled, label "Upgrade" for managers (opens the Settings billing pane); variant text, label "Ask your manager" for members. The card SURFACE is a GAP per the design law — no manifest component currently covers a card/callout panel (and the oracle's dashed-note look must live as tokens, e.g. a dashed outline + muted ink + radius, never inline CSS) — so build the card/callout component INTO design-system/ to the ui-button quality bar, register it in manifest.json, THEN compose; never a div+CSS reimplementation in app code.
- BILLING & ENTITLEMENTS ADMIN = a Settings pane composition (managers only, per the Settings box's ui-* pane pattern): ui-select for the org plan tier; one ui-switch per add-on entitlement (Polling · Personas · AI Message Generator — server-backed, never client-only) with a ui-chip status per row ("Included" / "Add-on" / "Metered"); ui-data-table for SEATS (one row per member: name, role, seat status) and a second ui-data-table for INVOICES (date, amount, status, download); "Manage billing" = ui-button variant outlined opening the Stripe customer portal.
- USAGE METERING INDICATOR (AI generator) = ui-linear-progress (determinate, value = used/quota) + a ui-chip with the numeric "N of M generations" readout, shown in the generator's host surface (the Key Messages element) and echoed in the Settings billing pane.
- FORWARD-DESIGN FLAG (explicit): NONE of the above exists in archive/src — no locked panel, no upgrade CTA, no billing pane, no entitlement switch, no metering bar — EXCEPT the lock-affordance concept itself, i.e. the dashed lock-icon Personas note in the Plan editor captured verbatim above. The rebuild builds all of it NEW from this box; the oracle contributes only that one note's copy, placement, and lock-icon idea.
No functional build in the demo — the demo renders the locked affordances only.` },
                              { t: "INDEX — manifest + traceability (domain → capture box → oracle module → ui-* component → status)", done: true, d:
`PURPOSE — this INDEX is the manifest and traceability spine of the capture. For every app capability it records: (1) its CAPTURE BOX on this .io, (2) the ORACLE module it was captured from (archive/src/* plus project/*), (3) the CANONICAL UI components/tokens it assembles from (design-system/manifest.json), and (4) its STATUS. Read it to navigate the capture and to confirm coverage before any build phase begins. "audited" = checked module-by-module against the oracle on 2026-06-13 and its leaks filled this pass.

VERIFICATION LOOP RESULT (2026-07-02/03) — the capture ran a 3-round adversarial verify-fix loop against the oracle (90 agents; 225 findings raised, 126 high/medium). Round 1 caught structural misses (dead writes, fake wiring, missing anatomies); round 2 precision residue; round 3 a 26-finding tail whose fixes were applied with per-finding oracle evidence (file+line) after a usage-limit interruption. Clusters that passed a BLIND clean verify: engine-data (data.js catalogs/zones/formulas), users, cross-consistency. All other clusters: every confirmed finding repaired; a fourth blind pass has not been run — order one on demand before sealing if desired. Every UNFLAGGED-FAKE found (theme/timeZone dead writes · showAll dead state · toggleAssignment dead code · plan-level stakeholder wiring absent · community manager-gating unenforced · comma-commit promised but unimplemented · Store.reset() unwired · abstain vote unreachable · first-touch 0,0 write · missing updatedAt stamps) is now recorded in its box as an explicit DO-NOT-REPLICATE / MAKE-REAL rule — per the standing law: the ORIGINAL DESIGN IS ACCURATE, the plumbing often is not; the rebuild wires it for real.

ORIGINAL-DESIGN CENSUS RESULT (2026-07-03) — four sweeps over the ORIGINAL app completed and written into the boxes: COLORS — all 187 distinct literals reconciled (34 tokenized · 66 captured→token · 37 new needs-token · 1 user decision (#024AD8 vs terracotta accent) · 21 superseded with rationale · 28 dev-only) in the Color-census box, including the frozen accent-wash theming bug now collapsed to an accent-derived tint scale. STRUCTURE — a SKELETON TREE (nested region tree from the literal JSX, every className accounted or explicitly absorbed into a ui-* shadow DOM) now sits in every screen box: the build assembles against trees, never prose. UX — the handler census is complete per box (app shell 87 · community 67 · plan 56 · lists 48 · modal 43 · settings 43 · workspaces 29 · messaging 20 · scoring 19 · profiles/record/palette 52 · map 9 · workHQ 4 · users 50 — every binding accounted). CONNECTIVITY — 94 cross-record edges mapped in the Connectivity-census box: 67 real · 12 fragile (window-bridges → first-class routing) · 11 fake-or-dead (make-real list) · 4 one-way; plus a latent stale-mention render crash flagged do-not-replicate.

BLIND VERIFICATION PASS (2026-07-03 — the closer) — after all writing finished, NINE COLD AUDITORS with zero context (no knowledge of prior rounds or authorship) attacked the capture with one charge: prove it would fail a cold rebuild. RESULT: 56 findings — 2 high, 9 medium, ~45 low; ZERO losses of substance. Every formula, behavior, copy string, hex, enum, and dead-code claim checked came back oracle-true. The independent RECOUNT confirmed the census to the digit: colors 187/187 (own grep, set-diff clean both directions), connectivity 94 edges partitioned 67/12/11/4 with 8/8 spot-checks correct, handler counts 3/3 modules exact, skeleton className accounting set-identical. Both highs were multi-writer COHERENCE drift, not content loss (workHQ card-tone fabrication; the plan box rebuilding the score-readout another passage bans) — all 56 findings were then re-verified against the oracle and surgically repaired (none dropped), the do-not-replicate rulings winning every contradiction. Runtime smoke (headless Chromium): guide + preview + wireframes load with ZERO console errors; the Modern theme toggle flips ink to #36454F while zone tokens hold #74B556 untouched. The capture is now BLIND-VERIFIED end to end; remaining verification belongs to the build phases (rendering real screens against the skeleton trees) and the user's sealing pass on the .io.

TRACEABILITY (domain → box → oracle → ui-* → status):
• Component law / design system → Box 1 "Canonical UI is the ONLY kit" + "Design system" box → CLAUDE.md + design-system/ (tokens.css, manifest.json) → ALL ui-* → RULED 2026-06-13 (history preserved).
• Type & icon system → "Type & Icon system" box → design-system/tokens.css → ui-icon (Material Symbols) → ruled, re-confirm.
• Component sourcing → "Component sourcing — manifest is binding" box → design-system/manifest.json → all ui-* → ruled.
• Ecosystem / data model → "Ecosystem" box → data.js + store.js → — → captured.
• Relationship engine (axes, 14 zones, GRID, statusFor, weightedCoord, bounds) → "Relationship engine" box → data.js → --ui-sys-zone-* (ui-stakeholder-map) → captured.
• Scoring matrix → "Scoring & weighting" box → scoring.jsx + data.js → ui-data-table-style matrix, ui-text-field + ui-icon-button steppers, ui-slider, ui-chip → audited.
• Scoring cadence / reminders → "Scoring cadence" box → app.jsx + settings.jsx (fiscal) → ui-* → captured.
• Map → "Map" box → map.jsx + tweaks-panel.jsx → ui-stakeholder-map (sanctioned inline SVG) → audited.
• Lists table → "Lists table" box → sheet.jsx → ui-stakeholder-table / ui-data-table → audited.
• Create/edit stakeholder modal → "Create / edit stakeholder modal" box → sheet-modals.jsx → ui-dialog (+ ui-text-field/ui-select/ui-switch/ui-chip-set) → NEW, audited.
• Stakeholder profile (read-only) → "Stakeholder profile (read-only modal)" box → profiles.jsx → ui-dialog (+ ui-list/ui-chip) → NEW.
• Notes modal → folded into the stakeholder-modal box → sheet.jsx + sheet-modals.jsx → ui-dialog → audited.
• Plan algorithm models + factors → "Plan algorithm — catalog" + "Plan algorithm — FACTOR KEY" boxes → data.js (authoritative doc set) → — → sealed.
• Relationship recommendation → "Relationship recommendation alignment" box → plan.jsx (sepScore/sepFactorSignal, bands 67/40) → — → audited (oracle math added).
• Plan page → "Plan page" box → plan.jsx → ui-data-table + ui-select + ui-chip → audited (incl. goalNotes oracle bug = do-not-replicate).
• Plan landing / worked example → "Plan page" + "Stakeholder Plan worked-example" boxes → plan.jsx + the engagement doc → ui-* landing → sealed/audited.
• Community → "Community" box → community.jsx + community-modal.jsx → ui-dialog + ui-data-table + ui-chip → audited (FX/multi-currency = forward-design vs USD-only oracle).
• Workspaces / Setup → "Workspaces" box → setup.jsx → ui-* + SegmentBadge/GeographyChip (tokens) → audited (+ scope/scopeState fields).
• App shell & routing → "App shell & routing" box → app.jsx → ui-app-shell/ui-app-bar/ui-sidebar/ui-tabs/ui-dialog → NEW, audited (incl. demo auto-manager TRAP, removeUser cascade).
• workHQ → "workHQ (IntelPanel)" box → intel.jsx → ui-* band above ui-stakeholder-table → NEW, captured as-is.
• Settings → "Settings" box → settings.jsx → ui-* (BeakerColorField, QuartersPreview, SiteSettings) → audited (9 oracle panes; Integrations = forward-design 10th).
• Users & People → "Users & People" box → users.jsx → ui-* + Avatar/ManagerStar (tokens) → audited.
• User profile page → "User profile page (record.user)" box → profile-page.jsx → ui-tabs + ui-data-table → NEW.
• Command palette (⌘K) → "Command palette (⌘K)" box → palette.jsx → ui-dialog + ui-autocomplete + ui-chip → NEW.
• Messaging → "Messaging" box → messaging.jsx → ui-list + ui-text-field + ui-chip (mentions) + ui-dialog → audited (token grammar {{type:id|label}}, codes stk/wsp/pln/cmy).
• Help → "Help" box → help.jsx → ui-* page (no right rail) + ui-chip zone swatches + tokened SVG grid → audited (verbatim copy + 5th section).
• Record scaffold + landings → "Record scaffold, landing pages & page shells" box → record.jsx + landing.jsx → ui-app-shell/ui-sidebar/ui-inspector + ui-data-table → audited (MetaField vocab, LandingView shell).
• Shared UI primitives → "Shared UI primitives" box → components.jsx + users.jsx → ui-icon + ui-avatar (BUILT — registered in manifest.json v0.2.0) + GAPS still to add (avatar-stack, owner-picker, badge/count) → NEW.
• Catalogs + location data + helpers → "Catalogs" box → data.js → — → audited (US/MX/CA lists, STATE_ABBR, siteLabel/resolveCountries, ORG_GOALS, TITLES).
• Demo seed dataset → "Demo seed dataset" box → data.js → — → SHAPE + canonical sample (sh-01/06/12 trails verbatim); fixtures regenerated at rebuild.
• Persistence & realtime → "Persistence & realtime" box → store.js → — → audited (Store API, keys hp_map_col_order_v3 / hp_map_user — project/db.js's "v2" is a stale prose comment, the code in sheet.jsx reads+writes v3 — appConfig defaults, the two backend traps).
• Enterprise state model + architecture → those two boxes → project/* (HANDOFF, VERIFICATION, ENTERPRISE_ARCHITECTURE) → — → forward-design.
• Database schema (Supabase) → "Database schema" box → project/db.js → — → captured (column divergences flagged in Persistence).
• Demo features / Paid add-ons / Whiteboard → those three boxes → client + forward-design → ui-* (built later) → forward-design (await ui-* retarget at seal).

COVERAGE GATES (must pass before the build phases start):
1) Every capture box read against its oracle and declared lossless (audit done 2026-06-13; ~168 leaks + 7 missing surfaces filled this pass).
2) GAP components registered in design-system/manifest.json BEFORE they are used. BUILT + REGISTERED as of 2026-07-03 (all in the preview gallery, smoke-tested): ui-avatar · ui-card (outlined/filled/elevated, interactive, media/actions slots — hosts the locked add-on panel) · ui-textarea (multiline, maxlength live counters, auto-grow) · ui-text-field variant=plain (label-less inline field) · ui-badge (count/dot, anchored or inline, --ui-sys-badge-* token family) · ui-owner-picker (avatar stack + typeahead add + arm-to-remove; readonly mode = the OwnersDisplay behavior, so no separate avatar-stack component is needed) · ui-coachmark (anchored onboarding spotlight with scrim cutout). STILL TO ADD at their build phase, with the demanding box in parentheses: dashed note/callout, the add-on lock note (Paid add-ons box — or compose from ui-card outlined + a dashed-border token decision) · drag-reorder grip (Component-sourcing box) · ui-swatch-card (Settings/Theme box) · command-palette composition = ui-dialog + ui-autocomplete (Command-palette box; assembly, not a new component) · Whiteboard canvas (awaits the design ruling).
3) Every design-value hex flagged across the boxes (priority/status/segment/geography/plan pills, theme swatches, map density/halo/trail, avatar ink, manager amber) migrated to --ui-sys-* tokens — no literal hex in app code.
4) The over-claims marked "forward-design vs oracle" (Settings Integrations pane; Setup sort control; invite-code client regenerate; Community FX/multi-currency) consciously kept or dropped, not mistaken for captured behavior.
5) The recorded ORACLE BUGS deliberately NOT replicated: goalNotes set() called with two args (never persists); demo auto-promote-to-manager (3 sites); the stale hp_map_col_order_v2 prose comment in project/db.js (the live code — archive/src/sheet.jsx read AND write — plus APP_SPEC.md use hp_map_col_order_v3; v3 is the captured truth, ship exactly one key).

OUTSTANDING (after this pass): forward-design boxes (Whiteboard, Enterprise ×2, Demo features, Paid add-ons, Database schema) get their UI build-maps retargeted to ui-* as they are sealed; the longform book docs/STAKEHOLDR_BOOK.md Parts III–IX remain to be written as the prose mirror.` },
            { t: "Command palette (⌘K) — global search across 5 entity types", done: true, d:
`CommandPalette (archive/src/palette.jsx) is the universal Cmd/Ctrl-K command palette: a thin centered search bar over a blurred backdrop, with grouped autocomplete across five entity types. Arrow keys move the active row, Enter goes, click goes. It is GLOBAL and independent of the per-page inline search bars (those keep working on their own).

PROPS: open (bool), onClose, stakeholders, plans, community, workspaces, users, onGo. onGo(type, id) is the single navigation callback — type is one of "stakeholder" / "plan" / "community" / "workspace" / "user".

LOCAL STATE: q (query string, init ""); active (index of highlighted result, init 0); inputRef.

OPEN/CLOSE BEHAVIOR:
- Trigger is Cmd-K on mac, Ctrl-K elsewhere (the open prop is toggled by the app-level key handler).
- On open transition (effect on [open]): if open, reset q="" and active=0, then after a 20ms setTimeout focus inputRef (autofocus the input shortly after mount so it catches once rendered).
- If open is false, render null.
- Click on the backdrop (cmdk-backdrop) calls onClose; clicks inside the cmdk box stopPropagation so they do NOT close. Escape key calls onClose.

SEARCH MATCHING: ql = q.trim().toLowerCase(). Helper match(s) = ql is non-empty AND (s||"").toLowerCase().includes(ql) — a falsy/empty query matches nothing. Build results array (only when ql is truthy), grouped by type label:
- Stakeholders: for each s, n = displayName(s)||s.name; resolve its site = (s.site && STAKEHOLDER_DATA.SITES) ? (SITES.find(x=>x.id===s.site)||{}) : {}; siteStr = site.id ? STAKEHOLDER_DATA.siteLabel(site) : "". HIT if match(n) OR match(s.org) OR match(s.type) OR match(s.state) OR match(siteStr) OR match(site.country) OR (s.tags||[]).some(match) OR (s.issues||[]).some(match). On hit push { type:"Stakeholder", id:s.id, label:n, sub:s.org, go:()=>onGo("stakeholder", s.id) }. (Stakeholders are the richest match surface: name, org, type, state, site label, site country, every tag, every issue.)
- Plans: HIT if match(p.title). Push { type:"Plan", id:p.id, label:p.title, sub:(workspaces.find(w=>w.id===p.workspaceId)||{}).name, go:()=>onGo("plan", p.id) }. Sub = the plan's workspace name.
- Community: HIT if match(c.name) OR match(c.recipient). Push { type:"Community", id:c.id, label:c.name, sub:c.kind, go:()=>onGo("community", c.id) }. Sub = c.kind.
- Workspaces: HIT if match(w.name). Push { type:"Workspace", id:w.id, label:w.name, sub:w.businessUnit, go:()=>onGo("workspace", w.id) }. Sub = w.businessUnit.
- People: users.filter(u => u.role !== "system") — the system user is EXCLUDED. HIT if match(u.name) OR match(u.title). Push { type:"Person", id:u.id, label:u.name, sub:u.title, go:()=>onGo("user", u.id) }. Sub = u.title.

CAP: capped = results.slice(0, 24) — at most 24 rows shown (across all groups combined, in the iteration order above: stakeholders, plans, community, workspaces, people).

GO: go(i) = let r = capped[i]; if r exists, call r.go() THEN onClose(). Navigation closes the palette.

KEYBOARD (onKey on the input):
- ArrowDown: preventDefault, active = Math.min(active+1, capped.length-1) (clamped to last).
- ArrowUp: preventDefault, active = Math.max(active-1, 0) (clamped to first).
- Enter: preventDefault, go(active).
- Escape: onClose().

STRUCTURE / RENDER:
- Outer div class "cmdk-backdrop" (the blurred veil) with onClick=onClose.
- Inner div class "cmdk" (the centered thin bar) with onClick stopPropagation.
- Input row (class cmdk-input): Icon name "search" class "ico"; the input (ref=inputRef, value=q, onChange sets q AND resets active to 0, onKeyDown=onKey, placeholder "Search names, orgs, tags, issues, sites, states…"); then a button class "cmdk-go" labeled "Enter" that calls go(active) and is DISABLED when capped.length is 0.
- Results (only when ql is truthy), class "cmdk-results":
  - If capped.length === 0: a div class "cmdk-empty muted" reading "No matches."
  - Else map capped to buttons (key = r.type + r.id), class "cmdk-row" (+ " active" when i === active). onMouseEnter sets active=i (hover updates the highlight); onClick calls go(i). Row contents: span.cmdk-type = r.type (the small type chip e.g. Stakeholder/Plan/...); span.cmdk-label = r.label; and if r.sub, span.cmdk-sub.muted = r.sub.
  - When ql is empty (no query yet) the results block is not rendered at all — empty query shows nothing.

REBUILD BUILD-MAP (Canonical UI ruling — never md-*/shadcn): compose from existing components. The backdrop + centered bar = a ui-dialog variant (scrim with backdrop-blur; click-scrim and Escape close; autofocus the field on open). The search field + live grouped results list = ui-autocomplete (input with leading ui-icon "search", a capped result list, keyboard-navigable active row with clamped Arrow keys, Enter to commit, mouse-enter to set active). Each result row's type tag = ui-chip (small, the entity type), with a label and a muted ui-* secondary sub line. The trailing "Enter" affordance = a ui-button (disabled when no results). All icons via ui-icon ligatures (search). No raw div/span UI primitives, no ad-hoc styling — backdrop blur, sizing, and the active-row highlight all live in --ui-sys-* tokens.

SKELETON TREE (literal region tree extracted from the archive/src/palette.jsx JSX — the build assembles against THIS tree, never prose. One node per line, nested in source order. Each node: what it is → what it contains → Canonical UI mapping. Bracketed [conditions] gate a node. The whole surface renders null when open is false.)

SURFACE — THE PALETTE OVERLAY:
div.cmdk-backdrop [onClick=onClose] — the full-screen blurred veil; the ONLY top-level node → ui-dialog variant scrim (backdrop-blur token)
  div.cmdk [onClick stopPropagation] — the centered thin bar/card; clicks inside never close → ui-dialog surface hosting the ui-autocomplete
    div.cmdk-input — the input row (layout row — token-only container)
      Icon "search" class ico → leading ui-icon
      input [ref=inputRef; value=q; onChange; onKeyDown=onKey; placeholder "Search names, orgs, tags, issues, sites, states…"] → ui-autocomplete input / ui-text-field
      button.cmdk-go "Enter" [disabled when capped.length===0; onClick → go(active)] → ui-button (trailing commit affordance)
    [ql truthy] div.cmdk-results — the results list; NOT rendered at all on an empty query → autocomplete menu / ui-list
      [capped empty] div.cmdk-empty.muted "No matches." → empty state text
      [else] button.cmdk-row[.active when i===active] ×capped (≤24) [key r.type+r.id; onMouseEnter; onClick] → ui-list interactive row (active-row highlight via token)
        span.cmdk-type — r.type ("Stakeholder"/"Plan"/"Community"/"Workspace"/"Person") → ui-chip small (entity-type tag)
        span.cmdk-label — r.label → primary row text
        [r.sub] span.cmdk-sub.muted — r.sub → secondary muted text

CLASSNAME ACCOUNTING: every className region in palette.jsx appears above — cmdk-backdrop, cmdk, cmdk-input, ico, cmdk-go, cmdk-results, cmdk-empty, muted, cmdk-row (active), cmdk-type, cmdk-label, cmdk-sub. None silently dropped. The tree confirms the box body — no corrections needed.

UX HANDLER CENSUS (archive/src/palette.jsx — every event handler in the module, enumerated with exact behavior):
1. Backdrop (cmdk-backdrop) onClick → onClose.
2. Inner box (cmdk) onClick → e.stopPropagation() (clicks inside never bubble to the backdrop, so they never close).
3. Input onChange → setQ(e.target.value) AND setActive(0) (every keystroke resets the highlight to the first row).
4. Input onKeyDown → onKey: ArrowDown = preventDefault + clamp active up to capped.length−1; ArrowUp = preventDefault + clamp active down to 0; Enter = preventDefault + go(active); Escape = onClose(). (Escape is handled on the focused input — which is always focused after the 20ms open-focus effect.)
5. "Enter" button (cmdk-go) onClick → go(active); disabled when capped.length === 0.
6. Result row (cmdk-row) onMouseEnter → setActive(i) (hover moves the highlight).
7. Result row (cmdk-row) onClick → go(i).
Plus the per-result go closures (r.go = () => onGo(type, id), built during matching, invoked by go(i) which then calls onClose()) and the [open] effect (reset q/active + 20ms focus — state sync, not an event handler; captured under OPEN/CLOSE BEHAVIOR). 7 handlers (7 DOM handler sites), all accounted — every one is already described in the body above; no missing interactions found.` },
    ]
  },
  {
    id: "p1", icon: "inventory", label: "Archive the old .io",
    blurb: "Bundle every legacy page/feature module into a parked folder excluded from the build, so nothing can interact with what we build on main. Nothing is deleted — it's parked for reference. CONFIRM before moving.",
    items: [
      { t: "Confirm the foundation (Phase 0) is complete with the user" },
      { t: "Move legacy page/feature modules into a parked /archive folder excluded from the Vite build" },
      { t: "Old modules parked in archive/src/ + project/ (the research oracle, out of the build graph); src/ keeps only main.jsx + guide.jsx; all docs kept" },
      { t: "App entry renders only the guide → the .io is this guide on a clean slate" },
      { t: "Verify archived code is out of the build graph and the guide still renders; commit" },
    ]
  },
  {
    id: "p2", icon: "foundation", label: "2 · Foundation & theme (Canonical UI)",
    blurb: "Stand up the token-driven Canonical UI theme everything renders through. Design is a layer, not baked in.",
    items: [
      { t: "Adopt design-system/tokens.css at the app :root (--ui-ref-* + --ui-sys-*) so the Design page can re-skin live" },
      { t: "Start-state defaults (already encoded in tokens.css); no Claude-specific styling yet" },
      { t: "App shell scaffold composed from ui-app-shell + ui-app-bar + ui-sidebar + ui-status-bar" },
      { t: "Verify: renders, no console errors, design-system-only (zero MUI/Tailwind/hand CSS)" },
    ]
  },
  {
    id: "p4", icon: "dashboard", label: "App shell",
    blurb: "The frame every page lives in — Canonical UI components only (ui-app-shell/ui-app-bar/ui-sidebar/ui-inspector/ui-status-bar). Built before the Design page, because you can't re-skin a shell that doesn't exist yet.",
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
      { t: "Design controls (Canonical UI) for color tokens, type roles, density, radius, surfaces — incl. the two open token decisions (accent hue; shadows vs flat)" },
      { t: "Writes tokens to :root CSS variables (live re-theme, no reload)" },
      { t: "Each control carries subtext describing the Claude-ward target" },
      { t: "Persists to appConfig; defaults remain the tokens.css start-state" },
    ]
  },
  {
    id: "p5", icon: "table_view", label: "5 · Pages (in order)",
    blurb: "Rebuild each page from the Canonical UI (ui-*) components, strictly to its sealed capture box. Confirm each before the next.",
    items: [
      { t: "Lists / workspace table (every column + edit mode per TABLE_COLUMNS)" },
      { t: "Scoring (grid: stakeholders × team; edit only your column; weights)" },
      { t: "Map (zones, dots, READ-ONLY positions, history) per the sealed Map capture box — drag-to-rescore is removed" },
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
      { t: "RecordShell on the design system (sub-page nav · content · metadata · footer; read↔edit parity)" },
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
