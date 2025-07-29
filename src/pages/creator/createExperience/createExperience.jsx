import React, { useState } from 'react';
import ProgressBar from '../../../components/ProgressBar';

// Step components (web versions)
import Step1ExperienceDetails from './steps/Step1ExperienceDetails';
import Step2Availability from './steps/Step2Availability';
import Step3Tags from './steps/Step3Tags';
import Step4Destination from './steps/Step4Destination';
import Step5Images from './steps/Step5Images';
import ReviewSubmit from './steps/Step6Submit';

const ExperienceCreationForm = () => {
    const [step, setStep] = useState(1);
    const stepCount = 6;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        unit: '',
        availability: [],
        tags: [],
        travel_companion: '',
        travel_companions: [],
        useExistingDestination: false,
        destination_id: null,
        destination_name: '',
        city: '',
        destination_description: '',
        latitude: '',
        longitude: '',
        images: [],
    });

    const validateFormData = () => {
        const requiredUnits = ['Entry', 'Hour', 'Day', 'Package'];
        const hasCompanions = formData.travel_companions && formData.travel_companions.length > 0;

        if (
            !formData.title ||
            !formData.description ||
            !formData.price ||
            isNaN(Number(formData.price)) ||
            !requiredUnits.includes(formData.unit) ||
            !Array.isArray(formData.tags) ||
            formData.tags.length === 0 ||
            !Array.isArray(formData.availability) ||
            formData.availability.length === 0 ||
            !hasCompanions
        ) {
            console.log('Basic form data validation failed');
            return false;
        }

        for (const day of formData.availability) {
            if (!day.day_of_week) {
                console.log('Missing day_of_week:', day);
                return false;
            }
            if (!Array.isArray(day.time_slots)) {
                console.log('Missing or invalid time_slots:', day);
                return false;
            }
            if (day.time_slots.length === 0) {
                console.log('Empty time_slots array:', day);
                return false;
            }

            for (const slot of day.time_slots) {
                if (!slot.start_time || !slot.end_time) {
                    console.log('Missing start or end time in slot:', slot, 'Day:', day.day_of_week);
                    return false;
                }

                const startTime = new Date(`2000-01-01T${slot.start_time}`);
                const endTime = new Date(`2000-01-01T${slot.end_time}`);
                if (endTime <= startTime) {
                    window.alert(`End time must be after start time for ${day.day_of_week}`);
                    return false;
                }
            }
        }

        if (!formData.useExistingDestination) {
            if (
                !formData.destination_name ||
                !formData.city ||
                !formData.destination_description ||
                !formData.latitude ||
                !formData.longitude
            ) {
                console.log('Missing destination info');
                return false;
            }
        } else if (!formData.destination_id) {
            console.log('Missing destination_id');
            return false;
        }

        return true;
    };

    const handleSubmit = async (status = 'draft') => {
        console.log('Submitting formData:', formData);

        if (!validateFormData()) {
            window.alert('Please fill out all required fields.');
            return;
        }

        try {
            setIsSubmitting(true);

            const formDataObj = new FormData();

            formDataObj.append('creator_id', '12');
            formDataObj.append('title', formData.title);
            formDataObj.append('description', formData.description);
            formDataObj.append('price', Number(formData.price).toString());
            formDataObj.append('unit', formData.unit);
            formDataObj.append('status', status);
            formDataObj.append('tags', JSON.stringify(formData.tags));
            formDataObj.append('travel_companions', JSON.stringify(formData.travel_companions || []));

            const transformedAvailability = formData.availability.map((day) => ({
                availability_id: day.availability_id,
                experience_id: day.experience_id,
                day_of_week: day.day_of_week,
                time_slots: day.time_slots.map((slot) => ({
                    slot_id: slot.slot_id,
                    availability_id: slot.availability_id,
                    start_time: slot.start_time.length === 5 ? slot.start_time + ':00' : slot.start_time,
                    end_time: slot.end_time.length === 5 ? slot.end_time + ':00' : slot.end_time,
                })),
            }));
            formDataObj.append('availability', JSON.stringify(transformedAvailability));

            if (formData.useExistingDestination && formData.destination_id) {
                formDataObj.append('destination_id', formData.destination_id.toString());
            } else {
                formDataObj.append('destination_name', formData.destination_name);
                formDataObj.append('city', formData.city);
                formDataObj.append('destination_description', formData.destination_description);
                formDataObj.append('latitude', formData.latitude);
                formDataObj.append('longitude', formData.longitude);
            }

            if (formData.images && formData.images.length > 0) {
                formData.images.forEach((img, index) => {
                    if (img instanceof File) {
                        formDataObj.append('images', img);
                    } else if (typeof img === 'object' && img.file instanceof File) {
                        formDataObj.append('images', img.file);
                    }
                });
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const response = await fetch(`${API_URL}/experience/create`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formDataObj,
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to create experience');
            }

            const successMessage =
                status === 'active'
                    ? 'Experience published successfully!'
                    : 'Experience saved as draft successfully!';

            window.alert(successMessage);
            // Add navigation or reset logic here

        } catch (err) {
            console.error('Submit error:', err);
            window.alert(err instanceof Error ? err.message : 'Failed to submit experience');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => setStep((prev) => Math.min(prev + 1, stepCount));
    const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

    const renderStep = () => {
        switch (step) {
            case 1:
                return <Step1ExperienceDetails formData={formData} setFormData={setFormData} onNext={handleNext} />;
            case 2:
                return <Step2Availability formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
            case 3:
                return <Step3Tags formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
            case 4:
                return <Step4Destination formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
            case 5:
                return <Step5Images formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
            case 6:
                return (
                    <ReviewSubmit
                        formData={formData}
                        onBack={handleBack}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                );
            default:
                return null;
        }
    };

    const stepLabels = ['Details', 'Availability', 'Tags', 'Destination', 'Images', 'Review'];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <ProgressBar currentStep={step} totalSteps={stepCount} labels={stepLabels} />
                <div className="flex-1 px-6 py-4">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default ExperienceCreationForm;
