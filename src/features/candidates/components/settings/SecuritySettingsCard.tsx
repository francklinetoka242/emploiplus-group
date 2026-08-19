import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { changeCandidatePassword } from "@/features/authentication/api/authApi";

interface SecuritySettingsCardProps {
  onStatus: (message: string, type: "success" | "error") => void;
}

export function SecuritySettingsCard({ onStatus }: SecuritySettingsCardProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      onStatus("Le nouveau mot de passe doit contenir au moins 6 caractères.", "error");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      onStatus("La confirmation du mot de passe ne correspond pas.", "error");
      return;
    }

    try {
      setIsChangingPassword(true);
      await changeCandidatePassword(passwordForm.newPassword);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
      onStatus("Votre mot de passe a été mis à jour.", "success");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "La modification du mot de passe a échoué.", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Card className="border-primary/15 shadow-sm">
      <CardHeader className="bg-primary/[0.03] pb-5">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Lock className="h-5 w-5" />
          Sécurité
        </CardTitle>
        <CardDescription className="mt-1">Protégez l’accès à votre espace candidat.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-5 sm:p-6">
        <p className="text-sm leading-6 text-muted-foreground">Modifiez votre mot de passe pour sécuriser votre compte.</p>
        {showPasswordForm ? (
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input id="newPassword" type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input id="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isChangingPassword} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isChangingPassword ? "Mise à jour…" : "Enregistrer le mot de passe"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowPasswordForm(false)} disabled={isChangingPassword} className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary">
                Annuler
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary" onClick={() => setShowPasswordForm(true)}>
            <Lock className="w-4 h-4" />
            Modifier le mot de passe
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
