/* sample-record.jsx — PHASE 14: SampleRecord, the sealed NEUTRAL LIVE PREVIEW
 * used to tune the universal read/edit scaffold (sealed box "Record scaffold,
 * landing pages & page shells", src/guide.jsx ~3493–3499 + TREE SURFACE 1b).
 * Demonstrates the four canonical section-layout variants (Single column ·
 * Field stack · Two column · Table embed), the metadata rail pattern, the
 * toolbar slot, and the pinned footer — with the sealed seed record d
 * (mutated field-by-field via set(k,v); editing the Name field retitles the
 * page header LIVE).
 *
 * PLACEMENT (declared): the oracle mounted this in a dev "Scaffolds menu"
 * whose edges were RULED DROPPED (connectivity census L1/L2 — the back
 * button is a no-op and the embedded table's handlers are stubs BY DESIGN).
 * The rebuild has no Scaffolds menu, so SampleRecord ships as a STANDALONE
 * PREVIEW PAGE (record.html → its own Vite entry beside the design-system
 * preview/wireframes pages) — a tuning surface, never app chrome.
 *
 * ORACLE-HONESTY, made visibly honest (sealed flag + make-real law): the
 * scaffold-controls search/Filter/Sort, the "Samples" back button, and the
 * two Tags MetaFields are DECORATIVE in the sealed source (no handlers / no
 * onChange). Dead-looking-live is banned, so each renders DISABLED with a
 * preview note — the sealed inertness, made visible.
 *
 * TABLE EMBED (sealed L2, honored exactly): the REAL ui-stakeholder-table,
 * fed the first 8 seed stakeholders (TABLE_EMBED_CAP) with live-computed
 * _x/_y/_status, seed users/catalogs, workspaceLabel "Sample" — and NO event
 * listeners attached (the sealed all-handlers-are-no-ops stubbing).
 */
import { useMemo, useRef, useState } from 'react';
import { RecordShell, MetaField } from './record-shell.jsx';
import {
  SAMPLE_SEED, SAMPLE_STRINGS, SAMPLE_STATUS_OPTIONS, SAMPLE_PRIORITY_OPTIONS,
  SAMPLE_SECTIONS, SAMPLE_PROSE_TAGS, tableEmbedRows,
} from './record-logic.js';
import { SEED_STAKEHOLDERS, SEED_SCORES, SEED_TEAM, SEED_USERS } from '../data/seed.js';
import { weightedCoord, statusFor } from '../data/engine.js';
import { GEOGRAPHIES, US_STATES, siteLabel } from '../data/catalogs.js';
import { useCompanyCatalogs } from '../data/company.js';
import { cmdKeyLabel } from '../data/store.js';
import { useUiEvent } from '../modals/stakeholder-modal.jsx';

/* The two sealed lorem paragraphs render as neutral scaffold copy — the
 * oracle's lorem ipsum placeholder prose (layout filler, not content). */
const PROSE_1 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
const PROSE_2 = 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const INERT_NOTE = 'Decorative preview chrome (sealed oracle-honesty) — the live behavior belongs to the landing shell';

/* The sealed Table-embed section: the REAL table, 8 rows, handlers unbound.
 * The element is fed IN THE CALLBACK REF (pre-paint) — the section mounts on
 * demand and a bare connected tag would flash the component's gallery
 * sample (a live-looking fake, banned). */
function TableEmbed() {
  const { companyCategories, companyMarkets, companySites } = useCompanyCatalogs();
  const rows = useMemo(() => tableEmbedRows(SEED_STAKEHOLDERS).map((s) => {
    const pos = weightedCoord(s.id, SEED_SCORES, SEED_TEAM);
    return { ...s, _x: pos.x, _y: pos.y, _status: statusFor(pos.x, pos.y) };
  }), []);
  const attach = (el) => {
    if (!el) return;
    el.catalogs = {
      CATEGORIES: companyCategories, MARKETS: companyMarkets,
      GEOGRAPHIES, US_STATES, SITES: companySites, siteLabel,
    };
    el.users = SEED_USERS;
    el.workspaceLabel = SAMPLE_STRINGS.workspaceLabel;
    el.data = rows;
    // Sealed L2: every navigation/mutation handler is a no-op — no listeners.
  };
  return (
    <div className="record-table-embed">
      <ui-stakeholder-table ref={attach} kbd-label={cmdKeyLabel}></ui-stakeholder-table>
    </div>
  );
}

