import { useState } from "react";
import { Box, Typography, Button, Card, CardContent, Grid, Skeleton, Chip, IconButton, Tooltip, CardActionArea } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useNavigate } from "react-router-dom";

import NewFlyerModal from "../components/modals/NewFlyerModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { useFlyers, useFlyerMutations } from "../hooks/useFlyers";
import ImprecLogo from "../assets/img/Imprecionante.svg";
import { TEMPLATES } from "../config/templates";

const formatFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aBorrar, setABorrar] = useState(null);
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

  const handleConfirmDelete = async () => {
    if (!aBorrar) return;
    try {
      await remove.mutateAsync(aBorrar.id);
      setABorrar(null);
    } catch {
      // el error ya se muestra con notify desde el hook
    }
  };

  const nuevoBtn = (
    <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)}>
      Nuevo folleto
    </Button>
  );

  return (
    <Box>
      <PageHeader
        title="Folletos"
        subtitle={isLoading ? "Cargando…" : `${flyers.length} ${flyers.length === 1 ? "folleto" : "folletos"}`}
        action={flyers.length > 0 || isLoading ? nuevoBtn : null}
      />

      {!isLoading && flyers.length === 0 ? (
        <EmptyState
          icon={DescriptionOutlinedIcon}
          title="Todavía no hay folletos"
          description="Creá el primero para empezar a armar tus ofertas."
          action={nuevoBtn}
        />
      ) : (
        <Grid container spacing={3}>
          {isLoading
            ? [1, 2, 3, 4].map((n) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={n}>
                  <Skeleton variant="rectangular" height={260} />
                </Grid>
              ))
            : flyers.map((flyer) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={flyer.id}>
                  <Card sx={{ transition: "box-shadow 0.2s, transform 0.2s", "&:hover": { boxShadow: 3, transform: "translateY(-2px)" } }}>
                    <CardActionArea onClick={() => navigate(`/editor/${flyer.id}`)} aria-label={`Abrir ${flyer.nombre}`}>
                      <Box
                        sx={{
                          height: 150,
                          bgcolor: flyer.bg_color || TEMPLATES[0].bgColor,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          p: 1.5,
                        }}
                      >
                        <Box
                          component="img"
                          src={flyer.logo_izq_url || ImprecLogo}
                          alt=""
                          onError={(e) => (e.target.style.display = "none")}
                          sx={{ height: 26, maxWidth: 90, objectFit: "contain", display: "block" }}
                        />
                      </Box>
                      <CardContent sx={{ pb: "12px !important" }}>
                        <Typography fontWeight={700} noWrap title={flyer.nombre}>
                          {flyer.nombre}
                        </Typography>
                        <Typography fontSize={12} color="text.secondary" mt={0.25}>
                          {flyer.created_at ? `Creado el ${formatFecha(flyer.created_at)}` : " "}
                        </Typography>
                        <Box display="flex" gap={0.75} flexWrap="wrap" mt={1.25}>
                          <Chip label={`${flyer.width}×${flyer.height}`} size="small" sx={{ bgcolor: "neutral.100", color: "text.secondary" }} />
                          <Chip label="Imprecionante" size="small" sx={{ bgcolor: "warning.light", color: "warning.dark" }} />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                    <Box display="flex" gap={1} px={2} pb={2}>
                      <Button fullWidth variant="contained" size="small" onClick={() => navigate(`/editor/${flyer.id}`)}>
                        Editar
                      </Button>
                      <Tooltip title="Eliminar folleto">
                        <IconButton
                          size="small"
                          aria-label={`Eliminar ${flyer.nombre}`}
                          onClick={() => setABorrar(flyer)}
                          sx={{ border: "1px solid", borderColor: "divider", color: "text.secondary", "&:hover": { color: "error.main", borderColor: "error.main", bgcolor: "error.light" } }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Grid>
              ))}
        </Grid>
      )}

      <NewFlyerModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreate} />
      <ConfirmDialog
        open={!!aBorrar}
        title="Eliminar folleto"
        confirmLabel="Eliminar"
        destructive
        onClose={() => setABorrar(null)}
        onConfirm={handleConfirmDelete}
      >
        ¿Seguro que querés eliminar <strong>{aBorrar?.nombre}</strong>? Se borrarán también sus páginas y módulos.
      </ConfirmDialog>
    </Box>
  );
}
