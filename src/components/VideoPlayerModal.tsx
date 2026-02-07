import React, { useState, useEffect } from 'react';
import { contentAPI } from '../services/api';
import type { Content } from '../types/course';
import '../styles/VideoPlayerModal.css';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
}) => {
  const [videoContent, setVideoContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchVideoContent();
    }
  }, [isOpen, courseId]);

  const fetchVideoContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contentAPI.getCourseContents(courseId);
      const contents = response.data || response;
      
      // Find the first video content with videoFileId
      const video = contents.find((content: Content) => 
        content.category === 'video' && content.videoFileId
      );
      
      if (!video) {
        setError('No video found for this course');
        return;
      }
      
      setVideoContent(video);
    } catch (err) {
      console.error('Error fetching video content:', err);
      setError('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const getVideoUrl = () => {
    if (!videoContent?.videoFileId) return null;
    return `http://localhost:5000/api/video/${videoContent.videoFileId}`;
  };

  if (!isOpen) return null;

  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="video-modal-header">
          <h2>{courseTitle}</h2>
          <button className="close-modal-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="video-modal-body">
          {loading && (
            <div className="video-loading">
              <div className="spinner"></div>
              <p>Loading video...</p>
            </div>
          )}

          {error && (
            <div className="video-error">
              <p>{error}</p>
              <button onClick={fetchVideoContent}>Retry</button>
            </div>
          )}

          {!loading && !error && videoContent && (
            <div className="video-player-wrapper">
              {videoContent.title && (
                <h3 className="video-title">{videoContent.title}</h3>
              )}
              <video
                controls
                width="100%"
                preload="metadata"
                autoPlay
                style={{
                  maxHeight: '70vh',
                  backgroundColor: '#000',
                  borderRadius: '8px',
                }}
                src={getVideoUrl() || undefined}
              >
                Your browser does not support the video tag.
              </video>
              {videoContent.description && (
                <div className="video-description">
                  <p>{videoContent.description}</p>
                </div>
              )}
              {videoContent.duration > 0 && (
                <div className="video-info">
                  <span>Duration: {videoContent.duration} minutes</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="video-modal-footer">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
