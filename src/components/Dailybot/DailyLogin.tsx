import React, { useState } from 'react';
import { usePulse } from '../../context/PulseContext';

export const DailyLogin: React.FC = () => {
  const { login } = usePulse();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = login(identifier, password);
    if (!ok) setError('Invalid credentials. Check Admin panel for generated password.');
  };

  return (
    <div className="daily-login">
      <form onSubmit={handleSubmit}>
        <label className="daily-label">Email or Employee ID</label>
        <input className="daily-input" value={identifier} onChange={e => setIdentifier(e.target.value)} />

        <label className="daily-label">Password</label>
        <input type="password" className="daily-input" value={password} onChange={e => setPassword(e.target.value)} />

        {error && <div className="daily-error">{error}</div>}

        <button type="submit" className="daily-btn">Sign In</button>
      </form>
    </div>
  );
};
