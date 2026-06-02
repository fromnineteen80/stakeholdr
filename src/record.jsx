import { useState } from 'react';
import { STAKEHOLDER_DATA } from './data';
import { Icon } from './components';
import { SheetView } from './sheet';
// record.jsx — Universal record scaffold (read + edit), single source of design.
//   • RecordShell — the page: static top bar (back · toolbar · view/edit), a
//     collapsible left rail (sub-page nav), a FULL-WIDTH white center whose
//     content reflows as rails toggle, a collapsible right rail (metadata), and
//     a pinned footer. The page TITLE lives in the content (a real page header),
//     never in the top bar.
//   • MetaField — one field, two states (read shows value, edit swaps an input).
// Tables are NOT re-implemented here — records embed the real app table
// (SheetView) verbatim. ALL visual rules live in the AUTHORITATIVE RECORD
// SCAFFOLD block in styles.css.

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

// ── RecordShell — static bar · sub-page rail · full-width center · metadata
//                  rail · pinned footer. Drives read AND edit. ───────────────
export function RecordShell({
  backLabel, onBack, pageIcon, title, subtitle, editing, onToggleEdit,
  sections, rightRail, navTitle, railTitle, toolbar, footer
}) {
  const [active, setActive] = useState(sections[0] && sections[0].id);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const section = sections.find(s => s.id === active) || sections[0];

  return (
    <div className="record-wrap">
      {/* Static top bar — back · adaptive toolbar · view↔edit. No title here. */}
      <div className="record-topbar">
        {onBack && <button className="plan-back" onClick={onBack}><Icon name="chevron-left" /> {backLabel || "Back"}</button>}
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

        {/* Center — full-width, the only width-flexible region */}
        <div className="record-main">
          <div className="record-page-head">
            {pageIcon && <span className="record-page-icon"><Icon name={pageIcon} /></span>}
            <div className="record-page-titles">
              {subtitle && <span className="record-page-eyebrow">{subtitle}</span>}
              {title && <span className="record-page-title">{title}</span>}
            </div>
          </div>
          {section && <div className="record-section-head">{section.label}</div>}
          <div className="record-section-body">{section && section.render(editing)}</div>
        </div>

        {/* Right rail — metadata */}
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

      {/* Pinned footer */}
      {footer && <div className="record-footer">{footer}</div>}
    </div>
  );
}

// ── SampleRecord — neutral live preview to tune the shell (Scaffolds menu) ──
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
  const D = STAKEHOLDER_DATA;

  // The table sub-page embeds the REAL workspace table (SheetView) verbatim —
  // same columns, design, and behavior — limited to 8 stakeholders.
  const sample8 = (D.STAKEHOLDERS || []).slice(0, 8);
  const noop = () => {};
  const embeddedTable = (
    <div className="record-table-embed">
      <SheetView
        explainerSlot={null}
        stakeholders={sample8}
        scores={D.SEED_SCORES || {}}
        team={D.TEAM || []}
        updateStakeholder={noop}
        openDetail={noop}
        selectedId={null}
        setSelectedId={noop}
        workspaceLabel="Sample"
        isMaster={true}
        getWorkspacesForStakeholder={() => []}
        workspaces={D.WORKSPACES || []}
        users={D.USERS || []}
        addStakeholder={noop}
        openStakeholderId={null}
        onConsumeOpen={noop}
        currentUser={(D.USERS || [])[0]}
        companyIssues={D.ISSUES || []}
        community={D.COMMUNITY || []}
        updateCommunityApp={noop}
        onOpenWorkspace={noop}
      />
    </div>
  );

  const sections = [
    { id: "prose", label: "Single column", icon: "notes", render: () => (
      <div className="record-prose">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
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
    { id: "table", label: "Table embed", icon: "table_rows", render: () => embeddedTable }
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
      pageIcon="description"
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
      footer={
        <>
          <span>Universal scaffold preview</span>
          <span style={{ flex: 1 }} />
          <span>Updated June 10, 2026</span>
        </>
      }
    />
  );
}
