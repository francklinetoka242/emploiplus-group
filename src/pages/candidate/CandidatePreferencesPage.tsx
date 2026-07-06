import React, { useEffect, useState } from "react";
import { usePageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function CandidatePreferencesPage() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") return true;
      if (stored === "light") return false;
      return true;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch (e) {
      // ignore
    }
  }, [darkMode]);

  usePageSEO({
    title: "Préférences - EmploiPlus Group",
    description: "Personnalisez l'affichage de votre espace candidat.",
    robots: "noindex,nofollow",
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
          <CardDescription>Choisissez le thème de l'interface de votre espace candidat.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Mode sombre</p>
                <p className="text-sm text-muted-foreground">Activez le mode sombre pour tout le compte candidat.</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={(value) => setDarkMode(Boolean(value))} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
