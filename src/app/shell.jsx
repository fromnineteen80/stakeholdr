import { useState } from 'react';
// Canonical UI: the ONE component source. Side-effect import registers every
// ui-* element and loads the token contract (tokens.css).
import '../../design-system/entry.js';
import './app.css';

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

export function AppShell() {
  const [view, setView] = useState('sheet');
  const isMaster = true; // workspace state arrives with the shell-state phase

  const visibleTabs = NAV_TABS.filter(t => !(isMaster && t.hideWhenMaster));

  return (
    <ui-app-shell>
      {/* RULED chrome — identical on every screen: mark + name + workspace
          selector left, search right. */}
      <ui-app-bar slot="header" variant="flat">
        <span slot="leading" className="brand">
          <span className="mark">S<i>r</i></span> Stakeholdr
        </span>
        <span className="ws-select" role="button" tabIndex={0} aria-label="Switch workspace">
          Master <ui-icon size="sm">expand_more</ui-icon>
        </span>
        <ui-icon-button slot="trailing" variant="standard" aria-label="Search">
          <ui-icon>search</ui-icon>
        </ui-icon-button>
      </ui-app-bar>

      <ui-sidebar slot="nav">
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
        {/* Pages mount here phase by phase (Build Protocol order). Until a
            page's phase runs, this honest placeholder states the build state
            rather than faking a screen. */}
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
      </div>

      <ui-status-bar slot="footer">
        <span>Build: Phase 1 — Foundation &amp; shell</span>
        <span slot="end">Build Protocol active · zero literal hex</span>
      </ui-status-bar>
    </ui-app-shell>
  );
}
