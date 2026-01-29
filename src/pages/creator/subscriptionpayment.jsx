// SubscriptionPaymentPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    ChevronLeft,
    Upload,
    CreditCard,
    CheckCircle,
    AlertCircle,
    Image,
    X,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import toast, { Toaster } from "react-hot-toast";

const SubscriptionPaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token } = useAuth();

    // Plan info passed from SubscriptionPlansPage
    const planFromState = location.state || {};
    const {
        plan_id: selectedPlanId,
        plan_name: selectedPlanName,
        plan_price: selectedPlanPrice,
        is_renewal: isRenewal,
    } = planFromState;

    const [subscriptionId, setSubscriptionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [proofFile, setProofFile] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const [gcashReference, setGcashReference] = useState("");

    // Fetch subscription ID
    useEffect(() => {
        const fetchSubscription = async () => {
            if (!user?.user_id) return;

            try {
                setLoading(true);
                const res = await axios.get(
                    `${API_URL}/subscription/partner/${user.user_id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const sub = res.data?.subscription;
                if (sub?.subscription_id) {
                    setSubscriptionId(sub.subscription_id);
                }
            } catch (err) {
                console.error("Error fetching subscription:", err);
                toast.error("Failed to load subscription info");
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [user?.user_id, token]);

    // Redirect if no plan selected
    useEffect(() => {
        if (!selectedPlanId && !loading) {
            toast.error("Please select a plan first");
            navigate("/owner/subscription/plans");
        }
    }, [selectedPlanId, loading, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        setProofFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setProofPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveFile = () => {
        setProofFile(null);
        setProofPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!proofFile) {
            toast.error("Please upload payment proof");
            return;
        }

        if (!subscriptionId) {
            toast.error("Subscription not found. Please try again.");
            return;
        }

        if (!selectedPlanId) {
            toast.error("No plan selected. Please go back and select a plan.");
            return;
        }

        try {
            setSubmitting(true);

            const formData = new FormData();
            formData.append("proof", proofFile);
            formData.append("plan_id", selectedPlanId);
            formData.append("amount_php", selectedPlanPrice || 0);
            if (gcashReference.trim()) {
                formData.append("gcash_reference", gcashReference.trim());
            }

            await axios.post(
                `${API_URL}/subscription/subscriptions/${subscriptionId}/upload-proof`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            toast.success("Payment proof submitted! Awaiting admin approval.");
            navigate("/owner/subscription");
        } catch (err) {
            console.error("Error uploading proof:", err);
            const message =
                err.response?.data?.message || "Failed to submit payment proof";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-center" />
            <div className="min-h-screen">
                <div className="">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate("/owner/subscription/plans")}
                                    className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <ChevronLeft size={16} />
                                    Back
                                </button>
                            </div>

                            <h1 className="text-2xl font-semibold text-gray-900 mt-4">
                                Upload Payment Proof
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Complete your subscription payment via GCash
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Payment Form */}
                        <div className="lg:col-span-2 bg-white rounded-lg">
                            <div className="py-6 px-6">
                                <form onSubmit={handleSubmit}>
                                    {/* Selected Plan Summary */}
                                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-black/60">Selected Plan</p>
                                                <p className="text-lg font-medium text-gray-900">
                                                    {selectedPlanName || "Unknown Plan"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-black/60">Amount</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    ₱{(selectedPlanPrice || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Renewal vs Change Notice */}
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            {isRenewal ? (
                                                <div className="flex items-start gap-2 text-green-700">

                                                    <p className="text-sm">
                                                        This is a <strong>renewal</strong>. Your subscription
                                                        period will be extended from your current end date.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex items-start gap-2 text-amber-700">
                                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                                    <p className="text-sm">
                                                        This is a <strong>plan change</strong>. Your new
                                                        subscription period will start from the approval date.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* GCash Reference (Optional) */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            GCash Reference Number{" "}
                                            <span className="text-black/40">(optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={gcashReference}
                                            onChange={(e) => setGcashReference(e.target.value)}
                                            placeholder="e.g., 1234567890"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#274b46]/20 focus:border-[#274b46] outline-none"
                                        />
                                        <p className="text-xs text-black/50 mt-1">
                                            Enter the reference number from your GCash transaction
                                        </p>
                                    </div>

                                    {/* Proof Upload */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Screenshot <span className="text-red-500">*</span>
                                        </label>

                                        {!proofPreview ? (
                                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#274b46] hover:bg-gray-50 transition-colors">
                                                <div className="flex flex-col items-center justify-center py-6">
                                                    <Upload size={32} className="text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-600">
                                                        Click to upload or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        PNG, JPG up to 5MB
                                                    </p>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        ) : (
                                            <div className="relative">
                                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                                    <img
                                                        src={proofPreview}
                                                        alt="Payment proof preview"
                                                        className="w-full h-64 object-contain bg-gray-50"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveFile}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                                <p className="text-xs text-black/50 mt-2 flex items-center gap-1">
                                                    <Image size={12} />
                                                    {proofFile?.name}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={submitting || !proofFile}
                                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${submitting || !proofFile
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-[#274b46] text-white hover:bg-[#376a63]"
                                            }`}
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard size={18} />
                                                Submit Payment Proof
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Payment Instructions */}
                        <div className="bg-white rounded-lg h-fit">
                            <div className="py-6 px-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    How to Pay
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 bg-[#274b46] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                            1
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Open GCash App
                                            </p>
                                            <p className="text-sm text-gray-600 mt-0.5">
                                                Go to "Send Money" or "Pay Bills"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 bg-[#274b46] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                            2
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Send to Our GCash
                                            </p>
                                            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="text-xs text-black/50">GCash Number</p>
                                                <p className="text-sm font-mono font-medium text-gray-900">
                                                    0956 607 2777
                                                </p>
                                                <p className="text-xs text-black/50 mt-2">Account Name</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Itinera Travel Inc.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 bg-[#274b46] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                            3
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Enter Amount
                                            </p>
                                            <p className="text-sm text-gray-600 mt-0.5">
                                                Send exactly{" "}
                                                <span className="font-semibold">
                                                    ₱{(selectedPlanPrice || 0).toLocaleString()}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 bg-[#274b46] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                            4
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Screenshot & Upload
                                            </p>
                                            <p className="text-sm text-gray-600 mt-0.5">
                                                Take a screenshot of the confirmation and upload it here
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs text-amber-800">
                                        <strong>Note:</strong> Your payment will be reviewed by our
                                        team. Subscription will be activated within 24 hours of
                                        approval.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SubscriptionPaymentPage;