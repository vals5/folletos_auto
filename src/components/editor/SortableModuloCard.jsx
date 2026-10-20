import { useState } from "react";
import { Box } from "@mui/material";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import MiniProducto from "./MiniProducto";
import PrecioStarburst from "./PrecioStarburst";
import FooterUploader from "./FooterUploader";
import LegalEditable from "./Legal";

export default function SortableModuloCard({
  modulo,
  isSelected,
  onClick,
  onMenuAction,
  onResize,
  onUpdateModulo,
  flyer,
  TAMANO_SIZE,
  TIPO_PRECIO_LABEL,
  FONDO_COLORS,
  BORDER_STYLES,
  TAMANOS,
  IMPREC,
  TARJETA_LOGO,
  onFlyerUpdate,
}) {
  const isFreeEdit = Boolean(modulo.edicion_libre);

  // Si edicion_libre está activo, deshabilitamos el arrastre general de la grilla
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: modulo.id,
    data: { modulo },
    disabled: isFreeEdit,
  });

  const [hovered, setHovered] = useState(false);

  const colSpan = modulo.colSpan || 1;
  const rowSpan = modulo.rowSpan || 1;

  const pos = modulo.posicion || 0;
  const rowStart = Math.floor(pos / 3) + 1;
  const colStart = (pos % 3) + 1;

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

  const handleCardClick = (e) => {
    e.stopPropagation();
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
        {...(isFreeEdit ? {} : attributes)}
        {...(isFreeEdit ? {} : listeners)}
        onClick={handleCardClick}
      >
        <FooterUploader
          flyer={flyer}
          flyerId={flyer?.id}
          footerUrl={flyer?.footer_url}
          onUpdate={(url) => onFlyerUpdate("footer_url", url)}
        />
        <LegalEditable
          flyer={flyer}
          flyerId={flyer?.id}
          legal={flyer?.legal}
          onUpdate={(val) => onFlyerUpdate("legal", val)}
          IMPREC={IMPREC}
        />
      </Box>
    );
  }

  const size = TAMANO_SIZE[modulo.tamano] || TAMANO_SIZE["S"];

  const isBgRed = modulo.fondo_modulo === "rojo" || modulo.fondo_modulo === "red";
  const bgColor =
    FONDO_COLORS[modulo.fondo_modulo] ??
    (isBgRed ? FONDO_COLORS["red"] || FONDO_COLORS["rojo"] || "#dc2626" : FONDO_COLORS["empty"] || "transparent");
  const borderStyle = BORDER_STYLES[modulo.estilo_borde] || "1px solid #e2e8f0";
  const textColor = isBgRed ? "#ffffff" : "#000000";

  const esMulti = ["2_productos", "3_productos", "4_productos"].includes(modulo.formato);

  let todosLosProductos = [];
  if (esMulti) {
    if (modulo.formato === "2_productos") {
      todosLosProductos = [
        {
          producto: modulo.productos,
          imgOverride: modulo.imagen_url || modulo.imagen_url_override || modulo.imagen,
          nombreOverride: modulo.nombre_override || modulo.nombre,
          descripcionOverride: modulo.descripcion_override || modulo.descripcion,
          precioRegularOverride: modulo.precio_regular_override || modulo.precio_regular,
          stockOverride: modulo.stock,
        },
        {
          producto: modulo.productos_2,
          imgOverride: modulo.imagen_url_2,
          nombreOverride: modulo.nombre_2,
          descripcionOverride: modulo.descripcion_2,
          precioRegularOverride: modulo.precio_regular_2,
          stockOverride: modulo.stock_2,
        },
      ];
    }
  } else {
    todosLosProductos = [
      {
        producto: modulo.productos,
        imgOverride: modulo.imagen_url || modulo.imagen_url_override || modulo.imagen,
        nombreOverride: modulo.nombre_override || modulo.nombre,
        descripcionOverride: modulo.descripcion_override || modulo.descripcion,
        precioRegularOverride: modulo.precio_regular_override || modulo.precio_regular,
        stockOverride: modulo.stock,
      },
    ];
  }

  const handleUpdateField = (field, value, index = 0) => {
    if (onUpdateModulo) {
      const keySuffix = index > 0 ? `_${index + 1}` : "";
      onUpdateModulo(modulo.id, { [`${field}${keySuffix}`]: value });
    }
  };

  const handlePositionChange = (elementKey, newPos) => {
    if (onUpdateModulo) {
      onUpdateModulo(modulo.id, {
        [elementKey]: newPos,
      });
    }
  };

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
      {...(isFreeEdit ? {} : attributes)}
      {...(isFreeEdit ? {} : listeners)}
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!esMulti && todosLosProductos[0] && (
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
            producto={todosLosProductos[0].producto}
            imgOverride={todosLosProductos[0].imgOverride}
            nombreOverride={todosLosProductos[0].nombreOverride}
            descripcionOverride={todosLosProductos[0].descripcionOverride}
            precioRegularOverride={todosLosProductos[0].precioRegularOverride}
            stockOverride={todosLosProductos[0].stockOverride}
            textColor={textColor}
            showPrice={false}
            size={size}
            isBgRed={isBgRed}
            isModuloSelected={isSelected}
            edicionLibre={isFreeEdit}
            posImagen={modulo.pos_imagen}
            posTexto={modulo.pos_texto}
            onPositionChange={handlePositionChange}
            IMPREC={IMPREC}
            TARJETA_LOGO={TARJETA_LOGO}
            flyer={flyer}
            colSpan={colSpan}
            rowSpan={rowSpan}
            onUpdateField={(field, value) => handleUpdateField(field, value, 0)}
          />
        </Box>
      )}

      <PrecioStarburst
        precio={modulo.precio}
        tipoPrecio={modulo.tipo_precio}
        size={size}
        colSpan={colSpan}
        rowSpan={rowSpan}
        isBgRed={isBgRed}
        isModuloSelected={isSelected}
        edicionLibre={isFreeEdit}
        posPrecio={modulo.pos_precio}
        onPositionChange={(pos) => handlePositionChange("pos_precio", pos)}
        IMPREC={IMPREC}
        TARJETA_LOGO={TARJETA_LOGO}
      />
    </Box>
  );
}
