import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import envelope from "../../assets/icons/envelope.svg";
import BarChartTest from "../../components/BarChart";
import SubscriptionBanner from "../../components/SubscriptionBanner";
import CalendarView from "../../components/Calendar";
import RecentBooking from "../../components/RecentBooking";
import dummyNotifications from "../../constants/dummyNotif";
import NotificationDropdown from "../../components/NotificationDropdown";
import PendingApprovalSection from "../../components/PendingApprovalSection";
import toast, { Toaster } from "react-hot-toast";
import {
  PaperAirplaneIcon,
  ArrowDownRightIcon,
  BellIcon as BellOutline,
  UsersIcon,
  UserPlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
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
  const isSubscribed = 0;

  useEffect(() => {
    const fetchNotifications = async () => {
      console.log("=== FETCH NOTIFICATIONS DEBUG ===");

      try {
        // 1. Check token
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        console.log("Token found:", !!token);
        console.log(
          "Token value:",
          token ? `${token.substring(0, 20)}...` : "null"
        );

        if (!token) {
          console.error("No auth token found - setting dummy notifications");
          setNotifications(dummyNotifications);
          return;
        }

        // 2. Check API_URL
        console.log("API_URL:", API_URL);
        console.log("Full endpoint:", `${API_URL}/notifications`);

        // 3. Make the request
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
        console.log("- Status Text:", res.statusText);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error response body:", errorText);
          throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
        }

        // 4. Parse response
        console.log("Parsing JSON...");
        const response = await res.json();
        console.log("Parsed response:", response);

        // 5. Check response structure
        console.log("Response.success:", response.success);
        console.log("Response.notifications:", response.notifications);
        console.log(
          "Notifications length:",
          response.notifications?.length || 0
        );

        // 6. Set notifications
        if (response.success && response.notifications) {
          console.log("Setting notifications from API");
          setNotifications(
            response.notifications.length > 0
              ? response.notifications
              : dummyNotifications
          );
        } else {
          console.log("API response invalid, using dummy data");
          setNotifications(dummyNotifications);
        }
      } catch (err) {
        console.error("=== FETCH ERROR ===");
        console.error("Error details:", err);
        console.error("Error message:", err.message);
        console.error("Setting dummy notifications as fallback");
        setNotifications(dummyNotifications);
      }

      console.log("=== END FETCH DEBUG ===");
    };

    fetchNotifications();
  }, []);
  useEffect(() => {
    console.log("User ID:", user?.id);
    console.log("Notifications:", notifications);
  }, [user?.id, notifications]);

  // Close dropdown when clicking outside
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

  // Mark notifications as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        console.error("No auth token found");
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

  // Handle attendance response update
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
    <div className="flex flex-col ">
      {/* HEADER */}
      <header className=" pt-4 py-8 ">
        <div className="flex items-center justify-between">
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
          <div className="flex-1 lg:flex-none">
            <h1 className="text-2xl font-semibold text-gray-900 capitalize">
              Admin Dashboard
            </h1>
            <p className="  text-black/60">
              Manage users and activity approval here.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 border-r border-gray-400 px-4">
              {/* <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-gray-300 grid place-items-center">
                <img
                  src={envelope}
                  alt="Inbox"
                  className="w-5 cursor-pointer"
                />
              </div> */}
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <div
                  className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-gray-300 grid place-items-center cursor-pointer transition-colors relative ${
                    showNotifications
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
                    onUpdateNotification={handleUpdateNotification} // <-- this
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

        <div className="flex gap-4 w-full">
          {/* card dummy data */}
          <div className="bg-white flex-1 h-30 px-6 shadow-sm flex flex-col justify-around rounded-2xl">
            <span className="flex gap-4">
              <PaperAirplaneIcon className="w-6 h-6 text-green-600" />
              <p className="font-medium text-black/80">Active Activities</p>
            </span>
            <span className="flex justify-between">
              <div className="flex gap-2">
                <p className="text-3xl font-semibold text-black/80">132</p>
                <span className="flex">
                  <ChevronUpIcon className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-600">+20%</p>
                </span>
              </div>
              <ArrowDownRightIcon className="w-5 h-5 text-black/80" />
            </span>
          </div>

          {/* card dummy data */}
          <div className="bg-white flex-1 h-30 px-6 shadow-sm flex flex-col justify-around rounded-2xl">
            <span className="flex gap-4">
              <PaperAirplaneIcon className="w-6 h-6 text-orange-600" />
              <p className="font-medium text-black/80">Pending Activities</p>
            </span>
            <span className="flex justify-between">
              <p className="text-3xl font-semibold text-black/80">4</p>
              <ArrowDownRightIcon className="w-5 h-5 text-black/80" />
            </span>
          </div>

          {/* card dummy data */}
          <div className="bg-white flex-1 h-30 px-6 shadow-sm flex flex-col justify-around rounded-2xl">
            <span className="flex gap-4">
              <UsersIcon className="w-6 h-6 text-purple-800" />
              <p className="font-medium text-black/80">Active Creators</p>
            </span>
            <span className="flex justify-between">
              <div className="flex gap-2">
                <p className="text-3xl font-semibold text-black/80">132</p>
                <span className="flex">
                  <ChevronDownIcon className="w-4 h-4 text-orange-600" />
                  <p className="text-sm text-orange-600">20%</p>
                </span>
              </div>
              <ArrowDownRightIcon className="w-5 h-5 text-black/80" />
            </span>
          </div>

          {/* card dummy data */}
          <div className="bg-white flex-1 h-30 px-6 shadow-sm flex flex-col justify-around rounded-2xl">
            <span className="flex gap-4">
              <UserPlusIcon className="w-6 h-6 text-green-600" />
              <p className="font-medium text-black/80">Pending creators</p>
            </span>
            <span className="flex justify-between">
              <p className="text-3xl font-semibold text-black/80">2</p>
              <ArrowDownRightIcon className="w-5 h-5 text-black/80" />
            </span>
          </div>
        </div>
        {/* recent activities and chart */}
        <div className="flex gap-4 w-full">
          {/* pending activities for approval */}
          <PendingApprovalSection />

          {/* chart */}
          <div className="bg-white flex-1 h-90 px-6 shadow-sm flex flex-col justify-start rounded-2xl">
            <h1 className="text-lg font-medium text-black/80 py-4 border-b border-gray-200">
              Activities booked
            </h1>
            {/* <BarChartTest /> */}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
