import { useState } from "react";
import { Box, Typography, Tooltip, InputBase, IconButton } from "@mui/material";
import { alpha } from "@mui/material/styles";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import { DndContext, closestCenter, useDroppable } from "@dnd-kit/core";
import HeaderImprecionante from "./HeaderImprecionante";
import SortableModuloCard from "./SortableModuloCard";
import LegalEditable from "./Legal";
import { useEditor } from "../context/EditorContext";
import { cabe, reubicarSiColisiona } from "../utils/grid";

import FondoTextura from "../../../assets/img/Fondo-Imprec.jpg";

// Cada casillero de la grilla (se usa como destino al arrastrar un módulo).
function DropZone({ id, index, cols, isHighlighted, isValidDrop }) {
  const { setNodeRef } = useDroppable({ id, data: { index } });
  const rowStart = Math.floor(index / cols) + 1;
  const colStart = (index % cols) + 1;
  const tone = isValidDrop ? "primary" : "error";

  return (
    <Box
      ref={setNodeRef}
      sx={{
        gridColumn: `${colStart} / span 1`,
        gridRow: `${rowStart} / span 1`,
        width: "100%",
        height: "100%",
        bgcolor: isHighlighted ? (t) => alpha(t.palette[tone].main, 0.15) : "transparent",
        border: "2px dashed",
        borderColor: isHighlighted ? `${tone}.main` : "transparent",
        borderRadius: "4px",
        zIndex: 1,
        pointerEvents: "none",
        transition: "all 0.1s ease",
      }}
    />
  );
}

