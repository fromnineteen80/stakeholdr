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
      { t: "Canonical UI (design-system/) is the ONLY component kit — the law for every element [RULED 2026-06-13; re-confirm]", d:
`RULING (2026-06-13; supersedes the earlier "Material Web only" law — awaiting your re-confirmation on the .io): every UI element in the rebuilt app is a component from this repo's own CANONICAL UI design system (design-system/ — un-branded, token-driven web components, <ui-*> tags), or a composition of them. Never a hand-rolled element, NEVER MUI, never Tailwind utilities, never any third-party UI kit.

WHY CANONICAL UI WON (the 360 ruling — three directions coexisted in the repo):
(1) Material Web (@material/web), the original law, is in MAINTENANCE MODE and ships no data grid, no date/time picker, no nav rail/drawer, no app bar, no tooltip, no snackbar, no autocomplete; the only official fill was adopting Angular + Angular Material — an entire framework pivot, two theming systems, just for the holes.
(2) shadcn/ui + Tailwind was attempted (docs/design) and drifted into patchwork — utility classes are a thousand styling surfaces, the opposite of one token layer; nothing canonical for a build session to obey.
(3) CANONICAL UI was built (PRs #1–#6) precisely to fix both: REAL custom elements (shadow DOM, real states + a11y); ONE styling surface (the --ui-sys-* token layer); and a BINDING machine-readable manifest so an AI build session ASSEMBLES instead of inventing. It is MD3 in philosophy — the same component vocabulary at full parity — with the holes filled natively and zero framework tax: plain web components hosted by the existing React 18 + Vite app, deployed to GitHub Pages.

THE KIT (verbatim): components live in design-system/components/*.js; the registry is design-system/manifest.json (THE CONTRACT — every component, its tag, props, states, and the exact tokens it consumes); the token source is design-system/tokens.css (Tier 1 --ui-ref-* raw values + Tier 2 --ui-sys-* semantic roles; components read ONLY --ui-sys-*). 35 components, all status:built —
• NATIVE (MD3 parity): ui-icon · ui-button (filled/tonal/outlined/text) · ui-icon-button (standard/filled/tonal/outlined; selected toggle) · ui-fab (small/medium/large; primary/surface; extended label) · ui-text-field · ui-checkbox (tri-state) · ui-radio · ui-switch · ui-slider · ui-select + ui-option · ui-menu + ui-menu-item · ui-chip (assist/filter/input/suggestion) + ui-chip-set · ui-list + ui-list-item · ui-tabs + ui-tab · ui-divider · ui-dialog · ui-tooltip · ui-snackbar · ui-linear-progress / ui-circular-progress.
• GAP-FILL (what MD3's web kit never shipped): ui-autocomplete · ui-data-table (sticky header, sortable, selection, density) · ui-chart (bar/line/area inline SVG) · ui-app-bar · ui-nav-rail · ui-nav-drawer · ui-sheet (mobile bottom sheet) · ui-bottom-bar · ui-date-picker.
• SCAFFOLD: ui-app-shell (CSS-grid host; header/nav/main/aside/footer slots; empty tracks auto-collapse) · ui-sidebar + ui-sidebar-item (248↔64px collapse, icon-only tooltips, active pill, aria-current) · ui-inspector (right detail rail ~320px, open/closed) · ui-status-bar (footer).
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
      { t: "Type & Icon system — Inter (body/UI) + Newsreader (titles) + Material Symbols icons [AMENDED to design-system tokens; re-confirm]", d:
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
      { t: "Component sourcing — the design-system manifest is BINDING (native · gap-fill · scaffold · domain) [RULED 2026-06-13; re-confirm]", d:
`THE STACK (RULED 2026-06-13; supersedes the "Material Web + Angular Material" plan — Angular is OFF the table): the rebuilt app stays REACT 18 + VITE and hosts the Canonical UI web components (design-system/components/*.js, <ui-*> custom elements; framework-agnostic — props are attributes/JS properties, events are standard DOM events bound via refs). ONE kit covers everything: MD3-parity natives, the gap-fills MD3's web kit never shipped, the app scaffold, and the two Stakeholdr domain components. One token source (design-system/tokens.css) themes all of it. (This build-guide .io itself is a temporary React + Material Web scratch surface — it is NOT the app and is rebuilt/retired later.)

THE THREE LAWS (from design-system/README + manifest.json, verbatim in spirit):
1. REAL COMPONENTS — genuine custom elements (shadow DOM, real states + a11y). Screens are ASSEMBLED from them; a component is never reimplemented in markup/CSS.
2. ONE STYLING SURFACE — the --ui-sys-* token layer is the only legal place a visual decision lives. No component stylesheet overrides, no utility classes, no inline color/size.
3. THE MANIFEST IS BINDING — design-system/manifest.json is the machine-readable contract (every component, tag, props, states, consumed tokens). A build session reads the manifest and assembles real elements; there is no room to invent.

SOURCING RULE (state it in every build map):
• Manifest component EXISTS → use it. NATIVE: ui-button/ui-icon-button/ui-fab · ui-text-field · ui-checkbox/ui-radio/ui-switch/ui-slider · ui-select+ui-option · ui-menu+ui-menu-item · ui-chip(+set) · ui-list(+item) · ui-tabs(+tab) · ui-divider · ui-dialog · ui-tooltip · ui-snackbar · ui-linear/circular-progress · ui-icon. GAP-FILL: ui-autocomplete · ui-data-table · ui-chart · ui-app-bar · ui-nav-rail · ui-nav-drawer · ui-sheet · ui-bottom-bar · ui-date-picker. SCAFFOLD: ui-app-shell · ui-sidebar(+item) · ui-inspector · ui-status-bar. DOMAIN: ui-stakeholder-table · ui-stakeholder-map.
• Component MISSING (or a token can't express a look) → that is a GAP: build it INTO design-system/ to the ui-button quality bar, register it in manifest.json, THEN use it. (Known upcoming candidates from the capture: avatar/avatar-stack, badge/count-indicator, drag-reorder grip, command-palette composition = ui-dialog + ui-autocomplete.)
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
            { t: "Scoring & weighting — the team matrix, edit-only-your-column, weighted position", d:
`WHAT IT IS — the Scoring page is a MATRIX where the team collectively rates each stakeholder, and those ratings blend into the single position that drives the Map, the Lists table, and every profile. Rows = stakeholders. Columns = team members, followed by two computed columns: "Weighted (x, y)" and "Relationship".

DATA MODEL — the team and the scores are GLOBAL, NOT per-workspace. There is ONE team (the "team" table) and ONE score-set per stakeholder (scores[stakeholderId][teamMemberId]) shared across the entire app. The ONLY thing the active workspace changes is WHICH STAKEHOLDERS (rows) appear: on a workspace the rows are filtered to stakeholders whose stakeholderWorkspaces join includes that workspace; on Master the rows would be the full union (but Scoring is disabled on Master — see Scoping). The columns (team members) and each cell's stored score are the SAME no matter which workspace you view from. A stakeholder in three workspaces has one shared position, scored once by the one team.

THE CELL — each cell is one teammate's rating of one stakeholder: a pair (x, y), each an INTEGER from -10 to 10. x = alignment/support (negative = opposed, positive = supportive); y = influence/importance (negative = low, positive = high). These are the two axes the Relationship engine reads.

EDIT-ONLY-YOUR-COLUMN — a teammate may edit ONLY their own column (the column whose teammate is the logged-in user, matched m.userId === currentUser.id). Every other column is READ-ONLY. This is deliberate: a position is a blend of independent judgments, so you never overwrite a colleague's read on a stakeholder. Your column is visually distinguished as "mine" (the my-col class on header and cells).
• Your editable cell (xy-input layout): two numeric inputs labelled x and y — ui-text-field type="number" (min -10 / max 10 / step 1), each wrapped with a +/- stepper pair of ui-icon-button (chevronUp = increase, chevron = decrease) that increment/decrement by 1 and CLAMP to [-10,10]. The steppers carry tabIndex -1 (skipped in tab order). Each labelled with a leading "x"/"y" lbl span. Clamp rule (the clamp helper): a non-numeric entry becomes 0; anything out of range snaps to the nearest bound (Math.max(min, Math.min(max, n))).
• A read-only (teammate) cell (scoring-cell-ro / xy-readonly layout): shows their x and y as two static labelled pairs — "x {sc.x}" and "y {sc.y}" (each a xy-readonly-pair: a xy-readonly-k key "x"/"y" + a xy-readonly-v value). The whole cell carries a tooltip title "{teammate name}'s score" (falls back to "Teammate" if the user is missing).
• UNSCORED ≠ (0,0): a cell a teammate has never scored renders EMPTY (an em-dash "—" placeholder), NOT a fake 0/0, and is EXCLUDED from the weighted average. A real 0,0 is stored only when that teammate deliberately enters it. (Correction from the old build, which defaulted unscored cells to { x: 0, y: 0 } and made "no opinion" indistinguishable from "dead-centre".)

SCORE RECORD (persisted shape) — scores[stakeholderId][teamMemberId] = { x, y, createdAt, updatedAt }. createdAt is stamped on the FIRST score for that cell; updatedAt is restamped on EVERY change. Stored in the synced "scores" table. Removing a teammate deletes that teammate's entry from every stakeholder's row (their column of scores is purged).

THE TEAM BAR (top of page, team-bar) — one Card (team-card) per teammate, in this order: (1) the logged-in user first, (2) then workspace owners in their listed order (by workspaceOwners index), (3) then everyone else in original order. Each card shows: Avatar (size 22) + name + title; a WEIGHT control; a derived "% of team" readout.
• WEIGHT — ui-slider, min 0.0, max 2.0, step 0.1, baseline 1.0 (a tick mark centered at 1.0; the fill spans between the 1.0 baseline position and the current value, so the bar grows left of baseline below 1.0 and right of baseline above 1.0). Value displayed in the card header row as "{weight.toFixed(1)}×" (uppercase "WEIGHT" label on the left, value on the right). Beneath the slider sits a three-segment end/baseline label row: left "0.0", center "1.0 baseline", right "2.0" (small ~9.5px muted figures). Weight 0.0 is a DELIBERATE, legal choice: it keeps the teammate on the workspace but takes their scores OUT of the blend (a "don't weight this person right now" without removing them). Removing a teammate is a separate action (see below).
• % OF TEAM — that teammate's weight / sum of all weights, shown as an integer percentage in a tinted readout pill beneath the slider labels: "{pct}% of team". EXACT FORMULA: pct = totalW > 0 ? Math.round((weight / totalW) * 100) : 0 — integer rounded; renders "0% of team" when the total team weight is 0. Recomputes live as any weight changes. TRI-COLOR TINT on the readout background, keyed off this teammate's weight: weight === 1 → neutral grey rgba(0,0,0,.04); weight > 1 → green rgba(62,122,46,.1); weight < 1 → amber rgba(176,126,31,.1) (radius 4, ~10.5px ink-3 text, centered). FLAG: these three literal tints should become --ui-sys-* tokens (e.g. --ui-sys-weight-baseline / --ui-sys-weight-over / --ui-sys-weight-under) rather than inline rgba.
• REMOVE (×) — ui-icon-button with the close icon (top-right of the card header). PERMISSIONS: a MANAGER may remove ANY teammate; a teammate may remove THEMSELVES (leave the workspace). A plain member cannot remove other members. The control is shown only when the current user is a manager or it is their own card.
• SOLE-MEMBER LEAVE — if the only remaining teammate tries to remove themselves (orderedTeam.length === 1), the action is intercepted: instead of removing, it opens the last-teammate / closure dialog (see below). No path silently leaves a workspace teamless.

ADD A TEAMMATE — a ui-dialog containing a searchable picker (UserAutocomplete: a ui-autocomplete typeahead filtering users by name or title — placeholder "Type a name or title…", clearable, autoFocus) listing users NOT already on the team and excluding the system bot (role !== "system"); a chosen user is added at weight 1.0 (baseline) — helper text "They'll be added with weight 1.0 (baseline). Adjust afterwards." Confirm button "Add to team" (disabled until a user is picked); "Cancel" dismisses. Opened by the window event "open-add-teammate", and also reachable from the context-aware create (+) when the active page is Scoring (addNonceFor === "scoring" opens the new-stakeholder modal).

LAST-TEAMMATE / WORKSPACE-CLOSURE — a workspace cannot have zero teammates. Removing the final teammate (or the sole teammate leaving) routes through a dedicated dialog (width 460): heading "Last teammate on this workspace", body "A workspace cannot have zero teammates. Hand off to a replacement, or delete the workspace entirely." It offers HAND OFF to a replacement — a designed select of eligible users (replacementChoices = non-system users not already on the team), each option shown as "{name} · {title}". Two foot actions: a destructive "Delete workspace" (ui-button danger/error tokens, calls onDeleteWorkspace) on the left; "Hand off & remove" (ui-button primary, disabled until a replacement is chosen) on the right, which adds the replacement then removes the last member.

THE MATH — weightedCoord(stakeholderId, scores, team): for each teammate who HAS scored this stakeholder and whose weight > 0, accumulate sx += x*weight, sy += y*weight, totalW += weight; result = { x: sx/totalW, y: sy/totalW }. Two independent reasons a teammate drops out of the blend for a given stakeholder: (a) they have NOT scored that stakeholder (no record) — always excluded, regardless of weight; (b) their weight is 0.0 (weight <= 0 is skipped) — a deliberate exclusion that still leaves them on the team. If the surviving total weight is 0 (nobody scored, or everyone who scored is at weight 0), the position is { x: 0, y: 0 }. The "Weighted (x, y)" column (computed class) renders each axis to ONE decimal (toFixed(1)), each colored positive/negative (x >= 0 → var(--pos), else var(--neg); same for y), separated by a comma. "Relationship" runs statusFor(x,y) and shows the resulting zone as a StatusPill (rebuilt as a ui-chip, colored by the zone's color/text from STATUSES).

COMPUTED-COLUMN HEADERS & RELATIONSHIP CELL STYLING — the two computed column headers ("Weighted (x, y)" and "Relationship") share a GOLD GRADIENT background: linear-gradient(180deg, #F1E7CD, #E8DCB7). The "Weighted (x, y)" header additionally carries a "derived" SUB-LABEL beneath the title (block, normal weight, no transform/letter-spacing, ~10.5px ink-mute, ~2px top margin). The Relationship cell BODY background (the StatusPill's td) is #FBF6E6 with padding "0 12px". FLAG: the gradient stops (#F1E7CD, #E8DCB7) and the relationship cell fill (#FBF6E6) should become --ui-sys-* tokens (a "computed/derived column" surface family). The sticky-left "Stakeholder" header has background var(--bg-2) and position: sticky, left 0, z-index 5.

STAKEHOLDER NAME CELL (sh-cell, sh-cell-link) — three stacked lines: (1) sh-cell-name = displayName(s) || s.org; (2) sh-cell-org = s.org (rendered only if present); (3) sh-cell-meta = s.type (a type meta line). The whole cell is clickable (cursor link), title "Open stakeholder", and on click dispatches the window CustomEvent "open-stakeholder-profile" with detail = s.id (opens that stakeholder's profile).

SCOPING — Scoring is a PER-WORKSPACE collaboration act and is DISABLED on Master: if the active workspace is Master, the Scoring nav item is hidden, and navigating to Scoring on Master redirects to the Map. (Master is the read-only org-wide union; you score within a workspace, not across the whole org.)

CANONICAL-UI BUILD MAP (Canonical UI design system — ui-* web components; the matrix is a tokened ui-data-table-style composition since the layout is a custom sticky/scroll grid, NOT a third-party grid) — matrix: a semantic table / CSS-grid structure styled only with --ui-sys-* surface/outline tokens (sticky-left "Stakeholder" column via position:sticky, the rest horizontally scrollable). Each editable x/y cell: two small ui-text-field type="number" (min -10 / max 10 / step 1), each paired with two ui-icon-button steppers (chevronUp / chevron, ±1 clamped); read-only teammate cells: tokened static text in the xy-readonly two-pair layout with a ui-tooltip "{name}'s score". Weight: ui-slider (0.0–2.0 step 0.1, tick at 1.0) with the "0.0 / 1.0 baseline / 2.0" label row beneath. % of team: a tinted readout (ui-chip or tokened surface) with the tri-color weight tint. Teammate card: a tokened surface-container card holding the avatar (image or initials), name/title text, the ui-slider, and the remove ui-icon-button. Add-teammate: ui-dialog + ui-autocomplete typeahead. Last-teammate / closure: the ui-dialog with the hand-off select and the destructive ui-button (error tokens). Relationship cell: ui-chip (zone-tokened) on the #FBF6E6 (→ token) cell surface. Stakeholder name cell: a tokened clickable opening that stakeholder's profile via the open-stakeholder-profile event.` },
      { t: "Scoring cadence & re-score reminders — fiscal quarters, unscored detection, the Reminders bot", done: true, d:
`WHY THIS EXISTS — the stakeholder pool can be enormous (potentially hundreds of thousands). A workspace deliberately FOCUSES the team on the limited set of stakeholders with enough influence to impact the brand, operations, or goals at hand. Re-scoring on a fixed cadence keeps each focused set's positions current without asking anyone to score the whole universe.

WHO SCORES, WHERE — scoring happens INSIDE a workspace (never on Master). A workspace's team scores only that workspace's visible stakeholders; the resulting position is written to the stakeholder GLOBALLY (one score-set per stakeholder) and then travels with that stakeholder everywhere — other workspaces, plans, community engagements, any modal about them, and the full stakeholder page. (See the Scoring box for the data model.)

FISCAL CALENDAR (set in Settings; full Settings capture comes with that page) — appConfig.fiscalStartMonth (1-12, default 11 = November) + appConfig.fiscalStartDay (default 1). Quarters are computed as FOUR EQUAL THREE-MONTH SPANS from that anchor: quarter i (0..3) starts at anchor + i*3 months on the same day-of-month (clamped), and ends the day BEFORE the next quarter's start. Labels are Q1..Q4, combined with the fiscal year for snapshot tags like "FY26 Q1"; Settings shows a live preview of the four ranges (e.g. "Nov 1 -> Jan 31"). Only managers can change the fiscal anchor.

UNSCORED DETECTION (live, client-side now) — isUnscoredBy(stakeholderId, teamMemberId) is true when there is NO score record from that team-member id for that stakeholder (a deliberate 0,0 counts as scored; a never-touched cell does not — consistent with "unscored != (0,0)"). unscoredCount = how many stakeholders the CURRENT user (via their matching team member) has not yet scored. This drives: (a) a count-alert Badge on the Scoring nav item; (b) the Reminders conversation subtitle "{n} stakeholder(s) need scoring" or "All caught up"; (c) the inbox unread count.

THE REMINDERS BOT — a system user u-system named "Reminders" (role "system"; never appears in pickers or online/presence lists), owning a system conversation that includes every non-system user. Trigger captured so far: when a new stakeholder is added, a system message posts with kind "scoring-needed": "New stakeholder added: {name} ({type}). Please score them on the Scoring tab."

QUARTERLY RE-SCORE CYCLE — at each quarter close (per the fiscal anchor above), the cycle is: (1) snapshot each stakeholder's current weighted position into stakeholder.history as { quarter: "FY## Q#", x, y, recordedAt: ISO-date } — these snapshots are exactly what the Map's history trail draws; (2) notify the relevant workspace's team members (via the Reminders bot) to re-score that workspace's stakeholders for the new quarter. LIVE vs DEFERRED, stated honestly: the unscored detection, the Reminders bot, the new-stakeholder prompt, and the fiscal-quarter math all exist/are configurable now; the AUTOMATED quarter-rollover that performs the snapshot + bulk re-score prompt is the fiscal-rollover job captured with the backend — but it is driven entirely by the Settings fiscal anchor, not invented.

MD3 BUILD MAP — fiscal controls (on the Settings page): md-outlined-select for month + md-outlined-select (or md-outlined-text-field type="number") for day, with a quarters PREVIEW as a tokened md-list; gated to managers. Reminder surfaces: a small count indicator on the Scoring nav item (tokened badge composition), and the Reminders thread inside Messaging (system conversation) using md-list/md-list-item. (Full Settings and Messaging components are captured in their own boxes.)` },
            { t: "Map — coordinate→pixel translation, dots, zones, read-only positions, history trail, scorecard", d:
`WHAT IT IS — the Map is the visual face of the Relationship engine: a 4-column x 6-row zone grid with one DOT per (visible) stakeholder, positioned by that stakeholder's weighted (x, y). It is READ-ONLY: it displays positions; it does NOT edit them. All scoring/rescoring happens on the Scoring page (per the quarterly cadence); the Map simply reflects the resulting weighted positions. (The old build allowed dragging a dot to rewrite everyone's scores — that drag-to-rescore behavior is REMOVED.) Rows = the same workspace-filtered visibleStakeholders as everywhere else; team + scores are global (see Scoring). Unlike Scoring, the Map IS available on Master (it is the org-wide overview Master redirects Scoring to). Each row precomputes _x/_y = weightedCoord(s.id, scores, team) and _status = statusFor(_x, _y).

THE COORDINATE -> PIXEL TRANSLATION (this is the heart of "positioned correctly"):
coordToPct(x, y): left% = ((x + 10) / 20) * 100 ; top% = ((10 - y) / 20) * 100. So the dot is absolutely positioned inside the dots-layer at that left/top percentage. Consequences of the formula: x = -10 -> left 0% (far left), x = +10 -> left 100% (far right); y = +10 -> top 0% (TOP), y = -10 -> top 100% (BOTTOM). i.e. POSITIVE Y RENDERS UPWARD, positive X rightward. The (0,0) origin sits at dead-centre (50%, 50%).
The dots-layer spans exactly the grid area, so 0%..100% maps linearly to the -10..10 axis on both axes; the grid, the dots, and the axis ticks therefore share one coordinate space. Dragging is removed, but the inverse pctToCoord still exists for any future drag (rounds to .25: Math.round(v*4)/4).

THE ZONE GRID — render D.GRID (6 rows x 4 cols) as cells (zone class); each cell's background = STATUSES[status].color, text = STATUSES[status].text. The 24 cells tile the plane in the boundary order from the Relationship engine (cols by X_BOUNDS, rows by Y_BOUNDS). Optional per-cell: a zone LABEL (zone-label, the status name, shown when showZoneLabels) and a COUNT BADGE (zone-count, how many dots fall in that cell, shown when cnt > 0). Cell binning for the count matches statusFor exactly: col = x<-5?0 : x<0?1 : x<5?2 : 3 ; row = y>5?0 : y>2.5?1 : y>0?2 : y>-2.5?3 : y>-5?4 : 5. Counts are aggregated into a map keyed "row,col"; maxCount = Math.max(1, ...all cell counts) (floored at 1 so an empty map never divides by zero).

DENSITY HEATMAP SHADING (mapStyle === "density") — EXACT per-cell fill: each cell's background = color-mix(in oklch, {zoneColor} {20 + t*80}%, #F2EFE7) where zoneColor = STATUSES[status].color and t = cnt / maxCount (this cell's count over the busiest cell's count, maxCount = Math.max(1, ...all cell counts)). So an empty cell (t=0) mixes 20% of its zone color into #F2EFE7 (very dim/neutral); the hottest cell (t=1) mixes 100% zone color (full saturation). FLAG: #F2EFE7 is the density base neutral — it should be referenced as --ui-sys-zone-density-base (that token already exists). The text color stays STATUSES[status].text. In classic/halo styles the cell is just the flat STATUSES[status].color.

AXIS TICKS & LEGEND — y-axis ticks (map-yaxis-ticks / map-ytick) rendered OUTSIDE the grid on the left: [10, 7.5, 5, 2.5, 0, -2.5, -5, -7.5, -10] top-to-bottom. x-axis ticks (map-xaxis-ticks / map-xtick) BELOW the grid: every integer -10..10 (21 ticks, Array.from length 21 mapped i-10) left-to-right. Under-stage legend strip (map-axis-legend, marginTop 14, width 92% capped 920, centered): left "← Works against you", centre "↑ Greater community influence  ·  ↓ Less community influence", right "Works with you →". So the human-readable meaning: X = works-against <-> works-with-you (alignment/support); Y = community influence/importance (down = less, up = more). A thin axis-lines overlay marks the centre cross.

THE DOT — absolutely positioned via coordToPct(_x, _y), inside the dots-layer. Structure: an outer .dot (gains "selected" when selectedId === id, "dragging" while dragged) positioned by left/top, with inline color = zone color; an inner circular marker (dot-inner) sized dotSize×dotSize px with background = zone color, color = zone text, borderColor = isSel ? var(--accent) : (zone.border || zone.text). Shows the stakeholder's 2-letter INITIALS only when dotSize >= 22 (abbrev(name): strip honorific prefixes Mayor/Rep./Sen./Dr./Mr./Ms./Mrs., then first+last initial, or first two letters of a single name); below 22 the inner is blank. A text LABEL (dot-label, the name) shows when showLabels is on OR the dot is selected. Hover tooltip (title): "{name} · {status} · ({_x.toFixed(1)}, {_y.toFixed(1)})". Interactions (read-only — no dragging): pointer-down / single click = select via wrapSelect (sets selectedId, forces detailOpen true, turns history mode OFF); double-click = openDetail(id) (open the full stakeholder profile).
• HALO ring (mapStyle === "halo") — each dot renders an extra .dot-halo element with EXACT inset = -(dotSize * 0.8)px on all sides (a soft ring extending 0.8× the dot's size beyond it). Present only in halo style.

HISTORY / MOVEMENT OVER TIME — a stakeholder carries history: an array of past snapshots, each { quarter, x, y, recordedAt } (e.g. { quarter: "FY26 Q1", x: 1, y: 6, recordedAt: "2026-01-31" }), produced by the quarterly re-score cycle (see the Cadence box). The scorecard shows a "Show history" toggle only when history is non-empty. detailOpen and historyMode are local Map state; historyMode defaults false. In HISTORY MODE: all other dots hide (only the selected stakeholder's current dot renders); the selected stakeholder shows one dashed "history dot" per snapshot plus a dashed TRAIL through the snapshots ending at the current position. Selecting any dot exits history mode (wrapSelect sets historyMode false). The toggle button (map-history-btn, gains "active" in history mode) shows a clock icon and "Show history" / "Exit history".
• HISTORY TRAIL SVG (EXACT) — a .trail-svg <svg> with viewBox "0 0 100 100" and preserveAspectRatio="none". It draws one <path> through points = [...selected.history, { x: selected._x, y: selected._y }] (every snapshot then the current live position). For each point cx = ((x + 10) / 20) * 100 and cy = ((10 - y) / 20) * 100 (the same transform as coordToPct, expressed in the 0..100 viewBox); the path string is built "M{cx},{cy}" for the first point and "L{cx},{cy}" for the rest, joined by spaces. Path attributes: stroke = var(--accent), strokeWidth = "0.35", strokeDasharray = "1.2,1.2", fill = "none", vectorEffect = "non-scaling-stroke" (so the dash/width stay crisp regardless of the SVG's rendered size). Drawn only when historyMode && selected && selected.history.length > 0.
• HISTORY DOT (EXACT) — for each snapshot h, a .dot.history-dot positioned via coordToPct(h.x, h.y) (left/top), with title "{h.quarter}: ({h.x}, {h.y})". Its inner marker (dot-inner) is 14×14 px, background var(--paper), color var(--ink-3), borderColor var(--ink-mute), borderStyle dashed, with empty content. A dot-label beneath shows h.quarter on a var(--paper) background.

THE SCORECARD (right rail, .detail) — a collapsible detail panel. It DEFAULTS OPEN: the Map's detailOpen state initializes to true, so the scorecard shows immediately on first load. When the user closes it, detailOpen becomes false and the whole rail collapses to a single thin REOPEN button (.map-detail-reopen) showing a chevron-left icon, title "Reopen scorecard", aria-label "Open scorecard"; clicking it sets detailOpen back to true. Selecting a dot also forces it open (wrapSelect).
• EMPTY STATE (no selected stakeholder): a "Scorecard" header label + a close (×) ui-icon-button (title "Hide scorecard panel"); a prompt "Click any dot on the map to see details, or drag a dot to move it."; a "Recently scored" caption; then a shortlist of the first six stakeholders (stakeholders.slice(0,6)) each as a left-aligned ghost button "{name} - {type}" that selects that stakeholder.
• SELECTED STATE: the "Scorecard" header + close button; displayName(stakeholder) || stakeholder.name as the title; org sub-line (.det-org); optional "Visit Website" link (.det-website, href = normalizeUrl(stakeholder.url), opens in a new tab) when url present; the history toggle (map-history-btn) shown only if history is non-empty; a status-pill-row with a large StatusPill (size "lg") plus the live "({_x.toFixed(1)}, {_y.toFixed(1)})"; a STRATEGY card colored by the zone (background = zone.color, color = zone.text, radius 8) showing an uppercase "Strategy" caption, zone.strategy (bold), and zone.action; then metadata rows (.detail-row, k/v) — Category, Type, Market, Region, Geography, Issues (as .tag chips or "-" muted), Priority (PriorityPill), Owner (OwnersDisplay avatars size 22), Last contact, Status (StatusDot), Tags (Tags); and the LATEST NOTE (.detail-latest-note): newest of notesHistory sorted by .at descending, falling back to the plain notes field ({ body: notes, at: lastContact, by: null }); shows an uppercase "Latest note" caption + its formatted date (toLocaleDateString month short / day numeric / year numeric) + the note body. Renders nothing if there is no note.

DISPLAY OPTIONS (from the old Tweaks panel; in the rebuild these become Canonical UI Settings/Design controls, not ad-hoc): mapStyle = classic | halo | density (density shades each cell by count via the color-mix toward #F2EFE7 detailed above; halo adds the -(dotSize*0.8)px ring around each dot); showLabels (always show dot names); showZoneLabels (show zone names in cells); dotSize (px; initials appear at >= 22). These are presentational only and never change positions or scores.

CANONICAL-UI BUILD MAP (Canonical UI design system — the plot is the domain ui-stakeholder-map component; it ships NO chart primitive, so the plot is hand-built with inline SVG + HTML INSIDE that component — sanctioned inline SVG — styled SOLELY with --ui-sys-* tokens; the resize-proof proportional approach from the old build is reproduced on purpose).
• Stage: a tokened surface container holding the plot area; the plot area is a proportional box (max-width capped, centered, min-0 flex parents) so it scales cleanly on resize — exactly the invariants that made the old map never break.
• Coordinate space: implement coordToPct directly — left% = ((x+10)/20)*100, top% = ((10-y)/20)*100 (positive y renders UP, origin centre). The zone grid, dots, ticks, and trail all share this one transform.
• Zone grid (behind the points): either a CSS grid encoding the non-uniform bands as fr ratios (columns 1fr 1fr 1fr 1fr; rows 2fr 1fr 1fr 1fr 1fr 2fr = the 5/2.5/2.5/2.5/2.5/5 heights) OR 24 inline-SVG rects placed from the X_BOUNDS/Y_BOUNDS pairs; each cell filled with STATUSES[status].color via a CSS custom property (no inline literals, no !important). Density style applies the color-mix(in oklch, {zoneColor} {20+t*80}%, var(--ui-sys-zone-density-base)) fill. Zone label = tokened label text; cell count = a tokened badge at the cell centre.
• Dots: absolutely-positioned elements at coordToPct(_x,_y), translate(-50%,-50%) to centre on the point; each a circle filled with the zone color, outlined with zone.border||zone.text (accent token when selected), showing 2-letter initials (abbrev) at dotSize >= 22; name label when labels on or selected. Halo style adds the dot-halo ring at inset -(dotSize*0.8)px. Single click → select + open scorecard + exit history; double-click → open full profile. READ-ONLY (no dragging).
• Tooltip: ui-tooltip rendering "{name} · {status} · ({_x.toFixed(1)}, {_y.toFixed(1)})".
• Axis ticks: y ticks [10,7.5,5,2.5,0,-2.5,-5,-7.5,-10] outside the plot left; x ticks every integer -10..10 below — tokened label text positioned by the same transform.
• History trail: inline-SVG dashed path (sanctioned inside ui-stakeholder-map) — viewBox "0 0 100 100", preserveAspectRatio none, through cx=((x+10)/20)*100 / cy=((10-y)/20)*100 of [...history, current], stroke var(--accent), strokeWidth 0.35, strokeDasharray "1.2,1.2", vectorEffect non-scaling-stroke; plus dashed 14×14 history-dot circles (paper bg, ink-3 text, ink-mute dashed border) labelled by quarter; shown only in history mode (selected stakeholder only).
• Axis legend strip (under the stage): tokened label text ("← Works against you", "↑ Greater community influence · ↓ Less community influence", "Works with you →").
• Scorecard (right rail): a tokened surface-container side panel (ui-list rows); status as ui-chip (zone-tokened); issues/tags as ui-chip sets; owners as overlapping avatars; "Show history" as a ui-chip filter or ui-button toggle; the open/close affordance via ui-icon-button chevrons — close (×) collapses the panel, and the collapsed state shows the single reopen ui-icon-button with the chevron-left icon (title "Reopen scorecard"). Scorecard defaults OPEN (detailOpen=true). Empty state lists six recent stakeholders as ui-button (ghost) rows.
• Display options (mapStyle/showLabels/showZoneLabels/dotSize) come from the Settings/Design controls, read as props — never ad-hoc.
• Selection state lifts to the page so Scoring/Lists/Map share the selected stakeholder.` },
            { t: "Lists table — the master stakeholder table (columns · edit mechanism · ui-* composition)", d:
`WHAT IT IS — the Lists page is the MASTER STAKEHOLDER TABLE: the app's primary data surface (a spreadsheet built from CSS grid, NOT an HTML table element and NOT an MD3 list-detail layout). The SAME SheetView component renders Master (all stakeholders) and each workspace (rows filtered to that workspace via the stakeholderWorkspaces join), and is EMBEDDED elsewhere (record pages). Rows = the workspace-scoped visibleStakeholders mapped via useMemo: each row computes, live, _x/_y = weightedCoord(s.id, scores, team), _status = statusFor(_x,_y), and _unscored = (team.length > 0 AND no team member has a score for this stakeholder, i.e. !team.some(m => teamScores[m.id])).

COLUMNS — two groups.
FROZEN (sticky-left, not reorderable, in order): (1) idx — width 40, 1-based row number (index+1); (2) edit — width 34, an icon cell opening the full stakeholder record (Icon name "user" if row.isPerson, else "users"); (3) Stakeholder — width 220, field "name", displayName(row) read-only here (double-click opens the record); (4) Organization — width 190, field "org", INLINE editable text input; for an org (not a person) editing it writes {org, name:org} (mirrors into name), for a person it writes {org} only (name untouched).
REORDERABLE (drag to reorder; width "max-content" each; order persisted PER USER in localStorage key "hp_map_col_order_v3" — per-device, not synced; on load, saved keys present in REORDER_COL_MAP are kept, then any missing keys appended; unknown keys dropped): Category(field category) · Type(type) · Market(market) · Region(region) · Geography(geography) · State/Prov.(state) · Sites(site) · Issues(no field) · Priority(priority) · x(_x, cls "coord") · y(_y, cls "coord") · Relationship(_status) · Tags(no field) · Owner(owner) · Email(email) · Phone(phone) · X account(xAccount) · Last contact(lastContact) · Status(status) · Notes(notes) · Website(url) · Community investment(no field).

EDIT MECHANISM per column —
• INLINE dropdown (CellSelect): Category, Type, Market, Region, Geography, State, Site, Status. CASCADES: changing Category writes {category:nc, type:(CATEGORIES[nc]||[])[0]||""} (resets Type to the new category's first type); changing Market writes {market:m, region:(MARKETS[m]||[])[0]||""} (resets Region to the market's first region); choosing a Site whose record has a state writes {site:id, state:s.state} (auto-fills State), else {site:id}. State select option list = US_STATES, placeholder "-". Site select options = SITES mapped to {value:s.id, label:siteLabel(s)}, placeholder "-". Status options: ["Active","Watch","Dormant"].
• INLINE text: Organization (cell-input). INLINE date: Last contact (CellDate — a popover calendar; stores YYYY-MM-DD; trigger shows the value or "-").
• CLICK-TO-MODAL: Notes — the cell shows row.notes as a preview (class notes-preview); clicking the cell stops propagation and opens the Notes modal.
• DISPLAY-ONLY in the grid (edited via the full record modal): Issues (Tags chips from row.issues), Tags (Tags chips from row.tags), Priority (PriorityPill High/Medium/Low), Owner (OwnersDisplay avatars, size 20), Community investment (affiliatedCommunity(row.id, community) → pills, or muted "-").
• LINK cells:
  - Email — mailto:{row.email} (class plain-link), click stops propagation; muted "-" if empty.
  - Phone — anchor href "tel:" + row.phone.replace(/[^\\d+]/g, "") (strips everything except digits and +); display text = formatPhone(row.phone); muted "-" if empty.
  - X account — if empty, muted "-"; else handle = row.xAccount.replace(/^@+/, "") (strips one-or-more leading @), href "https://x.com/" + handle, target _blank rel noopener noreferrer, link text rendered as "@" + handle.
  - Website — if row.url, anchor href normalizeUrl(row.url), target _blank, text "Visit Website"; else muted "-".
• COMPUTED read-only: x = row._x.toFixed(1), y = row._y.toFixed(1) (cls "coord readonly" plus tone: "positive" when value > 1, "negative" when value < -1, "" otherwise); Relationship = StatusPill(row._status) (the scored zone pill).

TOOLBAR (portaled into explainerSlot, above the table) —
• Search input (placeholder "Search stakeholders, orgs, tags…", with a leading search Icon and a trailing cmdKeyLabel kbd hint). Match is case-insensitive against: displayName(r), r.name, r.org, r.type, r.notes, and any r.tags entry.
• Filter button (shows activeFilterCount badge = total selected across all filter fields) opening FilterPopover. Filter fields and how their option lists are built (CORRECTION — they are NOT all auto-aggregated): Priority is HARDCODED ["High","Medium","Low"]; Status is HARDCODED ["Active","Watch","Dormant"]; Type, Owners, Issues are AGGREGATED from rows (Set of present values, sorted; owners/issues flatten the per-row arrays); Zone (Relationship) = STATUS_ORDER filtered to zones actually present in rows (so it stays in canonical zone order, not alphabetical). Semantics: OR within a field, AND across fields. FilterPopover renders sections in order: Audience type, Priority, Status, Relationship(zone), Issues, Owner (owners render through userName resolving id→name).
• Sort button (shows a "1" badge when a sortKey is active) opening SortPopover over the sortableFields list with an asc/desc direction. THE 11 SORTABLE FIELDS (key → label): name → "Stakeholder", org → "Organization", type → "Audience type", market → "Market", region → "Region", state → "State/Prov.", site → "Sites", lastContact → "Last contact", updatedAt → "Last updated", createdAt → "Date added", _status → "Relationship". CUSTOM ORDERINGS inside the comparator: name sorts on displayName(a)||a.name||""; priority uses {High:0, Medium:1, Low:2} (missing → 9); status uses {Active:0, Watch:1, Dormant:2} (missing → 9); site sorts on siteLabel(SITES.find(id===)). Numeric values subtract; otherwise localeCompare; direction flips the sign.
• Categories multi-select button (badge = count) — popover lists Object.keys(CATEGORIES) with a check toggle; "Clear all" empties it. Filters rows by r.category.
• Sites multi-select button (badge = count) — popover lists SITES (siteLabel) with a check toggle; "Clear all" empties it. Filters rows by r.site (matching site id).
• Spacer, then three IMPACT-BAND chips (impact-chip buttons), each showing a live count AND toggling a band filter:
  - Positive impact — swatch background var(--pos); count = sum of BAND_STATUSES.positive = ["Cooperate","Collaborate","Valuable Relationship","High Value Relationship","Strategic Partner"].
  - Winnable middle — swatch background is the COLOR LITERAL "#E2A85F" (hardcoded inline, NOT a token — FLAG: in the rebuild this must become a --ui-sys-* token alongside --pos/--neg); count = sum of BAND_STATUSES.middle = ["Monitor","Maintain","Connect","Commit"].
  - Negative impact — swatch background var(--neg); count = sum of BAND_STATUSES.negative = ["Proactively Defend","Defend","Protect","Respond","Identify"].
  Selecting a band adds its zones to the band filter; counts come from countByStatus (a per-zone tally over rows).

SORT DEFAULT (no explicit sortKey) — unscored stakeholders FIRST (a._unscored vs b._unscored), then by most-recent lastContact (b.lastContact.localeCompare(a.lastContact) — descending).

PAGE FOOTER (the page-level footer at the bottom of THIS page; distinct from the always-bottom APP shell footer) — table Icon + "{filtered.length} of {rows.length} stakeholders"; "·"; Avg x = mean of filtered _x to 1 decimal; Avg y = mean of filtered _y to 1 decimal (each divided by max(filtered.length,1)); spacer; an Export CSV button (download Icon). CSV column set (in order, with accessors): Stakeholder(displayName||name), Organization, Category, Type, Market, Region, Geography, Issues(joined "; "), Priority, Tags(joined "; "), Owners(ids resolved to user.name), Last contact, Status, x(_x.toFixed(1)), y(_y.toFixed(1)), Relationship(_status), Website(normalizeUrl(url) if any), Notes. Values escaped: any cell matching /[",\\n]/ is wrapped in double quotes with internal quotes doubled. Filename = (workspaceLabel||"stakeholders") with non-word chars → "_", plus ".csv".

INTERACTIONS — clicking a row selects it (selection lifts to the page; shared with Map/Scoring); double-clicking the name (or clicking the frozen edit icon, which stops propagation) opens the full record (StakeholderModal in edit mode); the notes cell stops propagation and opens the Notes modal. Horizontal scroll toggles a "scrolled-x" class (left-edge shadow) once scrollLeft > 0; frozen columns auto-size to content and their sticky left offsets are MEASURED after layout (useLayoutEffect reading each frozen header cell's getBoundingClientRect width, accumulating left offsets) so they stack deterministically. Column reorder = native HTML5 drag-and-drop on the reorderable header cells (draggable, onDragStart sets dragKey, onDragOver sets dragOverKey + preventDefault, onDrop splices dragKey before the target in colOrder and persists). The new-stakeholder modal opens when addNonceFor === "sheet" fires; openStakeholderId routes an external open-request into editId.

CANONICAL-UI BUILD MAP (NEVER md-*/mat-table/shadcn — the rebuilt app is assembled exclusively from this repo's <ui-*> design system):
• Table: the existing domain component ui-stakeholder-table (composed on ui-data-table) — sticky header, frozen Stakeholder/Org columns, sortable headers, drag-to-reorder columns, virtualized body for large workspaces, and per-cell custom templates so each cell hosts its own control. No HTML <table>, no third-party grid, no MUI.
• Dropdown cells (Category/Type/Market/Region/Geography/State/Site/Status): ui-select (intrinsic-width so columns autofit). Cascades wired in the cell change handlers exactly as above.
• Text cell (Organization): ui-text-field (no label, dense).
• Date cell (Last contact): ui-date-picker (popover calendar, stores YYYY-MM-DD).
• Relationship (the SCORED zone — derived from the team's scores via statusFor; follows the stakeholder everywhere): ui-chip, background/text from the single-sourced --ui-sys-zone-* tokens. Priority (a SEPARATE, manually-set High/Medium/Low field): a distinct ui-chip with its own priority tokens — two different fields, relationship is derived, priority is set by hand. Issues/Tags/Community: ui-chip set. Owners: overlapping avatars. Email/Phone/X/Website: semantic anchors (mailto/tel/x.com/normalizeUrl as above).
• Edit icon + reorder grips: ui-icon-button (Material Symbols person/groups, drag_indicator).
• Toolbar: search = ui-text-field with a leading ui-icon "search" + cmd-key hint; Filter/Sort/Categories/Sites = ui-button opening a ui-menu of checkbox items for multi-select (or a larger ui-dialog for the multi-field filter panel); impact bands = ui-chip (filter variant, selected = active). The "Winnable middle" swatch color #E2A85F MUST be promoted to a --ui-sys-* token (sits beside the positive/negative band tokens).
• Footer: design-system label/body text + an Export CSV ui-button (download ui-icon). Computed x/y tone via positive/negative on-surface tokens.
• Selection/edit/notes state lifts to the page; the Notes modal and the full record open via ui-dialog (the create/edit modal is captured in its own box).` },
      { t: "Create / edit stakeholder modal (StakeholderModal) — fields, defaults, validation, sub-controls", d:
`WHAT IT IS — StakeholderModal is the single popped-up card used for BOTH creating a new stakeholder and editing an existing one (it replaced the old NewStakeholderModal). Same shape either way; when an "existing" stakeholder is passed it loads that record's values and saves via onSubmit (a patch) instead of creating. Opened from the Lists toolbar "New stakeholder", from a row's edit icon / name double-click, and from external open requests. Props of note: users, workspaces, isMaster, currentUser, existing, onCancel, onSubmit, onDelete, initialView, companyIssues, companyTags, community, stakeholders, scores, team, getWorkspacesForStakeholder, onOpenWorkspace, updateCommunityApp. isEdit = !!existing.

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
13. TAGS — an IssueSelector over draft.tags with companyTags AND the restrict prop set, helper "Choose from the company tag set. Managers can add tags in Settings." (restrict hides the custom input, so tags are limited to the company tag set.)
14. NOTES — a 3-row textarea bound to draft.notes (free text; the running history lives in the separate Notes modal).
15. CREATE-ONLY NOTICE (only when !isEdit) — a muted line above a top border: "Score isn't set yet. Your team will be notified - they'll see this stakeholder at the top of their Sheet and the count on Scoring."
16. DELETE SECTION (only when isEdit AND onDelete is provided) — a "Delete stakeholder" labelled section with copy "Permanently removes this stakeholder and all of their scores. This cannot be undone." and a danger "Delete stakeholder" button that opens the confirm modal.

VALIDATION (shMissing list; the modal is valid only when shMissing is empty) — required: Organization ("Organization", trips when org missing/blank); Person name ("Person name", only when isPerson and neither firstName nor lastName); Custom title ("Custom title", only when isPerson and title==="Other" and titleOther blank); Category; Audience type; Market; Region; Geography; State (from site) ("State (from site)", only when a chosen site has a state but draft.state is unset — normally auto-filled, so this only trips on a malformed site). The footer shows "Required: {shMissing joined by ', '}" when invalid; Save button is disabled until valid, with title "Fill required fields: {list}".

SUBMIT NAME COMPOSITION (submit() — no-op if invalid) — if isPerson: computed = displayName({title, titleOther, firstName, lastName}); name = computed || draft.org (falls back to org if the person name resolves empty). If NOT a person: title/titleOther/firstName/lastName are CLEARED to "" and name = draft.org. In both cases url = normalizeUrl(draft.url). The full draft (with those overrides) is passed to onSubmit — addStakeholder on create, updateStakeholder(id, patch) on edit.

VIEW / EDIT TOGGLE — when initialView is truthy AND existing is present, the modal opens in viewMode and renders the read-only StakeholderProfile instead of the form (passing stakeholder, users, stakeholders, community, scores, team, getWorkspacesForStakeholder, currentUser, companyIssues, plus onClose=onCancel, onEdit=() => setViewMode(false), onOpenWorkspace, updateCommunityApp). The modal head shows a "View Stakeholder" button (only in edit mode) that flips into that profile; the profile's Edit action flips back to the form.

DELETE FLOW (edit mode) — the danger button sets confirmDelete true, rendering a stacked confirm modal: an extra veil at zIndex 60 and a confirm card at zIndex 61 (width 380). Copy: heading "Delete this stakeholder?"; body "{displayName(existing) || existing.name} and all of their scores will be permanently removed. This cannot be undone." Buttons: "Cancel" (closes the confirm) and a danger "Delete" (closes the confirm and calls onDelete).

ISSUE SELECTOR (the sub-control used for BOTH Issues and Tags) — props selected, companyIssues, onChange, restrict. titleCase(s) = split on whitespace, each word → first char upper + rest lower, rejoined and trimmed. Layout:
• Selected chips row (when any): each selected value is a filled chip with a trailing "×"; clicking the chip removes that value.
• Available presets row (when any company values are not yet selected): each available company value is a dashed "+ {value}" button that adds it.
• Custom input row — HIDDEN when restrict is set (so Tags are limited to the company set; Issues allow free custom entry). The input commits on Enter (commitDraft) and on "," (commits everything up to and including the comma) and on blur (commits any pending text); Backspace on an empty input removes the LAST selected value. Committing splits the draft on commas, titleCases each piece, and appends only non-duplicate values; the input then clears. Every add titleCases and dedups (selected.includes guard).

MULTI-OWNER PICKER — MultiOwnerPicker(users, owners=draft.owners, onChange, size=26) — the owner avatar multi-select used in the Owners field (full element spec captured with the users/profile boxes).

NOTES MODAL (NotesModal — opened from the Lists notes cell; also the modal's own Notes textarea writes the current notes string) — header eyebrow "NOTES" over displayName(stakeholder) || stakeholder.name; close button. HISTORY (newest first): start from stakeholder.notesHistory; if that array is empty but stakeholder.notes exists, synthesize a single legacy entry { id:"n-legacy", body: stakeholder.notes, at: stakeholder.lastContact || now(ISO), by: null }; sort by at descending via (b.at||"").localeCompare(a.at||""). Each entry shows a date stamp = new Date(n.at).toLocaleDateString with { month:"short", day:"numeric", year:"numeric" } (or "-" if no date), plus the author: "· {author.name}" when by resolves to a user, else a muted "· legacy" (for by:null). Empty state (no history): "No notes yet. Add the first one below." COMPOSER (a form below): label "Add a new note", a 3-row textarea (placeholder "Write what happened, what was said, or what you learned…"), a footer line "Dated today, posted as {currentUser.name || 'you'}.", a "Close" button and an "Add note" submit (disabled until the text trims non-empty). On add, the Lists handler builds entry { id: uid("n"), body: text, at: new Date().toISOString(), by: currentUser.id }, appends it to notesHistory, AND sets notes to the new text, then clears the composer.

CANONICAL-UI BUILD MAP (NEVER md-*/shadcn) — host = ui-dialog. Text inputs (Organization, Website, Email, Phone, X account, person First/Last, custom title) = ui-text-field; selects (Title, Category, Audience type, Market, Region, Geography, Site, State, Priority, Status) = ui-select; Last contact = ui-date-picker (or native date if simpler); "Add a person" = ui-switch (or ui-checkbox). IssueSelector = a ui-chip set (selected filled chips with remove, available dashed add chips) + a ui-text-field for custom entry (the text field is omitted when restrict). Owners = the owner-avatar picker. Photo = a plain file input behind a ui-button (Upload/Replace) plus a ui-button ghost "Remove"; preview is an avatar surface with the data URL or a fallback ui-icon. Footer "Required: …" hint + Cancel/Save ui-buttons (Save disabled until valid). The delete-confirm is a second stacked ui-dialog. Tone, spacing, and colors come only from --ui-sys-* tokens.` },
      { t: "Stakeholder profile (read-only modal) — the full field set & sections", d:
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
- Column "Tags": label div prof-k "Tags"; pills container prof-ti-pills = if (s.tags||[]).length, <Tags values={s.tags} /> (renders first 3 tags then a "+N" overflow chip); else <span class="muted">-</span>.
- Column "Issues": same pattern with s.issues, key "Issues".

SECTION "Community engagements":
- A cumulative row (class profile-cumulative): span.comm-meta-k "Cumulative committed"; span.profile-cumulative-val showing $ {cumulative.toLocaleString()} (US thousands separators) colored via inline style color = (cumulative > 0 ? var(--pos) : var(--ink-3)) — positive total is green, zero/none is muted ink.
- If affil.length === 0: muted line (fontSize 12.5, padding 4px 0) "No community engagements linked yet."
- Else a list (class profile-entry-list): map affil.slice(0,5) — the FIRST FIVE — each a <button class="profile-entry" title="Open application"> calling setEntryId(a.id). Button contents: profile-entry-main containing profile-entry-name = a.name and profile-entry-meta muted = {a.kind} · {a.stage}; then profile-entry-amt = communityEntryAmount(a); then Icon name "chevron-right" class "ico". If affil.length > 5, an "explainer-link" button (alignSelf flex-start, marginTop 2) labeled "View all {affil.length} engagements" that sets showAllEntries true.

SECTION "Notes":
- If history.length === 0 AND no s.notes: muted line (fontSize 12.5, padding 4px 0) "No notes recorded."
- Else if history.length: container prof-notes; map each note n (already sorted DESC by at). Resolve author by = users.find(u => u.id === n.by). Render prof-note with prof-note-meta = a span (fontFamily var(--mono), color var(--ink-2)) showing n.at ? formatDateLong(n.at) : "", and if author resolved a muted span " · {by.name}"; then prof-note-body = n.body.
- Else (no history but s.notes exists): a single <p class="comm-card-summary">{s.notes}</p> (the legacy plain notes field).

NESTED COMMUNITY MODAL (when viewEntry is truthy): render CommunityModal with existing={viewEntry}, users, stakeholders||[], currentUser, companyIssues, initialView={true} (opens in READ-ONLY view mode). Its onOpenStakeholder(id) finds that stakeholder in the stakeholders array and, if found, calls setSubject(next) + setEntryId(null) — i.e. the profile re-targets to that stakeholder IN PLACE without closing. onCancel sets entryId null; onSubmit(app) calls updateCommunityApp(app) (if provided) then sets entryId null.

"VIEW ALL" OVERLAY (when showAllEntries is true): its own veil (modal-veil show, click closes) + a <div class="modal" style width 460, maxWidth calc(100% - 32px)>. Head (modal-head): an uppercase eyebrow (fontSize 10.5, letterSpacing 0.08em, uppercase, color var(--ink-3)) reading "Community engagements"; an h2 (margin 0) = displayName(s) || s.name; a btn btn-ghost close (Icon "close") setting showAllEntries false. Body (modal-body, gap 6) = profile-entry-list mapping the FULL affil array (not capped), each entry button identical to the inline version but on click sets showAllEntries false THEN setEntryId(a.id) — so choosing one closes the list and opens that engagement.

REBUILD BUILD-MAP (Canonical UI — never md-*/shadcn):
- Outer modal+veil = ui-dialog (centered, with scrim). Header avatar = the ui-* avatar primitive (photo cover background, else ui-icon "user"/"users").
- prof-title via Newsreader title token; prof-sub / coords via body ink-muted.
- StatusPill / StatusDot / PriorityPill = the existing zone-token-driven status components (single-sourced --ui-sys-zone-* / status tokens).
- Identity & Contact grids = key/value rows assembled from ui-* primitives (2-col); links = real anchors styled by tokens.
- Workspace + tag/issue chips = ui-chip (clickable variant for workspaces).
- Owners = OwnersDisplay avatar stack.
- Community engagement rows = ui-list rows (leading name+meta, trailing amount, trailing ui-icon chevron).
- Section labels = the cm-section-label eyebrow style (uppercase, tracked).
- Nested community detail = a stacked ui-dialog. "View all" = a second stacked ui-dialog. All icons via ui-icon ligatures (search/close/chevron-right/user/users). No ad-hoc div/span primitives, no inline color except the token references (var(--pos)/var(--ink-3) become --ui-sys-* equivalents).` },
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
            { t: "Relationship recommendation alignment — how a stakeholder maps to the plan algorithm (designed)", d:
`THE PROBLEM (the piece that was "not yet aligned") — inside a plan, after the manually-prioritized stakeholders, we must surface the stakeholders whose RELATIONSHIP best fits the picked plan algorithm, each with a recommended move. Designed here as equal parts engineer and public-affairs veteran. HONESTY FIRST: we have NO real per-factor data per stakeholder (no measured "Price Sensitivity" etc.), and we will NOT fake one. We design only on signals the app genuinely holds.

WHAT WE ACTUALLY HAVE PER STAKEHOLDER: the scored RELATIONSHIP position (x = support/alignment -10..10, y = influence/importance -10..10) -> a ZONE (one of 14, each with a strategy + action); the manual PRIORITY (High/Med/Low); the stakeholder's ISSUES; CATEGORY/TYPE; and COMMUNITY TIES. The plan picks a SECTOR + PLAN-TYPE algorithm (4 weighted factors each).

THE DESIGN — "PLAN FIT" (advisory, transparent, overridable). Two outputs per stakeholder: a FIT BAND (why they matter to THIS plan) and a MOVE (what to do), with a plain-English reason. We never emit a fake precise score.
OBSERVABLE SIGNALS (0–1, all already in the app): INFLUENCE = normalized y; SUPPORT = normalized x, and OPPOSITION/RISK = its inverse (the zone band already summarizes posture: negative/neutral/positive); ISSUE RELEVANCE = overlap of the stakeholder's issues with the plan's issues; COMMUNITY TIE = affiliated community investments; CATEGORY AFFINITY = how central this stakeholder's CATEGORY is to this PLAN TYPE.
CATEGORY AFFINITY (a PA-veteran fact, a small per-plan-type weight table): e.g. Union Negotiations -> Our People; Community Investment / DEI -> Communities + Our People; Activist Shareholders -> Investors; Corporate Crisis -> Government + Communities + Media; Shared Value -> Industry + Communities; sector plans tilt toward their natural regulators/communities/industry. (Editable table; not hardcoded magic.)
FACTOR -> SIGNAL LEXICON (stated OPENLY, coarse on purpose — no hidden precision): each algorithm factor falls into one observable bucket, so the plan's 4 factor weights become weights on the signals. Influence-type (I, FS-influence) -> INFLUENCE; alignment/trust/engagement (SA, TB, EC, EP, CE-engagement, MV) -> SUPPORT; reputation/urgency/risk (U, IR, RI, RM, ST) -> OPPOSITION/RISK; community/issue/sustainability (CNA, PD, CTS, CI-community, ES, SI, IM) -> ISSUE RELEVANCE + COMMUNITY TIE; sector-specific factors map to the nearest bucket. (The bucket for each factor lives beside it in the FACTOR KEY.)
PLAN FIT = a weighted blend of the stakeholder's observable signals using the picked plan's signal weights (derived from its factors via the lexicon) plus the CATEGORY AFFINITY for the plan type -> normalized -> FIT BAND High / Medium / Low. The UI shows the BAND + a one-line REASON ("High influence, on-issue, community-tied" or "Opposed but high-influence — defend"), never a number.
THE MOVE = the relationship ZONE's strategy + action (already defined in the 14-zone engine), framed by the plan type — e.g. a Defend-zone stakeholder in a Crisis plan -> "neutralize threat, defend license"; a Strategic-Partner-zone stakeholder in a Community Investment plan -> "mobilize as surrogate / co-investor." RECOMMENDATION = FIT BAND + REASON + MOVE.

ORDERING in plan element 6: (1) manual PRIORITY first (High->Low) — never overridden by Fit; (2) then the algorithm-aligned recommendations by FIT band (High->Low). The team may still freely add anyone (workspace / Master / new) regardless of Fit.

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

MODEL SCORE + OVERALL SCORE/BAND:
- modelScore(model) = weighted mean of its factor signals: for each [k, w] in model.factors, acc += w * sepFactorSignal(k, sig) and wsum += w; return wsum ? acc / wsum : 0. (Side effect: merged[k] += w accumulates each factor's combined weight across BOTH models for the "top factors" readout.)
- score01 = 0.5 * modelScore(sector) + 0.5 * modelScore(goal)   [equal blend of the picked sector model and goal/plan-type model].
- score = Math.round(score01 * 100)   [the displayed 0–100].
- BANDS: score >= 67 -> "High"; score >= 40 -> "Medium"; else "Low".
- top (the "weighs ..." readout) = Object.entries(merged) sorted by combined weight descending, first 3, mapped to SEP_FACTORS[k].label (or k) — the three highest-combined-weight factors across both models.

THE DESIGN'S RELATIONSHIP TO THIS MATH: the successor keeps these exact observable signals (power/align/opp/urgency/engage/issueRel/commTie) and the same equal sector+plan-type blend, but (a) replaces the hidden round(score01*100) number with a DISCLOSED FIT BAND + plain reason, (b) keeps the 67/40 thresholds as the band cut-points for High/Medium/Low, (c) surfaces the "top 3 factors" as the human-readable reason rather than as tooltip fine print, and (d) adds CATEGORY AFFINITY on top of the factor blend. Rename all SEP* internals (sepScore/sepFactorSignal/SEP_*) per the naming rule; the formulas above are preserved as the numeric core.` },
            { t: "Plan page — plan elements, fields, exists/fix/create (blends the example + the old code)", d:
`WHAT IT IS — a Plan is a structured engagement document scoped to ONE workspace, produced after the team PICKS a plan algorithm (industry sector + plan type; basic default). Surfaces: a LANDING grid of the workspace's plans, plus record.plan.view and record.plan.edit.

LAYOUT (record.plan) — a LEFT SIDEBAR lists the PLAN ELEMENTS by NAME (no numbers shown). Selecting an element opens its MAIN CONTENT, which is broken into SECTIONS holding that element's decisions, collaboration, content creation, and fields. Elements behave like SUB-PAGES; together they build a single plan you can ARCHIVE, revisit, and EXPORT as one Word file. TERMINOLOGY: the numbered items below are PLAN ELEMENTS; "sections" = the sub-divisions of an element's main content.

NAMING RULE: never say "SEP" anywhere. The nav item is "Plan"; written out it is "Stakeholder Plan"; the engine is "the plan algorithm" and its per-stakeholder output is a "relationship recommendation" / "Plan Fit." (Rename the old code's SepExplain/sepScore/SEP_* internals accordingly.)

STATE OF THE OLD CODE — ~25% correct, ~50% of elements missing. Existing editor elements: Scenario, Aligning With Organizational Goals, Stakeholders, Tactics, Measurement. The full plan needs the elements below.

PLAN DATA MODEL (existing fields, keep + extend): id · workspaceId · title · sectorModel · goalModel (the picked algorithm) · owners · status · summary · scenarioSolves/scenarioApproach/scenarioOutcome · goals (inherited snapshot) · goalNotes{goal->text} · issues · team[{userId, role}] · strategies[{id,title,how,...}] · communityIds · priorityOverrides{shId->band} · measurement. ADD: sponsors[{first,last,email}] · consultants[{first,last,org,email}] · each strategy may carry tactics[{id,title,how,assignee}] (assignee = teammate, partner-stakeholder, OR consultant) AND/OR phases[{id,title,timeframe,...}] · per-stakeholder {involvement,risk,opportunity} · predictions · keyMessages[] · feedback[{shId,body,at,by}].

THE PLAN ELEMENTS —
1) SCENARIO & CONTEXT [EXISTS] — the situation narrative: what it solves / approach / outcome (scenarioSolves/Approach/Outcome). Multiline text.
2) SUMMARY OF ISSUE & STAKEHOLDER CONCERNS [CREATE] — a condensed summary of the issue and the spread of stakeholder reactions. Multiline text. (From the example; confirm.)
3) ORGANIZATION GOALS + ALIGNMENT [EXISTS, keep] — INHERITED from the org goals managers set in Settings (ORG_GOALS). For EACH inherited goal, the team writes how THIS plan aligns with / furthers it (goalNotes[goal]). Read-only goal text + a note field per goal.
4) STRATEGY (with optional TACTICS and/or PHASES) [FIX] — the team builds one or more STRATEGIES. A strategy's approach may include TACTICS, PHASES, or BOTH (strategy+tactics, strategy+phases, or strategy+tactics+phases). TACTICS: unlimited and OPTIONAL — a tactic REQUIRES a parent strategy, but a strategy need NOT have any tactic (even if sibling strategies do); each tactic is ASSIGNED to a teammate, a partner-stakeholder, OR a consultant (the outside consultants from element 5); tactics MUST NOT overlap other plan elements (reference/point to them, never duplicate). PHASES: unlimited; each PHASE needs a TIME FRAME; phases can be refined or added over time as the plan progresses; how granular is the team's choice. (Old code has flat strategies with one teammate owner -> restructure to strategy -> tactics[]/phases[].) Fields: strategy {title, how}; tactic {title, how, assignee}; phase {title, timeframe}.
5) TEAM & SPONSORS [CREATE] — the workspace TEAM (auto, with roles) + EXECUTIVE SPONSORS written in (first name, last name, email) + optional OUTSIDE CONSULTANTS not in the workspace (first name, last name, organization, email). Add/remove rows; email captured for sponsors/consultants.
6) PRIORITY STAKEHOLDERS + RELATIONSHIP RECOMMENDATIONS [FIX] — first the PRIORITY stakeholders (by the stakeholder's existing manual Priority, high first), THEN stakeholders whose RELATIONSHIP RECOMMENDATION aligns with the picked plan algorithm. (See the "Relationship recommendation alignment" box for how this is computed.) Plus the free-add paths: add any workspace stakeholder, any Master stakeholder, or create-new (-> added to plan + workspace).
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
Toolbar readout when invalid: a .modal-missing span "{N} left: {first two missing, comma-joined}{ellipsis if more than 2}" with the full list in its title attribute. The Save button (btn-primary, disabled={!planValid}) simply calls onBack (it saves continuously via updatePlan; "Save" just returns to the landing once valid).

PRIORITY-OVERRIDE GATE (PlanPriorityCell, plan element 6 "Priority" column) — only role === "manager" may override (canEdit = !!currentUser && currentUser.role === "manager"). The cell shows the EFFECTIVE band = override || suggestion.band (a PriorityPill). Mark beside the pill:
- when there is NO override -> a subtle "✦" mark (className prio-mark prio-suggest) with tooltip "Suggested · {score}/100 - weighs {top.join(", ")}" (the three top factors).
- when overridden -> a "·set" mark (className prio-mark prio-overridden) with title "Set by a manager - click to use the suggestion".
Clicking the cell (managers only) opens a popover (prio-pop): header "Suggested · {band} · {score}/100" + "Weighs {top.join(", ")}"; options row = three buttons High / Medium / Low (the matching effective band gets .on). onSet(b === suggestion.band ? null : b) — picking a band that EQUALS the suggestion CLEARS the override (onSet(null)); picking any other band sets it. When an override exists, a revert button "Use suggestion ({suggestion.band})" calls onSet(null). setPriorityOverride(id, band): if band -> priorityOverrides[id] = band; else delete priorityOverrides[id]; persisted via set({ priorityOverrides: next }). Sort order in the editor: by PRIO_RANK[override || suggestion.band] (High 0, Medium 1, Low 2), tie-broken by suggestion.score descending. PlanReview reorders by PRIO[band] only (band = override || suggestion.band).

PlanHome LANDING (styled like the Community landing, via the shared LandingView) —
- filterDefs (key/label/get): type/"Type of plan"/goalName(p.goalModel) · issues/"Issues"/p.issues · market/"Market"/p.market · region/"Region"/p.region · status/"Status"/(p.status||"Idea") · year/"Year created"/year of p.createdAt.
- sortFields: title/"Plan name" · status/"Status" · _updated/"Last updated"/(p.updatedAt||p.createdAt) · _created/"Date added"/p.createdAt.
- searchKeys: ["title","market","region","status"].
- cols (table): Plan (p.title) · Workspace (workspace name) · Type (goalName(p.goalModel)) · Market · Region · Site (D.siteLabel of D.SITES match) · Status (comm-stage-text colored by PLAN_STAGE_FG).
- newLabel "New plan"; emptyText "No plans yet. Create one to begin building a stakeholder engagement plan."; row click -> onReview (opens read-only review).
- FOOTER slot: "{plans.length} plans · Priority is suggested from each stakeholder's map position, issue overlap, and community ties, weighted by the plan's sector and scenario models."
- CARD anatomy (renderCard): title (click -> onReview) · workspace name (recipient line, muted) · team avatars via OwnersDisplay over (p.team||[]).map(m => m.userId), size 24, label "team" · goal-model chip (PLAN_GOAL_COLORS) · status text (PLAN_STAGE_FG) · summary (or muted "No summary written yet.") · linked group: Issues (Tags) when present, Engaged "{wsStakeholders(p.workspaceId).length} stakeholders", Market, Region, Site · meta rows: Tactics "{strategies.length} deployed" (or "-"), Investments "{communityIds.length} linked" (or "-"), Segment (workspace.segment), Unit (workspace.businessUnit) · foot: "Updated {date}" + Review / Edit links.

PlanCommunity LINKER (element 11 / "Linked community investment" sidebar field) — available investments = community entries NOT already linked AND scoped to the plan's market AND region: keep c when (!market OR (c.markets||[]).includes(market) OR c.market === market) AND (!region OR (c.regions||[]).includes(region) OR c.region === region). Until both a market AND region are chosen: "Select a market and region above to see available community investments." Linked rows + the add-autocomplete render each entry as "{c.name} · {c.kind} · {c.stage} · communityEntryAmount(c)" (the muted sub-line is "{c.kind} · {c.stage} · {communityEntryAmount(c)}"). Add via a UserAutocomplete over available mapped to { id, name, title: kind · stage, noAvatar:true }; "No community investments available for this market and region." when none.

goalNotes (element 3, "Aligning With Organizational Goals") — the org goals come from D.ORG_GOALS (inherited from Settings; read-only titles). Each goal renders a read-only title (subheader-text) + a textarea keyed by the goal string: value (p.goalNotes && p.goalNotes[g]) || "". ORACLE BUG (RECORD, do NOT replicate): the onChange calls set("goalNotes", { ...(p.goalNotes||{}), [g]: e.target.value }) — i.e. set is called with TWO positional args, but set is defined as set = (patch) => updatePlan({ ...p, ...patch, updatedAt: today() }) (it takes ONE patch object). So "goalNotes" is spread as a string key and the second arg is ignored -> goalNotes NEVER persists from the editor. At rebuild, persist goalNotes correctly: set({ goalNotes: { ...(p.goalNotes||{}), [g]: value } }). PlanReview already reads p.goalNotes[g] correctly (so the read side works; only the write is broken).

PlanReview "SEP model" FORMULA READOUT — the review header shows a .plan-algobar with tag "SEP model" and two <code> readouts: fmt(m) = m.factors.map(([k, w]) => k + "×" + w).join(" + "); rendered as "{sector.name}: {fmt(sector)}" · "{goal.name}: {fmt(goal)}". Per the SEP-rename rule, RENAME the visible "SEP model" label in the rebuild but KEEP this formula-readout element (it transparently shows each model's factor×weight makeup). Review header also assembles a meta line: workspace name · market/region · site label · state abbr · geography · "Updated {date}".

STRATEGY / TACTIC SHAPE (old flat form, to be restructured per element 4 but captured exactly) — strategies = [{ id (uid("st")), title, how, timing, ownerId }]. add() pushes { id: uid("st"), title:"", how:"", timing:"", ownerId:"" }. Fields: title (input, placeholder "Strategy / tactic") · how (textarea, "How - the action to take") · timing (free text input, placeholder "e.g. Q1–Q2") · Lead via LeadPick. LeadPick assigns a SINGLE ownerId lead via a PlanAutocomplete over users.filter(u => u.role !== "system"); a chosen lead renders as a removable avatar tag (.tag.lead-tag: Avatar size 16 + name + a "×" that calls onChange(null)); unset shows a "Assign lead…" button. (Review shows "Timing: {timing}" and "Lead: {owner.name}".)

PlanReview READ-ONLY sections (RS) in order: header (title, meta line, summary, goal-model chip + status + owners, SEP-model formula bar) · Scenario & Context (solves/approach/outcome prose, or "Not written yet.") · Aligning With Organizational Goals (per ORG_GOAL title + goalNotes prose or "No approach described yet.") · Stakeholders In This Plan (ranked table: name, type, StatusPill relationship, PriorityPill effective band) · Cross-functional Team (avatar + name + role||title per team member) · Tactics (title, how, "Timing: …", "Lead: …") · Issues (Tags) · Community Investment (linkedCommunity rows: "{c.name} - {c.kind} · {c.stage} · communityEntryAmount(c)") · Measurement & Reporting (prose or "Not written yet.").

RELATIONSHIP COLUMN — rel(s) in both editor and review = D.statusFor(wc.x, wc.y) where wc = D.weightedCoord(s.id, scores, team); rendered as a StatusPill. The Priority column uses the recommendation engine (see the "Relationship recommendation alignment" box for the exact sepScore math).

NEW PLAN DEFAULTS (newPlan) — id uid("plan"); workspaceId = isMaster ? workspaces[0].id : activeWorkspaceId; title = "{workspace.name} Engagement Plan"; sectorModel "energy"; goalModel "general"; market "" region "" owners [] summary "" status "Idea"; scenarioSolves/Approach/Outcome ""; goals [] issues [] team [] strategies []; communityIds [] measurement ""; priorityOverrides {}; createdAt/updatedAt today(). today() = nowStamp().

DEEP-LINK BRIDGE — window.__pendingPlanId: if set and a matching plan exists, open it (setOpenId + mode "review"), then clear the global. (Mirrors Community's __pendingCommunityId; used from a profile page to jump to a specific plan.)

RETARGET UI BUILD-MAP TO CANONICAL UI (ui-*) — the old code uses raw <select>/.designed-select, hand-built tables, and .tag pills. REBUILD ONLY with Canonical UI: ui-select for sector/type/status/workspace/market/region/site/state/geography pickers; ui-data-table for the stakeholder list (element 6) and the landing table; ui-chip pills for the goal-model "type" pill and issue tags; ui-autocomplete for the add-existing-stakeholder, lead, and community-investment pickers; ui-text-field / ui-textarea for all text inputs. NEVER md-*/shadcn, never raw <select>/<span>/<div> as UI primitives, never inline hexes — pill/status colors come from --ui-sys-* tokens.` },
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

STAGES — Idea -> Proposed -> Under Review -> Approved -> Active -> Complete -> Declined. "DECIDED / COMMITTED" = Approved, Active, or Complete (drives the rollups + approved label). APPROVAL IS MANAGER-GATED: only a MANAGER can move an application to Approved (the formal Approve action, stamping approverId + approvedAt). Votes inform that decision; they do not make it.

VALUE SCORE (MANUAL) = (licenseToOperate + relationshipImpact) / 2 -> 0–10. Both are hand-entered 0–10 inputs; not derived.

VOTES (ADVISORY) — each non-system teammate casts for / against / abstain (clicking your current choice toggles it off); the tally informs the manager's approval. Votes never decide.

CONTRIBUTION TYPES & MONETIZATION — askType in Funding · Volunteer hours · Endorsement · In-kind · Political contribution. VOLUNTEER HOURS and IN-KIND get a MONETARY VALUE ASSIGNED case-by-case within the application (e.g. rate × hours; an in-kind valuation), so EVERY contribution rolls up as a dollar-equivalent. Funding/monetary asks carry a currency (below).

FORWARD-DESIGN vs ORACLE — the MULTI-CURRENCY + FX model below (committedFxRate, MXN/CAD, monetizedValue, "locked historic rates", real-time conversion API) is FORWARD-DESIGN; it is NOT in the oracle. The ORACLE IS USD-ONLY with NO FX: its unit enum is just USD / hours / "" (n/a), it has no committedFxRate/committedFxDate/monetizedValue fields, and all rollups are plain USD sums. KEEP the FX design as the intended successor, but everything in the "ORACLE GROUND TRUTH" section below is what the old code literally does (USD-only) and is the concrete baseline.

MULTI-CURRENCY + FX (FORWARD-DESIGN, NOT in oracle) — amounts may be in USD, MXN, or CAD (Mexico + Canada are already in scope via markets/regions; USD is the reporting currency). An embedded REAL-TIME DOLLAR-CONVERSION API converts non-USD amounts to USD for display and rollups. HISTORIC-RATE LOCK (critical): when an application is COMMITTED (manager-approved), the app CAPTURES AND STORES the FX rate at that moment (committedFxRate + committedFxDate — the "historic real-time value"). From then on, the tracked/cumulative total uses that LOCKED historic USD value — so committed/completed investments are NOT re-inflated or deflated by later FX swings. PENDING / requested amounts convert at the CURRENT real-time rate; COMMITTED amounts use their stored historic rate. (Sandbox/offline fallback: last-known cached rate. The FX API also belongs in the Integrations/APIs bucket.) DIVERGENCE FLAG: forward-design vs oracle (oracle is USD-only, no FX).

CROSS-LINKS — affiliatedCommunity(stakeholder) = applications where the stakeholder is REPRESENTED (representedStakeholderId, the primary) OR LINKED (linkedStakeholders). stakeholderCumulativeUSD(stakeholder) = Σ committed USD of that stakeholder's affiliated decided applications (shown on the stakeholder profile). plan.communityIds links a plan's community investments.

DATA MODEL (per application) — id · name · kind · stage · summary · description · rationale · submitter + submitterRole + dateSubmitted · representedStakeholderId · recipient · linkedStakeholders[] · markets/regions/issues · askType · amount + unit + recurrence (One-time/Annual/Multi-year) + years · timeline · decisionDeadline · budget{total, requested, otherFunding, inKind} · approvedAmount · dateApproved · licenseToOperate (0–10) · relationshipImpact (0–10) · risk{reputational, legal, conflictOfInterest(+conflictDetail), attestation} · attachments[] · votes{userId->for|against|abstain} · owners · createdBy/At · updatedAt · givingMode (Monetary/In-Kind/Mix, Corporate Giving) · site · state · geography. FORWARD-DESIGN adds: currency (USD/MXN/CAD) · monetizedValue · committedFxRate + committedFxDate · approverId + approvedAt.

================================================================
ORACLE GROUND TRUTH (archive/src/community.jsx + community-modal.jsx) — exact formatters, labels, defaults, validation, constraints, and section order. USD-ONLY, no FX.

moneyK FORMATTER (compact, used in the rollup strip) — v = Number(n) || 0; if v >= 1000000 -> "$" + (v/1000000).toFixed(v % 1000000 === 0 ? 0 : 1) + "m" (no decimal when an even number of millions, else one decimal); else if v >= 1000 -> "$" + Math.round(v/1000) + "k" (rounded thousands); else "$" + v. money(n) FORMATTER (full) = "$" + (Number(n)||0).toLocaleString().

isDecided(stage) = stage === "Approved" || "Active" || "Complete" (single source of truth for both the card label and the rollups).

approvedLabel(app) -> { text, tone }: if stage === "Declined" -> { "Declined", "neg" }; else if !isDecided(stage) -> { "TBD", "muted" }; else appr = Number(approvedAmount)||0; if appr <= 0 -> { "No Expense", "muted" }; else { money(appr), "pos" }. Tone -> color: pos var(--pos), neg var(--neg), muted var(--ink-3) (card) / var(--ink-3) (profile uses alColor likewise). communityEntryAmount(a): if unit === "USD" -> approvedLabel(a).text; else if a.amount -> a.amount + " " + (a.unit||""); else "-".

valueScore(app) = (licenseToOperate||0 + relationshipImpact||0) / 2, 0–10 (already captured — keep). The VALUE BAR renders a .comm-value-bar with inner span width = (vs * 10) + "%" (vs is the 0–10 score, so 10 -> 100%); shown alongside as vs.toFixed(1) (card) or vs.toFixed(1) + " / 10" (profile + modal).

VOTE CONTROL — vote(appId, choice): toggles votes[currentUser.id]; if the current value equals choice it is deleted (toggle off), else set to choice. The control SUPPORTS for | against | abstain and the card COUNTS all three (counts = { for:0, against:0, abstain:0 }; Object.values(votes).forEach(v => counts[v]++)). BUT the card only RENDERS for + against buttons: "for" button (icon chevronUp, title "Align / support") and "against" button (icon chevron, title "Object"), each showing its count + .on when it is myVote. ABSTAIN is countable but has NO card affordance (no button) — it can only be cleared/set elsewhere.

FY ROLLUPS (USD, fiscal-year aware) — fsMonth = appConfig.fiscalStartMonth || 1; fsDay = appConfig.fiscalStartDay || 1. fyStartYear(dateStr): d = new Date(dateStr); m = d.getMonth()+1, day = d.getDate(), y = d.getFullYear(); return (m > fsMonth || (m === fsMonth && day >= fsDay)) ? y : y-1 (null for empty/invalid). curFY = fyStartYear(now).
- allocInFY(a, fy): appr = Number(approvedAmount)||0; if !isDecided(a.stage) || appr <= 0 -> 0; startFY = fyStartYear(a.dateApproved || a.createdAt); if startFY == null -> 0; n = (recurrence === "Multi-year") ? Math.max(1, Number(years)||1) : 1; Multi-year -> (fy >= startFY && fy < startFY + n) ? appr/n : 0; Annual -> (fy >= startFY) ? appr : 0; One-time (else) -> (fy === startFY) ? appr : 0.
- requested = Σ over ALL community of (unit === "USD" ? Number(amount)||0 : 0) — i.e. raw USD-unit ASK amount only (non-USD units contribute 0; uses amount, NOT approvedAmount).
- approved = Σ over ALL community of (Number(approvedAmount)||0) WHERE isDecided(stage).
- annual = Σ allocInFY(a, curFY).
- cumulative = Σ (allocInFY(a, curFY) + allocInFY(a, curFY-1) + allocInFY(a, curFY-2)) — this FY + 2 prior.
Rollup strip (toolbarRight): "Requested {moneyK(requested)}" · "Annual {moneyK(annual)}" · "3YR Total {moneyK(cumulative)}".

MODAL BLANK DEFAULTS (CommunityModal blank, new application) — id uid("ca"); name "" ; kind "Philanthropy"; stage "Idea"; summary/description/rationale ""; submitter = currentUser.id; submitterRole = currentUser.title; dateSubmitted = today (new Date().toISOString().slice(0,10)); representedStakeholderId ""; recipient ""; linkedStakeholders []; markets/regions/issues []; askType "Funding"; amount 0; unit "USD"; recurrence "One-time"; years 1; givingMode "Monetary"; timeline ""; decisionDeadline ""; dateApproved ""; budget { total:0, requested:0, otherFunding:0, inKind:"" }; approvedAmount 0; licenseToOperate 5; relationshipImpact 5; risk { reputational:"", legal:"", conflictOfInterest:false, attestation:false }; attachments []; votes {}; owners [currentUser.id]; createdBy currentUser.id; createdAt/updatedAt today. (Edit deep-copies existing via JSON parse/stringify.)

MODAL VALIDATION (missing array; valid = empty) — REQUIRED: name (trim) · summary (trim) · recipient (trim) · description (trim) · rationale (trim, "Why this, why now") · submitter · dateSubmitted · timeline (trim) · amount > 0 (Number) · years >= 1 · >=1 market · >=1 region · >=1 issue · >=1 connected stakeholder (linkedStakeholders) · owners · budget.total > 0. CONDITIONAL: givingMode required ONLY when kind === "Corporate Giving"; conflictDetail required ONLY when risk.conflictOfInterest is true; attestation (risk.attestation) always required. attachments are genuinely OPTIONAL. Missing readout: page toolbar "{N} left"; modal foot "{N} field(s) left: {first 3, comma-joined}{ellipsis if >3}". Save/Create button disabled until valid.

FIELD CONSTRAINTS — description: textarea maxLength 1500 with a LIVE counter "{len}/1500"; rationale: textarea maxLength 500 with live counter "{len}/500". amount / years / budget.total / budget.requested / approvedAmount / budget.otherFunding: number inputs (years has min="1"). dateSubmitted / decisionDeadline / dateApproved: type="date" inputs. The two value sliders (licenseToOperate, relationshipImpact): type="range" min 0 max 10 step 1.

unit ENUM (hard-coded in the modal select) = "USD" · "hours" · "" (label "n/a"). kind options from D.COMMUNITY_KINDS; stage from D.COMMUNITY_STAGES; givingMode from D.GIVING_MODES; askType from D.ASK_TYPES; recurrence from D.RECURRENCE.

MARKETS / REGIONS — ChipMultiSelect (multi-select chip toggle, .filter-chip with .on). Markets options = Object.keys(D.MARKETS). Regions options = d.markets.flatMap(m => D.MARKETS[m] || []) — derived from the CHOSEN markets; when options is empty it shows "Pick a market first". SITE pick (modal): selecting a site with a state sets BOTH site and state (set("site", id); set("state", s.state)); state select shows D.STATE_ABBR labels over D.US_STATES; geography from D.GEOGRAPHIES.

dateApproved CONDITIONAL — the "Date approved" field renders ONLY when stage is in Approved / Active / Complete; helper text "Sets the fiscal year this commitment counts toward."

representedStakeholderId — labelled "Stakeholder / Organization Targeted"; a single-select with "None" default + all stakeholders (displayName). On the profile it is shown as "Targets".

attachments — seeded as [] but NO attachment UI is built (stub; no upload/list control exists in the modal).

stakeholderCumulativeUSD(stakeholderId, community) = Σ over affiliatedCommunity(stakeholderId) of (Number(approvedAmount)||0) WHERE isDecided(stage) && appr > 0 — a PLAIN USD sum, NO FX (forward-design would lock historic rates here, but the oracle does not).

CommunityProfile (read-only "completed" card / page) SECTION ORDER — badges (KindBadge + givingMode tag when Corporate Giving + stage text) -> summary -> "Overview" (Recipient; Targets = the represented stakeholder as a clickable pill, when present; Submitter + " · {submitterRole}"; Submitted = dateSubmitted) -> "The ask" (Support = askType; Amount = money/unit + " · {recurrence}{ · N yr if years>1}"; Approved = approvedLabel colored; Timeline + " · decide by {decisionDeadline}" when set) -> "Description" (when present) -> "Why this, why now" = rationale (when present) -> "Alignment" (value bar + "{vs.toFixed(1)} / 10"; Issues Tags; Markets joined; Regions joined; Stakeholders = linked pills, clickable) -> "Budget" (Total cost = money(budget.total); Requested = money(budget.requested); Other funding when truthy; In-kind when truthy) -> "Owners" (OwnersDisplay). asPage variant = the sheet-wrap/plan-review-doc shell with a toolbar (back "Community" + "Edit engagement"); modal variant = veil + community-modal.profile-modal.

DEEP-LINK BRIDGE — window.__pendingCommunityId: if set and a matching entry exists, open it read-only (setViewId), then clear the global. (The plan equivalent is window.__pendingPlanId.) Used from a stakeholder profile page to open a specific community entry.

LANDING (CommunityView, via shared LandingView) — filterDefs: kind/"Type" · issues/"Issues" · markets/"Markets" · regions/"Regions" · stage/"Status"(||"Idea") · year/"Year created". sortFields: name/"Name" · stage/"Status" · _updated/"Last updated" · _created/"Date added". searchKeys ["name","recipient","summary"] (filter also matches issues). cols: Engagement (name) · Type (kind) · Recipient · Amount (communityEntryAmount) · Status (comm-stage-text colored by STAGE_COLORS[stage].fg) · Markets (joined) · Regions (joined) · Site (D.siteLabel). newLabel "New application"; emptyText "No applications yet. Create one to begin." Footer: "{community.length} applications · Value is the average of two inputs: how much the engagement improves your license to operate and how much the engagement strengthens relationships." Row click -> open read-only profile.

KIND_COLORS (card/profile KindBadge pills, { bg, fg }) — Philanthropy #DDE7C2/#2f5a26 · Volunteering #C2D9E8/#23496e · Corporate Giving #E8DEC2/#6e5419 · Political Action (PAC) #E5D0D0/#7a2424 · Sustainability #C9E3CC/#2f5a26 · Social Impact #DCD3E0/#4F3F69; fallback var(--bg-2)/var(--ink-2). STAGE_COLORS ({ bg, fg }) — Idea #E1E1DA/#54524A · Proposed #EEE6D2/#6E5419 · Under Review #E8DEC2/#6e5419 · Approved #DDE7C2/#2f5a26 · Active #C2D9A4/#2f5a26 · Complete #D9DEE8/#2E3F66 · Declined #E5D0D0/#7a2424. (Status text on cards/landing uses only the .fg.) REBUILD: every hex above maps to --ui-sys-* tokens; do NOT inline hexes.

RECORD SECTIONS (record.community.edit, the modal in order) — "Project overview" (name; kind + stage 2-col; givingMode when Corporate Giving; summary) · "Applicant & sponsor" (submitter select [non-system users; picking one sets submitterRole to that user's title] + submitterRole input 2-col; dateSubmitted; "Stakeholder / Organization Targeted") · "The ask" (askType + amount + unit 3-col; recurrence + years + decisionDeadline 3-col; timeline) · "Description & rationale" (description 1500 + rationale 500) · "Beneficiary & relationships" (recipient; "Connected stakeholders" via StakeholderPicker typeahead chips, helper "Link supporters, opponents, and decision-makers from your map.") · "Strategic alignment" (two value sliders + value-score bar; Issues via IssueSelector; markets + regions chip multiselect 2-col; site + state + geography 3-col) · "Resources & budget" (total + requested + approvedAmount 3-col; dateApproved when committed-stage; otherFunding + inKind 2-col) · "Risk & compliance" (reputational; legal; conflictOfInterest checkbox + conflictDetail when checked; attestation checkbox) · "Owners" (MultiOwnerPicker).

RETARGET UI BUILD-MAP TO CANONICAL UI (ui-*) — the old code uses raw <select>/.designed-select, hand-built .comm-value-bar / .comm-vote-btn / .filter-chip, .tag pills, type="range", checkboxes. REBUILD ONLY with Canonical UI: ui-select for kind/stage/givingMode/askType/unit/recurrence/submitter/site/state/geography; ui-text-field/ui-textarea (with char-counter slot) for text + number + date fields; ui-slider for the two value inputs; ui-chip / ui-chip-set for markets/regions multiselect and issue/kind/stage badges; ui-autocomplete for the StakeholderPicker, Connected-stakeholders, and community linker; ui-checkbox for conflict/attestation; ui-progress (or a token-driven bar) for the value score; a for/against/abstain ui-button vote group; a MANAGER-ONLY Approve action. NEVER md-*/shadcn, never raw <select>/<span>/<div> as UI primitives, never inline hexes — all kind/stage colors come from --ui-sys-* tokens.` },
            { t: "Workspaces — the team's working surface (segment/BU scope, workHQ, Setup sub-page, roles)", d:
`WORKSPACES (the Setup sub-page) — the team's working surface. A workspace pairs a SEGMENT with a BUSINESS UNIT and owns a set of assigned stakeholders. Component SetupView(props). Wrapper "setup-wrap"; a toolbar is portaled into explainerSlot (the app's header explainer region); the body is a scroll of segment-grouped workspace cards; a footer; plus a create modal, an edit modal, and a delete-confirm dialog.

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
WorkspaceModal(open, mode, ws, users, currentUser, onClose, onSave, segMap). SEG = (segMap with keys) || D.SEGMENTS; segments = Object.keys(SEG). On open: draft = (mode==="edit" && ws) ? {...ws} : blank. Returns null when !open.
  Header: a SegmentBadge (small) of draft.segment + h2 "New workspace" / "Edit workspace"; close button (Icon "close").
  Body fields:
    - "Workspace name" — text input (autoFocus), placeholder "e.g. GA&PP - North America".
    - A 2-col grid: "Segment" select (options = segment names; onChange resets businessUnit as above) and "Business unit" select (options = bus = SEG[draft.segment] || []).
    - A 2-col grid: "Scope (optional)" select — options "None" (value ""), "National", "State". CONDITIONAL: only when draft.scope==="State", a "State" select appears in the 2nd column: placeholder "Select state…", options = D.US_STATES, each option value = the state name, label = D.STATE_ABBR[state] || state (shows the 2-letter abbrev).
    - "Owners" — helper "Add as many people as need ownership. They'll see this workspace in their open tabs." + a MultiOwnerPicker (shared component; size 28) bound to draft.owners.
    - A "Created by {currentUser.name} on {formatCreated(createdAt)}" line (create mode) or "Created by {creator name} on {createdAt}" (edit mode, creator resolved from ws.createdBy).
  Footer: Cancel; primary "Create workspace" / "Save changes" (disabled when !valid).
  submit(): edit mode → onSave({name, segment, businessUnit, scope, scopeState, owners}); create mode → onSave({...draft, name: draft.name.trim()}).
  → Canonical UI: ui-dialog, ui-text-field, ui-select (segment/business unit/scope/state), MultiOwnerPicker (shared primitive), ui-button.

=== DERIVATION (markets/regions/counts are COMPUTED, not stored) ===
marketsByWs (useMemo over stakeholderWorkspaces + stakeholders): for each [stakeholderId, list-of-wsIds] in stakeholderWorkspaces, look up the stakeholder; for each wsId in its list, accumulate m[wsId] = { markets:Set, regions:Set } adding st.market and st.region. So a workspace's markets/regions are the UNION of the market/region of every stakeholder assigned to it. NOT a stored field.
countByWs (useMemo over stakeholderWorkspaces): m[wsId] = number of stakeholders whose list includes wsId. Stakeholder-count per workspace, derived.
TOOLBAR FILTER OPTIONS: Markets filter options = Object.keys(D.MARKETS). Regions filter options = [...new Set(Object.values(D.MARKETS).flat())] (flattened unique regions across all markets). Segments filter options = Object.keys(SEGMAP).
CORRECTION: there is NO sort control anywhere in Setup (remove any prior "+ sort" claim). Ordering is by segment group, then the workspaces' natural order.

=== TOOLBAR (portaled into explainerSlot) ===
A "sheet-toolbar" with:
  • Search box ("search": search Icon + input), placeholder "Search workspaces…", bound to the search state. Matches w.name OR w.businessUnit OR w.segment (each lowercased includes q).
  • Three filter buttons, each a "filter-button-wrap" with a toggle button + a "filter-popover" (width 240) of checkable options ("cat-opt", " on" when selected, each a check Icon + label):
      - "Segments" → segFilter[] (options = segment names). "Clear all" resets.
      - "Markets" → marketFilter[] (options = Object.keys(D.MARKETS)).
      - "Regions" → regionFilter[] (options = flattened unique regions).
    Opening one popover closes the others. Each button shows a "filter-count" badge when its filter is non-empty and " filter-active" class.
  Filtering pipeline on visibleWorkspaces (after visibility): if segFilter.length keep w where segFilter.includes(w.segment); if marketFilter.length keep w where its derived markets intersect marketFilter; if regionFilter.length keep w where its derived regions intersect regionFilter; then the search filter.
  → Canonical UI: ui-text-field (search), ui-button + ui-menu/ui-sheet popovers with ui-checkbox/selectable list rows, ui-chip count badge.

=== MEMBER VISIBILITY ===
isManager = currentUser?.role === "manager". memberWorkspaces = workspaces where (w.owners||[]).includes(currentUser.id). visibleWorkspaces = (isManager || showAll) ? ALL workspaces : memberWorkspaces. A showAll toggle (state, default false) flips a member to seeing ALL workspaces. (Managers always see all.)

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
  formatCreated(iso): if no iso "-"; parse; if invalid return iso; else toLocaleDateString with { month:"short", day:"numeric", year:"numeric" } (e.g. "Jun 23, 2026").
  → Canonical UI: a ui-card; SegmentBadge / count / dates as ui-chip/labels; MultiOwnerPicker shared primitive; ui-icon-button for delete. count's mono font becomes a tabular-numerals token (no separate mono family per design law).

=== FOOTER ===
A "sheet-footer comm-footer": a grid Icon + "<strong>{workspaces.length}</strong> workspaces"; a "·"; then muted copy: "Workspaces pair a segment with a business unit. Assign stakeholders from the Master pool to any number of workspaces."

=== ASSIGNMENT MUTATION ===
toggleAssignment(stakeholderId, wsId): cur = stakeholderWorkspaces[stakeholderId] || []; next = cur.includes(wsId) ? cur without wsId : [...cur, wsId]; setStakeholderWorkspaces({...stakeholderWorkspaces, [stakeholderId]: next}). This is how a stakeholder is added to / removed from a workspace (the membership map is keyed by stakeholder id → array of workspace ids). The derived marketsByWs/countByWs both read this map.

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

CANONICAL UI: all of the above maps to ui-* components (ui-card, ui-dialog, ui-text-field, ui-select, ui-button, ui-icon-button, ui-chip, ui-menu/ui-sheet, ui-snackbar). NEVER md-*/shadcn. Segment/Geography color literals → tokens. Shared primitives (MultiOwnerPicker, ConfirmDialog, Avatar) are specified in the shared-primitives box; referenced here by name only.` },
      { t: "App shell & routing — the top-level frame (nav, tabs, login gate, command bridge, explainer bars)", d:
`THE TOP-LEVEL WIRING [CODE — archive/src/app.jsx]. This is the frame every screen renders inside: the auth gate, brand bar, fixed nav-tab row, the per-view content switch, the bottom workspace-tab strip, and all the global bridges (command palette, @-mentions, keyboard). Captured here exhaustively so a cold rebuild reconstructs the shell with the old file gone. CANONICAL UI mapping is stated per element (ui-app-shell / ui-app-bar / ui-tabs / ui-sidebar / ui-dialog / ui-icon — NEVER md-*/shadcn).

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

══ NAV_TABS (the fixed top tab row) ══
NAV_TABS is an ordered array of { id, label, icon } (+ a hideWhenMaster flag on one). EXACT contents:
  { id: "sheet",     label: "Lists",     icon: "table" }
  { id: "scoring",   label: "Scoring",   icon: "sliders", hideWhenMaster: true }
  { id: "map",       label: "Map",       icon: "target" }
  { id: "plan",      label: "Plans",     icon: "plan" }
  { id: "community", label: "Community", icon: "community" }
  { id: "setup",     label: "Workspaces",icon: "work" }
  { id: "help",      label: "Help",      icon: "help" }
Icon-name translation to Material Symbols ligatures for ui-icon at rebuild (the old icon strings are component aliases): table→table (Lists) · sliders→thumb_up (Scoring) · target→map (Map) · plan→description (Plans) · community→favorite (Community) · work→work (Workspaces) · help→help (Help). Render each as <ui-icon> inside a <ui-tabs> tab.
• visibleNavTabs = NAV_TABS.filter(t => !(t.hideWhenMaster && isMaster)) — Scoring is HIDDEN whenever the active workspace is Master.
• REDIRECT: an effect — if (isMaster && activeView === "scoring") setActiveView("map") — kicks you to Map if you were on Scoring and switch to Master.
• The Scoring tab shows a count badge (class count count-alert) when unscoredCount > 0 (count of stakeholders with no score row from the current user's team-member id).
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

══ TAB-STRIP STATE MACHINE (bottom workspace tabs) ══
State:
• openWorkspaceIds — useState default [MASTER_ID, "ws-gapp-na", "ws-gapp-emea"] where MASTER_ID = "__master".
• activeWorkspaceId — useState default MASTER_ID.
• tabsExpanded — useState false (stacked vs spread).
Derived:
• isMaster = activeWorkspaceId === MASTER_ID.
• isStacked = openWorkspaceIds.length > 1 && !tabsExpanded — when collapsed AND more than Master open, the non-Master tabs are HIDDEN and only the Master tab renders (renderTab(MASTER_ID,0,true)); a fan toggle surfaces to expand. When expanded, ALL open tabs render.
• visibleStakeholders (useMemo): master → all stakeholders; else stakeholders whose stakeholderWorkspaces[s.id] includes activeWorkspaceId.
Actions:
• openWorkspaceTab(wsId): add wsId to openWorkspaceIds if absent → setActiveWorkspaceId(wsId) → setActiveView("sheet").
• activateWorkspaceTab(wsId): setActiveWorkspaceId + setActiveView("sheet") (no add).
• closeWorkspaceTab(wsId, e): e.stopPropagation; MASTER_ID is NEVER closable (early return). idx = openWorkspaceIds.indexOf(wsId); remaining = filter out wsId; setOpenWorkspaceIds(remaining); if it was active, ACTIVE-FALLBACK = remaining[Math.max(0, idx-1)] || MASTER_ID (the tab to its left, else Master) → setActiveView("sheet").
Tab rendering (renderTab):
• MASTER tab: ui-icon "table" + label "Master" + muted count "· {stakeholders.length}"; active when activeWorkspaceId===MASTER && activeView==="sheet"; title "Master pool - all stakeholders. Cannot be closed."
• WORKSPACE tab: a seg-dot colored by segmentColor(w.segment) (Personal Systems #2E3F66 · Printing #682E45 · Corporate Investments #2F5A26 · Corporate Functions #6E5419 · fallback #7A7164) + name + muted count "· {count}" (count = stakeholders whose stakeholderWorkspaces includes this ws) + a close button (ui-icon "close", calls closeWorkspaceTab).
Fan toggle: shown when openWorkspaceIds.length > 1; toggles tabsExpanded; icon "double-left" when expanded (collapse), "double-right" when collapsed (expand); titles "Collapse open workspaces" / "Expand to see open workspaces".
"Open workspace" button (ui-icon "plus" + label) opens the OpenWorkspaceModal.
Tab-bar META (right-aligned): "Updated {formatDateLong(...)}" — COMPUTED. On Master: the MAX (latest) of all stakeholders' and workspaces' (updatedAt || createdAt), sorted, last one. On a workspace: that workspace's (updatedAt || createdAt). null → formatDateLong handles empty.
Build the strip with ui-tabs / ui-bottom-bar styling; tabs are real components, close = ui-icon-button.

══ OpenWorkspaceModal (the "Open a workspace" picker) ══
A modal (build as ui-dialog, width ~560). Header "Open a workspace" + close ui-icon-button. Body groups every workspace BY SEGMENT (segments = Object.keys(D.SEGMENTS)); each group headed by a SegmentBadge (small); within, each workspace is a button row showing: name · "{businessUnit} · {count} stakeholder(s)" (count = stakeholders whose stakeholderWorkspaces includes w.id; singular/plural on count===1) · a CTA reading "Switch to" if the workspace is ALREADY in openWorkspaceIds, else "Open →" (is-open class on the row when open). onPick(w.id) → openWorkspaceTab + close. Footer: "Cancel" + a primary "Create new workspace" (ui-icon "plus") that closes the modal, opens the new-workspace modal, and switches to the setup view.

══ BRAND BAR (Row 1) ══
Build with ui-app-bar. Left: brand mark (cfg.brandIcon image if set, else ui-icon "brandmark") + app name (cfg.appName || "Stakeholdr"); clicking brand goes Home (setActiveWorkspaceId MASTER + activeView sheet). Next: the WORKSPACE SELECTOR dropdown (ws-selector) — shows "All / Master" on master, else SegmentBadge + workspace name + businessUnit; opens a menu listing every workspace (name + segment, openWorkspaceTab on click) ending with "+ New workspace…" (accent-colored; opens setup + new-ws modal). Right utility cluster: the "Saved · 1m ago" stub (below), a UserStack (max 3, opens UserListPopup), and the profile button (Avatar with ring) that toggles ProfileMenu (Edit profile / Messages / Settings[manager-only] / Log out).

⚠️ "Saved · 1m ago" IS A HARDCODED STUB — the literal string in the brand-bar utility cluster; it is NOT computed and does NOT reflect real save state. DISTINCT from the bottom tab-bar's "Updated {formatDateLong(...)}" which IS computed from real updatedAt/createdAt. At rebuild: drop the stub or wire it to real persistence state.

⚠️ DEV "SCAFFOLDS" MENU (brand-bar dropdown, dev-only) — a scaffold-selector dropdown labeled "Dev / Scaffolds" exposing one item "Sample record" (sub "read + edit shell") that sets activeView "record-sample" → SampleRecord. INTENTIONALLY DROPPED at rebuild (developer scaffold, not product).

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
After the tabs + spacer: (1) the explainer toggle (when hasExplainer); (2) a "Create new" ui-icon "plus" button shown for activeView in [sheet, scoring, plan, community, setup] — on setup it opens the new-workspace modal, otherwise it bumps addNonce + sets addNonceFor=activeView (a per-view "open create flow" signal the view watches); (3) a "Messages" ui-icon "message" button toggling the messaging sidebar, with a msg-badge showing unreadCount when > 0.
• unscoredCount (useMemo): count of stakeholders with no score row from currentTeamMember.id (currentTeamMember = team.find(m => m.userId === currentUser.id)); isUnscoredBy(shId, tmId) = !(scores[shId]||{})[tmId]. unreadCount = unscoredCount > 0 ? unscoredCount : 0.

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

══ OTHER STATE/UPDATERS PASSING THROUGH THE SHELL (pointers — owned by their domain boxes) ══
deleteStakeholder (removes from stakeholders + deletes scores[id] + stakeholderWorkspaces[id]); updateStakeholder/updateScore/updateTeam/updateWorkspace/removeWorkspace (cascades to stakeholderWorkspaces + plans + open tabs + active fallback)/updateCommunityApp (upsert by id)/updatePlan (upsert by id, one plan per workspace)/deletePlan; messaging sendMessage/startConversation (DM dedupe by participant pair)/messageUser. A guard effect re-points selectedId/detailId to the first stakeholder if the current one was deleted. The detail DRAWER (right slide-over) edits a stakeholder's identity/relationship/position inline. These are captured fully in the Lists / Scoring / Plans / Community / Messaging boxes; listed here only to show they are wired from the shell.

══ CANONICAL UI BUILD MAP ══
ui-app-shell = the whole frame · ui-app-bar = brand bar (Row 1) · ui-tabs = nav-tab row (Row 2) and bottom workspace-tab strip (Row 4) · ui-sidebar = IntelPanel / messaging sidebar / detail drawer hosts · ui-dialog = OpenWorkspaceModal, CommandPalette, EditProfileModal, StakeholderModal, UserListPopup · ui-icon = every glyph (Material Symbols ligatures per the translation table above) · ui-icon-button = close/create/message/fan-toggle controls. No md-*, no shadcn, no hand-rolled glyphs.` },
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
            { t: "Settings — manager-only org config hub (9 oracle panes + Integrations as forward-design) + the design dashboard", d:
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
  → Canonical UI: each swatch = a small ui-button/ui-chip color tile; the hex input = ui-text-field; the live preview = a token-tinted swatch. The chosen color writes a token (accent → --ui-sys-accent equivalent; brand → app-icon background).

BeakerColorField(value, onChange): a single shared component. Renders a span "beaker-color" whose CSS color = value (so the glyph is tinted to the current color), containing the Material Symbol ligature "science" (a flask/beaker glyph; classes "material-symbols-outlined msym beaker-glyph") and a hidden native <input type="color" value={value}> overlaid on top that opens the OS color picker; its onChange fires onChange(e.target.value). title "Pick a custom color". This is the custom-color escape hatch beyond the 7 swatches. In Canonical UI: a ui-icon "science" tinted to the value, wrapping a hidden type=color input (or a ui-color-field GAP if built) — the flask glyph is the affordance, the OS picker is the mechanism.

— Section "Theme" (seg-substack) — a "settings-grid":
• "Choose One" — a "theme-choices" row of 3 theme-swatch buttons (class "theme-swatch", " active" when (appConfig.theme || "soapbox")===id). Default theme is "soapbox". Each button: a "theme-circle" span (background = preview bg) containing a "theme-circle-dot" span (background = preview dot), a "theme-name", a "theme-sub"; the button carries a CSS custom prop "--theme-border" set to the border value. The 3 themes, with EXACT preview values:
    - id "soapbox",    label "Soapbox",     sub "Warm beige",     bg "#ECE8DD", dot "#FAF8F2", border var(--ink-3)
    - id "undecideds", label "Undecideds",  sub "True greyscale", bg "#E6E6E8", dot "#F1F1F3", border "#7A787E"
    - id "nightshift", label "Night Shift", sub "Warm charcoal",  bg "#262624", dot "#52504A", border "#C2C0B6"
  onClick → updateAppConfig({theme: id}). FLAG → tokens: theme selection should drive the token set (each theme = a token theme; preview bg/dot/border are token-sourced, not literals, in the rebuild).
• "Auto-switch to Night Shift" — a "theme-auto-row":
    - A Yes/No toggle (class "yesno-toggle", role="group") of two buttons: "Yes" (class " on" when appConfig.autoNightShift truthy) sets autoNightShift:true; "No" (" on" when falsy) sets autoNightShift:false.
    - WHEN autoNightShift is true, reveal a 3-part time picker ("theme-time-group"). The stored value appConfig.nightShiftAt is a 24-hour "HH:MM" string, DEFAULT "21:00". It is split into hh/mm; H=parseInt(hh); ampm = H>=12 ? "PM" : "AM"; h12 = (H%12===0 ? 12 : H%12). Three "designed-select" dropdowns:
        · hour ("theme-time-hr"): options 1..12 (the twelve integers), value h12.
        · minute ("theme-time-min"): ONLY two options, "00" and "30", value mm.
        · AM/PM ("theme-time-ap"): options "AM","PM", value ampm.
      A compose(nh12, nmm, nap) recombines: h = nh12 % 12; if nap==="PM" h += 12; then updateAppConfig({ nightShiftAt: String(h).padStart(2,"0") + ":" + nmm }). So e.g. 9 / 30 / PM → "21:30"; 12 / 00 / AM → "00:00"; 12 / 00 / PM → "12:00".
  → Canonical UI: Yes/No = a ui-switch or 2-button segmented ui-button group; the 3 selects = three ui-select.

— Section "Time Zone" (seg-substack) — a "settings-grid", one "designed-select":
• Label "Record timestamps in". value appConfig.timeZone, DEFAULT "America/Los_Angeles". The 8 options, [value, label]:
    ["America/Los_Angeles","Pacific (PT)"], ["America/Denver","Mountain (MT)"], ["America/Chicago","Central (CT)"], ["America/New_York","Eastern (ET)"], ["UTC","UTC"], ["Europe/London","London (GMT/BST)"], ["Europe/Berlin","Central European (CET)"], ["Asia/Tokyo","Japan (JST)"].
  Helper: "Created, updated, and approved timestamps are recorded in this time zone." A spacer div fills the 2nd grid column. → ui-select.

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
TAGS SLUG TRANSFORM (this is the ONLY caller that passes a transform): s.trim().toLowerCase().replace(/\\s+/g,"-").replace(/[^a-z0-9-]/g,"") — i.e. trim, lowercase, collapse whitespace runs to single "-", then strip every char not in [a-z0-9-]. So "Public Affairs!" → "public-affairs". Issues/Goals/Functions/Categories/Segments/Markets are PLAIN-trim only (NOT slugified).

=== PANE "management" (rail "Team Management") ===
TWO sections: Invite Code, then Roles (seg-substack).
• "Invite Code" — Intro: "Share this code with people joining your organization on Stakeholdr. They enter it when creating their account to be added to your team. Regenerate to invalidate the old code." Renders <InviteCode code={appConfig.inviteCode} onRegenerate={(c)=>updateAppConfig({inviteCode:c})} />.
  InviteCode(code, onRegenerate) — display = code || "STKH-7XQ4-9KMP" (placeholder when unset). Shows the code in a <code class="invite-code-value">, then two buttons:
    - "Copy": navigator.clipboard.writeText(code); sets copied=true; after 1500ms resets. Icon flips "content_copy" → "check"; label flips "Copy" → "Copied" for 1.5s.
    - "Regenerate" — EMAIL-ONLY. It does NOT regenerate anything client-side. It opens a modal (askOpen) titled "Request a new invite code" whose body reads: "To regenerate your organization's invite code, email contact@stakeholdr.com. We'll issue a new code and invalidate the old one." (the email is a mailto link to contact@stakeholdr.com with subject "New invite code request"). Modal footer: a "Close" button and an "Email us" mailto button. CORRECTION to any prior over-claim: the Regenerate button itself performs NO client-side regeneration and does NOT invalidate the code — invalidation happens server-side after the user emails support. onRegenerate is wired but never invoked by this UI.
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
IssueSettings(issues, onChange, placeholder, addLabel, transform). A flat list-of-strings editor used by Issues, Tags (with slug transform), Goals, Functions. State: draft (string). norm(s) = transform ? transform(s) : s.trim().
  Render: an "issue-settings-list" of existing items, each a "tag" span with the text and a "×" remove affordance (onClick removes that item: onChange(issues.filter(i=>i!==v))). Then an "issue-settings-add" containing one input.
  COMMIT BEHAVIORS (all four callers):
    - onChange of the input: if the typed value contains a comma, split on ",", pop the tail; for each leading part run norm(), filter out empties, and for each not already present push it (onChange([...issues, s])); set draft to the tail. (So typing or pasting "a, b, c" commits a and b, leaves "c" as the live draft.)
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
  Below all blocks, a "segset-add" with one input bound to newSeg, placeholder "New {SEG} name, add with a comma or Enter", Enter → addSegment.
  addSegment(): t = newSeg.trim(); if empty OR segments[t] already exists → clear, no-op (dedupe); else onChange({...segments, [t]: []}) (new level-1 with empty unit list); clear.
  addUnit(seg, unit): t = unit.trim(); if empty OR (segments[seg]||[]).includes(t) → no-op (dedupe within parent); else onChange({...segments, [seg]: [...(segments[seg]||[]), t]}).
  removeUnit(seg, unit) / removeSegment(seg): immutable add/delete.
  UnitAdder(onAdd, label): a small input ("segset-unit-input"), placeholder "+ {label}", Enter → onAdd(value) then clears. (Adds one level-2 unit under its parent.)
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
The catalogs are NOT one appConfig blob. SettingsView receives them as SEPARATE props each with its own updater:
  companyIssues/updateCompanyIssues, companyTags/updateCompanyTags, companyFunctions/updateCompanyFunctions, companyMarkets/updateCompanyMarkets, companySites/updateCompanySites, companySegments/updateCompanySegments, companyCategories/updateCompanyCategories, companyGoals/updateCompanyGoals.
Only the identity/theme/timezone/fiscal/inviteCode values live on appConfig (updated via updateAppConfig({...})). Roles use updateUserRole(id, "member"|"manager"). currentUser supplies the self-demote guard and (upstream) the manager gate.

CANONICAL UI: all controls map to ui-* components (ui-text-field, ui-select, ui-switch, ui-button, ui-chip, ui-dialog, ui-data-table/ui-list, ui-nav-rail, ui-icon "science"/"search"/"check"). NEVER md-*/shadcn. One styling surface = --ui-sys-* tokens; the brand/accent/theme/zone literals captured here become tokens, not inline colors, in the rebuild.` },
            { t: "Users & People — user model, roles, presence, avatars/stack/profile, removeUser cascade", d:
`USERS & PEOPLE (users.jsx) — the user model and its presentation surfaces: avatars, presence, profile menu, login gate, edit-profile, manager badges, and (cross-referenced) the removeUser cascade.

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
  (The shared-primitives box owns the full Avatar/UserStack/UserListPopup/OwnersDisplay capture; this box references Avatar by name for the user-facing surfaces.)

=== LOGIN (LoginView) ===
Reads persisted appConfig for the brand mark before anyone signs in: loginBrand = { brand: cfg.brand || "#024AD8", brandIcon: cfg.brandIcon || null }. LOGIN DEFAULT BRAND COLOR = "#024AD8" (fallback when no appConfig).
  Fields: name, title, email, photo (dataURL), color (default "#B5552C"). valid = name.trim() && email.trim() && /@/.test(email) (email must merely CONTAIN "@").
  THE 8-COLOR PALETTE (avatar color choices, shared by Login AND EditProfile): ["#B5552C","#D26A6A","#3E7A2E","#4F3F69","#2A6FDB","#B07E1F","#682E45","#5A8F8F"]. DEFAULT avatar color = "#B5552C" (the first). Swatches shown only when no photo uploaded.
  Photo upload: file input accept image/* → FileReader.readAsDataURL → setPhoto(dataURL). A live preview circle shows the photo (cover) or the chosen color with abbrev(name) (or "··" before a name is typed).
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
  DEMO ACCOUNTS: a row of chips = STAKEHOLDER_DATA.USERS.slice(0,5) (the first 5 seeded users), each a "login-sample-chip" with an Avatar (size 24) + the user's first name (u.name.split(" ")[0]); clicking → onLogin(u) directly.
  → Canonical UI: ui-text-field (name/title/email), ui-button (upload/submit), the 8 swatches as small color ui-buttons, demo chips as ui-chip; brand mark uses the app icon.

=== ProfileMenu ===
ProfileMenu(open, anchor, user, onClose, onEditProfile, onMessages, onSettings, onLogOut, isManager). Header: Avatar size 46 + name (500/14px) + title + email + (if isManager) a ManagerBadge.
  TITLE SPLIT: if the title CONTAINS a comma AND title.length > 24, split at the FIRST comma into TWO muted lines: t.slice(0, i).trim() and t.slice(i+1).trim(). Otherwise render the title as a single muted line.
  Items (each "profile-menu-item"), in order: "View profile" (Icon "user") → onEditProfile; "Messages" (Icon "message") → onMessages; "Settings" (Icon "build") → onSettings — RENDERED ONLY when isManager (managers only); divider; "Log out" (Icon "logout", class "logout") → onLogOut.
  → Canonical UI: a ui-menu anchored to the avatar; items = ui-list/menu items with ui-icon leading glyphs.

=== EditProfileModal ===
EditProfileModal(open, user, onClose, onSave, companyFunctions). draft = user (reset on user change). Returns null if !open || !user.
  Fields: photo (file → FileReader dataURL → draft.avatarUrl) with the SAME 8-color palette fallback (shown when no avatarUrl); first name / last name (2-col row); title; work email; Function; Markets; Regions.
  FIRST/LAST fallback: firstName defaults to (name.split(" ")[0]); lastName defaults to (name.split(" ").slice(1).join(" ")) when the explicit field is null.
  Function: a select, placeholder "Select a function…", options = companyFunctions (the Individual Functions catalog from Settings). value draft.function.
  Markets: chips ("filter-chip", " on" when selected) from Object.keys(STAKEHOLDER_DATA.MARKETS); toggling adds/removes the market in draft.markets.
  Regions: a chips block that appears ONLY when draft.markets has >= 1 selected. Options = draft.markets.flatMap(m => STAKEHOLDER_DATA.MARKETS[m] || []) — i.e. the union of the regions belonging to the SELECTED markets. This is the MARKET → REGION CASCADE: pick markets first, then their regions become selectable. Toggling adds/removes in draft.regions.
  SAVE: fn = explicit firstName or split-of-name[0]; ln = explicit lastName or rest-of-name; merged = {...draft, firstName: fn, lastName: ln, name: [fn, ln].filter(Boolean).join(" ").trim() || draft.name} — i.e. NAME IS RECOMPOSED from first+last on save. onSave(merged); onClose.
  → Canonical UI: ui-dialog, ui-text-field (names/title/email), ui-select (Function), ui-chip toggles (Markets/Regions), ui-button (upload/save). 8 swatches as color ui-buttons.

=== ManagerStar / ManagerBadge / UserName ===
ManagerStar(size=12, title): a filled Material Symbol "star". CSS: fontSize = size + 4; color "#E0A21A" (amber); fontVariationSettings "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" (FILLED, weight 500). aria-label/title "Manager". FLAG #E0A21A → a manager/amber token in the rebuild. → ui-icon "star" filled, amber token, size+4.
ManagerBadge(): a "manager-badge" pill = ManagerStar(size 10) + "Manager". → a ui-chip with leading star icon.
UserName(user, size=12): CURRENTLY renders ONLY user.name (a plain span; the size prop is accepted but unused; no star is appended here). Note this for fidelity — the star appears via ManagerStar/ManagerBadge elsewhere, not inside UserName.

=== ROLES / PRESENCE ENUMS (canonical) ===
role: "manager" | "member" | "system" (member = UI "User"). presence: "online" | "away" | "offline". The system bot u-system "Reminders" is excluded from every picker, online list, stack, and roles table.

=== removeUser CASCADE (TRACEABILITY) ===
The removeUser cascade (what happens to owned workspaces, stakeholder assignments, messages, etc. when a user is deleted) lives in app.jsx, NOT in users.jsx. users.jsx contains no removeUser. The cascade itself is captured in the App-shell box; this box flags the cross-reference so a cold-session reader looks in app.jsx for the deletion logic.

CANONICAL UI: every user-facing surface here maps to ui-* (ui-menu, ui-dialog, ui-text-field, ui-select, ui-chip, ui-icon, ui-button). NEVER md-*/shadcn. The amber manager color (#E0A21A) and avatar text color (#FAF8F2) become tokens. Shared primitives (Avatar, UserStack, UserListPopup, UserAutocomplete, MultiOwnerPicker, OwnerPicker, ConfirmDialog, OwnersDisplay) are fully specified in the shared-primitives box and referenced here by name.` },
      { t: "User profile page (record.user) — hero, tabs, assignment logic", d:
`ProfilePage (archive/src/profile-page.jsx) is the full-page record surface for ONE user (record.user), rendered as a class "single-page". It shows who the person is plus everything assigned to them across four entity classes, each in its own tab with a live count, searchable/filterable/sortable.

PROPS: user (subject), isSelf (bool — is this the logged-in user viewing themselves), currentUser, users, workspaces, plans, community, stakeholders, scores, team, stakeholderWorkspaces (map stakeholderId -> [workspaceId]), getWorkspacesForStakeholder, onEdit, onOpenWorkspace, onOpenPlan, onOpenCommunity, onOpenStakeholder. D = STAKEHOLDER_DATA. If no user, render null.

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
- PLAN_STAGE_FG colors migrate to --ui-sys-* status tokens (Idea #54524A, Proposed/Under Review #6E5419, Active #2f5a26, Complete #2E3F66) rather than literal hex in markup.` },
            { t: "Messaging — conversations, threads, @ / # / $ / mention links (built + developer-inferred)", d:
`MESSAGING (oracle: archive/src/messaging.jsx). Two surfaces share ONE conversation+message store, so a message sent in the right-edge sidebar is instantly visible on the full page and vice-versa: (A) MessagingSidebar — a right-edge overlay panel (.messaging-sidebar with a .side-veil scrim; toggles .show); head shows the message icon + "Conversation" when a conv is open else "Messages", plus an expand-to-page button (Icon "expand") and a close button (Icon "close"). With no active conv it renders ConversationList (compact); with one open it shows a "← All conversations" back button, a .messaging-conv-head (ConversationAvatars + title + subline "{n} people · group" or "Direct message"), the MessageThread, and a Composer (placeholder "Reply…"). (B) MessagingPage — full page: left pane (.messaging-list-pane) with "Messages" h2 + a primary "New" button (Icon "plus") + ConversationList; right pane (.messaging-thread-pane) with either an empty state (message icon, "Select a conversation", muted "Or start a new one. Group messages let you bring in multiple teammates.", a primary "New conversation" button) or the open conversation: a .messaging-page-head (ConversationAvatars large + serif 18px 500-weight title + a muted subline: for groups "{n} people · " + comma-joined participant names, else "Direct message"), the MessageThread, and a Composer (placeholder "Message " + conversationTitle).

conversationTitle(conv, users, currentUserId): if conv.kind === "system" → "Reminders". Else if conv.title set → conv.title. Else → the participants minus currentUserId, mapped to each user's name (fallback "?"), joined with ", ".

conversationPreview(messages): if empty/none → { body: "No messages yet", at: null }; else → the LAST message object in the array.

formatTime(iso): if no iso → "". Build a Date. If d.toDateString() === today.toDateString() (same calendar day) → time as "h:mm AM/PM" (toLocaleTimeString with hour "numeric", minute "2-digit", e.g. "3:07 PM"). Otherwise → "Mon D" (toLocaleDateString month "short", day "numeric", e.g. "Jun 3").

ConversationList(conversations, messages, users, currentUserId, activeId, onPick, compact): ORDERING — copy the array and sort: the system conversation (kind==="system") is ALWAYS PINNED to the top (a.kind==="system" → -1; b.kind==="system" → 1); all others sort by most-recent-message timestamp DESCENDING (compare bm vs am where am/bm = last message's .at or "0", via bm.localeCompare(am) — ISO timestamps sort lexicographically). Render .conv-list (adds .compact when compact). Each row is a button .conv-row (adds .active when conv.id===activeId, adds .system for the system conv). Leading element: for the system conv, an .av.av-system circle (28x28, 11px) holding the sparkle brand glyph (Icon "sparkle" class "brand-glyph"); else ConversationAvatars. Body (.conv-row-body): top line (.conv-row-top) = title (.conv-row-title: "Reminders" for system, else conversationTitle) + the time/pending slot (.conv-row-time). Preview line (.conv-row-preview): for the system conv → the pending sentence (below); else → an optional "Firstname: " prefix (only when the last message's author exists AND is not the current user — fromUser.name.split(" ")[0] + ": ") followed by preview.body.
SYSTEM THREAD PENDING COUNT: pending = number of messages in the system conv whose kind === "scoring-needed". The preview text = pending + " stakeholder" + (pending===1 ? "" : "s") + " need scoring" when pending>0, else "All caught up". The pending count renders IN PLACE OF the timestamp: when pending>0 the .conv-row-time slot shows a <span class="conv-row-pending">{pending}</span> badge instead of formatTime(preview.at); when pending===0 it shows formatTime normally.

ConversationAvatars(conv, users, currentUserId, large): others = participants minus currentUserId. size = 36 when large else 28. If others.length===0 → render nothing. If exactly one other OR conv.kind==="direct" → a single <Avatar user=that-user size=size online={user.presence==="online"} />. Else (group) → a stacked element .conv-multi-avatar (width/height = size) containing the FIRST 2 others, each rendered as an Avatar at Math.round(size*0.7) (0.7x). (In a thread, message-author avatars use size 26 — see MessageThread.)

MessageThread(conversation, messages, users, currentUserId): auto-scrolls to bottom on messages.length change (endRef.scrollIntoView block "end"). Empty → .thread-empty.muted "No messages yet. Say hello." Otherwise .message-thread mapping each message m at index i: author = users.find by m.from; isMine = m.from===currentUserId; prev = messages[i-1]. GROUPING: grouped = prev exists AND prev.from===m.from AND (Date(m.at) − Date(prev.at)) < 60000 ms (60 seconds) — i.e. consecutive messages from the same author within 60s are grouped and their avatar + meta header are HIDDEN. Row = div .msg (adds .mine when isMine, .grouped when grouped). When NOT grouped and NOT mine and author exists → an <Avatar size=26>; when grouped and not mine → a 26px-wide spacer span (keeps alignment). Body (.msg-body): when not grouped, a .msg-meta line = author span (.msg-author: "You" when mine, else author.name or "?") + time (.msg-time: formatTime(m.at)). Always a .msg-bubble = renderMentions(m.body). A trailing endRef div anchors the scroll.

MENTION TRIGGERS (MENTION_TRIGGERS map): "@" → { type "stk", src "stakeholders" }; "/" → { type "wsp", src "workspaces" }; "#" → { type "pln", src "plans" }; "$" → { type "cmy", src "community" }. (At-sign = stakeholders, slash = workspaces, hash = plans, dollar = community.)

renderMentions(body): if no body or body has no "{{" → return body unchanged. Otherwise scan with regex /\\{\\{(stk|wsp|pln|cmy):([^|}]+)\\|([^}]*)\\}\\}/g — token format is {{type:id|label}} with type one of the FOUR codes stk/wsp/pln/cmy. Each match becomes a <button type="button" class="mention-chip t-{type}"> containing a <span class="mention-dot" /> then the label, whose onClick calls window.__openMention(type, id) (opens the read-only page for that entity). Plain text between/around matches is preserved.

COMPOSER (this IS built — capture as built, NOT deferred). State: text, mq (the active mention query { trigger, query, start } or null), hi (highlighted match index). A textarea (rows 1, grows; placeholder from prop or "Write a message…") + a primary "Send" submit button (disabled when text is blank). Submit/go: trims text, if non-empty calls onSend(text.trim()), clears text and mq. onType (onChange): set text to value; read caret = selectionStart; take substring up to caret; test it against /([@/#$])([\\w .'-]*)$/ — i.e. one of the four trigger chars followed by zero-or-more of word-chars/space/dot/apostrophe/hyphen, anchored at the caret. On match → mq = { trigger: m[1], query: m[2], start: caret − m[0].length } and hi reset to 0; on no match → mq = null.
MATCH SOURCING: sources = window.__mentionSources() (an object of arrays keyed by src name) or {}. labelFor(type, o): stk → displayName(o) || o.name; pln → o.title; wsp → o.name; cmy (else) → o.name. matches: take MENTION_TRIGGERS[mq.trigger], pull sources[cfg.src] (or []), lowercase the query q; map each option to { id, label: labelFor(cfg.type,o) }, keep those whose label exists and (no query OR label.toLowerCase().includes(q)), slice to UP TO 6, attach type=cfg.type.
KEYBOARD (textarea onKeyDown): when mq is active and matches exist — ArrowDown → hi = (hi+1) % len; ArrowUp → hi = (hi−1+len) % len; Enter OR Tab → pick(matches[hi]) (each prevents default); Escape → close mq. Independent of mentions: Enter without Shift → submit (Shift+Enter inserts a newline).
PICK(o): builds token {{type:id|label}}, splices it into text at mq.start replacing the typed trigger fragment, appends a trailing space, clears mq, refocuses the textarea. The popover (.mention-pop) appears below the field when mq is active and matches exist: each option is a button (.mention-opt, adds .on when i===hi) with a colored dot (.mention-dot.t-{type}) + label; onMouseDown (preventDefault) picks it.

NewConversationModal(users, currentUserId, onClose, onCreate): a modal (.modal with .modal-veil.show scrim) titled "New conversation" + close button. others = all users except currentUserId. State: picked (array of user ids), title (string). isGroup = picked.length > 1.
- Title field: label switches between "Group name (optional)" (when isGroup) and "Title (optional)" (when not); input placeholder switches to "EMEA pre-meeting" when group, else "".
- "Add people (type to search)": a UserAutocomplete over others NOT already picked; choosing an id toggles it into picked. Below, when picked.length>0, a wrap of .picked-chip chips (each: a 20px Avatar + the user's name + an "×" remove affordance .picked-chip-x; clicking the chip toggles/removes that user).
- "Or pick from the list": a .user-picker full checkbox list of every other user — each row (.user-picker-row, adds .picked when selected) = a checkbox (checked = picked includes id; onChange toggles) + a 28px Avatar with online={presence==="online"} + name (12.5px 500) + muted title (11px).
- Footer: "Cancel" button (onClose) + a primary "Start conversation" button DISABLED until picked.length>=1 (i.e. at least one participant); on click calls onCreate(picked, title.trim() || null). The page wires onCreate → startConversation(participants, title) → setActiveConversationId to the new id → close.

BUILD-MAP (Canonical UI, ui-* only — NEVER md-*/shadcn). Conversation list → ui-list (each conv-row a list item with leading avatar/avatar-stack, trailing time-or-pending badge as a ui-chip/count). Thread bubbles → tokened surfaces (mine vs other = different --ui-sys surface roles, never inline color). Composer → a ui-text-field (multiline) plus a ui-button primary "Send"; the mention popover → a ui-menu/autocomplete anchored to the field. Mention chips (rendered + in-popover) → ui-chip variants keyed by type token (t-stk/t-wsp/t-pln/t-cmy map to distinct --ui-sys accent/zone tokens, never inline hex). New-conversation → ui-dialog containing a ui-autocomplete (add-by-search), ui-chip removable chips, and a ui-list of ui-checkbox rows; the "Start conversation" action is a ui-button disabled until >=1 picked. Avatars/avatar-stacks and the presence dot are shared primitives (see the Shared UI primitives box). No ad-hoc styling, no shadows beyond the shipped ramp.` },
            { t: "Persistence & realtime — the ONE transport boundary (Store now · Supabase swap · the traps)", d:
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

THE STORE TODAY [BUILT] — window.Store over localStorage + BroadcastChannel:
• Namespace PREFIX "hpsm:"; SCHEMA_VERSION ("v9") stamped at "hpsm:__schema" (verKey = PREFIX + "__schema") — bump it to wipe ONLY our namespace on a breaking change. The migration runs at Store init: if localStorage.getItem(verKey) !== SCHEMA_VERSION, every key starting with PREFIX is removed, then the new version is stamped (wrapped in try/catch).
• load(table, seed): read persisted JSON (PREFIX + table) or fall back to seed (and persist the seed so the table exists for other tabs).
• save(table, value, silent): write JSON + broadcast { table, value } on BroadcastChannel("hpsm-sync"); silent skips the broadcast (used when applying a change that arrived FROM another tab, to avoid an echo loop).
• subscribe(table, cb): register a per-table listener (subs[table] is a Set); returns an unsubscribe.
• reset(): clear the namespace (hard "reset demo data") + re-stamp the version.
• THE EVENT SHAPE { table, value } IS EXACTLY what a Supabase postgres_changes subscription delivers — chosen so the transport swap needs no UI change. The channel (when BroadcastChannel exists) is one BroadcastChannel("hpsm-sync") whose onmessage destructures { table, value } and fires every subscriber for that table (guards: return if !table).
• usePersistentState(table, seed): useState seeded from Store.load; an effect persists on change (save); a subscribe effect applies incoming changes; a skipPersist ref (a useRef) prevents re-broadcasting a change that arrived from elsewhere (the subscribe callback sets skipPersist.current = true before setValue; the persist effect sees it, clears it, and returns without saving).
• ids: window.uid(prefix) (collision-resistant for concurrent multi-user creates). window.nowStamp() = full ISO timestamp (new Date().toISOString()); date-only fields (lastContact) keep YYYY-MM-DD.

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
• hp_map_col_order_v2 — this user's Lists column-order/arrangement preference. ⚠️ DISCREPANCY: the Lists box currently says v3, but the LIVE code (archive/src/app.jsx + project/db.js) uses v2. The captured truth is v2; reconcile the Lists box to v2 (or deliberately bump to v3 at rebuild and record the migration). Do NOT silently ship two different keys.
• hp_map_user — THIS-TAB currentUser session (the logged-in user for this browser tab). Written on logIn / profile-save, removed on logOut, read on boot. Per-device by design — at rebuild this becomes the Supabase Auth session, not a localStorage blob.

cmdKeyLabel [exported from store.js] — a platform-aware command-palette shortcut label: "⌘K" on Mac/iOS, "Ctrl K" elsewhere. Computed from /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent). It FEEDS the command palette open-hint and the global search hints (so the displayed shortcut matches the user's platform). Keep it exported and single-sourced — both the palette and any search affordance read this one value.

appConfig START-STATE DEFAULTS (the live seed passed to usePersistentState("appConfig", …)):
  { appName: "Stakeholdr", accent: "#024AD8", brand: "#000000", fiscalStartMonth: 11 /* Nov */, fiscalStartDay: 1 }
FULL persisted appConfig KEY SET the app actually reads (with fallbacks to data.js catalogs when absent): appName, accent, brand, fiscalStartMonth, fiscalStartDay, segments, categories, markets, sites[], issues, tags, functions, orgGoals. (Also brandIcon — optional app-icon data URL, read by the brand mark.) Settings writes each via updateAppConfig({ key: next }).
⚠️ SCHEMA DIVERGENCE TO RECONCILE AT BACKEND BUILD: the SQL app_config table (Database schema box / project/db.js) OMITS several of these columns. The SQL has app_name, accent, brand, brand_icon, fiscal_start_month, fiscal_start_day, issues[], functions[], segments(jsonb), categories(jsonb), invite_code — it is MISSING tags, markets, sites, org_goals, and it renames the audience taxonomy (categories vs the runtime "categories"; an earlier draft used audience/org_goals). Net gaps to add to app_config at backend build: tags text[], markets jsonb, sites jsonb (the { id, city, state?, country } site rule), org_goals text[] (orgGoals). Do NOT lose these — they are live config keys the UI reads today.

SYNCED ENTITIES (each = one usePersistentState table = one Supabase table) — stakeholders · scores · team · workspaces · stakeholderWorkspaces (join) · users · conversations · messages · community · plans · appConfig. PER-DEVICE, NOT synced: currentUser (hp_map_user, this tab's session) and the column-order preference (hp_map_col_order_v2). Exact shapes live in their domain boxes; scores = { [stakeholderId]: { [teamMemberId]: {x,y,createdAt,updatedAt} } }; stakeholderWorkspaces = { [stakeholderId]: [workspaceId,…] }; messages = { [conversationId]: [{id,from,body,at,kind?}] }; appConfig keys per the set above. Every mutable record carries createdAt + updatedAt.

THE SUPABASE SWAP (one file: the Store) — save → supabase.from(table).upsert(changedRow); delete → supabase.from(table).delete().eq('id', id); subscribe → a per-table postgres_changes channel whose callback fires the SAME (table, value=row) shape; apply the incoming ROW into the in-memory collection BY ID (merge — never replace the whole array). The React layer does not change at all. The full SQL schema + RLS + the realtime-swap snippet live in the "Database schema" box IN THIS GUIDE (the old store.js/db.js/BACKEND_TODO files are archived at rebuild — the .io is the only source).

⚠️ TRAP #1 — ROW-LEVEL WRITES (the easy-to-forget killer). TODAY save() persists the WHOLE collection array, which is last-write-wins across users (A edits sh-03, B edits sh-07 at once → second save clobbers the first). When wiring Supabase, EVERY mutation must write only the CHANGED ROW (upsert/delete by id), not the array. Scores: write only the one (stakeholder × teammate) row that changed (PK = stakeholder_id + team_member_id) — never the whole scores object. Use updatedAt for last-modified-wins or a version check for stricter merge. Affected updaters (must each become row-scoped): updateStakeholder, updateWorkspace, updateCommunityApp, updatePlan, updateScore, updateTeam, addStakeholder, addWorkspace, addTeamMember, removeWorkspace, removeUser, removeTeamMember, and the messaging/conversation writers.

⚠️ TRAP #2 — REAL AUTH + RLS. The demo auto-promotes EVERY login to manager (remove that). Roles come from the users table / Supabase Auth, not from login. Wire Supabase Auth (email or SSO) → map to a users row. Enforce RLS (client gating is cosmetic only): scores writable only for the user's own team-member rows; workspace delete restricted to created_by OR manager; appConfig + users.role writable only by managers; plans/community writes scoped to owners/team.

OTHER BACKEND-PHASE ITEMS (captured here, owned by their areas) — COUNTRY LIST: replace the static COUNTRIES snapshot with ISO-3166 (REST Countries API or a countries table); keep the site rule { id, city, state?, country } with US sites forcing country="United States". PRESENCE: the online-avatar stack + People sidebar must be REAL (Supabase Realtime Presence or a last_seen heartbeat), with a TRUE +N overflow, excluding the system bot — not the static presence seed. (The universal custom dropdown is a UI item, captured in the component vocabulary, not persistence.)

REALTIME UX — a change in one place (e.g. a message sent in the sidebar) appears live everywhere (the page, other tabs, other users) because every consumer subscribes to its table. Same code path local or via Supabase.` },
      { t: "Enterprise state model — the universal record envelope (audit · time · timezone · versions · soft-delete)", d:
`This is the CROSS-CUTTING model wrapped around EVERY entity (stakeholders, plans, community, workspaces, users, scores, messages, notes, votes, …). Captured ONCE here and inherited by all domain boxes so no entity is missed. Source tags: [CODE] in the current app · [SETTINGS] configurable · [SPEC] the user's enterprise requirement, NOT yet in code (capture or it is lost) · [STD] standard enterprise pattern, proposed.

IDENTITY [CODE] — every row has a stable uuid id (crypto.randomUUID), so concurrent multi-user creates never collide and writes are idempotent/retry-safe.

AUDIT COLUMNS on every mutable row — created_at [CODE], created_by [CODE], updated_at [CODE], updated_by [SPEC — add]. WHO + WHEN for every create and every change.

TIMESTAMP PRECISION [SPEC/FIX — critical] — ALL timestamps stored as UTC ISO-8601 to the MILLISECOND (Postgres timestamptz). The current code is INCONSISTENT — nowStamp() is full ISO but some writers store DATE-ONLY (toISOString().slice(0,10)); that MUST become full millisecond everywhere, because simultaneous edits need distinct, strictly-orderable stamps or they break/clobber. Date-only is allowed ONLY for genuine calendar fields (lastContact, decisionDeadline).

TIME ZONE [SETTINGS] — appConfig.timeZone (default America/Los_Angeles, manager-set). Rule: STORE every timestamp in UTC; DISPLAY in the org time zone. "Created, updated, and approved timestamps are shown in this time zone." Quarters/rollups/cadence compute against it too.

FISCAL MODEL [CODE] — appConfig.fiscalStartMonth + fiscalStartDay → the fiscal YEAR and four equal QUARTERS (see Cadence box). Drives community rollups, scoring cadence, history snapshots, and "FY## Q#" labels. Quarter boundaries derived, never hardcoded.

EDIT VERSIONS / "TIME CAPSULE" [SPEC — add, not in code] — every record change is VERSIONED into a per-record history you can view and RESTORE over time (an audit trail / time machine). Implementation: an APPEND-ONLY versions/audit-log row per change { entity, row_id, changed_by, changed_at(ms), field-or-diff, before/after } (Tier-2 append → no clobber, full history forever). Viewing = read the row's version list; restore = write a prior version FORWARD as a new change (never destructive). This is an enterprise feature in its own right — capture its UI later (per-record history panel).

SOFT DELETE [STD] — deleted_at + deleted_by instead of hard delete: deletes/replacements propagate in realtime, stay recoverable, and preserve history; lists filter out soft-deleted rows. (Hard delete only where FK cascade + no recovery need.)

OPTIMISTIC CONCURRENCY [STD, per Persistence] — a per-row version (or the ms updated_at) is the conflict token: a write carries the version it read; a newer server version REJECTS it → client re-reads/re-applies. Combined with the THREE-TIER model (records column-level / append-only inserts / collaborative-doc CRDT) and ms precision, simultaneous work CONVERGES instead of overwriting.

APPLIES UNIFORMLY — these columns/mechanisms are added to EVERY entity's schema and to the Store's write path once, not re-decided per feature. The Database-schema box's per-table SQL inherits this envelope (extend each table with created_by/updated_by/updated_at-ms/deleted_at/deleted_by + the versions/audit table).

⚠️ NOT EXHAUSTIVE YET — the user has flagged there is MORE enterprise backend/state detail than the above ("so much else"). This box is the FRAME; it must be filled out completely from the user's enterprise spec before rebuild. OPEN: enumerate every remaining backend/state field, rule, and solution (see the request in chat) and capture each here verbatim — do NOT invent or assume.` },
      { t: "Enterprise architecture — the full solution (demo-first → production), 20 pillars", d:
`What X / Facebook / Slack / Todoist / Claude all needed to be real products — mapped to Stakeholdr. DEMO-FIRST: ship the Demo (seed org + sample users + stakeholders, FULL capability, add dummy AND real people, no backend) → then flip ONE switch to Production (Supabase). Full developer spec: docs/ENTERPRISE_ARCHITECTURE.md (this is the readable outline; that is the build handoff).

1. PRINCIPLES — one data layer; server = source of truth; optimistic UI; multi-tenant; everything auditable.
2. TWO STATES + SWITCH — Demo (localStorage/BroadcastChannel, seeded) ↔ Production (Supabase); one env flag; identical component code.
3. TENANCY — organizations (tenants); every row carries org_id; memberships(org_id,user_id,role); invite code STKH-XXXX-XXXX / SSO domain; seats + add-on entitlements.
4. IDENTITY & AUTH — Supabase Auth: email/password, magic link, SSO/SAML/OIDC (enterprise), optional MFA; remove demo auto-manager.
5. AUTHORIZATION & RLS — roles manager/member/workspace-lead/system; RLS enforces tenant isolation + per-row gates (the REAL boundary; UI gating is cosmetic).
6. DATA MODEL — the universal record envelope (id, org_id, created/updated _at/_by ms-UTC, deleted_at/by, version); FK cascades; normalize collections to rows; constraints/checks.
7. STATE/REALTIME/COLLAB — three tiers (records column-level / append-only inserts / collaborative-doc CRDT); Supabase Realtime (postgres_changes + Presence + Broadcast); offline queue.
8. VERSIONING & AUDIT — edit-version "time capsule" (append-only record_versions, restore-forward); immutable audit log; activity feed.
9. ARCHIVES, RETENTION, BACKUP — soft-delete + Archive state; retention/purge; PITR backups; exports (plan→Word/PDF, tables→CSV, org export).
10. FILES & MEDIA — Supabase Storage buckets (attachments, photos, exports, whiteboard); signed URLs; size/type limits; scan; CDN.
11. BACKGROUND JOBS — Edge Functions/cron: fiscal-year rollover (snapshot + rescore prompt), reminders, digests, FX refresh, notification fan-out, purge.
12. NOTIFICATIONS — in-app + transactional email; @-mentions, invites, rescore reminders, vote requests, plan deadlines; prefs + digests.
13. INTEGRATIONS — FX conversion, URL unfurl/oEmbed (whiteboard), ISO-3166 countries; roadmap: LegiScan/Quorum/CRM/marketing/Drive/social; bounded connectors + secrets vault.
14. SEARCH — Postgres full-text (or pgvector) across stakeholders/plans/community/messages/notes, org-scoped.
15. SECURITY & COMPLIANCE — TLS + at-rest encryption; secrets vault; least privilege; SOC 2, GDPR + CCPA (export/delete, DPA, consent), PII handling, data residency; rate limits, validation, CSP, dep scanning.
16. OBSERVABILITY — structured logs, error tracking (Sentry), metrics/uptime/alerting, query perf.
17. PERFORMANCE & SCALE — indexes, pagination/virtualization, connection pooling, caching, no N+1, realtime fan-out limits.
18. BILLING & LICENSING — Stripe per-seat subscriptions, plan tiers, add-on gating (Personas, AI Message Generator), usage metering.
19. ADMIN & SUPPORT — org admin console (members/roles/fiscal/segments/categories/branding/invite/billing); audited support impersonation; feature flags; status page; in-app help.
20. MIGRATIONS, ENVIRONMENTS, TESTING — versioned SQL migrations; demo/staging/prod + CI/CD; the traceability manifest + build-guard + contract/e2e tests + per-feature verification.

This box is the FRAME and the menu; each pillar's detail is in its domain box and in docs/ENTERPRISE_ARCHITECTURE.md. As we capture each module we tie its rows/jobs/permissions back to these pillars.` },
      { t: "Database schema (Supabase) — full SQL + RLS + realtime swap (captured here; source files vanish at rebuild)", d:
`The complete Postgres schema for STATE B (Supabase). Captured verbatim into the .io because db.js will not exist at rebuild — this guide is the only source. Column case: SQL is snake_case; the in-memory/JSON is camelCase (map at the transport boundary). Every mutable table has created_at/updated_at (timestamptz default now()).

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
  invite_code text   -- org join code STKH-XXXX-XXXX (regen = support request) );

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
2. PLANS PER WORKSPACE: an earlier schema draft had workspace_id UNIQUE (one plan per workspace), but the Plans landing shows MULTIPLE plans. Captured here WITHOUT unique (many plans per workspace). Confirm.
3. COMMUNITY: votes are a separate community_votes table (normalized) vs the in-memory votes{} object — the transport maps between them.` },
            { t: "Catalogs — the shared option lists (verbatim) + which are manager-editable", d:
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

ORG_GOALS [EDITABLE: managers, Settings; inherited by every plan as the default goals seed] — the 3 exact seed strings, verbatim:
1. "Defend the company's license to operate across key US markets"
2. "Build trust capital with regulators and community leaders"
3. "Position for upcoming permitting and modernization approvals"
(A new plan starts with these three goals copied in; the plan can then edit/add/remove its own goals.)

PRIORITY [FIXED enum] — High · Medium · Low. STAKEHOLDER STATUS [FIXED enum] — Active · Watch · Dormant.

COMMUNITY [FIXED enums] — KINDS: Philanthropy · Volunteering · Corporate Giving · Political Action (PAC) · Sustainability · Social Impact. STAGES: Idea · Proposed · Under Review · Approved · Active · Complete · Declined. ASK TYPES: Funding · Volunteer hours · Endorsement · In-kind · Political contribution. RECURRENCE: One-time · Annual · Multi-year. GIVING MODES (Corporate Giving): Monetary · In-Kind · Mix.

TITLES (honorifics catalog used by the stakeholder modal's Title dropdown for person-type stakeholders) [FIXED enum] — the exact, ordered list: None · Senator · Representative · Assemblymember · Governor · Mayor · County Supervisor · Councilmember · City Councilmember · CEO · Director · Other. Selecting "Other" reveals a free-text titleOther field where the user types a custom title.
• abbrevTitle map (full → abbreviated form, used when composing a person's display name e.g. "Sen. Jane Doe"): Senator → "Sen." · Representative → "Rep." · Assemblymember → "Asm." · Governor → "Gov." (titles not in this map render their full word; "None" contributes no prefix).

SITES [EDITABLE: appConfig.sites; Settings → Geography] — operating sites { id, city, state? (US only), country }; US sites force country = "United States". Seed: Palo Alto/CA · Houston/TX · Corvallis/OR · Vancouver/WA · Washington/DC.

LOCATION LISTS (verbatim, static — fine to ship as constants except COUNTRIES) —

US_STATES (51 entries; 50 states + District of Columbia), in this exact order:
Alabama · Alaska · Arizona · Arkansas · California · Colorado · Connecticut · Delaware · District of Columbia · Florida · Georgia · Hawaii · Idaho · Illinois · Indiana · Iowa · Kansas · Kentucky · Louisiana · Maine · Maryland · Massachusetts · Michigan · Minnesota · Mississippi · Missouri · Montana · Nebraska · Nevada · New Hampshire · New Jersey · New Mexico · New York · North Carolina · North Dakota · Ohio · Oklahoma · Oregon · Pennsylvania · Rhode Island · South Carolina · South Dakota · Tennessee · Texas · Utah · Vermont · Virginia · Washington · West Virginia · Wisconsin · Wyoming.

MX_STATES (32 entries; 31 states + Ciudad de México), in this exact order:
Aguascalientes · Baja California · Baja California Sur · Campeche · Chiapas · Chihuahua · Ciudad de México · Coahuila · Colima · Durango · Guanajuato · Guerrero · Hidalgo · Jalisco · México · Michoacán · Morelos · Nayarit · Nuevo León · Oaxaca · Puebla · Querétaro · Quintana Roo · San Luis Potosí · Sinaloa · Sonora · Tabasco · Tamaulipas · Tlaxcala · Veracruz · Yucatán · Zacatecas.

CA_PROVINCES (13 entries; provinces + territories), in this exact order:
Alberta · British Columbia · Manitoba · New Brunswick · Newfoundland and Labrador · Northwest Territories · Nova Scotia · Nunavut · Ontario · Prince Edward Island · Quebec · Saskatchewan · Yukon.

STATE_ABBR (US state/territory name → USPS 2-letter code; 51 entries, used by siteLabel and any "City, AA" rendering):
Alabama→AL · Alaska→AK · Arizona→AZ · Arkansas→AR · California→CA · Colorado→CO · Connecticut→CT · Delaware→DE · District of Columbia→DC · Florida→FL · Georgia→GA · Hawaii→HI · Idaho→ID · Illinois→IL · Indiana→IN · Iowa→IA · Kansas→KS · Kentucky→KY · Louisiana→LA · Maine→ME · Maryland→MD · Massachusetts→MA · Michigan→MI · Minnesota→MN · Mississippi→MS · Missouri→MO · Montana→MT · Nebraska→NE · Nevada→NV · New Hampshire→NH · New Jersey→NJ · New Mexico→NM · New York→NY · North Carolina→NC · North Dakota→ND · Ohio→OH · Oklahoma→OK · Oregon→OR · Pennsylvania→PA · Rhode Island→RI · South Carolina→SC · South Dakota→SD · Tennessee→TN · Texas→TX · Utah→UT · Vermont→VT · Virginia→VA · Washington→WA · West Virginia→WV · Wisconsin→WI · Wyoming→WY.

COUNTRIES [REPLACE: do NOT hand-maintain] — a static, sorted 2026 snapshot of sovereign states (UN members + observers, ~195 entries) that ships as a generated constant, NOT a hand-curated literal. It is generated, not transcribed; at production it is replaced by an ISO-3166-1 source (API or table) per the Persistence/Integrations boxes. The list currently excludes nothing (it is the full recognized set as of 2026). The Site "Other country" picker FILTERS OUT United States / Canada / Mexico from COUNTRIES (those three are already first-class region-countries on the Markets→Regions axis), so the picker only offers the remainder. Because it is regenerated from the ISO source at build, the exact 195-element list is NOT load-bearing and is deliberately not transcribed here.

REGION_COUNTRIES (the exact array — region values on the Markets→Regions axis that ARE real countries, used by resolveCountries to bridge the org's region axis to actual countries):
["United States", "Canada", "Mexico", "Brazil", "Japan"].

LOCATION HELPERS (plain-text formulas; single-source these in the location module) —
• siteLabel(site): returns "" if no site. Otherwise renders "City, TAIL" where TAIL = (if the site has a state) STATE_ABBR[state] (falling back to the raw state name if not in the map), else (if it has a country) the country, else "". Result: "City, AA" for US sites (e.g. "Palo Alto, CA"); "City, Country" for non-US sites; bare "City" if neither state nor country is present.
• resolveCountries(regions, site): computes the effective country set for a record by unioning two Venn circles — (1) any entries in regions[] that appear in REGION_COUNTRIES, plus (2) the assigned site's country (look the site up by id in SITES; add its .country if present). Then: if the resulting set is non-empty, return it as an array WITH "Other Countries" removed (a stated concrete region-country overrides the generic "Other Countries"). Else, if regions[] includes "Other Countries", return ["Other Countries"]. Else return [].
• US-site country rule: any US operating site forces country = "United States" (encoded in the SITES seed and enforced when managers add/edit sites in Settings → Geography); US sites carry a state, non-US sites carry a country.

ELSEWHERE (not re-listed here) — the 14 RELATIONSHIP ZONES (color/strategy/action) live in the Relationship-engine box; the PLAN ALGORITHM models + FACTORS live in the Plan-algorithm + Factor-key boxes; the DEMO SEED DATASET (sample stakeholders/users/team/workspaces/scores/etc.) lives in the Demo-seed-dataset box that follows.

USAGE — every dropdown/filter/chip pulls from these. Editable catalogs render as add/remove list editors in Settings; fixed enums are constants. In the build, expose ONE typed catalog module = appConfig (editable) + constants (fixed) + a location module (US_STATES/MX_STATES/CA_PROVINCES/STATE_ABBR/REGION_COUNTRIES/COUNTRIES + siteLabel/resolveCountries).` },
      { t: "Demo seed dataset — shape + canonical sample (fresh fixtures regenerated at rebuild)", d:
`WHAT THIS IS — the demo / STATE-A seed dataset that boots the app with a believable HP, Inc. world (no backend). RULING (the user's call): do NOT transcribe every demo value. The demo fixtures are ILLUSTRATIVE, not app logic — the LOSSLESS part of the app is the LOGIC / CATALOGS / HELPERS (Catalogs box, Relationship-engine, Plan-algorithm, location helpers, scoring math). At rebuild we REGENERATE fresh fixtures of the IDENTICAL SHAPE so the demo is faithful in FORM. This box captures (a) the entity counts + shape, (b) a small CANONICAL SAMPLE captured verbatim where exactness matters (the three Map-history trails + one fully-worked stakeholder record), and (c) what is safe to regenerate.

ENTITY COUNTS + SHAPE —

• STAKEHOLDERS — 20 records, ids sh-01 … sh-20. Each is an identity block; (x, y) map position is NOT stored, it is computed live from SEED_SCORES via weightedCoord. Fields per record: id; isPerson? (true for people; absent for orgs); firstName/lastName/title/titleOther (people only); name (display name); org; email; phone; xAccount (Twitter/X handle); category (one of the 6 CATEGORIES keys); type (an audience type within that category); market / region / geography (the three-axis location replacing the old single region); state?/site? (US records carry a state and/or a site id); issues[] (subset of ISSUES); priority (High/Medium/Low); tags[] (subset of TAGS, may include inline custom tags); owners[] (user ids); lastContact (YYYY-MM-DD); status (Active/Watch/Dormant); notes (free text); history[]? (OPTIONAL quarterly position trail — present on only 3 records; see CANONICAL SAMPLE). The 20 span all 6 categories and the Americas/LATAM/EMEA markets.

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

• MESSAGES — a seed map keyed by conversation id → array of { id, from (userId), body, at (ISO datetime) }. A handful of illustrative messages on c-001 (3), c-002 (2), c-003 (2), c-004 (1); c-system seeded as the automated-reminders channel.

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
            { t: "Record scaffold, landing pages & page shells — the universal layout (LAYOUT IS CRUCIAL)", d:
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

SampleRecord (the neutral live preview used to tune the shell, in the Scaffolds menu) demonstrates the CANONICAL SECTION LAYOUT VARIANTS — each is one section.render mode:
- "Single column" (id prose, icon notes): .record-prose flowing <p> paragraphs + a .record-prose-tags row of .tag chips. (Prose/longform layout.)
- "Field stack" (id fields, icon tune): .record-fields = a vertical stack of MetaFields (Name text, Status select, Summary long, Tags tags).
- "Two column" (id twocol, icon view_column): .record-twocol = two side-by-side .record-fields stacks of MetaFields.
- "Table embed" (id table, icon table_rows): .record-table-embed wrapping the REAL SheetView verbatim — same columns, design, behavior — passed the first 8 stakeholders (D.STAKEHOLDERS.slice(0,8)), seed scores/team/workspaces/users/issues/community, with all mutators as no-ops and isMaster true. LIMITED TO 8 STAKEHOLDERS. This is the embedded ui-stakeholder-table, not a reimplementation.
SampleRecord's rightRail demonstrates the metadata-rail pattern: a "Metadata" .record-rail-sec with read-only mf rows (Created / Updated / Owner) + a "Notes" section with a long textarea (.mf-input.mf-long rows 3). Its toolbar slot = .scaffold-controls: a search box (.search with Icon "search", an input "Search…", a ⌘K kbd hint) + a "Filter" btn + a "Sort" btn. Its footer = "Universal scaffold preview" ... "Updated June 10, 2026".

LandingView(items, searchKeys, filterDefs, sortFields, cols, renderCard, onRowClick, onNew, newLabel, emptyText, gridClass, headerSlot, footerSlot, explainerSlot, toolbarRight) — the SHARED data-grid landing shell used by BOTH the Plan and Community landings. NOTE: landing.jsx is the DATA-GRID landing shell (toolbar + card grid OR profile-style table), NOT a marketing/CTA page — there is NO marketing landing page anywhere in the source. State: search (string), filters ({ defKey: Set(values) }), sort ({ key, dir:"asc"|"desc" }), view ("cards" | "table"), filterOpen, sortOpen. Outer .community-wrap.
- VIEW TOGGLE: a "See all" button toggles view between "cards" and "table" (gains .filter-active when table). cards ↔ table.
- PIPELINE (explicit ORDER: search → filters → sort, industry standard): lowercase query ql; if ql, keep items where any searchKeys[k] stringified-lowercased includes ql. Then for each filterDefs def, if filters[def.key] is a non-empty Set, keep items where valuesOf(def,item) has SOME value in the set. Then if sort.key set, find the sortFields entry, stable-copy-sort by f.get(a) vs f.get(b) (string-lowercased compare) times the direction sign (asc +1 / desc −1).
- valuesOf(def, item): v = def.get(item); if Array → filter truthy, map String (MULTI-VALUE handling — arrays are flattened so a multi-valued field can match any of its values); else if truthy → [String(v)]; else []. distinct(def): the sorted unique set of all values across items (used to populate filter chips). activeFilterCount = total size of all filter Sets. filterDefs/sortFields share a get(item) ACCESSOR CONTRACT — each def/field provides get(item) returning the value(s) to filter/sort on.
- TOOLBAR (.community-toolbar) is rendered via ReactDOM.createPortal INTO the passed explainerSlot DOM node (so the page hosts the toolbar in its own explainer region). Contents: a search box (.search: Icon search + input bound to search + a ⌘K kbd via cmdKeyLabel); a Filter button (.filter-button-wrap; label "Filter" + " (n)" when activeFilterCount; gains .filter-active) opening a .filter-popover with a head ("Filter" + a "Clear all" ghost that empties filters) and a body of one FilterSection per def (label, distinct values, active set, onToggle); a Sort button opening a .filter-popover.sort-popover with "Sort by" + "Clear all" and a SortFieldList; the "See all" view toggle; a flex spacer; then toolbarRight.
- HEADER/FOOTER: headerSlot rendered above the results; footerSlot below.
- RESULTS: if filtered list empty → .comm-empty.muted = emptyText. Else if view==="table" → .landing-table-scroll > a .profile-table.landing-table.landing-table-flex grid: the header row (.profile-trow.profile-thead) and each data row (.profile-trow, onClick → onRowClick(it), cursor pointer, title "Open") use gridTemplateColumns "minmax(180px,2fr) " + one "max-content" per remaining col (FIRST column is a flexible minmax(180px,2fr), the REST are max-content). Each cell = c.render(it) if given else it[c.key]. Else (cards) → a grid (gridClass || "comm-grid") of renderCard(it) per item.
- SLOT/API SURFACE: renderCard(item), onRowClick(item), onNew + newLabel (new-item action), emptyText, gridClass, headerSlot, footerSlot, toolbarRight, explainerSlot (portal target). cols = [{ key, label, render? }].

BUILD-MAP (Canonical UI, ui-* only — NEVER md-*/shadcn). The 3-region RecordShell maps to the scaffold components: ui-app-shell (the page), ui-sidebar (left section-nav rail, collapsible), ui-inspector (right metadata rail, collapsible) around the white center content; the top bar is the ui-app-bar with its toolbar slot. MetaField becomes the field primitive set: read = tokened value/chip, edit = ui-text-field (text/long/date), ui-select (select), ui-chip set (tags) — single field component switching on type. The "Table embed" mode embeds ui-stakeholder-table / ui-data-table verbatim (8-row cap), never a markup table. LandingView's table view → ui-data-table (first col minmax(180px,2fr), rest max-content); the toolbar → ui-app-bar/ui-text-field search + ui-menu filter/sort popovers + ui-chip filter chips; card view → tokened ui cards in a grid. All collapse/toggle states and surfaces come from --ui-sys tokens; sidebars are never white (surface-container), center content is white (surface-card). No ad-hoc CSS, no shadows beyond the shipped ramp.` },
      { t: "Shared UI primitives — the component dictionary (pills, dots, avatars, pickers, icon map)", d:
`SHARED UI PRIMITIVES (oracle: archive/src/components.jsx + archive/src/users.jsx). The small reusable elements every screen composes from. EVERY hex below is a START-STATE value that MUST become a --ui-sys-* token at rebuild (flagged "→token"); no inline hex survives into Canonical UI.

StatusPill(status, size="sm") — a zone pill (.pill, data-zone=status). Background/text come from the STATUSES catalog (Relationship-engine box) — meta.color / meta.text → already first-class --ui-sys-zone-* tokens. borderColor rgba(0,0,0,.06) →token outline. size "lg" = 12px font, padding "3px 10px"; else 11px, "2px 8px".

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

Icon(name, className="ico") — renders a Google Material Symbols (Outlined) ligature glyph: <span class="material-symbols-outlined msym {className}">{ligature}</span>. The app's semantic icon NAME maps to a Material Symbol ligature via the SYMBOLS dictionary; unknown names fall through to the name itself. THE FULL DICTIONARY (semantic name → Material Symbol ligature), VERBATIM:
  search→search, plus→add, filter→filter_list, sort→swap_vert, download→download, close→close, target→map, grid→settings, work→work, table→table_rows, category→category, cases→cases, language→language, beenhere→beenhere, apartment→apartment, check→check, content_copy→content_copy, user→person, users→groups, help→help, map→map, sliders→thumb_up, plan→description, lock→lock, message→chat, expand→open_in_full, logout→logout, edit→edit, chevron→expand_more, chevronUp→expand_less, layers→layers, community→favorite, drag→drag_indicator, chevron-left→chevron_left, chevron-right→chevron_right, double-left→keyboard_double_arrow_left, double-right→keyboard_double_arrow_right, sparkle→auto_awesome, brandmark→id_card, build→build, clock→history, mail→mail, phone→call.
This is the canonical glyph each semantic <ui-icon> uses (e.g. <ui-icon>search</ui-icon> emits the "search" ligature; the "target"/"map" semantic both emit "map"; "sliders" emits "thumb_up"; "plan" emits "description"; "community" emits "favorite"; "brandmark" emits "id_card"; "clock" emits "history").

coordToPct(x,y) — maps user map-coords to CSS percent (the dot layer's 0–100% spans x:−10..10 and y:10..−10): left = ((x+10)/20)*100 + "%"; top = ((10−y)/20)*100 + "%". pctToCoord(leftPct,topPct) is the inverse: x = (leftPct/100)*20 − 10; y = 10 − (topPct/100)*20. components.jsx is the SINGLE SOURCE of these conversions — the Map box consumes them, does not redefine them.

abbrev(name) — 2-letter avatar initials. If no name → "·". Strip a leading honorific (regex ^(Mayor|Rep\\.|Sen\\.|Dr\\.|Mr\\.|Ms\\.|Mrs\\.)\\s+, case-insensitive), trim, split on whitespace. Single word → its first 2 chars uppercased; else → first-letter-of-first-word + first-letter-of-last-word, uppercased.

abbrevTitle(title) — compact political/honorific title for tables; returns input unchanged if no rule. Map: "Senator"→"Sen.", "Representative"→"Rep.", "Assemblymember"→"Asm.", "Governor"→"Gov.".

displayName(s) — builds a stakeholder's shown name from structured fields, falling back to legacy s.name. first = s.firstName trimmed, last = s.lastName trimmed; if both empty → s.name||"". rawTitle = (s.title==="Other" ? s.titleOther||"" : s.title); prefix t = rawTitle ? abbrevTitle(rawTitle)+" " : ""; return (t + first + (last?" "+last:"")).trim(). (feeds the mention typeahead and tables.)

Avatar(user, size=28, ring=false, online=false, onClick, title) — a circular .av (adds .av-ring when ring). FONT BUCKETS by size: size<=22 → 9px; <=30 → 10.5px; <=40 → 13px; else 16px. Text color #FAF8F2 →token (the warm off-white avatar ink). Background: if user.avatarUrl → center/cover no-repeat url(avatarUrl); else user.avatarColor (a per-user color, e.g. palette #B5552C/#D26A6A/#3E7A2E/#4F3F69/#2A6FDB/#B07E1F/#682E45/#5A8F8F →tokenized palette). Content: when no avatarUrl, the abbrev(name) initials. ONLINE DOT (.av-presence) when online: size = max(6, round(size*0.28)); positioned right/bottom = max(1, round(size*0.06)); borderWidth = max(1, round(size*0.05)) — tucked inside the lower-right of the circle. cursor pointer when onClick. tooltip title default = "{name} · {title}".

UserAutocomplete(users, value, onChange, placeholder, clearable, autoFocus, showAvatar) — typeahead person picker. selected = the user whose id===value. As you type, MATCHES filter users by name/title/email (lowercase includes) sliced to MAX 8; with an empty query, the FIRST 8 users. Keyboard: ArrowDown/ArrowUp move hoverIdx (clamped), Enter picks matches[hoverIdx], Escape closes. CLICK-OUTSIDE (mousedown outside the wrap) closes the menu. Picking calls onChange(user.id), clears query, closes. When clearable && selected → a clear "×" button (onChange(null)). When showAvatar && selected && menu closed → a leading 20px Avatar. The menu (.ua-menu) shows "No matches" or each match as a row with a 24px Avatar (online from presence) + name + title.

MultiOwnerPicker(users, owners, onChange, size=26) — a stack of owner avatars (NO names). available = users excluding role==="system" AND already-owners. Renders each owner as a 26px Avatar (online from presence). A "+" add button (.multi-owner-add, size×size) appears ONLY when available.length>0; clicking toggles an inline UserAutocomplete (over available) to add an owner (addOwner appends the id). REMOVE is two-step: clicking an owner avatar ARMS removal (setConfirmRemove, the avatar gains .confirm + an "×" overlay .multi-owner-remove); a SECOND click confirms (removeOwner filters it out); mouse-leaving while armed disarms. Click-outside closes adding+confirm.

OwnersDisplay(users, owners, size=22, label="owners") — READ-ONLY owner avatar stack. If no owners → <span class="muted">-</span>. Else a stack of size-px Avatars; on hover/click a popover (.owners-popover) opens listing each owner: a head "{n} {label}" that SINGULARIZES when n===1 (label.replace(/s$/,"")) e.g. "1 owner" vs "3 owners", then a row per owner = 22px Avatar + name (12.5px 500) + muted title (11px). Click-outside closes.

ConfirmDialog(open, title, body, confirmLabel, cancelLabel, danger, onConfirm, onCancel) — generic confirm modal (.modal.confirm-modal with .modal-veil.show). Head = title; body = body (13px, var(--ink-2), line-height 1.5); foot = a Cancel button (cancelLabel||"Cancel" → onCancel) + a confirm button (confirmLabel||"Confirm" → onConfirm) whose class is btn-danger when danger else btn-primary.

ManagerStar(size=12, title) — an amber filled star glyph: material-symbols "star", fontSize = size+4, color #E0A21A →token, fontVariationSettings "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" (FILL 1, weight 500), aria-label/title "Manager". ManagerBadge() — the amber pill (.manager-badge): a small ManagerStar (size 10) + the text "Manager".

FilterSection(label, values, active, onToggle, render) — a labeled multi-select chip row (used by the List bar, profile tables, and LandingView). If no values → renders nothing. A label (.lbl.filter-pop-label) + .filter-chips: a leading "All" chip (.filter-chip, gains .on when nothing in this section is selected) that CLEARS the section (clicking calls onToggle for each currently-active value), then one .filter-chip per value (gains .on when active includes it; onClick toggles it; render(v) customizes the chip label).

SortFieldList(fields, sortKey, sortDir, onSet) — fields = [{ key, label, type? }]; onSet(key, dir). TYPE INFERENCE (when f.type absent): if key matches /updatedAt|createdAt|lastContact|_updated|_created|date/i → "date"; else if key is "_x" or "_y" or matches /amount|count|weight|score/i → "num"; else → "text". DIRECTION-LABEL PAIRS by inferred type: date → ["Oldest first","Newest first"]; num → ["Low → High","High → Low"]; text → ["A → Z","Z → A"]. Each field is a row (.sort-fieldrow, gains .active when sortKey===key) with a name button (shows a leading "● " when active; clicking sets that field — default new direction "desc" for dates, else "asc"); when active, a segmented direction control (.sort-dir-seg) with the asc/desc labels for the inferred type. (NOTE: when first selecting a DATE field the oracle defaults to "desc" = "Newest first".)

BUILD-MAP (Canonical UI, ui-* only — NEVER md-*/shadcn). At rebuild these become REAL Canonical UI components or are flagged as GAPS to add to design-system/manifest.json (each to the ui-button quality bar):
- PriorityPill / StatusPill / StatusDot / Tags / ManagerBadge → ui-chip variants (priority/status/zone/tag/badge) driven entirely by --ui-sys-* tokens (every hex above tokenized; status dot = a ui-chip with a leading dot slot).
- Icon → ui-icon (Material Symbols ligature; the SYMBOLS dictionary becomes the canonical name→ligature map; sizes from --ui-sys-icon-size-*).
- Avatar → ui-avatar (image/initials, font buckets, presence dot, ring) — GAP to add. Avatar stacks (UserStack, the conv-multi-avatar, OwnersDisplay) → ui-avatar-stack (overlap + "+N" overflow) — GAP.
- UserAutocomplete → ui-autocomplete. ConfirmDialog → ui-dialog (with a danger action variant).
- MultiOwnerPicker / OwnerPicker → ui-owner-picker (avatar-stack + add-via-autocomplete + arm-then-confirm remove) — GAP. OwnersDisplay popover → ui-avatar-stack + ui-menu/popover.
- ManagerStar → ui-icon (filled star token #E0A21A) + ManagerBadge = ui-chip "Manager". Count/overflow badges ("+N", pending count) → a ui-badge/count primitive — GAP.
- FilterSection / SortFieldList → ui-chip groups + a ui-menu/segmented control inside the filter/sort popovers; the "All" clear-chip and direction segments are token-driven, not ad-hoc. coordToPct/pctToCoord stay pure functions (single source for the Map box), not components. No inline hex, no shadows beyond the shipped ramp, no md-*/shadcn.` },
            { t: "Help — the engagement framework + how to read the map + zone key/strategy reference", d:
`HELP SCREEN (oracle: archive/src/help.jsx — HelpView). This is the static "How to read this" reference page. It reads STAKEHOLDER_DATA (D) for STATUS_ORDER, STATUSES, and GRID — every color/strategy/action shown here is single-sourced from the Relationship-engine box (the STATUSES catalog); this page only RENDERS them, it does not define them. The page is a centered reading column (outer .help-wrap, inner .help-inner) holding EXACTLY FIVE rendered blocks beneath an opening prelude: prelude + (1) framework funnel + (2) how to read the map (spectrum + three help-cards) + (3) the 24-zones grid + (4) strategy reference + (5) how scores become coordinates.

PRELUDE (.help-prelude > p) — VERBATIM, with three emphasized words wrapped in <em>:
"Stakeholders exist in a public square where IDEAS are exchanged, your CREDIBILITY is won or lost, and VALUE is created, shared, or squandered."
(the words IDEAS, CREDIBILITY, and VALUE are each italic <em>; everything else is plain.)

BLOCK 1 — THE FRAMEWORK FUNNEL.
Heading (.help-title): "How to plan for and engage stakeholders".
A funnel figure (.engage-funnel) of three arrow stages (.funnel-arrows holding .funnel-arrow .funnel-1/.funnel-2/.funnel-3), labeled in order: "Purpose", "Plan", "Execute". Beneath, three columns (.funnel-cols > three .funnel-col), each holding four steps (.funnel-step; the first step of each column carries .funnel-step-lead). The TWELVE steps, verbatim and in order (these are the same 12 steps captured in the Plan box — referenced here, NOT redefined; the Plan box is the authority):
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
Intro paragraph, verbatim (with bold x and y): "Stakeholders are plotted on a two-axis grid: X measures impact on the business (do they work with you or against you?), Y measures their influence in the community. The combination determines the relationship strategy." (the letters x and y are bold <strong>.)
The grid figure (.help-grid-figure > .grid-body): D.GRID is iterated flatMap over rows then cells; each cell is a .zone div with background = STATUSES[status].color, text color = STATUSES[status].text, holding a .zone-label (font-size 11.5) showing the zone name. GRID is the 4-wide by 6-tall (24-cell) status matrix from the data layer (the Relationship-engine box owns GRID and the 14 distinct zone definitions — this page only paints them; do NOT re-list the 14 here).
Below the grid, a full-width axis legend strip (.map-axis-legend, marginTop 12) with three spans: left (justifySelf start) "← Works against you"; center (justifySelf center) "↑ Greater community influence  ·  ↓ Less community influence"; right (justifySelf end) "Works with you →".

BLOCK 4 — STRATEGY REFERENCE (.help-grid-section).
<h2> "Strategy reference".
Paragraph, verbatim: "For every zone, a stakeholder's position on the map returns recommended posture and identifies suggested immediate actions your team can take."
Then a two-column grid (gridTemplateColumns "1fr 1fr", gap 10) of cards, one per name in D.STATUS_ORDER. Each card: border 1px solid var(--rule), borderRadius 10, padding "12px 14px", background var(--paper), an inner grid "8px 1fr" gap 12 align-items start. Left cell is an 8px-wide full-height color spine (borderRadius 4, background = STATUSES[name].color). Right cell: a header row (flex, gap 8) of the zone name in bold 13px + a muted "·" separator (11px) + the strategy in italic (12px, color STATUSES[name].text = meta.strategy); below it a muted line (12px, line-height 1.45) = meta.action. (strategy and action text come from the STATUSES catalog — Relationship-engine box.)

BLOCK 5 — HOW SCORES BECOME COORDINATES (.help-grid-section).
<h2> "How scores become coordinates".
Paragraph, verbatim (note the literal minus sign characters −10 and the × symbol used later): "On the Scoring tab, every teammate rates each stakeholder on x and y from −10 to 10. Each teammate also has a weight. The final coordinate is the weighted average of their scores. A teammate with weight 1.5 counts 1.5 times more than one with weight 1.0."
Then a <pre> formula block (styled: background var(--bg-2), border 1px solid var(--rule), borderRadius 8, padding "12px 14px", monospace via var(--mono), 12px, color var(--ink-2), margin 0, overflowX auto) containing exactly these three lines (plain text — Greek Sigma for summation, × for multiply, ÷ implied by the slash):
  final.x = SUM( member.x * member.weight ) / SUM( member.weight )
  final.y = SUM( member.y * member.weight ) / SUM( member.weight )
  zone    = lookup( final.x, final.y )
(In the oracle these render with Σ and ×; the math is: weighted mean of each axis over team members, then the (x,y) pair is looked up against GRID to name the zone.)

BUILD-MAP (Canonical UI, ui-* only — NEVER md-*/shadcn). Render this as a ui-* page shell MINUS the right inspector rail (this is a reading page, no metadata rail): use the standard app-shell/sidebar content region with a single centered reading column. The spectrum strip and any zone-key swatches are ui-chip swatches tinted from the --ui-sys-zone-* tokens (the 14 zone colors are first-class tokens — never inline hex). The 24-zone 4x6 grid is the SANCTIONED tokened inline SVG, drawn identically to the Map box's grid so the two surfaces stay visually consistent (same cell fills from --ui-sys-zone-*, same proportions). Titles use the Newsreader title typeface token; body uses Inter. The formula <pre> becomes a tokened code/quote surface (no mono family is shipped — render it in the body face at a fixed/tabular setting or as a plain bordered panel; do NOT introduce a mono token). Help-cards become tokened panels (ui surface-card on the runway), bullets as ui-list. No gradients, no shadows beyond the shipped elevation ramp, no ad-hoc color.` },
      { t: "Design system — RULED: Canonical UI (design-system/) is the go-forward; shadcn/Tailwind plan superseded (history preserved)", d:
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
      { t: "Demo features (client-side) — Excel import + template, export, onboarding, mobile companion", d:
`Buildable in STATE A (demo, no backend), seeded with sample users + stakeholders, full capability, add dummy AND real people.

IMPORT STAKEHOLDERS FROM EXCEL/CSV (+ DOWNLOADABLE TEMPLATE) —
• DOWNLOAD TEMPLATE: an Excel/CSV with EVERY stakeholder/table column as a header (the 26 Lists columns — Stakeholder, Organization, Category, Type, Market, Region, Geography, State, Sites, Issues, Priority, Tags, Owner, Email, Phone, X account, Last contact, Status, Notes, Website, Community, etc.).
• COLUMN BEHAVIOR IN THE TEMPLATE (this is what prevents breakage):
  - CHOICE-LIMITED columns (values restricted to one of OUR catalogs) MUST be DROPDOWNS (Excel data validation), so the user can't misspell, re-capitalize, or reformat a value: Category, Type, Market, Region, Geography, State, Site, Priority, Status, Issues, Tags, Owner. Values come from the Catalogs.
  - CASCADING dropdowns where a column is a CHILD of a parent: Type depends on Category; Region depends on Market; Site→State. The template enforces dependent validation (child options follow the chosen parent) — exactly the in-app cascades.
  - COMPUTED / LINKED columns (filled by linkage in-app, not a dropdown) — Relationship/zone, x, y, Community investment, and audit fields — carry an INSTRUCTION: "LEAVE BLANK — computed in the app." On re-import these blanks are IGNORED and must NOT interrupt/abort the import.
  - FREE-TEXT columns (Stakeholder, Organization, Email, Phone, X, Website, Notes) accept entry with format hints (email, phone (xxx) xxx-xxxx). Multi-value (Issues/Tags/Owners) use a clear delimiter (e.g. semicolon), each value validated against its catalog.
• WHY: dropdowns + cascades + blank-computed rules eliminate the misspellings, inconsistent casing/wording, and number/format drift that otherwise break the app on import.
• FLOW: download template → fill → upload → auto column-map (match headers) → VALIDATE (every dropdown value matches a catalog; cascades valid; dates/numbers parse; computed columns ignored) → PREVIEW (flag any invalid rows) → COMMIT (creates stakeholders; if imported from a workspace, auto-assigns to it; mints UUIDs + audit fields). Invalid catalog values are rejected/flagged pre-commit, never silently coerced.

EXPORT — plan → single Word/PDF (see Plan box); table → CSV (see Lists box); the template above is the import counterpart.

ONBOARDING TOUR — coachmarks on first run; replayable from the profile menu.

EMPTY / SEED STATES — blank-org vs demo-data seed; empty states per page; bulk actions; soft-delete/archive (per Enterprise model).

MOBILE COMPANION (the one mobile surface) — a modal/responsive view: stakeholder quick-view · add-note · messages. (Earmarked mobile; everything else is desktop-web.)

INTEGRATIONS SHELL — the Settings → Integrations pane (embed/FX/country/connectors) — shell now, live wiring in State B.

UI KIND (built later; blocks + tokens) — import = a Dialog/wizard (upload dropzone, column-map table, validation/preview table with row flags, commit button) from shadcn + TanStack; template = generated XLSX with data-validation dropdowns + a hidden lookup sheet for cascades. Visual cues per the Design system + scaffold.` },
      { t: "Paid add-ons — Polling, Personas, AI Message Generator, billing & gating", d:
`The monetized layer, gated per org entitlement. Locked (with an upgrade affordance) until enabled; once on, they appear in their host surfaces.

POLLING (plan element 8) — stakeholder surveys: a question set posed to N recipients + results as insight themes (see Plan worked-example reference for the starter questions/results pattern). Feeds Personas + the Plan-Fit signals. Premium.

PERSONAS (plan element 9) — persona modeling per stakeholder CATEGORY, built from polling + listening sessions + consumer data: one named archetype per category, each with Demographics · Awareness & Concerns · Perspective on the org · Engagement Willingness (see worked-example reference). Sharpens the relationship-recommendation signals. Premium.

AI MESSAGE GENERATOR — takes a FINISHED plan → generates KEY MESSAGES (plan element 13). Server-side (Claude API), with a curated PRE-PROMPT (org/plan context), METERED usage. Output is editable + added by the team (key messages can also be custom; the generator just seeds them). Honest note: this is the only server-side AI feature; it requires State B (backend) + metering; gate + rate-limit it.

BILLING & GATING — Stripe per-seat subscriptions + plan tiers; per-org ENTITLEMENTS turn add-ons on/off; usage METERING for metered features (AI generator). Entitlements checked server-side (RLS/edge), not just UI. Managers manage billing in Settings (admin). See Enterprise architecture pillar 17.

DEPENDENCIES — all require STATE B (Supabase/backend) + the relevant integrations (polling capture, AI API, Stripe). In the demo they appear as LOCKED affordances (the lock chip already used in the Plan editor), never functional.

UI KIND (built later; blocks + tokens) — locked panels with an upgrade CTA where the feature would live (Plan elements 8/9, the Key Messages element); a billing/entitlements admin section in Settings; metered-usage indicators. Visual cues per the Design system; no functional build in the demo.` },
      { t: "INDEX — manifest + traceability (feature → spec → ui-* component → verification)" },
      { t: "Command palette (⌘K) — global search across 5 entity types", d:
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

REBUILD BUILD-MAP (Canonical UI ruling — never md-*/shadcn): compose from existing components. The backdrop + centered bar = a ui-dialog variant (scrim with backdrop-blur; click-scrim and Escape close; autofocus the field on open). The search field + live grouped results list = ui-autocomplete (input with leading ui-icon "search", a capped result list, keyboard-navigable active row with clamped Arrow keys, Enter to commit, mouse-enter to set active). Each result row's type tag = ui-chip (small, the entity type), with a label and a muted ui-* secondary sub line. The trailing "Enter" affordance = a ui-button (disabled when no results). All icons via ui-icon ligatures (search). No raw div/span UI primitives, no ad-hoc styling — backdrop blur, sizing, and the active-row highlight all live in --ui-sys-* tokens.` },
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
