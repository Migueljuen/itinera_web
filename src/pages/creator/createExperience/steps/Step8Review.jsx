// CHILD ELEMENT / SUBMIT SCREEN / STEP 6

import { useNavigate } from "react-router-dom";
import React from 'react';
import { FileImage, Clock } from "lucide-react";

const ReviewSubmit = ({ formData, onBack, onSubmit, isSubmitting }) => {
    const navigate = useNavigate();

    console.log("Form Data in ReviewSubmit:", formData);
    // Get travel companions array
    const companions = formData.travel_companions || [];

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // Helper function to convert military time to standard time
    const convertToStandardTime = (militaryTime) => {
        if (!militaryTime) return '';

        // Extract hours and minutes from HH:MM format
        const [hours, minutes] = militaryTime.split(':');
        const hour24 = parseInt(hours, 10);

        // Convert to 12-hour format
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const period = hour24 < 12 ? 'AM' : 'PM';

        return `${hour12}:${minutes}${period}`;
    };

    // Calendar helper function
    const renderAvailabilityCalendar = () => {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Create a map of availability by day
        const availabilityMap = {};
        if (formData.availability && formData.availability.length > 0) {
            formData.availability.forEach(day => {
                availabilityMap[day.day_of_week] = day.time_slots;
            });
        }

        return (
            <div className="grid grid-cols-7 gap-2">
                {/* Header row with day names */}
                {shortDays.map((day, index) => (
                    <div key={index} className="text-center text-xs font-medium text-gray-600 py-2">
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {daysOfWeek.map((fullDay, index) => {
                    const hasAvailability = availabilityMap[fullDay];
                    const shortDay = shortDays[index];

                    return (
                        <div
                            key={index}
                            className={`flex flex-col justify-between h-full
                                relative p-3 my-auto border rounded-lg  text-center
                             border-gray-300
                                }
                            `}
                        >


                            {/* Time slots */}
                            {hasAvailability ? (
                                <div className="space-y-2">
                                    {hasAvailability.slice(0, 2).map((slot, slotIndex) => (
                                        <div
                                            key={slotIndex}
                                            className="text-[10.5px] bg-[#376a63] rounded py-1 text-white/90 "
                                            title={`${convertToStandardTime(slot.start_time)} - ${convertToStandardTime(slot.end_time)}`}
                                        >
                                            <div className="flex items-center justify-center gap-0.5">

                                                <span className="truncate">
                                                    {convertToStandardTime(slot.start_time)} - {convertToStandardTime(slot.end_time)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {hasAvailability.length > 2 && (
                                        <div className="text-xs text-green-600 font-medium">
                                            +{hasAvailability.length - 2} more
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400 mt-2">
                                    Not available
                                </div>
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
                        <div>
                            <h2 className="text-left text-xl font-semibold mb-2 text-black/90">
                                Review & Submit
                            </h2>
                            <p className="text-left text-sm text-black/60">
                                Please review your experience details before submitting.
                            </p>
                        </div>
                    </div>

                    {/* FULL WIDTH AVAILABILITY SECTION */}
                    <div className="mb-8">
                        <div className="border rounded-xl p-6 border-gray-300 bg-white">
                            <h3 className="block font-medium text-left text-black/90 mb-4 text-lg">Weekly Availability</h3>
                            {formData.availability && formData.availability.length > 0 ? (
                                <div className=" rounded-lg border border-gray-200 p-6">
                                    {renderAvailabilityCalendar()}

                                    {/* Legend */}
                                    <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-[#376a63] border border-green-200 rounded"></div>
                                            <span className="text-sm text-gray-600">Available</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                                            <span className="text-sm text-gray-600">Not Available</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full p-6 text-sm text-gray-500 rounded-xl border border-gray-300 bg-gray-50 text-center">
                                    No availability set
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TWO COL - EXPERIENCE DETAILS & DESTINATION */}
                    <div className="flex flex-row justify-between gap-8">
                        {/* LEFT COL - EXPERIENCE DETAILS */}
                        <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-1 h-fit">
                            {/* Basic Details Section */}
                            <div className="pb-4">
                                <h3 className="block font-medium py-2 text-left text-black/90">Basic Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
                                        <div className="w-full p-4 text-sm text-gray-800 rounded-xl border border-gray-300 bg-gray-50">
                                            {formData.title || "Not specified"}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                                        <div className="w-full p-4 text-sm text-gray-800 rounded-xl border border-gray-300 bg-gray-50 min-h-[100px]">
                                            {formData.description || "No description provided"}
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Price</label>
                                            <div className="w-full p-4 text-sm text-gray-800 rounded-xl border border-gray-300 bg-gray-50">
                                                ₱{formData.price || "0"}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Charge per</label>
                                            <div className="w-full p-4 text-sm text-gray-800 rounded-xl border border-gray-300 bg-gray-50">
                                                {formData.unit || "Not specified"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Category Section */}
                            <div className="pb-4 border-t border-gray-200 pt-4">
                                <h3 className="block font-medium py-2 text-left text-black/90">Category</h3>
                                <div className="w-full p-4 text-sm text-gray-800 rounded-xl border border-gray-300 bg-gray-50">
                                    {formData.category_name || "Not selected"}
                                </div>
                            </div>

                            {/* Tags Section */}
                            <div className="pb-4 border-t border-gray-200 pt-4">
                                <h3 className="block font-medium py-2 text-left text-black/90">Tags</h3>
                                {formData.tags && formData.tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((name, index) => (
                                            <div key={index} className="px-6 py-2 rounded-xl bg-black/80 text-white">
                                                <span className="text-sm font-medium">Tag {tagId}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full p-4 text-sm text-gray-500 rounded-xl border border-gray-300 bg-gray-50">
                                        No tags selected
                                    </div>
                                )}
                            </div>

                            {/* Travel Companions Section */}
                            <div className="pb-4 border-t border-gray-200 pt-4">
                                <h3 className="block font-medium py-2 text-left text-black/90">Travel Companions</h3>
                                {companions.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {companions.map((companion, index) => (
                                            <div key={index} className="px-6 py-2 rounded-xl bg-black/80 text-white">
                                                <span className="text-sm font-medium">{companion}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full p-4 text-sm text-gray-500 rounded-xl border border-gray-300 bg-gray-50">
                                        No companions selected
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COL - DESTINATION & IMAGES */}
                        <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-1 h-fit">
                            {/* Destination Section */}
                            <div className="pb-4">
                                <h3 className="block font-medium py-2 text-left text-black/90">Destination</h3>
                                {formData.useExistingDestination && formData.destination_id ? (
                                    <div className="w-full p-4 text-sm text-gray-800 rounded-xl border border-gray-300 bg-gray-50">
                                        Using existing destination (ID: {formData.destination_id})
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                                            <div className="w-full p-4 text-sm text-gray-800 rounded-xl border border-gray-300 bg-gray-50">
                                                {formData.destination_name || "Not specified"}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">City</label>
                                            <div className="w-full p-4 text-sm text-gray-800 rounded-xl border border-gray-300 bg-gray-50">
                                                {formData.city || "Not specified"}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                                            <div className="w-full p-4  text-sm text-gray-800 rounded-xl border border-gray-300 bg-gray-50 min-h-[80px]">
                                                {formData.destination_description || "No description provided"}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Coordinates</label>
                                            <div className="w-full p-4 text-sm text-gray-800 rounded-xl border border-gray-300 bg-gray-50">
                                                {formData.latitude && formData.longitude
                                                    ? `${formData.latitude}, ${formData.longitude}`
                                                    : "Not specified"
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Images Section */}
                            <div className="pb-4 border-t border-gray-200 pt-4">
                                <h3 className="block font-medium py-2 text-left text-black/90">Images</h3>
                                <div className="max-h-64 overflow-y-auto">
                                    {formData.images && formData.images.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {formData.images.map((img, index) => {
                                                const uri = typeof img === 'string' ? img : img.uri;
                                                const name = typeof img === 'string' ? `Image ${index + 1}` : img.name;
                                                const size = typeof img === 'string' ? null : img.size;

                                                return (
                                                    <div key={index} className="relative">
                                                        {/* Image Preview */}
                                                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                                            <img
                                                                src={uri}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                            {/* Fallback if image fails to load */}
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ display: 'none' }}>
                                                                <FileImage size={24} />
                                                            </div>
                                                        </div>

                                                        {/* Image Info */}
                                                        <div className="mt-1">
                                                            <p className="text-xs text-gray-600 truncate" title={name}>
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
                                            <p className="text-sm text-gray-500">No images uploaded</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                No images were added to this experience
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="px-8 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous Step
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    onSubmit('draft');
                                    navigate("/dashboard");
                                }}
                                disabled={isSubmitting}
                                className="px-8 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    "Save as Draft"
                                )}
                            </button>

                            <button
                                onClick={() => {
                                    onSubmit('active');
                                    navigate("/dashboard");
                                }}
                                disabled={isSubmitting}
                                className="px-8 py-3 rounded-lg font-medium bg-black/80 text-white hover:bg-black/70 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    "Publish Experience"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewSubmit;