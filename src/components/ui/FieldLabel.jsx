import { Typography } from "@mui/material";

// Etiqueta en mayúsculas que va arriba de cada campo o sección.
export default function FieldLabel({ children, sx, ...props }) {
  return (
    <Typography variant="overline" component="div" sx={{ display: "block", mb: 0.5, ...sx }} {...props}>
      {children}
    </Typography>
  );
}
