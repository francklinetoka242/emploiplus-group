import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SERVICES_INQUIRY_SUBJECT } from "@/features/services/servicesData";

const contactHref = `/contact?subject=${encodeURIComponent(SERVICES_INQUIRY_SUBJECT)}`;

export function ServicesCallToAction() {
  return (
    <section className="border-t border-border py-10 md:py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Parlons de votre besoin.
        </h2>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button
            asChild
            size="lg"
            className="min-h-11 bg-primary text-primary-foreground shadow-none hover:bg-primary/90"
          >
            <Link to={contactHref}>Présenter votre besoin</Link>
          </Button>
          <Link
            to="/contact"
            className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Écrire à notre équipe{" "}
            <span aria-hidden="true" className="ml-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
