import { Box, Typography } from "@mui/material";

// Mensaje + ícono para pantallas o paneles vacíos. `action` es un botón opcional.
export default function EmptyState({ icon: Icon, title, description, action, compact = false, sx }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 1,
        py: compact ? 4 : 8,
        px: 2,
        color: "text.secondary",
        ...sx,
      }}
    >
      {Icon && (
        <Box
          sx={{
            width: compact ? 44 : 56,
            height: compact ? 44 : 56,
            borderRadius: "12px",
            bgcolor: "neutral.100",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 0.5,
          }}
        >
          <Icon sx={{ fontSize: compact ? 24 : 28, color: "neutral.400" }} />
        </Box>
      )}
      <Typography fontWeight={700} fontSize={compact ? 14 : 16} color="text.primary">
        {title}
      </Typography>
      {description && (
        <Typography fontSize={13} sx={{ maxWidth: 320 }}>
          {description}
        </Typography>
      )}
      {action && <Box mt={1}>{action}</Box>}
    </Box>
  );
}
