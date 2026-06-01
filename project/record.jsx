// record.jsx — Universal record scaffold (read + edit), single source of design.
// Pour any entity (stakeholder, plan, community, workspace) into RecordShell by
// passing a sections config. MetaField is the ONE field primitive: same label +
// footprint in both consume (read) and edit states, so everything stays uniform.

const { useState: useRecState } = React;

// ── MetaField — one definition, two states ──────────────────────────────
// type: text | long | select | tags | date
function MetaField({ label, value, editing, type = "text", options = [], placeholder, onChange }) {
  const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
  return (
    <label className="mf">
      <span className="mf-label">{label}</span>
      {!editing ? (
        <span className="mf-value">
          {empty ? <span className="mf-empty">—</span>
            : type === "tags"
              ? <span className="mf-tags">{value.map((t, i) => <span key={i} className="tag">{t}</span>)}</span>
              : value}
        </span>
      ) : type === "long" ? (
        <textarea className="mf-input mf-long" rows={4} value={value || ""} placeholder={placeholder} onChange={e => onChange && onChange(e.target.value)} />
      ) : type === "select" ? (
        <span className="designed-select mf-input">
          <select value={value || ""} onChange={e => onChange && onChange(e.target.value)}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </span>
      ) : (
        <input className="mf-input" type={type === "date" ? "date" : "text"} value={value || ""} placeholder={placeholder} onChange={e => onChange && onChange(e.target.value)} />
      )}
    </label>
  );
}

// ── RecordShell — collapsible left section-nav · full-width content ·
//                  summoned right rail. Drives both read and edit. ──────────
function RecordShell({ backLabel, onBack, title, subtitle, editing, onToggleEdit, sections, rightRail, headerExtra, navTitle, toolbar }) {
  const [active, setActive] = useRecState(sections[0] && sections[0].id);
  const [navCollapsed, setNavCollapsed] = useRecState(false);
  const [railCollapsed, setRailCollapsed] = useRecState(false);
  const section = sections.find(s => s.id === active) || sections[0];

  return (
    <div className="record-wrap">
      {/* Top bar: back-trail · title · actions */}
      <div className="record-topbar">
        <button className="plan-back" onClick={onBack}>‹ {backLabel}</button>
        <div className="record-title-group">
          <span className="record-subtitle">{subtitle}</span>
        </div>
        <span style={{ flex: 1 }} />
        {headerExtra}
        {toolbar && <span className="record-toolbar">{toolbar}</span>}
        {false && onToggleEdit && (
          <button className="footer-export-btn" onClick={onToggleEdit}>
            <Icon name={editing ? "visibility" : "edit"} /> {editing ? "View" : "Edit"}
          </button>
        )}
      </div>

      <div className="record-body">
        {/* Left section nav: title row with collapse, then items */}
        <nav className={"record-nav" + (navCollapsed ? " collapsed" : "")}>
          <div className="record-nav-head">
            {!navCollapsed && <span className="record-nav-title">{navTitle || title}</span>}
            <button className="record-nav-collapse" onClick={() => setNavCollapsed(c => !c)} title={navCollapsed ? "Expand" : "Collapse"}>
              <Icon name={navCollapsed ? "left_panel_open" : "left_panel_close"} />
            </button>
          </div>
          {sections.map(s => (
            <button key={s.id} className={"record-nav-item" + (s.id === active ? " on" : "")}
              onClick={() => setActive(s.id)} title={s.label}>
              <Icon name={s.icon || "chevron_right"} />
              <span className="record-nav-label">{s.label}</span>
            </button>
          ))}
        </nav>

        {/* Full-width content */}
        <div className="record-main">
          <div className="record-section-head">{section && section.label}</div>
          <div className="record-section-body">{section && section.render(editing)}</div>
        </div>

        {/* Summoned right rail — mirror of the left nav (head + collapse) */}
        {rightRail && (
          <aside className={"record-rail" + (railCollapsed ? " collapsed" : "")}>
            <div className="record-rail-head">
              <button className="record-nav-collapse" onClick={() => setRailCollapsed(c => !c)} title={railCollapsed ? "Expand" : "Collapse"}>
                <Icon name={railCollapsed ? "right_panel_close" : "right_panel_open"} />
              </button>
            </div>
            {!railCollapsed && rightRail}
          </aside>
        )}
      </div>
    </div>
  );
}

