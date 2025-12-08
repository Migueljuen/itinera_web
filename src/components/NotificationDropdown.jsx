import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Star,
  CheckCircle,
  Check,
  MoreHorizontal,
  Plane,
  MapPin,
  Rocket,
  Clock,
  Trash2,
  XCircle,
  RotateCcw,
  DollarSign,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import API_URL from "../constants/api";

const NotificationDropdown = ({
  notifications,
  setNotifications,
  onClose,
  onMarkAsRead,
}) => {
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const [toggleDropdown, setToggleDropdown] = useState(false);
  const [attendanceResponses, setAttendanceResponses] = useState({});

  const formatTime = (timeStr) => {
    if (!timeStr) return "Unknown time";

    const date = new Date(timeStr);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Unknown time";
    }

    return formatDistanceToNow(date, { addSuffix: true }).replace(
      /^about\s/,
      ""
    );
  };

  const handleAttendanceResponse = async (
    bookingId,
    notificationId,
    responseType
  ) => {
    try {
      await axios.put(
        `${API_URL}/booking/${bookingId}/attendance/${notificationId}`,
        {
          response: responseType,
        }
      );

      // update local button state
      setAttendanceResponses((prev) => ({
        ...prev,
        [bookingId]: responseType,
      }));

      //  update parent notifications state
      if (typeof onUpdateNotification === "function") {
        onUpdateNotification(notificationId, responseType);
      }
    } catch (err) {
      console.error("❌ Failed to send attendance response:", err);
    }
  };

  const getIcon = (iconName) => {
    const iconMap = {
      "checkmark-circle": CheckCircle,
      airplane: Plane,
      location: MapPin,
      calendar: Calendar,
      rocket: Rocket,
      time: Clock,
      "star-outline": Star,
      "trash-outline": Trash2,
      "close-circle-outline": XCircle,
      "sync-outline": RotateCcw,
      "time-outline": Clock,
      cash: DollarSign,
      "help-circle": Clock,
    };
    return iconMap[iconName] || CheckCircle;
  };

  // 🔥 NEW: Handle notification click and navigation
  const handleNotificationClick = async (notification) => {
    // Mark as read first
    if (!notification.is_read && onMarkAsRead) {
      await onMarkAsRead(notification.id);
    }

    // Navigate based on notification type and associated IDs
    if (notification.type === "alert" && notification.itinerary_id) {
      // Payment notification - navigate to itinerary management (ADMIN)
      navigate(`/admin/itineraries?selectedId=${notification.itinerary_id}`);
      onClose && onClose();
    } else if (
      notification.type === "attendance_confirmation" &&
      notification.booking_id
    ) {
      // Attendance notification - navigate to booking management
      navigate(`/bookings?selectedId=${notification.booking_id}`);
      onClose && onClose();
    } else if (notification.booking_id) {
      // Other booking-related notifications
      navigate(`/bookings?selectedId=${notification.booking_id}`);
      onClose && onClose();
    } else if (notification.itinerary_id) {
      // Other itinerary-related notifications
      navigate(`/itineraries?selectedId=${notification.itinerary_id}`);
      onClose && onClose();
    }
  };

  return (
    <div className="absolute h-[42rem] right-0 mt-2 w-[32rem] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-auto">
      {/* Header */}
      <div className="p-6 relative flex justify-between">
        <div>
          <h3 className="text-xl font-semibold text-black/80">Notifications</h3>
          <p className="text-gray-400 text-sm">
            {unreadCount > 0
              ? `${unreadCount} new notifications`
              : "All caught up"}
          </p>
        </div>
        <button
          onClick={() => setToggleDropdown(!toggleDropdown)}
          className="p-1 text-black/60 self-start hover:text-black/40 rounded-full hover:bg-gray-200 active:bg-gray-300"
        >
          <MoreHorizontal size={18} />
        </button>

        {/* Dropdown */}
        {toggleDropdown && (
          <div className="absolute right-5 mt-8 w-fit bg-white rounded-md z-50 shadow-[0_0_10px_rgba(0,0,0,0.2)]">
            <button
              onClick={() => {
                onMarkAsRead && onMarkAsRead("all");
                setToggleDropdown(false);
              }}
              className="w-full text-left py-4 pl-4 pr-24 gap-2 text-sm font-medium text-black/80 flex justify-start hover:bg-gray-100 capitalize"
            >
              <Check size={18} />
              Mark all as read
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 512 512"
                className="text-gray-400"
              >
                <path
                  fill="currentColor"
                  d="M424 80H88a56.06 56.06 0 00-56 56v240a56.06 56.06 0 0056 56h336a56.06 56.06 56 0 0056-56V136a56.06 56.06 56 0 00-56-56zM424 96c13.23 0 24 10.77 24 24v16L256 272 64 136v-16c0-13.23 10.77-24 24-24z"
                />
              </svg>
            </div>
            <p className="text-gray-400 font-medium text-lg">
              No notifications
            </p>
            <p className="text-gray-400 text-sm mt-2">
              You'll see your updates here
            </p>
          </div>
        ) : (
          <div className="p-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-xl p-4 mb-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.is_read ? "border-l-4 border-blue-600" : ""
                }`}
                style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}
              >
                <div className="flex">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
                    style={{ backgroundColor: `${notification.icon_color}20` }}
                  >
                    {React.createElement(getIcon(notification.icon), {
                      size: 24,
                      style: { color: notification.icon_color },
                    })}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4
                        className={`font-semibold text-base truncate mr-2 ${
                          !notification.is_read
                            ? "text-black/90"
                            : "text-black/70"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <div className="flex items-center flex-shrink-0">
                        <span className="text-xs text-gray-400 mr-2">
                          {formatTime(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm leading-5 mb-2">
                      {notification.description}
                    </p>

                    {/* Attendance confirmation - prevent click propagation */}
                    {notification.type === "attendance_confirmation" && (
                      <div
                        className="flex gap-2 mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {notification.is_read === 0 &&
                        notification.traveler_attendance === "Waiting" ? (
                          <>
                            {notification.title ===
                              "Confirm Traveler Attendance" && (
                              <>
                                <button
                                  className="font-medium text-sm px-12 py-2 bg-[#3A81F3] text-white/90 rounded-lg hover:bg-[#3A81F3]/75"
                                  onClick={() =>
                                    handleAttendanceResponse(
                                      notification.booking_id,
                                      notification.id,
                                      "yes"
                                    )
                                  }
                                >
                                  Yes
                                </button>
                                <button
                                  className="font-medium text-sm px-12 py-2 bg-gray-100 text-black/80 rounded-lg hover:bg-gray-200"
                                  onClick={() =>
                                    handleAttendanceResponse(
                                      notification.booking_id,
                                      notification.id,
                                      "waiting"
                                    )
                                  }
                                >
                                  Still Waiting
                                </button>
                              </>
                            )}

                            {notification.title ===
                              "Still waiting for traveler?" && (
                              <>
                                <button
                                  className="font-medium text-sm px-12 py-2 bg-[#3A81F3] text-white/90 rounded-lg hover:bg-[#3A81F3]/75"
                                  onClick={() =>
                                    handleAttendanceResponse(
                                      notification.booking_id,
                                      notification.id,
                                      "yes"
                                    )
                                  }
                                >
                                  Yes
                                </button>
                                <button
                                  className="font-medium text-sm px-12 py-2 bg-gray-100 text-black/80 rounded-lg hover:bg-gray-200"
                                  onClick={() =>
                                    handleAttendanceResponse(
                                      notification.booking_id,
                                      notification.id,
                                      "no"
                                    )
                                  }
                                >
                                  No
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <p className="text-sm font-medium text-gray-600">
                            {notification.traveler_attendance === "Present" &&
                              "Traveler present"}
                            {notification.traveler_attendance === "Waiting" &&
                              "Still waiting for response"}
                            {notification.traveler_attendance === "Absent" &&
                              "Traveler absent"}
                            {notification.traveler_attendance === "Pending" &&
                              "Pending response"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
