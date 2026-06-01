// Scoring tab - stakeholders × team members. Each cell is an (x, y) rating from
// that team member; weighted average drives the dot position on the Map tab.

function ScoringView({ addNonce, addNonceFor, addStakeholder, workspaces, companyIssues, community, stakeholders, scores, team, updateScore, updateTeam, addTeamMember, removeTeamMember, workspaceLabel, users, currentUser, workspaceOwners, onDeleteWorkspace }) {
  const { weightedCoord, statusFor } = window.STAKEHOLDER_DATA;
  const { useState } = React;
  const [lastMemberId, setLastMemberId] = useState(null);   // triggers the "last teammate" modal
  const [replacementId, setReplacementId] = useState("");
  function requestRemove(id, isLast) {
    if (isLast) { setLastMemberId(id); setReplacementId(""); }
    else removeTeamMember(id);
  }
  const replacementChoices = users.filter(u => u.role !== "system" && !team.find(t => t.userId === u.id));

  // Sort: current user first, then workspace owners (in their listed order),
  // then everyone else (preserving original order).
  const orderedTeam = useMemo(() => {
    const ownerIds = workspaceOwners || [];
    return [...team].sort((a, b) => {
      const aMine = a.userId === currentUser?.id ? 0 : 1;
      const bMine = b.userId === currentUser?.id ? 0 : 1;
      if (aMine !== bMine) return aMine - bMine;
      const ai = ownerIds.indexOf(a.userId);
      const bi = ownerIds.indexOf(b.userId);
      const aRank = ai === -1 ? 1000 : ai;
      const bRank = bi === -1 ? 1000 : bi;
      return aRank - bRank;
    });
  }, [team, currentUser, workspaceOwners]);

  const totalW = orderedTeam.reduce((s, m) => s + (Number(m.weight) || 0), 0);

  // Users not yet on the team can be added. Exclude the system bot.
  const availableUsers = users.filter(u => u.role !== "system" && !orderedTeam.find(t => t.userId === u.id));
  const userById = (id) => users.find(u => u.id === id);

  const [addOpen, setAddOpen] = useState(false);
  const [newShOpen, setNewShOpen] = useState(false);
  useEffect(() => {
    if (addNonceFor === "scoring" && addNonce) setNewShOpen(true);
  }, [addNonce]);
  useEffect(() => {
    const open = () => setAddOpen(true);
    window.addEventListener("open-add-teammate", open);
    return () => window.removeEventListener("open-add-teammate", open);
  }, []);

  return (
    <div className="scoring-wrap">

      <div className="team-bar">
        {orderedTeam.map((m) => {
          const u = userById(m.userId);
          if (!u) return null;
          return (
            <div className="team-card" key={m.id}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <Avatar user={u} size={22} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.title}</div>
                </div>
                <button className="btn btn-ghost" onClick={() => requestRemove(m.id, orderedTeam.length === 1)} aria-label="Remove" style={{ padding: 2 }}>
                  <Icon name="close" />
                </button>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-mute)" }}>
                  Weight
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>
                  {(Number(m.weight) || 0).toFixed(1)}×
                </span>
              </div>
              <WeightSlider
                value={Number(m.weight) || 0}
                onChange={(v) => updateTeam(m.id, { weight: v })}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: "var(--ink-mute)", fontFamily: "var(--mono)", marginTop: 2 }}>
                <span>0.0</span><span>1.0 baseline</span><span>2.0</span>
              </div>
              <div style={{
                marginTop: 6, padding: "4px 7px",
                background: m.weight === 1 ? "rgba(0,0,0,.04)" : (m.weight > 1 ? "rgba(62,122,46,.1)" : "rgba(176,126,31,.1)"),
                borderRadius: 4,
                fontSize: 10.5, color: "var(--ink-3)",
                textAlign: "center"
              }}>
                {totalW > 0 ? Math.round(((Number(m.weight)||0) / totalW) * 100) : 0}% of team
              </div>
            </div>
          );
        })}

      </div>

      <div className="scoring-table-wrap">
        <table className="scoring-table">
          <thead>
            <tr>
              <th style={{ position: "sticky", left: 0, zIndex: 5, background: "var(--bg-2)" }}>Stakeholder</th>
              {orderedTeam.map(m => {
                const u = userById(m.userId);
                const isMine = m.userId === currentUser?.id;
                return (
                  <th key={m.id} className={"member" + (isMine ? " my-col" : "")}>
                    {u?.name}
                    <span className="member-weight">weight {(m.weight ?? 0).toFixed(1)}×</span>
                  </th>
                );
              })}
              <th style={{ background: "linear-gradient(180deg,#F1E7CD,#E8DCB7)" }}>
                Weighted (x, y)
                <span style={{ display: "block", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 10.5, color: "var(--ink-mute)", marginTop: 2 }}>
                  derived
                </span>
              </th>
              <th style={{ background: "linear-gradient(180deg,#F1E7CD,#E8DCB7)" }}>Relationship</th>
            </tr>
          </thead>
          <tbody>
            {stakeholders.map(s => {
              const wc = weightedCoord(s.id, scores, team);
              const status = statusFor(wc.x, wc.y);
              return (
                <tr key={s.id}>
                  <td className="sh-cell sh-cell-link" onClick={() => window.dispatchEvent(new CustomEvent("open-stakeholder-profile", { detail: s.id }))} title="Open stakeholder">
                    <div className="sh-cell-name">{window.displayName(s) || s.org}</div>
                    {s.org && <div className="sh-cell-org">{s.org}</div>}
                    <div className="sh-cell-meta">{s.type}</div>
                  </td>
                  {orderedTeam.map(m => {
                    const sc = (scores[s.id] || {})[m.id] || { x: 0, y: 0 };
                    const isMine = m.userId === currentUser?.id;
                    return (
                      <td key={m.id} className={(isMine ? "my-col" : "scoring-cell-ro")}>
                        {isMine ? (
                          <div className="xy-input">
                            <span className="lbl">x</span>
                            <span className="xy-field">
                              <input
                                type="number" step="1" min="-10" max="10"
                                value={sc.x}
                                onChange={e => updateScore(s.id, m.id, { ...sc, x: clamp(e.target.value, -10, 10) })}
                              />
                              <span className="xy-spin">
                                <button type="button" tabIndex={-1} className="xy-spin-btn" onClick={() => updateScore(s.id, m.id, { ...sc, x: clamp(sc.x + 1, -10, 10) })} aria-label="Increase x"><Icon name="chevronUp" className="ico" /></button>
                                <button type="button" tabIndex={-1} className="xy-spin-btn" onClick={() => updateScore(s.id, m.id, { ...sc, x: clamp(sc.x - 1, -10, 10) })} aria-label="Decrease x"><Icon name="chevron" className="ico" /></button>
                              </span>
                            </span>
                            <span className="lbl">y</span>
                            <span className="xy-field">
                              <input
                                type="number" step="1" min="-10" max="10"
                                value={sc.y}
                                onChange={e => updateScore(s.id, m.id, { ...sc, y: clamp(e.target.value, -10, 10) })}
                              />
                              <span className="xy-spin">
                                <button type="button" tabIndex={-1} className="xy-spin-btn" onClick={() => updateScore(s.id, m.id, { ...sc, y: clamp(sc.y + 1, -10, 10) })} aria-label="Increase y"><Icon name="chevronUp" className="ico" /></button>
                                <button type="button" tabIndex={-1} className="xy-spin-btn" onClick={() => updateScore(s.id, m.id, { ...sc, y: clamp(sc.y - 1, -10, 10) })} aria-label="Decrease y"><Icon name="chevron" className="ico" /></button>
                              </span>
                            </span>
                          </div>
                        ) : (
                          <div className="xy-readonly" title={`${userById(m.userId)?.name || "Teammate"}'s score`}>
                            <span className="xy-readonly-pair">
                              <span className="xy-readonly-k">x</span><span className="xy-readonly-v">{sc.x}</span>
                            </span>
                            <span className="xy-readonly-pair">
                              <span className="xy-readonly-k">y</span><span className="xy-readonly-v">{sc.y}</span>
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="computed">
                    <span style={{ color: wc.x >= 0 ? "var(--pos)" : "var(--neg)" }}>{wc.x.toFixed(1)}</span>
                    {",  "}
                    <span style={{ color: wc.y >= 0 ? "var(--pos)" : "var(--neg)" }}>{wc.y.toFixed(1)}</span>
                  </td>
                  <td style={{ padding: "0 12px", background: "#FBF6E6" }}>
                    <StatusPill status={status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <AddTeammateModal
          available={availableUsers}
          onCancel={() => setAddOpen(false)}
          onAdd={(userId) => {
            addTeamMember(userId);
            setAddOpen(false);
          }}
        />
      )}

      {newShOpen && window.StakeholderModal && (
        <window.StakeholderModal
          users={users}
          workspaces={workspaces}
          isMaster={false}
          currentUser={currentUser}
          existing={null}
          companyIssues={companyIssues}
          community={community}
          stakeholders={stakeholders}
          onCancel={() => setNewShOpen(false)}
          onSubmit={(data) => { addStakeholder && addStakeholder(data); setNewShOpen(false); }}
        />
      )}

      {lastMemberId && (
        <>
          <div className="modal-veil show" onClick={() => setLastMemberId(null)} />
          <div className="modal" style={{ width: 460, maxWidth: "calc(100% - 32px)" }}>
            <div className="modal-head">
              <h2>Last teammate on this workspace</h2>
              <button className="btn btn-ghost" onClick={() => setLastMemberId(null)} aria-label="Close"><Icon name="close" /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, lineHeight: 1.5, margin: "0 0 14px", color: "var(--ink-2)" }}>
                A workspace cannot have zero teammates. Hand off to a replacement, or delete the workspace entirely.
              </p>
              <label className="login-field"><span className="lbl">Hand off to</span>
                <div className="designed-select">
                  <select value={replacementId} onChange={e => setReplacementId(e.target.value)}>
                    <option value="">Select a teammate…</option>
                    {replacementChoices.map(u => <option key={u.id} value={u.id}>{u.name}{u.title ? ` · ${u.title}` : ""}</option>)}
                  </select>
                </div>
              </label>
            </div>
            <div className="modal-foot" style={{ justifyContent: "space-between" }}>
              <button className="btn btn-danger" onClick={() => { if (onDeleteWorkspace) onDeleteWorkspace(); setLastMemberId(null); }}>
                Delete workspace
              </button>
              <button className="btn btn-primary" disabled={!replacementId} onClick={() => {
                addTeamMember(replacementId);
                removeTeamMember(lastMemberId);
                setLastMemberId(null);
              }}>Hand off &amp; remove</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AddTeammateModal({ available, onCancel, onAdd }) {
  const [pickedId, setPickedId] = useState(null);
  return (
    <>
      <div className="modal-veil show" onClick={onCancel} />
      <div className="modal" style={{ width: 380 }}>
        <div className="modal-head">
          <h2>Add a teammate</h2>
          <button className="btn btn-ghost" onClick={onCancel} aria-label="Close"><Icon name="close" /></button>
        </div>
        <div className="modal-body">
          <div className="login-field">
            <span className="lbl">Pick a user</span>
            <div className="ws-owner-control" style={{ padding: "4px 8px" }}>
              <UserAutocomplete
                users={available}
                value={pickedId}
                onChange={setPickedId}
                placeholder="Type a name or title…"
                clearable
                autoFocus
              />
            </div>
            <span className="muted" style={{ fontSize: 11, marginTop: 4 }}>
              They'll be added with weight 1.0 (baseline). Adjust afterwards.
            </span>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" disabled={!pickedId} onClick={() => onAdd(pickedId)}>Add to team</button>
        </div>
      </div>
    </>
  );
}

function clamp(v, min, max) {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.max(min, Math.min(max, n));
}

function WeightSlider({ value, onChange }) {
  // value: 0.0 – 2.0. Baseline 1.0 shown as a tick mark (centered).
  const min = 0.0, max = 2.0;
  const pct = (v) => ((v - min) / (max - min)) * 100;
  const fillLeft  = Math.min(pct(1), pct(value));
  const fillRight = Math.max(pct(1), pct(value));
  return (
    <div className="weight-track">
      <div className="wt-rail">
        <div
          className="wt-fill"
          style={{
            left: fillLeft + "%",
            width: (fillRight - fillLeft) + "%"
          }}
        />
        <div className="wt-baseline" title="Baseline weight 1.0" />
      </div>
      <input
        type="range"
        min={0.0} max={2.0} step={0.1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

Object.assign(window, { ScoringView });
