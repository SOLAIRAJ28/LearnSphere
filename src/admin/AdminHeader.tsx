import React from 'react';
import LogoutButton from '../components/LogoutButton';

const logo = '/y.png';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminHeader: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const tabs = ['Courses', 'Reporting', 'Settings'];

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="app-branding">
          <img src={logo} alt="LearnSphere" className="app-logo" />
          <span className="admin-badge">Admin</span>
        </div>
        <nav className="header-nav">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <LogoutButton variant="header" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
