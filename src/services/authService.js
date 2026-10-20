import { supabase } from "./supabase";

export const authService = {
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  async signOut() {
    await supabase.auth.signOut();
  },
  onChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
  },
};
