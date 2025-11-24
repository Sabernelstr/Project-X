import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Application failed to mount:", error);
  // Fallback UI in case of critical React failure
  rootElement.innerHTML = `
    <div style="color: #ef4444; padding: 40px; font-family: monospace; background: #020617; height: 100vh;">
      <h1 style="border-bottom: 1px solid #ef4444; padding-bottom: 10px;">SYSTEM CRITICAL ERROR</h1>
      <p style="margin-top: 20px;">Failed to initialize application kernel.</p>
      <pre style="background: #1e293b; padding: 20px; border-radius: 4px; overflow: auto; color: #f8fafc;">${error}</pre>
    </div>
  `;
}