import { Box, Typography } from "@mui/material";

// Encabezado estándar de cada pantalla: título + descripción a la izquierda, acción a la derecha.
export default function PageHeader({ title, subtitle, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h5" fontWeight={700} color="text.primary" lineHeight={1.2}>
          {title}
        </Typography>
        {subtitle && (
          <Typography fontSize={14} color="text.secondary" mt={0.5}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
