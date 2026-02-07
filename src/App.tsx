import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import CourseEdit from './components/CourseEdit'
import ParticipantDashboard from './components/ParticipantDashboard'
import Reporting from './components/Reporting'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses/:id/edit" element={<CourseEdit />} />
        <Route path="/participant" element={<ParticipantDashboard />} />
        <Route path="/reporting" element={<Reporting />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
