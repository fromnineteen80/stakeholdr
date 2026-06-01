import { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import { STAKEHOLDER_DATA } from './data';
// Shared small components - pills, swatches, icons.

export function StatusPill({ status, size = "sm" }) {
  const meta = STAKEHOLDER_DATA.STATUSES[status];
  if (!meta) return null;
  return (
    <span
      className="pill"
      data-zone={status}
      style={{
        background: meta.color,
        color: meta.text,
        borderColor: "rgba(0,0,0,.06)",
        fontSize: size === "lg" ? 12 : 11,
        padding: size === "lg" ? "3px 10px" : "2px 8px"
      }}
    >
      {status}
    </span>
  );
}

export function PriorityPill({ value }) {
  const map = {
    High:   { bg: "#F1DBD0", fg: "#7A2E12" },
    Medium: { bg: "#EEE6D2", fg: "#6E5419" },
    Low:    { bg: "#E1E1DA", fg: "#54524A" }
  };
  const s = map[value] || map.Low;
  // Match the .tag pill shape used in the Tags column.
  return (
    <span
      className="tag"
      style={{ background: s.bg, color: s.fg, borderColor: "transparent" }}
    >
      {value}
    </span>
  );
}

export function StatusDot({ value }) {
  const map = {
    Active:  "#3E7A2E",
    Watch:   "#B5552C",
    Dormant: "#9B9684"
  };
  return (
    <span className="row" style={{ fontSize: 12 }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: map[value] || "#9B9684",
        display: "inline-block"
      }} />
      {value}
    </span>
  );
}

export function Tags({ values }) {
  if (!values || !values.length) return <span className="muted">-</span>;
  return (
    <span className="pills-inline">{values.slice(0,3).map(t => <span className="tag" key={t}>{t}</span>)}{values.length > 3 ? <span className="muted">+{values.length-3}</span> : null}</span>
  );
}

export function Icon({ name, className = "ico" }) {
  // Google Material Symbols (Outlined). Each app icon name maps to a
  // Material Symbol ligature; rendered as an icon-font glyph.
  const SYMBOLS = {
    search:    "search",
    plus:      "add",
    filter:    "filter_list",
    sort:      "swap_vert",
    download:  "download",
    close:     "close",
    target:    "map",
    grid:      "settings",
    work:      "work",
    table:     "table_rows",
    category:  "category",
    cases:     "cases",
    language:  "language",
    beenhere:  "beenhere",
    apartment: "apartment",
    check:     "check",
    content_copy: "content_copy",
    user:      "person",
    users:     "groups",
    help:      "help",
    map:       "map",
    sliders:   "thumb_up",
    plan:      "description",
    lock:      "lock",
    message:   "chat",
    expand:    "open_in_full",
    logout:    "logout",
    edit:      "edit",
    chevron:   "expand_more",
    chevronUp: "expand_less",
    layers:    "layers",
    community: "favorite",
    "drag":    "drag_indicator",
    "chevron-left": "chevron_left",
    "chevron-right": "chevron_right",
    "double-left": "keyboard_double_arrow_left",
    "double-right": "keyboard_double_arrow_right",
    sparkle:   "auto_awesome",
    brandmark: "id_card",
    build:     "build",
    clock:     "history",
    mail:      "mail",
    phone:     "call"
  };
  const ligature = SYMBOLS[name] || name;
  return (
    <span className={"material-symbols-outlined msym " + (className || "")} aria-hidden="true">{ligature}</span>
  );
}

// Quadrant rect at user coords (x, y) → CSS top/left percent.
// The dot layer is set up so its 0-100% corresponds to x: -10..10, y: 10..-10.
export function coordToPct(x, y) {
  const cx = ((x + 10) / 20) * 100;
  const cy = ((10 - y) / 20) * 100;
  return { left: cx + "%", top: cy + "%" };
}
export function pctToCoord(leftPct, topPct) {
  const x = (leftPct / 100) * 20 - 10;
  const y = 10 - (topPct / 100) * 20;
  return { x, y };
}

