# CLAUDE.md — Stakeholdr (READ FIRST, every session)

This file auto-loads at the start of every session. It is the durable mandate for this
project. Read it fully, then continue exactly where we are. Do **not** relitigate, do
**not** summarize, do **not** vibe. The user has been burned repeatedly by shallow output;
your job is exhaustive, source-true work.

## The mission right now
We are rebuilding Stakeholdr **properly**, and *properly* starts with **capturing the
entire app as a LOSSLESS specification** before any rebuild:
- a **granular checklist** — the build guide on the `.io` (`src/guide.jsx`), each box a
  *complete, specific detail*, and
- a **longform book** (`docs/STAKEHOLDR_BOOK.md`) — paragraph upon paragraph of the actual
  reasoning and mechanics.
The `.io` checklist is **the research-confirmation surface**: every box is a unit of
research the user confirms; the rebuild is simply executing the sealed checklist.

## THE STANDARD (non-negotiable)
- **LOSSLESS. ACTUAL CONTENT, NEVER LABELS.** A box must never *name* a thing
  ("Community — every section, every field"); it must *contain* the thing: each field's
  type, allowed values, default, whether required, its cascades and validation, and what
  it drives downstream; each function's exact formula and constants; every interaction,
  state, edge case, and design value. Enough that a developer in a cold session could
  rebuild it faithfully **with the old code gone**. No line is a pointer; every line *is*
  the thing.
- **Why this is existential:** the checklist + book are the **only** source of truth for
  the rebuild. Any detail left as a label is information **permanently lost** → forces
  invention at build time → destroys the rebuild. Losslessness is survival.
- After a box is fully written, **declare it "entirely lossless." The user confirms.** Then
  seal it (`done: true` committed into the guide source). Then the next box.

## HOW TO RESEARCH LOSSLESSLY (this is why context loss is survivable)
- **The old code is intact and is the research oracle.** It lives in TWO places (moved out
  of `src/`, deliberately out of the build graph, NOT deleted):
  - `archive/src/` — the ported app modules: `data.js` (catalogs, SEP models/factors, math,
    `GRID`, `STATUSES`, `weightedCoord`, `statusFor`, bounds), `sheet.jsx` + `sheet-modals.jsx`
    (Lists table), `scoring.jsx`, `map.jsx`, `plan.jsx`, `community.jsx` + `community-modal.jsx`,
    `setup.jsx`, `settings.jsx`, `messaging.jsx`, `users.jsx`, `profiles.jsx` + `profile-page.jsx`,
    `store.js`, `db.js`, `components.jsx`, `intel.jsx` (workHQ), `palette.jsx`, `landing.jsx`,
    `record.jsx`, `help.jsx`, `tweaks-panel.jsx`, `app.jsx`, `styles.css`.
  - `project/` — the original handoff bundle (same modules plus `HANDOFF.md`, `VERIFICATION.md`,
    `BACKEND_TODO.md`, `MASTER_PROMPT.md`, `RECORD_SCAFFOLD.md`, `THEMES.md`, the
    `Stakeholder Tool.html` prototype).
  Plus `APP_SPEC.md` (functional spec) and `chats/chat1.md` (design rationale, the "why",
  and the roadmap).
- **DO NOT delete the old source.** It stays until the capture is **VERIFIED COMPLETE
  against it** (a module-by-module audit). The source is the answer key. The build never
  starts from a thin checklist.

## CANONICAL-UI-ONLY (the build law — RULED 2026-06-13)
The rebuilt app is built **exclusively from this repo's own Canonical UI design system**:
`design-system/` — un-branded, token-driven **web components** (`<ui-*>` tags).
This ruling supersedes both earlier directions: **Material Web/MD3** (maintenance mode;
no data grid / date picker / nav / app bar / tooltip / snackbar — filling the holes meant
adopting Angular) and **shadcn/ui + Tailwind** (tried in `docs/design`; utility classes
are a thousand styling surfaces and it drifted — see `design-system/README.md`).
Canonical UI is MD3 in philosophy (same component vocabulary, full parity) with the holes
filled natively, hosted by the existing **React 18 + Vite** app. The three laws:
1. **Real components.** Genuine custom elements (shadow DOM, real states + a11y). Screens
   are assembled from them; a component is never reimplemented in markup/CSS.
2. **One styling surface.** The `--ui-sys-*` token layer (`design-system/tokens.css`) is
   the only legal place a visual decision lives. No component stylesheet overrides, no
   utility classes, no inline color/size. Re-skin = edit tokens.
3. **The manifest is binding.** `design-system/manifest.json` is the machine-readable
   contract (every component, tag, props, states, consumed tokens). Build sessions read
   the manifest and assemble real elements — there is no room to invent.
