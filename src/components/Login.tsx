import React, { useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { Shield, Sparkles, LogIn, Lock, User, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, users } = usePulse();
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Separate users by role for demo convenience
  const admins = users.filter(u => u.role === 'admin');
  const executives = users.filter(u => u.role === 'executive');
  const employees = users.filter(u => u.role === 'employee');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim() || !password.trim()) {
      setErrorMsg('Please enter both email/ID and password.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    // Simulate network delay for premium feel
    setTimeout(() => {
      const success = login(loginInput, password);
      setLoading(false);
      if (!success) {
        setErrorMsg('Invalid credentials or account is deactivated. Please try again.');
      }
    }, 800);
  };

  const handleQuickLogin = (emailOrId: string, pass: string) => {
    setLoginInput(emailOrId);
    setPassword(pass);
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const success = login(emailOrId, pass);
      setLoading(false);
      if (!success) {
        setErrorMsg('Deactivated account or wrong password.');
      }
    }, 400);
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
      {/* Decorative ambient background glows */}
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
        {/* Left Side: Brand presentation */}
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

        {/* Right Side: Login Form Card */}
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
              Sign in using your corporate email or Employee ID
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
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  required
                />
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

          {/* Quick Demo Access Console */}
          <div style={{
            borderTop: '1px solid var(--glass-border)',
            paddingTop: '20px',
            marginTop: '8px'
          }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: 'var(--accent-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px'
            }}>
              <Shield size={12} />
              <span>Developer Quick Demo Console</span>
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Admin Card */}
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>CEO Admin</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {admins.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleQuickLogin(user.email, user.password || 'admin')}
                      className="chip"
                      style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                    >
                      {user.name} ({user.employeeId})
                    </button>
                  ))}
                </div>
              </div>

              {/* Executives Card */}
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>Executive Boards</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {executives.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleQuickLogin(user.email, user.password || 'executive')}
                      className="chip"
                      style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                    >
                      {user.name.split(' ')[0]} ({user.employeeId})
                    </button>
                  ))}
                </div>
              </div>

              {/* Employees Card */}
              {employees.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>Employees</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '72px', overflowY: 'auto' }}>
                    {employees.map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleQuickLogin(user.employeeId, user.password || 'password')}
                        className="chip"
                        style={{ fontSize: '0.7rem', padding: '4px 8px', borderStyle: 'dashed' }}
                      >
                        {user.name.split(' ')[0]} ({user.employeeId})
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
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
