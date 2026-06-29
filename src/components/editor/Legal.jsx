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
    <Box sx={{ bgcolor: "rgba(0,0,0,0.05)", borderRadius: 1, p: 0.8, mt: 0.5 }}>
      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          autoFocus
          rows={2}
          style={{ width: (flyer?.width || 420) * 0.5, minHeight: (flyer?.height || 600) * 0.5, background: "transparent", border: "1px dashed rgba(0,0,0,0.25)", borderRadius: 4,
            resize: "none", 
            outline: "none",
            padding: "2px 4px",
            fontFamily: "'Imprec-Legal',sans-serif",
            fontSize: "9pt",
            color: "#333",
          }}
        />
      ) : (
        <Typography onClick={() => setEditing(true)} sx={{ ...IMPREC.legal, cursor: "text", "&:hover": { color: "rgba(0,0,0,0.6)" } }}>
          {legal || <em style={{ fontStyle: "italic", opacity: 0.35 }}>Editar legal</em>}
        </Typography>
      )}
    </Box>
  );
}