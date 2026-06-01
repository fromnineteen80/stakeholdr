# Master Prompt — Soappbox (Stakeholder Engagement Platform)

> Build a single-page web application called **Soappbox**, a stakeholder
> engagement platform for government affairs, public policy, and community teams.
> It maps stakeholders by influence and alignment, prioritizes engagement, plans
> it, and tracks the community investment that creates shared value. Build it as
> a no-build React app and follow every spec below exactly.

---

## 0. Tech & file architecture
- React 18.3.1 + ReactDOM + Babel Standalone 7, all via pinned `<script>` tags with integrity hashes. No bundler. Each component file is a `<script type="text/babel" src="…">`. Files share scope through `window` globals (export with `Object.assign(window, {…})`); never use ES modules.
- Load order in the HTML: `data.js` → `db.js` → `store.js` → `tweaks-panel.jsx` → `components.jsx` → `users.jsx` → `messaging.jsx` → `sheet.jsx` → `sheet-modals.jsx` → `scoring.jsx` → `map.jsx` → `plan.jsx` → `community.jsx` → `community-modal.jsx` → `profiles.jsx` → `setup.jsx` → `settings.jsx` → `help.jsx` → `app.jsx`.
- Keep any single file under ~1000 lines; split modals/popovers into sibling files (e.g. `sheet-modals.jsx`).
- Plain canonical HTML; close every element; double-quote attributes. Use flex/grid with `gap`, never bare inline siblings.

## 1. Design system (one warm, editorial system — `styles.css`)
- **Palette (CSS vars):** `--bg #F2EFE7` (warm cream), `--bg-2 #ECE8DD`, `--paper #FAF8F2`, `--paper-2 #FFFFFF`, ink ramp `#1F1A14 / #4B4439 / #7A7164 / #ADA396`, `--rule #DCD6C8`, `--rule-2 #E8E2D2`, accent (HP blue) `--accent #024AD8`, `--neg #B33C3C`, `--neu #B07E1F`, `--pos #3E7A2E`.
- **Type:** `--serif "Newsreader"` (display/headlines), `--sans "IBM Plex Sans"` (body, 13px base), `--mono "IBM Plex Mono"` (labels/eyebrows/numbers, uppercase + letterspaced). Icons = Google **Material Symbols Outlined** (ligature names; an `Icon` component maps app names → ligatures). Re-enable `font-feature-settings:'liga'` on the icon class because the body sets `ss01/cv11`.
- **Components:** `.tag`/pill, `Avatar` (initials, color, presence — but presence dot is globally disabled), `StatusPill` (zone color), `PriorityPill` (High/Med/Low), designed `<select>`, autocompletes, modals, filter/sort popovers, segmented toggles. Cards: 1px `--rule`, ~10–16px radius, soft warm shadow.
- Never invent colors outside this system. Avoid AI-slop tropes (gradient soup, emoji, generic rounded-accent-border boxes).

