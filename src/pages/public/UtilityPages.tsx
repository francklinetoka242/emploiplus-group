import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/constants";
import hubImage from "@/assets/services/hub-emploi.svg";
import rhImage from "@/assets/services/rh-gestion.svg";
import conseilImage from "@/assets/services/conseil-training.svg";
import serviceImage from "@/assets/services/service-opérationnel.svg";

const SERVICE_DETAILS = {
  "hub-emploi-recrutement": {
    image: hubImage,
    sections: [
      {
        id: "overview",
        title: "Vue d'ensemble",
        content: [
          "Nous connectons les entreprises aux meilleurs talents et accompagnons les chercheurs d’emploi.",
          "L’objectif est de faciliter l’accès à l’emploi et constituer un vivier de talents qualifiés.",
        ],
      },
      {
        id: "services",
        title: "Nos services",
        content: [
          "Publication et diffusion d'offres d'emploi",
          "Recherche et sélection de candidats",
          "Recrutement pour les entreprises",
          "Constitution de bases de données de talents",
          "Évaluation des compétences",
          "Optimisation de CV et lettres de motivation",
          "Accompagnement des candidats",
          "Préparation aux entretiens",
        ],
        list: true,
      },
    ],
  },
  "mise-disposition-rh": {
    image: rhImage,
    sections: [
      {
        id: "overview",
        title: "Vue d'ensemble",
        content: [
          "Nous fournissons du personnel et gérons tout ou partie de leur administration pour le compte des entreprises.",
          "L'objectif est de permettre aux entreprises de disposer rapidement de personnel tout en externalisant la gestion RH.",
        ],
      },
      {
        id: "services",
        title: "Nos services",
        content: [
          "Mise à disposition de personnel (intérim)",
          "Gestion administrative du personnel",
          "Gestion de la paie",
          "Élaboration des contrats de travail",
          "Suivi des employés",
          "Sous-traitance de la gestion RH",
          "Externalisation des fonctions RH",
        ],
        list: true,
      },
    ],
  },
  "conseil-formation-transformation": {
    image: conseilImage,
    sections: [
      {
        id: "overview",
        title: "Vue d'ensemble",
        content: [
          "Nous accompagnons les entreprises dans l’amélioration de leurs compétences et de leurs outils de gestion.",
          "L'objectif est d'améliorer la performance des entreprises grâce aux compétences et aux outils numériques.",
        ],
      },
      {
        id: "conseil-transformation",
        title: "Conseil & Transformation",
        content: [
          "Conseil en organisation",
          "Audit des processus métier",
          "Optimisation des processus",
          "Accompagnement à la transformation digitale",
          "Conseil en stratégie numérique",
          "Conduite du changement",
        ],
        list: true,
      },
      {
        id: "digitalisation",
        title: "Digitalisation des entreprises",
        content: [
          "Digitalisation des processus métier",
          "Digitalisation des processus RH",
          "Automatisation des tâches administratives",
          "Dématérialisation des documents",
          "Gestion électronique des documents (GED)",
          "Mise en place de workflows numériques",
          "Conception de formulaires numériques",
          "Développement de tableaux de bord décisionnels",
          "Intégration de solutions collaboratives",
          "Déploiement de solutions Cloud",
        ],
        list: true,
      },
      {
        id: "ingenierie",
        title: "Ingénierie informatique",
        content: [
          "Création de sites web & Mails professionnels",
          "Infrastructure & Cloud",
          "Réseaux & Systèmes",
        ],
        list: true,
      },
      {
        id: "erp-gestion",
        title: "ERP & Solutions de gestion",
        content: [
          "Installation d'ERP",
          "Intégration d'ERP",
          "CRM",
          "Logiciels de gestion RH",
          "Logiciels de gestion commerciale",
          "Formation des utilisateurs",
          "Maintenance évolutive",
        ],
        list: true,
      },
      {
        id: "formation",
        title: "Formation",
        content: [
          "Formations professionnelles",
          "Formation aux outils numériques",
          "Formation bureautique",
          "Formation ERP",
          "Développement du leadership",
          "Coaching professionnel",
          "Intégration des nouveaux employés",
        ],
        list: true,
      },
    ],
  },
  "prestations-operationnelles": {
    image: serviceImage,
    sections: [
      {
        id: "overview",
        title: "Vue d'ensemble",
        content: [
          "Nous mettons à disposition des équipes internes pour exécuter des missions chez nos clients.",
          "L'objectif est de fournir des équipes opérationnelles capables d’exécuter directement les besoins des entreprises clientes.",
        ],
      },
      {
        id: "services",
        title: "Nos services",
        content: [
          "Prestations sur site client",
          "Support administratif",
          "Assistance opérationnelle",
          "Services aux entreprises (selon besoins)",
          "Appui technique et organisationnel",
          "Missions ponctuelles ou permanentes",
        ],
        list: true,
      },
    ],
  },
};

