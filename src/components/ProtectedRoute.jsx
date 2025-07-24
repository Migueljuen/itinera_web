// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading, isAuthenticated } = useAuth();

    // Show loading state while checking auth
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

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check role-based access if roles are specified
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Redirect based on user role
        if (user?.role === 'Traveler') {
            return <Navigate to="/traveler/dashboard" replace />;
        } else if (user?.role === 'Creator') {
            return <Navigate to="/owner/dashboard" replace />;
        }
        // Default redirect if role doesn't match
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
