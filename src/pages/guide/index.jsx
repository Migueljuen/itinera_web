import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  MapPin,
  Clock,
  Users,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import envelope from "../../assets/icons/envelope.svg";
import NotificationDropdown from "../../components/NotificationDropdown";
import toast, { Toaster } from "react-hot-toast";
import { BellIcon as BellOutline } from "@heroicons/react/24/outline";
import { BellIcon as BellSolid } from "@heroicons/react/24/solid";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);

const GuideDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasOpenedDropdown, setHasOpenedDropdown] = useState(false);
  const notificationRef = useRef(null);
  const [assignedItineraries, setAssignedItineraries] = useState([]);
  const [todayTours, setTodayTours] = useState([]);
  const [upcomingTours, setUpcomingTours] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
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
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const response = await res.json();

        if (response.success && response.notifications !== undefined) {
          setNotifications(response.notifications);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, []);

  // Fetch assigned itineraries
  const fetchAssignedItineraries = async () => {
    if (!user?.user_id) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/guide/itineraries/${user.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const itineraries = response.data.itineraries || [];
      setAssignedItineraries(itineraries);

      // Separate today's tours and upcoming tours
      const today = dayjs().tz("Asia/Manila").startOf("day");
      const todaysList = [];
      const upcomingList = [];

      itineraries.forEach((itinerary) => {
        const tourDate = dayjs(itinerary.tour_date).tz("Asia/Manila");

        if (tourDate.isSame(today, "day")) {
          todaysList.push(itinerary);
        } else if (tourDate.isAfter(today)) {
          upcomingList.push(itinerary);
        }
      });

      setTodayTours(todaysList);
      setUpcomingTours(upcomingList.slice(0, 5)); // Show only next 5 upcoming
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to fetch itineraries");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchAssignedItineraries();
    }
  }, [user]);

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

  const formatTime = (time) => {
    return dayjs(`2000-01-01 ${time}`).format("h:mm A");
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="flex flex-col">
        {/* HEADER */}
        <header className="px-12 pt-4 py-8">
          <div className="flex items-center justify-between">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>
            <div className="flex-1 lg:flex-none">
              <h1 className="text-2xl font-semibold text-gray-900 capitalize">
                Hello, {user?.first_name || "Guide"}
              </h1>
              <p className="text-gray-600 mt-1">
                {todayTours.length > 0
                  ? `You have ${todayTours.length} tour${
                      todayTours.length > 1 ? "s" : ""
                    } today`
                  : "No tours scheduled today"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-4 border-r border-gray-400 px-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-gray-300 grid place-items-center">
                  <img
                    src={envelope}
                    alt="Inbox"
                    className="w-5 cursor-pointer"
                  />
                </div>
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

        {/* MAIN CONTENT */}
        <div className="px-12 flex flex-col gap-6">
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading tours...</p>
            </div>
          ) : (
            <>
              {/* TODAY'S TOURS */}
              <div className="bg-white rounded-lg border border-gray-300 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Today's Tours
                  </h2>
                  <span className="text-sm text-gray-600">
                    {dayjs().format("MMM D, YYYY")}
                  </span>
                </div>

                {todayTours.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar
                      className="mx-auto text-gray-400 mb-2"
                      size={48}
                    />
                    <p className="text-gray-500">
                      No tours scheduled for today
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayTours.map((tour) => (
                      <div
                        key={tour.itinerary_id}
                        className="p-4 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer"
                        onClick={() => navigate(`/owner/itineraries`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              {tour.title || "Tour"}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-gray-400" />
                                <span>
                                  {formatTime(tour.start_time)} -{" "}
                                  {formatTime(tour.end_time)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-gray-400" />
                                <span>{tour.location || "Location TBD"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users size={16} className="text-gray-400" />
                                <span>{tour.group_size || 0} travelers</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Today
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* UPCOMING TOURS */}
              <div className="bg-white rounded-lg border border-gray-300 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Upcoming Tours
                  </h2>
                  <button
                    onClick={() => navigate("/owner/itineraries")}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    View All
                    <ChevronRight size={16} />
                  </button>
                </div>

                {upcomingTours.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar
                      className="mx-auto text-gray-400 mb-2"
                      size={48}
                    />
                    <p className="text-gray-500">No upcoming tours scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingTours.map((tour) => {
                      const tourDate = dayjs(tour.tour_date);
                      const daysUntil = tourDate.diff(dayjs(), "day");

                      return (
                        <div
                          key={tour.itinerary_id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => navigate(`/owner/itineraries`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {tour.title || "Tour"}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar
                                    size={14}
                                    className="text-gray-400"
                                  />
                                  <span>{tourDate.format("MMM D")}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={14} className="text-gray-400" />
                                  <span>{formatTime(tour.start_time)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users size={14} className="text-gray-400" />
                                  <span>{tour.group_size || 0}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-gray-500">
                                {daysUntil === 1
                                  ? "Tomorrow"
                                  : `In ${daysUntil} days`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* QUICK STATS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-300 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Tours</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {assignedItineraries.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="text-blue-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-300 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Today</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {todayTours.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-green-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-300 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {upcomingTours.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="text-purple-600" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default GuideDashboard;
