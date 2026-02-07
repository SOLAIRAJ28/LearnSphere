import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './auth/Login'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoutes from './admin/AdminRoutes'
import ParticipantRoutes from './participant/ParticipantRoutes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Authentication */}
        <Route path="/auth" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes - Protected */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminRoutes />
            </ProtectedRoute>
          } 
        />

        {/* Participant Routes - Protected */}
        <Route 
          path="/participant/*" 
          element={
            <ProtectedRoute requiredRole="participant">
              <ParticipantRoutes />
            </ProtectedRoute>
          } 
        />

        {/* Legacy Routes - Backward Compatibility */}
        <Route 
          path="/courses/:id/edit" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Navigate to={`/admin/courses/${window.location.pathname.split('/')[2]}/edit`} replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reporting" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Navigate to="/admin/reporting" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-courses" 
          element={
            <ProtectedRoute requiredRole="participant">
              <Navigate to="/participant/my-courses" replace />
            </ProtectedRoute>
          } 
        />

        {/* Root and catch-all for admin (backward compatibility) */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminRoutes />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
