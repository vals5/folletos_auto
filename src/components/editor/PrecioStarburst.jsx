import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import MovableElement from "./MovableElement";

import StarburstSvg from "../../assets/img/Cucarda-Imprec.svg";

export default function PrecioStarburst({
  precio,
  tipoPrecio,
  size = { width: 100, height: 100 },
  colSpan = 1,
  rowSpan = 1,
  isBgRed = false,
  isModuloSelected = false,
  IMPREC = { colors: { red: "#dc2626", white: "#ffffff", black: "#000000" }, price: {}, subtPrice: {} },
  TARJETA_LOGO = {},
}) {
  const baseWidth = (size?.width || 100) * 0.5;
  const baseHeight = (size?.height || 100) * 0.5;

  const visualWidth = baseWidth * (colSpan || 1);
  const visualHeight = baseHeight * (rowSpan || 1);

  // Tamaño adaptativo
  const starSize = baseWidth > 100 ? 46 : baseWidth > 70 ? 38 : 31;

  // Fuentes proporcionales
  const priceFontSize = baseWidth > 100 ? "9.5pt" : baseWidth > 70 ? "8pt" : "6.5pt";
  const subtFontSize = baseWidth > 100 ? "4.5pt" : "4pt";

  const tarjetaLogo = TARJETA_LOGO[tipoPrecio];
  const isLlevando = tipoPrecio === "llevando3";

  // COLOR DEL PRECIO Y SUBTÍTULO
  const redColor = IMPREC?.colors?.red || "#dc2626";
  const priceColor = isBgRed ? redColor : (IMPREC?.colors?.black || "#000000");
  const subtColor = isBgRed ? redColor : (IMPREC?.colors?.white || "#ffffff");

  const precioValido = Number(precio) || 0;
  const precioDisplay = `$${precioValido.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

  const esVertical = colSpan === 1 && rowSpan > 1;

  const [posicionInicial, setPosicionInicial] = useState({ x: 0, y: 1 });

  useEffect(() => {
    const posicionX = esVertical ? (visualWidth - starSize) / 2 : visualWidth - starSize - 1;
    setPosicionInicial({ x: Math.max(0, posicionX), y: 1 });
  }, [colSpan, rowSpan, visualWidth, visualHeight, starSize, esVertical]);

  return (
    <MovableElement defaultPosition={posicionInicial} isAbsolute={true} useBounds={true}>
      <Box
        sx={{
          width: starSize,
          height: starSize,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {/* FONDO CUCARDA */}
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
            filter: isBgRed ? "brightness(0) invert(1)" : "none",
          }}
        />

        {/* CONTENIDO INTERNO */}
        <Box sx={{ position: "relative", zIndex: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "85%" }}>
          {tarjetaLogo && (
            <Box
              component="img"
              src={tarjetaLogo}
              sx={{ width: starSize * 0.5, height: starSize * 0.2, objectFit: "contain", pointerEvents: "none", mb: 0.1 }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
          
          <Typography 
            sx={{ 
              ...(IMPREC?.price || {}), 
              fontSize: priceFontSize, 
              fontWeight: 900, 
              px: 0.1, 
              whiteSpace: "nowrap", 
              lineHeight: 0.95, 
              color: priceColor,
              pointerEvents: "none" 
            }}
          >
            {precioDisplay}
          </Typography>

          {isLlevando && (
            <Typography 
              sx={{ 
                ...(IMPREC?.subtPrice || {}), 
                fontSize: subtFontSize, 
                fontWeight: 700, 
                letterSpacing: 0.2, 
                color: subtColor, 
                pointerEvents: "none", 
                mt: 0.1 
              }}
            >
              X UNIDAD
            </Typography>
          )}
        </Box>
      </Box>
    </MovableElement>
  );
}