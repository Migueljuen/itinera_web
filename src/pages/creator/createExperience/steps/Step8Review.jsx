// CHILD ELEMENT / SUBMIT SCREEN / STEP 6

import { useNavigate } from "react-router-dom";
import React from 'react';

const ReviewSubmit = ({ formData, onBack, onSubmit, isSubmitting }) => {
    const navigate = useNavigate();

    // Get travel companions array
    const companions = formData.travel_companions || [];

    return (
        <div className="text-center py-2 max-h-screen overflow-y-auto">
            <h2 className="text-center text-xl font-semibold mb-2">Review and Submit</h2>
            <p className="text-center text-sm text-gray-500 mb-6 w-3/4 mx-auto">
                Please review your experience details before submitting.
            </p>

            <div className="flex flex-col gap-4 border-t pt-12 border-gray-200">
                {/* Basic Details Section */}
                <div className="bg-white pb-4">
                    <h3 className="font-medium py-2 text-gray-800">Basic Details</h3>
                    <div className="rounded-xl border border-gray-200 p-4">
                        <div className="border-b border-gray-100 pb-2 mb-2">
                            <span className="text-sm text-gray-500 block">Title</span>
                            <span className="text-gray-800">{formData.title}</span>
                        </div>
                        <div className="border-b border-gray-100 pb-2 mb-2">
                            <span className="text-sm text-gray-500 block">Description</span>
                            <span className="text-gray-800">{formData.description}</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 block">Price</span>
                            <span className="text-gray-800">₱{formData.price} per {formData.unit}</span>
                        </div>
                    </div>
                </div>

                {/* Availability Section */}
                <div className="bg-white pb-4">
                    <h3 className="font-medium py-2 text-gray-800">Availability</h3>
                    <div className="rounded-xl border border-gray-200 p-4">
                        {formData.availability && formData.availability.length > 0 ? (
                            formData.availability.map((day, dayIndex) => (
                                <div key={dayIndex} className="mb-3">
                                    <h4 className="text-gray-900 font-medium mb-1">{day.day_of_week}</h4>
                                    {day.time_slots.map((slot, slotIndex) => (
                                        <div
                                            key={slotIndex}
                                            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                                        >
                                            <span className="text-gray-800">{slot.start_time} - {slot.end_time}</span>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-2">No availability set</p>
                        )}
                    </div>
                </div>

                {/* Travel Companions Section */}
                <div className="bg-white pb-4">
                    <h3 className="font-medium py-2 text-gray-800">Travel Companions</h3>
                    <div className="rounded-xl border border-gray-200 p-4">
                        {companions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {companions.map((companion, index) => (
                                    <div key={index} className="bg-gray-100 px-4 py-2 rounded-full">
                                        <span className="text-gray-800">{companion}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-2">No companions selected</p>
                        )}
                    </div>
                </div>

                {/* Tags Section */}
                <div className="bg-white pb-4">
                    <h3 className="font-medium py-2 text-gray-800">Tags</h3>
                    <div className="rounded-xl border border-gray-200 p-4">
                        {formData.tags && formData.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tagId, index) => (
                                    <div key={index} className="bg-gray-100 px-4 py-2 rounded-full">
                                        <span className="text-gray-800">Tag {tagId}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-2">No tags selected</p>
                        )}
                    </div>
                </div>

                {/* Destination Section */}
                <div className="bg-white pb-4">
                    <h3 className="font-medium py-2 text-gray-800">Destination</h3>
                    <div className="rounded-xl border border-gray-200 p-4">
                        {formData.useExistingDestination && formData.destination_id ? (
                            <span className="text-gray-800">Using existing destination (ID: {formData.destination_id})</span>
                        ) : (
                            <>
                                <div className="border-b border-gray-100 pb-2 mb-2">
                                    <span className="text-sm text-gray-500 block">Name</span>
                                    <span className="text-gray-800">{formData.destination_name}</span>
                                </div>
                                <div className="border-b border-gray-100 pb-2 mb-2">
                                    <span className="text-sm text-gray-500 block">City</span>
                                    <span className="text-gray-800">{formData.city}</span>
                                </div>
                                <div className="border-b border-gray-100 pb-2 mb-2">
                                    <span className="text-sm text-gray-500 block">Description</span>
                                    <span className="text-gray-800">{formData.destination_description}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">Coordinates</span>
                                    <span className="text-gray-800">{formData.latitude}, {formData.longitude}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Images Section */}
                <div className="bg-white pb-4">
                    <h3 className="font-medium py-2 text-gray-800">Images</h3>
                    <div className="rounded-xl border border-gray-200 p-4">
                        {formData.images && formData.images.length > 0 ? (
                            <div className="flex gap-3 py-2 overflow-x-auto">
                                {formData.images.map((img, index) => {
                                    const uri = typeof img === 'string' ? img : img.uri;
                                    return (
                                        <div key={index} className="flex-shrink-0">
                                            <img
                                                src={uri}
                                                alt={`Experience image ${index + 1}`}
                                                className="w-24 h-24 rounded-xl object-cover"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-2">No images uploaded</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-between mt-4 gap-4">
                    <button
                        onClick={onBack}
                        className="border border-blue-500 p-4 rounded-xl disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        <span className="text-gray-800 font-medium">Previous step</span>
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                onSubmit('draft');
                                navigate("/dashboard");
                            }}
                            disabled={isSubmitting}
                            className={`p-4 px-6 rounded-xl border border-blue-500 ${isSubmitting ? 'bg-gray-100' : 'bg-white'
                                } disabled:opacity-50`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span className="text-center font-medium text-base text-blue-500">Save as Draft</span>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                onSubmit('active');
                                navigate("/dashboard");
                            }}
                            disabled={isSubmitting}
                            className={`p-4 px-6 rounded-xl ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500'
                                } disabled:opacity-50`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span className="text-center font-medium text-base text-white">Publish</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewSubmit;