import React from "react";
import { useI18n } from "@/lib/i18n";
import { usePageSEO, BASE_URL } from "@/lib/seo";
import { Sparkles } from "lucide-react";

export function AdminSEOPage() {
  const { t } = useI18n();

  return (
    <>
      {usePageSEO({
        title: "SEO - Admin",
        description: "Gérez les paramètres SEO depuis l'administration EmploiPlus.",
        canonical: `${BASE_URL}/admin/seo`,
        robots: "noindex,nofollow",
      })}
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10">
              <Sparkles className="h-6 w-6 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-foreground">Paramètres SEO</h1>
              <p className="mt-1 text-sm text-muted-foreground">Gérez les paramètres de référencement du site</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="text-center py-12">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">La gestion SEO avancée sera disponible prochainement.</p>
            <p className="mt-2 text-sm text-muted-foreground">Contactez l'équipe technique pour plus d'informations.</p>
          </div>
        </div>
      </div>
    </>
  );
}
