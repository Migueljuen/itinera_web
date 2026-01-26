import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/shared/LandingPage";
import Login from "./pages/shared/Login";
import Signup from "./pages/shared/signup";
import Terms from "./pages/shared/Terms.jsx";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";

// Creator Pages
import CreatorDashboard from "./pages/creator/index";
import CreatorExperiences from "./pages/creator/activities";
import BookingManagement from "./pages/creator/bookings";
import EarningsManagement from "./pages/creator/earnings";
import ExperienceCreationForm from "./pages/creator/createExperience/createExperience";
import ExperienceEditForm from "./pages/creator/editExperience/edit.jsx";
import CreatorSettings from "./pages/creator/settings";

// ✅ removed Guide Pages
// import GuideDashboard from "./pages/guide/index";
// import GuideAvailability from "./pages/guide/availability";
// import GuideSettings from "./pages/guide/settings";

// ✅ removed Driver Pages
// import DriverDashboard from "./pages/driver/index";
// import DriverAvailability from "./pages/driver/availability";
// import DriverSettings from "./pages/driver/settings";

// ✅ removed Driver vehicle pages
// import VehicleManagement from "./pages/driver/vehicle.jsx";
// import VehicleRegistrationPage from "./pages/driver/registerVehicle/index.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/index";
import ItineraryManagement from "./pages/admin/itinerary.jsx";
import PartnersManagement from "./pages/admin/partner.jsx";
import PartnerDetailScreen from "./pages/admin/partner/id.jsx";
import RefundManagement from "./pages/admin/refund.jsx"; // ✅ ADD THIS

// Shared Components
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ForgotPassword from "./pages/shared/forgot";
import VerifyOtp from "./pages/shared/verify-otp";
import ResetPassword from "./pages/shared/reset-password";
import PartnerOnboardingForm from "./pages/shared/partnerSignup/partnerOnboardingForm.jsx";
import CancellationManagement from "./pages/admin/cancellation.jsx";

export default function App() {
  return (
    <Router>
      <Toaster
        position="top-center"
        containerStyle={{ zIndex: 999999 }}
        toastOptions={{
          duration: 3000,
          style: { background: "#363636", color: "#fff" },
        }}
      />

      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
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
        <Route
          path="/forgot"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <PublicRoute>
              <VerifyOtp />
            </PublicRoute>
          }
        />
        <Route
          path="/Terms"
          element={
            <PublicRoute>
              <Terms />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/partner-onboarding"
          element={
            <PublicRoute>
              <PartnerOnboardingForm />
            </PublicRoute>
          }
        />

        {/* ==================== CREATOR ROUTES (outside layout) ==================== */}
        <Route
          path="/owner/create"
          element={
            <ProtectedRoute allowedRoles={["Creator"]}>
              <ExperienceCreationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["Creator"]}>
              <ExperienceEditForm />
            </ProtectedRoute>
          }
        />

        {/* ==================== OWNER DASHBOARD LAYOUT (CREATOR ONLY) ==================== */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={["Creator"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* CREATOR ROUTES */}
          <Route
            index
            element={
              <ProtectedRoute allowedRoles={["Creator"]}>
                <CreatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={["Creator"]}>
                <CreatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="activities"
            element={
              <ProtectedRoute allowedRoles={["Creator"]}>
                <CreatorExperiences />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookings"
            element={
              <ProtectedRoute allowedRoles={["Creator"]}>
                <BookingManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="earnings"
            element={
              <ProtectedRoute allowedRoles={["Creator"]}>
                <EarningsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={["Creator"]}>
                <CreatorSettings />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="itineraries" element={<ItineraryManagement />} />
          <Route path="partners" element={<PartnersManagement />} />
          <Route path="partner/:id" element={<PartnerDetailScreen />} />
          \
          <Route path="refunds" element={<RefundManagement />} />
          <Route path="cancellations" element={<CancellationManagement />} />
        </Route>

        {/* ==================== FALLBACK ==================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
