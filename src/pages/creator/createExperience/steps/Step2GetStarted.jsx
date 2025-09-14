import React from "react";
import { motion } from "framer-motion";

const Step2GetStarted = ({ formData, onNext, onBack }) => {
  if (!formData?.category_id) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <p className="text-gray-600">Please select a tag first.</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col">
        <div className="text-center flex flex-row justify-around items-center  mb-24">
          <div className="text-left  flex-[0.5]">
            <h1 className="text-5xl md:text-6xl font-semibold text-black/90 mb-4">
              Create your listing
            </h1>
            <p className="text-black/60 text-lg">
              Tell us about the experience you offer. Our team will review it to
              confirm it meets our requirements.
            </p>
          </div>
          {formData.category_id && (
            <motion.div
              layoutId={`category-${formData.category_id}`}
              className="  
      px-16 py-10 h-90 my-8 rounded-2xl 
      shadow-[8px_8px_48px_-4px_rgba(0,0,0,0.2)] 
     flex flex-col justify-around
      transform rotate-3 scale-105
    "
            >
              <img
                src={formData.category_image}
                alt={formData.category_name}
                className="w-28 h-28 mx-auto mb-6 rounded-xl flex items-center justify-center overflow-hidden"
              />
              <h3 className="text-2xl font-medium text-black/90  w-4/6 mx-auto text-center leading-tight min-h-10">
                {formData.category_name}
              </h3>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}

      <div className="flex justify-between mt-12 max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-lg font-medium bg-black/90 text-white hover:bg-black/80 cursor-pointer"
        >
          Continue
        </button>
      </div>
    </>
  );
};

export default Step2GetStarted;
