import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Bot,
  Check,
  ExternalLink,
  Loader2,
  MessageCircle,
  RefreshCcw,
  Send,
  Settings2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/features/authentication/hooks/useAuthContext";
import { useI18n } from "@/i18n";
import {
  getMaelisePermissions,
  maelisePermissionColumns,
  updateMaelisePermissions,
  type MaelisePermissionColumn,
  type MaelisePermissions,
} from "./api";
import { useMaelise } from "./useMaelise";

function isInternalPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/admin");
}

function quotaMessage(availableAt: string) {
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(availableAt))
    .replace(":", "h");
  return `Vous avez atteint votre quota de 20 questions pour aujourd'hui. Vous pourrez à nouveau échanger avec Maélise à partir de ${time}.`;
}

const permissionLabels: Record<MaelisePermissionColumn, string> = {
  identity_contact: "Identité et coordonnées",
  cv: "CV",
  career_profile: "Parcours professionnel, formations, compétences et langues",
  preferences: "Préférences de recherche",
  applications: "Candidatures et statuts",
  saved_offers_searches: "Offres enregistrées et recherches sauvegardées",
  alerts: "Alertes et notifications",
};

export function MaeliseWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, roles } = useAuthContext();
  const { t } = useI18n();
  const { messages, isOpen, isLoading, error, canRetry, open, close, clear, send, retry } =
    useMaelise();
  const [draft, setDraft] = useState("");
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [permissions, setPermissions] = useState<MaelisePermissions | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [highlightedPermission, setHighlightedPermission] = useState<string | null>(null);
  const [quotaAvailableAt, setQuotaAvailableAt] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previousPathRef = useRef(location.pathname);
  const excluded =
    location.pathname === "/auth" ||
    location.pathname.startsWith("/candidate/login") ||
    location.pathname.startsWith("/candidate/signup") ||
    location.pathname.startsWith("/candidate/forgot-password") ||
    location.pathname.startsWith("/candidate/reset-password") ||
    location.pathname.startsWith("/candidate/confirm") ||
    location.pathname.startsWith("/candidate/onboarding");
  const suggestions = [
    t("maelise.suggestion.jobs"),
    t("maelise.suggestion.cv"),
    t("maelise.suggestion.application"),
    t("maelise.suggestion.services"),
  ];

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        window.setTimeout(() => triggerRef.current?.focus(), 0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close, isOpen]);

  useEffect(() => {
    if (previousPathRef.current !== location.pathname && isOpen) {
      previousPathRef.current = location.pathname;
    }
  }, [isOpen, location.pathname]);

  useEffect(() => {
    if (!session) {
      setPermissions(null);
      setPermissionsLoading(false);
      setPermissionsError(null);
      return;
    }
    let cancelled = false;
    setPermissionsLoading(true);
    setPermissionsError(null);
    void getMaelisePermissions()
      .then((value) => {
        if (!cancelled) setPermissions(value);
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setPermissionsError(
            error instanceof Error ? error.message : "Impossible de charger les permissions.",
          );
      })
      .finally(() => {
        if (!cancelled) setPermissionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!quotaAvailableAt || Date.now() < new Date(quotaAvailableAt).getTime()) return;
    setQuotaAvailableAt(null);
  }, [isOpen, quotaAvailableAt]);

  useEffect(() => {
    const quotaMessage = [...messages]
      .reverse()
      .find((message) => message.response?.quota_exceeded === true);
    setQuotaAvailableAt(quotaMessage?.response?.available_at ?? null);
  }, [messages]);

  /** Applies one category change and restores the previous value if the API rejects it. */
  const togglePermission = async (column: MaelisePermissionColumn) => {
    if (!permissions || permissionsLoading) return;
    const enabled = !permissions[column];
    const previous = permissions;
    setPermissions({ ...permissions, [column]: enabled });
    setPermissionsLoading(true);
    setPermissionsError(null);
    try {
      setPermissions(await updateMaelisePermissions({ [column]: enabled }));
    } catch (error: unknown) {
      setPermissions(previous);
      setPermissionsError(
        error instanceof Error ? error.message : "Impossible de mettre à jour la permission.",
      );
    } finally {
      setPermissionsLoading(false);
    }
  };

  /** Updates all consent categories in one request and trusts the server response as source of truth. */
  const toggleAllPermissions = async () => {
    if (!permissions || permissionsLoading) return;
    const enabled = !maelisePermissionColumns.every((column) => permissions[column]);
    setPermissionsLoading(true);
    setPermissionsError(null);
    try {
      const updates = Object.fromEntries(
        maelisePermissionColumns.map((column) => [column, enabled]),
      ) as Record<MaelisePermissionColumn, boolean>;
      setPermissions(await updateMaelisePermissions(updates));
    } catch (error: unknown) {
      setPermissionsError(
        error instanceof Error ? error.message : "Impossible de mettre à jour les permissions.",
      );
    } finally {
      setPermissionsLoading(false);
    }
  };

  const isAdmin = roles.includes("admin") || roles.includes("super_admin");

  if (excluded || !session || !isAdmin) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = draft.trim();
    if (
      !value ||
      isLoading ||
      (quotaAvailableAt && Date.now() < new Date(quotaAvailableAt).getTime())
    )
      return;
    setDraft("");
    await send(value);
  };

  const remainingCharacters = 550 - draft.length;
  const quotaBlocked = Boolean(
    quotaAvailableAt && Date.now() < new Date(quotaAvailableAt).getTime(),
  );

  const hasActiveConversation = messages.length > 1;

  const handleNewConversationRequest = () => {
    if (!hasActiveConversation) {
      setDraft("");
      clear();
      return;
    }
    setShowNewConversationDialog(true);
  };

  const handleConfirmNewConversation = async () => {
    await clear();
    setShowNewConversationDialog(false);
    setDraft("");
  };

  const handleAction = (path: string) => {
    if (!isInternalPath(path)) return;
    navigate(path);
  };

  const handlePrivacyAction = (category: string) => {
    setSettingsOpen(true);
    window.setTimeout(() => {
      const section = document.getElementById(`privacy-${category}`);
      section?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedPermission(category);
      window.setTimeout(() => setHighlightedPermission(null), 1800);
    }, 0);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end pb-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:pb-0">
      <AlertDialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
        <AlertDialogContent className="max-w-md rounded-xl border border-border bg-card p-0 shadow-xl">
          <AlertDialogHeader className="space-y-2 px-6 pt-6">
            <AlertDialogTitle className="text-base font-semibold text-foreground">
              Commencer une nouvelle conversation ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-6 text-muted-foreground">
              La conversation actuelle sera réinitialisée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 px-6 pb-6 sm:justify-end">
            <AlertDialogCancel className="mt-0">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNewConversation}>
              Nouvelle conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border px-5 py-5 pr-14 text-left sm:px-7">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Settings2 className="h-5 w-5 text-primary" />
              Paramètres Maélise
            </SheetTitle>
            <SheetDescription className="leading-6">
              Cette conversation est indépendante et ne conserve pas l’historique des échanges
              précédents.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground">Conversation active</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Une nouvelle conversation réinitialise le contexte courant et recommence avec le
                message d’accueil par défaut.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground">Confidentialité</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Autorisez séparément chaque catégorie de données. Les nouvelles permissions sont
                désactivées par défaut.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full"
                disabled={!permissions || permissionsLoading}
                onClick={() => void toggleAllPermissions()}
              >
                {permissions && maelisePermissionColumns.every((column) => permissions[column])
                  ? "Tout désactiver"
                  : "Tout activer"}
              </Button>
              <div className="mt-4 space-y-2" aria-busy={permissionsLoading}>
                {maelisePermissionColumns.map((column) => (
                  <div
                    key={column}
                    id={`privacy-${column}`}
                    className={[
                      "flex items-center justify-between gap-3 rounded-md border border-border/70 bg-background/40 px-3 py-2 transition-colors",
                      highlightedPermission === column
                        ? "border-brand bg-brand/10 ring-2 ring-brand/30"
                        : "",
                    ].join(" ")}
                  >
                    <span className="text-sm text-foreground">{permissionLabels[column]}</span>
                    <button
                      type="button"
                      aria-label={`${permissions?.[column] ? "Désactiver" : "Activer"} ${permissionLabels[column]}`}
                      aria-pressed={permissions?.[column] === true}
                      disabled={!permissions || permissionsLoading}
                      onClick={() => void togglePermission(column)}
                      className={[
                        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors",
                        permissions?.[column] ? "border-brand bg-brand" : "border-border bg-muted",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                          permissions?.[column] ? "translate-x-6" : "translate-x-1",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                ))}
              </div>
              {permissionsLoading && (
                <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Mise à jour des permissions…
                </p>
              )}
              {permissionsError && (
                <p className="mt-3 text-xs text-destructive" role="alert">
                  {permissionsError}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground">Sécurité</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Les données du candidat restent gérées côté serveur selon le profil connecté, sans
                mémoire historique persistante.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {isOpen && (
        <section
          aria-label={t("maelise.conversationLabel")}
          className="pointer-events-auto mx-3 mb-3 flex h-[min(620px,calc(100dvh-1rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:mx-0 sm:mb-3 sm:h-[min(620px,calc(100dvh-6rem))] sm:w-[390px]"
        >
          <header className="flex shrink-0 items-center justify-between bg-brand px-4 py-3 text-brand-foreground">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-display text-sm font-bold">Maélise</h2>
                <p className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
                  {t("maelise.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/15 hover:text-white"
                aria-label="Paramètres Maélise"
                title="Paramètres Maélise"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/15 hover:text-white"
                aria-label="Nouvelle conversation"
                title="Nouvelle conversation"
                onClick={handleNewConversationRequest}
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/15 hover:text-white"
                aria-label={t("maelise.close")}
                onClick={() => {
                  close();
                  window.setTimeout(() => triggerRef.current?.focus(), 0);
                }}
              >
                <X aria-hidden="true" />
              </Button>
            </div>
          </header>

          <div
            className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-background px-3 py-4 sm:px-4"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[86%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-sm text-white"
                      : "max-w-[92%] rounded-2xl rounded-bl-md border border-border bg-card px-3.5 py-2.5 text-sm leading-6 text-foreground shadow-sm"
                  }
                >
                  <p className="whitespace-pre-wrap">
                    {message.response?.quota_exceeded && message.response.available_at
                      ? quotaMessage(message.response.available_at)
                      : message.content}
                  </p>
                  {message.response?.sources.length ? (
                    <div className="mt-3 space-y-1 border-t border-border/70 pt-2">
                      {message.response.sources.map((source, index) =>
                        source.url && isInternalPath(source.url) ? (
                          <button
                            key={`${source.title}-${index}`}
                            type="button"
                            className="flex w-full items-center gap-1.5 text-left text-xs font-medium text-brand hover:underline"
                            onClick={() => handleAction(source.url!)}
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                            {source.title}
                          </button>
                        ) : (
                          <p
                            key={`${source.title}-${index}`}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground"
                          >
                            <Check className="h-3 w-3 shrink-0 text-secondary" aria-hidden="true" />
                            {source.title}
                          </p>
                        ),
                      )}
                    </div>
                  ) : null}
                  {message.response?.actions.map((action, index) =>
                    action.type === "open_privacy_section" && action.category ? (
                      <button
                        key={`${action.category}-${action.label}-${index}`}
                        type="button"
                        className="mt-3 mr-3 text-xs font-semibold text-brand underline underline-offset-2"
                        onClick={() => handlePrivacyAction(action.category!)}
                      >
                        {action.label}
                      </button>
                    ) : action.type === "navigate" && action.path && isInternalPath(action.path) ? (
                      <button
                        key={`${action.path}-${action.label}-${index}`}
                        type="button"
                        className="mt-3 mr-3 text-xs font-semibold text-brand underline underline-offset-2"
                        onClick={() => handleAction(action.path!)}
                      >
                        {action.label}
                      </button>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div
                className="flex items-center gap-2 text-xs text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <span className="maelise-loading-dots text-brand" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                {t("maelise.thinking")}
              </div>
            )}
            {error && (
              <div
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
                role="alert"
              >
                {error}
                {canRetry && (
                  <button
                    type="button"
                    className="ml-2 font-semibold underline"
                    onClick={() => void retry()}
                  >
                    Réessayer
                  </button>
                )}
              </div>
            )}
            {!isLoading && messages.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="rounded-full border border-brand/20 bg-card px-3 py-2 text-left text-xs font-medium text-brand transition-colors hover:border-brand hover:bg-brand/5"
                    onClick={() => void send(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={submit}
            className="flex shrink-0 gap-2 border-t border-border bg-card p-3"
            aria-label={t("maelise.sendFormLabel")}
          >
            <div
              className={[
                "maelise-input-shell min-w-0 flex-1",
                isLoading ? "maelise-input-shell--loading" : "",
              ].join(" ")}
            >
              <Input
                ref={inputRef}
                value={draft}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setDraft(event.target.value.slice(0, 550))
                }
                placeholder={t("maelise.placeholder")}
                maxLength={550}
                disabled={isLoading || quotaBlocked}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && isLoading) event.preventDefault();
                }}
                aria-label={t("maelise.messageLabel")}
                className="h-10 min-w-0 bg-background"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!draft.trim() || isLoading || quotaBlocked}
              aria-label={t("maelise.send")}
            >
              <Send aria-hidden="true" />
            </Button>
          </form>
          <p className="border-t border-border bg-card px-3 pb-2 text-right text-xs text-muted-foreground">
            {remainingCharacters === 550
              ? "550 caractères"
              : `${remainingCharacters} caractères restants`}
          </p>
        </section>
      )}

      {!isOpen && (
        <Button
          ref={triggerRef}
          type="button"
          size="icon"
          className="pointer-events-auto mb-4 mr-4 h-14 w-14 shrink-0 rounded-full bg-brand shadow-brand hover:bg-brand-deep sm:mb-0 sm:mr-0"
          aria-label={t("maelise.open")}
          onClick={open}
        >
          <Bot className="h-6 w-6" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
