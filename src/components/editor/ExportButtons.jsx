import React, { useState } from "react";
import { Box, Button, Tooltip, CircularProgress } from "@mui/material";
import { Image, PictureAsPdf } from "@mui/icons-material";
import { exportToJPG, exportToPDF } from "../utils/ExportFlyer";

export default function ExportButtons({ canvasRefs, flyerName, btnStyle = {} }) {
  const [exporting, setExporting] = useState(null);

  const handleExport = async (type) => {
    setExporting(type);
    setTimeout(async () => {
      if (type === "jpg") {
        await exportToJPG(canvasRefs, flyerName);
      } else if (type === "pdf") {
        await exportToPDF(canvasRefs, flyerName);
      }
      setExporting(null);
    }, 300);
  };

  return (
    <Box display="flex" gap={1}>
      <Tooltip title="Exportar JPG (una por página)">
        <Button 
          size="small" 
          variant="outlined"
          startIcon={exporting === "jpg" ? <CircularProgress size={14} /> : <Image />}
          onClick={() => handleExport("jpg")} 
          disabled={!!exporting}
          sx={{ ...btnStyle, borderColor: "#d1d5db", color: "#374151" }}
        >
          JPG
        </Button>
      </Tooltip>
      
      <Tooltip title="Exportar PDF (todas las páginas)">
        <Button 
          size="small" 
          variant="outlined"
          startIcon={exporting === "pdf" ? <CircularProgress size={14} /> : <PictureAsPdf />}
          onClick={() => handleExport("pdf")} 
          disabled={!!exporting}
          sx={{ ...btnStyle, borderColor: "#d1d5db", color: "#374151" }}
        >
          PDF
        </Button>
      </Tooltip>
    </Box>
  );
}