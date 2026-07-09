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

     
    </div>
  );
};
