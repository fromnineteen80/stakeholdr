# Stakeholdr — Claude Code Handoff

This app was designed and fully prototyped as a browser-run React app (JSX compiled
in-browser via inline Babel). It is feature-rich and visually complete. The job now
is to move it onto a real build + backend **without losing the design or the demo**.

Product name: **Stakeholdr**.

---

## Do these in ORDER. Do not skip ahead.

### PHASE 0 — GitHub + live preview (do this FIRST, before changing anything)
- Create a repo and push the project **exactly as-is** (the inline-Babel build).
- Enable **GitHub Pages** (or Netlify/Vercel — all free) so `Stakeholder Tool.html`
  loads at a public URL. This is the client demo and your "see it as we build" preview.
- Add a **GitHub Actions** workflow that deploys on every push to `main`.
- ✅ Success check: the existing app loads and works at the Pages URL, data persisting
  in localStorage. DO NOT delete or overwrite this working build in later phases —
  it stays live until the React build is proven (see Phase 1 guardrails).

### PHASE 1 — Adopt React + Vite (a PORT, not a redesign)
This is the highest-risk phase for the design. Hard rules:
- **`styles.css` copies over BYTE-FOR-BYTE unchanged.** The entire visual design lives
  here. Do not "clean it up," rename classes, or restructure it.
- **Components keep identical JSX and class names.** The only allowed change is module
  plumbing: replace the `window.X = X` global exports and bare cross-file references
  with proper ES `import`/`export`. Behavior and markup stay the same.
- Convert `data.js`, `store.js`, `db.js`, `components.jsx`, `sheet.jsx`,
  `sheet-modals.jsx`, `community.jsx`, `community-modal.jsx`, `plan.jsx`, `landing.jsx`,
  `profiles.jsx`, `map.jsx`, `scoring.jsx`, `setup.jsx`, `settings.jsx`, `help.jsx`,
  `messaging.jsx`, `users.jsx`, `app.jsx` from globals → ES modules.
- Pin the same React 18 the prototype uses.
- **Migrate into a new branch/folder; keep the inline-Babel build live on Pages.**
  Verify the Vite build **screen-by-screen against the original** (List, Scoring, Map,
  Plan, Community, Setup, Help, Profile, Messaging, all modals/editors) before pointing
  the demo URL at it.
- ✅ Success check: Vite build is visually identical to the prototype on every screen,
  no console errors, all CRUD still persists via localStorage.

## DESIGN PRESERVATION — specific regressions to guard against
These are hard-won design details that took heavy iteration. A port can silently
break any of them. Verify each against the live inline-Babel build, screen-by-screen.

**Universal layout primitives (must stay identical):**
- **List bar** = the `.nav-tabs` row (List · Scoring · Map · Plan · Community · Setup ·
  Help on the left; chevron · `+` create · messages buttons right-justified). Brand row
  (app icon + name + profile) sits ABOVE it with the SAME 28px L/R inset so all three
  rows align edge-to-edge.
- **Explainer bar** = one shared `.scoring-explainer-bar`, full-bleed under the list
  bar, same `--bg` color as the list bar, 1px bottom border on ALL of them, hidden by
  default, toggled by the list-bar chevron (`expand_more`/`expand_less`), state
  remembered per view. Text-only bars run full width; control bars (List/Plan/Community)
  PORTAL their toolbar into the bar via `ReactDOM.createPortal` — preserve this.
- **Workspace content card** = `.workspace`, universal 14px top margin + rounded top
  corners on EVERY page, background `--paper-2` (table white) against the `--paper`
  page background.
- **Universal edit page** = `sheet-wrap` → `sheet-toolbar` (back ‹ · title · Save) →
  `plan-body` (left `plan-aside` metadata sidebar + `plan-main` numbered document).
  Plan AND Community editors use this; editors REPLACE the landing grid (early-return),
  they are not modals and not siblings of the grid.
- **single-page** layout (Profile, Settings, Plan/Community read-only) = max-width
  centered, light-grey, rounded top corners, 28px inset, on the page background — never
  a div-in-div with double backgrounds.

**Color/scale rules (no new values ever):**
- Tokens only: `--bg --paper --paper-2 --bg-2 --ink --ink-2 --ink-3 --ink-mute
  --accent --pos --neu --neg --rule --rule-2`.
- Workspace tables: white rows; `#` column and person/group icon column have set
  backgrounds; hover `#FBF7EB`, selected `#FCEFD6` (also used by the workspace dropdown).
- Map zones: top & bottom rows are 5×5; middle rows 5 wide × 2.5 tall. Only **Strategic
  Partner** and **Proactively Defend** zones use WHITE pill/zone text (set at
  `STATUSES.text` in data.js) with a dark dot OUTLINE (`STATUSES.border`); all others
  dark text. Axis ticks: x −10..10 every 1; y −10..10 every 2.5; subtle, OUTSIDE the
  grid; legend bar below is table-white with bolded arrows (uniform `-webkit-text-stroke`,
  NOT font-weight, so ← ↑ ↓ → match).
- Icons are Google Material Symbols (font ligatures via the `Icon` component); sized
  `1em` next to text, never larger than their label.

**Component behaviors that were fussy:**
- `+` create button is context-aware (New stakeholder/teammate/plan/application/
  workspace per active page); the old in-page black "+ New" buttons were removed — do
  not reintroduce them.
- Filter→Sort order; both reuse shared `FilterSection` (each has an "All" chip) and
  `SortFieldList`; Sort has adaptive direction (A→Z/Z→A for text, Oldest/Newest for
  dates) with a grey "Clear all" like the List filter.
