import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import PrecioStarburst from "./PrecioStarburst";
import InlineText from "../ui/InlineText"; 

export default function MiniProducto({
  producto,
  showPrice = true,
  precio = "",
  tipoPrecio = "regular",
  size = "S",
  colSpan = 1,
  rowSpan = 1,
  isBgRed = false,
  textColor = "#000000",
  isModuloSelected = false,
  IMPREC,
  TARJETA_LOGO,
  onUpdateField,
  nombreOverride,
  descripcionOverride,
  precioRegularOverride,
  imgOverride,
}) {
  const [imgError, setImgError] = useState(false);

  const getImageUrl = () => {
    let url = imgOverride || producto?.imagen_url || producto?.imagen || producto?.img || producto?.image || producto?.imagen_src || producto?.img_url;
    if (typeof url === "string") return url.trim();
    if (Array.isArray(url) && typeof url[0] === "string") return url[0];
    if (typeof url === "object" && url !== null) return url.url || url.src || url.imagen || "";
    return "";
  };
  
  const imgSrc = getImageUrl();
  const nombre = nombreOverride || producto?.nombre || "";
  const desc = descripcionOverride !== undefined && descripcionOverride !== null ? descripcionOverride : producto?.descripcion || "";
  const precioRegular = precioRegularOverride || producto?.precio_regular || "";

  useEffect(() => { setImgError(false); }, [imgSrc]);

  const spanC = Number(colSpan) || 1;
  const spanR = Number(rowSpan) || 1;
  
  const esHorizontal = spanC > 1; 
  const esVertical2x1 = spanC === 1 && spanR > 1; 
  const esNormal1x1 = spanC === 1 && spanR === 1;

  const nameFontSize = spanC >= 2 ? "0.85rem" : esVertical2x1 ? "0.68rem" : "0.52rem";
  const descFontSize = spanC >= 2 ? "0.65rem" : esVertical2x1 ? "0.55rem" : "0.44rem";
  const priceFontSize = spanC >= 2 ? "0.58rem" : esVertical2x1 ? "0.50rem" : "0.42rem";

  return (
    <Box
      sx={{
        width: "100%", height: "100%", display: "flex", flexDirection: esHorizontal ? "row" : "column",
        justifyContent: esVertical2x1 ? "flex-end" : "space-between", alignItems: "center", position: "relative",
        boxSizing: "border-box", p: esHorizontal ? 0.8 : 0.4, gap: esHorizontal ? 0.5 : 0.3,
        overflow: "hidden"
      }}
    >
      {esVertical2x1 && <Box sx={{ flex: "0 0 5%" }} />}

      {/* IMG */}
      <Box
        sx={{
          order: esHorizontal ? 2 : 1,
          flex: 1, 
          minHeight: 0, 
          width: esNormal1x1 ? "75%" : esHorizontal ? "45%" : "100%", 
          alignSelf: esNormal1x1 ? "flex-start" : "center",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          mb: esVertical2x1 ? 0.5 : 0, 
          p: 0.2
        }}
      >
        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt={nombre || "Producto"}
            onError={() => setImgError(true)}
            style={{ 
              width: "100%",
              height: "100%",
              maxWidth: "100%", 
              maxHeight: "100%", 
              objectFit: "contain", 
              pointerEvents: "none"
            }}
          />
        ) : (
          <Box sx={{ width: "70%", height: "70%", bgcolor: "rgba(0,0,0,0.04)", borderRadius: 1, border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography fontSize={10} color="#9ca3af" fontWeight={600}>IMG</Typography>
          </Box>
        )}
      </Box>

      {/* 3. BLOQUE DE TEXTO */}
      <Box
        data-no-dnd="true"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        sx={{
          order: esHorizontal ? 1 : 2,
          flex: "none", 
          width: esHorizontal ? "55%" : "100%",
          display: "flex", flexDirection: "column",
          justifyContent: esHorizontal ? "center" : "flex-start", 
          alignItems: esVertical2x1 ? "center" : "flex-start", 
          textAlign: esVertical2x1 ? "center" : "left", 
          zIndex: 10, overflow: "hidden", pb: esVertical2x1 ? 1 : 0, 
        }}
      >
        <Typography sx={{ fontFamily: IMPREC?.productName?.fontFamily || "sans-serif", color: textColor || "#000000", fontSize: nameFontSize, fontWeight: 900, lineHeight: 0.98, textTransform: "uppercase", width: "100%", display: "-webkit-box", WebkitLineClamp: esVertical2x1 ? 3 : 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", mb: "1px", userSelect: "none" }}>
          {nombre || "NOMBRE PRODUCTO"}
        </Typography>

        <Typography sx={{ fontFamily: IMPREC?.productDesc?.fontFamily || "sans-serif", color: textColor === "#ffffff" ? "rgba(255,255,255,0.9)" : "#333333", fontSize: descFontSize, fontWeight: 600, lineHeight: 0.98, textTransform: "uppercase", width: "100%", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", mb: "2px", userSelect: "none" }}>
          {desc || "DESCRIPCIÓN / PRESENTACIÓN"}
        </Typography>

        <Box sx={{ px: 0.2, py: 0.1, display: "flex", flexDirection: "column", gap: 0.1, mt: esVertical2x1 ? 0.5 : "auto" }}>
          <Box display="flex" alignItems="center" gap={0.3}>
            <Typography sx={{ ...(IMPREC?.regPrice || {}), fontSize: priceFontSize, color: textColor === "#ffffff" ? "rgba(255,255,255,0.8)" : "#000000", whiteSpace: "nowrap", lineHeight: 1, userSelect: "none" }}>
              PRECIO REGULAR:
            </Typography>
            <InlineText value={precioRegular ? `$ ${precioRegular}` : ""} placeholder="$ 0" onSave={(newVal) => { const soloNumeros = newVal.replace(/[^0-9]/g, "").trim(); onUpdateField && onUpdateField("precio_regular", soloNumeros); }} style={{ ...(IMPREC?.regPrice || {}), color: textColor === "#ffffff" ? "#ffffff" : "#000000", fontSize: priceFontSize, lineHeight: 1, display: "inline-block" }} />
          </Box>
        </Box>
      </Box>

      {/* 4. PRECIO STARBURST */}
      {showPrice && precio && (
        <PrecioStarburst precio={precio} tipoPrecio={tipoPrecio} size={size} colSpan={spanC} rowSpan={spanR} isBgRed={isBgRed} isModuloSelected={isModuloSelected} IMPREC={IMPREC} TARJETA_LOGO={TARJETA_LOGO} />
      )}
    </Box>
  );
}