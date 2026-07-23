import type { Database } from "@/integrations/supabase/types";

export type FAQ = Database["public"]["Tables"]["faqs"]["Row"];
export type FAQCategory = {
  id: string;
  name: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const body = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;
  if (!response.ok) {
    throw new Error(body?.error || `Request failed with status ${response.status}`);
  }

  return (body?.data as T) ?? (null as T);
}

const DEFAULT_FAQ_CATEGORIES: FAQCategory[] = [
  { id: "default-compte", name: "Compte", sort_order: 1 },
  { id: "default-services", name: "Services", sort_order: 2 },
  { id: "default-autres", name: "Autres", sort_order: 3 },
];

export const faqService = {
  async list(): Promise<FAQ[]> {
    const data = await request<FAQ[]>("/api/faqs");
    return data ?? [];
  },

  async listCategories(): Promise<FAQCategory[]> {
    try {
      const data = await request<FAQCategory[]>("/api/faq-categories");
      return data?.length ? data : DEFAULT_FAQ_CATEGORIES;
    } catch {
      return DEFAULT_FAQ_CATEGORIES;
    }
  },

  async createCategory(name: string, sortOrder = 1): Promise<FAQCategory | null> {
    try {
      const data = await request<FAQCategory>("/api/faq-categories", {
        method: "POST",
        body: JSON.stringify({ name, sort_order: sortOrder }),
      });
      return data ?? null;
    } catch {
      return {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        sort_order: sortOrder,
      };
    }
  },

  async removeCategory(id: string) {
    try {
      await request<null>(`/api/faq-categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      return true;
    } catch {
      return true;
    }
  },

  async create(payload: {
    question: string;
    answer: string;
    category?: string;
    sort_order?: number;
  }) {
    const data = await request<FAQ>("/api/faqs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data ?? null;
  },

  async update(
    id: string,
    payload: {
      question?: string;
      answer?: string;
      category?: string;
      sort_order?: number;
    },
  ) {
    const data = await request<FAQ>(`/api/faqs?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return data ?? null;
  },

  async remove(id: string) {
    await request<null>(`/api/faqs?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return true;
  },
};

export default faqService;
