import React from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Megaphone, Users, Database, Search } from "lucide-react";
import hubImage from "@/assets/IMG_Page-Services/2147626421.jpg";

const canonical = `${BASE_URL}/services/hub-emploi-recrutement`;

export default function HubEmploiPage() {
  return (
    <>
      <SEO title="Hub Emploi & Recrutement" description="Connecter les entreprises aux meilleurs talents et accompagner les chercheurs d’emploi vers la réussite." canonical={canonical} robots="index,follow" />

      <main className="container-page py-8 md:py-16">
        <div className="mx-auto max-w-4xl">
          {/* Hero Mini */}
          <div className="text-center">
            <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">Pôle 1 — Hub Emploi & Recrutement</span>
            <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground">Hub Emploi & Recrutement</h1>
            <p className="mt-4 text-lg text-muted-foreground">Connecter les entreprises aux meilleurs talents et accompagner les chercheurs d’emploi vers la réussite.</p>

            <div className="mt-6 flex flex-col sm:flex-row sm:justify-center gap-3">
              <a href="/contact?subject=Demande%20de%20devis%20-%20P%C3%94LE%201%20%3A%20HUB%20EMPLOI%20%26%20RECRUTEMENT" className="inline-block">
                <Button size="lg" className="bg-brand text-brand-foreground">Demander un devis</Button>
              </a>
              <Link to="/jobs" className="inline-block">
                <Button variant="outline" size="lg">Voir les offres</Button>
              </Link>
            </div>

            <div className="mt-6 max-w-3xl mx-auto rounded-lg border border-border bg-yellow-50 p-4 text-sm">
              <strong>NB :</strong>&nbsp;Faciliter l’accès à l’emploi et constituer un vivier de talents qualifiés.
            </div>
          </div>

          {/* B2B Section with distinct visual style */}
          <section className="mt-12">
            <div className="rounded-2xl bg-gradient-to-r from-white to-slate-50 p-8 shadow-sm">
              <div className="grid gap-8 lg:grid-cols-2 items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Pour les entreprises</h2>
                  <p className="mt-3 text-muted-foreground">Solutions dédiées pour recruter mieux et plus vite — services sur-mesure pour vos besoins RH.</p>

                  <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    <Card icon={<Megaphone className="h-6 w-6" />} title="Publication & diffusion">Maximisez la visibilité de vos annonces sur nos canaux stratégiques pour attirer des profils cibles.</Card>
                    <Card icon={<Search className="h-6 w-6" />} title="Recherche & sélection">Un sourcing sur-mesure et une pré-sélection rigoureuse pour vous faire gagner un temps précieux.</Card>
                    <Card icon={<Users className="h-6 w-6" />} title="Recrutement complet">Un accompagnement de A à Z par nos experts pour intégrer le collaborateur idéal.</Card>
                    <Card icon={<Database className="h-6 w-6" />} title="Bases de talents">Accédez à notre vivier exclusif de profils qualifiés et disponibles immédiatement.</Card>
                  </div>
                </div>

                <div className="hidden lg:flex items-center justify-center">
                  <img src={hubImage} alt="Hub Emploi illustration" className="w-full max-w-md rounded-2xl shadow-lg object-cover transform transition-transform duration-500 hover:scale-105" />
                </div>
              </div>
            </div>
          </section>

          {/* B2C Section with alternating blocks and different background */}
          <section className="mt-16">
            <div className="rounded-2xl bg-brand/5 p-8">
              <h2 className="text-2xl font-semibold text-foreground">Pour les candidats</h2>
              <p className="mt-3 text-muted-foreground">Des services pensés pour valoriser vos compétences et accélérer votre insertion professionnelle.</p>

              <div className="mt-8 space-y-12">
                <AlternateBlock title="Évaluation des compétences" detail="Tests techniques et comportementaux pour certifier votre expertise." img={hubImage} reverse={false} />
                <AlternateBlock title="Optimisation de CV & lettres" detail="Refonte complète de vos outils pour capter l'attention des recruteurs." img={hubImage} reverse={true} />
                <AlternateBlock title="Accompagnement personnalisé" detail="Un coaching pour piloter votre carrière avec assurance." img={hubImage} reverse={false} />
                <AlternateBlock title="Préparation aux entretiens" detail="Simulations réelles et feedbacks constructifs pour faire la différence le jour J." img={hubImage} reverse={true} />
              </div>

              <div className="mt-12 text-center">
                <p className="text-muted-foreground">Prêt à franchir la prochaine étape ?</p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <a href="/contact?subject=Demande%20de%20coaching%20-%20Candidat" className="inline-block"><Button size="lg" className="bg-brand text-brand-foreground">Je m'inscris</Button></a>
                  <Link to="/jobs"><Button variant="outline" size="lg">Consulter les offres</Button></Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function Card({ icon, title, children } : { icon: React.ReactNode; title: string; children: React.ReactNode }){
  return (
    <article className="rounded-lg border border-border bg-white p-6 shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand/5 text-brand">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{children}</p>
        </div>
      </div>
    </article>
  );
}

function AlternateBlock({ title, detail, img, reverse }: { title: string; detail: string; img: string; reverse?: boolean }){
  return (
    <div className={`grid gap-6 items-center sm:grid-cols-2 ${reverse ? 'sm:grid-flow-col-dense' : ''}`}>
      <div className={`${reverse ? 'sm:order-2' : ''}`}>
        <div className="aspect-[16/10] rounded-2xl overflow-hidden shadow-sm border border-border">
          <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        </div>
      </div>
      <div className={`${reverse ? 'sm:order-1 text-right sm:text-left' : ''}`}>
        <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
        <p className="mt-3 text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
