import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { CandidateAuthService } from "@/integrations/supabase/candidate-auth";
import { supabase } from "@/integrations/supabase/client";
import favicon from "@/assets/favicon.ico";

export function CandidateResetPasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  usePageSEO({
    title: "Réinitialiser mot de passe - EmploiPlus Group",
    description: "Créez un nouveau mot de passe pour votre compte EmploiPlus Group",
    canonical: "https://emploiplus.group/#/candidate/reset-password",
  });

  useEffect(() => {
    // Check if there's a valid session (user clicked the link from email)
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await CandidateAuthService.getSession();
      if (session) {
        try {
          const email = session.user?.email ?? null;
          setUserEmail(email);
        } catch (e) {
          setUserEmail(null);
        }
        setIsValidToken(true);
      }
    } catch (err) {
      console.error("Error checking session:", err);
    } finally {
      setCheckingToken(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    else if (formData.password.length < 8)
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await supabase.auth.updateUser({
        password: formData.password,
      });

      // Send password change confirmation email using existing API template
      try {
        const recipient = userEmail || undefined;
        if (recipient) {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipient,
              subject: "Votre mot de passe a été modifié",
              text: "Votre mot de passe a été modifié avec succès. Si vous n'êtes pas à l'origine de ce changement, contactez le support.",
            }),
          });
        }
      } catch (mailErr) {
        console.warn('Failed to send password change email', mailErr);
      }

      setSubmitted(true);
      setTimeout(() => {
        navigate("/candidate/login");
      }, 3000);
    } catch (error: any) {
      const errorMsg = CandidateAuthService.parseErrorMessage(error);
      setErrorMessage(errorMsg);
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border border-slate-200 bg-white">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="inline-block animate-spin">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full"></div>
                </div>
                <p className="text-slate-600">Vérification du lien...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border border-slate-200 bg-white">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">
                    Lien invalide
                  </h3>
                  <p className="text-sm text-slate-600">
                    Le lien de réinitialisation est expiré ou invalide.
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/candidate/forgot-password")}
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-medium"
                >
                  Demander un nouveau lien
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border border-slate-200 bg-white">
          {!submitted ? (
            <>
              <CardHeader className="rounded-t-3xl bg-white text-slate-900 px-8 py-8 text-center border-b border-slate-200">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 border border-slate-200">
                  <img src={favicon} alt="EmploiPlus" className="h-10 w-10 object-contain" />
                </div>
                <CardTitle>Réinitialiser le mot de passe</CardTitle>
                <CardDescription>
                  Entrez votre nouveau mot de passe ci-dessous
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">
                      Nouveau mot de passe
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700">
                      Confirmer le mot de passe
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-medium"
                  >
                    {loading ? "Réinitialisation en cours..." : "Réinitialiser"}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">
                    Mot de passe réinitialisé
                  </h3>
                  <p className="text-sm text-slate-600">
                    Votre mot de passe a été réinitialisé avec succès.
                  </p>
                </div>
                <p className="text-sm text-slate-600">
                  Redirection vers la page de connexion...
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600 mt-6">
          © 2024 EmploiPlus Group. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
