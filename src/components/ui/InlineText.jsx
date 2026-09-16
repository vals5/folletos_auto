import { Box } from "@mui/material";

export default function InlineText({ value, style = {}, placeholder = "Texto vacío" }) {
  const hasText = value !== undefined && value !== null && String(value).trim() !== "";

  return (
    <Box
      component="span"
      sx={{
        borderRadius: 0.5,
        px: 0.2,
        py: 0.1,
        display: style.display || "inline-block",
        minHeight: "1em",
        verticalAlign: "middle",
        lineHeight: style.lineHeight || 1.1,
        letterSpacing: style.letterSpacing || "normal",
        ...style,
      }}
    >
      {hasText ? (
        value
      ) : (
        <span style={{ opacity: 0.5, fontStyle: "italic", fontSize: "0.9em", color: "inherit" }}>
          {placeholder}
        </span>
      )}
    </Box>
  );
}