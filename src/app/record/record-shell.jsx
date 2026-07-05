/* record-shell.jsx — PHASE 14: the RECORD SCAFFOLD (RecordShell + MetaField),
 * assembled against the sealed box "Record scaffold, landing pages & page
 * shells" (src/guide.jsx ~3481–3606; SKELETON TREE SURFACE 1 + 1a). The
 * universal 3-region read/edit page every record type pours through: static
 * top bar (NO title ever) → left section rail · white center · right
 * metadata rail → pinned footer. Each section supplies render(editing) — the
 * SAME section renders read or edit off the editing flag (read↔edit parity,
 * the scaffold contract). Pure logic + sealed constants live in
 * record-logic.js (node-tested by scripts/record-test.mjs).
 *
 * BUILD-MAP READING (declared): the sealed BUILD-MAP says the 3-region
 * RecordShell "maps to the scaffold components: ui-app-shell (the page),
 * ui-sidebar (left rail), ui-inspector (right rail) … the top bar is the
 * ui-app-bar" — read as a COMPOSITION of the existing scaffold components,
 * not a new ui-record-shell element. The one design-system change is the
 * sealed tree's "ui-app-shell record variant" (header/footer full-width, the
 * rails inside the body row) — built into app-shell.js + manifest.json.
 *
 * DECLARED RECOMPOSITIONS (never silent):
 *  · Left rail = ui-sidebar (its own collapse toggle + collapsed icon rail
 *    stand in for the sealed chevron head-toggle; the edge-chevron is RETIRED
 *    by the shell ruling and the panel-icon toggle is the component's own).
 *    navTitle rides the brand slot (hidden when collapsed — sealed). The rail
 *    width re-points --ui-sys-sidebar-width in app.css (the sealed box names
 *    no width; the app shell's proportional clamp is too wide for a section
 *    rail).
 *  · Right rail = ui-inspector with its built-in close × (the map-scorecard
 *    precedent) standing in for the sealed head chevron toggle; when closed a
 *    reopen ui-icon-button (chevron_left) pins to the content edge — the
 *    sealed map-detail-reopen pattern. Both rails collapse INDEPENDENTLY
 *    (sealed): the sidebar owns navCollapsed, this shell owns railCollapsed.
 *  · MetaField edit controls = ui-text-field variant=plain (text/date),
 *    ui-textarea rows 4 (long), ui-select with a leading empty option for the
 *    sealed placeholder (select); tags edit as the sealed text-input form.
 *    A MetaField passed NO onChange renders its edit control DISABLED with a
 *    phase note (make-real law: the oracle's silent controlled-input inertness
 *    must LOOK inert).
 *  · MetaField gains an optional `display` node used in the read state when
 *    the value is non-empty (record pages render links/pills in read rows —
 *    the sealed profile anatomy — while the edit state stays the raw field).
 *  · MIGRATION LEDGER: Plans / Community / Settings / user-profile keep their
 *    own sealed bespoke shells (each satisfies its own sealed skeleton tree).
 *    Migrating them onto RecordShell is a recomposition decision to take WITH
 *    THE USER — recorded here, not silently done (replace-don't-duplicate
 *    applies when that ruling lands).
 */
import { useRef, useState } from 'react';
import { useUiEvent } from '../modals/stakeholder-modal.jsx';
import { mfIsEmpty, MF_EMPTY_GLYPH, REC_DEFAULTS, sectionFor, editToggle } from './record-logic.js';

const MF_INERT_NOTE = 'Not editable here — wires up with its record phase';

/* ── MetaField edit bridges (web components → React, the established ref
 * pattern; disabled = the honest inert form when no onChange is passed) ──── */

function MfText({ label, value, onChange, placeholder, type }) {
  const ref = useRef(null);
  const v = Array.isArray(value) ? value.join(',') : (value ?? '');
  useUiEvent(ref, 'input', onChange ? () => onChange(ref.current.value) : undefined);
  const sync = (el) => { ref.current = el; if (el && el.value !== v) el.value = v; };
  return (
    <ui-text-field
      ref={sync}
      variant="plain"
      class="mf-input"
      label={label}
      type={type || undefined}
      placeholder={placeholder}
      disabled={onChange ? undefined : ''}
      title={onChange ? undefined : MF_INERT_NOTE}
    ></ui-text-field>
  );
}

function MfLong({ label, value, onChange, placeholder }) {
  const ref = useRef(null);
  const v = value ?? '';
  useUiEvent(ref, 'input', onChange ? () => onChange(ref.current.value) : undefined);
  const sync = (el) => { ref.current = el; if (el && el.value !== v) el.value = v; };
  return (
    <ui-textarea
      ref={sync}
      rows={4}
      class="mf-input mf-long"
      aria-label={label}
      placeholder={placeholder}
      disabled={onChange ? undefined : ''}
      title={onChange ? undefined : MF_INERT_NOTE}
    ></ui-textarea>
  );
}

function MfSelect({ label, value, options, onChange, placeholder }) {
  const ref = useRef(null);
  useUiEvent(ref, 'change', onChange
    ? (e) => { if (e.target === ref.current) onChange(e.detail.value); }
    : undefined);
  return (
    <ui-select
      ref={ref}
      class="mf-input"
      value={value ?? ''}
      aria-label={label}
      disabled={onChange ? undefined : ''}
      title={onChange ? undefined : MF_INERT_NOTE}
    >
      {placeholder ? <ui-option value="">{placeholder}</ui-option> : null}
      {(options || []).map((o) => <ui-option key={o} value={o}>{o}</ui-option>)}
    </ui-select>
  );
}

