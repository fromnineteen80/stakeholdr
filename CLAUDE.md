# Stakeholdr — Project Constitution (read first, every session)

This file loads automatically at the start of every Claude Code session. It is the
**durable memory** for this project. Read it fully before doing anything, then read the
source-of-truth docs it points to. Never lose, ignore, or contradict it. Keep it current.

## What this is
**Stakeholdr** (a.k.a. Soappbox) — a stakeholder-engagement platform for government
affairs, public policy, and community teams. It maps stakeholders by influence ×
alignment, prioritizes engagement (the SEP model), plans it, and tracks the community
investment that creates shared value. It was designed and fully prototyped in **Claude
Design** (inline-Babel React) and is being migrated to a real build (**Vite + React 18,
ES modules**) **without losing the design or the demo**.

**Source of truth — READ THESE before building:**
- `project/MASTER_PROMPT.md` — complete design + data + math spec.
- `project/HANDOFF.md` — phased plan + design-preservation regressions to guard against.
- `project/RECORD_SCAFFOLD.md` — the record scaffold intent.
- `project/db.js` — full Supabase schema, RLS, realtime contract.
- `project/BACKEND_TODO.md` — required backend fixes before multi-user.
- `src/styles.css` — the design system; the CSS variables at the top are the ONLY colors.
- `project/Stakeholder Tool.html` — the working visual ground-truth demo.

## Engineering discipline (HARD RULES — non-negotiable)
1. **Work IN the code, never around it.** Fix problems at their source. No band-aids,
   no workarounds layered on top of a flaw.
2. **Never patch over wrong/incomplete code — replace it cleanly.** Leave nothing stray,
   dead, duplicated, or half-wired. If something is wrong or unfinished, fix the real thing.
3. **Single source, always.** One component / helper / CSS rule per job. Never fork or
   duplicate — extend the existing thing.
4. **No `!important`. Ever.** Resolve specificity and structure properly.
5. **No throwaway `<span>` / wrapper hacks** for layout. Use real structure + the system.
6. **Tokens only — never invent colors or values.** Use the CSS variables at the top of
   `styles.css` (`--bg --paper --paper-2 --bg-2 --ink/-2/-3/-mute --accent --pos --neu
   --neg --rule --rule-2`).
7. **Compiling ≠ working. Verify it actually RENDERS** before calling anything done. The
   user reviews on the live `.io`; never claim "done" on a build that has not been seen
   rendering.
8. **No modals unless explicitly required.** Records are full pages (view + edit).
9. **Elegant, minimal, editorial.** Match the existing visual vocabulary. No filler, no
   AI-slop, no em dashes in product copy.

## Architecture — the record scaffold (single source)
One elegant, flexible shell that ALL record types pour through (think Claude's collapsible
sidebar, but one LEFT and one RIGHT):
- **Flexible width**; main content is flexible.
- **Left sidebar (collapsible):** the record's **sub-pages** — the elements of a plan /
  community application / stakeholder intelligence / workspace. Navigation.
- **Right sidebar (collapsible):** the **metadata**.
- **Main content:** the active sub-page; each sub-page contains **sections**. What renders
  depends on **type × mode**.
- **Adaptive top bar:** clean, logical, well-built; its contents change by type × mode.
- Per type × mode, single-source modules: `record.[type].view` / `record.[type].edit`
  for **plan, community, stakeholder, workspace, setting**.
- **Map** is done; it goes INTO the scaffold with a **right sidebar only** (the scorecard),
  no left sub-page nav.

## Persistence / backend
- Single seam: `usePersistentState(table, seed) → Store` (`src/store.js`). The UI never
  touches the transport.
- **Now:** localStorage + BroadcastChannel with the full seed ecosystem/samples.
  **Demo-live; do NOT wire Supabase yet** — just keep the swap path obvious.
- **Later:** transport swap inside `store.js` to Supabase (upsert + `postgres_changes`),
  per `db.js`. Required pre-prod fixes: (1) per-row writes — today it saves whole arrays
  (last-write-wins); (2) real auth + RLS. See `BACKEND_TODO.md`.

## Project state (the user is the authority — keep this current)
- **Designed properly (PRESERVE, do not touch):** List/workspace table; Master view;
  Plan & Community landing pages; Scoring; Map; layout primitives (nav-tabs bar, explainer
  bar with portaled toolbars, workspace card); the design system; the shared math
  (`weightedCoord`, `statusFor`, `valueScore`, `sepScore`, budget rollups); the single
  stakeholder-profile concept. Settings is generally correct (its subpage flow).
- **In process (build on the scaffold):** the record view + edit pages for all types.
- **Real but ~50% complete (finish; do NOT assume — the user introduces the elements):**
  Plan and Community feature sets. We currently have only the plan algorithms.
- **Must be made real:** Messaging, including the `@ / # / ^` autocomplete link feature —
  clean and real.
- **More coding to do:** workHQ. Settings eventually becomes `record.setting`.
- **Future build items / features:** keep in mind, do not preempt.

## Build sequence (agreed)
1. Make the migrated app **render** with its full sample ecosystem, live on the `.io`.
2. Backend/persistence: intuitive, verified, Supabase-ready — but local for now.
3. App structure wired **with the scaffold in mind** (clean entry points; nothing to rip
   out later).
4. Build the **scaffold** (single source), then pour types through it as the user
   introduces elements.

## Working agreement
- The user reviews on the live `.io`; surface changes there and iterate screen-by-screen.
- When unsure whether something is "properly designed," **ASK** — never rebuild working
  things, never replicate what exists.
- Update this file as the project evolves so context is never lost.
