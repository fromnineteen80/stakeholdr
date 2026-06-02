import React from 'react';
import ReactDOM from 'react-dom/client';
import { Guide } from './guide.jsx';

// The .io currently renders ONLY the build guide (src/guide.jsx).
// The previous app is intentionally NOT imported here, so it is out of the build
// graph and cannot interact with what we build on main. It will be parked in an
// /archive folder in Phase 1 of the guide (archived, never deleted).
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Guide />
  </React.StrictMode>
);
