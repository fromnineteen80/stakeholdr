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
.io** (`src/guide.jsx`), box by box — then rebuild the app fresh on MUI **from that
capture**.

## What "lossless" means (non-negotiable)
Every field, value, rule, formula, and behavior is written out as **ACTUAL CONTENT, never a
label**. A line never *names* a thing ("Community — every field"); it *contains* the thing
(each field's type, allowed values, default, required-ness, cascades, validation, what it
drives). Enough to rebuild faithfully **with the old code gone**. Hundreds of granular boxes,
each with real longform detail.

## DO NOT archive or delete the old code
The old app source is still in `src/` (`app.jsx`, `sheet.jsx`, `data.js`, `store.js`, etc.)
— it is your **RESEARCH ORACLE**. Read it to write the boxes. Do **NOT** move or delete it
until the capture is verified complete. (The `.io` renders only `src/guide.jsx` via
`src/main.jsx`; the old code is already out of the Vite build graph, so it can't contaminate
the rebuild — but it must stay for research.)

## How to work — BABY STEPS (this is the trust contract)
**ONE small change → build (guard: push ONLY if it compiles) → push → tell the user exactly
what you did → WAIT for the user to confirm → next.** No batches. Ever. The sandbox **cannot
load github.io**, so the **user is the eyes** — you push, they verify on the `.io`.

## Where the capture goes
Into `src/guide.jsx`, as each checklist item's expandable detail (`d` field, rendered in an
MUI `Accordion`). A box written only in chat does **not** count — it must render on the `.io`.
After the user confirms a box, seal it by setting `done: true` on that item and committing.

## Organization (currently wrong — fix it)
Organize by **DOMAIN**. Right now "Ecosystem" and "Relationship engine" are wrongly dumped
under "Phase 0 · Assemble the foundation" — they are APP KNOWLEDGE and must move to a proper
domain section. Phase 0 = SETUP ONLY (MUI install, theme tokens, fonts).

## MUI-only (the build law)
Every element is a **standard MUI component** or a composition of them, named explicitly with
its variant (e.g. `Autocomplete` vs `Select`; `DataGrid` vs `Table`; `Button variant` vs
`IconButton`) — use the **full library**, the right tool, never the bare minimum. **Changes
are made with OTHER MUI components, never custom hacks.** Forbidden: `<span>`/`<div>` as UI,
ad-hoc/inline styling, `!important`, stray/duplicated CSS, premature customization. Theming
via `createTheme({ palette, typography, shape, components }) + ThemeProvider` — a **single
source**; define a token once → every component inherits it; never style a component one-off.

## Fonts & colors — ONLY what the user authorized
- **Type: Inter only.** Do NOT introduce Newsreader, IBM Plex, or any font the user didn't
  ask for. The old app's CSS used others; that does **not** authorize them. (The previous
  session wrongly inserted IBM Plex/Newsreader — do not repeat that mistake.)
- **Palette (theme tokens):** surfaces light→dark `#FFFFFF · #FEFDFC · #FCFBF9 · #F8F7F3 ·
  #F4F3ED · #F0EEE6 · #E8E6DE`; ink `text.primary #666361 · text.secondary #ABA9A4 ·
  text.disabled #DFDDD6`. Small, clean type; modest weights; airy-but-tight spacing;
  readability/ease/pleasure first — clean like Claude.

## Key files
- `src/guide.jsx` — the `.io` build guide (where boxes go). `src/main.jsx` renders only it.
- `CLAUDE.md` — fuller mandate (auto-loads each session).
- `APP_SPEC.md` — functional spec. `chats/chat1.md` — design rationale + full roadmap.
- `src/*` (old app) and `project/*` (`db.js` schema, `HANDOFF.md`, etc.) — the research oracle.

## When the research is COMPLETE — what the old code becomes, and what you build FROM / WITH
Once the lossless capture is **verified complete** (every page, field, value, rule, and
behavior written into the guide as actual content):
1. **THEN — and only then — the old code goes away:** move all of `src/` (except `main.jsx`
   + `guide.jsx`) into `archive/src/` (move, do NOT delete). It served as the oracle; it must
   no longer be read or imported. The rebuild is genuinely fresh-eyes.
2. **You build FROM:** the **single source of truth** — the captured boxes in `src/guide.jsx`,
   plus the book and `APP_SPEC.md`. **Not** the old code.
3. **You build WITH:** **MUI, only.** Standard Material Design components (the full library;
   the exact component + variant named for each element) assembled into the app, themed by
   **one MUI theme** (`createTheme`: `palette` = the grey/ink tokens above; `typography.fontFamily`
   = **Inter**). No custom CSS, no non-MUI elements, no fonts beyond Inter.

In one line: **research → lossless single source of truth in the guide → old code archived away
→ rebuild the whole app from that capture, with MUI + the Inter/palette theme.**

## First actions in the new session
1. Read this file + `CLAUDE.md` fully; skim `APP_SPEC.md`.
2. **Reorganize the guide by domain** — ONE small commit, push, ask the user to confirm on the `.io`.
3. Then write the boxes one at a time, lossless, into `src/guide.jsx` — confirm each before the next.
