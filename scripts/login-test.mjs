#!/usr/bin/env node
/* login-test.mjs — Phase 23 node gate for the LOGIN GATE's pure core
 * (src/app/login-logic.js) + the session seam's surface (data/session.js) +
 * the sweep integration (store.js). Pins the sealed lines:
 *  · validity = name.trim() && email.trim() && /@/.test(email) (sealed exact)
 *  · the sealed new-user record shape (default title "Team member", first
 *    swatch default, presence online, stamps)
 *  · ⚠ NO AUTO-PROMOTE (sealed trap, App-shell box + demo-features ~3882 +
 *    INDEX gate 5): a 'member' (UI "User") role stays 'member' through login;
 *    the directory upsert never writes a role of its own
 *  · session semantics: { userId } under the store table 'session' —
 *    "hpsm:session" falls inside the sealed reset sweep, so demo-reset /
 *    blank-start also LOG OUT
 *  · the demo-account list = every non-system user (blank mode → u-you).
 */
import assert from 'node:assert/strict';
import {
  SESSION_TABLE, SESSION_KEY, sessionRecord, sessionUserId, currentUserFrom,
  LOGIN, submitLabel, loginValid, buildLoginUser, upsertUser, demoAccounts,
  DEFAULT_TITLE, NEW_USER_ROLE, AVATAR_DEFAULT,
} from '../src/app/login-logic.js';
import {
  getSession, signIn, signOut, currentUserId,
} from '../src/app/data/session.js';
import { sweepKeys, Store } from '../src/app/data/store.js';
import { SEED_USERS, BLANK_SOLO_USER, blankSeedFor } from '../src/app/data/seed.js';

let passed = 0;
const ok = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name); };

console.log('login-test: sealed login gate core');

/* ── sealed validity ─────────────────────────────────────────────────────── */
ok('valid = name + email present, email merely CONTAINS "@" (sealed exact)', () => {
  assert.equal(loginValid('Jordan Kim', 'jordan.kim@hp.com'), true);
  assert.equal(loginValid('Jordan Kim', 'x@'), true); // sealed: contains "@" is enough
  assert.equal(loginValid('Jordan Kim', 'not-an-email'), false);
  assert.equal(loginValid('', 'jordan.kim@hp.com'), false);
  assert.equal(loginValid('   ', 'jordan.kim@hp.com'), false); // trim
  assert.equal(loginValid('Jordan Kim', '   '), false);
  assert.equal(loginValid('Jordan Kim', ''), false);
});

/* ── sealed new-user record ──────────────────────────────────────────────── */
ok('buildLoginUser mints the sealed record shape', () => {
  const u = buildLoginUser(
    { name: '  Casey Fox ', title: '', email: ' casey@hp.com ' },
    (p) => p + '-test', 'STAMP');
  assert.equal(u.id, 'u-test');
  assert.equal(u.name, 'Casey Fox');
  assert.equal(u.title, DEFAULT_TITLE); // sealed default "Team member"
  assert.equal(DEFAULT_TITLE, 'Team member');
  assert.equal(u.email, 'casey@hp.com');
  assert.equal(u.avatarColor, AVATAR_DEFAULT); // sealed first swatch
  assert.equal(AVATAR_DEFAULT, 'var(--ui-sys-avatar-1)');
  assert.equal(u.avatarUrl, null);
  assert.equal(u.presence, 'online'); // sealed: new users start online
  assert.equal(u.createdAt, 'STAMP');
  assert.equal(u.updatedAt, 'STAMP');
});

ok('a fresh sign-up gets the BASE role — never manager (sealed trap)', () => {
  const u = buildLoginUser({ name: 'A', email: 'a@b' }, (p) => p + '-1', 't');
  assert.equal(u.role, NEW_USER_ROLE);
  assert.equal(NEW_USER_ROLE, 'member');
  assert.notEqual(u.role, 'manager');
});

/* ── NO AUTO-PROMOTE through the directory upsert ────────────────────────── */
ok("a 'user' (member) role STAYS member through login — no auto-promote", () => {
  const sam = SEED_USERS.find((u) => u.id === 'u-sam');
  assert.equal(sam.role, 'member'); // the fixture the drive signs in as
  const after = upsertUser(SEED_USERS, sam);
  assert.equal(after.find((u) => u.id === 'u-sam').role, 'member');
  // and NO other record's role moved either
  for (const u of SEED_USERS) {
    assert.equal(after.find((x) => x.id === u.id).role, u.role);
  }
});

