import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import favicon from "@/assets/favicon.ico";

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    const authUser = data.user ?? data.session?.user;

    if (authUser) {
      const { data: sessionData } = await supabase.auth.getSession();
      const resolvedSessionUser = sessionData.session?.user ?? authUser;
      const userId = resolvedSessionUser.id;

      console.info("[AuthPage] resolvedUserId:", userId);

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      console.info("[AuthPage] user_roles query:", { rolesData, rolesError });

      const claimRoles = Array.isArray(resolvedSessionUser.app_metadata?.roles)
        ? resolvedSessionUser.app_metadata.roles.filter((value): value is string => typeof value === "string")
        : [];

      const effectiveRoles = (rolesData ?? []).map((row: { role?: string | null }) => row.role).filter(Boolean) as string[];
      const mergedRoles = Array.from(new Set([...effectiveRoles, ...claimRoles]));

      if (rolesError) {
        setError(t("auth.error.rolesLoadFailed") ?? "Impossible de vérifier les droits.");
        setAuthDetail(`Session user id: ${userId}`);
        return;
      }

      if (!mergedRoles.length) {
        setError(t("auth.error.notAdmin") ?? "Votre compte n'a pas les droits administrateur.");
        setAuthDetail(`Session user id: ${userId} — rôles détectés: aucune`);
        return;
      }

      setAuthDetail(`Session user id: ${userId} — rôles détectés: ${mergedRoles.join(", ")}`);

      setMessage(t("auth.successRedirect"));
      navigate("/admin", { replace: true });
      return;
    }

    setError(t("auth.error.unableToSignIn") ?? "Impossible de se connecter.");
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
            >
              {loading ? t("auth.submit.loading") : t("common.signIn")}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
