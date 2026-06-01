// db.js - Persistence + realtime contract (Supabase-ready).
//
// ⚠️ BEFORE WIRING SUPABASE: read BACKEND_TODO.md — two required fixes
//    (row-level writes instead of whole-collection saves, and real auth + RLS).
//
// TODAY the app persists every shared entity to localStorage and syncs changes
// live across open tabs/windows via BroadcastChannel (see store.js). The React
// layer talks only to `usePersistentState(table, seed)` - it never touches the
// transport. That means moving to Supabase is a transport swap inside store.js:
// `Store.save` becomes an upsert, and the broadcast callback is driven by a
// Supabase realtime channel instead of BroadcastChannel. No UI changes.
//
// ─── Entities (each is one `usePersistentState` table === one Supabase table) ──
//
//   stakeholders          - every stakeholder record (see shape below)
//   scores                - { [stakeholderId]: { [teamMemberId]: {x,y} } }
//   team                  - [{ id, userId, weight }]   (per workspace in prod)
//   workspaces            - [{ id, name, segment, businessUnit, owners[], createdBy, createdAt }]
//   stakeholderWorkspaces - { [stakeholderId]: [workspaceId, ...] }   (join table)
//   users                 - [{ id, name, firstName, lastName, title, function, markets[], regions[], email, avatarColor, avatarUrl, role, createdAt, updatedAt }]
//   conversations         - [{ id, kind, participants[], title }]
//   messages              - { [conversationId]: [{ id, from, body, at, kind? }] }
//   community             - [ community application records (see shape below) ]
//   appConfig             - { appName, accent, brand, brandIcon, fiscalStartMonth, fiscalStartDay, issues[], functions[] }
//
// Timestamps: every mutable record carries createdAt + updatedAt (YYYY-MM-DD);
// updaters stamp updatedAt on every write (window.nowStamp). Map to
// `created_at timestamptz default now()` and `updated_at timestamptz` columns.
//
// Per-device (NOT broadcast): currentUser (the logged-in session for THIS tab),
// hp_map_col_order_v2 (this user's column arrangement preference).
//
// ─── Full stakeholder shape (matches the cards, tables, and map) ──────────────
//   {
//     id,
//     isPerson,                       // bool - person vs organization
//     title, titleOther,              // honorific (e.g. "Senator"); custom when "Other"
//     firstName, lastName,            // person name parts
//     name,                           // computed display name (or org name)
//     org,                            // organization
//     url,                            // website (normalized to https://)
//     photo,                          // optional profile image (data URL)
//     email, phone, xAccount,         // contact (phone formatted (xxx) xxx-xxxx)
//     country, state, city, zip,      // location (state/city/zip only when US)
//     category, type,                 // audience taxonomy
//     market, region, geography,      // HP market → region → geography level
//     issues: [ ... ],                // company + custom issues
//     priority, status, tags: [ ... ],
//     owners: [ userId, ... ],        // creator + assigned owners
//     notes,                          // latest note (mirror of newest history entry)
//     notesHistory: [{ id, body, at, by }],
//     history: [{ quarter, x, y, recordedAt }],   // quarterly snapshots
//     createdBy, createdAt, lastContact
//   }
//
// ─── Supabase SQL (paste into the SQL editor) ─────────────────────────────────
//
// create table users (
//   id uuid primary key, name text not null, first_name text, last_name text,
//   title text, function text, markets text[] default '{}', regions text[] default '{}',
//   email text unique, avatar_color text, avatar_url text,
//   role text not null default 'member' check (role in ('manager','member','system'))
// );
// create table workspaces (
//   id uuid primary key default gen_random_uuid(), name text not null,
//   segment text not null, business_unit text not null,
//   owners uuid[] not null default '{}',
//   created_by uuid references users(id), created_at timestamptz default now()
// );
// create table stakeholders (
//   id uuid primary key default gen_random_uuid(),
//   is_person bool default false,
//   title text, title_other text, first_name text, last_name text, name text, org text,
//   url text, photo text, email text, phone text, x_account text,
//   country text, state text, city text, zip text,
//   category text, type text, market text, region text, geography text,
//   issues text[] default '{}', priority text, status text, tags text[] default '{}',
//   owners uuid[] not null default '{}',
//   notes text, notes_history jsonb default '[]', history jsonb default '[]',
//   created_by uuid references users(id), created_at timestamptz default now(),
//   last_contact date
// );
// create table stakeholder_workspaces (
//   stakeholder_id uuid references stakeholders(id) on delete cascade,
//   workspace_id   uuid references workspaces(id)   on delete cascade,
//   primary key (stakeholder_id, workspace_id)
// );
// create table team_members (
//   id uuid primary key default gen_random_uuid(),
//   workspace_id uuid references workspaces(id) on delete cascade,
//   user_id uuid references users(id) on delete cascade,
//   weight numeric not null default 1.0, unique (workspace_id, user_id)
// );
// create table scores (
//   stakeholder_id uuid references stakeholders(id) on delete cascade,
//   team_member_id uuid references team_members(id) on delete cascade,
//   x numeric not null check (x between -10 and 10),
//   y numeric not null check (y between -10 and 10),
//   created_at timestamptz default now(),  -- first time this member scored
//   updated_at timestamptz default now(),  -- every re-score
//   primary key (stakeholder_id, team_member_id)
// );
// create table conversations (
//   id uuid primary key default gen_random_uuid(),
//   kind text not null, participants uuid[] not null, title text
// );
// create table messages (
//   id uuid primary key default gen_random_uuid(),
//   conversation_id uuid references conversations(id) on delete cascade,
//   from_user uuid references users(id), body text, kind text,
//   at timestamptz default now()
// );
// create table app_config (
//   id int primary key default 1,
//   app_name text, accent text, brand text, brand_icon text,
//   fiscal_start_month int, fiscal_start_day int,
//   issues text[], functions text[],
//   segments jsonb,        -- { [segment]: [business unit, …] }
//   categories jsonb,      -- { [category]: [audience type, …] }
//   invite_code text       -- org join code (STKH-XXXX-XXXX); regen is a support request
// );
//
// ─── Community / foundation applications ──────────────────────────────────────
// Full shape (one row = one value-driven engagement application):
//   {
//     id, name, kind, stage, summary, description, rationale,
//     submitter (userId), submitterRole, dateSubmitted,
//     representedStakeholderId,                 // FK -> stakeholders
//     recipient,                                // recipient org / cause (free text)
//     linkedStakeholders: [stakeholderId],      // supporters/opponents/decision-makers
//     markets: [], regions: [], issues: [],     // reuse the shared taxonomy
//     askType, amount, unit, recurrence, years, // the ask (unit: USD | hours)
//     timeline, decisionDeadline,
//     budget: { total, requested, otherFunding, inKind },
//     approvedAmount,                           // approved budget (drives rollups)
//     licenseToOperate (0-10), relationshipImpact (0-10),  // value-score inputs
//     risk: { reputational, legal, conflictOfInterest:bool, attestation:bool },
//     attachments: [{ label, url }],
//     votes: { [userId]: 'for'|'against'|'abstain' },       // team alignment
//     owners: [userId], createdBy, createdAt
//   }
//   Budget rollups (requested / approved / annual / cumulative, and per
//   stakeholder) are COMPUTED in the view from these rows, not stored.
//
// create table community_applications (
//   id uuid primary key default gen_random_uuid(),
//   name text not null, kind text, stage text,
//   summary text, description text, rationale text,
//   submitter uuid references users(id), submitter_role text, date_submitted date,
//   represented_stakeholder uuid references stakeholders(id),
//   recipient text, linked_stakeholders uuid[] default '{}',
//   markets text[] default '{}', regions text[] default '{}', issues text[] default '{}',
//   ask_type text, amount numeric, unit text, recurrence text, years int,
//   giving_mode text,                         -- Monetary | In-Kind | Mix (Corporate Giving only)
//   timeline text, decision_deadline date, date_approved date,
//   budget jsonb default '{}', approved_amount numeric,
//   license_to_operate int, relationship_impact int,
//   risk jsonb default '{}', attachments jsonb default '[]',
//   owners uuid[] default '{}', created_by uuid references users(id), created_at timestamptz default now()
// );
// create table community_votes (
//   application_id uuid references community_applications(id) on delete cascade,
//   user_id uuid references users(id) on delete cascade,
//   choice text check (choice in ('for','against','abstain')),
//   primary key (application_id, user_id)
// );
// create table plans (
//   id uuid primary key default gen_random_uuid(),
//   workspace_id uuid references workspaces(id) on delete cascade unique,
//   title text, sector_model text, goal_model text,
//   market text, region text,         -- geography scope
//   owners jsonb,                      -- [user.id]
//   summary text,                      -- one-line summary for card + review
//   status text,                       -- Idea | Proposed | Under Review | Active | Complete
//   scenario_solves text,              -- what this plan solves & company impact
//   scenario_approach text,            -- phased approach
//   scenario_outcome text,             -- expected outcome
//   goals jsonb, issues jsonb,
//   goal_notes jsonb,      -- { [org goal text]: how this plan advances it }
//   team jsonb,            -- [{ user_id, role }]
//   strategies jsonb,      -- [{ id, title, how, timing, owner_id }]
//   community_ids jsonb,   -- [community_application.id]
//   priority_overrides jsonb,  -- { [stakeholder.id]: 'High'|'Medium'|'Low' } manager overrides of the SEP suggestion
//   measurement text, updated_at date
// );
//
// ─── Row-level security (mirrors the UI's edit gates) ─────────────────────────
//   - scores: a user may write only rows whose team_member belongs to them.
//   - workspaces: delete restricted to created_by OR role='manager'.
//   - app_config / users.role: writable only by role='manager'.
//
//   create policy "score yourself" on scores for all using (
//     exists (select 1 from team_members tm
//             where tm.id = team_member_id and tm.user_id = auth.uid()));
//
// ─── Realtime swap (inside store.js) ──────────────────────────────────────────
//   for (const table of TABLES) {
//     supabase.channel('rt:' + table)
//       .on('postgres_changes', { event: '*', schema: 'public', table },
//           payload => notify(table, payload.new))   // same notify() the
//                                                     // BroadcastChannel uses today
//       .subscribe();
//   }
//   Store.save(table, value)  ->  await supabase.from(table).upsert(value)
//
// The hook contract (usePersistentState) and every component stay identical.
window.DB_READY = true;
