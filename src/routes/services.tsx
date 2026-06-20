import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Briefcase, Building2, Globe2, Rocket, Sparkles, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — EmploiPlus Group" },
      { name: "description", content: "Solutions tech, diffusion d'offres d'emploi et contenu média par EmploiPlus Group." },
      { property: "og:title", content: "Services — EmploiPlus Group" },
      { property: "og:description", content: "Solutions tech, diffusion d'offres d'emploi et contenu média." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const fallback = [
  { icon: Briefcase, title: "Diffusion d'offres d'emploi", description: "Publiez vos offres et atteignez les meilleurs candidats grâce à notre audience qualifiée." },
  { icon: Rocket, title: "Développement web & applications", description: "Sites, plateformes SaaS, applications métier — conçus pour performer." },
  { icon: Sparkles, title: "Contenu média & blog", description: "Rédaction d'articles, stratégie éditoriale et publication régulière." },
  { icon: Building2, title: "Branding employeur", description: "Mettez en valeur votre marque pour attirer et fidéliser les talents." },
  { icon: Globe2, title: "Stratégie digitale & SEO", description: "Plan d'action complet pour développer votre présence en ligne." },
  { icon: Zap, title: "Conseil & accompagnement", description: "Audit, conseil et formation pour réussir votre transformation digitale." },
];

function ServicesPage() {
  const { t } = useI18n();
  const { data } = useQuery({
    queryKey: ["services-page"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });
  const items = data && data.length > 0 ? data : fallback;
  return (
    <div className="container-page py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold">{t("services.title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("services.subtitle")}</p>
      </div>
      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((s: any, i: number) => {
          const Icon = (s as any).icon ?? fallback[i % fallback.length].icon;
          return (
            <motion.article
              key={s.id ?? s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
              className="rounded-2xl bg-card border border-border p-7 hover:shadow-elev hover:-translate-y-1 transition-all"
            >
              {s.image ? (
                <div className="aspect-[16/9] rounded-lg overflow-hidden mb-5 bg-muted">
                  <img src={s.image} alt={s.title} className="size-full object-cover" loading="lazy" />
                </div>
              ) : (
                <div className="size-12 rounded-xl gradient-brand grid place-items-center text-brand-foreground shadow-brand mb-5">
                  <Icon className="size-5" />
                </div>
              )}
              {s.category && <div className="text-[11px] uppercase tracking-wider font-semibold text-brand mb-1">{s.category}</div>}
              <h3 className="font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
