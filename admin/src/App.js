import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute.js';


const LoginPage = lazy(() => import('./pages/LoginPage.js'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.js'));
const MenteeListPage = lazy(() => import('./pages/MenteeListPage.js'));
const MenteeDetailsPage = lazy(() => import('./pages/MenteeDetailsPage.js'));
const PerformanceReportPage = lazy(() => import('./pages/PerformanceReportPage.js'));
const ManageStudentsPage = lazy(() => import('./pages/ManageStudentsPage.js'));
const AssessmentLogPage = lazy(() => import('./pages/AssessmentLogPage.js'));
const InterventionLogPage = lazy(() => import('./pages/InterventionLogPage.js'));
const AcademicProblemsLogPage = lazy(() => import('./pages/AcademicProblemsLogPage.js'));
const ActivitiesLogPage = lazy(() => import('./pages/ActivitiesLogPage.js'));
const ManageHodsPage = lazy(() => import('./pages/ManageHodsPage.js'));
const CreateHodPage = lazy(() => import('./pages/CreateHodPage.js'));
const HodDetailsPage = lazy(() => import('./pages/HodDetailsPage.js'));
const ManageDepartmentsPage = lazy(() => import('./pages/ManageDepartmentsPage.js'));
const DepartmentDetailsPage = lazy(() => import('./pages/DepartmentDetailsPage.js'));
const MentorDetailsPage = lazy(() => import('./pages/MentorDetailsPage.js'));
const CreateMentorPage = lazy(() => import('./pages/CreateMentorPage.js'));
const AttendanceMonitorPage = lazy(() => import('./pages/AttendanceMonitorPage.js'));

function RouteLoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', color: '#475569' }}>
      Loading...
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Suspense fallback={<RouteLoadingFallback />}>
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
              <Route path="/hods" element={<ManageHodsPage />} />
              <Route path="/hods/create" element={<CreateHodPage />} />
              <Route path="/hod/:id" element={<HodDetailsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
