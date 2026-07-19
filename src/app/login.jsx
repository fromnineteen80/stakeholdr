/* login.jsx — THE LOGIN GATE (Phase 23): the full-page sign-in surface, the
 * ONLY mount when no session resolves (sealed App-shell box: "If
 * (!currentUser) the WHOLE app renders only LoginView — nothing else
 * mounts"). Assembled against the LOGINVIEW skeleton tree in the sealed
 * Users & People box (src/guide.jsx ~2689–2714); all pure logic lives in
 * login-logic.js (node-tested by scripts/login-test.mjs).
 *
 * SEALED LINES HONORED (the strings/validity/record shape live in
 * login-logic.js — see its header for the full list): the login-shell /
 * bg-grid / centered-card structure · brand block + "Stakeholder mapping &
 * engagement" subline · "Sign in" + "Tell us who you are to get started." ·
 * the four fields in sealed order with sealed placeholders (Full name
 * autofocused on mount) · live preview circle + Upload/Replace photo +
 * ghost Remove (photo set) / the 8 avatar swatches (no photo) · submit
 * disabled until valid · the demo-accounts block underneath.
 *
 * ⚠ SEALED TRAP HONORED — NO AUTO-PROMOTE (App-shell box + demo-features
 * ~3882 + INDEX gate 5): signing in NEVER touches role. The demo rows hand
 * the existing directory record to onLogin untouched; a fresh sign-up mints
 * the base 'member' role (login-logic.buildLoginUser). The shell's Settings
 * gate keeps reading currentUser.role === 'manager' from the record only.
 *
 * DECLARED RECOMPOSITIONS (never silent):
 *  · Canonical UI per the sealed build map: ui-text-field (via the shared
 *    TF/Field bridges) · ui-button submit/remove · ui-upload (the shared
 *    photo-pick GAP component, profile.jsx Upload bridge) · the 8 swatches =
 *    the shared AvatarSwatches radiogroup (ui-swatch-card dot variant over
 *    --ui-sys-avatar-1..8 — profile.jsx single source; the sealed literal-hex
 *    aria "Pick color {hex}" reads "Avatar color {n}", census CAPTURED→TOKEN)
 *    · the preview circle = the ONE UAv/ui-avatar primitive (photo when set,
 *    else color + initials — the component's own empty-name rendering stands
 *    in for the sealed "··" placeholder glyphs).
 *  · DEMO LIST: full rows (UAv + name + title) in a ui-list, per the Phase-23
 *    ruling superseding the sealed 5 first-name chips (login-logic header).
 *  · BRAND (shell ruling #4 + the Settings BRAND-COLOR scope note "apply …
 *    to the LOGIN SCREEN … when those phases land" — THIS is that phase):
 *    with NO brandIcon the circular Sr monogram renders on the ruled
 *    --ui-sys-on-surface field (mark == title ink, exempt from
 *    appConfig.brand by the settings.jsx ledger); with a brandIcon uploaded
 *    the sealed icon circle renders wearing appConfig.brand via the shared
 *    Tinted bridge (--tint DATA, --ui-sys-brand token fallback — the same
 *    anatomy as the Settings pane preview). App name + submit label bind to
 *    appConfig.appName (sealed do-not-replicate fix). The sealed #024AD8
 *    login-default-brand literal collapses into the --ui-sys-brand token
 *    fallback (no literal hex in app code).
 *  · The sealed decorative login-bg-grid keeps its node but renders as a flat
 *    tokened runway band — the oracle's grid pattern needs gradients, and the
 *    design law is "no gradients ever" (guide canonical mapping: "the
 *    login-bg-grid backdrop and login-card become tokened surfaces").
 *  · The sealed <form onSubmit> anatomy is recomposed as a keydown handler
 *    on .login-form: Enter in any field submits (when valid) — the sealed
 *    keyboard path, on the composition-law markup (audit 2026-07-15).
 */
