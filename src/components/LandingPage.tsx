// import React from 'react';
// import { useState } from 'react';
// import './landing.css';

// const LandingPage: React.FC = () => {
//   const [showDemo, setShowDemo] = useState(false);

//   return (
//     <div className="landing-root landing-home-short">
//       <header className="landing-hero landing-hero-short">
//         <div className="hero-left">
//           <span className="hero-pill">Daily updates. Smarter decisions.</span>
//           <h1>Make daily standups delightful — fast, focused, and actionable.</h1>
//           <p className="lead">A single place for quick status updates, transparent blockers, and reliable Google Chat delivery so teams move faster.</p>
//           <div className="hero-cta">
//             <button className="btn btn-primary hero-cta-primary" onClick={() => { window.location.pathname = '/login'; }}>
//               <span>Get Started</span>
//             </button>
//             <button className="btn btn-secondary hero-cta-ghost" onClick={() => setShowDemo(true)}>Preview the workflow</button>
//           </div>
//           <div className="landing-features">
//             <div className="feature-pill">Quick login & secure access</div>
//             <div className="feature-pill">Update history saved automatically</div>
//             <div className="feature-pill">Comments forwarded to Google Chat</div>
//           </div>
//         </div>

//         <div className="hero-right">
//           <div className="device-mock glass-card">
//             <div className="device-left">
//               <div className="pulse-card">
//                 <div className="pulse-title">DAILY PULSE</div>
//                 <div className="field">Employee</div>
//                 <div className="avatar-row"><div className="avatar"/> <div className="avatar-name">Alex Randse</div></div>
//                 <textarea className="pulse-input" placeholder="Write your update here..." />
//                 <div className="mood-row">
//                   <button className="mood-btn active" />
//                   <button className="mood-btn" />
//                   <button className="mood-btn" />
//                   <button className="mood-btn" />
//                 </div>
//                 <button className="btn btn-success pulse-submit">Submit Pulse</button>
//               </div>
//             </div>
//             <div className="device-right">
//               <div className="team-feed">
//                 <div className="feed-card">
//                   <h4>AI Pulse Check</h4>
//                   <p>Welcome to your AI pulse — short summary and trends for the team.</p>
//                 </div>
//                 <div className="feed-grid">
//                   <div className="feed-small">Productivity Trends</div>
//                   <div className="feed-small">Team Sentiment</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="notification-bubble">
//             <div className="bubble-head">New</div>
//             <div className="bubble-body">
//               <div className="bubble-title">Krishna submitted a blocker</div>
//               <div className="bubble-sub">"Waiting on API keys from infra"</div>
//             </div>
//           </div>
//       </header>

//       <div className="landing-badges">
//         <span>Trusted by teams that move fast</span>
//         <div className="badges-row">
//           <span>Engineering</span>
//           <span>Product</span>
//           <span>Customer Success</span>
//           <span>Operations</span>
//         </div>
//       </div>

//       <section className="optimized-row">
//         <div className="optimized-inner">
//           <div className="opt-pill">Development</div>
//           <div className="opt-pill">Marketing</div>
//           <div className="opt-pill">Sales</div>
//           <div className="opt-pill">eLearning</div>
//           <div className="opt-pill">Client Success</div>
//           <div className="opt-pill">Executive Board</div>
//         </div>
//       </section>

