import { useState } from "react";
import { ArrowRight, BadgeCheck, Check, Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const plans = [
  {
    name: "Gratuit",
    price: "0 FCFA",
    description:
      "Les essentiels pour préparer vos candidatures et comprendre votre positionnement.",
    icon: BadgeCheck,
    features: ["Analyse CV ↔ offre", "Score de compatibilité", "Forces et lacunes du profil"],
    action: "Découvrir les fonctionnalités",
    href: "/candidate/subscription/free",
  },
  {
    name: "Premium",
    price: "550 FCFA",
    description: "Pour aller plus loin dans votre recherche d’emploi.",
    icon: Sparkles,
    features: [
      "Jusqu’à 7 recommandations",
      "Accès à davantage de correspondances",
      "Parcours candidat enrichi",
    ],
    featured: true,
    action: "Découvrir Premium",
    href: "/candidate/subscription/premium",
  },
  {
    name: "Premium+",
    price: "1 050 FCFA",
    description: "Pour accéder à l’ensemble des opportunités correspondant à votre profil.",
    icon: Crown,
    features: [
      "Toutes les recommandations disponibles",
      "Aucune limite artificielle",
      "Accès complet aux correspondances",
      "Alertes e-mail",
    ],
    action: "Découvrir Premium+",
    href: "/candidate/subscription/premium-plus",
  },
];

export function CandidateSubscriptionPage() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="mx-auto mt-6 w-full max-w-6xl pb-8">
      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.name}
              className={`relative flex min-w-0 flex-col overflow-hidden ${plan.featured ? "border-primary shadow-lg lg:-translate-y-2" : "border-border/80"}`}
            >
              {plan.featured && (
                <div className="bg-primary px-5 py-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground">
                  Le plus choisi
                </div>
              )}
              <CardHeader className="space-y-3 p-5 pt-4 sm:p-6 sm:pt-5">
                <div className="flex items-center justify-between gap-3">
                  {plan.featured && <Badge className="rounded-full">Premium</Badge>}
                </div>
                <div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/ mois</span>
                  </div>
                  <CardDescription className="mt-3 leading-6">{plan.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 px-5 sm:px-6">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{" "}
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-5 pt-6 sm:p-6 sm:pt-6">
                {plan.href ? (
                  <Button asChild className="w-full gap-2">
                    <Link to={plan.href}>
                      {plan.action}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant={plan.featured ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setNotice(`${plan.name} sera disponible prochainement.`)}
                  >
                    Bientôt disponible
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary"
        >
          {notice}
        </p>
      )}
    </div>
  );
}
