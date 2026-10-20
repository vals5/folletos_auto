import { supabase } from "./supabase";
import { unwrap, BUCKET, fileExt } from "./helpers";

export const flyerService = {
  async list() {
    return unwrap(await supabase.from("flyers").select("*").order("created_at", { ascending: false })) || [];
  },

  async getById(id) {
    return unwrap(await supabase.from("flyers").select("*").eq("id", id).single());
  },

  async getPlantilla(plantillaId) {
    const { data } = await supabase.from("plantillas").select("*").eq("id", plantillaId).single();
    return data || null;
  },

  async create(payload) {
    return unwrap(await supabase.from("flyers").insert([payload]).select().single());
  },

  async update(id, fields) {
    unwrap(await supabase.from("flyers").update(fields).eq("id", id));
  },

  async remove(id) {
    unwrap(await supabase.from("flyers").delete().eq("id", id));
  },

  // Sube el pie de página al storage y devuelve la URL pública.
  // Se agrega ?v=timestamp para que el navegador/CDN no sirva la imagen vieja al reemplazarla.
  async uploadFooter(flyerId, file) {
    const path = `footers/${flyerId}.${fileExt(file)}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const url = `${data.publicUrl}?v=${Date.now()}`;
    await this.update(flyerId, { footer_url: url });
    return url;
  },

  async removeFooter(flyerId) {
    await this.update(flyerId, { footer_url: null });
  },
};
