import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePageSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { CandidateAuthService } from "@/integrations/supabase/candidate-auth";
import favicon from "@/assets/favicon.ico";

export function CandidateLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    (location.state as { notification?: string } | null)?.notification || ""
  );
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  usePageSEO({
    title: "Connexion Candidat - EmploiPlus Group",
    description: "Connectez-vous à votre compte candidat sur EmploiPlus Group",
    canonical: "https://emploiplus.group/#/candidate/login",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRememberMeChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      rememberMe: checked,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email invalide";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setEmailNotConfirmed(false);

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await CandidateAuthService.login({
        email: formData.email,
        password: formData.password,
      });

      setSuccessMessage("Connexion réussie! Redirection en cours...");
      navigate("/candidate/dashboard", { replace: true });
    } catch (error: any) {
      if (error?.code === 'EMAIL_NOT_CONFIRMED') {
        setEmailNotConfirmed(true);
        setPendingEmail(error?.userEmail || formData.email);
        setErrorMessage("Veuillez confirmer votre email avant de vous connecter");
      } else {
        const errorMsg = CandidateAuthService.parseErrorMessage(error);
        setErrorMessage(errorMsg);
      }
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await CandidateAuthService.resendConfirmationEmail(pendingEmail);
      setSuccessMessage("Email de confirmation renvoyé! Vérifiez votre boîte de réception.");
      setEmailNotConfirmed(false);
    } catch (error: any) {
      const errorMsg = CandidateAuthService.parseErrorMessage(error);
      setErrorMessage(errorMsg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border border-slate-200 bg-white">
          <CardHeader className="rounded-t-3xl bg-white text-slate-900 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 border border-slate-200">
                <img src={favicon} alt="EmploiPlus" className="h-6 w-6 object-contain" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-xl">Se connecter</CardTitle>
                <CardDescription className="text-slate-600 text-sm">Entrez vos identifiants pour accéder à votre espace</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="flex flex-col gap-3">
                    <span>{errorMessage}</span>
                    {emailNotConfirmed && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={resending}
                        onClick={handleResendEmail}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        {resending ? "Envoi en cours..." : "Renvoyer l'email de confirmation"}
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  Mot de passe
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

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={handleRememberMeChange}
                  disabled={loading}
                />
                <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                  Se souvenir de moi
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-medium"
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-600">Ou</span>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-3">
              <Link to="/candidate/forgot-password">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-brand hover:text-brand/80 hover:bg-brand/5"
                >
                  Mot de passe oublié?
                </Button>
              </Link>

              <div className="text-center text-sm">
                <p className="text-slate-600">
                  Pas encore de compte?{" "}
                  <Link
                    to="/candidate/signup"
                    className="text-brand font-semibold hover:text-brand/80"
                  >
                    S'inscrire
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600 mt-6">
          © 2024 EmploiPlus Group. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
