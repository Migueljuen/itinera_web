import React, { useState, useRef } from "react";
import { Upload, X, FileImage, Loader2 } from "lucide-react";

const Step7Images = ({ formData, setFormData, onNext, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (!files.length) return;

    setIsLoading(true);
    try {
      const imageInfoPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          console.warn(`File ${file.name} is not an image`);
          return null;
        }

        // Validate file size (optional - e.g., 5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          console.warn(
            `File ${file.name} is too large (${(
              file.size /
              1024 /
              1024
            ).toFixed(1)}MB)`
          );
          return null;
        }

        // Create object URL for preview
        const uri = URL.createObjectURL(file);

        return {
          uri,
          name: file.name,
          type: file.type,
          size: file.size,
          file: file, // Store the actual File object for upload
        };
      });

      const imageInfoArray = (await Promise.all(imageInfoPromises)).filter(
        Boolean
      );

      if (imageInfoArray.length > 0) {
        setFormData({
          ...formData,
          images: [...(formData.images || []), ...imageInfoArray],
        });
      }
    } catch (error) {
      console.error("Error processing images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event) => {
    const files = event.target.files;
    if (files) {
      handleFileSelect(files);
    }
    // Reset input value to allow selecting the same files again
    event.target.value = "";
  };

  // Drag and drop handlers
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
    const files = e.dataTransfer.files;
    if (files) {
      handleFileSelect(files);
    }
  };

  const isValid = () => formData.images && formData.images.length > 0;

  const removeImage = (uri) => {
    // Revoke object URL to prevent memory leaks
    const imageToRemove = formData.images.find((img) =>
      typeof img === "string" ? img === uri : img.uri === uri
    );

    if (
      imageToRemove &&
      typeof imageToRemove !== "string" &&
      imageToRemove.uri.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imageToRemove.uri);
    }

    setFormData({
      ...formData,
      images: (formData.images || []).filter((img) =>
        typeof img === "string" ? img !== uri : img.uri !== uri
      ),
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto">
      <div className="text-center py-2">
        <h2 className="text-center text-xl font-semibold mb-2">
          Upload Images
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6 w-3/4 mx-auto">
          Select images that showcase your experience. High-quality photos will
          attract more visitors.
        </p>

        <div className="flex flex-col gap-6 border-t pt-12 border-gray-200">
          {/* Upload Area */}
          <div className="bg-white pb-4">
            <h3 className="font-medium py-2 text-left mb-4">Upload Images</h3>

            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={pickImage}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              } ${isLoading ? "pointer-events-none opacity-50" : ""}`}
            >
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <Loader2
                    size={48}
                    className="text-blue-600 animate-spin mb-4"
                  />
                  <p className="text-gray-600">Processing images...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload size={48} className="text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop images here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Support: JPG, PNG, GIF up to 5MB each
                  </p>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />

            <p className="text-xs text-gray-500 text-center mt-2 italic">
              {formData.images?.length > 0
                ? `${formData.images.length} image${
                    formData.images.length > 1 ? "s" : ""
                  } selected`
                : "Please select at least one image"}
            </p>
          </div>

          {/* Selected Images Display */}
          <div className="bg-white pb-4">
            <h3 className="font-medium py-2 text-left mb-4">Selected Images</h3>

            <div className="min-h-[200px] max-h-96 overflow-y-auto">
              {(formData.images || []).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {(formData.images || []).map((img, index) => {
                    const uri = typeof img === "string" ? img : img.uri;
                    const name =
                      typeof img === "string" ? `Image ${index + 1}` : img.name;
                    const size = typeof img === "string" ? null : img.size;

                    return (
                      <div key={index} className="relative group">
                        {/* Image Preview */}
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={uri}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                          {/* Fallback if image fails to load */}
                          <div className="w-full h-full flex items-center justify-center text-gray-400 ">
                            <FileImage size={32} />
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeImage(uri)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          aria-label={`Remove ${name}`}
                        >
                          <X size={16} />
                        </button>

                        {/* Image Info */}
                        <div className="mt-2">
                          <p
                            className="text-xs text-gray-600 truncate"
                            title={name}
                          >
                            {name}
                          </p>
                          {size && (
                            <p className="text-xs text-gray-400">
                              {formatFileSize(size)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  <FileImage size={48} className="mb-4" />
                  <p className="text-gray-500">No images selected</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Images will appear here after selection
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={onBack}
              className="flex-1 border border-gray-300 text-gray-800 p-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Previous step
            </button>
            <button
              onClick={isValid() ? onNext : undefined}
              disabled={!isValid()}
              className={`flex-1 p-4 px-6 rounded-xl font-medium transition-colors ${
                isValid()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step7Images;
