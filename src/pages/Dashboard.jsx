import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

const estadoColor = {
  borrador: "default",
  revision: "warning",
  publicado: "success",
};

const PRESETS = [
  { label: "A4 vertical", ancho: 420, alto: 600 },
  { label: "A4 horizontal", ancho: 600, alto: 420 },
  { label: "Cuadrado", ancho: 500, alto: 500 },
  { label: "Personalizado", ancho: null, alto: null },
];

const COLORES_FONDO = [
  "#ffd700",
  "#ffffff",
  "#ff0000",
  "#0057a8",
  "#00aa44",
  "#f97316",
  "#111827",
  "#e5e7eb",
];
const COLORES_HEADER = [
  "#cc0000",
  "#111827",
  "#0057a8",
  "#00aa44",
  "#7c3aed",
  "#f97316",
  "#ffffff",
  "#ffd700",
];

function ColorDot({ color, selected, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        bgcolor: color,
        cursor: "pointer",
        border: selected ? "3px solid #1a1a2e" : "3px solid transparent",
        boxShadow: selected ? "0 0 0 2px #f59e0b" : "0 1px 3px rgba(0,0,0,0.3)",
        transition: "all 0.15s",
        "&:hover": { transform: "scale(1.1)" },
      }}
    />
  );
}

function NuevoFlyerModal({ open, onClose, onCreate }) {
  const [nombre, setNombre] = useState("");
  const [presetIdx, setPresetIdx] = useState(0);
  const [ancho, setAncho] = useState(420);
  const [alto, setAlto] = useState(600);
  const [colorFondo, setColorFondo] = useState("#ffd700");
  const [colorHeader, setColorHeader] = useState("#cc0000");
  const [loading, setLoading] = useState(false);

  const handlePreset = (idx) => {
    setPresetIdx(idx);
    if (PRESETS[idx].ancho) {
      setAncho(PRESETS[idx].ancho);
      setAlto(PRESETS[idx].alto);
    }
  };

  const handleCreate = async () => {
    if (!nombre.trim()) return;
    setLoading(true);
    await onCreate({
      nombre,
      ancho,
      alto,
      color_fondo: colorFondo,
      color_header: colorHeader,
    });
    setLoading(false);
    setNombre("");
    setPresetIdx(0);
    setAncho(420);
    setAlto(600);
    setColorFondo("#ffd700");
    setColorHeader("#cc0000");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Nuevo folleto</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}
      >
        <TextField
          label="Nombre del folleto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          fullWidth
          size="small"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />

        <Box>
          <Typography fontSize={13} fontWeight={600} mb={1} color="#374151">
            Tamaño
          </Typography>
          <Box
            display="flex"
            gap={1}
            flexWrap="wrap"
            mb={presetIdx === 3 ? 2 : 0}
          >
            {PRESETS.map((p, i) => (
              <Button
                key={p.label}
                size="small"
                variant={presetIdx === i ? "contained" : "outlined"}
                onClick={() => handlePreset(i)}
                sx={{
                  fontSize: 12,
                  ...(presetIdx === i && {
                    bgcolor: "#1a1a2e",
                    "&:hover": { bgcolor: "#2d2d5e" },
                  }),
                }}
              >
                {p.label}
                {p.ancho && (
                  <Typography
                    component="span"
                    fontSize={10}
                    ml={0.5}
                    color={
                      presetIdx === i
                        ? "rgba(255,255,255,0.7)"
                        : "text.secondary"
                    }
                  >
                    {p.ancho}×{p.alto}
                  </Typography>
                )}
              </Button>
            ))}
          </Box>
          {presetIdx === 3 && (
            <Box display="flex" gap={2} mt={1}>
              <Box flex={1}>
                <Typography fontSize={12} color="text.secondary" mb={0.5}>
                  Ancho: {ancho}px
                </Typography>
                <Slider
                  value={ancho}
                  min={300}
                  max={900}
                  step={10}
                  onChange={(_, v) => setAncho(v)}
                  size="small"
                />
              </Box>
              <Box flex={1}>
                <Typography fontSize={12} color="text.secondary" mb={0.5}>
                  Alto: {alto}px
                </Typography>
                <Slider
                  value={alto}
                  min={300}
                  max={1200}
                  step={10}
                  onChange={(_, v) => setAlto(v)}
                  size="small"
                />
              </Box>
            </Box>
          )}
        </Box>

        <Box>
          <Typography fontSize={13} fontWeight={600} mb={1.5} color="#374151">
            Colores
          </Typography>
          <Box display="flex" gap={3}>
            <Box>
              <Typography fontSize={12} color="text.secondary" mb={1}>
                Fondo
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" maxWidth={160}>
                {COLORES_FONDO.map((c) => (
                  <ColorDot
                    key={c}
                    color={c}
                    selected={colorFondo === c}
                    onClick={() => setColorFondo(c)}
                  />
                ))}
              </Box>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <input
                  type="color"
                  value={colorFondo}
                  onChange={(e) => setColorFondo(e.target.value)}
                  style={{
                    width: 28,
                    height: 28,
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
                <Typography fontSize={11} color="text.secondary">
                  Personalizado
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography fontSize={12} color="text.secondary" mb={1}>
                Header
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" maxWidth={160}>
                {COLORES_HEADER.map((c) => (
                  <ColorDot
                    key={c}
                    color={c}
                    selected={colorHeader === c}
                    onClick={() => setColorHeader(c)}
                  />
                ))}
              </Box>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <input
                  type="color"
                  value={colorHeader}
                  onChange={(e) => setColorHeader(e.target.value)}
                  style={{
                    width: 28,
                    height: 28,
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
                <Typography fontSize={11} color="text.secondary">
                  Personalizado
                </Typography>
              </Box>
            </Box>
            <Box
              flex={1}
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={1}
            >
              <Typography fontSize={12} color="text.secondary">
                Preview
              </Typography>
              <Box
                sx={{
                  width: 80,
                  height: 100,
                  bgcolor: colorFondo,
                  borderRadius: 1,
                  boxShadow: 2,
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                }}
              >
                <Box
                  sx={{
                    bgcolor: colorHeader,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography fontSize={8} color="white" fontWeight={700}>
                    HEADER
                  </Typography>
                </Box>
              </Box>
              <Typography fontSize={10} color="text.secondary">
                {ancho}×{alto}px
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!nombre.trim() || loading}
          sx={{ bgcolor: "#1a1a2e", "&:hover": { bgcolor: "#2d2d5e" } }}
        >
          {loading ? "Creando..." : "Crear folleto"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ConfirmarBorrarModal({ open, flyer, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Borrar folleto</DialogTitle>
      <DialogContent>
        <Typography>
          ¿Seguro que querés borrar <strong>{flyer?.nombre}</strong>? Esta
          acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          Borrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [flyers, setFlyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [borrarFlyer, setBorrarFlyer] = useState(null);

  useEffect(() => {
    fetchFlyers();
  }, []);

  const fetchFlyers = async () => {
    const { data, error } = await supabase
      .from("flyers")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setFlyers(data);
    setLoading(false);
  };

  const handleCreate = async ({
    nombre,
    ancho,
    alto,
    color_fondo,
    color_header,
  }) => {
    const { data, error } = await supabase
      .from("flyers")
      .insert({ nombre, ancho, alto, color_fondo, color_header })
      .select()
      .single();
    if (!error) {
      setModalOpen(false);
      navigate(`/editor/${data.id}`);
    }
  };

  const handleDelete = async () => {
    if (!borrarFlyer) return;
    await supabase.from("flyers").delete().eq("id", borrarFlyer.id);
    setFlyers((prev) => prev.filter((f) => f.id !== borrarFlyer.id));
    setBorrarFlyer(null);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight={700}>
          Folletos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{ bgcolor: "#1a1a2e", "&:hover": { bgcolor: "#2d2d5e" } }}
        >
          Nuevo folleto
        </Button>
      </Box>

      <Grid container spacing={2}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton
                variant="rectangular"
                height={160}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))
        ) : flyers.length === 0 ? (
          <Grid item xs={12}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={10}
              color="text.secondary"
            >
              <Typography variant="h6" mb={1}>
                No hay folletos todavía
              </Typography>
              <Typography variant="body2">
                Creá uno nuevo con el botón de arriba
              </Typography>
            </Box>
          </Grid>
        ) : (
          flyers.map((flyer) => (
            <Grid item xs={12} sm={6} md={4} key={flyer.id}>
              <Card
                variant="outlined"
                sx={{ borderRadius: 2, overflow: "hidden" }}
              >
                <Box
                  sx={{ height: 8, bgcolor: flyer.color_fondo || "#ffd700" }}
                />
                <CardContent sx={{ pb: 1 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Typography fontWeight={600} fontSize={15}>
                      {flyer.nombre}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Chip
                        label={flyer.estado}
                        size="small"
                        color={estadoColor[flyer.estado] || "default"}
                      />
                      <Tooltip title="Borrar folleto">
                        <IconButton
                          size="small"
                          onClick={() => setBorrarFlyer(flyer)}
                          sx={{ color: "#ef4444" }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={0.5}
                    fontSize={12}
                  >
                    {flyer.ancho || 420} × {flyer.alto || 600}px
                  </Typography>
                  {flyer.fecha_inicio && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mt={0.5}
                      fontSize={12}
                    >
                      {flyer.fecha_inicio} → {flyer.fecha_fin}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/editor/${flyer.id}`)}
                  >
                    Editar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <NuevoFlyerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
      <ConfirmarBorrarModal
        open={!!borrarFlyer}
        flyer={borrarFlyer}
        onClose={() => setBorrarFlyer(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
