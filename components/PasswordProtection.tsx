import React, { useState, FormEvent } from 'react';
import { LockIcon } from './icons/LockIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface PasswordProtectionProps {
  onSuccess: () => void;
}

const APP_PASSWORD = process.env.APP_PASSWORD;
const SESSION_KEY = 'etsy-studio-authenticated';

export const PasswordProtection: React.FC<PasswordProtectionProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    // Simulate a small delay for better UX
    setTimeout(() => {
      if (password === APP_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        onSuccess();
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem', backgroundColor: 'var(--c-bg)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <div className="input-header" style={{ justifyContent: 'center', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
             <div className="icon-wrapper">
                <LockIcon />
             </div>
            <h1 style={{ fontSize: '1.25rem' }}>Authentication Required</h1>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--c-text-muted)', marginTop: 0, marginBottom: '1.5rem' }}>
            Please enter the password to access the studio.
          </p>
          
          {error && <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

          <div>
            <label htmlFor="password-input" className="sr-only">Password</label>
            <input
              id="password-input"
              type="password"
              className="textarea"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              style={{ textAlign: 'center' }}
              aria-describedby={error ? "password-error" : undefined}
            />
             {error && <span id="password-error" className="sr-only">{error}</span>}
          </div>

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="button button-primary"
          >
            {isLoading ? (
                <>
                    <SpinnerIcon className="spinner button-icon" />
                    Unlocking...
                </>
            ) : 'Unlock'}
          </button>
        </form>
      </div>
       <style>{`.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}`}</style>
    </div>
  );
};