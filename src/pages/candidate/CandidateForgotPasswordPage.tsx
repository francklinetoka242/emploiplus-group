import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePageSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { CandidateAuthService } from "@/integrations/supabase/candidate-auth";
import favicon from "@/assets/favicon.ico";

export function CandidateForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  usePageSEO({
    title: "Mot de passe oublié - EmploiPlus Group",
    description: "Récupérez l'accès à votre compte EmploiPlus Group",
    canonical: "https://emploiplus.group/#/candidate/forgot-password",
  });

  const validateEmail = () => {
    if (!email) {
      setErrors("L'email est requis");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors("Email invalide");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors("");

    if (!validateEmail()) return;

    setLoading(true);
    try {
      await CandidateAuthService.requestPasswordReset(email);
      setSubmitted(true);
    } catch (error: unknown) {
      const errorMsg = CandidateAuthService.parseErrorMessage(error);
      setErrors(errorMsg);
      console.error("Password reset request error:", error);
    } finally {
      setLoading(false);
    }
  };

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
                <CardTitle>Mot de passe oublié</CardTitle>
                <CardDescription className="text-slate-600">
                  Entrez votre email pour recevoir un lien de réinitialisation
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errors && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors}</AlertDescription>
                    </Alert>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors("");
                      }}
                      disabled={loading}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-medium"
                  >
                    {loading ? "Envoi en cours..." : "Envoyer le lien"}
                  </Button>
                </form>

                {/* Back to Login */}
                <div className="mt-6">
                  <Link to="/candidate/login">
                    <Button type="button" variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour à la connexion
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">Email envoyé</h3>
                  <p className="text-sm text-slate-600">
                    Un lien de réinitialisation a été envoyé à:
                  </p>
                  <p className="font-medium text-slate-900 mt-1">{email}</p>
                </div>
                <p className="text-sm text-slate-600">
                  Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser
                  votre mot de passe.
                </p>

                <div className="pt-4 space-y-2">
                  <Link to="/candidate/login">
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium">
                      Retour à la connexion
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                    }}
                  >
                    Essayer un autre email
                  </Button>
                </div>
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
