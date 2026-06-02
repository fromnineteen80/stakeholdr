# CLAUDE.md — Stakeholdr (READ FIRST, every session)

This file auto-loads at the start of every session. It is the durable mandate for this
project. Read it fully, then continue exactly where we are. Do **not** relitigate, do
**not** summarize, do **not** vibe. The user has been burned repeatedly by shallow output;
your job is exhaustive, source-true work.

## The mission right now
We are rebuilding Stakeholdr **properly**, and *properly* starts with **capturing the
entire app as a LOSSLESS specification** before any rebuild:
- a **granular checklist** — hundreds of boxes, each one a *complete, specific detail*, and
- a **longform book** (`docs/STAKEHOLDR_BOOK.md`) — paragraph upon paragraph of the actual
  reasoning and mechanics.
Only after the capture is **verified complete** do we archive the old code and rebuild.

## THE STANDARD (non-negotiable)
- **LOSSLESS. ACTUAL CONTENT, NEVER LABELS.** A box must never *name* a thing
  ("Community — every section, every field"); it must *contain* the thing: each field's
  type, allowed values, default, whether required, its cascades and validation, and what
  it drives downstream; each function's exact formula and constants; every interaction,
  state, edge case, and design value. Enough that a developer in a cold session could
  rebuild it faithfully **with the old code gone**. No line is a pointer; every line *is*
  the thing.
- **Why this is existential:** once the old code is archived, the checklist + book are the
  **only** source of truth. Any detail left as a label is information **permanently lost**
  → forces invention at build time → destroys the rebuild. Losslessness is survival.
- After a box is fully written, **declare it "entirely lossless." The user confirms.** Then
  the next box. One at a time, **in order from the top of the guide.**

## HOW TO RESEARCH LOSSLESSLY (this is why context loss is survivable)
- **The old code is still intact and is the research oracle.** Read it directly:
  `src/data.js` (catalogs, SEP models/factors, math, `GRID`, `STATUSES`, `weightedCoord`,
  `statusFor`, bounds), `src/sheet.jsx` (Lists table), `src/scoring.jsx`, `src/map.jsx`,
  `src/plan.jsx`, `src/community.jsx` + `src/community-modal.jsx`, `src/setup.jsx`,
  `src/settings.jsx`, `src/messaging.jsx`, `src/users.jsx`, `src/profiles.jsx`,
  `src/store.js`, `src/db.js`, `src/components.jsx`, `src/intel.jsx` (workHQ),
  `src/palette.jsx`, `src/landing.jsx`, `src/record.jsx`. Plus `APP_SPEC.md` (functional
  spec) and `chats/chat1.md` (design rationale, the "why", and the roadmap).
- **DO NOT archive or delete the old source until the capture is VERIFIED COMPLETE against
  it.** The source is the answer key. The build never starts from a thin checklist.

## MATERIAL-DESIGN-3-ONLY (the build law)
- Every UI element is a **standard Material Design 3 component from Google's Material Web**
  or a composition of them. Installed: `@material/web` (the official MD3 web-components).
  Icons are **Material Symbols** via `<md-icon>` (the ligature name as text content, e.g.
  `<md-icon>checklist</md-icon>`) — never hand-rolled `<span>` glyphs, never `@mui/icons-material`.
- **NEVER MUI / `@mui/*` or any other third-party UI library.** MD3 ships no data grid and no
  chart, so the Lists table and Map plot are **MD3-tokened compositions** (md-* primitives +
  semantic HTML + inline SVG) — never a third-party table/chart lib.
- **Forbidden:** MUI, `<span>`/`<div>` as UI primitives, ad-hoc styling, `!important`, stray /
  duplicated / patch CSS, premature visual customization. Plug-and-play only.
- **Changes too:** when we later modify something, the change is made with **other MD3 /
  Material Web components** — recompose standard MD3; never a custom hack, never MUI.
- No visual customization yet. All look comes from **MD3 `:root` tokens**, re-skinned later via
  the **Settings → Design page** (toward the Claude aesthetic). Re-skinning never touches
  components.

## DESIGN START-STATE (MD3 tokens — user-provided; clean & restrained like Claude)
Initial MD3 `:root` design tokens (the Settings → Design page tunes them later). Clean, restrained,
readable, a pleasure to use — never massive type, generous-but-tight spacing.
- **Surface greys (light→dark):** `#FFFFFF` · `#FEFDFC` · `#FCFBF9` · `#F8F7F3` · `#F4F3ED`
  · `#F0EEE6` · `#E8E6DE` (lightest = content/cards; stepping darker for panels, fields,
  hovers, rails, borders — Claude-like).
- **Ink/text:** `#666361` (primary text) · `#ABA9A4` (muted/secondary) · `#DFDDD6`
  (faint / dividers / disabled).
- **Type:** small and clean; modest weights; **no oversized headings**. Hierarchy comes
  from weight + the Inter(body)/Newsreader(titles) roles, not size bloat. Body ~13–14px.
  Inter + Newsreader only — no monospace, no other families.
- **Icons:** common-sense, clean, ~1em, modest — Claude-like.
- **Spacing:** consistent rhythm, airy but tight. **Readability, ease, and pleasure of use
  are the bar.**
