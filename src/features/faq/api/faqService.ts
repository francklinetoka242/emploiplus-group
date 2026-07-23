import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type FAQ = Database["public"]["Tables"]["faqs"]["Row"];

export const faqService = {
  async list(): Promise<FAQ[]> {
    const { data, error } = await supabase.from("faqs").select("id, question, answer, created_at, updated_at").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as FAQ[];
  },

  async create(payload: { question: string; answer: string }) {
    const { data, error } = await supabase.from("faqs").insert([payload]).select();
    if (error) throw error;
    return (data?.[0] ?? null) as FAQ | null;
  },

  async update(id: string, payload: { question?: string; answer?: string }) {
    const { data, error } = await supabase.from("faqs").update(payload).eq("id", id).select();
    if (error) throw error;
    return (data?.[0] ?? null) as FAQ | null;
  },

  async remove(id: string) {
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

export default faqService;
