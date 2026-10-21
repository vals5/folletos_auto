import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from "@mui/material";

const EMPTY = { sku: "", nombre: "", descripcion: "", imagen_url: "" };

// El formulario se monta solo cuando el diálogo está abierto, así arranca limpio cada vez.
function ProductoForm({ onClose, onSave, inicial }) {
  const [form, setForm] = useState(inicial || EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.sku.trim() || !form.nombre.trim()) {
      setError("El SKU y el nombre son obligatorios.");
      return;
    }
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <>
      <DialogTitle>{inicial ? "Editar producto" : "Nuevo producto"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
        <TextField label="SKU" required value={form.sku} onChange={set("sku")} fullWidth />
        <TextField label="Nombre" required value={form.nombre} onChange={set("nombre")} fullWidth autoFocus />
        <TextField label="Descripción" value={form.descripcion ?? ""} onChange={set("descripcion")} fullWidth />
        <TextField
          label="URL de la imagen"
          value={form.imagen_url ?? ""}
          onChange={set("imagen_url")}
          fullWidth
          placeholder="https://..."
        />
        {error && (
          <Typography color="error" fontSize={13}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? "Guardando…" : "Guardar"}
        </Button>
      </DialogActions>
    </>
  );
}

export default function ProductoModal({ open, onClose, onSave, inicial }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      {open && <ProductoForm key={inicial?.id ?? "nuevo"} onClose={onClose} onSave={onSave} inicial={inicial} />}
    </Dialog>
  );
}
