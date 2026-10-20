import { Box } from "@mui/material";

// Texto en línea. Si recibe `onSave` se puede editar haciendo clic; se guarda al salir del campo (o con Enter).
export default function InlineText({ value, style = {}, placeholder = "Texto vacío", onSave }) {
  const text = value === undefined || value === null ? "" : String(value);
  const editable = typeof onSave === "function";

  const commit = (e) => {
    const nuevo = e.currentTarget.textContent.trim();
    if (nuevo !== text.trim()) onSave(nuevo);
  };

  return (
    <Box
      key={text}
      component="span"
      data-placeholder={placeholder}
      contentEditable={editable || undefined}
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={editable ? commit : undefined}
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }
          : undefined
      }
      sx={{
        borderRadius: 0.5,
        px: 0.2,
        py: 0.1,
        display: style.display || "inline-block",
        minHeight: "1em",
        verticalAlign: "middle",
        lineHeight: style.lineHeight || 1.1,
        letterSpacing: style.letterSpacing || "normal",
        cursor: editable ? "text" : "inherit",
        outline: "none",
        "&:empty::before": { content: "attr(data-placeholder)", opacity: 0.5, fontStyle: "italic", fontSize: "0.9em" },
        ...(editable && { "&:hover": { bgcolor: "rgba(0,0,0,0.06)" }, "&:focus": { bgcolor: "rgba(2,132,199,0.12)" } }),
        ...style,
      }}
    >
      {text}
    </Box>
  );
}
