import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Inject custom utility classes (.input, .btn-*, .badge-*) once at startup.
// These supplement Tailwind CDN since arbitrary custom classes require this approach.
function injectGlobalStyles() {
  if (document.getElementById('lwm-styles')) return;
  const s = document.createElement('style');
  s.id = 'lwm-styles';
  s.textContent = `
    .input { display:block; width:100%; border:1px solid #d1d5db; border-radius:0.5rem; padding:0.4rem 0.65rem; font-size:0.875rem; outline:none; }
    .input:focus { border-color:#6366f1; box-shadow:0 0 0 2px rgba(99,102,241,0.2); }
    .btn-primary { background:#6366f1; color:#fff; font-size:0.875rem; font-weight:500; padding:0.45rem 1rem; border-radius:0.5rem; border:none; cursor:pointer; transition:background 0.15s; }
    .btn-primary:hover { background:#4f46e5; }
    .btn-secondary { background:#f3f4f6; color:#374151; font-size:0.875rem; font-weight:500; padding:0.45rem 1rem; border-radius:0.5rem; border:1px solid #e5e7eb; cursor:pointer; }
    .btn-secondary:hover { background:#e5e7eb; }
    .badge { display:inline-block; font-size:0.7rem; font-weight:500; padding:0.15rem 0.5rem; border-radius:9999px; }
    .badge-indigo  { background:#e0e7ff; color:#4338ca; }
    .badge-gray    { background:#f3f4f6; color:#4b5563; }
    .badge-green   { background:#dcfce7; color:#166534; }
    .badge-blue    { background:#dbeafe; color:#1e40af; }
    .badge-yellow  { background:#fef9c3; color:#854d0e; }
    .badge-purple  { background:#f3e8ff; color:#7e22ce; }
    .badge-pink    { background:#fce7f3; color:#9d174d; }
    .badge-red     { background:#fee2e2; color:#991b1b; }
  `;
  document.head.appendChild(s);
}
injectGlobalStyles();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
