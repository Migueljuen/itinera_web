// pages/admin/CancellationManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    Search,
    CheckCircle,
    XCircle,
    Clock3,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";

const ITEMS_PER_PAGE = 10;

const STATUS_TABS = [
    { key: "pending", label: "Pending", icon: Clock3 },
    { key: "approved", label: "Approved", icon: CheckCircle },
    { key: "rejected", label: "Rejected", icon: XCircle },
];

export default function CancellationManagement() {
    const { token } = useAuth();

    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState("pending");
    const [searchText, setSearchText] = useState("");
    const [requests, setRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [actingId, setActingId] = useState(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);

            const res = await axios.get(`${API_URL}/cancellation/admin/cancellations`, {
                params: { status: tab },
                headers: { Authorization: `Bearer ${token}` },
            });

            setRequests(res.data?.requests || []);
        } catch (err) {
            console.error("fetchRequests error:", err);
            toast.error("Failed to fetch cancellation requests");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        setCurrentPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    const filtered = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        if (!q) return requests;

        return requests.filter((r) => {
            const bookingId = String(r.booking_id || "");
            const partnerName = `${r.partner_first_name || ""} ${r.partner_last_name || ""}`.toLowerCase();
            const travelerName = `${r.traveler_first_name || ""} ${r.traveler_last_name || ""}`.toLowerCase();
            const reason = (r.cancellation_reason || "").toLowerCase();

            return (
                bookingId.includes(q) ||
                partnerName.includes(q) ||
                travelerName.includes(q) ||
                reason.includes(q)
            );
        });
    }, [requests, searchText]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageItems = filtered.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);
    const approveRequest = async (request_id, booking_id) => {
        try {
            setActingId(request_id);

            const res = await axios.put(
                `${API_URL}/cancellation/admin/requests/${request_id}/approve`,
                { booking_id }, // ✅ send booking_id
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.data?.success) throw new Error(res.data?.message || "Approve failed");

            toast.success("Cancellation approved");
            setRequests((prev) => prev.filter((x) => x.request_id !== request_id));
        } catch (err) {
            console.error("approveRequest error:", err);
            toast.error(err?.response?.data?.message || err?.message || "Failed to approve");
        } finally {
            setActingId(null);
        }
    };

    const rejectRequest = async (request_id, booking_id) => {
        const reason = window.prompt("Reject reason (optional):", "");
        try {
            setActingId(request_id);

            const res = await axios.put(
                `${API_URL}/cancellation/admin/requests/${request_id}/reject`,
                {
                    booking_id, // ✅ send booking_id
                    rejection_reason: reason || null, // ✅ controller supports this
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.data?.success) throw new Error(res.data?.message || "Reject failed");

            toast.success("Cancellation rejected");
            setRequests((prev) => prev.filter((x) => x.request_id !== request_id));
        } catch (err) {
            console.error("rejectRequest error:", err);
            toast.error(err?.response?.data?.message || err?.message || "Failed to reject");
        } finally {
            setActingId(null);
        }
    };

    const StatusPill = ({ status }) => {
        const map = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
        };
        const cls = map[(status || "").toLowerCase()] || "bg-gray-100 text-gray-700";
        return (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${cls}`}>
                {(status || "unknown").toUpperCase()}
            </span>
        );
    };

    return (
        <div className="min-h-screen">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Cancellation Requests
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Review partner-initiated cancellation requests
                    </p>
                </div>
                <button
                    onClick={fetchRequests}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Refresh
                </button>
            </div>

            {/* Tabs + Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex gap-2">
                        {STATUS_TABS.map((t) => {
                            const Icon = t.icon;
                            const active = tab === t.key;
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${active
                                        ? "bg-gray-100 border-gray-300 text-gray-900"
                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <Icon size={16} />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative w-full lg:w-[360px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search booking, partner, traveler, reason..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="py-10 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading requests...</p>
                    </div>
                ) : pageItems.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-gray-500">No requests found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {pageItems.map((r) => (
                            <div key={r.request_id} className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <p className="font-semibold text-gray-900">
                                                Booking #{r.booking_id}
                                            </p>
                                            <StatusPill status={r.status} />
                                        </div>

                                        <p className="text-sm text-gray-600">
                                            Partner:{" "}
                                            <span className="text-gray-900 font-medium">
                                                {r.partner_first_name} {r.partner_last_name}
                                            </span>{" "}
                                            • Traveler:{" "}
                                            <span className="text-gray-900 font-medium">
                                                {r.traveler_first_name} {r.traveler_last_name}
                                            </span>
                                        </p>

                                        <p className="text-sm text-gray-600">
                                            Submitted:{" "}
                                            <span className="text-gray-900">
                                                {r.created_at
                                                    ? dayjs(r.created_at).format("MMM D, YYYY h:mm A")
                                                    : "—"}
                                            </span>
                                        </p>

                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Reason:</span>{" "}
                                                {r.cancellation_reason || "—"}
                                            </p>
                                        </div>

                                        {/* Optional proof preview (if you return URLs later) */}
                                        {Array.isArray(r.proof_files) && r.proof_files.length > 0 && (
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-700 mb-1">
                                                    Proof files
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {r.proof_files.map((p, idx) => (
                                                        <a
                                                            key={`${r.request_id}-proof-${idx}`}
                                                            href={`${API_URL}/${p}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            View proof {idx + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 min-w-[180px]">
                                        <button
                                            disabled={actingId === r.request_id || tab !== "pending"}
                                            onClick={() => approveRequest(r.request_id, r.booking_id)}   // ✅ pass booking_id
                                            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab !== "pending"
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : actingId === r.request_id
                                                    ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                                                    : "bg-green-600 text-white hover:bg-green-700"
                                                }`}
                                        >
                                            Approve
                                        </button>

                                        <button
                                            disabled={actingId === r.request_id || tab !== "pending"}
                                            onClick={() => rejectRequest(r.request_id, r.booking_id)}    // ✅ pass booking_id
                                            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab !== "pending"
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : actingId === r.request_id
                                                    ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                                                    : "bg-red-600 text-white hover:bg-red-700"
                                                }`}
                                        >
                                            Reject
                                        </button>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of{" "}
                        {filtered.length} requests
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <span className="text-sm text-gray-700 px-2">
                            {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
