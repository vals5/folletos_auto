import { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Switch, 
  Divider, 
  InputAdornment, 
  Button, 
  ToggleButton, 
  ToggleButtonGroup, 
  Tooltip, 
  IconButton 
} from "@mui/material";
import AttachMoneyIcon   from "@mui/icons-material/AttachMoney";
import ImageIcon         from "@mui/icons-material/Image";
import ContentCopyIcon   from "@mui/icons-material/ContentCopy";
import RestartAltIcon    from "@mui/icons-material/RestartAlt";
import AutoAwesomeIcon   from "@mui/icons-material/AutoAwesome";
import ViewStreamIcon    from "@mui/icons-material/ViewStream";
import ViewColumnIcon    from "@mui/icons-material/ViewColumn";

const TAMANOS = ["XS", "S", "M", "L", "XL"];

const TIPOS_PRECIO = [
  { value: "regular",          label: "Precio regular"   },
  { value: "llevando3",        label: "Llevando 2"       },
  { value: "vea_ahorro",       label: "Vea Ahorro"       },
  { value: "regular_cencosud", label: "Regular Cencosud" },
];

const ESTILOS_BORDE = [
  { value: "none",   label: "Sin borde" },
  { value: "thick",  label: "Rojo"      },
];

const FONDOS_MODULO = [
  { value: "red",    label: "Rojo"      },
  { value: "empty",  label: "Sin fondo" },
];

