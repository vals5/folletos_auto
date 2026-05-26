import { useEffect, useState } from "react";
import { Box, Typography, TextField, InputAdornment, Divider, List, ListItem, ListItemText, ListItemButton, IconButton, Chip, Tooltip, Tabs, Tab, CircularProgress, } from "@mui/material";
import SearchIcon        from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InventoryIcon     from "@mui/icons-material/Inventory";
import { supabase }      from "../../services/supabase";

const tamanoColor = {
  XS: "#9e9e9e",
  S:  "#f59e0b",
  M:  "#3b82f6",
  L:  "#10b981",
  XL: "#8b5cf6",
};

export default function ProductsSidebar({
  modulos,
  selectedModulo,
  onSelectModulo,
  onAddProducto,
  onDeleteModulo,
}) {
  const [tab, setTab]                   = useState(0);
  const [productos, setProductos]       = useState([]);
  const [search, setSearch]             = useState("");
  const [loadingProductos, setLoadingProductos] = useState(true);

  useEffect(() => { fetchProductos(); }, []);

  const fetchProductos = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("nombre");
    if (error) console.error("Error cargando productos:", error);
    setProductos(data || []);
    setLoadingProductos(false);
  };

  const productosFiltrados = productos.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    );
  });

  const conteoEnFlyer = modulos.reduce((acc, m) => {
    if (m?.producto_id) acc[m.producto_id] = (acc[m.producto_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <Box
      width={280}
      bgcolor="#025BA9"
      display="flex"
      flexDirection="column"
      sx={{ borderRight: "1px solid #ffffff", flexShrink: 0 }}
    >
      {/* Header */}
      <Box px={2} pt={2} pb={1} textAlign="center">
        <Typography variant="subtitle1" fontWeight={700} color="white">
          Editor
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mt: 1,
            "& .MuiTab-root": { color: "#ffffff", fontSize: 12, minWidth: 0, px: 1 },
            "& .Mui-selected": { color: "white" },
            "& .MuiTabs-indicator": { bgcolor: "black" },
          }}
        >
          <Tab label={`En folleto (${modulos.length})`} />
          <Tab label="Catálogo" />
        </Tabs>
      </Box>

      {/* Búsqueda — solo en Catálogo */}
      {tab === 1 && (
        <Box px={2} pb={1}>
          <TextField
            size="small"
            placeholder="Buscar por nombre o SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#000000", fontSize: 18 }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: "#ffffff", color: "white", fontSize: 13,
                "&:hover fieldset": { borderColor: "#4b5563" },
              },
            }}
            inputProps={{ style: { color: "white" } }}
          />
        </Box>
      )}


      {/* Lista */}
      <Box flex={1} overflow="auto">

        {/* ── Tab 0: módulos ya en el folleto ── */}
        {tab === 0 && (
          modulos.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center"
              justifyContent="center" height="100%" color="#ffffff" px={2} textAlign="center">
              <InventoryIcon sx={{ fontSize: 36, mb: 1 }} />
              <Typography fontSize={13}>
                Agregá productos desde "Catálogo"
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {modulos.map((modulo) => (
                <ListItem
                  key={modulo.id}
                  disablePadding
                  secondaryAction={
                    <IconButton size="small" onClick={() => onDeleteModulo(modulo.id)}
                      sx={{ color: "#ef4444" }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{
                    bgcolor: selectedModulo?.id === modulo.id ? "#434343" : "transparent",
                    borderLeft: selectedModulo?.id === modulo.id
                      ? "3px solid #000000" : "3px solid transparent",
                  }}
                >
                  <ListItemButton onClick={() => onSelectModulo(modulo)} sx={{ pr: 5 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography fontSize={13} color="white" noWrap>
                            {modulo.productos?.nombre || "Sin nombre"}
                          </Typography>
                          <Chip label={modulo.tamano} size="small" sx={{
                            height: 18, fontSize: 10,
                            bgcolor: tamanoColor[modulo.tamano] + "33",
                            color: tamanoColor[modulo.tamano],
                            border: `1px solid ${tamanoColor[modulo.tamano]}55`,
                          }} />
                        </Box>
                      }
                      secondary={
                        <Typography fontSize={11} color="#ffffff" noWrap>
                          {modulo.productos?.descripcion}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )
        )}

        {/* ── Tab 1: catálogo completo ── */}
        {tab === 1 && (
          loadingProductos ? (
            <Box display="flex" justifyContent="center" pt={4}>
              <CircularProgress size={24} sx={{ color: "#000000" }} />
            </Box>
          ) : productosFiltrados.length === 0 ? (
            <Box display="flex" justifyContent="center" pt={4} px={2}>
              <Typography fontSize={13} color="#ffffff" textAlign="center">
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
                      <Tooltip title="Agregar al folleto">
                        {/* siempre habilitado — se puede agregar varias veces */}
                        <IconButton
                          size="small"
                          onClick={() => onAddProducto(producto)}
                          sx={{ color: "#07c138",}}
                        >
                          <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemButton sx={{ pr: 5 }}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontSize={13} color="white" noWrap flex={1}>
                              {producto.nombre}
                            </Typography>
                            {/* Badge: cuántas veces está en el folleto */}
                            {cantidad > 0 && (
                              <Chip
                                label={`×${cantidad}`}
                                size="small"
                                sx={{
                                  height: 16, fontSize: 13,
                                  bgcolor: "#000000", color: "#ffffff",
                                  border: "1px solid #000000",
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography fontSize={11} color="#ffffff" noWrap>
                            SKU: {producto.sku}
                          </Typography>
                        }
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