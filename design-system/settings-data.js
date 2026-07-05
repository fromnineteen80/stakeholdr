/* ============================================================================
 * settings-data.js — token-adjacent DATA module for the Settings hub + the
 * Design dashboard. Registered in manifest.json ("data" section).
 *
 * WHY THIS FILE LIVES IN design-system/: the sealed Settings box carries
 * literal hex CATALOGS (the 7 brand/accent config swatches; the three theme
 * presets' preview values; the three accent-hue DECISION candidates). Those
 * hexes are sealed DATA — option values a manager picks and the app stores in
 * appConfig — not styling. The app-code guard bans literal hex in src/app
 * (styling law), so the sealed catalogs live HERE, beside tokens.css, exactly
 * like the token contract itself. Where a value is ALSO a render surface it
 * carries its token reference (rendered via tokens, stored as data).
 * ==========================================================================*/

/* THE 7 CONFIG SWATCHES (sealed Settings box, verbatim order — shared by BOTH
 * the Brand and Accent pickers). value = the hex stored in appConfig;
 * token = the render token registered in tokens.css (census group F). */
export const CONFIG_SWATCHES = [
  { value: '#000000', token: '--ui-sys-config-swatch-1' },
  { value: '#1976D2', token: '--ui-sys-config-swatch-2' },
  { value: '#E64A19', token: '--ui-sys-config-swatch-3' },
  { value: '#AD1457', token: '--ui-sys-config-swatch-4' },
  { value: '#388E3C', token: '--ui-sys-config-swatch-5' },
  { value: '#00897B', token: '--ui-sys-config-swatch-6' },
  { value: '#BF360C', token: '--ui-sys-config-swatch-7' },
];

/* Brand start-state (sealed appConfig brand default; rendered via
 * --ui-sys-brand, stored only when the manager picks a different value). */
export const BRAND_DEFAULT = '#000000';

/* THE THEME PRESETS (sealed Theme section, verbatim ids/labels/subs; preview
 * values are theme-preview TOKENS in tokens.css per the sealed ui-swatch-card
 * contract — "never inline hex in screen markup"). `live`: soapbox is the
 * shipping default token set; Undecideds / Night Shift await their named
 * token sets (the open wrapper-theme ruling) and render honestly inert. */
export const THEME_PRESETS = [
  {
    id: 'soapbox', label: 'Soapbox', sub: 'Warm beige', live: true,
    bg: 'var(--ui-sys-theme-preview-soapbox-bg)',
    dot: 'var(--ui-sys-theme-preview-soapbox-dot)',
    border: 'var(--ui-sys-theme-preview-soapbox-border)',
  },
  {
    id: 'undecideds', label: 'Undecideds', sub: 'True greyscale', live: false,
    bg: 'var(--ui-sys-theme-preview-undecideds-bg)',
    dot: 'var(--ui-sys-theme-preview-undecideds-dot)',
    border: 'var(--ui-sys-theme-preview-undecideds-border)',
  },
  {
    id: 'nightshift', label: 'Night Shift', sub: 'Warm charcoal', live: false,
    bg: 'var(--ui-sys-theme-preview-nightshift-bg)',
    dot: 'var(--ui-sys-theme-preview-nightshift-dot)',
    border: 'var(--ui-sys-theme-preview-nightshift-border)',
  },
];

/* THE ACCENT-HUE DECISION CANDIDATES (the sealed OPEN DESIGN DECISION — the
 * Design page surfaces these for the USER to rule; the default stays the
 * tokens.css start-state and nothing here pre-decides):
 *   #B5552C — the tokens.css start-state terracotta (current default)
 *   #D96B43 — design.md's proposed terracotta
 *   #024AD8 — the oracle's shipped blue (the census group-C DECISION find) */
export const ACCENT_CANDIDATES = [
  { value: '#B5552C', label: 'Terracotta', sub: 'tokens.css start-state' },
  { value: '#D96B43', label: 'Terracotta (light)', sub: 'design.md proposal' },
  { value: '#024AD8', label: 'Blue', sub: 'the original app shipped this' },
];

/* WRAPPER THEME SETS (the third open decision — Cream default vs the Modern
 * minimalist variant; both are NAMED TOKEN SETS in tokens.css. Zone colors,
 * zone inks/borders, and pill semantics are never touched by either.) */
export const WRAPPER_THEMES = [
  {
    id: 'cream', label: 'Cream', sub: 'Soapbox warm start-state',
    bg: 'var(--ui-sys-theme-preview-soapbox-bg)',
    dot: 'var(--ui-sys-theme-preview-soapbox-dot)',
    border: 'var(--ui-sys-theme-preview-soapbox-border)',
  },
  {
    id: 'modern', label: 'Modern', sub: 'Cool minimalist variant',
    bg: 'var(--ui-sys-theme-preview-modern-bg)',
    dot: 'var(--ui-sys-theme-preview-modern-dot)',
    border: 'var(--ui-sys-theme-preview-modern-border)',
  },
];
