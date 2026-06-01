# BACKEND TODO — read this before wiring Supabase (Claude Code handoff)

These are the two deliberate backend-phase items the client app was built
*around*. Everything else (schema, ids, timestamps, realtime event shape,
cascade cleanup) is already shaped for Supabase. Do NOT ship to real
multi-user production without doing both of these.

────────────────────────────────────────────────────────────────────────
## 1. ROW-LEVEL WRITES  ← the easy-to-forget one. FIX THIS.
────────────────────────────────────────────────────────────────────────
TODAY (`store.js`): `Store.save(table, value)` persists the **entire
collection array** for an entity (e.g. the whole `stakeholders` array) to
localStorage and broadcasts it. This is correct for single-browser / demo
use, but it is **last-write-wins** across users: if User A edits stakeholder
sh-03 and User B edits sh-07 at the same time, whoever saves second
overwrites the other's row because the unit of persistence is the whole array.

REQUIRED FIX when wiring Supabase:
- Change the mutation path so each create/update/delete writes the **single
  changed row**, not the whole collection:
      Store.save(table, value)        ->  supabase.from(table).upsert(changedRow)
      delete                          ->  supabase.from(table).delete().eq('id', id)
- The data model already supports this: every record has a stable `id`
  (crypto.randomUUID) and an `updatedAt` (full ISO) for conflict detection /
  optimistic concurrency. Use `updated_at` for last-modified-wins or a
  version check if you need stricter merge.
- Realtime: subscribe per table with `postgres_changes`; the existing
  `notify(table, payload.new)` callback shape in store.js already matches —
  apply the incoming row into the in-memory collection by id (merge, don't
  replace the array).
- Scores live as `scores[stakeholderId][teamMemberId] = {x,y,createdAt,updatedAt}`.
  In Supabase these are individual `scores` rows (PK: stakeholder_id +
  team_member_id). Write only the one (stakeholder × teammate) row that
  changed — never the whole scores object.

Affected updaters (app.jsx): updateStakeholder, updateWorkspace,
updateCommunityApp, updatePlan, updateScore, updateTeam, addStakeholder,
addWorkspace, addTeamMember, removeWorkspace, removeUser, removeTeamMember,
and the messaging/conversation writers. Each should become a row-scoped
operation against Supabase instead of a `setX(wholeArray)` → `Store.save`.

────────────────────────────────────────────────────────────────────────
## 2. REAL AUTH + ROW-LEVEL SECURITY
────────────────────────────────────────────────────────────────────────
- The demo auto-promotes EVERY login to `role: "manager"` (see `logIn` in
  app.jsx). REMOVE this. Roles must come from the users table / Supabase Auth
  metadata, not be granted on login.
- Wire Supabase Auth (email or SSO). Map the authed user to a `users` row.
- Enforce the RLS policies already drafted in `db.js`:
    * scores: a user may write only rows whose team_member belongs to them.
    * workspaces: delete restricted to created_by OR role='manager'.
    * app_config / users.role: writable only by managers.
    * plans/community: scope writes to owners/team as appropriate.
- The UI already gates affordances on `currentUser.role === "manager"`, but
  client-side gating is cosmetic — RLS is the real enforcement.

────────────────────────────────────────────────────────────────────────
## 3. COUNTRY LIST — replace static snapshot with an API
────────────────────────────────────────────────────────────────────────
`data.js` ships `COUNTRIES` as a hardcoded 2026 snapshot of sovereign states
(used by Settings → Geography → Sites, and anywhere country selection
appears). This was deliberate so the demo runs fully offline with no network
dependency.

REQUIRED FIX for production:
- Replace the static `COUNTRIES` array with a proper source so the list stays
  current and canonical (ISO 3166-1). Options: the REST Countries API
  (restcountries.com), an `@types`/npm ISO-3166 package, or a `countries`
  table seeded from ISO data in Supabase.
