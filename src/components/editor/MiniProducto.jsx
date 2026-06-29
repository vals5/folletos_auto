import { Box, Typography } from "@mui/material";
import PrecioStarburst from "./PrecioStarburst";

export default function MiniProducto({ producto, nombreOverride, descripcionOverride, imgOverride, textColor, showPrice, precio, tipoPrecio, size, isBgRed, isModuloSelected, IMPREC, TARJETA_LOGO, flyer }) {
  const imgSrc = imgOverride || producto?.imagen_url;
  const nombre = nombreOverride || producto?.nombre || "Sin nombre";
  const desc = descripcionOverride !== undefined ? descripcionOverride : producto?.descripcion;

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", position: "relative", overflow: "hidden", minWidth: 0, px: 0.3, pt: 0.5 }}>
      {imgSrc ? (
        <Box component="img" src={imgSrc} alt={nombre} sx={{ maxWidth: "90%", maxHeight: "42%", objectFit: "contain", mb: 0.3 }} onError={(e) => { e.target.style.display = "none"; }} />
      ) : (
        <Box sx={{ width: "70%", height: "40%", bgcolor: "#f3f4f6", borderRadius: 1, mb: 0.3, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography fontSize={7} color="#9ca3af">IMG</Typography>
        </Box>
      )}
      <Typography sx={{ ...IMPREC.productName, color: textColor, width: (flyer?.width || 420) * 0.5, minHeight: (flyer?.height || 600) * 0.5, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {nombre}
      </Typography>
      {desc && (
        <Typography sx={{ ...IMPREC.productDesc, color: textColor === "#ffffff" ? "rgba(255,255,255,0.75)" : "#555", width: (flyer?.width || 420) * 0.5, minHeight: (flyer?.height || 600) * 0.5, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {desc}
        </Typography>
      )}
      {showPrice && precio && (
        <PrecioStarburst precio={precio} tipoPrecio={tipoPrecio} size={size} isBgRed={isBgRed} isModuloSelected={isModuloSelected} IMPREC={IMPREC} TARJETA_LOGO={TARJETA_LOGO} />
      )}
    </Box>
  );
}