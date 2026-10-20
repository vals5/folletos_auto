import { create } from "zustand";

export const useNotifyStore = create((set) => ({
  open: false,
  message: "",
  severity: "info",
  show: (message, severity = "info") => set({ open: true, message, severity }),
  close: () => set({ open: false }),
}));

// Uso fuera de componentes: notify.error("No se pudo guardar")
export const notify = {
  error: (m) => useNotifyStore.getState().show(m, "error"),
  success: (m) => useNotifyStore.getState().show(m, "success"),
  info: (m) => useNotifyStore.getState().show(m, "info"),
};

export function errorMessage(err, fallback = "Ocurrió un error inesperado") {
  return err?.message ? `${fallback}: ${err.message}` : fallback;
}
