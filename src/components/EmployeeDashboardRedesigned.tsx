import React, { useEffect, useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { AlertTriangle, CheckCircle2, Mic, Paperclip, Send, Volume2, X } from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const {
    currentUser,
    projects,
    submitEmployeeUpdate,
    parseVoiceUpdateAI,
    updates,
    playElevenLabsTTS,
    isVoiceLoading
  } = usePulse();

  const [completed, setCompleted] = useState('');
  const [working, setWorking] = useState('');
  const [blockers, setBlockers] = useState('');
  const [projectName, setProjectName] = useState('General');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState<'completed' | 'working' | 'blockers' | 'all'>('all');
  const [voiceText, setVoiceText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [showAttachments, setShowAttachments] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayUpdate = updates.find((u) => u.employeeId === currentUser.id && u.date === todayStr);
    if (todayUpdate) {
      setCompleted(todayUpdate.completed.join('\n'));
      setWorking(todayUpdate.working.join('\n'));
      setBlockers(todayUpdate.blockers.join('\n'));
      setProjectName(todayUpdate.projectName || 'General');
      setPriority(todayUpdate.priority);
      setAttachedFiles(todayUpdate.files || []);
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const resultText = event.results[event.results.length - 1][0].transcript;
        setVoiceText((prev) => `${prev} ${resultText}`.trim());
      };

      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      setRecognition(rec);
    }
  }, [currentUser, updates]);

  const handleStartVoiceRecord = (target: 'completed' | 'working' | 'blockers' | 'all') => {
    setVoiceTarget(target);
    setVoiceText('');
    setIsRecording(true);

    if (recognition) {
      try {
        recognition.start();
      } catch {
        setIsRecording(false);
      }
      return;
    }

    const simulatedSpeech =
      target === 'completed'
        ? 'Yesterday I completed the onboarding flow review and the content publishing pass.'
        : target === 'working'
          ? 'Today I am finishing the dashboard polish and preparing the launch checklist.'
          : target === 'blockers'
            ? 'I am waiting on final copy approval from the marketing team.'
            : 'Yesterday I finished the onboarding review. Today I am polishing the dashboard and waiting on approval from marketing.';

    let index = 0;
    const interval = window.setInterval(() => {
      if (index < simulatedSpeech.length) {
        setVoiceText((prev) => prev + simulatedSpeech.charAt(index));
        index += 1;
      } else {
        window.clearInterval(interval);
        setIsRecording(false);
      }
    }, 30);

    return () => window.clearInterval(interval);
  };

  const handleStopVoiceRecord = () => {
    setIsRecording(false);
    if (recognition) recognition.stop();
  };

  const handleAIParsing = async () => {
    if (!voiceText.trim()) return;
    setAiParsing(true);

    try {
      const parsed = await parseVoiceUpdateAI(voiceText);
      const blockValue = parsed.blockers[0] === 'None' ? '' : parsed.blockers.join('\n');

      if (voiceTarget === 'all') {
        setCompleted(parsed.completed.join('\n'));
        setWorking(parsed.working.join('\n'));
        setBlockers(blockValue);
      } else if (voiceTarget === 'completed') {
        setCompleted((prev) => `${prev}${prev ? '\n' : ''}${parsed.completed.join('\n')}`);
      } else if (voiceTarget === 'working') {
        setWorking((prev) => `${prev}${prev ? '\n' : ''}${parsed.working.join('\n')}`);
      } else {
        setBlockers((prev) => `${prev}${prev ? '\n' : ''}${blockValue}`);
      }
      setVoiceText('');
    } catch (error) {
      console.error(error);
    } finally {
      setAiParsing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const newFiles = Array.from(event.target.files).map((file) => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    }));
    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!completed.trim() && !working.trim()) {
      setErrorMsg('Please share yesterday\'s progress or today\'s plan.');
      setSubmitSuccess(false);
      return;
    }

    setErrorMsg('');
    const result = await submitEmployeeUpdate({
      completed: completed.split('\n'),
      working: working.split('\n'),
      blockers: blockers ? blockers.split('\n') : ['None'],
      priority,
      projectName,
      files: attachedFiles
    });

    const deliveryStatus = typeof result?.deliveryStatus === 'string' ? result.deliveryStatus : 'ok';
    setSubmitSuccess(true);
    setSubmitMessage(
      deliveryStatus === 'partial'
        ? 'Your update is saved. Some notifications need attention.'
        : deliveryStatus === 'failed'
          ? 'Your update is saved, but delivery needs attention.'
          : 'Your update is saved and notifications are on their way.'
    );
    window.setTimeout(() => setSubmitSuccess(false), 4000);
  };

  const handlePreviewVoiceover = () => {
    const ttsText = `Yesterday I completed ${completed.split('\n').join('. ')}. Today I am working on ${working.split('\n').join('. ')}. ${blockers ? `My blockers are ${blockers.split('\n').join('. ')}` : 'I have no blockers.'}`;
    void playElevenLabsTTS(ttsText);
  };

  if (!currentUser) return null;

  const statusCards = [
    { label: 'Yesterday', value: completed || 'No update yet' },
    { label: 'Today', value: working || 'No plan yet' },
    { label: 'Blockers', value: blockers || 'No blockers' }
  ];

  return (
    <div className="fade-in" style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gap: '22px' }}>
      <section className="glass-card" style={{ padding: '26px', display: 'grid', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <p className="status-pill" style={{ marginBottom: '10px' }}>Standup</p>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Daily updates that actually move work forward</h1>
            <p style={{ margin: '12px 0 0', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Send your update, capture blockers, and keep Gmail + Google Chat notifications flowing without extra effort.
            </p>
          </div>
          <div style={{ display: 'grid', gap: '12px', minWidth: '240px' }}>
            <div className="glass-card" style={{ padding: '16px', border: '1px solid var(--glass-border)' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Profile</p>
              <p style={{ margin: '8px 0 0', fontSize: '1rem', fontWeight: 700 }}>{currentUser.name}</p>
            </div>
            <div className="glass-card" style={{ padding: '16px', border: '1px solid var(--glass-border)' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Notifications</p>
              <p style={{ margin: '8px 0 0', fontSize: '1rem', fontWeight: 700 }}>Google Chat + Gmail</p>
            </div>
          </div>
        </div>

        <div className="grid-three" style={{ gap: '20px',display: 'grid' }}>
          {statusCards.map((card) => (
            <div key={card.label} className="surface-card" style={{ padding: '18px', minHeight: '120px' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{card.label}</p>
              <p style={{ margin: '14px 0 0', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.75,gap: '14px', marginBottom: '24px' }}>{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '24px', display: 'grid', gap: '20px' }}>
        <div className="grid-two" style={{ gap: '18px' }}>
          <div>
            <label htmlFor="project-select">Project</label>
            <select id="project-select" value={projectName} onChange={(event) => setProjectName(event.target.value)}>
              {projects.map((project) => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="priority-select">Priority</label>
            <select id="priority-select" value={priority} onChange={(event) => setPriority(event.target.value as 'low' | 'medium' | 'high' | 'critical')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="grid-two" style={{ gap: '18px' }}>
          <section className="surface-card" style={{ padding: '18px', display: 'grid', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>Yesterday</p>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>What you finished</p>
              </div>
              <button type="button" onClick={() => handleStartVoiceRecord('completed')} className="btn btn-secondary" style={{ padding: '9px 12px', fontSize: '0.82rem', borderRadius: '999px' }}>
                <Mic size={14} />
                Dictate
              </button>
            </div>
            <textarea id="completed-text" rows={4} value={completed} onChange={(event) => setCompleted(event.target.value)} placeholder="Completed work" />
          </section>

          <section className="surface-card" style={{ padding: '18px', display: 'grid', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>Today</p>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>What you're focusing on</p>
              </div>
              <button type="button" onClick={() => handleStartVoiceRecord('working')} className="btn btn-secondary" style={{ padding: '9px 12px', fontSize: '0.82rem', borderRadius: '999px' }}>
                <Mic size={14} />
                Dictate
              </button>
            </div>
            <textarea id="working-text" rows={4} value={working} onChange={(event) => setWorking(event.target.value)} placeholder="Today’s plan" />
          </section>
        </div>

        <section className="surface-card" style={{ padding: '18px', display: 'grid', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>Blockers</p>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>What needs help</p>
            </div>
            <button type="button" onClick={() => handleStartVoiceRecord('blockers')} className="btn btn-secondary" style={{ padding: '9px 12px', fontSize: '0.82rem', borderRadius: '999px' }}>
              <Mic size={14} />
              Dictate
            </button>
          </div>
          <textarea id="blockers-text" rows={3} value={blockers} onChange={(event) => setBlockers(event.target.value)} placeholder="Any blockers?" />
        </section>

        <section className="surface-card" style={{ padding: '18px', display: 'grid', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>Shared to team</p>
              <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Delivered via Google Chat and Gmail.</p>
            </div>
            <button type="button" onClick={() => setShowAttachments((prev) => !prev)} className="btn btn-secondary" style={{ padding: '9px 12px', fontSize: '0.82rem', borderRadius: '999px' }}>
              <Paperclip size={14} />
              {showAttachments ? 'Hide attachments' : 'Attach files'}
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <span className="status-pill">{completed.trim() ? 'Yesterday recorded' : 'Add yesterday'}</span>
            <span className="status-pill">{working.trim() ? 'Plan ready' : 'Add today'}</span>
            <span className="status-pill">{blockers.trim() ? 'Blockers noted' : 'No blockers'}</span>
          </div>

          {showAttachments && (
            <div style={{ border: '1px dashed var(--glass-border)', borderRadius: '12px', padding: '12px' }}>
              <input type="file" multiple onChange={handleFileUpload} />
              {attachedFiles.length > 0 && (
                <div style={{ display: 'grid', gap: '10px', marginTop: '12px' }}>
                  {attachedFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{file.name}</p>
                        <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{file.size}</p>
                      </div>
                      <button type="button" onClick={() => removeFile(index)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} aria-label={`Remove ${file.name}`}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {voiceText && (
          <div className="surface-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', flex: 1 }}>{voiceText}</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="button" onClick={handleAIParsing} disabled={aiParsing} className="btn btn-primary" style={{ padding: '10px 14px', fontSize: '0.85rem' }}>
                {aiParsing ? 'Parsing…' : 'Apply to form'}
              </button>
              <button type="button" onClick={() => setVoiceText('')} className="btn btn-secondary" style={{ padding: '10px 14px', fontSize: '0.85rem' }}>
                Clear
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div aria-live="polite" style={{ display: 'flex', gap: '10px', color: 'var(--accent-primary)', fontWeight: 700, alignItems: 'center' }}>
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {submitSuccess && (
          <div aria-live="polite" style={{ display: 'flex', gap: '10px', color: 'var(--accent-emerald)', fontWeight: 700, alignItems: 'center' }}>
            <CheckCircle2 size={18} />
            <span>{submitMessage}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '11px', flexWrap: 'wrap' }}>
            <button type="button" onClick={isRecording ? handleStopVoiceRecord : () => handleStartVoiceRecord('all')} className="btn btn-secondary" style={{ padding: '10px 14px', fontSize: '0.9rem' }}>
              {isRecording ? <><Mic size={15} /> Stop</> : <><Mic size={15} /> Record update</>}
            </button>
            <button type="button" onClick={handlePreviewVoiceover} disabled={isVoiceLoading} className="btn btn-secondary" style={{ padding: '10px 14px', fontSize: '0.9rem' }}>
              {isVoiceLoading ? 'Generating…' : <><Volume2 size={15} /> Preview</>}
            </button>
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 26px', fontSize: '1rem' }}>
            <Send size={16} />
            Submit update
          </button>
        </div>
      </form> */}
    </div>
  );
};
