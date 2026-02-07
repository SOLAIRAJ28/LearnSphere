const API_URL = import.meta.env.VITE_API_URL || '/api';

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// API headers with auth token
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Course API
export const courseAPI = {
  // Get all courses
  getAllCourses: async (searchQuery = '') => {
    const url = searchQuery 
      ? `${API_URL}/courses?search=${encodeURIComponent(searchQuery)}`
      : `${API_URL}/courses`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    
    return response.json();
  },

  // Get single course
  getCourse: async (id: string) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch course');
    }
    
    return response.json();
  },

  // Create course
  createCourse: async (data: { title: string }) => {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create course');
    }
    
    return response.json();
  },

  // Update course
  updateCourse: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update course');
    }
    
    return response.json();
  },

  // Delete course
  deleteCourse: async (id: string) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete course');
    }
    
    return response.json();
  },

  // Update tags
  updateTags: async (id: string, tag: string, action: 'add' | 'remove') => {
    const response = await fetch(`${API_URL}/courses/${id}/tags`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ tag, action })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update tags');
    }
    
    return response.json();
  },

  // Toggle publish status
  togglePublish: async (id: string) => {
    const response = await fetch(`${API_URL}/courses/${id}/publish`, {
      method: 'PUT',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle publish status');
    }
    
    return response.json();
  },

  // Generate share link
  generateShareLink: async (id: string) => {
    const response = await fetch(`${API_URL}/courses/${id}/share`, {
      method: 'POST',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate share link');
    }
    
    return response.json();
  },

  // Upload course image
  uploadCourseImage: async (courseId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_URL}/courses/${courseId}/image`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
        // Don't set Content-Type - let browser set it with boundary for multipart
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload image');
    }

    return response.json();
  }
};

// Content API
export const contentAPI = {
  // Get all contents for a course
  getCourseContents: async (courseId: string) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/contents`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch contents');
    }
    
    return response.json();
  },

  // Get contents by courseId (alternative method)
  getContents: async (courseId: string) => {
    const response = await fetch(`${API_URL}/contents?courseId=${courseId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch contents');
    }
    
    return response.json();
  },

  // Create content
  createContent: async (courseId: string, data: any) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/contents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create content');
    }
    
    return response.json();
  },

  // Update content
  updateContent: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/contents/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update content');
    }
    
    return response.json();
  },

  // Delete content
  deleteContent: async (id: string) => {
    const response = await fetch(`${API_URL}/contents/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete content');
    }
    
    return response.json();
  },

  // Reorder contents
  reorderContents: async (courseId: string, contentIds: string[]) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/contents/reorder`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ contentIds })
    });
    
    if (!response.ok) {
      throw new Error('Failed to reorder contents');
    }
    
    return response.json();
  },

  // Upload document/file content
  uploadDocumentContent: async (courseId: string, formData: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/courses/${courseId}/contents/upload-document`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to upload document');
    }

    return response.json();
  },

  // Upload video content with progress tracking
  uploadVideoContent: async (
    courseId: string, 
    formData: FormData, 
    onProgress?: (progressEvent: any) => void
  ) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          onProgress(e);
        });
      }
      
      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(JSON.parse(xhr.responseText).message || 'Failed to upload video'));
        }
      });
      
      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during video upload'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new Error('Video upload cancelled'));
      });
      
      // Open connection and send
      xhr.open('POST', `${API_URL}/courses/${courseId}/contents/video`);
      
      // Add auth header
      const token = getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.send(formData);
    });
  },

  // NEW: Cloud storage upload flow
  // Step 1: Get signed upload URL from backend
  getVideoUploadUrl: async (fileName: string, fileType: string, fileSize: number) => {
    const response = await fetch(`${API_URL}/video/upload-url`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ fileName, fileType, fileSize })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get upload URL');
    }

    return response.json();
  },

  // Step 2: Upload video directly to S3 with progress tracking
  uploadToCloud: async (
    uploadUrl: string,
    file: File,
    onProgress?: (progressEvent: any) => void
  ) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          onProgress(e);
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true });
        } else {
          reject(new Error('Failed to upload to cloud storage'));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during cloud upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Open connection and send to S3
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  },

  // Step 3: Save video metadata after successful upload
  saveVideoMetadata: async (
    courseId: string,
    data: {
      title: string;
      duration: number;
      responsible?: string;
      description?: string;
      videoUrl: string;
      storageKey: string;
    }
  ) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/contents/video-metadata`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save video metadata');
    }

    return response.json();
  }
};

// Auth API
export const authAPI = {
  // Register
  register: async (data: { username: string; email: string; password: string; role?: string }) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register');
    }
    
    return response.json();
  },

  // Login
  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to login');
    }
    
    return response.json();
  },

  // Get current user
  getMe: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    return response.json();
  }
};

// Quiz API
export const quizAPI = {
  // Get all quizzes for a course
  getCourseQuizzes: async (courseId: string) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/quizzes`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }

    return response.json();
  },

  // Get single quiz
  getQuiz: async (quizId: string) => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quiz');
    }

    return response.json();
  },

  // Create quiz
  createQuiz: async (courseId: string, data: { title: string }) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/quizzes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create quiz');
    }

    return response.json();
  },

  // Update quiz
  updateQuiz: async (quizId: string, data: { title: string }) => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update quiz');
    }

    return response.json();
  },

  // Delete quiz
  deleteQuiz: async (quizId: string) => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete quiz');
    }

    return response.json();
  },

  // Add question to quiz
  addQuestion: async (quizId: string, data: { questionText: string; options: { text: string; isCorrect: boolean }[] }) => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}/questions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add question');
    }

    return response.json();
  },

  // Update question
  updateQuestion: async (quizId: string, questionId: string, data: { questionText: string; options: { text: string; isCorrect: boolean }[] }) => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}/questions/${questionId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update question');
    }

    return response.json();
  },

  // Delete question
  deleteQuestion: async (quizId: string, questionId: string) => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}/questions/${questionId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete question');
    }

    return response.json();
  },

  // Update rewards
  updateRewards: async (quizId: string, rewards: { correctPoints: number; wrongPoints: number; completionPoints: number }) => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}/rewards`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(rewards)
    });

    if (!response.ok) {
      throw new Error('Failed to update rewards');
    }

    return response.json();
  }
};

// Enrollment API
export const enrollmentAPI = {
  // Get all enrollments with optional status filter
  getEnrollments: async (status?: string) => {
    const url = status && status !== 'All' 
      ? `${API_URL}/enrollments?status=${encodeURIComponent(status)}`
      : `${API_URL}/enrollments`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch enrollments');
    }

    return response.json();
  },

  // Create enrollment
  createEnrollment: async (data: { courseId: string; userId: string }) => {
    const response = await fetch(`${API_URL}/enrollments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create enrollment');
    }

    return response.json();
  },

  // Update enrollment progress
  updateEnrollmentProgress: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/enrollments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update enrollment');
    }

    return response.json();
  },

  // Delete enrollment
  deleteEnrollment: async (id: string) => {
    const response = await fetch(`${API_URL}/enrollments/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete enrollment');
    }

    return response.json();
  }
};

// User API
export const userAPI = {
  // Get all users
  getAllUsers: async () => {
    const response = await fetch(`${API_URL}/auth/users`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }
};
export const participantAPI = {
  // Get all courses for participant
  getCourses: async (userId?: string, search?: string) => {
    let url = `${API_URL}/participant/courses`;
    const params = new URLSearchParams();
    
    if (userId) params.append('userId', userId);
    if (search) params.append('search', search);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    return response.json();
  },

  // Get participant profile
  getProfile: async (userId: string) => {
    const response = await fetch(`${API_URL}/participant/profile/${userId}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  // Enroll in course
  enrollInCourse: async (courseId: string, userId: string) => {
    const response = await fetch(`${API_URL}/participant/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to enroll');
    }

    return response.json();
  },

  // Process payment
  processPayment: async (courseId: string, userId: string, paymentId: string, amountPaid: number) => {
    const response = await fetch(`${API_URL}/participant/courses/${courseId}/pay`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, paymentId, amountPaid })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process payment');
    }

    return response.json();
  },

  // Update course progress
  updateProgress: async (courseId: string, userId: string, status: string, completionPercentage?: number) => {
    const response = await fetch(`${API_URL}/participant/courses/${courseId}/progress`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ userId, status, completionPercentage })
    });

    if (!response.ok) {
      throw new Error('Failed to update progress');
    }

    return response.json();
  },

  // Mark a content item as completed
  markContentComplete: async (courseId: string, userId: string, contentId: string) => {
    const response = await fetch(`${API_URL}/participant/courses/${courseId}/complete-content`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ userId, contentId })
    });

    if (!response.ok) {
      throw new Error('Failed to mark content as complete');
    }

    return response.json();
  },

  // Mark quiz as completed
  completeQuiz: async (courseId: string, userId: string) => {
    const response = await fetch(`${API_URL}/participant/courses/${courseId}/complete-quiz`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error('Failed to complete quiz');
    }

    return response.json();
  },

  // Get enrollment progress details
  getProgress: async (courseId: string, userId: string) => {
    const response = await fetch(`${API_URL}/participant/courses/${courseId}/progress/${userId}`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get progress');
    }

    return response.json();
  }
};