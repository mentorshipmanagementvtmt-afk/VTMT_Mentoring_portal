import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute.js';


const LoginPage = lazy(() => import('./pages/LoginPage.js'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.js'));
const MenteeListPage = lazy(() => import('./pages/MenteeListPage.js'));
const MenteeDetailsPage = lazy(() => import('./pages/MenteeDetailsPage.js'));
const EditStudentPage = lazy(() => import('./pages/EditStudentPage.js'));
const PerformanceReportPage = lazy(() => import('./pages/PerformanceReportPage.js'));
const AssessmentLogPage = lazy(() => import('./pages/AssessmentLogPage.js'));
const InterventionLogPage = lazy(() => import('./pages/InterventionLogPage.js'));
const AcademicProblemsLogPage = lazy(() => import('./pages/AcademicProblemsLogPage.js'));
const ActivitiesLogPage = lazy(() => import('./pages/ActivitiesLogPage.js'));
const AttendanceLogPage = lazy(() => import('./pages/AttendanceLogPage.js'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.js'));

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
              <Route path="/students" element={<MenteeListPage />} />
              <Route path="/mentee/:studentId" element={<MenteeDetailsPage />} />
              <Route path="/mentee/:studentId/edit" element={<EditStudentPage />} />
              <Route path="/attendance/log" element={<AttendanceLogPage />} />
              <Route path="/performance" element={<PerformanceReportPage />} />
              <Route path="/mentee/:studentId/assessments" element={<AssessmentLogPage />} />
              <Route path="/mentee/:studentId/interventions" element={<InterventionLogPage />} />
              <Route path="/mentee/:studentId/academic-problems" element={<AcademicProblemsLogPage />} />
              <Route path="/mentee/:studentId/activities" element={<ActivitiesLogPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
