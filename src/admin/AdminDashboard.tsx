import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Course, ViewMode } from '../types/course';
import { courseAPI, contentAPI } from '../services/api';
import AdminHeader from './AdminHeader';
import SearchAndControls from './SearchAndControls';
import CourseCard from './CourseCard';
import CourseList from './CourseList';
import CreateCourseModal from './CreateCourseModal';
import VideoPlayerModal from '../components/VideoPlayerModal';
import ViewContentModal from '../components/ViewContentModal';
import Reporting from './Reporting';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedCourseForVideo, setSelectedCourseForVideo] = useState<Course | null>(null);
  const [coursesWithVideo, setCoursesWithVideo] = useState<Set<string>>(new Set());
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseAPI.getAllCourses();
        const data = response.data || response;
        // Convert tags string to array if needed
        const coursesWithArrayTags = data.map((course: any) => ({
          ...course,
          tags: typeof course.tags === 'string' 
            ? course.tags.split(' ').filter((t: string) => t) 
            : course.tags
        }));
        setCourses(coursesWithArrayTags);
        // Check which courses have video content
        checkCoursesForVideos(coursesWithArrayTags);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Check which courses have video content
  const checkCoursesForVideos = async (courseList: Course[]) => {
    const videoSet = new Set<string>();
    
    // Check each course for video content
    const checks = courseList.map(async (course) => {
      try {
        const response = await contentAPI.getCourseContents(course._id);
        const contents = response.data || response;
        const hasVideo = contents.some(
          (content: any) => content.category === 'video' && content.videoFileId
        );
        if (hasVideo) {
          videoSet.add(course._id);
        }
      } catch (error) {
        console.error(`Error checking video for course ${course._id}:`, error);
      }
    });
    
    await Promise.all(checks);
    setCoursesWithVideo(videoSet);
  };

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const handleCreateCourse = async (courseName: string) => {
    try {
      const response = await courseAPI.createCourse({ title: courseName });
      const newCourse = response.data || response;
      // Convert tags if needed
      const courseWithArrayTags = {
        ...newCourse,
        tags: typeof newCourse.tags === 'string' 
          ? newCourse.tags.split(' ').filter((t: string) => t) 
          : newCourse.tags || []
      };
      setCourses([...courses, courseWithArrayTags]);
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    }
  };

  const handleEdit = (courseId: string) => {
    navigate(`/admin/courses/${courseId}/edit`);
  };

  const handleView = (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    if (course) {
      setSelectedCourse(course);
      setViewModalOpen(true);
    }
  };

  const handleShare = (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    const shareLink = `https://elearning.app/course/${courseId}`;
    navigator.clipboard.writeText(shareLink);
    alert(`Course link copied to clipboard:\n${shareLink}\n\nShare this link with specific people to give them access to "${course?.title}".`);
  };

  const handleRemoveTag = (courseId: string, tag: string) => {
    setCourses(
      courses.map((course) =>
        course._id === courseId
          ? { ...course, tags: course.tags.filter((t) => t !== tag) }
          : course
      )
    );
  };

  const handlePlayVideo = (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    if (course) {
      setSelectedCourseForVideo(course);
      setIsVideoModalOpen(true);
    }
  };

  return (
    <div className="dashboard">
      <AdminHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'Courses' && (
        <main className="dashboard-content">
          <div className="page-header-section">
            <h1 className="page-title">LearnSphere</h1>
            <p className="page-subtitle">Empowering Education Through Technology</p>
            
            <div className="feature-banner">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="feature-info">
                  <span className="feature-label">User Management</span>
                  <span className="feature-desc">Students & Instructors</span>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <div className="feature-info">
                  <span className="feature-label">Course Library</span>
                  <span className="feature-desc">Extensive Content</span>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div className="feature-info">
                  <span className="feature-label">Assessments</span>
                  <span className="feature-desc">Quizzes & Exams</span>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="feature-info">
                  <span className="feature-label">Progress Tracking</span>
                  <span className="feature-desc">Analytics & Reports</span>
                </div>
              </div>
            </div>
          </div>
          
          <SearchAndControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading courses...</div>
          ) : viewMode === 'kanban' ? (
            <div className="courses-kanban">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onEdit={handleEdit}
                  onShare={handleShare}
                  onView={handleView}
                  onRemoveTag={handleRemoveTag}
                  onPlayVideo={handlePlayVideo}
                  hasVideo={coursesWithVideo.has(course._id)}
                />
              ))}
            </div>
          ) : (
            <CourseList
              courses={filteredCourses}
              onEdit={handleEdit}
              onShare={handleShare}
              onView={handleView}
              onRemoveTag={handleRemoveTag}
            />
          )}
          
          <button className="fab" onClick={() => setIsModalOpen(true)}>
            +
          </button>
          
          <CreateCourseModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreateCourse={handleCreateCourse}
          />

          {selectedCourseForVideo && (
            <VideoPlayerModal
              isOpen={isVideoModalOpen}
              onClose={() => {
                setIsVideoModalOpen(false);
                setSelectedCourseForVideo(null);
              }}
              courseId={selectedCourseForVideo._id}
              courseTitle={selectedCourseForVideo.title}
            />
          )}
          
          {selectedCourse && (
            <ViewContentModal
              isOpen={viewModalOpen}
              onClose={() => {
                setViewModalOpen(false);
                setSelectedCourse(null);
              }}
              courseId={selectedCourse._id}
              courseTitle={selectedCourse.title}
            />
          )}
        </main>
      )}
      
      {activeTab === 'Reporting' && (
        <Reporting />
      )}
      
      {activeTab === 'Settings' && (
        <div className="settings-container">
          <div className="settings-header">
            <h1>Settings</h1>
            <p className="settings-subtitle">Manage your account information</p>
          </div>

          <div className="settings-grid">
            {/* Profile Settings */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-icon profile-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <h3>Profile Settings</h3>
                  <p>Manage your account information</p>
                </div>
              </div>
              <div className="settings-card-content">
                <div className="settings-item">
                  <label>Admin Name</label>
                  <input 
                    type="text" 
                    className="settings-input" 
                    defaultValue="Administrator"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="settings-item">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    className="settings-input" 
                    defaultValue="admin@kec.edu"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="settings-item">
                  <label>Department</label>
                  <select className="settings-input">
                    <option>Information Technology</option>
                    <option>Computer Science</option>
                    <option>Electronics</option>
                    <option>Mechanical</option>
                    <option>Civil</option>
                  </select>
                </div>
                <button className="settings-save-btn">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>LearnSphere</h3>
            <p>Modern Learning Management System</p>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <p>Email: support@learnsphere.com</p>
            <p>Help Center: help.learnsphere.com</p>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <p>Documentation</p>
            <p>Community Forum</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 LearnSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
