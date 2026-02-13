import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import { supabase } from "../services/supabase";
import DashboardLayout from "../components/layout/DashboardLayout";

async function ProtectedRoute({ children }) {
  const { data } = await supabase.auth.getSession();

  if (!session) return <Navigate to="/" />;

  return children;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <Dashboard /> }],
  },
  {
    path: "/editor/:id",
    element: <FlyerEditor />,
  },
]);
