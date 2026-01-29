import React, { useEffect, useState } from "react";
import {
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Clock,
    CheckCircle,
    X,
    ChevronUp,
} from "lucide-react";
import axios from "axios";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import toast, { Toaster } from "react-hot-toast";

const EarningsManagement = () => {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [expandedExperience, setExpandedExperience] = useState(null);

    // Data states
    const [overview, setOverview] = useState(null);
    const [experienceEarnings, setExperienceEarnings] = useState([]);
    const [experienceBookings, setExperienceBookings] = useState({});
    const [loadingBookings, setLoadingBookings] = useState({});

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Date filter states
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: dayjs().subtract(30, "days").format("YYYY-MM-DD"),
        endDate: dayjs().format("YYYY-MM-DD"),
    });
    const [tempDateRange, setTempDateRange] = useState(dateRange);
    const [selectedPreset, setSelectedPreset] = useState("last30days");

    const headers = { Authorization: `Bearer ${token}` };

    const datePresets = [
        { label: "Today", value: "today", days: 0 },
        { label: "Last 7 Days", value: "last7days", days: 7 },
        { label: "Last 30 Days", value: "last30days", days: 30 },
        { label: "Last 90 Days", value: "last90days", days: 90 },
        { label: "This Month", value: "thisMonth", special: "month" },
        { label: "Last Month", value: "lastMonth", special: "lastMonth" },
        { label: "This Year", value: "thisYear", special: "year" },
        { label: "Custom", value: "custom", special: "custom" },
    ];

    const applyDatePreset = (preset) => {
        setSelectedPreset(preset.value);
        let start, end = dayjs().format("YYYY-MM-DD");

        if (preset.special === "month") {
            start = dayjs().startOf("month").format("YYYY-MM-DD");
        } else if (preset.special === "lastMonth") {
            start = dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD");
            end = dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD");
        } else if (preset.special === "year") {
            start = dayjs().startOf("year").format("YYYY-MM-DD");
        } else if (preset.special === "custom") {
            return;
        } else {
            start = dayjs().subtract(preset.days, "days").format("YYYY-MM-DD");
        }

        setTempDateRange({ startDate: start, endDate: end });
    };

    const handleApplyDateFilter = () => {
        setDateRange(tempDateRange);
        setShowDateFilter(false);
        setCurrentPage(1);
        setExpandedExperience(null);
        setExperienceBookings({});
        toast.success(`Filter applied: ${dayjs(tempDateRange.startDate).format("MMM D, YYYY")} - ${dayjs(tempDateRange.endDate).format("MMM D, YYYY")}`);
    };

    const handleResetDateFilter = () => {
        const defaultRange = {
            startDate: dayjs().subtract(30, "days").format("YYYY-MM-DD"),
            endDate: dayjs().format("YYYY-MM-DD"),
        };
        setTempDateRange(defaultRange);
        setDateRange(defaultRange);
        setSelectedPreset("last30days");
        setShowDateFilter(false);
    };

    const fetchOverview = async () => {
        try {
            const response = await axios.get(`${API_URL}/earnings/overview`, {
                headers,
                params: { startDate: dateRange.startDate, endDate: dateRange.endDate },
            });
            setOverview(response.data.overview);
        } catch (error) {
            console.error("Error fetching overview:", error);
            toast.error("Failed to load earnings overview");
        }
    };

    const fetchExperienceEarnings = async () => {
        try {
            const response = await axios.get(`${API_URL}/earnings/by-experience`, {
                headers,
                params: { startDate: dateRange.startDate, endDate: dateRange.endDate },
            });
            setExperienceEarnings(response.data.experiences);
        } catch (error) {
            console.error("Error fetching experience earnings:", error);
        }
    };

    const fetchBookingsForExperience = async (experienceId) => {
        if (experienceBookings[experienceId]) return;

        setLoadingBookings(prev => ({ ...prev, [experienceId]: true }));
        try {
            const response = await axios.get(`${API_URL}/earnings/experience-bookings/${experienceId}`, {
                headers,
                params: { startDate: dateRange.startDate, endDate: dateRange.endDate },
            });
            setExperienceBookings(prev => ({
                ...prev,
                [experienceId]: response.data.bookings
            }));
        } catch (error) {
            console.error("Error fetching experience bookings:", error);
            toast.error("Failed to load bookings");
        } finally {
            setLoadingBookings(prev => ({ ...prev, [experienceId]: false }));
        }
    };

    const handleExpandExperience = (experienceId) => {
        if (expandedExperience === experienceId) {
            setExpandedExperience(null);
        } else {
            setExpandedExperience(experienceId);
            fetchBookingsForExperience(experienceId);
        }
    };

    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchOverview(), fetchExperienceEarnings()]);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.user_id) loadAllData();
    }, [user, dateRange]);

    const paginate = (data) => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    };

    const totalPages = (data) => Math.ceil(data.length / ITEMS_PER_PAGE);

    const getDateRangeLabel = () => {
        const preset = datePresets.find(p => p.value === selectedPreset);
        if (preset && preset.value !== "custom") return preset.label;
        return `${dayjs(dateRange.startDate).format("MMM D, YYYY")} - ${dayjs(dateRange.endDate).format("MMM D, YYYY")}`;
    };

    const formatCurrency = (amount) => `₱${parseFloat(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <>
            <Toaster position="top-center" />

            <div className="min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Earnings</h1>
                        <p className="text-black/60 mt-1">Track your income by experience and booking</p>
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDateFilter(!showDateFilter)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Calendar size={16} />
                            <span className="text-base">{getDateRangeLabel()}</span>
                            <ChevronDown size={16} />
                        </button>

                        {showDateFilter && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowDateFilter(false)} />
                                <div className="absolute right-0 mt-2 w-[420px] bg-white border border-gray-300 rounded-xl shadow-lg z-50">
                                    <div className="p-4 border-b border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-gray-900">Filter by Date</h3>
                                            <button onClick={() => setShowDateFilter(false)} className="p-1 hover:bg-gray-100 rounded">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            {datePresets.map((preset) => (
                                                <button
                                                    key={preset.value}
                                                    onClick={() => applyDatePreset(preset)}
                                                    className={`px-3 py-2 text-sm rounded-lg border transition ${selectedPreset === preset.value
                                                        ? "bg-[#274b46] text-white border-[#274b46]"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    value={tempDateRange.startDate}
                                                    onChange={(e) => {
                                                        setTempDateRange({ ...tempDateRange, startDate: e.target.value });
                                                        setSelectedPreset("custom");
                                                    }}
                                                    max={tempDateRange.endDate}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#274b46] focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                                <input
                                                    type="date"
                                                    value={tempDateRange.endDate}
                                                    onChange={(e) => {
                                                        setTempDateRange({ ...tempDateRange, endDate: e.target.value });
                                                        setSelectedPreset("custom");
                                                    }}
                                                    min={tempDateRange.startDate}
                                                    max={dayjs().format("YYYY-MM-DD")}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#274b46] focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-gray-200 flex gap-3">
                                        <button onClick={handleResetDateFilter} className="flex-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                            Reset
                                        </button>
                                        <button onClick={handleApplyDateFilter} className="flex-1 px-4 py-2 text-sm text-white bg-[#274b46] rounded-lg hover:bg-[#376a63]">
                                            Apply Filter
                                        </button>
                                    </div>
                                </div>
                            </>
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
                        {/* Summary Cards */}
                        {overview && (
                            <div className="grid grid-cols-3 gap-6 mb-8">
                                <div className="bg-white border border-gray-300 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm text-black/60">Total Earnings</p>
                                        <TrendingUp size={18} className="text-black/40" />
                                    </div>
                                    <p className="text-2xl font-semibold text-black/80">{formatCurrency(overview.total_earnings)}</p>
                                    <p className="text-sm text-black/50 mt-1">From paid bookings</p>
                                </div>

                                <div className="bg-white border border-gray-300 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm text-black/60">Completed</p>
                                        <CheckCircle size={18} className="text-black/40" />
                                    </div>
                                    <p className="text-2xl font-semibold text-black/80">{formatCurrency(overview.completed_earnings)}</p>
                                    <p className="text-sm text-black/50 mt-1">Finished bookings</p>
                                </div>

                                <div className="bg-white border border-gray-300 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm text-black/60">Pending Payment</p>
                                        <Clock size={18} className="text-black/40" />
                                    </div>
                                    <p className="text-2xl font-semibold text-black/80">{formatCurrency(overview.pending_payment)}</p>
                                    <p className="text-sm text-black/50 mt-1">Awaiting payment</p>
                                </div>
                            </div>
                        )}

                        {/* Earnings by Experience */}
                        <div className="bg-white border border-gray-300 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="font-semibold text-black/80">Earnings by Experience</h2>
                                <p className="text-sm text-black/50 mt-1">Click on an experience to view individual bookings</p>
                            </div>

                            {experienceEarnings.length === 0 ? (
                                <div className="py-16 text-center text-black/50">No earnings found for this period</div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {paginate(experienceEarnings).map((exp) => (
                                        <div key={exp.experience_id}>
                                            <button
                                                onClick={() => handleExpandExperience(exp.experience_id)}
                                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-black/80">{exp.experience_title}</p>
                                                    <p className="text-sm text-black/50 mt-1">
                                                        {exp.total_bookings} booking{exp.total_bookings !== 1 ? 's' : ''} · {exp.total_guests} guest{exp.total_guests !== 1 ? 's' : ''}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-right min-w-[120px]">
                                                        <p className="text-sm text-black/50">Total Revenue</p>
                                                        <p className="font-semibold text-black/80">{formatCurrency(exp.total_revenue)}</p>
                                                    </div>
                                                    {expandedExperience === exp.experience_id ? (
                                                        <ChevronUp size={20} className="text-black/40" />
                                                    ) : (
                                                        <ChevronDown size={20} className="text-black/40" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Expanded Bookings */}
                                            {expandedExperience === exp.experience_id && (
                                                <div className="bg-gray-50 border-t border-gray-200">
                                                    {loadingBookings[exp.experience_id] ? (
                                                        <div className="py-8 text-center">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto"></div>
                                                            <p className="text-sm text-black/50 mt-2">Loading bookings...</p>
                                                        </div>
                                                    ) : experienceBookings[exp.experience_id]?.length === 0 ? (
                                                        <div className="py-8 text-center text-black/50 text-sm">No bookings found</div>
                                                    ) : (
                                                        <div className="divide-y divide-gray-200">
                                                            <div className="px-6 py-3 grid grid-cols-12 gap-4 text-xs font-medium text-black/50 uppercase">
                                                                <div className="col-span-2">Booking</div>
                                                                <div className="col-span-2">Date</div>
                                                                <div className="col-span-3">Traveler</div>
                                                                <div className="col-span-1 text-center">Guests</div>
                                                                <div className="col-span-2 text-right">Amount</div>
                                                                <div className="col-span-2 text-center">Status</div>
                                                            </div>

                                                            {experienceBookings[exp.experience_id]?.map((booking) => (
                                                                <div key={booking.booking_id} className="px-6 py-3 grid grid-cols-12 gap-4 items-center text-sm hover:bg-gray-100">
                                                                    <div className="col-span-2 text-black/70">#{booking.booking_id}</div>
                                                                    <div className="col-span-2 text-black/60">{dayjs(booking.booking_date).format("MMM D, YYYY")}</div>
                                                                    <div className="col-span-3 text-black/70 truncate">{booking.traveler_name}</div>
                                                                    <div className="col-span-1 text-center text-black/60">{booking.guest_count || 1}</div>
                                                                    <div className="col-span-2 text-right font-medium text-black/80">{formatCurrency(booking.activity_price)}</div>
                                                                    <div className="col-span-2 flex justify-center gap-2">
                                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${booking.status === 'Completed' ? 'bg-green-100 text-green-700'
                                                                                : booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-700'
                                                                                    : booking.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-700'
                                                                                        : booking.status === 'Cancelled' ? 'bg-red-100 text-red-600'
                                                                                            : 'bg-gray-100 text-gray-600'
                                                                            }`}>
                                                                            {booking.status}
                                                                        </span>
                                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${booking.payment_status === 'Paid' ? 'bg-green-100 text-green-700'
                                                                                : booking.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-700'
                                                                                    : 'bg-gray-100 text-gray-600'
                                                                            }`}>
                                                                            {booking.payment_status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {totalPages(experienceEarnings) > 1 && (
                                <div className="flex justify-between items-center p-4 border-t border-gray-200">
                                    <p className="text-sm text-black/60">
                                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, experienceEarnings.length)} of {experienceEarnings.length} experiences
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
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages(experienceEarnings), p + 1))}
                                            disabled={currentPage === totalPages(experienceEarnings)}
                                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default EarningsManagement;