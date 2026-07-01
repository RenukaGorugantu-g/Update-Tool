import React, { useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Terminal, 
  Sun, 
  Moon, 
  Shield, 
  Activity,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { theme, setTheme, currentUser, users, setCurrentUser } = usePulse();
  const [showDemoConsole, setShowDemoConsole] = useState(false);

  if (!currentUser) return null;

  const getMenuItems = () => {
    const role = currentUser.role;
    const items = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'executive', 'employee'] },
      { id: 'communications', label: 'Mail & Chat Clients', icon: MessageSquare, roles: ['admin', 'executive', 'employee'] },
      { id: 'org', label: 'Team Structure', icon: Users, roles: ['admin', 'executive', 'employee'] }
    ];

    if (role === 'admin' || role === 'executive') {
      items.push(
        { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3, roles: ['admin', 'executive'] },
        { id: 'integrations', label: 'Integration Hub', icon: Terminal, roles: ['admin', 'executive'] }
      );
    }

    if (role === 'admin') {
      items.push(
        { id: 'admin-panel', label: 'Admin Control', icon: Shield, roles: ['admin'] }
      );
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="glass-card" style={{
      width: 'var(--sidebar-width)',
      height: 'calc(100vh - 32px)',
      margin: '16px 0 16px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      position: 'sticky',
      top: '16px',
      zIndex: 10
    }}>
      <div>
        {/* Brand Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 8px 24px 8px',
          borderBottom: '1px solid var(--glass-border)',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}>
            <Activity size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Maple Pulse
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Intelligence
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--border-radius-sm)',
                  border: 'none',
                  background: isActive ? 'var(--accent-light)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Theme Toggle */}
      <div style={{
        borderTop: '1px solid var(--glass-border)',
        paddingTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* User Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '4px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: currentUser.avatarColor || 'var(--accent-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser.name}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {currentUser.role === 'admin' ? 'CEO & Admin' : currentUser.role}
            </p>
          </div>
        </div>

        {/* Collapsible Demo Switch Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => setShowDemoConsole(!showDemoConsole)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px dashed var(--glass-border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              outline: 'none'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={12} style={{ color: 'var(--accent-primary)' }} />
              <span>🛠️ Demo Switch Console</span>
            </span>
            <span style={{ fontSize: '0.65rem' }}>{showDemoConsole ? '▲' : '▼'}</span>
          </button>

          {showDemoConsole && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              background: 'var(--bg-tertiary)',
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              maxHeight: '140px',
              overflowY: 'auto'
            }}>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => setCurrentUser(u)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: currentUser.id === u.id ? 'var(--accent-light)' : 'transparent',
                    color: currentUser.id === u.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: currentUser.id === u.id ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: u.avatarColor,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    fontWeight: 700
                  }}>
                    {u.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.name} ({u.role})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Settings Button Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)',
          padding: '4px',
          borderRadius: '20px',
          border: '1px solid var(--glass-border)'
        }}>
          <button
            onClick={() => setTheme('light')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 0',
              border: 'none',
              background: theme === 'light' ? 'var(--bg-secondary)' : 'transparent',
              color: theme === 'light' ? 'var(--accent-amber)' : 'var(--text-muted)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Sun size={16} />
          </button>
          <button
            onClick={() => setTheme('dark')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 0',
              border: 'none',
              background: theme === 'dark' ? 'var(--bg-secondary)' : 'transparent',
              color: theme === 'dark' ? 'var(--accent-indigo)' : 'var(--text-muted)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Moon size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
