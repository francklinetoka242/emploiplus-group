import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import favicon from "@/assets/favicon.ico";
import { clearAuthStorage } from "@/features/authentication/utils/authStorage";

export function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [authDetail, setAuthDetail] = React.useState<string | null>(null);

  React.useEffect(() => {
    clearAuthStorage();
    void supabase.auth.signOut().catch(() => undefined);
  }, []);

  React.useEffect(() => {
    const state = location.state as
      | {
          authError?: string;
          authReason?: string;
          authCurrentRoles?: string;
          authCurrentPermissions?: string;
        }
      | null;

    if (state?.authError === "unauthorized") {
      setError(
        `${
          t("auth.error.unauthorized") ?? "Accès refusé : vous n'avez pas les permissions nécessaires pour accéder à cette page."
        } ${state.authReason ?? ""}`.trim(),
      );
      setAuthDetail(
        state.authCurrentRoles
          ? `Rôles détectés : ${state.authCurrentRoles}`
          : state.authCurrentPermissions
          ? `Permissions détectées : ${state.authCurrentPermissions}`
          : null,
      );
    }
  }, [location.state, t]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setAuthDetail(null);

    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    if (!normalizedEmail) {
      setError(t("auth.error.emailRequired") ?? "Veuillez saisir votre adresse email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError(t("auth.error.invalidEmail") ?? "Veuillez saisir une adresse email valide.");
      return;
    }

    if (!normalizedPassword) {
      setError(t("auth.error.passwordRequired") ?? "Veuillez saisir votre mot de passe.");
      return;
    }

    setLoading(true);
    setMessage(null);

    clearAuthStorage();
    await supabase.auth.signOut().catch(() => undefined);

    try {
      const signInRequest = supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        window.setTimeout(() => {
          reject(new Error(t("auth.error.timeout") ?? "La connexion met trop de temps à répondre. Veuillez réessayer."));
        }, 15000);
      });

      const { data, error } = await Promise.race([signInRequest, timeoutPromise]);

      if (error) {
        setError(error.message);
        return;
      }

      const authUser = data.user ?? data.session?.user;
      if (!authUser) {
        setError(t("auth.error.unableToSignIn") ?? "Impossible de se connecter.");
        return;
      }

      setMessage(t("auth.successRedirect") ?? "Redirection…");
      navigate("/admin", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : (t("auth.error.unableToSignIn") ?? "Impossible de se connecter.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title={t("auth.page.title")}
        description={t("auth.page.description")}
        canonical={`${BASE_URL}/auth`}
        robots="noindex,nofollow"
      />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 border border-slate-200">
              <img src={favicon} alt="EmploiPlus" className="h-10 w-10 object-contain" />
            </div>
            <h1 className="font-display text-3xl font-bold text-slate-900">{t("auth.heading")}</h1>
            <p className="mt-4 text-slate-600">{t("auth.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-6">
            <div>
              <label
                className="block text-sm font-semibold text-foreground mb-2"
                htmlFor="auth-email"
              >
                {t("common.email")}
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder={t("auth.placeholder.email")}
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-foreground mb-2"
                htmlFor="auth-password"
              >
                {t("common.password")}
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder={t("auth.placeholder.password")}
              />
            </div>

            {error ? (
              <div className="rounded-2xl bg-destructive/10 border border-destructive px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-2xl bg-success/10 border border-success px-4 py-3 text-sm text-success">
                {message}
              </div>
            ) : null}

            {authDetail ? (
              <div className="rounded-2xl bg-muted/10 border border-slate-200 px-4 py-3 text-sm text-slate-700">
                {authDetail}
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
              disabled={loading}
            >
              {loading ? t("auth.submit.loading") : t("common.signIn")}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
