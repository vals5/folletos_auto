import { useState } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider } from "@mui/material";
import { TEMPLATES, SIZE_PRESETS } from "../../config/templates";
import FieldLabel from "../ui/FieldLabel";
import { semantic } from "../../theme/tokens";

const PREVIEW_BOX = 64; // todas las vistas previas caben en un cuadrado de este tamaño, conservando la proporción

function SizePreviewCard({ preset, selected, onClick }) {
  const scale = Math.min(PREVIEW_BOX / preset.width, PREVIEW_BOX / preset.height);
  const w = Math.max(8, Math.round(preset.width * scale));
  const h = Math.max(8, Math.round(preset.height * scale));
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        cursor: "pointer",
        p: 1.25,
        font: "inherit",
        borderRadius: "12px",
        bgcolor: selected ? "brandTint" : "background.paper",
        border: "2px solid",
        borderColor: selected ? "primary.main" : "divider",
        transition: "all 0.15s ease",
        "&:hover": { borderColor: selected ? "primary.main" : "neutral.300", bgcolor: selected ? "brandTint" : "neutral.50" },
      }}
    >
      <Box sx={{ height: PREVIEW_BOX, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ width: w, height: h, bgcolor: selected ? "primary.main" : "neutral.300", borderRadius: "3px", transition: "all 0.15s ease" }} />
      </Box>
      <Typography fontSize={12} fontWeight={selected ? 700 : 600} color={selected ? "primary.main" : "text.primary"} textAlign="center" lineHeight={1.2}>
        {preset.label}
      </Typography>
      <Typography fontSize={11} color="text.secondary">
        {preset.width}×{preset.height}
      </Typography>
    </Box>
  );
}

export default function NewFlyerModal({ open, onClose, onCreate }) {
  // `key` + montaje condicional: el formulario arranca limpio cada vez que se abre.
  return open ? <NewFlyerDialog onClose={onClose} onCreate={onCreate} /> : null;
}

function NewFlyerDialog({ onClose, onCreate }) {
  const open = true;
  const [name, setName] = useState("");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const template = TEMPLATES[0]; 
  const preset   = SIZE_PRESETS[sizeIdx];

  const handleCreate = async (e) => {
    if (e) e.preventDefault(); 
    if (!name.trim() || isSubmitting) return;
    
    setIsSubmitting(true);

    const payload = {
      nombre:       name.trim(),
      width:        preset.width,
      height:       preset.height,
      bg_color:     template.bgColor,
      header_color: template.headerColor,
      template_id:  template.id,
    };

    await onCreate(payload);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Nuevo folleto</DialogTitle>

      <form onSubmit={handleCreate} style={{ display: "contents" }}>
        <DialogContent sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, pt: "12px !important" }}>
          <Box flex={1} display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Nombre del folleto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              autoFocus
              size="medium"
              placeholder="Ej: Ofertas de fin de mes"
            />
            <Box>
              <FieldLabel>Plantilla</FieldLabel>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  bgcolor: "warning.light",
                  border: "1px solid",
                  borderColor: semantic.warning.border,
                  borderRadius: "8px",
                  px: 2,
                  py: 1.25,
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: template.priceColor, flexShrink: 0 }} />
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: template.bgColor, border: "1px solid", borderColor: "warning.main", flexShrink: 0 }} />
                <Typography fontWeight={700} fontSize={13} letterSpacing={0.5}>
                  {template.name}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

          <Box flex={1.4}>
            <FieldLabel>Tamaño</FieldLabel>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))", gap: 1.5 }}>
              {SIZE_PRESETS.map((s, i) => (
                <SizePreviewCard key={s.label} preset={s} selected={sizeIdx === i} onClick={() => setSizeIdx(i)} />
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={!name.trim() || isSubmitting}>
            {isSubmitting ? "Creando…" : "Crear folleto"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
