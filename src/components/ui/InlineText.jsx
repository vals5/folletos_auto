import { useState, useEffect } from "react";
import { Box } from "@mui/material";

export default function InlineText({ value, onSave, style = {}, placeholder = "Editar" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  const handleSave = () => {
    setEditing(false);
    if (draft !== value && onSave) onSave(draft);
  };

  if (editing) {
    return (
      <input
        value={draft}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") {
            setEditing(false);
            setDraft(value || ""); 
          }
        }}
        style={{
          background: "rgba(255,255,255,0.95)",
          border: "1px dashed rgba(0,0,0,0.4)",
          borderRadius: 3,
          fontWeight: style.fontWeight || "inherit",
          fontSize: style.fontSize || "inherit",
          fontFamily: style.fontFamily || "inherit",
          outline: "none",
          padding: "1px 4px",
          color: "#000000",
          width: style.width || "auto",
          maxWidth: "100%",
          boxSizing: "border-box", 
          textAlign: style.textAlign || "left",
          lineHeight: style.lineHeight || 1.1,
          display: "inline-block",
        }}
      />
    );
  }

  const hasValue = value !== undefined && value !== null && String(value).trim() !== "";

  return (
    <Box
      component="span"
      onClick={() => setEditing(true)}
      sx={{
        cursor: "text",
        borderRadius: 0.5,
        px: 0.2,
        py: 0.1,
        display: style.display || "inline-block",
        minHeight: "1em",
        verticalAlign: "middle",
        "&:hover": { outline: "1px dashed rgba(0,0,0,0.3)", bgcolor: "rgba(0,0,0,0.06)" },
        ...style, 
      }}
    >
      {hasValue ? (
        value
      ) : (
        <span style={{ opacity: 0.5, fontStyle: "italic", fontSize: "0.9em", color: "inherit" }}>
          {placeholder}
        </span>
      )}
    </Box>
  );
}