import { supabase } from "./supabase";
import { unwrap } from "./helpers";

export const paginaService = {
  async listByFlyer(flyerId) {
    return unwrap(
      await supabase.from("paginas").select("*").eq("flyer_id", flyerId).order("numero", { ascending: true }),
    ) || [];
  },

  async create(flyerId, numero) {
    return unwrap(await supabase.from("paginas").insert([{ flyer_id: flyerId, numero }]).select().single());
  },

  async rename(id, nombre) {
    unwrap(await supabase.from("paginas").update({ nombre }).eq("id", id));
  },

  async remove(id) {
    unwrap(await supabase.from("paginas").delete().eq("id", id));
  },

  // Deja la numeración 1..N sin huecos después de borrar una página.
  async renumber(paginas) {
    const results = await Promise.all(
      paginas.map((p, i) => supabase.from("paginas").update({ numero: i + 1 }).eq("id", p.id)),
    );
    const failed = results.find((r) => r.error);
    if (failed) throw failed.error;
  },
};
