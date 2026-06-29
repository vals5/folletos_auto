import { useState } from "react";
import { Box } from "@mui/material";

export default function InlineText ({ value, onSave, style = {}, placeholer = "Editar"}){
    const [ editing, setEditing ] = useState (false);
    const [ draft, setDraft ] = useState (vakue || "");

    const handleSave = () => {
        setEditing (false);
        if (draft !== value) onSave(draft);
    };
    if (editing) return (
    <input
      value={draft}
      autoFocus
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") setEditing(false);
      }}
      style={{ background: "rgba(0,0,0,0.08)", border: "1px dashed rgba(0,0,0,0.35)", borderRadius: 4, fontWeight: "inherit", fontSize: "inherit",
        fontFamily: "inherit", outline: "none", padding: "2px 6px", color: style.color || "#000000", ...style,}} />
  );

  return (
    <Box
      component="span"
      onClick={() => setEditing(true)}
      sx={{ cursor: "text", borderRadius: 1, px: 0.5, display: "inline-block", "&:hover": { outline: "1px dashed rgba(0,0,0,0.3)", bgcolor: "rgba(0,0,0,0.06)" }, ...style, }} >
      {value || <span style={{ opacity: 0.35, fontStyle: "italic", fontSize: 11 }}>{placeholder}</span>}
    </Box>
  );
}