## 2. Data model (`data.js`, exported as `window.STAKEHOLDER_DATA`)
Seed and export all of:
- **SEGMENTS** (segment → business units), **MARKETS** (market → regions), **GEOGRAPHIES** = National/Federal/State/Local, **ISSUES** (editable issue catalog).
- **USERS**: `{ id, name, title, email, avatarColor, presence: online|away|offline, role: manager|member|system }`. Include a `system`-role **"Reminders"** bot — excluded from every people/online list, present only as a Messages thread.
- **WORKSPACES**: `{ id, name, segment, businessUnit, owners:[userId], createdBy }`. A special **Master** view shows the union of all stakeholders.
- **STAKEHOLDER_WORKSPACES**: `{ [stakeholderId]: [workspaceId] }` many-to-many.
- **TEAM**: `{ id, userId, weight }` — raters whose weight drives the blended map position.
- **STAKEHOLDERS**: person OR org. `{ id, isPerson, firstName/lastName | name, org, title, category, type, issues:[], market, region, geography, priority: High|Medium|Low, status: Active|Watch|Dormant, owners:[userId], tags:[], email, phone, xAccount, url, lastContact, notesHistory:[{body,at,author}] }`.
- **SEED_SCORES**: `scores[stakeholderId][teamMemberId] = { x, y }`, each in −10..10.
- **CONVERSATIONS / MESSAGES**: direct (sorted user pair), group, and one `system` thread.
- **COMMUNITY** applications (value-driven engagements): `{ id, name, kind, stage, summary, description, rationale, submitter(userId), submitterRole, dateSubmitted, representedStakeholderId, recipient, linkedStakeholders:[id], markets:[], regions:[], issues:[], askType, amount, unit(USD|hours), recurrence, years, givingMode, timeline, decisionDeadline, budget:{total,requested,otherFunding,inKind}, approvedAmount, licenseToOperate(0-10), relationshipImpact(0-10), risk:{reputational,legal,conflictOfInterest,attestation}, attachments:[{label,url}], votes:{[userId]:for|against|abstain}, owners:[userId], createdBy, createdAt }`.
- **PLANS** (one per workspace): `{ id, workspaceId, title, sectorModel, goalModel, market, region, owners:[userId], scenarioSolves, scenarioApproach, scenarioOutcome, goals:[], issues:[], team:[{userId,role}], strategies:[{id,title,how,timing,ownerId}], communityIds:[], measurement, priorityOverrides:{[stakeholderId]:band}, updatedAt }`.
- **Enums/catalogs:** COMMUNITY_KINDS, COMMUNITY_STAGES (Idea→…→Complete/Declined), ASK_TYPES, RECURRENCE, GIVING_MODES, CATEGORIES (category → audience types), PLAN_STEPS (the 12-step Purpose/Plan/Execute framework).
- **SEP models:** `SEP_FACTORS` (key → {label, desc} catalog, e.g. Influence, Urgency, Mutual Value, Long-Term Strategic Alignment, …); `SEP_GOAL_MODELS` and `SEP_SECTOR_MODELS` = `[{ id, name, factors:[[key,weight],…] }]` whose weights sum to 1.
- **Map definitions:** `GRID` (4 columns × 6 rows of zone names), `STATUSES` (per zone: `{ tone, color, text, border?, strategy, action }`), `STATUS_ORDER` (most-negative→most-positive), `CELL_RECTS`, `X_BOUNDS=[-10,-5,0,5,10]`, `Y_BOUNDS=[10,5,2.5,0,-2.5,-5,-10]`.

## 3. The math (single source of truth, reused everywhere)
- **`weightedCoord(stakeholderId, scores, team)`** → blended `{x,y}` = Σ(score·weight)/Σweight over raters who scored them; `{0,0}` if none.
- **`statusFor(x,y)`** → zone name by locating the cell in the `X_BOUNDS`×`Y_BOUNDS` grid and reading `GRID`. The map's **vertical axis = influence/importance**, **horizontal axis = alignment/support** (left negative).
- **`valueScore(app)`** = average of `licenseToOperate` and `relationshipImpact` (0–10).
- **Budget rollups** (computed, never stored): requested = Σ requested USD; approved/annual/cumulative count only *committed* stages (Approved/Active/Complete) with `approvedAmount>0`. Per-stakeholder cumulative = same over their affiliated entries.
- **SEP auto-ranking — `sepScore(stakeholder, sectorModel, goalModel, ctx)`** → `{score 0-100, band, topFactors}`:
  1. Base signals (0–1) from existing data: `power=(y+10)/20`, `align=(x+10)/20`, `opp=1-align`, `urgency=.5·power+.5·opp`, `engage=.5·power+.5·align`, `issueRel = |stakeholder.issues ∩ plan.issues| / plan.issues` (0.5 if plan has none), `commTie = min(1, affiliatedCommunityCount/2)`.
  2. Map each SEP factor key → the signal that best proxies it (Influence→power, Urgency→urgency, Mutual Value→commTie+align, Regulatory Compliance→power, etc.; unknown→0.5).
  3. Score = mean of the sector-model and goal-model weighted blends, ×100. Band: ≥67 High, ≥40 Medium, else Low. Surface top contributing factors for a tooltip.
  - It is **advisory**: render it quietly (a subtle ✦ marker + tooltip), sort the plan's stakeholder table by it, and let **managers** override the band per-plan (stored in `plan.priorityOverrides`, with a "use suggestion" revert). Non-managers see the suggestion read-only.

