import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageSEO } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Lock, Trash2, AlertTriangle } from "lucide-react";
import { useCandidate } from "@/hooks/useCandidate";
import { CandidateAuthService } from "@/integrations/supabase/candidate-auth";

export function CandidateSettingsPage() {
  const navigate = useNavigate();
  const { profile } = useCandidate();

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  usePageSEO({
    title: "Paramètres - EmploiPlus Group",
    description: "Gérez vos paramètres de compte",
    robots: "noindex,nofollow",
  });

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      setStatusType("error");
      setStatusMessage("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusType("error");
      setStatusMessage("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    setIsChangingPassword(true);
    setStatusMessage(null);

    try {
      await CandidateAuthService.changePassword(passwordForm.newPassword);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
      setStatusType("success");
      setStatusMessage("Votre mot de passe a été mis à jour.");
    } catch (err) {
      setStatusType("error");
      setStatusMessage(err instanceof Error ? err.message : "La modification du mot de passe a échoué.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile) {
      setStatusType("error");
      setStatusMessage("Impossible de supprimer un compte non chargé.");
      return;
    }

    const confirmed = window.confirm("Cette action supprimera définitivement votre profil et vous déconnectera. Continuer ?");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setStatusMessage(null);

    try {
      await CandidateAuthService.deleteCurrentProfile(profile.id);
      setStatusType("success");
      setStatusMessage("Votre compte a été supprimé.");
      navigate("/");
    } catch (err) {
      setStatusType("error");
      setStatusMessage(err instanceof Error ? err.message : "La suppression du compte a échoué.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-600">Gérez vos paramètres de compte et de sécurité</p>
      </div>

      {statusMessage && (
        <div className={`rounded-md border px-4 py-3 text-sm ${statusType === "success" ? "border-secondary/30 bg-secondary/10 text-brand" : "border-red-200 bg-red-50 text-red-700"}`}>
          {statusMessage}
        </div>
      )}

      <Card className="border-brand/10 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand">
            <Lock className="w-5 h-5" />
            Sécurité
          </CardTitle>
          <CardDescription>Gérez votre sécurité</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600 text-sm">
            Modifiez votre mot de passe pour sécuriser votre compte.
          </p>
          {showPasswordForm ? (
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isChangingPassword} className="bg-brand text-brand-foreground hover:bg-brand/90">
                  {isChangingPassword ? "Mise à jour…" : "Enregistrer le mot de passe"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowPasswordForm(false)} disabled={isChangingPassword} className="border-brand/30 text-brand hover:bg-brand/5 hover:text-brand">
                  Annuler
                </Button>
              </div>
            </form>
          ) : (
            <Button variant="outline" className="gap-2 border-brand/30 text-brand hover:bg-brand/5 hover:text-brand" onClick={() => setShowPasswordForm(true)}>
              <Lock className="w-4 h-4" />
              Modifier le mot de passe
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-secondary/30 bg-secondary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand">
            <AlertTriangle className="w-5 h-5" />
            Gestion du compte
          </CardTitle>
          <CardDescription className="text-brand/80">
            Zone de danger - Cette action est irréversible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-900 text-sm mb-4">
            Supprimer votre compte supprimera définitivement toutes vos données. Cette action ne peut pas être annulée.
          </p>
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 gap-2" onClick={handleDeleteAccount} disabled={isDeleting}>
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Suppression…" : "Supprimer mon compte"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
