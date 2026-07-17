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
`;
}

export function LegalDocumentsPage() {
  const [content, setContent] = React.useState<string>("");
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadDocument = async () => {
      const { data, error: fetchError } = await supabase
        .from("legal_documents")
        .select("content")
        .eq("key", LEGAL_DOCUMENTS_KEY)
        .maybeSingle();

      if (!mounted) return;

      if (fetchError) {
        setError("Impossible de charger les mentions légales.");
        setContent(getDefaultLegalContent());
      } else if (!data?.content) {
        setContent(getDefaultLegalContent());
      } else {
        setContent(data.content);
      }

      setLoading(false);
    };

    void loadDocument();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <SEO
        title="Mentions Légales"
        description="Mentions Légales d'EmploiPlus Group, hébergé sur Vercel et alimenté par Supabase."
        keywords="mentions légales, EmploiPlus Group, Supabase, Vercel"
        canonical={`${BASE_URL}/mentions-legales`}
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
                Informations légales
              </p>
              <h1 className="text-3xl font-semibold text-foreground">Mentions Légales</h1>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-6 w-1/3 rounded-lg bg-slate-200" />
                <div className="h-4 w-full rounded-lg bg-slate-200" />
                <div className="h-4 w-full rounded-lg bg-slate-200" />
                <div className="h-4 w-5/6 rounded-lg bg-slate-200" />
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
