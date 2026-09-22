import { useEffect, useRef } from "react";

export function useShortcuts(shortcuts = {}) {
  const shortcutsRef = useRef(shortcuts);

  // Actualización sincrónica para capturar siempre el último estado/función
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;

      // Si el usuario está escribiendo en un input, textarea o elemento editable, no interceptamos
      const isWriting =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest?.("[contenteditable='true']"));

      if (isWriting) return;

      // Detección multiplataforma (Mac: Command ⌘ / Windows: Ctrl)
      const isMac =
        typeof navigator !== "undefined" &&
        (/Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ||
          (navigator.platform && navigator.platform.toUpperCase().includes("MAC")));

      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key ? e.key.toLowerCase() : "";

      // --- ATAJOS ---

      // 1. ELIMINAR (Tecla Delete / Supr / Backspace)
      if (e.key === "Delete" || e.key === "Backspace") {
        if (shortcutsRef.current.DELETE) {
          e.preventDefault();
          shortcutsRef.current.DELETE();
        }
      }
      // 2. DESHACER (Ctrl+Z / Cmd+Z)
      else if (cmdOrCtrl && key === "z" && !e.shiftKey) {
        if (shortcutsRef.current.UNDO) {
          e.preventDefault();
          shortcutsRef.current.UNDO();
        }
      }
      // 3. REHACER (Ctrl+Y / Cmd+Y / Ctrl+Shift+Z / Cmd+Shift+Z)
      else if ((cmdOrCtrl && key === "y") || (cmdOrCtrl && e.shiftKey && key === "z")) {
        if (shortcutsRef.current.REDO) {
          e.preventDefault();
          shortcutsRef.current.REDO();
        }
      }
      // 4. COPIAR (Ctrl+C / Cmd+C)
      else if (cmdOrCtrl && key === "c") {
        if (shortcutsRef.current.COPY) {
          e.preventDefault();
          shortcutsRef.current.COPY();
        }
      }
      // 5. CORTAR (Ctrl+X / Cmd+X)
      else if (cmdOrCtrl && key === "x") {
        if (shortcutsRef.current.CUT) {
          e.preventDefault();
          shortcutsRef.current.CUT();
        }
      }
      // 6. PEGAR (Ctrl+V / Cmd+V)
      else if (cmdOrCtrl && key === "v") {
        if (shortcutsRef.current.PASTE) {
          e.preventDefault();
          shortcutsRef.current.PASTE();
        }
      }
      // 7. DUPLICAR (Ctrl+D / Cmd+D)
      else if (cmdOrCtrl && key === "d") {
        if (shortcutsRef.current.DUPLICATE) {
          e.preventDefault();
          shortcutsRef.current.DUPLICATE();
        }
      }
      // 8. SELECCIONAR TODO (Ctrl+A / Cmd+A)
      else if (cmdOrCtrl && key === "a") {
        if (shortcutsRef.current.SELECT_ALL) {
          e.preventDefault();
          shortcutsRef.current.SELECT_ALL();
        }
      }
      // 9. ESCAPE (Deseleccionar)
      else if (e.key === "Escape") {
        if (shortcutsRef.current.DESELECT) {
          e.preventDefault();
          shortcutsRef.current.DESELECT();
        }
      }
      // 10. ZOOM (+ / - / 0 / 1 o 9)
      else if (cmdOrCtrl && (key === "+" || key === "=")) {
        if (shortcutsRef.current.ZOOM_IN) {
          e.preventDefault();
          shortcutsRef.current.ZOOM_IN();
        }
      } else if (cmdOrCtrl && key === "-") {
        if (shortcutsRef.current.ZOOM_OUT) {
          e.preventDefault();
          shortcutsRef.current.ZOOM_OUT();
        }
      } else if (cmdOrCtrl && key === "0") {
        if (shortcutsRef.current.ZOOM_RESET) {
          e.preventDefault();
          shortcutsRef.current.ZOOM_RESET();
        }
      } else if (cmdOrCtrl && (key === "1" || key === "9")) {
        if (shortcutsRef.current.ZOOM_TO_FIT) {
          e.preventDefault();
          shortcutsRef.current.ZOOM_TO_FIT();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
