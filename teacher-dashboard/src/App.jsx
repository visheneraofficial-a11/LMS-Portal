import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Students from './pages/Students'
import Attendance from './pages/Attendance'
import Tests from './pages/Tests'
import LiveClasses from './pages/LiveClasses'
import Resources from './pages/Resources'
import ClassSchedule from './pages/ClassSchedule'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'

function App() {
  return (
    <Router basename="/teacher/dashboard">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="students" element={<Students />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="tests" element={<Tests />} />
          <Route path="live-classes" element={<LiveClasses />} />
          <Route path="resources" element={<Resources />} />
          <Route path="class-schedule" element={<ClassSchedule />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
