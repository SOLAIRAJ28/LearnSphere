import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Course, Content } from '../types/course';
import { courseAPI, contentAPI, userAPI } from '../services/api';
import AdminHeader from './AdminHeader';
import QuizManager from './QuizManager';
import '../styles/CourseEdit.css';

type TabType = 'content' | 'description' | 'options' | 'quiz';

interface User {
  _id: string;
  username: string;
  name?: string;
  email: string;
}

const CourseEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [responsible, setResponsible] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Content form states
  const [showContentForm, setShowContentForm] = useState(false);
  const [contentTitle, setContentTitle] = useState('');
  const [contentCategory, setContentCategory] = useState<'video' | 'document' | 'image'>('video');
  const [contentDuration, setContentDuration] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [contentResponsible, setContentResponsible] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [contentAllowDownload, setContentAllowDownload] = useState(false);
  const [contentAttachment, setContentAttachment] = useState('');
  const [contentAttachmentLink, setContentAttachmentLink] = useState('');
  const [contentModalTab, setContentModalTab] = useState<'content' | 'description' | 'attachment'>('content');
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Options tab states
  const [users, setUsers] = useState<User[]>([]);
  const [visibility, setVisibility] = useState<string>('everyone');
  const [accessRules, setAccessRules] = useState<string[]>(['open']);
  const [price, setPrice] = useState<number>(0);
  const [responsibleUserId, setResponsibleUserId] = useState<string>('');
  const [adminUserId, setAdminUserId] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchCourseData();
      fetchContents();
    }
    fetchUsers();
  }, [id]);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCourse(id!);
      const courseData = response.data;
      setCourse(courseData);
      setTitle(courseData.title);
      setTagsInput(courseData.tags.join(', '));
      setResponsible(courseData.responsible || '');
      setDescription(courseData.description || '');
      setImageUrl(courseData.imageUrl || '');
      
      // Load options data
      setVisibility(courseData.visibility || 'everyone');
      setAccessRules(courseData.accessRules || ['open']);
      setPrice(courseData.price || 0);
      setResponsibleUserId(courseData.responsibleUserId || '');
      setAdminUserId(courseData.adminUserId || '');
      
      // Set image preview if course has an image
      if (courseData.imageUrl) {
        const fullImageUrl = courseData.imageUrl.startsWith('http') 
          ? courseData.imageUrl 
          : `http://localhost:5000${courseData.imageUrl}`;
        setImagePreview(fullImageUrl);
      }
      setImageUrl(courseData.imageUrl || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchContents = async () => {
    try {
      const response = await contentAPI.getCourseContents(id!);
      setContents(response.data);
    } catch (err: any) {
      console.error('Error fetching contents:', err);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, JPEG, PNG, or WEBP)');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      alert('Please select an image first');
      return;
    }

    try {
      setUploadingImage(true);
      const response = await courseAPI.uploadCourseImage(id!, imageFile);
      
      // Update course data with new image URL
      const fullImageUrl = response.data.imageUrl.startsWith('http')
        ? response.data.imageUrl
        : `http://localhost:5000${response.data.imageUrl}`;
      
      setImageUrl(response.data.imageUrl);
      setImagePreview(fullImageUrl);
      setImageFile(null);
      
      alert('Image uploaded successfully!');
      await fetchCourseData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCourse = async () => {
    try {
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
      await courseAPI.updateCourse(id!, {
        title,
        tags,
        responsible,
        description,
        imageUrl,
        visibility,
        accessRules,
        price,
        responsibleUserId: responsibleUserId || undefined,
        adminUserId: adminUserId || undefined
      });
      alert('Course updated successfully!');
      await fetchCourseData();
    } catch (err: any) {
      alert(err.message || 'Failed to update course');
    }
  };

  const handleAccessRuleChange = (rule: string) => {
    if (accessRules.includes(rule)) {
      setAccessRules(accessRules.filter(r => r !== rule));
      // Clear price if payment rule is unchecked
      if (rule === 'payment') {
        setPrice(0);
      }
    } else {
      setAccessRules([...accessRules, rule]);
    }
  };

  const handleTogglePublish = async () => {
    try {
      await courseAPI.togglePublish(id!);
      await fetchCourseData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publish status');
    }
  };

  const handlePreview = () => {
    window.open(`/preview/course/${id}`, '_blank');
  };

  const handleCreateContent = async () => {
    if (!contentTitle.trim()) {
      alert('Please enter content title');
      return;
    }

    // Validate based on category
    if (contentCategory === 'video' && !contentUrl.trim()) {
      alert('Please enter video link');
      return;
    }
    if (contentCategory === 'video' && !contentDuration) {
      alert('Please enter video duration');
      return;
    }

    try {
      await contentAPI.createContent(id!, {
        title: contentTitle,
        category: contentCategory,
        duration: parseInt(contentDuration) || 0,
        url: contentUrl,
        videoLink: contentCategory === 'video' ? contentUrl : undefined,
        fileUrl: contentCategory === 'document' ? contentUrl : undefined,
        imageUrl: contentCategory === 'image' ? contentUrl : undefined,
        responsible: contentResponsible,
        description: contentDescription,
        allowDownload: contentAllowDownload,
        attachmentUrl: contentAttachment,
        attachmentLink: contentAttachmentLink
      });
      
      resetContentForm();
      setShowContentForm(false);
      await fetchContents();
      await fetchCourseData();
    } catch (err: any) {
      alert(err.message || 'Failed to create content');
    }
  };

  const resetContentForm = () => {
    setContentTitle('');
    setContentCategory('video');
    setContentDuration('');
    setContentUrl('');
    setContentResponsible('');
    setContentDescription('');
    setContentAllowDownload(false);
    setContentAttachment('');
    setContentAttachmentLink('');
    setContentModalTab('content');
  };

  const handleUpdateContent = async () => {
    if (!editingContent) return;
    if (!contentTitle.trim()) {
      alert('Please enter content title');
      return;
    }

    // Validate based on category
    if (contentCategory === 'video' && !contentUrl.trim()) {
      alert('Please enter video link');
      return;
    }
    if (contentCategory === 'video' && !contentDuration) {
      alert('Please enter video duration');
      return;
    }

    try {
      await contentAPI.updateContent(editingContent._id, {
        title: contentTitle,
        category: contentCategory,
        duration: parseInt(contentDuration) || 0,
        url: contentUrl,
        videoLink: contentCategory === 'video' ? contentUrl : undefined,
        fileUrl: contentCategory === 'document' ? contentUrl : undefined,
        imageUrl: contentCategory === 'image' ? contentUrl : undefined,
        responsible: contentResponsible,
        description: contentDescription,
        allowDownload: contentAllowDownload,
        attachmentUrl: contentAttachment,
        attachmentLink: contentAttachmentLink
      });
      
      resetContentForm();
      setEditingContent(null);
      setShowContentForm(false);
      await fetchContents();
      await fetchCourseData();
    } catch (err: any) {
      alert(err.message || 'Failed to update content');
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      await contentAPI.deleteContent(contentId);
      await fetchContents();
      await fetchCourseData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete content');
    }
  };

  const handleEditContent = (content: Content) => {
    setEditingContent(content);
    setContentTitle(content.title);
    setContentCategory(content.category as 'video' | 'document' | 'image');
    setContentDuration(content.duration.toString());
    setContentUrl(content.url || '');
    setContentResponsible(content.responsible || '');
    setContentDescription(content.description || '');
    setContentAllowDownload(content.allowDownload || false);
    setContentAttachment(content.attachmentUrl || '');
    setContentAttachmentLink(content.attachmentLink || '');
    setContentModalTab('content');
    setShowContentForm(true);
    setActiveMenuId(null);
  };

  if (loading) return <div className="loading">Loading course...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!course) return <div className="error-message">Course not found</div>;

  return (
    <div className="course-edit-page">
      <AdminHeader activeTab="Courses" onTabChange={() => navigate('/admin/courses')} />
      
      <div className="course-edit-container">
        <div className="course-edit-header">
          <button className="back-btn" onClick={() => navigate('/admin/courses')}>
            ← Back to Courses
          </button>
          <div className="header-actions">
            <div className="publish-toggle-container">
              <label className="publish-toggle-label">
                <span>Publish on web</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={course?.isPublished || false}
                    onChange={handleTogglePublish}
                  />
                  <span className="slider"></span>
                </label>
              </label>
            </div>
            <button className="preview-btn" onClick={handlePreview}>
              Preview
            </button>
            <button className="new-btn" onClick={handleSaveCourse}>
              Save Changes
            </button>
          </div>
        </div>

        <div className="course-basic-info">
          <div className="info-left">
            <div className="form-group">
              <label>Course Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter course title"
              />
            </div>

            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g., JavaScript, React, TypeScript"
              />
            </div>

            <div className="form-group">
              <label>Responsible</label>
              <input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Enter responsible person"
              />
            </div>
          </div>

          <div className="info-right">
            <div className="course-image-section">
              <label>Course Image</label>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Course" />
                </div>
              )}
              {!imagePreview && (
                <div className="image-preview empty">
                  <span>No image uploaded</span>
                </div>
              )}
              <div className="image-upload-controls">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload" className="upload-btn">
                  Choose File
                </label>
                {imageFile && (
                  <button
                    className="btn-upload-image"
                    onClick={handleUploadImage}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </button>
                )}
              </div>
              {imageFile && (
                <p className="selected-file">Selected: {imageFile.name}</p>
              )}
            </div>
          </div>
        </div>

        <div className="tabs-section">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              Content
            </button>
            <button
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === 'options' ? 'active' : ''}`}
              onClick={() => setActiveTab('options')}
            >
              Options
            </button>
            <button
              className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
              onClick={() => setActiveTab('quiz')}
            >
              Quiz
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'content' && (
              <div className="content-tab">
                <div className="content-header">
                  <h3>Course Contents ({contents.length})</h3>
                </div>

                <table className="content-table">
                  <thead>
                    <tr>
                      <th>Content Title</th>
                      <th>Category</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {contents.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="no-content">
                          No content added yet. Click "Add Content" to start.
                        </td>
                      </tr>
                    ) : (
                      contents.map((content) => (
                        <tr key={content._id}>
                          <td>{content.title}</td>
                          <td>
                            <span className="category-badge">{content.category}</span>
                          </td>
                          <td>
                            <div className="menu-container">
                              <button
                                className="menu-trigger"
                                onClick={() => setActiveMenuId(activeMenuId === content._id ? null : content._id)}
                              >
                                ⋮
                              </button>
                              {activeMenuId === content._id && (
                                <div className="dropdown-menu">
                                  <button
                                    className="menu-item"
                                    onClick={() => handleEditContent(content)}
                                  >
                                    ✎ Edit
                                  </button>
                                  <button
                                    className="menu-item delete"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      handleDeleteContent(content._id);
                                    }}
                                  >
                                    🗑 Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="add-content-section">
                  <button
                    className="add-content-btn-centered"
                    onClick={() => {
                      resetContentForm();
                      setEditingContent(null);
                      setShowContentForm(true);
                    }}
                  >
                    + Add Content
                  </button>
                </div>

                {showContentForm && (
                  <div className="modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setShowContentForm(false);
                      setEditingContent(null);
                      resetContentForm();
                    }
                  }}>
                    <div className="content-modal">
                      <div className="modal-header">
                        <h3>{editingContent ? 'Edit Content' : 'Add Content'}</h3>
                        <button
                          className="close-btn"
                          onClick={() => {
                            setShowContentForm(false);
                            setEditingContent(null);
                            resetContentForm();
                          }}
                        >
                          ×
                        </button>
                      </div>

                      {/* Internal Tabs */}
                      <div className="modal-tabs">
                        <button
                          className={`modal-tab ${contentModalTab === 'content' ? 'active' : ''}`}
                          onClick={() => setContentModalTab('content')}
                        >
                          Content
                        </button>
                        <button
                          className={`modal-tab ${contentModalTab === 'description' ? 'active' : ''}`}
                          onClick={() => setContentModalTab('description')}
                        >
                          Description
                        </button>
                        <button
                          className={`modal-tab ${contentModalTab === 'attachment' ? 'active' : ''}`}
                          onClick={() => setContentModalTab('attachment')}
                        >
                          Additional Attachment
                        </button>
                      </div>

                      <div className="modal-body">
                        {contentModalTab === 'content' && (
                          <>
                            <div className="form-group">
                              <label>Content Title *</label>
                              <input
                                type="text"
                                value={contentTitle}
                                onChange={(e) => setContentTitle(e.target.value)}
                                placeholder="Enter content title"
                              />
                            </div>

                            <div className="form-group">
                              <label>Category *</label>
                              <div className="radio-group">
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="category"
                                    value="video"
                                    checked={contentCategory === 'video'}
                                    onChange={(e) => setContentCategory(e.target.value as any)}
                                  />
                                  <span>Video</span>
                                </label>
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="category"
                                    value="document"
                                    checked={contentCategory === 'document'}
                                    onChange={(e) => setContentCategory(e.target.value as any)}
                                  />
                                  <span>Document</span>
                                </label>
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="category"
                                    value="image"
                                    checked={contentCategory === 'image'}
                                    onChange={(e) => setContentCategory(e.target.value as any)}
                                  />
                                  <span>Image</span>
                                </label>
                              </div>
                            </div>

                            {/* Video Fields */}
                            {contentCategory === 'video' && (
                              <>
                                <div className="form-group">
                                  <label>Video Link *</label>
                                  <input
                                    type="url"
                                    value={contentUrl}
                                    onChange={(e) => setContentUrl(e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Duration (in minutes) *</label>
                                  <input
                                    type="number"
                                    value={contentDuration}
                                    onChange={(e) => setContentDuration(e.target.value)}
                                    placeholder="e.g., 15"
                                    min="0"
                                  />
                                  <small>Enter duration in minutes</small>
                                </div>
                              </>
                            )}

                            {/* Document Fields */}
                            {contentCategory === 'document' && (
                              <>
                                <div className="form-group">
                                  <label>Document File *</label>
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        // For now, store filename; in production, upload to server
                                        setContentUrl(file.name);
                                      }
                                    }}
                                  />
                                  {contentUrl && <small className="file-name">Selected: {contentUrl}</small>}
                                </div>
                                <div className="form-group">
                                  <label className="checkbox-label">
                                    <input
                                      type="checkbox"
                                      checked={contentAllowDownload}
                                      onChange={(e) => setContentAllowDownload(e.target.checked)}
                                    />
                                    <span>Allow Download</span>
                                  </label>
                                </div>
                              </>
                            )}

                            {/* Image Fields */}
                            {contentCategory === 'image' && (
                              <>
                                <div className="form-group">
                                  <label>Image File *</label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        // For now, store filename; in production, upload to server
                                        setContentUrl(file.name);
                                      }
                                    }}
                                  />
                                  {contentUrl && <small className="file-name">Selected: {contentUrl}</small>}
                                </div>
                                <div className="form-group">
                                  <label className="checkbox-label">
                                    <input
                                      type="checkbox"
                                      checked={contentAllowDownload}
                                      onChange={(e) => setContentAllowDownload(e.target.checked)}
                                    />
                                    <span>Allow Download</span>
                                  </label>
                                </div>
                              </>
                            )}

                            <div className="form-group">
                              <label>Responsible</label>
                              <input
                                type="text"
                                value={contentResponsible}
                                onChange={(e) => setContentResponsible(e.target.value)}
                                placeholder="Enter responsible person/team"
                              />
                            </div>
                          </>
                        )}

                        {contentModalTab === 'description' && (
                          <div className="description-tab-content">
                            <textarea
                              className="description-textarea"
                              value={contentDescription}
                              onChange={(e) => setContentDescription(e.target.value)}
                              placeholder="Write your content description here..."
                              rows={12}
                            />
                          </div>
                        )}

                        {contentModalTab === 'attachment' && (
                          <div className="attachment-tab-content">
                            <div className="form-group">
                              <label>File</label>
                              <div className="file-upload-wrapper">
                                <input
                                  type="file"
                                  id="attachment-file-input"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setContentAttachment(file.name);
                                    }
                                  }}
                                  style={{ display: 'none' }}
                                />
                                <button
                                  type="button"
                                  className="upload-file-btn"
                                  onClick={() => document.getElementById('attachment-file-input')?.click()}
                                >
                                  📎 Upload your file
                                </button>
                                {contentAttachment && (
                                  <span className="uploaded-file-name">{contentAttachment}</span>
                                )}
                              </div>
                            </div>

                            <div className="form-group">
                              <label>Link</label>
                              <input
                                type="url"
                                className="link-input"
                                value={contentAttachmentLink}
                                onChange={(e) => setContentAttachmentLink(e.target.value)}
                                placeholder="e.g., www.google.com"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="modal-footer">
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            setShowContentForm(false);
                            setEditingContent(null);
                            resetContentForm();
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn-primary"
                          onClick={editingContent ? handleUpdateContent : handleCreateContent}
                        >
                          {editingContent ? 'Update' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'description' && (
              <div className="description-tab">
                <div className="form-group">
                  <label>Course Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter course description..."
                    rows={10}
                  />
                </div>
                <button className="btn-primary" onClick={handleSaveCourse}>
                  Save Description
                </button>
              </div>
            )}

            {activeTab === 'options' && (
              <div className="options-tab">
                <div className="options-layout">
                  {/* Left Section - Access Course Rights */}
                  <div className="options-left">
                    <div className="options-section">
                      <h3>Access Course Rights</h3>
                      
                      <div className="form-group">
                        <label>Show course to</label>
                        <select
                          value={visibility}
                          onChange={(e) => setVisibility(e.target.value)}
                        >
                          <option value="everyone">Everyone</option>
                          <option value="signed_in">Signed In</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Access rules</label>
                        <div className="checkbox-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={accessRules.includes('open')}
                              onChange={() => handleAccessRuleChange('open')}
                            />
                            <span>Open</span>
                          </label>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={accessRules.includes('invitation')}
                              onChange={() => handleAccessRuleChange('invitation')}
                            />
                            <span>On Invitation</span>
                          </label>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={accessRules.includes('payment')}
                              onChange={() => handleAccessRuleChange('payment')}
                            />
                            <span>On Payment</span>
                          </label>
                        </div>
                      </div>

                      {accessRules.includes('payment') && (
                        <div className="form-group">
                          <label>Price</label>
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Responsible & Course Admin */}
                  <div className="options-right">
                    <div className="options-section">
                      <h3>Responsible</h3>
                      <div className="form-group">
                        <label>Responsible</label>
                        <select
                          value={responsibleUserId}
                          onChange={(e) => setResponsibleUserId(e.target.value)}
                        >
                          <option value="">Select a user</option>
                          {users.map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.name || user.username}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Course Admin</label>
                        <select
                          value={adminUserId}
                          onChange={(e) => setAdminUserId(e.target.value)}
                        >
                          <option value="">Select a user</option>
                          {users.map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.name || user.username}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="options-actions">
                  <button className="btn-primary" onClick={handleSaveCourse}>
                    Save Options
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="quiz-tab">
                <QuizManager courseId={id!} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEdit;
