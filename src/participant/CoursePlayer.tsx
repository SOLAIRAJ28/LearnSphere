import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentAPI, courseAPI, participantAPI } from '../services/api';
import { getCurrentUser } from '../utils/auth';
import type { Content } from '../types/course';
import '../styles/CoursePlayer.css';

interface CourseInfo {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  lessonsCount: number;
  totalDuration: number;
}

const CoursePlayer: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userId = currentUser?._id || '';

  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch course info and contents in parallel
      const [courseRes, contentsRes] = await Promise.all([
        courseAPI.getCourse(courseId!),
        contentAPI.getCourseContents(courseId!),
      ]);

      const courseData = courseRes.data || courseRes;
      const contentsData = contentsRes.data || contentsRes;

      setCourse(courseData);
      setContents(contentsData);

      // Auto-select first video content
      const firstVideo = contentsData.find(
        (c: Content) => c.category === 'video' && c.videoFileId
      );
      if (firstVideo) {
        setSelectedContent(firstVideo);
      } else if (contentsData.length > 0) {
        setSelectedContent(contentsData[0]);
      }

      // Update enrollment progress to "In Progress"
      if (userId) {
        try {
          await participantAPI.updateProgress(courseId!, userId, 'In Progress');
        } catch {
          // Ignore if progress update fails
        }
      }
    } catch (err: any) {
      console.error('Error loading course:', err);
      setError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const getVideoUrl = (content: Content) => {
    if (content.videoFileId) {
      return `http://localhost:5000/api/video/${content.videoFileId}`;
    }
    if (content.videoLink) return content.videoLink;
    if (content.url) return content.url;
    return null;
  };

  const handleContentSelect = (content: Content) => {
    setSelectedContent(content);
  };

  const handleBack = () => {
    navigate('/participant');
  };

  if (loading) {
    return (
      <div className="course-player-loading">
        <div className="cp-spinner"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-player-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleBack}>← Back to Courses</button>
      </div>
    );
  }

  return (
    <div className="course-player">
      {/* Top Bar */}
      <div className="cp-topbar">
        <button className="cp-back-btn" onClick={handleBack}>
          ← Back
        </button>
        <h1 className="cp-course-title">{course?.title}</h1>
        <div className="cp-course-meta">
          <span>{contents.length} lessons</span>
          <span>•</span>
          <span>{course?.totalDuration || 0} min</span>
        </div>
      </div>

      <div className="cp-main">
        {/* Video Player Area */}
        <div className="cp-player-area">
          {selectedContent ? (
            <>
              {selectedContent.category === 'video' && selectedContent.videoFileId ? (
                <div className="cp-video-container">
                  <video
                    key={selectedContent._id}
                    controls
                    autoPlay
                    preload="metadata"
                    className="cp-video"
                  >
                    <source
                      src={getVideoUrl(selectedContent) || ''}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : selectedContent.category === 'video' && selectedContent.videoLink ? (
                <div className="cp-video-container">
                  <video
                    key={selectedContent._id}
                    controls
                    autoPlay
                    preload="metadata"
                    className="cp-video"
                  >
                    <source src={selectedContent.videoLink} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="cp-no-video">
                  <div className="cp-no-video-icon">📄</div>
                  <h3>{selectedContent.title}</h3>
                  <p>This content does not have a video.</p>
                  {selectedContent.url && (
                    <a
                      href={selectedContent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-open-link"
                    >
                      Open Resource →
                    </a>
                  )}
                </div>
              )}

              {/* Content Details below video */}
              <div className="cp-content-details">
                <h2 className="cp-content-title">{selectedContent.title}</h2>
                <div className="cp-content-meta">
                  {selectedContent.duration > 0 && (
                    <span className="cp-meta-item">⏱ {selectedContent.duration} min</span>
                  )}
                  {selectedContent.responsible && (
                    <span className="cp-meta-item">👤 {selectedContent.responsible}</span>
                  )}
                  <span className="cp-meta-item cp-category-badge">
                    {selectedContent.category}
                  </span>
                </div>
                {selectedContent.description && (
                  <p className="cp-content-description">{selectedContent.description}</p>
                )}
              </div>
            </>
          ) : (
            <div className="cp-no-content">
              <div className="cp-no-content-icon">🎬</div>
              <h3>No content available</h3>
              <p>The instructor hasn't added any content for this course yet.</p>
            </div>
          )}
        </div>

        {/* Sidebar - Content List */}
        <div className="cp-sidebar">
          <div className="cp-sidebar-header">
            <h3>Course Content</h3>
            <span className="cp-lesson-count">{contents.length} lessons</span>
          </div>
          <div className="cp-content-list">
            {contents.map((content, index) => (
              <div
                key={content._id}
                className={`cp-content-item ${
                  selectedContent?._id === content._id ? 'active' : ''
                }`}
                onClick={() => handleContentSelect(content)}
              >
                <div className="cp-item-number">{index + 1}</div>
                <div className="cp-item-info">
                  <span className="cp-item-title">{content.title}</span>
                  <div className="cp-item-meta">
                    <span className="cp-item-type">
                      {content.category === 'video' && content.videoFileId
                        ? '🎥'
                        : content.category === 'video'
                        ? '🔗'
                        : content.category === 'document'
                        ? '📄'
                        : content.category === 'image'
                        ? '🖼️'
                        : '📌'}
                    </span>
                    {content.duration > 0 && (
                      <span className="cp-item-duration">
                        {content.duration} min
                      </span>
                    )}
                  </div>
                </div>
                {selectedContent?._id === content._id && (
                  <div className="cp-playing-indicator">▶</div>
                )}
              </div>
            ))}

            {contents.length === 0 && (
              <div className="cp-no-lessons">
                <p>No lessons added yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
