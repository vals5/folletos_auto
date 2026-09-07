import { useState, useEffect } from "react";
import { Box, Typography, Tooltip, InputBase } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { DndContext, closestCenter, useDroppable } from "@dnd-kit/core";
import { supabase } from "../../services/supabase";
import HeaderImprecionante from "./HeaderImprecionante";
import SortableModuloCard from "./SortableModuloCard";
import LegalEditable from "./Legal";

import FondoTextura from "../../assets/img/Fondo-Imprec.jpg";

// Componente para representar cada uno de los 12 casilleros vacíos de la grilla
function DropZone({ id, index, isHighlighted, isValidDrop }) {
  const { setNodeRef } = useDroppable({ id, data: { index } });
  const rowStart = Math.floor(index / 3) + 1;
  const colStart = (index % 3) + 1;

  // Si está resaltado y es válido -> Azul. Si está resaltado pero es inválido -> Rojo.
  const bgColor = isHighlighted
    ? isValidDrop
      ? "rgba(59, 130, 246, 0.15)"
      : "rgba(239, 68, 68, 0.15)" 
    : "transparent";

  const borderColor = isHighlighted
    ? isValidDrop
      ? "2px dashed #3b82f6"
      : "2px dashed #ef4444"
    : "1px dashed transparent";

  return (
    <Box
      ref={setNodeRef}
      sx={{
        gridColumn: `${colStart} / span 1`,
        gridRow: `${rowStart} / span 1`,
        width: "100%",
        height: "100%",
        bgcolor: bgColor,
        border: borderColor,
        borderRadius: "4px",
        zIndex: 1,
        pointerEvents: "none", // Permite clics fluidos a través del fondo
        transition: "all 0.1s ease"
      }}
    />
  );
}

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

  // Estados para calcular posiciones multiples en vivo (Hovering)
  const [activeDragId, setActiveDragId] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

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

  // Lógica de cálculo en tiempo real
  const activeModulo = modulos.find((m) => m.id === activeDragId);
  const cSpan = activeModulo ? (activeModulo.colSpan || 1) : 1;
  const rSpan = activeModulo ? (activeModulo.rowSpan || 1) : 1;

  // Calculadora de celdas resaltadas
  const getHighlightCells = () => {
    if (overIndex === null || !activeDragId) return [];
    const sRow = Math.floor(overIndex / 3);
    const sCol = overIndex % 3;
    const cells = [];
    for (let r = 0; r < rSpan; r++) {
      for (let c = 0; c < cSpan; c++) {
        if (sCol + c < 3 && sRow + r < 4) {
          cells.push((sRow + r) * 3 + (sCol + c));
        }
      }
    }
    return cells;
  };

  const highlightedCells = getHighlightCells();

  // Validar si el lugar actual es legal (sin chocar con otros, ni desbordar la grilla)
  let isValidDrop = true;
  if (overIndex !== null && activeDragId) {
    const targetRow = Math.floor(overIndex / 3);
    const targetCol = overIndex % 3;

    if (targetCol + cSpan > 3 || targetRow + rSpan > 4) {
      isValidDrop = false; // Se sale por el borde
    } else {
      const desiredCells = getHighlightCells();
      const hasCollision = modulos.some((m) => {
        if (m.id === activeDragId) return false;
        const mCells = [];
        const mRow = Math.floor((m.posicion || 0) / 3);
        const mCol = (m.posicion || 0) % 3;
        for (let r = 0; r < (m.rowSpan || 1); r++) {
          for (let c = 0; c < (m.colSpan || 1); c++) {
            mCells.push((mRow + r) * 3 + (mCol + c));
          }
        }
        return desiredCells.some((cell) => mCells.includes(cell)); // Hay superposición
      });
      if (hasCollision) isValidDrop = false;
    }
  }

  // Finalizar drag
  const handleDragEnd = async (event) => {
    setActiveDragId(null);
    setOverIndex(null);

    const { active, over } = event;
    if (!over) return; 

    const targetIndex = over.data.current?.index;
    if (targetIndex === undefined) return;

    const draggedId = active.id;
    const draggedModulo = modulos.find((m) => m.id === draggedId);
    if (!draggedModulo) return;

    const currentCSpan = draggedModulo.colSpan || 1;
    const currentRSpan = draggedModulo.rowSpan || 1;
    const targetRow = Math.floor(targetIndex / 3);
    const targetCol = targetIndex % 3;

    // 1. Verificación de bordes
    if (targetCol + currentCSpan > 3 || targetRow + currentRSpan > 4) return; 

    // 2. Comprobar superposición
    const getCells = (pos, cols, rows) => {
      const cells = [];
      const sRow = Math.floor(pos / 3);
      const sCol = pos % 3;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push((sRow + r) * 3 + (sCol + c));
        }
      }
      return cells;
    };

    const desiredCells = getCells(targetIndex, currentCSpan, currentRSpan);
    const hasCollision = modulos.some((m) => {
      if (m.id === draggedId) return false;
      const mCells = getCells(m.posicion || 0, m.colSpan || 1, m.rowSpan || 1);
      return desiredCells.some((c) => mCells.includes(c)); 
    });

    if (hasCollision) return; 

    // 3. Aplicar
    const newModulos = modulos.map((m) => m.id === draggedId ? { ...m, posicion: targetIndex } : m);
    const sorted = [...newModulos].sort((a, b) => (a.posicion || 0) - (b.posicion || 0));
    onReorderModulos(pagIdx, sorted);

    await supabase.from("modulos").update({ posicion: targetIndex }).eq("id", draggedId);
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

      {/* MARCO DE LA PÁGINA */}
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
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={(e) => setActiveDragId(e.active.id)}
            onDragOver={(e) => setOverIndex(e.over?.data?.current?.index ?? null)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => { setActiveDragId(null); setOverIndex(null); }}
          >
            
            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)", 
              gridTemplateRows: "repeat(4, 1fr)", 
              gap: 0.5, 
              flex: 1,
              height: "100%",
              position: "relative"
            }}>
              
              {modulos.length === 0 && (
                <Box sx={{ gridColumn: "1 / -1", gridRow: "1 / -1", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0 }}>
                  <Typography fontSize={13} color="#92400e" textAlign="center" fontWeight={600}>
                    Hacé clic en esta página para seleccionar productos desde el panel izquierdo
                  </Typography>
                </Box>
              )}

              {/* 12 DROP ZONES INVISIBLES DE FONDO CON CÁLCULO DE MULTI-ESPACIO */}
              {Array.from({ length: 12 }).map((_, i) => (
                <DropZone 
                  key={`slot-${i}`} 
                  id={`slot-${i}`} 
                  index={i} 
                  isHighlighted={highlightedCells.includes(i)}
                  isValidDrop={isValidDrop}
                />
              ))}

              {/* LOS MÓDULOS ACTIVOS DE ESTA PÁGINA */}
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
                  onFlyerUpdate={onFlyerUpdate} 
                />
              ))}

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