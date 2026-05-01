// src/pages/ProfilePage.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import { logout } from '../services/authService';

const ProfilePage = ({ user }) => {
  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  if (!user) return null;

  return (
    <div className="page-container" style={{ paddingBottom: '6rem' }}>
      <Navbar user={user} />
      
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          margin: '0 auto 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          fontWeight: 'bold',
          color: 'var(--bg-primary)'
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        
        <h2 style={{ marginBottom: '0.5rem' }}>{user.name}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{user.email}</p>
        
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Account Type</span>
            <span style={{ fontWeight: 'bold', textTransform: 'capitalize', color: 'var(--accent-primary)' }}>{user.role}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Account Status</span>
            <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>Active</span>
          </div>
        </div>

        <button 
          className="btn btn-danger w-full" 
          onClick={handleLogout}
          style={{ height: '50px', fontSize: '1.1rem' }}
        >
          Logout Securely
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
