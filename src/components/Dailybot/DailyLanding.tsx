import React from 'react';
import './dailybot.css';
import { DailyLogin } from './DailyLogin';
import { DailyStandup } from './DailyStandup';
import { DailyTemplates } from './DailyTemplates';
import { DailyHistory } from './DailyHistory';
import { DailyReminders } from './DailyReminders';

export const DailyLanding: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);

  return (
    <div className="daily-root">
      <div className="daily-left">
        <h1 className="daily-title">Maple Pulse — Daily</h1>
        <p className="daily-sub">Quick standups, asynchronous status updates, and team alignment.</p>
        <DailyLogin />
        <DailyTemplates onSelectTemplate={(id) => setSelectedTemplate(id)} />
      </div>
      <div className="daily-right">
        <DailyStandup selectedTemplateId={selectedTemplate} />
        <div style={{ marginTop: 18 }}>
          <DailyHistory />
        </div>
        <div style={{ marginTop: 18 }}>
          <DailyReminders />
        </div>
      </div>
    </div>
  );
};
