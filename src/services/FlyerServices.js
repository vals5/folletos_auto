import { supabase } from "./supabase";

export const flyerService = {
  async getProductos() {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("nombre");
    if (error) throw error;
    return data || [];
  },

  async updateFlyer(flyerId, fields) {
    const { data, error } = await supabase
      .from("flyers")
      .update(fields)
      .eq("id", flyerId);
    if (error) throw error;
    return data;
  },

  async updateModulosPosicion(modulosReordenados) {
    const promises = modulosReordenados.map((modulo, index) =>
      supabase
        .from("modulos")
        .update({ posicion: index })
        .eq("id", modulo.id)
    );
    const results = await Promise.all(promises);
    const error = results.find(r => r.error);
    if (error) throw error.error;
  },

  async uploadFooterImage(flyerId, file) {
    const ext = file.name.split(".").pop();
    const path = `footers/${flyerId}.${ext}`;
    
    const { error: uploadError } = await supabase.storage
      .from("flyer-assets")
      .upload(path, file, { upsert: true });
      
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("flyer-assets").getPublicUrl(path);
    
    await this.updateFlyer(flyerId, { footer_url: data.publicUrl });
    
    return data.publicUrl;
  }
};