// =====================================================================
// Tokens de diseño: ÚNICA fuente de verdad de colores, radios y medidas
// de la interfaz (no incluye la tipografía ni los tamaños dentro del folleto).
// =====================================================================

// Marca
export const brand = {
  blue: "#025BA9", // color principal (logo)
  blueDark: "#014A8B",
  blueLight: "#368FC7",
  blueTint: "#E6F0F9", // fondos suaves / estados seleccionados
  graphite: "#434343", // gris del logo
  yellow: "#FFF800", // acento (resalta sobre el azul)
};

// Escala de neutros (slate)
export const neutral = {
  50: "#F8FAFC",
  100: "#F1F5F9",
  200: "#E2E8F0",
  300: "#CBD5E1",
  400: "#94A3B8",
  500: "#64748B",
  600: "#475569",
  700: "#334155",
  800: "#1E293B",
  900: "#0F172A",
};

// Colores de estado
export const semantic = {
  success: { main: "#16A34A", dark: "#15803D", tint: "#DCFCE7", border: "#86EFAC" },
  error: { main: "#DC2626", dark: "#B91C1C", tint: "#FEE2E2", border: "#FCA5A5" },
  warning: { main: "#D97706", dark: "#B45309", tint: "#FEF3C7", border: "#FCD34D" },
};

// Barras laterales azules (menú y panel de productos)
export const rail = {
  bg: brand.blue,
  well: "rgba(0, 0, 0, 0.16)", // zona de listas, un poco más oscura
  hover: "rgba(255, 255, 255, 0.10)",
  active: "rgba(255, 255, 255, 0.18)",
  border: "rgba(255, 255, 255, 0.14)",
  text: "#FFFFFF",
  textMuted: "rgba(255, 255, 255, 0.72)",
  textFaint: "rgba(255, 255, 255, 0.5)",
};

// Radios (en px, para que no dependan del multiplicador de MUI)
export const radius = { sm: "6px", md: "8px", lg: "12px", xl: "16px", pill: "999px" };

// Sombras
export const shadow = {
  sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
  md: "0 4px 12px rgba(15, 23, 42, 0.10)",
  lg: "0 12px 32px rgba(15, 23, 42, 0.16)",
};

// Medidas de la estructura
export const layout = {
  navWidth: 240,
  productsRailWidth: 280,
  propertiesWidth: 320,
  toolbarHeight: 56,
};

export const FONT_STACK = '"Outfit Variable", "Outfit", system-ui, -apple-system, "Segoe UI", sans-serif';
