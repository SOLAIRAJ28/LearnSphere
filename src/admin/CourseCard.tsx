import React from 'react';
import type { Course } from '../types/course';

interface CourseCardProps {
  course: Course;
  onEdit: (courseId: string) => void;
  onShare: (courseId: string) => void;
  onView: (courseId: string) => void;
  onRemoveTag: (courseId: string, tag: string) => void;
  onPlayVideo?: (courseId: string) => void;
  hasVideo?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEdit,
  onShare,
  onView,
  onRemoveTag,
  onPlayVideo,
  hasVideo = false,
}) => {
  const imageUrl = course.imageUrl 
    ? (course.imageUrl.startsWith('http') ? course.imageUrl : `${course.imageUrl}`)
    : '';

  return (
    <div className="course-card">
      {course.isPublished && <div className="published-badge">Published</div>}
      {imageUrl && (
        <div className="course-image">
          <img src={imageUrl} alt={course.title} />
        </div>
      )}
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        
        <div className="course-tags">
          {course.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="course-stats">
          <div className="stat">
            <span className="stat-label">Enrolled</span>
            <span className="stat-value">{course.viewsCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Contents</span>
            <span className="stat-value">{course.lessonsCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Duration</span>
            <span className="stat-value">{course.totalDuration}</span>
          </div>
        </div>
        
        <div className="course-actions">
          {hasVideo && onPlayVideo && (
            <button
              className="action-btn play-video-btn"
              onClick={() => onPlayVideo(course._id)}
              title="Play course video"
              style={{
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                color: 'white',
                border: 'none',
              }}
            >
              ▶ Play Video
            </button>
          )}
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

        {/* Course Footer */}
        <div className="course-footer">
          <div className="footer-item">
            <span className="footer-icon">📅</span>
            <span className="footer-text">{new Date(course.createdAt).toLocaleDateString()}</span>
          </div>
          {course.responsible && (
            <div className="footer-item">
              <span className="footer-icon">👤</span>
              <span className="footer-text">{course.responsible}</span>
            </div>
          )}
          {course.visibility && (
            <div className="footer-item">
              <span className="footer-icon">👁️</span>
              <span className="footer-text">{course.visibility === 'everyone' ? 'Public' : 'Signed In'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
