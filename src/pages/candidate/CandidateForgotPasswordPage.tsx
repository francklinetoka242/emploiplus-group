import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePageSEO } from "@/features/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { parseAuthErrorMessage, requestPasswordReset } from "@/features/authentication/api/authApi";
import favicon from "@/assets/favicon.ico";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/features/forms/schemas/auth.schemas";

export function CandidateForgotPasswordPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  usePageSEO({
    title: "Mot de passe oublié - EmploiPlus Group",
    description: "Récupérez l'accès à votre compte EmploiPlus Group",
    canonical: "https://emploiplus.group/#/candidate/forgot-password",
  });

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setErrors("");

    setLoading(true);
    try {
      await requestPasswordReset(values.email);
      setSubmitted(true);
    } catch (error: unknown) {
      const errorMsg = parseAuthErrorMessage(error);
      setErrors(errorMsg);
      console.error("Password reset request error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border border-border bg-card">
          {!submitted ? (
            <>
              <CardHeader className="rounded-t-3xl bg-card text-foreground px-8 py-8 text-center border-b border-border">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted border border-border">
                  <img src={favicon} alt="EmploiPlus" className="h-10 w-10 object-contain" />
                </div>
                <CardTitle>Mot de passe oublié</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Entrez votre email pour recevoir un lien de réinitialisation
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
                    {errors && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors}</AlertDescription>
                      </Alert>
                    )}

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

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-medium"
                    >
                      {loading ? "Envoi en cours..." : "Envoyer le lien"}
                    </Button>
                  </form>
                </Form>

                {/* Back to Login */}
                <div className="mt-6">
                  <Link to="/candidate/login" className="block">
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
                  <p className="font-medium text-slate-900 mt-1">{form.getValues("email")}</p>
                </div>
                <p className="text-sm text-slate-600">
                  Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser
                  votre mot de passe.
                </p>

                <div className="pt-4 space-y-2">
                  <Link to="/candidate/login" className="block">
                    <Button type="button" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium">
                      Retour à la connexion
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSubmitted(false);
                      form.reset({ email: "" });
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
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2024 EmploiPlus Group. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
