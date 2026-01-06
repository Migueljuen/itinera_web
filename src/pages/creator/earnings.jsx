import React, { useEffect, useState } from "react";
import {
    Calendar,
    DollarSign,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    TrendingUp,
    Wallet,
    CreditCard,
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    Filter,
    X,
} from "lucide-react";
import axios from "axios";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import toast, { Toaster } from "react-hot-toast";

const EarningsManagement = () => {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [selectedTab, setSelectedTab] = useState("Overview");

    // Data states
    const [overview, setOverview] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [experienceEarnings, setExperienceEarnings] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [cashTracker, setCashTracker] = useState([]);
    const [payoutHistory, setPayoutHistory] = useState([]);
    const [statistics, setStatistics] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Date filter
    const [dateRange, setDateRange] = useState({
        startDate: dayjs().subtract(30, "days").format("YYYY-MM-DD"),
        endDate: dayjs().format("YYYY-MM-DD"),
    });

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch functions
    const fetchOverview = async () => {
        try {
            const response = await axios.get(`${API_URL}/earnings/overview`, {
                headers,
                params: dateRange,
            });
            setOverview(response.data.overview);
        } catch (error) {
            console.error("Error fetching overview:", error);
            toast.error("Failed to load earnings overview");
        }
    };

    const fetchTimeline = async () => {
        try {
            const response = await axios.get(`${API_URL}/earnings/timeline`, {
                headers,
                params: { period: "month", ...dateRange },
            });
            setTimeline(response.data.timeline);
        } catch (error) {
            console.error("Error fetching timeline:", error);
        }
    };

    const fetchExperienceEarnings = async () => {
        try {
            const response = await axios.get(`${API_URL}/earnings/by-experience`, {
                headers,
                params: dateRange,
            });
            console.log('📊 API Response:', response.data); // ADD THIS
            console.log('📊 Experiences:', response.data.experiences); // ADD THIS

            setExperienceEarnings(response.data.experiences);
        } catch (error) {
            console.error("Error fetching experience earnings:", error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`${API_URL}/earnings/transactions`, {
                headers,
                params: { limit: 10, offset: 0 },
            });
            setRecentTransactions(response.data.transactions);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    };

    const fetchCashTracker = async () => {
        try {
            const response = await axios.get(`${API_URL}/earnings/cash-tracker`, {
                headers,
            });
            setCashTracker(response.data.cashTracker);
        } catch (error) {
            console.error("Error fetching cash tracker:", error);
        }
    };

    const fetchPayoutHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/earnings/payout-history`, {
                headers,
                params: { limit: 20, offset: 0 },
            });
            setPayoutHistory(response.data.payouts);
        } catch (error) {
            console.error("Error fetching payout history:", error);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await axios.get(`${API_URL}/earnings/statistics`, {
                headers,
            });
            setStatistics(response.data.statistics);
        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    };

    const handleMarkCashCollected = async (bookingId) => {
        try {
            await axios.post(
                `${API_URL}/earnings/mark-cash-collected`,
                { booking_id: bookingId },
                { headers }
            );
            toast.success("Cash marked as collected!");
            fetchCashTracker();
            fetchOverview();
        } catch (error) {
            console.error("Error marking cash collected:", error);
            toast.error("Failed to mark cash as collected");
        }
    };

    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchOverview(),
                fetchTimeline(),
                fetchExperienceEarnings(),
                fetchTransactions(),
                fetchCashTracker(),
                fetchPayoutHistory(),
                fetchStatistics(),
            ]);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.user_id) loadAllData();
    }, [user]);

    const paginate = (data) => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    };

    const totalPages = (data) => Math.ceil(data.length / ITEMS_PER_PAGE);

    return (
        <>
            <Toaster position="top-center" />

            <div className="min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Earnings Dashboard
                        </h1>
                        <p className="text-black/60 mt-1">
                            Track your income and manage payouts
                        </p>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="flex bg-gray-50 rounded-lg w-fit p-2">
                        {["Overview", "By Experience", "Transactions", "Cash Tracker", "Payout History"].map(
                            (tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setSelectedTab(tab);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-6 font-medium transition-colors py-2 rounded-lg ${selectedTab === tab
                                        ? "bg-white text-black/80 shadow-sm/10"
                                        : "text-black/50 hover:text-black/70"
                                        }`}
                                >
                                    {tab}
                                </button>
                            )
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading earnings data...</p>
                    </div>
                ) : (
                    <>
                        {/* OVERVIEW TAB */}
                        {selectedTab === "Overview" && overview && (
                            <div>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-4 gap-6 mb-8">
                                    <div className="bg-white border border-gray-300 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-black/60">Total Earnings</p>
                                            <TrendingUp size={20} className="text-black/40" />
                                        </div>
                                        <p className="text-2xl font-semibold text-black/80">
                                            ₱{parseFloat(overview.total_earnings || 0).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-black/50 mt-1">Completed bookings</p>
                                    </div>

                                    <div className="bg-white border border-gray-300 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-black/60">Pending Payouts</p>
                                            <Clock size={20} className="text-black/40" />
                                        </div>
                                        <p className="text-2xl font-semibold text-black/80">
                                            ₱{parseFloat(overview.pending_payouts || 0).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-black/50 mt-1">To be processed</p>
                                    </div>

                                    <div className="bg-white border border-gray-300 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-black/60">Cash Collected</p>
                                            <CheckCircle size={20} className="text-black/40" />
                                        </div>
                                        <p className="text-2xl font-semibold text-black/80">
                                            ₱{parseFloat(overview.cash_collected || 0).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-black/50 mt-1">In-person payments</p>
                                    </div>

                                    <div className="bg-white border border-gray-300 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-black/60">Cash Due</p>
                                            <AlertCircle size={20} className="text-black/40" />
                                        </div>
                                        <p className="text-2xl font-semibold text-black/80">
                                            ₱{parseFloat(overview.cash_due || 0).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-black/50 mt-1">To collect</p>
                                    </div>
                                </div>

                                {/* Earnings Timeline */}
                                {/* <div className="bg-white border border-gray-300 rounded-xl p-6 mb-8">
                                    <h3 className="font-semibold text-lg mb-6 text-black/80">Earnings Timeline</h3>
                                    <div className="space-y-4">
                                        {timeline.map((item, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-black/70">{item.period}</span>
                                                    <span className="text-black/60">
                                                        ₱{parseFloat(item.total_earnings || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 h-8 bg-gray-100 rounded overflow-hidden">
                                                    <div
                                                        className="bg-[#3A81F3]"
                                                        style={{
                                                            width: `${(parseFloat(item.prepaid_earnings) / parseFloat(item.total_earnings) * 100) || 0}%`,
                                                        }}
                                                        title={`Prepaid: ₱${parseFloat(item.prepaid_earnings || 0).toFixed(2)}`}
                                                    />
                                                    <div
                                                        className="bg-[#274b46]"
                                                        style={{
                                                            width: `${(parseFloat(item.cash_earnings) / parseFloat(item.total_earnings) * 100) || 0}%`,
                                                        }}
                                                        title={`Cash: ₱${parseFloat(item.cash_earnings || 0).toFixed(2)}`}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-black/50">
                                                    <span>💳 Prepaid: ₱{parseFloat(item.prepaid_earnings || 0).toFixed(2)}</span>
                                                    <span>💵 Cash: ₱{parseFloat(item.cash_earnings || 0).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div> */}

                                {/* Statistics */}
                                {statistics && (
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-white border border-gray-300 rounded-xl p-6">
                                            <h4 className="font-semibold mb-4 text-black/80">Most Profitable Experience</h4>
                                            {statistics.top_experience ? (
                                                <div>
                                                    <p className="text-lg font-medium text-black/70">
                                                        {statistics.top_experience.experience_title}
                                                    </p>
                                                    <p className="text-2xl font-bold text-black/80 mt-2">
                                                        ₱{parseFloat(statistics.top_experience.total_earnings || 0).toFixed(2)}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-black/50">No data available</p>
                                            )}
                                        </div>

                                        <div className="bg-white border border-gray-300 rounded-xl p-6">
                                            <h4 className="font-semibold mb-4 text-black/80">Commission Breakdown</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-black/60">Gross Revenue:</span>
                                                    <span className="font-semibold text-black/80">
                                                        ₱{parseFloat(statistics.commission_breakdown?.total_gross || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-black/60">Platform Commission:</span>
                                                    <span className="font-semibold text-black/80">
                                                        -₱{parseFloat(statistics.commission_breakdown?.total_commission || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                                    <span className="text-black/60">Your Earnings:</span>
                                                    <span className="font-bold text-black/80">
                                                        ₱{parseFloat(statistics.commission_breakdown?.total_net || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* BY EXPERIENCE TAB */}
                        {selectedTab === "By Experience" && (
                            <div className="bg-white border border-gray-300 rounded-lg">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-black/60 uppercase">
                                                    Activity
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-black/60 uppercase">
                                                    Total Bookings
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-black/60 uppercase">
                                                    Gross Revenue
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-black/60 uppercase">
                                                    Platform Commission
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-black/60 uppercase">
                                                    Your Earnings
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-black/60 uppercase">
                                                    Prepaid
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-black/60 uppercase">
                                                    Cash Collected
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-black/60 uppercase">
                                                    Cash To Collect
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {paginate(experienceEarnings).map((exp) => (
                                                <tr key={exp.experience_id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm font-medium text-black/80">
                                                        {exp.experience_title}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center text-black/60">
                                                        {exp.total_bookings}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right text-black/80">
                                                        ₱{parseFloat(exp.gross_revenue || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right text-black/60">
                                                        ₱{parseFloat(exp.total_commission || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right font-semibold text-black/80">
                                                        ₱{parseFloat(exp.your_earnings || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right text-black/60">
                                                        ₱{parseFloat(exp.prepaid || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right text-black/60">
                                                        ₱{parseFloat(exp.cash_collected || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right text-black/60">
                                                        ₱{parseFloat(exp.cash_due || 0).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages(experienceEarnings) > 1 && (
                                    <div className="flex justify-between items-center p-4 border-t border-gray-200">
                                        <p className="text-sm text-black/60">
                                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                                            {Math.min(currentPage * ITEMS_PER_PAGE, experienceEarnings.length)} of{" "}
                                            {experienceEarnings.length}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setCurrentPage((p) =>
                                                        Math.min(totalPages(experienceEarnings), p + 1)
                                                    )
                                                }
                                                disabled={currentPage === totalPages(experienceEarnings)}
                                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TRANSACTIONS TAB */}
                        {selectedTab === "Transactions" && (
                            <div className="bg-white border border-gray-300 rounded-lg divide-y divide-gray-200">
                                {recentTransactions.length === 0 ? (
                                    <div className="py-10 text-center text-black/50">
                                        No transactions found
                                    </div>
                                ) : (
                                    recentTransactions.map((txn) => (
                                        <div
                                            key={txn.booking_id}
                                            className="p-6 hover:bg-gray-50 transition"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <p className="font-semibold text-black/80">{txn.experience_title}</p>
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded-full ${txn.transaction_type === "Cash Collected"
                                                                ? "bg-gray-100 text-black/70"
                                                                : txn.transaction_type === "Prepaid"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-gray-100 text-black/50"
                                                                }`}
                                                        >
                                                            {txn.transaction_type}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-black/60">
                                                        Booking #{txn.booking_id} • {txn.traveler_name}
                                                    </p>
                                                    <p className="text-xs text-black/50 mt-1">
                                                        {dayjs(txn.transaction_date).format("MMM D, YYYY h:mm A")}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-semibold text-black/80">
                                                        ₱{parseFloat(txn.creator_prepaid_amount || txn.creator_cash_due || 0).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* CASH TRACKER TAB */}
                        {selectedTab === "Cash Tracker" && (
                            <div className="bg-white border border-gray-300 rounded-lg divide-y divide-gray-200">
                                {cashTracker.length === 0 ? (
                                    <div className="py-10 text-center text-black/50">
                                        No outstanding cash to collect
                                    </div>
                                ) : (
                                    cashTracker.map((item) => (
                                        <div
                                            key={item.booking_id}
                                            className="p-6 hover:bg-gray-50 transition"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <p className="font-semibold text-black/80">{item.experience_title}</p>
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded-full ${item.collection_status === "Overdue"
                                                                ? "bg-gray-200 text-black/70"
                                                                : item.collection_status === "Today"
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : item.collection_status === "Ongoing"
                                                                        ? "bg-blue-100 text-blue-700"
                                                                        : "bg-gray-100 text-black/60"
                                                                }`}
                                                        >
                                                            {item.collection_status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-black/60">
                                                        {item.traveler_name} • {item.traveler_mobile || "No phone"}
                                                    </p>
                                                    <p className="text-xs text-black/50 mt-1">
                                                        Booking Date: {dayjs(item.booking_date).format("MMM D, YYYY")}
                                                    </p>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-2">
                                                    <p className="text-lg font-semibold text-black/80">
                                                        ₱{parseFloat(item.creator_cash_due || 0).toFixed(2)}
                                                    </p>
                                                    <button
                                                        onClick={() => handleMarkCashCollected(item.booking_id)}
                                                        className="px-4 py-1.5 bg-[#274b46] text-white/90 text-sm rounded-lg hover:bg-[#376a63]"
                                                    >
                                                        Mark as Collected
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* PAYOUT HISTORY TAB */}
                        {selectedTab === "Payout History" && (
                            <div className="bg-white border border-gray-300 rounded-lg divide-y divide-gray-200">
                                {payoutHistory.length === 0 ? (
                                    <div className="py-10 text-center text-black/50">
                                        No payout history available
                                    </div>
                                ) : (
                                    payoutHistory.map((payout) => (
                                        <div
                                            key={payout.payout_id}
                                            className="p-6 hover:bg-gray-50 transition"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <p className="font-semibold text-black/80">
                                                            {payout.experience_title || "Platform Payout"}
                                                        </p>
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded-full ${payout.payout_status === "completed"
                                                                ? "bg-gray-100 text-black/70"
                                                                : payout.payout_status === "processing"
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : payout.payout_status === "failed"
                                                                        ? "bg-gray-200 text-black/60"
                                                                        : "bg-gray-100 text-black/50"
                                                                }`}
                                                        >
                                                            {payout.payout_status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-black/60">
                                                        {payout.payout_type === "prepaid"
                                                            ? "Prepaid Payout"
                                                            : "Cash Collection"}
                                                    </p>
                                                    <p className="text-xs text-black/50 mt-1">
                                                        {dayjs(payout.payout_date).format("MMM D, YYYY h:mm A")}
                                                    </p>
                                                    {payout.transaction_reference && (
                                                        <p className="text-xs text-black/50 mt-1">
                                                            Ref: {payout.transaction_reference}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-black/50">Gross</p>
                                                    <p className="text-base font-medium text-black/70">
                                                        ₱{parseFloat(payout.gross_amount || 0).toFixed(2)}
                                                    </p>
                                                    <p className="text-sm text-black/50 mt-1">Net</p>
                                                    <p className="text-lg font-semibold text-black/80">
                                                        ₱{parseFloat(payout.net_amount || 0).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default EarningsManagement;