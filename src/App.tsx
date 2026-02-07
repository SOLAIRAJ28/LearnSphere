import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import CourseEdit from './components/CourseEdit'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses/:id/edit" element={<CourseEdit />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
