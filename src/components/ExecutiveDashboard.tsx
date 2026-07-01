import React, { useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertOctagon, 
  Search, 
  MessageSquare, 
  Mail, 
  Send, 
  MessageCircle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  SlidersHorizontal,
  Bot,
  Volume2
} from 'lucide-react';
import { ExecutiveAIChat } from './ExecutiveAIChat';

export const ExecutiveDashboard: React.FC = () => {
  const { 
    currentUser, 
    users, 
    updates, 
    addCommentToUpdate,
    playElevenLabsTTS,
    isVoiceLoading
  } = usePulse();

  // Search and Filtering State
  const [searchTerm, setSearchTerm] = useState('');

  if (!currentUser) return null;
  const [selectedPod, setSelectedPod] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [showBlockersOnly, setShowBlockersOnly] = useState(false);
  
  // Collapsible Comments Sections
  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [sendGmail, setSendGmail] = useState(true);
  const [sendChat, setSendChat] = useState(true);
  const [sendInternal, setSendInternal] = useState(true);

  // Chat Panel State
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Success Notification toast
  const [commentToast, setCommentToast] = useState<string | null>(null);

  // Calculate Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayUpdates = updates.filter(u => u.date === todayStr);
  const totalEmployees = users.filter(u => u.role === 'employee' && u.active);
  const submittedCount = todayUpdates.length;
  const pendingCount = Math.max(0, totalEmployees.length - submittedCount);
  const activeBlockers = todayUpdates.filter(u => u.blockers.length > 0 && u.blockers[0].toLowerCase() !== 'none' && u.blockers[0].toLowerCase() !== 'none' && u.blockers[0].trim() !== '').length;

  // Filter Updates List
  const filteredUpdates = todayUpdates.filter(update => {
    const matchesSearch = update.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          update.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPod = selectedPod === 'All' || update.pod === selectedPod;
    const matchesDept = selectedDept === 'All' || update.department.includes(selectedDept);
    const matchesBlocker = !showBlockersOnly || (update.blockers.length > 0 && update.blockers[0].toLowerCase() !== 'none' && update.blockers[0].trim() !== '');

    return matchesSearch && matchesPod && matchesDept && matchesBlocker;
  });

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'critical': return <span className="badge badge-danger">CRITICAL</span>;
      case 'high': return <span className="badge badge-warning">HIGH</span>;
      case 'medium': return <span className="badge badge-info">MEDIUM</span>;
      default: return <span className="badge badge-success">LOW</span>;
    }
  };

  const handlePostComment = (updateId: string) => {
    if (!commentContent.trim()) return;

    addCommentToUpdate(updateId, commentContent, {
      gmail: sendGmail,
      chat: sendChat,
      internal: sendInternal
    });

    const targetUpdate = updates.find(u => u.id === updateId);
    if (targetUpdate) {
      setCommentToast(`Comment added to ${targetUpdate.employeeName}'s card. API Triggers sent via: ${sendGmail ? 'Gmail, ' : ''}${sendChat ? 'Google Chat' : ''}`);
      setTimeout(() => setCommentToast(null), 5000);
    }

    setCommentContent('');
    setActiveCommentBox(null);
  };

  // Listen to daily brief voiceover
  const handleListenBrief = () => {
    let text = `Good Morning ${currentUser.name}. `;
    if (totalEmployees.length === 0) {
      text += "Currently there are no employees registered in the Maple Pulse company directory. Please use the Admin panel to create employee accounts and start submitting updates.";
    } else {
      text += `Today, ${submittedCount} out of ${totalEmployees.length} registered employees have submitted their updates. `;
      if (activeBlockers > 0) {
        text += `There are ${activeBlockers} active blockers requiring executive attention. Please review the blocker flags on the dashboard.`;
      } else {
        text += `No active blockers have been flagged by the team today. Overall progress is stable.`;
      }
    }
    playElevenLabsTTS(text);
  };

  return (
    <div className="fade-in" style={{ padding: '8px 0' }}>
      
      {/* Toast Notification */}
      {commentToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--accent-emerald)',
          borderRadius: 'var(--border-radius-md)',
          padding: '16px 20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '450px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-emerald-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-emerald)',
            fontWeight: 700
          }}>
            ✓
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            {commentToast}
          </p>
        </div>
      )}

      {/* Floating AI Panel Toggle */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="btn btn-primary"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
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
        <Bot size={20} />
        <span>Ask AI Assistant</span>
      </button>

      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Executive Workspace
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Logged in: <strong>{currentUser.name}</strong> ({currentUser.email}). Monitor work status and push approvals.
          </p>
        </div>

        <button 
          onClick={() => setIsChatOpen(true)}
          className="btn btn-secondary" 
          style={{ gap: '8px', padding: '10px 16px', fontSize: '0.85rem' }}
        >
          <Bot size={16} style={{ color: 'var(--accent-primary)' }} />
          <span>Launch AI Copilot</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="metrics-row">
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'var(--gradient-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
          }}>
            <Users size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active Employees</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>{totalEmployees.length}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'var(--gradient-emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
          }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Submitted Updates</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>{submittedCount}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'var(--gradient-amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
          }}>
            <Clock size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Pending Updates</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>{pendingCount}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(221, 36, 118, 0.2)'
          }}>
            <AlertOctagon size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active Blockers</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px', color: activeBlockers > 0 ? 'var(--accent-primary)' : 'inherit' }}>
              {activeBlockers}
            </h3>
          </div>
        </div>
      </div>

      {/* AI Daily Summary Brief (With ElevenLabs Voiceover button) */}
      <div className="glass-card" style={{
        padding: '24px',
        marginBottom: '28px',
        borderLeft: '4px solid var(--accent-primary)',
        background: 'linear-gradient(90deg, var(--bg-secondary) 0%, rgba(var(--accent-primary-rgb), 0.01) 100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>Maple Pulse Daily Brief</span>
          </h3>
          
          <button
            onClick={handleListenBrief}
            disabled={isVoiceLoading}
            className="btn btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              gap: '6px',
              borderRadius: '20px'
            }}
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
                <span>Generating Voiceover...</span>
              </>
            ) : (
              <>
                <Volume2 size={14} style={{ color: 'var(--accent-primary)' }} />
                <span>Listen to Summary (ElevenLabs AI)</span>
              </>
            )}
          </button>
        </div>
        
        {totalEmployees.length === 0 ? (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Good Morning, <strong>{currentUser.name}</strong>. The company directory is currently empty. Switch to the <strong>Admin role</strong> in the top header to register employees and start tracking updates.
          </p>
        ) : (
          <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Good Morning, <strong>{currentUser.name}</strong>. Today, <strong>{submittedCount} out of {totalEmployees.length} employees</strong> have completed updates. There are currently <strong>{activeBlockers} active blockers</strong> requiring attention.
          </p>
        )}

        {totalEmployees.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px',
            background: 'var(--bg-tertiary)',
            padding: '16px',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid var(--glass-border)'
          }}>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Outbound Summary Status
              </h4>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeBlockers > 0 ? (
                  <li>Review active blockers listed below to trigger Gmail or Google Chat followups.</li>
                ) : (
                  <li>All submitted status cards are clear of blocker flags.</li>
                )}
                {pendingCount > 0 && <li>{pendingCount} employee(s) have not updated yet.</li>}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Pending Updates List
              </h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {pendingCount === 0 ? (
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓ 100% Submission rate achieved today!</span>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {totalEmployees.filter(e => !todayUpdates.find(u => u.employeeId === e.id)).map(e => (
                      <span key={e.id} className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{e.name}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Performance Grid Controls */}
      <div className="glass-card" style={{ padding: '24px' }}>
        
        {/* Filters and Search Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--glass-border)'
        }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search employee or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter:</span>
            </div>

            <select
              value={selectedPod}
              onChange={(e) => setSelectedPod(e.target.value)}
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <option value="All">All Pods</option>
              <option value="India Pod">India Pod</option>
              <option value="UAE Pod">UAE Pod</option>
            </select>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <option value="All">All Departments</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Client Success">Client Success</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
              <input
                type="checkbox"
                checked={showBlockersOnly}
                onChange={(e) => setShowBlockersOnly(e.target.checked)}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Show Blockers Only</span>
            </label>
          </div>
        </div>

        {/* Updates Table */}
        <div style={{ overflowX: 'auto' }}>
          {updates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
              <Bot size={40} style={{ color: 'var(--accent-primary)', marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Awaiting Daily Updates
              </h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.5' }}>
                No employees have submitted updates yet. Switch to the <strong>Admin role</strong> in the top header, add a test user, then switch to that employee profile to submit your first status update.
              </p>
            </div>
          ) : filteredUpdates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>No employee updates match your search criteria.</p>
              <p style={{ fontSize: '0.8rem' }}>Try clearing filters or adjusting your search keyword.</p>
            </div>
          ) : (
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Project & Priority</th>
                  <th>Completed Tasks</th>
                  <th>Today's Focus</th>
                  <th>Blockers</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpdates.map((update) => {
                  const hasBlocker = update.blockers.length > 0 && 
                                     update.blockers[0].toLowerCase() !== 'none' && 
                                     update.blockers[0].trim() !== '';
                  const isCollapsibleOpen = activeCommentBox === update.id;

                  return (
                    <React.Fragment key={update.id}>
                      <tr>
                        {/* Employee Cell */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: users.find(u => u.id === update.employeeId)?.avatarColor || '#6366f1',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem'
                            }}>
                              {update.employeeName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{update.employeeName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{update.department}</div>
                            </div>
                          </div>
                        </td>

                        {/* Project & Priority */}
                        <td>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{update.projectName}</div>
                            <div style={{ marginTop: '4px' }}>{getPriorityBadge(update.priority)}</div>
                          </div>
                        </td>

                        {/* Completed Tasks */}
                        <td>
                          <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {update.completed.map((task, idx) => (
                              <li key={idx}>{task}</li>
                            ))}
                          </ul>
                        </td>

                        {/* Today's Focus */}
                        <td>
                          <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {update.working.map((task, idx) => (
                              <li key={idx}>{task}</li>
                            ))}
                          </ul>
                        </td>

                        {/* Blockers */}
                        <td>
                          {hasBlocker ? (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', color: 'var(--accent-primary)' }}>
                              <AlertOctagon size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{update.blockers.join(', ')}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>None</span>
                          )}
                        </td>

                        {/* Comment Action */}
                        <td>
                          <button
                            onClick={() => {
                              setActiveCommentBox(isCollapsibleOpen ? null : update.id);
                              setCommentContent('');
                            }}
                            className="btn btn-secondary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              gap: '6px',
                              borderRadius: '20px'
                            }}
                          >
                            <MessageSquare size={13} />
                            <span>Comment</span>
                            {isCollapsibleOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Comment Editor Panel */}
                      {isCollapsibleOpen && (
                        <tr>
                          <td colSpan={6} style={{ padding: '0 16px 16px 16px', background: 'rgba(15,23,42,0.005)' }}>
                            <div className="glass-card" style={{ padding: '16px', marginTop: '8px' }}>
                              
                              {/* Display previous comments */}
                              {update.comments.length > 0 && (
                                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                    Previous Comments ({update.comments.length})
                                  </h4>
                                  {update.comments.map((comm) => (
                                    <div key={comm.id} style={{
                                      background: 'var(--bg-tertiary)',
                                      padding: '10px 14px',
                                      borderRadius: 'var(--border-radius-sm)',
                                      border: '1px solid var(--glass-border)'
                                    }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{comm.authorName}</span>
                                          
                                          {/* Listen to comment button */}
                                          <button
                                            onClick={() => playElevenLabsTTS(comm.content)}
                                            className="btn btn-secondary"
                                            disabled={isVoiceLoading}
                                            style={{
                                              padding: 0,
                                              width: '24px',
                                              height: '24px',
                                              borderRadius: '50%',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              border: 'none',
                                              background: 'transparent'
                                            }}
                                            title="Listen to this comment"
                                          >
                                            <Volume2 size={12} style={{ color: 'var(--accent-primary)' }} />
                                          </button>
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                          {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{comm.content}</p>
                                      
                                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                        {comm.sentVia.gmail && <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Gmail Sent</span>}
                                        {comm.sentVia.chat && <span className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Google Chat Pushed</span>}
                                        {comm.sentVia.internal && <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Internal Logged</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Write Feedback / Comment</label>
                                <textarea
                                  value={commentContent}
                                  onChange={(e) => setCommentContent(e.target.value)}
                                  placeholder={`E.g., "Please share the revised proposal with the client."`}
                                  rows={2}
                                />
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                  
                                  {/* Channel selections */}
                                  <div style={{ display: 'flex', gap: '16px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', margin: 0 }}>
                                      <input
                                        type="checkbox"
                                        checked={sendGmail}
                                        onChange={(e) => setSendGmail(e.target.checked)}
                                        style={{ width: 'auto' }}
                                      />
                                      <Mail size={13} style={{ color: 'var(--accent-blue)' }} />
                                      <span>Gmail</span>
                                    </label>

                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', margin: 0 }}>
                                      <input
                                        type="checkbox"
                                        checked={sendChat}
                                        onChange={(e) => setSendChat(e.target.checked)}
                                        style={{ width: 'auto' }}
                                      />
                                      <MessageCircle size={13} style={{ color: 'var(--accent-indigo)' }} />
                                      <span>Google Chat</span>
                                    </label>

                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', margin: 0 }}>
                                      <input
                                        type="checkbox"
                                        checked={sendInternal}
                                        onChange={(e) => setSendInternal(e.target.checked)}
                                        style={{ width: 'auto' }}
                                      />
                                      <MessageSquare size={13} style={{ color: 'var(--accent-primary)' }} />
                                      <span>Internal</span>
                                    </label>
                                  </div>

                                  <button
                                    onClick={() => handlePostComment(update.id)}
                                    className="btn btn-primary"
                                    style={{
                                      padding: '8px 16px',
                                      fontSize: '0.8rem',
                                      borderRadius: '20px'
                                    }}
                                  >
                                    <Send size={12} />
                                    <span>Push Comment</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-out AI Panel Drawer */}
      <ExecutiveAIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};
