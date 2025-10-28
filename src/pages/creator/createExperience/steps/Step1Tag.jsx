import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Circle, Plus, X } from "lucide-react";
import API_URL from "../../../../constants/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const TagCard = ({ tag, isSelected, onToggle }) => (
  <button
    onClick={() => onToggle(tag.tag_id)}
    className={`
      relative p-6 rounded-xl border-2 transition-all duration-200 text-center
      ${
        isSelected
          ? "border-gray-900 bg-gray-50 shadow-md"
          : "border-gray-300 bg-white hover:border-gray-400"
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

const CustomTagCard = ({ isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      relative p-6 rounded-xl border-2 transition-all duration-200 text-center
      ${
        isActive
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-dashed border-gray-400 bg-white hover:border-gray-500"
      }
    `}
  >
    <div className="flex flex-col items-center">
      <div className={`mb-3 ${isActive ? "text-blue-500" : "text-gray-400"}`}>
        <Plus size={24} />
      </div>
      <h4 className="font-medium text-gray-900">Other</h4>
    </div>
  </button>
);

const CustomTagModal = ({ isOpen, onClose, onSubmit, categoryId }) => {
  const [tagName, setTagName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!tagName.trim()) return;

    setIsSubmitting(true);
    await onSubmit(tagName.trim());
    setIsSubmitting(false);
    setTagName("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Create Custom Tag
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tag Name
          </label>
          <input
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Rock Climbing"
            maxLength={50}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2">
            This tag will be added to your selected category
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!tagName.trim() || isSubmitting}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              tagName.trim() && !isSubmitting
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" size={16} />
                Creating...
              </span>
            ) : (
              "Add Tag"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Step1Tag = ({ formData = { tags: [] }, setFormData, onNext, onBack }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);

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

    if (formData.category_id) {
      fetchTags();
    } else {
      setLoading(false);
    }
  }, [formData.category_id]);

  const toggleTag = (tagId) => {
    const currentTags = formData.tags || [];
    const tagExists = currentTags.some((tag) => tag.tag_id === tagId);

    if (tagExists) {
      setFormData({
        ...formData,
        tags: currentTags.filter((tag) => tag.tag_id !== tagId),
      });
    } else {
      const tagToAdd = availableTags.find((tag) => tag.tag_id === tagId);
      setFormData({
        ...formData,
        tags: [...currentTags, tagToAdd],
      });
    }
  };

  const handleCreateCustomTag = async (tagName) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Creating custom tag...");

      // Call backend to create the tag
      const response = await fetch(`${API_URL}/tags/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tags: [
            {
              name: tagName,
              category_id: formData.category_id,
            },
          ],
        }),
      });

      const data = await response.json();

      toast.dismiss(loadingToast);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create tag");
      }

      // Get the newly created tag from the response
      const newTag = data.tags[0];

      // Add to available tags
      setAvailableTags((prev) => [...prev, newTag]);

      // Automatically select the newly created tag
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag],
      });

      // toast.success(`Tag "${tagName}" created successfully!`);
      setShowCustomModal(false);
    } catch (err) {
      console.error("Error creating custom tag:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to create custom tag"
      );
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

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center  overflow-visible">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            How would you describe this experience?
          </h1>

          {formData.category_id && (
            <motion.div
              layoutId={`category-${formData.category_id}`}
              className="px-12 py-8 my-8 rounded-2xl shadow-[0_2px_32px_-1px_rgba(0,0,0,0.15)] bg-white inline-block"
            >
              <img
                src={formData.category_image}
                alt={formData.category_name}
                className="w-24 h-24 mx-auto mb-6 rounded-xl flex items-center justify-center overflow-hidden"
              />
              <h3 className="text-base font-medium text-gray-900 text-center leading-tight min-h-10">
                {formData.category_name}
              </h3>
            </motion.div>
          )}
        </div>

        {/* Tags Grid */}
        <div className="grid grid-cols-3  gap-6">
          {availableTags.map((tag) => (
            <TagCard
              key={tag.tag_id}
              tag={tag}
              isSelected={selectedTags.some((t) => t.tag_id === tag.tag_id)}
              onToggle={toggleTag}
            />
          ))}

          {/* Custom Tag Option */}
          <CustomTagCard
            isActive={showCustomModal}
            onClick={() => setShowCustomModal(true)}
          />
        </div>

        {/* Selected Tags Summary */}
        {/* {selectedTags.length > 0 && (
          <div className="">
            <p className="text-sm text-black/60 mb-3">
              Selected tags ({selectedTags.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag.tag_id}
                  className="px-3 py-1 bg-gray-900 text-white rounded-full text-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )} */}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-12 max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-primary rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          Back
        </button>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            canProceed
              ? "bg-black/80 cursor-pointer text-white hover:bg-black/70"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>

      {/* Custom Tag Modal */}
      <CustomTagModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSubmit={handleCreateCustomTag}
        categoryId={formData.category_id}
      />
    </>
  );
};

export default Step1Tag;
