import { useState } from "react";
import { Box, Typography } from "@mui/material";
import InlineText from "../../../components/ui/InlineText";
import MovableElement from "./MovableElement";
import { IMPREC } from "../../../config/editorTheme";

// Contenido de un módulo: imagen, nombre, descripción y precio regular.
// (El precio "starburst" lo dibuja SortableModuloCard.)
export default function MiniProducto({
  producto,
  colSpan = 1,
  rowSpan = 1,
  textColor = "#000000",
  edicionLibre = false,
  nombreOverride,
  descripcionOverride,
  precioRegularOverride,
  imgOverride,
  esPromo = false,
  posImagen,
  posTexto,
  onPositionChange,
}) {
  const imgSrc = (imgOverride || producto?.imagen_url || producto?.imagen || "").trim();
  const [errorSrc, setErrorSrc] = useState(null);
  const imgError = errorSrc === imgSrc;

  const nombre = nombreOverride || producto?.nombre || "";
  const desc = descripcionOverride ?? producto?.descripcion ?? "";
  const precioRegular = precioRegularOverride || producto?.precio_regular || "";

  const spanC = Number(colSpan) || 1;
  const spanR = Number(rowSpan) || 1;

  const esHorizontal = spanC > 1;
  const esVertical2x1 = spanC === 1 && spanR > 1;
  const esNormal1x1 = spanC === 1 && spanR === 1;

  const es3x1 = spanC === 3 || producto?.formato === "footer";
  if (es3x1 && esPromo && imgSrc) {
    return (
      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", p: 0 }}>
        <img
          src={imgSrc}
          crossOrigin="anonymous"
          decoding="sync"
          alt="Promo Bancaria"
          style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
        />
      </Box>
    );
  }

  const nameFontSize = spanC >= 2 ? "0.85rem" : esVertical2x1 ? "0.68rem" : "0.52rem";
  const descFontSize = spanC >= 2 ? "0.65rem" : esVertical2x1 ? "0.55rem" : "0.44rem";
  const priceFontSize = spanC >= 2 ? "0.58rem" : esVertical2x1 ? "0.50rem" : "0.42rem";

  const claro = textColor === "#ffffff";

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: esHorizontal ? "row" : "column",
        justifyContent: esVertical2x1 ? "flex-end" : "space-between",
        alignItems: "center",
        position: "relative",
        boxSizing: "border-box",
        p: esHorizontal ? 0.8 : 0.4,
        gap: esHorizontal ? 0.5 : 0.3,
        overflow: "hidden",
      }}
    >
      {esVertical2x1 && <Box sx={{ flex: "0 0 5%" }} />}

      {/* IMAGEN */}
      <MovableElement
        disabled={!edicionLibre}
        defaultPosition={posImagen || { x: 0, y: 0 }}
        onPositionChange={(pos) => onPositionChange?.("pos_imagen", pos)}
        sx={{
          order: esHorizontal ? 2 : 1,
          flex: 1,
          minHeight: 0,
          width: esNormal1x1 ? "60%" : esHorizontal ? "70%" : "100%",
          alignSelf: esNormal1x1 ? "flex-start" : "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: esVertical2x1 ? 0.5 : 0,
          p: 0.2,
        }}
      >
        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            crossOrigin="anonymous"
            decoding="sync"
            alt={nombre || "Producto"}
            onError={() => setErrorSrc(imgSrc)}
            style={{
              width: "100%",
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "70%",
              height: "70%",
              bgcolor: "rgba(0,0,0,0.04)",
              borderRadius: 1,
              border: "1px dashed #cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography fontSize={10} color="#9ca3af" fontWeight={600}>
              IMG
            </Typography>
          </Box>
        )}
      </MovableElement>

      {/* TEXTO */}
      <MovableElement
        disabled={!edicionLibre}
        defaultPosition={posTexto || { x: 0, y: 0 }}
        onPositionChange={(pos) => onPositionChange?.("pos_texto", pos)}
        sx={{
          order: esHorizontal ? 1 : 2,
          flex: "none",
          width: esHorizontal ? "55%" : "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: esHorizontal ? "center" : "flex-start",
          alignItems: esVertical2x1 ? "center" : "flex-start",
          textAlign: esVertical2x1 ? "center" : "left",
          zIndex: 10,
          pb: esVertical2x1 ? 1 : 0,
          overflow: "visible",
        }}
      >
        <Typography
          sx={{
            fontFamily: IMPREC.productName.fontFamily,
            color: textColor || "#000000",
            fontSize: nameFontSize,
            fontWeight: 900,
            lineHeight: 1.05,
            p: 0,
            m: 0,
            mb: "2px",
            textTransform: "uppercase",
            width: "100%",
            display: "block",
            whiteSpace: "normal",
            wordBreak: "break-word",
            userSelect: "none",
          }}
        >
          {nombre || "NOMBRE PRODUCTO"}
        </Typography>

        <Typography
          sx={{
            fontFamily: IMPREC.productDesc.fontFamily,
            color: claro ? "rgba(255,255,255,0.9)" : "#333333",
            fontSize: descFontSize,
            fontWeight: 600,
            lineHeight: 1.05,
            p: 0,
            m: 0,
            mb: "4px",
            textTransform: "uppercase",
            width: "100%",
            display: "block",
            whiteSpace: "normal",
            wordBreak: "break-word",
            userSelect: "none",
          }}
        >
          {desc || "DESCRIPCIÓN / PRESENTACIÓN"}
        </Typography>

        <Box sx={{ px: 0, py: 0.1, display: "flex", flexDirection: "column", gap: 0.1, mt: esVertical2x1 ? 0.5 : 0, pointerEvents: "none" }}>
          <Box display="flex" alignItems="center" gap={0.3}>
            <Typography
              sx={{
                ...IMPREC.regPrice,
                fontSize: priceFontSize,
                color: claro ? "rgba(255,255,255,0.8)" : "#000000",
                whiteSpace: "nowrap",
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              PRECIO REGULAR:
            </Typography>
            <InlineText
              value={precioRegular ? `$ ${precioRegular}` : ""}
              placeholder="$ 0"
              style={{
                ...IMPREC.regPrice,
                color: claro ? "#ffffff" : "#000000",
                fontSize: priceFontSize,
                lineHeight: 1,
                display: "inline-block",
              }}
            />
          </Box>
        </Box>
      </MovableElement>
    </Box>
  );
}
