import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Check,
  Clock3,
  FileCheck2,
  Scale,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/features/seo";
import backgroundPage from "@/assets/backgroun-page-services/208is.jpg";
import teamImage from "@/assets/services/enterprise-team-01.webp";

const heroVisual = {
  src: teamImage,
  alt: "Équipe professionnelle en réunion",
};

const benefits = [
  {
    title: "Gain de temps",
    description:
      "Nous nous chargeons du recrutement, de l'évaluation et de la mise en place des collaborateurs, vous permettant de vous concentrer sur votre activité principale.",
    icon: Clock3,
  },
  {
    title: "Collaborateurs qualifiés et opérationnels",
    description:
      "Tous les profils mis à disposition sont soigneusement sélectionnés et préparés pour intégrer vos équipes.",
    icon: Users,
  },
  {
    title: "Satisfaction garantie",
    description:
      "Avec un taux de satisfaction client élevé, nous nous engageons à répondre à vos attentes de manière efficace et professionnelle.",
    icon: Check,
  },
];

const offers = [
  {
    title: "Intérim de gestion",
    description: "Pour le remplacement d'un salarié absent : congé de maternité, maladie, etc.",
    features: [
      "Un vivier de plus de 2 000 profils.",
      "Profils testés et référencés.",
      "Garantie de conformité juridique.",
      "Gestion administrative 100 % digitalisée.",
    ],
  },
  {
    title: "Pour les TPE, PME et startups",
    description: "Vous connaissez déjà votre ou vos intérimaires.",
    features: [
      "Une équipe pour vous aider dans la gestion de vos intérimaires.",
      "Gestion administrative 100 % digitalisée.",
      "Garantie de conformité juridique.",
      "Assistance par e-mail.",
    ],
  },
  {
    title: "Pour les grands comptes",
    description: "Pour des projets spécifiques ou à long terme.",
    features: [
      "Chargé de compte, interlocuteur unique.",
      "Actions de sourcing spécifiques.",
      "Grilles de coefficients sur mesure.",
      "Garantie de conformité juridique.",
    ],
  },
];

const commitments = [
  {
    title: "Sélection rigoureuse des candidats",
    description:
      "Nous identifions, évaluons et sélectionnons des talents en adéquation avec vos besoins spécifiques, grâce à un processus de recrutement rigoureux.",
    icon: ShieldCheck,
  },
  {
    title: "Rapidité et réactivité",
    description:
      "Nous mettons à votre disposition des profils compétents dans des délais courts pour répondre à vos urgences ou à vos pics d'activité.",
    icon: Zap,
  },
  {
    title: "Flexibilité et adaptation",
    description:
      "Nos solutions s'ajustent à vos besoins : mission de quelques jours, remplacement temporaire ou renfort à long terme.",
    icon: Clock3,
  },
  {
    title: "Diversité des secteurs couverts",
    description:
      "Administration et gestion, logistique et transport, industrie et production, commerce et distribution.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Accompagnement personnalisé",
    description:
      "Nos experts RH vous accompagnent de l'analyse de vos besoins à l'intégration des collaborateurs, en passant par le suivi des performances.",
    icon: Users,
  },
  {
    title: "Gestion administrative simplifiée",
    description:
      "Nous prenons en charge les contrats, la paie, les déclarations sociales et les autres formalités applicables.",
    icon: FileCheck2,
  },
];

const commitmentOrbit = {
  centerX: -60,
  centerY: 220,
  radius: 210,
  buttonRadius: 32,
  angles: [-50, -30, -10, 10, 30, 50],
};

