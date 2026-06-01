import { useState } from 'react';
import * as ReactDOM from 'react-dom';
import { Icon, FilterSection, SortFieldList } from './components';
import { cmdKeyLabel } from './store';
// landing.jsx — shared landing shell for the Plan and Community pages.
// Toolbar (search · Filter · Sort · See all) + either a card grid or a
// profile-style table. Reuses the shared FilterSection + SortFieldList so
// filtering/sorting is identical everywhere. Filtering is applied first,
// then sorting (industry standard).

export function LandingView({
  items, searchKeys, filterDefs, sortFields, cols,
  renderCard, onRowClick, onNew, newLabel, emptyText, gridClass, headerSlot, footerSlot, explainerSlot, toolbarRight
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});      // { defKey: Set(values) }
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [view, setView] = useState("cards");        // cards | table
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const valuesOf = (def, item) => {
    const v = def.get(item);
    return Array.isArray(v) ? v.filter(Boolean).map(String) : (v ? [String(v)] : []);
  };
  const distinct = (def) => {
    const s = new Set();
    items.forEach(it => valuesOf(def, it).forEach(v => s.add(v)));
    return [...s].sort();
  };
  function toggleFilter(key, val) {
    setFilters(prev => {
      const cur = new Set(prev[key] || []);
      cur.has(val) ? cur.delete(val) : cur.add(val);
      return { ...prev, [key]: cur };
    });
  }
  const activeFilterCount = Object.values(filters).reduce((n, s) => n + (s ? s.size : 0), 0);

  // search -> filters -> sort
  const ql = search.toLowerCase();
  let view2 = items;
  if (ql) view2 = view2.filter(it => searchKeys.some(k => (it[k] || "").toString().toLowerCase().includes(ql)));
  filterDefs.forEach(def => {
    const set = filters[def.key];
    if (set && set.size) view2 = view2.filter(it => valuesOf(def, it).some(v => set.has(v)));
  });
  if (sort.key) {
    const f = sortFields.find(s => s.key === sort.key);
    if (f) view2 = [...view2].sort((a, b) => {
      const av = (f.get(a) || "").toString().toLowerCase(), bv = (f.get(b) || "").toString().toLowerCase();
      return (av < bv ? -1 : av > bv ? 1 : 0) * (sort.dir === "asc" ? 1 : -1);
    });
  }

  return (
    <div className="community-wrap">
      {explainerSlot && ReactDOM.createPortal(
      <div className="community-toolbar">
        <div className="search"><Icon name="search" /><input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} /><span className="kbd kbd-cmdk">{cmdKeyLabel}</span></div>
        <div className="filter-button-wrap">
          <button className={"btn" + (activeFilterCount ? " filter-active" : "")} onClick={() => { setFilterOpen(o => !o); setSortOpen(false); }}>
            Filter{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </button>
          {filterOpen && (
            <div className="filter-popover" onMouseLeave={() => setFilterOpen(false)}>
              <div className="filter-pop-head"><strong>Filter</strong><button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setFilters({})}>Clear all</button></div>
              <div className="filter-pop-body">
                {filterDefs.map(def => (
                  <FilterSection key={def.key} label={def.label} values={distinct(def)} active={[...(filters[def.key] || [])]} onToggle={(v) => toggleFilter(def.key, v)} />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="filter-button-wrap">
          <button className={"btn" + (sort.key ? " filter-active" : "")} onClick={() => { setSortOpen(o => !o); setFilterOpen(false); }}>Sort</button>
          {sortOpen && (
            <div className="filter-popover sort-popover" onMouseLeave={() => setSortOpen(false)}>
              <div className="filter-pop-head"><strong>Sort by</strong><button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setSort({ key: null, dir: "asc" })}>Clear all</button></div>
              <div className="filter-pop-body">
                <SortFieldList fields={sortFields} sortKey={sort.key} sortDir={sort.dir} onSet={(k, d) => setSort({ key: k, dir: d })} />
              </div>
            </div>
          )}
        </div>
        <button className={"btn" + (view === "table" ? " filter-active" : "")} onClick={() => setView(v => v === "table" ? "cards" : "table")} title="See all in a table">
          See all
        </button>
        <div className="spacer" style={{ flex: 1 }} />
        {toolbarRight}
      </div>, explainerSlot)}

      {headerSlot}

      {view2.length === 0 ? (
        <div className="comm-empty muted">{emptyText}</div>
      ) : view === "table" ? (
        <div className="landing-table-scroll">
          <div className="profile-table landing-table landing-table-flex">
            <div className="profile-trow profile-thead" style={{ gridTemplateColumns: "minmax(180px,2fr) " + cols.slice(1).map(() => "max-content").join(" ") }}>
              {cols.map(c => <span key={c.key} className="profile-th-label">{c.label}</span>)}
            </div>
            {view2.map(it => (
              <div className="profile-trow" key={it.id} onClick={() => onRowClick(it)} style={{ gridTemplateColumns: "minmax(180px,2fr) " + cols.slice(1).map(() => "max-content").join(" "), cursor: "pointer" }} title="Open">
                {cols.map(c => <span key={c.key} className="profile-td">{c.render ? c.render(it) : it[c.key]}</span>)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={gridClass || "comm-grid"}>
          {view2.map(it => renderCard(it))}
        </div>
      )}
      {footerSlot}
    </div>
  );
}

