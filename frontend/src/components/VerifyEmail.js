import React, { useEffect, useState } from 'react';

const VerifyEmail = ({ onDone }) => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    const API_BASE_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
      ? 'http://localhost:5000/api'
      : '/api';
    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now sign in.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }
      } catch (e) {
        setStatus('error');
        setMessage('Server error during verification.');
      }
    })();
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="smartcart-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{status === 'verifying' ? '⌛' : status === 'success' ? '✅' : '⚠️'}</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Email Verification</h2>
        <p style={{ color: '#6b7280' }}>{message}</p>
        <div style={{ marginTop: '1.25rem' }}>
          <button onClick={() => onDone ? onDone() : (window.location.href = '/')} className="smartcart-button">Go to Home</button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
