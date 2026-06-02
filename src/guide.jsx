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
// 100% plug-and-play Material Design (MUI) — no hand-rolled spans, no custom
// styling yet (that arrives via the Settings → Design page in Phase 3). This is
// the single source we follow to rebuild the app, in order. Each item carries
// the inferred detail captured "as the Anthropic dev"; the user reviews on the
// .io and we seal each handshake by committing the check (done:true) into source.

const DRAWER = 360;
const STORAGE = "stakeholdr_guide_checks_v1";

// d: optional inferred detail rendered in an expandable panel under the item.
const PHASES = [
  {
    id: "p0", Icon: Inventory2Icon, label: "0 · Assemble the foundation",
    blurb: "Gather everything we need before a single feature is rebuilt — the component kit, the type/icons, and the complete written knowledge layer. Capture first, code later.",
    items: [
      { t: "Material Design (MUI) is the ONLY component kit — the law for every element", done: true, d:
`Every UI element is a standard Material Design (MUI) component or a composition of them; never a hand-rolled element.

INSTALLED (verbatim): @mui/material@^6 · @emotion/react · @emotion/styled (styling engine) · @mui/icons-material@^6 (icons). Build: React 18.3.1 + react-dom 18.3.1, Vite 5 + @vitejs/plugin-react, deployed to GitHub Pages via Actions.

USE THE FULL LIBRARY (never bare-minimum): every element names its specific MUI component + variant + key props as the right tool — e.g. Autocomplete (searchable/large/multi) vs Select+MenuItem (short fixed sets); DataGrid (sort/filter/reorder/virtualize) for the Lists table vs Table (simple static); Button variant contained|outlined|text vs IconButton vs Fab vs ToggleButtonGroup. Structure: AppBar, Drawer, Dialog, Popover, Menu, Accordion, Card, Tabs, Snackbar/Alert, Tooltip, Stepper, Badge, LinearProgress; layout: Box/Stack/Grid. If a standard component does the job, use it unchanged; otherwise compose MUI primitives — never invent a custom element.

CHANGES TOO: when we later modify something, the change is made with OTHER MUI components — recompose standard Material, never a custom hack.

FORBIDDEN: span/div as UI primitives, ad-hoc/inline styling, !important, stray/duplicated/patch CSS, premature visual customization. Plug-and-play only.

THEMING = single source, MUI native API, NOT custom code: createTheme({ palette, typography, shape, components }) + ThemeProvider. Define a token once → every component inherits it everywhere → change it once → it updates everywhere. Never style a component one-off. Re-skinning later (toward Claude) = changing tokens only.

PALETTE START-STATE (theme tokens): surfaces light→dark #FFFFFF · #FEFDFC · #FCFBF9 · #F8F7F3 · #F4F3ED · #F0EEE6 · #E8E6DE; ink text.primary #666361 · text.secondary #ABA9A4 · text.disabled #DFDDD6. Small clean type, modest weights, no oversized headings; tight-but-airy spacing; readability/ease/pleasure are the bar.

DONE = (1) every element is standard MUI; (2) renders, zero console errors; (3) no spans-as-UI, no !important, no bespoke styling; (4) all look comes from theme tokens.` },
      { t: "Type & Icon system — Inter / Newsreader / IBM Plex Mono + Material Symbols", done: true, d:
`Three type roles + one icon set, loaded as web fonts, applied via theme tokens (createTheme typography) — never per-component.

TYPE STACKS (verbatim):
serif: "Newsreader","Source Serif Pro","Charter","Iowan Old Style",Georgia,serif
sans:  "Inter","Söhne","Helvetica Neue",Helvetica,Arial,sans-serif
mono:  "IBM Plex Mono","SF Mono",ui-monospace,Menlo,Consolas,monospace

ROLES: Sans (Inter) = body + all UI; base 13px, color = ink, font-feature-settings "ss01","cv11","tnum" (tabular numerals). This is theme.typography.fontFamily. Serif (Newsreader) = display: page titles, section headings. Mono (IBM Plex Mono) = labels/eyebrows/numbers: UPPERCASE, letter-spaced ~0.07–0.09em, ~10–11px, muted ink.

WEB FONTS LOADED (Google Fonts, verbatim axes): Inter 400;500;600;700 · Newsreader opsz,wght@6..72,400;500;600 · IBM Plex Mono 400;500 · Material Symbols Outlined opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200. (preconnect fonts.googleapis.com + fonts.gstatic.com, two stylesheet links.) Fallback stacks render before fonts load (and in a sandbox where Google Fonts are blocked: Georgia / Helvetica-Arial / Menlo).

ICONS: build rule = MUI icon components from @mui/icons-material (one import per icon, e.g. import ChecklistIcon from '@mui/icons-material/Checklist') — NEVER hand-rolled span glyphs. Material Symbols axis settings for parity: FILL 0, wght 300–400, GRAD 0, opsz 20; size 1em, never larger than its label; re-enable font-feature-settings 'liga' on the icon class.

ICON VOCABULARY (semantic name → glyph, verbatim — preserve the meaning when choosing the MUI icon): search→search · plus→add · filter→filter_list · sort→swap_vert · download→download · close→close · target→map · grid→settings · work→work · table→table_rows · category→category · cases→cases · language→language · beenhere→beenhere · apartment→apartment · check→check · content_copy→content_copy · user→person · users→groups · help→help · map→map · sliders→thumb_up · plan→description · lock→lock · message→chat · expand→open_in_full · logout→logout · edit→edit · chevron→expand_more · chevronUp→expand_less · layers→layers · community→favorite · drag→drag_indicator · chevron-left→chevron_left · chevron-right→chevron_right · double-left→keyboard_double_arrow_left · double-right→keyboard_double_arrow_right · sparkle→auto_awesome · brandmark→id_card · build→build · clock→history · mail→mail · phone→call` },
      { t: "This build guide is the only thing rendered on the .io", done: true },
      { t: "APP_SPEC.md — exhaustive functional spec committed", done: true },
      { t: "CLAUDE.md — engineering discipline + Material-only rule", done: true },
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
      { t: "Scoring & weighting — grid layout, edit-only-your-column, weightedCoord, score outcomes" },
      { t: "Lists table — every column: source field · edit mechanism (inline/modal/computed) · MUI component" },
      { t: "SEP algorithm — base signals, factor→signal map, sector/goal models, bands, manager override" },
      { t: "Plan — every section, field, validation, review mode" },
      { t: "Community — every section, field, value score, votes, FY budget rollups" },
      { t: "Workspaces & Settings — fields, sub-panes, manager gating, propagation" },
      { t: "Messaging — conversations/messages model, @ / # / $ mention links" },
      { t: "Persistence / realtime — entities + exact shapes, Store, Supabase swap" },
      { t: "Catalogs — categories/types · markets/regions · segments/BUs · issues · kinds/stages/ask-types" },
      { t: "Design refs — element→MUI-component map · Material Symbols map · Inter" },
      { t: "INDEX — manifest + traceability (feature → spec → MUI component → verification)" },
    ]
  },
  {
    id: "p1", Icon: InventoryIcon, label: "1 · Archive the old .io",
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
    blurb: "Stand up the neutral, token-driven Material theme everything renders through. Design is a layer, not baked in.",
    items: [
      { t: "MUI theme tokens sourced from CSS variables so the Design page can re-skin live" },
      { t: "Neutral defaults now; no Claude-specific styling yet" },
      { t: "App shell scaffold (AppBar + Drawer + main) from standard MUI components" },
      { t: "Verify: renders, no console errors, Material-only" },
    ]
  },
  {
    id: "p3", Icon: PaletteIcon, label: "3 · Settings → Design page",
    blurb: "The page that controls every design token live, with subtext describing the Claude endgame. This is how the look comes back without vibing.",
    items: [
      { t: "Design controls (MUI) for color tokens, type scale, density, radius, surfaces" },
      { t: "Writes tokens to :root CSS variables (live re-theme, no reload)" },
      { t: "Each control carries subtext describing the Claude-ward target" },
      { t: "Persists to appConfig; defaults remain neutral Material" },
    ]
  },
  {
    id: "p4", Icon: DashboardIcon, label: "4 · App shell",
    blurb: "The frame every page lives in — standard Material components only.",
    items: [
      { t: "Brand bar / AppBar (icon + name + workspace selector + people + profile)" },
      { t: "Primary nav (Lists · Scoring · Map · Plans · Community · Workspaces · Help)" },
      { t: "Workspace scoping (Master vs workspace) + tabs" },
      { t: "Context-aware create (+), command palette (⌘K), footer, login gate" },
    ]
  },
  {
    id: "p5", Icon: TableViewIcon, label: "5 · Pages (in order)",
    blurb: "Rebuild each page from standard Material components, strictly to its spec. Confirm each before the next.",
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
