// Compatibility shim for legacy imports.
// It reuses the standard Supabase client so admin actions work with the RLS rules configured in Supabase.
import { supabase } from './client';

export const supabaseAdmin = supabase;
