import { Link } from "react-router-dom";
import { SERVICES_DATA } from "@/features/services/servicesData";

export function ServiceOverviewList() {
  return (
    <section
      id="services-list"
      aria-labelledby="services-list-title"
      className="scroll-mt-20 py-10 md:py-12"
    >
      <h2 id="services-list-title" className="sr-only">
        Les quatre services RH
      </h2>
      <div className="divide-y divide-border border-b border-border">
        {SERVICES_DATA.map((service) => (
          <article
            key={service.id}
            className="grid gap-x-10 gap-y-6 py-8 md:py-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
          >
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                {service.name}
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
                {service.promise}
              </p>
            </div>
            <div>
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-foreground">Pour qui : </span>
                <span className="text-muted-foreground">{service.audience}</span>
              </p>
              <ul className="mt-4 space-y-2">
                {service.prestations.map((prestation) => (
                  <li
                    key={prestation}
                    className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span aria-hidden="true" className="text-primary">
                      —
                    </span>
                    <span>{prestation}</span>
                  </li>
                ))}
              </ul>
              {service.modalities && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Modalités : </span>
                  {service.modalities}
                </p>
              )}
              <Link
                to={service.route}
                className="mt-5 inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Découvrir {service.name}{" "}
                <span aria-hidden="true" className="ml-1">
                  →
                </span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
