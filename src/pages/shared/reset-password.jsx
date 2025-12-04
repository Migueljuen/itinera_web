import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import axios from "axios";
import API_URL from "../../constants/api";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");

    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!newPassword) {
            setErrors({ newPassword: "Password is required" });
            return;
        }
        if (newPassword.length < 4) {
            setErrors({ newPassword: "Password must be at least 4 characters" });
            return;
        }
        if (newPassword !== confirm) {
            setErrors({ confirm: "Passwords do not match" });
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await axios.post(`${API_URL}/password-reset/reset`, {
                email,
                newPassword,
            });

            console.log(res.data);

            alert("Password updated successfully!");

            // After reset → go back to login
            navigate("/login");
        } catch (err) {
            console.log(err);
            alert("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Back Button */}
            <ChevronLeftIcon
                className="h-6 cursor-pointer hover:text-black/80 absolute top-10 left-10"
                onClick={() => navigate(-1)}
            />

            <div className="min-h-screen flex items-start mt-24 justify-center p-4">
                <div className="w-full max-w-md p-8 bg-white space-y-18">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-center size-12 rounded-lg border-2 border-gray-200">
                            <LockKeyhole className="text-black/90" size={20} />
                        </div>

                        <p className="text-left font-display font-medium text-3xl text-black/90">
                            Create New Password
                        </p>

                        <p className="text-left font-display text-black/70">
                            Set a strong password for your Itinera account.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleReset} className="space-y-8">
                        {/* New Password Input */}
                        <div>
                            <div
                                className="flex items-center border border-gray-400 rounded-md px-4 py-3 h-10 
                focus-within:ring-1 focus-within:ring-blue-400"
                            >
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    className="flex-1 bg-transparent outline-none placeholder-gray-400"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>

                            {errors.newPassword && (
                                <p className="text-red-500 text-sm ml-1 mt-1">
                                    {errors.newPassword}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <div
                                className="flex items-center border border-gray-400 rounded-md px-4 py-3 h-10 
                focus-within:ring-1 focus-within:ring-blue-400"
                            >
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="flex-1 bg-transparent outline-none placeholder-gray-400"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                />
                            </div>

                            {errors.confirm && (
                                <p className="text-red-500 text-sm ml-1 mt-1">
                                    {errors.confirm}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#274b46] text-white flex justify-center items-center h-10 py-3 rounded-md 
              text-base cursor-pointer hover:bg-[#1d3733] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ResetPassword;