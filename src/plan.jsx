import { useState, useRef, useEffect, useMemo } from 'react';
import { STAKEHOLDER_DATA } from './data';
import { displayName, formatDateLong, Icon, Tags, StatusPill, PriorityPill } from './components';
import { uid, nowStamp } from './store';
import { StakeholderModal, IssueSelector } from './sheet-modals';
import { StakeholderProfile } from './profiles';
import { affiliatedCommunity, communityEntryAmount } from './community';
import { OwnersDisplay, MultiOwnerPicker, UserAutocomplete } from './users';
import { LandingView } from './landing';

// Plan tab - landing grid of plans (like Community) + full-page editor + review.
// Reuses stakeholders, users, community, issues from the shared Store.

export function PlanView({
  explainerSlot,
  plans, updatePlan, deletePlan,
  addNonce, addNonceFor,
  workspaces, activeWorkspaceId, workspaceLabel, isMaster,
  stakeholders, scores, team, stakeholderWorkspaces, setStakeholderWorkspaces, addStakeholder,
  updateStakeholder, getWorkspacesForStakeholder, updateCommunityApp, onOpenWorkspace,
  users, community, companyIssues, currentUser
}) {
  const D = STAKEHOLDER_DATA;
  const [openId, setOpenId] = useState(null);
  const [mode, setMode] = useState("edit"); // edit | review
  useEffect(() => {
    if (addNonceFor === "plan" && addNonce) newPlan();
  }, [addNonce]);
  // External request to open a specific plan (e.g. from the profile page).
  useEffect(() => {
    if (window.__pendingPlanId) {
      const exists = plans.find(p => p.id === window.__pendingPlanId);
      if (exists) { setOpenId(window.__pendingPlanId); setMode("review"); }
      window.__pendingPlanId = null;
    }
  });

  const openPlan = openId ? plans.find(p => p.id === openId) : null;

  // Stakeholders that belong to a plan's workspace.
  function wsStakeholders(wsId) {
    return stakeholders.filter(s => (stakeholderWorkspaces[s.id] || []).includes(wsId));
  }

  function newPlan() {
    const wsId = isMaster ? (workspaces[0] && workspaces[0].id) : activeWorkspaceId;
    const ws = workspaces.find(w => w.id === wsId);
    const id = uid("plan");
    const plan = {
      id, workspaceId: wsId,
      title: (ws ? ws.name + " " : "") + "Engagement Plan",
      sectorModel: "energy", goalModel: "general",
      market: "", region: "", owners: [], summary: "", status: "Idea",
      scenarioSolves: "", scenarioApproach: "", scenarioOutcome: "",
      goals: [], issues: [], team: [], strategies: [],
      communityIds: [], measurement: "", priorityOverrides: {}, createdAt: today(), updatedAt: today()
    };
    updatePlan(plan);
    setOpenId(id); setMode("edit");
  }

  if (openPlan) {
    const shared = {
      plan: openPlan,
      workspace: workspaces.find(w => w.id === openPlan.workspaceId),
      workspaces,
      stakeholders: wsStakeholders(openPlan.workspaceId),
      allStakeholders: stakeholders,
      scores, team, isMaster,
      stakeholderWorkspaces, setStakeholderWorkspaces, addStakeholder,
      updateStakeholder, getWorkspacesForStakeholder, updateCommunityApp, onOpenWorkspace,
      users, community, companyIssues, currentUser,
      onBack: () => setOpenId(null)
    };
    return mode === "review"
      ? <PlanReview {...shared} onEdit={() => setMode("edit")} />
      : <PlanEditor {...shared} updatePlan={updatePlan} onReview={() => setMode("review")} />;
  }

  return (
    <PlanHome
      explainerSlot={explainerSlot}
      plans={plans}
      workspaces={workspaces}
      wsStakeholders={wsStakeholders}
      onOpen={(id) => { setOpenId(id); setMode("edit"); }}
      onReview={(id) => { setOpenId(id); setMode("review"); }}
      onNew={newPlan}
      onDelete={deletePlan}
      currentUser={currentUser}
      users={users}
    />
  );
}

function today() { return nowStamp(); }
function planDate(d) { return formatDateLong(d) || d; }

