/* stakeholder-modal.jsx — the sealed StakeholderModal (create/edit) + the
 * sealed read-only StakeholderProfile, assembled as page-hosted ui-dialog
 * compositions against their SKELETON TREES in src/guide.jsx.
 *
 * Composition (Canonical UI law): every interactive element is a real ui-*
 * component — ui-dialog (main card, stacked delete-confirm, view-all overlay),
 * ui-text-field variant=plain (caption-labelled fields with the sealed
 * placeholders), ui-select, ui-switch (the "Add a person" toggle), ui-chip
 * (IssueSelector), ui-owner-picker, ui-date-picker, ui-textarea, ui-upload
 * (the GAP photo picker), ui-avatar, ui-button (incl. tone=danger),
 * ui-icon-button, ui-icon, ui-tooltip. Layout-only classes live in app.css
 * (token-only).
 *
 * All pure logic (defaults, validation, name composition, IssueSelector
 * model, community cross-link formulas) is imported from stakeholder-logic.js
 * so scripts/modal-test.mjs asserts it in node.
 *
 * SEALED DISMISSAL CONTRACT: three equivalent routes close the main modal —
 * scrim click, head close, footer Cancel — all discard the draft silently.
 * The stacked delete-confirm's own scrim/Escape closes ONLY the confirm (it
 * is a SIBLING ui-dialog, never nested, so its close/Escape can never fall
 * through to the main dialog).
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  GEOGRAPHIES, US_STATES, STATE_ABBR, siteLabel,
} from '../data/catalogs.js';
/* REAL as of Phase 11: categories/markets/sites read the LIVE appConfig-with-
 * seed-fallback seam (sealed present-AND-non-empty contract) — the modal's
 * cascading selects follow Settings, never the raw seeds (sealed CONFIG →
 * CATALOG OVERRIDE contract). */
import { useCompanyCatalogs } from '../data/company.js';
import { weightedCoord, statusFor } from '../data/engine.js';
import {
  displayName, formatPhone, normalizeUrl,
} from '../../../design-system/components/stakeholder-table.js';
import {
  draftFrom, shMissing, composeSubmit, TITLE_OPTIONS,
  addIssueValue, commitCustomText, issueSelectorModel,
  CREATE_NOTICE, OWNERS_HELP_EDIT, OWNERS_HELP_CREATE,
  formatDateLong, affiliatedCommunity, stakeholderCumulativeUSD,
  communityEntryAmount,
} from './stakeholder-logic.js';

/* ── web-component bridges (custom events don't reach React's synthetic
 * system; every ui-* change/input/close subscribes through refs) ─────────── */

export function useUiEvent(ref, type, handler) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !handler) return undefined;
    el.addEventListener(type, handler);
    return () => el.removeEventListener(type, handler);
  }, [ref, type, handler]);
}

/* Caption-labelled field shell — the sealed span.lbl + control anatomy. */
export function Field({ label, help, children, className }) {
  return (
    <div className={'sh-field' + (className ? ' ' + className : '')}>
      <span className="sh-lbl">{label}</span>
      {help ? <span className="sh-help">{help}</span> : null}
      {children}
    </div>
  );
}

/* ui-text-field variant=plain: visible caption comes from Field; the label
 * attr stays for the component's aria-label; placeholder = the sealed copy.
 * min/max/step forward to the component (it relays them to its inner input —
 * the sealed number-field constraints, e.g. years min="1"). */
export function TF({
  label, placeholder, value, onValue, onBlurValue, supporting, fieldRef, type,
  min, max, step,
}) {
  const localRef = useRef(null);
  const ref = fieldRef || localRef;
  useEffect(() => {
    const el = ref.current;
    if (el && el.value !== (value ?? '')) el.value = value ?? '';
  }, [ref, value]);
  useUiEvent(ref, 'input', () => onValue && onValue(ref.current.value));
  useUiEvent(ref, 'focusout', () => onBlurValue && onBlurValue(ref.current.value));
  return (
    <ui-text-field
      ref={ref}
      variant="plain"
      label={label}
      type={type || undefined}
      min={min ?? undefined}
      max={max ?? undefined}
      step={step ?? undefined}
      placeholder={placeholder}
      supporting-text={supporting}
    ></ui-text-field>
  );
}

