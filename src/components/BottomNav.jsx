// src/components/BottomNav.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Professional SVG Icons
const Icons = {
  Home: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  Panel: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="3" y1="9" x2="21" y2="9"></line>
      <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
  ),
  Activity: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  ),
  Profile: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  )
};

const BottomNav = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isTeacher = user.role === 'teacher';
  
  // Define modern nav items
  const navItems = isTeacher 
    ? [
        { path: '/teacher', label: 'Dashboard', icon: <Icons.Panel /> },
        { path: '/profile', label: 'Account', icon: <Icons.Profile /> }
      ]
    : [
        { path: '/dashboard', label: 'Home', icon: <Icons.Home /> },
        { path: '/result', label: 'Activity', icon: <Icons.Activity /> },
        { path: '/profile', label: 'Account', icon: <Icons.Profile /> }
      ];

  const checkIsActive = (path) => {
    if (path === '/profile') return location.pathname === '/profile';
    if (path === '/result') return location.pathname === '/result';
    if (path === '/dashboard') return location.pathname.includes('/dashboard') || location.pathname.includes('/quiz');
    if (path === '/teacher') return location.pathname === '/teacher';
    return false;
  };

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const isActive = checkIsActive(item.path);

        return (
          <div 
            key={item.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <div className="bottom-nav-icon-wrapper">
              {item.icon}
            </div>
            <span className="bottom-nav-label">{item.label}</span>
            {isActive && <div className="bottom-nav-indicator" />}
          </div>
        );
      })}
    </div>
  );
};

export default BottomNav;
