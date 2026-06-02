import { useState, useEffect } from 'react';
import { STAKEHOLDER_DATA } from './data';
import { displayName, normalizeUrl, formatPhone, formatDateLong, Icon, Tags, StatusPill, PriorityPill, StatusDot } from './components';
import { affiliatedCommunity, stakeholderCumulativeUSD, communityEntryAmount } from './community';
import { OwnersDisplay } from './users';
import { CommunityModal } from './community-modal';

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
