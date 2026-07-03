#!/usr/bin/env node
/* guard.mjs — the rule that breaks the build when anyone vibes.
 * Canonical UI edition (supersedes the MD3-era guard; RULED 2026-06-13).
 *
 * Scope: the rebuilt app (src/app). The guide (src/guide.jsx) is a temporary
 * scratch surface and design-system/ is the token/component source — exempt.
 *
 * LAWS ENFORCED:
 *   1. The oracle is RETIRED. No import or reference into archive/ or project/.
 *   2. Tokens only: no literal hex colors anywhere in app code.
 *   3. Forbidden libraries: @material/web, @mui, tailwind, lucide, @emotion.
 *   4. No !important, no gradients, no inline style= in app markup.
 * Wired into `npm run build` BEFORE vite — nothing compiles until clean.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const APP = 'src/app';
const violations = [];
const add = (p, i, why) => violations.push(`${p}:${i + 1}  ${why}`);

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!['.js', '.jsx', '.mjs', '.css', '.html'].includes(extname(p))) continue;
    const lines = readFileSync(p, 'utf8').split('\n');
    lines.forEach((ln, i) => {
      const comment = /^\s*(\/\/|\/\*|\*)/.test(ln);
      if (/(from|import)\s*\(?\s*['"][^'"]*(archive|project)\//.test(ln))
        add(p, i, 'imports the RETIRED ORACLE — build only from the sealed guide.');
      if (!comment && /#[0-9a-fA-F]{3,8}\b/.test(ln))
        add(p, i, `literal hex color — tokens only (--ui-sys-*): ${ln.trim().slice(0, 80)}`);
      if (/@material\/web|@mui\/|@emotion\/|tailwind|lucide/.test(ln))
        add(p, i, 'forbidden UI library — Canonical UI (ui-*) only.');
      if (!comment && /!important/.test(ln))
        add(p, i, '!important — banned; fix at the token/component.');
      if (!comment && /(linear|radial|conic)-gradient\s*\(/.test(ln))
        add(p, i, 'gradient — banned (no gradients ever).');
      if (['.jsx', '.html'].includes(extname(p)) && /\sstyle\s*=\s*[{"'`]/.test(ln))
        add(p, i, 'inline style= — banned; use the token-only app.css layer or a component prop.');
    });
  }
}

if (existsSync(APP)) walk(APP);

if (violations.length) {
  console.error('\nGUARD FAILED — BUILD STOPPED');
  console.error('The app is assembled from sealed boxes + Canonical UI + tokens. Nothing else.');
  for (const v of violations) console.error('  ✘ ' + v);
  console.error(`\n${violations.length} violation(s). Resolve every one.\n`);
  process.exit(1);
}
console.log('✓ guard passed — no oracle reads, no literal hex, no forbidden libs, no !important/gradients/inline styles in app code.');
