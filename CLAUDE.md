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
- **Open token decisions (decide at the Design-page step, with the user; token edits only):**
  accent hue (`--ui-sys-accent #B5552C` vs design.md's `#D96B43`); shadows (tokens ship a
  subtle elevation ramp for overlays vs the "no shadows ever" start-state rule); wrapper
  theme direction (2026-07-02: user wants a "Modern" minimalist theme variant — cooler/
  crisper wrapper competing with Slack — built as a NAMED TOKEN SET alongside the Soapbox
  cream default, previewed on preview.html for side-by-side ruling; the 14 zone colors,
  zone inks/borders, and priority/status/segment/valence pill tokens are NEVER touched by
  any theme swap — if the wrapper cools, adjust surfaces for zone readability, never the
  zone hexes).
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
  every screen** (same app-bar composition: mark + name + workspace selector left, search
  right) — Slack-competitive consistency is the bar for everything wrapped AROUND the
  map/tables.

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

## STATUS (updated 2026-06-13 — the 360 review)
- **Design law RULED:** Canonical UI (see above). Guide Boxes 1–3 amended accordingly and
  **unsealed pending the user's re-confirmation**; the shadcn Design-system capture box is
  superseded (history preserved in place).
- **Capture:** 8 boxes sealed (Scoring, Cadence, Map, Plan algorithm ×2, Recommendation
  alignment, Plan page, Plan worked-example). ~20 boxes written longform but **awaiting
  confirmation**. **5 boxes missing/empty:** INDEX (manifest + traceability — row exists,
  no detail), workHQ (`intel.jsx` — scope with the user first), command palette
  (`palette.jsx`), landing page (`landing.jsx`), full stakeholder/user profile field set
  (`profiles.jsx`/`profile-page.jsx`).
- **Book:** Parts I–II in prose; Parts III–IX pending.
- **Design system:** 35 components built + manifest + preview; wireframes cover 3 screens
  (List, Map, Mobile) — remaining screens wireframed during the build phases.
- **AGREED SEQUENCE (the user's plan): (1) write the 5 missing boxes → (2) seal the ~20
  pending boxes one at a time → (3) verification audit vs the oracle → (4) build phases.**
- **ORIGINAL-DESIGN CENSUS (ruled 2026-07-02, runs after the content-verify loop):** four
  sweeps over the ORIGINAL app (`archive/src` incl. `styles.css` + `project/` prototype),
  not the guide page: (a) COLORS — all ~187 literals reconciled with a disposition each
  (already-tokenized / needs-token / flagged decision — nothing silently dropped);
  (b) ELEMENTS/STRUCTURE — the ~641 className regions accounted for, AND a per-screen
  SKELETON TREE (nested region tree extracted from the original JSX: shell → slot →
  in-main stack, in order) written into each page's box so the build assembles against a
  tree, never prose — this kills the "inferred divs, missing wrappers, line-by-line hell"
  failure of the first build; (c) UX — all ~515 event-handler interactions accounted for;
  (d) CONNECTIVITY — every cross-record link/navigation edge captured, fake wiring
  flagged make-real. Wrapper structure itself lives INSIDE ui-* components (shadow DOM),
  so page assembly is slotting components, never authoring divs.

## Engineering discipline
Work in the code, fix at the source, single-source, replace-don't-duplicate, verify it
renders with zero console errors, confirm with the user. The `.io` is the review surface;
the sandbox cannot load `*.github.io`, so the user is the eyes — push small, confirm.
