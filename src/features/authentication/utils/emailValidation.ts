import type { User } from "@supabase/supabase-js";

export async function assertEmailConfirmed(
  user: User | null | undefined,
  signOut: () => Promise<unknown>,
  cleanup?: () => void,
) {
  if (user && user.email_confirmed_at) {
    return;
  }

  await signOut();
  cleanup?.();

  const error = new Error("EMAIL_NOT_CONFIRMED") as Error & {
    code?: string;
    userEmail?: string | null;
  };
  error.code = "EMAIL_NOT_CONFIRMED";
  error.userEmail = user?.email ?? null;
  throw error;
}
