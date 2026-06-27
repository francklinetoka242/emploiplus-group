import React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { usePageSEO, BASE_URL } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    if (data.user) {
      setMessage(t("auth.successRedirect"));
      navigate("/admin");
    }
  };

  return (
    <>
      {usePageSEO({
        title: t("auth.page.title"),
        description: t("auth.page.description"),
        canonical: `${BASE_URL}/auth`,
        robots: "noindex,nofollow",
      })}
      <div className="container-page py-20 md:py-28">
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-10 shadow-soft">
          <h1 className="font-display text-3xl font-bold text-foreground text-center">{t("auth.heading")}</h1>
          <p className="mt-4 text-muted-foreground text-center">
            {t("auth.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="auth-email">
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
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="auth-password">
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

            <Button type="submit" size="lg" className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
              {loading ? t("auth.submit.loading") : t("common.signIn")}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
