// Estilos y constantes visuales del editor (marca IMPRECIONANTE).
import ImprecLogo from "../assets/img/Imprecionante.svg";
import VeaLogo from "../assets/img/Vea.svg";
import TarjetaVea from "../assets/img/Ahorro.svg";

export const DEFAULT_LOGOS = { izq: ImprecLogo, der: VeaLogo };

// TODO: regular_cencosud usa hoy el mismo SVG que vea_ahorro; reemplazar por el logo real de Cencosud.
export const TARJETA_LOGO = { vea_ahorro: TarjetaVea, regular_cencosud: TarjetaVea };

export const IMPREC = {
  colors: { red: "#ff0000", yellow: "#fff800", black: "#000000", white: "#ffffff" },
  vigency: {
    fontFamily: "'Imprec-Vigency',sans-serif",
    fontSize: "10pt",
    textTransform: "uppercase",
    color: "#ff0000",
    lineHeight: 1.15,
  },
  legal: { fontFamily: "'Imprec-Legal',sans-serif", fontSize: "9pt", textTransform: "uppercase", color: "#000000" },
  price: { fontFamily: "'Imprec-Price',sans-serif", textTransform: "uppercase", lineHeight: 1 },
  subtPrice: { fontFamily: "'Imprec-SubtPrice',sans-serif", textTransform: "uppercase", lineHeight: 1 },
  regPrice: { fontFamily: "'Imprec-RegPrice',sans-serif", textTransform: "uppercase", lineHeight: 1 },
  productName: {
    fontFamily: "'Imprec-Name',sans-serif",
    fontSize: "9pt",
    lineHeight: 1.05,
    textTransform: "uppercase",
    color: "#000000",
  },
  productDesc: {
    fontFamily: "'Imprec-Desc',sans-serif",
    fontSize: "7pt",
    lineHeight: 1.05,
    textTransform: "uppercase",
    color: "#555555",
  },
};

export const TAMANOS = ["XS", "S", "M", "L", "XL"];
export const TAMANO_SIZE = {
  XS: { width: 90, height: 100 },
  S: { width: 130, height: 120 },
  M: { width: 185, height: 140 },
  L: { width: 250, height: 160 },
  XL: { width: 350, height: 185 },
};

export const TIPOS_PRECIO = [
  { value: "regular", label: "Precio regular" },
  { value: "llevando3", label: "Llevando 2" },
  { value: "vea_ahorro", label: "Vea Ahorro" },
  { value: "regular_cencosud", label: "Regular Cencosud" },
];

export const FONDO_COLORS = { white: "#ffffff", red: "#ff0000", yellow: "#fff800", empty: "transparent" };

export const BORDER_STYLES = {
  none: "none",
  solid: "2px solid #ff0000",
  dashed: "2px dashed #ff0000",
  thick: "3px solid #ff0000",
};
