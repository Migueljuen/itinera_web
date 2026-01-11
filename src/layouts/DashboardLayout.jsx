//DashboardLayout.tsx
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  Calendar,
  Users,
  Settings,
  HelpCircle,
  Inbox,
  LogOut,
  X,
  ChevronDown,
  Plus,
  Car,
  CarFront,
  DollarSign,
  Map,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logoImage from "../assets/images/alt.png";
import Calendars from "../assets/icons/calendar.svg";
import API_URL from "../constants/api";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import FloatingChat from '../components/FloatingChat';
const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isTasksExpanded, setIsTasksExpanded] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { shouldAnimateDashboard, disableDashboardAnimation } = useAuth();
  const userRole = user?.role;

  const currentUser = user ? {
    id: user.user_id,
    username: user.first_name || 'User'
  } : null;

  // Function to get navigation items based on user role
  const getNavigationItems = (role) => {
    switch (role) {
      case "Creator":
        return [
          {
            id: "home",
            label: "Home",
            icon: Home,
            path: "/owner",
            expandable: false,
          },
          {
            id: "activities",
            label: "Activities",
            icon: LayoutGrid,
            path: "/owner/activities",
            expandable: true,
            isExpanded: isProjectsExpanded,
            setExpanded: setIsProjectsExpanded,
            subItems: [
              { label: "Manage Activities", path: "/owner/activities" },
              { label: "Create listing", path: "/owner/create" },
            ],
          },
          {
            id: "bookings",
            label: "Bookings",
            icon: () => (
              <img src={Calendars} alt="Bookings" className="w-5 h-5" />
            ),
            path: "/owner/bookings",
            expandable: true,
            isExpanded: isTasksExpanded,
            setExpanded: setIsTasksExpanded,
            subItems: [{ label: "Manage Bookings", path: "/owner/bookings" }],
          },
          {
            id: "earnings",
            label: "Earnings",
            icon: DollarSign,
            path: "/owner/earnings",
            expandable: false,
          },
        ];

      case "Guide":
        return [
          {
            id: "home",
            label: "Home",
            icon: Home,
            path: "/owner/guide",
            expandable: false,
          },
          {
            id: "itineraries",
            label: "Itineraries",
            icon: Map,
            path: "/owner/itineraries",
            expandable: true,
            isExpanded: isProjectsExpanded,
            setExpanded: setIsProjectsExpanded,
            subItems: [
              { label: "Assigned Tours", path: "/owner/itineraries" },
              { label: "Daily Schedule", path: "/owner/itineraries/schedule" },
            ],
          },
          {
            id: "availability",
            label: "Availability",
            icon: Calendar,
            path: "/owner/availability",
            expandable: false,
          },
        ];

      case "Driver":
        return [
          {
            id: "home",
            label: "Home",
            icon: Home,
            path: "/owner/driver",
            expandable: false,
          },
          {
            id: "trips",
            label: "Trips",
            icon: Car,
            path: "/owner/trips",
            expandable: true,
            isExpanded: isProjectsExpanded,
            setExpanded: setIsProjectsExpanded,
            subItems: [
              { label: "Upcoming Trips", path: "/owner/trips" },
              { label: "Trip History", path: "/owner/trips/history" },
            ],
          },
          {
            id: "availability",
            label: "Availability",
            icon: Calendar,
            path: "/owner/driver/availability",
            expandable: false,
          },
          {
            id: "vehicle",
            label: "My Vehicle",
            icon: CarFront,
            path: "/owner/driver/vehicle",
            expandable: false,
          },
        ];

      default:
        return [];
    }
  };

  // Get navigation items based on current user role
  const navigationItems = getNavigationItems(user?.role);

  // Function to fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.count);
        }
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Set up polling to check for new notifications
  useEffect(() => {
    fetchUnreadCount();

    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh count when location changes (navigation)
  useEffect(() => {
    fetchUnreadCount();
  }, [location.pathname]);

  // Only redirect if the user is a first-login creator and on /owner root
  useEffect(() => {
    if (user?.is_first_login && user?.role === "Creator") {
      navigate("/owner/create", { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Disable animation after it completes
  useEffect(() => {
    if (shouldAnimateDashboard) {
      const timer = setTimeout(() => {
        disableDashboardAnimation();
      }, 500); // After animation duration completes

      return () => clearTimeout(timer);
    }
  }, [shouldAnimateDashboard, disableDashboardAnimation]);

  useEffect(() => {
    console.log("DashboardLayout mounted");
    console.log("Current user:", user);
    console.log("Current location:", location.pathname);
  }, [user, location]);

  const NavItem = ({ item }) => {
    const Icon = item.icon;

    if (item.expandable) {
      return (
        <div className="relative">
          <button
            onClick={() => item.setExpanded(!item.isExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Icon size={20} className="text-primary" />
              <span className="text-primary">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${item.isExpanded ? "rotate-180" : ""
                  }`}
              />
            </div>
          </button>

          {item.isExpanded && (
            <div className="relative ml-8 mt-1 space-y-1 ">
              {/* Vertical line connecting to sub-items */}
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-300"></div>

              {item.subItems.map((subItem, index) => (
                <div key={subItem.path} className="relative">
                  {/* Horizontal line connecting to each sub-item */}
                  <div className="absolute left-2 top-1/2 w-4 h-px bg-gray-300 -translate-y-1/2"></div>

                  <NavLink
                    to={subItem.path}
                    className={({ isActive }) =>
                      `block px-6 py-2 text-sm rounded-lg transition-colors ml-4 whitespace-nowrap ${isActive
                        ? "bg-gray-100 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    {subItem.label}
                  </NavLink>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        to={item.path}
        onClick={() => {
          // Refresh notification count when inbox is clicked
          if (item.id === "messages") {
            setTimeout(() => {
              fetchUnreadCount();
            }, 100);
          }
        }}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group relative ${isActive ? " text-green-600" : " hover:bg-gray-100"
          }`
        }
      >
        <div className="relative">
          <Icon size={20} className="text-primary" />
          {/* Notification Badge */}
          {item.badge > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {item.badge > 99 ? "99+" : item.badge}
            </div>
          )}
        </div>
        <span className="text-primary">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={shouldAnimateDashboard ? { opacity: 0, y: 40 } : false}
        animate={shouldAnimateDashboard ? { opacity: 1, y: 0 } : {}}
        exit={shouldAnimateDashboard ? { opacity: 0, y: -40 } : {}}
        transition={
          shouldAnimateDashboard ? { duration: 0.4, ease: "easeInOut" } : {}
        }
        className="min-h-screen w-full font-display"
      >
        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-300  z-50 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex flex-col min-h-screen">
            {/* Logo Section */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <img
                  src={logoImage}
                  alt="Itinera Logo"
                  className="w-8 cursor-pointer transition-transform"
                />
                <span className="text-2xl pt-1  font-medium">Itinera</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <p className="pl-4 text-black/60 text-xs font-medium">OVERVIEW</p>
              {navigationItems.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 space-y-1">
              <p className="pl-4 text-black/60 text-xs font-medium">SETTINGS</p>

              {/* Render settings button only for owners */}
              {userRole === "Creator" && (
                <button
                  onClick={() => navigate("/owner/settings")}
                  className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings size={20} className="text-gray-500" />
                  <span className="font-medium">Settings</span>
                </button>
              )}

              {/* Render settings button for admins */}
              {userRole === "Guide" && (
                <button
                  onClick={() => navigate("/owner/guide/settings")}
                  className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings size={20} className="text-gray-500" />
                  <span className="font-medium">Settings</span>
                </button>
              )}

              {/* Log out button is universal */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={20} className="text-gray-500" />
                <span className="font-medium">Log out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:ml-64 min-h-screen flex flex-col">
          {/* Page Content */}
          <main className="p-4 lg:p-8 flex-1 flex flex-col">
            {children || <Outlet />}
          </main>
          {currentUser && <FloatingChat currentUser={currentUser} />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DashboardLayout;
