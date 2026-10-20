// Lanza el error de Supabase (si lo hay) y devuelve los datos.
export function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export const BUCKET = "flyer-assets";

export function fileExt(file) {
  return (file.name.split(".").pop() || "png").toLowerCase();
}
