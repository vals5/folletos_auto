import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { authService } from "../services/authService";

export default function ProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    authService.getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
    return authService.onChange(setSession);
  }, []);

  if (loading) {
    return (
      <Box display="flex" height="100vh" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />;
}
