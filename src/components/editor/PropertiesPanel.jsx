import { useState, useEffect } from "react";
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Divider, InputAdornment, Tooltip, IconButton } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const TIPOS_PRECIO = [
  { value: "regular", label: "Precio regular" },
  { value: "llevando3", label: "Llevando 2" },
  { value: "vea_ahorro", label: "Vea Ahorro" },
  { value: "regular_cencosud", label: "Regular Cencosud" },
];
const ESTILOS_BORDE = [{ value: "none", label: "Sin borde" }, { value: "thick", label: "Rojo" }];
const FONDOS_MODULO = [{ value: "red", label: "Rojo" }, { value: "empty", label: "Sin fondo" }];

export default function PropertiesPanel({ modulo, onUpdate, onDuplicate }) {
  const [panelView, setPanelView] = useState("producto");

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (modulo) {
      setNombre(modulo.nombre_override ?? modulo.productos?.nombre ?? "");
      setDescripcion(modulo.descripcion_override ?? modulo.productos?.descripcion ?? "");
    }
  }, [modulo]);

  const handleUpdateField = (campo, valor) => {
    if (!modulo) return;
    onUpdate(modulo.id, { [campo]: valor });
  };

  const handleResetOverrides = () => {
    if (!modulo) return;
    onUpdate(modulo.id, {
      nombre_override: null,
      descripcion_override: null,
    });
    setNombre(modulo.productos?.nombre ?? "");
    setDescripcion(modulo.productos?.descripcion ?? "");
  };

  return (
    <Box width={290} bgcolor="white" display="flex" flexDirection="column" sx={{ borderLeft: "1px solid #e5e7eb", p: 2, overflowY: "auto", flexShrink: 0 }}>
      
      <Box mb={2}>
        <FormControl size="small" fullWidth>
          <InputLabel id="select-view-label">Propiedades de:</InputLabel>
          <Select
            labelId="select-view-label"
            value={panelView}
            label="Propiedades de:"
            onChange={(e) => setPanelView(e.target.value)}
            sx={{ fontWeight: 600 }}
          >
            <MenuItem value="producto">🛒 Producto</MenuItem>
            <MenuItem value="modulo">🔲 Módulo</MenuItem>
            <MenuItem value="pagina">📄 Página</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* --- VISTA: PRODUCTO --- */}
      {panelView === "producto" && (
        <>
          {!modulo ? (
            <Box display="flex" alignItems="center" justifyContent="center" height="60%" color="text.secondary" p={2} textAlign="center">
              <Typography variant="body2">Seleccioná un producto en el canvas para ver sus propiedades.</Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2.5}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e">Datos del Producto</Typography>
                <Box display="flex" gap={0.5}>
                  <Tooltip title="Duplicar">
                    <IconButton size="small" onClick={() => onDuplicate(modulo)} sx={{ color: "#10b981" }}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Restablecer originales">
                    <IconButton size="small" onClick={handleResetOverrides} sx={{ color: "#6b7280" }}>
                      <RestartAltIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <TextField label="Nombre Comercial" value={nombre} onChange={(e) => setNombre(e.target.value)} onBlur={() => handleUpdateField("nombre_override", nombre.trim() || null)} size="small" fullWidth multiline rows={2} />
              <TextField label="Descripción / Contenido" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} onBlur={() => handleUpdateField("descripcion_override", descripcion.trim() || null)} size="small" fullWidth multiline rows={2} />

              <Box display="flex" flexDirection="column" gap={2} bgcolor="#f9fafb" p={1.5} borderRadius="8px" sx={{ border: "1px solid #f3f4f6" }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Tipo de oferta</InputLabel>
                  <Select value={modulo.tipo_precio || "regular"} label="Tipo de oferta" onChange={(e) => handleUpdateField("tipo_precio", e.target.value)}>
                    {TIPOS_PRECIO.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                  </Select>
                </FormControl>

                <TextField label="Precio Público" type="number" value={modulo.precio ?? ""} onChange={(e) => handleUpdateField("precio", e.target.value ? Number(e.target.value) : null)} size="small" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon fontSize="small" /></InputAdornment> }} />
              </Box>

              <Divider />

              <Box display="flex" flexDirection="column" gap={2} mb={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Estilo del Borde</InputLabel>
                  <Select value={modulo.estilo_borde || "none"} label="Estilo del Borde" onChange={(e) => handleUpdateField("estilo_borde", e.target.value)}>
                    {ESTILOS_BORDE.map((b) => <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>)}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>Color de Fondo</InputLabel>
                  <Select 
                    value={modulo.fondo_modulo === "rojo" ? "red" : (modulo.fondo_modulo || "empty")} 
                    label="Color de Fondo" 
                    onChange={(e) => handleUpdateField("fondo_modulo", e.target.value)}
                  >
                    {FONDOS_MODULO.map((f) => <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* --- VISTA: MÓDULO --- */}
      {panelView === "modulo" && (
        <>
          {!modulo ? (
            <Box display="flex" alignItems="center" justifyContent="center" height="60%" color="text.secondary" p={2} textAlign="center">
              <Typography variant="body2">Seleccioná un producto en el canvas para configurar su tamaño.</Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2.5}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight={700} color="#1a1a2e">Formato en Grilla (3x4)</Typography>
              </Box>

              <FormControl size="small" fullWidth>
                <InputLabel>Tamaño del Bloque</InputLabel>
                <Select
                  value={modulo.formato === "footer" ? "footer" : `${modulo.colSpan || 1}x${modulo.rowSpan || 1}`}
                  label="Tamaño del Bloque"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "footer") {
                      onUpdate(modulo.id, { colSpan: 3, rowSpan: 1, formato: "footer" });
                    } else {
                      const [c, r] = val.split("x").map(Number);
                      if (modulo.formato === "footer") {
                        onUpdate(modulo.id, { colSpan: c, rowSpan: r, formato: "1_producto" });
                      } else {
                        onUpdate(modulo.id, { colSpan: c, rowSpan: r });
                      }
                    }
                  }}
                >
                  <MenuItem value="1x1">1x1 (Normal)</MenuItem>
                  <MenuItem value="2x1">2x1 (Horizontal)</MenuItem>
                  <MenuItem value="1x2">1x2 (Vertical)</MenuItem>
                  <MenuItem value="3x1">3x1 (Pie de página)</MenuItem>
                </Select>
              </FormControl>

              <Typography fontSize={11} color="text.secondary" sx={{ mt: -1 }}>
                Ajustá el formato para que este módulo ocupe más espacio horizontal o vertical.
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* --- VISTA: PÁGINA --- */}
      {panelView === "pagina" && (
        <Box textAlign="center" py={4} color="text.secondary">
          <Typography variant="subtitle2" fontWeight={600} mb={1}>Configuración de la Página</Typography>
          <Typography fontSize={12}>Por ahora vacío.</Typography>
        </Box>
      )}

    </Box>
  );
}