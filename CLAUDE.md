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

## MATERIAL-DESIGN-ONLY (the build law)
- Every UI element is a **standard MUI component** or a composition of them. Installed:
  `@mui/material@^6`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material@^6`. Icons
  are MUI icon components (e.g. `import ChecklistIcon from '@mui/icons-material/Checklist'`)
  — never hand-rolled `<span>` glyphs.
- **Forbidden:** `<span>`/`<div>` as UI primitives, ad-hoc styling, `!important`, stray /
  duplicated / patch CSS, premature visual customization. Plug-and-play only.
- **Changes too:** when we later modify something built with MUI, the change is made with
  **other MUI components** — recompose standard Material components; never a custom hack.
- No visual customization yet. All look comes from **theme tokens**, re-skinned later via
  the **Settings → Design page** (toward the Claude aesthetic). Re-skinning never touches
  components.

## DESIGN START-STATE (theme tokens — user-provided; clean & restrained like Claude)
Initial MUI theme tokens (the Settings → Design page tunes them later). Clean, restrained,
readable, a pleasure to use — never massive type, generous-but-tight spacing.
- **Surface greys (light→dark):** `#FFFFFF` · `#FEFDFC` · `#FCFBF9` · `#F8F7F3` · `#F4F3ED`
  · `#F0EEE6` · `#E8E6DE` (lightest = content/cards; stepping darker for panels, fields,
  hovers, rails, borders — Claude-like).
- **Ink/text:** `#666361` (primary text) · `#ABA9A4` (muted/secondary) · `#DFDDD6`
  (faint / dividers / disabled).
- **Type:** small and clean; modest weights; **no oversized headings**. Hierarchy comes
  from weight + the serif/mono roles, not size bloat. Body ~13–14px.
- **Icons:** common-sense, clean, ~1em, modest — Claude-like.
- **Spacing:** consistent rhythm, airy but tight. **Readability, ease, and pleasure of use
  are the bar.**
- **HOW it's applied = MUI's native theming API, NOT custom code.** Configure
  `createTheme({ palette, typography, shape, components })` + `ThemeProvider` — standard
  MUI, zero custom CSS / styled hacks / per-component styling. Map: greys →
  `palette.background.default`/`paper` + `palette.grey.*` + `palette.divider`; inks →
  `palette.text.primary = #666361`, `text.secondary = #ABA9A4`, `text.disabled = #DFDDD6`;
  type rules → `typography` (fontFamily Inter, restrained sizes/weights). Components
  **inherit automatically**; never style a component one-off. Re-skinning later (toward
  Claude) = changing these theme tokens only.

## MUI — USE THE FULL LIBRARY (never bare-minimum)
Every UI element in a spec box and in code must name its **specific MUI component +
variant + key props**, chosen as the right tool for the job from the full surface —
not the first/easiest. "A button" / "a dropdown" is a shortcut and is **not acceptable**.
- Buttons: `Button` (variant `contained|outlined|text`) · `IconButton` · `Fab` ·
  `ToggleButton/ToggleButtonGroup` — choose by intent.
- Selection: `Select`+`MenuItem` (short fixed sets) · `Autocomplete` (searchable/large/
  multi/typeahead) · `Menu` · `NativeSelect` · `RadioGroup`.
- Table: **`DataGrid`** for the Lists table (sort/filter/reorder/virtualize) vs `Table` for
  simple static lists.
- Inputs: `TextField` (variants/adornments) · `Checkbox` · `Switch` · `Slider` · `Chip`.
- Structure: `Dialog` · `Drawer` · `Popover` · `Menu` · `Accordion` · `Card` · `Tabs` ·
  `Snackbar`/`Alert` · `Tooltip` · `Stepper` · `Badge` · `LinearProgress`.
- **Spec rule:** a box that describes UI is incomplete until it states the exact MUI
  component + variant + props for each element.

## HANDSHAKE / submit control
The guide (`src/guide.jsx`, the `.io`) needs an MUI submit/confirm control (e.g. a
`Button`) so the user can signal agreement on a box. Honest mechanism: the sandbox cannot
read the user's browser; so "submit" = the user's signal, and the durable record is the
assistant committing `done:true` into the guide source. Build the control with MUI.

## METHOD
1. Read the relevant source.
2. Write **one box, in order**, fully and losslessly **INTO `src/guide.jsx`** as that
   checkbox's expandable detail (the item's `d` field, rendered in an MUI `Accordion`),
   then **commit + push so the `.io` SHOWS the longform.** A box written only in chat does
   NOT count — the `.io` must never be bare bullet labels. PORT the already-written boxes
   into the guide now: **Box 1 = the Material-Design-only law** (in this file) and **Box 2 =
   the Type & Icon system** (in this file / chat). Then every remaining Phase-0 item and
   every page/module box gets its own longform `d`. Hundreds of boxes, each with real detail.
3. Declare it "entirely lossless." User confirms.
4. Next box. Repeat until the whole app is captured. Then verify, then archive, then build.
- The checklist lives in `src/guide.jsx` (a pure-MUI guidebook); the `.io` renders ONLY the
  guide (`src/main.jsx` → `Guide`). The old app is NOT imported (out of the build graph) but
  NOT yet archived.

## STATUS (where we are)
- **Box 1 — DONE:** "Material Design (MUI) is the only component kit" (the build law above,
  incl. changes-via-MUI). Its substance is fully captured in the Material-Design-only
  section of this file.
- **Relationship Engine — DONE (out of order, valid):** `statusFor` zone map — axes, the
  4×6 `GRID`, lookup, `X_BOUNDS`/`Y_BOUNDS`, `CELL_RECTS`, all 14 `STATUSES` (tone/color/
  text/border/strategy/action verbatim), `STATUS_ORDER`, white-text rule — written into
  `src/guide.jsx` as the "Relationship engine" item's detail, verbatim from `data.js`.
- **Book:** `docs/STAKEHOLDR_BOOK.md` has Parts I–II in prose; Part III+ pending.
- **NEXT (DO FIRST): CLEAN UP & REORGANIZE `src/guide.jsx`.** The user reports it looks
  disorganized/"vibed" on the `.io`: inconsistent items, only 2 rows (Ecosystem,
  Relationship engine) carry longform — the rest are bare bullets. Make it a clean,
  consistent MUI structure (clear phases; every box expands to its own longform `d`;
  apply the palette/type start-state via `createTheme`). THEN port Box 1 (MUI law) and
  Box 2 (Type & Icon) in as longform, and continue in order. The `.io` must look clean
  and every row must have real detail — never bullets-only.

## Engineering discipline
Work in the code, fix at the source, single-source, replace-don't-duplicate, verify it
renders with zero console errors, confirm with the user. The `.io` is the review surface;
the sandbox cannot load `*.github.io`, so the user is the eyes — push small, confirm.
