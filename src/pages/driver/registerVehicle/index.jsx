import React, { useState, useRef } from "react";
import { Upload, X, FileImage, Loader2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const vehicleTypes = [
  "Sedan",
  "SUV",
  "Van",
  "Pickup Truck",
  "Motorcycle",
  "Other",
];

const vehicleBrands = {
  Toyota: ["Vios", "Corolla", "Innova", "Fortuner", "Hilux"],
  Honda: ["City", "Civic", "CR-V", "BR-V"],
  Mitsubishi: ["Mirage", "Montero", "Strada"],
  Nissan: ["Almera", "Navara", "Terra"],
  Suzuki: ["Ertiga", "Swift"],
  Yamaha: ["Mio", "NMAX", "Aerox"],
};

const OTHER = "Other";

const VehicleRegistrationPage = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [documentDragOver, setDocumentDragOver] = useState(false);

  const photoInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const [formData, setFormData] = useState({
    plate_number: "",
    vehicle_type: "",
    brand: "",
    model: "",
    custom_brand: "",
    custom_model: "",
    year: "",
    color: "",
    passenger_capacity: "",
    vehicle_photos: [],
    or_cr_document: null,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBrandChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      brand: value,
      model: "",
      custom_brand: "",
      custom_model: "",
    }));
  };

  /* ---------------- PHOTO HANDLING ---------------- */

  const handlePhotoSelect = async (files) => {
    if (!files.length) return;

    setIsLoading(true);
    try {
      const images = Array.from(files)
        .map((file) => {
          if (!file.type.startsWith("image/")) return null;

          const maxSize = 5 * 1024 * 1024;
          if (file.size > maxSize) {
            alert(`${file.name} is too large (max 5MB).`);
            return null;
          }

          return {
            uri: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            file,
          };
        })
        .filter(Boolean);

      if (images.length) {
        setFormData((prev) => ({
          ...prev,
          vehicle_photos: [...prev.vehicle_photos, ...images],
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removePhoto = (photo) => {
    if (photo.uri?.startsWith("blob:")) {
      URL.revokeObjectURL(photo.uri);
    }
    setFormData((prev) => ({
      ...prev,
      vehicle_photos: prev.vehicle_photos.filter(
        (img) => img.uri !== photo.uri
      ),
    }));
  };

  /* ---------------- DOCUMENT HANDLING ---------------- */

  const handleDocumentSelect = (files) => {
    if (!files.length) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Document is too large (max 10MB).");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      or_cr_document: {
        uri: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        file,
      },
    }));
  };

  const removeDocument = () => {
    if (formData.or_cr_document?.uri?.startsWith("blob:")) {
      URL.revokeObjectURL(formData.or_cr_document.uri);
    }
    setFormData((prev) => ({ ...prev, or_cr_document: null }));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 2000));
      alert("Vehicle registered successfully!");
      navigate("/driver/vehicles");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto">
        <div className="text-center py-2">
          {/* PAGE HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-left text-xl font-semibold mb-2 text-black/90">
                Register your vehicle
              </h2>
              <p className="text-left text-sm text-black/60">
                Get started by filling in the details below.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-lg font-medium bg-black/80 text-white text-sm hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Vehicle"
              )}
            </button>
          </div>

          {/* TWO COLUMN LAYOUT */}
          <div className="flex flex-row gap-8">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-1 h-fit bg-white">
              <div>
                <h3 className="text-left font-semibold text-black/90 mb-2">
                  Vehicle Information
                </h3>
                <p className="text-left text-sm text-black/60 mb-4">
                  Provide accurate details so your vehicle can be verified.
                </p>
              </div>

              {/* Plate Number */}
              <div>
                <label className="block font-medium py-2 text-left text-black/90">
                  Plate Number
                </label>
                <input
                  type="text"
                  placeholder="ABC 1234"
                  value={formData.plate_number}
                  onChange={(e) =>
                    handleChange("plate_number", e.target.value.toUpperCase())
                  }
                  className="w-full px-4 py-2 text-sm text-gray-800 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block font-medium py-2 text-left text-black/90">
                  Brand
                </label>
                <select
                  value={formData.brand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full px-4 py-2 text-sm text-gray-800 rounded-sm border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select brand</option>
                  {Object.keys(vehicleBrands).map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                  <option value={OTHER}>Other</option>
                </select>

                {formData.brand === OTHER && (
                  <input
                    type="text"
                    placeholder="Enter brand"
                    value={formData.custom_brand}
                    onChange={(e) =>
                      handleChange("custom_brand", e.target.value)
                    }
                    className="mt-2 w-full px-4 py-2 text-sm text-gray-800 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                )}
              </div>

              {/* Model */}
              <div>
                <label className="block font-medium py-2 text-left text-black/90">
                  Model
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  disabled={!formData.brand}
                  className="w-full px-4 py-2 text-sm text-gray-800 rounded-sm border border-gray-300 bg-white disabled:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">
                    {formData.brand ? "Select model" : "Select brand first"}
                  </option>

                  {formData.brand &&
                    formData.brand !== OTHER &&
                    vehicleBrands[formData.brand]?.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}

                  <option value={OTHER}>Other</option>
                </select>

                {formData.model === OTHER && (
                  <input
                    type="text"
                    placeholder="Enter model"
                    value={formData.custom_model}
                    onChange={(e) =>
                      handleChange("custom_model", e.target.value)
                    }
                    className="mt-2 w-full px-4 py-2 text-sm text-gray-800 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                )}
              </div>

              {/* Color */}
              <div>
                <label className="block font-medium py-2 text-left text-black/90">
                  Color
                </label>
                <input
                  type="text"
                  placeholder="White"
                  value={formData.color}
                  onChange={(e) =>
                    handleChange("color", e.target.value.toUpperCase())
                  }
                  className="w-full px-4 py-2 text-sm text-gray-800 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-medium py-2 text-left text-black/90">
                    Year
                  </label>
                  <input
                    type="number"
                    placeholder={currentYear}
                    value={formData.year}
                    onChange={(e) => handleChange("year", e.target.value)}
                    className="w-full px-4 py-2 text-sm rounded-sm border border-gray-300 focus:ring-1"
                  />
                </div>

                <div className="flex-1">
                  <label className="block font-medium py-2 text-left text-black/90">
                    Passenger Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 4"
                    value={formData.passenger_capacity}
                    onChange={(e) =>
                      handleChange("passenger_capacity", e.target.value)
                    }
                    className="w-full px-4 py-2 text-sm rounded-sm border border-gray-300 focus:ring-1"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium py-2 text-left text-black/90">
                  Vehicle Type
                </label>
                <select
                  value={formData.vehicle_type}
                  onChange={(e) => handleChange("vehicle_type", e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-sm border border-gray-300 bg-white"
                >
                  <option value="">Select vehicle type</option>
                  {vehicleTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* OR/CR DOCUMENT */}
              <div>
                <label className="block font-medium py-2 text-left text-black/90">
                  OR / CR Document
                </label>
                <p className="text-left text-sm text-black/60 mb-4">
                  Upload your Official Receipt and Certificate of Registration.
                </p>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDocumentDragOver(true);
                  }}
                  onDragLeave={() => setDocumentDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDocumentDragOver(false);
                    handleDocumentSelect(e.dataTransfer.files);
                  }}
                  onClick={() => documentInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-sm p-6 cursor-pointer transition-colors ${
                    documentDragOver
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FileText className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">
                    Drop document here or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG up to 10MB
                  </p>
                </div>

                <input
                  ref={documentInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleDocumentSelect(e.target.files)}
                  className="hidden"
                />

                {formData.or_cr_document && (
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span>{formData.or_cr_document.name}</span>
                    <button onClick={removeDocument}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col border rounded-xl p-4 border-gray-300 flex-1 h-fit bg-white">
              <div>
                <h3 className="font-medium mb-2 text-left text-black/90">
                  Vehicle Photos
                </h3>
                <p className="text-left text-sm text-black/60 mb-8">
                  Upload clear images that show your vehicle from different
                  angles.
                </p>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handlePhotoSelect(e.dataTransfer.files);
                }}
                onClick={() => photoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:bg-gray-50"
                } ${isLoading ? "pointer-events-none opacity-50" : ""}`}
              >
                {isLoading ? (
                  <Loader2 className="mx-auto animate-spin" />
                ) : (
                  <>
                    <Upload className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">
                      Drop images here or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, GIF up to 5MB each
                    </p>
                  </>
                )}
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handlePhotoSelect(e.target.files)}
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-3 mt-4">
                {formData.vehicle_photos.length > 0 ? (
                  formData.vehicle_photos.map((img) => (
                    <div key={img.uri} className="relative group">
                      <img
                        src={img.uri}
                        alt=""
                        className="h-32 w-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(img)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatFileSize(img.size)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    <FileImage size={32} className="mb-2" />
                    <p className="text-sm text-gray-500">No photos selected</p>
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

export default VehicleRegistrationPage;
