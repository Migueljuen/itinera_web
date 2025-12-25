import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

// Import category images
import cat from "../../../../assets/images/category.png";
import cat1 from "../../../../assets/images/category1.png";
import cat2 from "../../../../assets/images/category2.png";
import cat3 from "../../../../assets/images/category3.png";
import cat4 from "../../../../assets/images/category4.png";

const logoImage = new URL(
  "../../../../assets/images/logo.png",
  import.meta.url
);

const expertiseCategories = [
  { id: 1, name: "Art and design", image: cat },
  { id: 2, name: "Fitness and wellness", image: cat1 },
  { id: 3, name: "Food and drink", image: cat2 },
  { id: 4, name: "History and culture", image: cat3 },
  { id: 5, name: "Nature and outdoors", image: cat4 },
];

const availableLanguages = [
  { value: "English", label: "English", flag: "🇬🇧" },
  { value: "Tagalog", label: "Tagalog", flag: "🇵🇭" },
  { value: "Cebuano", label: "Cebuano", flag: "🇵🇭" },
  { value: "Hiligaynon", label: "Hiligaynon", flag: "🇵🇭" },
  { value: "Spanish", label: "Spanish", flag: "🇪🇸" },
  { value: "Japanese", label: "Japanese", flag: "🇯🇵" },
  { value: "Korean", label: "Korean", flag: "🇰🇷" },
  { value: "Mandarin", label: "Mandarin", flag: "🇨🇳" },
  { value: "French", label: "French", flag: "🇫🇷" },
  { value: "German", label: "German", flag: "🇩🇪" },
];

const metroBasilodCities = [
  "Bacolod City",
  "Silay City",
  "Talisay City",
  "Bago City",
  "Murcia",
];