export function Sel({ value, options, onChange, ariaLabel }) {
  const ref = useRef(null);
  useUiEvent(ref, 'change', (e) => {
    if (e.target === ref.current) onChange(e.detail.value);
  });
  return (
    <ui-select ref={ref} value={value ?? ''} aria-label={ariaLabel}>
      {options.map((o) => {
        const v = typeof o === 'object' ? o.value : o;
        const l = typeof o === 'object' ? o.label : o;
        return <ui-option key={l} value={v}>{l}</ui-option>;
      })}
    </ui-select>
  );
}

function Toggle({ selected, onChange, children }) {
  const ref = useRef(null);
  useUiEvent(ref, 'change', () => onChange(ref.current.hasAttribute('selected')));
  return (
    <ui-switch ref={ref} selected={selected ? '' : undefined}>{children}</ui-switch>
  );
}

export function DateField({ label, value, onChange }) {
  const ref = useRef(null);
  useUiEvent(ref, 'change', (e) => onChange(e.detail.value));
  return <ui-date-picker ref={ref} label={label} value={value || ''}></ui-date-picker>;
}

export function Owners({ users, value, onChange, readonly, size }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.users = users || [];
    el.value = value || [];
  }, [users, value]);
  useUiEvent(ref, 'change', (e) => onChange && onChange(e.detail.value));
  return (
    <ui-owner-picker ref={ref} size={size || 'sm'}
                     readonly={readonly ? '' : undefined}></ui-owner-picker>
  );
}

export function TA({ value, onValue, placeholder, rows }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.value !== (value ?? '')) el.value = value ?? '';
  }, [value]);
  useUiEvent(ref, 'input', () => onValue(ref.current.value));
  // No label attr: the caption above (Field .sh-lbl) is the visible label —
  // a floating component label would double it.
  return <ui-textarea ref={ref} rows={rows || 3} placeholder={placeholder}></ui-textarea>;
}

/* ui-autocomplete bridge in PICKER mode (sealed PLANAUTOCOMPLETE config:
 * 8-result cap, open-on-focus full list on empty query, label-OR-sub match,
 * two-line rows, pick clears + closes). Shared home: Plans + Community both
 * compose it (single source — moved here from plan.jsx at the Community
 * phase, replace-don't-duplicate). */
export function Picker({ options, placeholder, onPick, autoFocus }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.options = options || [];
  }, [options]);
  useEffect(() => {
    if (autoFocus && ref.current) {
      const t = setTimeout(() => ref.current && ref.current.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);
  useUiEvent(ref, 'change', (e) => onPick(e.detail.value));
  return (
    <ui-autocomplete
      ref={ref}
      class="plan-picker"
      placeholder={placeholder}
      max-results="8"
      clear-on-select=""
    ></ui-autocomplete>
  );
}

/* Portal-mounted ui-menu that opens on mount and reports its close (the
 * component owns positioning/outside-dismiss/keyboard; portal to body per the
 * shell's page-coordinate precedent). Shared home (see Picker note). */
export function PopMenu({ anchorId, onClose, className, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute('anchor', anchorId);
    el.show();
  }, [anchorId]);
  useUiEvent(ref, 'ui-menu-close', onClose);
  return createPortal(
    <ui-menu ref={ref} class={className}>{children}</ui-menu>,
    document.body,
  );
}

function PhotoUpload({ hasPhoto, onData }) {
  const ref = useRef(null);
  useUiEvent(ref, 'change', (e) => onData(e.detail.dataUrl));
  return (
    <ui-upload ref={ref} accept="image/*" variant="outlined">
      {hasPhoto ? 'Replace photo' : 'Upload photo'}
    </ui-upload>
  );
}

/* Selected IssueSelector chip: ui-chip input variant — the × emits `remove`,
 * and (sealed) clicking the chip body also removes (title "Click to remove"). */
function SelChip({ value, onRemove }) {
  const ref = useRef(null);
  useUiEvent(ref, 'remove', onRemove);
  return (
    <ui-chip ref={ref} variant="input" title="Click to remove" onClick={onRemove}>
      {value}
    </ui-chip>
  );
}

/* ── IssueSelector (sealed sub-control; used for BOTH Issues and Tags) ───── */
export function IssueSelector({ selected, company, restrict, onChange }) {
  const model = issueSelectorModel({ selected, company, restrict });
  const inRef = useRef(null);

  const commit = () => {
    const el = inRef.current;
    if (!el || !el.value) return;
    const next = commitCustomText(selected, el.value);
    if (next !== selected) onChange(next);
    el.value = '';
  };
  // Sealed handler #37: Enter commits; "," commits inline (preventDefault
  // keeps the comma out of the input); Backspace on an EMPTY draft removes
  // the LAST selected value.
  useUiEvent(inRef, 'keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    else if (e.key === ',') { e.preventDefault(); commit(); }
    else if (e.key === 'Backspace' && !(inRef.current && inRef.current.value)) {
      if (selected.length) onChange(selected.slice(0, -1));
    }
  });
  // Sealed handler #38: blur commits any pending text.
  useUiEvent(inRef, 'focusout', commit);

  return (
    <div className="issue-selector">
      {model.selected.length > 0 && (
        <ui-chip-set class="issue-row">
          {model.selected.map((v) => (
            <SelChip key={v} value={v} onRemove={() => onChange(selected.filter((x) => x !== v))} />
          ))}
        </ui-chip-set>
      )}
      {model.available.length > 0 && (
        <ui-chip-set class="issue-row">
          {model.available.map((v) => (
            <ui-chip
              key={v}
              variant="assist"
              onClick={() => onChange(addIssueValue(selected, v))}
            >{'+ ' + v}</ui-chip>
          ))}
        </ui-chip-set>
      )}
      {model.showCustomInput && (
        <ui-text-field
          ref={inRef}
          class="issue-custom"
          variant="plain"
          label="Add custom issues"
          placeholder="Add custom issues, separated by commas"
        ></ui-text-field>
      )}
    </div>
  );
}

