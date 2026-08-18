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
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-slate-500">
                  Administration
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                  Politique de Confidentialité
                </h1>
                <p className="mt-0.5 text-xs text-slate-500">
                  Modifiez et enregistrez le contenu de la politique de confidentialité.
                </p>
              </div>
            </div>

            <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-600">
              Texte public lié à Supabase
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5"
        >
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
            <h2 className="text-sm font-semibold text-slate-800">
              Contenu de la politique de confidentialité
            </h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="privacy-content" className="text-sm font-medium text-slate-700">
              Texte public
            </Label>
            <Textarea
              id="privacy-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={18}
              placeholder="Saisissez le texte Markdown ou HTML de la politique ici..."
              className="min-h-[360px] resize-y rounded-xl border-slate-200 bg-white focus-visible:ring-slate-200"
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              Le contenu enregistré sera affiché dynamiquement sur la page publique.
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
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
