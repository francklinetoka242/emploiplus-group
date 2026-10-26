import SEO from "@/components/SEO";
import {
  ServiceNeedsTable,
  ServiceOverviewList,
  ServicesCallToAction,
  ServicesHeader,
} from "@/components/services";
import { BASE_URL } from "@/features/seo";
import { SERVICES_DATA } from "@/features/services/servicesData";

export function ServicesPage() {
  return (
    <>
      <SEO
        title="Nos solutions RH"
        description="Mise à disposition de personnel, recrutement, externalisation administrative, conseil et formation RH : découvrez les quatre services d'EmploiPlus Group."
        canonical={`${BASE_URL}/services`}
        robots="index,follow"
        breadcrumbs={[
          { name: "Accueil", url: `${BASE_URL}/` },
          { name: "Nos solutions RH", url: `${BASE_URL}/services` },
        ]}
        structuredData={{
          "@type": "ItemList",
          name: "Services RH EmploiPlus Group",
          itemListElement: SERVICES_DATA.map((service, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: service.name,
            url: `${BASE_URL}${service.route}`,
          })),
        }}
      />
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ServicesHeader />
          <ServiceOverviewList />
          <ServiceNeedsTable />
          <ServicesCallToAction />
        </div>
      </div>
    </>
  );
}

export default ServicesPage;
