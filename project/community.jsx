// community.jsx - Community & Foundation applications.
// Value-driven engagements (philanthropy, volunteerism, corporate giving,
// political action, sustainability) that the team creates, reviews, votes on,
// and aligns to stakeholders, markets, regions, and issues.
//
// Reuses: Icon, Tags, Avatar, OwnersDisplay, MultiOwnerPicker, StakeholderPicker,
// designed-select chrome, modal patterns, and the Store (entity "community").

const KIND_COLORS = {
  "Philanthropy":           { bg: "#DDE7C2", fg: "#2f5a26" },
  "Volunteering":           { bg: "#C2D9E8", fg: "#23496e" },
  "Corporate Giving":       { bg: "#E8DEC2", fg: "#6e5419" },
  "Political Action (PAC)": { bg: "#E5D0D0", fg: "#7a2424" },
  "Sustainability":         { bg: "#C9E3CC", fg: "#2f5a26" },
  "Social Impact":          { bg: "#DCD3E0", fg: "#4F3F69" }
};
const STAGE_COLORS = {
  "Idea":        { bg: "#E1E1DA", fg: "#54524A" },
  "Proposed":    { bg: "#EEE6D2", fg: "#6E5419" },
  "Under Review":{ bg: "#E8DEC2", fg: "#6e5419" },
  "Approved":    { bg: "#DDE7C2", fg: "#2f5a26" },
  "Active":      { bg: "#C2D9A4", fg: "#2f5a26" },
  "Complete":    { bg: "#D9DEE8", fg: "#2E3F66" },
  "Declined":    { bg: "#E5D0D0", fg: "#7a2424" }
};

function KindBadge({ kind }) {
  const c = KIND_COLORS[kind] || { bg: "var(--bg-2)", fg: "var(--ink-2)" };
  return <span className="tag" style={{ background: c.bg, color: c.fg, borderColor: "transparent" }}>{kind}</span>;
}
function StageBadge({ stage }) {
  const c = STAGE_COLORS[stage] || { bg: "var(--bg-2)", fg: "var(--ink-2)" };
  return <span className="tag" style={{ background: c.bg, color: c.fg, borderColor: "transparent" }}>{stage}</span>;
}

function money(n) {
  const v = Number(n) || 0;
  return "$" + v.toLocaleString();
}
function moneyK(n) {
  const v = Number(n) || 0;
  if (v >= 1000000) return "$" + (v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1) + "m";
  if (v >= 1000) return "$" + Math.round(v / 1000) + "k";
  return "$" + v;
}

// A stakeholder engagement is "decided" once it reaches a committed stage.
// Single source of truth used by both the card label and the budget rollup.
function isDecided(stage) {
  return stage === "Approved" || stage === "Active" || stage === "Complete";
}

// Approved-amount display label, by stage + amount.
function approvedLabel(app) {
  if (app.stage === "Declined") return { text: "Declined", tone: "neg" };
  if (!isDecided(app.stage)) return { text: "TBD", tone: "muted" };
  const appr = Number(app.approvedAmount) || 0;
  if (appr <= 0) return { text: "No Expense", tone: "muted" };
  return { text: money(appr), tone: "pos" };
}

// Value score: average of license-to-operate and relationship impact (0–10).
function valueScore(app) {
  const a = Number(app.licenseToOperate) || 0;
  const b = Number(app.relationshipImpact) || 0;
  return ((a + b) / 2);
}

