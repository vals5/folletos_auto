import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

// --- Inline text editable ---
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
  useEffect(() => {
    setDraft(value || "");
  }, [value]);

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

// --- Inline date range ---
function InlineDateRange({ fechaInicio, fechaFin, onSave }) {
  const [editingInicio, setEditingInicio] = useState(false);
  const [editingFin, setEditingFin] = useState(false);

  const fmt = (d) => {
    if (!d) return "??/??";
    const [, m, day] = d.split("-");
    return `${parseInt(day)}/${parseInt(m)}`;
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
            }}
          >
            {fmt(fechaInicio)}
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
            }}
          >
            {fmt(fechaFin)}
          </span>
        )}
      </Typography>
      <Typography fontSize={9} color="rgba(255,255,255,0.7)">
        DE MARZO
      </Typography>
    </Box>
  );
}

// --- Módulo sortable ---
function SortableModuloCard({ modulo, isSelected, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: modulo.id });
  const size = TAMANO_SIZE[modulo.tamano] || TAMANO_SIZE["S"];
  const priceLabel = TIPO_PRECIO_LABEL[modulo.tipo_precio];

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      {...listeners}
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
        cursor: isDragging ? "grabbing" : "grab",
        p: 1,
        position: "relative",
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isSelected
          ? "0 0 0 3px #f59e0b33"
          : "0 1px 4px rgba(0,0,0,0.15)",
        transform: CSS.Transform.toString(transform),
        transition,
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

// --- Footer uploader ---
function FooterUploader({ flyerId, footerUrl, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `footers/${flyerId}.${ext}`;

    const { error } = await supabase.storage
      .from("flyer-assets")
      .upload(path, file, { upsert: true });

    if (!error) {
      const { data } = supabase.storage.from("flyer-assets").getPublicUrl(path);
      const url = data.publicUrl;
      await supabase
        .from("flyers")
        .update({ footer_url: url })
        .eq("id", flyerId);
      onUpdate(url);
    }
    setUploading(false);
  };

  const handleRemove = async () => {
    await supabase
      .from("flyers")
      .update({ footer_url: null })
      .eq("id", flyerId);
    onUpdate(null);
  };

  if (footerUrl) {
    return (
      <Box position="relative" sx={{ "&:hover .remove-btn": { opacity: 1 } }}>
        <Box
          component="img"
          src={footerUrl}
          alt="Pie de página"
          sx={{ width: "100%", borderRadius: 1, display: "block" }}
        />
        <Tooltip title="Quitar pie de página">
          <Box
            className="remove-btn"
            onClick={handleRemove}
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              bgcolor: "rgba(0,0,0,0.6)",
              borderRadius: "50%",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
          >
            <DeleteIcon sx={{ color: "white", fontSize: 16 }} />
          </Box>
        </Tooltip>
      </Box>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleUpload}
      />
      <Box
        onClick={() => inputRef.current?.click()}
        sx={{
          border: "2px dashed rgba(0,0,0,0.2)",
          borderRadius: 1,
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.5,
          cursor: "pointer",
          bgcolor: "rgba(0,0,0,0.05)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
        }}
      >
        {uploading ? (
          <CircularProgress size={20} />
        ) : (
          <>
            <AddPhotoAlternateIcon
              sx={{ color: "rgba(0,0,0,0.4)", fontSize: 28 }}
            />
            <Typography fontSize={11} color="rgba(0,0,0,0.5)">
              Subir pie de página
            </Typography>
          </>
        )}
      </Box>
    </>
  );
}

// --- Canvas principal ---
export default function CanvasPreview({
  flyer,
  modulos,
  selectedModulo,
  onSelectModulo,
  onFlyerUpdate,
  onReorderModulos,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const saveFlyer = async (field, value) => {
    if (onFlyerUpdate) onFlyerUpdate(field, value);
    await supabase
      .from("flyers")
      .update({ [field]: value })
      .eq("id", flyer.id);
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = modulos.findIndex((m) => m.id === active.id);
    const newIndex = modulos.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(modulos, oldIndex, newIndex);
    onReorderModulos(reordered);

    // Persistir posiciones
    await Promise.all(
      reordered.map((m, i) =>
        supabase.from("modulos").update({ posicion: i }).eq("id", m.id),
      ),
    );
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
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <Chip
          label={flyer?.estado}
          size="small"
          color={flyer?.estado === "publicado" ? "success" : "default"}
        />
        <Typography fontSize={12} color="#6b7280">
          Arrastrá los módulos para reordenarlos
        </Typography>
      </Box>

      <Box
        sx={{
          width: flyer?.ancho || 420,
          minHeight: flyer?.alto || 600,
          bgcolor: flyer?.color_fondo || "#ffd700",
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
          bgcolor={flyer?.color_header || "#cc0000"}
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

        {/* Módulos con drag & drop */}
        {modulos.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight={300}
            color="#92400e"
          >
            <Typography fontSize={14} textAlign="center">
              Agregá productos desde el panel izquierdo
            </Typography>
          </Box>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={modulos.map((m) => m.id)}
              strategy={rectSortingStrategy}
            >
              <Box
                display="flex"
                flexWrap="wrap"
                gap={1}
                justifyContent="center"
              >
                {modulos.map((modulo) => (
                  <SortableModuloCard
                    key={modulo.id}
                    modulo={modulo}
                    isSelected={selectedModulo?.id === modulo.id}
                    onClick={() => onSelectModulo(modulo)}
                  />
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        )}

        {/* Pie de página */}
        <FooterUploader
          flyerId={flyer?.id}
          footerUrl={flyer?.footer_url}
          onUpdate={(url) => onFlyerUpdate("footer_url", url)}
        />
      </Box>

      <Typography fontSize={12} color="#9ca3af" mt={2}>
        Click en un módulo para editar · Arrastrá para reordenar
      </Typography>
    </Box>
  );
}
