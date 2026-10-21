import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { neutral, radius, shadow, semantic } from "../../theme/tokens";

// Selector de 2–4 opciones excluyentes (reemplaza a los ToggleButtonGroup sueltos).
// tone="primary" (azul) o "success" (verde, para modos activos como la edición libre).
export default function SegmentedControl({ value, onChange, options, tone = "primary", sx }) {
  const accent = tone === "success" ? semantic.success.dark : "primary.main";

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      fullWidth
      size="small"
      onChange={(_, val) => val !== null && onChange(val)}
      sx={{
        bgcolor: neutral[100],
        p: "3px",
        gap: "3px",
        borderRadius: radius.md,
        "& .MuiToggleButtonGroup-grouped": { border: "none", borderRadius: `${radius.sm} !important`, margin: 0 },
        "& .MuiToggleButton-root": {
          py: 0.6,
          fontSize: 13,
          fontWeight: 600,
          textTransform: "none",
          color: "text.secondary",
          "&:hover": { bgcolor: neutral[200] },
          "&.Mui-selected": {
            bgcolor: "#fff",
            color: accent,
            boxShadow: shadow.sm,
            "&:hover": { bgcolor: "#fff" },
          },
        },
        ...sx,
      }}
    >
      {options.map((opt) => (
        <ToggleButton key={opt.value} value={opt.value}>
          {opt.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
