import React, { useEffect, useState } from "react";
import {
  Loader2,
  Search,
  X,
  Users,
  Tag,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

// Mock API data for demo
const mockTags = [
  { tag_id: 1, name: "Adventure", category: "Activity" },
  { tag_id: 2, name: "Cultural", category: "Experience" },
  { tag_id: 3, name: "Food & Drink", category: "Experience" },
  { tag_id: 4, name: "Nature", category: "Environment" },
  { tag_id: 5, name: "Historical", category: "Experience" },
  { tag_id: 6, name: "Beach", category: "Environment" },
  { tag_id: 7, name: "Mountains", category: "Environment" },
  { tag_id: 8, name: "Photography", category: "Activity" },
  { tag_id: 9, name: "Relaxation", category: "Activity" },
  { tag_id: 10, name: "Shopping", category: "Activity" },
  { tag_id: 11, name: "Nightlife", category: "Experience" },
  { tag_id: 12, name: "Local Experience", category: "Experience" },
  { tag_id: 13, name: "Budget-Friendly", category: "Price" },
  { tag_id: 14, name: "Luxury", category: "Price" },
  { tag_id: 15, name: "Family-Friendly", category: "Audience" },
];

const TRAVEL_COMPANIONS = [
  {
    id: "Solo",
    label: "Solo",
    icon: "🧳",
    description: "Perfect for solo travelers",
  },
  {
    id: "Partner",
    label: "Couple",
    icon: "💕",
    description: "Romantic experiences for two",
  },
  {
    id: "Family",
    label: "Family",
    icon: "👨‍👩‍👧‍👦",
    description: "Great for families with kids",
  },
  {
    id: "Friends",
    label: "Friends",
    icon: "👥",
    description: "Fun group activities",
  },
  {
    id: "Group",
    label: "Large Group",
    icon: "👫",
    description: "Suitable for bigger groups",
  },
  {
    id: "Any",
    label: "Anyone",
    icon: "🌟",
    description: "Works for all group sizes",
  },
];

const TagCategoryFilter = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => (
  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
    <button
      onClick={() => onCategoryChange(null)}
      className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
        activeCategory === null
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      All ({categories.reduce((sum, cat) => sum + cat.count, 0)})
    </button>
    {categories.map((category) => (
      <button
        key={category.name}
        onClick={() => onCategoryChange(category.name)}
        className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
          activeCategory === category.name
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {category.name} ({category.count})
      </button>
    ))}
  </div>
);

const CompanionCard = ({ companion, isSelected, onToggle }) => (
  <button
    onClick={() => onToggle(companion.id)}
    className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md ${
      isSelected
        ? "border-blue-500 bg-blue-50"
        : "border-gray-200 bg-white hover:border-gray-300"
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{companion.icon}</span>
          <h4 className="font-semibold text-gray-900">{companion.label}</h4>
        </div>
        <p className="text-sm text-gray-600">{companion.description}</p>
      </div>
      <div className={`ml-2 ${isSelected ? "text-blue-600" : "text-gray-400"}`}>
        {isSelected ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </div>
    </div>
  </button>
);

const TagButton = ({ tag, isSelected, onToggle }) => (
  <button
    onClick={() => onToggle(tag.tag_id)}
    className={`px-4 py-2 rounded-full border transition-all duration-200 hover:scale-105 ${
      isSelected
        ? "bg-blue-600 border-blue-600 text-white shadow-md"
        : "bg-white border-gray-200 text-gray-800 hover:border-blue-300 hover:bg-blue-50"
    }`}
  >
    {tag.name}
  </button>
);

const SelectedTagChip = ({ tag, onRemove }) => (
  <div className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-full group">
    <Tag size={14} className="mr-2" />
    <span className="text-sm font-medium">{tag.name}</span>
    <button
      onClick={() => onRemove(tag.tag_id)}
      className="ml-2 hover:bg-blue-700 rounded-full p-1 transition-colors"
      aria-label={`Remove ${tag.name} tag`}
    >
      <X size={14} />
    </button>
  </div>
);

const Step2Tag = ({
  formData = { tags: [], travel_companions: [] },
  setFormData,
  onNext,
  onBack,
}) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setAvailableTags(mockTags);
      } catch (err) {
        console.error("Failed to load tags:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const toggleTag = (tagId) => {
    const currentTags = formData.tags || [];
    if (currentTags.includes(tagId)) {
      setFormData({
        ...formData,
        tags: currentTags.filter((id) => id !== tagId),
      });
    } else {
      setFormData({
        ...formData,
        tags: [...currentTags, tagId],
      });
    }
  };

  const toggleCompanion = (companion) => {
    const currentCompanions = formData.travel_companions || [];
    if (currentCompanions.includes(companion)) {
      setFormData({
        ...formData,
        travel_companions: currentCompanions.filter((c) => c !== companion),
      });
    } else {
      setFormData({
        ...formData,
        travel_companions: [...currentCompanions, companion],
      });
    }
  };

  const selectedCompanions = formData.travel_companions || [];
  const selectedTags = formData.tags || [];

  // Filter tags based on search and category
  const filteredTags = availableTags.filter((tag) => {
    const matchesSearch = tag.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = !activeCategory || tag.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Get categories with counts
  const categories = [...new Set(availableTags.map((tag) => tag.category))].map(
    (category) => ({
      name: category,
      count: availableTags.filter((tag) => tag.category === category).length,
    })
  );

  const selectedTagObjects = availableTags.filter((tag) =>
    selectedTags.includes(tag.tag_id)
  );

  const canProceed = selectedTags.length > 0 && selectedCompanions.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Describe Your Experience
          </h1>
          <p className="text-gray-600">
            Help travelers find your experience by selecting relevant tags and
            ideal group types.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Travel Companions Section */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Who is this perfect for?
            </h2>
          </div>
          <p className="text-gray-600 mb-6">
            Select all group types that would enjoy this experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {TRAVEL_COMPANIONS.map((companion) => (
              <CompanionCard
                key={companion.id}
                companion={companion}
                isSelected={selectedCompanions.includes(companion.id)}
                onToggle={toggleCompanion}
              />
            ))}
          </div>

          {selectedCompanions.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800 font-medium">
                ✨ Selected for {selectedCompanions.length} group type
                {selectedCompanions.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Tag className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Add Tags</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Choose tags that best describe your experience to help travelers
            discover it.
          </p>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading tags...</span>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <TagCategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />

              {/* Available Tags */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  Available Tags ({filteredTags.length})
                </h3>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {filteredTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 ">
                      {filteredTags.map((tag) => (
                        <TagButton
                          key={tag.tag_id}
                          tag={tag}
                          isSelected={selectedTags.includes(tag.tag_id)}
                          onToggle={toggleTag}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Tag size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>No tags found matching "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Tags */}
              <div className="mb-8">
                <h3 className="font-medium text-gray-900 mb-3">
                  Selected Tags ({selectedTags.length})
                </h3>
                <div className="min-h-[4rem] border-2 border-dashed border-gray-200 rounded-lg p-4">
                  {selectedTagObjects.length === 0 ? (
                    <div className="flex items-center justify-center h-16 text-gray-400">
                      <p>
                        No tags selected yet. Click on tags above to add them.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedTagObjects.map((tag) => (
                        <SelectedTagChip
                          key={tag.tag_id}
                          tag={tag}
                          onRemove={toggleTag}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
            Previous Step
          </button>
          <button
            onClick={canProceed ? onNext : undefined}
            disabled={!canProceed}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              canProceed
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Continue
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Progress Summary */}
        {(selectedCompanions.length > 0 || selectedTags.length > 0) && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">
              Progress Summary
            </h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>
                ✓ {selectedCompanions.length} group type
                {selectedCompanions.length !== 1 ? "s" : ""} selected
              </p>
              <p>
                ✓ {selectedTags.length} tag
                {selectedTags.length !== 1 ? "s" : ""} selected
              </p>
              {!canProceed && (
                <p className="text-amber-700 mt-2">
                  ⚠️ Please select at least one group type and one tag to
                  continue
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2Tag;
