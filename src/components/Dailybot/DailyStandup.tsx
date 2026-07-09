import React, { useState, useEffect } from 'react';
import { usePulse } from '../../context/PulseContext';
import { templates } from './DailyTemplates';
import UpdateSuccess from '../UpdateSuccess';

export const DailyStandup: React.FC<{ selectedTemplateId?: string | null }> = ({ selectedTemplateId }) => {
  const { currentUser, submitEmployeeUpdate, trackEvent } = usePulse();
  const [working, setWorking] = useState('');
  const [completed, setCompleted] = useState('');
  const [blockers, setBlockers] = useState('');
  const [project, setProject] = useState('General');
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium');
  const [msg, setMsg] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!selectedTemplateId) return;
    const t = templates.find(x => x.id === selectedTemplateId);
    if (!t) return;
    setCompleted(prev => prev.trim() ? prev : t.completed || '');
    setWorking(prev => prev.trim() ? prev : t.working || '');
    setBlockers(prev => prev.trim() ? prev : t.blockers || '');
  }, [selectedTemplateId]);

  const next = () => setStep(s => Math.min(4, s+1));
  const prev = () => setStep(s => Math.max(1, s-1));

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!currentUser) {
      setMsg('Please sign in to submit your update.');
      return;
    }

    const payload = {
      completed: completed.split('\n').map(s => s.trim()).filter(Boolean),
      working: working.split('\n').map(s => s.trim()).filter(Boolean),
      blockers: blockers.split('\n').map(s => s.trim()).filter(Boolean),
      projectName: project,
      priority
    };

    const result = await submitEmployeeUpdate(payload as any);
    if (result?.deliveryStatus === 'ok') {
      setMsg('Update submitted — notifications delivered');
      setCompleted(''); setWorking(''); setBlockers('');
      setStep(1);
      setShowSuccess(true);
      trackEvent('update_submitted', { status: 'ok', project, priority });
    } else if (result?.deliveryStatus === 'partial') {
      setMsg('Saved locally — backend not reachable');
      trackEvent('update_submitted', { status: 'partial', project, priority });
    } else {
      setMsg('Failed to deliver update — try again');
      trackEvent('update_submitted', { status: 'failed', project, priority });
    }
  };

  return (
    <div className="daily-standup">
      <h3>Quick Standup</h3>
      {selectedTemplateId && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Applying template: {selectedTemplateId}</div>}
      <p className="daily-small">Submit what you did, what you're working on, and blockers.</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1,2,3,4].map(n => (
            <div key={n} style={{ padding: '6px 10px', borderRadius: 8, background: step===n ? 'var(--accent-light)' : 'transparent', color: step===n ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight:700 }}>Step {n}</div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div>
          <label className="daily-label">Completed</label>
          <textarea className="daily-textarea" value={completed} onChange={e => setCompleted(e.target.value)} />
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
            <button className="btn btn-primary" onClick={next}>Continue</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <label className="daily-label">Working On</label>
          <textarea className="daily-textarea" value={working} onChange={e => setWorking(e.target.value)} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
            <button className="btn btn-secondary" onClick={prev}>Back</button>
            <button className="btn btn-primary" onClick={next}>Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <label className="daily-label">Blockers</label>
          <textarea className="daily-textarea" value={blockers} onChange={e => setBlockers(e.target.value)} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
            <button className="btn btn-secondary" onClick={prev}>Back</button>
            <button className="btn btn-primary" onClick={next}>Continue</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <label className="daily-label">Project</label>
          <input className="daily-input" value={project} onChange={e => setProject(e.target.value)} />
          <label className="daily-label">Priority</label>
          <select className="daily-input" value={priority} onChange={e => setPriority(e.target.value as any)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <div style={{ display:'flex', justifyContent:'space-between', marginTop:12 }}>
            <button className="btn btn-secondary" onClick={prev}>Back</button>
            <button className="daily-btn" onClick={() => void handleSubmit()}>Submit</button>
          </div>
        </div>
      )}

      {msg && <div className="daily-note">{msg}</div>}
      {showSuccess && <UpdateSuccess status={msg?.toLowerCase().includes('delivered') ? 'ok' : msg?.toLowerCase().includes('locally') ? 'partial' : 'failed'} onClose={() => setShowSuccess(false)} />}
    </div>
  );
};
