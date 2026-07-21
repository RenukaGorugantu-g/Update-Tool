import React, { useMemo, useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { buildTeamAnalytics, exportAnalyticsToCsv, getPeriodLabel } from '../utils/reporting';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertOctagon, 
  Search, 
  Mail, 
  Sparkles, 
  
  SlidersHorizontal,
  Bot,
  Volume2,
  Download,
  UserRound
} from 'lucide-react';
import { ExecutiveAIChat } from './ExecutiveAIChat';

export const ExecutiveDashboard: React.FC = () => {
  const { 
    currentUser, 
    users, 
    updates, 
    playElevenLabsTTS,
    isVoiceLoading
  } = usePulse();

  // Search and Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRange, setSelectedRange] = useState<'daily' | 'weekly' | 'sprint' | 'monthly'>('sprint');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  if (!currentUser) return null;
  const [selectedPod, setSelectedPod] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [showBlockersOnly, setShowBlockersOnly] = useState(false);
  
  // (comments moved to Reports view)

  // Chat Panel State
  const [isChatOpen, setIsChatOpen] = useState(false);

  const analytics = useMemo(() => buildTeamAnalytics({ updates, users, range: selectedRange }), [updates, users, selectedRange]);
  const sprintUpdates = analytics.rangeUpdates;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayUpdates = sprintUpdates.filter((u) => u.date === todayStr);
  const totalEmployees = users.filter((u) => u.role === 'employee' && u.active);
  const submittedCount = todayUpdates.length;
  const pendingCount = Math.max(0, totalEmployees.length - submittedCount);
  const activeBlockers = sprintUpdates.filter((u) => {
    const blockers: string[] = u.blockers || [];
    return blockers.some((entry: string) => {
      const normalized = String(entry || '').trim().toLowerCase();
      return normalized !== '' && normalized !== 'none' && normalized !== 'none reported';
    });
  }).length;

  // Summary numbers for top badges
  const submittedToday = analytics.employeeSummaries.filter((summary) => summary.updates.some((update) => update.date === todayStr)).length;
  const totalEmployeesActive = users.filter((u) => u.role === 'employee' && u.active).length || 1;
  const completionPct = Math.round((submittedToday / totalEmployeesActive) * 100);

  const selectedEmployeeSummary = analytics.employeeSummaries.find((summary) => summary.employeeId === selectedEmployee) || null;

  const safeBlockers = (blockers: string[] = []) => (blockers || []).filter((entry) => {
    const normalized = String(entry || '').trim().toLowerCase();
    return normalized !== '' && normalized !== 'none' && normalized !== 'none reported';
  });

  const handleExport = () => {
    const rows = analytics.employeeSummaries.map((summary) => ({
      Employee: summary.employeeName,
      Department: summary.department,
      Pod: summary.pod,
      Submissions: summary.submittedCount,
      CompletedTasks: summary.tasksCompleted,
      WorkingTasks: summary.tasksWorking,
      Blockers: summary.blockers,
      LastUpdate: summary.lastUpdate || 'No updates'
    }));
    exportAnalyticsToCsv(`executive-${selectedRange}.csv`, rows);
  };

  // Comment posting handled from Reports view; kept here for compatibility.

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
      
      {/* comments moved to Reports view */}

      {/* Floating AI Panel Toggle */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
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
            Logged in: <strong>{currentUser.name}</strong> ({currentUser.email}). Monitor work status and push approvals. Comments can be routed through Gmail and Google Chat as part of the executive review flow.
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

      {/* Landing-style summary badges */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <select value={selectedRange} onChange={(event) => setSelectedRange(event.target.value as 'daily' | 'weekly' | 'sprint' | 'monthly')} style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="sprint">Sprint</option>
          <option value="monthly">Monthly</option>
        </select>
        <button onClick={handleExport} className="btn btn-secondary" style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <div className="summary-row">
        <div className="summary-badge">
          <div className={`summary-circle pct`} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>{completionPct}%</div>
          <div>
            <div className="summary-text">{submittedToday} responses</div>
            <div className="summary-sub">of {totalEmployeesActive} expected</div>
          </div>
        </div>

        <div className="summary-badge">
          <div className="summary-circle alert" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' }}>🔥</div>
          <div>
            <div className="summary-text">{activeBlockers} blocker{activeBlockers !== 1 ? 's' : ''}</div>
            <div className="summary-sub">attention points</div>
          </div>
        </div>

        <div className="summary-badge">
          <div className="summary-circle" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>🕒</div>
          <div>
            <div className="summary-text">{Math.max(0, totalEmployeesActive - submittedToday)} pending</div>
            <div className="summary-sub">responses</div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '20px', display: 'grid', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Team pulse for {getPeriodLabel(selectedRange)}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>See submission completeness, task volume, and blockers for each employee in one place.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {analytics.employeeSummaries.length === 0 ? (
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>No data available for this period yet.</div>
          ) : analytics.employeeSummaries.map((summary) => (
            <button key={summary.employeeId} type="button" onClick={() => setSelectedEmployee(summary.employeeId)} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: '10px', background: selectedEmployee === summary.employeeId ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)', border: selectedEmployee === summary.employeeId ? '1px solid var(--accent-emerald)' : '1px solid var(--glass-border)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '999px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserRound size={15} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800 }}>{summary.employeeName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{summary.department} • {summary.pod}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'flex-end' }}>
                  <span className="badge badge-success">{summary.submittedCount} updates</span>
                  <span className="badge badge-info">{summary.tasksCompleted} completed</span>
                  <span className="badge badge-warning">{summary.blockers} blockers</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedEmployeeSummary && (
        <div className="glass-card" style={{ padding: '20px', display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{selectedEmployeeSummary.employeeName} full report</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Detailed sprint/month history for the selected employee, including submitted updates and blockers.</p>
            </div>
            <button type="button" onClick={() => setSelectedEmployee(null)} className="btn btn-secondary">Clear selection</button>
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span className="badge badge-success">{selectedEmployeeSummary.submittedCount} submissions</span>
              <span className="badge badge-info">{selectedEmployeeSummary.tasksCompleted} completed tasks</span>
              <span className="badge badge-warning">{selectedEmployeeSummary.blockers} blockers</span>
              <span className="badge badge-secondary">Last update: {selectedEmployeeSummary.lastUpdate || 'No updates'}</span>
            </div>
            {selectedEmployeeSummary.updates.length === 0 ? (
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>No updates recorded for this employee in the selected range.</div>
            ) : selectedEmployeeSummary.updates.map((update) => (
              <div key={update.id} style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 800 }}>{update.date}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{update.projectName}</div>
                </div>
                <div style={{ marginTop: '8px', display: 'grid', gap: '8px' }}>
                  <div><strong>Completed:</strong> {safeBlockers(update.completed).length ? safeBlockers(update.completed).join(' • ') : 'No entries'}</div>
                  <div><strong>Working:</strong> {safeBlockers(update.working).length ? safeBlockers(update.working).join(' • ') : 'No entries'}</div>
                  <div><strong>Blockers:</strong> {safeBlockers(update.blockers).length ? safeBlockers(update.blockers).join(' • ') : 'No blockers'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="metrics-row">
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', gridColumn: 'span 3' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'var(--gradient-indigo)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
          }}>
            <Mail size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Channel Delivery</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px' }}>Gmail + Google Chat ready</h3>
            <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Comments and follow-ups will continue delivering through configured Gmail and Chat streams.</p>
          </div>
        </div>
      </div>
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

        <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Submissions moved to Reports</h3>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>To reduce duplication, individual submissions and historical reports are now available under <strong>Reports</strong> in the left sidebar. Use that view to filter, export, and inspect per-user history.</p>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => window.dispatchEvent(new CustomEvent('pulse:setActiveTab', { detail: 'reports' }))} className="btn btn-primary">Open Reports</button>
          </div>
        </div>

      </div>

      {/* Slide-out AI Panel Drawer */}
      <ExecutiveAIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};
