import React, { useState, useEffect, useRef } from 'react';
import { usePulse } from '../context/PulseContext';
import { Mail, MessageCircle, Send, Inbox, Star, AlertCircle, Sparkles, SendHorizontal } from 'lucide-react';

export const WorkspaceHub: React.FC = () => {
  const { currentUser, mockEmails, setMockEmails, mockChatMessages, sendDirectChatMessage, users } = usePulse();
  const [activeClient, setActiveClient] = useState<'gmail' | 'chat'>('gmail');
  
  // Gmail States
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  
  // Chat States
  const chatSpaces = [
    { id: 'space_development', name: '#development-team', description: 'Engineering, database, and dev ops sync' },
    { id: 'space_design', name: '#design-team', description: 'UX/UI, layouts, branding, and assets feedback' },
    { id: 'space_marketing', name: '#marketing-team', description: 'SEO updates, ad campaigns, and copywriting' },
    { id: 'space_sales', name: '#sales-team', description: 'Outbound sales, client leads, and deal conversions' },
    { id: 'space_client_success', name: '#client-success', description: 'Client feedback, requirements, and revisions' }
  ];
  const [activeSpaceId, setActiveSpaceId] = useState(chatSpaces[0].id);
  const [chatInput, setChatInput] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  if (!currentUser) return null;

  // Filter emails: admin sees all emails for debugging; others see emails sent to them
  const myEmails = mockEmails.filter(email => 
    currentUser.role === 'admin' || 
    email.recipientEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  const selectedEmail = myEmails.find(e => e.id === selectedEmailId) || myEmails[0];

  // Filter chat messages for the selected space
  const currentChatMessages = mockChatMessages.filter(msg => msg.spaceId === activeSpaceId);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mockChatMessages, activeSpaceId, activeClient]);

  // Mark email as read
  useEffect(() => {
    if (selectedEmail && !selectedEmail.read) {
      setMockEmails(prev => prev.map(e => e.id === selectedEmail.id ? { ...e, read: true } : e));
    }
  }, [selectedEmailId, selectedEmail, setMockEmails]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sendDirectChatMessage(activeSpaceId, chatInput);
    const textSent = chatInput;
    setChatInput('');

    // Simulated automated team response after a short delay
    setTimeout(() => {
      // Find a manager or user in this pod/dept to reply
      const spaceObj = chatSpaces.find(s => s.id === activeSpaceId);
      const spaceName = spaceObj ? spaceObj.name : 'Team';
      const potentialRepliers = users.filter(u => u.id !== currentUser.id && u.active);
      const replier = potentialRepliers[Math.floor(Math.random() * potentialRepliers.length)] || currentUser;
      
      let replyText = `Thanks for logging that. We will align on this during the next review!`;
      if (textSent.toLowerCase().includes('blocker') || textSent.toLowerCase().includes('help')) {
        replyText = `Got it. Escalating this issue to Sandeep M and the board. Let's jump on a quick huddle if needed!`;
      } else if (textSent.toLowerCase().includes('completed') || textSent.toLowerCase().includes('done')) {
        replyText = `Awesome progress! 🚀 Let us sync the demo files.`;
      }

      sendDirectChatMessage(activeSpaceId, `🤖 *Auto-Response from ${replier.name}*:\n${replyText}`);
    }, 1500);
  };

  return (
    <div className="fade-in glass-card" style={{
      display: 'flex',
      height: 'calc(100vh - 120px)',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--border-radius-md)',
      overflow: 'hidden'
    }}>
      
      {/* Left sidebar: Toggle between Gmail & Google Chat */}
      <div style={{
        width: '72px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 0',
        gap: '20px'
      }}>
        {/* Gmail Button */}
        <button
          onClick={() => setActiveClient('gmail')}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            border: 'none',
            background: activeClient === 'gmail' ? 'var(--gradient-brand)' : 'transparent',
            color: activeClient === 'gmail' ? 'white' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: activeClient === 'gmail' ? '0 4px 12px rgba(221, 36, 118, 0.2)' : 'none',
            transition: 'all var(--transition-fast)'
          }}
          title="Gmail Workspace Client"
        >
          <Mail size={22} />
        </button>

        {/* Google Chat Button */}
        <button
          onClick={() => setActiveClient('chat')}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            border: 'none',
            background: activeClient === 'chat' ? 'var(--gradient-secondary)' : 'transparent',
            color: activeClient === 'chat' ? 'white' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: activeClient === 'chat' ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
            transition: 'all var(--transition-fast)'
          }}
          title="Google Chat Space Client"
        >
          <MessageCircle size={22} />
        </button>
      </div>

      {/* RENDER GMAIL WORKSPACE */}
      {activeClient === 'gmail' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Inbox email list */}
          <div style={{
            width: '320px',
            borderRight: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Inbox size={16} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Corporate Inbox</h3>
              <span className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '2px 6px', marginLeft: 'auto' }}>
                {myEmails.filter(e => !e.read).length} unread
              </span>
            </div>

            {myEmails.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Mail size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
                <p style={{ fontSize: '0.8rem' }}>Your inbox is empty.</p>
              </div>
            ) : (
              myEmails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <button
                    key={email.id}
                    onClick={() => setSelectedEmailId(email.id)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      borderBottom: '1px solid var(--glass-border)',
                      background: isSelected ? 'var(--accent-light)' : 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: email.read ? 600 : 800,
                        color: email.read ? 'var(--text-secondary)' : 'var(--text-primary)'
                      }}>
                        {email.senderName}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.78rem',
                      fontWeight: email.read ? 500 : 700,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}>
                      {email.subject}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}>
                      {email.body}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Email detail view */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--bg-primary)' }}>
            {selectedEmail ? (
              <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {selectedEmail.subject}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700
                      }}>
                        {selectedEmail.senderName[0]}
                      </div>
                      <div>
                        <strong>{selectedEmail.senderName}</strong>{' '}
                        <span style={{ color: 'var(--text-muted)' }}>&lt;{selectedEmail.senderEmail}&gt;</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(selectedEmail.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="glass-card" style={{
                  padding: '24px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  lineHeight: '1.6',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedEmail.body}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <Inbox size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
                <p style={{ fontSize: '0.9rem' }}>Select an email to view details.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* RENDER GOOGLE CHAT SPACE */}
      {activeClient === 'chat' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Chat Spaces Left Panel */}
          <div style={{
            width: '280px',
            borderRight: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={16} style={{ color: 'var(--accent-indigo)' }} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Google Chat Spaces</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 8px', gap: '4px' }}>
              {chatSpaces.map(space => {
                const isActive = space.id === activeSpaceId;
                return (
                  <button
                    key={space.id}
                    onClick={() => setActiveSpaceId(space.id)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: 'none',
                      borderRadius: '8px',
                      background: isActive ? 'var(--accent-indigo-light)' : 'transparent',
                      color: isActive ? 'var(--accent-indigo)' : 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{space.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {space.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Space Chat Stream */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
            
            {/* Header info */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--glass-border)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                  {chatSpaces.find(s => s.id === activeSpaceId)?.name}
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {chatSpaces.find(s => s.id === activeSpaceId)?.description}
                </span>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.65rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <Sparkles size={10} />
                <span>Space Webhook Active</span>
              </span>
            </div>

            {/* Message Thread Box */}
            <div style={{
              flex: 1,
              padding: '24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {currentChatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  <MessageCircle size={36} style={{ opacity: 0.15, marginBottom: '10px' }} />
                  <p style={{ fontSize: '0.8rem' }}>No messages in this space yet. Type below to push updates!</p>
                </div>
              ) : (
                currentChatMessages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;
                  const isAuto = msg.text.startsWith('🤖');
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        flexDirection: isMe ? 'row-reverse' : 'row'
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: msg.avatarColor || '#6366f1',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {msg.senderName.replace('🤖 Auto-Response from ', '')[0]}
                      </div>

                      {/* Bubble */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 700 }}>
                          {msg.senderName}
                        </span>
                        <div style={{
                          background: isMe ? 'var(--accent-indigo)' : isAuto ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                          color: isMe ? 'white' : 'var(--text-primary)',
                          padding: '10px 14px',
                          borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                          border: isMe ? 'none' : '1px solid var(--glass-border)',
                          fontSize: '0.82rem',
                          lineHeight: '1.4',
                          whiteSpace: 'pre-wrap',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}>
                          {/* Basic markdown parsing for bold */}
                          {msg.text.split('\n').map((line, lIdx) => (
                            <div key={lIdx}>
                              {line.split('**').map((chunk, cIdx) => 
                                cIdx % 2 === 1 ? <strong key={cIdx}>{chunk}</strong> : chunk
                              )}
                            </div>
                          ))}
                        </div>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form Bar */}
            <form onSubmit={handleSendChat} style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--glass-border)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder={`Message ${chatSpaces.find(s => s.id === activeSpaceId)?.name}...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{
                  fontSize: '0.85rem',
                  padding: '10px 16px',
                  borderRadius: '24px'
                }}
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="btn btn-primary"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  padding: 0,
                  flexShrink: 0,
                  background: 'var(--gradient-secondary)',
                  boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)'
                }}
              >
                <SendHorizontal size={16} />
              </button>
            </form>

          </div>

        </div>
      )}

    </div>
  );
};
