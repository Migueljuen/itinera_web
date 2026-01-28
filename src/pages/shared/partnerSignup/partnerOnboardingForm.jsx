// PartnerOnboardingForm.jsx - Creator Only (Web)
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

// Step components (Creator flow only)
import Step00Requirements from "./steps/Step00Requirements";
import Step01PartnerInfo from "./steps/Step01PartnerInfo";
import Step02Verification from "./steps/step02Verification";
import Step03ReviewSubmit from "./steps/step03ReviewSubmit";
import API_URL from "../../../constants/api";

const DEFAULT_TIMEZONE =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Manila";

const PartnerOnboardingForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const stepCount = 4;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        // users table
        creator_role: "Creator", // Fixed as Creator for web
        first_name: "",
        last_name: "",
        email: "",
        mobile_number: "",
        password: "",
        profile_pic: null,
        selfie_document: null,
        timezone: DEFAULT_TIMEZONE,
        is_first_login: 1,
        status: "Pending",
        short_description: "",

        // UI helper
        creator_role_label: "Experience Creator",

        // verification
        id_document: null,
        business_permit_document: null,

        // ✅ NEW (Option A): registration payment
        gcash_reference: "",
        registration_payment_proof: null,
    });

    const handleNext = () => {
        setStep((prev) => Math.min(prev + 1, stepCount - 1));
    };

    const handleBack = () => {
        setStep((prev) => Math.max(prev - 1, 0));
    };

    // Helper to append file to FormData
    const appendFile = (fd, key, fileData) => {
        if (!fileData?.file) return;
        fd.append(key, fileData.file);
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const loadingToast = toast.loading("Submitting your application...");

            const fd = new FormData();

            // User fields
            fd.append("role", formData.creator_role);
            fd.append("first_name", formData.first_name);
            fd.append("last_name", formData.last_name);
            fd.append("email", formData.email);
            fd.append("mobile_number", formData.mobile_number);
            fd.append("short_description", formData.short_description);
            fd.append("password", formData.password);
            fd.append("timezone", formData.timezone);

            // ✅ NEW: registration payment ref
            fd.append("gcash_reference", (formData.gcash_reference || "").trim());

            // Files
            appendFile(fd, "profile_pic", formData.profile_pic);
            appendFile(fd, "id_document", formData.id_document);
            appendFile(fd, "selfie_document", formData.selfie_document);
            appendFile(fd, "business_permit_document", formData.business_permit_document);

            // ✅ NEW: registration payment proof upload
            appendFile(fd, "registration_payment_proof", formData.registration_payment_proof);

            console.log("=== Data being sent to backend ===");
            for (let [key, value] of fd.entries()) {
                console.log(key, ":", value);
            }

            const response = await fetch(`${API_URL}/partner/register`, {
                method: "POST",
                body: fd,
            });

            const result = await response.json().catch(() => ({}));
            toast.dismiss(loadingToast);

            if (response.ok) {
                toast.success(
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold">Registration Submitted!</span>
                        <span className="text-sm text-gray-100/90">
                            {result.message ||
                                "Your application and payment proof have been submitted for verification."}
                        </span>
                    </div>,
                    {
                        duration: 4000,
                        style: {
                            background: "#10B981",
                            color: "#fff",
                            padding: "16px",
                            borderRadius: "10px",
                        },
                        iconTheme: {
                            primary: "#fff",
                            secondary: "#10B981",
                        },
                    }
                );

                setTimeout(() => navigate("/"), 2000);
            } else {
                toast.error(result.message || "Registration failed. Please try again.", {
                    duration: 4000,
                    style: {
                        background: "#EF4444",
                        color: "#fff",
                        padding: "16px",
                        borderRadius: "10px",
                    },
                });
            }
        } catch (err) {
            console.error(err);
            toast.error(
                "Failed to submit application. Please check your connection and try again.",
                {
                    duration: 4000,
                    style: {
                        background: "#EF4444",
                        color: "#fff",
                        padding: "16px",
                        borderRadius: "10px",
                    },
                }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepNode = useMemo(() => {
        switch (step) {
            case 0:
                return (
                    <Step00Requirements
                        formData={formData}
                        onNext={handleNext}
                        onBack={() => navigate("/")}
                    />
                );

            case 1:
                return (
                    <Step01PartnerInfo
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );

            case 2:
                return (
                    <Step02Verification
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );

            case 3:
                return (
                    <Step03ReviewSubmit
                        formData={formData}
                        onSubmit={handleSubmit}
                        onBack={handleBack}
                        isSubmitting={isSubmitting}
                    />
                );

            default:
                return null;
        }
    }, [step, formData, isSubmitting, navigate]);

    return (
        <div className="">
            <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                    className: "",
                    duration: 3000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                    success: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#10B981",
                            secondary: "#fff",
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#EF4444",
                            secondary: "#fff",
                        },
                    },
                }}
            />

            <LayoutGroup>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="w-full mx-auto"
                    >
                        {stepNode}
                    </motion.div>
                </AnimatePresence>
            </LayoutGroup>
        </div>
    );
};

export default PartnerOnboardingForm;
