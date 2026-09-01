import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from "@mui/material";

const EMPTY = { sku: "", nombre: "", descripcion: "", imagen_url: "" };

export default function ProductoModal({ open, onClose, onSave, inicial }) {
  const [form, setForm] = useState(inicial || EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(inicial || EMPTY);
    setError("");
  }, [inicial, open]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.sku.trim() || !form.nombre.trim()) {
      setError("SKU y nombre son obligatorios");
      return;
    }
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {inicial ? "Editar producto" : "Nuevo producto"}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
        <TextField
          label="SKU *"
          value={form.sku}
          onChange={set("sku")}
          size="small"
          fullWidth
        />
        <TextField
          label="Nombre *"
          value={form.nombre}
          onChange={set("nombre")}
          size="small"
          fullWidth
          autoFocus
        />
        <TextField
          label="Descripción"
          value={form.descripcion}
          onChange={set("descripcion")}
          size="small"
          fullWidth
        />
        <TextField
          label="URL de imagen"
          value={form.imagen_url}
          onChange={set("imagen_url")}
          size="small"
          fullWidth
          placeholder="https://..."
        />
        {error && (
          <Typography color="error" fontSize={13}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          sx={{ bgcolor: "#1a1a2e", "&:hover": { bgcolor: "#2d2d5e" } }}
        >
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}