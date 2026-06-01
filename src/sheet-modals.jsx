import { useState, useEffect, useRef, useMemo } from 'react';
import { STAKEHOLDER_DATA } from './data';
import { displayName, normalizeUrl, formatPhone, Icon, FilterSection, SortFieldList } from './components';
import { StakeholderProfile } from './profiles';
import { MultiOwnerPicker } from './users';
// sheet-modals.jsx - extracted from sheet.jsx
// StakeholderModal (create/edit), FilterPopover, SortPopover, IssueSelector, NotesModal.
// Sibling text/babel script: shares global scope with sheet.jsx; all exported to window.

// StakeholderModal - popped-up card for Create or Edit. Replaces the old
// NewStakeholderModal. Same shape, but if `existing` is provided it loads
// that stakeholder's values and saves via onSave instead of onCreate.
export function StakeholderModal({ users, workspaces, isMaster, currentUser, activeWorkspaceLabel, existing, onCancel, onSubmit, onDelete, initialView, companyIssues, companyTags, community, stakeholders, scores, team, getWorkspacesForStakeholder, onOpenWorkspace, updateCommunityApp }) {
  const D = STAKEHOLDER_DATA;
  const isEdit = !!existing;
  const [viewMode, setViewMode] = useState(!!initialView && !!existing);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const blank = {
    title: "", firstName: "", lastName: "",
    name: "", org: "", url: "", isPerson: false, photo: null,
    category: "Communities", type: D.CATEGORIES["Communities"][0],
    market: "Americas", region: "United States",
    geography: "Local",
    priority: "Medium", tags: [], issues: [],
    owners: currentUser ? [currentUser.id] : [],
    status: "Active", lastContact: new Date().toISOString().slice(0,10),
    notes: ""
  };
  const [draft, setDraft] = useState(() => {
    if (existing) return { ...blank, ...existing, isPerson: !!(existing.firstName || existing.lastName) };
    return blank;
  });
  useEffect(() => {
    if (existing) setDraft({ ...blank, ...existing, isPerson: !!(existing.firstName || existing.lastName) });
    else setDraft(blank);
  }, [existing?.id]);

  function set(k, v) { setDraft(d => ({ ...d, [k]: v })); }
  // Required core fields + "filled if given" consistency rules.
  const shMissing = [];
  if (!draft.org || !draft.org.trim()) shMissing.push("Organization");
  if (draft.isPerson && !(draft.firstName || draft.lastName)) shMissing.push("Person name");
  if (draft.isPerson && draft.title === "Other" && !(draft.titleOther || "").trim()) shMissing.push("Custom title");
  if (!draft.category) shMissing.push("Category");
  if (!draft.type) shMissing.push("Audience type");
  if (!draft.market) shMissing.push("Market");
  if (!draft.region) shMissing.push("Region");
  if (!draft.geography) shMissing.push("Geography");
  // If a site is chosen it must resolve a state (US sites only); we auto-fill,
  // so this only trips for a malformed site without a state.
  if (draft.site) {
    const s = (D.SITES || []).find(x => x.id === draft.site);
    if (s && s.state && !draft.state) shMissing.push("State (from site)");
  }
  const valid = shMissing.length === 0;

  function submit() {
    if (!valid) return;
    // When this stakeholder is a person, compose Title + First + Last as the
    // display name. Otherwise the organization name IS the stakeholder name.
    const person = draft.isPerson;
    const computed = person ? displayName({
      title: draft.title, titleOther: draft.titleOther,
      firstName: draft.firstName, lastName: draft.lastName
    }) : "";
    onSubmit({
      ...draft,
      // clear person fields if not a person so the row renders as the org
      title: person ? draft.title : "",
      titleOther: person ? draft.titleOther : "",
      firstName: person ? draft.firstName : "",
      lastName: person ? draft.lastName : "",
      name: person ? (computed || draft.org) : draft.org,
      url: normalizeUrl(draft.url)
    });
  }

  // Read-only profile view (opened via "View Stakeholder").
  if (viewMode && existing) {
    return (
      <StakeholderProfile
        stakeholder={existing}
        users={users}
        stakeholders={stakeholders || []}
        community={community || []}
        scores={scores}
        team={team}
        getWorkspacesForStakeholder={getWorkspacesForStakeholder}
        onClose={onCancel}
        onEdit={() => setViewMode(false)}
        onOpenWorkspace={onOpenWorkspace}
        updateCommunityApp={updateCommunityApp}
        currentUser={currentUser}
        companyIssues={companyIssues}
      />
    );
  }

  return (
    <>
      <div className="modal-veil show" onClick={onCancel} />
      {confirmDelete && (
        <>
          <div className="modal-veil show" style={{ zIndex: 60 }} onClick={() => setConfirmDelete(false)} />
          <div className="modal confirm-modal" style={{ zIndex: 61, width: 380 }}>
            <div className="modal-body" style={{ padding: 20 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 17 }}>Delete this stakeholder?</h2>
              <p className="muted" style={{ fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--ink)" }}>{displayName(existing) || existing.name}</strong> and all of their scores will be permanently removed. This cannot be undone.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => { setConfirmDelete(false); onDelete(); }}>Delete</button>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="modal stakeholder-modal">
        <div className="modal-head">
          <div className="row" style={{ gap: 12, minWidth: 0 }}>
            <h2 style={{ margin: 0 }}>{isEdit ? "Edit stakeholder" : "New stakeholder"}</h2>
            {isEdit && <button className="explainer-link" onClick={() => setViewMode(true)} title="View full profile">View Stakeholder</button>}
          </div>
          <button className="btn btn-ghost" onClick={onCancel} aria-label="Close"><Icon name="close" /></button>
        </div>
        <div className="modal-body">
          {/* Photo + Identity */}
          <div className="sh-photo-row">
            <span className={"sh-photo-preview " + (draft.isPerson ? "person" : "org")}
                  style={draft.photo ? { background: `center/cover no-repeat url(${draft.photo})` } : undefined}>
              {!draft.photo && <Icon name={draft.isPerson ? "user" : "users"} className="ico" />}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="lbl">Profile image</span>
              <div style={{ display: "flex", gap: 6 }}>
                <label className="btn">
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                    const f = e.target.files && e.target.files[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => set("photo", reader.result);
                    reader.readAsDataURL(f);
                  }} />
                  {draft.photo ? "Replace photo" : "Upload photo"}
                </label>
                {draft.photo && <button type="button" className="btn btn-ghost" onClick={() => set("photo", null)}>Remove</button>}
              </div>
            </div>
          </div>

          {/* Identity - organization first, then optional person */}
          <div className="sh-form-row sh-form-row-2">
            <label className="login-field"><span className="lbl">Organization</span>
              <input value={draft.org} onChange={e => set("org", e.target.value)} placeholder="e.g. City of Cedarville" autoFocus />
            </label>
            <label className="login-field"><span className="lbl">Website</span>
              <input
                value={draft.url || ""}
                onChange={e => set("url", e.target.value)}
                placeholder="cityofcedarville.gov"
              />
              <span className="muted" style={{ fontSize: 10.5 }}>
                Skip http: we add it.
              </span>
            </label>
          </div>

          <label className="add-person-toggle">
            <input
              type="checkbox"
              checked={!!draft.isPerson}
              onChange={e => set("isPerson", e.target.checked)}
            />
            <span className="add-person-box" />
            <span>
              <strong>Add a person</strong>
              <span className="muted" style={{ fontSize: 11, display: "block" }}>
                Track a named individual at this organization. If unchecked, the stakeholder is the organization itself.
              </span>
            </span>
          </label>

          {draft.isPerson && (
            <div className="sh-form-row sh-form-row-3">
              <label className="login-field"><span className="lbl">Title</span>
                <div className="designed-select">
                  <select value={draft.title || ""} onChange={e => set("title", e.target.value)}>
                    <option value="">None</option>
                    {["Senator","Representative","Assemblymember","Governor","Mayor","County Supervisor","Councilmember","City Councilmember","CEO","Director","Other"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {draft.title === "Other" && (
                  <input
                    value={draft.titleOther || ""}
                    onChange={e => set("titleOther", e.target.value)}
                    placeholder="Write a custom title"
                    style={{ marginTop: 6 }}
                  />
                )}
              </label>
              <label className="login-field"><span className="lbl">First name</span>
                <input value={draft.firstName} onChange={e => set("firstName", e.target.value)} placeholder="Maria" />
              </label>
              <label className="login-field"><span className="lbl">Last name</span>
                <input value={draft.lastName} onChange={e => set("lastName", e.target.value)} placeholder="Chen" />
              </label>
            </div>
          )}

          {/* Contact */}
          <div className="sh-form-row sh-form-row-3">
            <label className="login-field"><span className="lbl">Email</span>
              <input value={draft.email || ""} onChange={e => set("email", e.target.value)} placeholder="name@org.com" />
            </label>
            <label className="login-field"><span className="lbl">Phone</span>
              <input
                value={draft.phone || ""}
                onChange={e => set("phone", e.target.value)}
                onBlur={e => set("phone", formatPhone(e.target.value))}
                placeholder="(555) 123-4567"
              />
            </label>
            <label className="login-field"><span className="lbl">X account</span>
              <input value={draft.xAccount || ""} onChange={e => set("xAccount", e.target.value)} placeholder="@handle" />
            </label>
          </div>

          {/* Classification */}
          <div className="sh-form-row sh-form-row-2">
            <label className="login-field"><span className="lbl">Category</span>
              <div className="designed-select">
                <select value={draft.category} onChange={e => { const c = e.target.value; setDraft(d => ({ ...d, category: c, type: D.CATEGORIES[c][0] })); }}>
                  {Object.keys(D.CATEGORIES).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </label>
            <label className="login-field"><span className="lbl">Audience type</span>
              <div className="designed-select">
                <select value={draft.type} onChange={e => set("type", e.target.value)}>
                  {(D.CATEGORIES[draft.category] || []).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </label>
          </div>

          {/* Geography */}
          <div className="sh-form-row sh-form-row-3">
            <label className="login-field"><span className="lbl">Market</span>
              <div className="designed-select">
                <select value={draft.market} onChange={e => { const m = e.target.value; setDraft(d => ({ ...d, market: m, region: D.MARKETS[m][0] })); }}>
                  {Object.keys(D.MARKETS).map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </label>
            <label className="login-field"><span className="lbl">Region</span>
              <div className="designed-select">
                <select value={draft.region} onChange={e => set("region", e.target.value)}>
                  {(D.MARKETS[draft.market] || []).map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </label>
            <label className="login-field"><span className="lbl">Geography</span>
              <div className="designed-select">
                <select value={draft.geography} onChange={e => set("geography", e.target.value)}>
                  {D.GEOGRAPHIES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </label>
          </div>

          {/* Site + State (optional). Picking a US site breaks out its state. */}
          <div className="sh-form-row sh-form-row-2">
            <label className="login-field"><span className="lbl">Site</span>
              <div className="designed-select">
                <select value={draft.site || ""} onChange={e => {
                  const id = e.target.value;
                  const s = (D.SITES || []).find(x => x.id === id);
                  if (s && s.state) setDraft(d => ({ ...d, site: id, state: s.state }));
                  else set("site", id);
                }}>
                  <option value="">None</option>
                  {(D.SITES || []).map(s => <option key={s.id} value={s.id}>{D.siteLabel(s)}</option>)}
                </select>
              </div>
            </label>
            <label className="login-field"><span className="lbl">State</span>
              <div className="designed-select">
                <select value={draft.state || ""} onChange={e => set("state", e.target.value)}>
                  <option value="">None</option>
                  {(D.US_STATES || []).map(st => <option key={st} value={st}>{D.STATE_ABBR[st] || st}</option>)}
                </select>
              </div>
            </label>
          </div>

          {/* Relationship */}
          <div className="sh-form-row sh-form-row-2">
            <label className="login-field"><span className="lbl">Priority</span>
              <div className="designed-select">
                <select value={draft.priority} onChange={e => set("priority", e.target.value)}>
                  {["High","Medium","Low"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </label>
            <label className="login-field"><span className="lbl">Status</span>
              <div className="designed-select">
                <select value={draft.status} onChange={e => set("status", e.target.value)}>
                  {["Active","Watch","Dormant"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </label>
          </div>
          <label className="login-field"><span className="lbl">Last contact</span>
            <input type="date" value={draft.lastContact || ""} onChange={e => set("lastContact", e.target.value)} />
          </label>

          <label className="login-field">
            <span className="lbl">Owners</span>
            <span className="muted" style={{ fontSize: 11 }}>
              {isEdit ? "Edit who owns this stakeholder. " : "You're added by default. "}
              Add or remove people responsible.
            </span>
            <MultiOwnerPicker users={users} owners={draft.owners} onChange={next => set("owners", next)} size={26} />
          </label>

          <label className="login-field">
            <span className="lbl">Issues</span>
            <span className="muted" style={{ fontSize: 11 }}>
              Click a company issue to add it. Add your own below, separated by commas.
            </span>
            <IssueSelector
              selected={draft.issues || []}
              companyIssues={companyIssues || []}
              onChange={next => set("issues", next)}
            />
          </label>

          <label className="login-field">
            <span className="lbl">Tags</span>
            <span className="muted" style={{ fontSize: 11 }}>
              Choose from the company tag set. Managers can add tags in Settings.
            </span>
            <IssueSelector
              selected={draft.tags || []}
              companyIssues={companyTags || []}
              onChange={next => set("tags", next)}
              restrict
            />
          </label>

          <label className="login-field"><span className="lbl">Notes</span>
            <textarea
              rows={3}
              value={draft.notes || ""}
              onChange={e => set("notes", e.target.value)}
              style={{ resize: "vertical", padding: 8, border: "1px solid var(--rule)", borderRadius: 6, font: "inherit", fontSize: 13, background: "var(--paper)", color: "var(--ink)" }}
            />
          </label>

          {!isEdit && (
            <div className="muted" style={{ fontSize: 11.5, padding: "6px 0 0", borderTop: "1px solid var(--rule-2)" }}>
              Score isn't set yet. Your team will be notified - they'll see this stakeholder at the top of their Sheet and the count on Scoring.
            </div>
          )}
          {isEdit && onDelete && (
            <div className="sh-delete-section">
              <div className="sh-delete-label">Delete stakeholder</div>
              <p className="muted" style={{ fontSize: 11.5, margin: "0 0 8px" }}>Permanently removes this stakeholder and all of their scores. This cannot be undone.</p>
              <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}><Icon name="close" /> Delete stakeholder</button>
            </div>
          )}
        </div>
        <div className="modal-foot">
          {!valid && <span className="modal-missing muted">Required: {shMissing.join(", ")}</span>}
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit} title={!valid ? "Fill required fields: " + shMissing.join(", ") : ""}>
            {isEdit ? "Save changes" : "Create stakeholder"}
          </button>
        </div>
      </div>
    </>
  );
}



// ── FilterPopover ─────────────────────────────────────────────────
export function FilterPopover({ filters, options, users, onToggle, onClear, onClose }) {
  const wrapRef = useRef(null);
  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current?.contains(e.target) && !e.target.closest(".filter-button-wrap")) onClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);
  function userName(id) { return users.find(u => u.id === id)?.name || id; }
  return (
    <div className="filter-popover" ref={wrapRef}>
      <div className="filter-pop-head">
        <strong>Filter</strong>
        <button type="button" className="btn btn-ghost" onClick={onClear} style={{ fontSize: 11 }}>Clear all</button>
      </div>
      <div className="filter-pop-body">
        <FilterSection label="Audience type" values={options.type} active={filters.type} onToggle={(v) => onToggle("type", v)} />
        <FilterSection label="Priority"      values={options.priority} active={filters.priority} onToggle={(v) => onToggle("priority", v)} />
        <FilterSection label="Status"        values={options.status} active={filters.status} onToggle={(v) => onToggle("status", v)} />
        <FilterSection label="Relationship"  values={options.zone}   active={filters.zone}   onToggle={(v) => onToggle("zone", v)} />
        <FilterSection label="Issues"        values={options.issues} active={filters.issues} onToggle={(v) => onToggle("issues", v)} />
        <FilterSection label="Owner"         values={options.owners} active={filters.owners} onToggle={(v) => onToggle("owners", v)} render={userName} />
      </div>
    </div>
  );
}

// ── SortPopover ─────────────────────────────────────────────────
export function SortPopover({ fields, sortKey, sortDir, setSortKey, setSortDir, onClear, onClose }) {
  const wrapRef = useRef(null);
  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current?.contains(e.target) && !e.target.closest(".filter-button-wrap")) onClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);
  return (
    <div className="filter-popover sort-popover" ref={wrapRef}>
      <div className="filter-pop-head">
        <strong>Sort by</strong>
        <button type="button" className="btn btn-ghost" onClick={onClear} style={{ fontSize: 11 }}>Clear all</button>
      </div>
      <div className="filter-pop-body">
        <SortFieldList fields={fields} sortKey={sortKey} sortDir={sortDir} onSet={(k, d) => { setSortKey(k); setSortDir(d); }} />
      </div>
    </div>
  );
}

// ── IssueSelector ─────────────────────────────────────────────────
// Layout:
//   - Selected chips appear at the top (filled pills, click to remove).
//   - Available company chips appear above the input as dashed pills.
//   - Custom issue input is its own row, unboxed, sized like the pills.
//   - Comma (or Enter) commits a new custom issue. Each word is title-cased.
export function IssueSelector({ selected, companyIssues, onChange, restrict }) {
  const [draft, setDraft] = useState("");
  const has = (v) => selected.includes(v);
  const titleCase = (s) => s.split(/\s+/).map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w).join(" ").trim();
  function add(rawValue) {
    const v = titleCase((rawValue || "").trim());
    if (!v) return;
    if (selected.includes(v)) return;
    onChange([...selected, v]);
  }
  function remove(v) {
    onChange(selected.filter(x => x !== v));
  }
  function commitDraft() {
    // Split on commas, add each piece. Backspace handled separately.
    const parts = draft.split(",").map(s => s.trim()).filter(Boolean);
    let next = [...selected];
    for (const p of parts) {
      const tc = titleCase(p);
      if (tc && !next.includes(tc)) next.push(tc);
    }
    onChange(next);
    setDraft("");
  }
  const available = companyIssues.filter(i => !has(i));
  return (
    <div className="issue-selector-block">
      {/* Selected */}
      {selected.length > 0 && (
        <div className="issue-row">
          {selected.map(v => (
            <span key={v} className="tag issue-chip selected" onClick={() => remove(v)} title="Click to remove">
              {v} <span style={{ marginLeft: 4, color: "rgba(0,0,0,.4)" }}>×</span>
            </span>
          ))}
        </div>
      )}
      {/* Available presets */}
      {available.length > 0 && (
        <div className="issue-row issue-row-available">
          {available.map(v => (
            <button key={v} type="button" className="tag issue-chip available" onClick={() => add(v)}>
              + {v}
            </button>
          ))}
        </div>
      )}
      {/* Custom input row (hidden when restricted to the company list) */}
      {!restrict && (
      <input
        className="issue-custom-input"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitDraft();
          } else if (e.key === "," ) {
            e.preventDefault();
            // Commit everything up to and including the comma.
            const next = draft + ",";
            setDraft(next);
            // Use a setTimeout-free path: commit immediately.
            const parts = next.split(",").map(s => s.trim()).filter(Boolean);
            let acc = [...selected];
            for (const p of parts) {
              const tc = titleCase(p);
              if (tc && !acc.includes(tc)) acc.push(tc);
            }
            onChange(acc);
            setDraft("");
          } else if (e.key === "Backspace" && !draft && selected.length) {
            remove(selected[selected.length - 1]);
          }
        }}
        onBlur={() => { if (draft) commitDraft(); }}
        placeholder="Add custom issues, separated by commas"
      />
      )}
    </div>
  );
}


// ── NotesModal ─────────────────────────────────────────────────────
// Click a notes cell → opens this. Shows the stakeholder's running history
// of notes (newest first) and a designed input below to add a new one.
// Each entry captures the body, timestamp, and author.
export function NotesModal({ stakeholder, users, currentUser, onClose, onAdd }) {
  const [text, setText] = useState("");
  // History list: prefer notesHistory (array); fall back to a single legacy
  // notes string if no history exists yet.
  const history = useMemo(() => {
    const list = [...(stakeholder.notesHistory || [])];
    if (list.length === 0 && stakeholder.notes) {
      list.push({ id: "n-legacy", body: stakeholder.notes, at: stakeholder.lastContact || new Date().toISOString(), by: null });
    }
    return list.sort((a, b) => (b.at || "").localeCompare(a.at || ""));
  }, [stakeholder]);

  function submit(e) {
    e?.preventDefault();
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText("");
  }

  return (
    <>
      <div className="modal-veil show" onClick={onClose} />
      <div className="modal notes-modal">
        <div className="modal-head">
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>Notes</div>
            <h2 style={{ margin: 0 }}>{displayName(stakeholder) || stakeholder.name}</h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        <div className="modal-body">
          {history.length === 0 ? (
            <div className="notes-empty muted">No notes yet. Add the first one below.</div>
          ) : (
            <div className="notes-history">
              {history.map((n) => {
                const author = n.by ? (users.find(u => u.id === n.by)) : null;
                const d = n.at ? new Date(n.at) : null;
                const stamp = d ? d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "-";
                return (
                  <div className="notes-entry" key={n.id}>
                    <div className="notes-entry-meta">
                      <span className="notes-entry-date">{stamp}</span>
                      {author ? <span className="notes-entry-by">· {author.name}</span> : <span className="notes-entry-by muted">· legacy</span>}
                    </div>
                    <div className="notes-entry-body">{n.body}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <form className="notes-composer" onSubmit={submit}>
          <span className="lbl">Add a new note</span>
          <textarea
            rows={3}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write what happened, what was said, or what you learned…"
          />
          <div className="modal-foot" style={{ padding: 0, border: 0 }}>
            <span className="muted" style={{ fontSize: 11, alignSelf: "center", marginRight: "auto" }}>
              Dated today, posted as {currentUser?.name || "you"}.
            </span>
            <button type="button" className="btn" onClick={onClose}>Close</button>
            <button type="submit" className="btn btn-primary" disabled={!text.trim()}>Add note</button>
          </div>
        </form>
      </div>
    </>
  );
}
