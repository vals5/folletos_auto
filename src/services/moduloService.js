import { supabase } from "./supabase";
import { unwrap, BUCKET, fileExt } from "./helpers";

const WITH_PRODUCTO = "*, productos(*)";

export const moduloService = {
  async listByFlyer(flyerId) {
    return unwrap(
      await supabase.from("modulos").select(WITH_PRODUCTO).eq("flyer_id", flyerId).order("posicion", { ascending: true }),
    ) || [];
  },

  async create(modulo) {
    return unwrap(await supabase.from("modulos").insert([modulo]).select(WITH_PRODUCTO).single());
  },

  async update(id, fields) {
    return unwrap(await supabase.from("modulos").update(fields).eq("id", id).select(WITH_PRODUCTO).single());
  },

  async remove(id) {
    unwrap(await supabase.from("modulos").delete().eq("id", id));
  },

  // Guarda en paralelo la posición de cada módulo recibido.
  async updatePosiciones(modulos) {
    const results = await Promise.all(
      modulos.map((m) => supabase.from("modulos").update({ posicion: m.posicion }).eq("id", m.id)),
    );
    const failed = results.find((r) => r.error);
    if (failed) throw failed.error;
  },

  // Sube una imagen propia del módulo al storage (en vez de guardarla en base64 en la fila).
  async uploadImagen(flyerId, moduloId, file) {
    const path = `modulos/${flyerId}/${moduloId}-${Date.now()}.${fileExt(file)}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  },
};
