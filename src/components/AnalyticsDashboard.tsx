import React, { useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { 
  BarChart, 
  PieChart, 
  TrendingUp, 
  AlertTriangle,
  Calendar
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { users, updates } = usePulse();
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Math variables
  const totalEmployees = users.filter(u => u.role === 'employee' && u.active).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayUpdates = updates.filter(u => u.date === todayStr);
  const submittedCount = todayUpdates.length;
  const pendingCount = Math.max(0, totalEmployees - submittedCount);
  const completionRate = Math.round((submittedCount / totalEmployees) * 100);

  // Blocker categories from mock database
  const blockerCategories = [
    { name: 'Client Approvals', count: 2, color: 'var(--accent-primary)' },
    { name: 'Copywriter Assets', count: 1, color: 'var(--accent-amber)' },
    { name: 'Contract Feedbacks', count: 1, color: 'var(--accent-indigo)' },
    { name: 'Server Pipeline Issues', count: 1, color: 'var(--accent-blue)' }
  ];

  // Daily activity mock (last 7 days)
  const activityData = [
    { day: 'Mon', count: 24, percent: 96 },
    { day: 'Tue', count: 23, percent: 92 }, // today
    { day: 'Wed', count: 25, percent: 100 },
    { day: 'Thu', count: 22, percent: 88 },
    { day: 'Fri', count: 23, percent: 92 },
    { day: 'Sat', count: 8, percent: 32 },
    { day: 'Sun', count: 6, percent: 24 }
  ];

  return (
    <div className="fade-in" style={{ padding: '8px 0' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Analytics & Reports</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Overview of updates compliance, blocker distributions, and overall organizational metrics.
          </p>
        </div>

        {/* Time Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly View</option>
            <option value="monthly">Monthly View</option>
          </select>
        </div>
      </div>

      {/* Grid of charts */}
      <div className="dashboard-grid">
        
        {/* Chart 1: Donut Completion Rate */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <PieChart size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Update Completion Rate</h3>
          </div>

          <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifySelf: 'center' }}>
            {/* SVG Donut */}
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="transparent"
                stroke="var(--bg-tertiary)"
                strokeWidth="16"
              />
              {/* Foreground animated completion circle */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="transparent"
                stroke="var(--accent-emerald)"
                strokeWidth="16"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - completionRate / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            
            {/* Inner Text */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <h4 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{completionRate}%</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Submitted Today</span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px', width: '100%', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--accent-emerald)' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Submitted ({submittedCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Pending ({pendingCount})</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Blocker Category distribution */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Blocker Category Analysis</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', height: '80%' }}>
            {blockerCategories.map((category) => {
              const maxCount = 3;
              const barWidth = (category.count / maxCount) * 100;
              return (
                <div key={category.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{category.name}</span>
                    <span>{category.count} flags</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${barWidth}%`,
                      backgroundColor: category.color,
                      borderRadius: '4px',
                      transition: 'width 1s ease-out'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Grid of secondary charts */}
      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        
        {/* Chart 3: Weekly submission line chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Submission Trends (Last 7 Days)</h3>
          </div>

          <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px' }}>
            {activityData.map((data) => (
              <div key={data.day} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                flex: '1'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{data.count}</span>
                <div style={{
                  width: '24px',
                  height: `${(data.count / 25) * 120}px`,
                  background: 'linear-gradient(180deg, var(--accent-primary) 0%, var(--accent-hover) 100%)',
                  borderRadius: '6px 6px 0 0',
                  boxShadow: '0 4px 10px rgba(220, 38, 38, 0.1)',
                  transition: 'height 1s ease-out'
                }}></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Pod comparisons */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <BarChart size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Pod Productivity Comparison</h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '180px' }}>
            {/* India Pod Card */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <span className="badge badge-info" style={{ marginBottom: '8px', fontSize: '0.7rem' }}>India Operations</span>
              <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>95%</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>19 of 20 updates</p>
              <div style={{ width: '40px', height: '6px', backgroundColor: 'var(--accent-blue)', margin: '8px auto', borderRadius: '3px' }}></div>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '100px', backgroundColor: 'var(--glass-border)' }}></div>

            {/* UAE Pod Card */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <span className="badge badge-warning" style={{ marginBottom: '8px', fontSize: '0.7rem' }}>UAE Client</span>
              <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>80%</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>4 of 5 updates</p>
              <div style={{ width: '40px', height: '6px', backgroundColor: 'var(--accent-amber)', margin: '8px auto', borderRadius: '3px' }}></div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
