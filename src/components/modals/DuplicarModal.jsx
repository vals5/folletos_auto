import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { TAMANOS } from "../../config/editorTheme";

export default function DuplicarModal({ open, modulo, onClose, onDuplicate }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Duplicar módulo</DialogTitle>
      <DialogContent>
        <Typography fontSize={14} color="text.secondary" mb={2}>
          Elegí el tamaño para la copia de <strong>{modulo?.productos?.nombre}</strong>:
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {TAMANOS.map((t) => (
            <Button
              key={t}
              size="small"
              variant={modulo?.tamano === t ? "contained" : "outlined"}
              color={modulo?.tamano === t ? "primary" : "inherit"}
              onClick={() => onDuplicate(t)}
              sx={{ minWidth: 48 }}
            >
              {t}
            </Button>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
