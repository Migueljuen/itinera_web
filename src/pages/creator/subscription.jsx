// SubscriptionPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    DollarSign,
    CheckCircle,
    Clock,
    CreditCard,
    Mail,
    Download,
    ChevronRight,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";

const SubscriptionPage = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [loading, setLoading] = useState(false);

    // From backend:
    // res.data.subscription
    // res.data.latest_registration_payment
    // res.data.subscription_payments
    const [sub, setSub] = useState(null);
    const [latestRegPayment, setLatestRegPayment] = useState(null);
    const [subscriptionPayments, setSubscriptionPayments] = useState([]);

    // IMPORTANT INFO (matches your partner pricing decision)
    const PRICING = useMemo(
        () => ({
            registrationFee: 1299,
            includesFreeDays: 30,
        }),
        []
    );

    const statusPill = (status) => {
        const s = (status || "").toLowerCase();
        const base =
            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border";

        if (s === "active") {
            return (
                <span className={`${base} bg-green-50 border-green-200 text-green-700`}>
                    Active
                </span>
            );
        }

        if (s === "trialing" || s === "trial") {
            return (
                <span className={`${base} bg-blue-50 border-blue-200 text-blue-700`}>
                    Trial
                </span>
            );
        }

        if (s === "expired" || s === "inactive") {
            return (
                <span className={`${base} bg-gray-50 border-gray-200 text-gray-700`}>
                    Expired
                </span>
            );
        }

        if (s === "canceled" || s === "cancelled") {
            return (
                <span className={`${base} bg-gray-50 border-gray-200 text-gray-700`}>
                    <Clock size={14} /> Canceled
                </span>
            );
        }

        return (
            <span className={`${base} bg-gray-50 border-gray-200 text-gray-700`}>
                <Clock size={14} /> {status || "Unknown"}
            </span>
        );
    };

    // Payment status pill (for registration & subscription payments)
    const paymentPill = (status) => {
        const s = (status || "").toLowerCase();
        const base =
            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border";

        if (s === "paid") {
            return (
                <span className={`${base} bg-green-50 border-green-200 text-green-700`}>
                    <CheckCircle size={14} /> Paid
                </span>
            );
        }

        if (s === "pending") {
            return (
                <span
                    className={`${base} bg-yellow-50 border-yellow-200 text-yellow-700`}
                >
                    <Clock size={14} /> Pending Review
                </span>
            );
        }

        if (s === "rejected") {
            return (
                <span className={`${base} bg-red-50 border-red-200 text-red-700`}>
                    <Clock size={14} /> Rejected
                </span>
            );
        }

        return (
            <span className={`${base} bg-gray-50 border-gray-200 text-gray-700`}>
                <Clock size={14} /> {status || "N/A"}
            </span>
        );
    };

    const fetchSubscription = async () => {
        if (!user?.user_id) return;

        try {
            setLoading(true);

            const res = await axios.get(
                `${API_URL}/subscription/partner/${user.user_id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setSub(res.data?.subscription || null);
            setLatestRegPayment(res.data?.latest_registration_payment || null);
            setSubscriptionPayments(res.data?.subscription_payments || []);
        } catch (err) {
            console.error("fetchSubscription error:", err);
            toast.error("Failed to load subscription details");
            setSub(null);
            setLatestRegPayment(null);
            setSubscriptionPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.user_id) fetchSubscription();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.user_id]);

    const goToUploadProof = () => {
        // You can handle inside that page whether it's registration or renewal
        navigate("/owner/subscription/plans");
    };

    const formatDate = (v) => {
        if (!v) return "N/A";
        const d = dayjs(v);
        if (!d.isValid()) return "N/A";
        return d.format("MMM D, YYYY");
    };

    const planLabel = useMemo(() => {
        if (!sub?.plan_id) return "Not set";
        // If you later add a plans table + return plan name from backend, replace this with sub.plan_name.
        return `Plan #${sub.plan_id}`;
    }, [sub?.plan_id]);

    // ✅ Registration banner message (indicator upon partner registration)
    const registrationBanner = useMemo(() => {
        // If no payment record yet, partner hasn't submitted proof
        if (!latestRegPayment) {
            return {
                show: true,
                className: "mb-6 border border-yellow-200 bg-yellow-50 rounded-xl p-4",
                text: (
                    <p className="text-sm text-yellow-800">
                        <strong>Registration payment required.</strong>{" "}
                        Complete the one-time registration fee to activate your free trial.
                    </p>
                ),
            };
        }

        const s = (latestRegPayment.status || "").toLowerCase();

        if (s === "pending") {
            return {
                show: true,
                className: "mb-6 border border-yellow-200 bg-yellow-50 rounded-xl p-4",
                text: (
                    <p className="text-sm text-yellow-800">
                        <strong>Registration payment submitted.</strong> Awaiting admin
                        approval.
                    </p>
                ),
            };
        }

        if (s === "paid") {
            return {
                show: true,
                className: "mb-6 border border-green-200 bg-green-50 rounded-xl p-4",
                text: (
                    <p className="text-sm text-green-800">
                        <strong>Registration approved.</strong> Your{" "}
                        {PRICING.includesFreeDays}-day free trial is active.
                    </p>
                ),
            };
        }

        if (s === "rejected") {
            return {
                show: true,
                className: "mb-6 border border-red-200 bg-red-50 rounded-xl p-4",
                text: (
                    <p className="text-sm text-red-800">
                        <strong>Registration payment rejected.</strong> Please upload a new
                        payment proof.
                    </p>
                ),
            };
        }

        // Unknown status: don't spam a banner, but keep box details
        return { show: false };
    }, [latestRegPayment, PRICING.includesFreeDays]);

    return (
        <>
            <Toaster position="top-center" />
            <div className="min-h-screen">
                <div className="">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Subscription
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage your partner plan, billing, and payments
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={fetchSubscription}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <Clock size={16} />
                                Refresh
                            </button>

                            <button
                                onClick={goToUploadProof}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <CreditCard size={16} />
                                Pay / Upload Proof
                            </button>
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-lg">
                        <div className="divide-y divide-gray-200">
                            {loading ? (
                                <div className="py-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                    <p className="text-gray-500 mt-2">Loading subscription...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Overview Section */}
                                    <div className="py-6 px-6">
                                        {/* ✅ Registration Indicator Banner */}
                                        {/* {registrationBanner?.show && (
                                            <div className={registrationBanner.className}>
                                                {registrationBanner.text}
                                            </div>
                                        )} */}

                                        <div className="flex items-start justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-lg font-medium text-gray-900">
                                                        Current Plan
                                                    </h2>
                                                </div>

                                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                                    <p className="text-gray-700">
                                                        <span className="text-black/60">Plan:</span>{" "}
                                                        <span className="font-medium">{planLabel}</span>
                                                    </p>
                                                    {statusPill(sub?.status)}
                                                </div>

                                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    <p className="text-black/60">
                                                        <span className="font-medium text-black/80">
                                                            Started:
                                                        </span>{" "}
                                                        {formatDate(sub?.started_at)}
                                                    </p>


                                                    <p className="text-black/60">
                                                        <span className="font-medium text-black/80">
                                                            Current period start:
                                                        </span>{" "}
                                                        {formatDate(sub?.current_period_start)}
                                                    </p>

                                                    <p className="text-black/60">
                                                        <span className="font-medium text-black/80">
                                                            Current period end:
                                                        </span>{" "}
                                                        {formatDate(sub?.current_period_end)}
                                                    </p>

                                                    {sub?.ended_at && (
                                                        <p className="text-black/60">
                                                            <span className="font-medium text-black/80">
                                                                Ended at:
                                                            </span>{" "}
                                                            {formatDate(sub.ended_at)}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* ✅ Link-style text (NOT a button) */}
                                                <div className="mt-5">
                                                    <span
                                                        role="link"
                                                        tabIndex={0}
                                                        onClick={() => navigate("/owner/subscription/plans")}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" || e.key === " ") {
                                                                navigate("/owner/subscription/plans");
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
                                                    >
                                                        See available plans <ChevronRight size={16} />
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Registration Payment Box */}
                                            {/* <div className="w-full max-w-[360px] border border-gray-300 rounded-xl p-4">
                                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                    <CreditCard size={16} />
                                                    Registration Payment
                                                </div>

                                                <div className="mt-3 text-sm space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-black/60">One-time fee</span>
                                                        <span className="font-medium text-black/80">
                                                            ₱{PRICING.registrationFee.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between">
                                                        <span className="text-black/60">Includes</span>
                                                        <span className="font-medium text-black/80">
                                                            {PRICING.includesFreeDays} days free
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center py-2 bg-gray-50 rounded-lg px-3 mt-2">
                                                        <span className="text-black/70 font-medium">
                                                            Status
                                                        </span>
                                                        <span className="font-medium text-black/80">
                                                            {paymentPill(latestRegPayment?.status)}
                                                        </span>
                                                    </div>

                                                    {latestRegPayment?.paid_at && (
                                                        <p className="text-black/60">
                                                            <span className="font-medium text-black/80">
                                                                Paid on:
                                                            </span>{" "}
                                                            {formatDate(latestRegPayment.paid_at)}
                                                        </p>
                                                    )}

                                                    {latestRegPayment?.gcash_reference && (
                                                        <p className="text-black/60">
                                                            <span className="font-medium text-black/80">
                                                                GCash ref:
                                                            </span>{" "}
                                                            {latestRegPayment.gcash_reference}
                                                        </p>
                                                    )}

                                                    {latestRegPayment?.proof_url && (
                                                        <p className="text-black/60">
                                                            <span className="font-medium text-black/80">
                                                                Proof:
                                                            </span>{" "}
                                                            <span
                                                                role="link"
                                                                tabIndex={0}
                                                                onClick={() =>
                                                                    window.open(
                                                                        `${API_URL}/${latestRegPayment.proof_url}`,
                                                                        "_blank"
                                                                    )
                                                                }
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter" || e.key === " ") {
                                                                        window.open(
                                                                            `${API_URL}/${latestRegPayment.proof_url}`,
                                                                            "_blank"
                                                                        );
                                                                    }
                                                                }}
                                                                className="underline cursor-pointer"
                                                            >
                                                                View
                                                            </span>
                                                        </p>
                                                    )}

                                                    <button
                                                        onClick={goToUploadProof}
                                                        className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                                    >
                                                        <CreditCard size={16} />
                                                        Pay / Upload Proof (GCash)
                                                    </button>

                                                    <p className="text-xs text-black/50">
                                                        Payments are reviewed by admin. Approval
                                                        activates/extends your subscription.
                                                    </p>
                                                </div>
                                            </div> */}
                                        </div>
                                    </div>

                                    {/* Billing History Section (from partner_subscription_payments) */}
                                    <div className="py-6 px-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <h2 className="text-lg font-medium text-gray-900">
                                                Billing History
                                            </h2>
                                        </div>

                                        {subscriptionPayments.length === 0 ? (
                                            <div className="py-6 text-center">
                                                <p className="text-gray-500">No payments yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {subscriptionPayments.map((p) => (
                                                    <div
                                                        key={p.subscription_payment_id}
                                                        className="border border-gray-300 rounded-xl px-4 py-4  bg-white"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-sm">
                                                                <p className="text-black/70 font-medium">
                                                                    Subscription payment
                                                                </p>
                                                                <p className="text-black/50 mt-1">
                                                                    {p.paid_at
                                                                        ? `Paid: ${formatDate(p.paid_at)}`
                                                                        : p.created_at
                                                                            ? `Created: ${formatDate(p.created_at)}`
                                                                            : "—"}
                                                                </p>
                                                                {p.gcash_reference && (
                                                                    <p className="text-black/50 mt-1">
                                                                        Ref: {p.gcash_reference}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-12">
                                                                <div className="text-sm text-right">
                                                                    <p className="text-black/80 font-medium">
                                                                        ₱{Number(p.amount_php || 0).toFixed(2)}
                                                                    </p>
                                                                    <p className="text-black/50">
                                                                        {paymentPill(p.status)}
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    onClick={() => {
                                                                        if (!p.proof_url) {
                                                                            toast("No proof attached.");
                                                                            return;
                                                                        }
                                                                        window.open(
                                                                            `${API_URL}/${p.proof_url}`,
                                                                            "_blank"
                                                                        );
                                                                    }}
                                                                    className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                                                >
                                                                    <Download size={16} />

                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SubscriptionPage;
