import { useState, useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEditor } from "../context/EditorContext";
import { notify } from "../../../store/notifyStore";

const MAX_MB = 8;

export default function FooterUploader() {
  const { flyer, onUploadFooter, onRemoveFooter } = useEditor();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const footerUrl = flyer?.footer_url;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;
    if (!file.type.startsWith("image/")) return notify.error("El archivo tiene que ser una imagen.");
    if (file.size > MAX_MB * 1024 * 1024) return notify.error(`La imagen supera los ${MAX_MB} MB.`);

    setUploading(true);
    try {
      await onUploadFooter(file);
    } finally {
      setUploading(false);
    }
  };

  if (footerUrl) {
    return (
      <Box position="relative" sx={{ "&:hover .rem": { opacity: 1 } }}>
        <Box
          component="img"
          src={footerUrl}
          alt="Pie"
          sx={{ width: (flyer?.width || 420) * 0.5, minHeight: (flyer?.height || 600) * 0.5, borderRadius: 1 }}
        />
        <Box
          className="rem"
          onClick={onRemoveFooter}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            bgcolor: "rgba(0,0,0,0.6)",
            borderRadius: "50%",
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            opacity: 0,
            transition: "opacity 0.2s",
          }}
        >
          <DeleteIcon sx={{ color: "white", fontSize: 14 }} />
        </Box>
      </Box>
    );
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
      <Box
        onClick={() => inputRef.current?.click()}
        sx={{
          border: "2px dashed rgba(0,0,0,0.15)",
          borderRadius: 1,
          p: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          bgcolor: "rgba(0,0,0,0.04)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
        }}
      >
        {uploading ? <CircularProgress size={16} /> : <AddPhotoAlternateIcon sx={{ color: "rgba(0,0,0,0.35)", fontSize: 20 }} />}
        <Typography fontSize={10} color="rgba(0,0,0,0.4)">
          Subir pie de página
        </Typography>
      </Box>
    </>
  );
}
