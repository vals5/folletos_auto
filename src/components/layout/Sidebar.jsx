import { useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import PaletteIcon from "@mui/icons-material/Palette";
import StorageIcon from "@mui/icons-material/Storage";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useLocation } from "react-router-dom";

const menu = [
  { text: "Inicio", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Folletos", icon: <DescriptionIcon />, path: "/brochures" },
  { text: "Estilos", icon: <PaletteIcon />, path: "/styles" },
  { text: "Bases de datos", icon: <StorageIcon />, path: "/databases" },
  { text: "Usuarios", icon: <GroupIcon />, path: "/users" },
  { text: "Configuración", icon: <SettingsIcon />, path: "/settings" },
];

function SidebarContent({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        width: 240,
        bgcolor: "#111827",
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        p: 2,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6" fontWeight={700}>
          Folletos Admin
        </Typography>
        {onClose && (
          <IconButton onClick={onClose} sx={{ color: "white" }} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <List disablePadding>
        {menu.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              onClick={() => {
                navigate(item.path);
                onClose?.();
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: active ? "#1f2937" : "transparent",
                borderLeft: active
                  ? "3px solid #f59e0b"
                  : "3px solid transparent",
                "&:hover": { bgcolor: "#1f2937" },
              }}
            >
              <ListItemIcon
                sx={{ color: active ? "#f59e0b" : "white", minWidth: 36 }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontSize: 14 }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export default function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <Box
          sx={{
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: 1300,
          }}
        >
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              bgcolor: "#111827",
              color: "white",
              "&:hover": { bgcolor: "#1f2937" },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
          <SidebarContent onClose={() => setOpen(false)} />
        </Drawer>
      </>
    );
  }

  return <SidebarContent />;
}
