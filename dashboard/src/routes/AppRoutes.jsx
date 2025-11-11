import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Layout from "../Layout/Layout";
import Dashboard from "../pages/Dashboard/Dashboard";
import BackendUser from "../pages/RoleManagement/BackendUser";
import RoleManagement from "../pages/RoleManagement/RoleMAnagement.jsx";
import Login from "../pages/Login/Login";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout/>,
        children : [
            {
                path: 'dashboard/',
                element:(
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
        path : '/login',
        element: <Login />
    }
])

export default router;
