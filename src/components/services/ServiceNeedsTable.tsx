import { Link } from "react-router-dom";
import { SERVICES_DATA } from "@/features/services/servicesData";

const needsByService = [
  {
    serviceId: "interim",
    need: "Renforcer vos équipes pour un besoin ponctuel, saisonnier ou durable.",
  },
  {
    serviceId: "recrutement",
    need: "Recruter un profil adapté à un poste, y compris critique ou rare.",
  },
  {
    serviceId: "externalisation",
    need: "Confier la paie, la gestion administrative ou une assistance technique.",
  },
  {
    serviceId: "conseil-formation",
    need: "Structurer vos pratiques RH : formation, rémunération ou relations sociales.",
  },
];

const serviceNeeds = needsByService.map(({ serviceId, need }) => {
  const service = SERVICES_DATA.find((entry) => entry.id === serviceId);
  if (!service) {
    throw new Error(`Aucun service trouvé pour le besoin « ${serviceId} ».`);
  }

  return { service, need };
});

export function ServiceNeedsTable() {
  return (
    <section
      aria-labelledby="service-needs-title"
      className="border-t border-border py-10 md:py-12"
    >
      <h2
        id="service-needs-title"
        className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
      >
        Quel service pour quel besoin ?
      </h2>
      <dl className="mt-6 divide-y divide-border border-y border-border md:hidden">
        {serviceNeeds.map(({ service, need }) => (
          <div key={service.id} className="space-y-2 py-4">
            <dt className="text-sm font-medium text-muted-foreground">Votre besoin</dt>
            <dd className="text-sm leading-relaxed text-foreground">{need}</dd>
            <dt className="pt-2 text-sm font-medium text-muted-foreground">Service adapté</dt>
            <dd className="text-sm font-semibold text-foreground">{service.name}</dd>
            <dd>
              <Link
                to={service.route}
                className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Voir {service.name}{" "}
                <span aria-hidden="true" className="ml-1">
                  →
                </span>
              </Link>
            </dd>
          </div>
        ))}
      </dl>
      <table className="mt-6 hidden w-full border-collapse text-left text-sm md:table">
        <caption className="sr-only">
          Correspondance entre vos besoins et les services EmploiPlus
        </caption>
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th scope="col" className="w-[43%] py-3 pr-6 font-medium">
              Votre besoin
            </th>
            <th scope="col" className="w-[35%] py-3 pr-6 font-medium">
              Service adapté
            </th>
            <th scope="col" className="py-3 font-medium">
              Accès
            </th>
          </tr>
        </thead>
        <tbody>
          {serviceNeeds.map(({ service, need }) => (
            <tr key={service.id} className="border-b border-border">
              <td className="py-4 pr-6 text-muted-foreground">{need}</td>
              <th scope="row" className="py-4 pr-6 text-left font-semibold text-foreground">
                {service.name}
              </th>
              <td className="py-4">
                <Link
                  to={service.route}
                  className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Voir {service.name}{" "}
                  <span aria-hidden="true" className="ml-1">
                    →
                  </span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
