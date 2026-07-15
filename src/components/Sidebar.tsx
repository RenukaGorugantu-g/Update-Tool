import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { usePulse } from '../context/PulseContext';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Sun,
  Moon,
  Shield,
  Activity,
  MessageSquare,
  CalendarCheck2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { theme, setTheme, currentUser } = usePulse();
  const clerkEnabled = Boolean((import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim());

  if (!currentUser) return null;

  const getMenuItems = () => {
    const role = currentUser.role;
    const items = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'executive', 'employee'] },
      { id: 'checkins', label: 'Check-ins', icon: Activity, roles: ['admin', 'executive', 'employee'] },
      { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'executive', 'employee'] },
      { id: 'communications', label: 'Mail & Chat Clients', icon: MessageSquare, roles: ['admin', 'executive', 'employee'] },
      { id: 'org', label: 'Team Structure', icon: Users, roles: ['admin', 'executive', 'employee'] },
      { id: 'attendance', label: 'Attendance', icon: CalendarCheck2, roles: ['admin', 'executive', 'employee'] }
    ];

    if (role === 'admin' || role === 'executive' || role === 'employer') {
      items.push(
        { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3, roles: ['admin', 'executive', 'employer'] }
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
    <aside className="glass-card sidebar-condensed" style={{
      width: 'var(--sidebar-width)',
      height: 'calc(100vh - 32px)',
      margin: '16px 0 16px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '14px 12px',
      position: 'sticky',
      top: '16px',
      zIndex: 10,
      background: 'var(--sidebar-bg)',
      borderRadius: '10px',
      boxShadow: 'none'
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
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid transparent',
                  background: isActive ? 'rgba(var(--accent-primary-rgb), 0.12)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)' }} />
                <span style={{ display: 'inline-block', color: 'inherit' }}>{item.label}</span>
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

        {clerkEnabled ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 0' }}>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: '38px', height: '38px' } } }} />
          </div>
        ) : null}

        {/* Theme Settings Button Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)',
          padding: '4px',
          borderRadius: '8px',
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