- **HOW it's applied = MD3 design tokens as CSS custom properties at `:root`, NOT per-component
  code.** Set `--md-sys-color-*`, `--md-sys-typescale-*`, `--md-ref-typeface-*` once; every
  `md-*` element inherits. Map: greys → `--md-sys-color-surface` + `surface-container*` ramp;
  inks → `--md-sys-color-on-surface = #666361`, `on-surface-variant = #ABA9A4`,
  `outline/outline-variant = #DFDDD6`; type → `--md-ref-typeface-plain = Inter`,
  `--md-ref-typeface-brand = Newsreader`. Components **inherit automatically**; never style a
  component one-off. Re-skinning later (toward Claude) = changing these tokens only.

## MD3 / MATERIAL WEB — USE THE FULL KIT (never bare-minimum)
Every UI element in a spec box and in code must name its **specific `md-*` element +
variant + key props**, chosen as the right tool for the job from the full surface —
not the first/easiest. "A button" / "a dropdown" is a shortcut and is **not acceptable**.
- Buttons: `md-filled-button` · `md-outlined-button` · `md-text-button` · `md-elevated-button`
  · `md-filled-tonal-button` · `md-icon-button` · `md-fab` — choose by intent.
- Selection: `md-outlined-select`/`md-filled-select` + `md-select-option` (short fixed sets) ·
  `md-menu` + `md-menu-item` (action menus) · `md-radio` · searchable = typeahead over
  `md-list` (MD3 has no Autocomplete component).
- Table: **MD3 has NO data grid** → the Lists table is a tokened composition (semantic
  table/CSS-grid + `md-*` cell controls + sticky columns).
- Inputs: `md-outlined-text-field`/`md-filled-text-field` · `md-checkbox` · `md-switch` ·
  `md-slider` · chips `md-chip-set` + `md-assist/filter/input/suggestion-chip`.
- Structure: `md-dialog` · `md-list` + `md-list-item` · `md-tabs` + `md-primary-tab`/
  `md-secondary-tab` · `md-divider` · `md-elevation` · `md-linear-progress`/`md-circular-progress`
  · `md-icon` · `md-ripple`/`md-focus-ring`. (No app-bar/drawer/tooltip/snackbar component →
  compose from semantic layout + tokens.)
- **Spec rule:** a box that describes UI is incomplete until it states the exact `md-*`
  element + variant + props for each element (table/plot = the MD3-tokened composition).

## HANDSHAKE / submit control
The guide (`src/guide.jsx`, the `.io`) needs an MD3 submit/confirm control (e.g. an
`md-filled-button`) so the user can signal agreement on a box. Honest mechanism: the sandbox
cannot read the user's browser; so "submit" = the user's signal, and the durable record is the
assistant committing `done:true` into the guide source. Build the control with Material Web.

## METHOD
1. Read the relevant source.
2. Write **one box, in order**, fully and losslessly **INTO `src/guide.jsx`** as that
   checkbox's expandable detail (the item's `d` field, rendered as an expandable panel),
   then **commit + push so the `.io` SHOWS the longform.** A box written only in chat does
   NOT count — the `.io` must never be bare bullet labels. PORT the already-written boxes
   into the guide now: **Box 1 = the Material-Design-only law** (in this file) and **Box 2 =
   the Type & Icon system** (in this file / chat). Then every remaining Phase-0 item and
   every page/module box gets its own longform `d`. Hundreds of boxes, each with real detail.
3. Declare it "entirely lossless." User confirms.
4. Next box. Repeat until the whole app is captured. Then verify, then archive, then build.
- The checklist lives in `src/guide.jsx` (a pure-MD3/Material-Web guidebook); the `.io` renders ONLY the
  guide (`src/main.jsx` → `Guide`). The old app is NOT imported (out of the build graph) but
  NOT yet archived.

## STATUS (where we are)
- **Box 1 — DONE:** "Material Design 3 (Material Web) is the only component kit" (the build law
  above, incl. changes-via-MD3). Its substance is fully captured in the Material-Design-3-only
  section of this file.
- **Relationship Engine — DONE (out of order, valid):** `statusFor` zone map — axes, the
  4×6 `GRID`, lookup, `X_BOUNDS`/`Y_BOUNDS`, `CELL_RECTS`, all 14 `STATUSES` (tone/color/
  text/border/strategy/action verbatim), `STATUS_ORDER`, white-text rule — written into
  `src/guide.jsx` as the "Relationship engine" item's detail, verbatim from `data.js`.
- **Book:** `docs/STAKEHOLDR_BOOK.md` has Parts I–II in prose; Part III+ pending.
- **NEXT (DO FIRST): CLEAN UP & REORGANIZE `src/guide.jsx`.** The user reports it looks
  disorganized/"vibed" on the `.io`: inconsistent items, only 2 rows (Ecosystem,
  Relationship engine) carry longform — the rest are bare bullets. Make it a clean,
  consistent MD3 structure (clear phases; every box expands to its own longform `d`;
  apply the palette/type start-state via MD3 `:root` tokens). THEN port Box 1 (MD3 law) and
  Box 2 (Type & Icon) in as longform, and continue in order. The `.io` must look clean
  and every row must have real detail — never bullets-only.

## Engineering discipline
Work in the code, fix at the source, single-source, replace-don't-duplicate, verify it
renders with zero console errors, confirm with the user. The `.io` is the review surface;
the sandbox cannot load `*.github.io`, so the user is the eyes — push small, confirm.
