import { useState, useEffect } from "react";
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Divider, InputAdornment, Button, ToggleButton, ToggleButtonGroup, Tooltip, IconButton } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ViewStreamIcon from "@mui/icons-material/ViewStream";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

const TAMANOS = ["XS", "S", "M", "L", "XL"];
const TIPOS_PRECIO = [
  { value: "regular", label: "Precio regular" },
  { value: "llevando3", label: "Llevando 2" },
  { value: "vea_ahorro", label: "Vea Ahorro" },
  { value: "regular_cencosud", label: "Regular Cencosud" },
];
const ESTILOS_BORDE = [{ value: "none", label: "Sin borde" }, { value: "thick", label: "Rojo" }];
const FONDOS_MODULO = [{ value: "red", label: "Rojo" }, { value: "empty", label: "Sin fondo" }];

export default function PropertiesPanel({ modulo, onUpdate, onDuplicate }) {
  if (!modulo) {
    return (
      <Box width={300} bgcolor="#fafafa" display="flex" flexDirection="column" alignItems="center" justifyContent="center" color="text.secondary" borderLeft="1px solid #e5e7eb" p={3} textAlign="center">
        <Typography fontSize={13}>Seleccioná un módulo del folleto para editar sus propiedades.</Typography>
      </Box>
    );
  }

  const [localNombre, setLocalNombre] = useState("");
  const [localDesc, setLocalDesc] = useState("");

  useEffect(() => {
    setLocalNombre(modulo.nombre_override ?? modulo.productos?.nombre ?? "");
    setLocalDesc(modulo.descripcion_override ?? modulo.productos?.descripcion ?? "");
  }, [modulo.id, modulo.nombre_override, modulo.descripcion_override, modulo.productos]);

  const handleUpdateField = (field, value) => {
    onUpdate(modulo.id, { [field]: value });
  };

  const resetNombre = () => { handleUpdateField("nombre_override", null); };
  const resetDesc = () => { handleUpdateField("descripcion_override", null); };

  return (
    <Box width={300} bgcolor="#fafafa" display="flex" flexDirection="column" borderLeft="1px solid #e5e7eb" overflow="auto">
      {/* Header */}
      <Box px={2.5} py={1.5} bgcolor="white" borderBottom="1px solid #e5e7eb" display="flex" justifyContent="space-between" alignItems="center">
        <Box minWidth={0}>
          <Typography variant="subtitle2" fontWeight={700}>Propiedades</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 160 }}>
            {modulo.productos?.nombre || "Módulo dinámico"}
          </Typography>
        </Box>
        <Tooltip title="Duplicar este módulo con su configuración">
          <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => onDuplicate?.(modulo)} sx={{ fontSize: 11, minWidth: 0, px: 1 }}>
            Duplicar
          </Button>
        </Tooltip>
      </Box>

      <Box px={2} py={2} display="flex" flexDirection="column" gap={2.5}>
        {/* Tamaño */}
        <Box>
          <Typography fontSize={11} fontWeight={700} mb={0.8} color="#374151" textTransform="uppercase">Tamaño</Typography>
          <ToggleButtonGroup value={modulo.tamano} exclusive size="small" fullWidth onChange={(_, val) => val && handleUpdateField("tamano", val)}>
            {TAMANOS.map((t) => (
              <ToggleButton key={t} value={t} sx={{ fontSize: 11, fontWeight: 700, "&.Mui-selected": { bgcolor: "#1a1a2e", color: "white", "&:hover": { bgcolor: "#2d2d5e" } } }}>
                {t}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Divider />

        {/* Maquetación (layout_type) */}
        <Box>
          <Typography fontSize={11} fontWeight={700} mb={0.8} color="#374151" textTransform="uppercase">Maquetación</Typography>
          <ToggleButtonGroup value={modulo.layout_type || 'auto'} exclusive onChange={(_, val) => val && handleUpdateField("layout_type", val)} size="small" fullWidth>
            <ToggleButton value="auto" sx={{ "&.Mui-selected": { bgcolor: "#1a1a2e", color: "white" } }}>
              <Tooltip title="Automático (según tamaño)"><Box display="flex" flexDirection="column" alignItems="center"><AutoAwesomeIcon fontSize="small" /><Typography fontSize={9} mt={0.2}>Auto</Typography></Box></Tooltip>
            </ToggleButton>
            <ToggleButton value="vertical" sx={{ "&.Mui-selected": { bgcolor: "#1a1a2e", color: "white" } }}>
              <Tooltip title="Vertical (Imagen arriba)"><Box display="flex" flexDirection="column" alignItems="center"><ViewStreamIcon fontSize="small" /><Typography fontSize={9} mt={0.2}>Vertical</Typography></Box></Tooltip>
            </ToggleButton>
            <ToggleButton value="horizontal" sx={{ "&.Mui-selected": { bgcolor: "#1a1a2e", color: "white" } }}>
              <Tooltip title="Horizontal (Imagen izquierda)"><Box display="flex" flexDirection="column" alignItems="center"><ViewColumnIcon fontSize="small" /><Typography fontSize={9} mt={0.2}>Horizontal</Typography></Box></Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider />

        {/* Info producto — SKU read-only */}
        <TextField label="SKU de Base de Datos" value={modulo.productos?.sku || ""} size="small" fullWidth disabled InputProps={{ endAdornment: <InputAdornment position="end"><Typography fontSize={10} color="text.disabled">READONLY</Typography></InputAdornment> }} />

        {/* Nombre editable */}
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography fontSize={11} fontWeight={700} color="#374151" textTransform="uppercase">Nombre Comercial</Typography>
            {modulo.nombre_override != null && (
              <Tooltip title="Restaurar nombre original de base de datos">
                <IconButton size="small" onClick={resetNombre} sx={{ p: 0.2, color: "#ef4444" }}><RestartAltIcon fontSize="small" /></IconButton>
              </Tooltip>
            )}
          </Box>
          <TextField
            value={localNombre}
            onChange={(e) => setLocalNombre(e.target.value)}
            onBlur={() => handleUpdateField("nombre_override", localNombre.trim() || null)}
            size="small" fullWidth placeholder="Escribí un nombre alternativo..."
            FormHelperTextProps={{ sx: { color: modulo.nombre_override ? "#f59e0b" : "text.secondary" } }}
            helperText={modulo.nombre_override != null ? "Personalizado (No afecta el catálogo)" : "Usando nombre original"}
          />
        </Box>

        {/* Descripción editable */}
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography fontSize={11} fontWeight={700} color="#374151" textTransform="uppercase">Descripción en Oferta</Typography>
            {modulo.descripcion_override != null && (
              <Tooltip title="Restaurar descripción original">
                <IconButton size="small" onClick={resetDesc} sx={{ p: 0.2, color: "#ef4444" }}><RestartAltIcon fontSize="small" /></IconButton>
              </Tooltip>
            )}
          </Box>
          <TextField
            value={localDesc}
            onChange={(e) => setLocalDesc(e.target.value)}
            onBlur={() => handleUpdateField("descripcion_override", localDesc.trim() || null)}
            size="small" fullWidth multiline rows={2} placeholder="Detalles de oferta (ej: 250 GR)..."
            FormHelperTextProps={{ sx: { color: modulo.descripcion_override ? "#f59e0b" : "text.secondary" } }}
            helperText={modulo.descripcion_override != null ? "Personalizado (No afecta el catálogo)" : "Usando descripción original"}
          />
        </Box>

        <Divider />

        {/* Precios */}
        <Box display="flex" flexDirection="column" gap={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Tipo de Promoción</InputLabel>
            <Select value={modulo.tipo_precio || "regular"} label="Tipo de Promoción" onChange={(e) => handleUpdateField("tipo_precio", e.target.value)}>
              {TIPOS_PRECIO.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            label="Precio Público"
            type="number"
            value={modulo.precio ?? ""}
            onChange={(e) => handleUpdateField("precio", e.target.value ? Number(e.target.value) : null)}
            size="small" fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon fontSize="small" /></InputAdornment> }}
          />
        </Box>

        <Divider />

        {/* Estilo visual */}
        <Box display="flex" flexDirection="column" gap={2} mb={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Estilo del Borde</InputLabel>
            <Select value={modulo.estilo_borde || "none"} label="Estilo del Borde" onChange={(e) => handleUpdateField("estilo_borde", e.target.value)}>
              {ESTILOS_BORDE.map((b) => <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Color de Fondo</InputLabel>
            <Select value={modulo.fondo_modulo || "white"} label="Color de Fondo" onChange={(e) => handleUpdateField("fondo_modulo", e.target.value)}>
              {FONDOS_MODULO.map((f) => <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Box>
  );
}