function CommunityView({
  explainerSlot,
  addNonce, addNonceFor,
  community, setCommunity, appConfig, stakeholders, users, currentUser, companyIssues, workspaceLabel, isMaster,
  scores, team, getWorkspacesForStakeholder
}) {
  const D = window.STAKEHOLDER_DATA;
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState([]);
  const [stageFilter, setStageFilter] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editViewFirst, setEditViewFirst] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [viewStakeholderId, setViewStakeholderId] = useState(null); // bridge target
  const [viewId, setViewId] = useState(null); // read-only page view
  useEffect(() => {
    if (addNonceFor === "community" && addNonce) setNewOpen(true);
  }, [addNonce]);
  // External request to open a specific community entry (e.g. from profile).
  useEffect(() => {
    if (window.__pendingCommunityId) {
      const exists = community.find(c => c.id === window.__pendingCommunityId);
      if (exists) { setViewId(window.__pendingCommunityId); }
      window.__pendingCommunityId = null;
    }
  });

  const editing = editId ? community.find(c => c.id === editId) : null;
  const viewApp = viewId ? community.find(c => c.id === viewId) : null;
  const viewStakeholder = viewStakeholderId ? stakeholders.find(s => s.id === viewStakeholderId) : null;

  function toggle(list, set, v) {
    set(list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
  }

  const filtered = useMemo(() => {
    let out = community;
    if (kindFilter.length)  out = out.filter(a => kindFilter.includes(a.kind));
    if (stageFilter.length) out = out.filter(a => stageFilter.includes(a.stage));
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(a =>
        (a.name || "").toLowerCase().includes(q) ||
        (a.recipient || "").toLowerCase().includes(q) ||
        (a.summary || "").toLowerCase().includes(q) ||
        (a.issues || []).some(i => i.toLowerCase().includes(q))
      );
    }
    return out;
  }, [community, kindFilter, stageFilter, search]);

  // Budget rollups — fiscal-year aware, with multi-year allocation.
  const rollup = useMemo(() => {
    const fsMonth = (appConfig && appConfig.fiscalStartMonth) || 1;
    const fsDay = (appConfig && appConfig.fiscalStartDay) || 1;
    // Fiscal-year START year for a given date (robust for any start month).
    function fyStartYear(dateStr) {
      const d = dateStr ? new Date(dateStr) : null;
      if (!d || isNaN(d)) return null;
      const m = d.getMonth() + 1, day = d.getDate(), y = d.getFullYear();
      return (m > fsMonth || (m === fsMonth && day >= fsDay)) ? y : y - 1;
    }
    const curFY = fyStartYear(new Date().toISOString()) ;
    // Per-entry allocation to a given fiscal-year-start-year.
    function allocInFY(a, fy) {
      const appr = Number(a.approvedAmount) || 0;
      if (!isDecided(a.stage) || appr <= 0) return 0;
      const startFY = fyStartYear(a.dateApproved || a.createdAt);
      if (startFY == null) return 0;
      const n = (a.recurrence === "Multi-year") ? Math.max(1, Number(a.years) || 1) : 1;
      if (a.recurrence === "Multi-year") {
        return (fy >= startFY && fy < startFY + n) ? appr / n : 0;
      }
      if (a.recurrence === "Annual") {
        return (fy >= startFY) ? appr : 0;           // recurs each FY from approval onward
      }
      return (fy === startFY) ? appr : 0;            // One-time
    }
    let requested = 0, approved = 0;
    community.forEach(a => {
      requested += a.unit === "USD" ? (Number(a.amount) || 0) : 0;
      if (isDecided(a.stage)) approved += Number(a.approvedAmount) || 0;
    });
    const annual = community.reduce((s, a) => s + allocInFY(a, curFY), 0);
    const cumulative = community.reduce((s, a) =>
      s + allocInFY(a, curFY) + allocInFY(a, curFY - 1) + allocInFY(a, curFY - 2), 0);
    return { requested, approved, annual, cumulative };
  }, [community, appConfig]);

  function upsert(app) {
    setCommunity(prev => {
      const idx = prev.findIndex(a => a.id === app.id);
      if (idx === -1) return [app, ...prev];
      const next = [...prev]; next[idx] = app; return next;
    });
  }
  function vote(appId, choice) {
    setCommunity(prev => prev.map(a => {
      if (a.id !== appId) return a;
      const votes = { ...(a.votes || {}) };
      if (votes[currentUser.id] === choice) delete votes[currentUser.id];
      else votes[currentUser.id] = choice;
      return { ...a, votes };
    }));
  }

  const yearOf = (iso) => { const d = iso ? new Date(iso) : null; return d && !isNaN(d) ? String(d.getFullYear()) : ""; };
  const filterDefs = [
    { key: "kind", label: "Type", get: a => a.kind },
    { key: "issues", label: "Issues", get: a => a.issues || [] },
    { key: "markets", label: "Markets", get: a => a.markets || [] },
    { key: "regions", label: "Regions", get: a => a.regions || [] },
    { key: "stage", label: "Status", get: a => a.stage || "Idea" },
    { key: "year", label: "Year created", get: a => yearOf(a.createdAt) }
  ];
  const sortFields = [
    { key: "name", label: "Name", get: a => a.name },
    { key: "stage", label: "Status", get: a => a.stage || "" },
    { key: "_updated", label: "Last updated", get: a => a.updatedAt || a.createdAt || "" },
    { key: "_created", label: "Date added", get: a => a.createdAt || "" }
  ];
  const cols = [
    { key: "name", label: "Engagement", w: "minmax(200px,2fr)", render: a => a.name },
    { key: "kind", label: "Type", w: "minmax(140px,1.2fr)", render: a => a.kind },
    { key: "recipient", label: "Recipient", w: "minmax(150px,1.3fr)", render: a => a.recipient || "-" },
    { key: "amount", label: "Amount", w: "110px", render: a => window.communityEntryAmount ? window.communityEntryAmount(a) : "" },
    { key: "stage", label: "Status", w: "120px", render: a => <span className="comm-stage-text" style={{ color: (STAGE_COLORS[a.stage] || {}).fg || "var(--ink-2)" }}>{a.stage}</span> },
    { key: "markets", label: "Markets", w: "minmax(110px,1fr)", render: a => (a.markets || []).join(", ") || "-" },
    { key: "regions", label: "Regions", w: "minmax(110px,1fr)", render: a => (a.regions || []).join(", ") || "-" },
    { key: "site", label: "Site", w: "minmax(120px,1fr)", render: a => a.site && window.STAKEHOLDER_DATA.SITES ? (window.STAKEHOLDER_DATA.siteLabel(window.STAKEHOLDER_DATA.SITES.find(s => s.id === a.site) || {}) || "-") : "-" }
  ];

  const rollupSlot = (
    <div className="comm-rollup-inline">
      <span><span className="comm-rollup-lbl">Requested</span> {moneyK(rollup.requested)}</span>
      <span><span className="comm-rollup-lbl">Annual</span> {moneyK(rollup.annual)}</span>
      <span><span className="comm-rollup-lbl">3YR Total</span> {moneyK(rollup.cumulative)}</span>
    </div>
  );
  const footerSlot = (
    <div className="sheet-footer comm-footer">
      <div className="group"><Icon name="community" /> <strong style={{ color: "var(--ink)" }}>{community.length}</strong> applications</div>
      <div className="group">·</div>
      <div className="group muted" style={{ flex: 1 }}>
        <strong style={{ color: "var(--ink-2)" }}>Value</strong> is the average of two inputs: how much the engagement improves your license to operate and how much the engagement strengthens relationships.
      </div>
    </div>
  );

  return (
    <>
      {viewApp && (
        <CommunityProfile
          app={viewApp}
          users={users}
          stakeholders={stakeholders}
          asPage
          onBack={() => setViewId(null)}
          onEdit={() => { setViewId(null); setEditId(viewApp.id); setEditViewFirst(false); }}
          onOpenStakeholder={(id) => { setViewId(null); setViewStakeholderId(id); }}
        />
      )}
      {!viewApp && !editing && !newOpen && (
      <LandingView
        items={community}
        searchKeys={["name", "recipient", "summary"]}
        filterDefs={filterDefs}
        sortFields={sortFields}
        cols={cols}
        renderCard={(app) => (
          <CommunityCard
            key={app.id}
            app={app}
            users={users}
            stakeholders={stakeholders}
            currentUser={currentUser}
            onOpen={() => setViewId(app.id)}
            onEdit={() => { setEditId(app.id); setEditViewFirst(false); }}
            onVote={(choice) => vote(app.id, choice)}
          />
        )}
        onRowClick={(app) => setViewId(app.id)}
        onNew={() => setNewOpen(true)}
        newLabel="New application"
        emptyText="No applications yet. Create one to begin."
        headerSlot={null}
        footerSlot={footerSlot}
        explainerSlot={explainerSlot}
        toolbarRight={rollupSlot}
      />
      )}
      {(newOpen || editing) && (
        <CommunityModal
          existing={editing}
          users={users}
          stakeholders={stakeholders}
          currentUser={currentUser}
          companyIssues={companyIssues}
          initialView={editViewFirst}
          asPage
          onOpenStakeholder={(id) => { setEditId(null); setViewStakeholderId(id); }}
          onCancel={() => { setNewOpen(false); setEditId(null); }}
          onSubmit={(app) => { upsert(app); setNewOpen(false); setEditId(null); }}
        />
      )}

      {viewStakeholder && (
        <StakeholderProfile
          stakeholder={viewStakeholder}
          users={users}
          stakeholders={stakeholders}
          community={community}
          scores={scores}
          team={team}
          getWorkspacesForStakeholder={getWorkspacesForStakeholder}
          updateCommunityApp={(app) => upsert(app)}
          currentUser={currentUser}
          companyIssues={companyIssues}
          onClose={() => setViewStakeholderId(null)}
        />
      )}
    </>
  );
}

