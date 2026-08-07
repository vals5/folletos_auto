import { Box, Typography, Chip, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { supabase } from "../../services/supabase";
import HeaderImprecionante from "./HeaderImprecionante";
import SortableModuloCard from "./SortableModuloCard";
import LegalEditable from "./Legal"; // Importamos el Legal si lo quieres fijo al pie de página

import FondoTextura from "../../assets/img/Fondo-Imprec.jpg";

export default function PaginaCanvas({ flyer, pag, pagIdx, modulos, selectedModulo, onSelectModulo, onMenuAction, onResize, onDeletePagina, canvasRef, totalPaginas, sensors, onReorderModulos, onFlyerUpdate, esPrimera, TAMANO_SIZE, TIPO_PRECIO_LABEL, FONDO_COLORS, BORDER_STYLES, TAMANOS, IMPREC, TARJETA_LOGO, DEFAULT_LOGOS }) {
  
  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = modulos.findIndex((m) => m.id === active.id);
    const newIdx = modulos.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(modulos, oldIdx, newIdx);
    onReorderModulos(pagIdx, reordered);
    await Promise.all(reordered.map((m, i) => supabase.from("modulos").update({ posicion: i }).eq("id", m.id)));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Chip label={`Página ${pag.numero}`} size="small" sx={{ borderRadius: "20px", fontWeight: 600, fontSize: 12, bgcolor: "#1a1a2e", color: "white", px: 1 }} />
        {totalPaginas > 1 && (
          <Tooltip title="Eliminar página">
            <Box onClick={() => onDeletePagina(pagIdx, pag)} sx={{ display: "flex", alignItems: "center", gap: 0.4, cursor: "pointer", bgcolor: "#ef4444", color: "white", borderRadius: "20px", px: 1.2, height: 24, "&:hover": { bgcolor: "#dc2626" } }}>
              <CloseIcon sx={{ fontSize: 13 }} />
            </Box>
          </Tooltip>
        )}
      </Box>

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
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)", 
          display: "flex", 
          flexDirection: "column", 
          overflow: "hidden", 
          position: "relative" 
        }}
      >
        {/* 1. HEADER (FIJO ARRIBA) */}
        <HeaderImprecionante flyer={flyer} onFlyerUpdate={onFlyerUpdate} IMPREC={IMPREC} DEFAULT_LOGOS={DEFAULT_LOGOS} />

        {/* 2. GRILLA CENTRAL (3 columnas x 4 filas exactas) */}
        <Box sx={{ flex: 1, overflow: "hidden", px: 0.8, py: 0.5, display: "flex", flexDirection: "column" }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            
            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)", 
              gridTemplateRows: "repeat(4, 1fr)", // SINTAXIS CSS CORREGIDA
              gap: 0.5, 
              flex: 1,
              height: "100%"
            }}>
              
              {modulos.length === 0 && !esPrimera && (
                <Box sx={{ gridColumn: "1 / -1", gridRow: "1 / -1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography fontSize={13} color="#92400e" textAlign="center">Agregá productos desde el panel izquierdo</Typography>
                </Box>
              )}

              <SortableContext items={modulos.map((m) => m.id)} strategy={rectSortingStrategy}>
                {modulos.map((modulo) => (
                  <SortableModuloCard 
                    key={modulo.id} 
                    modulo={modulo} 
                    isSelected={selectedModulo?.id === modulo.id} 
                    onClick={() => onSelectModulo(modulo)} 
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

        {/* 3. LEGAL (FIJO ABAJO CON FUENTE 9pt) */}
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