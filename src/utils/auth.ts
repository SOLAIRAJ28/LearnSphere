/**
 * Authentication utility functions
 */

/**
 * Logout user - clears all authentication data and redirects to login
 */
export const handleLogout = (): void => {
  // Clear all authentication data from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Clear any other session data if exists
  localStorage.clear();
  
  // Redirect to login page
  window.location.href = '/auth';
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get authentication token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getCurrentUser();
};

/**
 * Get user role
 */
export const getUserRole = (): 'admin' | 'participant' | null => {
  const user = getCurrentUser();
  return user?.role || null;
};
