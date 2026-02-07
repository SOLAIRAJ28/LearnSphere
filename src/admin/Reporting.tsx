import React, { useState, useEffect } from 'react';
import { enrollmentAPI } from '../services/api';
import '../styles/Reporting.css';

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    title: string;
  };
  userId: {
    _id: string;
    username: string;
    name?: string;
    email: string;
    totalPoints?: number;
  };
  enrolledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  timeSpent: number;
  completionPercentage: number;
  status: 'Yet to Start' | 'In Progress' | 'Completed';
}

interface Summary {
  totalParticipants: number;
  yetToStart: number;
  inProgress: number;
  completed: number;
}

const Reporting: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalParticipants: 0,
    yetToStart: 0,
    inProgress: 0,
    completed: 0
  });
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments(selectedStatus);
  }, [selectedStatus]);

  const fetchEnrollments = async (status: string) => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getEnrollments(status);
      console.log('Enrollment API response:', response);
      
      // Handle response shape: { success, data, summary }
      const enrollmentData = response.data || [];
      const summaryData = response.summary || {
        totalParticipants: 0,
        yetToStart: 0,
        inProgress: 0,
        completed: 0
      };
      
      setEnrollments(Array.isArray(enrollmentData) ? enrollmentData : []);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTimeSpent = (minutes: number) => {
    if (minutes === 0) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Yet to Start':
        return 'status-yet-to-start';
      case 'In Progress':
        return 'status-in-progress';
      case 'Completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  const getBadge = (points: number = 0) => {
    if (points >= 120) return 'Master';
    else if (points >= 100) return 'Expert';
    else if (points >= 80) return 'Specialist';
    else if (points >= 60) return 'Achiever';
    else if (points >= 40) return 'Explorer';
    else if (points >= 20) return 'Newbie';
    return 'Newbie';
  };

  const getBadgeColor = (badge: string) => {
    const colors: { [key: string]: string } = {
      'Newbie': '#9e9e9e',
      'Explorer': '#2196f3',
      'Achiever': '#4caf50',
      'Specialist': '#ff9800',
      'Expert': '#f44336',
      'Master': '#9c27b0'
    };
    return colors[badge] || '#9e9e9e';
  };

  return (
    <div className="reporting-page">
      <div className="reporting-header">
        <h1>Reporting / Overview</h1>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon total">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="card-content">
            <h3>{summary.totalParticipants}</h3>
            <p>Total Participants</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon yet-to-start">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <rect x="8" y="8" width="8" height="8"></rect>
            </svg>
          </div>
          <div className="card-content">
            <h3>{summary.yetToStart}</h3>
            <p>Yet to Start</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon in-progress">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="card-content">
            <h3>{summary.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon completed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="card-content">
            <h3>{summary.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      <div className="reporting-content">
        {/* Filters */}
        <div className="filters-section">
          <h3>Course Status</h3>
          <div className="filter-options">
            <label className="filter-option">
              <input
                type="radio"
                name="status"
                value="All"
                checked={selectedStatus === 'All'}
                onChange={(e) => setSelectedStatus(e.target.value)}
              />
              <span>All</span>
            </label>
            <label className="filter-option">
              <input
                type="radio"
                name="status"
                value="Yet to Start"
                checked={selectedStatus === 'Yet to Start'}
                onChange={(e) => setSelectedStatus(e.target.value)}
              />
              <span>Yet to Start</span>
            </label>
            <label className="filter-option">
              <input
                type="radio"
                name="status"
                value="In Progress"
                checked={selectedStatus === 'In Progress'}
                onChange={(e) => setSelectedStatus(e.target.value)}
              />
              <span>In Progress</span>
            </label>
            <label className="filter-option">
              <input
                type="radio"
                name="status"
                value="Completed"
                checked={selectedStatus === 'Completed'}
                onChange={(e) => setSelectedStatus(e.target.value)}
              />
              <span>Completed</span>
            </label>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="table-section">
          {loading ? (
            <div className="loading">Loading enrollments...</div>
          ) : (
            <table className="enrollments-table">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Participant Name</th>
                  <th>Points & Badge</th>
                  <th>Enrollment Date</th>
                  <th>Started Date</th>
                  <th>Time Spent</th>
                  <th>Progress</th>
                  <th>Completed Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="no-data">
                      No enrollments found
                    </td>
                  </tr>
                ) : (
                  enrollments.map((enrollment) => {
                    const userPoints = enrollment.userId?.totalPoints || 0;
                    const userBadge = getBadge(userPoints);
                    const badgeColor = getBadgeColor(userBadge);
                    const courseName = enrollment.courseId?.title || 'N/A';
                    const participantName = enrollment.userId?.name || enrollment.userId?.username || 'N/A';
                    
                    return (
                      <tr key={enrollment._id}>
                        <td title={courseName}>{courseName}</td>
                        <td title={participantName}>{participantName}</td>
                        <td>
                          <div className="points-badge-cell">
                            <div className="points-display">
                              <span className="points-value">{userPoints}</span>
                              <span className="points-label">pts</span>
                            </div>
                            <div 
                              className="badge-mini" 
                              style={{ backgroundColor: badgeColor }}
                            >
                              {userBadge}
                            </div>
                          </div>
                        </td>
                        <td>{formatDate(enrollment.enrolledAt)}</td>
                        <td>{formatDate(enrollment.startedAt)}</td>
                        <td>{formatTimeSpent(enrollment.timeSpent)}</td>
                        <td>
                          <div className="completion-cell">
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${enrollment.completionPercentage}%` }}
                              ></div>
                            </div>
                            <span className="percentage-text">
                              {enrollment.completionPercentage}%
                            </span>
                          </div>
                        </td>
                        <td>{formatDate(enrollment.completedAt)}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(enrollment.status)}`}>
                            {enrollment.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reporting;
