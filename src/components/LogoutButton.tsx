import React from 'react';
import { handleLogout } from '../utils/auth';
import '../styles/Logout.css';

interface LogoutButtonProps {
  variant?: 'header' | 'dropdown' | 'button';
  className?: string;
}

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
        🚪 Logout
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <button 
        className={`logout-btn logout-dropdown ${className}`}
        onClick={onLogout}
      >
        <span className="logout-icon">🚪</span>
        <span>Logout</span>
      </button>
    );
  }

  return (
    <button 
      className={`logout-btn logout-button ${className}`}
      onClick={onLogout}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
