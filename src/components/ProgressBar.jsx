import React from 'react';

const ProgressBar = ({ currentStep, totalSteps, labels = [] }) => {
    const progressPercentage = (currentStep / totalSteps) * 100;

    return (
        <div className="px-6 my-4">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                    className="bg-[#376a63] h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* Step Labels - Optional */}
            {labels.length > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                    {labels.map((label, index) => {
                        const stepNumber = index + 1;
                        const isCompleted = stepNumber < currentStep;
                        const isCurrent = stepNumber === currentStep;

                        return (
                            <span
                                key={index}
                                className={`
                                    transition-colors duration-200
                                    ${isCompleted ? 'text-[#376a63] font-medium' : ''}
                                    ${isCurrent ? 'text-[#376a63] font-semibold' : ''}
                                    ${!isCompleted && !isCurrent ? 'text-gray-400' : ''}
                                `}
                            >
                                {label}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProgressBar;