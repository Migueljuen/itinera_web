import React, { useEffect, useState } from 'react';
import { Search, MapPin, Building, Loader2, CheckCircle } from 'lucide-react';

const Step4Destination = ({ formData, setFormData, onNext, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Sync selectedLocation from formData (if returning to this step)
    useEffect(() => {
        if (formData.latitude && formData.longitude) {
            setSelectedLocation({
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
            });
        }
    }, []);

    // Get user's current location
    useEffect(() => {
        const getCurrentLocation = async () => {
            if (!navigator.geolocation) {
                setErrorMsg('Geolocation is not supported by this browser');
                return;
            }

            setLoading(true);
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    });
                });

                const { latitude, longitude } = position.coords;

                // Only set if formData has no coordinates yet
                if (!formData.latitude || !formData.longitude) {
                    setSelectedLocation({ latitude, longitude });
                    handleChange('latitude', latitude);
                    handleChange('longitude', longitude);

                    // Reverse geocode to get city
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                        );
                        const data = await response.json();

                        if (data.address && !formData.city) {
                            const city = data.address.city ||
                                data.address.town ||
                                data.address.village ||
                                data.address.municipality ||
                                '';
                            if (city) {
                                handleChange('city', city);
                            }
                        }
                    } catch (error) {
                        console.error('Error reverse geocoding:', error);
                    }
                }
            } catch (error) {
                setErrorMsg('Error getting location: ' + error.message);
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
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
            );
            const data = await response.json();
            setSearchResults(data || []);
        } catch (error) {
            console.error('Error searching locations:', error);
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
        handleChange('latitude', latitude);
        handleChange('longitude', longitude);

        // Extract place name and city from the selected location
        let placeName = '';

        if (location.name) {
            placeName = location.name;
        } else if (location.address) {
            placeName = location.address.tourism ||
                location.address.amenity ||
                location.address.leisure ||
                location.address.building ||
                location.address.house_name ||
                location.address.shop ||
                location.address.office ||
                '';
        }

        if (!placeName) {
            const addressParts = location.display_name.split(',');
            const firstPart = addressParts[0].trim();
            if (firstPart && !/^\d/.test(firstPart)) {
                placeName = firstPart;
            }
        }

        if (placeName && !formData.destination_name) {
            handleChange('destination_name', placeName);
        }

        // Extract city
        if (location.address) {
            const city = location.address.city ||
                location.address.town ||
                location.address.village ||
                location.address.municipality ||
                '';

            if (city) {
                handleChange('city', city);
            }
        }

        // Clear search
        setSearchQuery('');
        setSearchResults([]);
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
        <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto">
            <div className="py-6">
                <h2 className="text-xl font-semibold mb-2 text-center">Add Destination</h2>
                <p className="text-sm text-gray-500 mb-6 text-center">
                    Create a new destination for your experience
                </p>

                <div className="flex flex-col gap-6 border-t pt-6 border-gray-200">
                    {/* Location Search Section */}
                    <div className="mb-4">
                        <label className="block font-medium text-base mb-3">Location</label>

                        {/* Search Input */}
                        <div className="relative mb-4">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for a location (e.g., Rizal Park, Manila)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {searching && (
                                    <Loader2 size={20} className="absolute right-3 top-3.5 text-gray-400 animate-spin" />
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {searchResults.map((result, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleLocationSelect(result)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                        >
                                            <div className="flex items-start">
                                                <MapPin size={16} className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {result.display_name.split(',')[0]}
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

                        {/* Location Confirmation */}
                        {selectedLocation && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                                <div className="flex items-center">
                                    <CheckCircle size={16} className="text-green-600 mr-2" />
                                    <span className="text-sm text-green-700">
                                        Location selected: {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Current Location Button */}
                        <button
                            onClick={() => {
                                setLoading(true);
                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        const { latitude, longitude } = position.coords;
                                        setSelectedLocation({ latitude, longitude });
                                        handleChange('latitude', latitude);
                                        handleChange('longitude', longitude);
                                        setLoading(false);
                                    },
                                    (error) => {
                                        setErrorMsg('Error getting current location');
                                        setLoading(false);
                                    }
                                );
                            }}
                            disabled={loading}
                            className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-center hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={20} className="text-blue-600 animate-spin mr-2" />
                            ) : (
                                <MapPin size={20} className="text-blue-600 mr-2" />
                            )}
                            <span className="font-medium text-blue-600">
                                {loading ? 'Getting Current Location...' : 'Use Current Location'}
                            </span>
                        </button>

                        {errorMsg && (
                            <p className="text-red-500 text-sm mt-2">{errorMsg}</p>
                        )}
                    </div>

                    {/* Essential Information */}
                    <div className="mb-4">
                        <h3 className="font-medium mb-3 text-gray-800">Essential Information</h3>

                        <div className="mb-4">
                            <label className="block font-medium text-base mb-2">Destination Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="e.g., Rizal Park, SM Mall of Asia"
                                    value={formData.destination_name}
                                    onChange={(e) => handleChange('destination_name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <MapPin size={20} className="absolute right-4 top-3.5 text-gray-400" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block font-medium text-base mb-2">City</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="e.g., Manila, Cebu City"
                                    value={formData.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <Building size={20} className="absolute right-4 top-3.5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block font-medium mb-3 text-gray-800">Description</label>
                        <textarea
                            placeholder="Tell visitors about this destination..."
                            value={formData.destination_description}
                            onChange={(e) => handleChange('destination_description', e.target.value)}
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button
                            onClick={onBack}
                            className="flex-1 py-4 px-6 rounded-xl border border-gray-300 font-medium text-base text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Previous step
                        </button>

                        <button
                            onClick={isValid() ? onNext : undefined}
                            disabled={!isValid()}
                            className={`flex-1 py-4 px-8 rounded-xl font-medium text-base transition-colors ${isValid()
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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

export default Step4Destination;