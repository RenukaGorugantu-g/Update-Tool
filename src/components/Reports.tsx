import React, { useMemo, useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { exportAnalyticsToCsv } from '../utils/reporting';
import { Search, Download } from 'lucide-react';

const Reports: React.FC = () => {
  const { currentUser, users, updates } = usePulse();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const allUpdates = updates || [];

  const personalUpdates = useMemo(() => {
    if (!currentUser) return [] as any[];
    return allUpdates.filter((u) => u.employeeId === currentUser.id).sort((a, b) => Date.parse(b.timestamp || b.date || '') - Date.parse(a.timestamp || a.date || ''));
  }, [allUpdates, currentUser]);

  const filteredUpdates = useMemo(() => {
    const list = currentUser?.role === 'employee' ? personalUpdates : allUpdates;
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;
    return list.filter((u) => (u.employeeName || '').toLowerCase().includes(term) || (u.projectName || '').toLowerCase().includes(term) || (u.date || '').includes(term));
  }, [allUpdates, personalUpdates, searchTerm, currentUser]);

  const exportVisible = (rows: any[]) => {
    exportAnalyticsToCsv(currentUser ? `${currentUser.id}-reports.csv` : 'reports.csv', rows);
  };

  const rowsForExport = filteredUpdates.map((u) => ({
    Date: u.date || u.timestamp?.slice(0, 10) || '',
    Employee: u.employeeName,
    Project: u.projectName,
    Completed: Array.isArray(u.completed) ? u.completed.join(' | ') : u.completed || '',
    Working: Array.isArray(u.working) ? u.working.join(' | ') : u.working || '',
    Blockers: Array.isArray(u.blockers) ? u.blockers.join(' | ') : u.blockers || '',
    Priority: u.priority,
    Timestamp: u.timestamp || ''
  }));

  const openUser = (employeeId: string) => {
    setSelectedUser(employeeId === selectedUser ? null : employeeId);
  };

  if (!currentUser) return null;

  return (
    <div className="fade-in" style={{ padding: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0 }}>Reports</h2>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>Centralized submissions and export for the selected period.</p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-tertiary)', padding: '6px 10px', borderRadius: 8 }}>
            <Search size={14} />
            <input placeholder="Search by name, project or date" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none' }} />
          </div>
          <button className="btn btn-secondary" onClick={() => exportVisible(rowsForExport)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: currentUser.role === 'employee' ? '1fr' : '320px 1fr', gap: 18 }}>
        {currentUser.role !== 'employee' && (
          <aside>
            <div className="glass-card" style={{ padding: 12 }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Team Members</h4>
              <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                {users.filter(u => u.role === 'employee').map((u) => (
                  <button key={u.id} onClick={() => openUser(u.id)} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px', borderRadius: 8, background: selectedUser === u.id ? 'rgba(16,185,129,0.08)' : 'transparent', border: '1px solid var(--glass-border)', cursor: 'pointer' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: u.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>{(u.name || '').split(' ').map((n: string) => n[0] || '').join('')}</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.department}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        <main>
          <div style={{ display: 'grid', gap: 12 }}>
            {filteredUpdates.length === 0 ? (
              <div className="glass-card" style={{ padding: 18, color: 'var(--text-secondary)' }}>No submissions match the current filter.</div>
            ) : filteredUpdates.map((u) => (
              <div key={u.id} className="glass-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 56, textAlign: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: users.find(x => x.id === u.employeeId)?.avatarColor || 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>{(u.employeeName || '').split(' ').map((n: string) => n[0] || '').join('')}</div>
                  <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.date}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{u.employeeName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.projectName} • {u.priority}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" onClick={() => setSelectedUser(u.employeeId)}>View user</button>
                    </div>
                  </div>

                  <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                    <div><strong>Completed:</strong> {Array.isArray(u.completed) && u.completed.length ? u.completed.join(' • ') : 'No entries'}</div>
                    <div><strong>Working:</strong> {Array.isArray(u.working) && u.working.length ? u.working.join(' • ') : 'No entries'}</div>
                    <div><strong>Blockers:</strong> {Array.isArray(u.blockers) && u.blockers.length ? u.blockers.join(' • ') : 'No blockers'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Selected user full report */}
      {selectedUser && (
        <div className="glass-card" style={{ marginTop: 18, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Full report: {users.find(u => u.id === selectedUser)?.name}</h3>
              <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)' }}>All submitted updates for this person.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => exportVisible(rowsForExport)}>Export visible</button>
              <button className="btn" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {allUpdates.filter(u => u.employeeId === selectedUser).map((u) => (
              <div key={u.id} style={{ padding: 12, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800 }}>{u.date}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.projectName}</div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div><strong>Completed:</strong> {Array.isArray(u.completed) && u.completed.length ? u.completed.join(' • ') : 'No entries'}</div>
                  <div><strong>Working:</strong> {Array.isArray(u.working) && u.working.length ? u.working.join(' • ') : 'No entries'}</div>
                  <div><strong>Blockers:</strong> {Array.isArray(u.blockers) && u.blockers.length ? u.blockers.join(' • ') : 'No blockers'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
