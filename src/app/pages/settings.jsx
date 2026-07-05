/* settings.jsx — SETTINGS: the manager-only org configuration hub (the 9
 * sealed oracle panes + the Design dashboard + the Integrations forward-design
 * shell), assembled against the SKELETON TREES in the sealed box "Settings —
 * manager-only org config hub" in src/guide.jsx (~2273–2580). All pure logic
 * lives in settings-logic.js (node-tested by scripts/settings-test.mjs);
 * catalogs flow through the ONE appConfig seam (data/company.js).
 *
 * FILE-HEADER LEDGER — DECLARED RECOMPOSITIONS / MAKE-REAL flags (never
 * silent; the sealed-logic departures are ledgered in settings-logic.js):
 *  · ENTRY ROUTE (sealed): the ProfileMenu's "Settings" item — rendered only
 *    when currentUser.role === "manager" — sets the settings view. The RULED
 *    shell anchors that menu at the sidebar identity footer (SHELL DESIGN
 *    RULING #3); shell.jsx wires it.
 *  · The rail = ui-list of interactive items (sealed mapping "ui-nav-rail or
 *    ui-list"); the ACTIVE item marks via ink only (sealed design law).
 *  · IssueSettings chips = ui-chip variant=input with a REAL remove control
 *    (the sealed tree records the oracle's bare-span "×" and rules this a11y
 *    upgrade explicitly).
 *  · THEME picker (sealed MAKE-REAL + the make-real law): the oracle's
 *    theme/autoNightShift/nightShiftAt writes were DEAD (sealed UNWIRED
 *    flag). Soapbox is the live default token set; the Undecideds and Night
 *    Shift cards render DISABLED with a phase note — their named token sets
 *    are part of the OPEN wrapper-theme ruling (CLAUDE.md), and a
 *    live-looking dead write is forbidden. The auto-switch Yes/No renders
 *    disabled with the same note; the sealed nightShiftAt TIME SELECTS are
 *    NOT rendered until the Night Shift set exists (their split/compose
 *    logic is built + tested in settings-logic, awaiting that ruling).
 *    Clicking Soapbox WRITES THROUGH to design.theme='cream' so the Identity
 *    picker and the Design pane's wrapper control can never disagree; the
 *    Soapbox card shows selected only when the effective wrapper is cream.
 *  · TIME ZONE select persists appConfig.timeZone (real org config); the
 *    sealed helper copy ships verbatim. Timestamp DISPLAY through this zone
 *    is the sealed Enterprise-state-model make-real (backend phase) —
 *    declared, not faked.
 *  · INVITE CODE: the sealed Copy guard (silent no-op when unset) is
 *    upgraded to a DISABLED Copy button with a title — recorded upgrade, not
 *    a silent replicate of a live-looking dead control. Regenerate = the
 *    sealed EMAIL-ONLY request dialog (no client-side regeneration; the real
 *    issue/invalidate flow is the sealed backend make-real).
 *  · ROLE TOGGLE = two real ui-buttons (tonal = on / text = off) — the
 *    sealed 2-button segmented group recomposed from real components.
 *  · SITE ids mint through uid('site') (the repo-wide id rule) instead of
 *    the sealed Math.random 6-char suffix — same "site-…" shape.
 *  · DESIGN PAGE (sealed p3): controls write live to :root and persist to
 *    appConfig (design + accent); boot re-applies (shell effect calling
 *    applyAppConfigLive). The THREE OPEN DECISIONS (accent hue · shadows vs
 *    flat · Cream vs Modern wrapper) surface as controls DEFAULTING to the
 *    tokens.css start-state — nothing here pre-decides them. Zone colors and
 *    pill tokens are NEVER offered (sealed law). Reset clears the dashboard
 *    overrides (design + accent) back to the tokens.css start-state.
 *  · The sealed brand-icon upload = ui-upload (the shared file-pick GAP
 *    component); the beaker custom-color field = ui-color-field; the theme /
 *    color swatches = ui-swatch-card (both registered in manifest.json this
 *    phase, per the GAP law).
 *  · BRAND COLOR / BRAND ICON scope (declared resolution of the sealed
 *    Settings control vs SHELL DESIGN RULING #4): the ruled Sr mark reads
 *    --ui-sys-on-surface (mark color == title color, by law) and is EXEMPT
 *    from appConfig.brand; the brand color/icon apply to the pane preview
 *    now and to the LOGIN SCREEN + future surfaces when those phases land.
 *    Surfaced to the user as an open note, not silently absorbed.
 *  · ACCENT/BRAND HEX VALIDATION: applyAppConfigLive applies only strict
 *    #rrggbb values (the sealed oracle applied raw input); a malformed value
 *    persists but never styles — safe-direction departure.
 *  · INTEGRATIONS sub-labels/intro are PLACEHOLDER copy (the sealed roster
 *    names only the five connectors; the box rules the pane is designed
 *    from scratch WITH the user — pending that session).
 *  · "Make manager" title on the role toggle is an a11y addition beyond the
 *    sealed titles (the box titles only the User button).
 */
