import { useState, useRef } from "react";
import { Box, Typography, Chip, Tooltip, IconButton, Slider, Button } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import AddIcon from "@mui/icons-material/Add";
import { useSensors, useSensor, PointerSensor } from "@dnd-kit/core";

import PaginaCanvas from "./CanvasPage";
import ExportButtons from "./ExportButtons"; 

import ImprecLogo from "../../assets/img/Imprecionante.svg";
import VeaLogo from "../../assets/img/Vea.svg";
import TarjetaVea from "../../assets/img/Ahorro.svg";
import TarjetaCencosud from "../../assets/img/Ahorro.svg";

const DEFAULT_LOGOS = { izq: ImprecLogo, der: VeaLogo };
const TARJETA_LOGO = { vea_ahorro: TarjetaVea, regular_cencosud: TarjetaCencosud };

const GlobalFonts = () => (
  <style>{/* ... (Mismos estilos de fuentes que antes) ... */}</style>
);

const IMPREC = {
  // ... (Mismo objeto IMPREC)
};

const TAMANOS = ["XS", "S", "M", "L", "XL"];
const TAMANO_SIZE = { /* ... (Mismos tamaños) ... */ };
const TIPO_PRECIO_LABEL = { /* ... */ };
const FONDO_COLORS = { /* ... */ };
const BORDER_STYLES = { /* ... */ };
const BTN_ROUND = { borderRadius: "20px", textTransform: "none", fontSize: 12 };

export default function CanvasPreview({ flyer, plantilla, paginas = [], modulosPorPagina = {}, paginaActual, setPaginaActual, onUpdatePaginaName, selectedModulo, onSelectModulo, onFlyerUpdate, onReorderModulos, onAddPagina, onDeletePagina, onMenuAction, onResize }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [zoom, setZoom] = useState(180);

  const canvasRefs = useRef([]);
  if (canvasRefs.current.length !== paginas.length) {
    canvasRefs.current = paginas.map((_, i) => canvasRefs.current[i] || { current: null });
  }

  const scale = zoom / 100;

  return (
    <Box flex={1} bgcolor="#e5e7eb" display="flex" flexDirection="column" alignItems="center" overflow="auto" py={3} sx={{ width: "100%" }}>
      <GlobalFonts />

      {/* TOP TOOLBAR */}
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={3} px={4} flexWrap="wrap" sx={{ width: "100%", zIndex: 20 }}>
        
        {/* 1. MINI PREVIEW DEL FOLLETO */}
        <Box display="flex" alignItems="center" gap={1.5} bgcolor="white" px={1.5} py={0.8} borderRadius="8px" sx={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)", minWidth: 200 }}>
          <Box 
            sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: "4px", 
              bgcolor: "#f3f4f6", 
              border: "1px solid #e5e7eb", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              overflow: "hidden"
            }}
          >
            {flyer?.imagen_url || flyer?.thumbnail || flyer?.portada ? (
              <img src={flyer.imagen_url || flyer.thumbnail || flyer.portada} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Typography fontSize={8} fontWeight={700} color="#9ca3af">FLYER</Typography>
            )}
          </Box>
          <Box>
            <Typography fontSize={13} fontWeight={700} color="#1f2937" lineHeight={1.2}>
              {flyer?.name || flyer?.nombre || "Folleto sin título"}
            </Typography>
            <Typography fontSize={10} color={flyer?.estado === "publicado" ? "#16a34a" : "#6b7280"} textTransform="uppercase" fontWeight={600}>
              {flyer?.estado || "BORRADOR"}
            </Typography>
          </Box>
        </Box>

        {/* 2. ZOOM CONTROLS */}
        <Box display="flex" alignItems="center" gap={1} bgcolor="white" borderRadius="20px" px={1.5} py={0.5} sx={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)", width: 220 }}>
          <Tooltip title="Alejar">
            <IconButton size="small" onClick={() => setZoom(z => Math.max(50, z - 10))}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Slider value={zoom} min={50} max={250} step={5} onChange={(_, v) => setZoom(v)} size="small" sx={{ flex: 1, color: "#1a1a2e" }} />
          <Tooltip title="Acercar">
            <IconButton size="small" onClick={() => setZoom(z => Math.min(250, z + 10))}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography fontSize={11} color="#6b7280" sx={{ minWidth: 32, textAlign: "right" }}>{zoom}%</Typography>
        </Box>

        {/* 3. EXPORT BUTTONS */}
        <Box display="flex" alignItems="center" gap={2}>
          <Typography fontSize={11} color="#6b7280" fontWeight={600}>
            {flyer?.width || 595}×{flyer?.height || 841}px
          </Typography>
          <ExportButtons canvasRefs={canvasRefs.current} flyerName={flyer?.name || flyer?.nombre} paginas={paginas} />
        </Box>
      </Box>

      {/* CONTENEDOR DE PÁGINAS */}
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", overflow: "visible" }}>
        <Box 
          sx={{ 
            transformOrigin: "top center", 
            transform: `scale(${scale})`, 
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            height: "auto",
            transition: "transform 0.1s ease-out"
          }}
        >
          {paginas.length === 0 ? (
            <Box bgcolor="white" p={4} borderRadius="8px" textAlign="center" boxShadow="0 2px 10px rgba(0,0,0,0.05)">
              <Typography color="textSecondary" fontSize={14}>No hay páginas en este folleto.</Typography>
            </Box>
          ) : (
            paginas.filter(Boolean).map((pag, idx) => {
              if (!canvasRefs.current[idx]) canvasRefs.current[idx] = { current: null };
              return (
                <PaginaCanvas 
                  key={pag.id} 
                  flyer={flyer} 
                  pag={pag} 
                  pagIdx={idx} 
                  isPaginaActiva={paginaActual === idx}
                  onSelectPagina={(pIndex) => setPaginaActual(pIndex)}
                  onUpdatePaginaName={onUpdatePaginaName}
                  modulos={modulosPorPagina[idx] || []} 
                  selectedModulo={selectedModulo} 
                  onSelectModulo={onSelectModulo}
                  onMenuAction={onMenuAction} 
                  onResize={onResize} 
                  onDeletePagina={onDeletePagina} 
                  canvasRef={(el) => { canvasRefs.current[idx] = { current: el }; }} 
                  totalPaginas={paginas.length}
                  sensors={sensors} 
                  onReorderModulos={onReorderModulos} 
                  onFlyerUpdate={onFlyerUpdate} 
                  esPrimera={idx === 0} 
                  TAMANO_SIZE={TAMANO_SIZE} 
                  TIPO_PRECIO_LABEL={TIPO_PRECIO_LABEL}
                  FONDO_COLORS={FONDO_COLORS} 
                  BORDER_STYLES={BORDER_STYLES} 
                  TAMANOS={TAMANOS} 
                  IMPREC={IMPREC} 
                  TARJETA_LOGO={TARJETA_LOGO} 
                  DEFAULT_LOGOS={DEFAULT_LOGOS} 
                />
              );
            })
          )}

          <Box display="flex" justifyContent="center" mt={1} mb={4}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddPagina} sx={{ ...BTN_ROUND, borderColor: "#9ca3af", color: "#374151", bgcolor: "white", "&:hover": { bgcolor: "#f9fafb" }, px: 3 }}>
              Agregar página
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}