import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ParticipantDashboard from './ParticipantDashboard';

/**
 * Participant Routes Component
 * All participant-specific routes are defined here
 * Requires participant role for access
 */
const ParticipantRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Participant Dashboard - My Courses */}
      <Route path="/" element={<ParticipantDashboard />} />
      <Route path="/my-courses" element={<ParticipantDashboard />} />
      
      {/* Profile - Placeholder for future */}
      <Route path="/profile" element={
        <div style={{ padding: '2rem' }}>
          <h2>My Profile</h2>
          <p>Profile page coming soon...</p>
        </div>
      } />
      
      {/* Course Player - Placeholder for future */}
      <Route path="/course/:id" element={
        <div style={{ padding: '2rem' }}>
          <h2>Course Player</h2>
          <p>Course playing interface coming soon...</p>
        </div>
      } />
      
      {/* Catch all - redirect to my courses */}
      <Route path="*" element={<Navigate to="/participant/my-courses" replace />} />
    </Routes>
  );
};

export default ParticipantRoutes;
