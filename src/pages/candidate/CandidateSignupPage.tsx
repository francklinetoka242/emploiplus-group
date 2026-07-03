import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePageSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { CandidateAuthService } from "@/integrations/supabase/candidate-auth";
import favicon from "@/assets/favicon.ico";

export function CandidateSignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  usePageSEO({
    title: "Inscription Candidat - EmploiPlus Group",
    description: "Créez votre compte candidat sur EmploiPlus Group",
    canonical: "https://emploiplus.group/#/candidate/signup",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    setFormData((prev) => ({
      ...prev,
      agreeTerms: checked === true,
    }));
    if (errors.agreeTerms) {
      setErrors((prev) => ({
        ...prev,
        agreeTerms: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Le prénom est requis";
    if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis";
    if (!formData.email) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email invalide";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    else if (formData.password.length < 8)
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    if (!formData.agreeTerms)
      newErrors.agreeTerms = "Vous devez accepter les conditions";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const rawMessage =
          typeof body?.error === 'string'
            ? body.error
            : typeof body?.message === 'string'
            ? body.message
            : body?.error
            ? JSON.stringify(body.error)
            : 'Une erreur est survenue';

        const duplicateEmailMessage =
          resp.status === 422
            ? "Un compte existe déjà pour cette adresse e-mail. Connectez-vous ou utilisez la réinitialisation du mot de passe."
            : rawMessage;

        setErrorMessage(duplicateEmailMessage);
        console.error('Register API error', resp.status, body);
      } else {
        navigate('/candidate/login', {
          replace: true,
          state: {
            notification:
              "Inscription réussie ! Un email de confirmation a été envoyé. Vérifiez votre boîte de réception (le lien expire au bout de 24 heures). Si vous ne le recevez pas, demandez un renvoi sur la page de connexion.",
            pendingEmail: formData.email,
          },
        });
      }
    } catch (error: any) {
      const errorMsg = CandidateAuthService.parseErrorMessage(error);
      setErrorMessage(typeof errorMsg === 'string' ? errorMsg : String(errorMsg));
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border border-slate-200 bg-white">
          <CardHeader className="rounded-t-3xl bg-white text-slate-900 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 border border-slate-200">
                <img src={favicon} alt="EmploiPlus" className="h-6 w-6 object-contain" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-xl">S'inscrire</CardTitle>
                <CardDescription className="text-slate-600 text-sm">Remplissez vos informations pour créer un compte</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errorMessage}
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
              {/* First and Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700">
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="prenom"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={loading}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700">
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="nom"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>

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

              {/* Password and Confirm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={handleCheckboxChange}
                  disabled={loading}
                  className="mt-1"
                />
                <Label htmlFor="agreeTerms" className="text-sm cursor-pointer">
                  J'accepte les conditions d'utilisation et la politique de
                  confidentialité
                </Label>
              </div>
              {errors.agreeTerms && (
                <p className="text-sm text-red-500">{errors.agreeTerms}</p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-medium"
              >
                {loading ? "Inscription en cours..." : "S'inscrire"}
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

            {/* Login Link */}
            <div className="text-center text-sm">
              <p className="text-slate-600">
                Vous avez déjà un compte?{" "}
                <Link
                  to="/candidate/login"
                  className="text-brand font-semibold hover:text-brand/80"
                >
                  Se connecter
                </Link>
              </p>
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
