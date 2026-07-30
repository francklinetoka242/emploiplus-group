import React from "react";
import HeroServices from "./services/HeroServices";
import CandidateJourney from "./services/CandidateJourney";
import EnterpriseWorkflow from "./services/EnterpriseWorkflow";
import CTASection from "@/components/CTASection";

export function ServicesPage(): JSX.Element {
  return (
    <main className="overflow-x-hidden">
      <HeroServices />
      <CandidateJourney />
      <EnterpriseWorkflow />

      <section className="bg-white py-16">
        <div className="container-page">
          <div className="rounded-[32px] border border-slate-200/70 bg-white p-10 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.08)] sm:p-14">
            <div className="flex flex-col gap-6 sm:items-center sm:justify-between sm:flex-row">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.26em] text-slate-500">Prêt à passer à l’action ?</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Contactez-nous pour lancer votre projet BPO et RH sur mesure.
                </h2>
              </div>
              <CTASection primaryHref="/contact" primaryLabel="Nous contacter" secondaryHref="/jobs" secondaryLabel="Voir nos offres" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ServicesPage;
