import React, { useState } from "react";
import { Plus, Trash2, GripVertical, Save, Loader2 } from "lucide-react";
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

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
    setFormData({ ...formData, steps: updatedSteps });
  };

  const addStep = () => {
    const newSteps = [...steps, { title: "", description: "" }];
    setSteps(newSteps);
    setFormData({ ...formData, steps: newSteps });
    toast.success("New step added");
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

  const handleContinue = () => {
    // Validate all steps have required fields
    const hasEmptyFields = steps.some(
      (step) => !step.title.trim() || !step.description.trim()
    );

    if (hasEmptyFields) {
      toast.error("Please fill in all step titles and descriptions");
      return;
    }

    if (steps.length === 0) {
      toast.error("Please add at least one step");
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
                Experience Steps
              </h2>
              <p className="text-left text-sm text-black/60 mb-6">
                Break down your experience into clear, engaging steps. This helps
                travelers understand what to expect.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
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

          {/* Main Content */}
          <div className="border rounded-xl p-6 border-gray-300 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="text-left">
                <h3 className="font-medium text-black/90">Activity Steps</h3>
                <p className="text-sm text-black/60 mt-1">
                  Add steps in the order they'll happen during the experience
                </p>
              </div>
              <button
                onClick={addStep}
                className="flex items-center gap-2 px-4 py-2 bg-black/80 text-white text-sm rounded-lg hover:bg-black/70 transition-colors"
              >
                <Plus size={16} />
                Add Step
              </button>
            </div>

            {/* Steps List */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-lg p-4 bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Step Number & Drag Handle */}
                    <div className="flex flex-col items-center gap-2 pt-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/80 text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveStep(index, "up")}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <GripVertical size={16} className="text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 space-y-3">
                      {/* Title Input */}
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

                      {/* Description Input */}
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
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remove step"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {steps.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No steps added yet</p>
                <button
                  onClick={addStep}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black/80 text-white text-sm rounded-lg hover:bg-black/70 transition-colors"
                >
                  <Plus size={16} />
                  Add Your First Step
                </button>
              </div>
            )}

            {/* Helper Text */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Think of this as a mini itinerary.
                Include meeting points, activities, photo opportunities, and any
                special moments that make your experience unique.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5ExperienceSteps;