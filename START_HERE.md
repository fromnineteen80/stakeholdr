# START HERE — Stakeholdr handoff (read this first, then CLAUDE.md)

You are inheriting this project mid-flight. The previous session failed by **vibing and
producing shallow, labeled, half-finished work**. Do the exact opposite: exhaustive,
source-true, and **baby-stepped**.

## What went wrong here (read plainly — this is why you must work differently)
The previous session (Claude) failed, repeatedly and avoidably:
- It **vibed** — produced plausible, shallow output instead of exhaustive, source-true work.
- It wrote **bullets and labels instead of lossless content** — *naming* things ("Community —
  every field") instead of writing the actual fields, values, rules, and behavior.
- It **talked and meta-debated instead of doing the work**, and kept **agreeing it had failed
  without ever changing**.
- It **rebelled against the actual task**: getting the checklist on the `.io` **organized and
  filled with lossless research and writing to be our single source of truth.** That — not new
  features — is THE job, and it was avoided turn after turn.
- It **invented things the user never authorized** (inserted IBM Plex and Newsreader fonts; the
  user only authorized **Inter**).
- It worked in **big unverified batches** and broke the organization (app-knowledge dumped under
  "Assemble the foundation").

## The current state — there are MASSIVE problems
Assume the app is **broken and incomplete**. The `.io` shows a half-built, disorganized build
guide; earlier attempts to rebuild pages were reverted; only a couple of guide items have real
detail; the organization is wrong; unauthorized fonts were added. **Your job is to fix it the
right way:** build the lossless single source of truth in the guide first, then rebuild from it
— in baby steps the user confirms.

## The job, in one sentence
Capture the ENTIRE existing app as a **lossless spec written into the build guide on the
.io** (`src/guide.jsx`), box by box — then rebuild the app fresh on Material Design 3
(Material Web) **from that capture**.

## What "lossless" means (non-negotiable)
Every field, value, rule, formula, and behavior is written out as **ACTUAL CONTENT, never a
label**. A line never *names* a thing ("Community — every field"); it *contains* the thing
(each field's type, allowed values, default, required-ness, cascades, validation, what it
drives). Enough to rebuild faithfully **with the old code gone**. Hundreds of granular boxes,
each with real longform detail.

## DO NOT delete the old code
The old app source is your **RESEARCH ORACLE**. It now lives in `archive/src/` (the ported
modules) and `project/` (the original handoff bundle) — moved out of `src/` and out of the
Vite build graph so it can't contaminate the rebuild, but **NOT deleted**. Read it to write
the boxes. It stays until the capture is verified complete against it, module by module.

## How to work — BABY STEPS (this is the trust contract)
**ONE small change → build (guard: push ONLY if it compiles) → push → tell the user exactly
what you did → WAIT for the user to confirm → next.** No batches. Ever. The sandbox **cannot
load github.io**, so the **user is the eyes** — you push, they verify on the `.io`.

## Where the capture goes
Into `src/guide.jsx`, as each checklist item's expandable detail (`d` field, rendered in an
an expandable detail). A box written only in chat does **not** count — it must render on the `.io`.
After the user confirms a box, seal it by setting `done: true` on that item and committing.

## Organization (currently wrong — fix it)
Organize by **DOMAIN**. Right now "Ecosystem" and "Relationship engine" are wrongly dumped
under "Phase 0 · Assemble the foundation" — they are APP KNOWLEDGE and must move to a proper
domain section. Phase 0 = SETUP ONLY (Material Web install, MD3 :root tokens, fonts).

