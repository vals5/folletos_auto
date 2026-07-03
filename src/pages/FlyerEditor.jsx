import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, IconButton, Typography, Chip, Tooltip, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useFlyerEditor } from "../components/utils/useFlyerEditor"; 

import ProductsSidebar from "../components/editor/ProductsSidebar";
import CanvasPreview from "../components/editor/CanvasPreview";
import PropertiesPanel from "../components/editor/PropertiesPanel";
import DuplicarModal from "../components/utils/DuplicarModal";
import ConfirmarEliminarPagina from "../components/utils/ConfirmarEliminarPagina";

export default function FlyerEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    flyer,
    plantilla,
    paginas,
    modulosPorPagina,
    paginaActual,
    setPaginaActual,
    selectedModulo,
    setSelectedModulo,
    loading,
    errorMsg,
    duplicarModulo,
    setDuplicarModulo,
    eliminarPagina,
    setEliminarPagina,
    handleOnAddProducto,
    handleDeleteModulo,
    handleUpdateModulo,
    handleAddPagina,
    handleDeletePagina,
    handleMenuAction,
    handleResize,
    handleReorderModulos,
    handleDuplicar,
    handleFlyerUpdate,
    modulosPaginaActual
  } = useFlyerEditor(id); 

  if (loading) {
    return (
      <Box display="flex" height="100dvh" justifyContent="center" alignItems="center"><CircularProgress /></Box>
    );
  }

  if (errorMsg) {
    return (
      <Box display="flex" height="100dvh" justifyContent="center" alignItems="center" flexDirection="column" gap={2}>
        <Typography color="error" fontWeight={700}>{errorMsg}</Typography>
        <Button variant="outlined" onClick={() => navigate("/dashboard")}>Volver al dashboard</Button>
      </Box>
    );
  }

  return (
    <Box display="flex" height="100dvh" overflow="hidden">
      <ProductsSidebar
        modulos={modulosPaginaActual}
        selectedModulo={selectedModulo}
        onSelectModulo={setSelectedModulo}
        onAddProducto={handleOnAddProducto}
        onDeleteModulo={handleDeleteModulo}
      />

      <Box display="flex" flexDirection="column" flex={1} overflow="hidden">
        <Box sx={{ height: 52, bgcolor: "#ffffff", display: "flex", alignItems: "center", px: 2, gap: 2, borderBottom: "1px solid #e5e7eb" }}>
          <Tooltip title="Volver al dashboard">
            <IconButton size="small" onClick={() => navigate("/dashboard")} sx={{ color: "#025BA9" }}><ArrowBackIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Typography fontWeight={600} color="#025BA9" fontSize={14} noWrap>{flyer?.name || flyer?.nombre}</Typography>
          {plantilla && <Chip label={plantilla.nombre} size="small" sx={{ bgcolor: plantilla.color_header || "#ff0000", color: "white", fontSize: 10, fontWeight: 700 }} />}
          <Chip label={flyer?.estado || "BORRADOR"} size="small" sx={{ bgcolor: "#025BA9", color: "white", fontSize: 11 }} />
        </Box>

        <Box display="flex" flex={1} overflow="hidden">
          <CanvasPreview
            flyer={flyer}
            plantilla={plantilla}
            paginas={paginas}
            modulosPorPagina={modulosPorPagina}
            paginaActual={paginaActual}
            setPaginaActual={setPaginaActual}
            selectedModulo={selectedModulo}
            onSelectModulo={setSelectedModulo}
            onFlyerUpdate={handleFlyerUpdate}
            onReorderModulos={handleReorderModulos}
            onAddPagina={handleAddPagina}
            onDeletePagina={(idx, pag) => setEliminarPagina({ idx, pag })}
            onMenuAction={handleMenuAction}
            onResize={handleResize}
            onAddProducto={handleOnAddProducto}
          />
          <PropertiesPanel modulo={selectedModulo} onUpdate={handleUpdateModulo} onDuplicate={(m) => setDuplicarModulo(m)} />
        </Box>
      </Box>

      <DuplicarModal open={!!duplicarModulo} modulo={duplicarModulo} onClose={() => setDuplicarModulo(null)} onDuplicate={handleDuplicar} />
      <ConfirmarEliminarPagina open={!!eliminarPagina} onClose={() => setEliminarPagina(null)} onConfirm={handleDeletePagina} />
    </Box>
  );
}