import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePulse } from '../context/PulseContext';
import {
  CalendarDays,
  Clock3,
  Download,
  LogIn,
  LogOut,
  MapPin,
  Monitor,
  Search,
  Sparkles,
  Users,
  Filter,
  UserRound,
  Zap,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const statusStyles: Record<string, { bg: string; color: string; accent: string }> = {
  Present: { bg: 'rgba(34, 197, 94, 0.14)', color: '#34d399', accent: '#22c55e' },
  Late: { bg: 'rgba(249, 115, 22, 0.16)', color: '#fb923c', accent: '#f97316' },
  'Half Day': { bg: 'rgba(59, 130, 246, 0.14)', color: '#60a5fa', accent: '#3b82f6' },
  Absent: { bg: 'rgba(248, 113, 113, 0.16)', color: '#f87171', accent: '#ef4444' }
};

const AVATAR_PALETTE = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];

const getInitials = (name?: string) => {
  const clean = (name || '').trim();
  if (!clean) return '?';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getAvatarColor = (key?: string) => {
  const str = String(key || 'x');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const DAILY_TARGET_SECONDS = 8 * 60 * 60;

export const AttendanceDashboard: React.FC = () => {
  const { attendance, users, currentUser, recordAttendanceEvent } = usePulse();
  const role = currentUser?.role?.toLowerCase() || '';
  const fallbackApiBase = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://update-tool.onrender.com';
  const apiBase = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/$/, '') || fallbackApiBase;
  const isEmployee = role === 'employee';
  const canViewTeamAttendance = role === 'admin' || role === 'executive' || role === 'employer';
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('all');
  const [selectedAttendanceIds, setSelectedAttendanceIds] = useState<string[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [sessionAccumulatedSeconds, setSessionAccumulatedSeconds] = useState(0);
  const [sessionStart, setSessionStart] = useState<string | null>(null);
  const [sessionEnd, setSessionEnd] = useState<string | null>(null);
  const [sessionLocation, setSessionLocation] = useState<'Office' | 'Remote'>('Remote');
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [attendanceMessage, setAttendanceMessage] = useState('Ready to clock in');
  const [clockNow, setClockNow] = useState(() => new Date());
  const currentSessionKey = currentUser?.id ? `pulse-attendance-session-${currentUser.id}` : 'pulse-attendance-session';
  const today = new Date().toISOString().split('T')[0];
  const lastActivityRef = useRef(Date.now());
  const lastTimerTickRef = useRef(Date.now());
  const lastElapsedRef = useRef(0);
  const manualPauseRef = useRef(false);
  const IDLE_TIMEOUT_MS = 45000;

  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

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
      const restoredPaused = Boolean(parsed?.paused);
      setSessionActive(restoredActive);
      setSessionPaused(restoredPaused);
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
    if (!sessionActive) {
      setSessionPaused(false);
      return;
    }

    const getElapsedSeconds = (startAt: number | null) => {
      if (!startAt) return 0;
      return Math.max(0, Math.floor((Date.now() - startAt) / 1000));
    };

    const syncElapsed = () => {
      const now = Date.now();
      if (!sessionActive || sessionPaused || sessionStartedAt === null) {
        setSessionElapsed(0);
        return;
      }

      const elapsed = getElapsedSeconds(sessionStartedAt);
      const gapSeconds = Math.floor((now - lastTimerTickRef.current) / 1000);
      lastTimerTickRef.current = now;

      if (gapSeconds > IDLE_TIMEOUT_MS / 1000) {
        setSessionAccumulatedSeconds((prev) => prev + elapsed);
        setSessionElapsed(0);
        setSessionStartedAt(null);
        setSessionPaused(true);
        setAttendanceMessage('Paused after the device became unavailable or idle.');
        return;
      }

      setSessionElapsed(elapsed);
    };

    syncElapsed();
    const timer = window.setInterval(syncElapsed, 1000);

    const markActiveFromInput = (event: Event) => {
      if (event instanceof KeyboardEvent || event instanceof MouseEvent || event instanceof TouchEvent) {
        lastActivityRef.current = Date.now();
        if (sessionPaused && !manualPauseRef.current) {
          setSessionPaused(false);
          setSessionStartedAt(Date.now());
          setAttendanceMessage('Resumed. Tracking active work time again.');
        }
      }
    };

    const idleCheck = window.setInterval(() => {
      const now = Date.now();
      if (!sessionPaused && sessionStartedAt !== null && now - lastActivityRef.current > IDLE_TIMEOUT_MS) {
        const elapsed = getElapsedSeconds(sessionStartedAt);
        setSessionAccumulatedSeconds((prev) => prev + elapsed);
        setSessionElapsed(0);
        setSessionStartedAt(null);
        setSessionPaused(true);
        setAttendanceMessage('Paused due to inactivity.');
      }
    }, 5000);

    window.addEventListener('mousemove', markActiveFromInput);
    window.addEventListener('mousedown', markActiveFromInput);
    window.addEventListener('keydown', markActiveFromInput);
    window.addEventListener('touchstart', markActiveFromInput);
    document.addEventListener('input', markActiveFromInput, true);

    return () => {
      window.clearInterval(timer);
      window.clearInterval(idleCheck);
      window.removeEventListener('mousemove', markActiveFromInput);
      window.removeEventListener('mousedown', markActiveFromInput);
      window.removeEventListener('keydown', markActiveFromInput);
      window.removeEventListener('touchstart', markActiveFromInput);
      document.removeEventListener('input', markActiveFromInput, true);
    };
  }, [sessionActive, sessionPaused, sessionStartedAt]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem(currentSessionKey);
      return;
    }
    const payload = {
      date: today,
      active: sessionActive,
      paused: sessionPaused,
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
  }, [attendanceMessage, currentSessionKey, currentUser, sessionAccumulatedSeconds, sessionActive, sessionEnd, sessionLocation, sessionPaused, sessionStart, sessionStartedAt, today]);

  useEffect(() => {
    if (!currentUser || !sessionActive) return;

    const handleBeforeUnload = () => {
      if (!sessionActive) return;
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toTimeString().split(' ')[0];
      const additionalSeconds = sessionPaused || sessionStartedAt === null ? 0 : Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 1000));
      const completedSeconds = Math.max(1, sessionAccumulatedSeconds + additionalSeconds);

      recordAttendanceEvent({
        date,
        logoutTime: time,
        workingHours: formatDurationLabel(completedSeconds),
        status: 'Present',
        officeRemote: sessionLocation,
        ipAddress: 'Unknown',
        device: 'Unknown',
        browser: 'Unknown',
        os: 'Unknown'
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser, recordAttendanceEvent, sessionActive, sessionAccumulatedSeconds, sessionPaused, sessionLocation, sessionStartedAt]);

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

  const formatShortHours = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

  const totalSessionSeconds = sessionActive ? sessionAccumulatedSeconds + (sessionPaused ? 0 : sessionElapsed) : sessionAccumulatedSeconds;
  const sessionProgressPercent = Math.min(100, Math.round((totalSessionSeconds / DAILY_TARGET_SECONDS) * 100));

  const statusOptions = ['All', 'Present', 'Late', 'Half Day', 'Absent'];

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

  const getAttendanceRowKey = (entry: any) => entry.attendanceId || `${entry.userId || entry.employeeName || 'unknown'}-${entry.date || entry.createdAt?.slice(0, 10) || 'na'}-${entry.loginTime || ''}-${entry.logoutTime || ''}`;

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

  const presentCount = visibleEntries.filter((entry) => ['Present', 'Late', 'Half Day'].includes(entry.status)).length;
  const absentCount = visibleEntries.filter((entry) => entry.status === 'Absent').length;
  const officeCount = visibleEntries.filter((entry) => entry.officeRemote === 'Office').length;
  const remoteCount = visibleEntries.filter((entry) => entry.officeRemote === 'Remote').length;

  const toggleAttendanceSelection = (rowKey: string) => {
    setSelectedAttendanceIds((prev) => (prev.includes(rowKey) ? prev.filter((value) => value !== rowKey) : [...prev, rowKey]));
  };

  const selectVisibleAttendance = () => {
    const keys = visibleEntries.map((entry) => getAttendanceRowKey(entry)).filter(Boolean);
    setSelectedAttendanceIds(keys);
  };

  const clearAttendanceSelection = () => {
    setSelectedAttendanceIds([]);
  };

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
      .map((group: any) => {
        const todaysRows = group.rows.filter((row: any) => (row.date || row.createdAt?.slice(0, 10)) === today);
        const loginsToday = todaysRows.filter((row: any) => row.loginTime).length;
        const logoutsToday = todaysRows.filter((row: any) => row.logoutTime).length;
        return {
          ...group,
          present: group.rows.filter((row: any) => ['Present', 'Late', 'Half Day'].includes(row.status)).length,
          hours: group.rows.reduce((sum: number, row: any) => sum + parseMinutes(row.workingHours), 0),
          activeNow: loginsToday > logoutsToday
        };
      })
      .sort((a, b) => b.hours - a.hours);
  }, [visibleEntries, today]);

  const maxSummaryHours = useMemo(() => Math.max(1, ...employeeSummary.map((card: any) => card.hours)), [employeeSummary]);

  const weeklyChartData = useMemo(() => {
    const base = isEmployee
      ? employeeEntries
      : selectedEmployeeId === 'all'
        ? attendance
        : attendance.filter((entry) => matchesEmployeeSelection(entry, selectedEmployeeId));

    const days: { key: string; label: string; minutes: number; isToday: boolean }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      const minutes = base
        .filter((entry) => (entry.date || entry.createdAt?.slice(0, 10)) === key)
        .reduce((sum, entry) => sum + parseMinutes(entry.workingHours), 0);
      days.push({ key, label, minutes, isToday: key === today });
    }
    return days;
  }, [attendance, employeeEntries, isEmployee, selectedEmployeeId, today]);

  const maxWeeklyMinutes = useMemo(() => Math.max(60, ...weeklyChartData.map((d) => d.minutes)), [weeklyChartData]);
  const weeklyTotalMinutes = useMemo(() => weeklyChartData.reduce((sum, d) => sum + d.minutes, 0), [weeklyChartData]);

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
    const rows = visibleEntries.filter((entry) => {
      const rowKey = getAttendanceRowKey(entry);
      return selectedAttendanceIds.length === 0 ? true : selectedAttendanceIds.includes(rowKey);
    }).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const filename = selectedAttendanceIds.length > 0
      ? `attendance-selected-rows`
      : `attendance-logs-visible`;
    if (apiBase && rows.length > 0 && selectedAttendanceIds.length === 0) {
      try {
        const params = new URLSearchParams();
        const selectedOption = employeeOptions.find((option) => option.value === selectedEmployeeId);
        const selectedValue = String(selectedOption?.value || selectedEmployeeId || '').trim();
        if (selectedEmployeeId !== 'all') {
          if (!selectedValue) {
            params.set('userId', selectedEmployeeId);
          } else if (selectedValue.includes('@')) {
            params.set('email', selectedValue.toLowerCase());
          } else if (/^(emp-|u-)/i.test(selectedValue)) {
            params.set('userId', selectedValue);
          } else {
            params.set('employeeName', selectedValue);
          }
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

  const toggleSessionPause = () => {
    if (!sessionActive) return;
    if (!sessionPaused) {
      manualPauseRef.current = true;
      if (sessionStartedAt !== null) {
        const elapsed = Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 1000));
        setSessionAccumulatedSeconds((prev) => prev + elapsed);
      }
      setSessionStartedAt(null);
      setSessionElapsed(0);
      setSessionPaused(true);
      setAttendanceMessage('Paused. Resume when you are ready.');
    } else {
      manualPauseRef.current = false;
      const now = Date.now();
      lastActivityRef.current = now;
      lastTimerTickRef.current = now;
      setSessionStartedAt(now);
      setSessionPaused(false);
      setSessionElapsed(0);
      setAttendanceMessage('Resumed. Tracking active work time again.');
    }
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

    let completedSeconds = sessionAccumulatedSeconds;
    if (action === 'login') {
      manualPauseRef.current = false;
      setSessionActive(true);
      setSessionPaused(false);
      setSessionElapsed(0);
      setSessionAccumulatedSeconds(0);
      setSessionStart(time);
      setSessionEnd(null);
      setSessionLocation(location);
      setSessionStartedAt(now.getTime());
      lastActivityRef.current = now.getTime();
      lastTimerTickRef.current = now.getTime();
      lastElapsedRef.current = 0;
      setAttendanceMessage(`Clocked in at ${time}. Tracking active screen time only.`);
    } else {
      completedSeconds = Math.max(1, sessionActive ? sessionAccumulatedSeconds + (sessionPaused ? 0 : sessionElapsed) : sessionAccumulatedSeconds);
      const workedLabel = formatDurationLabel(completedSeconds);
      manualPauseRef.current = false;
      setSessionActive(false);
      setSessionPaused(false);
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
      workingHours: action === 'logout' ? formatDurationLabel(completedSeconds) : '0h 0m',
      status: 'Present',
      officeRemote: location,
      ipAddress,
      device: /Mobile/.test(ua) ? 'Mobile' : 'Desktop',
      browser,
      os
    });
  };

  return (
    <div className="fade-in" style={{ padding: '8px 0', display: 'grid', gap: '18px' }}>
      {/* Hero */}
      <section className="glass-card" style={{ padding: '22px 24px', border: '1px solid rgba(148, 163, 184, 0.22)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)', display: 'grid', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '999px', background: 'rgba(34, 197, 94, 0.16)', color: '#86efac', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Sparkles size={14} /> Attendance Hub
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '999px', background: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                <Clock3 size={13} /> {clockNow.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} · {clockNow.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>
            <h2 style={{ margin: '10px 0 4px', fontSize: '1.45rem', fontWeight: 800 }}>Track time, presence, and attendance in one place</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {isEmployee ? 'Log your work sessions and review your attendance history below.' : 'Monitor daily and weekly team presence with filters, calendar views, and CSV exports.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {canViewTeamAttendance ? (
              <>
                <button type="button" onClick={selectVisibleAttendance} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} /> Select visible
                </button>
                <button type="button" onClick={clearAttendanceSelection} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserRound size={14} /> Clear
                </button>
                <button type="button" onClick={() => void exportSelectedEmployee()} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Download size={14} /> Download selected
                </button>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {isEmployee ? (
        <section className="glass-card" style={{ padding: '18px', display: 'grid', gap: '16px', border: '1px solid rgba(148, 163, 184, 0.18)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Clocking</div>
              <h3 style={{ margin: '6px 0 0', fontSize: '1rem', fontWeight: 800 }}>Today&apos;s attendance tracker</h3>
              <div style={{ marginTop: '6px', fontSize: '0.8rem', color: sessionPaused ? '#f59e0b' : 'var(--text-secondary)' }}>
                {sessionActive ? (sessionPaused ? 'Paused after a period of inactivity.' : 'Tracking active work time while the device is in use.') : 'Ready to track active work time.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => void handleAttendanceAction('login')} disabled={sessionActive} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#064e3b', color: '#ecfdf5', border: '1px solid #10b981', opacity: sessionActive ? 0.5 : 1, cursor: sessionActive ? 'not-allowed' : 'pointer' }}>
                <LogIn size={14} /> Clock In
              </button>
              <button type="button" onClick={toggleSessionPause} disabled={!sessionActive} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: sessionPaused ? '#064e3b' : '#78350f', color: '#fff7ed', border: sessionPaused ? '1px solid #10b981' : '1px solid #f59e0b', opacity: !sessionActive ? 0.5 : 1, cursor: !sessionActive ? 'not-allowed' : 'pointer' }}>
                {sessionPaused ? <Sparkles size={14} /> : <Clock3 size={14} />} {sessionPaused ? 'Resume' : 'Pause'}
              </button>
              <button type="button" onClick={() => void handleAttendanceAction('logout')} disabled={!sessionActive} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#7f1d1d', color: '#fff1f2', border: '1px solid #f87171', opacity: !sessionActive ? 0.5 : 1, cursor: !sessionActive ? 'not-allowed' : 'pointer' }}>
                <LogOut size={14} /> Clock Out
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 260px) 1fr', gap: '16px', alignItems: 'stretch' }}>
            {/* Radial timer */}
            <div className="surface-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div style={{
                position: 'relative',
                width: '148px',
                height: '148px',
                borderRadius: '50%',
                background: `conic-gradient(${sessionActive ? '#34d399' : '#f59e0b'} ${sessionProgressPercent}%, rgba(148, 163, 184, 0.14) ${sessionProgressPercent}% 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 30% 20%, rgba(15,23,42,0.98), rgba(2,8,23,0.98))',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px'
                }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: sessionActive ? '#34d399' : '#f59e0b', fontVariantNumeric: 'tabular-nums' }}>
                    {formatDurationLabel(totalSessionSeconds)}
                  </span>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {sessionActive ? (<><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulse 1.6s ease-in-out infinite' }} /> live</>) : 'paused'}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>{sessionProgressPercent}% of 8h target</div>
            </div>

            {/* Session info + weekly chart */}
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                <div className="surface-card" style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Clock In</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '4px' }}>{sessionStart || '--:--'}</div>
                </div>
                <div className="surface-card" style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Clock Out</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '4px' }}>{sessionEnd || '--:--'}</div>
                </div>
                <div className="surface-card" style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Location</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.0rem', fontWeight: 800, marginTop: '4px' }}><MapPin size={13} /> {sessionLocation}</div>
                </div>
                <div className="surface-card" style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>This week</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.0rem', fontWeight: 800, marginTop: '4px' }}><TrendingUp size={13} /> {formatShortHours(weeklyTotalMinutes)}</div>
                </div>
              </div>

              <div className="surface-card" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  <BarChart3 size={13} /> Last 7 days
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '68px' }}>
                  {weeklyChartData.map((day) => (
                    <div key={day.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{
                        width: '100%',
                        maxWidth: '22px',
                        height: `${Math.max(4, Math.round((day.minutes / maxWeeklyMinutes) * 100))}%`,
                        borderRadius: '5px',
                        background: day.isToday ? 'linear-gradient(180deg, #34d399, #059669)' : 'rgba(148, 163, 184, 0.28)',
                        transition: 'height 0.3s ease'
                      }} title={`${day.label}: ${formatShortHours(day.minutes)}`} />
                      <span style={{ fontSize: '0.62rem', color: day.isToday ? '#34d399' : 'var(--text-muted)', fontWeight: day.isToday ? 800 : 500 }}>{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', padding: '8px 10px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>{attendanceMessage}</div>
        </section>
      ) : null}

      {canViewTeamAttendance ? (
        <section className="glass-card" style={{ padding: '16px', display: 'grid', gap: '14px' }}>
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
            </div>
          </div>

          {/* Quick status filter chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {statusOptions.map((status) => {
              const active = selectedStatus === status;
              const chip = status !== 'All' ? statusStyles[status] : null;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: active ? `1px solid ${chip?.accent || '#60a5fa'}` : '1px solid var(--glass-border)',
                    background: active ? (chip?.bg || 'rgba(96, 165, 250, 0.16)') : 'transparent',
                    color: active ? (chip?.color || '#60a5fa') : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {status}
                </button>
              );
            })}
          </div>

          {/* Team roster */}
          <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
            {employeeSummary.map((card: any) => (
              <div key={card.userId || card.employeeName} className="surface-card" style={{ padding: '14px', display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: getAvatarColor(card.userId || card.employeeName),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    color: '#fff',
                    flexShrink: 0,
                    position: 'relative'
                  }}>
                    {getInitials(card.employeeName)}
                    {card.activeNow ? (
                      <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '11px', height: '11px', borderRadius: '50%', background: '#34d399', border: '2px solid var(--bg-secondary)' }} />
                    ) : null}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.employeeName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{card.department}</div>
                  </div>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '999px',
                    background: card.activeNow ? 'rgba(34, 197, 94, 0.14)' : 'rgba(148, 163, 184, 0.14)',
                    color: card.activeNow ? '#34d399' : 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    {card.activeNow ? <Zap size={10} /> : null}{card.activeNow ? 'Active now' : 'Off duty'}
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>{card.present} sessions logged</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{formatShortHours(card.hours)}</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(148, 163, 184, 0.14)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, Math.round((card.hours / maxSummaryHours) * 100))}%`, background: 'linear-gradient(90deg, #6366f1, #0ea5e9)', borderRadius: '999px' }} />
                  </div>
                </div>
              </div>
            ))}
            {employeeSummary.length === 0 ? (
              <div className="surface-card" style={{ padding: '18px', color: 'var(--text-secondary)', gridColumn: '1 / -1', textAlign: 'center' }}>No team members match the current filters yet.</div>
            ) : null}
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{presentCount}</h3>
          </div>
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Users size={16} /><span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Absent</span></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>{absentCount}</h3>
          </div>
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Monitor size={16} /><span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Office / Remote</span></div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{officeCount} office • {remoteCount} remote</h3>
          </div>
        </div>
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
                {!isEmployee ? (
                  <>
                    <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>
                      <input
                        type="checkbox"
                        checked={visibleEntries.length > 0 && visibleEntries.every((entry) => selectedAttendanceIds.includes(getAttendanceRowKey(entry)))}
                        onChange={() => {
                          const allVisibleKeys = visibleEntries.map((entry) => getAttendanceRowKey(entry));
                          setSelectedAttendanceIds((prev) => {
                            const hasAll = allVisibleKeys.every((key) => prev.includes(key));
                            if (hasAll) {
                              return prev.filter((key) => !allVisibleKeys.includes(key));
                            }
                            return Array.from(new Set([...prev, ...allVisibleKeys]));
                          });
                        }}
                        style={{ accentColor: '#34d399' }}
                      />
                    </th>
                    <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>Employee</th>
                  </>
                ) : null}
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
                const rowKey = getAttendanceRowKey(entry);
                const isSelected = selectedAttendanceIds.includes(rowKey);
                return (
                  <tr
                    key={rowKey}
                    style={{ borderLeft: `3px solid ${chip.accent}`, transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(148, 163, 184, 0.06)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                  >
                    {!isEmployee ? (
                      <>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAttendanceSelection(rowKey)}
                            style={{ accentColor: '#34d399' }}
                          />
                        </td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: getAvatarColor(entry.userId || entry.employeeName),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: '#fff',
                            flexShrink: 0
                          }}>
                            {getInitials(entry.employeeName || currentUser?.name)}
                          </div>
                            {entry.employeeName || currentUser?.name}
                          </div>
                        </td>
                      </>
                    ) : null}
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>{entry.date || entry.createdAt?.slice(0, 10) || '--'}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)', color: entry.loginTime ? '#34d399' : 'var(--text-muted)' }}>{entry.loginTime || '--'}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)', color: entry.logoutTime ? '#f59e0b' : 'var(--text-muted)' }}>{entry.logoutTime || '--'}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>{entry.workingHours || '0h'}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: '999px', background: chip.bg, color: chip.color, fontSize: '0.75rem', fontWeight: 700 }}>
                        {entry.status || 'Present'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--glass-border)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {entry.officeRemote === 'Office' ? <Monitor size={12} /> : <MapPin size={12} />} {entry.officeRemote || 'Remote'}
                      </span>
                    </td>
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
};