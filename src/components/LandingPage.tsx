import React from 'react';
import { useState } from 'react';
import './landing.css';

const LandingPage: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="landing-root landing-home-short">
      <header className="landing-hero landing-hero-short">
        <div className="hero-left">
          <span className="hero-pill">Daily updates. Smarter decisions.</span>
          <h1>Make daily standups delightful — fast, focused, and actionable.</h1>
          <p className="lead">A single place for quick status updates, transparent blockers, and reliable Google Chat delivery so teams move faster.</p>
          <div className="hero-cta">
            <button className="btn btn-primary hero-cta-primary" onClick={() => { window.location.pathname = '/login'; }}>
              <span>Get Started</span>
            </button>
            <button className="btn btn-secondary hero-cta-ghost" onClick={() => setShowDemo(true)}>Preview the workflow</button>
          </div>
          <div className="landing-features">
            <div className="feature-pill">Quick login & secure access</div>
            <div className="feature-pill">Update history saved automatically</div>
            <div className="feature-pill">Comments forwarded to Google Chat</div>
          </div>
        </div>

        <div className="hero-right">
          <div className="device-mock glass-card">
            <div className="device-left">
              <div className="pulse-card">
                <div className="pulse-title">DAILY PULSE</div>
                <div className="field">Employee</div>
                <div className="avatar-row"><div className="avatar"/> <div className="avatar-name">Alex Randse</div></div>
                <textarea className="pulse-input" placeholder="Write your update here..." />
                <div className="mood-row">
                  <button className="mood-btn active" />
                  <button className="mood-btn" />
                  <button className="mood-btn" />
                  <button className="mood-btn" />
                </div>
                <button className="btn btn-success pulse-submit">Submit Pulse</button>
              </div>
            </div>
            <div className="device-right">
              <div className="team-feed">
                <div className="feed-card">
                  <h4>AI Pulse Check</h4>
                  <p>Welcome to your AI pulse — short summary and trends for the team.</p>
                </div>
                <div className="feed-grid">
                  <div className="feed-small">Productivity Trends</div>
                  <div className="feed-small">Team Sentiment</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="notification-bubble">
            <div className="bubble-head">New</div>
            <div className="bubble-body">
              <div className="bubble-title">Krishna submitted a blocker</div>
              <div className="bubble-sub">"Waiting on API keys from infra"</div>
            </div>
          </div>
      </header>

      <div className="landing-badges">
        <span>Trusted by teams that move fast</span>
        <div className="badges-row">
          <span>Engineering</span>
          <span>Product</span>
          <span>Customer Success</span>
          <span>Operations</span>
        </div>
      </div>

      <section className="optimized-row">
        <div className="optimized-inner">
          <div className="opt-pill">Development</div>
          <div className="opt-pill">Marketing</div>
          <div className="opt-pill">Sales</div>
          <div className="opt-pill">eLearning</div>
          <div className="opt-pill">Client Success</div>
          <div className="opt-pill">Executive Board</div>
        </div>
      </section>

      <section className="how-it-works">
        <h3>How Maple Pulse Works</h3>
        <p className="lead">A seamless workflow designed for clarity and speed. From the individual contributor to the CEO.</p>
        <div className="how-grid">
          <div className="how-card">
            <div className="how-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15 8H9L12 2Z" fill="#10B981"/><path d="M4 22H20V20C20 16 16 12 12 12C8 12 4 16 4 20V22Z" fill="#059669"/></svg>
            </div>
            <h4>Login</h4>
            <p>SSO access with Google Workspace or Microsoft 365.</p>
          </div>
          <div className="how-card">
            <div className="how-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="14" rx="2" stroke="#10B981" strokeWidth="1.2"/><circle cx="8" cy="11" r="1.5" fill="#10B981"/></svg>
            </div>
            <h4>Submit Update</h4>
            <p>Team members share status and blockers in seconds.</p>
          </div>
          <div className="how-card">
            <div className="how-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 6C8 6 4 8 4 12C4 16 8 18 12 18C16 18 20 16 20 12C20 8 16 6 12 6Z" stroke="#059669" strokeWidth="1.2"/><path d="M8 12H16" stroke="#10B981" strokeWidth="1.2"/></svg>
            </div>
            <h4>Manager Review</h4>
            <p>Managers receive instant reports for quick action.</p>
          </div>
          <div className="how-card">
            <div className="how-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H21V21H3V3Z" stroke="#10B981" strokeWidth="1.2"/><path d="M7 7H17V11H7V7Z" fill="#10B981"/></svg>
            </div>
            <h4>Executive Insights</h4>
            <p>AI aggregates trends across departments for leaders.</p>
          </div>
        </div>
      </section>

      {showDemo && (
        <div className="demo-overlay" onClick={() => setShowDemo(false)}>
          <div className="demo-card glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>Workflow preview</h3>
            <p>This is a lightweight preview of the Daily check-in flow and real-time update table.</p>
            <button className="btn btn-primary" onClick={() => { setShowDemo(false); window.location.pathname = '/daily'; }}>Open preview</button>
          </div>
        </div>
      )}

      <div className="landing-cta-band">
        <div className="cta-inner">
          <div>
            <h3>Start collecting check-ins your team will actually use</h3>
            <p className="lead" style={{ margin: 0 }}>Fast onboarding, reliable notifications, and richer context for every update.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={() => { window.location.pathname = '/login'; }}>Get Started</button>
            <button className="btn btn-secondary" onClick={() => setShowDemo(true)}>Preview</button>
          </div>
        </div>
      </div>

      <section className="platform-features">
        <h3>Platform Features</h3>
        <p className="lead">Everything you need to eliminate status meetings.</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="fc-icon">✅</div>
            <h4>Daily Updates</h4>
            <p>Automated reminders and simple forms that increase participation rates.</p>
          </div>
          <div className="feature-card">
            <div className="fc-icon">🤖</div>
            <h4>AI Summaries</h4>
            <p>GPT-powered summaries that distill updates into concise insights.</p>
          </div>
          <div className="feature-card">
            <div className="fc-icon">💬</div>
            <h4>Google Chat</h4>
            <p>Native integration that pushes notifications to team chat spaces.</p>
          </div>
          <div className="feature-card">
            <div className="fc-icon">📧</div>
            <h4>Email Automation</h4>
            <p>Custom reporting loops for stakeholders who prefer inbox updates.</p>
          </div>
        </div>
      </section>

      <section className="lifecycle">
        <h3>The Maple Pulse Lifecycle</h3>
        <div className="lifecycle-strip">
          <div className="step">Employee</div>
          <div className="step">Manager</div>
          <div className="step">Google Chat</div>
          <div className="step">Executive Dashboard</div>
          <div className="step active">AI Reports</div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
