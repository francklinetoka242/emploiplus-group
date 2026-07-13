import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { useCandidate } from "@/hooks/useCandidate";

export function ProfessionalPresentationSection() {
  const { profile, loading, updateProfile } = useCandidate();
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHeadline(profile?.headline ?? "");
    setBio(profile?.bio ?? "");
  }, [profile?.headline, profile?.bio]);

  const handleSave = async () => {
    if (!profile) {
      setError("Profil non chargé.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateProfile({ headline: headline || null, bio: bio || null });
      setSuccess("Présentation mise à jour.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {success && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 ml-2">{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert className="border-rose-200 bg-rose-50">
          <AlertDescription className="text-rose-800">{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ma présentation professionnelle</CardTitle>
          <CardDescription>Renseignez votre objectif et résumé professionnel (utilisable pour les candidatures).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Objectif professionnel</Label>
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Ex: Chef de projet - Transformation digitale" />
            </div>

            <div className="space-y-2">
              <Label>Résumé professionnel</Label>
              <Textarea rows={6} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Présentez brièvement votre parcours et vos atouts professionnels..." />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="bg-cyan-600 text-white">
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfessionalPresentationSection;
