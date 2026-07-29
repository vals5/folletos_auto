import { useState, useEffect } from "react";
import { Box } from "@mui/material";

export default function InlineText({ value, onSave, style = {}, placeholder = "Editar" }) {
  const [editing, setEditing] = useState(false);
  // Conservamos el valor localmente para que la interfaz responda al instante
  const [localVal, setLocalVal] = useState(value ?? "");

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setLocalVal(value);
    }
  }, [value]);

  const handleSave = () => {
    setEditing(false);
    const trimmed = String(localVal).trim();
    if (trimmed !== String(value ?? "").trim() && onSave) {
      onSave(localVal);
    }
  };

  if (editing) {
    return (
      <input
        value={localVal}
        autoFocus
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") {
            setEditing(false);
            setLocalVal(value ?? ""); 
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

  const hasText = localVal !== undefined && localVal !== null && String(localVal).trim() !== "";

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
      {hasText ? (
        localVal
      ) : (
        <span style={{ opacity: 0.5, fontStyle: "italic", fontSize: "0.9em", color: "inherit" }}>
          {placeholder}
        </span>
      )}
    </Box>
  );
}