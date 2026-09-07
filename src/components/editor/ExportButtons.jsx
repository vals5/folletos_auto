import React, { useState } from "react";
import { 
  Box, Button, Tooltip, CircularProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions, Checkbox, FormControlLabel, FormGroup, Alert 
} from "@mui/material";
import { Image, PictureAsPdf } from "@mui/icons-material";
import { exportToJPG, exportToPDF } from "../../utils/ExportFlyer";

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
        <Tooltip title="Exportar JPG">
          <Button 
            size="small" 
            variant="contained"
            startIcon={exporting && exportType === "jpg" ? <CircularProgress size={14} color="inherit" /> : <Image />}
            onClick={() => handleOpenModal("jpg")} 
            disabled={exporting}
            sx={{ 
              ...btnStyle, 
              borderRadius: "20px", 
              bgcolor: "#0284c7", 
              color: "white",
              textTransform: "none",
              px: 2,
              "&:hover": { bgcolor: "#0369a1" }
            }}
          >
            JPG
          </Button>
        </Tooltip>
        
        <Tooltip title="Exportar PDF">
          <Button 
            size="small" 
            variant="contained"
            startIcon={exporting && exportType === "pdf" ? <CircularProgress size={14} color="inherit" /> : <PictureAsPdf />}
            onClick={() => handleOpenModal("pdf")} 
            disabled={exporting}
            sx={{ 
              ...btnStyle, 
              borderRadius: "20px", 
              bgcolor: "#0284c7", 
              color: "white",
              textTransform: "none",
              px: 2,
              "&:hover": { bgcolor: "#0369a1" }
            }}
          >
            PDF
          </Button>
        </Tooltip>
      </Box>

      {/* MODAL SELECCIÓN DE PÁGINAS REDONDEADA */}
      <Dialog 
        open={openModal} 
        onClose={() => !exporting && setOpenModal(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            p: 1,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 17, pt: 2, pb: 1 }}>
          Exportar {exportType?.toUpperCase()} - Seleccionar Páginas
        </DialogTitle>
        
        <DialogContent dividers sx={{ borderBottom: "1px solid #f3f4f6", borderTop: "1px solid #f3f4f6", py: 1.5 }}>
          {errorMsg && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>{errorMsg}</Alert>}

          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedIndices.length === canvasRefs.length} 
                indeterminate={selectedIndices.length > 0 && selectedIndices.length < canvasRefs.length}
                onChange={handleToggleAll} 
                sx={{ "&.Mui-checked": { color: "#0284c7" } }}
              />
            }
            label={<span style={{ fontWeight: 600, fontSize: 14 }}>Todas las páginas ({canvasRefs.length})</span>}
          />

          <FormGroup sx={{ ml: 1.5, mt: 0.5 }}>
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
                      sx={{ "&.Mui-checked": { color: "#0284c7" } }}
                    />
                  }
                  label={<span style={{ fontSize: 13, color: "#374151" }}>{pageLabel}</span>}
                />
              );
            })}
          </FormGroup>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setOpenModal(false)} 
            disabled={exporting} 
            sx={{ borderRadius: "20px", textTransform: "none", color: "#4b5563", px: 2 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmExport} 
            variant="contained" 
            disabled={selectedIndices.length === 0 || exporting}
            startIcon={exporting && <CircularProgress size={14} color="inherit" />}
            sx={{ 
              borderRadius: "20px", 
              bgcolor: "#0284c7", 
              textTransform: "none", 
              fontWeight: 700,
              px: 3,
              "&:hover": { bgcolor: "#0369a1" } 
            }}
          >
            {exporting ? "Generando..." : "Descargar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}