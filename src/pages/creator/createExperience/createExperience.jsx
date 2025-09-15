import React, { useState } from "react";
import ProgressBar from "../../../components/ProgressBar";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
// Step components (web versions)
import Step01CategorySelection from "./steps/Step01CategorySelection";
import Step1Tag from "./steps/Step1Tag";
import Step2GetStarted from "./steps/Step2GetStarted";
import Step3ExperienceDetails from "./steps/Step3ExperienceDetails";
import Step4AvailabilityCompanion from "./steps/Step4AvailabilityCompanion";
import Step6Destination from "./steps/Step6Destination";

import ReviewSubmit from "./steps/Step8Review";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { useAuth } from "../../../contexts/AuthContext";
import API_URL from "../../../constants/api";
const ExperienceCreationForm = () => {
  const [step, setStep] = useState(1);
  const stepCount = 7;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category_id: 0, // New field for category selection
    title: "",
    description: "",
    price: "",
    unit: "",
    availability: [],
    tags: [], // Keep existing tags field for backward compatibility
    travel_companion: "",
    travel_companions: [],
    useExistingDestination: false,
    destination_id: null,
    destination_name: "",
    city: "",
    destination_description: "",
    latitude: "",
    longitude: "",
    images: [],
  });

  const validateFormData = () => {
    const requiredUnits = ["Entry", "Hour", "Day", "Package"];
    const hasCompanions =
      formData.travel_companions && formData.travel_companions.length > 0;

    // Add validation for new fields
    if (!formData.category_id) {
      console.log("Category not selected");
      return false;
    }

    if (!Array.isArray(formData.tags) || formData.tags.length === 0) {
      console.log("No tags selected");
      return false;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      isNaN(Number(formData.price)) ||
      !requiredUnits.includes(formData.unit) ||
      !Array.isArray(formData.tags) ||
      formData.tags.length === 0 ||
      !Array.isArray(formData.availability) ||
      formData.availability.length === 0 ||
      !hasCompanions
    ) {
      console.log("Basic form data validation failed");
      return false;
    }

    for (const day of formData.availability) {
      if (!day.day_of_week) {
        console.log("Missing day_of_week:", day);
        return false;
      }
      if (!Array.isArray(day.time_slots)) {
        console.log("Missing or invalid time_slots:", day);
        return false;
      }
      if (day.time_slots.length === 0) {
        console.log("Empty time_slots array:", day);
        return false;
      }

      for (const slot of day.time_slots) {
        if (!slot.start_time || !slot.end_time) {
          console.log(
            "Missing start or end time in slot:",
            slot,
            "Day:",
            day.day_of_week
          );
          return false;
        }

        const startTime = new Date(`2000-01-01T${slot.start_time}`);
        const endTime = new Date(`2000-01-01T${slot.end_time}`);
        if (endTime <= startTime) {
          window.alert(
            `End time must be after start time for ${day.day_of_week}`
          );
          return false;
        }
      }
    }

    if (!formData.useExistingDestination) {
      if (
        !formData.destination_name ||
        !formData.city ||
        !formData.destination_description ||
        !formData.latitude ||
        !formData.longitude
      ) {
        console.log("Missing destination info");
        return false;
      }
    } else if (!formData.destination_id) {
      console.log("Missing destination_id");
      return false;
    }

    return true;
  };

  const handleSubmit = async (status = "draft") => {
    console.log("Submitting formData:", formData);

    if (!validateFormData()) {
      window.alert("Please fill out all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formDataObj = new FormData();

      formDataObj.append("creator_id", user.user_id);
      formDataObj.append("category", formData.category_id); // Add category to submission
      formDataObj.append("title", formData.title);
      formDataObj.append("description", formData.description);
      formDataObj.append("price", Number(formData.price).toString());
      formDataObj.append("unit", formData.unit);
      formDataObj.append("status", status);
      formDataObj.append("tags", JSON.stringify(formData.tags));
      // formDataObj.append("selectedTags", JSON.stringify(formData.selectedTags)); // Add selected tags
      formDataObj.append(
        "travel_companions",
        JSON.stringify(formData.travel_companions || [])
      );

      const transformedAvailability = formData.availability.map((day) => ({
        availability_id: day.availability_id,
        experience_id: day.experience_id,
        day_of_week: day.day_of_week,
        time_slots: day.time_slots.map((slot) => ({
          slot_id: slot.slot_id,
          availability_id: slot.availability_id,
          start_time:
            slot.start_time.length === 5
              ? slot.start_time + ":00"
              : slot.start_time,
          end_time:
            slot.end_time.length === 5 ? slot.end_time + ":00" : slot.end_time,
        })),
      }));
      formDataObj.append(
        "availability",
        JSON.stringify(transformedAvailability)
      );

      if (formData.useExistingDestination && formData.destination_id) {
        formDataObj.append(
          "destination_id",
          formData.destination_id.toString()
        );
      } else {
        formDataObj.append("destination_name", formData.destination_name);
        formDataObj.append("city", formData.city);
        formDataObj.append(
          "destination_description",
          formData.destination_description
        );
        formDataObj.append("latitude", formData.latitude);
        formDataObj.append("longitude", formData.longitude);
      }

      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((img, index) => {
          if (img instanceof File) {
            formDataObj.append("images", img);
          } else if (typeof img === "object" && img.file instanceof File) {
            formDataObj.append("images", img.file);
          }
        });
      }

      const response = await fetch(`${API_URL}/experience/create`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formDataObj,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to create experience");
      }

      const successMessage =
        status === "active"
          ? "Experience published successfully!"
          : "Experience saved as draft successfully!";

      window.alert(successMessage);
      // Add navigation or reset logic here
    } catch (err) {
      console.error("Submit error:", err);
      window.alert(
        err instanceof Error ? err.message : "Failed to submit experience"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, stepCount));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step01CategorySelection
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <Step1Tag
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step2GetStarted
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Step3ExperienceDetails
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <Step4AvailabilityCompanion
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 6:
        return (
          <Step6Destination
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 7:
        return (
          <ReviewSubmit
            formData={formData}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className=" mx-auto">
        <div className="flex-1 min-h-screen w-full  grid place-items-center font-display ">
          {step < 4 ? (
            // Animate only for steps 1 and 2
            <LayoutGroup>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-full"
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </LayoutGroup>
          ) : (
            // Step 3+: render normally inside dashboard
            <DashboardLayout>{renderStep()}</DashboardLayout>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceCreationForm;
