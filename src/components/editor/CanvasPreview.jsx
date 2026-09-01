import { useState, useRef, useEffect } from "react";
import { Box, Typography, Chip, Tooltip, IconButton, Slider, Button, InputBase } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { useSensors, useSensor, PointerSensor } from "@dnd-kit/core";

import PaginaCanvas from "./CanvasPage"; 
import ExportButtons from "./ExportButtons"; 
import { useShortcuts } from "../../hooks/useShortcuts";

import ImprecLogo from "../../assets/img/Imprecionante.svg";
import VeaLogo from "../../assets/img/Vea.svg";
import TarjetaVea from "../../assets/img/Ahorro.svg";
import TarjetaCencosud from "../../assets/img/Ahorro.svg";

const DEFAULT_LOGOS = { izq: ImprecLogo, der: VeaLogo };
const TARJETA_LOGO = { vea_ahorro: TarjetaVea, regular_cencosud: TarjetaCencosud };

const GlobalFonts = () => (
  <style>{`
    @font-face { font-family:'Imprec-Vigency';   src:url('/fonts/imprecionante/GothamCondensed-Bold.otf') format('opentype'); }
    @font-face { font-family:'Imprec-Legal';     src:url('/fonts/imprecionante/Zuume-Light.otf')          format('opentype'); }
    @font-face { font-family:'Imprec-Price';     src:url('/fonts/imprecionante/GothamCondensed-Bold.otf') format('opentype'); }
    @font-face { font-family:'Imprec-SubtPrice'; src:url('/fonts/imprecionante/GothamCondensed-Bold.otf') format('opentype'); }
    @font-face { font-family:'Imprec-RegPrice';  src:url('/fonts/imprecionante/Zuume-Bold.otf')           format('opentype'); }
    @font-face { font-family:'Imprec-kgPrice';   src:url('/fonts/imprecionante/Zuume-Light.otf')          format('opentype'); }
    @font-face { font-family:'Imprec-Name';      src:url('/fonts/imprecionante/Zuume-SemiBold.otf')       format('opentype'); }
    @font-face { font-family:'Imprec-Desc';      src:url('/fonts/imprecionante/Zuume-Light.otf')          format('opentype'); }
  `}</style>
);

