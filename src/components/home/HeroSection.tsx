import { useEcoMode } from "@/contexts/EcoModeContext";
import { useI18n } from "@/i18n";
import hero640 from "@/assets/home/home-hero-640.webp";
import hero1024 from "@/assets/home/home-hero-1024.webp";
import hero1600 from "@/assets/home/home-hero-1600.webp";
import hero1920 from "@/assets/home/home-hero-1920.webp";
import { HeroLinks } from "./HeroLinks";
import { HeroSearchForm } from "./HeroSearchForm";

interface HeroSectionProps {
  isCandidateShellHome?: boolean;
}

export function HeroSection({ isCandidateShellHome = false }: HeroSectionProps) {
  const { isEcoMode } = useEcoMode();
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="home-hero-title"
      className={`relative flex min-h-[480px] items-center overflow-hidden bg-background md:min-h-[560px] ${
        isCandidateShellHome ? "lg:min-h-[420px]" : ""
      }`}
    >
      {!isEcoMode && (
        <>
          <img
            src={hero1600}
            srcSet={`${hero640} 640w, ${hero1024} 1024w, ${hero1600} 1600w, ${hero1920} 1920w`}
            sizes="100vw"
            width={1920}
            height={1071}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full scale-x-[-1] object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(0deg,rgba(2,6,23,0.94)_0%,rgba(2,6,23,0.78)_42%,rgba(2,6,23,0.18)_78%,transparent_100%)] md:bg-[linear-gradient(90deg,rgba(2,6,23,0.88)_0%,rgba(2,6,23,0.72)_42%,rgba(2,6,23,0.18)_78%,transparent_100%)]"
          />
        </>
      )}
      <div
        className={`container-page relative z-10 w-full py-8 md:py-10 ${
          isCandidateShellHome ? "lg:py-6" : ""
        }`}
      >
        <div className="max-w-3xl">
          <p
            className={`text-sm font-medium ${
              isEcoMode ? "text-muted-foreground" : "text-white/80"
            }`}
          >
            {t("home.hero.eyebrow")}
          </p>
          <h1
            id="home-hero-title"
            className={`mt-2 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl ${
              isEcoMode ? "text-foreground" : "text-white"
            }`}
          >
            {t("home.hero.title")}
          </h1>
          <p
            className={`mt-4 max-w-[36rem] text-base leading-relaxed ${
              isEcoMode ? "text-muted-foreground" : "text-white/90"
            }`}
          >
            {t("home.hero.subtitle")}
          </p>
          <HeroSearchForm isEcoMode={isEcoMode} />
          <HeroLinks isEcoMode={isEcoMode} />
        </div>
      </div>
    </section>
  );
}
