import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePageSEO, BASE_URL } from "@/features/seo";
import { supabase } from "@/integrations/supabase/client";
import { Save, FileText } from "lucide-react";

function getDefaultCguContent(): string {
  return `# Conditions Générales d'Utilisation

## 1. Objet
Les présentes CGU encadrent l'utilisation de la plateforme EmploiPlus Group.

## 2. Acceptation
L'inscription ou la connexion vaut acceptation des CGU.

## 3. Responsabilités
Les utilisateurs s'engagent à fournir des informations exactes et à protéger leurs identifiants.

## 4. Limitation de responsabilité
EmploiPlus Group agit comme intermédiaire et n'est pas responsable des offres ni des redirections vers des services tiers.
`;
}

export function AdminCguPage() {
  const [content, setContent] = React.useState<string>(getDefaultCguContent());
  const [version, setVersion] = React.useState("1.0");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadCgu = async () => {
      const { data, error } = await supabase
        .from("cgu")
        .select("content, version")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setMessage("Erreur lors du chargement des CGU.");
      } else if (data?.content) {
        setContent(data.content);
        if (data.version) {
          setVersion(data.version);
        }
      }

      setLoading(false);
    };

    void loadCgu();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: activeRows, error: activeRowsError } = await supabase
        .from("cgu")
        .select("id")
        .eq("is_active", true);

      if (activeRowsError) {
        throw activeRowsError;
      }

      const insertPayload = {
        content,
        version,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      const { data: insertedRow, error: insertError } = await supabase
        .from("cgu")
        .insert([insertPayload])
        .select("id")
        .single();

      if (insertError) {
        throw insertError;
      }

      if (activeRows?.length) {
        const idsToDeactivate = activeRows
          .map((row) => row.id)
          .filter((id) => insertedRow?.id && id !== insertedRow.id);

        if (idsToDeactivate.length) {
          const { error: deactivateError } = await supabase
            .from("cgu")
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .in("id", idsToDeactivate);

          if (deactivateError) {
            throw deactivateError;
          }
        }
      }

      setMessage("CGU enregistrées et publiées avec succès.");
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : "Impossible d’enregistrer les CGU.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {usePageSEO({
        title: "CGU - Administration",
        description: "Gestion dynamique des Conditions Générales d'Utilisation d'EmploiPlus Group.",
        canonical: `${BASE_URL}/admin/cgu`,
        robots: "noindex,nofollow",
      })}

      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-slate-500">
                  Administration
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                  CGU
                </h1>
                <p className="mt-0.5 text-xs text-slate-500">
                  Rédigez et publiez la version actuelle des Conditions Générales d'Utilisation.
                </p>
              </div>
            </div>

            <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-600">
              Publiées sur /cgu
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5"
        >
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
            <h2 className="text-sm font-semibold text-slate-800">Version et contenu</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)]">
            <div className="space-y-2">
              <Label htmlFor="cgu-version" className="text-sm font-medium text-slate-700">
                Version
              </Label>
              <Input
                id="cgu-version"
                value={version}
                onChange={(event) => setVersion(event.target.value)}
                placeholder="1.0"
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cgu-content" className="text-sm font-medium text-slate-700">
                Contenu des CGU
              </Label>
              <Textarea
                id="cgu-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={18}
                placeholder="Saisissez le contenu Markdown ou HTML des CGU ici..."
                className="min-h-[360px] resize-y rounded-xl border-slate-200 bg-white focus-visible:ring-slate-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              {loading
                ? "Chargement de la version actuelle..."
                : "Enregistrer créera une nouvelle version publiée comme active."}
            </div>
            <Button
              type="submit"
              disabled={saving || loading}
              className="gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              {saving ? "Publication..." : "Enregistrer et publier"}
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
