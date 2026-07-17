import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePageSEO } from "@/features/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { parseAuthErrorMessage, resendConfirmationEmail } from "@/features/authentication/api/authApi";
import { useAuth } from "@/features/authentication/hooks/useAuth";
import favicon from "@/assets/favicon.ico";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginSchema, type LoginFormValues } from "@/features/forms/schemas/auth.schemas";

export function CandidateLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state as { notification?: string; pendingEmail?: string; from?: string } | null;
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(state?.notification || "");
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(state?.pendingEmail || "");
  const [showPendingResend, setShowPendingResend] = useState(Boolean(state?.pendingEmail));
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const { login } = useAuth();

  useEffect(() => {
    if (searchParams.get("confirmed") === "true") {
      setEmailConfirmed(true);
      // Remove the confirmed parameter from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  usePageSEO({
    title: "Connexion Candidat - EmploiPlus Group",
    description: "Connectez-vous à votre compte candidat sur EmploiPlus Group",
    canonical: "https://emploiplus.group/#/candidate/login",
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setErrorMessage("");
    setSuccessMessage("");
    setEmailNotConfirmed(false);

    setLoading(true);
    try {
      await login(values.email, values.password);

      setSuccessMessage("Connexion réussie! Redirection en cours...");
      navigate(state?.from || "/candidate/dashboard", { replace: true });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "EMAIL_NOT_CONFIRMED"
      ) {
        setEmailNotConfirmed(true);
        setPendingEmail((error as { userEmail?: string }).userEmail || values.email);
        setErrorMessage("Veuillez confirmer votre email avant de vous connecter");
      } else {
        const errorMsg = parseAuthErrorMessage(error);
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
      await resendConfirmationEmail(pendingEmail);
      setSuccessMessage("Email de confirmation renvoyé! Vérifiez votre boîte de réception.");
      setEmailNotConfirmed(false);
    } catch (error: unknown) {
      const errorMsg = parseAuthErrorMessage(error);
      setErrorMessage(errorMsg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border border-border bg-card">
          <CardHeader className="rounded-t-3xl bg-card text-foreground px-8 py-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-muted border border-border">
                <img src={favicon} alt="EmploiPlus" className="h-6 w-6 object-contain" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-xl">Se connecter</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Entrez vos identifiants pour accéder à votre espace
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {emailConfirmed && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold">
                      ✅ Votre adresse e-mail a été confirmée avec succès.
                    </span>
                    <span>Vous pouvez maintenant vous connecter.</span>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="flex flex-col gap-3">
                    <span>{errorMessage}</span>
                    {(emailNotConfirmed || showPendingResend) && (
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
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            {showPendingResend && pendingEmail && !emailNotConfirmed && (
              <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Vous n'avez pas encore confirmé votre email. Si vous n'avez pas reçu le message,
                  renvoyez-le ci-dessous.
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={resending}
                      onClick={handleResendEmail}
                      className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                    >
                      {resending ? "Envoi en cours..." : "Renvoyer l'email de confirmation"}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="votre@email.com"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Mot de passe</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            id="rememberMe"
                            checked={field.value === true}
                            onCheckedChange={(checked) => {
                              field.onChange(checked === true);
                            }}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormLabel htmlFor="rememberMe" className="text-sm cursor-pointer">
                          Se souvenir de moi
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-medium"
                >
                  {loading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Ou</span>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-3">
              <Link to="/candidate/forgot-password" className="block">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-brand hover:text-brand/80 hover:bg-brand/5"
                >
                  Mot de passe oublié?
                </Button>
              </Link>

              <div className="text-center text-sm">
                <p className="text-muted-foreground">
                  Pas encore de compte?{" "}
                  <Link
                    to={{ pathname: "/candidate/signup", state: { from: state?.from } }}
                    className="text-brand font-semibold hover:text-brand/80 inline-block"
                  >
                    S'inscrire
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2024 EmploiPlus Group. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
