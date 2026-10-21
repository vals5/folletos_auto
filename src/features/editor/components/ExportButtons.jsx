import { useState } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox,
  FormControlLabel, FormGroup, Alert, RadioGroup, Radio, Typography, Divider, Menu, MenuItem, ListItemIcon, ListItemText,
} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import FieldLabel from "../../../components/ui/FieldLabel";
import { exportToJPG, exportToPDF, EXPORT_QUALITIES } from "../utils/exportFlyer";

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

export default function ExportButtons({ getCanvasElements, flyer, paginas = [], onBeforeExport }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [quality, setQuality] = useState("standard");
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const total = paginas.length;
  const allIndices = Array.from({ length: total }, (_, i) => i);

  const handleOpenModal = (type) => {
    setMenuAnchor(null);
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
      // Se quita la selección para que el contorno azul no salga en el archivo.
      onBeforeExport?.();
      await nextFrame();

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
      <Button
        variant="contained"
        size="small"
        startIcon={<FileDownloadOutlinedIcon />}
        endIcon={<KeyboardArrowDownIcon />}
        onClick={(e) => setMenuAnchor(e.currentTarget)}
        disabled={exporting}
        aria-haspopup="menu"
        sx={{ py: 0.75 }}
      >
        Exportar
      </Button>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
        <MenuItem onClick={() => handleOpenModal("jpg")}>
          <ListItemIcon>
            <ImageOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Imagen JPG" secondary="Para redes y web" />
        </MenuItem>
        <MenuItem onClick={() => handleOpenModal("pdf")}>
          <ListItemIcon>
            <PictureAsPdfOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Documento PDF" secondary="Para imprimir" />
        </MenuItem>
      </Menu>

      <Dialog open={openModal} onClose={() => !exporting && setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Exportar {exportType === "pdf" ? "PDF" : "JPG"}</DialogTitle>

        <DialogContent>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <FieldLabel>Calidad</FieldLabel>
          <RadioGroup value={quality} onChange={(e) => setQuality(e.target.value)}>
            {Object.entries(EXPORT_QUALITIES).map(([value, { label }]) => (
              <FormControlLabel key={value} value={value} control={<Radio size="small" />} label={<span style={{ fontSize: 14 }}>{label}</span>} />
            ))}
          </RadioGroup>

          <Divider sx={{ my: 2 }} />

          <FieldLabel>Páginas</FieldLabel>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedIndices.length === total}
                indeterminate={selectedIndices.length > 0 && selectedIndices.length < total}
                onChange={(e) => setSelectedIndices(e.target.checked ? allIndices : [])}
              />
            }
            label={<span style={{ fontWeight: 600, fontSize: 14 }}>Todas las páginas ({total})</span>}
          />

          <FormGroup sx={{ ml: 3 }}>
            {paginas.map((pag, idx) => (
              <FormControlLabel
                key={pag.id}
                control={<Checkbox checked={selectedIndices.includes(idx)} onChange={() => handleTogglePage(idx)} size="small" />}
                label={<span style={{ fontSize: 14 }}>{pag.nombre || `Página ${idx + 1}`}</span>}
              />
            ))}
          </FormGroup>

          {exportType === "jpg" && selectedIndices.length > 1 && (
            <Typography fontSize={12} color="text.secondary" mt={1.5}>
              Con varias páginas se descarga un único archivo .zip.
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenModal(false)} disabled={exporting} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmExport}
            variant="contained"
            disabled={selectedIndices.length === 0 || exporting}
            startIcon={exporting && <CircularProgress size={14} color="inherit" />}
          >
            {exporting ? "Generando…" : "Descargar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
