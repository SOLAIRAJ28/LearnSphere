import React from 'react';
import type { ViewMode } from '../types/course';

interface SearchAndControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const SearchAndControls: React.FC<SearchAndControlsProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="search-controls">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="view-toggles">
        <button
          className={`view-toggle ${viewMode === 'kanban' ? 'active' : ''}`}
          onClick={() => onViewModeChange('kanban')}
          title="Kanban view"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'kanban' ? 'currentColor' : 'none'} />
            <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'kanban' ? 'currentColor' : 'none'} />
            <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'kanban' ? 'currentColor' : 'none'} />
            <rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'kanban' ? 'currentColor' : 'none'} />
          </svg>
        </button>
        <button
          className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => onViewModeChange('list')}
          title="List view"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="3" width="16" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'list' ? 'currentColor' : 'none'} />
            <rect x="2" y="8.5" width="16" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'list' ? 'currentColor' : 'none'} />
            <rect x="2" y="14" width="16" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" fill={viewMode === 'list' ? 'currentColor' : 'none'} />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchAndControls;
