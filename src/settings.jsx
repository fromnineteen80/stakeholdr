import { useState, useEffect } from 'react';
import { STAKEHOLDER_DATA } from './data';
import { Icon } from './components';
import { Avatar, UserName, ManagerStar } from './users';
// Settings page - manager-only: Roles & Responsibilities, App settings.

export function SettingsView({ users, currentUser, updateUserRole, appConfig, updateAppConfig, companyIssues, updateCompanyIssues, companyTags, updateCompanyTags, companyFunctions, updateCompanyFunctions, companyMarkets, updateCompanyMarkets, companySites, updateCompanySites, companySegments, updateCompanySegments, companyCategories, updateCompanyCategories, companyGoals, updateCompanyGoals }) {
  const [filter, setFilter] = useState("");
  const [pane, setPane] = useState("identity");

  function onPickBrandIcon(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => updateAppConfig({ brandIcon: reader.result });
    reader.readAsDataURL(f);
  }
  const q = filter.toLowerCase();
  const filtered = users
    .filter(u => u.role !== "system")
    .filter(u => !q || u.name.toLowerCase().includes(q) || (u.title || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q));
  const managers = filtered.filter(u => u.role === "manager").length;

  const swatches = ["#000000", "#1976D2", "#E64A19", "#AD1457", "#388E3C", "#00897B", "#BF360C"];

  return (
    <div className="setup-wrap settings-wrap single-page settings-layout">
      <aside className="settings-nav">
        {[
          ["identity", "App Settings"],
          ["fiscal", "Fiscal Calendar"],
          ["stakeholders", "Stakeholders"],
          ["structure", "Your Structure"],
          ["geography", "Geography"],
          ["issues", "Issues"],
          ["tags", "Tags"],
          ["management", "Team Management"],
          ["contact", "Contact"]
        ].map(([id, label]) => (
          <button key={id} className={"settings-nav-item" + (pane === id ? " active" : "")} onClick={() => setPane(id)}>{label}</button>
        ))}
      </aside>
      <div className="settings-panes">

      {pane === "identity" && (
      <div className="setup-section">
        <div className="setup-section-head">
          <h3>Identity</h3>
        </div>
        <div className="settings-grid">
          <label className="login-field">
            <span className="lbl">App name</span>
            <input
              value={appConfig.appName}
              onChange={e => updateAppConfig({ appName: e.target.value })}
              placeholder="HP's Stakeholder Map"
            />
            <span className="muted" style={{ fontSize: 12.5 }}>
              Shown in the header, login screen, and browser tab title.
            </span>
          </label>

          <div className="login-field">
            <span className="lbl">Brand icon</span>
            <div className="brand-icon-row">
              <span className="brand-icon-preview" style={{ background: appConfig.brand || "#000000" }}>
                {appConfig.brandIcon ? (
                  <img src={appConfig.brandIcon} alt="Brand icon" />
                ) : (
                  <Icon name="brandmark" className="brand-glyph" />
                )}
              </span>
              <label className="btn brand-icon-btn">
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={onPickBrandIcon} />
                {appConfig.brandIcon ? "Replace icon" : "Upload icon"}
              </label>
              {appConfig.brandIcon && (
                <button type="button" className="btn btn-ghost brand-icon-btn" onClick={() => updateAppConfig({ brandIcon: null })}>Remove</button>
              )}
            </div>
            <span className="muted" style={{ fontSize: 12.5 }}>
              Replaces the default glyph inside the circular app icon. Sits on the brand color.
            </span>
          </div>

          <div className="login-field">
            <span className="lbl">Brand color (app icon)</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="settings-swatch-preview" style={{ background: appConfig.brand || "#000000" }} />
              <input
                type="text"
                value={appConfig.brand || "#000000"}
                onChange={e => updateAppConfig({ brand: e.target.value })}
                style={{ width: 100, fontSize: 12 }}
              />
              <BeakerColorField value={appConfig.brand || "#000000"} onChange={v => updateAppConfig({ brand: v })} />
            </div>
            <div className="settings-swatch-row">
              {swatches.map(c => (
                <button
                  key={c}
                  type="button"
                  className={"settings-swatch" + ((appConfig.brand || "#000000").toLowerCase() === c.toLowerCase() ? " active" : "")}
                  style={{ background: c }}
                  onClick={() => updateAppConfig({ brand: c })}
                  title={c}
                />
              ))}
            </div>
            <span className="muted" style={{ fontSize: 12.5 }}>
              The colored circle behind the app icon in the header and login screen.
            </span>
          </div>

          <div className="login-field">
            <span className="lbl">Accent color</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="settings-swatch-preview" style={{ background: appConfig.accent }} />
              <input
                type="text"
                value={appConfig.accent}
                onChange={e => updateAppConfig({ accent: e.target.value })}
                style={{ width: 100, fontSize: 12 }}
              />
              <BeakerColorField value={appConfig.accent} onChange={v => updateAppConfig({ accent: v })} />
            </div>
            <div className="settings-swatch-row">
              {swatches.map(c => (
                <button
                  key={c}
                  type="button"
                  className={"settings-swatch" + (appConfig.accent.toLowerCase() === c.toLowerCase() ? " active" : "")}
                  style={{ background: c }}
                  onClick={() => updateAppConfig({ accent: c })}
                  title={c}
                />
              ))}
            </div>
            <span className="muted" style={{ fontSize: 12.5 }}>
              Used for buttons, active states, the brand icon, and tab underlines.
            </span>
          </div>
        </div>
      </div>
      )}

      {pane === "identity" && (
      <div className="setup-section seg-substack">
        <div className="setup-section-head"><h3>Theme</h3></div>
        <div className="settings-grid">
          <div className="login-field">
            <span className="lbl">Choose One</span>
            <div className="theme-choices">
              {[
                { id: "soapbox",   label: "Soapbox",    sub: "Warm beige",  bg: "#ECE8DD", dot: "#FAF8F2", border: "var(--ink-3)" },
                { id: "undecideds", label: "Undecideds", sub: "True greyscale", bg: "#E6E6E8", dot: "#F1F1F3", border: "#7A787E" },
                { id: "nightshift", label: "Night Shift", sub: "Warm charcoal", bg: "#262624", dot: "#52504A", border: "#C2C0B6" }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={"theme-swatch" + ((appConfig.theme || "soapbox") === t.id ? " active" : "")}
                  onClick={() => updateAppConfig({ theme: t.id })}
                  style={{ "--theme-border": t.border }}
                >
                  <span className="theme-circle" style={{ background: t.bg }}>
                    <span className="theme-circle-dot" style={{ background: t.dot }} />
                  </span>
                  <span className="theme-name">{t.label}</span>
                  <span className="theme-sub">{t.sub}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="login-field">
            <span className="lbl">Auto-switch to Night Shift</span>
            <div className="theme-auto-row">
              <div className="yesno-toggle" role="group">
                <button
                  type="button"
                  className={"yesno-opt" + (appConfig.autoNightShift ? " on" : "")}
                  onClick={() => updateAppConfig({ autoNightShift: true })}
                >Yes</button>
                <button
                  type="button"
                  className={"yesno-opt" + (!appConfig.autoNightShift ? " on" : "")}
                  onClick={() => updateAppConfig({ autoNightShift: false })}
                >No</button>
              </div>
              {appConfig.autoNightShift && (() => {
                const at = appConfig.nightShiftAt || "21:00";
                const [hh, mm] = at.split(":");
                const H = parseInt(hh, 10);
                const ampm = H >= 12 ? "PM" : "AM";
                const h12 = H % 12 === 0 ? 12 : H % 12;
                const compose = (nh12, nmm, nap) => {
                  let h = nh12 % 12;
                  if (nap === "PM") h += 12;
                  updateAppConfig({ nightShiftAt: String(h).padStart(2, "0") + ":" + nmm });
                };
                return (
                  <div className="theme-time-group">
                    <div className="designed-select theme-time-hr">
                      <select value={h12} onChange={e => compose(parseInt(e.target.value, 10), mm, ampm)}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div className="designed-select theme-time-min">
                      <select value={mm} onChange={e => compose(h12, e.target.value, ampm)}>
                        <option value="00">00</option>
                        <option value="30">30</option>
                      </select>
                    </div>
                    <div className="designed-select theme-time-ap">
                      <select value={ampm} onChange={e => compose(h12, mm, e.target.value)}>
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      )}

      {pane === "identity" && (
      <div className="setup-section seg-substack">
        <div className="setup-section-head"><h3>Time Zone</h3></div>
        <div className="settings-grid">
          <label className="login-field">
            <span className="lbl">Record timestamps in</span>
            <div className="designed-select">
              <select value={appConfig.timeZone || "America/Los_Angeles"} onChange={e => updateAppConfig({ timeZone: e.target.value })}>
                {[
                  ["America/Los_Angeles", "Pacific (PT)"],
                  ["America/Denver", "Mountain (MT)"],
                  ["America/Chicago", "Central (CT)"],
                  ["America/New_York", "Eastern (ET)"],
                  ["UTC", "UTC"],
                  ["Europe/London", "London (GMT/BST)"],
                  ["Europe/Berlin", "Central European (CET)"],
                  ["Asia/Tokyo", "Japan (JST)"]
                ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <span className="muted" style={{ fontSize: 12.5 }}>
              Created, updated, and approved timestamps are recorded in this time zone.
            </span>
          </label>
          <div />
        </div>
      </div>
      )}

      {pane === "fiscal" && (
      <div className="setup-section">
        <div className="setup-section-head">
          <h3>Fiscal Calendar</h3>
        </div>
        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 720, margin: "0 0 12px" }}>
          Pick the day your organization's fiscal year begins. Quarters are calculated from that anchor as four equal three-month spans.
        </p>
        <div className="settings-grid">
          <label className="login-field">
            <span className="lbl">Fiscal year starts</span>
            <div style={{ display: "flex", gap: 8 }}>
              <div className="designed-select" style={{ flex: 1 }}>
                <select
                  value={appConfig.fiscalStartMonth || 11}
                  onChange={e => updateAppConfig({ fiscalStartMonth: Number(e.target.value) })}
                >
                  {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="designed-select" style={{ width: 90 }}>
                <select
                  value={appConfig.fiscalStartDay || 1}
                  onChange={e => updateAppConfig({ fiscalStartDay: Number(e.target.value) })}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <span className="muted" style={{ fontSize: 12.5 }}>
              Organizations often have unique fiscal year start dates.
            </span>
          </label>
          <div className="login-field">
            <span className="lbl">Resulting quarters</span>
            <QuartersPreview month={appConfig.fiscalStartMonth || 11} day={appConfig.fiscalStartDay || 1} />
          </div>
        </div>
      </div>
      )}

      {pane === "stakeholders" && (
      <div className="setup-section">
        <div className="setup-section-head">
          <h3>Categories &amp; Audience Types</h3>
          <span className="muted" style={{ fontSize: 12 }}>
            <strong style={{ color: "var(--ink-2)" }}>{Object.keys(companyCategories || {}).length}</strong> categor{Object.keys(companyCategories || {}).length === 1 ? "y" : "ies"}
          </span>
        </div>
        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 720, margin: "0 0 12px" }}>
          How stakeholders are classified. Each category contains audience types. Stakeholders pick a category and one of its audience types. Add a category, then add its audience types.
        </p>
        <SegmentSettings segments={companyCategories || {}} onChange={updateCompanyCategories} segLabel="category" unitLabel="audience type" />
      </div>
      )}

      {pane === "structure" && (
      <div className="setup-section">
        <div className="setup-section-head">
          <h3>Organizational Goals</h3>
          <span className="muted" style={{ fontSize: 12 }}>
            <strong style={{ color: "var(--ink-2)" }}>{(companyGoals || []).length}</strong> goal{(companyGoals || []).length === 1 ? "" : "s"}
          </span>
        </div>
        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 720, margin: "0 0 12px" }}>
          The goals your organization is working toward. These are inherited by every stakeholder engagement plan your team creates so everyone applies these goals in their markets, regions, and with key audiences. We recommend 3 to 5 goals.
        </p>
        <IssueSettings issues={companyGoals || []} onChange={updateCompanyGoals} placeholder="Type and add with a comma or pressing Enter" />
      </div>
      )}

      {pane === "structure" && (
      <div className="setup-section seg-substack">
        <div className="setup-section-head">
          <h3>Segments &amp; Business Units</h3>
          <span className="muted" style={{ fontSize: 12 }}>
            <strong style={{ color: "var(--ink-2)" }}>{Object.keys(companySegments || {}).length}</strong> segment{Object.keys(companySegments || {}).length === 1 ? "" : "s"}
          </span>
        </div>
        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 720, margin: "0 0 12px" }}>
          Your organization's structure. Each segment contains business units that operate as teams. Workspaces pair a segment with one of its units. Add a segment, then add its units.
        </p>
        <SegmentSettings segments={companySegments || {}} onChange={updateCompanySegments} />
      </div>
      )}

      {pane === "structure" && (
      <div className="setup-section seg-substack">
        <div className="setup-section-head">
          <h3>Individual Functions</h3>
          <span className="muted" style={{ fontSize: 12 }}>
            <strong style={{ color: "var(--ink-2)" }}>{(companyFunctions || []).length}</strong> function{(companyFunctions || []).length === 1 ? "" : "s"}
          </span>
        </div>
        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 720, margin: "0 0 12px" }}>
          The organizational functions a person can belong to. These populate the Function dropdown on every user's profile.
        </p>
        <IssueSettings issues={companyFunctions || []} onChange={updateCompanyFunctions} placeholder="Type and add with a comma or pressing Enter" />
      </div>
      )}

      {pane === "geography" && (
      <div className="setup-section seg-substack">
        <div className="setup-section-head">
          <h3>Markets &amp; Regions</h3>
        </div>
        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 720, margin: "0 0 12px" }}>
          The markets and the regions within them, used to scope stakeholders, plans, and community engagements across the app. Add a market, then add its regions.
        </p>
        <SegmentSettings segments={companyMarkets || {}} onChange={updateCompanyMarkets} segLabel="market" unitLabel="region" />
      </div>
      )}

      {pane === "geography" && (
      <div className="setup-section seg-substack">
        <div className="setup-section-head">
          <h3>Sites</h3>
          <span className="muted" style={{ fontSize: 12 }}>
            <strong style={{ color: "var(--ink-2)" }}>{(companySites || []).length}</strong> site{(companySites || []).length === 1 ? "" : "s"}
          </span>
        </div>
        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 720, margin: "0 0 12px" }}>
          Where your organization has operations or offices. US sites carry a state (country is set to United States automatically); other sites carry a country. These feed future national, state, and local engagement plans.
        </p>
        <SiteSettings sites={companySites || []} onChange={updateCompanySites} />
      </div>
      )}

      {pane === "issues" && (
      <div className="setup-section">
        <div className="setup-section-head">
          <h3>Issues</h3>
          <span className="muted" style={{ fontSize: 12 }}>
            <strong style={{ color: "var(--ink-2)" }}>{(companyIssues || []).length}</strong> issue{(companyIssues || []).length === 1 ? "" : "s"}
          </span>
        </div>
        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 720, margin: "0 0 12px" }}>
          The set of issues the company maps stakeholders against. These appear in every stakeholder's card as suggested pills users can click. Users can also write their own custom issues per stakeholder.
        </p>
        <IssueSettings issues={companyIssues || []} onChange={updateCompanyIssues} placeholder="Type and add with a comma or pressing Enter" />
      </div>
      )}

      {pane === "tags" && (
      <div className="setup-section">
        <div className="setup-section-head">
          <h3>Tags</h3>
          <span className="muted" style={{ fontSize: 12 }}>
            <strong style={{ color: "var(--ink-2)" }}>{(companyTags || []).length}</strong> tag{(companyTags || []).length === 1 ? "" : "s"}
          </span>
        </div>
        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 720, margin: "0 0 12px" }}>
          The shared tag vocabulary used across stakeholder lists. These appear as suggested pills on every stakeholder card. Users can still type their own custom tags per stakeholder.
        </p>
        <IssueSettings issues={companyTags || []} onChange={updateCompanyTags} placeholder="Type and add with a comma or pressing Enter" transform={(s) => s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")} />
      </div>
      )}

      {pane === "management" && (
      <div className="setup-section">
        <div className="setup-section-head">
          <h3>Invite Code</h3>
        </div>
        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 720, margin: "0 0 12px" }}>
          Share this code with people joining your organization on Stakeholdr. They enter it when creating their account to be added to your team. Regenerate to invalidate the old code.
        </p>
        <InviteCode code={appConfig.inviteCode} onRegenerate={(c) => updateAppConfig({ inviteCode: c })} />
      </div>
      )}

      {pane === "management" && (
      <div className="setup-section seg-substack">
        <div className="setup-section-head">
          <h3>Roles</h3>
          <span className="muted" style={{ fontSize: 12 }}>
            <strong style={{ color: "var(--ink-2)" }}>{managers}</strong> manager{managers === 1 ? "" : "s"} ·&nbsp;
            <strong style={{ color: "var(--ink-2)" }}>{filtered.length - managers}</strong> user{filtered.length - managers === 1 ? "" : "s"}
          </span>
        </div>
        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 720, margin: "0 0 12px" }}>
          <strong style={{ color: "var(--ink-2)" }}>Managers</strong> see every workspace, can delete workspaces, manage roles, edit app identity, and access these settings.
          &nbsp;<strong style={{ color: "var(--ink-2)" }}>Users</strong> only see workspaces they're a member of and can score / engage stakeholders in those.
        </p>

        <div className="settings-search">
          <Icon name="search" />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search by name, title, or email…"
          />
        </div>

        <div className="roles-table">
          <div className="roles-row roles-head">
            <div>Person</div>
            <div>Email</div>
            <div style={{ textAlign: "center" }}>Role</div>
          </div>
          {filtered.map(u => (
            <div key={u.id} className={"roles-row" + (u.id === currentUser.id ? " self" : "")}>
              <div className="roles-person">
                <Avatar user={u} size={28} />
                <UserName user={u} size={12} />
              </div>
              <div className="muted" style={{ fontSize: 12 }}>{u.email}</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div className="role-toggle">
                  <button
                    className={"role-toggle-btn" + (u.role !== "manager" ? " on" : "")}
                    onClick={() => updateUserRole(u.id, "member")}
                    disabled={u.id === currentUser.id}
                    title={u.id === currentUser.id ? "You can't demote yourself - ask another manager." : "Make user"}
                  >
                    User
                  </button>
                  <button
                    className={"role-toggle-btn" + (u.role === "manager" ? " on" : "")}
                    onClick={() => updateUserRole(u.id, "manager")}
                  >
                    <ManagerStar size={11} /> Manager
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {pane === "contact" && (
      <div className="setup-section">
        <div className="setup-section-head">
          <h3>Contact</h3>
        </div>
        <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 640 }}>
          Need help with Stakeholdr? Our team can assist with setup, training, onboarding new users, troubleshooting, and feature requests. We typically respond within one business day.
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.6, marginTop: 12 }}>
          Email us at <a className="plain-link" href="mailto:contact@stakeholdr.com" style={{ color: "var(--accent)" }}>contact@stakeholdr.com</a>
        </p>
      </div>
      )}

      </div>
    </div>
  );
}

