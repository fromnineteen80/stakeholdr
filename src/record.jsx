import { useState } from 'react';
import { STAKEHOLDER_DATA } from './data';
import { displayName, Icon, StatusPill, PriorityPill } from './components';
// record.jsx — Universal record scaffold (read + edit), single source of design.
// Three primitives, nothing forked per entity:
//   • RecordShell — the page: static top bar, collapsible left rail (sub-page
//     nav), flexible white center, collapsible right rail (metadata).
//   • RecordTable — a plug-and-play embed of the single-source .sheet-* table;
//     pass columns + rows and drop it into a section. Never hand-build a table.
//   • MetaField  — one field, two states (read shows the value, edit swaps an
//     input). Same footprint in both, so view/edit stay identical structurally.
// ALL visual rules live in the AUTHORITATIVE RECORD SCAFFOLD block in styles.css.

// ── MetaField — one field, two states ───────────────────────────────────
// type: text | long | select | tags | date
export function MetaField({ label, value, editing, type = "text", options = [], placeholder, onChange }) {
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

// ── RecordTable — plug-and-play embed of the single-source sheet table ──────
// columns: [{ key, label, width?, frozen?, cls?, render?(row, i) }]
//   width  — any grid track value (e.g. "44px", "minmax(160px,2fr)"); defaults flexible
//   frozen — "idx" | "edit" (adds the frozen-column treatment from the sheet)
//   cls    — extra cell class (e.g. "idx", "edit", "cell-strong")
//   render — cell content for a row (falls back to row[key])
// rows: [{ id, ... }]   footer: optional node rendered in a .sheet-footer
export function RecordTable({ columns, rows, footer, minWidth = "max-content" }) {
  const template = columns.map(c => c.width || "minmax(120px,1fr)").join(" ");
  const cellCls = (c) => "sheet-cell" + (c.frozen ? ` frozen frozen-${c.frozen}` : "") + (c.cls ? ` ${c.cls}` : "");
  return (
    <div className="record-table-embed">
      <div className="sheet-scroll">
        <div className="sheet-grid" style={{ gridTemplateColumns: template, minWidth }}>
          <div className="sheet-head">
            {columns.map(c => <div key={c.key} className={cellCls(c)}>{c.label}</div>)}
          </div>
          {rows.map((row, i) => (
            <div className="sheet-row" key={row.id != null ? row.id : i}>
              {columns.map(c => <div key={c.key} className={cellCls(c)}>{c.render ? c.render(row, i) : row[c.key]}</div>)}
            </div>
          ))}
        </div>
        {footer != null && <div className="sheet-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── RecordShell — static top bar · collapsible sub-page rail · flexible
//                  center · collapsible metadata rail. Drives read AND edit. ──
export function RecordShell({ backLabel, onBack, title, subtitle, editing, onToggleEdit, sections, rightRail, navTitle, railTitle, toolbar }) {
  const [active, setActive] = useState(sections[0] && sections[0].id);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const section = sections.find(s => s.id === active) || sections[0];

  return (
    <div className="record-wrap">
      {/* Static top bar — back · title/subtitle · toolbar · view↔edit */}
      <div className="record-topbar">
        {onBack && <button className="plan-back" onClick={onBack}><Icon name="chevron-left" /> {backLabel || "Back"}</button>}
        <div className="record-title-group">
          {title && <span className="record-title">{title}</span>}
          {subtitle && <span className="record-subtitle">{subtitle}</span>}
        </div>
        <span style={{ flex: 1 }} />
        {toolbar && <span className="record-toolbar">{toolbar}</span>}
        {onToggleEdit && (
          <button className={"btn" + (editing ? " btn-primary" : "")} onClick={onToggleEdit}>
            <Icon name={editing ? "check" : "edit"} /> {editing ? "Done" : "Edit"}
          </button>
        )}
      </div>

      <div className="record-body">
        {/* Left rail — sub-page navigation */}
        <nav className={"record-nav" + (navCollapsed ? " collapsed" : "")}>
          <div className="record-nav-head">
            {!navCollapsed && <span className="record-nav-title">{navTitle || "Sections"}</span>}
            <button className="record-nav-collapse" onClick={() => setNavCollapsed(c => !c)} title={navCollapsed ? "Expand" : "Collapse"}>
              <Icon name={navCollapsed ? "chevron-right" : "chevron-left"} />
            </button>
          </div>
          {sections.map(s => (
            <button key={s.id} className={"record-nav-item" + (s.id === active ? " on" : "")}
              onClick={() => setActive(s.id)} title={s.label}>
              <Icon name={s.icon || "chevron-right"} />
              <span className="record-nav-label">{s.label}</span>
            </button>
          ))}
        </nav>

        {/* Center — the only width-flexible region */}
        <div className="record-main">
          {section && <div className="record-section-head">{section.label}</div>}
          <div className="record-section-body">{section && section.render(editing)}</div>
        </div>

        {/* Right rail — metadata (mirrors the left rail's head + collapse) */}
        {rightRail && (
          <aside className={"record-rail" + (railCollapsed ? " collapsed" : "")}>
            <div className="record-rail-head">
              {!railCollapsed && <span className="record-nav-title">{railTitle || "Details"}</span>}
              <button className="record-nav-collapse" onClick={() => setRailCollapsed(c => !c)} title={railCollapsed ? "Expand" : "Collapse"}>
                <Icon name={railCollapsed ? "chevron-left" : "chevron-right"} />
              </button>
            </div>
            {!railCollapsed && rightRail}
          </aside>
        )}
      </div>
    </div>
  );
}

// ── SampleRecord — neutral live preview to tune the shell (Scaffold menu) ──
export function SampleRecord() {
  const [editing, setEditing] = useState(false);
  const [d, setD] = useState({
    name: "Sample Record",
    owner: "Alex Rivera",
    status: "Active",
    priority: "High",
    summary: "A neutral record used to tune the universal read/edit scaffold before stakeholders, plans, and community entries are poured into it.",
    tags: ["Reference", "Scaffold"],
    note: ""
  });
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));

  // Real stakeholders → exercises RecordTable exactly as the workspace table.
  const D = STAKEHOLDER_DATA;
  const rows = (D.STAKEHOLDERS || []).slice(0, 8).map(s => {
    const wc = D.weightedCoord(s.id, D.SEED_SCORES || {}, D.TEAM || []);
    return { id: s.id, isPerson: s.isPerson, name: displayName(s) || s.name, org: s.org, type: s.type, rel: D.statusFor(wc.x, wc.y), pri: s.priority };
  });
  const columns = [
    { key: "idx", label: "", width: "44px", frozen: "idx", cls: "idx", render: (r, i) => i + 1 },
    { key: "icon", label: "", width: "44px", frozen: "edit", cls: "edit", render: r => <Icon name={r.isPerson ? "person" : "groups"} className="ico" /> },
    { key: "name", label: "Stakeholder", width: "minmax(160px,2fr)", render: r => <span className="cell-text">{r.name}</span> },
    { key: "org", label: "Organization", width: "minmax(140px,1.5fr)", render: r => <span className="cell-text">{r.org}</span> },
    { key: "type", label: "Type", width: "minmax(120px,1fr)", cls: "cell-strong", render: r => r.type },
    { key: "rel", label: "Relationship", width: "140px", render: r => <StatusPill status={r.rel} /> },
    { key: "pri", label: "Priority", width: "110px", render: r => <PriorityPill value={r.pri} /> }
  ];
  const tableFooter = (
    <>
      <div className="group"><Icon name="table" /> <strong style={{ color: "var(--ink)" }}>{rows.length}</strong> stakeholders</div>
      <div className="spacer" style={{ flex: 1 }} />
      <div className="group"><button className="footer-export-btn"><Icon name="download" /> Export CSV</button></div>
    </>
  );

  const sections = [
    { id: "prose", label: "Single column", icon: "notes", render: () => (
      <div className="record-prose">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.</p>
        <div className="record-prose-tags"><span className="tag">Reference</span><span className="tag">Scaffold</span><span className="tag">Lorem</span></div>
      </div>
    ) },
    { id: "fields", label: "Field stack", icon: "tune", render: (ed) => (
      <div className="record-fields">
        <MetaField label="Name" value={d.name} editing={ed} onChange={v => set("name", v)} />
        <MetaField label="Status" value={d.status} editing={ed} type="select" options={["Idea", "Proposed", "Active", "Complete"]} onChange={v => set("status", v)} />
        <MetaField label="Summary" value={d.summary} editing={ed} type="long" onChange={v => set("summary", v)} />
        <MetaField label="Tags" value={d.tags} editing={ed} type="tags" />
      </div>
    ) },
    { id: "twocol", label: "Two column", icon: "view_column", render: (ed) => (
      <div className="record-twocol">
        <div className="record-fields">
          <MetaField label="Name" value={d.name} editing={ed} onChange={v => set("name", v)} />
          <MetaField label="Status" value={d.status} editing={ed} type="select" options={["Idea", "Proposed", "Active", "Complete"]} onChange={v => set("status", v)} />
          <MetaField label="Priority" value={d.priority} editing={ed} type="select" options={["High", "Medium", "Low"]} onChange={v => set("priority", v)} />
        </div>
        <div className="record-fields">
          <MetaField label="Owner" value={d.owner} editing={ed} onChange={v => set("owner", v)} />
          <MetaField label="Summary" value={d.summary} editing={ed} type="long" onChange={v => set("summary", v)} />
          <MetaField label="Tags" value={d.tags} editing={ed} type="tags" />
        </div>
      </div>
    ) },
    { id: "table", label: "Table embed", icon: "table_rows", render: () => (
      <RecordTable columns={columns} rows={rows} footer={tableFooter} />
    ) }
  ];

  const rightRail = (
    <div className="record-rail-inner">
      <div className="record-rail-sec">
        <div className="record-rail-title">Metadata</div>
        <div className="mf"><span className="mf-label">Created</span><span className="mf-value">June 1, 2026</span></div>
        <div className="mf"><span className="mf-label">Updated</span><span className="mf-value">June 10, 2026</span></div>
        <div className="mf"><span className="mf-label">Owner</span><span className="mf-value">{d.owner}</span></div>
      </div>
      <div className="record-rail-sec">
        <div className="record-rail-title">Notes</div>
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
      navTitle="Sections"
      sections={sections}
      rightRail={rightRail}
      toolbar={
        <span className="scaffold-controls">
          <span className="search"><Icon name="search" className="ico" /><input placeholder="Search…" /><span className="kbd kbd-cmdk">⌘K</span></span>
          <button className="btn">Filter</button>
          <button className="btn">Sort</button>
        </span>
      }
    />
  );
}
