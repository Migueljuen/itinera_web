import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_URL from "../../constants/api";

function VerifyOtp() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError("");

        if (!otp) {
            setError("OTP is required");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await axios.post(`${API_URL}/password-reset/verify`, {
                email,
                otp,
            });

            console.log(res.data);

            // Go to reset password screen
            navigate(`/reset-password?email=${encodeURIComponent(email)}`);

        } catch (err) {
            console.log(err);
            if (err?.response?.status === 400) {
                setError("Invalid or expired OTP");
            } else {
                alert("Something went wrong");
            }
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


                        <p className="text-left font-display font-medium text-3xl text-black/90">Verify OTP</p>

                        <p className="text-left text-black/70">
                            Enter the 6-digit code we sent to {email}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleVerify} className="space-y-8">
                        <div>
                            <div
                                className="flex items-center border border-gray-400 rounded-md px-4 py-3 h-10 
                focus-within:ring-1 focus-within:ring-blue-400"
                            >
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="Enter OTP"
                                    className="flex-1 bg-transparent outline-none placeholder-gray-400"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm ml-1 mt-1">{error}</p>
                            )}
                        </div>

                        {/* Button */}
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
                                "Verify"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default VerifyOtp;
