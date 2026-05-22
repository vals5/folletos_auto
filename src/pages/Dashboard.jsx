import { useState, useEffect } from "react";
import { Box, Typography, Button, Card, CardContent, CardActions, Grid, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

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
  { label: "A4 Vertical",       width: 595,  height: 872,  cols: 3, rows: 4 },
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

function NewFlyerModal({ open, onClose, onCreate }) {
  const [name, setName]           = useState("");
  const [sizeIdx, setSizeIdx]     = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) { setName(""); setSizeIdx(0); }
  }, [open]);

  const template = TEMPLATES[0]; 
  const preset   = SIZE_PRESETS[sizeIdx];

  const handleCreate = async () => {
    if (!name.trim()) return;
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>Nuevo</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>

        {/* Nombre */}
        <TextField
          label="Nombre del folleto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth variant="filled"
          autoFocus
        />

        {/* Plantilla (sólo IMPRECIONANTE — mostrada como badge informativo) */}
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

        {/* Selección de tamaño */}
        <Box>
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

        {/* Info del tamaño seleccionado */}
        <Box sx={{ bgcolor: "#f8fafc", borderRadius: 1, px: 2, py: 1, display: "flex", gap: 3 }}>
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

      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={!name.trim() || isSubmitting}
          sx={{ bgcolor: "#025BA9", px: 4, fontWeight: 700 }}
        >
          {isSubmitting ? "Creando…" : "Aceptar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

//DASHBOARD 
export default function Dashboard() {
  const navigate = useNavigate();
  const [flyers, setFlyers]         = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchFlyers(); }, []);

  const fetchFlyers = async () => {
    const { data, error } = await supabase
      .from("flyers")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setFlyers(data);
    setIsLoading(false);
  };

  const handleCreate = async (payload) => {
    const { data, error } = await supabase.from("flyers").insert([payload]).select();
    if (!error && data) {
      setIsModalOpen(false);
      navigate(`/editor/${data[0].id}`);
    } else {
      console.error("Error al crear folleto:", error);
    }
  };

  const handleDelete = async (e, flyerId) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar este folleto?")) return;
    await supabase.from("flyers").delete().eq("id", flyerId);
    setFlyers((prev) => prev.filter((f) => f.id !== flyerId));
  };

  return (
    <Box p={2} sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f4f6f8" }}>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} mt={2} px={2}>
        <Typography variant="h4" fontWeight={900} color="#1a1a2e">Folletos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{ bgcolor: "#025BA9", borderRadius: 2, px: 4, py: 1.5, fontWeight: 700 }}
        >
          NUEVO
        </Button>
      </Box>

      <Grid container spacing={3} px={2}>
        {isLoading
          ? [1, 2, 3, 4].map((n) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={n}>
                <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 4 }} />
              </Grid>
            ))
          : flyers.map((flyer) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={flyer.id}>
                <Card sx={{ borderRadius: 4, transition: "0.3s", "&:hover": { boxShadow: 10 } }}>
                  {/* Mini preview */}
                  <Box sx={{
                    height: 160, bgcolor: flyer.bg_color || "#fff800",
                    display: "flex", flexDirection: "column", borderBottom: "1px solid #eee",
                  }}>
                    <Box sx={{
                      height: 36, bgcolor: flyer.header_color || "#ff0000",
                      display: "flex", alignItems: "center", px: 1.5, gap: 1,
                    }}>
                      {flyer.logo_izq_url && (
                        <Box component="img" src={flyer.logo_izq_url} alt="logo"
                          sx={{ height: 22, maxWidth: 70, objectFit: "contain" }} />
                      )}
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={800} noWrap>{flyer.name}</Typography>
                    <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                      <Chip label={`${flyer.width}×${flyer.height}px`} size="small" sx={{ fontSize: 10 }} />
                      <Chip label="IMPRECIONANTE" size="small" sx={{ fontSize: 10, bgcolor: "#fff8e1", color: "#b45309" }} />
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                    <Button
                      fullWidth variant="contained" size="small"
                      onClick={() => navigate(`/editor/${flyer.id}`)}
                      sx={{ borderRadius: 2, bgcolor: "#1a1a2e" }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small" color="error" variant="outlined"
                      onClick={(e) => handleDelete(e, flyer.id)}
                      sx={{ borderRadius: 2, minWidth: 36, px: 0 }}
                    >
                      ✕
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
      </Grid>

      <NewFlyerModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </Box>
  );
}