- **Coverage (35 built):** native MD3-parity (button, icon-button, fab, text-field,
  checkbox, radio, switch, slider, select, menu, chip, list, tabs, divider, dialog,
  tooltip, snackbar, progress, icon) · gap-fill (autocomplete, data-table, chart, app-bar,
  nav-rail, nav-drawer, sheet, bottom-bar, date-picker) · scaffold (app-shell, sidebar,
  inspector, status-bar) · domain (stakeholder-table, stakeholder-map).
- **Icons:** Material Symbols ligatures via `<ui-icon>` (e.g. `<ui-icon>search</ui-icon>`;
  sizes from `--ui-sys-icon-size-*`) — never hand-rolled glyphs, never `@mui/icons-material`,
  never lucide.
- **Gaps:** a need not covered by a component/token = a GAP → build it INTO
  `design-system/` (to the `ui-button` quality bar), register it in `manifest.json`,
  THEN use it. Changes later are recompositions/extensions of the system — never a patch.
- **Forbidden:** MUI/`@mui/*`, Tailwind, Angular, `@material/web` in the rebuilt app
  (the guide page still renders with Material Web as a temporary scratch surface — the
  guide is NOT the app), `<span>`/`<div>` as UI primitives, ad-hoc styling, `!important`,
  stray/duplicated/patch CSS, premature visual customization.
- **Spec rule:** a box that describes UI is incomplete until it states the exact `ui-*`
  component + variant + props for each element. Older boxes written in `md-*`/shadcn terms
  are read via the translation table in guide Box 1 and amended as they are sealed.
- **Preview surfaces:** `design-system/preview.html` (gallery + live token editor) and
  `design-system/wireframes.html` (assembled screens) ship as standalone Pages entries.

## DESIGN START-STATE (encoded in `design-system/tokens.css` — clean & restrained like Claude)
The Settings → Design page tunes tokens later; the start-state is already in the contract:
- **Surface greys (light→dark):** `#FFFFFF · #FEFDFC · #FCFBF9 · #F8F7F3 · #F4F3ED ·
  #F0EEE6 · #E8E6DE` = `--ui-ref-neutral-0..6` → semantic roles `--ui-sys-surface-card`
  (white content/cards) / `-surface` (runway) / `-surface-field` / `-surface-container`
  (panels/rails — sidebars NEVER white) / `-surface-hover` / outlines.
- **Ink:** `#666361 · #ABA9A4 · #DFDDD6` = `--ui-ref-ink-strong/-muted/-faint` →
  `--ui-sys-on-surface*` + dividers/disabled.
- **Type:** Inter (body/UI, `--ui-ref-typeface-body`, 13px base, tnum numerals) +
  Newsreader (**titles only**, `--ui-ref-typeface-title`). **No mono, no other families.**
  Modest weights, no oversized headings.
- **Zones:** the 14 relationship-zone colors + zone inks/borders are first-class
  `--ui-sys-zone-*` tokens (single-sourced for Map/Lists/Help/scorecard).
- **Token decisions — CLOSED BY DELEGATION (2026-07-14).** The user delegated the front
  end ("do the front end"); the three formerly-open decisions are RULED at the assistant's
  recommendation = the shipped start-state: (1) **accent stays terracotta `#B5552C`**;
  (2) **surfaces flat, the subtle elevation ramp reserved for OVERLAYS only** (menus,
  dialogs, sheets — never cards/tables); (3) **Cream (Soapbox) is the default wrapper**,
  the Modern set stays a live toggle on preview.html/wireframes.html. The user may VETO
  any of the three at any time with one word — each is a token-set swap. Standing
  guardrails unchanged: the 14 zone colors, zone inks/borders, and
  priority/status/segment/valence pill tokens are NEVER touched by any theme swap — if
  the wrapper cools, adjust surfaces for zone readability, never the zone hexes.
- Rules: no gradients ever; nav state via ink (no hover/active background swaps); sidebars
  never white; main content white; sidebar fields lighter-than-rail but not white; airy-but-
  tight 4px rhythm. **Readability, ease, and pleasure of use are the bar.**
