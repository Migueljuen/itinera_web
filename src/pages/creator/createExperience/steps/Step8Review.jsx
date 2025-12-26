import React, { useState } from "react";
import { ArrowLeft, Settings2, FileImage, Check } from "lucide-react";

const TRAVEL_COMPANIONS = [
  {
    id: "Solo",
    label: "Solo",
    description: "Perfect for solo travelers",
  },
  {
    id: "Partner",
    label: "Couple",
    description: "Romantic experiences for two",
  },
  {
    id: "Family",
    label: "Family",
    description: "Great for families with kids",
  },
  {
    id: "Friends",
    label: "Friends",
    description: "Fun group activities",
  },
  {
    id: "Group",
    label: "Large Group",
    description: "Suitable for bigger groups",
  },
  {
    id: "Any",
    label: "Anyone",
    description: "Works for all group sizes",
  },
];

const ReviewSubmit = ({ formData, onBack, onSubmit, isSubmitting }) => {
  console.log("Form Data in ReviewSubmit:", formData);

  // Get travel companions array
  const companions = formData.travel_companions || [];

  // State for editing
  const [isEditingBasicDetails, setIsEditingBasicDetails] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingCompanions, setIsEditingCompanions] = useState(false);
  const [editedData, setEditedData] = useState({
    title: formData.title || "",
    price: formData.price || "",
    description: formData.description || "",
    notes: formData.notes || "",
  });
  const [editedLocation, setEditedLocation] = useState({
    destination_name: formData.destination_name || "",
    city: formData.city || "",
    destination_description: formData.destination_description || "",
  });
  const [editedCompanions, setEditedCompanions] = useState([...companions]);

  // Handle edit toggle
  const handleEditBasicDetails = () => {
    if (isEditingBasicDetails) {
      // Save changes
      Object.assign(formData, editedData);
    }
    setIsEditingBasicDetails(!isEditingBasicDetails);
  };

  const handleEditLocation = () => {
    if (isEditingLocation) {
      // Save changes
      Object.assign(formData, editedLocation);
    }
    setIsEditingLocation(!isEditingLocation);
  };

  const handleEditCompanions = () => {
    if (isEditingCompanions) {
      // Save changes
      formData.travel_companions = [...editedCompanions];
    }
    setIsEditingCompanions(!isEditingCompanions);
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (field, value) => {
    setEditedLocation((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const removeCompanion = (companionToRemove) => {
    setEditedCompanions((prev) => prev.filter((c) => c !== companionToRemove));
  };

  const addCompanion = (companionToAdd) => {
    setEditedCompanions((prev) => [...prev, companionToAdd]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Helper function to convert military time to standard time
  const convertToStandardTime = (militaryTime) => {
    if (!militaryTime) return "";

    // Extract hours and minutes from HH:MM format
    const [hours, minutes] = militaryTime.split(":");
    const hour24 = parseInt(hours, 10);

    // Convert to 12-hour format
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 < 12 ? "AM" : "PM";

    return `${hour12}:${minutes}${period}`;
  };

  // Calendar helper function
  const renderAvailabilityCalendar = () => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Create a map of availability by day
    const availabilityMap = {};
    if (formData.availability && formData.availability.length > 0) {
      formData.availability.forEach((day) => {
        availabilityMap[day.day_of_week] = day.time_slots;
      });
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Header row with day names */}
        {shortDays.map((day, index) => (
          <div
            key={index}
            className="text-center text-xs font-semibold text-black/80 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {daysOfWeek.map((fullDay, index) => {
          const hasAvailability = availabilityMap[fullDay];

          return (
            <div
              key={index}
              className="flex flex-col justify-between h-full relative p-3 my-auto rounded-lg text-center  border-gray-300"
            >
              {/* Time slots */}
              {hasAvailability && hasAvailability.length > 0 ? (
                <div className="space-y-2">
                  {hasAvailability.slice(0, 2).map((slot, slotIndex) => (
                    <div
                      key={slotIndex}
                      className="text-xs rounded py-2 border-l-4 border-blue-500 bg-blue-100 text-black/80"
                      title={`${convertToStandardTime(
                        slot.start_time
                      )} - ${convertToStandardTime(slot.end_time)}`}
                    >
                      <div className="flex items-center justify-center gap-0.5">
                        <span className="truncate">
                          {convertToStandardTime(slot.start_time)} -{" "}
                          {convertToStandardTime(slot.end_time)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* + More indicator */}
                  {hasAvailability.length > 2 && (
                    <div className="text-xs text-green-600 font-medium">
                      +{hasAvailability.length - 2} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-400 mt-2"></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto">
        <div className="text-center py-2">
          <div className="flex items-center justify-between mb-6">
            {/* LEFT SIDE */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-left text-xl font-semibold mb-2 text-black/90">
                  Review & Submit
                </h2>
                <p className="text-left text-sm text-black/60 mb-6">
                  Please review your experience details before submitting.
                </p>
              </div>
            </div>

            {/* RIGHT SIDE - Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-x-4">
              <button
                onClick={onBack}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-8 py-3 text-sm border-2 border-gray-300 text-gray-700 rounded-xl max-h-[44px] font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={20} />
                Previous Step
              </button>

              <button
                onClick={() => onSubmit("draft")}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-8 py-3 text-sm border-2 border-gray-300 text-gray-700 rounded-xl max-h-[44px] font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Save as Draft"
                )}
              </button>

              <button
                onClick={() => onSubmit("pending")}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-lg font-medium bg-black/80 text-white text-sm hover:bg-black/70 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit for Review"
                )}
              </button>
            </div>
          </div>

          {/* FULL WIDTH AVAILABILITY SECTION */}
          <div className="mb-8 ">
            <div className="border rounded-xl p-6 border-gray-200 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-left text-black/90 text-base mb-1">
                    Weekly Availability
                  </h3>
                  <p className="text-sm text-black/60 text-left">
                    Set your available time slots for each day of the week to
                    help customers book at convenient times.
                  </p>
                </div>
              </div>
              {formData.availability && formData.availability.length > 0 ? (
                <div className="rounded-lg p-4 ">
                  {renderAvailabilityCalendar()}
                </div>
              ) : (
                <div className="w-full px-4 py-3 text-sm text-black/60 rounded-lg border border-gray-200 text-center bg-gray-50">
                  No availability set
                </div>
              )}
            </div>
          </div>

          {/* TWO COL - EXPERIENCE DETAILS & DESTINATION */}
          <div className="flex flex-row justify-between gap-8">
            {/* LEFT COL - EXPERIENCE DETAILS */}
            <div className="flex flex-col gap-6 border rounded-xl p-6 border-gray-200 flex-1 h-fit bg-white">
              {/* Basic Details Section */}
              <div className="text-left">
                <div className="mb-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-black/90 text-base mb-1">
                      Basic Details
                    </h3>

                    <button
                      onClick={handleEditBasicDetails}
                      className="hover:bg-gray-100 p-1.5 rounded transition-colors"
                    >
                      {isEditingBasicDetails ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Settings2 size={16} className="text-black/60" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-black/60">
                    Review the core information about your activity including
                    title, description and pricing.
                  </p>
                </div>
                <div className="mt-12">
                  <div className="flex flex-row justify-between gap-4">
                    {/* LEFT */}
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-center min-h-[24px]">
                        <label className=" font-base text-black/60">
                          Activity title
                        </label>
                        {isEditingBasicDetails ? (
                          <input
                            type="text"
                            value={editedData.title}
                            onChange={(e) =>
                              handleInputChange("title", e.target.value)
                            }
                            className=" text-[#0e63be] border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent pb-1"
                          />
                        ) : (
                          <div className="">{formData.title}</div>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <label className="font-base text-black/60">
                          Per {formData.unit}
                        </label>
                        {isEditingBasicDetails ? (
                          <input
                            type="number"
                            value={editedData.price}
                            onChange={(e) =>
                              handleInputChange("price", e.target.value)
                            }
                            className="text-sm text-[#0e63be] border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                            placeholder="0"
                          />
                        ) : (
                          <div className="">₱{formData.price || "0"}</div>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <label className=" font-base text-black/60">
                          Short Description of the activity
                        </label>
                        {isEditingBasicDetails ? (
                          <input
                            type="text"
                            value={editedData.description}
                            onChange={(e) =>
                              handleInputChange("description", e.target.value)
                            }
                            className=" border-b text-[#0e63be] border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                            placeholder="No description provided"
                          />
                        ) : (
                          <div className="">
                            {formData.description || "No description provided"}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <label className=" text-black/60">
                          Additional Notes
                        </label>
                        {isEditingBasicDetails ? (
                          <input
                            type="text"
                            value={editedData.notes}
                            onChange={(e) =>
                              handleInputChange("notes", e.target.value)
                            }
                            className=" text-[#0e63be] border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                            placeholder="No additional notes provided"
                          />
                        ) : (
                          <div className="">
                            {formData.notes || "No additional notes provided"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 text-left">
                <div className="mb-4">
                  <h3 className="font-medium text-black/90 text-base mb-1">
                    Category and Tag
                  </h3>
                  <p className="text-sm text-black/60">
                    Categorization helps customers discover your activity
                    through search and filtering.
                  </p>
                </div>
                {/* Category Section */}
                <div className="flex-1 space-y-4">
                  <div className="flex space-x-8 mt-12">
                    <label className="text-sm font-medium text-black/80">
                      Category
                    </label>
                    <div className="text-sm text-[#0e63be]">
                      {formData.category_name || "Not selected"}
                    </div>
                  </div>

                  {/* Tags Section */}
                  <div className="flex space-x-8">
                    {formData.tags && formData.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag, index) => (
                          <div
                            key={index}
                            className="px-6 py-1 rounded-full bg-blue-100 text-[#0e63be]"
                          >
                            <span className="text-xs font-medium">
                              {tag.name || `Tag ${tag.tag_id}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full px-4 py-2 text-sm text-black/60 rounded-sm">
                        No tags selected
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Travel Companions Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="mb-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-left text-black/90 text-base mb-1">
                      This activity is best suited for
                    </h3>
                    <button
                      onClick={handleEditCompanions}
                      className="hover:bg-gray-100 p-1.5 rounded transition-colors"
                    >
                      {isEditingCompanions ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Settings2 size={16} className="text-black/60" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-black/60 text-left mb-6">
                    Let customers know who would enjoy this activity the most,
                    from solo travelers to families.
                  </p>
                </div>

                {isEditingCompanions ? (
                  <div className="space-y-4">
                    {/* Selected companions */}
                    {editedCompanions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {editedCompanions.map((companion, index) => (
                          <div
                            key={index}
                            className="relative px-6 py-1 rounded-full bg-blue-100 text-[#0e63be] pr-8"
                          >
                            <span className="text-xs font-medium">
                              {companion}
                            </span>
                            <button
                              onClick={() => removeCompanion(companion)}
                              className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-red-400 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full px-4 py-2 text-sm text-black/60 rounded-xl border border-gray-300 bg-gray-50">
                        No companions selected
                      </div>
                    )}

                    {/* Available companions to add */}
                    {TRAVEL_COMPANIONS.filter(
                      (tc) => !editedCompanions.includes(tc.label)
                    ).length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-black/60 mb-2">Add more:</p>
                        <div className="flex flex-wrap gap-2">
                          {TRAVEL_COMPANIONS.filter(
                            (tc) => !editedCompanions.includes(tc.label)
                          ).map((companion) => (
                            <button
                              key={companion.id}
                              onClick={() => addCompanion(companion.label)}
                              className="relative px-6 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-[#0e63be] transition-colors pr-8"
                            >
                              <span className="text-xs font-medium">
                                {companion.label}
                              </span>
                              <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-blue-400 text-white rounded-full text-xs">
                                +
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {companions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {companions.map((companion, index) => (
                          <div
                            key={index}
                            className="px-6 py-1 rounded-full bg-blue-100 text-[#0e63be]"
                          >
                            <span className="text-xs font-medium">
                              {companion}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full px-4 py-2 text-sm text-black/60 rounded-xl border border-gray-300 bg-gray-50">
                        No companions selected
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* RIGHT COL - DESTINATION & IMAGES */}
            <div className="flex flex-col gap-6 border rounded-xl p-6 border-gray-200 flex-1 h-fit bg-white">
              {/* Destination Section */}
              <div>
                <div className="mb-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-left text-black/90 text-base mb-1">
                      Location of the activity
                    </h3>
                    <button
                      onClick={handleEditLocation}
                      className="hover:bg-gray-100 p-1.5 rounded transition-colors"
                    >
                      {isEditingLocation ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Settings2 size={16} className="text-black/60" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-black/60 text-left">
                    Verify the location details where customers will experience
                    this activity.
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between mt-12">
                      <label className=" text-black/60">Name</label>
                      {isEditingLocation ? (
                        <input
                          type="text"
                          value={editedLocation.destination_name}
                          onChange={(e) =>
                            handleLocationChange(
                              "destination_name",
                              e.target.value
                            )
                          }
                          className=" text-[#0e63be] border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                          placeholder="Not specified"
                        />
                      ) : (
                        <div className="">
                          {formData.destination_name || "Not specified"}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <label className=" text-black/60">City</label>
                      {isEditingLocation ? (
                        <input
                          type="text"
                          value={editedLocation.city}
                          onChange={(e) =>
                            handleLocationChange("city", e.target.value)
                          }
                          className="text-[#0e63be] border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                          placeholder="Not specified"
                        />
                      ) : (
                        <div className="">
                          {formData.city || "Not specified"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <label className=" text-black/60">
                      Description or Landmark
                    </label>
                    {isEditingLocation ? (
                      <input
                        type="text"
                        value={editedLocation.destination_description}
                        onChange={(e) =>
                          handleLocationChange(
                            "destination_description",
                            e.target.value
                          )
                        }
                        className=" text-[#0e63be] border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                        placeholder="No description provided"
                      />
                    ) : (
                      <div className="">
                        {formData.destination_description ||
                          "No description provided"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="mb-4">
                  <h3 className="font-medium text-left text-black/90 text-base mb-1">
                    Images
                  </h3>
                  <p className="text-sm text-black/60 text-left">
                    Visual content helps customers understand what to expect
                    from your activity.
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto px-4">
                  {formData.images && formData.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {formData.images.map((img, index) => {
                        const uri = typeof img === "string" ? img : img.uri;
                        const name =
                          typeof img === "string"
                            ? `Image ${index + 1}`
                            : img.name;
                        const size = typeof img === "string" ? null : img.size;

                        return (
                          <div key={index} className="relative">
                            {/* Image Preview */}
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={uri}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                              {/* Fallback if image fails to load */}
                              <div
                                className="w-full h-full flex items-center justify-center text-gray-400"
                                style={{ display: "none" }}
                              >
                                <FileImage size={24} />
                              </div>
                            </div>

                            {/* Image Info */}
                            <div className="mt-1">
                              <p
                                className="text-xs text-gray-600 truncate"
                                title={name}
                              >
                                {name}
                              </p>
                              {size && (
                                <p className="text-xs text-gray-400">
                                  {formatFileSize(size)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                      <FileImage size={32} className="mb-2" />
                      <p className="text-sm text-black/60">
                        No images uploaded
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        No images were added to this experience
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmit;
