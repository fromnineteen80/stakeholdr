# Stakeholder Engagement App: Build List

Source: the running feature-planning conversation you sent, full version including the dashboard cards, the modals-versus-pages decision, the mention-linking spec, and the RecordLayout scaffold.

Status convention: items are unchecked unless the source explicitly records them as done. Check off the rest against your actual progress.

Two phases run throughout:
- **Demo / Frontend** is buildable now on the existing React components and Store/localStorage data layer, with no secrets in the browser.
- **Backend** is the Claude Code plus Supabase handoff: auth, multi-user, real integrations, storage, email, and scheduled jobs.

---

## Part 1. Architecture and foundations

Build these first. Everything else renders on them.

### 1. Modals policy (guardrail, decided)
The rule: decide by what happens after the interaction. If the user lands back where they started, it is a modal. If the user has navigated somewhere new, it is a page. Modals are almost never used beyond quick search or quick views that hand you something and send you to a page.

Keep as modals:
- [x] Command search (Cmd-K): gives you a result, sends you to a page.
- [x] Confirm dialogs (delete "are you sure").
- [x] Quick views that hand off to a page.
- [ ] Mobile companion: a glance-and-dismiss surface, treated as a modal (see Part 2).

Move from modal to page:
- [ ] Stakeholder full record becomes a page (decided yes). The only surviving stakeholder modal is a lightweight quick-view that offers "open full record" leading to the page.
- [ ] Community and stakeholder profiles that currently open layered on top become pages.
- Precedent already set: Plan and Community editors are full pages, and their read-only views are pages with the back-arrow bar.

### 2. Universal-table audit (foundation)
- [ ] Audit every table to the single universal component: profile tabs, settings, see-all views, scoring grids.
- [ ] Confirm consistent behavior everywhere the table renders.

### 3. RecordLayout universal scaffold (foundation, the scaffolding-to-pages buildout)
One shared scaffold drives read-only and edit for every record type: stakeholders, plans, community, workspaces. This is what kills the modal-versus-page inconsistency and makes the whole app page-based and mention-linkable.

**Read-only page layout (definitive):**
- [ ] Left sidebar is section nav, one item per element of the record. Example for a stakeholder: Overview, Scoring, Community, Notes, History. Example for a plan: Scenario, Goals, Stakeholders, Tactics, Measurement.
- [ ] Left sidebar contracts to icons-only, Claude-style collapse toggle, state remembered.
- [ ] Main content uses full width for the selected section. Take advantage of full width rather than the rudimentary settings sub-page approach.
- [ ] Right sidebar, optional in read-only, holds metadata, intelligence, and note-taking. Also contractible.
- [ ] Top bar shows the back-trail and title, consistent with the Plan and Community read-only views.

**Edit page layout (all types):**
- [ ] Same skeleton as read-only: contractible left section-nav, main content, contractible right sidebar for metadata, intelligence, and notes. Fields are editable.

**Component:**
- [ ] Build one RecordLayout component: left-nav, collapsible left and right rails, back-trail, and a content slot. All record types render through it.
- [ ] Opening a record leaves a back-trail to wherever the user came from (list, intel card, message link, scoring row). The back-trail is what makes pages-over-modals feel right instead of disorienting.

**Build sequence (so it is never left half-broken):**
- [ ] Build the RecordLayout scaffold in isolation (rails, collapse, back-trail).
- [ ] Convert the stakeholder record first and verify end to end. It is the modal that most needs to become a page.
- [ ] Roll the same scaffold to plan, community, and workspace, both read-only and edit. Plan and Community are already pages and should now render through the shared scaffold. Workspaces are already done as pages.
- [ ] Wire mention-linking to these pages (see item 4).

### 4. Mention-linking system (@ / slash / # / $)
Inline references in messaging and planning that resolve to read-only pages. Never edits, never modals.

- [ ] Triggers: @ for stakeholders, slash for workspaces, # for plans, $ for community entries.
- [ ] One autocomplete component, four modes. The trigger character selects the dataset and the chip color and icon. Reuse the existing teammate and stakeholder typeahead rather than building a new heavy component.
- [ ] Small popover anchored at the caret, about six results, keyboard-navigable, dismiss on space or escape. Clean, not bulky.
- [ ] Store each reference as a structured token, {type, id, label}, not raw text, so the link survives renames and resolves to the right page. This matters for Supabase later.
- [ ] Render as a subtle inline chip: entity icon and name, tinted by type, so a glance tells you what it links to.
- [ ] Clicking a chip navigates to that entity's read-only page with the back-trail.
- [ ] Build in the messaging composer first, then extend to plan free-text fields (scenario, tactics, research notes) so a plan can reference the stakeholders and community it concerns.
- [ ] Decision: build the mention setup now and build into it as the pages get refined.
- Permissions caveat for backend: a link must respect who can see what, so you cannot deep-link someone to a workspace they are not on. Demo can ignore this; flag for Claude Code.

### 5. WorkHQ rename
- [x] The intelligence-layer strip on workspaces is renamed WorkHQ, a play on workSpace. Renamed and shipped per the source.

---

## Part 2. Demo / Frontend feature punch list

After the foundations are in place.

### Dashboard cards
- [ ] Three cards on the dashboard: Alerts (wide, developments), Need your score (wide), Tasks (votes).
- [ ] Each card is a title plus an item list, with no duplicate count or explainer.

