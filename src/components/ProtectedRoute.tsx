import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'admin' | 'participant';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  console.log('ProtectedRoute - Required Role:', requiredRole);
  console.log('ProtectedRoute - Token exists:', !!token);
  console.log('ProtectedRoute - User data:', userStr);

  // If no token, redirect to auth page
  if (!token || !userStr) {
    console.log('ProtectedRoute - No auth, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Parse user data
  let user;
  try {
    user = JSON.parse(userStr);
    console.log('ProtectedRoute - Parsed user:', user);
    console.log('ProtectedRoute - User role:', user.role);
  } catch (error) {
    console.error('ProtectedRoute - Error parsing user data:', error);
    localStorage.clear();
    return <Navigate to="/auth" replace />;
  }

  // If role is required and doesn't match, redirect
  if (requiredRole && user.role !== requiredRole) {
    console.log(`ProtectedRoute - Role mismatch! Required: ${requiredRole}, User has: ${user.role}`);
    
    if (user.role === 'admin') {
      console.log('ProtectedRoute - Redirecting admin to /admin/courses');
      return <Navigate to="/admin/courses" replace />;
    } else if (user.role === 'participant') {
      console.log('ProtectedRoute - Redirecting participant to /participant');
      return <Navigate to="/participant" replace />;
    }
  }

  console.log('ProtectedRoute - Access granted, rendering children');
  return children;
};

export default ProtectedRoute;
