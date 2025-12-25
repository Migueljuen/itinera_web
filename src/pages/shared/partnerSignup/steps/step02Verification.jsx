import React, { useState, useRef } from "react";
import { Upload, X, FileImage, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  MapIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
const logoImage = new URL(
  "../../../../assets/images/logo.png",
  import.meta.url
);
const Step02Verification = ({ formData, setFormData, onNext, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const fileInputRefs = useRef({});

  // Define required documents based on role
  const getRequiredDocuments = () => {
    const role = formData.creator_role?.toLowerCase();

    if (role === "driver") {
      return [
        { key: "id_document", label: "Valid ID", required: true },
        { key: "license_document", label: "Driver's License", required: true },
      ];
    } else if (role === "guide") {
      return [{ key: "id_document", label: "Valid ID", required: true }];
    }

    // Default fallback
    return [{ key: "id_document", label: "Valid ID", required: true }];
  };

  const requiredDocuments = getRequiredDocuments();

  const handleChangeFile = async (file, documentKey) => {
    if (!file) return;

    setIsLoading(true);
    try {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        toast.error("Only image or PDF files are allowed");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("File too large. Max 5MB");
        return;
      }

      const uri = URL.createObjectURL(file);

      setFormData({
        ...formData,
        [documentKey]: { file, uri, isExisting: false },
      });

      const docLabel = requiredDocuments.find(
        (d) => d.key === documentKey
      )?.label;
      toast.success(`${docLabel} uploaded successfully`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload document");
    } finally {
      setIsLoading(false);
    }
  };

  const pickFile = (documentKey) => {
    fileInputRefs.current[documentKey]?.click();
  };

  const handleFileInputChange = (e, documentKey) => {
    const file = e.target.files?.[0];
    if (file) handleChangeFile(file, documentKey);
    e.target.value = "";
  };

  const handleDragOver = (e, documentKey) => {
    e.preventDefault();
    setDragOver(documentKey);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e, documentKey) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files?.[0];
    if (file) handleChangeFile(file, documentKey);
  };

  const removeFile = (documentKey) => {
    if (formData[documentKey]?.uri?.startsWith("blob:")) {
      URL.revokeObjectURL(formData[documentKey].uri);
    }
    setFormData({ ...formData, [documentKey]: null });

    const docLabel = requiredDocuments.find(
      (d) => d.key === documentKey
    )?.label;
    toast.success(`${docLabel} removed`);
  };

  const handleContinue = () => {
    // Check if all required documents are uploaded
    // const missingDocs = requiredDocuments.filter(
    //   (doc) => doc.required && !formData[doc.key]
    // );

    // if (missingDocs.length > 0) {
    //   const missingLabels = missingDocs.map((d) => d.label).join(", ");
    //   toast.error(`Please upload: ${missingLabels}`);
    //   return;
    // }

    onNext();
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen w-full flex font-display ">
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
          <div className="max-w-4xl w-full px-6">
            <h2 className="text-3xl font-semibold mb-4">
              Verify Your Identity
            </h2>
            <p className="mb-8 text-gray-700">
              Upload the necessary documents to complete your{" "}
              {formData.creator_role_label} verification.
            </p>

            <div
              className={`grid grid-cols-1 ${
                requiredDocuments.length > 1 ? "md:grid-cols-2" : ""
              } gap-6`}
            >
              {requiredDocuments.map((doc) => {
                const uploadedDoc = formData[doc.key];
                const isImage = uploadedDoc?.file?.type?.startsWith("image/");
                const isPDF = uploadedDoc?.file?.type === "application/pdf";

                return (
                  <div
                    key={doc.key}
                    className="border-2 border-gray-300 rounded-lg p-6 bg-white relative"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{doc.label}</h3>
                      {doc.required && (
                        <span className="text-xs text-red-500 font-medium">
                          Required
                        </span>
                      )}
                    </div>

                    <div
                      onDragOver={(e) => handleDragOver(e, doc.key)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, doc.key)}
                      onClick={() => pickFile(doc.key)}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        dragOver === doc.key
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      {isLoading && dragOver === doc.key ? (
                        <div className="flex flex-col items-center">
                          <Loader2
                            size={40}
                            className="animate-spin text-blue-600 mb-2"
                          />
                          <p className="text-sm text-gray-600">Uploading...</p>
                        </div>
                      ) : uploadedDoc ? (
                        <div className="flex flex-col items-center">
                          {isImage ? (
                            <img
                              src={uploadedDoc.uri}
                              alt={doc.label}
                              className="w-full h-48 object-cover rounded-md mb-2"
                            />
                          ) : isPDF ? (
                            <>
                              <FileImage
                                size={48}
                                className="text-red-500 mb-2"
                              />
                              <p className="text-sm text-gray-700 font-medium">
                                {uploadedDoc.file.name}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-700">
                              File uploaded
                            </p>
                          )}
                          <p className="text-xs text-green-600 mt-2">
                            ✓ Uploaded
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload size={40} className="text-gray-400 mb-3" />
                          <p className="text-sm text-gray-700 font-medium mb-1">
                            Click or drag to upload
                          </p>
                          <p className="text-xs text-gray-500">
                            Accepts images or PDF (Max: 5MB)
                          </p>
                        </div>
                      )}
                    </div>

                    {uploadedDoc && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(doc.key);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X size={18} />
                      </button>
                    )}

                    <input
                      ref={(el) => (fileInputRefs.current[doc.key] = el)}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileInputChange(e, doc.key)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong>{" "}
                {formData.creator_role?.toLowerCase() === "driver"
                  ? "Drivers must provide both a valid ID and driver's license for verification."
                  : "Tour guides must provide a valid government-issued ID for verification."}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-8">
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

export default Step02Verification;