- **SHELL DESIGN RULINGS (user, 2026-07-02 — bind every screen; already in the wireframes):**
  (1) the **workspace selector lives in the TOP BAR next to the brand** (never in the
  sidebar); (2) the expanded sidebar is **Claude-LIKE but
  PROPORTIONAL: `--ui-sys-sidebar-width: clamp(208px, 18vw, 288px)`** (grows with the
  window up to Claude's 18rem, tight floor below) — and the rail must **never sit
  hollow**: full nav + a Workspaces section + the identity footer fill it; (3) the signed-in identity appears in **ONE place: an
  avatar circle (initials or photo) pinned bottom-left of the sidebar** — `ui-avatar` is
  now a real manifest-registered component (`--ui-sys-avatar-size-*`); (4) the **brand
  mark is the "Sr" monogram** — capital S + lowercase *italic* r, title typeface, on a
  colored field that is **the SAME color as the app title** (both read
  `--ui-sys-on-surface`, encoded in CSS so they can never drift; re-themes together); (5) the chrome is **identical on
  every screen** — Slack-competitive consistency is the bar for everything wrapped AROUND
  the map/tables. **AMENDED 2026-07-03 (Claude form factor, user-ruled on the live app):**
  the sidebar is FULL-HEIGHT and STATIC (nav column spans all rows; the content area gets
  its own thin header carrying the workspace selector + search); the **brand (Sr mark +
  name) lives at the TOP OF THE RAIL**, not in a top bar; the collapse control is a quiet
  **left_panel_close/open panel icon next to the brand — the edge-chevron is RETIRED**;
  the **mark is a CIRCLE** (--ui-sys-shape-pill), matching the avatar language; **icon
  hover = INK ONLY, never a background** (ui-icon-button standard variant + the sidebar
  toggle enforce this in the components); and per the make-real law, **a control that is
  not wired yet must LOOK inert** (disabled + phase note) — never a live-looking dead
  affordance.
- **CARD-ANATOMY RULING (user, 2026-07-14 — binds every card grid; SUPERSEDES the sealed
  card foot/head compositions in the Community/Workspaces/Plan boxes):** the user reviewed
  the live cards and ruled the sealed-as-captured presentation sloppy ("different size of
  pills all over the cards, the massive and vague voting sections, different height for
  cards that need to be uniform, titles that don't feel like card titles… should be left
  justified"). Every entity card (Workspace/Community/Plan + future families) follows the
  ONE `--ui-sys-card-*` contract in tokens.css + the shared `.entity-card` block:
  uniform height per grid (content truncates, never stretches), a left-flush single-line
  `ui-button variant="title"` title + one muted subtitle, ONE pill scale for every chip
  on a card (`--ui-sys-card-pill-*`), keyed meta rows that always render (em-dash when
  empty, so heights are deterministic), a fixed clamped body region, one thin foot row
  (owners left · quiet actions right), and the vote group as ONE labeled compact row
  ("Your vote" · small segmented For/Against · caption tally · sm voter avatars) — all
  sealed BEHAVIOR (handlers, vote math, strings) unchanged. The visual gate MEASURES
  this (shots.mjs card-consistency check: same card height per grid, same chip height,
  title flush ±1px) — a cold rebuild session must never "repair" cards back to the
  sealed foot/head compositions.

## HANDSHAKE / submit control
The guide (`src/guide.jsx`, the `.io`) carries a confirm control so the user can signal
agreement on a box. Honest mechanism: the sandbox cannot read the user's browser; "submit"
= the user's signal, and the durable record is the assistant committing `done:true` into
the guide source.

## METHOD
1. Read the relevant source (`archive/src/` + `project/` + docs).
2. Write **one box**, fully and losslessly, **INTO `src/guide.jsx`** as that checkbox's
   expandable detail (the `d` field), then **commit + push so the `.io` SHOWS the longform.**
   A box written only in chat does NOT count; the `.io` must never be bare bullet labels.
3. Declare it "entirely lossless." The user confirms on the `.io`. Seal it (`done: true`).
4. Next box. When ALL boxes are written + sealed → the **verification audit** (capture vs
   `archive/src/` + `project/`, module by module) → then build, phase by phase, from the
   sealed boxes only.
- The `.io` renders ONLY the guide (`src/main.jsx` → `Guide`), plus the two standalone
  design-system pages.

## STATUS (updated 2026-07-03 — CAPTURE WRITING COMPLETE)
- **Design law RULED:** Canonical UI (see above). All boxes retargeted to ui-*; the shadcn
  Design-system capture box is superseded (history preserved in place).
- **Capture: WRITTEN AND MACHINE-VERIFIED.** Every box (incl. the formerly-missing INDEX,
  workHQ, command palette, stakeholder/user profiles, stakeholder modal, app shell, shared
  primitives, demo seed) carries full lossless longform. A 3-round ADVERSARIAL VERIFY-FIX
  LOOP ran against the oracle (90 agents; 225 findings raised, 126 high/med — all repaired
  with per-finding file+line evidence). All unflagged-fakes found are recorded in their
  boxes as DO-NOT-REPLICATE / MAKE-REAL rules. See the INDEX box for the full stamp.
- **ORIGINAL-DESIGN CENSUS: DONE (2026-07-03).** All four sweeps written into the guide:
  COLORS — 187/187 literals dispositioned (Color-census box; frozen accent-wash theming
  bug exposed); STRUCTURE — a SKELETON TREE with className accounting sits in every screen
  box; UX — every handler binding accounted per box (~530 total); CONNECTIVITY — 94 edges
  mapped (67 real · 12 fragile · 11 fake→make-real · 4 one-way) in the Connectivity-census
  box.
- **Book: COMPLETE.** Parts I–IX (~17k words) in `docs/STAKEHOLDR_BOOK.md`, written from
  the verified boxes.
- **Design system:** 41 components + manifest + preview; Cream + Modern theme token sets
  with a toggle on preview.html/wireframes.html; shell rulings implemented in the
  wireframes. GAP kit BUILT 2026-07-03 (registered + gallery'd + smoke-tested): ui-card,
  ui-textarea, ui-text-field variant=plain, ui-badge (+ --ui-sys-badge-* tokens),
  ui-owner-picker, ui-coachmark; the 37 census needs-token literals live in tokens.css as
  23 tokens (washes = accent-derived color-mix scale). Remaining GAPs (INDEX gate 2):
  dashed callout, drag-reorder grip, ui-swatch-card, whiteboard canvas (awaits ruling);
  command palette = composition, no new component. BLIND VERIFY PASS DONE (9 cold
  auditors + independent census recount; 56 findings repaired; see the INDEX stamp).
- **SEALED (2026-07-03).** The user reviewed and confirmed the capture; done:true is
  committed on all 39 Foundation + Capture boxes (commit 77cff95). The capture phase is
  CLOSED — the rebuild executes from the sealed boxes only, per the BUILD PROTOCOL.
- **WHAT REMAINS (in order):** (1) MERGE the session branch to main so the sealed guide,
  wireframes, theme toggle, and gallery publish to the `.io`; (2) the three OPEN DESIGN
  DECISIONS (accent hue incl. the #024AD8-vs-terracotta census find; shadows vs flat;
  Cream vs Modern wrapper) — ruled on the preview pages; (3) BUILD PHASES executed from
  the sealed boxes only — assemble against the skeleton trees, honor every
  do-not-replicate / make-real flag, close the remaining INDEX gate-2 GAPs at their
  phases, no literal hex in app code.

## BUILD PROTOCOL (binding on every build session — this is how the rebuild "works as planned")
1. **Build ONLY from the sealed boxes** in `src/guide.jsx` (+ the book/APP_SPEC as prose
   context). After sealing, `archive/` + `project/` are never read again.
2. **Per screen: assemble against the SKELETON TREE, node by node.** Open the box, read
   its tree, place each node as its mapped `ui-*` component/slot. Never author layout
   divs — structure lives inside components. A tree node with no component = STOP: build
   the GAP into `design-system/`, register it in `manifest.json`, then continue.
3. **Every element = the exact `ui-*` tag + variant + props the box names.** The manifest
   is the contract; inventing an element or hand-rolling a lookalike is a build failure.
4. **Zero literal hex/px styling in app code.** All look via `--ui-sys-*` tokens; the
   Color-census box's needs-token entries must exist in `tokens.css` BEFORE the screen
   that uses them. No `!important`, no component overrides, no utility classes.
5. **Honor every DO-NOT-REPLICATE / MAKE-REAL flag.** The original design is accurate;
   its broken plumbing is not. Dead writes get wired, fake links get real routes
   (first-class routing — no `window.__*` bridges), unreachable controls become real.
6. **Per-phase acceptance, before moving on:** `npm run build` green (guard runs inside
   it) → headless-Chromium smoke (`scripts/smoke.mjs`, zero real console errors) →
   **VISUAL GATE (`scripts/shots.mjs`): screenshot the app and LOOK at the renders —
   Claude inspects the images against the wireframes + industry norms (alignment,
   centering, spacing, form factor) before anything merges; function gates cannot see
   form** → tree-check (every skeleton node present) → connectivity check (census edges
   wired REAL) → push small → the user confirms on the `.io` before the next phase.
   FONTS ARE SELF-HOSTED (`design-system/fonts/` + `fonts.css`, icon font subset to the
   sealed vocabulary, `font-display: block`) — never reintroduce runtime Google Fonts in
   the app; raw-ligature flash was the root cause of the 2026-07-03 "broken icons".
7. **Order:** the guide's build phases (foundation/tokens → app shell → pages → record
   scaffold + workHQ → demo features → backend → paid add-ons). State A (demo,
   client-side) completes before State B (Supabase); backend work honors the two
   BACKEND_TODO gates (row-level writes; RLS mirroring UI roles).

## Engineering discipline
Work in the code, fix at the source, single-source, replace-don't-duplicate, verify it
renders with zero console errors, confirm with the user. The `.io` is the review surface;
the sandbox cannot load `*.github.io`, so the user is the eyes — push small, confirm.
