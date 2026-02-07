import React, { useState, useEffect } from 'react';
import { participantAPI } from '../services/api';
import '../styles/ParticipantDashboard.css';

interface Course {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  price: number;
  accessRules: string[];
  viewsCount: number;
  lessonsCount: number;
  totalDuration: number;
  enrollmentStatus: string | null;
  completionPercentage: number;
  isEnrolled: boolean;
  isPaid: boolean;
  isPaidCourse: boolean;
  canAccess: boolean;
}

interface Profile {
  name: string;
  email: string;
  totalPoints: number;
  badge: string;
  stats: {
    totalEnrollments: number;
    completedCourses: number;
    inProgressCourses: number;
  };
}

const ParticipantDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // For demo purposes, using a hardcoded userId. Replace with actual auth later
  const userId = '69870a7d923985d65efd7f16'; // John Doe's ID from seeded data

  useEffect(() => {
    fetchDashboardData();
  }, [searchQuery]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in (for demo, always true)
      setIsLoggedIn(true);

      // Fetch courses
      const coursesResponse = await participantAPI.getCourses(userId, searchQuery);
      setCourses(coursesResponse.data || []);

      // Fetch profile
      if (userId) {
        const profileResponse = await participantAPI.getProfile(userId);
        setProfile(profileResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!isLoggedIn) {
      alert('Please sign in to enroll in courses');
      return;
    }

    try {
      await participantAPI.enrollInCourse(courseId, userId);
      alert('Successfully enrolled in course!');
      fetchDashboardData();
    } catch (error: any) {
      alert(error.message || 'Failed to enroll in course');
    }
  };

  const handleContinue = async (courseId: string) => {
    // Navigate to course content page or mark as in progress
    try {
      await participantAPI.updateProgress(courseId, userId, 'In Progress');
      alert('Continuing course...');
      // In a real app, navigate to course content page
    } catch (error: any) {
      alert(error.message || 'Failed to continue course');
    }
  };

  const handleBuyCourse = async (courseId: string, price: number) => {
    if (!isLoggedIn) {
      alert('Please sign in to purchase courses');
      return;
    }

    // Simulate payment process
    const confirmPayment = window.confirm(
      `This will process payment of ₹${price}. Continue?\\n\\n(This is a demo - in production, this would redirect to Razorpay/PayPal)`
    );

    if (confirmPayment) {
      try {
        // Simulate payment ID (in production, this comes from payment gateway)
        const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await participantAPI.processPayment(courseId, userId, paymentId, price);
        alert('Payment successful! You are now enrolled in the course.');
        fetchDashboardData();
      } catch (error: any) {
        alert(error.message || 'Failed to process payment');
      }
    }
  };

  const getActionButton = (course: Course) => {
    // If paid course and not paid
    if (course.isPaidCourse && !course.isPaid) {
      return (
        <button 
          className="action-btn buy-btn"
          onClick={() => handleBuyCourse(course._id, course.price)}
        >
          Buy Course - ₹{course.price}
        </button>
      );
    }

    // If not enrolled
    if (!course.isEnrolled) {
      return (
        <button 
          className="action-btn join-btn"
          onClick={() => handleEnroll(course._id)}
        >
          Join Course
        </button>
      );
    }

    // If enrolled and in progress
    if (course.enrollmentStatus === 'In Progress') {
      return (
        <button 
          className="action-btn continue-btn"
          onClick={() => handleContinue(course._id)}
        >
          Continue
        </button>
      );
    }

    // If enrolled but not started
    if (course.enrollmentStatus === 'Yet to Start') {
      return (
        <button 
          className="action-btn continue-btn"
          onClick={() => handleContinue(course._id)}
        >
          Start Course
        </button>
      );
    }

    // If completed
    if (course.enrollmentStatus === 'Completed') {
      return (
        <button className="action-btn completed-btn" disabled>
          Completed ✓
        </button>
      );
    }

    return null;
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

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="participant-dashboard">
      {/* Header */}
      <header className="participant-header">
        <div className="header-content">
          <div className="logo">
            <h1>LearnSphere</h1>
          </div>
          
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="user-section">
            {isLoggedIn ? (
              <div className="user-info">
                <span className="user-name">{profile?.name || 'User'}</span>
                <div className="user-avatar">
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            ) : (
              <button className="sign-in-btn">Sign In</button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-container">
        <div className="courses-section">
          <h2 className="section-title">My Courses</h2>
          
          {courses.length === 0 ? (
            <div className="no-courses">
              <p>No courses found. {searchQuery && 'Try a different search.'}</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map((course) => {
                const imageUrl = course.imageUrl 
                  ? (course.imageUrl.startsWith('http') ? course.imageUrl : `http://localhost:5000${course.imageUrl}`)
                  : '';

                return (
                  <div key={course._id} className="course-card-participant">
                    {/* Labels */}
                    <div className="course-labels">
                      {course.isPaidCourse && (
                        <span className="label paid-label">
                          {course.isPaid ? 'Paid ✓' : `₹${course.price}`}
                        </span>
                      )}
                      {course.enrollmentStatus === 'In Progress' && (
                        <span className="label progress-label">
                          {course.completionPercentage}% Complete
                        </span>
                      )}
                    </div>

                    {/* Course Image */}
                    {imageUrl && (
                      <div className="course-image-participant">
                        <img src={imageUrl} alt={course.title} />
                      </div>
                    )}

                    {/* Course Content */}
                    <div className="course-content-participant">
                      <h3 className="course-title-participant">{course.title}</h3>
                      
                      <p className="course-description">
                        {course.description || 'No description available'}
                      </p>

                      {/* Course Tags */}
                      <div className="course-tags-participant">
                        {course.tags.map((tag, index) => (
                          <span key={index} className="tag-participant">{tag}</span>
                        ))}
                      </div>

                      {/* Course Stats */}
                      <div className="course-stats-participant">
                        <span className="stat-item">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13z"/>
                            <path d="M8 4a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-4.25A.75.75 0 0 1 7.25 9V4.75A.75.75 0 0 1 8 4z"/>
                          </svg>
                          {course.totalDuration} min
                        </span>
                        <span className="stat-item">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-11h-8A1 1 0 0 0 3.5 2.5v11a1 1 0 0 0 1 1h1.75a.75.75 0 0 1 0 1.5h-2.5A2.5 2.5 0 0 1 2 13.5v-11z"/>
                          </svg>
                          {course.lessonsCount} lessons
                        </span>
                      </div>

                      {/* Action Button */}
                      <div className="course-action">
                        {getActionButton(course)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile Sidebar */}
        {profile && (
          <div className="profile-sidebar">
            <div className="profile-card">
              <h3 className="profile-title">My Profile</h3>
              
              {/* Circular Progress */}
              <div className="progress-circle">
                <svg viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={getBadgeColor(profile.badge)}
                    strokeWidth="6"
                    strokeDasharray={`${(profile.totalPoints / 120) * 283} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="progress-center">
                  <div className="points-value">{profile.totalPoints}</div>
                  <div className="points-label">Points</div>
                </div>
              </div>

              {/* Badge */}
              <div 
                className="badge-display" 
                style={{ backgroundColor: getBadgeColor(profile.badge) }}
              >
                {profile.badge}
              </div>

              {/* Stats */}
              <div className="profile-stats">
                <div className="stat-row">
                  <span className="stat-label">Total Courses</span>
                  <span className="stat-value">{profile.stats.totalEnrollments}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">In Progress</span>
                  <span className="stat-value">{profile.stats.inProgressCourses}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Completed</span>
                  <span className="stat-value">{profile.stats.completedCourses}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantDashboard;
