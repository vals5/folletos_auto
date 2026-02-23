import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  InputAdornment,
  Button,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ImageIcon from "@mui/icons-material/Image";

const TAMANOS = ["XS", "S", "M", "L", "XL"];

const TIPOS_PRECIO = [
  { value: "regular", label: "Precio regular" },
  { value: "llevando3", label: "Llevando 3" },
  { value: "vea_ahorro", label: "Vea Ahorro" },
  { value: "regular_cencosud", label: "Regular Cencosud" },
];

export default function PropertiesPanel({ modulo, onUpdate }) {
  if (!modulo) {
    return (
      <Box
        width={320}
        bgcolor="#fafafa"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        color="text.secondary"
        borderLeft="1px solid #e5e7eb"
        p={3}
        textAlign="center"
      >
        <Typography fontSize={14}>
          Seleccioná un módulo para ver sus propiedades
        </Typography>
      </Box>
    );
  }

  const update = (field, value) => {
    onUpdate(modulo.id, { [field]: value });
  };

  return (
    <Box
      width={320}
      bgcolor="#fafafa"
      display="flex"
      flexDirection="column"
      borderLeft="1px solid #e5e7eb"
      overflow="auto"
    >
      {/* Header */}
      <Box px={2.5} py={2} bgcolor="white" borderBottom="1px solid #e5e7eb">
        <Typography variant="subtitle1" fontWeight={700}>
          Propiedades
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {modulo.productos?.nombre}
        </Typography>
      </Box>

      <Box px={2.5} py={2} display="flex" flexDirection="column" gap={2.5}>
        {/* Tamaño del módulo */}
        <Box>
          <Typography fontSize={13} fontWeight={600} mb={1} color="#374151">
            Tamaño de módulo
          </Typography>
          <ToggleButtonGroup
            value={modulo.tamano}
            exclusive
            onChange={(_, val) => val && update("tamano", val)}
            size="small"
            fullWidth
          >
            {TAMANOS.map((t) => (
              <ToggleButton
                key={t}
                value={t}
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  "&.Mui-selected": {
                    bgcolor: "#1a1a2e",
                    color: "white",
                    "&:hover": { bgcolor: "#2d2d5e" },
                  },
                }}
              >
                {t}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Divider />

        {/* SKU (solo lectura) */}
        <TextField
          label="SKU"
          value={modulo.productos?.sku || ""}
          size="small"
          fullWidth
          disabled
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Typography fontSize={11} color="text.disabled">
                  vinculado
                </Typography>
              </InputAdornment>
            ),
          }}
        />

        {/* Nombre */}
        <TextField
          label="Nombre"
          value={modulo.productos?.nombre || ""}
          size="small"
          fullWidth
          disabled
          helperText="Editá el nombre desde el catálogo de productos"
        />

        {/* Descripción */}
        <TextField
          label="Descripción"
          value={modulo.productos?.descripcion || ""}
          size="small"
          fullWidth
          disabled
        />

        <Divider />

        {/* Tipo de precio */}
        <FormControl size="small" fullWidth>
          <InputLabel>Tipo de precio</InputLabel>
          <Select
            value={modulo.tipo_precio || "regular"}
            label="Tipo de precio"
            onChange={(e) => update("tipo_precio", e.target.value)}
          >
            {TIPOS_PRECIO.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Precio */}
        <TextField
          label="Precio"
          type="number"
          value={modulo.precio || ""}
          onChange={(e) =>
            update("precio", e.target.value ? Number(e.target.value) : null)
          }
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AttachMoneyIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* Precio Cencosud toggle */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          bgcolor="white"
          borderRadius={2}
          px={2}
          py={1}
          border="1px solid #e5e7eb"
        >
          <Typography fontSize={14} fontWeight={500}>
            Precio Cencosud
          </Typography>
          <Switch
            checked={modulo.precio_cencosud || false}
            onChange={(e) => update("precio_cencosud", e.target.checked)}
            size="small"
          />
        </Box>

        <Divider />

        {/* Imagen */}
        <Box>
          <Typography fontSize={13} fontWeight={600} mb={1} color="#374151">
            Imagen
          </Typography>
          <TextField
            placeholder="URL de imagen o nombre de archivo"
            value={modulo.productos?.imagen_url || ""}
            size="small"
            fullWidth
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ImageIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Typography fontSize={11} color="text.secondary" mt={0.5}>
            Editá la imagen desde el catálogo de productos
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
