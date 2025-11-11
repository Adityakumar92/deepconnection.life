import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, moduleKey }) {
  const { token, roleAndPermission, isAuthChecked } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  // Wait until Redux loads auth data once
  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Checking authentication...
      </div>
    );
  }

  // No token → go to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check if moduleKey provided
  if (moduleKey && roleAndPermission?.[moduleKey] === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold text-red-600 mb-2">403</h1>
        <p className="text-lg">Access Denied</p>
      </div>
    );
  }

  return children;
}
