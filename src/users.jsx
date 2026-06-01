import { useState, useRef, useEffect } from 'react';
import { STAKEHOLDER_DATA } from './data';
import { uid, nowStamp, Store } from './store';
// users.jsx - Avatar, profile menu, user stack, user list popup, login gate,
// edit-profile modal, owner picker.

export function Avatar({ user, size = 28, ring = false, online = false, onClick, title }) {
  if (!user) return null;
  const initials = abbrev(user.name);
  const fontSize = size <= 22 ? 9 : size <= 30 ? 10.5 : size <= 40 ? 13 : 16;
  // Online indicator scales with avatar size but stays inside the circle.
  const dotSize = Math.max(6, Math.round(size * 0.28));
  return (
    <span
      className={"av" + (ring ? " av-ring" : "")}
      style={{
        width: size, height: size,
        background: user.avatarUrl ? `center / cover no-repeat url(${user.avatarUrl})` : user.avatarColor,
        color: "#FAF8F2",
        fontSize,
        cursor: onClick ? "pointer" : "default"
      }}
      onClick={onClick}
      title={title || `${user.name} · ${user.title}`}
    >
      {!user.avatarUrl && initials}
      {online && (
        <span
          className="av-presence"
          style={{
            width: dotSize, height: dotSize,
            // tuck into the lower-right quadrant of the circle, fully inside
            right: Math.max(1, Math.round(size * 0.06)),
            bottom: Math.max(1, Math.round(size * 0.06)),
            borderWidth: Math.max(1, Math.round(size * 0.05))
          }}
        />
      )}
    </span>
  );
}

// stacked: shows the first N users overlapping, then +more counter.
export function UserStack({ users, currentUserId, max = 3, onClick, size = 28 }) {
  const others = users.filter(u => u.id !== currentUserId && u.role !== "system");
  const visible = others.slice(0, max);
  const overflow = Math.max(0, others.length - max);
  return (
    <span className="user-stack" onClick={onClick} role="button" title="People in this workspace">
      {visible.map((u) => (
        <Avatar key={u.id} user={u} size={size} ring />
      ))}
      {overflow > 0 && (
        <span className="av av-more" style={{ width: size, height: size, fontSize: size <= 22 ? 9 : 11 }}>+{overflow}</span>
      )}
    </span>
  );
}

