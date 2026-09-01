import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

export default function ConfirmarEliminarPagina({ open, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Eliminar página</DialogTitle>
      <DialogContent>
        <Typography>¿Seguro? Se borrarán todos los módulos de esta página.</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button variant="contained" color="error" onClick={onConfirm}>Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
}