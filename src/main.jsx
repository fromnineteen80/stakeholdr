import './styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app.jsx';

// Auto-hide scrollbars: reveal a scroll container's bar only while it is
// actively scrolling, then fade it back out shortly after scrolling stops.
(function () {
  const timers = new WeakMap();
  document.addEventListener("scroll", function (e) {
    const el = e.target;
    if (!el || !el.classList) return;
    el.classList.add("is-scrolling");
    clearTimeout(timers.get(el));
    timers.set(el, setTimeout(() => el.classList.remove("is-scrolling"), 700));
  }, true);
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
