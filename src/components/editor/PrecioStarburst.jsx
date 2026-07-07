import { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";

// IMPORTANTE: Ajustá esta ruta al nombre exacto de tu archivo SVG
import StarburstSvg from "../../assets/img/precio-starburst.svg";

export default function PrecioStarburst({ precio, tipoPrecio, size, isBgRed = false, isModuloSelected = false, IMPREC, TARJETA_LOGO }) {
  // Calculamos las dimensiones visuales (escaladas al 50% igual que el contenedor)
  const visualWidth = size.width * 0.5;
  const visualHeight = size.height * 0.5;

  // Ajustamos el tamaño del círculo para que sea compacto y no invada el espacio del producto
  const starSize = visualWidth > 100 ? 52 : visualWidth > 70 ? 44 : 36;
  
  // Tipografía bien ajustada para que el número quepa adentro sin desbordar
  const priceFontSize = visualWidth > 100 ? "11pt" : visualWidth > 70 ? "9pt" : "7.5pt";
  const subtFontSize = visualWidth > 100 ? "5pt" : "4.5pt";
  
  const tarjetaLogo = TARJETA_LOGO[tipoPrecio];
  const isLlevando = tipoPrecio === "llevando3";

  const subtColor = isBgRed ? IMPREC.colors.red : IMPREC.colors.white;
  const priceColor = isBgRed ? IMPREC.colors.red : IMPREC.colors.black;

  const precioDisplay = `$${precio.toLocaleString("es-AR")}`;

  // Posicionamiento inicial automático: Esquina superior derecha limpia
  const [pos, setPos] = useState({ x: visualWidth - starSize - 4, y: 4 });

  useEffect(() => {
    setPos({ x: visualWidth - starSize - 4, y: 4 });
  }, [visualWidth, visualHeight, starSize]);

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
      // Límites de arrastre basados en el tamaño visual real de la tarjeta
      const newX = Math.min(Math.max(startPos.current.x + ev.clientX - startMouse.current.x, -5), visualWidth - starSize + 5);
      const newY = Math.min(Math.max(startPos.current.y + ev.clientY - startMouse.current.y, -5), visualHeight - starSize + 5);
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
        src={StarburstSvg} 
        alt="Fondo de Precio"
        sx={{ 
          position: "absolute", 
          width: "100%", 
          height: "100%", 
          top: 0, 
          left: 0, 
          pointerEvents: "none"
        }} 
      />

      <Box sx={{ position: "relative", zIndex: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "85%" }}>
        {tarjetaLogo && (
          <Box
            component="img"
            src={tarjetaLogo}
            sx={{ width: starSize * 0.5, height: starSize * 0.2, objectFit: "contain", pointerEvents: "none", mb: 0.1 }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
        <Typography sx={{ ...IMPREC.price, fontSize: priceFontSize, fontWeight: 900, px: 0.1, whiteSpace: "nowrap", lineHeight: 0.95, color: priceColor, pointerEvents: "none" }}>
          {precioDisplay}
        </Typography>
        {isLlevando && (
          <Typography sx={{ ...IMPREC.subtPrice, fontSize: subtFontSize, fontWeight: 700, letterSpacing: 0.2, color: subtColor, pointerEvents: "none", mt: 0.1 }}>
            X UNIDAD
          </Typography>
        )}
      </Box>

      {isModuloSelected && (
        <Box sx={{ position: "absolute", top: -2, left: -2, right: -2, bottom: -2, border: "1.5px dashed #f59e0b", borderRadius: "50%", pointerEvents: "none", zIndex: 53 }} />
      )}
    </Box>
  );
}