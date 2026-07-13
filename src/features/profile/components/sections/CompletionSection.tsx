import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import type { ProfileCompletionResult } from "../../types";

interface CompletionSectionProps {
  completion: ProfileCompletionResult;
}

export function CompletionSection({ completion }: CompletionSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complétude du profil</CardTitle>
        <CardDescription>Suivez votre progression et améliorez votre visibilité.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
            <span>Progression globale</span>
            <span>{completion.completionPercentage}%</span>
          </div>
          <Progress value={completion.completionPercentage} className="h-2" />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">État du profil</p>
          <ul className="space-y-2">
            {completion.completionItems.map((item) => (
              <li
                key={item.label}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                  item.isCompleted
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-50 text-slate-600"
                }`}
              >
                {item.isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                )}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {completion.completionPercentage === 100 && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 font-medium">
            ✓ Votre profil est complet !
          </div>
        )}
      </CardContent>
    </Card>
  );
}
