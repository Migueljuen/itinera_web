import React, { useState } from "react";
import { CheckCircle, X } from "lucide-react";

const SuccessModal = ({ isOpen, onClose, status }) => {
  if (!isOpen) return null;

  const isPending = status === "pending";
  const title = isPending
    ? "Submitted Successfully"
    : "Draft Saved Successfully";

  const message = isPending ? (
    <>
      Your experience has been submitted for review.
    </>
  ) : (
    <>
      Your experience has been saved as a draft. You can continue editing it
      anytime from your{" "}
      <span className="text-[#3A81F3] font-semibold">dashboard</span>.
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-display">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-black/60" />
        </button>

        {/* Content */}
        <div className="p-8 text-left">
          {/* Success Icon */}
          <div className="flex justify-start mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-black/80 mb-2">{title}</h2>

          {/* Message */}
          <p className="text-black/50 mb-8 text-base leading-relaxed">
            {message}
          </p>

          <div className="text-left space-y-4 mb-12">
            <div>
              <h3 className="font-semibold text-black/80">
                What to expect:
              </h3>
            </div>

            <div>
              <ol className=" text-black/50 text-sm space-y-2 list-disc list-inside">
                <li className="pl-1   ">
                  Your submission is now under review.
                </li>
                <li className="pl-1">
                  We'll verify that everything meets our standards.

                </li>
                <li className="pl-1   ">
                  Expect approval within <span className="font-medium text-black/80">24–48 hours</span>.

                </li>
              </ol>
            </div>
          </div>


          {/* Action Button */}
          <button
            onClick={onClose}
            className="px-6 py-3 bg-black/80 text-white hover:bg-black/70text-base rounded-lg  w-full"
          >
            Go to Dashboard
          </button>
          <p className="text-black/50 mt-4 text-sm text-center leading-relaxed">
            You can track your submission status anytime from your dashboard.
          </p>

        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
