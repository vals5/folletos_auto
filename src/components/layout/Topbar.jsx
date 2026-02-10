import { Box, Button, Typography } from "@mui/material";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signout();
    navigate("/");
  };

  return (
    <Box
      sx={{
        height: 60,
        bgcolor: "white",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
      }}
    >
      <Typography fontWeight={600}>Panel de administración</Typography>

      <Button variant="outlined" size="small" onClick={logout}>
        Cerrar sesión
      </Button>
    </Box>
  );
}
