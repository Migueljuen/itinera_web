// steps/Step01PartnerInfo.jsx
import React, { useState, useRef } from "react";
import { Upload, X, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const logoImage = new URL("../../../../assets/images/logo.png", import.meta.url)
  .href;

/**
 * FocusableField - Styled input matching the React Native version
 */
function FocusableField({
  label,
  value,
  onChange,
  inputRef,
  placeholder,
  type = "text",
  autoCapitalize = "words",
  isLast = false,
  rightElement,
}) {
  return (
    <div
      className={`flex flex-col items-start px-4 py-2 cursor-text ${isLast ? "" : "border-b border-black/40"
        }`}
      style={{ height: 55 }}
      onClick={() => inputRef.current?.focus()}
    >
      <label className="text-sm text-black/50">{label}</label>
      <div className="flex items-center w-full flex-1">
        <input
          ref={inputRef}
          type={type}
          className="flex-1 text-lg text-black/90 bg-transparent outline-none"
          value={value}
          onChange={(e) => {
            let val = e.target.value;
            if (autoCapitalize === "words") {
              // Optional: auto-capitalize first letter of each word
            }
            onChange(val);
          }}
          placeholder={placeholder}
          autoComplete={type === "password" ? "new-password" : "off"}
        />
        {rightElement && <div className="ml-2">{rightElement}</div>}
      </div>
    </div>
  );
}

const Step01PartnerInfo = ({ formData, setFormData, onNext, onBack }) => {
  const [isPicking, setIsPicking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const shortDescRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Profile photo handlers
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
    setFormData((prev) => ({
      ...prev,
      profile_pic: { file, uri, name: file.name },
    }));
    toast.success("Profile photo added");
  };

  const removeImage = () => {
    if (formData.profile_pic?.uri?.startsWith("blob:")) {
      URL.revokeObjectURL(formData.profile_pic.uri);
    }
    setFormData((prev) => ({ ...prev, profile_pic: null }));
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
    // Add validation as needed
    onNext();
  };

  return (
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
      <div className="flex-[0.7] overflow-y-auto">
        <div className="max-w-2xl mx-auto px-10 py-12">
          {/* Header */}
          <h1 className="text-3xl font-semibold text-black/90 leading-tight mb-12">
            Tell us a little more about yourself and we'll get going.
          </h1>

          {/* LEGAL NAME */}
          <div>
            <h2 className="text-xl font-medium text-black/90">Legal name</h2>

            <div className="mt-4 border border-black/40 rounded-lg overflow-hidden">
              <FocusableField
                label="First name on your ID"
                value={formData.first_name || ""}
                onChange={(v) => handleChange("first_name", v)}
                inputRef={firstNameRef}
                placeholder="John"
              />

              <FocusableField
                label="Last name on your ID"
                value={formData.last_name || ""}
                onChange={(v) => handleChange("last_name", v)}
                inputRef={lastNameRef}
                placeholder="Doe"
                isLast
              />
            </div>

            <p className="mt-2 text-sm text-black/50">
              Ensure this matches the name on your government-issued ID.
            </p>
          </div>

          {/* CONTACT INFO */}
          <div className="mt-12">
            <h2 className="text-xl font-medium text-black/90">Contact info</h2>

            <div className="mt-4 border border-black/40 rounded-lg overflow-hidden">
              <FocusableField
                label="Email"
                value={formData.email || ""}
                onChange={(v) => handleChange("email", v)}
                inputRef={emailRef}
                placeholder="your.email@example.com"
                type="email"
                autoCapitalize="none"
              />

              <FocusableField
                label="Phone number"
                value={formData.mobile_number || ""}
                onChange={(v) => handleChange("mobile_number", v)}
                inputRef={phoneRef}
                placeholder="09171234567"
                type="tel"
                autoCapitalize="none"
                isLast
              />
            </div>

            <p className="mt-2 text-sm text-black/50">
              We'll email you application updates and receipts.
            </p>
          </div>

          {/* SET PASSWORD */}
          <div className="mt-12">
            <h2 className="text-xl font-medium text-black/90">Set password</h2>

            <div className="mt-4 border border-black/40 rounded-lg overflow-hidden">
              <FocusableField
                label="Password"
                value={formData.password || ""}
                onChange={(v) => handleChange("password", v)}
                inputRef={passwordRef}
                placeholder="Create a secure password"
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                isLast
                rightElement={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPassword((prev) => !prev);
                      passwordRef.current?.focus();
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                }
              />
            </div>
          </div>

          {/* ABOUT YOU */}
          <div className="mt-12">
            <h2 className="text-xl font-medium text-black/90">About you</h2>

            <div className="mt-4 border border-black/40 rounded-lg overflow-hidden">
              <div
                className="flex flex-col items-start px-4 py-3 cursor-text"
                onClick={() => shortDescRef.current?.focus()}
              >
                <label className="text-sm text-black/50">
                  Short description about yourself
                </label>
                <textarea
                  ref={shortDescRef}
                  className="w-full text-lg text-black/90 bg-transparent outline-none mt-2 resize-none"
                  value={formData.short_description || ""}
                  onChange={(e) =>
                    handleChange("short_description", e.target.value)
                  }
                  placeholder="Adventure enthusiast, food lover, and travel guide."
                  rows={3}
                  style={{ minHeight: 80 }}
                />
              </div>
            </div>
          </div>

          {/* PROFILE PHOTO */}
          <div className="mt-12">
            <h2 className="text-xl font-medium text-black/90">Profile photo</h2>
            <p className="mt-2 text-sm text-black/50">
              This will be shown to travelers. Use a clear face photo.
            </p>

            <div
              className="mt-4 rounded-2xl p-5 flex flex-col items-center"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <div className="relative">
                {isPicking ? (
                  <div className="w-28 h-28 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : formData.profile_pic?.uri ? (
                  <div className="relative">
                    <img
                      src={formData.profile_pic.uri}
                      alt="Profile"
                      className="w-28 h-28 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={pickImage}
                    className={`w-28 h-28 rounded-full flex items-center justify-center cursor-pointer transition-colors ${dragOver
                        ? "bg-blue-100 border-2 border-blue-400"
                        : "bg-gray-100 hover:bg-gray-200"
                      }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}

                {/* Edit button */}
                {!isPicking && (
                  <button
                    type="button"
                    onClick={pickImage}
                    className="absolute bottom-0 right-0 bg-[#191313] rounded-full p-2 hover:bg-[#2a2a2a] transition-colors"
                    style={{
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-200"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                )}
              </div>

              <p className="mt-4 text-sm text-black/60 text-center">
                Tap the pencil to take a photo, choose from gallery, or remove.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onBack}
              disabled={isPicking}
              className="flex-1 px-6 py-4 rounded-xl bg-gray-200 text-black/70 text-center font-medium hover:bg-gray-300 transition-colors disabled:opacity-60"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={isPicking}
              className="flex-1 bg-[#191313] py-4 px-8 rounded-xl text-white/90 text-center font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-60"
            >
              {isPicking ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step01PartnerInfo;