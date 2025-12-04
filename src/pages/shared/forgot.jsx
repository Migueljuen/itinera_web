import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import axios from "axios"; // ← you forgot this import
import API_URL from "../../constants/api";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSendOtp = async (e) => {
    e.preventDefault(); // ← prevents page reload on form submit
    setErrors({});

    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }

    setIsSubmitting(true);
    console.log("Sending OTP to:", email);

    try {
      const res = await axios.post(`${API_URL}/password-reset/request`, {
        email,
      });

      console.log(res.data);

      // Navigate to OTP screen with email param
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);

    } catch (err) {
      console.log(err);

      if (err?.response?.status === 404) {
        setErrors({ email: "Email not found" });
      } else {
        alert("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ChevronLeftIcon
        className="h-6 cursor-pointer hover:text-black/80 absolute top-10 left-10"
        onClick={() => navigate("/login")}
      />

      <div className="min-h-screen flex items-start mt-24 justify-center p-4">
        <div className="w-full max-w-md p-8 bg-white space-y-18">
          <div className="space-y-4">
            <div className="flex items-center justify-center  size-12 rounded-lg border-2 border-gray-200">
              <LockKeyhole className="text-black/90" size={20} />
            </div>
            <p className="text-left font-display font-medium text-3xl text-black/90">Reset Your Password</p>
            <p className="text-left font-display text-black/70">
              Enter the email associated with your account and we'll send an OTP to reset your password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSendOtp} className="space-y-8">
            {/* Email Input */}
            <div>
              <div
                className="flex items-center border border-gray-400 rounded-md px-4 py-3 h-10 
                focus-within:ring-1 focus-within:ring-blue-400"
              >
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 bg-transparent outline-none placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-sm ml-1 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#274b46] text-white  flex justify-center items-center h-10 py-3 rounded-md text-base cursor-pointer hover:bg-[#1d3733] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
