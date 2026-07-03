# Stakeholdr — Enterprise Architecture (developer handoff)

This is the production architecture spec for Stakeholdr: a multi-tenant SaaS for
public-affairs / stakeholder-engagement teams (CRM + scoring + relationship map +
plans + community investment + collaboration). It is written for a senior engineer.

**Build philosophy:** ship a **Demo** first (no backend, seed data, full
capability), then flip a single switch to **Production** (Supabase). The data
access layer is identical in both states — see §2. Frontend = React 18 + Vite +
the repo's own Canonical UI design system (`design-system/` `ui-*` web components;
`--ui-sys-*` tokens are the only styling surface — see the `.io` build guide).
*(An earlier draft of this line said shadcn/ui + Tailwind; that predates the
2026-06-13 Canonical UI ruling and is superseded — Tailwind/shadcn are forbidden
in the rebuilt app.)* Backend = Supabase
(Postgres + Auth + Realtime + Storage + Edge Functions).

---

## 1. Core principles
- **One data layer; server is source of truth.** The UI talks only to a repository
  API (`list/get/save(changedRow)/delete/insert/subscribe`). No per-feature
  persistence. Add entities one at a time through this layer → coverage by
  construction.
- **Multi-tenant from day one.** Every row is scoped to an `org_id`. Tenant
  isolation is enforced by RLS, not app code.
- **Optimistic UI.** Apply locally → reconcile on server echo → roll back on error.
- **Everything auditable.** Universal record envelope on every row (§5); immutable
  audit log; edit-version "time capsule".

## 2. Two states + the switch
- **Demo (default, no cost):** repository backed by localStorage + BroadcastChannel,
  seeded with sample org/users/stakeholders. All actions work; users may add dummy
  **and** real people. Single-device/multi-tab. This is what clients review.
- **Production (flip when approved/paid):** same repository, backed by Supabase
  (Postgres/Realtime/Auth/Storage). True multi-user/device.
- **The switch = one config flag** (e.g. `VITE_SUPABASE_URL` present → Supabase +
  Auth required; absent → demo). `usePersistentState`/repository API and every
  component are byte-identical across states.

## 3. Tenancy & org model
- `organizations` (tenant) → users belong via `memberships(org_id,user_id,role)`.
- All domain tables carry `org_id`. RLS: a user sees/writes only their org's rows.
- Org onboarding: invite code (`STKH-XXXX-XXXX`) and/or SSO domain claim.
- Seats/licensing per org; add-on entitlements (Personas, AI Message Generator).

## 4. Identity, auth & authorization
- **Supabase Auth**: email+password, magic link, and **SSO/SAML/OIDC** for enterprise;
  optional **MFA**. Session management, password policy, account recovery.
- Map authed user → `users` row (+ membership). **Remove any demo auto-promote.**
- **RBAC**: roles = `manager` (app/org admin), `member`, workspace **lead** (creator;
  can invite/manage their workspace but isn't necessarily an org manager — resolve
  this distinction), `system` (bots). Per-workspace membership via `owners[]`.
- **RLS policies** mirror UI gates AND enforce tenant isolation:
  - all tables: `org_id = auth.jwt().org_id`.
  - scores: writable only for rows whose team_member is the user.
  - workspaces: delete only by `created_by` or manager.
  - app_config / users.role / fiscal / segments / categories: manager only.
  - plans/community: writes scoped to owners/team.

## 5. Data model & integrity (the universal record envelope)
Every mutable row carries: `id uuid`, `org_id`, `created_at`, `created_by`,
`updated_at`, `updated_by`, `deleted_at`, `deleted_by`, `version int`.
- **Timestamps:** UTC `timestamptz`, **millisecond precision** (never date-only for
  audit fields — date-only only for true calendar fields like `last_contact`).
  Display in the org **time zone** (`app_config.time_zone`).
- **FKs with `on delete cascade`** for integrity; **soft-delete** (`deleted_at`) for
  recoverable removes; hard delete only where safe.
- **Normalize collections to their own rows** (never JSON blobs guarded by one
  timestamp): notes, score-history snapshots, plan strategies/tactics/phases,
  votes, feedback, attachments. Array-of-id fields → join tables or set ops.
- Full per-table schema lives in the `.io` "Database schema" box.

## 6. State, realtime & collaboration (three tiers)
- **Tier 1 — Records** (stakeholders, plans, community, workspaces, users, config):
  column-level upserts of changed fields; optimistic concurrency via `version`/ms
  `updated_at` (stale write rejected → re-read/re-apply); realtime merge-by-id.
