import React from "react";
import { Loader2 } from "lucide-react";

const Step04ReviewSubmit = ({
    formData,
    onSubmit,
    onBack,
    isSubmitting = false,
}) => {
    const { creator_role } = formData;

    const renderRoleSummary = () => {
        switch (creator_role) {
            case "guide":
                return (
                    <div className="space-y-2">
                        <p><strong>Role:</strong> Tour Guide</p>
                        <p><strong>Languages:</strong> {formData.languages?.join(", ") || "—"}</p>
                        <p><strong>Areas Covered:</strong> {formData.service_area || "—"}</p>
                        <p><strong>Availability:</strong> {formData.availability?.join(", ") || "—"}</p>
                    </div>
                );

            case "driver":
                return (
                    <div className="space-y-2">
                        <p><strong>Role:</strong> Transport Provider</p>
                        <p><strong>Vehicle:</strong> {formData.vehicle_type || "—"}</p>
                        <p><strong>Passenger Capacity:</strong> {formData.passenger_capacity || "—"}</p>
                        <p><strong>Service Area:</strong> {formData.service_area || "—"}</p>
                        <p>
                            <strong>Full Itinerary:</strong>{" "}
                            {formData.is_multi_day ? "Yes" : "Selected days only"}
                        </p>
                    </div>
                );

            case "creator":
                return (
                    <div className="space-y-2">
                        <p><strong>Role:</strong> Experience Creator</p>
                        <p className="text-sm text-gray-600">
                            You can start creating experiences after submission.
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl p-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    Review & Submit
                </h2>
                <p className="text-sm text-gray-600">
                    Please review your details before submitting your partner account.
                </p>
            </div>

            {/* Personal Info */}
            <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Name:</strong> {formData.full_name || "—"}</p>
                    <p><strong>Email:</strong> {formData.email || "—"}</p>
                    <p><strong>Phone:</strong> {formData.phone || "—"}</p>
                </div>
            </div>

            {/* Role-specific summary */}
            <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">
                    Service Details
                </h3>
                <div className="text-sm text-gray-700">
                    {renderRoleSummary()}
                </div>
            </div>

            {/* Verification */}
            <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">
                    Verification Documents
                </h3>
                <ul className="text-sm text-gray-700 list-disc list-inside">
                    {formData.id_document && <li>Government ID</li>}
                    {formData.license && <li>License</li>}
                    {formData.vehicle_info && <li>Vehicle Documents</li>}
                </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
                <button
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="px-6 py-3 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Back
                </button>

                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3 text-sm rounded-lg bg-black text-white hover:bg-black/90 disabled:opacity-50 flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Application"
                    )}
                </button>
            </div>
        </div>
    );
};

export default Step04ReviewSubmit;
