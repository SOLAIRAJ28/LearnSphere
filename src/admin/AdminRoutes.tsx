import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import CourseEdit from './CourseEdit';
import Reporting from './Reporting';

/**
 * Admin Routes Component
 * All admin-specific routes are defined here
 * Requires admin role for access
 */
const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Admin Dashboard - Main courses view */}
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/courses" element={<AdminDashboard />} />
      
      {/* Course Management */}
      <Route path="/courses/:id/edit" element={<CourseEdit />} />
      
      {/* Reporting */}
      <Route path="/reporting" element={<Reporting />} />
      
      {/* Settings - Placeholder for future */}
      <Route path="/settings" element={
        <div style={{ padding: '2rem' }}>
          <h2>Settings</h2>
          <p>Admin settings coming soon...</p>
        </div>
      } />
      
      {/* Catch all - redirect to admin dashboard */}
      <Route path="*" element={<Navigate to="/admin/courses" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