// ── SampleRecord — neutral demo to tune the shell before pouring entities ──
function SampleRecord() {
  const [editing, setEditing] = useRecState(false);
  const [d, setD] = useRecState({
    name: "Sample Record",
    owner: "Alex Rivera",
    status: "Active",
    priority: "High",
    summary: "A neutral record used to tune the universal read/edit scaffold before stakeholders, plans, and community entries are poured into it.",
    tags: ["Reference", "Scaffold"],
    note: ""
  });
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));

  // Single-source table embed: real stakeholders, mirrors the workspace table
  // exactly — frozen #/icon columns, .sheet-scroll border, .sheet-footer.
  const D = window.STAKEHOLDER_DATA;
  const tableRows = (D.STAKEHOLDERS || []).slice(0, 8).map(s => {
    const wc = D.weightedCoord(s.id, D.SEED_SCORES || {}, D.TEAM || []);
    return {
      id: s.id, isPerson: s.isPerson,
      name: window.displayName ? window.displayName(s) : s.name,
      org: s.org,
      type: s.type,
      rel: D.statusFor(wc.x, wc.y),
      pri: s.priority
    };
  });
  const embeddedTable = (
    <div className="sheet-scroll">
      <div className="sheet-grid" style={{ gridTemplateColumns: "max-content max-content max-content max-content max-content max-content max-content", minWidth: "max-content" }}>
        <div className="sheet-head">
          <div className="sheet-cell frozen frozen-idx idx"><span></span></div>
          <div className="sheet-cell frozen frozen-edit edit"><span></span></div>
          <div className="sheet-cell">Stakeholder</div>
          <div className="sheet-cell">Organization</div>
          <div className="sheet-cell">Type</div>
          <div className="sheet-cell">Relationship</div>
          <div className="sheet-cell">Priority</div>
        </div>
        {tableRows.map((r, i) => (
          <div className="sheet-row" key={r.id}>
            <div className="sheet-cell frozen frozen-idx idx">{i + 1}</div>
            <div className="sheet-cell frozen frozen-edit edit"><Icon name={r.isPerson ? "person" : "groups"} className="ico" /></div>
            <div className="sheet-cell"><span className="cell-text">{r.name}</span></div>
            <div className="sheet-cell"><span className="cell-text">{r.org}</span></div>
            <div className="sheet-cell cell-strong">{r.type}</div>
            <div className="sheet-cell"><StatusPill status={r.rel} /></div>
            <div className="sheet-cell"><PriorityPill value={r.pri} /></div>
          </div>
        ))}
      </div>
      <div className="sheet-footer">
        <div className="group"><Icon name="table" /> <strong style={{ color: "var(--ink)" }}>{tableRows.length}</strong> stakeholders</div>
        <div className="spacer" style={{ flex: 1 }} />
        <div className="group"><button className="footer-export-btn"><Icon name="download" /> Export CSV</button></div>
      </div>
    </div>
  );

  const sections = [
    { id: "prose", label: "Single column", icon: "notes", render: () => (
      <div className="record-prose">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.</p>
        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa.</p>
        <div className="record-prose-tags"><span className="tag">Reference</span><span className="tag">Scaffold</span><span className="tag">Lorem</span></div>
      </div>
    ) },
    { id: "table", label: "Table", icon: "table_rows", render: () => (
      <div className="record-table-embed">{embeddedTable}</div>
    ) },    { id: "two-col", label: "Two column", icon: "view_column", render: (ed) => (
      <div className="record-twocol">
        <div className="record-fields">
          <MetaField label="Name" value={d.name} editing={ed} onChange={v => set("name", v)} />
          <MetaField label="Status" value={d.status} editing={ed} type="select" options={["Idea","Proposed","Active","Complete"]} onChange={v => set("status", v)} />
          <MetaField label="Priority" value={d.priority} editing={ed} type="select" options={["High","Medium","Low"]} onChange={v => set("priority", v)} />
        </div>
        <div className="record-fields">
          <MetaField label="Owner" value={d.owner} editing={ed} onChange={v => set("owner", v)} />
          <MetaField label="Summary" value={d.summary} editing={ed} type="long" onChange={v => set("summary", v)} />
          <MetaField label="Tags" value={d.tags} editing={ed} type="tags" />
        </div>
      </div>
    ) },
    { id: "single-field", label: "Single field", icon: "description", render: (ed) => (
      <div className="record-fields">
        <MetaField label="Name" value={d.name} editing={ed} onChange={v => set("name", v)} />
        <MetaField label="Summary" value={d.summary} editing={ed} type="long" onChange={v => set("summary", v)} />
        <MetaField label="Tags" value={d.tags} editing={ed} type="tags" />
      </div>
    ) }
  ];

  const rightRail = (
    <div className="record-rail-inner">
      <div className="record-rail-sec">
        <div className="mf-label">Metadata</div>
        <div className="mf"><span className="mf-label">Created</span><span className="mf-value">June 1, 2026</span></div>
        <div className="mf"><span className="mf-label">Updated</span><span className="mf-value">June 10, 2026</span></div>
      </div>
      <div className="record-rail-sec">
        <div className="mf-label">Notes</div>
        <textarea className="mf-input mf-long" rows={3} placeholder="Add a note…" value={d.note} onChange={e => set("note", e.target.value)} />
      </div>
    </div>
  );

  return (
    <RecordShell
      backLabel="Samples"
      onBack={() => {}}
      title={d.name}
      subtitle="Universal scaffold preview"
      editing={editing}
      onToggleEdit={() => setEditing(e => !e)}
      sections={sections}
      rightRail={rightRail}
      toolbar={
        <span className="scaffold-controls">
          <span className="search"><Icon name="search" className="ico" /><input placeholder="Search stakeholders, orgs, tags…" /><span className="kbd kbd-cmdk">⌘K</span></span>
          <button className="btn">Filter</button>
          <button className="btn">Sort</button>
          <button className="btn">Categories</button>
          <button className="btn">Sites</button>
        </span>
      }
    />
  );
}

Object.assign(window, { MetaField, RecordShell, SampleRecord });
