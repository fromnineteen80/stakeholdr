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

## METHOD
1. Read the relevant source.
2. Write **one box, in order**, fully and losslessly (or the book's next prose chunk).
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
- **NEXT:** continue at **Box 2**, in order from the top of the guide, to the lossless
  standard above.

## Engineering discipline
Work in the code, fix at the source, single-source, replace-don't-duplicate, verify it
renders with zero console errors, confirm with the user. The `.io` is the review surface;
the sandbox cannot load `*.github.io`, so the user is the eyes — push small, confirm.
