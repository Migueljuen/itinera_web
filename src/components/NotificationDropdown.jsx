import React from "react";
import {
  Calendar,
  Star,
  Activity,
  Circle,
  Menu,
  CheckCircle,
  Plane,
  MapPin,
  Rocket,
  Clock,
  Trash2,
  XCircle,
  RotateCcw,
} from "lucide-react";

const NotificationDropdown = ({ notifications, onClose, onMarkAsRead }) => {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const formatTime = (timeStr) => {
    return timeStr;
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
    };
    return iconMap[iconName] || CheckCircle;
  };

  return (
    <div className="absolute h-[48rem] right-0 mt-2  w-[32rem] bg-white rounded-2xl shadow-lg border border-gray-200 z-50 overflow-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 ">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <div className="bg-indigo-50 rounded-full px-3 py-1">
              <span className="text-blue-600 font-semibold text-sm">
                {unreadCount}
              </span>
            </div>
          )}
        </div>
        <p className="text-gray-400 text-sm">
          {unreadCount > 0
            ? `${unreadCount} new notifications`
            : "All caught up"}
        </p>
      </div>

      {/* Notifications List */}
      <div className=" overflow-y-auto">
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
                  d="M424 80H88a56.06 56.06 0 00-56 56v240a56.06 56.06 0 0056 56h336a56.06 56.06 0 0056-56V136a56.06 56.06 0 00-56-56zM424 96c13.23 0 24 10.77 24 24v16L256 272 64 136v-16c0-13.23 10.77-24 24-24z"
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
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl p-4 mb-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? "border-l-4 border-blue-600" : ""
                }`}
                style={{
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                }}
                onClick={() => onMarkAsRead && onMarkAsRead(notification.id)}
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
                            ? "text-gray-800"
                            : "text-gray-600"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <div className="flex items-center flex-shrink-0">
                        <span className="text-xs text-gray-400 mr-2">
                          {formatTime(notification.time)}
                        </span>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm leading-5 line-clamp-2">
                      {notification.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {/* {unreadCount > 0 && (
        <div className="p-4 bottom-0 bg-red-300 absolute border-t border-gray-100">
          <button
            onClick={() => onMarkAsRead && onMarkAsRead("all")}
            className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Mark all as read
          </button>
        </div>
      )} */}
    </div>
  );
};

export default NotificationDropdown;
