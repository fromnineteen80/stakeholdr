# Build Verification Prompt — Persistence & Supabase Readiness

Run this audit against any feature before calling it "done." It mirrors the
pattern we've used for every build (Stakeholders, Scores, Community, Plans).

## 1. State source
- [ ] Feature state is created with `usePersistentState("<key>", D.<SEED>)` — NOT
      plain `useState`. Plain `useState` is fine only for transient UI (open/closed,
      hover, current tab) that must NOT survive reload.
- [ ] The seed (`D.<SEED>` in `data.js`) matches the exact field shape the editor
      reads and writes. No stale/renamed keys.

## 2. Mutations
- [ ] Every create/update/delete routes through the `set<Thing>` setter (so it hits
      the Store layer + localStorage). No direct object mutation.
- [ ] Upserts key off a stable `id`; deletes filter by `id`.
- [ ] `updatedAt` (or equivalent) is stamped on every write.

## 3. Serialization
- [ ] The whole object is serializable (no functions, no DOM refs, no class
      instances). Nested arrays/objects (strategies, owners, communityIds, team)
      are plain JSON.
- [ ] Reads tolerate missing keys (`p.field || ""`, `(p.list || [])`) so older
      saved rows don't crash after a field is added.

## 4. Store / sync layer (`store.js`)
- [ ] Key is namespaced under `hpsm:` automatically by the Store.
- [ ] `SCHEMA_VERSION` is bumped ONLY for breaking shape changes (renames/removals
      that old data can't satisfy). Additive fields do NOT need a bump if reads are
      defensive (see 3).

## 5. Supabase schema parity (`db.js`)
- [ ] The commented `create table <thing>` block lists EVERY field the app writes,
      with correct types (`text`, `jsonb`, `date`, fk references).
- [ ] camelCase app fields map to snake_case columns (e.g. `scenarioSolves` →
      `scenario_solves`, `communityIds` → `community_ids`).
- [ ] Foreign keys + `on delete cascade` reflect real ownership (workspace → plan).
- [ ] Row-level security notes match the UI's edit gates (who can write/delete).

## 6. Cross-feature integrity
- [ ] Assignments that live in a join (e.g. `stakeholderWorkspaces`) persist through
      their own setter, not by mutating the parent object.
- [ ] Deleting a parent doesn't orphan children silently (cascade or explicit clean-up).

## 7. Smoke test (in preview)
- [ ] Create → reload → still there.
- [ ] Edit every field → reload → all values intact.
- [ ] Delete → reload → stays gone.
- [ ] Switch workspace/user → scoped data shows correctly.
- [ ] No console errors on load or during CRUD.
