import { useState, useEffect } from "react";
import { Box } from "@mui/material";

export default function InlineText({ value, onSave, style = {}, placeholder = "Editar" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  // Sincroniza el valor externo solo cuando no se está editando activamente
  useEffect(() => {
    if (!editing) {
      setDraft(value ?? "");
    }
  }, [value, editing]);

  const handleBlur = () => {
    setEditing(false);
    if (String(draft) !== String(value ?? "") && onSave) {
      onSave(draft);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur(); // Dispara el blur y guarda
    }
    if (e.key === "Escape") {
      setEditing(false);
      setDraft(value ?? "");
    }
  };

  if (editing) {
    return (
      <input
        type="text"
        value={draft}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
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

  const hasText = draft !== undefined && draft !== null && String(draft).trim() !== "";

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
        draft
      ) : (
        <span style={{ opacity: 0.5, fontStyle: "italic", fontSize: "0.9em", color: "inherit" }}>
          {placeholder}
        </span>
      )}
    </Box>
  );
}