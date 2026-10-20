import { supabase } from "./supabase";
import { unwrap } from "./helpers";

export const productoService = {
  async list() {
    return unwrap(await supabase.from("productos").select("*").order("nombre")) || [];
  },
  async create(form) {
    return unwrap(await supabase.from("productos").insert(form).select().single());
  },
  async update(id, form) {
    return unwrap(await supabase.from("productos").update(form).eq("id", id).select().single());
  },
  async remove(id) {
    unwrap(await supabase.from("productos").delete().eq("id", id));
  },
};
