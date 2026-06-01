// Sheet tab - CSS-grid spreadsheet, no <table>.

// Frozen columns (always first, sticky-left, not reorderable).
// Fixed pixel widths so cumulative sticky offsets are deterministic.
const FROZEN_COLS = [
  { key: "idx",  label: "",            width: 38,  field: null,   cls: "idx" },
  { key: "edit", label: "",             width: 34,  field: null,   cls: "edit" },
  { key: "name", label: "Stakeholder",  width: 240, field: "name" },
  { key: "org",  label: "Organization", width: 200, field: "org" }
];

// Reorderable columns (default order; user can drag to rearrange).
const REORDER_COLS = [
  { key: "category",    label: "Category",      width: "max-content", field: "category" },
  { key: "type",        label: "Type",          width: "max-content", field: "type" },
  { key: "market",      label: "Market",        width: "max-content", field: "market" },
  { key: "region",      label: "Region",        width: "max-content", field: "region" },
  { key: "geography",   label: "Geography",     width: "max-content", field: "geography" },
  { key: "state",       label: "State/Prov.",   width: "max-content", field: "state" },
  { key: "site",        label: "Sites",         width: "max-content", field: "site" },
  { key: "issues",      label: "Issues",        width: "max-content", field: null },
  { key: "priority",    label: "Priority",      width: "max-content", field: "priority" },
  { key: "_x",          label: "x",             width: "max-content", field: "_x", cls: "coord" },
  { key: "_y",          label: "y",             width: "max-content", field: "_y", cls: "coord" },
  { key: "_status",     label: "Relationship",  width: "max-content", field: "_status" },
  { key: "tags",        label: "Tags",          width: "max-content", field: null },
  { key: "owner",       label: "Owner",         width: "max-content", field: "owner" },
  { key: "email",       label: "Email",         width: "max-content", field: "email" },
  { key: "phone",       label: "Phone",         width: "max-content", field: "phone" },
  { key: "xAccount",    label: "X account",     width: "max-content", field: "xAccount" },
  { key: "lastContact", label: "Last contact",  width: "max-content", field: "lastContact" },
  { key: "status",      label: "Status",        width: "max-content", field: "status" },
  { key: "notes",       label: "Notes",         width: "max-content", field: "notes" },
  { key: "url",         label: "Website",       width: "max-content", field: "url" },
  { key: "community",   label: "Community investment", width: "max-content", field: null }
];
const REORDER_COL_MAP = Object.fromEntries(REORDER_COLS.map(c => [c.key, c]));

// Relationship bands (static).
const BAND_STATUSES = {
  positive: ["Cooperate","Collaborate","Valuable Relationship","High Value Relationship","Strategic Partner"],
  middle:   ["Monitor","Maintain","Connect","Commit"],
  negative: ["Proactively Defend","Defend","Protect","Respond","Identify"]
};

// Cumulative left offsets for the frozen columns (sticky positioning).
const FROZEN_LEFT = (() => {
  let acc = 0; const m = {};
  for (const c of FROZEN_COLS) { m[c.key] = acc; acc += c.width; }
  return m;
})();
const FROZEN_TOTAL = FROZEN_COLS.reduce((s, c) => s + c.width, 0);

