// intel.jsx — Workspace Intelligence band. A separate section ABOVE the table,
// divided from it; the table component (.sheet-wrap) is untouched and renders
// below. Three view states via data-mode on the parent .intel-split:
//   split (default) · intel (band takes over) · table (band collapses to summary)
// All cards are computed from data already in the Store. No backend.

const { useState: useIntelState } = React;

function IntelPanel({
  mode, setMode, stakeholders, scores, team, community, plans, currentUser,
  isMaster, workspaceLabel, workspaceId, onAddStakeholder
}) {
  const D = window.STAKEHOLDER_DATA;
  const now = new Date();
  const COLD_DAYS = 90;

  // ── derive signals ──────────────────────────────────────────────────
  const daysSince = (d) => {
    if (!d) return Infinity;
    const t = new Date(/^\d{4}-\d{2}-\d{2}$/.test(d) ? d + "T00:00:00" : d);
    return isNaN(t) ? Infinity : Math.floor((now - t) / 86400000);
  };

  // Cold engagement — HIGH PRIORITY stakeholders only, no contact in 90d.
  const cold = stakeholders
    .filter(s => s.priority === "High" && daysSince(s.lastContact) >= COLD_DAYS)
    .sort((a, b) => daysSince(b.lastContact) - daysSince(a.lastContact));

  // Needs your score — current user hasn't scored this stakeholder.
  const needsScore = currentUser
    ? stakeholders.filter(s => !((scores[s.id] || {})[currentUser.id]))
    : [];

  // Relationship mix from the team-weighted map position.
  const POS = ["Cooperate","Collaborate","Valuable Relationship","High Value Relationship","Strategic Partner"];
  const NEG = ["Proactively Defend","Defend","Protect","Respond","Identify"];
  const mix = { positive: 0, winnable: 0, negative: 0 };
  stakeholders.forEach(s => {
    const wc = D.weightedCoord(s.id, scores || {}, team || []);
    const st = D.statusFor(wc.x, wc.y);
    if (POS.includes(st)) mix.positive++;
    else if (NEG.includes(st)) mix.negative++;
    else mix.winnable++;
  });

  // Community awaiting your vote (proposed / under review, you haven't voted).
  const awaitingVote = (community || []).filter(a =>
    ["Proposed", "Under Review"].includes(a.stage) &&
    currentUser && !((a.votes || {})[currentUser.id])
  );

  // Active plans in this workspace.
  const wsPlans = isMaster ? (plans || []) : (plans || []).filter(p => p.workspaceId === workspaceId);

  // Developments — recent notes captured against this workspace's stakeholders.
  const developments = [];
  stakeholders.forEach(s => {
    (s.notesHistory || []).forEach(n => {
      developments.push({ at: n.at, body: n.body, who: n.by, stakeholder: s });
    });
  });
  developments.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  const devLabel = (d) => {
    const nm = window.displayName ? (window.displayName(d.stakeholder) || d.stakeholder.name) : d.stakeholder.name;
    const txt = (d.body || "").slice(0, 40);
    return `${nm}: ${txt}${(d.body || "").length > 40 ? "…" : ""}`;
  };

  const summaryBits = [];
  if (cold.length) summaryBits.push(`${cold.length} high-priority going cold`);
  if (needsScore.length) summaryBits.push(`${needsScore.length} need your score`);
  if (awaitingVote.length) summaryBits.push(`${awaitingVote.length} awaiting your vote`);
  const summary = summaryBits.length ? summaryBits.join(" · ") : "All clear — nothing needs attention.";

  const nameOf = (s) => (window.displayName ? (window.displayName(s) || s.name) : s.name);

  return (
    <div className="intel-band">
      <div className="intel-head">
        <span className="intel-title">WorkHQ</span>
        {mode === "table" && <span className="intel-summary">{summary}</span>}
        <span className="intel-spacer" />
        <button className="intel-quick" onClick={onAddStakeholder} title="Add stakeholder">
          <Icon name="plus" /> Stakeholder
        </button>
        <span className="intel-modes" role="group" aria-label="Intelligence layout">
          <button className={"intel-mode" + (mode === "intel" ? " on" : "")} onClick={() => setMode("intel")} title="Expand intelligence"><Icon name="dashboard" /></button>
          <button className={"intel-mode" + (mode === "split" ? " on" : "")} onClick={() => setMode("split")} title="Split view"><Icon name="splitscreen" /></button>
          <button className={"intel-mode" + (mode === "table" ? " on" : "")} onClick={() => setMode("table")} title="Expand table"><Icon name="table_rows" /></button>
        </span>
      </div>

      {mode !== "table" && (
        <div className="intel-cards">
          <IntelCard
            tone="data"
            label="Alerts"
            wide
            names={developments.slice(0, mode === "intel" ? 12 : 5).map(devLabel)}
            more={developments.length - (mode === "intel" ? 12 : 5)}
            empty="No new developments"
          />
          <IntelCard
            tone="data"
            label="Need your score"
            wide
            names={needsScore.slice(0, mode === "intel" ? 12 : 5).map(nameOf)}
            more={needsScore.length - (mode === "intel" ? 12 : 5)}
            empty="You're caught up on scoring"
          />
          <IntelCard
            tone="data"
            label="Tasks"
            names={awaitingVote.slice(0, mode === "intel" ? 8 : 4).map(a => "Vote: " + a.name)}
            more={awaitingVote.length - (mode === "intel" ? 8 : 4)}
            empty="Nothing pending"
          />
        </div>
      )}
    </div>
  );
}

function IntelCard({ tone, label, value, sub, names, more, mix, stack, wide, empty }) {
  return (
    <div className={"intel-card tone-" + (tone || "calm") + (wide ? " intel-card-wide" : "")}>
      <div className="intel-card-label">{label}</div>
      {stack ? (
        <div className="intel-stack">
          {stack.map((row, i) => (
            <div key={i} className="intel-stack-row">
              <span className="intel-stack-v">{row.v}</span>
              <span className="intel-stack-k">{row.k}</span>
            </div>
          ))}
        </div>
      ) : mix ? (
        <div className="intel-mix">
          <span className="intel-mix-seg pos"><i style={{ background: "var(--pos)" }} />{mix.positive}</span>
          <span className="intel-mix-seg neu"><i style={{ background: "var(--neu)" }} />{mix.winnable}</span>
          <span className="intel-mix-seg neg"><i style={{ background: "var(--neg)" }} />{mix.negative}</span>
        </div>
      ) : (
        value !== undefined ? <div className="intel-card-value">{value}</div> : null
      )}
      {sub && <div className="intel-card-sub">{sub}</div>}
      {names && names.length > 0 ? (
        <div className="intel-card-names">
          {names.map((n, i) => <span key={i} className="intel-name">{n}</span>)}
          {more > 0 && <span className="intel-name more">+{more} more</span>}
        </div>
      ) : (empty && <div className="intel-card-empty">{empty}</div>)}
    </div>
  );
}

Object.assign(window, { IntelPanel });
