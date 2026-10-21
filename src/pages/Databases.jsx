import { useState } from "react";
import { Box, Typography, Button, TextField, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton, InputAdornment } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
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

  const abrirNuevo = () => {
    setEditando(null);
    setModalOpen(true);
  };

  const nuevoBtn = (
    <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={abrirNuevo}>
      Nuevo producto
    </Button>
  );

  const sinProductos = !loading && productos.length === 0;

  return (
    <Box>
      <PageHeader
        title="Catálogo de productos"
        subtitle={loading ? "Cargando…" : `${productos.length} ${productos.length === 1 ? "producto" : "productos"}`}
        action={sinProductos ? null : nuevoBtn}
      />

      {sinProductos ? (
        <EmptyState
          icon={Inventory2OutlinedIcon}
          title="El catálogo está vacío"
          description="Cargá tus productos para poder agregarlos a los folletos."
          action={nuevoBtn}
        />
      ) : (
        <>
          <TextField
            placeholder="Buscar por nombre o SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2, width: { xs: "100%", sm: 340 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "neutral.400" }} />
                </InputAdornment>
              ),
            }}
            inputProps={{ "aria-label": "Buscar productos" }}
          />

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "12px", overflow: "hidden" }}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>SKU</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Imagen</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [1, 2, 3, 4].map((n) => (
                    <TableRow key={n}>
                      <TableCell colSpan={5}>
                        <Skeleton height={28} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ border: 0 }}>
                      <EmptyState compact title="Sin resultados" description={`No hay productos que coincidan con “${search}”.`} />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtrados.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell sx={{ color: "text.secondary", fontFamily: "ui-monospace, monospace", fontSize: 13 }}>{p.sku}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{p.nombre}</TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>{p.descripcion || "—"}</TableCell>
                      <TableCell>
                        {p.imagen_url ? (
                          <Box
                            component="img"
                            src={p.imagen_url}
                            alt={p.nombre}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                            sx={{ width: 40, height: 40, objectFit: "contain", borderRadius: "8px", border: "1px solid", borderColor: "divider", bgcolor: "#fff" }}
                          />
                        ) : (
                          <Typography fontSize={12} color="text.disabled">
                            Sin imagen
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            aria-label={`Editar ${p.nombre}`}
                            onClick={() => {
                              setEditando(p);
                              setModalOpen(true);
                            }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Borrar">
                          <IconButton
                            size="small"
                            aria-label={`Borrar ${p.nombre}`}
                            onClick={() => setBorrandoP(p)}
                            sx={{ color: "text.secondary", "&:hover": { color: "error.main", bgcolor: "error.light" } }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <ProductoModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditando(null);
        }}
        onSave={handleSave}
        inicial={editando}
      />
      <ConfirmarBorrarModal open={!!borrandoP} producto={borrandoP} onClose={() => setBorrandoP(null)} onConfirm={handleDelete} />
    </Box>
  );
}
