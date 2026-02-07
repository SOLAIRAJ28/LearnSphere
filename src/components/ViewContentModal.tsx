import React, { useState, useEffect } from 'react';
import { contentAPI } from '../services/api';
import type { Content } from '../types/course';
import '../styles/ViewContentModal.css';

interface ViewContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

const ViewContentModal: React.FC<ViewContentModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
}) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Content | null>(null);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchContents();
    }
  }, [isOpen, courseId]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contentAPI.getCourseContents(courseId);
      const data = response.data || response;
      setContents(data);
    } catch (err) {
      console.error('Error fetching contents:', err);
      setError('Failed to load contents');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    switch (lowerCategory) {
      case 'video':
        return '🎥';
      case 'document':
        return '📄';
      case 'image':
        return '🖼️';
      case 'article':
        return '📰';
      case 'quiz':
        return '❓';
      case 'presentation':
        return '📊';
      case 'infographic':
        return '📈';
      default:
        return '📁';
    }
  };

  const getCategoryColor = (category: string) => {
    const lowerCategory = category.toLowerCase();
    switch (lowerCategory) {
      case 'video':
        return '#ff4757';
      case 'document':
        return '#5352ed';
      case 'image':
        return '#20bf6b';
      case 'article':
        return '#f79f1f';
      case 'quiz':
        return '#a29bfe';
      case 'presentation':
        return '#0984e3';
      case 'infographic':
        return '#fd79a8';
      default:
        return '#636e72';
    }
  };

  const groupContentsByCategory = () => {
    const grouped: { [key: string]: Content[] } = {};
    contents.forEach((content) => {
      const category = content.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(content);
    });
    return grouped;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getContentUrl = (content: Content) => {
    // For uploaded videos, use the streaming API
    if (content.videoFileId) {
      return `/api/video/${content.videoFileId}`;
    }
    
    const url = content.videoLink || content.fileUrl || content.imageUrl || content.url;
    if (!url) return null;

    // If it's already a full URL (http/https), return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it starts with /, it's already an absolute path
    if (url.startsWith('/')) {
      return url;
    }

    // Remove 'public/' prefix if present
    let cleanUrl = url;
    if (cleanUrl.startsWith('public/')) {
      cleanUrl = cleanUrl.substring(7);
    }

    // For local files, serve from public folder at root level
    return `/${cleanUrl}`;
  };

  if (!isOpen) return null;

  const groupedContents = groupContentsByCategory();
  const categories = Object.keys(groupedContents);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="view-content-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📚 {courseTitle}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Video Player Section */}
          {selectedVideo && (
            <div className="video-player-section" style={{ marginBottom: '24px' }}>
              <div className="video-player-header">
                <h3>{selectedVideo.title}</h3>
                <button 
                  className="close-player-btn"
                  onClick={() => setSelectedVideo(null)}
                >
                  Close Player
                </button>
              </div>
              <div className="video-player-container" style={{ position: 'relative', paddingBottom: 0, height: 'auto' }}>
                <video 
                  controls 
                  style={{ 
                    width: '100%', 
                    maxHeight: '500px',
                    backgroundColor: '#000',
                    borderRadius: '0 0 12px 12px'
                  }}
                  src={getContentUrl(selectedVideo) || undefined}
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              {selectedVideo.description && (
                <div className="video-description">
                  <p>{selectedVideo.description}</p>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <p>Loading contents...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && contents.length === 0 && (
            <div className="empty-state">
              <p>No contents available for this course yet.</p>
              <p style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
                Go to Edit → Add Content to add videos, documents, or images.
              </p>
            </div>
          )}

          {!loading && !error && contents.length > 0 && (
            <>
              <div className="content-summary">
                <div className="summary-card">
                  <span className="summary-label">Total Contents</span>
                  <span className="summary-value">{contents.length}</span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Total Duration</span>
                  <span className="summary-value">
                    {formatDuration(
                      contents.reduce((sum, c) => sum + (c.duration || 0), 0)
                    )}
                  </span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Categories</span>
                  <span className="summary-value">{categories.length}</span>
                </div>
              </div>

              <div className="content-categories">
                {categories.map((category) => (
                  <div key={category} className="category-section">
                    <div className="category-header">
                      <span className="category-icon">
                        {getCategoryIcon(category)}
                      </span>
                      <h3 className="category-title">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </h3>
                      <span className="category-count">
                        ({groupedContents[category].length})
                      </span>
                    </div>

                    <div className="content-list">
                      {groupedContents[category].map((content) => (
                        <div
                          key={content._id}
                          className="content-item"
                          style={{
                            borderLeft: `4px solid ${getCategoryColor(category)}`,
                          }}
                        >
                          <div className="content-info">
                            <h4 className="content-title">{content.title}</h4>
                            {content.description && (
                              <p className="content-description">
                                {content.description}
                              </p>
                            )}
                            {content.duration > 0 && (
                              <span className="content-duration">
                                ⏱️ {formatDuration(content.duration)}
                              </span>
                            )}
                          </div>
                          <div className="content-actions">
                            {content.category?.toLowerCase() === 'video' && (
                              <button
                                className="content-link-btn"
                                onClick={() => setSelectedVideo(content)}
                                style={{ 
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  border: 'none'
                                }}
                              >
                                ▶️ Play Video
                              </button>
                            )}
                            {content.category?.toLowerCase() !== 'video' && getContentUrl(content) && (
                              <button
                                className="content-link-btn"
                                onClick={() => {
                                  const link = getContentUrl(content);
                                  if (link) {
                                    window.open(link, '_blank');
                                  }
                                }}
                                style={{
                                  background: 'linear-gradient(135deg, #5352ed 0%, #3742fa 100%)',
                                  color: 'white',
                                  border: 'none'
                                }}
                              >
                                📄 Open
                              </button>
                            )}
                            {content.attachmentUrl && (
                              <button
                                className="content-link-btn"
                                onClick={() => {
                                  window.open(content.attachmentUrl!, '_blank');
                                }}
                                style={{
                                  background: 'linear-gradient(135deg, #20bf6b 0%, #0fb9b1 100%)',
                                  color: 'white',
                                  border: 'none'
                                }}
                              >
                                📎 Attachment
                              </button>
                            )}
                            {content.attachmentLink && (
                              <button
                                className="content-link-btn"
                                onClick={() => {
                                  window.open(content.attachmentLink!, '_blank');
                                }}
                                style={{
                                  background: 'linear-gradient(135deg, #f79f1f 0%, #f0932b 100%)',
                                  color: 'white',
                                  border: 'none'
                                }}
                              >
                                🔗 Link
                              </button>
                            )}
                            {content.allowDownload && content.fileUrl && (
                              <button
                                className="content-download-btn"
                                onClick={() => {
                                  const link = getContentUrl(content);
                                  if (link) {
                                    window.open(link, '_blank');
                                  }
                                }}
                              >
                                ⬇️ Download
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="close-footer-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewContentModal;