function CommunityCard({ app, users, stakeholders, currentUser, onOpen, onEdit, onVote }) {
  const votes = app.votes || {};
  const counts = { for: 0, against: 0, abstain: 0 };
  Object.values(votes).forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  const myVote = votes[currentUser.id];
  const linked = (app.linkedStakeholders || []).map(id => stakeholders.find(s => s.id === id)).filter(Boolean);
  const vs = valueScore(app);

  return (
    <div className="comm-card">
      <div className="comm-card-head">
        <div style={{ minWidth: 0 }}>
          <div className="comm-card-name" onClick={onOpen} title="Open application">{app.name}</div>
          <div className="comm-card-recipient muted">{app.recipient}</div>
        </div>
        <OwnersDisplay users={users} owners={app.owners || []} size={24} />
      </div>

      <div className="comm-card-badges">
        <KindBadge kind={app.kind} />
        {app.kind === "Corporate Giving" && app.givingMode && (
          <span className="tag" style={{ background: "var(--bg-2)", color: "var(--ink-2)" }}>{app.givingMode}</span>
        )}
        <span className="spacer" style={{ flex: 1 }} />
        <span className="comm-stage-text" style={{ color: (STAGE_COLORS[app.stage] || {}).fg || "var(--ink-2)" }}>{app.stage}</span>
      </div>

      <p className="comm-card-summary">{app.summary}</p>

      <div className="comm-card-meta">
        <div className="comm-meta-row">
          <span className="comm-meta-k">Ask</span>
          <span className="comm-meta-v">
            {app.unit === "USD" ? money(app.amount) : (app.amount + " " + (app.unit || ""))}
            <span className="muted"> · {app.recurrence}{app.years > 1 ? ` · ${app.years} yr` : ""}</span>
          </span>
        </div>
        <div className="comm-meta-row">
          <span className="comm-meta-k">Approved</span>
          {(() => {
            const al = approvedLabel(app);
            const color = al.tone === "pos" ? "var(--pos)" : al.tone === "neg" ? "var(--neg)" : "var(--ink-3)";
            return <span className="comm-meta-v" style={{ color }}>{al.text}</span>;
          })()}
        </div>
        <div className="comm-meta-row">
          <span className="comm-meta-k">Value</span>
          <span className="comm-meta-v">
            <span className="comm-value-bar"><span style={{ width: (vs * 10) + "%" }} /></span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, marginLeft: 6 }}>{vs.toFixed(1)}</span>
          </span>
        </div>
      </div>

      {(app.issues || []).length > 0 && (
        <div className="comm-card-linked">
          <span className="comm-meta-k">Issues</span>
          <span className="comm-card-issues"><Tags values={app.issues} /></span>
        </div>
      )}

      {linked.length > 0 && (
        <div className="comm-card-linked">
          <span className="comm-meta-k">Engaged</span>
          <span className="comm-linked-names">{linked.map(s => window.displayName(s) || s.name).join(", ")}</span>
        </div>
      )}

      <div className="comm-card-meta plan-meta-nobottom">
        {(app.markets || []).length > 0 && (
          <div className="comm-meta-row">
            <span className="comm-meta-k">Markets</span>
            <span className="comm-meta-v">{app.markets.join(", ")}</span>
          </div>
        )}
        {(app.regions || []).length > 0 && (
          <div className="comm-meta-row">
            <span className="comm-meta-k">Regions</span>
            <span className="comm-meta-v">{app.regions.join(", ")}</span>
          </div>
        )}
        {app.site && window.STAKEHOLDER_DATA.SITES && (
          <div className="comm-meta-row">
            <span className="comm-meta-k">Site</span>
            <span className="comm-meta-v">{window.STAKEHOLDER_DATA.siteLabel(window.STAKEHOLDER_DATA.SITES.find(s => s.id === app.site) || {}) || "-"}</span>
          </div>
        )}
      </div>

      <div className="comm-card-foot">
        <div className="comm-vote">
          <button className={"comm-vote-btn for" + (myVote === "for" ? " on" : "")} onClick={() => onVote("for")} title="Align / support">
            <span className="comm-vote-n">{counts.for}</span> <Icon name="chevronUp" className="ico" />
          </button>
          <button className={"comm-vote-btn against" + (myVote === "against" ? " on" : "")} onClick={() => onVote("against")} title="Object">
            <span className="comm-vote-n">{counts.against}</span> <Icon name="chevron" className="ico" />
          </button>
        </div>
        <div className="spacer" style={{ flex: 1 }} />
        <span className="plan-card-actions">
          <button className="explainer-link" onClick={(e) => { e.stopPropagation(); onOpen(); }}>Review</button>
          <button className="explainer-link" onClick={(e) => { e.stopPropagation(); onEdit(); }}>Edit</button>
        </span>
      </div>
    </div>
  );
}

