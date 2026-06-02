#!/usr/bin/env node
/* guard.mjs — the rule that breaks the build when I vibe.
 *
 * THE RULE: every visual result comes from a Material component or an MD3 design
 * token. No hand-built CSS for layout or look. The ONLY authored stylesheet is the
 * theme file, and it holds only @use / mat.theme / token (--*) declarations.
 *
 * Wired into `npm run build` (and CI) BEFORE the framework build. Any violation
 * exits non-zero, so nothing compiles or deploys until it is resolved.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const SRC = 'src';
// The single authored stylesheet allowed (the MD3 theme/token source).
const THEME_FILES = new Set(['styles.scss', 'styles.css', 'guide.css']);
// Property declarations that are hand-built look/layout (banned outside token defs).
const LOOK_PROPS = /^\s*(display|grid|grid-[a-z-]+|flex|flex-[a-z-]+|gap|padding|padding-[a-z]+|margin|margin-[a-z]+|border|border-[a-z]+|background|background-[a-z]+|width|height|min-width|min-height|max-width|max-height|position|top|left|right|bottom|float|box-shadow|font-size|font-family|font-weight|line-height|transform|transition|color|fill|inset|overflow|z-index|cursor|opacity|letter-spacing|text-transform)\s*:/i;
// A tiny, declared reset whitelist (the only non-token CSS the theme file may carry).
const RESET_OK = /^\s*(margin\s*:\s*0|height\s*:\s*100%|box-sizing\s*:|color-scheme\s*:|-webkit-font-smoothing\s*:)/i;
const BANNED = [
  { re: /box-shadow/i, why: 'box-shadow — shadows are banned. Use flat surfaces (elevation tokens = none).' },
  { re: /(linear|radial|conic)-gradient\s*\(/i, why: 'gradient — gradients are banned. Use a solid --md-sys/--mat-sys surface token.' },
  { re: /!important/i, why: '!important — banned. Style via the component/token, not overrides.' },
  { re: /@mui\/|@emotion\//i, why: 'MUI / Emotion import — banned. Material components + MD3 tokens only.' },
];
const violations = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else check(p);
  }
}

function check(p) {
  const ext = extname(p);
  const text = readFileSync(p, 'utf8');
  const lines = text.split('\n');
  const add = (i, why) => violations.push(`${p}:${i + 1}  ${why}`);

  // Banned tokens in any stylesheet or template (NOT scanned in .ts/.jsx/.tsx
  // because the lossless spec prose legitimately contains the words).
  if (['.css', '.scss', '.html'].includes(ext)) {
    lines.forEach((ln, i) => BANNED.forEach((b) => b.re.test(ln) && add(i, b.why)));
  }

  if (ext === '.css' || ext === '.scss') {
    if (!THEME_FILES.has(basename(p))) {
      violations.push(`${p}:1  stray stylesheet — the only authored stylesheet is the theme/token file. Use Material components + tokens.`);
      return;
    }
    // The theme file: token (--*) declarations, @use/@include/mat.*, selectors,
    // braces, comments, and the reset whitelist are OK. Any other look/layout
    // property declaration is hand-built CSS → break.
    lines.forEach((ln, i) => {
      const t = ln.trim();
      if (!t || t.startsWith('--') || t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')
        || t.startsWith('@') || t.includes('mat.') || RESET_OK.test(ln)) return;
      if (LOOK_PROPS.test(ln)) add(i, `hand-built CSS "${t.split(':')[0].trim()}" — use a Material component or an MD3 token, not a CSS rule.`);
    });
  }

  // Templates: no inline styles, no <style> blocks.
  if (ext === '.html') {
    lines.forEach((ln, i) => {
      if (/\sstyle\s*=/.test(ln)) add(i, 'inline style= — banned. Use a component input or token.');
      if (/<style[\s>]/.test(ln)) add(i, '<style> block — banned.');
    });
  }

  // Component-level stylesheets / inline styles in framework source.
  if (['.ts', '.tsx', '.jsx'].includes(ext)) {
    lines.forEach((ln, i) => {
      if (/\b(styleUrls?|styles)\s*:/.test(ln)) add(i, 'component stylesheet (styles/styleUrls) — banned. Global theme + Material components only.');
      if (/\bstyle\s*=\s*[{"'`]/.test(ln) || /\[style\]/.test(ln)) add(i, 'inline style in template — banned.');
      if (/@mui\/|@emotion\//.test(ln)) add(i, 'MUI / Emotion import — banned.');
    });
  }
}

walk(SRC);

if (violations.length) {
  console.error('\n\x1b[41m\x1b[97m  GUARD FAILED — RULE BROKEN — BUILD STOPPED  \x1b[0m');
  console.error('  Every visual result must come from a Material component or an MD3 design token.');
  console.error('  No hand-built CSS, no shadows, no gradients, no !important, no inline styles, no MUI.\n');
  for (const v of violations) console.error('  \x1b[31m✘\x1b[0m ' + v);
  console.error(`\n  ${violations.length} violation(s). Resolve every one before the build can proceed.\n`);
  process.exit(1);
}
console.log('\x1b[32m✓ guard passed\x1b[0m — no hand-built CSS / shadows / gradients / inline styles / MUI.');
