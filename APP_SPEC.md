# APP_SPEC.md — Stakeholdr

The authoritative functional specification. Design/visual styling is intentionally
EXCLUDED here (that lives in `styles.css` + the future Settings → Design page). This
documents what the app **is**: every page, module, type, function, the ecosystem, the
real-time/backend contract, and the roadmap — element by element, so it can be rebuilt
cold. Source of truth alongside `db.js` (schema), `store.js` (persistence), `MASTER_PROMPT.md`,
`HANDOFF.md`, `BACKEND_TODO.md`, and the `chats/` design transcript.

---

## 0. What it is · value prop · how it earns
**Stakeholdr** (a.k.a. Soappbox) — a stakeholder-engagement platform for **government
affairs, public policy, and community/corporate-affairs teams**. It (1) **maps**
stakeholders by influence × alignment, (2) **prioritizes** engagement via the SEP model,
(3) lets teams **plan** engagement per workspace, and (4) tracks the **community
investment** that creates shared value — multi-user, org-scoped.

**Value prop / how it earns:** replaces spreadsheets + consultants for corporate-affairs
teams. The moat is the single-sourced loop — **score → position → prioritize (SEP) → plan
→ fund (community) → measure** — kept consistent across every view. Monetization: SaaS
seats + gated add-ons (**Personas**, **AI Message Generator**) + paid **integrations**.

---

## 1. App skeleton (shell)
- **Brand bar** — app icon + name · **workspace selector** (Master + open workspace tabs) · online-people avatar stack · profile menu.
- **Nav tabs** — `Lists · Scoring · Map · Plans · Community · Workspaces · Help`; right cluster: explainer chevron · **context-aware `+` create** · messages. (`scoring` is `hideWhenMaster`.)
- **Explainer bar** — per-view toolbar, **portaled in** via `ReactDOM.createPortal`, toggled by the chevron, state remembered per view.
- **Workspace scoping** — **Master** = union of all stakeholders (id `__master`, immovable tab); a workspace = only its assigned stakeholders.
- **Main content** (scrolls) · **global footer** · **Login gate** · **Command palette** (⌘K/Ctrl-K).
- **Persistence seam** — every entity flows through `usePersistentState(table, seed) → Store` (localStorage + BroadcastChannel now; Supabase later). UI never touches the transport.

---

## 2. Types / entities (each = one `usePersistentState` table = one Supabase table)
- **stakeholders** `[{ id, isPerson, title, titleOther, firstName, lastName, name, org, url, photo, email, phone, xAccount, country, state, city, zip, category, type, market, region, geography, issues[], priority, status, tags[], owners[], notes, notesHistory[{id,body,at,by}], history[{quarter,x,y,recordedAt}], createdBy, createdAt, lastContact }]`
- **scores** `{ [stakeholderId]: { [teamMemberId]: { x, y, createdAt, updatedAt } } }` (x,y ∈ −10..10)
- **team** `[{ id, userId, weight }]` (weight = influence multiplier; per-workspace in prod)
- **workspaces** `[{ id, name, segment, businessUnit, owners[], createdBy, createdAt, scope?, scopeState? }]`
- **stakeholderWorkspaces** `{ [stakeholderId]: [workspaceId,…] }` (join table)
- **users** `[{ id, name, firstName, lastName, title, function, markets[], regions[], email, avatarColor, avatarUrl, role('manager'|'member'|'system'), presence, createdAt, updatedAt }]`
- **conversations** `[{ id, kind('direct'|'group'|'system'), participants[], title? }]`
- **messages** `{ [conversationId]: [{ id, from, body, at, kind? }] }`
- **community** `[{ id, name, kind, stage, summary, description, rationale, submitter, submitterRole, dateSubmitted, representedStakeholderId, recipient, linkedStakeholders[], markets[], regions[], issues[], askType, amount, unit, recurrence, years, givingMode, timeline, decisionDeadline, dateApproved, budget{total,requested,otherFunding,inKind}, approvedAmount, licenseToOperate(0-10), relationshipImpact(0-10), risk{reputational,legal,conflictOfInterest,conflictDetail,attestation}, attachments[], votes{[userId]:'for'|'against'|'abstain'}, owners[], createdBy, createdAt }]`
- **plans** (one per workspace) `[{ id, workspaceId, title, sectorModel, goalModel, market, region, site, state, geography, owners[], summary, status, scenarioSolves, scenarioApproach, scenarioOutcome, goals[], goalNotes{}, issues[], team[{userId,role}], strategies[{id,title,how,timing,ownerId}], communityIds[], measurement, priorityOverrides{[shId]:band}, createdAt, updatedAt }]`
- **appConfig** `{ appName, accent, brand, brandIcon, fiscalStartMonth, fiscalStartDay, issues[], functions[], segments{}, categories{}, inviteCode, theme, autoNightShift, nightShiftAt, timeZone }`

