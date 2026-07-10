import { usePageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PenTool } from "lucide-react";

export function CandidateCreationPage() {
  usePageSEO({
    title: "Création - EmploiPlus Group",
    description: "Choisissez l’outil de création adapté à votre candidature",
    robots: "noindex,nofollow",
  });

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Creation</h1>
      </div>

      <Card className="h-full border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <PenTool className="h-5 w-5 text-secondary" />
            Créer une lettre de motivation
          </CardTitle>
          <CardDescription>
            Concevez une lettre adaptée à chaque offre que vous souhaitez postuler.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Personnalisez votre message pour mettre en avant votre profil et vos objectifs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
