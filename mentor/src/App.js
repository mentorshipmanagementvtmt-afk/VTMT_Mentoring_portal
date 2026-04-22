import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';


import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import MenteeListPage from './pages/MenteeListPage.js';
import MenteeDetailsPage from './pages/MenteeDetailsPage.js';
import EditStudentPage from './pages/EditStudentPage.js';
import PerformanceReportPage from './pages/PerformanceReportPage.js';
import AssessmentLogPage from './pages/AssessmentLogPage.js';
import InterventionLogPage from './pages/InterventionLogPage.js';
import AcademicProblemsLogPage from './pages/AcademicProblemsLogPage.js';
import ActivitiesLogPage from './pages/ActivitiesLogPage.js';
import AttendanceLogPage from './pages/AttendanceLogPage.js';
import ProfilePage from './pages/ProfilePage.js';
import ExamMarksPage from './pages/ExamMarksPage.js';
import MentorShellLayout from './components/MentorShellLayout.jsx';
function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MentorShellLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/students" element={<MenteeListPage />} />
              <Route path="/mentee/:studentId" element={<MenteeDetailsPage />} />
              <Route path="/mentee/:studentId/edit" element={<EditStudentPage />} />
              <Route path="/attendance/log" element={<AttendanceLogPage />} />
              <Route path="/performance" element={<PerformanceReportPage />} />
              <Route path="/mentee/:studentId/assessments" element={<AssessmentLogPage />} />
              <Route path="/mentee/:studentId/interventions" element={<InterventionLogPage />} />
              <Route path="/mentee/:studentId/academic-problems" element={<AcademicProblemsLogPage />} />
              <Route path="/mentee/:studentId/activities" element={<ActivitiesLogPage />} />
              <Route path="/mentee/:studentId/exam-marks" element={<ExamMarksPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
