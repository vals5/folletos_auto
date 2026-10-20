// Plantillas de marca disponibles al crear un folleto.
export const TEMPLATES = [
  {
    id: "imprec",
    name: "IMPRECIONANTE",
    bgColor: "#fff800",
    headerColor: "#fff800",
    priceColor: "#ff0000",
    fontFamily: "Zuume",
  },
];

// Tamaños de folleto. width/height son los píxeles de salida (A4 = puntos).
// cols/rows definen la grilla de módulos de ese tamaño.
export const SIZE_PRESETS = [
  { label: "A4 Vertical",    width: 595,  height: 841,  cols: 3, rows: 4 },
  { label: "Cuadrado 1080",  width: 1080, height: 1080, cols: 3, rows: 3 },
  { label: "Historia 1080",  width: 1080, height: 1920, cols: 2, rows: 5 },
  { label: "HD 1920",        width: 1920, height: 1080, cols: 4, rows: 2 },
  { label: "WSP 1080×1440",  width: 1080, height: 1440, cols: 3, rows: 4 },
  { label: "Slider 450×600", width: 450,  height: 600,  cols: 2, rows: 3 },
  { label: "HTML 600×313",   width: 600,  height: 313,  cols: 3, rows: 1 },
];

export const DEFAULT_GRID = { cols: 3, rows: 4 };

// Devuelve la grilla (cols × rows) que corresponde al tamaño del folleto.
export function getGrid(flyer) {
  const preset = SIZE_PRESETS.find((s) => s.width === flyer?.width && s.height === flyer?.height);
  return preset ? { cols: preset.cols, rows: preset.rows } : DEFAULT_GRID;
}
