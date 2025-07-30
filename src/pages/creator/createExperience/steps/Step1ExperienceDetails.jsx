import React from 'react';
import { ArrowRight } from 'lucide-react'; // Make sure this is installed via lucide-react

const units = ['Entry', 'Hour', 'Day', 'Package'];

const Step1ExperienceDetails = ({ formData, setFormData, onNext }) => {
    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const isValid = () => {
        return formData.title && formData.description && formData.price && units.includes(formData.unit);
    };

    return (
        <div className="flex-1 overflow-auto pb-28">
            <div className="p-4 max-w-2xl mx-auto">
                <div className="text-center py-2">
                    <h2 className="text-center text-xl font-semibold mb-2">Let's get started</h2>
                    <p className="text-center text-sm text-gray-500 mb-6 w-3/4 mx-auto">
                        Please fill the form below. Feel free to add as much detail as needed.
                    </p>

                    <div className="flex flex-col gap-4 border-t pt-12 border-gray-200">
                        {/* Title Input */}
                        <div className="pb-4">
                            <label className="block font-medium py-2 text-left">Activity Title</label>
                            <input
                                type="text"
                                placeholder="E.g. Sunset in the mountains"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className="w-full p-4 text-base text-gray-600 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Description Input */}
                        <div className="pb-4">
                            <label className="block font-medium py-2 text-left">Description</label>
                            <textarea
                                placeholder="Short description of the activity"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="w-full p-4 text-base text-gray-800 h-32 rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={4}
                            />
                        </div>

                        {/* Price Input */}
                        <div className="e pb-4">
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
                        <div className=" mt-6">
                            <label className="block text-base font-medium py-2 text-left">Select Unit</label>
                            <div className="flex flex-wrap gap-3 mb-2">
                                {units.map((unit) => (
                                    <button
                                        key={unit}
                                        type="button"
                                        onClick={() => handleChange('unit', unit)}
                                        className={`px-6 py-2 rounded-full transition-colors duration-200 ${formData.unit === unit
                                            ? 'bg-[#376a63] text-white'
                                            : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-base font-medium">{unit}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="fixed bottom-16 right-8 z-20">
                            <button
                                type="button"
                                onClick={isValid() ? onNext : undefined}
                                disabled={!isValid()}
                                className={`flex items-center gap-2 p-6 cursor-pointer rounded-full shadow-lg transition-colors font-medium ${isValid()
                                    ? 'bg-[#376a63] text-white hover:bg-[#2e5954]'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <ArrowRight />
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step1ExperienceDetails;