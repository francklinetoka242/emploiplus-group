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
  CheckIcon as Check,
  ArrowSquareOutIcon as ExternalLink,
  LockKeyIcon as LockKeyhole,
  CircleNotchIcon as Loader2,
  MicrophoneIcon as Mic,
  CaretDownIcon as ChevronDown,
  CaretRightIcon as CollapsePanel,
  ChatTextIcon as MessageSquareText,
  PowerIcon as Power,
  ArrowsCounterClockwiseIcon as RefreshCcw,
  PaperPlaneTiltIcon as Send,
  ShieldCheckIcon as ShieldCheck,
  GearSixIcon as Settings2,
  XIcon as X,
} from "@phosphor-icons/react";
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

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

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

interface MaeliseWidgetProps {
  isEmbedded?: boolean;
  isCollapsed?: boolean;
  onCollapse?: () => void;
}

export function MaeliseWidget({
  isEmbedded = false,
  isCollapsed = false,
  onCollapse,
}: MaeliseWidgetProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, authLoading, rolesResolved } = useAuthContext();
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
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const conversationRef = useRef<HTMLElement>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechBaseDraftRef = useRef("");
  const previousPathRef = useRef(location.pathname);
  const excluded =
    location.pathname === "/auth" ||
    location.pathname.startsWith("/candidate/login") ||
    location.pathname.startsWith("/candidate/signup") ||
    location.pathname.startsWith("/candidate/forgot-password") ||
    location.pathname.startsWith("/candidate/reset-password") ||
    location.pathname.startsWith("/candidate/confirm") ||
    location.pathname.startsWith("/candidate/onboarding");
  const isCandidateAccount =
    isEmbedded || (location.pathname.startsWith("/candidate/") && !excluded);
  const candidateName = String(
    session?.user.user_metadata?.first_name ??
      session?.user.user_metadata?.full_name ??
      session?.user.user_metadata?.name ??
      "",
  )
    .trim()
    .split(/\s+/)[0];
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
    const speechWindow = window as SpeechRecognitionWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const transcript = event.results[index]?.[0]?.transcript ?? "";
        if (event.results[index]?.isFinal) finalTranscript += transcript;
        else interimTranscript += transcript;
      }
      const spokenText = `${finalTranscript}${interimTranscript}`.trim();
      const separator = speechBaseDraftRef.current && spokenText ? " " : "";
      setDraft(`${speechBaseDraftRef.current}${separator}${spokenText}`.slice(0, 550));
    };
    recognition.onerror = (event) => {
      const messages: Record<string, string> = {
        "audio-capture": "Microphone introuvable. Vérifiez qu’il est disponible.",
        "not-allowed": "Micro non autorisé. Vérifiez les permissions de votre navigateur.",
        "service-not-allowed": "La saisie vocale n’est pas autorisée par ce navigateur.",
        "no-speech": "Aucune parole détectée. Réessayez.",
      };
      setSpeechError(messages[event.error] ?? "La saisie vocale a rencontré un problème.");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    speechRecognitionRef.current = recognition;
    setSpeechRecognitionSupported(true);

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
      speechRecognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isLoading && isListening) speechRecognitionRef.current?.stop();
  }, [isLoading, isListening]);

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
    if (!isOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsidePointer = (event: PointerEvent) => {
      if (settingsOpen || showNewConversationDialog) return;
      const target = event.target;
      if (target instanceof Node && !conversationRef.current?.contains(target)) close();
    };
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [close, isOpen, settingsOpen, showNewConversationDialog]);

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

  if (excluded || authLoading || !rolesResolved || !session) return null;

  const toggleSpeechRecognition = () => {
    const recognition = speechRecognitionRef.current;
    if (!recognition || isLoading || quotaBlocked) return;
    setSpeechError(null);
    if (isListening) {
      recognition.stop();
      return;
    }
    speechBaseDraftRef.current = draft.trim();
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      setSpeechError("La saisie vocale n’a pas pu démarrer. Réessayez.");
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isListening) speechRecognitionRef.current?.stop();
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

  const isCandidateJobsPage = location.pathname === "/jobs" && Boolean(session);

  return (
    <div
      className={`pointer-events-none ${
        isCandidateAccount
          ? "fixed inset-x-0 bottom-0 z-50 flex justify-end pb-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:pb-0 min-[900px]:static min-[900px]:z-auto min-[900px]:flex min-[900px]:h-full min-[900px]:w-[320px] min-[900px]:shrink-0 min-[900px]:items-stretch min-[900px]:justify-stretch min-[900px]:py-0 min-[900px]:pr-4 min-[900px]:pb-0"
          : "fixed inset-x-0 bottom-0 z-50 flex justify-end pb-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:pb-0"
      }`}
    >
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
          <SheetHeader className="border-b border-border bg-muted/20 px-5 py-5 pr-14 text-left sm:px-7">
            <SheetTitle className="flex items-center gap-3 text-xl tracking-tight">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Settings2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>Paramètres Maélise</span>
            </SheetTitle>
            <SheetDescription className="max-w-sm leading-6">
              Cette conversation est indépendante et ne conserve pas l’historique des échanges
              précédents.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/10 px-5 py-4 sm:px-7">
            <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                  <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Conversation active</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Une nouvelle conversation réinitialise le contexte courant et recommence avec le
                    message d’accueil par défaut.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Confidentialité</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Autorisez séparément chaque catégorie de données. Les nouvelles permissions
                      sont désactivées par défaut.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                  disabled={!permissions || permissionsLoading}
                  onClick={() => void toggleAllPermissions()}
                  aria-label={
                    permissions && maelisePermissionColumns.every((column) => permissions[column])
                      ? "Tout désactiver"
                      : "Tout activer"
                  }
                  title={
                    permissions && maelisePermissionColumns.every((column) => permissions[column])
                      ? "Tout désactiver"
                      : "Tout activer"
                  }
                >
                  <Power className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-4 space-y-1.5" aria-busy={permissionsLoading}>
                {maelisePermissionColumns.map((column) => (
                  <div
                    key={column}
                    id={`privacy-${column}`}
                    className={[
                      "flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/60 px-3 py-2.5 transition-colors",
                      highlightedPermission === column
                        ? "border-brand bg-brand/10 ring-2 ring-brand/30"
                        : "",
                    ].join(" ")}
                  >
                    <span className="text-sm leading-relaxed text-foreground">
                      {permissionLabels[column]}
                    </span>
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
            </section>

            <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Sécurité</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Les données du candidat restent gérées côté serveur selon le profil connecté,
                    sans mémoire historique persistante.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      {(isOpen || (isCandidateAccount && !isCollapsed)) && (
        <section
          ref={conversationRef}
          aria-label={t("maelise.conversationLabel")}
          className={`pointer-events-auto mx-3 mb-3 flex h-[min(620px,calc(100dvh-1rem))] flex-col overflow-hidden rounded-2xl border border-border sm:mx-0 sm:mb-3 sm:h-[min(620px,calc(100dvh-6rem))] sm:w-[390px] ${
            isCandidateAccount
              ? `maelise-candidate-conversation bg-background min-[900px]:mx-0 min-[900px]:mb-0 min-[900px]:h-full min-[900px]:max-h-full min-[900px]:w-full min-[900px]:rounded-[20px] min-[900px]:shadow-none ${isOpen ? "" : "hidden min-[900px]:flex"}`
              : "bg-card"
          }`}
        >
          <header
            className={`flex shrink-0 items-center justify-between border-b border-border ${
              isCandidateAccount
                ? "bg-background px-3 py-1 text-foreground"
                : "bg-brand px-4 py-2 text-brand-foreground"
            }`}
          >
            {isCandidateAccount ? (
              <Button
                type="button"
                variant="ghost"
                className="h-7 rounded-full bg-muted px-2.5 text-xs font-medium text-foreground hover:bg-muted/80"
                onClick={handleNewConversationRequest}
                aria-label={t("maelise.newConversation")}
              >
                {t("maelise.newConversation")}
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            ) : (
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <img src="/robot-maélise-IA.png" alt="" className="h-6 w-6 object-contain" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-sm font-bold">Maélise</h2>
                  <p className="flex items-center gap-1.5 text-xs text-white/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
                    {t("maelise.subtitle")}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1">
              {isCandidateAccount && onCollapse && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hidden h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground min-[900px]:inline-flex"
                  aria-label="Replier Maélise dans la navigation"
                  title="Replier Maélise"
                  onClick={onCollapse}
                >
                  <CollapsePanel className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`${
                  isCandidateAccount
                    ? "h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                    : "text-white hover:bg-white/15 hover:text-white"
                }`}
                aria-label="Paramètres Maélise"
                title="Paramètres Maélise"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
              </Button>
              {!isCandidateAccount && (
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
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`${
                  isCandidateAccount
                    ? "h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground min-[900px]:hidden"
                    : "text-white hover:bg-white/15 hover:text-white"
                }`}
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
            className={`flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-background [touch-action:pan-y] ${
              isCandidateAccount ? "gap-2 px-3 py-2" : "gap-4 px-4 py-4 sm:px-5"
            }`}
            aria-live="polite"
          >
            {messages.map((message, index) => {
              const isWelcome = isCandidateAccount && messages.length === 1 && index === 0;
              return (
                <div
                  key={message.id}
                  className={
                    isWelcome
                      ? "flex flex-1 flex-col justify-start pt-1"
                      : message.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                  }
                >
                  <div
                    className={
                      isWelcome
                        ? "mx-auto flex max-w-[360px] flex-col items-center px-1 text-center"
                        : message.role === "user"
                          ? `max-w-[86%] rounded-2xl rounded-br-md bg-brand text-white ${
                              isCandidateAccount ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-sm"
                            }`
                          : `max-w-[92%] rounded-2xl rounded-bl-md border border-border bg-card text-foreground shadow-sm ${
                              isCandidateAccount
                                ? "px-3 py-2 text-xs leading-5"
                                : "px-3.5 py-2.5 text-sm leading-6"
                            }`
                    }
                  >
                    {isWelcome && (
                      <>
                        <div className="flex items-center gap-2 text-primary">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <img
                              src="/robot-maélise-IA.png"
                              alt=""
                              className="h-6 w-6 object-contain"
                            />
                          </span>
                          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                            Maélise
                          </span>
                        </div>
                        <span className="mt-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {t("maelise.subtitle")}
                        </span>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {candidateName
                            ? t("maelise.greetingNamed").replace("{name}", candidateName)
                            : t("maelise.greeting")}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold leading-tight text-primary">
                          {t("maelise.introTitle")}
                        </h3>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          {t("maelise.introDescription")}
                        </p>
                      </>
                    )}
                    {!isWelcome && (
                      <p className="whitespace-pre-wrap">
                        {message.response?.quota_exceeded && message.response.available_at
                          ? quotaMessage(message.response.available_at)
                          : message.content}
                      </p>
                    )}
                    {message.response?.sources.length ? (
                      <div
                        className={`space-y-1 border-t border-border/70 ${
                          isCandidateAccount ? "mt-2 pt-1.5" : "mt-3 pt-2"
                        }`}
                      >
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
                              <Check
                                className="h-3 w-3 shrink-0 text-secondary"
                                aria-hidden="true"
                              />
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
                          className={`mr-3 text-xs font-semibold text-brand underline underline-offset-2 ${
                            isCandidateAccount ? "mt-2" : "mt-3"
                          }`}
                          onClick={() => handlePrivacyAction(action.category!)}
                        >
                          {action.label}
                        </button>
                      ) : action.type === "navigate" &&
                        action.path &&
                        isInternalPath(action.path) ? (
                        <button
                          key={`${action.path}-${action.label}-${index}`}
                          type="button"
                          className={`mr-3 text-xs font-semibold text-brand underline underline-offset-2 ${
                            isCandidateAccount ? "mt-2" : "mt-3"
                          }`}
                          onClick={() => handleAction(action.path!)}
                        >
                          {action.label}
                        </button>
                      ) : null,
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div
                className={`flex items-center gap-2 text-xs text-muted-foreground ${
                  isCandidateAccount ? "text-[11px]" : ""
                }`}
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
                className={`rounded-lg border border-destructive/30 bg-destructive/5 px-3 text-xs text-destructive ${
                  isCandidateAccount ? "py-1.5" : "py-2"
                }`}
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
              <div
                className={`flex flex-wrap justify-center ${
                  isCandidateAccount ? "gap-1.5" : "gap-2"
                } ${isCandidateAccount ? "mx-auto max-w-[390px]" : ""}`}
              >
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className={`rounded-full border border-border bg-card text-center text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-muted ${
                      isCandidateAccount ? "max-w-full px-3 py-1.5 text-[11px]" : "px-4 py-2.5"
                    }`}
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
            className={`flex shrink-0 gap-2 border-t border-border ${
              isCandidateAccount ? "p-2" : "p-3"
            } ${isCandidateAccount ? "bg-background min-[900px]:border-t-0" : "bg-card"}`}
            aria-label={t("maelise.sendFormLabel")}
          >
            <div
              className={[
                `maelise-input-shell min-w-0 flex-1 ${
                  isCandidateAccount
                    ? "flex items-center gap-1 rounded-2xl border border-input bg-background p-1"
                    : ""
                }`,
                isLoading ? "maelise-input-shell--loading" : "",
              ].join(" ")}
            >
              <Input
                ref={inputRef}
                value={draft}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setSpeechError(null);
                  setDraft(event.target.value.slice(0, 550));
                }}
                placeholder={t("maelise.placeholder")}
                maxLength={550}
                disabled={isLoading || quotaBlocked}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && isLoading) event.preventDefault();
                }}
                aria-label={t("maelise.messageLabel")}
                className={`min-w-0 ${
                  isCandidateAccount
                    ? "h-9 border-0 bg-transparent text-xs shadow-none focus-visible:ring-0"
                    : "h-10 bg-background"
                }`}
              />
              <Button
                type="button"
                size="icon"
                variant={isCandidateAccount ? "ghost" : "outline"}
                disabled={
                  !speechRecognitionSupported || isLoading || (!isListening && quotaBlocked)
                }
                aria-label={isListening ? "Arrêter la saisie vocale" : "Démarrer la saisie vocale"}
                title={
                  speechRecognitionSupported
                    ? isListening
                      ? "Arrêter la saisie vocale"
                      : "Saisie vocale"
                    : "La saisie vocale n’est pas prise en charge par ce navigateur"
                }
                className={`${
                  isCandidateAccount ? "h-8 w-8 rounded-xl text-muted-foreground" : ""
                } ${isListening ? "maelise-microphone--listening text-primary" : ""}`}
                onClick={toggleSpeechRecognition}
              >
                <Mic aria-hidden="true" />
              </Button>
              <Button
                type="submit"
                size="icon"
                variant={isCandidateAccount ? "ghost" : "default"}
                disabled={!draft.trim() || isLoading || quotaBlocked}
                aria-label={t("maelise.send")}
                className={
                  isCandidateAccount
                    ? "h-8 w-8 rounded-xl bg-muted text-muted-foreground shadow-none hover:bg-muted/80"
                    : ""
                }
              >
                <Send aria-hidden="true" />
              </Button>
            </div>
          </form>
          {speechError && (
            <p
              className={`border-t border-border px-2 text-xs text-muted-foreground ${
                isCandidateAccount ? "bg-background py-1.5 text-[11px]" : "bg-card pt-2"
              }`}
              role="status"
            >
              {speechError}
            </p>
          )}
          <p
            className={`m-0 leading-tight text-muted-foreground ${
              isCandidateAccount
                ? "bg-background px-2 pt-0 pb-0 text-center text-[6.6px]"
                : "bg-card px-3 pt-1 text-xs"
            }`}
          >
            {t("maelise.disclaimer")}
          </p>
        </section>
      )}

      {!isOpen && !isCandidateJobsPage && (
        <Button
          ref={triggerRef}
          type="button"
          size="icon"
          className={`maelise-icon-hover-trigger pointer-events-auto mb-4 mr-4 h-14 w-14 shrink-0 rounded-full bg-brand shadow-brand hover:bg-brand-deep sm:mb-0 sm:mr-0 ${
            isCandidateAccount ? "min-[900px]:hidden" : ""
          }`}
          aria-label={t("maelise.open")}
          onClick={open}
        >
          <img
            src="/robot-maélise-IA.png"
            alt=""
            className="maelise-icon-hover h-8 w-8 object-contain"
          />
        </Button>
      )}
    </div>
  );
}
