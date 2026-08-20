import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Check, User, Sparkles, Bell, Zap, Eye, MapPin, Users, Layers, TrendingUp } from "lucide-react";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import candidateIllustration1 from "@/assets/IMG_Page-Services/img_section_candidat/1.webp";
import candidateIllustration2 from "@/assets/IMG_Page-Services/img_section_candidat/2.webp";
import candidateIllustration3 from "@/assets/IMG_Page-Services/img_section_candidat/3.webp";
import candidateIllustration4 from "@/assets/IMG_Page-Services/img_section_candidat/4.webp";
import candidateIllustration5 from "@/assets/IMG_Page-Services/img_section_candidat/5.webp";
import candidateIllustration6 from "@/assets/IMG_Page-Services/img_section_candidat/6.webp";
import candidateIllustration7 from "@/assets/IMG_Page-Services/img_section_candidat/7.webp";
import enterpriseIllustration from "@/assets/services/directeur-souriant-tenant-document-important-colleg.jpg";

const candidateSlides = [
  { src: candidateIllustration1, alt: "Parcours candidat - vue 1" },
  { src: candidateIllustration2, alt: "Parcours candidat - vue 2" },
  { src: candidateIllustration3, alt: "Parcours candidat - vue 3" },
  { src: candidateIllustration4, alt: "Parcours candidat - vue 4" },
  { src: candidateIllustration5, alt: "Parcours candidat - vue 5" },
  { src: candidateIllustration6, alt: "Parcours candidat - vue 6" },
  { src: candidateIllustration7, alt: "Parcours candidat - vue 7" },
];

function CandidateCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobileAppUserAgent =
    typeof navigator !== "undefined" && navigator.userAgent.includes("EmploiPlusApp");

  useEffect(() => {
    if (isMobileAppUserAgent) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % candidateSlides.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [isMobileAppUserAgent]);

  const positionedSlides = candidateSlides.map((image, index) => {
    let offset = (index - activeIndex + candidateSlides.length) % candidateSlides.length;
    if (offset > candidateSlides.length / 2) {
      offset -= candidateSlides.length;
    }

    return { image, offset };
  });

  return (
    <div className="mx-auto w-full max-w-[520px] overflow-x-clip slide-in-right slide-delay-1">
      <div className="relative rounded-[1.8rem] bg-transparent p-0 shadow-none">
        <div className="relative mx-auto aspect-[9/20.5] w-[220px] sm:w-[250px]">
          {positionedSlides.map(({ image, offset }) => (
              <div
                key={image.src}
                className="absolute inset-0 overflow-hidden rounded-[1.3rem] bg-white transition-[transform,opacity] duration-700 ease-out will-change-transform"
                style={{
                  opacity: offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.5 : 0,
                  transform:
                    offset === 0
                      ? "translate3d(0, 0, 0) scale(1)"
                      : offset === -1
                        ? "translate3d(clamp(-175px, -30vw, -80px), 0, 0) scale(0.7)"
                        : offset === 1
                          ? "translate3d(clamp(80px, 30vw, 175px), 0, 0) scale(0.7)"
                          : offset < 0
                            ? "translate3d(clamp(-250px, -42vw, -130px), 0, 0) scale(0.5)"
                            : "translate3d(clamp(130px, 42vw, 250px), 0, 0) scale(0.5)",
                  zIndex: offset === 0 ? 5 : Math.abs(offset) === 1 ? 2 : 1,
                }}
              >
                <img
                  src={image.src}
                  alt={offset === 0 ? image.alt : ""}
                  aria-hidden={offset !== 0}
                  className="h-full w-full object-contain bg-white"
                />
              </div>
            ))}
        </div>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {candidateSlides.map((image, index) => (
            <span
              key={`${image.alt}-${index}`}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                index === activeIndex ? "bg-brand scale-110" : "bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ServicesPage() {
  return (
    <>
      <SEO
        title="Nos solutions RH | EmploiPlus Group"
        description="Nous accompagnons les talents et les entreprises grâce à des solutions RH modernes, digitales et performantes."
        canonical={`${BASE_URL}/services`}
        robots="index,follow"
      />

      <main className="bg-background pb-20 pt-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            <section className="mx-4 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center sm:mx-6 lg:mx-8">
              <div className="space-y-8 slide-in-left slide-delay-1">
                <div className="inline-flex items-center rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-brand">
                  Candidat
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Un parcours candidat fluide et efficace
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                    Explorez les offres, préparez votre profil et postulez en quelques étapes. Tout est pensé pour gagner du temps et vous mettre en valeur.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      icon: Sparkles,
                      label: "Matching intelligent adapté à votre profil",
                    },
                    {
                      icon: Bell,
                      label: "Offres recommandées et mises à jour",
                    },
                    {
                      icon: Zap,
                      label: "Candidature express en quelques clics",
                    },
                    {
                      icon: Eye,
                      label: "Outils de visibilité professionnelle",
                    },
                  ].map(({ icon: Icon, label }, index) => (
                    <div
                      key={label}
                      className={
                        `border-b border-border px-1 py-4 text-foreground/80 transition-colors duration-200 hover:border-brand slide-in-up` +
                        ` slide-delay-${index + 2}`
                      }
                    >
                      <div className="flex items-center gap-3 text-brand">
                        <Icon className="h-5 w-5" />
                        <span className="font-semibold text-slate-900">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/services/hub-candidat-intelligent"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3 text-sm font-semibold text-brand-foreground transition duration-300 hover:bg-brand/90 slide-in-up slide-delay-4"
                >
                  Découvrir l'espace candidat
                </Link>
              </div>

              <CandidateCarousel />
            </section>

            <section className="grid gap-10 border-t border-slate-200/80 pt-16 lg:grid-cols-[0.95fr_1.05fr] lg:pt-20 items-center">
              <div className="relative overflow-hidden rounded-[2rem] bg-card slide-in-left slide-delay-1">
                <img
                  src={enterpriseIllustration}
                  alt="Solutions entreprise et BPO"
                  className="h-full w-full object-cover transition duration-500 ease-out hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-transparent" />
              </div>

              <div className="space-y-8 slide-in-right slide-delay-1">
                <div className="inline-flex items-center rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-secondary">
                  Entreprise
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Une solution d'externalisation globale et sur mesure
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                    BPO, gestion déléguée et pilotage opérationnel pour faire évoluer votre organisation avec sérénité.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      icon: MapPin,
                      label: "Cadrage précis des besoins opérationnels",
                    },
                    {
                      icon: Users,
                      label: "Ressources qualifiées et compétences clés",
                    },
                    {
                      icon: Layers,
                      label: "Pilotage continu et reporting clair",
                    },
                    {
                      icon: TrendingUp,
                      label: "Valorisation de la performance d'entreprise",
                    },
                  ].map(({ icon: Icon, label }, index) => (
                    <div
                      key={label}
                      className={
                        `border-b border-border px-1 py-4 text-foreground/80 transition-colors duration-200 hover:border-secondary slide-in-up` +
                        ` slide-delay-${index + 2}`
                      }
                    >
                      <div className="flex items-center gap-3 text-secondary">
                        <Icon className="h-5 w-5" />
                        <span className="font-semibold text-slate-900">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/services/solutions-entreprises-bpo"
                  className="inline-flex items-center justify-center rounded-full bg-secondary px-7 py-3 text-sm font-semibold text-secondary-foreground transition duration-300 hover:bg-secondary/90 slide-in-up slide-delay-4"
                >
                  Découvrir nos solutions
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export default ServicesPage;