// BeakerColorField - a flask/beaker icon tinted to the current color that
// opens the OS color picker on click (replaces the native color square).
export function BeakerColorField({ value, onChange }) {
  return (
    <span className="beaker-color" style={{ color: value }} title="Pick a custom color">
      <span className="material-symbols-outlined msym beaker-glyph">science</span>
      <input type="color" value={value} onChange={e => onChange(e.target.value)} />
    </span>
  );
}



// Sites editor: city + (US state | country). Picking a US state forces the
// country to United States. Persists to appConfig.sites (JSONB-ready).
function SiteSettings({ sites, onChange }) {
  const D = STAKEHOLDER_DATA;
  const [city, setCity] = useState("");
  const [mode, setMode] = useState("us");      // "us" | "intl"
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  function add() {
    const c = city.trim();
    if (!c) return;
    let site;
    if (mode === "intl") {
      if (!country) return;
      site = { id: "site-" + Math.random().toString(36).slice(2, 8), city: c, country };
    } else {
      // us | mx | ca — a state/province is required; country derived from mode.
      if (!state) return;
      const countryByMode = { us: "United States", mx: "Mexico", ca: "Canada" };
      site = { id: "site-" + Math.random().toString(36).slice(2, 8), city: c, state, country: countryByMode[mode] };
    }
    onChange([...sites, site]);
    setCity(""); setState(""); setCountry("");
  }
  function remove(id) { onChange(sites.filter(s => s.id !== id)); }
  const subList = mode === "mx" ? (D.MX_STATES || []) : mode === "ca" ? (D.CA_PROVINCES || []) : (D.US_STATES || []);
  const subPlaceholder = mode === "ca" ? "Select province…" : "Select state…";
  return (
    <div className="site-settings">
      <div className="issue-settings-list">
        {sites.map(s => (
          <span key={s.id} className="tag" style={{ display: "inline-flex", alignItems: "center", cursor: "default" }}>
            {s.city}, {s.state ? (D.STATE_ABBR[s.state] || s.state) : s.country}
            <button className="tag-x" onClick={() => remove(s.id)} aria-label={"Remove " + s.city}>×</button>
          </span>
        ))}
      </div>
      <div className="site-add-row">
        <input
          className="site-city-input"
          value={city}
          onChange={e => setCity(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="City"
        />
        <div className="designed-select">
          <select value={mode} onChange={e => { setMode(e.target.value); setState(""); setCountry(""); }}>
            <option value="us">United States</option>
            <option value="ca">Canada</option>
            <option value="mx">Mexico</option>
            <option value="intl">Other country</option>
          </select>
        </div>
        {mode === "intl" ? (
          <div className="designed-select">
            <select value={country} onChange={e => setCountry(e.target.value)}>
              <option value="">Select country…</option>
              {(D.COUNTRIES || []).filter(c => !["United States","Canada","Mexico"].includes(c)).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        ) : (
          <div className="designed-select site-state-select">
            <select value={state} onChange={e => setState(e.target.value)}>
              <option value="">{subPlaceholder}</option>
              {subList.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        )}
        <button className="btn" onClick={add}><Icon name="plus" /> Add site</button>
      </div>
    </div>
  );
}

// Invite code: generates a unique org join code. Persists to appConfig.inviteCode
// (supabase-ready). Format: STKH-XXXX-XXXX.
function InviteCode({ code, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  function copy() {
    if (!code) return;
    navigator.clipboard && navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  const display = code || "STKH-7XQ4-9KMP";
  return (
    <div className="invite-code">
      <div className="invite-code-display">
        <code className="invite-code-value">{display}</code>
        <button className="btn" onClick={copy}><Icon name={copied ? "check" : "content_copy"} /> {copied ? "Copied" : "Copy"}</button>
        <button className="btn" onClick={() => setAskOpen(true)}>Regenerate</button>
      </div>
      {askOpen && (
        <>
          <div className="modal-veil show" onClick={() => setAskOpen(false)} />
          <div className="modal" style={{ width: 440, maxWidth: "calc(100% - 32px)" }}>
            <div className="modal-head">
              <h2>Request a new invite code</h2>
              <button className="btn btn-ghost" onClick={() => setAskOpen(false)} aria-label="Close"><Icon name="close" /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                To regenerate your organization's invite code, email <a className="plain-link" href="mailto:contact@stakeholdr.com?subject=New%20invite%20code%20request" style={{ color: "var(--accent)" }}>contact@stakeholdr.com</a>. We'll issue a new code and invalidate the old one.
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={() => setAskOpen(false)}>Close</button>
              <a className="btn btn-primary" href="mailto:contact@stakeholdr.com?subject=New%20invite%20code%20request" style={{ textDecoration: "none" }}>Email us</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Segment → business-units editor. Persists to appConfig.segments (supabase-ready
// as a JSONB column). Add/remove segments; add/remove units within each segment.
function SegmentSettings({ segments, onChange, segLabel, unitLabel }) {
  const SEG = segLabel || "segment";
  const UNIT = unitLabel || "unit";
  const [newSeg, setNewSeg] = useState("");
  function addSegment() {
    const t = newSeg.trim();
    if (!t || segments[t]) { setNewSeg(""); return; }
    onChange({ ...segments, [t]: [] });
    setNewSeg("");
  }
  function removeSegment(seg) {
    const next = { ...segments }; delete next[seg]; onChange(next);
  }
  function addUnit(seg, unit) {
    const t = (unit || "").trim();
    if (!t || (segments[seg] || []).includes(t)) return;
    onChange({ ...segments, [seg]: [...(segments[seg] || []), t] });
  }
  function removeUnit(seg, unit) {
    onChange({ ...segments, [seg]: (segments[seg] || []).filter(u => u !== unit) });
  }
  return (
    <div className="segset">
      {Object.keys(segments).map(seg => (
        <div key={seg} className="segset-seg">
          <div className="segset-seg-head">
            <strong>{seg}</strong>
            <button className="btn btn-ghost" style={{ fontSize: 12.5 }} onClick={() => removeSegment(seg)} title={"Remove " + SEG}>Remove</button>
          </div>
          <div className="issue-settings-list">
            {(segments[seg] || []).map(u => (
              <span key={u} className="tag" style={{ display: "inline-flex", alignItems: "center", cursor: "default" }}>
                {u}
                <button className="tag-x" onClick={() => removeUnit(seg, u)} aria-label={"Remove " + u}>×</button>
              </span>
            ))}
            <UnitAdder onAdd={(v) => addUnit(seg, v)} label={UNIT} />
          </div>
        </div>
      ))}
      <div className="segset-add">
        <input
          value={newSeg}
          onChange={e => setNewSeg(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSegment(); } }}
          placeholder={"New " + SEG + " name, add with a comma or Enter"}
        />
      </div>
    </div>
  );
}

function UnitAdder({ onAdd, label }) {
  const [v, setV] = useState("");
  return (
    <input
      className="segset-unit-input"
      value={v}
      onChange={e => setV(e.target.value)}
      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onAdd(v); setV(""); } }}
      placeholder={"+ " + (label || "unit")}
    />
  );
}

function IssueSettings({ issues, onChange, placeholder, addLabel, transform }) {
  const [draft, setDraft] = useState("");
  const norm = (s) => transform ? transform(s) : s.trim();
  function add() {
    const t = norm(draft);
    if (!t || issues.includes(t)) { setDraft(""); return; }
    onChange([...issues, t]);
    setDraft("");
  }
  function remove(v) { onChange(issues.filter(i => i !== v)); }
  return (
    <div>
      <div className="issue-settings-list">
        {issues.map(i => (
          <span key={i} className="tag" style={{ display: "inline-flex", alignItems: "center", cursor: "default" }}>
            {i}
            <span
              onClick={() => remove(i)}
              aria-label={`Remove ${i}`}
              style={{ marginLeft: 4, color: "var(--ink-mute)", cursor: "pointer" }}
            >×</span>
          </span>
        ))}
      </div>
      <div className="issue-settings-add">
        <input
          value={draft}
          onChange={e => {
            const v = e.target.value;
            if (v.includes(",")) {
              const parts = v.split(",");
              const tail = parts.pop();
              parts.map(s => norm(s)).filter(Boolean).forEach(s => { if (!issues.includes(s)) onChange([...issues, s]); });
              setDraft(tail);
            } else { setDraft(v); }
          }}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          onBlur={() => { if (draft.trim()) add(); }}
          placeholder={placeholder || "Type and add with a comma or pressing Enter"}
        />
      </div>
    </div>
  );
}

// ── QuartersPreview ─────────────────────────────────────────────────
// Given a fiscal-year start (month 1-12 + day), shows the four quarter
// ranges as Q1 (start - end), Q2 (start - end), etc.
function QuartersPreview({ month, day }) {
  const monthsShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function add(m, d, deltaMonths) {
    // Returns {m, d} for a date `deltaMonths` after (m,d), staying on the
    // same day-of-month (clamping when needed - fine for fiscal anchors).
    let nm = m + deltaMonths;
    while (nm > 12) nm -= 12;
    while (nm < 1) nm += 12;
    return { m: nm, d };
  }
  function dayBefore({ m, d }) {
    if (d > 1) return { m, d: d - 1 };
    const prev = m === 1 ? 12 : m - 1;
    const lastDay = [31,29,31,30,31,30,31,31,30,31,30,31][prev - 1];
    return { m: prev, d: lastDay };
  }
  const quarters = [];
  for (let i = 0; i < 4; i++) {
    const start = add(month, day, i * 3);
    const nextStart = add(month, day, (i + 1) * 3);
    const end = dayBefore(nextStart);
    quarters.push({
      label: "Q" + (i + 1),
      range: `${monthsShort[start.m - 1]} ${start.d} → ${monthsShort[end.m - 1]} ${end.d}`
    });
  }
  return (
    <div className="quarters-list">
      {quarters.map(q => (
        <div className="quarter-row" key={q.label}>
          <span className="quarter-label">{q.label}</span>
          <span className="quarter-range">{q.range}</span>
        </div>
      ))}
    </div>
  );
}