export function NotFoundPage() {
  return (
    <>
      <SEO
        title={"Page non trouvée - 404"}
        description={"La page que vous recherchez n'existe pas ou a été supprimée."}
        canonical={`${BASE_URL}/404`}
        robots="noindex,nofollow"
      />
      <div className="container-page py-20 md:py-28">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
          <h1 className="font-display text-4xl font-bold text-foreground">404</h1>
          <p className="mt-4 text-muted-foreground">Page introuvable.</p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </>
  );
}

export function ServiceDetailPage() {
  const { t } = useI18n();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const service = SERVICES.find((item) => item.slug === slug);
  const serviceKey = service?.slug as keyof typeof SERVICE_DETAILS | undefined;
  const serviceDetail = serviceKey ? SERVICE_DETAILS[serviceKey] : undefined;

  if (!service || !serviceDetail) {
    return <NotFoundPage />;
  }

  return (
    <>
      <SEO
        title={`${t(service.titleKey)} | ${t("services.title")}`}
        description={t(service.detailKey)}
        keywords="services, détail, devis, EmploiPlus"
        canonical={`${BASE_URL}/services/${service.slug}`}
        robots="index,follow"
        breadcrumbs={[
          { name: t("home.hero.title"), url: `${BASE_URL}/` },
          { name: t("services.title"), url: `${BASE_URL}/services` },
          { name: t(service.titleKey), url: `${BASE_URL}/services/${service.slug}` },
        ]}
      />
      <section className="container-page py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_0.85fr]">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-brand font-semibold">
                {t("services.title")}
              </p>
              <h1 className="font-display text-4xl font-bold text-foreground">
                {t(service.titleKey)}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t(service.descriptionKey)}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card overflow-hidden">
              <img
                src={serviceDetail.image}
                alt={t(service.titleKey)}
                className="w-full h-64 object-cover"
              />
              <div className="p-8">
                {serviceDetail.sections.map((section) => (
                  <div key={section.id} id={section.id} className="scroll-mt-24">
                    <h2 className="font-display text-2xl font-semibold text-foreground">
                      {section.title}
                    </h2>
                    {section.list ? (
                      <ul className="mt-4 space-y-3 list-disc pl-5 text-muted-foreground leading-relaxed">
                        {section.content.map((item: string) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      section.content.map((paragraph: string, index: number) => (
                        <p key={index} className="mt-4 text-muted-foreground leading-relaxed">
                          {paragraph}
                        </p>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-8">
              <h2 className="text-xl font-semibold text-foreground">
                {t("services.requestQuote.title")}
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {t("services.requestQuote.description")}
              </p>
              <Button
                asChild
                size="lg"
                className="mt-6 w-full bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <Link
                  to={`/contact?subject=${encodeURIComponent(`${t("services.requestQuote.subjectPrefix")} - ${t(service.titleKey)}`)}`}
                >
                  {t("services.requestQuote.button")}
                </Link>
              </Button>
            </div>
            <div className="rounded-3xl border border-border bg-card p-8">
              <h3 className="text-lg font-semibold text-foreground">Sections</h3>
              <div className="mt-4 grid gap-3">
                {serviceDetail.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted/10"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate("/services")}>
              {t("services.detail.back")}
            </Button>
          </aside>
        </div>
      </section>
    </>
  );
}
