import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { supabase } from "../../services/supabase";

export default function LegalEditable({ flyer, flyerId, legal, onUpdate, IMPREC }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(legal || "");

  const save = async () => {
    setEditing(false);
    await supabase.from("flyers").update({ legal: draft }).eq("id", flyerId);
    onUpdate(draft);
  };

  return (
    <Box sx={{ bgcolor: "rgba(0,0,0,0.03)", borderRadius: "2px", p: 0.3, mt: "auto", width: "100%", boxSizing: "border-box" }}>
      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          autoFocus
          rows={2}
          style={{ 
            width: "100%", 
            minHeight: "35px", 
            maxHeight: "60px",
            background: "transparent", 
            border: "1px dashed rgba(0,0,0,0.25)", 
            borderRadius: "2px",
            resize: "none", 
            outline: "none",
            padding: "2px 4px",
            fontFamily: IMPREC?.legal?.fontFamily || "'Imprec-Legal', sans-serif",
            fontSize: "5.5pt",
            lineHeight: 1,
            color: "#000",
            boxSizing: "border-box"
          }}
        />
      ) : (
        <Typography 
          onClick={() => setEditing(true)} 
          sx={{ 
            ...(IMPREC?.legal || {}), 
            fontSize: "9pt", 
            lineHeight: 1, 
            cursor: "text", 
            textAlign: "center",
            width: "100%",
            wordBreak: "break-word",
            "&:hover": { opacity: 0.7 } 
          }}
        >
          {legal || <em style={{ fontStyle: "italic", opacity: 0.35 }}>Editar legal</em>}
        </Typography>
      )}
    </Box>
  );
}