// right-side popup column showing other users with a Message action.
export function UserListPopup({ open, onClose, users, currentUserId, onMessage }) {
  const others = users.filter(u => u.id !== currentUserId && u.role !== "system");
  return (
    <>
      <div className={"side-veil" + (open ? " show" : "")} onClick={onClose} />
      <aside className={"side-popup" + (open ? " show" : "")}>
        <div className="side-popup-head">
          <strong>People · {others.length}</strong>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        <div className="side-popup-body">
          {others.map(u => (
            <div key={u.id} className="user-row">
              <Avatar user={u} size={36} online={u.presence === "online"} />
              <div className="user-row-meta">
                <div className="user-row-name">{u.name}</div>
                <div className="user-row-title">{u.title}</div>
              </div>
              <button className="btn btn-ghost user-row-msg" onClick={() => onMessage(u.id)} title="Send message">
                <Icon name="message" className="ico" />
              </button>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

export function ProfileMenu({ open, anchor, user, onClose, onEditProfile, onMessages, onSettings, onLogOut, isManager }) {
  if (!open) return null;
  return (
    <div className="profile-menu" onClick={e => e.stopPropagation()}>
      <div className="profile-menu-head">
        <Avatar user={user} size={46} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: "nowrap" }}>{user.name}</div>
          {(() => {
            const t = user.title || "";
            if (t.includes(",") && t.length > 24) {
              const i = t.indexOf(",");
              return (<>
                <div className="muted" style={{ fontSize: 12 }}>{t.slice(0, i).trim()}</div>
                <div className="muted" style={{ fontSize: 12 }}>{t.slice(i + 1).trim()}</div>
              </>);
            }
            return <div className="muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>{t}</div>;
          })()}
          <div className="muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>{user.email}</div>
          {isManager && <ManagerBadge />}
        </div>
      </div>
      <div className="profile-menu-divider" />
      <button className="profile-menu-item" onClick={onEditProfile}>
        <Icon name="user" /> View profile
      </button>
      <button className="profile-menu-item" onClick={onMessages}>
        <Icon name="message" /> Messages
      </button>
      {isManager && (
        <button className="profile-menu-item" onClick={onSettings}>
          <Icon name="build" /> Settings
        </button>
      )}
      <div className="profile-menu-divider" />
      <button className="profile-menu-item logout" onClick={onLogOut}>
        <Icon name="logout" /> Log out
      </button>
    </div>
  );
}

export function LoginView({ onLogin }) {
  // Read persisted app identity so the login screen reflects the configured
  // brand icon / color before any user logs in.
  const loginBrand = (() => {
    const fallback = { brand: "#024AD8", brandIcon: null };
    try {
      const cfg = Store && Store.load("appConfig", null);
      if (cfg) return { brand: cfg.brand || "#024AD8", brandIcon: cfg.brandIcon || null };
    } catch {}
    return fallback;
  })();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState(null); // dataURL
  const [color, setColor] = useState("#B5552C");
  const valid = name.trim() && email.trim() && /@/.test(email);

  const palette = ["#B5552C", "#D26A6A", "#3E7A2E", "#4F3F69", "#2A6FDB", "#B07E1F", "#682E45", "#5A8F8F"];

  function onPickPhoto(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(f);
  }

  function submit(e) {
    e?.preventDefault();
    if (!valid) return;
    const u = {
      id: uid("u"),
      name: name.trim(),
      title: title.trim() || "Team member",
      email: email.trim(),
      avatarColor: color,
      avatarUrl: photo,
      presence: "online",
      createdAt: nowStamp(),
      updatedAt: nowStamp()
    };
    onLogin(u);
  }

  return (
    <div className="login-shell">
      <div className="login-bg-grid" />
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark" style={loginBrand.brandIcon ? { background: loginBrand.brand, color: "#FAF8F2" } : undefined}>
            {loginBrand.brandIcon ? (
              <img src={loginBrand.brandIcon} alt="App icon" className="brand-mark-img" />
            ) : (
              <Icon name="brandmark" className="brand-glyph" />
            )}
          </div>
          <div>
            <div className="login-app-name">HP&apos;s Map</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>Stakeholder mapping &amp; engagement</div>
          </div>
        </div>

        <h1 className="login-h1">Sign in</h1>
        <p className="login-sub">Tell us who you are to get started.</p>

        <form onSubmit={submit} className="login-form">
          <label className="login-field">
            <span className="lbl">Full name</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Jordan Kim" autoFocus />
          </label>
          <label className="login-field">
            <span className="lbl">Title</span>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Director, GA&PP North America" />
          </label>
          <label className="login-field">
            <span className="lbl">Work email</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jordan.kim@hp.com" />
          </label>

          <div className="login-field">
            <span className="lbl">Profile photo (optional)</span>
            <div className="login-avatar-row">
              <span className="av login-av-preview" style={{
                background: photo ? `center / cover no-repeat url(${photo})` : color,
                color: "#FAF8F2"
              }}>
                {!photo && (name ? abbrev(name) : "··")}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="btn">
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={onPickPhoto} />
                  {photo ? "Replace photo" : "Upload photo"}
                </label>
                {photo && (
                  <button type="button" className="btn btn-ghost" onClick={() => setPhoto(null)}>Remove</button>
                )}
                {!photo && (
                  <div className="login-color-row">
                    {palette.map(c => (
                      <button
                        key={c} type="button"
                        className={"login-swatch" + (color === c ? " active" : "")}
                        style={{ background: c }}
                        onClick={() => setColor(c)}
                        aria-label={"Pick color " + c}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-submit" disabled={!valid}>
            Enter HP&apos;s Map →
          </button>
        </form>

        <div className="login-sample">
          <span className="muted" style={{ fontSize: 11 }}>Or continue as one of the demo accounts:</span>
          <div className="login-sample-row">
            {STAKEHOLDER_DATA.USERS.slice(0, 5).map(u => (
              <button key={u.id} type="button" className="login-sample-chip" onClick={() => onLogin(u)}>
                <Avatar user={u} size={24} />
                {u.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tiny manager star.
export function ManagerStar({ size = 12, title }) {
  return (
    <span
      className="material-symbols-outlined msym mgr-star"
      style={{ fontSize: size + 4, color: "#E0A21A", fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" }}
      aria-label="Manager"
      title={title || "Manager"}
    >star</span>
  );
}

// Amber manager pill (the designed one from the profile dropdown).
export function ManagerBadge() {
  return (
    <span className="manager-badge" title="Manager">
      <ManagerStar size={10} /> Manager
    </span>
  );
}

// User row name with optional manager star.
export function UserName({ user, size = 12 }) {
  if (!user) return null;
  return <span>{user.name}</span>;
}

export function OwnerPicker({ users, value, onChange }) {
  return (
    <div className="ws-owner-control">
      <UserAutocomplete
        users={users}
        value={value}
        onChange={onChange}
        placeholder="Unassigned"
        clearable
        showAvatar
      />
    </div>
  );
}

export function EditProfileModal({ open, user, onClose, onSave, companyFunctions }) {
  const [draft, setDraft] = useState(user);
  useEffect(() => { setDraft(user); }, [user]);
  if (!open || !user) return null;

  function onPickPhoto(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setDraft(d => ({ ...d, avatarUrl: reader.result }));
    reader.readAsDataURL(f);
  }
  const palette = ["#B5552C", "#D26A6A", "#3E7A2E", "#4F3F69", "#2A6FDB", "#B07E1F", "#682E45", "#5A8F8F"];

  return (
    <>
      <div className="modal-veil show" onClick={onClose} />
      <div className="modal">
        <div className="modal-head">
          <h2>Edit profile</h2>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        <div className="modal-body">
          <div className="login-avatar-row" style={{ marginBottom: 12 }}>
            <span className="av login-av-preview" style={{
              background: draft.avatarUrl ? `center / cover no-repeat url(${draft.avatarUrl})` : draft.avatarColor,
              color: "#FAF8F2"
            }}>
              {!draft.avatarUrl && abbrev(draft.name)}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="btn">
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={onPickPhoto} />
                {draft.avatarUrl ? "Replace photo" : "Upload photo"}
              </label>
              {draft.avatarUrl && (
                <button type="button" className="btn btn-ghost" onClick={() => setDraft(d => ({ ...d, avatarUrl: null }))}>Remove</button>
              )}
              {!draft.avatarUrl && (
                <div className="login-color-row">
                  {palette.map(c => (
                    <button
                      key={c} type="button"
                      className={"login-swatch" + (draft.avatarColor === c ? " active" : "")}
                      style={{ background: c }}
                      onClick={() => setDraft(d => ({ ...d, avatarColor: c }))}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="sh-form-row sh-form-row-2">
            <label className="login-field"><span className="lbl">First name</span>
              <input value={draft.firstName != null ? draft.firstName : (draft.name || "").split(" ")[0] || ""} onChange={e => setDraft(d => ({ ...d, firstName: e.target.value }))} />
            </label>
            <label className="login-field"><span className="lbl">Last name</span>
              <input value={draft.lastName != null ? draft.lastName : (draft.name || "").split(" ").slice(1).join(" ")} onChange={e => setDraft(d => ({ ...d, lastName: e.target.value }))} />
            </label>
          </div>
          <label className="login-field"><span className="lbl">Title</span>
            <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />
          </label>
          <label className="login-field"><span className="lbl">Work email</span>
            <input value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} />
          </label>
          <label className="login-field"><span className="lbl">Function</span>
            <div className="designed-select">
              <select value={draft.function || ""} onChange={e => setDraft(d => ({ ...d, function: e.target.value }))}>
                <option value="">Select a function…</option>
                {(companyFunctions || []).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </label>
          <div className="login-field"><span className="lbl">Markets</span>
            <div className="profile-chip-pick">
              {Object.keys(STAKEHOLDER_DATA.MARKETS).map(m => (
                <button key={m} type="button"
                  className={"filter-chip" + ((draft.markets || []).includes(m) ? " on" : "")}
                  onClick={() => setDraft(d => { const cur = d.markets || []; return { ...d, markets: cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m], regions: (d.regions || []).filter(r => (cur.includes(m) ? true : true)) }; })}
                >{m}</button>
              ))}
            </div>
          </div>
          {(draft.markets || []).length > 0 && (
            <div className="login-field"><span className="lbl">Regions</span>
              <div className="profile-chip-pick">
                {(draft.markets || []).flatMap(m => (STAKEHOLDER_DATA.MARKETS[m] || [])).map(r => (
                  <button key={r} type="button"
                    className={"filter-chip" + ((draft.regions || []).includes(r) ? " on" : "")}
                    onClick={() => setDraft(d => { const cur = d.regions || []; return { ...d, regions: cur.includes(r) ? cur.filter(x => x !== r) : [...cur, r] }; })}
                  >{r}</button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => {
            const fn = draft.firstName != null ? draft.firstName : (draft.name || "").split(" ")[0] || "";
            const ln = draft.lastName != null ? draft.lastName : (draft.name || "").split(" ").slice(1).join(" ");
            const merged = { ...draft, firstName: fn, lastName: ln, name: [fn, ln].filter(Boolean).join(" ").trim() || draft.name };
            onSave(merged); onClose();
          }}>Save profile</button>
        </div>
      </div>
    </>
  );
}

// ── UserAutocomplete ──────────────────────────────────────────────────
// A typeahead input. As you type, a dropdown shows matching users (by name,
// title, email). Picking one calls onChange with the user id (or null).
export function UserAutocomplete({ users, value, onChange, placeholder, clearable, autoFocus, showAvatar }) {
  const selected = users.find(u => u.id === value);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const q = query.toLowerCase();
  const matches = q ? users.filter(u =>
    u.name.toLowerCase().includes(q) ||
    (u.title || "").toLowerCase().includes(q) ||
    (u.email || "").toLowerCase().includes(q)
  ).slice(0, 8) : users.slice(0, 8);

  function pick(u) {
    onChange(u.id);
    setQuery("");
    setOpen(false);
  }
  function clear() {
    onChange(null);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="user-autocomplete" ref={wrapRef}>
      {showAvatar && selected && !open && (
        <Avatar user={selected} size={20} online={selected.presence === "online"} />
      )}
      <input
        type="text"
        autoFocus={autoFocus}
        value={open ? query : (selected ? selected.name : "")}
        onChange={e => { setQuery(e.target.value); setOpen(true); setHoverIdx(0); }}
        onFocus={() => { setQuery(""); setOpen(true); }}
        onKeyDown={e => {
          if (e.key === "ArrowDown") { e.preventDefault(); setHoverIdx(i => Math.min(matches.length - 1, i + 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHoverIdx(i => Math.max(0, i - 1)); }
          else if (e.key === "Enter") { e.preventDefault(); if (matches[hoverIdx]) pick(matches[hoverIdx]); }
          else if (e.key === "Escape") { setOpen(false); }
        }}
        placeholder={placeholder || "Search people…"}
      />
      {clearable && selected && (
        <button type="button" className="ua-clear" onClick={clear} aria-label="Clear">
          <Icon name="close" className="ico ua-clear-icon" />
        </button>
      )}
      {open && (
        <div className="ua-menu">
          {matches.length === 0 ? (
            <div className="ua-empty">No matches</div>
          ) : matches.map((u, i) => (
            <button
              key={u.id} type="button"
              className={"ua-row" + (i === hoverIdx ? " hover" : "")}
              onMouseDown={(e) => { e.preventDefault(); pick(u); }}
              onMouseEnter={() => setHoverIdx(i)}
            >
              {!u.noAvatar && <Avatar user={u} size={24} online={u.presence === "online"} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ua-row-name">{u.name}</div>
                <div className="ua-row-title">{u.title}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MultiOwnerPicker ──────────────────────────────────────────────────
// Stack of owner avatars (no names). Click "+" to add via autocomplete;
// click an avatar to remove (second click confirms).
export function MultiOwnerPicker({ users, owners, onChange, size = 26 }) {
  const [adding, setAdding] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const wrapRef = useRef(null);
  // Filter out the system notification bot from the people you can add as
  // an owner - it never owns workspaces or stakeholders.
  const available = users.filter(u => u.role !== "system" && !owners.includes(u.id));

  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current?.contains(e.target)) { setAdding(false); setConfirmRemove(null); }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function addOwner(id) {
    if (!id || owners.includes(id)) return;
    onChange([...owners, id]);
    setAdding(false);
  }
  function removeOwner(id) {
    onChange(owners.filter(o => o !== id));
    setConfirmRemove(null);
  }

  return (
    <div className="multi-owner" ref={wrapRef}>
      <div className="multi-owner-stack">
        {owners.map(oid => {
          const u = users.find(x => x.id === oid);
          if (!u) return null;
          const isConfirm = confirmRemove === oid;
          return (
            <span
              key={oid}
              className={"multi-owner-av" + (isConfirm ? " confirm" : "")}
              title={isConfirm ? "Click to remove" : u.name}
              onClick={() => isConfirm ? removeOwner(oid) : setConfirmRemove(oid)}
              onMouseLeave={() => isConfirm && setConfirmRemove(null)}
            >
              <Avatar user={u} size={size} online={u.presence === "online"} />
              {isConfirm && (
                <span className="multi-owner-remove">
                  <Icon name="close" className="ico" />
                </span>
              )}
            </span>
          );
        })}
        {available.length > 0 && (
          <button
            type="button"
            className="multi-owner-add"
            style={{ width: size, height: size }}
            onClick={() => setAdding(o => !o)}
            aria-label="Add owner"
            title="Add owner"
          >
            +
          </button>
        )}
      </div>
      {adding && (
        <div className="multi-owner-picker">
          <UserAutocomplete
            users={available}
            value={null}
            onChange={addOwner}
            placeholder="Search people to add…"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

// ── ConfirmDialog ─────────────────────────────────────────────────────
export function ConfirmDialog({ open, title, body, confirmLabel, cancelLabel, danger, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <>
      <div className="modal-veil show" onClick={onCancel} />
      <div className="modal confirm-modal">
        <div className="modal-head">
          <h2>{title}</h2>
        </div>
        <div className="modal-body" style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
          {body}
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onCancel}>{cancelLabel || "Cancel"}</button>
          <button className={"btn " + (danger ? "btn-danger" : "btn-primary")} onClick={onConfirm}>{confirmLabel || "Confirm"}</button>
        </div>
      </div>
    </>
  );
}

// ── OwnersDisplay ─────────────────────────────────────────────────────
// Compact avatar stack for showing 1+ owners. Click to expand a popover
// with full names. Used in Sheet/Map/etc where we just *display* owners
// (not edit them).
export function OwnersDisplay({ users, owners, size = 22, label = "owners" }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onDoc(e) { if (!wrapRef.current?.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  if (!owners || owners.length === 0) {
    return <span className="muted" style={{ fontSize: 11 }}>-</span>;
  }
  const list = owners.map(id => users.find(u => u.id === id)).filter(Boolean);
  return (
    <span
      className="owners-display"
      ref={wrapRef}
      onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {list.map(u => <Avatar key={u.id} user={u} size={size} />)}
      {open && (
        <div className="owners-popover">
          <div className="owners-popover-head">{list.length} {list.length === 1 ? label.replace(/s$/, "") : label}</div>
          {list.map(u => (
            <div key={u.id} className="owners-popover-row">
              <Avatar user={u} size={22} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 12.5 }}>{u.name}</div>
                <div className="muted" style={{ fontSize: 11 }}>{u.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </span>
  );
}

