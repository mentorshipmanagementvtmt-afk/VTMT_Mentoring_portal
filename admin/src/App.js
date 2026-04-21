import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import LoginPage from './pages/LoginPage.js';
import DashboardPage from './pages/DashboardPage.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import MenteeListPage from './pages/MenteeListPage.js';
import MenteeDetailsPage from './pages/MenteeDetailsPage.js';
import PerformanceReportPage from './pages/PerformanceReportPage.js';
import ManageStudentsPage from './pages/ManageStudentsPage.js';
import AssessmentLogPage from './pages/AssessmentLogPage.js';
import InterventionLogPage from './pages/InterventionLogPage.js';
import AcademicProblemsLogPage from './pages/AcademicProblemsLogPage.js';
import ActivitiesLogPage from './pages/ActivitiesLogPage.js';
import ManageHodsPage from './pages/ManageHodsPage.js';
import CreateHodPage from './pages/CreateHodPage.js';
import HodDetailsPage from './pages/HodDetailsPage.js';
import ManageDepartmentsPage from './pages/ManageDepartmentsPage.js';
import DepartmentDetailsPage from './pages/DepartmentDetailsPage.js';
import MentorDetailsPage from './pages/MentorDetailsPage.js';
import CreateMentorPage from './pages/CreateMentorPage.js';
import AttendanceMonitorPage from './pages/AttendanceMonitorPage.js';
import ExamPerformancePage from './pages/ExamPerformancePage.js';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/attendance/monitor" element={<AttendanceMonitorPage />} />
            <Route path="/departments" element={<ManageDepartmentsPage />} />
            <Route path="/departments/:deptName" element={<DepartmentDetailsPage />} />
            <Route path="/mentors/create" element={<CreateMentorPage />} />
            <Route path="/mentor/:mentorId" element={<MentorDetailsPage />} />
            <Route path="/mentor/:mentorId/mentees" element={<MenteeListPage />} />
            <Route path="/mentee/:studentId" element={<MenteeDetailsPage />} />
            <Route path="/performance" element={<PerformanceReportPage />} />
            <Route path="/students" element={<ManageStudentsPage />} />
            <Route path="/mentee/:studentId/assessments" element={<AssessmentLogPage />} />
            <Route path="/mentee/:studentId/interventions" element={<InterventionLogPage />} />
            <Route path="/mentee/:studentId/academic-problems" element={<AcademicProblemsLogPage />} />
            <Route path="/mentee/:studentId/activities" element={<ActivitiesLogPage />} />
            <Route path="/mentee/:studentId/exam-performance" element={<ExamPerformancePage />} />
            <Route path="/hods" element={<ManageHodsPage />} />
            <Route path="/hods/create" element={<CreateHodPage />} />
            <Route path="/hod/:id" element={<HodDetailsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
