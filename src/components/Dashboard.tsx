import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Course, ViewMode } from '../types/course';
import { courseAPI, contentAPI } from '../services/api';
import Header from './Header';
import SearchAndControls from './SearchAndControls';
import CourseCard from './CourseCard';
import CourseList from './CourseList';
import CreateCourseModal from './CreateCourseModal';
import ViewContentModal from './ViewContentModal';
import VideoPlayerModal from './VideoPlayerModal';
import Reporting from './Reporting';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>('');
  const [selectedCourseForVideo, setSelectedCourseForVideo] = useState<string>('');
  const [coursesWithVideo, setCoursesWithVideo] = useState<Set<string>>(new Set());

  // Check which courses have video content
  const checkCoursesForVideos = async (coursesToCheck: Course[]) => {
    const courseIdsWithVideo = new Set<string>();
    
    for (const course of coursesToCheck) {
      try {
        const response = await contentAPI.getContents(course._id);
        const contents = response.data || response;
        // Check if any content has a videoFileId
        const hasVideo = contents.some((content: any) => content.videoFileId);
        if (hasVideo) {
          courseIdsWithVideo.add(course._id);
        }
      } catch (error) {
        console.error(`Error checking video for course ${course._id}:`, error);
      }
    }
    
    setCoursesWithVideo(courseIdsWithVideo);
  };

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
        // Check for videos after setting courses
        checkCoursesForVideos(coursesWithArrayTags);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

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

  const handleShare = (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    const shareLink = `https://elearning.app/course/${courseId}`;
    navigator.clipboard.writeText(shareLink);
    alert(`Course link copied to clipboard:\n${shareLink}\n\nShare this link with specific people to give them access to "${course?.title}".`);
  };

  const handleView = (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    if (course) {
      setSelectedCourseId(courseId);
      setSelectedCourseTitle(course.title);
      setIsViewModalOpen(true);
    }
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
    setSelectedCourseForVideo(courseId);
    setIsVideoModalOpen(true);
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
              onPlayVideo={handlePlayVideo}
              hasVideo={(courseId) => coursesWithVideo.has(courseId)}
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
          
          <ViewContentModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            courseId={selectedCourseId}
            courseTitle={selectedCourseTitle}
          />
          
          <VideoPlayerModal
            isOpen={isVideoModalOpen}
            onClose={() => setIsVideoModalOpen(false)}
            courseId={selectedCourseForVideo}
          />
        </main>
      )}
      
      {activeTab === 'Reporting' && (
        <Reporting />
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
