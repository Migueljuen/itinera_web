import React from "react";
import { ArrowRight } from "lucide-react"; // Make sure this is installed via lucide-react

const units = ["Entry", "Hour", "Day", "Package"];

const Step3ExperienceDetails = ({ formData, setFormData, onNext }) => {
  // Console log the selected category

  // console.log("Full formData from step 3:", formData);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const isValid = () => {
    return (
      formData.title &&
      formData.description &&
      formData.price &&
      units.includes(formData.unit)
    );
  };

  return (
    <div className="min-h-screen w-full">
      <div className=" mx-auto">
        <div className="text-center py-2">
          <h2 className="text-left text-xl font-semibold mb-2 text-black/90">
            Getting Started
          </h2>
          <p className="text-left text-sm text-black/60 mb-6">
            Please fill the form below. Feel free to add as much detail as
            needed.
          </p>

          {/* TWO COL */}
          <div className="flex flex-rowbg-amber-50 justify-between gap-8 ">
            {/* LEFT*/}
            <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300  flex-1/2 h-fit">
              {/* Title Input */}
              <div className="pb-4">
                <label className="block font-medium py-2 text-left text-black/90">
                  Activity Title
                </label>
                <input
                  type="text"
                  placeholder="E.g. Sunset in the mountains"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full p-4 text-sm text-gray-600 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description Input */}
              <div className="pb-4">
                <label className="block font-medium py-2 text-left">
                  Description
                </label>
                <textarea
                  placeholder="Short description of the activity"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full p-4 text-sm text-gray-800 h-32 rounded-xl border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              {/* Price Input */}
              <div className="e pb-4">
                <label className="block font-medium py-2 text-left text-black/90">
                  Pricing
                </label>
                <input
                  type="number"
                  placeholder="₱ Price"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="w-full p-4 text-sm text-gray-800 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Units Selection */}
              <div className=" mt-6">
                <label className="block text-base font-medium py-2 text-left text-black/90">
                  Charge per
                </label>
                <div className="flex flex-wrap gap-3 mb-2">
                  {units.map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleChange("unit", unit)}
                      className={`px-6 py-2 rounded-xl transition-colors duration-200 ${
                        formData.unit === unit
                          ? "bg-[#376a63] text-white"
                          : "bg-white border border-gray-300 text-black/60 hover:bg-gray-50 "
                      }`}
                    >
                      <span className="text-sm font-medium">{unit}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* RIGHT */}
            <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300  flex-1/2">
              {/* Title Input */}
              <div className="pb-4">
                <label className="block font-medium py-2 text-left">
                  Activity Title
                </label>
                <input
                  type="text"
                  placeholder="E.g. Sunset in the mountains"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full p-4 text-sm text-gray-600 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description Input */}
              <div className="pb-4">
                <label className="block font-medium py-2 text-left">
                  Description
                </label>
                <textarea
                  placeholder="Short description of the activity"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full p-4 text-sm text-gray-800 h-32 rounded-xl border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              {/* Price Input */}
              <div className="e pb-4">
                <label className="block font-medium py-2 text-left">
                  Charge
                </label>
                <input
                  type="number"
                  placeholder="₱ Price"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="w-full p-4 text-sm text-gray-800 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Units Selection */}
              <div className=" mt-6">
                <label className="block text-base font-medium py-2 text-left">
                  Charge per
                </label>
                <div className="flex flex-wrap gap-3 mb-2">
                  {units.map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleChange("unit", unit)}
                      className={`px-6 py-2 rounded-full transition-colors duration-200 ${
                        formData.unit === unit
                          ? "bg-[#376a63] text-white"
                          : "bg-white border border-gray-300 text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-base font-medium">{unit}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex bottom-16 right-8 z-20">
                <button
                  type="button"
                  onClick={isValid() ? onNext : undefined}
                  disabled={!isValid()}
                  className={`flex items-center gap-2 p-6 cursor-pointer rounded-full shadow-lg transition-colors font-medium ${
                    isValid()
                      ? "bg-[#376a63] text-white hover:bg-[#2e5954]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3ExperienceDetails;