- **Tier 2 — Append-only** (messages, notes, feedback, votes, score history):
  inserts / keyed upserts → no conflict by construction.
- **Tier 3 — Collaborative documents** (Whiteboard, long-form plan text): **CRDT
  (Yjs)** for conflict-free co-editing + live cursors/presence; persist doc state.
- **Supabase Realtime**: `postgres_changes` (data) + **Presence** (online/cursors) +
  **Broadcast** (ephemeral). **Offline queue**: buffer mutations, flush on reconnect.

## 7. Versioning & audit (the "time capsule")
- **Edit-version history** per record: append-only `record_versions`
  `{ entity, row_id, org_id, changed_by, changed_at(ms), before, after/diff }`.
  View a record's history; **restore = write a prior version forward** (never
  destructive).
- **Immutable audit log** for security/compliance: auth events, permission changes,
  exports, deletes, admin actions.
- **Activity feed** (workHQ "Developments"/Alerts) derived from these.

## 8. Archives, retention & backup
- Soft-delete + an **Archive** state for plans/workspaces (revisit, export, restore).
- Retention policy per data class; scheduled purge of expired soft-deletes.
- **Backups / PITR** (Supabase point-in-time recovery); periodic logical export.
- **Export**: plan → single Word/PDF; tables → CSV; org data export for compliance.

## 9. Files & media
- **Supabase Storage** buckets: attachments, stakeholder photos, plan exports,
  whiteboard assets. **Signed URLs**, size/type limits, optional virus scan, CDN.

## 10. Background jobs & scheduling (Edge Functions / cron)
- **Fiscal-year rollover**: at quarter/year close, snapshot each stakeholder's
  weighted position into `score_history` and notify teams to re-score.
- **Rescore reminders**, **digest emails**, **FX-rate refresh** (community currency),
  **notification fan-out**, soft-delete purge.

## 11. Notifications
- In-app (badges/inbox) + **transactional email** (Resend/Postmark/Supabase).
- @-mention notifications (Messaging/Whiteboard), invites, rescore reminders,
  community vote requests, plan deadlines. Per-user preferences + digests.

## 12. Integrations (connector pattern; secrets in vault)
- **Real-time FX conversion** (community multi-currency, historic-rate lock).
- **URL unfurl / oEmbed / page-metadata** (Whiteboard news/social capture).
- **ISO-3166 countries** (replace static list).
- Roadmap: **LegiScan, Quorum, CRM, marketing platforms, Google Drive**, social feeds.
- Each is one bounded connector with its own secrets; never inline keys.

## 13. Search
- Postgres full-text search (or pgvector/external) across stakeholders, plans,
  community, messages, notes — org-scoped, RLS-respecting.

## 14. Security & compliance
- Encryption in transit (TLS) + at rest; secrets in a vault; least privilege.
- **RLS tenant isolation** is the real boundary (client gating is cosmetic).
- **Compliance targets**: SOC 2 Type II, GDPR + CCPA (data subject export/delete,
  consent, DPA), PII handling, configurable **data residency**.
- Rate limiting, input validation/sanitization, CSP, dependency scanning,
  audit logging of sensitive actions.

## 15. Observability
- Structured logging; **error tracking** (Sentry); metrics/uptime/alerting;
  query performance monitoring.

## 16. Performance & scale
- Indexes on FKs + hot filters; **pagination/virtualization** for large tables;
  connection pooling (Supabase pooler); caching; avoid N+1; realtime fan-out limits.

## 17. Billing & licensing
- **Stripe** subscriptions (per-seat), org plans, **add-on gating** (Personas, AI
  Message Generator), usage metering for metered features.

## 18. Admin & support
- Org **admin console** (members, roles, fiscal, segments/categories, branding,
  invite code, billing). **Support impersonation** (audited). **Feature flags**.
  Status page; in-app help; the 12-step framework + zone legend.

## 19. Migrations & environments
- Versioned SQL migrations (Supabase CLI); zero-downtime; seed scripts for demo.
- Environments: demo (GitHub Pages), staging, production; CI/CD; secrets per env.

## 20. Testing & verification
- The `.io` **traceability manifest** (every entity × mutation × realtime path) +
  the build-breaking **guard** (no hand CSS / forbidden patterns) + e2e/contract
  tests against the repository API + a verification checklist per feature.

---

**Where the detail lives:** the `.io` build guide (`src/guide.jsx`) is the lossless
single source of truth for app behavior, the data model, the persistence/state
architecture, the enterprise record envelope, and the full Supabase schema. This
file is the developer-facing condensation of the backend/enterprise concerns.
