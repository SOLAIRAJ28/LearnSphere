import React from 'react';
import type { Course } from '../types/course';

interface CourseListProps {
  courses: Course[];
  onEdit: (courseId: string) => void;
  onShare: (courseId: string) => void;
  onView: (courseId: string) => void;
  onRemoveTag: (courseId: string, tag: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  onEdit,
  onShare,
  onView,
  onRemoveTag,
}) => {
  return (
    <div className="course-list">
      <table className="course-table">
        <thead>
          <tr>
            <th>Course Title</th>
            <th>Tags</th>
            <th>Views</th>
            <th>Lessons</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course._id}>
              <td>
                <span className="course-title-link">{course.title}</span>
              </td>
              <td>
                <div className="course-tags-list">
                  {course.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button
                        className="tag-remove"
                        onClick={() => onRemoveTag(course._id, tag)}
                        title="Remove tag"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </td>
              <td>{course.viewsCount}</td>
              <td>{course.lessonsCount}</td>
              <td>{course.totalDuration}</td>
              <td>
                {course.isPublished && (
                  <span className="status-badge published">Published</span>
                )}
              </td>
              <td>
                <div className="table-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => onView(course._id)}
                  >
                    View
                  </button>
                  <button
                    className="action-btn share-btn"
                    onClick={() => onShare(course._id)}
                  >
                    Share
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => onEdit(course._id)}
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseList;
