import React, { useEffect } from 'react';
import DailyTemplates from './DailyTemplates';
import DailyReminders from './DailyReminders';
import '../dailybot.css';

const DailyLanding: React.FC = () => {
  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-theme') || '';
    document.documentElement.setAttribute('data-theme', 'daily');
    return () => {
      if (prev) {
        document.documentElement.setAttribute('data-theme', prev);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    };
  }, []);

  return (
    <div className="daily-landing">
      <h2>Daily Standup</h2>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <DailyTemplates />
        </div>
        <div style={{ width: 320 }}>
          <DailyReminders />
        </div>
      </div>
    </div>
  );
};

export default DailyLanding;
