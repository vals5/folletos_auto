import { Box, Typography } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";

export default function Flyers() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="60vh"
      color="text.secondary"
    >
      <DescriptionIcon sx={{ fontSize: 48, mb: 2 }} />
      <Typography variant="h6">Folletos</Typography>
      <Typography variant="body2">Próximamente</Typography>
    </Box>
  );
}
