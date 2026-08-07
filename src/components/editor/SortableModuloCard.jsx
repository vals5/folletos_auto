import { useState } from "react";
import { Box } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
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
  onFlyerUpdate 
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: modulo.id });
  const [hovered, setHovered] = useState(false);

  const colSpan = modulo.colSpan || 1;
  const rowSpan = modulo.rowSpan || 1;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    gridColumn: `span ${colSpan}`,
    gridRow: `span ${rowSpan}`,
    width: "100%",
    height: "100%",
  };

  // --- RENDERIZADO DEL FOOTER ---
  if (modulo.formato === "footer") {
    return (
      <Box
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end", // Mantiene todo pegado abajo como el original
          zIndex: 10,
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
          boxSizing: "border-box",
          border: isSelected ? "2px solid #3b82f6" : "2px solid transparent",
          borderRadius: "4px"
        }}
      >
        <FooterUploader flyer={flyer} flyerId={flyer?.id} footerUrl={flyer?.footer_url} onUpdate={(url) => onFlyerUpdate("footer_url", url)} />
        <LegalEditable flyer={flyer} flyerId={flyer?.id} legal={flyer?.legal} onUpdate={(val) => onFlyerUpdate("legal", val)} IMPREC={IMPREC} />
      </Box>
    );
  }

  // --- RENDERIZADO REGULAR DEL PRODUCTO ---
  const size = TAMANO_SIZE[modulo.tamano] || TAMANO_SIZE["S"];
  const bgColor = FONDO_COLORS[modulo.fondo_modulo] ?? FONDO_COLORS.empty;
  const borderStyle = BORDER_STYLES[modulo.estilo_borde] || "1px solid #e2e8f0";

  const esMulti = ["2_productos", "3_productos", "4_productos"].includes(modulo.formato);

  let todosLosProductos = [];
  if (esMulti) {
    if (modulo.formato === "2_productos") {
      todosLosProductos = [
        { 
          producto: modulo.productos, 
          imgOverride: modulo.imagen_url, 
          nombreOverride: modulo.nombre, 
          descripcionOverride: modulo.descripcion,
          precioRegularOverride: modulo.precio_regular,
          stockOverride: modulo.stock
        },
        { 
          producto: modulo.productos_2, 
          imgOverride: modulo.imagen_url_2, 
          nombreOverride: modulo.nombre_2, 
          descripcionOverride: modulo.descripcion_2,
          precioRegularOverride: modulo.precio_regular_2,
          stockOverride: modulo.stock_2
        }
      ];
    }
  } else {
    todosLosProductos = [{ 
      producto: modulo.productos, 
      imgOverride: modulo.imagen_url, 
      nombreOverride: modulo.nombre, 
      descripcionOverride: modulo.descripcion,
      precioRegularOverride: modulo.precio_regular,
      stockOverride: modulo.stock
    }];
  }

  const gridCols = modulo.formato === "3_productos" ? 3 : modulo.formato === "4_productos" ? 2 : modulo.formato === "2_productos" ? 2 : 1;
  const isBgRed = modulo.fondo_modulo === "rojo";
  const textColor = isBgRed ? "#ffffff" : "#000000";

  const handleUpdateField = (field, value, index = 0) => {
    if (onUpdateModulo) {
      const keySuffix = index > 0 ? `_${index + 1}` : "";
      onUpdateModulo(modulo.id, { [`${field}${keySuffix}`]: value });
    }
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: "relative",
        bgcolor: bgColor,
        border: borderStyle,
        borderRadius: "4px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        cursor: "grab",
        "&:active": { cursor: "grabbing" },
        boxSizing: "border-box"
      }}
    >
     {!esMulti && todosLosProductos[0] && (
  <Box 
    sx={{ 
      flex: 1, 
      display: "flex", 
      flexDirection: colSpan > 1 ? "row" : "column", 
      alignItems: "center",
      position: "relative", 
      p: 0.8,
      gap: 1
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
      IMPREC={IMPREC}
      TARJETA_LOGO={TARJETA_LOGO}
      flyer={flyer}
      colSpan={colSpan} 
      rowSpan={rowSpan}
      onUpdateField={(field, value) => handleUpdateField(field, value, 0)}
    />
  </Box>
)}

      {esMulti && (
        <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${gridCols},1fr)`, flex: 1, p: 0.3 }}>
          {todosLosProductos.map((item, i) => (
            <MiniProducto 
              key={i} 
              producto={item.producto} 
              imgOverride={item.imgOverride} 
              nombreOverride={item.nombreOverride} 
              descripcionOverride={item.descripcionOverride} 
              precioRegularOverride={item.precioRegularOverride}
              stockOverride={item.stockOverride}
              textColor={textColor} 
              showPrice={false} 
              size={size} 
             colSpan={colSpan}
             rowSpan={rowSpan}
              isBgRed={isBgRed} 
              isModuloSelected={isSelected} 
              IMPREC={IMPREC} 
              TARJETA_LOGO={TARJETA_LOGO} 
              flyer={flyer}
              onUpdateField={(field, value) => handleUpdateField(field, value, i)} 
            />
          ))}
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
        IMPREC={IMPREC} 
        TARJETA_LOGO={TARJETA_LOGO} 
      />
    </Box>
  );
}