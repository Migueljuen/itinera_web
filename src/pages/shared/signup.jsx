import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Circle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import logoImage from "../../assets/images/logo.png";
import googleIcon from "../../assets/images/google.png";
import toast, { Toaster } from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Creator",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const { confirmPassword, ...userData } = formData;
      const result = await register(userData);

      if (result.success) {
        toast.success("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(result.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordMeetsLength = formData.password.length >= 6;
  const passwordsMatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

      <div className="min-h-screen grid place-items-center p-4">
        <div className="w-full max-w-2xl p-8 bg-white rounded-lg border border-gray-300 space-y-6">
          <p className="text-center text-2xl">Become a host</p>

          {/* Form Container */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4 px-6">
              {/* First Name */}
              <div>
                <div className="focus-within:ring-1 focus-within:ring-blue-400 flex items-center border border-gray-400  focus-within:border-2 rounded-md px-4 py-3 h-10">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="flex-1  bg-transparent outline-none placeholder-gray-400"
                    value={formData.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                  />
                </div>
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.first_name}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <div className="focus-within:ring-1 focus-within:ring-blue-400 flex items-center border border-gray-400 focus-within:border-2 rounded-md px-4 py-3 h-10">
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="flex-1  bg-transparent outline-none placeholder-gray-400"
                    value={formData.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                  />
                </div>
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div className="px-6">
              <div className="focus-within:ring-1 focus-within:ring-blue-400 flex items-center border border-gray-400 focus-within:border-2 rounded-md px-4 py-3 h-10">
                <Mail className="text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 ml-3  bg-transparent outline-none placeholder-gray-400"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  autoCapitalize="none"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm ml-1 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="px-6">
              <div className="focus-within:ring-1 focus-within:ring-blue-400 flex items-center border border-gray-400 focus-within:border-2 rounded-md px-4 py-3 h-10">
                <Lock className="text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="flex-1 ml-3 text-sm bg-transparent outline-none placeholder-gray-400"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 focus:outline-none"
                >
                  {showPassword ? (
                    <Eye className="text-gray-400" size={20} />
                  ) : (
                    <EyeOff className="text-gray-400" size={20} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm ml-1 mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="px-6">
              <div className="focus-within:ring-1 focus-within:ring-blue-400 flex items-center border border-gray-400 focus-within:border-2 rounded-md px-4 py-3 h-10">
                <Lock className="text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="flex-1 ml-3 text-sm bg-transparent outline-none placeholder-gray-400"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="ml-2 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <Eye className="text-gray-400" size={20} />
                  ) : (
                    <EyeOff className="text-gray-400" size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm ml-1 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="mx-6 bg-gray-50 rounded-md p-3">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Password Requirements:
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {passwordMeetsLength ? (
                    <CheckCircle className="text-green-600" size={14} />
                  ) : (
                    <Circle className="text-gray-400" size={14} />
                  )}
                  <span
                    className={`text-xs ${
                      passwordMeetsLength ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    At least 6 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordsMatch ? (
                    <CheckCircle className="text-green-600" size={14} />
                  ) : (
                    <Circle className="text-gray-400" size={14} />
                  )}
                  <span
                    className={`text-xs ${
                      passwordsMatch ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    Passwords match
                  </span>
                </div>
              </div>
            </div>

            {/* Sign Up Button */}
            <div className="px-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#274b46] text-white flex justify-center items-center h-10 py-3 rounded-md text-base cursor-pointer hover:bg-[#1d3733] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>

            {/* Or Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">Or</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <div className="px-6">
              <button
                type="button"
                className="w-full border  flex justify-center items-center border-gray-200 py-4 h-10 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-center">
                  <img src={googleIcon} alt="Google" className="w-5 h-5" />
                  <span className="ml-2 text-base">Continue with Google</span>
                </div>
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-400 font-medium hover:text-blue-500 transition-colors"
                >
                  Log In
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
