// steps/Step03ReviewSubmit.jsx - Creator Only (Web)
import React from "react";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import {
  Check,
  User,
  Mail,
  Phone,
  FileText,
  Camera,
  CreditCard,
} from "lucide-react";

const logoImage = new URL("../../../../assets/images/logo.png", import.meta.url)
  .href;

function ReviewSection({ title, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-black/90 mb-4">{title}</h3>
      <div
        className="rounded-2xl p-5 bg-white"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        {children}
      </div>
    </div>
  );
}

function ReviewItem({ icon: Icon, label, value, isImage = false }) {
  const hasValue = isImage ? !!value : !!value?.trim();

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-black/50">{label}</p>
        {isImage && value ? (
          <img
            src={value}
            alt={label}
            className="w-20 h-20 rounded-lg object-cover mt-2"
          />
        ) : (
          <p className="text-base text-black/90 truncate">
            {value || <span className="text-black/30 italic">Not provided</span>}
          </p>
        )}
      </div>
      {hasValue && (
        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Check size={14} className="text-green-600" />
        </div>
      )}
    </div>
  );
}

const Step03ReviewSubmit = ({ formData, onSubmit, onBack, isSubmitting }) => {
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
                <h1 className="font-semibold mt-2">itinera.team.app@gmail.com</h1>
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
                  Secure &amp; review-based approval
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
          <h1 className="text-3xl font-semibold text-gray-800">
            Review your application
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Please review your information before submitting. You can go back to
            make changes if needed.
          </p>

          <div className="mt-8">
            {/* Personal Information */}
            <ReviewSection title="Personal Information">
              <ReviewItem
                icon={User}
                label="Full Name"
                value={`${formData.first_name} ${formData.last_name}`.trim()}
              />
              <ReviewItem icon={Mail} label="Email" value={formData.email} />
              <ReviewItem
                icon={Phone}
                label="Phone Number"
                value={formData.mobile_number}
              />
              <ReviewItem
                icon={FileText}
                label="About You"
                value={formData.short_description}
              />
              <ReviewItem
                icon={User}
                label="Profile Photo"
                value={formData.profile_pic?.uri || formData.profile_pic?.preview}
                isImage
              />
            </ReviewSection>

            {/* Verification Documents */}
            <ReviewSection title="Verification Documents">
              <ReviewItem
                icon={Camera}
                label="Selfie Verification"
                value={
                  formData.selfie_document?.uri || formData.selfie_document?.preview
                }
                isImage
              />
              <ReviewItem
                icon={CreditCard}
                label="Government ID"
                value={formData.id_document?.uri || formData.id_document?.preview}
                isImage
              />
              {/* ✅ NEW: Business Permit */}
              <ReviewItem
                icon={FileText}
                label="Business Permit"
                value={
                  formData.business_permit_document?.uri ||
                  formData.business_permit_document?.preview
                }
                isImage
              />
            </ReviewSection>

            {/* Terms Notice */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-8">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">By submitting:</span> You agree to
                our Terms of Service and confirm that all information provided is
                accurate. False information may result in rejection or account
                termination.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBack}
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 rounded-xl bg-gray-200 text-black/70 text-center font-medium hover:bg-gray-300 transition-colors disabled:opacity-60"
              >
                Back
              </button>

              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-[#191313] py-4 px-8 rounded-xl text-white/90 text-center font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step03ReviewSubmit;
