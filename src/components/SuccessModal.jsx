import React from "react";
import { CheckCircle, X } from "lucide-react";

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const title = "Experience Submitted Successfully";

  const message = (
    <>
      Your experience has been successfully submitted and is now under review by
      our team.
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
          <h2 className="text-xl font-semibold text-black/80 mb-2">
            {title}
          </h2>

          {/* Message */}
          <p className="text-black/50 mb-8 text-base leading-relaxed">
            {message}
          </p>

          {/* Expectations */}
          {/* <div className="text-left space-y-4 mb-12">
            <h3 className="font-semibold text-black/80">
              What happens next
            </h3>

            <ol className="text-black/50 text-sm space-y-2 list-disc list-inside">
              <li>Your submission is now being reviewed.</li>
              <li>Our team will verify the details and quality.</li>
              <li>
                Expect approval within{" "}
                <span className="font-medium text-black/80">24–48 hours</span>.
              </li>
            </ol>
          </div> */}

          {/* Action Button */}
          <button
            onClick={onClose}
            className="px-6 py-3 bg-black/80 text-white rounded-lg hover:bg-black/70 w-full"
          >
            Go to Dashboard
          </button>

          <p className="text-black/50 mt-4 text-sm text-center leading-relaxed">
            You can monitor bookings from now on your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
