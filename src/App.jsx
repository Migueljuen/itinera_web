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
import DashboardLayout from "./layouts/DashboardLayout";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";

// Creator Pages
import CreatorDashboard from "./pages/creator/index";
import CreatorExperiences from "./pages/creator/activities";
import BookingManagement from "./pages/creator/bookings";
import ExperienceCreationForm from "./pages/creator/createExperience/createExperience";
import ExperienceEditForm from "./pages/creator/editExperience/ExperienceEditForm";
import CreatorSettings from "./pages/creator/settings";

// Guide Pages
import GuideDashboard from "./pages/guide/index";
// import GuideItineraries from "./pages/guide/itineraries"; // TODO: Create
import GuideAvailability from "./pages/guide/availability";
import GuideSettings from "./pages/guide/settings";

// Driver Pages
import DriverDashboard from "./pages/driver/index"; // TODO: Create
// import DriverTrips from "./pages/driver/trips"; // TODO: Create
import DriverAvailability from "./pages/driver/availability";
import DriverSettings from "./pages/driver/settings"; // TODO: Create

// Admin Pages
import AdminDashboard from "./pages/admin/index";
import ItineraryManagement from "./pages/admin/itinerary.jsx";
import PartnersManagement from "./pages/admin/partner.jsx";
import PartnerDetailScreen from "./pages/admin/partner/id.jsx";

// Shared Components
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ForgotPassword from "./pages/shared/forgot";
import VerifyOtp from "./pages/shared/verify-otp";
import ResetPassword from "./pages/shared/reset-password";
import PartnerOnboardingForm from "./pages/shared/partnerSignup/partnerOnboardingForm.jsx";
import VehicleManagement from "./pages/driver/vehicle.jsx";
import VehicleRegistrationPage from "./pages/driver/registerVehicle/index.jsx";

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

        {/* ==================== OWNER DASHBOARD LAYOUT (All Roles) ==================== */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={["Creator", "Driver", "Guide"]}>
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
            path="settings"
            element={
              <ProtectedRoute allowedRoles={["Creator"]}>
                <CreatorSettings />
              </ProtectedRoute>
            }
          />

          {/* GUIDE ROUTES */}
          <Route
            path="guide"
            element={
              <ProtectedRoute allowedRoles={["Guide"]}>
                <GuideDashboard />
              </ProtectedRoute>
            }
          />
          {/* TODO: Create GuideItineraries component */}
          {/* <Route 
            path="itineraries" 
            element={
              <ProtectedRoute allowedRoles={["Guide"]}>
                <GuideItineraries />
              </ProtectedRoute>
            } 
          /> */}
          {/* <Route 
            path="itineraries/schedule" 
            element={
              <ProtectedRoute allowedRoles={["Guide"]}>
                <GuideItineraries />
              </ProtectedRoute>
            } 
          /> */}
          <Route
            path="availability"
            element={
              <ProtectedRoute allowedRoles={["Guide"]}>
                <GuideAvailability />
              </ProtectedRoute>
            }
          />
          <Route
            path="guide/settings"
            element={
              <ProtectedRoute allowedRoles={["Guide"]}>
                <GuideSettings />
              </ProtectedRoute>
            }
          />

          {/* DRIVER ROUTES */}
          <Route
            path="driver"
            element={
              <ProtectedRoute allowedRoles={["Driver"]}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          {/* TODO: Create DriverTrips component */}
          {/* <Route 
            path="trips" 
            element={
              <ProtectedRoute allowedRoles={["Driver"]}>
                <DriverTrips />
              </ProtectedRoute>
            } 
          /> */}
          {/* <Route 
            path="trips/history" 
            element={
              <ProtectedRoute allowedRoles={["Driver"]}>
                <DriverTrips />
              </ProtectedRoute>
            } 
          /> */}
          <Route
            path="driver/vehicle/add"
            element={
              <ProtectedRoute allowedRoles={["Driver"]}>
                <VehicleRegistrationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="driver/vehicle"
            element={
              <ProtectedRoute allowedRoles={["Driver"]}>
                <VehicleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="driver/availability"
            element={
              <ProtectedRoute allowedRoles={["Driver"]}>
                <DriverAvailability />
              </ProtectedRoute>
            }
          />
          <Route
            path="driver/settings"
            element={
              <ProtectedRoute allowedRoles={["Driver"]}>
                <DriverSettings />
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
        </Route>

        {/* ==================== FALLBACK ==================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
