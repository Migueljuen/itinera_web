import React from 'react';

const ProgressBar = ({ currentStep, totalSteps, labels = [] }) => {
    return (
        <div className="px-6 my-4">
            <div className="flex items-center">
                {Array.from({ length: totalSteps }, (_, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <React.Fragment key={stepNumber}>
                            {/* Step Circle */}
                            <div className="flex items-center">
                                <div
                                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isCompleted
                                            ? 'bg-green-500 text-white'
                                            : isCurrent
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                        }
                  `}
                                >
                                    {isCompleted ? '✓' : stepNumber}
                                </div>

                                {/* Step Label */}
                                {labels[index] && (
                                    <span className="ml-2 text-sm text-gray-600 hidden sm:block">
                                        {labels[index]}
                                    </span>
                                )}
                            </div>

                            {/* Separator Line */}
                            {stepNumber < totalSteps && (
                                <div
                                    className={`
                    flex-1 h-1 mx-4
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressBar;