import { useEffect, useRef, useState } from 'react';
import { usePersistentState, uid, nowStamp } from '../data/store.js';
import { SEED_USERS } from '../data/seed.js';
import { useCompanyConfig, useCompanyCatalogs, applyAppConfigLive } from '../data/company.js';
import {
  SETTINGS_PANES, DESIGN_PANE, INTEGRATIONS_PANE, DEFAULT_PANE,
  quartersFor, MONTH_NAMES, slugTag,
  issueListCommit, issueAdd, issueRemove,
  addSegment, segmentAddCommit, addUnit, removeUnit, removeSegment,
  segAdderPlaceholder, unitAdderPlaceholder,
  SITE_MODES, siteSubList, siteSubPlaceholder, intlCountryOptions, makeSite,
  siteChipLabel,
  APP_NAME_PLACEHOLDER, APP_NAME_HELP, BRAND_ICON_HELP, BRAND_HELP,
  ACCENT_HELP, TZ_HELP, TIME_ZONES, TIME_ZONE_DEFAULT,
  FISCAL_INTRO, CATEGORIES_INTRO, GOALS_INTRO, SEGMENTS_INTRO, FUNCTIONS_INTRO,
  MARKETS_INTRO, SITES_INTRO, ISSUES_INTRO, TAGS_INTRO, INVITE_INTRO,
  ROLES_INTRO, CONTACT_COPY, CONTACT_EMAIL, ISSUE_ADD_PLACEHOLDER, countLabel,
  SETTINGS_EXPLAINER,
  INVITE_PLACEHOLDER, INVITE_MODAL_TITLE, INVITE_MODAL_BODY_PRE,
  INVITE_MODAL_BODY_POST, INVITE_MAIL_SUBJECT, ROLES_SEARCH_PLACEHOLDER,
  SELF_DEMOTE_TITLE, MAKE_USER_TITLE, ROLE_MEMBER, ROLE_MANAGER,
  rolesFiltered, rolesHeadCount,
  INTEGRATIONS_CONNECTORS, INTEGRATIONS_CHIP, INTEGRATIONS_INTRO,
  DESIGN_DEFAULTS, DESIGN_SUBTEXT, themeAttribute,
} from './settings-logic.js';
import {
  CONFIG_SWATCHES, BRAND_DEFAULT, THEME_PRESETS, ACCENT_CANDIDATES,
  WRAPPER_THEMES,
} from '../../../design-system/settings-data.js';
import { useUiEvent, Field, TF, Sel, UAv } from '../modals/stakeholder-modal.jsx';

/* ── small bridges ────────────────────────────────────────────────────────── */

/* Tinted preview tile (sealed settings-swatch-preview / brand-icon-preview):
 * the color is DATA from appConfig — it flows in as a host custom property
 * via ref (inline style= is banned; this is the established imperative
 * bridge). */
function Tinted({ className, color, title, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (color) el.style.setProperty('--tint', color);
    else el.style.removeProperty('--tint');
  }, [color]);
  return <span ref={ref} className={className} title={title}>{children}</span>;
}

/* Avatar bridge: the shared UAv (stakeholder-modal.jsx — Phase-12 single
 * source; replace-don't-duplicate). */

function ColorField({ value, onChange }) {
  const ref = useRef(null);
  useUiEvent(ref, 'change', (e) => onChange(e.detail.value));
  return <ui-color-field ref={ref} value={value || ''}></ui-color-field>;
}

function Upload({ accept, onData, children }) {
  const ref = useRef(null);
  useUiEvent(ref, 'change', (e) => onData(e.detail.dataUrl));
  return <ui-upload ref={ref} accept={accept} variant="outlined">{children}</ui-upload>;
}

/* Radiogroup row of ui-swatch-cards (the GAP component; arrow keys move +
 * select inside the [role=radiogroup] row). */
function SwatchRow({ ariaLabel, className, onPick, children }) {
  const ref = useRef(null);
  useUiEvent(ref, 'change', (e) => {
    if (e.detail && e.detail.value != null) onPick(e.detail.value);
  });
  return (
    <div ref={ref} role="radiogroup" aria-label={ariaLabel} className={className}>
      {children}
    </div>
  );
}

/* Sealed 2-button segmented group, recomposed from real ui-buttons
 * (tonal = the on side). */