//       <section className="how-it-works">
//         <h3>How Maple Pulse Works</h3>
//         <p className="lead">A seamless workflow designed for clarity and speed. From the individual contributor to the CEO.</p>
//         <div className="how-grid">
//           <div className="how-card">
//             <div className="how-icon">
//               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15 8H9L12 2Z" fill="#10B981"/><path d="M4 22H20V20C20 16 16 12 12 12C8 12 4 16 4 20V22Z" fill="#059669"/></svg>
//             </div>
//             <h4>Login</h4>
//             <p>SSO access with Google Workspace or Microsoft 365.</p>
//           </div>
//           <div className="how-card">
//             <div className="how-icon">
//               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="14" rx="2" stroke="#10B981" strokeWidth="1.2"/><circle cx="8" cy="11" r="1.5" fill="#10B981"/></svg>
//             </div>
//             <h4>Submit Update</h4>
//             <p>Team members share status and blockers in seconds.</p>
//           </div>
//           <div className="how-card">
//             <div className="how-icon">
//               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 6C8 6 4 8 4 12C4 16 8 18 12 18C16 18 20 16 20 12C20 8 16 6 12 6Z" stroke="#059669" strokeWidth="1.2"/><path d="M8 12H16" stroke="#10B981" strokeWidth="1.2"/></svg>
//             </div>
//             <h4>Manager Review</h4>
//             <p>Managers receive instant reports for quick action.</p>
//           </div>
//           <div className="how-card">
//             <div className="how-icon">
//               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H21V21H3V3Z" stroke="#10B981" strokeWidth="1.2"/><path d="M7 7H17V11H7V7Z" fill="#10B981"/></svg>
//             </div>
//             <h4>Executive Insights</h4>
//             <p>AI aggregates trends across departments for leaders.</p>
//           </div>
//         </div>
//       </section>

//       {showDemo && (
//         <div className="demo-overlay" onClick={() => setShowDemo(false)}>
//           <div className="demo-card glass-card" onClick={(e) => e.stopPropagation()}>
//             <h3>Workflow preview</h3>
//             <p>This is a lightweight preview of the Daily check-in flow and real-time update table.</p>
//             <button className="btn btn-primary" onClick={() => { setShowDemo(false); window.location.pathname = '/daily'; }}>Open preview</button>
//           </div>
//         </div>
//       )}

//       <div className="landing-cta-band">
//         <div className="cta-inner">
//           <div>
//             <h3>Start collecting check-ins your team will actually use</h3>
//             <p className="lead" style={{ margin: 0 }}>Fast onboarding, reliable notifications, and richer context for every update.</p>
//           </div>
//           <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
//             <button className="btn btn-primary" onClick={() => { window.location.pathname = '/login'; }}>Get Started</button>
//             <button className="btn btn-secondary" onClick={() => setShowDemo(true)}>Preview</button>
//           </div>
//         </div>
//       </div>

//       <section className="platform-features">
//         <h3>Platform Features</h3>
//         <p className="lead">Everything you need to eliminate status meetings.</p>
//         <div className="features-grid">
//           <div className="feature-card">
//             <div className="fc-icon">✅</div>
//             <h4>Daily Updates</h4>
//             <p>Automated reminders and simple forms that increase participation rates.</p>
//           </div>
//           <div className="feature-card">
//             <div className="fc-icon">🤖</div>
//             <h4>AI Summaries</h4>
//             <p>GPT-powered summaries that distill updates into concise insights.</p>
//           </div>
//           <div className="feature-card">
//             <div className="fc-icon">💬</div>
//             <h4>Google Chat</h4>
//             <p>Native integration that pushes notifications to team chat spaces.</p>
//           </div>
//           <div className="feature-card">
//             <div className="fc-icon">📧</div>
//             <h4>Email Automation</h4>
//             <p>Custom reporting loops for stakeholders who prefer inbox updates.</p>
//           </div>
//         </div>
//       </section>

//       <section className="lifecycle">
//         <h3>The Maple Pulse Lifecycle</h3>
//         <div className="lifecycle-strip">
//           <div className="step">Employee</div>
//           <div className="step">Manager</div>
//           <div className="step">Google Chat</div>
//           <div className="step">Executive Dashboard</div>
//           <div className="step active">AI Reports</div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default LandingPage;
import React, { useState } from 'react';
import './landing.css';

