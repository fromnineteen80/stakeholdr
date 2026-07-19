#!/usr/bin/env node
/* run-tests.mjs — the build's test gate. Runs every node assertion suite and
 * exits non-zero on ANY failure, so sealed-box drift cannot ship (wired into
 * `npm run build` between guard.mjs and vite). Each suite stays independently
 * runnable (node scripts/<suite>.mjs).
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SUITES = [
  'engine-test.mjs',
  'lists-test.mjs',
  'modal-test.mjs',
  'map-test.mjs',
  'scoring-test.mjs',
  'plan-test.mjs',
  'community-test.mjs',
  'setup-test.mjs',
  'help-test.mjs',
  'settings-test.mjs',
  'messages-test.mjs',
  'profile-test.mjs',
  'record-test.mjs',
  'workhq-test.mjs',
  'palette-test.mjs',
  'scale-test.mjs',
  'import-test.mjs',
  'demo-test.mjs',
  'tour-test.mjs',
  'mobile-test.mjs',
  'login-test.mjs',
  'archive-test.mjs',
];

let failed = 0;
for (const suite of SUITES) {
  const path = fileURLToPath(new URL(suite, import.meta.url));
  const r = spawnSync(process.execPath, [path], { stdio: 'inherit' });
  if (r.status !== 0) {
    failed++;
    console.error(`\n✘ ${suite} FAILED (exit ${r.status})\n`);
  }
}

if (failed) {
  console.error(`\nrun-tests: ${failed} of ${SUITES.length} suite(s) FAILED — BUILD STOPPED`);
  process.exit(1);
}
console.log(`\nrun-tests: all ${SUITES.length} suites passed`);
