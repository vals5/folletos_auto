import { Box, TextField, Typography } from "@mui/material";

export default function PropertiesPanel() {
  return (
    <Box width={320} bgcolor="#fafafa" p={2}>
      <Typography variant="h6">Propiedades</Typography>
      -- Tamaño del modulo XS S M L XL
      <TextField label="SKU" fullWidth sx={{ mt: 2 }} />
      <TextField label="Nombre" fullWidth sx={{ mt: 2 }} />
      <TextField label="Descripción" fullWidth sx={{ mt: 2 }} />
      --Tipo de precio Regular Llevando3 VeaAhorro RegularCencosud -- Precio $
      --Boton Precio Cencosud Si/No --Imagen
    </Box>
  );
}
