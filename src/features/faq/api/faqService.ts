import type { Database } from "@/integrations/supabase/types";

export type FAQ = Database["public"]["Tables"]["faqs"]["Row"];
export type FAQCategory = {
  id: string;
  name: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

const DEFAULT_FAQ_CATEGORIES: FAQCategory[] = [
  { id: "default-compte", name: "Compte", sort_order: 1 },
  { id: "default-services", name: "Services", sort_order: 2 },
  { id: "default-autres", name: "Autres", sort_order: 3 },
];

const DEFAULT_FAQS: FAQ[] = [
  {
    id: "faq-compte-1",
    question: "Comment créer un compte candidat ?",
    answer:
      "Cliquez sur le bouton S'inscrire, renseignez votre email, votre mot de passe et vos informations principales. Une confirmation par email est ensuite envoyée pour valider votre compte.",
    category: "Compte",
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "faq-services-1",
    question: "Quels services propose EmploiPlus Group ?",
    answer:
      "Nous accompagnons les candidats dans leur recherche d'emploi, la mise en relation avec les entreprises, ainsi que les entreprises dans leurs besoins de recrutement et de conseil RH.",
    category: "Services",
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "faq-autres-1",
    question: "Comment contacter le support ?",
    answer:
      "Vous pouvez utiliser le formulaire de contact présent sur le site ou nous envoyer un message depuis la page de contact dédiée à l'équipe EmploiPlus Group.",
    category: "Autres",
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let localFaqCategories: FAQCategory[] = [...DEFAULT_FAQ_CATEGORIES];
let localFaqs: FAQ[] = [...DEFAULT_FAQS];

const cloneFaqs = (): FAQ[] => localFaqs.map((item) => ({ ...item }));
const cloneCategories = (): FAQCategory[] => localFaqCategories.map((item) => ({ ...item }));

export const faqService = {
  async list(): Promise<FAQ[]> {
    return cloneFaqs();
  },

  async listCategories(): Promise<FAQCategory[]> {
    return cloneCategories();
  },

  async createCategory(name: string, sortOrder = 1): Promise<FAQCategory | null> {
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    const newCategory: FAQCategory = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmedName,
      sort_order: sortOrder,
    };

    localFaqCategories = [...localFaqCategories, newCategory].sort((a, b) => a.sort_order - b.sort_order);
    return { ...newCategory };
  },

  async removeCategory(id: string) {
    localFaqCategories = localFaqCategories.filter((category) => category.id !== id);
    localFaqs = localFaqs.map((faq) => {
      if (faq.category === undefined) return faq;
      const matchingCategory = localFaqCategories.find((category) => category.name === faq.category);
      return matchingCategory ? faq : { ...faq, category: "Autres" };
    });
    return true;
  },

  async create(payload: {
    question: string;
    answer: string;
    category?: string;
    sort_order?: number;
  }) {
    const nextFaq: FAQ = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      question: payload.question.trim(),
      answer: payload.answer.trim(),
      category: (payload.category || "Autres") as FAQ["category"],
      sort_order: payload.sort_order ?? 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localFaqs = [...localFaqs, nextFaq];
    return nextFaq;
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
    const index = localFaqs.findIndex((faq) => faq.id === id);
    if (index === -1) return null;

    const updated = {
      ...localFaqs[index],
      ...(payload.question !== undefined ? { question: payload.question.trim() } : {}),
      ...(payload.answer !== undefined ? { answer: payload.answer.trim() } : {}),
      ...(payload.category !== undefined ? { category: payload.category as FAQ["category"] } : {}),
      ...(payload.sort_order !== undefined ? { sort_order: payload.sort_order } : {}),
      updated_at: new Date().toISOString(),
    };

    localFaqs = localFaqs.map((faq) => (faq.id === id ? updated : faq));
    return updated;
  },

  async remove(id: string) {
    localFaqs = localFaqs.filter((faq) => faq.id !== id);
    return true;
  },
};

export default faqService;
