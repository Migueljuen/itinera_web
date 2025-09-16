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
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logoImage from "../assets/images/alt.png";
import Calendars from "../assets/icons/calendar.svg";
import API_URL from "../constants/api";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isTasksExpanded, setIsTasksExpanded] = useState(true);

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

  const navigationItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/creator/dashboard",
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
      icon: () => <img src={Calendars} alt="Bookings" className="w-5 h-5" />,
      path: "/owner/bookings",
      expandable: true,
      isExpanded: isTasksExpanded,
      setExpanded: setIsTasksExpanded,
      subItems: [
        { label: "Active Bookings", path: "/owner/bookings/active" },
        { label: "Completed", path: "/owner/bookings/completed" },
      ],
    },
    {
      id: "messages",
      label: "Inbox",
      icon: Inbox,
      path: "/creator/messages",
      expandable: false,
    },
  ];
  useEffect(() => {
    console.log("DashboardLayout mounted");
    console.log("Current user:", user);
    console.log("Current location:", location.pathname);
  }, [user, location]);

  const NavItem = ({ item }) => {
    const Icon = item.icon;

    if (item.expandable) {
      return (
        <>
          <div>
            <button
              onClick={() => item.setExpanded(!item.isExpanded)}
              className="w-full flex items-center justify-between px-4 py-3  hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className="text-primary  " />
                <span className="text-primary">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${
                    item.isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>
            {item.isExpanded && (
              <div className="ml-8 mt-1 space-y-1">
                {item.subItems.map((subItem) => (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    className={({ isActive }) =>
                      `block px-4 py-2 text-sm rounded-lg transition-colors ${
                        isActive
                          ? "bg-gray-100 text-primary "
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    {subItem.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </>
      );
    }

    return (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
            isActive ? "bg-green-50 text-green-600" : " hover:bg-gray-100"
          }`
        }
      >
        <Icon size={20} className={`text-primary`} />
        <span className="text-primary">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
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
          className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-300  z-50 transform transition-transform duration-300 lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
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

            {/* Upgrade Section */}
            <div className="p-4 border-t border-gray-200">
              <div className=" rounded-lg p-4  text-center text-primary">
                <h3 className="font-bold mb-1">Upgrade Plan</h3>
                <p className="text-sm opacity-90 mb-3">
                  Showcase more activities
                </p>
                <button className="bg-[#376a63] text-gray-50 px-4 py-2 rounded-4xl text-sm font-medium hover:bg-[#376a63]/80 cursor-pointer transition-colors w-3/4">
                  Upgrade
                </button>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="p-4   space-y-1">
              <p className="pl-4 text-black/60 text-xs font-medium">SETTINGS</p>
              <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings size={20} className="text-gray-500" />
                <span className="font-medium">Settings</span>
              </button>
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DashboardLayout;
