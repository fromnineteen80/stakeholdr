import { useState, useEffect } from 'react';
import { STAKEHOLDER_DATA } from './data';
import { displayName, normalizeUrl, formatPhone, formatDateLong, Icon, Tags, StatusPill, PriorityPill, StatusDot } from './components';
import { affiliatedCommunity, stakeholderCumulativeUSD, communityEntryAmount } from './community';
import { OwnersDisplay, MultiOwnerPicker } from './users';
import { CommunityModal } from './community-modal';
import { IssueSelector } from './sheet-modals';
import { RecordShell, MetaField } from './record';
import { uid, nowStamp } from './store';

export function StakeholderProfile({
  stakeholder, users, stakeholders, community, scores, team,
  getWorkspacesForStakeholder, onClose, onEdit, onOpenWorkspace,
  updateCommunityApp, currentUser, companyIssues
}) {
  const D = STAKEHOLDER_DATA;
  const [subject, setSubject] = useState(stakeholder);
  const [entryId, setEntryId] = useState(null);
  const [showAllEntries, setShowAllEntries] = useState(false);
  useEffect(() => { setSubject(stakeholder); setEntryId(null); setShowAllEntries(false); }, [stakeholder && stakeholder.id]);
  if (!subject) return null;

  const s = subject;
  const affil = affiliatedCommunity(s.id, community || []);
  const cumulative = stakeholderCumulativeUSD(s.id, community || []);
  const wc = D.weightedCoord(s.id, scores || {}, team || []);
  const relStatus = D.statusFor(wc.x, wc.y);
  const wsList = getWorkspacesForStakeholder ? getWorkspacesForStakeholder(s.id) : [];
  const history = (s.notesHistory || []).slice().sort((a, b) => (b.at || "").localeCompare(a.at || ""));
  const viewEntry = entryId && (community || []).find(a => a.id === entryId);

  const PRow = ({ k, children }) => (<div className="prof-row"><div className="prof-k">{k}</div><div className="prof-v">{children}</div></div>);

  return (
    <>
      <div className="modal-veil show" onClick={onClose} />
      <div className="modal stakeholder-modal profile-modal">
        <div className="prof-header">
          <span className={"prof-avatar " + (s.isPerson ? "person" : "org")}
                style={s.photo ? { background: `center/cover no-repeat url(${s.photo})` } : undefined}>
            {!s.photo && <Icon name={s.isPerson ? "user" : "users"} className="ico" />}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="prof-title">{displayName(s) || s.name}</div>
            <div className="prof-sub">{s.org}{s.isPerson && s.title ? ` · ${s.title === "Other" ? s.titleOther : s.title}` : ""}</div>
            <div className="prof-tagline">
              <StatusPill status={relStatus} />
              <span className="prof-coords">x {wc.x.toFixed(1)} · y {wc.y.toFixed(1)}</span>
            </div>
          </div>
          <div className="prof-header-actions">
            {onEdit && <button className="explainer-link" onClick={onEdit}>Edit stakeholder</button>}
            <button className="btn btn-ghost" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
          </div>
        </div>
        <div className="modal-body prof-body">
          <div className="cm-section-label">Identity</div>
          <div className="prof-grid">
            <PRow k="Type">{s.category} · {s.type}</PRow>
            <PRow k="Status"><StatusDot value={s.status} /></PRow>
            <PRow k="Market">{s.market || "-"}</PRow>
            <PRow k="Region">{s.region || "-"}</PRow>
            <PRow k="Site">{s.site && D.SITES ? (D.siteLabel(D.SITES.find(x => x.id === s.site) || {}) || "-") : "-"}</PRow>
            <PRow k="State">{s.state ? (D.STATE_ABBR[s.state] || s.state) : "-"}</PRow>
            <PRow k="Geography">{s.geography || "-"}</PRow>
            <PRow k="Last contact">{s.lastContact ? formatDateLong(s.lastContact) : "-"}</PRow>
          </div>
          <div className="prof-fullrow"><div className="prof-k">Priority</div><div className="prof-v"><PriorityPill value={s.priority} /></div></div>

          <div className="cm-section-label">Contact</div>
          <div className="prof-grid">
            <PRow k="Website">{s.url ? <a className="plain-link" href={normalizeUrl(s.url)} target="_blank" rel="noopener noreferrer">{s.url}</a> : "-"}</PRow>
            <PRow k="Email">{s.email ? <a className="plain-link" href={"mailto:" + s.email}>{s.email}</a> : "-"}</PRow>
            <PRow k="Phone">{s.phone ? formatPhone(s.phone) : "-"}</PRow>
            <PRow k="X account">{s.xAccount || "-"}</PRow>
          </div>

          <div className="cm-section-label">Ownership &amp; reach</div>
          <div className="prof-fullrow"><div className="prof-k">Owners</div><div className="prof-v"><OwnersDisplay users={users} owners={s.owners || []} size={22} /></div></div>
          <div className="prof-fullrow"><div className="prof-k">Workspaces</div><div className="prof-v">
            {wsList.length ? (
              <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 4 }}>
                {wsList.map(w => (
                  <span key={w.id} className={"tag" + (onOpenWorkspace ? " tag-clickable" : "")}
                        onClick={onOpenWorkspace ? () => { onOpenWorkspace(w.id); if (onClose) onClose(); } : undefined}>{w.name}</span>
                ))}
              </span>
            ) : "-"}
          </div></div>

          <div className="prof-tagsissues">
            <div className="prof-ti-col">
              <div className="prof-k">Tags</div>
              <div className="prof-ti-pills">
                {(s.tags || []).length ? <Tags values={s.tags} /> : <span className="muted">-</span>}
              </div>
            </div>
            <div className="prof-ti-col">
              <div className="prof-k">Issues</div>
              <div className="prof-ti-pills">
                {(s.issues || []).length ? <Tags values={s.issues} /> : <span className="muted">-</span>}
              </div>
            </div>
          </div>

          <div className="cm-section-label">Community engagements</div>
          <div className="profile-cumulative">
            <span className="comm-meta-k">Cumulative committed</span>
            <span className="profile-cumulative-val" style={{ color: cumulative > 0 ? "var(--pos)" : "var(--ink-3)" }}>${cumulative.toLocaleString()}</span>
          </div>
          {affil.length === 0 ? (
            <div className="muted" style={{ fontSize: 12.5, padding: "4px 0" }}>No community engagements linked yet.</div>
          ) : (
            <div className="profile-entry-list">
              {affil.slice(0, 5).map(a => (
                <button key={a.id} className="profile-entry" onClick={() => setEntryId(a.id)} title="Open application">
                  <span className="profile-entry-main">
                    <span className="profile-entry-name">{a.name}</span>
                    <span className="profile-entry-meta muted">{a.kind} · {a.stage}</span>
                  </span>
                  <span className="profile-entry-amt">{communityEntryAmount(a)}</span>
                  <Icon name="chevron-right" className="ico" />
                </button>
              ))}
              {affil.length > 5 && (
                <button className="explainer-link" style={{ alignSelf: "flex-start", marginTop: 2 }} onClick={() => setShowAllEntries(true)}>
                  View all {affil.length} engagements
                </button>
              )}
            </div>
          )}

          <div className="cm-section-label">Notes</div>
          {history.length === 0 && !s.notes ? (
            <div className="muted" style={{ fontSize: 12.5, padding: "4px 0" }}>No notes recorded.</div>
          ) : history.length ? (
            <div className="prof-notes">
              {history.map(n => {
                const by = users.find(u => u.id === n.by);
                return (
                  <div key={n.id} className="prof-note">
                    <div className="prof-note-meta">
                      <span style={{ fontFamily: "var(--mono)", color: "var(--ink-2)" }}>{n.at ? formatDateLong(n.at) : ""}</span>
                      {by && <span className="muted"> · {by.name}</span>}
                    </div>
                    <div className="prof-note-body">{n.body}</div>
                  </div>
                );
              })}
            </div>
          ) : <p className="comm-card-summary">{s.notes}</p>}
        </div>
      </div>
      {viewEntry && (
        <CommunityModal
          existing={viewEntry}
          users={users}
          stakeholders={stakeholders || []}
          currentUser={currentUser}
          companyIssues={companyIssues}
          initialView={true}
          onOpenStakeholder={(id) => { const next = (stakeholders || []).find(x => x.id === id); if (next) { setSubject(next); setEntryId(null); } }}
          onCancel={() => setEntryId(null)}
          onSubmit={(app) => { if (updateCommunityApp) updateCommunityApp(app); setEntryId(null); }}
        />
      )}
      {showAllEntries && (
        <>
          <div className="modal-veil show" onClick={() => setShowAllEntries(false)} />
          <div className="modal" style={{ width: 460, maxWidth: "calc(100% - 32px)" }}>
            <div className="modal-head">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>Community engagements</div>
                <h2 style={{ margin: 0 }}>{displayName(s) || s.name}</h2>
              </div>
              <button className="btn btn-ghost" onClick={() => setShowAllEntries(false)} aria-label="Close"><Icon name="close" /></button>
            </div>
            <div className="modal-body" style={{ gap: 6 }}>
              <div className="profile-entry-list">
                {affil.map(a => (
                  <button key={a.id} className="profile-entry" onClick={() => { setShowAllEntries(false); setEntryId(a.id); }} title="Open application">
                    <span className="profile-entry-main">
                      <span className="profile-entry-name">{a.name}</span>
                      <span className="profile-entry-meta muted">{a.kind} · {a.stage}</span>
                    </span>
                    <span className="profile-entry-amt">{communityEntryAmount(a)}</span>
                    <Icon name="chevron-right" className="ico" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ── StakeholderRecord — full-page read+edit record on the RecordShell ────
// Mirrors the StakeholderModal field set/validation but renders through the
// universal scaffold (left section-nav · content · right metadata rail).
export function StakeholderRecord({
  stakeholder, users, stakeholders, community, scores, team, companyIssues,
  workspaces, getWorkspacesForStakeholder, onOpenWorkspace, updateCommunityApp,
  currentUser, onBack, onSave, onDelete, startEditing
}) {
  const D = STAKEHOLDER_DATA;
  const blank = {
    title: "", firstName: "", lastName: "", name: "", org: "", url: "", isPerson: false, photo: null,
    category: "Communities", type: D.CATEGORIES["Communities"][0],
    market: "Americas", region: "United States", geography: "Local",
    priority: "Medium", tags: [], issues: [], owners: currentUser ? [currentUser.id] : [],
    status: "Active", lastContact: new Date().toISOString().slice(0, 10), notes: ""
  };
  const [editing, setEditing] = useState(!!startEditing);
  const [draft, setDraft] = useState({ ...blank, ...stakeholder, isPerson: !!(stakeholder.firstName || stakeholder.lastName) });
  const [entryId, setEntryId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  useEffect(() => {
    setDraft({ ...blank, ...stakeholder, isPerson: !!(stakeholder.firstName || stakeholder.lastName) });
    setEditing(!!startEditing); setEntryId(null);
  }, [stakeholder && stakeholder.id]);
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  // Derived signals (use saved record so they stay stable while editing).
  const s = stakeholder;
  const wc = D.weightedCoord(s.id, scores || {}, team || []);
  const relStatus = D.statusFor(wc.x, wc.y);
  const affil = affiliatedCommunity(s.id, community || []);
  const cumulative = stakeholderCumulativeUSD(s.id, community || []);
  const wsList = getWorkspacesForStakeholder ? getWorkspacesForStakeholder(s.id) : [];
  const history = (s.notesHistory || []).slice().sort((a, b) => (b.at || "").localeCompare(a.at || ""));
  const viewEntry = entryId && (community || []).find(a => a.id === entryId);

  // Validation mirrors StakeholderModal.shMissing.
  const missing = [];
  if (!(draft.org || "").trim()) missing.push("Organization");
  if (draft.isPerson && !(draft.firstName || draft.lastName)) missing.push("Person name");
  if (draft.isPerson && draft.title === "Other" && !(draft.titleOther || "").trim()) missing.push("Custom title");
  if (!draft.category) missing.push("Category");
  if (!draft.type) missing.push("Audience type");
  if (!draft.market) missing.push("Market");
  if (!draft.region) missing.push("Region");
  if (!draft.geography) missing.push("Geography");
  const valid = missing.length === 0;

  function save() {
    if (!valid) return;
    const person = draft.isPerson;
    const computed = person ? displayName({ title: draft.title, titleOther: draft.titleOther, firstName: draft.firstName, lastName: draft.lastName }) : "";
    onSave({
      ...draft,
      title: person ? draft.title : "", titleOther: person ? draft.titleOther : "",
      firstName: person ? draft.firstName : "", lastName: person ? draft.lastName : "",
      name: person ? (computed || draft.org) : draft.org,
      url: normalizeUrl(draft.url)
    });
    setEditing(false);
  }
  function cancel() {
    setDraft({ ...blank, ...stakeholder, isPerson: !!(stakeholder.firstName || stakeholder.lastName) });
    setEditing(false);
  }
  function addNote() {
    const text = noteDraft.trim();
    if (!text) return;
    const entry = { id: uid("n"), body: text, at: nowStamp(), by: currentUser && currentUser.id };
    onSave({ notesHistory: [...(s.notesHistory || []), entry], notes: text });
    setNoteDraft("");
  }

  // A read/edit field row that matches MetaField's footprint but supports the
  // cascading selects (category→type, market→region, site→state).
  const Sel = ({ label, value, options, onChange, placeholder, render }) => (
    <label className="mf">
      <span className="mf-label">{label}</span>
      {!editing ? <span className="mf-value">{value ? (render ? render(value) : value) : <span className="mf-empty">—</span>}</span> : (
        <span className="designed-select mf-input">
          <select value={value || ""} onChange={e => onChange(e.target.value)}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(o => <option key={o} value={o}>{render ? render(o) : o}</option>)}
          </select>
        </span>
      )}
    </label>
  );

  const titleText = s.title === "Other" ? (s.titleOther || "") : s.title;

  const sections = [
    {
      id: "identity", label: "Identity", icon: "user",
      render: () => (
        <div className="record-fields">
          {editing && (
            <label className="mf" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={!!draft.isPerson} onChange={e => set("isPerson", e.target.checked)} />
              <span className="mf-label" style={{ margin: 0 }}>This stakeholder is a person</span>
            </label>
          )}
          <MetaField label="Organization" value={draft.org} editing={editing} placeholder="Organization" onChange={v => set("org", v)} />
          <MetaField label="Website" value={editing ? draft.url : (s.url ? <a className="plain-link" href={normalizeUrl(s.url)} target="_blank" rel="noopener noreferrer">{s.url}</a> : "")} editing={editing} placeholder="example.org" onChange={v => set("url", v)} />
          {draft.isPerson && <>
            <Sel label="Title" value={draft.title} placeholder="Select title…" options={["Senator", "Representative", "Assemblymember", "Governor", "Mayor", "County Supervisor", "Councilmember", "City Councilmember", "CEO", "Director", "Other"]} onChange={v => set("title", v)} />
            {draft.title === "Other" && <MetaField label="Custom title" value={draft.titleOther} editing={editing} onChange={v => set("titleOther", v)} />}
            <MetaField label="First name" value={draft.firstName} editing={editing} onChange={v => set("firstName", v)} />
            <MetaField label="Last name" value={draft.lastName} editing={editing} onChange={v => set("lastName", v)} />
          </>}
        </div>
      )
    },
    {
      id: "contact", label: "Contact", icon: "mail",
      render: () => (
        <div className="record-fields">
          <MetaField label="Email" value={editing ? draft.email : (s.email ? <a className="plain-link" href={"mailto:" + s.email}>{s.email}</a> : "")} editing={editing} placeholder="name@example.org" onChange={v => set("email", v)} />
          <MetaField label="Phone" value={editing ? draft.phone : (s.phone ? formatPhone(s.phone) : "")} editing={editing} placeholder="(555) 555-5555" onChange={v => set("phone", v)} />
          <MetaField label="X account" value={draft.xAccount} editing={editing} placeholder="@handle" onChange={v => set("xAccount", v)} />
        </div>
      )
    },
    {
      id: "classification", label: "Classification", icon: "category",
      render: () => (
        <div className="record-fields">
          <Sel label="Category" value={draft.category} options={Object.keys(D.CATEGORIES)} onChange={v => setDraft(d => ({ ...d, category: v, type: (D.CATEGORIES[v] || [])[0] || "" }))} />
          <Sel label="Audience type" value={draft.type} options={D.CATEGORIES[draft.category] || []} onChange={v => set("type", v)} />
          <Sel label="Market" value={draft.market} options={Object.keys(D.MARKETS)} onChange={v => setDraft(d => ({ ...d, market: v, region: "" }))} />
          <Sel label="Region" value={draft.region} placeholder="Select region…" options={D.MARKETS[draft.market] || []} onChange={v => set("region", v)} />
          <Sel label="Geography" value={draft.geography} options={D.GEOGRAPHIES || []} onChange={v => set("geography", v)} />
          <Sel label="Site" value={draft.site} placeholder="None" options={(D.SITES || []).map(x => x.id)} render={id => { const x = (D.SITES || []).find(y => y.id === id); return x ? D.siteLabel(x) : id; }} onChange={v => { const x = (D.SITES || []).find(y => y.id === v); setDraft(d => ({ ...d, site: v, state: x && x.state ? x.state : d.state })); }} />
          <Sel label="State" value={draft.state} placeholder="None" options={D.US_STATES || []} render={st => D.STATE_ABBR[st] || st} onChange={v => set("state", v)} />
        </div>
      )
    },
    {
      id: "relationship", label: "Relationship", icon: "sliders",
      render: () => (
        <div className="record-fields">
          <label className="mf"><span className="mf-label">Current relationship</span>
            <span className="mf-value" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><StatusPill status={relStatus} /> <span className="muted" style={{ fontSize: 11 }}>x {wc.x.toFixed(1)} · y {wc.y.toFixed(1)}</span></span>
          </label>
          <Sel label="Priority" value={draft.priority} options={["High", "Medium", "Low"]} render={v => v} onChange={v => set("priority", v)} />
          <Sel label="Status" value={draft.status} options={["Active", "Watch", "Dormant"]} onChange={v => set("status", v)} />
          <MetaField label="Last contact" value={editing ? (draft.lastContact || "") : (s.lastContact ? formatDateLong(s.lastContact) : "")} editing={editing} type="date" onChange={v => set("lastContact", v)} />
        </div>
      )
    },
    {
      id: "engagement", label: "Engagement", icon: "users",
      render: () => (
        <div className="record-fields">
          <label className="mf"><span className="mf-label">Owners</span>
            <div style={{ paddingTop: 2 }}>
              {editing ? <MultiOwnerPicker users={users} owners={draft.owners || []} onChange={v => set("owners", v)} size={26} />
                : ((s.owners || []).length ? <OwnersDisplay users={users} owners={s.owners} size={22} /> : <span className="mf-empty">—</span>)}
            </div>
          </label>
          <label className="mf"><span className="mf-label">Issues</span>
            <div style={{ paddingTop: 2 }}>
              {editing ? <IssueSelector selected={draft.issues || []} companyIssues={companyIssues || []} onChange={v => set("issues", v)} />
                : ((s.issues || []).length ? <Tags values={s.issues} /> : <span className="mf-empty">—</span>)}
            </div>
          </label>
          <label className="mf"><span className="mf-label">Tags</span>
            <div style={{ paddingTop: 2 }}>
              {editing ? <IssueSelector selected={draft.tags || []} companyIssues={companyIssues || []} onChange={v => set("tags", v)} restrict />
                : ((s.tags || []).length ? <Tags values={s.tags} /> : <span className="mf-empty">—</span>)}
            </div>
          </label>
          <label className="mf"><span className="mf-label">Workspaces</span>
            <div className="mf-value">
              {wsList.length ? (
                <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 4 }}>
                  {wsList.map(w => <span key={w.id} className={"tag" + (onOpenWorkspace ? " tag-clickable" : "")} onClick={onOpenWorkspace ? () => onOpenWorkspace(w.id) : undefined}>{w.name}</span>)}
                </span>
              ) : <span className="mf-empty">—</span>}
            </div>
          </label>
        </div>
      )
    },
    {
      id: "community", label: "Community", icon: "community",
      render: () => (
        <div className="record-prose">
          <div className="profile-cumulative" style={{ marginBottom: 12 }}>
            <span className="comm-meta-k">Cumulative committed</span>
            <span className="profile-cumulative-val" style={{ color: cumulative > 0 ? "var(--pos)" : "var(--ink-3)" }}>${cumulative.toLocaleString()}</span>
          </div>
          {affil.length === 0 ? <p className="muted">No community engagements linked yet.</p> : (
            <div className="profile-entry-list">
              {affil.map(a => (
                <button key={a.id} className="profile-entry" onClick={() => setEntryId(a.id)} title="Open application">
                  <span className="profile-entry-main">
                    <span className="profile-entry-name">{a.name}</span>
                    <span className="profile-entry-meta muted">{a.kind} · {a.stage}</span>
                  </span>
                  <span className="profile-entry-amt">{communityEntryAmount(a)}</span>
                  <Icon name="chevron-right" className="ico" />
                </button>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: "notes", label: "Notes", icon: "edit",
      render: () => (
        <div className="record-prose">
          <div style={{ marginBottom: 14 }}>
            <textarea className="mf-input mf-long" rows={3} placeholder="Add a note…" value={noteDraft} onChange={e => setNoteDraft(e.target.value)} />
            <button className="btn btn-primary" style={{ marginTop: 8 }} disabled={!noteDraft.trim()} onClick={addNote}>Add note</button>
          </div>
          {history.length === 0 && !s.notes ? <p className="muted">No notes recorded.</p>
            : history.length ? (
              <div className="prof-notes">
                {history.map(n => {
                  const by = users.find(u => u.id === n.by);
                  return (
                    <div key={n.id} className="prof-note">
                      <div className="prof-note-meta">
                        <span style={{ fontFamily: "var(--mono)", color: "var(--ink-2)" }}>{n.at ? formatDateLong(n.at) : ""}</span>
                        {by && <span className="muted"> · {by.name}</span>}
                      </div>
                      <div className="prof-note-body">{n.body}</div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="record-prose">{s.notes}</p>}
        </div>
      )
    }
  ];

  const rightRail = (
    <div className="record-rail-inner">
      <div className="record-rail-sec">
        <div className="mf"><span className="mf-label">Relationship</span><span className="mf-value"><StatusPill status={relStatus} /></span></div>
        <div className="mf"><span className="mf-label">Priority</span><span className="mf-value"><PriorityPill value={s.priority} /></span></div>
        <div className="mf"><span className="mf-label">Status</span><span className="mf-value"><StatusDot value={s.status} /></span></div>
        <div className="mf"><span className="mf-label">Type</span><span className="mf-value">{s.category} · {s.type}</span></div>
      </div>
      <div className="record-rail-sec">
        <div className="mf"><span className="mf-label">Market</span><span className="mf-value">{s.market || "-"}</span></div>
        <div className="mf"><span className="mf-label">Region</span><span className="mf-value">{s.region || "-"}</span></div>
        <div className="mf"><span className="mf-label">Geography</span><span className="mf-value">{s.geography || "-"}</span></div>
        <div className="mf"><span className="mf-label">Last contact</span><span className="mf-value">{s.lastContact ? formatDateLong(s.lastContact) : "-"}</span></div>
      </div>
      <div className="record-rail-sec">
        <div className="mf"><span className="mf-label">Owners</span><span className="mf-value">{(s.owners || []).length ? <OwnersDisplay users={users} owners={s.owners} size={22} /> : "-"}</span></div>
        <div className="mf"><span className="mf-label">Committed</span><span className="mf-value" style={{ color: cumulative > 0 ? "var(--pos)" : "var(--ink-3)" }}>${cumulative.toLocaleString()}</span></div>
      </div>
    </div>
  );

  return (
    <>
      <RecordShell
        backLabel={onBack ? "Back" : ""}
        onBack={onBack}
        title={displayName(s) || s.name}
        subtitle={s.org + (s.isPerson && titleText ? " · " + titleText : "")}
        editing={editing}
        sections={sections}
        rightRail={rightRail}
        navTitle="Stakeholder"
        toolbar={
          <span className="scaffold-controls">
            {editing ? (
              <>
                <button className="btn" onClick={cancel}>Cancel</button>
                <button className="btn btn-primary" onClick={save} disabled={!valid}>Save changes</button>
                {!valid && <span className="modal-missing" title={missing.join(", ")}>{missing.length} left</span>}
                {onDelete && <button className="btn btn-ghost" title="Delete stakeholder" onClick={() => setConfirmDelete(true)}><Icon name="close" /> Delete</button>}
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setEditing(true)}><Icon name="edit" /> Edit</button>
            )}
          </span>
        }
      />
      {viewEntry && (
        <CommunityModal
          existing={viewEntry} users={users} stakeholders={stakeholders || []} currentUser={currentUser}
          companyIssues={companyIssues} initialView
          onOpenStakeholder={() => {}}
          onCancel={() => setEntryId(null)}
          onSubmit={(app) => { if (updateCommunityApp) updateCommunityApp(app); setEntryId(null); }}
        />
      )}
      {confirmDelete && (
        <>
          <div className="modal-veil show" style={{ zIndex: 60 }} onClick={() => setConfirmDelete(false)} />
          <div className="modal confirm-modal" style={{ zIndex: 61, width: 380 }}>
            <div className="modal-body" style={{ padding: 20 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 17 }}>Delete this stakeholder?</h2>
              <p className="muted" style={{ fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--ink)" }}>{displayName(s) || s.name}</strong> and all of their scores will be permanently removed. This cannot be undone.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => { setConfirmDelete(false); onDelete(); }}>Delete</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
