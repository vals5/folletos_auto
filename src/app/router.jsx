import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import FlyerEditor from "../pages/FlyerEditor";
import Flyers from "../pages/Flyers";
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
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/editor/:id", element: <FlyerEditor /> },
          { path: "/flyers", element: <Flyers /> },
          { path: "/styles", element: <Styles /> },
          { path: "/databases", element: <Databases /> },
          { path: "/users", element: <Users /> },
          { path: "/settings", element: <Settings /> },
        ],
      },
    ],
  },
]);