export default function PropertiesPanel({ modulo, onUpdate, onDuplicate }) {
  if (!modulo) {
    return (
      <Box width={300} bgcolor="#fafafa" display="flex" flexDirection="column"
        alignItems="center" justifyContent="center" color="text.secondary"
        borderLeft="1px solid #e5e7eb" p={3} textAlign="center">
        <Typography fontSize={14}>Seleccioná un módulo para ver sus propiedades</Typography>
      </Box>
    );
  }

  const update = (field, value) => onUpdate(modulo.id, { [field]: value });

  // Valores actuales para nombre y descripción (override o del producto)
  const nombreActual = modulo.nombre_override ?? modulo.productos?.nombre ?? "";
  const descActual   = modulo.descripcion_override !== undefined && modulo.descripcion_override !== null
    ? modulo.descripcion_override
    : modulo.productos?.descripcion ?? "";

  const resetNombre = () => update("nombre_override", null);
  const resetDesc   = () => update("descripcion_override", null);

  return (
    <Box width={300} bgcolor="#fafafa" display="flex" flexDirection="column"
      borderLeft="1px solid #e5e7eb" overflow="auto">

      {/* Header */}
      <Box px={2.5} py={1.5} bgcolor="white" borderBottom="1px solid #e5e7eb"
        display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>Propiedades</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 160 }}>
            {modulo.productos?.nombre}
          </Typography>
        </Box>
        <Tooltip title="Duplicar módulo">
          <Button size="small" startIcon={<ContentCopyIcon/>}
            onClick={() => onDuplicate?.(modulo)}
            sx={{ fontSize:11, minWidth:0, px:1 }}>
            Duplicar
          </Button>
        </Tooltip>
      </Box>

      <Box px={2} py={2} display="flex" flexDirection="column" gap={2}>

        {/* Tamaño */}
        <Box>
          <Typography fontSize={12} fontWeight={600} mb={0.5} color="#374151">Tamaño</Typography>
          <ToggleButtonGroup value={modulo.tamano} exclusive size="small" fullWidth
            onChange={(_, val) => val && update("tamano", val)}>
            {TAMANOS.map((t) => (
              <ToggleButton key={t} value={t}
                sx={{ fontSize:11, fontWeight:600,
                  "&.Mui-selected":{ bgcolor:"#1a1a2e", color:"white", "&:hover":{ bgcolor:"#2d2d5e" } } }}>
                {t}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Divider />

        {/* NUEVA SECCIÓN: Maquetación (layout_type) */}
        <Box>
          <Typography fontSize={12} fontWeight={600} mb={1} color="#374151">Maquetación</Typography>
          <ToggleButtonGroup
            value={modulo.layout_type || 'auto'}
            exclusive
            onChange={(_, val) => val && update("layout_type", val)}
            size="small"
            fullWidth
          >
            <ToggleButton value="auto" sx={{ "&.Mui-selected":{ bgcolor:"#1a1a2e", color:"white", "&:hover":{ bgcolor:"#2d2d5e" } } }}>
              <Tooltip title="Automático (según tamaño)">
                <Box display="flex" flexDirection="column" alignItems="center">
                  <AutoAwesomeIcon fontSize="small" />
                  <Typography fontSize={9} mt={0.3}>Auto</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>

            <ToggleButton value="vertical" sx={{ "&.Mui-selected":{ bgcolor:"#1a1a2e", color:"white", "&:hover":{ bgcolor:"#2d2d5e" } } }}>
              <Tooltip title="Vertical (Imagen arriba)">
                <Box display="flex" flexDirection="column" alignItems="center">
                  <ViewStreamIcon fontSize="small" />
                  <Typography fontSize={9} mt={0.3}>Vertical</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>

            <ToggleButton value="horizontal" sx={{ "&.Mui-selected":{ bgcolor:"#1a1a2e", color:"white", "&:hover":{ bgcolor:"#2d2d5e" } } }}>
              <Tooltip title="Horizontal (Imagen izquierda)">
                <Box display="flex" flexDirection="column" alignItems="center">
                  <ViewColumnIcon fontSize="small" />
                  <Typography fontSize={9} mt={0.3}>Horizontal</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider />

        {/* Info producto — SKU read-only, nombre y desc editables */}
        <TextField label="SKU" value={modulo.productos?.sku || ""} size="small" fullWidth disabled
          InputProps={{ endAdornment: <InputAdornment position="end"><Typography fontSize={10} color="text.disabled">DB</Typography></InputAdornment> }} />

        {/* Nombre editable con botón reset */}
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography fontSize={12} fontWeight={600} color="#374151">Nombre</Typography>
            {modulo.nombre_override != null && (
              <Tooltip title="Restaurar nombre original">
                <IconButton size="small" onClick={resetNombre} sx={{ p:0.3, color:"#9ca3af" }}>
                  <RestartAltIcon fontSize="small"/>
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <TextField
            value={nombreActual}
            onChange={(e) => update("nombre_override", e.target.value)}
            size="small" fullWidth
            placeholder="Nombre del producto"
            helperText={modulo.nombre_override != null ? "Personalizado — el original no cambia" : ""}
          />
        </Box>

        {/* Descripción editable con botón reset */}
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography fontSize={12} fontWeight={600} color="#374151">Descripción</Typography>
            {modulo.descripcion_override != null && (
              <Tooltip title="Restaurar descripción original">
                <IconButton size="small" onClick={resetDesc} sx={{ p:0.3, color:"#9ca3af" }}>
                  <RestartAltIcon fontSize="small"/>
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <TextField
            value={descActual}
            onChange={(e) => update("descripcion_override", e.target.value)}
            size="small" fullWidth multiline rows={2}
            placeholder="Descripción del producto"
            helperText={modulo.descripcion_override != null ? "Personalizado — el original no cambia" : ""}
          />
        </Box>

        <Divider />

        {/* Precio */}
        <FormControl size="small" fullWidth>
          <InputLabel>Tipo de precio</InputLabel>
          <Select value={modulo.tipo_precio || "regular"} label="Tipo de precio"
            onChange={(e) => update("tipo_precio", e.target.value)}>
            {TIPOS_PRECIO.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField label="Precio" type="number" value={modulo.precio || ""}
          onChange={(e) => update("precio", e.target.value ? Number(e.target.value) : null)}
          size="small" fullWidth
          InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon fontSize="small"/></InputAdornment> }} />

        <Divider />

        {/* Estilo visual */}
        <FormControl size="small" fullWidth>
          <InputLabel>Borde</InputLabel>
          <Select value={modulo.estilo_borde || "none"} label="Borde"
            onChange={(e) => update("estilo_borde", e.target.value)}>
            {ESTILOS_BORDE.map((b) => (
              <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>Fondo</InputLabel>
          <Select value={modulo.fondo_modulo || "white"} label="Fondo del módulo"
            onChange={(e) => update("fondo_modulo", e.target.value)}>
            {FONDOS_MODULO.map((f) => (
              <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider />   

      </Box>
    </Box>
  );
}