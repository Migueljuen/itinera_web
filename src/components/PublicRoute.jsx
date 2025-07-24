
// components/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = ({ children }) => {
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

    // If authenticated, redirect based on role
    if (isAuthenticated && user) {
        if (user.role === 'Creator') {
            return <Navigate to="/owner/dashboard" replace />;
        } else if (user.role === 'Traveler') {
            return <Navigate to="/traveler/dashboard" replace />;
        }
        // Default redirect for authenticated users
        return <Navigate to="/dashboard" replace />;
    }

    // Not authenticated - show the public page
    return children;
};

export default PublicRoute;