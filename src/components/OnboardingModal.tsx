import React, { useState } from 'react';
import { usePulse } from '../context/PulseContext';

export const OnboardingModal: React.FC<{ onClose: () => void; userName?: string; team?: string; manager?: string }> = ({ onClose, userName='You', team='Development', manager='Manager' }) => {
  const { trackEvent } = usePulse();
  const [step, setStep] = useState(1);
  const [closed, setClosed] = useState(false);

  const next = () => setStep(s => Math.min(3, s+1));
  const prev = () => setStep(s => Math.max(1, s-1));

  const handleClose = () => {
    trackEvent('onboarding_completed', { userName, team, manager });
    // Notify parent and also emit a global event to ensure navigation
    try {
      window.dispatchEvent(new CustomEvent('pulse:setActiveTab', { detail: 'dashboard' }));
      // also emit a hide event as a stronger fallback
      window.dispatchEvent(new CustomEvent('pulse:hideOnboarding'));
    } catch (err) {
      // ignore if window not available in some environments
    }
    try {
      onClose();
    } catch (err) {
      // ignore
    }
    // Ensure the modal unmounts locally even if parent doesn't respond
    setClosed(true);
  };

  return closed ? null : (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.45)', zIndex:9999 }}>
      <div style={{ width:600, background:'var(--bg-secondary)', padding:24, borderRadius:16, border:'1px solid var(--glass-border)' }}>
        <h3>Welcome {userName}!</h3>
        <p style={{ color:'var(--text-muted)' }}>You're part of {team}. Reporting Manager: {manager}.</p>

        {step === 1 && (
          <div>
            <h4>Daily Updates</h4>
            <p>Tell your manager: Completed • Working On • Blockers</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h4>Need Help?</h4>
            <p>Raise blockers → Manager notified → Google Chat → Email → Executive Dashboard</p>
          </div>
        )}

        {step === 3 && (
          <div>
            <h4>Track Progress</h4>
            <p>Your updates become Reports, Analytics, Sprint History, Performance Insights</p>
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', marginTop:18 }}>
          <div>
            {step > 1 && <button className="btn btn-secondary" onClick={prev}>Back</button>}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {step < 3 && <button className="btn" onClick={next}>Continue</button>}
            {step === 3 && <button className="btn btn-primary onboarding-get-started" onClick={handleClose}>Get Started</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
