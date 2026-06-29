import { useEffect, useState } from "react";
import { Box, Typography, TextField, InputAdornment, List, ListItem, ListItemText, ListItemButton, IconButton, Chip, Tooltip, Tabs, Tab, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InventoryIcon from "@mui/icons-material/Inventory";
import { supabase } from "../../services/supabase";

const tamanoColor = { XS: "#9e9e9e", S: "#f59e0b", M: "#3b82f6", L: "#10b981", XL: "#8b5cf6" };

export default function ProductsSidebar({ modulos, selectedModulo, onSelectModulo, onAddProducto, onDeleteModulo }) {
  const [tab, setTab] = useState(0);
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingProductos, setLoadingProductos] = useState(true);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const { data, error } = await supabase.from("productos").select("*").order("nombre");
      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoadingProductos(false);
    }
  };

  const productosFiltrados = productos.filter((p) => {
    const q = search.toLowerCase().trim();
    return !q || p.nombre?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
  });

  const conteoEnFlyer = modulos.reduce((acc, m) => {
    if (m?.producto_id) acc[m.producto_id] = (acc[m.producto_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <Box width={280} bgcolor="#025BA9" display="flex" flexDirection="column" sx={{ borderRight: "1px solid rgba(255,255,255,0.12)", flexShrink: 0 }}>
      {/* Header */}
      <Box px={2} pt={2} pb={1} textAlign="center">
        <Typography variant="subtitle1" fontWeight={700} color="white">Editor</Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            mt: 1,
            minHeight: 32,
            "& .MuiTab-root": { color: "rgba(255,255,255,0.7)", fontSize: 11, minWidth: 0, py: 0.5 },
            "& .Mui-selected": { color: "white", fontWeight: 600 },
            "& .MuiTabs-indicator": { bgcolor: "#fff800" }, 
          }}
        >
          <Tab label={`En folleto (${modulos.length})`} />
          <Tab label="Catálogo" />
        </Tabs>
      </Box>

      {/* Búsqueda */}
      {tab === 1 && (
        <Box px={2} pb={1.5}>
          <TextField
            size="small"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#6b7280", fontSize: 18 }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: "#ffffff",
                borderRadius: 1.5,
                fontSize: 13,
                "& fieldset": { border: "none" },
              },
            }}
            inputProps={{ style: { color: "#111827" } }}
          />
        </Box>
      )}

      {/* Lista contenedora */}
      <Box flex={1} overflow="auto" bgcolor="#014a8b">
        {tab === 0 ? (
          modulos.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80%" color="rgba(255,255,255,0.5)" px={2} textAlign="center">
              <InventoryIcon sx={{ fontSize: 32, mb: 1, opacity: 0.7 }} />
              <Typography fontSize={12}>Agregá productos desde la pestaña "Catálogo"</Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {modulos.map((modulo) => {
                const esSeleccionado = selectedModulo?.id === modulo.id;
                return (
                  <ListItem
                    key={modulo.id}
                    disablePadding
                    secondaryAction={
                      <IconButton size="small" onClick={() => onDeleteModulo(modulo.id)} sx={{ color: "#fca5a5", "&:hover": { color: "#ef4444" } }}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{
                      bgcolor: esSeleccionado ? "rgba(255,255,255,0.15)" : "transparent",
                      borderLeft: esSeleccionado ? "4px solid #fff800" : "4px solid transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.05)"
                    }}
                  >
                    <ListItemButton onClick={() => onSelectModulo(modulo)} sx={{ pr: 5, py: 1 }}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                            <Typography fontSize={12} fontWeight={esSeleccionado ? 600 : 400} color="white" noWrap flex={1}>
                              {modulo.nombre_override ?? modulo.productos?.nombre ?? "Sin nombre"}
                            </Typography>
                            <Chip label={modulo.tamano} size="small" sx={{ height: 16, fontSize: 9, fontWeight: 700, bgcolor: tamanoColor[modulo.tamano], color: "white" }} />
                          </Box>
                        }
                        secondary={
                          <Typography fontSize={11} color="rgba(255,255,255,0.6)" noWrap>
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
        ) : (
          loadingProductos ? (
            <Box display="flex" justifyContent="center" pt={4}><CircularProgress size={20} sx={{ color: "white" }} /></Box>
          ) : productosFiltrados.length === 0 ? (
            <Box display="flex" justifyContent="center" pt={4} px={2}><Typography fontSize={12} color="rgba(255,255,255,0.5)">No se encontraron productos</Typography></Box>
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
                        <IconButton size="small" onClick={() => onAddProducto(producto)} sx={{ color: "#4ade80", "&:hover": { color: "#22c55e" } }}>
                          <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                    sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <ListItemButton sx={{ pr: 5, py: 1 }} onClick={() => onAddProducto(producto)}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontSize={12} color="white" noWrap flex={1}>{producto.nombre}</Typography>
                            {cantidad > 0 && (
                              <Chip label={`×${cantidad}`} size="small" sx={{ height: 16, fontSize: 10, fontWeight: 700, bgcolor: "#fff800", color: "#025BA9" }} />
                            )}
                          </Box>
                        }
                        secondary={<Typography fontSize={11} color="rgba(255,255,255,0.5)" noWrap>SKU: {producto.sku}</Typography>}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )
        )}
      </Box>
    </Box>
  );
}