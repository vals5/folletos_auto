import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Button } from "@mui/material";

import { useFlyerEditor } from "../features/editor/hooks/useFlyerEditor";
import { EditorContext } from "../features/editor/context/EditorContext";

import ProductsSidebar from "../features/editor/components/ProductsSidebar";
import CanvasPreview from "../features/editor/components/CanvasPreview";
import PropertiesPanel from "../features/editor/components/PropertiesPanel";
import DuplicarModal from "../components/modals/DuplicarModal";
import ConfirmarEliminarPagina from "../components/modals/ConfirmarEliminarPagina";

export default function FlyerEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editor = useFlyerEditor(id);

  if (editor.loading) {
    return (
      <Box display="flex" height="100dvh" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  if (editor.errorMsg) {
    return (
      <Box display="flex" height="100dvh" justifyContent="center" alignItems="center" flexDirection="column" gap={2}>
        <Typography color="error" fontWeight={700}>
          {editor.errorMsg}
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/dashboard")}>
          Volver al dashboard
        </Button>
      </Box>
    );
  }

  // Datos y acciones que usan los componentes del canvas (ver useEditor()).
  const contexto = {
    flyer: editor.flyer,
    grid: editor.grid,
    onFlyerUpdate: editor.handleFlyerUpdate,
    onUpdateModulo: editor.handleUpdateModulo,
    onUploadFooter: editor.handleUploadFooter,
    onRemoveFooter: editor.handleRemoveFooter,
    onUploadImagen: editor.handleUploadImagenModulo,
  };

  return (
    <EditorContext.Provider value={contexto}>
      <Box display="flex" height="100dvh" overflow="hidden">
        <ProductsSidebar
          modulos={editor.modulosPaginaActual}
          selectedModulo={editor.selectedModulo}
          onSelectModulo={editor.setSelectedModulo}
          onAddProducto={editor.handleAddProducto}
          onDeleteModulo={editor.handleDeleteModulo}
        />

        <Box display="flex" flex={1} overflow="hidden">
          <Box flex={1} display="flex" flexDirection="column" minWidth={0} position="relative">
            <CanvasPreview
              flyer={editor.flyer}
              paginas={editor.paginas}
              modulosPorPagina={editor.modulosPorPagina}
              paginaActual={editor.paginaActual}
              setPaginaActual={editor.setPaginaActual}
              selectedModulo={editor.selectedModulo}
              onSelectModulo={editor.setSelectedModulo}
              onFlyerUpdate={editor.handleFlyerUpdate}
              onReorderModulos={editor.handleReorderModulos}
              onAddPagina={editor.handleAddPagina}
              onRenamePagina={editor.handleRenamePagina}
              onDeletePagina={(idx, pag) => editor.setEliminarPagina({ idx, pag })}
              onDeleteModulo={editor.handleDeleteModulo}
              onBack={() => navigate("/dashboard")}
              onUndo={editor.handleDeshacer}
              onRedo={editor.handleRehacer}
              canUndo={editor.puedeDeshacer}
              canRedo={editor.puedeRehacer}
              onCopy={editor.copiarSeleccion}
              onPaste={editor.pegarCopiado}
              canPaste={editor.puedePegar}
              onDuplicate={editor.duplicarSeleccion}
            />
          </Box>

          <PropertiesPanel
            key={editor.selectedModulo?.id ?? "sin-seleccion"}
            modulo={editor.selectedModulo}
            onUpdate={editor.handleUpdateModulo}
            onDuplicate={editor.setDuplicarModulo}
          />
        </Box>

        <DuplicarModal
          open={!!editor.duplicarModulo}
          modulo={editor.duplicarModulo}
          onClose={() => editor.setDuplicarModulo(null)}
          onDuplicate={editor.handleDuplicar}
        />
        <ConfirmarEliminarPagina
          open={!!editor.eliminarPagina}
          onClose={() => editor.setEliminarPagina(null)}
          onConfirm={editor.handleDeletePagina}
        />
      </Box>
    </EditorContext.Provider>
  );
}
