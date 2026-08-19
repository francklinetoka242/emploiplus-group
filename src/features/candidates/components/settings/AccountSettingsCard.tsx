import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SlidersHorizontal } from "lucide-react";

interface AccountSettingsCardProps {
  onStatus: (message: string, type: "success" | "error") => void;
}

export function AccountSettingsCard({ onStatus }: AccountSettingsCardProps) {
  void onStatus;

  return (
    <Card className="border-border/80 bg-card shadow-sm">
      <CardContent className="flex items-start gap-3 p-5 sm:p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Gestion du compte</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Aucun paramètre de gestion du compte à afficher pour le moment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
