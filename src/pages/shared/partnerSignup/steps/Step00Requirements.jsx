// steps/Step00Requirements.jsx - Partner Only (Web)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SectionCard({ title, subtitle, items }) {
  return (
    <div className="py-4 mb-4">
      <div className="flex items-center mb-1">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-black/90 font-display">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-black/50 mt-0.5 font-display">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={`${title}-${idx}`} className="flex items-baseline gap-3">
            <div className="w-2 h-2 bg-black/70 rounded-full flex-shrink-0 mt-1.5" />
            <p className="flex-1 text-base text-black/70 font-display">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const Step00Requirements = ({ formData, onNext, onBack }) => {
  const [confirmed, setConfirmed] = useState(false);
  const navigate = useNavigate();

  const goToTerms = (e) => {
    // prevent toggling checkbox when clicking link
    e.preventDefault();
    e.stopPropagation();
    navigate("/Terms");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-10 pb-16">
        {/* Header */}
        <div className="pt-12 mb-6">
          <h1 className="text-3xl font-semibold font-display text-black/90 leading-tight">
            Become our Partner
          </h1>
          <p className="mt-2 text-base font-display text-black/50">
            Before you continue, here's what you'll need to submit for approval.
          </p>
        </div>

        {/* Cards */}
        <div className="animate-fade-in">
          <SectionCard
            title="1. Contact + profile"
            items={[
              "Verified phone number and email.",
              "Complete profile: photo, legal name, short bio.",
            ]}
          />

          <SectionCard
            title="2. Identity check"
            subtitle="Used to confirm legitimacy of Partners"
            items={[
              "Upload government ID + selfie.",
              "Admin will check: readable, not expired, selfie matches ID.",
            ]}
          />

          {/* ✅ Business permit requirement */}
          <SectionCard
            title="3. Business permit (required)"
            subtitle="Required to list paid experiences/services"
            items={[
              "Upload a valid business permit (e.g., Mayor’s/Business Permit) or other proof of legal authority to operate.",
              "Failure to provide this may delay approval or prevent your listings from being published.",
            ]}
          />

          {/* ✅ NEW: Registration fee + subscription rules */}
          <SectionCard
            title="4. Registration fee & subscription"
            subtitle="Required to activate your partner account"
            items={[
              "A one-time registration fee of ₱1,299 is required for new partners.",
              "Your registration includes 1 month of basic subscription (30 days) after payment is confirmed.",
              "After the 1 month, choose a plan to stay active:",
              "• Basic: ~₱599/month",
              "• Pro: ~₱999/month (includes everything in Basic, plus Pro features)",
              "Only subscribed partners can preview their activity/listing and receive bookings from the system.",
            ]}
          />

          {/* Renumbered */}
          <SectionCard
            title="5. Partner agreement"
            items={[
              "Follow local laws.",
              "No prohibited activities.",
              "Provide experiences as described (no bait-and-switch).",
            ]}
          />

          {/* Renumbered */}
          <SectionCard
            title="6. What you can do as a Partner"
            subtitle="Create and manage unique travel experiences"
            items={[
              "Design custom tours and activities.",
              "Set your own pricing and availability.",
              "Connect with travelers looking for authentic experiences.",
            ]}
          />
        </div>

        {/* Confirmation */}
        <button
          type="button"
          onClick={() => setConfirmed((v) => !v)}
          className="flex items-center mt-2 w-full text-left"
        >
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center mr-3 ${confirmed ? "bg-primary" : "bg-black/10"
              }`}
          >
            {confirmed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <div className="h-4 w-4" />
            )}
          </div>

          <span className="flex-1 text-sm text-black/90 font-display">
            I understand these requirements and I'm ready to proceed. By selecting
            Agree and continue, I indicate my agreement to Itinera's{" "}
            <a
              href="/Terms"
              onClick={goToTerms}
              className="text-blue-500 underline font-display font-medium"
            >
              Terms of Service
            </a>
            .
          </span>
        </button>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-xl py-4 text-center font-display bg-gray-200 font-medium text-black/80 hover:bg-gray-300 transition-colors"
          >
            Back
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!confirmed}
            className={`flex-1 py-4 px-8 rounded-xl font-display font-semibold text-white/90 transition-colors ${confirmed ? "bg-[#191313] hover:bg-[#2a2a2a]" : "bg-black/40 cursor-not-allowed"
              }`}
          >
            Agree and continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step00Requirements;
