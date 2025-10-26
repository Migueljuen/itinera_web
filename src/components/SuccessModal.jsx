import React, { useState } from "react";
import { CheckCircle, X } from "lucide-react";

const SuccessModal = ({ isOpen, onClose, status }) => {
  if (!isOpen) return null;

  const isPending = status === "pending";
  const title = isPending
    ? "Experience Submitted Successfully!"
    : "Draft Saved Successfully!";

  const message = isPending ? (
    <>
      Your experience has been submitted for review. Our team will review it
      within <span className="font-semibold text-black/80">24–48 hours</span>{" "}
      and notify you once it’s approved.
    </>
  ) : (
    <>
      Your experience has been saved as a draft. You can continue editing it
      anytime from your{" "}
      <span className="text-[#3A81F3] font-semibold">dashboard</span>.
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-black/60" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-black/80 mb-4">{title}</h2>

          {/* Message */}
          <p className="text-black/70 mb-8 text-sm leading-relaxed">
            {message}
          </p>

          <div className="text-left space-y-4 mb-8">
            <div>
              <h3 className="font-semibold text-black/80">
                Submission Details
              </h3>
            </div>

            <div>
              <ol className="border-l border-gray-200 text-sm text-gray-700 space-y-2">
                <li className="pl-4 relative  text-sm leading-relaxed text-black/70 ">
                  Submitted:{" "}
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </li>

                <li className="pl-4 relative  text-sm leading-relaxed text-black/70">
                  Under Review
                </li>
                <li className="pl-4 relative text-sm leading-relaxed text-black/70">
                  Within 24-48 hours
                </li>
              </ol>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#3A81F3] text-white/90 text-base rounded-lg hover:bg-[#3A81F3]/75 w-full"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
