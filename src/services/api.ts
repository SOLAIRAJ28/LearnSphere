const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
