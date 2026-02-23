import { Box, Typography, Chip } from "@mui/material";

const TAMANO_SIZE = {
  XS: { width: 80, height: 80, fontSize: 10 },
  S: { width: 120, height: 100, fontSize: 12 },
  M: { width: 180, height: 120, fontSize: 13 },
  L: { width: 240, height: 140, fontSize: 14 },
  XL: { width: 340, height: 160, fontSize: 15 },
};

const TIPO_PRECIO_LABEL = {
  regular: null,
  llevando3: "LLEVANDO 3",
  vea_ahorro: "VEA AHORRO",
  regular_cencosud: "CENCOSUD",
};

function ModuloCard({ modulo, isSelected, onClick }) {
  const size = TAMANO_SIZE[modulo.tamano] || TAMANO_SIZE["S"];
  const priceLabel = TIPO_PRECIO_LABEL[modulo.tipo_precio];

  return (
    <Box
      onClick={onClick}
      sx={{
        width: size.width,
        height: size.height,
        bgcolor: "white",
        border: isSelected ? "2px solid #f59e0b" : "2px solid transparent",
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        p: 1,
        position: "relative",
        boxShadow: isSelected
          ? "0 0 0 3px #f59e0b33"
          : "0 1px 4px rgba(0,0,0,0.15)",
        transition: "all 0.15s ease",
        "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.2)" },
      }}
    >
      {priceLabel && (
        <Box
          sx={{
            position: "absolute",
            top: 4,
            left: 4,
            bgcolor: "#ef4444",
            borderRadius: 0.5,
            px: 0.5,
            py: 0.2,
          }}
        >
          <Typography
            fontSize={8}
            color="white"
            fontWeight={700}
            lineHeight={1}
          >
            {priceLabel}
          </Typography>
        </Box>
      )}

      {modulo.productos?.imagen_url ? (
        <Box
          component="img"
          src={modulo.productos.imagen_url}
          alt={modulo.productos.nombre}
          sx={{
            maxWidth: "60%",
            maxHeight: "50%",
            objectFit: "contain",
            mb: 0.5,
          }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <Box
          sx={{
            width: "50%",
            height: "40%",
            bgcolor: "#f3f4f6",
            borderRadius: 1,
            mb: 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography fontSize={8} color="#9ca3af">
            IMG
          </Typography>
        </Box>
      )}

      <Typography
        fontSize={size.fontSize - 2}
        fontWeight={600}
        textAlign="center"
        color="#111827"
        noWrap
        sx={{ width: "100%", px: 0.5 }}
      >
        {modulo.productos?.nombre || "Sin nombre"}
      </Typography>

      {modulo.precio && (
        <Typography fontSize={size.fontSize} fontWeight={800} color="#dc2626">
          ${modulo.precio.toLocaleString("es-AR")}
        </Typography>
      )}

      {modulo.precio_cencosud && (
        <Box
          sx={{
            position: "absolute",
            bottom: 3,
            right: 3,
            width: 12,
            height: 12,
            bgcolor: "#1a1a2e",
            borderRadius: "50%",
          }}
        />
      )}
    </Box>
  );
}

export default function CanvasPreview({
  flyer,
  modulos,
  selectedModulo,
  onSelectModulo,
}) {
  return (
    <Box
      flex={1}
      bgcolor="#e5e7eb"
      display="flex"
      flexDirection="column"
      alignItems="center"
      overflow="auto"
      py={4}
    >
      {/* Info del flyer */}
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <Typography fontWeight={600} color="#374151">
          {flyer?.nombre}
        </Typography>
        {flyer?.estado && (
          <Chip
            label={flyer.estado}
            size="small"
            color={flyer.estado === "publicado" ? "success" : "default"}
          />
        )}
      </Box>

      {/* Canvas del flyer */}
      <Box
        sx={{
          width: 420,
          minHeight: 600,
          bgcolor: "#ffd700",
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {/* Header del flyer */}
        <Box
          bgcolor="#cc0000"
          borderRadius={1}
          p={1.5}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            fontWeight={900}
            color="white"
            fontSize={22}
            lineHeight={1}
          >
            IM
            <br />
            PREC
            <br />
            IO
            <br />
            NANTE
          </Typography>
          <Box textAlign="right">
            <Typography fontSize={11} color="white" fontWeight={600}>
              {flyer?.fecha_inicio
                ? `DEL ${new Date(flyer.fecha_inicio).toLocaleDateString("es-AR")} AL ${new Date(flyer.fecha_fin).toLocaleDateString("es-AR")}`
                : "Fecha a definir"}
            </Typography>
          </Box>
        </Box>

        {/* Módulos */}
        {modulos.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight={400}
            color="#92400e"
          >
            <Typography fontSize={14} textAlign="center">
              Agregá productos desde el panel izquierdo
            </Typography>
          </Box>
        ) : (
          <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
            {modulos.map((modulo) => (
              <ModuloCard
                key={modulo.id}
                modulo={modulo}
                isSelected={selectedModulo?.id === modulo.id}
                onClick={() => onSelectModulo(modulo)}
              />
            ))}
          </Box>
        )}
      </Box>

      <Typography fontSize={12} color="#9ca3af" mt={2}>
        Hacé clic en un módulo para editar sus propiedades
      </Typography>
    </Box>
  );
}
