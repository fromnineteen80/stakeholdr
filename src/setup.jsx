import { useState, useRef, useEffect, useMemo } from 'react';
import * as ReactDOM from 'react-dom';
import { STAKEHOLDER_DATA } from './data';
import { Icon, displayName, StatusPill, PriorityPill } from './components';
import { MultiOwnerPicker, ConfirmDialog, OwnersDisplay } from './users';
import { RecordShell, MetaField } from './record';
// Setup tab - workspaces management (HP segment + business unit scope).
// Workspaces use multi-owner avatars (no names/titles inline), date created,
// role-gated deletion with confirm dialog, and a popped-up card for create/edit.

export function SetupView({
  workspaces, addWorkspace, updateWorkspace, removeWorkspace,
  stakeholders, stakeholderWorkspaces, setStakeholderWorkspaces, scores, team,
  activeWorkspaceId, setActiveWorkspaceId, users, currentUser,
  editWorkspaceId, setEditWorkspaceId,
  createOpen, setCreateOpen, explainerSlot, companySegments
}) {
  const D = STAKEHOLDER_DATA;
  const SEGMAP = (companySegments && Object.keys(companySegments).length) ? companySegments : D.SEGMENTS;

  const [recordWsId, setRecordWsId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");
  const [segFilter, setSegFilter] = useState([]);   // selected segments (empty = all)
  const [segOpen, setSegOpen] = useState(false);
  function toggleSeg(s) { setSegFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]); }
  const [marketFilter, setMarketFilter] = useState([]);
  const [marketOpen, setMarketOpen] = useState(false);
  function toggleMarket(s) { setMarketFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]); }
  const [regionFilter, setRegionFilter] = useState([]);
  const [regionOpen, setRegionOpen] = useState(false);
  function toggleRegion(s) { setRegionFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]); }

  const isManager = currentUser?.role === "manager";
  const marketsByWs = useMemo(() => {
    const m = {};
    Object.entries(stakeholderWorkspaces).forEach(([sh, list]) => {
      const st = stakeholders.find(x => x.id === sh);
      if (!st) return;
      list.forEach(wid => {
        m[wid] = m[wid] || { markets: new Set(), regions: new Set() };
        if (st.market) m[wid].markets.add(st.market);
        if (st.region) m[wid].regions.add(st.region);
      });
    });
    return m;
  }, [stakeholderWorkspaces, stakeholders]);
  // Member visibility: workspaces where they are an owner.
  const memberWorkspaces = workspaces.filter(w => (w.owners || []).includes(currentUser.id));
  let visibleWorkspaces = isManager || showAll ? workspaces : memberWorkspaces;
  if (segFilter.length) visibleWorkspaces = visibleWorkspaces.filter(w => segFilter.includes(w.segment));
  if (marketFilter.length) visibleWorkspaces = visibleWorkspaces.filter(w => { const m = marketsByWs[w.id]; return m && [...m.markets].some(x => marketFilter.includes(x)); });
  if (regionFilter.length) visibleWorkspaces = visibleWorkspaces.filter(w => { const m = marketsByWs[w.id]; return m && [...m.regions].some(x => regionFilter.includes(x)); });
  if (search.trim()) {
    const q = search.toLowerCase();
    visibleWorkspaces = visibleWorkspaces.filter(w =>
      (w.name || "").toLowerCase().includes(q) ||
      (w.businessUnit || "").toLowerCase().includes(q) ||
      (w.segment || "").toLowerCase().includes(q));
  }
  const otherWorkspaces = workspaces.filter(w => !memberWorkspaces.find(m => m.id === w.id));

  const countByWs = useMemo(() => {
    const m = {};
    Object.entries(stakeholderWorkspaces).forEach(([sh, list]) => {
      list.forEach(wid => { m[wid] = (m[wid] || 0) + 1; });
    });
    return m;
  }, [stakeholderWorkspaces]);

  function toggleAssignment(stakeholderId, wsId) {
    const cur = stakeholderWorkspaces[stakeholderId] || [];
    const next = cur.includes(wsId)
      ? cur.filter(w => w !== wsId)
      : [...cur, wsId];
    setStakeholderWorkspaces({ ...stakeholderWorkspaces, [stakeholderId]: next });
  }

  function canDelete(ws) {
    if (!currentUser) return false;
    if (currentUser.role === "manager") return true;
    return ws.createdBy === currentUser.id;
  }

  function attemptDelete(wsId) {
    const ws = workspaces.find(w => w.id === wsId);
    if (!canDelete(ws)) {
      alert("Only the workspace creator or a manager can delete this workspace.");
      return;
    }
    setConfirmDeleteId(wsId);
  }

  const segments = Object.keys(SEGMAP);
  const editingWs = workspaces.find(w => w.id === editWorkspaceId);
  const wsToDelete = workspaces.find(w => w.id === confirmDeleteId);

  // Full-page workspace record (read + edit) takes over the setup surface.
  const recordWs = workspaces.find(w => w.id === recordWsId);
  if (recordWs) {
    return (
      <WorkspaceRecord
        ws={recordWs}
        users={users}
        currentUser={currentUser}
        stakeholders={stakeholders}
        stakeholderWorkspaces={stakeholderWorkspaces}
        setStakeholderWorkspaces={setStakeholderWorkspaces}
        scores={scores}
        team={team}
        segMap={SEGMAP}
        canDelete={canDelete(recordWs)}
        onBack={() => setRecordWsId(null)}
        onUpdate={(patch) => updateWorkspace(recordWs.id, patch)}
        onActivate={() => setActiveWorkspaceId(recordWs.id)}
        onDelete={() => {
          if (!canDelete(recordWs)) { alert("Only the workspace creator or a manager can delete this workspace."); return; }
          removeWorkspace(recordWs.id);
          setRecordWsId(null);
        }}
      />
    );
  }

  return (
    <div className="setup-wrap">
      {explainerSlot && ReactDOM.createPortal(
        <div className="sheet-toolbar">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search workspaces…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-button-wrap">
            <button className={"btn" + (segFilter.length ? " filter-active" : "")} onClick={() => { setSegOpen(o => !o); setMarketOpen(false); setRegionOpen(false); }}>
              Segments
              {segFilter.length > 0 && <span className="filter-count">{segFilter.length}</span>}
            </button>
            {segOpen && (
              <div className="filter-popover" style={{ width: 240 }} onMouseLeave={() => setSegOpen(false)}>
                <div className="filter-pop-head"><strong>Segments</strong><button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setSegFilter([])}>Clear all</button></div>
                <div className="filter-pop-body">
                  <div className="cat-opt-list">
                    {segments.map(s => {
                      const on = segFilter.includes(s);
                      return (
                        <button key={s} type="button" className={"cat-opt" + (on ? " on" : "")} onClick={() => toggleSeg(s)}>
                          <Icon name="check" className="ico cat-check" />
                          <span>{s}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="filter-button-wrap">
            <button className={"btn" + (marketFilter.length ? " filter-active" : "")} onClick={() => { setMarketOpen(o => !o); setSegOpen(false); setRegionOpen(false); }}>
              Markets
              {marketFilter.length > 0 && <span className="filter-count">{marketFilter.length}</span>}
            </button>
            {marketOpen && (
              <div className="filter-popover" style={{ width: 240 }} onMouseLeave={() => setMarketOpen(false)}>
                <div className="filter-pop-head"><strong>Markets</strong><button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setMarketFilter([])}>Clear all</button></div>
                <div className="filter-pop-body">
                  <div className="cat-opt-list">
                    {Object.keys(D.MARKETS).map(s => {
                      const on = marketFilter.includes(s);
                      return (
                        <button key={s} type="button" className={"cat-opt" + (on ? " on" : "")} onClick={() => toggleMarket(s)}>
                          <Icon name="check" className="ico cat-check" />
                          <span>{s}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="filter-button-wrap">
            <button className={"btn" + (regionFilter.length ? " filter-active" : "")} onClick={() => { setRegionOpen(o => !o); setSegOpen(false); setMarketOpen(false); }}>
              Regions
              {regionFilter.length > 0 && <span className="filter-count">{regionFilter.length}</span>}
            </button>
            {regionOpen && (
              <div className="filter-popover" style={{ width: 240 }} onMouseLeave={() => setRegionOpen(false)}>
                <div className="filter-pop-head"><strong>Regions</strong><button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setRegionFilter([])}>Clear all</button></div>
                <div className="filter-pop-body">
                  <div className="cat-opt-list">
                    {[...new Set(Object.values(D.MARKETS).flat())].map(s => {
                      const on = regionFilter.includes(s);
                      return (
                        <button key={s} type="button" className={"cat-opt" + (on ? " on" : "")} onClick={() => toggleRegion(s)}>
                          <Icon name="check" className="ico cat-check" />
                          <span>{s}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="spacer" style={{ flex: 1 }} />
        </div>, explainerSlot)}
      <div className="setup-scroll">
        <div className="setup-section">
        {visibleWorkspaces.length === 0 && (
          <div className="comm-empty muted">No workspaces match.</div>
        )}
        {segments.map(seg => {
          const wsInSeg = visibleWorkspaces.filter(w => w.segment === seg);
          if (wsInSeg.length === 0) return null;
          return (
            <div key={seg} className="seg-group">
              <div className="seg-group-head">
                <SegmentBadge segment={seg} />
                <span className="muted" style={{ fontSize: 11.5 }}>{wsInSeg.length} workspace{wsInSeg.length === 1 ? "" : "s"}</span>
              </div>
              <div className="ws-grid">
                {wsInSeg.map(ws => (
                  <WorkspaceCard
                    key={ws.id}
                    ws={ws}
                    isActive={ws.id === activeWorkspaceId}
                    count={countByWs[ws.id] || 0}
                    markets={marketsByWs[ws.id] ? [...marketsByWs[ws.id].markets] : []}
                    regions={marketsByWs[ws.id] ? [...marketsByWs[ws.id].regions] : []}
                    onActivate={() => setActiveWorkspaceId(ws.id)}
                    onOpen={() => setRecordWsId(ws.id)}
                    onDelete={() => attemptDelete(ws.id)}
                    onEdit={() => setEditWorkspaceId(ws.id)}
                    onUpdate={(patch) => updateWorkspace(ws.id, patch)}
                    users={users}
                    canDelete={canDelete(ws)}
                  />
                ))}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      <div className="sheet-footer comm-footer">
        <div className="group"><Icon name="grid" /> <strong style={{ color: "var(--ink)" }}>{workspaces.length}</strong> workspaces</div>
        <div className="group">·</div>
        <div className="group muted" style={{ flex: 1 }}>
          Workspaces pair a segment with a business unit. Assign stakeholders from the Master pool to any number of workspaces.
        </div>
      </div>

      <WorkspaceModal
        open={createOpen}
        mode="create"
        segMap={SEGMAP}
        users={users}
        currentUser={currentUser}
        onClose={() => setCreateOpen(false)}
        onSave={(data) => {
          addWorkspace(data);
          setCreateOpen(false);
        }}
      />
      <WorkspaceModal
        open={!!editingWs}
        mode="edit"
        segMap={SEGMAP}
        ws={editingWs}
        users={users}
        currentUser={currentUser}
        onClose={() => setEditWorkspaceId(null)}
        onSave={(patch) => {
          if (editingWs) updateWorkspace(editingWs.id, patch);
          setEditWorkspaceId(null);
        }}
      />

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete workspace?"
        body={wsToDelete ? (
          <>
            <p style={{ margin: "0 0 8px" }}>
              <strong>{wsToDelete.name}</strong> ({wsToDelete.segment} · {wsToDelete.businessUnit}) will be removed.
            </p>
            <p className="muted" style={{ margin: 0, fontSize: 12 }}>
              Stakeholders in this workspace will stay in the Master pool. This can't be undone.
            </p>
          </>
        ) : null}
        confirmLabel="Yes, delete"
        cancelLabel="Cancel"
        danger
        onConfirm={() => { removeWorkspace(confirmDeleteId); setConfirmDeleteId(null); }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

export function WorkspaceCard({ ws, isActive, count, markets, regions, onActivate, onOpen, onDelete, onEdit, onUpdate, users, canDelete }) {
  const D = STAKEHOLDER_DATA;
  return (
    <div className="comm-card ws-card" onClick={onActivate} style={{ cursor: "pointer" }}>
      <div className="comm-card-head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <span className="comm-card-name plan-card-title" onClick={(e) => { e.stopPropagation(); (onOpen || onEdit)(); }} title="Open workspace record">{ws.name}</span>
          <div className="comm-card-recipient muted">{ws.businessUnit}</div>
        </div>
        <MultiOwnerPicker users={users} owners={ws.owners || []} onChange={(next) => onUpdate({ owners: next })} />
      </div>

      <div className="comm-card-badges">
        <SegmentBadge segment={ws.segment} small />
        <span className="spacer" style={{ flex: 1 }} />
        {isActive && <span className="comm-stage-text" style={{ color: "var(--accent)" }}>Active</span>}
      </div>

      <div className="comm-card-linked">
        <span className="comm-meta-k">Markets</span>
        <span className="comm-linked-names">{(markets && markets.length) ? markets.join(", ") : "—"}</span>
      </div>
      <div className="comm-card-linked">
        <span className="comm-meta-k">Regions</span>
        <span className="comm-linked-names">{(regions && regions.length) ? regions.join(", ") : "—"}</span>
      </div>

      <div className="comm-card-foot">
        <span className="muted" style={{ fontSize: 11.5 }}>
          <strong style={{ color: "var(--ink)", fontFamily: "var(--mono)" }}>{count}</strong> stakeholders
        </span>
        <span className="spacer" style={{ flex: 1 }} />
        <span className="muted" style={{ fontSize: 11, fontFamily: "var(--mono)" }} title="Date created">{formatCreated(ws.createdAt)}</span>
        {canDelete && (
          <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); onDelete(); }} aria-label="Delete" title="Delete workspace" style={{ marginLeft: 4 }}>
            <Icon name="close" />
          </button>
        )}
      </div>
    </div>
  );
}

function formatCreated(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ── WorkspaceRecord — full-page read+edit record on the RecordShell ──────
export function WorkspaceRecord({
  ws, users, currentUser, stakeholders, stakeholderWorkspaces, setStakeholderWorkspaces,
  scores, team, segMap, onBack, onUpdate, onDelete, onActivate, canDelete
}) {
  const D = STAKEHOLDER_DATA;
  const SEG = (segMap && Object.keys(segMap).length) ? segMap : D.SEGMENTS;
  const segments = Object.keys(SEG);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(ws);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => { setDraft(ws); setEditing(false); }, [ws && ws.id]);
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const bus = SEG[draft.segment] || [];
  const valid = (draft.name || "").trim().length > 0 && (draft.owners || []).length > 0;

  function save() {
    if (!valid) return;
    onUpdate({ name: draft.name.trim(), segment: draft.segment, businessUnit: draft.businessUnit, scope: draft.scope, scopeState: draft.scopeState, owners: draft.owners });
    setEditing(false);
  }
  function cancel() { setDraft(ws); setEditing(false); }

  // Stakeholders assigned to this workspace + derived markets/regions.
  const wsStakeholders = stakeholders.filter(s => (stakeholderWorkspaces[s.id] || []).includes(ws.id));
  const markets = [...new Set(wsStakeholders.map(s => s.market).filter(Boolean))];
  const regions = [...new Set(wsStakeholders.map(s => s.region).filter(Boolean))];
  function rel(s) { const wc = D.weightedCoord(s.id, scores || {}, team || []); return D.statusFor(wc.x, wc.y); }
  function unassign(id) {
    setStakeholderWorkspaces({ ...stakeholderWorkspaces, [id]: (stakeholderWorkspaces[id] || []).filter(w => w !== ws.id) });
  }

  const creator = users.find(u => u.id === ws.createdBy);

  const sections = [
    {
      id: "details", label: "Details", icon: "grid",
      render: (ed) => (
        <div className="record-fields">
          <MetaField label="Workspace name" value={draft.name} editing={ed} placeholder="e.g. GA&PP – North America" onChange={v => set("name", v)} />
          <label className="mf">
            <span className="mf-label">Segment</span>
            {!ed ? <span className="mf-value">{draft.segment || <span className="mf-empty">—</span>}</span> : (
              <span className="designed-select mf-input">
                <select value={draft.segment} onChange={e => { const seg = e.target.value; setDraft(d => ({ ...d, segment: seg, businessUnit: (SEG[seg] || [])[0] || "" })); }}>
                  {segments.map(s => <option key={s}>{s}</option>)}
                </select>
              </span>
            )}
          </label>
          <label className="mf">
            <span className="mf-label">Business unit</span>
            {!ed ? <span className="mf-value">{draft.businessUnit || <span className="mf-empty">—</span>}</span> : (
              <span className="designed-select mf-input">
                <select value={draft.businessUnit} onChange={e => set("businessUnit", e.target.value)}>
                  {bus.map(b => <option key={b}>{b}</option>)}
                </select>
              </span>
            )}
          </label>
          <MetaField label="Scope" value={draft.scope} editing={ed} type="select" placeholder="None" options={["National", "State"]} onChange={v => set("scope", v === "" ? "" : v)} />
          {draft.scope === "State" && (
            <label className="mf">
              <span className="mf-label">State</span>
              {!ed ? <span className="mf-value">{draft.scopeState ? (D.STATE_ABBR[draft.scopeState] || draft.scopeState) : <span className="mf-empty">—</span>}</span> : (
                <span className="designed-select mf-input">
                  <select value={draft.scopeState || ""} onChange={e => set("scopeState", e.target.value)}>
                    <option value="">Select state…</option>
                    {(D.US_STATES || []).map(st => <option key={st} value={st}>{D.STATE_ABBR[st] || st}</option>)}
                  </select>
                </span>
              )}
            </label>
          )}
          <label className="mf">
            <span className="mf-label">Owners</span>
            <div style={{ paddingTop: 2 }}>
              {ed
                ? <MultiOwnerPicker users={users} owners={draft.owners || []} onChange={next => set("owners", next)} size={28} />
                : ((draft.owners || []).length ? <OwnersDisplay users={users} owners={draft.owners} size={26} /> : <span className="mf-empty">—</span>)}
            </div>
          </label>
        </div>
      )
    },
    {
      id: "stakeholders", label: "Stakeholders", icon: "users",
      render: () => (
        <div className="record-table-embed">
          {wsStakeholders.length ? (
            <div className="plan-sh-table">
              <div className="plan-sh-thead">
                <span>Stakeholder</span><span>Type</span><span>Relationship</span><span>Priority</span>
              </div>
              {wsStakeholders.map(s => (
                <div className="plan-sh-trow" key={s.id} style={{ cursor: "default" }}>
                  <span className="plan-sh-name">{displayName(s) || s.name}</span>
                  <span className="muted">{s.type}</span>
                  <span><StatusPill status={rel(s)} /></span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <PriorityPill value={s.priority} />
                    <button className="btn btn-ghost" title="Remove from workspace" onClick={() => unassign(s.id)}><Icon name="close" /></button>
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="muted" style={{ padding: 16 }}>No stakeholders assigned to this workspace yet. Assign them from the Master pool.</p>}
          <div className="sheet-footer">
            <div className="group"><Icon name="users" /> <strong style={{ color: "var(--ink)" }}>{wsStakeholders.length}</strong> stakeholders</div>
            <div className="spacer" style={{ flex: 1 }} />
            <button className="footer-export-btn" onClick={onActivate}><Icon name="table" /> Open workspace table</button>
          </div>
        </div>
      )
    }
  ];

  const rightRail = (
    <div className="record-rail-inner">
      <div className="record-rail-sec">
        <div className="mf"><span className="mf-label">Segment</span><span className="mf-value"><SegmentBadge segment={ws.segment} small /></span></div>
        <div className="mf"><span className="mf-label">Business unit</span><span className="mf-value">{ws.businessUnit || "-"}</span></div>
        <div className="mf"><span className="mf-label">Stakeholders</span><span className="mf-value">{wsStakeholders.length}</span></div>
        <div className="mf"><span className="mf-label">Markets</span><span className="mf-value">{markets.length ? markets.join(", ") : "-"}</span></div>
        <div className="mf"><span className="mf-label">Regions</span><span className="mf-value">{regions.length ? regions.join(", ") : "-"}</span></div>
      </div>
      <div className="record-rail-sec">
        <div className="mf"><span className="mf-label">Owners</span>
          <span className="mf-value">{(ws.owners || []).length ? <OwnersDisplay users={users} owners={ws.owners} size={22} /> : "-"}</span>
        </div>
        <div className="mf"><span className="mf-label">Created by</span><span className="mf-value">{creator ? creator.name : "-"}</span></div>
        <div className="mf"><span className="mf-label">Created</span><span className="mf-value">{formatCreated(ws.createdAt)}</span></div>
      </div>
    </div>
  );

  return (
    <>
      <RecordShell
        backLabel="All workspaces"
        onBack={onBack}
        title={ws.name}
        subtitle={ws.segment + " · " + ws.businessUnit}
        editing={editing}
        sections={sections}
        rightRail={rightRail}
        navTitle="Workspace"
        toolbar={
          <span className="scaffold-controls">
            {editing ? (
              <>
                <button className="btn" onClick={cancel}>Cancel</button>
                <button className="btn btn-primary" onClick={save} disabled={!valid}>Save changes</button>
                {canDelete && <button className="btn btn-ghost" title="Delete workspace" onClick={() => setConfirmDelete(true)}><Icon name="close" /> Delete</button>}
              </>
            ) : (
              <>
                <button className="btn" onClick={onActivate}><Icon name="table" /> Open table</button>
                <button className="btn btn-primary" onClick={() => setEditing(true)}><Icon name="edit" /> Edit</button>
              </>
            )}
          </span>
        }
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete workspace?"
        body={<p style={{ margin: 0 }}><strong>{ws.name}</strong> will be removed. Stakeholders stay in the Master pool. This can't be undone.</p>}
        confirmLabel="Yes, delete"
        cancelLabel="Cancel"
        danger
        onConfirm={() => { setConfirmDelete(false); if (onDelete) onDelete(); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

// ── WorkspaceModal - popped-up card for Create or Edit ───────────────
export function WorkspaceModal({ open, mode, ws, users, currentUser, onClose, onSave, segMap }) {
  const D = STAKEHOLDER_DATA;
  const SEG = (segMap && Object.keys(segMap).length) ? segMap : D.SEGMENTS;
  const segments = Object.keys(SEG);

  const blank = {
    name: "",
    segment: "Corporate Functions",
    businessUnit: "Legal / GA&PP",
    scope: "",
    scopeState: "",
    owners: currentUser ? [currentUser.id] : [],
    createdAt: new Date().toISOString().slice(0, 10),
    createdBy: currentUser?.id
  };

  const [draft, setDraft] = useState(blank);
  useEffect(() => {
    if (open) {
      setDraft(mode === "edit" && ws ? { ...ws } : blank);
    }
  }, [open, mode, ws?.id]);

  if (!open) return null;

  const bus = SEG[draft.segment] || [];
  const valid = draft.name.trim().length > 0 && draft.owners.length > 0;

  function submit() {
    if (!valid) return;
    if (mode === "edit") {
      onSave({ name: draft.name, segment: draft.segment, businessUnit: draft.businessUnit, scope: draft.scope, scopeState: draft.scopeState, owners: draft.owners });
    } else {
      onSave({ ...draft, name: draft.name.trim() });
    }
  }

  return (
    <>
      <div className="modal-veil show" onClick={onClose} />
      <div className="modal workspace-modal">
        <div className="modal-head">
          <div className="row" style={{ gap: 10 }}>
            <SegmentBadge segment={draft.segment} small />
            <h2>{mode === "edit" ? "Edit workspace" : "New workspace"}</h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        <div className="modal-body">
          <label className="login-field">
            <span className="lbl">Workspace name</span>
            <input
              autoFocus
              value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              placeholder="e.g. GA&PP - North America"
            />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label className="login-field">
              <span className="lbl">Segment</span>
              <div className="designed-select">
                <select
                  value={draft.segment}
                  onChange={e => {
                    const seg = e.target.value;
                    setDraft(d => ({ ...d, segment: seg, businessUnit: (SEG[seg] || [])[0] || "" }));
                  }}
                >
                  {segments.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </label>
            <label className="login-field">
              <span className="lbl">Business unit</span>
              <div className="designed-select">
                <select
                  value={draft.businessUnit}
                  onChange={e => setDraft(d => ({ ...d, businessUnit: e.target.value }))}
                >
                  {bus.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label className="login-field">
              <span className="lbl">Scope <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></span>
              <div className="designed-select">
                <select value={draft.scope || ""} onChange={e => setDraft(d => ({ ...d, scope: e.target.value, scopeState: e.target.value === "State" ? d.scopeState : "" }))}>
                  <option value="">None</option>
                  <option value="National">National</option>
                  <option value="State">State</option>
                </select>
              </div>
            </label>
            {draft.scope === "State" && (
            <label className="login-field">
              <span className="lbl">State</span>
              <div className="designed-select">
                <select value={draft.scopeState || ""} onChange={e => setDraft(d => ({ ...d, scopeState: e.target.value }))}>
                  <option value="">Select state…</option>
                  {(D.US_STATES || []).map(st => <option key={st} value={st}>{D.STATE_ABBR[st] || st}</option>)}
                </select>
              </div>
            </label>
            )}
          </div>
          <div className="login-field">
            <span className="lbl">Owners</span>
            <span className="muted" style={{ fontSize: 11, marginBottom: 4 }}>
              Add as many people as need ownership. They'll see this workspace in their open tabs.
            </span>
            <MultiOwnerPicker
              users={users}
              owners={draft.owners}
              onChange={(next) => setDraft(d => ({ ...d, owners: next }))}
              size={28}
            />
          </div>
          {mode === "create" && (
            <div className="muted" style={{ fontSize: 11.5, paddingTop: 4, borderTop: "1px solid var(--rule-2)", marginTop: 4 }}>
              Created by <strong style={{ color: "var(--ink-2)" }}>{currentUser?.name}</strong> on {formatCreated(draft.createdAt)}
            </div>
          )}
          {mode === "edit" && ws && (
            <div className="muted" style={{ fontSize: 11.5, paddingTop: 4, borderTop: "1px solid var(--rule-2)", marginTop: 4 }}>
              Created by <strong style={{ color: "var(--ink-2)" }}>{users.find(u => u.id === ws.createdBy)?.name || "-"}</strong> on {formatCreated(ws.createdAt)}
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={!valid}>
            {mode === "edit" ? "Save changes" : "Create workspace"}
          </button>
        </div>
      </div>
    </>
  );
}

export function SegmentBadge({ segment, small }) {
  const map = {
    "Personal Systems":      { bg: "#D9DEE8", fg: "#2E3F66" },
    "Printing":              { bg: "#E5D6DC", fg: "#682E45" },
    "Corporate Investments": { bg: "#D6E2D2", fg: "#2F5A26" },
    "Corporate Functions":   { bg: "#EAE0CB", fg: "#6E5419" }
  };
  const s = map[segment] || map["Corporate Functions"];
  return (
    <span style={{
      background: s.bg, color: s.fg,
      padding: small ? "1px 6px" : "2px 8px",
      borderRadius: 4,
      fontSize: small ? 9.5 : 10,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      fontWeight: 600,
      display: "inline-block",
      whiteSpace: "nowrap"
    }}>
      {segment}
    </span>
  );
}

export function GeographyChip({ value }) {
  const map = {
    "National (all)": { bg: "#E2DFD7", fg: "#3A3528" },
    "Federal":        { bg: "#D5DCEA", fg: "#2A3E66" },
    "State":          { bg: "#E2D9E8", fg: "#4F2D6E" },
    "Local":          { bg: "#DDE7D2", fg: "#34571F" }
  };
  const s = map[value] || map["National (all)"];
  return (
    <span style={{
      background: s.bg, color: s.fg,
      padding: "2px 7px",
      borderRadius: 4,
      fontSize: 10,
      letterSpacing: "0.04em",
      fontWeight: 600,
      display: "inline-block"
    }}>
      {value}
    </span>
  );
}


