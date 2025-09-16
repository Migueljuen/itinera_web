import React, { useEffect, useState } from "react";
import { Search, MapPin, Building, Loader2, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;

      // Reverse geocode the clicked location
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();

        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: data
        });
      } catch (error) {
        console.error('Error reverse geocoding clicked location:', error);
        // Still allow selection even if geocoding fails
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: null
        });
      }
    }
  });

  return null;
};

const Step6Destination = ({ formData, setFormData, onNext, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState([14.5995, 120.9842]); // Default to Manila
  const [mapZoom, setMapZoom] = useState(13);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Sync selectedLocation from formData (if returning to this step)
  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      const location = {
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      };
      setSelectedLocation(location);
      setMapCenter([location.latitude, location.longitude]);
      setMapZoom(15);
    }
  }, []);

  // Get user's current location
  useEffect(() => {
    const getCurrentLocation = async () => {
      if (!navigator.geolocation) {
        setErrorMsg("Geolocation is not supported by this browser");
        return;
      }

      setLoading(true);
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        const { latitude, longitude } = position.coords;

        // Only set if formData has no coordinates yet
        if (!formData.latitude || !formData.longitude) {
          const location = { latitude, longitude };
          setSelectedLocation(location);
          setMapCenter([latitude, longitude]);
          setMapZoom(15);
          handleChange("latitude", latitude);
          handleChange("longitude", longitude);

          // Reverse geocode to get city
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            if (data.address && !formData.city) {
              const city =
                data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.municipality ||
                "";
              if (city) {
                handleChange("city", city);
              }
            }
          } catch (error) {
            console.error("Error reverse geocoding:", error);
          }
        }
      } catch (error) {
        setErrorMsg("Error getting location: " + error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  // Search for locations
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
        )}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data || []);
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

    const selectedLoc = { latitude, longitude };
    setSelectedLocation(selectedLoc);
    setMapCenter([latitude, longitude]);
    setMapZoom(15);
    handleChange("latitude", latitude);
    handleChange("longitude", longitude);

    // Extract place name and city from the selected location
    let placeName = "";

    if (location.name) {
      placeName = location.name;
    } else if (location.address) {
      placeName =
        location.address.tourism ||
        location.address.amenity ||
        location.address.leisure ||
        location.address.building ||
        location.address.house_name ||
        location.address.shop ||
        location.address.office ||
        "";
    }

    if (!placeName) {
      const addressParts = location.display_name.split(",");
      const firstPart = addressParts[0].trim();
      if (firstPart && !/^\d/.test(firstPart)) {
        placeName = firstPart;
      }
    }

    if (placeName && !formData.destination_name) {
      handleChange("destination_name", placeName);
    }

    // Extract city
    if (location.address) {
      const city =
        location.address.city ||
        location.address.town ||
        location.address.village ||
        location.address.municipality ||
        "";

      if (city) {
        handleChange("city", city);
      }
    }

    // Clear search
    setSearchQuery("");
    setSearchResults([]);
  };

  // Handle location selection from map click
  const handleMapLocationSelect = ({ latitude, longitude, address }) => {
    const selectedLoc = { latitude, longitude };
    setSelectedLocation(selectedLoc);
    handleChange("latitude", latitude);
    handleChange("longitude", longitude);

    // Extract information from reverse geocoding if available
    if (address && address.address) {
      // Extract place name
      let placeName = "";
      if (address.name) {
        placeName = address.name;
      } else if (address.address) {
        placeName =
          address.address.tourism ||
          address.address.amenity ||
          address.address.leisure ||
          address.address.building ||
          address.address.house_name ||
          address.address.shop ||
          address.address.office ||
          "";
      }

      if (!placeName) {
        const addressParts = address.display_name?.split(",") || [];
        const firstPart = addressParts[0]?.trim();
        if (firstPart && !/^\d/.test(firstPart)) {
          placeName = firstPart;
        }
      }

      if (placeName && !formData.destination_name) {
        handleChange("destination_name", placeName);
      }

      // Extract city
      const city =
        address.address.city ||
        address.address.town ||
        address.address.village ||
        address.address.municipality ||
        "";

      if (city && !formData.city) {
        handleChange("city", city);
      }
    }
  };

  const getCurrentLocationHandler = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { latitude, longitude };
        setSelectedLocation(location);
        setMapCenter([latitude, longitude]);
        setMapZoom(15);
        handleChange("latitude", latitude);
        handleChange("longitude", longitude);
        setLoading(false);
      },
      (error) => {
        setErrorMsg("Error getting current location");
        setLoading(false);
      }
    );
  };

  const isValid = () => {
    return (
      formData.destination_name &&
      formData.city &&
      formData.destination_description &&
      formData.latitude &&
      formData.longitude
    );
  };

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto">
        <div className="text-center py-2">
          <div className="flex items-center justify-between ">
            <div>
              <h2 className="text-left text-xl font-semibold mb-2 text-black/90">
                Where is your activity located?
              </h2>
              <p className="text-left text-sm text-black/60 mb-6">
                Add the main location where your activity takes place. This helps visitors find where you'll meet them.
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

              <button
                onClick={isValid() ? onNext : undefined}
                disabled={!isValid()}
                className="px-8 py-3 rounded-lg font-medium bg-black/80 text-white text-sm hover:bg-black/70 cursor-pointer max-h-[44px]"
              >
                Continue
              </button>
            </div>
          </div>
          {/* TWO COL */}
          <div className="flex flex-row justify-between gap-8">
            {/* LEFT - Location Search & Interactive Map */}
            <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-1 h-fit">
              <h3 className="font-medium text-left text-black/90 mb-2">
                Search location or click on map
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
                              {result.display_name.split(",")[0]}
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
                onClick={getCurrentLocationHandler}
                disabled={loading}
                className="w-full bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-center hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2
                    size={20}
                    className="text-blue-600 animate-spin mr-2"
                  />
                ) : (
                  <MapPin size={20} className="text-blue-600 mr-2" />
                )}
                <span className="font-medium text-blue-600">
                  {loading
                    ? "Getting Current Location..."
                    : "Use Current Location"}
                </span>
              </button>

              {errorMsg && (
                <p className="text-red-500 text-sm mt-2">{errorMsg}</p>
              )}

              {/* Interactive Map */}
              <div className="mt-4 h-80 rounded-xl overflow-hidden border border-gray-200">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-xl"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  <MapClickHandler onLocationSelect={handleMapLocationSelect} />

                  {selectedLocation && (
                    <Marker position={[selectedLocation.latitude, selectedLocation.longitude]}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-medium">Selected Location</p>
                          <p className="text-xs text-gray-600">
                            {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Click anywhere on the map to select a location
              </p>
            </div>

            {/* RIGHT - Destination Details */}
            <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-1">
              <h3 className="font-medium text-left text-black/90 mb-2">
                Destination Information
              </h3>

              {/* Destination Name Input */}
              <div className="pb-4">
                <label className="block font-medium py-2 text-left text-black/90">
                  Destination Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Rizal Park, SM Mall of Asia"
                    value={formData.destination_name}
                    onChange={(e) =>
                      handleChange("destination_name", e.target.value)
                    }
                    className="w-full p-4 text-sm text-gray-600 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent pr-12"
                  />
                  <MapPin
                    size={20}
                    className="absolute right-4 top-4 text-gray-400"
                  />
                </div>
              </div>

              {/* City Input */}
              <div className="pb-4">
                <label className="block font-medium py-2 text-left text-black/90">
                  City
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Manila, Cebu City"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full p-4 text-sm text-gray-600 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent pr-12"
                  />
                  <Building
                    size={20}
                    className="absolute right-4 top-4 text-gray-400"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div className="pb-4 flex-1">
                <label className="block font-medium py-2 text-left text-black/90">
                  Description
                </label>
                <textarea
                  placeholder="Tell visitors about this destination..."
                  value={formData.destination_description}
                  onChange={(e) =>
                    handleChange("destination_description", e.target.value)
                  }
                  className="w-full p-4 text-sm text-gray-800 h-32 rounded-xl border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
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
  );
};

export default Step6Destination;