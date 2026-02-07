import React from 'react';
import type { Course } from '../types/course';

interface CourseListProps {
  courses: Course[];
  onEdit: (courseId: string) => void;
  onShare: (courseId: string) => void;
  onView: (courseId: string) => void;
  onRemoveTag: (courseId: string, tag: string) => void;
  onPlayVideo?: (courseId: string) => void;
  hasVideo?: (courseId: string) => boolean;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  onEdit,
  onShare,
  onView,
  onRemoveTag,
  onPlayVideo,
  hasVideo,
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
                  {hasVideo && hasVideo(course._id) && onPlayVideo && (
                    <button
                      className="action-btn play-video-btn"
                      onClick={() => onPlayVideo(course._id)}
                      title="Play course video"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                      }}
                    >
                      ▶ Play Video
                    </button>
                  )}
                  <button
                    className="action-btn view-btn"
                    onClick={() => onView(course._id)}
                    title="View course details"
                  >
                    View
                  </button>
                  <button
                    className="action-btn share-btn"
                    onClick={() => onShare(course._id)}
                    title="Share this course"
                  >
                    Share
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => onEdit(course._id)}
                    title="Edit course"
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
