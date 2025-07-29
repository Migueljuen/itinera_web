import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const TRAVEL_COMPANIONS = ['Solo', 'Partner', 'Family', 'Friends', 'Group', 'Any'];

const Step3Tags = ({ formData, setFormData, onNext, onBack }) => {
    const [availableTags, setAvailableTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const response = await fetch(`${API_URL}/tags`);
                const data = await response.json();
                setAvailableTags(data.tags);
            } catch (err) {
                console.error('Failed to load tags:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, []);

    const toggleTag = (tagId) => {
        if (formData.tags.includes(tagId)) {
            setFormData({
                ...formData,
                tags: formData.tags.filter((id) => id !== tagId),
            });
        } else {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagId],
            });
        }
    };

    const toggleCompanion = (companion) => {
        // Initialize travel_companions as empty array if it doesn't exist
        const currentCompanions = formData.travel_companions || [];

        if (currentCompanions.includes(companion)) {
            setFormData({
                ...formData,
                travel_companions: currentCompanions.filter((c) => c !== companion),
                travel_companion: '' // Clear the old single value
            });
        } else {
            setFormData({
                ...formData,
                travel_companions: [...currentCompanions, companion],
                travel_companion: '' // Clear the old single value
            });
        }
    };

    // Use the new array format
    const selectedCompanions = formData.travel_companions || [];

    return (
        <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto">
            <div className="text-center py-2">
                <h2 className="text-center text-xl font-semibold mb-2">Select Tags</h2>
                <p className="text-center text-sm text-gray-500 mb-6 w-3/4 mx-auto">
                    Choose tags to categorize and help others discover your experience.
                </p>

                {/* Travel Companion Selection */}
                <div className="mb-6">
                    <label className="block font-medium text-base mb-2 text-left">
                        What's this experience best suited with?
                    </label>
                    <div className="flex flex-wrap gap-2 justify-start">
                        {TRAVEL_COMPANIONS.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => toggleCompanion(option)}
                                className={`px-4 py-2 rounded-full border transition-colors duration-200 ${selectedCompanions.includes(option)
                                        ? 'bg-gray-700 border-gray-700 text-white'
                                        : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    {selectedCompanions.length > 0 && (
                        <p className="text-sm text-gray-500 mt-2 text-left">
                            Selected: {selectedCompanions.length} companion{selectedCompanions.length > 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-4 border-t pt-8 border-gray-200">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 size={32} className="animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading tags...</span>
                        </div>
                    ) : (
                        <div className="bg-white pb-4">
                            <h3 className="font-medium py-2 text-left">Available tags</h3>
                            <div className="max-h-96 overflow-y-auto">
                                <div className="flex flex-wrap gap-2">
                                    {availableTags.map((tag) => (
                                        <button
                                            key={tag.tag_id}
                                            type="button"
                                            onClick={() => toggleTag(tag.tag_id)}
                                            className={`px-4 py-2 rounded-full border transition-colors duration-200 ${formData.tags.includes(tag.tag_id)
                                                    ? 'bg-gray-700 border-gray-700 text-white'
                                                    : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                                                }`}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Selected Tags Display */}
                    <div className="bg-white pb-4">
                        <h3 className="font-medium py-2 text-left">
                            Selected tags ({formData.tags.length})
                        </h3>
                        <div className="min-h-[6rem] max-h-40 overflow-y-auto">
                            {formData.tags.length === 0 ? (
                                <div className="flex items-center justify-center h-24 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                    <p className="text-sm">No tags selected yet</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {availableTags
                                        .filter(tag => formData.tags.includes(tag.tag_id))
                                        .map((tag) => (
                                            <div
                                                key={tag.tag_id}
                                                className="flex items-center bg-gray-700 px-4 py-2 rounded-full"
                                            >
                                                <span className="text-white text-sm">{tag.name}</span>
                                                <button
                                                    onClick={() => toggleTag(tag.tag_id)}
                                                    className="ml-2 text-white hover:text-gray-300 transition-colors"
                                                    aria-label={`Remove ${tag.name} tag`}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={onBack}
                            className="flex-1 border border-blue-600 text-gray-800 p-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Previous step
                        </button>
                        <button
                            onClick={formData.tags.length > 0 && selectedCompanions.length > 0 ? onNext : undefined}
                            disabled={!(formData.tags.length > 0 && selectedCompanions.length > 0)}
                            className={`flex-1 p-4 px-6 rounded-xl font-medium transition-colors ${formData.tags.length > 0 && selectedCompanions.length > 0
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Next step
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step3Tags;