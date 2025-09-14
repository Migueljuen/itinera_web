import React, { useState, useRef } from "react";
import { ArrowRight, Upload, X, FileImage, Loader2 } from "lucide-react";

const units = ["Entry", "Hour", "Day", "Package"];

const Step3ExperienceDetails = ({ formData, setFormData, onNext }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Image handling functions from Step 7
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

  const isValid = () => {
    return (
      formData.title &&
      formData.description &&
      formData.price &&
      units.includes(formData.unit)
    );
  };

  return (
    <div className="min-h-screen w-full">
      <div className=" mx-auto">
        <div className="text-center py-2">
          <div className="flex items-center justify-between ">
            <div>
              <h2 className="text-left text-xl font-semibold mb-2 text-black/90">
                Getting Started
              </h2>
              <p className="text-left text-sm text-black/60 mb-6">
                Please fill the form below. Feel free to add as much detail as
                needed.
              </p>
            </div>
            {/* Next Button */}

            <button
              onClick={isValid() ? onNext : undefined}
              disabled={!isValid()}
              className="px-8 py-3 rounded-lg font-medium bg-black/80 text-white text-sm hover:bg-black/70 cursor-pointer"
            >
              Continue
            </button>
          </div>
          {/* TWO COL */}
          <div className="flex flex-row justify-between gap-8 ">
            {/* LEFT*/}
            <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-1 h-fit">
              {/* Title Input */}
              <div className="pb-4">
                <label className="block font-medium py-2 text-left text-black/90">
                  Activity Title
                </label>
                <input
                  type="text"
                  placeholder="E.g. Sunset in the mountains"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full p-4 text-sm text-gray-600 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description Input */}
              <div className="pb-4">
                <label className="block font-medium py-2 text-left">
                  Description
                </label>
                <textarea
                  placeholder="Short description of the activity"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full p-4 text-sm text-gray-800 h-32 rounded-xl border border-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              {/* Price Input */}
              <div className="pb-4">
                <label className="block font-medium py-2 text-left text-black/90">
                  Pricing
                </label>
                <input
                  type="number"
                  placeholder="₱ Price"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="w-full p-4 text-sm text-gray-800 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Units Selection */}
              <div className="mt-6">
                <label className="block text-base font-medium py-2 text-left text-black/90">
                  Charge per
                </label>
                <div className="flex flex-wrap gap-3 mb-2">
                  {units.map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleChange("unit", unit)}
                      className={`px-6 py-2 rounded-xl transition-colors duration-200 ${formData.unit === unit
                        ? "bg-black/80 text-white"
                        : "bg-white border border-gray-300 text-black/60 hover:bg-gray-50 "
                        }`}
                    >
                      <span className="text-sm font-medium">{unit}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT - Images Upload Section */}
            <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-1 h-fit">
              <h3 className="font-medium py-2 text-left text-black/90">
                Upload Images
              </h3>
              <p className="text-left text-sm text-black/60 mb-4">
                Select images that showcase your experience. High-quality photos will attract more visitors.
              </p>

              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={pickImage}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  } ${isLoading ? "pointer-events-none opacity-50" : ""}`}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <Loader2
                      size={36}
                      className="text-blue-600 animate-spin mb-3"
                    />
                    <p className="text-sm text-gray-600">Processing images...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload size={36} className="text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Drop images here or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
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

              <p className="text-xs text-gray-500 text-center italic">
                {formData.images?.length > 0
                  ? `${formData.images.length} image${formData.images.length > 1 ? "s" : ""
                  } selected`
                  : "Optional: Add images to showcase your experience"}
              </p>

              {/* Selected Images Display */}
              <div className="max-h-64 overflow-y-auto">
                {(formData.images || []).length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
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
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FileImage size={24} />
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeImage(uri)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            aria-label={`Remove ${name}`}
                          >
                            <X size={14} />
                          </button>

                          {/* Image Info */}
                          <div className="mt-1">
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
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    <FileImage size={32} className="mb-2" />
                    <p className="text-sm text-gray-500">No images selected</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Images will appear here after selection
                    </p>
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3ExperienceDetails;