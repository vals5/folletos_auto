import { useState, useRef } from "react";
import { Box, Typography, Menu, MenuItem } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import MiniProducto from "./MiniProducto";
import PrecioStarburst from "./PrecioStarburst";

export default function SortableModuloCard({ modulo, isSelected, onClick, onMenuAction, onResize, flyer, TAMANO_SIZE, TIPO_PRECIO_LABEL, FONDO_COLORS, BORDER_STYLES, TAMANOS, IMPREC, TARJETA_LOGO }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: modulo.id });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [hovered, setHovered] = useState(false);
  const dragStartX = useRef(null);
  const dragStartIdx = useRef(null);

  const size = TAMANO_SIZE[modulo.tamano] || TAMANO_SIZE["S"];
  const priceLabel = TIPO_PRECIO_LABEL[modulo.tipo_precio];
  const bgColor = FONDO_COLORS[modulo.fondo_modulo] ?? FONDO_COLORS.empty;
  const borderStyle = isSelected ? "2px solid #f59e0b" : (BORDER_STYLES[modulo.estilo_borde] || "none");
  const tamanoIdx = TAMANOS.indexOf(modulo.tamano);
  const isBgRed = modulo.fondo_modulo === "red";
  const textColor = isBgRed ? IMPREC.colors.white : IMPREC.colors.black;

  const productosExtra = modulo.productos_extra || [];
  const todosLosProductos = [
    { producto: modulo.productos, imgOverride: modulo.imagen_url_override, nombreOverride: modulo.nombre_override, descripcionOverride: modulo.descripcion_override, precio: modulo.precio },
    ...productosExtra.map((pe) => ({ producto: pe.producto, imgOverride: pe.imagen_url_override, nombreOverride: undefined, descripcionOverride: undefined, precio: pe.precio })),
  ];
  const esMulti = todosLosProductos.length > 1;
  const gridCols = todosLosProductos.length <= 2 ? todosLosProductos.length : 2;

  const openMenu = (e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); };
  const closeMenu = () => setMenuAnchor(null);

  const handleResizeMouseDown = (e) => {
    e.stopPropagation(); e.preventDefault();
    dragStartX.current = e.clientX; dragStartIdx.current = tamanoIdx;
    const onMove = (ev) => {
      const steps = Math.round((ev.clientX - dragStartX.current) / 40);
      const newIdx = Math.min(Math.max(dragStartIdx.current + steps, 0), TAMANOS.length - 1);
      if (TAMANOS[newIdx] !== modulo.tamano) onResize(modulo.id, TAMANOS[newIdx]);
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
  };

  const nombreMostrado = modulo.nombre_override ?? modulo.productos?.nombre ?? "Sin nombre";
  const descMostrada = modulo.descripcion_override !== undefined && modulo.descripcion_override !== null ? modulo.descripcion_override : modulo.productos?.descripcion;

  return (
    <Box position="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {(hovered || !!menuAnchor) && (
        <Box onClick={openMenu} sx={{ position: "absolute", top: 4, right: 4, zIndex: 60, bgcolor: "rgba(0,0,0,0.55)", borderRadius: 1, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>
          <MoreHorizIcon sx={{ color: "white", fontSize: 14 }} />
        </Box>
      )}
      {(hovered || isSelected) && (
        <Box {...listeners} {...attributes} sx={{ position: "absolute", top: 4, left: 4, zIndex: 60, bgcolor: "rgba(0,0,0,0.45)", borderRadius: 1, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "grab", "&:active": { cursor: "grabbing" }, "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }} onMouseDown={(e) => e.stopPropagation()}>
          <DragIndicatorIcon sx={{ color: "white", fontSize: 14 }} />
        </Box>
      )}
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu} PaperProps={{ sx: { minWidth: 160, borderRadius: 2 } }}>
        <MenuItem onClick={() => { closeMenu(); onMenuAction("duplicar", modulo); }} sx={{ fontSize: 13 }}>Duplicar módulo</MenuItem>
        <MenuItem onClick={() => { closeMenu(); onMenuAction("eliminar", modulo); }} sx={{ fontSize: 13, color: "#ef4444" }}>Eliminar módulo</MenuItem>
      </Menu>
      
      <Box ref={setNodeRef} onClick={onClick} sx={{ width: "100%", height: "100%", bgcolor: bgColor, border: borderStyle, borderRadius: "3px", display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "space-between", p: 0.5, cursor: "pointer", position: "relative", opacity: isDragging ? 0.5 : 1, boxShadow: isSelected ? "0 0 0 3px #f59e0b55" : bgColor === "transparent" ? "none" : "0 1px 4px rgba(0,0,0,0.18)", transform: CSS.Transform.toString(transform), transition, overflow: "visible" }}>
        {priceLabel && !esMulti && (
          <Box sx={{ width: "100%", bgcolor: IMPREC.colors.red, display: "flex", alignItems: "center", justifyContent: "center", py: 0.2, mb: 0.2 }}>
            <Typography sx={{ ...IMPREC.subtPrice, fontSize: "6pt", color: IMPREC.colors.white, letterSpacing: 0.8 }}>
              {priceLabel}
            </Typography>
          </Box>
        )}
        
        {!esMulti && (() => {
          const imgSrc = modulo.imagen_url_override || modulo.productos?.imagen_url;
          const esLayoutHorizontal = modulo.tamano === "L" || modulo.tamano === "XL";

          const renderImagen = (heightPct = "100%", maxWidthPct = "85%") => (
            <Box sx={{ height: heightPct, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {imgSrc ? (
                <Box component="img" crossOrigin="anonymous" src={imgSrc} alt={nombreMostrado} sx={{ maxWidth: maxWidthPct, maxHeight: "100%", objectFit: "contain", display: "block" }} onError={(e) => { e.target.style.visibility = "hidden"; }} />
              ) : (
                <Box sx={{ width: "50%", height: "85%", bgcolor: "#f3f4f6", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography fontSize={7} color="#9ca3af">IMG</Typography>
                </Box>
              )}
            </Box>
          );

          const renderTextosComerciales = (align = "center") => (
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: align, width: "100%" }}>
              <Typography sx={{ ...IMPREC.productName, color: textColor, fontSize: "7.5pt", lineHeight: 0.95, textAlign: align, width: "100%", wordBreak: "break-word" }}>
                {nombreMostrado}
              </Typography>
              {descMostrada && (
                <Typography sx={{ ...IMPREC.productDesc, color: isBgRed ? "rgba(255,255,255,0.75)" : "#555", fontSize: "6pt", lineHeight: 0.95, textAlign: align, width: "100%", wordBreak: "break-word", mt: 0.1 }}>
                  {descMostrada}
                </Typography>
              )}
            </Box>
          );

          const renderLegales = (align = "center", border = false) => (
            <Box sx={{ width: "100%", textAlign: align, borderLeft: border && !isBgRed ? "1px solid rgba(0, 0, 0, 0.15)" : "none", borderLeftColor: border && isBgRed ? "rgba(255, 255, 255, 0.3)" : "none", pl: border ? 0.6 : 0, mt: 0.2 }}>
              <Typography sx={{ fontFamily: "'Imprec-RegPrice', sans-serif", fontSize: "4.8pt", color: isBgRed ? "white" : "black", lineHeight: 1, whiteSpace: "nowrap" }}>
                PRECIO REG. ${modulo.precio_regular || "0.00"} / SIN IMPUESTOS ${modulo.precio_sin_impuestos || "0.00"}
              </Typography>
              <Typography sx={{ fontFamily: "'Imprec-kgPrice', sans-serif", fontSize: "4.8pt", color: isBgRed ? "rgba(255,255,255,0.8)" : "#333", lineHeight: 1, whiteSpace: "nowrap", mt: 0.1 }}>
                POR KG: ${modulo.precio_kg || "0.00"} | DISPONIBLES: {modulo.stock || "100"} UN.
              </Typography>
            </Box>
          );

          if (esLayoutHorizontal) {
            return (
              <Box sx={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", alignItems: "center", p: 0.3 }}>
                <Box sx={{ width: "40%", height: "100%" }}>{renderImagen("100%", "95%")}</Box>
                <Box sx={{ width: "60%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 0.2, pl: 0.5 }}>
                  {renderTextosComerciales("left")}
                  {renderLegales("left", true)}
                </Box>
              </Box>
            );
          } else {
            return (
              <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
                <Box sx={{ height: "35%", width: "100%", mt: priceLabel ? 0.1 : 0.4 }}>{renderImagen("100%", "85%")}</Box>
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", px: 0.3, gap: 0.15 }}>
                  {renderTextosComerciales("center")}
                  {renderLegales("center", false)}
                </Box>
              </Box>
            );
          }
        })()}

        {esMulti && (
          <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${gridCols},1fr)`, flex: 1, p: 0.3 }}>
            {todosLosProductos.map((item, i) => (
              <MiniProducto key={i} producto={item.producto} imgOverride={item.imgOverride} nombreOverride={item.nombreOverride} descripcionOverride={item.descripcionOverride} textColor={textColor} showPrice={i === todosLosProductos.length - 1} precio={modulo.precio} tipoPrecio={modulo.tipo_precio} size={size} isBgRed={isBgRed} isModuloSelected={isSelected} IMPREC={IMPREC} TARJETA_LOGO={TARJETA_LOGO} flyer={flyer} />
            ))}
          </Box>
        )}

        {isSelected && (
          <Box onMouseDown={handleResizeMouseDown} sx={{ position: "absolute", bottom: 3, right: 3, zIndex: 20, width: 10, height: 10, borderRadius: "50%", bgcolor: "#f59e0b", border: "2px solid white", cursor: "se-resize", boxShadow: "0 1px 3px rgba(0,0,0,0.4)", "&:hover": { bgcolor: "#ef4444", transform: "scale(1.3)" }, transition: "transform 0.1s" }} />
        )}
      </Box>

      {modulo.precio && !esMulti && (
        <PrecioStarburst precio={modulo.precio} tipoPrecio={modulo.tipo_precio} size={size} isBgRed={isBgRed} isModuloSelected={isSelected} IMPREC={IMPREC} TARJETA_LOGO={TARJETA_LOGO} />
      )}
    </Box>
  );
}