// ── PlanHome - landing grid, styled like the Community landing ──────────
function PlanHome({ explainerSlot, plans, workspaces, wsStakeholders, onOpen, onReview, onNew, onDelete, currentUser, users }) {
  const D = STAKEHOLDER_DATA;
  const [search, setSearch] = useState("");
  function sectorName(id) { const m = D.SEP_SECTOR_MODELS.find(x => x.id === id); return m ? m.name : id; }
  function goalName(id) { const m = D.SEP_GOAL_MODELS.find(x => x.id === id); return m ? m.name : id; }
  const yearOf = (iso) => { const d = iso ? new Date(iso) : null; return d && !isNaN(d) ? String(d.getFullYear()) : ""; };

  const filterDefs = [
    { key: "type", label: "Type of plan", get: p => goalName(p.goalModel) },
    { key: "issues", label: "Issues", get: p => p.issues || [] },
    { key: "market", label: "Market", get: p => p.market },
    { key: "region", label: "Region", get: p => p.region },
    { key: "status", label: "Status", get: p => p.status || "Idea" },
    { key: "year", label: "Year created", get: p => yearOf(p.createdAt) }
  ];
  const sortFields = [
    { key: "title", label: "Plan name", get: p => p.title },
    { key: "status", label: "Status", get: p => p.status || "" },
    { key: "_updated", label: "Last updated", get: p => p.updatedAt || p.createdAt || "" },
    { key: "_created", label: "Date added", get: p => p.createdAt || "" }
  ];
  const cols = [
    { key: "title", label: "Plan", w: "minmax(200px,2fr)", render: p => p.title },
    { key: "ws", label: "Workspace", w: "minmax(150px,1.3fr)", render: p => { const w = workspaces.find(x => x.id === p.workspaceId); return w ? w.name : "-"; } },
    { key: "type", label: "Type", w: "minmax(130px,1fr)", render: p => goalName(p.goalModel) },
    { key: "market", label: "Market", w: "minmax(110px,1fr)", render: p => p.market || "-" },
    { key: "region", label: "Region", w: "minmax(110px,1fr)", render: p => p.region || "-" },
    { key: "site", label: "Site", w: "minmax(120px,1fr)", render: p => p.site && STAKEHOLDER_DATA.SITES ? (STAKEHOLDER_DATA.siteLabel(STAKEHOLDER_DATA.SITES.find(s => s.id === p.site) || {}) || "-") : "-" },
    { key: "status", label: "Status", w: "120px", render: p => <span className="comm-stage-text" style={{ color: PLAN_STAGE_FG[p.status] || "var(--ink-2)" }}>{p.status || "Idea"}</span> }
  ];

  function renderCard(p) {
    const ws = workspaces.find(w => w.id === p.workspaceId);
    return (
            <div className="comm-card plan-card" key={p.id}>
              <div className="comm-card-head">
                <div style={{ minWidth: 0 }} className="plan-card-titlewrap">
                  <span className="comm-card-name plan-card-title" onClick={() => onReview(p.id)} title="Open plan">{p.title}</span>
                  <div className="comm-card-recipient muted">{ws ? ws.name : "-"}</div>
                </div>
                <div className="plan-card-team-avatars">
                  <OwnersDisplay users={users} owners={(p.team || []).map(m => m.userId)} size={24} label="team" />
                </div>
              </div>
              <div className="comm-card-badges">
                <span className="tag" style={PLAN_GOAL_COLORS[p.goalModel] ? { background: PLAN_GOAL_COLORS[p.goalModel].bg, color: PLAN_GOAL_COLORS[p.goalModel].fg, borderColor: "transparent" } : { background: "var(--bg-2)", color: "var(--ink-2)" }}>{goalName(p.goalModel)}</span>
                <span className="spacer" style={{ flex: 1 }} />
                <span className="comm-stage-text" style={{ color: PLAN_STAGE_FG[p.status] || "var(--ink-2)" }}>{p.status || "Idea"}</span>
              </div>
              {p.summary ? (
                <p className="comm-card-summary plan-card-summary">{p.summary}</p>
              ) : (
                <p className="comm-card-summary plan-card-summary muted">No summary written yet.</p>
              )}
              <div className="plan-linked-group">
                {(p.issues || []).length > 0 && (
                  <div className="comm-card-linked">
                    <span className="comm-meta-k">Issues</span>
                    <span className="comm-card-issues"><Tags values={p.issues} /></span>
                  </div>
                )}
                <div className="comm-card-linked">
                  <span className="comm-meta-k">Engaged</span>
                  <span className="comm-linked-names">{(wsStakeholders(p.workspaceId).length || 0) + " stakeholders"}</span>
                </div>
                <div className="comm-card-linked">
                  <span className="comm-meta-k">Market</span>
                  <span className="comm-linked-names">{p.market || "-"}</span>
                </div>
                <div className="comm-card-linked">
                  <span className="comm-meta-k">Region</span>
                  <span className="comm-linked-names">{p.region || "-"}</span>
                </div>
                <div className="comm-card-linked">
                  <span className="comm-meta-k">Site</span>
                  <span className="comm-linked-names">{p.site && D.SITES ? (D.siteLabel(D.SITES.find(s => s.id === p.site) || {}) || "-") : "-"}</span>
                </div>
              </div>
              <div className="comm-card-meta plan-meta-nobottom">
                <div className="comm-meta-row">
                  <span className="comm-meta-k">Tactics</span>
                  <span className="comm-meta-v">{(p.strategies || []).length ? (p.strategies.length + " deployed") : "-"}</span>
                </div>
                <div className="comm-meta-row">
                  <span className="comm-meta-k">Investments</span>
                  <span className="comm-meta-v">{(p.communityIds || []).length ? (p.communityIds.length + " linked") : "-"}</span>
                </div>
                <div className="comm-meta-row">
                  <span className="comm-meta-k">Segment</span>
                  <span className="comm-meta-v">{(() => { const w = workspaces.find(x => x.id === p.workspaceId); return w ? w.segment : "-"; })()}</span>
                </div>
                <div className="comm-meta-row">
                  <span className="comm-meta-k">Unit</span>
                  <span className="comm-meta-v">{(() => { const w = workspaces.find(x => x.id === p.workspaceId); return w ? w.businessUnit : "-"; })()}</span>
                </div>
              </div>
              <div className="comm-card-foot">
                <span className="muted">Updated {planDate(p.updatedAt)}</span>
                <span className="plan-card-actions">
                  <button className="explainer-link" onClick={(e) => { e.stopPropagation(); onReview(p.id); }}>Review</button>
                  <button className="explainer-link" onClick={(e) => { e.stopPropagation(); onOpen(p.id); }}>Edit</button>
                </span>
              </div>
            </div>
    );
  }

  const footerSlot = (
    <div className="sheet-footer comm-footer">
      <div className="group"><Icon name="plan" /> <strong style={{ color: "var(--ink)" }}>{plans.length}</strong> plans</div>
      <div className="group">·</div>
      <div className="group muted" style={{ flex: 1 }}>
        <strong style={{ color: "var(--ink-2)" }}>Priority</strong> is suggested from each stakeholder's map position, issue overlap, and community ties, weighted by the plan's sector and scenario models.
      </div>
    </div>
  );
  return (
    <LandingView
      footerSlot={footerSlot}
      items={plans}
      searchKeys={["title", "market", "region", "status"]}
      filterDefs={filterDefs}
      sortFields={sortFields}
      cols={cols}
      renderCard={renderCard}
      onRowClick={(p) => onReview(p.id)}
      onNew={onNew}
      newLabel="New plan"
      emptyText="No plans yet. Create one to begin building a stakeholder engagement plan."
      explainerSlot={explainerSlot}
    />
  );
}

