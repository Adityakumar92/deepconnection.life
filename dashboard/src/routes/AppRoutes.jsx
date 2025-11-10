import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";


const router = createBrowserRouter([
    {
        path: '/dashboard',
        element: <Dashboard />
    },
    {
        path : '/login',
        element: <Login />
    }
])

export default router;