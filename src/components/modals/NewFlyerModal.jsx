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
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        gap: 0.8, 
        cursor: "pointer", 
        p: 1, 
        borderRadius: "14px",
        bgcolor: selected ? "#f0f9ff" : "transparent",
        border: selected ? "2px solid #0284c7" : "2px solid #f3f4f6",
        transition: "all 0.2s ease",
        "&:hover": { bgcolor: selected ? "#f0f9ff" : "#f9fafb", borderColor: selected ? "#0284c7" : "#d1d5db" },
      }}
    >
      <Box sx={{
        width: w, 
        height: h,
        bgcolor: selected ? "#0284c7" : "#cbd5e1",
        borderRadius: "8px",
        boxShadow: selected ? "0 4px 12px rgba(2, 132, 199, 0.25)" : "none",
        transition: "all 0.2s ease",
      }} />
      <Typography fontSize={10} fontWeight={selected ? 700 : 500} color={selected ? "#0284c7" : "#4b5563"} textAlign="center" lineHeight={1.2}>
        {preset.label}
      </Typography>
      <Typography fontSize={9} color="#9ca3af">{preset.width}×{preset.height}</Typography>
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          p: 1.5,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: 20, pb: 0, pt: 1, px: 3 }}>
        Nuevo Folleto
      </DialogTitle>

      <form onSubmit={handleCreate} style={{ display: 'contents' }}>
        <DialogContent sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, pt: 2.5, px: 3 }}>
          <Box flex={1} display="flex" flexDirection="column" gap={2.5}>
            <TextField
              label="Nombre del folleto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth 
              variant="outlined"
              autoFocus
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                }
              }}
            />
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.8} letterSpacing={0.5}>
                PLANTILLA
              </Typography>
              <Box 
                display="flex" 
                alignItems="center" 
                gap={1.2} 
                sx={{ 
                  bgcolor: "#fffde7", 
                  border: "1px solid #fde047", 
                  borderRadius: "14px", 
                  px: 2, 
                  py: 1.2 
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#ff0000", flexShrink: 0 }} />
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#fff800", border: "1px solid #eab308", flexShrink: 0 }} />
                <Typography fontWeight={800} fontSize={13} letterSpacing={1} color="#1e293b">
                  IMPRECIONANTE
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box flex={1} sx={{ borderLeft: { xs: "none", md: "1px solid #f1f5f9" }, pl: { xs: 0, md: 4 } }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1.2} letterSpacing={0.5}>
              TAMAÑO
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1.5} justifyContent="flex-start">
              {SIZE_PRESETS.map((s, i) => (
                <SizePreviewCard key={s.label} preset={s} selected={sizeIdx === i} onClick={() => setSizeIdx(i)} />
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button 
            onClick={onClose} 
            sx={{ borderRadius: "20px", textTransform: "none", color: "#64748b", fontWeight: 600, px: 2.5 }}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!name.trim() || isSubmitting} 
            sx={{ 
              bgcolor: "#0284c7", 
              borderRadius: "20px", 
              px: 4, 
              fontWeight: 700, 
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
              "&:hover": { bgcolor: "#0369a1" }
            }}
          >
            {isSubmitting ? "Creando…" : "Aceptar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}