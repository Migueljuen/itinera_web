import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import googleIcon from "../../assets/images/google.png";
import toast, { Toaster } from "react-hot-toast";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
function Login() {
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      console.log("Login result:", result);

      if (result.success) {
        const userRole = result.user.role;

        // Route based on user role
        if (userRole === "Creator") {
          // Use the wasFirstLogin flag from backend
          if (result.wasFirstLogin) {
            toast.success("Welcome! Let's set up your first activity 🎉");
            navigate("/creator/create", { replace: true });
          } else {
            toast.success("Login successful!");
            navigate("/creator", { replace: true });
          }
        } else if (userRole === "Admin") {
          toast.success("Welcome back, Admin!");
          navigate("/admin", { replace: true });
        } else {
          // Handle any other roles or invalid roles
          toast.error("Access denied! Invalid user role.");
        }
      } else {
        toast.error(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>

      <ChevronLeftIcon
        className="h-6 cursor-pointer hover:text-black/80 absolute top-10 left-10"
        onClick={() => navigate("/")}
      />
      <div className="min-h-screen grid place-items-center p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-lg  border-gray-300 space-y-6 ">
          <p className="text-center text-2xl  ">Login to Itinera</p>
          {/* Form Container */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="px-6">
              <div
                className="flex items-center border border-gray-400 rounded-md px-4 py-3 h-10 
                  focus-within:ring-1 focus-within:ring-blue-400"
              >
                <Mail className="text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 ml-3 bg-transparent outline-none placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoCapitalize="none"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm ml-1 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="px-6">
              <div
                className="flex items-center border border-gray-400  rounded-md px-4 py-3 h-10 focus-within:ring-1 focus-within:ring-blue-400
"
              >
                <Lock className="text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="flex-1 ml-3  bg-transparent outline-none placeholder-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Forgot Password */}
            <div className="flex px-6 justify-end">
              <button
                type="button"
                className="text-blue-400 text-sm font-medium hover:text-blue-500 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <div className="px-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#274b46] text-white flex justify-center items-center h-10 py-3 rounded-md  text-base cursor-pointer hover:bg-[#1d3733] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                ) : (
                  "Log in"
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

            {/* Google Sign In */}
            <div className="px-6">
              <button
                type="button"
                className="w-full  border border-gray-500 flex justify-center items-center  py-4 h-10 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-center">
                  <img src={googleIcon} alt="Google" className="w-5 h-5" />
                  <span className="ml-2 text-base ">Continue with Google</span>
                </div>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-blue-400 font-medium hover:text-blue-500 transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
