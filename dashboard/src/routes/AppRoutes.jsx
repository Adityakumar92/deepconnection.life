import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Layout from "../Layout/Layout";
import Dashboard from "../pages/Dashboard/Dashboard";
import BackendUser from "../pages/RoleManagement/BackendUser";
import RoleManagement from "../pages/RoleManagement/RoleMAnagement.jsx";
import Login from "../pages/Login/Login";

const router = createBrowserRouter([
    // ✅ Root route decides where to go
    {
        path: "/",
        element: <RootRedirect />,
    },
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: 'dashboard/',
                element: (
                    <ProtectedRoute moduleKey="dashboard">
                        <Dashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: 'blogs/',
                element: <Dashboard />
            },
            {
                path: 'bookings/',
                element: <Dashboard />
            },
            {
                path: 'programs/',
                element: <Dashboard />
            },
            {
                path: 'services/',
                element: <Dashboard />
            },
            {
                path: 'contacts/',
                element: <Dashboard />
            },
            {
                path: 'child-issues/',
                element: <Dashboard />
            },
            {
                path: 'suggestions/',
                element: <Dashboard />
            },
            {
                path: 'roles/',
                element: <RoleManagement />
            },
            {
                path: 'backendUsers/',
                element: <BackendUser />
            },
        ]
    },
    {
        path: '/login',
        element: <Login />
    }
])

// ✅ Root redirector component
function RootRedirect() {
    const authData = localStorage.getItem("authData");
    const token = authData ? JSON.parse(authData).token : null;

    // if logged in, go to dashboard else login
    return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

export default router;