export function abbrev(name) {
  // 2-letter initials from name
  if (!name) return "·";
  const parts = name.replace(/^(Mayor|Rep\.|Sen\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i,"").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

// Abbreviates a political/honorific title for compact display in tables.
// Returns the input unchanged if there's no abbreviation rule.
export function abbrevTitle(title) {
  if (!title) return "";
  const t = title.trim();
  const map = {
    "Senator": "Sen.",
    "Representative": "Rep.",
    "Assemblymember": "Asm.",
    "Governor": "Gov."
  };
  return map[t] || t;
}

// Renders a stakeholder's display name from structured fields when available,
// falling back to the legacy `name` field. "Other" titles use the user's
// freeform titleOther value.
export function displayName(s) {
  if (!s) return "";
  const first = (s.firstName || "").trim();
  const last  = (s.lastName  || "").trim();
  if (!first && !last) return s.name || "";
  const rawTitle = s.title === "Other" ? (s.titleOther || "") : s.title;
  const t = rawTitle ? abbrevTitle(rawTitle) + " " : "";
  return (t + first + (last ? " " + last : "")).trim();
}

// Normalizes a URL the user typed (strips/adds protocol).
export function normalizeUrl(raw) {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "https://" + trimmed;
}

// Formats a US phone number as (xxx) xxx-xxxx regardless of how it's typed.
// Falls back to the raw input if it isn't a recognizable 10-digit (or
// 1+10-digit) US number - e.g. international numbers are left as-is.
export function formatPhone(raw) {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  let d = digits;
  if (d.length === 11 && d[0] === "1") d = d.slice(1);
  if (d.length === 10) {
    return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  }
  return String(raw).trim();
}

// Long human date: "June 1, 2026". Accepts YYYY-MM-DD or ISO.
export function formatDateLong(raw) {
  if (!raw) return "";
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw + "T00:00:00" : raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

// Shared filter section: a labeled row of multi-select chips with a leading
// "All" chip (active when nothing in the section is selected; clears it).
// Used by the List bar and the profile tables so filtering is standardized.
export function FilterSection({ label, values, active, onToggle, render }) {
  if (!values || values.length === 0) return null;
  const act = active || [];
  const none = act.length === 0;
  return (
    <div className="filter-pop-section">
      <span className="lbl filter-pop-label">{label}</span>
      <div className="filter-chips">
        <button type="button" className={"filter-chip" + (none ? " on" : "")} onClick={() => act.slice().forEach(onToggle)}>All</button>
        {values.map(v => (
          <button key={v} type="button" className={"filter-chip" + (act.includes(v) ? " on" : "")} onClick={() => onToggle(v)}>
            {render ? render(v) : v}
          </button>
        ))}
      </div>
    </div>
  );
}

// Shared sort control: a field list where selecting a field reveals an
// adaptive direction segmented control (A→Z/Z→A for text, Oldest/Newest for
// dates, Low/High for numbers). Standardized across the List bar + profile.
// fields: [{ key, label, type? }]   onSet(key, dir)
export function SortFieldList({ fields, sortKey, sortDir, onSet }) {
  function inferType(f) {
    if (f.type) return f.type;
    if (/updatedAt|createdAt|lastContact|_updated|_created|date/i.test(f.key)) return "date";
    if (f.key === "_x" || f.key === "_y" || /amount|count|weight|score/i.test(f.key)) return "num";
    return "text";
  }
  return (
    <div className="sort-fieldlist">
      {fields.map(f => {
        const active = sortKey === f.key;
        const type = inferType(f);
        const [ascLbl, descLbl] = type === "date" ? ["Oldest first", "Newest first"]
          : type === "num" ? ["Low → High", "High → Low"] : ["A → Z", "Z → A"];
        return (
          <div key={f.key} className={"sort-fieldrow" + (active ? " active" : "")}>
            <button className="sort-fieldname" onClick={() => onSet(f.key, active ? sortDir : (type === "date" ? "desc" : "asc"))}>
              {active ? "● " : ""}{f.label}
            </button>
            {active && (
              <div className="sort-dir-seg">
                <button className={sortDir === "asc" ? "on" : ""} onClick={() => onSet(f.key, "asc")}>{ascLbl}</button>
                <button className={sortDir === "desc" ? "on" : ""} onClick={() => onSet(f.key, "desc")}>{descLbl}</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

