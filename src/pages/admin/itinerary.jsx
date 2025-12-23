import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  User,
  DollarSign,
  FileText,
  CheckCircle,
  X,
  Image as ImageIcon,
  XCircleIcon,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";

const ItineraryManagement = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");
  const [itineraries, setItineraries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedItineraryId, setExpandedItineraryId] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [selectedProofImage, setSelectedProofImage] = useState(null);

  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const itineraryRefs = useRef({});

  const ITEMS_PER_PAGE = 10;

  // Format date helper
  const formatDate = (dateString) => {
    return dayjs(dateString).format("MMM D, YYYY");
  };

  // Fetch itineraries with payment information
  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/itineraries`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setItineraries(response.data.itineraries || []);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      setItineraries([]);
      if (error.response?.status !== 404) {
        toast.error("Failed to fetch itineraries");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (user?.user_id) {
      fetchItineraries();
    }
  }, [user]);

  // Handle selected itinerary from URL parameter (from notification click)
  useEffect(() => {
    const selectedId = searchParams.get("selectedId");

    if (selectedId && itineraries.length > 0) {
      const itineraryId = parseInt(selectedId);
      const itinerary = itineraries.find((i) => i.itinerary_id === itineraryId);

      if (itinerary) {
        // Expand the itinerary
        setExpandedItineraryId(itineraryId);

        // Set the appropriate tab based on payment status
        const paymentStatus = itinerary.payment_status;
        if (paymentStatus === "Pending") {
          setSelectedTab("Pending");
        } else if (paymentStatus === "Paid") {
          setSelectedTab("Paid");
        } else if (paymentStatus === "Unpaid") {
          setSelectedTab("Unpaid");
        } else if (paymentStatus === "Partial") {
          setSelectedTab("Partial");
        } else {
          setSelectedTab("All");
        }

        // Scroll to the itinerary after a short delay
        setTimeout(() => {
          itineraryRefs.current[itineraryId]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 300);
      }
    }
  }, [searchParams, itineraries]);

  // Reset to first page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, searchText]);

  // Sort itineraries by start date (closest to today first)
  const sortedItineraries = [...itineraries].sort((a, b) => {
    const today = dayjs();
    const dateA = dayjs(a.start_date);
    const dateB = dayjs(b.start_date);

    const diffA = Math.abs(dateA.diff(today, "day"));
    const diffB = Math.abs(dateB.diff(today, "day"));

    if (diffA === diffB) {
      return dateA.isBefore(dateB) ? -1 : 1;
    }
    return diffA - diffB;
  });

  // Filter itineraries based on search and tab
  const filteredItineraries = sortedItineraries.filter((itinerary) => {
    const matchesSearch =
      itinerary.traveler_first_name
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      itinerary.traveler_last_name
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      itinerary.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      itinerary.itinerary_id?.toString().includes(searchText.toLowerCase());

    const matchesTab =
      selectedTab === "All" ||
      itinerary.payment_status?.toLowerCase() === selectedTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredItineraries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItineraries = filteredItineraries.slice(startIndex, endIndex);

  // Get tab counts
  const getTabCounts = () => ({
    All: itineraries.length,
    Pending: itineraries.filter((i) => i.payment_status === "Pending").length,
    Paid: itineraries.filter((i) => i.payment_status === "Paid").length,
    Unpaid: itineraries.filter((i) => i.payment_status === "Unpaid").length,
    Partial: itineraries.filter((i) => i.payment_status === "Partial").length,
  });

  const tabCounts = getTabCounts();

  // Handle payment approval
  const handleApprovePayment = async (itineraryId, paymentId) => {
    try {
      setProcessingPayment(itineraryId);

      await axios.put(
        `${API_URL}/admin/payment/${paymentId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Payment approved successfully!");
      fetchItineraries(); // Refresh the list
    } catch (error) {
      console.error("Error approving payment:", error);
      toast.error("Failed to approve payment");
    } finally {
      setProcessingPayment(null);
    }
  };

  // Handle payment decline - open modal
  const handleDeclineClick = (itineraryId, paymentId) => {
    setSelectedPayment({ itineraryId, paymentId });
    setShowDeclineModal(true);
    setDeclineReason('');
  };

  // Handle payment decline - submit
  const handleDeclinePayment = async () => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }

    try {
      setProcessingPayment(selectedPayment.itineraryId);

      await axios.put(
        `${API_URL}/admin/payment/${selectedPayment.paymentId}/decline`,
        { reason: declineReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Payment declined successfully!");
      setShowDeclineModal(false);
      setSelectedPayment(null);
      setDeclineReason('');
      fetchItineraries(); // Refresh the list
    } catch (error) {
      console.error("Error declining payment:", error);
      toast.error("Failed to decline payment");
    } finally {
      setProcessingPayment(null);
    }
  };

  // Get earnings summary from backend (already calculated per activity)
  const getEarningsSummary = (itinerary) => {
    if (itinerary.earnings_summary) {
      return itinerary.earnings_summary;
    }

    // Fallback calculation
    const totalAmount = parseFloat(itinerary.total_amount || 0);
    const commissionRate = 0.1;
    const platformEarning = totalAmount * commissionRate;
    const creatorEarning = totalAmount - platformEarning;

    return {
      total_amount: totalAmount,
      platform_commission: platformEarning,
      creators_payout: creatorEarning,
      commission_rate: commissionRate * 100,
    };
  };

  // Get payment proofs for an itinerary
  const getPaymentProofs = (itinerary) => {
    const proofs = [];

    if (itinerary.proof_image) {
      proofs.push({
        label: "Full Payment",
        url: `${API_URL}/${itinerary.proof_image}`,
      });
    }

    if (itinerary.down_payment_proof) {
      proofs.push({
        label: "Down Payment",
        url: `${API_URL}/${itinerary.down_payment_proof}`,
      });
    }

    if (itinerary.remaining_payment_proof) {
      proofs.push({
        label: "Remaining Payment",
        url: `${API_URL}/${itinerary.remaining_payment_proof}`,
      });
    }

    return proofs;
  };

  // Payment Proof Modal Component
  const PaymentProofModal = ({ proofs, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const handleNext = () => {
      setCurrentIndex((prev) => (prev + 1) % proofs.length);
    };

    const handlePrev = () => {
      setCurrentIndex((prev) => (prev - 1 + proofs.length) % proofs.length);
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        onClick={onClose}
      >
        <div className="relative max-w-7xl max-h-screen p-4">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-0 right-0 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} className="text-white" />
          </button>

          {/* Image Container */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={proofs[currentIndex].url}
              alt={proofs[currentIndex].label}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>

          {/* Navigation Arrows */}
          {proofs.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen">
        <div className="">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Itinerary Management
              </h1>
              <p className="text-gray-600 mt-1">
                Review and approve itinerary payments
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Itineraries Table */}
          <div className="bg-white rounded-lg">
            {/* Table Header */}
            <div className="py-4">
              {/* Search and Filters */}
              <div className="bg-white rounded-lg mb-6">
                <div className="flex justify-between">
                  {/* Tab Navigation */}
                  <div className="flex bg-gray-50 rounded-lg w-fit p-2">
                    {["All", "Pending", "Paid", "Unpaid", "Partial"].map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() => setSelectedTab(tab)}
                          className={`px-8 font-medium transition-colors py-2 rounded-lg ${selectedTab === tab
                            ? "bg-white text-black/80 shadow-sm"
                            : "text-black/50 hover:text-black/70"
                            }`}
                        >
                          {tab}
                        </button>
                      )
                    )}
                  </div>
                  {/* Search */}
                  <div className="relative h-fit">
                    <Search
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search itineraries"
                      className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading itineraries...</p>
                </div>
              ) : paginatedItineraries.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No itineraries found</p>
                </div>
              ) : (
                paginatedItineraries.map((itinerary) => {
                  const isExpanded =
                    expandedItineraryId === itinerary.itinerary_id;
                  const earnings = getEarningsSummary(itinerary);
                  const creatorPayouts = itinerary.creator_payouts || [];
                  const paymentProofs = getPaymentProofs(itinerary);

                  return (
                    <div
                      key={itinerary.itinerary_id}
                      ref={(el) =>
                        (itineraryRefs.current[itinerary.itinerary_id] = el)
                      }
                      className={`py-8 mb-4 border rounded-xl border-gray-300 bg-white transition ${isExpanded ? "ring-2 ring-blue-400" : ""
                        }`}
                    >
                      {/* Top Row */}
                      <div className="flex items-center justify-between px-4">
                        <div className="grid grid-cols-[100px_320px_280px_180px] gap-4">
                          {/* Itinerary ID */}
                          <div className="text-center px-4 border-r border-gray-300">
                            <p className="text-xs text-gray-500">ID</p>
                            <p className="text-xl font-semibold text-black/70">
                              {String(itinerary.itinerary_id).padStart(4, "0")}
                            </p>
                          </div>

                          {/* Date Range */}
                          <div className="text-sm font-medium text-black/60 px-4 flex flex-row  justify-start gap-2 items-center">
                            <div className="flex items-center gap-2 ">
                              <span>{formatDate(itinerary.start_date)}</span>
                            </div>
                            <div>-</div>

                            <div className="flex items-center gap-2 ">
                              <span>{formatDate(itinerary.end_date)}</span>
                            </div>
                          </div>

                          {/* Itinerary Title & Traveler */}
                          <div className="flex flex-col justify-center px-4">
                            <span className="font-semibold text-sm text-black/80">
                              {itinerary.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              {itinerary.traveler_profile_pic ? (
                                <img
                                  src={`${API_URL}/${itinerary.traveler_profile_pic}`}
                                  alt="Traveler"
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                              ) : (
                                <User size={16} className="text-gray-400" />
                              )}
                              <span className="text-xs text-gray-600">
                                {itinerary.traveler_first_name}{" "}
                                {itinerary.traveler_last_name}
                              </span>
                            </div>
                          </div>

                          {/* Payment Status & Amount */}
                          <div className="flex flex-col justify-center px-4">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const statusMap = {
                                  Pending: {
                                    label: "Pending",
                                    color: "text-yellow-800/60 bg-yellow-100",
                                    dot: "bg-yellow-800/60",
                                  },
                                  Paid: {
                                    label: "Paid",
                                    color: "text-green-950/60 bg-green-100/80",
                                    dot: "bg-green-950/60",
                                  },
                                  Unpaid: {
                                    label: "Unpaid",
                                    color: "text-red-800/60 bg-red-100",
                                    dot: "bg-red-800/60",
                                  },
                                  Partial: {
                                    label: "Partial",
                                    color: "text-blue-800/60 bg-blue-100",
                                    dot: "bg-blue-800/60",
                                  },
                                };

                                const status = statusMap[
                                  itinerary.payment_status
                                ] || {
                                  label: "Not available",
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
                            </div>
                            <p className="text-lg font-semibold text-black/80 mt-1">
                              ₱{earnings.total_amount.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Expand Button */}
                        <button
                          onClick={() =>
                            setExpandedItineraryId(
                              isExpanded ? null : itinerary.itinerary_id
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

                      {/* Expanded Itinerary Content */}
                      <div
                        className={`transition-all duration-300 ease-in-out flex-1 overflow-hidden ${isExpanded
                          ? "max-h-fit opacity-100 mt-6"
                          : "max-h-0 opacity-0"
                          }`}
                      >
                        <div className="border-t border-gray-200 pt-6 px-8">
                          <div className="grid grid-cols-2 gap-8">
                            {/* Left Column - Itinerary Details */}
                            <div className="space-y-6">
                              {/* Creator Payouts Breakdown */}
                              {creatorPayouts.length > 0 && (
                                <div className="rounded-xl p-6 border border-gray-200">
                                  <div className="flex justify-between">
                                    <h4 className="font-semibold text-black/80 mb-4">
                                      Activities booked
                                    </h4>
                                    <div className="flex gap-2 items-center">
                                      {/* GA - Gross Amount */}
                                      <div className="relative group flex items-center justify-end">
                                        <span className="text-xs font-medium text-right text-black/50">
                                          GA
                                        </span>
                                        <div
                                          className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                        bg-gray-50 text-black/60 text-xs rounded px-2 py-1 opacity-0 
                        group-hover:opacity-100 transition-opacity pointer-events-none"
                                        >
                                          Gross Amount
                                        </div>
                                      </div>
                                      <div className=""> </div>
                                      {/* PC - Commission */}
                                      <div className="relative group flex items-center justify-end">
                                        <span className="w-20 text-xs text-left text-black/60">
                                          PC
                                        </span>
                                        <div
                                          className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                        bg-gray-50 text-black/60 text-xs rounded px-2 py-1 opacity-0 
                        group-hover:opacity-100 transition-opacity pointer-events-none"
                                        >
                                          Platform Commission
                                        </div>
                                      </div>

                                      {/* NP - Net Payout */}
                                      <div className="relative group flex items-center justify-end">
                                        <span className="w-20 text-right text-black/50 font-medium text-xs">
                                          NP
                                        </span>
                                        <div
                                          className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                        bg-gray-50 text-black/60 text-xs rounded px-2 py-1 opacity-0 
                        group-hover:opacity-100 transition-opacity pointer-events-none"
                                        >
                                          Net Payout
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    {creatorPayouts.map((creator) => (
                                      <div
                                        key={creator.creator_id}
                                        className="bg-white"
                                      >
                                        <div className="border-t border-gray-100 py-4 space-y-3">
                                          {creator.activities.map(
                                            (activity, idx) => (
                                              <div
                                                key={idx}
                                                className="flex justify-between text-sm"
                                              >
                                                <span className="text-black/80">
                                                  {activity.experience_title}
                                                </span>
                                                <div className="flex gap-2 items-center">
                                                  <span className="w-20 text-right text-black/80">
                                                    ₱{activity.price.toFixed(2)}
                                                  </span>
                                                  <span className="text-black/60">
                                                    -
                                                  </span>
                                                  <span className="w-20 text-xs text-left text-[#397ff1]">
                                                    ₱
                                                    {activity.commission.toFixed(
                                                      2
                                                    )}
                                                  </span>
                                                  <span className="w-20 text-right text-black/80 font-medium">
                                                    ₱
                                                    {activity.payout.toFixed(2)}
                                                  </span>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>

                                        {/* Summary */}
                                        <div className="border-t border-gray-100 mt-3 pt-3 text-xs text-gray-600">
                                          <div className="flex justify-between">
                                            <span>Gross Amount:</span>
                                            <span>
                                              ₱{creator.total_gross.toFixed(2)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between text-[#397ff1]">
                                            <span>Commission (15%):</span>
                                            <span>
                                              -₱
                                              {creator.total_commission.toFixed(
                                                2
                                              )}
                                            </span>
                                          </div>
                                          <div className="flex justify-between font-semibold text-black/80 mt-1">
                                            <span>Net Payout:</span>
                                            <span>
                                              ₱{creator.total_net.toFixed(2)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Traveler Information */}
                              <div className="px-6">
                                <h4 className="font-semibold text-black/80 mb-3 flex items-center gap-2">
                                  Traveler Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <p className="text-black/60">
                                    <span className="font-medium">Name:</span>{" "}
                                    {itinerary.traveler_first_name}{" "}
                                    {itinerary.traveler_last_name}
                                  </p>
                                  <p className="text-black/60">
                                    <span className="font-medium">Email:</span>{" "}
                                    {itinerary.traveler_email}
                                  </p>
                                  <p className="text-black/60">
                                    <span className="font-medium">Mobile:</span>{" "}
                                    {itinerary.traveler_mobile || "N/A"}
                                  </p>
                                </div>
                              </div>

                              {/* Itinerary Details */}
                              <div className="px-6">
                                <h4 className="font-semibold text-black/80 mb-3 flex items-center gap-2">
                                  Itinerary Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <p className="text-black/60">
                                    <span className="font-medium">
                                      Duration:
                                    </span>{" "}
                                    {formatDate(itinerary.start_date)} -{" "}
                                    {formatDate(itinerary.end_date)}
                                  </p>
                                  <p className=" font-medium text-black/60">
                                    Status:
                                    <span className="font-medium capitalize text-[#397ff1] ">
                                      {" "}
                                      {itinerary.status}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Right Column - Payment Breakdown */}
                            <div className="space-y-6">
                              {/* Earnings Breakdown */}
                              <div className="rounded-xl p-6 border border-gray-200">
                                <h4 className="font-semibold text-black/80 mb-4 flex items-center gap-2">
                                  Earnings Breakdown
                                </h4>
                                <div className="space-y-4">
                                  {/* Total Amount */}
                                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                    <span className="text-sm text-black/60">
                                      Total Amount
                                    </span>
                                    <span className="text-lg font-semibold text-black/80">
                                      ₱{earnings.total_amount.toFixed(2)}
                                    </span>
                                  </div>

                                  {/* Platform Earning */}
                                  <div className="bg-white rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm font-medium text-black/70">
                                        Platform Commission
                                      </span>
                                      <span className="text-xs text-blue-600 bg-blue-100 text- px-2 py-1 rounded">
                                        {earnings.commission_rate}%
                                      </span>
                                    </div>
                                    <p className="text-2xl font-bold text-[#397ff1]">
                                      ₱{earnings.platform_commission.toFixed(2)}
                                    </p>
                                  </div>

                                  {/* Total Creator Payouts */}
                                  <div className="bg-white rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm font-medium text-black/70">
                                        Total Creator Payouts
                                      </span>
                                      <span className="text-xs bg-gray-100 text-black/60 px-2 py-1 rounded">
                                        {100 - earnings.commission_rate}%
                                      </span>
                                    </div>
                                    <p className="text-2xl font-bold text-black/70">
                                      ₱{earnings.creators_payout.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Information */}
                              <div>
                                <h4 className="font-semibold text-black/80 mb-3">
                                  Payment Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <p className="text-black/60">
                                    <span className="font-medium">
                                      Payment Type:
                                    </span>{" "}
                                    {itinerary.payment_type === "full"
                                      ? "Full Payment"
                                      : "Partial Payment"}
                                  </p>
                                  <p className="text-black/60">
                                    <span className="font-medium">
                                      Amount Paid:
                                    </span>{" "}
                                    ₱
                                    {parseFloat(
                                      itinerary.amount_paid || 0
                                    ).toFixed(2)}
                                  </p>
                                  {itinerary.payment_type === "partial" && (
                                    <>
                                      <p className="text-black/60">
                                        <span className="font-medium">
                                          Down Payment:
                                        </span>{" "}
                                        ₱
                                        {parseFloat(
                                          itinerary.down_payment_amount || 0
                                        ).toFixed(2)}
                                      </p>
                                      <p className="text-black/60">
                                        <span className="font-medium">
                                          Balance after approval :
                                        </span>{" "}
                                        ₱
                                        {(
                                          earnings.total_amount -
                                          parseFloat(itinerary.amount_paid || 0)
                                        ).toFixed(2)}
                                      </p>
                                    </>
                                  )}
                                  {paymentProofs.length > 0 && (
                                    <button
                                      onClick={() =>
                                        setSelectedProofImage(paymentProofs)
                                      }
                                      className="text-[#397ff1] hover:underline cursor-pointer"
                                    >
                                      View Payment Proof
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              {/* Action Buttons */}
                              <div className="space-y-2">
                                {itinerary.payment_status === "Pending" && (
                                  <>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          handleApprovePayment(
                                            itinerary.itinerary_id,
                                            itinerary.payment_id
                                          )
                                        }
                                        disabled={processingPayment === itinerary.itinerary_id}
                                        className="w-full px-6 py-3 bg-primary text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                                      >
                                        {processingPayment === itinerary.itinerary_id
                                          ? "Processing..."
                                          : "Approve Payment"}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeclineClick(
                                            itinerary.itinerary_id,
                                            itinerary.payment_id
                                          )
                                        }
                                        disabled={processingPayment === itinerary.itinerary_id}
                                        className="w-full px-6 py-3 bg-gray-50 text-black/80 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                                      >
                                        Reject Payment
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Decline Payment Modal */}
                              {showDeclineModal && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                  <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                      Decline Payment
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                      Please provide a reason for declining this payment. The traveler will be notified.
                                    </p>

                                    <textarea
                                      value={declineReason}
                                      onChange={(e) => setDeclineReason(e.target.value)}
                                      placeholder="e.g., Invalid payment proof, unclear bank receipt, wrong amount..."
                                      className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                      maxLength={500}
                                    />

                                    <p className="text-xs text-gray-500 mb-4">
                                      {declineReason.length}/500 characters
                                    </p>

                                    <div className="flex gap-3">
                                      <button
                                        onClick={() => {
                                          setShowDeclineModal(false);
                                          setSelectedPayment(null);
                                          setDeclineReason('');
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleDeclinePayment}
                                        disabled={!declineReason.trim() || processingPayment}
                                        className="flex-1 px-4 py-2.5 bg-gray-50 text-black/80 font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      >
                                        {processingPayment ? "Declining..." : "Decline Payment"}
                                      </button>
                                    </div>
                                  </div>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-
                {Math.min(
                  startIndex + ITEMS_PER_PAGE,
                  filteredItineraries.length
                )}{" "}
                of {filteredItineraries.length} itineraries
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
                        ? "bg-[#3A81F3] text-white cursor-pointer hover:bg-[#3A81F3]/90"
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
      {/* Payment Proof Modal */}
      {selectedProofImage && (
        <PaymentProofModal
          proofs={selectedProofImage}
          onClose={() => setSelectedProofImage(null)}
        />
      )}
    </>
  );
};

export default ItineraryManagement;
