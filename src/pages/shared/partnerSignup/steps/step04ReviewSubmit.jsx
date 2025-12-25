import React from "react";
import { Loader2 } from "lucide-react";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const logoImage = new URL(
  "../../../../assets/images/logo.png",
  import.meta.url
);
const Step04ReviewSubmit = ({
  formData,
  onSubmit,
  onBack,
  isSubmitting = false,
}) => {
  const { creator_role } = formData;
  console.log(formData);
  // Get category name from ID (you might want to pass this as a prop or store it)
  const getCategoryName = (id) => {
    const categories = {
      1: "Art and design",
      2: "Fitness and wellness",
      3: "Food and drink",
      4: "History and culture",
      5: "Nature and outdoors",
    };
    return categories[id] || "—";
  };

  const renderRoleSummary = () => {
    if (creator_role === "Guide") {
      return (
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Role:</span>
            <span className="font-medium">Tour Guide</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Expertise:</span>
            <span className="font-medium">
              {getCategoryName(formData.expertise_category_id)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Languages:</span>
            <span className="font-medium">
              {formData.languages?.join(", ") || "—"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Service Areas:</span>
            <span className="font-medium text-right">
              {formData.areas_covered || "—"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Experience:</span>
            <span className="font-medium">
              {formData.experience_years
                ? `${formData.experience_years} year${
                    formData.experience_years !== 1 ? "s" : ""
                  }`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Availability:</span>
            <span className="font-medium text-right">
              {formData.guide_availability_days?.join(", ") || "—"}
            </span>
          </div>
        </div>
      );
    }

    if (role === "Driver") {
      return (
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Role:</span>
            <span className="font-medium">Transport Provider</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Service Area:</span>
            <span className="font-medium">{formData.service_area || "—"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Multi-day Service:</span>
            <span className="font-medium">
              {formData.is_multi_day ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Availability:</span>
            <span className="font-medium text-right">
              {formData.driver_availability_days?.join(", ") || "—"}
            </span>
          </div>
        </div>
      );
    }

    if (role === "Creator") {
      return (
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Role:</span>
            <span className="font-medium">Experience Creator</span>
          </div>
          <div className="py-2">
            <p className="text-sm text-gray-600">
              You can start creating experiences after your account is approved.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className="min-h-screen w-full flex font-display">
        {/* Left Sidebar */}
        <div className="flex-[0.3] flex flex-col h-dvh sticky top-0 py-8 pl-12 justify-between items-start border-r border-gray-200">
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
            <h2 className="text-3xl font-semibold mb-4">Review & Submit</h2>
            <p className="mb-8 text-gray-700">
              Please review your details before submitting your partner
              application.
            </p>

            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Full Name:</span>
                    <span className="font-medium">
                      {formData.first_name} {formData.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{formData.email || "—"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Mobile Number:</span>
                    <span className="font-medium">
                      {formData.mobile_number || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role-Specific Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Service Details
                </h3>
                {renderRoleSummary()}
              </div>

              {/* Verification Documents */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Verification Documents
                </h3>
                <div className="space-y-2">
                  {formData.profile_pic && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">Profile Picture</span>
                    </div>
                  )}
                  {formData.id_document && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">Government ID</span>
                    </div>
                  )}
                  {formData.license_document && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">Driver's License</span>
                    </div>
                  )}
                  {!formData.profile_pic &&
                    !formData.id_document &&
                    !formData.license_document && (
                      <p className="text-sm text-gray-500">
                        No documents uploaded
                      </p>
                    )}
                </div>
              </div>

              {/* Important Notice */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your application will be reviewed by
                  our team. You'll receive an email notification once your
                  account is approved, typically within 1-3 business days.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-10">
              <button
                onClick={onBack}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gray-300 text-black/60 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-lg font-medium bg-black/80 text-white text-sm hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step04ReviewSubmit;
