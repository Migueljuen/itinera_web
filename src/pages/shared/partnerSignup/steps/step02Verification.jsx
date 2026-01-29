// steps/Step02Verification.jsx
import React, { useState, useRef } from "react";
import { X, Camera, CreditCard, Info, FileText, Receipt } from "lucide-react";
import toast from "react-hot-toast";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const logoImage = new URL("../../../../assets/images/logo.png", import.meta.url)
  .href;

/**
 * UploadTile - Document upload card with preview and edit button
 */
function UploadTile({
  doc,
  uploadedFile,
  onPick,
  onRemove,
  isUploading,
  disabled,
}) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) onPick(doc.key, file);
    e.target.value = "";
  };

  const IconComponent = doc.icon;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-3">
          <h3 className="text-xl font-medium text-black/90">{doc.label}</h3>
          {doc.helper && <p className="mt-1 text-sm text-black/70">{doc.helper}</p>}
        </div>
        {doc.required && (
          <span className="text-xs font-medium text-red-500">Required</span>
        )}
      </div>

      <div
        className="rounded-2xl mt-4 p-5 flex flex-col items-center bg-white"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <div className="relative w-full">
          {isUploading ? (
            <div className="w-full h-44 rounded-2xl bg-gray-100 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : uploadedFile?.uri || uploadedFile?.preview ? (
            <div className="relative">
              <img
                src={uploadedFile.uri || uploadedFile.preview}
                alt={doc.label}
                className="w-full h-44 rounded-2xl object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(doc.key)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="w-full h-44 rounded-2xl bg-black/5 flex items-center justify-center">
              <IconComponent size={42} className="text-gray-400" />
            </div>
          )}

          {/* Edit/Upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="absolute bottom-3 right-3 bg-[#191313] rounded-full p-2 hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
            style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
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
        </div>

        <p className="mt-4 text-sm text-black/60 text-center">
          Tap the pencil to upload a photo.
        </p>

        {uploadedFile?.uri || uploadedFile?.preview ? (
          <p className="mt-1 text-xs text-green-600">Uploaded</p>
        ) : (
          <p className="mt-1 text-xs text-black/40">No file uploaded yet</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}

/**
 * PaymentCard - Registration fee info + GCash reference input
 */
function PaymentCard({ formData, setFormData, disabled }) {
  const registrationFee = 1299;
  const basicMonthly = 599;
  const proMonthly = 999;

  return (
    <div
      className="mt-10 py-5 rounded-2xl "
    >
      <div className="flex items-start gap-3">

        <div className="flex-1">
          <h3 className="text-xl font-medium text-black/90">
            Registration fee (GCash)
          </h3>
          <p className="mt-1 text-sm text-black/70">
            Required for approval. Upload your proof of payment and provide your
            GCash reference number.
          </p>

          <div className="mt-12 space-y-4 text-sm text-black/70">
            <p>
              <span className="font-semibold">One-time registration fee:</span>{" "}
              ₱{registrationFee.toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Includes:</span> 1 month basic
              subscription after approval
            </p>
            <p>
              <span className="font-semibold">After 30 days:</span> Basic ₱
              {basicMonthly.toLocaleString()}/month • Pro ₱
              {proMonthly.toLocaleString()}/month
            </p>
            <p className="text-xs text-black/40">
              Make sure your proof clearly shows the amount, date/time, and
              reference number.
            </p>
          </div>

          {/* GCash reference input */}
          <div className="mt-5">
            <label className="text-sm font-medium text-black/80">
              GCash reference number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.gcash_reference || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  gcash_reference: e.target.value,
                }))
              }
              disabled={disabled}
              placeholder="e.g., 123456789012"
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-black/80 outline-none focus:border-black/30 disabled:opacity-60"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const Step02Verification = ({ formData, setFormData, onNext, onBack }) => {
  const [uploadingKey, setUploadingKey] = useState(null);


  const requiredDocuments = [
    {
      key: "registration_payment_proof",
      label: "Registration Fee Proof (GCash Receipt)",
      required: true,
      helper:
        "Upload a screenshot/photo of your GCash receipt showing amount and reference number.",
      icon: Receipt,
    },
    {
      key: "business_permit_document",
      label: "Business Permit",
      required: true,
      helper:
        "Upload a clear photo of your Mayor’s/Business Permit (or proof of legal authority to operate).",
      icon: FileText,
    },


    {
      key: "selfie_document",
      label: "Selfie Verification",
      required: true,
      helper: "Clear selfie. No filters. Good lighting.",
      icon: Camera,
    },
    {
      key: "id_document",
      label: "Government ID",
      required: true,
      helper: "Readable and not expired.",
      icon: CreditCard,
    },

  ];

  const handlePick = (key, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Max 5MB.");
      return;
    }

    setUploadingKey(key);

    const uri = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      [key]: { file, uri, preview: uri, name: file.name },
    }));

    const label = requiredDocuments.find((d) => d.key === key)?.label ?? "File";
    toast.success(`${label} selected`);

    setUploadingKey(null);
  };

  const handleRemove = (key) => {
    const current = formData[key];
    if (current?.uri?.startsWith("blob:")) URL.revokeObjectURL(current.uri);
    if (current?.preview?.startsWith("blob:")) URL.revokeObjectURL(current.preview);

    setFormData((prev) => ({ ...prev, [key]: null }));

    const label = requiredDocuments.find((d) => d.key === key)?.label ?? "File";
    toast.success(`${label} removed`);
  };

  const handleContinue = () => {
    const missingDocs = requiredDocuments.filter(
      (d) => d.required && !formData[d.key]
    );

    if (missingDocs.length > 0) {
      toast.error(`Please upload: ${missingDocs.map((m) => m.label).join(", ")}`);
      return;
    }

    if (!String(formData.gcash_reference || "").trim()) {
      toast.error("Please enter your GCash reference number.");
      return;
    }

    onNext();
  };

  const noteText =
    "Partners must provide verification documents and proof of the one-time ₱1,299 registration fee. Admin review is required. Once approved, you will receive 1 month of basic subscription, then ₱599/month (Basic) or ₱999/month (Pro).";

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
              <svg className="w-5 h-5 text-black/90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
              </svg>
            </div>
            <div className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
              <svg className="w-5 h-5 text-black/90" fill="currentColor" viewBox="0 0 24 24">
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
          <h1 className="text-3xl font-semibold text-black/90">Identity verification & Payment</h1>
          <p className="mt-2 text-sm text-black/70">
            Upload the documents required for{" "}
            {formData.creator_role_label || "partner"} approval.
          </p>


          <PaymentCard
            formData={formData}
            setFormData={setFormData}
            disabled={!!uploadingKey}
          />

          {/* Document Upload Tiles */}
          {requiredDocuments.map((doc) => (
            <UploadTile
              key={doc.key}
              doc={doc}
              uploadedFile={formData[doc.key]}
              onPick={handlePick}
              onRemove={handleRemove}
              isUploading={uploadingKey === doc.key}
              disabled={!!uploadingKey}
            />
          ))}

          {/* Info Note */}
          <div
            className="mt-10 p-4 rounded-2xl"
          >
            <div className="flex items-start">
              <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-black/70 ml-2 flex-1">
                <span className="font-semibold">Note:</span> {noteText}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onBack}
              disabled={!!uploadingKey}
              className="flex-1 px-6 py-4 rounded-xl bg-gray-200 text-black/70 text-center font-medium hover:bg-gray-300 transition-colors disabled:opacity-60"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!!uploadingKey}
              className="flex-1 bg-[#191313] py-4 px-8 rounded-xl text-white/90 text-center font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-60"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step02Verification;
