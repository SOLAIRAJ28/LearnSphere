import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Course, ViewMode } from '../types/course';
import Header from './Header';
import SearchAndControls from './SearchAndControls';
import CourseCard from './CourseCard';
import CourseList from './CourseList';
import CreateCourseModal from './CreateCourseModal';
import { courseAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState('Courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from backend
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseAPI.getAllCourses(searchQuery);
      setCourses(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCourses();
  }, []);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter courses locally (already filtered by backend, but keep for real-time updates)
  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const handleCreateCourse = async (courseName: string) => {
    try {
      await courseAPI.createCourse({ title: courseName });
      await fetchCourses(); // Refresh the list
    } catch (err: any) {
      alert(err.message || 'Failed to create course');
    }
  };

  const handleEdit = (courseId: string) => {
    navigate(`/courses/${courseId}/edit`);
  };

  const handleShare = async (courseId: string) => {
    try {
      const response = await courseAPI.generateShareLink(courseId);
      const shareLink = response.data.shareLink;
      
      await navigator.clipboard.writeText(shareLink);
      
      const course = courses.find(c => c._id === courseId);
      alert(`Course link copied to clipboard:\n${shareLink}\n\nShare this link with specific people to give them access to "${course?.title}".`);
      
      // Refresh courses to update shareLink
      await fetchCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to generate share link');
    }
  };

  const handleRemoveTag = async (courseId: string, tag: string) => {
    try {
      await courseAPI.updateTags(courseId, tag, 'remove');
      await fetchCourses(); // Refresh the list
    } catch (err: any) {
      alert(err.message || 'Failed to remove tag');
    }
  };

  return (
    <div className="dashboard">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'Courses' && (
        <main className="dashboard-content">
          <SearchAndControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          
          {loading && <div className="loading">Loading courses...</div>}
          {error && <div className="error-message">{error}</div>}
          
          {!loading && !error && (
            <>
              {viewMode === 'kanban' ? (
                <div className="courses-kanban">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      onEdit={handleEdit}
                      onShare={handleShare}
                      onRemoveTag={handleRemoveTag}
                    />
                  ))}
                </div>
              ) : (
                <CourseList
                  courses={filteredCourses}
                  onEdit={handleEdit}
                  onShare={handleShare}
                  onRemoveTag={handleRemoveTag}
                />
              )}
            </>
          )}
          
          {!loading && !error && filteredCourses.length === 0 && (
            <div className="no-courses">No courses found</div>
          )}
          
          <button className="fab" onClick={() => setIsModalOpen(true)}>
            +
          </button>
          
          <CreateCourseModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreateCourse={handleCreateCourse}
          />
        </main>
      )}
      
      {activeTab === 'Reporting' && (
        <div className="tab-content">
          <h2>Reporting</h2>
          <p>Detailed reporting of courses</p>
        </div>
      )}
      
      {activeTab === 'Settings' && (
        <div className="tab-content">
          <h2>Settings</h2>
          <p>Application settings</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
