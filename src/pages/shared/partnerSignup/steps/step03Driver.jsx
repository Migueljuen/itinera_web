const Step03Driver = ({ formData, setFormData, onNext, onBack }) => {
    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            driver_profile: {
                ...formData.driver_profile,
                [field]: value,
            },
        });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold">Transport Service Details</h2>

            {/* Capacity */}
            {/* Service Areas */}
            {/* Trip Types */}
            {/* Availability */}

            <div className="flex justify-between mt-8">
                <button onClick={onBack}>Back</button>
                <button onClick={onNext}>Continue</button>
            </div>
        </div>
    );
};
export default Step03Driver