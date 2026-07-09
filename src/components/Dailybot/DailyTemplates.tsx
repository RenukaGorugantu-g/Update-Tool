import React from 'react';

export const templates = [
  { id: 't1', name: 'Default', completed: 'Reviewed PRs\nDeployed feature X', working: 'Working on feature Y', blockers: '' },
  { id: 't2', name: 'Focus Day', completed: 'Completed deep work block', working: 'Continue deep work', blockers: 'Need access to API' },
  { id: 't3', name: 'Onboarding', completed: '', working: 'Learning codebase\nPairing with mentor', blockers: '' }
];

export const DailyTemplates: React.FC<{ onSelectTemplate?: (id: string, fields: any) => void }> = ({ onSelectTemplate }) => {
  return (
    <div className="daily-templates" style={{ marginTop: 16 }}>
      <h4 style={{ margin: '8px 0' }}>Templates</h4>
      <div style={{ display: 'flex', gap: 8 }}>
        {templates.map(t => (
          <button key={t.id} className="daily-btn" onClick={() => onSelectTemplate?.(t.id, t)} style={{ padding: '8px 10px', background: '#f3f4f6', color: '#111' }}>
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
};
