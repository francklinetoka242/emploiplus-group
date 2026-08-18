import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePageSEO, BASE_URL } from "@/features/seo";
import { supabase } from "@/integrations/supabase/client";
import { Save, ScrollText } from "lucide-react";

const LEGAL_DOCUMENTS_KEY = "mentions_legales";

function getDefaultLegalContent(): string {
  return `# Mentions Légales

## Éditeur du site
EmploiPlus Group

- Directeur de la publication : ETOKA IBEAHO Francklin Sylver
- Localisation : Pointe Noire, République du Congo

## Hébergement
- Front-end : Vercel (déploiement via GitHub)
- Backend et authentification : Supabase

## Informations complémentaires
Ce site est exploité dans le cadre de la plateforme de recrutement et des services RH d'EmploiPlus Group.`;
}

export function AdminLegalDocumentsPage() {
  const [content, setContent] = React.useState<string>(getDefaultLegalContent());
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadDocument = async () => {
      const { data, error } = await supabase
        .from("legal_documents")
        .select("content")
        .eq("key", LEGAL_DOCUMENTS_KEY)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setMessage("Erreur lors du chargement des mentions légales.");
      } else if (data?.content) {
        setContent(data.content);
      }

      setLoading(false);
    };

    void loadDocument();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.from("legal_documents").upsert(
        {
          key: LEGAL_DOCUMENTS_KEY,
          content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );

      if (error) {
        throw error;
      }

      setMessage("Mentions légales enregistrées avec succès.");
    } catch (saveError) {
      setMessage(
        saveError instanceof Error
          ? saveError.message
          : "Impossible d’enregistrer les mentions légales.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {usePageSEO({
        title: "Mentions Légales - Admin",
        description: "Gestion des mentions légales d'EmploiPlus Group.",
        canonical: `${BASE_URL}/admin/legal-documents`,
        robots: "noindex,nofollow",
      })}
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <ScrollText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-slate-500">
                  Administration
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                  Mentions Légales
                </h1>
                <p className="mt-0.5 text-xs text-slate-500">
                  Rédigez et enregistrez le contenu affiché sur la page publique.
                </p>
              </div>
            </div>

            <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-600">
              Stocké dans Supabase
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5"
        >
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
            <h2 className="text-sm font-semibold text-slate-800">Contenu des mentions légales</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal-content" className="text-sm font-medium text-slate-700">
              Texte public
            </Label>
            <Textarea
              id="legal-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={18}
              placeholder="Saisissez le contenu Markdown ou HTML ici..."
              className="min-h-[360px] resize-y rounded-xl border-slate-200 bg-white focus-visible:ring-slate-200"
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              {loading ? "Chargement du contenu enregistré..." : "Le contenu sera affiché dynamiquement sur la page publique."}
            </div>
            <Button
              type="submit"
              disabled={saving || loading}
              className="gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>

          {message && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {message}
            </div>
          )}
        </form>
      </div>
    </>
  );
}
