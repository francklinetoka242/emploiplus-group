import { createClient } from "@supabase/supabase-js";
import { getBillingConfig } from "./config.js";

export function getBillingSupabase() {
  const config = getBillingConfig();
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function authenticateCandidate(authorizationHeader: string | string[] | undefined) {
  const header = Array.isArray(authorizationHeader) ? authorizationHeader[0] : authorizationHeader;
  const match = header?.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  if (!token) return null;

  const supabase = getBillingSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { user: data.user, supabase };
}

export async function billingRpc<T>(
  supabase: ReturnType<typeof getBillingSupabase>,
  functionName: string,
  args: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.rpc(functionName, args);
  if (error) {
    console.error("[billing] database operation failed", {
      functionName,
      code: error.code ?? "unknown",
    });
    throw new BillingDatabaseError(functionName, error.code);
  }
  return data as T;
}

export class BillingDatabaseError extends Error {
  constructor(
    readonly operation: string,
    readonly code?: string,
  ) {
    super("Billing storage operation failed");
    this.name = "BillingDatabaseError";
  }
}
