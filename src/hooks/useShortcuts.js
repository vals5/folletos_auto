import { useEffect, useRef } from "react";

export function useShortcuts(shortcuts = {}) {
  // 1. Declarar los hooks siempre al inicio sin 'if' previos
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar teclado si el usuario está escribiendo en un input o campo editable
      const target = e.target;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Deshacer (Ctrl+Z)
      if (ctrlOrCmd && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        shortcutsRef.current.UNDO?.();
      }
      // Rehacer (Ctrl+Y o Ctrl+Shift+Z)
      else if ((ctrlOrCmd && e.key.toLowerCase() === "y") || (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === "z")) {
        e.preventDefault();
        shortcutsRef.current.REDO?.();
      }
      // Copiar (Ctrl+C)
      else if (ctrlOrCmd && e.key.toLowerCase() === "c") {
        e.preventDefault();
        shortcutsRef.current.COPY?.();
      }
      // Cortar (Ctrl+X)
      else if (ctrlOrCmd && e.key.toLowerCase() === "x") {
        e.preventDefault();
        shortcutsRef.current.CUT?.();
      }
      // Pegar (Ctrl+V)
      else if (ctrlOrCmd && e.key.toLowerCase() === "v") {
        e.preventDefault();
        shortcutsRef.current.PASTE?.();
      }
      // Duplicar (Ctrl+D)
      else if (ctrlOrCmd && e.key.toLowerCase() === "d") {
        e.preventDefault();
        shortcutsRef.current.DUPLICATE?.();
      }
      // Seleccionar todo (Ctrl+A)
      else if (ctrlOrCmd && e.key.toLowerCase() === "a") {
        e.preventDefault();
        shortcutsRef.current.SELECT_ALL?.();
      }
      // Eliminar (Delete / Supr)
      else if (e.key === "Delete" || e.key === "Backspace") {
        shortcutsRef.current.DELETE?.();
      }
      // Deseleccionar (Escape)
      else if (e.key === "Escape") {
        shortcutsRef.current.DESELECT?.();
      }
      // Zoom
      else if (ctrlOrCmd && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        shortcutsRef.current.ZOOM_IN?.();
      } else if (ctrlOrCmd && e.key === "-") {
        e.preventDefault();
        shortcutsRef.current.ZOOM_OUT?.();
      } else if (ctrlOrCmd && e.key === "0") {
        e.preventDefault();
        shortcutsRef.current.ZOOM_RESET?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
