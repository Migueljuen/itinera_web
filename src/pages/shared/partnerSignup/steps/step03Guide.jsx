const Step03Guide = ({ formData, setFormData, onNext, onBack }) => {
    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            guide_profile: {
                ...formData.guide_profile,
                [field]: value,
            },
        });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold">Tour Guide Details</h2>

            {/* Languages */}
            {/* Group Size */}
            {/* Areas */}
            {/* Availability */}

            <div className="flex justify-between mt-8">
                <button onClick={onBack}>Back</button>
                <button onClick={onNext}>Continue</button>
            </div>
        </div>
    );
};

export default Step03Guide