import React, { useState } from "react";
import { Plus, Trash2, GripVertical, Save, Loader2, CheckCircle, ChevronUp, ChevronDown, ArrowLeft, } from "lucide-react";
import toast from "react-hot-toast";

const Step5ExperienceSteps = ({
  formData,
  setFormData,
  onNext,
  onBack,
  isEditMode = false,
  onSave,
  isSaving = false,
}) => {
  const [steps, setSteps] = useState(
    formData.steps?.length > 0
      ? formData.steps
      : [{ title: "", description: "" }]
  );

  const [inclusions, setInclusions] = useState(
    formData.inclusions?.length > 0
      ? formData.inclusions
      : [{ title: "" }]
  );

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
    setFormData({ ...formData, steps: updatedSteps });
  };

  const handleInclusionChange = (index, value) => {
    const updatedInclusions = [...inclusions];
    updatedInclusions[index].title = value;
    setInclusions(updatedInclusions);
    setFormData({ ...formData, inclusions: updatedInclusions });
  };

  const addStep = () => {
    const newSteps = [...steps, { title: "", description: "" }];
    setSteps(newSteps);
    setFormData({ ...formData, steps: newSteps });
    toast.success("New step added");
  };

  const addInclusion = () => {
    const newInclusions = [...inclusions, { title: "" }];
    setInclusions(newInclusions);
    setFormData({ ...formData, inclusions: newInclusions });
    toast.success("New inclusion added");
  };

  const removeStep = (index) => {
    if (steps.length === 1) {
      toast.error("You must have at least one step");
      return;
    }
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
    setFormData({ ...formData, steps: updatedSteps });
    toast.success("Step removed");
  };

  const removeInclusion = (index) => {
    if (inclusions.length === 1) {
      toast.error("You must have at least one inclusion");
      return;
    }
    const updatedInclusions = inclusions.filter((_, i) => i !== index);
    setInclusions(updatedInclusions);
    setFormData({ ...formData, inclusions: updatedInclusions });
    toast.success("Inclusion removed");
  };

  const moveStep = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updatedSteps = [...steps];
    [updatedSteps[index], updatedSteps[newIndex]] = [
      updatedSteps[newIndex],
      updatedSteps[index],
    ];
    setSteps(updatedSteps);
    setFormData({ ...formData, steps: updatedSteps });
  };

  const moveInclusion = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === inclusions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updatedInclusions = [...inclusions];
    [updatedInclusions[index], updatedInclusions[newIndex]] = [
      updatedInclusions[newIndex],
      updatedInclusions[index],
    ];
    setInclusions(updatedInclusions);
    setFormData({ ...formData, inclusions: updatedInclusions });
  };

  const handleContinue = () => {
    // Validate all steps have required fields
    const hasEmptyStepFields = steps.some(
      (step) => !step.title.trim() || !step.description.trim()
    );

    if (hasEmptyStepFields) {
      toast.error("Please fill in all step titles and descriptions");
      return;
    }

    if (steps.length === 0) {
      toast.error("Please add at least one step");
      return;
    }

    // Validate inclusions
    const hasEmptyInclusions = inclusions.some(
      (inclusion) => !inclusion.title.trim()
    );

    if (hasEmptyInclusions) {
      toast.error("Please fill in all inclusion titles");
      return;
    }

    if (inclusions.length === 0) {
      toast.error("Please add at least one inclusion");
      return;
    }

    onNext();
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave();
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto">
        <div className="text-center py-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-left text-xl font-semibold mb-2 text-black/90">
                Experience Details
              </h2>
              <p className="text-left text-sm text-black/60 mb-6">
                Break down your experience into clear steps and list what's included in the price.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex items-center justify-center gap-2 px-8 py-3 text-sm border-2 border-gray-300 text-gray-700 rounded-xl max-h-[44px] font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={20} />
                Previous Step
              </button>

              {isEditMode && onSave && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 rounded-lg font-medium bg-[#376a63] text-white text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleContinue}
                disabled={isSaving}
                className="px-8 py-3 rounded-lg font-medium bg-black/80 text-white text-sm hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>

          {/* Main Content - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN - Experience Steps */}
            <div className="border rounded-xl p-6 border-gray-300 bg-white">
              <div className="flex items-center justify-between mb-6">
                <div className="text-left">
                  <h3 className="font-medium text-black/90 text-base">Activity Steps</h3>
                  <p className="text-sm text-black/60 mt-1">
                    Add steps in the order they'll happen during the experience
                  </p>
                </div>
                <button
                  onClick={addStep}
                  className="flex items-center gap-2 px-4 py-2 bg-black/80 text-white text-sm rounded-lg hover:bg-black/70 transition-colors"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Step Number & Move Controls */}
                      <div className="flex flex-col items-center gap-2 pt-1">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-black/80 text-white text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveStep(index, "up")}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <ChevronUp size={14} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => moveStep(index, "down")}
                            disabled={index === steps.length - 1}
                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <ChevronDown size={14} className="text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-black/90 mb-2 text-left">
                            Step Title
                          </label>
                          <input
                            type="text"
                            placeholder={`E.g. ${index === 0
                              ? "Meet at the starting point"
                              : index === 1
                                ? "Begin the journey"
                                : "Explore the destination"
                              }`}
                            value={step.title}
                            onChange={(e) =>
                              handleStepChange(index, "title", e.target.value)
                            }
                            className="w-full px-4 py-2 text-sm text-gray-800 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-black/90 mb-2 text-left">
                            Step Description
                          </label>
                          <textarea
                            placeholder="Describe what happens in this step..."
                            value={step.description}
                            onChange={(e) =>
                              handleStepChange(index, "description", e.target.value)
                            }
                            className="w-full p-4 text-sm text-gray-800 h-24 rounded-sm border border-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeStep(index)}
                        disabled={steps.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Remove step"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Helper Text */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Tip:</strong> Think of this as a mini itinerary. Include meeting points, activities, and special moments that make your experience unique.
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN - Inclusions */}
            <div className="border rounded-xl p-6 border-gray-300 bg-white">
              <div className="flex items-center justify-between mb-6">
                <div className="text-left">
                  <h3 className="font-medium text-black/90 text-base">What's Included</h3>
                  <p className="text-sm text-black/60 mt-1">
                    List everything included in the price
                  </p>
                </div>
                <button
                  onClick={addInclusion}
                  className="flex items-center gap-2 px-4 py-2 bg-black/80 text-white text-sm rounded-lg hover:bg-black/70 transition-colors"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              {/* Inclusions List */}
              <div className="space-y-2">
                {inclusions.map((inclusion, index) => (
                  <div
                    key={index}
                    className="rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">


                      {/* Move Controls */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveInclusion(index, "up")}
                          disabled={index === 0}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ChevronUp size={12} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => moveInclusion(index, "down")}
                          disabled={index === inclusions.length - 1}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ChevronDown size={12} className="text-gray-600" />
                        </button>
                      </div>

                      {/* Input */}
                      <input
                        type="text"
                        placeholder={`E.g. ${index === 0
                          ? "Professional guide"
                          : index === 1
                            ? "Equipment rental"
                            : "Entrance fees"
                          }`}
                        value={inclusion.title}
                        onChange={(e) =>
                          handleInclusionChange(index, e.target.value)
                        }
                        className="flex-1 px-4 py-2 text-sm text-gray-800 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />

                      {/* Remove Button */}
                      <button
                        onClick={() => removeInclusion(index)}
                        disabled={inclusions.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Remove inclusion"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Helper Text */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Tip:</strong> Be specific about what's included. This helps set clear expectations for travelers.
                </p>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5ExperienceSteps;