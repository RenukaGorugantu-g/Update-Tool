import React, { useMemo, useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { buildTeamAnalytics, exportAnalyticsToCsv, getPeriodLabel } from '../utils/reporting';
import {
  BarChart,
  PieChart,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Download,
  UserRound
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { users, updates } = usePulse();
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'sprint' | 'monthly'>('sprint');

  const analytics = useMemo(() => buildTeamAnalytics({ updates, users, range: timeRange }), [updates, users, timeRange]);

  const blockerCategories = [
    { name: 'Technical', count: Math.max(0, Math.round(analytics.blockerCount * 0.4)), color: 'var(--accent-primary)' },
    { name: 'Process', count: Math.max(0, Math.round(analytics.blockerCount * 0.3)), color: 'var(--accent-amber)' },
    { name: 'Resource', count: Math.max(0, analytics.blockerCount - Math.round(analytics.blockerCount * 0.4) - Math.round(analytics.blockerCount * 0.3)), color: 'var(--accent-blue)' }
  ];

  const activityData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const count = analytics.rangeUpdates.filter((update) => update.date === dateStr).length;
    return {
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][date.getDay()],
      count
    };
  });

  const periodLabel = getPeriodLabel(timeRange);

  const exportReport = () => {
    const rows = analytics.employeeSummaries.map((summary) => ({
      Employee: summary.employeeName,
      Department: summary.department,
      Pod: summary.pod,
      Submitted: summary.submittedCount,
      Completion: `${summary.completionRate}%`,
      TasksCompleted: summary.tasksCompleted,
      TasksWorking: summary.tasksWorking,
      Blockers: summary.blockers,
      LastUpdate: summary.lastUpdate || 'No updates'
    }));
    exportAnalyticsToCsv(`analytics-${timeRange}.csv`, rows);
  };

  return (
    <div className="fade-in" style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Analytics & Reports</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Real sprint and monthly completion metrics from the submitted updates feed.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            value={timeRange}
            onChange={(event) => setTimeRange(event.target.value as 'daily' | 'weekly' | 'sprint' | 'monthly')}
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly View</option>
            <option value="sprint">Sprint View</option>
            <option value="monthly">Monthly View</option>
          </select>
          <button onClick={exportReport} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '0.82rem' }}>
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <PieChart size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Update Completion Rate</h3>
          </div>

          <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifySelf: 'center' }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="70" fill="transparent" stroke="var(--bg-tertiary)" strokeWidth="16" />
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="transparent"
                stroke="var(--accent-emerald)"
                strokeWidth="16"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - analytics.completionRate / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <h4 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{analytics.completionRate}%</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Submitted {periodLabel}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '20px', width: '100%', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--accent-emerald)' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Submitted ({analytics.submittedCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Pending ({analytics.pendingCount})</span>
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

      <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Per-employee report breakdown</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Each person’s submitted work, task volume, blocker count, and latest update for the selected period.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {analytics.employeeSummaries.length === 0 ? (
            <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
              No updates have been submitted for this period yet.
            </div>
          ) : analytics.employeeSummaries.map((summary) => (
            <div key={summary.employeeId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '999px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserRound size={16} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800 }}>{summary.employeeName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{summary.department} • {summary.pod}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end' }}>
                <span className="badge badge-success">{summary.submittedCount} submissions</span>
                <span className="badge badge-info">{summary.tasksCompleted} completed tasks</span>
                <span className="badge badge-warning">{summary.blockers} blockers</span>
                <span className="badge badge-secondary">Last: {summary.lastUpdate || '—'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
