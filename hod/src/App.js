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
import ManageStudentsPage from './pages/ManageStudentsPage.js';
import AssessmentLogPage from './pages/AssessmentLogPage.js';
import InterventionLogPage from './pages/InterventionLogPage.js';
import AcademicProblemsLogPage from './pages/AcademicProblemsLogPage.js';
import ActivitiesLogPage from './pages/ActivitiesLogPage.js';
import DepartmentDetailsPage from './pages/DepartmentDetailsPage.js';
import MentorDetailsPage from './pages/MentorDetailsPage.js';
import CreateMentorPage from './pages/CreateMentorPage.js';
import CreateStudentPage from './pages/CreateStudentPage.js';
import AttendanceMonitorPage from './pages/AttendanceMonitorPage.js';
import ProfilePage from './pages/ProfilePage.js';
import EditMentorPage from './pages/EditMentorPage.js';
import MenteeAllocationPage from './pages/MenteeAllocationPage.js';
import ExamPerformancePage from './pages/ExamPerformancePage.js';
import HodShellLayout from './components/HodShellLayout.jsx';
function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<HodShellLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/attendance/monitor" element={<AttendanceMonitorPage />} />
              <Route path="/departments/:deptName" element={<DepartmentDetailsPage />} />
              <Route path="/mentors/create" element={<CreateMentorPage />} />
              <Route path="/students/create" element={<CreateStudentPage />} />
              <Route path="/mentor/:mentorId" element={<MentorDetailsPage />} />
              <Route path="/mentor/:mentorId/mentees" element={<MenteeListPage />} />
              <Route path="/mentee/:studentId" element={<MenteeDetailsPage />} />
              <Route path="/mentee/:studentId/edit" element={<EditStudentPage />} />
              <Route path="/performance" element={<PerformanceReportPage />} />
              <Route path="/students" element={<ManageStudentsPage />} />
              <Route path="/mentee/:studentId/assessments" element={<AssessmentLogPage />} />
              <Route path="/mentee/:studentId/interventions" element={<InterventionLogPage />} />
              <Route path="/mentee/:studentId/academic-problems" element={<AcademicProblemsLogPage />} />
              <Route path="/mentee/:studentId/activities" element={<ActivitiesLogPage />} />
              <Route path="/mentee/:studentId/exam-performance" element={<ExamPerformancePage />} />
              <Route path="/mentor/:mentorId/edit" element={<EditMentorPage />} />
              <Route path="/mentee-allocation" element={<MenteeAllocationPage />} />
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
