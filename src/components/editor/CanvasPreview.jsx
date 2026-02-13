import { Box } from "@mui/material";

export default function CanvasPreview() {
  return (
    <Box
      flex={1}
      bgcolor="#ddd"
      display="flex"
      justifyContent="center"
      alignContent="center"
    >
      <Box width={400} height={700} bgcolor="white" boxShadow={3}>
        Preview del folleto
      </Box>
    </Box>
  );
}