export default function PaginaCanvas({
  pag,
  pagIdx,
  isPaginaActiva,
  onSelectPagina,
  onRenamePagina,
  modulos,
  selectedModulo,
  onSelectModulo,
  onDeletePagina,
  canvasRef,
  totalPaginas,
  sensors,
  onReorderModulos,
}) {
  const { flyer, grid } = useEditor();
  const nombrePorDefecto = `Página ${pag?.numero || pagIdx + 1}`;
  const nombre = pag?.nombre || nombrePorDefecto;

  const [isEditingName, setIsEditingName] = useState(false);
  const [draftNombre, setDraftNombre] = useState("");
  const [activeDragId, setActiveDragId] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const startEditingName = (e) => {
    e.stopPropagation();
    setDraftNombre(nombre);
    setIsEditingName(true);
  };

  const handleSaveNombre = () => {
    setIsEditingName(false);
    const nuevo = draftNombre.trim() || nombrePorDefecto;
    if (nuevo !== nombre && pag?.id) onRenamePagina(pag.id, nuevo);
  };

  // ---- Resaltado de celdas mientras se arrastra ----
  const activeModulo = modulos.find((m) => m.id === activeDragId);
  const cSpan = activeModulo?.colSpan || 1;
  const rSpan = activeModulo?.rowSpan || 1;
  const arrastrando = overIndex !== null && activeDragId;

  const isValidDrop = !arrastrando || cabe(overIndex, cSpan, rSpan, grid);

  const highlightedCells = [];
  if (arrastrando) {
    const sRow = Math.floor(overIndex / grid.cols);
    const sCol = overIndex % grid.cols;
    for (let r = 0; r < rSpan; r++) {
      for (let c = 0; c < cSpan; c++) {
        if (sCol + c < grid.cols && sRow + r < grid.rows) highlightedCells.push((sRow + r) * grid.cols + (sCol + c));
      }
    }
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveDragId(null);
    setOverIndex(null);
    if (!over) return;

    const targetIndex = over.data.current?.index;
    const dragged = modulos.find((m) => m.id === active.id);
    if (targetIndex === undefined || !dragged) return;
    if (!cabe(targetIndex, dragged.colSpan || 1, dragged.rowSpan || 1, grid)) return;

    const nuevos = reubicarSiColisiona(modulos, dragged.id, targetIndex, grid).sort(
      (a, b) => (a.posicion || 0) - (b.posicion || 0),
    );
    onReorderModulos(pagIdx, nuevos);
  };

  return (
    <Box
      onClick={() => onSelectPagina?.(pagIdx)}
      sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4, cursor: "pointer" }}
    >
      <Box display="flex" alignItems="center" gap={0.5} mb={1}>
        {isEditingName ? (
          <InputBase
            value={draftNombre}
            onChange={(e) => setDraftNombre(e.target.value)}
            onBlur={handleSaveNombre}
            onKeyDown={(e) => e.key === "Enter" && handleSaveNombre()}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            inputProps={{ "aria-label": "Nombre de la página" }}
            sx={{ fontSize: 11, fontWeight: 700, px: 0.75, py: 0, borderRadius: "6px", border: "1.5px solid", borderColor: "primary.main", bgcolor: "background.paper", input: { textAlign: "center", p: "1px 0" } }}
          />
        ) : (
          <Tooltip title="Cambiar el nombre de esta página">
            <Box
              component="button"
              type="button"
              onClick={startEditingName}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                font: "inherit",
                fontSize: 11,
                fontWeight: 700,
                border: 0,
                bgcolor: "transparent",
                cursor: "pointer",
                color: isPaginaActiva ? "primary.main" : "text.secondary",
                px: 0.75,
                py: 0.25,
                borderRadius: "6px",
                "&:hover": { bgcolor: (t) => alpha(t.palette.neutral[900], 0.06), color: "text.primary" },
              }}
            >
              <span>{nombre}</span>
              <EditIcon sx={{ fontSize: 11, opacity: 0.7 }} />
            </Box>
          </Tooltip>
        )}

        {totalPaginas > 1 && (
          <Tooltip title="Eliminar página">
            <IconButton
              size="small"
              aria-label={`Eliminar ${nombre}`}
              onClick={(e) => {
                e.stopPropagation();
                onDeletePagina(pagIdx, pag);
              }}
              sx={{ p: 0.25, color: "text.secondary", "&:hover": { color: "error.main", bgcolor: "error.light" } }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box
        ref={canvasRef}
        style={{
          backgroundImage: `url(${FondoTextura})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        sx={{
          width: (flyer?.width || 595) * 0.5,
          height: (flyer?.height || 841) * 0.5,
          borderRadius: "6px",
          outline: isPaginaActiva ? "2px solid" : "none",
          outlineColor: (t) => t.palette.primary.main,
          outlineOffset: "2px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.20)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          transition: "outline 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <HeaderImprecionante />

        <Box sx={{ flex: 1, overflow: "hidden", px: 0.8, py: 0.5, display: "flex", flexDirection: "column" }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveDragId(e.active.id)}
            onDragOver={(e) => setOverIndex(e.over?.data?.current?.index ?? null)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => {
              setActiveDragId(null);
              setOverIndex(null);
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
                gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
                gap: 0.5,
                flex: 1,
                height: "100%",
                position: "relative",
              }}
            >
              {modulos.length === 0 && (
                <Box
                  sx={{
                    gridColumn: "1 / -1",
                    gridRow: "1 / -1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                >
                  <Typography fontSize={13} color="warning.dark" textAlign="center" fontWeight={600}>
                    Hacé clic en esta página para seleccionar productos desde el panel izquierdo
                  </Typography>
                </Box>
              )}

              {Array.from({ length: grid.cols * grid.rows }).map((_, i) => (
                <DropZone
                  key={`slot-${i}`}
                  id={`slot-${i}`}
                  index={i}
                  cols={grid.cols}
                  isHighlighted={highlightedCells.includes(i)}
                  isValidDrop={isValidDrop}
                />
              ))}

              {modulos.map((modulo) => (
                <SortableModuloCard
                  key={modulo.id}
                  modulo={modulo}
                  isSelected={selectedModulo?.id === modulo.id}
                  onClick={() => {
                    onSelectPagina?.(pagIdx);
                    onSelectModulo(modulo);
                  }}
                />
              ))}
            </Box>
          </DndContext>
        </Box>

        <Box sx={{ px: 0.8, pb: 0.5, flexShrink: 0, zIndex: 10 }}>
          <LegalEditable />
        </Box>
      </Box>
    </Box>
  );
}
