/* palette.jsx — the universal Cmd/Ctrl-K COMMAND PALETTE (Phase 16), assembled
 * against the sealed box "Command palette (⌘K) — global search across 5
 * entity types" (src/guide.jsx ~3993–4060) and its SKELETON TREE, under the
 * INDEX ruling "command palette = composition, no new component".
 *
 * SEALED, honored verbatim:
 *  · A thin centered search bar over a BLURRED veil; grouped results across
 *    Stakeholders → Plans → Community → Workspaces → People, capped at 24
 *    rows combined; every row = type tag + label + muted sub.
 *  · Open resets q=""/active=0 and focuses the field after 20ms; scrim click
 *    and Escape close; clicks inside the bar never close (ui-dialog native).
 *  · Input onChange sets q AND resets active to 0; ArrowDown/ArrowUp clamp;
 *    Enter goes; hover (mouse-enter) moves the highlight; click goes; the
 *    trailing "Enter" ui-button commits and is DISABLED with no results.
 *  · go(i): r exists → navigate THEN close. Empty query renders NO results
 *    block at all; a query with zero hits renders "No matches."
 *  · GLOBAL and independent of the per-page inline search bars.
 *
 * COMPOSITION (the sealed build-map, Canonical UI only):
 *  · backdrop + centered bar = ui-dialog with the scrim-blur variant (the
 *    sealed cmdk-backdrop blur, --ui-sys-scrim-blur token; registered in
 *    manifest.json).
 *  · input row = leading ui-icon "search" + ui-text-field variant=plain +
 *    trailing ui-button "Enter" (the sealed cmdk-go).
 *  · results = ui-list of interactive ui-list-item rows; the type tag =
 *    ui-chip variant=tag in the leading slot; sub = the supporting slot
 *    (muted caption — the sealed span.cmdk-sub.muted role).
 *  · active-row highlight = the .cmdk-row.active token wash in app.css
 *    (--ui-sys-surface-hover — the established mention-popover pattern).
 *
 * DECLARED DEPARTURES (file-header ledger; never silent):
 *  · The skeleton tree offers "ui-autocomplete input / ui-text-field" and
 *    "autocomplete menu / ui-list" — the ui-text-field + ui-list arm is
 *    composed here: rows carry a per-row entity-type ui-chip and a
 *    controlled hover-follows-highlight, which the self-contained
 *    ui-autocomplete listbox cannot host.
 *  · The "Enter" commit affordance renders as ui-button variant=text (the
 *    sealed box names the component, not a variant; quiet text is the
 *    minimal industry-standard choice for an in-field commit hint).
 *  · Matching/ranking/caps live in palette-logic.js (node-tested); see THAT
 *    header for the sites-seam and kind-code departures.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUiEvent } from './modals/stakeholder-modal.jsx';
import { useCompanyCatalogs } from './data/company.js';
import {
  paletteResults, activeDown, activeUp, PALETTE_STR,
} from './palette-logic.js';

export function CommandPalette({
  open, onClose, stakeholders = [], plans = [], community = [],
  workspaces = [], users = [], onGo,
}) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const dlgRef = useRef(null);
  const inputRef = useRef(null);
  /* Sites feed the stakeholder site-label/country match surface — the LIVE
   * Settings-fed seam (declared in palette-logic's ledger). */
  const { companySites } = useCompanyCatalogs();

  const ql = q.trim().toLowerCase();
  /* Memoized over the live stores (scale ruling): one linear scan per
   * keystroke, short-circuited at the sealed 24-row cap. */
  const capped = useMemo(
    () => paletteResults(q, {
      stakeholders, plans, community, workspaces, users, sites: companySites,
    }),
    [q, stakeholders, plans, community, workspaces, users, companySites]);

  /* Sealed open transition: reset q="" and active=0, then focus the field
   * after 20ms (so it catches once rendered). */
  useEffect(() => {
    if (!open) return undefined;
    setQ('');
    setActive(0);
    if (inputRef.current) inputRef.current.value = '';
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(t);
  }, [open]);

  /* Scrim click / Escape / programmatic close → onClose (ui-dialog native
   * dismissals; the guard keeps a stacked child dialog's close from leaking). */
  useUiEvent(dlgRef, 'close', (e) => {
    if (e.target === dlgRef.current && open) onClose();
  });

  /* Sealed go(i): navigate THEN close. */
  const go = (i) => {
    const r = capped[i];
    if (r) {
      onGo(r.kind, r.id);
      onClose();
    }
  };

  /* Sealed input keyboard: clamped arrows · Enter goes · Escape closes. */
  useUiEvent(inputRef, 'input', () => {
    setQ(inputRef.current.value);
    setActive(0);
  });
  useUiEvent(inputRef, 'keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => activeDown(a, capped.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => activeUp(a));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(active);
    } else if (e.key === 'Escape') {
      onClose();
    }
  });

  return (
    <ui-dialog ref={dlgRef} scrim-blur="" open={open ? '' : undefined} class="cmdk-dialog">
      {open ? (
        <div className="cmdk">
          <div className="cmdk-input">
            <ui-icon size="sm">search</ui-icon>
            <ui-text-field
              ref={inputRef}
              variant="plain"
              label="Search"
              placeholder={PALETTE_STR.placeholder}
            ></ui-text-field>
            <ui-button
              variant="text"
              class="cmdk-go"
              disabled={capped.length === 0 ? '' : undefined}
              onClick={() => go(active)}
            >
              {PALETTE_STR.go}
            </ui-button>
          </div>
          {ql ? (
            <div className="cmdk-results">
              {capped.length === 0 ? (
                <div className="cmdk-empty muted">{PALETTE_STR.empty}</div>
              ) : (
                <ui-list>
                  {capped.map((r, i) => (
                    <ui-list-item
                      key={r.type + r.id}
                      interactive=""
                      class={'cmdk-row' + (i === active ? ' active' : '')}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(i)}
                    >
                      <ui-chip slot="leading" variant="tag" class="cmdk-type">{r.type}</ui-chip>
                      {r.label}
                      {r.sub ? <span slot="supporting">{r.sub}</span> : null}
                    </ui-list-item>
                  ))}
                </ui-list>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </ui-dialog>
  );
}
