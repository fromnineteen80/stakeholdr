// community-modal.jsx - the full application card (create/edit) + the
// multi-stakeholder linker. Split out of community.jsx to keep files small.

import { useState, useRef, useEffect, useMemo } from 'react';
import { STAKEHOLDER_DATA } from './data';
import { displayName, Icon } from './components';
import { uid } from './store';
import { communityValueScore } from './community';

// StakeholderPicker - typeahead multi-select of stakeholders (mirrors the
// UserAutocomplete pattern but over the stakeholder list). Returns ids.
function StakeholderPicker({ stakeholders, selected, onChange, placeholder }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  useEffect(() => {
    function onDoc(e) { if (!wrapRef.current?.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const q = query.toLowerCase();
  const matches = stakeholders
    .filter(s => !selected.includes(s.id))
    .filter(s => !q || (displayName(s) || s.name || "").toLowerCase().includes(q) || (s.org || "").toLowerCase().includes(q))
    .slice(0, 8);
  const chosen = selected.map(id => stakeholders.find(s => s.id === id)).filter(Boolean);
  return (
    <div className="sh-picker" ref={wrapRef}>
      <div className="sh-picker-chips">
        {chosen.map(s => (
          <span key={s.id} className="tag" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }} onClick={() => onChange(selected.filter(x => x !== s.id))} title="Remove">
            {displayName(s) || s.name}
            <span style={{ marginLeft: 4, color: "var(--ink-mute)" }}>×</span>
          </span>
        ))}
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={chosen.length ? "" : (placeholder || "Link stakeholders…")}
        />
      </div>
      {open && matches.length > 0 && (
        <div className="sh-picker-menu">
          {matches.map(s => (
            <button key={s.id} type="button" className="sh-picker-row" onMouseDown={(e) => { e.preventDefault(); onChange([...selected, s.id]); setQuery(""); }}>
              <span style={{ fontWeight: 500, fontSize: 12.5 }}>{displayName(s) || s.name}</span>
              <span className="muted" style={{ fontSize: 11 }}>{s.org} · {s.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommunityModal({ existing, users, stakeholders, currentUser, companyIssues, onCancel, onSubmit, initialView, onOpenStakeholder, asPage }) {
  const D = STAKEHOLDER_DATA;
  const isEdit = !!existing;
  const [viewMode, setViewMode] = useState(!!initialView && isEdit);
  const blank = {
    id: uid("ca"),
    name: "", kind: "Philanthropy", stage: "Idea",
    summary: "", description: "", rationale: "",
    submitter: currentUser ? currentUser.id : "", submitterRole: currentUser ? currentUser.title : "",
    dateSubmitted: new Date().toISOString().slice(0, 10),
    representedStakeholderId: "",
    recipient: "",
    linkedStakeholders: [],
    markets: [], regions: [], issues: [],
    askType: "Funding", amount: 0, unit: "USD", recurrence: "One-time", years: 1,
    givingMode: "Monetary",
    timeline: "", decisionDeadline: "", dateApproved: "",
    budget: { total: 0, requested: 0, otherFunding: 0, inKind: "" },
    approvedAmount: 0,
    licenseToOperate: 5, relationshipImpact: 5,
    risk: { reputational: "", legal: "", conflictOfInterest: false, attestation: false },
    attachments: [],
    votes: {},
    owners: currentUser ? [currentUser.id] : [],
    createdBy: currentUser ? currentUser.id : "", createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10)
  };
  const [d, setD] = useState(() => existing ? JSON.parse(JSON.stringify(existing)) : blank);
  useEffect(() => { setD(existing ? JSON.parse(JSON.stringify(existing)) : blank); }, [existing && existing.id]);
  function set(k, v) { setD(p => ({ ...p, [k]: v })); }
  function setBudget(k, v) { setD(p => ({ ...p, budget: { ...p.budget, [k]: v } })); }
  function setRisk(k, v) { setD(p => ({ ...p, risk: { ...p.risk, [k]: v } })); }
  // Every meaningful field must be filled before an application can be saved.
  // (Conditional fields only required when their branch is active; attachments
  //  are genuinely optional.)
  const missing = [];
  if (!d.name.trim()) missing.push("Project name");
  if (!d.summary.trim()) missing.push("One-line summary");
  if (!d.recipient.trim()) missing.push("Recipient");
  if (!d.description.trim()) missing.push("Description");
  if (!d.rationale.trim()) missing.push("Why this, why now");
  if (!d.submitter) missing.push("Submitter");
  if (!d.dateSubmitted) missing.push("Date submitted");
  if (!d.timeline.trim()) missing.push("Timeline");
  if (!(Number(d.amount) > 0)) missing.push("Amount");
  if (!d.years || Number(d.years) < 1) missing.push("Years");
  if (!(d.markets && d.markets.length)) missing.push("Markets");
  if (!(d.regions && d.regions.length)) missing.push("Regions");
  if (!(d.issues && d.issues.length)) missing.push("Issues");
  if (!(d.linkedStakeholders && d.linkedStakeholders.length)) missing.push("Connected stakeholders");
  if (!(d.owners && d.owners.length)) missing.push("Owners");
  if (!(Number(d.budget.total) > 0)) missing.push("Total project cost");
  if (d.kind === "Corporate Giving" && !d.givingMode) missing.push("Giving mode");
  if (d.risk.conflictOfInterest && !(d.risk.conflictDetail || "").trim()) missing.push("Conflict description");
  if (!d.risk.attestation) missing.push("Attestation");
  const valid = missing.length === 0;

  const vs = communityValueScore(d);

  // Read-only completed view (mirrors the stakeholder card view↔edit toggle).
  if (viewMode && isEdit) {
    return (
      <CommunityProfile
        app={existing}
        users={users}
        stakeholders={stakeholders}
        asPage={asPage}
        onBack={onCancel}
        onClose={onCancel}
        onEdit={() => setViewMode(false)}
        onOpenStakeholder={onOpenStakeholder}
      />
    );
  }

  return (
    <>
      {!asPage && <div className="modal-veil show" onClick={onCancel} />}
      <div className={asPage ? "sheet-wrap community-edit-page" : "modal community-modal"}>
        {asPage ? (
          <div className="sheet-toolbar">
            <button className="plan-back" onClick={onCancel}>‹ All community</button>
            <div className="spacer" style={{ flex: 1 }} />
            {isEdit && <button className="explainer-link" onClick={() => setViewMode(true)} title="View application">View application</button>}
            <button className="btn btn-primary" disabled={!valid} onClick={() => onSubmit(d)}>{isEdit ? "Save" : "Create"}</button>
            {!valid && <span className="modal-missing" title={missing.join(", ")}>{missing.length} left</span>}
          </div>
        ) : (
          <div className="modal-head">
            <div className="row" style={{ gap: 12, minWidth: 0 }}>
              <h2 style={{ margin: 0 }}>{isEdit ? "Edit application" : "New application"}</h2>
              {isEdit && <button className="explainer-link" onClick={() => setViewMode(true)} title="View application">View application</button>}
            </div>
            <button className="btn btn-ghost" onClick={onCancel} aria-label="Close"><Icon name="close" /></button>
          </div>
        )}
        <div className={asPage ? "plan-body community-edit-body" : "modal-body"}>
          <div className={asPage ? "plan-main" : ""}>

          <SectionLabel>Project overview</SectionLabel>
          <label className="login-field"><span className="lbl">Project name</span>
            <input autoFocus value={d.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Cedarville Workforce STEM Grant" />
          </label>
          <div className="cm-row cm-row-2">
            <Designed label="Engagement type">
              <select value={d.kind} onChange={e => set("kind", e.target.value)}>
                {D.COMMUNITY_KINDS.map(k => <option key={k}>{k}</option>)}
              </select>
            </Designed>
            <Designed label="Stage">
              <select value={d.stage} onChange={e => set("stage", e.target.value)}>
                {D.COMMUNITY_STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Designed>
          </div>
          {d.kind === "Corporate Giving" && (
            <Designed label="Giving mode">
              <select value={d.givingMode || "Monetary"} onChange={e => set("givingMode", e.target.value)}>
                {D.GIVING_MODES.map(g => <option key={g}>{g}</option>)}
              </select>
            </Designed>
          )}
          <label className="login-field"><span className="lbl">One-line summary</span>
            <input value={d.summary} onChange={e => set("summary", e.target.value)} placeholder="Short description shown on the card" />
          </label>

          <SectionLabel>Applicant &amp; sponsor</SectionLabel>
          <div className="cm-row cm-row-2">
            <Designed label="Submitter">
              <select value={d.submitter} onChange={e => { const u = users.find(x => x.id === e.target.value); set("submitter", e.target.value); if (u) set("submitterRole", u.title); }}>
                {users.filter(u => u.role !== "system").map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </Designed>
            <label className="login-field"><span className="lbl">Submitter role</span>
              <input value={d.submitterRole} onChange={e => set("submitterRole", e.target.value)} />
            </label>
          </div>
          <label className="login-field"><span className="lbl">Date submitted</span>
            <input type="date" value={d.dateSubmitted} onChange={e => set("dateSubmitted", e.target.value)} />
          </label>
          <label className="login-field"><span className="lbl">Stakeholder / Organization Targeted</span>
            <Designed inline>
              <select value={d.representedStakeholderId} onChange={e => set("representedStakeholderId", e.target.value)}>
                <option value="">None</option>
                {stakeholders.map(s => <option key={s.id} value={s.id}>{displayName(s) || s.name}</option>)}
              </select>
            </Designed>
          </label>

          <SectionLabel>The ask</SectionLabel>
          <div className="cm-row cm-row-3">
            <Designed label="Support requested">
              <select value={d.askType} onChange={e => set("askType", e.target.value)}>
                {D.ASK_TYPES.map(a => <option key={a}>{a}</option>)}
              </select>
            </Designed>
            <label className="login-field"><span className="lbl">Amount</span>
              <input type="number" value={d.amount} onChange={e => set("amount", Number(e.target.value))} />
            </label>
            <Designed label="Unit">
              <select value={d.unit} onChange={e => set("unit", e.target.value)}>
                <option value="USD">USD</option>
                <option value="hours">hours</option>
                <option value="">n/a</option>
              </select>
            </Designed>
          </div>
          <div className="cm-row cm-row-3">
            <Designed label="Recurrence">
              <select value={d.recurrence} onChange={e => set("recurrence", e.target.value)}>
                {D.RECURRENCE.map(r => <option key={r}>{r}</option>)}
              </select>
            </Designed>
            <label className="login-field"><span className="lbl">Years</span>
              <input type="number" min="1" value={d.years} onChange={e => set("years", Number(e.target.value))} />
            </label>
            <label className="login-field"><span className="lbl">Decision deadline</span>
              <input type="date" value={d.decisionDeadline} onChange={e => set("decisionDeadline", e.target.value)} />
            </label>
          </div>
          <label className="login-field"><span className="lbl">Timeline</span>
            <input value={d.timeline} onChange={e => set("timeline", e.target.value)} placeholder="e.g. FY26–FY28" />
          </label>

          <SectionLabel>Description &amp; rationale</SectionLabel>
          <label className="login-field"><span className="lbl">Description <span className="cm-charcount">{(d.description || "").length}/1500</span></span>
            <textarea rows={4} maxLength={1500} className="cm-textarea" value={d.description} onChange={e => set("description", e.target.value)} />
          </label>
          <label className="login-field"><span className="lbl">Why this, why now <span className="cm-charcount">{(d.rationale || "").length}/500</span></span>
            <textarea rows={2} maxLength={500} className="cm-textarea" value={d.rationale} onChange={e => set("rationale", e.target.value)} />
          </label>

          <SectionLabel>Beneficiary &amp; relationships</SectionLabel>
          <label className="login-field"><span className="lbl">Recipient organization or cause</span>
            <input value={d.recipient} onChange={e => set("recipient", e.target.value)} placeholder="Who receives the support" />
          </label>
          <label className="login-field"><span className="lbl">Connected stakeholders</span>
            <span className="muted" style={{ fontSize: 11 }}>Link supporters, opponents, and decision-makers from your map.</span>
            <StakeholderPicker stakeholders={stakeholders} selected={d.linkedStakeholders} onChange={v => set("linkedStakeholders", v)} />
          </label>

          <SectionLabel>Strategic alignment</SectionLabel>
          <div className="cm-row cm-row-2">
            <ScoreSlider label="Improves license to operate" value={d.licenseToOperate} onChange={v => set("licenseToOperate", v)} />
            <ScoreSlider label="Improves relationships" value={d.relationshipImpact} onChange={v => set("relationshipImpact", v)} />
          </div>
          <div className="cm-valuescore">
            <span className="comm-meta-k">Value score</span>
            <span className="comm-value-bar" style={{ flex: 1 }}><span style={{ width: (vs * 10) + "%" }} /></span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{vs.toFixed(1)} / 10</span>
          </div>
          <label className="login-field"><span className="lbl">Issues</span>
            <IssueSelector selected={d.issues || []} companyIssues={companyIssues || []} onChange={v => set("issues", v)} />
          </label>
          <div className="cm-row cm-row-2">
            <label className="login-field"><span className="lbl">Markets</span>
              <ChipMultiSelect options={Object.keys(D.MARKETS)} selected={d.markets} onChange={v => set("markets", v)} />
            </label>
            <label className="login-field"><span className="lbl">Regions</span>
              <ChipMultiSelect options={d.markets.flatMap(m => D.MARKETS[m] || [])} selected={d.regions} onChange={v => set("regions", v)} />
            </label>
          </div>
          <div className="cm-row cm-row-3">
            <label className="login-field"><span className="lbl">Site</span>
              <div className="designed-select">
                <select value={d.site || ""} onChange={e => {
                  const id = e.target.value;
                  const s = (D.SITES || []).find(x => x.id === id);
                  if (s && s.state) { set("site", id); set("state", s.state); }
                  else set("site", id);
                }}>
                  <option value="">None</option>
                  {(D.SITES || []).map(s => <option key={s.id} value={s.id}>{D.siteLabel(s)}</option>)}
                </select>
              </div>
            </label>
            <label className="login-field"><span className="lbl">State</span>
              <div className="designed-select">
                <select value={d.state || ""} onChange={e => set("state", e.target.value)}>
                  <option value="">None</option>
                  {(D.US_STATES || []).map(st => <option key={st} value={st}>{D.STATE_ABBR[st] || st}</option>)}
                </select>
              </div>
            </label>
            <label className="login-field"><span className="lbl">Geography</span>
              <div className="designed-select">
                <select value={d.geography || ""} onChange={e => set("geography", e.target.value)}>
                  <option value="">Select…</option>
                  {(D.GEOGRAPHIES || []).map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </label>
          </div>

          <SectionLabel>Resources &amp; budget</SectionLabel>
          <div className="cm-row cm-row-3">
            <label className="login-field"><span className="lbl">Total project cost</span>
              <input type="number" value={d.budget.total} onChange={e => setBudget("total", Number(e.target.value))} />
            </label>
            <label className="login-field"><span className="lbl">Requested amount</span>
              <input type="number" value={d.budget.requested} onChange={e => setBudget("requested", Number(e.target.value))} />
            </label>
            <label className="login-field"><span className="lbl">Approved amount</span>
              <input type="number" value={d.approvedAmount} onChange={e => set("approvedAmount", Number(e.target.value))} />
            </label>
          </div>
          {(d.stage === "Approved" || d.stage === "Active" || d.stage === "Complete") && (
            <div className="cm-row cm-row-2">
              <label className="login-field"><span className="lbl">Date approved</span>
                <input type="date" value={d.dateApproved || ""} onChange={e => set("dateApproved", e.target.value)} />
                <span className="muted" style={{ fontSize: 11 }}>Sets the fiscal year this commitment counts toward.</span>
              </label>
            </div>
          )}
          <div className="cm-row cm-row-2">
            <label className="login-field"><span className="lbl">Other funding / partners</span>
              <input type="number" value={d.budget.otherFunding} onChange={e => setBudget("otherFunding", Number(e.target.value))} />
            </label>
            <label className="login-field"><span className="lbl">In-kind contributions</span>
              <input value={d.budget.inKind} onChange={e => setBudget("inKind", e.target.value)} placeholder="e.g. employee mentor hours" />
            </label>
          </div>

          <SectionLabel>Risk &amp; compliance</SectionLabel>
          <label className="login-field"><span className="lbl">Reputational / political risk</span>
            <input value={d.risk.reputational} onChange={e => setRisk("reputational", e.target.value)} />
          </label>
          <label className="login-field"><span className="lbl">Legal &amp; disclosure considerations</span>
            <input value={d.risk.legal} onChange={e => setRisk("legal", e.target.value)} />
          </label>
          <div className="cm-attest-row">
            <label className="cm-check">
              <input type="checkbox" checked={d.risk.conflictOfInterest} onChange={e => setRisk("conflictOfInterest", e.target.checked)} />
              <span className="cm-check-box" /> Conflict of interest disclosed
            </label>
            {d.risk.conflictOfInterest && (
              <label className="login-field" style={{ marginLeft: 26 }}><span className="lbl">Describe the conflict</span>
                <textarea rows={2} className="cm-textarea" value={d.risk.conflictDetail || ""} onChange={e => setRisk("conflictDetail", e.target.value)} placeholder="Nature of the conflict and how it's managed" />
              </label>
            )}
            <label className="cm-check">
              <input type="checkbox" checked={d.risk.attestation} onChange={e => setRisk("attestation", e.target.checked)} />
              <span className="cm-check-box" /> I attest this information is accurate
            </label>
          </div>

          <SectionLabel>Owners</SectionLabel>
          <MultiOwnerPicker users={users} owners={d.owners} onChange={v => set("owners", v)} size={26} />
          </div>
        </div>
        {!asPage && (
        <div className="modal-foot">
          {!valid && <span className="modal-missing" title={missing.join(", ")}>{missing.length} field{missing.length === 1 ? "" : "s"} left: {missing.slice(0, 3).join(", ")}{missing.length > 3 ? "…" : ""}</span>}
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => onSubmit(d)}>{isEdit ? "Save application" : "Create application"}</button>
        </div>
        )}
      </div>
    </>
  );
}

function SectionLabel({ children }) {
  return <div className="cm-section-label">{children}</div>;
}
function Designed({ label, inline, children }) {
  if (inline) return <div className="designed-select">{children}</div>;
  return (
    <label className="login-field"><span className="lbl">{label}</span>
      <div className="designed-select">{children}</div>
    </label>
  );
}
function ScoreSlider({ label, value, onChange }) {
  return (
    <div className="login-field">
      <span className="lbl">{label} <span style={{ fontFamily: "var(--mono)", color: "var(--ink-2)" }}>{value}</span></span>
      <input type="range" min="0" max="10" step="1" value={value} onChange={e => onChange(Number(e.target.value))} className="cm-range" />
    </div>
  );
}
function ChipMultiSelect({ options, selected, onChange }) {
  function toggle(v) { onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]); }
  return (
    <div className="cm-chip-select">
      {options.map(o => (
        <button key={o} type="button" className={"filter-chip" + (selected.includes(o) ? " on" : "")} onClick={() => toggle(o)}>{o}</button>
      ))}
      {options.length === 0 && <span className="muted" style={{ fontSize: 11 }}>Pick a market first</span>}
    </div>
  );
}
