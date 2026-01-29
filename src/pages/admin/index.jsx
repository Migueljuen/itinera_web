import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, ChevronRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import dummyNotifications from "../../constants/dummyNotif";
import NotificationDropdown from "../../components/NotificationDropdown";
import PendingApprovalSection from "../../components/PendingApprovalSection";
import toast, { Toaster } from "react-hot-toast";
import {
  PaperAirplaneIcon,
  ArrowDownRightIcon,
  BellIcon as BellOutline,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserPlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ClockIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellSolid } from "@heroicons/react/24/solid";

import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasOpenedDropdown, setHasOpenedDropdown] = useState(false);
  const notificationRef = useRef(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [stats, setStats] = useState({
    activeExperiences: { count: 0, percentageChange: null },
    pendingExperiences: { count: 0 },
    activeCreators: { count: 0, percentageChange: null },
    pendingCreators: { count: 0 },
  });
  const isSubscribed = 0;

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/admin/stats`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  // Fetch pending payments for the dashboard
  const fetchPendingPayments = async () => {
    try {
      setLoadingPayments(true);
      const response = await axios.get(`${API_URL}/admin/itineraries`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Filter only pending payments and limit to 3
      const pending = (response.data.itineraries || [])
        .filter((i) => i.payment_status === "Pending")
        .slice(0, 3);

      setPendingPayments(pending);
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      setPendingPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    if (user?.user_id) {
      fetchPendingPayments();
    }
  }, [user]);

  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM D");
  };

  // Navigate to full itinerary management page with selected itinerary
  const handleViewPayment = (itineraryId) => {
    navigate(`/admin/itinerary-management?selectedId=${itineraryId}`);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      console.log("=== FETCH NOTIFICATIONS DEBUG ===");

      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        console.log("Token found:", !!token);

        if (!token) {
          console.error("No auth token found - setting dummy notifications");
          setNotifications(dummyNotifications);
          return;
        }

        console.log("API_URL:", API_URL);
        console.log("Full endpoint:", `${API_URL}/notifications`);

        console.log("Making fetch request...");
        const res = await fetch(`${API_URL}/notifications`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Response received:");
        console.log("- Status:", res.status);
        console.log("- OK:", res.ok);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error response body:", errorText);
          throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
        }

        console.log("Parsing JSON...");
        const response = await res.json();
        console.log("Parsed response:", response);

        if (response.success && response.notifications !== undefined) {
          console.log("Setting notifications from API");
          setNotifications(response.notifications);
        } else {
          console.log("API response invalid, setting empty array");
          setNotifications([]);
        }
      } catch (err) {
        console.error("=== FETCH ERROR ===");
        console.error("Error details:", err);
        setNotifications([]);
      }

      console.log("=== END FETCH DEBUG ===");
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        console.error("No auth token found");
        setNotifications([]);
        return;
      }

      if (notificationId === "all") {
        const res = await fetch(`${API_URL}/notifications/mark-all-read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, is_read: true }))
          );
        }
      } else {
        const res = await fetch(
          `${API_URL}/notifications/${notificationId}/read`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.ok) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, is_read: true } : n
            )
          );
        }
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleUpdateNotification = (notificationId, responseType) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, is_read: true, traveler_attendance: responseType }
          : n
      )
    );
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchBookings = async () => {
    if (!user?.user_id) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/booking/creator/upcoming/${user.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
      if (error.response?.status !== 404) {
        toast.error("Failed to fetch bookings");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchBookings();
    }
  }, [user]);

  const confirmedEvents = bookings.map((b) => {
    const start = dayjs
      .utc(b.booking_date)
      .tz("Asia/Manila")
      .hour(parseInt(b.start_time.split(":")[0]))
      .minute(parseInt(b.start_time.split(":")[1]));

    const end = dayjs
      .utc(b.booking_date)
      .tz("Asia/Manila")
      .hour(parseInt(b.end_time.split(":")[0]))
      .minute(parseInt(b.end_time.split(":")[1]));

    return {
      id: b.booking_id,
      title: b.experience_title || "Upcoming",
      start: start.toDate(),
      end: end.toDate(),
    };
  });

  return (
    <div className="flex flex-col pb-48">
      {/* HEADER */}
      <header className=" pt-4 py-8 ">
        <div className="flex items-center justify-between">
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
          <div className="flex-1 lg:flex-none">
            <h1 className="text-2xl font-semibold text-gray-900 capitalize">
              Dashboard
            </h1>
            <p className="  text-black/60">
              Manage users and activity approval here.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 border-r border-gray-400 px-4">
              <div className="relative" ref={notificationRef}>
                <div
                  className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-gray-300 grid place-items-center cursor-pointer transition-colors relative ${showNotifications
                    ? "bg-blue-100 hover:bg-blue-200 active:bg-blue-300"
                    : "hover:bg-gray-100 active:bg-gray-200"
                    }`}
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) setHasOpenedDropdown(true);
                  }}
                >
                  {showNotifications ? (
                    <BellSolid className="w-5 h-5 text-blue-600" />
                  ) : (
                    <BellOutline className="w-5 h-5 text-black/90" />
                  )}
                  {unreadCount > 0 && !hasOpenedDropdown && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </div>
                  )}
                </div>
                {showNotifications && (
                  <NotificationDropdown
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                    onMarkAsRead={handleMarkAsRead}
                    onUpdateNotification={handleUpdateNotification}
                  />
                )}
              </div>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-4">
              {user?.profile_pic ? (
                <img
                  src={`${API_URL}/${user.profile_pic}`}
                  alt="Profile"
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">
                    {user?.first_name?.[0] || "U"}
                  </span>
                </div>
              )}
              <div className="text-right hidden sm:block">
                <p className="text-base font-medium text-primary capitalize">
                  {user?.first_name} {user?.last_name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="flex flex-1 flex-col w-full  xl:border-none gap-8  ">
        {/* Overview */}

        <div className="flex gap-2 w-full ">


          <div className="flex gap-2 flex-col flex-[0.3] h-full ">
            {/* New Tickets / Active Activities */}
            <div className="bg-white  px-6 py-8 rounded-2xl border border-gray-300 flex flex-col justify-between h-fit">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="p-2 bg-green-50 rounded-md">
                  <PresentationChartLineIcon className="w-7 h-7 text-green-900/50" />
                </div>
                <p className="font-medium text-black/80">Active Activities</p>
              </div>

              <div className="flex justify-between items-end mt-4 ">
                <div className="flex items-start gap-6 flex-col ">
                  <p className="text-3xl font-semibold text-black/80">
                    {stats.activeExperiences.count}
                  </p>
                  {/* <div className="flex gap-2">
                    <span className="flex items-center w-fit text-green-600 bg-green-50 h-fit py-0.5 px-3 rounded-full border border-green-300 text-sm">
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                      +18%
                    </span>
                    <p className="text-black/40 text-sm  "> Than last month</p>
                  </div> */}
                </div>


              </div>
            </div>

            {/* Review needed*/}

          </div>
        </div>

        {/* recent activities and chart */}
        <div className="flex gap-4 w-full mt-24">
          {/* pending activities for approval */}
          <PendingApprovalSection />
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
