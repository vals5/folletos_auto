import { useState, useRef } from "react";
import { Box } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import MiniProducto from "./MiniProducto";
import PrecioStarburst from "./PrecioStarburst";

export default function SortableModuloCard({ modulo, isSelected, onClick, onMenuAction, onResize, flyer, TAMANO_SIZE, TIPO_PRECIO_LABEL, FONDO_COLORS, BORDER_STYLES, TAMANOS, IMPREC, TARJETA_LOGO }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: modulo.id });
  const [hovered, setHovered] = useState(false);
  const dragStartX = useRef(null);
  const dragStartIdx = useRef(null);

  const size = TAMANO_SIZE[modulo.tamano] || TAMANO_SIZE["S"];
  const bgColor = FONDO_COLORS[modulo.fondo_modulo] ?? FONDO_COLORS.empty;
  const borderStyle = isSelected ? "2px solid #f59e0b" : (BORDER_STYLES[modulo.estilo_borde] || "1px solid #e2e8f0");

  const esMulti = ["2_productos", "3_productos", "4_productos"].includes(modulo.formato);

  let todosLosProductos = [];
  if (esMulti) {
    if (modulo.formato === "2_productos") {
      todosLosProductos = [
        { producto: modulo.productos, imgOverride: modulo.imagen_url, nombreOverride: modulo.nombre, descripcionOverride: modulo.descripcion },
        { producto: modulo.productos_2, imgOverride: modulo.imagen_url_2, nombreOverride: modulo.nombre_2, descripcionOverride: modulo.descripcion_2 }
      ];
    }
  } else {
    todosLosProductos = [{ producto: modulo.productos, imgOverride: modulo.imagen_url, nombreOverride: modulo.nombre, descripcionOverride: modulo.descripcion }];
  }

  const gridCols = modulo.formato === "3_productos" ? 3 : modulo.formato === "4_productos" ? 2 : modulo.formato === "2_productos" ? 2 : 1;
  const isBgRed = modulo.fondo_modulo === "rojo";
  const textColor = isBgRed ? "#ffffff" : "#000000";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    width: size.width * 0.5,
    height: size.height * 0.5,
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    dragStartX.current = e.clientX;
    const actuales = ["S", "M", "L", "XL"];
    dragStartIdx.current = actuales.indexOf(modulo.tamano || "S");

    const onMouseMove = (ev) => {
      if (dragStartX.current === null) return;
      const deltaX = ev.clientX - dragStartX.current;
      const pasos = Math.round(deltaX / 35);
      let nuevoIdx = dragStartIdx.current + pasos;
      nuevoIdx = Math.max(0, Math.min(actuales.length - 1, nuevoIdx));
      const nuevoTamano = actuales[nuevoIdx];
      if (nuevoTamano !== modulo.tamano) {
        onResize(modulo.id, nuevoTamano);
      }
    };

    const onMouseUp = () => {
      dragStartX.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
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
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", p: 0.5 }}>
          <MiniProducto
            producto={todosLosProductos[0].producto}
            imgOverride={todosLosProductos[0].imgOverride}
            nombreOverride={todosLosProductos[0].nombreOverride}
            descripcionOverride={todosLosProductos[0].descripcionOverride}
            textColor={textColor}
            showPrice={false}
            size={size}
            isBgRed={isBgRed}
            isModuloSelected={isSelected}
            IMPREC={IMPREC}
            TARJETA_LOGO={TARJETA_LOGO}
            flyer={flyer}
          />
        </Box>
      )}

      {esMulti && (
        <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${gridCols},1fr)`, flex: 1, p: 0.3 }}>
          {todosLosProductos.map((item, i) => (
            <MiniProducto key={i} producto={item.producto} imgOverride={item.imgOverride} nombreOverride={item.nombreOverride} descripcionOverride={item.descripcionOverride} textColor={textColor} showPrice={false} size={size} isBgRed={isBgRed} isModuloSelected={isSelected} IMPREC={IMPREC} TARJETA_LOGO={TARJETA_LOGO} flyer={flyer} />
          ))}
        </Box>
      )}

      {/* MODIFICADO: Le pasamos 'size' directo sin alteraciones. La escala 0.5 la calcula adentro el componente PrecioStarburst */}
      <PrecioStarburst 
        precio={modulo.precio} 
        tipoPrecio={modulo.tipo_precio} 
        size={size} 
        isBgRed={isBgRed} 
        isModuloSelected={isSelected} 
        IMPREC={IMPREC} 
        TARJETA_LOGO={TARJETA_LOGO} 
      />

      {isSelected && (
        <Box onMouseDown={handleResizeMouseDown} sx={{ position: "absolute", bottom: 3, right: 3, zIndex: 60, width: 10, height: 10, borderRadius: "50%", bgcolor: "#f59e0b", border: "2px solid white", cursor: "se-resize", boxShadow: "0 1px 3px rgba(0,0,0,0.4)", "&:hover": { bgcolor: "#ef4444", transform: "scale(1.3)" }, transition: "transform 0.1s" }} />
      )}
    </Box>
  );
}