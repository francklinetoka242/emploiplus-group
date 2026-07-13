import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCandidate } from "@/features/candidates/hooks/useCandidate";
import { deleteCandidateProfile } from "@/features/candidates/api/profileApi";

interface AccountSettingsCardProps {
  onStatus: (message: string, type: "success" | "error") => void;
}

export function AccountSettingsCard({ onStatus }: AccountSettingsCardProps) {
  const navigate = useNavigate();
  const { profile } = useCandidate();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteAccount = async () => {
    if (!profile) {
      onStatus("Impossible de supprimer un compte non chargé.", "error");
      return;
    }

    const confirmed = window.confirm("Cette action supprimera définitivement votre profil et vous déconnectera. Continuer ?");
    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteCandidateProfile(profile.id);
      onStatus("Votre compte a été supprimé.", "success");
      navigate("/");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "La suppression du compte a échoué.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-secondary/30 bg-secondary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-brand">
          <AlertTriangle className="w-5 h-5" />
          Gestion du compte
        </CardTitle>
        <CardDescription className="text-brand/80">Zone de danger - Cette action est irréversible</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-red-900">Supprimer votre compte supprimera définitivement toutes vos données. Cette action ne peut pas être annulée.</p>
        <Button className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80" onClick={() => void handleDeleteAccount()} disabled={isDeleting}>
          <Trash2 className="w-4 h-4" />
          {isDeleting ? "Suppression…" : "Supprimer mon compte"}
        </Button>
      </CardContent>
    </Card>
  );
}
