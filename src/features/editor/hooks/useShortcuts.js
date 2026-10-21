import { useEffect, useRef } from "react";

const IS_MAC =
  typeof navigator !== "undefined" &&
  (/Mac|iPod|iPhone|iPad/.test(navigator.userAgent) || navigator.platform?.toUpperCase().includes("MAC"));

// Elementos donde las teclas tienen su propio significado (escribir, sliders, menús, diálogos).
const SELECTOR_IGNORADO =
  "input, textarea, select, [contenteditable='true'], [role='dialog'], [role='slider'], [role='combobox'], [role='listbox'], [role='menu']";

function getAction(e) {
  const key = (e.key || "").toLowerCase();
  if (e.key === "Delete" || e.key === "Backspace") return "DELETE";
  if (e.key === "Escape") return "DESELECT";

  const cmdOrCtrl = IS_MAC ? e.metaKey : e.ctrlKey;

  // Como en Figma: Shift+0 = zoom 100%, Shift+1 = ajustar a la pantalla.
  if (e.shiftKey && !cmdOrCtrl && !e.altKey) {
    if (e.code === "Digit0") return "ZOOM_RESET";
    if (e.code === "Digit1") return "ZOOM_TO_FIT";
  }

  if (!cmdOrCtrl) return null;

  switch (key) {
    case "z": return e.shiftKey ? "REDO" : "UNDO";
    case "y": return "REDO";
    case "c": return "COPY";
    case "x": return "CUT";
    case "v": return "PASTE";
    case "d": return "DUPLICATE";
    case "a": return "SELECT_ALL";
    case "+":
    case "=": return "ZOOM_IN";
    case "-": return "ZOOM_OUT";
    case "0": return "ZOOM_RESET";
    case "1":
    case "9": return "ZOOM_TO_FIT";
    default: return null;
  }
}

// `shortcuts` es { ACCION: función }. Solo se intercepta la tecla si esa acción tiene función:
// así Ctrl+C, Ctrl+Z, etc. siguen funcionando normal cuando todavía no están implementadas.
export function useShortcuts(shortcuts = {}) {
  const ref = useRef(shortcuts);
  useEffect(() => {
    ref.current = shortcuts;
  });

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target?.closest?.(SELECTOR_IGNORADO)) return;
      const action = getAction(e);
      const handler = action && ref.current[action];
      if (!handler) return;
      e.preventDefault();
      handler();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