const IMPREC = {
  colors: { red: "#ff0000", yellow: "#fff800", black: "#000000", white: "#ffffff" },
  vigency: { fontFamily: "'Imprec-Vigency',sans-serif", fontSize: "13pt", textTransform: "uppercase", color: "#ff0000", lineHeight: 1.15 },
  legal: { fontFamily: "'Imprec-Legal',sans-serif", fontSize: "9pt", textTransform: "uppercase", color: "#000000" },
  price: { fontFamily: "'Imprec-Price',sans-serif", textTransform: "uppercase", lineHeight: 1 },
  subtPrice: { fontFamily: "'Imprec-SubtPrice',sans-serif", textTransform: "uppercase", lineHeight: 1 },
  regPrice: { fontFamily: "'Imprec-RegPrice',sans-serif", textTransform: "uppercase", lineHeight: 1 },
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

export default function CanvasPreview({ 
  flyer, 
  plantilla, 
  paginas = [], 
  modulosPorPagina = {}, 
  paginaActual, 
  setPaginaActual, 
  onUpdatePaginaName, 
  selectedModulo, 
  onSelectModulo, 
  onFlyerUpdate, 
  onReorderModulos, 
  onAddPagina, 
  onDeletePagina, 
  onDeleteModulo,
  onMenuAction, 
  onResize, 
  onBack 
}) {
  const navigate = useNavigate();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [zoom, setZoom] = useState(180);

  useShortcuts({
    DELETE: () => {
      if (selectedModulo?.id && onDeleteModulo) {
        onDeleteModulo(selectedModulo.id);
      }
    },
    ZOOM_IN: () => setZoom((z) => Math.min(250, z + 10)),
    ZOOM_OUT: () => setZoom((z) => Math.max(50, z - 10)),
    ZOOM_RESET: () => setZoom(100),
    ZOOM_TO_FIT: () => setZoom(180),
    DESELECT: () => {
      if (onSelectModulo) {
        onSelectModulo(null);
      }
    },
  });

  const getInitialTitle = (f) => {
    const val = f?.nombre || f?.name;
    if (!val) return "1";
    if (typeof val === "string" && val.length > 20 && val.includes("-")) {
      return "1";
    }
    return val;
  };

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleLocal, setTitleLocal] = useState(() => getInitialTitle(flyer));

  useEffect(() => {
    setTitleLocal(getInitialTitle(flyer));
  }, [flyer?.nombre, flyer?.name]);

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    const nuevoNombre = titleLocal.trim() || "1";
    setTitleLocal(nuevoNombre);
    if (onFlyerUpdate) {
      onFlyerUpdate("nombre", nuevoNombre);
    }
  };

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/dashboard");
    }
  };

  const canvasRefs = useRef([]);
  if (canvasRefs.current.length !== paginas.length) {
    canvasRefs.current = paginas.map((_, i) => canvasRefs.current[i] || { current: null });
  }

  const scale = zoom / 100;

  return (
    <Box flex={1} bgcolor="#e5e7eb" display="flex" flexDirection="column" alignItems="center" overflow="hidden" sx={{ width: "100%", height: "100%" }}>
      <GlobalFonts />

      {/* BARRA ÚNICA SUPERIOR */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        px={2.5} 
        py={1} 
        bgcolor="white" 
        borderBottom="1px solid #e5e7eb"
        sx={{ width: "100%", zIndex: 20, flexShrink: 0 }}
      >
        {/* IZQUIERDA: Flecha Volver + Título Editable con Ícono a la Derecha */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Tooltip title="Volver al dashboard">
            <IconButton size="small" onClick={handleGoBack} sx={{ color: "#0284c7", p: 0.5 }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {isEditingTitle ? (
            <InputBase
              value={titleLocal}
              onChange={(e) => setTitleLocal(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
              autoFocus
              sx={{
                bgcolor: "#0284c7",
                color: "white",
                borderRadius: "20px",
                px: 1.5,
                py: 0.1,
                fontSize: 13,
                fontWeight: 700,
                input: { textAlign: "center", color: "white" }
              }}
            />
          ) : (
            <Tooltip title="Haz clic para editar el nombre del folleto">
              <Chip 
                label={
                  <Box display="flex" alignItems="center" gap={0.6}>
                    <span>{titleLocal}</span>
                    <EditIcon sx={{ fontSize: "13px !important", color: "white !important" }} />
                  </Box>
                } 
                size="small" 
                onClick={() => setIsEditingTitle(true)}
                sx={{ 
                  borderRadius: "20px", 
                  fontWeight: 700, 
                  fontSize: 13, 
                  bgcolor: "#0284c7", 
                  color: "white", 
                  px: 0.8,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: "#0369a1" }
                }} 
              />
            </Tooltip>
          )}
        </Box>

        {/* EXPORT AND ZOOM */}
        <Box display="flex" alignItems="center" gap={2}>
          <Box display="flex" alignItems="center" gap={1} bgcolor="#0284c7" borderRadius="20px" px={1.5} py={0.5} sx={{ minWidth: 180 }}>
            <Tooltip title="Alejar">
              <IconButton size="small" onClick={() => setZoom(z => Math.max(50, z - 10))}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Slider value={zoom} min={50} max={250} step={5} onChange={(_, v) => setZoom(v)} size="small" sx={{ flex: 1, color: "white", "& .MuiSlider-thumb": { width: 14, height: 14 } }} />
            <Tooltip title="Acercar">
              <IconButton size="small" onClick={() => setZoom(z => Math.min(250, z + 10))}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography fontSize={11} color="white" sx={{ minWidth: 32, textAlign: "right" }}>{zoom}%</Typography>
          </Box>

          <ExportButtons canvasRefs={canvasRefs.current} flyerName={titleLocal} paginas={paginas} />
        </Box>
      </Box>

      {/* EDITOR SECTION */}
      <Box flex={1} display="flex" flexDirection="column" alignItems="center" py={3} sx={{ width: "100%", overflow: "auto" }}>
        
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
                  px: 3 
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