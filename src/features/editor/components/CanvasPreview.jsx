import { useState, useRef, useEffect } from "react";
import { Box, Typography, Chip, Tooltip, IconButton, Slider, Button, InputBase } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { useSensors, useSensor, PointerSensor, TouchSensor, MouseSensor } from "@dnd-kit/core";

import PaginaCanvas from "./CanvasPage";
import ExportButtons from "./ExportButtons";
import { useShortcuts } from "../hooks/useShortcuts";

const CAMPO_EDITABLE = "input, textarea, [contenteditable='true']";
const BTN_ROUND = { borderRadius: "20px", textTransform: "none", fontSize: 12 };
const ZOOM_MIN = 50;
const ZOOM_MAX = 250;

export default function CanvasPreview({
  flyer,
  paginas = [],
  modulosPorPagina = {},
  paginaActual,
  setPaginaActual,
  selectedModulo,
  onSelectModulo,
  onFlyerUpdate,
  onReorderModulos,
  onAddPagina,
  onRenamePagina,
  onDeletePagina,
  onDeleteModulo,
  onBack,
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const [zoom, setZoom] = useState(180);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const canvasEls = useRef([]); // elementos DOM de cada página (para exportar)

  // Se mide el contenido real para que el scroll respete el zoom (transform no cambia el layout).
  const contentRef = useRef(null);
  const [contentSize, setContentSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setContentSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, z + 10));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, z - 10));

  // Solo se registran los atajos implementados: el resto de las teclas conserva su función normal.
  useShortcuts({
    DELETE: selectedModulo
      ? () => {
          if (window.confirm("¿Eliminar el módulo seleccionado?")) onDeleteModulo(selectedModulo.id);
        }
      : undefined,
    DESELECT: () => onSelectModulo(null),
    ZOOM_IN: zoomIn,
    ZOOM_OUT: zoomOut,
    ZOOM_RESET: () => setZoom(100),
    ZOOM_TO_FIT: () => setZoom(180),
  });

  const nombreFolleto = flyer?.nombre || "Sin título";

  const startEditingTitle = (e) => {
    e.stopPropagation();
    setTitleDraft(flyer?.nombre || "");
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    const nuevo = titleDraft.trim();
    if (nuevo && nuevo !== flyer?.nombre) onFlyerUpdate("nombre", nuevo);
  };

  const handleCanvasContainerClick = (e) => {
    // Un clic dentro de un campo editable (legal, fechas, títulos) no debe cerrarlo.
    if (e.target.closest?.(CAMPO_EDITABLE)) return;
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
    onSelectModulo(null);
  };

  const scale = zoom / 100;

  return (
    <Box
      flex={1}
      bgcolor="#e5e7eb"
      display="flex"
      flexDirection="column"
      alignItems="center"
      overflow="hidden"
      onClick={handleCanvasContainerClick}
      sx={{ width: "100%", height: "100%", boxSizing: "border-box" }}
    >
      {/* BARRA SUPERIOR */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2.5}
        py={1}
        bgcolor="white"
        borderBottom="1px solid #e5e7eb"
        sx={{ width: "100%", zIndex: 20, flexShrink: 0, boxSizing: "border-box" }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Tooltip title="Volver al dashboard">
            <IconButton size="small" onClick={onBack} sx={{ color: "#0284c7", p: 0.5 }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {isEditingTitle ? (
            <InputBase
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              sx={{
                bgcolor: "#0284c7",
                color: "white",
                borderRadius: "20px",
                px: 1.5,
                py: 0.1,
                fontSize: 13,
                fontWeight: 700,
                input: { textAlign: "center", color: "white" },
              }}
            />
          ) : (
            <Tooltip title="Haz clic para editar el nombre del folleto">
              <Chip
                label={
                  <Box display="flex" alignItems="center" gap={0.6}>
                    <span>{nombreFolleto}</span>
                    <EditIcon sx={{ fontSize: "13px !important", color: "white !important" }} />
                  </Box>
                }
                size="small"
                onClick={startEditingTitle}
                sx={{
                  borderRadius: "20px",
                  fontWeight: 700,
                  fontSize: 13,
                  bgcolor: "#0284c7",
                  color: "white",
                  px: 0.8,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: "#0369a1" },
                }}
              />
            </Tooltip>
          )}
        </Box>

        {/* ZOOM Y EXPORTAR */}
        <Box display="flex" alignItems="center" gap={2}>
          <Box display="flex" alignItems="center" gap={1} bgcolor="#0284c7" borderRadius="20px" px={1.5} py={0.5} sx={{ minWidth: 180 }}>
            <Tooltip title="Alejar (Ctrl -)">
              <IconButton size="small" onClick={zoomOut}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Slider
              value={zoom}
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={5}
              onChange={(_, v) => setZoom(v)}
              size="small"
              sx={{ flex: 1, color: "white", "& .MuiSlider-thumb": { width: 14, height: 14 } }}
            />
            <Tooltip title="Acercar (Ctrl +)">
              <IconButton size="small" onClick={zoomIn}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography fontSize={11} color="white" sx={{ minWidth: 32, textAlign: "right" }}>
              {zoom}%
            </Typography>
          </Box>

          <ExportButtons flyer={flyer} paginas={paginas} getCanvasElements={() => canvasEls.current} />
        </Box>
      </Box>

      {/* ÁREA DEL EDITOR */}
      <Box sx={{ flex: 1, width: "100%", overflow: "auto", py: 3, boxSizing: "border-box" }}>
        {/* Caja del tamaño ya escalado + margin auto: el scroll llega a todos los bordes con cualquier zoom */}
        <Box
          sx={{
            width: contentSize.w ? contentSize.w * scale : "fit-content",
            height: contentSize.h ? contentSize.h * scale : "auto",
            mx: "auto",
          }}
        >
          <Box
            ref={contentRef}
            sx={{
              transformOrigin: "top left",
              transform: `scale(${scale})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "fit-content",
              transition: "transform 0.1s ease-out",
            }}
          >
            {paginas.length === 0 ? (
              <Box bgcolor="white" p={4} borderRadius="8px" textAlign="center" boxShadow="0 2px 10px rgba(0,0,0,0.05)">
                <Typography color="textSecondary" fontSize={14}>
                  No hay páginas en este folleto.
                </Typography>
              </Box>
            ) : (
              paginas.map((pag, idx) => (
                <PaginaCanvas
                  key={pag.id}
                  pag={pag}
                  pagIdx={idx}
                  isPaginaActiva={paginaActual === idx}
                  onSelectPagina={setPaginaActual}
                  onRenamePagina={onRenamePagina}
                  modulos={modulosPorPagina[idx] || []}
                  selectedModulo={selectedModulo}
                  onSelectModulo={onSelectModulo}
                  onDeletePagina={onDeletePagina}
                  canvasRef={(el) => {
                    canvasEls.current[idx] = el;
                  }}
                  totalPaginas={paginas.length}
                  sensors={sensors}
                  onReorderModulos={onReorderModulos}
                />
              ))
            )}

            <Box display="flex" justifyContent="center" mt={1} mb={4}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={onAddPagina}
                sx={{
                  ...BTN_ROUND,
                  borderColor: "#9ca3af",
                  color: "#374151",
                  bgcolor: "white",
                  "&:hover": { bgcolor: "#f9fafb" },
                  px: 3,
                }}
              >
                Agregar página
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
