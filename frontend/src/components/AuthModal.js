import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose, onAuthSuccess, mode: initialMode = 'login', onSwitchMode }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, register, resendVerification } = useAuth();
  const [pendingEmail, setPendingEmail] = useState('');
  const [devVerifyUrl, setDevVerifyUrl] = useState('');

  // Keep internal mode in sync with the prop when the modal opens or prop changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        
        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          setSuccess('Registration successful! Welcome to SmartCart!');
          setTimeout(() => { 
            onClose(); 
            if (onAuthSuccess) onAuthSuccess();
          }, 1500);
        } else {
          setError(result.message);
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          setSuccess('Login successful! Welcome back!');
          setTimeout(() => {
            onClose();
            if (onAuthSuccess) onAuthSuccess();
          }, 1500);
        } else {
          setError(result.message);
          if (result.notRegistered) {
            setSuccess('No account found for this email. Please register first.');
          }
        }
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    }
    
    setLoading(false);
  };

  const switchMode = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
  setPendingEmail('');
  setDevVerifyUrl('');
    if (onSwitchMode) onSwitchMode(newMode);
  };

  const handleResend = async () => {
    if (!pendingEmail && !formData.email) {
      setError('Please enter your email to resend verification.');
      return;
    }
    setLoading(true);
    const email = pendingEmail || formData.email;
    const res = await resendVerification(email);
    setLoading(false);
    if (res.success) {
      setSuccess(res.message);
      setError('');
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '3rem',
        maxWidth: '480px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '0.5rem',
            borderRadius: '50%',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
            e.target.style.color = '#374151';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#6b7280';
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🛍️
          </div>
          <h2 style={{ 
            color: '#1f2937', 
            margin: '0 0 0.5rem 0',
            fontSize: '1.8rem',
            fontWeight: 'bold'
          }}>
            {mode === 'login' ? 'Welcome Back!' : 'Join SmartCart'}
          </h2>
          <p style={{ 
            color: '#6b7280', 
            margin: 0,
            fontSize: '1rem'
          }}>
            {mode === 'login' 
              ? 'Sign in to access your personalized shopping experience' 
              : 'Create your account for AI-powered recommendations'}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid #fecaca',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#f0fdf4',
            color: '#16a34a',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid #bbf7d0',
            textAlign: 'center'
          }}>
            {success}
            {devVerifyUrl && (
              <div style={{ marginTop: 8, fontSize: '0.9rem' }}>
                Dev-only: You can verify using this link:
                <div style={{ wordBreak: 'break-all', marginTop: 4 }}>
                  <a href={devVerifyUrl} target="_blank" rel="noreferrer">{devVerifyUrl}</a>
                </div>
              </div>
            )}
            {(pendingEmail || (mode === 'login' && error && error.toLowerCase().includes('not verified'))) && (
              <div style={{ marginTop: '0.75rem', color: '#065f46' }}>
                Didn\'t get the email? Check spam or
                <button onClick={handleResend} disabled={loading} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#0ea5e9', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                  Resend verification
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
          {mode === 'register' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#374151',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#f9fafb'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#f9fafb';
                }}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#f9fafb'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
              }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: mode === 'register' ? '1.5rem' : '2rem' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#f9fafb'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
              }}
              placeholder={mode === 'register' ? 'Create a password (min 6 characters)' : 'Enter your password'}
            />
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                color: '#374151',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#f9fafb'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = 'white';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#f9fafb';
                }}
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading 
                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ 
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '0.5rem'
                }} />
                Processing...
              </span>
            ) : (
              mode === 'login' ? '🔑 Sign In' : '🎉 Create Account'
            )}
          </button>

          {(pendingEmail || (mode === 'login' && error && error.toLowerCase().includes('not verified'))) && (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginTop: '0.75rem',
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ✉️ Resend Verification Email
            </button>
          )}
        </form>

        {/* Switch Mode */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={switchMode}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline',
              transition: 'color 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.color = '#4f46e5'}
            onMouseOut={(e) => e.target.style.color = '#667eea'}
          >
            {mode === 'login' ? 'Sign up here' : 'Sign in instead'}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AuthModal;
