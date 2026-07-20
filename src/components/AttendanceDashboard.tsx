import React, { useEffect, useMemo, useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { CalendarDays, Clock3, Download, LogIn, LogOut, MapPin, Monitor, Search, Sparkles, Users, Filter, UserRound } from 'lucide-react';

const statusStyles: Record<string, { bg: string; color: string }> = {
  Present: { bg: 'rgba(34, 197, 94, 0.14)', color: '#34d399' },
  Late: { bg: 'rgba(249, 115, 22, 0.16)', color: '#fb923c' },
  'Half Day': { bg: 'rgba(59, 130, 246, 0.14)', color: '#60a5fa' },
  'Auto Logout': { bg: 'rgba(236, 72, 153, 0.14)', color: '#f472b6' },
  Absent: { bg: 'rgba(248, 113, 113, 0.16)', color: '#f87171' }
};

export const AttendanceDashboard: React.FC = () => {
  const { attendance, users, currentUser, recordAttendanceEvent } = usePulse();
  const role = currentUser?.role?.toLowerCase() || '';
  const apiBase = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/$/, '') || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
  const isEmployee = role === 'employee';
  const canViewTeamAttendance = role === 'admin' || role === 'executive' || role === 'employer';
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('all');
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [sessionAccumulatedSeconds, setSessionAccumulatedSeconds] = useState(0);
  const [sessionStart, setSessionStart] = useState<string | null>(null);
  const [sessionEnd, setSessionEnd] = useState<string | null>(null);
  const [sessionLocation, setSessionLocation] = useState<'Office' | 'Remote'>('Remote');
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [attendanceMessage, setAttendanceMessage] = useState('Ready to clock in');
  const currentSessionKey = currentUser?.id ? `pulse-attendance-session-${currentUser.id}` : 'pulse-attendance-session';
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!currentUser) return;
    try {
      const saved = localStorage.getItem(currentSessionKey);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed?.date !== today) {
        localStorage.removeItem(currentSessionKey);
        return;
      }
      const restoredActive = Boolean(parsed?.active);
      const restoredAccumulatedSeconds = Number(parsed?.accumulatedSeconds || 0);
      const restoredStartedAt = Number(parsed?.sessionStartedAt || 0);
      setSessionActive(restoredActive);
      setSessionAccumulatedSeconds(restoredAccumulatedSeconds);
      setSessionStartedAt(restoredStartedAt || null);
      setSessionStart(parsed?.sessionStart || null);
      setSessionEnd(parsed?.sessionEnd || null);
      setSessionLocation(parsed?.sessionLocation || 'Remote');
      setAttendanceMessage(parsed?.attendanceMessage || 'Ready to clock in');
      if (restoredActive && restoredStartedAt) {
        setSessionElapsed(Math.max(0, Math.floor((Date.now() - restoredStartedAt) / 1000)));
      }
    } catch (error) {
      console.warn('Unable to restore attendance session state:', error);
    }
  }, [currentSessionKey, currentUser, today]);

  useEffect(() => {
    if (!sessionActive || sessionStartedAt === null) return;
    const syncElapsed = () => {
      setSessionElapsed(Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 1000)));
    };
    syncElapsed();
    const timer = window.setInterval(syncElapsed, 1000);
    const onVisibilityChange = () => {
      if (!document.hidden) {
        syncElapsed();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [sessionActive, sessionStartedAt]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem(currentSessionKey);
      return;
    }
    const payload = {
      date: today,
      active: sessionActive,
      accumulatedSeconds: sessionAccumulatedSeconds,
      sessionStartedAt,
      sessionStart,
      sessionEnd,
      sessionLocation,
      attendanceMessage,
      lastUpdatedAt: new Date().toISOString()
    };
    if (sessionActive || sessionAccumulatedSeconds > 0 || sessionStart || sessionEnd) {
      localStorage.setItem(currentSessionKey, JSON.stringify(payload));
    } else {
      localStorage.removeItem(currentSessionKey);
    }
  }, [attendanceMessage, currentSessionKey, currentUser, sessionAccumulatedSeconds, sessionActive, sessionEnd, sessionLocation, sessionStart, sessionStartedAt, today]);

  const parseMinutes = (value?: string) => {
    const normalized = String(value || '0h').trim();
    const hourMatch = normalized.match(/(\d+)h/);
    const minuteMatch = normalized.match(/(\d+)m/);
    const hours = hourMatch ? Number(hourMatch[1]) : 0;
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
    return hours * 60 + minutes;
  };

  const formatDurationLabel = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const totalSessionSeconds = sessionActive ? sessionAccumulatedSeconds + sessionElapsed : sessionAccumulatedSeconds;

  const statusOptions = ['All', 'Present', 'Late', 'Half Day', 'Auto Logout', 'Absent'];

  const configuredOfficeIps = useMemo(() => {
    const raw = (import.meta.env.VITE_OFFICE_IPS || import.meta.env.VITE_OFFICE_IP || '196.12.41.58').trim();
    return raw
      .split(',')
      .map((entry: string) => entry.trim())
      .filter(Boolean);
  }, []);

  const normalizeSelectionValue = (value?: string) => String(value || '').trim().toLowerCase();

  const resolveLocation = (ipValue?: string) => {
    const normalized = String(ipValue || '').trim();
    if (!normalized || normalized === 'Unknown') return 'Remote' as const;
    const isOfficeIp = configuredOfficeIps.some((entry: string) => entry === normalized || entry === normalized.replace(/\s+/g, ''));
    return isOfficeIp ? 'Office' as const : 'Remote' as const;
  };

  const matchesEmployeeSelection = (entry: any, selectedValue: string) => {
    if (!selectedValue || selectedValue === 'all') return true;
    const selected = normalizeSelectionValue(selectedValue);
    const candidates = [entry.userId, entry.email, entry.employeeName]
      .map((value) => normalizeSelectionValue(value))
      .filter(Boolean);
    return candidates.includes(selected);
  };

  const employeeOptions = useMemo(() => {
    const byKey = new Map<string, { value: string; label: string }>();

    users
      .filter((user) => user?.role === 'employee' && user?.active !== false)
      .forEach((user) => {
        const key = user.id || user.email || user.name || 'unknown';
        if (!byKey.has(key)) {
          byKey.set(key, {
            value: key,
            label: user.name || user.email || 'Unknown employee'
          });
        }
      });

    attendance.filter((entry) => entry.userId || entry.email || entry.employeeName).forEach((entry) => {
      const key = entry.userId || entry.email || entry.employeeName || 'unknown';
      if (!byKey.has(key)) {
        byKey.set(key, {
          value: key,
          label: entry.employeeName || entry.email || 'Unknown employee'
        });
      }
    });

    return Array.from(byKey.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [attendance, users]);

  useEffect(() => {
    if (!canViewTeamAttendance) {
      setSelectedEmployeeId('all');
      return;
    }
    if (!employeeOptions.length) {
      setSelectedEmployeeId('all');
      return;
    }
    if (selectedEmployeeId !== 'all' && !employeeOptions.some((option) => option.value === selectedEmployeeId)) {
      setSelectedEmployeeId('all');
    }
  }, [canViewTeamAttendance, employeeOptions, selectedEmployeeId]);

  const employeeEntries = useMemo(() => {
    if (!currentUser) return [] as any[];
    return attendance
      .filter((entry) => entry.userId === currentUser.id || entry.email === currentUser.email)
      .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.loginTime || '').localeCompare(a.loginTime || ''));
  }, [attendance, currentUser]);

  const visibleEntries = useMemo(() => {
    const source = isEmployee ? employeeEntries : attendance;
    return source
      .filter((entry) => {
        const matchesEmployee = !canViewTeamAttendance || selectedEmployeeId === 'all' || matchesEmployeeSelection(entry, selectedEmployeeId);
        const matchesStatus = selectedStatus === 'All' || entry.status === selectedStatus;
        const haystack = `${entry.employeeName || ''} ${entry.department || ''} ${entry.email || ''}`.toLowerCase();
        const matchesSearch = !searchTerm || haystack.includes(searchTerm.toLowerCase());
        return matchesEmployee && matchesStatus && matchesSearch;
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.loginTime || '').localeCompare(a.loginTime || ''));
  }, [attendance, canViewTeamAttendance, employeeEntries, isEmployee, searchTerm, selectedStatus, selectedEmployeeId]);

  const presentCount = visibleEntries.filter((entry) => ['Present', 'Late', 'Half Day', 'Auto Logout'].includes(entry.status)).length;
  const absentCount = visibleEntries.filter((entry) => entry.status === 'Absent').length;
  const officeCount = visibleEntries.filter((entry) => entry.officeRemote === 'Office').length;
  const remoteCount = visibleEntries.filter((entry) => entry.officeRemote === 'Remote').length;

  const employeeSummary = useMemo(() => {
    const groups: Record<string, any> = {};
    visibleEntries.forEach((entry) => {
      const key = entry.userId || entry.employeeName || 'unknown';
      if (!groups[key]) {
        groups[key] = {
          userId: entry.userId,
          employeeName: entry.employeeName || 'Unknown',
          department: entry.department || 'Unassigned',
          rows: [] as any[]
        };
      }
      groups[key].rows.push(entry);
    });
    return Object.values(groups)
      .map((group: any) => ({
        ...group,
        present: group.rows.filter((row: any) => ['Present', 'Late', 'Half Day', 'Auto Logout'].includes(row.status)).length,
        hours: group.rows.reduce((sum: number, row: any) => sum + parseMinutes(row.workingHours), 0)
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [visibleEntries]);

  const exportRows = (rows: any[], filename: string) => {
    const header = 'Employee Name,Email,Department,Date,Login,Logout,Working Hours,Status,Office/Remote,IP Address,Device,Browser,OS\n';
    const body = rows.map((row) => [
      row.employeeName || '',
      row.email || '',
      row.department || '',
      row.date || row.createdAt?.slice(0, 10) || '',
      row.loginTime || '',
      row.logoutTime || '',
      row.workingHours || '',
      row.status || '',
      row.officeRemote || '',
      row.ipAddress || '',
      row.device || '',
      row.browser || '',
      row.os || ''
    ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const csv = `${header}${body}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const href = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  };

  const exportAttendanceForUser = async (entry: any) => {
    const rows = attendance.filter((item) => item.userId === entry.userId || (entry.email && item.email === entry.email)).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const filename = `${(entry.employeeName || entry.userId || 'employee').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-attendance`;
    if (apiBase) {
      try {
        const params = new URLSearchParams();
        if (entry.userId) params.set('userId', entry.userId);
        if (entry.email) params.set('email', entry.email);
        const response = await fetch(`${apiBase}/api/attendance/export${params.toString() ? `?${params.toString()}` : ''}`);
        if (response.ok) {
          const blob = await response.blob();
          const href = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = href;
          link.download = `${filename}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(href);
          return;
        }
      } catch (error) {
        console.warn('attendance export from backend failed, falling back to local export', error);
      }
    }
    exportRows(rows, filename);
  };

  const exportSelectedEmployee = async () => {
    const rows = selectedEmployeeId === 'all'
      ? attendance.slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      : attendance.filter((item) => matchesEmployeeSelection(item, selectedEmployeeId)).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const filename = selectedEmployeeId === 'all'
      ? `attendance-logs-all-history`
      : `${(employeeOptions.find((option) => option.value === selectedEmployeeId)?.label || 'employee').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-attendance`;
    if (apiBase) {
      try {
        const params = new URLSearchParams();
        if (selectedEmployeeId !== 'all') {
          const selectedOption = employeeOptions.find((option) => option.value === selectedEmployeeId);
          params.set('userId', selectedOption?.value || selectedEmployeeId);
        }
        const response = await fetch(`${apiBase}/api/attendance/export${params.toString() ? `?${params.toString()}` : ''}`);
        if (response.ok) {
          const blob = await response.blob();
          const href = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = href;
          link.download = `${filename}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(href);
          return;
        }
      } catch (error) {
        console.warn('attendance export from backend failed, falling back to local export', error);
      }
    }
    exportRows(rows, filename);
  };

  const handleAttendanceAction = async (action: 'login' | 'logout') => {
    if (!currentUser) return;
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];
    const date = now.toISOString().split('T')[0];
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : 'Browser';
    const os = /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown';
    let detectedIpAddress = '';

    try {
      const response = await fetch('https://api.ipify.org?format=json', { headers: { Accept: 'application/json' } });
      if (response.ok) {
        const payload = await response.json().catch(() => null);
        if (payload?.ip) {
          detectedIpAddress = String(payload.ip).trim();
        }
      }
    } catch (error) {
      console.warn('Unable to detect public IP for attendance location:', error);
    }

    const ipAddress = detectedIpAddress || 'Unknown';
    const location: 'Office' | 'Remote' = resolveLocation(ipAddress);

    if (action === 'login') {
      setSessionActive(true);
      setSessionElapsed(0);
      setSessionStart(time);
      setSessionEnd(null);
      setSessionLocation(location);
      setSessionStartedAt(now.getTime());
      setAttendanceMessage(`Clocked in at ${time}.`);
    } else {
      const completedSeconds = Math.max(1, sessionActive ? sessionAccumulatedSeconds + sessionElapsed : sessionAccumulatedSeconds);
      const workedLabel = formatDurationLabel(completedSeconds);
      setSessionActive(false);
      setSessionAccumulatedSeconds(completedSeconds);
      setSessionElapsed(0);
      setSessionEnd(time);
      setSessionStartedAt(null);
      setAttendanceMessage(`Clocked out at ${time}. Worked ${workedLabel}.`);
    }

    await recordAttendanceEvent({
      date,
      loginTime: action === 'login' ? time : '',
      logoutTime: action === 'logout' ? time : '',
      workingHours: action === 'logout' ? formatDurationLabel(sessionActive ? sessionAccumulatedSeconds + sessionElapsed : sessionAccumulatedSeconds) : '0h 0m',
      status: action === 'login' ? 'Present' : 'Auto Logout',
      officeRemote: location,
      ipAddress,
      device: /Mobile/.test(ua) ? 'Mobile' : 'Desktop',
      browser,
      os
    });
  };

  return (
    <div className="fade-in" style={{ padding: '8px 0', display: 'grid', gap: '18px' }}>
      <section className="glass-card" style={{ padding: '20px 22px', border: '1px solid rgba(34, 197, 94, 0.24)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(16, 185, 129, 0.22), rgba(30, 41, 59, 0.92))', display: 'grid', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '999px', background: 'rgba(34, 197, 94, 0.16)', color: '#86efac', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <Sparkles size={14} /> Attendance Hub
            </div>
            <h2 style={{ margin: '8px 0 4px', fontSize: '1.45rem', fontWeight: 800 }}>Track time, presence, and attendance in one place</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {isEmployee ? 'Log your work sessions and review your attendance history below.' : 'Monitor daily and weekly team presence with filters, calendar views, and CSV exports.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {canViewTeamAttendance ? (
              <button type="button" onClick={exportSelectedEmployee} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={14} /> Download logs
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {isEmployee ? (
        <section className="glass-card" style={{ padding: '18px', display: 'grid', gap: '14px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(5, 150, 105, 0.16), rgba(2, 8, 23, 0.95))', border: '1px solid rgba(52, 211, 153, 0.28)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Clocking</div>
              <h3 style={{ margin: '6px 0 0', fontSize: '1rem', fontWeight: 800 }}>Today&apos;s attendance tracker</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => void handleAttendanceAction('login')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #0f766e 0%, #34d399 100%)', color: '#fff', border: 'none' }}>
                <LogIn size={14} /> Clock In
              </button>
              <button type="button" onClick={() => void handleAttendanceAction('logout')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #b91c1c 0%, #f87171 100%)', color: '#fff', border: 'none' }}>
                <LogOut size={14} /> Clock Out
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="surface-card" style={{ padding: '16px', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Session</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '6px', color: sessionActive ? '#34d399' : '#f59e0b' }}>{sessionActive ? formatDurationLabel(totalSessionSeconds) : formatDurationLabel(sessionAccumulatedSeconds)}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>{sessionActive ? 'Live timer running' : 'Timer paused'}</div>
            </div>
            <div className="surface-card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Clock In</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '6px' }}>{sessionStart || '--:--'}</div>
            </div>
            <div className="surface-card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Clock Out</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '6px' }}>{sessionEnd || '--:--'}</div>
            </div>
            <div className="surface-card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Location</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: 800, marginTop: '6px' }}><MapPin size={14} /> {sessionLocation}</div>
            </div>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', padding: '8px 10px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>{attendanceMessage}</div>
        </section>
      ) : null}

      {canViewTeamAttendance ? (
        <section className="glass-card" style={{ padding: '16px', display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Team filters</div>
              <div style={{ marginTop: '6px', fontWeight: 700 }}>Focus on one employee or view the full roster</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ display: 'grid', gap: '6px', minWidth: '220px' }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Employee</span>
                <select value={selectedEmployeeId} onChange={(event) => setSelectedEmployeeId(event.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  <option value="all">All employees</option>
                  {employeeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label style={{ display: 'grid', gap: '6px', minWidth: '180px' }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</span>
                <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
            </div>
          </div>
        </section>
      ) : null}

      <section className="glass-card" style={{ padding: '16px', display: 'grid', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>History</div>
            <div style={{ marginTop: '6px', fontWeight: 700 }}>{isEmployee ? 'All of your clock-in records' : 'All attendance history for the selected employee'}</div>
          </div>
          {canViewTeamAttendance ? (
            <label style={{ display: 'grid', gap: '6px', minWidth: '260px' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Search employees</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)' }}>
                <Search size={14} />
                <input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by name or department" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)' }} />
              </div>
            </label>
          ) : null}
        </div>
        <div className="metrics-row">
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><CalendarDays size={16} /><span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Rows</span></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{visibleEntries.length}</h3>
          </div>
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Users size={16} /><span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Present</span></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{presentCount}</h3>
          </div>
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Users size={16} /><span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Absent</span></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{absentCount}</h3>
          </div>
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Monitor size={16} /><span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Office / Remote</span></div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{officeCount} office • {remoteCount} remote</h3>
          </div>
        </div>
        {canViewTeamAttendance ? (
          <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {employeeSummary.map((card) => (
              <div key={card.userId || card.employeeName} className="glass-card" style={{ padding: '14px', display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800 }}>{card.employeeName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{card.department}</div>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{card.present} sessions logged</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{Math.floor(card.hours / 60)}h {card.hours % 60}m</div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="glass-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock3 size={16} /><span style={{ fontWeight: 800 }}>{isEmployee ? 'My attendance history' : 'Attendance logs'}</span></div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Filter size={13} /> {visibleEntries.length} row(s)</span>
            {canViewTeamAttendance ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><UserRound size={13} /> {employeeSummary.length} people</span> : null}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                {!isEmployee ? <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>Employee</th> : null}
                <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>Date</th>
                <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>Login</th>
                <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>Logout</th>
                <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>Hours</th>
                <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>Status</th>
                <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>Location</th>
                <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>Export</th>
              </tr>
            </thead>
            <tbody>
              {visibleEntries.length === 0 ? (
                <tr><td colSpan={isEmployee ? 7 : 8} style={{ padding: '14px 8px', color: 'var(--text-secondary)' }}>
                  {attendance.length > 0 ? 'No attendance rows matched the current filters for this employee.' : 'No attendance rows have been captured yet for this account.'}
                </td></tr>
              ) : visibleEntries.map((entry) => {
                const chip = statusStyles[entry.status || 'Present'] || statusStyles.Present;
                return (
                  <tr key={entry.attendanceId}>
                    {!isEmployee ? <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>{entry.employeeName || currentUser?.name}</td> : null}
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>{entry.date || entry.createdAt?.slice(0, 10) || '--'}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)', color: entry.loginTime ? '#34d399' : 'var(--text-muted)' }}>{entry.loginTime || '--'}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)', color: entry.logoutTime ? '#f59e0b' : 'var(--text-muted)' }}>{entry.logoutTime || '--'}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>{entry.workingHours || '0h'}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: '999px', background: chip.bg, color: chip.color, fontSize: '0.75rem', fontWeight: 700 }}>
                        {entry.status || 'Present'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>{entry.officeRemote || 'Remote'}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>
                      <button type="button" onClick={() => exportAttendanceForUser(entry)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 8px', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <Download size={13} /> CSV
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
