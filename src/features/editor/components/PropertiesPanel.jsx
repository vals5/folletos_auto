import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Tooltip,
  IconButton,
  Button,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ArticleIcon from "@mui/icons-material/Article";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import SaveIcon from "@mui/icons-material/Save";

import { useEditor } from "../context/EditorContext";
import { TIPOS_PRECIO } from "../../../config/editorTheme";

const textosIniciales = (modulo) => ({
  nombre: modulo?.nombre_override ?? modulo?.productos?.nombre ?? "",
  descripcion: modulo?.descripcion_override ?? modulo?.productos?.descripcion ?? "",
});

// El padre monta este panel con key={id del módulo}: al cambiar de módulo arranca con sus datos.
export default function PropertiesPanel({ modulo, onUpdate, onDuplicate }) {
  const { grid, onUploadImagen } = useEditor();
  const inicial = textosIniciales(modulo);
  const [panelView, setPanelView] = useState("modulo");
  const [nombre, setNombre] = useState(inicial.nombre);
  const [descripcion, setDescripcion] = useState(inicial.descripcion);

  const [isEditingNombre, setIsEditingNombre] = useState(false);
  const [isEditingDescripcion, setIsEditingDescripcion] = useState(false);

  const handleUpdateField = (campo, valor) => {
    if (!modulo) return;
    onUpdate(modulo.id, { [campo]: valor });
  };

  const handleSaveNombre = () => {
    handleUpdateField("nombre_override", nombre.trim() || null);
    setIsEditingNombre(false);
  };

  const handleSaveDescripcion = () => {
    handleUpdateField("descripcion_override", descripcion.trim() || null);
    setIsEditingDescripcion(false);
  };

  const handleResetOverrides = () => {
    if (!modulo) return;
    onUpdate(modulo.id, {
      nombre_override: null,
      descripcion_override: null,
      img_override: null,
      es_promo_3x1: false,
    });
    const origNombre = modulo.productos?.nombre ?? "";
    const origDesc = modulo.productos?.descripcion ?? "";
    setNombre(origNombre);
    setDescripcion(origDesc);
    setIsEditingNombre(false);
    setIsEditingDescripcion(false);
  };

  const handleResetPositions = () => {
    if (!modulo) return;
    onUpdate(modulo.id, {
      pos_imagen: null,
      pos_texto: null,
      pos_precio: null,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !modulo) return;
    onUploadImagen(modulo.id, file);
  };

  const handleRemovePromoImage = () => {
    if (!modulo) return;
    onUpdate(modulo.id, {
      img_override: null,
      es_promo_3x1: false,
    });
  };

  const es3x1 = modulo?.colSpan === 3 || modulo?.formato === "footer";
  const fondoValor = modulo?.fondo_modulo === "rojo" ? "red" : modulo?.fondo_modulo || "empty";

  return (
    <Paper
      elevation={0}
      sx={{
        width: 300,
        bgcolor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid #e2e8f0",
        p: 2,
        gap: 2,
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      {/* Selector superior "Propiedades de" */}
      <FormControl fullWidth size="small">
        <InputLabel sx={{ fontSize: 13, color: "#0284c7", fontWeight: 600 }}>Propiedades de</InputLabel>
        <Select
          value={panelView}
          onChange={(e) => setPanelView(e.target.value)}
          label="Propiedades de"
          sx={{
            borderRadius: "14px",
            fontSize: 13,
            fontWeight: 700,
            color: "#0369a1",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#bae6fd" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#0284c7" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0284c7" },
          }}
          startAdornment={
            <InputAdornment position="start">
              {panelView === "modulo" && <ViewModuleIcon sx={{ color: "#0284c7", fontSize: 18 }} />}
              {panelView === "producto" && <ShoppingCartOutlinedIcon sx={{ color: "#0284c7", fontSize: 18 }} />}
              {panelView === "pagina" && <ArticleIcon sx={{ color: "#0284c7", fontSize: 18 }} />}
            </InputAdornment>
          }
        >
          <MenuItem value="producto">Producto</MenuItem>
          <MenuItem value="modulo">Módulo</MenuItem>
          <MenuItem value="pagina">Página</MenuItem>
        </Select>
      </FormControl>

      {/* VISTA MÓDULO / EDITAR MÓDULO */}
      {panelView === "modulo" && (
        <>
          {!modulo ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height={200}
              color="#94a3b8"
              textAlign="center"
            >
              <Typography fontSize={13}>Seleccioná un producto para editar el módulo.</Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {/* SECCIÓN MODO EDICIÓN LIBRE */}
              <Box
                display="flex"
                flexDirection="column"
                gap={1.5}
                p={2}
                bgcolor="#f0fdf4"
                borderRadius="14px"
                border="1px dashed #22c55e"
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <OpenWithIcon sx={{ color: "#16a34a", fontSize: 20 }} />
                  <Typography fontSize={13} fontWeight={700} color="#166534">
                    Edición Libre de Elementos
                  </Typography>
                </Box>

                <Typography fontSize={11} color="#15803d" lineHeight={1.3}>
                  Activá esta opción para mover libremente la imagen, el texto y el precio dentro de este módulo.
                  Apagalo para volver a arrastrar la tarjeta en la grilla.
                </Typography>

                <ToggleButtonGroup
                  value={modulo.edicion_libre ? "on" : "off"}
                  exclusive
                  onChange={(_, val) => val !== null && handleUpdateField("edicion_libre", val === "on")}
                  fullWidth
                  size="small"
                  sx={{
                    bgcolor: "white",
                    p: "3px",
                    borderRadius: "20px",
                    border: "1px solid #bbf7d0",
                    "& .MuiToggleButton-root": {
                      border: "none",
                      borderRadius: "16px !important",
                      py: 0.5,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "none",
                      color: "#64748b",
                      "&.Mui-selected": {
                        bgcolor: "#22c55e",
                        color: "white",
                        boxShadow: "0 2px 6px rgba(34, 197, 94, 0.3)",
                        "&:hover": { bgcolor: "#16a34a" },
                      },
                    },
                  }}
                >
                  <ToggleButton value="off">Bloqueado (Grilla)</ToggleButton>
                  <ToggleButton value="on">Activar Mover</ToggleButton>
                </ToggleButtonGroup>

                {modulo.edicion_libre && (
                  <Box display="flex" gap={1} mt={0.5}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<SaveIcon />}
                      onClick={() => handleUpdateField("edicion_libre", false)}
                      sx={{
                        bgcolor: "#16a34a",
                        "&:hover": { bgcolor: "#15803d" },
                        fontSize: 11,
                        textTransform: "none",
                        borderRadius: "8px",
                      }}
                    >
                      Terminar edición
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      onClick={handleResetPositions}
                      sx={{
                        fontSize: 11,
                        textTransform: "none",
                        borderRadius: "8px",
                        borderColor: "#86efac",
                        color: "#166534",
                      }}
                    >
                      Resetear
                    </Button>
                  </Box>
                )}
              </Box>

              {/* TAMAÑO Y FORMATO DE GRILLA */}
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography fontSize={13} fontWeight={700} color="#0f172a">
                  Formato en grilla ({grid.cols}x{grid.rows})
                </Typography>

                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: 12 }}>Tamaño del bloque</InputLabel>
                  <Select
                    value={modulo.formato === "footer" ? "footer" : `${modulo.colSpan || 1}x${modulo.rowSpan || 1}`}
                    label="Tamaño del bloque"
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
                    sx={{ borderRadius: "10px", fontSize: 13 }}
                  >
                    <MenuItem value="1x1">1x1 (Normal)</MenuItem>
                    {grid.cols >= 2 && <MenuItem value="2x1">2x1 (Horizontal)</MenuItem>}
                    {grid.rows >= 2 && <MenuItem value="1x2">1x2 (Vertical)</MenuItem>}
                    <MenuItem value="footer">{grid.cols}x1 (Pie de página)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* VISTA PRODUCTO */}
      {panelView === "producto" && (
        <>
          {!modulo ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height={200}
              color="#94a3b8"
              textAlign="center"
            >
              <Typography fontSize={13}>Seleccioná un producto en el canvas para ver sus propiedades.</Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography fontSize={14} fontWeight={800} color="#64748b">
                  DATOS DEL PRODUCTO
                </Typography>
                <Box display="flex" gap={0.5}>
                  <Tooltip title="Duplicar">
                    <IconButton
                      size="small"
                      onClick={() => onDuplicate && onDuplicate(modulo)}
                      sx={{
                        color: "#10b981",
                        bgcolor: "#ecfdf5",
                        borderRadius: "10px",
                        "&:hover": { bgcolor: "#d1fae5" },
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Restablecer originales">
                    <IconButton
                      size="small"
                      onClick={handleResetOverrides}
                      sx={{
                        color: "#64748b",
                        bgcolor: "#f8fafc",
                        borderRadius: "10px",
                        "&:hover": { bgcolor: "#f1f5f9" },
                      }}
                    >
                      <RestartAltIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Banner / Promo 3x1 */}
              {es3x1 && (
                <Box
                  bgcolor="#f0f9ff"
                  border="1px dashed #0284c7"
                  p={1.5}
                  borderRadius="14px"
                  display="flex"
                  flexDirection="column"
                  gap={1}
                >
                  <Typography fontSize={12} fontWeight={700} color="#0369a1">
                    🖼️ Banner / Promo 3x1
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    size="small"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      bgcolor: "#0284c7",
                      "&:hover": { bgcolor: "#0369a1" },
                      textTransform: "none",
                      fontSize: 12,
                      borderRadius: "10px",
                    }}
                  >
                    Subir Imagen Completa
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </Button>
                  {modulo.img_override && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemovePromoImage}
                      sx={{ textTransform: "none", fontSize: 12, borderRadius: "10px" }}
                    >
                      Quitar Banner Promo
                    </Button>
                  )}
                </Box>
              )}

              {/* CAMPO NOMBRE */}
              <Box
                sx={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  p: 1.5,
                  bgcolor: "#f8fafc",
                  transition: "all 0.2s ease",
                  "&:hover": { borderColor: "#cbd5e1" },
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={isEditingNombre ? 1 : 0.5}>
                  <Typography fontSize={11} fontWeight={700} color="#64748b" textTransform="uppercase">
                    NOMBRE
                  </Typography>
                  <Tooltip title={isEditingNombre ? "Guardar" : "Editar nombre"}>
                    <IconButton
                      size="small"
                      onClick={() => (isEditingNombre ? handleSaveNombre() : setIsEditingNombre(true))}
                      sx={{
                        color: "#0284c7",
                        bgcolor: isEditingNombre ? "#e0f2fe" : "transparent",
                        p: 0.5,
                        borderRadius: "8px",
                      }}
                    >
                      {isEditingNombre ? <CheckIcon sx={{ fontSize: 16 }} /> : <EditIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Tooltip>
                </Box>

                {isEditingNombre ? (
                  <TextField
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    onBlur={handleSaveNombre}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSaveNombre();
                      }
                    }}
                    size="small"
                    fullWidth
                    multiline
                    autoFocus
                    InputProps={{
                      sx: { borderRadius: "8px", fontSize: 13, bgcolor: "#ffffff" },
                    }}
                  />
                ) : (
                  <Typography
                    fontSize={13}
                    fontWeight={600}
                    color={nombre ? "#0f172a" : "#94a3b8"}
                    onClick={() => setIsEditingNombre(true)}
                    sx={{
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      cursor: "pointer",
                      fontStyle: nombre ? "normal" : "italic",
                    }}
                  >
                    {nombre || "Sin nombre..."}
                  </Typography>
                )}
              </Box>

              {/* CAMPO DESCRIPCIÓN */}
              <Box
                sx={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  p: 1.5,
                  bgcolor: "#f8fafc",
                  transition: "all 0.2s ease",
                  "&:hover": { borderColor: "#cbd5e1" },
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={isEditingDescripcion ? 1 : 0.5}
                >
                  <Typography fontSize={11} fontWeight={700} color="#64748b" textTransform="uppercase">
                    DESCRIPCIÓN
                  </Typography>
                  <Tooltip title={isEditingDescripcion ? "Guardar" : "Editar descripción"}>
                    <IconButton
                      size="small"
                      onClick={() => (isEditingDescripcion ? handleSaveDescripcion() : setIsEditingDescripcion(true))}
                      sx={{
                        color: "#0284c7",
                        bgcolor: isEditingDescripcion ? "#e0f2fe" : "transparent",
                        p: 0.5,
                        borderRadius: "8px",
                      }}
                    >
                      {isEditingDescripcion ? <CheckIcon sx={{ fontSize: 16 }} /> : <EditIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Tooltip>
                </Box>

                {isEditingDescripcion ? (
                  <TextField
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    onBlur={handleSaveDescripcion}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSaveDescripcion();
                      }
                    }}
                    size="small"
                    fullWidth
                    multiline
                    autoFocus
                    InputProps={{
                      sx: { borderRadius: "8px", fontSize: 13, bgcolor: "#ffffff" },
                    }}
                  />
                ) : (
                  <Typography
                    fontSize={13}
                    fontWeight={500}
                    color={descripcion ? "#334155" : "#94a3b8"}
                    onClick={() => setIsEditingDescripcion(true)}
                    sx={{
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      cursor: "pointer",
                      fontStyle: descripcion ? "normal" : "italic",
                    }}
                  >
                    {descripcion || "Sin descripción..."}
                  </Typography>
                )}
              </Box>

              {/* TIPO DE OFERTA Y PRECIO */}
              <Box
                sx={{
                  bgcolor: "#f8fafc",
                  p: 1.5,
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Box display="flex" flexDirection="column" gap={0.5}>
                  <Typography fontSize={11} fontWeight={700} color="#64748b" textTransform="uppercase">
                    TIPO DE OFERTA
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={modulo.tipo_precio || "regular"}
                      onChange={(e) => handleUpdateField("tipo_precio", e.target.value)}
                      sx={{ borderRadius: "10px", fontSize: 13, bgcolor: "white" }}
                    >
                      {TIPOS_PRECIO.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box display="flex" flexDirection="column" gap={0.5}>
                  <Typography fontSize={11} fontWeight={700} color="#64748b" textTransform="uppercase">
                    PRECIO PÚBLICO
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={modulo.precio ?? ""}
                    onChange={(e) => handleUpdateField("precio", e.target.value ? Number(e.target.value) : null)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography fontWeight={700} color="#0284c7" fontSize={14}>
                            $
                          </Typography>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: "10px", fontSize: 13, fontWeight: 700, bgcolor: "white" },
                    }}
                  />
                </Box>
              </Box>

              {/* BORDE Y FONDO */}
              <Box display="flex" flexDirection="column" gap={1.5} pt={0.5}>
                <Box>
                  <Typography fontSize={11} fontWeight={700} color="#64748b" textTransform="uppercase" mb={0.5}>
                    BORDE
                  </Typography>
                  <ToggleButtonGroup
                    value={modulo.estilo_borde || "none"}
                    exclusive
                    onChange={(_, val) => val !== null && handleUpdateField("estilo_borde", val)}
                    fullWidth
                    size="small"
                    sx={{
                      bgcolor: "#f1f5f9",
                      p: "3px",
                      borderRadius: "20px",
                      border: "none",
                      "& .MuiToggleButton-root": {
                        border: "none",
                        borderRadius: "16px !important",
                        py: 0.5,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "none",
                        color: "#64748b",
                        "&.Mui-selected": {
                          bgcolor: "#0284c7",
                          color: "white",
                          boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)",
                          "&:hover": { bgcolor: "#0369a1" },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="none">Sin borde</ToggleButton>
                    <ToggleButton value="thick">Con borde</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box>
                  <Typography fontSize={11} fontWeight={700} color="#64748b" textTransform="uppercase" mb={0.5}>
                    FONDO
                  </Typography>
                  <ToggleButtonGroup
                    value={fondoValor}
                    exclusive
                    onChange={(_, val) => val !== null && handleUpdateField("fondo_modulo", val)}
                    fullWidth
                    size="small"
                    sx={{
                      bgcolor: "#f1f5f9",
                      p: "3px",
                      borderRadius: "20px",
                      border: "none",
                      "& .MuiToggleButton-root": {
                        border: "none",
                        borderRadius: "16px !important",
                        py: 0.5,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "none",
                        color: "#64748b",
                        "&.Mui-selected": {
                          bgcolor: "#0284c7",
                          color: "white",
                          boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)",
                          "&:hover": { bgcolor: "#0369a1" },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="empty">Sin fondo</ToggleButton>
                    <ToggleButton value="red">Con fondo</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* VISTA PÁGINA */}
      {panelView === "pagina" && (
        <Box textAlign="center" py={4} color="#64748b">
          <Typography variant="subtitle2" fontWeight={700} mb={1} color="#0f172a">
            Configuración de la página
          </Typography>
          <Typography fontSize={12}>Ajustes de resolución y diseño de página.</Typography>
        </Box>
      )}
    </Paper>
  );
}
