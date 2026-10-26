import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { centralAfricaCityGroups } from "@/data/locations";
import { buildJobsSearchUrl } from "@/features/jobs/search/buildJobsSearchUrl";
import { useI18n } from "@/i18n";

const cityOptions = centralAfricaCityGroups.flatMap((group) => group.cities);
const preferredCities = ["Brazzaville", "Pointe-Noire"];
const orderedCityOptions = [
  ...preferredCities,
  ...cityOptions.filter((city) => !preferredCities.includes(city)),
];

interface HeroSearchFormProps {
  isEcoMode: boolean;
}

export function HeroSearchForm({ isEcoMode }: HeroSearchFormProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(buildJobsSearchUrl({ query, city }));
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="mt-7 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)_auto]"
    >
      <div className="min-w-0">
        <label
          htmlFor="home-job-query"
          className={`mb-1.5 block text-sm font-medium ${
            isEcoMode ? "text-foreground" : "text-white"
          }`}
        >
          {t("home.hero.search.query.label")}
        </label>
        <Input
          id="home-job-query"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("home.hero.search.query.placeholder")}
          autoComplete="off"
          className="h-11 min-w-0 border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
      </div>
      <div className="min-w-0">
        <label
          htmlFor="home-job-city"
          className={`mb-1.5 block text-sm font-medium ${
            isEcoMode ? "text-foreground" : "text-white"
          }`}
        >
          {t("home.hero.search.city.label")}
        </label>
        <Input
          id="home-job-city"
          name="ville"
          list="home-job-city-options"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder={t("home.hero.search.city.placeholder")}
          autoComplete="off"
          className="h-11 min-w-0 border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
        <datalist id="home-job-city-options">
          {orderedCityOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>
      <div className="flex items-end sm:pb-0">
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full bg-primary text-primary-foreground shadow-none hover:bg-primary/90 sm:w-auto"
        >
          {t("home.hero.search.submit")}
        </Button>
      </div>
    </form>
  );
}
