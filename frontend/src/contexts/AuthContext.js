import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Backend API base URL - force localhost in development regardless of NODE_ENV
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'  // Use full URL when running locally
    : '/api';  // Use relative path in actual production
  
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('window.location.hostname:', window.location.hostname);
  console.log('API_BASE_URL determined as:', API_BASE_URL);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(savedToken);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
          // Don't throw error, just continue without auth
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [API_BASE_URL]);

  const login = async (email, password) => {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Request payload:', { email, password: '***' });
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      // Check if response is ok first
      if (!response.ok) {
        const text = await response.text();
        console.log('Raw response text:', text);
        try {
          const data = JSON.parse(text);
          return { success: false, message: data.message || `Server error: ${response.status}`, pendingVerification: !!data.pendingVerification };
        } catch (parseError) {
          console.log('Parse error:', parseError);
          return { success: false, message: `Server returned non-JSON response: ${text.substring(0, 120)}...` };
        }
      }

      const text = await response.text();
      console.log('Raw successful response:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Failed to parse text:', text);
        return { success: false, message: `Invalid JSON response: ${parseError.message}` };
      }
      
      console.log('Login response:', data);

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Login failed', pendingVerification: !!data.pendingVerification };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: `Network error: ${error.message}. Please check if the backend server is running.` };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('Attempting registration to:', `${API_BASE_URL}/auth/register`);
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Request payload:', { name, email, password: '***' });
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      // Check if response is ok first
      if (!response.ok) {
        const text = await response.text();
        console.log('Raw response text:', text);
        try {
          const data = JSON.parse(text);
          return { success: false, message: data.message || `Server error: ${response.status}`, pendingVerification: !!data.pendingVerification };
        } catch (parseError) {
          console.log('Parse error:', parseError);
          return { success: false, message: `Server returned non-JSON response: ${text.substring(0, 100)}...` };
        }
      }

      const text = await response.text();
      console.log('Raw successful response:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Failed to parse text:', text);
        return { success: false, message: `Invalid JSON response: ${parseError.message}` };
      }
      
      console.log('Registration response:', data);

      if (data.success) {
        // For email verification flow, backend returns pendingVerification: true and no token/user
        if (data.pendingVerification) {
          return { success: true, pendingVerification: true, message: data.message, devVerifyUrl: data.devVerifyUrl };
        }
        // Fallback: if backend ever returns token/user on register
        if (data.token && data.user) {
          setUser(data.user);
          setToken(data.token);
          localStorage.setItem('token', data.token);
        }
        return { success: true, message: data.message, pendingVerification: !!data.pendingVerification, devVerifyUrl: data.devVerifyUrl };
      } else {
        return { success: false, message: data.message || 'Registration failed', pendingVerification: !!data.pendingVerification };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: `Network error: ${error.message}. Please check if the backend server is running.` };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch {
        return { success: false, message: `Unexpected response: ${text.substring(0, 100)}...` };
      }
      if (response.ok) return { success: true, message: data.message || 'Verification email resent' };
      return { success: false, message: data.message || 'Failed to resend verification email' };
    } catch (error) {
      return { success: false, message: `Network error: ${error.message}` };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    resendVerification,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Also export default for compatibility
export default AuthProvider;
