import { useState, useRef, useEffect } from "react";
import { Box, Typography, Tooltip, IconButton, Slider, Button, InputBase, Divider } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import { useSensors, useSensor, PointerSensor, TouchSensor, MouseSensor } from "@dnd-kit/core";

import PaginaCanvas from "./CanvasPage";
import ExportButtons from "./ExportButtons";
import { useShortcuts } from "../hooks/useShortcuts";
import { layout } from "../../../theme/tokens";

const CAMPO_EDITABLE = "input, textarea, [contenteditable='true']";
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
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onCopy,
  onPaste,
  canPaste = false,
  onDuplicate,
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
    UNDO: onUndo,
    REDO: onRedo,
    COPY: selectedModulo ? onCopy : undefined,
    PASTE: canPaste ? onPaste : undefined,
    DUPLICATE: selectedModulo ? onDuplicate : undefined,
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
      bgcolor="workspace"
      display="flex"
      flexDirection="column"
      alignItems="center"
      overflow="hidden"
      onClick={handleCanvasContainerClick}
      sx={{ width: "100%", height: "100%", boxSizing: "border-box" }}
    >
      {/* BARRA SUPERIOR */}
      <Box
        component="header"
        onClick={(e) => e.stopPropagation()} // los botones de la barra no deben deseleccionar el módulo
        sx={{
          width: "100%",
          height: layout.toolbarHeight,
          minHeight: layout.toolbarHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 2,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          zIndex: 20,
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        <Box display="flex" alignItems="center" gap={0.5} minWidth={0}>
          <Tooltip title="Volver a folletos">
            <IconButton size="small" onClick={onBack} aria-label="Volver a folletos">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5 }} />

          {isEditingTitle ? (
            <InputBase
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              inputProps={{ "aria-label": "Nombre del folleto" }}
              sx={{
                fontSize: 15,
                fontWeight: 700,
                px: 1,
                borderRadius: "8px",
                border: "1.5px solid",
                borderColor: "primary.main",
                minWidth: 220,
              }}
            />
          ) : (
            <Tooltip title="Cambiar el nombre del folleto">
              <Button
                color="inherit"
                size="small"
                onClick={startEditingTitle}
                endIcon={<EditIcon sx={{ fontSize: "14px !important", color: "text.secondary" }} />}
                sx={{ fontWeight: 700, fontSize: 15, color: "text.primary", maxWidth: 320, justifyContent: "flex-start" }}
              >
                <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {nombreFolleto}
                </Box>
              </Button>
            </Tooltip>
          )}

          <Box display="flex" alignItems="center" ml={0.5}>
            <Tooltip title="Deshacer (Ctrl+Z)">
              <span>
                <IconButton size="small" onClick={onUndo} disabled={!canUndo} aria-label="Deshacer">
                  <UndoIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Rehacer (Ctrl+Shift+Z)">
              <span>
                <IconButton size="small" onClick={onRedo} disabled={!canRedo} aria-label="Rehacer">
                  <RedoIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {/* ZOOM Y EXPORTAR */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box display="flex" alignItems="center" gap={0.5} bgcolor="neutral.100" borderRadius="8px" px={0.5} py={0.25}>
            <Tooltip title="Alejar (Ctrl -)">
              <IconButton size="small" onClick={zoomOut} aria-label="Alejar">
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
              aria-label="Zoom"
              sx={{ width: 110, mx: 0.5, "& .MuiSlider-thumb": { width: 14, height: 14 } }}
            />
            <Tooltip title="Acercar (Ctrl +)">
              <IconButton size="small" onClick={zoomIn} aria-label="Acercar">
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom 100% (Shift+0)">
              <Button size="small" color="inherit" onClick={() => setZoom(100)} sx={{ minWidth: 52, px: 0.5, fontSize: 12, fontWeight: 700, color: "text.secondary" }}>
                {zoom}%
              </Button>
            </Tooltip>
          </Box>

          <ExportButtons flyer={flyer} paginas={paginas} getCanvasElements={() => canvasEls.current} onBeforeExport={() => onSelectModulo(null)} />
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
                <Typography color="text.secondary" fontSize={14}>
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
                sx={{ bgcolor: "background.paper", px: 3 }}
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
