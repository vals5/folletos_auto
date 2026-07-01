// src/pages/Dashboard.jsx o donde lo tengas ubicado
import { useState, useEffect } from "react";
import { Box, Typography, Button, Card, CardContent, CardActions, Grid, Skeleton, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

import NewFlyerModal from "../components/utils/NewFlyerModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [flyers, setFlyers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
                  <Box sx={{ height: 160, bgcolor: flyer.bg_color || "#fff800", display: "flex", flexDirection: "column", borderBottom: "1px solid #eee" }}>
                    <Box sx={{ height: 36, bgcolor: flyer.header_color || "#ff0000", display: "flex", alignItems: "center", px: 1.5, gap: 1 }}>
                      {flyer.logo_izq_url && (
                        <Box component="img" src={flyer.logo_izq_url} alt="logo" sx={{ height: 22, maxWidth: 70, objectFit: "contain" }} />
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
                    <Button fullWidth variant="contained" size="small" onClick={() => navigate(`/editor/${flyer.id}`)} sx={{ borderRadius: 2, bgcolor: "#025BA9" }}>
                      Editar
                    </Button>
                    <Button size="small" color="error" variant="outlined" onClick={(e) => handleDelete(e, flyer.id)} sx={{ borderRadius: 2, minWidth: 36, px: 0 }}>
                      ✕
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
      </Grid>

      {/* Modal externalizado */}
      <NewFlyerModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </Box>
  );
}