## Canonical UI only (the build law — RULED 2026-06-13; supersedes the MD3 wording below)
Every element is a component from **this repo's own Canonical UI design system**
(`design-system/` — un-branded, token-driven `<ui-*>` web components) or a composition of
them, named explicitly with its variant — use the **full kit**, the right tool, never the
bare minimum. The **manifest is binding** (`design-system/manifest.json`: every component,
tag, props, states, consumed tokens — assemble, never invent) and the **`--ui-sys-*` token
layer** (`design-system/tokens.css`) is the only legal styling surface. **NEVER MUI /
`@mui/*`, never Tailwind, never Angular, never `@material/web` in the rebuilt app** (the
guide page still renders with Material Web as a temporary scratch surface — it is not the
app). A need no component/token covers is a GAP: build it into `design-system/`, register
it in the manifest, THEN use it. Forbidden: hand-rolled UI, `<span>`/`<div>` as UI,
ad-hoc/inline styling, `!important`, stray/duplicated CSS, premature customization.
Re-skinning = editing `--ui-sys-*` tokens only; never style a component one-off.
Full ruling + rationale + the md-*→ui-* translation table: guide Box 1 and `CLAUDE.md`.

## Fonts & colors — ONLY what the user authorized
- **Type: Inter (body/UI) + Newsreader (titles) only.** Inter → `--ui-ref-typeface-body`;
  Newsreader → `--ui-ref-typeface-title` (titles only). Do NOT introduce IBM Plex Mono,
  Roboto, or any other family. (A previous session wrongly inserted IBM Plex Mono — removed.)
  Icons = Material Symbols ligatures via `<ui-icon>`.
- **Palette (already encoded in `design-system/tokens.css`):** surfaces light→dark `#FFFFFF ·
  #FEFDFC · #FCFBF9 · #F8F7F3 · #F4F3ED · #F0EEE6 · #E8E6DE` = `--ui-ref-neutral-0..6`; ink
  `#666361 · #ABA9A4 · #DFDDD6` = `--ui-ref-ink-strong/-muted/-faint`; the 14 zone colors =
  `--ui-sys-zone-*`. Small, clean type; modest weights; airy-but-tight spacing; readability/
  ease/pleasure first — clean like Claude.

## Key files
- `src/guide.jsx` — the `.io` build guide (where boxes go). `src/main.jsx` renders only it.
- `CLAUDE.md` — fuller mandate (auto-loads each session; carries the CURRENT status).
- `design-system/` — the Canonical UI kit: `tokens.css` + `manifest.json` + `components/` +
  `preview.html` + `wireframes.html` (standalone Pages entries).
- `APP_SPEC.md` — functional spec. `chats/chat1.md` — design rationale + full roadmap.
- `archive/src/*` and `project/*` (`HANDOFF.md`, `BACKEND_TODO.md`, etc.) — the research oracle.

## When the research is COMPLETE — what the old code becomes, and what you build FROM / WITH
Once the lossless capture is **verified complete** (every page, field, value, rule, and
behavior written into the guide as actual content):
1. **The old code retires as oracle** (it is already parked in `archive/src/` + `project/`,
   out of the build graph): after the verification audit it must no longer be read or
   imported. The rebuild is genuinely fresh-eyes.
2. **You build FROM:** the **single source of truth** — the sealed boxes in `src/guide.jsx`,
   plus the book and `APP_SPEC.md`. **Not** the old code.
3. **You build WITH:** **Canonical UI (`design-system/`), only.** Real `ui-*` components
   assembled per the binding manifest (the exact `ui-*` element + variant named for each
   element), themed by **one token layer** (`design-system/tokens.css`: the grey/ink/zone
   tokens; Inter body, Newsreader titles). No custom CSS beyond the token+layout layer, no
   non-system elements, no fonts beyond Inter + Newsreader.

In one line: **research → lossless single source of truth in the guide → verification audit
→ rebuild the whole app from that capture, with Canonical UI + the Inter/Newsreader/palette
tokens.**

## First actions in the new session
1. Read this file + `CLAUDE.md` fully; skim `APP_SPEC.md`.
2. **Reorganize the guide by domain** — ONE small commit, push, ask the user to confirm on the `.io`.
3. Then write the boxes one at a time, lossless, into `src/guide.jsx` — confirm each before the next.
