import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  MapPin,
  Building,
  Loader2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Navigation,
  Save,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Step6Destination = ({
  formData,
  setFormData,
  onNext,
  onBack,
  isEditMode = false,
  onSave,
  isSaving = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Initialize from formData if returning to this step
  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      const lat = formData.latitude === "" ? null : Number(formData.latitude);
      const lng = formData.longitude === "" ? null : Number(formData.longitude);

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        setSelectedLocation({
          latitude: lat,
          longitude: lng,
        });
      }
    }
  }, [formData.latitude, formData.longitude]);

  // Initialize Leaflet Map
  useEffect(() => {
    const initializeMap = () => {
      if (window.L && mapContainer.current && !map.current) {
        // Handle initial coordinates - they might be empty strings
        const initialLat =
          formData.latitude && formData.latitude !== ""
            ? Number(formData.latitude)
            : 14.5995;
        const initialLng =
          formData.longitude && formData.longitude !== ""
            ? Number(formData.longitude)
            : 120.9842;
        const defaultZoom =
          formData.latitude && formData.latitude !== "" ? 15 : 11;

        // Create map
        map.current = window.L.map(mapContainer.current).setView(
          [initialLat, initialLng],
          defaultZoom
        );

        // Add tile layer
        window.L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "© OpenStreetMap contributors",
          }
        ).addTo(map.current);

        // Add existing marker if coordinates exist and are not empty strings
        if (
          formData.latitude &&
          formData.longitude &&
          formData.latitude !== "" &&
          formData.longitude !== ""
        ) {
          addMarker(Number(formData.latitude), Number(formData.longitude));
        }

        // Add click event
        map.current.on("click", (e) => {
          const { lat, lng } = e.latlng;
          handleMapClick(lat, lng);
        });

        setMapLoaded(true);
        console.log("Map initialized successfully");
      }
    };

    // Load Leaflet if not already loaded
    if (!window.L) {
      // Load Leaflet CSS
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      cssLink.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      cssLink.crossOrigin = "";
      document.head.appendChild(cssLink);

      // Load Leaflet JS
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.onload = initializeMap;
      script.onerror = () => {
        setErrorMsg("Failed to load map. Please refresh the page.");
      };
      document.body.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const addMarker = (lat, lng) => {
    if (!map.current) return;

    // Remove existing marker
    if (marker.current) {
      map.current.removeLayer(marker.current);
    }

    // Add new marker
    marker.current = window.L.marker([lat, lng], {
      draggable: true,
    }).addTo(map.current);

    // Add popup
    marker.current
      .bindPopup(
        `
      <div style="text-align: center;">
        <strong>📍 Selected Location</strong><br>
        <small>${lat.toFixed(5)}, ${lng.toFixed(5)}</small><br>
        <em>Drag to adjust position</em>
      </div>
    `
      )
      .openPopup();

    // Handle marker drag
    marker.current.on("dragend", (e) => {
      const { lat, lng } = e.target.getLatLng();
      handleMapClick(lat, lng);
    });
  };

  const handleMapClick = async (lat, lng) => {
    setSelectedLocation({ latitude: lat, longitude: lng });
    handleChange("latitude", lat);
    handleChange("longitude", lng);

    addMarker(lat, lng);

    // Center map on the clicked location
    if (map.current) {
      map.current.setView([lat, lng], 15);
    }

    // Try reverse geocoding
    await reverseGeocode(lat, lng);
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg(
        "Geolocation is not supported by this browser. Please click on the map to select a location."
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        console.log("Got coordinates:", latitude, longitude);

        setSelectedLocation({ latitude, longitude });
        handleChange("latitude", latitude);
        handleChange("longitude", longitude);

        // Update map
        if (map.current) {
          map.current.setView([latitude, longitude], 15);
          addMarker(latitude, longitude);
        }

        // Try to get location details
        await reverseGeocode(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Could not get your location: ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage +=
              "Location access denied. Please click on the map to select your location.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage +=
              "Location unavailable. Please click on the map to select your location.";
            break;
          case error.TIMEOUT:
            errorMessage +=
              "Location request timed out. Please click on the map to select your location.";
            break;
          default:
            errorMessage += "Please click on the map to select your location.";
            break;
        }

        setErrorMsg(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  };

  // Reverse geocoding function
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "LocationSelector/1.0",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Reverse geocoding result:", data);

        if (data.address) {
          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.municipality ||
            data.address.county;

          if (city && (!formData.city || formData.city.trim() === "")) {
            handleChange("city", city);
          }

          // Try to set a destination name (only if current destination_name is empty)
          const placeName =
            data.address.tourism ||
            data.address.amenity ||
            data.address.building ||
            data.address.shop ||
            data.name ||
            data.display_name?.split(",")[0];

          if (
            placeName &&
            (!formData.destination_name ||
              formData.destination_name.trim() === "") &&
            !placeName.match(/^\d/)
          ) {
            handleChange("destination_name", placeName);
          }
        }
      }
    } catch (error) {
      console.warn("Could not reverse geocode location:", error);
    }
  };

  // Search for locations using Nominatim (OpenStreetMap)
  const searchLocations = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&addressdetails=1&countrycodes=ph`,
        {
          headers: {
            "User-Agent": "LocationSelector/1.0",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching locations:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Handle search input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle location selection from search
  const handleLocationSelect = async (location) => {
    const latitude = parseFloat(location.lat);
    const longitude = parseFloat(location.lon);

    setSelectedLocation({ latitude, longitude });
    handleChange("latitude", latitude);
    handleChange("longitude", longitude);

    // Update map
    if (map.current) {
      map.current.setView([latitude, longitude], 15);
      addMarker(latitude, longitude);
    }

    // Set destination name (only if current destination_name is empty)
    let placeName = location.name || location.display_name?.split(",")[0];
    if (
      placeName &&
      (!formData.destination_name || formData.destination_name.trim() === "")
    ) {
      handleChange("destination_name", placeName);
    }

    // Set city (only if current city is empty)
    if (location.address) {
      const city =
        location.address.city ||
        location.address.town ||
        location.address.village ||
        location.address.municipality;

      if (city && (!formData.city || formData.city.trim() === "")) {
        handleChange("city", city);
      }
    }

    // Clear search
    setSearchQuery("");
    setSearchResults([]);
  };

  const isValid = () => {
    return (
      formData.destination_name &&
      formData.destination_name.trim() !== "" &&
      formData.city &&
      formData.city.trim() !== "" &&
      formData.destination_description &&
      formData.destination_description.trim() !== "" &&
      formData.latitude &&
      formData.latitude !== "" &&
      !isNaN(Number(formData.latitude)) &&
      formData.longitude &&
      formData.longitude !== "" &&
      !isNaN(Number(formData.longitude))
    );
  };

  const handleContinue = () => {
    if (!selectedLocation) {
      toast.error("Please pin a location on the map or use search.");
      return;
    }

    if (!formData.destination_name?.trim()) {
      toast.error("Please enter a destination name.");
      return;
    }

    if (!formData.city?.trim()) {
      toast.error("Please enter the city.");
      return;
    }

    if (!formData.destination_description?.trim()) {
      toast.error("Please enter a description for this destination.");
      return;
    }

    // If all checks pass
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
                <h2 className="text-left text-xl font-semibold mb-2 text-black/80">
                  Where is your activity located?
                </h2>
                <p className="text-left text-sm text-black/60 mb-6">
                  Search for a location, use your current location, or click
                  anywhere on the map to pin your destination.
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-x-4">
                <button
                  onClick={onBack}
                  className="flex items-center justify-center gap-2 px-8 py-3 text-sm border-2 border-gray-300 text-gray-700 rounded-xl max-h-[44px] font-medium hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={20} />
                  Previous Step
                </button>

                {isEditMode && onSave && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 rounded-lg font-medium bg-[#376a63] text-white text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 max-h-[44px]"
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
                  className="px-8 py-3 rounded-lg font-medium bg-black/80 text-white text-sm hover:bg-black/70 cursor-pointer max-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* TWO COL */}
            <div className="flex flex-row justify-between gap-8">
              {/* LEFT - Location Search & Interactive Map */}
              <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-1 h-fit">
                <h3 className="font-medium text-left text-black/80 mb-2">
                  Find Your Location
                </h3>

                {/* Search Input */}
                <div className="relative mb-4">
                  <div className="relative">
                    <Search
                      size={20}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search for a location (e.g., Rizal Park, Manila)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    {searching && (
                      <Loader2
                        size={20}
                        className="absolute right-3 top-3.5 text-gray-400 animate-spin"
                      />
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => handleLocationSelect(result)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start">
                            <MapPin
                              size={16}
                              className="text-gray-400 mt-1 mr-2 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {result.name ||
                                  result.display_name?.split(",")[0]}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {result.display_name}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Current Location Button */}
                <button
                  onClick={getCurrentLocation}
                  disabled={loading}
                  className="w-full bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-center hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2
                      size={20}
                      className="text-blue-600 animate-spin mr-2"
                    />
                  ) : (
                    <Navigation size={20} className="text-blue-600 mr-2" />
                  )}
                  <span className="font-medium text-blue-600">
                    {loading
                      ? "Getting Current Location..."
                      : "Use Current Location"}
                  </span>
                </button>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-sm">{errorMsg}</p>
                  </div>
                )}

                {/* Interactive Map */}
                <div className="mt-4 h-80 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 relative">
                  <div
                    ref={mapContainer}
                    className="w-full h-full"
                    style={{ minHeight: "320px" }}
                  />
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <Loader2
                          size={32}
                          className="text-gray-400 animate-spin mx-auto mb-2"
                        />
                        <p className="text-sm text-gray-500">
                          Loading interactive map...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Click anywhere on the map to pin your location. You can drag
                  the marker to adjust the position.
                </p>

                {/* Location Confirmation */}
                {selectedLocation && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <div className="flex items-center">
                      <CheckCircle size={16} className="text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        Location Pinned: {selectedLocation.latitude.toFixed(5)},{" "}
                        {selectedLocation.longitude.toFixed(5)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT - Destination Details */}
              <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 h-full flex-1">
                <h3 className="font-medium text-left text-black/80 mb-2">
                  Location Information
                </h3>
                {/* Destination Name + City in One Row */}
                <div className="flex gap-4 pb-4">
                  {/* Destination Name Input */}
                  <div className="flex-1">
                    <label className="block font-medium py-2 text-left text-black/80">
                      Where is the experience located?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g., Rizal Park, SM Mall of Asia"
                        value={formData.destination_name || ""}
                        onChange={(e) =>
                          handleChange("destination_name", e.target.value)
                        }
                        className="w-full p-4 text-sm text-gray-600 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent pr-12"
                        required
                      />
                      <MapPin
                        size={20}
                        className="absolute right-4 top-4 text-gray-400"
                      />
                    </div>
                  </div>

                  {/* City Input */}
                  <div className="flex-1">
                    <label className="block font-medium py-2 text-left text-black/80">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g., Manila, Cebu City"
                        value={formData.city || ""}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className="w-full p-4 text-sm text-gray-600 rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent pr-12"
                        required
                      />
                      <Building
                        size={20}
                        className="absolute right-4 top-4 text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Description Input */}
                <div className="pb-4 flex-1">
                  <label className="block font-medium py-2 text-left text-black/80">
                    Short description or landmark of where the activity takes
                    place <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Describe this location, how to find it, what landmarks to look for, parking information, etc."
                    value={formData.destination_description || ""}
                    onChange={(e) =>
                      handleChange("destination_description", e.target.value)
                    }
                    className="w-full p-4 text-sm text-gray-800 h-32 rounded-xl border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>

                {/* Validation Status */}
                {isValid() && (
                  <div className="bg-[#376a63]/10 rounded-xl p-3">
                    <div className="flex items-center">
                      <CheckCircle size={16} className="text-[#376a63] mr-2" />
                      <span className="text-[#376a63] font-medium text-sm">
                        All destination details completed
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step6Destination;