import { useEffect, useRef, useState } from 'react';
import { uid, nowStamp } from './data/store.js';
import { appNameFrom } from './data/company.js';
import { Field, TF, UAv } from './modals/stakeholder-modal.jsx';
import { Upload, AvatarSwatches } from './pages/profile.jsx';
import { Tinted } from './pages/settings.jsx';
import {
  LOGIN, loginValid, buildLoginUser, demoAccounts, submitLabel,
  AVATAR_DEFAULT,
} from './login-logic.js';

export function LoginScreen({ users, appConfig, onLogin }) {
  const cfg = appConfig || {};
  const appName = appNameFrom(cfg);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState(null);
  const [color, setColor] = useState(AVATAR_DEFAULT);

  // Sealed: the Full name field is focused on mount (ui-text-field delegates
  // focus to its inner input).
  const nameRef = useRef(null);
  useEffect(() => { nameRef.current?.focus?.(); }, []);

  const valid = loginValid(name, email);
  const submit = () => {
    if (!valid) return;
    onLogin(buildLoginUser(
      { name, title, email, avatarColor: color, avatarUrl: photo },
      uid, nowStamp()));
  };

  return (
    <div className="login-shell">
      <div className="login-bg-grid" aria-hidden="true"></div>
      <div className="login-card">
        <div className="login-brand">
          {cfg.brandIcon
            ? (
              <Tinted className="login-mark login-mark-icon" color={cfg.brand}>
                <img className="login-mark-img" src={cfg.brandIcon} alt="App icon" />
              </Tinted>
            )
            : <span className="login-mark login-mark-sr">S<i>r</i></span>}
          <span className="login-brand-text">
            <span className="login-app-name">{appName}</span>
            <span className="login-subline">{LOGIN.subline}</span>
          </span>
        </div>

        <h1 className="login-h1">{LOGIN.h1}</h1>
        <p className="login-sub">{LOGIN.sub}</p>

        <div className="login-form"
             onKeyDown={(e) => {
               if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); submit(); }
             }}>
          <Field label={LOGIN.fullName}>
            <TF label={LOGIN.fullName} placeholder={LOGIN.namePlaceholder}
                value={name} onValue={setName} fieldRef={nameRef} />
          </Field>
          <Field label={LOGIN.title}>
            <TF label={LOGIN.title} placeholder={LOGIN.titlePlaceholder}
                value={title} onValue={setTitle} />
          </Field>
          <Field label={LOGIN.email}>
            <TF label={LOGIN.email} type="email"
                placeholder={LOGIN.emailPlaceholder}
                value={email} onValue={setEmail} />
          </Field>
          <Field label={LOGIN.photo}>
            <div className="login-avatar-row">
              {/* Live preview: photo (cover) when set, else the picked color
                  + initials — the sealed preview circle via the ONE avatar
                  primitive ("· ·" feeds the component's initials derivation
                  to render the sealed "··" placeholder before a name). */}
              <UAv user={{ name: name.trim() ? name : '· ·', avatarUrl: photo, avatarColor: color }}
                   size="lg" />
              <div className="login-avatar-actions">
                <Upload onData={setPhoto}>
                  {photo ? LOGIN.replacePhoto : LOGIN.uploadPhoto}
                </Upload>
                {photo
                  ? (
                    <ui-button variant="text" onClick={() => setPhoto(null)}>
                      {LOGIN.removePhoto}
                    </ui-button>
                  )
                  : <AvatarSwatches value={color} onPick={setColor} />}
              </div>
            </div>
          </Field>
          <ui-button
            variant="filled"
            class="login-submit"
            disabled={valid ? undefined : ''}
            onClick={submit}
          >
            {submitLabel(appName)}
          </ui-button>
        </div>

        <div className="login-sample">
          <span className="login-sample-label">{LOGIN.demoLabel}</span>
          <ui-list interactive="" class="login-sample-list">
            {demoAccounts(users).map((u) => (
              <ui-list-item
                key={u.id}
                interactive=""
                class="login-demo-row"
                title={`Continue as ${u.name}`}
                onClick={() => onLogin(u)}
              >
                <UAv slot="leading" user={u} size="sm" />
                {u.name}
                <span slot="supporting">{u.title}</span>
              </ui-list-item>
            ))}
          </ui-list>
        </div>
      </div>
    </div>
  );
}
