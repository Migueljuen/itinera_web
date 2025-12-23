import React, { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Step01PartnerInfo = ({ formData, setFormData, onNext, onBack }) => {
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);

    console.log(formData)
    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

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

        setFormData({ ...formData, profile_photo: { file, uri } });
        toast.success("Profile photo added");
    };

    const removeImage = () => {
        if (formData.profile_photo?.uri?.startsWith("blob:")) {
            URL.revokeObjectURL(formData.profile_photo.uri);
        }
        setFormData({ ...formData, profile_photo: null });
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
        if (!formData.full_name) {
            toast.error("Please enter your full name.");
            return;
        }
        if (!formData.email) {
            toast.error("Please enter your email.");
            return;
        }
        if (!formData.phone) {
            toast.error("Please enter your phone number.");
            return;
        }
        onNext();
    };

    return (
        <div className="min-h-screen w-full p-4">
            <Toaster />
            <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Partner Information</h2>
                <p className="text-gray-600 mb-6">
                    Please fill in your personal information and upload a profile photo.
                </p>

                {/* Form Fields */}
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block font-medium text-gray-800 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            placeholder="Your full name"
                            value={formData.full_name || ""}
                            onChange={(e) => handleChange("full_name", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-800 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Your email"
                            value={formData.email || ""}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-800 mb-1">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            placeholder="Your phone number"
                            value={formData.phone || ""}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Profile Photo Upload */}
                    <div>
                        <label className="block font-medium text-gray-800 mb-1">
                            Profile Photo
                        </label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={pickImage}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragOver
                                ? "border-blue-400 bg-blue-50"
                                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                } ${isLoading ? "pointer-events-none opacity-50" : ""}`}
                        >
                            {formData.profile_photo ? (
                                <div className="relative inline-block">
                                    <img
                                        src={formData.profile_photo.uri}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover mx-auto"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage();
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Upload size={36} className="text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">
                                        Click or drag to upload your profile photo
                                    </p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-6">
                    <button
                        onClick={onBack}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleContinue}
                        className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step01PartnerInfo;
