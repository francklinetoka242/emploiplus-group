import React, { useState } from "react";
import { usePageSEO } from "@/features/seo";
import { SecuritySettingsCard } from "@/features/candidates/components/settings/SecuritySettingsCard";
import { AccountSettingsCard } from "@/features/candidates/components/settings/AccountSettingsCard";

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
    <div className="space-y-6 max-w-3xl">
      {statusMessage && (
        <div className={`rounded-md border px-4 py-3 text-sm ${statusType === "success" ? "border-secondary/30 bg-secondary/10 text-brand" : "border-red-200 bg-red-50 text-red-700"}`}>
          {statusMessage}
        </div>
      )}

      <SecuritySettingsCard onStatus={handleStatus} />
      <AccountSettingsCard onStatus={handleStatus} />
    </div>
  );
}
