import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  Trash2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Download,
  MoreHorizontal,
  ImageIcon,
  User,
  Mail,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import { div } from "framer-motion/client";

const BookingManagement = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState(null);

  const ITEMS_PER_PAGE = 10;

  //convert booking date
  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM D");
  };

  const isOngoing = (booking) => {
    const now = dayjs();
    const bookingDate = dayjs(booking.booking_date);

    if (!booking.start_time || !booking.end_time) return false;

    const start = dayjs(`${booking.booking_date}T${booking.start_time}`);
    const end = dayjs(`${booking.booking_date}T${booking.end_time}`);

    return now.isAfter(start) && now.isBefore(end);
  };

  // Function to fetch bookings
  const fetchBookings = async () => {
    if (!user?.user_id) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/booking/creator/${user.user_id}`,
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

  // Initial data loading
  useEffect(() => {
    if (user?.user_id) {
      fetchBookings();
    }
  }, [user]);

  // Reset to first page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, searchText]);

  const sortedBookings = [...bookings].sort((a, b) => {
    const today = dayjs();
    const dateA = dayjs(a.booking_date);
    const dateB = dayjs(b.booking_date);

    // Difference in days from today
    const diffA = Math.abs(dateA.diff(today, "day"));
    const diffB = Math.abs(dateB.diff(today, "day"));

    // Sort by which date is closer to today
    if (diffA === diffB) {
      return dateA.isBefore(dateB) ? -1 : 1; // if equal distance, earlier date first
    }
    return diffA - diffB;
  });

  const filteredBookings = sortedBookings.filter((booking) => {
    const matchesSearch =
      booking.traveler_first_name
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      booking.traveler_last_name
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      booking.traveler_email
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      booking.booking_id?.toString().includes(searchText.toLowerCase());

    const matchesTab =
      selectedTab === "All" ||
      (selectedTab === "Ongoing" &&
        (booking.status?.toLowerCase() === "ongoing" || isOngoing(booking))) ||
      (selectedTab !== "Ongoing" &&
        booking.status?.toLowerCase() === selectedTab.toLowerCase());

    return matchesSearch && matchesTab;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // Function to format date and time
  const formatDateTime = (createdAt, startTime, endTime) => {
    // Convert times to Date objects if they aren't already
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    const startFormatted = start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const endFormatted = end.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${startFormatted} - ${endFormatted}`;
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const getTabCounts = () => ({
    All: bookings.length,
    Confirmed: bookings.filter((b) => b.status?.toLowerCase() === "confirmed")
      .length,
    Ongoing: bookings.filter(
      (b) => isOngoing(b) || b.status?.toLowerCase() === "ongoing"
    ).length,
    Completed: bookings.filter((b) => b.status?.toLowerCase() === "completed")
      .length,
    Cancelled: bookings.filter((b) => b.status?.toLowerCase() === "cancelled")
      .length,
  });

  const tabCounts = getTabCounts();

  return (
    <>

      <div className="min-h-screen">
        <div className="">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Booking Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your experience bookings
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-lg">
            {/* Table Header */}
            <div className="py-4">
              {/* Search and Filters */}
              <div className="bg-white rounded-lg mb-6">
                <div className="flex justify-between">
                  {/* Tab Navigation */}
                  <div className="flex   bg-gray-50  rounded-lg w-fit p-2">
                    {[
                      "All",
                      "Confirmed",
                      "Ongoing",
                      "Completed",
                      "Cancelled",
                    ].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-8 font-medium transition-colors py-2 rounded-lg ${selectedTab === tab
                          ? "bg-white text-black/80 shadow-sm/10"
                          : "text-black/50 hover:text-black/70"
                          }`}
                      >
                        {tab === "Confirmed" ? "Upcoming" : tab}
                      </button>
                    ))}
                  </div>
                  {/* Search */}
                  <div className="relative h-fit">
                    <Search
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Table Header Row */}
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading bookings...</p>
                </div>
              ) : paginatedBookings.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No bookings found</p>
                </div>
              ) : (
                paginatedBookings.map((booking) => {
                  const isExpanded = expandedBookingId === booking.booking_id;

                  return (
                    <div
                      key={booking.booking_id}
                      className="py-6 mb-4 border rounded-xl border-gray-300 bg-white  transition"
                    >
                      {/* Top Row */}
                      <div className="flex items-center justify-between px-2">
                        <div className="grid grid-cols-[120px_240px_300px] gap-4">
                          {/* DAY NUMBER AND DAY OF WEEK */}
                          <div
                            className={`text-center px-4 border-r border-gray-300 ${dayjs(booking.booking_date).isSame(dayjs(), "day")
                              ? "text-[#3A81F3]"
                              : "text-black/70"
                              }`}
                          >
                            <p className="text-xl">
                              {booking.day_of_week.slice(0, 3)}
                            </p>
                            <p className="text-4xl font-semibold">
                              {dayjs(booking.booking_date).format("D")}
                            </p>
                          </div>

                          {/* Date & Time */}
                          <div className="text-sm font-medium text-black/60 px-4 flex flex-col justify-around">
                            <div className="flex items-center gap-3">
                              <Clock size={16} className="text-black/60" />
                              <span>
                                {formatDateTime(
                                  booking.created_at,
                                  booking.start_time,
                                  booking.end_time
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Calendar size={16} className="text-black/60" />
                              <span>{formatDate(booking.booking_date)}</span>
                            </div>
                          </div>

                          {/* Activity booked and user */}
                          <div className="flex flex-col justify-around px-4">
                            <span className="font-medium text-sm text-black/70">
                              {booking.experience_title}
                            </span>
                            {booking?.traveler_profile_pic ? (
                              <div className="flex">
                                <img
                                  src={`${API_URL}/${booking.traveler_profile_pic}`}
                                  alt="Profile"
                                  className="w-6 h-6 border-2 z-10 border-white rounded-full object-cover"
                                />
                              </div>
                            ) : (
                              <User size={16} className="text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Expand Button */}
                        <button
                          onClick={() =>
                            setExpandedBookingId(
                              isExpanded ? null : booking.booking_id
                            )
                          }
                          className="flex items-center gap-2 px-4 rounded-md text-sm font-normal text-black/80 hover:text-black/60"
                        >
                          {isExpanded ? "Less" : "More"}{" "}
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                              }`}
                          />
                        </button>
                      </div>

                      {/* Expanded Content (Sliding Section) */}
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded
                          ? "max-h-[500px] opacity-100 mt-4"
                          : "max-h-0 opacity-0"
                          }`}
                      >
                        <div className="border-t border-gray-200 pt-4 px-8 text-sm text-black/70 space-y-4 flex justify-between">
                          {/* Traveler Details */}
                          <div>
                            <h4 className="font-semibold mb-2">
                              Traveler Details
                            </h4>
                            <p className="text-black/50">
                              Full Name: {booking.traveler_first_name}{" "}
                              {booking.traveler_last_name}
                            </p>
                            <p className="text-black/50">
                              Mobile Number: {booking.traveler_mobile || "N/A"}
                            </p>
                            <p className="text-black/50">
                              Email: {booking.traveler_email}
                            </p>
                          </div>

                          {/* Booking Details */}
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-4">
                              Booking Details
                              {(() => {
                                // Map statuses to display name + colors
                                const statusMap = {
                                  Confirmed: {
                                    label: "Upcoming",
                                    color: "text-purple-950/60 bg-purple-200",
                                    dot: "bg-purple-950/60",
                                  },

                                  Ongoing: {
                                    label: "Ongoing",
                                    color: "text-yellow-800/60 bg-yellow-100",
                                    dot: "bg-yellow-800/60",
                                  },
                                  Completed: {
                                    label: "Completed",
                                    color: "text-green-950/60 bg-green-100/80",
                                    dot: "bg-green-950/60",
                                  },
                                  Cancelled: {
                                    label: "Cancelled",
                                    color: "text-gray-700/60 bg-gray-100",
                                    dot: "bg-gray-700/60",
                                  },
                                };

                                const status = statusMap[booking.status] || {
                                  label: booking.status,
                                  color: "text-gray-600 bg-gray-100",
                                  dot: "bg-gray-600",
                                };

                                return (
                                  <p
                                    className={`text-xs w-fit px-3 py-1 flex items-center rounded-xl gap-2 ${status.color}`}
                                  >
                                    <div
                                      className={`size-2 rounded-full ${status.dot}`}
                                    ></div>
                                    {status.label}
                                  </p>
                                );
                              })()}
                            </h4>
                            <p className="text-black/50">
                              Booking ID: 0000{booking.booking_id}
                            </p>
                          </div>

                          {/* Experience Details */}
                          <div>
                            <h4 className="font-semibold mb-2">
                              Activity booked
                            </h4>
                            <p className="text-black/50">
                              {booking.experience_title},
                            </p>
                            <p className="text-black/50">
                              {booking.destination_name}
                            </p>
                          </div>

                          {/* Actions */}
                          <div>
                            <button className="px-6 py-2 bg-[#3A81F3] text-white/90 text-base rounded-lg hover:bg-[#3A81F3]/75 ">
                              Contact Traveler
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredBookings.length)}{" "}
                of {filteredBookings.length} bookings
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-lg ${currentPage === page
                        ? "bg-[#274b46] text-white/90 cursor-pointer hover:bg-[#376a63]"
                        : "border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingManagement;
