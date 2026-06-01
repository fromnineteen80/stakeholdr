// palette.jsx — universal ⌘K command palette. A thin centered search over a
// blurred backdrop with grouped autocomplete (stakeholders, plans, community,
// workspaces, people). Arrow keys to move, Enter to go, click to go. The
// inline search bars on each page still work independently.

function CommandPalette({ open, onClose, stakeholders, plans, community, workspaces, users, onGo }) {
  const { useState, useEffect, useRef } = React;
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 20); } }, [open]);
  if (!open) return null;

  const ql = q.trim().toLowerCase();
  const match = (s) => ql && (s || "").toLowerCase().includes(ql);
  const results = [];
  if (ql) {
    stakeholders.forEach(s => {
      const n = window.displayName ? (window.displayName(s) || s.name) : s.name;
      const site = s.site && window.STAKEHOLDER_DATA.SITES ? (window.STAKEHOLDER_DATA.SITES.find(x => x.id === s.site) || {}) : {};
      const siteStr = site.id ? window.STAKEHOLDER_DATA.siteLabel(site) : "";
      const hit = match(n) || match(s.org) || match(s.type) || match(s.state) || match(siteStr) || match(site.country)
        || (s.tags || []).some(match) || (s.issues || []).some(match);
      if (hit) results.push({ type: "Stakeholder", id: s.id, label: n, sub: s.org, go: () => onGo("stakeholder", s.id) });
    });
    plans.forEach(p => { if (match(p.title)) results.push({ type: "Plan", id: p.id, label: p.title, sub: (workspaces.find(w => w.id === p.workspaceId) || {}).name, go: () => onGo("plan", p.id) }); });
    community.forEach(c => { if (match(c.name) || match(c.recipient)) results.push({ type: "Community", id: c.id, label: c.name, sub: c.kind, go: () => onGo("community", c.id) }); });
    workspaces.forEach(w => { if (match(w.name)) results.push({ type: "Workspace", id: w.id, label: w.name, sub: w.businessUnit, go: () => onGo("workspace", w.id) }); });
    users.filter(u => u.role !== "system").forEach(u => { if (match(u.name) || match(u.title)) results.push({ type: "Person", id: u.id, label: u.name, sub: u.title, go: () => onGo("user", u.id) }); });
  }
  const capped = results.slice(0, 24);
  const go = (i) => { const r = capped[i]; if (r) { r.go(); onClose(); } };

  function onKey(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, capped.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(active); }
    else if (e.key === "Escape") { onClose(); }
  }

  return (
    <div className="cmdk-backdrop" onClick={onClose}>
      <div className="cmdk" onClick={e => e.stopPropagation()}>
        <div className="cmdk-input">
          <Icon name="search" className="ico" />
          <input ref={inputRef} value={q} onChange={e => { setQ(e.target.value); setActive(0); }} onKeyDown={onKey} placeholder="Search names, orgs, tags, issues, sites, states…" />          <button className="cmdk-go" onClick={() => go(active)} disabled={!capped.length}>Enter</button>
        </div>
        {ql && (
          <div className="cmdk-results">
            {capped.length === 0 && <div className="cmdk-empty muted">No matches.</div>}
            {capped.map((r, i) => (
              <button key={r.type + r.id} className={"cmdk-row" + (i === active ? " active" : "")} onMouseEnter={() => setActive(i)} onClick={() => go(i)}>
                <span className="cmdk-type">{r.type}</span>
                <span className="cmdk-label">{r.label}</span>
                {r.sub && <span className="cmdk-sub muted">{r.sub}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { CommandPalette });
