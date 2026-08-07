import { Box, Typography } from "@mui/material";
import PrecioStarburst from "./PrecioStarburst";
import InlineText from "../ui/InlineText"; 

export default function MiniProducto({
  producto,
  nombreOverride,
  descripcionOverride,
  precioRegularOverride,
  imgOverride,
  textColor,
  showPrice,
  precio,
  tipoPrecio,
  size,
  isBgRed,
  isModuloSelected,
  IMPREC,
  TARJETA_LOGO,
  flyer,
  colSpan = 1,
  rowSpan = 1,
  onUpdateField, 
}) {
  const imgSrc = imgOverride || producto?.imagen_url || producto?.imagen;
  const nombre = nombreOverride || producto?.nombre || "";
  const desc = descripcionOverride !== undefined && descripcionOverride !== null 
    ? descripcionOverride 
    : producto?.descripcion || "";
  
  const precioRegular = precioRegularOverride || producto?.precio_regular || "";

  const esHorizontal = colSpan > 1;

  // Tamaños adaptativos
  const nameFontSize = colSpan >= 3 ? "1.1rem" : colSpan >= 2 ? "0.85rem" : rowSpan >= 2 ? "0.85rem" : "0.62rem";
  const descFontSize = colSpan >= 3 ? "0.8rem" : colSpan >= 2 ? "0.68rem" : rowSpan >= 2 ? "0.68rem" : "0.5rem";
  const priceFontSize = colSpan >= 3 ? "0.7rem" : colSpan >= 2 ? "0.58rem" : "0.45rem";

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: esHorizontal ? "row" : "column",
        justifyContent: esHorizontal ? "space-between" : "center", // Mantiene los elementos agrupados en 1x1
        alignItems: "center",
        position: "relative",
        boxSizing: "border-box",
        p: esHorizontal ? 1 : 0.5,
        gap: esHorizontal ? 1.5 : 0.4,
        overflow: "hidden",
      }}
    >
      {/* 1. IMAGEN DEL PRODUCTO */}
      <Box
        sx={{
          height: esHorizontal ? "100%" : "48%", 
          width: esHorizontal ? "45%" : "100%", 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {imgSrc ? (
          <Box
            component="img"
            src={imgSrc}
            alt={nombre || "Producto"}
            sx={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
              pointerEvents: "none",
            }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <Box
            sx={{
              width: "80%",
              height: "80%",
              bgcolor: "rgba(0,0,0,0.04)",
              borderRadius: 1,
              border: "1px dashed #cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography fontSize={10} color="#9ca3af" fontWeight={600}>IMG</Typography>
          </Box>
        )}
      </Box>

      {/* 2. TEXTOS Y PRECIO REGULAR */}
      <Box
        data-no-dnd="true"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: esHorizontal ? "55%" : "100%",
          height: esHorizontal ? "100%" : "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center", 
          alignItems: "flex-start", 
          textAlign: "left",
          zIndex: 10,
          mt: 0, // Se elimina el margin-top auto para evitar caídas al fondo
        }}
      >
        <Typography
          sx={{
            fontFamily: IMPREC?.productName?.fontFamily || "'Imprec-Name', 'Arial Narrow', sans-serif",
            color: textColor || "#000000",
            fontSize: nameFontSize,
            fontWeight: 900,
            lineHeight: 1.05,
            textTransform: "uppercase",
            width: "100%",
            textAlign: "left",
            display: "block",
            wordBreak: "break-word",
            boxSizing: "border-box",
            marginBottom: "2px",
            userSelect: "none"
          }}
        >
          {nombre || "NOMBRE PRODUCTO"}
        </Typography>

        <Typography
          sx={{
            fontFamily: IMPREC?.productDesc?.fontFamily || "'Imprec-Desc', sans-serif",
            color: textColor === "#ffffff" ? "rgba(255,255,255,0.9)" : "#333333",
            fontSize: descFontSize,
            fontWeight: 600,
            lineHeight: 1.05,
            textTransform: "uppercase",
            width: "100%",
            textAlign: "left",
            display: "block",
            wordBreak: "break-word",
            boxSizing: "border-box",
            marginBottom: "3px",
            userSelect: "none"
          }}
        >
          {desc || "DESCRIPCIÓN / PRESENTACIÓN"}
        </Typography>

        <Box
          sx={{
            px: 0.2,
            py: 0.1,
            borderRadius: "2px",
            width: "fit-content",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 0.1,
          }}
        >
          <Box display="flex" alignItems="center" gap={0.3}>
            <Typography
              sx={{ 
                ...(IMPREC?.regPrice || {}),
                fontSize: priceFontSize, 
                color: textColor === "#ffffff" ? "rgba(255,255,255,0.8)" : "#000000", 
                whiteSpace: "nowrap", 
                lineHeight: 1,
                userSelect: "none"
              }}
            >
              PRECIO REGULAR:
            </Typography>
            <InlineText
              value={precioRegular ? `$ ${precioRegular}` : ""}
              placeholder="$ 0"
              onSave={(newVal) => {
                const soloNumeros = newVal.replace(/[^0-9]/g, "").trim();
                onUpdateField && onUpdateField("precio_regular", soloNumeros);
              }}
              style={{
                ...(IMPREC?.regPrice || {}),
                color: textColor === "#ffffff" ? "#ffffff" : "#000000",
                fontSize: priceFontSize,
                lineHeight: 1,
                display: "inline-block"
              }}
            />
          </Box>
        </Box>
      </Box>

      {showPrice && precio && (
        <PrecioStarburst
          precio={precio}
          tipoPrecio={tipoPrecio}
          size={size}
          colSpan={colSpan}
          rowSpan={rowSpan}
          isBgRed={isBgRed}
          isModuloSelected={isModuloSelected}
          IMPREC={IMPREC}
          TARJETA_LOGO={TARJETA_LOGO}
        />
      )}
    </Box>
  );
}