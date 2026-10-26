import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEcoMode } from "@/contexts/EcoModeContext";
import { SERVICES_INQUIRY_SUBJECT } from "@/features/services/servicesData";
import enterpriseIllustration from "@/assets/services/candidate-journey/success-management.webp";

const contactHref = `/contact?subject=${encodeURIComponent(SERVICES_INQUIRY_SUBJECT)}`;

export function ServicesHeader() {
  const { isEcoMode } = useEcoMode();

  return (
    <header className="grid items-center gap-8 border-b border-border py-10 md:gap-12 md:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-muted-foreground">Nos services</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Des solutions RH pour chaque étape de votre organisation
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Mise à disposition de personnel, recrutement, externalisation administrative et conseil RH
          : quatre services pour accompagner votre entreprise.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Button
            asChild
            size="lg"
            className="min-h-11 bg-primary text-primary-foreground shadow-none hover:bg-primary/90"
          >
            <Link to={contactHref}>Présenter votre besoin</Link>
          </Button>
          <a
            href="#services-list"
            className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Voir les quatre services{" "}
            <span aria-hidden="true" className="ml-1">
              ↓
            </span>
          </a>
        </div>
      </div>
      {!isEcoMode && (
        <img
          src={enterpriseIllustration}
          srcSet={`${enterpriseIllustration} 740w`}
          width={740}
          height={370}
          sizes="(min-width: 1024px) 42vw, (min-width: 768px) 90vw, 100vw"
          alt="Équipe en réunion autour de solutions de gestion et de performance"
          fetchPriority="high"
          decoding="async"
          className="aspect-[2/1] w-full object-cover"
        />
      )}
    </header>
  );
}
