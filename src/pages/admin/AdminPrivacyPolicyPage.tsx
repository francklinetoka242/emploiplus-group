import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePageSEO, BASE_URL } from "@/features/seo";
import { supabase } from "@/integrations/supabase/client";
import { Save, ShieldCheck } from "lucide-react";

export function AdminPrivacyPolicyPage() {
  const [content, setContent] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadPolicy = async () => {
      const { data, error } = await supabase
        .from("privacy_policy")
        .select("id, content")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;
      if (error) {
        setMessage("Erreur lors du chargement de la politique de confidentialité.");
      } else if (data?.content) {
        setContent(data.content);
      }
      setLoading(false);
    };

    loadPolicy();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const selectRes = await supabase
        .from("privacy_policy")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (selectRes.error) {
        throw selectRes.error;
      }

      const existingId = selectRes.data?.id;
      const payload = { content };

      const result = existingId
        ? await supabase.from("privacy_policy").update(payload).eq("id", existingId)
        : await supabase.from("privacy_policy").insert([{ content }]);

      if (result.error) {
        throw result.error;
      }

      setMessage("Politique de confidentialité enregistrée avec succès.");
    } catch (saveError) {
      setMessage(
        saveError instanceof Error
          ? saveError.message
          : "Impossible d’enregistrer la politique de confidentialité.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {usePageSEO({
        title: "Politique de Confidentialité - Admin",
        description: "Gestion de la politique de confidentialité d'EmploiPlus Group.",
        canonical: `${BASE_URL}/admin/privacy`,
        robots: "noindex,nofollow",
      })}
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10">
                <ShieldCheck className="h-6 w-6 text-cyan-500" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-foreground">
                  Politique de Confidentialité
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Modifiez et enregistrez le contenu de la politique de confidentialité.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
              Cette page gère le texte stocké dans Supabase pour le site public.
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5 rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="space-y-3">
            <Label htmlFor="privacy-content">Contenu de la politique de confidentialité</Label>
            <Textarea
              id="privacy-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={20}
              placeholder="Saisissez le texte Markdown ou HTML de la politique ici..."
              className="min-h-[480px]"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Le contenu enregistré sera affiché dynamiquement sur la page publique.
            </div>
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>

          {message && <div className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground">{message}</div>}
        </form>
      </div>
    </>
  );
}
