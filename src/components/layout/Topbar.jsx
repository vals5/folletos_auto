import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { layout } from "../../theme/tokens";

export default function Topbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const logout = async () => {
    await authService.signOut();
    localStorage.removeItem("login_timestamp");
    navigate("/login");
  };

  return (
    <Box
      component="header"
      sx={{
        height: layout.toolbarHeight,
        minHeight: layout.toolbarHeight,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 8, md: 4 },
        flexShrink: 0,
      }}
    >
      <Typography fontWeight={600} color="text.secondary" fontSize={14}>
        Panel de administración
      </Typography>
      <Button size="small" color="inherit" onClick={logout} startIcon={<LogoutIcon fontSize="small" />}>
        {isMobile ? "Salir" : "Cerrar sesión"}
      </Button>
    </Box>
  );
}