const experienceLevels = [
  { value: "1", label: "Less than 1 year" },
  { value: "2", label: "1-2 years" },
  { value: "3", label: "3-5 years" },
  { value: "6", label: "6-10 years" },
  { value: "10", label: "10+ years" },
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const Step03Guide = ({ formData, setFormData, onNext, onBack }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleLanguage = (language) => {
    const current = formData.languages || [];
    if (current.includes(language)) {
      handleChange(
        "languages",
        current.filter((l) => l !== language)
      );
    } else {
      handleChange("languages", [...current, language]);
    }
  };

  const toggleArea = (area) => {
    const currentAreas = formData.areas_covered
      ? formData.areas_covered.split(", ")
      : [];

    if (currentAreas.includes(area)) {
      const newAreas = currentAreas.filter((a) => a !== area);
      handleChange("areas_covered", newAreas.join(", "));
    } else {
      const newAreas = [...currentAreas, area];
      handleChange("areas_covered", newAreas.join(", "));
    }
  };

  const toggleDay = (day) => {
    const current = formData.guide_availability_days || [];
    if (current.includes(day)) {
      const newDays = current.filter((d) => d !== day);
      handleChange("guide_availability_days", newDays);
    } else {
      handleChange("guide_availability_days", [...current, day]);
    }
  };

  const handleContinue = () => {
    // Validate expertise category
    if (!formData.expertise_category_id) {
      toast.error("Please select your area of expertise.");
      return;
    }

    // Validate languages
    if (!formData.languages || formData.languages.length === 0) {
      toast.error("Please select at least one language.");
      return;
    }

    // Validate areas covered
    if (!formData.areas_covered || formData.areas_covered.trim() === "") {
      toast.error("Please select at least one tour area.");
      return;
    }

    // Validate experience years
    if (!formData.experience_years) {
      toast.error("Please select your experience level.");
      return;
    }

    // Validate availability days
    if (
      !formData.guide_availability_days ||
      formData.guide_availability_days.length === 0
    ) {
      toast.error("Please select at least one available day.");
      return;
    }

    onNext();
  };

  const selectedAreas = formData.areas_covered
    ? formData.areas_covered.split(", ")
    : [];

  return (
    <>
      <Toaster />
      <div className="min-h-screen w-full flex font-display">
        {/* Left Sidebar */}
        <div className="flex-[0.3] flex flex-col py-8 pl-12 justify-between items-start border-r border-gray-200">
          <div>
            {/* Logo */}
            <div>
              <img
                src={logoImage}
                alt="Itinera Logo"
                className="w-24 cursor-pointer transition-transform will-change-transform"
                loading="eager"
                decoding="async"
              />
            </div>

            <div className="space-y-12 mt-24">
              {/* Chat / Email */}
              <div className="flex gap-4">
                <div className="p-2 border-2 border-black/10 rounded-lg h-fit">
                  <ChatBubbleOvalLeftEllipsisIcon className="h-7 w-7 text-black/90" />
                </div>
                <div className="text-sm text-black/90">
                  <h1 className="text-base font-semibold">Chat with us</h1>
                  <p className="text-sm text-black/70">
                    Questions or need help getting started?
                  </p>
                  <h1 className="font-semibold mt-2">
                    itinera.team.app@gmail.com
                  </h1>
                </div>
              </div>

              {/* Service Area */}
              <div className="flex gap-4">
                <div className="p-2 border-2 border-black/10 rounded-lg h-fit">
                  <MapPinIcon className="h-7 w-7 text-black" />
                </div>
                <div className="text-sm text-black/90">
                  <h1 className="text-base font-semibold">Where we operate</h1>
                  <p className="text-sm text-black/70">
                    Currently supporting local destinations
                  </p>
                  <h1 className="font-semibold mt-2">
                    Negros Occidental, Philippines
                  </h1>
                </div>
              </div>

              {/* Partner Onboarding */}
              <div className="flex gap-4">
                <div className="p-2 border-2 border-black/10 rounded-lg h-fit">
                  <ShieldCheckIcon className="h-7 w-7 text-black" />
                </div>
                <div className="text-sm text-black/90">
                  <h1 className="text-base font-semibold">
                    Partner onboarding
                  </h1>
                  <p className="text-sm text-black/70">
                    Verification usually takes 1–3 business days
                  </p>
                  <h1 className="font-semibold mt-2">
                    Secure & review-based approval
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                <svg
                  className="w-5 h-5 text-black/90"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </div>
              <div className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                <svg
                  className="w-5 h-5 text-black/90"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-[0.7] flex items-center justify-center py-12">
          <div className="max-w-4xl w-full px-6">
            <h2 className="text-3xl font-semibold mb-4">Tour Guide Details</h2>
            <p className="mb-8 text-gray-700">
              Share your expertise and help travelers discover the best of
              Negros Occidental.
            </p>

            <div className="space-y-8">
              {/* Expertise Category */}
              <div>
                <label className="block font-semibold text-lg text-black/80 mb-3">
                  Area of Expertise <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  What type of experiences do you specialize in?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {expertiseCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        handleChange("expertise_category_id", category.id);
                      }}
                      className={`group relative p-6 rounded-xl border-2 transition-all duration-200 ${
                        formData.expertise_category_id === category.id
                          ? "border-black bg-black/5"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {/* Image Container */}
                      <div className="w-20 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-20 h-20 object-contain"
                        />
                      </div>
                      {/* Category Name */}
                      <h3 className="text-sm font-medium text-gray-900 text-center leading-tight">
                        {category.name}
                      </h3>
                    </button>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block font-semibold text-lg text-black/80 mb-3">
                  Languages <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Select all languages you can guide in
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => toggleLanguage(lang.value)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.languages?.includes(lang.value)
                          ? "border-black bg-black/5"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="font-medium text-sm">
                          {lang.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                {formData.languages?.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {formData.languages.length} language
                    {formData.languages.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Experience Level */}
              <div>
                <label className="block font-semibold text-lg text-black/80 mb-3">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {experienceLevels.map((exp) => (
                    <button
                      key={exp.value}
                      onClick={() =>
                        handleChange("experience_years", parseInt(exp.value))
                      }
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        formData.experience_years === parseInt(exp.value)
                          ? "border-black bg-black/5"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-medium text-sm">{exp.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Areas - Metro Bacolod Cities */}
              <div>
                <label className="block font-semibold text-lg text-black/80 mb-3">
                  Service Areas <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Select cities in Metro Bacolod where you provide tour guide
                  services
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {metroBasilodCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => toggleArea(city)}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        selectedAreas.includes(city)
                          ? "border-black bg-black/5"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-medium text-sm">{city}</div>
                    </button>
                  ))}
                </div>
                {selectedAreas.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {selectedAreas.length}{" "}
                    {selectedAreas.length === 1 ? "city" : "cities"}
                  </p>
                )}
              </div>

              {/* Availability Days */}
              <div>
                <label className="block font-semibold text-lg text-black/80 mb-3">
                  Availability <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Select the days you're available to guide tours
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        formData.guide_availability_days?.includes(day)
                          ? "border-black bg-black/5"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-medium text-sm">{day}</div>
                    </button>
                  ))}
                </div>
                {formData.guide_availability_days?.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Available {formData.guide_availability_days.length} day
                    {formData.guide_availability_days.length !== 1
                      ? "s"
                      : ""}{" "}
                    per week
                  </p>
                )}
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Offering tours in multiple languages and
                  covering popular destinations can help you attract more
                  travelers.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-10">
              <button
                onClick={onBack}
                className="px-8 py-3 bg-gray-300 text-black/60 rounded hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                className="px-8 py-3 rounded-lg font-medium bg-black/80 text-white text-sm hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step03Guide;
