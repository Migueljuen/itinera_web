// contexts/AuthContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import API_URL from "../constants/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Storage helpers for web
const storage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },
};

const isTokenExpired = (token) => {
  if (!token || typeof token !== "string") {
    return true;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return true;
  }

  try {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    return isExpired;
  } catch (e) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Logout function
  const logout = useCallback(async () => {
    try {
      setToken(null);
      setUser(null);
      // Reset animation state on logout
      // setShouldAnimateDashboard(false);
      storage.removeItem("token");
      storage.removeItem("user");
      // Clear the session storage flag so next login will animate
      // sessionStorage.removeItem("dashboardAnimated");
      delete axios.defaults.headers.common["Authorization"];
      return { success: true };
    } catch (error) {
      console.error("Logout error", error);
      return { success: false };
    }
  }, []);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        console.log("Loading stored auth...");
        const storedToken = storage.getItem("token");
        const storedUser = storage.getItem("user");

        if (storedToken && storedUser && !isTokenExpired(storedToken)) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;
          console.log("Auth loaded successfully");

          // Don't animate if user is already logged in (page refresh)
          // Only animate on fresh login
        } else {
          console.log("No valid auth found");
        }
      } catch (error) {
        console.error("Error loading auth data", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        email,
        password,
      });
      const { token, user, wasFirstLogin } = response.data;

      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));
      setToken(token);
      setUser(user);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // NEW: Set animation flag for successful login
      // setShouldAnimateDashboard(true);

      return { success: true, user, wasFirstLogin };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error?.response?.data?.error || "Login failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // NEW: Function to disable dashboard animation after it runs
  // const disableDashboardAnimation = useCallback(() => {
  //   setShouldAnimateDashboard(false);
  //   sessionStorage.setItem("dashboardAnimated", "true");
  // }, []);

  // Update user state + localStorage
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    storage.setItem("user", JSON.stringify(updatedUser));
  };

  // Register function
  const register = async (userData) => {
    setError("");
    try {
      const response = await axios.post(`${API_URL}/users/register`, userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const isAuthenticated = !!token && !!user && !isTokenExpired(token);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    updateUser,
    // NEW: Animation control
    // shouldAnimateDashboard,
    // disableDashboardAnimation,
  };

  // Don't render children until we've checked auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
