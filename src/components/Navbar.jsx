// src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  return (
    <nav className="card flex-center" style={{ 
      justifyContent: 'space-between', 
      padding: '1rem 1.5rem', 
      marginBottom: '2rem',
      borderRadius: 'var(--border-radius)'
    }}>
      <h2 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(to right, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        EduQuiz
      </h2>
      
      {user && (
        <div className="flex-center" style={{ gap: '1rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            Hi, {user.name.split(' ')[0]}
          </span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