- Cmd/Ctrl-K global search overlay; also inline search in each bar.
- Lead pill in Plan tactics = an issues-style `.tag` with avatar+name+×; empty state is
  the same-height/same-color compact "Assign lead…" pill — never a white full-width box.
- Plan/Community entry cards: grey header + footer bands rounded to the card (10px),
  footer anchored to the bottom via `margin-top:auto` (no white gap on short cards).
- Owners render as layered avatars; click to expand the list popover.
- Stakeholder name in tables/scoring is the full clickable cell→profile; the profile is
  the SAME card everywhere (one component), opened layered, with view↔edit toggle.

**Cross-feature integrity (don't fork):** one stakeholder profile component, one
community card (`CommunityModal` view↔edit; `CommunityProfile` is its read-only body),
single `updateCommunityApp` writer, `affiliatedCommunity`/`stakeholderCumulativeUSD`/
`communityEntryAmount`/`communityValueScore` exported once and reused by table, map,
plan, profile. Keep these single-sourced.

### PHASE 2 — Finish app design & features
- **Universal record scaffold** — read `RECORD_SCAFFOLD.md`. Every detail/edit page
  (`record.stakeholder/.plan/.community` + `.edit`) renders through ONE `RecordShell`
  component + ONE authoritative `.record-*` CSS block (end of `styles.css`). FIRST
  cleanup task there: physically delete the ~40 superseded duplicate `.record-*` rules
  that precede the authoritative block (the end-of-file block wins by cascade today, so
  it renders correctly, but the dead duplicates must go — preserving the interleaved
  shared icon-size / `.brand-bar` rules). Then pour the six record types onto it.
- Outstanding design item: the **Community editor's metadata-sidebar split** — it now
  uses the universal edit layout (`sheet-wrap` → `sheet-toolbar` → `plan-body` →
  `plan-main`) but its metadata fields (summary, status, engagement type, owners,
  issues, markets, regions, linked stakeholders) should move into a left `plan-aside`
  sidebar to match the Plan editor's full two-column layout. Keep all fields.
- Sweep for any other half-finished polish; the design system is `styles.css` + the
  CSS variables at its top (`--bg`, `--paper`, `--paper-2`, `--bg-2`, `--ink`,
  `--ink-2/3/mute`, `--accent`, `--pos/neu/neg`, `--rule`). Never invent new colors.

### PHASE 3 — Supabase, multi-user, auth (only after Phases 0–2 are solid)
The app was built with a **single persistence seam** so this is a transport swap, not
a rewrite. Read `db.js` (full schema, RLS notes, realtime mapping) and `store.js`
(the persistence layer) and `BACKEND_TODO.md` first.

**Backend flag:** storage must read an env flag so the free demo and production are the
SAME codebase:
- `local`  → current localStorage + BroadcastChannel (free preview; per-browser data)
- `supabase` → real Supabase client (auth + tables + realtime + row-level security)
Same UI both ways. Flipping the flag + adding keys is the only "go live" step.

**What `store.js` does today (and must keep doing through the flag):**
- `usePersistentState(table, seed)` is the single hook every entity uses.
- `Store.save(table, value)` → becomes a Supabase upsert in supabase mode.
- The BroadcastChannel notify() becomes a Supabase realtime `postgres_changes`
  subscription in supabase mode.

**Entities (each = one Supabase table; schema + columns documented in `db.js`):**
users, appConfig, stakeholders, team, scores, workspaces, stakeholderWorkspaces,
conversations, messages, community, plans.

**Auth (beta model — keep simple, as specified):**
- Sign up with **name, email, password, and an Org Access Code**.
- Codes are generated offline per client (e.g. `HP-GAPP-7Q2X`) and handed to them.
- On signup the code maps the user to that client's **org** and its workspaces; an
  invalid code blocks account creation.
- `local` mode: validate the code against a hardcoded map (no server).
- `supabase` mode: an `org_codes` table; RLS scopes every row to the user's org so
  clients never see each other's data.
- Replace the current FAKE auth (login picks a name + auto-grants manager). Manager vs
  member is a real role on the user row.

**Row-level security (must mirror the UI's edit gates — see BACKEND_TODO.md):**
- scores: a user may write only their own team-member rows.
- workspaces: delete restricted to creator OR manager.
- app_config / users.role / settings: manager only.
- everything scoped to the user's org.

---

## Known risk spots (things likely to surface when wiring Supabase)
- **Per-row write security is not enforced today** — the client trusts the UI. RLS must
  enforce it server-side.
- **IDs are client-generated** (`"sh-"+random`, etc.). Decide: keep client UUIDs or move
  to DB-generated `gen_random_uuid()`. If DB-generated, update create flows.
- **Nested JSON** (scores map, votes map, budget, risk, notesHistory, strategies,
  priorityOverrides) is stored as objects — map to `jsonb` columns or normalize
  (db.js suggests normalized `scores`, `community_votes`, `team_members` tables).
- **`scores` keyed by teamMemberId** — confirm team-member identity survives the move.
- **Timestamps**: createdAt/updatedAt are set client-side; move to DB defaults/triggers.
- **Fiscal-year rollups** (community 3YR total) compute from `dateApproved` + Settings
  fiscal start — verify dates persist correctly once server-backed.
- **currentUser** is per-device localStorage (the session) — becomes the Supabase auth
  session; keep it OUT of the synced tables.

## Verify-nothing-broke checklist (run after Supabase wiring)
- Create / edit / delete each entity → reload → survives, and a SECOND user/browser
  sees it (true multi-user, not just cross-tab).
- Scoring writes only the current user's column; others read-only and update live.
- Workspace/org isolation: a user with one org's code cannot see another org's data.
- Manager-only actions blocked for members at the DB level (not just hidden in UI).
- No console errors on any screen; all screens match the approved design.