/* ── MetaField — one field, two states (sealed 3481–3483) ─────────────────── */
export function MetaField({
  label, value, editing, type = 'text', options = [], placeholder, onChange,
  display,
}) {
  return (
    <label className="mf">
      <span className="mf-label">{label}</span>
      {!editing ? (
        <span className="mf-value">
          {mfIsEmpty(value) ? (
            <span className="mf-empty">{MF_EMPTY_GLYPH}</span>
          ) : type === 'tags' ? (
            <span className="mf-tags">
              {value.map((v) => <ui-chip key={v} variant="tag">{v}</ui-chip>)}
            </span>
          ) : display != null ? display : String(value)}
        </span>
      ) : type === 'long' ? (
        <MfLong label={label} value={value} onChange={onChange} placeholder={placeholder} />
      ) : type === 'select' ? (
        <MfSelect label={label} value={value} options={options} onChange={onChange} placeholder={placeholder} />
      ) : (
        /* date → the date field; text AND tags-while-editing → the sealed
           text-input form (there is no chip editor — sealed). */
        <MfText label={label} value={value} onChange={onChange} placeholder={placeholder}
                type={type === 'date' ? 'date' : undefined} />
      )}
    </label>
  );
}

/* ── RecordShell — the universal page (sealed 3485–3491, TREE SURFACE 1) ──── */
export function RecordShell({
  backLabel, onBack, backInertNote, pageIcon, title, subtitle, editing,
  onToggleEdit, sections = [], rightRail, navTitle, railTitle, toolbar, footer,
}) {
  const [active, setActive] = useState(sections[0] ? sections[0].id : null);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const railRef = useRef(null);
  useUiEvent(railRef, 'close', () => setRailCollapsed(true));

  const section = sectionFor(sections, active);
  const tog = editToggle(!!editing);
  const railName = railTitle || REC_DEFAULTS.railTitle;

  return (
    <ui-app-shell variant="record" class="record-wrap">
      {/* STATIC TOP BAR — the page title NEVER lives here (sealed). The
          app-bar's empty title span is the sealed flex spacer. */}
      <ui-app-bar slot="header" variant="flat" class="record-topbar">
        {(onBack || backInertNote) ? (
          <ui-button
            slot="leading"
            variant="text"
            class="plan-back"
            disabled={onBack ? undefined : ''}
            title={onBack ? undefined : backInertNote}
            onClick={onBack || undefined}
          >
            <ui-icon slot="leading">chevron_left</ui-icon>
            {backLabel || REC_DEFAULTS.backLabel}
          </ui-button>
        ) : null}
        {toolbar ? <span slot="trailing" className="record-toolbar">{toolbar}</span> : null}
        {onToggleEdit ? (
          <ui-button
            slot="trailing"
            class="record-edit-btn"
            variant={editing ? 'filled' : 'outlined'}
            onClick={onToggleEdit}
          >
            <ui-icon slot="leading">{tog.icon}</ui-icon>
            {tog.label}
          </ui-button>
        ) : null}
      </ui-app-bar>

      {/* LEFT RAIL — the section nav SELECTS WHICH SECTION RENDERS (sealed). */}
      <ui-sidebar slot="nav" class="record-nav">
        <span slot="brand" className="record-nav-title">
          {navTitle || REC_DEFAULTS.navTitle}
        </span>
        {sections.map((s) => (
          <ui-sidebar-item
            key={s.id}
            class="record-nav-item"
            active={section && s.id === section.id ? '' : undefined}
            title={s.label}
            onClick={() => setActive(s.id)}
          >
            <ui-icon slot="icon">{s.icon || REC_DEFAULTS.navFallbackIcon}</ui-icon>
            {s.label}
          </ui-sidebar-item>
        ))}
      </ui-sidebar>

      {/* CENTER — the ONLY width-flexible region; the page header lives IN
          the content (sealed: eyebrow subtitle above the title). */}
      <div className="record-main">
        <div className="record-page-head">
          {pageIcon ? (
            <span className="record-page-icon"><ui-icon>{pageIcon}</ui-icon></span>
          ) : null}
          <div className="record-page-titles">
            {subtitle ? <span className="record-page-eyebrow">{subtitle}</span> : null}
            <span className="record-page-title">{title}</span>
          </div>
        </div>
        {section ? <div className="record-section-head">{section.label}</div> : null}
        <div className="record-section-body">
          {section ? section.render(!!editing) : null}
        </div>
        {rightRail && railCollapsed ? (
          <ui-icon-button
            class="record-rail-reopen"
            variant="outlined"
            title={`Reopen ${railName.toLowerCase()} rail`}
            aria-label={`Reopen ${railName.toLowerCase()} rail`}
            onClick={() => setRailCollapsed(false)}
          >
            <ui-icon>chevron_left</ui-icon>
          </ui-icon-button>
        ) : null}
      </div>

      {/* RIGHT RAIL — metadata; collapses INDEPENDENTLY of the nav (sealed). */}
      {rightRail ? (
        <ui-inspector
          slot="aside"
          ref={railRef}
          class="record-rail"
          open={railCollapsed ? undefined : ''}
          close-label={`Hide ${railName.toLowerCase()} rail`}
        >
          <span slot="title" className="record-rail-title">{railName}</span>
          {rightRail}
        </ui-inspector>
      ) : null}

      {/* PINNED FOOTER — only when passed (sealed). */}
      {footer ? (
        <ui-status-bar slot="footer" class="record-footer">{footer}</ui-status-bar>
      ) : null}
    </ui-app-shell>
  );
}
