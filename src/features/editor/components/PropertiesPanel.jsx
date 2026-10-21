import { useState } from "react";
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputAdornment, Tooltip, IconButton, Button, Paper, Tabs, Tab } from "@mui/material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckIcon from "@mui/icons-material/Check";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import TouchAppOutlinedIcon from "@mui/icons-material/TouchAppOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import { useEditor } from "../context/EditorContext";
import { TIPOS_PRECIO } from "../../../config/editorTheme";
import FieldLabel from "../../../components/ui/FieldLabel";
import SegmentedControl from "../../../components/ui/SegmentedControl";
import EmptyState from "../../../components/ui/EmptyState";
import { layout, radius, semantic } from "../../../theme/tokens";

// Caja con borde que agrupa un conjunto de campos. tone: neutral | primary | success
function PanelCard({ tone = "neutral", children, sx }) {
  const tones = {
    neutral: { bgcolor: "neutral.50", borderColor: "divider", borderStyle: "solid" },
    primary: { bgcolor: "brandTint", borderColor: "primary.main", borderStyle: "dashed" },
    success: { bgcolor: "success.light", borderColor: semantic.success.border, borderStyle: "solid" },
  };
  return (
    <Box sx={{ border: "1px", borderRadius: radius.lg, p: 1.5, display: "flex", flexDirection: "column", gap: 1.25, ...tones[tone], ...sx }}>
      {children}
    </Box>
  );
}

