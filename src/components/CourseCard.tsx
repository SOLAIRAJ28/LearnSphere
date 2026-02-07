import React from 'react';
import type { Course } from '../types/course';

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
  const imageUrl = course.imageUrl 
    ? (course.imageUrl.startsWith('http') ? course.imageUrl : `http://localhost:5000${course.imageUrl}`)
    : '';

  return (
    <div className="course-card">
      {course.published && <div className="published-badge">Published</div>}
      
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
              <button
                className="tag-remove"
                onClick={() => onRemoveTag(course.id, tag)}
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
            <span className="stat-value">{course.views}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Contents</span>
            <span className="stat-value">{course.contents}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Duration</span>
            <span className="stat-value">{course.duration}</span>
          </div>
        </div>
        
        <div className="course-actions">
          <button
            className="action-btn share-btn"
            onClick={() => onShare(course.id)}
          >
            Share
          </button>
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit(course.id)}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
