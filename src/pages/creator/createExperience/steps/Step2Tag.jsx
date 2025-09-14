import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import API_URL from "../../../../constants/api";
import { motion } from "framer-motion";
const TagCard = ({ tag, isSelected, onToggle }) => (
  <button
    onClick={() => onToggle(tag.tag_id)}
    className={`
      relative p-6 rounded-xl border-2 transition-all duration-200 text-center
      ${
        isSelected
          ? "border-gray-900 bg-gray-50 shadow-md"
          : "border-gray-300 bg-white hover:border-gray-400 "
      }
    `}
  >
    <div className="flex flex-col items-center">
      <div className={`mb-3 ${isSelected ? "text-gray-900" : "text-gray-400"}`}>
        {isSelected ? <CheckCircle2 size={24} /> : <Circle size={24} />}
      </div>
      <h4 className="font-medium text-gray-900">{tag.name}</h4>
    </div>
  </button>
);

const Step2Tag = ({ formData = { tags: [] }, setFormData, onNext, onBack }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all tags from the API
        const response = await fetch(`${API_URL}/tags/`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Filter tags by the selected category_id
        const categoryTags = data.tags.filter(
          (tag) => tag.category_id === formData.category_id
        );

        setAvailableTags(categoryTags);
        console.log(
          "Tags for category_id",
          formData.category_id,
          ":",
          categoryTags
        );
      } catch (err) {
        console.error("Failed to load tags:", err);
        setError(err.message);
        setAvailableTags([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if category is selected
    if (formData.category_id) {
      fetchTags();
    } else {
      setLoading(false);
    }
  }, [formData.category_id]);

  const toggleTag = (tagId) => {
    const currentTags = formData.selectedTags || [];
    if (currentTags.includes(tagId)) {
      setFormData({
        ...formData,
        selectedTags: currentTags.filter((id) => id !== tagId),
      });
    } else {
      setFormData({
        ...formData,
        tags: [...currentTags, tagId],
      });
    }
  };

  const selectedTags = formData.tags || [];
  const canProceed = selectedTags.length > 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin mr-3" size={24} />
          <span className="text-gray-600">Loading tags...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <p className="text-red-600 mb-4">Error loading tags: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 mr-4"
        >
          Retry
        </button>
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!formData.category_id) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <p className="text-gray-600">Please select a category first.</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (availableTags.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <p className="text-gray-600 mb-4">
          No tags available for this category.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12 overflow-visible">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
          How would you describe this experience?
        </h1>

        {formData.category_id && (
          <motion.div
            layoutId={`category-${formData.category_id}`}
            className="px-12 py-8 my-8 rounded-xl shadow-xl bg-white inline-block"
          >
            <img
              src={formData.category_image}
              alt={formData.category_name}
              className="   w-24 h-24 mx-auto mb-6 rounded-xl flex items-center justify-center overflow-hidden"
            />
            {/* Category Name */}
            <h3 className="text-base font-medium text-gray-900 text-center leading-tight min-h-10">
              {formData.category_name}
            </h3>
          </motion.div>
        )}
      </div>
      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {availableTags.map((tag) => (
          <TagCard
            key={tag.tag_id}
            tag={tag}
            isSelected={selectedTags.includes(tag.tag_id)}
            onToggle={toggleTag}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            canProceed
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Step2Tag;
