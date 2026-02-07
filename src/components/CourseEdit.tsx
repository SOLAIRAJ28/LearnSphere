import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Course, Content } from '../types/course';
import { courseAPI, contentAPI } from '../services/api';
import Header from './Header';
import QuizManager from './QuizManager';
import '../styles/CourseEdit.css';

type TabType = 'content' | 'description' | 'options' | 'quiz';

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
  const [contentCategory, setContentCategory] = useState<'Video' | 'Document' | 'Quiz' | 'Article' | 'Other'>('Document');
  const [contentDuration, setContentDuration] = useState('');
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  
  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseData();
      fetchContents();
    }
  }, [id]);

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
        imageUrl
      });
      alert('Course updated successfully!');
      await fetchCourseData();
    } catch (err: any) {
      alert(err.message || 'Failed to update course');
    }
  };

  const handleCreateContent = async () => {
    try {
      await contentAPI.createContent(id!, {
        title: contentTitle,
        category: contentCategory,
        duration: parseInt(contentDuration) || 0
      });
      setContentTitle('');
      setContentDuration('');
      setShowContentForm(false);
      await fetchContents();
      await fetchCourseData(); // Refresh to update totals
    } catch (err: any) {
      alert(err.message || 'Failed to create content');
    }
  };

  const handleUpdateContent = async () => {
    if (!editingContent) return;
    try {
      await contentAPI.updateContent(editingContent._id, {
        title: contentTitle,
        category: contentCategory,
        duration: parseInt(contentDuration) || 0
      });
      setEditingContent(null);
      setContentTitle('');
      setContentDuration('');
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
    setContentCategory(content.category);
    setContentDuration(content.duration.toString());
    setShowContentForm(true);
  };

  const handleTogglePublish = async () => {
    try {
      await courseAPI.togglePublish(id!);
      await fetchCourseData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publish status');
    }
  };

  if (loading) return <div className="loading">Loading course...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!course) return <div className="error-message">Course not found</div>;

  return (
    <div className="course-edit-page">
      <Header activeTab="Courses" onTabChange={() => navigate('/')} />
      
      <div className="course-edit-container">
        <div className="course-edit-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to Courses
          </button>
          <button className="new-btn" onClick={handleSaveCourse}>
            Save Changes
          </button>
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
                  <button
                    className="add-content-btn"
                    onClick={() => {
                      setEditingContent(null);
                      setContentTitle('');
                      setContentDuration('');
                      setShowContentForm(true);
                    }}
                  >
                    + Add Content
                  </button>
                </div>

                {showContentForm && (
                  <div className="content-form">
                    <div className="form-group">
                      <label>Content Title</label>
                      <input
                        type="text"
                        value={contentTitle}
                        onChange={(e) => setContentTitle(e.target.value)}
                        placeholder="Enter content title"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          value={contentCategory}
                          onChange={(e) => setContentCategory(e.target.value as any)}
                        >
                          <option value="Document">Document</option>
                          <option value="Video">Video</option>
                          <option value="Quiz">Quiz</option>
                          <option value="Article">Article</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Duration (minutes)</label>
                        <input
                          type="number"
                          value={contentDuration}
                          onChange={(e) => setContentDuration(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button
                        className="btn-primary"
                        onClick={editingContent ? handleUpdateContent : handleCreateContent}
                      >
                        {editingContent ? 'Update' : 'Create'}
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setShowContentForm(false);
                          setEditingContent(null);
                          setContentTitle('');
                          setContentDuration('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <table className="content-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Duration</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="no-content">
                          No content added yet. Click "Add Content" to start.
                        </td>
                      </tr>
                    ) : (
                      contents.map((content) => (
                        <tr key={content._id}>
                          <td>{content.title}</td>
                          <td>{content.category}</td>
                          <td>{content.duration} min</td>
                          <td>
                            <div className="actions">
                              <button
                                className="action-icon"
                                onClick={() => handleEditContent(content)}
                                title="Edit"
                              >
                                ✎
                              </button>
                              <button
                                className="action-icon delete"
                                onClick={() => handleDeleteContent(content._id)}
                                title="Delete"
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
                <div className="option-item">
                  <div className="option-info">
                    <h4>Publish Course</h4>
                    <p>Make this course visible on the website</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={course.isPublished}
                      onChange={handleTogglePublish}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="course-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Views:</span>
                    <span className="stat-value">{course.viewsCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Lessons:</span>
                    <span className="stat-value">{course.lessonsCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Duration:</span>
                    <span className="stat-value">{course.totalDuration} minutes</span>
                  </div>
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
