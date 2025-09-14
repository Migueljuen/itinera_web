// CHILD ELEMENT / SUBMIT SCREEN / STEP 6

import { useNavigate } from "react-router-dom";
import React from 'react';
import { FileImage } from "lucide-react";

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

                    {/* TWO COL */}
                    <div className="flex flex-row justify-between gap-8">
                        {/* LEFT COL */}
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
                                        {formData.tags.map((tagId, index) => (
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

                        {/* RIGHT COL */}
                        <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-1 h-fit">
                            {/* Availability Section */}
                            <div className="pb-4">
                                <h3 className="block font-medium py-2 text-left text-black/90">Availability</h3>
                                {formData.availability && formData.availability.length > 0 ? (
                                    <div className="space-y-3">
                                        {formData.availability.map((day, dayIndex) => (
                                            <div key={dayIndex} className="rounded-xl border border-gray-300 bg-gray-50 p-4">
                                                <h4 className="text-sm font-medium text-gray-800 mb-2">{day.day_of_week}</h4>
                                                <div className="space-y-1">
                                                    {day.time_slots.map((slot, slotIndex) => (
                                                        <div key={slotIndex} className="text-sm text-gray-600">
                                                            {slot.start_time} - {slot.end_time}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full p-4 text-sm text-gray-500 rounded-xl border border-gray-300 bg-gray-50">
                                        No availability set
                                    </div>
                                )}
                            </div>

                            {/* Destination Section */}
                            <div className="pb-4 border-t border-gray-200 pt-4">
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
                                            <div className="w-full p-4 text-sm text-gray-800 rounded-xl border border-gray-300 bg-gray-50 min-h-[80px]">
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