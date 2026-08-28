import React, { useState } from "react";
import { 
  Box, Button, Tooltip, CircularProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions, Checkbox, FormControlLabel, FormGroup, Alert 
} from "@mui/material";
import { Image, PictureAsPdf } from "@mui/icons-material";
import { exportToJPG, exportToPDF } from "../utils/ExportFlyer";

export default function ExportButtons({ canvasRefs, flyerName, paginas = [], btnStyle = {} }) {
  const [exporting, setExporting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [exportType, setExportType] = useState(null); 
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleOpenModal = (type) => {
    setExportType(type);
    setErrorMsg(null);
    const allIndices = canvasRefs.map((_, idx) => idx);
    setSelectedIndices(allIndices);
    setOpenModal(true);
  };

  const handleToggleAll = (e) => {
    if (e.target.checked) {
      setSelectedIndices(canvasRefs.map((_, idx) => idx));
    } else {
      setSelectedIndices([]);
    }
  };

  const handleTogglePage = (index) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleConfirmExport = async () => {
    if (selectedIndices.length === 0) return;
    setExporting(true);
    setErrorMsg(null);

    const filteredRefs = selectedIndices.map((i) => canvasRefs[i]);

    try {
      if (exportType === "jpg") {
        await exportToJPG(filteredRefs, flyerName);
      } else if (exportType === "pdf") {
        await exportToPDF(filteredRefs, flyerName);
      }
      setOpenModal(false);
    } catch (err) {
      console.error("Error al exportar:", err);
      setErrorMsg("Ocurrió un error al generar los archivos. Revisá la consola.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Box display="flex" gap={1}>
        <Tooltip title="Exportar">
          <Button 
            size="small" 
            variant="outlined"
            startIcon={exporting && exportType === "jpg" ? <CircularProgress size={14} /> : <Image />}
            onClick={() => handleOpenModal("jpg")} 
            disabled={exporting}
            sx={{ ...btnStyle, borderRadius: "20px", bgcolor: "#0284c7", color: "white" }}
          >
            JPG
          </Button>
        </Tooltip>
        
        <Tooltip title="Exportar">
          <Button 
            size="small" 
            variant="outlined"
            startIcon={exporting && exportType === "pdf" ? <CircularProgress size={14} /> : <PictureAsPdf />}
            onClick={() => handleOpenModal("pdf")} 
            disabled={exporting}
            sx={{ ...btnStyle, borderRadius: "20px", bgcolor: "#0284c7", color: "white" }}
          >
            PDF
          </Button>
        </Tooltip>
      </Box>

      {/* MODAL SELECCIÓN DE PÁGINAS */}
      <Dialog open={openModal} onClose={() => !exporting && setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: 16 }}>
          Exportar {exportType?.toUpperCase()} - Seleccionar Páginas
        </DialogTitle>
        
        <DialogContent dividers>
          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedIndices.length === canvasRefs.length} 
                indeterminate={selectedIndices.length > 0 && selectedIndices.length < canvasRefs.length}
                onChange={handleToggleAll} 
              />
            }
            label={<b>Todas las páginas ({canvasRefs.length})</b>}
          />

          <FormGroup sx={{ ml: 2, mt: 1 }}>
            {canvasRefs.map((_, idx) => {
              const pageLabel = paginas[idx]?.nombre || `Página ${idx + 1}`;
              return (
                <FormControlLabel
                  key={idx}
                  control={
                    <Checkbox 
                      checked={selectedIndices.includes(idx)} 
                      onChange={() => handleTogglePage(idx)} 
                      size="small"
                    />
                  }
                  label={pageLabel}
                />
              );
            })}
          </FormGroup>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} disabled={exporting} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmExport} 
            variant="contained" 
            disabled={selectedIndices.length === 0 || exporting}
            startIcon={exporting && <CircularProgress size={14} color="inherit" />}
          >
            {exporting ? "Generando..." : "Descargar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}