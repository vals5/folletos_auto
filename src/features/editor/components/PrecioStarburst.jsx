import { Box, Typography } from "@mui/material";
import MovableElement from "./MovableElement";
import { IMPREC, TARJETA_LOGO } from "../../../config/editorTheme";

import StarburstSvg from "../../../assets/img/Cucarda-Imprec.svg";

const formatPrecio = (valor) => {
  const n = Number(valor) || 0;
  const decimales = Number.isInteger(n) ? 0 : 2;
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales })}`;
};

export default function PrecioStarburst({
  precio,
  tipoPrecio,
  size = { width: 100, height: 100 },
  colSpan = 1,
  rowSpan = 1,
  isBgRed = false,
  edicionLibre = false,
  posPrecio,
  onPositionChange,
}) {
  const baseWidth = (size?.width || 100) * 0.5;

  const visualWidth = baseWidth * (colSpan || 1);

  const starSize = baseWidth > 100 ? 46 : baseWidth > 70 ? 38 : 31;
  const priceFontSize = baseWidth > 100 ? "9.5pt" : baseWidth > 70 ? "8pt" : "6.5pt";
  const subtFontSize = baseWidth > 100 ? "4.5pt" : "4pt";

  const tarjetaLogo = TARJETA_LOGO[tipoPrecio];
  const isLlevando = tipoPrecio === "llevando3";

  const priceColor = isBgRed ? IMPREC.colors.red : IMPREC.colors.black;
  const subtColor = isBgRed ? IMPREC.colors.red : IMPREC.colors.white;

  const esVertical = colSpan === 1 && rowSpan > 1;
  const posicionPorDefecto = {
    x: Math.max(0, esVertical ? (visualWidth - starSize) / 2 : visualWidth - starSize - 1),
    y: 1,
  };
  // Posición guardada por el usuario (edición libre) o la posición automática.
  const posicion = posPrecio && typeof posPrecio.x === "number" ? posPrecio : posicionPorDefecto;

  return (
    <MovableElement defaultPosition={posicion} isAbsolute disabled={!edicionLibre} onPositionChange={onPositionChange}>
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

        <Box
          sx={{
            position: "relative",
            zIndex: 52,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "85%",
          }}
        >
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

          <Typography
            sx={{
              ...IMPREC.price,
              fontSize: priceFontSize,
              fontWeight: 900,
              px: 0.1,
              whiteSpace: "nowrap",
              lineHeight: 0.95,
              color: priceColor,
              pointerEvents: "none",
            }}
          >
            {formatPrecio(precio)}
          </Typography>

          {isLlevando && (
            <Typography
              sx={{
                ...IMPREC.subtPrice,
                fontSize: subtFontSize,
                fontWeight: 700,
                letterSpacing: 0.2,
                color: subtColor,
                pointerEvents: "none",
                mt: 0.1,
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
