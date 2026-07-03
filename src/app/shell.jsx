import { useState } from 'react';
// Canonical UI: the ONE component source. Side-effect import registers every
// ui-* element and loads the token contract (tokens.css).
import '../../design-system/entry.js';
import './app.css';
import { SheetPage } from './pages/sheet.jsx';

// NAV_TABS per the sealed App-shell box (icons = the captured semantic→ligature
// map). Scoring carries hideWhenMaster (sealed rule) — enforced when workspace
// state lands in the next phase; Master is the only workspace in this scaffold.
const NAV_TABS = [
  { id: 'sheet',     label: 'List',      icon: 'table_rows' },
  { id: 'map',       label: 'Map',       icon: 'map' },
  { id: 'scoring',   label: 'Scoring',   icon: 'thumb_up', hideWhenMaster: true },
  { id: 'plan',      label: 'Plans',     icon: 'description' },
  { id: 'community', label: 'Community', icon: 'favorite' },
  { id: 'setup',     label: 'Workspaces', icon: 'work' },
];

// Sealed NAV-TABS RIGHT CLUSTER: the context-aware "Create new" (+) shows for
// exactly these views (on setup it opens the new-workspace modal; elsewhere it
// fires the per-view create flow).
const CREATE_VIEWS = ['sheet', 'scoring', 'plan', 'community', 'setup'];

export function AppShell() {
  const [view, setView] = useState('sheet');
  const isMaster = true; // workspace state arrives with the shell-state phase

  // SEALED addNonceFor ROUTE, adapted to this shell: the oracle kept
  // addNonce + addNonceFor("sheet") state in app.jsx and the Lists view
  // watched the nonce to open its create modal. This shell has no nav-tab
  // row (Claude form factor ruling) — the (+) lives in the content header's
  // trailing cluster instead — and the nonce is passed to the page as the
  // createNonce prop (no window.__* bridges; first-class props per the
  // make-real law). Only the sheet flow exists yet, so the (+) is live on
  // the Lists view and honestly inert (disabled + phase note) on the other
  // sealed create views until their phases land.
  const [createNonce, setCreateNonce] = useState(0);

  const visibleTabs = NAV_TABS.filter(t => !(isMaster && t.hideWhenMaster));

  return (
    <ui-app-shell>
      {/* RULED chrome — identical on every screen: mark + name + workspace
          selector left, search right. */}
      {/* RULED (Claude form factor): the rail is full-height; the brand lives at
          the TOP OF THE RAIL; the content area gets its own thin header carrying
          the workspace selector + search. */}
      <ui-app-bar slot="header" variant="flat">
        <span slot="leading" className="ws-select is-pending" aria-disabled="true"
              title="Workspace switching arrives with the shell-state phase">
          Master <ui-icon size="sm">expand_more</ui-icon>
        </span>
        {CREATE_VIEWS.includes(view) && (
          <ui-icon-button
            slot="trailing"
            variant="standard"
            aria-label="Create new"
            title={view === 'sheet'
              ? 'Create new'
              : "Create new — wires up with this page's build phase"}
            disabled={view === 'sheet' ? undefined : ''}
            onClick={view === 'sheet' ? () => setCreateNonce(n => n + 1) : undefined}
          >
            <ui-icon>add</ui-icon>
          </ui-icon-button>
        )}
        <ui-icon-button slot="trailing" variant="standard" disabled aria-label="Search"
                        title="Search (⌘K) arrives with the command-palette phase">
          <ui-icon>search</ui-icon>
        </ui-icon-button>
      </ui-app-bar>

      <ui-sidebar slot="nav">
        <span slot="brand" className="brand">
          <span className="mark">S<i>r</i></span>
          <span className="brand-text">Stakeholdr</span>
        </span>
        {visibleTabs.map(t => (
          <ui-sidebar-item
            key={t.id}
            active={view === t.id ? '' : undefined}
            onClick={() => setView(t.id)}
          >
            <ui-icon slot="icon">{t.icon}</ui-icon>
            {t.label}
          </ui-sidebar-item>
        ))}
        <div className="nav-sec">Workspaces</div>
        <ui-sidebar-item active="">
          <ui-icon slot="icon">workspaces</ui-icon>Master
        </ui-sidebar-item>
        <ui-sidebar-item slot="footer" onClick={() => setView('help')} active={view === 'help' ? '' : undefined}>
          <ui-icon slot="icon">help</ui-icon>Help
        </ui-sidebar-item>
        <div slot="footer" className="me">
          <ui-avatar name="Colin Maynard" size="sm"></ui-avatar>
          <span className="me-name">Colin Maynard</span>
        </div>
      </ui-sidebar>

      <div className="work">
        {/* Pages mount here phase by phase (Build Protocol order). Phase 2:
            the Lists page (SheetPage) is live. Until another page's phase
            runs, an honest placeholder states the build state rather than
            faking a screen. */}
        {view === 'sheet' ? (
          <SheetPage createNonce={createNonce} />
        ) : (
          <ui-card variant="outlined">
            <div className="ph-title">
              {(visibleTabs.find(t => t.id === view) || { label: 'Help' }).label}
            </div>
            <p className="ph-body">
              Phase 1 scaffold — the shell is live (chrome, nav, tokens, theme cascade).
              This page assembles in its build phase, node by node against its sealed
              skeleton tree.
            </p>
          </ui-card>
        )}
      </div>

      <ui-status-bar slot="footer">
        <span>Build: Phase 4 — stakeholder create/edit modal</span>
        <span slot="end">Build Protocol active · zero literal hex</span>
      </ui-status-bar>
    </ui-app-shell>
  );
}
