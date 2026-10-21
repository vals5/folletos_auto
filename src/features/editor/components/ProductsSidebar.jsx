import { useState } from "react";
import {
  Box, Typography, TextField, InputAdornment, List, ListItem, ListItemText, ListItemButton,
  IconButton, Chip, Tooltip, Tabs, Tab, CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useProductos } from "../../../hooks/useProductos";
import { layout, rail } from "../../../theme/tokens";

const ROW_SX = { borderBottom: `1px solid ${rail.border}` };
const ICON_BTN_SX = { color: rail.textMuted, "&:hover": { color: "#fff", bgcolor: rail.hover } };

export default function ProductsSidebar({ modulos = [], selectedModulo, onSelectModulo, onAddProducto, onDeleteModulo }) {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const { data: productos = [], isLoading: loadingProductos } = useProductos();

  const productosFiltrados = productos.filter((p) => {
    const q = search.toLowerCase().trim();
    return !q || p.nombre?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
  });

  const conteoEnFlyer = modulos.reduce((acc, m) => {
    if (m?.producto_id) acc[m.producto_id] = (acc[m.producto_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <Box
      component="aside"
      sx={{
        width: collapsed ? 0 : layout.productsRailWidth,
        transition: "width 0.25s ease-in-out",
        position: "relative",
        bgcolor: "rail.bg",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      <Tooltip title={collapsed ? "Mostrar panel" : "Ocultar panel"} placement="right">
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          size="small"
          aria-label={collapsed ? "Mostrar panel de productos" : "Ocultar panel de productos"}
          sx={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            right: collapsed ? -28 : -14,
            zIndex: 30,
            bgcolor: "rail.bg",
            color: "#fff",
            border: `1px solid ${rail.border}`,
            boxShadow: 2,
            width: 28,
            height: 28,
            borderRadius: "50%",
            transition: "right 0.25s ease-in-out, background-color 0.2s",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      {!collapsed && (
        <Box display="flex" flexDirection="column" height="100%" width={layout.productsRailWidth} overflow="hidden">
          <Box px={2} pt={2} pb={0.5}>
            <Typography fontWeight={700} fontSize={16} color="#fff" mb={1}>
              Productos
            </Typography>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              sx={{
                minHeight: 36,
                "& .MuiTab-root": { color: rail.textMuted, minHeight: 36, py: 0.5, fontSize: 13 },
                "& .MuiTab-root.Mui-selected": { color: "#fff" },
                "& .MuiTabs-indicator": { bgcolor: "accent.main", height: 3, borderRadius: "3px 3px 0 0" },
              }}
            >
              <Tab label={`En folleto (${modulos.length})`} />
              <Tab label="Catálogo" />
            </Tabs>
          </Box>

          <Box flex={1} overflow="auto" bgcolor={rail.well} display="flex" flexDirection="column">
            {tab === 1 && (
              <Box p={1.5}>
                <TextField
                  placeholder="Buscar por nombre o SKU…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "neutral.400", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    sx: { fontSize: 13, "& fieldset": { border: "none" } },
                  }}
                  inputProps={{ "aria-label": "Buscar productos" }}
                />
              </Box>
            )}

            {tab === 0 ? (
              modulos.length === 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} color={rail.textFaint} px={3} textAlign="center" gap={1}>
                  <Inventory2OutlinedIcon sx={{ fontSize: 32 }} />
                  <Typography fontSize={13}>Todavía no agregaste productos. Elegilos desde la pestaña “Catálogo”.</Typography>
                </Box>
              ) : (
                <List dense disablePadding>
                  {modulos.map((modulo) => {
                    const esSeleccionado = selectedModulo?.id === modulo.id;
                    const nombre = modulo.nombre_override ?? modulo.productos?.nombre ?? "Sin nombre";
                    return (
                      <ListItem
                        key={modulo.id}
                        disablePadding
                        secondaryAction={
                          <Tooltip title="Quitar del folleto" placement="left">
                            <IconButton size="small" onClick={() => onDeleteModulo(modulo.id)} aria-label={`Quitar ${nombre}`} sx={ICON_BTN_SX}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        }
                        sx={{
                          ...ROW_SX,
                          bgcolor: esSeleccionado ? rail.active : "transparent",
                          borderLeft: "3px solid",
                          borderLeftColor: esSeleccionado ? "accent.main" : "transparent",
                        }}
                      >
                        <ListItemButton
                          selected={esSeleccionado}
                          onClick={() => onSelectModulo(modulo)}
                          sx={{ pr: 6, py: 1, borderRadius: 0, "&:hover": { bgcolor: rail.hover }, "&.Mui-selected, &.Mui-selected:hover": { bgcolor: "transparent" } }}
                        >
                          <ListItemText
                            primary={
                              <Typography fontSize={13} fontWeight={esSeleccionado ? 700 : 500} color="#fff" noWrap>
                                {nombre}
                              </Typography>
                            }
                            secondary={
                              <Typography fontSize={12} color={rail.textMuted} noWrap>
                                {modulo.descripcion_override ?? modulo.productos?.descripcion ?? "Sin descripción"}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )
            ) : loadingProductos ? (
              <Box display="flex" justifyContent="center" pt={4}>
                <CircularProgress size={22} sx={{ color: "#fff" }} />
              </Box>
            ) : productosFiltrados.length === 0 ? (
              <Box display="flex" justifyContent="center" pt={4} px={2}>
                <Typography fontSize={13} color={rail.textFaint}>
                  No se encontraron productos
                </Typography>
              </Box>
            ) : (
              <List dense disablePadding>
                {productosFiltrados.map((producto) => {
                  const cantidad = conteoEnFlyer[producto.id] || 0;
                  return (
                    <ListItem
                      key={producto.id}
                      disablePadding
                      secondaryAction={
                        <Tooltip title="Agregar al folleto" placement="left">
                          <IconButton size="small" onClick={() => onAddProducto(producto)} aria-label={`Agregar ${producto.nombre}`} sx={ICON_BTN_SX}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      }
                      sx={ROW_SX}
                    >
                      <ListItemButton sx={{ pr: 6, py: 1, borderRadius: 0, "&:hover": { bgcolor: rail.hover } }} onClick={() => onAddProducto(producto)}>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography fontSize={13} fontWeight={500} color="#fff" noWrap flex={1}>
                                {producto.nombre}
                              </Typography>
                              {cantidad > 0 && (
                                <Chip label={`×${cantidad}`} size="small" sx={{ height: 18, fontWeight: 700, bgcolor: "accent.main", color: "primary.main", "& .MuiChip-label": { fontSize: 11, px: 0.75 } }} />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography fontSize={12} color={rail.textMuted} noWrap>
                              SKU: {producto.sku}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
