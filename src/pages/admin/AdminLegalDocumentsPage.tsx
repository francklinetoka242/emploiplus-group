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
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-500/10">
                <ScrollText className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-foreground">Mentions Légales</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rédigez et enregistrez le contenu affiché sur la page publique.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
              Le contenu est stocké dans Supabase avec une clé unique pour la page publique.
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5 rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="space-y-3">
            <Label htmlFor="legal-content">Contenu des mentions légales</Label>
            <Textarea
              id="legal-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={20}
              placeholder="Saisissez le contenu Markdown ou HTML ici..."
              className="min-h-[480px]"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {loading ? "Chargement du contenu enregistré..." : "Le contenu sera affiché dynamiquement sur la page publique."}
            </div>
            <Button type="submit" disabled={saving || loading} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>

          {message && (
            <div className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground">
              {message}
            </div>
          )}
        </form>
      </div>
    </>
  );
}
