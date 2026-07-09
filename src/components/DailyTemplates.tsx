import React, { useState } from 'react';
import { usePulse } from '../context/PulseContext';

export const DailyTemplates: React.FC = () => {
  const { templates, setTemplates, persistTemplates } = usePulse();
  const [editing, setEditing] = useState('');

  const addTemplate = async () => {
    if (!editing.trim()) return;
    const next = [...templates, editing.trim()];
    setTemplates(next);
    await persistTemplates(next);
    setEditing('');
  };

  const removeTemplate = async (idx: number) => {
    const next = templates.filter((_, i) => i !== idx);
    setTemplates(next);
    await persistTemplates(next);
  };

  return (
    <div className="daily-templates">
      <h3>Templates</h3>
      <ul>
        {templates.map((t, i) => (
          <li key={i}>
            <pre>{t}</pre>
            <button onClick={() => removeTemplate(i)}>Remove</button>
          </li>
        ))}
      </ul>
      <div>
        <textarea value={editing} onChange={(e) => setEditing(e.target.value)} placeholder="New template..." />
        <button onClick={addTemplate}>Add</button>
      </div>
    </div>
  );
};

export default DailyTemplates;
