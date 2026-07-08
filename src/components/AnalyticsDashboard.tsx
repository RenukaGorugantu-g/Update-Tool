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

  const activeEmployees = users.filter((user) => user.role === 'employee' && user.active);
  const now = new Date();
  const rangeStart =
    timeRange === 'monthly'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : timeRange === 'daily'
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);

  const rangeUpdates = updates.filter((update) => {
    const timestamp = Date.parse(update.timestamp || update.date || '');
    if (Number.isNaN(timestamp)) return false;
    return timestamp >= rangeStart.getTime();
  });

  const totalEmployees = activeEmployees.length;
  const submittedCount = rangeUpdates.length;
  const pendingCount = Math.max(0, totalEmployees - submittedCount);
  const completionRate = totalEmployees > 0 ? Math.round((submittedCount / totalEmployees) * 100) : 0;

  const employeeStats = activeEmployees.map((employee) => {
    const employeeUpdates = rangeUpdates.filter((update) => update.employeeId === employee.id);
    const completedTasks = employeeUpdates.reduce((sum, update) => sum + (Array.isArray(update.completed) ? update.completed.filter((entry) => entry.trim()).length : 0), 0);
    const submittedUpdates = employeeUpdates.length;
    return {
      ...employee,
      submittedUpdates,
      completedTasks
    };
  }).sort((left, right) => right.completedTasks - left.completedTasks);

  const blockerCount = rangeUpdates.reduce((sum, update) => sum + (Array.isArray(update.blockers) ? update.blockers.filter((entry) => String(entry).trim() && String(entry).toLowerCase() !== 'none').length : 0), 0);

  const periodLabel = timeRange === 'monthly' ? 'this month' : timeRange === 'daily' ? 'today' : 'this sprint';

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
            onChange={(event) => setTimeRange(event.target.value as 'daily' | 'weekly' | 'monthly')}
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly View</option>
            <option value="monthly">Monthly View</option>
          </select>
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
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - completionRate / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <h4 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{completionRate}%</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Submitted {periodLabel}</span>
            </div>
          </div>

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

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Blockers Flagged</h3>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div className="surface-card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Active blocker count</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '4px' }}>{blockerCount}</div>
            </div>
            <div className="surface-card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Updates captured</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '4px' }}>{submittedCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Task Completion by Employee</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table" style={{ fontSize: '0.84rem', width: '100%' }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Updates</th>
                  <th>Tasks completed</th>
                </tr>
              </thead>
              <tbody>
                {employeeStats.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.submittedUpdates}</td>
                    <td>{employee.completedTasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <BarChart size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Sprint and Monthly Snapshot</h3>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div className="surface-card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Current sprint</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>{employeeStats[0]?.completedTasks || 0} tasks by top contributor</div>
            </div>
            <div className="surface-card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Current month</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>{employeeStats.reduce((sum, employee) => sum + employee.completedTasks, 0)} total tasks logged</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
