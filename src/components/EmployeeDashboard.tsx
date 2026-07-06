import React, { useState, useEffect } from 'react';
import { usePulse } from '../context/PulseContext';
import { ExecutiveAIChat } from './ExecutiveAIChat';
import { 
  Mic, 
  MicOff, 
  Paperclip, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Send, 
  X, 
  FileCheck,
  Volume2
} from 'lucide-react';

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

  const [isChatOpen, setIsChatOpen] = useState(false);

  // Form Fields
  const [completed, setCompleted] = useState('');

  if (!currentUser) return null;
  const [working, setWorking] = useState('');
  const [blockers, setBlockers] = useState('');
  const [projectName, setProjectName] = useState(projects[0]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);
  
  // UI Helpers
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Voice Recording Simulation State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState<'completed' | 'working' | 'blockers' | 'all'>('all');
  const [voiceText, setVoiceText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  
  // Web Speech API
  const [recognition, setRecognition] = useState<any>(null);

  // Preset audio simulations
  const voicePresets = [
    {
      title: "Completed Web work, SEO fixes, no blockers",
      text: "Yesterday I completed website homepage redesign and fixed SEO issues. Today I will work on marketplace categories. No blockers."
    },
    {
      title: "Category updates, blocked waiting content",
      text: "Yesterday completed categories restructured. Today updatingmarketplace categories and preparing designs. Stuck waiting for client approvals."
    }
  ];

  useEffect(() => {
    // Check if employee has already submitted today
    const todayStr = new Date().toISOString().split('T')[0];
    const todayUpdate = updates.find(
      u => u.employeeId === currentUser.id && u.date === todayStr
    );
    if (todayUpdate) {
      setCompleted(todayUpdate.completed.join('\n'));
      setWorking(todayUpdate.working.join('\n'));
      setBlockers(todayUpdate.blockers.join('\n'));
      setProjectName(todayUpdate.projectName);
      setPriority(todayUpdate.priority);
      setAttachedFiles(todayUpdate.files || []);
    }

    // Initialize Web Speech API if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const resultText = event.results[event.results.length - 1][0].transcript;
        setVoiceText(prev => prev + ' ' + resultText);
      };

      rec.onerror = (err: any) => {
        console.error('Speech Recognition Error:', err);
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
      } catch (e) {
        console.warn('Speech Recognition already started or failed', e);
      }
    } else {
      // Simulate live recording if API not supported
      let simulatedSpeech = "";
      if (target === 'completed') {
        simulatedSpeech = "Completed marketplace restructuring and fixed mobile rendering issues.";
      } else if (target === 'working') {
        simulatedSpeech = "Implementing search index logic and writing DB seed files today.";
      } else if (target === 'blockers') {
        simulatedSpeech = "Waiting for graphic assets from design team.";
      } else {
        simulatedSpeech = "Yesterday I completed landing page SEO updates. Today I am coding marketplace categories. Blocked waiting for copywriter approval.";
      }

      let charIndex = 0;
      const interval = setInterval(() => {
        if (charIndex < simulatedSpeech.length) {
          setVoiceText(prev => prev + simulatedSpeech.charAt(charIndex));
          charIndex++;
        } else {
          clearInterval(interval);
          setIsRecording(false);
        }
      }, 30);
    }
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
        setCompleted(prev => (prev ? prev + '\n' : '') + parsed.completed.join('\n'));
      } else if (voiceTarget === 'working') {
        setWorking(prev => (prev ? prev + '\n' : '') + parsed.working.join('\n'));
      } else if (voiceTarget === 'blockers') {
        setBlockers(prev => (prev ? prev + '\n' : '') + parsed.blockers.join('\n'));
      }
      
      setVoiceText('');
    } catch (e) {
      console.error(e);
    } finally {
      setAiParsing(false);
    }
  };

  const selectVoicePreset = (text: string) => {
    setVoiceText(text);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      }));
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completed.trim() && !working.trim()) {
      setErrorMsg('Please supply yesterday\'s accomplishments or today\'s targets.');
      return;
    }
    setErrorMsg('');

    submitEmployeeUpdate({
      completed: completed.split('\n'),
      working: working.split('\n'),
      blockers: blockers ? blockers.split('\n') : ['None'],
      priority,
      projectName,
      files: attachedFiles
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 4000);
  };

  // Preview Typed status using ElevenLabs TTS
  const handlePreviewVoiceover = () => {
    let ttsText = `Yesterday, I completed: ${completed.split('\n').join('. ')}. `;
    ttsText += `Today, I am working on: ${working.split('\n').join('. ')}. `;
    if (blockers && blockers.toLowerCase() !== 'none') {
      ttsText += `My blockers are: ${blockers.split('\n').join('. ')}.`;
    } else {
      ttsText += "I have no active blockers.";
    }
    playElevenLabsTTS(ttsText);
  };

  return (
    <div className="fade-in" style={{ padding: '8px 0', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Top Banner Message */}
      <div className="glass-card" style={{
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderLeft: '4px solid var(--accent-primary)',
        background: 'linear-gradient(90deg, var(--bg-secondary) 0%, rgba(var(--accent-primary-rgb), 0.01) 100%)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px', background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Daily Status Update
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Submit status details to your manager: <strong>{currentUser.reportingManager}</strong>.
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '20px',
          background: 'var(--bg-tertiary)',
          fontSize: '0.8rem',
          fontWeight: 700,
          border: '1px solid var(--glass-border)'
        }}>
          <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>AI Voice Transcription Ready</span>
        </div>
      </div>

      {/* Voice Assistant Module */}
      <div className="glass-card" style={{
        padding: '24px',
        marginBottom: '28px',
        border: isRecording ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
        boxShadow: isRecording ? '0 0 15px rgba(var(--accent-primary-rgb), 0.08)' : 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mic size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>Voice Update Transcription</span>
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Speak naturally and let AI categorize it.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius-md)',
            padding: '16px',
            border: '1px solid var(--glass-border)',
            minHeight: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            {isRecording ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '4px', height: '24px', alignItems: 'center' }}>
                  <div className="voice-wave-bar" style={{ animationDelay: '0.1s' }}></div>
                  <div className="voice-wave-bar" style={{ animationDelay: '0.3s' }}></div>
                  <div className="voice-wave-bar" style={{ animationDelay: '0.5s' }}></div>
                  <div className="voice-wave-bar" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  Recording update... Speak now.
                </span>
              </div>
            ) : (
              <div style={{ fontSize: '0.9rem', color: voiceText ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: voiceText ? 'normal' : 'italic', whiteSpace: 'pre-wrap' }}>
                {voiceText || 'Press microphone below or pick a preset voice simulation...' }
              </div>
            )}

            {voiceText && !isRecording && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  onClick={handleAIParsing}
                  disabled={aiParsing}
                  className="btn btn-primary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    gap: '6px',
                    borderRadius: '20px'
                  }}
                >
                  {aiParsing ? (
                    <>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        border: '2px solid white',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }}></div>
                      <span>AI Categorizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>Parse with AI</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {!isRecording ? (
                <button
                  type="button"
                  onClick={() => handleStartVoiceRecord('all')}
                  className="btn btn-primary"
                  style={{ gap: '8px', padding: '10px 18px', borderRadius: '30px' }}
                >
                  <Mic size={16} />
                  <span>Record Update</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopVoiceRecord}
                  className="btn recording-pulse"
                  style={{ gap: '8px', padding: '10px 18px', borderRadius: '30px' }}
                >
                  <MicOff size={16} />
                  <span>Stop & Transcribe</span>
                </button>
              )}
              {voiceText && (
                <button
                  type="button"
                  onClick={() => setVoiceText('')}
                  className="btn btn-secondary"
                  style={{ padding: '10px', borderRadius: '50%', width: '40px', height: '40px' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Test Audios:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {voicePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectVoicePreset(preset.text)}
                    className="chip"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    title={preset.text}
                  >
                    Preset {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '28px' }}>
        
        {/* Project & Priority headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--glass-border)'
        }}>
          <div>
            <label htmlFor="project-select">Active Project</label>
            <select
              id="project-select"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            >
              {projects.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority-select">Status Priority</label>
            <select
              id="priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical Priority</option>
            </select>
          </div>
        </div>

        {/* Input Blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          
          {/* Card 1: Completed Yesterday */}
          <div className="glass-card" style={{ padding: '16px', background: 'rgba(15,23,42,0.005)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="completed-text" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                1. Completed Yesterday
              </label>
              <button
                type="button"
                onClick={() => handleStartVoiceRecord('completed')}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px', borderRadius: '12px' }}
                title="Dictate completed tasks"
              >
                <Mic size={12} />
                <span>Dictate</span>
              </button>
            </div>
            <textarea
              id="completed-text"
              rows={3}
              value={completed}
              onChange={(e) => setCompleted(e.target.value)}
              placeholder="List items, one per line. E.g.:&#10;Completed marketplace homepage UI design&#10;Fixed API endpoint performance bottlenecks"
              style={{ fontFamily: 'var(--font-family)', fontSize: '0.9rem' }}
            />
          </div>

          {/* Card 2: Working Today */}
          <div className="glass-card" style={{ padding: '16px', background: 'rgba(15,23,42,0.005)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="working-text" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                2. Working Today
              </label>
              <button
                type="button"
                onClick={() => handleStartVoiceRecord('working')}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px', borderRadius: '12px' }}
                title="Dictate today's tasks"
              >
                <Mic size={12} />
                <span>Dictate</span>
              </button>
            </div>
            <textarea
              id="working-text"
              rows={3}
              value={working}
              onChange={(e) => setWorking(e.target.value)}
              placeholder="List items, one per line. E.g.:&#10;Coding database integration hooks&#10;Refining responsive styles"
              style={{ fontFamily: 'var(--font-family)', fontSize: '0.9rem' }}
            />
          </div>

          {/* Card 3: Blockers / Support */}
          <div className="glass-card" style={{ padding: '16px', background: 'rgba(15,23,42,0.005)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="blockers-text" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                3. Blockers / Support Needed
              </label>
              <button
                type="button"
                onClick={() => handleStartVoiceRecord('blockers')}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px', borderRadius: '12px' }}
                title="Dictate blockers"
              >
                <Mic size={12} />
                <span>Dictate</span>
              </button>
            </div>
            <textarea
              id="blockers-text"
              rows={2}
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="Leave empty or specify blocker details. E.g.:&#10;Waiting for visual assets approval from creative leads"
              style={{ fontFamily: 'var(--font-family)', fontSize: '0.9rem' }}
            />
          </div>

        </div>

        {/* File Attachment */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Attachments & Screenshots
          </label>
          
          <div style={{
            border: '2px dashed var(--glass-border)',
            borderRadius: 'var(--border-radius-md)',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color var(--transition-fast)',
            position: 'relative',
            background: 'rgba(15,23,42,0.005)'
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              const newFiles = Array.from(e.dataTransfer.files).map(file => ({
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
              }));
              setAttachedFiles(prev => [...prev, ...newFiles]);
            }
          }}
          >
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            <Paperclip size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Drag & Drop screens or files here, or <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>browse files</span>
            </p>
          </div>

          {/* Attached Files List */}
          {attachedFiles.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              {attachedFiles.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--border-radius-sm)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                    <FileCheck size={14} style={{ color: 'var(--accent-emerald)' }} />
                    <span style={{ fontWeight: 700 }}>{file.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({file.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--accent-primary)',
            fontSize: '0.85rem',
            marginBottom: '16px',
            fontWeight: 600
          }}>
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {submitSuccess && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--accent-emerald)',
            fontSize: '0.85rem',
            marginBottom: '16px',
            fontWeight: 600
          }}>
            <Check size={16} />
            <span>Update submitted successfully! Actionable items compiled for executive review.</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          {/* ElevenLabs TTS Preview Button */}
          {(completed.trim() || working.trim()) && (
            <button
              type="button"
              onClick={handlePreviewVoiceover}
              disabled={isVoiceLoading}
              className="btn btn-secondary"
              style={{ padding: '10px 18px', gap: '6px' }}
            >
              {isVoiceLoading ? (
                <>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid var(--accent-primary)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></div>
                  <span>Generating Audio...</span>
                </>
              ) : (
                <>
                  <Volume2 size={15} style={{ color: 'var(--accent-primary)' }} />
                  <span>Preview Voice Over (ElevenLabs)</span>
                </>
              )}
            </button>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '12px 28px' }}
          >
            <Send size={16} />
            <span>Submit Update</span>
          </button>
        </div>

      </form>
      
      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="btn btn-primary"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 100,
          boxShadow: '0 8px 24px rgba(221,36,118,0.25)',
          borderRadius: '30px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: 'none'
        }}
      >
        <span>Ask AI Assistant</span>
      </button>
      <ExecutiveAIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
