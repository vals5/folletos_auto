import { useState, useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "../../services/supabase";

export default function FooterUploader({ flyer, flyerId, footerUrl, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `footers/${flyerId}.${ext}`;
    const { error } = await supabase.storage.from("flyer-assets").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("flyer-assets").getPublicUrl(path);
      await supabase.from("flyers").update({ footer_url: data.publicUrl }).eq("id", flyerId);
      onUpdate(data.publicUrl);
    }
    setUploading(false);
  };

  const handleRemove = async () => {
    await supabase.from("flyers").update({ footer_url: null }).eq("id", flyerId);
    onUpdate(null);
  };

  if (footerUrl) return (
    <Box position="relative" sx={{ "&:hover .rem": { opacity: 1 } }}>
      <Box component="img" src={footerUrl} alt="Pie" sx={{ width: (flyer?.width || 420) * 0.5, minHeight: (flyer?.height || 600) * 0.5, borderRadius: 1 }} />
      <Box className="rem" onClick={handleRemove} sx={{ position: "absolute", top: 4, right: 4, bgcolor: "rgba(0,0,0,0.6)", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: 0, transition: "opacity 0.2s" }}>
        <DeleteIcon sx={{ color: "white", fontSize: 14 }} />
      </Box>
    </Box>
  );

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
      <Box onClick={() => inputRef.current?.click()} sx={{ border: "2px dashed rgba(0,0,0,0.15)", borderRadius: 1, p: 1, display: "flex", alignItems: "center", gap: 1, cursor: "pointer", bgcolor: "rgba(0,0,0,0.04)", "&:hover": { bgcolor: "rgba(0,0,0,0.08)" } }}>
        {uploading ? <CircularProgress size = {16}/> : <AddPhotoAlternateIcon sx={{ color: "rgba(0,0,0,0.35)", fontSize: 20 }} />}
        <Typography fontSize={10} color="rgba(0,0,0,0.4)">Subir pie de página</Typography>
      </Box>
    </>
  );
}