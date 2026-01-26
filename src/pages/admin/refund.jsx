// pages/admin/RefundManagement.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    User,
    Clock,
    CheckCircle,
    X,
    BadgeDollarSign,
    FileText,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";

const RefundManagement = () => {
    const { user, token } = useAuth();

    const [loading, setLoading] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);

    const [refunds, setRefunds] = useState([]);
    const [stats, setStats] = useState(null);

    const [searchText, setSearchText] = useState("");
    const [selectedTab, setSelectedTab] = useState("Queue"); // Queue = pending + processing
    const [currentPage, setCurrentPage] = useState(1);

    const [expandedRefundId, setExpandedRefundId] = useState(null);
    const [processingRefund, setProcessingRefund] = useState(null);

    // ✅ Only modal left: complete
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [completeNotes, setCompleteNotes] = useState("");
    const [transactionReference, setTransactionReference] = useState("");

    const refundRefs = useRef({});
    const ITEMS_PER_PAGE = 10;

    const formatDateTime = (dt) =>
        dt ? dayjs(dt).format("MMM D, YYYY • h:mm A") : "—";

    const formatCurrency = (n) =>
        `₱${Number(n || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const getStatusBadge = (status) => {
        const map = {
            pending: {
                label: "Pending",
                cls: "bg-yellow-100 text-yellow-700",
                dot: "bg-yellow-700",
            },
            processing: {
                label: "Processing",
                cls: "bg-blue-100 text-blue-700",
                dot: "bg-blue-700",
            },
            completed: {
                label: "Completed",
                cls: "bg-green-100 text-green-700",
                dot: "bg-green-700",
            },
            rejected: {
                label: "Rejected",
                cls: "bg-red-100 text-red-700",
                dot: "bg-red-700",
            },
        };
        const s = map[status] || {
            label: status || "Unknown",
            cls: "bg-gray-100 text-gray-600",
            dot: "bg-gray-600",
        };

        return (
            <span
                className={`text-[11px] px-3 py-1 rounded-xl font-medium flex items-center gap-2 w-fit ${s.cls}`}
            >
                <span className={`size-2 rounded-full ${s.dot}`} />
                {s.label}
            </span>
        );
    };

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const res = await axios.get(`${API_URL}/refunds/admin/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setStats(res.data?.stats || null);
        } catch (e) {
            console.error("Fetch refund stats error:", e);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchRefunds = async () => {
        try {
            setLoading(true);

            if (selectedTab === "Queue") {
                const res = await axios.get(`${API_URL}/refunds/admin/pending`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setRefunds(res.data || []);
                return;
            }

            const params = { page: 1, limit: 500 };
            if (selectedTab !== "All") params.status = selectedTab.toLowerCase();

            const res = await axios.get(`${API_URL}/refunds/admin/all`, {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            setRefunds(res.data?.refunds || []);
        } catch (e) {
            console.error("Fetch refunds error:", e);
            setRefunds([]);
            if (e.response?.status !== 404) toast.error("Failed to fetch refunds");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.user_id) return;
        fetchRefunds();
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, selectedTab]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTab, searchText]);

    const filteredRefunds = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        if (!q) return refunds;

        return refunds.filter((r) => {
            const travelerName = `${r.traveler_first_name || ""} ${r.traveler_last_name || ""
                }`.toLowerCase();
            const itineraryTitle = (r.itinerary_title || "").toLowerCase();
            const experienceName = (r.experience_name || "").toLowerCase();
            const refundId = String(r.refund_id || "");
            const itineraryId = String(r.itinerary_id || "");
            const gcash = String(r.gcash_number || "").toLowerCase();
            const mobile = String(r.traveler_mobile || "").toLowerCase();

            return (
                travelerName.includes(q) ||
                itineraryTitle.includes(q) ||
                experienceName.includes(q) ||
                refundId.includes(q) ||
                itineraryId.includes(q) ||
                gcash.includes(q) ||
                mobile.includes(q)
            );
        });
    }, [refunds, searchText]);

    const sortedRefunds = useMemo(() => {
        const arr = [...filteredRefunds];
        arr.sort((a, b) => {
            const da = dayjs(a.requested_at);
            const db = dayjs(b.requested_at);
            return selectedTab === "Queue"
                ? da.valueOf() - db.valueOf()
                : db.valueOf() - da.valueOf();
        });
        return arr;
    }, [filteredRefunds, selectedTab]);

    const totalPages = Math.ceil(sortedRefunds.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedRefunds = sortedRefunds.slice(startIndex, endIndex);

    const tabCounts = useMemo(() => {
        if (stats) {
            return {
                All: stats.total_refunds || 0,
                Pending: stats.pending_count || 0,
                Processing: stats.processing_count || 0,
                Completed: stats.completed_count || 0,
                Rejected: stats.rejected_count || 0,
                Queue:
                    (stats.pending_count || 0) + (stats.processing_count || 0),
            };
        }

        const all = refunds.length;
        const pending = refunds.filter((r) => r.status === "pending").length;
        const processing = refunds.filter((r) => r.status === "processing").length;
        const completed = refunds.filter((r) => r.status === "completed").length;
        const rejected = refunds.filter((r) => r.status === "rejected").length;

        return {
            All: all,
            Pending: pending,
            Processing: processing,
            Completed: completed,
            Rejected: rejected,
            Queue: pending + processing,
        };
    }, [refunds, stats]);

    // ✅ Only action: Mark Completed (direct)
    const openCompleteModal = (refund) => {
        setSelectedRefund(refund);
        setCompleteNotes("");
        setTransactionReference("");
        setShowCompleteModal(true);
    };

    const submitMarkCompleted = async () => {
        if (!selectedRefund) return;

        try {
            setProcessingRefund(selectedRefund.refund_id);

            await axios.put(
                `${API_URL}/refunds/admin/${selectedRefund.refund_id}/complete`,
                {
                    admin_notes: completeNotes?.trim() || undefined,
                    transaction_reference: transactionReference?.trim() || undefined,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            toast.success("Refund marked as completed");
            setShowCompleteModal(false);
            setSelectedRefund(null);
            setCompleteNotes("");
            setTransactionReference("");
            await fetchRefunds();
            await fetchStats();
        } catch (e) {
            console.error("Mark completed error:", e);
            toast.error(e.response?.data?.error || "Failed to complete refund");
        } finally {
            setProcessingRefund(null);
        }
    };

    return (
        <>
            <Toaster position="top-center" />

            {/* ✅ prevents horizontal overflow */}
            <div className="min-h-screen w-full max-w-full overflow-x-hidden px-2">
                <div className="w-full max-w-full">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                        <div className="min-w-0">
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Refund Management
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Review and process refund requests
                            </p>
                        </div>


                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-6">
                        {[
                            {
                                label: "Queue",
                                value: tabCounts.Queue,
                                icon: <Clock size={16} className="text-blue-600" />,
                            },
                            {
                                label: "Pending",
                                value: tabCounts.Pending,
                                icon: <FileText size={16} className="text-yellow-600" />,
                            },
                            {
                                label: "Processing",
                                value: tabCounts.Processing,
                                icon: <Clock size={16} className="text-blue-600" />,
                            },
                            {
                                label: "Completed",
                                value: tabCounts.Completed,
                                icon: <CheckCircle size={16} className="text-green-600" />,
                            },
                            {
                                label: "Rejected",
                                value: tabCounts.Rejected,
                                icon: <X size={16} className="text-red-600" />,
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="rounded-xl border border-gray-200 bg-white p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500">{s.label}</p>
                                    {s.icon}
                                </div>
                                <p className="text-xl font-semibold text-black/80 mt-2">
                                    {loadingStats ? "…" : s.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Tabs + Search */}
                    <div className="rounded-lg mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                            <div className="flex flex-wrap bg-gray-50 rounded-lg w-full lg:w-fit p-2">
                                {["Queue", "All", "Pending", "Processing", "Completed", "Rejected"].map(
                                    (tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setSelectedTab(tab)}
                                            className={`px-5 font-medium transition-colors py-2 rounded-lg ${selectedTab === tab
                                                ? "bg-white text-black/80 shadow-sm"
                                                : "text-black/50 hover:text-black/70"
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    )
                                )}
                            </div>

                            <div className="relative w-full lg:max-w-[520px]">
                                <Search
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Search refund ID, traveler, itinerary, experience, GCash..."
                                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="divide-y divide-gray-200">
                        {loading ? (
                            <div className="py-10 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
                                <p className="text-gray-500 mt-2">Loading refunds...</p>
                            </div>
                        ) : paginatedRefunds.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-gray-500">No refunds found</p>
                            </div>
                        ) : (
                            paginatedRefunds.map((refund) => {
                                const isExpanded = expandedRefundId === refund.refund_id;

                                return (
                                    <div
                                        key={refund.refund_id}
                                        ref={(el) => (refundRefs.current[refund.refund_id] = el)}
                                        className={`py-7 mb-4 border rounded-xl border-gray-200 bg-white transition ${isExpanded ? "ring-2 ring-blue-400" : ""
                                            }`}
                                    >
                                        {/* Top Row */}
                                        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 px-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[110px_1fr_1fr_200px_170px] gap-4 items-start xl:items-center w-full">
                                                {/* Refund ID */}
                                                <div className="text-left xl:text-center px-0 xl:px-4 xl:border-r xl:border-gray-200">
                                                    <p className="text-xs text-gray-500">Refund ID</p>
                                                    <p className="text-xl font-semibold text-black/70">
                                                        {String(refund.refund_id).padStart(4, "0")}
                                                    </p>
                                                </div>

                                                {/* Traveler */}
                                                <div className="min-w-0 xl:px-4">
                                                    <span className="text-xs text-gray-500">Traveler</span>
                                                    <div className="flex items-center gap-2 mt-1 min-w-0">
                                                        <User size={16} className="text-gray-400 shrink-0" />
                                                        <span className="text-sm font-semibold text-black/80 truncate">
                                                            {refund.traveler_first_name} {refund.traveler_last_name}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                                        {refund.traveler_mobile || "No mobile"} •{" "}
                                                        {refund.gcash_number ? `GCash: ${refund.gcash_number}` : "No GCash"}
                                                    </p>
                                                </div>

                                                {/* Experience + Itinerary */}
                                                <div className="min-w-0 xl:px-4">
                                                    <span className="text-xs text-gray-500">Activity</span>
                                                    <p className="text-sm font-semibold text-black/80 mt-1 truncate">
                                                        {refund.experience_name || "—"}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1 truncate">
                                                        {refund.itinerary_title || `Itinerary #${refund.itinerary_id}`}
                                                    </p>
                                                </div>

                                                {/* Status */}
                                                <div className="xl:px-4">
                                                    <span className="text-xs text-gray-500">Status</span>
                                                    <div className="mt-1">{getStatusBadge(refund.status)}</div>
                                                </div>

                                                {/* Amount */}
                                                <div className="xl:px-4">
                                                    <span className="text-xs text-gray-500">Refund Amount</span>
                                                    <p className="text-lg font-semibold text-black/80 mt-1">
                                                        {formatCurrency(refund.refund_amount)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Expand */}
                                            <button
                                                onClick={() => setExpandedRefundId(isExpanded ? null : refund.refund_id)}
                                                className="flex items-center gap-2 px-4 rounded-md text-sm font-normal text-black/80 hover:text-black/60 self-end xl:self-auto"
                                            >
                                                {isExpanded ? "Less" : "More"}{" "}
                                                <ChevronDown
                                                    size={16}
                                                    className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        {/* Expanded */}
                                        <div
                                            className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-[1000px] opacity-100 mt-6" : "max-h-0 opacity-0"
                                                }`}
                                        >
                                            <div className="border-t border-gray-200 pt-6 px-4 sm:px-8">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                                    {/* Left */}
                                                    <div className="space-y-5">
                                                        <div className="rounded-xl p-6 border border-gray-200">
                                                            <h4 className="font-semibold text-black/80 mb-3 flex items-center gap-2">
                                                                <Clock size={16} className="text-gray-600" />
                                                                Timeline
                                                            </h4>

                                                            <div className="space-y-2 text-sm text-black/60">
                                                                <p>
                                                                    <span className="font-medium">Requested:</span>{" "}
                                                                    {formatDateTime(refund.requested_at)}
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">Processed at:</span>{" "}
                                                                    {formatDateTime(refund.processed_at)}
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">Completed at:</span>{" "}
                                                                    {formatDateTime(refund.completed_at)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="rounded-xl p-6 border border-gray-200">
                                                            <h4 className="font-semibold text-black/80 mb-3 flex items-center gap-2">
                                                                <FileText size={16} className="text-gray-600" />
                                                                Notes
                                                            </h4>
                                                            <p className="text-sm text-black/60 whitespace-pre-wrap">
                                                                {refund.admin_notes || "—"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Right */}
                                                    <div className="space-y-5">
                                                        <div className="rounded-xl p-6 border border-gray-200">
                                                            <h4 className="font-semibold text-black/80 mb-3 flex items-center gap-2">
                                                                <BadgeDollarSign size={16} className="text-gray-600" />
                                                                Refund Details
                                                            </h4>

                                                            <div className="space-y-2 text-sm text-black/60">
                                                                <p>
                                                                    <span className="font-medium">Experience:</span>{" "}
                                                                    {refund.experience_name || "—"}
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">Itinerary:</span>{" "}
                                                                    {refund.itinerary_title || `#${refund.itinerary_id}`}
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">Amount:</span>{" "}
                                                                    {formatCurrency(refund.refund_amount)}
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">GCash:</span>{" "}
                                                                    {refund.gcash_number || "—"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* ✅ Actions: only Mark Completed */}
                                                        <div className="space-y-2">
                                                            {(refund.status === "pending" || refund.status === "processing") && (
                                                                <div className="flex flex-col sm:flex-row gap-2">
                                                                    <button
                                                                        onClick={() => openCompleteModal(refund)}
                                                                        disabled={processingRefund === refund.refund_id}
                                                                        className="w-full px-6 py-3 bg-primary text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                                                                    >
                                                                        {processingRefund === refund.refund_id
                                                                            ? "Processing..."
                                                                            : "Mark Completed"}
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {refund.status === "completed" && (
                                                                <div className="text-sm text-gray-500">
                                                                    This refund is already{" "}
                                                                    <span className="font-medium">{refund.status}</span>.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div className="text-sm text-gray-600">
                                Showing {startIndex + 1}-{Math.min(endIndex, sortedRefunds.length)} of{" "}
                                {sortedRefunds.length} refunds
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
                                                ? "bg-[#3A81F3] text-white cursor-pointer hover:bg-[#3A81F3]/90"
                                                : "border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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

            {/* ✅ Complete Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Mark as Completed
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Add optional notes + transaction reference. The traveler will be notified.
                        </p>

                        <input
                            value={transactionReference}
                            onChange={(e) => setTransactionReference(e.target.value)}
                            placeholder="Transaction reference (optional)"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            maxLength={100}
                        />

                        <textarea
                            value={completeNotes}
                            onChange={(e) => setCompleteNotes(e.target.value)}
                            placeholder="Optional notes..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            maxLength={500}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCompleteModal(false);
                                    setSelectedRefund(null);
                                    setCompleteNotes("");
                                    setTransactionReference("");
                                }}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitMarkCompleted}
                                disabled={processingRefund}
                                className="flex-1 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processingRefund ? "Saving..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RefundManagement;
