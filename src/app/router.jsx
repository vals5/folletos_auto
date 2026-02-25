import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import FlyerEditor from "../pages/FlyerEditor";
import Styles from "../pages/Styles";
import Databases from "../pages/Databases";
import Users from "../pages/Users";
import Settings from "../pages/Settings";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../routes/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      // Editor sin DashboardLayout (pantalla completa)
      { path: "/editor/:id", element: <FlyerEditor /> },
      // Resto con DashboardLayout
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/flyers", element: <FlyerEditor /> },
          { path: "/styles", element: <Styles /> },
          { path: "/databases", element: <Databases /> },
          { path: "/users", element: <Users /> },
          { path: "/settings", element: <Settings /> },
        ],
      },
    ],
  },
]);
