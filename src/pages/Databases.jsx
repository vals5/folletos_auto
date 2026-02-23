import { Box, Typography } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";

export default function Databases() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="60vh"
      color="text.secondary"
    >
      <StorageIcon sx={{ fontSize: 48, mb: 2 }} />
      <Typography variant="h6">Bases de datos</Typography>
      <Typography variant="body2">Próximamente</Typography>
    </Box>
  );
}
