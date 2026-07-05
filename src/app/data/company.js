/* company.js — the ONE live seam between appConfig (Settings) and every
 * catalog consumer. Built from the sealed App-shell box's "appConfig →
 * COMPANY CATALOG OVERRIDE WIRING" + "LIVE THEMING + DOCUMENT TITLE"
 * sections in src/guide.jsx (~1752–1769).
 *
 * SEALED CONTRACT (binding): every dropdown, column, and picker that offers
 * categories, segments/business units, markets/regions, sites, issues, tags,
 * functions, or org goals reads the Settings-configured lists with the exact
 * present-AND-non-empty fallback (deriveCompanyCatalogs). A consumer bound to
 * the static seed catalogs is severed from Settings and WRONG.
 *
 * DO-NOT-REPLICATE (sealed): the oracle made the configured lists visible by
 * MUTATING the module-level catalog object (D.CATEGORIES = companyCategories,
 * …). This hook is the rebuild's single channel — React state through
 * usePersistentState('appConfig'), derived per mount, NEVER a module
 * mutation; catalogs.js constants are never reassigned.
 *
 * LIVE THEMING (sealed effect, applied by the shell via applyAppConfigLive):
 * cfg.accent → the accent token role · cfg.brand → the brand token role ·
 * document.title = cfg.appName || "Stakeholdr" (the tab title follows the
 * configured name — sealed must-survive). Plus the Phase-11 design-dashboard
 * overrides (designOverrides) and the wrapper-theme attribute; boot re-applies
 * everything from the persisted appConfig (no reload needed, none performed).
 */
import { useMemo } from 'react';
import { usePersistentState } from './store.js';
import {
  APP_CONFIG_SEED, deriveCompanyCatalogs, fiscalFrom,
  designOverrides, themeAttribute, DESIGN_VARS,
} from '../pages/settings-logic.js';

export { APP_CONFIG_SEED };

/* useCompanyConfig() → [cfg, updateAppConfig] — the raw config channel.
 * updateAppConfig(patch) shallow-merges (sealed) and stamps updatedAt. */
export function useCompanyConfig() {
  const [appConfig, setAppConfig] = usePersistentState('appConfig', APP_CONFIG_SEED);
  const updateAppConfig = (patch) => {
    setAppConfig((prev) => ({
      ...(prev || {}),
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  };
  return [appConfig || {}, updateAppConfig];
}

/* useCompanyCatalogs() — the eight company* catalogs with the sealed
 * fallback, plus the fiscal anchor. Any component that renders an editable
 * catalog calls THIS (cheap: one shared store table + a memo). */
export function useCompanyCatalogs() {
  const [cfg] = useCompanyConfig();
  return useMemo(() => ({
    ...deriveCompanyCatalogs(cfg),
    fiscal: fiscalFrom(cfg),
    appName: cfg.appName || 'Stakeholdr',
  }), [cfg]);
}

/* applyAppConfigLive(cfg) — writes the persisted config into the live
 * document: the wrapper-theme attribute, the design-dashboard token
 * overrides, the identity accent/brand roles, and the tab title. Clears
 * every dashboard-owned variable first so switching back to a start-state
 * choice really returns to tokens.css (reset = clear, sealed p3 "defaults
 * remain the tokens.css start-state"). */
export function applyAppConfigLive(cfg) {
  if (typeof document === 'undefined') return;
  const c = cfg || {};
  const root = document.documentElement;

  const theme = themeAttribute(c.design);
  if (theme) root.setAttribute('data-theme', theme);
  else root.removeAttribute('data-theme');

  for (const v of DESIGN_VARS) root.style.removeProperty(v);
  root.style.removeProperty('--ui-sys-brand');
  for (const [name, value] of designOverrides(c.design)) {
    root.style.setProperty(name, value);
  }
  /* Identity pane accent/brand (sealed live-theming effect). The accent is
   * the SAME role the dashboard edits — appConfig.accent is the one source;
   * design.accent is not a second channel (the dashboard writes cfg.accent). */
  if (c.accent && /^#[0-9a-fA-F]{6}$/.test(c.accent)) {
    root.style.setProperty('--ui-sys-accent', c.accent);
    root.style.setProperty('--ui-sys-accent-ink',
      `color-mix(in srgb, ${c.accent} 65%, var(--ui-ref-ink-strong))`);
  }
  if (c.brand && /^#[0-9a-fA-F]{6}$/.test(c.brand)) {
    root.style.setProperty('--ui-sys-brand', c.brand);
  }
  document.title = c.appName || 'Stakeholdr';
}
