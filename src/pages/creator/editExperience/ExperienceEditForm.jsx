import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
          destination_name: data.destination?.name || data.destination_name || "",
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
    if (!experience) return;

    try {
      setIsSaving(true);

      const formDataObj = new FormData();
      let section = "";

      switch (step) {
        case 1: // Basic details (Step2GetStarted)
          section = "basic";
          formDataObj.append("section", section);
          formDataObj.append("title", formData.title);
          formDataObj.append("description", formData.description);
          formDataObj.append("price", Number(formData.price).toString());
          formDataObj.append("unit", formData.unit);
          break;

        case 2: // Experience details
          section = "images";
          formDataObj.append("section", section);

          if (deletedImages.length > 0) {
            formDataObj.append("images_to_delete", JSON.stringify(deletedImages));
          }

          if (formData.images && formData.images.length > 0) {
            formData.images.forEach((img) => {
              if (img instanceof File) {
                formDataObj.append("images", img);
              } else if (typeof img === "object" && img.file instanceof File) {
                formDataObj.append("images", img.file);
              }
            });
          }
          break;

        case 3: // Availability & Companions
          section = "availability";
          formDataObj.append("section", section);
          formDataObj.append(
            "availability",
            JSON.stringify(formData.availability)
          );
          formDataObj.append("travel_companion", formData.travel_companion);
          formDataObj.append(
            "travel_companions",
            JSON.stringify(formData.travel_companions || [])
          );
          break;

        case 4: // Destination
          section = "destination";
          formDataObj.append("section", section);
          if (formData.useExistingDestination && formData.destination_id) {
            formDataObj.append("destination_id", formData.destination_id.toString());
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
          break;
      }

      const response = await fetch(`${API_URL}/experience/${id}/section`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
        body: formDataObj,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to save changes");
      }

      window.alert("Changes saved successfully!");

      // Update experience state
      if (step === 3) {
        setExperience({
          ...experience,
          title: formData.title,
          description: formData.description,
          price: formData.price,
          unit: formData.unit,
        });
      } else if (step === 4) {
        setExperience({
          ...experience,
          images: formData.images.filter((img) => typeof img === "string"),
        });
        setDeletedImages([]);
      }
    } catch (err) {
      console.error("Save error:", err);
      window.alert(
        err instanceof Error ? err.message : "Failed to save changes"
      );
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

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 4));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 3));

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
          {step < 4 ? (
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