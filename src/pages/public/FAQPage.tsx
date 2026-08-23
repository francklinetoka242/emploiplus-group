import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LifeBuoy, MessageSquareText, Search } from "lucide-react";
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
  const [query, setQuery] = React.useState("");
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

    const keyword = query.trim().toLowerCase();

    const filtered = normalized.filter((item) => {
      const categoryMatch = activeCategory === "Tous" || item.category === activeCategory;
      const searchMatch =
        !keyword ||
        item.question.toLowerCase().includes(keyword) ||
        item.answer.toLowerCase().includes(keyword);
      return categoryMatch && searchMatch;
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
  }, [activeCategory, faqs, query]);

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
        <div className="mx-auto max-w-4xl">
          <header className="pt-8 pb-10 md:pt-14 md:pb-12">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t("faq.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              {t("faq.subtitle")}
            </p>

            <label className="relative mt-8 block">
              <span className="sr-only">Rechercher dans la FAQ</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Rechercher une réponse…"
                aria-label="Rechercher dans la FAQ"
                className="h-12 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
              />
            </label>

            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-brand/20 bg-brand/[0.06] p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
              <div className="flex items-start gap-3">
                <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Besoin d’un accompagnement ?</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Retrouvez nos ressources et toutes les réponses dans le centre d’aide.
                  </p>
                </div>
              </div>
              <a
                href="https://support.emploiplus-group.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90"
              >
                Ouvrir le centre d’aide
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </header>

          <nav className="border-b border-border pb-2">
            <div className="flex flex-wrap gap-3 md:gap-5">
              {categoryOptions.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`relative pb-2 text-sm font-medium transition ${
                      isActive ? "text-brand" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category}
                    {isActive && <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-secondary" />}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="pt-8 md:pt-10">
            {loading ? (
              <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
                <div className="h-5 w-28 animate-pulse rounded-full bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
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
              groupedFaqs.map(({ category, items }) => (
                <section key={category} className="border-b border-border py-6 last:border-b-0 md:py-8">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-secondary" aria-hidden="true" />
                    <h2 className="font-display text-2xl font-semibold text-foreground">{category}</h2>
                  </div>

                  <Accordion type="single" collapsible className="divide-y divide-border">
                    {items.map((item) => (
                      <AccordionItem key={item.id} value={String(item.id)} className="border-0">
                        <AccordionTrigger className="py-4 pr-3 text-left text-base font-semibold text-foreground hover:text-brand hover:no-underline data-[state=open]:text-brand">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-5 pr-3 text-base leading-7 text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ))
            )}
          </div>

          <section className="mt-12 border-t border-border pt-8 md:pt-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h3 className="font-display text-2xl font-semibold text-foreground">
                  Vous n’avez pas trouvé votre réponse ?
                </h3>
                <p className="mt-2 text-base leading-7 text-muted-foreground">
                  Notre équipe peut vous accompagner dans votre démarche et vous répondre rapidement.
                </p>
              </div>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90"
              >
                Nous contacter
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