- Keep `US_STATES` (ISO 3166-2:US) similarly — a static list is fine, but a
  table/package is cleaner.
- Site shape is `{ id, city, state?, country }`; US sites force
  country = "United States" when a state is chosen. Preserve that rule.

────────────────────────────────────────────────────────────────────────
## 4. UNIVERSAL CUSTOM DROPDOWN — replace native <select> option lists
────────────────────────────────────────────────────────────────────────
TODAY: every dropdown uses a native `<select>` wrapped in `.designed-select`.
That wrapper styles the CLOSED trigger (paper field + chevron, `appearance:
none`), but when opened the browser renders the OPTION LIST natively — that
native popup is what still looks unstyled. CSS cannot style the open list of
a native `<select>`; only a custom JS listbox can.

REQUIRED FIX for production:
- Build ONE custom listbox/combobox component (button trigger + own popup
  rendered in the DOM, keyboard a11y: arrows/Home/End/type-ahead/Esc, ARIA
  role="listbox"/"option") and replace native `<select>`s with it.

⚠️ CRITICAL — DO NOT bulk find/replace. Claude Code MUST review EVERY dropdown
line-by-line, because each was tuned deliberately and they are NOT uniform.
Preserve every existing behavior/variant, including (non-exhaustive):
  * `.designed-select` everywhere = paper trigger + chevron; keep exact look.
  * List explainer "Categories" + "Sites" = MULTI-select checkmark popovers
    (FilterSection / cat-opt list), NOT single-select. Keep multi + counts.
  * Filter / Sort popovers (sheet-modals.jsx, components.jsx SortFieldList,
    FilterSection) = custom popovers already; unify styling, keep logic
    (adaptive A→Z / Oldest-Newest / Low-High by field type, clear-all).
  * Plan/Community landing Filter·Sort·See-all + segment/market/region
    dropdowns in Workspaces explainer (cases/language/beenhere icons).
  * Settings designed-selects: fiscal month/day, time zone, theme auto-switch
    time (12h/30min), Sites add-row state↔province↔country that SWAPS option
    set + relabels ("Select state/province/country") by `mode`.
  * Stakeholder card cascading selects: category→type, market→region,
    site→auto-fills state; geography; status; title.
  * Cell-level inline `<select className="cell-select">` in table rows.
  * `cell-select`, `plan-model-pick` (auto-width sector/scenario), owner
    pickers, autocomplete fields (these are inputs, not selects — leave).
- Match each control's current width rules (auto-width vs min-width), colors
  (paper vs --paper-2 vs explainer --bg), and font sizes.
- Acceptance: open state matches app styling everywhere; zero native popups;
  no dropdown loses a feature it had before.

────────────────────────────────────────────────────────────────────────
## 5. PRESENCE — the "online" avatar stack must be REAL
────────────────────────────────────────────────────────────────────────
TODAY: the top-right avatar stack and the People sidebar read a static
`presence: "online"|"away"|"offline"` field on each seed user in `data.js`.
The stack shows the first 3 non-system users and a `+N` overflow badge — but
that N (and who is shown) is hardcoded seed data, NOT real presence.

REQUIRED FIX for production:
- Drive presence from a real source (Supabase Realtime Presence channel, or
  a `last_seen` heartbeat column). Mark a user online when they have a live
  session; away/offline by heartbeat age.
- The avatar stack must reflect the ACTUAL set of people currently online and
  the `+N` overflow must be the TRUE remaining count of online users beyond
  the 3 shown — never a static number. Exclude the system "Reminders" bot.
- The People sidebar list should likewise show real online/away/offline
  status, updating live as people connect/disconnect.

────────────────────────────────────────────────────────────────────────
## Reference
- Full schema (tables, columns, FKs with `on delete cascade`, RLS) lives in
  `db.js` as commented SQL.
- Persistence/realtime contract lives in `store.js`.
- Verification checklist for any new feature: `VERIFICATION.md`.
- Architecture overview: `MASTER_PROMPT.md`.
