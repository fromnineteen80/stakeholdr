/* import-wizard.jsx — the Phase-18 EXCEL/CSV IMPORT WIZARD, assembled per the
 * sealed Demo-features CANONICAL UI BUILD-MAP (src/guide.jsx ~3905–3911):
 * ONE ui-dialog (widened via the shared dialog-width token) hosting a 4-step
 * flow — ui-progress (determinate, 4 steps) in the header; forward action =
 * ui-button variant "filled", Back/Cancel = "text".
 *   1. UPLOAD — ui-dropzone (the GAP component built INTO design-system/ per
 *      the sealed note: real drag-over/error states) with ui-icon
 *      "upload_file", the sealed copy "Drop your .xlsx or .csv here, or" and
 *      the composed Browse-files ui-button; the "Download template"
 *      ui-button (outlined, download icon) lives here (sealed trigger).
 *   2. COLUMN MAP — ui-data-table, one row per detected file header: header
 *      text → target ui-select (the data columns + "Ignore this column";
 *      computed-named headers additionally carry the default
 *      "Computed — skipped" option and stay REMAPPABLE — see the
 *      import-logic ledger) → match ui-chip ("auto-matched" / "unmapped" /
 *      "mapped by hand" / "Computed — skipped" — the last two are declared
 *      honest extensions of the sealed pair, ledger'd in import-logic).
 *      Auto-match = case-insensitive header equality (+ the declared aliases
 *      the sealed export itself requires — see import-logic's ledger).
 *   3. VALIDATION PREVIEW — ui-data-table of the parsed rows: valid rows
 *      plain; invalid rows carry a leading ui-icon "error" + ui-chip (error
 *      variant) naming the failure, and the offending CELLS light via the
 *      table's cell-state hook (sealed ~3909 "cell-level errors highlighted
 *      via the table's error state tokens" — the state lives IN
 *      ui-data-table, token-only). Header summary "N rows ready · M rows
 *      with errors" + the ui-switch "Skip invalid rows" (default ON).
 *      SCALE (standing ruling): validation runs over ALL rows; the preview
 *      RENDER is capped with an honest "showing first N of M" note
 *      (ui-data-table mounts every row it is given — no virtualization).
 *   4. COMMIT — ui-button variant "filled" "Import N stakeholders" (disabled
 *      while M>0 and skip-invalid is off); success snackbar + close are the
 *      HOST's (the commit itself is the host page's ONE setState).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUiEvent } from '../modals/stakeholder-modal.jsx';
import {
  parseCsv, autoMapHeaders, validateRows, importSummary,
  IMPORT_TARGETS, IGNORE, COMPUTED,
} from './import-logic.js';
import {
  buildTemplateXlsx, buildTemplateCsv,
  TEMPLATE_XLSX_FILENAME, TEMPLATE_CSV_FILENAME,
} from './template.js';
import { readXlsxRows } from './xlsx-read.js';
import { downloadBlob } from '../export/download.js';

const PREVIEW_CAP = 200; // ui-data-table mounts every row — cap the RENDER only

const STEP_LABELS = ['Upload', 'Match columns', 'Validate', 'Import'];

/* ONE spelling for the computed disposition (option + match chip). */
const COMPUTED_LABEL = 'Computed — skipped';

/* Phase 19 refactor: the Blob + anchor delivery moved to the shared
 * src/app/export/download.js (the plan Word export delivers through the
 * SAME helper — replace-don't-duplicate). */