/* ── read-only profile primitives (sealed Shared-UI-primitives) ────────────
 * COMPOSITION LAW: the pill/dot visuals live in ONE place — the design
 * system's ui-chip priority/zone/tag variants + ui-status-dot
 * (design-system/components/chips.js). These wrappers only compose them;
 * never hand-rolled spans (the old .tag/.pill/.status-dot/.zone-pill app.css
 * rules are deleted). */

export function TagPills({ values }) {
  if (!values || !values.length) return <span className="muted">-</span>;
  const extra = values.length - 3;
  return (
    <span className="pills-inline">
      {values.slice(0, 3).map((v) => <ui-chip variant="tag" key={v}>{v}</ui-chip>)}
      {/* sealed Tags primitive: the "+N" overflow is a MUTED TEXT SPAN, not a chip */}
      {extra > 0 && <span className="muted">+{extra}</span>}
    </span>
  );
}

function StatusDot({ value }) {
  // ui-status-dot null-guards an empty value (renders nothing); the profile's
  // empty-field convention is a literal "-", so guard here.
  if (!value) return <span className="muted">-</span>;
  return <ui-status-dot value={value}></ui-status-dot>;
}

export function PriorityPill({ value }) {
  // value matched case-insensitively; unknown falls back to the Low pair
  // (sealed rule, implemented inside the variant).
  return <ui-chip variant="priority" value={value || ''}>{value || ''}</ui-chip>;
}

export function PRow({ k, children, full }) {
  return (
    <div className={full ? 'prof-row prof-fullrow' : 'prof-row'}>
      <div className="prof-k">{k}</div>
      <div className="prof-v">{children}</div>
    </div>
  );
}

/* One community-engagement row (sealed census C9: clicking opens that
 * community entry read-only). REAL wherever the host supplies onOpen — the
 * Community page wires it to its own read view; every other shell host
 * (Lists / Map / Scoring / Plans) routes through the shell's community
 * deep-link seam. A host without the route renders the inert variant —
 * never a live-looking dead affordance. The sealed C11 in-place subject
 * swap belongs to the Profiles phase. */
function EngagementRow({ a, onOpen }) {
  return (
    <div
      className={'profile-entry' + (onOpen ? ' profile-entry-link' : '')}
      title={onOpen
        ? 'Open application'
        : 'Opens when this surface wires the community route'}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen || undefined}
      onKeyDown={onOpen ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.key === ' ') e.preventDefault();
          onOpen();
        }
      } : undefined}
    >
      <span className="profile-entry-main">
        <span className="profile-entry-name">{a.name}</span>
        <span className="profile-entry-meta">{a.kind} · {a.stage}</span>
      </span>
      <span className="profile-entry-amt">{communityEntryAmount(a)}</span>
      <ui-icon size="sm">chevron_right</ui-icon>
    </div>
  );
}