// ── PlanEditor - full-page editor (the working surface) ─────────────────
function PlanEditor({ plan, workspace, workspaces, stakeholders, allStakeholders, scores, team, isMaster, stakeholderWorkspaces, setStakeholderWorkspaces, addStakeholder, updateStakeholder, getWorkspacesForStakeholder, updateCommunityApp, onOpenWorkspace, users, community, companyIssues, currentUser, updatePlan, onBack, onReview }) {
  const D = STAKEHOLDER_DATA;
  const p = plan;
  const [newSh, setNewSh] = useState(false);
  const [addExisting, setAddExisting] = useState(false);
  const [viewShId, setViewShId] = useState(null);
  const set = (patch) => updatePlan({ ...p, ...patch, updatedAt: today() });
  const sector = D.SEP_SECTOR_MODELS.find(m => m.id === p.sectorModel) || D.SEP_SECTOR_MODELS[0];
  const goal = D.SEP_GOAL_MODELS.find(m => m.id === p.goalModel) || D.SEP_GOAL_MODELS[0];
  const linkedCommunity = (p.communityIds || []).map(id => community.find(c => c.id === id)).filter(Boolean);
  function rel(s) { const wc = D.weightedCoord(s.id, scores || {}, team || []); return D.statusFor(wc.x, wc.y); }
  // SEP auto-ranking: suggestion per stakeholder, ordered most-critical first.
  // Override (if any) wins over the suggestion for both the pill and the sort.
  const sepCtx = { scores, team, community, planIssues: p.issues || [] };
  const ranked = (stakeholders || []).map(s => ({
    s,
    suggestion: sepScore(s, sector, goal, sepCtx),
    override: (p.priorityOverrides || {})[s.id] || null
  })).sort((a, b) => {
    const ra = PRIO_RANK[a.override || a.suggestion.band];
    const rb = PRIO_RANK[b.override || b.suggestion.band];
    return ra !== rb ? ra - rb : b.suggestion.score - a.suggestion.score;
  });
  function setPriorityOverride(id, band) {
    const next = { ...(p.priorityOverrides || {}) };
    if (band) next[id] = band; else delete next[id];
    set({ priorityOverrides: next });
  }
  // Every field must be filled before the plan can be saved.
  const planMissing = [];
  if (!(p.title || "").trim() || p.title === "Insert Plan Name") planMissing.push("Plan name");
  if (!p.workspaceId) planMissing.push("Workspace");
  if (!p.market) planMissing.push("Market");
  if (!p.region) planMissing.push("Region");
  if (!(p.owners && p.owners.length)) planMissing.push("Owners");
  if (!(p.summary || "").trim()) planMissing.push("Summary");
  if (!p.status) planMissing.push("Status");
  if (!(p.scenarioSolves || "").trim()) planMissing.push("What this plan solves");
  if (!(p.scenarioApproach || "").trim()) planMissing.push("Phased approach");
  if (!(p.scenarioOutcome || "").trim()) planMissing.push("Expected outcome");
  if (!(p.issues && p.issues.length)) planMissing.push("Issues");
  if (!(p.team && p.team.length)) planMissing.push("Team");
  if (!(p.strategies && p.strategies.length && p.strategies.every(s => (s.title || "").trim()))) planMissing.push("Tactics");
  if (!(p.measurement || "").trim()) planMissing.push("Measurement");
  const planValid = planMissing.length === 0;
  const viewSh = viewShId ? stakeholders.find(s => s.id === viewShId) : null;
  // existing stakeholders not yet assigned to this plan's workspace
  const addableStakeholders = (allStakeholders || []).filter(s => !(stakeholderWorkspaces[s.id] || []).includes(p.workspaceId));
  function assignExisting(id) {
    if (!id) return;
    setStakeholderWorkspaces({ ...stakeholderWorkspaces, [id]: [ ...(stakeholderWorkspaces[id] || []), p.workspaceId ] });
    setAddExisting(false);
  }

  return (
    <div className="sheet-wrap">
      <div className="sheet-toolbar">
        <button className="plan-back" onClick={onBack}>‹ All plans</button>
        <input className="plan-toolbar-title" value={p.title} placeholder="Insert Plan Name" onChange={e => set({ title: e.target.value })} />
        <div className="spacer" style={{ flex: 1 }} />
        <label className="plan-model-pick">
          <div className="designed-select">
            <select value={p.sectorModel} onChange={e => set({ sectorModel: e.target.value })}>
              {D.SEP_SECTOR_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </label>
        <label className="plan-model-pick">
          <div className="designed-select">
            <select value={p.goalModel} onChange={e => set({ goalModel: e.target.value })}>
              {D.SEP_GOAL_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </label>
        <button className="btn btn-primary" disabled={!planValid} onClick={onBack}>Save</button>
        {!planValid && <span className="modal-missing" title={planMissing.join(", ")}>{planMissing.length} left: {planMissing.slice(0, 2).join(", ")}{planMissing.length > 2 ? "…" : ""}</span>}
      </div>

      <div className="plan-body">
        {/* Floating metadata sidebar */}
        <aside className="plan-aside">
          <label className="plan-aside-field"><span className="lbl">One-line summary</span>
            <textarea className="plan-field" rows={2} placeholder="A single sentence describing this plan - shown on the plan card and review."
              value={p.summary || ""} onChange={e => set({ summary: e.target.value })} />
          </label>
          <label className="plan-aside-field"><span className="lbl">Status</span>
            <div className="designed-select">
              <select value={p.status || "Idea"} onChange={e => set({ status: e.target.value })}>
                {PLAN_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </label>
          <label className="plan-aside-field"><span className="lbl">Workspace</span>
            <div className="designed-select">
              <select value={p.workspaceId} onChange={e => set({ workspaceId: e.target.value })}>
                {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </label>
          <label className="plan-aside-field"><span className="lbl">Market</span>
            <div className="designed-select">
              <select value={p.market || ""} onChange={e => set({ market: e.target.value, region: "" })}>
                <option value="">Select market…</option>
                {Object.keys(D.MARKETS).map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </label>
          <label className="plan-aside-field"><span className="lbl">Region</span>
            <div className="designed-select">
              <select value={p.region || ""} onChange={e => set({ region: e.target.value })}>
                <option value="">Select region…</option>
                {(D.MARKETS[p.market] || []).map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </label>
          <label className="plan-aside-field"><span className="lbl">Site</span>
            <div className="designed-select">
              <select value={p.site || ""} onChange={e => {
                const id = e.target.value;
                const s = (D.SITES || []).find(x => x.id === id);
                if (s && s.state) set({ site: id, state: s.state });
                else set({ site: id });
              }}>
                <option value="">None</option>
                {(D.SITES || []).map(s => <option key={s.id} value={s.id}>{D.siteLabel(s)}</option>)}
              </select>
            </div>
          </label>
          <label className="plan-aside-field"><span className="lbl">State</span>
            <div className="designed-select">
              <select value={p.state || ""} onChange={e => set({ state: e.target.value })}>
                <option value="">None</option>
                {(D.US_STATES || []).map(st => <option key={st} value={st}>{D.STATE_ABBR[st] || st}</option>)}
              </select>
            </div>
          </label>
          <label className="plan-aside-field"><span className="lbl">Geography</span>
            <div className="designed-select">
              <select value={p.geography || ""} onChange={e => set({ geography: e.target.value })}>
                <option value="">Select geography…</option>
                {(D.GEOGRAPHIES || []).map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </label>
          <div className="plan-aside-field plan-divider"><span className="lbl">Owners</span>
            <MultiOwnerPicker users={users} owners={p.owners || []} onChange={v => set({ owners: v })} size={26} />
          </div>
          <div className="plan-aside-field plan-divider"><span className="lbl">Issues</span>
            <IssueSelector selected={p.issues || []} companyIssues={companyIssues || []} onChange={issues => set({ issues })} />
          </div>
          <div className="plan-aside-field plan-divider plan-community-field"><span className="lbl">Linked community investment</span>
            <PlanCommunity linked={linkedCommunity} all={community} market={p.market} region={p.region} onChange={communityIds => set({ communityIds })} />
          </div>
        </aside>

        {/* Main plan document */}
        <div className="plan-main">
          <PlanSection n="1" title="Scenario & Context">
            <label className="plan-q"><span className="lbl">What this plan solves &amp; its impact to the company</span>
              <textarea className="plan-field" rows={3} value={p.scenarioSolves || ""} onChange={e => set({ scenarioSolves: e.target.value })} />
            </label>
            <label className="plan-q"><span className="lbl">What we plan to do - a phased approach</span>
              <textarea className="plan-field" rows={3} value={p.scenarioApproach || ""} onChange={e => set({ scenarioApproach: e.target.value })} />
            </label>
            <label className="plan-q"><span className="lbl">The outcome we expect</span>
              <textarea className="plan-field" rows={3} value={p.scenarioOutcome || ""} onChange={e => set({ scenarioOutcome: e.target.value })} />
            </label>
          </PlanSection>

          <PlanSection n="2" title="Aligning With Organizational Goals">
            <p className="plan-inherited-note">Inherited from your organization's goals (set in Settings). How does your plan align with this organizational goal and drive success or defend your license to operate?</p>
            <div className="plan-goal-list">
              {(D.ORG_GOALS || []).map((g, i) => (
                <div className="plan-goal-item" key={i}>
                  <div className="subheader-text plan-goal-title">{g}</div>
                  <textarea
                    className="plan-field plan-goal-note"
                    placeholder="How does this plan work to achieve this goal in this workspace?"
                    value={(p.goalNotes && p.goalNotes[g]) || ""}
                    onChange={e => set("goalNotes", { ...(p.goalNotes || {}), [g]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </PlanSection>

          <PlanSection n="3" title="Stakeholders In This Plan">
            <div className="plan-sh-table">
              <div className="plan-sh-thead">
                <span>Stakeholder</span><span>Type</span><span>Relationship</span><span>Priority</span>
              </div>
              {ranked.map(({ s, suggestion, override }) => (
                <div className="plan-sh-trow" key={s.id} onClick={() => setViewShId(s.id)} title="Open stakeholder">
                  <span className="plan-sh-name">{displayName(s) || s.name}</span>
                  <span className="muted">{s.type}</span>
                  <span><StatusPill status={rel(s)} /></span>
                  <span><PlanPriorityCell s={s} suggestion={suggestion} override={override} canEdit={!!currentUser && currentUser.role === "manager"} onSet={(b) => setPriorityOverride(s.id, b)} /></span>
                </div>
              ))}
              {/* inline add-existing as the last white line */}
              <div className="plan-sh-addrow">
                <PlanAutocomplete
                  options={addableStakeholders}
                  getLabel={s => (displayName(s) || s.name)}
                  getSub={s => s.type}
                  onPick={assignExisting}
                  placeholder="Add existing stakeholder…"
                />
              </div>
            </div>
            <button className="btn plan-add-btn" onClick={() => setNewSh(true)}>Add New Stakeholder</button>
          </PlanSection>

          <PlanSection n="4" title="Tactics">
            <PlanStrategies strategies={p.strategies || []} users={users} onChange={strategies => set({ strategies })} />
          </PlanSection>

          <PlanSection n="5" title="Measurement & Reporting">
            <textarea className="plan-field" rows={4} placeholder="Cadence, metrics, and how progress ties to the fiscal quarters…"
              value={p.measurement} onChange={e => set({ measurement: e.target.value })} />
          </PlanSection>
        </div>

        {/* Right sidebar: cross-functional team + SEP model explanation */}
        <aside className="plan-aside plan-aside-right">
          <div className="plan-aside-field">
            <span className="lbl">Cross-functional team</span>
            <PlanTeam team={p.team || []} users={users} onChange={team => set({ team })} />
          </div>
          <div className="plan-aside-field plan-divider">
            <span className="lbl">How stakeholders are prioritized</span>
            <p className="plan-aside-explain">We <strong>suggest</strong> a priority for each stakeholder from their map position, issue overlap, and community ties - weighted by the factors below. It's a starting point: managers can override any suggestion (look for the <span className="prio-suggest-inline">✦</span>).</p>
            <SepExplain sector={sector} goal={goal} />
          </div>
          <div className="plan-aside-field plan-divider">
            <span className="lbl">Personas</span>
            <div className="plan-addon-note"><Icon name="lock" className="ico" /> Add-on - persona modeling from polling &amp; listening sessions.</div>
          </div>
        </aside>
      </div>

      <div className="sheet-footer">
        <div className="group"><Icon name="plan" /> <strong style={{ color: "var(--ink)" }}>{stakeholders.length}</strong> stakeholders in plan</div>
        <div className="group">·</div>
        <div className="group">{workspace ? workspace.name : "-"}</div>
        <div className="group">·</div>
        <div className="group">{sector.name}</div>
        <div className="spacer" style={{ flex: 1 }} />
        <div className="group muted">Saved · {planDate(p.updatedAt)}</div>
      </div>

      {newSh && StakeholderModal && (
        <StakeholderModal
          users={users}
          workspaces={workspaces}
          isMaster={false}
          currentUser={currentUser}
          existing={null}
          companyIssues={companyIssues}
          community={community}
          stakeholders={stakeholders}
          onCancel={() => setNewSh(false)}
          onSubmit={(data) => { if (addStakeholder) addStakeholder(data, p.workspaceId); setNewSh(false); }}
        />
      )}

      {viewSh && StakeholderProfile && (
        <StakeholderProfile
          stakeholder={viewSh}
          users={users}
          stakeholders={allStakeholders || stakeholders}
          community={community}
          scores={scores}
          team={team}
          getWorkspacesForStakeholder={getWorkspacesForStakeholder}
          updateCommunityApp={updateCommunityApp}
          currentUser={currentUser}
          companyIssues={companyIssues}
          onClose={() => setViewShId(null)}
        />
      )}

      {addExisting && false && (
        <></>
      )}
    </div>
  );
}

// Lead control - exactly an issues .tag pill (one color); click to (re)assign.
function LeadPick({ users, value, onChange }) {
  const [open, setOpen] = useState(false);
  const u = users.find(x => x.id === value);
  if (u && !open) {
    return (
      <span className="tag lead-tag" onClick={() => setOpen(true)}>
        <Avatar user={u} size={16} />
        {u.name}
        <span className="lead-x" onClick={e => { e.stopPropagation(); onChange(null); }}>×</span>
      </span>
    );
  }
  if (!u && !open) {
    return <button type="button" className="tag lead-tag lead-empty" onClick={() => setOpen(true)}>Assign lead…</button>;
  }
  return (
    <div className="lead-picker">
      <PlanAutocomplete options={users} getLabel={x => x.name} getSub={x => x.title} dark
        onPick={(id) => { onChange(id); setOpen(false); }} placeholder="Assign lead…" />
    </div>
  );
}

// Shared inline autocomplete - identical to the teammate search, white bg.
function PlanAutocomplete({ options, getLabel, getSub, onPick, placeholder, dark }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ql = q.toLowerCase();
  const matches = (ql ? options.filter(o => (getLabel(o) || "").toLowerCase().includes(ql) || (getSub(o) || "").toLowerCase().includes(ql)) : options).slice(0, 8);
  return (
    <div className={"user-autocomplete plan-ac" + (dark ? " plan-ac-dark" : "")} onBlur={() => setTimeout(() => setOpen(false), 150)}>
      <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder={placeholder} />
      {open && matches.length > 0 && (
        <div className="ua-menu">
          {matches.map(o => (
            <button key={o.id} type="button" className="ua-row" onMouseDown={() => { onPick(o.id); setQ(""); setOpen(false); }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ua-row-name">{getLabel(o)}</div>
                <div className="ua-row-title">{getSub(o)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PlanReview - full-length read-only page ─────────────────────────────
function PlanReview({ plan, workspace, stakeholders, users, community, companyIssues, currentUser, scores, team, onBack, onEdit }) {
  const D = STAKEHOLDER_DATA;
  const p = plan;
  const sector = D.SEP_SECTOR_MODELS.find(m => m.id === p.sectorModel) || D.SEP_SECTOR_MODELS[0];
  const goal = D.SEP_GOAL_MODELS.find(m => m.id === p.goalModel) || D.SEP_GOAL_MODELS[0];
  const linkedCommunity = (p.communityIds || []).map(id => community.find(c => c.id === id)).filter(Boolean);
  const fmt = (m) => m.factors.map(([k, w]) => `${k}×${w}`).join(" + ");
  function rel(s) { const wc = D.weightedCoord(s.id, scores || {}, team || []); return D.statusFor(wc.x, wc.y); }
  const sepCtx = { scores, team, community, planIssues: p.issues || [] };
  const PRIO = { High: 0, Medium: 1, Low: 2 };
  const rankedSh = (stakeholders || []).map(s => {
    const sug = sepScore(s, sector, goal, sepCtx);
    const band = (p.priorityOverrides || {})[s.id] || sug.band;
    return { s, band };
  }).sort((a, b) => PRIO[a.band] - PRIO[b.band]);
  const RS = ({ title, children }) => (
    <section className="plan-review-section">
      <h2>{title}</h2>
      {children}
    </section>
  );

  return (
    <div className="sheet-wrap">
      <div className="sheet-toolbar">
        <button className="btn btn-ghost" onClick={onBack} title="All plans"><Icon name="chevron-left" /> Plans</button>
        <span style={{ fontWeight: 500 }}>{p.title}</span>
        <div className="spacer" style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={onEdit}><Icon name="edit" /> Edit plan</button>
      </div>

      <div className="plan-review-body">
        <div className="plan-review-doc">
        <header className="plan-review-head">
            <h1>{p.title}</h1>
            <div className="muted">{workspace ? workspace.name : ""}{(p.market || p.region) ? " · " + [p.market, p.region].filter(Boolean).join(" / ") : ""}{p.site && D.SITES ? " · " + (D.siteLabel(D.SITES.find(s => s.id === p.site) || {}) || "") : ""}{p.state ? " · " + (D.STATE_ABBR[p.state] || p.state) : ""}{p.geography ? " · " + p.geography : ""} · Updated {planDate(p.updatedAt)}</div>
            {p.summary && <p className="plan-review-summary">{p.summary}</p>}
            <div className="plan-review-models">
              {PLAN_GOAL_COLORS[p.goalModel]
                ? <span className="tag" style={{ background: PLAN_GOAL_COLORS[p.goalModel].bg, color: PLAN_GOAL_COLORS[p.goalModel].fg, borderColor: "transparent" }}>{goal.name}</span>
                : <span className="tag" style={{ background: "var(--bg-2)", color: "var(--ink-2)" }}>{goal.name}</span>}
              <span className="comm-stage-text" style={{ color: PLAN_STAGE_FG[p.status] || "var(--ink-2)" }}>{p.status || "Idea"}</span>
              <span className="spacer" style={{ flex: 1 }} />
              <OwnersDisplay users={users} owners={p.owners || []} size={26} />
            </div>
            <div className="plan-algobar" style={{ marginTop: 12 }}>
              <span className="plan-algobar-tag">SEP model</span>
              <code>{sector.name}: {fmt(sector)}</code>
              <span className="plan-algobar-sep">·</span>
              <code>{goal.name}: {fmt(goal)}</code>
            </div>
          </header>

          <RS title="Scenario & Context">
            {(p.scenarioSolves || p.scenarioApproach || p.scenarioOutcome) ? (
              <div className="plan-review-scenario">
                {p.scenarioSolves && <div><span className="lbl">What this plan solves &amp; its impact</span><p className="plan-review-prose">{p.scenarioSolves}</p></div>}
                {p.scenarioApproach && <div><span className="lbl">Our phased approach</span><p className="plan-review-prose">{p.scenarioApproach}</p></div>}
                {p.scenarioOutcome && <div><span className="lbl">The outcome we expect</span><p className="plan-review-prose">{p.scenarioOutcome}</p></div>}
              </div>
            ) : <p className="plan-review-prose"><span className="muted">Not written yet.</span></p>}
          </RS>

          <RS title="Aligning With Organizational Goals">
            {(D.ORG_GOALS || []).length ? (
              <div className="plan-goal-list">
                {D.ORG_GOALS.map((g, i) => (
                  <div className="plan-goal-item" key={i}>
                    <div className="subheader-text plan-goal-title">{g}</div>
                    {(p.goalNotes && p.goalNotes[g])
                      ? <p className="plan-review-prose" style={{ margin: "4px 0 0" }}>{p.goalNotes[g]}</p>
                      : <p className="muted" style={{ margin: "4px 0 0", fontSize: 12.5 }}>No approach described yet.</p>}
                  </div>
                ))}
              </div>
            ) : <p className="muted">No goals listed.</p>}
          </RS>

          <RS title="Stakeholders In This Plan">
            {rankedSh.length ? (
              <div className="plan-sh-table" style={{ overflow: "visible" }}>
                <div className="plan-sh-thead">
                  <span>Stakeholder</span><span>Type</span><span>Relationship</span><span>Priority</span>
                </div>
                {rankedSh.map(({ s, band }) => (
                  <div className="plan-sh-trow" key={s.id} style={{ cursor: "default" }}>
                    <span className="plan-sh-name">{displayName(s) || s.name}</span>
                    <span className="muted">{s.type}</span>
                    <span><StatusPill status={rel(s)} /></span>
                    <span><PriorityPill value={band} /></span>
                  </div>
                ))}
              </div>
            ) : <p className="muted">No stakeholders in this workspace.</p>}
          </RS>

          <RS title="Cross-functional Team">
            {(p.team || []).length ? (
              <div className="plan-review-team">
                {p.team.map(m => {
                  const u = users.find(x => x.id === m.userId); if (!u) return null;
                  return <div className="plan-review-teamrow" key={m.userId}><Avatar user={u} size={28} /><div><div style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</div><div className="muted" style={{ fontSize: 11.5 }}>{m.role || u.title}</div></div></div>;
                })}
              </div>
            ) : <p className="muted">No team assigned.</p>}
          </RS>

          <RS title="Tactics">
            {(p.strategies || []).length ? p.strategies.map(s => {
              const owner = users.find(u => u.id === s.ownerId);
              return (
                <div className="plan-review-strat" key={s.id}>
                  <div className="plan-review-strat-title">{s.title || "Untitled"}</div>
                  {s.how && <p className="plan-review-prose">{s.how}</p>}
                  <div className="plan-review-strat-meta muted">
                    {s.timing && <span>Timing: {s.timing}</span>}
                    {owner && <span>Lead: {owner.name}</span>}
                  </div>
                </div>
              );
            }) : <p className="muted">No tactics yet.</p>}
          </RS>

          <RS title="Issues">
            {(p.issues || []).length ? <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 4 }}><Tags values={p.issues} /></span> : <p className="muted">None.</p>}
          </RS>

          <RS title="Community Investment">
            {linkedCommunity.length ? linkedCommunity.map(c => (
              <div className="plan-review-comm" key={c.id}>
                <span style={{ fontWeight: 500 }}>{c.name}</span>
                <span className="muted"> - {c.kind} · {c.stage} · {communityEntryAmount(c)}</span>
              </div>
            )) : <p className="muted">No community investments linked.</p>}
          </RS>

          <RS title="Measurement & Reporting">
            <p className="plan-review-prose">{p.measurement || <span className="muted">Not written yet.</span>}</p>
          </RS>
      </div>
      </div>
    </div>
  );
}

function PlanSection({ n, title, tag, wide, children }) {
  return (
    <div className={"plan-section" + (wide ? " plan-section-wide" : "")}>
      <div className="plan-section-head">
        <span className="plan-section-n">{n}</span>
        <h3>{title}</h3>
        {tag && <span className="plan-tag">{tag}</span>}
      </div>
      {children}
    </div>
  );
}

function PlanList({ items, onChange, placeholder }) {
  const [draft, setDraft] = useState("");
  function add() { const v = draft.trim(); if (!v) return; onChange([...(items || []), v]); setDraft(""); }
  return (
    <div className="plan-list">
      {(items || []).map((it, i) => (
        <div className="plan-list-item" key={i}>
          <span className="plan-list-bullet" />
          <input value={it} onChange={e => { const next = [...items]; next[i] = e.target.value; onChange(next); }} />
          <button className="btn btn-ghost" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove"><Icon name="close" /></button>
        </div>
      ))}
    </div>
  );
}

function PlanTeam({ team, users, onChange }) {
  const available = users.filter(u => u.role !== "system" && !team.find(t => t.userId === u.id));
  const [adding, setAdding] = useState(false);
  return (
    <div className="plan-team">
      {team.map((m, i) => {
        const u = users.find(x => x.id === m.userId);
        if (!u) return null;
        return (
          <div className="plan-team-row" key={m.userId}>
            <Avatar user={u} size={28} />
            <div className="plan-team-meta">
              <div style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</div>
              <input className="plan-team-role" value={m.role} placeholder="Role on this plan"
                onChange={e => { const next = [...team]; next[i] = { ...m, role: e.target.value }; onChange(next); }} />
            </div>
            <button className="btn btn-ghost" onClick={() => onChange(team.filter(t => t.userId !== m.userId))} aria-label="Remove"><Icon name="close" /></button>
          </div>
        );
      })}
      {adding ? (
        <div className="plan-team-add">
          <UserAutocomplete users={available} value={null} placeholder="Search teammates…" autoFocus
            onChange={(id) => { if (id) { onChange([...team, { userId: id, role: "" }]); setAdding(false); } }} />
        </div>
      ) : (
        available.length > 0 && <button className="btn plan-add-inline" onClick={() => setAdding(true)}>Add Teammate</button>
      )}
    </div>
  );
}

function PlanStrategies({ strategies, users, onChange }) {
  function add() { onChange([...(strategies || []), { id: uid("st"), title: "", how: "", timing: "", ownerId: "" }]); }
  function upd(id, patch) { onChange(strategies.map(s => s.id === id ? { ...s, ...patch } : s)); }
  return (
    <div className="plan-strats">
      {(strategies || []).map(s => (
        <div className="plan-strat" key={s.id}>
          <div className="plan-strat-top">
            <input className="plan-strat-title" value={s.title} placeholder="Strategy / tactic" onChange={e => upd(s.id, { title: e.target.value })} />
            <button className="btn btn-ghost" onClick={() => onChange(strategies.filter(x => x.id !== s.id))} aria-label="Remove"><Icon name="close" /></button>
          </div>
          <textarea className="plan-field" rows={2} placeholder="How - the action to take" value={s.how} onChange={e => upd(s.id, { how: e.target.value })} />
          <div className="plan-strat-meta-inline">
            <label className="plan-inline-field plan-timing-field">
              <span className="lbl">Timing</span>
              <input className="plan-inline-input" value={s.timing} placeholder="e.g. Q1–Q2" onChange={e => upd(s.id, { timing: e.target.value })} />
            </label>
            <label className="plan-inline-field">
              <span className="lbl">Lead</span>
              <LeadPick users={users.filter(u => u.role !== "system")} value={s.ownerId} onChange={v => upd(s.id, { ownerId: v })} />
            </label>
          </div>
        </div>
      ))}
      <div className="plan-tactic-add" style={{ display: "none" }} />
    </div>
  );
}

function PlanCommunity({ linked, all, onChange, market, region }) {
  const [adding, setAdding] = useState(false);
  const linkedIds = linked.map(l => l.id);
  // Available community investments scoped to the plan's market & region.
  const available = all.filter(c => !linkedIds.includes(c.id)
    && (!market || (c.markets || []).includes(market) || c.market === market)
    && (!region || (c.regions || []).includes(region) || c.region === region));
  return (
    <div className="plan-community">
      {linked.map(c => (
        <div className="plan-comm-row" key={c.id}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
            <div className="muted" style={{ fontSize: 11 }}>{c.kind} · {c.stage} · {communityEntryAmount(c)}</div>
          </div>
          <button className="btn btn-ghost" onClick={() => onChange(linkedIds.filter(id => id !== c.id))} aria-label="Remove"><Icon name="close" /></button>
        </div>
      ))}
      {!market || !region ? (
        <p className="muted" style={{ fontSize: 12, margin: "2px 0 0" }}>Select a market and region above to see available community investments.</p>
      ) : adding ? (
        <div className="plan-team-add">
          <UserAutocomplete
            users={available.map(c => ({ id: c.id, name: c.name, title: `${c.kind} · ${c.stage}`, noAvatar: true }))}
            value={null}
            placeholder="Search community investments…"
            autoFocus
            onChange={(id) => { if (id) { onChange([...linkedIds, id]); setAdding(false); } }}
          />
        </div>
      ) : (
        available.length > 0
          ? <button className="btn plan-add-inline" onClick={() => setAdding(true)}>Add Community Investment</button>
          : <p className="muted" style={{ fontSize: 12, margin: "2px 0 0" }}>No community investments available for this market and region.</p>
      )}
    </div>
  );
}

export const PLAN_STAGES = ["Idea", "Proposed", "Under Review", "Active", "Complete"];
// Plan-type (goal model) pill colors - same warm palette family as community KindBadge.
export const PLAN_GOAL_COLORS = {
  "general":      { bg: "#E1E1DA", fg: "#54524A" },
  "shared-value": { bg: "#DDE7C2", fg: "#2f5a26" },
  "crisis":       { bg: "#E5D0D0", fg: "#7a2424" },
  "activist":     { bg: "#E8DEC2", fg: "#6e5419" },
  "dei":          { bg: "#DCD3E0", fg: "#4F3F69" },
  "community":    { bg: "#C2D9E8", fg: "#23496e" },
  "union":        { bg: "#C9E3CC", fg: "#2f5a26" }
};
export const PLAN_STAGE_FG = {
  "Idea": "#54524A", "Proposed": "#6E5419", "Under Review": "#6e5419",
  "Active": "#2f5a26", "Complete": "#2E3F66"
};

function SepExplain({ sector, goal }) {
  const D = STAKEHOLDER_DATA;
  const groups = [
    { header: "Sector · " + sector.name, factors: sector.factors },
    { header: "Scenario · " + goal.name, factors: goal.factors }
  ];
  return (
    <div className="sep-explain">
      {groups.map((g, i) => (
        <div key={i} className="sep-explain-group">
          <div className="sep-explain-head">{g.header}</div>
          {g.factors.map(([k, w]) => (
            <div key={k} className="sep-explain-factor">
              <div className="sep-explain-top">
                <strong>{D.SEP_FACTORS[k] ? D.SEP_FACTORS[k].label : k}</strong>
                <span className="sep-explain-w">{Math.round(w * 100)}%</span>
              </div>
              <div className="sep-explain-desc">{D.SEP_FACTORS[k] ? D.SEP_FACTORS[k].desc : ""}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── SEP auto-ranking ────────────────────────────────────────────────────
// Derives a 0–100 engagement-priority SUGGESTION for a stakeholder from
// signals we already hold - map position (influence/alignment), issue
// overlap with the plan, and linked community investment - weighted by the
// plan's chosen sector + goal models. It is advisory only; managers can
// override the resulting band per-plan (see PlanPriorityCell).
function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

// Each SEP factor key maps to whichever base signal best proxies it. Returns
// a 0–1 value. Anything uncategorised falls back to a neutral 0.5 so an
// unknown factor neither inflates nor tanks the score.
function sepFactorSignal(key, sig) {
  const { power, align, opp, urgency, engage, issueRel, commTie } = sig;
  const M = {
    I: power, FS: power, RC: 0.7 * power + 0.3 * opp, OR: 0.6 * power + 0.4 * opp,
    U: urgency, RI: urgency, IR: urgency, RM: urgency, NP: opp,
    EP: engage, SE: engage, EC: engage, CE: engage, MR: engage,
    DC: engage, DT: engage, TI: engage, IS: engage,
    SA: align, LTSA: align, SI: align, CT: align, ER: align,
    MV: 0.5 * commTie + 0.5 * align, TB: 0.5 * align + 0.5 * commTie,
    CI: 0.5 * commTie + 0.5 * engage, CTS: 0.5 * commTie + 0.5 * align,
    CNA: commTie, PD: commTie, IM: commTie,
    DI: issueRel, IC: issueRel, EO: issueRel, IE: issueRel, ES: issueRel
  };
  return key in M ? M[key] : 0.5;
}

// stakeholder, sector model, goal model, ctx={ scores, team, community, planIssues }
function sepScore(s, sector, goal, ctx) {
  const D = STAKEHOLDER_DATA;
  const wc = D.weightedCoord(s.id, ctx.scores || {}, ctx.team || []);
  const power = clamp01((wc.y + 10) / 20);   // vertical axis = influence / importance
  const align = clamp01((wc.x + 10) / 20);   // horizontal axis = supportive alignment
  const opp = 1 - align;                      // opposition / risk
  const urgency = clamp01(0.5 * power + 0.5 * opp);
  const engage = clamp01(0.5 * power + 0.5 * align);
  const pIssues = ctx.planIssues || [];
  const sIssues = s.issues || [];
  const issueRel = pIssues.length
    ? clamp01(sIssues.filter(i => pIssues.includes(i)).length / pIssues.length)
    : 0.5;
  const affil = affiliatedCommunity(s.id, ctx.community || []);
  const commTie = clamp01(affil.length / 2);
  const sig = { power, align, opp, urgency, engage, issueRel, commTie };

  // Weighted blend per model (each model's factor weights sum to ~1); the
  // overall score is the mean of the sector and goal model scores.
  const merged = {};
  function modelScore(model) {
    let acc = 0, wsum = 0;
    for (const [k, w] of model.factors) {
      const v = sepFactorSignal(k, sig);
      acc += w * v; wsum += w;
      merged[k] = (merged[k] || 0) + w;  // collect for "top factors" readout
    }
    return wsum ? acc / wsum : 0;
  }
  const score01 = 0.5 * modelScore(sector) + 0.5 * modelScore(goal);
  const score = Math.round(score01 * 100);
  const band = score >= 67 ? "High" : score >= 40 ? "Medium" : "Low";
  // Top contributing factors = highest combined model weight (what drives this model).
  const top = Object.entries(merged)
    .sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([k]) => (D.SEP_FACTORS[k] ? D.SEP_FACTORS[k].label : k));
  return { score, band, top };
}

const PRIO_RANK = { High: 0, Medium: 1, Low: 2 };

// Priority cell: shows the EFFECTIVE band (override ?? suggestion). When it is
// the suggestion, a subtle ✦ marks it as auto-generated; managers can click to
// override or revert. Non-managers see the suggestion + tooltip, read-only.
function PlanPriorityCell({ s, suggestion, override, canEdit, onSet }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const effective = override || suggestion.band;
  const tip = "Suggested · " + suggestion.score + "/100 - weighs " + suggestion.top.join(", ");
  return (
    <span className="plan-prio-cell" ref={wrapRef} onClick={(e) => { e.stopPropagation(); if (canEdit) setOpen(o => !o); }}>
      <PriorityPill value={effective} />
      {override
        ? <span className="prio-mark prio-overridden" title="Set by a manager - click to use the suggestion">·set</span>
        : <span className="prio-mark prio-suggest" title={tip}>✦</span>}
      {open && canEdit && (
        <div className="prio-pop" onClick={(e) => e.stopPropagation()}>
          <div className="prio-pop-head">
            <span className="prio-pop-score">Suggested · <strong>{suggestion.band}</strong> · {suggestion.score}/100</span>
            <span className="prio-pop-why">Weighs {suggestion.top.join(", ")}</span>
          </div>
          <div className="prio-pop-opts">
            {["High", "Medium", "Low"].map(b => (
              <button key={b} className={"prio-pop-opt" + (effective === b ? " on" : "")}
                onClick={() => { onSet(b === suggestion.band ? null : b); setOpen(false); }}>{b}</button>
            ))}
          </div>
          {override && (
            <button className="prio-pop-revert" onClick={() => { onSet(null); setOpen(false); }}>
              <Icon name="sparkle" className="ico" /> Use suggestion ({suggestion.band})
            </button>
          )}
        </div>
      )}
    </span>
  );
}
