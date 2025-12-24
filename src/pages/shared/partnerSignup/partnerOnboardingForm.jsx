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
import API_URL from "../../../constants/api"

const PartnerOnboardingForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // start with Step 0 (Role Selection)
    const stepCount = 5; // total steps
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        // For users table
        role: "", // Maps to enum('Traveler','Creator','Guide','Driver','Admin')
        first_name: "",
        last_name: "",
        email: "",
        mobile_number: "",
        password: "",
        profile_pic: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        is_first_login: 1,
        status: "Pending",

        // UI-only helper
        creator_role_label: "",

        // For driver_profiles table
        service_area: "",
        is_multi_day: false,
        availability_days: [],
        license_document: null,
        driver_id_document: null,

        // For guide_profiles table
        expertise_category_id: null,
        languages: [],
        areas_covered: "",
        experience_years: 0,
        guide_availability_days: [],
        guide_id_document: null,
    });
    // Navigation handlers
    const handleNext = () => {
        setStep((prev) => {
            // If moving from Step02
            if (prev === 2 && formData.creator_role === "creator") {
                return 4;
            }

            return Math.min(prev + 1, stepCount - 1);
        });
    };

    const handleBack = () => {
        setStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            const formDataToSend = new FormData();

            // User fields
            formDataToSend.append('role', formData.role);
            formDataToSend.append('first_name', formData.first_name);
            formDataToSend.append('last_name', formData.last_name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('mobile_number', formData.mobile_number);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('timezone', formData.timezone);

            // Files
            if (formData.profile_pic) {
                formDataToSend.append('profile_pic', formData.profile_pic);
            }
            if (formData.id_document) {
                formDataToSend.append('id_document', formData.id_document);
            }

            // Role-specific fields
            if (formData.role === 'Driver') {
                formDataToSend.append('service_area', formData.service_area);
                formDataToSend.append('is_multi_day', formData.is_multi_day);
                formDataToSend.append('availability_days', JSON.stringify(formData.availability_days));
                if (formData.license_document) {
                    formDataToSend.append('license_document', formData.license_document);
                }
            }

            if (formData.role === 'Guide') {
                formDataToSend.append('expertise_category_id', formData.expertise_category_id);
                formDataToSend.append('languages', JSON.stringify(formData.languages));
                formDataToSend.append('areas_covered', formData.areas_covered);
                formDataToSend.append('experience_years', formData.experience_years);
                formDataToSend.append('guide_availability_days', JSON.stringify(formData.guide_availability_days));
            }

            const response = await fetch(`${API}/partner/register`, {
                method: 'POST',
                body: formDataToSend
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(result.message);
                setTimeout(() => navigate('/dashboard'), 1200);
            } else {
                toast.error(result.message || 'Registration failed');
            }

        } catch (err) {
            console.error(err);
            toast.error('Failed to submit partner account.');
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
        <div className="">
            <Toaster />
            <LayoutGroup>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="w-full  mx-auto "
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </LayoutGroup>
        </div>
    );
};

export default PartnerOnboardingForm;
