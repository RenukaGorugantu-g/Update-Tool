import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PulseProvider } from './context/PulseContext.tsx'
// Mount the full application but wrap in an Error Boundary so runtime
// errors inside the app render a visible message instead of a blank page.
const rootEl = document.getElementById('root')!;

class ErrorBoundary extends (React as any).Component<any, { error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('App render error', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 28, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
          <h2 style={{ color: 'var(--accent-amber)' }}>Application Error</h2>
          <p style={{ color: 'var(--text-muted)' }}>{String(this.state.error?.message || 'Unknown error')}</p>
          <pre style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', marginTop: 12 }}>{String(this.state.error && this.state.error.stack)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <PulseProvider>
        <App />
      </PulseProvider>
    </ErrorBoundary>
  </StrictMode>
);
