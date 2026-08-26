import React from "react";
import { MessageSquareText } from "lucide-react";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BASE_URL } from "@/features/seo";
import { faqService, type FAQ, type FAQCategory } from "@/features/faq/api/faqService";

export default function FAQPage() {
  const { t } = useI18n();
  const [faqs, setFaqs] = React.useState<FAQ[]>([]);
  const [categories, setCategories] = React.useState<FAQCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeCategory, setActiveCategory] = React.useState<string>("Tous");

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [faqData, categoryData] = await Promise.all([faqService.list(), faqService.listCategories()]);
        if (!mounted) return;

        setFaqs(faqData ?? []);
        setCategories(categoryData ?? []);
      } catch {
        if (mounted) {
          setFaqs([]);
          setCategories([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryOptions = React.useMemo(() => {
    const base = categories.length > 0 ? categories.map((c) => c.name) : ["Compte", "Services", "Autres"];
    return ["Tous", ...new Set(base.filter(Boolean))];
  }, [categories]);

  const groupedFaqs = React.useMemo(() => {
    const normalized = faqs.map((item) => ({
      ...item,
      category: item.category || "Autres",
    }));

    const filtered = normalized.filter((item) => {
      const categoryMatch = activeCategory === "Tous" || item.category === activeCategory;
      return categoryMatch;
    });

    const groups = new Map<string, FAQ[]>();
    for (const item of filtered) {
      const key = item.category || "Autres";
      const existing = groups.get(key) ?? [];
      existing.push(item);
      groups.set(key, existing);
    }

    return Array.from(groups.entries()).map(([category, items]) => ({
      category,
      items: items.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0)),
    }));
  }, [activeCategory, faqs]);

  return (
    <>
      <SEO
        title={t("faq.title")}
        description={t("faq.subtitle")}
        canonical={`${BASE_URL}/faq`}
        robots="index,follow"
        breadcrumbs={[
          { name: t("home.hero.title"), url: `${BASE_URL}/` },
          { name: t("faq.title"), url: `${BASE_URL}/faq` },
        ]}
      />

      <section className="container-page pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl">
          <header className="grid gap-8 pb-12 pt-8 md:grid-cols-[1.1fr_0.9fr] md:items-end md:pt-14 md:pb-16">
            <div>
              <span className="inline-flex rounded-full border border-brand/30 bg-brand/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand">
                FAQ
              </span>
              <h1 className="mt-5 max-w-2xl font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                {t("faq.title")}
              </h1>
            </div>
            <p className="max-w-md text-base leading-7 text-muted-foreground md:text-sm md:leading-6">
              {t("faq.subtitle")}
            </p>
          </header>

          <div className="grid gap-10 md:grid-cols-[180px_minmax(0,1fr)] md:gap-14">
            <nav aria-label="Catégories de FAQ" className="md:pt-1">
              <div className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:gap-1 md:overflow-visible">
                {categoryOptions.map((category) => {
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`relative shrink-0 rounded-full px-3 py-2 text-left text-xs font-medium transition md:w-full md:rounded-full ${
                        isActive
                          ? "bg-brand/10 text-brand ring-1 ring-brand/25"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="min-w-0">
            {loading ? (
              <div className="space-y-4">
                <div className="h-6 w-32 animate-pulse rounded-full bg-muted" />
                <div className="h-20 w-full animate-pulse rounded-xl bg-muted" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
              </div>
            ) : groupedFaqs.length === 0 ? (
              <div className="border-t border-border py-8 text-center">
                <MessageSquareText className="mx-auto h-10 w-10 text-brand" />
                <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">
                  Aucune réponse ne correspond à votre recherche.
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Essayez un autre mot-clé ou contactez notre équipe pour une réponse personnalisée.
                </p>
              </div>
            ) : (
              <Accordion type="single" collapsible defaultValue={String(groupedFaqs[0]?.items[0]?.id)} className="divide-y divide-border">
                {groupedFaqs.flatMap(({ items }) => items).map((item) => (
                  <AccordionItem key={item.id} value={String(item.id)} className="border-0">
                    <AccordionTrigger className="rounded-xl py-5 pr-3 text-left text-sm font-medium text-foreground hover:text-brand hover:no-underline data-[state=open]:text-brand md:text-base">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="rounded-xl bg-muted/45 px-4 pb-5 pt-4 text-sm leading-6 text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
