import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import type { ProfileCompletionResult } from "../../types";

interface CompletionSectionProps {
  completion: ProfileCompletionResult;
}

const completionItemRoutes: Record<string, string> = {
  "Nom complet": "/candidate/profile?tab=profile",
  "Titre professionnel": "/candidate/profile?tab=profile",
  Localisation: "/candidate/profile?tab=profile",
  "Résumé professionnel": "/candidate/profile?tab=presentation",
  "Photo de profil": "/candidate/profile?tab=profile",
  "Expérience professionnelle": "/candidate/profile?tab=experience",
  Formation: "/candidate/profile?tab=education",
  Compétence: "/candidate/profile?tab=skills",
  Langue: "/candidate/profile?tab=languages",
  "Préférences RH": "/candidate/profile?tab=preferences",
};

export function CompletionSection({ completion }: CompletionSectionProps) {
  return (
    <Card className="overflow-hidden border-primary/15 shadow-sm">
      <CardHeader className="bg-primary/[0.03] pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">Complétude du profil</CardTitle>
            <CardDescription className="mt-1">Suivez votre progression et améliorez votre visibilité.</CardDescription>
          </div>
          <span className="shrink-0 rounded-lg bg-primary/10 px-3 py-2 text-lg font-bold text-primary">
            {completion.completionPercentage}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="space-y-2.5">
          <div className="text-sm font-medium text-foreground">Progression globale</div>
          <Progress value={completion.completionPercentage} className="h-2.5" />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-foreground">État du profil</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {completion.completionItems.map((item) => (
              <a
                key={item.label}
                href={completionItemRoutes[item.label] ?? "/candidate/profile?tab=profile"}
                className={`group flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-sm ${
                  item.isCompleted
                    ? "border-primary/20 bg-primary/5 text-foreground"
                    : "border-border bg-muted/40 text-muted-foreground"
                }`}
              >
                {item.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 flex-shrink-0 text-muted-foreground/60" />
                )}
                <span className="flex-1 font-medium">{item.label}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </a>
            ))}
          </div>
        </div>

        {completion.completionPercentage === 100 && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm font-medium text-primary">
            ✓ Votre profil est complet !
          </div>
        )}
      </CardContent>
    </Card>
  );
}
