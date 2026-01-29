import React, { useState, useEffect } from "react";
import {
    User,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    CreditCard,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    ExternalLink,
    Eye,
    Calendar,
    AlertCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import axios from "axios";

const SubscriptionManagement = () => {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState("subscriptions"); // subscriptions | payments
    const [loading, setLoading] = useState(false);

    // Subscriptions state
    const [subscriptions, setSubscriptions] = useState([]);
    const [subscriptionSearch, setSubscriptionSearch] = useState("");
    const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState("All");
    const [subscriptionPage, setSubscriptionPage] = useState(1);

    // Payments state
    const [payments, setPayments] = useState([]);
    const [paymentSearch, setPaymentSearch] = useState("");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
    const [paymentPage, setPaymentPage] = useState(1);

    // Modal state for payment approval/rejection
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const itemsPerPage = 12;

    // Fetch subscriptions
    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/admin/subscriptions`);
            setSubscriptions(response.data?.subscriptions || []);
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
            setSubscriptions([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch payments
    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/admin/subscriptions/all-subscription-payments`);
            setPayments(response.data?.payments || []);
        } catch (error) {
            console.error("Error fetching payments:", error);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "subscriptions") {
            fetchSubscriptions();
        } else {
            fetchPayments();
        }
    }, [activeTab]);

    // Reset page when filters change
    useEffect(() => {
        setSubscriptionPage(1);
    }, [subscriptionSearch, subscriptionStatusFilter]);

    useEffect(() => {
        setPaymentPage(1);
    }, [paymentSearch, paymentStatusFilter]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Format date with time
    const formatDateTime = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Get subscription status style
    const getSubscriptionStatusStyle = (status) => {
        const s = String(status || "").toLowerCase();
        if (s === "active") return "bg-green-50 text-green-700";
        if (s === "trialing") return "bg-blue-50 text-blue-700";
        if (s === "expired") return "bg-amber-50 text-amber-700";
        if (s === "canceled") return "bg-red-50 text-red-700";
        return "bg-gray-50 text-gray-700";
    };

    // Get payment status style
    const getPaymentStatusStyle = (status) => {
        const s = String(status || "").toLowerCase();
        if (s === "paid") return "bg-green-50 text-green-700";
        if (s === "pending") return "bg-amber-50 text-amber-700";
        if (s === "rejected") return "bg-red-50 text-red-700";
        return "bg-gray-50 text-gray-700";
    };

    // Get plan display name
    const getPlanDisplayName = (subscription) => {
        if (!subscription.plan) return "—";
        const tier = subscription.plan.tier ? subscription.plan.tier.charAt(0).toUpperCase() + subscription.plan.tier.slice(1) : "";
        const partnerClass = subscription.plan.partner_class ? subscription.plan.partner_class.charAt(0).toUpperCase() + subscription.plan.partner_class.slice(1) : "";
        return `${partnerClass} ${tier}`;
    };

    // Check if subscription is expiring soon (within 7 days)
    const isExpiringSoon = (endDate) => {
        if (!endDate) return false;
        const end = new Date(endDate);
        const now = new Date();
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 7;
    };

    // Check if subscription is expired
    const isExpired = (endDate) => {
        if (!endDate) return false;
        return new Date(endDate) < new Date();
    };

    // Handle payment approval
    const handleApprovePayment = async (payment) => {
        try {
            setActionLoading(true);
            await axios.post(`${API_URL}/admin/subscriptions/subscription-payments/${payment.subscription_payment_id}/approve`);

            // Refresh payments list
            await fetchPayments();
            setSelectedPayment(null);
        } catch (error) {
            console.error("Error approving payment:", error);
            alert("Failed to approve payment. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    // Handle payment rejection
    const handleRejectPayment = async (payment) => {
        try {
            setActionLoading(true);
            await axios.post(`${API_URL}/admin/subscriptions/subscription-payments/${payment.subscription_payment_id}/reject`);

            // Refresh payments list
            await fetchPayments();
            setSelectedPayment(null);
        } catch (error) {
            console.error("Error rejecting payment:", error);
            alert("Failed to reject payment. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    // Filter subscriptions
    const filteredSubscriptions = subscriptions.filter((sub) => {
        const partnerName = `${sub.partner?.first_name || ""} ${sub.partner?.last_name || ""}`.toLowerCase();
        const partnerEmail = (sub.partner?.email || "").toLowerCase();
        const q = subscriptionSearch.toLowerCase().trim();

        const matchesSearch = !q || partnerName.includes(q) || partnerEmail.includes(q);
        const matchesStatus = subscriptionStatusFilter === "All" ||
            (sub.status || "").toLowerCase() === subscriptionStatusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    // Filter payments
    const filteredPayments = payments.filter((payment) => {
        const partnerName = `${payment.partner?.first_name || ""} ${payment.partner?.last_name || ""}`.toLowerCase();
        const partnerEmail = (payment.partner?.email || "").toLowerCase();
        const reference = (payment.gcash_reference || "").toLowerCase();
        const q = paymentSearch.toLowerCase().trim();

        const matchesSearch = !q || partnerName.includes(q) || partnerEmail.includes(q) || reference.includes(q);
        const matchesStatus = paymentStatusFilter === "All" ||
            (payment.status || "").toLowerCase() === paymentStatusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    // Pagination for subscriptions
    const subscriptionTotalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
    const subscriptionStartIndex = (subscriptionPage - 1) * itemsPerPage;
    const paginatedSubscriptions = filteredSubscriptions.slice(
        subscriptionStartIndex,
        subscriptionStartIndex + itemsPerPage
    );

    // Pagination for payments
    const paymentTotalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const paymentStartIndex = (paymentPage - 1) * itemsPerPage;
    const paginatedPayments = filteredPayments.slice(
        paymentStartIndex,
        paymentStartIndex + itemsPerPage
    );

    // Get counts for tab badges
    const pendingPaymentsCount = payments.filter(p => p.status === "pending").length;

    return (
        <div className="min-h-screen pb-48">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Subscription Management</h1>
                    <p className="text-black/60 mt-1">Manage partner subscriptions and payment approvals</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg mb-6">
                <div className="py-4">
                    <div className="flex justify-between items-center">
                        {/* Tab Navigation */}
                        <div className="flex rounded-lg w-fit p-2">
                            <button
                                onClick={() => setActiveTab("subscriptions")}
                                className={`px-8 font-medium transition-colors py-2 rounded-lg flex items-center gap-2 ${activeTab === "subscriptions"
                                        ? "bg-white text-black/80 shadow-sm"
                                        : "text-black/50 hover:text-black/70"
                                    }`}
                            >
                                <Users size={18} />
                                Subscriptions
                            </button>
                            <button
                                onClick={() => setActiveTab("payments")}
                                className={`px-8 font-medium transition-colors py-2 rounded-lg flex items-center gap-2 ${activeTab === "payments"
                                        ? "bg-white text-black/80 shadow-sm"
                                        : "text-black/50 hover:text-black/70"
                                    }`}
                            >
                                <CreditCard size={18} />
                                Payments
                                {pendingPaymentsCount > 0 && (
                                    <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {pendingPaymentsCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-4">
                            {activeTab === "subscriptions" ? (
                                <>
                                    {/* Status Filter */}
                                    <div className="relative">
                                        <select
                                            value={subscriptionStatusFilter}
                                            onChange={(e) => setSubscriptionStatusFilter(e.target.value)}
                                            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black/80"
                                        >
                                            <option value="All">All statuses</option>
                                            <option value="trialing">Trialing</option>
                                            <option value="active">Active</option>
                                            <option value="expired">Expired</option>
                                            <option value="canceled">Canceled</option>
                                        </select>
                                        <ChevronDown
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            size={18}
                                        />
                                    </div>

                                    {/* Search */}
                                    <div className="relative h-fit">
                                        <Search
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            size={20}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search partners..."
                                            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={subscriptionSearch}
                                            onChange={(e) => setSubscriptionSearch(e.target.value)}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Payment Status Filter */}
                                    <div className="relative">
                                        <select
                                            value={paymentStatusFilter}
                                            onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black/80"
                                        >
                                            <option value="All">All statuses</option>
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                        <ChevronDown
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            size={18}
                                        />
                                    </div>

                                    {/* Search */}
                                    <div className="relative h-fit">
                                        <Search
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            size={20}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search by name or reference..."
                                            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={paymentSearch}
                                            onChange={(e) => setPaymentSearch(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg">
                {loading ? (
                    <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
                        <p className="text-gray-500 mt-2">Loading...</p>
                    </div>
                ) : activeTab === "subscriptions" ? (
                    /* SUBSCRIPTIONS TABLE */
                    <div className="divide-y divide-gray-200">
                        {paginatedSubscriptions.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-gray-500">No subscriptions found</p>
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="bg-[#f8f8f8] px-4 rounded-t-lg py-4 grid grid-cols-[1fr_140px_120px_140px_140px_100px] gap-4 items-center text-sm font-medium text-black/90">
                                    <div>Partner</div>
                                    <div className="text-center">Plan</div>
                                    <div className="text-center">Status</div>
                                    <div className="text-center">Started</div>
                                    <div className="text-center">Expires</div>
                                    <div className="text-center">Price</div>
                                </div>

                                {/* Rows */}
                                {paginatedSubscriptions.map((sub) => (
                                    <div key={sub.subscription_id} className="py-4 hover:bg-gray-50">
                                        <div className="px-4 grid grid-cols-[1fr_140px_120px_140px_140px_100px] gap-4 items-center">
                                            {/* Partner */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {sub.partner?.profile_pic ? (
                                                        <img
                                                            src={`${API_URL}/${sub.partner.profile_pic}`}
                                                            alt={`${sub.partner.first_name} ${sub.partner.last_name}`}
                                                            className="object-cover w-full h-full rounded-lg"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <User size={18} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-medium text-sm text-black/80 truncate">
                                                        {sub.partner?.first_name} {sub.partner?.last_name}
                                                    </h3>
                                                    <p className="text-sm text-black/60 truncate">
                                                        {sub.partner?.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Plan */}
                                            <div className="text-center">
                                                <span className="text-sm text-black/80">
                                                    {getPlanDisplayName(sub)}
                                                </span>
                                            </div>

                                            {/* Status */}
                                            <div className="text-center">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getSubscriptionStatusStyle(
                                                        sub.status
                                                    )}`}
                                                >
                                                    {sub.status || "—"}
                                                </span>
                                            </div>

                                            {/* Started */}
                                            <div className="text-center text-sm text-black/70">
                                                {formatDate(sub.started_at)}
                                            </div>

                                            {/* Expires */}
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {isExpiringSoon(sub.current_period_end) && (
                                                        <AlertCircle size={14} className="text-amber-500" />
                                                    )}
                                                    {isExpired(sub.current_period_end) && (
                                                        <AlertCircle size={14} className="text-red-500" />
                                                    )}
                                                    <span
                                                        className={`text-sm ${isExpired(sub.current_period_end)
                                                                ? "text-red-600"
                                                                : isExpiringSoon(sub.current_period_end)
                                                                    ? "text-amber-600"
                                                                    : "text-black/70"
                                                            }`}
                                                    >
                                                        {formatDate(sub.current_period_end)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-center text-sm text-black/80 font-medium">
                                                ₱{sub.plan?.price_php?.toLocaleString() || "—"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                ) : (
                    /* PAYMENTS TABLE */
                    <div className="divide-y divide-gray-200">
                        {paginatedPayments.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-gray-500">No payments found</p>
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="bg-[#f8f8f8] px-4 rounded-t-lg py-4 grid grid-cols-[1fr_120px_120px_140px_100px_140px_120px] gap-4 items-center text-sm font-medium text-black/90">
                                    <div>Partner</div>
                                    <div className="text-center">Plan</div>
                                    <div className="text-center">Amount</div>
                                    <div className="text-center">Reference</div>
                                    <div className="text-center">Status</div>
                                    <div className="text-center">Submitted</div>
                                    <div className="text-center">Actions</div>
                                </div>

                                {/* Rows */}
                                {paginatedPayments.map((payment) => (
                                    <div key={payment.subscription_payment_id} className="py-4 hover:bg-gray-50">
                                        <div className="px-4 grid grid-cols-[1fr_120px_120px_140px_100px_140px_120px] gap-4 items-center">
                                            {/* Partner */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {payment.partner?.profile_pic ? (
                                                        <img
                                                            src={`${API_URL}/${payment.partner.profile_pic}`}
                                                            alt={`${payment.partner.first_name} ${payment.partner.last_name}`}
                                                            className="object-cover w-full h-full rounded-lg"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <User size={18} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-medium text-sm text-black/80 truncate">
                                                        {payment.partner?.first_name} {payment.partner?.last_name}
                                                    </h3>
                                                    <p className="text-sm text-black/60 truncate">
                                                        {payment.partner?.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Plan */}
                                            <div className="text-center">
                                                {payment.payment_plan ? (
                                                    <span className="text-sm text-black/80 capitalize">
                                                        {payment.payment_plan.partner_class} {payment.payment_plan.tier}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-black/50">—</span>
                                                )}
                                            </div>

                                            {/* Amount */}
                                            <div className="text-center text-sm text-black/80 font-medium">
                                                ₱{payment.amount_php?.toLocaleString() || "—"}
                                            </div>

                                            {/* Reference */}
                                            <div className="text-center">
                                                <span className="text-sm text-black/70 font-mono">
                                                    {payment.gcash_reference || "—"}
                                                </span>
                                            </div>

                                            {/* Status */}
                                            <div className="text-center">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getPaymentStatusStyle(
                                                        payment.status
                                                    )}`}
                                                >
                                                    {payment.status || "—"}
                                                </span>
                                            </div>

                                            {/* Submitted */}
                                            <div className="text-center text-sm text-black/70">
                                                {formatDate(payment.created_at)}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-center gap-2">
                                                {payment.proof_url && (
                                                    <button
                                                        onClick={() => window.open(`${API_URL}/${payment.proof_url}`, "_blank")}
                                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View proof"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </button>
                                                )}

                                                {payment.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprovePayment(payment)}
                                                            disabled={actionLoading}
                                                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Approve payment"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectPayment(payment)}
                                                            disabled={actionLoading}
                                                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Reject payment"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}

                                                {payment.status === "paid" && (
                                                    <span className="text-xs text-green-600">
                                                        {formatDate(payment.paid_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {activeTab === "subscriptions" && subscriptionTotalPages > 1 && (
                <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Showing {subscriptionStartIndex + 1}-
                        {Math.min(subscriptionStartIndex + itemsPerPage, filteredSubscriptions.length)} of{" "}
                        {filteredSubscriptions.length} subscriptions
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSubscriptionPage((prev) => Math.max(1, prev - 1))}
                            disabled={subscriptionPage === 1}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {[...Array(Math.min(5, subscriptionTotalPages))].map((_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => setSubscriptionPage(page)}
                                    className={`px-3 py-2 border rounded-lg ${subscriptionPage === page
                                            ? "bg-[#274b46] text-white/90 cursor-pointer hover:bg-[#376a63]"
                                            : "border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setSubscriptionPage((prev) => Math.min(subscriptionTotalPages, prev + 1))}
                            disabled={subscriptionPage === subscriptionTotalPages}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "payments" && paymentTotalPages > 1 && (
                <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Showing {paymentStartIndex + 1}-
                        {Math.min(paymentStartIndex + itemsPerPage, filteredPayments.length)} of{" "}
                        {filteredPayments.length} payments
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPaymentPage((prev) => Math.max(1, prev - 1))}
                            disabled={paymentPage === 1}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {[...Array(Math.min(5, paymentTotalPages))].map((_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => setPaymentPage(page)}
                                    className={`px-3 py-2 border rounded-lg ${paymentPage === page
                                            ? "bg-[#274b46] text-white/90 cursor-pointer hover:bg-[#376a63]"
                                            : "border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setPaymentPage((prev) => Math.min(paymentTotalPages, prev + 1))}
                            disabled={paymentPage === paymentTotalPages}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement;