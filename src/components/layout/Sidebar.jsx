import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import PaletteIcon from "@mui/icons-material/Palette";
import StorageIcon from "@mui/icons-material/Storage";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";

const menu = [
  { text: "Inicio", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Folletos", icon: <DescriptionIcon />, path: "/brochures" },
  { text: "Estilos", icon: <PaletteIcon />, path: "/styles" },
  { text: "Bases de datos", icon: <StorageIcon />, path: "/databases" },
  { text: "Usuarios", icon: <GroupIcon />, path: "/users" },
  { text: "Configuración", icon: <SettingsIcon />, path: "/settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: 240,
        bgcolor: "#111827",
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 3 }}>
        Folletos Admin
      </Typography>

      <List>
        {menu.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&:hover": { bgcolor: "#1f2937" },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
