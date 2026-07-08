import React, { useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { Sparkles, LogIn, Lock, User, CheckCircle2, Eye, EyeOff, RotateCcw } from 'lucide-react';

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
        setErrorMsg('Invalid credentials or account is deactivated. Please try again.');
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
      background: 'var(--bg-primary)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(221, 36, 118, 0.08) 0%, rgba(0,0,0,0) 70%)',
        top: '-10%',
        left: '-10%',
        zIndex: 1,
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(0,0,0,0) 70%)',
        bottom: '-15%',
        right: '-10%',
        zIndex: 1,
        pointerEvents: 'none'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '920px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '32px',
        zIndex: 2,
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 8px 20px rgba(221, 36, 118, 0.3)'
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                background: 'var(--gradient-brand)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1
              }}>
                Maple Pulse
              </h1>
              <span style={{
                fontSize: '0.8rem',
                color: 'var(--accent-indigo)',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Employee Update Intelligence
              </span>
            </div>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: '1.3' }}>
            The Central Nervous System for High-Performing Organizations.
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Collect daily status updates, transcribe vocal progress reports using AI, and empower executives with instant analytical insights.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ color: 'var(--accent-emerald)', marginTop: '2px' }}><CheckCircle2 size={16} /></div>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>AI Vocal Transcriptions</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Employees dictate updates; AI categorizes accomplishments, plans, & blockers.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ color: 'var(--accent-indigo)', marginTop: '2px' }}><CheckCircle2 size={16} /></div>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>Automated Comments & Escalations</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Direct manager follow-ups pushed straight to Google Chat spaces and Gmail APIs.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{
          padding: '36px',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          borderRadius: 'var(--border-radius-lg)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
              Welcome Back
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Sign in with your work email or employee ID.
            </p>
          </div>

          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label htmlFor="login-input" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Email Address / Employee ID</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                <input
                  id="login-input"
                  type="text"
                  placeholder="e.g. sandeep@maplelearningsolutions.com or MP-0001"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password-input" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px', paddingRight: '42px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.9rem',
                justifyContent: 'center',
                marginTop: '6px'
              }}
            >
              {loading ? (
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '3px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}></div>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setShowResetPanel(prev => !prev);
                setResetIdentifier(loginInput);
                setResetMsg('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.8rem'
              }}
            >
              <RotateCcw size={14} />
              <span>Reset password</span>
            </button>

            {showResetPanel && (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <div>
                  <label htmlFor="reset-identifier" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Email Address / Employee ID</label>
                  <input
                    id="reset-identifier"
                    type="text"
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    placeholder="Enter work email or employee ID"
                  />
                </div>
                <div>
                  <label htmlFor="new-password" style={{ fontSize: '0.75rem', fontWeight: 700 }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                    <input
                      id="new-password"
                      type={showResetPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Choose a new password"
                      style={{ paddingLeft: '38px', paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(prev => !prev)}
                      style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                    >
                      {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                    <input
                      id="confirm-password"
                      type={showConfirmResetPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      style={{ paddingLeft: '38px', paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmResetPassword(prev => !prev)}
                      style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      aria-label={showConfirmResetPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {resetMsg && (
                  <div style={{ fontSize: '0.75rem', color: resetMsg.includes('successfully') ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                    {resetMsg}
                  </div>
                )}
                <button type="submit" className="btn btn-secondary" disabled={resetting} style={{ justifyContent: 'center' }}>
                  {resetting ? 'Updating...' : 'Save New Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