function Seg({ options, value, onChange, disabled, titles }) {
  return (
    <span className="seg-pair" role="group">
      {options.map((o) => {
        const v = typeof o === 'object' ? o.value : o;
        const l = typeof o === 'object' ? o.label : o;
        const on = value === v;
        return (
          <ui-button
            key={v}
            variant={on ? 'tonal' : 'text'}
            disabled={disabled ? '' : undefined}
            title={(titles && titles[v]) || undefined}
            aria-pressed={on ? 'true' : 'false'}
            onClick={disabled ? undefined : () => onChange(v)}
          >{l}</ui-button>
        );
      })}
    </span>
  );
}

/* ── SHARED FLAT-LIST EDITOR (sealed IssueSettings; TREE 8) ──────────────── */
function IssueSettings({ list, onChange, transform, placeholder }) {
  const inRef = useRef(null);
  const commit = (raw) => {
    const r = issueListCommit(list, raw, transform);
    if (r.changed) onChange(r.list);
    if (inRef.current && inRef.current.value !== r.draft) inRef.current.value = r.draft;
  };
  const add = () => {
    const el = inRef.current;
    if (!el) return;
    const r = issueAdd(list, el.value, transform);
    if (r.changed) onChange(r.list);
    el.value = '';
  };
  useUiEvent(inRef, 'input', () => commit(inRef.current.value));
  useUiEvent(inRef, 'keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
  useUiEvent(inRef, 'focusout', () => {
    if (inRef.current && inRef.current.value.trim()) add();
  });
  return (
    <div className="issue-settings">
      <div className="issue-settings-list">
        {(list || []).map((v) => <RemovableChip key={v} value={v}
          onRemove={() => onChange(issueRemove(list, v))} />)}
      </div>
      <div className="issue-settings-add">
        <ui-text-field ref={inRef} variant="plain" label={placeholder}
                       placeholder={placeholder}></ui-text-field>
      </div>
    </div>
  );
}

function RemovableChip({ value, onRemove, title }) {
  const ref = useRef(null);
  useUiEvent(ref, 'remove', onRemove);
  return <ui-chip ref={ref} variant="input" title={title}>{value}</ui-chip>;
}

/* ── SHARED 2-LEVEL EDITOR (sealed SegmentSettings + UnitAdder; TREE 9) ──── */
function UnitAdder({ label, onAdd }) {
  const ref = useRef(null);
  useUiEvent(ref, 'keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd(ref.current.value);
      ref.current.value = '';
    }
  });
  return (
    <ui-text-field ref={ref} class="segset-unit-input" variant="plain"
                   label={unitAdderPlaceholder(label)}
                   placeholder={unitAdderPlaceholder(label)}></ui-text-field>
  );
}

function SegmentSettings({ segments, onChange, segLabel, unitLabel }) {
  const SEG = segLabel || 'segment';
  const UNIT = unitLabel || 'unit';
  const addRef = useRef(null);
  const segs = segments || {};
  /* Level-1 adder: Enter commits; a typed comma ALSO commits (the sealed
   * comma-promise made real — see the settings-logic ledger). */
  useUiEvent(addRef, 'input', () => {
    const r = segmentAddCommit(segs, addRef.current.value);
    if (r.changed) onChange(r.segments);
    if (addRef.current.value !== r.draft) addRef.current.value = r.draft;
  });
  useUiEvent(addRef, 'keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const r = addSegment(segs, addRef.current.value);
      if (r.changed) onChange(r.segments);
      addRef.current.value = '';
    }
  });
  return (
    <div className="segset">
      {Object.keys(segs).map((seg) => (
        <div className="segset-seg" key={seg}>
          <div className="segset-seg-head">
            <strong>{seg}</strong>
            <ui-button variant="text" title={`Remove ${SEG}`}
                       onClick={() => onChange(removeSegment(segs, seg))}>
              Remove
            </ui-button>
          </div>
          <div className="issue-settings-list">
            {(segs[seg] || []).map((u) => (
              <RemovableChip key={u} value={u}
                onRemove={() => onChange(removeUnit(segs, seg, u))} />
            ))}
            <UnitAdder label={UNIT} onAdd={(v) => {
              const r = addUnit(segs, seg, v);
              if (r.changed) onChange(r.segments);
            }} />
          </div>
        </div>
      ))}
      <div className="segset-add">
        <ui-text-field ref={addRef} variant="plain"
                       label={segAdderPlaceholder(SEG)}
                       placeholder={segAdderPlaceholder(SEG)}></ui-text-field>
      </div>
    </div>
  );
}

