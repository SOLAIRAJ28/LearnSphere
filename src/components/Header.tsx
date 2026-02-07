import React from 'react';
import logo from '../assets/logo.svg';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const tabs = ['Courses', 'Reporting', 'Settings'];
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="app-branding">
          <img src={logo} alt="KEC LearnHub" className="app-logo" />
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
          <button
            className="nav-tab participant-link"
            onClick={() => navigate('/participant')}
          >
            🎓 Participant View
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
