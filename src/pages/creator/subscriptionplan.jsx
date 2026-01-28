// SubscriptionPlansPage.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ChevronLeft, DollarSign } from "lucide-react";
import { Toaster } from "react-hot-toast";

const SubscriptionPlansPage = () => {
    const navigate = useNavigate();

    const PLANS = useMemo(
        () => [
            {
                id: "basic",
                name: "Business Basic",
                price: 599,
                period: "month",
                features: [
                    "Access to partner dashboard",
                    "Create & manage activities",
                    "Manage bookings",
                    "Basic analytics",
                    "Email support",
                ],
            },
            {
                id: "pro",
                name: "Business Pro",
                price: 999,
                period: "month",
                features: [
                    "Everything in Basic",
                    "Priority listing visibility (if applicable)",
                    "Advanced analytics & reports",
                    "Priority support",
                    "Early access to new features",
                ],
            },
        ],
        []
    );

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
                                Available Plans
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Choose the plan that fits your business
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg">
                        <div className="py-6 px-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {PLANS.map((p) => (
                                    <div
                                        key={p.id}
                                        className="border border-gray-300 rounded-xl p-5 bg-white"
                                    >
                                        <div className="flex items-start justify-between">
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

                                            {/* Intentionally no CTA button here (per your request). */}
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

                                        <p className="text-xs text-black/50 mt-4">
                                            Plan activation may require admin approval depending on
                                            your setup.
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 text-sm text-black/60">
                                To change plans, proceed to{" "}
                                <span className="text-black/70 font-medium">
                                    Pay / Upload Proof
                                </span>{" "}
                                and select your desired plan (if enabled in your backend).
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SubscriptionPlansPage;