/* The rail Notes textarea — the ONE wired rail control (sealed handler 9). */
function RailNotes({ value, onValue }) {
  const ref = useRef(null);
  useUiEvent(ref, 'input', () => onValue(ref.current.value));
  const sync = (el) => { ref.current = el; if (el && el.value !== (value ?? '')) el.value = value ?? ''; };
  return (
    <ui-textarea ref={sync} rows={3} class="mf-input mf-long"
                 placeholder={SAMPLE_STRINGS.notesPlaceholder}
                 aria-label="Notes"></ui-textarea>
  );
}

export function SampleRecord() {
  const [editing, setEditing] = useState(false);
  const [d, setD] = useState(SAMPLE_SEED);
  const set = (k) => (v) => setD((prev) => ({ ...prev, [k]: v }));

  const sections = [
    {
      ...SAMPLE_SECTIONS[0],
      render: () => (
        <div className="record-prose">
          <p>{PROSE_1}</p>
          <p>{PROSE_2}</p>
          <div className="record-prose-tags">
            {SAMPLE_PROSE_TAGS.map((t) => <ui-chip key={t} variant="tag">{t}</ui-chip>)}
          </div>
        </div>
      ),
    },
    {
      ...SAMPLE_SECTIONS[1],
      render: (ed) => (
        <div className="record-fields">
          <MetaField label="Name" value={d.name} editing={ed} onChange={set('name')} />
          <MetaField label="Status" value={d.status} editing={ed} type="select"
                     options={SAMPLE_STATUS_OPTIONS} onChange={set('status')} />
          <MetaField label="Summary" value={d.summary} editing={ed} type="long"
                     onChange={set('summary')} />
          {/* Sealed: NO onChange — the edit input is inert (rendered disabled
              + note per the make-real law). */}
          <MetaField label="Tags" value={d.tags} editing={ed} type="tags" />
        </div>
      ),
    },
    {
      ...SAMPLE_SECTIONS[2],
      render: (ed) => (
        <div className="record-twocol">
          <div className="record-fields">
            <MetaField label="Name" value={d.name} editing={ed} onChange={set('name')} />
            <MetaField label="Status" value={d.status} editing={ed} type="select"
                       options={SAMPLE_STATUS_OPTIONS} onChange={set('status')} />
            <MetaField label="Priority" value={d.priority} editing={ed} type="select"
                       options={SAMPLE_PRIORITY_OPTIONS} onChange={set('priority')} />
          </div>
          <div className="record-fields">
            <MetaField label="Owner" value={d.owner} editing={ed} onChange={set('owner')} />
            <MetaField label="Summary" value={d.summary} editing={ed} type="long"
                       onChange={set('summary')} />
            <MetaField label="Tags" value={d.tags} editing={ed} type="tags" />
          </div>
        </div>
      ),
    },
    { ...SAMPLE_SECTIONS[3], render: () => <TableEmbed /> },
  ];

  return (
    <RecordShell
      backLabel={SAMPLE_STRINGS.backLabel}
      /* Sealed L1 (ruled dropped): the back button goes NOWHERE by design —
         rendered honestly inert. */
      backInertNote="Preview only — the sealed dev back route was ruled dropped (census L1)"
      pageIcon={SAMPLE_STRINGS.pageIcon}
      title={d.name}
      subtitle={SAMPLE_STRINGS.subtitle}
      navTitle={SAMPLE_STRINGS.navTitle}
      editing={editing}
      onToggleEdit={() => setEditing((e) => !e)}
      sections={sections}
      toolbar={(
        <span className="scaffold-controls">
          {/* Sealed decorative toolbar chrome — disabled, never dead-live. */}
          <ui-text-field variant="plain" class="scaffold-search" disabled
                         label="Search" placeholder={SAMPLE_STRINGS.searchPlaceholder}
                         title={INERT_NOTE}></ui-text-field>
          <span className="kbd kbd-cmdk">{cmdKeyLabel}</span>
          <ui-button variant="outlined" disabled title={INERT_NOTE}>Filter</ui-button>
          <ui-button variant="outlined" disabled title={INERT_NOTE}>Sort</ui-button>
        </span>
      )}
      rightRail={(
        <div className="record-rail-inner">
          <div className="record-rail-sec">
            <div className="record-rail-title-cap">Metadata</div>
            <MetaField label="Created" value={SAMPLE_STRINGS.metaCreated} />
            <MetaField label="Updated" value={SAMPLE_STRINGS.metaUpdated} />
            <MetaField label="Owner" value={d.owner} />
          </div>
          <div className="record-rail-sec">
            <div className="record-rail-title-cap">Notes</div>
            <RailNotes value={d.note} onValue={set('note')} />
          </div>
        </div>
      )}
      footer={(
        <>
          <span>{SAMPLE_STRINGS.footLeft}</span>
          <span slot="end">{SAMPLE_STRINGS.footRight}</span>
        </>
      )}
    />
  );
}
