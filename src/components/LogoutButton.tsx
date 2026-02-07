import React from 'react';
import { handleLogout } from '../utils/auth';
import '../styles/Logout.css';

interface LogoutButtonProps {
  variant?: 'header' | 'dropdown' | 'button';
  className?: string;
}

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 3h6a1 1 0 0 1 0 2H5v14h6a1 1 0 0 1 0 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
    <path d="M16.293 7.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L18.586 13H9a1 1 0 0 1 0-2h9.586l-2.293-2.293a1 1 0 0 1 0-1.414z"/>
  </svg>
);

const LogoutButton: React.FC<LogoutButtonProps> = ({ variant = 'header', className = '' }) => {
  const onLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      handleLogout();
    }
  };

  if (variant === 'header') {
    return (
      <button 
        className={`logout-btn logout-header ${className}`}
        onClick={onLogout}
        title="Logout"
      >
        <LogoutIcon /> Logout
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <button 
        className={`logout-btn logout-dropdown ${className}`}
        onClick={onLogout}
      >
        <LogoutIcon />
        <span>Logout</span>
      </button>
    );
  }

  return (
    <button 
      className={`logout-btn logout-button ${className}`}
      onClick={onLogout}
    >
      <LogoutIcon /> Logout
    </button>
  );
};

export default LogoutButton;
