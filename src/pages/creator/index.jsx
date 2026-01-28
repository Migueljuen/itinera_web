// CreatorDashboard.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import envelope from "../../assets/icons/envelope.svg";
import BarChartTest from "../../components/BarChart";
import SubscriptionBanner from "../../components/SubscriptionBanner";
import CalendarView from "../../components/Calendar";
import RecentBooking from "../../components/RecentBooking";
import NotificationDropdown from "../../components/NotificationDropdown";
import toast, { Toaster } from "react-hot-toast";
import { BellIcon as BellOutline } from "@heroicons/react/24/outline";
import { BellIcon as BellSolid } from "@heroicons/react/24/solid";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

dayjs.extend(utc);
dayjs.extend(timezone);

const CreatorDashboard = () => {
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
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          setNotifications([]);
          return;
        }

        const res = await fetch(`${API_URL}/notifications`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          setNotifications([]);
          return;
        }

        const response = await res.json();
        if (response.success && response.notifications !== undefined) {
          setNotifications(response.notifications);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        setNotifications([]);
      }
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

      if (!token) return;

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

  const confirmedEvents = useMemo(() => {
    return bookings.map((b) => {
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

        // ✅ add guest count to the event payload
        guest_count: b.guest_count ?? b.guestCount ?? 0,

        // used to generate a stable pastel color
        colorKey: String(
          b.booking_id ?? b.experience_id ?? b.experience_title ?? "event"
        ),
      };
    });
  }, [bookings]);

  return (
    <div className="flex flex-col w-full pb-48">
      {/* HEADER */}
      <header className="px-12 pt-4 py-8">
        <div className="flex items-center justify-between">
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>

          <div className="flex-1 lg:flex-none">
            <h1 className="text-2xl font-semibold text-gray-900 capitalize">
              Hello, {user?.first_name || "Creator"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-4 border-r border-gray-400 px-4">
              {/* Notification Bell */}
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

              <div className="hidden sm:flex items-center gap-1">
                <p className="text-base font-medium text-primary capitalize">
                  {user?.first_name} {user?.last_name}
                </p>

                {user?.status === "Approved" && (
                  <CheckBadgeIcon className="size-5 text-blue-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT WRAPPER */}
      <div className="w-full pb-10 ">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-stretch">
          <div className="flex flex-col">
            {!isSubscribed && (
              <div className="h-full">
                <div className="h-full">
                  <SubscriptionBanner />
                </div>
              </div>
            )}
          </div>

          <div className="h-full w-full rounded-4xl box-border border border-gray-300 bg-white flex flex-col">
            <div className="px-4 py-6 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-gray-900">
                Recent Bookings
              </h1>
            </div>

            <div className="flex-1 min-h-0 px-4 py-4 overflow-auto">
              <RecentBooking />
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="mt-6 w-full ">
          <div className="w-full h-[800px] rounded-4xl ">
            <CalendarView events={confirmedEvents} />
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default CreatorDashboard;
