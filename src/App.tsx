import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Dashboard from './components/Dashboard'
import CourseEdit from './components/CourseEdit'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses/:id/edit" element={<CourseEdit />} />
      </Routes>
    </Router>
  )
}

export default App
