import { useState, useRef, useEffect } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { supabase } from "../../services/supabase";

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

function InlineText({
  value,
  onSave,
  style = {},
  placeholder = "Click para editar",
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleSave = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setEditing(false);
        }}
        style={{
          background: "rgba(255,255,255,0.15)",
          border: "1px dashed rgba(255,255,255,0.6)",
          borderRadius: 4,
          color: "white",
          fontWeight: "inherit",
          fontSize: "inherit",
          fontFamily: "inherit",
          outline: "none",
          padding: "2px 6px",
          width: "100%",
          ...style,
        }}
      />
    );
  }

  return (
    <Box
      onClick={() => setEditing(true)}
      sx={{
        cursor: "text",
        borderRadius: 1,
        px: 0.5,
        "&:hover": {
          outline: "1px dashed rgba(255,255,255,0.5)",
          bgcolor: "rgba(255,255,255,0.08)",
        },
        ...style,
      }}
    >
      {value || (
        <span style={{ opacity: 0.4, fontStyle: "italic" }}>{placeholder}</span>
      )}
    </Box>
  );
}

function InlineDateRange({ fechaInicio, fechaFin, onSave }) {
  const [editingInicio, setEditingInicio] = useState(false);
  const [editingFin, setEditingFin] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-");
    return `${parseInt(day)}/${parseInt(month)}`;
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.3}>
      <Typography fontSize={10} color="white" fontWeight={600}>
        DEL{" "}
        {editingInicio ? (
          <input
            type="date"
            defaultValue={fechaInicio || ""}
            autoFocus
            onBlur={(e) => {
              setEditingInicio(false);
              onSave("fecha_inicio", e.target.value);
            }}
            style={{
              background: "transparent",
              border: "1px dashed white",
              color: "white",
              fontSize: 10,
              borderRadius: 3,
              padding: "1px 3px",
            }}
          />
        ) : (
          <span
            onClick={() => setEditingInicio(true)}
            style={{
              cursor: "text",
              borderBottom: "1px dashed rgba(255,255,255,0.5)",
              paddingBottom: 1,
            }}
          >
            {formatDate(fechaInicio) || "??/??"}
          </span>
        )}
        {" AL "}
        {editingFin ? (
          <input
            type="date"
            defaultValue={fechaFin || ""}
            autoFocus
            onBlur={(e) => {
              setEditingFin(false);
              onSave("fecha_fin", e.target.value);
            }}
            style={{
              background: "transparent",
              border: "1px dashed white",
              color: "white",
              fontSize: 10,
              borderRadius: 3,
              padding: "1px 3px",
            }}
          />
        ) : (
          <span
            onClick={() => setEditingFin(true)}
            style={{
              cursor: "text",
              borderBottom: "1px dashed rgba(255,255,255,0.5)",
              paddingBottom: 1,
            }}
          >
            {formatDate(fechaFin) || "??/??"}
          </span>
        )}
      </Typography>
    </Box>
  );
}

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
  onFlyerUpdate,
}) {
  const saveFlyer = async (field, value) => {
    if (onFlyerUpdate) onFlyerUpdate(field, value);
    await supabase
      .from("flyers")
      .update({ [field]: value })
      .eq("id", flyer.id);
  };

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
        <Chip
          label={flyer?.estado}
          size="small"
          color={flyer?.estado === "publicado" ? "success" : "default"}
        />
        <Typography fontSize={12} color="#6b7280">
          Click en el título o fechas para editar
        </Typography>
      </Box>

      {/* Canvas */}
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
        {/* Header editable */}
        <Box
          bgcolor="#cc0000"
          borderRadius={1}
          p={1.5}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
        >
          <InlineText
            value={flyer?.nombre}
            onSave={(val) => saveFlyer("nombre", val)}
            placeholder="Título del folleto"
            style={{
              fontSize: 18,
              fontWeight: 900,
              lineHeight: 1.1,
              color: "white",
            }}
          />

          <InlineDateRange
            fechaInicio={flyer?.fecha_inicio}
            fechaFin={flyer?.fecha_fin}
            onSave={saveFlyer}
          />
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
        Hacé click en un módulo para editar sus propiedades
      </Typography>
    </Box>
  );
}
