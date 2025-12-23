import React, { useState, useRef } from "react";
import { Upload, X, FileImage, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const documentTypes = ["ID", "License", "Vehicle"];

const Step02Verification = ({ formData, setFormData, onNext, onBack }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [dragOver, setDragOver] = useState(null); // track drag over per type
    const fileInputRefs = useRef({}); // one ref per document type

    const handleChangeFile = async (files, type) => {
        if (!files.length) return;

        setIsLoading(true);
        try {
            const file = files[0]; // only one file per type
            if (!file.type.startsWith("image/")) {
                toast.error("Only image files are allowed");
                return;
            }
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                toast.error("File too large. Max 5MB");
                return;
            }

            const uri = URL.createObjectURL(file);

            const newDocuments = formData.documents?.filter(
                (doc) => doc.type !== type
            ) || [];

            newDocuments.push({ type, file, uri, isExisting: false });

            setFormData({ ...formData, documents: newDocuments });
            toast.success(`${type} uploaded successfully`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload document");
        } finally {
            setIsLoading(false);
        }
    };

    const pickFile = (type) => {
        fileInputRefs.current[type]?.click();
    };

    const handleFileInputChange = (e, type) => {
        const files = e.target.files;
        if (files) handleChangeFile(files, type);
        e.target.value = ""; // reset input
    };

    const handleDragOver = (e, type) => {
        e.preventDefault();
        setDragOver(type);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(null);
    };
    const handleDrop = (e, type) => {
        e.preventDefault();
        setDragOver(null);
        const files = e.dataTransfer.files;
        if (files) handleChangeFile(files, type);
    };

    const removeFile = (type) => {
        const updated = (formData.documents || []).filter(
            (doc) => doc.type !== type
        );
        setFormData({ ...formData, documents: updated });
        toast.success(`${type} removed`);
    };

    const handleContinue = () => {
        const hasID = formData.documents?.some((d) => d.type === "ID");
        if (!hasID) {
            toast.error("Please upload at least an ID to continue");
            return;
        }
        onNext();
    };

    return (
        <>
            <Toaster />
            <div className="min-h-screen w-full max-w-4xl mx-auto py-8">
                <h2 className="text-2xl font-semibold mb-4">Verify Your Identity</h2>
                <p className="mb-6 text-gray-600">
                    Upload the necessary documents to complete your partner verification.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {documentTypes.map((type) => {
                        const doc = formData.documents?.find((d) => d.type === type);
                        return (
                            <div key={type} className="border rounded-lg p-4 relative">
                                <h3 className="font-medium mb-2">{type}</h3>

                                <div
                                    onDragOver={(e) => handleDragOver(e, type)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, type)}
                                    onClick={() => pickFile(type)}
                                    className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${dragOver === type
                                            ? "border-blue-400 bg-blue-50"
                                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                        } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                                >
                                    {isLoading && dragOver === type ? (
                                        <Loader2 size={32} className="animate-spin text-blue-600" />
                                    ) : doc ? (
                                        <img
                                            src={doc.uri}
                                            alt={type}
                                            className="w-full h-32 object-cover rounded-md"
                                        />
                                    ) : (
                                        <>
                                            <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm text-gray-600">Drop or click to upload</p>
                                            <p className="text-xs text-gray-400 mt-1">Max size: 5MB</p>
                                        </>
                                    )}
                                </div>

                                {doc && (
                                    <button
                                        onClick={() => removeFile(type)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}

                                <input
                                    ref={(el) => (fileInputRefs.current[type] = el)}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileInputChange(e, type)}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-between mt-10">
                    <button
                        onClick={onBack}
                        className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleContinue}
                        className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </>
    );
};

export default Step02Verification;
