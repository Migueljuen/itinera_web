//DashboardLayout.tsx
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, LayoutGrid, LogOut, X, CreditCard } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logoImage from "../assets/images/alt.png";
import API_URL from "../constants/api";
import { AnimatePresence, motion } from "framer-motion";
import FloatingChat from "../components/FloatingChat";

const AdminDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, shouldAnimateDashboard, disableDashboardAnimation } =
    useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const currentUser = user
    ? {
      id: user.user_id,
      username: user.first_name || "User",
    }
    : null;

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
        if (data.success) setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Set up polling to check for new notifications
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh count when location changes (navigation)
  useEffect(() => {
    fetchUnreadCount();
  }, [location.pathname]);

  // Only redirect if the user is a first-login creator and on /owner root
  useEffect(() => {
    if (user?.is_first_login) {
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
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimateDashboard, disableDashboardAnimation]);

  const navigationItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/admin-dashboard",
    },
    {
      id: "partners",
      label: "Partners",
      icon: LayoutGrid,
      path: "/partners",
    },

    {
      id: "subscriptions",
      label: "Subscriptions",
      icon: CreditCard,
      path: "/subscriptions",
    },
  ];

  const NavItem = ({ item }) => {
    const Icon = item.icon;

    return (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group relative ${isActive ? "bg-gray-100 " : " hover:bg-gray-100"
          }`
        }
      >
        <div className="relative">
          <Icon size={20} className="text-primary" />
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
          className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-300 z-50 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
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
                <span className="text-2xl pt-1 font-medium">Itinera</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
              <p className="pl-4 text-black/60 text-xs font-medium">OVERVIEW</p>
              {navigationItems.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 space-y-1">
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
        <div className="lg:ml-64 min-h-screen flex flex-col ">
          <main className="p-4 lg:p-8 flex-1 flex flex-col">
            {children || <Outlet />}
          </main>
          {currentUser && <FloatingChat currentUser={currentUser} />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminDashboardLayout;