## 4. Persistence & backend (`store.js` + `db.js`)
- **`store.js`** (`window.Store`): localStorage namespace `hpsm:`, a `SCHEMA_VERSION` that wipes the namespace on breaking changes, a `usePersistentState(key, seed)` React hook that hydrates from storage and writes through on change, plus a light cross-tab sync. **Every** mutable entity (stakeholders, scores, team, workspaces, stakeholderWorkspaces, users, conversations, messages, community, plans, appConfig) goes through it. Reads must tolerate missing keys (`x || ""`, `arr || []`) so older saved rows never crash after a field is added.
- **`db.js`**: the equivalent Supabase schema **as commented SQL** — one `create table` per entity with correct types (`text`, `jsonb`, `numeric`, `date`, FKs with `on delete cascade`), camelCase→snake_case mapping (`scenarioSolves`→`scenario_solves`, `communityIds`→`community_ids`), a normalized `community_votes` table alongside the jsonb, and RLS notes that mirror the UI's edit gates. Keep this file in lockstep with the data model — no schema drift.

## 5. Roles & permissions
- **manager**: edit anything; delete any workspace; edit app config and user roles; override SEP priorities.
- **member**: edit their own records; delete only workspaces they created.
- **system**: bots; never appear in people pickers/online lists.
Gate UI affordances on `currentUser.role` (NOT on whether the Master view is active).

## 6. Pages / views (top nav switches them; workspace dropdown scopes data — its current/hover states use the table yellows `#FCEFD6` / `#FBF7EB`)
1. **Login** — pick/create a user; sets presence online.
2. **List (table)** — `sheet.jsx`: frozen left columns (#, edit-icon, name, org) + reorderable/draggable data columns; multi-facet filter popover (type, priority, status, owners, issues, zone) + relationship-band filter; sort popover; inline cell editing (selects/inputs); add/edit **StakeholderModal**, **NotesModal**, **IssueSelector** (in `sheet-modals.jsx`). Body rows are **white**, the **#** column is light gray, the icon column is white; hover `#FBF7EB`, selected `#FCEFD6`. Coordinate (x/y) columns are **left-justified**, mono, tabular-nums, with read-only tinted cells for other raters.
3. **Scoring** — `scoring.jsx`: each teammate sets a stakeholder's x/y; the blend feeds the map.
4. **Map** — `map.jsx`: influence×alignment quadrant (−10..10), colored zone cells, draggable dots (writes back to that user's score), detail panel, movement/history mode, Tweaks variants (classic / halo / density).
5. **Plan** — `plan.jsx`: per-workspace engagement document. Sector + goal model pickers up front; sections **1 Scenario & Context** (solves/approach/outcome), **2 Company Goals**, **3 Stakeholders In This Plan** (SEP auto-ranked table + manager override + add existing/new), **4 Tactics** (title/how/timing/lead — Lead pill height must equal the Timing input), **5 Measurement & Reporting**; right rail = cross-functional team, the SEP factor explainer, and a locked **Personas** add-on. Plan home = white cards; review (read-only) mode mirrors it.
6. **Community** — `community.jsx` + `community-modal.jsx`: grid of value-driven engagement applications (white cards), filters by kind/stage, budget rollups, team alignment votes, create/edit modal, and a read-only **CommunityProfile** (the "archive"). Affiliation helpers (`affiliatedCommunity`, `stakeholderCumulativeUSD`, `communityEntryAmount`, `communityValueScore`) are defined once and reused by the table, plan, and profile — never re-implemented.
7. **Profiles** — `profiles.jsx`: stakeholder dossier: identity, blended relationship status, workspaces, affiliated community + cumulative committed $, notes history; clickable bridges in both directions (community ↔ stakeholder ↔ workspace).
8. **Setup** — `setup.jsx`: create/manage workspaces (segment, BU, owners).
9. **Settings** — `settings.jsx`: app config (name, accent, brand/icon, fiscal calendar start, editable issue list) — manager-only.
10. **Help** — `help.jsx`: the 12-step framework and the zone legend (strategy + action per zone from `STATUSES`).
11. **Messages** — `messaging.jsx`: direct/group/system conversations.

## 7. Cross-linking integrity (extend, never fork)
All relationships are **id references** resolved through shared helpers threaded as props: `getWorkspacesForStakeholder` (defined once in `app.jsx`), `affiliatedCommunity` (via `representedStakeholderId` + `linkedStakeholders`), `StakeholderPills`/`onOpenStakeholder` as the click-bridge, a single `updateCommunityApp`, and plan `communityIds`. Adding a feature means extending the existing entity/component/schema — not creating a parallel version.

## 8. Quality bar
- 1000 no's for every yes: no filler content, no data slop, minimalism over decoration.
- Verify every change in the **real browser** (icon fonts/ligatures don't render in DOM-snapshot screenshots; measure computed styles instead).
- Match the existing visual vocabulary on every addition; keep copy editorial and tight. **No em dashes.**
