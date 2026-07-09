import React, { useState } from 'react';
import { usePulse } from '../context/PulseContext';

export const DailyReminders: React.FC = () => {
  const { reminders, setReminders, persistReminders } = usePulse();
  const [time, setTime] = useState('09:00');

  const addReminder = async () => {
    const next = [...reminders, { id: `r-${Date.now()}`, time }];
    setReminders(next);
    await persistReminders(next);
  };

  const removeReminder = async (id: string) => {
    const next = reminders.filter(r => r.id !== id);
    setReminders(next);
    await persistReminders(next);
  };

  return (
    <div className="daily-reminders">
      <h3>Reminders</h3>
      <ul>
        {reminders.map((r: any) => (
          <li key={r.id}>
            <span>{r.time}</span>
            <button onClick={() => removeReminder(r.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <div>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} />
        <button onClick={addReminder}>Add Reminder</button>
      </div>
    </div>
  );
};

export default DailyReminders;
