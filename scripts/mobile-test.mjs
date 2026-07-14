#!/usr/bin/env node
/* mobile-test.mjs — node assertions for the Phase-20 mobile companion's pure
 * core (src/app/mobile-logic.js): the breakpoint-query builder (token →
 * matchMedia string, with the fail-safe fallback), the sealed surface scope,
 * and the quick-view field mapping.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  MOBILE_FALLBACK_PX, breakpointQuery, MOBILE_VIEWS, DESKTOP_NOTE_BODY,
  quickViewFields,
} from '../src/app/mobile-logic.js';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log(`  ✓ ${name}`); };

/* ── breakpoint mechanism ─────────────────────────────────────────────────── */

t('breakpointQuery builds a max-width query from the token value', () => {
  assert.equal(breakpointQuery('720px'), '(max-width: 720px)');
  assert.equal(breakpointQuery('  600px  '), '(max-width: 600px)'); // computed-style whitespace
  assert.equal(breakpointQuery('480'), '(max-width: 480px)');
});

t('a missing or garbled token falls back — the query is always valid', () => {
  const fb = `(max-width: ${MOBILE_FALLBACK_PX}px)`;
  assert.equal(breakpointQuery(''), fb);
  assert.equal(breakpointQuery(null), fb);
  assert.equal(breakpointQuery(undefined), fb);
  assert.equal(breakpointQuery('garbage'), fb);
  assert.equal(breakpointQuery('-5px'), fb);
});

t('the token exists in tokens.css and matches the fallback (one source, no drift)', () => {
  const css = readFileSync(new URL('../design-system/tokens.css', import.meta.url), 'utf8');
  const m = css.match(/--ui-sys-breakpoint-mobile:\s*(\d+)px/);
  assert.ok(m, 'tokens.css must declare --ui-sys-breakpoint-mobile');
  assert.equal(Number(m[1]), MOBILE_FALLBACK_PX,
    'the JS fallback must equal the token start-state');
});

/* ── the sealed surface scope ─────────────────────────────────────────────── */

t('mobile views are exactly the sealed companion surfaces: Lists + Messages', () => {
  assert.deepEqual(MOBILE_VIEWS, ['sheet', 'messages']);
});

t('the desktop note is honest copy, not a label', () => {
  assert.ok(DESKTOP_NOTE_BODY.length > 80);
  assert.ok(DESKTOP_NOTE_BODY.includes('desktop'));
});

/* ── quick-view field mapping ─────────────────────────────────────────────── */

const users = [
  { id: 'u-1', name: 'Alex Chen' },
  { id: 'u-2', name: 'Dana Fox' },
];

t('quickViewFields maps the computed row to the six read fields', () => {
  const row = {
    category: 'Government', type: 'Mayor', market: 'Americas',
    region: 'United States', priority: 'High', status: 'Active',
    lastContact: '2026-06-01', owners: ['u-1', 'u-2'],
  };
  assert.deepEqual(quickViewFields(row, users), [
    { label: 'Category', value: 'Government · Mayor' },
    { label: 'Market', value: 'Americas · United States' },
    { label: 'Priority', value: 'High' },
    { label: 'Status', value: 'Active' },
    { label: 'Last contact', value: '2026-06-01' },
    { label: 'Owners', value: 'Alex Chen, Dana Fox' },
  ]);
});

t('absent values render an honest em dash; stale owner ids drop silently', () => {
  const row = { category: 'Communities', owners: ['u-ghost', 'u-2'] };
  const f = Object.fromEntries(quickViewFields(row, users).map((x) => [x.label, x.value]));
  assert.equal(f.Category, 'Communities');   // pair with no type = just category
  assert.equal(f.Market, '—');
  assert.equal(f.Priority, '—');
  assert.equal(f.Status, '—');
  assert.equal(f['Last contact'], '—');
  assert.equal(f.Owners, 'Dana Fox');        // the ghost id never renders
});

t('no owners at all reads as an em dash, never an empty string', () => {
  const f = Object.fromEntries(quickViewFields({}, users).map((x) => [x.label, x.value]));
  assert.equal(f.Owners, '—');
});

console.log(`mobile-test: all ${n} assertions passed`);
