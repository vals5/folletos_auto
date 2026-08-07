import { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";

import StarburstSvg from "../../assets/img/Cucarda-Imprec.svg";

export default function PrecioStarburst({
  precio,
  tipoPrecio,
  size = { width: 100, height: 100 },
  colSpan = 1,
  rowSpan = 1,
  isBgRed = false,
  isModuloSelected = false,
  IMPREC = { colors: { red: "#ef4444", white: "#ffffff", black: "#000000" }, price: {}, subtPrice: {} },
  TARJETA_LOGO = {},
}) {
  const baseWidth = (size?.width || 100) * 0.5;
  const baseHeight = (size?.height || 100) * 0.5;

  const visualWidth = baseWidth * (colSpan || 1);
  const visualHeight = baseHeight * (rowSpan || 1);

  const starSize = baseWidth > 100 ? 52 : baseWidth > 70 ? 44 : 36;

  const priceFontSize = baseWidth > 100 ? "11pt" : baseWidth > 70 ? "9pt" : "7.5pt";
  const subtFontSize = baseWidth > 100 ? "5pt" : "4.5pt";

  const tarjetaLogo = TARJETA_LOGO[tipoPrecio];
  const isLlevando = tipoPrecio === "llevando3";

  const subtColor = isBgRed ? IMPREC?.colors?.red : IMPREC?.colors?.white;
  const priceColor = isBgRed ? IMPREC?.colors?.red : IMPREC?.colors?.black;

  const precioValido = Number(precio) || 0;
  const precioDisplay = `$${precioValido.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

  const [pos, setPos] = useState({ x: visualWidth - starSize - 1, y: 1 });

  // Reubica la cucarda en la esquina superior derecha cada vez que cambia el colSpan/rowSpan
  useEffect(() => {
    setPos({ x: Math.max(0, visualWidth - starSize - 1), y: 1 });
  }, [colSpan, rowSpan, visualWidth, visualHeight, starSize]);

  const dragging = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();

    dragging.current = true;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current = { ...pos };

    const parent = e.currentTarget.parentElement;
    const currentParentWidth = parent?.clientWidth || visualWidth;
    const currentParentHeight = parent?.clientHeight || visualHeight;

    const maxLeft = Math.max(0, currentParentWidth - starSize);
    const maxTop = Math.max(0, currentParentHeight - starSize);

    const onMove = (ev) => {
      if (!dragging.current) return;
      ev.stopPropagation();
      
      const newX = Math.min(Math.max(startPos.current.x + ev.clientX - startMouse.current.x, -5), maxLeft + 5);
      const newY = Math.min(Math.max(startPos.current.y + ev.clientY - startMouse.current.y, -5), maxTop + 5);
      
      setPos({ x: newX, y: newY });
    };

    const onUp = (ev) => {
      ev.stopPropagation();
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <Box
      data-no-dnd="true"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      sx={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        zIndex: 99,
        width: starSize,
        height: starSize,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        cursor: "grab",
        "&:active": { cursor: "grabbing" },
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
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "85%" }}>
        {tarjetaLogo && (
          <Box
            component="img"
            src={tarjetaLogo}
            sx={{ width: starSize * 0.5, height: starSize * 0.2, objectFit: "contain", pointerEvents: "none", mb: 0.1 }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
        <Typography sx={{ ...(IMPREC?.price || {}), fontSize: priceFontSize, fontWeight: 900, px: 0.1, whiteSpace: "nowrap", lineHeight: 0.95, color: priceColor, pointerEvents: "none" }}>
          {precioDisplay}
        </Typography>
        {isLlevando && (
          <Typography sx={{ ...(IMPREC?.subtPrice || {}), fontSize: subtFontSize, fontWeight: 700, letterSpacing: 0.2, color: subtColor, pointerEvents: "none", mt: 0.1 }}>
            X UNIDAD
          </Typography>
        )}
      </Box>
    </Box>
  );
}