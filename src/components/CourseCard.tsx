import React from 'react';
import type { Course } from '../types/course';
import { formatDuration } from '../utils/helpers';

interface CourseCardProps {
  course: Course;
  onEdit: (courseId: string) => void;
  onShare: (courseId: string) => void;
  onRemoveTag: (courseId: string, tag: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEdit,
  onShare,
  onRemoveTag,
}) => {
  return (
    <div className="course-card">
      {course.isPublished && <div className="published-badge">Published</div>}
      
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        
        <div className="course-tags">
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
        
        <div className="course-stats">
          <div className="stat">
            <span className="stat-label">Views</span>
            <span className="stat-value">{course.viewsCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Contents</span>
            <span className="stat-value">{course.lessonsCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Duration</span>
            <span className="stat-value">{formatDuration(course.totalDuration)}</span>
          </div>
        </div>
        
        <div className="course-actions">
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
      </div>
    </div>
  );
};

export default CourseCard;
