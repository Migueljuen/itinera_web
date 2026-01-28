import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  Trash2,
  Calendar,
  CheckCircle,
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
  DollarSign,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import BookingFilters from "../../components/BookingFilters";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const BookingManagement = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [filters, setFilters] = useState({});

  const [cancelReasonById, setCancelReasonById] = useState({});
  const [cancelSubmittingId, setCancelSubmittingId] = useState(null);
  const [verifyingPaymentId, setVerifyingPaymentId] = useState(null);

  const bookingRefs = useRef({});

  const ITEMS_PER_PAGE = 10;

  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM D");
  };

  const isOngoing = (booking) => {
    const now = dayjs();
    if (!booking.start_time || !booking.end_time) return false;

    const start = dayjs(`${booking.booking_date}T${booking.start_time}`);
    const end = dayjs(`${booking.booking_date}T${booking.end_time}`);
    return now.isAfter(start) && now.isBefore(end);
  };

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

  useEffect(() => {
    if (user?.user_id) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    const selectedId = searchParams.get("selectedId");

    if (selectedId && bookings.length > 0) {
      const bookingId = parseInt(selectedId);
      const booking = bookings.find((b) => b.booking_id === bookingId);

      if (booking) {
        setExpandedBookingId(bookingId);

        const status = booking.status;
        if (isOngoing(booking) || status?.toLowerCase() === "ongoing") {
          setSelectedTab("Ongoing");
        } else if (status?.toLowerCase() === "confirmed") {
          setSelectedTab("Confirmed");
        } else if (status?.toLowerCase() === "completed") {
          setSelectedTab("Completed");
        } else if (status?.toLowerCase() === "cancelled") {
          setSelectedTab("Cancelled");
        } else {
          setSelectedTab("All");
        }

        setTimeout(() => {
          bookingRefs.current[bookingId]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 300);
      }
    }
  }, [searchParams, bookings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, searchText]);

  const sortedBookings = [...bookings].sort((a, b) => {
    const today = dayjs();
    const dateA = dayjs(a.booking_date);
    const dateB = dayjs(b.booking_date);

    const diffA = Math.abs(dateA.diff(today, "day"));
    const diffB = Math.abs(dateB.diff(today, "day"));

    if (diffA === diffB) {
      return dateA.isBefore(dateB) ? -1 : 1;
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
      booking.traveler_email?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.booking_id?.toString().includes(searchText.toLowerCase());

    const matchesTab =
      selectedTab === "All" ||
      (selectedTab === "Ongoing" &&
        (booking.status?.toLowerCase() === "ongoing" || isOngoing(booking))) ||
      (selectedTab !== "Ongoing" &&
        booking.status?.toLowerCase() === selectedTab.toLowerCase());

    let matchesDate = true;
    if (filters.dateFilter && filters.dateFilter !== "all") {
      const bookingDate = dayjs(booking.booking_date);
      const today = dayjs();

      if (filters.dateFilter === "today") {
        matchesDate = bookingDate.isSame(today, "day");
      } else if (filters.dateFilter === "week") {
        matchesDate = bookingDate.isSame(today, "week");
      } else if (filters.dateFilter === "month") {
        matchesDate = bookingDate.isSame(today, "month");
      } else if (filters.dateFilter === "custom") {
        if (filters.customDateRange?.start && filters.customDateRange?.end) {
          const startDate = dayjs(filters.customDateRange.start);
          const endDate = dayjs(filters.customDateRange.end);

          matchesDate =
            (bookingDate.isAfter(startDate) ||
              bookingDate.isSame(startDate, "day")) &&
            (bookingDate.isBefore(endDate) || bookingDate.isSame(endDate, "day"));
        }
      }
    }

    const matchesExperience =
      !filters.selectedExperience ||
      filters.selectedExperience === "all" ||
      booking.experience_title === filters.selectedExperience;

    const matchesStatus =
      !filters.statusFilter ||
      filters.statusFilter === "all" ||
      booking.status?.toLowerCase() === filters.statusFilter.toLowerCase();

    return matchesSearch && matchesTab && matchesDate && matchesExperience && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const formatDateTime = (createdAt, startTime, endTime) => {
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

  const canRequestCancel = (booking) => {
    const s = (booking.status || "").toLowerCase();
    return s === "pending" || s === "confirmed";
  };

  const isCancelRequested = (booking) => {
    return (booking.status || "").toLowerCase() === "cancellationrequested";
  };

  const submitPartnerCancellation = async (booking) => {
    const bookingId = booking.booking_id;
    const reason = (cancelReasonById[bookingId] || "").trim();

    if (!reason) {
      toast.error("Please provide a cancellation reason.");
      return;
    }

    const ok = window.confirm(
      "Submit cancellation request?\n\nThis will be reviewed by admin."
    );
    if (!ok) return;

    try {
      setCancelSubmittingId(bookingId);

      const res = await axios.post(
        `${API_URL}/cancellation/partner/bookings/${bookingId}/cancel`,
        {
          cancellation_reason: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to request cancellation");
      }

      toast.success("Cancellation requested. Pending admin review.");

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId ? { ...b, status: "CancellationRequested" } : b
        )
      );

      setCancelReasonById((prev) => ({ ...prev, [bookingId]: "" }));
    } catch (err) {
      console.error("submitPartnerCancellation error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to request cancellation";
      toast.error(msg);
    } finally {
      setCancelSubmittingId(null);
    }
  };

  // Approve payment
  const handleApprovePayment = async (booking) => {
    const bookingId = booking.booking_id;

    const confirmed = window.confirm(
      `Approve payment of ₱${parseFloat(booking.activity_price || 0).toFixed(2)} for this booking?\n\nThis will mark the payment as verified.`
    );

    if (!confirmed) return;

    try {
      setVerifyingPaymentId(bookingId);

      const res = await axios.post(
        `${API_URL}/payment/booking/${bookingId}/payment/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to verify payment");
      }

      toast.success("Payment approved successfully");

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId ? { ...b, payment_status: "Paid" } : b
        )
      );
    } catch (err) {
      console.error("handleApprovePayment error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to approve payment";
      toast.error(msg);
    } finally {
      setVerifyingPaymentId(null);
    }
  };

  // Decline/Reject payment
  const handleDeclinePayment = async (booking) => {
    const bookingId = booking.booking_id;

    const reason = window.prompt(
      "Please provide a reason for rejecting this payment:\n\n(e.g., Invalid receipt, Amount mismatch, Unreadable image)"
    );

    if (reason === null) return; // User cancelled

    if (!reason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    try {
      setVerifyingPaymentId(bookingId);

      const res = await axios.post(
        `${API_URL}/payment/booking/${bookingId}/payment/reject`,
        { reason: reason.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to reject payment");
      }

      toast.success("Payment rejected. Traveler has been notified.");

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId ? { ...b, payment_status: "Unpaid" } : b
        )
      );
    } catch (err) {
      console.error("handleDeclinePayment error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reject payment";
      toast.error(msg);
    } finally {
      setVerifyingPaymentId(null);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const getTabCounts = () => ({
    All: bookings.length,
    Confirmed: bookings.filter((b) => b.status?.toLowerCase() === "confirmed").length,
    Ongoing: bookings.filter((b) => isOngoing(b) || b.status?.toLowerCase() === "ongoing").length,
    Completed: bookings.filter((b) => b.status?.toLowerCase() === "completed").length,
    Cancelled: bookings.filter((b) => b.status?.toLowerCase() === "cancelled").length,
  });

  const tabCounts = getTabCounts();

  // Helper to check if payment actions should be shown
  const canShowPaymentActions = (booking) => {
    const isCancelled =
      booking.status?.toLowerCase() === "cancelled" ||
      booking.status?.toLowerCase() === "cancellationrequested";
    const isPending = booking.payment_status?.toLowerCase() === "pending";
    return !isCancelled && isPending;
  };

  // Helper to check if booking has pending payment that needs attention
  const hasPendingPayment = (booking) => {
    const requiresPayment =
      booking.reservation_requires_payment === 1 ||
      booking.reservation_requires_payment === true;
    const isPending = booking.payment_status?.toLowerCase() === "pending";
    const isNotCancelled =
      booking.status?.toLowerCase() !== "cancelled" &&
      booking.status?.toLowerCase() !== "cancellationrequested";
    return requiresPayment && isPending && isNotCancelled;
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen pb-48">
        <div className="">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Booking Management
              </h1>
              <p className="text-gray-600 mt-1">Manage your experience bookings</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg">
            <div className="py-4">
              <BookingFilters
                bookings={bookings}
                searchText={searchText}
                setSearchText={setSearchText}
                onFilterChange={setFilters}
              />
            </div>

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

                  // Payment should show ONLY if this booking's experience requires payment
                  const requiresPayment =
                    booking.reservation_requires_payment === 1 ||
                    booking.reservation_requires_payment === true;

                  const isVerifying = verifyingPaymentId === booking.booking_id;
                  const isPendingPayment = hasPendingPayment(booking);

                  return (
                    <div
                      key={booking.booking_id}
                      ref={(el) => (bookingRefs.current[booking.booking_id] = el)}
                      className={`py-6 mb-4 border rounded-xl bg-white transition ${isExpanded
                        ? "ring-2 ring-blue-400 border-blue-400"
                        : isPendingPayment
                          ? "border-amber-400 border-2"
                          : "border-gray-300"
                        }`}
                    >
                      <div className="flex items-center justify-between px-2">
                        <div className="grid grid-cols-[120px_240px_300px] gap-4">
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

                        <div className="flex items-center gap-3">
                          {/* Pending payment indicator badge */}
                          {isPendingPayment && (
                            <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                              Payment Pending
                            </span>
                          )}

                          <button
                            onClick={() =>
                              setExpandedBookingId(isExpanded ? null : booking.booking_id)
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
                      </div>

                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded
                          ? "max-h-[1300px] opacity-100 mt-4"
                          : "max-h-0 opacity-0"
                          }`}
                      >
                        <div className="border-t border-gray-200 py-12 px-12">
                          <div className="grid grid-cols-2 gap-8">
                            <div className="flex flex-row justify-between ">
                              <div>
                                <h4 className="text-base font-medium text-black/80 mb-4 flex items-center gap-2">
                                  Traveler Details
                                </h4>
                                <div className="space-y-3 text-sm">
                                  <p className="text-black/60">
                                    <span className="font-medium text-black/80">Full Name:</span> &nbsp;{booking.traveler_first_name}{" "}
                                    {booking.traveler_last_name}
                                  </p>
                                  <p className="text-black/60">
                                    <span className="font-medium text-black/80">Mobile Number:</span>{" "}&nbsp;
                                    {booking.traveler_mobile_number || "N/A"}
                                  </p>
                                  <p className="text-black/60">
                                    <span className="font-medium text-black/80">Email:</span>{" "}&nbsp; {booking.traveler_email}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h4 className="mb-4 font-medium text-black/80 text-base flex items-center gap-4">
                                  Booking Information
                                </h4>

                                <div className="space-y-3 text-sm">
                                  <p className="text-black/60">
                                    <span className="font-medium text-black/80">Booking ID: </span>
                                    0000{booking.booking_id}
                                  </p>
                                  <p className="text-black/60">
                                    <span className="font-medium text-black/80">Guest count: </span> {booking.guest_count}
                                  </p>

                                </div>
                              </div>
                            </div>

                            <div className="space-y-6 pl-24">
                              {/* Only show this section when payment is required */}
                              {requiresPayment && (
                                <div>
                                  <h4 className="text-base mb-3">Payment Details</h4>

                                  <div className="space-y-2 text-sm">
                                    {/* Paid online = activity_price */}
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                      <span className="text-black/60">Paid Online:</span>
                                      <span className="font-medium text-black/80">
                                        ₱{parseFloat(booking.activity_price || 0).toFixed(2)}
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center py-2  rounded-lg mt-3">
                                      <span className="text-black/70 font-medium">Payment Status</span>
                                      <span className={`font-medium ${booking.payment_status?.toLowerCase() === 'paid'
                                        ? 'text-green-600'
                                        : booking.payment_status?.toLowerCase() === 'pending'
                                          ? 'text-amber-600'
                                          : 'text-black/80'
                                        }`}>
                                        {booking.payment_status || "N/A"}
                                      </span>
                                    </div>

                                    {/* Payment proof link */}
                                    <div className="mt-3">
                                      {booking.payment_proof ? (
                                        <a
                                          href={`${API_URL}/${booking.payment_proof}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-sm text-blue-600 hover:text-blue-800 "
                                        >
                                          View payment proof
                                        </a>
                                      ) : (
                                        <span className="text-sm text-black/40">No payment proof uploaded</span>
                                      )}
                                    </div>

                                    {/* Approve/Decline buttons - only show when payment is pending */}
                                    {canShowPaymentActions(booking) && (
                                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                                        <button
                                          onClick={() => handleApprovePayment(booking)}
                                          disabled={isVerifying}
                                          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                          {isVerifying ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                          ) : (
                                            <Check size={16} />
                                          )}
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => handleDeclinePayment(booking)}
                                          disabled={isVerifying}
                                          className="flex items-center gap-2 px-4 py-2 bg-white  text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                          <X size={16} />
                                          Decline
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                </div>
                              )}

                              {/* Optional: show a tiny label when it does NOT require payment */}
                              {!requiresPayment && (
                                <div className="text-sm text-black/50">

                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredBookings.length)} of{" "}
                {filteredBookings.length} bookings
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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