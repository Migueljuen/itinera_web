// RefundManagement.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Download,
    User,
    Clock,
    Wallet,
    CheckCircle,
    Loader2,
    AlertCircle,
    Phone,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";

const RefundManagement = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectedTab, setSelectedTab] = useState("all");

    const [refunds, setRefunds] = useState([]);
    const [counts, setCounts] = useState({
        all: 0,
        pending: 0,
        processing: 0,
        completed: 0,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRefundId, setExpandedRefundId] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    const refundRefs = useRef({});
    const ITEMS_PER_PAGE = 10;

    const fetchRefunds = async () => {
        if (!user?.user_id) return;

        try {
            setLoading(true);

            const response = await axios.get(`${API_URL}/refunds/creator`, {
                params: { status: selectedTab === "all" ? undefined : selectedTab },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.data.success) {
                setRefunds(response.data.refunds || []);
                setCounts(
                    response.data.counts || {
                        all: 0,
                        pending: 0,
                        processing: 0,
                        completed: 0,
                    }
                );
            }
        } catch (error) {
            console.error("Error fetching refunds:", error);
            setRefunds([]);
            if (error.response?.status !== 404) toast.error("Failed to fetch refunds");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.user_id) fetchRefunds();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, selectedTab]);

    useEffect(() => {
        const selectedId = searchParams.get("selectedId");

        if (selectedId && refunds.length > 0) {
            const refundId = parseInt(selectedId);
            const refund = refunds.find((r) => r.refund_id === refundId);

            if (refund) {
                setExpandedRefundId(refundId);
                setSelectedTab(refund.status || "all");

                setTimeout(() => {
                    refundRefs.current[refundId]?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }, 300);
            }
        }
    }, [searchParams, refunds]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTab, searchText]);

    const filteredRefunds = refunds.filter((refund) => {
        const s = searchText.toLowerCase();
        return (
            refund.traveler_first_name?.toLowerCase().includes(s) ||
            refund.traveler_last_name?.toLowerCase().includes(s) ||
            refund.experience_name?.toLowerCase().includes(s) ||
            refund.refund_id?.toString().includes(s)
        );
    });

    const totalPages = Math.ceil(filteredRefunds.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedRefunds = filteredRefunds.slice(startIndex, endIndex);

    const handleMarkProcessing = async (refund) => {
        const confirmed = window.confirm(
            `Mark this refund as processing?\n\nRefund Amount: ₱${refund.refund_amount?.toLocaleString()}\nTraveler: ${refund.traveler_first_name} ${refund.traveler_last_name}`
        );
        if (!confirmed) return;

        try {
            setProcessingId(refund.refund_id);

            const res = await axios.patch(
                `${API_URL}/refunds/creator/${refund.refund_id}/processing`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.data?.success) {
                throw new Error(res.data?.message || "Failed to update refund");
            }

            toast.success("Refund marked as processing");

            setRefunds((prev) =>
                prev.map((r) =>
                    r.refund_id === refund.refund_id ? { ...r, status: "processing" } : r
                )
            );
            setCounts((prev) => ({
                ...prev,
                pending: Math.max(0, prev.pending - 1),
                processing: prev.processing + 1,
            }));
        } catch (err) {
            console.error("handleMarkProcessing error:", err);
            toast.error(err?.response?.data?.message || "Failed to update refund");
        } finally {
            setProcessingId(null);
        }
    };

    const handleMarkCompleted = async (refund) => {
        const reference = window.prompt(
            `Enter GCash reference number (optional):\n\nRefund Amount: ₱${refund.refund_amount?.toLocaleString()}\nGCash: ${refund.gcash_number} (${refund.gcash_name})`
        );
        if (reference === null) return;

        try {
            setProcessingId(refund.refund_id);

            const res = await axios.patch(
                `${API_URL}/refunds/creator/${refund.refund_id}/complete`,
                { transaction_reference: reference.trim() || undefined },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.data?.success) {
                throw new Error(res.data?.message || "Failed to complete refund");
            }

            toast.success("Refund marked as completed");

            setRefunds((prev) =>
                prev.map((r) =>
                    r.refund_id === refund.refund_id ? { ...r, status: "completed" } : r
                )
            );
            setCounts((prev) => ({
                ...prev,
                processing: Math.max(0, prev.processing - 1),
                completed: prev.completed + 1,
            }));
        } catch (err) {
            console.error("handleMarkCompleted error:", err);
            toast.error(err?.response?.data?.message || "Failed to complete refund");
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertCircle size={12} />
                        Pending
                    </span>
                );
            case "processing":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <Loader2 size={12} className="animate-spin" />
                        Processing
                    </span>
                );
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle size={12} />
                        Completed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                        {status}
                    </span>
                );
        }
    };

    // ✅ Keep your existing tab IDs (used by API), but style them like ActivityManagement tabs.
    const tabs = [
        { id: "all", label: "All", count: counts.all },
        { id: "pending", label: "Pending", count: counts.pending },
        { id: "processing", label: "Processing", count: counts.processing },
        { id: "completed", label: "Completed", count: counts.completed },
    ];

    return (
        <>
            <Toaster position="top-center" />

            <div className="min-h-screen pb-48">
                <div className="">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Refund Management
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Process refunds for cancelled bookings
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                <Download size={16} />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <AlertCircle size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pending Refunds</p>
                                    <p className="text-xl font-semibold text-gray-900">
                                        {counts.pending}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Loader2 size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Processing</p>
                                    <p className="text-xl font-semibold text-gray-900">
                                        {counts.processing}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <CheckCircle size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Completed</p>
                                    <p className="text-xl font-semibold text-gray-900">
                                        {counts.completed}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-lg">
                        {/* ✅ Tabs + Search header (MATCH ActivityManagement) */}
                        <div className="py-4">
                            <div className="bg-white rounded-lg mb-6">
                                <div className="flex justify-between items-center">
                                    {/* Tab Navigation (Activity style) */}
                                    <div className="flex bg-gray-50 rounded-lg w-fit p-2">
                                        {tabs.map((tab) => {
                                            const active = selectedTab === tab.id;

                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setSelectedTab(tab.id)}
                                                    className={`px-8 font-medium transition-colors py-2 rounded-lg ${active
                                                        ? "bg-white text-black/80 shadow-sm/10"
                                                        : "text-black/50 hover:text-black/70"
                                                        }`}
                                                >
                                                    <span className="inline-flex items-center gap-2">
                                                        {tab.label}
                                                        {tab.count > 0 && (
                                                            <span
                                                                className={`text-xs px-2 py-0.5 rounded-full ${active
                                                                    ? "bg-gray-100 text-black/60"
                                                                    : "bg-white text-black/50 border border-black/5"
                                                                    }`}
                                                            >
                                                                {tab.count}
                                                            </span>
                                                        )}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Search (Activity style: icon on right) */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-fit">
                                            <Search
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                size={20}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Search refunds..."
                                                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Refunds List */}
                        <div className="divide-y divide-gray-200">
                            {loading ? (
                                <div className="py-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                    <p className="text-gray-500 mt-2">Loading refunds...</p>
                                </div>
                            ) : paginatedRefunds.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No refunds found</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Refund requests will appear here when travelers cancel paid
                                        bookings
                                    </p>
                                </div>
                            ) : (
                                paginatedRefunds.map((refund) => {
                                    const isExpanded = expandedRefundId === refund.refund_id;
                                    const isProcessing = processingId === refund.refund_id;

                                    return (
                                        <div
                                            key={refund.refund_id}
                                            ref={(el) =>
                                                (refundRefs.current[refund.refund_id] = el)
                                            }
                                            className={`py-6 mb-4 border rounded-xl border-gray-300 bg-white transition ${isExpanded ? "ring-2 ring-blue-400" : ""
                                                }`}
                                        >
                                            {/* Collapsed View */}
                                            <div className="flex items-center justify-between px-6">
                                                <div className="grid grid-cols-[100px_200px_200px_150px] gap-4 items-center">
                                                    {/* Date */}
                                                    <div className="text-center px-2 border-r border-gray-300">
                                                        <p className="text-sm text-black/60">
                                                            {dayjs(refund.requested_at).format("MMM")}
                                                        </p>
                                                        <p className="text-2xl font-semibold text-black/80">
                                                            {dayjs(refund.requested_at).format("D")}
                                                        </p>
                                                    </div>

                                                    {/* Traveler Info */}
                                                    <div className="flex items-center gap-3 px-2">
                                                        {refund.traveler_profile_pic ? (
                                                            <img
                                                                src={`${API_URL}/${refund.traveler_profile_pic}`}
                                                                alt="Profile"
                                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                                <User size={20} className="text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-sm text-black/80">
                                                                {refund.traveler_first_name}{" "}
                                                                {refund.traveler_last_name}
                                                            </p>
                                                            <p className="text-xs text-black/50">
                                                                {refund.experience_name}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Refund Amount */}
                                                    <div className="px-2">
                                                        <p className="text-xs text-black/50">
                                                            Refund Amount
                                                        </p>
                                                        <p className="text-lg font-semibold text-black/80">
                                                            ₱{refund.refund_amount?.toLocaleString()}
                                                        </p>
                                                    </div>

                                                    {/* Status */}
                                                    <div className="px-2">{getStatusBadge(refund.status)}</div>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        setExpandedRefundId(
                                                            isExpanded ? null : refund.refund_id
                                                        )
                                                    }
                                                    className="flex items-center gap-2 px-4 rounded-md text-sm font-normal text-black/80 hover:text-black/60"
                                                >
                                                    {isExpanded ? "Less" : "More"}
                                                    <ChevronDown
                                                        size={16}
                                                        className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </button>
                                            </div>

                                            {/* Expanded View */}
                                            <div
                                                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded
                                                    ? "max-h-[600px] opacity-100 mt-4"
                                                    : "max-h-0 opacity-0"
                                                    }`}
                                            >
                                                <div className="border-t border-gray-200 py-8 px-8">
                                                    <div className="grid grid-cols-2 gap-8">
                                                        {/* Left Column - Details */}
                                                        <div className="space-y-6">
                                                            {/* Booking Info */}
                                                            <div>
                                                                <h4 className="text-base font-medium text-black/80 mb-4">
                                                                    Booking Information
                                                                </h4>
                                                                <div className="space-y-3 text-sm">
                                                                    <p className="text-black/60">
                                                                        <span className="font-medium text-black/80">
                                                                            Refund ID:
                                                                        </span>{" "}
                                                                        #{refund.refund_id}
                                                                    </p>
                                                                    <p className="text-black/60">
                                                                        <span className="font-medium text-black/80">
                                                                            Booking ID:
                                                                        </span>{" "}
                                                                        #{refund.booking_id}
                                                                    </p>

                                                                    <p className="text-black/60">
                                                                        <span className="font-medium text-black/80">
                                                                            Booking Date:
                                                                        </span>{" "}
                                                                        {refund.booking_date
                                                                            ? dayjs(refund.booking_date).format(
                                                                                "MMM D, YYYY"
                                                                            )
                                                                            : "N/A"}
                                                                    </p>
                                                                    <p className="text-black/60">
                                                                        <span className="font-medium text-black/80">
                                                                            Guest Count:
                                                                        </span>{" "}
                                                                        {refund.guest_count || 1}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Payment Details */}
                                                            <div>
                                                                <h4 className="text-base font-medium text-black/80 mb-4">
                                                                    Payment Details
                                                                </h4>
                                                                <div className="space-y-3 text-sm">
                                                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                                                        <span className="text-black/60">
                                                                            Activity Price:
                                                                        </span>
                                                                        <span className="font-medium text-black/80">
                                                                            ₱{refund.activity_price?.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                                                        <span className="text-black/60">
                                                                            Refund Rate:
                                                                        </span>
                                                                        <span className="font-medium text-black/80">
                                                                            50%
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between py-2 bg-gray-50 px-3 rounded-lg">
                                                                        <span className="text-black/70 font-medium">
                                                                            Refund Amount:
                                                                        </span>
                                                                        <span className="font-semibold text-green-600">
                                                                            ₱{refund.refund_amount?.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right Column - GCash & Actions */}
                                                        <div className="space-y-6 pl-8 border-l border-gray-200">
                                                            {/* GCash Details */}
                                                            <div>
                                                                <h4 className="text-base font-medium text-black/80 mb-4">
                                                                    GCash Details
                                                                </h4>
                                                                <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                                            <Phone
                                                                                size={18}
                                                                                className="text-blue-600"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-blue-600">
                                                                                GCash Number
                                                                            </p>
                                                                            <p className="font-semibold text-blue-700">
                                                                                {refund.gcash_number || "N/A"}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                                            <User size={18} className="text-blue-600" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-blue-600">
                                                                                Account Name
                                                                            </p>
                                                                            <p className="font-semibold text-blue-700">
                                                                                {refund.gcash_name || "N/A"}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Timeline */}
                                                            <div>
                                                                <h4 className="text-base font-medium text-black/80 mb-4">
                                                                    Timeline
                                                                </h4>
                                                                <div className="space-y-2 text-sm">
                                                                    <p className="text-black/60">
                                                                        <span className="font-medium text-black/80">
                                                                            Requested:
                                                                        </span>{" "}
                                                                        {dayjs(refund.requested_at).format(
                                                                            "MMM D, YYYY h:mm A"
                                                                        )}
                                                                    </p>
                                                                    {refund.processed_at && (
                                                                        <p className="text-black/60">
                                                                            <span className="font-medium text-black/80">
                                                                                Processed:
                                                                            </span>{" "}
                                                                            {dayjs(refund.processed_at).format(
                                                                                "MMM D, YYYY h:mm A"
                                                                            )}
                                                                        </p>
                                                                    )}
                                                                    {refund.completed_at && (
                                                                        <p className="text-black/60">
                                                                            <span className="font-medium text-black/80">
                                                                                Completed:
                                                                            </span>{" "}
                                                                            {dayjs(refund.completed_at).format(
                                                                                "MMM D, YYYY h:mm A"
                                                                            )}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Action Buttons */}
                                                            {refund.status !== "completed" && (
                                                                <div className="pt-4 border-t border-gray-200">
                                                                    {refund.status === "pending" && (
                                                                        <div className="flex gap-3">
                                                                            <button
                                                                                onClick={() => handleMarkProcessing(refund)}
                                                                                disabled={isProcessing}
                                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                            >
                                                                                {isProcessing ? (
                                                                                    <Loader2
                                                                                        size={16}
                                                                                        className="animate-spin"
                                                                                    />
                                                                                ) : (
                                                                                    <Clock size={16} />
                                                                                )}
                                                                                Mark as Processing
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                    {refund.status === "processing" && (
                                                                        <div className="flex gap-3">
                                                                            <button
                                                                                onClick={() => handleMarkCompleted(refund)}
                                                                                disabled={isProcessing}
                                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                            >

                                                                                Mark as Completed
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                    <p className="text-xs text-gray-500 mt-3 text-center">
                                                                        Send the refund via GCash, then mark as completed
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {refund.status === "completed" && (
                                                                <div className="pt-4 border-t border-gray-200">
                                                                    <div className="flex items-center justify-center gap-2 py-3 bg-green-50 rounded-lg">
                                                                        <CheckCircle
                                                                            size={18}
                                                                            className="text-green-600"
                                                                        />
                                                                        <span className="text-green-700 font-medium">
                                                                            Refund Completed
                                                                        </span>
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
                                {Math.min(startIndex + ITEMS_PER_PAGE, filteredRefunds.length)} of{" "}
                                {filteredRefunds.length} refunds
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

export default RefundManagement;
