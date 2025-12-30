import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";

const DriverAvailability = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [driverProfile, setDriverProfile] = useState(null);
  const [availabilityDays, setAvailabilityDays] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [showAddOverrideModal, setShowAddOverrideModal] = useState(false);

  // Form state for override
  const [overrideForm, setOverrideForm] = useState({
    date: "",
    type: "Unavailable",
    reason: "",
  });

  // Fetch driver profile
  const fetchDriverProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/partner/profile/driver/${user.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setDriverProfile(response.data.profile);

      // Handle availability_days
      const availDays = response.data.profile.availability_days;
      if (typeof availDays === "string") {
        setAvailabilityDays(JSON.parse(availDays || "[]"));
      } else if (Array.isArray(availDays)) {
        setAvailabilityDays(availDays);
      } else {
        setAvailabilityDays([]);
      }
    } catch (error) {
      console.error("Error fetching driver profile:", error);
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  // Fetch availability overrides
  const fetchOverrides = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/partner/availability/overrides/user/${user.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setOverrides(response.data.overrides || []);
    } catch (error) {
      console.error("Error fetching overrides:", error);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchDriverProfile();
      fetchOverrides();
    }
  }, [user]);

  // Toggle day availability
  const toggleDayAvailability = async (day) => {
    const updatedDays = availabilityDays.includes(day)
      ? availabilityDays.filter((d) => d !== day)
      : [...availabilityDays, day];

    try {
      await axios.put(
        `${API_URL}/partner/profile/driver/${driverProfile.driver_id}/availability`,
        {
          availability_days: JSON.stringify(updatedDays),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAvailabilityDays(updatedDays);
      toast.success(
        `${day} ${updatedDays.includes(day) ? "enabled" : "disabled"}`
      );
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability");
    }
  };

  // Add override
  const handleAddOverride = async (e) => {
    e.preventDefault();

    if (!overrideForm.date) {
      toast.error("Please select a date");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/partner/availability/overrides`,
        {
          entity_type: "user",
          entity_id: user.user_id,
          date: overrideForm.date,
          type: overrideForm.type,
          reason: overrideForm.reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Override added successfully");
      setShowAddOverrideModal(false);
      setOverrideForm({ date: "", type: "Unavailable", reason: "" });
      fetchOverrides();
    } catch (error) {
      console.error("Error adding override:", error);
      toast.error("Failed to add override");
    }
  };

  // Delete override
  const handleDeleteOverride = async (overrideId) => {
    try {
      await axios.delete(
        `${API_URL}/partner/availability/overrides/${overrideId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Override removed");
      fetchOverrides();
    } catch (error) {
      console.error("Error deleting override:", error);
      toast.error("Failed to delete override");
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const startOfMonth = selectedMonth.startOf("month");
    const endOfMonth = selectedMonth.endOf("month");
    const startDate = startOfMonth.startOf("week");
    const endDate = endOfMonth.endOf("week");

    const days = [];
    let current = startDate;

    while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
      days.push(current);
      current = current.add(1, "day");
    }

    return days;
  };

  // Check if day is available
  const isDayAvailable = (date) => {
    const dayName = date.format("dddd");
    const dateString = date.format("YYYY-MM-DD");

    // Check for overrides first
    const override = overrides.find((o) => {
      const overrideDate = dayjs(o.date).format("YYYY-MM-DD");
      return overrideDate === dateString;
    });

    if (override) {
      return override.type === "Available";
    }

    // Check regular availability
    return availabilityDays.includes(dayName);
  };

  // Get override for date
  const getOverrideForDate = (date) => {
    const dateString = date.format("YYYY-MM-DD");
    return overrides.find((o) => {
      const overrideDate = dayjs(o.date).format("YYYY-MM-DD");
      return overrideDate === dateString;
    });
  };

  const calendarDays = generateCalendarDays();
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-black/90">
              Availability Management
            </h1>
            <p className="text-black/60 mt-1">
              Manage your available days and special dates
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading availability...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Weekly Availability */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-300 p-6">
                <div className="flex items-center gap-4 border-b-2 pb-4 border-gray-100">
                  <div className="p-2 border border-gray-300 rounded-lg">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-black/90 text-lg flex items-center">
                      Set Your Availability
                    </h3>
                    <p className="text-sm text-black/60">
                      Select the days you're generally available
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mt-8">
                  {daysOfWeek.map((day) => {
                    const isActive = availabilityDays.includes(day);
                    return (
                      <div
                        key={day}
                        className="flex items-center gap-4 px-4 py-3"
                      >
                        {/* Toggle */}
                        <button
                          onClick={() => toggleDayAvailability(day)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                            isActive ? "bg-black/90" : "bg-black/30"
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                              isActive ? "translate-x-5.5" : "translate-x-0.5"
                            }`}
                          />
                        </button>

                        <span
                          className={`font-medium ${
                            isActive ? "text-black/90" : "text-black/30"
                          }`}
                        >
                          {day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Overrides List */}
              <div className="bg-white rounded-lg border border-gray-300 p-6 mt-6">
                <div className="flex items-center justify-between mb-4 border-b-2 pb-4 border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-2 border border-gray-300 rounded-lg">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-black/90 text-lg flex items-center">
                        Set specific dates as unavailable
                      </h3>
                      <p className="text-sm text-black/60">
                        Choose dates when you won't be available.
                      </p>
                    </div>
                  </div>
                  <div className="pb-4">
                    <button
                      onClick={() => setShowAddOverrideModal(true)}
                      className="p-2"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {overrides.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No special dates set
                    </p>
                  ) : (
                    overrides
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .map((override) => (
                        <div
                          key={override.override_id}
                          className={`p-3 rounded-lg border ${
                            override.type === "Available"
                              ? "bg-green-50 border-green-200"
                              : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {dayjs(override.date).format("MMM D, YYYY")}
                              </p>
                              <p
                                className={`text-xs ${
                                  override.type === "Available"
                                    ? "text-green-700"
                                    : "text-blue-700"
                                }`}
                              >
                                {override.type}
                              </p>
                              {override.reason && (
                                <p className="text-xs text-black/60 mt-1">
                                  {override.reason}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteOverride(override.override_id)
                              }
                              className="text-black/90"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Calendar View */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-300 p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-xl">
                    {selectedMonth.format("MMMM YYYY")}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setSelectedMonth(selectedMonth.subtract(1, "month"))
                      }
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setSelectedMonth(dayjs())}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Today
                    </button>
                    <button
                      onClick={() =>
                        setSelectedMonth(selectedMonth.add(1, "month"))
                      }
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Day Headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center font-medium text-sm text-black/60 py-2"
                      >
                        {day}
                      </div>
                    )
                  )}

                  {/* Calendar Days */}
                  {calendarDays.map((date, index) => {
                    const isCurrentMonth =
                      date.month() === selectedMonth.month();
                    const isToday = date.isSame(dayjs(), "day");
                    const isAvailable = isDayAvailable(date);
                    const override = getOverrideForDate(date);
                    const isPast = date.isBefore(dayjs(), "day");

                    return (
                      <div
                        key={index}
                        className={`aspect-square p-2 rounded-lg border relative ${
                          !isCurrentMonth
                            ? "bg-gray-50 text-gray-400"
                            : isAvailable
                            ? "bg-blue-100 border-blue-400"
                            : "bg-gray-50 border-gray-200"
                        } ${isToday ? "ring ring-blue-300" : ""} ${
                          isPast ? "opacity-50" : ""
                        }`}
                      >
                        <div className="text-sm font-medium text-center">
                          {date.format("D")}
                        </div>
                        {override && isCurrentMonth && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                override.type === "Available"
                                  ? "bg-green-600"
                                  : "bg-red-600"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border-2 border-blue-200 rounded"></div>
                    <span className="text-sm text-black/60">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded"></div>
                    <span className="text-sm text-black/60">Unavailable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 ring-2 ring-blue-400 rounded"></div>
                    <span className="text-sm text-black/60">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                    <span className="text-sm text-black/60">Override</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddOverrideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddOverrideModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-black/90">
                    Add Unavailable Date
                  </h3>
                  <p className="text-sm text-black/60 mt-1">
                    Block a specific date when you won't be available for
                    bookings.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddOverrideModal(false)}
                  className="text-gray-400 hover:text-black/60"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddOverride} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black/90 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={overrideForm.date}
                    onChange={(e) =>
                      setOverrideForm({
                        ...overrideForm,
                        date: e.target.value,
                        type: "Unavailable",
                      })
                    }
                    min={dayjs().format("YYYY-MM-DD")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black/90 mb-1">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={overrideForm.reason}
                    onChange={(e) =>
                      setOverrideForm({
                        ...overrideForm,
                        reason: e.target.value,
                      })
                    }
                    placeholder="e.g., Vacation, Personal commitment"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddOverrideModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#3A81F3] text-white rounded-lg hover:bg-[#3A81F3]/80"
                  >
                    Add Unavailable Date
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DriverAvailability;
