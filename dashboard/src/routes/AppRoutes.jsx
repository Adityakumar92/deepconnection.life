import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Layout from "../Layout/Layout";


const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children : [
            {
                path: 'dashboard/',
                element: <Dashboard />
            }
        ]
    },
    {
        path : '/login',
        element: <Login />
    }
])

export default router;