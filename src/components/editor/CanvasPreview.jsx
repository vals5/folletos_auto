import { useState, useRef } from "react";
import { Box, Typography, Chip, Tooltip, IconButton, Slider, Button } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import AddIcon from "@mui/icons-material/Add";
import { useSensors, useSensor, PointerSensor } from "@dnd-kit/core";

import PaginaCanvas from "./PaginaCanvas";
import ExportButtons from "./ExportButtons"; 

import ImprecLogo from "../../assets/img/Imprecionante.svg";
import VeaLogo from "../../assets/img/Vea.svg";
import TarjetaVea from "../../assets/img/Ahorro.svg";
import TarjetaCencosud from "../../assets/img/Ahorro.svg";

const DEFAULT_LOGOS = { izq: ImprecLogo, der: VeaLogo };
const TARJETA_LOGO = { vea_ahorro: TarjetaVea, regular_cencosud: TarjetaCencosud };

const GlobalFonts = () => (
  <style>{`
    @font-face { font-family:'Imprec-Vigency';  src:url('/src/assets/fonts/imprecionante/GothamCondensed-Bold.otf') format('opentype'); }
    @font-face { font-family:'Imprec-Legal';    src:url('/src/assets/fonts/imprecionante/Zuume-Light.otf')          format('opentype'); }
    @font-face { font-family:'Imprec-Price';    src:url('/src/assets/fonts/imprecionante/GothamCondensed-Bold.otf') format('opentype'); }
    @font-face { font-family:'Imprec-SubtPrice';src:url('/src/assets/fonts/imprecionante/GothamCondensed-Bold.otf') format('opentype'); }
    @font-face { font-family:'Imprec-RegPrice'; src:url('/src/assets/fonts/imprecionante/Zuume-Bold.otf')           format('opentype'); }
    @font-face { font-family:'Imprec-kgPrice';  src:url('/src/assets/fonts/imprecionante/Zuume-Light.otf')          format('opentype'); }
    @font-face { font-family:'Imprec-Name';     src:url('/src/assets/fonts/imprecionante/Zuume-SemiBold.otf')       format('opentype'); }
    @font-face { font-family:'Imprec-Desc';     src:url('/src/assets/fonts/imprecionante/Zuume-Light.otf')          format('opentype'); }
  `}</style>
);

const IMPREC = {
  colors: { red: "#ff0000", yellow: "#fff800", black: "#000000", white: "#ffffff" },
  vigency: { fontFamily: "'Imprec-Vigency',sans-serif", fontSize: "13pt", textTransform: "uppercase", color: "#ff0000", lineHeight: 1.15 },
  legal: { fontFamily: "'Imprec-Legal',sans-serif", fontSize: "9pt", textTransform: "uppercase", color: "#000000" },
  price: { fontFamily: "'Imprec-Price',sans-serif", textTransform: "uppercase", lineHeight: 1 },
  subtPrice: { fontFamily: "'Imprec-SubtPrice',sans-serif", textTransform: "uppercase", lineHeight: 1 },
  productName: { fontFamily: "'Imprec-Name',sans-serif", fontSize: "9pt", lineHeight: 1.05, textTransform: "uppercase", color: "#000000" },
  productDesc: { fontFamily: "'Imprec-Desc',sans-serif", fontSize: "7pt", lineHeight: 1.05, textTransform: "uppercase", color: "#555555" },
};

const TAMANOS = ["XS", "S", "M", "L", "XL"];
const TAMANO_SIZE = {
  XS: { width: 90, height: 100 }, S: { width: 130, height: 120 },
  M: { width: 185, height: 140 }, L: { width: 250, height: 160 }, XL: { width: 350, height: 185 },
};

const TIPO_PRECIO_LABEL = { regular: null, llevando3: "LLEVANDO 2", vea_ahorro: "VEA AHORRO", regular_cencosud: "CENCOSUD" };
const FONDO_COLORS = { white: "#ffffff", red: "#ff0000", yellow: "#fff800", empty: "transparent" };
const BORDER_STYLES = { none: "none", solid: "2px solid #ff0000", dashed: "2px dashed #ff0000", thick: "3px solid #ff0000" };
const BTN_ROUND = { borderRadius: "20px", textTransform: "none", fontSize: 12 };

