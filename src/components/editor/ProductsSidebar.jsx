import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Chip,
  Tooltip,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InventoryIcon from "@mui/icons-material/Inventory";
import { supabase } from "../../services/supabase";

const tamanoColor = {
  XS: "#9e9e9e",
  S: "#f59e0b",
  M: "#3b82f6",
  L: "#10b981",
  XL: "#8b5cf6",
};

export default function ProductsSidebar({
  modulos,
  selectedModulo,
  onSelectModulo,
  onAddProducto,
  onDeleteModulo,
}) {
  const [tab, setTab] = useState(0);
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingProductos, setLoadingProductos] = useState(true);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    const { data } = await supabase
      .from("productos")
      .select("*")
      .order("nombre");
    setProductos(data || []);
    setLoadingProductos(false);
  };

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  // Productos que ya están en el flyer
  const productosEnFlyer = new Set(modulos.map((m) => m.producto_id));

  return (
    <Box
      width={280}
      bgcolor="#111827"
      display="flex"
      flexDirection="column"
      sx={{ borderRight: "1px solid #1f2937" }}
    >
      {/* Header */}
      <Box px={2} pt={2} pb={1}>
        <Typography variant="subtitle1" fontWeight={700} color="white">
          Editor de folleto
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mt: 1,
            "& .MuiTab-root": {
              color: "#9ca3af",
              fontSize: 12,
              minWidth: 0,
              px: 1,
            },
            "& .Mui-selected": { color: "white" },
            "& .MuiTabs-indicator": { bgcolor: "#f59e0b" },
          }}
        >
          <Tab label={`En folleto (${modulos.length})`} />
          <Tab label="Catálogo" />
        </Tabs>
      </Box>

      {/* Búsqueda (solo en catálogo) */}
      {tab === 1 && (
        <Box px={2} pb={1}>
          <TextField
            size="small"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9ca3af", fontSize: 18 }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: "#1f2937",
                color: "white",
                fontSize: 13,
                "& fieldset": { borderColor: "#374151" },
                "&:hover fieldset": { borderColor: "#4b5563" },
              },
            }}
            inputProps={{ style: { color: "white" } }}
          />
        </Box>
      )}

      <Divider sx={{ borderColor: "#1f2937" }} />

      {/* Lista */}
      <Box flex={1} overflow="auto">
        {tab === 0 ? (
          // Módulos en el flyer
          modulos.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              color="#6b7280"
              px={2}
              textAlign="center"
            >
              <InventoryIcon sx={{ fontSize: 36, mb: 1 }} />
              <Typography fontSize={13}>
                Agregá productos desde la pestaña "Catálogo"
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {modulos.map((modulo) => (
                <ListItem
                  key={modulo.id}
                  disablePadding
                  secondaryAction={
                    <IconButton
                      size="small"
                      onClick={() => onDeleteModulo(modulo.id)}
                      sx={{ color: "#ef4444" }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{
                    bgcolor:
                      selectedModulo?.id === modulo.id
                        ? "#1f2937"
                        : "transparent",
                    borderLeft:
                      selectedModulo?.id === modulo.id
                        ? "3px solid #f59e0b"
                        : "3px solid transparent",
                  }}
                >
                  <ListItemButton
                    onClick={() => onSelectModulo(modulo)}
                    sx={{ pr: 5 }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography fontSize={13} color="white" noWrap>
                            {modulo.productos?.nombre || "Sin nombre"}
                          </Typography>
                          <Chip
                            label={modulo.tamano}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: 10,
                              bgcolor: tamanoColor[modulo.tamano] + "33",
                              color: tamanoColor[modulo.tamano],
                              border: `1px solid ${tamanoColor[modulo.tamano]}55`,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography fontSize={11} color="#6b7280" noWrap>
                          {modulo.productos?.descripcion}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )
        ) : // Catálogo de productos
        loadingProductos ? (
          <Box display="flex" justifyContent="center" pt={4}>
            <CircularProgress size={24} sx={{ color: "#f59e0b" }} />
          </Box>
        ) : (
          <List dense disablePadding>
            {productosFiltrados.map((producto) => {
              const yaAgregado = productosEnFlyer.has(producto.id);
              return (
                <ListItem
                  key={producto.id}
                  disablePadding
                  secondaryAction={
                    <Tooltip
                      title={yaAgregado ? "Ya está en el folleto" : "Agregar"}
                    >
                      <span>
                        <IconButton
                          size="small"
                          disabled={yaAgregado}
                          onClick={() => onAddProducto(producto)}
                          sx={{ color: yaAgregado ? "#374151" : "#10b981" }}
                        >
                          <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  }
                >
                  <ListItemButton sx={{ pr: 5 }}>
                    <ListItemText
                      primary={
                        <Typography
                          fontSize={13}
                          color={yaAgregado ? "#6b7280" : "white"}
                          noWrap
                        >
                          {producto.nombre}
                        </Typography>
                      }
                      secondary={
                        <Typography fontSize={11} color="#4b5563" noWrap>
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
  );
}
