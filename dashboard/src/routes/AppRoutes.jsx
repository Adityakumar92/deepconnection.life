import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Layout from "../Layout/Layout";
import RoleMAnagement from "../pages/RoleManagement/RoleMAnagement";
import BackendUser from "../pages/RoleManagement/BackendUser";


const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children : [
            {
                path: 'dashboard/',
                element: <Dashboard />
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
                element: <RoleMAnagement />
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