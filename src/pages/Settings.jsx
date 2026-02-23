import { Box, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

export default function Settings() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="60vh"
      color="text.secondary"
    >
      <SettingsIcon sx={{ fontSize: 48, mb: 2 }} />
      <Typography variant="h6">Configuración</Typography>
      <Typography variant="body2">Próximamente</Typography>
    </Box>
  );
}
