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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

const estadoColor = {
  borrador: "default",
  revision: "warning",
  publicado: "success",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [flyers, setFlyers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const crearFlyer = async () => {
    const nombre = `Folleto ${new Date().toLocaleDateString("es-AR")}`;
    const { data, error } = await supabase
      .from("flyers")
      .insert({ nombre })
      .select()
      .single();

    if (!error) navigate(`/editor/${data.id}`);
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
          onClick={crearFlyer}
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
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Typography fontWeight={600} fontSize={15}>
                      {flyer.nombre}
                    </Typography>
                    <Chip
                      label={flyer.estado}
                      size="small"
                      color={estadoColor[flyer.estado] || "default"}
                    />
                  </Box>
                  {flyer.fecha_inicio && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
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
    </Box>
  );
}
