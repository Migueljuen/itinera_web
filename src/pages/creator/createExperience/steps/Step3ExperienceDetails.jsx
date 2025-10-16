import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Upload, X, FileImage, Loader2, Save } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import API_URL from "../../../../constants/api";

const units = ["Entry", "Hour", "Day", "Package"];

// Helper function to construct proper image URL
const getImageUrl = (imageUrl) => {
  console.log("getImageUrl input:", imageUrl);

  if (!imageUrl) return '';

  // If already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log("Already full URL, returning as is");
    return imageUrl;
  }

  // Get base URL (remove /api if present)
  const baseUrl = API_URL.replace(/\/api$/, '');
  console.log("Base URL after removing /api:", baseUrl);

  // Remove leading slash from imageUrl to avoid double slashes
  const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
  console.log("Clean image URL:", cleanImageUrl);

  // Construct full URL
  const fullUrl = `${baseUrl}/${cleanImageUrl}`;
  console.log("Final constructed URL:", fullUrl);

  return fullUrl;
};

const Step3ExperienceDetails = ({
  formData,
  setFormData,
  onNext,
  onBack,
  isEditMode = false,
  onSave,
  isSaving = false,
  deletedImageIds = [],
  setDeletedImageIds = () => { },
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Debug: Log props on mount and when they change
  useEffect(() => {
    console.log("Step3ExperienceDetails - Props:", {
      isEditMode,
      deletedImageIds,
      hasSetDeletedImageIds: typeof setDeletedImageIds === 'function',
      imagesCount: formData.images?.length
    });
  }, [isEditMode, deletedImageIds, formData.images]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Image handling functions
  const handleFileSelect = async (files) => {
    if (!files.length) return;

    setIsLoading(true);
    try {
      const imageInfoPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith("image/")) {
          console.warn(`File ${file.name} is not an image`);
          return null;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          console.warn(
            `File ${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB)`
          );
          toast.error(`${file.name} is too large. Maximum size is 5MB.`);
          return null;
        }

        const uri = URL.createObjectURL(file);

        return {
          uri,
          name: file.name,
          type: file.type,
          size: file.size,
          file: file,
          isExisting: false, // Mark as new upload
        };
      });

      const imageInfoArray = (await Promise.all(imageInfoPromises)).filter(Boolean);

      if (imageInfoArray.length > 0) {
        setFormData({
          ...formData,
          images: [...(formData.images || []), ...imageInfoArray],
        });
        toast.success(`${imageInfoArray.length} image(s) added successfully`);
      }
    } catch (error) {
      console.error("Error processing images:", error);
      toast.error("Failed to process images");
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

  const removeImage = (imageData) => {
    console.log("Removing image:", imageData);
    console.log("Is edit mode:", isEditMode);
    console.log("Current deletedImageIds:", deletedImageIds);

    // If it's an existing image (has image_id), track it for deletion
    if (isEditMode && imageData.isExisting && imageData.image_id && setDeletedImageIds) {
      const newDeletedIds = [...deletedImageIds, imageData.image_id];
      setDeletedImageIds(newDeletedIds);
      console.log("Updated deletedImageIds:", newDeletedIds);
      toast.success("Image marked for deletion");
    }

    // If it's a new upload (blob URL), revoke it to prevent memory leaks
    if (!imageData.isExisting && imageData.uri && imageData.uri.startsWith("blob:")) {
      URL.revokeObjectURL(imageData.uri);
      toast.success("Image removed");
    }

    // Remove from images array - use a proper comparison
    const updatedImages = (formData.images || []).filter((img) => {
      // For existing images, compare by image_id
      if (img.isExisting && imageData.isExisting) {
        return img.image_id !== imageData.image_id;
      }
      // For new images, compare by uri
      if (!img.isExisting && !imageData.isExisting) {
        return img.uri !== imageData.uri;
      }
      // Different types, keep the image
      return true;
    });

    console.log("Updated images array:", updatedImages);

    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleContinue = () => {
    if (!formData.title) {
      toast.error("Please enter a title.");
      return;
    }
    if (!formData.description) {
      toast.error("Please enter a description.");
      return;
    }
    if (!formData.price) {
      toast.error("Please enter a price.");
      return;
    }
    if (!units.includes(formData.unit)) {
      toast.error("Please select a unit.");
      return;
    }
    onNext();
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave();
    }
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
      <div className="min-h-screen w-full">
        <div className="mx-auto">
          <div className="text-center py-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-left text-xl font-semibold mb-2 text-black/90">
                  Getting Started
                </h2>
                <p className="text-left text-sm text-black/60 mb-6">
                  Please fill the form below. Feel free to add as much detail as needed.
                </p>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-3">
                {isEditMode && onSave && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 rounded-lg font-medium bg-[#376a63] text-white text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleContinue}
                  disabled={isSaving}
                  className="px-8 py-3 rounded-lg font-medium bg-black/80 text-white text-sm hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* TWO COL */}
            <div className="flex flex-row justify-between gap-8">
              {/* LEFT */}
              <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-1 h-fit">
                {/* Title Input */}
                <div className="pb-4">
                  <label className="block font-medium py-2 text-left text-black/90">
                    Activity Title
                  </label>
                  <p className="text-left text-sm text-black/60 mb-4">
                    Keep it clear so travelers know what to expect.
                  </p>
                  <input
                    type="text"
                    placeholder="E.g. Sunset in the mountains"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full px-4 py-2 text-sm text-gray-600 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description Input */}
                <div className="pb-4">
                  <label className="block font-medium py-2 text-left">
                    Give a short description of your activity
                  </label>
                  <textarea
                    placeholder="Short description of the activity"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full p-4 text-sm text-gray-800 h-32 rounded-sm border border-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                {/* Price Input */}
                <div className="flex gap-4">
                  <div className="flex-[0.7] text-left">
                    <label className="font-medium text-black/90">
                      How much do you charge?
                    </label>
                    <input
                      type="number"
                      placeholder="₱ Price"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      className="w-full px-4 py-2 mt-2 text-sm text-gray-800 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Units Selection */}
                  <div className="flex-[0.3]">
                    <label className="block text-base font-medium text-left text-black/90">
                      Per
                    </label>
                    <div className="mb-2">
                      <select
                        value={formData.unit}
                        onChange={(e) => handleChange("unit", e.target.value)}
                        className="w-full px-4 py-2 mt-2 rounded-sm border border-gray-300 text-black/80 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/50 transition-colors duration-200"
                      >
                        <option value="" disabled>
                          Select unit
                        </option>
                        {units.map((unit) => (
                          <option
                            className="border-none flex items-center justify-between gap-2 px-2 py-1 rounded-md text-sm font-normal capitalize"
                            key={unit}
                            value={unit}
                          >
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT - Images Upload Section */}
              <div className="flex flex-col border rounded-xl p-4 border-gray-300 flex-1 h-fit">
                <h3 className="font-medium py-2 text-left text-black/90">
                  Upload Images
                </h3>
                <p className="text-left text-sm text-black/60 mb-8">
                  Select images that showcase your experience. High-quality photos will
                  attract more visitors.
                </p>

                {/* Drag and Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={pickImage}
                  className={`border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors ${dragOver
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

                <p className="text-xs text-gray-500 text-center italic py-4">
                  {formData.images?.length > 0
                    ? `${formData.images.length} image${formData.images.length > 1 ? "s" : ""
                    } selected`
                    : "Optional: Add images to showcase your experience"}
                </p>

                {/* Selected Images Display */}
                <div className="w-h-52 overflow-y-auto">
                  {(formData.images || []).length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 px-4">
                      {(formData.images || []).map((img, index) => {
                        // Handle both existing images and new uploads
                        const uri = img.isExisting
                          ? getImageUrl(img.image_url)
                          : img.uri;

                        const name = img.isExisting
                          ? `Image ${index + 1}`
                          : img.name;
                        const size = img.isExisting ? null : img.size;
                        const uniqueKey = img.image_id || img.tempId || img.uri || `img-${index}`;

                        // Debug log
                        if (index === 0) {
                          console.log("First image structure:", JSON.stringify(img, null, 2));
                          console.log("Image keys:", Object.keys(img));
                          console.log("img.image_url:", img.image_url);
                          console.log("Constructed URI:", uri);
                          console.log("API_URL:", API_URL);
                        }

                        return (
                          <div
                            key={uniqueKey}
                            className="relative group mt-4"
                          >
                            {/* Image Preview */}
                            <div className="rounded-lg overflow-hidden h-32">
                              <img
                                src={uri}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error("Image load error:", uri);
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' dy='.3em'%3EError%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            </div>

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log("Remove button clicked for:", img);
                                removeImage(img);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
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
                              {img.isExisting && (
                                <p className="text-xs text-green-600">
                                  Uploaded • ID: {img.image_id}
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
    </>
  );
};

export default Step3ExperienceDetails;