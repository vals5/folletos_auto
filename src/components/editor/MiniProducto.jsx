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

  // Tipos de Layout
  const esHorizontal = colSpan > 1; // 2x1 Horizontal
  const esVertical2x1 = colSpan === 1 && rowSpan > 1; // 2x1 Vertical

  // Tamaños adaptativos
  const nameFontSize = colSpan >= 2 ? "0.85rem" : esVertical2x1 ? "0.68rem" : "0.52rem";
  const descFontSize = colSpan >= 2 ? "0.65rem" : esVertical2x1 ? "0.55rem" : "0.44rem";
  const priceFontSize = colSpan >= 2 ? "0.58rem" : esVertical2x1 ? "0.50rem" : "0.42rem";

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
      {/* 1. ESPACIADOR (Solo Vertical) */}
      {esVertical2x1 && <Box sx={{ flex: 1.2 }} />}

      {/* 2. IMAGEN DEL PRODUCTO */}
      <Box
        sx={{
          order: esHorizontal ? 2 : 1, // En horizontal pasa a la derecha (orden 2)
          height: esHorizontal ? "100%" : esVertical2x1 ? "35%" : "36%", 
          width: esHorizontal ? "42%" : "100%", 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          mb: esVertical2x1 ? 0.5 : 0, 
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
            <Typography fontSize={9} color="#9ca3af" fontWeight={600}>IMG</Typography>
          </Box>
        )}
      </Box>

      {/* 3. BLOQUE DE TEXTO Y PRECIO REGULAR */}
      <Box
        data-no-dnd="true"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        sx={{
          order: esHorizontal ? 1 : 2, // En horizontal pasa a la izquierda (orden 1)
          width: esHorizontal ? "58%" : "100%",
          flex: esVertical2x1 ? "none" : 1, 
          display: "flex",
          flexDirection: "column",
          justifyContent: esHorizontal ? "center" : "flex-start", 
          alignItems: esVertical2x1 ? "center" : "flex-start", 
          textAlign: esVertical2x1 ? "center" : "left",
          zIndex: 10,
          overflow: "hidden",
          pb: esVertical2x1 ? 1 : 0, 
        }}
      >
        {/* NOMBRE */}
        <Typography
          sx={{
            fontFamily: IMPREC?.productName?.fontFamily || "'Imprec-Name', 'Arial Narrow', sans-serif",
            color: textColor || "#000000",
            fontSize: nameFontSize,
            fontWeight: 900,
            lineHeight: 0.98,
            textTransform: "uppercase",
            width: "100%",
            display: "-webkit-box",
            WebkitLineClamp: esVertical2x1 ? 3 : 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            boxSizing: "border-box",
            marginBottom: "1px",
            userSelect: "none"
          }}
        >
          {nombre || "NOMBRE PRODUCTO"}
        </Typography>

        {/* DESCRIPCIÓN */}
        <Typography
          sx={{
            fontFamily: IMPREC?.productDesc?.fontFamily || "'Imprec-Desc', sans-serif",
            color: textColor === "#ffffff" ? "rgba(255,255,255,0.9)" : "#333333",
            fontSize: descFontSize,
            fontWeight: 600,
            lineHeight: 0.98,
            textTransform: "uppercase",
            width: "100%",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            boxSizing: "border-box",
            marginBottom: "2px",
            userSelect: "none"
          }}
        >
          {desc || "DESCRIPCIÓN / PRESENTACIÓN"}
        </Typography>

        {/* PRECIO REGULAR */}
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
            mt: esVertical2x1 ? 0.5 : "auto", 
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

      {/* 4. PRECIO STARBURST (Siempre absoluto) */}
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