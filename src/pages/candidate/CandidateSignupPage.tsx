import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePageSEO } from "@/features/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { parseAuthErrorMessage } from "@/features/authentication/api/authApi";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signupSchema, type SignupFormValues } from "@/features/forms/schemas/auth.schemas";
import { openCookieBanner } from "@/components/site/CookieConsentBanner";

export function CandidateSignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string } | null;
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  usePageSEO({
    title: "Inscription Candidat - EmploiPlus Group",
    description: "Créez votre compte candidat sur EmploiPlus Group",
    canonical: "https://emploiplus.group/#/candidate/signup",
  });

  const handleSubmit = async (values: SignupFormValues) => {
    setErrorMessage("");
    setSuccessMessage("");

    setLoading(true);
    try {
      const resp = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
        }),
      });

      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const rawMessage =
          typeof body?.error === "string"
            ? body.error
            : typeof body?.message === "string"
              ? body.message
              : body?.error
                ? JSON.stringify(body.error)
                : "Une erreur est survenue";

        const duplicateEmailMessage =
          resp.status === 422
            ? "Un compte existe déjà pour cette adresse e-mail. Connectez-vous ou utilisez la réinitialisation du mot de passe."
            : rawMessage;

        setErrorMessage(duplicateEmailMessage);
        console.error("Register API error", resp.status, body);
      } else {
        navigate("/candidate/login", {
          replace: true,
          state: {
            notification:
              "Inscription réussie ! Un email de confirmation a été envoyé. Vérifiez votre boîte de réception (le lien expire au bout de 24 heures). Si vous ne le recevez pas, demandez un renvoi sur la page de connexion.",
            pendingEmail: values.email,
          },
        });
      }
    } catch (error: unknown) {
      const errorMsg = parseAuthErrorMessage(error);
      setErrorMessage(errorMsg);
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="candidate-auth-page flex min-h-screen flex-col bg-background">
      <header className="flex h-16 w-full items-center border-b border-border px-4 sm:px-6">
        <Link to="/" aria-label="EmploiPlus Group - Retour à l'accueil" className="group flex items-center gap-3">
          <img
            src="/Logo.png"
            alt="EmploiPlus Group"
            className="h-9 w-9 rounded-lg object-cover shadow-brand"
          />
          <div className="hidden leading-tight sm:block">
            <div className="font-display font-bold text-foreground">EmploiPlus</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Group</div>
          </div>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="candidate-auth-card rounded-lg border border-border bg-card shadow-xl">
          <CardHeader className="rounded-t-lg bg-card px-8 py-6 text-foreground">
            <div className="flex flex-col items-center text-center">
              <CardTitle className="card-title text-xl">S'inscrire</CardTitle>
              <CardDescription className="card-description text-muted-foreground text-sm">
                Remplissez vos informations pour créer un compte
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mb-4 border-secondary/40 bg-secondary/10">
                <CheckCircle2 className="h-4 w-4 text-secondary-foreground" />
                <AlertDescription className="text-secondary-foreground">{successMessage}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Prénom</FormLabel>
                        <FormControl>
                          <Input {...field} id="firstName" type="text" placeholder="prenom" disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Nom</FormLabel>
                        <FormControl>
                          <Input {...field} id="lastName" type="text" placeholder="nom" disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Email</FormLabel>
                      <FormControl>
                        <Input {...field} id="email" type="email" placeholder="votre@email.com" disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pr-11"
                              disabled={loading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((visible) => !visible)}
                              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
                              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                              {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pr-11"
                              disabled={loading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((visible) => !visible)}
                              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
                              aria-label={showConfirmPassword ? "Masquer la confirmation du mot de passe" : "Afficher la confirmation du mot de passe"}
                            >
                              {showConfirmPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="agreeTerms"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox
                            id="agreeTerms"
                            checked={field.value === true}
                            onCheckedChange={(checked) => {
                              field.onChange(checked === true);
                            }}
                            disabled={loading}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormLabel htmlFor="agreeTerms" className="cursor-pointer text-xs font-normal leading-5">
                          En cliquant sur Accepter et s’inscrire ou sur Continuer, vous acceptez les{" "}
                          <Link to="/cgu" className="link link-animated font-normal text-brand">
                            Conditions Générales d'Utilisation
                          </Link>{" "}
                          et la{" "}
                          <Link to="/politique-de-confidentialite" className="link link-animated font-normal text-brand">
                            politique de confidentialité
                          </Link>{" "}
                          et la{" "}
                          <button type="button" onClick={openCookieBanner} className="font-normal text-brand hover:underline">
                            Gestion des cookies
                          </button>{" "}
                          de Emploisplus-group
                        </FormLabel>
                      </div>
                      <FormMessage className="ml-6" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="auth-submit-button mx-auto flex w-fit min-w-40 bg-brand px-8 text-brand-foreground hover:bg-brand/90 font-medium"
                >
                  {loading ? "Inscription en cours..." : "S'inscrire"}
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

            {/* Login Link */}
            <div className="text-center text-sm">
              <p className="text-muted-foreground">
                Vous avez déjà un compte?{" "}
                <Link
                  to={{ pathname: "/candidate/login", state: { from: state?.from } }}
                  className="text-brand font-semibold hover:text-brand/80"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
          </Card>
        </div>
      </main>

    </div>
  );
}
