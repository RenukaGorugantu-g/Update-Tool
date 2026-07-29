import { useState, useEffect, useRef } from 'react';
import { SignOutButton } from '@clerk/clerk-react';
import { usePulse } from './context/PulseContext';
import { Sidebar } from './components/Sidebar';
import { EmployeeDashboard } from './components/EmployeeDashboardRedesigned';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { OrgChart } from './components/OrgChart';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import Reports from './components/Reports';
import Checkins from './components/Checkins';
import { AttendanceDashboard } from './components/AttendanceDashboard';
import { Login } from './components/Login';
import { DailyLanding } from './components/Dailybot/DailyLanding';
import { WorkspaceHub } from './components/WorkspaceHub';
import { ClerkSessionBridge } from './components/ClerkSessionBridge';
import { ExecutiveAIChat } from './components/ExecutiveAIChat';

import { 
  Bell, 
  ChevronDown, 
  AlertTriangle,
  Info,
  CheckCircle2,
  LogOut,
  Pause,
  Play,
  Bot
} from 'lucide-react';
import LandingPage from './components/LandingPage';

const getApiBase = () => {
  const configuredBase = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/$/, '');
  if (configuredBase) {
    return configuredBase;
  }

  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }

  return 'https://update-tool.onrender.com';
};

const formatDurationLabel = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}h ${mins}m ${secs}s`;
};

function App() {
  const {
    currentUser,
    notifications,
    setNotifications,
    logout,
    recordAttendanceEvent
  } = usePulse();
  const clerkEnabled = Boolean((import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim());
  const [, setShowOnboarding] = useState(false);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [gmailConnectionState, setGmailConnectionState] = useState<'loading' | 'connected' | 'not-connected'>('loading');
  const [gmailFeedback, setGmailFeedback] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [attendanceWidgetActive, setAttendanceWidgetActive] = useState(false);
  const [attendanceWidgetPaused, setAttendanceWidgetPaused] = useState(false);
  const [attendanceWidgetElapsed, setAttendanceWidgetElapsed] = useState(0);
  const [attendanceWidgetAccumulatedSeconds, setAttendanceWidgetAccumulatedSeconds] = useState(0);
  const [attendanceWidgetStartedAt, setAttendanceWidgetStartedAt] = useState<number | null>(null);
  const attendanceWidgetLastTickRef = useRef(Date.now());
  const attendanceWidgetLastActivityRef = useRef(Date.now());
  const attendanceWidgetSessionFinalizedRef = useRef(false);
  const manualPauseRef = useRef(false);
  const ATTENDANCE_WIDGET_IDLE_TIMEOUT_SECONDS = 10 * 60;
  const apiBase = getApiBase();
  const attendanceWidgetStorageKey = currentUser?.id ? `pulse-attendance-widget-${currentUser.id}` : null;
  const isEmployeeView = currentUser?.role?.toLowerCase() === 'employee';
  const canUseAssistant = Boolean(currentUser && ['admin', 'super_admin', 'employer'].includes(currentUser.role));

  const persistGmailConnection = (email: string, connected: boolean) => {
    try {
      const stored = localStorage.getItem('pulse-gmail-connections');
      const parsed = stored ? JSON.parse(stored) : {};
      if (connected) {
        parsed[email] = true;
      } else {
        delete parsed[email];
      }
      localStorage.setItem('pulse-gmail-connections', JSON.stringify(parsed));
    } catch (error) {
      console.warn('Unable to update Gmail connection state:', error);
    }
  };

  const readGmailConnection = (email: string) => {
    if (!email) {
      return 'not-connected';
    }

    try {
      const stored = localStorage.getItem('pulse-gmail-connections');
      const parsed = stored ? JSON.parse(stored) : {};
      return parsed[email] ? 'connected' : 'not-connected';
    } catch (error) {
      console.warn('Unable to read Gmail connection state:', error);
      return 'not-connected';
    }
  };

  const connectGmail = async () => {
    if (!apiBase) {
      setGmailFeedback('Backend URL is not configured. Set VITE_API_BASE to your deployed backend URL, then redeploy the frontend.');
      setGmailConnectionState('not-connected');
      return;
    }

    try {
      const healthResponse = await fetch(`${apiBase}/api/health`);
      if (!healthResponse.ok) {
        throw new Error(`Backend health check failed with ${healthResponse.status}`);
      }
    } catch (error) {
      console.warn('Unable to reach backend before Gmail connect:', error);
      setGmailFeedback('Backend is not reachable. Start the backend locally or set VITE_API_BASE to your deployed backend URL.');
      setGmailConnectionState('not-connected');
      return;
    }

    window.location.href = `${apiBase}/auth/google?returnTo=${encodeURIComponent(window.location.origin)}`;
  };

  // When changing users, make sure the active tab is permitted for the new user's role
  useEffect(() => {
    if (!currentUser) return;
    const role = currentUser.role;
    if (activeTab === 'admin-panel' && role !== 'admin') {
      setActiveTab('dashboard');
    }
    if (activeTab === 'analytics' && role === 'employee') {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab]);

  // Disable multi-step onboarding: mark as seen immediately so modal never appears
  useEffect(() => {
    if (!currentUser) return;
    try {
      const key = `pulse-seen-onboarding-${currentUser.id}`;
      localStorage.setItem(key, '1');
      setShowOnboarding(false);
    } catch (err) {
      // ignore storage errors
    }
  }, [currentUser]);

  // Listen for external rerun onboarding requests
  useEffect(() => {
    // keep listener but default behavior will now immediately mark onboarding seen
    const handler = () => setShowOnboarding(false);
    window.addEventListener('pulse:rerun-onboarding', handler as EventListener);
    return () => window.removeEventListener('pulse:rerun-onboarding', handler as EventListener);
  }, []);

  // Listen for onboarding-driven navigation events
  useEffect(() => {
    const navHandler = (e: Event) => {
      try {
        const ev = e as CustomEvent<string>;
        if (ev.detail) setActiveTab(ev.detail as string);
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('pulse:setActiveTab', navHandler as EventListener);
    return () => window.removeEventListener('pulse:setActiveTab', navHandler as EventListener);
  }, []);

  // Fallback: hide onboarding when requested by modal
  useEffect(() => {
    const hideHandler = () => {
      setShowOnboarding(false);
      setActiveTab('dashboard');
      try {
        if (currentUser) localStorage.setItem(`pulse-seen-onboarding-${currentUser.id}`, '1');
      } catch (err) {}
    };
    window.addEventListener('pulse:hideOnboarding', hideHandler as EventListener);
    return () => window.removeEventListener('pulse:hideOnboarding', hideHandler as EventListener);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.email) {
      setGmailConnectionState('not-connected');
      return;
    }

    setGmailFeedback(null);
    const nextState = readGmailConnection(currentUser.email);
    setGmailConnectionState(nextState);

    const params = new URLSearchParams(window.location.search);
    const connectionStatus = params.get('gmail');
    if (connectionStatus === 'connected') {
      persistGmailConnection(currentUser.email, true);
      setGmailConnectionState('connected');
      setGmailFeedback('✓ Gmail Connected');
      const nextUrl = `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
      return;
    }

    if (connectionStatus === 'error') {
      const message = params.get('gmailMessage');
      setGmailFeedback(message ? decodeURIComponent(message) : 'Gmail connection failed. Please try again.');
      const nextUrl = `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
    }
  }, [currentUser]);

  const handleAttendanceWidgetAction = async (action: 'login' | 'logout') => {
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
      console.warn('Unable to detect public IP for attendance widget:', error);
    }

    const location: 'Office' | 'Remote' = detectedIpAddress ? 'Remote' : 'Remote';
    if (action === 'login') {
      attendanceWidgetSessionFinalizedRef.current = false;
      setAttendanceWidgetActive(true);
      setAttendanceWidgetPaused(false);
      setAttendanceWidgetElapsed(0);
      setAttendanceWidgetAccumulatedSeconds(0);
      setAttendanceWidgetStartedAt(now.getTime());
      attendanceWidgetLastTickRef.current = now.getTime();
      attendanceWidgetLastActivityRef.current = now.getTime();
    } else {
      const completedSeconds = Math.max(1, attendanceWidgetActive ? attendanceWidgetAccumulatedSeconds + (attendanceWidgetPaused ? 0 : attendanceWidgetElapsed) : attendanceWidgetAccumulatedSeconds);
      attendanceWidgetSessionFinalizedRef.current = true;
      setAttendanceWidgetActive(false);
      setAttendanceWidgetPaused(false);
      setAttendanceWidgetAccumulatedSeconds(completedSeconds);
      setAttendanceWidgetElapsed(0);
      setAttendanceWidgetStartedAt(null);
    }

    await recordAttendanceEvent({
      date,
      loginTime: action === 'login' ? time : '',
      logoutTime: action === 'logout' ? time : '',
      workingHours: action === 'logout' ? formatDurationLabel(attendanceWidgetActive ? attendanceWidgetAccumulatedSeconds + (attendanceWidgetPaused ? 0 : attendanceWidgetElapsed) : attendanceWidgetAccumulatedSeconds) : '0h 0m',
      status: 'Present',
      officeRemote: location,
      ipAddress: detectedIpAddress || 'Unknown',
      device: /Mobile/.test(ua) ? 'Mobile' : 'Desktop',
      browser,
      os
    });
  };

  const updateAttendanceWidgetLastActivity = () => {
    attendanceWidgetLastActivityRef.current = Date.now();
  };

  const pauseAttendanceWidgetForSuspend = () => {
    if (!attendanceWidgetActive || attendanceWidgetPaused || attendanceWidgetStartedAt === null) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - attendanceWidgetStartedAt) / 1000));
    setAttendanceWidgetAccumulatedSeconds((prev) => prev + elapsed);
    setAttendanceWidgetStartedAt(null);
    setAttendanceWidgetElapsed(0);
    setAttendanceWidgetPaused(true);
  };

  const toggleAttendanceWidgetPause = () => {
    if (!attendanceWidgetActive) return;
    if (!attendanceWidgetPaused) {
      manualPauseRef.current = true;
      if (attendanceWidgetStartedAt !== null) {
        const elapsed = Math.max(0, Math.floor((Date.now() - attendanceWidgetStartedAt) / 1000));
        setAttendanceWidgetAccumulatedSeconds((prev) => prev + elapsed);
      }
      setAttendanceWidgetStartedAt(null);
      setAttendanceWidgetElapsed(0);
      setAttendanceWidgetPaused(true);
    } else {
      manualPauseRef.current = false;
      const now = Date.now();
      attendanceWidgetLastTickRef.current = now;
      attendanceWidgetLastActivityRef.current = now;
      setAttendanceWidgetStartedAt(now);
      setAttendanceWidgetPaused(false);
      setAttendanceWidgetElapsed(0);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setAttendanceWidgetActive(false);
      setAttendanceWidgetPaused(false);
      setAttendanceWidgetElapsed(0);
      setAttendanceWidgetAccumulatedSeconds(0);
      setAttendanceWidgetStartedAt(null);
      attendanceWidgetSessionFinalizedRef.current = false;
      return;
    }

    if (!attendanceWidgetStorageKey) {
      setAttendanceWidgetActive(false);
      setAttendanceWidgetPaused(false);
      setAttendanceWidgetElapsed(0);
      setAttendanceWidgetAccumulatedSeconds(0);
      setAttendanceWidgetStartedAt(null);
      attendanceWidgetSessionFinalizedRef.current = false;
      return;
    }

    const saved = localStorage.getItem(attendanceWidgetStorageKey);
    if (saved) return;

    setAttendanceWidgetActive(false);
    setAttendanceWidgetPaused(false);
    setAttendanceWidgetElapsed(0);
    setAttendanceWidgetAccumulatedSeconds(0);
    setAttendanceWidgetStartedAt(null);
    attendanceWidgetSessionFinalizedRef.current = false;
  }, [attendanceWidgetStorageKey, currentUser?.id]);

  useEffect(() => {
    if (!attendanceWidgetStorageKey) return;
    try {
      const saved = localStorage.getItem(attendanceWidgetStorageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      if (parsed?.date !== today) {
        localStorage.removeItem(attendanceWidgetStorageKey);
        return;
      }

      setAttendanceWidgetActive(Boolean(parsed.active));
      setAttendanceWidgetPaused(Boolean(parsed.paused));
      setAttendanceWidgetAccumulatedSeconds(Number(parsed.accumulatedSeconds || 0));
      setAttendanceWidgetStartedAt(parsed.sessionStartedAt ? Number(parsed.sessionStartedAt) : null);
      if (Boolean(parsed.active) && !Boolean(parsed.paused) && parsed.sessionStartedAt) {
        setAttendanceWidgetElapsed(Math.max(0, Math.floor((Date.now() - Number(parsed.sessionStartedAt)) / 1000)));
        attendanceWidgetLastActivityRef.current = Date.now();
      }
    } catch (error) {
      console.warn('Unable to restore attendance widget state:', error);
    }
  }, [attendanceWidgetStorageKey]);

  useEffect(() => {
    if (!attendanceWidgetStorageKey) return;
    const payload = {
      date: new Date().toISOString().split('T')[0],
      active: attendanceWidgetActive,
      paused: attendanceWidgetPaused,
      accumulatedSeconds: attendanceWidgetAccumulatedSeconds,
      sessionStartedAt: attendanceWidgetStartedAt
    };
    if (attendanceWidgetActive || attendanceWidgetPaused || attendanceWidgetAccumulatedSeconds > 0) {
      localStorage.setItem(attendanceWidgetStorageKey, JSON.stringify(payload));
    } else {
      localStorage.removeItem(attendanceWidgetStorageKey);
    }
  }, [attendanceWidgetStorageKey, attendanceWidgetActive, attendanceWidgetPaused, attendanceWidgetAccumulatedSeconds, attendanceWidgetStartedAt]);

  useEffect(() => {
    if (!attendanceWidgetActive) {
      setAttendanceWidgetPaused(false);
      manualPauseRef.current = false;
      return;
    }

    const syncElapsed = () => {
      if (!attendanceWidgetActive || attendanceWidgetPaused || attendanceWidgetStartedAt === null) {
        setAttendanceWidgetElapsed(0);
        return;
      }
      setAttendanceWidgetElapsed(Math.max(0, Math.floor((Date.now() - attendanceWidgetStartedAt) / 1000)));
    };

    syncElapsed();
    const timer = window.setInterval(syncElapsed, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [attendanceWidgetActive, attendanceWidgetPaused, attendanceWidgetStartedAt]);

  useEffect(() => {
    if (!currentUser || !attendanceWidgetActive || attendanceWidgetPaused) return;

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel', 'scroll'];
    const activityHandler = () => updateAttendanceWidgetLastActivity();

    activityEvents.forEach((eventName) => window.addEventListener(eventName, activityHandler));
    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, activityHandler));
    };
  }, [attendanceWidgetActive, attendanceWidgetPaused, currentUser]);

  useEffect(() => {
    if (!attendanceWidgetActive || attendanceWidgetPaused) return;

    const checkIdle = () => {
      if (Date.now() - attendanceWidgetLastActivityRef.current >= ATTENDANCE_WIDGET_IDLE_TIMEOUT_SECONDS * 1000) {
        pauseAttendanceWidgetForSuspend();
      }
    };

    const idleTimer = window.setInterval(checkIdle, 1000);
    return () => window.clearInterval(idleTimer);
  }, [attendanceWidgetActive, attendanceWidgetPaused]);

  useEffect(() => {
    if (!currentUser || !attendanceWidgetActive) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateAttendanceWidgetLastActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [attendanceWidgetActive, currentUser]);

  const attendanceWidgetStatusLabel = !attendanceWidgetActive
    ? 'Not started'
    : attendanceWidgetPaused
      ? 'Paused'
      : 'Active now';

  const attendanceWidgetStatusDetail = !attendanceWidgetActive
    ? 'Clock in to start tracking your time.'
    : attendanceWidgetPaused
      ? 'Resume to continue tracking.'
      : 'Tracking your active time now.';

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'blocker': return <AlertTriangle size={14} style={{ color: 'var(--accent-primary)' }} />;
      case 'warning': return <AlertTriangle size={14} style={{ color: 'var(--accent-amber)' }} />;
      case 'success': return <CheckCircle2 size={14} style={{ color: 'var(--accent-emerald)' }} />;
      default: return <Info size={14} style={{ color: 'var(--accent-blue)' }} />;
    }
  };

  const renderActiveView = () => {
    if (!currentUser) return <Login />;
    switch (activeTab) {
      case 'dashboard':
        if (currentUser.role === 'admin' || currentUser.role === 'super_admin') return <AdminDashboard />;
        if (currentUser.role === 'executive' || currentUser.role === 'employer') return <ExecutiveDashboard />;
        return <EmployeeDashboard />;
      case 'checkins':
        if (currentUser.role === 'employee') return <Checkins />;
        return <AdminDashboard />;
      case 'org':
        return <OrgChart />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'reports':
        return <Reports />;
      case 'attendance':
        return <AttendanceDashboard />;
      case 'communications':
        return <WorkspaceHub />;
      case 'admin-panel':
        return <AdminDashboard />;
      default:
        return <EmployeeDashboard />;
    }
  };

  if (!currentUser) {
    // Public routes: root shows landing, /daily shows Daily preview
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (path.startsWith('/daily')) return <DailyLanding />;
    if (path === '/' || path === '/home' || path === '/landing') return <LandingPage />;
    return (
      <>
        {clerkEnabled ? <ClerkSessionBridge /> : null}
        <Login />
      </>
    );
  }

  return (
    <div className="app-container">
      {currentUser && canUseAssistant ? (
        <>
          <button
            type="button"
            onClick={() => setIsAssistantOpen(true)}
            style={{
              position: 'fixed',
              right: '16px',
              bottom: '84px',
              zIndex: 1500,
              border: 'none',
              borderRadius: '999px',
              padding: '10px 14px',
              background: 'linear-gradient(135deg, #ec4899 0%, #4f46e5 100%)',
              color: '#fff',
              boxShadow: '0 12px 28px rgba(79, 70, 229, 0.22)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 800,
              fontSize: '0.8rem'
            }}
          >
            <Bot size={16} />
            AI Assistant
          </button>
          <ExecutiveAIChat isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
        </>
      ) : null}
      {currentUser && isEmployeeView && attendanceWidgetActive ? (
        <div style={{ position: 'fixed', right: '14px', bottom: '14px', zIndex: 1600, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '14px', background: 'rgba(2, 8, 23, 0.94)', border: '1px solid rgba(52, 211, 153, 0.3)', boxShadow: '0 16px 38px rgba(0, 0, 0, 0.28)', color: '#f8fafc' }}>
          <div style={{ minWidth: '120px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: attendanceWidgetPaused ? '#fbbf24' : '#86efac', fontWeight: 700 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: attendanceWidgetPaused ? '#f59e0b' : '#34d399', display: 'inline-block' }} />
              {attendanceWidgetStatusLabel}
            </div>
            <div style={{ marginTop: '2px', fontSize: '0.96rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{formatDurationLabel(attendanceWidgetAccumulatedSeconds + (attendanceWidgetPaused ? 0 : attendanceWidgetElapsed))}</div>
            <div style={{ marginTop: '2px', fontSize: '0.68rem', color: '#cbd5e1' }}>{attendanceWidgetStatusDetail}</div>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button type="button" onClick={toggleAttendanceWidgetPause} style={{ border: 'none', borderRadius: '8px', padding: '6px 8px', background: attendanceWidgetPaused ? '#0f766e' : '#7c2d12', color: '#fff7ed', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {attendanceWidgetPaused ? <Play size={12} /> : <Pause size={12} />} {attendanceWidgetPaused ? 'Resume' : 'Pause'}
            </button>
            <button type="button" onClick={() => void handleAttendanceWidgetAction('logout')} style={{ border: 'none', borderRadius: '8px', padding: '6px 8px', background: '#7f1d1d', color: '#fff1f2', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LogOut size={12} /> Stop
            </button>
          </div>
        </div>
      ) : null}
      {clerkEnabled ? <ClerkSessionBridge /> : null}
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main style={{
        flex: 1,
        padding: '24px 32px',
        overflowY: 'auto',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Top Header */}
        <header className="glass-card" style={{
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--header-shadow)',
          borderRadius: 'var(--border-radius-md)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--bg-secondary)',
          overflow: 'visible'
        }}>
          {/* Left: Active Role Greeting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active Role:</span>
            <span className={`badge ${currentUser.role === 'admin' ? 'badge-danger' : currentUser.role === 'executive' || currentUser.role === 'employer' ? 'badge-indigo' : 'badge-success'}`} style={{ fontSize: '0.75rem', fontWeight: 800 }}>
              {currentUser.role === 'admin' ? 'CEO / Admin' : currentUser.role === 'executive' || currentUser.role === 'employer' ? 'Executive Manager' : 'Employee'}
            </span>
          </div>

          {/* Right: Persona Switcher & Notifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            {/* User Profile dropdown */}
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown);
                    setShowNotifications(false);
                  }}
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.8rem',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    gap: '8px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: currentUser.avatarColor || 'var(--accent-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
              </button>
              </div>

              {showUserDropdown && (
                <div className="glass-card" style={{
                  position: 'absolute',
                  top: '42px',
                  right: 0,
                  width: '290px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '16px',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                  zIndex: 99,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {/* Detailed User Card Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: currentUser.avatarColor || 'var(--accent-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 800
                    }}>
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {currentUser.name}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Role:</span>
                      <strong className={`badge ${currentUser.role === 'admin' ? 'badge-danger' : currentUser.role === 'executive' || currentUser.role === 'employer' ? 'badge-indigo' : 'badge-success'}`} style={{ padding: '2px 8px', fontSize: '0.65rem' }}>
                        {currentUser.role === 'admin' ? 'CEO / Admin' : currentUser.role === 'executive' || currentUser.role === 'employer' ? 'Executive' : 'Employee'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>ID:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{currentUser.employeeId}</strong>
                    </div>
                    {currentUser.role !== 'admin' && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Dept:</span>
                          <strong style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '140px' }}>
                            {currentUser.department}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Pod:</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{currentUser.pod}</strong>
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      background: 'var(--bg-tertiary)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      border: '1px solid var(--glass-border)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Gmail</span>
                        {gmailConnectionState === 'connected' ? (
                          <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓ Connected</span>
                        ) : (
                          <button
                            onClick={() => {
                              void connectGmail();
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '999px' }}
                          >
                            Connect Gmail
                          </button>
                        )}
                      </div>
                      {gmailFeedback && (
                        <span style={{ color: gmailConnectionState === 'connected' ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontSize: '0.68rem' }}>
                          {gmailFeedback}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          window.dispatchEvent(new CustomEvent('pulse:rerun-onboarding'));
                        }}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', borderRadius: '12px' }}
                      >
                        Run Tour
                      </button>
                      {clerkEnabled ? (
                        <SignOutButton>
                          <button
                            type="button"
                            onClick={() => {
                              setShowUserDropdown(false);
                              logout();
                            }}
                            className="btn"
                            style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', color: 'var(--accent-primary)', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16,185,129,0.08)', justifyContent: 'center', borderRadius: '12px' }}
                          >
                            Log Out
                          </button>
                        </SignOutButton>
                      ) : (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            logout();
                          }}
                          className="btn"
                          style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', color: 'var(--accent-primary)', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16,185,129,0.08)', justifyContent: 'center', borderRadius: '12px' }}
                        >
                          Log Out
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserDropdown(false);
                  if (!showNotifications) markAllNotificationsAsRead();
                }}
                className="btn btn-secondary"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  padding: 0,
                  position: 'relative'
                }}
              >
                <Bell size={16} />
                {getUnreadNotificationsCount() > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'var(--accent-primary)',
                    borderRadius: '50%'
                  }}></span>
                )}
              </button>

              {showNotifications && (
                <div className="glass-card" style={{
                  position: 'absolute',
                  top: '42px',
                  right: 0,
                  width: '320px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  zIndex: 99
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--glass-border)',
                    paddingBottom: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>Blockers & Alerts</span>
                    <button
                      onClick={() => setNotifications([])}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.65rem', cursor: 'pointer' }}
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '240px' }}>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        No system notifications.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '8px',
                          borderRadius: '6px',
                          background: 'var(--bg-tertiary)',
                          fontSize: '0.75rem'
                        }}>
                          <div style={{ marginTop: '2px' }}>{getNotifIcon(n.type)}</div>
                          <div style={{ flex: 1 }}>
                            <p style={{ color: 'var(--text-primary)', lineHeight: '1.4' }}>{n.text}</p>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Content Pane */}
        <div style={{ flex: 1 }}>
          {renderActiveView()}
        </div>
      </main>
      {/* Onboarding modal disabled: onboarding is marked seen on login */}
    </div>
  );
}

export default App;
