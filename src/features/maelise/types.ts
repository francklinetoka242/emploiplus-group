export interface MaeliseSource {
  type: string;
  title: string;
  url?: string;
}

export interface MaeliseAction {
  type: "navigate" | "open_privacy_section";
  label: string;
  path?: string;
  category?: string;
}

export interface MaeliseAssistantResponse {
  answer: string;
  sources: MaeliseSource[];
  actions: MaeliseAction[];
  requires_confirmation: boolean;
  quota_exceeded?: boolean;
  available_at?: string;
}

export interface MaeliseMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  response?: MaeliseAssistantResponse;
}

export interface MaeliseApiResponse {
  conversation_id: string | null;
  assistant: MaeliseAssistantResponse;
}
