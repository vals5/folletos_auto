import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

export default function ConfirmarBorrarModal({ open, producto, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Borrar producto</DialogTitle>
      <DialogContent>
        <Typography>
          ¿Seguro que querés borrar <strong>{producto?.nombre}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          Borrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}