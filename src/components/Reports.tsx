import React, { useMemo, useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { exportAnalyticsToCsv, getRangeStart } from '../utils/reporting';
import { Search, Download } from 'lucide-react';

const normalizeListValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const formatListValue = (value: unknown) => {
  const items = normalizeListValue(value);
  return items.length ? items.join(' • ') : 'No entries';
};

const Reports: React.FC = () => {
  const { currentUser, users, updates } = usePulse();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [range, setRange] = useState<'weekly' | 'monthly' | 'sprint'>('sprint');

  const allUpdates = updates || [];

  const personalUpdates = useMemo(() => {
    if (!currentUser) return [] as any[];
    return allUpdates.filter((u) => u.employeeId === currentUser.id).sort((a, b) => Date.parse(b.timestamp || b.date || '') - Date.parse(a.timestamp || a.date || ''));
  }, [allUpdates, currentUser]);

  const filteredUpdates = useMemo(() => {
    const start = getRangeStart(range);
    const list = currentUser?.role === 'employee' ? personalUpdates : allUpdates;
    const term = searchTerm.trim().toLowerCase();
    const periodMatches = list.filter((u) => {
      const timestamp = Date.parse(u.timestamp || u.date || '');
      return !Number.isNaN(timestamp) && timestamp >= start.getTime();
    });
    if (!term) return periodMatches;
    return periodMatches.filter((u) => (u.employeeName || '').toLowerCase().includes(term) || (u.projectName || '').toLowerCase().includes(term) || (u.date || '').includes(term));
  }, [allUpdates, personalUpdates, searchTerm, currentUser, range]);

  const groupedUpdates = useMemo(() => {
    const groups = new Map<string, any[]>();
    filteredUpdates.forEach((update) => {
      const key = update.employeeId || update.employeeName || 'unknown';
      const next = groups.get(key) || [];
      next.push(update);
      groups.set(key, next);
    });
    return Array.from(groups.entries()).map(([employeeId, entries]) => ({
      employeeId,
      name: entries[0]?.employeeName || 'Unknown',
      entries: entries.sort((a, b) => Date.parse(b.timestamp || b.date || '') - Date.parse(a.timestamp || a.date || ''))
    }));
  }, [filteredUpdates]);

  const exportVisible = (rows: any[]) => {
    exportAnalyticsToCsv(currentUser ? `${currentUser.id}-reports.csv` : 'reports.csv', rows);
  };

  const rowsForExport = filteredUpdates.map((u) => ({
    Date: u.date || u.timestamp?.slice(0, 10) || '',
    Timestamp: u.timestamp || '',
    Employee: u.employeeName,
    Project: u.projectName,
    Completed: normalizeListValue(u.completed).join(' | '),
    Working: normalizeListValue(u.working).join(' | '),
    Blockers: normalizeListValue(u.blockers).join(' | '),
    Priority: u.priority,
    Comments: Array.isArray(u.comments) ? u.comments.map((comment: any) => comment.content || '').filter(Boolean).join(' | ') : ''
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
          <select value={range} onChange={(e) => setRange(e.target.value as 'weekly' | 'monthly' | 'sprint')} style={{ borderRadius: 8, padding: '6px 10px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            <option value="weekly">Last 7 days</option>
            <option value="sprint">Last 14 days</option>
            <option value="monthly">This month</option>
          </select>
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
            {groupedUpdates.length === 0 ? (
              <div className="glass-card" style={{ padding: 18, color: 'var(--text-secondary)' }}>No submissions match the current filter.</div>
            ) : groupedUpdates.map((group) => (
              <div key={group.employeeId} className="glass-card" style={{ padding: 14, display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: users.find(x => x.id === group.employeeId)?.avatarColor || 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>{(group.name || '').split(' ').map((n: string) => n[0] || '').join('')}</div>
                    <div>
                      <div style={{ fontWeight: 800 }}>{group.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{group.entries.length} submission{group.entries.length !== 1 ? 's' : ''} in the selected period</div>
                    </div>
                  </div>
                  <button className="btn btn-secondary" onClick={() => setSelectedUser(group.employeeId)}>View full history</button>
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                  {group.entries.slice(0, 3).map((u) => (
                    <div key={u.id} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ fontWeight: 700 }}>{u.date || u.timestamp?.slice(0, 10)}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.projectName || 'General'} • {u.priority || 'medium'}</div>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}><strong>Completed:</strong> {formatListValue(u.completed)}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}><strong>Working:</strong> {formatListValue(u.working)}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}><strong>Blockers:</strong> {formatListValue(u.blockers)}</div>
                    </div>
                  ))}
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
                  <div><strong>Completed:</strong> {formatListValue(u.completed)}</div>
                  <div><strong>Working:</strong> {formatListValue(u.working)}</div>
                  <div><strong>Blockers:</strong> {formatListValue(u.blockers)}</div>
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