export default function MiseADispositionPage() {
  const [activeCommitment, setActiveCommitment] = useState(0);
  const selectedCommitment = commitments[activeCommitment];
  const SelectedIcon = selectedCommitment.icon;

  return (
    <>
      <SEO
        title="Mise à disposition / Intérim"
        description="Confiez à EmploiPlus Group la gestion de vos intérimaires et renforcez vos équipes avec des collaborateurs qualifiés et opérationnels."
        canonical={`${BASE_URL}/services/mise-disposition-rh`}
        robots="index,follow"
      />

      <main className="page-image-hover service-page-no-horizontal-rules pb-20 pt-0 md:pb-24 md:pt-0">
        <div className="mx-auto max-w-none">
          <section
            className="relative overflow-hidden px-6 py-8 text-white md:px-10 md:py-12"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.68) 42%, rgba(15, 23, 42, 0.35) 100%), url(${backgroundPage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)] lg:items-center lg:gap-16">
              <div className="max-w-3xl">
                <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
                  Confiez-nous la gestion de vos intérimaires
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
                  Nous vous garantissons une prestation complète, qui aboutira à la mise à disposition
                  du meilleur candidat correspondant à vos attentes.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-8 rounded-xl bg-white text-slate-950 hover:bg-slate-100"
                >
                  <Link to="/contact?subject=Besoin%20de%20mise%20%C3%A0%20disposition%20-%20Int%C3%A9rim">
                    Présenter votre besoin
                  </Link>
                </Button>
              </div>
              <div className="relative overflow-hidden bg-slate-100/10 backdrop-blur-[2px]">
                <img
                  src={heroVisual.src}
                  alt={heroVisual.alt}
                  className="h-72 w-full object-cover lg:h-96"
                />
              </div>
            </div>
          </section>

          <section className="scroll-mt-20 border-b border-border bg-[#f2f8fd] py-14 md:py-20">
            <div className="mx-auto max-w-6xl px-6 md:px-10">
              <div className="max-w-2xl">
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
                  Une gestion fiable, de la sélection à l'intégration
                </h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
                  Vous bénéficiez d'un service clé en main, sans avoir à supporter directement les
                  charges liées au recrutement ou à la gestion des ressources humaines.
                </p>
              </div>
              <div className="mt-10 grid gap-3 md:grid-cols-3">
                {benefits.map(({ title, description }, index) => (
                  <article
                    key={title}
                    className={`min-h-[310px] rounded-[26px] p-6 md:p-7 ${
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : index === 1
                          ? "bg-[#231f20] text-white"
                          : "bg-slate-100 text-slate-950"
                    }`}
                  >
                    <span className="text-5xl font-light leading-none tracking-tight">0{index + 1}.</span>
                    <h3 className="mt-8 max-w-[15rem] text-xl font-bold leading-tight">{title}</h3>
                    <p
                      className={`mt-7 text-sm leading-6 ${
                        index === 2 ? "text-slate-700" : "text-white/85"
                      }`}
                    >
                      {description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="scroll-mt-20 border-b border-border py-14 md:py-20">
            <div className="mx-auto max-w-6xl px-6 md:px-10">
              <div className="max-w-3xl">
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Une formule adaptée à votre réalité
                </h2>
                <p className="mt-4 text-base leading-8 text-muted-foreground">
                  Nous renforçons vos équipes avec des collaborateurs qualifiés et immédiatement
                  opérationnels, pour des besoins ponctuels, saisonniers ou durables, quelle que soit
                  la taille de votre entreprise ou votre secteur d'activité.
                </p>
              </div>
              <div className="mt-10 grid gap-5 lg:grid-cols-3">
                {offers.map((offer, index) => (
                  <article
                    key={offer.title}
                    className={`border p-6 ${index === 1 ? "border-brand bg-brand text-brand-foreground" : "border-border bg-card"}`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.2em] ${index === 1 ? "text-brand-foreground/75" : "text-brand"}`}
                    >
                      Formule 0{index + 1}
                    </p>
                    <h3 className="mt-4 text-xl font-semibold">{offer.title}</h3>
                    <p
                      className={`mt-5 min-h-14 text-sm leading-6 ${index === 1 ? "text-brand-foreground/80" : "text-muted-foreground"}`}
                    >
                      {offer.description}
                    </p>
                    <ul
                      className={`mt-6 space-y-3 border-t pt-5 text-sm leading-6 ${index === 1 ? "border-white/20" : "border-border"}`}
                    >
                      {offer.features.map((feature) => (
                        <li key={feature} className="flex gap-2">
                          <Check className="mt-1 size-4 shrink-0" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="scroll-mt-20 py-14 md:py-20">
            <div className="mx-auto max-w-6xl px-6 md:px-10">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Une relation suivie et responsable
                </h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground">
                  Faites confiance à notre expertise pour renforcer vos équipes avec des talents
                  adaptés à vos besoins. Ensemble, nous construisons une solution sur mesure pour
                  garantir votre réussite.
                </p>
              </div>
              <div className="mt-12 grid items-center gap-10 overflow-hidden rounded-[2rem] bg-slate-50 px-6 py-8 md:px-10 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-12">
                <div className="relative mx-auto h-[30rem] w-full max-w-[24rem] overflow-hidden">
                  <div
                    className="absolute rounded-full border border-slate-300"
                    style={{
                      left: `${commitmentOrbit.centerX - commitmentOrbit.radius}px`,
                      top: `${commitmentOrbit.centerY - commitmentOrbit.radius}px`,
                      width: `${commitmentOrbit.radius * 2}px`,
                      height: `${commitmentOrbit.radius * 2}px`,
                    }}
                  />
                  {commitments.map(({ title }, index) => {
                    const angle = (commitmentOrbit.angles[index] * Math.PI) / 180;
                    const buttonLeft =
                      commitmentOrbit.centerX +
                      commitmentOrbit.radius * Math.cos(angle) -
                      commitmentOrbit.buttonRadius;
                    const buttonTop =
                      commitmentOrbit.centerY +
                      commitmentOrbit.radius * Math.sin(angle) -
                      commitmentOrbit.buttonRadius;
                    const isActive = index === activeCommitment;

                    return (
                      <button
                        key={title}
                        type="button"
                        aria-label={`Afficher ${title}`}
                        aria-pressed={isActive}
                        onClick={() => setActiveCommitment(index)}
                        style={{ left: `${buttonLeft}px`, top: `${buttonTop}px` }}
                        className={`absolute z-10 flex size-16 items-center justify-center rounded-full border text-sm font-bold tracking-[0.08em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                          isActive
                            ? "scale-110 border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "border-slate-200 bg-white text-slate-300 hover:border-primary/50 hover:text-primary"
                        }`}
                      >
                        0{index + 1}
                      </button>
                    );
                  })}
                </div>
                <article
                  key={selectedCommitment.title}
                  className="max-w-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                      <SelectedIcon className="size-6" aria-hidden="true" />
                    </div>
                    <span className="text-5xl font-light tracking-tight text-primary">
                      {String(activeCommitment + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
                    {selectedCommitment.title}
                  </h3>
                  <p className="mt-5 text-base leading-8 text-muted-foreground">
                    {selectedCommitment.description}
                  </p>
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                    Cliquez sur un numéro pour continuer
                  </p>
                </article>
              </div>
            </div>
          </section>

          <section className="mx-6 max-w-6xl rounded-[1.5rem] bg-brand px-5 py-7 text-center text-brand-foreground md:mx-auto md:px-8 md:py-9">
            <h2 className="mx-auto max-w-4xl font-display text-xl font-bold tracking-tight md:text-3xl">
              Renforcez vos équipes avec le bon profil
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-brand-foreground/80 md:text-base">
              Présentez-nous votre besoin, vos contraintes et votre calendrier. Notre équipe vous
              accompagne dans la construction d'une solution adaptée.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-5 rounded-xl bg-white text-brand hover:bg-white/90"
            >
              <Link to="/contact?subject=Besoin%20de%20mise%20%C3%A0%20disposition%20-%20Int%C3%A9rim">
                Nous contacter
              </Link>
            </Button>
          </section>

        </div>
      </main>
    </>
  );
}
