import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

// Step components
import Step00RoleSelection from "./steps/Step00RoleSelection";
import Step01PartnerInfo from "./steps/step01PartnerInfo"; // personal / business info
import Step02Verification from "./steps/step02Verification"; // documents & license
import Step03Guide from "./steps/step03Guide";
import Step03Driver from "./steps/step03Driver";
import Step04ReviewSubmit from "./steps/step04ReviewSubmit"; // final review

const PartnerOnboardingForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // start with Step 0 (Role Selection)
    const stepCount = 5; // total steps
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        creator_role: "",
        creator_role_label: "",
        full_name: "",
        email: "",
        phone: "",
        profile_photo: null,
        id_document: null,
        license: null,
        vehicle_info: null,
        services: [],
        availability: []
    });

    // Navigation handlers
    const handleNext = () => {
        setStep((prev) => {
            // If moving from Step02
            if (prev === 2 && formData.creator_role === "creator") {
                return 4; // Skip Step03 → go to Review
            }

            return Math.min(prev + 1, stepCount - 1);
        });
    };

    const handleBack = () => {
        setStep((prev) => Math.max(prev - 1, 0));
    };

    // Handle final submission
    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            // TODO: add validation + API call
            console.log("Submitting Partner Form Data:", formData);

            // Show success
            toast.success("Partner account submitted successfully!");
            setTimeout(() => navigate("/dashboard"), 1200);
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit partner account.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render step
    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <Step00RoleSelection
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleNext}
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
                if (formData.creator_role === "guide") {
                    return (
                        <Step03Guide
                            formData={formData}
                            setFormData={setFormData}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    );
                }

                if (formData.creator_role === "driver") {
                    return (
                        <Step03Driver
                            formData={formData}
                            setFormData={setFormData}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    );
                }

            case 4:
                return (
                    <Step04ReviewSubmit
                        formData={formData}
                        onSubmit={handleSubmit}
                        onBack={handleBack}
                        isSubmitting={isSubmitting}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen">
            <Toaster />
            <LayoutGroup>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="w-full max-w-5xl mx-auto p-4"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </LayoutGroup>
        </div>
    );
};

export default PartnerOnboardingForm;
