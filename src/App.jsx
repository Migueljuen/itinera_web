import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast"; // ✅ Add this
import LandingPage from "./pages/shared/LandingPage";
import Login from "./pages/shared/Login";
import Signup from "./pages/shared/signup";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import CreatorDashboard from "./pages/creator/index";
import AdminDashboard from "./pages/admin/index";
import CreatorExperiences from "./pages/creator/activities";
import BookingManagement from "./pages/creator/bookings";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ExperienceCreationForm from "./pages/creator/createExperience/createExperience";
import ExperienceEditForm from "./pages/creator/editExperience/ExperienceEditForm";
import Settings from "./pages/creator/settings";

export default function App() {
  return (
    <Router>
      {/* ✅ Global Toaster (only one needed in the entire app) */}
      <Toaster
        position="top-center"
        containerStyle={{ zIndex: 999999 }}
        toastOptions={{
          duration: 4000,
          style: { background: "#363636", color: "#fff" },
        }}
      />

      <Routes>
        {/* Public Routes - Redirect to dashboard if already logged in */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Creator Routes - Protected */}
        <Route
          path="/owner/create"
          element={
            <ProtectedRoute allowedRoles={["Creator"]}>
              <ExperienceCreationForm />
            </ProtectedRoute>
          }
        />

        {/* Edit Experience Route */}
        <Route
          path="/owner/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["Creator"]}>
              <ExperienceEditForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={["Creator"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CreatorDashboard />} />
          <Route path="dashboard" element={<CreatorDashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="activities" element={<CreatorExperiences />} />
          <Route path="bookings" element={<BookingManagement />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
