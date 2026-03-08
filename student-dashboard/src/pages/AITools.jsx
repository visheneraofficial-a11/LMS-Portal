import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DoubtSolver from './ai/DoubtSolver';
import StudyPlanner from './ai/StudyPlanner';
import AIQuiz from './ai/AIQuiz';
import PerformanceInsights from './ai/PerformanceInsights';
import LearningPath from './ai/LearningPath';

export default function AITools() {
  return (
    <Routes>
      <Route index element={<Navigate to="doubts" replace />} />
      <Route path="doubts" element={<DoubtSolver />} />
      <Route path="planner" element={<StudyPlanner />} />
      <Route path="quiz" element={<AIQuiz />} />
      <Route path="insights" element={<PerformanceInsights />} />
      <Route path="learning-path" element={<LearningPath />} />
    </Routes>
  );
}