/* ── SITES EDITOR (sealed SiteSettings; TREE 5) ──────────────────────────── */
function SiteSettings({ sites, onChange }) {
  const [mode, setMode] = useState('us');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const cityRef = useRef(null);

  const add = () => {
    const site = makeSite({ city: cityRef.current?.value, mode, state, country }, uid('site'));
    if (!site) return;
    onChange([...(sites || []), site]);
    if (cityRef.current) cityRef.current.value = '';
    setState('');
    setCountry('');
  };
  useUiEvent(cityRef, 'keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } });

  return (
    <div className="site-settings">
      <div className="issue-settings-list">
        {(sites || []).map((s) => (
          <RemovableChip key={s.id} value={siteChipLabel(s)} title={`Remove ${s.city}`}
            onRemove={() => onChange((sites || []).filter((x) => x.id !== s.id))} />
        ))}
      </div>
      <div className="site-add-row">
        <ui-text-field ref={cityRef} class="site-city-input" variant="plain"
                       label="City" placeholder="City"></ui-text-field>
        <Sel ariaLabel="Site location mode" value={mode}
             options={SITE_MODES.map(([v, l]) => ({ value: v, label: l }))}
             onChange={(m) => { setMode(m); setState(''); setCountry(''); }} />
        {mode === 'intl' ? (
          <Sel ariaLabel="Country" value={country}
               options={[{ value: '', label: 'Select country…' },
                 ...intlCountryOptions()]}
               onChange={setCountry} />
        ) : (
          <Sel ariaLabel={siteSubPlaceholder(mode)} value={state}
               options={[{ value: '', label: siteSubPlaceholder(mode) },
                 ...siteSubList(mode)]}
               onChange={setState} />
        )}
        <ui-button variant="outlined" onClick={add}>
          <ui-icon slot="leading" size="sm">add</ui-icon>Add site
        </ui-button>
      </div>
    </div>
  );
}

/* ── QUARTERS PREVIEW (sealed algorithm; TREE 4) ─────────────────────────── */
function QuartersPreview({ month, day }) {
  return (
    <div className="quarters-list">
      {quartersFor(month || 11, day || 1).map((q) => (
        <div className="quarter-row" key={q.label}>
          <span className="quarter-label">{q.label}</span>
          <span className="quarter-range">{q.range}</span>
        </div>
      ))}
    </div>
  );
}

/* ── INVITE CODE (sealed InviteCode; TREE 7) ─────────────────────────────── */
function InviteCode({ code }) {
  const [copied, setCopied] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const dlgRef = useRef(null);
  useEffect(() => {
    const dlg = dlgRef.current;
    if (!dlg) return;
    if (askOpen) dlg.setAttribute('open', '');
    else dlg.removeAttribute('open');
    const onClose = () => setAskOpen(false);
    dlg.addEventListener('close', onClose);
    return () => dlg.removeEventListener('close', onClose);
  }, [askOpen]);
  const copy = () => {
    if (!code) return; /* sealed guard — and the button is disabled too */
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(INVITE_MAIL_SUBJECT)}`;
  return (
    <div className="invite-code">
      <div className="invite-code-display">
        <code className="invite-code-value">{code || INVITE_PLACEHOLDER}</code>
        <ui-button variant="outlined"
          disabled={code ? undefined : ''}
          title={code ? 'Copy the invite code' : 'No code issued yet — a real code arrives with the backend build'}
          onClick={copy}>
          <ui-icon slot="leading" size="sm">{copied ? 'check' : 'content_copy'}</ui-icon>
          {copied ? 'Copied' : 'Copy'}
        </ui-button>
        <ui-button variant="outlined" onClick={() => setAskOpen(true)}>Regenerate</ui-button>
      </div>
      <ui-dialog ref={dlgRef}>
        <div slot="headline" className="invite-modal-head">
          <span>{INVITE_MODAL_TITLE}</span>
          <ui-icon-button variant="standard" aria-label="Close" onClick={() => setAskOpen(false)}>
            <ui-icon>close</ui-icon>
          </ui-icon-button>
        </div>
        <p className="invite-modal-body">
          {INVITE_MODAL_BODY_PRE}
          <a className="plain-link" href={mailto}>{CONTACT_EMAIL}</a>.
          {INVITE_MODAL_BODY_POST}
        </p>
        <div slot="actions">
          <ui-button variant="text" onClick={() => setAskOpen(false)}>Close</ui-button>
          <a className="btn-link" href={mailto}>
            <ui-button variant="filled">Email us</ui-button>
          </a>
        </div>
      </ui-dialog>
    </div>
  );
}

/* ── ROLES (sealed Roles section; TREE 6) ────────────────────────────────── */
function RolesTable({ users, currentUser, filter, onFilter, onRole }) {
  const searchRef = useRef(null);
  useUiEvent(searchRef, 'input', () => onFilter(searchRef.current.value));
  const filtered = rolesFiltered(users, filter);
  return (
    <>
      <div className="settings-search">
        <ui-text-field ref={searchRef} variant="plain"
                       label={ROLES_SEARCH_PLACEHOLDER}
                       placeholder={ROLES_SEARCH_PLACEHOLDER}>
          <ui-icon slot="leading">search</ui-icon>
        </ui-text-field>
      </div>
      <table className="roles-table">
        <thead>
          <tr className="roles-head">
            <th>Person</th><th>Email</th><th className="roles-role-col">Role</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => {
            const self = u.id === currentUser?.id;
            const isMgr = u.role === ROLE_MANAGER;
            return (
              <tr key={u.id} className={'roles-row' + (self ? ' self' : '')}>
                <td className="roles-person">
                  <UAv user={u} size="sm" />
                  <span className="roles-name">{u.name}</span>
                </td>
                <td className="roles-email muted">{u.email}</td>
                <td className="roles-role-col">
                  <span className="role-toggle" role="group" aria-label={`Role for ${u.name}`}>
                    <ui-button
                      variant={!isMgr ? 'tonal' : 'text'}
                      disabled={self ? '' : undefined}
                      title={self ? SELF_DEMOTE_TITLE : MAKE_USER_TITLE}
                      onClick={self ? undefined : () => onRole(u.id, ROLE_MEMBER)}
                    >User</ui-button>
                    <ui-button
                      variant={isMgr ? 'tonal' : 'text'}
                      title="Make manager"
                      onClick={() => onRole(u.id, ROLE_MANAGER)}
                    >
                      <ui-icon slot="leading" size="sm" class="manager-star" filled="">star</ui-icon>
                      Manager
                    </ui-button>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

/* ── section scaffold ────────────────────────────────────────────────────── */
function Section({ title, count, intro, sub, children }) {
  return (
    <div className={'setup-section' + (sub ? ' seg-substack' : '')}>
      <div className="setup-section-head">
        <h3>{title}</h3>
        {count != null && <span className="sec-count muted">{count}</span>}
      </div>
      {intro && <p className="muted sec-intro">{intro}</p>}
      {children}
    </div>
  );
}

/* ── PANE: identity (sealed TREE 3 — Identity · Theme · Time Zone) ───────── */
function IdentityPane({ cfg, update }) {
  const brandValue = cfg.brand || BRAND_DEFAULT;
  return (
    <>
      <Section title="Identity">
        <div className="settings-grid">
          <Field label="App name" help={APP_NAME_HELP}>
            <TF label="App name" placeholder={APP_NAME_PLACEHOLDER}
                value={cfg.appName || ''} onValue={(v) => update({ appName: v })} />
          </Field>
          <Field label="Brand icon" help={BRAND_ICON_HELP}>
            <div className="brand-icon-row">
              <Tinted className="brand-icon-preview" color={brandValue}>
                {cfg.brandIcon
                  ? <img className="brand-icon-img" src={cfg.brandIcon} alt="App icon" />
                  : <ui-icon class="brand-glyph">id_card</ui-icon>}
              </Tinted>
              <Upload accept="image/*" onData={(dataUrl) => update({ brandIcon: dataUrl })}>
                {cfg.brandIcon ? 'Replace icon' : 'Upload icon'}
              </Upload>
              {cfg.brandIcon && (
                <ui-button variant="text" onClick={() => update({ brandIcon: null })}>
                  Remove
                </ui-button>
              )}
            </div>
          </Field>
          <ColorRow label="Brand color (app icon)" help={BRAND_HELP}
                    value={brandValue} raw={cfg.brand || BRAND_DEFAULT}
                    onValue={(v) => update({ brand: v })} />
          <ColorRow label="Accent color" help={ACCENT_HELP}
                    value={cfg.accent} raw={cfg.accent || ''}
                    onValue={(v) => update({ accent: v })} />
        </div>
      </Section>

      <Section title="Theme" sub>
        <div className="settings-grid">
          <Field label="Choose One">
            <SwatchRow ariaLabel="Theme" className="theme-choices"
                       onPick={(id) =>
                         /* Soapbox IS the cream wrapper — the click writes
                            through to design.theme so this picker and the
                            Design pane's wrapper control can never disagree
                            (the sealed cfg.theme key is kept for parity). */
                         update({ theme: id, design: { ...(cfg.design || {}), theme: 'cream' } })}>
              {THEME_PRESETS.map((t) => (
                <ui-swatch-card
                  key={t.id}
                  value={t.id}
                  label={t.label}
                  sublabel={t.sub}
                  swatch-bg={t.bg}
                  swatch-dot={t.dot}
                  swatch-border={t.border}
                  selected={themeAttribute(cfg.design) === null
                    && (cfg.theme || 'soapbox') === t.id ? '' : undefined}
                  disabled={t.live ? undefined : ''}
                  title={t.live ? undefined
                    : `${t.label} arrives as a named token set with the wrapper-theme ruling (Design pane)`}
                ></ui-swatch-card>
              ))}
            </SwatchRow>
            <span className="sh-help">
              Soapbox is the live start-state. Undecideds and Night Shift become
              named token sets when the wrapper theme is ruled on the Design pane.
            </span>
          </Field>
          <Field label="Auto-switch to Night Shift">
            <div className="theme-auto-row">
              <Seg options={[{ value: true, label: 'Yes' }, { value: false, label: 'No' }]}
                   value={!!cfg.autoNightShift} onChange={() => {}} disabled />
            </div>
            <span className="sh-help">
              Inert until the Night Shift token set exists (the sealed clock-check
              make-real lands with the wrapper-theme ruling).
            </span>
          </Field>
        </div>
      </Section>

      <Section title="Time Zone" sub>
        <div className="settings-grid">
          <Field label="Record timestamps in" help={TZ_HELP}>
            <Sel ariaLabel="Record timestamps in"
                 value={cfg.timeZone || TIME_ZONE_DEFAULT}
                 options={TIME_ZONES.map(([v, l]) => ({ value: v, label: l }))}
                 onChange={(v) => update({ timeZone: v })} />
          </Field>
          <div />
        </div>
      </Section>
    </>
  );
}

/* Sealed brand/accent field pattern: preview tile · hex text input · beaker ·
 * the 7-swatch row (ui-swatch-card dot variant; title = the hex, sealed). */
function ColorRow({ label, help, value, raw, onValue }) {
  return (
    <Field label={label} help={help}>
      <div className="color-row">
        <Tinted className="settings-swatch-preview" color={value || undefined} />
        <span className="hex-input">
          <TF label={label} value={raw} onValue={onValue} />
        </span>
        <ColorField value={value || ''} onChange={onValue} />
      </div>
      <SwatchRow ariaLabel={`${label} swatches`} className="settings-swatch-row"
                 onPick={onValue}>
        {CONFIG_SWATCHES.map((s) => (
          <ui-swatch-card
            key={s.value}
            variant="dot"
            value={s.value}
            title={s.value}
            swatch-bg={`var(${s.token})`}
            selected={(value || '').toLowerCase() === s.value.toLowerCase() ? '' : undefined}
          ></ui-swatch-card>
        ))}
      </SwatchRow>
    </Field>
  );
}

/* ── PANE: fiscal (sealed TREE 4) ────────────────────────────────────────── */
function FiscalPane({ cfg, update }) {
  const month = Number(cfg.fiscalStartMonth) || 11;
  const day = Number(cfg.fiscalStartDay) || 1;
  return (
    <Section title="Fiscal Calendar" intro={FISCAL_INTRO}>
      <div className="settings-grid">
        <Field label="Fiscal year starts"
               help="Organizations often have unique fiscal year start dates.">
          <div className="fiscal-row">
            <Sel ariaLabel="Fiscal start month" value={String(month)}
                 options={MONTH_NAMES.map((m, i) => ({ value: String(i + 1), label: m }))}
                 onChange={(v) => update({ fiscalStartMonth: Number(v) })} />
            <span className="fiscal-day">
              <Sel ariaLabel="Fiscal start day" value={String(day)}
                   options={Array.from({ length: 31 }, (_, i) => ({
                     value: String(i + 1), label: String(i + 1) }))}
                   onChange={(v) => update({ fiscalStartDay: Number(v) })} />
            </span>
          </div>
        </Field>
        <Field label="Resulting quarters">
          <QuartersPreview month={month} day={day} />
        </Field>
      </div>
    </Section>
  );
}

/* ── PANE: design (the sealed design dashboard — build-phase p3) ─────────── */
function DesignPane({ cfg, update }) {
  const design = { ...DESIGN_DEFAULTS, ...(cfg.design || {}) };
  const setDesign = (patch) => update({ design: { ...design, ...patch } });
  const effAccent = cfg.accent || ACCENT_CANDIDATES[0].value;
  return (
    <>
      <Section title="Design"
        intro={'The live token dashboard. Every control edits the --ui-sys-* contract on this page load AND persists for everyone — the app re-skins with no reload. The three OPEN DECISIONS live here for you to rule; defaults are the tokens.css start-state. Zone colors and pill families are never themed and are not offered.'}>
        <div className="design-grid">
          <Field label="Wrapper theme" help={DESIGN_SUBTEXT.theme}>
            <SwatchRow ariaLabel="Wrapper theme" className="theme-choices"
                       onPick={(id) => setDesign({ theme: id })}>
              {WRAPPER_THEMES.map((t) => (
                <ui-swatch-card key={t.id} value={t.id} label={t.label} sublabel={t.sub}
                  swatch-bg={t.bg} swatch-dot={t.dot} swatch-border={t.border}
                  selected={design.theme === t.id ? '' : undefined}></ui-swatch-card>
              ))}
            </SwatchRow>
          </Field>

          <Field label="Accent hue" help={DESIGN_SUBTEXT.accent}>
            <SwatchRow ariaLabel="Accent hue" className="theme-choices"
                       onPick={(v) => update({ accent: v })}>
              {ACCENT_CANDIDATES.map((c) => (
                <ui-swatch-card key={c.value} value={c.value} label={c.label}
                  sublabel={c.sub} swatch-bg={c.value}
                  selected={effAccent.toLowerCase() === c.value.toLowerCase() ? '' : undefined}
                ></ui-swatch-card>
              ))}
            </SwatchRow>
            <div className="design-accent-custom">
              <ColorField value={effAccent} onChange={(v) => update({ accent: v })} />
              <span className="muted">Custom accent — the beaker opens the OS picker.</span>
            </div>
          </Field>

          <Field label="Shadows" help={DESIGN_SUBTEXT.shadows}>
            <Seg options={[{ value: 'ramp', label: 'Elevation ramp' },
              { value: 'flat', label: 'Flat — no shadows' }]}
              value={design.shadows} onChange={(v) => setDesign({ shadows: v })} />
          </Field>

          <Field label="Corner radius" help={DESIGN_SUBTEXT.radius}>
            <Seg options={[{ value: 'start', label: 'Start-state' },
              { value: 'rounded', label: 'Rounded' }]}
              value={design.radius} onChange={(v) => setDesign({ radius: v })} />
          </Field>

          <Field label="Density" help={DESIGN_SUBTEXT.density}>
            <Seg options={[{ value: 'start', label: 'Start-state' },
              { value: 'compact', label: 'Compact' }]}
              value={design.density} onChange={(v) => setDesign({ density: v })} />
          </Field>

          <Field label="Type scale" help={DESIGN_SUBTEXT.typeScale}>
            <Seg options={[{ value: 'start', label: '13px start-state' },
              { value: 'comfortable', label: '14px comfortable' }]}
              value={design.typeScale} onChange={(v) => setDesign({ typeScale: v })} />
          </Field>
        </div>
      </Section>
      <Section title="Reset" sub intro={DESIGN_SUBTEXT.reset}>
        <ui-button variant="outlined"
          onClick={() => update({ design: null, accent: null })}>
          <ui-icon slot="leading" size="sm">restore</ui-icon>
          Reset to start-state
        </ui-button>
      </Section>
    </>
  );
}

/* ── PANE: integrations (sealed forward-design shell — honestly inert) ───── */
function IntegrationsPane() {
  return (
    <Section title="Integrations" intro={INTEGRATIONS_INTRO}>
      <ui-list class="integrations-list">
        {INTEGRATIONS_CONNECTORS.map((c) => (
          <ui-list-item key={c.id}>
            <ui-icon slot="leading">{c.icon}</ui-icon>
            {c.name}
            <span slot="supporting">{c.sub}</span>
            <span slot="trailing" className="integration-trailing">
              <ui-chip variant="assist" disabled="">{INTEGRATIONS_CHIP}</ui-chip>
              <ui-switch disabled="" aria-label={`${c.name} — coming in State B`}></ui-switch>
            </span>
          </ui-list-item>
        ))}
      </ui-list>
    </Section>
  );
}

/* ── THE HUB ─────────────────────────────────────────────────────────────── */
export function SettingsPage() {
  const [cfg, update] = useCompanyConfig();
  const cats = useCompanyCatalogs();
  const [users, setUsers] = usePersistentState('users', SEED_USERS);
  const currentUser = users[0] || null;
  const [pane, setPane] = useState(DEFAULT_PANE);
  const [filter, setFilter] = useState('');

  /* Live re-apply on every config edit while the page is open (the shell's
   * boot effect owns the persisted re-apply; this keeps edits instant). */
  useEffect(() => { applyAppConfigLive(cfg); }, [cfg]);

  /* Manager gate (sealed: the whole view is manager-only; the shell's menu
   * item is the gate — this is the belt-and-braces guard). */
  if (currentUser && currentUser.role !== ROLE_MANAGER) {
    return <div className="settings-denied muted">Settings are manager-only.</div>;
  }

  const updateUserRole = (id, role) => {
    setUsers((prev) => prev.map((u) => (
      u.id === id ? { ...u, role, updatedAt: nowStamp() } : u)));
  };

  const rails = [...SETTINGS_PANES, DESIGN_PANE, INTEGRATIONS_PANE];
  const filtered = rolesFiltered(users, filter);

  return (
    <div className="settings-layout">
      {/* Sealed shell explainer copy for the settings view — the rebuilt
          shell has no explainer strip (standing departure), so the line
          renders page-level, the Plans/Community/Setup toolbar precedent. */}
      <p className="settings-explainer muted">{SETTINGS_EXPLAINER}</p>
      <aside className="settings-nav">
        <ui-list>
          {rails.map(([id, label]) => (
            <ui-list-item key={id} interactive=""
              class={'settings-nav-item' + (pane === id ? ' active' : '')}
              onClick={() => setPane(id)}>
              {label}
            </ui-list-item>
          ))}
        </ui-list>
      </aside>

      <div className="settings-panes">
        {pane === 'identity' && <IdentityPane cfg={cfg} update={update} />}

        {pane === 'fiscal' && <FiscalPane cfg={cfg} update={update} />}

        {pane === 'stakeholders' && (
          <Section title="Categories & Audience Types"
            count={countLabel(Object.keys(cats.companyCategories || {}).length, 'category', 'categories')}
            intro={CATEGORIES_INTRO}>
            <SegmentSettings segments={cats.companyCategories}
              onChange={(next) => update({ categories: next })}
              segLabel="category" unitLabel="audience type" />
          </Section>
        )}

        {pane === 'structure' && (
          <>
            <Section title="Organizational Goals"
              count={countLabel((cats.companyGoals || []).length, 'goal')}
              intro={GOALS_INTRO}>
              <IssueSettings list={cats.companyGoals}
                onChange={(next) => update({ orgGoals: next })}
                placeholder={ISSUE_ADD_PLACEHOLDER} />
            </Section>
            <Section sub title="Segments & Business Units"
              count={countLabel(Object.keys(cats.companySegments || {}).length, 'segment')}
              intro={SEGMENTS_INTRO}>
              <SegmentSettings segments={cats.companySegments}
                onChange={(next) => update({ segments: next })} />
            </Section>
            <Section sub title="Individual Functions"
              count={countLabel((cats.companyFunctions || []).length, 'function')}
              intro={FUNCTIONS_INTRO}>
              <IssueSettings list={cats.companyFunctions}
                onChange={(next) => update({ functions: next })}
                placeholder={ISSUE_ADD_PLACEHOLDER} />
            </Section>
          </>
        )}

        {pane === 'geography' && (
          <>
            <Section sub title="Markets & Regions" intro={MARKETS_INTRO}>
              <SegmentSettings segments={cats.companyMarkets}
                onChange={(next) => update({ markets: next })}
                segLabel="market" unitLabel="region" />
            </Section>
            <Section sub title="Sites"
              count={countLabel((cats.companySites || []).length, 'site')}
              intro={SITES_INTRO}>
              <SiteSettings sites={cats.companySites}
                onChange={(next) => update({ sites: next })} />
            </Section>
          </>
        )}

        {pane === 'issues' && (
          <Section title="Issues"
            count={countLabel((cats.companyIssues || []).length, 'issue')}
            intro={ISSUES_INTRO}>
            <IssueSettings list={cats.companyIssues}
              onChange={(next) => update({ issues: next })}
              placeholder={ISSUE_ADD_PLACEHOLDER} />
          </Section>
        )}

        {pane === 'tags' && (
          <Section title="Tags"
            count={countLabel((cats.companyTags || []).length, 'tag')}
            intro={TAGS_INTRO}>
            <IssueSettings list={cats.companyTags}
              onChange={(next) => update({ tags: next })}
              transform={slugTag}
              placeholder={ISSUE_ADD_PLACEHOLDER} />
          </Section>
        )}

        {pane === 'management' && (
          <>
            <Section title="Invite Code" intro={INVITE_INTRO}>
              <InviteCode code={cfg.inviteCode} />
            </Section>
            <Section sub title="Roles" count={rolesHeadCount(filtered)}
              intro={ROLES_INTRO}>
              <RolesTable users={users} currentUser={currentUser}
                filter={filter} onFilter={setFilter} onRole={updateUserRole} />
            </Section>
          </>
        )}

        {pane === 'contact' && (
          <Section title="Contact">
            <p className="contact-copy">{CONTACT_COPY}</p>
            <p className="contact-mail">
              Email us at{' '}
              <a className="plain-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </Section>
        )}

        {pane === 'design' && <DesignPane cfg={cfg} update={update} />}

        {pane === 'integrations' && <IntegrationsPane />}
      </div>
    </div>
  );
}
