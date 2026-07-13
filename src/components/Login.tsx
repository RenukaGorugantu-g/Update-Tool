import React from 'react';
import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Sparkles, CheckCircle2, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const clerkEnabled = Boolean((import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim());

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
              Secure employee authentication with Clerk. Use your company account to access updates, dashboards, and report workflows.
            </p>
            <div style={{ display: 'grid', gap: '12px', padding: '20px 22px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.16)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color='var(--accent-primary)' />
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Clerk is the only authentication path.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color='var(--accent-primary)' />
                <span style={{ color: 'var(--text-secondary)' }}>Sign in or create an account from the secure Clerk panel.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '34px 32px', border: '1px solid var(--glass-border)', maxWidth: '460px' }}>
          <div style={{ display: 'grid', gap: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 800 }}>Sign in</h2>
              <p style={{ marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Use Clerk for secure employee authentication.</p>
            </div>

            {!clerkEnabled ? (
              <div style={{ display: 'grid', gap: '8px', padding: '14px', background: 'rgba(245, 158, 11, 0.10)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '14px' }}>
                <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800 }}>Clerk is not enabled in this deployment.</p>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                  Set VITE_CLERK_PUBLISHABLE_KEY in your frontend environment to enable the Clerk sign-in flow.
                </p>
              </div>
            ) : (
              <>
                <SignedOut>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <SignInButton mode="modal">
                      <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        <LogIn size={16} />
                        Continue with Google / Work Email
                      </button>
                    </SignInButton>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                      Use your Google account or company email to enter the dashboard securely.
                    </p>
                  </div>
                </SignedOut>

                <SignedIn>
                  <div style={{ display: 'grid', gap: '10px', padding: '14px', background: 'var(--bg-primary)', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>Clerk session active.</p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.86rem' }}>Your signed-in session will now drive the dashboard and status report flow.</p>
                  </div>
                </SignedIn>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