ok('upsertUser: present → map-merge in place; absent → append (sealed logIn)', () => {
  const fresh = buildLoginUser({ name: 'New', email: 'n@hp.com' }, (p) => p + '-new', 't');
  const appended = upsertUser(SEED_USERS, fresh);
  assert.equal(appended.length, SEED_USERS.length + 1);
  assert.equal(appended[appended.length - 1].id, 'u-new');
  const edited = { ...SEED_USERS[0], title: 'VP, Government Affairs' };
  const merged = upsertUser(SEED_USERS, edited);
  assert.equal(merged.length, SEED_USERS.length);
  assert.equal(merged[0].title, 'VP, Government Affairs');
  assert.equal(merged[0].role, SEED_USERS[0].role); // role untouched
});

/* ── session semantics ───────────────────────────────────────────────────── */
ok('session record/derivation: { userId } → currentUser from the directory', () => {
  assert.deepEqual(sessionRecord('u-alex'), { userId: 'u-alex' });
  assert.equal(sessionUserId({ userId: 'u-alex' }), 'u-alex');
  assert.equal(sessionUserId(null), null);
  assert.equal(currentUserFrom(SEED_USERS, { userId: 'u-alex' }).name, 'Alex Rivera');
  assert.equal(currentUserFrom(SEED_USERS, null), null); // signed out → gate
  // a session whose user was REMOVED resolves null (never a crash/fallback)
  assert.equal(currentUserFrom(SEED_USERS.filter((u) => u.id !== 'u-alex'),
    { userId: 'u-alex' }), null);
});

ok('sweep integration: "hpsm:session" falls inside the sealed reset sweep', () => {
  assert.equal(SESSION_KEY, 'hpsm:' + SESSION_TABLE);
  assert.deepEqual(sweepKeys([SESSION_KEY, 'other:key', 'session']), [SESSION_KEY]);
  // ⇒ Store.reset() / startBlank() (demo reset + blank start) also LOG OUT.
});

ok('the seam surface: getSession/signIn/signOut/currentUserId exported', () => {
  // node has no localStorage — the seam must be safe (load returns the null
  // seed; the writers no-op on storage). The State-B Supabase swap point.
  assert.equal(typeof getSession, 'function');
  assert.equal(typeof signIn, 'function');
  assert.equal(typeof signOut, 'function');
  assert.equal(typeof currentUserId, 'function');
  assert.equal(getSession(), null);
  assert.equal(currentUserId(), null);
  signIn('u-alex'); // storage-less: must not throw
  signOut();
  assert.equal(typeof Store.load, 'function');
});

ok('blank mode: the session table boots null (the gate is the entry)', () => {
  assert.equal(blankSeedFor(SESSION_TABLE, null), null);
});

/* ── the demo-account list ───────────────────────────────────────────────── */
ok('demo list = every seeded non-system user; blank mode → u-you', () => {
  const demo = demoAccounts(SEED_USERS);
  assert.equal(demo.length, 7); // 8 seed users minus the u-system bot
  assert.ok(!demo.some((u) => u.role === 'system'));
  const blankUsers = blankSeedFor('users', SEED_USERS);
  const blankDemo = demoAccounts(blankUsers);
  assert.deepEqual(blankDemo.map((u) => u.id), [BLANK_SOLO_USER.id]);
  assert.equal(blankDemo[0].id, 'u-you');
  assert.equal(blankDemo[0].role, 'manager'); // the blank org never locks out
});

/* ── sealed strings ──────────────────────────────────────────────────────── */
ok('sealed copy pinned (h1/sub/subline/demo label/submit)', () => {
  assert.equal(LOGIN.h1, 'Sign in');
  assert.equal(LOGIN.sub, 'Tell us who you are to get started.');
  assert.equal(LOGIN.subline, 'Stakeholder mapping & engagement');
  assert.equal(LOGIN.demoLabel, 'Or continue as one of the demo accounts:');
  assert.equal(LOGIN.namePlaceholder, 'Jordan Kim');
  assert.equal(LOGIN.titlePlaceholder, 'Director, GA&PP North America');
  assert.equal(LOGIN.emailPlaceholder, 'jordan.kim@hp.com');
  assert.equal(submitLabel('Stakeholdr'), 'Enter Stakeholdr →');
});

console.log(`\nlogin-test: all ${passed} checks passed`);
/* store.js opens a BroadcastChannel at module load (node ≥18 ships the
 * global), which keeps the event loop referenced — exit explicitly. */
process.exit(0);
