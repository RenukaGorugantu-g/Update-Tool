import React, { useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { Landmark, MapPin, User } from 'lucide-react';

export const OrgChart: React.FC = () => {
  const { users } = usePulse();
  const [selectedPod, setSelectedPod] = useState<'All' | 'India' | 'UAE'>('All');

  // CEO / Root
  const ceo = users.find(u => u.id === 'u-admin');

  // Get employees by Pod & Department
  const getEmployeesInDept = (podName: 'India Pod' | 'UAE Pod', deptName: string) => {
    return users.filter(u => u.role === 'employee' && u.pod === podName && u.department.toLowerCase().includes(deptName.toLowerCase()) && u.active);
  };

  return (
    <div className="fade-in" style={{ padding: '8px 0' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Company Hierarchy Map</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Dynamic reporting structure, pod allocations, and departmental groupings.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          padding: '4px',
          borderRadius: '20px',
          border: '1px solid var(--glass-border)'
        }}>
          {['All', 'India', 'UAE'].map((pod) => (
            <button
              key={pod}
              onClick={() => setSelectedPod(pod as any)}
              className="btn"
              style={{
                padding: '6px 16px',
                fontSize: '0.8rem',
                borderRadius: '16px',
                background: (selectedPod === pod) ? 'var(--bg-secondary)' : 'transparent',
                color: (selectedPod === pod) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: (selectedPod === pod) ? 700 : 500
              }}
            >
              {pod === 'All' ? 'All Pods' : `${pod} Pod`}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Tree */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center', margin: '20px 0' }}>
        
        {/* CEO Root Node (Only visible when showing all or India where CEO sits) */}
        {selectedPod === 'All' && ceo && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div className="glass-card" style={{
              padding: '16px 24px',
              border: '2px solid var(--accent-primary)',
              boxShadow: '0 0 20px rgba(var(--accent-primary-rgb), 0.1)',
              textAlign: 'center',
              width: '240px',
              zIndex: 2
            }}>
              <Landmark size={20} style={{ color: 'var(--accent-primary)', marginBottom: '6px' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{ceo.name}</h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>
                CEO & Super Admin
              </p>
              <span className="badge badge-danger" style={{ marginTop: '8px', fontSize: '0.65rem' }}>Global Pod Root</span>
            </div>
            
            {/* Connector Line */}
            <div style={{
              width: '2px',
              height: '30px',
              backgroundColor: 'var(--glass-border)',
              marginTop: '0px'
            }}></div>
          </div>
        )}

        {/* Pod Split Row */}
        <div style={{
          display: 'flex',
          gap: '40px',
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '100%',
          flexWrap: 'wrap'
        }}>
          
          {/* ================== India Pod ================== */}
          {(selectedPod === 'All' || selectedPod === 'India') && (
            <div className="glass-card" style={{
              padding: '24px',
              flex: '1',
              minWidth: '320px',
              maxWidth: '540px',
              background: 'rgba(255, 255, 255, 0.01)',
              borderTop: '4px solid var(--accent-indigo)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <MapPin size={18} style={{ color: 'var(--accent-indigo)' }} />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>India Operations Pod</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Location: Bengaluru / Hub</span>
                </div>
              </div>

              {/* Department branches */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Web Team */}
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', padding: '14px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-indigo)', textTransform: 'uppercase' }}>
                      Web Team
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lead: Sandeep</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {getEmployeesInDept('India Pod', 'Web').map(emp => (
                      <div key={emp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                          <User size={12} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontWeight: 700 }}>{emp.name}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{emp.employeeId}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* eLearning Team */}
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', padding: '14px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-indigo)', textTransform: 'uppercase' }}>
                      eLearning Team
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lead: Krishna</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {getEmployeesInDept('India Pod', 'Learning').map(emp => (
                      <div key={emp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                          <User size={12} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontWeight: 700 }}>{emp.name}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{emp.employeeId}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Marketing & Sales Team */}
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', padding: '14px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-indigo)', textTransform: 'uppercase' }}>
                      Marketing & Sales Team
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lead: Rathish</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {getEmployeesInDept('India Pod', 'Marketing').map(emp => (
                      <div key={emp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                          <User size={12} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontWeight: 700 }}>{emp.name}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{emp.employeeId}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================== UAE Pod ================== */}
          {(selectedPod === 'All' || selectedPod === 'UAE') && (
            <div className="glass-card" style={{
              padding: '24px',
              flex: '1',
              minWidth: '320px',
              maxWidth: '540px',
              background: 'rgba(255, 255, 255, 0.01)',
              borderTop: '4px solid var(--accent-amber)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <MapPin size={18} style={{ color: 'var(--accent-amber)' }} />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>UAE Client Pod</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Location: Dubai / Hub</span>
                </div>
              </div>

              {/* Department branches */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Sales Team */}
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', padding: '14px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
                      Sales & Growth
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lead: David Vance</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {getEmployeesInDept('UAE Pod', 'Sales').map(emp => (
                      <div key={emp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                          <User size={12} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontWeight: 700 }}>{emp.name}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{emp.employeeId}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Client Success */}
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', padding: '14px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
                      Client Success
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lead: Sarah Chen</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {getEmployeesInDept('UAE Pod', 'Success').map(emp => (
                      <div key={emp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                          <User size={12} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontWeight: 700 }}>{emp.name}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{emp.employeeId}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
