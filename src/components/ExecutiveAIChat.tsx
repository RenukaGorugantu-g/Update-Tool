import React, { useState, useRef, useEffect } from 'react';
import { usePulse } from '../context/PulseContext';
import { X, Send, Bot, Sparkles, Trash2, ArrowRight } from 'lucide-react';

interface ExecutiveAIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveAIChat: React.FC<ExecutiveAIChatProps> = ({ isOpen, onClose }) => {
  const { chatHistory, addChatMessage, askExecutiveAI, clearChat } = usePulse();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Who has not updated today?",
    "Which projects are blocked?",
    "Show UAE team progress",
    "Summarize today's company activity",
    "Show Renuka's progress"
  ];

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // User message
    addChatMessage('user', text);
    setInputValue('');
    setIsTyping(true);

    try {
      const aiResponse = await askExecutiveAI(text);
      addChatMessage('ai', aiResponse);
    } catch (err) {
      addChatMessage('ai', "I encountered an issue processing that query. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputValue);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '420px',
      backgroundColor: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--glass-border)',
      boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.4)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Pulse AI Assistant</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>Online & Indexed</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={clearChat} 
            title="Clear Chat History"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px'
            }}
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages List Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              background: msg.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
              padding: '12px 16px',
              borderRadius: msg.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
              fontSize: '0.85rem',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--glass-border)'
            }}>
              {msg.text}
            </div>
            <span style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              marginTop: '4px',
              padding: '0 4px'
            }}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isTyping && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
            <div className="ai-typing-cursor" style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              padding: '12px 16px',
              borderRadius: '16px 16px 16px 0',
              fontSize: '0.85rem',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts list (if chat is empty or just started) */}
      <div style={{
        padding: '0 24px 12px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={12} style={{ color: 'var(--accent-primary)' }} />
          <span>Suggested Queries</span>
        </span>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="chip"
              style={{
                fontSize: '0.75rem',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{prompt}</span>
              <ArrowRight size={10} />
            </button>
          ))}
        </div>
      </div>

      {/* Footer Chat Input */}
      <div style={{
        padding: '20px 24px 24px 24px',
        borderTop: '1px solid var(--glass-border)',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Ask AI something..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isTyping}
          style={{ fontSize: '0.85rem' }}
        />
        <button
          onClick={() => handleSendMessage(inputValue)}
          disabled={isTyping || !inputValue.trim()}
          className="btn btn-primary"
          style={{
            width: '40px',
            height: '40px',
            padding: 0,
            borderRadius: '50%',
            flexShrink: 0
          }}
        >
          <Send size={16} />
        </button>
      </div>

      {/* CSS Animation keyframe for slide-in */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
