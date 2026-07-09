import React from 'react';
import { usePulse } from '../context/PulseContext';

export const UpdateSuccess: React.FC<{ onClose: () => void; status: 'ok' | 'partial' | 'failed' }> = ({ onClose, status }) => {
  const { trackEvent } = usePulse();
  React.useEffect(() => {
    trackEvent('update_success_shown', { status });
  }, [status]);

  const rows = [] as { text: string; ok: boolean }[];
  if (status === 'ok') {
    rows.push({ text: 'Saved', ok: true });
    rows.push({ text: 'Google Chat Sent', ok: true });
    rows.push({ text: 'Manager Notified', ok: true });
    rows.push({ text: 'Executive Dashboard Updated', ok: true });
  } else if (status === 'partial') {
    rows.push({ text: 'Saved Locally', ok: true });
    rows.push({ text: 'Backend Unreachable', ok: false });
  } else {
    rows.push({ text: 'Save Failed', ok: false });
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', zIndex: 9999 }}>
      <div style={{ width: 420, background: 'var(--bg-secondary)', padding: 20, borderRadius: 18, border: '1px solid var(--glass-border)' }}>
        <h3 style={{ marginTop: 0 }}>Update Submitted</h3>
        <p style={{ color: 'var(--text-muted)' }}>Your update was processed. Summary below:</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {rows.map((r, i) => (
            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--glass-border)' }}>
              <span>{r.text}</span>
              <strong style={{ color: r.ok ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{r.ok ? '✓' : '!'}</strong>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default UpdateSuccess;
