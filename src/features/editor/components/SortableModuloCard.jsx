import { Box } from "@mui/material";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import MiniProducto from "./MiniProducto";
import PrecioStarburst from "./PrecioStarburst";
import FooterUploader from "./FooterUploader";
import LegalEditable from "./Legal";
import { useEditor } from "../context/EditorContext";
import { TAMANO_SIZE, FONDO_COLORS, BORDER_STYLES } from "../../../config/editorTheme";

export default function SortableModuloCard({ modulo, isSelected, onClick }) {
  const { grid, onUpdateModulo } = useEditor();
  const isFreeEdit = Boolean(modulo.edicion_libre);

  // Con edición libre activa se deshabilita el arrastre de la tarjeta en la grilla.
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: modulo.id,
    data: { modulo },
    disabled: isFreeEdit,
  });

  const colSpan = modulo.colSpan || 1;
  const rowSpan = modulo.rowSpan || 1;

  const pos = modulo.posicion || 0;
  const rowStart = Math.floor(pos / grid.cols) + 1;
  const colStart = (pos % grid.cols) + 1;

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.8 : 1,
    gridColumn: `${colStart} / span ${colSpan}`,
    gridRow: `${rowStart} / span ${rowSpan}`,
    zIndex: isDragging ? 50 : 10,
    width: "100%",
    height: "100%",
    touchAction: "none",
    boxSizing: "border-box",
  };

  const dragProps = isFreeEdit ? {} : { ...attributes, ...listeners };

  const handleCardClick = (e) => {
    e.stopPropagation();
    // Un clic dentro de un campo editable (ej. el legal del pie) no debe cerrarlo.
    if (e.target.closest?.("input, textarea, [contenteditable='true']")) return;
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
    if (onClick) onClick();
  };

  if (modulo.formato === "footer") {
    return (
      <Box
        ref={setNodeRef}
        style={{
          ...style,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          cursor: isFreeEdit ? "default" : "grab",
          border: "2px solid transparent",
          borderRadius: "4px",
        }}
        {...dragProps}
        onClick={handleCardClick}
      >
        <FooterUploader />
        <LegalEditable />
      </Box>
    );
  }

  const size = TAMANO_SIZE[modulo.tamano] || TAMANO_SIZE.S;

  const isBgRed = modulo.fondo_modulo === "rojo" || modulo.fondo_modulo === "red";
  const bgColor = FONDO_COLORS[isBgRed ? "red" : modulo.fondo_modulo] ?? FONDO_COLORS.empty;
  const borderStyle = BORDER_STYLES[modulo.estilo_borde] || "1px solid #e2e8f0";
  const textColor = isBgRed ? "#ffffff" : "#000000";

  const handlePositionChange = (campo, nuevaPos) => onUpdateModulo(modulo.id, { [campo]: nuevaPos });

  return (
    <Box
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: bgColor,
        borderRadius: "4px",
        display: "flex",
        flexDirection: "column",
        overflow: isFreeEdit ? "visible" : "hidden",
        cursor: isFreeEdit ? "default" : "grab",
        position: "relative",
        border: isFreeEdit ? "2px dashed #22c55e" : isSelected ? "2px solid #0284c7" : borderStyle,
      }}
      {...dragProps}
      onClick={handleCardClick}
    >
      <Box
        sx={{
            flex: 1,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: colSpan > 1 ? "row" : "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            p: 0.5,
            gap: 0.5,
            boxSizing: "border-box",
          }}
        >
          <MiniProducto
            producto={modulo.productos}
            imgOverride={modulo.img_override}
            esPromo={Boolean(modulo.es_promo_3x1)}
            nombreOverride={modulo.nombre_override}
            descripcionOverride={modulo.descripcion_override}
            precioRegularOverride={modulo.precio_regular_override}
            textColor={textColor}
            edicionLibre={isFreeEdit}
            posImagen={modulo.pos_imagen}
            posTexto={modulo.pos_texto}
            onPositionChange={handlePositionChange}
            colSpan={colSpan}
            rowSpan={rowSpan}
          />
      </Box>

      <PrecioStarburst
        precio={modulo.precio}
        tipoPrecio={modulo.tipo_precio}
        size={size}
        colSpan={colSpan}
        rowSpan={rowSpan}
        isBgRed={isBgRed}
        edicionLibre={isFreeEdit}
        posPrecio={modulo.pos_precio}
        onPositionChange={(nuevaPos) => handlePositionChange("pos_precio", nuevaPos)}
      />
    </Box>
  );
}
