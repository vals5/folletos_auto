import { useState, useEffect } from "react";
import { Box, Typography, Tooltip, InputBase } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { supabase } from "../../services/supabase";
import HeaderImprecionante from "./HeaderImprecionante";
import SortableModuloCard from "./SortableModuloCard";
import LegalEditable from "./Legal";

import FondoTextura from "../../assets/img/Fondo-Imprec.jpg";

export default function PaginaCanvas({ 
  flyer, 
  pag, 
  pagIdx, 
  isPaginaActiva,
  onSelectPagina,
  onUpdatePaginaName,
  modulos, 
  selectedModulo, 
  onSelectModulo, 
  onMenuAction, 
  onResize, 
  onDeletePagina, 
  canvasRef, 
  totalPaginas, 
  sensors, 
  onReorderModulos, 
  onFlyerUpdate, 
  esPrimera, 
  TAMANO_SIZE, 
  TIPO_PRECIO_LABEL, 
  FONDO_COLORS, 
  BORDER_STYLES, 
  TAMANOS, 
  IMPREC, 
  TARJETA_LOGO, 
  DEFAULT_LOGOS 
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nombreLocal, setNombreLocal] = useState(pag?.nombre || `Página ${pag?.numero || pagIdx + 1}`);

  useEffect(() => {
    setNombreLocal(pag?.nombre || `Página ${pag?.numero || pagIdx + 1}`);
  }, [pag?.nombre, pag?.numero, pagIdx]);

  const handleSaveNombre = async () => {
    setIsEditingName(false);
    const nuevoNombre = nombreLocal.trim() || `Página ${pag?.numero || pagIdx + 1}`;
    
    if (onUpdatePaginaName) {
      onUpdatePaginaName(pagIdx, pag.id, nuevoNombre);
    }

    if (pag?.id) {
      await supabase.from("paginas").update({ nombre: nuevoNombre }).eq("id", pag.id);
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = modulos.findIndex((m) => m.id === active.id);
    const newIdx = modulos.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(modulos, oldIdx, newIdx);
    onReorderModulos(pagIdx, reordered);
    await Promise.all(reordered.map((m, i) => supabase.from("modulos").update({ posicion: i }).eq("id", m.id)));
  };

  const handleActivarPagina = () => {
    if (onSelectPagina) {
      onSelectPagina(pagIdx);
    }
  };

  return (
    <Box 
      onClick={handleActivarPagina}
      sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4, cursor: "pointer" }}
    >
      {/* HEADER DE LA PÁGINA */}
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        {isEditingName ? (
          <InputBase
            value={nombreLocal}
            onChange={(e) => setNombreLocal(e.target.value)}
            onBlur={handleSaveNombre}
            onKeyDown={(e) => e.key === "Enter" && handleSaveNombre()}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            sx={{
              color: "#4b5563",
              fontSize: 13,
              fontWeight: 600,
              px: 1,
              py: 0.2,
              input: { textAlign: "center" }
            }}
          />
        ) : (
          <Tooltip title="Cambiar el nombre de esta página">
            <Box
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingName(true);
              }}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.6,
                cursor: "pointer",
                color: "#4b5563",
                fontWeight: 600,
                fontSize: 13,
                px: 1,
                py: 0.3,
                borderRadius: "4px",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "#e5e7eb",
                  color: "#1f2937"
                }
              }}
            >
              <span>{nombreLocal}</span>
              <EditIcon sx={{ fontSize: 14, color: "#6b7280" }} />
            </Box>
          </Tooltip>
        )}

        {totalPaginas > 1 && (
          <Tooltip title="Eliminar página">
            <Box 
              onClick={(e) => {
                e.stopPropagation();
                onDeletePagina(pagIdx, pag);
              }} 
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                cursor: "pointer", 
                bgcolor: "#ef4444", 
                color: "white", 
                borderRadius: "20px", 
                px: 1, 
                height: 22, 
                "&:hover": { bgcolor: "#dc2626" } 
              }}
            >
              <CloseIcon sx={{ fontSize: 13 }} />
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* MARCO DE LA PÁGINA (BORDE FINO DE 2PX OUTLINE) */}
      <Box 
        ref={canvasRef} 
        style={{
          backgroundImage: `url(${FondoTextura})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
        sx={{ 
          width: (flyer?.width || 595) * 0.5, 
          height: (flyer?.height || 841) * 0.5, 
          borderRadius: "6px", 
          outline: isPaginaActiva ? "2px solid #2563eb" : "none",
          outlineOffset: "2px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.20)", 
          display: "flex", 
          flexDirection: "column", 
          overflow: "hidden", 
          position: "relative",
          transition: "outline 0.2s ease, box-shadow 0.2s ease"
        }}
      >
        {/* 1. HEADER */}
        <HeaderImprecionante flyer={flyer} onFlyerUpdate={onFlyerUpdate} IMPREC={IMPREC} DEFAULT_LOGOS={DEFAULT_LOGOS} />

        {/* 2. GRILLA CENTRAL */}
        <Box sx={{ flex: 1, overflow: "hidden", px: 0.8, py: 0.5, display: "flex", flexDirection: "column" }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            
            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)", 
              gridTemplateRows: "repeat(4, 1fr)", 
              gap: 0.5, 
              flex: 1,
              height: "100%"
            }}>
              
              {modulos.length === 0 && (
                <Box sx={{ gridColumn: "1 / -1", gridRow: "1 / -1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography fontSize={13} color="#92400e" textAlign="center" fontWeight={600}>
                    Hacé clic en esta página para seleccionar productos desde el panel izquierdo
                  </Typography>
                </Box>
              )}

              <SortableContext items={modulos.map((m) => m.id)} strategy={rectSortingStrategy}>
                {modulos.map((modulo) => (
                  <SortableModuloCard 
                    key={modulo.id} 
                    modulo={modulo} 
                    isSelected={selectedModulo?.id === modulo.id} 
                    onClick={() => {
                      handleActivarPagina();
                      onSelectModulo(modulo);
                    }} 
                    onMenuAction={onMenuAction} 
                    onResize={onResize} 
                    flyer={flyer} 
                    TAMANO_SIZE={TAMANO_SIZE} 
                    TIPO_PRECIO_LABEL={TIPO_PRECIO_LABEL} 
                    FONDO_COLORS={FONDO_COLORS} 
                    BORDER_STYLES={BORDER_STYLES} 
                    TAMANOS={TAMANOS} 
                    IMPREC={IMPREC} 
                    TARJETA_LOGO={TARJETA_LOGO}
                    colSpan={modulo.colSpan || 1}
                    rowSpan={modulo.rowSpan || 1}
                    onFlyerUpdate={onFlyerUpdate} 
                  />
                ))}
              </SortableContext>
            </Box>

          </DndContext>
        </Box>

        {/* 3. LEGAL */}
        {LegalEditable && (
          <Box sx={{ px: 0.8, pb: 0.5, flexShrink: 0, zIndex: 10 }}>
            <LegalEditable 
              flyer={flyer} 
              flyerId={flyer?.id} 
              legal={flyer?.legal} 
              onUpdate={(val) => onFlyerUpdate("legal", val)} 
              IMPREC={IMPREC} 
            />
          </Box>
        )}

      </Box>
    </Box>
  );
}