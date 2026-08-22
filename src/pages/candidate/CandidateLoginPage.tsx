import React, { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePageSEO } from "@/features/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Facebook, Linkedin, MessageSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { parseAuthErrorMessage, resendConfirmationEmail } from "@/features/authentication/api/authApi";
import { useAuth } from "@/features/authentication/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/features/forms/schemas/auth.schemas";
import { openCookieBanner } from "@/components/site/CookieConsentBanner";

const CANDIDATE_ONBOARDING_PENDING_KEY = "emploiplus_candidate_onboarding_pending";
const CANDIDATE_ONBOARDING_COMPLETED_KEY = "emploiplus_candidate_onboarding_completed";

export function CandidateLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state as { notification?: string; pendingEmail?: string; from?: string } | null;
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const redirectAttemptedRef = useRef(false);
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const { login, user, isAuthenticated, rolesResolved } = useAuth();

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    await handleSubmit(onSubmit)();
  };

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

  const onSubmit = async (values: LoginFormValues) => {
    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    setErrorMessage("");
    setSuccessMessage("");
    setEmailNotConfirmed(false);

    setIsLoading(true);
    try {
      await login(values.email, values.password);
      setSuccessMessage("Connexion réussie! Redirection en cours...");
      // Redirection will be handled by orchestration below (rolesResolved watch)
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
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  /**
   * Orchestration: Handle post-login redirection to dashboard.
   *
   * Triggers when:
   * 1. User is authenticated (session exists)
   * 2. rolesResolved = true (session + user + candidate access all determined)
   * 3. Current page is /candidate/login
   *
   * Only navigates once per login (using redirectAttemptedRef).
   *
   * Note: rolesResolved is now stable — it combines authLoading and
   * candidateAccessResolved, ensuring candidate roles are ready before navigation.
   */
  useEffect(() => {
    // Exit if not on login page or still initializing
    if (location.pathname !== "/candidate/login") {
      return;
    }

    // Exit if not authenticated
    if (!isAuthenticated) {
      redirectAttemptedRef.current = false; // Reset for future logins
      return;
    }

    // Exit if still resolving roles/permissions
    if (!rolesResolved) {
      return;
    }

    // Prevent multiple navigations
    if (redirectAttemptedRef.current) {
      return;
    }

    redirectAttemptedRef.current = true;

    const hasConfirmedEmail = Boolean(user?.email_confirmed_at);
    const hasCompletedOnboarding =
      typeof window !== "undefined" &&
      window.localStorage.getItem(CANDIDATE_ONBOARDING_COMPLETED_KEY) === "true";

    if (hasConfirmedEmail && !hasCompletedOnboarding) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(CANDIDATE_ONBOARDING_PENDING_KEY, "true");
      }
      navigate("/candidate/onboarding", { replace: true });
      return;
    }

    navigate(state?.from || "/candidate/dashboard", { replace: true });
  }, [isAuthenticated, rolesResolved, location.pathname, navigate, state?.from, user?.email_confirmed_at]);

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
        <div className="w-full max-w-md">
          <Card className="candidate-auth-card rounded-lg border border-border bg-card shadow-xl">
          <CardHeader className="rounded-t-lg bg-card px-8 py-6 text-foreground">
            <div className="flex flex-col items-center text-center">
              <CardTitle className="card-title text-xl">Se connecter</CardTitle>
              <CardDescription className="card-description text-muted-foreground text-sm">
                Entrez vos identifiants pour accéder à votre espace
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {emailConfirmed && (
              <Alert className="mb-4 border-secondary/40 bg-secondary/10">
                <CheckCircle2 className="h-4 w-4 text-secondary-foreground" />
                <AlertDescription className="text-secondary-foreground">
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
              <Alert className="mb-4 border-secondary/40 bg-secondary/10">
                <CheckCircle2 className="h-4 w-4 text-secondary-foreground" />
                <AlertDescription className="text-secondary-foreground">{successMessage}</AlertDescription>
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

              <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
                <div>
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                  <Input
                    {...register("email")}
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-slate-700">Mot de passe</Label>
                  <Input
                    {...register("password")}
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    {...register("rememberMe")}
                    id="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 rounded border border-border text-brand focus:ring-brand"
                    disabled={isLoading}
                  />
                  <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                    Se souvenir de moi
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="auth-submit-button w-full bg-brand text-brand-foreground hover:bg-brand/90 font-medium"
                >
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs font-normal leading-5 text-muted-foreground">
                En continuant, vous acceptez les{" "}
                <Link to="/cgu" className="font-normal text-brand hover:underline">
                  Conditions Générales d'Utilisation
                </Link>{" "}
                et la{" "}
                <Link to="/politique-de-confidentialite" className="font-normal text-brand hover:underline">
                  politique de confidentialité
                </Link>{" "}
                et la{" "}
                <button type="button" onClick={openCookieBanner} className="font-normal text-brand hover:underline">
                  Gestion des cookies
                </button>{" "}
                de Emploisplus-group
              </p>

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
        </div>
      </main>

      <footer className="w-full px-3 py-4 text-[9px] text-muted-foreground sm:px-6 sm:text-xs">
        <div className="flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center leading-5 sm:flex-nowrap sm:justify-between sm:gap-3 sm:text-left">
            <Link to="/politique-de-confidentialite" className="transition-colors hover:text-foreground">
              Politique de Confidentialité
            </Link>
            <Link to="/mentions-legales" className="transition-colors hover:text-foreground">
              Mentions Légales
            </Link>
            <Link to="/cgu" className="transition-colors hover:text-foreground">
              Conditions Générales d'Utilisation
            </Link>
            <a
              href="https://support.emploiplus-group.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Centre d'aide
            </a>
            <button type="button" onClick={openCookieBanner} className="transition-colors hover:text-foreground">
              Gestion des cookies
            </button>
            <a href="tel:+242067311033" className="transition-colors hover:text-foreground">
              Contact
            </a>
            <a
              href="https://whatsapp.com/channel/0029VbBQ1qtATRSfKsByJC43"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <MessageSquare className="size-3.5" />
              WhatsApp
            </a>
            <a
              href="https://whatsapp.com/channel/0029Vb5pc270VycKAb1tc631"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <MessageSquare className="size-3.5" />
              WhatsApp
            </a>
            <span className="h-3 w-px bg-border" aria-hidden="true" />
            <a
              href="https://www.facebook.com/EmploiplusConsulting"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="transition-colors hover:text-foreground"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href="https://www.linkedin.com/company/emploiplus-consulting/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="transition-colors hover:text-foreground"
            >
              <Linkedin className="size-4" />
            </a>
            <span className="text-center">© {new Date().getFullYear()} EmploiPlus Group. Tous droits réservés.</span>
        </div>
      </footer>
    </div>
  );
}
