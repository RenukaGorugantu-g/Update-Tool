import React from 'react';
import { usePulse } from '../../context/PulseContext';

export const DailyHistory: React.FC = () => {
  const { updates } = usePulse();

  const recent = updates.slice(0, 6);

  return (
    <div className="daily-history">
      <h4 style={{ margin: '8px 0' }}>Recent Updates</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recent.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No recent updates</div>}
        {recent.map(u => (
          <div key={u.id} className="glass-card" style={{ padding: 8, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{u.employeeName} — {u.projectName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.date} • {u.priority}</div>
            <div style={{ marginTop: 6, fontSize: 13 }}>{(u.completed || []).slice(0,2).join('; ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
