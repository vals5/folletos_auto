import { Box, Typography } from "@mui/material";
import PrecioStarburst from "./PrecioStarburst";
import InlineText from "../ui/InlineText"; 

export default function MiniProducto({
  producto,
  nombreOverride,
  descripcionOverride,
  precioRegularOverride,
  stockOverride,
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
  onUpdateField, 
}) {
  const imgSrc = imgOverride || producto?.imagen_url || producto?.imagen;
  const nombre = nombreOverride || producto?.nombre || "";
  const desc = descripcionOverride !== undefined && descripcionOverride !== null 
    ? descripcionOverride 
    : producto?.descripcion || "";
  
  const precioRegular = precioRegularOverride || producto?.precio_regular || "";
  const stock = stockOverride || producto?.stock || "1000 UNIDADES";

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", 
        position: "relative",
        boxSizing: "border-box",
        p: 0.4,
        overflow: "visible",
      }}
    >
      {/* 1. SECCIÓN SUPERIOR: IMAGEN DEL PRODUCTO (Alineada a la izquierda para dejar espacio a la cucarda) */}
      <Box
        sx={{
          height: "45%", 
          width: "55%", 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pt: 0.2,
          pl: 0.2,
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
              width: "100%",
              height: "80%",
              bgcolor: "rgba(0,0,0,0.04)",
              borderRadius: 1,
              border: "1px dashed #cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography fontSize={8} color="#9ca3af" fontWeight={600}>IMG</Typography>
          </Box>
        )}
      </Box>

      {/* 2. SECCIÓN INFERIOR: TEXTOS Y BLOQUE DE PRECIO REGULAR (MODELO IMAGEN 1) */}
      <Box
        data-no-dnd="true"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start", 
          textAlign: "left",
          zIndex: 10,
          mt: "auto",
        }}
      >
        {/* NOMBRE DEL PRODUCTO */}
        <InlineText
          value={nombre}
          placeholder="NOMBRE PRODUCTO"
          onSave={(newVal) => onUpdateField && onUpdateField("nombre", newVal)}
          style={{
            fontFamily: IMPREC?.productName?.fontFamily || "'Imprec-Name', 'Arial Narrow', sans-serif",
            color: textColor || "#000000",
            fontSize: "0.62rem",
            fontWeight: 900,
            lineHeight: 1.05,
            textTransform: "uppercase",
            width: "100%",
            textAlign: "left",
            display: "block",
            wordBreak: "break-word",
            boxSizing: "border-box",
            marginBottom: "1px"
          }}
        />

        {/* DESCRIPCIÓN DEL PRODUCTO */}
        <InlineText
          value={desc}
          placeholder="DESCRIPCIÓN / PRESENTACIÓN"
          onSave={(newVal) => onUpdateField && onUpdateField("descripcion", newVal)}
          style={{
            fontFamily: IMPREC?.productDesc?.fontFamily || "'Imprec-Desc', sans-serif",
            color: textColor === "#ffffff" ? "rgba(255,255,255,0.9)" : "#333333",
            fontSize: "0.5rem",
            fontWeight: 600,
            lineHeight: 1.05,
            textTransform: "uppercase",
            width: "100%",
            textAlign: "left",
            display: "block",
            wordBreak: "break-word",
            boxSizing: "border-box",
            marginBottom: "3px"
          }}
        />

        {/* BLOQUE NEGRO DE PRECIO REGULAR Y STOCK (OFICIAL VEA) */}
        <Box
          sx={{
            bgcolor: "#000000",
            color: "#ffffff",
            px: 0.4,
            py: 0.2,
            borderRadius: "2px",
            width: "fit-content",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 0.1,
          }}
        >
          <Box display="flex" alignItems="center" gap={0.3}>
            <Typography sx={{ fontSize: "0.42rem", fontWeight: 700, color: "#fff800", whiteSpace: "nowrap", lineHeight: 1 }}>
              PRECIO REGULAR:
            </Typography>
            <InlineText
              value={precioRegular ? `$ ${precioRegular}` : ""}
              placeholder="$ 0"
              onSave={(newVal) => onUpdateField && onUpdateField("precio_regular", newVal.replace("$", "").trim())}
              style={{
                color: "#ffffff",
                fontSize: "0.45rem",
                fontWeight: 800,
                lineHeight: 1,
                display: "inline-block"
              }}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={0.3}>
            <Typography sx={{ fontSize: "0.38rem", fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", lineHeight: 1 }}>
              DISPONIBLES:
            </Typography>
            <InlineText
              value={stock}
              placeholder="1000 UNID."
              onSave={(newVal) => onUpdateField && onUpdateField("stock", newVal)}
              style={{
                color: "#fff800",
                fontSize: "0.38rem",
                fontWeight: 700,
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
          isBgRed={isBgRed}
          isModuloSelected={isModuloSelected}
          IMPREC={IMPREC}
          TARJETA_LOGO={TARJETA_LOGO}
        />
      )}
    </Box>
  );
}