import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/shared/LandingPage';
import Login from './pages/shared/Login';
import Signup from './pages/shared/signup';
import DashboardLayout from './layouts/DashboardLayout';

import CreatorDashboard from './pages/creator/index';
import CreatorExperiences from './pages/creator/activities';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Creator Routes with Dashboard Layout */}
        <Route path="/creator" element={<DashboardLayout />}>
          <Route index element={<CreatorDashboard />} />
          <Route path="dashboard" element={<CreatorDashboard />} />
          <Route path="experiences" element={<CreatorExperiences />} />
        </Route>

      </Routes>
    </Router>
  );
}