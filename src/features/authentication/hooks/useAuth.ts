import { useAuthContext } from "@/features/authentication/hooks/useAuthContext";

export function useAuth() {
  const context = useAuthContext();

  return {
    ...context,
    loading: context.authLoading,
    isLoading: context.authLoading,
  };
}
