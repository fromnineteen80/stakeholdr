/* preview-main.jsx — the standalone SampleRecord tuning page (record.html).
 * Declared placement: the sealed dev "Scaffolds menu" was ruled dropped
 * (census L1/L2), so the scaffold preview ships as its own Pages entry beside
 * the design-system preview/wireframes — see sample-record.jsx. */
import React from 'react';
import { createRoot } from 'react-dom/client';
// Canonical UI: the ONE component source (registers every ui-* element and
// loads the token contract), plus the app's token-only layout layer.
import '../../../design-system/entry.js';
import '../app.css';
import { SampleRecord } from './sample-record.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SampleRecord />
  </React.StrictMode>
);
