import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { supabase } from "@/integrations/supabase/client";

function getDefaultCguContent(): string {
  return `# Conditions Générales d'Utilisation

## 1. Objet
Les présentes Conditions Générales d'Utilisation régissent l'utilisation de la plateforme EmploiPlus Group par les candidats, recruteurs et administrateurs.

## 2. Acceptation des conditions
L'utilisation de la plateforme vaut acceptation des présentes CGU. Toute inscription ou connexion implique l'acceptation de ces conditions.

## 3. Comptes et sécurité
Les utilisateurs sont responsables de la confidentialité de leurs identifiants et s'engagent à utiliser des mots de passe sécurisés.

## 4. Utilisation responsable
Il est interdit de fournir des informations fausses, de tenter une usurpation d'identité, de diffuser du contenu discriminatoire ou de spammer les canaux de contact.

## 5. Limitation de responsabilité
EmploiPlus Group agit comme une plateforme de mise en relation. Elle n'est pas responsable des offres, des contenus externes ou des conséquences liées aux redirections vers des services tiers.

## 6. Propriété intellectuelle
Les contenus présents sur la plateforme sont protégés par les droits de propriété intellectuelle et ne peuvent être copiés ou réutilisés sans autorisation.

## 7. Données personnelles
EmploiPlus Group traite les données personnelles conformément aux principes de sécurité et de confidentialité applicables au service.

## 8. Modifications
Les présentes CGU peuvent être mises à jour à tout moment. La version en vigueur est celle publiée sur cette page.`;
}

export function CguPage() {
  const navigate = useNavigate();
  const [content, setContent] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadCgu = async () => {
      const { data, error: fetchError } = await supabase
        .from("cgu")
        .select("content")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (fetchError) {
        setError("Impossible de charger les Conditions Générales d'Utilisation.");
        setContent(getDefaultCguContent());
      } else if (!data?.content) {
        setContent(getDefaultCguContent());
      } else {
        setContent(data.content);
      }

      setLoading(false);
    };

    void loadCgu();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <SEO
        title="Conditions Générales d'Utilisation"
        description="Consultez la version active des Conditions Générales d'Utilisation d'EmploiPlus Group."
        keywords="CGU, conditions générales, EmploiPlus Group, plateforme de recrutement"
        canonical={`${BASE_URL}/cgu`}
        robots="index,follow"
      />
      <section className="container-page pb-20 md:pb-28">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => (history.length > 1 ? navigate(-1) : navigate("/"))}
            aria-label="Retour"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-2 text-sm hover:bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </button>
        </div>
        <div className="space-y-8">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Conditions Générales d'Utilisation
              </p>
              <h1 className="text-3xl font-semibold text-foreground">Conditions Générales d'Utilisation</h1>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-6 w-1/3 rounded-lg bg-slate-200"></div>
                <div className="h-4 w-full rounded-lg bg-slate-200"></div>
                <div className="h-4 w-full rounded-lg bg-slate-200"></div>
                <div className="h-4 w-5/6 rounded-lg bg-slate-200"></div>
              </div>
            ) : (
              <article className="prose prose-invert max-w-none prose-a:text-brand prose-a:no-underline prose-img:rounded-3xl">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  children={content}
                />
              </article>
            )}
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </div>
        </div>
      </section>
    </>
  );
}
