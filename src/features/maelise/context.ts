import { createContext } from "react";
import type { MaeliseMessage } from "./types";

export interface MaeliseContextValue {
  messages: MaeliseMessage[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  canRetry: boolean;
  open: () => void;
  close: () => void;
  clear: () => Promise<void>;
  send: (content: string) => Promise<void>;
  retry: () => Promise<void>;
}

export const MaeliseContext = createContext<MaeliseContextValue | null>(null);