// Campo de texto que se muestra como texto y se edita al hacer clic (Enter guarda, Esc cancela).
function EditableField({ label, value, placeholder, onSave, strong = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const start = () => {
    setDraft(value);
    setEditing(true);
  };

  const save = () => {
    setEditing(false);
    if (draft.trim() !== value.trim()) onSave(draft.trim() || null);
  };

  return (
    <PanelCard sx={{ gap: 0.5, "&:hover": { borderColor: "neutral.300" } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <FieldLabel sx={{ mb: 0 }}>{label}</FieldLabel>
        <Tooltip title={editing ? "Guardar" : `Editar ${label.toLowerCase()}`}>
          <IconButton
            size="small"
            aria-label={editing ? "Guardar" : `Editar ${label.toLowerCase()}`}
            onClick={() => (editing ? save() : start())}
            sx={{ p: 0.5, color: "primary.main", bgcolor: editing ? "brandTint" : "transparent" }}
          >
            {editing ? <CheckIcon sx={{ fontSize: 16 }} /> : <EditOutlinedIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>
      </Box>

      {editing ? (
        <TextField
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              save();
            }
            if (e.key === "Escape") setEditing(false);
          }}
          fullWidth
          multiline
          autoFocus
        />
      ) : (
        <Typography
          fontSize={14}
          fontWeight={strong ? 600 : 400}
          color={value ? "text.primary" : "text.disabled"}
          onClick={start}
          sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap", cursor: "text", fontStyle: value ? "normal" : "italic" }}
        >
          {value || placeholder}
        </Typography>
      )}
    </PanelCard>
  );
}

// El padre monta este panel con key={id del módulo}: al cambiar de módulo arranca limpio.
export default function PropertiesPanel({ modulo, onUpdate, onDuplicate }) {
  const { grid, onUploadImagen } = useEditor();
  const [panelView, setPanelView] = useState("producto");

  const handleUpdateField = (campo, valor) => {
    if (!modulo) return;
    onUpdate(modulo.id, { [campo]: valor });
  };

  const handleResetOverrides = () => {
    if (!modulo) return;
    onUpdate(modulo.id, { nombre_override: null, descripcion_override: null, img_override: null, es_promo_3x1: false });
  };

  const handleResetPositions = () => {
    if (!modulo) return;
    onUpdate(modulo.id, { pos_imagen: null, pos_texto: null, pos_precio: null });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !modulo) return;
    onUploadImagen(modulo.id, file);
  };

  const handleRemovePromoImage = () => {
    if (!modulo) return;
    onUpdate(modulo.id, { img_override: null, es_promo_3x1: false });
  };

  const es3x1 = modulo?.colSpan === 3 || modulo?.formato === "footer";
  const fondoValor = modulo?.fondo_modulo === "rojo" ? "red" : modulo?.fondo_modulo || "empty";
  const nombre = modulo?.nombre_override ?? modulo?.productos?.nombre ?? "";
  const descripcion = modulo?.descripcion_override ?? modulo?.productos?.descripcion ?? "";

  const sinSeleccion = (
    <EmptyState
      compact
      icon={TouchAppOutlinedIcon}
      title="Seleccioná un módulo"
      description="Hacé clic en un producto del folleto (o de la lista) para editarlo."
    />
  );

  return (
    <Paper
      component="aside"
      elevation={0}
      sx={{ width: layout.propertiesWidth, display: "flex", flexDirection: "column", borderLeft: "1px solid", borderColor: "divider", borderRadius: 0, flexShrink: 0 }}
    >
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", px: 1 }}>
        <Tabs value={panelView} onChange={(_, v) => setPanelView(v)} variant="fullWidth" aria-label="Propiedades de" sx={{ minHeight: 44 }}>
          <Tab value="producto" label="Producto" />
          <Tab value="modulo" label="Módulo" />
          <Tab value="pagina" label="Página" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* ---------- PRODUCTO ---------- */}
        {panelView === "producto" &&
          (!modulo ? (
            sinSeleccion
          ) : (
            <>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography fontWeight={700} fontSize={15}>
                  Datos del producto
                </Typography>
                <Box display="flex" gap={0.5}>
                  <Tooltip title="Duplicar módulo (Ctrl+D)">
                    <IconButton size="small" aria-label="Duplicar módulo" onClick={() => onDuplicate && onDuplicate(modulo)}>
                      <ContentCopyOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Restablecer textos e imagen originales">
                    <IconButton size="small" aria-label="Restablecer originales" onClick={handleResetOverrides}>
                      <RestartAltIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {es3x1 && (
                <PanelCard tone="primary">
                  <Box display="flex" alignItems="center" gap={1}>
                    <ImageOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                    <Typography fontSize={13} fontWeight={700} color="primary.main">
                      Banner / promo 3x1
                    </Typography>
                  </Box>
                  <Button variant="contained" component="label" size="small" startIcon={<CloudUploadOutlinedIcon />}>
                    Subir imagen completa
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </Button>
                  {modulo.img_override && (
                    <Button variant="outlined" color="error" size="small" startIcon={<DeleteOutlineIcon />} onClick={handleRemovePromoImage}>
                      Quitar banner
                    </Button>
                  )}
                </PanelCard>
              )}

              <EditableField
                label="Nombre"
                value={nombre}
                placeholder="Sin nombre…"
                strong
                onSave={(v) => handleUpdateField("nombre_override", v)}
              />
              <EditableField
                label="Descripción"
                value={descripcion}
                placeholder="Sin descripción…"
                onSave={(v) => handleUpdateField("descripcion_override", v)}
              />

              <PanelCard>
                <Box>
                  <FieldLabel>Tipo de oferta</FieldLabel>
                  <FormControl fullWidth>
                    <Select
                      value={modulo.tipo_precio || "regular"}
                      onChange={(e) => handleUpdateField("tipo_precio", e.target.value)}
                      inputProps={{ "aria-label": "Tipo de oferta" }}
                    >
                      {TIPOS_PRECIO.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FieldLabel>Precio público</FieldLabel>
                  <TextField
                    type="number"
                    value={modulo.precio ?? ""}
                    onChange={(e) => handleUpdateField("precio", e.target.value ? Number(e.target.value) : null)}
                    fullWidth
                    inputProps={{ "aria-label": "Precio público", min: 0, step: "any" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography fontWeight={700} color="primary.main" fontSize={14}>
                            $
                          </Typography>
                        </InputAdornment>
                      ),
                      sx: { fontWeight: 700 },
                    }}
                  />
                </Box>
              </PanelCard>

              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box>
                  <FieldLabel>Borde</FieldLabel>
                  <SegmentedControl
                    value={modulo.estilo_borde || "none"}
                    onChange={(val) => handleUpdateField("estilo_borde", val)}
                    options={[
                      { value: "none", label: "Sin borde" },
                      { value: "thick", label: "Con borde" },
                    ]}
                  />
                </Box>
                <Box>
                  <FieldLabel>Fondo</FieldLabel>
                  <SegmentedControl
                    value={fondoValor}
                    onChange={(val) => handleUpdateField("fondo_modulo", val)}
                    options={[
                      { value: "empty", label: "Sin fondo" },
                      { value: "red", label: "Con fondo" },
                    ]}
                  />
                </Box>
              </Box>
            </>
          ))}

        {/* ---------- MÓDULO ---------- */}
        {panelView === "modulo" &&
          (!modulo ? (
            sinSeleccion
          ) : (
            <>
              <PanelCard tone="success">
                <Box display="flex" alignItems="center" gap={1}>
                  <OpenWithIcon sx={{ color: "success.dark", fontSize: 20 }} />
                  <Typography fontSize={14} fontWeight={700} color="success.dark">
                    Edición libre
                  </Typography>
                </Box>
                <Typography fontSize={12} color="text.secondary" lineHeight={1.4}>
                  Activala para mover la imagen, el texto y el precio dentro de este módulo. Apagala para volver a arrastrar la tarjeta en la grilla.
                </Typography>

                <SegmentedControl
                  tone="success"
                  value={modulo.edicion_libre ? "on" : "off"}
                  onChange={(val) => handleUpdateField("edicion_libre", val === "on")}
                  options={[
                    { value: "off", label: "Bloqueado" },
                    { value: "on", label: "Mover elementos" },
                  ]}
                />

                {modulo.edicion_libre && (
                  <Box display="flex" gap={1}>
                    <Button fullWidth variant="contained" color="success" size="small" onClick={() => handleUpdateField("edicion_libre", false)}>
                      Terminar edición
                    </Button>
                    <Button variant="outlined" size="small" onClick={handleResetPositions} sx={{ bgcolor: "background.paper", flexShrink: 0 }}>
                      Resetear
                    </Button>
                  </Box>
                )}
              </PanelCard>

              <Box>
                <FieldLabel>
                  Tamaño en la grilla ({grid.cols}×{grid.rows})
                </FieldLabel>
                <FormControl fullWidth>
                  <Select
                    value={modulo.formato === "footer" ? "footer" : `${modulo.colSpan || 1}x${modulo.rowSpan || 1}`}
                    inputProps={{ "aria-label": "Tamaño del bloque" }}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "footer") {
                        onUpdate(modulo.id, { colSpan: grid.cols, rowSpan: 1, formato: "footer" });
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
                    <MenuItem value="1x1">1×1 (Normal)</MenuItem>
                    {grid.cols >= 2 && <MenuItem value="2x1">2×1 (Horizontal)</MenuItem>}
                    {grid.rows >= 2 && <MenuItem value="1x2">1×2 (Vertical)</MenuItem>}
                    <MenuItem value="footer">{grid.cols}×1 (Pie de página)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </>
          ))}

        {/* ---------- PÁGINA ---------- */}
        {panelView === "pagina" && (
          <EmptyState
            compact
            icon={ArticleOutlinedIcon}
            title="Configuración de la página"
            description="Pronto vas a poder ajustar el tamaño y el diseño de cada página desde acá."
          />
        )}
      </Box>
    </Paper>
  );
}