/* ── THE MODAL ────────────────────────────────────────────────────────────── */

export function StakeholderModal({
  open,
  existing,          // stakeholder record (edit) or null (create)
  initialView,       // open on the sealed read-only profile
  users, currentUser,
  companyIssues, companyTags,
  community, scores, team,
  getWorkspacesForStakeholder,
  onCancel, onSubmit, onDelete,
  onOpenCommunity, // optional: opens a community entry read-only (census C9)
  onOpenWorkspace, // optional: opens that workspace's Lists tab (census C8)
}) {
  const isEdit = !!existing;
  const { companyCategories, companyMarkets, companySites } = useCompanyCatalogs();
  const dlgRef = useRef(null);
  const confirmRef = useRef(null);
  const viewAllRef = useRef(null);
  const orgRef = useRef(null);

  const [draft, setDraft] = useState(() => draftFrom(existing, currentUser, companyCategories));
  const [viewMode, setViewMode] = useState(!!(initialView && existing));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [viewAll, setViewAll] = useState(false);

  // Sealed re-seed effect (keyed on the target): the draft, the view/edit
  // flip, and the stacked overlays all reset when the modal (re)opens or the
  // target record changes.
  const existingId = existing ? existing.id : null;
  useEffect(() => {
    if (!open) return;
    setDraft(draftFrom(existing, currentUser, companyCategories));
    setViewMode(!!(initialView && existing));
    setConfirmDelete(false);
    setViewAll(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existingId]);

  // Sealed: the Organization field has autoFocus. ui-dialog focuses the first
  // focusable slotted element on open; re-point it at Organization after the
  // dialog's own focus pass.
  useEffect(() => {
    if (!open || viewMode) return;
    const t = setTimeout(() => { orgRef.current && orgRef.current.focus(); }, 80);
    return () => clearTimeout(t);
  }, [open, viewMode]);

  // Dismissals. Main dialog close (scrim / Escape / programmatic) → onCancel;
  // the stacked dialogs close ONLY themselves (target guards keep the
  // bubbling composed `close` events from crossing dialogs).
  useUiEvent(dlgRef, 'close', (e) => {
    if (e.target === dlgRef.current && open) onCancel();
  });
  useUiEvent(confirmRef, 'close', (e) => {
    if (e.target === confirmRef.current) setConfirmDelete(false);
  });
  useUiEvent(viewAllRef, 'close', (e) => {
    if (e.target === viewAllRef.current) setViewAll(false);
  });

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const missing = shMissing(draft, companySites);
  const valid = missing.length === 0;

  const submit = () => {
    if (!valid) return; // sealed: guarded no-op while invalid
    onSubmit(composeSubmit(draft));
  };

  /* ---- read-only profile computations (sealed profile box) ---- */
  const s = existing;
  const wc = s ? weightedCoord(s.id, scores || {}, team || []) : { x: 0, y: 0 };
  const relStatus = statusFor(wc.x, wc.y);
  const affil = s ? affiliatedCommunity(s.id, community || []) : [];
  const cumulative = s ? stakeholderCumulativeUSD(s.id, community || []) : 0;
  const wsList = s && getWorkspacesForStakeholder ? getWorkspacesForStakeholder(s.id) : [];
  const history = s
    ? (s.notesHistory || []).slice().sort((a, b) => (b.at || '').localeCompare(a.at || ''))
    : [];
  const userById = (id) => (users || []).find((u) => u.id === id);
  const siteOf = (id) => companySites.find((x) => x.id === id);

  const profSub = s
    ? (s.isPerson && s.title
        ? `${s.org} · ${s.title === 'Other' ? (s.titleOther || '') : s.title}`
        : s.org)
    : '';

  return (
    <>
      {/* ── MAIN DIALOG — profile (viewMode) or the form ─────────────────── */}
      <ui-dialog ref={dlgRef} open={open ? '' : undefined} class="sh-dialog">
        {open && viewMode && s ? (
          <>
            {/* SEALED PROFILE HEADER: avatar · titles · actions */}
            <div slot="headline" className="prof-header">
              {/* ui-avatar is the ONE avatar primitive: photo when set, else
                  initials (its built fallback stands in for the oracle's
                  user/users glyph). */}
              <ui-avatar
                size="lg"
                name={displayName(s) || s.name || ''}
                src={s.photo || undefined}
              ></ui-avatar>
              <div className="prof-titles">
                <div className="prof-title">{displayName(s) || s.name}</div>
                <div className="prof-sub">{profSub}</div>
                <div className="prof-tagline">
                  {/* The shared zone variant carries the sealed NULL-GUARD:
                      an uncatalogued zone renders nothing, never an empty
                      pill (statusFor always returns a catalogued zone, so
                      this is belt-and-braces). */}
                  <ui-chip variant="zone" data-zone={relStatus}>{relStatus}</ui-chip>
                  <span className="prof-coords">x {wc.x.toFixed(1)} · y {wc.y.toFixed(1)}</span>
                </div>
              </div>
              <div className="prof-actions">
                <ui-button variant="text" onClick={() => setViewMode(false)}>Edit stakeholder</ui-button>
                <ui-icon-button variant="standard" aria-label="Close" onClick={onCancel}>
                  <ui-icon>close</ui-icon>
                </ui-icon-button>
              </div>
            </div>

            {/* SEALED PROFILE BODY — section stack */}
            <div className="prof-body">
              <div className="cm-section-label">Identity</div>
              <div className="prof-grid">
                <PRow k="Type">{s.category} · {s.type}</PRow>
                <PRow k="Status"><StatusDot value={s.status} /></PRow>
                <PRow k="Market">{s.market || '-'}</PRow>
                <PRow k="Region">{s.region || '-'}</PRow>
                <PRow k="Site">{s.site ? (siteLabel(siteOf(s.site) || {}) || '-') : '-'}</PRow>
                <PRow k="State">{s.state ? (STATE_ABBR[s.state] || s.state) : '-'}</PRow>
                <PRow k="Geography">{s.geography || '-'}</PRow>
                <PRow k="Last contact">{s.lastContact ? formatDateLong(s.lastContact) : '-'}</PRow>
              </div>
              <PRow k="Priority" full><PriorityPill value={s.priority} /></PRow>

              <div className="cm-section-label">Contact</div>
              <div className="prof-grid">
                <PRow k="Website">
                  {s.url
                    ? <a className="plain-link" href={normalizeUrl(s.url)} target="_blank" rel="noopener noreferrer">{s.url}</a>
                    : '-'}
                </PRow>
                <PRow k="Email">
                  {s.email ? <a className="plain-link" href={'mailto:' + s.email}>{s.email}</a> : '-'}
                </PRow>
                <PRow k="Phone">{s.phone ? formatPhone(s.phone) : '-'}</PRow>
                <PRow k="X account">{s.xAccount || '-'}</PRow>
              </div>

              <div className="cm-section-label">Ownership &amp; reach</div>
              {/* Sealed: the profile's Owners is the READ-ONLY stack
                  (OwnersDisplay) — editing owners happens in the form. */}
              <PRow k="Owners" full>
                <Owners users={users} value={s.owners || []} readonly />
              </PRow>
              {/* Census C8 (REAL as of the Workspaces phase): workspace chips
                  navigate to that workspace's Lists tab, then the profile
                  closes (sealed order: onOpenWorkspace(w.id), then onClose).
                  Chips are clickable ONLY where the host wires the route —
                  a host without it renders the sealed plain tag pills
                  (declared inert, never a live-looking dead affordance). */}
              <PRow k="Workspaces" full>
                {wsList.length
                  ? (
                    <span className="pills-inline">
                      {wsList.map((w) => onOpenWorkspace ? (
                        <ui-chip
                          key={w.id}
                          variant="assist"
                          onClick={() => { onOpenWorkspace(w.id); onCancel(); }}
                        >{w.name}</ui-chip>
                      ) : (
                        <ui-chip variant="tag" key={w.id}>{w.name}</ui-chip>
                      ))}
                    </span>
                  )
                  : '-'}
              </PRow>

              <div className="prof-tagsissues">
                <div className="prof-ti-col">
                  <div className="prof-k">Tags</div>
                  <TagPills values={s.tags} />
                </div>
                <div className="prof-ti-col">
                  <div className="prof-k">Issues</div>
                  <TagPills values={s.issues} />
                </div>
              </div>

              <div className="cm-section-label">Community engagements</div>
              <div className="profile-cumulative">
                <span className="prof-k">Cumulative committed</span>
                <span className={'profile-cumulative-val' + (cumulative > 0 ? ' is-pos' : '')}>
                  ${cumulative.toLocaleString()}
                </span>
              </div>
              {affil.length === 0 ? (
                <div className="muted sh-empty-line">No community engagements linked yet.</div>
              ) : (
                <div className="profile-entry-list">
                  {affil.slice(0, 5).map((a) => (
                    <EngagementRow
                      a={a}
                      key={a.id}
                      onOpen={onOpenCommunity ? () => onOpenCommunity(a.id) : null}
                    />
                  ))}
                  {affil.length > 5 && (
                    <ui-button variant="text" class="sh-viewall" onClick={() => setViewAll(true)}>
                      View all {affil.length} engagements
                    </ui-button>
                  )}
                </div>
              )}

              <div className="cm-section-label">Notes</div>
              {history.length === 0 && !s.notes ? (
                <div className="muted sh-empty-line">No notes recorded.</div>
              ) : history.length ? (
                <div className="notes-history">
                  {history.map((n) => {
                    const by = n.by ? userById(n.by) : null;
                    return (
                      <div className="notes-entry" key={n.id}>
                        <div className="notes-entry-meta">
                          <span className="notes-entry-date">{n.at ? formatDateLong(n.at) : ''}</span>
                          {by ? <span className="notes-entry-by">· {by.name}</span> : null}
                        </div>
                        <div className="notes-entry-body">{n.body}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="prof-legacy-note">{s.notes}</p>
              )}
            </div>
          </>
        ) : open ? (
          <>
            {/* SEALED FORM HEAD: title · [edit] View Stakeholder · close */}
            <div slot="headline" className="sh-head">
              <div className="sh-head-left">
                <span className="sh-title">{isEdit ? 'Edit stakeholder' : 'New stakeholder'}</span>
                {isEdit && (
                  <ui-tooltip>
                    <ui-button variant="text" onClick={() => setViewMode(true)}>View Stakeholder</ui-button>
                    <span slot="content">View full profile</span>
                  </ui-tooltip>
                )}
              </div>
              <ui-icon-button variant="standard" aria-label="Close" onClick={onCancel}>
                <ui-icon>close</ui-icon>
              </ui-icon-button>
            </div>

            {/* SEALED FORM BODY — rows 1..16 in tree order */}
            <div className="sh-body">
              {/* 1 · PHOTO + IDENTITY ROW */}
              <div className="sh-photo-row">
                <ui-avatar
                  size="lg"
                  name={draft.isPerson
                    ? `${draft.firstName} ${draft.lastName}`.trim() || draft.org || ''
                    : draft.org || ''}
                  src={draft.photo || undefined}
                ></ui-avatar>
                <div className="sh-field">
                  <span className="sh-lbl">Profile image</span>
                  <div className="sh-photo-actions">
                    <PhotoUpload hasPhoto={!!draft.photo} onData={(dataUrl) => set({ photo: dataUrl })} />
                    {draft.photo && (
                      <ui-button variant="text" onClick={() => set({ photo: null })}>Remove</ui-button>
                    )}
                  </div>
                </div>
              </div>

              {/* 2 · ORGANIZATION + WEBSITE */}
              <div className="sh-row-2">
                <Field label="Organization">
                  <TF
                    fieldRef={orgRef}
                    label="Organization"
                    placeholder="e.g. City of Cedarville"
                    value={draft.org}
                    onValue={(v) => set({ org: v })}
                  />
                </Field>
                <Field label="Website">
                  <TF
                    label="Website"
                    placeholder="cityofcedarville.gov"
                    supporting="Skip http: we add it."
                    value={draft.url}
                    onValue={(v) => set({ url: v })}
                  />
                </Field>
              </div>

              {/* 3 · ADD-A-PERSON TOGGLE */}
              <Toggle selected={draft.isPerson} onChange={(on) => set({ isPerson: on })}>
                <span className="sh-toggle-text">
                  <strong>Add a person</strong>
                  <span className="sh-sub">
                    Track a named individual at this organization. If unchecked, the stakeholder is the organization itself.
                  </span>
                </span>
              </Toggle>

              {/* 4 · PERSON ROW (isPerson only) */}
              {draft.isPerson && (
                <div className="sh-row-3">
                  <Field label="Title">
                    <Sel
                      ariaLabel="Title"
                      value={draft.title}
                      options={TITLE_OPTIONS}
                      onChange={(v) => set({ title: v })}
                    />
                    {draft.title === 'Other' && (
                      <TF
                        label="Custom title"
                        placeholder="Write a custom title"
                        value={draft.titleOther}
                        onValue={(v) => set({ titleOther: v })}
                      />
                    )}
                  </Field>
                  <Field label="First name">
                    <TF label="First name" placeholder="Maria" value={draft.firstName} onValue={(v) => set({ firstName: v })} />
                  </Field>
                  <Field label="Last name">
                    <TF label="Last name" placeholder="Chen" value={draft.lastName} onValue={(v) => set({ lastName: v })} />
                  </Field>
                </div>
              )}

              {/* 5 · CONTACT ROW */}
              <div className="sh-row-3">
                <Field label="Email">
                  <TF label="Email" placeholder="name@org.com" value={draft.email} onValue={(v) => set({ email: v })} />
                </Field>
                <Field label="Phone">
                  <TF
                    label="Phone"
                    placeholder="(555) 123-4567"
                    value={draft.phone}
                    onValue={(v) => set({ phone: v })}
                    onBlurValue={(v) => set({ phone: formatPhone(v) })}
                  />
                </Field>
                <Field label="X account">
                  <TF label="X account" placeholder="@handle" value={draft.xAccount} onValue={(v) => set({ xAccount: v })} />
                </Field>
              </div>

              {/* 6 · CLASSIFICATION ROW — Category cascade resets Type */}
              <div className="sh-row-2">
                <Field label="Category">
                  <Sel
                    ariaLabel="Category"
                    value={draft.category}
                    options={Object.keys(companyCategories)}
                    onChange={(c) => set({ category: c, type: (companyCategories[c] || [])[0] || '' })}
                  />
                </Field>
                <Field label="Audience type">
                  <Sel
                    ariaLabel="Audience type"
                    value={draft.type}
                    options={companyCategories[draft.category] || []}
                    onChange={(v) => set({ type: v })}
                  />
                </Field>
              </div>

              {/* 7 · GEOGRAPHY ROW — Market cascade resets Region */}
              <div className="sh-row-3">
                <Field label="Market">
                  <Sel
                    ariaLabel="Market"
                    value={draft.market}
                    options={Object.keys(companyMarkets)}
                    onChange={(m) => set({ market: m, region: (companyMarkets[m] || [])[0] || '' })}
                  />
                </Field>
                <Field label="Region">
                  <Sel
                    ariaLabel="Region"
                    value={draft.region}
                    options={companyMarkets[draft.market] || []}
                    onChange={(v) => set({ region: v })}
                  />
                </Field>
                <Field label="Geography">
                  <Sel ariaLabel="Geography" value={draft.geography} options={GEOGRAPHIES} onChange={(v) => set({ geography: v })} />
                </Field>
              </div>

              {/* 8 · SITE + STATE — a site with a state autofills State */}
              <div className="sh-row-2">
                <Field label="Site">
                  <Sel
                    ariaLabel="Site"
                    value={draft.site}
                    options={[{ value: '', label: 'None' }, ...companySites.map((st) => ({ value: st.id, label: siteLabel(st) }))]}
                    onChange={(id) => {
                      const st = companySites.find((x) => x.id === id);
                      if (st && st.state) set({ site: id, state: st.state });
                      else set({ site: id });
                    }}
                  />
                </Field>
                <Field label="State">
                  <Sel
                    ariaLabel="State"
                    value={draft.state}
                    options={[{ value: '', label: 'None' }, ...US_STATES.map((st) => ({ value: st, label: STATE_ABBR[st] || st }))]}
                    onChange={(v) => set({ state: v })}
                  />
                </Field>
              </div>

              {/* 9 · RELATIONSHIP ROW */}
              <div className="sh-row-2">
                <Field label="Priority">
                  <Sel ariaLabel="Priority" value={draft.priority} options={['High', 'Medium', 'Low']} onChange={(v) => set({ priority: v })} />
                </Field>
                <Field label="Status">
                  <Sel ariaLabel="Status" value={draft.status} options={['Active', 'Watch', 'Dormant']} onChange={(v) => set({ status: v })} />
                </Field>
              </div>

              {/* 10 · LAST CONTACT */}
              <DateField label="Last contact" value={draft.lastContact} onChange={(v) => set({ lastContact: v })} />

              {/* 11 · OWNERS */}
              <Field
                label="Owners"
                help={isEdit ? OWNERS_HELP_EDIT : OWNERS_HELP_CREATE}
              >
                <Owners users={users} value={draft.owners} onChange={(v) => set({ owners: v })} />
              </Field>

              {/* 12 · ISSUES */}
              <Field
                label="Issues"
                help="Click a company issue to add it. Add your own below, separated by commas."
              >
                <IssueSelector
                  selected={draft.issues}
                  company={companyIssues || []}
                  onChange={(v) => set({ issues: v })}
                />
              </Field>

              {/* 13 · TAGS — restrict: company set only, custom input hidden */}
              <Field
                label="Tags"
                help="Choose from the company tag set. Managers can add tags in Settings."
              >
                <IssueSelector
                  selected={draft.tags}
                  company={companyTags || []}
                  restrict
                  onChange={(v) => set({ tags: v })}
                />
              </Field>

              {/* 14 · NOTES */}
              <Field label="Notes">
                <TA rows={3} value={draft.notes} onValue={(v) => set({ notes: v })} />
              </Field>

              {/* 15 · CREATE-ONLY NOTICE (sealed verbatim) */}
              {!isEdit && <div className="sh-notice muted">{CREATE_NOTICE}</div>}

              {/* 16 · DELETE SECTION (edit + onDelete — the sealed MAKE-REAL:
                  Lists now wires onDelete so this section is reachable) */}
              {isEdit && onDelete && (
                <div className="sh-delete">
                  <span className="sh-lbl">Delete stakeholder</span>
                  <p className="sh-delete-copy muted">
                    Permanently removes this stakeholder and all of their scores. This cannot be undone.
                  </p>
                  <ui-button variant="filled" tone="danger" onClick={() => setConfirmDelete(true)}>
                    <ui-icon slot="leading">close</ui-icon>
                    Delete stakeholder
                  </ui-button>
                </div>
              )}
            </div>

            {/* SEALED FOOT: Required readout · Cancel · primary */}
            <div slot="actions" className="sh-foot">
              {!valid && <span className="sh-missing muted">Required: {missing.join(', ')}</span>}
              <ui-button variant="text" onClick={onCancel}>Cancel</ui-button>
              <ui-button
                variant="filled"
                disabled={valid ? undefined : ''}
                title={valid ? undefined : 'Fill required fields: ' + missing.join(', ')}
                onClick={submit}
              >{isEdit ? 'Save changes' : 'Create stakeholder'}</ui-button>
            </div>
          </>
        ) : null}
      </ui-dialog>

      {/* ── STACKED DELETE CONFIRM (sibling dialog; closes only itself) ──── */}
      <ui-dialog ref={confirmRef} open={open && confirmDelete ? '' : undefined} class="sh-confirm">
        {open && confirmDelete && s && (
          <>
            <span slot="headline">Delete this stakeholder?</span>
            <p className="sh-confirm-body">
              <strong>{displayName(s) || s.name}</strong> and all of their scores will be permanently removed. This cannot be undone.
            </p>
            <div slot="actions">
              <ui-button variant="text" onClick={() => setConfirmDelete(false)}>Cancel</ui-button>
              <ui-button
                variant="filled"
                tone="danger"
                onClick={() => { setConfirmDelete(false); onDelete(s.id); }}
              >Delete</ui-button>
            </div>
          </>
        )}
      </ui-dialog>

      {/* ── "VIEW ALL" ENGAGEMENTS OVERLAY (sealed surface C) ────────────── */}
      <ui-dialog ref={viewAllRef} open={open && viewAll ? '' : undefined} class="sh-viewall-dialog">
        {open && viewAll && s && (
          <>
            <div slot="headline" className="sh-head">
              <div className="sh-head-left sh-head-col">
                <span className="sh-eyebrow">Community engagements</span>
                <span className="sh-title">{displayName(s) || s.name}</span>
              </div>
              <ui-icon-button variant="standard" aria-label="Close" onClick={() => setViewAll(false)}>
                <ui-icon>close</ui-icon>
              </ui-icon-button>
            </div>
            <div className="profile-entry-list">
              {affil.map((a) => (
                <EngagementRow
                  a={a}
                  key={a.id}
                  onOpen={onOpenCommunity
                    ? () => { setViewAll(false); onOpenCommunity(a.id); }
                    : null}
                />
              ))}
            </div>
          </>
        )}
      </ui-dialog>
    </>
  );
}
