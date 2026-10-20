import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
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
      // Editor sin DashboardLayout (pantalla completa)
      {
        path: "/editor/:id",
        // El editor (y export/PDF) pesa bastante: se descarga solo al abrir un folleto.
        lazy: async () => ({ Component: (await import("../pages/FlyerEditor")).default }),
      },
      // Resto con DashboardLayout
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
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
