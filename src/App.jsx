import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/shared/LandingPage';
import Login from './pages/shared/Login';
import Signup from './pages/shared/signup';
import DashboardLayout from './layouts/DashboardLayout';
import CreatorDashboard from './pages/creator/index';
import CreatorExperiences from './pages/creator/activities';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ExperienceCreationForm from './pages/creator/createExperience/createExperience';
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Redirect to dashboard if already logged in */}
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />

        {/* Creator Routes - Protected */}
        <Route path="/owner" element={
          <ProtectedRoute allowedRoles={['Creator']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CreatorDashboard />} />
          <Route path="dashboard" element={<CreatorDashboard />} />
          <Route path="activities" element={<CreatorExperiences />} />
          <Route path="create" element={<ExperienceCreationForm />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}