import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePageSEO } from "@/features/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { parseAuthErrorMessage } from "@/features/authentication/api/authApi";
import favicon from "@/assets/favicon.ico";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signupSchema, type SignupFormValues } from "@/features/forms/schemas/auth.schemas";

export function CandidateSignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border border-border bg-card">
          <CardHeader className="rounded-t-3xl bg-card text-foreground px-8 py-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-muted border border-border">
                <img src={favicon} alt="EmploiPlus" className="h-6 w-6 object-contain" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-xl">S'inscrire</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Remplissez vos informations pour créer un compte
                </CardDescription>
              </div>
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
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
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
                          <Input {...field} id="password" type="password" placeholder="••••••••" disabled={loading} />
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
                          <Input {...field} id="confirmPassword" type="password" placeholder="••••••••" disabled={loading} />
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
                        <FormLabel htmlFor="agreeTerms" className="text-sm cursor-pointer">
                          J'accepte les conditions d'utilisation et la politique de confidentialité
                        </FormLabel>
                      </div>
                      <FormMessage className="ml-6" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-medium"
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
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2024 EmploiPlus Group. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
