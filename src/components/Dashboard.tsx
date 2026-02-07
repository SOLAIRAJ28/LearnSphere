import React, { useState, useMemo } from 'react';
import type { Course, ViewMode } from '../types/course';
import Header from './Header';
import SearchAndControls from './SearchAndControls';
import CourseCard from './CourseCard';
import CourseList from './CourseList';
import CreateCourseModal from './CreateCourseModal';

// Sample initial courses
const initialCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Odoo AI',
    tags: ['tag1', 'tag2', 'tag3'],
    views: 5,
    contents: 15,
    duration: '25:30',
    published: true,
  },
  {
    id: '2',
    title: 'Basics of Odoo CRM',
    tags: ['tag1', 'tag2', 'tag3'],
    views: 20,
    contents: 20,
    duration: '20:35',
    published: true,
  },
  {
    id: '3',
    title: 'About Odoo Courses',
    tags: ['tag1', 'tag2', 'tag3'],
    views: 10,
    contents: 10,
    duration: '10:20',
    published: true,
  },
];

const Dashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [activeTab, setActiveTab] = useState('Courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const handleCreateCourse = (courseName: string) => {
    const newCourse: Course = {
      id: Date.now().toString(),
      title: courseName,
      tags: [],
      views: 0,
      contents: 0,
      duration: '00:00',
      published: false,
    };
    setCourses([...courses, newCourse]);
  };

  const handleEdit = (courseId: string) => {
    alert(`Edit course: ${courseId}\n\nThis will open the course form where you can configure contents and course details.`);
  };

  const handleShare = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    const shareLink = `https://elearning.app/course/${courseId}`;
    navigator.clipboard.writeText(shareLink);
    alert(`Course link copied to clipboard:\n${shareLink}\n\nShare this link with specific people to give them access to "${course?.title}".`);
  };

  const handleRemoveTag = (courseId: string, tag: string) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? { ...course, tags: course.tags.filter((t) => t !== tag) }
          : course
      )
    );
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
          
          {viewMode === 'kanban' ? (
            <div className="courses-kanban">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
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
