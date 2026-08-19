import React, { useState } from "react";
import { usePageSEO } from "@/features/seo";
import { SecuritySettingsCard } from "@/features/candidates/components/settings/SecuritySettingsCard";
import { AccountSettingsCard } from "@/features/candidates/components/settings/AccountSettingsCard";
import { Settings } from "lucide-react";

export function CandidateSettingsPage() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error">("success");

  usePageSEO({
    title: "Paramètres - EmploiPlus Group",
    description: "Gérez vos paramètres de compte",
    robots: "noindex,nofollow",
  });

  const handleStatus = (message: string, type: "success" | "error") => {
    setStatusMessage(message);
    setStatusType(type);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="overflow-hidden rounded-3xl border border-primary/15 bg-card shadow-sm">
        <div className="flex items-center gap-3 bg-primary/[0.03] px-4 py-3 sm:px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Settings className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Paramètres du compte</h1>
            <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
              Gérez la sécurité et les options de votre espace candidat.
            </p>
          </div>
        </div>
      </div>
      {statusMessage && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${statusType === "success" ? "border-primary/20 bg-primary/5 text-primary" : "border-destructive/20 bg-destructive/5 text-destructive"}`}>
          {statusMessage}
        </div>
      )}

      <SecuritySettingsCard onStatus={handleStatus} />
      <AccountSettingsCard onStatus={handleStatus} />
    </div>
  );
}
