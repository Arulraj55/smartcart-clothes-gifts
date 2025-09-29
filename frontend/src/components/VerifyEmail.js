import React, { useEffect, useRef, useState } from 'react';

const VerifyEmail = ({ onDone }) => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [devVerifyUrl, setDevVerifyUrl] = useState('');
  const didRunRef = useRef(false);

  useEffect(() => {
  if (didRunRef.current) return; // Guard against StrictMode double-invoke in dev
  didRunRef.current = true;
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const email = params.get('email');
    // Prefer explicit API base when provided (e.g. Render URL), else localhost in dev, else relative '/api'
    const explicitBase = (process.env.REACT_APP_API_BASE_URL || '').trim();
    const API_BASE_URL = explicitBase
      ? explicitBase.replace(/\/$/, '')
      : ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
          ? 'http://localhost:5000/api'
          : '/api');
    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link.');
      if (email) setCanResend(true);
      return;
    }
    (async () => {
      const withTimeout = (p, ms = 8000) => {
        return Promise.race([
          p,
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
        ]);
      };
      try {
        const res = await withTimeout(fetch(`${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`));
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now sign in.');
          return;
        }
        // Fallback to REST style endpoint without email
        const res2 = await withTimeout(fetch(`${API_BASE_URL}/auth/verify/${encodeURIComponent(token)}`));
        const data2 = await res2.json();
        if (res2.ok && data2.success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now sign in.');
          return;
        }
        const errMsg = (data && data.message) || (data2 && data2.message) || 'Verification failed.';
        setStatus('error');
        setMessage(errMsg);
        if (email) setCanResend(true);
      } catch (e) {
        try {
          // Final fallback: REST style only
          const res3 = await fetch(`${API_BASE_URL}/auth/verify/${encodeURIComponent(token)}`);
          const data3 = await res3.json();
          if (res3.ok && data3.success) {
            setStatus('success');
            setMessage('Email verified successfully! You can now sign in.');
            return;
          }
          setStatus('error');
          setMessage(data3.message || 'Server error during verification.');
          if (email) setCanResend(true);
        } catch (e2) {
          setStatus('error');
          setMessage(e.message === 'timeout' ? 'Verification timed out. Please try again.' : 'Server error during verification.');
          if (email) setCanResend(true);
        }
      }
    })();
  }, []);

  const handleResend = async () => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    if (!email) return;
    setResending(true);
    try {
      const explicitBase = (process.env.REACT_APP_API_BASE_URL || '').trim();
      const API_BASE_URL = explicitBase
        ? explicitBase.replace(/\/$/, '')
        : ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
            ? 'http://localhost:5000/api'
            : '/api');
      const res = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('We sent you a new verification email. Please check your inbox.');
        setDevVerifyUrl(data.devVerifyUrl || '');
      } else {
        setMessage(data.message || 'Failed to resend verification email.');
      }
    } catch (err) {
      setMessage('Failed to resend verification email due to a network error.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="smartcart-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{status === 'verifying' ? '⌛' : status === 'success' ? '✅' : '⚠️'}</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Email Verification</h2>
        <p style={{ color: '#6b7280' }}>{message}</p>
        {status === 'error' && canResend && (
          <div style={{ marginTop: '0.75rem' }}>
            <button disabled={resending} onClick={handleResend} className="smartcart-button">
              {resending ? 'Resending…' : 'Resend verification email'}
            </button>
          </div>
        )}
        {devVerifyUrl && (
          <div style={{ marginTop: '0.75rem' }}>
            <button onClick={() => (window.location.href = devVerifyUrl)} className="smartcart-button secondary">
              Open new verification link (dev)
            </button>
          </div>
        )}
        <div style={{ marginTop: '1.25rem' }}>
          <button onClick={() => onDone ? onDone() : (window.location.href = '/')} className="smartcart-button">Go to Home</button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
