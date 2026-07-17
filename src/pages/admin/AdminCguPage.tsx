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

      <div className="space-y-6">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-violet-500/10">
                <FileText className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-foreground">CGU</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rédigez et publiez la version actuelle des Conditions Générales d'Utilisation.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
              Le contenu est stocké dans Supabase et publié sur la page publique /cgu.
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5 rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-3">
              <Label htmlFor="cgu-version">Version</Label>
              <Input
                id="cgu-version"
                value={version}
                onChange={(event) => setVersion(event.target.value)}
                placeholder="1.0"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="cgu-content">Contenu des CGU</Label>
              <Textarea
                id="cgu-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={24}
                placeholder="Saisissez le contenu Markdown ou HTML des CGU ici..."
                className="min-h-[520px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {loading ? "Chargement de la version actuelle..." : "Enregistrer créera une nouvelle version publiée comme active."}
            </div>
            <Button type="submit" disabled={saving || loading} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Publication..." : "Enregistrer et publier"}
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
