import React from 'react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const tabs = ['Courses', 'Reporting', 'Settings'];

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="app-branding">
          <h1 className="app-name">E-Learning</h1>
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
      </div>
    </header>
  );
};

export default Header;