### Empty states and blank-org seed path
- [ ] Empty states for every surface: no workspaces, no plans, no stakeholders. Pairs with the tour.
- [ ] Blank-org versus demo-data toggle, so a new customer does not inherit the HP sample data.
- [ ] Clean seed path for a fresh org.

### Import offline stakeholder lists (CSV)
- [ ] CSV / Excel paste-or-upload, then column-map, then preview, then commit, writing through the same Store.
- File parsing runs client-side, so no backend needed for the demo.

### Onboarding product tour
- [ ] Stepped spotlight / coachmarks.
- [ ] Dismissible.
- [ ] "Replay tour" in the profile menu.

### Export plans to Word and PDF
- [ ] Word (.docx) generated client-side.
- [ ] PDF export.
- [ ] Print stylesheet for the plan deliverables.
- [ ] Map export for the plan deliverables.
- Google Docs export needs OAuth and moves to the backend phase.

### Integrations settings shell (UI only)
- [ ] Connect cards for LegiScan, Quorum, sales CRMs, marketing tools, Google Drive.
- [ ] Key fields and connection status display.
- Build the shell only. The actual calls run server-side, because third-party API keys must never ship in the browser.

### Mobile companion (treated as a modal)
A glance-and-dismiss surface for before, during, and after a meeting. Read plus light-write, nothing heavy.

In scope:
- [ ] Stakeholder quick-view: fast search, scorecard essentials on one screen (name, org, relationship band, x/y, priority, issues, last contact, owners, latest notes). Read-only.
- [ ] Add a note: the one true write action. Timestamped, attributed, syncs back.
- [ ] Messages: read and reply to the team and the Reminders thread.
- [ ] Optional: single-tap update of status or last-contact date.
- [ ] Optional: view assigned tactics / plans, read-only.

Out on mobile: wide tables, map drag-plotting, plan / community editing, settings, scoring grids. Use an "open on desktop for full editing" nudge.

Build approach:
- [ ] Reuse the same React components and the same Store / data layer so notes and messages stay in sync.
- Demo runs on localStorage. Real cross-device sync arrives with the backend.

### AI Message Generator (paid add-on)
Turns a finished plan into key engagement messages that advance the stated goals.
- [ ] "Generate key messages" action on a finished plan, gated like the Personas add-on with a locked card and upgrade nudge.
- [ ] Pre-generation prompt step: ask for supporting documents, data points, polling, or perspectives.
- [ ] Targeting toggles drawn from the plan: which goal, which stakeholder segment, which issue, tone / channel.
- [ ] Output: message pillars / talking points mapped back to specific goals and stakeholders, editable in place.
- [ ] Save with the plan so it is versioned and exportable, tying into the Word / PDF export.
- [ ] Design the input contract to accept "evidence" generically (docs, data, survey results), even though only free-text is wired now. This sets up the later modeling and surveys roadmap.
- Demo wiring: connect to the in-artifact window.claude.complete so it generates live for the client demo.
- Production: the AI call is server-side only, with a metering / billing hook.

### Cross-cutting demo polish
- [ ] Bulk actions: multi-select rows to assign to workspace, tag, delete, export.
- [ ] Required-field validation and save guards, made universal across all record types.
- [ ] Soft-delete plus restore / archive UX instead of hard delete.
- [ ] Confirm dialogs everywhere (source notes mostly done).
- [ ] Table virtualization for hundreds or thousands of stakeholders.
- [ ] Responsive / tablet story for the wide tables.
- [ ] Accessibility pass: keyboard nav, focus rings, ARIA, contrast across all three themes.

### Handoff prep
- [ ] Capture the screenshot baseline.
- [ ] Write the migration spec for Claude Code.

---

## Part 3. Backend phase (Claude Code plus Supabase)

- [ ] Supabase setup and the multi-user data model.
- [ ] Real auth plus the invite-code signup to org gate. The code exists; the gate is backend.
- [ ] Row-level security and the full permissions model: view-only members, who can delete, mention-link visibility.
- [ ] Real integration calls behind a server: LegiScan, Quorum, CRM, marketing, Drive.
- [ ] Google Docs export via OAuth.
- [ ] Supabase Storage for file uploads (logos, profile photos, community attachments, currently data-URLs in localStorage).
- [ ] Email triggers for invites, quarterly rescore reminders, and digests.
- [ ] Time-zone and fiscal-rollover jobs: quarter-close to rescore-prompt to three-year-total, executed server-side.
- [ ] Cross-device sync for the mobile companion (notes and messages in real sync).
- [ ] Server-side AI call for the Message Generator, with metering and billing.
- [ ] Activity log / audit trail surfacing who changed what and when, built on the existing createdAt / updatedAt / approvedAt fields.
- [ ] Loading, error, and offline states against the live network.
- [ ] Billing and add-on gating for Personas and the AI Message Generator, if this ships as commercial SaaS.
- [ ] Multi-user, no-fail, real-world reliability pass.

---

## Part 4. Hard constraints

- [ ] Do not put any LLM or third-party API key in the browser.
- [ ] Do not build anything requiring secret keys or OAuth in the demo: Drive, Google Docs, and the integration calls. Build their UI and leave the wiring for the secure backend.

---

## Part 5. Open decision

- [ ] Default landing page. Today it is the master list, which sets the tone for what the product is. The open question was how other CRMs handle the landing surface and how to stay simple while signaling that this tool is more intelligent and organized than a standard CRM. Not yet resolved. The three-card dashboard above is part of this surface.
