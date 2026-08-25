import { useEffect, useState, type ReactNode } from "react";
import { useAuthContext } from "@/features/authentication/hooks/useAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";
import { resetMaeliseConversation, sendMaeliseMessage } from "./api";
import { MaeliseContext, type MaeliseContextValue } from "./context";
import type { MaeliseMessage } from "./types";
const ANONYMOUS_SESSION_KEY = "maelise-anonymous-session";

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function initialAssistantMessage(): MaeliseMessage {
  return {
    id: "welcome",
    role: "assistant",
    content:
      "Bonjour, je suis Maélise, l'assistante virtuelle d'EmploiPlus Group. Je peux vous aider pour les offres d'emploi, les candidatures, votre CV ou vos questions sur EmploiPlus.",
    createdAt: new Date(),
  };
}

export function MaeliseProvider({ children }: { children: ReactNode }) {
  const { session } = useAuthContext();
  const { t } = useI18n();
  const welcomeMessage = t("maelise.welcome");
  const [messages, setMessages] = useState<MaeliseMessage[]>([
    { ...initialAssistantMessage(), content: welcomeMessage },
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<string | null>(null);
  const [anonymousSessionId] = useState(() => {
    if (typeof window === "undefined") return createId();
    const existing = window.localStorage.getItem(ANONYMOUS_SESSION_KEY);
    if (existing) return existing;
    const created = createId();
    window.localStorage.setItem(ANONYMOUS_SESSION_KEY, created);
    return created;
  });

  useEffect(() => {
    setConversationId(null);
    setMessages([{ ...initialAssistantMessage(), content: welcomeMessage }]);
    setError(null);
    setLastRequest(null);
  }, [session?.user.id, welcomeMessage]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_OUT") return;
      setConversationId(null);
      setMessages([{ ...initialAssistantMessage(), content: welcomeMessage }]);
      setError(null);
      setLastRequest(null);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [welcomeMessage]);

  const send = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;
    setError(null);
    setLastRequest(trimmed);
    setMessages((current) => [
      ...current,
      { id: createId(), role: "user", content: trimmed, createdAt: new Date() },
    ]);
    setIsLoading(true);
    try {
      const result = await sendMaeliseMessage(trimmed, conversationId, anonymousSessionId);
      setConversationId(result.conversation_id);
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content: result.assistant.answer,
          createdAt: new Date(),
          response: result.assistant,
        },
      ]);
    } catch (sendError) {
      const status =
        sendError instanceof Error ? (sendError as Error & { status?: number }).status : undefined;
      if (status === 401 || status === 410) {
        setConversationId(createId());
      }
      setError(sendError instanceof Error ? sendError.message : "Maélise est indisponible.");
    } finally {
      setIsLoading(false);
    }
  };

  const retry = async () => {
    if (lastRequest) await send(lastRequest);
  };

  const resetConversation = async () => {
    try {
      if (conversationId && session) await resetMaeliseConversation(conversationId);
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Impossible de réinitialiser la conversation.",
      );
      return;
    }
    setConversationId(null);
    setMessages([{ ...initialAssistantMessage(), content: welcomeMessage }]);
    setError(null);
    setLastRequest(null);
    setIsLoading(false);
  };

  const value: MaeliseContextValue = {
    messages,
    isOpen,
    isLoading,
    error,
    canRetry: Boolean(lastRequest) && !isLoading,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    clear: resetConversation,
    send,
    retry,
  };

  return <MaeliseContext.Provider value={value}>{children}</MaeliseContext.Provider>;
}
