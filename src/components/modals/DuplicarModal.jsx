import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const TAMANOS = ["XS", "S", "M", "L", "XL"];

export default function DuplicarModal({ open, modulo, onClose, onDuplicate }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Duplicar módulo</DialogTitle>
      <DialogContent>
        <Typography fontSize={14} mb={2}>
          Elegí el tamaño para la copia de <strong>{modulo?.productos?.nombre}</strong>:
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {TAMANOS.map((t) => (
            <Button 
              key={t} 
              size="small" 
              variant={modulo?.tamano === t ? "contained" : "outlined"}
              onClick={() => onDuplicate(t)}
              sx={{ ...(modulo?.tamano === t && { bgcolor: "#10b981", "&:hover": { bgcolor: "#2d2d5e" } }) }}
            >
              {t}
            </Button>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
}