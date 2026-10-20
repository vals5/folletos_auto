import { createContext, useContext } from "react";

// Datos y acciones compartidos por todo el canvas (evita pasar 10 props por 4 niveles).
export const EditorContext = createContext(null);

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor debe usarse dentro de <EditorContext.Provider>");
  return ctx;
}
