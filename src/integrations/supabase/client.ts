import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d environment Supabase manquantes.');
}

declare global {
  var __supabaseInstance: SupabaseClient | undefined;
}

export const supabase: SupabaseClient =
  globalThis.__supabaseInstance ||
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: window.localStorage,
      storageKey: 'emploiplus-auth-token',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      // Use implicit flow to avoid PKCE/lock collisions on token refresh
      flowType: 'implicit',
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__supabaseInstance = supabase;
}
