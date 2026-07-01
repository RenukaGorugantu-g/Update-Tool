import { useState, useEffect } from 'react';
import { usePulse } from './context/PulseContext';
import { Sidebar } from './components/Sidebar';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { OrgChart } from './components/OrgChart';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { IntegrationHub } from './components/IntegrationHub';
import { Login } from './components/Login';
import { WorkspaceHub } from './components/WorkspaceHub';

import { 
  Bell, 
  ChevronDown, 
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';

function App() {
  const { 
    currentUser, 
    notifications, 
    setNotifications,
    logout
  } = usePulse();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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
    if (activeTab === 'integrations' && role === 'employee') {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab]);



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
        if (currentUser.role === 'admin') return <AdminDashboard />;
        if (currentUser.role === 'executive') return <ExecutiveDashboard />;
        return <EmployeeDashboard />;
      case 'org':
        return <OrgChart />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'integrations':
        return <IntegrationHub />;
      case 'communications':
        return <WorkspaceHub />;
      case 'admin-panel':
        return <AdminDashboard />;
      default:
        return <EmployeeDashboard />;
    }
  };

  if (!currentUser) {
    return <Login />;
  }



  return (
    <div className="app-container">
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
            <span className={`badge ${currentUser.role === 'admin' ? 'badge-danger' : currentUser.role === 'executive' ? 'badge-indigo' : 'badge-success'}`} style={{ fontSize: '0.75rem', fontWeight: 800 }}>
              {currentUser.role === 'admin' ? 'CEO / Admin' : currentUser.role === 'executive' ? 'Executive Manager' : 'Employee'}
            </span>
          </div>

          {/* Right: Persona Switcher & Notifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            
            {/* User Profile dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifications(false);
                }}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.8rem',
                  padding: '6px 14px',
                  borderRadius: '24px',
                  gap: '8px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--card-shadow)',
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
                      <strong className={`badge ${currentUser.role === 'admin' ? 'badge-danger' : currentUser.role === 'executive' ? 'badge-indigo' : 'badge-success'}`} style={{ padding: '2px 8px', fontSize: '0.65rem' }}>
                        {currentUser.role === 'admin' ? 'CEO / Admin' : currentUser.role === 'executive' ? 'Executive' : 'Employee'}
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

                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '8px', display: 'flex', flexDirection: 'column' }}>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="btn"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        color: 'var(--accent-primary)',
                        background: 'rgba(221, 36, 118, 0.05)',
                        border: '1px solid rgba(221, 36, 118, 0.1)',
                        justifyContent: 'center',
                        borderRadius: '20px'
                      }}
                    >
                      Log Out
                    </button>
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
    </div>
  );
}

export default App;
