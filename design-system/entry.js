/* Single entry module for the design-system pages.
 * Imports the token contract + every component once, so each HTML page has
 * one clean Vite entry (tokens + all custom elements bundled together).
 * Pages reference ONLY this file: <script type="module" src="./entry.js"></script>
 */
import "./fonts.css"; // self-hosted Inter + Newsreader + Material Symbols (subset)
import "./tokens.css";

import "./components/icon.js";
import "./components/avatar.js";
import "./components/card.js";
import "./components/textarea.js";
import "./components/badge.js";
import "./components/owner-picker.js";
import "./components/coachmark.js";
import "./components/app-shell.js";
import "./components/sidebar.js";
import "./components/inspector.js";
import "./components/status-bar.js";
import "./components/button.js";
import "./components/icon-button.js";
import "./components/fab.js";
import "./components/text-field.js";
import "./components/checkbox.js";
import "./components/radio.js";
import "./components/switch.js";
import "./components/slider.js";
import "./components/select.js";
import "./components/menu.js";
import "./components/chips.js";
import "./components/autocomplete.js";
import "./components/list.js";
import "./components/tabs.js";
import "./components/divider.js";
import "./components/dialog.js";
import "./components/tooltip.js";
import "./components/snackbar.js";
import "./components/progress.js";
import "./components/data-table.js";
import "./components/chart.js";
import "./components/app-bar.js";
import "./components/nav-rail.js";
import "./components/nav-drawer.js";
import "./components/sheet.js";
import "./components/bottom-bar.js";
import "./components/date-picker.js";
import "./components/stakeholder-table.js";
import "./components/stakeholder-map.js";
