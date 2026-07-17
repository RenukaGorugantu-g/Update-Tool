import React, { useEffect, useMemo, useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { UserMinus, UserCheck, ShieldAlert, FileSpreadsheet, RefreshCw, Save } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { users, setUsers, toggleUserActiveStatus, resetSprintData, updates } = usePulse();
  const [isResetting, setIsResetting] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, { role: string; department: string; pod: 'India Pod' | 'UAE Pod'; reportingManager: string }>>({});

  const apiBase = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/$/, '') || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://update-tool.onrender.com');

  useEffect(() => {
    const nextAssignments = users.reduce<Record<string, { role: string; department: string; pod: 'India Pod' | 'UAE Pod'; reportingManager: string }>>((acc, user) => {
      acc[user.id] = {
        role: user.role || 'employee',
        department: user.department || 'General',
        pod: user.pod || 'India Pod',
        reportingManager: user.reportingManager || 'Manager'
      };
      return acc;
    }, {});
    setAssignments((prev) => ({ ...prev, ...nextAssignments }));
  }, [users]);

  const persistUsersToBackend = (nextUsers: typeof users) => {
    localStorage.setItem('pulse-users', JSON.stringify(nextUsers));
    if (!apiBase) return;
    void fetch(`${apiBase}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextUsers)
    }).catch((error) => console.warn('Unable to sync admin roster updates to backend:', error));
  };

  const saveUserAssignment = (targetUser: typeof users[number]) => {
    const draft = assignments[targetUser.id];
    if (!draft) return;
    const nextUser = {
      ...targetUser,
      role: draft.role as typeof targetUser.role,
      department: draft.department || 'General',
      pod: draft.pod || 'India Pod',
      reportingManager: draft.reportingManager || 'Manager',
      active: targetUser.active ?? true,
      avatarColor: targetUser.avatarColor || '#6366f1',
      password: targetUser.password || 'password'
    };
    setUsers((prev) => {
      const nextUsers = prev.map((user) => (String(user.id) === String(targetUser.id) ? nextUser : user));
      persistUsersToBackend(nextUsers);
      return nextUsers;
    });
  };

  const rosterUsers = useMemo(() => {
    return [...users].filter((user) => Boolean(user?.name)).sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  const isClerkUser = (user: typeof users[number]) => {
    const id = String(user.id || '').trim();
    return id.startsWith('user_') || id.startsWith('user') || id.startsWith('clerk') || (!id.startsWith('u-') && !id.startsWith('emp-') && !id.startsWith('MP-') && !id.startsWith('CL-'));
  };

  const clerkSignupUsers = useMemo(() => rosterUsers.filter((user) => isClerkUser(user)), [rosterUsers]);

  // Filter list
  const executives = users.filter(u => u.role === 'executive' || u.role === 'admin');
  const activeUsersCount = users.filter(u => u.active).length;
  const employeeCount = users.filter(u => u.role === 'employee').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayUpdates = updates.filter(u => u.date === todayStr);
  const submittedToday = todayUpdates.length;
  const totalEmployeesActive = users.filter(u => u.role === 'employee' && u.active).length || 1;
  const completionPct = Math.round((submittedToday / totalEmployeesActive) * 100);
  const activeBlockers = updates.filter(u => u.blockers && u.blockers.length > 0 && u.blockers[0].trim() !== '').length;

  const handleResetSprintData = async () => {
    if (!window.confirm('Clear all sprint updates and start a fresh sprint?')) return;
    setIsResetting(true);
    await resetSprintData();
    setIsResetting(false);
  };

  return (
    <div className="fade-in" style={{ padding: '8px 0' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>CEO Admin Panel</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Manage Maple Pulse company directory, configure pods and divisions, provision roles, and audit activation flags.
        </p>
      </div>

      {/* Top summary badges similar to landing screenshot */}
      <div className="summary-row">
        <div className="summary-badge">
          <div className={`summary-circle pct`} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>{completionPct}%</div>
          <div>
            <div className="summary-text">{submittedToday} responses</div>
            <div className="summary-sub">of {totalEmployeesActive} expected</div>
          </div>
        </div>

        <div className="summary-badge">
          <div className="summary-circle alert" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' }}>🔥</div>
          <div>
            <div className="summary-text">{activeBlockers} blocker{activeBlockers !== 1 ? 's' : ''}</div>
            <div className="summary-sub">attention points</div>
          </div>
        </div>

        <div className="summary-badge">
          <div className="summary-circle" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>🕒</div>
          <div>
            <div className="summary-text">{Math.max(0, totalEmployeesActive - submittedToday)} pending</div>
            <div className="summary-sub">responses</div>
          </div>
        </div>
      </div>

      <div className="metrics-row" style={{ marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '18px' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Profiles</p>
          <h3 style={{ margin: '10px 0 0', fontSize: '1.5rem', fontWeight: 800 }}>{activeUsersCount}</h3>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Live employee and manager accounts available for day-to-day tracking.</p>
        </div>
        <div className="glass-card" style={{ padding: '18px' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Employee Userbase</p>
          <h3 style={{ margin: '10px 0 0', fontSize: '1.5rem', fontWeight: 800 }}>{employeeCount}</h3>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Employees currently enabled to submit standups and receive notifications.</p>
        </div>
        <div className="glass-card" style={{ padding: '18px' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Executive Coverage</p>
          <h3 style={{ margin: '10px 0 0', fontSize: '1.5rem', fontWeight: 800 }}>{executives.length}</h3>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Roles with visibility into analytics, approvals, and communications workflows.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Clerk signups and roster assignment card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={18} style={{ color: 'var(--accent-primary)' }} />
                <span>Clerk signups & roster</span>
              </h3>
              <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Assign a team, pod, and reporting lead to each signed-up person so employer filters can surface their updates. The list below includes the full company directory, including newly signed-up Clerk accounts.
              </p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={handleResetSprintData} disabled={isResetting} style={{ padding: '8px 12px', fontSize: '0.75rem' }}>
              <RefreshCw size={14} style={{ marginRight: '6px' }} />
              {isResetting ? 'Resetting…' : 'Reset sprint data'}
            </button>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {rosterUsers.length === 0 ? (
              <div className="glass-card" style={{ padding: '12px', color: 'var(--text-secondary)' }}>No roster profiles are available yet.</div>
            ) : rosterUsers.map((user) => {
              const draft = assignments[user.id] || {
                role: user.role || 'employee',
                department: user.department || 'General',
                pod: user.pod || 'India Pod',
                reportingManager: user.reportingManager || 'Manager'
              };
              const clerkBadge = isClerkUser(user);
              return (
                <div key={user.id} className="glass-card" style={{ padding: '14px', display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{user.name}</div>
                      <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)' }}>{user.email} • {user.employeeId || 'No employee ID'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {clerkBadge ? <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 8px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.14)', color: '#34d399' }}>Clerk signup</span> : null}
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 8px', borderRadius: '999px', background: 'rgba(59, 130, 246, 0.14)', color: '#60a5fa' }}>{user.role}</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Role</span>
                      <select value={draft.role} onChange={(event) => setAssignments((prev) => ({ ...prev, [user.id]: { ...draft, role: event.target.value } }))} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                        <option value="employee">Employee</option>
                        <option value="executive">Executive</option>
                        <option value="employer">Employer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>
                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Team / Department</span>
                      <input type="text" value={draft.department} onChange={(event) => setAssignments((prev) => ({ ...prev, [user.id]: { ...draft, department: event.target.value } }))} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </label>
                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Pod</span>
                      <select value={draft.pod} onChange={(event) => setAssignments((prev) => ({ ...prev, [user.id]: { ...draft, pod: event.target.value as 'India Pod' | 'UAE Pod' } }))} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                        <option value="India Pod">India Pod</option>
                        <option value="UAE Pod">UAE Pod</option>
                      </select>
                    </label>
                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Reporting lead</span>
                      <input type="text" value={draft.reportingManager} onChange={(event) => setAssignments((prev) => ({ ...prev, [user.id]: { ...draft, reportingManager: event.target.value } }))} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{updates.filter((update) => update.employeeId === user.id).length} update(s) logged</div>
                    <button type="button" className="btn" onClick={() => saveUserAssignment(user)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Save size={14} /> Save assignment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Accounts Management list card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Company Directory ({users.length} profiles)</span>
            </h3>
            <button type="button" className="btn btn-secondary" onClick={handleResetSprintData} disabled={isResetting} style={{ padding: '8px 12px', fontSize: '0.75rem' }}>
              <RefreshCw size={14} style={{ marginRight: '6px' }} />
              {isResetting ? 'Resetting…' : 'Reset sprint data'}
            </button>
          </div>

          <div style={{ overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
            <table className="premium-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>User & ID</th>
                  <th>Department & Pod</th>
                  <th>Manager</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ opacity: u.active ? 1 : 0.55 }}>
                    {/* User */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: u.avatarColor || '#6366f1',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}>
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{u.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.employeeId}</div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Pod */}
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.department}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.pod}</div>
                      </div>
                    </td>

                    {/* Manager */}
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {u.reportingManager}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      {u.role !== 'admin' ? (
                        <button
                          onClick={() => toggleUserActiveStatus(u.id)}
                          className={`btn ${u.active ? 'btn-secondary' : 'btn-success'}`}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.7rem',
                            gap: '4px',
                            borderRadius: '12px'
                          }}
                        >
                          {u.active ? (
                            <>
                              <UserMinus size={12} />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <UserCheck size={12} />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          fontWeight: 700
                        }}>
                          <ShieldAlert size={12} />
                          <span>System Root</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
