// community.jsx - Community & Foundation applications.
// Value-driven engagements (philanthropy, volunteerism, corporate giving,
// political action, sustainability) that the team creates, reviews, votes on,
// and aligns to stakeholders, markets, regions, and issues.
//
// Reuses: Icon, Tags, Avatar, OwnersDisplay, MultiOwnerPicker, StakeholderPicker,
// designed-select chrome, modal patterns, and the Store (entity "community").

import { useState, useRef, useEffect, useMemo } from 'react';
import { STAKEHOLDER_DATA } from './data';
import { displayName, formatDateLong, Icon, Tags, StatusPill } from './components';
import { uid, cmdKeyLabel } from './store';
import { Avatar, OwnersDisplay, MultiOwnerPicker } from './users';
import { IssueSelector } from './sheet-modals';
import { RecordShell, MetaField } from './record';
import { CommunityModal } from './community-modal';
import { LandingView } from './landing';
import { StakeholderProfile } from './profiles';

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

export function CommunityView({
  explainerSlot,
  addNonce, addNonceFor,
  community, setCommunity, appConfig, stakeholders, users, currentUser, companyIssues, workspaceLabel, isMaster,
  scores, team, getWorkspacesForStakeholder
}) {
  const D = STAKEHOLDER_DATA;
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
    { key: "amount", label: "Amount", w: "110px", render: a => communityEntryAmount(a) },
    { key: "stage", label: "Status", w: "120px", render: a => <span className="comm-stage-text" style={{ color: (STAGE_COLORS[a.stage] || {}).fg || "var(--ink-2)" }}>{a.stage}</span> },
    { key: "markets", label: "Markets", w: "minmax(110px,1fr)", render: a => (a.markets || []).join(", ") || "-" },
    { key: "regions", label: "Regions", w: "minmax(110px,1fr)", render: a => (a.regions || []).join(", ") || "-" },
    { key: "site", label: "Site", w: "minmax(120px,1fr)", render: a => a.site && STAKEHOLDER_DATA.SITES ? (STAKEHOLDER_DATA.siteLabel(STAKEHOLDER_DATA.SITES.find(s => s.id === a.site) || {}) || "-") : "-" }
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
        <CommunityRecord
          app={viewApp}
          users={users}
          stakeholders={stakeholders}
          companyIssues={companyIssues}
          currentUser={currentUser}
          startEditing={editViewFirst}
          onBack={() => { setViewId(null); setEditViewFirst(false); }}
          onSave={(app) => upsert(app)}
          onOpenStakeholder={(id) => setViewStakeholderId(id)}
        />
      )}
      {!viewApp && !newOpen && (
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
            onOpen={() => { setViewId(app.id); setEditViewFirst(false); }}
            onEdit={() => { setViewId(app.id); setEditViewFirst(true); }}
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
      {newOpen && (
        <CommunityModal
          existing={null}
          users={users}
          stakeholders={stakeholders}
          currentUser={currentUser}
          companyIssues={companyIssues}
          asPage
          onOpenStakeholder={(id) => setViewStakeholderId(id)}
          onCancel={() => setNewOpen(false)}
          onSubmit={(app) => { upsert(app); setNewOpen(false); }}
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
          <span className="comm-linked-names">{linked.map(s => displayName(s) || s.name).join(", ")}</span>
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
        {app.site && STAKEHOLDER_DATA.SITES && (
          <div className="comm-meta-row">
            <span className="comm-meta-k">Site</span>
            <span className="comm-meta-v">{STAKEHOLDER_DATA.siteLabel(STAKEHOLDER_DATA.SITES.find(s => s.id === app.site) || {}) || "-"}</span>
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

// ── Affiliation helpers (shared with the List / stakeholder profile) ────
// An application is affiliated with a stakeholder if it targets them
// (representedStakeholderId) or links them (linkedStakeholders).
export function affiliatedCommunity(stakeholderId, community) {
  if (!stakeholderId || !Array.isArray(community)) return [];
  return community.filter(a =>
    a.representedStakeholderId === stakeholderId ||
    (a.linkedStakeholders || []).includes(stakeholderId)
  );
}
// Cumulative committed USD across a stakeholder's affiliated, decided entries.
export function stakeholderCumulativeUSD(stakeholderId, community) {
  return affiliatedCommunity(stakeholderId, community).reduce((sum, a) => {
    const appr = Number(a.approvedAmount) || 0;
    return sum + (isDecided(a.stage) && appr > 0 ? appr : 0);
  }, 0);
}

// ── CommunityProfile - read-only "completed" application card ───────────
export function CommunityProfile({ app, users, stakeholders, onClose, onBack, onOpenStakeholder, onEdit, asPage }) {
  if (!app) return null;
  const vs = valueScore(app);
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
export function communityEntryAmount(a) {
  if (a.unit === "USD") return approvedLabel(a).text;
  if (a.amount) return a.amount + " " + (a.unit || "");
  return "-";
}

// Clickable stakeholder pills (the bridge from a community entry back to a
// stakeholder profile). Falls back to plain pills when no handler is given.
function StakeholderPills({ list, onOpen }) {
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 4 }}>
      {list.map(s => (
        <span key={s.id}
              className={"tag" + (onOpen ? " tag-clickable" : "")}
              onClick={onOpen ? () => onOpen(s.id) : undefined}>
          {displayName(s) || s.name}
        </span>
      ))}
    </span>
  );
}

export const communityValueScore = valueScore;
export const communityApprovedLabel = approvedLabel;

// ── CommunityRecord — full-page read+edit record on the RecordShell ──────
export function CommunityRecord({
  app, users, stakeholders, companyIssues, currentUser,
  onBack, onSave, onOpenStakeholder, startEditing
}) {
  const D = STAKEHOLDER_DATA;
  const [editing, setEditing] = useState(!!startEditing);
  const [draft, setDraft] = useState(app);
  useEffect(() => { setDraft(app); setEditing(!!startEditing); }, [app && app.id]);
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const setBudget = (k, v) => setDraft(d => ({ ...d, budget: { ...(d.budget || {}), [k]: v } }));
  const setRisk = (k, v) => setDraft(d => ({ ...d, risk: { ...(d.risk || {}), [k]: v } }));

  const vs = valueScore(draft);
  const al = approvedLabel(draft);
  const alColor = al.tone === "pos" ? "var(--pos)" : al.tone === "neg" ? "var(--neg)" : "var(--ink-3)";
  const linked = (draft.linkedStakeholders || []).map(id => stakeholders.find(s => s.id === id)).filter(Boolean);
  const target = stakeholders.find(s => s.id === draft.representedStakeholderId);
  const submitter = users.find(u => u.id === draft.submitter);
  const decided = ["Approved", "Active", "Complete"].includes(draft.stage);
  const teamUsers = users.filter(u => u.role !== "system");

  // Validation mirrors CommunityModal.missing.
  const missing = [];
  if (!(draft.name || "").trim()) missing.push("Project name");
  if (!(draft.summary || "").trim()) missing.push("Summary");
  if (!(draft.recipient || "").trim()) missing.push("Recipient");
  if (!(draft.description || "").trim()) missing.push("Description");
  if (!(draft.rationale || "").trim()) missing.push("Rationale");
  if (!draft.submitter) missing.push("Submitter");
  if (!draft.dateSubmitted) missing.push("Date submitted");
  if (!(draft.timeline || "").trim()) missing.push("Timeline");
  if (!(Number(draft.amount) > 0)) missing.push("Amount");
  if (!(Number(draft.years) >= 1)) missing.push("Years");
  if (!(draft.markets || []).length) missing.push("Markets");
  if (!(draft.regions || []).length) missing.push("Regions");
  if (!(draft.issues || []).length) missing.push("Issues");
  if (!(draft.linkedStakeholders || []).length) missing.push("Connected stakeholders");
  if (!(draft.owners || []).length) missing.push("Owners");
  if (!(Number(draft.budget && draft.budget.total) > 0)) missing.push("Total project cost");
  if (draft.kind === "Corporate Giving" && !draft.givingMode) missing.push("Giving mode");
  if (draft.risk && draft.risk.conflictOfInterest && !(draft.risk.conflictDetail || "").trim()) missing.push("Conflict description");
  if (!(draft.risk && draft.risk.attestation)) missing.push("Attestation");
  const valid = missing.length === 0;

  function save() {
    if (!valid) return;
    onSave({ ...draft, updatedAt: nowStampLocal() });
    setEditing(false);
  }
  function cancel() { setDraft(app); setEditing(false); }

  // Inline edit helpers.
  const Sel = ({ label, k, options, placeholder, onChange, render }) => (
    <label className="mf"><span className="mf-label">{label}</span>
      {!editing ? <span className="mf-value">{draft[k] ? (render ? render(draft[k]) : draft[k]) : <span className="mf-empty">—</span>}</span> : (
        <span className="designed-select mf-input">
          <select value={draft[k] || ""} onChange={e => (onChange ? onChange(e.target.value) : set(k, e.target.value))}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(o => <option key={o} value={o}>{render ? render(o) : o}</option>)}
          </select>
        </span>
      )}
    </label>
  );
  const Num = ({ label, value, onChange, prefix }) => (
    <label className="mf"><span className="mf-label">{label}</span>
      {!editing ? <span className="mf-value">{value || value === 0 ? (prefix === "$" ? money(value) : value) : <span className="mf-empty">—</span>}</span>
        : <input className="mf-input" type="number" value={value ?? ""} onChange={e => onChange(e.target.value)} />}
    </label>
  );
  const Chips = ({ label, k, options }) => (
    <label className="mf"><span className="mf-label">{label}</span>
      {!editing ? <span className="mf-value">{(draft[k] || []).length ? draft[k].join(", ") : <span className="mf-empty">—</span>}</span> : (
        <div className="filter-chips" style={{ paddingTop: 2 }}>
          {options.map(o => {
            const on = (draft[k] || []).includes(o);
            return <button key={o} type="button" className={"filter-chip" + (on ? " on" : "")} onClick={() => set(k, on ? draft[k].filter(x => x !== o) : [...(draft[k] || []), o])}>{o}</button>;
          })}
        </div>
      )}
    </label>
  );
  const Score = ({ label, k }) => (
    <label className="mf"><span className="mf-label">{label}</span>
      {!editing ? <span className="mf-value" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{(draft[k] ?? 5)} / 10</span>
        : <span style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 2 }}>
            <input type="range" min={0} max={10} step={1} value={draft[k] ?? 5} onChange={e => set(k, Number(e.target.value))} style={{ flex: 1 }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, minWidth: 16 }}>{draft[k] ?? 5}</span>
          </span>}
    </label>
  );

  const regionOpts = [...new Set((draft.markets || []).flatMap(m => D.MARKETS[m] || []))];

  const sections = [
    {
      id: "overview", label: "Overview", icon: "community",
      render: () => (
        <div className="record-fields">
          <MetaField label="Project name" value={draft.name} editing={editing} onChange={v => set("name", v)} />
          <Sel label="Engagement type" k="kind" options={D.COMMUNITY_KINDS || []} />
          {draft.kind === "Corporate Giving" && <Sel label="Giving mode" k="givingMode" placeholder="Select…" options={D.GIVING_MODES || []} />}
          <Sel label="Stage" k="stage" options={D.COMMUNITY_STAGES || []} />
          <MetaField label="One-line summary" value={draft.summary} editing={editing} type="long" onChange={v => set("summary", v)} />
          <MetaField label="Recipient organization or cause" value={draft.recipient} editing={editing} onChange={v => set("recipient", v)} />
          <Sel label="Targeted stakeholder" k="representedStakeholderId" placeholder="None"
            options={stakeholders.map(s => s.id)} render={id => { const s = stakeholders.find(x => x.id === id); return s ? (displayName(s) || s.name) : id; }} />
        </div>
      )
    },
    {
      id: "ask", label: "The Ask", icon: "cases",
      render: () => (
        <div className="record-fields">
          <Sel label="Support requested" k="askType" options={D.ASK_TYPES || []} />
          {Num({ label: "Amount", value: draft.amount, onChange: v => set("amount", v) })}
          <Sel label="Unit" k="unit" options={["USD", "hours", "n/a"]} />
          <Sel label="Recurrence" k="recurrence" options={D.RECURRENCE || []} />
          {Num({ label: "Years", value: draft.years, onChange: v => set("years", v) })}
          <MetaField label="Timeline" value={draft.timeline} editing={editing} onChange={v => set("timeline", v)} />
          <MetaField label="Decision deadline" value={editing ? (draft.decisionDeadline || "") : (draft.decisionDeadline || "")} editing={editing} type="date" onChange={v => set("decisionDeadline", v)} />
          <Sel label="Submitter" k="submitter" placeholder="Select…"
            options={teamUsers.map(u => u.id)} render={id => { const u = users.find(x => x.id === id); return u ? u.name : id; }}
            onChange={v => { const u = users.find(x => x.id === v); setDraft(d => ({ ...d, submitter: v, submitterRole: d.submitterRole || (u ? u.title : "") })); }} />
          <MetaField label="Submitter role" value={draft.submitterRole} editing={editing} onChange={v => set("submitterRole", v)} />
          <MetaField label="Date submitted" value={editing ? (draft.dateSubmitted || "") : (draft.dateSubmitted || "")} editing={editing} type="date" onChange={v => set("dateSubmitted", v)} />
        </div>
      )
    },
    {
      id: "narrative", label: "Narrative", icon: "description",
      render: () => (
        <div className="record-fields">
          <MetaField label="Description" value={draft.description} editing={editing} type="long" onChange={v => set("description", v)} />
          <MetaField label="Why this, why now" value={draft.rationale} editing={editing} type="long" onChange={v => set("rationale", v)} />
        </div>
      )
    },
    {
      id: "alignment", label: "Alignment", icon: "beenhere",
      render: () => (
        <div className="record-fields">
          {!editing && (
            <div className="cm-valuescore"><span className="comm-meta-k">Value</span><span className="comm-value-bar" style={{ flex: 1 }}><span style={{ width: (vs * 10) + "%" }} /></span><span style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{vs.toFixed(1)} / 10</span></div>
          )}
          {Score({ label: "Improves license to operate", k: "licenseToOperate" })}
          {Score({ label: "Strengthens relationships", k: "relationshipImpact" })}
          <label className="mf"><span className="mf-label">Issues</span>
            <div style={{ paddingTop: 2 }}>
              {editing ? <IssueSelector selected={draft.issues || []} companyIssues={companyIssues || []} onChange={v => set("issues", v)} />
                : ((draft.issues || []).length ? <Tags values={draft.issues} /> : <span className="mf-empty">—</span>)}
            </div>
          </label>
          <Chips label="Markets" k="markets" options={Object.keys(D.MARKETS)} />
          <Chips label="Regions" k="regions" options={regionOpts} />
          <Sel label="Site" k="site" placeholder="None" options={(D.SITES || []).map(x => x.id)} render={id => { const x = (D.SITES || []).find(y => y.id === id); return x ? D.siteLabel(x) : id; }}
            onChange={v => { const x = (D.SITES || []).find(y => y.id === v); setDraft(d => ({ ...d, site: v, state: x && x.state ? x.state : d.state })); }} />
          <Sel label="State" k="state" placeholder="None" options={D.US_STATES || []} render={st => D.STATE_ABBR[st] || st} />
          <Sel label="Geography" k="geography" placeholder="Select…" options={D.GEOGRAPHIES || []} />
          <label className="mf"><span className="mf-label">Connected stakeholders</span>
            <div style={{ paddingTop: 2 }}>
              <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 4, marginBottom: editing ? 6 : 0 }}>
                {linked.length ? linked.map(s => (
                  <span key={s.id} className={"tag" + (onOpenStakeholder && !editing ? " tag-clickable" : "")} onClick={onOpenStakeholder && !editing ? () => onOpenStakeholder(s.id) : undefined}>
                    {displayName(s) || s.name}
                    {editing && <span className="lead-x" style={{ marginLeft: 4, cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); set("linkedStakeholders", (draft.linkedStakeholders || []).filter(id => id !== s.id)); }}>×</span>}
                  </span>
                )) : (!editing && <span className="mf-empty">—</span>)}
              </span>
              {editing && (
                <span className="designed-select mf-input">
                  <select value="" onChange={e => { const id = e.target.value; if (id && !(draft.linkedStakeholders || []).includes(id)) set("linkedStakeholders", [...(draft.linkedStakeholders || []), id]); }}>
                    <option value="">Add stakeholder…</option>
                    {stakeholders.filter(s => !(draft.linkedStakeholders || []).includes(s.id)).map(s => <option key={s.id} value={s.id}>{displayName(s) || s.name}</option>)}
                  </select>
                </span>
              )}
            </div>
          </label>
        </div>
      )
    },
    {
      id: "budget", label: "Budget", icon: "sliders",
      render: () => (
        <div className="record-fields">
          {Num({ label: "Total project cost", value: draft.budget && draft.budget.total, onChange: v => setBudget("total", v), prefix: "$" })}
          {Num({ label: "Requested amount", value: draft.budget && draft.budget.requested, onChange: v => setBudget("requested", v), prefix: "$" })}
          {Num({ label: "Approved amount", value: draft.approvedAmount, onChange: v => set("approvedAmount", v), prefix: "$" })}
          {decided && <MetaField label="Date approved" value={editing ? (draft.dateApproved || "") : (draft.dateApproved || "")} editing={editing} type="date" onChange={v => set("dateApproved", v)} />}
          {Num({ label: "Other funding / partners", value: draft.budget && draft.budget.otherFunding, onChange: v => setBudget("otherFunding", v), prefix: "$" })}
          <MetaField label="In-kind contributions" value={draft.budget && draft.budget.inKind} editing={editing} onChange={v => setBudget("inKind", v)} />
        </div>
      )
    },
    {
      id: "risk", label: "Risk & Owners", icon: "lock",
      render: () => (
        <div className="record-fields">
          <MetaField label="Reputational / political risk" value={draft.risk && draft.risk.reputational} editing={editing} type="long" onChange={v => setRisk("reputational", v)} />
          <MetaField label="Legal & disclosure considerations" value={draft.risk && draft.risk.legal} editing={editing} type="long" onChange={v => setRisk("legal", v)} />
          <label className="mf" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <input type="checkbox" disabled={!editing} checked={!!(draft.risk && draft.risk.conflictOfInterest)} onChange={e => setRisk("conflictOfInterest", e.target.checked)} />
            <span className="mf-label" style={{ margin: 0 }}>Conflict of interest disclosed</span>
          </label>
          {draft.risk && draft.risk.conflictOfInterest && (
            <MetaField label="Describe the conflict" value={draft.risk.conflictDetail} editing={editing} type="long" onChange={v => setRisk("conflictDetail", v)} />
          )}
          <label className="mf" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <input type="checkbox" disabled={!editing} checked={!!(draft.risk && draft.risk.attestation)} onChange={e => setRisk("attestation", e.target.checked)} />
            <span className="mf-label" style={{ margin: 0 }}>I attest this information is accurate</span>
          </label>
          <label className="mf"><span className="mf-label">Owners</span>
            <div style={{ paddingTop: 2 }}>
              {editing ? <MultiOwnerPicker users={users} owners={draft.owners || []} onChange={v => set("owners", v)} size={26} />
                : ((draft.owners || []).length ? <OwnersDisplay users={users} owners={draft.owners} size={24} /> : <span className="mf-empty">—</span>)}
            </div>
          </label>
        </div>
      )
    }
  ];

  const rightRail = (
    <div className="record-rail-inner">
      <div className="record-rail-sec">
        <div className="mf"><span className="mf-label">Type</span><span className="mf-value"><KindBadge kind={draft.kind} /></span></div>
        <div className="mf"><span className="mf-label">Stage</span><span className="mf-value comm-stage-text" style={{ color: (STAGE_COLORS[draft.stage] || {}).fg || "var(--ink-2)" }}>{draft.stage}</span></div>
        <div className="mf"><span className="mf-label">Value</span><span className="mf-value" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{vs.toFixed(1)} / 10</span></div>
        <div className="mf"><span className="mf-label">Approved</span><span className="mf-value" style={{ color: alColor }}>{al.text}</span></div>
      </div>
      <div className="record-rail-sec">
        <div className="mf"><span className="mf-label">Submitter</span><span className="mf-value">{submitter ? submitter.name : "-"}</span></div>
        <div className="mf"><span className="mf-label">Submitted</span><span className="mf-value">{draft.dateSubmitted ? formatDateLong(draft.dateSubmitted) : "-"}</span></div>
        <div className="mf"><span className="mf-label">Owners</span><span className="mf-value">{(draft.owners || []).length ? <OwnersDisplay users={users} owners={draft.owners} size={22} /> : "-"}</span></div>
      </div>
    </div>
  );

  return (
    <RecordShell
      backLabel="All engagements"
      onBack={onBack}
      title={draft.name}
      subtitle={draft.recipient}
      editing={editing}
      sections={sections}
      rightRail={rightRail}
      navTitle="Engagement"
      toolbar={
        <span className="scaffold-controls">
          {editing ? (
            <>
              <button className="btn" onClick={cancel}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={!valid}>Save changes</button>
              {!valid && <span className="modal-missing" title={missing.join(", ")}>{missing.length} left</span>}
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setEditing(true)}><Icon name="edit" /> Edit engagement</button>
          )}
        </span>
      }
    />
  );
}

function nowStampLocal() { return new Date().toISOString(); }
