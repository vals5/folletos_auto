import { useState } from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Drawer, Chip, useMediaQuery, useTheme } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useLocation } from "react-router-dom";
import { layout, rail } from "../../theme/tokens";

const menu = [
  { text: "Folletos", icon: <DescriptionOutlinedIcon />, path: "/dashboard" },
  { text: "Base de datos", icon: <StorageOutlinedIcon />, path: "/databases" },
  { text: "Usuarios", icon: <GroupOutlinedIcon />, path: "/users", soon: true },
];

function SidebarContent({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      component="nav"
      aria-label="Navegación principal"
      sx={{ width: layout.navWidth, bgcolor: "rail.bg", color: rail.text, display: "flex", flexDirection: "column", height: "100%", p: 2 }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" px={1} mb={3} mt={0.5}>
        <Typography variant="h6" fontWeight={700} letterSpacing="-0.01em">
          Brokers Ads
        </Typography>
        {onClose && (
          <IconButton onClick={onClose} sx={{ color: rail.text }} size="small" aria-label="Cerrar menú">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {menu.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              selected={active}
              onClick={() => {
                navigate(item.path);
                onClose?.();
              }}
              sx={{
                color: rail.text,
                borderLeft: "3px solid transparent",
                "&:hover": { bgcolor: rail.hover },
                "&.Mui-selected, &.Mui-selected:hover": { bgcolor: rail.active, borderLeftColor: "accent.main" },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 38 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500 }} />
              {item.soon && (
                <Chip label="Pronto" size="small" sx={{ height: 20, bgcolor: rail.hover, color: rail.textMuted, "& .MuiChip-label": { fontSize: 11 } }} />
              )}
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
        <Box sx={{ position: "fixed", top: 8, left: 8, zIndex: 1300 }}>
          <IconButton
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            sx={{ bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.dark" } }}
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
