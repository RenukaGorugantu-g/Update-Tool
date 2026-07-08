import React, { useEffect, useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { AlertTriangle, CheckCircle2, Mic, Paperclip, Send, Sparkles, Volume2, X } from 'lucide-react';

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

      rec.onerror = () => {
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

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
  };

  const handleStopVoiceRecord = () => {
    setIsRecording(false);
    if (recognition) {
      recognition.stop();
    }
  };

  const handleAIParsing = async () => {
    if (!voiceText.trim()) return;
    setAiParsing(true);

    try {
      const parsed = await parseVoiceUpdateAI(voiceText);
      if (voiceTarget === 'all') {
        setCompleted(parsed.completed.join('\n'));
        setWorking(parsed.working.join('\n'));
        setBlockers(parsed.blockers[0] === 'None' ? '' : parsed.blockers.join('\n'));
      } else if (voiceTarget === 'completed') {
        setCompleted((prev) => `${prev}${prev ? '\n' : ''}${parsed.completed.join('\n')}`);
      } else if (voiceTarget === 'working') {
        setWorking((prev) => `${prev}${prev ? '\n' : ''}${parsed.working.join('\n')}`);
      } else {
        setBlockers((prev) => `${prev}${prev ? '\n' : ''}${parsed.blockers.join('\n')}`);
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

  const removeFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, index) => index !== idx));
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

  return (
    <div className="fade-in" style={{ maxWidth: '940px', margin: '0 auto', display: 'grid', gap: '20px' }}>
      <div className="glass-card" style={{ padding: '24px 26px', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <p className="status-pill" style={{ marginBottom: '8px' }}>Three questions • One minute</p>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>Today’s check-in</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Share what you finished, what you are working on, and anything blocking you.
          </p>
        </div>
        <div className="glass-card" style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            <Sparkles size={14} color="var(--accent-primary)" />
            Voice capture ready
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '24px', display: 'grid', gap: '18px' }}>
        <div className="grid-two">
          <div>
            <label htmlFor="project-select">Project</label>
            <select id="project-select" value={projectName} onChange={(event) => setProjectName(event.target.value)}>
              {projects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
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

        <div className="grid-two">
          <div className="surface-card" style={{ padding: '16px', display: 'grid', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="completed-text" style={{ margin: 0, textTransform: 'none', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Yesterday’s work
              </label>
              <button type="button" onClick={() => handleStartVoiceRecord('completed')} className="btn btn-secondary" style={{ padding: '6px 10px', borderRadius: '999px', fontSize: '0.75rem' }}>
                <Mic size={13} />
                Dictate
              </button>
            </div>
            <textarea id="completed-text" rows={3} value={completed} onChange={(event) => setCompleted(event.target.value)} placeholder="What did you finish yesterday?" />
          </div>

          <div className="surface-card" style={{ padding: '16px', display: 'grid', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="working-text" style={{ margin: 0, textTransform: 'none', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Today’s plan
              </label>
              <button type="button" onClick={() => handleStartVoiceRecord('working')} className="btn btn-secondary" style={{ padding: '6px 10px', borderRadius: '999px', fontSize: '0.75rem' }}>
                <Mic size={13} />
                Dictate
              </button>
            </div>
            <textarea id="working-text" rows={3} value={working} onChange={(event) => setWorking(event.target.value)} placeholder="What are you focusing on today?" />
          </div>
        </div>

        <div className="surface-card" style={{ padding: '16px', display: 'grid', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="blockers-text" style={{ margin: 0, textTransform: 'none', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Blockers or help needed
            </label>
            <button type="button" onClick={() => handleStartVoiceRecord('blockers')} className="btn btn-secondary" style={{ padding: '6px 10px', borderRadius: '999px', fontSize: '0.75rem' }}>
              <Mic size={13} />
              Dictate
            </button>
          </div>
          <textarea id="blockers-text" rows={2} value={blockers} onChange={(event) => setBlockers(event.target.value)} placeholder="Optional. Share anything delaying your work." />
        </div>

        <div className="surface-card" style={{ padding: '14px 16px', display: 'grid', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>Quick review</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>A short summary is shared with your team and manager.</p>
            </div>
            <button type="button" onClick={() => setShowAttachments((prev) => !prev)} className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: '0.78rem' }}>
              <Paperclip size={14} />
              {showAttachments ? 'Hide attachments' : 'Add attachment'}
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span className="status-pill">{completed.trim() ? 'Completed captured' : 'Add yesterday’s work'}</span>
            <span className="status-pill">{working.trim() ? 'Today’s plan captured' : 'Share today’s plan'}</span>
            <span className="status-pill">{blockers.trim() ? 'Blockers captured' : 'No blockers noted'}</span>
          </div>

          {showAttachments && (
            <div style={{ border: '1px dashed var(--glass-border)', borderRadius: '12px', padding: '12px' }}>
              <input type="file" multiple onChange={handleFileUpload} />
              {attachedFiles.length > 0 && (
                <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
                  {attachedFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} aria-label={`Remove ${file.name}`}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {voiceText && (
          <div className="surface-card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{voiceText}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handleAIParsing} disabled={aiParsing} className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                {aiParsing ? 'Parsing…' : 'Apply to form'}
              </button>
              <button type="button" onClick={() => setVoiceText('')} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                Clear
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div aria-live="polite" style={{ display: 'flex', gap: '8px', color: 'var(--accent-primary)', fontWeight: 700, alignItems: 'center' }}>
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {submitSuccess && (
          <div aria-live="polite" style={{ display: 'flex', gap: '8px', color: 'var(--accent-emerald)', fontWeight: 700, alignItems: 'center' }}>
            <CheckCircle2 size={16} />
            <span>{submitMessage}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" onClick={isRecording ? handleStopVoiceRecord : () => handleStartVoiceRecord('all')} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
              {isRecording ? <><Mic size={14} /> Stop</> : <><Mic size={14} /> Record update</>}
            </button>
            <button type="button" onClick={handlePreviewVoiceover} disabled={isVoiceLoading} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
              {isVoiceLoading ? 'Generating…' : <><Volume2 size={14} /> Preview</>}
            </button>
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px' }}>
            <Send size={15} />
            Submit update
          </button>
        </div>
      </form>
    </div>
  );
};
