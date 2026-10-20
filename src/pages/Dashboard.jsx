import { useState } from "react";
import { Box, Typography, Button, Card, CardContent, CardActions, Grid, Skeleton, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

import NewFlyerModal from "../components/modals/NewFlyerModal";
import { useFlyers, useFlyerMutations } from "../hooks/useFlyers";
import ImprecLogo from "../assets/img/Imprecionante.svg";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: flyers = [], isLoading } = useFlyers();
  const { create, remove } = useFlyerMutations();

  const handleCreate = async (payload) => {
    try {
      const flyer = await create.mutateAsync(payload);
      setIsModalOpen(false);
      navigate(`/editor/${flyer.id}`);
    } catch {
      // el error ya se muestra con notify desde el hook
    }
  };

  const handleDelete = (e, flyerId) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar este folleto?")) return;
    remove.mutate(flyerId);
  };

  return (
    <Box p={2} sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} mt={2} px={2}>
        <Typography variant="h4" fontWeight={900} color="#1a1a2e">
          Folletos
        </Typography>
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
                {/* TARJETA DEL DASHBOARD */}
                <Card sx={{ borderRadius: 4, transition: "0.3s", "&:hover": { boxShadow: 10 } }}>
                  {/* Fondo y Logo de la vista previa */}
                  <Box
                    sx={{
                      height: 160,
                      bgcolor: flyer.bg_color || "#fff800",
                      display: "flex",
                      flexDirection: "column",
                      borderBottom: "1px solid #eee",
                      p: 1.5,
                      position: "relative",
                    }}
                  >
                    {flyer.logo_izq_url ? (
                      <Box
                        component="img"
                        src={flyer.logo_izq_url}
                        alt="logo"
                        onError={(e) => (e.target.style.display = "none")}
                        sx={{ height: 26, maxWidth: 90, objectFit: "contain", alignSelf: "flex-start" }}
                      />
                    ) : (
                      <Box
                        component="img"
                        src={ImprecLogo}
                        alt="logo"
                        onError={(e) => (e.target.style.display = "none")}
                        sx={{ height: 26, maxWidth: 90, objectFit: "contain", alignSelf: "flex-start" }}
                      />
                    )}
                  </Box>

                  {/* Contenido (Títulos, chips, etc) */}
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={800} noWrap>
                      {flyer.nombre}
                    </Typography>
                    <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                      <Chip label={`${flyer.width}×${flyer.height}px`} size="small" sx={{ fontSize: 10 }} />
                      <Chip
                        label="IMPRECIONANTE"
                        size="small"
                        sx={{ fontSize: 10, bgcolor: "#fff8e1", color: "#b45309" }}
                      />
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() => navigate(`/editor/${flyer.id}`)}
                      sx={{ borderRadius: 2, bgcolor: "#025BA9" }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
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

      {/* Modal externalizado */}
      <NewFlyerModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreate} />
    </Box>
  );
}
