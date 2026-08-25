CREATE TABLE IF NOT EXISTS public.maelise_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_session_hash TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  summary TEXT,
  active_intent TEXT,
  active_domain TEXT,
  active_location TEXT,
  active_filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  prompt_version TEXT NOT NULL DEFAULT 'v1',
  model TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT maelise_conversation_owner_check CHECK ((user_id IS NOT NULL) OR (anonymous_session_hash IS NOT NULL))
);

ALTER TABLE public.maelise_conversations
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.maelise_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.maelise_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, sequence)
);

CREATE INDEX IF NOT EXISTS idx_maelise_conversations_user ON public.maelise_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_maelise_messages_conversation ON public.maelise_messages(conversation_id, sequence);

ALTER TABLE public.maelise_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maelise_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Maelise users manage own conversations" ON public.maelise_conversations
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Maelise users read own messages" ON public.maelise_messages
  FOR SELECT TO authenticated USING (conversation_id IN (
    SELECT id FROM public.maelise_conversations WHERE user_id = auth.uid()
  ));