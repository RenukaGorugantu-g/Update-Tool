import React, { useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { Plus, ChevronLeft } from 'lucide-react';

const Checkins: React.FC = () => {
  const { currentUser, submitEmployeeUpdate, notifications, setNotifications, users, updates } = usePulse();
  const [isFilling, setIsFilling] = useState(false);
  const [step, setStep] = useState(1);
  const [completedText, setCompletedText] = useState('');
  const [workingText, setWorkingText] = useState('');
  const [blockersText, setBlockersText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openFill = () => {
    setCompletedText('');
    setWorkingText('');
    setBlockersText('');
    setStep(1);
    setIsFilling(true);
  };

  const closeFill = () => {
    setIsFilling(false);
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const result = await submitEmployeeUpdate({
        completed: completedText ? [completedText] : [],
        working: workingText ? [workingText] : [],
        blockers: blockersText ? [blockersText] : [],
        priority: 'medium',
        projectName: 'Daily Stand-ups',
        files: []
      });

      setNotifications(prev => [{ id: `notif-submit-${Date.now()}`, text: `Update submitted (${result.deliveryStatus})`, type: 'success', timestamp: new Date().toISOString(), read: false }, ...prev]);
    } catch (err) {
      setNotifications(prev => [{ id: `notif-fail-${Date.now()}`, text: `Submission failed`, type: 'warning', timestamp: new Date().toISOString(), read: false }, ...prev]);
    } finally {
      setSubmitting(false);
      setIsFilling(false);
    }
  };

  return (
    <div style={{ padding: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0 }}>Daily Stand-ups</h2>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>Check-ins are automated questions that you can set for your team on a regular basis.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={openFill}><Plus size={14} />&nbsp;Fill out report</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 18, marginTop: 18 }}>
        <div className="glass-card" style={{ padding: 18 }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Last activity: recent check-ins will appear here. Click <strong>Fill out report</strong> to submit your stand-up answers one-by-one.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          <div className="glass-card" style={{ padding: 14, flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Completion Rate</div>
            <div style={{ marginTop: 8, fontWeight: 800, fontSize: '1.1rem' }}>
              {(() => {
                const today = new Date().toISOString().split('T')[0];
                const totalEmployees = users.filter(u => u.active).length || 1;
                const submitted = updates.filter(u => u.date === today).length;
                const pct = Math.round((submitted / totalEmployees) * 100);
                return `${pct}% (${submitted}/${totalEmployees})`;
              })()}
            </div>
          </div>
          <div className="glass-card" style={{ padding: 14, width: 120 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Active Blockers</div>
            <div style={{ marginTop: 8, fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
              {updates.filter(u => u.blockers && u.blockers.length > 0 && u.blockers[0].trim() !== '' ).length}
            </div>
          </div>
        </div>
      </div>

      {isFilling && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.45)', zIndex: 9999 }}>
          <div style={{ width: 640, background: 'var(--bg-secondary)', padding: 24, borderRadius: 14, border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="btn btn-secondary" onClick={() => { if (step === 1) closeFill(); else setStep(s => s-1); }}><ChevronLeft size={14} /></button>
                <h3 style={{ margin: 0 }}>{step === 1 ? 'Previous work' : step === 2 ? 'Plans for today' : 'Any blockers?'}</h3>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {[1,2,3].map(s => (
                  <div key={s} style={{ width: 10, height: 10, borderRadius: 999, background: s <= step ? 'var(--accent-primary)' : 'rgba(15,23,42,0.06)' }} />
                ))}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 8 }}>{step}/3</div>
              </div>
            </div>

            {step === 1 && (
              <div style={{ display: 'grid', gap: 10 }}>
                <label style={{ fontWeight: 700 }}>What did you complete yesterday?</label>
                <textarea value={completedText} onChange={(e) => setCompletedText(e.target.value)} rows={4} placeholder="e.g. Finalized homepage design, deployed v1.2" style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--glass-border)' }} />
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'grid', gap: 10 }}>
                <label style={{ fontWeight: 700 }}>What will you work on today?</label>
                <textarea value={workingText} onChange={(e) => setWorkingText(e.target.value)} rows={4} placeholder="e.g. Implement API endpoints for reports" style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--glass-border)' }} />
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'grid', gap: 10 }}>
                <label style={{ fontWeight: 700 }}>Any blockers or help needed?</label>
                <textarea value={blockersText} onChange={(e) => setBlockersText(e.target.value)} rows={4} placeholder="e.g. Waiting on API key from infra" style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--glass-border)' }} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
              <div>
                {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(s => s-1)}>Back</button>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {step < 3 && <button className="btn" onClick={() => setStep(s => s+1)} disabled={(step===1 && !completedText.trim()) || (step===2 && !workingText.trim())}>Next</button>}
                {step === 3 && <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !blockersText.trim()}>{submitting ? 'Submitting…' : 'Submit'}</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkins;
