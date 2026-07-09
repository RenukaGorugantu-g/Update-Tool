import React, { useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { Sparkles, Lock, CheckCircle2, Eye, EyeOff, RotateCcw, LogIn } from 'lucide-react';

const getApiBase = () => {
  const configuredBase = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/$/, '');
  if (configuredBase) {
    return configuredBase;
  }

  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }

  return '';
};

export const Login: React.FC = () => {
  const { login, users, setUsers } = usePulse();
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPanel, setShowResetPanel] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showConfirmResetPassword, setShowConfirmResetPassword] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [resetting, setResetting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim() || !password.trim()) {
      setErrorMsg('Please enter both email/ID and password.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const success = login(loginInput, password);
      setLoading(false);
      if (!success) {
        // Provide detailed error message with demo account info
        const demoAccounts = users
          .filter(u => u.active)
          .slice(0, 2)
          .map(u => `${u.email}`)
          .join(', ');
        
        setErrorMsg(
          `Invalid credentials. Try demo accounts: ${demoAccounts || 'Check admin panel'}. All passwords end with current year (e.g., @Pulse2026!)`
        );
      }
    }, 800);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setResetMsg('Please enter your email/ID and choose a new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetMsg('The new passwords do not match.');
      return;
    }

    const targetUser = users.find(
      user => user.email.toLowerCase() === resetIdentifier.trim().toLowerCase() || user.employeeId.toLowerCase() === resetIdentifier.trim().toLowerCase()
    );

    if (!targetUser) {
      setResetMsg('No matching account found. Please check your email or employee ID.');
      return;
    }

    setResetting(true);
    setResetMsg('');

    setTimeout(async () => {
      const updatedUsers = users.map(user => user.id === targetUser.id ? { ...user, password: newPassword } : user);
      setUsers(updatedUsers);
      const apiBase = getApiBase();
      if (apiBase) {
        try {
          await fetch(`${apiBase}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUsers)
          });
        } catch (error) {
          console.warn('Unable to persist password reset to backend:', error);
        }
      }
      setResetting(false);
      setResetMsg('Password updated successfully. You can now sign in with your new password.');
      setResetIdentifier('');
      setNewPassword('');
      setConfirmPassword('');
      setShowResetPanel(false);
      setLoginInput(targetUser.email);
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top left, rgba(16, 185, 129, 0.12), transparent 28%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.1), transparent 34%), var(--bg-primary)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        width: '420px',
        height: '420px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, rgba(255,255,255,0) 65%)',
        top: '-8%',
        left: '-6%',
        zIndex: 1,
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        width: '340px',
        height: '340px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.14) 0%, rgba(255,255,255,0) 72%)',
        bottom: '-12%',
        right: '-6%',
        zIndex: 1,
        pointerEvents: 'none'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '980px',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '32px',
        zIndex: 2,
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 20px 48px rgba(16, 185, 129, 0.18)'
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-primary)' }}>
                Maple Pulse
              </p>
              <h1 style={{ margin: '10px 0 0', fontSize: '2.2rem', lineHeight: 1.05, fontWeight: 900 }}>
                Login to your team status dashboard
              </h1>
            </div>
          </div>

          <div style={{ maxWidth: '560px', display: 'grid', gap: '16px' }}>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              Fast sign-in for managers and contributors, with secure access to updates and a polished dashboard experience. Comments continue to route through Google Chat exactly as before.
            </p>
            <div style={{ display: 'grid', gap: '12px', padding: '20px 22px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.16)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color='var(--accent-primary)' />
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Auto-save updates locally and sync them securely.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={18} color='var(--accent-secondary)' />
                <span style={{ color: 'var(--text-secondary)' }}>Passwords stay in your session and demo accounts are ready to try.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '34px 32px', border: '1px solid var(--glass-border)', maxWidth: '460px' }}>
          <div style={{ display: 'grid', gap: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 800 }}>Sign in</h2>
              <p style={{ marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Use your email or employee ID to continue.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <label style={{ display: 'grid', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Email or employee ID
                <input
                  type="text"
                  value={loginInput}
                  onChange={(event) => setLoginInput(event.target.value)}
                  placeholder="name@company.com or EMP123"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Password
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '0 12px' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    style={{ width: '100%', padding: '14px 0', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {errorMsg && (
                <div style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.9rem' }}>{errorMsg}</div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <LogIn size={16} />
                {loading ? 'Signing in…' : 'Continue'
                }
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <button type="button" onClick={() => setShowResetPanel((prev) => !prev)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '12px 14px' }}>
                {showResetPanel ? 'Close reset' : 'Forgot password'}
              </button>
              <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '12px 14px' }}>
                Demo login
              </button>
            </div>

            {showResetPanel && (
              <div style={{ display: 'grid', gap: '14px', padding: '18px', background: 'var(--bg-primary)', borderRadius: '18px', border: '1px solid var(--glass-border)' }}>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Reset your password with your email or employee ID.</p>
                <label style={{ display: 'grid', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Email or ID
                  <input
                    type="text"
                    value={resetIdentifier}
                    onChange={(event) => setResetIdentifier(event.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--glass-border)', background: 'var(--bg-tertiary)' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  New password
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--glass-border)', background: 'var(--bg-tertiary)' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Confirm password
                  <input
                    type={showConfirmResetPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--glass-border)', background: 'var(--bg-tertiary)' }}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Reset password
                </button>
                {resetMsg && <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{resetMsg}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
