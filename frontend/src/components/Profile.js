import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = ({ onBackHome }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Profile</h2>
        <p>Please sign in to view your profile.</p>
        {onBackHome && (
          <button
            onClick={onBackHome}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              cursor: 'pointer'
            }}
          >
            Go Home
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#111827' }}>👤 Profile</h2>
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: '1.5rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Full Name</div>
          <div style={{ color: '#111827', fontSize: 16 }}>{user.name || '-'}</div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Email</div>
          <div style={{ color: '#111827', fontSize: 16 }}>{user.email || '-'}</div>
        </div>
        {user.createdAt && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>Member Since</div>
            <div style={{ color: '#111827', fontSize: 16 }}>{new Date(user.createdAt).toLocaleDateString()}</div>
          </div>
        )}
        {/* Extend with more fields if signup collects them */}
      </div>
    </div>
  );
};

export default Profile;
