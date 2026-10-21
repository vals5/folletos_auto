import { createTheme } from "@mui/material/styles";
import { brand, neutral, semantic, rail, radius, shadow, FONT_STACK } from "./tokens";

// IMPORTANTE: no se tocan las variantes de tipografía (body1, body2…) ni el radio base de MUI,
// porque el folleto (canvas) usa <Typography> y valores numéricos de borderRadius con sus
// propios tamaños. Todo lo de la interfaz se ajusta en `components`.
export const theme = createTheme({
  palette: {
    primary: { main: brand.blue, dark: brand.blueDark, light: brand.blueLight, contrastText: "#fff" },
    secondary: { main: brand.graphite, contrastText: "#fff" },
    success: { main: semantic.success.main, dark: semantic.success.dark, light: semantic.success.tint },
    error: { main: semantic.error.main, dark: semantic.error.dark, light: semantic.error.tint },
    warning: { main: semantic.warning.main, dark: semantic.warning.dark, light: semantic.warning.tint },
    info: { main: brand.blue },
    text: { primary: neutral[800], secondary: neutral[500], disabled: neutral[400] },
    divider: neutral[200],
    background: { default: neutral[100], paper: "#fff" },
    // Colores propios (se leen como theme.palette.accent, .neutral, .rail, .workspace)
    accent: { main: brand.yellow },
    neutral,
    rail,
    brandTint: brand.blueTint,
    workspace: neutral[200],
  },
  typography: {
    fontFamily: FONT_STACK,
    button: { textTransform: "none", fontWeight: 600 },
    overline: { fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", lineHeight: 1.4, color: neutral[500] },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: neutral[100] },
        ":focus-visible": { outline: `2px solid ${brand.blue}`, outlineOffset: "2px" },
        "*::-webkit-scrollbar": { width: 10, height: 10 },
        "*::-webkit-scrollbar-thumb": { backgroundColor: neutral[300], borderRadius: 8, border: "2px solid transparent", backgroundClip: "content-box" },
        "*::-webkit-scrollbar-thumb:hover": { backgroundColor: neutral[400], backgroundClip: "content-box" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: radius.md, textTransform: "none", fontWeight: 600 },
        sizeSmall: { fontSize: 13, padding: "4px 12px" },
        sizeMedium: { padding: "7px 18px" },
        sizeLarge: { padding: "11px 24px", fontSize: 15 },
        outlined: { borderColor: neutral[300], color: neutral[700], "&:hover": { borderColor: neutral[400], backgroundColor: neutral[50] } },
        outlinedPrimary: { borderColor: brand.blue, color: brand.blue, "&:hover": { borderColor: brand.blueDark, backgroundColor: brand.blueTint } },
        outlinedError: { borderColor: semantic.error.border, "&:hover": { borderColor: semantic.error.main, backgroundColor: semantic.error.tint } },
        textInherit: { color: neutral[600], "&:hover": { backgroundColor: neutral[100] } },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: radius.md } },
    },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiFormControl: { defaultProps: { size: "small" } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          backgroundColor: "#fff",
          fontSize: 14,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: neutral[300] },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: neutral[400] },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: brand.blue, borderWidth: 1.5 },
        },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { fontSize: 14 } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: radius.lg, boxShadow: shadow.lg, border: `1px solid ${neutral[200]}` } } },
    MuiMenuItem: { styleOverrides: { root: { fontSize: 14, borderRadius: radius.sm, margin: "2px 6px" } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: radius.xl, boxShadow: shadow.lg } } },
    MuiDialogTitle: { styleOverrides: { root: { fontSize: 18, fontWeight: 700, padding: "20px 24px 8px" } } },
    MuiDialogContent: { styleOverrides: { root: { padding: "8px 24px" } } },
    MuiDialogActions: { styleOverrides: { root: { padding: "16px 24px 20px", gap: 8 } } },
    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: { backgroundColor: neutral[800], fontSize: 12, fontWeight: 500, borderRadius: radius.sm, padding: "5px 10px" },
        arrow: { color: neutral[800] },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 }, label: { fontSize: 12 } } },
    MuiCard: {
      styleOverrides: { root: { borderRadius: radius.lg, border: `1px solid ${neutral[200]}`, boxShadow: "none" } },
    },
    MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, fontSize: 13, minHeight: 40 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: neutral[200] },
        head: { backgroundColor: neutral[50], color: neutral[500], fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" },
      },
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: radius.md, fontWeight: 500 } } },
    MuiListItemButton: { styleOverrides: { root: { borderRadius: radius.md } } },
    MuiSkeleton: { styleOverrides: { root: { borderRadius: radius.lg } } },
  },
});
