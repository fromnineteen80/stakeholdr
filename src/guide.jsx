import { useState, useMemo } from 'react';
import {
  ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, Typography,
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Checkbox,
  LinearProgress, Chip, Divider, Paper, Alert
} from '@mui/material';

// guide.jsx — Stakeholdr BUILD GUIDE.
// A Material Design guidebook (AppBar + permanent Drawer + main content) that is
// the single source we follow to rebuild the app, in order, checking items off
// and confirming each step together. This is intentionally the ONLY thing on the
// .io until the rebuild is underway; later it becomes a Settings → Guide page we
// retire. Built with MUI (standard Material Design components) + Inter + Material
// Symbols — the locked component/type/icon set for everything going forward.

const DRAWER = 340;
const STORAGE = "stakeholdr_guide_checks_v1";

const Msym = ({ name, sx }) => (
  <Box component="span" className="msym" aria-hidden
    sx={{ fontFamily: '"Material Symbols Outlined"', fontWeight: 'normal', fontSize: 22, lineHeight: 1, ...sx }}>
    {name}
  </Box>
);

// ── The build, in order. Each phase = a sidebar entry; items = checklist. ──
const PHASES = [
  {
    id: "p0", icon: "inventory_2", label: "0 · Assemble the foundation",
    blurb: "Gather everything we need before a single feature is rebuilt — the component kit, the type/icons, and the complete written knowledge layer. Capture first, code later.",
    items: [
      { t: "Material Design installed (MUI) — the only component kit going forward", done: true },
      { t: "Inter wired as the type; Google Material Symbols wired as the icons", done: true },
      { t: "This build guide is the only thing rendered on the .io", done: true },
      { t: "ECOSYSTEM.md — how it all connects (Master↔workspace↔stakeholder; score→position→prioritize→plan→fund→measure; persistence/realtime; roles)" },
      { t: "Per-page specs — one doc per page (Login, Lists, Scoring, Map, Plans, Community, Workspaces, Settings, Help, Messages, profiles, record scaffold, workHQ, palette, + future pages)" },
      { t: "Per-module specs — one doc per source module" },
      { t: "UX.md — every flow + the why/value behind each decision" },
      { t: "Content docs — HELP_CONTENT, MAP_GUIDE, RELATIONSHIP_ZONES (colors + recommendations), SCORING_MATH, SEP_ALGORITHMS, TABLE_COLUMNS, CATALOGS" },
      { t: "Design references — design/MATERIAL_DESIGN (element→MUI map), design/MATERIAL_SYMBOLS (name→glyph map), design/INTER (weights/loading)" },
      { t: "INDEX.md — master manifest (every doc + page + module + roadmap item, with status)" },
      { t: "VERIFICATION.md — the per-step acceptance checklist (renders · no console errors · matches spec · Material-only · review on .io)" },
      { t: "APP_SPEC.md — exhaustive functional spec (already committed)", done: true },
      { t: "CLAUDE.md — engineering discipline + Material-only rule + links to INDEX/ECOSYSTEM/APP_SPEC", done: true },
    ]
  },
  {
    id: "p1", icon: "inventory", label: "1 · Archive the old .io",
    blurb: "With the foundation assembled, ARCHIVE the old app — bundle every legacy page/feature module into a parked folder excluded from the build, so nothing can interact with what we build on main. Nothing is deleted; it's parked for reference. CONFIRM before moving.",
    items: [
      { t: "Confirm the foundation (Phase 0) is complete with the user" },
      { t: "Archive the old app: move the legacy page/feature modules into a parked /archive folder excluded from the Vite build (app, sheet, sheet-modals, scoring, map, plan, community, community-modal, setup, settings, help, messaging, profiles, profile-page, record, intel, palette, landing, tweaks-panel)" },
      { t: "Keep in src/: guide.jsx, data.js (seed/catalogs/math), store.js (persistence), db.js (schema), components.jsx if reused; keep all docs" },
      { t: "App entry renders only the guide → the .io is this guide on a clean slate" },
      { t: "Verify the archived code is fully out of the build graph and the guide still renders; commit" },
    ]
  },
  {
    id: "p2", icon: "foundation", label: "2 · Material foundation & theme",
    blurb: "Stand up the neutral, token-driven Material theme everything renders through. Design is a layer, not baked in.",
    items: [
      { t: "MUI ThemeProvider + CssBaseline at the app root" },
      { t: "Theme tokens (palette, typography=Inter, shape, spacing) sourced from CSS variables so the Design page can re-skin live" },
      { t: "Neutral defaults now; no Claude-specific styling yet" },
      { t: "App shell scaffold: AppBar + (collapsible) Drawer + main content region as MUI components" },
      { t: "Verify: renders, no console errors, Material-only" },
    ]
  },
  {
    id: "p3", icon: "palette", label: "3 · Settings → Design page",
    blurb: "Build the page that controls every design token live, with subtext on each control describing the Claude endgame. This is how the look comes back without me ever vibing it.",
    items: [
      { t: "Design settings UI (MUI) — controls for color tokens, type scale, density, radius, surfaces" },
      { t: "Writes tokens to :root CSS variables (live re-theme, no reload)" },
      { t: "Each control carries subtext describing the Claude-ward target value" },
      { t: "Persists to appConfig; defaults remain neutral Material" },
    ]
  },
  {
    id: "p4", icon: "dashboard", label: "4 · App shell",
    blurb: "The frame every page lives in — built from standard Material components.",
    items: [
      { t: "Brand bar / AppBar (app icon + name + workspace selector + people + profile)" },
      { t: "Primary navigation (Lists · Scoring · Map · Plans · Community · Workspaces · Help) — Material nav" },
      { t: "Workspace scoping (Master vs workspace) + workspace tabs" },
      { t: "Context-aware create (+), command palette (⌘K), footer, login gate" },
      { t: "Verify against ECOSYSTEM.md + shell spec" },
    ]
  },
  {
    id: "p5", icon: "table_view", label: "5 · Pages (in order)",
    blurb: "Rebuild each page from standard Material components, strictly to its spec. Confirm each before moving on.",
    items: [
      { t: "Lists / workspace table (every column + inline-edit/modal/computed per TABLE_COLUMNS) — Material data table" },
      { t: "Scoring (grid: stakeholders × team; edit only your column; weights)" },
      { t: "Map (zones, dots, drag-rescores-all, history, density) per MAP_GUIDE + RELATIONSHIP_ZONES" },
      { t: "Plans — landing + record (SEP ranking + override) per SEP_ALGORITHMS" },
      { t: "Community — landing + record (rollups, votes, value score)" },
      { t: "Workspaces (Setup) + workspace record" },
      { t: "Settings (all sub-panes) + the Design page from Phase 3" },
      { t: "Help (12-step framework + zone legend) from HELP_CONTENT" },
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
      { t: "workHQ — the workspace intelligence strip (define scope with user, then build)" },
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
      { t: "Empty states · blank-org vs demo-data seed · bulk actions · universal validation · soft-delete/archive" },
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
      { t: "File storage (logos, photos, attachments) · email (invites, rescore reminders, digests)" },
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

const theme = createTheme({
  palette: { mode: "light", primary: { main: "#024AD8" }, background: { default: "#FAFAFA" } },
  typography: { fontFamily: '"Inter","Helvetica","Arial",sans-serif', h5: { fontWeight: 600 }, h6: { fontWeight: 600 } },
  shape: { borderRadius: 10 },
});

export function Guide() {
  const allIds = useMemo(() => PHASES.flatMap(p => p.items.map((_, i) => p.id + "-" + i)), []);
  const [active, setActive] = useState(PHASES[0].id);
  const [checks, setChecks] = useState(() => {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE) || "{}"); } catch {}
    // Seed any item flagged done:true if not already recorded.
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <AppBar position="fixed" elevation={0} sx={{ zIndex: t => t.zIndex.drawer + 1, bgcolor: "#fff", color: "text.primary", borderBottom: "1px solid", borderColor: "divider" }}>
          <Toolbar sx={{ gap: 1.5 }}>
            <Msym name="checklist" sx={{ color: "primary.main", fontSize: 26 }} />
            <Typography variant="h6" noWrap sx={{ flex: 1 }}>Stakeholdr — Build Guide</Typography>
            <Chip size="small" label={`${doneCount}/${allIds.length} · ${pct}%`} color={pct === 100 ? "success" : "default"} />
          </Toolbar>
          <LinearProgress variant="determinate" value={pct} sx={{ height: 3 }} />
        </AppBar>

        <Drawer variant="permanent" sx={{ width: DRAWER, flexShrink: 0, "& .MuiDrawer-paper": { width: DRAWER, boxSizing: "border-box", borderColor: "divider" } }}>
          <Toolbar />
          <Box sx={{ overflow: "auto" }}>
            <List>
              {PHASES.map(p => {
                const total = p.items.length;
                const done = p.items.filter((_, i) => checks[p.id + "-" + i]).length;
                return (
                  <ListItemButton key={p.id} selected={p.id === active} onClick={() => setActive(p.id)} sx={{ alignItems: "flex-start", py: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.25 }}><Msym name={p.icon} sx={{ color: p.id === active ? "primary.main" : "text.secondary" }} /></ListItemIcon>
                    <ListItemText primary={p.label} secondary={`${done}/${total} complete`} primaryTypographyProps={{ fontWeight: p.id === active ? 600 : 500, fontSize: 14 }} />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 3, md: 5 }, maxWidth: 960 }}>
          <Toolbar />
          <Typography variant="overline" color="text.secondary">Phase</Typography>
          <Typography variant="h5" gutterBottom>{phase.label}</Typography>
          <Typography color="text.secondary" sx={{ mb: 2, maxWidth: 720, lineHeight: 1.7 }}>{phase.blurb}</Typography>
          <Chip size="small" variant="outlined" label={`${phaseDone}/${phase.items.length} in this phase`} sx={{ mb: 3 }} />
          <Alert severity="info" icon={<Msym name="handshake" sx={{ fontSize: 20 }} />} sx={{ mb: 3 }}>
            We confirm every item together before checking it off and before moving to the next phase.
          </Alert>
          <Paper variant="outlined">
            <List disablePadding>
              {phase.items.map((it, i) => {
                const id = phase.id + "-" + i;
                const on = !!checks[id];
                return (
                  <Box key={id}>
                    {i > 0 && <Divider component="li" />}
                    <ListItemButton onClick={() => toggle(id)} sx={{ alignItems: "flex-start", py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 44 }}>
                        <Checkbox edge="start" checked={on} tabIndex={-1} disableRipple />
                      </ListItemIcon>
                      <ListItemText
                        primary={it.t}
                        primaryTypographyProps={{ sx: { textDecoration: on ? "line-through" : "none", color: on ? "text.disabled" : "text.primary", lineHeight: 1.5 } }}
                      />
                    </ListItemButton>
                  </Box>
                );
              })}
            </List>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
