import React, { useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { Plus, UserMinus, UserCheck, ShieldAlert, FileSpreadsheet, RefreshCw } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { users, createNewUser, toggleUserActiveStatus, resetSprintData } = usePulse();

  // Create User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'employee' | 'executive' | 'admin'>('employee');
  const [department, setDepartment] = useState('Development Team');
  const [pod, setPod] = useState<'India Pod' | 'UAE Pod'>('India Pod');
  const [reportingManager, setReportingManager] = useState('Marcus Thompson');
  
  // Auto-calculated state for preview
  const [generatedEmpId, setGeneratedEmpId] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [lastCreatedCredentials, setLastCreatedCredentials] = useState<{ email: string; employeeId: string; password: string } | null>(null);

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

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !generatedEmpId || !tempPassword) return;

    createNewUser({
      name,
      email,
      role,
      department,
      pod,
      reportingManager,
      employeeId: generatedEmpId,
      password: tempPassword
    });

    setLastCreatedCredentials({
      email: email.trim().toLowerCase(),
      employeeId: generatedEmpId.trim(),
      password: tempPassword
    });
    setFormSuccess(true);
    setName('');
    setEmail('');
    setGeneratedEmpId('');
    setTempPassword('');
    
    setTimeout(() => {
      setFormSuccess(false);
    }, 4500);
  };

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
        
        {/* Creation Form Card */}
        <form onSubmit={handleAddUser} className="glass-card" style={{ padding: '24px', alignSelf: 'start' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>Create Employee Account</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="name-input">Full Name</label>
              <input
                id="name-input"
                type="text"
                placeholder="E.g., John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  // Generate credentials on writing
                  const randomDigits = Math.floor(1000 + Math.random() * 9000);
                  if (!generatedEmpId && e.target.value.trim()) {
                    setGeneratedEmpId(`MP-${randomDigits}`);
                  }
                  if (!tempPassword && e.target.value.trim()) {
                    const cleanName = e.target.value.replace(/\s+/g, '');
                    setTempPassword(`${cleanName.substring(0, 4)}@Pulse${new Date().getFullYear()}!`);
                  }
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="email-input">Company Email</label>
              <input
                id="email-input"
                type="email"
                placeholder="john.doe@maplepulse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label htmlFor="empid-input">Employee ID</label>
                <input
                  id="empid-input"
                  type="text"
                  placeholder="e.g. MP-1234"
                  value={generatedEmpId}
                  onChange={(e) => setGeneratedEmpId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="password-input">Temporary Password</label>
                <input
                  id="password-input"
                  type="text"
                  placeholder="Temporary Password"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label htmlFor="role-select">Access Role</label>
                <select
                  id="role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                >
                  <option value="employee">Employee</option>
                  <option value="executive">Executive Manager</option>
                  <option value="admin">CEO / Admin</option>
                </select>
              </div>

              <div>
                <label htmlFor="pod-select">Office Pod</label>
                <select
                  id="pod-select"
                  value={pod}
                  onChange={(e) => setPod(e.target.value as any)}
                >
                  <option value="India Pod">India Pod</option>
                  <option value="UAE Pod">UAE Pod</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label htmlFor="dept-select">Department</label>
                <select
                  id="dept-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Development Team">Development</option>
                  <option value="Design Team">Design</option>
                  <option value="Marketing Team">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Client Success">Client Success</option>
                </select>
              </div>

              <div>
                <label htmlFor="manager-select">Reporting Manager</label>
                <select
                  id="manager-select"
                  value={reportingManager}
                  onChange={(e) => setReportingManager(e.target.value)}
                >
                  {executives.map(exec => (
                    <option key={exec.id} value={exec.name}>{exec.name} ({exec.department})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generated Details Preview Box Removed */}

            {formSuccess && (
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--accent-emerald)',
                fontWeight: 700,
                textAlign: 'center',
                background: 'var(--accent-emerald-light)',
                padding: '8px',
                borderRadius: '8px'
              }}>
                <div>Account created and synchronized to organizational charts.</div>
                {lastCreatedCredentials && (
                  <div style={{ marginTop: '6px', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5 }}>
                    <div>Email: {lastCreatedCredentials.email}</div>
                    <div>ID: {lastCreatedCredentials.employeeId}</div>
                    <div>Password: {lastCreatedCredentials.password}</div>
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '6px' }}>
              Create Account
            </button>
          </div>
        </form>

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
