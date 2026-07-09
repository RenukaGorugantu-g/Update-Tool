import React, { useState, useEffect } from 'react';

export const DailyReminders: React.FC = () => {
  const [hour, setHour] = useState<number>(() => Number(localStorage.getItem('daily-reminder-hour') || 9));
  const [enabled, setEnabled] = useState<boolean>(() => localStorage.getItem('daily-reminder-enabled') === '1');

  useEffect(() => {
    localStorage.setItem('daily-reminder-hour', String(hour));
  }, [hour]);
  useEffect(() => {
    localStorage.setItem('daily-reminder-enabled', enabled ? '1' : '0');
  }, [enabled]);

  return (
    <div className="daily-reminders" style={{ marginTop: 12 }}>
      <h4 style={{ margin: '8px 0' }}>Reminders</h4>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ fontSize: 13 }}>Daily reminder</label>
        <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
        <select value={String(hour)} onChange={e => setHour(Number(e.target.value))}>
          {Array.from({ length: 24 }).map((_, i) => (
            <option key={i} value={i}>{i}:00</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
        Reminders are local only in this preview. To enable cross-device reminders, integrate with push/email in the backend.
      </div>
    </div>
  );
};
