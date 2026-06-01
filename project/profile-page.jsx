// profile-page.jsx - user profile: identity header + a tabbed table of
// everything the user is really attached to (workspaces, plans, community,
// stakeholder relationships). Search + Sort + Filter controls sit next to the
// search box (like the List bar). Rows are white, clickable, smart widths.

function ProfilePage({
  user, isSelf, currentUser, users, workspaces, plans, community, stakeholders,
  scores, team, stakeholderWorkspaces, getWorkspacesForStakeholder,
  onEdit, onOpenWorkspace, onOpenPlan, onOpenCommunity, onOpenStakeholder
}) {
  const D = window.STAKEHOLDER_DATA;
  const { useState, useRef, useEffect } = React;
  const [tab, setTab] = useState("ws");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [filters, setFilters] = useState({});      // { colKey: Set(values) }
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  if (!user) return null;

  // ── real derivations ──────────────────────────────────────────────
  const wsName = (id) => (workspaces.find(w => w.id === id) || {}).name || "-";
  function wsMarketsRegions(wid) {
    const mk = new Set(), rg = new Set();
    (stakeholders || []).forEach(s => {
      if ((stakeholderWorkspaces[s.id] || []).includes(wid)) {
        if (s.market) mk.add(s.market); if (s.region) rg.add(s.region);
      }
    });
    return { markets: [...mk], regions: [...rg] };
  }
  const wsAssigned = workspaces.filter(w =>
    (w.owners || []).includes(user.id) ||
    plans.some(pl => pl.workspaceId === w.id && ((pl.owners || []).includes(user.id) || (pl.team || []).some(t => t.userId === user.id)))
  );
  const plansAssigned = plans.filter(pl =>
    (pl.owners || []).includes(user.id) || (pl.team || []).some(t => t.userId === user.id)
  );
  const commAssigned = community.filter(c => (c.owners || []).includes(user.id));
  const shIds = new Set();
  plansAssigned.forEach(pl => (stakeholders || []).forEach(s => {
    if ((stakeholderWorkspaces[s.id] || []).includes(pl.workspaceId)) shIds.add(s.id);
  }));
  const shAssigned = (stakeholders || []).filter(s => shIds.has(s.id));
  function rel(s) { const wc = D.weightedCoord(s.id, scores || {}, team || []); return D.statusFor(wc.x, wc.y); }

  const fnLabel = user.function || "-";
  const TABS = [
    { id: "ws", label: "Workspaces", short: "Workspaces", count: wsAssigned.length },
    { id: "plans", label: "Stakeholder Engagement Plans", short: "SEP", count: plansAssigned.length },
    { id: "comm", label: "Community Engagement", short: "Engage", count: commAssigned.length },
    { id: "sh", label: "Stakeholder Relationships", short: "Relationships", count: shAssigned.length }
  ];

  // Column defs (with smart per-tab widths) + rows.
  let cols, rows, onRowClick, grid;
  if (tab === "ws") {
    cols = [
      { key: "name", label: "Workspace", w: "minmax(180px,1.6fr)" },
      { key: "market", label: "Market", w: "minmax(120px,1fr)", filter: true },
      { key: "region", label: "Region", w: "minmax(120px,1fr)", filter: true },
      { key: "owner", label: "Owner", w: "90px" }
    ];
    rows = wsAssigned.map(w => {
      const mr = wsMarketsRegions(w.id);
      return { id: w.id, name: w.name, market: mr.markets.join(", ") || "-", region: mr.regions.join(", ") || "-", _owners: w.owners || [], _updated: w.updatedAt || w.createdAt || "", _created: w.createdAt || "" };
    });
    onRowClick = (r) => onOpenWorkspace && onOpenWorkspace(r.id);
  } else if (tab === "plans") {
    cols = [
      { key: "name", label: "Plan", w: "minmax(200px,2fr)" },
      { key: "workspace", label: "Workspace", w: "minmax(150px,1.3fr)", filter: true },
      { key: "market", label: "Market", w: "minmax(110px,1fr)", filter: true },
      { key: "region", label: "Region", w: "minmax(110px,1fr)", filter: true },
      { key: "status", label: "Status", w: "120px", filter: true }
    ];
    rows = plansAssigned.map(pl => ({
      id: pl.id, name: pl.title, workspace: wsName(pl.workspaceId),
      market: pl.market || "-", region: pl.region || "-", status: pl.status || "Idea",
      _updated: pl.updatedAt || pl.createdAt || "", _created: pl.createdAt || ""
    }));
    onRowClick = (r) => onOpenPlan && onOpenPlan(r.id);
  } else if (tab === "comm") {
    cols = [
      { key: "name", label: "Engagement", w: "minmax(200px,2fr)" },
      { key: "workspace", label: "Workspace", w: "minmax(150px,1.3fr)", filter: true },
      { key: "market", label: "Market", w: "minmax(110px,1fr)", filter: true },
      { key: "region", label: "Region", w: "minmax(110px,1fr)", filter: true },
      { key: "status", label: "Status", w: "120px", filter: true }
    ];
    rows = commAssigned.map(c => {
      const wsNames = [...new Set((c.linkedStakeholders || []).flatMap(id => stakeholderWorkspaces[id] || []).map(wsName).filter(n => n !== "-"))];
      return { id: c.id, name: c.name, workspace: wsNames.join(", ") || "-", market: (c.markets || []).join(", ") || "-", region: (c.regions || []).join(", ") || "-", status: c.stage || "Idea", _updated: c.updatedAt || c.createdAt || "", _created: c.createdAt || "" };
    });
    onRowClick = (r) => onOpenCommunity && onOpenCommunity(r.id);
  } else {
    cols = [
      { key: "name", label: "Stakeholder", w: "minmax(180px,1.6fr)" },
      { key: "type", label: "Type", w: "minmax(120px,1.1fr)", filter: true },
      { key: "relationship", label: "Relationship", w: "150px", filter: true },
      { key: "priority", label: "Priority", w: "110px", filter: true }
    ];
    rows = shAssigned.map(s => ({
      id: s.id, name: window.displayName ? (window.displayName(s) || s.name) : s.name,
      type: s.type, relationship: rel(s), priority: s.priority, _s: s,
      _updated: s.updatedAt || s.lastContact || s.createdAt || "", _created: s.createdAt || ""
    }));
    onRowClick = (r) => onOpenStakeholder && onOpenStakeholder(r.id);
  }
  grid = cols.map(c => c.w).join(" ");
  const filterCols = cols.filter(c => c.filter);
  // Sortable fields + their type (drives asc/desc labels). Owner is excluded.
  const sortFields = [
    ...cols.filter(c => c.key !== "owner").map(c => ({
      key: c.key, label: c.label,
      type: (c.key === "status" || c.key === "priority" || c.key === "relationship") ? "text" : "text"
    })),
    { key: "_updated", label: "Last updated", type: "date" },
    { key: "_created", label: "Date added", type: "date" }
  ];

  // search + filter + sort
  const ql = q.toLowerCase();
  let view = rows;
  if (ql) view = view.filter(r => cols.some(c => (r[c.key] || "").toString().toLowerCase().includes(ql)));
  Object.entries(filters).forEach(([k, set]) => {
    if (set && set.size) view = view.filter(r => set.has((r[k] || "").toString()));
  });
  if (sort.key) {
    view = [...view].sort((a, b) => {
      const av = (a[sort.key] || "").toString().toLowerCase(), bv = (b[sort.key] || "").toString().toLowerCase();
      return (av < bv ? -1 : av > bv ? 1 : 0) * (sort.dir === "asc" ? 1 : -1);
    });
  }
  const activeFilterCount = Object.values(filters).reduce((n, s) => n + (s ? s.size : 0), 0);
  function toggleFilter(col, val) {
    setFilters(prev => {
      const cur = new Set(prev[col] || []);
      cur.has(val) ? cur.delete(val) : cur.add(val);
      return { ...prev, [col]: cur };
    });
  }
  function distinctVals(key) {
    return [...new Set(rows.map(r => (r[key] || "").toString()).filter(Boolean))].sort();
  }

  function resetView() { setSort({ key: null, dir: "asc" }); setFilters({}); setQ(""); }

  return (
    <div className="single-page">
          <header className="profile-hero">
            <Avatar user={user} size={64} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="profile-name">{user.name}</div>
              <div className="profile-sub">{user.title || "Team member"}</div>
              <div className="profile-meta">
                <span>{user.email}</span>
                {user.role === "manager" && <ManagerBadge />}
              </div>
            </div>
            {isSelf && <button className="btn btn-primary" onClick={onEdit}><Icon name="edit" /> Edit profile</button>}
          </header>

          <div className="profile-info-grid">
            <div className="profile-info"><span className="lbl">Function</span><span className="profile-info-v">{fnLabel}</span></div>
            <div className="profile-info"><span className="lbl">Markets</span><span className="profile-tags">{(user.markets || []).length ? user.markets.map(m => <span key={m} className="tag">{m}</span>) : <span className="muted">-</span>}</span></div>
            <div className="profile-info"><span className="lbl">Regions</span><span className="profile-tags">{(user.regions || []).length ? user.regions.map(r => <span key={r} className="tag">{r}</span>) : <span className="muted">-</span>}</span></div>
          </div>

          <div className="profile-tabs">
            {TABS.map(t => (
              <button key={t.id} className={"profile-tab" + (tab === t.id ? " active" : "")} onClick={() => { setTab(t.id); resetView(); }}>
                <span className="tab-long">{t.label}</span><span className="tab-short">{t.short}</span> <span className="profile-tab-count">{t.count}</span>
              </button>
            ))}
          </div>

          {/* Search · Filter · Sort (Filter before Sort, like the List bar) */}
          <div className="profile-controls">
            <div className="search"><Icon name="search" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" /><span className="kbd kbd-cmdk">{window.cmdKeyLabel}</span></div>
            <div className="filter-button-wrap">
              <button className={"btn" + (activeFilterCount ? " filter-active" : "")} onClick={() => { setFilterOpen(o => !o); setSortOpen(false); }}>
                <Icon name="filter" /> Filter{activeFilterCount ? ` (${activeFilterCount})` : ""}
              </button>
              {filterOpen && (
                <div className="filter-popover" onMouseLeave={() => setFilterOpen(false)}>
                  <div className="filter-pop-head"><strong>Filter</strong><button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setFilters({})}>Clear all</button></div>
                  <div className="filter-pop-body">
                    {filterCols.length === 0 && <p className="muted" style={{ fontSize: 12, margin: 0 }}>No filters for this view.</p>}
                    {filterCols.map(c => (
                      <FilterSection
                        key={c.key}
                        label={c.label}
                        values={distinctVals(c.key)}
                        active={[...(filters[c.key] || [])]}
                        onToggle={(v) => toggleFilter(c.key, v)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="filter-button-wrap">
              <button className={"btn" + (sort.key ? " filter-active" : "")} onClick={() => { setSortOpen(o => !o); setFilterOpen(false); }}><Icon name="sort" /> Sort</button>
              {sortOpen && (
                <div className="filter-popover sort-popover" onMouseLeave={() => setSortOpen(false)}>
                  <div className="filter-pop-head"><strong>Sort by</strong><button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setSort({ key: null, dir: "asc" })}>Clear all</button></div>
                  <div className="filter-pop-body">
                    <SortFieldList fields={sortFields} sortKey={sort.key} sortDir={sort.dir} onSet={(k, d) => setSort({ key: k, dir: d })} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          {tab === "sh" ? (
            <div className="plan-sh-table" style={{ overflow: "visible" }}>
              <div className="plan-sh-thead"><span>Stakeholder</span><span>Type</span><span>Relationship</span><span>Priority</span></div>
              {view.length === 0 && <div className="profile-empty muted">No stakeholder relationships.</div>}
              {view.map(r => (
                <div className="plan-sh-trow" key={r.id} onClick={() => onRowClick(r)} title="Open stakeholder">
                  <span className="plan-sh-name">{r.name}</span>
                  <span className="muted">{r.type}</span>
                  <span><StatusPill status={r.relationship} /></span>
                  <span><PriorityPill value={r.priority} /></span>
                </div>
              ))}
            </div>
          ) : (
            <div className="profile-table">
              <div className="profile-trow profile-thead" style={{ gridTemplateColumns: grid }}>
                {cols.map(c => <span key={c.key} className="profile-th-label">{c.label}</span>)}
              </div>
              {view.length === 0 && <div className="profile-empty muted">Nothing here yet.</div>}
              {view.map(r => (
                <div className="profile-trow" key={r.id} onClick={() => onRowClick(r)} style={{ gridTemplateColumns: grid, cursor: "pointer" }} title="Open">
                  {cols.map(c => (
                    <span key={c.key} className="profile-td">
                      {c.key === "owner" ? <OwnersDisplay users={users} owners={r._owners} size={22} />
                        : c.key === "status" ? <span className="comm-stage-text" style={{ color: (window.PLAN_STAGE_FG && window.PLAN_STAGE_FG[r.status]) || "var(--ink-2)" }}>{r.status}</span>
                        : r[c.key]}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
    </div>
  );
}

Object.assign(window, { ProfilePage });
