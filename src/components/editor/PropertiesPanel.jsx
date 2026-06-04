import { useState, useEffect } from "react";
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Switch, Divider, InputAdornment, Button, ToggleButton, ToggleButtonGroup, Tooltip, IconButton, Autocomplete, CircularProgress, } from "@mui/material";
import AttachMoneyIcon  from "@mui/icons-material/AttachMoney";
import ImageIcon        from "@mui/icons-material/Image";
import ContentCopyIcon  from "@mui/icons-material/ContentCopy";
import AddCircleIcon    from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import RestartAltIcon   from "@mui/icons-material/RestartAlt";
import { supabase } from "../../services/supabase";

const TAMANOS = ["XS", "S", "M", "L", "XL"];

const TIPOS_PRECIO = [
  { value: "regular",          label: "Precio regular"   },
  { value: "llevando3",        label: "Llevando 2"       },
  { value: "vea_ahorro",       label: "Vea Ahorro"       },
  { value: "regular_cencosud", label: "Regular Cencosud" },
];

const ESTILOS_BORDE = [
  { value: "none",   label: "Sin borde"    },
  { value: "thick",  label: "Rojo"  },
];

const FONDOS_MODULO = [
  { value: "red",    label: "Rojo" },
  { value: "empty",  label: "Sin fondo"   },
];

function ProductosExtraSection({ modulo, onUpdate }) {
  const [catalogo, setCatalogo] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [fetched, setFetched]   = useState(false);

  const productosExtra = modulo.productos_extra || [];

  const loadCatalogo = async () => {
    if (fetched) return;
    setLoading(true);
    const { data } = await supabase.from("productos").select("id, nombre, sku, imagen_url").order("nombre");
    setCatalogo(data || []);
    setFetched(true);
    setLoading(false);
  };

  const saveExtra = (nuevoExtra) => onUpdate(modulo.id, { productos_extra: nuevoExtra });

  const agregarProducto = (producto) => {
    if (!producto || productosExtra.length >= 3) return;
    saveExtra([...productosExtra, { producto_id: producto.id, producto, imagen_url_override: null, precio: null }]);
  };

  const quitarProducto = (idx) => saveExtra(productosExtra.filter((_, i) => i !== idx));

  const updateExtra = (idx, field, value) =>
    saveExtra(productosExtra.map((pe, i) => i === idx ? { ...pe, [field]: value } : pe));

  return (
    <Box>
      <Typography fontSize={12} fontWeight={700} mb={1} color="#374151">Productos adicionales</Typography>
      <Typography fontSize={11} color="#6b7280" mb={1.5}>
        Hasta 3 extra. Se muestran lado a lado (2) o en grilla 2×2 (3-4).
      </Typography>
      {productosExtra.map((pe, idx) => (
        <Box key={idx} sx={{ bgcolor:"white", borderRadius:1.5, p:1.5, mb:1, border:"1px solid #e5e7eb" }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography fontSize={12} fontWeight={600} noWrap sx={{ maxWidth:200 }}>
              {pe.producto?.nombre || `Producto ${idx + 2}`}
            </Typography>
            <Tooltip title="Quitar">
              <IconButton size="small" onClick={() => quitarProducto(idx)} sx={{ color:"#ef4444", p:0.3 }}>
                <RemoveCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <TextField label={`Precio producto ${idx + 2}`} type="number"
            value={pe.precio || ""} size="small" fullWidth sx={{ mb:1 }}
            onChange={(e) => updateExtra(idx, "precio", e.target.value ? Number(e.target.value) : null)}
            InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon fontSize="small"/></InputAdornment> }} />
          <TextField label="Imagen override (URL)" value={pe.imagen_url_override || ""}
            onChange={(e) => updateExtra(idx, "imagen_url_override", e.target.value || null)}
            size="small" fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><ImageIcon fontSize="small"/></InputAdornment> }} />
        </Box>
      ))}
      {productosExtra.length < 3 && (
        <Box onClick={loadCatalogo}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={1}><CircularProgress size={18}/></Box>
          ) : (
            <Autocomplete options={catalogo} getOptionLabel={(o) => `${o.nombre} (${o.sku})`}
              onChange={(_, value) => agregarProducto(value)}
              value={null} blurOnSelect clearOnBlur size="small" noOptionsText="Sin resultados"
              renderInput={(params) => (
                <TextField {...params} label="Buscar y agregar producto" placeholder="Nombre o SKU…" size="small"
                  InputProps={{ ...params.InputProps,
                    startAdornment: (<><InputAdornment position="start"><AddCircleIcon fontSize="small" sx={{ color:"#10b981" }}/></InputAdornment>{params.InputProps.startAdornment}</>) }} />
              )} />
          )}
        </Box>
      )}
      {productosExtra.length >= 3 && (
        <Typography fontSize={11} color="#f59e0b" fontWeight={600}>Máximo 4 productos por módulo</Typography>
      )}
    </Box>
  );
}

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
          <Typography variant="caption" color="text.secondary" noWrap>
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

        <Box display="flex" alignItems="center" justifyContent="space-between"
          bgcolor="white" borderRadius={2} px={1.5} py={0.8} border="1px solid #e5e7eb">
          <Typography fontSize={13} fontWeight={500}>Precio Cencosud</Typography>
          <Switch checked={modulo.precio_cencosud || false} size="small"
            onChange={(e) => update("precio_cencosud", e.target.checked)} />
        </Box>

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

        {/* Imagen override */}
        <Box>
          <Typography fontSize={12} fontWeight={600} mb={0.5} color="#374151">Imagen del módulo</Typography>
          <TextField placeholder="URL alternativa de imagen"
            value={modulo.imagen_url_override || ""}
            onChange={(e) => update("imagen_url_override", e.target.value || null)}
            size="small" fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><ImageIcon fontSize="small"/></InputAdornment> }} />
          <Typography fontSize={11} color="text.secondary" mt={0.5}>
            Dejá vacío para usar la imagen del catálogo
          </Typography>
        </Box>

        {/* Texto libre */}
        <Box>
          <Typography fontSize={12} fontWeight={600} mb={0.5} color="#374151">Texto libre</Typography>
          <TextField placeholder="Ej: 2da unidad 50% off"
            value={modulo.texto_libre || ""}
            onChange={(e) => update("texto_libre", e.target.value || null)}
            size="small" fullWidth multiline rows={2} />
        </Box>

        <Divider />

        <ProductosExtraSection modulo={modulo} onUpdate={onUpdate} />

      </Box>
    </Box>
  );
}