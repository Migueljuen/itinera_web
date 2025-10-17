import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { useAuth } from "../../../contexts/AuthContext";
import API_URL from "../../../constants/api";

// Step components (reuse from create)
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

  // Track deleted image IDs (not URLs)
  const [deletedImageIds, setDeletedImageIds] = useState([]);

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

        console.log("=== INITIAL LOAD DEBUG ===");
        console.log("Full API response:", data);
        console.log("data.destination_id:", data.destination_id);
        console.log("data.destination:", data.destination);
        console.log(
          "data.destination?.destination_id:",
          data.destination?.destination_id
        );
        console.log("data.images:", data.images);
        console.log("Type of data.images:", typeof data.images);
        console.log("Is Array:", Array.isArray(data.images));
        if (data.images && data.images.length > 0) {
          console.log("First image:", data.images[0]);
          console.log("First image keys:", Object.keys(data.images[0]));
        }

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

        // Transform existing images to include metadata
        let imageData = [];
        if (data.images && Array.isArray(data.images)) {
          console.log(
            "Initial images from API:",
            JSON.stringify(data.images, null, 2)
          );
          imageData = data.images.map((img, index) => {
            console.log("Transforming image:", img);

            // Handle two formats:
            // 1. String: "/uploads/experiences/filename.jpg"
            // 2. Object: {image_id: 1, image_url: "uploads/experiences/filename.jpg"}
            if (typeof img === "string") {
              // String format - from initial load
              return {
                image_id: null, // No ID available yet
                image_url: img.startsWith("/") ? img.slice(1) : img, // Remove leading slash
                isExisting: true,
                tempId: `temp-${index}`, // Temporary ID for React keys
              };
            } else {
              // Object format - from save response
              return {
                image_id: img.image_id,
                image_url: img.image_url,
                isExisting: true,
              };
            }
          });
          console.log(
            "Transformed imageData:",
            JSON.stringify(imageData, null, 2)
          );
        }
        console.log("=== SETTING FORM DATA ===");
        console.log(
          "destination_id value:",
          data.destination_id || data.destination?.destination_id
        );
        console.log("Breakdown:");
        console.log("  data.destination_id:", data.destination_id);
        console.log(
          "  data.destination?.destination_id:",
          data.destination?.destination_id
        );
        console.log(
          "  Result of OR:",
          data.destination_id || data.destination?.destination_id
        );
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
          destination_id:
            data.destination_id || data.destination?.destination_id, // ✅ FIX: Check both places
          destination_name:
            data.destination?.name || data.destination_name || "",
          city: data.destination?.city || "",
          destination_description: data.destination?.description || "",
          latitude: data.destination?.latitude?.toString() || "",
          longitude: data.destination?.longitude?.toString() || "",
          images: imageData,
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

  const handleSaveCurrentStep = async () => {
    try {
      setIsSaving(true);

      console.log("=== BEFORE SAVE ===");
      console.log("Current formData:", formData);
      console.log("Current experience state:", experience);
      console.log("Current step:", step);

      const data = new FormData();

      // Append all non-file fields
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("unit", formData.unit);
      data.append("category_id", formData.category_id);

      // Destination fields
      if (formData.destination_id) {
        data.append("destination_id", formData.destination_id);
      }
      data.append("destination_name", formData.destination_name || "");
      data.append("city", formData.city || "");
      data.append(
        "destination_description",
        formData.destination_description || ""
      );
      data.append("latitude", formData.latitude || "");
      data.append("longitude", formData.longitude || "");

      // Add availability data
      if (formData.availability && formData.availability.length > 0) {
        console.log("Adding availability to FormData:", formData.availability);
        data.append("availability", JSON.stringify(formData.availability));
      }

      // Add travel companions
      if (formData.travel_companions && formData.travel_companions.length > 0) {
        console.log(
          "Adding travel_companions to FormData:",
          formData.travel_companions
        );
        data.append(
          "travel_companions",
          JSON.stringify(formData.travel_companions)
        );
      }

      // Add tags
      if (formData.tags && formData.tags.length > 0) {
        console.log("Adding tags to FormData:", formData.tags);
        data.append("tags", JSON.stringify(formData.tags));
      }

      // Handle new image uploads
      const newImages = formData.images.filter(
        (img) => img.file && img.file instanceof File
      );

      if (newImages.length > 0) {
        newImages.forEach((img) => {
          data.append("images", img.file);
        });
      }

      // Send deleted image IDs
      if (deletedImageIds.length > 0) {
        console.log("Sending deletedImageIds:", deletedImageIds);
        data.append("images_to_delete", JSON.stringify(deletedImageIds));
      }

      console.log("=== SENDING TO BACKEND ===");
      console.log("FormData contents:");
      for (let pair of data.entries()) {
        console.log(pair[0], ":", pair[1]);
      }

      const response = await axios.put(`${API_URL}/experience/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("=== BACKEND RESPONSE ===");
      console.log("Full response.data:", response.data);
      console.log("Response experience:", response.data.experience);
      console.log("Response destination:", response.data.destination);
      console.log("Response availability:", response.data.availability);
      console.log(
        "Response travel_companions:",
        response.data.experience?.travel_companions
      );
      console.log("Response tags:", response.data.tags);
      console.log("Response images:", response.data.images);

      toast.success("Changes saved successfully!");

      // Destructure the response
      const {
        experience: updatedExperience,
        destination,
        availability: updatedAvailability,
        tags: updatedTags,
        images: updatedImages,
      } = response.data;

      console.log("=== UPDATING STATE ===");

      // Update images
      if (updatedImages && Array.isArray(updatedImages)) {
        console.log("Updating images:", updatedImages);
        const transformedImages = updatedImages.map((img) => ({
          image_id: img.image_id,
          image_url: img.image_url,
          isExisting: true,
        }));
        setFormData((prev) => ({ ...prev, images: transformedImages }));
      }

      // Update availability
      if (updatedAvailability && Array.isArray(updatedAvailability)) {
        console.log("Updating availability:", updatedAvailability);
        setFormData((prev) => ({
          ...prev,
          availability: updatedAvailability,
        }));
      }

      // Update travel companions
      if (updatedExperience && updatedExperience.travel_companions) {
        console.log(
          "Updating travel_companions:",
          updatedExperience.travel_companions
        );
        setFormData((prev) => ({
          ...prev,
          travel_companions: updatedExperience.travel_companions,
        }));
      }

      // Update destination fields
      if (destination) {
        console.log("Updating destination:", destination);
        setFormData((prev) => ({
          ...prev,
          destination_id: destination.destination_id,
          destination_name: destination.name,
          city: destination.city,
          destination_description: destination.description,
          latitude: destination.latitude?.toString() || "",
          longitude: destination.longitude?.toString() || "",
        }));
      }

      // Update tags
      if (updatedTags && Array.isArray(updatedTags)) {
        console.log("Updating tags:", updatedTags);
        const tagIds = updatedTags.map((tag) => tag.tag_id);
        setFormData((prev) => ({
          ...prev,
          tags: tagIds,
        }));
      }

      // Update basic experience fields
      if (updatedExperience) {
        console.log("Updating basic experience fields");
        setFormData((prev) => ({
          ...prev,
          title: updatedExperience.title,
          description: updatedExperience.description,
          price: updatedExperience.price,
          unit: updatedExperience.unit,
          category_id: updatedExperience.category_id,
        }));

        // Update the experience state for comparison
        setExperience({
          ...updatedExperience,
          destination: destination,
          images: updatedImages,
          availability: updatedAvailability,
          tags: updatedTags,
        });
        console.log("Updated experience state");
      }

      // Clear deleted images after successful save
      setDeletedImageIds([]);

      console.log("=== AFTER STATE UPDATE ===");
      console.log("New formData should be updated on next render");
      console.log("New experience state:", {
        ...updatedExperience,
        destination: destination,
        images: updatedImages,
        availability: updatedAvailability,
        tags: updatedTags,
      });
    } catch (error) {
      console.error("=== SAVE ERROR ===");
      console.error("Error response:", error.response?.data);
      console.error("Error message:", error.message);
      console.error("Full error:", error);
      toast.error(error.response?.data?.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
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
          deletedImageIds.length > 0 ||
          formData.images?.some(
            (img) => !img.isExisting && img.file instanceof File
          )
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
            deletedImageIds={deletedImageIds}
            setDeletedImageIds={setDeletedImageIds}
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
