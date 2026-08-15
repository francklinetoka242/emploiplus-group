import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AccountSettingsCardProps {
  onStatus: (message: string, type: "success" | "error") => void;
}

export function AccountSettingsCard({ onStatus }: AccountSettingsCardProps) {
  void onStatus;

  return (
    <Card className="border-secondary/30 bg-secondary/10">
      <CardContent className="py-6 text-sm text-muted-foreground">
        Aucun paramètre de gestion du compte à afficher pour le moment.
      </CardContent>
    </Card>
  );
}
