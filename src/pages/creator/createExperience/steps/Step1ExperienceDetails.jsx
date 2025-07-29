import React from 'react';

const units = ['Entry', 'Hour', 'Day', 'Package'];

const Step1ExperienceDetails = ({ formData, setFormData, onNext }) => {
    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const isValid = () => {
        return formData.title && formData.description && formData.price && units.includes(formData.unit);
    };

    return (
        <div className="flex-1 overflow-auto">
            <div className="p-4 max-w-2xl mx-auto">
                <div className="text-center py-2">
                    <h2 className="text-center text-xl font-semibold mb-2">Let's get started</h2>
                    <p className="text-center text-sm text-gray-500 mb-6 w-3/4 mx-auto">
                        Please fill the form below. Feel free to add as much detail as needed.
                    </p>

                    <div className="flex flex-col gap-4 border-t pt-12 border-gray-200">
                        {/* Title Input */}
                        <div className="bg-white pb-4">
                            <label className="block font-medium py-2 text-left">Experience Title</label>
                            <input
                                type="text"
                                placeholder="Sunset in the mountains"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className="w-full p-4 text-base text-gray-600 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Description Input */}
                        <div className="bg-white pb-4">
                            <label className="block font-medium py-2 text-left">Description</label>
                            <textarea
                                placeholder="Description of the experience"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="w-full p-4 text-base text-gray-800 h-32 rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={4}
                            />
                        </div>

                        {/* Price Input */}
                        <div className="bg-white pb-4">
                            <label className="block font-medium py-2 text-left">Price ₱</label>
                            <input
                                type="number"
                                placeholder="Price"
                                value={formData.price}
                                onChange={(e) => handleChange('price', e.target.value)}
                                className="w-full p-4 text-base text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        {/* Units Selection */}
                        <div className="bg-white mt-6">
                            <label className="block text-base font-medium py-2 text-left">Select Unit</label>
                            <div className="flex flex-wrap gap-3 mb-2">
                                {units.map((unit) => (
                                    <button
                                        key={unit}
                                        type="button"
                                        onClick={() => handleChange('unit', unit)}
                                        className={`px-6 py-2 rounded-full transition-colors duration-200 ${formData.unit === unit
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-base font-medium">{unit}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="button"
                            onClick={isValid() ? onNext : undefined}
                            disabled={!isValid()}
                            className={`mt-4 p-4 rounded-xl transition-colors duration-200 ${isValid()
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <span className="text-center font-medium text-base">Next step</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step1ExperienceDetails;