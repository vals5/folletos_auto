import { useState } from "react";
import {
  Box, Button, Tooltip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Checkbox, FormControlLabel, FormGroup, Alert, RadioGroup, Radio, Typography, Divider,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { exportToJPG, exportToPDF, EXPORT_QUALITIES } from "../utils/exportFlyer";

const BTN_SX = {
  borderRadius: "20px",
  bgcolor: "#0284c7",
  color: "white",
  textTransform: "none",
  px: 2,
  "&:hover": { bgcolor: "#0369a1" },
};

export default function ExportButtons({ getCanvasElements, flyer, paginas = [] }) {
  const [exporting, setExporting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [quality, setQuality] = useState("standard");
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const total = paginas.length;
  const allIndices = Array.from({ length: total }, (_, i) => i);

  const handleOpenModal = (type) => {
    setExportType(type);
    setQuality(type === "pdf" ? "print" : "standard");
    setErrorMsg(null);
    setSelectedIndices(allIndices);
    setOpenModal(true);
  };

  const handleTogglePage = (index) =>
    setSelectedIndices((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index].sort((a, b) => a - b)));

  const handleConfirmExport = async () => {
    if (selectedIndices.length === 0) return;
    setExporting(true);
    setErrorMsg(null);

    try {
      const elementos = getCanvasElements();
      const seleccion = selectedIndices.map((i) => elementos[i]);
      if (exportType === "jpg") await exportToJPG(seleccion, flyer, { quality });
      else await exportToPDF(seleccion, flyer, { quality });
      setOpenModal(false);
    } catch (err) {
      console.error("Error al exportar:", err);
      setErrorMsg(err?.message || "Ocurrió un error al generar los archivos.");
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
            startIcon={<ImageIcon />}
            onClick={() => handleOpenModal("jpg")}
            disabled={exporting}
            sx={BTN_SX}
          >
            JPG
          </Button>
        </Tooltip>

        <Tooltip title="Exportar PDF">
          <Button
            size="small"
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => handleOpenModal("pdf")}
            disabled={exporting}
            sx={BTN_SX}
          >
            PDF
          </Button>
        </Tooltip>
      </Box>

      <Dialog
        open={openModal}
        onClose={() => !exporting && setOpenModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "20px", p: 1, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 17, pt: 2, pb: 1 }}>
          Exportar {exportType?.toUpperCase()}
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: "#f3f4f6", py: 1.5 }}>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
              {errorMsg}
            </Alert>
          )}

          <Typography fontSize={12} fontWeight={700} color="#64748b" mb={0.5}>
            CALIDAD
          </Typography>
          <RadioGroup value={quality} onChange={(e) => setQuality(e.target.value)}>
            {Object.entries(EXPORT_QUALITIES).map(([value, { label }]) => (
              <FormControlLabel
                key={value}
                value={value}
                control={<Radio size="small" />}
                label={<span style={{ fontSize: 13 }}>{label}</span>}
              />
            ))}
          </RadioGroup>

          <Divider sx={{ my: 1.5 }} />

          <Typography fontSize={12} fontWeight={700} color="#64748b" mb={0.5}>
            PÁGINAS
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedIndices.length === total}
                indeterminate={selectedIndices.length > 0 && selectedIndices.length < total}
                onChange={(e) => setSelectedIndices(e.target.checked ? allIndices : [])}
                sx={{ "&.Mui-checked": { color: "#0284c7" } }}
              />
            }
            label={<span style={{ fontWeight: 600, fontSize: 14 }}>Todas las páginas ({total})</span>}
          />

          <FormGroup sx={{ ml: 1.5, mt: 0.5 }}>
            {paginas.map((pag, idx) => (
              <FormControlLabel
                key={pag.id}
                control={
                  <Checkbox
                    checked={selectedIndices.includes(idx)}
                    onChange={() => handleTogglePage(idx)}
                    size="small"
                    sx={{ "&.Mui-checked": { color: "#0284c7" } }}
                  />
                }
                label={<span style={{ fontSize: 13, color: "#374151" }}>{pag.nombre || `Página ${idx + 1}`}</span>}
              />
            ))}
          </FormGroup>

          {exportType === "jpg" && selectedIndices.length > 1 && (
            <Typography fontSize={11} color="#64748b" mt={1}>
              Con varias páginas se descarga un único archivo .zip.
            </Typography>
          )}
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
            sx={{ borderRadius: "20px", bgcolor: "#0284c7", textTransform: "none", fontWeight: 700, px: 3, "&:hover": { bgcolor: "#0369a1" } }}
          >
            {exporting ? "Generando..." : "Descargar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
