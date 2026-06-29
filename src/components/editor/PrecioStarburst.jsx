import { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";

export default function PrecioStarburst({ precio, tipoPrecio, size, isBgRed = false, isModuloSelected = false, IMPREC, TARJETA_LOGO }) {
  const starSize = size.width > 200 ? 82 : size.width > 140 ? 66 : 54;
  const priceFontSize = size.width > 200 ? "15pt" : size.width > 140 ? "12pt" : "9pt";
  const subtFontSize = size.width > 200 ? "6pt" : "5pt";
  const tarjetaLogo = TARJETA_LOGO[tipoPrecio];
  const isLlevando = tipoPrecio === "llevando3";

  const starColor = isBgRed ? IMPREC.colors.white : IMPREC.colors.red;
  const starColor = isBgRed ? IMPREC.colors.white : IMPREC.colors.red;
  const subtColor = isBgRed ? IMPREC.colors.red : IMPREC.colors.white;

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
      sx={{ position: "absolute", left: pos.x, top: pos.y, zIndex: 50, width: starSize, height: starSize, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", cursor: isModuloSelected ? "grab" : "default", "&:active": { cursor: isModuloSelected ? "grabbing" : "default" }, }} >
      <svg viewBox="0 0 100 100" style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0, pointerEvents: "none" }}>
        <path
          d="M50 0 L55 9 L64 4 L66 14 L76 11 L75 21 L85 21 L82 31 L91 33 L85 42 L93 47 L84 53 L90 62 L80 65 L83 75 L73 75 L73 85 L63 82 L61 91 L52 86 L48 95 L41 87 L35 94 L31 84 L22 88 L21 78 L11 79 L14 70 L5 67 L11 59 L3 53 L12 47 L6 38 L16 35 L12 25 L22 25 L21 15 L31 17 L34 8 L42 13 Z"
          fill={starColor} /> </svg>

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