export function ImportWizard({
  open, onClose, onCommit, catalogsCtx, workspaceName,
}) {
  const dialogRef = useRef(null);
  const dropRef = useRef(null);
  const mapTableRef = useRef(null);
  const previewTableRef = useRef(null);
  const switchRef = useRef(null);

  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState('');
  const [dataRows, setDataRows] = useState([]);
  const [mapping, setMapping] = useState([]);
  const [skipInvalid, setSkipInvalid] = useState(true); // sealed default ON
  const [parseError, setParseError] = useState('');

  /* dialog open/close through the component's contract */
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open) {
      // fresh flow on every open (incl. the dropzone's status/error state)
      setStep(1); setFileName(''); setDataRows([]);
      setMapping([]); setSkipInvalid(true); setParseError('');
      dropRef.current?.reset?.();
      dlg.setAttribute('open', '');
    } else {
      dlg.removeAttribute('open');
    }
  }, [open]);
  useUiEvent(dialogRef, 'close', onClose);

  /* ── STEP 1: file intake ─────────────────────────────────────────────── */
  const takeFile = async (file) => {
    setParseError('');
    try {
      let rows;
      if (/\.xlsx$/i.test(file.name)) {
        rows = await readXlsxRows(await file.arrayBuffer());
      } else {
        rows = parseCsv(await file.text());
      }
      const heads = (rows[0] || []).map((h) => String(h ?? ''));
      if (!heads.some((h) => h.trim())) {
        setParseError('No header row found — the first row must carry column names.');
        return;
      }
      setFileName(file.name);
      setDataRows(rows.slice(1));
      setMapping(autoMapHeaders(heads));
      setStep(2);
    } catch (err) {
      setParseError(`Could not read "${file.name}" — ${err.message}`);
    }
  };
  useUiEvent(dropRef, 'file', (e) => { takeFile(e.detail.file); });

  const downloadXlsx = () =>
    downloadBlob(buildTemplateXlsx(catalogsCtx), TEMPLATE_XLSX_FILENAME,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  const downloadCsv = () =>
    downloadBlob(buildTemplateCsv(), TEMPLATE_CSV_FILENAME, 'text/csv;charset=utf-8');

  /* ── STEP 2: column map (ui-data-table with render-hook cells) ─────────── */
  useEffect(() => {
    const el = mapTableRef.current;
    if (!el || step !== 2) return;
    const chip = (text) => {
      const c = document.createElement('ui-chip');
      c.setAttribute('variant', 'tag');
      c.textContent = text;
      return c;
    };
    // ORDER MATTERS: data BEFORE columns — ui-data-table seeds gallery sample
    // rows on connect, and a column render hook must never run over them.
    el.data = mapping.map((m) => ({ header: m.header || '(blank header)', m }));
    el.columns = [
      { key: 'header', label: 'File column' },
      {
        key: 'target',
        label: 'Maps to',
        render: (row) => {
          if (!row.m) return null; // defensive: never render over foreign rows
          const sel = document.createElement('ui-select');
          sel.setAttribute('aria-label', `Map "${row.m.header}"`);
          const opts = [
            // a computed-named header defaults to skipped but stays LIVE —
            // a file whose own data uses a header literally named "x" or
            // "Relationship" can be remapped to Ignore or any input target
            // (declared: import-logic ledger, COMPUTED HEADERS ARE REMAPPABLE)
            ...(row.m.computed ? [{ value: COMPUTED, label: COMPUTED_LABEL }] : []),
            { value: IGNORE, label: 'Ignore this column' },
            ...IMPORT_TARGETS.map((t) => ({ value: t.key, label: t.label })),
          ];
          for (const o of opts) {
            const opt = document.createElement('ui-option');
            opt.setAttribute('value', o.value);
            opt.textContent = o.label;
            sel.appendChild(opt);
          }
          sel.setAttribute('value', row.m.target);
          sel.addEventListener('change', (e) => {
            const v = e.detail.value;
            setMapping((prev) => prev.map((m) => {
              if (m.index === row.m.index) return { ...m, target: v, auto: false };
              // an INPUT target claimed here is released anywhere else (one
              // column per target); IGNORE/COMPUTED are dispositions, not
              // exclusive targets — never stolen from other rows
              if (v !== IGNORE && v !== COMPUTED && m.target === v) {
                return { ...m, target: IGNORE, auto: false };
              }
              return m;
            }));
          });
          return sel;
        },
      },
      {
        key: 'match',
        label: 'Match',
        render: (row) => {
          if (!row.m) return null;
          if (row.m.target === COMPUTED) return chip(COMPUTED_LABEL);
          if (row.m.target === IGNORE) return chip('unmapped');
          // "mapped by hand" = the declared third state (import-logic ledger)
          return chip(row.m.auto ? 'auto-matched' : 'mapped by hand');
        },
      },
    ];
  }, [step, mapping]);

  /* ── STEP 3: validation (pure, over ALL rows) ──────────────────────────── */
  const validation = useMemo(() => {
    if (!dataRows.length || !mapping.length) return { rows: [], ready: 0, errored: 0, skipped: 0 };
    return validateRows(dataRows, mapping, catalogsCtx);
  }, [dataRows, mapping, catalogsCtx]);

  useEffect(() => {
    const el = previewTableRef.current;
    if (!el || step !== 3) return;
    const active = mapping.filter((m) => m.target !== IGNORE && m.target !== COMPUTED);
    const targetsInOrder = IMPORT_TARGETS.filter((t) => active.some((m) => m.target === t.key));
    // data BEFORE columns (see the step-2 note: sample-row seeding).
    el.data = validation.rows.slice(0, PREVIEW_CAP).map((r) => ({
      _line: r.line,
      _errors: r.errors,
      ...Object.fromEntries(targetsInOrder.map((t) => {
        const v = r.values[t.key];
        return [t.key, Array.isArray(v) ? v.join('; ') : (v ?? '')];
      })),
    }));
    el.columns = [
      {
        key: '_flag',
        label: '',
        render: (row) => {
          const wrap = document.createElement('span');
          wrap.className = 'import-flag';
          if (row._errors && row._errors.length) {
            const icon = document.createElement('ui-icon');
            icon.setAttribute('size', 'sm');
            icon.textContent = 'error';
            wrap.appendChild(icon);
            for (const er of row._errors) {
              const c = document.createElement('ui-chip');
              c.setAttribute('variant', 'error');
              c.textContent = er.message;
              wrap.appendChild(c);
            }
          }
          return wrap;
        },
      },
      { key: '_line', label: 'Row' },
      ...targetsInOrder.map((t) => ({
        key: t.key,
        label: t.label,
        // CELL-LEVEL error highlight (sealed ~3909): errors carry
        // { field, message } where field = the column LABEL (import-logic's
        // err() vocabulary matches IMPORT_TARGETS labels 1:1); the table's
        // sanctioned state hook lights the cell from its error state tokens.
        state: (row) => (row._errors && row._errors.some((e) => e.field === t.label)
          ? 'error' : null),
      })),
    ];
  }, [step, validation, mapping]);

  useUiEvent(switchRef, 'change', () => {
    setSkipInvalid(switchRef.current.hasAttribute('selected'));
  });

  /* ── STEP 4: commit ────────────────────────────────────────────────────── */
  const importable = validation.rows.filter((r) => !r.errors.length);
  const commitBlocked = validation.errored > 0 && !skipInvalid;
  const commit = () => {
    if (commitBlocked || !importable.length) return;
    onCommit(importable); // the host's ONE setState + snackbar + close
  };

  const mappedCount = mapping.filter((m) => m.target !== IGNORE && m.target !== COMPUTED).length;
  const computedCount = mapping.filter((m) => m.target === COMPUTED).length;
  const ignoredCount = mapping.filter((m) => m.target === IGNORE).length;

  return (
    <ui-dialog ref={dialogRef} class="import-dialog">
      <div slot="headline" className="import-head">
        <span className="import-title">Import stakeholders</span>
        <span className="import-step-label">
          Step {step} of 4 — {STEP_LABELS[step - 1]}
        </span>
        <ui-linear-progress value={String(step / 4)}></ui-linear-progress>
      </div>

      <div className="import-body">
        {step === 1 && (
          <div className="import-step import-step-upload">
            <ui-dropzone ref={dropRef} accept=".xlsx,.csv" icon="upload_file">
              Drop your .xlsx or .csv here, or
            </ui-dropzone>
            {parseError ? <div className="import-parse-error">
              <ui-icon size="sm">error</ui-icon>{parseError}
            </div> : null}
            <div className="import-template-row">
              <ui-button variant="outlined" onClick={downloadXlsx}
                         aria-label="Download the Excel import template">
                <ui-icon slot="leading" size="sm">download</ui-icon>Download template
              </ui-button>
              <ui-button variant="text" onClick={downloadCsv}
                         aria-label="Download the CSV import template">
                <ui-icon slot="leading" size="sm">download</ui-icon>CSV version
              </ui-button>
            </div>
            <p className="import-note">
              The Excel template carries dropdowns for every choice-limited column
              (with Type-by-Category, Region-by-Market and Site-by-State cascades)
              so values always match the catalogs — the CSV version relies on the
              validation step alone. Computed columns (x, y, Relationship, Community
              investment) are filled by the app and ignored on import, so a
              re-imported export never aborts.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="import-step">
            <p className="import-note">
              <strong>{fileName}</strong> — {mappedCount} column{mappedCount === 1 ? '' : 's'} mapped
              · {computedCount} computed (skipped) · {ignoredCount} ignored.
              Headers were auto-matched by name; adjust any mapping below.
            </p>
            <ui-data-table ref={mapTableRef} density="compact" class="import-map-table"></ui-data-table>
          </div>
        )}

        {step === 3 && (
          <div className="import-step">
            <div className="import-validate-head">
              <span className="import-summary">{importSummary(validation.ready, validation.errored)}</span>
              {validation.skipped > 0 && (
                <span className="import-skip-note">
                  {validation.skipped} empty/hint row{validation.skipped === 1 ? '' : 's'} skipped
                </span>
              )}
              <span className="import-spacer"></span>
              <ui-switch ref={switchRef} selected={skipInvalid ? '' : undefined}>
                Skip invalid rows
              </ui-switch>
            </div>
            {validation.rows.length > PREVIEW_CAP && (
              <p className="import-note">
                Showing the first {PREVIEW_CAP} of {validation.rows.length} rows —
                every row was validated.
              </p>
            )}
            <ui-data-table ref={previewTableRef} density="compact" class="import-preview-table"></ui-data-table>
          </div>
        )}

        {step === 4 && (
          <div className="import-step import-step-commit">
            <p className="import-note">
              Ready to import <strong>{importable.length}</strong> stakeholder{importable.length === 1 ? '' : 's'} from <strong>{fileName}</strong>.
            </p>
            {validation.errored > 0 && (
              <p className="import-note">
                {skipInvalid
                  ? `${validation.errored} invalid row${validation.errored === 1 ? '' : 's'} will be skipped.`
                  : `${validation.errored} row${validation.errored === 1 ? ' has' : 's have'} errors — go back and fix them, or turn on "Skip invalid rows".`}
              </p>
            )}
            <p className="import-note">
              {workspaceName
                ? <>New stakeholders will be assigned to <strong>{workspaceName}</strong>.</>
                : 'Importing from Master — new stakeholders start unassigned.'}
              {' '}Each gets a fresh id and audit stamps; your team is asked to score them.
            </p>
          </div>
        )}
      </div>

      <div slot="actions" className="import-actions">
        <ui-button variant="text" onClick={onClose}>Cancel</ui-button>
        <span className="import-spacer"></span>
        {step > 1 && (
          <ui-button variant="text" onClick={() => setStep(step - 1)}>Back</ui-button>
        )}
        {step === 2 && (
          <ui-button variant="filled" onClick={() => setStep(3)}>Next</ui-button>
        )}
        {step === 3 && (
          <ui-button variant="filled"
                     disabled={commitBlocked || !importable.length ? '' : undefined}
                     onClick={() => setStep(4)}>Next</ui-button>
        )}
        {step === 4 && (
          <ui-button variant="filled" class="import-commit-btn"
                     disabled={commitBlocked || !importable.length ? '' : undefined}
                     onClick={commit}>
            Import {importable.length} stakeholder{importable.length === 1 ? '' : 's'}
          </ui-button>
        )}
      </div>
    </ui-dialog>
  );
}
