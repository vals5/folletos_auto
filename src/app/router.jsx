import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import { supabase } from "../services/supabase";
import DashboardLayout from "../components/layout/DashboardLayout";

function ProtectedRoute({ children }) {
  const session = supabase.auth.getSession();

  if (!session) return <Navigate to="/" />;

  return children;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/brochures",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <BrochuresPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
]);
