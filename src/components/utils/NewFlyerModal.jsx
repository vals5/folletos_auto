import { useState, useEffect } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";

export const TEMPLATES = [
  {
    id: "imprec",
    name: "IMPRECIONANTE",
    bgColor: "#fff800",         
    headerColor: "#fff800",     
    priceColor: "#ff0000",      
    fontFamily: "Zuume",
    logoUrl: "https://lh3.googleusercontent.com/d/192spnajnlI5ERv3m3VHHhAqigvn2o6Wa",
  },
];

export const SIZE_PRESETS = [
  { label: "A4 Vertical",       width: 595,  height: 841,  cols: 3, rows: 4 },
  { label: "Cuadrado 1080",     width: 1080, height: 1080, cols: 3, rows: 3 },
  { label: "Historia 1080",     width: 1080, height: 1920, cols: 2, rows: 5 },
  { label: "HD 1920",           width: 1920, height: 1080, cols: 4, rows: 2 },
  { label: "WSP 1080×1440",     width: 1080, height: 1440, cols: 3, rows: 4 },
  { label: "Slider 450×600",    width: 450,  height: 600,  cols: 2, rows: 3 },
  { label: "HTML 600×313",      width: 600,  height: 313,  cols: 3, rows: 1 },
];

const PREVIEW_SCALE = 0.18;

function SizePreviewCard({ preset, selected, onClick }) {
  const w = Math.round(preset.width  * PREVIEW_SCALE);
  const h = Math.round(preset.height * PREVIEW_SCALE);
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 0.5, cursor: "pointer", p: 0.5, borderRadius: 1,
        border: selected ? "2px solid #025BA9" : "2px solid transparent",
        "&:hover": { bgcolor: "rgba(2,91,169,0.06)" },
      }}
    >
      <Box sx={{
        width: w, height: h,
        bgcolor: selected ? "#025BA9" : "#d1d5db",
        borderRadius: "2px",
        transition: "all 0.15s",
      }} />
      <Typography fontSize={9} fontWeight={selected ? 700 : 400} color={selected ? "#025BA9" : "text.secondary"} textAlign="center" lineHeight={1.2}>
        {preset.label}
      </Typography>
      <Typography fontSize={8} color="text.disabled">{preset.width}×{preset.height}</Typography>
    </Box>
  );
}

export default function NewFlyerModal({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) { setName(""); setSizeIdx(0); }
  }, [open]);

  const template = TEMPLATES[0]; 
  const preset   = SIZE_PRESETS[sizeIdx];

  const handleCreate = async (e) => {
    if (e) e.preventDefault(); 
    if (!name.trim() || isSubmitting) return;
    
    setIsSubmitting(true);

    const payload = {
      name,
      width:        preset.width,
      height:       preset.height,
      bg_color:     template.bgColor,
      header_color: template.headerColor,
      template_id:  template.id,
      logo_izq_url: template.logoUrl,
    };

    await onCreate(payload);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>Nuevo</DialogTitle>

      <form onSubmit={handleCreate} style={{ display: 'contents' }}>
        <DialogContent sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", md: "row" }, 
          gap: 4, 
          pt: 2 
        }}>
          
          {/* COLUMNA IZQUIERDA: Formulario */}
          <Box flex={1} display="flex" flexDirection="column" gap={2.5}>
            <TextField
              label="Nombre del folleto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth variant="filled"
              autoFocus
            />

            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
                PLANTILLA
              </Typography>
              <Box display="flex" alignItems="center" gap={1}
                sx={{ bgcolor: "#fff8e1", border: "1px solid #ffe082", borderRadius: 1, px: 2, py: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#ff0000", flexShrink: 0 }} />
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#fff800", border: "1px solid #ccc", flexShrink: 0 }} />
                <Typography fontWeight={800} fontSize={13} letterSpacing={1}>IMPRECIONANTE</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 1, p: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <Typography fontSize={10} color="text.secondary">Dimensiones</Typography>
                <Typography fontSize={13} fontWeight={700}>{preset.width} × {preset.height} px</Typography>
              </Box>
              <Box>
                <Typography fontSize={10} color="text.secondary">Grilla sugerida</Typography>
                <Typography fontSize={13} fontWeight={700}>{preset.cols} col × {preset.rows} fil</Typography>
              </Box>
              <Box>
                <Typography fontSize={10} color="text.secondary">Fondo</Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 14, height: 14, bgcolor: "#fff800", border: "1px solid #ccc", borderRadius: "3px" }} />
                  <Typography fontSize={13} fontWeight={700}>#FFF800</Typography>
                </Box>
              </Box>
              <Box>
                <Typography fontSize={10} color="text.secondary">Cabecera</Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 14, height: 14, bgcolor: "#ff0000", borderRadius: "3px" }} />
                  <Typography fontSize={13} fontWeight={700}>#FF0000</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* COLUMNA DERECHA: Selección de tamaño */}
          <Box flex={1} sx={{ borderLeft: { xs: "none", md: "1px solid #e2e8f0" }, pl: { xs: 0, md: 4 } }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
              TAMAÑO
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1.5} justifyContent="flex-start">
              {SIZE_PRESETS.map((s, i) => (
                <SizePreviewCard
                  key={s.label}
                  preset={s}
                  selected={sizeIdx === i}
                  onClick={() => setSizeIdx(i)}
                />
              ))}
            </Box>
          </Box>

        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!name.trim() || isSubmitting}
            sx={{ bgcolor: "#025BA9", px: 4, fontWeight: 700 }}
          >
            {isSubmitting ? "Creando…" : "Aceptar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}