Every mutable record carries `createdAt` + `updatedAt` (stamped each write). Relationships use id references; joins/scores/messages cascade on delete.

---

## 3. Ecosystem: Master ↔ Workspaces ↔ Stakeholders
- A stakeholder exists **once** in `stakeholders` (the pool). `stakeholderWorkspaces[id]` lists the workspace ids it belongs to (many-to-many).
- **Master** (`isMaster`) shows ALL stakeholders (read-context overview); a workspace shows only `stakeholderWorkspaces[id].includes(activeWorkspaceId)`.
- **Scoring is disabled on Master** (it's a workspace collaboration activity); on Master the app redirects Scoring → Map.
- **Creating a stakeholder**: from a workspace auto-assigns it to that workspace; from Master it's created unassigned. A system "Reminders" message posts: "New stakeholder added… Please score them."
- Per-view scoping: Lists/Scoring/Map filter to the active workspace's stakeholders; Plans are one-per-workspace; Community + Map can aggregate.

---

## 4. The math (single-sourced in `data.js`, reused everywhere)
- **`weightedCoord(id, scores, team)`** → `{x,y} = Σ(score·weight)/Σweight` over raters who scored (skips unscored & weight≤0); `{0,0}` if none. **y = influence/importance, x = alignment/support** (left = works against you).
- **`statusFor(x,y)`** → zone name by locating the cell in `X_BOUNDS=[-10,-5,0,5,10]` × `Y_BOUNDS=[10,5,2.5,0,-2.5,-5,-10]` and reading `GRID` (6 rows × 4 cols). Clamped to ±10.
- **Zones (`GRID`/`STATUSES`)** — 14 relationship modes, each with `{tone, color, text, border?, strategy, action}`. `STATUS_ORDER` (most-negative→positive): Proactively Defend · Defend · Protect · Respond · Identify · Monitor · Maintain · Connect · Commit · Cooperate · Collaborate · Valuable Relationship · High Value Relationship · Strategic Partner. Only **Strategic Partner** + **Proactively Defend** use white pill text. Each zone yields a prescriptive **strategy + action** (not a vague heatmap — actionable next steps).
- **`valueScore(app)`** = (licenseToOperate + relationshipImpact)/2 (0-10).
- **Budget rollups** (computed, FY-aware): requested = Σ USD asks; approved/annual/3-yr cumulative count only committed stages (Approved/Active/Complete) with approvedAmount>0; allocation by recurrence (One-time→start FY; Annual→every FY from approval; Multi-year→amount/years across the span). FY derived from `dateApproved` + Settings fiscal start.
- **`sepScore(s, sector, goal, ctx)`** → `{score 0-100, band, top[]}`. Base signals (0-1): `power=(y+10)/20`, `align=(x+10)/20`, `opp=1-align`, `urgency=.5p+.5opp`, `engage=.5p+.5align`, `issueRel=|s.issues∩plan.issues|/plan.issues` (0.5 if none), `commTie=min(1, affiliatedCount/2)`. Each SEP factor key maps to a signal; score = mean of sector+goal weighted blends ×100. Band: ≥67 High · ≥40 Medium · else Low. **Advisory** — manager overrides per-plan in `priorityOverrides` (✦ marker, revert to suggestion).
- **SEP models** — Goal: general, shared-value, crisis, activist, dei, community, union. Sector: energy, technology, retail, financial, education, utilities, government, healthcare, nonprofit, agriculture, auto. **Org goals** (3, editable in Settings) inherited by plans.
- **Cross-link helpers**: `affiliatedCommunity(shId, community)` (via representedStakeholderId + linkedStakeholders) · `stakeholderCumulativeUSD` · `communityEntryAmount` · `getWorkspacesForStakeholder`.

---

## 5. Scoring page (`scoring.jsx`)
- **Team bar**: one card per team member — avatar, name, title, **weight slider (0–2, baseline 1.0)**, % of total weight, remove (gated on last teammate).
- **Grid**: rows = stakeholders; columns = **Stakeholder (sticky) · each team member · Weighted (x,y) [derived] · Relationship [derived]**.
- **Edit rule**: a user may edit **only their own column** (`m.userId === currentUser.id`); all others render read-only. Each editable cell = two ±-spinner inputs (x, y, −10..10).
- **Persistence**: writes `scores[shId][tmId] = {x,y,createdAt,updatedAt}` (createdAt set once; updatedAt every change). Unscored = missing entry → flagged; Scoring tab shows an **unscored-count badge**; new stakeholders trigger a Reminders nudge.
- **Outcome — "once scored, it becomes":** the weighted blend → a map coordinate → a relationship **zone/status**, surfaced as the table's `_x/_y/_status` columns, the map dot + strategy, and an input to **SEP prioritization** in Plans. Derived values are computed on read, never stored.

## 6. Map page (`map.jsx`)
- Influence×alignment quadrant: y-axis ticks (10..−10 by 2.5), x-axis (−10..10), zone cells from `GRID`, axis legend ("← Works against you · ↑ greater community influence · Works with you →").
- **Dots** placed via `coordToPct(_x,_y)`, colored by zone; styles: classic / halo / **density** heatmap (cell shading by stakeholder count); dot size + labels tweakable (Tweaks panel: style, dot size 14–36, labels, zone labels, accent).
- **Drag-to-reposition**: dragging a dot computes Δ and applies it to **all team members' scores** for that stakeholder (preserves disagreement shape, moves consensus); persists immediately.
- **Detail scorecard** (right): name/org/site, status pill + coords, the zone's **strategy + action**, metadata, latest note. **History mode**: shows the stakeholder's quarterly `history[]` as a dashed trail to the current position.
- **Future**: embed Map into the record scaffold with a **right-rail scorecard only**.

## 7. Lists table (`sheet.jsx`) — the workspace table
- **CSS grid (not `<table>`)**. **Frozen** (sticky, non-reorderable): `# (idx) · edit-icon (opens record) · Stakeholder (displayName, opens record) · Organization (inline text)`. **Reorderable/scrollable** (order persisted to `hp_map_col_order_v3`): Category, Type, Market, Region, Geography, State/Prov., Sites, Issues, Priority, x, y, Relationship, Tags, Owner, Email, Phone, X account, Last contact, Status, Notes, Website, Community investment.
- **Inline-editable** cells: org, category, type, market, region, geography, state, site, lastContact, status — with cascades (category→type, market→region, site→state auto-fill). x/y/Relationship are computed read-only. Contact fields, issues, tags, owners, priority, url, notes, person fields edit **via the modal**.
- **Interactions**: drag column reorder; **Sort** popover (adaptive A→Z / Oldest-Newest / Low-High by field; default = unscored-first then lastContact desc); **Filter** popover (type · priority · status · relationship-zone · issues · owners; OR within field, AND across); **impact-band chips** (Positive / Winnable middle / Negative with counts); inline **search** (name/org/type/notes/tags); row select; **Notes** modal (threaded `notesHistory` + composer).
- **CSV export** (`exportCsv`, footer): exports the **current filtered/sorted set**, 18 columns incl. derived x/y/Relationship, RFC-4180 escaped, file named per workspace. **Per-plan / per-workspace export is a future extension.**
- **Footer**: count · avg x · avg y · Export CSV.
- **Command palette** (`palette.jsx`, ⌘K): fuzzy search across stakeholders/plans/community/workspaces/people → navigates.

## 8. workHQ
The **intelligence-layer strip on a workspace** (`intel.jsx`) — a play on workSpace → workHQ. It surfaces workspace-level intelligence on the table/workspace view. **More coding to do** (the user will define its full contents). *Confirm scope with the user before building.*

## 9. Plans (`plan.jsx`)
- **Landing grid** (LandingView): filter by type/issues/market/region/status/year; sort by name/status/updated/created; cards show title, workspace, goal-type pill, status, summary, engaged count, tactics/investments counts, segment/unit; Review / Edit.
- **Editor** — toolbar (back · title · **sector model** + **goal model** pickers · Save gated by validation). Metadata sidebar (summary, status [Idea→Proposed→Under Review→Active→Complete], workspace, market/region/site/state/geography, owners, issues, linked community). **Sections**: (1) Scenario & Context (solves/approach/outcome) · (2) Org-Goal alignment (goalNotes per org goal) · (3) **Stakeholders** (SEP-ranked table; relationship pill; **PlanPriorityCell** = effective band with ✦ suggestion / ·set override; manager dropdown + revert; add existing via autocomplete or new via modal) · (4) **Tactics** (title/how/timing/lead pill) · (5) Measurement. Right rail: cross-functional **team** (userId+role), **SEP explainer** (factor weights), **Personas** (locked add-on ◯).
- **Review** = read-only mirror. **Validation**: title, workspace, market, region, owners, summary, status, all 3 scenarios, issues, team, tactics (all titled), measurement.
- ◐ ~50% — more elements to come from the user. ◯ **Export plan as Word/PDF** (client-side .docx/PDF; Google Docs = OAuth/backend). ◯ **AI Message Generator** add-on.

## 10. Community (`community.jsx` + `community-modal.jsx`)
- **Landing grid** + **rollup bar** (Requested · Annual · 3YR Total, FY-aware). Cards: kind badge, giving mode (if Corporate Giving), summary, ask (amount·unit·recurrence·years), approved label (TBD/Declined/No Expense/$), **value bar**, issues, linked stakeholders, markets/regions/site; **team votes** (for/against/abstain); Review/Edit.
- **Application record** — sections: Project overview (name, **kind** [Philanthropy · Volunteering · Corporate Giving · Political Action (PAC) · Sustainability · Social Impact], **stage** [Idea→…→Complete/Declined], givingMode, summary) · Applicant & sponsor (submitter, role, dateSubmitted, represented stakeholder) · The ask (askType [Funding/Volunteer hours/Endorsement/In-kind/Political contribution], amount, unit, recurrence, years, decision deadline, timeline) · Description & rationale · Beneficiary & relationships (recipient, linkedStakeholders picker) · Strategic alignment (license/relationship sliders → value score, issues, markets/regions chips, site/state/geography) · Resources & budget (total, requested, approvedAmount, dateApproved [drives FY rollup], otherFunding, inKind) · Risk & compliance (reputational, legal, conflict + detail, attestation) · Owners.
- **Validation**: name, summary, recipient, description, rationale, submitter, dateSubmitted, timeline, amount>0, years≥1, markets, regions, issues, linkedStakeholders, owners, budget.total>0, givingMode (if Corporate Giving), conflict detail (if flagged), attestation.
- **CommunityProfile** = read-only body (reused by the modal's view mode and the page). ◐ attachments UI + approval workflow detail are partial.

## 11. Workspaces / Setup (`setup.jsx`)
- Grid grouped by **segment**; cards show name, business unit, owners (avatars), markets/regions (derived from assigned stakeholders), stakeholder count, created date.
- **WorkspaceModal** create/edit: name, **segment** + **business unit** (cascading from `appConfig.segments`/`SEGMENTS`), **scope** (None/National/State → state), owners. Delete gated to creator OR manager (confirm dialog). Activating a workspace opens it as a tab and scopes the app.
- ◯ Workspace **record** on the scaffold.

## 12. Settings (`settings.jsx`) — manager-only
Sub-panes: **Identity** (appName, brand color, brand icon, accent, **theme** [soapbox/undecideds/nightshift], auto night-shift + time, time zone) · **Fiscal Calendar** (start month/day, quarters preview) · **Stakeholders** (categories→types) · **Your Structure** (org goals, segments→business units, functions) · **Geography** (markets→regions, sites editor with state/country rules) · **Issues** · **Tags** · **Team Management** (invite code, role toggle table — can't demote self) · **Contact**. Persists to the single `appConfig` row (broadcast-synced); branding propagates via CSS variables (`--brand`, `--accent`) + theme class. ◯ **Settings → Design page** (theme every token → Claude) and ◯ **Settings → Integrations** shell live here.

## 13. Messaging (`messaging.jsx`)
- **Model**: conversations (direct = sorted pair · group = +title · system = "Reminders" bot) + messages keyed by conversationId. System bot posts `kind:"scoring-needed"` reminders (pending badge).
- **UI**: right **sidebar** (list + active thread + composer) and full **page** (two-pane + new-conversation modal). Messages grouped by sender within 60s; Enter sends, Shift+Enter newline; `sendMessage`/`startConversation` persist + broadcast.
- ◐ **Mention autocomplete** ("link" feature): triggers in code today are **`@` stakeholder · `/` workspace · `#` plan · `$` community** (the user also referenced `^` — confirm the final trigger set). Typing a trigger + query shows up to 6 matches; selecting inserts a token `{{type:id|label}}` rendered as a clickable **mention chip** → `window.__openMention(type,id)` opens the record. Needs to be made fully real + realtime.

## 14. Users / Team / Presence (`users.jsx`)
- **User** shape per §2. **Team** = `[{id,userId,weight}]` (per-workspace influence). **Avatar stack** shows first 3 non-system users + true `+N` (◐ currently static seed). **People popup**: avatar/name/title + message button. **EditProfileModal**: avatar (photo/color), name, title, email, function, markets→regions. **Role toggle** table in Settings (manager-gated). ◯ **Real presence** (Supabase Presence or `last_seen` heartbeat).

## 15. Persistence + realtime ecosystem (`store.js`)
- `usePersistentState(table, seed)` = drop-in `useState` that hydrates from `Store.load`, writes through `Store.save` on change, and applies remote changes via `Store.subscribe` (with echo-prevention `skipPersist`).
- `Store`: localStorage namespace `hpsm:`; `SCHEMA_VERSION` (`v9`) wipes the namespace on breaking changes; **BroadcastChannel `hpsm-sync`** for cross-tab realtime (`{table,value}`), with a `storage`-event fallback.
- **Per-device, NOT synced**: `currentUser` (this tab's session), column-order preference.
- `uid(prefix)` (crypto UUID) · `nowStamp()` (ISO).
- **Supabase swap (design)** — entirely inside `store.js`: `Store.save → supabase.from(table).upsert(row)`; BroadcastChannel → `supabase.channel('rt:'+table).on('postgres_changes',…, p=>notify(table,p.new))`. UI unchanged.

## 16. Auth & roles
- **Now (demo)**: `LoginView` collects name/title/email/avatar; `logIn` **auto-promotes everyone to manager** (must be removed). Session = `currentUser` (per-device).
- **Roles**: **manager** (edit anything, delete any workspace, edit config + user roles, override SEP) · **member** (own records; delete only workspaces they created) · **system** (bots; never in pickers/online lists).
- **Planned**: Supabase Auth (email/SSO) → `users` row; **org access code** signup (`STKH-XXXX-XXXX` / `appConfig.inviteCode`) maps user→org+workspaces; **RLS** mirrors UI gates (score only your own rows; workspace delete = creator/manager; config/roles = manager; all org-scoped). Storage **flag** (`local` vs `supabase`) keeps demo + prod one codebase.

## 17. APIs / integrations
- **In use**: Google **Material Symbols** (icon font via Google's font API).
- ◯ **Country list** → ISO-3166 source/API (replace static `COUNTRIES`; preserve US-state→"United States" rule).
- ◯ **Settings → Integrations** (UI shell now; calls server-side): **LegiScan, Quorum, sales CRMs, marketing tools, Google Drive**. Keys never in the browser.
- ◯ **AI Message Generator** (server-side LLM, metered/billed).
- ◯ Supabase (DB/auth/realtime/storage), email (invites, rescore reminders, digests).

## 18. Record scaffold (`record.jsx`) — universal read/edit shell
One `RecordShell` (collapsible left sub-page nav · full-width center · collapsible right metadata rail · pinned footer; read↔edit via `MetaField`) that all types pour through as `record.[type].view/.edit` for **stakeholder · plan · community · workspace · setting**. Tables inside records embed the **real** `SheetView` (not a re-implementation). Visual styling is token-driven and will become Settings-controlled. **Status: foundation in progress; design intentionally neutral until the Design settings page exists.**

---

## 19. Roadmap / future build
(✅ built · ◐ partial · ◯ future. Demo-buildable = client-side now; Backend = Supabase/server.)

**Finish the core**
- ◐ Plans & Community edit/read — complete the ~50% (user introduces remaining elements).
- ◐ **workHQ** — define + build the workspace intelligence strip.
- ◐ Universal-table audit — every table uses the one component.
- ◯ Record scaffold + `record.[type].view/.edit` for all types; Map-in-scaffold (right-rail scorecard); Settings → `record.setting`.

**Demo-buildable (client-side)**
- ◯ **Import offline stakeholder lists** — CSV/Excel upload → column-map → preview → commit (Master or workspace).
- ◯ **Onboarding product tour** — stepped coachmarks, dismissible, "replay" in profile menu.
- ◯ **Export plans to Word/PDF** — `.docx`/PDF client-side (Google Docs = OAuth/backend).
- ◯ **Settings → Design page** — control every design token live (subtext → Claude endgame).
- ◯ **Mobile companion** — purpose-built/limited: stakeholder quick-view (scorecard essentials), **add-note** (the key write), messages read/reply; NOT tables/map/editing; same components + Store; `/m` or viewport switch.
- ◯ **Empty states** everywhere · **blank-org vs demo-data seed** toggle · **bulk actions** (multi-select → assign/tag/delete/export) · universal **required-field validation** · **soft-delete/archive** + confirms · **custom dropdown** component (replace native `<select>` open lists, reviewed individually).

**Backend / shippable (Supabase + server)**
- ◯ **Row-level writes** (per-row upsert/delete; today = whole-array last-write-wins). ◯ **Real auth + RLS** + org-code invite flow. ◯ **Real presence**. ◯ **File uploads** → Supabase Storage (logos, photos, attachments). ◯ **Email** (invites, quarterly rescore reminders via Reminders bot, digests). ◯ **Fiscal-rollover jobs** (quarter-close → rescore prompt → 3-yr totals). ◯ **Activity log / audit trail**. ◯ Table **virtualization**, loading/error/offline states, **accessibility** pass, **responsive/tablet** for wide tables. ◯ **Billing** + add-on gating.

**Paid add-ons**
- ◯ **Personas** — persona modeling from polling/listening (locked stub in Plan).
- ◯ **AI Message Generator** — on a finished plan, generate key messages advancing the goals; pre-prompt for supporting docs/data/perspectives + targeting toggles (goal/segment/issue/tone/channel); output = editable message pillars saved with the plan + exportable; server-side, metered; later modeling/surveys feed the same grounding contract.

**Open product questions**
- Home/landing direction (default = Master list; "simple but more intelligent/organized" than a CRM) — undecided.
- Final mention-trigger set (`@ / # $` in code; user mentioned `^`).