const LandingPage: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);

  const goto = (path: string) => {
    window.location.pathname = path;
  };

  return (
    <div className="pulse-landing">
      {/* ============ NAVBAR ============ */}
      <nav className="navbar">
        <div className="navbar-inner">
          <img
            className="navbar-logo"
            src="https://framerusercontent.com/images/sOF8vdyAVOEvCEsxVJEhhV6lY.png?scale-down-to=512&width=2070&height=922"
            alt="Maple Pulse logo"
          />
          <button className="btn btn-primary navbar-signup" onClick={() => goto('/login')}>
            Sign up
          </button>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Built for Maple's teams
          </span>
          <h1>
            Standups your team
            <br />
            actually finishes.
          </h1>
          <p className="lead">
            One quick check-in a day. PulseHQ turns it into a clean report for
            managers, a mood trend for leadership, and a blocker nobody
            forgets — delivered straight to Google Chat.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => goto('/login')}>
              Get started
            </button>
            <button className="btn btn-ghost" onClick={() => setShowDemo(true)}>
              <span className="play-dot" />
              See how it works
            </button>
          </div>
          <div className="trust-row">
            <span>No meetings to schedule</span>
            <span className="trust-sep">·</span>
            <span>2 minutes a day</span>
            <span className="trust-sep">·</span>
            <span>Reports write themselves</span>
          </div>
        </div>

        <div className="hero-scene" aria-hidden="true">
          <svg className="pulse-line" viewBox="0 0 480 60" preserveAspectRatio="none">
            <path
              d="M0 30 L90 30 L110 8 L130 52 L150 30 L480 30"
              fill="none"
              stroke="var(--jade)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="chat-card">
            <div className="chat-card-head">
              <span className="chat-dot" />
              Daily Pulse · #product-team
            </div>
            <div className="chat-thread">
              <div className="bubble bubble-bot">
                Morning, Team 👋 What did you ship yesterday?
              </div>
              <div className="bubble bubble-user delay-1">
                Wrapped the audit report export and fixed the Brevo merge tags.
              </div>
              <div className="bubble bubble-bot delay-2">
                Nice. Anything blocking you today?
              </div>
              <div className="bubble bubble-user delay-3">
                Waiting on API keys from infra.
              </div>
              <div className="mood-strip delay-4">
                <span>How's it feeling today?</span>
                <div className="mood-dots">
                  <button className="mood-dot" />
                  <button className="mood-dot mood-active" />
                  <button className="mood-dot" />
                  <button className="mood-dot" />
                </div>
              </div>
            </div>
          </div>

          <div className="report-card delay-5">
            <div className="report-head">
              <span className="report-icon">✓</span>
              Compiled for your manager
            </div>
            <div className="report-row">
              <span className="report-tag tag-done">Shipped</span>
              Audit export, Brevo merge tags
            </div>
            <div className="report-row">
              <span className="report-tag tag-block">Blocker</span>
              Infra API keys — flagged to Renuka
            </div>
            <div className="report-row report-mood">
              <span className="report-tag tag-mood">Mood</span>
              Team trending steady this week
            </div>
          </div>
        </div>
      </header>

      {/* ============ DEPARTMENT STRIP ============ */}
      <section className="dept-strip">
        <p className="dept-label">Already running check-ins across</p>
        <div className="dept-row">
          <span>Development</span>
          <span>LMS</span>
          <span>Marketing</span>
          <span>Creative</span>
          <span>Client Success</span>
          <span>Analytics</span>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="how">
        <div className="section-head">
          <span className="eyebrow eyebrow-muted">The flow</span>
          <h2>Four steps, one habit</h2>
          <p className="lead">
            From a single reply in chat to an insight on the exec dashboard —
            nothing in between requires a meeting.
          </p>
        </div>

        <ol className="how-grid">
          <li className="how-card">
            <span className="how-index">01</span>
            <h3>Sign in once</h3>
            <p>SSO with Google Workspace or Microsoft 365 — no new password to remember.</p>
          </li>
          <li className="how-card">
            <span className="how-index">02</span>
            <h3>Answer three prompts</h3>
            <p>What shipped, what's next, what's blocking you. Takes under two minutes.</p>
          </li>
          <li className="how-card">
            <span className="how-index">03</span>
            <h3>Manager gets the digest</h3>
            <p>Updates land as one readable report the moment the team finishes.</p>
          </li>
          <li className="how-card">
            <span className="how-index">04</span>
            <h3>Leadership sees the trend</h3>
            <p>AI rolls updates across departments into patterns worth acting on.</p>
          </li>
        </ol>
      </section>

      {showDemo && (
        <div className="demo-overlay" onClick={() => setShowDemo(false)}>
          <div className="demo-card" onClick={(e) => e.stopPropagation()}>
            <button className="demo-close" onClick={() => setShowDemo(false)} aria-label="Close preview">
              ×
            </button>
            <span className="eyebrow eyebrow-muted">Preview</span>
            <h3>The daily check-in, end to end</h3>
            <p>
              A short walkthrough of what a teammate sees, what a manager
              receives, and how the AI summary reaches your Google Chat space.
            </p>
            <button className="btn btn-primary" onClick={() => goto('/daily')}>
              Open the live preview
            </button>
          </div>
        </div>
      )}

      {/* ============ FEATURES ============ */}
      <section className="features">
        <div className="section-head">
          <span className="eyebrow eyebrow-muted">What's included</span>
          <h2>Everything a check-in needs, nothing it doesn't</h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card feature-card-accent">
            <h3>Daily check-ins</h3>
            <p>Scheduled reminders and a three-question form that people actually complete.</p>
          </div>
          <div className="feature-card">
            <h3>AI summaries</h3>
            <p>Claude distills every update into a short, readable digest — no scrolling threads.</p>
          </div>
          <div className="feature-card">
            <h3>Google Chat delivery</h3>
            <p>Reports and blockers post straight into the spaces your teams already watch.</p>
          </div>
          <div className="feature-card">
            <h3>Mood tracking</h3>
            <p>A one-tap mood check surfaces team sentiment before it becomes a problem.</p>
          </div>
          <div className="feature-card">
            <h3>Manager digests</h3>
            <p>Every direct report's update, compiled and ready before the day starts.</p>
          </div>
          <div className="feature-card">
            <h3>Executive rollups</h3>
            <p>Cross-department trends for leadership, refreshed automatically each week.</p>
          </div>
        </div>
      </section>

      {/* ============ JOURNEY / LIFECYCLE ============ */}
      <section className="journey">
        <div className="section-head">
          <span className="eyebrow eyebrow-muted">The lifecycle</span>
          <h2>One update, four places it matters</h2>
        </div>

        <div className="journey-line">
          <svg className="journey-svg" viewBox="0 0 1000 40" preserveAspectRatio="none">
            <path d="M0 20 L1000 20" stroke="var(--line)" strokeWidth="2" />
            <path
              d="M0 20 L1000 20"
              stroke="var(--jade)"
              strokeWidth="2"
              strokeDasharray="1000"
              strokeDashoffset="1000"
              className="journey-progress"
            />
          </svg>
          <div className="journey-stops">
            <div className="journey-stop">
              <span className="stop-dot" />
              <span className="stop-label">Employee replies</span>
            </div>
            <div className="journey-stop">
              <span className="stop-dot" />
              <span className="stop-label">Manager digest</span>
            </div>
            <div className="journey-stop">
              <span className="stop-dot" />
              <span className="stop-label">Google Chat</span>
            </div>
            <div className="journey-stop">
              <span className="stop-dot" />
              <span className="stop-label">Exec dashboard</span>
            </div>
            <div className="journey-stop journey-stop-active">
              <span className="stop-dot" />
              <span className="stop-label">AI report</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="cta-band">
        <div className="cta-inner">
          <div>
            <h2>Start collecting check-ins your team will actually use</h2>
            <p className="lead">
              Fast onboarding, reliable delivery, and a clearer picture of how
              every workstream is really doing.
            </p>
          </div>
          <div className="cta-actions">
            <button className="btn btn-primary" onClick={() => goto('/login')}>
              Get started
            </button>
            <button className="btn btn-ghost" onClick={() => setShowDemo(true)}>
              Preview the workflow
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;