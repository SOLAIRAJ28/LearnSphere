import React, { useState, useEffect } from 'react';
import type { Course, CourseTab, ContentItem } from '../types/course';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCourse: (course: Course) => void;
  course: Course | null;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({
  isOpen,
  onClose,
  onUpdateCourse,
  course,
}) => {
  const [activeTab, setActiveTab] = useState<CourseTab>('Content');
  const [courseTitle, setCourseTitle] = useState('');
  const [tags, setTags] = useState('');
  const [responsible, setResponsible] = useState('');
  const [description, setDescription] = useState('');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [published, setPublished] = useState(false);
  const [shareOnWeb, setShareOnWeb] = useState(false);
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentCategory, setNewContentCategory] = useState<'Video' | 'Document' | 'Quiz'>('Video');
  const [showAddContentForm, setShowAddContentForm] = useState(false);

  useEffect(() => {
    if (course) {
      setCourseTitle(course.title);
      setTags(course.tags.join(', '));
      setResponsible(course.responsible || '');
      setDescription(course.description || '');
      setContentItems(course.contentItems || []);
      setPublished(course.published);
    }
  }, [course]);

  if (!isOpen || !course) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCourse: Course = {
      ...course,
      title: courseTitle,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      responsible,
      description,
      contentItems,
      published,
      contents: contentItems.length,
    };
    onUpdateCourse(updatedCourse);
    onClose();
  };

  const handleAddContent = () => {
    setShowAddContentForm(true);
  };

  const handleSaveNewContent = () => {
    if (newContentTitle.trim()) {
      const newContent: ContentItem = {
        id: Date.now().toString(),
        title: newContentTitle,
        category: newContentCategory,
      };
      setContentItems([...contentItems, newContent]);
      setNewContentTitle('');
      setNewContentCategory('Video');
      setShowAddContentForm(false);
    }
  };

  const handleCancelNewContent = () => {
    setNewContentTitle('');
    setNewContentCategory('Video');
    setShowAddContentForm(false);
  };

  const handleDeleteContent = (contentId: string) => {
    if (confirm('Are you sure you want to delete this content item?')) {
      setContentItems(contentItems.filter(item => item.id !== contentId));
    }
  };

  const handleEditContent = (contentId: string, field: 'title' | 'category') => {
    const item = contentItems.find(i => i.id === contentId);
    if (!item) return;

    if (field === 'title') {
      const newTitle = prompt('Enter new title:', item.title);
      if (newTitle && newTitle.trim()) {
        setContentItems(
          contentItems.map(i =>
            i.id === contentId ? { ...i, title: newTitle } : i
          )
        );
      }
    } else if (field === 'category') {
      const newCategory = prompt('Enter category (Video/Document/Quiz):', item.category);
      if (newCategory && ['Video', 'Document', 'Quiz'].includes(newCategory)) {
        setContentItems(
          contentItems.map(i =>
            i.id === contentId ? { ...i, category: newCategory as 'Video' | 'Document' | 'Quiz' } : i
          )
        );
      }
    }
  };

  const handlePublish = () => {
    setPublished(!published);
    if (!published) {
      alert('Course published on website successfully!');
    } else {
      alert('Course unpublished from website.');
    }
  };

  const handleContactAttendees = () => {
    alert('Contact Attendees: This will open an email composer to send messages to all course attendees.');
  };

  const handleAddAttendees = () => {
    alert('Add Attendees: This will open a dialog to add new attendees to the course.');
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert(`Image selected: ${file.name}\n\nImage upload functionality would process this file.`);
      }
    };
    input.click();
  };

  const handlePreview = () => {
    alert(`Preview Course: ${courseTitle}\n\nThis will open a preview of how the course will appear to students.`);
  };

  const handleNewCourse = () => {
    alert('Create New Course: This will open the create course dialog.');
  };

  return (
    <div className="modal-overlay edit-course-overlay" onClick={onClose}>
      <div className="modal-content edit-course-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-course-header">
          <div className="header-top">
            <div className="header-tabs">
              <button type="button" className="header-tab">App name and logo</button>
              <button type="button" className="header-tab active">Courses</button>
              <button type="button" className="header-tab">Reporting</button>
              <button type="button" className="header-tab">Settings</button>
            </div>
            <div className="header-actions">
              <button type="button" className="btn-new" onClick={handleNewCourse}>New</button>
            </div>
          </div>
          
          <div className="action-buttons">
            <button type="button" className="action-button" onClick={handleContactAttendees}>Contact Attendees</button>
            <button type="button" className="action-button" onClick={handleAddAttendees}>Add Attendees</button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="edit-course-body">
            <div className="course-form-section">
              <div className="form-row">
                <label>Course Title</label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="form-input"
                  placeholder="e.g: Basics of Odoo CRM"
                />
              </div>

              <div className="form-row">
                <label>Tags:</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="form-input"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="form-row">
                <label>Responsible:</label>
                <input
                  type="text"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  className="form-input"
                  placeholder="Enter responsible person"
                />
              </div>

              <div className="course-image-section">
                <div className="image-placeholder" onClick={handleImageUpload}>
                  <span>📷</span>
                  <p>Course image</p>
                </div>
                <div className="image-note">
                  Add a course image to show on website
                </div>
              </div>
            </div>

            <div className="course-tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'Content' ? 'active' : ''}`}
                onClick={() => setActiveTab('Content')}
              >
                Content
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'Description' ? 'active' : ''}`}
                onClick={() => setActiveTab('Description')}
              >
                Description
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'Options' ? 'active' : ''}`}
                onClick={() => setActiveTab('Options')}
              >
                Options
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'Quiz' ? 'active' : ''}`}
                onClick={() => setActiveTab('Quiz')}
              >
                Quiz
              </button>
            </div>

            {activeTab === 'Content' && (
              <div className="tab-content">
                <div className="content-list-header">
                  <div className="header-col">Content title</div>
                  <div className="header-col">Category</div>
                </div>
                <div className="content-list">
                  {contentItems.map((item) => (
                    <div key={item.id} className="content-item">
                      <div 
                        className="content-title" 
                        onClick={() => handleEditContent(item.id, 'title')}
                        style={{ cursor: 'pointer' }}
                        title="Click to edit title"
                      >
                        {item.title}
                      </div>
                      <div 
                        className="content-category"
                        onClick={() => handleEditContent(item.id, 'category')}
                        style={{ cursor: 'pointer' }}
                        title="Click to edit category"
                      >
                        {item.category}
                      </div>
                      <div className="content-actions">
                        <button
                          type="button"
                          className="delete-content-btn"
                          onClick={() => handleDeleteContent(item.id)}
                          title="Delete content"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {showAddContentForm && (
                  <div className="add-content-form">
                    <input
                      type="text"
                      value={newContentTitle}
                      onChange={(e) => setNewContentTitle(e.target.value)}
                      placeholder="Content title"
                      className="form-input"
                      autoFocus
                    />
                    <select
                      value={newContentCategory}
                      onChange={(e) => setNewContentCategory(e.target.value as 'Video' | 'Document' | 'Quiz')}
                      className="form-select"
                    >
                      <option value="Video">Video</option>
                      <option value="Document">Document</option>
                      <option value="Quiz">Quiz</option>
                    </select>
                    <div className="form-actions">
                      <button
                        type="button"
                        className="save-content-btn"
                        onClick={handleSaveNewContent}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="cancel-content-btn"
                        onClick={handleCancelNewContent}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {!showAddContentForm && (
                  <button
                    type="button"
                    className="add-content-btn"
                    onClick={handleAddContent}
                  >
                    Add content
                  </button>
                )}
              </div>
            )}

            {activeTab === 'Description' && (
              <div className="tab-content">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="description-textarea"
                  placeholder="Enter course description..."
                  rows={10}
                />
              </div>
            )}

            {activeTab === 'Options' && (
              <div className="tab-content">
                <p>Course options and settings will be displayed here.</p>
              </div>
            )}

            {activeTab === 'Quiz' && (
              <div className="tab-content">
                <p>Quiz configuration will be displayed here.</p>
              </div>
            )}
          </div>

          <div className="edit-course-footer">
            <div className="footer-left">
              <button
                type="button"
                className={`publish-btn ${published ? 'published' : ''}`}
                onClick={handlePublish}
              >
                {published ? '✓ Published on website' : 'Publish on website'}
              </button>
              <label className="share-toggle">
                <input 
                  type="checkbox" 
                  checked={shareOnWeb}
                  onChange={(e) => setShareOnWeb(e.target.checked)}
                />
                <span>Share on web</span>
              </label>
              <button type="button" className="preview-btn" onClick={handlePreview}>
                Preview
              </button>
            </div>
            <div className="footer-right">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseModal;
