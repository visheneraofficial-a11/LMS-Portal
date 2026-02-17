import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentLayout from './components/layout/StudentLayout';
import StudentDashboard from './pages/StudentDashboard';
import LiveClasses from './pages/LiveClasses';
import MySchedule from './pages/MySchedule';
import Resources from './pages/Resources';
import VideoLectures from './pages/VideoLectures';
import Exams from './pages/ExamsTests';
import MyAttendance from './pages/MyAttendance';
import AITools from './pages/AITools';
import Achievements from './pages/Achievements';
import HelpSupport from './pages/HelpSupport';

export default function App() {
  return (
    <BrowserRouter basename="/student/dashboard">
      <Routes>
        <Route element={<StudentLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/live-classes" element={<LiveClasses />} />
          <Route path="/schedule" element={<MySchedule />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/video-lectures" element={<VideoLectures />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/attendance" element={<MyAttendance />} />
          <Route path="/ai-tools/*" element={<AITools />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/help" element={<HelpSupport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
