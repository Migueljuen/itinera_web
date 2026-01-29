// SubscriptionPlansPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ChevronLeft, DollarSign, Star } from "lucide-react";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";

const SubscriptionPlansPage = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [loading, setLoading] = useState(false);
    const [currentPlanId, setCurrentPlanId] = useState(null);
    const [selectedPlanId, setSelectedPlanId] = useState(null);

    // Fetch current subscription to know which plan they're on
    useEffect(() => {
        const fetchCurrentPlan = async () => {
            if (!user?.user_id) return;

            try {
                setLoading(true);
                const res = await axios.get(
                    `${API_URL}/subscription/partner/${user.user_id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const sub = res.data?.subscription;
                if (sub?.plan_id) {
                    setCurrentPlanId(sub.plan_id);
                }
            } catch (err) {
                console.error("Error fetching current plan:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentPlan();
    }, [user?.user_id, token]);

    // Plans from your subscription_plans table
    // Update these IDs to match your actual plan_id values in the database
    const PLANS = useMemo(
        () => [
            {
                plan_id: 1, // Update to match your DB
                code: "business_basic",
                name: "Business Basic",
                price: 599,
                period: "month",
                features: [
                    "Access to partner dashboard",
                    "Create & manage activities",
                    "Manage bookings",

                    "Email support",
                ],
            },
            {
                plan_id: 2, // Update to match your DB
                code: "business_pro",
                name: "Business Pro",
                price: 999,
                period: "month",
                features: [
                    "Everything in Basic",
                    "Priority listing visibility (if applicable)",

                    "Priority support",
                    "Early access to new features",
                ],
            },
        ],
        []
    );

    const selectedPlan = useMemo(
        () => PLANS.find((p) => p.plan_id === selectedPlanId),
        [PLANS, selectedPlanId]
    );

    const handleSelectPlan = (planId) => {
        setSelectedPlanId(planId);
    };

    const handleContinueToPayment = () => {
        if (!selectedPlanId) return;

        // Navigate to payment page with selected plan info
        navigate("/owner/subscription/payment", {
            state: {
                plan_id: selectedPlanId,
                plan_name: selectedPlan?.name,
                plan_price: selectedPlan?.price,
                is_renewal: selectedPlanId === currentPlanId,
            },
        });
    };

    const isCurrentPlan = (planId) => planId === currentPlanId;
    const isSelected = (planId) => planId === selectedPlanId;

    return (
        <>
            <Toaster position="top-center" />
            <div className="min-h-screen">
                <div className="">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate("/owner/subscription")}
                                    className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <ChevronLeft size={16} />
                                    Back
                                </button>
                            </div>

                            <h1 className="text-2xl font-semibold text-gray-900 mt-4">
                                Select a Plan
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Choose the plan you want to subscribe to or renew
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg">
                        <div className="py-6 px-6">
                            {loading ? (
                                <div className="py-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                    <p className="text-gray-500 mt-2">Loading...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {PLANS.map((p) => (
                                            <div
                                                key={p.plan_id}
                                                onClick={() => handleSelectPlan(p.plan_id)}
                                                className={`relative border-2 rounded-xl p-5 bg-white cursor-pointer transition-all duration-200 ${isSelected(p.plan_id)
                                                    ? "border-[#274b46] ring-2 ring-[#274b46]/20"
                                                    : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                {/* Current Plan Badge */}
                                                {isCurrentPlan(p.plan_id) && (
                                                    <div className="absolute -top-3 left-4 px-3 py-1 bg-[#274b46] text-white text-xs font-medium rounded-full flex items-center gap-1">
                                                        <Star size={12} />
                                                        Current Plan
                                                    </div>
                                                )}

                                                {/* Selected Indicator */}
                                                {isSelected(p.plan_id) && (
                                                    <div className="absolute top-4 right-4">
                                                        <div className="w-6 h-6 bg-[#274b46] rounded-full flex items-center justify-center">
                                                            <CheckCircle size={16} className="text-white" />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-start justify-between pr-8">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign size={18} className="text-black/60" />
                                                            <h3 className="text-lg font-medium text-gray-900">
                                                                {p.name}
                                                            </h3>
                                                        </div>
                                                        <p className="text-gray-600 text-sm mt-1">
                                                            ₱{p.price.toLocaleString()}/{p.period}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 space-y-2 text-sm">
                                                    {p.features.map((f) => (
                                                        <div
                                                            key={f}
                                                            className="flex items-center gap-2 text-black/70"
                                                        >
                                                            <CheckCircle size={16} className="text-black/60" />
                                                            <span>{f}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Renewal vs Change indicator */}
                                                {isSelected(p.plan_id) && (
                                                    <div className="mt-4 pt-3 border-t border-gray-100">
                                                        {isCurrentPlan(p.plan_id) ? (
                                                            <p className="text-xs text-green-600 font-medium">
                                                                ✓ Renewing this plan will extend your current period
                                                            </p>
                                                        ) : (
                                                            <p className="text-xs text-amber-600 font-medium">
                                                                ⚠ Changing plans will reset your billing period to start today
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Continue Button */}
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="text-sm text-black/60">
                                            {selectedPlan ? (
                                                <span>
                                                    Selected:{" "}
                                                    <span className="font-medium text-black/80">
                                                        {selectedPlan.name}
                                                    </span>{" "}
                                                    — ₱{selectedPlan.price.toLocaleString()}/month
                                                </span>
                                            ) : (
                                                <span>Select a plan to continue</span>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleContinueToPayment}
                                            disabled={!selectedPlanId}
                                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${selectedPlanId
                                                ? "bg-[#274b46] text-white hover:bg-[#376a63]"
                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                }`}
                                        >
                                            Continue to Payment
                                        </button>
                                    </div>

                                    <p className="text-xs text-black/50 mt-4">
                                        After selecting a plan, you'll be directed to upload your
                                        payment proof. Payments are reviewed by admin and your
                                        subscription will be activated/extended upon approval.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SubscriptionPlansPage;