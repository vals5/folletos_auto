import { Box, Typography } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";

export default function Users() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="60vh"
      color="text.secondary"
    >
      <GroupIcon sx={{ fontSize: 48, mb: 2 }} />
      <Typography variant="h6">Usuarios</Typography>
      <Typography variant="body2">Próximamente</Typography>
    </Box>
  );
}
