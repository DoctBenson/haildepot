'use client';

import { useEffect, useState } from 'react';

const panelStyle = {
  margin: '16px 0',
  padding: '16px',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  background: '#fff',
  overflowWrap: 'anywhere',
};

export default function ReactHydrationDiagnosticPage() {
  const [hydrated, setHydrated] = useState(false);
  const [hydratedAt, setHydratedAt] = useState('Not yet');
  const [count, setCount] = useState(0);
  const [browserDetails, setBrowserDetails] = useState({
    userAgent: 'Loading browser details…',
    viewport: 'Loading viewport…',
  });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const updateViewport = () => {
      setBrowserDetails({
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth} × ${window.innerHeight}`,
      });
    };
    const reportError = (message) => {
      setErrors((currentErrors) => [...currentErrors, message]);
    };
    const handleError = (event) => reportError(`Uncaught error: ${event.message || 'Unknown error'}`);
    const handleRejection = (event) => reportError(`Unhandled rejection: ${String(event.reason)}`);

    setHydrated(true);
    setHydratedAt(new Date().toISOString());
    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '24px', minHeight: '100svh' }}>
      <h1 style={{ margin: '0 0 8px', color: '#0b1f2a', fontSize: '1.5rem' }}>
        HailDepot React hydration diagnostic
      </h1>
      <p>HTML rendered</p>

      <div style={{ ...panelStyle, fontWeight: 700 }}>
        {hydrated ? 'React hydrated' : 'React not hydrated yet'}
      </div>

      <div style={panelStyle}>
        <p><strong>Hydration timestamp:</strong> {hydratedAt}</p>
        <p style={{ marginTop: '12px' }}><strong>Browser user-agent:</strong> {browserDetails.userAgent}</p>
        <p style={{ marginTop: '12px' }}><strong>Viewport:</strong> {browserDetails.viewport}</p>
      </div>

      <button
        type="button"
        onClick={() => setCount((currentCount) => currentCount + 1)}
        style={{ width: '100%', minHeight: '48px', border: 0, borderRadius: '10px', background: '#1f6f8b', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
      >
        Tap React button
      </button>
      <p style={{ ...panelStyle, fontWeight: 700 }}>React tap count: {count}</p>

      <div style={panelStyle}>
        <strong>Client errors</strong>
        {errors.length === 0 ? (
          <p style={{ marginTop: '8px' }}>No uncaught errors or unhandled promise rejections captured.</p>
        ) : (
          <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
            {errors.map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}
          </ul>
        )}
      </div>
    </main>
  );
}