function SheetView({ explainerSlot, addNonce, addNonceFor, stakeholders, scores, team, updateStakeholder, openDetail, selectedId, setSelectedId, workspaceLabel, isMaster, getWorkspacesForStakeholder, workspaces, users, addStakeholder, openStakeholderId, onConsumeOpen, currentUser, companyIssues, community, updateCommunityApp, onOpenWorkspace }) {
  const { CATEGORIES, weightedCoord, statusFor, STATUS_ORDER } = window.STAKEHOLDER_DATA;
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState([]);   // selected categories (empty = all)
  const [catOpen, setCatOpen] = useState(false);
  const [siteFilter, setSiteFilter] = useState([]); // selected sites (empty = all)
  const [siteOpen, setSiteOpen] = useState(false);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [newOpen, setNewOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  useEffect(() => {
    if (addNonceFor === "sheet" && addNonce) setNewOpen(true);
  }, [addNonce]);
  useEffect(() => {
    if (openStakeholderId) { setEditId(openStakeholderId); onConsumeOpen && onConsumeOpen(); }
  }, [openStakeholderId]);
  const [notesId, setNotesId] = useState(null);
  const [filterPopOpen, setFilterPopOpen] = useState(false);
  const [sortPopOpen, setSortPopOpen] = useState(false);
  // Advanced filters: each is an array of values to match (OR within field,
  // AND across fields). Empty array means no filter on that field.
  const [filters, setFilters] = useState({
    type: [], priority: [], status: [], owners: [], issues: [], zone: []
  });
  const [bandFilter, setBandFilter] = useState([]); // 'positive' | 'middle' | 'negative'
  // Column order (reorderable columns only). Persisted per user.
  const [colOrder, setColOrder] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("hp_map_col_order_v3") || "null");
      if (Array.isArray(saved)) {
        // keep only known keys, append any new ones not in saved
        const known = saved.filter(k => REORDER_COL_MAP[k]);
        const missing = REORDER_COLS.map(c => c.key).filter(k => !known.includes(k));
        return [...known, ...missing];
      }
    } catch {}
    return REORDER_COLS.map(c => c.key);
  });
  const [dragKey, setDragKey] = useState(null);
  const [dragOverKey, setDragOverKey] = useState(null);

  function persistColOrder(next) {
    setColOrder(next);
    try { localStorage.setItem("hp_map_col_order_v3", JSON.stringify(next)); } catch {}
  }
  function onColDrop(targetKey) {
    if (!dragKey || dragKey === targetKey) { setDragKey(null); setDragOverKey(null); return; }
    const next = colOrder.filter(k => k !== dragKey);
    const idx = next.indexOf(targetKey);
    next.splice(idx, 0, dragKey);
    persistColOrder(next);
    setDragKey(null);
    setDragOverKey(null);
  }

  const orderedReorder = colOrder.map(k => REORDER_COL_MAP[k]).filter(Boolean);
  const editing = editId ? stakeholders.find(s => s.id === editId) : null;
  const notesFor = notesId ? stakeholders.find(s => s.id === notesId) : null;
  const activeFilterCount =
    Object.values(filters).reduce((n, list) => n + list.length, 0);

  function toggleFilter(field, value) {
    setFilters(prev => {
      const list = prev[field] || [];
      const next = list.includes(value) ? list.filter(v => v !== value) : [...list, value];
      return { ...prev, [field]: next };
    });
  }
  function clearAllFilters() {
    setCatFilter([]);
    setFilters({ type: [], priority: [], status: [], owners: [], issues: [], zone: [] });
  }
  function toggleCat(c) {
    setCatFilter(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }
  function toggleSite(s) {
    setSiteFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  // derive computed rows
  const rows = useMemo(() => {
    return stakeholders.map(s => {
      const { x, y } = weightedCoord(s.id, scores, team);
      // "Unscored" if no team member has scored this stakeholder yet
      const teamScores = scores[s.id] || {};
      const unscored = team.length > 0 && !team.some(m => teamScores[m.id]);
      return { ...s, _x: x, _y: y, _status: statusFor(x, y), _unscored: unscored };
    });
  }, [stakeholders, scores, team]);

  const frozenCols = [
    { key: "idx",  label: "",            width: 40,  field: null, cls: "idx" },
    { key: "edit", label: "",             width: 34,  field: null, cls: "edit" },
    { key: "name", label: "Stakeholder",  width: 220, field: "name" },
    { key: "org",  label: "Organization", width: 190, field: "org" },
  ];
  const frozenLeftStatic = (() => { let a = 0; const m = {}; for (const c of frozenCols) { m[c.key] = a; a += c.width; } return m; })();
  const gridRef = useRef(null);
  // Frozen columns auto-size to content (max-content); their sticky left
  // offsets are measured from the rendered header cells after layout.
  const [frozenLeft, setFrozenLeft] = useState({ idx: 0, edit: 0, name: 0, org: 0 });
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cells = grid.querySelectorAll(".sheet-head .sheet-cell.frozen");
    let acc = 0; const next = {};
    cells.forEach(cell => {
      const key = [...cell.classList].find(c => c.startsWith("frozen-"));
      if (key) next[key.replace("frozen-", "")] = acc;
      acc += cell.getBoundingClientRect().width;
    });
    setFrozenLeft(prev => {
      const changed = ["idx","edit","name","org"].some(k => prev[k] !== next[k]);
      return changed ? next : prev;
    });
  });

  const gridTemplate = [
    ...frozenCols.map(c => "max-content"),
    ...orderedReorder.map(c => "max-content")
  ].join(" ");

  const filtered = useMemo(() => {
    let out = rows;
    if (catFilter.length) out = out.filter(r => catFilter.includes(r.category));
    if (siteFilter.length) out = out.filter(r => siteFilter.includes(r.site));
    if (filters.type.length)     out = out.filter(r => filters.type.includes(r.type));
    if (filters.priority.length) out = out.filter(r => filters.priority.includes(r.priority));
    if (filters.status.length)   out = out.filter(r => filters.status.includes(r.status));
    if (filters.zone.length)     out = out.filter(r => filters.zone.includes(r._status));
    if (filters.owners.length)   out = out.filter(r => (r.owners || []).some(o => filters.owners.includes(o)));
    if (filters.issues.length)   out = out.filter(r => (r.issues || []).some(i => filters.issues.includes(i)));
    if (bandFilter.length) {
      const allowed = new Set(bandFilter.flatMap(b => BAND_STATUSES[b]));
      out = out.filter(r => allowed.has(r._status));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(r =>
        (window.displayName(r) || "").toLowerCase().includes(q) ||
        (r.name || "").toLowerCase().includes(q) ||
        r.org.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        (r.notes || "").toLowerCase().includes(q) ||
        (r.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      out = [...out].sort((a, b) => {
        let av = a[sortKey], bv = b[sortKey];
        // Custom resolvers for derived/sortable fields
        if (sortKey === "name")     { av = window.displayName(a) || a.name || ""; bv = window.displayName(b) || b.name || ""; }
        if (sortKey === "priority") { const order = { High: 0, Medium: 1, Low: 2 }; av = order[a.priority] ?? 9; bv = order[b.priority] ?? 9; }
        if (sortKey === "status")   { const order = { Active: 0, Watch: 1, Dormant: 2 }; av = order[a.status] ?? 9; bv = order[b.status] ?? 9; }
        if (sortKey === "site")     { av = window.STAKEHOLDER_DATA.siteLabel((window.STAKEHOLDER_DATA.SITES||[]).find(s=>s.id===a.site)); bv = window.STAKEHOLDER_DATA.siteLabel((window.STAKEHOLDER_DATA.SITES||[]).find(s=>s.id===b.site)); }
        let cmp = 0;
        if (typeof av === "number") cmp = av - bv;
        else cmp = String(av || "").localeCompare(String(bv || ""));
        return sortDir === "asc" ? cmp : -cmp;
      });
    } else {
      // default sort: unscored first, then by recency of last contact
      out = [...out].sort((a, b) => {
        if (a._unscored !== b._unscored) return a._unscored ? -1 : 1;
        return (b.lastContact || "").localeCompare(a.lastContact || "");
      });
    }
    return out;
  }, [rows, catFilter, siteFilter, search, sortKey, sortDir, filters, bandFilter]);

  // Aggregate available filter values from the rows themselves so filter
  // panels only show options that actually appear in this workspace.
  const filterOptions = useMemo(() => {
    const set = (key, accessor) => {
      const s = new Set();
      rows.forEach(r => {
        const v = accessor(r);
        if (Array.isArray(v)) v.forEach(x => x && s.add(x));
        else if (v) s.add(v);
      });
      return [...s].sort();
    };
    return {
      type:     set("type",     r => r.type),
      priority: ["High", "Medium", "Low"],
      status:   ["Active", "Watch", "Dormant"],
      owners:   set("owners",   r => r.owners || []),
      issues:   set("issues",   r => r.issues || []),
      zone:     STATUS_ORDER.filter(z => rows.some(r => r._status === z))
    };
  }, [rows]);

  // Sortable columns shown in the Sort popover.
  const sortableFields = [
    { key: "name",        label: "Stakeholder" },
    { key: "org",         label: "Organization" },
    { key: "type",        label: "Audience type" },
    { key: "market",      label: "Market" },
    { key: "region",      label: "Region" },
    { key: "state",       label: "State/Prov." },
    { key: "site",        label: "Sites" },
    { key: "lastContact", label: "Last contact" },
    { key: "updatedAt",   label: "Last updated" },
    { key: "createdAt",   label: "Date added" },
    { key: "_status",     label: "Relationship" }
  ];

  const countByStatus = useMemo(() => {
    const m = {};
    rows.forEach(r => { m[r._status] = (m[r._status] || 0) + 1; });
    return m;
  }, [rows]);

  const positive = BAND_STATUSES.positive;
  const negative = BAND_STATUSES.negative;
  const middle   = BAND_STATUSES.middle;
  const sum = (keys) => keys.reduce((s, k) => s + (countByStatus[k] || 0), 0);
  function toggleBand(b) {
    setBandFilter(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  }

  function exportCsv() {
    const cols = [
      ["Stakeholder", r => window.displayName(r) || r.name || ""],
      ["Organization", r => r.org || ""],
      ["Category", r => r.category || ""],
      ["Type", r => r.type || ""],
      ["Market", r => r.market || ""],
      ["Region", r => r.region || ""],
      ["Geography", r => r.geography || ""],
      ["Issues", r => (r.issues || []).join("; ")],
      ["Priority", r => r.priority || ""],
      ["Tags", r => (r.tags || []).join("; ")],
      ["Owners", r => (r.owners || []).map(id => (users.find(u => u.id === id) || {}).name || id).join("; ")],
      ["Last contact", r => r.lastContact || ""],
      ["Status", r => r.status || ""],
      ["x", r => r._x.toFixed(1)],
      ["y", r => r._y.toFixed(1)],
      ["Relationship", r => r._status || ""],
      ["Website", r => r.url ? window.normalizeUrl(r.url) : ""],
      ["Notes", r => r.notes || ""]
    ];
    const esc = (v) => {
      const s = String(v == null ? "" : v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const lines = [cols.map(c => esc(c[0])).join(",")];
    filtered.forEach(r => lines.push(cols.map(c => esc(c[1](r))).join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (workspaceLabel || "stakeholders").replace(/[^\w-]+/g, "_") + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function toggleSort(k) {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  }

  const HeadCell = ({ field, label, className = "" }) => (
    <div className={"sheet-cell " + className} onClick={() => field && toggleSort(field)}>
      <span>{label}</span>
      {sortKey === field && <span className="sort-indicator">{sortDir === "asc" ? "↑" : "↓"}</span>}
    </div>
  );

  return (
    <div className="sheet-wrap">
      {explainerSlot && ReactDOM.createPortal(
      <div className="sheet-toolbar">
        <div className="search">
          <Icon name="search" />
          <input
            placeholder="Search stakeholders, orgs, tags…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="kbd kbd-cmdk">{window.cmdKeyLabel}</span>
        </div>

        <div className="filter-button-wrap">
          <button className={"btn" + (activeFilterCount ? " filter-active" : "")} onClick={() => { setFilterPopOpen(o => !o); setSortPopOpen(false); setCatOpen(false); }}>
            Filter
            {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
          </button>
          {filterPopOpen && (
            <FilterPopover
              filters={filters}
              options={filterOptions}
              users={users}
              onToggle={toggleFilter}
              onClear={clearAllFilters}
              onClose={() => setFilterPopOpen(false)}
            />
          )}
        </div>
        <div className="filter-button-wrap">
          <button className={"btn" + (sortKey ? " filter-active" : "")} onClick={() => { setSortPopOpen(o => !o); setFilterPopOpen(false); setCatOpen(false); }}>
            Sort
            {sortKey && <span className="filter-count">1</span>}
          </button>
          {sortPopOpen && (
            <SortPopover
              fields={sortableFields}
              sortKey={sortKey}
              sortDir={sortDir}
              setSortKey={setSortKey}
              setSortDir={setSortDir}
              onClear={() => { setSortKey(null); setSortDir("asc"); }}
              onClose={() => setSortPopOpen(false)}
            />
          )}
        </div>

        <div className="filter-button-wrap">
          <button className={"btn" + (catFilter.length ? " filter-active" : "")} onClick={() => { setCatOpen(o => !o); setFilterPopOpen(false); setSortPopOpen(false); }}>
            Categories
            {catFilter.length > 0 && <span className="filter-count">{catFilter.length}</span>}
          </button>
          {catOpen && (
            <div className="filter-popover" style={{ width: 220 }} onMouseLeave={() => setCatOpen(false)}>
              <div className="filter-pop-head"><strong>Categories</strong><button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setCatFilter([])}>Clear all</button></div>
              <div className="filter-pop-body">
                <div className="cat-opt-list">
                  {Object.keys(CATEGORIES).map(c => {
                    const on = catFilter.includes(c);
                    return (
                      <button key={c} type="button" className={"cat-opt" + (on ? " on" : "")} onClick={() => toggleCat(c)}>
                        <Icon name="check" className="ico cat-check" />
                        <span>{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="filter-button-wrap">
          <button className={"btn" + (siteFilter.length ? " filter-active" : "")} onClick={() => { setSiteOpen(o => !o); setCatOpen(false); setFilterPopOpen(false); setSortPopOpen(false); }}>
            Sites
            {siteFilter.length > 0 && <span className="filter-count">{siteFilter.length}</span>}
          </button>
          {siteOpen && (
            <div className="filter-popover" style={{ width: 220 }} onMouseLeave={() => setSiteOpen(false)}>
              <div className="filter-pop-head"><strong>Sites</strong><button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setSiteFilter([])}>Clear all</button></div>
              <div className="filter-pop-body">
                <div className="cat-opt-list">
                  {(window.STAKEHOLDER_DATA.SITES || []).map(s => {
                    const on = siteFilter.includes(s.id);
                    return (
                      <button key={s.id} type="button" className={"cat-opt" + (on ? " on" : "")} onClick={() => toggleSite(s.id)}>
                        <Icon name="check" className="ico cat-check" />
                        <span>{window.STAKEHOLDER_DATA.siteLabel(s)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="spacer" />

        <button
          type="button"
          className={"impact-chip" + (bandFilter.includes("positive") ? " on pos" : "")}
          onClick={() => toggleBand("positive")}
        ><span className="swatch" style={{ background: "var(--pos)" }} /> <strong>{sum(positive)}</strong> Positive impact</button>
        <button
          type="button"
          className={"impact-chip" + (bandFilter.includes("middle") ? " on neu" : "")}
          onClick={() => toggleBand("middle")}
        ><span className="swatch" style={{ background: "#E2A85F" }} /> <strong>{sum(middle)}</strong> Winnable middle</button>
        <button
          type="button"
          className={"impact-chip" + (bandFilter.includes("negative") ? " on neg" : "")}
          onClick={() => toggleBand("negative")}
        ><span className="swatch" style={{ background: "var(--neg)" }} /> <strong>{sum(negative)}</strong> Negative impact</button>
      </div>, explainerSlot)}

      {newOpen && (
        <StakeholderModal
          users={users}
          workspaces={workspaces}
          isMaster={isMaster}
          currentUser={currentUser}
          existing={null}
          companyIssues={companyIssues}
          community={community}
          stakeholders={stakeholders}
          onCancel={() => setNewOpen(false)}
          onSubmit={(data) => { addStakeholder(data); setNewOpen(false); }}
        />
      )}
      {editing && (
        <StakeholderModal
          users={users}
          workspaces={workspaces}
          isMaster={isMaster}
          currentUser={currentUser}
          existing={editing}
          companyIssues={companyIssues}
          community={community}
          stakeholders={stakeholders}
          scores={scores}
          team={team}
          getWorkspacesForStakeholder={getWorkspacesForStakeholder}
          updateCommunityApp={updateCommunityApp}
          onOpenWorkspace={onOpenWorkspace}
          onCancel={() => setEditId(null)}
          onSubmit={(patch) => { updateStakeholder(editing.id, patch); setEditId(null); }}
        />
      )}
      {notesFor && (
        <NotesModal
          stakeholder={notesFor}
          users={users}
          currentUser={currentUser}
          onClose={() => setNotesId(null)}
          onAdd={(text) => {
            const entry = { id: window.uid("n"), body: text, at: new Date().toISOString(), by: currentUser.id };
            const history = [...(notesFor.notesHistory || []), entry];
            updateStakeholder(notesFor.id, { notesHistory: history, notes: text });
          }}
        />
      )}

      <div
        className="sheet-scroll"
        ref={el => {
          if (!el || el._scrollBound) return;
          el._scrollBound = true;
          el.addEventListener("scroll", () => {
            el.classList.toggle("scrolled-x", el.scrollLeft > 0);
          });
        }}
      >
        <div className="sheet-grid" ref={gridRef} style={{ gridTemplateColumns: gridTemplate, minWidth: "max-content" }}>
          {/* Header */}
          <div className="sheet-head">
            {frozenCols.map(c => (
              <div
                key={c.key}
                className={"sheet-cell frozen frozen-" + c.key + (c.cls ? " " + c.cls : "")}
                style={{ left: frozenLeft[c.key] + "px" }}
                onClick={() => c.field && toggleSort(c.field)}
              >
                <span>{c.label}</span>
                {c.field && sortKey === c.field && <span className="sort-indicator">{sortDir === "asc" ? "↑" : "↓"}</span>}
              </div>
            ))}
            {orderedReorder.map(c => (
              <div
                key={c.key}
                className={"sheet-cell col-draggable" + (c.cls ? " " + c.cls : "") + (dragOverKey === c.key ? " drag-over" : "") + (dragKey === c.key ? " dragging" : "")}
                draggable
                onDragStart={() => setDragKey(c.key)}
                onDragOver={(e) => { e.preventDefault(); setDragOverKey(c.key); }}
                onDragLeave={() => setDragOverKey(k => k === c.key ? null : k)}
                onDrop={() => onColDrop(c.key)}
                onDragEnd={() => { setDragKey(null); setDragOverKey(null); }}
                onClick={() => c.field && toggleSort(c.field)}
                title="Drag to reorder"
              >
                <Icon name="drag" className="ico col-grip" />
                <span>{c.label}</span>
                {c.field && sortKey === c.field && <span className="sort-indicator">{sortDir === "asc" ? "↑" : "↓"}</span>}
              </div>
            ))}
          </div>

          {/* Body */}
          {filtered.map((row, i) => (
            <SheetRow
              key={row.id}
              row={row}
              index={i}
              frozenLeft={frozenLeft}
              columns={orderedReorder}
              selected={selectedId === row.id}
              onSelect={() => setSelectedId(row.id)}
              onOpenDetail={() => setEditId(row.id)}
              onOpenNotes={() => setNotesId(row.id)}
              update={(patch) => updateStakeholder(row.id, patch)}
              isMaster={isMaster}
              getWorkspacesForStakeholder={getWorkspacesForStakeholder}
              workspaces={workspaces}
              users={users}
              community={community}
            />
          ))}
        </div>
      </div>

      <div className="sheet-footer">
        <div className="group">
          <Icon name="table" />
          <strong style={{ color: "var(--ink)" }}>{filtered.length}</strong> of {rows.length} stakeholders
        </div>
        <div className="group">·</div>
        <div className="group">
          Avg <span className="kbd" style={{ fontFamily: "var(--mono)" }}>x</span>
          <strong style={{ color: "var(--ink)", fontFamily: "var(--mono)" }}>
            {(filtered.reduce((s,r)=>s+r._x,0) / Math.max(filtered.length,1)).toFixed(1)}
          </strong>
        </div>
        <div className="group">
          Avg <span className="kbd" style={{ fontFamily: "var(--mono)" }}>y</span>
          <strong style={{ color: "var(--ink)", fontFamily: "var(--mono)" }}>
            {(filtered.reduce((s,r)=>s+r._y,0) / Math.max(filtered.length,1)).toFixed(1)}
          </strong>
        </div>
        <div className="spacer" style={{ flex: 1 }} />
        <div className="group">
          <button className="footer-export-btn" onClick={exportCsv}>
            <Icon name="download" /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}

function SheetRow({ row, index, frozenLeft, columns, selected, onSelect, onOpenDetail, onOpenNotes, update, isMaster, getWorkspacesForStakeholder, workspaces, users, community }) {
  const { CATEGORIES } = window.STAKEHOLDER_DATA;
  const types = CATEGORIES[row.category] || [];
  function setField(k, v) { update({ [k]: v }); }
  const coordTone = (v) => v > 1 ? "positive" : v < -1 ? "negative" : "";

  function renderCell(key) {
    switch (key) {
      case "category":
        return (
          <CellSelect value={row.category} options={Object.keys(CATEGORIES)}
            onChange={nc => update({ category: nc, type: (CATEGORIES[nc] || [])[0] || "" })} />
        );
      case "type":
        return <CellSelect value={row.type} options={types} onChange={v => setField("type", v)} />;
      case "market":
        return (
          <CellSelect value={row.market} options={Object.keys(window.STAKEHOLDER_DATA.MARKETS)}
            onChange={m => update({ market: m, region: (window.STAKEHOLDER_DATA.MARKETS[m] || [])[0] || "" })} />
        );
      case "region":
        return <CellSelect value={row.region} options={window.STAKEHOLDER_DATA.MARKETS[row.market] || []} onChange={v => setField("region", v)} />;
      case "geography":
        return <CellSelect value={row.geography} options={window.STAKEHOLDER_DATA.GEOGRAPHIES} onChange={v => setField("geography", v)} />;
      case "state": {
        const D2 = window.STAKEHOLDER_DATA;
        return <CellSelect value={row.state || ""} placeholder="-" options={D2.US_STATES || []} onChange={v => setField("state", v)} />;
      }
      case "site": {
        const D2 = window.STAKEHOLDER_DATA;
        return (
          <CellSelect value={row.site || ""} placeholder="-"
            options={(D2.SITES || []).map(s => ({ value: s.id, label: D2.siteLabel(s) }))}
            onChange={id => { const s = (D2.SITES || []).find(x => x.id === id); update(s && s.state ? { site: id, state: s.state } : { site: id }); }} />
        );
      }
      case "issues":  return <Tags values={row.issues} />;
      case "priority": return <PriorityPill value={row.priority} />;
      case "tags":    return <Tags values={row.tags} />;
      case "owner":   return <OwnersDisplay users={users || []} owners={row.owners || []} size={20} />;
      case "email":
        return row.email
          ? <a className="plain-link" href={"mailto:" + row.email} onClick={(e) => e.stopPropagation()}>{row.email}</a>
          : <span className="muted">-</span>;
      case "phone":
        return row.phone
          ? <a className="plain-link" href={"tel:" + row.phone.replace(/[^\d+]/g, "")} onClick={(e) => e.stopPropagation()}>{window.formatPhone(row.phone)}</a>
          : <span className="muted">-</span>;
      case "xAccount": {
        if (!row.xAccount) return <span className="muted">-</span>;
        const handle = row.xAccount.replace(/^@+/, "");
        return <a className="plain-link" href={"https://x.com/" + handle} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>@{handle}</a>;
      }
      case "lastContact":
        return <CellDate value={row.lastContact} onChange={v => setField("lastContact", v)} />;
      case "status":
        return <CellSelect value={row.status} options={["Active","Watch","Dormant"]} onChange={v => setField("status", v)} />;
      case "_x": return row._x.toFixed(1);
      case "_y": return row._y.toFixed(1);
      case "_status": return <StatusPill status={row._status} />;
      case "notes":
        return <span className="notes-preview">{row.notes}</span>;
      case "url":
        return row.url
          ? <a href={normalizeUrl(row.url)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Visit Website</a>
          : <span className="muted">-</span>;
      case "community": {
        const affil = window.affiliatedCommunity ? window.affiliatedCommunity(row.id, community) : [];
        if (!affil.length) return <span className="muted">-</span>;
        return <span className="pills-inline">{affil.map(a => <span key={a.id} className="tag" title={a.name}>{a.name}</span>)}</span>;
      }
      default: return null;
    }
  }

  function cellClass(c) {
    let cls = "sheet-cell";
    if (c.key === "issues" || c.key === "tags" || c.key === "community") cls += " pills-cell";
    if (c.key === "_x" || c.key === "_y") cls += " coord readonly " + coordTone(row[c.key]);
    if (c.key === "_status") cls += " zone-cell";
    if (c.key === "notes") cls += " notes";
    if (c.key === "url") cls += " url-cell";
    if (c.key === "email" || c.key === "phone" || c.key === "xAccount") cls += " url-cell";
    if (["email","phone","xAccount","lastContact","status","notes"].includes(c.key)) cls += " cell-dim";
    if (["category","type","market","region","geography","state","site"].includes(c.key)) cls += " cell-strong";
    if (["phone","lastContact"].includes(c.key)) cls += " cell-sm";
    return cls;
  }

  return (
    <div className={"sheet-row" + (selected ? " selected" : "")} onClick={onSelect}>
      <div className="sheet-cell frozen frozen-idx idx" style={{ left: frozenLeft.idx }}>{index + 1}</div>
      <div className="sheet-cell frozen frozen-edit edit" style={{ left: frozenLeft.edit }} onClick={(e) => { e.stopPropagation(); onOpenDetail(); }} title={row.isPerson ? "Edit person" : "Edit organization"}>
        <Icon name={row.isPerson ? "user" : "users"} className="ico edit-icon" />
      </div>
      <div className="sheet-cell frozen frozen-name" style={{ left: frozenLeft.name }} onDoubleClick={onOpenDetail}>
        {displayName(row) || "-"}
      </div>
      <div className="sheet-cell frozen frozen-org" style={{ left: frozenLeft.org }}>
        <input
          className="cell-input"
          value={row.org}
          onChange={e => {
            const org = e.target.value;
            // For organizations (not people), the stakeholder name mirrors
            // the org. For people, the composed name is left untouched.
            update(row.isPerson ? { org } : { org, name: org });
          }}
        />
      </div>
      {columns.map(c => (
        <div
          key={c.key}
          className={cellClass(c)}
          onClick={c.key === "notes" ? (e) => { e.stopPropagation(); onOpenNotes(); } : undefined}
          title={c.key === "notes" ? "Click to view notes & history" : undefined}
          style={c.key === "notes" ? { cursor: "pointer" } : undefined}
        >
          {renderCell(c.key)}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { SheetView });

// ── CellSelect — the ONE designed dropdown for table cells (no native) ──
// Renders the selected value as intrinsic-width text (so autofit works) and
// opens a custom, fully-styled popup menu. options: array of strings OR
// { value, label }. Closes on outside-click / Escape.
function CellSelect({ value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const opts = (options || []).map(o => (typeof o === "object" ? o : { value: o, label: o }));
  const sel = opts.find(o => o.value === value);
  const label = sel ? sel.label : (placeholder || "-");
  useEffect(() => {
    if (!open) return;
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <span className="cell-dd" ref={ref}>
      <button type="button" className={"cell-dd-trigger" + (sel ? "" : " is-empty")} onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}>
        {label}
      </button>
      {open && (
        <div className="cell-dd-menu" onClick={(e) => e.stopPropagation()}>
          {opts.map(o => (
            <button type="button" key={o.value || o.label}
              className={"cell-dd-opt" + (o.value === value ? " on" : "")}
              onClick={() => { onChange(o.value); setOpen(false); }}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
Object.assign(window, { CellSelect });

// ── CellDate — designed date control (no native date input/picker) ─────
// Shows the date as intrinsic-width text; opens a small month calendar popup.
function CellDate({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const sel = value ? new Date(value + "T00:00:00") : null;
  const [view, setView] = useState(() => sel ? new Date(sel.getFullYear(), sel.getMonth(), 1) : new Date());
  useEffect(() => {
    if (!open) return;
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);
  const y = view.getFullYear(), m = view.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  const fmt = (dd) => `${y}-${String(m + 1).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  const monthName = view.toLocaleString(undefined, { month: "long", year: "numeric" });
  return (
    <span className="cell-dd" ref={ref}>
      <button type="button" className={"cell-dd-trigger" + (value ? "" : " is-empty")} onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}>
        {value || "-"}
      </button>
      {open && (
        <div className="cell-cal" onClick={(e) => e.stopPropagation()}>
          <div className="cell-cal-head">
            <button type="button" className="cell-cal-nav" onClick={() => setView(new Date(y, m - 1, 1))}><Icon name="chevron-left" className="ico" /></button>
            <span className="cell-cal-title">{monthName}</span>
            <button type="button" className="cell-cal-nav" onClick={() => setView(new Date(y, m + 1, 1))}><Icon name="chevron-right" className="ico" /></button>
          </div>
          <div className="cell-cal-grid">
            {["S","M","T","W","T","F","S"].map((d, i) => <span key={"h" + i} className="cell-cal-dow">{d}</span>)}
            {cells.map((d, i) => d === null
              ? <span key={"e" + i} />
              : <button type="button" key={d} className={"cell-cal-day" + (value === fmt(d) ? " on" : "")} onClick={() => { onChange(fmt(d)); setOpen(false); }}>{d}</button>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
Object.assign(window, { CellDate });
