import React, { useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { Terminal, Send, Database, Network, ChevronRight } from 'lucide-react';

export const IntegrationHub: React.FC = () => {
  const { integrationLogs } = usePulse();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const activeLog = integrationLogs.find(l => l.id === selectedLogId) || integrationLogs[0];

  return (
    <div className="fade-in" style={{ padding: '8px 0' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Integration API Hub</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Monitor outbound API request payloads sent to Gmail, Google Chat, and workspace systems.
        </p>
      </div>

      {/* Integration status cards */}
      <div className="metrics-row" style={{ marginBottom: '28px' }}>
        
        {/* Gmail status */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-emerald)',
            boxShadow: '0 0 8px var(--accent-emerald)'
          }}></div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Gmail API Service</span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>oauth_v2: Connected</h4>
          </div>
        </div>

        {/* Google Chat Webhook status */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-emerald)',
            boxShadow: '0 0 8px var(--accent-emerald)'
          }}></div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Google Chat Webhooks</span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>spaces_v1: Connected</h4>
          </div>
        </div>

        {/* Google Drive status */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-amber)',
            boxShadow: '0 0 8px var(--accent-amber)'
          }}></div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Google Drive Indexer</span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>drive_v3: Listening</h4>
          </div>
        </div>

      </div>

      <div className="dashboard-grid">
        
        {/* Outbound API Logs list */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>Outbound API Request Logs</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
            {integrationLogs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 0',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                border: '1px dashed var(--glass-border)',
                borderRadius: '8px'
              }}>
                No outbound API requests logged today.<br/>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', display: 'inline-block' }}>
                  (Hint: Switch role to Executive, write a feedback comment on an employee card and click "Push Comment" with Gmail/Chat toggles on.)
                </span>
              </div>
            ) : (
              integrationLogs.map((log) => {
                const isSelected = activeLog?.id === log.id;
                return (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 'var(--border-radius-sm)',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                      background: isSelected ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`badge ${log.type === 'gmail' ? 'badge-info' : 'badge-indigo'}`} style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        {log.type}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{log.recipient}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.timestamp}</div>
                      </div>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Live Code / JSON viewer Console */}
        <div className="glass-card" style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#05070f', // Jet black for terminal contrast
          border: '1px solid var(--glass-border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
              <Terminal size={18} />
              <span>API Request Payload Console</span>
            </h3>
            <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', fontSize: '0.65rem' }}>
              HTTP 200 OK
            </span>
          </div>

          {activeLog ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
              
              {/* Endpoint Details */}
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>
                  <span style={{ color: '#f43f5e', fontWeight: 700 }}>METHOD: </span>
                  <span style={{ color: '#fff', fontFamily: 'monospace' }}>POST</span>
                </div>
                <div>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>URL: </span>
                  <span style={{ color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {JSON.parse(activeLog.payloadJSON).url || 'https://api.googleapis.com'}
                  </span>
                </div>
              </div>

              {/* JSON Editor Mock Body */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Outbound Request JSON Payload
                </span>
                
                <pre style={{
                  background: '#090d16',
                  color: '#34d399',
                  padding: '14px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  border: '1px solid rgba(255,255,255,0.05)',
                  flex: 1,
                  maxHeight: '280px',
                  lineHeight: '1.4'
                }}>
                  {activeLog.payloadJSON}
                </pre>
              </div>

              {/* Formatted body */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Send size={10} />
                  <span>Formatted Content Sent</span>
                </span>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                  {activeLog.body}
                </p>
              </div>

            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}>
              <Database size={24} style={{ marginBottom: '8px' }} />
              <span>Console idle. Select an outbound request log.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
