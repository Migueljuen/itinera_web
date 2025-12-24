import React, { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  MapIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
const logoImage = new URL("../../../../assets/images/logo.png", import.meta.url)
  .href;
const Step01PartnerInfo = ({ formData, setFormData, onNext, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  console.log(formData);
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const pickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = "";
  };

  const handleFileSelect = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File is too large. Max 5MB.");
      return;
    }

    const uri = URL.createObjectURL(file);

    setFormData({ ...formData, profile_pic: { file, uri } });
    toast.success("Profile photo added");
  };

  const removeImage = () => {
    if (formData.profile_pic?.uri?.startsWith("blob:")) {
      URL.revokeObjectURL(formData.profile_pic.uri);
    }
    setFormData({ ...formData, profile_pic: null });
    toast.success("Profile photo removed");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleContinue = () => {
    // Validate first name
    // if (!formData.first_name || formData.first_name.trim() === "") {
    //   toast.error("Please enter your first name.");
    //   return;
    // }

    // // Validate last name
    // if (!formData.last_name || formData.last_name.trim() === "") {
    //   toast.error("Please enter your last name.");
    //   return;
    // }

    // // Validate email
    // if (!formData.email || formData.email.trim() === "") {
    //   toast.error("Please enter your email.");
    //   return;
    // }

    // // Basic email format validation
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(formData.email)) {
    //   toast.error("Please enter a valid email address.");
    //   return;
    // }

    // // Validate mobile number
    // if (!formData.mobile_number || formData.mobile_number.trim() === "") {
    //   toast.error("Please enter your mobile number.");
    //   return;
    // }

    // // Validate password
    // if (!formData.password || formData.password.trim() === "") {
    //   toast.error("Please create a password.");
    //   return;
    // }

    // // Validate profile picture
    // if (!formData.profile_pic) {
    //   toast.error("Please provide a profile picture.");
    //   return;
    // }

    onNext();
  };

  return (
    <div className="min-h-screen w-full flex font-display ">
      <Toaster />
      <div className="flex-[0.3] flex flex-col py-8 pl-12 justify-between items-start border-r border-gray-200">
        <div>
          {/* logo */}
          <div className="">
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
                <h1 className="text-base font-semibold">Partner onboarding</h1>
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

        <div>
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center cursor-pointer  transition-colors">
              <svg
                className="w-5 h-5 text-black/90"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
              </svg>
            </div>
            <div className="w-10 h-10 g-white border border-gray-300 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
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
      <div className="flex-[0.7]  flex items-center justify-center">
        <div className="max-w-3xl w-full px-6">
          <h2 className="text-3xl font-semibold mb-12">
            Tell us a little more about yourself and we'll get going.
          </h2>

          {/* Form Fields */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="w-full">
                <label className="block font-medium text-black/80 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Your first name"
                  value={formData.first_name || ""}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="w-full">
                <label className="block font-medium text-black/80 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Your last name"
                  value={formData.last_name || ""}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-full">
                <label className="block font-medium text-black/80 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="w-full">
                <label className="block font-medium text-black/80 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="09171234567"
                  value={formData.mobile_number || ""}
                  onChange={(e) =>
                    handleChange("mobile_number", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter Philippine mobile number format
                </p>
              </div>
            </div>
            <div>
              <label className="block font-medium text-black/80 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a secure password"
                value={formData.password || ""}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 characters recommended
              </p>
            </div>

            {/* Profile Photo Upload */}
            <div>
              <label className="block font-medium text-black/80 mb-1">
                Profile Photo
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={pickImage}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                } ${isLoading ? "pointer-events-none opacity-50" : ""}`}
              >
                {formData.profile_pic ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.profile_pic.uri}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover mx-auto"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload size={36} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click or drag to upload your profile photo
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Max file size: 5MB
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={onBack}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step01PartnerInfo;
