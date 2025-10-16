import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { useAuth } from "../../../contexts/AuthContext";
import API_URL from "../../../constants/api";

// Step components (reuse from create)
// import Step01CategorySelection from "../createExperience/steps/Step01CategorySelection";
// import Step1Tag from "../createExperience/steps/Step1Tag";
import Step2GetStarted from "../createExperience/steps/Step2GetStarted";
import Step3ExperienceDetails from "../createExperience/steps/Step3ExperienceDetails";
import Step4AvailabilityCompanion from "../createExperience/steps/Step4AvailabilityCompanion";
import Step6Destination from "../createExperience/steps/Step6Destination";

const ExperienceEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(2);
  const stepCount = 4;
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [experience, setExperience] = useState(null);

  const [formData, setFormData] = useState({
    category_id: 0,
    title: "",
    description: "",
    price: "",
    unit: "",
    availability: [],
    tags: [],
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

  // Track deleted images
  const [deletedImages, setDeletedImages] = useState([]);

  // Load experience data
  useEffect(() => {
    const loadExperienceData = async () => {
      if (!id) {
        window.alert("Invalid experience ID");
        navigate(-1);
        return;
      }

      try {
        // Fetch experience data
        const response = await fetch(`${API_URL}/experience/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load experience");
        }

        // Check if user is the creator
        if (data.creator_id !== user.user_id) {
          window.alert("You can only edit experiences you created.");
          navigate(-1);
          return;
        }

        setExperience(data);

        // Load availability data
        const availabilityResponse = await fetch(
          `${API_URL}/experience/${id}/availability`
        );
        const availabilityData = await availabilityResponse.json();

        // Load tags
        const tagsResponse = await fetch(`${API_URL}/tags`);
        const tagsData = await tagsResponse.json();

        let selectedTagIds = [];
        if (tagsResponse.ok && tagsData && tagsData.tags && data.tags) {
          selectedTagIds = data.tags
            .map((tagName) => {
              const tag = tagsData.tags.find((t) => t.name === tagName);
              return tag ? tag.tag_id : null;
            })
            .filter((id) => id !== null);
        }

        let transformedAvailability = [];
        if (
          availabilityResponse.ok &&
          availabilityData &&
          availabilityData.availability
        ) {
          transformedAvailability = availabilityData.availability.map(
            (item) => ({
              availability_id: item.availability_id,
              experience_id: item.experience_id,
              day_of_week: item.day_of_week,
              time_slots: item.time_slots.map((slot) => ({
                slot_id: slot.slot_id,
                availability_id: slot.availability_id,
                start_time: slot.start_time,
                end_time: slot.end_time,
              })),
            })
          );
        }

        // Handle travel companions
        let companions = [];
        if (data.travel_companions && Array.isArray(data.travel_companions)) {
          companions = data.travel_companions;
        } else if (data.travel_companion) {
          companions = [data.travel_companion];
        }

        // Populate form data
        setFormData({
          category_id: data.category_id || 0,
          title: data.title || "",
          description: data.description || "",
          price: data.price || "",
          unit: data.unit || "",
          availability: transformedAvailability,
          tags: selectedTagIds,
          travel_companion: data.travel_companion || "",
          travel_companions: companions,
          useExistingDestination: true,
          destination_id: data.destination_id || null,
          destination_name:
            data.destination?.name || data.destination_name || "",
          city: data.destination?.city || "",
          destination_description: data.destination?.description || "",
          latitude: data.destination?.latitude?.toString() || "",
          longitude: data.destination?.longitude?.toString() || "",
          images: data.images || [],
        });
      } catch (error) {
        console.error("Error loading experience:", error);
        window.alert("Failed to load experience data");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadExperienceData();
  }, [id, user.user_id, navigate]);

  // Save current step
  const handleSaveCurrentStep = async () => {
    try {
      setLoading(true);

      const data = new FormData();

      // Append all non-file fields
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("unit", formData.unit);
      data.append("category_id", formData.category_id);
      data.append("destination_id", formData.destination_id || "");

      // Append all images (if any)
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((file, index) => {
          // only append if it's a File (not an existing image URL)
          if (file instanceof File) {
            data.append("images", file);
          }
        });
      }

      const response = await axios.put(`${API_URL}/experience/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Changes saved successfully!");
      console.log("Update response:", response.data);
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);
      toast.error("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  // Check for changes
  const hasChangesInCurrentStep = () => {
    if (!experience) return false;

    switch (step) {
      case 1:
        return (
          formData.title !== experience.title ||
          formData.description !== experience.description ||
          formData.price !== experience.price ||
          formData.unit !== experience.unit
        );
      case 2:
        return (
          deletedImages.length > 0 ||
          formData.images?.some((img) => img instanceof File)
        );
      case 3:
        return true; // availability or companion changes
      case 4:
        return (
          formData.destination_name !== experience.destination?.name ||
          formData.city !== experience.destination?.city ||
          formData.destination_description !==
            experience.destination?.description
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    console.log("handleNext called, current step:", step);
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    console.log("handleBack called, current step:", step);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const renderStep = () => {
    if (!experience) return null;

    switch (step) {
      case 1:
        return (
          <Step2GetStarted
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
            isEditMode={true}
            onSave={handleSaveCurrentStep}
            isSaving={isSaving}
          />
        );
      case 2:
        return (
          <Step3ExperienceDetails
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
            isEditMode={true}
            experience={experience}
            deletedImages={deletedImages}
            setDeletedImages={setDeletedImages}
            onSave={handleSaveCurrentStep}
            isSaving={isSaving}
          />
        );
      case 3:
        return (
          <Step4AvailabilityCompanion
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
            isEditMode={true}
            onSave={handleSaveCurrentStep}
            isSaving={isSaving}
          />
        );
      case 4:
        return (
          <Step6Destination
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onBack={handleBack}
            isEditMode={true}
            experience={experience}
            onSave={handleSaveCurrentStep}
            isSaving={isSaving}
          />
        );
      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading experience data...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (!experience) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-gray-600">Experience not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <div className="flex-1 min-h-screen w-full grid place-items-center font-display">
          {step < 2 ? (
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
            <DashboardLayout>{renderStep()}</DashboardLayout>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceEditForm;