Object.assign(window, { CommunityView, communityValueScore: valueScore });

// ── Affiliation helpers (shared with the List / stakeholder profile) ────
// An application is affiliated with a stakeholder if it targets them
// (representedStakeholderId) or links them (linkedStakeholders).
function affiliatedCommunity(stakeholderId, community) {
  if (!stakeholderId || !Array.isArray(community)) return [];
  return community.filter(a =>
    a.representedStakeholderId === stakeholderId ||
    (a.linkedStakeholders || []).includes(stakeholderId)
  );
}
// Cumulative committed USD across a stakeholder's affiliated, decided entries.
function stakeholderCumulativeUSD(stakeholderId, community) {
  return affiliatedCommunity(stakeholderId, community).reduce((sum, a) => {
    const appr = Number(a.approvedAmount) || 0;
    return sum + (isDecided(a.stage) && appr > 0 ? appr : 0);
  }, 0);
}

// ── CommunityProfile - read-only "completed" application card ───────────
function CommunityProfile({ app, users, stakeholders, onClose, onBack, onOpenStakeholder, onEdit, asPage }) {
  if (!app) return null;
  const vs = window.communityValueScore(app);
  const al = approvedLabel(app);
  const alColor = al.tone === "pos" ? "var(--pos)" : al.tone === "neg" ? "var(--neg)" : "var(--ink-3)";
  const linked = (app.linkedStakeholders || []).map(id => stakeholders.find(s => s.id === id)).filter(Boolean);
  const target = stakeholders.find(s => s.id === app.representedStakeholderId);
  const submitter = users.find(u => u.id === app.submitter);
  const Row = ({ k, children }) => (
    <div className="detail-row"><div className="k">{k}</div><div className="v">{children}</div></div>
  );
  const content = (
    <>
          <div className="comm-card-badges" style={{ marginBottom: 4 }}>
            <KindBadge kind={app.kind} />
            {app.kind === "Corporate Giving" && app.givingMode && <span className="tag" style={{ background: "var(--bg-2)", color: "var(--ink-2)" }}>{app.givingMode}</span>}
            <span className="spacer" style={{ flex: 1 }} />
            <span className="comm-stage-text" style={{ color: (STAGE_COLORS[app.stage] || {}).fg || "var(--ink-2)" }}>{app.stage}</span>
          </div>
          {app.summary && <p className="comm-card-summary">{app.summary}</p>}

          <div className="cm-section-label">Overview</div>
          <Row k="Recipient">{app.recipient || "-"}</Row>
          {target && <Row k="Targets"><StakeholderPills list={[target]} onOpen={onOpenStakeholder} /></Row>}
          <Row k="Submitter">{submitter ? submitter.name : "-"}{app.submitterRole ? ` · ${app.submitterRole}` : ""}</Row>
          <Row k="Submitted">{app.dateSubmitted || "-"}</Row>

          <div className="cm-section-label">The ask</div>
          <Row k="Support">{app.askType}</Row>
          <Row k="Amount">{app.unit === "USD" ? money(app.amount) : (app.amount + " " + (app.unit || ""))}<span className="muted"> · {app.recurrence}{app.years > 1 ? ` · ${app.years} yr` : ""}</span></Row>
          <Row k="Approved"><span style={{ color: alColor }}>{al.text}</span></Row>
          <Row k="Timeline">{app.timeline || "-"}{app.decisionDeadline ? ` · decide by ${app.decisionDeadline}` : ""}</Row>

          {app.description && (<><div className="cm-section-label">Description</div><p className="comm-card-summary">{app.description}</p></>)}
          {app.rationale && (<><div className="cm-section-label">Why this, why now</div><p className="comm-card-summary">{app.rationale}</p></>)}

          <div className="cm-section-label">Alignment</div>
          <div className="cm-valuescore"><span className="comm-meta-k">Value</span><span className="comm-value-bar" style={{ flex: 1 }}><span style={{ width: (vs * 10) + "%" }} /></span><span style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{vs.toFixed(1)} / 10</span></div>
          {(app.issues || []).length > 0 && <Row k="Issues"><span style={{ display: "inline-flex", flexWrap: "wrap", gap: 3 }}><Tags values={app.issues} /></span></Row>}
          {(app.markets || []).length > 0 && <Row k="Markets">{app.markets.join(", ")}</Row>}
          {(app.regions || []).length > 0 && <Row k="Regions">{app.regions.join(", ")}</Row>}
          {linked.length > 0 && <Row k="Stakeholders"><StakeholderPills list={linked} onOpen={onOpenStakeholder} /></Row>}

          <div className="cm-section-label">Budget</div>
          <Row k="Total cost">{money(app.budget && app.budget.total)}</Row>
          <Row k="Requested">{money(app.budget && app.budget.requested)}</Row>
          {app.budget && app.budget.otherFunding ? <Row k="Other funding">{money(app.budget.otherFunding)}</Row> : null}
          {app.budget && app.budget.inKind ? <Row k="In-kind">{app.budget.inKind}</Row> : null}

          <div className="cm-section-label">Owners</div>
          <OwnersDisplay users={users} owners={app.owners || []} size={24} />
    </>
  );
  if (asPage) {
    return (
      <div className="sheet-wrap">
        <div className="sheet-toolbar">
          <button className="btn btn-ghost" onClick={onBack} title="All engagements"><Icon name="chevron-left" /> Community</button>
          <span style={{ fontWeight: 500 }}>{app.name}</span>
          <div className="spacer" style={{ flex: 1 }} />
          {onEdit && <button className="btn btn-primary" onClick={onEdit}><Icon name="edit" /> Edit engagement</button>}
        </div>
        <div className="plan-review-body">
          <div className="plan-review-doc">{content}</div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="modal-veil show" onClick={onClose} />
      <div className="modal community-modal profile-modal">
        <div className="modal-head">
          <div className="row" style={{ gap: 10, minWidth: 0 }}>
            {onBack && <button className="btn btn-ghost" onClick={onBack} title="Back"><Icon name="chevron-left" /></button>}
            <h2 style={{ margin: 0 }}>{app.name}</h2>
          </div>
          <div className="row" style={{ gap: 10 }}>
            {onEdit && <button className="explainer-link" onClick={onEdit}>Edit application</button>}
            <button className="btn btn-ghost" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
          </div>
        </div>
        <div className="modal-body">{content}</div>
      </div>
    </>
  );
}

// Compact amount text for an entry, consistent with the card's Approved field.
// USD entries use the shared approvedLabel (TBD / Declined / No Expense / $);
// non-USD (e.g. volunteer hours) show the ask amount + unit.
function communityEntryAmount(a) {
  if (a.unit === "USD") return approvedLabel(a).text;
  if (a.amount) return a.amount + " " + (a.unit || "");
  return "-";
}

Object.assign(window, { affiliatedCommunity, stakeholderCumulativeUSD, CommunityProfile, communityApprovedLabel: approvedLabel, communityEntryAmount });

// Clickable stakeholder pills (the bridge from a community entry back to a
// stakeholder profile). Falls back to plain pills when no handler is given.
function StakeholderPills({ list, onOpen }) {
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 4 }}>
      {list.map(s => (
        <span key={s.id}
              className={"tag" + (onOpen ? " tag-clickable" : "")}
              onClick={onOpen ? () => onOpen(s.id) : undefined}>
          {window.displayName(s) || s.name}
        </span>
      ))}
    </span>
  );
}
