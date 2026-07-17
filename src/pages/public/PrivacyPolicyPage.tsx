import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import SEO from "@/components/SEO";
import { useI18n } from "@/i18n";
import { BASE_URL } from "@/features/seo";
import { supabase } from "@/integrations/supabase/client";

function getDefaultPrivacyPolicy(): string {
  return `# Politique de Confidentialité

## 1. Responsable du traitement

EmploiPlus Group, basé à Pointe Noire, République du Congo, est responsable du traitement des données collectées sur le site.

- Directeur de la publication : ETOKA IBEAHO Francklin Sylver.

## 2. Données collectées

### Espace Candidat
Nous collectons et traitons les informations suivantes pour permettre l’inscription, la constitution du profil et la diffusion des candidatures :

- Prénom, nom, email, téléphone, ville et pays.
- Biographie, intitulé ou profession.
- Expériences professionnelles, entreprises, postes, dates et descriptions.
- Formations, diplômes, établissements et dates.
- Compétences métiers, niveaux et listes de compétences.
- Langues maîtrisées et niveaux associés.
- Préférences de recherche et paramètres liés au profil.
- Fichiers téléversés, tels que CV, documents annexes et pièces justificatives.

### Authentification

L’authentification est gérée via Supabase. Nous traitons :

- Adresse email.
- Mot de passe chiffré et stocké par Supabase.
- Tokens de session.
- Cookies techniques de session.

### Contact & Devis

Pour les formulaires de contact et de devis, nous collectons :

- Nom.
- Adresse email.
- Objet du message.
- Message libre.

### Postulation

Les démarches de postulation sont principalement transmises vers des outils externes comme l’email, WhatsApp ou des plateformes tierces. Les données de l’offre et du candidat peuvent être partagées selon le canal choisi.

## 3. Finalité du traitement

Les données sont utilisées pour :

- Gérer les comptes candidats et l’accès aux services.
- Faire fonctionner l’espace candidat, les profils et les candidatures.
- Permettre le contact et les demandes de devis.
- Assurer la sécurité et la maintenance de la plateforme.

## 4. Hébergement et sous-traitance

Le site est hébergé sur Vercel. La gestion de la base de données et de l’authentification est réalisée par Supabase.

## 5. Sécurité

Nous mettons en place des mesures de sécurité techniques et organisationnelles pour protéger les données stockées. Les accès d’administration sont réservés aux utilisateurs autorisés disposant des rôles appropriés.

## 6. Durée de conservation

Les données sont conservées aussi longtemps que nécessaire pour fournir le service, répondre aux obligations légales ou permettre l’exercice des droits des personnes concernées.

## 7. Exercices des droits

Vous pouvez demander l’accès, la rectification, la suppression ou la portabilité de vos données en contactant EmploiPlus Group via le formulaire de contact.

## 8. Modifications de la politique

Cette politique peut être mise à jour pour rester conforme aux évolutions réglementaires et aux services proposés par EmploiPlus Group.
`;
}

export function PrivacyPolicyPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [content, setContent] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadPolicy = async () => {
      const { data, error: fetchError } = await supabase
        .from("privacy_policy")
        .select("content")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (fetchError) {
        setError("Impossible de charger la politique de confidentialité.");
        setContent(getDefaultPrivacyPolicy());
      } else if (!data || !data.content) {
        setContent(getDefaultPrivacyPolicy());
      } else {
        setContent(data.content);
      }

      setLoading(false);
    };

    loadPolicy();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <SEO
        title="Politique de Confidentialité"
        description="Politique de Confidentialité d'EmploiPlus Group, site hébergé sur Vercel et utilisant Supabase."
        keywords="politique confidentialité, RGPD, Supabase, Vercel, EmploiPlus Group"
        canonical={`${BASE_URL}/politique-de-confidentialite`}
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
                Politique de Confidentialité
              </p>
              <h1 className="text-3xl font-semibold text-foreground">Politique de Confidentialité</h1>
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