export default function CanvasPreview({ flyer, plantilla, paginas, modulosPorPagina, paginaActual, setPaginaActual, selectedModulo, onSelectModulo, onFlyerUpdate, onReorderModulos, onAddPagina, onDeletePagina, onMenuAction, onResize }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [zoom, setZoom] = useState(150);

  const canvasRefs = useRef([]);
  if (canvasRefs.current.length !== paginas.length) {
    canvasRefs.current = paginas.map((_, i) => canvasRefs.current[i] || { current: null });
  }

  const scale = zoom / 100;

  return (
    <Box flex={1} bgcolor="#e5e7eb" display="flex" flexDirection="column" alignItems="center" overflow="auto" py={3}>
      <GlobalFonts />

      {/* TOP TOOLBAR */}
      <Box display="flex" alignItems="center" gap={2} mb={3} px={2} flexWrap="wrap" justifyContent="center">
        <Box display="flex" alignItems="center" gap={1} bgcolor="white" borderRadius="20px" px={1.5} py={0.5} sx={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)", minWidth: 180 }}>
          <Tooltip title="Alejar">
            <IconButton size="small" onClick={() => setZoom(z => Math.max(30, z - 10))}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Slider value={zoom} min={100} max={250} step={5} onChange={(_, v) => setZoom(v)} size="small" sx={{ flex: 1, color: "#1a1a2e", "& .MuiSlider-thumb": { width: 14, height: 14 } }} />
          <Tooltip title="Acercar">
            <IconButton size="small" onClick={() => setZoom(z => Math.min(250, z + 10))}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography fontSize={11} color="#6b7280" sx={{ minWidth: 32, textAlign: "right" }}>{zoom}%</Typography>
        </Box>

        <Chip label={flyer?.estado || "borrador"} size="small" color={flyer?.estado === "publicado" ? "success" : "default"} sx={{ borderRadius: "20px" }} />
        <ExportButtons canvasRefs={canvasRefs.current} flyerName={flyer?.name} paginas={paginas} />
      </Box>

      {flyer?.width && (
        <Typography fontSize={11} color="#6b7280" mb={2} fontWeight={600}>
          {flyer.width}×{flyer.height}px · {zoom}%
        </Typography>
      )}

      <Box sx={{ position: "relative", width: "100%" }}>
        <Box sx={{ transformOrigin: "top center", transform: `scale(${scale})`, mb: scale < 1 ? `${-(1 - scale) * 100}%` : 0 }}>
          {paginas.filter(Boolean).map((pag, idx) => {
            if (!canvasRefs.current[idx]) canvasRefs.current[idx] = { current: null };
            return (
              <PaginaCanvas key={pag.id} flyer={flyer} pag={pag} pagIdx={idx} modulos={modulosPorPagina[idx] || []} selectedModulo={selectedModulo} onSelectModulo={onSelectModulo}
                onMenuAction={onMenuAction} onResize={onResize} onDeletePagina={onDeletePagina} canvasRef={(el) => { canvasRefs.current[idx] = { current: el }; }} totalPaginas={paginas.length}
                sensors={sensors} onReorderModulos={onReorderModulos} onFlyerUpdate={onFlyerUpdate} esPrimera={idx === 0} TAMANO_SIZE={TAMANO_SIZE} TIPO_PRECIO_LABEL={TIPO_PRECIO_LABEL}
                FONDO_COLORS={FONDO_COLORS} BORDER_STYLES={BORDER_STYLES} TAMANOS={TAMANOS} IMPREC={IMPREC} TARJETA_LOGO={TARJETA_LOGO} DEFAULT_LOGOS={DEFAULT_LOGOS} />
            );
          })}

          <Box display="flex" justifyContent="center" mt={1} mb={2}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddPagina} sx={{ ...BTN_ROUND, borderColor: "#9ca3af", color: "#374151", bgcolor: "white", "&:hover": { bgcolor: "#f9fafb" }, px: 3 }}>
              Agregar página
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}