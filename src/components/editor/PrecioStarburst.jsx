import { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import Cucarda from "../../assets/img/Cucarda-Imprec.svg";

export default function PrecioStarburst({ precio, tipoPrecio, size, isBgRed = false, isModuloSelected = false, IMPREC, TARJETA_LOGO }) {
  const starSize = size.width > 200 ? 82 : size.width > 140 ? 66 : 54;
  const priceFontSize = size.width > 200 ? "15pt" : size.width > 140 ? "12pt" : "9pt";
  const subtFontSize = size.width > 200 ? "6pt" : "5pt";
  const tarjetaLogo = TARJETA_LOGO[tipoPrecio];
  const isLlevando = tipoPrecio === "llevando3";

  const subtColor = isBgRed ? IMPREC.colors.red : IMPREC.colors.white;
  const priceColor = isBgRed ? IMPREC.colors.red : IMPREC.colors.black;

  const precioDisplay = `$${precio.toLocaleString("es-AR")}`;
  const [pos, setPos] = useState({ x: size.width - starSize - 2, y: size.height - starSize - 2 });

  useEffect(() => {
    setPos({ x: size.width - starSize - 2, y: size.height - starSize - 2 });
  }, [size.width, size.height, starSize]);

  const dragging = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!isModuloSelected) return;
    e.stopPropagation();
    e.preventDefault();
    dragging.current = true;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current = { ...pos };

    const onMove = (ev) => {
      if (!dragging.current) return;
      const newX = Math.min(Math.max(startPos.current.x + ev.clientX - startMouse.current.x, -10), size.width - starSize + 10);
      const newY = Math.min(Math.max(startPos.current.y + ev.clientY - startMouse.current.y, -10), size.height - starSize + 10);
      setPos({ x: newX, y: newY });
    };

    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <Box
      onMouseDown={handleMouseDown}
      sx={{ 
        position: "absolute", 
        left: pos.x, 
        top: pos.y, 
        zIndex: 50, 
        width: starSize, 
        height: starSize, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        justifyContent: "center", 
        textAlign: "center", 
        cursor: isModuloSelected ? "grab" : "default", 
        "&:active": { cursor: isModuloSelected ? "grabbing" : "default" } 
      }} 
    >
      <Box 
        component="img" 
        src={Cucarda} 
        alt="Fondo de Precio"
        sx={{ 
          position: "absolute", 
          width: "100%", 
          height: "100%", 
          top: 0, 
          left: 0, 
          pointerEvents: "none",
          // Si el SVG necesita cambiar de color según el fondo, podés usar un filter CSS, 
          // de lo contrario se renderizará con sus colores originales de fábrica.
          filter: isBgRed ? "none" : "none" 
        }} 
      />

      <Box sx={{ position: "relative", zIndex: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "80%" }}>
        {tarjetaLogo && (
          <Box
            component="img"
            src={tarjetaLogo}
            sx={{ width: starSize * 0.45, height: starSize * 0.18, objectFit: "contain", pointerEvents: "none", mb: 0.1 }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
        <Typography sx={{ ...IMPREC.price, fontSize: priceFontSize, fontWeight: 900, px: 0.2, whiteSpace: "nowrap", lineHeight: 0.95, color: priceColor, pointerEvents: "none" }}>
          {precioDisplay}
        </Typography>
        {isLlevando && (
          <Typography sx={{ ...IMPREC.subtPrice, fontSize: subtFontSize, fontWeight: 700, letterSpacing: 0.2, color: subtColor, pointerEvents: "none", mt: 0.2 }}>
            X UNIDAD
          </Typography>
        )}
      </Box>

      {isModuloSelected && (
        <Box sx={{ position: "absolute", top: -4, left: -4, right: -4, bottom: -4, border: "2px dashed #f59e0b", borderRadius: "50%", pointerEvents: "none", zIndex: 53 }} />
      )}
    </Box>
  );
}