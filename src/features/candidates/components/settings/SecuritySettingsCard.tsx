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
    <Card className="border-brand/10 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-brand">
          <Lock className="w-5 h-5" />
          Sécurité
        </CardTitle>
        <CardDescription>Gérez votre sécurité</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">Modifiez votre mot de passe pour sécuriser votre compte.</p>
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
  );
}
