import { useState } from "react";
import { Box, Typography, Button, TextField, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, InputAdornment } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useProductos, useProductoMutations } from "../hooks/useProductos";

import ProductoModal from "../components/modals/ProductModal";
import ConfirmarBorrarModal from "../components/modals/ConfirmarBorrarModal";

export default function Databases() {
  const { data: productos = [], isLoading: loading } = useProductos();
  const { save, remove } = useProductoMutations();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [borrandoP, setBorrandoP] = useState(null);

  const handleSave = async (form) => {
    try {
      await save.mutateAsync({ id: editando?.id, form });
      setEditando(null);
      setModalOpen(false);
    } catch {
      // el error ya se muestra con notify desde el hook
    }
  };

  const handleDelete = async () => {
    if (!borrandoP) return;
    try {
      await remove.mutateAsync(borrandoP.id);
      setBorrandoP(null);
    } catch {
      // el error ya se muestra con notify desde el hook
    }
  };

  const filtrados = productos.filter(
    (p) =>
      (p.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Catálogo de productos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditando(null); setModalOpen(true); }}
          sx={{ bgcolor: "#1a1a2e", "&:hover": { bgcolor: "#2d2d5e" } }}
        >
          Nuevo producto
        </Button>
      </Box>

      <TextField
        placeholder="Buscar por nombre o SKU..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ mb: 2, width: 320 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" pt={6}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f9fafb" }}>
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Imagen</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 13 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No hay productos
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontSize: 13, color: "#6b7280", fontFamily: "monospace" }}>{p.sku}</TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>{p.nombre}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#6b7280" }}>{p.descripcion || "—"}</TableCell>
                    <TableCell sx={{ fontSize: 13 }}>
                      {p.imagen_url ? (
                        <Box component="img" src={p.imagen_url} alt={p.nombre} sx={{ height: 36, objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <Typography fontSize={12} color="text.disabled">Sin imagen</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => { setEditando(p); setModalOpen(true); }}><EditOutlinedIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Borrar">
                        <IconButton size="small" onClick={() => setBorrandoP(p)} sx={{ color: "#ef4444" }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Componentes de apoyo limpios */}
      <ProductoModal open={modalOpen} onClose={() => { setModalOpen(false); setEditando(null); }} onSave={handleSave} inicial={editando} />
      <ConfirmarBorrarModal open={!!borrandoP} producto={borrandoP} onClose={() => setBorrandoP(null)} onConfirm={handleDelete} />
    </Box>
  );
}