import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        height: 60,
        minHeight: 60,
        bgcolor: "white",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 7, md: 3 },
        flexShrink: 0,
      }}
    >
      <Typography
        fontWeight={600}
        color="#1a1a2e"
        fontSize={{ xs: 14, md: 16 }}
      >
        Panel de administración
      </Typography>
      <Button variant="outlined" size="small" onClick={logout}>
        {isMobile ? "Salir" : "Cerrar sesión"}
      </Button>
    </Box>
  );
}
