import { Box, Typography } from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";

export default function Styles() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="60vh"
      color="text.secondary"
    >
      <PaletteIcon sx={{ fontSize: 48, mb: 2 }} />
      <Typography variant="h6">Estilos</Typography>
      <Typography variant="body2">Próximamente</Typography>
    </Box>
  );
}
