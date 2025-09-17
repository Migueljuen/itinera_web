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
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import toast, { Toaster } from "react-hot-toast";

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

  const ITEMS_PER_PAGE = 10;

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

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.traveler_first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.traveler_last_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.traveler_email?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.booking_id?.toString().includes(searchText.toLowerCase());

    const matchesTab =
      selectedTab === "All" ||
      booking.status.toLowerCase() === selectedTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-[#EAFFE7] text-[#27661E]";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case "paid (offline)":
        return "bg-[#EAFFE7] text-[#27661E]";
      case "unpaid":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Function to format date and time
  const formatDateTime = (date, startTime, endTime) => {
    const bookingDate = new Date(date);
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `${formattedDate} • ${startTime}-${endTime}`;
  };

  // Function to update booking status
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setUpdatingStatus(true);

      const response = await axios.patch(
        `${API_URL}/booking/${bookingId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.booking_id === bookingId
              ? { ...booking, status: newStatus }
              : booking
          )
        );

        toast.success(`Booking status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating booking status:", error);

      if (error.response?.status === 500) {
        await fetchBookings();
      }

      toast.error("Failed to update booking status. Please try again.");
    } finally {
      setUpdatingStatus(false);
      setOpenDropdownId(null);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const getTabCounts = () => {
    const counts = {
      All: bookings.length,
      Confirmed: bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length,
      Cancelled: bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length,
    };
    return counts;
  };

  const tabCounts = getTabCounts();

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
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
                <div className="flex justify-between gap-4">
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
                  {/* Tab Navigation */}
                  <div className="flex gap-1  bg-gray-100 p-1 rounded-lg w-fit">
                    {["All", "Confirmed", "Cancelled"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === tab
                          ? "bg-white text-black/80 shadow-sm"
                          : "text-black/60 hover:text-black/70"
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* Table Header Row */}
              <div className="bg-[#f8f8f8] px-4 rounded-lg py-4 grid grid-cols-[100px_1fr_200px_140px_120px_120px_56px] gap-6 items-center text-sm font-base text-black/90">
                <div className="justify-self-start">
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="justify-self-start">Booking ID</div>
                <div className="justify-self-start">Traveler</div>
                <div className="justify-self-center">Date & Time</div>
                <div className="justify-self-center">Status</div>
                <div className="justify-self-center">Payment</div>
                <div className="justify-self-end">Actions</div>
              </div>
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
                paginatedBookings.map((booking) => (
                  <div key={booking.booking_id} className="py-4 hover:bg-gray-50">
                    <div className="px-4 grid grid-cols-[100px_1fr_200px_140px_120px_120px_56px] gap-6 items-center">
                      {/* Checkbox */}
                      <div className="justify-self-start">
                        <input type="checkbox" className="rounded" />
                      </div>

                      {/* Booking ID */}
                      <div className="justify-self-start">
                        <span className="font-mono text-sm text-gray-900">
                          #{booking.booking_id}
                        </span>
                      </div>

                      {/* Traveler Info */}
                      <div className="justify-self-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={16} className="text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-black/80">
                              {booking.traveler_first_name} {booking.traveler_last_name}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                              <Mail size={12} className="text-gray-400" />
                              <span className="text-xs text-black/60">
                                {booking.traveler_email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="text-sm text-gray-600 justify-self-center">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" />
                          <span className="text-xs">
                            {formatDateTime(booking.created_at, booking.start_time, booking.end_time)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.day_of_week}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="justify-self-center">
                        <div className="flex flex-col gap-2 items-center relative">
                          <button
                            onClick={() => toggleDropdown(booking.booking_id)}
                            className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md text-sm font-normal capitalize ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status} <ChevronDown size={16} />
                          </button>

                          {/* Dropdown */}
                          {openDropdownId === booking.booking_id && (
                            <div className="absolute top-full mt-1 w-32 bg-white shadow-lg rounded-md z-50 border">
                              {["Confirmed", "Cancelled"].map((status) => (
                                <button
                                  key={status}
                                  onClick={() =>
                                    updateBookingStatus(
                                      booking.booking_id,
                                      status
                                    )
                                  }
                                  disabled={updatingStatus}
                                  className="block w-full text-left p-3 text-sm text-black/80 hover:bg-gray-100 capitalize disabled:opacity-50"
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="justify-self-center">
                        <span className={`px-2 py-1 rounded-md text-sm font-normal ${getPaymentStatusColor(
                          booking.payment_status
                        )}`}>
                          {booking.payment_status === 'Paid (offline)' ? 'Paid' : booking.payment_status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="justify-self-end">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-
                {Math.min(
                  startIndex + ITEMS_PER_PAGE,
                  filteredBookings.length
                )}{" "}
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